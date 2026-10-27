/* Kave Cafe: nav, open status, menu tabs, café picker, GSAP fade-ins */
(function () {
  "use strict";

  // Minutes from midnight. 0 = Sunday. Edit here if hours change.
  var HOURS = { 0: [450, 1140], 1: [360, 1140], 2: [360, 1140], 3: [360, 1140], 4: [360, 1140], 5: [360, 1140], 6: [450, 1140] };

  function londonNow() {
    var parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(new Date());
    var get = function (t) { return parts.filter(function (p) { return p.type === t; })[0].value; };
    var days = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
    return { day: days[get("weekday")], mins: +get("hour") * 60 + +get("minute") };
  }
  function fmt(m) {
    var h = Math.floor(m / 60), mm = m % 60, ap = h >= 12 ? "pm" : "am";
    h = h % 12 || 12;
    return h + (mm ? ":" + String(mm).padStart(2, "0") : "") + ap;
  }

  var now = londonNow(), today = HOURS[now.day];
  var pill = document.querySelector("[data-status]");
  var pillText = document.querySelector("[data-status-text]");
  if (now.mins >= today[0] && now.mins < today[1]) {
    pill.classList.add("is-open");
    pillText.textContent = "Open now until " + fmt(today[1]);
  } else {
    var opens = now.mins < today[0] ? today[0] : HOURS[(now.day + 1) % 7][0];
    pillText.textContent = "Closed, opens " + (now.mins < today[0] ? "at " : "tomorrow at ") + fmt(opens);
  }
  var t = document.querySelector("[data-today]");
  if (t) t.textContent = fmt(today[0]) + " to " + fmt(today[1]);
  var row = document.querySelector('.hours tr[data-day="' + now.day + '"]');
  if (row) row.classList.add("today");
  var yr = document.querySelector("[data-year]");
  if (yr) yr.textContent = new Date().getFullYear();

  // Mobile nav
  var btn = document.querySelector(".menu-btn"), nav = document.getElementById("nav");
  btn.addEventListener("click", function () {
    var open = btn.getAttribute("aria-expanded") === "true";
    btn.setAttribute("aria-expanded", String(!open));
    nav.classList.toggle("open", !open);
  });
  nav.addEventListener("click", function (e) {
    if (e.target.tagName === "A") { btn.setAttribute("aria-expanded", "false"); nav.classList.remove("open"); }
  });

  // Tabs helper (arrow keys move between tabs)
  function tabs(list, onSelect) {
    var items = Array.prototype.slice.call(list.querySelectorAll('[role="tab"]'));
    function select(tab, focus) {
      items.forEach(function (b) { var on = b === tab; b.setAttribute("aria-selected", on); b.tabIndex = on ? 0 : -1; });
      if (focus) tab.focus();
      onSelect(tab);
    }
    items.forEach(function (b, i) {
      b.tabIndex = b.getAttribute("aria-selected") === "true" ? 0 : -1;
      b.addEventListener("click", function () { select(b); });
      b.addEventListener("keydown", function (e) {
        var d = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
        if (!d) return;
        e.preventDefault();
        select(items[(i + d + items.length) % items.length], true);
      });
    });
  }

  // Menu tabs
  var photo = document.querySelector("[data-menu-photo]");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  tabs(document.querySelector(".menu-tabs"), function (tab) {
    document.querySelectorAll(".panel").forEach(function (p) { p.hidden = p.id !== tab.getAttribute("aria-controls"); });
    var panel = document.getElementById(tab.getAttribute("aria-controls"));
    if (photo && panel.dataset.photo) { photo.src = panel.dataset.photo; photo.alt = panel.dataset.alt || ""; }
    if (!reduce && window.gsap) gsap.fromTo([panel, photo], { opacity: 0 }, { opacity: 1, duration: 0.45, ease: "power1.out" });
  });

  // Café picker
  var frame = document.querySelector("[data-map]"), dir = document.querySelector("[data-dir]");
  var apple = document.querySelector("[data-apple]"), city = document.querySelector("[data-city]");
  tabs(document.querySelector(".branches"), function (tab) {
    var q = tab.dataset.q, enc = encodeURIComponent(q), addr = encodeURIComponent(q.replace(/^Kave Cafe, /, ""));
    frame.src = "https://www.google.com/maps?q=" + enc + "&output=embed";
    frame.title = "Map of " + q;
    dir.href = "https://www.google.com/maps/dir/?api=1&destination=" + enc;
    apple.href = "https://maps.apple.com/?q=Kave%20Cafe&address=" + addr;
    city.href = "https://citymapper.com/directions?endname=Kave%20Cafe&endaddress=" + addr;
  });

  // Fade-ins
  if (!reduce && window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    gsap.from("[data-hero]", { opacity: 0, y: 16, duration: 1, ease: "power2.out", stagger: 0.12 });
    gsap.utils.toArray("[data-fade]").forEach(function (el) {
      gsap.from(el, { opacity: 0, y: 20, duration: 0.9, ease: "power2.out", scrollTrigger: { trigger: el, start: "top 90%", once: true } });
    });
  }
})();
