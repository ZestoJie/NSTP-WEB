const screens = document.querySelectorAll("[data-screen]");
const navigationTriggers = document.querySelectorAll("[data-target]");
const sidebarButtons = document.querySelectorAll("[data-nav]");

function showScreen(screenName) {
  screens.forEach((screen) => {
    screen.classList.toggle("active", screen.dataset.screen === screenName);
  });
}

navigationTriggers.forEach((trigger) => {
  trigger.addEventListener("click", () => {
    const target = trigger.dataset.target;
    if (target && screens.length) {
      showScreen(target);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  });
});

sidebarButtons.forEach((button) => {
  button.addEventListener("click", () => {
    sidebarButtons.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
  });
});

const weeklyCharts = document.querySelectorAll("[data-weekly-hours]");

function renderWeeklyChart(chart) {
  const plot = chart.querySelector(".chartPlot");
  const svg = chart.querySelector(".chartLine");
  const polyline = chart.querySelector(".chartPolyline");
  const dotsGroup = chart.querySelector(".chartDots");
  const labelElements = Array.from(chart.querySelectorAll(".chartLabels span"));
  const rawValues = (chart.dataset.weeklyHours || "")
    .split(",")
    .map((value) => Number.parseFloat(value.trim()))
    .filter((value) => Number.isFinite(value));

  if (!plot || !svg || !polyline || !dotsGroup || labelElements.length === 0) {
    return;
  }

  const dayCount = labelElements.length;
  const values = Array.from({ length: dayCount }, (_, index) => rawValues[index] ?? 0);
  const plotRect = plot.getBoundingClientRect();

  if (!plotRect.width || !plotRect.height) {
    return;
  }

  const chartMax = Number.parseFloat(chart.dataset.chartMax || "") || Math.max(...values, 1);
  const topPadding = 8;
  const bottomPadding = 8;
  const usableHeight = plotRect.height - topPadding - bottomPadding;
  const plotLeft = plotRect.left;

  svg.setAttribute("viewBox", `0 0 ${plotRect.width} ${plotRect.height}`);

  const points = labelElements.map((label, index) => {
    const labelRect = label.getBoundingClientRect();
    const x = labelRect.left - plotLeft + labelRect.width / 2;
    const normalizedValue = Math.max(0, Math.min(values[index], chartMax));
    const y = topPadding + usableHeight - (normalizedValue / chartMax) * usableHeight;
    return { x, y, value: normalizedValue };
  });

  polyline.setAttribute(
    "points",
    points.map((point) => `${point.x},${point.y}`).join(" ")
  );

  dotsGroup.innerHTML = points
    .map(
      (point) =>
        `<circle cx="${point.x}" cy="${point.y}" r="6" data-hours="${point.value}"></circle>`
    )
    .join("");
}

weeklyCharts.forEach((chart) => {
  renderWeeklyChart(chart);
});

window.addEventListener("resize", () => {
  weeklyCharts.forEach((chart) => {
    renderWeeklyChart(chart);
  });
});
