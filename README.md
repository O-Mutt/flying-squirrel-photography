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

Everything in `[square brackets]` and the sample values below are placeholders.

| What | Where |
| --- | --- |
| Photographer's name | `index.html`: "Hi, I'm [Your Name]." |
| Town / service area | `index.html`: "Based in [Your Town], serving [Your Region]" |
| Contact email | `index.html`: replace both `you@example.com` (booking section and footer) |
| Instagram / Facebook links | `index.html`: booking section "Follow along" |
| Session prices, lengths and image counts | `index.html`: the Sessions cards (current prices are examples only) |
| FAQ answers (deposit, turnaround, rain policy) | `index.html`: FAQ section |

### Adding photos

No code changes needed. Just drop image files in with these names:

- `assets/img/about.jpg`: portrait for the About section (portrait orientation, about 1000×1250px)
- `assets/img/gallery/01.jpg` through `09.jpg`: gallery photos (about 1600px on the long edge; 01 and 05 are tall tiles, 04 is a wide tile)

Any photo that's missing shows a soft placeholder tile instead. Update the `alt="..."` text on each gallery image to describe the photo.

## Booking form: getting requests by email

Out of the box, submitting the form opens the visitor's own email app with the request pre-filled and addressed to the contact email. That works, but some visitors won't have an email app set up, so for real use connect a free form service:

1. Create a free account at [formspree.io](https://formspree.io) and create a new form.
2. Copy its endpoint URL (looks like `https://formspree.io/f/abcdwxyz`).
3. Paste it into `FORM_ENDPOINT` at the top of `assets/js/main.js`.

Requests then arrive straight in your inbox and the visitor sees a thank-you message on the page.

## Publishing with GitHub Pages

1. Merge this branch into `main`.
2. In the repo on GitHub, go to **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**, branch `main`, folder `/ (root)`, and save.
4. After a minute the site is live at `https://<github-username>.github.io/flying-squirrel-photography/`. A custom domain can be added on the same settings page.

## Files

```
index.html              the page
assets/css/styles.css   styles (colors come from the logo; see :root at the top)
assets/js/main.js       mobile menu, photo placeholders, booking form
assets/img/             logo, logo mark, social share image, photos
favicon.png, apple-touch-icon.png
```
