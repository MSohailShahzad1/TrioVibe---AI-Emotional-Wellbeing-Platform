import React, { useEffect, useRef } from "react";

const InteractiveBlueFlowBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const lines = Array.from({ length: 25 }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      dx: (Math.random() - 0.5) * 1.2,
      dy: (Math.random() - 0.5) * 1.2,
      color: `hsla(${200 + Math.random() * 40}, 100%, 60%, 0.15)`,
      path: [],
      glow: 0 // 🔹 glow intensity (0 = normal, 1 = max glow)
    }));

    function animate() {
      ctx.fillStyle = "rgba(10, 25, 47, 0.15)";
      ctx.fillRect(0, 0, width, height);

      lines.forEach((line) => {
        line.x += line.dx;
        line.y += line.dy;

        if (line.x < 0 || line.x > width) line.dx *= -1;
        if (line.y < 0 || line.y > height) line.dy *= -1;

        line.path.push({ x: line.x, y: line.y });
        if (line.path.length > 50) line.path.shift();

        // 🔹 Draw line
        ctx.beginPath();
        ctx.moveTo(line.path[0].x, line.path[0].y);
        for (let i = 1; i < line.path.length; i++) {
          ctx.lineTo(line.path[i].x, line.path[i].y);
        }

        // glow effect if active
        if (line.glow > 0) {
          ctx.shadowBlur = 20 * line.glow;
          ctx.shadowColor = "rgba(0, 200, 255, 0.8)";
          ctx.strokeStyle = `hsla(190, 100%, 70%, ${0.5 + 0.5 * line.glow})`;
          line.glow *= 0.95; // 🔹 fade out glow gradually
        } else {
          ctx.shadowBlur = 0;
          ctx.strokeStyle = line.color;
        }

        ctx.lineWidth = 1.5;
        ctx.stroke();
      });

      requestAnimationFrame(animate);
    }

    animate();

    // 🔹 Handle click interaction
    canvas.addEventListener("click", (e) => {
      const mx = e.clientX;
      const my = e.clientY;

      lines.forEach((line) => {
        // find last point in path (closest to click)
        const lastPoint = line.path[line.path.length - 1];
        if (!lastPoint) return;

        const dx = lastPoint.x - mx;
        const dy = lastPoint.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 50) {
          line.glow = 1; // 🔥 trigger glow
        }
      });
    });

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

export default InteractiveBlueFlowBackground;
