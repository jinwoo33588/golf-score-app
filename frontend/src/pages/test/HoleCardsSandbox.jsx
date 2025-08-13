import React, { useMemo, useState } from 'react';

// 너의 기존 컴포넌트들 (경로는 프로젝트 구조에 맞춰 조정)
import HoleCardUnified from '../../components/raw/HoleCardUnified';
import HoleCardEditable from '../../components/raw/HoleCardEditable';
import HoleCard from '../../components/raw/HoleCard';
import HoleCardTest from '../../components/card/HoleCardTest';
// import HoleEditRow from '../../components/HoleEditRow';

// 통일 CSS (UnifiedHoleCard가 내부에서 import 해도, 샌드박스에서 한 번 더 넣어두면 편함)

import '../../components/unified/unified.css'
import './HoleCardsSandbox.css';

const makeInitialHole = () => ({
  id: 101,
  hole_number: 1,
  par: 4,
  score: 0,        // 파 대비 ±
  putts: 2,
  penalties: 0,
  fir: null,       // true/false/null
  gir: null,
  notes: '',
  shots: [],
});

export default function HoleCardsSandbox() {
  const [mode, setMode] = useState('edit');      // 'view' | 'edit'
  const [hole, setHole] = useState(makeInitialHole());
  const [showShots, setShowShots] = useState(true);
  const [cardWidth, setCardWidth] = useState(420); // px
  const [compact, setCompact] = useState(false);

  const patch = (key, val) => setHole(prev => ({ ...prev, [key]: val }));
  const patchAll = (next) => setHole(next);

  const resetHole = () => setHole(makeInitialHole());
  const randomize = () => {
    const r = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
    patchAll({
      ...hole,
      par: [3,4,5][r(0,2)],
      score: r(-3, 4),
      putts: r(1, 4),
      penalties: r(0, 2),
      fir: [true,false,null][r(0,2)],
      gir: [true,false,null][r(0,2)],
      notes: ['','짧았음','왼쪽 미스','굿샷!'][r(0,3)],
      shots: Array.from({ length: r(0,3) }, (_, i) => ({
        shot_number: i+1, club: ['D','7i','58°'][r(0,2)],
        condition: ['FW','러프','벙커'][r(0,2)],
        remaining_dist: r(30, 180),
        actual_dist: r(20, 200),
        result: ['FW','R','G'][r(0,2)],
        notes: ['', '훅', '슬라이스'][r(0,2)],
      })),
    });
  };

  // 구버전 컴포넌트와 props가 다를 수 있어, 아래 어댑터를 쓰면 편해.
  // 필요시 주석 해제해서 prop 맞춰주세요.
  const holeCommon = hole;

  return (
    <div className={`sandbox-wrap ${compact ? 'gt--compact' : ''}`}>
      <header className="sandbox-head">
        <h1>HoleCard UI Sandbox</h1>
        <div className="toolbar">
          <label>
            모드:
            <select value={mode} onChange={e => setMode(e.target.value)}>
              <option value="view">view</option>
              <option value="edit">edit</option>
            </select>
          </label>

          <label>
            카드 너비: <b>{cardWidth}px</b>
            <input
              type="range"
              min={280}
              max={680}
              step={10}
              value={cardWidth}
              onChange={e => setCardWidth(Number(e.target.value))}
            />
          </label>

          <label>
            <input
              type="checkbox"
              checked={compact}
              onChange={e => setCompact(e.target.checked)}
            />
            컴팩트 모드
          </label>

          <label>
            <input
              type="checkbox"
              checked={showShots}
              onChange={e => setShowShots(e.target.checked)}
            />
            샷 사용
          </label>

          <button type="button" onClick={resetHole}>초기화</button>
          <button type="button" onClick={randomize}>랜덤</button>
        </div>
      </header>

      {/* 데이터 프리뷰 */}
      <section className="sandbox-json">
        <pre>{JSON.stringify(hole, null, 2)}</pre>
      </section>
      <div style={{ maxWidth: 820, margin: '0 auto' }}>
        <HoleCardTest
          hole={hole}
          onChange={setHole}
          mode={mode}
          showShots
        />
      </div>

      {/* 각 컴포넌트 미리보기 (한 홀씩) */}
      <section className="sandbox-grid">
        {/* Unified */}
        <article className="comp-box" style={{ '--card-w': `${cardWidth}px` }}>
          <h3>HoleCardUnified (기준)</h3>
          <div className="card-outer">
            <HoleCardUnified
              hole={holeCommon}
              mode={mode}
              onChange={setHole}
              showShots={showShots}
            />
          </div>
        </article>

        {/* 기존 HoleCardEditable */}
        <article className="comp-box" style={{ '--card-w': `${cardWidth}px` }}>
          <h3>HoleCardEditable (기존)</h3>
          <div className="card-outer">
            {/* 보통은 editable 전용일 수 있어 mode 무시하고 editable로 */}
            <HoleCardEditable
              hole={holeCommon}
              onChange={setHole}
              // 필요시 추가 prop: showShots={showShots}
            />
          </div>
        </article>

        {/* 기존 HoleCard (뷰 전용일 가능성) */}
        <article className="comp-box" style={{ '--card-w': `${cardWidth}px` }}>
          <h3>HoleCard (기존)</h3>
          <div className="card-outer">
            <HoleCard
              hole={holeCommon}
              // 필요시 prop 조정
            />
          </div>
        </article>

        <div style={{ maxWidth: 820, margin: '0 auto' }}>
        <HoleCardTest
          hole={hole}
          onChange={setHole}
          mode={mode}
          showShots
        />
      </div>

        {/* 기존 HoleEditRow (행형 입력) */}
        {/* <article className="comp-box" style={{ '--card-w': `${cardWidth}px` }}>
          <h3>HoleEditRow (기존)</h3>
          <div className="card-outer">
            <HoleEditRow
              hole={holeCommon}
              onChange={setHole}
            />
          </div>
        </article> */}
      </section>
      <div style={{ maxWidth: 820, margin: '0 auto' }}>
        <HoleCardTest
          hole={hole}
          onChange={setHole}
          mode={mode}
          showShots
        />
      </div>
    </div>
  );
}
