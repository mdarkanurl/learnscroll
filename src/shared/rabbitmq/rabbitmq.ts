import amqplib from "amqplib";
import { env } from "#configs";
import { startEmailConsumer } from "#queue";

export const sendEmailQueue = "sendEmail";
export const sendEmailDLQ = "sendEmail.dlq";
export const sendEmailDLX = "sendEmail.dlx";

let conn: amqplib.ChannelModel;
let reconnecting = false;

export let producerChannel: amqplib.ConfirmChannel;
export let consumerChannel: amqplib.Channel;

export let rabbitMqConnectedAt: Date | null = null;

export const rabbitmq = async () => {
  try {
    const rabbitMqUrl = new URL(env.rabbitmqUrl);

    rabbitMqUrl.searchParams.set(
      "heartbeat",
      "30"
    );

    conn = await amqplib.connect(rabbitMqUrl.toString());

    rabbitMqConnectedAt = new Date();

    conn.on("error", (err) => {
      console.error("RabbitMQ error:", err);
    });

    conn.on("close", () => {
      console.error("RabbitMQ closed");
      rabbitMqConnectedAt = null;
      if (reconnecting) return;
      reconnecting = true;
      setTimeout(async () => {
        try {
          await rabbitmq();
        } finally {
          reconnecting = false;
        }
      }, 5000);
    });

    producerChannel = await conn.createConfirmChannel();
    consumerChannel = await conn.createChannel();

    await producerChannel.assertExchange(
      sendEmailDLX,
      "direct",
      {
        durable: true,
      }
    );

    await producerChannel.assertQueue(
      sendEmailDLQ,
      {
        durable: true,
      }
    );

    await producerChannel.bindQueue(
      sendEmailDLQ,
      sendEmailDLX,
      "dlq"
    );

    await producerChannel.assertQueue(
      sendEmailQueue,
      {
        durable: true,
        arguments: {
          "x-dead-letter-exchange":
            sendEmailDLX,

          "x-dead-letter-routing-key":
            "dlq",

          "x-max-length": 100000,

          "x-message-ttl":
            1000 * 60 * 60 * 24,
        },
      }
    );

    console.log("RabbitMQ connected");

    // Start consumers
    await startEmailConsumer(consumerChannel);
  } catch (err) {
    console.error("RabbitMQ startup failed:", err);
    setTimeout(rabbitmq, 5000);
  }
};

const shutdown = async () => {
  try {
    await producerChannel?.close();
    await consumerChannel?.close();
    await conn?.close();
  } catch (err) {
    console.error(err);
  }

  process.exit(0);
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
