import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRouter from "./src/routers/auth_r.js";
import fs from "fs";
import path from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";
import menuRouter from "./src/routers/menu_r.js";
import levelRouter from "./src/routers/level_r.js";
import userRouter from "./src/routers/users_r.js";
import appSettingRouter from "./src/routers/app_setting_r.js";
import notificationRouter from "./src/routers/notification_r.js";
import announcementRouter from "./src/routers/announcement_r.js";
import analyticRouter from "./src/routers/analytic_r.js";
import helmet from "helmet";
import produkHukumRouter from "./src/routers/produk_hukum_r.js";

dotenv.config();

const app = express();
const __dirname = dirname(fileURLToPath(import.meta.url));
// ====================== MIDDLEWARE ====================== //

const corsOptions = {
  origin: ["http://localhost:3000"]
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(
  helmet({
    crossOriginResourcePolicy: false
  })
);
// Deleting Expired Session

setInterval(() => {
  console.log("Deleting Expired Sessions");
  const folderPath = "./sessions";
  const d = new Date();

  fs.readdir(folderPath, (err, files) => {
    if (err) {
      console.error("Error reading folder:", err);
      return;
    }

    files.forEach((file) => {
      if (file !== ".gitkeep")
        fs.readFile(`${folderPath}/${file}`, "utf8", (err, data) => {
          if (err) {
            console.error("Error reading file:", err);
            return;
          }
          // Parse the JSON data
          try {
            const jsonData = JSON.parse(data);
            if (jsonData.expired_at < d.getTime()) {
              fs.unlink(`${folderPath}/${file}`, (err) => {
                if (err) {
                  console.error("Error deleting file:", err);
                  return;
                }

                console.log("File deleted successfully");
              });
            }
          } catch (error) {
            console.error("Error parsing JSON:", error);
          }
        });
    });
  });
}, 3000);

// ====================== ENDPOINTS ====================== //

app.use("/authentication", authRouter);
app.use("/menu", menuRouter);
app.use("/level", levelRouter);
app.use("/user", userRouter);
app.use("/app-settings", appSettingRouter);
app.use("/notification", notificationRouter);
app.use("/announcement", announcementRouter);
app.use("/analytic", analyticRouter);
app.use("/produk-hukum", produkHukumRouter);

app.use("/storage", express.static(path.join(__dirname, "uploads/images")));

// ====================== ERRORS HANDLING ====================== //

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const data = err.errData;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    message: message,
    errorCode: statusCode,
    data: data
  });
});

// ====================== LISTEN TO SERVER ====================== //

const port = process.env.PORT;

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
