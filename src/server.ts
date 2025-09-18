import dotenv from "dotenv";
import mongoose from "mongoose";
import app from "./app";
dotenv.config();

mongoose
  .connect(process.env.MONGO_URL as string, {})
  .then((data) => {
    console.log("connected to the database successfully 👏");

    const PORT = process.env.PORT;

    app.listen(PORT ?? 1997, () => {
      console.log(
        `server is sucessfully running on port localhost:${PORT ?? 1997} `
      );
    });
  })
  .catch((error) => {
    console.log("Error🆘: ", error);
  });
