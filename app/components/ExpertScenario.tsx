"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { EvidenceKey, evidence, experts } from "../data/scenario";
import { SpecimenScene } from "./SpecimenScene";

const prompts = [
  "Looking at this specimen, what do you think is happening?",
  "What makes you think that?",
  "What evidence would help you decide?"
];

export function ExpertScenario() {
  const [phase, setPhase] = useState(0);
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceKey>("pxrf");
  const [confidence, setConfidence] = useState(72);
  const [reassessed, setReassessed] = useState(false);

  const currentEvidence = evidence[selectedEvidence];
  const divergence = useMemo(() => Math.abs(experts[0].score - experts[1].score), []);

  return (
    <div className="scenarioShell">
      <div className="scenarioHeader">
        <div><span className="kicker">CASE 001</span><h3>AND-MX-00017</h3><p>Andamooka matrix opal · controlled demonstration scenario</p></div>
        <div className="liveBadge">SIMULATED · PHASE ONE DESIGN</div>
      </div>

      <div className="scenarioGrid">
        <div className="scenarioSpecimen"><SpecimenScene compact /></div>
        <div className="scenarioPanel">
          <div className="progress"><span style={{ width: `${Math.min(100, 22 + phase * 26)}%` }} /></div>
          <AnimatePresence mode="wait">
            {phase === 0 && <motion.div key="p0" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <span className="kicker">MATT KATHAGEN · FIELD / MINING KNOWLEDGE</span>
              <h4>{prompts[0]}</h4>
              <blockquote>“I’m seeing a pattern I’d associate with this sort of material, but I’d want to know whether the physical evidence supports the pattern.”</blockquote>
              <label className="confidenceRow"><span>Confidence</span><strong>{confidence}%</strong></label>
              <input type="range" min="0" max="100" value={confidence} onChange={(e) => setConfidence(Number(e.target.value))} />
              <button className="btn primary wide" onClick={() => setPhase(1)}>Record field observation</button>
            </motion.div>}

            {phase === 1 && <motion.div key="p1" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <span className="kicker">PROVENANCEOS PROBE</span>
              <h4>What makes you think that?</h4>
              <p className="muted">The system separates the observation from the mechanism, then records the basis for the judgement.</p>
              <div className="quoteBox">“Pattern recognition from field experience. I can point to what I see; I’m less certain about the underlying cause.”</div>
              <button className="btn primary wide" onClick={() => setPhase(2)}>Ask for evidence</button>
            </motion.div>}

            {phase === 2 && <motion.div key="p2" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <span className="kicker">INFORMATION NEED</span>
              <h4>What would help decide?</h4>
              <div className="evidenceChoices">
                {(Object.keys(evidence) as EvidenceKey[]).map((key) => <button key={key} className={`choice ${selectedEvidence === key ? "active" : ""}`} onClick={() => setSelectedEvidence(key)}>{evidence[key].label}</button>)}
              </div>
              <button className="btn primary wide" onClick={() => setPhase(3)}>Request {currentEvidence.label}</button>
            </motion.div>}

            {phase === 3 && <motion.div key="p3" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <span className="kicker">EVIDENCE RETURNED · DEMONSTRATION DATA</span>
              <h4>{currentEvidence.label}</h4>
              <div className="evidenceCard"><strong>{currentEvidence.metric}</strong><p>{currentEvidence.description}</p><small>{currentEvidence.note}</small></div>
              <p className="kicker" style={{ marginTop: 20 }}>HAS THIS CHANGED THE ASSESSMENT?</p>
              <div className="splitButtons"><button className={`choice ${reassessed ? "active" : ""}`} onClick={() => setReassessed(true)}>Yes — reassess</button><button className={`choice ${!reassessed ? "active" : ""}`} onClick={() => setReassessed(false)}>No — maintain</button></div>
              <button className="btn primary wide" onClick={() => setPhase(4)}>Continue to expert round</button>
            </motion.div>}

            {phase === 4 && <motion.div key="p4" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
              <span className="kicker">THREE PERSPECTIVES · ONE SPECIMEN</span>
              <h4>Disagreement detected</h4>
              <div className="expertScores">{experts.map((expert) => <div className="score" key={expert.id}><span>{expert.name}</span><small>{expert.lens}</small><strong>{expert.id === "matt" ? (reassessed ? Math.min(100, confidence + 10) : confidence) : expert.score}%</strong></div>)}</div>
              <div className="divergence">DIVERGENCE <strong>{divergence} points</strong></div>
              <p className="muted">The machine does not appoint a winner. It asks which evidence could explain the difference.</p>
              <button className="btn primary wide" onClick={() => setPhase(5)}>Show provenance</button>
            </motion.div>}

            {phase === 5 && <motion.div key="p5" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <span className="kicker">KNOWLEDGE EVENT · TRACE</span>
              <h4>The interaction becomes provenance.</h4>
              <div className="traceList"><div><span>CLAIM</span><b>Matt's field observation</b></div><div><span>CONFIDENCE</span><b>{reassessed ? Math.min(100, confidence + 10) : confidence}%</b></div><div><span>EVIDENCE</span><b>{currentEvidence.label}</b></div><div><span>SCIENTIFIC VIEW</span><b>Professor Nigel Spooner · {experts[1].score}%</b></div><div><span>GEOLOGICAL VIEW</span><b>Danielle Questiaux · {experts[2].score}%</b></div><div><span>STATUS</span><b>Open · provisional · traceable</b></div></div>
              <button className="btn accent wide" onClick={() => { setPhase(0); setConfidence(72); setSelectedEvidence("pxrf"); setReassessed(false); }}>Run the scenario again</button>
            </motion.div>}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
