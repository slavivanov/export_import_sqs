import { exportMessagesFromSQS, deleteMessagesFromSQS } from "./sqs";
import minimist from "minimist";
import { appendToJSONFile, removeFile, closeJSONFile } from "./file";
const argsv = minimist(process.argv.slice(2));

const queueURL = argsv.queueURL;
const region = argsv.region || "us-east-1";
const saveTo = argsv.output || "exportedMessages.json";

const removeMessages = argsv.removeMessages === "true" ? true : false;

export const exportAll = async ({
  saveTo,
  queueURL,
}: {
  saveTo: string;
  queueURL: string;
}) => {
  let total = 0;
  removeFile(saveTo);
  do {
    const messages = await exportMessagesFromSQS({ queueURL, region });
    if (messages?.length) {
      messages.map((message) => {
        appendToJSONFile(
          saveTo,
          JSON.stringify({
            body: message.body,
            messageAttributes: message.messageAttributes,
          }),
        );
      });
      if (removeMessages) {
        const messagesToDelete = messages.map((message) => ({
          Id: message.messageId,
          ReceiptHandle: message.receiptHandle,
        }));
        deleteMessagesFromSQS({ queueURL, region, messages: messagesToDelete });
        console.log("Removed ", messagesToDelete.length);
      }
      total += messages.length;
      console.log("Exported ", messages.length, " Total ", total);
    } else {
      console.log("No more messages");
      closeJSONFile(saveTo);
      return;
    }
    // eslint-disable-next-line no-constant-condition
  } while (true);
};

exportAll({ saveTo, queueURL });
