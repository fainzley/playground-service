import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

import exampleHandler from "../src/lambda";

type Stage = "dev" | "beta" | "prod";

// Read the stage from the STAGE environment variable
const STAGE = (process.env.STAGE as Stage) ?? "dev";
const SERVICE_NAME = "playground-service";

const createResourceName = (name: string) => `${STAGE}_${SERVICE_NAME}_${name}`;
const createS3BucketName = (name: string) => `${STAGE}-${SERVICE_NAME}-${name}`;

// Create an example S3 bucket
const bucket = new aws.s3.Bucket("bucket", {
  bucket: createS3BucketName("bucket"),
});

const entitiesTable = new aws.dynamodb.Table("entities", {
  name: createResourceName("entities"),
  hashKey: "id",
  rangeKey: "createdAt",
  billingMode: "PAY_PER_REQUEST",
  attributes: [
    { name: "id", type: "S" },
    { name: "entityId", type: "S" },
    { name: "createdAt", type: "N" },
  ],
  globalSecondaryIndexes: [
    {
      name: "EntityIndex",
      hashKey: "id",
      rangeKey: "entityId",
      projectionType: "ALL",
    },
  ],
});

const costsTable = new aws.dynamodb.Table("costs", {
  name: createResourceName("costs"),
  hashKey: "id",
  rangeKey: "createdAt",
  billingMode: "PAY_PER_REQUEST",
  attributes: [
    { name: "id", type: "S" },
    { name: "createdAt", type: "N" },
    { name: "groupId", type: "S" },
    { name: "paidBy", type: "S" },
    { name: "paidFor", type: "S" },
  ],
  globalSecondaryIndexes: [
    {
      name: "GroupIndex",
      hashKey: "groupId",
      rangeKey: "createdAt",
      projectionType: "ALL",
    },
    {
      name: "PaidByIndex",
      hashKey: "paidBy",
      rangeKey: "createdAt",
      projectionType: "ALL",
    },
    {
      name: "PaidForIndex",
      hashKey: "paidFor",
      rangeKey: "createdAt",
      projectionType: "ALL",
    },
  ],
});

// Create a role for the Lambda with few permissions, since the default role that
// CallbackFunction creates is very unrestricted
const lambdaRole = new aws.iam.Role("lambda-role", {
  assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal({
    Service: "lambda.amazonaws.com",
  }),
  // Attach the AWSLambdaBasicExecutionRole policy to the role that has permissions for CloudWatch logging etc.
  managedPolicyArns: [
    "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole",
  ],
});

// DynamoDB read/write policy
const dynamoDbPolicy = new aws.iam.Policy("dynamo-policy", {
  description:
    "A policy that allows a lambda function to read and write to a DynamoDB table.",
  policy: pulumi
    .all([entitiesTable.arn, costsTable.arn])
    .apply(([entitiesTableArn, costsTableArn]) =>
      JSON.stringify({
        Version: "2012-10-17",
        Statement: [
          {
            Action: [
              "dynamodb:GetItem",
              "dynamodb:Scan",
              "dynamodb:Query",
              "dynamodb:UpdateItem",
              "dynamodb:PutItem",
              "dynamodb:DeleteItem",
              "dynamodb:BatchWriteItem",
              "dynamodb:BatchGetItem",
            ],
            Effect: "Allow",
            Resource: [entitiesTableArn, costsTableArn],
          },
        ],
      })
    ),
});

// Attach the policy to the role
const rolePolicyAttachment = new aws.iam.RolePolicyAttachment(
  "rolePolicyAttachment",
  {
    role: lambdaRole.name,
    policyArn: dynamoDbPolicy.arn,
  }
);

// Create an example Lambda Function. This uses Pulumi Function Serialization. If we
// run into issues with this we can use `aws.lambda.Function` instead, bundle the code
// into a zip ourselves, and provide a path to it. See:
// https://www.pulumi.com/docs/concepts/function-serialization/
// https://www.pulumi.com/registry/packages/aws/api-docs/lambda/function/
const lambda = new aws.lambda.CallbackFunction("lambda", {
  callback: exampleHandler,
  runtime: aws.lambda.Runtime.NodeJS20dX,
  role: lambdaRole.arn,
  name: createResourceName("lambda"),
  environment: {
    variables: {
      ENTITIES_TABLE_NAME: entitiesTable.name,
    },
  },
});

export const bucketName = bucket.id;
export const lambdaArn = lambda.arn;
