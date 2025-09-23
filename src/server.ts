import mongoose from "mongoose";
import app from "./app";

mongoose
  .connect(process.env.MONGO_URL as string, {})
  .then((data) => {
    console.log("connected to the database successfully 👏");

    const PORT = process.env.PORT ?? 3005;

    app.listen(PORT, () => {
      console.log(`server is sucessfully running on port localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.log("Error🆘 in connection to Database: ", error);
  });
