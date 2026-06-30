---
name: exception-case-page-production
description: Use when the user asks to create exception-case pages, including empty-data pages and error-case pages, from Figma component markdown files or design-system component specs.
---

# Exception Case Page Production

Use this skill when the request mentions `예외케이스 페이지 제작`, `데이터없는 페이지`, `빈 상태`, `empty state`, `에러케이스 페이지`, `error case`, or automatic page generation from Figma component markdown.

## Page Type Selection

The page generator must expose two independent checkboxes:

- `데이터없는 페이지`
- `에러케이스 페이지`

Allow either one or both to be selected. When both are selected, generate separate pages or clearly separated routes/screens for each selected type unless the user asks for a combined preview.

## Workflow

1. Identify selected page types from the user's request or plugin UI state.
2. Load only the relevant reference file:
   - For `에러케이스 페이지`, read `references/error-case-page.md`.
   - For `데이터없는 페이지`, read `references/empty-state-page.md`.
3. Read the design-system markdown before generation. Search the project and plugin inputs for `design-system.md`, `design-system/*.md`, and component md files whose metadata/name includes the selected page type. For `데이터없는 페이지`, the `no data` component definition is mandatory when present.
4. If the user selected an existing screen or Figma frame, treat that selection as the base page. Duplicate/clone that selected frame and transform the duplicate into the exception state.
   - Do not draw a new approximate mockup from scratch.
   - Do not use screenshot/image analysis as the primary source of layout when Figma layer data is available.
   - Preserve the selected frame's actual layer structure, dimensions, shell, navigation, page title, tabs, table/card container, spacing, and design tokens.
   - Only mutate the parts that represent the selected exception state.
5. Select the minimum relevant Figma component markdown files from `design-system/`.
   - For `데이터없는 페이지`, always prefer component md whose name/key/category includes `no data`, `NoData`, `empty`, `EmptyState`, `blank`, or `zero state`.
   - For `에러케이스 페이지`, prefer component md whose name/key/category includes `error`, `exception`, `alert`, `failure`, or `fallback`.
6. Validate that each selected component md has metadata, props, variants, layout rules, content rules, design tokens, accessibility notes, and code-generation hints.
7. Generate the page using existing project components, design tokens, routing, and copy style.
8. Verify the generated page visually against the selected source frame and the relevant reference file.

## Hard Requirements

- The generated page must look like the selected Figma screen's exception-state variant, not like a newly invented template.
- Do not add emojis, placeholder icons, decorative circles, helper text, CTA buttons, secondary messages, or mock controls unless the matching design-system component md explicitly contains them.
- If a design-system `no data` component exists, use that component's exact icon/vector, text style, color, size, and spacing. Do not replace it with emoji or a generic icon.
- If the selected frame is a populated table/list screen and `데이터없는 페이지` is checked, keep the shell and table/list structure, set counts to zero, remove rows, and place the no-data component in the empty body.

## Component Markdown Rules

Treat Figma component markdown as the source of design intent, not as a full implementation contract. If the component md conflicts with existing code conventions, keep the codebase convention and preserve the component intent.

Prefer structured tables or YAML-like blocks for machine-readable fields. Free text is acceptable only for rationale and usage notes.

## Required Output Quality

- Do not invent decorative UI beyond the component specs.
- Keep empty states calm and action-oriented.
- Keep error states specific, recoverable when possible, and accessible.
- Do not show raw technical error details to users unless the component md explicitly allows it.
- Include analytics/event names only when the md provides or requests them.
