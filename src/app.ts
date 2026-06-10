import express from "express";
import path from "path";
import cors from "cors";
import morgan from "morgan";
import { MORGAN_FORMAT } from "./libs/config";
import cookieParser from "cookie-parser";
import member from "./routers/member.router";
import property from "./routers/property.router";
import comment from "./routers/comment.router";
import agent from "./routers/agent.router";
import agency from "./routers/agency.router";
import blog from "./routers/blog.router";
import adminRouter from "./routers/admin-router";
import properties from "./routers/properties.router";

// PATHs
const publicPath = path.join(__dirname, "public");

// ENTRANCE

const app = express();
app.use(express.static(publicPath));
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
app.use(express.json()); // REST API
app.use(
  cors({
    credentials: true,
    origin: true,
  }),
); // makes urls and cookies's access possible.
app.use(cookieParser());
app.use(morgan(MORGAN_FORMAT));

// ROUTERS
app.use("/admin", adminRouter);
app.use("/member", member);
app.use("/property", property);
app.use("/properties", properties);
app.use("/comment", comment);
app.use("/agent", agent);
app.use("/agency", agency);
app.use("/blog", blog);
export default app;
