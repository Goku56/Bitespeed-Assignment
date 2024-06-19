import { Request, Response } from "express";
import Contact from "../Models/Contact";
import { Op } from "sequelize";

const identifyLogic = async (req: Request, res: Response) => {
  const { email, phoneNumber } = req.body;

  try {
    let existingContacts: Contact[];

    if (email && phoneNumber) {
      existingContacts = await Contact.findAll({
        where: {
          [Op.or]: [{ email }, { phoneNumber }],
        },
      });
    } else if (email) {
      existingContacts = await Contact.findAll({ where: { email } });
    } else if (phoneNumber) {
      existingContacts = await Contact.findAll({ where: { phoneNumber } });
    } else {
      return res
        .status(400)
        .json({ error: "Either email or phoneNumber must be provided" });
    }

    if (existingContacts.length > 0) {
      let primaryContact = existingContacts.find(
        (contact) => contact.linkPrecedence === "primary"
      );
      if (!primaryContact) {
        primaryContact = existingContacts[0];
        primaryContact.linkPrecedence = "primary";
        await primaryContact.save();
      }
      const secondaryContacts = existingContacts.filter(
        (contact) => contact.id !== primaryContact.id
      );

      const emails = Array.from(
        new Set(
          existingContacts
            .map((contact) => contact.email)
            .filter((email) => email !== null)
        )
      );
      const phoneNumbers = Array.from(
        new Set(
          existingContacts
            .map((contact) => contact.phoneNumber)
            .filter((phone) => phone !== null)
        )
      );

      if (
        !existingContacts.some(
          (contact) =>
            contact.email === email && contact.phoneNumber === phoneNumber
        )
      ) {
        // Create new secondary contact if email/phone not found in existing contacts
        const newSecondary = await Contact.create({
          email,
          phoneNumber,
          linkedId: primaryContact.id,
          linkPrecedence: "secondary",
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        secondaryContacts.push(newSecondary);
      }

      // Respond with the consolidated contact information
      res.status(200).json({
        contact: {
          primaryContatctId: primaryContact.id,
          emails: emails.length > 0 ? emails : [],
          phoneNumbers: phoneNumbers.length > 0 ? phoneNumbers : [],
          secondaryContactIds: secondaryContacts.map((contact) => contact.id),
        },
      });
    } else {
      // If no existing contacts found, create a new primary contact
      const newContact = await Contact.create({
        email,
        phoneNumber,
        linkPrecedence: "primary",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Respond with the newly created contact information
      res.status(200).json({
        contact: {
          primaryContatctId: newContact.id,
          emails: newContact.email ? [newContact.email] : [],
          phoneNumbers: newContact.phoneNumber ? [newContact.phoneNumber] : [],
          secondaryContactIds: [],
        },
      });
    }
  } catch (error) {
    console.error("Error in /identify endpoint:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export default identifyLogic;
