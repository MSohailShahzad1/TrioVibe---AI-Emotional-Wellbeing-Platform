import React, { useEffect, useRef } from "react";

const BlueBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    let time = 0;

    function animate() {
      ctx.clearRect(0, 0, width, height);

      // Animated gradient background
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, `hsl(${200 + Math.sin(time) * 20}, 80%, 20%)`);
      gradient.addColorStop(0.5, `hsl(${210 + Math.cos(time) * 20}, 70%, 30%)`);
      gradient.addColorStop(1, `hsl(${220 + Math.sin(time / 2) * 30}, 70%, 40%)`);

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      time += 0.01;
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

export default BlueBackground;