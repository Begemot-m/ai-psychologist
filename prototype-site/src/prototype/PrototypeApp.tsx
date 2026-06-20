"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { OnboardingScreen } from "./screens/OnboardingScreen";
import { ModuleSelectScreen } from "./screens/ModuleSelectScreen";
import { MethodSelectScreen } from "./screens/MethodSelectScreen";
import { MainShell } from "./screens/MainShell";
import { PaywallScreen } from "./screens/PaywallScreen";
import { Toast } from "./ui";
import type { MethodItem, ModuleItem, Screen, Tab } from "./types";

export function PrototypeApp() {
  const [screen, setScreen] = useState<Screen>("onboarding");
  const [activeTab, setActiveTab] = useState<Tab>("chat");
  const [selectedModule, setSelectedModule] = useState<ModuleItem | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<MethodItem | null>(null);
  const [isPro, setIsPro] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  function showToast(message: string) {
    setToast(message);
    setTimeout(() => setToast(null), 1800);
  }

  function resetToConstructor() {
    setSelectedModule(null);
    setSelectedMethod(null);
    setScreen("module-select");
  }

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-white">
      <div className="flex items-center justify-between px-5 pb-1 pt-[max(14px,env(safe-area-inset-top))] text-[12px] font-semibold text-[#111111]/70">
        <span>9:41</span>
        <span className="text-[11px] font-medium text-[#111111]/40">AI-психолог · Mini App</span>
      </div>

      <div className="relative flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {screen === "onboarding" && (
            <motion.div
              key="onboarding"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0"
            >
              <OnboardingScreen onDone={() => setScreen("module-select")} />
            </motion.div>
          )}

          {screen === "module-select" && (
            <motion.div
              key="module-select"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="absolute inset-0"
            >
              <ModuleSelectScreen
                onSelect={(module) => {
                  setSelectedModule(module);
                  setScreen("method-select");
                }}
                onLocked={() => setShowPaywall(true)}
              />
            </motion.div>
          )}

          {screen === "method-select" && (
            <motion.div
              key="method-select"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="absolute inset-0"
            >
              <MethodSelectScreen
                onSelect={(method) => {
                  setSelectedMethod(method);
                  setActiveTab("chat");
                  setScreen("main");
                }}
                onLocked={() => setShowPaywall(true)}
                onBack={() => setScreen("module-select")}
              />
            </motion.div>
          )}

          {screen === "main" && selectedModule && selectedMethod && (
            <motion.div
              key="main"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="absolute inset-0"
            >
              <MainShell
                activeTab={activeTab}
                onTabChange={setActiveTab}
                moduleTitle={selectedModule.title}
                methodTitle={selectedMethod.title}
                isPro={isPro}
                onPaywall={() => setShowPaywall(true)}
                onReset={resetToConstructor}
                onShowToast={showToast}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showPaywall && (
            <motion.div
              key="paywall"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.32, ease: "easeOut" }}
              className="absolute inset-0 z-40 bg-white"
            >
              <PaywallScreen
                isPro={isPro}
                onSubscribe={() => {
                  setIsPro(true);
                  setShowPaywall(false);
                }}
                onClose={() => setShowPaywall(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <Toast message={toast} />
      </div>
    </div>
  );
}
