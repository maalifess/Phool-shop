## 2024-03-17 - React Router Search Params Debounce
**Learning:** Updating `useSearchParams` on every keystroke in a search input causes a history state update on every render, which is a major performance bottleneck in React applications.
**Action:** Always debounce `setSearchParams` when binding it to an `onChange` event of a text input, and use `{ replace: true }` to avoid filling up the browser history.
