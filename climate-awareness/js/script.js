/* =========================================================
   THE THAW LINE — script.js
   Vanilla JS only. Handles:
   1. Active nav-link detection (per current page)
   2. Mobile nav toggle
   3. Sticky header shadow on scroll
   4. Scroll-triggered bar chart animation + count-up numbers
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {
  setActiveNavLink();
  setupMobileNav();
  setupHeaderScrollShadow();
  setupBarChartReveal();
  setupCountUp();
});

/**
 * 1. Highlight the nav link that matches the current page.
 * Works automatically on every page because it reads the
 * current URL rather than relying on a manually-added class.
 */
function setActiveNavLink() {
  const links = document.querySelectorAll(".nav-links a");
  if (!links.length) return;

  // Get current file name, defaulting to index.html for "/" or ""
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

/**
 * 2. Toggle the mobile navigation menu open/closed and
 * close it automatically after a link is chosen.
 */
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

/**
 * 3. Add a subtle shadow to the sticky header once the
 * page has been scrolled, so it visually separates from content.
 */
function setupHeaderScrollShadow() {
  const header = document.querySelector(".site-header");
  if (!header) return;

  function updateShadow() {
    header.classList.toggle("is-scrolled", window.scrollY > 4);
  }
  updateShadow();
  window.addEventListener("scroll", updateShadow, { passive: true });
}

/**
 * 4a. Animate the bar chart (used on effects.html) so bars
 * grow into view the first time they enter the viewport,
 * rather than animating on every scroll pass.
 */
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

/**
 * 4b. Count numeric stats up from 0 to their target value
 * once they scroll into view, for a bit of restrained motion
 * on the headline statistics.
 */
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
