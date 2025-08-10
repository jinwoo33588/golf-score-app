import React from 'react';
import './ScoreCard.css';

/**
 * Scorecard
 * 빈 스코어카드 그리드 (1~18)
 * Props:
 *  - none (데이터 없이 빈칸 표시)
 * 나중에 필요 시 값 매핑하여 채워주세요.
 */
const ScoreCard = () => {
  // const holes = Array.from({ length: 18 }, (_, i) => i + 1);

  return (
    <div
      style={{
        width: '450px',
        height: '200px',
        backgroundColor: '#ddd',
        border: '1px solid #333',
        margin: '1rem'
      }}
    />
      
    
    // <div className="scorecard">
    //   {holes.map(num => (
    //     <div key={num} className="scorecell">
    //       <span className="holenum">{num}</span>
    //     </div>
    //   ))}
    // </div>
  );
};

export default ScoreCard;
