/**
 * Flying Squirrels Photography - booking request handler (Google Apps Script).
 *
 * Receives booking requests from the website form and:
 *   1. adds a "Booking request" all-day hold to your Google Calendar on the
 *      preferred date (and backup date, if given),
 *   2. emails you the details, including anything already on your calendar
 *      those days, with Reply going straight to the client.
 *
 * Setup steps are in the README ("Booking form -> Google Calendar").
 */

const CONFIG = {
  // "primary" is your main calendar. To keep requests separate, create a calendar
  // (e.g. "Photo bookings") and paste its Calendar ID from its settings page here.
  CALENDAR_ID: "primary",

  // Where new-request emails go. Blank = the Google account that owns this script.
  NOTIFY_EMAIL: "",

  // Also send the client a short "got your request" email from your account.
  SEND_CLIENT_CONFIRMATION: false,

  BUSINESS_NAME: "Flying Squirrels Photography",
};

const FIELD_LABELS = {
  name: "Name",
  email: "Email",
  phone: "Phone",
  session_type: "Session type",
  preferred_date: "Preferred date",
  backup_date: "Backup date",
  time_of_day: "Time of day",
  number_of_people: "Number of people",
  location: "Location ideas",
  heard_from: "Heard about us from",
  message: "Message",
};

/** Run this once from the editor to grant calendar and email permissions. */
function setup() {
  const cal = getCalendar_();
  Logger.log("Calendar OK: " + cal.getName());
  Logger.log("Notifications will go to: " + notifyEmail_());
  Logger.log("Remaining email quota today: " + MailApp.getRemainingDailyQuota());
}

/** Visiting the web app URL in a browser shows this, so you can check it's live. */
function doGet() {
  return ContentService.createTextOutput(CONFIG.BUSINESS_NAME + " booking handler is running.");
}

function doPost(e) {
  try {
    const p = clean_((e && e.parameter) || {});

    // Spam trap: the hidden field is only ever filled in by bots.
    if (p._gotcha) return json_({ ok: true });

    const problem = validate_(p);
    if (problem) return json_({ ok: false, error: problem });

    const cal = getCalendar_();
    const dates = [{ iso: p.preferred_date, label: "preferred" }];
    if (p.backup_date && p.backup_date !== p.preferred_date) dates.push({ iso: p.backup_date, label: "backup" });

    const details = formatDetails_(p);
    const conflicts = [];

    dates.forEach((d) => {
      const day = parseDate_(d.iso);
      const existing = cal.getEventsForDay(day).filter((ev) => !isBookingRequest_(ev));
      conflicts.push({ label: d.label, iso: d.iso, events: existing });

      const ev = cal.createAllDayEvent(
        "Booking request: " + p.session_type + " - " + p.name + " (" + d.label + " date)",
        day,
        { description: details + "\n\nThis is a request, not a confirmed booking. Delete this hold once you've confirmed or declined." }
      );
      ev.setColor(CalendarApp.EventColor.YELLOW);
      ev.setTransparency(CalendarApp.EventTransparency.TRANSPARENT); // show as free until confirmed
      if (p.location) ev.setLocation(p.location);
    });

    MailApp.sendEmail({
      to: notifyEmail_(),
      replyTo: p.email,
      subject: "New booking request: " + p.session_type + " - " + p.name + " (" + p.preferred_date + ")",
      body: details + "\n\n" + formatConflicts_(conflicts) +
        "\n\nA yellow hold has been added to your calendar. Hit Reply to answer " + p.name + " directly.",
    });

    if (CONFIG.SEND_CLIENT_CONFIRMATION) {
      MailApp.sendEmail({
        to: p.email,
        subject: "We got your booking request - " + CONFIG.BUSINESS_NAME,
        body: "Hi " + p.name.split(/\s+/)[0] + ",\n\n" +
          "Thanks for reaching out! I've received your request for a " + p.session_type +
          " session and will be in touch within two business days to confirm availability.\n\n" +
          "Here's what you sent:\n\n" + details + "\n\n" + CONFIG.BUSINESS_NAME,
      });
    }

    return json_({ ok: true });
  } catch (err) {
    console.error(err);
    return json_({ ok: false, error: "Server error" });
  }
}

// ---------- helpers ----------

function getCalendar_() {
  const cal = CONFIG.CALENDAR_ID === "primary"
    ? CalendarApp.getDefaultCalendar()
    : CalendarApp.getCalendarById(CONFIG.CALENDAR_ID);
  if (!cal) throw new Error("Calendar not found. Check CALENDAR_ID in CONFIG.");
  return cal;
}

function notifyEmail_() {
  return CONFIG.NOTIFY_EMAIL || Session.getEffectiveUser().getEmail();
}

/** Keep only expected fields, trimmed and length-limited. */
function clean_(params) {
  const out = {};
  Object.keys(FIELD_LABELS).concat("_gotcha").forEach((k) => {
    const v = params[k];
    out[k] = typeof v === "string" ? v.trim().slice(0, k === "message" ? 3000 : 200) : "";
  });
  return out;
}

function validate_(p) {
  if (!p.name) return "Missing name";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email)) return "Invalid email";
  if (!p.session_type) return "Missing session type";
  if (!isIsoDate_(p.preferred_date)) return "Invalid preferred date";
  if (p.backup_date && !isIsoDate_(p.backup_date)) return "Invalid backup date";
  return "";
}

function isIsoDate_(s) {
  return /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(parseDate_(s).getTime());
}

/** "2026-12-05" -> midnight on that day in the script's time zone. */
function parseDate_(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function isBookingRequest_(ev) {
  return ev.getTitle().indexOf("Booking request:") === 0;
}

function formatDetails_(p) {
  return Object.keys(FIELD_LABELS)
    .filter((k) => p[k])
    .map((k) => FIELD_LABELS[k] + ": " + p[k])
    .join("\n");
}

function formatConflicts_(conflicts) {
  return conflicts.map((c) => {
    if (!c.events.length) return "Your calendar on " + c.iso + " (" + c.label + "): nothing else scheduled.";
    return "Heads up, your calendar on " + c.iso + " (" + c.label + ") already has:\n" +
      c.events.map((ev) => "  - " + ev.getTitle() + (ev.isAllDayEvent() ? " (all day)"
        : " (" + Utilities.formatDate(ev.getStartTime(), Session.getScriptTimeZone(), "h:mm a") + ")")).join("\n");
  }).join("\n\n");
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
