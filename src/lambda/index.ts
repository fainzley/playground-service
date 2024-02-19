import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";
import * as aws from "@pulumi/aws";

const exampleHandler: aws.lambda.Callback<any, any> = async (event) => {
  console.log("Received event: ", event);

  const dynamoClient = new DynamoDBClient();

  try {
    const scanCommand = new ScanCommand({ TableName: process.env.ENTITIES_TABLE_NAME });
    const results = await dynamoClient.send(scanCommand)
    
    console.log(results);
  } catch (error) {
    console.error(error);
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Hello, World!" }),
  };
};

export default exampleHandler;
