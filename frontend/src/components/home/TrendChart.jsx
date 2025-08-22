import React, { useEffect, useMemo, useState } from 'react';
import { fetchRecentRounds } from '../../services/roundService';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,LabelList,
} from 'recharts';
import './TrendChart.css';

function formatDate(isoLike) {
  if (!isoLike) return '-';
  const d = new Date(isoLike);
  if (Number.isNaN(d.getTime())) return isoLike;
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${m}/${day}`;
}

// 지표 정의: dataKey 후보와 단위, 포맷터
const METRICS = {
  score: {
    label: '스코어',
    resolver: (r) => r.total_strokes ?? null,
    unit: '',
    isPercent: false,
    domain: [72, 100],   // 👈 스코어는 72~100
  },
  putts: {
    label: '퍼팅',
    resolver: (r) => r.total_putts ?? null,
    unit: '',
    isPercent: false,
    domain: [25, 45],    // 👈 퍼팅은 25~45
  },
  fir: {
    label: 'FIR',
    resolver: (r) => {
      if (r.fir_pct != null) return r.fir_pct;
      if (r.fir_rate != null) return r.fir_rate * 100;
      return null;
    },
    unit: '%',
    isPercent: true,
    domain: [0, 100],    // 👈 FIR은 0~100
  },
  gir: {
    label: 'GIR',
    resolver: (r) => {
      if (r.gir_pct != null) return r.gir_pct;
      if (r.gir_rate != null) return r.gir_rate * 100;
      return null;
    },
    unit: '%',
    isPercent: true,
    domain: [0, 100],    // 👈 GIR은 0~100
  },
};


export default function TrendChart() {
  const [rounds, setRounds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  // 선택 지표 & Y축 모드
  const [metric, setMetric] = useState('score'); // 'score' | 'putts' | 'fir' | 'gir'
  const [yMode, setYMode] = useState('auto');    // 'auto' | 'preset' | 'manual'
  const [preset, setPreset] = useState('tight'); // 'tight' | 'padding'
  const [yMin, setYMin] = useState('');
  const [yMax, setYMax] = useState('');

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await fetchRecentRounds(8); // 최근 8개로 조금 늘림(원하면 조절)
        setRounds(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
        setErr('트렌드 데이터를 불러오지 못했어요.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // 차트 데이터 생성
  const chartData = useMemo(() => {
    const arr = [...rounds].sort((a, b) => new Date(a.date) - new Date(b.date));
    return arr.map((r) => {
      const base = {
        name: formatDate(r.date),
        score: METRICS.score.resolver(r),
        putts: METRICS.putts.resolver(r),
        fir: METRICS.fir.resolver(r),
        gir: METRICS.gir.resolver(r),
      };
      return base;
    });
  }, [rounds]);

  // 현재 지표 값 배열
  const seriesValues = useMemo(() => {
    const vals = chartData.map((d) => d[metric]).filter((v) => v != null && !Number.isNaN(v));
    return vals;
  }, [chartData, metric]);

  // Y축 domain 계산
  const yDomain = useMemo(() => {
    if (yMode === 'auto') {
      // Recharts의 dataMin/dataMax 기반: 타이트 또는 약간의 패딩
      if (preset === 'tight') return ['dataMin', 'dataMax'];
      if (preset === 'padding') return ['dataMin - 1', 'dataMax + 1'];
      return ['auto', 'auto'];
    }
    if (yMode === 'manual') {
      const minNum = yMin === '' ? undefined : Number(yMin);
      const maxNum = yMax === '' ? undefined : Number(yMax);
      const validMin = Number.isFinite(minNum) ? minNum : 'auto';
      const validMax = Number.isFinite(maxNum) ? maxNum : 'auto';
      return [validMin, validMax];
    }
    return ['auto', 'auto'];
  }, [yMode, preset, yMin, yMax]);

  // Tooltip 포맷터(단위 처리)
  const tooltipFormatter = (value) => {
    if (value == null || Number.isNaN(value)) return '-';
    const m = METRICS[metric];
    if (!m) return value;
    if (m.isPercent) return `${Math.round(value * 10) / 10}${m.unit}`;
    return value;
  };

  if (loading) return <div className="trend__state">불러오는 중…</div>;
  if (err) return <div className="trend__state error">{err}</div>;
  if (!chartData.length) return <div className="trend__state">데이터가 없습니다.</div>;

  // 선택 지표의 라인 존재 여부
  const hasAnyValue = seriesValues.length > 0;

  return (
    <div className="trendChart">
      {/* 컨트롤 바 */}
      <div className="trendChart__controls">
        <div className="metricToggle">
          {Object.entries(METRICS).map(([key, conf]) => (
            <button
              key={key}
              className={`metricBtn ${metric === key ? 'active' : ''}`}
              onClick={() => setMetric(key)}
              type="button"
            >
              {conf.label}
            </button>
          ))}
        </div>

        <div className="yaxisControls">
          <div className="yaxisModes">
            <label className="radio">
              <input
                type="radio"
                name="yMode"
                value="auto"
                checked={yMode === 'auto'}
                onChange={() => setYMode('auto')}
              />
              <span>Auto</span>
            </label>
            <label className={`radio ${yMode !== 'auto' ? 'disabled' : ''}`}>
              <select
                disabled={yMode !== 'auto'}
                value={preset}
                onChange={(e) => setPreset(e.target.value)}
              >
                <option value="tight">데이터에 딱 맞게</option>
                <option value="padding">상하 여유(±1)</option>
              </select>
            </label>

            <label className="radio">
              <input
                type="radio"
                name="yMode"
                value="manual"
                checked={yMode === 'manual'}
                onChange={() => setYMode('manual')}
              />
              <span>수동 범위</span>
            </label>
            <div className={`manualBox ${yMode !== 'manual' ? 'disabled' : ''}`}>
              <input
                type="number"
                placeholder="Y min"
                value={yMin}
                onChange={(e) => setYMin(e.target.value)}
                disabled={yMode !== 'manual'}
              />
              <span className="tilde">~</span>
              <input
                type="number"
                placeholder="Y max"
                value={yMax}
                onChange={(e) => setYMax(e.target.value)}
                disabled={yMode !== 'manual'}
              />
              <button
                className="btnSmall"
                onClick={() => {
                  // 현재 데이터 기준 권장 범위를 자동 채우기
                  if (seriesValues.length === 0) return;
                  const min = Math.min(...seriesValues);
                  const max = Math.max(...seriesValues);
                  // 퍼센트면 0~100 캡, 아니면 ±1 여유
                  if (METRICS[metric].isPercent) {
                    setYMin(Math.max(0, Math.floor(min)));
                    setYMax(Math.min(100, Math.ceil(max)));
                  } else {
                    setYMin(Math.floor(min - 1));
                    setYMax(Math.ceil(max + 1));
                  }
                }}
                disabled={yMode !== 'manual' || seriesValues.length === 0}
                type="button"
              >
                데이터로 채우기
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 차트 */}
      <div className="trendChart__wrap">
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={chartData} margin={{ top: 16, right: 16, bottom: 8, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" padding={{ left: 20, right: 20 }}  />
            <YAxis
              allowDecimals={false}
              domain={METRICS[metric]?.domain || ['auto', 'auto']}
              tickFormatter={(v) =>
                METRICS[metric]?.isPercent ? `${v}` : v
              }
            />

            <Tooltip formatter={tooltipFormatter} />
            {hasAnyValue ? (
              <Line
                type="monotone"
                dataKey={metric}
                strokeWidth={2}
                dot
                isAnimationActive={false}
                connectNulls
              >
                <LabelList dataKey={metric} position="top" />
              </Line>

            ) : (
              // 값이 없으면 라인 미출력
              null
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 빈 데이터 안내 */}
      {!hasAnyValue && (
        <div className="trend__state subtle">선택한 지표에 표시할 데이터가 없어요.</div>
      )}
    </div>
  );
}
