window.BCT = window.BCT || {};
(function (BCT) {
  "use strict";

  var S = BCT.state, D = BCT.data, EC = BCT.econ, UI = BCT.ui, SC = BCT.scene, AU = BCT.audio;
  var state = null;
  var currentText = "";
  var mode = "dashboard";       // "dashboard" | "story"
  var tickTimer = null;
  var lastFrame = 0;

  var HELPLINE =
    "If you or someone you know is struggling, you are not alone. " +
    "Tele MANAS (India), 24x7: 14416 or 1-800-891-4416. iCall: 9152987821.";

  var TRAGEDY =
    "The dossier includes one photograph here, and then a blank page.\n\n" +
    "Aarav came off an overnight bus four years ago because a teacher promised him a future. " +
    "His name sat near the bottom of your rank wall every single morning. First he went quiet. " +
    "Then he stopped coming to class. Then he stopped.\n\n" +
    "You never touched him. You did it with a guarantee you couldn't keep, a seat you sold to " +
    "someone richer, a wall built to make children afraid. The file records his name. It does not " +
    "list yours as the cause. It doesn't need to.";

  function now() { return Date.now(); }

  // ---- screens -----------------------------------------------------------
  function show(id) {
    ["screen-warning", "screen-title", "screen-game"].forEach(function (s) {
      var el = document.getElementById(s);
      if (el) el.classList.toggle("active", s === id);
    });
  }

  // ---- boot --------------------------------------------------------------
  function boot() {
    UI.init();
    SC.init();
    wireChrome();
    wireWarning();
    wireTitle();
    show("screen-warning");
    syncMuteButton();
  }

  function wireChrome() {
    var mute = document.getElementById("muteBtn");
    if (mute) mute.addEventListener("click", function () {
      AU.setMuted(!AU.isMuted());
      syncMuteButton();
      if (!AU.isMuted()) AU.cue("click");
    });
    var restart = document.getElementById("restartBtn");
    if (restart) restart.addEventListener("click", function () {
      if (window.confirm("Restart? This erases your saved game and begins a new timeline.")) {
        stopTick();
        S.clearSave();
        AU.cue("click");
        show("screen-title");
        refreshContinue();
      }
    });
    var story = document.getElementById("sceneText");
    if (story) story.addEventListener("click", function () {
      if (UI.isTyping()) UI.finishStory(currentText);
    });
  }

  function syncMuteButton() {
    var mute = document.getElementById("muteBtn");
    if (mute) {
      mute.textContent = AU.isMuted() ? "Sound: off" : "Sound: on";
      mute.setAttribute("aria-pressed", AU.isMuted() ? "true" : "false");
    }
  }

  function wireWarning() {
    var ack = document.getElementById("ackBtn");
    if (ack) ack.addEventListener("click", function () {
      AU.cue("click");
      show("screen-title");
      refreshContinue();
    });
  }

  function wireTitle() {
    var surprise = document.getElementById("surpriseBtn");
    if (surprise) surprise.addEventListener("click", function () {
      AU.cue("click");
      document.getElementById("founderInput").value = pick(D.namePools.founders);
      document.getElementById("instituteInput").value = pick(D.namePools.institutes);
    });
    var start = document.getElementById("startBtn");
    if (start) start.addEventListener("click", function () {
      var f = (document.getElementById("founderInput").value || "").trim() || pick(D.namePools.founders);
      var inst = (document.getElementById("instituteInput").value || "").trim() || pick(D.namePools.institutes);
      var subj = document.getElementById("subjectSelect").value || "maths";
      AU.cue("chalk");
      startGame(f, inst, subj);
    });
    ["founderInput", "instituteInput"].forEach(function (id) {
      var inp = document.getElementById(id);
      if (inp) inp.addEventListener("keydown", function (e) {
        if (e.key === "Enter" && start) { e.preventDefault(); start.click(); }
      });
    });
    var cont = document.getElementById("continueBtn");
    if (cont) cont.addEventListener("click", function () {
      var saved = S.load();
      if (!saved) return;
      state = saved;
      AU.cue("click");
      var earned = EC.creditOffline(state, now());
      show("screen-game");
      UI.resetMeterMemory();
      enterDashboard(earned);
    });
  }

  function refreshContinue() {
    var cont = document.getElementById("continueBtn");
    if (!cont) return;
    cont.style.display = S.load() ? "" : "none";
  }

  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  // ---- start -------------------------------------------------------------
  function startGame(founder, institute, subject) {
    state = S.defaultState();
    state.founder = founder;
    state.institute = institute;
    state.subject = subject;
    state.assets[subject] = 1; // you start with your one room
    state.lastTick = now();
    state.log = [UI.interpolate("{institute} opens above a sweet shop. Six students. One whiteboard.", state)];
    S.save(state);
    show("screen-game");
    UI.resetMeterMemory();
    enterDashboard(0);
  }

  // ---- dashboard ---------------------------------------------------------
  function enterDashboard(earnedOffline) {
    mode = "dashboard";
    UI.setMode("dashboard");
    UI.hideQuickInvest();
    state.lastTick = now();
    lastFrame = now();
    UI.buildDashboard(state, {
      onBuy: doBuy,
      onAdBlitz: doAdBlitz,
      onOpenFile: openNextFile
    });
    if (earnedOffline && earnedOffline > 1) {
      state.log.push("While you were away, fees kept coming: +" + EC.format(earnedOffline) + ".");
    }
    dashSub();
    paintAll();
    startTick();
  }

  function dashSub() {
    var el = document.getElementById("dashSub");
    if (!el) return;
    var next = state.chaptersDone;
    if (next >= D.chapters.length) { el.textContent = "The story is complete. The empire runs on."; return; }
    el.textContent = "Build it. Watch the Mudra come in. The next file opens as you grow.";
  }

  function startTick() {
    stopTick();
    lastFrame = now();
    tickTimer = setInterval(onTick, 1000);
  }
  function stopTick() {
    if (tickTimer) { clearInterval(tickTimer); tickTimer = null; }
  }

  function onTick() {
    if (mode !== "dashboard" || !state) return;
    var t = now();
    var dt = Math.min(5, Math.max(0, (t - lastFrame) / 1000));
    lastFrame = t;
    state.lastTick = t;
    EC.tick(state, dt);
    paintAll();
    S.save(state);
  }

  // paint everything that the dashboard shows
  function paintAll() {
    UI.renderTycoonBar(state);
    UI.refreshDashboard(state);
    UI.renderMeters(state);
    UI.renderLedger(state);
    UI.renderLog(state);
    SC.renderDashboard(state);
    var next = state.chaptersDone;
    UI.renderNextFile(state, next, next < D.chapters.length && EC.chapterUnlocked(state, next));
  }

  function doBuy(key) {
    if (EC.buy(state, key)) {
      AU.cue("click");
      paintAll();
      S.save(state);
    }
  }
  function doAdBlitz() {
    if (EC.adBlitz(state)) {
      AU.cue("cash");
      paintAll();
      S.save(state);
    }
  }

  // ---- open the next story file -----------------------------------------
  function openNextFile() {
    var next = state.chaptersDone;
    if (next >= D.chapters.length || !EC.chapterUnlocked(state, next)) return;
    stopTick();
    mode = "story";
    UI.setMode("story");
    AU.cue("chalk");
    state.chapter = next;
    state.episode = "choice";
    state.routeIntent = null;
    state.selectedChoice = null;
    renderStoryBeat();
  }

  function chapter() { return D.chapters[state.chapter]; }

  // ---- story beats -------------------------------------------------------
  function renderStoryBeat() {
    var ch = chapter();
    var choice = state.selectedChoice;
    if (state.episode === "choice") renderChoiceBeat(ch);
    else if (state.episode === "profit") renderProfitBeat(ch, choice);
    else if (state.episode === "consequence") renderConsequenceBeat(ch, choice);
    else if (state.episode === "tragedy") renderTragedyBeat(ch);

    UI.renderMeters(state);
    UI.renderTycoonBar(state);
    UI.renderLedger(state);
    UI.renderLog(state);
    SC.render(state, ch, choice);
  }

  function renderChoiceBeat(ch) {
    if (!state.routeIntent) {
      UI.renderHeader(state, ch, "The Choice", ch.title);
      setText(UI.interpolate(ch.choiceText, state) + "\n\nWill you take the shortcut?");
      UI.renderChoices([
        { path: "clean", label: ch.routeQuestion.clean.label, detail: ch.routeQuestion.clean.detail },
        { path: "dirty", label: ch.routeQuestion.dirty.label, detail: ch.routeQuestion.dirty.detail }
      ], function (o) { selectRoute(o.path); });
      showQuickInvest();
    } else {
      var isDirty = state.routeIntent === "dirty";
      UI.renderHeader(state, ch, isDirty ? "The Shortcut" : "The Honest Road",
        ch.title + (isDirty ? " — Shortcut" : " — Honest Road"));
      setText(isDirty
        ? "You chose the shortcut. Choose how far you take it. The room will show you the profit, and then what it costs."
        : "You chose the honest road. Choose how you walk it. The room will show you the profit, and then what it spares.");
      UI.renderChoices(ch.routes[state.routeIntent], function (o) { selectChoice(o); });
      showQuickInvest();
    }
  }

  function showQuickInvest() {
    var keys = [state.subject, "marketing", "teachers", "counselors"];
    UI.renderQuickInvest(state, keys, function (key) {
      if (EC.buy(state, key)) {
        AU.cue("click");
        UI.renderTycoonBar(state);
        UI.renderMeters(state);
        UI.renderLedger(state);
        showQuickInvest();
        S.save(state);
      }
    });
  }

  function renderProfitBeat(ch, choice) {
    UI.hideQuickInvest();
    UI.renderHeader(state, ch, "The Profit", ch.title + " — The Profit");
    setText(UI.interpolate(ch.profitBase + " " + choice.profit, state));
    UI.renderContinue("See what it cost", "The consequence", function () {
      AU.cue("click");
      state.episode = "consequence";
      renderStoryBeat();
    });
  }

  function renderConsequenceBeat(ch, choice) {
    UI.renderHeader(state, ch, "The Consequence", ch.title + " — The Consequence");
    setText(UI.interpolate(ch.consequenceBase + " " + choice.consequence, state));
    var label, sub;
    if (state._tragedyPending) { label = "Continue"; sub = "There is a page you have to read"; }
    else if (ch.final) { label = "Reveal the ending"; sub = "The final accounting"; }
    else { label = "Back to the institute"; sub = "Keep building"; }
    UI.renderContinue(label, sub, function () {
      AU.cue("click");
      advance();
    });
  }

  function renderTragedyBeat(ch) {
    UI.renderHeader(state, ch, "The Cost", "An Empty Seat");
    AU.cue("toll");
    setText(TRAGEDY + "\n\n" + HELPLINE);
    UI.renderContinue("Continue", "", function () {
      AU.cue("click");
      state._tragedyPending = false;
      finishChapter();
    });
  }

  // ---- choice handlers ---------------------------------------------------
  function selectRoute(path) {
    AU.cue("click");
    state.routeIntent = path;
    renderStoryBeat();
  }

  function selectChoice(option) {
    state.selectedChoice = option;
    S.applyEffects(state, option.effects);
    var ch = chapter();
    // mechanical consequences for the economy:
    if (option.path === "dirty" && ch.scheme) {
      state.schemes[ch.scheme] = true; // unlock the corrupt revenue stream
    }
    if (option.path === "clean" && ch.id === "reckoning") {
      state.schemes = {}; // reform: dismantle the machine
    }
    state.log.push(UI.interpolate(option.log, state));
    if (S.checkTragedy(state)) state._tragedyPending = true;
    AU.cue(option.path === "dirty" ? "cash" : "saakh");
    state.episode = "profit";
    UI.hideQuickInvest();
    S.save(state);
    renderStoryBeat();
  }

  function advance() {
    if (state._tragedyPending) {
      state.episode = "tragedy";
      S.save(state);
      renderStoryBeat();
      return;
    }
    finishChapter();
  }

  function finishChapter() {
    var ch = chapter();
    state.chaptersDone = Math.max(state.chaptersDone, state.chapter + 1);
    if (ch.final) { showEnding(); return; }
    S.save(state);
    enterDashboard(0);
  }

  // ---- ending ------------------------------------------------------------
  function showEnding() {
    stopTick();
    mode = "story";
    UI.setMode("story");
    UI.hideQuickInvest();
    var key = S.selectEnding(state);
    var e = D.endings[key];
    S.clearSave();

    UI.renderHeader(state, chapter(), "Final Accounting", e.title);
    setText(UI.interpolate(e.text, state) + "\n\n" + buildScorecard());
    UI.renderContinue("Play another timeline", "Restart", function () {
      AU.cue("click");
      show("screen-title");
      refreshContinue();
    });

    UI.renderMeters(state);
    UI.renderTycoonBar(state);
    UI.renderLedger(state);
    UI.renderLog(state);
    SC.showEnding(key);
    if (key === "hollow" || key === "raid") AU.cue("siren"); else AU.cue("saakh");
  }

  function buildScorecard() {
    var C = D.characters;
    var aarav = state.tragedy
      ? "Aarav: did not make it to the other side of your empire."
      : "Aarav: " + statusLine(C.aarav.status, state.ledger.aarav, false);
    var meena = "Meena: " + statusLine(C.meena.status, state.ledger.meena, false);
    var sharma = "The Sharmas: " + statusLine(C.sharma.status, state.ledger.sharmaDebt, true);
    return "WHAT YOU BUILT — " + EC.format(state.treasury) + " banked · " +
      Math.floor(state.enrollment) + " students · Saakh " + state.saakh +
      " · Power " + state.power + " · Heat " + state.heat +
      "\n\nWHO PAID FOR IT —\n" + aarav + "\n" + meena + "\n" + sharma;
  }

  function statusLine(list, value, ascending) {
    for (var i = 0; i < list.length; i++) {
      if (ascending) { if (value <= list[i].max) return list[i].line; }
      else { if (value >= list[i].min) return list[i].line; }
    }
    return list[list.length - 1].line;
  }

  function setText(text) {
    currentText = text;
    UI.renderStory(text);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  BCT.main = { boot: boot };
})(window.BCT);
