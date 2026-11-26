/* =========================================================
   LASTRA PROJEKT – Firebase web config (shared by the public site and /lastra-admin/)
   ---------------------------------------------------------
   Paste the values from Firebase console → Project settings → General → Your apps → Web app.
   These values are PUBLIC identifiers, not secrets: Google designs the web config to ship
   in the browser. Security comes from firestore.rules + storage.rules (only the admin email
   can write). Leave projectId empty and the site simply keeps using js/config.js.
   See SETUP-FIREBASE.md.
   ========================================================= */
window.LP_FIREBASE = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: ""
};
