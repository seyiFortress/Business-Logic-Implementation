import nodemailer from "nodemailer";
import Mailgen from "mailgen";
import "dotenv/config";
import Property from "../models/property.model.js";
import User from "../models/user.model.js";
import bnplPurchaseAgreement from "../models/bnplTransaction.model.js";
import Company from "../models/RE_company.model.js";

/////////////////// Start Routes ////////////////////////////////////////////////////

// purchase BNPL property
const purchaseProperty = async (req, res) => {
  try {
    // Extract propertyID from request parameters
    const { userId } = req.body; // Extract userID from request body
    const propertyId = req.params.id;

    // Verify user and property eligibility
    const user = await User.findById(userId); // Find user by ID
    const property = await Property.findById(propertyId); // Find property by ID
    if (
      !user.isVerified &&
      !property.isBNPLEligible &&
      !property.status === "available"
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
        return res.status(400).json( {message: "Insufficient funds for upfront payment!", message} );
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
          status: "active", // Set status to active
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
    res.status(500).json({ message: "BNPL purchase failed", message });
  }
};

// register property
const registerProperty = async (req, res) => {
  try {
    const comp$id = req.body.companyId;
    if (!comp$id) {
      res.status(400).json({ message: "Company ID not found, include ID!" });
    } else {
      const company = await Company.findById({ comp$id });
      if (!company) {
        res.status(404).json({ message: "company does not exist!" });
      } else {
        if (company.status === "Pending") {
          res.status(404).json({ message: "company not approved to sell!" });
        } else {
          const property = await Property.create(req.body);
          res
            .status(201)
            .json({
              message: "Property registerd successfully!",
              details: property,
            });
        }
      }
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Property registration failed!", error: error.message });
  }
};

// Fetch all BNPL eligible properties
const bnplEligibleProperties = async (req, res) => {
  try {
    const bnplProperties = await Property.find({ isBNPLEligible: true });
    if (!bnplProperties) {
      res.status(404).json({ message: "BNPL eligible properties not found!" });
    } else {
      res
        .status(200)
        .json({
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
  try {
    const properties = await Property.find({ status: "available" });
    if (!properties) {
      res.status(404).json({ message: "Available properties not found!" });
    } else {
      res
        .status(200)
        .json({ message: "Available properties found!", details: properties });
    }
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error fetching available properties!",
        error: error.message,
      });
  }
};

// Fetch property by ID
const getProperty = async (req, res) => {
  try {
    const propertyId = req.params.id;
    const property = await Property.findById({ propertyId });
    if (!property) {
      res.status(404).json({ message: "Property not found!" });
    } else {
      res.status(200).json({ message: "Property found!", property });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Fetch property failed!", error: error.message });
  }
};

////////////////////////////////////// End Control /////////////////////////

export {
  registerProperty,
  bnplEligibleProperties,
  availableProperties,
  getProperty,
  purchaseProperty,
};
