import { Bot, InlineKeyboard } from "grammy";
import { createServiceClient } from "@/lib/supabase/server";

// Плейсхолдер позволяет собрать проект без реального токена; реальные вызовы
// Telegram API при плейсхолдере вернут ошибку авторизации — это ожидаемо,
// пока в .env не положен настоящий TELEGRAM_BOT_TOKEN.
const token = process.env.TELEGRAM_BOT_TOKEN || "0:missing-telegram-bot-token";

export const bot = new Bot(token);

const MINI_APP_URL = process.env.MINI_APP_URL ?? "https://example.com";
const STARS_PRICE_30_DAYS = 199;

bot.command("start", async (ctx) => {
  await ctx.reply(
    "Привет! Это бережное психологическое сопровождение — инструмент, разработанный с психологами. Он не заменяет работу со специалистом.",
    { reply_markup: new InlineKeyboard().webApp("Открыть", MINI_APP_URL) },
  );
});

bot.command("buy", async (ctx) => {
  await ctx.replyWithInvoice(
    "Подписка на 30 дней",
    "Расширенный лимит сообщений и модель Sonnet вместо Haiku",
    String(ctx.from?.id ?? ""),
    "XTR",
    [{ label: "Подписка на 30 дней", amount: STARS_PRICE_30_DAYS }],
    { provider_token: "" },
  );
});

bot.on("pre_checkout_query", async (ctx) => {
  await ctx.answerPreCheckoutQuery(true);
});

bot.on(":successful_payment", async (ctx) => {
  const telegramId = ctx.from?.id;
  const payment = ctx.message?.successful_payment;
  if (!telegramId || !payment) return;

  const supabase = createServiceClient();
  const { data: user } = await supabase
    .from("users")
    .select("id")
    .eq("telegram_id", telegramId)
    .maybeSingle();
  if (!user) return;

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  await supabase.from("subscriptions").upsert(
    {
      user_id: user.id,
      tier: "paid",
      expires_at: expiresAt.toISOString(),
      telegram_payment_charge_id: payment.telegram_payment_charge_id,
    },
    { onConflict: "user_id" },
  );

  await ctx.reply("Спасибо! Подписка активирована на 30 дней.");
});
