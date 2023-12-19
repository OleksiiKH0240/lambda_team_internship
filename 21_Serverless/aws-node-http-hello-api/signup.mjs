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
        // console.log("body", JSON.parse(event.body))
        // console.log("envs", process.env)
        // console.log("params1:", email, password, user_pool_id)

        const params = {
            UserPoolId: user_pool_id,
            Username: email,
            UserAttributes: [
                {
                    Name: 'email',
                    Value: email
                },
                {
                    Name: 'email_verified',
                    Value: 'true'
                }],
            MessageAction: 'SUPPRESS'
        };
        const response = await cognito.adminCreateUser(params).promise();
        // console.log("create user response", response)

        if (response.User) {
            const paramsForSetPass = {
                Password: password,
                UserPoolId: user_pool_id,
                Username: email,
                Permanent: true
            };
            await cognito.adminSetUserPassword(paramsForSetPass).promise();
        }

        const authParams = {
            AuthFlow: "ADMIN_NO_SRP_AUTH",
            UserPoolId: user_pool_id,
            ClientId: client_id,
            AuthParameters: {
                USERNAME: email,
                PASSWORD: password
            }
        };
        const authResponse = await cognito.adminInitiateAuth(authParams).promise();

        return createResponse(200,
            { message: 'User registration successful' },
            { "Authorization": `${authResponse.AuthenticationResult.IdToken}` });
    }
    catch (error) {
        if (error.code == "InvalidPasswordException") {
            const { email } = JSON.parse(event.body);
            const { user_pool_id } = process.env;

            console.log("params2:", email, user_pool_id);
            const response = await cognito.adminDeleteUser(
                {
                    UserPoolId: user_pool_id,
                    Username: email,
                }
            ).promise();
            console.log("delete user response", response);
            console.log("error", error);
        }

        console.log("error", error);
        const message = error.message ? error.message : 'Internal server error'
        const statusCode = error.statusCode ? error.statusCode : 501

        return createResponse(statusCode, { message });
    }
}
