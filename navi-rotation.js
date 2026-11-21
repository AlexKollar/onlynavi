// navi-rotation.js — Navi's listening rotation, the site copy
// (v0.6.12e, Apex #346). The identical algorithm the Apex bridge
// runs (bridge.py: rowsown_music_now / rowsown_cycle_order /
// _rowsown_mulberry32), shipped as a standalone module for the
// site round: nocturnerow.com and onlynavi.fans compute her
// soundtrack from the same data and the same math, so every
// screen agrees on what she is "listening to" and how far in
// she is — no player, no live channel, just a shared clock.
//
// The schedule: cycle = floor((now - epoch) / cycleSeconds);
// each cycle's play order is a Fisher-Yates shuffle driven by
// mulberry32 seeded with the cycle number; the position inside
// the cycle names the track and the offset into it.
//
// EPOCH: 1795222078 — the moment v0.6.12e published
// (2026-11-20 19:47:58 EST), per Alex's ruling: her soundtrack
// starts when the feature does. Identical in bridge.py's
// ROWSOWN_PLAYLIST; the two copies must always agree.
"use strict";

var NAVI_PLAYLIST = {
  epoch: 1795222078, // epoch = the moment v0.6.12e published (Alex's ruling, #346)
  cycleSeconds: 1185,
  // Track pool: a snapshot of Alex's Spotify playlist "Navi's Super
  // Hacker Mix" (7C3XSKZH5FcAF9CH5PLwSl), taken 2026-11-20 — the
  // playlist is the editorial source; this table is its compiled
  // copy, and bridge.py's table must always agree with it.
  tracks: [
    { title: "Gone", artist: "SIERRA VEINS", seconds: 216, spotify: "2hdhMoaEpzenU9vGtAuWwF" },
    { title: "Magnum Bullets", artist: "Night Runner feat. Dan Avidan", seconds: 243, spotify: "2FGWXLeSSVWZlf7sh5A6te" },
    { title: "Can You Feel My Heart (Mothica Version)", artist: "MOTHICA", seconds: 142, spotify: "3v4IOOBYRRM3MpjTkQxqCH" },
    { title: "Out of the Shadows", artist: "Ely Eira", seconds: 201, spotify: "7fBW6T3yvz3CqNRNA88unC" },
    { title: "Backseat", artist: "Balu Brigada", seconds: 383, spotify: "7yT4NJt5rgmVoMJMGPULcj" }
  ]
};

function mulberry32(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    var t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function cycleOrder(cycle, count) {
  var order = [];
  for (var i = 0; i < count; i++) order.push(i);
  var rand = mulberry32(cycle);
  for (var k = count - 1; k > 0; k--) {
    var j = Math.floor(rand() * (k + 1));
    var tmp = order[k]; order[k] = order[j]; order[j] = tmp;
  }
  return order;
}

// nowSeconds: epoch seconds. Returns the same shape the bridge
// returns: {cycle, trackIndex, title, artist, spotifyId, url,
// offset, duration, position, cycleSeconds}.
function musicNow(nowSeconds, playlist) {
  var pl = playlist || NAVI_PLAYLIST;
  var tracks = pl.tracks;
  var total = pl.cycleSeconds;
  var elapsed = Math.floor(nowSeconds) - pl.epoch;
  if (elapsed < 0) elapsed = 0;
  var cycle = Math.floor(elapsed / total);
  var pos = elapsed % total;
  var order = cycleOrder(cycle, tracks.length);
  var acc = 0;
  for (var n = 0; n < order.length; n++) {
    var tr = tracks[order[n]];
    if (pos < acc + tr.seconds) {
      return { cycle: cycle, trackIndex: order[n], title: tr.title,
               artist: tr.artist, spotifyId: tr.spotify,
               url: "https://open.spotify.com/track/" + tr.spotify,
               offset: pos - acc, duration: tr.seconds,
               position: pos, cycleSeconds: total };
    }
    acc += tr.seconds;
  }
  var last = tracks[order[order.length - 1]];
  return { cycle: cycle, trackIndex: order[order.length - 1],
           title: last.title, artist: last.artist,
           spotifyId: last.spotify,
           url: "https://open.spotify.com/track/" + last.spotify,
           offset: last.seconds, duration: last.seconds,
           position: pos, cycleSeconds: total };
}

var NaviRotation = { PLAYLIST: NAVI_PLAYLIST, mulberry32: mulberry32,
                     cycleOrder: cycleOrder, musicNow: musicNow };
if (typeof module !== "undefined" && module.exports) module.exports = NaviRotation;
if (typeof window !== "undefined") window.NaviRotation = NaviRotation;
