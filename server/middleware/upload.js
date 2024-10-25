const multer = require('multer');
const path = require('path');

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

const multipleUpload = upload.array('images', maxImages);
const multiple = (req, res, next) => {
	// Handles the file upload and writes it to memory for further processing

    multipleUpload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({message: 'Invalid file(s)'});
        } else if (err) {
            return res.status(500).json({message: 'Error while uploading files'});
        }
        next();
    })
}

const singleUpload = upload.single('image');
const single = (req, res, next) => {
	// Handles the file upload and writes it to memory for further processing

    singleUpload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({message: 'Invalid file(s)'});
        } else if (err) {
            return res.status(500).json({message: 'Error while uploading files'});
        }
        next();
    })
}

module.exports = { single, multiple }
