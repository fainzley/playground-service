import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

const dynamoDBClient = new DynamoDBClient({
  region: "eu-west-2",
});

export { dynamoDBClient };
