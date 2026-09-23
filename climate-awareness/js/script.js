
document.addEventListener("DOMContentLoaded", function () {
  setActiveNavLink();
  setupMobileNav();
  setupHeaderScrollShadow();
  setupBarChartReveal();
  setupCountUp();
});

function setActiveNavLink() {
  const links = document.querySelectorAll(".nav-links a");
  if (!links.length) return;

  let currentPage = window.location.pathname.split("/").pop();
  if (currentPage === "") currentPage = "index.html";

  links.forEach(function (link) {
    const linkPage = link.getAttribute("href");
    if (linkPage === currentPage) {
      link.classList.add("active");
      link.setAttribute("aria-current", "page");
    } else {
      link.classList.remove("active");
      link.removeAttribute("aria-current");
    }
  });
}


function setupMobileNav() {
  const toggle = document.querySelector(".nav-toggle");
  const menu = document.querySelector(".nav-links");
  if (!toggle || !menu) return;

  toggle.addEventListener("click", function () {
    const isOpen = menu.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });

  menu.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      menu.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });

  // Close the menu if the viewport is resized back to desktop width
  window.addEventListener("resize", function () {
    if (window.innerWidth > 640 && menu.classList.contains("is-open")) {
      menu.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    }
  });
}


function setupHeaderScrollShadow() {
  const header = document.querySelector(".site-header");
  if (!header) return;

  function updateShadow() {
    header.classList.toggle("is-scrolled", window.scrollY > 4);
  }
  updateShadow();
  window.addEventListener("scroll", updateShadow, { passive: true });
}


function setupBarChartReveal() {
  const bars = document.querySelectorAll(".bar");
  if (!bars.length) return;

  if (!("IntersectionObserver" in window)) {
    bars.forEach(function (bar) { bar.classList.add("is-visible"); });
    return;
  }

  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.4 }
  );

  bars.forEach(function (bar) { observer.observe(bar); });
}


function setupCountUp() {
  const targets = document.querySelectorAll("[data-count-to]");
  if (!targets.length) return;

  if (!("IntersectionObserver" in window)) return;

  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        animateCount(entry.target);
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.6 }
  );

  targets.forEach(function (el) { observer.observe(el); });
}

function animateCount(el) {
  const target = parseFloat(el.getAttribute("data-count-to"));
  const decimals = el.getAttribute("data-decimals") ? parseInt(el.getAttribute("data-decimals"), 10) : 0;
  const suffix = el.getAttribute("data-suffix") || "";
  const duration = 1200;
  const start = performance.now();

  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    const value = target * eased;
    el.textContent = value.toFixed(decimals) + suffix;
    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      el.textContent = target.toFixed(decimals) + suffix;
    }
  }
  requestAnimationFrame(tick);
}
