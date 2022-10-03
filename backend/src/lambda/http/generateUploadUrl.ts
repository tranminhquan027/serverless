import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import * as uuid from "uuid";
import { cors, httpErrorHandler } from 'middy/middlewares'
import {AttachmentUtils} from '../../helpers/attachmentUtils'
import {updateAttachmentUrl} from '../../helpers/todos'
import { getUserId } from '../utils'

const attachmentUtils = new AttachmentUtils();

export const handler = middy(
    async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
        const userId = getUserId(event);
        const todoId = event.pathParameters.todoId

        // TODO: Return a presigned URL to upload a file for a TODO item with the provided id
        const attachmentId = uuid.v4();
        let uploadUrl = await attachmentUtils.createAttachmentPreSignedUrl(attachmentId);
        const attachmentUrl = await attachmentUtils.getAttachmentUrl(attachmentId);
        await updateAttachmentUrl(userId, todoId, attachmentUrl);

        return {
            statusCode: 200,
            body: JSON.stringify({
                uploadUrl: uploadUrl
            })
        }
    }
)

handler
    .use(httpErrorHandler())
    .use(
        cors({
            credentials: true
        })
    )
