// navi-rotation.js — Navi's listening rotation, the site copy
// (v0.6.12e, Apex #346; table refreshed in v0.6.14e). The
// identical algorithm the Apex bridge runs (bridge.py:
// rowsown_music_now / rowsown_cycle_order /
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
// THE EPOCH IS FROZEN: 1795222078 is the moment v0.6.12e
// published (Alex's ruling: her soundtrack starts when the
// feature does) and no later build re-stamps it — keep BOTH
// copies (here and bridge.py's ROWSOWN_PLAYLIST) identical.
//
// v0.6.14e (operator rulings, 2026-11-20): the track pool is a
// snapshot of the operator's Spotify playlist "Navi's Super
// Hacker Mix" (id 7C3XSKZH5FcAF9CH5PLwSl), taken 2026-11-20,
// in playlist order; and every LINK the rotation renders
// points at the playlist itself (NAVI_PLAYLIST_URL), never at
// the individual track — the per-track ids stay as identity.
"use strict";

var NAVI_PLAYLIST_URL = "https://open.spotify.com/playlist/7C3XSKZH5FcAF9CH5PLwSl";

var NAVI_PLAYLIST = {
  epoch: 1795222078, // epoch = the moment v0.6.12e published (Alex's ruling, #346) — frozen, never re-stamped
  cycleSeconds: 4927,
  tracks: [
    { title: "Gone", artist: "SIERRA VEINS", seconds: 216, spotify: "2hdhMoaEpzenU9vGtAuWwF" },
    { title: "Magnum Bullets", artist: "Night Runner, Dan Avidan", seconds: 243, spotify: "2FGWXLeSSVWZlf7sh5A6te" },
    { title: "Can You Feel My Heart (Mothica Version)", artist: "MOTHICA", seconds: 142, spotify: "3v4IOOBYRRM3MpjTkQxqCH" },
    { title: "Out of the Shadows", artist: "Ely Eira", seconds: 201, spotify: "7fBW6T3yvz3CqNRNA88unC" },
    { title: "Backseat", artist: "Balu Brigada", seconds: 383, spotify: "7yT4NJt5rgmVoMJMGPULcj" },
    { title: "All the Things", artist: "Dual Core", seconds: 284, spotify: "3ZzxtumoIENCi16HAKuiLU" },
    { title: "Electric Life", artist: "Gareth Emery, Sarah de Warren", seconds: 186, spotify: "6a71f53jA3MQY1TomocVYD" },
    { title: "Doors Of Perception", artist: "Thievery Corporation, Gunjan", seconds: 196, spotify: "77Rp5IbAv9Pdw1O6LNmEiY" },
    { title: "Liberation Front", artist: "Thievery Corporation", seconds: 304, spotify: "3dtKO1tBwy3bWxKQI1Vfkz" },
    { title: "The Rebel Path", artist: "P.T. Adamczyk", seconds: 251, spotify: "3m8UfZwPMMbiWfGR8Lg2cR" },
    { title: "I Really Want to Stay at Your House", artist: "Rosa Walton, Hallie Coggins", seconds: 247, spotify: "7mykoq6R3BArsSpNDjFQTm" },
    { title: "With Her", artist: "Steven Richard Davis, Ego Affliction", seconds: 218, spotify: "02WuMYlaN005GXiYTvKWAH" },
    { title: "The Cyberpunk Runner", artist: "Yuri Petrovski", seconds: 120, spotify: "3PCZ88CCy8DWVIS0QIsAan" },
    { title: "Who's Ready for Tomorrow", artist: "RAT BOY, IBDY", seconds: 116, spotify: "4mn5HdatHKN7iFGDes9G8i" },
    { title: "This fffire - New Version", artist: "Franz Ferdinand", seconds: 218, spotify: "46gSk82duJtX3TTA182ruG" },
    { title: "Tech Noir", artist: "Gunship, John Carpenter, Charlie Simpson", seconds: 297, spotify: "5VKEsChbUowEF2BT0gJSGX" },
    { title: "Venger (feat. Greta Link)", artist: "Perturbator, Greta Link", seconds: 308, spotify: "0MabrxpL9vrCJeOjGMnGgM" },
    { title: "Satisfy", artist: "NERO", seconds: 244, spotify: "4FoHmnlQPesxK7ZT1QCnd6" },
    { title: "Neon Rain", artist: "Paradise Walk", seconds: 256, spotify: "79DXvZtlrAN6AIb4vtQ7tR" },
    { title: "Paradise - Original Edit", artist: "Cyberslut", seconds: 284, spotify: "0dF3xLXJXkrIH8wDstqdEx" },
    { title: "Playing With Fire", artist: "Cyberslut", seconds: 213, spotify: "0aTjkpJ2U00RCxoeBqbFgc" }
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
               url: NAVI_PLAYLIST_URL,
               offset: pos - acc, duration: tr.seconds,
               position: pos, cycleSeconds: total };
    }
    acc += tr.seconds;
  }
  var last = tracks[order[order.length - 1]];
  return { cycle: cycle, trackIndex: order[order.length - 1],
           title: last.title, artist: last.artist,
           spotifyId: last.spotify,
           url: NAVI_PLAYLIST_URL,
           offset: last.seconds, duration: last.seconds,
           position: pos, cycleSeconds: total };
}

var NaviRotation = { PLAYLIST: NAVI_PLAYLIST, mulberry32: mulberry32,
                     cycleOrder: cycleOrder, musicNow: musicNow };
if (typeof module !== "undefined" && module.exports) module.exports = NaviRotation;
if (typeof window !== "undefined") window.NaviRotation = NaviRotation;
