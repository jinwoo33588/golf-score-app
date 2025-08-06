import { useNavigate } from 'react-router-dom';
import './RoundCard.css';

const RoundCard = ({ round }) => {
  console.log('▶ round prop:', round);
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/rounds/${round.id}`);
  };

  return (
    <div onClick={handleClick} className="roundcard">
      <div className="roundcard-info">
      {/* 라운드 카드의 정보 영역 */}
        <div className="roundcard-course">{round.course}</div>
        <div className="roundcard-meta">
          <span>{round.date.slice(0, 10)}</span>
        </div>
        <div className="roundcard-players">
          <span className="tag">플레이어</span>
          <span className="player-list">김진우</span>
        </div>
      </div>
      <div className="score-box">
        {round.score ?? '-'}
      </div>
    </div>
  );
};

export default RoundCard;
