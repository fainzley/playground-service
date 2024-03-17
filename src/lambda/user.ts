import { APIGatewayProxyHandler } from "aws-lambda";
import { DynamoDBService } from "../db/service";
import { UserEntity } from "../types/entities";

import { v4 as uuidv4 } from "uuid";
import { CurrencyCode } from "../types/currency";

const DEFAULT_ENTITIES_TABLE_NAME = "dev_playground-service_entities";
// TODO: try to take DB out here

export const getUserHandler: APIGatewayProxyHandler = async (event) => {
  const entitiesDB = new DynamoDBService<UserEntity>(
    process.env.ENTITIES_TABLE_NAME || DEFAULT_ENTITIES_TABLE_NAME
  );

  try {
    const id = event.pathParameters?.userId ?? "";
    const user = await entitiesDB.getItem({ id: { S: id } });

    if (!user) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "User not found" }),
      };
    }

    return { statusCode: 200, body: JSON.stringify(user) };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal Server Error" }),
    };
  }
};

export const createUserHandler: APIGatewayProxyHandler = async (event) => {
  const body = JSON.parse(event.body ?? "");

  const name = body["name"];
  const currency: CurrencyCode = body["currency"];

  const entitiesDB = new DynamoDBService<UserEntity>(
    process.env.ENTITIES_TABLE_NAME || DEFAULT_ENTITIES_TABLE_NAME
  );

  try {
    const userId = uuidv4();
    const createdAt = Date.now();

    const newUser: UserEntity = {
      id: userId,
      entityId: userId,
      createdAt,
      updatedAt: createdAt,
      entityType: "USER",
      name,
      currency,
    };

    const response = await entitiesDB.putItem(newUser);

    return { statusCode: 200, body: JSON.stringify(response) };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal Server Error" }),
    };
  }
};

export const deleteUserHandler: APIGatewayProxyHandler = async (event) => {
  const entitiesDB = new DynamoDBService<UserEntity>(
    process.env.ENTITIES_TABLE_NAME || DEFAULT_ENTITIES_TABLE_NAME
  );

  try {
    const id = event.pathParameters?.userId ?? "";
    await entitiesDB.deleteItem({ id: { S: id } });

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Successfully deleted user" }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal Server Error" }),
    };
  }
};
