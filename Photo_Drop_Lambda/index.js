import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";


const s3Client = new S3Client();

// const svg = `<svg
//         xmlns="http://www.w3.org/2000/svg" 
//         xml:lang="en"
//         height="1080"
//         width="1920">
//         <text
//         font-style="italic"
//         x="490" y="550" font-size="200" fill="#454545">
//         Photo Drop
//         </text>
//         </svg>`;

const watermark = sharp("./PhotoDrop Logo.png");
// const watermark = sharp(Buffer.from(svg));
// const watermark = sharp("./watermark_1920_1080.png");
// const watermark = sharp.read("./watermark_100_40.png");

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

  const photoArray = await response.Body?.transformToByteArray();

  const photo = sharp(photoArray);
  console.log("photo buffer was read.");

  const { width: photoW, height: photoH } = await photo.metadata();
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

  const putCommand = new PutObjectCommand({
    Bucket: bucketName,
    Key: photoS3Key.replace("withoutWatermark/", "withWatermark/"),
    Body: watermarkPhotoBuffer
  });
  
  await s3Client.send(putCommand);
  console.log("watermarked photo was sent.")
  
  const res = {
    statusCode: 200,
    body: JSON.stringify('Watermark was added.'),
  };

  return res;
};
