import { Job } from "agenda";
import BlogService from "../models/Blog.service";

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
