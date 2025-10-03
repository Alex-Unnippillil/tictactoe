# Color contrast and focus indicator audit

Date: 2025-10-03

## Method

A manual Node.js script computed contrast ratios for key design tokens in both the light and dark themes. The script covers text, interactive controls, hover states, and the updated focus indicators. All ratios are compared against WCAG 2.1 AA targets (4.5:1 for standard text, 3:1 for user interface components and focus indicators).

## Results

| Theme | Color pair | Contrast ratio | WCAG AA target | Pass |
| --- | --- | --- | --- | --- |
| Light | Text vs background | 16.22:1 | 4.5:1 | ✅ |
| Light | Text vs surface | 17.85:1 | 4.5:1 | ✅ |
| Light | Muted text vs surface | 7.58:1 | 4.5:1 | ✅ |
| Light | Accent text vs accent base | 4.94:1 | 4.5:1 | ✅ |
| Light | Accent text vs accent hover | 6.41:1 | 4.5:1 | ✅ |
| Light | Board hover text vs hover fill | 14.63:1 | 3:1 | ✅ |
| Light | Focus ring vs background | 3.23:1 | 3:1 | ✅ |
| Light | Focus ring vs surface | 3.56:1 | 3:1 | ✅ |
| Dark | Text vs background | 17.06:1 | 4.5:1 | ✅ |
| Dark | Text vs surface | 13.98:1 | 4.5:1 | ✅ |
| Dark | Muted text vs surface | 10.01:1 | 4.5:1 | ✅ |
| Dark | Accent text vs accent base | 4.94:1 | 4.5:1 | ✅ |
| Dark | Accent text vs accent hover | 6.41:1 | 4.5:1 | ✅ |
| Dark | Board hover text vs hover fill | 9.90:1 | 3:1 | ✅ |
| Dark | Focus ring vs background | 11.66:1 | 3:1 | ✅ |
| Dark | Focus ring vs surface | 9.55:1 | 3:1 | ✅ |

All measured combinations meet or exceed the required contrast thresholds. The updated focus indicators clear the 3:1 requirement against both backgrounds and elevated surfaces.

## Follow-up

- Monitor newly introduced design tokens to ensure future states reuse these accessible values.
- If additional UI states are added, extend the script to include their tokens in the table above.
