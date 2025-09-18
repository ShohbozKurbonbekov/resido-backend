import express from "express";
import path from "path";
import router from "./router";
import residoAdminController from "./controllers/resido-admin.controller";
import adminRouter from "./admin-router";

// PATHs
const publicPath = path.join(__dirname, "public");
const viewPath = path.join(__dirname, "views");

// ENTRANCE

const app = express();
app.use(express.static(publicPath));
app.use(express.urlencoded({ extended: true })); // traditional API
app.use(express.json); // REST API

// SESSIONS

// VIEWS
app.set("views", viewPath);
app.set("view engine", "ejs");

// ROUTERS
app.use("/", router);
app.use("/admin", adminRouter);

export default app;
