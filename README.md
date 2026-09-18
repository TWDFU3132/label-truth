# Label Truth

A phone web app for you and your friends. Scan a food barcode or snap the ingredient list, and it shows:

- **What the big words mean** in plain English: what it's made from, why it's in there, and a heads-up when there's a catch (bugs, animal parts, hidden MSG, sugar under another name, petroleum dyes, things banned elsewhere). 143 terms, about 600 label spellings.
- **What the FDA allows in it**: bug pieces, rodent hairs, mold, fly eggs and maggots from the FDA Food Defect Levels Handbook. When it knows the serving size, it works out the number for one serving (for example, peanut butter: up to about 9.6 bug fragments in a 32 g serving before the FDA steps in).
- **The "human DNA" question**, answered accurately. There's a card in the app about it.

It costs $0 to run. It needs no API key (USDA key optional) and has no ads and no accounts.

## Put it online (free, about 5 minutes) with GitHub Pages

1. Make a free account at github.com (skip this if you have one).
2. Click **+ → New repository**. Name it `label-truth`, set it to **Public**, and click **Create repository**.
3. On the next page click **uploading an existing file**. Drag in **everything inside** this folder (`index.html`, `app.js`, `data`, `vendor`, the icons, and the rest), then click **Commit changes**.
4. Go to **Settings → Pages**. Under *Branch*, pick `main` and `/ (root)`, then click **Save**.
5. Wait about a minute. Your link is `https://YOUR-USERNAME.github.io/label-truth/`. Send that link to your friends.

On a phone, open the link, then choose **Share → Add to Home Screen** (iPhone) or **⋮ → Add to Home screen** (Android). After that it opens like a normal app.

The camera needs an `https://` link. Opening `index.html` straight from your computer works for typing or pasting, but not for live scanning.

## How it finds products

1. **Open Food Facts**: free, no key, and has millions of products.
2. **USDA FoodData Central** is the backup. It uses the shared demo key (about 30 lookups/hour per phone). For more, get a free key at https://fdc.nal.usda.gov/api-key-signup and paste it in **Settings** in the app.
3. If neither has it, tap **Photo of ingredients**. The app reads the label text right on the phone; nothing is uploaded.

## Files

| File | What it is |
|---|---|
| `index.html` | The page and all styling |
| `app.js` | Scanning, lookups, decoding, results |
| `data/glossary.js` | The plain-English dictionary. Add words here. |
| `data/defects.js` | FDA defect levels, transcribed from fda.gov on 2026-09-18 |
| `vendor/` | Barcode reader (html5-qrcode) and label text reader (Tesseract.js), stored locally so the app doesn't depend on outside servers |
| `sw.js`, `manifest.webmanifest`, icons | Lets it install to the home screen |

To add a word, copy any line in `data/glossary.js`, change it, and upload the file again.

## Android app later

The same folder can be wrapped into an installable APK with Capacitor (`npx cap init`, `npx cap add android`, copy this folder into `www/`, `npx cap build android`). Your Windows Android toolchain setup handles the build side.

## Accuracy notes

- FDA defect levels are the **maximum before FDA takes action**, not what's in a given package. Most food has far less.
- The FDA has **no allowed level for human hair or human DNA**. Neither is on its list.
- Product data is crowd-sourced (Open Food Facts) or company-submitted (USDA). Recipes change, so the package in your hand wins.
- This is a guide, not medical or allergy advice.
