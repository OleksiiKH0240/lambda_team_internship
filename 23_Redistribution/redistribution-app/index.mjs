import approvedShopUsers, { shopIds } from "./database.mjs";


// const rds = new AWS.RDS({ apiVersion: '2014-10-31' });
// const { dbInstanceName } = process.env;

// const params = {
//     DBInstanceIdentifier: dbInstanceName
// }

// const rdsResponse = await rds.describeDBInstances(params).promise();
// const { Address: postgresEndpoint, Port: postgresPort } = rdsResponse.DBInstances[0].Endpoint;
// const { MasterUsername: postgresUser, DBName: dbName } = rdsResponse.DBInstances[0];
// const { postgresPassword } = process.env;
// console.log("log rdsRespond", rdsResponse.DBInstances[0]);
// console.log("log rdsRespond Endpoint", rdsResponse.DBInstances[0].Endpoint);
const shopCountLimit = 200;


export const handler = async (event, context) => {
    // console.log("event", event);
    // console.log("envs", process.env);

    // return {
    //     statusCode: 200,
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify({
    //         message: "hello from lambda!"
    //         // message: "hello from lambda!"
    //     }),
    // };

    if (event.body === undefined || event.body === "" || Object.keys(event.body).length == 0) {
        return {
            statusCode: 204,
            body: JSON.stringify({
                message: "hello from lambda!"
            }),
        };
    }

    let queryBody;
    try { queryBody = JSON.parse(event.body); }
    catch (err) {
        console.log("error", err);
        console.log("error event", event);
    }

    if (queryBody.shopId === undefined) {
        return {
            statusCode: 401,
            body: JSON.stringify({ message: "missing 'shopId' field in request body" }),
        };
    }
    else {
        if (shopIds.includes(queryBody.shopId)) {
            const shopCount = await approvedShopUsers.getShopCount(queryBody.shopId);
            if (shopCount > shopCountLimit) {
                return {
                    statusCode: 402,
                    body: JSON.stringify({ message: `you reached limit of using shop: ${queryBody.shopId}.` }),
                };
            }

            await approvedShopUsers.addUser(queryBody);
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

    // let queryBody;
    // if (event.Records !== undefined) {
    //     for (const record of event.Records) {
    //         queryBody = JSON.parse(record.body);
    //         await approvedShopUsers.addUser(queryBody);
    //     }
    // }

}
