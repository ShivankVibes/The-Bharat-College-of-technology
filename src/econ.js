window.BCT = window.BCT || {};
(function (BCT) {
  "use strict";

  var clamp = BCT.state.clamp;

  // Chapter reward "mudra" deltas (authored 0..~28 in data) become real rupees.
  var MUDRA_UNIT = 12000;

  // Offline earnings are capped so leaving overnight isn't a jackpot.
  var OFFLINE_CAP_SEC = 8 * 3600;

  // ---- buildable assets --------------------------------------------------
  // group: room | floor | branch | staff. level-based cost = base * growth^level.
  var ASSETS = {
    maths:      { label: "Maths Room",      group: "room",  base: 25000,  growth: 1.7,  max: 6, blurb: "Seats and fees for Maths." },
    physics:    { label: "Physics Room",    group: "room",  base: 25000,  growth: 1.7,  max: 6, blurb: "Seats and fees for Physics." },
    chemistry:  { label: "Chemistry Room",  group: "room",  base: 25000,  growth: 1.7,  max: 6, blurb: "Seats and fees for Chemistry." },
    marketing:  { label: "Marketing Floor", group: "floor", base: 45000,  growth: 1.8,  max: 6, blurb: "Pulls students in — more reach, faster fill." },
    finance:    { label: "Finance Floor",   group: "floor", base: 60000,  growth: 1.85, max: 6, blurb: "Squeezes more fee out of every student." },
    hostel:     { label: "Hostel Block",    group: "floor", base: 55000,  growth: 1.8,  max: 6, blurb: "Houses far-away students. Big capacity, more pressure." },
    boardroom:  { label: "Boardroom",       group: "floor", base: 120000, growth: 1.9,  max: 5, blurb: "Reach and influence. Raises Power." },
    branches:   { label: "New-City Branch", group: "branch", base: 300000, growth: 2.0, max: 8, blurb: "A whole new campus. Huge income, huge exposure." },
    teachers:   { label: "Hire a Teacher",  group: "staff", base: 40000,  growth: 1.35, max: 20, blurb: "Real results. +Saakh on hire." },
    counselors: { label: "Hire a Counselor", group: "staff", base: 65000, growth: 1.4,  max: 12, blurb: "Protects students' wellbeing. Softens the human cost." }
  };

  // ---- corrupt schemes (unlocked by story choices) -----------------------
  // Per-second drift while active. income = fractional multiplier on earnings.
  var SCHEMES = {
    hype:       { label: "Borrowed-topper hype",        income: 0.25, heat: 0.10, aarav: 0.05, meena: 0.05 },
    capitation: { label: "EMI scholarship funnel",      income: 0.35, heat: 0.11, debt: 0.45, aarav: 0.04 },
    fakerate:   { label: "Rank wall & paid-to-fail",    income: 0.30, heat: 0.16, aarav: 0.13, meena: 0.06 },
    leak:       { label: "CEE paper-leak slot",         income: 0.70, heat: 0.26, aarav: 0.15, meena: 0.10 },
    capture:    { label: "NAT, ghost faculty & mafia",  income: 0.55, heat: 0.20, power: 0.10, meena: 0.11, aarav: 0.06 },
    coverup:    { label: "Ads & intimidation",          income: 0.20, heat: 0.22, meena: 0.09, aarav: 0.06 }
  };

  // ---- formatting --------------------------------------------------------
  function format(n) {
    n = Math.max(0, Math.floor(n));
    if (n >= 10000000) return "₹" + (n / 10000000).toFixed(2) + " Cr";
    if (n >= 100000) return "₹" + (n / 100000).toFixed(2) + " L";
    return "₹" + n.toLocaleString("en-IN");
  }
  function formatRate(n) {
    if (n >= 100000) return format(n) + "/s";
    return "₹" + Math.round(n).toLocaleString("en-IN") + "/s";
  }

  // ---- derived numbers ---------------------------------------------------
  function lvl(state, key) { return state.assets[key] || 0; }

  function capacity(state) {
    var a = state.assets;
    return 12
      + (lvl(state, "maths") + lvl(state, "physics") + lvl(state, "chemistry")) * 14
      + lvl(state, "marketing") * 12
      + lvl(state, "hostel") * 45
      + lvl(state, "boardroom") * 8
      + lvl(state, "branches") * 120;
  }

  function schemeIncomeMult(state) {
    var m = 1;
    for (var k in state.schemes) if (state.schemes[k] && SCHEMES[k]) m += SCHEMES[k].income;
    return m;
  }

  function incomePerSec(state) {
    var enroll = state.enrollment || 0;
    var feePer = 6 * (1 + lvl(state, "finance") * 0.22) * (1 + lvl(state, "teachers") * 0.02);
    var v = enroll * feePer * schemeIncomeMult(state);
    return isFinite(v) ? v : 0;
  }

  function cost(state, key) {
    var cfg = ASSETS[key];
    if (!cfg) return Infinity;
    return Math.round(cfg.base * Math.pow(cfg.growth, lvl(state, key)));
  }

  function maxed(state, key) {
    var cfg = ASSETS[key];
    return cfg ? lvl(state, key) >= cfg.max : true;
  }

  function canAfford(state, key) {
    return !maxed(state, key) && state.treasury >= cost(state, key);
  }

  // ---- purchases ---------------------------------------------------------
  function buy(state, key) {
    if (!canAfford(state, key)) return false;
    state.treasury -= cost(state, key);
    state.assets[key] = lvl(state, key) + 1;
    if (key === "teachers") state.saakh = clamp(state.saakh + 2);
    if (key === "counselors") {
      state.ledger.aarav = clamp(state.ledger.aarav + 4);
      state.ledger.meena = clamp(state.ledger.meena + 3);
    }
    if (key === "boardroom") state.power = clamp(state.power + 3);
    if (key === "marketing") state.enrollment = Math.min(capacity(state), state.enrollment + capacity(state) * 0.05);
    return true;
  }

  // One-shot enrollment surge.
  function adBlitz(state) {
    var price = 30000;
    if (state.treasury < price) return false;
    state.treasury -= price;
    state.enrollment = Math.min(capacity(state), state.enrollment + capacity(state) * 0.25 + 20);
    state.heat = clamp(state.heat + 5);
    return true;
  }

  // ---- the tick ----------------------------------------------------------
  function tick(state, dt) {
    if (dt <= 0) return;
    // enrollment drifts toward capacity (marketing speeds it up)
    var cap = capacity(state);
    var growth = (0.04 + lvl(state, "marketing") * 0.01) * dt;
    state.enrollment += (cap - state.enrollment) * Math.min(0.9, growth);
    if (state.enrollment < 0) state.enrollment = 0;

    // earnings
    state.treasury += incomePerSec(state) * dt;
    if (!isFinite(state.treasury)) state.treasury = 0;

    // scheme drift (counselors soften the human damage)
    var soften = Math.max(0.25, 1 - lvl(state, "counselors") * 0.14);
    var anyScheme = false;
    for (var k in state.schemes) {
      if (!state.schemes[k] || !SCHEMES[k]) continue;
      anyScheme = true;
      var s = SCHEMES[k];
      state.heat = clamp(state.heat + (s.heat || 0) * dt);
      if (s.power) state.power = clamp(state.power + s.power * dt);
      if (s.aarav) state.ledger.aarav = clamp(state.ledger.aarav - s.aarav * dt * soften);
      if (s.meena) state.ledger.meena = clamp(state.ledger.meena - s.meena * dt * soften);
      if (s.debt) state.ledger.sharmaDebt = clamp(state.ledger.sharmaDebt + s.debt * dt);
    }
    // heat cools slowly when you're running clean
    if (!anyScheme) state.heat = clamp(state.heat - 0.15 * dt);

    BCT.state.checkTragedy(state);
  }

  function creditOffline(state, nowMs) {
    if (!state.lastTick) { state.lastTick = nowMs; return 0; }
    var dt = Math.min(OFFLINE_CAP_SEC, (nowMs - state.lastTick) / 1000);
    state.lastTick = nowMs;
    if (dt <= 1) return 0;
    var before = state.treasury;
    // offline: earn at current rate but no enrollment growth, no scheme harm
    state.treasury += incomePerSec(state) * dt;
    return state.treasury - before;
  }

  // chapter unlock gating by enrollment
  var UNLOCK = [0, 70, 160, 320, 550, 820, 1150];
  function unlockThreshold(chapterIndex) { return UNLOCK[chapterIndex] || 0; }
  function chapterUnlocked(state, chapterIndex) {
    return state.enrollment >= unlockThreshold(chapterIndex);
  }

  BCT.econ = {
    ASSETS: ASSETS, SCHEMES: SCHEMES, MUDRA_UNIT: MUDRA_UNIT,
    format: format, formatRate: formatRate,
    capacity: capacity, incomePerSec: incomePerSec, cost: cost,
    maxed: maxed, canAfford: canAfford, buy: buy, adBlitz: adBlitz,
    tick: tick, creditOffline: creditOffline,
    unlockThreshold: unlockThreshold, chapterUnlocked: chapterUnlocked, lvl: lvl
  };
})(window.BCT);
