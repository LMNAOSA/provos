# ProvenanceOS™ — The Andamooka Experiment

A premium interactive research experience for the Andamooka Standard / ProvenanceOS Phase One concept.

## v0.3 direction

The site is no longer structured as a conventional presentation. Case 001 is the centre of the experience: one specimen, three expert perspectives, a machine in the middle, evidence request, reassessment and traceable provenance.

### Stack

- Next.js 16.3.4
- React 19
- Motion
- React Three Fiber / Drei / Three.js
- Vercel AI SDK seam for future synthesis/tool orchestration

### Specimen model

Put the provided GLB at `public/images/Matrixtwin_opal.glb`.

The scene loads that model and provides Field / Science / Geology / Provenance viewing states. A fallback mesh remains in code only as a resilient development fallback.

### Run

```bash
npm install
npm run dev
```

Production:

```bash
npm run build
npm start
```

## Scientific integrity rule

All current evidence cards are marked as demonstration data. Do not present synthetic elemental, fluorescence, microscopy or geological measurements as authenticated observations.

## Core experience

1. Arrival in Andamooka
2. Enter Case 001
3. Inspect specimen
4. Meet Matt Kathagen
5. Meet Professor Nigel Spooner
6. Meet Danielle Questiaux
7. Detect divergence
8. Choose evidence
9. Reassess
10. Trace how the knowledge was formed
11. Scale one case into the Andamooka Standard
