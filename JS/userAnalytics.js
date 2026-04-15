document.addEventListener("DOMContentLoaded", () => {
  const stats = {
    totalHours: 24,
    programsEnrolled: 3,
    badgesEarned: 5,
    certifications: 1
  };

  const totalHoursEl = document.getElementById("totalHours");
  const programsEnrolledEl = document.getElementById("programsEnrolled");
  const badgesEarnedEl = document.getElementById("badgesEarned");
  const certificationsEl = document.getElementById("certifications");

  if (totalHoursEl) totalHoursEl.textContent = stats.totalHours;
  if (programsEnrolledEl) programsEnrolledEl.textContent = stats.programsEnrolled;
  if (badgesEarnedEl) badgesEarnedEl.textContent = stats.badgesEarned;
  if (certificationsEl) certificationsEl.textContent = stats.certifications;

  const circles = document.querySelectorAll(".progress-ring");

  circles.forEach((ring, index) => {
    const progress = Number(ring.dataset.progress) || 0;
    const color = ring.dataset.color || "#52c7c9";
    const meter = ring.querySelector(".meter");
    const radius = 46;
    const circumference = 2 * Math.PI * radius;

    if (!meter) return;

    meter.style.stroke = color;
    meter.style.strokeDasharray = `${circumference}`;
    meter.style.strokeDashoffset = `${circumference}`;

    setTimeout(() => {
      const offset = circumference - (progress / 100) * circumference;
      meter.style.strokeDashoffset = `${offset}`;
    }, 250 + index * 250);
  });

  const refreshBtn = document.getElementById("refreshAnalyticsBtn");

  if (refreshBtn) {
    refreshBtn.addEventListener("click", () => {
      window.location.reload();
    });
  }
});