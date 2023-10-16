function fib(n) {
    let a = 1;
    let b = 1;
    for (let i = 3; i <= n; i++) {
        let c = a + b;
        a = b;
        b = c;
    }
    return b;
}

export const handler = async (event) => {
    // TODO implement
    let response = {
        statusCode: 200,
        body: JSON.stringify('Hello from Lambda!')
    };

    if (event.requestContext.http.method == "GET") {
        response = {
            statusCode: 200,
            body: JSON.stringify([1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(fib))
        };
    }

    return response;
};

// https://q9w9ky3eif.execute-api.us-east-1.amazonaws.com/fibonacci
