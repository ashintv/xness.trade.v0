"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const redis_1 = require("redis");
const client = (0, redis_1.createClient)({ url: "redis://localhost:6370" });
const nodemailer_1 = __importDefault(require("nodemailer"));
const constants_1 = require("./constants");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const mailer = nodemailer_1.default.createTransport({
    host: "smtp.example.com",
    port: 587,
    secure: false,
    service: "gmail",
    auth: {
        user: process.env.APP_EMAIL,
        pass: process.env.APP_PASSWORD,
    },
});
function SendMail(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const text = (0, constants_1.getTemplate)({
            username: data.email.split("@")[0],
            notification: {
                message: data.message,
                email: data.email,
                balance: data.balance
            }
        });
        yield mailer.sendMail({
            from: process.env.APP_EMAIL,
            to: data.email,
            html: text,
        });
        console.log("Email sent to ", data.email);
    });
}
function Worker() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        while (1) {
            const res = yield client.xReadGroup("email_workers", "email_worker-1", {
                key: "email_queue",
                id: ">",
            }, { COUNT: 1, BLOCK: 0 });
            if (res && Array.isArray(res) && res.length > 0) {
                //@ts-ignore
                for (const r of (_a = res[0]) === null || _a === void 0 ? void 0 : _a.messages) {
                    console.log(r.message.data);
                    yield SendMail(JSON.parse(r.message.data));
                    yield client.xAck("email_queue", "email_worker-1", r.id);
                }
            }
        }
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        yield client.connect();
        console.log("Connected to Redis starting worker");
        Worker();
    });
}
main();
