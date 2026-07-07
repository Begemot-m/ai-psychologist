import type { LucideIcon } from "lucide-react";

export type Screen =
  | "onboarding"
  | "module-select"
  | "method-select"
  | "main";

export type Tab = "chat" | "programs" | "profile";

export interface OnboardingIntroSlide {
  kind: "intro";
  icon: LucideIcon;
  title: string;
  text: string;
}

export interface OnboardingCompareSlide {
  kind: "compare";
  title: string;
  subtitle: string;
  cons: string[];
  pros: string[];
  privacyNote: string;
}

export interface OnboardingFeature {
  icon: LucideIcon;
  title: string;
  text: string;
}

export interface OnboardingFeaturesSlide {
  kind: "features";
  title: string;
  subtitle: string;
  features: OnboardingFeature[];
}

export type OnboardingSlide =
  | OnboardingIntroSlide
  | OnboardingCompareSlide
  | OnboardingFeaturesSlide;

export interface ModuleItem {
  id: string;
  title: string;
  icon: LucideIcon;
  free: boolean;
}

export interface MethodItem {
  id: string;
  title: string;
  description: string;
  free: boolean;
}

export type ChatMessageRole = "assistant" | "user";

export interface ChatMessage {
  id: string;
  role: ChatMessageRole;
  text: string;
}

export interface ChatIntent {
  id: string;
  keywords: string[];
  reply: string;
}

export interface ProgramDay {
  title: string;
  done: boolean;
}

export interface ProgramItem {
  id: string;
  title: string;
  description: string;
  free: boolean;
  progress: number;
  days: ProgramDay[];
}

export interface PlanFeature {
  label: string;
  free: boolean;
  premium: boolean;
}
