const KEY = "olympus-rising-campaign";
const VERSION = 2;

export function loadCampaign() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.version === 1) {
      // Legacy: no nextSlots yet; return with empty queue
      return { ...parsed, nextSlots: {}, version: VERSION };
    }
    if (parsed?.version !== VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
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
