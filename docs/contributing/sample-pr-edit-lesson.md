# Sample PR: edit an existing lesson

This is a complete example of a small, good edit PR. Copy its shape for your own.

---

**Title:** `Clarify why naive Bayes is "naive" (Naive Bayes, step 2)`

**Body** (from the [edit-lesson template](../../.github/PULL_REQUEST_TEMPLATE/edit-lesson.md)):

> ## Edit lesson: Naive Bayes
>
> **Lesson URL:** https://ai-zero-to-hero.vercel.app/learn/naive-bayes/2
> **Closes:** #42
>
> ### What was wrong or unclear
> Step 2 says naive Bayes "treats words as independent" but never says why that is wrong, so learners asked why it still works.
>
> ### What it says now
> It gives a concrete counter-example ("New" and "York" are not independent) and says the classifier still ranks topics well because it only needs the *order* of the scores, not exact probabilities.
>
> ### Numbers
> - [x] No numbers changed
>
> ### Screenshots
> Before / after of step 2 in light and dark theme.
>
> ### Checklist
> - [x] `npm run typecheck` and `npm run build` pass
> - [x] Checked light and dark theme

---

## The change

Lessons are data in `src/lessons/`. Each step is one `step(...)` call:

```ts
step(tag, label, title, body, keyIdea, focus, { widget, source, draw, callout })
```

```diff
--- a/src/lessons/p02.ts
+++ b/src/lessons/p02.ts
@@ lesson: naive-bayes @@
-      step('CONCEPT', 'Words', 'Count words, apply Bayes per class', 'Turn each post into word counts. … “Naive” = it treats words as independent, which …',
+      step('CONCEPT', 'Words', 'Count words, apply Bayes per class', 'Turn each post into word counts. … “Naive” = it treats words as independent — which is false (“New” and “York” arrive together), yet the ranking of topics is usually still right, and ranking is all a classifier needs.',
```

## How to make it

1. Open the lesson in the browser and note the step number in the URL (`/learn/naive-bayes/2`).
2. Click **Edit on GitHub** under the step card, or open `src/lessons/p02.ts` and search for the lesson's `slug`.
3. Change the text. If you change a **number**, re-run the script that measured it (`scripts/data/`) and commit the regenerated JSON — never type a number by hand.
4. Run `npm run dev`, check the step in both themes, then `npm run build`.
5. Open a pull request with `?template=edit-lesson.md`.
