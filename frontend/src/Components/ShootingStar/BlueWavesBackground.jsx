import React, { useEffect, useRef } from "react";

const BlueWavesBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    let time = 0;

    function drawWave(yOffset, color, speed, amplitude, wavelength) {
      ctx.beginPath();
      ctx.moveTo(0, height / 2);

      for (let x = 0; x <= width; x += 10) {
        const y =
          height / 2 +
          Math.sin((x / wavelength) + time * speed + yOffset) * amplitude;
        ctx.lineTo(x, y);
      }

      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.4;
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    function animate() {
      ctx.clearRect(0, 0, width, height);

      // gradient background
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, "#0a192f"); // deep navy blue
      gradient.addColorStop(1, "#1e3a8a"); // rich blue
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // subtle layered waves
      drawWave(0, "#3b82f6", 0.6, 40, 200);
      drawWave(2, "#60a5fa", 0.8, 30, 250);
      drawWave(4, "#93c5fd", 0.4, 50, 300);

      time += 0.02;
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

export default BlueWavesBackground;
