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
