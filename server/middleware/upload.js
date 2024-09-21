const multer = require('multer');
const path = require('path');

const storage = multer.memoryStorage(); // Configure multer to store the file in memory for hashing
const maxSizeMB = 12;

const upload = multer({
  storage: storage,
  limits: { fileSize: maxSizeMB * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    // Accept only image files
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return callback(null, true);
    } else {
      callback(new Error('Only images are allowed'));
    }
  }
});

module.exports = upload
