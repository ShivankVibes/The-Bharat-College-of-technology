# The Bharat College of Technology — Design Spec

**Working title:** Coaching Crown → *The Bharat College of Technology: A Leaked Dossier*
**Date:** 2026-06-16
**Type:** Polished branching-narrative web game (satire of the Indian private-coaching / exam-leak industry)
**Status:** Approved direction; ready to plan.

---

## 1. Vision & framing

A single-player, choice-driven narrative game. The player founds a tiny tuition room and decides, chapter by chapter, whether to grow it honestly or capture the exam system through fraud. The whole game is framed as **a leaked case file ("dossier")** the player is reading — the exposé angle is the interface itself.

The satire targets *systems and institutions*, fictionalized into composites. **No real people, no real institution names, no defamation.** Dark themes (pressure culture) are handled with restraint and a content note.

**Thesis made mechanical:** the spine is the trade **Mudra ⇄ Saakh** — "the seal is for sale." Corrupt choices convert hard-won credibility (Saakh) into quick cash (Mudra); Saakh cannot be bought back, only slowly rebuilt.

## 2. Goals / non-goals

**Goals**
- Far deeper, sharper story covering the canvas beats: CEE paper leak, mafia/blackmail funding, buyouts, fake toppers, NAT, ghost-faculty inspections, capitation.
- Genuinely polished UX/feel: animated reactive pixel scene, typewriter reveal, animated stats, sound (optional), title screen, ending scorecard.
- Personalization: player names themselves + their institute; choices weave those names into the text.
- Save & resume (localStorage).
- Mobile-responsive and accessible (keyboard nav, respects `prefers-reduced-motion`).

**Non-goals (explicitly out of scope this round)**
- No real economy / building / idle sim (Mudra is a narrative resource, not a spendable open economy).
- No framework, bundler, or build step.
- No backend, accounts, or networking.
- No real-money, gambling, or anything targeting minors for harm — it's satire.

## 3. Tech & architecture

**Zero-build vanilla HTML/CSS/JS.** No framework, no bundler, no `node_modules`. Rationale: it's a student group project on GitHub — teammates must be able to **double-click `index.html` and have it run**, and GitHub Pages must host it with zero config.

**No ES modules / `import`** (they break on `file://`). Instead, split into ordered plain `<script>` files that share one global namespace `BCT`:

```
index.html            # shell markup + script tags in order
styles.css            # theme + layout + pixel scene + animations
src/
  data.js             # BCT.data  — chapters, choices, endings, floors, copy
  state.js            # BCT.state — state shape, clamp, save/load (localStorage)
  audio.js            # BCT.audio — tiny WebAudio sfx + mute toggle
  scene.js            # BCT.scene — pixel diorama rendering & reactions
  ui.js               # BCT.ui    — render story/choices/meters/log, typewriter, transitions
  main.js             # BCT.main  — wiring, game loop, event handlers, boot
```

Load order in `index.html`: `data → state → audio → scene → ui → main`. Each file does `window.BCT = window.BCT || {}` then attaches its piece. This runs from `file://` and GitHub Pages identically.

**Data-driven content:** all story text/choices/effects live in `data.js` as plain objects so teammates can add chapters without touching engine code. This directly serves the canvas note ("it's a grp project").

## 4. Core systems

### 4.1 Stats (4 meters)
| Stat | Was | Meaning | Range |
|------|-----|---------|-------|
| **Saakh** (साख) | Trust | Credibility / reputation. Slow to build, easy to burn, cannot be bought. | 0–100 |
| **Mudra** (मुद्रा) | Money | Cash / war chest. Fast to gain via corruption. | 0–100 |
| **Power** | Power | Reach, influence, market control. | 0–100 |
| **Heat** | Heat | Scandal exposure / regulatory & press attention. | 0–100 |

Corrupt choices typically: **−Saakh, +Mudra, +Power, +Heat.** Clean choices: **+Saakh, modest Mudra, −/flat Heat.** Mudra spends shown as flavor in choice copy (e.g., "−5,000 Mudra") but mechanically map onto the 0–100 meter.

### 4.2 Chapter loop (kept from current game, polished)
Each chapter runs three beats:
1. **Choice** — a route question (corrupt? yes/no), then 3 sub-options for the chosen route.
2. **Profit** — shows the immediate payoff of the choice; scene reacts.
3. **Heat** — shows the consequence/trace it leaves; scene reacts.

Then advance to the next chapter (state grows). This rhythm already exists and tests well; we keep it and enrich the content + presentation.

### 4.3 Save / resume
- Autosave full state to `localStorage` after every choice.
- Title screen offers **Continue** if a save exists, else **New Game**.
- **Restart** asks for confirmation and clears the save.

### 4.4 Personalization
- Title screen collects **Founder name** and **Institute name** (with sensible defaults + a "surprise me" randomizer from a fictional list).
- Names are interpolated into story/log/ending copy via simple `{founder}` / `{institute}` tokens in `data.js`.

## 5. Story arc (7 chapters, rebuilt from the canvas + research)

Each chapter keeps the clean/corrupt fork. Corrupt options dramatize real (fictionalized) tactics; the research report informs the detail.

1. **Origins — The Rented Room.** Pick subject (Physics / Chemistry / Maths). Teach honestly (word of mouth, +Saakh) vs. rank-poster hype & a "100% Selection" banner (+Mudra, regulatory landmine seeded).
2. **Partners — Rich Dads & Poached Stars.** Take a rich partner / poach a star teacher / launch a "scholarship-cum-admission test" as a lead funnel (capitation) vs. transparent merit aid.
3. **The Rank Machine — Borrowed Toppers.** Splash a borrowed AIR-1's face as "our topper" + pay outside students to fail to inflate your "selections" vs. advertise only real enrolled results (callback: consent-lawsuit / ad-fine event if corrupt).
4. **The Leak — Tomorrow's Paper.** The CEE paper leak: the 6-stage chain (press → trunk transport → treasury → centre → hall), solver gangs & proxy test-takers, exam-centre "settings" vs. refuse/report. High Mudra, high Heat, plants a time bomb.
5. **Capture — The Seal For Sale.** Mafia/blackmail funding, buy out a big rival institute, buy a friendly education official (patronage tree), invent the **NAT** and put "NAT-endorsed" teachers on every billboard, pay brands to stick logos vs. spend on compliance/student support.
6. **The Reckoning — The Leaked Ledger.** A whistleblower leaks your ledger. Open a real audit, refund families, remove bad practices (painful reform, big Saakh recovery) vs. deny & intimidate (buys a news cycle, multiplies the scandal).
7. **The Crown — Legacy or Ruler.** Rule North India by centralizing control vs. step back and professionalize. Leads into the expanded endings.

**Inspection Day (Chapter 5 sub-beat or its own mini-event):** ghost faculty + actor "patients" + spoofed biometrics + an envelope to the assessor vs. show the real understaffed labs. Each prop is a "trace."

## 6. Endings (expanded)

Threshold-driven, computed from final stats, each with a title, narrative, scorecard, and a one-line **moral epilogue**:
- **Raid at Dawn** — high Heat, low Saakh: the empire connects to its crimes and collapses.
- **The Uncomfortable Empire** — high Mudra + Power, low Saakh: huge, feared, brittle.
- **The Harder Legacy** — high Saakh, low Heat: smaller, trusted, durable.
- **The Reckoning Deal** — mixed: survives after reform, repayment, public embarrassment.
- **(New) Hollow Crown** — max Mudra but Saakh floored: rich and entirely hollow — the "seal is for sale" payoff ending.

Ending screen shows a **scorecard** (final meters + a "what you traded" line: Saakh spent → Mudra gained) designed to be screenshot/shared, plus **Play another timeline**.

## 7. Visual / UX design

**Art direction:** upgraded **pixel diorama** (the hero visual — cracked room that grows into a glowing tower, animated & reactive) wrapped in a dark **"leaked dossier / newsroom"** UI shell. A single hot accent color **shifts with Heat** (cool teal → amber → red). Stat bars read like a surveillance HUD.

**Feel / motion**
- Typewriter reveal for story text (skippable on tap/key; disabled under reduced-motion).
- Animated stat changes: number count-up, bar fill, a red flash when Heat jumps, green pulse when Saakh rises.
- Choice buttons preview their stat effect on hover/focus; clean vs. corrupt visually distinct.
- Smooth scene/beat transitions (fade/slide), all gated behind `prefers-reduced-motion`.

**Audio (optional, default on, with mute toggle):** small WebAudio-generated cues — chalk/scribble on choice, cash on Mudra gain, siren sting on Heat spike. No external audio files (keeps zero-build promise).

**Screens:** Title (name entry + Continue/New) → Chapter loop → Ending. A persistent top bar with title, mute, and restart.

## 8. Accessibility & responsiveness
- Full keyboard operability; visible focus states; ARIA labels on meters/choices/scene.
- `prefers-reduced-motion` disables typewriter + transitions.
- Mobile-first responsive layout (story panel stacks under the scene on narrow screens). Tap targets ≥ 44px.
- Content note on the title screen acknowledging the satire targets systems, not people, and a brief sensitivity line re: pressure culture.

## 9. Stretch (bonus, only after core ships)
A light **between-chapter twist** event or two — e.g., *Spin the Scandal Wheel* (random small stat event) or a *"drunk boardroom"* night where choice labels get scrambled. Pure flavor/replayability, no sim. Marked optional so the core ships first.

## 10. Quality bar / done criteria
- Plays start-to-ending on desktop + mobile widths with no console errors.
- Save/resume works across reload; restart confirms + clears.
- All 7 chapters + 5 endings reachable; names interpolate correctly.
- Reduced-motion and keyboard-only playthrough both work.
- Code reviewed by a sub-agent pass before merge (per request).

## 11. Risks / mitigations
- **`file://` + multi-file:** mitigated by global-namespace plain scripts (no ES modules).
- **Tone/sensitivity:** fictional composites only; content note; pressure-culture handled with restraint.
- **Scope creep (twists/sim):** twists are explicitly stretch; no economy sim.
- **Monolith regression:** keep content data-driven so teammates extend `data.js` safely.
