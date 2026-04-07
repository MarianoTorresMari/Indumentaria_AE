# Plan: Craft a Sonnet 4.6 Prompt for Project Refactor

## Context
The user needs a well-engineered prompt (in English) for Claude Sonnet 4.6 to refactor their React + Firebase POS app ("Indumentaria AE", locale es-AR). The refactor involves: unifying navigation tabs, installing new libraries, replacing emojis with professional icons, adding SweetAlert2 notifications, and cleaning up code structure.

## Current State
- **4 tabs**: Buscar, Vender, Stock, Admin
- **Icons**: Emojis everywhere + inline SVG in BottomNav
- **Alerts**: Browser `alert()` + custom styled success divs
- **State**: Heavy useState/useEffect usage, duplicated search logic across pages
- **Key files**:
  - `src/App.jsx` (root state, handlers, routing)
  - `src/pages/BuscarPage.jsx` (product search)
  - `src/pages/VenderPage.jsx` (POS / sell flow)
  - `src/pages/StockPage.jsx` (inventory view)
  - `src/pages/AdminPage.jsx` (CRUD)
  - `src/components/Header.jsx`
  - `src/components/BottomNav.jsx`
  - `src/services/productos.js` (Firebase service)
  - `src/firebase.js`
  - `src/index.css` (design system)

## Deliverable
A single, comprehensive English prompt for Sonnet 4.6 that the user can paste to execute the full refactor.

## Prompt

---

```
You are refactoring a React 19 + Vite + Firebase Firestore POS application for a clothing store. The app locale is es-AR (Spanish Argentina) — all UI text, labels, placeholders, currency formatting, and user-facing strings MUST remain in Spanish (Argentina). Do NOT translate any Spanish text to English.

## Project structure

src/
├── components/
│   ├── Header.jsx
│   └── BottomNav.jsx
├── pages/
│   ├── BuscarPage.jsx      — product search with autocomplete
│   ├── VenderPage.jsx       — POS sell flow (search → select size → confirm)
│   ├── StockPage.jsx        — inventory overview with filters
│   └── AdminPage.jsx        — product CRUD + example data loader
├── services/
│   └── productos.js         — Firebase Firestore service layer
├── firebase.js              — Firebase config
├── App.jsx                  — root component (state, handlers, tab routing)
├── index.css                — CSS design system (variables, animations)
└── main.jsx                 — entry point

## Task overview

Execute ALL of the following changes in a single pass. Read every file before modifying it.

---

### 1. Install dependencies

Run these installs:
- `npm install sweetalert2` — for professional alert dialogs
- `npm install lucide-react` — for professional SVG icons

---

### 2. Unify navigation: merge "Buscar" and "Stock" into "Vender"

**Goal:** Reduce from 4 tabs (Buscar, Vender, Stock, Admin) to 3 tabs: **Vender, Stock, Admin**.

The new **VenderPage** must combine all functionality:
- When the user opens "Vender", they immediately see the full product catalog as selectable cards/list items (similar to how StockPage currently shows products with stock indicators).
- Each product card shows: image, name, code, category, price, total stock, and a color-coded stock status indicator (green = ok, yellow = low ≤5, red = out of stock).
- Users can filter by category and search by name/code (merge the search bar from BuscarPage and the category filter from StockPage).
- Clicking a product card selects it and opens the sell flow inline (size selection → quantity → confirm sale) — reuse VenderPage's current 3-step flow logic.
- The user can view stock details per size (talle) for the selected product before selling.
- Products with zero stock should be visible but clearly disabled/greyed out and not selectable for sale.

**After merging:**
- Delete `src/pages/BuscarPage.jsx` — its functionality is now in VenderPage.
- Keep `src/pages/StockPage.jsx` as a dedicated stock/inventory view (read-only, no selling).
- Update `src/components/BottomNav.jsx` to show 3 tabs: Vender, Stock, Admin.
- Update `src/App.jsx` routing: remove 'buscar' tab, set 'vender' as default tab.

---

### 3. Replace ALL emojis with Lucide icons

Import icons from `lucide-react` and replace every emoji in the entire codebase:

**Mapping guide (adapt as needed):**
- 👕 (shirt) → `<Shirt />`
- 🔍 (search) → `<Search />`
- 🛒 (cart) → `<ShoppingCart />`
- 📦 (box/stock) → `<Package />`
- ⚙️ (settings) → `<Settings />`
- ✅ (success/check) → `<CheckCircle />`
- ❌ / ✕ (close/error) → `<X />` or `<XCircle />`
- ✏️ (edit) → `<Pencil />`
- 🗑️ (delete) → `<Trash2 />`
- ⚠️ (warning) → `<AlertTriangle />`
- 🔄 (refresh/loading) → `<RefreshCw />`
- 🤷 (not found) → `<SearchX />`
- 📭 (empty) → `<Inbox />`
- 📱 (barcode) → `<ScanBarcode />` or `<Barcode />`
- ➕ (add) → `<Plus />`
- ➖ (minus) → `<Minus />`
- 💾 (save) → `<Save />`
- 🏷️ (tag/category) → `<Tag />`
- 📋 (list) → `<ClipboardList />`
- 💰 (money/price) → `<DollarSign />` or `<BadgeDollarSign />`

Also replace the inline SVG icons in `BottomNav.jsx` with the corresponding Lucide components.

Style all icons consistently: use `size={18}` for inline/button icons, `size={22}` for section headers, `size={48}` for empty states. Match the icon color to the surrounding text color using `className` or inline `style`.

---

### 4. Create a dedicated alerts utility with SweetAlert2

**Create file: `src/utils/alerts.js`**

Build a centralized alert module that wraps SweetAlert2. Export named functions for each alert type. All alert text must be in Spanish (es-AR). Use a consistent visual style that matches the app's design system (primary color: #2563eb, success: #16a34a, danger: #dc2626, warning: #f59e0b, font: 'DM Sans').

Functions to export:

```javascript
// Success alerts
alertProductoCreado(nombreProducto)     // "¡Producto creado!" with product name
alertProductoEditado(nombreProducto)    // "¡Producto actualizado!"
alertProductoEliminado(nombreProducto)  // "Producto eliminado"
alertVentaExitosa(detalle)              // "¡Venta registrada!" with sale details (product, size, qty, remaining stock)
alertDatosEjemploCargados()             // "¡Datos de ejemplo cargados!"

// Error alerts
alertError(mensaje)                     // Generic error with custom message
alertStockInsuficiente(disponible)      // "Stock insuficiente" with available qty

// Confirmation dialogs (return promise)
confirmarEliminacion(nombreProducto)    // "¿Eliminar producto?" with confirm/cancel — returns boolean
confirmarVenta(producto, talle, cantidad) // "¿Confirmar venta?" with sale summary — returns boolean
confirmarCargarEjemplos()               // "¿Cargar datos de ejemplo?" — returns boolean
```

Configure SweetAlert2 defaults:
- `customClass` with the app's font family
- `confirmButtonColor: '#2563eb'`
- `cancelButtonColor: '#64748b'`
- Confirm button text: "Sí, confirmar" / Cancel: "Cancelar"
- Use `icon` parameter: 'success', 'error', 'warning', 'question'
- For success alerts: use `timer: 2000` with `showConfirmButton: false` and `toast: false`

---

### 5. Integrate alerts into all components

Replace every instance of:
- `alert()` → appropriate function from `src/utils/alerts.js`
- `window.confirm()` → appropriate `confirmar*()` function
- Custom success message divs (like VenderPage's ventaExitosa state + styled div) → `alertVentaExitosa()`
- Custom error state rendering → `alertError()`

Remove any useState variables that were only used to show/hide success/error messages (like `ventaExitosa`, `setVentaExitosa`).

---

### 6. Clean code and reduce state complexity

Apply these principles across ALL modified files:

**Reduce useState:**
- Derive values instead of storing them in state. For example, `sugerencias` (filtered products) should be computed with `useMemo`, not stored in state.
- Group related state into objects where it reduces complexity. For example, the sell flow state (productoSeleccionado, talleSeleccionado, cantidad) could be a single `venta` state object with a reset function.
- Remove state variables that only exist to show/hide alerts (SweetAlert2 handles its own visibility).

**Reduce useEffect:**
- Do NOT use useEffect for derived state calculations.
- Only keep useEffect for true side effects (data fetching on mount, DOM focus management).
- If auto-focus is needed, use `useRef` with callback refs or `autoFocus` prop instead of useEffect where possible.

**General cleanup:**
- Extract duplicated search/filter logic into a custom hook or utility if used in multiple pages.
- Use early returns for cleaner conditional rendering.
- Keep components under 200 lines — extract sub-components if needed.
- Remove unused imports, variables, and dead code.
- Use consistent naming: Spanish for user-facing text, English for code identifiers (variable names, function names).

---

### 7. Important constraints

- **Locale:** All user-visible text stays in Spanish (Argentina). Currency: ARS format via `Intl.NumberFormat('es-AR')`.
- **Do NOT change:** Firebase config, service layer logic (productos.js), data model structure, or CSS design system — unless strictly required by the refactor.
- **Do NOT add:** TypeScript, React Router, state management libraries (Redux, Zustand), or any dependency not listed above.
- **Mobile-first:** Maintain the current mobile-first responsive design. The app is designed for phone use.
- **Preserve functionality:** Every feature that exists today must continue to work after the refactor. Do not remove any capability.
```

---

## Verification
After running the prompt, verify:
1. `npm run dev` starts without errors
2. Only 3 tabs visible: Vender, Stock, Admin
3. Vender page shows product catalog with search + category filter + sell flow
4. No emojis remain anywhere in the UI — all replaced with Lucide icons
5. Creating/editing/deleting products shows SweetAlert2 popups
6. Selling a product shows SweetAlert2 confirmation + success
7. `src/utils/alerts.js` exists and is imported by all components that show alerts
8. No `alert()` or `window.confirm()` calls remain in the codebase
9. `BuscarPage.jsx` is deleted
