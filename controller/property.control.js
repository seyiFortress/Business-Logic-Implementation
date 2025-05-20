import nodemailer from "nodemailer";
import Mailgen from "mailgen";
import "dotenv/config";
import Property from "../models/property.model.js";
import User from "../models/user.model.js";
import bnplPurchaseAgreement from "../models/bnplTransaction.model.js";
import Company from "../models/RE_company.model.js";

/////////////////// Start Routes ////////////////////////////////////////////////////

// purchase BNPL property
const purchaseBNPLProperty = async (req, res) => {
  try {
    // Extract propertyID and userID from request parameters
    const { userId } = req.body; // Extract userID from request body
    const { propertyId } = req.params; // Extract propertyID from request parameters
    const { companyId } = req.params; // Extract companyID from request parameters
    // Validate input
    if (!userId) {
      return res.status(400).json({ message: "user ID required! " });
    }

    // Verify user and property eligibility
    const user = await User.findById(userId); // Find user by ID
    const property = await Property.findById(propertyId); // Find property by ID
    if (
      !user.status === "Approved" &&
      !property.companyId === companyId &&
      !property.status === "Available"
    ) {
      return res
        .status(403)
        .json({ message: "User and property not eligible for BNPL" });
    } else {
      // Calculate payment structure
      const upfrontPayment = property.price * 0.1; // Calculate upfront payment (10% of property price)
      const totalAmount = property.price * 1.05; // Calculate total amount (property price + 5% interest)
      const remainingAmount = totalAmount - upfrontPayment; // Calculate remaining amount
      const monthlyInstallments = remainingAmount / 12; // Calculate monthly payment (12 months)

      // Validate if user can afford upfront payment
      if (user.wallet < upfrontPayment) {
        return res.status(400).json({
          message: "Insufficient funds for upfront payment!",
          message,
        });
      } else {
        // Deduct upfront payment from user's wallet
        user.wallet = user.wallet - upfrontPayment;
        await user.save(); // Save updated user wallet balance
        // Create transaction record
        const dueDates = Array.from({ length: 12 }, (_, i) => {
          const date = new Date();
          date.setMonth(date.getMonth() + i + 1);
          return date;
        });

        // Create BNPL agreement
        const bnplTransaction = await bnplPurchaseAgreement.create({
          userId: user._id,
          propertyId: property._id,
          totalAmount, // Set total amount
          upfrontPayment, // Set upfront payment
          remainingAmount, // Set remaining amount
          monthlyInstallments, // Set monthly payment
          // status, // Set status
          dueDates, // Set due date to 30 days from now
          paidMonths: Array(12).fill(false), // Set all months as unpaid
        });

        // Notify user of successful purchase via email
        let config = {
          service: "gmail",
          auth: {
            user: process.env.EMAIL,
            pass: process.env.MAIL_PASSWORD,
          },
        }; // Nodemailer configuration
        const transporter = nodemailer.createTransport(config);
        const mailGenerator = new Mailgen({
          theme: "default",
          product: {
            name: "Mailgen",
            link: "https://mailgen.js",
          },
        });
        const response = {
          body: {
            name: "BNPL Payment Reminders",
            intro: "BNPL Purchase Successful!",
            table: {
              data: [
                {
                  "BNPL started": `${user.email} has successfully purchased the property`,
                  ID: `${propertyId}`,
                  Paid: `${upfrontPayment} upfront`,
                  "BNPL agreement ID": `${bnplTransaction._id}`,
                },
              ],
            },
            outro: "We are looking forward to doing more business",
          },
        };
        const mail = mailGenerator.generate(response);

        const message = {
          from: process.env.EMAIL,
          to: user.email,
          subject: "Property Purchase Confirmation",
          html: mail,
        };

        transporter
          .sendMail(message)
          .then(() => {
            return res
              .status(201)
              .json({ msg: "you should receive an email!" });
          })
          .catch((error) => res.status(500).json({ error }));
      }
    }
    res
      .status(201)
      .json({ message: "BNPL purchased successfully!", bnplTransaction }); // Send success response
  } catch (error) {
    res
      .status(500)
      .json({ message: "BNPL purchase failed", error: error.message });
  }
};

// register property
const registerProperty = async (req, res) => {
  const {
    title,
    description,
    price,
    priceCurrency,
    location,
    bathrooms,
    area,
    bedrooms,
    areaUnit,
    amenities,
    images,
  } = req.body; // Descructure request body
  try {
    const comp$id = req.params.companyId;
    const company = await Company.findById(comp$id);
    if (company.status !== "Approved") {
      return res
        .status(401)
        .json({ message: "company not approved to sell property!" });
    }
    const property = await Property.create({
      title,
      description,
      price,
      priceCurrency,
      location,
      bathrooms,
      area,
      bedrooms,
      areaUnit,
      companyId: comp$id,
      amenities,
      images,
    });

    res.status(201).json({
      message: "Property registerd successfully!",
      details: property,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Property registration failed!", error: error.message });
  }
};

// Fetch all BNPL eligible properties
const bnplEligibleProperties = async (_, res) => {
  const bnplProperties = await Property.find({ isBNPLEligible: true });

  try {
    if (bnplProperties.length === 0) {
      res.status(404).json({ message: "BNPL eligible properties not found!" });
    } else {
      res.status(200).json({
        message: "BNPL eligible properties found!",
        details: bnplProperties,
      });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "BNPL fetch properties failed!", error: error.message });
  }
};

// Fetch all available properties
const availableProperties = async (req, res) => {
  const id = req.params.companyId; // Extract comapny ID from request parameters
  try {
    const properties = await Property.find({
      status: "Available",
      companyId: id,
    });
    if (properties.length === 0) {
      return res
        .status(404)
        .json({ message: "Available properties not found!" });
    } else {
      res
        .status(200)
        .json({ message: "Available properties found!", details: properties });
    }
  } catch (error) {
    res.status(500).json({
      message: "Error reading bnpl available properties!",
      error: error.message,
    });
  }
};

// Fetch property by ID
const getProperty = async (req, res) => {
  const id = req.params.propertyId; // Extract property ID from request pararmeters

  try {
    const property = await Property.findById(id); // Find property by ID

    if (!property) {
      res.status(404).json({ message: "Property not found!" });
    } else {
      res.status(200).json({ message: "Property found!", details: property });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error reading property!", error: error.message });
  }
};

////////////////////////////////////// End Control /////////////////////////

export {
  registerProperty,
  bnplEligibleProperties,
  availableProperties,
  getProperty,
  purchaseBNPLProperty,
};
