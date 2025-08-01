import './StatBox.css';

const StatBox = ({ label, value }) => {
  return (
    <div className="statbox">
      <div className="statbox-value">{value}</div>
      <div className="statbox-label">{label}</div>
    </div>
  );
};

export default StatBox;
