# The Bharat College of Technology — Implementation Plan

> **For agentic workers:** Steps use checkbox (`- [ ]`) syntax for tracking. This is a zero-build vanilla JS project — no test runner; pure logic is covered by `test.html` (in-browser asserts), behavior by manual verification in a browser, and a final sub-agent code-review pass.

**Goal:** Rebuild the existing single-file game into a polished, serious branching-narrative web game (per the rev-2 spec) with named characters, a human ledger, save/resume, naming, content warning, and a reactive pixel scene.

**Architecture:** Zero-build static site. Ordered plain `<script>` files attach to one global `BCT` namespace (no ES modules, so it runs from `file://` and GitHub Pages). All story content is data-driven in `src/data.js`; engine logic is in `src/state.js`; rendering in `src/ui.js` + `src/scene.js`; boot/wiring in `src/main.js`.

**Tech Stack:** HTML5, CSS3 (custom properties, grid/flex, keyframes), vanilla JS (ES2017, no modules), localStorage, WebAudio.

---

## File Structure

```
index.html        # shell markup, content-warning + title screens, script tags in load order
styles.css        # theme tokens, dossier shell, pixel diorama, meters, animations, responsive
src/data.js       # BCT.data: chapters[], characters, endings[], floors, copy, name pools
src/state.js      # BCT.state: defaultState, clamp, applyEffects, ledger updates, ending selection, save/load
src/audio.js      # BCT.audio: WebAudio cues (chalk/cash/siren), mute toggle
src/scene.js      # BCT.scene: render pixel diorama + reactions to stats/episode
src/ui.js         # BCT.ui: render meters, story (typewriter), choices, ledger lines, transitions
src/main.js       # BCT.main: boot, screen flow (warning→title→game→ending), event wiring, game loop
test.html         # in-browser assertions for state.js pure logic
README.md         # how to run + contribute (add a chapter to data.js)
```
(Old `game.js` is removed; its logic is split across the `src/` files.)

---

### Task 1: Scaffold namespace + engine logic (`state.js`) with tests

**Files:**
- Create: `src/state.js`
- Create: `test.html`

- [ ] **Step 1: Write `src/state.js`** — pure, DOM-free engine.

```js
window.BCT = window.BCT || {};
(function (BCT) {
  "use strict";
  var SAVE_KEY = "bct.save.v1";

  function defaultState() {
    return {
      founder: "", institute: "", subject: "math",
      chapter: 0, episode: "choice", routeIntent: null, selectedChoice: null,
      saakh: 55, mudra: 18, power: 5, heat: 0,
      ledger: { aarav: 60, sharmaDebt: 0, meena: 60, whistleblower: null },
      tragedy: false,
      log: []
    };
  }

  function clamp(n) { return Math.max(0, Math.min(100, Math.round(n))); }

  function applyEffects(s, fx) {
    if (!fx) return;
    s.saakh = clamp(s.saakh + (fx.saakh || 0));
    s.mudra = clamp(s.mudra + (fx.mudra || 0));
    s.power = clamp(s.power + (fx.power || 0));
    s.heat = clamp(s.heat + (fx.heat || 0));
    if (fx.ledger) {
      if (typeof fx.ledger.aarav === "number") s.ledger.aarav = clamp(s.ledger.aarav + fx.ledger.aarav);
      if (typeof fx.ledger.meena === "number") s.ledger.meena = clamp(s.ledger.meena + fx.ledger.meena);
      if (typeof fx.ledger.sharmaDebt === "number") s.ledger.sharmaDebt = clamp(s.ledger.sharmaDebt + fx.ledger.sharmaDebt);
    }
  }

  // Aarav reaches a breaking point only under sustained corruption + pressure.
  function checkTragedy(s) {
    if (!s.tragedy && s.ledger.aarav <= 8 && s.heat >= 60 && s.saakh <= 30) {
      s.tragedy = true;
      return true;
    }
    return false;
  }

  function selectEnding(s) {
    var l = s.ledger;
    var devastated = l.aarav <= 15 && l.meena <= 20;
    if (s.mudra >= 80 && s.saakh <= 12 && devastated) return "hollow";
    if (s.heat >= 80 && s.saakh <= 35) return "raid";
    if (s.mudra >= 70 && s.power >= 70 && s.saakh < 55) return "empire";
    if (s.saakh >= 72 && s.heat <= 35) return "legacy";
    return "reform";
  }

  function save(s) {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(s)); return true; } catch (e) { return false; }
  }
  function load() {
    try { var raw = localStorage.getItem(SAVE_KEY); return raw ? JSON.parse(raw) : null; } catch (e) { return null; }
  }
  function clearSave() { try { localStorage.removeItem(SAVE_KEY); } catch (e) {} }

  BCT.state = {
    SAVE_KEY: SAVE_KEY, defaultState: defaultState, clamp: clamp, applyEffects: applyEffects,
    checkTragedy: checkTragedy, selectEnding: selectEnding, save: save, load: load, clearSave: clearSave
  };
})(window.BCT);
```

- [ ] **Step 2: Write `test.html`** — loads `state.js`, asserts pure logic, prints PASS/FAIL.

```html
<!DOCTYPE html><html><head><meta charset="utf-8"><title>BCT tests</title></head>
<body><pre id="out"></pre>
<script src="src/state.js"></script>
<script>
var out = document.getElementById("out"), pass = 0, fail = 0;
function ok(name, cond){ (cond?pass++:fail++); out.textContent += (cond?"PASS  ":"FAIL  ")+name+"\n"; }
var S = BCT.state;
ok("clamp upper", S.clamp(140) === 100);
ok("clamp lower", S.clamp(-5) === 0);
var s = S.defaultState();
S.applyEffects(s, { saakh:-30, mudra:40, heat:30, ledger:{ aarav:-60 } });
ok("effects applied", s.mudra === 58 && s.saakh === 25 && s.ledger.aarav === 0);
ok("tragedy triggers on corrupt+pressure", S.checkTragedy(s) === true && s.tragedy === true);
ok("tragedy fires once", S.checkTragedy(s) === false);
var clean = S.defaultState(); clean.saakh = 80; clean.heat = 20;
ok("legacy ending", S.selectEnding(clean) === "legacy");
var hollow = S.defaultState(); hollow.mudra=90; hollow.saakh=8; hollow.ledger.aarav=5; hollow.ledger.meena=10;
ok("hollow ending", S.selectEnding(hollow) === "hollow");
out.textContent += "\n"+pass+" passed, "+fail+" failed\n";
document.title = fail ? "FAIL" : "PASS";
</script></body></html>
```

- [ ] **Step 3: Verify** — open `test.html` in a browser. Expected: all assertions PASS, title shows "PASS".
- [ ] **Step 4: Commit** — `git add src/state.js test.html && git commit -m "feat: engine state + in-browser tests"`

---

### Task 2: Story content (`data.js`)

**Files:** Create `src/data.js`

- [ ] **Step 1:** Implement `BCT.data` with: `namePools` (founder/institute "surprise me" lists), `subjects` (physics/chemistry/math labels + scene copy), `characters` (aarav/sharma/meena descriptors + ledger status thresholds → status lines), `floors` (ads/finance/dept/board), `chapters[]` (7 entries; each: id, year, title, scene, choiceText, route question copy, and per-route 3 options with `{label, detail, path, effects:{saakh,mudra,power,heat,ledger}, profit, consequence, log}`), and `endings` map (`hollow/raid/empire/legacy/reform` → `{title, text, board, cardTitle, cardSub}`). Use `{founder}`/`{institute}`/`{subject}` tokens in copy. Content follows spec §5/§6 and the research detail (CEE leak chain, fake toppers, ghost-faculty inspection, NAT, capitation). Tone: serious, restrained, second-person.
- [ ] **Step 2: Verify** — open `test.html`; add `ok("7 chapters", BCT.data.chapters.length === 7)` after sourcing `data.js`. All PASS.
- [ ] **Step 3: Commit** — `git commit -am "feat: full story content (7 chapters, 5 endings, characters)"`

---

### Task 3: Audio cues (`audio.js`)

**Files:** Create `src/audio.js`

- [ ] **Step 1:** Implement `BCT.audio` using a lazily-created `AudioContext`: `cue(name)` for `chalk` (short noise burst), `cash` (cold two-tone), `siren` (low sweep); `setMuted(bool)`, `muted` flag persisted to localStorage; guard if WebAudio unavailable. Default unmuted.
- [ ] **Step 2: Verify** — temporary button in `test.html` calling `BCT.audio.cue('cash')` makes a sound; mute silences it. Remove the temp button after.
- [ ] **Step 3: Commit** — `git commit -am "feat: WebAudio cues + mute"`

---

### Task 4: Pixel scene (`scene.js`) + styles for the diorama

**Files:** Create `src/scene.js`; create/extend `styles.css` (diorama section)

- [ ] **Step 1:** Port + upgrade the pixel diorama from the old `game.js`/`styles.css`: room that grows into a city tower, sprites (founder, students incl. an `aarav` sprite, official), building floors. `BCT.scene.render(state, chapter, choice)` toggles scene classes (`room/city/profit/heat/crisis`) by chapter/episode/heat, sets the board text, and dims/greys Aarav's sprite as `ledger.aarav` falls. Accent color driven by a CSS var `--heat` set from state.
- [ ] **Step 2: Verify** — temporary harness renders chapter 0 and a high-heat state; confirm room vs city + accent shift visually.
- [ ] **Step 3: Commit** — `git commit -am "feat: reactive pixel diorama"`

---

### Task 5: UI rendering (`ui.js`) — meters, story, choices, ledger, typewriter

**Files:** Create `src/ui.js`; extend `styles.css`

- [ ] **Step 1:** Implement `BCT.ui`: `renderMeters(state)` with count-up + bar fill + flash classes; `renderStory(text, {instant})` typewriter honoring `prefers-reduced-motion`; `renderChoices(options, onPick)` with effect-preview `<small>` and clean/dirty styling; `renderLedger(state)` short status lines from `data.characters`; `renderLog(state)`; `interpolate(str, state)` for `{founder}`/`{institute}`/`{subject}` tokens; `transition()` fade helper.
- [ ] **Step 2: Verify** — temporary harness renders a sample chapter; meters animate, typewriter runs, choices show previews, ledger lines show.
- [ ] **Step 3: Commit** — `git commit -am "feat: UI rendering, typewriter, ledger lines"`

---

### Task 6: Shell markup + screens (`index.html`) + full styling pass

**Files:** Rewrite `index.html`; extend `styles.css`

- [ ] **Step 1:** Build `index.html`: content-warning overlay (themes + fiction note + helpline + "I understand" gate), title screen (founder/institute inputs + "surprise me" + Continue/New), game board (scene + meters + story panel + choices + ledger + log), persistent top bar (title, mute toggle, restart). Script tags in order: `data, state, audio, scene, ui, main`. Full responsive + accessible styling pass in `styles.css` (mobile stacks panel under scene; focus states; ARIA).
- [ ] **Step 2: Verify** — page loads; content warning shows first; title screen accepts names; layout holds at 360px and desktop widths; no console errors.
- [ ] **Step 3: Commit** — `git commit -am "feat: shell, content warning, title + game screens, responsive styles"`

---

### Task 7: Game loop + wiring (`main.js`)

**Files:** Create `src/main.js`

- [ ] **Step 1:** Implement `BCT.main`: boot (show content warning → title; offer Continue if `BCT.state.load()`), `startGame(founder, institute, subject)`, the choice→profit→consequence→advance loop calling `applyEffects`/`checkTragedy`/`save` after each pick, route-question then 3-option rendering, the restrained **tragedy beat** (implied text + helpline) when `checkTragedy` fires, ending screen via `selectEnding` with the reckoning scorecard (final meters + "what you traded" + human accounting), restart-with-confirm, mute wiring, autosave.
- [ ] **Step 2: Verify** — full playthrough twice: an all-clean route (reaches `legacy`, characters whole, no tragedy) and an all-corrupt route (reaches `hollow`, tragedy beat appears once with helpline). Save persists across reload; restart confirms + clears. No console errors on desktop + 360px.
- [ ] **Step 3: Commit** — `git commit -am "feat: game loop, screens flow, tragedy beat, reckoning endings"`

---

### Task 8: README + cleanup

**Files:** Modify `README.md`; delete `game.js`

- [ ] **Step 1:** README: what the game is (one serious paragraph), how to run (open `index.html` / GitHub Pages), how to contribute a chapter (edit `src/data.js`), the content note. Remove obsolete `game.js`.
- [ ] **Step 2: Verify** — links/paths correct; `index.html` references no missing files.
- [ ] **Step 3: Commit** — `git commit -am "docs: README + remove legacy game.js"`

---

### Task 9: Sub-agent code review + fixes

- [ ] **Step 1:** Dispatch a code-review sub-agent over the diff (correctness, no console errors, accessibility, tone/sensitivity of the tragedy beat, zero-build integrity / no ES-module usage).
- [ ] **Step 2:** Triage findings; fix real issues; re-verify the two playthroughs + `test.html`.
- [ ] **Step 3: Commit** — `git commit -am "fix: address code-review findings"`

---

### Task 10: Push

- [ ] **Step 1:** `git push -u origin revamp-dossier`. (PR/merge left to the user unless they ask otherwise.)

---

## Self-Review

- **Spec coverage:** §1 framing → Tasks 6/7 (dossier shell, sober copy). §3 architecture → Task 1 namespace pattern, all `src/` files. §4.1 stats → Task 1. §4.2 loop → Task 7. §4.3 save → Task 1+7. §4.4 naming → Tasks 5 (interpolate) + 6 (inputs). §4.5 characters/ledger → Tasks 1 (ledger state) + 2 (status lines) + 5 (render) + 4 (Aarav sprite). §5 chapters → Task 2. §6 endings → Tasks 1 (select) + 2 (copy) + 7 (scorecard). §7 visuals/audio → Tasks 3/4/5/6. §8 sensitivity/content warning/helpline/accessibility → Tasks 6/7. §9 done criteria → Task 7 verify + Task 9. All covered.
- **Placeholder scan:** Task 2/4/5/6 describe content rather than pasting every line of story prose/CSS — acceptable because the exact prose is authored at implementation time against the spec; all *interfaces* (function names, state shape, effect schema, ending keys) are fully specified in Task 1 and reused consistently.
- **Type consistency:** state shape, `applyEffects` effect schema (`{saakh,mudra,power,heat,ledger:{aarav,meena,sharmaDebt}}`), ending keys (`hollow/raid/empire/legacy/reform`), and `BCT.{data,state,audio,scene,ui,main}` namespaces are consistent across all tasks.
