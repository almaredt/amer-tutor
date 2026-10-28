# Amer Tutor — Design System (v1)

## Direction
The default and initial visual language is **minimal, accessible neo-brutalism**, closely referencing the existing `almaredt/wholesale-shop` storefront/admin design. This document defines the design direction for all four roles (Admin, Teacher, Parent, Student), public teacher directory, lessons, bookings and payments.

## Verified source reference
- `almaredt/wholesale-shop/app.css`: white paper surface, subtle 20px squared grid background, black typography, Roboto Mono.
- `almaredt/wholesale-shop/components/admin/admin.css`: explicitly calls its visual system “print-shop brutalist”; 2px black card borders, square corners, hard offset black shadows, accent yellow (fallback #ffec00), 24px grid background, strong focus indicators.

## Design tokens
- Paper: `#fff`; ink/borders: `#000`; muted surface: `#f6f6f3`.
- Default accent: `#ffec00` (yellow), used sparingly for primary actions, current state and focus; never as a large distracting page fill.
- Background: subtle 20–24px grid, low opacity. Avoid noisy textures in reading/exam areas.
- Corners: `0`; borders: `2px solid #000` on major cards, inputs and buttons.
- Shadows: hard `4px 4px 0 #000` for cards, larger only for prominent hero/CTA elements.
- Typeface: high-legibility sans-serif for instruction and long reading (Archivo/system); Roboto Mono for short metadata, labels and numbers. Persian/Arabic RTL fallback: Vazirmatn/Tajawal.
- Layout: generous whitespace, compact navigation, clear hierarchy, accessible contrast. Responsive mobile-first and keyboard usable.
- Motion: minimal, respect reduced-motion preferences; no distracting glitch/marquee on student study, test or payment screens.

## Role-based pages
All roles share components/tokens rather than duplicating four CSS systems. Admin uses denser tables; Teacher uses class/workflow tools; Parent uses teacher selection, bookings and child progress; Student prioritizes focused learning and assignments. Public teacher directory has clear subject/grade/level, verified status, pricing AED per 45/60 minutes, availability and a booking action. Payment forms show explicit totals and status.

## Architecture for future user-selectable themes
Implement styling through semantic CSS variables and role-independent components; keep theme ID in user preferences, with default `brutalist`. Do **not** build a theme picker or alternative themes yet. Future themes must not change permissions, data model, lesson content, accessibility or payment behavior. Avoid hard-coded colors/shadows throughout feature components; centralize in one theme layer.

## Boundaries
- Do not modify the original wholesale-shop repository; it is a visual reference only.
- Work only on amer-tutor branch `chatgptv1`. Never merge into or write to `main` without explicit authorization.
- Preserve current data and learning features; redesign progressively, with testing before deployment.
