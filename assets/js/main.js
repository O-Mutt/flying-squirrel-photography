/*
 * Flying Squirrels Photography - site behavior.
 *
 * BOOKING FORM SETUP (see README)
 * FORM_ENDPOINT: paste your Google Apps Script web app URL (adds requests to your
 * Google Calendar and emails you) or a Formspree form URL. Until it's set, the
 * form falls back to opening the visitor's email app with their request
 * pre-filled, addressed to the email in the "contact-email" links in index.html.
 */
const FORM_ENDPOINT = ""; // e.g. "https://script.google.com/macros/s/AKfy.../exec"

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

  // ---------- Hero: swap the big logo for assets/img/hero.jpg once that photo exists ----------
  const hero = document.querySelector(".hero");
  const heroPhoto = document.querySelector(".hero-photo");
  if (hero && heroPhoto) {
    const useHeroPhoto = () => hero.classList.add("has-photo");
    if (heroPhoto.complete && heroPhoto.naturalWidth > 0) useHeroPhoto();
    else heroPhoto.addEventListener("load", useHeroPhoto);
  }

  // ---------- Lightbox: click a gallery photo to view it larger ----------
  const photoGroups = document.querySelectorAll(".gallery, .photo-strip");
  if (photoGroups.length && window.HTMLDialogElement) {
    const box = document.createElement("dialog");
    box.className = "lightbox";
    box.setAttribute("aria-label", "Photo viewer");
    box.innerHTML =
      '<figure><img alt=""><figcaption></figcaption></figure>' +
      '<button type="button" class="lb-close" aria-label="Close">&times;</button>' +
      '<button type="button" class="lb-prev" aria-label="Previous photo">&#8249;</button>' +
      '<button type="button" class="lb-next" aria-label="Next photo">&#8250;</button>';
    document.body.appendChild(box);
    const boxImg = box.querySelector("img");
    const boxCaption = box.querySelector("figcaption");
    let items = [];
    let index = 0;

    const show = (i) => {
      index = (i + items.length) % items.length;
      const img = items[index];
      boxImg.src = img.dataset.full || img.currentSrc || img.src;
      boxImg.alt = img.alt;
      boxCaption.textContent = img.alt;
    };
    const open = (group, img) => {
      items = Array.from(group.querySelectorAll(".photo-slot.is-zoomable img"));
      box.classList.toggle("is-single", items.length < 2);
      show(items.indexOf(img));
      box.showModal();
    };

    photoGroups.forEach((group) => {
      group.querySelectorAll(".photo-slot img").forEach((img) => {
        const slot = img.closest(".photo-slot");
        const enable = () => {
          slot.classList.add("is-zoomable");
          slot.tabIndex = 0;
          slot.setAttribute("role", "button");
          slot.setAttribute("aria-label", "View larger: " + img.alt);
        };
        if (img.complete && img.naturalWidth > 0) enable();
        else img.addEventListener("load", enable);

        slot.addEventListener("click", () => { if (slot.classList.contains("is-zoomable")) open(group, img); });
        slot.addEventListener("keydown", (e) => {
          if ((e.key === "Enter" || e.key === " ") && slot.classList.contains("is-zoomable")) {
            e.preventDefault();
            open(group, img);
          }
        });
      });
    });

    box.querySelector(".lb-close").addEventListener("click", () => box.close());
    box.querySelector(".lb-prev").addEventListener("click", () => show(index - 1));
    box.querySelector(".lb-next").addEventListener("click", () => show(index + 1));
    // The dialog fills the screen, so a click that lands on it directly is outside the photo.
    box.addEventListener("click", (e) => { if (e.target === box || e.target === box.querySelector("figure")) box.close(); });
    box.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") show(index - 1);
      if (e.key === "ArrowRight") show(index + 1);
    });
    let touchX = null;
    box.addEventListener("touchstart", (e) => { touchX = e.touches[0].clientX; }, { passive: true });
    box.addEventListener("touchend", (e) => {
      if (touchX === null || items.length < 2) return;
      const dx = e.changedTouches[0].clientX - touchX;
      if (Math.abs(dx) > 50) show(index + (dx < 0 ? 1 : -1));
      touchX = null;
    });
  }

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
      : "Your request is on its way. I'll be in touch within two business days.";
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
      // URL-encoded so both Formspree and Google Apps Script can read the fields
      // (Apps Script doesn't parse multipart bodies).
      const res = await fetch(FORM_ENDPOINT, {
        method: "POST",
        body: new URLSearchParams(data),
        headers: { Accept: "application/json" },
      });
      // Apps Script reports script errors as a 200 HTML page, so require a JSON reply.
      const reply = await res.json().catch(() => null);
      if (!res.ok || !reply || reply.ok === false) throw new Error("Request failed");
      showSuccess(name, false);
    } catch (err) {
      submitBtn.disabled = false;
      submitBtn.textContent = "Send request";
      setStatus("Sorry, something went wrong sending your request. Please try again, or email " + contactEmail + " directly.", true);
    }
  });
})();
