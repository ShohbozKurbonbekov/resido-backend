import { Job } from "agenda";
import BlogService from "../models/Blog.service";
import PropertyService from "../models/Property.service";
import AgentService from "../models/Agent.service";
import AgencyService from "../models/Agency.service";

export const defineUpdateBlogFieldsJob = (agenda: any) => {
  agenda.define("update blog fields", async (job: Job) => {
    console.log("🧠 Running job: update blog fields", new Date().toISOString());

    try {
      await BlogService.updateBlogFields();

      console.log("✅ Job completed: update blog fields");
    } catch (error) {
      console.error("❌ Job failed:", error);
    }
  });
};

export const defineUpdateProperyFields = (agenda: any) => {
  agenda.define("update property fields", async (job: Job) => {
    try {
      await PropertyService.updatePropertyFields();
      console.log("✅ Job completed: update propety fields");
    } catch (error) {
      console.error("❌ Job failed:", error);
    }
  });
};

export const defineUpdateAgentFields = (agenda: any) => {
  agenda.define("update agent fields", async (job: Job) => {
    try {
      await AgentService.updateAgentFields();
      console.log("✅ Job completed: update agent fields");
    } catch (error) {
      console.error("❌ Job failed:", error);
    }
  });
};

export const defineUpdateAgencyFields = (agenda: any) => {
  agenda.define("update agency fields", async (job: Job) => {
    try {
      await AgencyService.updateAgencyFields();
      console.log("✅ Job completed: update agency fields");
    } catch (error) {
      console.error("❌ Job failed:", error);
    }
  });
};
