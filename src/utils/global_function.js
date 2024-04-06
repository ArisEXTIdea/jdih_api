import { image_size } from "./global_variable.js";
import sharp from "sharp";
import fs from "fs";

const haveErrors = (Obj) => {
  const ObjeckKeys = Object.keys(Obj);

  if (ObjeckKeys.length === 0) {
    return false;
  } else {
    return true;
  }
};

const filterConverter = (str) => {
  const filter = str
    .split("&")
    .join("' and ")
    .split("|")
    .join("' or ")
    .split("=")
    .join("='")
    .split("$")
    .join(" like '%")
    .split("!")
    .join("!='");

  return `${filter.replace(/%\w+/g, "$&%")}'`;
};

const filterConverter2 = (str) => {
  const filter = str
    .split("&")
    .join("' and ")
    .split("|")
    .join("' or ")
    .split("=")
    .join("='")
    .split("$")
    .join("")
    .split("!")
    .join("!='");

  return `${filter.replace(/%\w+/g, "$&%")}'`;
};

const capitalizeEachWord = (str) => {
  let words = str.toLowerCase().split(" ");

  words = words.map((word) => {
    return word.charAt(0).toUpperCase() + word.slice(1);
  });

  return words.join(" ");
};

const throwMyErr = (errName, statusCode, errData) => {
  const errors = new Error("asasas");
  errors.statusCode = 404;
  errors.errData = { a: "a" };
  throw errors;
};

const handleResizeFile = (filename, folderState) => {
  if (folderState === 0) {
    fs.copyFileSync(
      `./uploads/images/${filename}`,
      `./uploads/images_temp/${filename}`
    );
  }

  sharp(`./uploads/images_temp/${filename}`)
    .metadata()
    .then((res) => {
      var width = res.width - res.width * 0.05;

      sharp(`./uploads/images_temp/${filename}`)
        .resize(Math.round(width))
        .toFile(`./uploads/images_temp/banner-${filename}`, (err, info) => {
          try {
            fs.unlinkSync(`./uploads/images_temp/${filename}`);
            if (!err) {
              if (info.size > image_size) {
                fs.renameSync(
                  `./uploads/images_temp/banner-${filename}`,
                  `./uploads/images_temp/${filename}`
                );
                handleResizeFile(filename, 1);
              } else {
                fs.rename(
                  `./uploads/images_temp/banner-${filename}`,
                  `./uploads/images_temp/${filename}`,
                  (err) => {
                    fs.unlink(`./uploads/images/${filename}`, (err) => {
                      fs.copyFile(
                        `./uploads/images_temp/${filename}`,
                        `./uploads/images/${filename}`,
                        (err) => {
                          fs.unlinkSync(`./uploads/images_temp/${filename}`);
                          console.log("Success to compress image");
                        }
                      );
                    });
                  }
                );
              }
            } else {
              console.log("there is error when reduce file size");
            }
          } catch (err) {
            console.log(err);
            console.log("failed to compress file 2");
            handleResizeFile(filename, 1);
          }
        });
    });
};

const escapeSpecialCharacters = (str) => {
  return str.replace(/[\\'"\n\r\t\x00-\x1F]/g, (match) => {
    switch (match) {
      case "\\":
        return "\\\\";
      case "'":
        return "\\'";
      case '"':
        return '\\"';
      case "\n":
        return "\\n";
      case "\r":
        return "\\r";
      case "\t":
        return "\\t";
      default:
        return "\\u" + ("0000" + match.charCodeAt(0).toString(16)).slice(-4);
    }
  });
};

export {
  haveErrors,
  filterConverter,
  filterConverter2,
  capitalizeEachWord,
  throwMyErr,
  handleResizeFile,
  escapeSpecialCharacters,
};
