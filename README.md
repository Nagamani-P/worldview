# World View 🌍

A 3D globe for kids (built for age 7). Spin the Earth, tap any of the 195 countries, and learn a few simple things about it. Collect a passport stamp for every country you visit.

## What's inside

- **Globe (default) and flat map.** Countries are coloured by continent. Borders come from Natural Earth's India point-of-view edition, so India matches its official map.
- **Country panel.** Flag, fun fact, capital, people, language, money, size, a famous animal, a yummy food and neighbouring countries. "Read to me" reads it aloud.
- **Search.** Type a country or capital. Press `/` on a keyboard to jump to search.
- **Passport.** Stamp countries and see them grouped by continent.
- **Country callouts.** Hover a country (desktop) to see its name pointing at it. The selected country gets a bigger callout with its flag.
- **Find it! game.** The app names a country, your child taps it. Three levels, 5 countries a round, up to 3 stars each, with hints after a wrong tap.
- **Distance from home.** Pick your home country once. Each country then shows how far it is and about how long the flight takes, with a flight line on the globe and map.
- **Install as an app.** On Vercel, Chrome and Edge show an Install button, and it works offline after the first visit. On iPad or iPhone use Share, then Add to Home Screen.
- **Day and night themes.** Progress, name, home, stars and theme are saved in the browser.

## Put it on GitHub and Vercel (no terminal needed)

1. Unzip this folder.
2. On github.com, click **New repository**, name it `world-view` and create it.
3. On the new repository page, click **uploading an existing file**, then drag in everything from inside the unzipped folder (not the folder itself). Click **Commit changes**.
4. Go to vercel.com and sign in with GitHub.
5. Click **Add New → Project**, pick `world-view` and click **Import**.
6. Vercel detects Vite by itself. Leave the settings as they are and click **Deploy**.

Every time you upload a changed file to GitHub, Vercel updates the site automatically.

## Logo

`public/logo.svg` is the logo (globe with a flight ring and a little plane). The favicon and app icons (`icon-192.png`, `icon-512.png`, `icon-maskable-512.png`, `apple-touch-icon.png`) are made from it. Two other logo ideas are in `design/logo-options/`.

## Run it on your computer (optional)

Needs Node.js 18 or newer.

```bash
npm install
npm run dev            # local preview
npm run build          # production build in dist/
npm run build:single   # one self-contained HTML file in dist-single/
```

## Where things live

```
src/
  App.jsx                 app shell, view switching, confetti
  context/AppContext.jsx  state (useReducer) + saving to localStorage
  components/
    GlobeView.jsx         3D globe (react-globe.gl), callouts, flight arc
    MapView.jsx           flat map (d3-geo), same callouts and flight line
    callout.js, Callout.jsx  the name callout used by both views
    Game.jsx              Find it! game: level picker, question card, results
    HomePicker.jsx        choose your home country
    Logo.jsx              the app logo
    CountryPanel.jsx      country details, side card / bottom sheet
    PlacePanel.jsx        land that isn't one of the 195 (Antarctica, Greenland…)
    PassportModal.jsx     stamps
    WelcomeModal.jsx      first-visit welcome
    Search.jsx, Chrome.jsx, Sheet.jsx, Modal.jsx, Flag.jsx, PhotoTile.jsx
  lib/                    data access, geometry and distance, game rules, number wording, storage
  hooks/                  read-aloud, Wikipedia photos
  data/
    countries.json        195 countries: facts + kid content
    world.geo.json        country borders
    flags.json            SVG flags
```

## Editing country content

Open `src/data/countries.json`. Each country has `animal`, `food`, `hello` and `fact` fields written for young children. Change the text and upload the file to GitHub.

## Data sources

- Borders: [Natural Earth](https://www.naturalearthdata.com/) 1:10m admin-0 countries, India point of view (public domain), simplified with mapshaper.
- Country facts: [world-countries](https://github.com/mledoze/countries) (ODbL).
- Population: [country-json](https://github.com/samayo/country-json) (about 2018, rounded for kids).
- Flags: [country-flag-icons](https://gitlab.com/catamphetamine/country-flag-icons) (MIT).
- Photos: Wikipedia page summaries, loaded live. If a photo can't load, an emoji card is shown.
