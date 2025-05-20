import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import userRoute from "./routes/user.route.js";
import propertyRoute from "./routes/property.route.js";
import transactionRoute from "./routes/bnplTransactions.route.js";
import RE_companyRoute from "./routes/RE_company.route.js";
import missedPaymentsJob from "./controller/cronJobs/missedPayments.js";
import bodyParser from "body-parser";



const app = express();
const port = process.env.port || 8080;



app.use(express.json()); // Middleware to parse JSON request bodies);
app.use("/api", userRoute); // Mount user routes
app.use("/api", propertyRoute); // Mount property routes
app.use("/api", transactionRoute); // Mount transaction routes
app.use("/api", RE_companyRoute); // Mount real estate company routes
app.use(bodyParser.urlencoded({ extended: true })); // Middleware to parse URL-encoded request bodies
app.get("/", (_, res) => {
  res.status(200).send("Hello from the root directory!");
});
// console.log(propertyRoute) // check if the registerRoute is imported correctly
// console.log(process.env) // check if the environment variables are loaded correctly
// console.log("DATABASE_URL", process.env.DATABASE_URL) // check if the database URL is loaded correctly



// Connect to MongoDB using Mongoose
mongoose
  .connect(process.env.DATABASE_URL)
  .then(() => {
    // Create the server and listen on the specified port
    app.listen(port, () => {
      console.log("Server is running on port:", port);
      missedPaymentsJob.start(); // Manually trigger the cron job (Dev/local environ.)
      process.on('SIGTERM', () => {
        missedPaymentsJob.stop();
        console.log("Cron job stopped gracefully");
        process.exit(0);
      });
    });

    console.log("database Connected!");
  })
  .catch((err) =>
    console.error("Error connecting to the database:", err.message)
  );
