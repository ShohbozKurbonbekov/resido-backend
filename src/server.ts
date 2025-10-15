import mongoose from "mongoose";
import app from "./app";
import chalk from "chalk";

mongoose
  .connect(process.env.MONGO_URL as string, {})
  .then((data) => {
    console.log(chalk.bgBlue("connected to the database successfully 👏"));

    const PORT = process.env.PORT ?? 3005;

    app.listen(PORT, () => {
      console.log(`server is sucessfully running on port localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.log(chalk.red("Error🆘 in connection to Database: "), error);
  });
