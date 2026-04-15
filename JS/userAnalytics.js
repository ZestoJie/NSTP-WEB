document.addEventListener("DOMContentLoaded", () => {
  const circles = document.querySelectorAll(".progress-ring");

  circles.forEach((ring, index) => {
    const progress = Number(ring.dataset.progress) || 0;
    const color = ring.dataset.color || "#52c7c9";
    const meter = ring.querySelector(".meter");
    const radius = 46;
    const circumference = 2 * Math.PI * radius;

    meter.style.stroke = color;
    meter.style.strokeDasharray = circumference;

    // start hidden
    meter.style.strokeDashoffset = circumference;

    setTimeout(() => {
      const offset = circumference - (progress / 100) * circumference;
      meter.style.strokeDashoffset = offset;
    }, 250 + index * 250);
  });
});