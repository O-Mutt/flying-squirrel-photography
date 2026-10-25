/*
 * Flying Squirrels Photography - site behavior.
 *
 * BOOKING FORM SETUP
 * Paste your Formspree form URL below (free at https://formspree.io) and booking
 * requests will arrive in your inbox. Until it's set, the form falls back to
 * opening the visitor's email app with their request pre-filled, addressed to
 * the email in the "contact-email" links in index.html.
 */
const FORM_ENDPOINT = ""; // e.g. "https://formspree.io/f/abcdwxyz"

(function () {
  "use strict";

  // ---------- Header: shadow on scroll + mobile menu ----------
  const header = document.querySelector(".site-header");
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.getElementById("site-nav");

  const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const setMenu = (open) => {
    toggle.setAttribute("aria-expanded", String(open));
    nav.classList.toggle("is-open", open);
  };
  toggle.addEventListener("click", () => setMenu(toggle.getAttribute("aria-expanded") !== "true"));
  nav.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });

  // ---------- Photo slots: show a placeholder tile when a photo file is missing ----------
  document.querySelectorAll(".photo-slot img").forEach((img) => {
    const markEmpty = () => img.closest(".photo-slot").classList.add("is-empty");
    if (img.complete && img.naturalWidth === 0) markEmpty();
    else img.addEventListener("error", markEmpty);
  });

  // ---------- Footer year ----------
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  // ---------- Booking form ----------
  const form = document.getElementById("booking-form");
  if (!form) return;

  const status = document.getElementById("form-status");
  const submitBtn = form.querySelector('button[type="submit"]');
  const emailLink = document.querySelector("a.contact-email");
  const contactEmail = emailLink ? emailLink.getAttribute("href").replace(/^mailto:/, "") : "";

  // No booking dates in the past.
  const today = new Date();
  const isoToday = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  form.querySelectorAll('input[type="date"]').forEach((d) => { d.min = isoToday; });

  const rules = {
    name: (v) => (v.trim() ? "" : "Please tell me your name."),
    email: (v) => (!v.trim() ? "Please add your email so I can reply."
      : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? "" : "That email doesn't look quite right."),
    session: (v) => (v ? "" : "Please choose a session type."),
    date1: (v) => (!v ? "Please pick a preferred date."
      : v < isoToday ? "Please choose a date in the future." : ""),
  };

  const validateField = (id) => {
    const input = document.getElementById(id);
    const msg = rules[id](input.value);
    const err = document.getElementById(id + "-error");
    err.textContent = msg;
    if (msg) {
      input.setAttribute("aria-invalid", "true");
      input.setAttribute("aria-describedby", err.id);
    } else {
      input.removeAttribute("aria-invalid");
      input.removeAttribute("aria-describedby");
    }
    return !msg;
  };

  Object.keys(rules).forEach((id) => {
    const input = document.getElementById(id);
    input.addEventListener("blur", () => { if (input.value) validateField(id); });
    input.addEventListener("input", () => { if (input.getAttribute("aria-invalid")) validateField(id); });
  });

  const setStatus = (msg, isError) => {
    status.textContent = msg;
    status.classList.toggle("is-error", Boolean(isError));
  };

  const showSuccess = (name, viaEmailApp) => {
    const first = name.trim().split(/\s+/)[0];
    form.innerHTML =
      '<div class="form-success">' +
      '<img src="assets/img/logo-mark.jpg" alt="" width="96" height="96">' +
      "<h3></h3><p></p></div>";
    form.querySelector("h3").textContent = "Thank you, " + first + "!";
    form.querySelector("p").textContent = viaEmailApp
      ? "Your email app should have opened with your request filled in. Just hit send and I'll be in touch within two business days."
      : "Your booking request is on its way. I'll be in touch within two business days to confirm details.";
    form.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const buildEmailBody = (data) => {
    const labels = {
      name: "Name", email: "Email", phone: "Phone", session_type: "Session type",
      preferred_date: "Preferred date", backup_date: "Backup date", time_of_day: "Time of day",
      number_of_people: "Number of people", location: "Location ideas",
      heard_from: "Heard about us from", message: "Message",
    };
    return Object.keys(labels)
      .filter((k) => data.get(k))
      .map((k) => labels[k] + ": " + data.get(k))
      .join("\n");
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    setStatus("");

    const invalid = Object.keys(rules).filter((id) => !validateField(id));
    if (invalid.length) {
      document.getElementById(invalid[0]).focus();
      setStatus("Please fix the highlighted fields.", true);
      return;
    }

    const data = new FormData(form);
    if (data.get("_gotcha")) return; // bot filled the hidden field

    const name = data.get("name");

    if (!FORM_ENDPOINT) {
      const subject = "Booking request: " + data.get("session_type") + " (" + name + ")";
      window.location.href = "mailto:" + contactEmail +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(buildEmailBody(data));
      showSuccess(name, true);
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Sending…";
    try {
      data.append("_subject", "New booking request: " + data.get("session_type"));
      const res = await fetch(FORM_ENDPOINT, {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" },
      });
      if (!res.ok) throw new Error("HTTP " + res.status);
      showSuccess(name, false);
    } catch (err) {
      submitBtn.disabled = false;
      submitBtn.textContent = "Send booking request";
      setStatus("Sorry, something went wrong sending your request. Please try again, or email " + contactEmail + " directly.", true);
    }
  });
})();
