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
      powerText: document.getElementById("powerText"),
      heatText: document.getElementById("heatText"),
      saakhBar: document.getElementById("saakhBar"),
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
      log: document.getElementById("eventLog"),
      // tycoon
      screen: document.getElementById("screen-game"),
      treasuryText: document.getElementById("treasuryText"),
      incomeText: document.getElementById("incomeText"),
      enrollText: document.getElementById("enrollText"),
      dashSub: document.getElementById("dashSub"),
      nfTitle: document.getElementById("nfTitle"),
      nfTeaser: document.getElementById("nfTeaser"),
      nfBar: document.getElementById("nfBar"),
      nfHint: document.getElementById("nfHint"),
      openFileBtn: document.getElementById("openFileBtn"),
      buildGroups: document.getElementById("buildGroups"),
      schemesList: document.getElementById("schemesList"),
      quickInvest: document.getElementById("quickInvest"),
      qiTreasury: document.getElementById("qiTreasury"),
      qiButtons: document.getElementById("qiButtons")
    };
  }

  // ---- mode toggle (dashboard <-> story) --------------------------------
  function setMode(mode) {
    if (!refs) init();
    if (!refs.screen) return;
    refs.screen.classList.toggle("mode-dashboard", mode === "dashboard");
    refs.screen.classList.toggle("mode-story", mode === "story");
  }

  // ---- token interpolation ----------------------------------------------
  function interpolate(str, state) {
    if (!str) return "";
    var subj = (BCT.data.subjects[state.subject] || BCT.data.subjects.maths);
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
    barEl.setAttribute("aria-valuenow", value);
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
      el.removeAttribute("aria-busy");
      return;
    }
    el.textContent = "";
    el.classList.add("typing");
    // Suppress per-character screen-reader spam; announce once when done.
    el.setAttribute("aria-busy", "true");
    var i = 0;
    typeTimer = setInterval(function () {
      // reveal a few chars per tick for pace
      i += 2;
      el.textContent = full.slice(0, i);
      if (i >= full.length) {
        el.textContent = full;
        el.classList.remove("typing");
        el.removeAttribute("aria-busy");
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
      refs.sceneText.removeAttribute("aria-busy");
    }
  }

  function isTyping() { return !!typeTimer; }

  // ---- choices -----------------------------------------------------------
  function effectSummary(fx) {
    var parts = [];
    if (fx.saakh) parts.push("Saakh " + signed(fx.saakh));
    if (fx.mudra) {
      var rupees = fx.mudra * (BCT.econ ? BCT.econ.MUDRA_UNIT : 12000);
      parts.push((fx.mudra > 0 ? "+" : "−") + BCT.econ.format(Math.abs(rupees)));
    }
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

  // ---- tycoon readout ----------------------------------------------------
  function renderTycoonBar(state) {
    if (!refs) init();
    var E = BCT.econ;
    if (refs.treasuryText) refs.treasuryText.textContent = E.format(state.treasury);
    if (refs.incomeText) refs.incomeText.textContent = E.formatRate(E.incomePerSec(state));
    if (refs.enrollText) refs.enrollText.textContent = Math.floor(state.enrollment).toLocaleString("en-IN");
  }

  // ---- dashboard: build the buttons once --------------------------------
  var GROUPS = [
    { key: "room", title: "Subject rooms", keys: ["maths", "physics", "chemistry"] },
    { key: "floor", title: "Floors", keys: ["marketing", "finance", "hostel", "boardroom"] },
    { key: "branch", title: "Expansion", keys: ["branches"] },
    { key: "staff", title: "People", keys: ["teachers", "counselors"] }
  ];

  function buildDashboard(state, handlers) {
    if (!refs) init();
    if (!refs.buildGroups) return;
    refs.buildGroups.innerHTML = "";
    var E = BCT.econ;
    GROUPS.forEach(function (g) {
      var wrap = document.createElement("div");
      wrap.className = "build-group";
      var h = document.createElement("h3");
      h.textContent = g.title;
      wrap.appendChild(h);
      var grid = document.createElement("div");
      grid.className = "build-grid";
      g.keys.forEach(function (key) {
        var cfg = E.ASSETS[key];
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "build-btn";
        btn.setAttribute("data-key", key);
        btn.innerHTML =
          '<span class="b-name">' + cfg.label + ' <em data-lv></em></span>' +
          '<span class="b-blurb">' + cfg.blurb + '</span>' +
          '<span class="b-cost" data-cost></span>';
        btn.addEventListener("click", function () { handlers.onBuy(key); });
        grid.appendChild(btn);
      });
      wrap.appendChild(grid);
      refs.buildGroups.appendChild(wrap);
    });
    // ad blitz one-shot
    var blitzWrap = document.createElement("div");
    blitzWrap.className = "build-group";
    var ab = document.createElement("button");
    ab.type = "button";
    ab.className = "build-btn blitz";
    ab.setAttribute("data-action", "adblitz");
    ab.innerHTML =
      '<span class="b-name">Ad blitz</span>' +
      '<span class="b-blurb">A sudden surge of new students. Raises Heat.</span>' +
      '<span class="b-cost" data-blitzcost></span>';
    ab.addEventListener("click", function () { handlers.onAdBlitz(); });
    blitzWrap.appendChild(ab);
    refs.buildGroups.appendChild(blitzWrap);

    if (refs.openFileBtn) {
      refs.openFileBtn.onclick = function () { handlers.onOpenFile(); };
    }
  }

  // ---- dashboard: refresh dynamic bits each tick ------------------------
  function refreshDashboard(state) {
    if (!refs || !refs.buildGroups) return;
    var E = BCT.econ;
    var btns = refs.buildGroups.querySelectorAll(".build-btn[data-key]");
    for (var i = 0; i < btns.length; i++) {
      var btn = btns[i];
      var key = btn.getAttribute("data-key");
      var lvEl = btn.querySelector("[data-lv]");
      var costEl = btn.querySelector("[data-cost]");
      var maxed = E.maxed(state, key);
      var afford = E.canAfford(state, key);
      if (lvEl) lvEl.textContent = "Lv " + E.lvl(state, key);
      if (costEl) costEl.textContent = maxed ? "MAX" : E.format(E.cost(state, key));
      btn.disabled = maxed || !afford;
      btn.classList.toggle("maxed", maxed);
    }
    var blitz = refs.buildGroups.querySelector("[data-action=adblitz]");
    if (blitz) {
      blitz.querySelector("[data-blitzcost]").textContent = E.format(30000);
      blitz.disabled = state.treasury < 30000;
    }
    renderSchemes(state);
  }

  function renderSchemes(state) {
    if (!refs || !refs.schemesList) return;
    var keys = [];
    for (var k in state.schemes) if (state.schemes[k]) keys.push(k);
    refs.schemesList.innerHTML = "";
    if (!keys.length) {
      var none = document.createElement("li");
      none.className = "none";
      none.textContent = "None. The books are clean — for now.";
      refs.schemesList.appendChild(none);
      return;
    }
    keys.forEach(function (k) {
      var li = document.createElement("li");
      li.className = "scheme-on";
      li.textContent = BCT.econ.SCHEMES[k] ? BCT.econ.SCHEMES[k].label : k;
      refs.schemesList.appendChild(li);
    });
  }

  // ---- next-file card ----------------------------------------------------
  function renderNextFile(state, nextIndex, unlocked) {
    if (!refs) init();
    var E = BCT.econ, D = BCT.data;
    if (nextIndex >= D.chapters.length) {
      if (refs.nfTitle) refs.nfTitle.textContent = "The dossier is complete.";
      if (refs.nfTeaser) refs.nfTeaser.textContent = "There are no more files. The story has reached its end.";
      if (refs.nfHint) refs.nfHint.textContent = "";
      if (refs.nfBar) refs.nfBar.style.width = "100%";
      if (refs.openFileBtn) { refs.openFileBtn.disabled = true; refs.openFileBtn.textContent = "Complete"; }
      return;
    }
    var ch = D.chapters[nextIndex];
    var need = E.unlockThreshold(nextIndex);
    if (refs.nfTitle) refs.nfTitle.textContent = "File " + (nextIndex + 1) + " — " + ch.title;
    if (refs.nfTeaser) refs.nfTeaser.textContent = interpolate(ch.teaser || "", state);
    var pct = need <= 0 ? 100 : Math.min(100, Math.round((state.enrollment / need) * 100));
    if (refs.nfBar) refs.nfBar.style.width = pct + "%";
    if (refs.nfHint) {
      refs.nfHint.textContent = unlocked
        ? "Ready. Open the file when you are."
        : "Unlocks at " + need + " students — you have " + Math.floor(state.enrollment) + ".";
    }
    if (refs.openFileBtn) {
      refs.openFileBtn.disabled = !unlocked;
      refs.openFileBtn.textContent = unlocked ? "Open the file" : "Locked";
    }
  }

  // ---- in-chapter quick invest ------------------------------------------
  function renderQuickInvest(state, keys, onBuy) {
    if (!refs || !refs.quickInvest) return;
    var E = BCT.econ;
    refs.quickInvest.hidden = false;
    if (refs.qiTreasury) refs.qiTreasury.textContent = "· " + E.format(state.treasury);
    refs.qiButtons.innerHTML = "";
    keys.forEach(function (key) {
      var cfg = E.ASSETS[key];
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "qi-btn";
      btn.disabled = !E.canAfford(state, key);
      btn.innerHTML = '<span>' + cfg.label + ' Lv ' + E.lvl(state, key) +
        '</span><small>' + (E.maxed(state, key) ? "MAX" : E.format(E.cost(state, key))) + '</small>';
      btn.addEventListener("click", function () { onBuy(key); });
      refs.qiButtons.appendChild(btn);
    });
  }
  function hideQuickInvest() {
    if (refs && refs.quickInvest) refs.quickInvest.hidden = true;
  }

  BCT.ui = {
    init: init,
    setMode: setMode,
    renderTycoonBar: renderTycoonBar,
    buildDashboard: buildDashboard,
    refreshDashboard: refreshDashboard,
    renderSchemes: renderSchemes,
    renderNextFile: renderNextFile,
    renderQuickInvest: renderQuickInvest,
    hideQuickInvest: hideQuickInvest,
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
