import { sendMessage } from "./sqs";
import minimist from "minimist";
import { appendToJSONFile, readJSONFile, closeJSONFile } from "./file";
const argsv = minimist(process.argv.slice(2));
import { Promise as BBPromise } from "bluebird";

const queueURL = argsv.queueURL;
const importFrom = argsv.input || "exportedMessages.json";
const region = argsv.region || "us-east-1";
const failedMessagesPath = argsv.failedMessagesOutput || "failedMessages.json";

const importMessages = async ({
  importFrom,
  queueURL,
  region,
}: {
  importFrom: string;
  queueURL: string;
  region: string;
}) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const messages = readJSONFile(importFrom) as any[];
  let needToCloseJSONFile = false;
  console.log("Sending messages ", messages?.length);
  await BBPromise.map(
    messages,
    async (message, index, total) => {
      if (!message.body) {
        console.log("Message missing a body", message);
      }
      try {
        await sendMessage({
          queueURL,
          region,
          messageAttributes: message.messageAttributes || {},
          messageBody: message.body,
        });
        console.log(`Send message ${index} of ${total}`);
      } catch (e) {
        console.log("Error while sending message", e.message);
        appendToJSONFile(failedMessagesPath, JSON.stringify(message));
        needToCloseJSONFile = true;
      }
    },
    { concurrency: 10 },
  );
  if (needToCloseJSONFile) {
    closeJSONFile(failedMessagesPath);
  }
  console.log("Sent all messages");
};

importMessages({ importFrom, queueURL, region });
