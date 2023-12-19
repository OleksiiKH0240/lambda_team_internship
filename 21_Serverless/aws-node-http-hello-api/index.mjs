import { createResponse, getAllKeysFromBucket, getEmailFromJWT, getImageKeysUrls, uploadImageToBucket } from "./utils.mjs"
import AWS from 'aws-sdk'


export const handler = async (event) => {
    // TODO implement
    let response = {
        statusCode: 200,
        body: JSON.stringify('Hello from Lambda!')
    };

    const queryParameters = event.queryStringParameters;
    if (event.requestContext.http.method == "GET" && queryParameters != undefined && queryParameters.name != undefined) {
        response = {
            statusCode: 200,
            body: JSON.stringify(`Hello, ${event.queryStringParameters.name}`)
        };
    }

    return response;
};

export const images_handler = async (event) => {
    // TODO implement
    // let response = {
    //     statusCode: 200,
    //     body: JSON.stringify('images')
    // };

    try {
        // console.log(process.env);
        // console.log(event.body);
        // let image = event.body;
        console.log("event", event)

        const email = getEmailFromJWT(event.headers.authorization);

        const s3 = new AWS.S3({ apiVersion: '2006-03-01' });
        const { s3BucketName } = process.env;

        const allKeys = await getAllKeysFromBucket(s3, s3BucketName, email);

        const { dynamoDbTableName } = process.env;
        const db = new AWS.DynamoDB.DocumentClient();
        console.log("dynamoDbTableName", dynamoDbTableName);

        const imageKeysUrls = await getImageKeysUrls(s3, s3BucketName, allKeys, db, dynamoDbTableName);

        return createResponse(200, imageKeysUrls);
    }
    catch (error) {
        console.log("error", error);
        const message = error.message ? error.message : 'Internal server error';
        const statusCode = error.statusCode ? error.statusCode : 501;
        return createResponse(statusCode, { message });
    }
};

export const uploadImage_handler = async (event) => {
    try {
        // const image = new FormData(Buffer.from(event.body, "base64").toString());
        const image = Buffer.from(event.body, "base64");
        console.log("event", event);
        console.log("image", image);

        const email = getEmailFromJWT(event.headers.authorization);

        const filename = event.queryStringParameters?.filename;
        if (filename === undefined)
            return createResponse(400, { message: "Invalid input. 'filename' query parameter is required." });
        // const ext = filename.split(".")[1];

        const s3 = new AWS.S3({ apiVersion: '2006-03-01' });
        const { s3BucketName } = process.env;

        const res = await uploadImageToBucket(s3, s3BucketName, email, filename, image);

        return createResponse(200, { message: "photo was successfully uploaded." });
    }
    catch (error) {
        console.log("error", error);
        const message = error.message ? error.message : 'Internal server error';
        const statusCode = error.statusCode ? error.statusCode : 501;
        return createResponse(statusCode, { message });
    }
}

export const deleteImage_handler = async (event) => {
    try {
        const email = getEmailFromJWT(event.headers.authorization);

        const filename = event.queryStringParameters?.filename;
        if (filename === undefined) {
            return createResponse(400, { message: "Invalid input. 'filename' query parameter is required." });
        }

        const s3 = new AWS.S3({ apiVersion: '2006-03-01' });
        const { s3BucketName } = process.env;

        const allKeys = await getAllKeysFromBucket(s3, s3BucketName, email);
        const key = `images/${email}/${filename}`;
        if (!allKeys.includes(key)) {
            return createResponse(400, { message: `Invalid input. key: ${key} doesn't exist in bucket.` });
        }

        const params = { Bucket: s3BucketName, Key: key };
        const res = await s3.deleteObject(params).promise();
        console.log("res", res.$response);

        const { dynamoDbTableName } = process.env;
        const db = new AWS.DynamoDB.DocumentClient();
        console.log("dynamoDbTableName", dynamoDbTableName);
        await db.delete({
            TableName: dynamoDbTableName,
            Key: {
                "email": email,
                "filename": filename
            },
        }, (err, data) => { if (err) throw err; }).promise();

        return createResponse(200, { message: `object with key: ${key} was successfully deleted.` });
    }
    catch (error) {
        console.log("error", error);
        const message = error.message ? error.message : 'Internal server error';
        const statusCode = error.statusCode ? error.statusCode : 501;
        return createResponse(statusCode, { message });
    }
}
