import { Resend } from "resend";
import amqplib from "amqplib";
import { env } from "#configs";
import { sendEmailQueue } from "#rabbitmq";
import type { SendEmailDto } from "./dto/send-email.dto";

const resend = new Resend(env.resendApiKey);
const MAX_RETRIES = 5;

export const startEmailConsumer = async ( channel: amqplib.Channel ) => {
    channel.prefetch(20);
    await channel.consume(
      sendEmailQueue,
      async (msg) => {
        if (!msg) return;
        try {
          const raw = msg.content.toString("utf-8" );
          let payload:SendEmailDto;

          try {
            payload = JSON.parse(raw);
          } catch(err) {
            console.error("Invalid JSON", err);
            channel.nack(msg, false, false );
            return;
          }

          const { email, subject, body, } = payload;
          if ( !email || !subject || !body ) {
            console.error("Invalid payload" );

            channel.nack(msg, false, false );
            return;
          }

          const retries = Number(msg.properties.headers?.["x-retries"] ?? 0);

          const { data, error } = await resend.emails.send({
            from: "ShobApp24 <shopapp24@drakilo.com>",
            to: [email],
            subject,
            html: body,
          });

          if (error) {
            console.error("Resend error:", error );

            if (retries >= MAX_RETRIES ) {
              channel.nack(msg, false, false);
              return;
            }

            channel.sendToQueue(
                sendEmailQueue,
                msg.content,
                {
                    persistent: true,
                    headers: {
                        "x-retries": retries + 1
                    }
                }
            );
            channel.ack(msg);
            return;
          }

          console.log("Email sent", {
            email,
            id: data?.id,
          } );
          channel.ack(msg);
        } catch (err) {
          console.error("Worker error:", err);

          const retries = Number(msg.properties.headers?.[ "x-retries" ] ?? 0 );

          if (retries >= MAX_RETRIES ) {
            channel.nack(msg,false, false );
            return;
          }

          channel.sendToQueue(
            sendEmailQueue,
            msg.content,
            {
              persistent: true,

              headers: {
                "x-retries":
                  retries + 1,
              },
            }
          );

          channel.ack(msg);
        }
      },
      {
        noAck: false,
      }
    );
};
