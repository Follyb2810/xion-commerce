import {} from "../../libs/EmailService";

export default async function sendEmailHandler(data: any) {
  const { email, subject, body } = data;
  //   await sendMail(email, subject, body);
  return "Email sent";
}
