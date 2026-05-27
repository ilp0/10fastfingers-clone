# 10FastFingers — standalone offline replica

Standalone HTML/CSS/JS replica of the 10fastfingers.com typing test as it appeared at
[web.archive.org/web/20250219160745/https://10fastfingers.com/typing-test/finnish](https://web.archive.org/web/20250219160745/https://10fastfingers.com/typing-test/finnish).

Reverse engineered from the wayback snapshot.

## How to host

Drop the whole directory on any static webserver. There is no backend; everything is HTML/CSS/JS.

```bash
# Quick local preview:
python -m http.server 8765
# then open http://localhost:8765/
```

## What's the same as the original

- Visual layout, fonts, colours, sidebar, footer, language dropdown — all from the original CSS
  (`css/style.css`) and Bootstrap 3.
- Gameplay engine (`js/speedtest.js`) preserves the original logic 1:1: 60-second timer,
  space-to-advance, correct=green / wrong=red / current=grey highlights, line-jump scroll,
  backspace-counter, AFK detection.
- Language selector with the full set of 53 languages and their native names.
- Reload button restarts the test; F5 also reloads via the engine (matches original).

## What's different

- **Word lists**: the original loads words via `POST /speedtests/get_words`, which was never
  captured by the Wayback Machine. The lists in `js/words.js` are frequency-ranked words per
  language, generated from the [hermitdave/FrequencyWords](https://github.com/hermitdave/FrequencyWords)
  corpus (CC BY-SA 4.0). Two pools per language are bundled:
  `WORDS` (top-200, used by the regular typing test) and
  `WORDS_1000` (top-1000, used by the Advanced typing test).
  44 languages are covered; the other 9 (Esperanto, Filipino, Galician, Malagasy, Pashto, Urdu,
  plus a few less-resourced ones) fall back to English with a notice.
- **Result screen**: the original called `POST /speedtests/auswertung` on the server. The
  standalone build computes the same numbers locally (WPM = correct chars / 5 scaled to 60s, plus
  CPM, accuracy %, keystroke counts). Labels are in Finnish to match the page locale.
- **Removed**: third-party trackers (Google Analytics, Matomo, freestar ads, Cookiebot), the
  recent-activity sidebar feed (relied on external Facebook/Gravatar avatars), and login/signup
  flows. All dead links route to `#`.

## Switching languages and modes

Click the green "Finnish ▾" button to expand the in-page language list, or use the top navbar
"Language: ▾" dropdown. The URL hash routes language and mode changes:

- `#lang=fin` — switch to Finnish (also accepts slugs like `#lang=swedish`).
- `#mode=advanced` — switch to the "Kirjoitustesti (edistynyt)" / Top-1000 pool.
- `#lang=fin&mode=advanced` — combine.

The sidebar links for "Kirjoitustesti" and "Kirjoitustesti (edistynyt)" route the same way.

## File layout

```
index.html             - the page
css/style.css          - original 10fastfingers stylesheet (paths normalized)
js/speedtest.js        - adapted typing engine (local word source + local result)
js/globalfunctions.js  - original helpers, network calls stubbed
js/words.js            - generated language pools
js/app.js              - hash-routed language switcher
vendor/                - Bootstrap 3, jQuery 1.10.2, Font Awesome 4.7
img/                   - sprites and decorative assets pulled from the wayback snapshot
build_html.py          - regenerates index.html from page.html
build_words.py         - regenerates js/words.js from the FrequencyWords corpus
```

## Credits

- Original site & design © Christian Buchholz / 10fastfingers.com.
- Word-frequency data: hermitdave/FrequencyWords (CC BY-SA 4.0).
- Bootstrap 3 (MIT), jQuery (MIT), Font Awesome 4.7 (SIL OFL).
