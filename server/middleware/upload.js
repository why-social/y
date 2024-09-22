const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
var models = require('../db/database').mongoose.models;

const storage = multer.memoryStorage(); // Configure multer to store the file in memory for hashing
const maxSizeMB = 12;
const maxImages = 4;

const upload = multer({
  storage: storage,
  limits: { fileSize: maxSizeMB * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    // Accept only image files
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return callback(null, true); // accept the file
    } else {
	  if (!req.invalidFiles) req.invalidFiles = [];
	  req.invalidFiles.push(file); // mark file as invalid
      callback(null, false); // skip the file
    }
  }
});

const uploadFiles = (req, res, next) => {
	// Handles the file upload and writes it to memory for further processing
    const multipleUpload = upload.array('images', maxImages);

    multipleUpload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({message: 'Invalid file(s)'});
        } else if (err) {
            return res.status(500).json({message: 'Error while uploading files'});
        }
        next();
    })
}

async function saveFile(file) {
  // Saves the file from multer buffer (memory) to disk and updates images DB
  const fileBuffer = file.buffer; // read file from multer buffer
  const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex'); // generate hash from the file content
  const dir = path.join(appRoot, '/uploads/', hash);
  const filePath = path.join(dir, file.originalname);
  
  // check if the directory (image) already exists
  if (fs.existsSync(dir)) {
      const image = await models.Images.findOneAndUpdate({hash : hash}, {$inc: {usageCount: 1}}, {new: true}); // only update the existing document in the DB
      console.log(image);
      console.log(hash);
      return image;
  }
  
  // save the file with its original name inside the /hash directory
  fs.mkdirSync(dir, { recursive: true });         
  fs.writeFileSync(filePath, fileBuffer);
  const newImage = new models.Images({hash: hash, url: filePath, usageCount: 1});
  return await newImage.save(); // insert new entry into Images collection
}

module.exports = { uploadFiles, saveFile }
