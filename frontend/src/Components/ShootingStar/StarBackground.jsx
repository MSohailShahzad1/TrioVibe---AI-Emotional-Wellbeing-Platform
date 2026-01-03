import React from "react";

const StarsBackground = () => {
  const stars = Array.from({ length: 80 }); // number of stars

  return (
    <div className="stars">
      {stars.map((_, i) => {
        const left = Math.random() * 100;
        const top = Math.random() * 100;
        const delay = Math.random() * 5;

        return (
          <span
            key={i}
            style={{
              left: `${left}%`,
              top: `${top}%`,
              animationDelay: `${delay}s`,
            }}
          ></span>
        );
      })}
    </div>
  );
};

export default StarsBackground;
