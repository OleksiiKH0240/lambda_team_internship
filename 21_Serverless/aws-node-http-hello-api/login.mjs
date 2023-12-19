import AWS from 'aws-sdk'
import { createResponse, validateInput } from "./utils.mjs";

const cognito = new AWS.CognitoIdentityServiceProvider()

export const handler = async (event) => {
    try {
        const isValid = validateInput(event.body);
        if (!isValid)
            return createResponse(400, { message: 'Invalid input' });

        const { email, password } = JSON.parse(event.body);
        const { user_pool_id, client_id } = process.env;
        const params = {
            AuthFlow: "ADMIN_NO_SRP_AUTH",
            UserPoolId: user_pool_id,
            ClientId: client_id,
            AuthParameters: {
                USERNAME: email,
                PASSWORD: password
            }
        };

        const response = await cognito.adminInitiateAuth(params).promise();
        // console.log("login response", response);
        return createResponse(200, { message: 'Success' }, { "Authorization": `${response.AuthenticationResult.IdToken}` });
    }
    catch (error) {
        console.log("error", error);
        const message = error.message ? error.message : 'Internal server error';
        const statusCode = error.statusCode ? error.statusCode : 501;

        return createResponse(statusCode, { message });
    }
}