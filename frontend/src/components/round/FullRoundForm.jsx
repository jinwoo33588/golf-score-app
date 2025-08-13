import React from 'react';
import HoleCardTest from '../card/HoleCardTest';
import './FullRoundForm.css';

const FullRoundForm = ({ roundData, setRoundData }) => {
  // HoleCardTest에서 올라온 updatedHole을 roundData[index] 구조에 맞춰 반영
  const handleHoleChange = (index, updated) => {
    setRoundData(prev => {
      const next = [...prev];
      const orig = next[index] || {};

      next[index] = {
        ...orig,
        // 번호/Par
        hole: orig.hole ?? (updated.hole_number ?? index + 1),
        par: updated.par ?? orig.par ?? 4,

        // 스코어/퍼팅/벌타(± 스코어 유지)
        score:      typeof updated.score      === 'number' ? updated.score      : (orig.score ?? 0),
        putts:      typeof updated.putts      === 'number' ? updated.putts      : (orig.putts ?? 2),
        penalties:  typeof updated.penalties  === 'number' ? updated.penalties  : (orig.penalties ?? 0),

        // FIR/GIR: tri-state(null)도 저장 가능 (기존 fw_hit는 boolean이었으면 그대로 사용 가능)
        fw_hit: (updated.fir !== undefined ? updated.fir : orig.fw_hit ?? null),
        gir:    (updated.gir !== undefined ? updated.gir : orig.gir    ?? null),

        // 노트/샷
        notes: updated.notes ?? orig.notes ?? '',
        shots: Array.isArray(updated.shots) ? updated.shots : (orig.shots || []),
      };

      return next;
    });
  };

  return (
    <div className="full-round-form">
      <h1>🏁 라운드 종료 후 입력 (18홀 전체)</h1>

      {roundData.map((hole, idx) => {
        // HoleCardTest가 기대하는 형태로 뷰 모델 구성
        const vmHole = {
          hole_number: hole.hole ?? (idx + 1),
          par: hole.par,
          score: hole.score ?? 0,          // ± 스코어
          putts: hole.putts ?? 2,
          penalties: hole.penalties ?? 0,
          fir: hole.fw_hit ?? null,        // fw_hit ↔ fir 매핑
          gir: hole.gir ?? null,
          notes: hole.notes ?? '',
          shots: hole.shots ?? [],
        };

        return (
          <div key={`${hole.hole ?? idx}-${idx}`} className="hole-row">
            <HoleCardTest
              hole={vmHole}
              mode="edit"          // ✅ 편집 모드
              showShots            // 샷 모달 사용
              onChange={(updated) => handleHoleChange(idx, updated)}
            />
          </div>
        );
      })}
    </div>
  );
};

export default FullRoundForm;
