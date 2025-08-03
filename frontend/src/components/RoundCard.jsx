import { useNavigate } from 'react-router-dom';
import './RoundCard.css';

const RoundCard = ({ round }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/round/${round.id}`);
  };

  return (
    <div onClick={handleClick} className="roundcard">
      <div className="roundcard-content">
        <div>
          <h3 className="roundcard-course">{round.course}</h3>
          <p className="roundcard-date">{round.date}</p>
        </div>
        <div className="roundcard-score">
          <p className="roundcard-score-label">날씨</p>
          <p className="roundcard-score-value">{round.weather}</p>
        </div>
      </div>
    </div>
  );
};

export default RoundCard;
