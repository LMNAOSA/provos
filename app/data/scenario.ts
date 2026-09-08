export type PerspectiveId = "matt" | "spooner" | "questiaux";
export type EvidenceKey = "pxrf" | "fluorescence" | "microscopy" | "geology" | "imagery" | "expert";

export const experts = [
  {
    id: "matt" as const,
    name: "Matt Kathagen",
    title: "Mooka Boys · Field / Mining Knowledge",
    lens: "FIELD INTELLIGENCE",
    bio: "Practical knowledge of Andamooka, the material and what an observation means when you are actually working it in the field.",
    score: 72,
    quote: "The pattern catches my eye first. The useful question is whether the evidence backs that pattern up.",
    role: "FIELD",
  },
  {
    id: "spooner" as const,
    name: "Professor Nigel Spooner",
    title: "Professor of Radiation Physics and Luminescence",
    lens: "SCIENTIFIC / PHOTONICS",
    bio: "A leading figure in radiation physics and luminescence, with expertise spanning luminescence dating, radiation detection and Novel Fluorescence.",
    score: 58,
    quote: "The observation is interesting. The mechanism is the part I would want to test.",
    role: "SCIENCE",
  },
  {
    id: "questiaux" as const,
    name: "Danielle Questiaux",
    title: "Research Assistant and Alpha Spectroscopy Analyst, University of Adelaide",
    lens: "GEOLOGY / ANALYSIS",
    bio: "Geological and geochronological analysis, including alpha spectroscopy and the interpretation of complex environmental samples.",
    score: 74,
    quote: "I would bring the geological history back into the room before we decide what the material is telling us.",
    role: "GEOLOGY",
  },
] as const;

export const evidence = {
  pxrf: {
    label: "pXRF DATA",
    short: "pXRF",
    description: "A demonstration elemental profile and contextual measurement for AND-MX-00017.",
    metric: "ELEMENTAL PROFILE",
    value: "DEMONSTRATION",
    note: "Illustrative only — replace with authenticated Phase One evidence before scientific presentation.",
  },
  fluorescence: {
    label: "NOVEL FLUORESCENCE RESPONSE",
    short: "Novel Fluorescence",
    description: "A demonstration optical-response panel representing the kind of evidence a participant could request.",
    metric: "OPTICAL RESPONSE",
    value: "DEMONSTRATION",
    note: "Illustrative only — not a real measurement.",
  },
  microscopy: {
    label: "MICROSCOPY",
    short: "Microscopy",
    description: "A demonstration microstructure view showing the kind of evidence a participant could request.",
    metric: "MICROSTRUCTURE",
    value: "DEMONSTRATION",
    note: "Illustrative only — not an authenticated micrograph.",
  },
  geology: {
    label: "GEOLOGICAL CONTEXT",
    short: "Geology",
    description: "A demonstration contextual layer connecting specimen observations to geological interpretation.",
    metric: "CONTEXTUAL HISTORY",
    value: "DEMONSTRATION",
    note: "Illustrative only — replace with curated geological evidence.",
  },
  imagery: {
    label: "ADDITIONAL PHOTOGRAPHY",
    short: "Imagery",
    description: "A second specimen view requested to test whether the original visual observation holds.",
    metric: "VISUAL VERIFICATION",
    value: "DEMONSTRATION",
    note: "Illustrative only — replace with authenticated imagery.",
  },
  expert: {
    label: "ANOTHER EXPERT OPINION",
    short: "Expert",
    description: "An additional independent interpretation used to expose disagreement rather than erase it.",
    metric: "INDEPENDENT INTERPRETATION",
    value: "DEMONSTRATION",
    note: "Illustrative scenario content.",
  },
} satisfies Record<EvidenceKey, { label: string; short: string; description: string; metric: string; value: string; note: string }>;

export const initialPerspective: Record<PerspectiveId, number> = {
  matt: 72,
  spooner: 58,
  questiaux: 74,
};

export const traceEvents = [
  { key: "OBSERVATION", detail: "Field observation contributed by Matt Kathagen", tone: "field" },
  { key: "CONFIDENCE", detail: "Initial confidence recorded as a property of the contribution", tone: "bronze" },
  { key: "QUESTION", detail: "ProvenanceOS identifies an uncertainty worth probing", tone: "cyan" },
  { key: "EVIDENCE", detail: "Participant selects the evidence needed to decide", tone: "cyan" },
  { key: "INTERPRETATION", detail: "Professor Nigel Spooner provides a scientific reading", tone: "science" },
  { key: "CONTEXT", detail: "Danielle Questiaux adds a geological / analytical perspective", tone: "geology" },
  { key: "REASSESSMENT", detail: "Confidence changes — or deliberately does not", tone: "bronze" },
  { key: "PROVENANCE", detail: "The complete chain is retained rather than overwritten", tone: "field" },
];
