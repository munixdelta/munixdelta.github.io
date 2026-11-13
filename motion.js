const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
const hero = document.querySelector(".hero");
const canvas = hero.querySelector("canvas");
const ctx = canvas.getContext("2d");

if ("IntersectionObserver" in window) {
  const reveals = new IntersectionObserver((entries, observer) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      if (!motion.matches) entry.target.classList.add("reveal");
      observer.unobserve(entry.target);
    }
  }, { threshold: 0.12 });

  document.querySelectorAll(".card, .skill-grid > div, .about, .contact").forEach(
    element => reveals.observe(element)
  );
}

if (ctx && "IntersectionObserver" in window && "ResizeObserver" in window) {
  const particles = Array.from({ length: 85 }, () => ({
    angle: Math.random() * Math.PI * 2,
    radius: 0.14 + Math.random() * 0.62,
    speed: (0.04 + Math.random() * 0.12) * (Math.random() < 0.5 ? -1 : 1),
    size: 0.6 + Math.random() * 1.55,
    alpha: 0.22 + Math.random() * 0.6
  }));

  let width = 0;
  let height = 0;
  let visible = false;
  let frame = 0;
  let previous = 0;
  let time = 0;
  const pointer = { x: 0, y: 0 };
  const offset = { x: 0, y: 0 };

  function draw(timestamp) {
    frame = 0;
    if (previous) time += Math.min(timestamp - previous, 40) / 1000;
    previous = timestamp;
    offset.x += (pointer.x - offset.x) * 0.06;
    offset.y += (pointer.y - offset.y) * 0.06;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#92ebdb";
    for (const particle of particles) {
      const angle = particle.angle + time * particle.speed;
      const x = width / 2 + Math.cos(angle) * particle.radius * width + offset.x;
      const y = height / 2 + Math.sin(angle) * particle.radius * height + offset.y;
      ctx.globalAlpha = particle.alpha * (0.82 + 0.18 * Math.sin(time * 1.4 + particle.angle));
      ctx.beginPath();
      ctx.arc(x, y, particle.size, 0, Math.PI * 2);
      ctx.fill();
    }
    frame = requestAnimationFrame(draw);
  }

  function sync() {
    if (visible && !motion.matches && !document.hidden) {
      if (!frame) frame = requestAnimationFrame(draw);
      return;
    }
    cancelAnimationFrame(frame);
    frame = 0;
    previous = 0;
    if (motion.matches) ctx.clearRect(0, 0, width, height);
  }

  new ResizeObserver(() => {
    const bounds = canvas.getBoundingClientRect();
    width = bounds.width;
    height = bounds.height;
    const scale = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
  }).observe(canvas);

  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    sync();
  }).observe(hero);

  hero.addEventListener("pointermove", event => {
    if (event.pointerType !== "mouse" || motion.matches) return;
    const bounds = hero.getBoundingClientRect();
    pointer.x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 40;
    pointer.y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 30;
  });
  hero.addEventListener("pointerleave", () => {
    pointer.x = 0;
    pointer.y = 0;
  });
  motion.addEventListener("change", sync);
  document.addEventListener("visibilitychange", sync);
}
