// src/lib/draftStore.js
const KEY = (rid) => `golf:draft:round:${rid}`;

export function loadDraft(roundId) {
  try {
    const raw = localStorage.getItem(KEY(roundId));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveDraft(roundId, holes, meta = {}) {
  const data = {
    roundId,
    holes,                           // 배열: [{id,hole_number,par,score,putts,penalties,fir,gir,notes}, ...]
    savedAt: new Date().toISOString(),
    appVersion: '1',
    ...meta,                         // 필요하면 { userId } 같은 것 추가
  };
  localStorage.setItem(KEY(roundId), JSON.stringify(data));
}

export function clearDraft(roundId) {
  localStorage.removeItem(KEY(roundId));
}
