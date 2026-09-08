export type EvidenceKey = "pxrf" | "fluorescence" | "microscopy" | "geology" | "imagery" | "expert";

export const experts = [
  {
    id: "matt",
    name: "Matt Kathagen",
    title: "Mooka Boys · Field / Mining Knowledge",
    lens: "Field intelligence",
    bio: "Practical knowledge of Andamooka, the material and what an observation means when you are actually working it in the field.",
    score: 72,
    quote: "I know what that kind of wall is doing before I can always tell you exactly why. The question is whether the evidence backs the pattern up."
  },
  {
    id: "spooner",
    name: "Professor Nigel Spooner",
    title: "Professor of Radiation Physics and Luminescence",
    lens: "Scientific / photonics",
    bio: "Professor Spooner is a leading figure in radiation physics and luminescence, with expertise spanning luminescence dating, radiation detection and Novel Fluorescence.",
    score: 58,
    quote: "The observation is interesting. The mechanism is the part I would want to test."
  },
  {
    id: "questiaux",
    name: "Danielle Questiaux",
    title: "Research Assistant and Alpha Spectroscopy Analyst, University of Adelaide",
    lens: "Geology / geochronology",
    bio: "Danielle Questiaux works in geological and geochronological analysis, including alpha spectroscopy and the interpretation of complex environmental samples.",
    score: 74,
    quote: "I would bring the geological history back into the room before we decide what the material is telling us."
  }
] as const;

export const evidence = {
  pxrf: {
    label: "pXRF data",
    description: "Demonstration elemental profile and contextual measurement for AND-MX-00017.",
    metric: "Elemental profile",
    note: "Replace with authenticated Phase One evidence before scientific presentation."
  },
  fluorescence: {
    label: "Novel Fluorescence response",
    description: "Demonstration optical-response panel representing a future authenticated fluorescence capture.",
    metric: "Optical response",
    note: "Illustrative only — not a real measurement."
  },
  microscopy: {
    label: "Microscopy",
    description: "Demonstration microstructure view showing the kind of evidence a participant could request.",
    metric: "Microstructure",
    note: "Illustrative only — not an authenticated micrograph."
  },
  geology: {
    label: "Geological context",
    description: "Demonstration contextual layer connecting specimen observations to geological interpretation.",
    metric: "Contextual history",
    note: "Illustrative only — replace with curated geological evidence."
  },
  imagery: {
    label: "Additional photography",
    description: "A second view of the specimen, requested to test whether the visual observation holds.",
    metric: "Visual verification",
    note: "Illustrative only — replace with authenticated imagery."
  },
  expert: {
    label: "Another expert opinion",
    description: "A deliberately conflicting interpretation to expose disagreement rather than erase it.",
    metric: "Independent interpretation",
    note: "Illustrative scenario content."
  }
} satisfies Record<EvidenceKey, { label: string; description: string; metric: string; note: string }>;
