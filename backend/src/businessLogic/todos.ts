import { TodosAccess } from '../dataLayer/todosAccess'
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'

const todoAccess = new TodosAccess();
const logger = createLogger('Todos')

// TODO: Implement businessLogic
export async function getTodosForUser(userId: string): Promise<TodoItem[]> {
    return await todoAccess.getAllTodoItems(userId);
}

export async function createTodo(todoRequest: CreateTodoRequest, userId: string): Promise<TodoItem> {
    logger.info("[createTodo] Executed");
    logger.info("-  [TodoRequest]: ", todoRequest)
    logger.info("-  [UserId]: ", userId)
    const item: TodoItem = {
        userId,
        todoId: uuid.v4(),
        done: false,
        createdAt: new Date().toISOString(),
        ...todoRequest,
    }
    return await todoAccess.createTodoItem(item);
}

export async function updateAttachmentUrl(userId: string, todoId: string, attachmentUrl: string): Promise<string> {
    logger.info("[getSignedUrl] Executed");
    logger.info("-  [UserId]: ", userId)
    logger.info("-  [TodoId]: ", todoId)
    logger.info("-  [AttachmentUrl]: ", attachmentUrl)
    return todoAccess.updateAttachmentUrl(userId, todoId, attachmentUrl);
}

export async function updateTodo(updateTodoRequest: UpdateTodoRequest, userId: string, todoId: string): Promise<void> {
    logger.info("[updateTodoItem] Executed");
    logger.info("-  [UserId]: ", userId)
    logger.info("-  [TodoId]: ", todoId)
    logger.info("-  [UpdateTodoRequest]: ", updateTodoRequest)
    await todoAccess.updateTodoItem(updateTodoRequest, userId, todoId);
}

export async function deleteTodo(userId: string, todoId: string): Promise<void> {
    logger.info("[deleteTodoItem] Executed");
    logger.info("-  [UserId]: ", userId)
    logger.info("-  [TodoId]: ", todoId)
    await Promise.all([
        todoAccess.deleteTodoItem(userId, todoId),
        todoAccess.deleteTodoItemAttachment(todoId)
    ])
}
