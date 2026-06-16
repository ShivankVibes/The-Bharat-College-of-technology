window.BCT = window.BCT || {};
(function (BCT) {
  "use strict";

  // ---- "Surprise me" name pools (fictional) -----------------------------
  var namePools = {
    founders: ["R.K. Verma", "Anil Tripathi", "S. Nair", "Pawan Joshi", "Devanshi Rao", "K.L. Sahu"],
    institutes: [
      "Pinnacle Vidya", "Shreshth Classes", "Apex Bharat Academy",
      "Sankalp Institute", "Vijay Coaching Point", "Udaan Academy"
    ]
  };

  // ---- Subjects you can start with --------------------------------------
  var subjects = {
    physics: { label: "Physics", board: "FORCE = MASS x ?", intro: "the laws that don't bend for anyone" },
    chemistry: { label: "Chemistry", board: "BALANCE THE EQUATION", intro: "reactions that don't care who's watching" },
    math: { label: "Maths", board: "PROVE IT", intro: "the one subject that can't be argued with" }
  };

  // ---- Recurring characters (the human ledger) --------------------------
  // aarav/meena: higher value = better. Pick first status whose `min` is met.
  // sharma: tracks DEBT, higher = worse. Pick first status whose `max` is met.
  var characters = {
    aarav: {
      name: "Aarav",
      note: "the boy off the overnight bus",
      status: [
        { min: 55, line: "Aarav still calls you sir, and means it." },
        { min: 40, line: "Aarav waits behind after class to ask one more doubt." },
        { min: 25, line: "Aarav has gone quiet. He copies the notes but doesn't look up." },
        { min: 10, line: "Aarav sits at the back now. He stopped raising his hand." },
        { min: 0, line: "Aarav stopped coming to class. His seat stays empty." }
      ]
    },
    meena: {
      name: "Meena",
      note: "the teacher who believed this was a school",
      status: [
        { min: 55, line: "Meena still thinks the teaching matters more than the marketing." },
        { min: 40, line: "Meena argues with you about the banners, but she stays." },
        { min: 25, line: "Meena has stopped arguing. Somehow that is worse." },
        { min: 10, line: "Meena updates her resume on the staffroom computer." },
        { min: 0, line: "Meena resigned. Her note read: 'This was supposed to be a school.'" }
      ]
    },
    sharma: {
      name: "The Sharmas",
      note: "Aarav's parents, who pay for the promise",
      status: [
        { max: 5, line: "The Sharmas pay your modest fee in cash, on time." },
        { max: 25, line: "The Sharmas took a small loan for the 'foundation' course." },
        { max: 50, line: "The Sharmas are on a two-year EMI. The father picked up a second shift." },
        { max: 75, line: "The Sharmas refinanced again. They still believe it will be worth it." },
        { max: 100, line: "The Sharmas owe money they can't explain to their own relatives." }
      ]
    }
  };

  // ---- Building floors (city scene) -------------------------------------
  var floors = {
    ads: { title: "Marketing Floor", sub: "Hoardings, rank walls, enrolment scripts", board: "TOPPERS?" },
    finance: { title: "Finance Floor", sub: "Fees, EMIs, the donations desk", board: "MUDRA" },
    dept: { title: "Faculty Floor", sub: "The teachers, the tests, the actual work", board: "TEACH" },
    board: { title: "The Boardroom", sub: "Expansion, protection, damage control", board: "POWER" }
  };

  // helper to keep option objects terse
  function opt(o) { return o; }

  // ---- The seven chapters ----------------------------------------------
  var chapters = [
    {
      id: "origins",
      year: "Year 1",
      title: "The Rented Room",
      scene: "room",
      board: "6 STUDENTS",
      floor: "dept",
      choiceText:
        "{founder}, you have one rented room above a sweet shop, a second-hand whiteboard, and six students. One of them is Aarav — sixteen, just off the overnight bus from a town nobody here can place, carrying his father's hopes in a plastic folder. You teach {subject}, " +
        "{subjectIntro}. Rent is due Friday. The parents want miracles. How does {institute} begin?",
      routeQuestion: {
        clean: { label: "Earn it. Teach well and let the results travel on their own.", detail: "Slow, honest" },
        dirty: { label: "Manufacture it. Sell the promise before you can keep it.", detail: "Fast, costly" }
      },
      profitBase: "By Friday the room has answered. You can feel what kind of place {institute} is becoming.",
      consequenceBase: "And every promise you made today is now either a reputation or a piece of evidence.",
      routes: {
        clean: [
          opt({ label: "Teach the hardest chapter first — even though it scares two students away.", detail: "Saakh up", path: "clean",
            effects: { saakh: 12, mudra: 2, power: 3, heat: -2, ledger: { aarav: 6, meena: 6 } },
            profit: "Four students stay, and they stay because the class is serious.",
            consequence: "Word spreads slowly: that room above the sweet shop actually teaches.",
            log: "You taught the hard thing honestly. Small room, real class." }),
          opt({ label: "Advertise only the marks your own six students actually scored.", detail: "Honest, modest", path: "clean",
            effects: { saakh: 9, mudra: 4, power: 3, heat: -1, ledger: { aarav: 4, meena: 4 } },
            profit: "The numbers are unremarkable, but every one of them is true.",
            consequence: "Nobody can attack a claim you never inflated.",
            log: "You published only real results. Nothing to take back later." }),
          opt({ label: "Give the weakest kids extra hours on Sundays, for free.", detail: "Costs you", path: "clean",
            effects: { saakh: 14, mudra: -3, power: 2, heat: -2, ledger: { aarav: 8, meena: 5, sharmaDebt: -2 } },
            profit: "Aarav's marks move for the first time in his life. His father calls to thank you.",
            consequence: "You earn less this month. You also earn something you can't print.",
            log: "Free Sunday classes. Aarav started catching up." })
        ],
        dirty: [
          opt({ label: "Print a rank poster for a topper who took one free demo class.", detail: "Quick cash", path: "dirty",
            effects: { saakh: -8, mudra: 12, power: 6, heat: 6, ledger: { aarav: -6, meena: -4 } },
            profit: "The poster goes up overnight. Admissions jump before the teaching changes at all.",
            consequence: "A parent asks where that topper actually studies. You change the subject.",
            log: "A borrowed topper on the wall. The room filled faster than the truth." }),
          opt({ label: "Paint '100% SELECTION GUARANTEED' across the stairwell.", detail: "Loud promise", path: "dirty",
            effects: { saakh: -12, mudra: 14, power: 7, heat: 9, ledger: { aarav: -6, meena: -8 } },
            profit: "The slogan does the selling for you. The room is full by month's end.",
            consequence: "Meena reads it on her way in and doesn't say good morning.",
            log: "A guarantee you can't keep, painted six feet high." }),
          opt({ label: "Tell Aarav's father the costly 'foundation course' is compulsory for selection.", detail: "Squeeze the family", path: "dirty",
            effects: { saakh: -10, mudra: 16, power: 5, heat: 7, ledger: { aarav: -8, meena: -5, sharmaDebt: 14 } },
            profit: "The Sharmas pay. They take a small loan to do it, and thank you for the chance.",
            consequence: "You have their money and their trust. Only one of those is real.",
            log: "You upsold a frightened family a course they didn't need." })
        ]
      }
    },

    {
      id: "partners",
      year: "Year 3",
      title: "Rich Dads and Poached Stars",
      scene: "branch",
      board: "NEW BRANCH",
      floor: "ads",
      choiceText:
        "The room isn't enough. A bigger hall near the coaching market is free, but the market is brutal. A wealthy parent offers to fund your expansion — for a say in how {institute} is run. Across town, a star teacher with a cult following can be bought.",
      routeQuestion: {
        clean: { label: "Grow on your own terms, even if it's slower.", detail: "Keep control" },
        dirty: { label: "Take the money and the star, and grow now.", detail: "Owe people" }
      },
      profitBase: "The expansion changes the picture. Less a classroom, more a machine.",
      consequenceBase: "And the people who funded the machine now expect it to run a certain way.",
      routes: {
        clean: [
          opt({ label: "Hire a steady teacher on a fair salary and train her yourself.", detail: "Build slow", path: "clean",
            effects: { saakh: 11, mudra: 6, power: 7, heat: -2, ledger: { aarav: 4, meena: 6 } },
            profit: "The branch grows on results, not noise. The queue outside is calm and real.",
            consequence: "Meena gets a real colleague. The staffroom feels like a school again.",
            log: "You grew on trained teachers, not bought ones." }),
          opt({ label: "Refuse the rich partner's terms; keep ownership clean.", detail: "No strings", path: "clean",
            effects: { saakh: 10, mudra: 3, power: 5, heat: -1, ledger: { meena: 5 } },
            profit: "You expand smaller than you wanted, but you answer to no one.",
            consequence: "The wealthy parent enrols his son elsewhere. You sleep fine.",
            log: "You turned down strings-attached money." }),
          opt({ label: "Run a genuine, transparent scholarship test — real aid, real terms.", detail: "Honest funnel", path: "clean",
            effects: { saakh: 12, mudra: 8, power: 8, heat: -2, ledger: { aarav: 5, meena: 4, sharmaDebt: -3 } },
            profit: "Bright kids who couldn't afford you now can. A few of them are extraordinary.",
            consequence: "The scholarship costs you margin and earns you a reputation worth more.",
            log: "A real scholarship. It cost money and bought trust." })
        ],
        dirty: [
          opt({ label: "Poach the star teacher with a secret bonus and stage a launch.", detail: "Power spike", path: "dirty",
            effects: { saakh: -8, mudra: 14, power: 16, heat: 10, ledger: { aarav: -4, meena: -7 } },
            profit: "The launch looks enormous. A famous face on a banner brings a surge of fees.",
            consequence: "Meena trained for years for less than the star's signing bonus. She notices.",
            log: "You bought a star and staged a spectacle." }),
          opt({ label: "Take the rich dad's money — and guarantee his weak son a top batch seat.", detail: "Owe a favour", path: "dirty",
            effects: { saakh: -12, mudra: 16, power: 12, heat: 9, ledger: { aarav: -10 } },
            profit: "The cheque clears. The expansion is suddenly funded and fast.",
            consequence: "His son takes the seat a kid like Aarav earned. Aarav gets bumped to the back batch.",
            log: "A funded partner, and a bought seat for his son." }),
          opt({ label: "Run a 'scholarship test' that's really a lead funnel into an EMI plan.", detail: "Debt trap", path: "dirty",
            effects: { saakh: -14, mudra: 18, power: 10, heat: 12, ledger: { aarav: -5, meena: -5, sharmaDebt: 18 } },
            profit: "Free test, then a 'scholarship' that's just a discount off an inflated fee, financed on EMI.",
            consequence: "The Sharmas sign a two-year plan. The counselor is paid on commission.",
            log: "A fake scholarship funnel built on family debt." })
        ]
      }
    },

    {
      id: "rankmachine",
      year: "Year 5",
      title: "The Rank Machine",
      scene: "city",
      board: "TOP RANKS",
      floor: "ads",
      choiceText:
        "Recorded lectures, a sales team, billboards in three cities. An agency offers to sell you the rights to use this year's toppers' faces — kids who barely touched {institute}. And there's a quieter idea on the table: pay students elsewhere to fail, so your 'selection rate' looks unbeatable.",
      routeQuestion: {
        clean: { label: "Let the real numbers speak, even if they're smaller.", detail: "Credible" },
        dirty: { label: "Build the rank machine. Buy the faces, fix the rate.", detail: "Explosive" }
      },
      profitBase: "This is where a room becomes a city brand. The hoardings decide who you are.",
      consequenceBase: "And rank claims travel fast — so do the people who can disprove them.",
      routes: {
        clean: [
          opt({ label: "Put only your own enrolled students' verified results on the hoardings.", detail: "Defensible", path: "clean",
            effects: { saakh: 13, mudra: 6, power: 8, heat: -3, ledger: { aarav: 5, meena: 6 } },
            profit: "The brand grows slower, but every face on the wall can be defended in court.",
            consequence: "A reporter goes looking for smoke and finds paperwork instead. Rare, in this market.",
            log: "Only verified students on the wall." }),
          opt({ label: "Publish your real selection rate — unflattering as it is.", detail: "Radical honesty", path: "clean",
            effects: { saakh: 15, mudra: 4, power: 6, heat: -4, ledger: { meena: 5 } },
            profit: "Honesty about your numbers becomes its own marketing. Parents are tired of lies.",
            consequence: "Rivals call you naive. Enrolments come anyway, from people who checked.",
            log: "You published the unflattering true rate." }),
          opt({ label: "Spend the ad budget on a real doubt-clearing helpline for students instead.", detail: "Reinvest", path: "clean",
            effects: { saakh: 12, mudra: -4, power: 7, heat: -3, ledger: { aarav: 8, meena: 6 } },
            profit: "Aarav calls the helpline at 11 p.m. before an exam. Someone picks up.",
            consequence: "No billboard, but the students who stay actually pass.",
            log: "Ad money went into a student helpline." })
        ],
        dirty: [
          opt({ label: "Splash a borrowed AIR-1's face across the city as 'OUR topper'.", detail: "Cash surge", path: "dirty",
            effects: { saakh: -16, mudra: 22, power: 16, heat: 16, ledger: { aarav: -10, meena: -6 } },
            profit: "The campus towers over the street. The campaign pours money into the machine.",
            consequence: "The student says publicly his photo is being used like a trophy he never won.",
            log: "A borrowed topper sold as your own." }),
          opt({ label: "Pay weak outside students to register and fail, inflating your selection rate.", detail: "Fix the numbers", path: "dirty",
            effects: { saakh: -18, mudra: 18, power: 14, heat: 14, ledger: { aarav: -10, meena: -8 } },
            profit: "On paper, almost everyone who 'tries elsewhere' fails and everyone with you wins.",
            consequence: "The rate is a lie with a spreadsheet behind it. Spreadsheets leak.",
            log: "You paid outsiders to fail to fake your rate." }),
          opt({ label: "Crank the hostel rank wall — public scores, daily, to 'motivate' them.", detail: "Pressure cooker", path: "dirty",
            effects: { saakh: -12, mudra: 14, power: 10, heat: 12, ledger: { aarav: -14, meena: -6 } },
            profit: "Fear converts. Parents love the giant AIR wall; conversions spike.",
            consequence: "Aarav's name sits near the bottom of that wall every single morning.",
            log: "A daily public rank wall. The kids read it like a verdict." })
        ]
      }
    },

    {
      id: "leak",
      year: "Year 7",
      title: "Tomorrow's Paper",
      scene: "city",
      board: "C.E.E.",
      floor: "board",
      choiceText:
        "A broker slides a USB across the table. Tomorrow's Common Entrance Exam — the real paper. He explains the chain like a logistics problem: the printing press, the sealed trunk in transit, the centre superintendent, the proxy who sits the exam for your paying students. For the right price, your top batch walks in already knowing the questions.",
      routeQuestion: {
        clean: { label: "Refuse it. Report it, even at a cost.", detail: "Hold the line" },
        dirty: { label: "Buy in. Run the chain.", detail: "Cross the line" }
      },
      profitBase: "This is the line a coaching empire either never crosses or never comes back from.",
      consequenceBase: "And somewhere a kid who studied honestly walks into a rigged room and never knows why he lost.",
      routes: {
        clean: [
          opt({ label: "Refuse, and quietly tip off an honest officer about the broker.", detail: "Real risk", path: "clean",
            effects: { saakh: 14, mudra: -2, power: 4, heat: -4, ledger: { aarav: 6, meena: 8 } },
            profit: "The broker is picked up two districts over. Your name stays out of it.",
            consequence: "Aarav sits the real exam and earns his real rank. It isn't a miracle. It's his.",
            log: "You refused the leak and reported the broker." }),
          opt({ label: "Refuse, and tell your students plainly that there are no shortcuts here.", detail: "Set the culture", path: "clean",
            effects: { saakh: 12, mudra: 2, power: 5, heat: -3, ledger: { aarav: 5, meena: 6 } },
            profit: "Some leave for institutes that promise easier roads. Most respect you for it.",
            consequence: "Meena hears what you said to the batch and stops looking for the door.",
            log: "You told the students the truth: no shortcuts." }),
          opt({ label: "Refuse, and spend on more mock tests so prepared kids don't need a leak.", detail: "Outwork it", path: "clean",
            effects: { saakh: 11, mudra: -4, power: 6, heat: -2, ledger: { aarav: 7, meena: 5 } },
            profit: "Your students walk in genuinely ready. Readiness is its own kind of unfair advantage.",
            consequence: "It costs you a fortune in question-setters. It buys you a clean conscience.",
            log: "You out-prepared the temptation to cheat." })
        ],
        dirty: [
          opt({ label: "Buy the paper for your top paying batch only — keep it 'deniable'.", detail: "Lucrative, lethal", path: "dirty",
            effects: { saakh: -16, mudra: 22, power: 16, heat: 18, ledger: { aarav: -12, meena: -8 } },
            profit: "Your top batch posts impossible scores. Fees for next year sell out in a week.",
            consequence: "Aarav, in the back batch, gets nothing — and loses to kids who got the answers.",
            log: "You bought the leak for the paying batch." }),
          opt({ label: "Run proxies and exam-centre 'settings' at scale.", detail: "Industrial fraud", path: "dirty",
            effects: { saakh: -18, mudra: 20, power: 18, heat: 22, ledger: { aarav: -12, meena: -10 } },
            profit: "Solvers, impersonators, a bought superintendent. A whole shadow exam, perfectly run.",
            consequence: "Every node you pay is a witness. The chain holds — until one link is arrested.",
            log: "You ran proxies and centre settings at scale." }),
          opt({ label: "Sell the leaked paper onward to rival institutes for a cut.", detail: "Print money", path: "dirty",
            effects: { saakh: -14, mudra: 24, power: 12, heat: 20, ledger: { aarav: -10, meena: -7 } },
            profit: "You don't just cheat — you become the wholesaler of cheating. The margins are obscene.",
            consequence: "Now dozens of people can place you at the centre of the leak. Dozens.",
            log: "You wholesaled the leaked paper to rivals." })
        ]
      }
    },

    {
      id: "capture",
      year: "Year 9",
      title: "The Seal For Sale",
      scene: "city",
      board: "INSPECTION",
      floor: "board",
      choiceText:
        "{institute} is an empire now. A man you didn't invite offers 'investment' with terms you can't refuse, and hints at what happens if you do. A consultant says you can become untouchable: buy out the biggest rival, cultivate a friendly education official, invent your own national test — the NAT — and put 'NAT-certified' teachers on every billboard. Inspection is next week.",
      routeQuestion: {
        clean: { label: "Stay legitimate. Spend on compliance and students.", detail: "Unglamorous" },
        dirty: { label: "Capture the system. Buy the seal.", detail: "Untouchable — for now" }
      },
      profitBase: "At empire scale, profit isn't fees anymore. It's access, protection, the power to set the terms.",
      consequenceBase: "And every favour you take creates one more person who knows the favour happened.",
      routes: {
        clean: [
          opt({ label: "Show the inspectors your real, understaffed labs and take the hit.", detail: "Honest audit", path: "clean",
            effects: { saakh: 16, mudra: -6, power: 6, heat: -8, ledger: { meena: 7, aarav: 4 } },
            profit: "You get written up for shortfalls and fix them for real over the year.",
            consequence: "Inspection becomes paperwork instead of theatre. You can breathe in your own building.",
            log: "You showed the real labs and fixed them." }),
          opt({ label: "Refuse the 'investor'. Hire security and a lawyer instead.", detail: "Stand firm", path: "clean",
            effects: { saakh: 12, mudra: -4, power: 8, heat: -4, ledger: { meena: 5 } },
            profit: "You stay clean of the mafia money. It's tense, but it's yours.",
            consequence: "Some nights are frightening. None of them are compromising.",
            log: "You refused the mafia's 'investment'." }),
          opt({ label: "Pour the war chest into teacher salaries and student support.", detail: "Reinvest in people", path: "clean",
            effects: { saakh: 15, mudra: -8, power: 7, heat: -6, ledger: { meena: 8, aarav: 6, sharmaDebt: -5 } },
            profit: "Your best teachers stop leaving. Your students stop drowning.",
            consequence: "Meena tells a new recruit, 'This one's different.' She still believes it.",
            log: "You reinvested the war chest in people." })
        ],
        dirty: [
          opt({ label: "Take the mafia money and buy out your biggest rival overnight.", detail: "Consolidate", path: "dirty",
            effects: { saakh: -16, mudra: 20, power: 24, heat: 18, ledger: { aarav: -6, meena: -8 } },
            profit: "Two empires become one. You own the market and owe the man who funded it.",
            consequence: "He doesn't want interest. He wants leverage, and now he has it.",
            log: "You took mafia funding and swallowed a rival." }),
          opt({ label: "Stage Inspection Day: ghost faculty, actor 'students', spoofed biometrics, an envelope.", detail: "Potemkin pass", path: "dirty",
            effects: { saakh: -14, mudra: 14, power: 16, heat: 20, ledger: { aarav: -8, meena: -9 } },
            profit: "The inspectors see a perfect institution that dissolves the moment they leave.",
            consequence: "A junior inspector keeps the photos. Honest juniors are how empires fall.",
            log: "You faked the entire inspection." }),
          opt({ label: "Invent the NAT and brand bought teachers as 'nationally certified'.", detail: "Manufacture authority", path: "dirty",
            effects: { saakh: -18, mudra: 22, power: 22, heat: 16, ledger: { aarav: -8, meena: -7 } },
            profit: "You don't beat the system's seal of approval — you print your own and sell it back to it.",
            consequence: "'NAT-certified' means nothing. Millions of parents will never know that.",
            log: "You invented a fake national certification." })
        ]
      }
    },

    {
      id: "reckoning",
      year: "Year 11",
      title: "The Leaked Ledger",
      scene: "crisis",
      board: "LEAKED",
      floor: "board",
      choiceText:
        "A spreadsheet leaks — inflated results, routed payments, the foundation-course upsells, the leak chain, the fake NAT. There are reporters at the gate. The whistleblower's identity is becoming clear, and it's someone you know from inside these walls. You can open the books, or bury the story under ads and threats.",
      routeQuestion: {
        clean: { label: "Open everything. Take the reckoning.", detail: "Painful, real" },
        dirty: { label: "Deny everything. Crush the leak.", detail: "Buy one more cycle" }
      },
      profitBase: "A leak changes the game, because the story stops belonging to you.",
      consequenceBase: "And what you do to the person who told the truth becomes the truest thing about you.",
      routes: {
        clean: [
          opt({ label: "Order a real audit, refund the families, dismantle the machine yourself.", detail: "Reform", path: "clean",
            effects: { saakh: 24, mudra: -20, power: -10, heat: -24, ledger: { aarav: 8, meena: 10, sharmaDebt: -20 } },
            profit: "Money leaves the building in refunds and reforms. The empire finally looks repairable.",
            consequence: "The Sharmas get a cheque and an apology. The apology means more than the cheque.",
            log: "You audited yourself and refunded the families." }),
          opt({ label: "Protect the whistleblower publicly and thank them by name.", detail: "Own it", path: "clean",
            effects: { saakh: 20, mudra: -10, power: -6, heat: -18, ledger: { meena: 12, aarav: 6 } },
            profit: "You stand next to the person who exposed you and call them right. Nobody expected that.",
            consequence: "Meena doesn't have to run. For the first time in years, she's glad she stayed.",
            log: "You protected the whistleblower instead of crushing them." }),
          opt({ label: "Hand the regulators your own evidence and accept the penalty.", detail: "Full cooperation", path: "clean",
            effects: { saakh: 18, mudra: -16, power: -8, heat: -22, ledger: { aarav: 5, meena: 8 } },
            profit: "You give them the trail before they have to dig for it. Facts replace rumours.",
            consequence: "The fine is enormous. The credibility you buy back is slower, and worth more.",
            log: "You cooperated fully and took the penalty." })
        ],
        dirty: [
          opt({ label: "Deny everything and drown the story under a wave of ads.", detail: "Buy silence", path: "dirty",
            effects: { saakh: -22, mudra: 12, power: 14, heat: 26, ledger: { aarav: -8, meena: -8 } },
            profit: "The ads get louder. For one news cycle, the building looks powerful again.",
            consequence: "Then a second document leaks. The first one was never the dangerous one.",
            log: "You denied it and drowned it in advertising." }),
          opt({ label: "Identify the whistleblower and intimidate them into silence.", detail: "Dangerous", path: "dirty",
            effects: { saakh: -26, mudra: 8, power: 18, heat: 30, ledger: { aarav: -10, meena: -14 } },
            profit: "The leak stops, for now. People who were talking go quiet.",
            consequence: "You learn the price of silence is everyone now knows you'll pay it.",
            log: "You silenced the whistleblower with threats." }),
          opt({ label: "Pin the whole thing on a junior employee and feed them to the press.", detail: "Scapegoat", path: "dirty",
            effects: { saakh: -20, mudra: 10, power: 12, heat: 24, ledger: { aarav: -8, meena: -12 } },
            profit: "A name, a face, a resignation letter. The empire keeps its hands officially clean.",
            consequence: "Everyone inside watches you sacrifice one of your own. Nobody trusts you again.",
            log: "You scapegoated a junior to save yourself." })
        ]
      }
    },

    {
      id: "crown",
      year: "Year 12",
      title: "Legacy or Ruler",
      scene: "crisis",
      board: "THE CROWN",
      floor: "board",
      final: true,
      choiceText:
        "You are no longer a teacher in a rented room. North India's coaching market bends around {institute}. Every shortcut you ever took is now load-bearing. This is the last decision the dossier records: what was all of it for?",
      routeQuestion: {
        clean: { label: "Step back. Rebuild it around the students.", detail: "Let go" },
        dirty: { label: "Centralise. Rule until the rivals fold.", detail: "Hold the crown" }
      },
      profitBase: "The final ledger shows what the crown is worth.",
      consequenceBase: "And the final ledger shows what the crown cost — and who paid it.",
      routes: {
        clean: [
          opt({ label: "Hand control to professional educators and fund the students who can't pay.", detail: "Legacy", path: "clean",
            effects: { saakh: 18, mudra: -8, power: -10, heat: -12, ledger: { aarav: 8, meena: 10, sharmaDebt: -15 } },
            profit: "You give up the crown. Profit slows. The institute stops being one man's appetite.",
            consequence: "It becomes, slowly, the school you said it was on day one.",
            log: "You let go of control and rebuilt around students." }),
          opt({ label: "Endow scholarships in the name of every student the system failed.", detail: "Atone", path: "clean",
            effects: { saakh: 20, mudra: -12, power: -8, heat: -14, ledger: { aarav: 10, meena: 10 } },
            profit: "You can't undo what was done. You can make the next kid's road shorter.",
            consequence: "Aarav's name is on one of those scholarships. You make sure of it.",
            log: "You endowed scholarships and named them for the failed." }),
          opt({ label: "Publish everything you learned about the scam so it can't be hidden again.", detail: "Expose the system", path: "clean",
            effects: { saakh: 16, mudra: -6, power: -6, heat: -10, ledger: { meena: 9, aarav: 6 } },
            profit: "You turn your own empire into a warning taped to every boardroom wall.",
            consequence: "The industry calls you a traitor. Parents call you the only honest one left.",
            log: "You published the playbook to burn it down." })
        ],
        dirty: [
          opt({ label: "Centralise all control in yourself and expand until rivals collapse.", detail: "Ruler", path: "dirty",
            effects: { saakh: -18, mudra: 24, power: 25, heat: 18, ledger: { aarav: -10, meena: -10 } },
            profit: "The empire becomes enormous. The skyline is your logo. You are the market.",
            consequence: "The size that makes you powerful also makes you impossible to hide.",
            log: "You centralised everything and crushed the rivals." }),
          opt({ label: "Take the company public on the inflated numbers and cash out.", detail: "Exit rich", path: "dirty",
            effects: { saakh: -16, mudra: 26, power: 18, heat: 20, ledger: { aarav: -8, meena: -8 } },
            profit: "You sell the myth to investors at its peak and walk away wealthy beyond counting.",
            consequence: "The people who bought the myth will be holding it when it falls.",
            log: "You cashed out on the inflated valuation." }),
          opt({ label: "Buy the silence permanently — politicians, press, regulators, all of it.", detail: "Total capture", path: "dirty",
            effects: { saakh: -20, mudra: 18, power: 25, heat: 22, ledger: { aarav: -10, meena: -10 } },
            profit: "You don't beat the system. You finish buying it. The seal is entirely yours now.",
            consequence: "There is no one left who can say no to you — and no one who'll tell you the truth.",
            log: "You bought total, permanent capture of the system." })
        ]
      }
    }
  ];

  // ---- Endings ----------------------------------------------------------
  var endings = {
    hollow: {
      title: "The Hollow Crown",
      board: "HOLLOW",
      text:
        "You won. {institute} is the biggest name in North India and your accounts have more zeros than you can read in one breath. The building touches the clouds. It is also empty in the only way that ever mattered. You sold the seal so many times there is nothing real left behind it — no trust, no teacher who respects you, no student who'll say your name with anything but a flinch. You are the richest man in an empty room.",
      cardTitle: "Rich and hollow",
      cardSub: "You sold the seal until nothing was left"
    },
    raid: {
      title: "Raid at Dawn",
      board: "RAID",
      text:
        "{institute} ruled the market for one bright moment. Then the files, the complaints, and the favours finally connected, and at dawn the gates were not yours to open. The teacher who promised education becomes a case study in capture, pressure, and collapse — taught, now, in the very classrooms you built.",
      cardTitle: "Power without trust",
      cardSub: "A crown can become evidence"
    },
    empire: {
      title: "The Uncomfortable Empire",
      board: "EMPIRE",
      text:
        "You built a machine that spans North India. Students still come, investors still smile. But every results day asks the same question nobody answers out loud: was this education, or was it domination wearing a school badge? It's huge. It's feared. It's brittle, and you know it.",
      cardTitle: "Market ruler",
      cardSub: "Big, feared, and one leak from falling"
    },
    legacy: {
      title: "The Harder Legacy",
      board: "LEGACY",
      text:
        "You never became the loudest name on the highway. {institute} stayed smaller than it could have been. But when the noise gets exhausting, families trust you — because for twelve years you gave them no reason not to. Growth took longer. The work lasted longer too. Aarav teaches the back-batch kids now. He still calls you sir.",
      cardTitle: "Student-first to the end",
      cardSub: "Less myth, more learning"
    },
    reform: {
      title: "The Reckoning Deal",
      board: "REFORM",
      text:
        "Your empire survives — after the audits, the repayments, and the public embarrassment. The old shortcuts don't vanish; they become warnings taped to every boardroom wall. {institute} is smaller, humbler, and finally honest about what it is. It's not the crown you imagined. It might be better.",
      cardTitle: "Reformed giant",
      cardSub: "Survival, with scars"
    }
  };

  BCT.data = {
    namePools: namePools,
    subjects: subjects,
    characters: characters,
    floors: floors,
    chapters: chapters,
    endings: endings
  };
})(window.BCT);
