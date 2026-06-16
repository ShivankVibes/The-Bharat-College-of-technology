# The Bharat College of Technology — *A Leaked Dossier*

A serious, choice-driven narrative game about how India's private-coaching and exam-leak
industry can turn one honest teacher into the thing that breaks students and families.
You found a tiny tuition room and decide, year by year, whether to grow it honestly or
capture the system through fraud — and you watch what each choice does to the people who
trusted you.

It is **fiction**. Every person, institute, official, and exam is invented. It is a story
about *systems*, not real individuals. It deals with academic pressure, exploitation, debt,
and self-harm, told with restraint and a content warning up front.

## Play

It's a zero-build static website — no installation, no dependencies.

- **Online:** open the GitHub Pages link for this repo, or
- **Locally:** download the files and open `index.html` in any modern browser (just
  double-click it).

## How it works

The game is **vanilla HTML/CSS/JS** with no framework and no build step. Scripts attach to a
single global `BCT` namespace and load in order:

| File | Responsibility |
|------|----------------|
| `index.html` | Markup: content-warning, title, and game screens |
| `styles.css` | The dark "dossier" theme, pixel diorama, animations, responsive layout |
| `src/data.js` | **All story content** — chapters, choices, characters, endings |
| `src/state.js` | Engine: stats, the human ledger, save/load, ending selection |
| `src/audio.js` | Tiny WebAudio sound cues + mute |
| `src/scene.js` | The reactive pixel scene |
| `src/ui.js` | Rendering: meters, typewriter, choices, ledger |
| `src/main.js` | The game loop and screen flow |

## Contributing (the fun part)

You can add or rewrite story **without touching any engine code** — just edit `src/data.js`.
Each chapter is a plain object with a `clean` and `dirty` route, three options each. An
option looks like:

```js
{
  label: "What the player sees on the button",
  detail: "short tag", path: "dirty",
  effects: { saakh: -12, mudra: 16, power: 8, heat: 10,
             ledger: { aarav: -8, meena: -5, sharmaDebt: 14 } },
  profit: "The immediate payoff text.",
  consequence: "What it costs / who it touches.",
  log: "One line for the consequence log."
}
```

Use `{founder}`, `{institute}`, and `{subject}` in any text and they'll be replaced with the
player's choices. Keep the tone serious and grounded.

## Tests

Open `test.html` in a browser — it runs in-page assertions over the engine logic and prints
PASS/FAIL.

## A note on the heavy themes

The darkest path can lead to a student's death. It is implied, never graphic, and framed as a
consequence of the player's choices — not spectacle. A content warning and a real helpline
(Tele MANAS, 14416) are shown before play and again on that beat. If you adapt this game,
please keep that care.
