# Error Case Page Reference

Use this reference when creating `에러케이스 페이지`.

## Required Figma Component Data

### 1. Identity

Each component md must include:

| field | required | purpose |
|---|---:|---|
| `component_name` | yes | Human-readable component name |
| `component_key` | yes | Stable machine key |
| `figma_node_id` | yes | Source Figma node |
| `category` | yes | Example: feedback, layout, action |
| `status` | yes | draft, beta, stable, deprecated |
| `platforms` | yes | web, mobile, admin, etc. |

### 2. Usage Semantics

Include:

| field | required | purpose |
|---|---:|---|
| `purpose` | yes | What problem the component solves |
| `when_to_use` | yes | Valid contexts |
| `when_not_to_use` | yes | Invalid contexts |
| `severity_model` | yes | info, warning, error, critical |
| `recovery_model` | yes | retryable, redirect, contact_support, terminal |

### 3. Error Taxonomy

Error pages need a normalized taxonomy:

| error_id | cause | severity | recoverability | user_goal | primary_action | secondary_action |
|---|---|---|---|---|---|---|
| `network_timeout` | Network latency or offline state | warning | retryable | Continue current task | Retry | Go back |
| `permission_denied` | Missing permission or role | error | redirect/contact_support | Request access | Request access | Go home |
| `not_found` | Resource does not exist or moved | error | redirect | Find another resource | Go to list | Go home |
| `server_error` | Unexpected server failure | error | retryable/contact_support | Resume after failure | Retry | Contact support |
| `session_expired` | Auth session expired | warning | redirect | Sign in again | Sign in | Cancel |
| `validation_failed` | Submitted data cannot be accepted | warning | user_fixable | Fix input | Review fields | Cancel |

### 4. Props and Variants

Required prop table:

| prop | type | required | default | notes |
|---|---|---:|---|---|
| `title` | string | yes | none | Short user-facing summary |
| `description` | string | yes | none | Explain what happened and what to do next |
| `severity` | enum | yes | `error` | info, warning, error, critical |
| `icon` | token/string | no | by severity | Must not be the only severity indicator |
| `primaryActionLabel` | string | conditional | none | Required when recoverable |
| `secondaryActionLabel` | string | no | none | Optional escape hatch |
| `errorCode` | string | no | hidden | Show only if md allows |
| `supportLink` | string | no | none | Use for terminal/support cases |

Required variants:

| variant | required | notes |
|---|---:|---|
| `inline` | yes | Error inside a section, card, form, or table |
| `page` | yes | Full content area error |
| `blocking` | conditional | Full-screen or modal blocking state |
| `compact` | conditional | Dense admin/table contexts |

### 5. Layout Rules

Include:

- Container and max width.
- Vertical alignment: center only when no surrounding context is useful.
- Whether app shell, header, tabs, filters, or breadcrumbs remain visible.
- Button order and wrapping behavior.
- Mobile behavior.
- Relationship to loading, partial data, and retry states.

### 6. Content Rules

Include:

- Title length and tone.
- Description structure: what happened, impact, next action.
- CTA copy rules.
- Forbidden wording.
- Whether visible error codes are allowed.
- Localization key pattern when applicable.

### 7. Design Tokens

Include:

| token group | examples |
|---|---|
| color | surface, text, semantic error/warning/info, border |
| typography | title, body, helper, code |
| spacing | container gap, icon gap, button gap |
| radius | container, button |
| icon | size, color, stroke |
| motion | retry/loading transition if applicable |

### 8. Accessibility

Include:

- Heading level.
- `role="alert"` or live-region policy for critical errors.
- Focus behavior after route load or failed action.
- Keyboard order.
- Color contrast requirement.
- Non-color severity indicators.

### 9. Code Generation Hints

Include:

| field | required | purpose |
|---|---:|---|
| `preferred_component` | yes | Component to instantiate |
| `import_path` | yes | Code import path |
| `layout_wrapper` | yes | App shell or page wrapper |
| `dependencies` | no | Button, icon, analytics, query reset |
| `state_source` | no | Route loader, TanStack Query, form submit, etc. |
| `event_names` | no | Viewed, retry clicked, support clicked |

## Minimal Markdown Template

```md
# Component: ErrorState

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

## Error Cases
| error_id | cause | severity | recoverability | title | description | primary_cta | secondary_cta |
|---|---|---|---|---|---|---|---|

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
