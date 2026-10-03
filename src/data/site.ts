// Every fact on the site comes from this file. Do not add claims that are not in the brief.

export const company = {
  brand: "Oranthai",
  legalName: "Words Worth Book House & Stationeries Pvt. Ltd",
  phones: ["7010318147", "8870991386"],
  email: "wordsworthbh@gmail.com",
  gst: "33AACCO6243Q1Z3",
  office: {
    label: "Chennai office",
    lines: ["No. 57/23, Thiruvallurpuram, 2nd Street,", "Choolaimedu, Chennai 600094"],
    street: "No. 57/23, Thiruvallurpuram, 2nd Street, Choolaimedu",
    locality: "Chennai",
    postalCode: "600094",
  },
};

export const taglines = {
  stores: "Chennai to Thanjavur, always a chapter away",
  custom: "Made to order, your name, your style",
  trusted: "Trusted partner, every order a good story",
  brands: "Direct from brands, the lowest prices",
};

export const kural = {
  number: 391,
  tamil: ["கற்க கசடறக் கற்பவை", "கற்றபின் நிற்க அதற்குத் தக"],
  english: "Learn thoroughly what is worth learning, then live by what you learn.",
};

export type Branch = {
  id: string;
  name: string;
  region: string;
  landmark: string;
  icon: string;
  headOffice?: boolean;
  placeholderLandmark?: boolean;
  // Stylised map position, in degrees. Chennai pins are nudged apart so both stay readable.
  lat: number;
  lon: number;
};

export const branches: Branch[] = [
  {
    id: "mogappair",
    name: "Mogappair",
    region: "Chennai",
    landmark: "Lakeside neighbourhood",
    icon: "/img/icons/landmark-mogappair.svg",
    placeholderLandmark: true,
    lat: 13.32,
    lon: 79.86,
  },
  {
    id: "nungambakkam",
    name: "Nungambakkam",
    region: "Chennai",
    landmark: "Valluvar Kottam",
    icon: "/img/icons/landmark-nungambakkam.svg",
    lat: 12.9,
    lon: 80.2,
  },
  {
    id: "thanjavur",
    name: "Thanjavur",
    region: "Thanjavur district",
    landmark: "Brihadeeswarar Temple",
    icon: "/img/icons/landmark-thanjavur.svg",
    headOffice: true,
    lat: 10.87,
    lon: 79.06,
  },
  {
    id: "orathanadu",
    name: "Orathanadu",
    region: "Thanjavur district",
    landmark: "Mukthambal Chathiram",
    icon: "/img/icons/landmark-orathanadu.svg",
    lat: 10.5,
    lon: 79.3,
  },
];

export type Item = { id: string; name: string; note: string; alt: string };

export const products: Item[] = [
  { id: "books", name: "Books", note: "Tamil Nadu State Board textbooks, NCERT, guides, novels", alt: "A spread of novels and textbooks" },
  { id: "stationery-art", name: "Stationery & art", note: "Pens, paints, brushes, sketchbooks", alt: "Pencils, paints and a sketchbook on a desk" },
  { id: "decorations", name: "Decorations", note: "Balloons, banners, festival decor", alt: "Colourful hanging festival decorations" },
  { id: "gifts-party", name: "Gifts & party", note: "Gift sets, wrapping, party supplies", alt: "Wrapped gift boxes with ribbons" },
  { id: "chocolates", name: "Chocolates", note: "Assorted chocolates, gift boxes", alt: "A pile of assorted chocolate bars" },
  { id: "electronics", name: "Electronics", note: "Watches, calculators, lamps", alt: "A calculator, a watch and earphones" },
  { id: "organic", name: "Organic products", note: "Natural, eco-friendly essentials", alt: "Natural soaps, herbs and oils" },
];

export const customItems: Item[] = [
  { id: "year-diaries", name: "Year diaries", note: "With your name or logo", alt: "A 2026 year diary" },
  { id: "pens", name: "Pens", note: "For events and gifting", alt: "Three fountain pens" },
  { id: "t-shirts", name: "T-shirts", note: "Printed with your design", alt: "Printed T-shirts laid out flat" },
  { id: "bags-wallets", name: "Bags & wallets", note: "For teams and gifts", alt: "A leather bag with wallets" },
  { id: "notebooks", name: "Notebooks & books", note: "Printed to order", alt: "A fan of printed notebooks" },
  { id: "electronics", name: "Electronics", note: "Watches, pen drives, AirPods", alt: "A steel wristwatch" },
  { id: "trophies", name: "Trophies", note: "For awards and sports days", alt: "Rows of silver and gold trophies" },
];

export const customisations = ["Name printing", "Text engraving", "Embossing", "Logo printing", "Gift wrapping"];

export const clients = [
  { id: "loyola", name: "Loyola College" },
  { id: "sbi", name: "State Bank of India" },
  { id: "starbox", name: "Starbox" },
  { id: "canara-bank", name: "Canara Bank" },
  { id: "snowman", name: "Snowman Logistics" },
  { id: "santhosh", name: "Santhosh Super Stores" },
  { id: "grace-world", name: "Grace World" },
];

export const brands = [
  { id: "faber-castell", name: "Faber-Castell" },
  { id: "3m", name: "3M" },
  { id: "camlin", name: "Camlin" },
  { id: "apsara", name: "Apsara" },
  { id: "pidilite", name: "Pidilite" },
  { id: "cadbury", name: "Cadbury" },
  { id: "reynolds", name: "Reynolds" },
  { id: "luxor", name: "Luxor" },
  { id: "classmate", name: "Classmate" },
  { id: "staedtler", name: "Staedtler" },
  { id: "cross", name: "Cross" },
  { id: "parker", name: "Parker" },
  { id: "uni-ball", name: "Uni-ball" },
  { id: "sheaffer", name: "Sheaffer" },
  { id: "flair", name: "Flair" },
  { id: "waterman", name: "Waterman" },
  { id: "casio", name: "Casio" },
  { id: "sony", name: "Sony" },
];
