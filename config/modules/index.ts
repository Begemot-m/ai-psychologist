import burnoutMatch from "./burnout_match.json";
import selfEsteemGestalt from "./self_esteem_gestalt.json";

export type ModuleApproach = "cbt" | "psychodynamic" | "gestalt" | "mix" | "art";

export type ModuleConfig = {
  id: string;
  title: string;
  description: string;
  system_prompt: string;
  allowed_techniques: string[];
  kb_namespace: string;
  ui_accent: string;
  approach: ModuleApproach;
};

export const activeModules: ModuleConfig[] = [
  burnoutMatch as ModuleConfig,
  selfEsteemGestalt as ModuleConfig,
];

export type ComingSoonModule = {
  title: string;
  description: string;
  approach: ModuleApproach;
};

export const comingSoonModules: ComingSoonModule[] = [
  { title: "Тревога", description: "Работа с тревогой и навязчивыми мыслями", approach: "psychodynamic" },
  { title: "Отношения", description: "Близость, границы и конфликты", approach: "mix" },
  { title: "Творческое самовыражение", description: "Контакт с собой через арт-терапию", approach: "art" },
];

export function getModuleById(id: string): ModuleConfig | undefined {
  return activeModules.find((m) => m.id === id);
}
