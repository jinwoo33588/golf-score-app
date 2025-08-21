// src/pages/RoundDetailPage.jsx
import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';

import {
  getRoundDetail, getRoundStats, bulkUpdateHoles, updateRoundMeta, errMsg
} from '../hooks/useRoundApi.js';

import { loadDraft, saveDraft, clearDraft } from '../lib/draftStore.js';

import RoundHeader from '../components/rounds/RoundHeader.jsx';
import RoundStatsPanel from '../components/rounds/RoundStatsPanel.jsx';
import HoleCard from '../components/holes/HoleCard.jsx';
import HoleView from '../components/holes/HoleView.jsx';

import './RoundDetailPage.css';

export default function RoundDetailPage() {
  const params = useParams();
  const [sp] = useSearchParams();
  const nav = useNavigate();

  const ridRaw =
    params.id ?? params.roundId ?? params.rid ??
    sp.get('id') ?? sp.get('roundId') ?? sp.get('rid');
  const rid = Number(ridRaw);

  const [detail, setDetail] = useState(null); // { round, holes }
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  // 편집/초안
  const [editing, setEditing] = useState(false);
  const [work, setWork] = useState(null);

  // 디바운스 타이머
  const debRef = useRef(null);

  async function loadAll() {
    try {
      setLoading(true);
      const [d, s] = await Promise.all([
        getRoundDetail(rid),
        getRoundStats(rid, 'partial'),
      ]);
      setDetail(d);
      setStats(s);
      setErr(null);
      // 읽기 모드로 리셋 (수동 새로고침 시에도 일관성)
      setEditing(false);
      setWork(null);
    } catch (e) {
      setErr(errMsg(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!ridRaw) { setErr('잘못된 경로입니다.'); setLoading(false); return; }
    if (!Number.isFinite(rid)) { setErr('유효하지 않은 라운드 ID'); setLoading(false); return; }
    loadAll();
    // eslint-disable-next-line
  }, [ridRaw]);

  // 편집 시작: 초안 있으면 복원 안내
  function startEdit() {
    if (!detail) return;
    let base = detail.holes.map(h => ({ ...h }));
    const draft = loadDraft(rid);
    if (draft?.holes?.length) {
      const ok = confirm(`이 라운드의 초안이 ${new Date(draft.savedAt).toLocaleString()}에 저장되어 있습니다. 복원할까요?`);
      if (ok) base = draft.holes.map(h => ({ ...h }));
    }
    setWork(base);
    setEditing(true);
  }

  function cancelEdit() {
    setEditing(false);
    setWork(null);
    clearDraft(rid);
  }

  // work 변경 → 디바운스 저장 (localStorage)
  useEffect(() => {
    if (!editing || !work) return;
    if (debRef.current) clearTimeout(debRef.current);
    debRef.current = setTimeout(() => {
      // 초안으로 holes만 보관
      saveDraft(rid, work.map(h => ({ ...h })));
    }, 400);
    return () => { if (debRef.current) clearTimeout(debRef.current); };
  }, [editing, work, rid]);

  // 이탈 경고 (편집 중에만)
  useEffect(() => {
    const handler = (e) => {
      if (editing) { e.preventDefault(); e.returnValue = ''; }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [editing]);

  function patchWork(holeId, patch) {
    setWork(prev => prev.map(h => (h.id === holeId ? { ...h, ...patch } : h)));
  }

  // 서버 데이터 vs work 비교 → 변경 여부
  const dirty = useMemo(() => {
    if (!editing || !detail || !work) return false;
    const a = detail.holes, b = work;
    if (a.length !== b.length) return true;
    // hole_number 기준 비교
    const byNo = (arr) => Object.fromEntries(arr.map(h => [h.hole_number, h]));
    const A = byNo(a), B = byNo(b);
    for (const n in B) {
      const x = A[n], y = B[n];
      if (!x) return true;
      if ((x.par ?? null) !== (y.par ?? null)) return true;
      if ((x.score ?? null) !== (y.score ?? null)) return true;
      if ((x.putts ?? null) !== (y.putts ?? null)) return true;
      if ((x.penalties ?? null) !== (y.penalties ?? null)) return true;
      if ((x.fir ?? null) !== (y.fir ?? null)) return true;
      if ((x.gir ?? null) !== (y.gir ?? null)) return true;
      if ((x.notes ?? null) !== (y.notes ?? null)) return true;
    }
    return false;
  }, [editing, detail, work]);

  async function saveAll() {
    if (!work) return;
    try {
      await bulkUpdateHoles(
        rid,
        work.map(h => ({
          hole_number: h.hole_number,
          par: h.par,
          score: h.score,
          putts: h.putts,
          penalties: h.penalties,
          fir: h.fir,
          gir: h.gir,
          notes: h.notes,
        }))
      );
      clearDraft(rid);
      await loadAll(); // 저장 후 최신 반영 + 읽기 모드 복귀
      alert('저장 완료');
    } catch (e) {
      alert(errMsg(e));
    }
  }

  async function finalizeRound() {
    try {
      if (editing && dirty) {
        const ok = confirm('변경사항이 있습니다. 먼저 [전체 저장] 하시겠어요? 취소하면 초안을 폐기하고 마감합니다.');
        if (ok) {
          await saveAll();
        } else {
          clearDraft(rid);
        }
      }
      await updateRoundMeta(rid, { status: 'final' });
      await loadAll();
      alert('라운드 마감 완료');
    } catch (e) {
      alert(errMsg(e));
    }
  }

  const holesToShow = editing ? work : detail?.holes;

  return (
    <div className="container">
      {loading && <div className="rdp__box">로딩 중…</div>}
      {err && <div className="rdp__error">{err}</div>}
      {!loading && detail && (
        <>
          <RoundHeader
            title={detail.round.course_name}
            date={detail.round.date}
            tee_time={detail.round.tee_time}
            status={detail.round.status}
            editing={editing}
            dirty={dirty}
            onBack={() => nav('/rounds')}
            onEdit={startEdit}
            onCancel={cancelEdit}
            onSave={saveAll}
            onFinalize={finalizeRound}
            onRefresh={loadAll}
          />

          <RoundStatsPanel stats={stats} variant="collapse" defaultOpen={false} />

          <div className="holes__grid">
            {holesToShow && holesToShow.map((h) =>
              editing ? (
                <HoleCard key={h.id} hole={h} onPatch={(id, p) => patchWork(id, p)} />
              ) : (
                <HoleView key={h.id} hole={h} />
              )
            )}
          </div>
        </>
      )}
    </div>
  );
}
