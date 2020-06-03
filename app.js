const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const multer = require("multer");
const ejs = require("ejs");
const port = 5000;

// Multer storage
const storage = multer.diskStorage({
  destination: "./public/uploads/",
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

// Init upload
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1000000,
  },
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
}).single("image");

// init app
const app = express();

// Init engine EJS
app.set("view engine", "ejs");

// Public folder
app.use(express.static(path.join(__dirname, "public")));

// Body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Middleware Router
app.get("/", (req, res) => {
  res.render("index");
});

app.post("/upload", (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      res.render("index", {
        msg: err,
      });
    } else {
      if (req.file == undefined) {
        res.render("index", {
          msg: "MulterError: No file selected",
        });
      } else {
        res.render("index", {
          msg: "File Uploaded",
          file: `uploads/${req.file.filename}`,
        });
      }
    }
  });
});

// Functions
function checkFileType(file, cb) {
  // file allowed regex
  const fileTypes = /jpeg|jpg|png|gif/;
  // check ext
  const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());
  // check mime
  const mimeType = fileTypes.test(file.mimetype);

  if (mimeType && extName) {
    return cb(null, true);
  } else {
    cb("MulterError: Image Only!");
  }
}

app.listen(port, () => console.log(`Server started on port ${port}`));
