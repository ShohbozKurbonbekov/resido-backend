import Agenda, { Job, JobAttributesData } from "agenda";
import chalk from "chalk";
import { agendaConfig } from "../libs/config";
import mongoose from "mongoose";

// DB CONNECTION
export const connectDB = async () => {
  try {
    await mongoose.connect(agendaConfig.mongoUri, {});

    console.log(
      chalk.green("✅ Connected to DB successfully for job schedules")
    );
  } catch (error) {
    console.log(chalk.bgRed("Error in connection to database"));
  }
};

// DB DISCONNECTION FROM DB AND TERMINATE AGENDA
export const beautifulShutdown = async () => {
  console.log(chalk.bgWhite.red("✌ beatufully shutdown"));

  try {
    await agenda.stop();
    console.log(chalk.red("gracefully shutdown from agenda"));

    await mongoose.connection.close();
    console.log(chalk.red("disconnected from DB successfully"));
  } catch (error) {
    console.log("Error in shutdown: ", error);
  } finally {
    process.exit(0);
  }
};

// AGENDA SETUP
const agenda = new Agenda({
  db: {
    address: agendaConfig.mongoUri,
    collection: "agendaJobs",
  },
  maxConcurrency: 1, // job numbers should be done
  processEvery: "1 minute", //  checks db any job there to run
});

export default agenda;
