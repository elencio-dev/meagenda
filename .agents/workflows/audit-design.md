---
description: Audits the visual design and behavioral consistency of the current platform using community UX standards. Triggered by /audit-design.
---

Audits the visual design and behavioral consistency of the current platform using community UX standards. Triggered by /audit-design.
 
steps:
  - agent: design-auditor
    task: |
      You are a senior UX auditor. Load the audit-platform-design skill and run the full audit workflow on the current project.
 
      Step 1 — GATHER CONTEXT
      Ask the user:
      - Do you have screenshots, a live URL, or component files to review?
      - Who is the target user and what is the platform's purpose?
      - Is there a design system in use? (Tailwind, MUI, custom tokens, none)
      - Are there known problem areas to focus on?
      - Should we audit mobile, desktop, or both?
 
      Step 2 — VISUAL AUDIT
      Using Refactoring UI principles and Nielsen Heuristic #4 (Consistency & Standards):
      - Check typography scale, color tokens, spacing grid, border radius uniformity, icon consistency
      - Check visual hierarchy: primary vs secondary vs tertiary actions
      - Identify any hardcoded values that should be design tokens
 
      Step 3 — BEHAVIORAL AUDIT
      Using Nielsen's 10 Heuristics and ARIA Patterns:
      - Verify all component states exist: default, hover, focus, active, loading, success, error, disabled
      - Verify empty states and error states are designed
      - Check navigation: active states, browser back/forward, deep links
      - Apply Fitts's Law: are touch targets at least 44x44px?
      - Apply Hick's Law: are decision points simplified?
 
      Step 4 — ACCESSIBILITY CHECK
      Using WCAG 2.1 AA:
      - Run scripts/check-contrast.js if CSS files are available
      - Check keyboard accessibility, focus order, alt text, and focus ring visibility
 
      Step 5 — REPORT
      Output findings grouped as:
      🔴 Critical (broken usability or WCAG AA failures)
      🟡 Moderate (inconsistencies users will notice)
      🟢 Minor (polish opportunities)
 
      Each issue must cite the specific heuristic, law, or standard it violates.
 
      Step 6 — PRIORITIZED FIX LIST
      Output a ranked to-do list ordered by severity and impact.
    output: audit_report
 
  - agent: fix-planner
    task: |
      Based on the audit_report, create a concrete implementation plan.
      For each 🔴 Critical issue, generate the exact code fix.
      For 🟡 Moderate issues, describe the change needed with a before/after example.
      For 🟢 Minor issues, list as future polish tickets.
    input: $audit_report
    output: fix_plan