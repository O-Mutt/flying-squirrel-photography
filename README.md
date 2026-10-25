# Flying Squirrels Photography

Marketing and booking-request website for Flying Squirrels Photography: *capturing the joy of everyday life*.

It's a small static site (plain HTML, CSS and JavaScript, no build step), hosted free on GitHub Pages at [flyingsquirrels.photography](https://flyingsquirrels.photography).

## What's on the site

**Home page (`index.html`)**

- **Hero** with the logo, or a photo once `assets/img/hero.jpg` exists
- **About** Kerry, with a portrait
- **Sessions**: the $150 introductory rate, plus Family Portraits, Fall Family Photos, Graduation & Senior Pictures, Newborn & Maternity, Kids & Milestones, Couples & Engagement
- **Gallery** grid; click a photo to view it larger
- **Latest on Instagram** with a follow button, ready for a live feed widget
- **How it works**, **booking** (Booksy button plus a request form for questions), **FAQ**

**Service pages**, each written to rank for its own searches:

| Page | Aimed at searches like |
| --- | --- |
| `/family-portraits/` | family portraits St. Paul, family photographer Twin Cities |
| `/fall-family-photos/` | fall family photos Minnesota, fall photo shoot St. Paul |
| `/graduation-pictures/` | graduation pictures St. Paul, senior pictures Twin Cities |

Plus `404.html` (shown for broken links), `sitemap.xml` and `robots.txt` for search engines, and `_config.yml`, which keeps the README and Google script off the public site.

The header and footer are repeated in each page, so a change to the menu, email, Booksy link or Instagram link needs making in all five HTML files (`index.html`, `404.html` and the three `*/index.html` pages).

## Preview locally

```sh
python3 -m http.server 8000
# then open http://localhost:8000
```

## Before going live: fill in the details

Where to change the details. The FAQ answers are still sample values.

| What | Where |
| --- | --- |
| Contact email (currently `kerry@flyingsquirrels.photography`) | The `contact-email` links (home page booking section, and every page footer); the form uses the same address |
| Booksy booking link (currently `https://lhkw.app.link/vhiOqlvmt7b`) | Every "Book online with Booksy" and intro-rate button, on the home page and the three service pages |
| Instagram (currently `@flyingsquirrelsphotoco`) | Home page Instagram section and booking section, every page footer, and the `sameAs` line in the home page's structured data |
| Pricing (currently the $150 introductory rate: 1-hour session, 10 high-res edited photos) | The "Introductory rate" panels on each page, and the `price` values in each page's structured data (the `<script type="application/ld+json">` block near the top) |
| FAQ answers (deposit, turnaround, rain policy) | FAQ sections on the home page and service pages |
| Communities served (currently St. Paul, Minneapolis, Roseville, Maplewood, Woodbury, Cottage Grove, Lake Elmo, Afton, Eagan, Edina) | Home page About section and the "Where to…" section of each service page, plus `areaServed` in each page's structured data |
| Location suggestions (Como Park, Hidden Falls, Mississippi River bluffs, Summit Avenue, downtown St. Paul) | Home page FAQ and the service pages |

### Adding photos

No code changes needed. Just drop image files in with these names (JPEG, about 1600px on the long edge):

- `assets/img/hero.jpg`: the big photo at the top of the home page (portrait orientation). It replaces the large logo automatically.
- `assets/img/about.jpg`: Kerry's portrait for the About section (portrait orientation)
- `assets/img/gallery/01.jpg` through `09.jpg`: home page gallery (01 and 05 are tall tiles, 04 is a wide tile)
- `assets/img/family-portraits/01.jpg` to `03.jpg`, `assets/img/fall-family-photos/01.jpg` to `03.jpg`, `assets/img/graduation-pictures/01.jpg` to `03.jpg`: photo strips on the service pages

Any photo that's missing shows a soft placeholder tile instead. **Update each photo's `alt="..."` text** to describe it, mentioning the place where it fits naturally (for example `alt="Family of four laughing in fall leaves at Como Park, St. Paul"`). Search engines read alt text, so it helps people find the site through Google Images.

## Getting found on Google

The site already has the technical side covered: keyword-focused page titles and descriptions, one service page per main search, structured data describing the business and its services, a sitemap, and link-preview tags. What moves the needle from here happens off the site:

1. **Google Business Profile** (free, [business.google.com](https://business.google.com)): the single biggest factor for "photographer near me" and Google Maps results. Set it up as a service-area business covering St. Paul and the Twin Cities (no street address shown), add the website, photos and the Booksy link, and ask happy clients for Google reviews.
2. **Google Search Console** (free, [search.google.com/search-console](https://search.google.com/search-console)): add `flyingsquirrels.photography`, verify it, and submit `https://flyingsquirrels.photography/sitemap.xml`. It shows which searches find the site.
3. **Real photos with descriptive alt text**, as above.
4. **Links from elsewhere**: put the website link in the Instagram bio, Booksy profile and any local directories or school/community groups.
5. **Keep it fresh**: update the photos each season, especially the fall page before September.

## Request form: connecting it to Google Calendar

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

## Instagram feed

The "Latest on Instagram" section shows a **Follow @flyingsquirrelsphotoco** button. To also show her latest posts and reels, which update automatically, connect a feed widget service:

1. Make sure the Instagram account is a **Professional** account (Business or Creator). It's free to switch in Instagram under *Settings → Account type and tools*. Feed tools can't read personal accounts.
2. Sign up for a feed widget service such as [Behold](https://behold.so), [LightWidget](https://lightwidget.com) or [SnapWidget](https://snapwidget.com), and connect the Instagram account when it asks. Kerry logs in to Instagram herself, so nobody else needs her password.
3. Style the feed (a grid of 6 to 8 recent posts suits this section), then copy the **embed code** it gives you.
4. Paste the embed code inside `<div class="ig-feed">` in `index.html`, replacing the comment there.

## Publishing with GitHub Pages

The site publishes from the `main` branch (**Settings → Pages**: Deploy from a branch, `main`, `/ (root)`), on the custom domain in the `CNAME` file. Make sure **Enforce HTTPS** is ticked on that settings page.

## Files

```
index.html                     home page
family-portraits/index.html    service pages
fall-family-photos/index.html
graduation-pictures/index.html
404.html                       "page not found" page
sitemap.xml, robots.txt        for search engines
assets/css/styles.css          styles (colors come from the logo; see :root at the top)
assets/js/main.js              menu, photo placeholders, gallery viewer, request form (config at the top)
assets/img/                    logo, logo mark, social share image, photos
google-apps-script/            Google Calendar handler for the request form (paste into script.google.com)
_config.yml                    keeps README and google-apps-script off the public site
CNAME                          custom domain for GitHub Pages
favicon.png, apple-touch-icon.png
```
