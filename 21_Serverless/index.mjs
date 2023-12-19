import { createResponse } from "./utils.mjs"


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

    return createResponse(200, { message: `Email ${event.requestContext.authorizer.claims.email} has been authorized` })
};

// https://74qwwchydg.execute-api.us-east-1.amazonaws.com?name=oleksii
