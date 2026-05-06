export type IconType =
  | "bay-area"
  | "chicago"
  | "london"
  | "mount-tamalpais"
  | "florida-san-diego"
  | "cabo";

export type TripImage = {
  src: string;
  alt: string;
};

export type VlogLink = {
  title: string;
  href: string;
};

export type TripSticker = {
  src: string;
  alt: string;
  version?: string;
  rotation: number;
  shape: "square" | "portrait" | "landscape";
  accent: "tape" | "pin" | "none";
  visible: boolean;
};

export type TripMapPoint = {
  lat: number;
  lng: number;
  offsetX?: number;
  offsetY?: number;
};

export type Trip = {
  slug: string;
  title: string;
  date: string;
  iconType: IconType;
  description: string;
  sticker: TripSticker;
  mapPoint: TripMapPoint;
  images: TripImage[];
  vlogLinks: VlogLink[];
};

type TripInput = Omit<Trip, "description" | "images" | "vlogLinks"> & {
  description?: string;
  images?: TripImage[];
  vlogLinks?: VlogLink[];
};

function placeholderImages(title: string): TripImage[] {
  return Array.from({ length: 5 }, (_, index) => ({
    src: "",
    alt: `${title} trip image placeholder ${index + 1}`,
  }));
}

function placeholderVlogLinks(title: string): VlogLink[] {
  return [
    { title: `${title} vlog`, href: "#" },
    { title: "Standby notes", href: "#" },
  ];
}

function createTrip(trip: TripInput): Trip {
  return {
    description:
      trip.description ??
      `Placeholder notes for ${trip.title}. Add trip memories, flight details, and favorite moments here.`,
    images: trip.images ?? placeholderImages(trip.title),
    vlogLinks: trip.vlogLinks ?? placeholderVlogLinks(trip.title),
    ...trip,
  };
}

export const trips: Trip[] = [
  createTrip({
    slug: "bay-area",
    title: "Bay Area",
    date: "July 2025",
    iconType: "bay-area",
    mapPoint: { lat: 37.3329, lng: -121.8198, offsetX: -22, offsetY: -18 },
    sticker: {
      src: "/stickers/bay-area.png",
      alt: "Bay Area sticker",
      rotation: 3,
      shape: "portrait",
      accent: "tape",
      visible: true,
    },
  }),
  createTrip({
    slug: "chicago",
    title: "Chicago",
    date: "January 2025",
    iconType: "chicago",
    mapPoint: { lat: 41.8781, lng: -87.6298, offsetX: -16, offsetY: -12 },
    sticker: {
      src: "/stickers/chicago.png",
      alt: "Chicago sticker",
      rotation: -2,
      shape: "portrait",
      accent: "none",
      visible: true,
    },
  }),
  createTrip({
    slug: "london",
    title: "London",
    date: "Jan 16 - 19, 2026",
    iconType: "london",
    mapPoint: { lat: 51.5074, lng: -0.1278, offsetX: -18, offsetY: -12 },
    sticker: {
      src: "/stickers/london.png",
      alt: "London sticker",
      version: "2",
      rotation: -4,
      shape: "portrait",
      accent: "pin",
      visible: true,
    },
  }),
  createTrip({
    slug: "mount-tamalpais",
    title: "Mount Tamalpais",
    date: "Jan 23 - 25, 2026",
    iconType: "mount-tamalpais",
    mapPoint: { lat: 37.9235, lng: -122.5965, offsetX: 12, offsetY: -12 },
    sticker: {
      src: "/stickers/mount-tamalpais.png",
      alt: "Mount Tamalpais sticker",
      rotation: 5,
      shape: "landscape",
      accent: "pin",
      visible: true,
    },
  }),
  createTrip({
    slug: "cabo",
    title: "Cabo",
    date: "Feb 6 - 8, 2026",
    iconType: "cabo",
    mapPoint: { lat: 22.8905, lng: -109.9167, offsetX: 4, offsetY: 8 },
    sticker: {
      src: "/stickers/cabo.png",
      alt: "Cabo sticker",
      rotation: -5,
      shape: "portrait",
      accent: "tape",
      visible: true,
    },
  }),
  createTrip({
    slug: "denver",
    title: "Denver",
    date: "Feb 13 - Feb 15, 2026",
    iconType: "mount-tamalpais",
    mapPoint: { lat: 39.7392, lng: -104.9903, offsetX: 2, offsetY: -7 },
    sticker: {
      src: "/stickers/denver.png",
      alt: "Denver sticker",
      rotation: 4,
      shape: "landscape",
      accent: "none",
      visible: true,
    },
  }),
  createTrip({
    slug: "alcatraz",
    title: "Alcatraz",
    date: "Feb 20 - 22, 2026",
    iconType: "bay-area",
    mapPoint: { lat: 37.8267, lng: -122.423, offsetX: 22, offsetY: 4 },
    sticker: {
      src: "/stickers/alcatraz.png",
      alt: "Alcatraz sticker",
      rotation: -3,
      shape: "landscape",
      accent: "pin",
      visible: true,
    },
  }),
  createTrip({
    slug: "university-of-illinois",
    title: "University of Illinois",
    date: "March 6 - 8, 2026",
    iconType: "chicago",
    mapPoint: { lat: 40.102, lng: -88.2272, offsetX: 16, offsetY: 12 },
    sticker: {
      src: "/stickers/university-of-illinois.png",
      alt: "University of Illinois sticker",
      rotation: -2,
      shape: "landscape",
      accent: "none",
      visible: true,
    },
  }),
  createTrip({
    slug: "flying-in-sf",
    title: "Flying in SF",
    date: "March 14, 2026",
    iconType: "bay-area",
    mapPoint: { lat: 37.3329, lng: -121.8198, offsetX: -18, offsetY: 18 },
    sticker: {
      src: "/stickers/flying-in-sf.png",
      alt: "Flying in SF sticker",
      rotation: 5,
      shape: "landscape",
      accent: "tape",
      visible: true,
    },
  }),
  createTrip({
    slug: "yosemite",
    title: "Yosemite",
    date: "March 20 - 22, 2026",
    iconType: "mount-tamalpais",
    mapPoint: { lat: 37.8651, lng: -119.5383, offsetX: 18, offsetY: 22 },
    sticker: {
      src: "/stickers/yosemite.png",
      alt: "Yosemite sticker",
      rotation: -4,
      shape: "portrait",
      accent: "pin",
      visible: true,
    },
  }),
  createTrip({
    slug: "new-york",
    title: "New York",
    date: "March 27 - 29, 2026",
    iconType: "chicago",
    mapPoint: { lat: 40.7128, lng: -74.006, offsetX: 2, offsetY: -7 },
    sticker: {
      src: "/stickers/new-york.png",
      alt: "New York sticker",
      rotation: 3,
      shape: "landscape",
      accent: "none",
      visible: true,
    },
  }),
  createTrip({
    slug: "nasa-launch-orlando",
    title: "NASA Launch Orlando",
    date: "March 31 - April 1, 2026",
    iconType: "cabo",
    mapPoint: { lat: 28.5729, lng: -80.649, offsetX: 4, offsetY: 8 },
    sticker: {
      src: "/stickers/nasa-launch-orlando.png",
      alt: "NASA Launch Orlando sticker",
      rotation: -3,
      shape: "portrait",
      accent: "tape",
      visible: true,
    },
  }),
  createTrip({
    slug: "tokyo",
    title: "Tokyo",
    date: "April 15 - 19, 2026",
    iconType: "chicago",
    mapPoint: { lat: 35.6762, lng: 139.6503, offsetX: 0, offsetY: -4 },
    sticker: {
      src: "/stickers/tokyo.png",
      alt: "Tokyo sticker",
      rotation: -2,
      shape: "landscape",
      accent: "none",
      visible: true,
    },
  }),
  createTrip({
    slug: "amsterdam",
    title: "Amsterdam",
    date: "May 1 - 3, 2026",
    iconType: "london",
    mapPoint: { lat: 52.3676, lng: 4.9041, offsetX: 18, offsetY: 12 },
    sticker: {
      src: "/stickers/amsterdam.png",
      alt: "Amsterdam sticker",
      rotation: -4,
      shape: "landscape",
      accent: "pin",
      visible: true,
    },
  }),
];

export function getTripBySlug(slug: string) {
  return trips.find((trip) => trip.slug === slug);
}
