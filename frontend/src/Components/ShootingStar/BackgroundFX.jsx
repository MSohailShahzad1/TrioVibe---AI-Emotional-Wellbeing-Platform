import React from "react";
// import "../../styles/background-orbs.css";

const BackgroundFX = () => {
  return (
    <div className="bg-layer">
      <div className="absolute inset-0 bg-animated" />
      <span className="orb orb--1" />
      <span className="orb orb--2" />
      <span className="orb orb--3" />
      <span className="orb orb--4" />
    </div>
  );
};

export default BackgroundFX;
