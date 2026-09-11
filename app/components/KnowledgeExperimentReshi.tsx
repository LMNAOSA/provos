"use client";

import { useEffect, useMemo, useState } from "react";

type Role = "MAT" | "SPOONER" | "DANIELLE";
type ExpertRole = Exclude<Role, "MAT">;
type Request = { id: string; from: ExpertRole; prompt: string; response?: string; status: "OPEN" | "FULFILLED" };
type Reassessment = { text: string; confidence: number; changed: boolean };
type Answer = { text: string; basis: string; uncertainty: string; confidence: number; request?: Request; reassessment?: Reassessment };
type CaseImage = { src: string; label: string; note: string };
type Case = { id: string; date: string; question: string; observation: string; images: CaseImage[]; pxrf: string; answers: Partial<Record<ExpertRole, Answer>>; requests: Request[]; history: string[] };

type FieldProps = { value: string; setValue: (value: string) => void; label: string; placeholder: string };

const STORAGE = "provenanceos-cases-v4";
const PEOPLE: Record<Role, { name: string; short: string; title: string; mode: string; description: string }> = {
  MAT: { name: "Matt Kathagen", short: "Matt", title: "Mooka Boys · Field / Mining", mode: "FIELD", description: "Bring the observation into the record. Return measurement data only when an expert asks for evidence." },
  SPOONER: { name: "Professor Nigel Spooner", short: "Nigel", title: "Radiation Physics and Luminescence", mode: "SCIENCE", description: "Make an independent judgement. Your response remains hidden from the other expert until reveal." },
  DANIELLE: { name: "Danielle Questiaux", short: "Danielle", title: "Research Assistant · Alpha Spectroscopy Analyst", mode: "ANALYSIS", description: "Make an independent judgement. Your response remains hidden from the other expert until reveal." },
};
const PHASES = ["SEE", "JUDGE", "ASK", "REASSESS", "REVEAL"] as const;
const DEMO: Case = {
  id: "CASE 001",
  date: "08 SEP 2026",
  question: "Why is this hard matrix phosphorescing so much?",
  observation: "Field observation supplied by Matt. Visible afterglow was observed after 365 nm UV exposure, persisting for approximately 7 seconds.",
  images: [
    { src: "/images/case001_normal.jpg", label: "NORMAL LIGHT", note: "Same material under ordinary light" },
    { src: "/images/case001_uv.jpg", label: "365 NM UV", note: "Hard matrix under UV excitation · visible afterglow observed for ~7 seconds" },
  ],
  pxrf: "NO XRF DATA SUPPLIED",
  answers: {},
  requests: [],
  history: ["CASE CREATED · FIELD OBSERVATION", "QUESTION LOCKED · SENT TO EXPERTS", "pXRF STATUS · NO DATA SUPPLIED"],
};

function hydrate(raw: string | null): Case[] {
  if (!raw) return [DEMO];
  try {
    const parsed = JSON.parse(raw) as Case[];
    const source = parsed.length ? parsed : [DEMO];
    const normalised = source.map((c) => c.id === DEMO.id ? { ...DEMO, ...c, question: DEMO.question, observation: DEMO.observation, images: DEMO.images, pxrf: c.pxrf || DEMO.pxrf, answers: c.answers || {}, requests: c.requests || [], history: c.history?.length ? c.history : DEMO.history } : c);
    return normalised.some((c) => c.id === DEMO.id) ? normalised : [DEMO, ...normalised];
  } catch { return [DEMO]; }
}

function phase(active: Case) {
  if (active.answers.SPOONER && active.answers.DANIELLE) return "REVEAL" as const;
  if (active.answers.SPOONER?.request?.status === "FULFILLED" || active.answers.DANIELLE?.request?.status === "FULFILLED") return "REASSESS" as const;
  if (active.answers.SPOONER?.request || active.answers.DANIELLE?.request) return "ASK" as const;
  if (active.answers.SPOONER || active.answers.DANIELLE) return "JUDGE" as const;
  return "SEE" as const;
}

export function KnowledgeExperiment() {
  const [role, setRole] = useState<Role>("SPOONER");
  const [cases, setCases] = useState<Case[]>([DEMO]);
  const [answerText, setAnswerText] = useState("");
  const [basis, setBasis] = useState("");
  const [uncertainty, setUncertainty] = useState("");
  const [confidence, setConfidence] = useState(50);
  const [requestPrompt, setRequestPrompt] = useState("");
  const [reassessment, setReassessment] = useState("");
  const [reassessmentConfidence, setReassessmentConfidence] = useState(50);
  const [changed, setChanged] = useState(false);
  const [pxrfResponse, setPxrfResponse] = useState("");

  useEffect(() => setCases(hydrate(localStorage.getItem(STORAGE))), []);

  const active = useMemo(() => cases.find((c) => c.id === "CASE 001") || DEMO, [cases]);
  const currentPhase = phase(active);
  const bothLocked = Boolean(active.answers.SPOONER && active.answers.DANIELLE);
  const openRequest = active.requests.find((r) => r.status === "OPEN");

  const persist = (next: Case[]) => { setCases(next); localStorage.setItem(STORAGE, JSON.stringify(next)); };
  const update = (fn: (c: Case) => Case) => persist(cases.map((c) => c.id === "CASE 001" ? fn(c) : c));

  const reset = () => {
    setCases([DEMO]);
    localStorage.removeItem(STORAGE);
    setAnswerText(""); setBasis(""); setUncertainty(""); setConfidence(50); setRequestPrompt(""); setReassessment(""); setReassessmentConfidence(50); setChanged(false); setPxrfResponse("");
  };

  const lockInitial = (expert: ExpertRole) => {
    if (!answerText.trim()) return;
    update((c) => ({ ...c, answers: { ...c.answers, [expert]: { text: answerText.trim(), basis: basis.trim(), uncertainty: uncertainty.trim(), confidence } }, history: [...c.history, `${PEOPLE[expert].mode} INITIAL JUDGEMENT LOCKED · ${confidence}%`] }));
    setAnswerText(""); setBasis(""); setUncertainty("");
  };

  const requestEvidence = (expert: ExpertRole) => {
    if (!requestPrompt.trim()) return;
    const req: Request = { id: `PXRF-${Date.now()}`, from: expert, prompt: requestPrompt.trim(), status: "OPEN" };
    update((c) => ({ ...c, answers: { ...c.answers, [expert]: { ...c.answers[expert]!, request: req } }, requests: [...c.requests, req], history: [...c.history, `${PEOPLE[expert].mode} REQUESTED pXRF DATA · ${req.prompt}`] }));
    setRequestPrompt("");
  };

  const returnEvidence = () => {
    if (!bothLocked || !openRequest || !pxrfResponse.trim()) return;
    update((c) => ({ ...c, pxrf: pxrfResponse.trim(), requests: c.requests.map((r) => r.id === openRequest.id ? { ...r, status: "FULFILLED", response: pxrfResponse.trim() } : r), answers: { ...c.answers, [openRequest.from]: { ...c.answers[openRequest.from]!, request: { ...openRequest, status: "FULFILLED", response: pxrfResponse.trim() } } }, history: [...c.history, `pXRF RETURNED · REQUEST ${openRequest.id}`] }));
    setPxrfResponse("");
  };

  const lockReassessment = (expert: ExpertRole) => {
    const current = active.answers[expert];
    if (!current || current.request?.status !== "FULFILLED" || !reassessment.trim()) return;
    update((c) => ({ ...c, answers: { ...c.answers, [expert]: { ...current, reassessment: { text: reassessment.trim(), confidence: reassessmentConfidence, changed } } }, history: [...c.history, `${PEOPLE[expert].mode} REASSESSMENT LOCKED · ${reassessmentConfidence}%${changed ? " · PROBABILITY CHANGED" : " · PROBABILITY UNCHANGED"}`] }));
    setReassessment("");
  };

  return <div className="experimentShell instrumentV4">
    <header className="instrumentMasthead">
      <div><span className="brandName">PROVENANCEOS™</span><span className="brandSub">THE ANDAMOOKA EXPERIMENT</span></div>
      <div className="mastMeta">{active.id} · {active.date} · PHASE ONE</div>
    </header>

    <section className="choosePosition">
      <div className="chooseIntro"><span className="kicker">START HERE</span><h2>Three people. One question.</h2><p>Choose the position you are playing. The evidence stays the same; the responsibility changes.</p></div>
      <div className="peopleRail">
        {(Object.keys(PEOPLE) as Role[]).map((r, i) => <button key={r} className={`personChoice ${role === r ? "selected" : ""}`} onClick={() => setRole(r)}><span className="personNo">0{i + 1}</span><span className="personName">{PEOPLE[r].name}</span><span className="personMode">{PEOPLE[r].mode}</span><span className="personArrow">↗</span></button>)}
      </div>
      <button className="resetCase" onClick={reset}>RESET</button>
    </section>

    <section className="caseTitleBlock">
      <div className="sectionLabel"><span>{active.id}</span><span>FIELD QUESTION</span><span>{bothLocked ? "READINGS SEALED" : "BLIND READINGS OPEN"}</span></div>
      <div className="titleGrid"><div><h1>{active.question}</h1><p>{active.observation}</p></div><div className="phaseRail">{PHASES.map((p, i) => { const activeIndex = PHASES.indexOf(currentPhase); return <div className={`phaseDot ${p === currentPhase ? "current" : ""} ${activeIndex > i ? "passed" : ""}`} key={p}><span>0{i + 1}</span><strong>{p}</strong></div>; })}</div></div>
    </section>

    <section className="evidenceField">
      <div className="evidenceTop"><div><span className="kicker">FIELD EVIDENCE</span><h2>Look before you interpret.</h2></div><div className="pxrfBadge"><span>pXRF</span><strong>{active.pxrf}</strong></div></div>
      <div className="evidencePair">{active.images.map((img) => <figure key={img.src}><div className="photoFrame"><img src={img.src} alt={img.label} /><span>{img.label}</span></div><figcaption>{img.note}</figcaption></figure>)}</div>
    </section>

    <section className="roleBrief"><span className="kicker">YOUR POSITION · {PEOPLE[role].mode}</span><h2>{PEOPLE[role].name}</h2><p>{PEOPLE[role].description}</p></section>

    {role === "MAT" ? <section className="fieldPanel"><div className="panelIndex">01</div><div><span className="kicker">FIELD CONTROL</span><h3>Observation first. Measurement second.</h3><p>The expert must decide what evidence they need. You return the measurement only after both initial judgements are sealed.</p></div><div className="fieldAction">{openRequest ? <><span className="kicker">OPEN REQUEST</span><blockquote>“{openRequest.prompt}”</blockquote>{!bothLocked ? <div className="waiting">WAITING FOR BOTH INITIAL READINGS</div> : <><label className="kicker" htmlFor="pxrf">RETURN pXRF</label><textarea id="pxrf" value={pxrfResponse} onChange={(e) => setPxrfResponse(e.target.value)} placeholder="Paste the supplied measurement." /><button className="primaryAction" onClick={returnEvidence}>RETURN MEASUREMENT <span>→</span></button></>}</> : <div className="waiting">NO OPEN EVIDENCE REQUEST</div>}</div></section> : <section className="expertPanel">
      <div className="expertHeader"><div><span className="kicker">{PEOPLE[role].mode} · INDEPENDENT RESPONSE</span><h3>{PEOPLE[role].name}</h3><p>{PEOPLE[role].title}</p></div><div className={`lockState ${active.answers[role] ? "locked" : ""}`}><span>BLIND</span><strong>{active.answers[role] ? "SEALED" : "OPEN"}</strong></div></div>
      {!active.answers[role] ? <><div className="writingGrid"><label className="bigField"><span>YOUR INTERPRETATION</span><textarea value={answerText} onChange={(e) => setAnswerText(e.target.value)} placeholder="What do you think is happening?" /></label><div className="smallFields"><Field value={basis} setValue={setBasis} label="BASIS / EXPERIENCE" placeholder="What informs your judgement?" /><Field value={uncertainty} setValue={setUncertainty} label="UNCERTAINTY" placeholder="What remains uncertain?" /></div></div><Probability value={confidence} setValue={setConfidence} label="INITIAL PROBABILITY" /><button className="primaryAction" onClick={() => lockInitial(role)}>SEAL MY JUDGEMENT <span>→</span></button></> : <div className="sealedView"><span>INITIAL JUDGEMENT SEALED · {active.answers[role]!.confidence}%</span><blockquote>“{active.answers[role]!.text}”</blockquote><div className="sealedMeta"><div><span>BASIS</span><p>{active.answers[role]!.basis || "Not recorded."}</p></div><div><span>UNCERTAINTY</span><p>{active.answers[role]!.uncertainty || "Not recorded."}</p></div></div></div>}
      {active.answers[role] && !active.answers[role]!.reassessment && <div className="nextStep">{active.answers[role]!.request ? <><span className="kicker">NEXT · EVIDENCE REQUEST</span><h3>{active.answers[role]!.request.status === "FULFILLED" ? "Measurement returned." : "Request is in the field."}</h3><p>{active.answers[role]!.request.prompt}</p></> : <><span className="kicker">NEXT · EVIDENCE REQUEST</span><h3>What do you need to know next?</h3><p>Ask for pXRF only when you can explain how the measurement could change your judgement.</p><textarea value={requestPrompt} onChange={(e) => setRequestPrompt(e.target.value)} placeholder="Why would pXRF help distinguish the possibilities?" /><button className="secondaryAction" onClick={() => requestEvidence(role)}>REQUEST pXRF <span>→</span></button></>}</div>}
      {active.answers[role]?.request?.status === "FULFILLED" && !active.answers[role]?.reassessment && <div className="nextStep"><span className="kicker">THEN · REASSESS</span><h3>What changed?</h3><textarea value={reassessment} onChange={(e) => setReassessment(e.target.value)} placeholder="What does the returned evidence change?" /><Probability value={reassessmentConfidence} setValue={setReassessmentConfidence} label="REVISED PROBABILITY" compact /><label className="checkLine"><input type="checkbox" checked={changed} onChange={(e) => setChanged(e.target.checked)} /> Probability changed</label><button className="secondaryAction" onClick={() => lockReassessment(role)}>SEAL REASSESSMENT <span>→</span></button></div>}
    </section>}

    {bothLocked && <section className="revealPanel"><div className="revealIntro"><span className="kicker">05 · REVEAL</span><h2>The answers meet only now.</h2><p>Two independent readings. One shared record.</p></div><div className="readingGrid">{(["SPOONER", "DANIELLE"] as ExpertRole[]).map((expert, i) => { const a = active.answers[expert]!; return <article key={expert}><span>0{i + 1} · {PEOPLE[expert].mode}</span><h3>{PEOPLE[expert].name}</h3><blockquote>“{a.text}”</blockquote><strong>{a.confidence}%</strong><small>INITIAL PROBABILITY</small>{a.reassessment && <div className="reassessment"><span>REASSESSMENT · {a.reassessment.confidence}%</span><p>{a.reassessment.text}</p><small>{a.reassessment.changed ? "PROBABILITY CHANGED" : "PROBABILITY UNCHANGED"}</small></div>}</article>; })}</div><div className="difference"><span>CONFIDENCE DIFFERENCE</span><strong>{Math.abs(active.answers.SPOONER!.confidence - active.answers.DANIELLE!.confidence)} percentage points</strong></div></section>}

    <section className="historyPanel"><div><span className="kicker">WHAT THE SYSTEM KEEPS</span><h2>The conclusion can move.<br />The history stays.</h2></div><div>{active.history.map((item, i) => <p key={`${item}-${i}`}><span>{String(i + 1).padStart(2, "0")}</span>{item}</p>)}</div></section>
  </div>;
}

function Field({ value, setValue, label, placeholder }: FieldProps) { return <label><span>{label}</span><textarea value={value} onChange={(e) => setValue(e.target.value)} placeholder={placeholder} /></label>; }
function Probability({ value, setValue, label, compact = false }: { value: number; setValue: (value: number) => void; label: string; compact?: boolean }) { return <div className={`probability ${compact ? "compact" : ""}`}><div><span>{label}</span><strong>{value}%</strong></div><input type="range" min={0} max={100} value={value} onChange={(e) => setValue(Number(e.target.value))} /><small>Probability, not certainty.</small></div>; }
