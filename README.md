# WomenSafetyPathAI


## PathAware: Firebase + Google Maps setup

This version includes:
- Firebase Firestore report submission with local offline fallback.
- Google Maps JavaScript API as the primary map, with OpenStreetMap/Leaflet fallback when no Google Maps key is configured.
- Working emergency-contact call buttons using the browser/device `tel:` handler.
- Working email buttons for contacts that have an email address.

### 1. Install dependencies

```bash
npm install
```

The project now includes the `firebase` package. If dependencies were installed before this update, run `npm install` again.

### 2. Configure environment variables

Copy `.env.example` to `.env`.

For Firebase:
1. Create/open a Firebase project.
2. Add a Web App in Project settings.
3. Copy its Web App configuration into the six `VITE_FIREBASE_*` variables.
4. Create a Firestore Database.
5. Submit the first report from PathAware to create the `safetyReports` collection automatically.

For Google Maps:
1. Open Google Cloud Console.
2. Enable **Maps JavaScript API**.
3. Create an API key.
4. Restrict the key to your development/deployed domain.
5. Put the key in `VITE_GOOGLE_MAPS_API_KEY`.

Restart the dev server after changing `.env`.

### 3. Firestore security

This demo uses client-side Firestore access. Before production deployment, use Firebase Authentication and restrictive Firestore security rules. Do not leave unrestricted public writes enabled for a real safety service.

### 4. Run

```bash
npm run dev
```

Then open the local URL printed by the server.

### What to test

1. Open **Map**.
2. With a valid Google Maps key, the map label shows **Google Maps**.
3. Use the location button, enter a destination, choose a suggestion, and click **Find routes**.
4. Click **Report**, allow location access, choose an issue, and submit it. The report is saved locally immediately and synced to Firestore when Firebase is configured.
5. Open **Emergency Contacts** and click the green phone button. On a phone it opens the phone dialer.
6. Add/delete contacts and verify the existing contact management flow.

### Browser limitation

A web app cannot silently place a phone call or send an SMS. The contact buttons therefore use `tel:` and `mailto:` so the device/browser can hand the action to the appropriate native application.
