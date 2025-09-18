import dotenv from "dotenv";
import mongoose from "mongoose";
dotenv.config();

mongoose
  .connect(process.env.MONGO_URL as string, {})
  .then((data) => {
    console.log("connected to the database successfully 👏");
  })
  .catch((error) => {
    console.log("Error🆘: ", error);
  });
