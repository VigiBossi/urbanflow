# Lastra Projekt – Admin panel setup (Firebase)

The admin panel lives at **`https://YOUR-SITE/lastra-admin/`**. It edits projects, photos, the architect profile,
contact details, estimator settings and 3D model links. Until Firebase is connected, the website keeps using
`js/config.js` exactly as before – nothing breaks.

Firebase's free **Spark** plan is enough for this site. Since late 2024, new Cloud Storage buckets need the
**Blaze** (pay-as-you-go) plan to be created, but a site this size stays inside the free monthly allowance.

---

## 1 · Create the Firebase project and paste the web config

1. Go to <https://console.firebase.google.com> → **Add project** (e.g. `lastra-projekt`). Google Analytics is not needed.
2. **Project settings** (gear icon) → **General** → *Your apps* → **Web** (`</>`) → register an app (no hosting).
3. Copy the `firebaseConfig` values into **`js/firebase-config.js`**:

```js
window.LP_FIREBASE = {
  apiKey: "AIza...",
  authDomain: "lastra-projekt.firebaseapp.com",
  projectId: "lastra-projekt",
  storageBucket: "lastra-projekt.firebasestorage.app",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abc123"
};
```

These values are **public identifiers, not secrets**. Google designs them to ship in the browser. Security comes
from the rules in step 4: only your admin email can change anything.

## 2 · Turn on Email/Password sign-in and create the admin user

1. **Build → Authentication → Get started → Sign-in method → Email/Password → Enable** (leave "Email link" off).
2. **Users → Add user**. Enter your admin email and a strong password (12+ characters, used nowhere else).
3. Optional but recommended: in **Settings → User actions**, turn off **Enable create (sign-up)**, so nobody else can register.

## 3 · Create Firestore and Storage

1. **Build → Firestore Database → Create database**. Choose **production mode** and the location `eur3 (europe-west)`.
2. **Build → Storage → Get started**. Choose **production mode** and the same region.

## 4 · Put your admin email into the rules and publish them

Open **`firestore.rules`** and **`storage.rules`** and replace `ADMIN_EMAIL_HERE` with your admin email, exactly as it
appears under Authentication → Users:

```
return request.auth != null && request.auth.token.email == "you@yourdomain.com";
```

Then publish both, either way:

- **Console:** paste `firestore.rules` into *Firestore → Rules* → **Publish**, and `storage.rules` into *Storage → Rules* → **Publish**.
- **CLI:** from the `lastra-projekt` folder:

```bash
npm install -g firebase-tools
```

```bash
firebase login
```

```bash
firebase deploy --only firestore:rules,storage --project YOUR_PROJECT_ID
```

`firebase.json` already points at both rule files. They are kept off the public website by `.vercelignore`.

## 5 · Sign in, import, publish

1. Deploy the site (Vercel: upload the `lastra-projekt` folder as before) and open **`/lastra-admin/`**.
2. Sign in with the admin email and password.
3. The first time, click **"Import website data"**. This copies the current projects, architect and contact details
   from `js/config.js` into Firestore.
4. Edit anything and press **Save changes**. The public site picks up the new content on the next page load.

---

### How the public site loads content

- `js/live.js` reads **only** `site/settings` and the **published** projects through the Firestore REST API.
  It doesn't use the Firebase SDK and adds only a few KB to the public pages.
- The last good copy is cached in the visitor's browser, so pages render instantly. Fresh data is fetched in the
  background.
- If Firebase is unreachable, misconfigured or empty, the site silently uses the cached copy or `js/config.js`.
- Photos uploaded in the panel are resized in the browser (1600 px + 800 px, WebP; JPEG on older Safari) before
  upload, so the site stays fast.

### Backups

**3D models & backup → Download config.js backup** exports everything as a ready-to-use `js/config.js`. Replace
`js/config.js` with it to run the site from that data without Firebase. Do this after big edits.

### Security checklist

- Never paste passwords or service-account keys into any file in this project. The panel only needs the public web config.
- Keep sign-up disabled (step 2.3) and use a unique admin password.
- The admin folder is `noindex`, blocked in `robots.txt`, excluded from `sitemap.xml` and sent with `X-Robots-Tag: noindex`.
- `vercel.json` sends a Content-Security-Policy that only allows Firebase's own API hosts.
