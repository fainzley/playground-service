import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";

import exampleHandler from "../src/lambda";

type Stage = "dev" | "beta" | "prod";

// Read the stage from the STAGE environment variable
const STAGE = process.env.STAGE as Stage ?? "dev";
const SERVICE_NAME = "playground-service";

const createResourceName = (name: string) => `${STAGE}_${SERVICE_NAME}_${name}`;
const createS3BucketName = (name: string) => `${STAGE}-${SERVICE_NAME}-${name}`;

// Create an example S3 bucket
const bucket = new aws.s3.Bucket("bucket", { bucket: createS3BucketName("bucket") });

// Create a role for the Lambda with no permissions, since the default role that
// CallbackFunction creates is very unrestricted
const lambdaRole = new aws.iam.Role("lambda-role", {
  assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal({ Service: "lambda.amazonaws.com" }),
  // Attach the AWSLambdaBasicExecutionRole policy to the role that has permissions for CloudWatch logging etc.
  managedPolicyArns: ["arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"]
});

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
});

// Export the name of the bucket and the lambda arn
export const bucketName = bucket.id;
export const lambdaArn = lambda.arn;
