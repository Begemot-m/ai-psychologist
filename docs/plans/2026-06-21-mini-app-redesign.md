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

## Wow Iteration

The second pass focuses on the "better and safer than a generic GPT chat" feeling:

1. Onboarding now explains that the assistant asks before advising, avoids sycophancy, and is designed around psychologist-reviewed support patterns.
2. Bot construction starts with a five-step intake so the user feels their situation is being understood before any method is chosen.
3. Module and method selection use horizontal carousels with expanded descriptions, best-fit guidance, tags, outcomes, and first questions.
4. Chat uses a Siri-like animated voice orb and a live thinking panel instead of a human avatar, with compact layout that fits the mobile viewport.
5. Programs start with a meditation timer card, animated progress, and expanded program plans with concrete steps and infographic-like metadata.
6. Micro-haptics are attached to taps where supported, while Framer Motion handles smooth tap, entrance, and state animations.
