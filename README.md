# Flying Squirrels Photography

Marketing and booking-request website for Flying Squirrels Photography: *capturing the joy of everyday life*.

It's a single static page (plain HTML, CSS and JavaScript, no build step), so it can be hosted for free on GitHub Pages, Netlify, Cloudflare Pages, or any web host.

## What's on the site

- **Hero** with the logo and "Request a session" call to action
- **About** the photographer, with a portrait
- **Sessions & pricing**: Family, Newborn & Maternity, Kids & Milestones, Couples & Engagement, Seniors & Graduates, Mini Sessions
- **Gallery** grid
- **How it works**: request, plan, shoot, gallery
- **Booking request form** with validation and a spam trap
- **FAQ** and footer with contact and social links

## Preview locally

```sh
python3 -m http.server 8000
# then open http://localhost:8000
```

## Before going live: fill in the details

Check these before launch. Everything except the email still has sample values.

| What | Where |
| --- | --- |
| Contact email (currently `kerry@flyingsquirrels.photography`) | `index.html`: the two `contact-email` links (booking section and footer); the form uses the same address |
| Instagram / Facebook links | `index.html`: booking section "Follow along" |
| Session prices, lengths and image counts | `index.html`: the Sessions cards (current prices are examples only) |
| FAQ answers (deposit, turnaround, rain policy) | `index.html`: FAQ section |

### Adding photos

No code changes needed. Just drop image files in with these names:

- `assets/img/about.jpg`: portrait for the About section (portrait orientation, about 1000×1250px)
- `assets/img/gallery/01.jpg` through `09.jpg`: gallery photos (about 1600px on the long edge; 01 and 05 are tall tiles, 04 is a wide tile)

Any photo that's missing shows a soft placeholder tile instead. Update the `alt="..."` text on each gallery image to describe the photo.

## Booking form: connecting it to Google Calendar

Out of the box, submitting the form opens the visitor's own email app with the request pre-filled and addressed to the contact email. That works, but some visitors won't have an email app set up, so for real use connect it to Google. It's free and runs entirely in your own Google account.

**What you get:** each request adds a yellow **"Booking request"** hold to your Google Calendar on the client's preferred date (and backup date). The hold shows as *free*, so it won't block other bookings. You also get an email with all the details, plus a heads-up listing anything already on your calendar those days. Hit Reply to answer the client directly. Once you've confirmed or declined, delete the hold or turn it into the real session.

**One-time setup (about 10 minutes):**

1. Signed in to the Google account whose calendar you use, go to [script.google.com](https://script.google.com) and click **New project**. Name it "Booking requests".
2. Delete the sample code, then paste in everything from [`google-apps-script/Code.gs`](google-apps-script/Code.gs).
3. Optional: change the settings in `CONFIG` at the top of the code:
   - `CALENDAR_ID`: leave as `"primary"` for your main calendar, or create a separate calendar such as "Photo bookings" and paste its Calendar ID (found in that calendar's Google Calendar settings).
   - `NOTIFY_EMAIL`: where request emails go. Leave blank to use the account's own address.
   - `SEND_CLIENT_CONFIRMATION`: set to `true` to automatically email clients a "got your request" note from your account.
4. Click **Save**, choose `setup` in the function dropdown, and click **Run**. Google will ask you to allow access to your calendar and email. Approve it. (If you see "Google hasn't verified this app", that's normal for your own script: click **Advanced → Go to Booking requests**.)
5. Click **Deploy → New deployment**, click the gear icon and choose **Web app**, then set:
   - **Execute as:** Me
   - **Who has access:** Anyone

   Click **Deploy** and copy the **Web app URL** (it ends in `/exec`).
6. Paste that URL into `FORM_ENDPOINT` at the top of `assets/js/main.js`.

Send a test request from the live site to make sure it works. If you change the script later, use **Deploy → Manage deployments → Edit → Version: New version** so the same URL picks up your changes.

**Prefer not to use Google?** `FORM_ENDPOINT` also accepts a [Formspree](https://formspree.io) form URL (email only, no calendar holds).

### Optional: let clients pick an open time on your calendar

Google Calendar can also publish a booking page (Google calls these *appointment schedules*) where clients choose from the times you've marked available, and the session lands on your calendar automatically.

1. In Google Calendar, click **Create → Appointment schedule** and set your session length, available hours, and buffer time.
2. Open the schedule, click **Share**, and copy the booking page link.
3. Paste it into `GOOGLE_BOOKING_URL` at the top of `assets/js/main.js`.

A **"Pick an open time"** button then appears beside the booking form. The request form stays available for clients who want to talk things through first.

## Publishing with GitHub Pages

1. Merge this branch into `main`.
2. In the repo on GitHub, go to **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**, branch `main`, folder `/ (root)`, and save.
4. After a minute the site is live at `https://<github-username>.github.io/flying-squirrel-photography/`. A custom domain can be added on the same settings page.

## Files

```
index.html              the page
assets/css/styles.css   styles (colors come from the logo; see :root at the top)
assets/js/main.js       mobile menu, photo placeholders, booking form (config at the top)
google-apps-script/     Google Calendar booking handler (paste into script.google.com)
assets/img/             logo, logo mark, social share image, photos
favicon.png, apple-touch-icon.png
```
