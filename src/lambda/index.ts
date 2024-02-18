import * as aws from "@pulumi/aws";

const exampleHandler: aws.lambda.Callback<any, any> = async (event) => {
  console.log("Received event: ", event);

  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Hello, World!" }),
  };
};

export default exampleHandler;
