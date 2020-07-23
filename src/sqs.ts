import SQS from "aws-sdk/clients/SQS";
import debugFactory from "debug";
import * as _ from "lodash";
const debug = debugFactory("read_messages");

let sqs: SQS | undefined;
const getSQS = (region?: string) => {
  if (!sqs) {
    sqs = new SQS({
      apiVersion: "2012-11-05",
      region: region || "us-east-1",
    });
  }
  return sqs;
};

const checkQueueURL = (queueURL: string) => {
  if (!queueURL) {
    throw new Error("Missing Queue URL");
  }
  debug(`Exporting messages from queue ${queueURL}`);
};

export const exportMessagesFromSQS = async ({
  queueURL,
  region,
}: {
  queueURL: string;
  region?: string;
}) => {
  checkQueueURL(queueURL);
  const sqs = getSQS(region);
  const { Messages: messages } = await sqs
    .receiveMessage({
      QueueUrl: queueURL,
      MaxNumberOfMessages: 10,
      MessageAttributeNames: ["All"],
      VisibilityTimeout: 600, // 43200, // 12 hours
    })
    .promise();
  debug("Received messages", messages);
  return (messages || []).map((message) => ({
    messageId: message.MessageId,
    receiptHandle: message.ReceiptHandle,
    body: message.Body,
    messageAttributes: message.MessageAttributes,
  }));
};

export const deleteMessagesFromSQS = async ({
  queueURL,
  region,
  messages,
}: {
  queueURL: string;
  region?: string;
  messages: SQS.DeleteMessageBatchRequestEntryList;
}) => {
  checkQueueURL(queueURL);
  const sqs = getSQS(region);
  await sqs
    .deleteMessageBatch({
      QueueUrl: queueURL,
      Entries: messages,
    })
    .promise();
  debug("Deleted messages", messages);
};

export const sendMessage = async ({
  queueURL,
  region,
  messageAttributes,
  messageBody,
}: {
  queueURL: string;
  region?: string;
  messageBody: string;
  messageAttributes: SQS.MessageBodyAttributeMap;
}) => {
  checkQueueURL(queueURL);
  const sqs = getSQS(region);

  const formatted = formatMessageAttributes(messageAttributes);
  const response = await sqs
    .sendMessage({
      QueueUrl: queueURL,
      MessageBody: messageBody,
      MessageAttributes: formatted,
    })
    .promise();
  debug(`Sent message `, response.MessageId);
};

const formatMessageAttributes = (attributes: SQS.MessageBodyAttributeMap) =>
  _.reduce(
    attributes,
    (acc, attribute, key) => {
      acc[key] = _.pick(attribute, "StringValue", "DataType", "BinaryValue");
      return acc;
    },
    {},
  );
