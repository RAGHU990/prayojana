const multer = require('multer');
const path = require('path');
const { S3Client } = require("@aws-sdk/client-s3");
const multerS3 = require('multer-s3');
require('dotenv').config();

const s3 = new S3Client({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  region: process.env.S3_REGION,
});

const s3Storage = multerS3({
  s3: s3,
  bucket: process.env.S3_BUCKET,
  acl: 'public-read',
  metadata: (req, file, cb) => {
    cb(null, { fieldName: file.fieldname });
  },
  key: (req, file, cb) => {
    const fileName = Date.now() + '_' + file.fieldname + '_' + file.originalname;
    let type = req.params.type
    let ref_id = req.params.ref_id
    if (type === "profile")
      cb(null, "profile/"+ref_id+"/"+ fileName);
    else
      cb(null, "member/"+ref_id+"/"+ fileName);
  },
});

function sanitizeFile(file, cb) {
  const fileExts = ['.png', '.jpg', '.jpeg', '.gif', '.pdf', '.txt', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.odt', '.ods', '.odp', '.odg', '.odf', '.csv'];

  const isAllowedExt = fileExts.includes(
    path.extname(file.originalname.toLowerCase())
  );

  const isAllowedMimeType = file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf' || file.mimetype === 'application/msword' || file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'; ;

  if (isAllowedExt && isAllowedMimeType) {
    return cb(null, true);
  } else {
    cb('Error: File type not allowed!');
  }
}

const uploadImage = multer({
  storage: s3Storage,
  fileFilter: (req, file, callback) => {
    sanitizeFile(file, callback);
  },
  limits: {
    fileSize: 1024 * 1024 * 5, // 2mb file size
  },
});



module.exports = uploadImage;
