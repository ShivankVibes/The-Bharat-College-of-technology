window.BCT = window.BCT || {};
(function (BCT) {
  "use strict";

  var refs = null;
  var typeTimer = null;

  function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function init() {
    refs = {
      saakhText: document.getElementById("saakhText"),
      mudraText: document.getElementById("mudraText"),
      powerText: document.getElementById("powerText"),
      heatText: document.getElementById("heatText"),
      saakhBar: document.getElementById("saakhBar"),
      mudraBar: document.getElementById("mudraBar"),
      powerBar: document.getElementById("powerBar"),
      heatBar: document.getElementById("heatBar"),
      meters: document.querySelectorAll(".meter"),
      stageTag: document.getElementById("stageTag"),
      episodeTag: document.getElementById("episodeTag"),
      yearTag: document.getElementById("yearTag"),
      sceneTitle: document.getElementById("sceneTitle"),
      sceneText: document.getElementById("sceneText"),
      choices: document.getElementById("choices"),
      ledger: document.getElementById("ledger"),
      log: document.getElementById("eventLog")
    };
  }

  // ---- token interpolation ----------------------------------------------
  function interpolate(str, state) {
    if (!str) return "";
    var subj = (BCT.data.subjects[state.subject] || BCT.data.subjects.math);
    return str
      .replace(/\{founder\}/g, state.founder || "Teacher")
      .replace(/\{institute\}/g, state.institute || "the institute")
      .replace(/\{subjectIntro\}/g, subj.intro)
      .replace(/\{subject\}/g, subj.label);
  }

  // ---- meters ------------------------------------------------------------
  var lastMeters = { saakh: null, mudra: null, power: null, heat: null };

  function setMeter(key, value, textEl, barEl, meterEl) {
    if (!textEl || !barEl) return;
    var prev = lastMeters[key];
    barEl.style.width = value + "%";
    if (prev === null || prefersReducedMotion()) {
      textEl.textContent = value;
    } else {
      countUp(textEl, prev, value);
      if (meterEl) {
        var dir = value > prev ? "up" : value < prev ? "down" : null;
        if (dir) {
          meterEl.classList.remove("flash-up", "flash-down");
          // force reflow so the animation re-triggers
          void meterEl.offsetWidth;
          meterEl.classList.add(dir === "up" ? "flash-up" : "flash-down");
        }
      }
    }
    lastMeters[key] = value;
  }

  function countUp(el, from, to) {
    var steps = 16, i = 0;
    var delta = (to - from) / steps;
    clearInterval(el._countTimer);
    el._countTimer = setInterval(function () {
      i++;
      el.textContent = Math.round(from + delta * i);
      if (i >= steps) { el.textContent = to; clearInterval(el._countTimer); }
    }, 18);
  }

  function meterEl(key) {
    if (!refs.meters) return null;
    for (var i = 0; i < refs.meters.length; i++) {
      if (refs.meters[i].getAttribute("data-meter") === key) return refs.meters[i];
    }
    return null;
  }

  function renderMeters(state) {
    if (!refs) init();
    setMeter("saakh", state.saakh, refs.saakhText, refs.saakhBar, meterEl("saakh"));
    setMeter("mudra", state.mudra, refs.mudraText, refs.mudraBar, meterEl("mudra"));
    setMeter("power", state.power, refs.powerText, refs.powerBar, meterEl("power"));
    setMeter("heat", state.heat, refs.heatText, refs.heatBar, meterEl("heat"));
  }

  function resetMeterMemory() {
    lastMeters = { saakh: null, mudra: null, power: null, heat: null };
  }

  // ---- story text (typewriter) ------------------------------------------
  function renderStory(text, opts) {
    if (!refs) init();
    var el = refs.sceneText;
    if (!el) return;
    if (typeTimer) { clearInterval(typeTimer); typeTimer = null; }
    var full = text || "";
    if ((opts && opts.instant) || prefersReducedMotion()) {
      el.textContent = full;
      el.classList.remove("typing");
      return;
    }
    el.textContent = "";
    el.classList.add("typing");
    var i = 0;
    typeTimer = setInterval(function () {
      // reveal a few chars per tick for pace
      i += 2;
      el.textContent = full.slice(0, i);
      if (i >= full.length) {
        el.textContent = full;
        el.classList.remove("typing");
        clearInterval(typeTimer);
        typeTimer = null;
      }
    }, 16);
  }

  function finishStory(text) {
    if (typeTimer) { clearInterval(typeTimer); typeTimer = null; }
    if (refs && refs.sceneText) {
      refs.sceneText.textContent = text;
      refs.sceneText.classList.remove("typing");
    }
  }

  function isTyping() { return !!typeTimer; }

  // ---- choices -----------------------------------------------------------
  function effectSummary(fx) {
    var parts = [];
    if (fx.saakh) parts.push("Saakh " + signed(fx.saakh));
    if (fx.mudra) parts.push("Mudra " + signed(fx.mudra));
    if (fx.power) parts.push("Power " + signed(fx.power));
    if (fx.heat) parts.push("Heat " + signed(fx.heat));
    return parts.join("  ");
  }
  function signed(v) { return v > 0 ? "+" + v : "" + v; }

  function renderChoices(options, onPick) {
    if (!refs) init();
    refs.choices.innerHTML = "";
    options.forEach(function (o) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "choice" + (o.path === "clean" ? " clean" : o.path === "dirty" ? " dirty" : "");
      var label = document.createElement("span");
      label.className = "choice-label";
      label.textContent = o.label;
      btn.appendChild(label);
      if (o.detail || o.effects) {
        var small = document.createElement("small");
        small.className = "choice-fx";
        small.textContent = (o.detail ? o.detail : "") +
          (o.effects ? (o.detail ? "  ·  " : "") + effectSummary(o.effects) : "");
        btn.appendChild(small);
      }
      btn.addEventListener("click", function () { onPick(o); });
      refs.choices.appendChild(btn);
    });
  }

  function renderContinue(label, sub, onClick) {
    if (!refs) init();
    refs.choices.innerHTML = "";
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "choice continue";
    var span = document.createElement("span");
    span.className = "choice-label";
    span.textContent = label;
    btn.appendChild(span);
    if (sub) {
      var small = document.createElement("small");
      small.className = "choice-fx";
      small.textContent = sub;
      btn.appendChild(small);
    }
    btn.addEventListener("click", onClick);
    refs.choices.appendChild(btn);
  }

  // ---- ledger ------------------------------------------------------------
  function pickStatus(statusList, value, ascending) {
    for (var i = 0; i < statusList.length; i++) {
      var s = statusList[i];
      if (ascending) { if (value <= s.max) return s.line; }
      else { if (value >= s.min) return s.line; }
    }
    return statusList[statusList.length - 1].line;
  }

  function renderLedger(state) {
    if (!refs) init();
    if (!refs.ledger) return;
    var C = BCT.data.characters;
    var lines = [
      state.tragedy ? "Aarav is gone. The dossier notes the date and moves on. The world doesn't."
                    : pickStatus(C.aarav.status, state.ledger.aarav, false),
      pickStatus(C.meena.status, state.ledger.meena, false),
      pickStatus(C.sharma.status, state.ledger.sharmaDebt, true)
    ];
    refs.ledger.innerHTML = "";
    lines.forEach(function (line, idx) {
      var li = document.createElement("li");
      if (idx === 0 && state.tragedy) li.className = "grave";
      li.textContent = line;
      refs.ledger.appendChild(li);
    });
  }

  // ---- log ---------------------------------------------------------------
  function renderLog(state) {
    if (!refs) init();
    if (!refs.log) return;
    refs.log.innerHTML = "";
    state.log.slice(-5).reverse().forEach(function (entry) {
      var li = document.createElement("li");
      li.textContent = entry;
      refs.log.appendChild(li);
    });
  }

  // ---- header tags -------------------------------------------------------
  function renderHeader(state, chapter, episodeLabel, titleText) {
    if (!refs) init();
    if (refs.stageTag) refs.stageTag.textContent = "File " + (state.chapter + 1) + " of " + BCT.data.chapters.length;
    if (refs.episodeTag) refs.episodeTag.textContent = episodeLabel;
    if (refs.yearTag) refs.yearTag.textContent = chapter ? chapter.year : "";
    if (refs.sceneTitle) refs.sceneTitle.textContent = titleText;
  }

  BCT.ui = {
    init: init,
    interpolate: interpolate,
    renderMeters: renderMeters,
    resetMeterMemory: resetMeterMemory,
    renderStory: renderStory,
    finishStory: finishStory,
    isTyping: isTyping,
    renderChoices: renderChoices,
    renderContinue: renderContinue,
    renderLedger: renderLedger,
    renderLog: renderLog,
    renderHeader: renderHeader,
    prefersReducedMotion: prefersReducedMotion
  };
})(window.BCT);
