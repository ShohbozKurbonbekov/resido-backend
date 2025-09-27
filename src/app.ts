import express from "express";
import path from "path";
import router from "./router";
import adminRouter from "./admin-router";
import cors from "cors";
import morgan from "morgan";
import { MORGAN_FORMAT } from "./libs/config";
import cookieParser from "cookie-parser";

// PATHs
const publicPath = path.join(__dirname, "public");
const viewPath = path.join(__dirname, "views");

// ENTRANCE

const app = express();
app.use(express.static(publicPath));
app.use("./uploads", express.static("/uploads"));
app.use(express.urlencoded({ extended: true })); // traditional API
app.use(express.json()); // REST API
app.use(
  cors({
    credentials: true,
    origin: true,
  })
); // makes urls and cookies's access possible.
app.use(cookieParser());
app.use(morgan(MORGAN_FORMAT));

// SESSIONS

// VIEWS
app.set("views", viewPath);
app.set("view engine", "ejs");

// ROUTERS
app.use("/admin", adminRouter);
app.use("/", router);

export default app;
