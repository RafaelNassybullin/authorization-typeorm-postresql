import { redis } from "../../config";
import nodemailer from "nodemailer";
import { v4 } from "uuid";

//todo => send email by nodemailer
export const sendEmail = async (email: string, url: string) => {
  const account = await nodemailer.createTestAccount();
  const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: account.user,
      pass: account.pass
    }
  });
  const mailOption = {
    from: '"Rafael Nassybullin" <foo@example.com>',
    to: email,
    subject: "Hello !",
    text: "hello world",
    html: `<a href="${url}">${url}/a>`
  };
  const info = await transporter.sendMail(mailOption);
  console.log("message sent: %s", info.messageId)
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info))
}

//todo => confirmation link function
export const confirmationLink = async (userID: string | number): Promise<string> => {
  const key = v4()
  await redis.set("confirm" + key, userID, "EX", 60 * 60 * 24); //удаление из редиса спустя 1 день"
  return `http://localhost:3000/user/confirm/${key}`
}