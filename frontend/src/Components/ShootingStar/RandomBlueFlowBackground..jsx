import React, { useEffect, useRef } from "react";

const RandomBlueFlowBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const lines = Array.from({ length: 25 }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      dx: (Math.random() - 0.5) * 1.2, // random drifting speed
      dy: (Math.random() - 0.5) * 1.2,
      color: `hsla(${200 + Math.random() * 40}, 100%, 60%, 0.15)`, // random shades of blue
      path: []
    }));

    function animate() {
      ctx.fillStyle = "rgba(10, 25, 47, 0.15)"; // dark blue trail fade
      ctx.fillRect(0, 0, width, height);

      lines.forEach((line) => {
        line.x += line.dx;
        line.y += line.dy;

        // bounce from edges
        if (line.x < 0 || line.x > width) line.dx *= -1;
        if (line.y < 0 || line.y > height) line.dy *= -1;

        // keep a path history
        line.path.push({ x: line.x, y: line.y });
        if (line.path.length > 50) line.path.shift();

        // draw the line path
        ctx.beginPath();
        ctx.moveTo(line.path[0].x, line.path[0].y);
        for (let i = 1; i < line.path.length; i++) {
          ctx.lineTo(line.path[i].x, line.path[i].y);
        }
        ctx.strokeStyle = line.color;
        ctx.lineWidth = 1.5;
        ctx.stroke();
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

export default RandomBlueFlowBackground;
