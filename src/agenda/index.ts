import { agendaConfig } from "../libs/config";
import agenda, { beautifulShutdown } from "./agenda-config";
import { connectDB } from "./agenda-config";
import {
  defineUpdateAgencyFields,
  defineUpdateAgentFields,
  defineUpdateBlogFieldsJob,
  defineUpdateProperyFields,
} from "./agenda-start-jobs";

(async () => {
  await connectDB();

  defineUpdateBlogFieldsJob(agenda);
  defineUpdateProperyFields(agenda);
  defineUpdateAgentFields(agenda);
  defineUpdateAgencyFields(agenda);

  await agenda.start();

  //  UPDATE BLOG FIELDS
  await agenda.every(
    agendaConfig.cron,
    "update blog fields",
    {},
    { skipImmediate: true }
  );

  // UPDATE PROPERTY FIELDS
  await agenda.every(
    agendaConfig.cron,
    "update property fields",
    {},
    { skipImmediate: true }
  );

  // UPDATE AGENT FIELDS
  await agenda.every(
    agendaConfig.cron,
    "update agent fields",
    {},
    { skipImmediate: true }
  );

  // UPDATE AGENCY FIELDS
  await agenda.every(
    agendaConfig.cron,
    "update agency fields",
    {},
    { skipImmediate: true }
  );

  process.on("SIGINT", beautifulShutdown);
  process.on("SIGTERM", beautifulShutdown);
})();
