window.BCT = window.BCT || {};
(function (BCT) {
  "use strict";

  var S = BCT.state, D = BCT.data, UI = BCT.ui, SC = BCT.scene, AU = BCT.audio;
  var state = null;
  var currentText = "";

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

  // ---- screen helpers ----------------------------------------------------
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
        S.clearSave();
        AU.cue("click");
        show("screen-title");
        refreshContinue();
      }
    });
    // Skip the typewriter by clicking the story text.
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
      var subj = document.getElementById("subjectSelect").value || "math";
      AU.cue("chalk");
      startGame(f, inst, subj);
    });
    var cont = document.getElementById("continueBtn");
    if (cont) cont.addEventListener("click", function () {
      var saved = S.load();
      if (saved) { state = saved; AU.cue("click"); show("screen-game"); UI.resetMeterMemory(); render(); }
    });
  }

  function refreshContinue() {
    var cont = document.getElementById("continueBtn");
    if (!cont) return;
    cont.style.display = S.load() ? "" : "none";
  }

  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  // ---- game start --------------------------------------------------------
  function startGame(founder, institute, subject) {
    state = S.defaultState();
    state.founder = founder;
    state.institute = institute;
    state.subject = subject;
    state.log = [UI.interpolate("{institute} opens above a sweet shop. Six students. One whiteboard.", state)];
    S.save(state);
    show("screen-game");
    UI.resetMeterMemory();
    render();
  }

  // ---- main render -------------------------------------------------------
  function chapter() { return D.chapters[state.chapter]; }

  function render() {
    var ch = chapter();
    var choice = state.selectedChoice;

    if (state.episode === "choice") {
      renderChoiceBeat(ch);
    } else if (state.episode === "profit") {
      renderProfitBeat(ch, choice);
    } else if (state.episode === "consequence") {
      renderConsequenceBeat(ch, choice);
    } else if (state.episode === "tragedy") {
      renderTragedyBeat(ch);
    }

    UI.renderMeters(state);
    UI.renderLedger(state);
    UI.renderLog(state);
    SC.render(state, ch, choice);
  }

  function renderChoiceBeat(ch) {
    if (!state.routeIntent) {
      UI.renderHeader(state, ch, "The Choice", ch.title);
      setText(UI.interpolate(ch.choiceText, state) +
        "\n\nWill you take the shortcut?");
      UI.renderChoices([
        wrapRoute("clean", ch.routeQuestion.clean),
        wrapRoute("dirty", ch.routeQuestion.dirty)
      ], function (o) { selectRoute(o.path); });
    } else {
      var isDirty = state.routeIntent === "dirty";
      UI.renderHeader(state, ch, isDirty ? "The Shortcut" : "The Honest Road",
        ch.title + (isDirty ? " — Shortcut" : " — Honest Road"));
      setText(isDirty
        ? "You chose the shortcut. Choose how far you take it. The room will show you the profit, and then what it costs."
        : "You chose the honest road. Choose how you walk it. The room will show you the profit, and then what it spares.");
      UI.renderChoices(ch.routes[state.routeIntent], function (o) { selectChoice(o); });
    }
  }

  function wrapRoute(path, rq) {
    return { path: path, label: rq.label, detail: rq.detail };
  }

  function renderProfitBeat(ch, choice) {
    UI.renderHeader(state, ch, "The Profit", ch.title + " — The Profit");
    setText(UI.interpolate(ch.profitBase + " " + choice.profit, state));
    UI.renderContinue("See what it cost", "The consequence", function () {
      AU.cue("click");
      state.episode = "consequence";
      render();
    });
  }

  function renderConsequenceBeat(ch, choice) {
    UI.renderHeader(state, ch, "The Consequence", ch.title + " — The Consequence");
    setText(UI.interpolate(ch.consequenceBase + " " + choice.consequence, state));
    var label, sub;
    if (state._tragedyPending) {
      label = "Continue"; sub = "There is a page you have to read";
    } else if (ch.final) {
      label = "Reveal the ending"; sub = "The final accounting";
    } else {
      label = "Turn the page"; sub = "The next file";
    }
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
      goToNextChapterOrEnding();
    });
  }

  // ---- transitions -------------------------------------------------------
  function selectRoute(path) {
    AU.cue("click");
    state.routeIntent = path;
    render();
  }

  function selectChoice(option) {
    state.selectedChoice = option;
    S.applyEffects(state, option.effects);
    state.log.push(UI.interpolate(option.log, state));
    var triggered = S.checkTragedy(state);
    if (triggered) state._tragedyPending = true;
    AU.cue(option.path === "dirty" ? "cash" : "saakh");
    state.episode = "profit";
    S.save(state);
    render();
  }

  function advance() {
    if (state._tragedyPending) {
      state.episode = "tragedy";
      S.save(state);
      render();
      return;
    }
    goToNextChapterOrEnding();
  }

  function goToNextChapterOrEnding() {
    var ch = chapter();
    if (ch.final) {
      showEnding();
      return;
    }
    state.chapter += 1;
    state.episode = "choice";
    state.routeIntent = null;
    state.selectedChoice = null;
    S.save(state);
    render();
  }

  // ---- ending ------------------------------------------------------------
  function showEnding() {
    var key = S.selectEnding(state);
    var e = D.endings[key];
    S.clearSave();

    UI.renderHeader(state, chapter(), "Final Accounting", e.title);
    var scorecard = buildScorecard();
    setText(UI.interpolate(e.text, state) + "\n\n" + scorecard);

    UI.renderContinue("Play another timeline", "Restart", function () {
      AU.cue("click");
      show("screen-title");
      refreshContinue();
    });

    UI.renderMeters(state);
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
    return "WHAT YOU BUILT — Saakh " + state.saakh + " · Mudra " + state.mudra +
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

  // ---- text helper -------------------------------------------------------
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
