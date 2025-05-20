import mongoose from "mongoose";

const { Schema } = mongoose;

// Property Schema (properties collection)
const propertySchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Property title is required"],
      trim: true,
      min: 3,
      max: 100,
    }, // Title of the property. e.g. 'Luxury Apartment in City Center'
    description: {
      type: String,
      required: [true, "Property description is required"],
      trim: true,
      min: 10,
      max: 1000,
    }, // Description of the property. e.g. 'This is a luxury apartment located in the city center with all modern amenities.'
    price: {
      type: Number,
      required: [true, "Property price is required"],
      min: 0,
    }, // Price of the property. e.g. 500000
    priceCurrency: {
      type: String,
      required: [true, "Price currency is required"],
      enum: ["USD", "EUR", "GBP", "NGN"],
      default: "USD",
    }, // Currency of the price. e.g. 'NGN'
    location: {
      type: String,
      required: [true, "Property location is required"],
      trim: true,
      min: 3,
      max: 100,
    }, // Location of the property. e.g. '123 Main Street, Maitama, Abuja'
    status: {
      type: String,
      required: [true, "Property status is required"],
      enum: ["Available", "Unavailable"],
      default: "Unavailable",
    }, // Status of the property. e.g. 'available'
    dateAvailable: {
      type: Date,
      required: [true, "Date available is required"],
      default: Date.now,
    }, // Date when the property is available for sale. e.g. '2023-10-01'
    propertyType: {
      type: String,
      required: [true, "Type of property is required"],
      enum: [
        "apartment",
        "villa",
        "house",
        "land",
        "commercial",
        "other",
        "office space",
        "townhouse",
        "studio apartment",
      ],
      default: "other",
    }, // Type of the property. e.g. 'apartment'
    bedrooms: {
      type: Number,
      required: false,
      min: 0,
    }, // Number of the bedrooms in the property. e.g. 3
    bathrooms: {
      type: Number,
      required: false,
      min: 0,
    }, // NUmber of the bathrooms in the property. e.g. 2
    area: {
      type: Number,
      required: [true, "Area of the property is required"],
      min: 1,
    }, // Area of the property in square meters. e.g. 120
    areaUnit: {
      type: String,
      required: [true, "Area unit is required"],
      enum: ["sqft", "sqm"],
      default: "sqm",
    }, // Unit of the area. e.g. 'sqm'
    amenities: {
      type: [String],
      default: [],
    }, // List of amenities available in the property. e.g. ['swimming pool', 'gym', 'parking']
    images: {
      type: [String],
      default: [],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length <= 5;
        },
        message: (props) => `${props.path} exceeds the limit of 5 images`,
      },
    }, // List of image URLs for the property. e.g. ['https://images.pexels.com/photos/3209049/pexels-photo-3209049.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', 'https://images.pexels.com/photos/3555615/pexels-photo-3555615.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1']
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company"
    }, // ID of the comapny that owns the property. e.g. '1234567890abbcdef123456'
    createdAt: {
      type: Date,
      default: Date.now,
    }, // Date when the property is updated
    isBNPLEligible: {
      type: Boolean,
      default: false,
    }, // Boolean indicating if the property is eligible for BNPL. e.g. true
    eligibilityReason: { type: String }, // e.g., "High-demand property"
  },

  {
    Timestamp: true,
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  } //Automatically create and update fields
);

const Property = mongoose.model("Property", propertySchema); // create model from schema
export default Property; // export property model
