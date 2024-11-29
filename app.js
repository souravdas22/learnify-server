const express = require("express");
const dotenv = require("dotenv");
const http = require("http");
const path = require("path");
const bodyParser = require("body-parser");
const fs = require("fs");
const cookieParser = require("cookie-parser");
const cors = require('cors')

dotenv.config();
const app = express();
app.use(cors())


app.set("view engine", "ejs");
app.set("views", [
  path.join(__dirname, "./views/partials"),
  path.join(__dirname, "./views/layouts"),
  path.join(__dirname, "./views"),
]);

app.use(express.static("./public"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(cookieParser());

app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json());

const loadRoutes = (directory) => {
  fs.readdirSync(directory).forEach((file) => {
    if (file.endsWith(".js")) {
      const routePath = path.join(directory, file);
      const route = require(routePath);
      if (typeof route === "function") {
        route(app);
        // console.log(`Loaded routes from: ${file}`);
      } else {
        console.error(`Error: ${file} does not export a function.`);
      }
    }
  });
};

const apiRoutesDir = path.join(__dirname, "router/api");
const adminwebRoutesDir = path.join(__dirname, "router/admin");
const instructorwebRoutesDir = path.join(__dirname, "router/instructor");

// Load routes from both directories
[apiRoutesDir, adminwebRoutesDir, instructorwebRoutesDir].forEach(loadRoutes);




const PORT = process.env.PORT || 7001;

const server = http.createServer(app);

(async () => {
  try {
    await require(path.resolve(
      path.join(__dirname, "app", "config", "database")
    ))();
    server.listen(PORT);
    console.log(`Project is running on http://${process.env.HOST}:${PORT}`);
  } catch (error) {
    console.log(error);
  }
})();
