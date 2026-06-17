window.BCT = window.BCT || {};
(function (BCT) {
  "use strict";

  var refs = null;

  function init() {
    refs = {
      root: document.getElementById("scene"),
      board: document.getElementById("sceneBoard"),
      title: document.getElementById("sceneBannerTitle"),
      sub: document.getElementById("sceneBannerSub"),
      aarav: document.getElementById("aaravSprite"),
      floors: document.querySelectorAll(".office-floor")
    };
  }

  function heatBand(heat) {
    if (heat >= 70) return "high";
    if (heat >= 40) return "mid";
    return "low";
  }

  // small (room/branch) vs city, plus episode overlays
  function render(state, chapter, choice) {
    if (!refs) init();
    if (!refs || !refs.root) return;

    var isCity = chapter.scene === "city" || chapter.scene === "crisis" || state.chapter >= 2;
    var classes = ["scene"];
    classes.push(isCity ? "is-city" : "is-room");
    if (chapter.scene === "branch") classes.push("is-branch");
    if (state.episode === "profit") classes.push("is-profit");
    if (state.episode === "consequence") classes.push("is-consequence");
    if (state.heat >= 55) classes.push("is-heat");
    if (chapter.scene === "crisis" || state.heat >= 78 || state.tragedy) classes.push("is-crisis");
    refs.root.className = classes.join(" ");
    refs.root.setAttribute("data-heat", heatBand(state.heat));
    refs.root.style.setProperty("--heat", (state.heat / 100).toFixed(2));

    // Board + banner text
    var floors = BCT.data.floors;
    if (isCity) {
      var floor = floors[chapter.floor] || floors.board;
      refs.board.textContent = boardText(state, chapter, choice, floor);
      refs.title.textContent = floor.title;
      refs.sub.textContent = floor.sub;
      highlightFloor(chapter.floor);
    } else {
      refs.board.textContent = boardText(state, chapter, choice, null);
      refs.title.textContent = chapter.year + " — " + chapter.title;
      refs.sub.textContent = subtitle(state, choice);
      highlightFloor(chapter.floor);
    }

    // Aarav sprite reflects his wellbeing
    if (refs.aarav) {
      var a = state.ledger.aarav;
      refs.aarav.classList.toggle("fade-1", a < 45 && a >= 25);
      refs.aarav.classList.toggle("fade-2", a < 25 && a >= 8);
      refs.aarav.classList.toggle("gone", state.tragedy || a < 8);
    }
  }

  function boardText(state, chapter, choice, floor) {
    if (state.episode === "choice") return chapter.board;
    if (state.episode === "profit") {
      return choice && choice.path === "dirty" ? "PROFIT ++" : "RESULTS";
    }
    // consequence
    if (state.tragedy) return "...";
    return state.heat >= 60 || (choice && choice.path === "dirty") ? "HEAT" : "QUIET";
  }

  function subtitle(state, choice) {
    if (!choice) return "One room, six students";
    if (state.episode === "profit") {
      return choice.path === "dirty" ? "Money up, doubt close behind" : "Slower, cleaner books";
    }
    if (state.tragedy) return "A seat that won't fill again";
    return state.heat >= 60 ? "Officials and reporters circle" : "The pressure holds, for now";
  }

  function highlightFloor(active) {
    if (!refs.floors) return;
    for (var i = 0; i < refs.floors.length; i++) {
      var el = refs.floors[i];
      el.classList.toggle("active", el.getAttribute("data-floor") === active);
    }
  }

  // Dashboard view: the campus reflects what you've built.
  function renderDashboard(state) {
    if (!refs) init();
    if (!refs || !refs.root) return;
    var hasEmpire = state.chaptersDone >= 1 || state.enrollment > 60 ||
      (state.assets && (state.assets.branches > 0 || state.assets.marketing > 0));
    var classes = ["scene", hasEmpire ? "is-city" : "is-room"];
    if (state.heat >= 55) classes.push("is-heat");
    if (state.heat >= 78 || state.tragedy) classes.push("is-crisis");
    refs.root.className = classes.join(" ");
    refs.root.setAttribute("data-heat", heatBand(state.heat));
    refs.root.style.setProperty("--heat", (state.heat / 100).toFixed(2));

    growBuildings(state);

    if (refs.board) refs.board.textContent = Math.floor(state.enrollment) + " STUDENTS";
    if (refs.title) refs.title.textContent = state.institute || "Your institute";
    if (refs.sub) refs.sub.textContent = scheme_summary(state);

    if (refs.aarav) {
      var a = state.ledger.aarav;
      refs.aarav.classList.toggle("fade-1", a < 45 && a >= 25);
      refs.aarav.classList.toggle("fade-2", a < 25 && a >= 8);
      refs.aarav.classList.toggle("gone", state.tragedy || a < 8);
    }
  }

  function scheme_summary(state) {
    var n = 0;
    for (var k in state.schemes) if (state.schemes[k]) n++;
    if (n === 0) return "Clean books, slow growth";
    return n + (n === 1 ? " scheme running" : " schemes running");
  }

  // Light up floors you've built; grow neighbours with branches.
  function growBuildings(state) {
    var a = state.assets || {};
    setFloor("ads", a.marketing > 0);
    setFloor("finance", a.finance > 0);
    setFloor("dept", (a.maths + a.physics + a.chemistry) > 0);
    setFloor("board", a.boardroom > 0);
    var campus = document.querySelector(".b-campus");
    if (campus) {
      var floors = (a.marketing > 0) + (a.finance > 0) + ((a.maths + a.physics + a.chemistry) > 0) + (a.boardroom > 0);
      campus.style.filter = "brightness(" + (0.8 + floors * 0.06) + ")";
    }
    var tall = document.querySelector(".b-tall");
    var mid = document.querySelector(".b-mid");
    if (tall) tall.style.height = (130 + (a.branches || 0) * 14) + "px";
    if (mid) mid.style.height = (100 + (a.hostel || 0) * 10) + "px";
  }

  function setFloor(name, on) {
    var el = document.querySelector('.office-floor[data-floor="' + name + '"]');
    if (el) el.classList.toggle("built", on);
  }

  function showEnding(endingKey) {
    if (!refs) init();
    if (!refs || !refs.root) return;
    refs.root.className = "scene is-city is-crisis is-ending";
    refs.root.setAttribute("data-heat", "high");
    var e = BCT.data.endings[endingKey];
    if (e) {
      refs.board.textContent = e.board;
      refs.title.textContent = e.cardTitle;
      refs.sub.textContent = e.cardSub;
    }
    if (refs.aarav && (endingKey === "hollow" || endingKey === "raid")) {
      refs.aarav.classList.add("gone");
    }
  }

  BCT.scene = { init: init, render: render, renderDashboard: renderDashboard, showEnding: showEnding };
})(window.BCT);
