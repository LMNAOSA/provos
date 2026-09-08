"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { SpecimenScene, type SpecimenLens } from "./SpecimenScene";

type TraceStep = {
  id: string;
  label: string;
  eyebrow: string;
  title: string;
  body: string;
  person?: string;
  role?: string;
  confidence?: number;
  lens: SpecimenLens;
  accent?: "bronze" | "cyan";
};

const steps: TraceStep[] = [
  {
    id: "observation",
    label: "Observation",
    eyebrow: "01 / FIELD",
    title: "Matt saw a pattern before the machine had an explanation.",
    body: "The first contribution is not treated as truth. It is retained as an observation, with its own provenance and confidence.",
    person: "Matt Kathagen",
    role: "Mooka Boys · Field / Mining Knowledge",
    confidence: 72,
    lens: "field",
    accent: "bronze",
  },
  {
    id: "science",
    label: "Interpretation",
    eyebrow: "02 / SCIENCE",
    title: "Professor Spooner separates the observation from the mechanism.",
    body: "The scientific contribution can challenge the first reading without erasing it. The difference is preserved.",
    person: "Professor Nigel Spooner",
    role: "Professor of Radiation Physics and Luminescence",
    confidence: 58,
    lens: "science",
    accent: "cyan",
  },
  {
    id: "geology",
    label: "Context",
    eyebrow: "03 / GEOLOGY",
    title: "Danielle brings the geological history back into the room.",
    body: "A new perspective adds context rather than a verdict. The system now has three distinct reasons to compare.",
    person: "Danielle Questiaux",
    role: "Research Assistant and Alpha Spectroscopy Analyst, University of Adelaide",
    confidence: 74,
    lens: "geology",
    accent: "bronze",
  },
  {
    id: "evidence",
    label: "Evidence",
    eyebrow: "04 / REQUEST",
    title: "The machine asks the only useful question: what would change your mind?",
    body: "The visitor chooses evidence. In Phase One, this is where authenticated measurements and imagery enter the event.",
    lens: "science",
    accent: "cyan",
  },
  {
    id: "reassessment",
    label: "Reassessment",
    eyebrow: "05 / CHANGE",
    title: "The conclusion moves — but the history stays.",
    body: "A revised confidence does not overwrite the original contribution. It becomes another event connected to it.",
    confidence: 81,
    lens: "provenance",
    accent: "bronze",
  },
];

export function TraceExperience() {
  const [activeId, setActiveId] = useState("observation");
  const [showDetail, setShowDetail] = useState(false);
  const active = useMemo(() => steps.find((step) => step.id === activeId) ?? steps[0], [activeId]);

  return (
    <div className="traceImmersive">
      <div className="traceObject">
        <div className="traceTopline">
          <span>AND-MX-00017</span>
          <span>TRACE / LIVE DEMONSTRATION</span>
        </div>
        <SpecimenScene compact lens={active.lens} />

        <div className="traceObjectGlow" aria-hidden="true" />
        <AnimatePresence mode="wait">
          <motion.div
            key={active.id}
            className={`traceHalo traceHalo-${active.accent ?? "bronze"}`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.9, scale: 1 }}
            exit={{ opacity: 0, scale: 1.15 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            aria-hidden="true"
          />
        </AnimatePresence>
        <div className="traceObjectCaption">
          <span>THE PHYSICAL OBJECT</span>
          <b>{active.label.toUpperCase()}</b>
        </div>
      </div>

      <div className="traceStory">
        <div className="traceStoryHead">
          <div>
            <span className="kicker">03 — TRACE</span>
            <h2>Show how<br /><em>it knows.</em></h2>
          </div>
          <p>Don't visualise the architecture. Visualise the phenomenon: one object, multiple readings, evidence moving between them.</p>
        </div>

        <div className="traceCurrent">
          <AnimatePresence mode="wait">
            <motion.div key={active.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <span className={`traceEyebrow traceAccent-${active.accent ?? "bronze"}`}>{active.eyebrow}</span>
              <h3>{active.title}</h3>
              <p>{active.body}</p>
              {active.person && <div className="tracePerson"><strong>{active.person}</strong><span>{active.role}</span></div>}
              {active.confidence !== undefined && <div className="traceConfidence"><span>CONFIDENCE</span><strong>{active.confidence}%</strong><i><span style={{ width: `${active.confidence}%` }} /></i></div>}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="traceRail" aria-label="Trace stages">
          {steps.map((step, index) => (
            <button key={step.id} className={`traceRailItem ${activeId === step.id ? "active" : ""}`} onClick={() => { setActiveId(step.id); setShowDetail(false); }}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <b>{step.label}</b>
            </button>
          ))}
        </div>

        <div className="traceActions">
          <button className="traceTextButton" onClick={() => setShowDetail((value) => !value)}>
            <span>{showDetail ? "Hide event detail" : "Why does the machine believe this?"}</span>
            <i>{showDetail ? "↑" : "↓"}</i>
          </button>
          <span className="traceStatus">PROVENANCE RETAINED</span>
        </div>

        <AnimatePresence initial={false}>
          {showDetail && (
            <motion.div className="traceDetail" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
              <div><span>SOURCE</span><b>{active.person ?? "ProvenanceOS"}</b></div>
              <div><span>BASIS</span><b>{active.id === "observation" ? "Field observation" : active.id === "science" ? "Scientific interpretation" : active.id === "geology" ? "Geological context" : active.id === "evidence" ? "Evidence requested by participant" : "Reassessment after evidence"}</b></div>
              <div><span>STATUS</span><b>Provisional · traceable · demonstration</b></div>
              <div><span>EVENT</span><b>AND-MX-00017 / K00172</b></div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
