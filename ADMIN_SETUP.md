# Admin dashboard — setup

**Getting in:** open the Terminal from the dock and type **`adminunlock`**
(`-adminunlock` works too), or go straight to **`/#/admin`**. The terminal
route is just an unlisted door — the Firebase sign-in below is the actual
lock, and it applies either way.

The dashboard edits a single Firestore document,
`site/content`, which the live site merges over the defaults in
`src/content/defaults.js`.

Three things need doing in the Firebase console for
**`resumenew-c1cb6`** before it works.

---

## 1. Enable email/password sign-in

Console → **Authentication** → *Get started* → **Sign-in method** →
enable **Email/Password**.

Then **Users** → *Add user*, and create the admin account:

- **Email:** `krazykishore2004@gmail.com`
- **Password:** `ck2424`

> ### ⚠ Why `ck2424` and not `ck24`
>
> Firebase rejects any password under **six characters**, so `ck24` cannot
> be an account password — the console refuses to create the user with it.
> It is padded to `ck2424`, which is what `ADMIN_PASSCODE` in
> `src/admin/AdminDashboard.jsx` now holds.
>
> The console password and that constant must match **exactly**. If you
> prefer a different password, set it in the console and change the
> constant to match — or just type it into the login form, which is
> prefilled for convenience, not locked.

There is no public sign-up anywhere in the app — the console is the only
way an account gets created, which is deliberate.

### Troubleshooting sign-in

| Error | What it actually means |
|---|---|
| `auth/configuration-not-found` | **Authentication has never been switched on for this project.** Console → Authentication → *Get started*. This is step 1 above — the Firebase SDK cannot even find an auth config until you click it. |
| `auth/operation-not-allowed` | Auth is on, but the Email/Password provider is still disabled. Sign-in method → enable it. |
| `auth/invalid-credential` | The user does not exist, or the password is wrong. Check Authentication → Users. Remember Firebase never accepted a password under six characters. |
| `auth/unauthorized-domain` | You are on a domain Firebase does not know. Authentication → Settings → Authorised domains. `localhost` is there by default; a deployed site is not. |

The login screen prints the plain-English version of each of these.

## 2. Create the Firestore database

Console → **Firestore Database** → *Create database*. Region is up to you;
pick one near your visitors.

You do **not** need to create the `site/content` document by hand. The
first save from the dashboard creates it. Until then the site runs on its
built-in defaults.

## 3. Publish the security rules

**This is the important one.** In test mode, or with the default rules,
anyone on the internet can rewrite your site's content. Paste this into
Firestore → **Rules** → *Publish*:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Site content: the world reads it, only signed-in admins write it.
    match /site/{docId} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    // Contact form: anyone may submit, nobody may read back over the wire.
    match /contacts/{docId} {
      allow create: if true;
      allow read, update, delete: if false;
    }

    match /comments/{docId} {
      allow read: if true;
      allow create: if true;
      allow update, delete: if false;
    }

    match /responses/{docId} {
      allow create: if true;
      allow read, update, delete: if false;
    }
  }
}
```

`request.auth != null` means *any* account in this project can edit the
site. That is fine while you are the only user. If you ever add others,
tighten it to your own UID:

```
allow write: if request.auth != null && request.auth.uid == 'YOUR_UID_HERE';
```

Your UID is in Authentication → Users.

---

## How the content layer works

```
src/content/defaults.js      every default string + image URL, and SCHEMA
src/content/ContentContext.jsx   loads Firestore, merges, exposes useContent()
src/admin/AdminDashboard.jsx     the editor, rendered from SCHEMA
```

**Defaults are the floor.** If Firestore is empty, offline, blocked by an
ad blocker, or the rules deny reads, the site renders exactly what is in
`defaults.js`. It never renders blanks. That also means the site works
before you have done any of the setup above.

**Overrides merge per key, and arrays merge per index.** Editing one card's
caption does not blank the other five.

**Edits appear live.** The site subscribes with `onSnapshot`, so saving in
the dashboard updates any open tab without a refresh.

### Adding a new editable field

1. Add the default value in `DEFAULT_CONTENT` in `src/content/defaults.js`.
2. Add one line to the matching group in `SCHEMA` in the same file:
   `{ path: 'about.eyebrow', label: 'Eyebrow', type: 'text' }`
   — `type` is `text`, `multiline`, or `image` (which adds a live preview).
3. In the component, replace the hardcoded value with
   `useContent('about.eyebrow', 'the old hardcoded value')`.

The dashboard needs no changes — it is generated from `SCHEMA`.

---

## What is editable today

| Group | Covers |
|---|---|
| Hero × 4 | tab label, background image, warped headline, eyebrow, description, micro caption, button label, both stat values and captions |
| Navigation | island logo image, all four link labels and targets |
| About — text | eyebrow, 3 heading lines, 3 paragraphs, button, hover hint, 3 stats |
| About — card stack | 3 cards: image, caption, alt text |
| About — reveal grid | 6 cards: image, caption, alt text |
| Work / Full Stack header | eyebrow, title, accent word, subtitle |
| Contact | eyebrow, title, accent word, lede, email, 3 facts, submit label, footnote, success message |
| **All images** | **every image URL on the site — 138 of them, auto-discovered** |

### The All images view

The first item in the sidebar. It is not a hand-written list — the
dashboard walks the content tree and shows every value that is an image,
grouped by where it appears:

| Group | Images |
|---|---|
| AI Images — hero strip / 3D gallery | 23 + 15 |
| Skills — pack covers | 13 |
| Personal OS — plates, Finder, feature, grid | 11 + 6 + 1 + 8 |
| Syndicate — members | 10 |
| About Me — gallery | 9 |
| Work grid — card backgrounds | 9 |
| Music — album art | 8 |
| Dock — app icons | 8 |
| Showcase banners | 3 |
| Elsewhere (hero plates, About cards, logo) | 14 |

Add a URL anywhere in `DEFAULT_CONTENT` and it appears here by itself —
no `SCHEMA` entry needed. A value counts as an image when it is a string
under an image-ish key (`src`, `img`, `icon`, `thumb`, `art`, `front`,
`back`, `logo`…) or sits inside the `images` bucket, so link hrefs like
`#work` are never mistaken for pictures.

**Why the registry stores bare strings.** The arrays these URLs came from
also hold React components, icon refs and click handlers, none of which
survive a trip through Firestore. Components keep their own data and
overlay the URL by index, so a stored list can only ever change pictures
— it can never break a handler.

**Images are complete** — every one on the site is editable. **Text is
not yet:** the copy in Team/Syndicate, Banner, Notes, Widgets and the six
sub-pages is still hardcoded. Each follows the three-step recipe above.

## Terminal commands

The dock Terminal takes input now. `help` lists everything; the useful ones:

| Command | Does |
|---|---|
| `adminunlock` | opens this dashboard |
| `open <id>` | jumps to a sub-page — `about`, `video`, `room`, `ai`, `web`, `skills` |
| `clear` | wipes the scrollback |
| `help`, `whoami`, `ls` | the rest |
