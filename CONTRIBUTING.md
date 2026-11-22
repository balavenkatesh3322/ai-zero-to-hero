# Contributing to AI Zero to Hero

Thanks for helping make machine learning easier to understand. This guide covers how to set up, what we look for, and how to get a change merged.

## Ways to contribute

- **Fix something** — typos, bugs, layout issues, accessibility problems.
- **Improve a lesson** — clearer wording, a better diagram, a sharper live-app interaction.
- **Build a lesson** — pick a "coming soon" lesson and turn it into an interactive one.
- **Add a live app** — a small working product that shows the concept on real data.
- **Design** — new isometric objects, polish for light and dark themes, mobile layouts.

For anything larger than a small fix, please **open an issue first** so we can agree on the approach.

## Setup

```bash
git clone https://github.com/<your-username>/ai-zero-to-hero.git
cd ai-zero-to-hero
npm install
npm run dev
```

Node.js 20+ is required. The data scripts in `scripts/data/` need Python 3.12; see the header of each script.

## Quality bar

1. **No invented numbers.** Every number a lesson shows must be measured by a script in `scripts/data/` or come from a published source, and the step must name its source.
2. **Real-looking objects.** Use objects that look like what they represent — a person, a server rack, a database. Browse them at `/objects`. New objects go in `src/lesson/art.ts`.
3. **Both themes.** Check light and dark mode.
4. **Accessible.** Real buttons and links, keyboard support, visible focus, and respect for reduced motion.
5. **Keep the spec current.** Update `docs/spec.md` when you change behaviour, structure or design.

## Before you open a pull request

```bash
npm run typecheck
npm run build
npm run check:apps   # if you touched a live app or its data
```

- Keep pull requests focused: one lesson or one fix per PR.
- Include a screenshot or short clip for visual changes.
- Describe what changed and how you checked it.

## Commit messages

Use short, imperative subjects, e.g. `Add live app for gradient descent` or `Fix tree layout on small screens`.

## Code of conduct

Be kind, assume good intent, and keep feedback about the work. Harassment of any kind is not tolerated.

## License

By contributing, you agree that your contributions are licensed under the [MIT License](LICENSE).
