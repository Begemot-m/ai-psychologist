"use client";

import { AnimatePresence, motion } from "framer-motion";
import { TabBar } from "../TabBar";
import { ChatScreen } from "./ChatScreen";
import { ProgramsScreen } from "./ProgramsScreen";
import { ProfileScreen } from "./ProfileScreen";
import type { Tab } from "../types";

export function MainShell({
  activeTab,
  onTabChange,
  moduleTitle,
  methodTitle,
  isPro,
  onPaywall,
  onReset,
  onShowToast,
}: {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  moduleTitle: string;
  methodTitle: string;
  isPro: boolean;
  onPaywall: () => void;
  onReset: () => void;
  onShowToast: (message: string) => void;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="relative flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0"
          >
            {activeTab === "chat" && (
              <ChatScreen
                moduleTitle={moduleTitle}
                methodTitle={methodTitle}
                isPro={isPro}
                onPaywall={onPaywall}
                onReset={onReset}
              />
            )}
            {activeTab === "programs" && <ProgramsScreen isPro={isPro} onLocked={onPaywall} />}
            {activeTab === "profile" && <ProfileScreen isPro={isPro} onShowToast={onShowToast} />}
          </motion.div>
        </AnimatePresence>
      </div>
      <TabBar active={activeTab} onChange={onTabChange} />
    </div>
  );
}
