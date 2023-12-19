'use strict';

module.exports.get = (event, context) => {
  console.log(context);
  console.log(event);
  const response = {
    statusCode: 200,
    body: JSON.stringify({
      message: event,
    }),
  };

  return response;
};

module.exports.post = (event, context) => {
  console.log(context);
  console.log(event);  
  const response = {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Password sent.',
    }),
  };

  return response;
};