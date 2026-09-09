"use client";

import { ChangeEvent, useState } from "react";

type Role = "MAT" | "SPOONER" | "DANIELLE";
type ExpertRole = Exclude<Role, "MAT">;
type Request = { id: string; from: ExpertRole; prompt: string; response?: string; status: "OPEN" | "FULFILLED" };
type Answer = { text: string; basis: string; uncertainty: string; confidence: number; request?: Request; reassessment?: { text: string; confidence: number; changed: boolean } };
type Case = { id: string; date: string; question: string; observation: string; image?: string; pxrf: string; answers: Partial<Record<ExpertRole, Answer>>; requests: Request[]; history: string[] };

type ExpertPaneProps = {
  role: ExpertRole; answer?: Answer; answerText: string; setAnswerText: (value: string) => void; basis: string; setBasis: (value: string) => void; uncertainty: string; setUncertainty: (value: string) => void; confidence: number; setConfidence: (value: number) => void; lock: () => void; myRequest?: Request; requestPrompt: string; setRequestPrompt: (value: string) => void; requestPxrf: () => void; reassessment: string; setReassessment: (value: string) => void; reassessmentConfidence: number; setReassessmentConfidence: (value: number) => void; changed: boolean; setChanged: (value: boolean) => void; lockReassessment: () => void;
};

type MattPaneProps = { openRequest?: Request; pxrfResponse: string; setPxrfResponse: (value: string) => void; returnPxrf: () => void };

const PEOPLE: Record<Role, { name: string; title: string; tag: string }> = {
  MAT: { name: "Matt Kathagen", title: "Mooka Boys · Field / Mining", tag: "FIELD" },
  SPOONER: { name: "Professor Nigel Spooner", title: "Professor of Radiation Physics and Luminescence", tag: "SCIENCE" },
  DANIELLE: { name: "Danielle Questiaux", title: "Research Assistant and Alpha Spectroscopy Analyst, University of Adelaide", tag: "ANALYSIS" },
};

const DEMO: Case = {
  id: "CASE 001", date: "08 SEP 2026", question: "Why is this hard matrix phosphorescing so much?", observation: "Field observation · photograph supplied by Matt", pxrf: "NO XRF DATA SUPPLIED", answers: {}, requests: [], history: ["CASE CREATED · FIELD OBSERVATION", "QUESTION LOCKED · SENT TO EXPERTS", "pXRF STATUS · NO XRF DATA SUPPLIED"],
};

function readCases(): Case[] {
  if (typeof window === "undefined") return [DEMO];
  try {
    const raw = localStorage.getItem("provenanceos-cases");
    return raw ? JSON.parse(raw) : [DEMO];
  } catch {
    return [DEMO];
  }
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
  const active = cases.find(c => c.id === activeId) || cases[0];
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

  const updateCase = (fn: (c: Case) => Case) => setCases(prev => {
    const next = prev.map(c => c.id === activeId ? fn(c) : c);
    localStorage.setItem("provenanceos-cases", JSON.stringify(next));
    return next;
  });

  const create = () => {
    const c: Case = { id: `CASE ${String(cases.length + 1).padStart(3, "0")}`, date: new Date().toLocaleDateString("en-AU", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase(), question: question.trim() || "Why is this hard matrix phosphorescing so much?", observation: observation.trim() || "Field observation · photograph supplied by Matt", image, pxrf: "NO XRF DATA SUPPLIED", answers: {}, requests: [], history: ["CASE CREATED · FIELD OBSERVATION", "QUESTION LOCKED · SENT TO EXPERTS", "pXRF STATUS · NO XRF DATA SUPPLIED"] };
    setCases(prev => { const next = [...prev, c]; localStorage.setItem("provenanceos-cases", JSON.stringify(next)); return next; });
    setActiveId(c.id); setQuestion(""); setObservation(""); setImage("");
  };

  const lock = (expert: ExpertRole) => {
    if (!answerText.trim()) return;
    const answer: Answer = { text: answerText.trim(), basis: basis.trim(), uncertainty: uncertainty.trim(), confidence };
    updateCase(c => ({ ...c, answers: { ...c.answers, [expert]: answer }, history: [...c.history, `${PEOPLE[expert].tag} INITIAL JUDGEMENT LOCKED · ${confidence}%`] }));
    setAnswerText(""); setBasis(""); setUncertainty("");
  };

  const requestPxrf = (expert: ExpertRole) => {
    const prompt = requestPrompt.trim() || "pXRF data requested to test or refine the current judgement";
    const request: Request = { id: `PXRF-${Date.now()}`, from: expert, prompt, status: "OPEN" };
    updateCase(c => ({ ...c, answers: { ...c.answers, [expert]: { ...c.answers[expert]!, request } }, requests: [...c.requests, request], history: [...c.history, `${PEOPLE[expert].tag} REQUESTED pXRF DATA · ${prompt}`] }));
    setRequestPrompt("");
  };

  const returnPxrf = () => {
    if (!pxrfResponse.trim()) return;
    const req = active.requests.find(r => r.status === "OPEN");
    if (!req) return;
    updateCase(c => ({ ...c, pxrf: pxrfResponse.trim(), requests: c.requests.map(r => r.id === req.id ? { ...r, status: "FULFILLED", response: pxrfResponse.trim() } : r), answers: { ...c.answers, [req.from]: { ...c.answers[req.from]!, request: { ...req, status: "FULFILLED", response: pxrfResponse.trim() } } }, history: [...c.history, `pXRF RETURNED · REQUEST ${req.id}`] }));
    setPxrfResponse("");
  };

  const lockReassessment = (expert: ExpertRole) => {
    const current = active.answers[expert];
    if (!current || !reassessment.trim()) return;
    const nextAnswer: Answer = { ...current, reassessment: { text: reassessment.trim(), confidence: reassessmentConfidence, changed } };
    updateCase(c => ({ ...c, answers: { ...c.answers, [expert]: nextAnswer }, history: [...c.history, `${PEOPLE[expert].tag} REASSESSMENT LOCKED · ${reassessmentConfidence}%${changed ? " · PROBABILITY CHANGED" : " · PROBABILITY UNCHANGED"}`] }));
    setReassessment("");
  };

  const bothLocked = Boolean(active.answers.SPOONER && active.answers.DANIELLE);
  const openRequest = active.requests.find(r => r.status === "OPEN");

  return <div className="experimentShell">
    <header className="experimentHeader">
      <div><span className="eyebrow">PROVENANCEOS™ · LIVE CASE</span><h1>CASE 001</h1><p>One question. Independent readings. Evidence only when requested.</p></div>
      <div className="roleSwitch" aria-label="Demo participant"><span className="roleLabel">DEMO PARTICIPANT</span>{(["MAT", "SPOONER", "DANIELLE"] as Role[]).map(r => <button key={r} className={role === r ? "active" : ""} onClick={() => setRole(r)}>{PEOPLE[r].tag}</button>)}</div>
    </header>
    <main>
      <section className="caseStrip"><div><span>CASE</span><strong>{active.id}</strong></div><div><span>DATE</span><strong>{active.date}</strong></div><div><span>STATE</span><strong>{bothLocked ? "INITIAL RESPONSES LOCKED" : "AWAITING INDEPENDENT RESPONSES"}</strong></div></section>
      <section className="questionBlock"><span className="kicker">FIELD QUESTION</span><h2>{active.question}</h2><p>{active.observation}</p>{active.image ? <img className="fieldImage" src={active.image} alt="Field observation" /> : <div className="fieldImagePlaceholder"><span>FIELD PHOTOGRAPH</span><strong>Supplied by Matt</strong><small>Photograph appears here when the field case includes one.</small></div>}<div className="pxrfState"><span>pXRF DATA</span><strong>{active.pxrf}</strong></div></section>
      {role === "MAT" ? <><NewQuestion question={question} setQuestion={setQuestion} observation={observation} setObservation={setObservation} image={image} setImage={setImage} create={create} /><MattPane openRequest={openRequest} pxrfResponse={pxrfResponse} setPxrfResponse={setPxrfResponse} returnPxrf={returnPxrf} /></> : <ExpertPane role={role} answer={active.answers[role]} answerText={answerText} setAnswerText={setAnswerText} basis={basis} setBasis={setBasis} uncertainty={uncertainty} setUncertainty={setUncertainty} confidence={confidence} setConfidence={setConfidence} lock={() => lock(role)} myRequest={active.answers[role]?.request} requestPrompt={requestPrompt} setRequestPrompt={setRequestPrompt} requestPxrf={() => requestPxrf(role)} reassessment={reassessment} setReassessment={setReassessment} reassessmentConfidence={reassessmentConfidence} setReassessmentConfidence={setReassessmentConfidence} changed={changed} setChanged={setChanged} lockReassessment={() => lockReassessment(role)} />}
      {bothLocked && <Reveal active={active} />}
      <History active={active} />
    </main>
  </div>;
}

function NewQuestion({ question, setQuestion, observation, setObservation, image, setImage, create }: any) { return <section className="newQuestion"><span className="kicker">FIELD PORTAL · CREATE NEXT CASE</span><h2>Put another unknown into the system.</h2><p>The demo case is already loaded. Use this only when showing how a new field question enters the record.</p><label>PHOTOGRAPH<input type="file" accept="image/*" onChange={(e: ChangeEvent<HTMLInputElement>) => readImage(e, setImage)} /></label>{image && <img className="uploadPreview" src={image} alt="Preview" />}<label>QUESTION<textarea value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Why is this hard matrix phosphorescing so much?" /></label><label>FIELD OBSERVATION<input value={observation} onChange={(e) => setObservation(e.target.value)} placeholder="What did you see?" /></label><div className="newPxrf"><span>pXRF</span><strong>NO XRF DATA SUPPLIED</strong><small>The measurement is deliberately withheld until requested by an expert.</small></div><button className="loginBtn" onClick={create}>LOCK QUESTION &amp; SEND TO EXPERTS <span>→</span></button></section>; }

function ExpertPane(p: ExpertPaneProps) { return <div className="workflowStack"><section className="expertResponse"><div className="responseHead"><div><span className="kicker">{PEOPLE[p.role].tag} · INDEPENDENT RESPONSE</span><h3>{PEOPLE[p.role].name}</h3><p>{PEOPLE[p.role].title}</p></div><div className="blindLock">SEALED<br /><small>OTHER RESPONSE HIDDEN</small></div></div>{!p.answer ? <><div className="captureGrid"><label>INTERPRETATION<textarea value={p.answerText} onChange={(e) => p.setAnswerText(e.target.value)} placeholder="What do you think is happening?" /></label><label>BASIS / EXPERIENCE<textarea value={p.basis} onChange={(e) => p.setBasis(e.target.value)} placeholder="What informs your judgement?" /></label><label>UNCERTAINTY<textarea value={p.uncertainty} onChange={(e) => p.setUncertainty(e.target.value)} placeholder="What remains uncertain?" /></label></div><Confidence value={p.confidence} setValue={p.setConfidence} label="INITIAL PROBABILITY" /><button className="loginBtn" onClick={p.lock}>LOCK INITIAL JUDGEMENT <span>→</span></button></> : <div className="lockedResponse"><span>INITIAL JUDGEMENT LOCKED · {p.answer.confidence}%</span><blockquote>“{p.answer.text}”</blockquote><div className="lockedGrid"><div><small>BASIS</small><p>{p.answer.basis || "Not recorded."}</p></div><div><small>UNCERTAINTY</small><p>{p.answer.uncertainty || "Not recorded."}</p></div></div></div>}</section>{p.answer && <section className="evidenceRequest"><span className="kicker">EVIDENCE REQUEST</span><h3>Would pXRF materially change the judgement?</h3><p>Request the measurement only when you can explain why it would discriminate between plausible mechanisms.</p>{p.myRequest ? <div className="requestState"><strong>{p.myRequest.status === "FULFILLED" ? "pXRF DATA RETURNED" : "pXRF REQUEST SENT"}</strong><p>{p.myRequest.prompt}</p>{p.myRequest.status === "FULFILLED" && <small>The initial judgement remains intact. Reassess below.</small>}</div> : <><textarea value={p.requestPrompt} onChange={(e) => p.setRequestPrompt(e.target.value)} placeholder="Why would pXRF help distinguish the mechanisms?" /><button className="btn accent wide" onClick={p.requestPxrf}>REQUEST pXRF DATA <span>→</span></button></>}</section>}{p.answer && p.myRequest?.status === "FULFILLED" && <section className="evidenceRequest"><span className="kicker">REASSESSMENT</span><h3>What changed?</h3><textarea value={p.reassessment} onChange={(e) => p.setReassessment(e.target.value)} placeholder="What does the new evidence change?" /><Confidence value={p.reassessmentConfidence} setValue={p.setReassessmentConfidence} label="REVISED PROBABILITY" /><label className="changeToggle"><input type="checkbox" checked={p.changed} onChange={(e) => p.setChanged(e.target.checked)} /> Probability changed</label><button className="loginBtn" onClick={p.lockReassessment}>LOCK REASSESSMENT <span>→</span></button></section>}</div>; }

function Confidence({ value, setValue, label }: { value: number; setValue: (value: number) => void; label: string }) { return <div className="confidence"><div className="confidenceHeader"><span>{label}</span><strong>{value}%</strong></div><input type="range" min="0" max="100" value={value} onChange={(e) => setValue(Number(e.target.value))} /><small>How likely is your interpretation to be correct, given what you currently know?</small></div>; }

function MattPane({ openRequest, pxrfResponse, setPxrfResponse, returnPxrf }: MattPaneProps) { return <section className="matWaiting">{openRequest ? <><span className="kicker">FIELD · EVIDENCE REQUEST</span><h3>pXRF requested.</h3><p>{PEOPLE[openRequest.from].name} has asked for compositional data.</p><p className="requestQuote">“{openRequest.prompt}”</p><textarea value={pxrfResponse} onChange={(e) => setPxrfResponse(e.target.value)} placeholder="Enter or paste the pXRF result…" /><button className="loginBtn" onClick={returnPxrf}>RETURN pXRF DATA <span>→</span></button></> : <><span className="kicker">FIELD PORTAL</span><h3>Waiting for the experts.</h3><p>pXRF is intentionally absent. The next move belongs to the experts.</p><div className="waitingMark">NO XRF DATA SUPPLIED</div></>}</section>; }

function Reveal({ active }: { active: Case }) { const spooner = active.answers.SPOONER!; const danielle = active.answers.DANIELLE!; const delta = Math.abs(spooner.confidence - danielle.confidence); const responses: Array<{ label: string; name: string; value: Answer }> = [{ label: "SCIENCE", name: PEOPLE.SPOONER.name, value: spooner }, { label: "ANALYSIS", name: PEOPLE.DANIELLE.name, value: danielle }]; return <section className="reveal"><span className="kicker">REVEAL · DISAGREEMENT IS DATA</span><h2>Two independent readings.</h2><p>Only now do the sealed responses meet.</p><div className="revealGrid">{responses.map(({ label, name, value: answer }) => <article key={label}><span>{label}</span><h3>{name}</h3><blockquote>“{answer.text}”</blockquote><strong>{answer.confidence}%</strong><small>INITIAL PROBABILITY</small>{answer.reassessment && <div className="reassessmentRecord"><span>REASSESSMENT · {answer.reassessment.confidence}%</span><p>{answer.reassessment.text}</p><small>{answer.reassessment.changed ? "PROBABILITY CHANGED" : "PROBABILITY UNCHANGED"}</small></div>}</article>)}</div><div className="disagreement"><span>CONFIDENCE DIFFERENCE</span><strong>{delta} percentage points</strong></div></section>; }

function History({ active }: { active: Case }) { return <section className="history"><span className="kicker">EVENT HISTORY</span><div>{active.history.map((item, i) => <p key={`${item}-${i}`}><span>{String(i + 1).padStart(2, "0")}</span><span>{item}</span></p>)}</div></section>; }
