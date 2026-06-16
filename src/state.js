window.BCT = window.BCT || {};
(function (BCT) {
  "use strict";

  var SAVE_KEY = "bct.save.v1";

  function defaultState() {
    return {
      founder: "",
      institute: "",
      subject: "math",
      chapter: 0,
      episode: "choice", // choice -> profit -> consequence
      routeIntent: null, // "clean" | "dirty"
      selectedChoice: null,
      saakh: 55,
      mudra: 18,
      power: 5,
      heat: 0,
      ledger: { aarav: 60, sharmaDebt: 0, meena: 60, whistleblower: null },
      tragedy: false,
      log: []
    };
  }

  function clamp(n) {
    return Math.max(0, Math.min(100, Math.round(n)));
  }

  function applyEffects(s, fx) {
    if (!fx) return;
    s.saakh = clamp(s.saakh + (fx.saakh || 0));
    s.mudra = clamp(s.mudra + (fx.mudra || 0));
    s.power = clamp(s.power + (fx.power || 0));
    s.heat = clamp(s.heat + (fx.heat || 0));
    if (fx.ledger) {
      if (typeof fx.ledger.aarav === "number") {
        s.ledger.aarav = clamp(s.ledger.aarav + fx.ledger.aarav);
      }
      if (typeof fx.ledger.meena === "number") {
        s.ledger.meena = clamp(s.ledger.meena + fx.ledger.meena);
      }
      if (typeof fx.ledger.sharmaDebt === "number") {
        s.ledger.sharmaDebt = clamp(s.ledger.sharmaDebt + fx.ledger.sharmaDebt);
      }
    }
  }

  // Aarav reaches a breaking point only under sustained corruption + pressure.
  // Returns true the single time it first crosses the threshold.
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
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(s));
      return true;
    } catch (e) {
      return false;
    }
  }

  function load() {
    try {
      var raw = localStorage.getItem(SAVE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function clearSave() {
    try {
      localStorage.removeItem(SAVE_KEY);
    } catch (e) {}
  }

  BCT.state = {
    SAVE_KEY: SAVE_KEY,
    defaultState: defaultState,
    clamp: clamp,
    applyEffects: applyEffects,
    checkTragedy: checkTragedy,
    selectEnding: selectEnding,
    save: save,
    load: load,
    clearSave: clearSave
  };
})(window.BCT);
