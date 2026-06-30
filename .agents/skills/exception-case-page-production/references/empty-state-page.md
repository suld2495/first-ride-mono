# Empty State Page Reference

Use this reference when creating `데이터없는 페이지`.

## Purpose

An empty-data page explains that the current view has no records, results, content, or configured items. It should help the user understand whether this is expected, temporary, filter-caused, permission-related, or requires an action.

## Figma Plugin Flow

When the flow is `select an existing Figma screen -> 페이지제작 -> 예외케이스 -> 예외케이스페이지제작 -> 데이터없는페이지 checked -> 페이지제작`, produce a no-data version of the selected screen.

This is a transformation task, not a freeform generation task. Do not create a new unrelated blank page and do not redraw a rough mockup. Duplicate the selected Figma frame and transform the duplicate into its zero-data state:

- Preserve the original app frame, top bar, sidebar, selected navigation item, project selector, page title, tabs, filters, table/list container, column headers, spacing, colors, and scroll affordance.
- Change data count values to `0`.
- Remove repeated data rows, thumbnails, status chips, row actions, and per-row controls.
- Keep table/list headers visible when the original selected screen is a table/list.
- Place the no-data component inside the empty body area of the existing table/list/card container.
- Use the design-system `no data` component type when available before falling back to generic `EmptyState`.
- Match the no-data component's icon, text style, color, and placement from its Figma component md.
- Do not add CTA buttons, secondary descriptions, badges, search hints, or helper copy unless the selected `no data` component md explicitly defines them.
- Do not use emoji as an icon. Use the vector/icon/component defined in the design system.

## Mandatory Implementation Algorithm

For Figma plugin implementation, follow this order:

1. Get the currently selected Figma frame.
2. Duplicate that frame and rename the duplicate with a no-data suffix, for example `위험 알림 목록 / 데이터 없음`.
3. Load/read the design-system markdown and find the `no data` component definition first.
4. Locate the selected screen's count text and set numeric counts to `0`.
5. Locate repeated data rows in the main list/table body and remove or hide those row layers.
6. Preserve the table/list header row.
7. Insert the design-system `no data` component instance inside the remaining table/list body area.
8. Center the inserted no-data component within the table/list body, not the whole viewport.
9. Remove only controls that the target no-data design omits, such as row-dependent filters or row actions.
10. Do a visual pass against the selected frame and the target no-data behavior.

Image or screenshot analysis may be used only as a fallback to infer labels when layer names/text are unavailable. It must not be used to invent a new layout.

Reference target behavior from the risk alert example:

| selected populated screen | generated no-data screen |
|---|---|
| Page title remains `위험 알림 목록` | Page title remains `위험 알림 목록` |
| Count `전체 24` | Count `전체 0` |
| Risk tabs remain visible | Risk tabs remain visible |
| Date/camera/category filters are present in the populated list | Remove them for the target risk-alert no-data page shown in the reference |
| Table headers remain visible | Table headers remain visible |
| Data rows are removed | Body shows centered design-system no-data icon and copy |
| Row-level status/report buttons are removed | No row-level controls |
| Populated row thumbnails and chips are removed | Empty white body remains |
| No CTA exists in the reference | Do not add CTA |
| No secondary helper sentence exists in the reference | Do not add secondary helper sentence |

## Required Figma Component Data

### 1. Identity

Each component md must include:

| field | required | purpose |
|---|---:|---|
| `component_name` | yes | Human-readable component name |
| `component_key` | yes | Stable machine key |
| `figma_node_id` | yes | Source Figma node |
| `category` | yes | empty-state, feedback, layout, action |
| `status` | yes | draft, beta, stable, deprecated |
| `platforms` | yes | web, mobile, admin, etc. |

### 2. Empty State Taxonomy

Empty-data pages need a normalized taxonomy:

| empty_id | cause | user_context | primary_action | secondary_action |
|---|---|---|---|---|
| `first_use` | User has not created anything yet | New user or untouched feature | Create item | Learn more |
| `no_results` | Search/filter returned no matches | User applied query/filter | Clear filters | Adjust search |
| `deleted_or_archived` | Items were removed or hidden | List had content before | View archive | Create item |
| `not_configured` | Required setup is missing | Admin or owner setup needed | Configure | Contact admin |
| `permission_limited` | User cannot see data due to role | Data may exist but is hidden | Request access | Go back |
| `sync_pending` | Data is not imported yet | Integration/import delay | Refresh | Check integration |

### 3. Required Components

For reliable generation, collect md data for these component classes:

| component class | required | examples |
|---|---:|---|
| Empty state container | yes | `NoDataState`, `NoData`, `EmptyState`, `BlankState` |
| Illustration or icon | yes | Empty box, search, lock, setup, sync |
| Typography | yes | Page title, description, helper text |
| Primary action | conditional | Create, clear filters, configure, refresh |
| Secondary action | optional | Learn more, go back, contact admin |
| Layout shell | yes | AppShell, Page, Section, TableShell |
| Filter/search controls | conditional | Needed for `no_results` |
| Permission/access component | conditional | Needed for `permission_limited` |

### No Data Component Priority

When multiple component md files match, choose in this order:

1. Component explicitly categorized as `no data`.
2. Component named `NoData`, `NoDataState`, or Korean equivalent such as `데이터 없음`.
3. Component variant named `empty`, `zero`, `no-results`, or `blank`.
4. Generic `EmptyState` component.

The chosen component md should define the default no-data copy. If it does not, derive copy from the selected screen's page title and object type.

Required matching behavior:

- If the design-system md has a `no data` component type, it wins over any generic empty-state pattern.
- If the design-system md defines only one short message, render only that one message.
- If the design-system md defines an icon/vector, reuse that icon/vector exactly.
- If the design-system md has no CTA prop/value, render no CTA.

### 4. Props and Variants

Required prop table:

| prop | type | required | default | notes |
|---|---|---:|---|---|
| `title` | string | yes | none | Clear state summary |
| `description` | string | yes | none | Explain why it is empty and what to do |
| `emptyType` | enum | yes | none | first_use, no_results, etc. |
| `illustration` | token/string | conditional | by type | Required unless style says icon-only |
| `primaryActionLabel` | string | conditional | none | Required when user can take next action |
| `secondaryActionLabel` | string | no | none | Optional fallback |
| `showClearFilters` | boolean | conditional | false | Required for search/filter no-results |
| `supportLink` | string | no | none | For permission or setup issues |

Required variants:

| variant | required | notes |
|---|---:|---|
| `page` | yes | Whole page/list is empty |
| `section` | yes | One region is empty |
| `table` | conditional | Empty table body with preserved header |
| `search` | conditional | No results after search/filter |
| `permission` | conditional | Data hidden by permissions |
| `compact` | conditional | Dashboard widgets or side panels |

### 5. Layout Rules

Include:

- Whether the app shell, page title, tabs, filters, or table headers remain visible.
- Container width and vertical position.
- Illustration/icon size.
- Button grouping and wrapping.
- Whether empty state sits inside table body, content area, or full page.
- Mobile stacking behavior.

For table/list no-data pages:

- Preserve the table/list container dimensions from the selected screen.
- Keep column headers at the top of the container.
- Center the no-data component in the remaining body area, not in the whole app viewport.
- Do not show pagination, row menus, report/download actions, or status dropdowns unless the selected no-data component md explicitly includes them.
- Keep the active nav item and selected tab state exactly as in the selected source screen.
- For the risk-alert list target, remove the populated-state date picker and camera/category dropdown filters so the top area matches the no-data reference.

### 6. Content Rules

Include:

- Title should identify the missing object: requests, users, routines, reports.
- Description should distinguish first-use emptiness from no-results emptiness.
- CTA must map to the next useful action.
- Avoid blaming the user.
- Avoid vague copy like "Nothing here" unless brand voice explicitly permits it.

For Korean admin/list screens, prefer concise object-specific copy:

| page object | preferred no-data copy |
|---|---|
| 위험 알림 | `위험 알림이 없어요.` |
| 비계 점검 | `점검 내역이 없어요.` |
| 현장 사진 | `현장 사진이 없어요.` |
| 회사 | `등록된 회사가 없어요.` |
| 프로젝트 | `등록된 프로젝트가 없어요.` |

### 7. Design Tokens

Include:

| token group | examples |
|---|---|
| color | surface, text primary/secondary, border, action |
| typography | title, description, helper |
| spacing | illustration gap, text gap, action gap |
| icon/illustration | size, color, asset key |
| radius | container if framed |

### 8. Accessibility

Include:

- Heading level.
- Button labels that describe the action.
- Screen-reader text for illustration only when meaningful.
- Keyboard order.
- Contrast requirement.
- Focus behavior after filters are cleared or data is created.

### 9. Code Generation Hints

Include:

| field | required | purpose |
|---|---:|---|
| `preferred_component` | yes | Empty-state component to instantiate |
| `import_path` | yes | Code import path |
| `layout_wrapper` | yes | App shell or page wrapper |
| `dependencies` | no | Button, icon, filter reset, router |
| `state_source` | no | Query result, route loader, local filter state |
| `event_names` | no | Viewed, create clicked, clear filters clicked |

## Minimal Markdown Template

```md
# Component: EmptyState

## Metadata
component_name:
component_key:
figma_node_id:
category:
status:
platforms:

## Purpose

## When To Use

## When Not To Use

## Empty Cases
| empty_id | cause | user_context | title | description | primary_cta | secondary_cta |
|---|---|---|---|---|---|---|

## Props
| prop | type | required | default | description |
|---|---|---|---|---|

## Variants
| variant | use_case | layout_rule |
|---|---|---|

## Layout Rules

## Content Rules

## Design Tokens

## Accessibility

## Code Generation
preferred_component:
import_path:
layout_wrapper:
dependencies:
state_source:
event_names:
```
