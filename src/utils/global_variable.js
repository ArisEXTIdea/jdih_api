const image_size = 1048576 * 1;

const fileExtensions = {
  Images: ["jpg", "jpeg", "png", "svg"],
  Documents: [
    "doc",
    "docx",
    "pdf",
    "txt",
    "rtf",
    "odt",
    "ppt",
    "pptx",
    "xls",
    "xlsx",
  ],
  Audio: ["mp3", "wav", "wma", "aac", "flac", "ogg"],
  Video: ["mp4", "avi", "mov", "wmv", "mkv", "flv"],
  Compressed: ["zip", "rar", "7z", "tar.gz"],
  Executables: ["exe", "dll", "bat", "sh"],
  Programming: ["c", "cpp", "java", "py", "html", "css", "js", "php", "rb"],
  Database: ["sql", "db", "mdb"],
  Fonts: ["ttf", "otf"],
  Spreadsheets: ["csv", "xls", "xlsx"],
  Presentations: ["ppt", "pptx"],
  Miscellaneous: ["dat", "cfg", "log", "bak"],
};

export { image_size, fileExtensions };
