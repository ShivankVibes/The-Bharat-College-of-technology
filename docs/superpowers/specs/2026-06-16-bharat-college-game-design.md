# The Bharat College of Technology — Design Spec

**Working title:** *The Bharat College of Technology: A Leaked Dossier*
**Date:** 2026-06-16 (rev. 2 — serious-drama direction)
**Type:** Polished branching-narrative web game — a serious drama exposing the Indian private-coaching / exam-leak system
**Status:** Approved direction; ready to plan.

---

## 1. Vision & framing

A single-player, choice-driven narrative game. The player founds a tiny tuition room and decides, chapter by chapter, whether to grow it honestly or capture the exam system through fraud.

**This is not a comedy or a meme.** It is a serious, grounded human drama. The intent is that a player finishes it *unsettled* — having felt, from the inside, how an ordinary teacher becomes the thing that breaks students and families, one reasonable-looking shortcut at a time. Corruption is written to feel **seductive first, then hollow**. The system is exposed by making the player complicit in it, then making them face who paid for it.

Tonal references: investigative testimony and the bittersweet gravity of *Kota Factory* — restrained, real, weighty. No winking, no gags.

The game is framed as a **leaked case file ("dossier")** the player is reading and re-living — sober, documentary, like evidence.

**Thesis made mechanical:** the spine is the trade **Mudra ⇄ Saakh** — "the seal is for sale." Corrupt choices convert hard-won credibility (Saakh) into quick cash (Mudra); Saakh cannot be bought back, only slowly rebuilt. But the deeper ledger the game tracks is **human**: who trusted you, and what it cost them.

The satire/critique targets *systems and institutions*, fictionalized into composites. **No real people, no real institution names, no defamation.** The heaviest theme — exam/coaching pressure and student death — is confronted directly but **with care**: implied, never graphic; framed as a consequence of the player's choices; with a content warning and helpline note (see §8).

## 2. Goals / non-goals

**Goals**
- A genuinely serious, emotionally resonant story that exposes the real harm of the system: debt-trapped families, broken students, captured exams, betrayed trust.
- **Human cost made central** via recurring named characters whose lives bend to the player's choices (see §4.5).
- Story covering the canvas beats with real weight: CEE paper leak, mafia/blackmail funding, buyouts, fake toppers, NAT, ghost-faculty inspections, capitation.
- Polished, sober UX/feel: a reactive pixel scene, typewriter reveal, restrained animation, optional sound, title screen, a reckoning-style ending.
- Personalization: player names themselves + their institute; names woven into the text.
- Save & resume (localStorage). Mobile-responsive and accessible.

**Non-goals (out of scope this round)**
- **No comedy/gag mechanics.** The earlier "twists" (spin-the-wheel, drunk decisions) are **cut** — they trivialize the subject.
- No real economy / building / idle sim (Mudra is a narrative resource, not a spendable open economy).
- No framework, bundler, or build step. No backend, accounts, or networking.
- Nothing gratuitous or exploitative; the heavy themes serve truth, not shock.

## 3. Tech & architecture

**Zero-build vanilla HTML/CSS/JS.** No framework, no bundler, no `node_modules`. Rationale: student group project on GitHub — teammates must be able to **double-click `index.html` and have it run**, and GitHub Pages must host it with zero config.

**No ES modules / `import`** (they break on `file://`). Instead, ordered plain `<script>` files sharing one global namespace `BCT`:

```
index.html            # shell markup + script tags in order
styles.css            # theme + layout + pixel scene + animations
src/
  data.js             # BCT.data  — chapters, choices, characters, endings, copy
  state.js            # BCT.state — state shape, clamp, human ledger, save/load
  audio.js            # BCT.audio — tiny WebAudio sfx + mute toggle
  scene.js            # BCT.scene — pixel diorama rendering & reactions
  ui.js               # BCT.ui    — render story/choices/meters/log, typewriter, transitions
  main.js             # BCT.main  — wiring, game loop, event handlers, boot
```

Load order: `data → state → audio → scene → ui → main`. Each file does `window.BCT = window.BCT || {}` then attaches its piece. Runs from `file://` and GitHub Pages identically.

**Data-driven content:** all story text, choices, characters, and effects live in `data.js` as plain objects so teammates can extend the story without touching engine code.

## 4. Core systems

### 4.1 Stats (4 meters)
| Stat | Meaning | Range |
|------|---------|-------|
| **Saakh** (साख) | Credibility / reputation. Slow to build, easy to burn, cannot be bought. | 0–100 |
| **Mudra** (मुद्रा) | Cash / war chest. Fast to gain via corruption. | 0–100 |
| **Power** | Reach, influence, market control. | 0–100 |
| **Heat** | Scandal exposure / regulatory & press attention. | 0–100 |

Corrupt choices typically: **−Saakh, +Mudra, +Power, +Heat.** Clean choices: **+Saakh, modest Mudra, flat/−Heat.** Mudra spends shown as flavor (e.g., "−₹5 lakh") but mapped onto the 0–100 meter.

### 4.2 Chapter loop
Each chapter runs three beats — **Choice → Profit → Consequence** — then advances. The "Consequence" beat is where the human cost lands (not just "Heat +20" but *who* it touched). Rhythm kept from the current game; content and weight rebuilt.

### 4.3 Save / resume
Autosave after every choice. Title screen offers **Continue** if a save exists, else **New Game**. **Restart** confirms + clears the save.

### 4.4 Personalization
Title screen collects **Founder name** and **Institute name** (defaults + "surprise me"). Interpolated via `{founder}` / `{institute}` tokens in `data.js`.

### 4.5 Characters & the Human Ledger (the heart of the game)
The story follows a small recurring cast whose fates respond to the player's choices. They turn abstract stats into people:
- **Aarav** — a small-town student who took an overnight bus to study with you and *believes* in you. The barometer of what your choices do to the kids in the room.
- **The Sharma family** — parents who take an EMI loan on your "guarantee." The barometer of the debt trap.
- **Meena** — a junior teacher who joined because she believed in real teaching, and slowly sees what the institute becomes. A conscience the player keeps facing.
- **The whistleblower** — emerges late; identity depends on earlier choices.

A quiet **Human Ledger** persists in state (e.g., `aaravTrust`, `sharmaDebt`, `meenaFaith`) and is shown not as bars but as short status lines in the dossier ("Aarav still calls you *sir*." → later → "Aarav stopped coming to class."). These thresholds, combined with stats, gate certain scenes — including, on a maximally corrupt/high-pressure path, a restrained tragedy beat for Aarav (off-page, implied; see §8). Clean play keeps these characters whole and is visibly the harder, slower road.

## 5. Story arc (7 chapters)

Each chapter keeps a clean/corrupt fork; corrupt options dramatize real (fictionalized) tactics and land on the recurring characters. Research grounds the detail.

1. **Origins — The Rented Room.** Pick subject (Physics / Chemistry / Maths). Aarav arrives. Teach honestly (word of mouth, +Saakh) vs. rank-poster hype & a "100% Selection" banner (+Mudra; regulatory landmine + first small lie to Aarav's family seeded).
2. **Partners — Rich Dads & Poached Stars.** Take a rich partner / poach a star teacher / run a "scholarship-cum-admission test" as a lead funnel that pulls the Sharmas into an EMI vs. transparent merit aid. Meena starts noticing.
3. **The Rank Machine — Borrowed Toppers.** Splash a borrowed topper's face as "our topper" + pay outside students to fail to inflate "selections," and crank hostel pressure on kids like Aarav vs. advertise only real results. (Corrupt: consent-lawsuit/ad-fine seeded; Aarav's status worsens.)
4. **The Leak — Tomorrow's Paper.** The CEE paper leak: the chain (press → trunk → treasury → centre → hall), solver gangs & proxies vs. refuse/report. High Mudra, high Heat, a time bomb — and it means the kids who studied honestly, including Aarav, never had a chance.
5. **Capture — The Seal For Sale.** Mafia/blackmail funding, buy out a rival, buy a friendly official (patronage), invent the **NAT** + "NAT-endorsed" billboards, pay brands to stick logos vs. spend on compliance/student support. **Inspection Day** sub-beat: ghost faculty + actor "patients" + spoofed biometrics + an envelope vs. the real understaffed labs.
6. **The Reckoning — The Leaked Ledger.** A whistleblower (shaped by your treatment of Meena/Aarav) leaks the ledger. Open a real audit, refund families, dismantle the machine (painful, big Saakh recovery) vs. deny & intimidate (buys a news cycle, multiplies the scandal — and targets the whistleblower).
7. **The Crown — Legacy or Ruler.** Centralize control and rule vs. step back and rebuild around students. Leads into the endings — and a final accounting of the Human Ledger.

## 6. Endings (a reckoning, not a high score)

Threshold-driven from final stats **and the Human Ledger**. Each gives a title, sober narrative, and a **reckoning scorecard**: final meters, "what you traded" (Saakh spent → Mudra gained), and **the human accounting** (what became of Aarav, the Sharmas, Meena). Even the richest ending is written to feel hollow.
- **Raid at Dawn** — high Heat, low Saakh: the empire connects to its crimes and collapses.
- **The Uncomfortable Empire** — high Mudra + Power, low Saakh: huge, feared, brittle.
- **The Harder Legacy** — high Saakh, low Heat: smaller, trusted, durable; the characters are whole.
- **The Reckoning Deal** — mixed: survives after reform, repayment, public embarrassment.
- **Hollow Crown** — max Mudra, Saakh floored, Human Ledger devastated: rich and entirely hollow — the "seal is for sale" payoff, written as the bleakest ending.

Ending screen offers **Play another timeline**.

## 7. Visual / UX design

**Art direction:** an upgraded **pixel diorama** (the hero visual — a cracked room that grows into a glowing tower, animated & reactive) wrapped in a dark, sober **"leaked dossier"** UI shell. A single accent color **shifts with Heat** (cool teal → amber → red). Stat bars read like evidence/HUD. The look is serious and a little cold, not cheerful.

**Feel / motion** (restrained, never jokey)
- Typewriter reveal for story text (skippable; disabled under reduced-motion).
- Animated stat changes: count-up, bar fill, a red flash when Heat jumps, a muted pulse when Saakh rises.
- Choice buttons preview their stat effect on hover/focus; clean vs. corrupt visually distinct.
- Smooth, quiet scene/beat transitions, all gated behind `prefers-reduced-motion`.

**Audio (optional, default on, mute toggle):** small WebAudio-generated cues — chalk on choice, a cold cash tone on Mudra gain, a low siren sting on Heat spike. Sparing, used for weight, not fun. No external files (keeps zero-build).

**Screens:** Title (content note + name entry + Continue/New) → Chapter loop → Reckoning ending. Persistent top bar: title, mute, restart.

## 8. Sensitivity, content note & accessibility

**Heaviest theme handled with care.** On a maximally corrupt / high-pressure path, the game confronts the human cost of coaching pressure directly — including a student's death (Aarav). It is **implied, off-page, never graphic or detailed**, framed unambiguously as a consequence of the player's choices, not as spectacle or a "game over" gag. It is reachable, not gratuitous; clean play avoids it.

- **Content warning** on the title screen before play: notes the game deals with academic pressure, exploitation, and self-harm, that it's fiction targeting systems (not real people), and that play is the player's choice.
- A **helpline note** (e.g., a regional mental-health helpline line) shown with the content warning and again on any tragedy beat.
- **Accessibility:** full keyboard operability; visible focus; ARIA labels on meters/choices/scene; `prefers-reduced-motion` disables typewriter + transitions; mobile-first responsive (story stacks under the scene on narrow screens); tap targets ≥ 44px.

## 9. Quality bar / done criteria
- Plays start-to-ending on desktop + mobile widths, no console errors.
- Save/resume survives reload; restart confirms + clears.
- All 7 chapters + 5 endings reachable; the Human Ledger and name interpolation work.
- Content warning + helpline present; tragedy beat is reachable only via the intended path and rendered with restraint.
- Reduced-motion and keyboard-only playthroughs both work.
- Sub-agent code-review pass before merge.

## 10. Risks / mitigations
- **Tone slipping into joke territory:** writing reviewed for seriousness; no gag mechanics; sparing audio/motion.
- **Sensitivity:** implied-only treatment, content warning + helpline, fictional composites, clean-path avoidance.
- **`file://` + multi-file:** global-namespace plain scripts (no ES modules).
- **Scope creep:** no sim, no twists.
- **Monolith regression:** content stays data-driven so teammates extend `data.js` safely.
