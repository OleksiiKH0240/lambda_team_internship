import { APIGatewayProxyHandlerV2 } from "aws-lambda";


const shopIds = ["shop1", "shop2", "shop3", "shop4", "shop5"];

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
    // console.log("event body", event.body);

    if (event.body === undefined) {
        return {
            statusCode: 200,
            body: JSON.stringify({ message: "hello from lambda!" }),
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
