// dynamoDBService.ts
import {
  AttributeValue,
  DeleteItemCommand,
  DeleteItemCommandInput,
  GetItemCommand,
  GetItemCommandInput,
} from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  QueryCommand,
  QueryCommandInput,
  PutCommand,
  PutCommandInput,
} from "@aws-sdk/lib-dynamodb";
import { dynamoDBClient } from "./client";

export class DynamoDBService<T extends Record<string, any>> {
  private client: DynamoDBDocumentClient;
  private tableName: string;

  constructor(tableName: string) {
    this.client = dynamoDBClient;
    this.tableName = tableName;
  }

  getItem = async (key: Record<string, AttributeValue>): Promise<T | null> => {
    const params: GetItemCommandInput = {
      TableName: this.tableName,
      Key: key,
    };

    try {
      const command = new GetItemCommand(params);
      const { Item } = await this.client.send(command);

      if (!Item) {
        return null;
      }

      return Item as T;
    } catch (error) {
      console.error("Error on get item:", error);
      throw error;
    }
  };

  putItem = async (item: T): Promise<T> => {
    const params: PutCommandInput = {
      TableName: this.tableName,
      Item: item as T,
    };

    try {
      const command = new PutCommand(params);
      const response = await this.client.send(command);
      return response.Attributes as T;
    } catch (error) {
      console.error("Error on put item:", error);
      throw error;
    }
  };

  deleteItem = async (key: Record<string, AttributeValue>): Promise<void> => {
    const params: DeleteItemCommandInput = {
      TableName: this.tableName,
      Key: key,
    };

    try {
      const command = new DeleteItemCommand(params);
      await this.client.send(command);
      console.log(`Item successfully deleted from table ${this.tableName}.`);
    } catch (error) {
      console.error("Error on delete item:", error);
      throw error;
    }
  };

  queryItems = async <T>(params: QueryCommandInput): Promise<T[]> => {
    const command = new QueryCommand({
      ...params,
      TableName: this.tableName,
    });

    try {
      const response = await this.client.send(command);
      return response.Items as T[];
    } catch (error) {
      console.error("Error on query items:", error);
      throw error;
    }
  };
}
