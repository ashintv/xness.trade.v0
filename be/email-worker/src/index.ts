import { createClient } from "redis";
const client = createClient({ url: "redis://localhost:6370" });
import nodemailer from "nodemailer";
import { getTemplate } from "./constants";
import dotenv from "dotenv";

dotenv.config();

const mailer = nodemailer.createTransport({
	host: "smtp.example.com",
	port: 587,
	secure: false,
	service: "gmail",
	auth: {
		user: process.env.APP_EMAIL!,
		pass: process.env.APP_PASSWORD!,
	},
});

async function SendMail(data: { email: string; message: string ,balance: { usd_balance: number; locked_balance: number; } , type: string , orderId: string }) {
    const text = getTemplate({
        username: data.email.split("@")[0],
        notification: {
            message: data.message,
            email: data.email,
            balance: data.balance
        }
    });
	await mailer.sendMail({
		from: process.env.APP_EMAIL!,
		to: data.email,
		html: text,
	});
    console.log("Email sent to ",data.email);
}   

async function Worker() {
	while (1) {
		const res = await client.xReadGroup(
			"email_workers",
			"email_worker-1",
			{
				key: "email_queue",
				id: ">",
			},
			{ COUNT: 1, BLOCK: 0 }
		);

		if (res && Array.isArray(res) && res.length > 0) {
			//@ts-ignore
			for (const r of res[0]?.messages) {
				console.log(r.message.data);
				await SendMail(JSON.parse(r.message.data));
				await client.xAck("email_queue", "email_worker-1", r.id);
			}
		}
	}
}

async function main() {
	await client.connect();
	console.log("Connected to Redis starting worker");
	Worker();
}

main();
