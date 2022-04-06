import Debug from "debug";
import { transporter } from "../config/emailTransporter";

const debug = Debug("app:sendAccountActivationToken");

export async function sendAccountActivationToken(
  from = "Enviado desde mi app",
  to: string,
  subject = "Activación de cuenta",
  token: string
) {
  try {
    await transporter.sendMail({
      from,
      to,
      subject,
      html: `El token es ${token}`,
    });
  } catch (error) {
    debug(error);
  }
}
