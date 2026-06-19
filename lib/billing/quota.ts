import { createServiceClient } from "@/lib/supabase/server";
import { MODELS } from "@/lib/llm/anthropic";

export type Tier = "free" | "paid";

const DAILY_LIMITS: Record<Tier, number> = { free: 20, paid: 300 };
const MODEL_BY_TIER: Record<Tier, string> = { free: MODELS.haiku, paid: MODELS.sonnet };

export async function checkQuota(userId: string) {
  const supabase = createServiceClient();

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("tier, expires_at")
    .eq("user_id", userId)
    .maybeSingle();

  const isPaidActive =
    subscription?.tier === "paid" &&
    (!subscription.expires_at || new Date(subscription.expires_at) > new Date());
  const tier: Tier = isPaidActive ? "paid" : "free";

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const { count } = await supabase
    .from("usage")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", startOfDay.toISOString());

  const used = count ?? 0;
  const limit = DAILY_LIMITS[tier];

  return { tier, model: MODEL_BY_TIER[tier], allowed: used < limit, used, limit };
}
