"use client";

import { ChangeEvent, useState } from "react";

type Role = "MAT" | "SPOONER" | "DANIELLE";
type ExpertRole = Exclude<Role, "MAT">;
type Request = { id: string; from: ExpertRole; prompt: string; response?: string; status: "OPEN" | "FULFILLED" };
type Answer = { text: string; basis: string; uncertainty: string; confidence: number; request?: Request; reassessment?: { text: string; confidence: number; changed: boolean } };
type CaseImage = { src: string; label: string; note: string };
type Case = { id: string; date: string; question: string; observation: string; image?: string; images?: CaseImage[]; pxrf: string; answers: Partial<Record<ExpertRole, Answer>>; requests: Request[]; history: string[] };

type ExpertPaneProps = {
  role: ExpertRole; answer?: Answer; answerText: string; setAnswerText: (value: string) => void; basis: string; setBasis: (value: string) => void;
  uncertainty: string; setUncertainty: (value: string) => void; confidence: number; setConfidence: (value: number) => void; lock: () => void;
  myRequest?: Request; requestPrompt: string; setRequestPrompt: (value: string) => void; requestPxrf: () => void; reassessment: string;
  setReassessment: (value: string) => void; reassessmentConfidence: number; setReassessmentConfidence: (value: number) => void;
  changed: boolean; setChanged: (value: boolean) => void; lockReassessment: () => void;
};

type MattPaneProps = { openRequest?: Request; pxrfResponse: string; setPxrfResponse: (value: string) => void; returnPxrf: () => void };

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
    { src: "/images/case001-365nm-uv.jpg", label: "365 NM UV", note: "Hard matrix under UV excitation · visible afterglow observed for ~7 seconds" },
    { src: "/images/case001-normal-light.jpg", label: "NORMAL LIGHT", note: "Same material under ordinary light" },
  ],
  pxrf: "NO XRF DATA SUPPLIED",
  answers: {},
  requests: [],
  history: ["CASE CREATED · FIELD OBSERVATION", "QUESTION LOCKED · SENT TO EXPERTS", "pXRF STATUS · NO DATA SUPPLIED"],
};

function withDemoAssets(c: Case): Case {
  if (c.id !== "CASE 001") return c;
  return { ...DEMO, ...c, question: DEMO.question, observation: DEMO.observation, images: DEMO.images, pxrf: c.pxrf || DEMO.pxrf, answers: c.answers || {}, requests: c.requests || [], history: c.history?.length ? c.history : DEMO.history };
}

function readCases(): Case[] {
  if (typeof window === "undefined") return [DEMO];
  try {
    const raw = localStorage.getItem("provenanceos-cases");
    if (!raw) return [DEMO];
    const parsed = JSON.parse(raw) as Case[];
    const cases = parsed.map(withDemoAssets);
    if (!cases.some((c) => c.id === "CASE 001")) return [DEMO, ...cases];
    return cases;
  } catch { return [DEMO]; }
}

function readImage(e: ChangeEvent<HTMLInputElement>, setter: (value: string) => void) {
  const file = e.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => setter(String(reader.result || ""));
  reader.readAsDataURL(file);
}

export function KnowledgeExperiment() {
  const [role, setRole] = useState<Role>("MAT");
  const [cases, setCases] = useState<Case[]>(readCases);
  const [activeId, setActiveId] = useState("CASE 001");
  const active = cases.find((c) => c.id === activeId) || cases[0] || DEMO;
  const [question, setQuestion] = useState("");
  const [observation, setObservation] = useState("");
  const [image, setImage] = useState("");
  const [answerText, setAnswerText] = useState("");
  const [basis, setBasis] = useState("");
  const [uncertainty, setUncertainty] = useState("");
  const [confidence, setConfidence] = useState(50);
  const [requestPrompt, setRequestPrompt] = useState("");
  const [reassessment, setReassessment] = useState("");
  const [reassessmentConfidence, setReassessmentConfidence] = useState(50);
  const [changed, setChanged] = useState(false);
  const [pxrfResponse, setPxrfResponse] = useState("");
  const [showNewCase, setShowNewCase] = useState(false);

  const updateCase = (fn: (c: Case) => Case) => setCases((prev) => {
    const next = prev.map((c) => (c.id === activeId ? fn(c) : c));
    localStorage.setItem("provenanceos-cases", JSON.stringify(next));
    return next;
  });

  const create = () => {
    const c: Case = {
      id: `CASE ${String(cases.length + 1).padStart(3, "0")}`,
      date: new Date().toLocaleDateString("en-AU", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase(),
      question: question.trim() || "Untitled field question",
      observation: observation.trim() || "Field observation supplied by Matt",
      image: image || undefined,
      pxrf: "NO XRF DATA SUPPLIED",
      answers: {},
      requests: [],
      history: ["CASE CREATED · FIELD OBSERVATION", "QUESTION LOCKED · SENT TO EXPERTS", "pXRF STATUS · NO DATA SUPPLIED"],
    };
    setCases((prev) => { const next = [...prev, c]; localStorage.setItem("provenanceos-cases", JSON.stringify(next)); return next; });
    setActiveId(c.id); setQuestion(""); setObservation(""); setImage(""); setShowNewCase(false);
  };

  const lock = (expert: ExpertRole) => {
    if (!answerText.trim()) return;
    const answer: Answer = { text: answerText.trim(), basis: basis.trim(), uncertainty: uncertainty.trim(), confidence };
    updateCase((c) => ({ ...c, answers: { ...c.answers, [expert]: answer }, history: [...c.history, `${PEOPLE[expert].tag} INITIAL JUDGEMENT LOCKED · ${confidence}%`] }));
    setAnswerText(""); setBasis(""); setUncertainty("");
  };

  const requestPxrf = (expert: ExpertRole) => {
    const prompt = requestPrompt.trim() || "pXRF requested to test the current judgement";
    const request: Request = { id: `PXRF-${Date.now()}`, from: expert, prompt, status: "OPEN" };
    updateCase((c) => ({ ...c, answers: { ...c.answers, [expert]: { ...c.answers[expert]!, request } }, requests: [...c.requests, request], history: [...c.history, `${PEOPLE[expert].tag} REQUESTED pXRF DATA · ${prompt}`] }));
    setRequestPrompt("");
  };

  const returnPxrf = () => {
    if (!pxrfResponse.trim()) return;
    const req = active.requests.find((r) => r.status === "OPEN");
    const bothLocked = Boolean(active.answers.SPOONER && active.answers.DANIELLE);
    if (!req || !bothLocked) return;
    updateCase((c) => ({
      ...c,
      pxrf: pxrfResponse.trim(),
      requests: c.requests.map((r) => r.id === req.id ? { ...r, status: "FULFILLED", response: pxrfResponse.trim() } : r),
      answers: { ...c.answers, [req.from]: { ...c.answers[req.from]!, request: { ...req, status: "FULFILLED", response: pxrfResponse.trim() } } },
      history: [...c.history, `pXRF RETURNED · REQUEST ${req.id}`],
    }));
    setPxrfResponse("");
  };

  const lockReassessment = (expert: ExpertRole) => {
    const current = active.answers[expert];
    if (!current || !reassessment.trim()) return;
    updateCase((c) => ({ ...c, answers: { ...c.answers, [expert]: { ...current, reassessment: { text: reassessment.trim(), confidence: reassessmentConfidence, changed } } }, history: [...c.history, `${PEOPLE[expert].tag} REASSESSMENT LOCKED · ${reassessmentConfidence}%${changed ? " · PROBABILITY CHANGED" : " · PROBABILITY UNCHANGED"}`] }));
    setReassessment("");
  };

  const bothLocked = Boolean(active.answers.SPOONER && active.answers.DANIELLE);
  const openRequest = active.requests.find((r) => r.status === "OPEN");

  return <div className="experimentShell">
    <header className="experimentHeader">
      <div className="experimentIdentity"><span className="eyebrow">PROVENANCEOS™ · LIVING CASE</span><h1>{active.id}</h1><p>One question. Independent readings. Evidence only when requested.</p></div>
      <div className="roleSwitch" aria-label="Demo participant"><span className="roleLabel">DEMO PARTICIPANT</span>{(["MAT", "SPOONER", "DANIELLE"] as Role[]).map((r) => <button key={r} className={role === r ? "active" : ""} onClick={() => setRole(r)}>{PEOPLE[r].tag}</button>)}</div>
    </header>
    <main>
      <section className="caseStrip"><div><span>CASE</span><strong>{active.id}</strong></div><div><span>DATE</span><strong>{active.date}</strong></div><div><span>STATE</span><strong>{bothLocked ? "INITIAL READINGS SEALED" : "AWAITING INDEPENDENT READINGS"}</strong></div></section>
      <section className="questionBlock">
        <div className="questionLabelRow"><span className="kicker">FIELD QUESTION · CASE 001</span><span className="caseRef">REAL FIELD OBSERVATION</span></div>
        <h2>{active.question}</h2><p className="observationCopy">{active.observation}</p>
        {active.images?.length ? <div className="case001Images">{active.images.map((img) => <figure key={img.src} className="case001Image"><div className="imageFrame"><img className="fieldImage" src={img.src} alt={img.label} /></div><figcaption><span>{img.label}</span><small>{img.note}</small></figcaption></figure>)}</div> : active.image ? <div className="singleEvidenceImage"><img className="fieldImage" src={active.image} alt="Field observation" /></div> : <div className="fieldImagePlaceholder"><span>FIELD PHOTOGRAPH</span><strong>Supplied by Matt</strong></div>}
        <div className="pxrfState"><span>pXRF DATA</span><strong>{active.pxrf}</strong></div>
      </section>
      {role === "MAT" ? <><section className="caseControlBar"><div><span className="kicker">FIELD CONTROL</span><h3>Case 001 is already in motion.</h3><p>For the presentation, keep this case intact. New field cases can be added without interrupting the experiment.</p></div><button className="quietAction" onClick={() => setShowNewCase((value) => !value)}>{showNewCase ? "CLOSE CASE CREATOR" : "ADD A NEW CASE"}<span>→</span></button></section>{showNewCase && <NewQuestion question={question} setQuestion={setQuestion} observation={observation} setObservation={setObservation} image={image} setImage={setImage} create={create} />}<MattPane openRequest={openRequest} pxrfResponse={pxrfResponse} setPxrfResponse={setPxrfResponse} returnPxrf={returnPxrf} canReturn={bothLocked} /></> : <ExpertPane role={role} answer={active.answers[role]} answerText={answerText} setAnswerText={setAnswerText} basis={basis} setBasis={setBasis} uncertainty={uncertainty} setUncertainty={setUncertainty} confidence={confidence} setConfidence={setConfidence} lock={() => lock(role)} myRequest={active.answers[role]?.request} requestPrompt={requestPrompt} setRequestPrompt={setRequestPrompt} requestPxrf={() => requestPxrf(role)} reassessment={reassessment} setReassessment={setReassessment} reassessmentConfidence={reassessmentConfidence} setReassessmentConfidence={setReassessmentConfidence} changed={changed} setChanged={setChanged} lockReassessment={() => lockReassessment(role)} canRequestPxrf={bothLocked} />}
      {bothLocked && <Reveal active={active} />}<History active={active} />
    </main>
  </div>;
}

function NewQuestion({ question, setQuestion, observation, setObservation, image, setImage, create }: any) { return <section className="newQuestion"><div className="newQuestionIntro"><span className="kicker">FIELD CONTROL · NEW CASE</span><h2>Bring another field question into the record.</h2><p>Only use this when demonstrating how a new observation enters the system.</p></div><div className="newQuestionForm"><label>PHOTOGRAPH<input type="file" accept="image/*" onChange={(e: ChangeEvent<HTMLInputElement>) => readImage(e, setImage)} /></label>{image && <img className="uploadPreview" src={image} alt="Field photograph preview" />}<label>QUESTION<textarea value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Enter the field question" /></label><label>FIELD OBSERVATION<textarea value={observation} onChange={(e) => setObservation(e.target.value)} placeholder="What was observed?" /></label><div className="newPxrf"><span>pXRF</span><strong>NO DATA SUPPLIED</strong><small>Measurement stays withheld until an expert explains why it would help.</small></div><button className="loginBtn" onClick={create}>LOCK QUESTION &amp; SEND TO EXPERTS <span>→</span></button></div></section>; }

function ExpertPane(p: ExpertPaneProps & { canRequestPxrf: boolean }) { return <div className="workflowStack"><section className="expertResponse"><div className="responseHead"><div><span className="kicker">{PEOPLE[p.role].tag} · INDEPENDENT RESPONSE</span><h3>{PEOPLE[p.role].name}</h3><p>{PEOPLE[p.role].title}</p></div><div className="blindLock">BLIND READING<br /><small>OTHER RESPONSE HIDDEN</small></div></div>{!p.answer ? <><div className="captureGrid"><label>INTERPRETATION<textarea value={p.answerText} onChange={(e) => p.setAnswerText(e.target.value)} placeholder="What do you think is happening?" /></label><label>BASIS / EXPERIENCE<textarea value={p.basis} onChange={(e) => p.setBasis(e.target.value)} placeholder="What informs the judgement?" /></label><label>UNCERTAINTY<textarea value={p.uncertainty} onChange={(e) => p.setUncertainty(e.target.value)} placeholder="What remains uncertain?" /></label></div><Confidence value={p.confidence} setValue={p.setConfidence} label="INITIAL PROBABILITY" /><button className="loginBtn" onClick={p.lock}>LOCK INITIAL JUDGEMENT <span>→</span></button></> : <div className="lockedResponse"><span>INITIAL JUDGEMENT LOCKED · {p.answer.confidence}%</span><blockquote>“{p.answer.text}”</blockquote><div className="lockedGrid"><div><small>BASIS</small><p>{p.answer.basis || "Not recorded."}</p></div><div><small>UNCERTAINTY</small><p>{p.answer.uncertainty || "Not recorded."}</p></div></div></div>}</section>{p.answer && <section className="evidenceRequest"><span className="kicker">NEXT EVIDENCE</span><h3>What would help you decide?</h3><p>Request pXRF only after both independent readings are sealed and you can explain why the measurement could discriminate between possibilities.</p>{p.myRequest ? <div className="requestState"><strong>{p.myRequest.status === "FULFILLED" ? "pXRF DATA RETURNED" : "pXRF REQUEST SENT"}</strong><p>{p.myRequest.prompt}</p>{p.myRequest.status === "FULFILLED" && <small>The initial judgement remains intact. Reassess below.</small>}</div> : <><textarea value={p.requestPrompt} disabled={!p.canRequestPxrf} onChange={(e) => p.setRequestPrompt(e.target.value)} placeholder={p.canRequestPxrf ? "Why would pXRF help?" : "Both initial readings must be sealed first."} /><button className="btn accent wide" disabled={!p.canRequestPxrf} onClick={p.requestPxrf}>REQUEST pXRF DATA <span>→</span></button></>}</section>}{p.answer && p.myRequest?.status === "FULFILLED" && <section className="evidenceRequest reassessmentSection"><span className="kicker">REASSESSMENT</span><h3>What changed?</h3><textarea value={p.reassessment} onChange={(e) => p.setReassessment(e.target.value)} placeholder="What does the returned evidence change?" /><Confidence value={p.reassessmentConfidence} setValue={p.setReassessmentConfidence} label="REVISED PROBABILITY" /><label className="changeToggle"><input type="checkbox" checked={p.changed} onChange={(e) => p.setChanged(e.target.checked)} /> Probability changed</label><button className="btn accent wide" onClick={p.lockReassessment}>LOCK REASSESSMENT <span>→</span></button></section>}</div>; }

function MattPane(p: MattPaneProps & { canReturn: boolean }) { if (!p.openRequest) return <section className="matWaiting"><span className="kicker">FIELD CONTROL · pXRF</span><h3>No evidence request yet.</h3><p>Matt receives a measurement request only after the independent readings are sealed.</p><div className="waitingMark">pXRF · {p.canReturn ? "READY WHEN REQUESTED" : "AWAITING BOTH INITIAL READINGS"}</div></section>; return <section className="matWaiting"><span className="kicker">FIELD CONTROL · pXRF REQUEST</span><h3>Return the requested evidence.</h3><p>Keep the measurement factual. The expert's original judgement cannot be edited.</p><blockquote className="requestQuote">“{p.openRequest.prompt}”</blockquote><textarea value={p.pxrfResponse} disabled={!p.canReturn} onChange={(e) => p.setPxrfResponse(e.target.value)} placeholder={p.canReturn ? "Enter authenticated pXRF result" : "Waiting for both initial readings to be sealed"} /><button className="btn accent wide" disabled={!p.canReturn} onClick={p.returnPxrf}>RETURN pXRF EVIDENCE <span>→</span></button></section>; }

function Confidence({ value, setValue, label }: { value: number; setValue: (value: number) => void; label: string }) { return <div className="confidence"><div className="confidenceHeader"><span>{label}</span><strong>{value}%</strong></div><input aria-label={label} type="range" min={0} max={100} value={value} onChange={(e) => setValue(Number(e.target.value))} /><small>Record confidence as a judgement, not a fact.</small></div>; }

function Reveal({ active }: { active: Case }) { const spooner = active.answers.SPOONER; const danielle = active.answers.DANIELLE; if (!spooner || !danielle) return null; const gap = Math.abs(spooner.confidence - danielle.confidence); return <section className="reveal"><span className="kicker">REVEAL · AFTER INITIAL LOCK</span><h2>Now the readings can meet.</h2><p>The independent interpretations are revealed only after both initial judgements were sealed.</p><div className="revealGrid">{[{ key: "SPOONER", data: spooner }, { key: "DANIELLE", data: danielle }].map(({ key, data }) => <article key={key}><span>{PEOPLE[key as ExpertRole].tag}</span><h3>{PEOPLE[key as ExpertRole].name}</h3><blockquote>“{data.text}”</blockquote><strong>{data.confidence}%</strong><small>INITIAL PROBABILITY</small>{data.reassessment && <div className="reassessmentRecord"><span>AFTER pXRF · {data.reassessment.confidence}% · {data.reassessment.changed ? "CHANGED" : "UNCHANGED"}</span><p>{data.reassessment.text}</p></div>}</article>)}</div><div className="disagreement"><span>DISAGREEMENT IS DATA</span><strong>{gap}% confidence difference at first lock</strong></div></section>; }

function History({ active }: { active: Case }) { return <section className="history"><span className="kicker">PROVENANCE HISTORY</span><div>{active.history.map((item, i) => <p key={`${item}-${i}`}><span>{String(i + 1).padStart(2, "0")}</span>{item}</p>)}</div></section>; }
