import AWS from "aws-sdk"
import { validateInput, createResponse } from "./utils.mjs"

const cognito = new AWS.CognitoIdentityServiceProvider();

export const signupUser = async (event) => {
    try {
        const isValid = validateInput(event.body)
        if (!isValid)
            return createResponse(400, { message: 'Invalid input' })

        const { email, password } = JSON.parse(event.body)
        const { user_pool_id } = process.env
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
        }
        const response = await cognito.adminCreateUser(params).promise();
        if (response.User) {
            const paramsForSetPass = {
                Password: password,
                UserPoolId: user_pool_id,
                Username: email,
                Permanent: true
            };
            await cognito.adminSetUserPassword(paramsForSetPass).promise()
        }
        return createResponse(200, { message: 'User registration successful' })
    }
    catch (error) {
        const message = error.message ? error.message : 'Internal server error'
        console.log(error)
        return createResponse(500, { message })
    }
}
