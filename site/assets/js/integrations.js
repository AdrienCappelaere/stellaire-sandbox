// ============================================================
// integrations.js — branche GTM et Axeptio sur le site Stellaire
// Édite uniquement ce fichier pour activer le tracking et la CMP.
// ============================================================

// --- BLOC 0: Consent Mode v2 par défaut (denied) -------------
// À activer lors de l'exercice 6 (CMP). Pour l'instant, en commentaire.
//
// window.gtag = window.gtag || function(){ (window.dataLayer = window.dataLayer || []).push(arguments); };
// gtag('consent', 'default', {
//   ad_storage: 'denied',
//   analytics_storage: 'denied',
//   ad_user_data: 'denied',
//   ad_personalization: 'denied',
//   wait_for_update: 500,
// });

// --- BLOC 1: GTM ---------------------------------------------
// 1. Crée ton conteneur GTM (web). Récupère ton ID au format GTM-XXXXXXX.
// 2. Remplace GTM-XXXXXXX ci-dessous par ton ID. Commit. C'est tout.
(function (w, d, s, l, i) {
  if (i === 'GTM-XXXXXXX') return; // tant que pas configuré, on ne charge rien
  w[l] = w[l] || []; w[l].push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
  var f = d.getElementsByTagName(s)[0], j = d.createElement(s), dl = l != 'dataLayer' ? '&l=' + l : '';
  j.async = true; j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
  f.parentNode.insertBefore(j, f);
})(window, document, 'script', 'dataLayer', 'GTM-XXXXXXX');

// --- BLOC 2: Axeptio (CMP) -----------------------------------
// 1. Crée un projet Axeptio (gratuit), récupère ton clientId.
// 2. Remplace YOUR-CLIENT-ID ci-dessous. Configure la version cookie dans Axeptio.
window.axeptioSettings = {
  clientId: "YOUR-CLIENT-ID",
  cookiesVersion: "stellaire-base",
};
(function (d, s) {
  if (window.axeptioSettings.clientId === "YOUR-CLIENT-ID") return;
  var t = d.getElementsByTagName(s)[0], e = d.createElement(s);
  e.async = true; e.src = "//static.axept.io/sdk.js";
  t.parentNode.insertBefore(e, t);
})(document, "script");
