"use client";

import { useEffect, useMemo, useState } from "react";

type Role = "MAT" | "SPOONER" | "DANIELLE";
type ExpertRole = Exclude<Role, "MAT">;
type Request = { id: string; from: ExpertRole; prompt: string; response?: string; status: "OPEN" | "FULFILLED" };
type Reassessment = { text: string; confidence: number; changed: boolean };
type Answer = { text: string; basis: string; uncertainty: string; confidence: number; request?: Request; reassessment?: Reassessment };
type CaseImage = { src: string; label: string; note: string };
type Case = { id: string; date: string; question: string; observation: string; images: CaseImage[]; pxrf: string; answers: Partial<Record<ExpertRole, Answer>>; requests: Request[]; history: string[] };

const STORAGE = "provenanceos-case001-v5";
const PEOPLE: Record<Role, { name: string; short: string; title: string; tag: string; purpose: string }> = {
  MAT: { name: "Matt Kathagen", short: "Matt", title: "Mooka Boys · Field / Mining", tag: "FIELD", purpose: "Supplies the field observation and returns requested measurement data." },
  SPOONER: { name: "Professor Nigel Spooner", short: "Nigel", title: "Professor of Radiation Physics and Luminescence", tag: "SCIENCE", purpose: "Makes an independent scientific judgement from the same evidence." },
  DANIELLE: { name: "Danielle Questiaux", short: "Danielle", title: "Research Assistant and Alpha Spectroscopy Analyst, University of Adelaide", tag: "ANALYSIS", purpose: "Makes an independent analytical reading from the same evidence." },
};

const DEMO: Case = {
  id: "CASE 001",
  date: "08 SEP 2026",
  question: "Why is this hard matrix phosphorescing so much?",
  observation: "Field observation supplied by Matt. Visible afterglow was observed after 365 nm UV exposure, persisting for approximately 7 seconds.",
  images: [
    { src: "/images/case001_normal.jpg", label: "NORMAL LIGHT", note: "Same material under ordinary light" },
    { src: "/images/case001_uv.jpg", label: "365 NM UV", note: "Visible afterglow observed for ~7 seconds" },
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
    const normalized = source.map((c) => c.id === DEMO.id ? { ...DEMO, ...c, question: DEMO.question, observation: DEMO.observation, images: DEMO.images, pxrf: c.pxrf || DEMO.pxrf, answers: c.answers || {}, requests: c.requests || [], history: c.history?.length ? c.history : DEMO.history } : c);
    return normalized.some((c) => c.id === DEMO.id) ? normalized : [DEMO, ...normalized];
  } catch {
    return [DEMO];
  }
}

export function KnowledgeExperiment() {
  const [role, setRole] = useState<Role>("MAT");
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

  useEffect(() => {
    setCases(hydrate(localStorage.getItem(STORAGE)));
  }, []);

  const active = useMemo(() => cases.find((c) => c.id === "CASE 001") || DEMO, [cases]);
  const bothLocked = Boolean(active.answers.SPOONER && active.answers.DANIELLE);
  const openRequest = active.requests.find((r) => r.status === "OPEN");
  const selected = PEOPLE[role];

  const persist = (next: Case[]) => {
    setCases(next);
    localStorage.setItem(STORAGE, JSON.stringify(next));
  };

  const update = (fn: (c: Case) => Case) => {
    persist(cases.map((c) => c.id === "CASE 001" ? fn(c) : c));
  };

  const resetDemo = () => {
    setCases([DEMO]);
    localStorage.removeItem(STORAGE);
    setRole("MAT");
    setAnswerText(""); setBasis(""); setUncertainty(""); setConfidence(50);
    setRequestPrompt(""); setReassessment(""); setReassessmentConfidence(50); setChanged(false); setPxrfResponse("");
  };

  const lockInitial = (expert: ExpertRole) => {
    if (!answerText.trim()) return;
    const answer: Answer = { text: answerText.trim(), basis: basis.trim(), uncertainty: uncertainty.trim(), confidence };
    update((c) => ({ ...c, answers: { ...c.answers, [expert]: answer }, history: [...c.history, `${PEOPLE[expert].tag} INITIAL JUDGEMENT LOCKED · ${confidence}%`] }));
    setAnswerText(""); setBasis(""); setUncertainty("");
  };

  const requestEvidence = (expert: ExpertRole) => {
    const prompt = requestPrompt.trim();
    if (!prompt || !bothLocked || active.answers[expert]?.request) return;
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
    setReassessment(""); setChanged(false);
  };

  return (
    <div className="experimentShell">
      <section className="participantBar" aria-label="Choose participant">
        <div className="participantLead">
          <span className="kicker">WHO IS USING THE DEMO?</span>
          <strong>{selected.name}</strong>
          <p>{selected.purpose}</p>
        </div>
        <div className="participantOptions">
          {(Object.keys(PEOPLE) as Role[]).map((r) => (
            <button key={r} className={role === r ? "active" : ""} onClick={() => setRole(r)} aria-pressed={role === r}>
              <span>{PEOPLE[r].name}</span>
              <small>{PEOPLE[r].tag}</small>
            </button>
          ))}
        </div>
        <button className="resetDemo" onClick={resetDemo}>RESET CASE</button>
      </section>

      <section className="caseMasthead">
        <div className="caseMastheadMeta"><span>CASE 001</span><span>{active.date}</span><span>{bothLocked ? "INITIAL READINGS SEALED" : "INITIAL READINGS OPEN"}</span></div>
        <div className="caseTitleGrid">
          <div><span className="kicker">THE UNKNOWN</span><h1>{active.question}</h1></div>
          <div className="caseAside"><span className="kicker">THE RULE</span><p>Everyone sees the same evidence. Initial readings stay separate. Evidence is requested, returned and recorded before the readings meet.</p></div>
        </div>
      </section>

      <section className="evidenceSection">
        <div className="evidenceHeader"><span className="kicker">FIELD EVIDENCE</span><span className="evidenceRule">SUPPLIED BY MATT KATHAGEN</span></div>
        <div className="evidenceGridWide">
          {active.images.map((img) => <figure className="evidenceFigure" key={img.src}><div className="evidenceFrame"><img src={img.src} alt={img.label} /><span className="imageTag">{img.label}</span></div><figcaption>{img.note}</figcaption></figure>)}
        </div>
        <div className="evidenceStatus"><div><span className="kicker">OBSERVATION</span><p>{active.observation}</p></div><div className="pxrfBadge"><span className="kicker">pXRF</span><strong>{active.pxrf}</strong></div></div>
      </section>

      <section className="workingSection">
        <div className="flowHeader"><div><span className="kicker">THE WORKING RECORD</span><h2>Capture the thinking.</h2></div><div className="stepLegend"><span className="done">01 OBSERVE</span><span className={active.answers.SPOONER ? "done" : ""}>02 INTERPRET</span><span className={active.requests.length ? "done" : ""}>03 PROBE</span><span className={active.answers.SPOONER?.reassessment || active.answers.DANIELLE?.reassessment ? "done" : ""}>04 REASSESS</span><span className={bothLocked ? "done" : ""}>05 REVEAL</span></div></div>
        {role === "MAT" ? <MattView openRequest={openRequest} bothLocked={bothLocked} pxrfResponse={pxrfResponse} setPxrfResponse={setPxrfResponse} returnEvidence={returnEvidence} /> : <ExpertView role={role} answer={active.answers[role]} answerText={answerText} setAnswerText={setAnswerText} basis={basis} setBasis={setBasis} uncertainty={uncertainty} setUncertainty={setUncertainty} confidence={confidence} setConfidence={setConfidence} lockInitial={() => lockInitial(role)} requestPrompt={requestPrompt} setRequestPrompt={setRequestPrompt} requestEvidence={() => requestEvidence(role)} bothLocked={bothLocked} reassessment={reassessment} setReassessment={setReassessment} reassessmentConfidence={reassessmentConfidence} setReassessmentConfidence={setReassessmentConfidence} changed={changed} setChanged={setChanged} lockReassessment={() => lockReassessment(role)} />}
      </section>

      {bothLocked && <Reveal active={active} />}
      <History active={active} />
    </div>
  );
}

function MattView({ openRequest, bothLocked, pxrfResponse, setPxrfResponse, returnEvidence }: { openRequest?: Request; bothLocked: boolean; pxrfResponse: string; setPxrfResponse: (v: string) => void; returnEvidence: () => void }) {
  return <div className="rolePanel mattPanel"><div className="rolePanelIntro"><span className="roleNumber">FIELD</span><div><h3>Matt Kathagen</h3><p>Field / Mining · Mooka Boys</p></div><span className="panelStatus">OBSERVE · RETURN</span></div><div className="mattGrid"><div><span className="kicker">YOUR ROLE</span><p className="largeCopy">Put the field observation into the record. Then wait. Measurement is returned only when an expert has asked for it.</p></div><div className="mattState"><span className="kicker">CURRENT STATE</span><strong>{openRequest ? "EVIDENCE REQUEST OPEN" : "NO EVIDENCE REQUEST"}</strong>{openRequest ? <><blockquote>“{openRequest.prompt}”</blockquote>{!bothLocked ? <small>Waiting for the second initial judgement.</small> : <><label htmlFor="pxrf-return" className="kicker">RETURN pXRF MEASUREMENT</label><textarea id="pxrf-return" value={pxrfResponse} onChange={(e) => setPxrfResponse(e.target.value)} placeholder="Enter the returned measurement exactly as supplied." /><button className="primaryAction" onClick={returnEvidence}>RETURN pXRF DATA <span>→</span></button></>}</> : <div className="waitingMark">No expert evidence request yet.</div>}</div></div></div>;
}

function ExpertView(p: { role: ExpertRole; answer?: Answer; answerText: string; setAnswerText: (v: string) => void; basis: string; setBasis: (v: string) => void; uncertainty: string; setUncertainty: (v: string) => void; confidence: number; setConfidence: (v: number) => void; lockInitial: () => void; requestPrompt: string; setRequestPrompt: (v: string) => void; requestEvidence: () => void; bothLocked: boolean; reassessment: string; setReassessment: (v: string) => void; reassessmentConfidence: number; setReassessmentConfidence: (v: number) => void; changed: boolean; setChanged: (v: boolean) => void; lockReassessment: () => void }) {
  const person = PEOPLE[p.role];
  return <div className="rolePanel expertPanel"><div className="rolePanelIntro"><span className="roleNumber">{person.tag}</span><div><h3>{person.name}</h3><p>{person.title}</p></div><span className="panelStatus">OTHER READING HIDDEN</span></div>{!p.answer ? <><div className="judgementGrid"><label className="majorField">INTERPRETATION<textarea value={p.answerText} onChange={(e) => p.setAnswerText(e.target.value)} placeholder="What do you think is happening?" /></label><label>BASIS / EXPERIENCE<textarea value={p.basis} onChange={(e) => p.setBasis(e.target.value)} placeholder="What informs your judgement?" /></label><label>UNCERTAINTY<textarea value={p.uncertainty} onChange={(e) => p.setUncertainty(e.target.value)} placeholder="What remains uncertain?" /></label></div><div className="confidenceRow"><Confidence value={p.confidence} setValue={p.setConfidence} label="INITIAL PROBABILITY" /><button className="primaryAction compact" onClick={p.lockInitial}>LOCK INITIAL JUDGEMENT <span>→</span></button></div></> : <div className="lockedReading"><div className="lockedMeta"><span>INITIAL JUDGEMENT LOCKED</span><strong>{p.answer.confidence}%</strong></div><blockquote>“{p.answer.text}”</blockquote><div className="lockedDetails"><div><span className="kicker">BASIS</span><p>{p.answer.basis || "Not recorded."}</p></div><div><span className="kicker">UNCERTAINTY</span><p>{p.answer.uncertainty || "Not recorded."}</p></div></div></div>}{p.answer && !p.answer.reassessment && <section className="nextStage"><div><span className="kicker">03 · PROBE</span><h4>What evidence do you need next?</h4><p>Request pXRF only when you can explain how it could discriminate between plausible mechanisms.</p></div>{p.answer.request ? <div className="requestState"><strong>{p.answer.request.status === "FULFILLED" ? "pXRF DATA RETURNED" : "pXRF REQUEST SENT"}</strong><p>{p.answer.request.prompt}</p></div> : p.bothLocked ? <><textarea value={p.requestPrompt} onChange={(e) => p.setRequestPrompt(e.target.value)} placeholder="Why would pXRF help distinguish the mechanisms?" /><button className="secondaryAction" onClick={p.requestEvidence}>REQUEST pXRF DATA <span>→</span></button></> : <div className="waitingNotice">Both initial readings must be sealed before the evidence request.</div>}</section>}{p.answer?.request?.status === "FULFILLED" && !p.answer.reassessment && <section className="nextStage reassessment"><div><span className="kicker">04 · REASSESS</span><h4>What changed?</h4><p>The original judgement stays intact. Record the new reading separately.</p></div><textarea value={p.reassessment} onChange={(e) => p.setReassessment(e.target.value)} placeholder="What does the new evidence change?" /><Confidence value={p.reassessmentConfidence} setValue={p.setReassessmentConfidence} label="REVISED PROBABILITY" /><label className="changeToggle"><input type="checkbox" checked={p.changed} onChange={(e) => p.setChanged(e.target.checked)} /> Probability changed</label><button className="primaryAction" onClick={p.lockReassessment}>LOCK REASSESSMENT <span>→</span></button></section>}</div>;
}

function Confidence({ value, setValue, label }: { value: number; setValue: (value: number) => void; label: string }) {
  return <div className="confidence"><div className="confidenceHeader"><span>{label}</span><strong>{value}%</strong></div><input type="range" min={0} max={100} step={1} value={value} onChange={(e) => setValue(Number(e.target.value))} /><small>Probability, not certainty.</small></div>;
}

function Reveal({ active }: { active: Case }) {
  const spooner = active.answers.SPOONER!;
  const danielle = active.answers.DANIELLE!;
  const delta = Math.abs(spooner.confidence - danielle.confidence);
  return <section className="revealSection"><div className="revealLead"><span className="kicker">05 · REVEAL</span><h2>Now let the readings meet.</h2><p>Only after both initial judgements were locked. The disagreement remains part of the record.</p></div><div className="revealGrid">{[{ person: PEOPLE.SPOONER, answer: spooner }, { person: PEOPLE.DANIELLE, answer: danielle }].map(({ person, answer }) => <article key={person.tag}><span className="revealTag">{person.tag}</span><h3>{person.name}</h3><blockquote>“{answer.text}”</blockquote><div className="revealProbability"><strong>{answer.confidence}%</strong><small>INITIAL PROBABILITY</small></div>{answer.reassessment && <div className="reassessmentRecord"><span>REASSESSMENT · {answer.reassessment.confidence}%</span><p>{answer.reassessment.text}</p><small>{answer.reassessment.changed ? "PROBABILITY CHANGED" : "PROBABILITY UNCHANGED"}</small></div>}</article>)}</div><div className="disagreementRow"><span>CONFIDENCE DIFFERENCE</span><strong>{delta} percentage points</strong></div></section>;
}

function History({ active }: { active: Case }) {
  return <section className="history"><div className="historyHeader"><span className="kicker">EVENT HISTORY</span><span>WHAT THE SYSTEM KEEPS</span></div><div className="historyList">{active.history.map((item, i) => <div key={`${item}-${i}`}><span>{String(i + 1).padStart(2, "0")}</span><p>{item}</p></div>)}</div></section>;
}
