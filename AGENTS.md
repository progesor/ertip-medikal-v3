# Ertip Medikal B2B Portal - AI Agent Guidelines

Welcome, Jules! You are assisting with a highly advanced Next.js 15 and Payload CMS 3.0 monorepo for a medical device manufacturer.

## 🏗️ Architecture & Boundaries (CRITICAL)
- **Hybrid Routing:** We use a Hybrid Headless approach. Dynamic content pages are routed through `src/app/(website)/[slug]/page.tsx` using Payload's Page Builder.
- **Locked Routes:** NEVER attempt to convert `/urunler` (Product Catalog) or `/teklif-sepeti` (B2B Quote Cart) into dynamic CMS blocks. They must remain static app routes due to complex state management (`useCart` context) and search parameters.
- **Server vs. Client Components:** Next.js 15 App Router is strictly enforced. Keep components as Server Components by default. Only use `"use client"` at the lowest possible leaf nodes (e.g., interactive buttons, forms, or context consumers).

## 🎨 Styling & Theming
- We use **Tailwind CSS** and **Shadcn UI**.
- **Future-Proofing for CMS Theming:** We plan to control CSS (colors, border radii) from the Payload Admin panel in the future. Therefore, prioritize using CSS variables (e.g., `bg-background`, `text-primary`) in `tailwind.config.ts` and `globals.css` rather than hardcoded hex values (like `bg-[#1a2b3c]`).

## 🧹 Refactoring Goals
- Keep code DRY.
- Centralize scattered types and interfaces into a dedicated `src/types` directory.
- Ensure all Payload CMS Collections and Blocks are neatly organized in `src/collections` and `src/blocks`.
- Do not alter the functional logic of the `QuoteRequests` or `DownloadLogs` collections; they are strictly aligned with medical MDR compliance.