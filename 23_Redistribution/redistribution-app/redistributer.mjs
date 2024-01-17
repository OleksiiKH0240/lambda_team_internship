import approvedShopUsers, { shopIds } from "./database.mjs";
import AWS from 'aws-sdk';


const { queueUrl, sqsEndpointPrivateDns } = process.env;
const sqs = new AWS.SQS({ endpoint: sqsEndpointPrivateDns });
const shopCountLimit = 300;

export const handler = async (event, context) => {
    if (event.body === undefined) {
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "hello from lambda!"
            }),
        };
    }

    const queryBody = JSON.parse(event.body);

    if (queryBody.shopId === undefined) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: "missing 'shopId' field in request body" }),
        };
    }
    else {
        if (shopIds.includes(queryBody.shopId)) {
            const shopCount = await approvedShopUsers.getShopCount(queryBody.shopId);
            if (shopCount > shopCountLimit) {
                return {
                    statusCode: 401,
                    body: JSON.stringify({ message: `you reached limit of using shop: ${queryBody.shopId}.` }),
                };
            }

            const params = {
                MessageBody: JSON.stringify(queryBody),
                QueueUrl: queueUrl
            };

            // console.log("before fetch res");
            // const res = await fetch("https://google.com");
            // console.log("fetch res", res);

            // console.log("sqs before sendMessage");
            // const result = sqs.sendMessage(params).promise();
            const result = await sqs.sendMessage(params).promise();
            console.log("result", result);

            return {
                statusCode: 200,
                body: JSON.stringify({ message: "user is approved." }),
            };
        }
        else {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "user is rejected." }),
            };
        }
    }
}

