import { agendaConfig } from "../libs/config";
import agenda, { beautifulShutdown } from "./agenda-config";
import { connectDB } from "./agenda-config";
import { defineUpdateBlogFieldsJob } from "./agenda-start-jobs";

(async () => {
  await connectDB();

  defineUpdateBlogFieldsJob(agenda);
  await agenda.start();
  await agenda.every(
    "10 seconds",
    "update blog fields",
    {},
    { skipImmediate: true }
  );

  process.on("SIGINT", beautifulShutdown);
  process.on("SIGTERM", beautifulShutdown);
})();
