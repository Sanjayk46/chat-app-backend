const multer = require('multer');
const BAD_REQUEST = 400;
const express = require('express');
const router = express.Router();
const handler = require('express-async-handler');
const fs = require('fs');
const UNAUTHORIZED = 401;
const cloudinary = require('./cloudinaryconfig');
const {protect} = require('../middleware/authMiddleware');

const storage = multer.diskStorage({
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB, adjust as needed
  }
});

router.post('/', protect,
    upload.single('image'),
    handler(async (req, res) => {
      const file = req.file;
      console.log(file);
      if (!file) {
        return res.status(BAD_REQUEST).send('No file uploaded');
      }
      try {
        const imageBuffer = await fs.promises.readFile(file.path);
        const imageUrl = await uploadImageToCloudinary(imageBuffer);
        res.status(200).send({
          message: "Uploaded",
          data: { imageUrl },
        });
      } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Internal Server Error' });
      }
    }));
const Imgurl = async(req,res)=>{
  const imageUrl = req.file;
  if (!imageUrl) {
    return res.status(BAD_REQUEST).send('Image URL not available');
  }
  res.status(200).send({
    message:"image url is sended",
    data:imageUrl
  })
  console.log(imageUrl);
};
const uploadImageToCloudinary = imageBuffer => {
    return new Promise((resolve, reject) => {
      if (!imageBuffer) {
        return reject('No image buffer provided');
      }
  
      // Directly using cloudinary.uploader.upload_stream
      const uploadStream = cloudinary.uploader.upload_stream((error, result) => {
        if (error || !result) {
          return reject(error);
        }
        resolve(result.url);
      });
  
      uploadStream.end(imageBuffer);
    });
  };
module.exports=router,Imgurl;