# TODO — Comprehensive App Overhaul

## Status: ✅ COMPLETE

---

### 1. Modularize Server Category API + History System ✅
- **File:** `server/functions/api/[category].js`
- Extracted KV helpers: `getItems()`, `putItems()`, `getHistory()`, `putHistory()`, `generateId()`
- Extracted validation: `validateItem()`, `sanitizeTags()`
- Added auto-archive logic: assignments past deadline automatically get `status='archived'` and copied to `history:assignments`
- Created `server/functions/api/history.js` endpoint to retrieve archived items

### 2. Update Default Categories, Data Model, Subjects & Semester ✅
- **Files:** `server/functions/api/config.js`, `server/functions/api/[category].js`
- New default categories:
  - `notices` → Notices (megaphone / indigo)
  - `assignments` → Assignments (clipboard-list / amber)
  - `quizzes` → Quizzes (check-circle / emerald)
  - `exams` → Exam Timetable (calendar / rose)
- Extended config schema with:
  - `semester`: `{ program, semester, label }` (e.g. "BBA - Semester 1")
  - `subjects`: array of `{ id, name, code }`
- Extended item schema with:
  - `deadline`, `notes`, `materialUrl`, `externalLink`, `subjectId`

### 3. Revamp Admin Dashboard ✅
- **Files:** `server/public/dashboard.js`, `server/public/index.html`
- Updated category list with new defaults
- Added semester config panel (program + semester number + display label)
- Added subjects management panel (add/remove with name + code)
- Added new form fields: deadline, notes, materialUrl, externalLink, subject dropdown
- Added History/Archive toggle for assignments
- Improved category management UI

### 4. Mobile-First Client Redesign ✅
- **New Components:**
  - `client/src/components/CategorySummaryCard.jsx` — top cards showing category + count, clickable to expand
  - `client/src/components/ItemDetailModal.jsx` — detail drawer/modal with deadlines, notes, subject, material/external links
- **Updated Components:**
  - `client/src/App.jsx` — summary cards layout, expandable sections, history view, modal state
  - `client/src/components/Header.jsx` — semester badge on desktop & mobile
  - `client/src/components/Section.jsx` — expandable/collapsible with smooth animation
  - `client/src/components/Card.jsx` — compact mobile-friendly design with deadline display
  - `client/src/index.css` — scrollbar-hide utility, mobile optimizations

### 5. Export/Import History Support ✅
- `server/functions/api/export.js` — now exports history data as well (v2.0)
- `server/functions/api/import.js` — now restores history data if present

---

## Files Modified / Created

### Server
| File | Action |
|------|--------|
| `server/functions/api/config.js` | Modified |
| `server/functions/api/[category].js` | Modified |
| `server/functions/api/data.js` | Modified |
| `server/functions/api/history.js` | Created |
| `server/functions/api/export.js` | Modified |
| `server/functions/api/import.js` | Modified |

### Dashboard (Admin)
| File | Action |
|------|--------|
| `server/public/dashboard.js` | Modified |
| `server/public/index.html` | Modified |

### Client (React)
| File | Action |
|------|--------|
| `client/src/App.jsx` | Modified |
| `client/src/components/Header.jsx` | Modified |
| `client/src/components/Section.jsx` | Modified |
| `client/src/components/Card.jsx` | Modified |
| `client/src/components/CategorySummaryCard.jsx` | Created |
| `client/src/components/ItemDetailModal.jsx` | Created |
| `client/src/index.css` | Modified |

