import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs'



async function refreshAccessToken() {
    const refreshAccessTokenUrl = "https://developers.google.com/oauthplayground/refreshAccessToken";
    const requestBody = {
        "token_uri": "https://oauth2.googleapis.com/token",
        "client_id": "769520860491-eot1m57o74darm5o6bhfa0j8dvo88ksi.apps.googleusercontent.com",
        "client_secret": "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",
        "refresh_token": "1//0476fiqG3ZxceCgYIARAAGAQSNwF-L9IrZRGAxtPnLr3DP4mE2kPKbYQySw00WB0MDfOQk0jYXoj5BjDL7Ua2tF6jPdrTpcWrbBQ"
    };

    const response = await axios({
        method: 'post',
        url: refreshAccessTokenUrl,
        headers: {},
        data: requestBody
    });
    const access_token = response.data.access_token;
    if (response.data.success) {
        console.log("token was successfully refreshed.");
    } else {
        console.log("token was refreshed.")
        return undefined;
    }

    return access_token;
}

const tinyurlApiToken = "NUcOlw1VncVgqE6swb0CV37TKlA7giE7ID6mz3C91MpXN9ysD1R8Bhhw0raj";

async function createTinyUrl(url) {
    let data = new FormData();
    data.append("url", url);
    data.append("domain", "tinyurl.com");

    const config = {
        "method": "post",
        "url": `https://api.tinyurl.com/create?api_token=${tinyurlApiToken}`,
        "headers": {
            "accept": "application/json",
            "Content-type": "application/json",
            ...data.getHeaders()
        },
        "data": data
    };

    const response = await axios.request(config);
    // console.log(response);
    return response.data.data.tiny_url;
}

function createFileUrl(fileId) {
    return `https://drive.google.com/file/d/${fileId}/view`;
};

async function uploadPhoto(photoPath = "cat.jpg", photoName = "little_cat.jpg") {
    let access_token = await readAccessToken();

    const jsonStr = JSON.stringify({
        "name": photoName,
        "parents": ["1gX6piVhDoCkwRf8ArkbgzhtVzhh8xu1y",]
    });
    fs.writeFileSync('metadata.json', jsonStr, { flag: 'w' }, err => {
        if (err) {
            console.log(err);
            return;
        }
    });

    let data = createRequestData(photoPath);

    let config = {
        method: 'post',
        url: 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
        headers: {
            'Authorization': access_token,
            ...data.getHeaders()
        },
        data: data
    };

    let response;
    try {
        response = await axios.request(config);
    } catch (error) {
        // console.log(error);
        console.log("during photo uploading an error occured");
        console.log("refreshing access token...");
        access_token = "Bearer " + await refreshAccessToken();

        saveAccessToken(access_token);
        // console.log(config.headers.Authorization);
        config.headers.Authorization = access_token;

        // console.log("hello1");
        config.data = createRequestData(photoPath);
        response = await axios.request(config);
        // response = await axios.request({method: "get", url: "https://www.google.com"});
        // return await uploadPhoto(photoPath, photoName);    
        // console.log(access_token);
    }

    console.log("photo was successfully uploaded.")
    return response.data;
    // console.log(response.data);

}

function createRequestData(photoPath) {
    let data = new FormData();
    data.append('metadata', fs.createReadStream('metadata.json'));
    data.append('', fs.createReadStream(photoPath));
    return data;
}

function saveAccessToken(access_token) {
    const jsonStr = JSON.stringify({ "access_token": access_token });
    fs.writeFile('access_token.json', jsonStr, { flag: 'w' }, err => {
        if (err) {
            console.log(err);
            return;
        }
    });
    console.log("access token was successfully saved.")
}

async function readAccessToken() {
    if (fs.existsSync("./access_token.json")) {
        const data = fs.readFileSync("access_token.json", "utf8");
        // console.log(data);
        return JSON.parse(data).access_token;
    } else {
        let access_token = "Bearer " + await refreshAccessToken();
        saveAccessToken(access_token);
        return access_token;
    }
}

// let access_token = readAccessToken();


// console.log(await readAccessToken());


// await refreshAccessToken();

const response = await uploadPhoto("cat.jpg", "tired_kitty.jpg");
console.log(response);
const fileUrl = createFileUrl(response.id);
console.log(fileUrl);
const tinyFileUrl = await createTinyUrl(fileUrl);
console.log(tinyFileUrl);

