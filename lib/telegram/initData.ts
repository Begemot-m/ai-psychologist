import { validate, parse } from "@telegram-apps/init-data-node";

export function parseAndValidateInitData(raw: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error("TELEGRAM_BOT_TOKEN is not set");
  validate(raw, token, { expiresIn: 86400 });
  return parse(raw);
}
