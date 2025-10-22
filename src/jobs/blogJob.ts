import chalk from "chalk";
import agenda from "../agenda/agenda-config";
import BlogService from "../models/Blog.service";

agenda.define("update some blog Fields", async () => {
  console.log(chalk.red("Started to update blog fields..."));

  await BlogService.updateBlogFields();

  console.log(chalk.red("Blog fields updated (merged)!"));
});
