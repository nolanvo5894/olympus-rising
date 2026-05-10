const KEY = "olympus-rising-campaign";
const VERSION = 2;

export function loadCampaign() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.version === 1) {
      // Legacy: no nextSlots yet; return with empty queue
      return backfillGold({ ...parsed, nextSlots: {}, version: VERSION });
    }
    if (parsed?.version !== VERSION) return null;
    return backfillGold(parsed);
  } catch {
    return null;
  }
}

// Older saves only had {kills, streak}. Seed gold from past kills so
// returning players aren't broke when they first see the Agora.
function backfillGold(state) {
  if (!state?.hud) return state;
  if (state.hud.gold === undefined) {
    return { ...state, hud: { ...state.hud, gold: (state.hud.kills || 0) * 25 } };
  }
  return state;
}

export function saveCampaign(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ version: VERSION, ...state }));
  } catch (e) {
    console.warn("[storage] failed to persist campaign:", e);
  }
}

export function clearCampaign() {
  try { localStorage.removeItem(KEY); } catch {}
}
