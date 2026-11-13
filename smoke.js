(() => {
  const canvas = document.querySelector(".smoke-trail");
  const context = canvas.getContext("2d");
  if (!context) return;

  const enabled = matchMedia("(prefers-reduced-motion: no-preference) and (any-pointer: fine)");
  const puffs = [];
  let lastPoint;
  let frame = 0;
  let width = 0;
  let height = 0;

  function resize() {
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    const ratio = Math.min(devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    lastPoint = undefined;
  }

  function clear() {
    cancelAnimationFrame(frame);
    frame = 0;
    lastPoint = undefined;
    puffs.length = 0;
    context.clearRect(0, 0, width, height);
  }

  function draw(now) {
    frame = 0;
    context.clearRect(0, 0, width, height);
    for (let index = puffs.length - 1; index >= 0; index--) {
      const puff = puffs[index];
      const age = (now - puff.created) / 1150;
      if (age >= 1) {
        puffs.splice(index, 1);
        continue;
      }
      context.save();
      context.translate(puff.x + puff.dx * age, puff.y - 34 * age + puff.dy * age);
      context.rotate(puff.angle + age * 0.85);
      context.scale(1.35, 0.72);
      const radius = puff.size * (0.75 + age * 1.45);
      const opacity = (1 - age) ** 2 * 0.17;
      const fill = context.createRadialGradient(0, 0, radius * 0.1, 0, 0, radius);
      fill.addColorStop(0, `rgba(117, 221, 218, ${opacity})`);
      fill.addColorStop(0.55, `rgba(82, 137, 188, ${opacity * 0.56})`);
      fill.addColorStop(1, "rgba(82, 137, 188, 0)");
      context.fillStyle = fill;
      context.fillRect(-radius, -radius, radius * 2, radius * 2);
      context.restore();
    }
    if (puffs.length) frame = requestAnimationFrame(draw);
  }

  window.addEventListener("pointermove", event => {
    if (!enabled.matches || document.hidden || event.pointerType !== "mouse") return;
    const { clientX: x, clientY: y } = event;
    const now = performance.now();
    const previous = lastPoint && now - lastPoint.time < 100 ? lastPoint : { x, y };
    const distance = Math.hypot(x - previous.x, y - previous.y);
    if (distance < 6 && lastPoint && now - lastPoint.time < 100) return;
    const steps = Math.min(7, Math.max(1, Math.ceil(distance / 14)));
    for (let step = 1; step <= steps; step++) {
      puffs.push({
        x: previous.x + (x - previous.x) * step / steps,
        y: previous.y + (y - previous.y) * step / steps,
        created: now,
        angle: Math.random() * Math.PI,
        dx: (Math.random() - 0.5) * 58,
        dy: (Math.random() - 0.5) * 35,
        size: 24 + Math.random() * 26
      });
    }
    if (puffs.length > 100) puffs.splice(0, puffs.length - 100);
    lastPoint = { x, y, time: now };
    if (!frame) frame = requestAnimationFrame(draw);
  }, { passive: true });

  window.addEventListener("resize", resize);
  enabled.addEventListener("change", () => { clear(); resize(); });
  document.addEventListener("visibilitychange", () => { if (document.hidden) clear(); });
  resize();
})();
