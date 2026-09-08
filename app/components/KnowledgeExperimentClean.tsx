"use client";

import { ChangeEvent, useMemo, useState } from "react";

type Role = "MAT" | "SPOONER" | "DANIELLE";
type ExpertRole = Exclude<Role, "MAT">;
type Request = { id: string; from: ExpertRole; prompt: string; response?: string; status: "OPEN" | "FULFILLED" };
type Answer = { text: string; basis: string; uncertainty: string; confidence: number; request?: Request; reassessment?: { text: string; confidence: number; changed: boolean } };
type Case = { id: string; date: string; question: string; observation: string; image?: string; pxrf: string; answers: Partial<Record<ExpertRole, Answer>>; requests: Request[]; history: string[] };

type ExpertPaneProps = {
  role: ExpertRole;
  answer?: Answer;
  answerText: string;
  setAnswerText: (value: string) => void;
  basis: string;
  setBasis: (value: string) => void;
  uncertainty: string;
  setUncertainty: (value: string) => void;
  confidence: number;
  setConfidence: (value: number) => void;
  lock: () => void;
  myRequest?: Request;
  requestPrompt: string;
  setRequestPrompt: (value: string) => void;
  requestPxrf: () => void;
  reassessment: string;
  setReassessment: (value: string) => void;
  reassessmentConfidence: number;
  setReassessmentConfidence: (value: number) => void;
  changed: boolean;
  setChanged: (value: boolean) => void;
  lockReassessment: () => void;
};

const PEOPLE: Record<Role, { name: string; title: string; tag: string }> = {
  MAT: { name: "Matt Kathagen", title: "Mooka Boys · Field / Mining", tag: "FIELD" },
  SPOONER: { name: "Professor Nigel Spooner", title: "Professor of Radiation Physics and Luminescence", tag: "SCIENCE" },
  DANIELLE: { name: "Danielle Questiaux", title: "Research Assistant and Alpha Spectroscopy Analyst, University of Adelaide", tag: "ANALYSIS" },
};

const DEMO: Case = {
  id: "CASE 001",
  date: "08 SEP 2026",
  question: "What observation or measurement would best distinguish the likely mechanisms?",
  observation: "Field observation · photograph supplied by Matt",
  pxrf: "NO XRF DATA SUPPLIED",
  answers: {},
  requests: [],
  history: ["CASE CREATED · FIELD OBSERVATION", "QUESTION LOCKED · SENT TO EXPERTS", "pXRF STATUS · NO XRF DATA SUPPLIED"],
};

function readCases(): Case[] {
  if (typeof window === "undefined") return [DEMO];
  try {
    const value = JSON.parse(localStorage.getItem("provenanceos-cases") || "null");
    return Array.isArray(value) && value.length ? value : [DEMO];
  } catch { return [DEMO]; }
}

function readImage(event: ChangeEvent<HTMLInputElement>, set: (value: string | undefined) => void) {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => set(String(reader.result));
  reader.readAsDataURL(file);
}

export function KnowledgeExperiment() {
  const [cases, setCases] = useState<Case[]>(readCases);
  const [role, setRole] = useState<Role | null>(null);
  const [activeId, setActiveId] = useState("CASE 001");
  const [notice, setNotice] = useState("");
  const [question, setQuestion] = useState(DEMO.question);
  const [observation, setObservation] = useState("");
  const [image, setImage] = useState<string | undefined>();
  const [answerText, setAnswerText] = useState("");
  const [basis, setBasis] = useState("");
  const [uncertainty, setUncertainty] = useState("");
  const [confidence, setConfidence] = useState(65);
  const [requestPrompt, setRequestPrompt] = useState("");
  const [reassessment, setReassessment] = useState("");
  const [reassessmentConfidence, setReassessmentConfidence] = useState(75);
  const [changed, setChanged] = useState(true);
  const [pxrfResponse, setPxrfResponse] = useState("");

  const active = useMemo(() => cases.find((item) => item.id === activeId) || cases[0], [cases, activeId]);
  if (!role || !active) return <Login onLogin={setRole} />;

  const save = (next: Case[]) => {
    setCases(next);
    localStorage.setItem("provenanceos-cases", JSON.stringify(next));
  };
  const patch = (fn: (item: Case) => Case) => save(cases.map((item) => item.id === active.id ? fn(item) : item));
  const expert = role === "MAT" ? null : role;
  const answer = expert ? active.answers[expert] : undefined;
  const bothLocked = Boolean(active.answers.SPOONER && active.answers.DANIELLE);
  const myRequest = expert ? active.requests.find((request) => request.from === expert) : undefined;
  const openRequest = active.requests.find((request) => request.status === "OPEN");

  const createCase = () => {
    if (role !== "MAT" || !question.trim()) return;
    const item: Case = {
      id: `CASE ${String(cases.length + 1).padStart(3, "0")}`,
      date: new Date().toLocaleDateString("en-AU", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase(),
      question: question.trim(), observation: observation.trim() || "Field observation", image,
      pxrf: "NO XRF DATA SUPPLIED", answers: {}, requests: [],
      history: ["CASE CREATED · FIELD OBSERVATION", "QUESTION LOCKED · SENT TO EXPERTS", "pXRF STATUS · NO XRF DATA SUPPLIED"],
    };
    save([item, ...cases]); setActiveId(item.id); setQuestion(DEMO.question); setObservation(""); setImage(undefined);
    setNotice("Question locked. Independent evaluation has begun.");
  };

  const lockInitial = () => {
    if (!expert || !answerText.trim()) return;
    patch((item) => ({
      ...item,
      answers: { ...item.answers, [expert]: { text: answerText.trim(), basis: basis.trim() || "Not stated", uncertainty: uncertainty.trim() || "Not stated", confidence } },
      history: [...item.history, `${PEOPLE[expert].tag} INITIAL JUDGEMENT LOCKED · ${confidence}%`],
    }));
    setAnswerText(""); setBasis(""); setUncertainty(""); setNotice("Initial judgement sealed. The other expert remains blind.");
  };

  const requestPxrf = () => {
    if (!expert || !answer || myRequest) return;
    const request: Request = { id: `PXRF-${Date.now()}`, from: expert, prompt: requestPrompt.trim() || "pXRF data requested to test or refine the current judgement.", status: "OPEN" };
    patch((item) => ({
      ...item,
      answers: { ...item.answers, [expert]: { ...item.answers[expert]!, request } },
      requests: [...item.requests, request],
      history: [...item.history, `${PEOPLE[expert].tag} REQUESTED pXRF DATA · ${request.prompt}`],
    }));
    setRequestPrompt(""); setNotice("pXRF request recorded. The initial judgement remains unchanged.");
  };

  const returnPxrf = () => {
    if (role !== "MAT" || !openRequest) return;
    const data = pxrfResponse.trim() || "pXRF DATA SUPPLIED";
    patch((item) => ({
      ...item, pxrf: data,
      requests: item.requests.map((request) => request.id === openRequest.id ? { ...request, status: "FULFILLED", response: data } : request),
      history: [...item.history, `pXRF DATA SUPPLIED · ${openRequest.from} REQUEST FULFILLED`],
    }));
    setPxrfResponse(""); setNotice("pXRF data returned. The original judgement remains intact; reassessment is now available.");
  };

  const lockReassessment = () => {
    if (!expert || !answer || !myRequest || myRequest.status !== "FULFILLED" || !reassessment.trim()) return;
    patch((item) => ({
      ...item,
      answers: { ...item.answers, [expert]: { ...item.answers[expert]!, reassessment: { text: reassessment.trim(), confidence: reassessmentConfidence, changed } } },
      history: [...item.history, `${PEOPLE[expert].tag} REASSESSED · ${reassessmentConfidence}% · ${changed ? "PROBABILITY CHANGED" : "PROBABILITY MAINTAINED"}`],
    }));
    setReassessment(""); setNotice("Reassessment recorded in the provenance history.");
  };

  return <div className="experimentApp">
    <header className="experimentTop"><div><span className="kicker">PROVENANCEOS™ / ANDAMOOKA EXPERIMENT</span><strong>{PEOPLE[role].tag} PORTAL</strong></div><div className="topRight"><span>{active.id}</span><button className="quietBtn" onClick={() => setRole(null)}>SIGN OUT</button></div></header>
    <div className="experimentGrid">
      <aside className="caseRail"><div className="railHead"><span>CASES</span><b>{cases.length}</b></div>{cases.map((item) => <button className={`caseItem ${item.id === active.id ? "selected" : ""}`} key={item.id} onClick={() => setActiveId(item.id)}><span>{item.id}</span><b>{item.answers.SPOONER && item.answers.DANIELLE ? "COMPLETE" : "IN PROGRESS"}</b><small>{item.date}</small></button>)}{role === "MAT" && <button className="newCase" onClick={() => setActiveId("NEW")}>+ NEW FIELD QUESTION</button>}</aside>
      <main className="caseWorkspace">{activeId === "NEW" ? <NewQuestion question={question} setQuestion={setQuestion} observation={observation} setObservation={setObservation} image={image} setImage={setImage} create={createCase} /> : <>
        <div className="caseWorkspaceHead"><div><span className="kicker">{active.id} · KNOWLEDGE EVENT</span><h2>THE UNKNOWN</h2></div><span className="statusText">{bothLocked ? "INDEPENDENT RESPONSES COMPLETE" : "EVALUATION IN PROGRESS"}</span></div>
        <section className="evidenceFrame"><div className="photoWell">{active.image ? <img src={active.image} alt="Field evidence" /> : <div><span>FIELD PHOTOGRAPH</span><small>Unknown specimen / hard matrix</small></div>}</div><div className="questionBlock"><span className="kicker">QUESTION · {active.date}</span><blockquote>“{active.question}”</blockquote><p>{active.observation}</p><div className="pxrfBlock"><div><span>pXRF DATA</span><strong>{active.pxrf}</strong></div><p>{active.pxrf === "NO XRF DATA SUPPLIED" ? "No compositional data has been supplied. The expert decides whether pXRF would materially change the judgement." : "Compositional data returned from the field measurement."}</p></div><div className="blindNotice"><strong>BLIND EVALUATION</strong> · Independent judgements remain sealed until both experts have locked their first response.</div></div></section>
        {role !== "MAT" ? <ExpertPane role={role} answer={answer} answerText={answerText} setAnswerText={setAnswerText} basis={basis} setBasis={setBasis} uncertainty={uncertainty} setUncertainty={setUncertainty} confidence={confidence} setConfidence={setConfidence} lock={lockInitial} myRequest={myRequest} requestPrompt={requestPrompt} setRequestPrompt={setRequestPrompt} requestPxrf={requestPxrf} reassessment={reassessment} setReassessment={setReassessment} reassessmentConfidence={reassessmentConfidence} setReassessmentConfidence={setReassessmentConfidence} changed={changed} setChanged={setChanged} lockReassessment={lockReassessment} /> : <MattPane openRequest={openRequest} pxrfResponse={pxrfResponse} setPxrfResponse={setPxrfResponse} returnPxrf={returnPxrf} />}
        {bothLocked && <Reveal active={active} />}<History active={active} />{notice && <button className="toast" onClick={() => setNotice("")}>{notice}</button>}
      </>}</main>
    </div>
  </div>;
}

function Login({ onLogin }: { onLogin: (role: Role) => void }) {
  const [selected, setSelected] = useState<Role>("MAT");
  return <div className="portalLogin"><div className="loginMark"><span>PROVENANCEOS™</span><small>THE ANDAMOOKA EXPERIMENT / PHASE ONE</small></div><div className="loginCard"><span className="kicker">CONTROLLED KNOWLEDGE EXPERIMENT</span><h1>Enter the<br /><em>experiment.</em></h1><div className="roleChoices">{(Object.keys(PEOPLE) as Role[]).map((item) => <button key={item} className={selected === item ? "chosen" : ""} onClick={() => setSelected(item)}><span>{PEOPLE[item].tag}</span><strong>{PEOPLE[item].name}</strong><small>{PEOPLE[item].title}</small></button>)}</div><button className="loginBtn" onClick={() => onLogin(selected)}>ENTER {PEOPLE[selected].tag} PORTAL <span>→</span></button><p className="loginFoot">Contributions are recorded independently. Neither expert sees the other&apos;s judgement before reveal.</p></div></div>;
}

function NewQuestion({ question, setQuestion, observation, setObservation, image, setImage, create }: any) {
  return <div className="newQuestion"><span className="kicker">FIELD PORTAL / NEW CASE</span><h2>Ask the unknown.</h2><p>One field question. One photograph. One blind evaluation. pXRF begins as an unknown.</p><label>PHOTOGRAPH<input type="file" accept="image/*" onChange={(e: ChangeEvent<HTMLInputElement>) => readImage(e, setImage)} /></label>{image && <img className="uploadPreview" src={image} alt="Preview" />}<label>QUESTION<textarea value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Ask the unknown" /></label><label>FIELD OBSERVATION<input value={observation} onChange={(e) => setObservation(e.target.value)} placeholder="What did you see?" /></label><div className="newPxrf"><span>pXRF DATA</span><strong>NO XRF DATA SUPPLIED</strong><small>The absence of data is deliberate. Experts decide whether to request the measurement.</small></div><button className="loginBtn" onClick={create}>LOCK QUESTION &amp; SEND TO EXPERTS <span>→</span></button></div>;
}

function ExpertPane(p: ExpertPaneProps) {
  return <div className="workflowStack"><section className="expertResponse"><div className="responseHead"><div><span className="kicker">{PEOPLE[p.role].tag} / INDEPENDENT RESPONSE</span><h3>{PEOPLE[p.role].name}</h3><p>{PEOPLE[p.role].title}</p></div><div className="blindLock">BLIND<br /><small>OTHER RESPONSE HIDDEN</small></div></div>{!p.answer ? <><div className="captureGrid"><label>INTERPRETATION<textarea value={p.answerText} onChange={(e) => p.setAnswerText(e.target.value)} placeholder="What do you think is happening?" /></label><label>BASIS / EXPERIENCE<textarea value={p.basis} onChange={(e) => p.setBasis(e.target.value)} placeholder="What informs your judgement?" /></label><label>UNCERTAINTY<textarea value={p.uncertainty} onChange={(e) => p.setUncertainty(e.target.value)} placeholder="What remains uncertain?" /></label></div><Confidence value={p.confidence} setValue={p.setConfidence} label="INITIAL PROBABILITY" /><button className="loginBtn" onClick={p.lock}>LOCK INITIAL JUDGEMENT <span>→</span></button></> : <div className="lockedResponse"><span>INITIAL JUDGEMENT LOCKED · {p.answer.confidence}%</span><blockquote>“{p.answer.text}”</blockquote><div className="lockedGrid"><div><small>BASIS</small><p>{p.answer.basis}</p></div><div><small>UNCERTAINTY</small><p>{p.answer.uncertainty}</p></div></div></div>}</section>{p.answer && <section className="evidenceRequest"><span className="kicker">EVIDENCE REQUEST</span><h3>Would pXRF change your mind?</h3><p>Request compositional data only if you believe it could materially change your probability.</p>{p.myRequest ? <div className="requestState"><strong>{p.myRequest.status === "FULFILLED" ? "pXRF DATA RETURNED" : "pXRF REQUEST SENT"}</strong><p>{p.myRequest.prompt}</p>{p.myRequest.status === "FULFILLED" && <small>The original judgement remains intact. Reassess below.</small>}</div> : <><textarea value={p.requestPrompt} onChange={(e) => p.setRequestPrompt(e.target.value)} placeholder="Why would pXRF help?" /><button className="btn accent wide" onClick={p.requestPxrf}>REQUEST pXRF DATA <span>→</span></button></>}</section>}{p.answer && p.myRequest?.status === "FULFILLED" && <section className="evidenceRequest"><span className="kicker">REASSESSMENT</span><h3>What changed?</h3><textarea value={p.reassessment} onChange={(e) => p.setReassessment(e.target.value)} placeholder="What does the new evidence change?" /><Confidence value={p.reassessmentConfidence} setValue={p.setReassessmentConfidence} label="REVISED PROBABILITY" /><label className="changeToggle"><input type="checkbox" checked={p.changed} onChange={(e) => p.setChanged(e.target.checked)} /> Probability changed</label><button className="loginBtn" onClick={p.lockReassessment}>LOCK REASSESSMENT <span>→</span></button></section>}</div>;
}

function Confidence({ value, setValue, label }: { value: number; setValue: (value: number) => void; label: string }) {
  return <div className="confidence"><div className="confidenceHeader"><span>{label}</span><strong>{value}%</strong></div><input type="range" min="0" max="100" value={value} onChange={(e) => setValue(Number(e.target.value))} /><small>How likely is your interpretation to be correct, given what you currently know?</small></div>;
}

function MattPane({ openRequest, pxrfResponse, setPxrfResponse, returnPxrf }: any) {
  return <section className="matWaiting">{openRequest ? <><span className="kicker">FIELD / EVIDENCE REQUEST</span><h3>pXRF requested.</h3><p>{PEOPLE[openRequest.from].name} has asked for compositional data.</p><p className="requestQuote">“{openRequest.prompt}”</p><textarea value={pxrfResponse} onChange={(e) => setPxrfResponse(e.target.value)} placeholder="Paste or enter pXRF results…" /><button className="loginBtn" onClick={returnPxrf}>RETURN pXRF DATA <span>→</span></button></> : <><span className="kicker">FIELD PORTAL</span><h3>Waiting for the experts.</h3><p>pXRF is intentionally absent. An expert can request the measurement if it would help distinguish the likely mechanisms.</p><div className="waitingMark">NO XRF DATA SUPPLIED</div></>}</section>;
}

function Reveal({ active }: { active: Case }) {
  const spooner = active.answers.SPOONER!;
  const danielle = active.answers.DANIELLE!;
  const delta = Math.abs(spooner.confidence - danielle.confidence);
  const responses: Array<{ label: string; value: Answer }> = [
    { label: "SCIENCE", value: spooner },
    { label: "ANALYSIS", value: danielle },
  ];
  return <section className="revealSection"><span className="kicker">REVEAL / AFTER BOTH JUDGEMENTS LOCK</span><h3>Two readings of<br /><em>the same unknown.</em></h3><div className="answersGrid">{responses.map(({ label, value: answer }) => <article key={label}><small>{label}</small><h4>{answer.confidence}% initial probability</h4><blockquote>“{answer.text}”</blockquote><div className="revealMeta"><div><small>BASIS</small><p>{answer.basis}</p></div><div><small>UNCERTAINTY</small><p>{answer.uncertainty}</p></div></div>{answer.reassessment && <div className="reassessment"><small>AFTER pXRF · {answer.reassessment.confidence}%</small><p>{answer.reassessment.text}</p></div>}</article>)}</div><div className="disagreement"><span>DISAGREEMENT</span><strong>{delta}% confidence spread</strong><p>Where the two judgements diverge is preserved as an object of learning, not resolved away.</p></div></section>;
}

function History({ active }: { active: Case }) {
  return <section className="history"><span className="kicker">PROVENANCE HISTORY</span><div>{active.history.map((entry, index) => <p key={`${entry}-${index}`}><span>{String(index + 1).padStart(2, "0")}</span>{entry}</p>)}</div></section>;
}
