import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";
import pg from "pg";
import "dotenv/config";


const s3Client = new S3Client();

const { PG_HOST, PG_PORT, PG_DATABASE, PG_USER, PG_PASSWORD } = process.env;
const pgConfig = {
  host: PG_HOST,
  port: Number(PG_PORT) || 5432,
  database: PG_DATABASE,
  user: PG_USER,
  password: PG_PASSWORD,
  ssl: true
};
let pool;
let client;


const watermark = sharp("./PhotoDrop Logo.png");

export const handler = async (event) => {
  const { s3 } = event.Records[0];

  const bucketName = s3.bucket.name;
  const photoS3Key = decodeURIComponent(
    s3.object.key.replace(/\+/g, " ")
  );
  // if (photoS3Key.match(/withoutWatermark\//))
  console.log(`photo s3 key: ${photoS3Key}`);
  
  const getCommand = new GetObjectCommand({
    Bucket: bucketName,
    Key: photoS3Key
  });

  const response = await s3Client.send(getCommand);
  console.log("original photo was got.");

  const photoArray = await response.Body?.transformToByteArray();

  const photo = sharp(photoArray);
  console.log("photo buffer was read.");

  const { width: photoW, height: photoH, size } = await photo.metadata();
  console.log(`photo size: ${photoW}, ${photoH}`);

  const resizedWatermark = await watermark.resize(
    Math.floor(photoW/2.442043), 
    Math.floor(photoH/3.23529), 
    {
        fit: "inside"
    }).toBuffer();
  console.log("watermark was resized.");

  const [leftPadding, topPadding] = [Math.floor(photoW/3.377717), Math.floor(photoH/2.65273)];

  const watermarkPhotoBuffer = await photo.
  composite([{
    input: resizedWatermark,
    gravity: "center",
    left: leftPadding,
    top: topPadding
}]).toBuffer();
  console.log("watermark was added to photo.");

  const watermarkPhotoS3Key = photoS3Key.replace("withoutWatermark/", "withWatermark/");
  const putCommand = new PutObjectCommand({
    Bucket: bucketName,
    Key: watermarkPhotoS3Key,
    Body: watermarkPhotoBuffer
  });
  
  await s3Client.send(putCommand);
  console.log("watermarked photo was sent.")
  
  pool = new pg.Pool(pgConfig)
  client = await pool.connect();
  const result = await client.query(`
  insert into photo_drop.albums_photos(photo_s3_key, watermark_photo_s3_key, has_watermark)
  values('${photoS3Key}', '${watermarkPhotoS3Key}', true)
  on conflict(photo_s3_key) do update set has_watermark = true, last_updated = localtimestamp;
  `);
  
  console.log(result);
  await client.query("commit;");
  
  client.release();
  await pool.end();
  console.log("set 'hasWatermark' to true.");

  const res = {
    statusCode: 200,
    body: JSON.stringify('Watermark was added.'),
  };

  return res;
};
