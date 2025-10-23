import { agendaConfig } from "../libs/config";
import agenda, { beautifulShutdown } from "./agenda-config";
import { connectDB } from "./agenda-config";
import {
  defineUpdateAgentFields,
  defineUpdateBlogFieldsJob,
  defineUpdateProperyFields,
} from "./agenda-start-jobs";

(async () => {
  await connectDB();

  defineUpdateBlogFieldsJob(agenda);
  defineUpdateProperyFields(agenda);
  defineUpdateAgentFields(agenda);

  await agenda.start();

  await agenda.every(
    agendaConfig.cron,
    "update blog fields",
    {},
    { skipImmediate: true }
  );

  await agenda.every(
    agendaConfig.cron,
    "update property fields",
    {},
    { skipImmediate: true }
  );

  await agenda.every(
    agendaConfig.cron,
    "update agent fields",
    {},
    { skipImmediate: true }
  );

  process.on("SIGINT", beautifulShutdown);
  process.on("SIGTERM", beautifulShutdown);
})();
