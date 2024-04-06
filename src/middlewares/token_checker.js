import jwt from "jsonwebtoken";
import fs from "fs";

const tokenChecker = (req, res, next) => {
  console.log("token");
  const originalUrl = req.originalUrl.split("/");
  const endPoint = originalUrl[1];
  const nonTokenEndpointStr = process.env.NON_TOKEN_ENDPOINT;
  const nonTokenEndpoint = nonTokenEndpointStr.split("|");
  const token = req.headers.authorization;
  const secretKey = process.env.SECRET_KEY;
  const userAgent = req.headers["user-agent"];
  console.log(req.originalUrl);

  if (!nonTokenEndpoint.includes(endPoint)) {
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

              if (browserId === userAgent) {
                next();
              } else {
                res.status(401).json({
                  message:
                    "Access is restricted - You are indicated to have moved the token to another browser.",
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
  } else {
    next();
  }
};

export default tokenChecker;
