import FormData from 'form-data'
import axios from "axios";


export const validateInput = (data) => {
    const body = JSON.parse(data);
    const { email, password } = body;

    if (!email || !password) return false;

    return true;
}

export const createResponse = (statusCode, body, customHeaders = {}) => {
    const response = {
        statusCode: statusCode,
        body: JSON.stringify(body),
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true,
            ...customHeaders
        }
    }
    return response
}

export const getEmailFromJWT = (jwt) => {
    let [jwtHeader, jwtPayload, jwtSignature] = jwt.replace(/Bearer */, "").split(".");
    jwtPayload = JSON.parse(Buffer.from(jwtPayload, "base64").toString());
    const email = jwtPayload.email;
    return email;
}

export const getAllKeysFromBucket = async (s3, bucketName, email) => {
    let bucketParams = {
        Bucket: bucketName,
        Prefix: `images/${email}/`
    };

    // Call S3 to obtain a list of the objects in the bucket
    let allKeys = [];
    while (true) {
        const objectsList = await s3.listObjectsV2(bucketParams, function (err, data) {
            if (err) throw err;
        }).promise();

        console.log("objectsList", objectsList);
        if (objectsList.Contents.length != 0){
            allKeys = allKeys.concat(objectsList.Contents.map((el) => el.Key));
        }

        if (objectsList.IsTruncated === false) break;
        else {
            // if bucket has more than 1000 objects
            bucketParams["ContinuationToken"] = objectsList.NextContinuationToken;
        }
    }

    // allKeys = new Array([...allKeys]);

    console.log("allKeys", allKeys, allKeys.length, Object.keys(allKeys));
    return allKeys;
}

const getKeysToRenew = async (db, dynamoDbTableName, email, allKeys) => { 
    const params = {
        TableName: dynamoDbTableName,
        ScanFilter: {
            "email": {
                ComparisonOperator: "EQ",
                AttributeValueList: [email]
            }
        }
    }

    const scanResult = await db.scan(params,
        (err, data) => { if (err) throw err; }).promise();

    console.log("scanResult", scanResult);

    const scanedItems = {};
    let keysToRenew = [];

    if (scanResult.Count == 0) keysToRenew = allKeys.slice();
    else {

        // const scanedKeys = scanResult.Items.map((item) => `images/${item.email}/${item.filename}`);
        const scanedKeys = [];
        for (const item of scanResult.Items) {
            const key = `images/${item.email}/${item.filename}`;
            scanedKeys.push(key);
            scanedItems[key] = {
                "url": item.url,
                "expiresInDate": item.expiresInDate
            };
        }
        console.log("scanedKeys", scanedKeys);

        keysToRenew = allKeys.filter((key) => {
            if (!scanedKeys.includes(key) || scanedItems[key].expiresInDate <= Date.now()) return true;
        })
    }

    console.log("keysToRenew", keysToRenew);
    return [keysToRenew, scanedItems]
};

export const getImageKeysUrls = async (s3, bucketName, allKeys, db, dynamoDbTableName) => {
    if (allKeys.length == 0) {
        return []
    };
    console.log("allKeys", allKeys, allKeys.length, Object.keys(allKeys));

    const email = allKeys[0].split("/").at(1);
    const expiresIn = 120;

    const [keysToRenew, scanedItems] = await getKeysToRenew(db, dynamoDbTableName, email, allKeys);

    const restOfKeys = allKeys.filter(key => !keysToRenew.includes(key));
    console.log("restOfKeys", restOfKeys);

    const imageKeysUrls = [];
    for (const key of keysToRenew) {
        const expiresInDate = Date.now() + ((expiresIn - 1) * 1000);
        const url = s3.getSignedUrl("getObject", { Bucket: bucketName, Key: key, Expires: expiresIn });
        // console.log("url", url);
        const urlObj = {};
        urlObj[key] = url;
        // console.log("urlObj", urlObj);

        imageKeysUrls.push(urlObj);

        const filename = key.split("/").at(2);
        const dbObj = {
            "email": email,
            "filename": filename,
            "url": url,
            "expiresInDate": expiresInDate
        };

        const res = await db.put({
            TableName: dynamoDbTableName,
            Item: dbObj,
        },
            (err, data) => { if (err) throw err; }).promise();

        // console.log("dynamoDB put object res", res);
    };

    for (const key of restOfKeys) {
        const urlObj = {};
        urlObj[key] = scanedItems[key].url;
        // console.log("urlObj", urlObj);

        imageKeysUrls.push(urlObj);
    }


    return imageKeysUrls;
}


export const uploadImageToBucket = async (s3, bucketName, email, filename, image) => {
    // const getRandomFilename = () => crypto.randomBytes(randomBytesLength).toString("hex");
    // const key = `images/${getRandomFilename()}${email}&${filename}.jpg`;
    const key = `images/${email}/${filename}`;
    // const key = "cat.jpg";
    console.log("key", key);

    const data = s3.createPresignedPost({
        Bucket: bucketName,
        Fields: {
            key, // totally random
            // "Content-Type": "image/jpeg",
            // "ext": "jpg"
        },
        // Conditions: [
        //     // ["content-length-range", 	0, 1000000], // content length restrictions: 0-1MB
        //     // ["starts-with", "$Content-Type", "image/"], // content type restriction
        //     // ["eq", "$x-amz-meta-userid", userid], // tag with userid <= the user can see this!
        // ]
    });

    console.log("data", data);

    const formData = new FormData();

    // formData.append("Content-Type", "image/jpeg");

    Object.entries(data.fields).forEach(([k, v]) => {
        formData.append(k, v);
    });

    formData.append("file", image);

    let config = {
        method: 'post',
        url: data.url,
        data: formData
    };

    console.log("config", config);

    const res = await axios.request(config);

    console.log("res", res);
    return res;
}
