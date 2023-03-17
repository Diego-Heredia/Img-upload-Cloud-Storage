const express = require("express");
const app = express();
const port = 8080;
const path = require("path");
const { Storage } = require("@google-cloud/storage");
const Multer = require("multer");
const src = path.join(__dirname, "views");
app.use(express.static(src));

// app.use(function (req, res, next) {
//   console.log("request", req.url, req.body, req.method);
//   res.header("Access-Control-Allow-Origin", "*");

//   if (req.method === "OPTIONS") {
//     res.end();
//   } else {
//     next();
//   }
// });

const multer = Multer({
  storage: Multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // No larger than 5mb, change as you need
  },
});

let projectId = "uda-produccion"; // Get this from Google Cloud
let keyFilename = "./mykey.json"; // Get this from Google Cloud -> Credentials -> Service Accounts
const storage = new Storage({
  projectId,
  keyFilename,
});
var options = {
  destination: "/sarym/user/profile-picture/",
};
const bucket = storage.bucket("udamx-storage02"); // Get this from Google Cloud -> Storage

// Gets all files in the defined bucket
app.get("/upload", async (req, res) => {
  try {
    const [files] = await bucket.getFiles();
    res.send([files]);
    console.log("Success");
  } catch (error) {
    res.send("Error:" + error);
  }
});
// Streams file upload to Google Storage
app.post("/upload", multer.single("imgfile"), async (req, res) => {
  console.log("Made it /upload");
  try {
    if (req.file) {
      console.log("File found, trying to upload...");
      const blob = bucket.file(
        `sarym/user/profile-picture/${req.file.originalname}`
      );
      // Obtener la URL firmada con expiración en 2 minutos
      const signedUrl = await file.getSignedUrl({
        action: "read",
        expires: Date.now() + 120 * 1000, // expiración en 2 minutos
      });

      console.log(`La URL firmada para la imagen es: ${signedUrl}`);
      const blobStream = blob.createWriteStream();

      blobStream.on("finish", () => {
        res.status(200).send("Success");
        console.log("Success");
      });
      blobStream.end(req.file.buffer);
    } else throw "error with img";
  } catch (error) {
    res.status(500).send(error);
  }
});
// Get the main index html file
app.get("/", (req, res) => {
  res.sendFile(src + "/index.html");
});
// Start the server on port 8080 or as defined
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
