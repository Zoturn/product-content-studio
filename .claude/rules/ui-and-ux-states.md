---
paths:
  - "src/app/**/*.tsx"
  - "src/components/**"
  - "src/theme.ts"
---

# UI and UX states

**Scope:** Styling, responsive layout, and how loading, error and success are presented in the editor and the catalogue. It does not define what counts as valid data; that is `api-and-validation.md`.

## Rules

1. Style with MUI only — the `sx` prop, `Box`/`Stack`/`Grid`, and tokens from `src/theme.ts` — so spacing, colour and typography stay consistent and a change to the theme reaches the whole app.
2. Express responsive behaviour through MUI breakpoints (`sx={{ display: { xs: 'none', md: 'block' } }}`, `<Grid size={{ xs: 12, md: 6 }}>`) and verify the result at mobile width, because adaptive layout is graded and a desktop-only check will not reveal a broken one.
3. Give every asynchronous action a visible pending state and disable its submit control while the request is in flight, since a button that looks idle invites a second click and a duplicate write.
4. Keep the user's typed values in the form when a save fails and show the server's message beside them — silently discarding someone's work is a worse outcome than the failure that caused it.
5. Show success only after the server has confirmed the write, because an optimistic confirmation that later turns out false is indistinguishable, to the user, from data loss.
6. Map `fieldErrors` from the response back onto the individual fields with react-hook-form's `setError`, so the person fixing the problem is shown where it is rather than told that something, somewhere, is wrong.
7. Save on an explicit user action only; there is no autosave, because the brief requires the user to decide when a change becomes persistent.
8. Render the product description as a React text child with `whiteSpace: 'pre-wrap'`, which preserves the author's line breaks while guaranteeing the text can never execute as markup.
9. Never use `dangerouslySetInnerHTML` for admin-authored text and never convert `\n` to `<br>` by building HTML, because that reopens precisely the injection hole plain-text rendering closes.
10. Present read-only data — the product name and its attributes — as text rather than as disabled inputs, since a greyed-out field implies it could be edited under some condition that does not exist.
11. Give every interactive control an accessible label, and pair each field's error text with its input through MUI's `error` and `helperText`, so assistive technology reports the same state the eye sees.
12. Keep client components small and focused on interaction, leaving data loading to the server, so the editor's state logic is the only thing shipped to the browser.

## Examples

```tsx
// no: renders author text as markup, and loses edits on failure
<div dangerouslySetInnerHTML={{ __html: product.description }} />;
catch { reset(); setStatus("saved"); }

// yes: text stays text, edits survive, success waits for the server
<Typography sx={{ whiteSpace: "pre-wrap" }}>{product.description}</Typography>;
```

```tsx
// no: no pending state, and field errors dumped into one banner
<Button type="submit">Save</Button>;

// yes
<Button type="submit" variant="contained" disabled={isSubmitting}>
  {isSubmitting ? "Saving…" : "Save"}
</Button>;
// and, on a 400 response:
Object.entries(fieldErrors).forEach(([field, messages]) =>
  setError(field as keyof ProductUpdate, { message: messages[0] }),
);
```

## Anti-patterns

- A save handler that resets the form in its error branch, destroying the text the user was about to retry.
- A success toast fired when the request is sent rather than when it resolves.
- Server validation errors shown only as a banner, leaving the user to hunt for the offending field.
- Layout built at one viewport and never opened at mobile width, so the editor is unusable on the device it is graded on.
- Read-only values rendered as disabled text fields, promising an edit the application does not support.
