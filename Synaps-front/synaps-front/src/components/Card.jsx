// src/components/Card.jsx
const Card = ({ title, children }) => {
    return (
      <div className="bg-gluon_gray p-6 radius-lg space-y-3 text-snow w-64">
        <h2 className="display-sm text-xl">{title}</h2>
        <div className="text-md">{children}</div>
      </div>
    );
  };
  
  export default Card;
  