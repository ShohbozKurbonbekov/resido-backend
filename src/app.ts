import express from "express";
import path from "path";
import router from "./router";
import adminRouter from "./admin-router";
import cors from "cors";
import morgan from "morgan";
import { MORGAN_FORMAT } from "./libs/config";
import cookieParser from "cookie-parser";
import session from "express-session";
import ConnectMongoDBSession from "connect-mongodb-session";
import { T } from "./libs/types/common";
import member from "./routers/member.router";
import property from "./routers/property.router";
import comment from "./routers/comment.router";
import agent from "./routers/agent.router";
// SESSION STORE
const MongoDbStore = ConnectMongoDBSession(session);
const store = new MongoDbStore({
  uri: String(process.env.MONGO_URL),
  collection: "session",
});

// PATHs
const publicPath = path.join(__dirname, "public");
const viewPath = path.join(__dirname, "views");

// ENTRANCE

const app = express();
app.use(express.static(publicPath));
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
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
app.use(
  session({
    secret: String(process.env.SECRET_SESSION),
    cookie: {
      maxAge: 1000 * 60 * 60,
    },
    store: store,
    resave: true,
    saveUninitialized: true,
  })
);

app.use(function (req, res, next) {
  const sessionInstance = req.session as T;
  res.locals.member = sessionInstance;
  next();
});

// VIEWS
app.set("views", viewPath);
app.set("view engine", "ejs");

// ROUTERS
app.use("/admin", adminRouter);
app.use("/", router);
app.use("/member", member);
app.use("/property", property);
app.use("/comment", comment);
app.use("/agent", agent);
export default app;
