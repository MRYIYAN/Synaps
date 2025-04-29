// src/components/Button.jsx
const Button = ({ children, onClick }) => {
    return (
      <button
        onClick={onClick}
        className="bg-liquid_lava text-snow p-3 radius-md medium hover:bg-gluon_gray transition-all"
      >
        {children}
      </button>
    );
  };
  
  export default Button;
  