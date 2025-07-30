import AWS from 'aws-sdk';
import dotenv from 'dotenv';
dotenv.config();

const r2 = new AWS.S3({
  endpoint: process.env.R2_ENDPOINT,
  accessKeyId: process.env.R2_ACCESS_KEY,
  secretAccessKey: process.env.R2_SECRET_KEY,
  signatureVersion: 'v4',
});

const signedUrl = s3.getSignedUrl('getObject', {
  Bucket: process.env.R2_BUCKET,
  Key: key,
  Expires: 3600, // 1시간
});


res.json({ success: true, url: signedUrl });