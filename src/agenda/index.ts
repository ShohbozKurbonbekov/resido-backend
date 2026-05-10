import dotenv from "dotenv";
const ENV = process.env.NODE_ENV;
dotenv.config({
  path: `.env.${ENV}`,
});

import { agendaConfig } from "../libs/config";
import agenda, { beautifulShutdown } from "./agenda-config";
import { connectDB } from "./agenda-config";

import {
  defineUpdateAdminsOverviewStats,
  defineUpdateAgencyFields,
  defineUpdateAgentFields,
  defineUpdateBlogFieldsJob,
  defineUpdateProperyFields,
  defineUpdateSubscriptionStatus,
} from "./agenda-start-jobs";

(async () => {
  // DB connection
  await connectDB();

  defineUpdateBlogFieldsJob(agenda);
  defineUpdateProperyFields(agenda);
  defineUpdateAgentFields(agenda);
  defineUpdateAgencyFields(agenda);
  defineUpdateSubscriptionStatus(agenda);
  defineUpdateAdminsOverviewStats(agenda);

  await agenda.start();

  //  UPDATE BLOG FIELDS
  await agenda.every(
    agendaConfig.cron,
    "update blog fields",
    {},
    { skipImmediate: true },
  );

  // UPDATE PROPERTY FIELDS
  await agenda.every(
    agendaConfig.cron,
    "update property fields",
    {},
    { skipImmediate: true },
  );

  // UPDATE AGENT FIELDS
  await agenda.every(
    agendaConfig.cron,
    "update agent fields",
    {},
    { skipImmediate: true },
  );

  // UPDATE AGENCY FIELDS
  await agenda.every(
    agendaConfig.cron,
    "update agency fields",
    {},
    { skipImmediate: true },
  );

  // UPDATE ADMINS OVERVIEW FIELD
  await agenda.every(
    agendaConfig.cron,
    "update subscription status",
    {},
    { skipImmediate: true },
  );

  // UPDATE ADMINS OVERVIEW FIELD
  await agenda.every(
    "10 minutes",
    "update admins overview",
    {},
    { skipImmediate: true },
  );

  process.on("SIGINT", beautifulShutdown);
  process.on("SIGTERM", beautifulShutdown);
})();
