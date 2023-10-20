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

// https://4gq9p7tgv5.execute-api.us-east-1.amazonaws.com?name=oleksii
