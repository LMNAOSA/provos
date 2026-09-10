"use client";

import { useEffect, useMemo, useState } from "react";

type Role = "MAT" | "SPOONER" | "DANIELLE";
type ExpertRole = Exclude<Role, "MAT">;
type Request = { id: string; from: ExpertRole; prompt: string; response?: string; status: "OPEN" | "FULFILLED" };
type Reassessment = { text: string; confidence: number; changed: boolean };
type Answer = { text: string; basis: string; uncertainty: string; confidence: number; request?: Request; reassessment?: Reassessment };
type CaseImage = { src: string; label: string; note: string };
type Case = { id: string; date: string; question: string; observation: string; images: CaseImage[]; pxrf: string; answers: Partial<Record<ExpertRole, Answer>>; requests: Request[]; history: string[] };

const STORAGE = "provenanceos-cases";
const PEOPLE: Record<Role, { name: string; title: string; tag: string }> = {
  MAT: { name: "Matt Kathagen", title: "Mooka Boys · Field / Mining", tag: "FIELD" },
  SPOONER: { name: "Professor Nigel Spooner", title: "Professor of Radiation Physics and Luminescence", tag: "SCIENCE" },
  DANIELLE: { name: "Danielle Questiaux", title: "Research Assistant and Alpha Spectroscopy Analyst, University of Adelaide", tag: "ANALYSIS" },
};

const DEMO: Case = {
  id: "CASE 001",
  date: "08 SEP 2026",
  question: "Why is this hard matrix phosphorescing so much?",
  observation: "Field observation supplied by Matt. Visible afterglow was observed after 365 nm UV exposure, persisting for approximately 7 seconds.",
  images: [
    { src: "/images/case001_uv.jpg", label: "365 NM UV", note: "Hard matrix under UV excitation · visible afterglow observed for ~7 seconds" },
    { src: "/images/case001_normal.jpg", label: "NORMAL LIGHT", note: "Same material under ordinary light" },
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
    const out = parsed.length ? parsed : [DEMO];
    const normalized = out.map((c) => c.id === DEMO.id ? { ...DEMO, ...c, question: DEMO.question, observation: DEMO.observation, images: DEMO.images, pxrf: c.pxrf || DEMO.pxrf, answers: c.answers || {}, requests: c.requests || [], history: c.history?.length ? c.history : DEMO.history } : c);
    return normalized.some((c) => c.id === DEMO.id) ? normalized : [DEMO, ...normalized];
  } catch { return [DEMO]; }
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

  useEffect(() => { setCases(hydrate(localStorage.getItem(STORAGE))); }, []);

  const active = useMemo(() => cases.find((c) => c.id === "CASE 001") || DEMO, [cases]);
  const bothLocked = Boolean(active.answers.SPOONER && active.answers.DANIELLE);
  const openRequest = active.requests.find((r) => r.status === "OPEN");

  const update = (fn: (c: Case) => Case) => {
    const next = cases.map((c) => c.id === "CASE 001" ? fn(c) : c);
    setCases(next);
    localStorage.setItem(STORAGE, JSON.stringify(next));
  };

  const lockInitial = (expert: ExpertRole) => {
    if (!answerText.trim()) return;
    const answer: Answer = { text: answerText.trim(), basis: basis.trim(), uncertainty: uncertainty.trim(), confidence };
    update((c) => ({ ...c, answers: { ...c.answers, [expert]: answer }, history: [...c.history, `${PEOPLE[expert].tag} INITIAL JUDGEMENT LOCKED · ${confidence}%`] }));
    setAnswerText(""); setBasis(""); setUncertainty("");
  };

  const requestEvidence = (expert: ExpertRole) => {
    const prompt = requestPrompt.trim();
    if (!prompt) return;
    const request: Request = { id: `PXRF-${Date.now()}`, from: expert, prompt, status: "OPEN" };
    update((c) => ({ ...c, answers: { ...c.answers, [expert]: { ...c.answers[expert]!, request } }, requests: [...c.requests, request], history: [...c.history, `${PEOPLE[expert].tag} REQUESTED pXRF DATA · ${prompt}`] }));
    setRequestPrompt("");
  };

  const returnEvidence = () => {
    if (!bothLocked || !pxrfResponse.trim() || !openRequest) return;
    update((c) => ({ ...c, pxrf: pxrfResponse.trim(), requests: c.requests.map((r) => r.id === openRequest.id ? { ...r, status: "FULFILLED", response: pxrfResponse.trim() } : r), answers: { ...c.answers, [openRequest.from]: { ...c.answers[openRequest.from]!, request: { ...openRequest, status: "FULFILLED", response: pxrfResponse.trim() } } }, history: [...c.history, `pXRF RETURNED · REQUEST ${openRequest.id}`] }));
    setPxrfResponse("");
  };

  const lockReassessment = (expert: ExpertRole) => {
    const current = active.answers[expert];
    if (!current || current.request?.status !== "FULFILLED" || !reassessment.trim()) return;
    update((c) => ({ ...c, answers: { ...c.answers, [expert]: { ...current, reassessment: { text: reassessment.trim(), confidence: reassessmentConfidence, changed } } }, history: [...c.history, `${PEOPLE[expert].tag} REASSESSMENT LOCKED · ${reassessmentConfidence}%${changed ? " · PROBABILITY CHANGED" : " · PROBABILITY UNCHANGED"}`] }));
    setReassessment("");
  };

  return <div className="experimentShell">
    <header className="experimentHeader"><div className="experimentIdentity"><span className="eyebrow">PROVENANCEOS™ · LIVING CASE</span><h1>{active.id}</h1><p>One question. Independent readings. Evidence only when requested.</p></div></header>

    <section className="caseStrip"><div><span>CASE</span><strong>{active.id}</strong></div><div><span>DATE</span><strong>{active.date}</strong></div><div><span>STATE</span><strong>{bothLocked ? "INITIAL READINGS SEALED" : "AWAITING INDEPENDENT READINGS"}</strong></div></section>

    <section className="participantBar" aria-label="Choose demo participant">
      <div className="participantPrompt"><span className="kicker">WHO IS USING THE DEMO?</span><p>Choose a role to experience the same case from a different perspective.</p></div>
      <div className="participantOptions">
        {(Object.keys(PEOPLE) as Role[]).map((r) => <button key={r} className={role === r ? "active" : ""} onClick={() => setRole(r)}><span>{PEOPLE[r].name}</span><small>{r === "MAT" ? "FIELD" : r === "SPOONER" ? "SCIENCE" : "ANALYSIS"}</small></button>)}
      </div>
    </section>

    <section className="questionBlock"><div className="questionLabelRow"><span className="kicker">FIELD QUESTION · CASE 001</span><span className="caseRef">REAL FIELD OBSERVATION</span></div><h2>{active.question}</h2><p className="observationCopy">{active.observation}</p><div className="case001Images">{active.images.map((img) => <figure className="case001Image" key={img.src}><div className="imageFrame"><img className="fieldImage" src={img.src} alt={img.label} /></div><figcaption><span>{img.label}</span><small>{img.note}</small></figcaption></figure>)}</div><div className="pxrfState"><span>pXRF DATA</span><strong>{active.pxrf}</strong></div></section>

    {role === "MAT" ? <section className="matWaiting"><span className="kicker">FIELD · MATT KATHAGEN</span><h3>Watch the blind readings take shape.</h3><p>The field role supplies the observation and returns measurement data only after both independent initial judgements are sealed.</p>{openRequest ? <><div className="requestQuote">“{openRequest.prompt}”</div>{!bothLocked ? <div className="waitingMark">WAITING FOR THE SECOND INITIAL READING</div> : <><label className="kicker" htmlFor="pxrf">RETURN pXRF MEASUREMENT</label><textarea id="pxrf" value={pxrfResponse} onChange={(e) => setPxrfResponse(e.target.value)} placeholder="Enter the returned measurement exactly as supplied." /><button className="loginBtn" onClick={returnEvidence}>RETURN pXRF DATA <span>→</span></button></>}</> : <div className="waitingMark">NO OPEN EVIDENCE REQUEST</div>}</section> : <section className="workflowStack">
      <section className="expertResponse"><div className="responseHead"><div><span className="kicker">{PEOPLE[role].tag} · INDEPENDENT RESPONSE</span><h3>{PEOPLE[role].name}</h3><p>{PEOPLE[role].title}</p></div><div className="blindLock">SEALED<br /><small>OTHER RESPONSE HIDDEN</small></div></div>
        {!active.answers[role] ? <><div className="captureGrid"><label>INTERPRETATION<textarea value={answerText} onChange={(e) => setAnswerText(e.target.value)} placeholder="What do you think is happening?" /></label><label>BASIS / EXPERIENCE<textarea value={basis} onChange={(e) => setBasis(e.target.value)} placeholder="What informs your judgement?" /></label><label>UNCERTAINTY<textarea value={uncertainty} onChange={(e) => setUncertainty(e.target.value)} placeholder="What remains uncertain?" /></label></div><Confidence value={confidence} setValue={setConfidence} label="INITIAL PROBABILITY" /><button className="loginBtn" onClick={() => lockInitial(role)}>LOCK INITIAL JUDGEMENT <span>→</span></button></> : <div className="lockedResponse"><span>INITIAL JUDGEMENT LOCKED · {active.answers[role]!.confidence}%</span><blockquote>“{active.answers[role]!.text}”</blockquote><div className="lockedGrid"><div><small>BASIS</small><p>{active.answers[role]!.basis || "Not recorded."}</p></div><div><small>UNCERTAINTY</small><p>{active.answers[role]!.uncertainty || "Not recorded."}</p></div></div></div>}
      </section>
      {active.answers[role] && !active.answers[role]!.reassessment && <section className="evidenceRequest"><span className="kicker">EVIDENCE REQUEST</span><h3>Would pXRF materially change the judgement?</h3><p>Request the measurement only when you can explain why it could discriminate between plausible mechanisms.</p>{active.answers[role]!.request ? <div className="requestState"><strong>{active.answers[role]!.request!.status === "FULFILLED" ? "pXRF DATA RETURNED" : "pXRF REQUEST SENT"}</strong><p>{active.answers[role]!.request!.prompt}</p>{active.answers[role]!.request!.status === "FULFILLED" && <small>Reassess below. The original judgement remains intact.</small>}</div> : <><textarea value={requestPrompt} onChange={(e) => setRequestPrompt(e.target.value)} placeholder="Why would pXRF help distinguish the mechanisms?" /><button className="btn accent wide" onClick={() => requestEvidence(role)}>REQUEST pXRF DATA <span>→</span></button></>}</section>}
      {active.answers[role]?.request?.status === "FULFILLED" && !active.answers[role]?.reassessment && <section className="evidenceRequest"><span className="kicker">REASSESSMENT</span><h3>What changed?</h3><textarea value={reassessment} onChange={(e) => setReassessment(e.target.value)} placeholder="What does the new evidence change?" /><Confidence value={reassessmentConfidence} setValue={setReassessmentConfidence} label="REVISED PROBABILITY" /><label className="changeToggle"><input type="checkbox" checked={changed} onChange={(e) => setChanged(e.target.checked)} /> Probability changed</label><button className="loginBtn" onClick={() => lockReassessment(role)}>LOCK REASSESSMENT <span>→</span></button></section>}
    </section>}

    {bothLocked && <Reveal active={active} />}
    <History active={active} />
  </div>;
}

function Confidence({ value, setValue, label }: { value: number; setValue: (value: number) => void; label: string }) { return <div className="confidence"><div className="confidenceHeader"><span>{label}</span><strong>{value}%</strong></div><input type="range" min={0} max={100} step={1} value={value} onChange={(e) => setValue(Number(e.target.value))} /><small>Probability, not certainty. The number can move when evidence arrives.</small></div>; }
function Reveal({ active }: { active: Case }) { const spooner = active.answers.SPOONER!; const danielle = active.answers.DANIELLE!; const delta = Math.abs(spooner.confidence - danielle.confidence); return <section className="reveal"><span className="kicker">REVEAL · DISAGREEMENT IS DATA</span><h2>Two independent readings.</h2><p>Only now do the sealed responses meet.</p><div className="revealGrid"><article><span>SCIENCE</span><h3>{PEOPLE.SPOONER.name}</h3><blockquote>“{spooner.text}”</blockquote><strong>{spooner.confidence}%</strong><small>INITIAL PROBABILITY</small>{spooner.reassessment && <div className="reassessmentRecord"><span>REASSESSMENT · {spooner.reassessment.confidence}%</span><p>{spooner.reassessment.text}</p></div>}</article><article><span>ANALYSIS</span><h3>{PEOPLE.DANIELLE.name}</h3><blockquote>“{danielle.text}”</blockquote><strong>{danielle.confidence}%</strong><small>INITIAL PROBABILITY</small>{danielle.reassessment && <div className="reassessmentRecord"><span>REASSESSMENT · {danielle.reassessment.confidence}%</span><p>{danielle.reassessment.text}</p></div>}</article></div><div className="disagreement"><span>CONFIDENCE DIFFERENCE</span><strong>{delta} percentage points</strong></div></section>; }
function History({ active }: { active: Case }) { return <section className="history"><span className="kicker">EVENT HISTORY</span><div>{active.history.map((item, i) => <p key={`${item}-${i}`}><span>{String(i + 1).padStart(2, "0")}</span><span>{item}</span></p>)}</div></section>; }
