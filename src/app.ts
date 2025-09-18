import express from "express";
import path from "path";

// PATHs
const publicPath = path.join(__dirname, "public");

// ENTRANCE

const app = express();
app.use(express.static(publicPath));
app.use(express.urlencoded({ extended: true })); // traditional API
app.use(express.json); // REST API

// SESSIONS

// VIEWS

// ROUTERS

export default app;
