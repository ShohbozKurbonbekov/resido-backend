import mongoose from "mongoose";
import dotenv from "dotenv";
const ENV = process.env.NODE_ENV;

dotenv.config({
  path: `.env.${ENV}`,
});

import app from "./app";
import chalk from "chalk";

console.log("Db:", ENV );
mongoose
  .connect(String(process.env.MONGO_URL), {})
  .then((data) => {
    console.log("DB NAME:", mongoose.connection.name);

    console.log(chalk.bgBlue("connected to the database successfully 👏"));

    // CREATING PORT AND TELLING EXPRESS TO LISTEN THAT PORT
    const PORT = process.env.PORT ?? 3005;
    app.listen(PORT, () => {
      console.log(`server is sucessfully running on port localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.log(chalk.red("Error🆘 in connection to Database: "), error);
  });
