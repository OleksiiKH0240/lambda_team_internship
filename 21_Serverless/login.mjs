import AWS from "aws-sdk"
import { validateInput, createResponse } from "./utils.mjs"

const cognito = new AWS.CognitoIdentityServiceProvider();

export const loginUser = async (event) => {
    // validation
    const isValid = validateInput(event.body);
    if (!isValid) return createResponse(400, { message: "Invalid input" })

    const { email, password } = JSON.parse(event.body)
    const { user_pool_id, client_id } = process.env
    const params = {
        AuthFlow: "ADMIN_NO_SRP_AUTH",
        UserPoolId: user_pool_id,
        ClientId: client_id,
        AuthParameters: {
            USERNAME: email,
            PASSWORD: password
        }
    }
    const response = await cognito.adminInitiateAuth(params).promise();
    return createResponse(200, { message: 'Success', token: response.AuthenticationResult.IdToken })
}
