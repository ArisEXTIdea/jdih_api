import jwt from "jsonwebtoken";
import fs from "fs";

const authChecker = (req, res, next, level_allowed) => {
  const token = req.headers.authorization;
  const secretKey = process.env.SECRET_KEY;
  const userAgent = req.headers["user-agent"];

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      res.status(404).json({
        message: "Your token is invalid",
      });
    } else {
      const credentials = decoded;

      fs.readFile(
        `./sessions/${credentials["login_id"]}.json`,
        "utf8",
        (err, data) => {
          if (err) {
            res.status(500).json({
              message: "Your session is not found",
            });
            return;
          }
          try {
            const jsonData = JSON.parse(data);
            const browserId = jsonData.browser_id;

            if (
              browserId === userAgent &&
              level_allowed.includes(parseInt(jsonData.level_id))
            ) {
              next();
            } else {
              res.status(401).json({
                message:
                  "Access is restricted - your token is not valid token / your account is not granted to access this API",
              });
            }
          } catch (error) {
            res.status(500).json({
              message: "Failed to parse JSON",
            });
          }
        }
      );
    }
  });
};

export default authChecker;
