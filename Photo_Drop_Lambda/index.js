import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
// import jimp from "jimp";
import sharp from "sharp";


const s3Client = new S3Client();

const watermark = sharp("./watermark_1920_1080.png");
// const watermark = await jimp.read("./watermark_1920_1080.png");
// const watermark = await jimp.read("./watermark_100_40.png");

export const handler = async (event) => {
  const { s3 } = event.Records[0];

  const bucketName = s3.bucket.name;
  const photoS3Key = decodeURIComponent(
    s3.object.key.replace(/\+/g, " ")
  );
  console.log(`photo s3 key: ${photoS3Key}`);
  
  const getCommand = new GetObjectCommand({
    Bucket: bucketName,
    Key: photoS3Key
  });

  const response = await s3Client.send(getCommand);
  console.log("original photo was got.");
  const photoArray = Buffer.from(await response.Body?.transformToByteArray());
  // console.log(typeof photoArray);
  // console.log("photoArray", photoArray);

  // const photo = await jimp.read(photoArray);
  const photo = sharp(photoArray);


  console.log("photo buffer was read.");

  // const [photoW, photoH] = [photo.getWidth(), photo.getHeight()];
  const { width: photoW, height: photoH } = await photo.metadata();
  console.log(`photo size: ${photoW}, ${photoH}`);

  // const resizedWatermark = watermark.resize(photoW, photoH);
  const resizedWatermark = await watermark.resize(photoW, photoH).toBuffer();

  console.log("watermark was resized.");
  // const watermarkPhotoBuffer = await photo.composite(resizedWatermark, 0, 0, {
  //   mode: jimp.BLEND_SOURCE_OVER,
  //   opacityDest: 1,
  //   opacitySource: 1
  // }).getBufferAsync(jimp.AUTO);
  const watermarkPhotoBuffer = await photo.
  composite([{
      input: resizedWatermark,
      gravity: "center"
  }]).toBuffer();
  console.log("watermark was added to photo.");
  const putCommand = new PutObjectCommand({
    Bucket: bucketName,
    Key: photoS3Key.replace("withoutWatermark/", "withWatermark/"),
    Body: watermarkPhotoBuffer
  });
  
  await s3Client.send(putCommand);
  console.log("watermarked photo was sent.")
  
  const res = {
    statusCode: 200,
    body: JSON.stringify('Hello from Lambda!'),
  };

  return res;
};
