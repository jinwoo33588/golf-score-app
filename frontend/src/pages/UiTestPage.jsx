// src/pages/UiSandboxPage.jsx
import React, { useMemo, useState } from 'react';
import HoleCardUnified from '../components/raw/HoleCardUnified';
import '../components/unified/unified.css';

const defaultPar = [4,4,4,3,4,4,5,3,4, 4,4,5,3,4,4,5,3,4]; // 예시

function makeInitialRound(pars = defaultPar) {
  return pars.map((par, i) => ({
    id: null,
    hole_number: i + 1,
    par,
    score: 0,
    putts: 0,
    penalties: 0,
    fir: false,
    gir: false,
    notes: '',
    shots: [],
  }));
}

export default function UiSandboxPage() {
  // 현재 보고/편집할 홀(0-based)
  const [currentHole, setCurrentHole] = useState(0);

  // ① 새 라운드 추가용 (로컬 상태)
  const [addRoundData, setAddRoundData] = useState(() => makeInitialRound());

  // ② 상세 보기용 (서버 응답 가정 - 메모리 상수)
  const viewRoundData = useMemo(() => {
    const holes = makeInitialRound();
    // 데모값 일부
    holes[0].score = -1; holes[0].fir = true; holes[0].gir = false; holes[0].putts = 2;
    holes[0].shots = [
      { club: 'DR', condition: '티박스', remaining_dist: 380, actual_dist: 240, result: 'FW', notes: '' },
      { club: '7i', condition: 'FW',     remaining_dist: 140, actual_dist: 138, result: '그린', notes: '' },
      { club: 'PT', condition: '그린',   remaining_dist: 6,   actual_dist: 6,   result: '2펏', notes: '' },
    ];
    return holes;
  }, []);

  // ③ 수정용 (기존 라운드 복제 후 편집)
  const [editRoundData, setEditRoundData] = useState(() => {
    const holes = makeInitialRound();
    holes[3].score = 1; holes[3].fir = false; holes[3].gir = true; holes[3].putts = 3; holes[3].notes = '3펏 아쉬움';
    return holes;
  });

  const holeOptions = Array.from({ length: 18 }, (_, i) => i);

  return (
    <div style={{ padding: 16 }}>
      <h1>UI Sandbox (HoleCard 통일 버전)</h1>

      <div style={{ margin: '12px 0', display: 'flex', gap: 8, alignItems: 'center' }}>
        <label htmlFor="holeSelect">홀 선택</label>
        <select
          id="holeSelect"
          value={currentHole}
          onChange={(e) => setCurrentHole(Number(e.target.value))}
        >
          {holeOptions.map(i => (
            <option key={i} value={i}>{i + 1}H</option>
          ))}
        </select>
      </div>

      {/* ① 새 라운드 추가 (edit) - 선택한 홀만 하나 */}
      <section style={{ marginTop: 20 }}>
        <h2>① 새 라운드 추가 (edit)</h2>
        <HoleCardUnified
          hole={addRoundData[currentHole]}
          mode="edit"
          showShots={true}
          onChange={(updated) => {
            const next = [...addRoundData];
            next[currentHole] = updated;
            setAddRoundData(next);
          }}
        />
      </section>

      {/* ② 라운드 상세 보기 (view) - 선택한 홀만 하나 */}
      <section style={{ marginTop: 20 }}>
        <h2>② 라운드 상세 보기 (view)</h2>
        <HoleCardUnified
          hole={viewRoundData[currentHole]}
          mode="view"
          showShots={true}
        />
      </section>

      {/* ③ 라운드 수정 (edit) - 선택한 홀만 하나 */}
      <section style={{ marginTop: 20 }}>
        <h2>③ 라운드 수정 (edit)</h2>
        <HoleCardUnified
          hole={editRoundData[currentHole]}
          mode="edit"
          showShots={true}
          onChange={(updated) => {
            const next = [...editRoundData];
            next[currentHole] = updated;
            setEditRoundData(next);
          }}
        />
      </section>
    </div>
  );
}
