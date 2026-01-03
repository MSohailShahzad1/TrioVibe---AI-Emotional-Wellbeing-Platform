import React, { useEffect, useRef } from "react";

const BackgroundOrbs = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const orbs = Array.from({ length: 15 }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: 30 + Math.random() * 40,
      dx: (Math.random() - 0.5) * 0.2, // slow drifting
      dy: (Math.random() - 0.5) * 0.2,
      color: `rgba(173, 216, 230, 0.2)` // soft light blue glow
    }));

    function animate() {
      ctx.clearRect(0, 0, width, height);

      // soft gradient background
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, "#0f2027");  // deep blue
      gradient.addColorStop(0.5, "#203a43"); // darker teal-blue
      gradient.addColorStop(1, "#2c5364");  // ocean blue
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // draw orbs
      orbs.forEach((orb) => {
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
        ctx.fillStyle = orb.color;
        ctx.fill();

        orb.x += orb.dx;
        orb.y += orb.dy;

        // bounce softly
        if (orb.x < 0 || orb.x > width) orb.dx *= -1;
        if (orb.y < 0 || orb.y > height) orb.dy *= -1;
      });

      requestAnimationFrame(animate);
    }

    animate();

    window.addEventListener("resize", () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });
  }, []);

  return (
  <canvas
    ref={canvasRef}
    className="fixed top-0 left-0 w-full h-full -z-10"
  />
);
  
};

export default BackgroundOrbs;
