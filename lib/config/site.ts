export const siteConfig = {
  name: "FieldNotes",
  description: "Listen to places. A public ambient audio map.",
  tagline: "Listen to places.",
  url: "https://fieldnotes.example.com",
  author: "FieldNotes",
  upload: {
    maxDurationSeconds: 20,
    maxFileSizeMB: 5,
    acceptedFormats: ["audio/mpeg", "audio/mp4", "audio/wav", "audio/webm"],
    acceptedExtensions: [".mp3", ".m4a", ".wav", ".webm"],
  },
  map: {
    defaultCenter: [-73.985, 40.748] as [number, number], // NYC
    defaultZoom: 12,
    // H3 resolution 7 ≈ 1.2km² hexagons — good for neighborhood-level areas
    publicAreaResolution: 7,
    tileStyle: "https://tiles.openfreemap.org/styles/liberty",
  },
  validation: {
    maxTitleLength: 100,
    maxNoteLength: 500,
    maxUsernameLength: 30,
    maxBioLength: 300,
  },
} as const;
