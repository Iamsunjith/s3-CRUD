require("dotenv").config();

const express = require("express");

const app = express();
const aws = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");

app.listen(3000);

aws.config.update({
  secretAccessKey: process.env.SECRET_KEY,
  accessKeyId: process.env.ACCESS_KEY,
  region: process.env.REGION,
});

const BUCKET_NAME = process.env.BUCKET_NAME;
const s3 = new aws.S3();

// Upload
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: BUCKET_NAME,
    metadata: function (req, file, cb) {
      //   req.rawHeaders["Content-Type"] = "images/jpeg";
      //   console.log("😎😎", req.rawHeaders);
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      // this will create unique name for the file uplods
      //   cb(null, Date.now().toString());
      cb(null, file.originalname);
    },
  }),
});

app.post("/upload", upload.single("file"), async function (req, res, next) {
  res.send("Successfully uploaded " + req.file.location + " location!");
});

console.log("😎", upload);

// Get
app.get("/list", async (req, res) => {
  try {
    let r = await s3.listObjectsV2({ Bucket: BUCKET_NAME }).promise();
    let x = r.Contents.map((item) => item.Key);
    res.send(x);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// Delete

app.delete("/delete/:filename", async (req, res) => {
  const filename = req.params.filename;
  try {
    await s3.deleteObject({ Bucket: BUCKET_NAME, Key: filename }).promise();
    res.send("File Deleted Successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});
