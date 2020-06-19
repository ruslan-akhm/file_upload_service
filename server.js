const express = require("express");
const path = require('path');
const mongoose = require('mongoose');
var mongoURI = "mongodb+srv://username:password@cluster0-y5h11.mongodb.net/test?retryWrites=true&w=majority"
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });
var conn = mongoose.connection;
const crypto = require('crypto')
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
//const methodOverride = require('method-override')

const app = express();
let gfs;
app.set('view engine','ejs')
//app.use(methodOverride('_method'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }))
app.use(express.static("public"));
app.get("/", (request, response) => {
  response.sendFile(__dirname + "/views/index.html");
});

conn.once('open',() => {
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection('uploads');
})

const storage = new GridFsStorage({
  url: mongoURI,
  file: (req, file) => {
    return new Promise((resolve, reject)=>{
      crypto.randomBytes(16, (err,buf)=>{
        if(err) return reject(err)
        const filename = buf.toString('hex') + path.extname(file.originalname);
        const fileinfo={
          filename: filename,
          bucketName: 'uploads'
        };
        resolve(fileinfo);
      })
    })
  }
})
const upload = multer({storage})

app.post('/upload', upload.single('upfile'), (req,res)=>{
  const fileObject = req.file;
  const fName = fileObject.originalname;
  const fType = fileObject.mimetype;
  const fSize = fileObject.size
  res.json({name: fName, type: fType, size: fSize})
})

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log("Listening on port " + PORT);
});
