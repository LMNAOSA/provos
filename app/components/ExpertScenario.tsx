"use client";

import { useMemo, useState, type ChangeEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { EvidenceKey, evidence, experts, initialPerspective } from "../data/scenario";
import { SpecimenLens, SpecimenScene } from "./SpecimenScene";

const rounds = [
  { expert: experts[0], label: "01 / FIELD OBSERVATION" },
  { expert: experts[1], label: "02 / SCIENTIFIC CHALLENGE" },
  { expert: experts[2], label: "03 / GEOLOGICAL CONTEXT" },
];

const lensFor = (id: string): SpecimenLens => id === "spooner" ? "science" : id === "questiaux" ? "geology" : "field";

export function ExpertScenario() {
  const [phase, setPhase] = useState(0);
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceKey>("pxrf");
  const [confidence, setConfidence] = useState(initialPerspective.matt);
  const [reassessed, setReassessed] = useState(true);
  const [lens, setLens] = useState<SpecimenLens>("field");

  const currentEvidence = evidence[selectedEvidence];
  const mattFinal = reassessed ? Math.min(100, confidence + 9) : confidence;
  const scores: Record<"matt" | "spooner" | "questiaux", number> = useMemo(() => ({ matt: mattFinal, spooner: initialPerspective.spooner, questiaux: initialPerspective.questiaux }), [mattFinal]);
  const divergence = Math.max(scores.matt, scores.spooner, scores.questiaux) - Math.min(scores.matt, scores.spooner, scores.questiaux);

  const nextExpert = () => {
    const next = phase + 1;
    if (next === 1) setLens("field");
    if (next === 2) setLens("science");
    if (next === 3) setLens("geology");
    setPhase(next);
  };

  const reset = () => {
    setPhase(0); setSelectedEvidence("pxrf"); setConfidence(72); setReassessed(true); setLens("field");
  };

  return (
    <div className="scenarioShell">
      <div className="scenarioHeader">
        <div><span className="kicker">CASE 001 · KNOWLEDGE EVENT</span><h3>AND-MX-00017</h3><p>Andamooka matrix opal · controlled demonstration scenario</p></div>
        <div className="liveBadge"><span className="pulseDot" /> SIMULATED · NOT AUTHENTICATED</div>
      </div>

      <div className="scenarioMetaBar">
        <div><span>OBJECT</span><b>SPECIMEN 001</b></div>
        <div><span>PERSPECTIVES</span><b>3</b></div>
        <div><span>EVIDENCE REQUESTS</span><b>{phase >= 3 ? 1 : 0}</b></div>
        <div><span>STATUS</span><b>{phase >= 4 ? "TRACEABLE" : "LIVE"}</b></div>
      </div>

      <div className="scenarioGrid">
        <div className="scenarioSpecimen">
          <SpecimenScene compact lens={lens} />
          <div className="lensBar">
            <span className="kicker">VIEW THE OBJECT THROUGH</span>
            {(["field", "science", "geology", "provenance"] as SpecimenLens[]).map((item) => <button key={item} className={`lensButton ${lens === item ? "active" : ""}`} onClick={() => setLens(item)}>{item}</button>)}
          </div>
        </div>
        <div className="scenarioPanel">
          <div className="scenarioProgress"><div><span>CASE 001</span><b>{Math.min(6, phase + 1)} / 6</b></div><div className="progressTrack"><span style={{ width: `${Math.min(100, ((phase + 1) / 6) * 100)}%` }} /></div></div>
          <AnimatePresence mode="wait">
            {phase < 3 && <motion.div key={phase} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
              <span className="kicker">{rounds[phase].label}</span>
              <div className="expertHeading"><div><span className="expertRole">{rounds[phase].expert.role}</span><h4>{rounds[phase].expert.name}</h4><p>{rounds[phase].expert.title}</p></div><div className="scoreChip"><span>CONFIDENCE</span><strong>{scores[rounds[phase].expert.id]}%</strong></div></div>
              <blockquote>{rounds[phase].expert.quote}</blockquote>
              <p className="muted">{rounds[phase].expert.bio}</p>
              {phase === 0 && <><div className="confidenceRow"><span>Adjust field confidence</span><strong>{confidence}%</strong></div><input type="range" min="0" max="100" value={confidence} onChange={(e: ChangeEvent<HTMLInputElement>) => setConfidence(Number(e.target.value))} /></>}
              {phase === 1 && <div className="machinePrompt"><span>PROVENANCEOS PROBE</span><b>The observation is useful. What evidence would distinguish the mechanism?</b></div>}
              {phase === 2 && <div className="machinePrompt"><span>PROVENANCEOS PROBE</span><b>How does geological context change the interpretation?</b></div>}
              <button className="btn primary wide" onClick={nextExpert}>{phase === 0 ? "Record field observation" : phase === 1 ? "Add scientific interpretation" : "Add geological interpretation"}</button>
            </motion.div>}

            {phase === 3 && <motion.div key="evidence-request" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
              <span className="kicker">04 / INFORMATION NEED</span><h4>Three perspectives. One question.</h4>
              <p className="muted">The machine finds the useful disagreement and asks what evidence could explain it.</p>
              <div className="miniScores">{experts.map((expert) => <div key={expert.id}><span>{expert.name}</span><b>{scores[expert.id]}%</b></div>)}</div>
              <div className="divergenceBanner"><span>INTERPRETATION DIVERGENCE</span><strong>{divergence} POINTS</strong></div>
              <p className="kicker choiceLabel">WHAT SHOULD WE TEST?</p>
              <div className="evidenceChoices">{(Object.keys(evidence) as EvidenceKey[]).map((key) => <button key={key} className={`choice ${selectedEvidence === key ? "active" : ""}`} onClick={() => setSelectedEvidence(key)}>{evidence[key].label}</button>)}</div>
              <button className="btn primary wide" onClick={() => setPhase(4)}>Request {currentEvidence.short}</button>
            </motion.div>}

            {phase === 4 && <motion.div key="returned" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
              <span className="kicker">05 / EVIDENCE RETURNED · DEMONSTRATION</span><h4>{currentEvidence.label}</h4>
              <div className="evidenceInstrument"><div className="instrumentTop"><span>{currentEvidence.metric}</span><b>{currentEvidence.value}</b></div><div className="instrumentBars"><i /><i /><i /><i /><i /></div><small>{currentEvidence.description}</small></div>
              <div className="evidenceWarning">{currentEvidence.note}</div>
              <p className="kicker choiceLabel">HAS THE EVIDENCE CHANGED YOUR ASSESSMENT?</p>
              <div className="splitButtons"><button className={`choice ${reassessed ? "active" : ""}`} onClick={() => setReassessed(true)}>Yes — reassess</button><button className={`choice ${!reassessed ? "active" : ""}`} onClick={() => setReassessed(false)}>No — maintain</button></div>
              <button className="btn primary wide" onClick={() => setPhase(5)}>Reassess + trace</button>
            </motion.div>}

            {phase === 5 && <motion.div key="trace" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
              <span className="kicker">06 / TRACE THE EVENT</span><h4>The disagreement stays visible.</h4>
              <div className="traceOutcome"><strong>{mattFinal}%</strong><span>Matt's reassessed confidence</span><b>+ {reassessed ? 9 : 0} pts</b></div>
              <div className="traceList compactTrace"><div><span>FIELD</span><b>Matt Kathagen · {mattFinal}%</b></div><div><span>SCIENCE</span><b>Professor Nigel Spooner · {scores.spooner}%</b></div><div><span>GEOLOGY</span><b>Danielle Questiaux · {scores.questiaux}%</b></div><div><span>EVIDENCE</span><b>{currentEvidence.short}</b></div><div><span>STATUS</span><b>Open · provisional · traceable</b></div></div>
              <button className="btn accent wide" onClick={reset}>Run Case 001 again</button>
            </motion.div>}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
