window.BCT = window.BCT || {};
(function (BCT) {
  "use strict";

  var MUTE_KEY = "bct.muted.v1";
  var ctx = null;
  var muted = false;

  try {
    muted = localStorage.getItem(MUTE_KEY) === "1";
  } catch (e) {}

  function ac() {
    if (ctx) return ctx;
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    try { ctx = new AC(); } catch (e) { ctx = null; }
    return ctx;
  }

  function tone(freq, dur, type, gain, when) {
    var c = ac();
    if (!c) return;
    var t0 = c.currentTime + (when || 0);
    var osc = c.createOscillator();
    var g = c.createGain();
    osc.type = type || "sine";
    osc.frequency.setValueAtTime(freq, t0);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(gain || 0.15, t0 + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g).connect(c.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  function noise(dur, gain) {
    var c = ac();
    if (!c) return;
    var len = Math.floor(c.sampleRate * dur);
    var buf = c.createBuffer(1, len, c.sampleRate);
    var data = buf.getChannelData(0);
    for (var i = 0; i < len; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / len); // decaying
    }
    var src = c.createBufferSource();
    var g = c.createGain();
    g.gain.value = gain || 0.08;
    src.buffer = buf;
    var hp = c.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 1800;
    src.connect(hp).connect(g).connect(c.destination);
    src.start();
  }

  function freqSweep(f1, f2, dur, gain) {
    var c = ac();
    if (!c) return;
    var t0 = c.currentTime;
    var osc = c.createOscillator();
    var g = c.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(f1, t0);
    osc.frequency.linearRampToValueAtTime(f2, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(gain || 0.12, t0 + 0.05);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g).connect(c.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  function cue(name) {
    if (muted) return;
    // Resume context if suspended (autoplay policies).
    var c = ac();
    if (c && c.state === "suspended" && c.resume) { try { c.resume(); } catch (e) {} }
    switch (name) {
      case "chalk": noise(0.12, 0.06); break;
      case "click": tone(420, 0.06, "square", 0.06); break;
      case "cash": tone(660, 0.08, "triangle", 0.12); tone(990, 0.1, "triangle", 0.1, 0.06); break;
      case "saakh": tone(523, 0.12, "sine", 0.1); tone(784, 0.18, "sine", 0.08, 0.08); break;
      case "siren": freqSweep(300, 140, 0.5, 0.12); break;
      case "toll": tone(140, 0.9, "sine", 0.14); break; // low, used for the tragedy beat
      default: break;
    }
  }

  function setMuted(v) {
    muted = !!v;
    try { localStorage.setItem(MUTE_KEY, muted ? "1" : "0"); } catch (e) {}
  }

  function isMuted() { return muted; }

  BCT.audio = { cue: cue, setMuted: setMuted, isMuted: isMuted };
})(window.BCT);
