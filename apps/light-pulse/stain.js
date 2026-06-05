export function Stain() {
  const canvas = document.getElementById("stain");
  let ctx = null;

  let points = 60;
  let amplitude = 25;

  function init() {
    if (!canvas) return;
    ctx = canvas.getContext("2d");
  }

  function generate() {
    if (!ctx) init();
    if (!ctx) return;

    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);

    const centerX = width / 2;
    const centerY = height / 2;
    const baseRadius = 120 + Math.random() * 40;

    ctx.beginPath();

    for (let i = 0; i <= points; i++) {
      const angle = (i / points) * Math.PI * 2;

      const distortion = (Math.random() - 0.5) * amplitude;
      const radius = baseRadius + distortion;

      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;

      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }

    ctx.closePath();

    ctx.fillStyle = "rgba(120, 70, 20, 0.22)";
    ctx.fill();

    ctx.strokeStyle = "rgba(120, 70, 20, 0.35)";
    ctx.lineWidth = 2.5;
    ctx.stroke();
  }
  canvas.addEventListener("click", () => {
    generate();
  });

  return { generate };
}
