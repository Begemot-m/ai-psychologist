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

## Premium Voice Chat Iteration

The third pass removes the generic SaaS feeling from the core chat:

1. Typography moves to Playfair Display for editorial headings and Manrope for the interface. GitHub Pages uses a CSS font import fallback so the static build keeps the same identity.
2. Chat no longer exposes quick action chips or expanded action menus. The primary interaction is a natural text input with one send action.
3. The chat header is now a large Siri-like voice stage with layered morphing color fields, pulse bars, and distinct idle/thinking states.
4. The visual language is softer and more premium: warm off-white app background, glass panels, rose/lavender/sun light washes, lighter weights, and no negative letter spacing.
5. Figma now contains a visible "Premium Voice Chat" wrapper with idle, thinking, and motion-spec frames using the same Playfair + Manrope typography.

## Golden Apple Style Correction

The fourth pass corrects the identity away from beige/serif wellness and toward a Golden Apple inspired Telegram Mini App:

1. Typography moves to Golos Text for UI and Unbounded for sharp display headings.
2. Palette removes beige and uses clean off-white, black, lime-yellow, violet, and pink accents.
3. Screens gain thin graphic line fields, accent strokes, and brighter motion details.
4. The method library expands to 10 approaches: CBT, Gestalt, ACT, Schema, Mindfulness, DBT, CFT, Somatic, Narrative, and SFBT.
5. Chat now has a guided session rail: understand, stabilize, step. It leads the user without exposing command chips.
6. Telegram Mini App behavior is initialized with ready, expand, header/background color, closing confirmation, native haptics, vibration fallback, and short WebAudio click feedback.
