// site/assets/js/data.js
window.STELLAIRE_PRODUCTS = [
  {
    id: "tel-001", slug: "telescope-debutant-70", category: "telescopes",
    name: "Télescope débutant 70/700",
    price: 149.00,
    image: "https://images-assets.nasa.gov/image/PIA17563/PIA17563~thumb.jpg",
    shortDesc: "Idéal pour découvrir le ciel.",
    longDesc: "Télescope réfracteur 70mm d'ouverture, focale 700mm. Monture azimutale légère, oculaires 10mm et 25mm fournis. Parfait pour observer la Lune, les planètes brillantes et les étoiles doubles.",
    brand: "Stellaire", sku: "STE-TEL-001"
  },
  {
    id: "tel-002", slug: "dobson-200mm", category: "telescopes",
    name: "Dobson 200mm",
    price: 549.00,
    image: "https://images-assets.nasa.gov/image/PIA22946/PIA22946~thumb.jpg",
    shortDesc: "Le rapport qualité/prix incontournable.",
    longDesc: "Télescope Newton 200mm sur monture Dobson. Très lumineux, permet l'observation détaillée des objets du ciel profond (galaxies, amas, nébuleuses). Livré avec deux oculaires Plossl.",
    brand: "Stellaire", sku: "STE-TEL-002"
  },
  {
    id: "tel-003", slug: "lunette-astro-90", category: "telescopes",
    name: "Lunette astronomique 90/900",
    price: 799.00,
    image: "https://images-assets.nasa.gov/image/PIA21472/PIA21472~thumb.jpg",
    shortDesc: "Optique apochromatique haut de gamme.",
    longDesc: "Lunette ED 90mm apochromatique. Image piquée sans aberration chromatique. Monture équatoriale motorisée incluse.",
    brand: "Stellaire", sku: "STE-TEL-003"
  },
  {
    id: "obs-001", slug: "jumelles-10x50", category: "observation",
    name: "Jumelles 10x50 astronomie",
    price: 89.00,
    image: "https://images-assets.nasa.gov/image/PIA12348/PIA12348~thumb.jpg",
    shortDesc: "Prises en main, idéales constellations.",
    longDesc: "Jumelles 10x50 traitées multicouches. Grand champ, parfaites pour les amas ouverts et la Voie lactée.",
    brand: "Stellaire", sku: "STE-OBS-001"
  },
  {
    id: "obs-002", slug: "oculaire-plossl-10", category: "observation",
    name: "Oculaire Plossl 10mm",
    price: 39.00,
    image: "https://images-assets.nasa.gov/image/PIA22228/PIA22228~thumb.jpg",
    shortDesc: "Oculaire de qualité pour fort grossissement.",
    longDesc: "Oculaire Plossl 10mm coulant 31.75mm. Traité multicouches.",
    brand: "Stellaire", sku: "STE-OBS-002"
  },
  {
    id: "obs-003", slug: "filtre-lunaire", category: "observation",
    name: "Filtre lunaire ND",
    price: 24.00,
    image: "https://images-assets.nasa.gov/image/PIA00302/PIA00302~thumb.jpg",
    shortDesc: "Réduit l'éblouissement lunaire.",
    longDesc: "Filtre densité neutre ND-13%. Indispensable pour l'observation lunaire en pleine phase.",
    brand: "Stellaire", sku: "STE-OBS-003"
  },
  {
    id: "obs-004", slug: "cherche-etoile", category: "observation",
    name: "Chercheur point rouge",
    price: 32.00,
    image: "https://images-assets.nasa.gov/image/PIA17046/PIA17046~thumb.jpg",
    shortDesc: "Pointer rapidement vos cibles.",
    longDesc: "Chercheur à point rouge avec réglage d'intensité. Fixation queue d'aronde standard.",
    brand: "Stellaire", sku: "STE-OBS-004"
  },
  {
    id: "liv-001", slug: "atlas-du-ciel", category: "livres",
    name: "Atlas du ciel nocturne",
    price: 34.90,
    image: "https://images-assets.nasa.gov/image/PIA00154/PIA00154~thumb.jpg",
    shortDesc: "L'ouvrage de référence en français.",
    longDesc: "Atlas complet en français, 88 constellations, cartes saisonnières, index Messier et NGC. 320 pages.",
    brand: "Stellaire", sku: "STE-LIV-001"
  },
  {
    id: "liv-002", slug: "guide-objets-messier", category: "livres",
    name: "Guide des objets Messier",
    price: 22.50,
    image: "https://images-assets.nasa.gov/image/PIA01970/PIA01970~thumb.jpg",
    shortDesc: "110 objets, fiches détaillées.",
    longDesc: "Pour chaque objet du catalogue Messier : description, conseils d'observation, croquis. Format poche.",
    brand: "Stellaire", sku: "STE-LIV-002"
  },
  {
    id: "liv-003", slug: "carte-tournante", category: "livres",
    name: "Carte tournante du ciel",
    price: 15.00,
    image: "https://images-assets.nasa.gov/image/PIA11800/PIA11800~thumb.jpg",
    shortDesc: "Repérez les constellations en un clin d'œil.",
    longDesc: "Carte tournante en plastique souple. Latitude 45° N (France métropolitaine).",
    brand: "Stellaire", sku: "STE-LIV-003"
  },
  {
    id: "dec-001", slug: "poster-voie-lactee", category: "deco",
    name: "Poster Voie Lactée NASA",
    price: 19.00,
    image: "https://images-assets.nasa.gov/image/PIA23645/PIA23645~thumb.jpg",
    shortDesc: "Tirage qualité galerie 50x70cm.",
    longDesc: "Tirage photographique haute définition issu des archives NASA. Papier mat 250g, format 50x70cm.",
    brand: "Stellaire", sku: "STE-DEC-001"
  },
  {
    id: "dec-002", slug: "mug-constellations", category: "deco",
    name: "Mug Constellations",
    price: 14.50,
    image: "https://images-assets.nasa.gov/image/PIA24033/PIA24033~thumb.jpg",
    shortDesc: "88 constellations en céramique.",
    longDesc: "Mug céramique 350ml imprimé des 88 constellations. Compatible lave-vaisselle.",
    brand: "Stellaire", sku: "STE-DEC-002"
  }
];

window.STELLAIRE_CATEGORIES = [
  { id: "telescopes", label: "Télescopes" },
  { id: "observation", label: "Observation" },
  { id: "livres",      label: "Livres & cartes" },
  { id: "deco",        label: "Posters & déco" },
];

window.stellaire = window.stellaire || {};
window.stellaire.findProduct = function (slug) {
  return window.STELLAIRE_PRODUCTS.find(p => p.slug === slug);
};
window.stellaire.findProductById = function (id) {
  return window.STELLAIRE_PRODUCTS.find(p => p.id === id);
};
