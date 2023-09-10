import inquirer from "inquirer";
import axios from "axios";
import FormData from 'form-data';
import fs from 'fs'
import dotenv from 'dotenv'


dotenv.config();
// console.log(process.env);
const tinyurlApiToken = process.env.tinyurlApiToken;
const client_id = process.env.client_id;
const client_secret = process.env.client_secret;
const refresh_token = process.env.refresh_token;


// ---------------------------------------------------------------


let answer;

answer = await inquirer.prompt({
    name: "photoPath",
    message: "Drag and drop the image to the terminal and press ENTER to upload it:",
    type: "input"
});

const filePath = answer.photoPath;
let fileName = filePath.split("\\").at(-1);
const fileExt = fileName.split(".").at(-1);

console.log(`file path: ${filePath}`);
console.log(`file name: ${fileName}`);
console.log(`file extension: ${fileExt}`);

answer = await inquirer.prompt({
    name: "confirmation",
    message: `You're uploading file with name: ${fileName}. Would you like to change the name of the file?`,
    type: "confirm",
    default: false
});

if (answer.confirmation) {
    answer = await inquirer.prompt({
        name: "changedName",
        message: "Write down new name of the file without any extensions like (.png, .jpg, etc.):",
        type: "input"
    });
    fileName = answer.changedName + `.${fileExt}`;
}

const response = await uploadPhoto(filePath, fileName);
// console.log(response);
const fileUrl = createFileUrl(response.id);

answer = await inquirer.prompt({
    name: "confirmation",
    message: `Would you like to shorten url of your file?`,
    type: "confirm",
    default: true
});

if (answer.confirmation) {
    const tinyFileUrl = await createTinyUrl(fileUrl);
    console.log(tinyFileUrl);
} else {
    console.log(fileUrl);
}




// ----------------------------------------------------------------------------------

async function refreshAccessToken() {
    const refreshAccessTokenUrl = "https://developers.google.com/oauthplayground/refreshAccessToken";
    const requestBody = {
        "token_uri": "https://oauth2.googleapis.com/token",
        "client_id": client_id,
        "client_secret": client_secret,
        "refresh_token": refresh_token
    };

    const response = await axios({
        method: 'post',
        url: refreshAccessTokenUrl,
        headers: {},
        data: requestBody
    });
    const access_token = response.data.access_token;
    if (response.data.success) {
        console.log("access token was successfully refreshed.");
    } else {
        console.log("access token was not refreshed.")
        return undefined;
    }

    return access_token;
}


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

