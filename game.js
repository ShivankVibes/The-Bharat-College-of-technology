const stateTemplate = {
  chapter: 0,
  episode: "choice",
  trust: 55,
  money: 10,
  power: 5,
  heat: 0,
  routeIntent: null,
  selectedChoice: null,
  activeFloor: "math",
  log: ["Episode 1 begins in a rented room with cracked paint, bad lights, and six students waiting."]
};

let state = cloneState();

const episodeLabels = {
  choice: "Episode 1: The Choice",
  profit: "Episode 2: The Profit",
  heat: "Episode 3: The Heat"
};

const officeFloors = {
  ads: {
    title: "Ads Floor",
    sub: "Billboards, rank posters, enrollment scripts",
    board: "ADS"
  },
  finance: {
    title: "Finance Floor",
    sub: "Fees, refunds, vendor payments",
    board: "MONEY"
  },
  math: {
    title: "Math Department",
    sub: "Teachers, tests, real classroom work",
    board: "MATH"
  },
  board: {
    title: "Boardroom",
    sub: "Expansion plans and damage control",
    board: "POWER"
  }
};

const chapters = [
  {
    year: "Year 1",
    title: "The Small Room",
    roomTitle: "One rented room",
    roomSub: "6 students, broken lights",
    board: "6 STUDENTS",
    choiceText: "Choose your route. The founder and a pixelated girl in the front row stare at the same cracked board. Rent is due. Parents want miracles. Do you want to grow in the non-corrupt way, or take the corrupt shortcut?",
    profitBase: "The room reacts immediately. Chairs move, posters change, and the students can feel what kind of company is being born.",
    heatBase: "By evening, the same choice has left a trace. In this business, every promise becomes either reputation or evidence.",
    scene: "room",
    choices: [
      {
        label: "Non-corrupt way: teach honestly and let results travel by word of mouth.",
        detail: "Trust up, slow cash",
        path: "clean",
        effects: { trust: 15, money: 4, power: 3, heat: 0 },
        profit: "A few more students arrive with notebooks, not hype. Profit is small, but nobody has to whisper about what was promised.",
        heat: "There is barely any heat. The main problem is still rent, not regulators.",
        log: "The first batch grows because students tell friends the class is serious."
      },
      {
        label: "Corrupt way: print rank posters and promise instant transformation.",
        detail: "Money up, risk starts",
        path: "dirty",
        effects: { trust: -8, money: 16, power: 8, heat: 8 },
        profit: "The dirty wall gets covered by a loud poster. Admissions jump before the teaching improves.",
        heat: "Parents start asking for proof behind the rank claims. It is small heat, but it has a memory.",
        log: "Flashy posters fill the room faster than proof can catch up."
      }
    ]
  },
  {
    year: "Year 3",
    title: "The First Branch",
    roomTitle: "Second center",
    roomSub: "Queues outside the door",
    board: "NEW BRANCH",
    choiceText: "The room is no longer enough. A bigger building near a coaching hub is available, but the market is already brutal. You need teachers, attention, and cash.",
    profitBase: "Expansion changes the picture. The classroom starts looking less like a room and more like a machine.",
    heatBase: "Competitors notice. Parents notice. Teachers notice. The branch leaves footprints.",
    scene: "branch",
    choices: [
      {
        label: "Hire strong teachers and publish real outcome data.",
        detail: "Trust up",
        path: "clean",
        effects: { trust: 14, money: 8, power: 9, heat: -2 },
        profit: "The branch grows by results. It is not flashy, but the queue outside is calm and real.",
        heat: "Questions are easier to answer because the numbers are not dressed up.",
        log: "The first branch grows with verified results and trained teachers."
      },
      {
        label: "Poach star faculty with secret bonuses and stage a launch.",
        detail: "Power spike",
        path: "dirty",
        effects: { trust: -6, money: 14, power: 22, heat: 12 },
        profit: "The launch looks huge. A star teacher on a banner brings a surge of fees.",
        heat: "Rival centers start calling, threatening, and collecting screenshots of your offers.",
        log: "A loud launch and poached faculty turn the branch into a local threat."
      }
    ]
  },
  {
    year: "Year 5",
    title: "The Rank Machine",
    roomTitle: "Regional brand",
    roomSub: "Billboards in three cities",
    board: "TOP RANKS",
    choiceText: "Recorded lectures, sales teams, and billboards are now in play. An agency offers to buy rights to use toppers' photos, even if they barely studied with you.",
    profitBase: "This is where the room starts becoming a city brand. The visual panel shows whether growth came from proof or performance.",
    heatBase: "Rank claims travel fast. So do people who can disprove them.",
    scene: "city",
    choices: [
      {
        label: "Use only verified student stories.",
        detail: "Credibility",
        path: "clean",
        effects: { trust: 16, money: 6, power: 8, heat: -3 },
        profit: "The building grows slower, but every face on the wall can be defended.",
        heat: "Reporters find less smoke than expected. That is rare in this market.",
        log: "Verified stories make the brand less explosive but harder to attack."
      },
      {
        label: "Run the topper campaign and blur the fine print.",
        detail: "Cash surge",
        path: "dirty",
        effects: { trust: -18, money: 26, power: 22, heat: 20 },
        profit: "The campus towers over nearby buildings. The campaign pours money into the machine.",
        heat: "Screenshots spread: students say their photos are being used like trophies.",
        log: "A blurred-fine-print rank campaign makes the brand huge and vulnerable."
      }
    ]
  },
  {
    year: "Year 7",
    title: "The Parent Funnel",
    roomTitle: "Sales floor",
    roomSub: "Scholarships and urgency",
    board: "LIMITED SEATS",
    choiceText: "Your call center can use transparent counseling, or pressure families with fake scarcity, confusing refunds, and fear.",
    profitBase: "Money now comes through scripts as much as teaching. The scene starts to show the machine behind the classroom.",
    heatBase: "Families remember how they were sold. Complaint groups do not need office space.",
    scene: "city",
    choices: [
      {
        label: "Use honest counseling and readable refund terms.",
        detail: "Trust compounds",
        path: "clean",
        effects: { trust: 14, money: 10, power: 9, heat: -4 },
        profit: "Some families walk away, but those who enroll stay with fewer fights.",
        heat: "The refund desk is boring. In a crisis, boring is excellent.",
        log: "Transparent counseling cuts short-term pressure and long-term complaints."
      },
      {
        label: "Use scarcity scripts and bury the refund policy.",
        detail: "Fast cash",
        path: "dirty",
        effects: { trust: -20, money: 28, power: 15, heat: 18 },
        profit: "The sales floor glows. Fees arrive before doubt can settle.",
        heat: "Parents compare notes online. The heat is no longer private.",
        log: "Scarcity scripts drive revenue while parent complaints begin stacking up."
      }
    ]
  },
  {
    year: "Year 9",
    title: "The Policy Door",
    roomTitle: "Education empire",
    roomSub: "Access to officials",
    board: "INSPECTION",
    choiceText: "A consultant says the chain can become untouchable with donations, favors, and inspection warnings. Compliance is slower, quieter, and less glamorous.",
    profitBase: "At empire scale, profit is not just fees. It is access, protection, and the ability to set terms.",
    heatBase: "Every favor creates someone who knows the favor happened.",
    scene: "city",
    choices: [
      {
        label: "Spend on compliance, training, and student support.",
        detail: "Durable",
        path: "clean",
        effects: { trust: 18, money: -4, power: 8, heat: -8 },
        profit: "The building looks less flashy this year, but systems inside it get stronger.",
        heat: "Inspections become paperwork instead of panic.",
        log: "Compliance hurts margins but makes the company harder to break."
      },
      {
        label: "Build a patronage network to soften inspections.",
        detail: "Risky shield",
        path: "dirty",
        effects: { trust: -16, money: 18, power: 28, heat: 24 },
        profit: "Doors open before you knock. The campus expands like it owns the street.",
        heat: "People start keeping receipts because protection always has a price.",
        log: "A patronage network gives the empire power and leaves a paper trail."
      }
    ]
  },
  {
    year: "Year 11",
    title: "The Leaked Ledger",
    roomTitle: "Crisis HQ",
    roomSub: "Reporters at the gate",
    board: "LEAKED",
    choiceText: "A spreadsheet leaks: inflated results, pressure selling, routed payments. You can open the books, or bury the story under ads and threats.",
    profitBase: "The picture now shows the cost of the machine. Profit can still move up, but the lights are harsher.",
    heatBase: "A leak changes the game because the story no longer belongs to you.",
    scene: "crisis",
    choices: [
      {
        label: "Open an audit, compensate families, and remove bad practices.",
        detail: "Painful reform",
        path: "clean",
        effects: { trust: 22, money: -18, power: -10, heat: -22 },
        profit: "Money leaves the building in refunds and reforms. The company finally looks repairable.",
        heat: "The heat drops because facts replace rumors, even ugly facts.",
        log: "The audit damages the myth but gives the company a way back."
      },
      {
        label: "Deny everything and intimidate whistleblowers.",
        detail: "Danger",
        path: "dirty",
        effects: { trust: -26, money: 12, power: 20, heat: 30 },
        profit: "The ads get louder, and the building looks powerful for one more news cycle.",
        heat: "Then another document leaks. The official at the gate is not decorative anymore.",
        log: "Threats buy time, then multiply the scandal."
      }
    ]
  },
  {
    year: "Year 12",
    title: "The Final Board Meeting",
    roomTitle: "The crown",
    roomSub: "Students, money, power",
    board: "LEGACY?",
    choiceText: "You are no longer a teacher in a room. North India's coaching market bends around your company. Every shortcut is now part of the building.",
    profitBase: "The last profit screen shows what the crown is worth.",
    heatBase: "The last heat screen shows what the crown costs.",
    scene: "crisis",
    final: true,
    choices: [
      {
        label: "Step back, professionalize leadership, and rebuild around students.",
        detail: "Legacy",
        path: "clean",
        effects: { trust: 18, money: -8, power: -8, heat: -12 },
        profit: "The founder gives up control. Profit slows, but the company starts looking less like one man's appetite.",
        heat: "The remaining heat becomes reform pressure instead of collapse pressure.",
        log: "You trade personal power for a chance at a cleaner institution."
      },
      {
        label: "Centralize control and keep expanding until competitors fold.",
        detail: "Ruler",
        path: "dirty",
        effects: { trust: -18, money: 24, power: 25, heat: 18 },
        profit: "The empire becomes massive. The campus dominates the city scene.",
        heat: "The same size that makes you powerful also makes you impossible to hide.",
        log: "You choose maximum control, and the crown gets heavier."
      }
    ]
  }
];

const refs = {
  visualScene: document.getElementById("visualScene"),
  stageTag: document.getElementById("stageTag"),
  episodeTag: document.getElementById("episodeTag"),
  yearTag: document.getElementById("yearTag"),
  floorNav: document.getElementById("floorNav"),
  sceneTitle: document.getElementById("sceneTitle"),
  sceneText: document.getElementById("sceneText"),
  choices: document.getElementById("choices"),
  eventLog: document.getElementById("eventLog"),
  restartBtn: document.getElementById("restartBtn"),
  founderTitle: document.getElementById("founderTitle"),
  founderSub: document.getElementById("founderSub"),
  sceneBoard: document.getElementById("sceneBoard"),
  trustText: document.getElementById("trustText"),
  moneyText: document.getElementById("moneyText"),
  powerText: document.getElementById("powerText"),
  heatText: document.getElementById("heatText"),
  trustBar: document.getElementById("trustBar"),
  moneyBar: document.getElementById("moneyBar"),
  powerBar: document.getElementById("powerBar"),
  heatBar: document.getElementById("heatBar")
};

function clamp(value) {
  return Math.max(0, Math.min(100, value));
}

function cloneState() {
  return JSON.parse(JSON.stringify(stateTemplate));
}

function applyEffects(effects) {
  state.trust = clamp(state.trust + effects.trust);
  state.money = clamp(state.money + effects.money);
  state.power = clamp(state.power + effects.power);
  state.heat = clamp(state.heat + effects.heat);
}

function renderMeters() {
  refs.trustText.textContent = state.trust;
  refs.moneyText.textContent = state.money;
  refs.powerText.textContent = state.power;
  refs.heatText.textContent = state.heat;
  refs.trustBar.style.width = `${state.trust}%`;
  refs.moneyBar.style.width = `${state.money}%`;
  refs.powerBar.style.width = `${state.power}%`;
  refs.heatBar.style.width = `${state.heat}%`;
}

function renderLog() {
  refs.eventLog.innerHTML = "";
  state.log.slice(-5).reverse().forEach((entry) => {
    const item = document.createElement("li");
    item.textContent = entry;
    refs.eventLog.appendChild(item);
  });
}

function renderScene(chapter, choice) {
  const sceneClasses = ["room-scene", "profit-scene", "heat-scene", "city-scene", "crisis-scene"];
  refs.visualScene.classList.remove(...sceneClasses);

  const selectedPath = choice?.path || "neutral";
  const shouldShowCity = chapter.scene === "city" || chapter.scene === "crisis" || state.chapter >= 2;

  refs.visualScene.classList.add(shouldShowCity ? "city-scene" : "room-scene");
  if (state.episode === "profit") refs.visualScene.classList.add("profit-scene");
  if (state.episode === "heat" || state.heat >= 55) refs.visualScene.classList.add("heat-scene");
  if (chapter.scene === "crisis" || state.heat >= 75) refs.visualScene.classList.add("crisis-scene");

  renderFloorNav(shouldShowCity);

  if (shouldShowCity) {
    const floor = officeFloors[state.activeFloor];
    refs.sceneBoard.textContent = floor.board;
    refs.founderTitle.textContent = floor.title;
    refs.founderSub.textContent = floor.sub;
    return;
  }

  refs.sceneBoard.textContent = getBoardText(chapter, choice, selectedPath);
  refs.founderTitle.textContent = "One room, one floor";
  refs.founderSub.textContent = getSceneSubtitle(chapter, choice);
}

function renderFloorNav(shouldShowCity) {
  refs.floorNav.querySelectorAll("button").forEach((button) => {
    const floor = button.dataset.floor;
    button.disabled = !shouldShowCity;
    button.classList.toggle("active", shouldShowCity && floor === state.activeFloor);
  });

  document.querySelectorAll(".office-floor").forEach((floorEl) => {
    floorEl.classList.toggle("active", shouldShowCity && floorEl.dataset.floor === state.activeFloor);
  });
}

function getBoardText(chapter, choice, selectedPath) {
  if (state.episode === "choice") return chapter.board;
  if (state.episode === "profit") return selectedPath === "dirty" ? "PROFIT++" : "RESULTS";
  return state.heat >= 65 || selectedPath === "dirty" ? "HEAT!!" : "QUIET";
}

function getSceneSubtitle(chapter, choice) {
  if (!choice) return chapter.roomSub;
  if (state.episode === "profit") {
    return choice.path === "dirty" ? "Money rises, doubts follow" : "Slower growth, cleaner books";
  }
  if (state.episode === "heat") {
    return state.heat >= 65 ? "Officials and reporters circle" : "Pressure stays manageable";
  }
  return chapter.roomSub;
}

function effectSummary(effects) {
  const labels = [];
  if (effects.trust) labels.push(`Trust ${signed(effects.trust)}`);
  if (effects.money) labels.push(`Money ${signed(effects.money)}`);
  if (effects.power) labels.push(`Power ${signed(effects.power)}`);
  if (effects.heat) labels.push(`Heat ${signed(effects.heat)}`);
  return labels.join(" / ");
}

function signed(value) {
  return value > 0 ? `+${value}` : `${value}`;
}

function getRouteOptions(chapter, path) {
  const base = chapter.choices.find((choice) => choice.path === path);
  const routeName = path === "dirty" ? "Corrupt" : "Non-corrupt";
  const variants = path === "dirty"
    ? [
        {
          label: `${routeName} option 1: exaggerate the promise, but keep it deniable.`,
          detail: "Small shortcut",
          adjust: { trust: -4, money: 5, power: 3, heat: 4 },
          profit: "The shortcut adds quick cash without changing the whole machine yet.",
          heat: "A few people notice the exaggeration, but it is still easy to deny.",
          log: "You chose a small corrupt shortcut: enough hype to sell, not enough proof to feel safe."
        },
        {
          label: `${routeName} option 2: manipulate proof and pressure families hard.`,
          detail: "Fast profit",
          adjust: { trust: -8, money: 10, power: 7, heat: 9 },
          profit: "The sales graph jumps because doubt is being converted into urgency.",
          heat: "Screenshots, complaints, and rival whispers begin moving together.",
          log: "You chose the aggressive corrupt route: pressure, inflated proof, and faster money."
        },
        {
          label: `${routeName} option 3: buy protection and silence complaints.`,
          detail: "Very risky",
          adjust: { trust: -12, money: 14, power: 12, heat: 14 },
          profit: "The empire gets a shield, and that shield makes expansion feel almost too easy.",
          heat: "Every favor creates a witness. Every silenced complaint learns where the bodies are buried.",
          log: "You chose the dangerous corrupt route: protection, silence, and a growing paper trail."
        }
      ]
    : [
        {
          label: `${routeName} option 1: improve classes before chasing scale.`,
          detail: "Safest path",
          adjust: { trust: 4, money: -2, power: -2, heat: -2 },
          profit: "The money is slower, but the classroom gets stronger before the brand gets louder.",
          heat: "There is little for critics to grab because the work is boringly defensible.",
          log: "You chose the careful non-corrupt route: quality before scale."
        },
        {
          label: `${routeName} option 2: grow with transparent marketing and real numbers.`,
          detail: "Balanced",
          adjust: { trust: 0, money: 2, power: 2, heat: 0 },
          profit: "Growth is visible, but it does not depend on tricking families.",
          heat: "Questions still come, but your team can answer them without panic.",
          log: "You chose the balanced non-corrupt route: growth with clean claims."
        },
        {
          label: `${routeName} option 3: expand fast, but verify every claim publicly.`,
          detail: "Ambitious",
          adjust: { trust: -2, money: 6, power: 5, heat: 2 },
          profit: "The company moves faster while keeping receipts for what it says.",
          heat: "The speed attracts attention, but the evidence keeps the heat manageable.",
          log: "You chose the ambitious non-corrupt route: faster scale with public proof."
        }
      ];

  return variants.map((variant) => ({
    label: variant.label,
    detail: variant.detail,
    path,
    effects: mergeEffects(base.effects, variant.adjust),
    profit: `${base.profit} ${variant.profit}`,
    heat: `${base.heat} ${variant.heat}`,
    log: variant.log
  }));
}

function mergeEffects(base, adjust) {
  return {
    trust: (base.trust || 0) + (adjust.trust || 0),
    money: (base.money || 0) + (adjust.money || 0),
    power: (base.power || 0) + (adjust.power || 0),
    heat: (base.heat || 0) + (adjust.heat || 0)
  };
}

function currentChapter() {
  return chapters[state.chapter];
}

function currentChoice() {
  return state.selectedChoice;
}

function showEpisode() {
  const chapter = currentChapter();
  const choice = state.selectedChoice === null ? null : currentChoice();

  refs.stageTag.textContent = `Empire phase ${state.chapter + 1} of ${chapters.length}`;
  refs.episodeTag.textContent = episodeLabels[state.episode];
  refs.yearTag.textContent = chapter.year;
  refs.sceneTitle.textContent = getEpisodeTitle(chapter);
  refs.sceneText.textContent = getEpisodeText(chapter, choice);
  refs.choices.innerHTML = "";

  if (state.episode === "choice") {
    if (!state.routeIntent) {
      renderRouteQuestion();
    } else {
      getRouteOptions(chapter, state.routeIntent).forEach((option) => {
        const button = document.createElement("button");
        button.className = "choice";
        button.type = "button";
        button.classList.toggle("clean-choice", option.path === "clean");
        button.classList.toggle("dirty-choice", option.path === "dirty");
        button.innerHTML = `<span>${option.label}</span><small>${effectSummary(option.effects)}</small>`;
        button.addEventListener("click", () => selectChoice(option));
        refs.choices.appendChild(button);
      });
    }
  } else {
    const button = document.createElement("button");
    button.className = "choice";
    button.type = "button";
    button.innerHTML = getContinueLabel(chapter);
    button.addEventListener("click", advanceEpisode);
    refs.choices.appendChild(button);
  }

  renderScene(chapter, choice);
  renderMeters();
  renderLog();
}

function renderRouteQuestion() {
  const noButton = document.createElement("button");
  noButton.className = "choice clean-choice";
  noButton.type = "button";
  noButton.innerHTML = "<span>No: take the non-corrupt route</span><small>Show 3 clean options</small>";
  noButton.addEventListener("click", () => selectRouteIntent("clean"));
  refs.choices.appendChild(noButton);

  const yesButton = document.createElement("button");
  yesButton.className = "choice dirty-choice";
  yesButton.type = "button";
  yesButton.innerHTML = "<span>Yes: take the corrupt route</span><small>Show 3 corrupt options</small>";
  yesButton.addEventListener("click", () => selectRouteIntent("dirty"));
  refs.choices.appendChild(yesButton);
}

function getEpisodeTitle(chapter) {
  if (state.episode === "choice" && !state.routeIntent) return `${chapter.title}: Go Corrupt?`;
  if (state.episode === "choice") {
    return `${chapter.title}: ${state.routeIntent === "dirty" ? "Corrupt Options" : "Non-corrupt Options"}`;
  }
  if (state.episode === "profit") return `${chapter.title}: The Profit`;
  return `${chapter.title}: The Heat`;
}

function getEpisodeText(chapter, choice) {
  if (state.episode === "choice" && !state.routeIntent) {
    return `${chapter.choiceText} First answer the route question. If you choose corrupt, you will get 3 corrupt options. If you choose no, you will get 3 non-corrupt options.`;
  }
  if (state.episode === "choice") {
    return state.routeIntent === "dirty"
      ? "You said yes to corruption. Pick one of these corrupt tactics and the scene will show the profit and heat that follow."
      : "You said no to corruption. Pick one of these non-corrupt tactics and the scene will show the profit and heat that follow.";
  }
  if (state.episode === "profit") return `${chapter.profitBase} ${choice.profit}`;
  return `${chapter.heatBase} ${choice.heat}`;
}

function getContinueLabel(chapter) {
  if (state.episode === "profit") {
    return "<span>Continue to Episode 3: The Heat</span><small>See consequences</small>";
  }

  if (chapter.final) {
    return "<span>Reveal ending</span><small>Final result</small>";
  }

  return "<span>Next phase</span><small>Keep playing</small>";
}

function selectRouteIntent(path) {
  state.routeIntent = path;
  showEpisode();
}

function selectChoice(choice) {
  state.selectedChoice = choice;
  state.activeFloor = getChoiceFloor(choice);
  applyEffects(choice.effects);
  state.log.push(choice.log);
  state.episode = "profit";
  showEpisode();
}

function getChoiceFloor(choice) {
  if (choice.path === "dirty") return state.heat >= 45 ? "board" : "ads";
  if (choice.effects.money < 0) return "finance";
  return "math";
}

function advanceEpisode() {
  const chapter = currentChapter();

  if (state.episode === "profit") {
    state.episode = "heat";
    showEpisode();
    return;
  }

  if (chapter.final) {
    showEnding();
    return;
  }

  state.chapter += 1;
  state.episode = "choice";
  state.routeIntent = null;
  state.selectedChoice = null;
  state.log.push(`Empire phase ${state.chapter + 1} opens with the company larger than before.`);
  showEpisode();
}

function showEnding() {
  const ending = getEnding();

  refs.stageTag.textContent = "Ending";
  refs.episodeTag.textContent = "Final result";
  refs.yearTag.textContent = "Year 12";
  refs.sceneTitle.textContent = ending.title;
  refs.sceneText.textContent = ending.text;
  refs.founderTitle.textContent = ending.cardTitle;
  refs.founderSub.textContent = ending.cardSub;
  refs.sceneBoard.textContent = ending.board;
  refs.choices.innerHTML = "";

  refs.visualScene.classList.remove("room-scene", "profit-scene", "heat-scene", "city-scene", "crisis-scene");
  refs.visualScene.classList.add("city-scene", "heat-scene");
  if (state.heat >= 65) refs.visualScene.classList.add("crisis-scene");

  const replay = document.createElement("button");
  replay.className = "choice";
  replay.type = "button";
  replay.innerHTML = "<span>Play another timeline</span><small>Restart</small>";
  replay.addEventListener("click", restart);
  refs.choices.appendChild(replay);

  renderMeters();
  renderLog();
}

function getEnding() {
  if (state.heat >= 82 && state.trust <= 35) {
    return {
      title: "Raid at Dawn",
      text: "The company rules the market for a moment, then the files, complaints, and favors finally connect. The founder who promised education becomes a case study in capture, pressure, and collapse.",
      cardTitle: "Power without trust",
      cardSub: "A crown can become evidence",
      board: "RAID"
    };
  }

  if (state.money >= 72 && state.power >= 72 && state.trust < 55) {
    return {
      title: "The Uncomfortable Empire",
      text: "You build a multimillion dollar machine across North India. Students still come, investors still smile, but every result day asks whether this was education or domination wearing a school badge.",
      cardTitle: "Market ruler",
      cardSub: "Big, feared, and brittle",
      board: "EMPIRE"
    };
  }

  if (state.trust >= 75 && state.heat <= 35) {
    return {
      title: "The Harder Legacy",
      text: "You never become the loudest company, but families trust you when the noise gets exhausting. Growth takes longer. The work lasts longer too.",
      cardTitle: "Student-first chain",
      cardSub: "Less myth, more learning",
      board: "LEGACY"
    };
  }

  return {
    title: "The Reckoning Deal",
    text: "Your empire survives after reforms, repayments, and public embarrassment. The old shortcuts do not vanish; they become warnings taped to every boardroom wall.",
    cardTitle: "Reformed giant",
    cardSub: "Survival with scars",
    board: "REFORM"
  };
}

function restart() {
  state = cloneState();
  showEpisode();
}

refs.restartBtn.addEventListener("click", restart);
refs.floorNav.querySelectorAll("button").forEach((button) => {
  button.addEventListener("click", () => {
    state.activeFloor = button.dataset.floor;
    showEpisode();
  });
});
showEpisode();
