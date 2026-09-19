# RollCall Builds 1–4

Expo Router foundation, reusable design system, adaptive application shell, and the Build 3 authentication client for RollCall. Product dashboards, role interfaces, attendance, camera, reports, notifications, and settings remain intentionally out of scope.

Build 4 adds the lecturer-only operational flow: assigned classes, class details, roster and student attendance context, attendance setup and method selection, functional manual marking and review, submission, session history, and permitted correction. Face attendance remains an explicit placeholder; no camera or biometric processing is included.

## Included

- Centralized brand and semantic color tokens
- Light and dark themes with system preference support
- Typography, spacing, sizing, radius, elevation, icon, motion, and breakpoint tokens
- Responsive and safe-area utilities
- Buttons, inputs, information, navigation, feedback, permission, privacy, and global-state primitives
- Attendance status and recognition visual primitives
- One internal design-system playground at `/design-system-preview`
- Adaptive shell with phone bottom navigation, tablet rail, and large-screen sidebar
- Configuration-driven role and permission navigation filtering
- Compact headers and compact, standard, detail, and full-width page containers
- Keyboard-aware scrolling and safe-area-aware fixed action regions
- Global toast, alert, confirmation, sheet, and loading overlay host
- Internal shell preview at `/shell-preview`
- Protected-route gate and modal-route foundation
- Login, secure token persistence, session restoration, protected routing, and logout
- Authenticated role and college tenant context from the backend

## Run

```bash
npm install
npx expo start
```

Copy `.env.example` to `.env` and set `EXPO_PUBLIC_API_URL` to the backend origin. A physical device must use the development computer's LAN address instead of `127.0.0.1`. Use Expo Go first for iOS and Android development, or `npm run web` for the browser client.

## Verify

```bash
npx tsc --noEmit
npm run lint
npx expo export --platform web
```
