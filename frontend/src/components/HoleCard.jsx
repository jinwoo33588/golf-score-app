import React from 'react';
import PropTypes from 'prop-types';
import './HoleCard.css'; // 스타일시트 임포트

export default function HoleCard({ hole }) {
  const h = hole || {};

  // ± 스코어 그대로
  const rel = typeof h.score === 'number' ? h.score : null;
  const relLabel = rel == null ? '-' : rel > 0 ? `+${rel}` : `${rel}`;
  const relClass = rel == null ? '' : rel < 0 ? 'good' : rel > 0 ? 'bad' : '';

  return (
    <div className="rdp-hole">
      <div className="hole-head">
        <div className="hole-left">
          <div className="hole-num">{h.hole_number}H</div>
          <div className="hole-meta">Par {h.par}</div>
        </div>
      </div>

      {/* 스코어(±) / FIR / GIR / 퍼팅 */}
      <div className="hole-stats-row">
        <div className="stat-card score">
          <div className="chip-title">Score (±)</div>
          <div className={`chip-value ${relClass}`}>{relLabel}</div>
        </div>

        <div className={`stat-card toggle ${h.fw_hit ? 'ok' : 'no'}`}>
          <div className="chip-title">FIR</div>
          <div className="chip-value">{h.fw_hit ? 'Yes' : 'No'}</div>
        </div>

        <div className={`stat-card toggle ${h.gir ? 'ok' : 'no'}`}>
          <div className="chip-title">GIR</div>
          <div className="chip-value">{h.gir ? 'Yes' : 'No'}</div>
        </div>

        <div className="stat-card putts">
          <div className="chip-title">Putts</div>
          <div className="chip-value">{h.putts ?? '-'}</div>
        </div>
      </div>

      {/* 샷 상세 */}
      <div className="shots">
        {(h.shots ?? []).length === 0 ? (
          <div className="no-shots">샷 기록 없음</div>
        ) : (
          (h.shots ?? []).map((s) => (
            <div key={s.id} className="shot-row">
              <div className="shot-num">#{s.shot_number}</div>
              <div className="shot-main">
                <div className="shot-line">
                  <span className="mono">{s.club}</span>
                  <span className="muted">{s.condition}</span>
                  <span className="muted">결과: {s.result}</span>
                </div>
                <div className="shot-sub">
                  {s.remaining_dist != null && <span>남은 {s.remaining_dist}m</span>}
                  {s.actual_dist != null && <span>실제 {s.actual_dist}m</span>}
                  {s.notes && <span className="note">메모: {s.notes}</span>}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

HoleCard.propTypes = {
  hole: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    hole_number: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    par: PropTypes.number,
    score: PropTypes.number,       // ± 스코어
    fw_hit: PropTypes.bool,
    gir: PropTypes.bool,
    putts: PropTypes.number,
    penalties: PropTypes.number,
    notes: PropTypes.string,
    shots: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        shot_number: PropTypes.number,
        club: PropTypes.string,
        condition: PropTypes.string,
        remaining_dist: PropTypes.number,
        actual_dist: PropTypes.number,
        result: PropTypes.string,
        notes: PropTypes.string,
      })
    ),
  }).isRequired,
};
