# ProvenanceOS™ — The Andamooka Experiment

## Master Experience & Pilot Specification

Version 0.2 — September 2026

### 1. Mission
ProvenanceOS is a human-in-the-loop knowledge preservation system being proved first in Andamooka. The central question is: **Can we teach a machine how Andamooka knows without losing where the knowledge came from?**

### 2. What this prototype is
This repository contains an interactive research experience, not a production AI grading system. The experience demonstrates the intended methodology: a machine observes a specimen or scenario, asks a targeted question, captures a claim and confidence, identifies uncertainty, requests evidence, records reassessment, and preserves provenance.

### 3. Phase One
Phase One is deliberately closed-loop and small: Matt Kathagen / Mooka Boys (field and mining knowledge), Professor Nigel Spooner (scientific / radiation physics / luminescence / Novel Fluorescence perspective), and Danielle Questiaux (geological / geochronological / alpha spectroscopy perspective).

### 4. Knowledge Event
A Knowledge Event is the atomic unit captured by the system. Fields include: specimen context, contributor, claim, basis, confidence, uncertainty, information need, evidence requested, evidence supplied, reassessment, timestamp and provenance status.

### 5. Human evaluation
Use the term **Dual-Perspective Human Evaluation** for Phase One. Avoid claiming RLHF unless the actual machine-learning pipeline implements reinforcement learning or preference optimization. The scientific lens checks scientific / spectroscopic / geological validity. The field lens checks terminology, operational realism, actionability and visual correspondence.

### 6. Live scenario
Case 001 is a structured illustrative scenario around specimen AND-MX-00017. The interface should stage the interaction between Matt Kathagen, Professor Nigel Spooner and Danielle Questiaux, then expose disagreement and evidence needs.

### 7. Evidence integrity
All synthetic measurements and scenario values must be visibly labeled as demonstration data. Do not fabricate scientific evidence and present it as authenticated measurement. Replace demonstration content with authenticated Phase One evidence before external scientific claims are made.

### 8. Product experience
The visitor journey is: Understand → Enter Case 001 → Watch/participate → Choose evidence → Observe reassessment → Show how the machine knows → Explore the provenance network → Understand the Phase Two path.

### 9. Technology
Next.js / React is the application shell. Motion provides transition and interaction choreography. React Three Fiber + Three.js provides a restrained 3D specimen view. AI SDK 7 provides the future seam for structured model calls, tools, agents, speech and multimodal interaction. The current app intentionally keeps scientific synthesis deterministic until authenticated evidence sources are connected.

### 10. Future tool layer
Candidate tools: getSpecimen, getPXRF, getFluorescence, getMicroscopy, getGeologicalContext, getComparisonSpecimens, askExpert, recordKnowledgeEvent, recordConfidence, requestEvidence, reassessKnowledge, traceKnowledgeEvent.

### 11. Phase Two
After the closed loop works: deploy the tested interrogation experience to Andamooka miners; capture voice, imagery, claims, confidence and information needs; connect community observations to authenticated evidence.

### 12. Phase Three
Build a living Andamooka knowledge network linking people, specimens, observations, evidence, measurements, interpretations, reassessments and outcomes. Use the accumulated network to inform the evolving Andamooka Standard and wider provenance network.

### 13. Strategic principle
The goal is not consensus. The goal is useful disagreement, visible uncertainty, traceable evidence and knowledge that can evolve without erasing its history.
