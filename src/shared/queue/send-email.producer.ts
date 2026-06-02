import { producerChannel, sendEmailQueue, } from "#rabbitmq";
import type { SendEmailDto } from "./dto/send-email.dto";
import { once } from "events";

export const sendEmail = async ( data: SendEmailDto) => {
  if (!producerChannel) throw new Error("Producer channel not initialized");

  const payload = JSON.stringify(data);

  const published =
    producerChannel.sendToQueue(
      sendEmailQueue,
      Buffer.from(payload),
      {
        persistent: true,
        contentType:
          "application/json",
      }
    );

  if (!published) {
    await once(
      producerChannel,
      "drain"
    );
  }

  await producerChannel.waitForConfirms();
};
