import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

// TODO: Implement the dataLayer logic
export class TodosAccess {
    constructor(
        private readonly docClient: DocumentClient = new AWS.DynamoDB.DocumentClient(),
        private readonly s3 = new XAWS.S3({signatureVersion: "v4"}),
        private readonly todosTable = process.env.TODOS_TABLE,
        private readonly bucketName = process.env.ATTACHMENT_S3_BUCKET,
    ) {}

    async getAllTodoItems(userId: string): Promise<TodoItem[]> {
        logger.info("[getAllTodoItems] Executed");
        const result = await this.docClient.query({
            TableName: this.todosTable,
            KeyConditionExpression: "userId = :userId",
            ExpressionAttributeValues: {
                ":userId": userId
            }
        }).promise();

        const items = result.Items;
        logger.info("[result]: ", items);
        return items as TodoItem[];
    }

    async createTodoItem(todoItem: TodoItem): Promise<TodoItem> {
        logger.info("[createTodoItem] Executed");
        await this.docClient.put({
            TableName: this.todosTable,
            Item: {
                ...todoItem
            }
        }).promise();
        logger.info("[result]: ", todoItem);
        return todoItem;
    }

    async updateAttachmentUrl(userId: string, todoId: string, uploadUrl: string): Promise<string> {
        logger.info("[updateAttachmentUrl] Executed");
        await this.docClient.update({
            TableName: this.todosTable,
            Key: {
                "userId": userId,
                "todoId": todoId
            },
            UpdateExpression: "set attachmentUrl = :attachmentUrl",
            ExpressionAttributeValues: {
                ":attachmentUrl": uploadUrl.split("?")[0]
            }
        }).promise();
        logger.info("[result]: ", uploadUrl);
        return uploadUrl;
    }

    async updateTodoItem(updateTodoRequest: TodoUpdate, userId: string, todoId: string): Promise<void> {
        logger.info("[updateTodoItem] Executed");
        await this.docClient.update({
            TableName: this.todosTable,
            Key: {
                "userId": userId,
                "todoId": todoId
            },
            UpdateExpression: "set #name = :name, dueDate = :duaDate, done = :done",
            ExpressionAttributeValues: {
                ":name": updateTodoRequest.name,
                ":duaDate": updateTodoRequest.dueDate,
                ":done": updateTodoRequest.done
            },
            ExpressionAttributeNames: {
                "#name": "name"
            }
        }).promise();
    }

    async deleteTodoItem(userId: string, todoId: string): Promise<void> {
        logger.info("[deleteTodoItem] Executed");
        await this.docClient.delete({
            TableName: this.todosTable,
            Key: {
                "userId": userId,
                "todoId": todoId
            }
        }).promise();
    }

    async deleteTodoItemAttachment(bucketKey: string): Promise<void> {
        logger.info("[deleteTodoItemAttachment] Executed");
        await this.s3.deleteObject({
            Bucket: this.bucketName,
            Key: bucketKey
        }).promise();
    }
}
