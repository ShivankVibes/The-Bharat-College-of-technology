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

  BCT.scene = { init: init, render: render, showEnding: showEnding };
})(window.BCT);
