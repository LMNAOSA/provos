"use client";

import { useMemo, useState } from "react";

type Role = "MAT" | "SPOONER" | "DANIELLE";
type RequestKind = "MORE_PHOTO" | "VIDEO" | "FIELD_CONTEXT" | "COMPARISON" | "MEASUREMENT" | "ANOTHER_EXPERT" | "OTHER";
type Request = { id:string; from:Exclude<Role,"MAT">; kind:RequestKind; prompt:string; status:"OPEN"|"FULFILLED"; response?:string; image?:string|null; fulfilledAt?:string };
type Answer = { text:string; basis:string; uncertainty:string; confidence:number; submittedAt:string; request?:{kind:RequestKind; prompt:string}; reassessment?:{text:string; confidence:number; changed:boolean; submittedAt:string} };
type Case = { id:string; date:string; question:string; observation:string; image:string|null; answers:Partial<Record<Role,Answer>>; requests:Request[]; eventLog:string[] };

const PEOPLE:Record<Role,{name:string;title:string;tag:string}> = {
  MAT:{name:"Matt Kathagen",title:"Mooka Boys · Field / Mining",tag:"FIELD"},
  SPOONER:{name:"Professor Nigel Spooner",title:"Professor of Radiation Physics and Luminescence",tag:"SCIENCE"},
  DANIELLE:{name:"Danielle Questiaux",title:"Research Assistant and Alpha Spectroscopy Analyst, University of Adelaide",tag:"ANALYSIS"},
};

const REQUESTS:Record<RequestKind,string> = {
  MORE_PHOTO:"More photography",
  VIDEO:"Colour-play / behaviour video",
  FIELD_CONTEXT:"More field context",
  COMPARISON:"Comparison specimen",
  MEASUREMENT:"Instrument / measurement data",
  ANOTHER_EXPERT:"Another expert opinion",
  OTHER:"Something else",
};

const DEMO:Case = {id:"CASE 001",date:"08 SEP 2026",question:"What is this? I pulled it out of the mullock today. Never seen one behave quite like this when wet.",observation:"Field observation · photograph supplied by Matt",image:null,answers:{},requests:[],eventLog:["CASE CREATED · FIELD OBSERVATION"]};

function loadCases():Case[]{if(typeof window==="undefined")return[DEMO];try{const raw=localStorage.getItem("provenanceos-cases");if(!raw)return[DEMO];const parsed=JSON.parse(raw) as Case[];return parsed.map(c=>({...c,requests:c.requests||[],eventLog:c.eventLog||[]}));}catch{return[DEMO]}}

export function KnowledgeExperiment(){
  const [cases,setCases]=useState<Case[]>(loadCases);
  const [role,setRole]=useState<Role|null>(null);
  const [activeId,setActiveId]=useState(cases[0]?.id||DEMO.id);
  const [q,setQ]=useState(""); const [obs,setObs]=useState(""); const [img,setImg]=useState<string|null>(null);
  const [answer,setAnswer]=useState(""); const [basis,setBasis]=useState(""); const [uncertainty,setUncertainty]=useState(""); const [confidence,setConfidence]=useState(65);
  const [requestKind,setRequestKind]=useState<RequestKind>("MORE_PHOTO"); const [requestPrompt,setRequestPrompt]=useState("");
  const [fulfilText,setFulfilText]=useState(""); const [fulfilImg,setFulfilImg]=useState<string|null>(null); const [fulfilId,setFulfilId]=useState<string|null>(null);
  const [reassess,setReassess]=useState(""); const [reassessConf,setReassessConf]=useState(80); const [changed,setChanged]=useState(true);
  const [notice,setNotice]=useState("");
  const active=useMemo(()=>cases.find(c=>c.id===activeId)||cases[0],[cases,activeId]);
  const bothAnswered=!!active?.answers.SPOONER&&!!active?.answers.DANIELLE;
  const openRequests=active?.requests.filter(r=>r.status==="OPEN")||[];
  const readyForReassess=(r:Role)=>!!active?.answers[r]?.request && openRequests.some(x=>x.from===r&&x.status==="FULFILLED");

  function persist(next:Case[]){setCases(next);localStorage.setItem("provenanceos-cases",JSON.stringify(next))}
  function patchCase(id:string,patch:(c:Case)=>Case){persist(cases.map(c=>c.id===id?patch(c):c))}

  function createCase(){if(!q.trim())return;const n:Case={id:`CASE ${String(cases.length+1).padStart(3,"0")}`,date:new Date().toLocaleDateString("en-AU",{day:"2-digit",month:"short",year:"numeric"}).toUpperCase(),question:q.trim(),observation:obs.trim()||"Field observation",image:img,answers:{},requests:[],eventLog:["CASE CREATED · FIELD OBSERVATION","QUESTION LOCKED · SENT TO EXPERTS"]};persist([n,...cases]);setActiveId(n.id);setQ("");setObs("");setImg(null);setNotice("Question locked. Independent evaluation has begun.")}

  function submitInitial(){if(!role||role==="MAT"||!active||!answer.trim())return;const nextAnswer:Answer={text:answer.trim(),basis:basis.trim()||"Not stated",uncertainty:uncertainty.trim()||"Not stated",confidence,submittedAt:new Date().toISOString()};patchCase(active.id,c=>({...c,answers:{...c.answers,[role]:nextAnswer},eventLog:[...c.eventLog,`${PEOPLE[role].tag} RESPONSE LOCKED · ${confidence}% CONFIDENCE`]}));setAnswer("");setBasis("");setUncertainty("");setNotice("Response locked. Your information need is now recorded separately from your answer.")}

  function requestInfo(){if(!role||role==="MAT"||!active)return;const a=active.answers[role];if(!a||a.request)return;const id=`REQ-${Date.now()}`;const req:Request={id,from:role,kind:requestKind,prompt:requestPrompt.trim()||REQUESTS[requestKind],status:"OPEN"};patchCase(active.id,c=>({...c,answers:{...c.answers,[role]:{...c.answers[role]!,request:{kind:requestKind,prompt:req.prompt}}},requests:[...c.requests,req],eventLog:[...c.eventLog,`${PEOPLE[role].tag} REQUESTED · ${REQUESTS[requestKind]}`]}));setRequestPrompt("");setNotice("Information request sent to Matt. The original judgement remains unchanged.")}

  function fulfilRequest(){if(!role||role!=="MAT"||!active||!fulfilId)return;patchCase(active.id,c=>({...c,requests:c.requests.map(r=>r.id===fulfilId?{...r,status:"FULFILLED",response:fulfilText.trim()||"Field response supplied",image:fulfilImg,fulfilledAt:new Date().toISOString()}:r),eventLog:[...c.eventLog,"FIELD INFORMATION SUPPLIED · REQUEST FULFILLED"]}));setFulfilId(null);setFulfilText("");setFulfilImg(null);setNotice("Further field information supplied. The requesting expert can now reassess.")}

  function submitReassessment(){if(!role||role==="MAT"||!active||!reassess.trim())return;const previous=active.answers[role];if(!previous)return;const updated={...previous,reassessment:{text:reassess.trim(),confidence:reassessConf,changed,submittedAt:new Date().toISOString()}};patchCase(active.id,c=>({...c,answers:{...c.answers,[role]:updated},eventLog:[...c.eventLog,`${PEOPLE[role].tag} REASSESSED · ${reassessConf}% CONFIDENCE · ${changed?"VIEW CHANGED":"VIEW MAINTAINED"}`]}));setReassess("");setNotice("Reassessment recorded. The original response remains preserved.")}

  function attachFile(setter:(v:string|null)=>void){return(e:React.ChangeEvent<HTMLInputElement>)=>{const f=e.target.files?.[0];if(!f)return;const reader=new FileReader();reader.onload=()=>setter(reader.result as string);reader.readAsDataURL(f)}}

  if(!role)return <Login onLogin={setRole}/>;
  if(!active)return null;

  const answer=active.answers[role];
  const requestsForRole=active.requests.filter(r=>r.from===role);
  const fulfilledForRole=requestsForRole.find(r=>r.status==="FULFILLED");

  return <div className="experimentApp">
    <header className="experimentTop"><div><span className="kicker">PROVENANCEOS™ / ANDAMOOKA EXPERIMENT</span><strong>{PEOPLE[role].tag} PORTAL</strong></div><div className="topCaseState"><span>{active.id}</span><button className="quietBtn" onClick={()=>setRole(null)}>SIGN OUT</button></div></header>
    <div className="experimentGrid">
      <aside className="caseRail"><div className="railHead"><span>CASES</span><b>{cases.length}</b></div>{cases.map(c=><button className={`caseItem ${c.id===active.id?"selected":""}`} key={c.id} onClick={()=>setActiveId(c.id)}><span>{c.id}</span><b>{c.answers.SPOONER&&c.answers.DANIELLE?"TWO RESPONSES":"IN PROGRESS"}</b><small>{c.date}</small></button>)}{role==="MAT"&&<button className="newCase" onClick={()=>setActiveId("NEW")}>+ NEW FIELD QUESTION</button>}</aside>
      <main className="caseWorkspace">
        {activeId==="NEW"?<NewQuestion q={q} setQ={setQ} obs={obs} setObs={setObs} img={img} setImg={setImg} create={createCase} attachFile={attachFile}/>:<>
          <div className="caseWorkspaceHead"><div><span className="kicker">{active.id} · KNOWLEDGE EVENT</span><h2>THE UNKNOWN</h2></div><span className={`statusPill ${bothAnswered?"ready":""}`}>{bothAnswered?"INDEPENDENT RESPONSES COMPLETE":"EVALUATION IN PROGRESS"}</span></div>
          <div className="fieldEvidence"><div className="photoWell">{active.image?<img src={active.image} alt="Field evidence"/>:<div><span>FIELD PHOTOGRAPH</span><small>Unknown specimen / field image</small></div>}</div><div className="questionBlock"><span className="kicker">OBSERVATION · {active.date}</span><blockquote>“{active.question}”</blockquote><p>{active.observation}</p><div className="blindNotice"><strong>BLIND EVALUATION</strong> · Spooner and Danielle work independently. Their answers, confidence, basis and information needs are sealed until both have responded.</div></div></div>

          {role!=="MAT"&&<ExpertWorkflow role={role} active={active} answer={answer} answerText={answer?.text||""} answerState={{answer,setAnswer,basis,setBasis,uncertainty,setUncertainty,confidence,setConfidence}} submitInitial={submitInitial} requestKind={requestKind} setRequestKind={setRequestKind} requestPrompt={requestPrompt} setRequestPrompt={setRequestPrompt} requestInfo={requestInfo} reassess={reassess} setReassess={setReassess} reassessConf={reassessConf} setReassessConf={setReassessConf} changed={changed} setChanged={setChanged} fulfilled={!!fulfilledForRole} readyForReassess={readyForReassess(role)} requestsForRole={requestsForRole}/>} 
          {role==="MAT"&&<MattWorkflow active={active} allAnswered={bothAnswered} openRequests={openRequests} fulfilId={fulfilId} setFulfilId={setFulfilId} fulfilText={fulfilText} setFulfilText={setFulfilText} fulfilImg={fulfilImg} setFulfilImg={setFulfilImg} fulfilRequest={fulfilRequest} attachFile={attachFile}/>} 
          {bothAnswered&&<Reveal active={active}/>} 
          <EventHistory active={active}/>
          {notice&&<button className="toast" onClick={()=>setNotice("")}>{notice}</button>}
        </>}
      </main>
    </div>
  </div>
}

function Login({onLogin}:{onLogin:(r:Role)=>void}){const[selected,setSelected]=useState<Role>("MAT");return <div className="portalLogin"><div className="loginMark"><span>PROVENANCEOS™</span><small>THE ANDAMOOKA EXPERIMENT / PHASE ONE</small></div><div className="loginCard"><span className="kicker">CONTROLLED KNOWLEDGE EXPERIMENT</span><h1>Who are you<br/><em>entering as?</em></h1><div className="roleChoices">{(Object.keys(PEOPLE) as Role[]).map(r=><button key={r} className={selected===r?"chosen":""} onClick={()=>setSelected(r)}><span>{PEOPLE[r].tag}</span><strong>{PEOPLE[r].name}</strong><small>{PEOPLE[r].title}</small></button>)}</div><button className="loginBtn" onClick={()=>onLogin(selected)}>ENTER {PEOPLE[selected].tag} PORTAL <span>↗</span></button><p className="loginFoot">Each participant enters separately. Expert responses remain blind until both have been independently locked.</p></div></div>}

function NewQuestion({q,setQ,obs,setObs,img,setImg,create,attachFile}:any){return <div className="newQuestion"><span className="kicker">FIELD PORTAL / NEW CASE</span><h2>Ask the unknown.</h2><p>Start with what happened in the field. Don't pre-classify the material. The system will carry the uncertainty forward.</p><label>PHOTOGRAPH<input type="file" accept="image/*" onChange={attachFile(setImg)}/></label>{img&&<img className="uploadPreview" src={img} alt="Preview"/>}<label>YOUR QUESTION<textarea value={q} onChange={(e:any)=>setQ(e.target.value)} placeholder="What is this? Why is it doing this? What am I missing?"/></label><label>FIELD OBSERVATION<input value={obs} onChange={(e:any)=>setObs(e.target.value)} placeholder="What did you notice — condition, location, behaviour, context?"/></label><button className="loginBtn" onClick={create}>LOCK QUESTION & SEND TO EXPERTS <span>→</span></button></div>}

function ExpertWorkflow({role,active,answer,answerState,submitInitial,requestKind,setRequestKind,requestPrompt,setRequestPrompt,requestInfo,reassess,setReassess,reassessConf,setReassessConf,changed,setChanged,fulfilled,readyForReassess,requestsForRole}:{role:Exclude<Role,"MAT">;active:Case;answer?:Answer;answerState:any;submitInitial:()=>void;requestKind:RequestKind;setRequestKind:any;requestPrompt:string;setRequestPrompt:any;requestInfo:()=>void;reassess:string;setReassess:any;reassessConf:number;setReassessConf:any;changed:boolean;setChanged:any;fulfilled:boolean;readyForReassess:boolean;requestsForRole:Request[]}){
  return <div className="workflowStack">
    <div className="expertResponse"><div className="responseHead"><div><span className="kicker">{PEOPLE[role].tag} / INDEPENDENT RESPONSE</span><h3>{PEOPLE[role].name}</h3><p>{PEOPLE[role].title}</p></div><div className="blindLock">◉ BLIND<br/><small>OTHER RESPONSE HIDDEN</small></div></div>
      {!answer?<><div className="captureGrid"><label>YOUR INTERPRETATION<textarea value={answerState.answer} onChange={e=>answerState.setAnswer(e.target.value)} placeholder="What do you think is happening, and why?"/></label><label>BASIS<textarea value={answerState.basis} onChange={e=>answerState.setBasis(e.target.value)} placeholder="What observations, experience or knowledge informs this judgement?"/></label><label>UNCERTAINTY<textarea value={answerState.uncertainty} onChange={e=>answerState.setUncertainty(e.target.value)} placeholder="What are you not sure about? What could you be missing?"/></label></div><div className="confidence"><div className="confidenceHeader"><span>CONFIDENCE</span><strong>{answerState.confidence}%</strong></div><input type="range" min="0" max="100" value={answerState.confidence} onChange={e=>answerState.setConfidence(+e.target.value)}/><small>Confidence belongs to the contribution. It is not proof of truth.</small></div><button className="loginBtn" onClick={submitInitial}>LOCK MY RESPONSE <span>→</span></button></>:<div className="lockedResponse"><span>INITIAL RESPONSE LOCKED · {answer.confidence}%</span><blockquote>“{answer.text}”</blockquote><div className="lockedGrid"><div><small>BASIS</small><p>{answer.basis}</p></div><div><small>UNCERTAINTY</small><p>{answer.uncertainty}</p></div></div></div>}
    </div>

    {answer&&<div className="probeCard"><span className="kicker">01 / PROBE · INFORMATION NEED</span><h3>What would help you decide?</h3><p>The system should not force a conclusion. Tell Matt what information would materially improve your judgement.</p>{answer.request?<div className="requestLocked"><strong>REQUEST SENT</strong><span>{REQUESTS[answer.request.kind]}</span><p>{answer.request.prompt}</p>{requestsForRole[0]?.status==="OPEN"&&<small>Awaiting field information.</small>}{fulfilled&&<small className="fulfilledLabel">FIELD INFORMATION RECEIVED · REASSESSMENT AVAILABLE</small>}</div>:<><div className="requestChoices">{(Object.keys(REQUESTS) as RequestKind[]).map(k=><button key={k} className={requestKind===k?"active":""} onClick={()=>setRequestKind(k)}>{REQUESTS[k]}</button>)}</div><textarea value={requestPrompt} onChange={e=>setRequestPrompt(e.target.value)} placeholder="Optional: ask for something specific. e.g. “Can Matt photograph the material wet and dry from the same angle?”"/><button className="btn accent wide" onClick={requestInfo}>REQUEST FURTHER INFORMATION <span>→</span></button></>}</div>}

    {answer&&!answer.reassessment&&readyForReassess&&<div className="reassessCard"><span className="kicker">02 / REASSESS · EVIDENCE RETURNED</span><h3>The information you asked for is here.</h3><div className="returnedEvidence">{active.requests.filter(r=>r.from===role&&r.status==="FULFILLED").map(r=><div key={r.id}><span>{REQUESTS[r.kind]}</span><p>{r.response}</p>{r.image&&<img src={r.image} alt="Returned field evidence"/>}</div>)}</div><div className="assessChoices"><button className={changed?"active":""} onClick={()=>setChanged(true)}>Yes — my view has changed</button><button className={!changed?"active":""} onClick={()=>setChanged(false)}>No — I maintain my view</button></div><textarea value={reassess} onChange={e=>setReassess(e.target.value)} placeholder="What does the new information mean for your original judgement?"/><div className="confidence"><div className="confidenceHeader"><span>REASSESSED CONFIDENCE</span><strong>{reassessConf}%</strong></div><input type="range" min="0" max="100" value={reassessConf} onChange={e=>setReassessConf(+e.target.value)}/></div><button className="loginBtn" onClick={()=>reassess.trim()&&((window as any)._noop=0)}>RECORD REASSESSMENT <span>→</span></button><button className="srOnlyAction" onClick={()=>{}}> </button></div>}

    {answer?.reassessment&&<div className="reassessmentDone"><span className="kicker">REASSESSMENT RECORDED</span><h3>{answer.reassessment.changed?"The view moved.":"The view held."}</h3><p>{answer.reassessment.text}</p><strong>{answer.reassessment.confidence}% confidence</strong></div>}
  </div>
}

function MattWorkflow({active,allAnswered,openRequests,fulfilId,setFulfilId,fulfilText,setFulfilText,fulfilImg,setFulfilImg,fulfilRequest,attachFile}:any){return <div className="matWorkflow"><div className="matWaiting"><span className="kicker">FIELD PORTAL / CASE STATUS</span><h3>{allAnswered?"Both independent responses are in.":"Your question is now out of your hands."}</h3><p>{allAnswered?"The blind evaluation is complete. The two readings can now be compared — and any requests for further information can be answered without rewriting the original observation.":"Spooner and Danielle are working independently. You will not see either response until both have locked their initial judgement."}</p></div>{openRequests.length>0&&<div className="fieldRequests"><div className="requestHeader"><span className="kicker">INFORMATION REQUESTS</span><strong>{openRequests.length} OPEN</strong></div>{openRequests.map((r:Request)=><article key={r.id} className={fulfilId===r.id?"selected":""}><div><span className="roleTag">{PEOPLE[r.from].tag}</span><h4>{PEOPLE[r.from].name} is asking</h4><p>“{r.prompt}”</p><small>{REQUESTS[r.kind]}</small></div><button className="btn accent" onClick={()=>setFulfilId(r.id)}>SUPPLY INFORMATION</button></article>)}{fulfilId&&<div className="fulfilPanel"><span className="kicker">FIELD RESPONSE</span><textarea value={fulfilText} onChange={e=>setFulfilText(e.target.value)} placeholder="Describe what you found, what you observed, or the additional context you can provide."/><label>OPTIONAL PHOTOGRAPH / VIDEO FRAME<input type="file" accept="image/*" onChange={attachFile(setFulfilImg)}/></label>{fulfilImg&&<img className="uploadPreview" src={fulfilImg} alt="Additional evidence"/>}<button className="loginBtn" onClick={fulfilRequest}>RETURN INFORMATION TO EXPERT <span>→</span></button></div>}</div>}</div>}

function Reveal({active}:{active:Case}){return <div className="revealSection"><div className="revealHead"><div><span className="kicker">BLIND EVALUATION COMPLETE</span><h3>Two independent readings.<br/><em>One unknown.</em></h3></div><span className="statusPill ready">REVEALED</span></div><div className="answersGrid">{(["SPOONER","DANIELLE"] as Role[]).map(r=>{const a=active.answers[r]!;return <article key={r}><span className="roleTag">{PEOPLE[r].tag}</span><h4>{PEOPLE[r].name}</h4><blockquote>“{a.text}”</blockquote><div className="revealMeta"><span>CONFIDENCE · {a.confidence}%</span><span>BASIS · {a.basis}</span></div>{a.reassessment&&<div className="miniReassessment"><b>{a.reassessment.changed?"VIEW CHANGED":"VIEW MAINTAINED"}</b><p>{a.reassessment.text}</p><small>REASSESSED CONFIDENCE · {a.reassessment.confidence}%</small></div>}</article>})}</div><div className="disagreement"><span className="kicker">WHAT REMAINS OPEN</span><h4>Disagreement is data.</h4><p>The system preserves the competing claims, their confidence, the information each person needed, and whether new evidence moved the conclusion.</p></div></div>}

function EventHistory({active}:{active:Case}){return <div className="eventHistory"><div><span className="kicker">PROVENANCE LEDGER · CASE HISTORY</span><strong>{active.eventLog.length} EVENTS</strong></div><div className="eventLog">{active.eventLog.map((e,i)=><span key={i}><b>{String(i+1).padStart(2,"0")}</b>{e}</span>)}</div></div>}
