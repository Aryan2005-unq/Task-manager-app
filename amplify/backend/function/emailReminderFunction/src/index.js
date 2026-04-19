/* Amplify Params - DO NOT EDIT
ENV
REGION
DUMMY
API_TODOAPP_GRAPHQLAPIIDOUTPUT
Amplify Params - DO NOT EDIT */

const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand } = require('@aws-sdk/lib-dynamodb');

const region = process.env.REGION || 'us-east-1';
const ses = new SESClient({ region });
const ddbClient = new DynamoDBClient({ region });
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);

exports.handler = async (event) => {
    console.log('EVENT:', JSON.stringify(event));
    
    const SENDER_EMAIL = 'aryankoli10c10@gmail.com';
    const RECIPIENT_EMAILS = [
        'aryankoli10c10@gmail.com', 
        'aryan.236107102@vcet.edu.in'
    ];

    const TABLE_NAME = 'Todo-he6jy733pnfvjau5pskavtikrq-dev';

    try {
        console.log('Scanning table:', TABLE_NAME);
        
        const scanCommand = new ScanCommand({
            TableName: TABLE_NAME,
            FilterExpression: 'attribute_exists(dueDate)'
        });
        
        const dynamoResponse = await ddbDocClient.send(scanCommand);
        const allTodos = dynamoResponse.Items || [];
        console.log('Found', allTodos.length, 'total tasks with due dates.');
        
        // Let's filter assuming simple YYYY-MM-DD
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];
        
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];
        
        const dueTasks = allTodos.filter(task => {
           return task.dueDate === todayStr || task.dueDate === tomorrowStr; 
        });

        if (dueTasks.length === 0) {
            console.log('No upcoming tasks due. Skipping emails.');
            return { statusCode: 200, body: JSON.stringify('No active tasks. Reminder skipped.') };
        }

        let taskListText = 'Hello!\n\nThis is your automated reminder from the AI Todo App. You have the following tasks due soon:\n\n';
        
        // Loop through due tasks and group them. We are just sending them all to the test emails.
        for (const task of dueTasks) {
            const name = task.title || task.name || task.description || 'Unnamed Task';
            const date = task.dueDate || 'Unknown Date';
            taskListText += '- ' + name + ' (Due: ' + date + ')\n';
        }

        taskListText += '\nStay productive!';

        const command = new SendEmailCommand({
            Destination: { ToAddresses: RECIPIENT_EMAILS },
            Message: {
                Body: { Text: { Data: taskListText } },
                Subject: { Data: 'Daily Task Reminder' }
            },
            Source: SENDER_EMAIL
        });

        await ses.send(command);
        console.log('Emails sent successfully!');
        
    } catch (error) {
        console.error('Error executing reminder cron:', error);
    }

    return { statusCode: 200, body: JSON.stringify('Reminder cycle completed.') };
};
