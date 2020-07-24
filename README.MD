
# AWS SQS Import/Export
Exports tasks from SQS to a local JSON file.
Can recreate (import) the tasks to another SQS.
Useful for sending a small number (<5k) tasks from Dead Letter Queues for reprocessing.


## Usage
Export
```
npx ts-node --transpile-only src/export_messages.ts --queueURL=https://sqs.us-east-1.amazonaws.com/580675232539/people-events-production-DLQ --removeMessages=true
```
Import
```
npx ts-node --transpile-only src/import_messages.ts --queueURL=https://sqs.us-east-1.amazonaws.com/580675232539/create-step-tasks-production 
```

## Options
Common command line options:
- `queueURL`: *Required*. Queue to export/import tasks. For example: `https://sqs.us-east-1.amazonaws.com/580675232539/create-step-tasks-production`
- `region`: *Optional*. Defaults to `us-east-1`.

Export options:
- `saveTo`: *Optional*. File to export messages to. Defaults to `exportedMessages.json`.
- `removeMessages`: *Optional*. Whether to remove messages from the queue after exporting them. Defaults to `false`.

Import options:
- `importFrom`: *Optional*. File to get messages from. Defaults to `exportedMessages.json`.
- `failedMessagesPath`: *Optional*. Store messages that failed to be sent to SQS in this file. Defaults to `failedMessages.json`.
