# Mini App Redesign

## Direction

Rebuild the first prototype as a frontend-only Telegram Mini App demo. The app should open without Telegram auth, backend, payment, or real AI calls. All modules, methods, programs, and premium demo states are available for free so the full path can be clicked through.

## Product Flow

The prototype path is:

1. Onboarding with four swipe/tap screens.
2. Module selection with all formats marked as free.
3. Method selection with all approaches available.
4. Main area with Chat, Programs, and Profile tabs.
5. Premium demo screen that shows mock success and returns to the app.

## Visual System

Use a light "Golden Apple" inspired interface: almost-white background, graphite text, lavender as the main accent, warm pink and soft green secondary accents, rounded cards, pill buttons, and large confident typography. Use lucide-react icons and Framer Motion for screen transitions, card entrances, typing indicators, animated accent motes, tap scaling, and mock haptic feedback.

## Implementation Notes

Keep the prototype in React state on `app/page.tsx`. Avoid API, auth, database, and payment dependencies in the demo path. Existing backend files can stay in the repo for later product stages, but the primary prototype should be self-contained and easy to run locally.
