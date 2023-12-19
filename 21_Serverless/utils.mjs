export const validateInput = (data) => {
    const body = JSON.parse(data);
    const { email, password } = body;
    
    if (!email || !password) return false;

    return true;
}

export const createResponse = (statusCode, body) => {
    const response = {
        statusCode: statusCode,
        body: JSON.stringify(body),
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": true
        }
    };

    return response;
}
