"use client";
import { KnowledgeExperiment } from "./components/KnowledgeExperimentClean";

const PEOPLE = [
  { no: "01", role: "FIELD", name: "Matt Kathagen", detail: "Mooka Boys · field / mining knowledge" },
  { no: "02", role: "SCIENCE", name: "Professor Nigel Spooner", detail: "Radiation physics · luminescence" },
  { no: "03", role: "ANALYSIS", name: "Danielle Questiaux", detail: "Analytical interpretation · geological context" },
];

const METHOD = [
  ["01", "SEE", "Record the field observation before interpretation."],
  ["02", "THINK", "Two experts make independent judgements from the same evidence."],
  ["03", "ASK", "An expert can request a measurement — but must say why it matters."],
  ["04", "REASSESS", "New evidence arrives. The original judgement stays intact."],
  ["05", "REVEAL", "Only then do the independent readings meet."],
];

export default function Home() {
  return (
    <div className="site">
      <header className="siteHeader">
        <a href="#top" className="wordmark">PROVENANCEOS<span>™</span></a>
        <div className="headerRight"><span>THE ANDAMOOKA EXPERIMENT</span><i>PHASE ONE</i></div>
      </header>

      <main id="top">
        <section className="heroNew">
          <div className="heroNewInner">
            <div className="heroEyebrow"><span>AUSTRALIAN PROVENANCE PROJECT</span><b>01 / 05</b></div>
            <h1>Knowledge lives<br />in <em>people.</em></h1>
            <div className="heroBottom">
              <p className="heroStatement">When the conversation ends, the answer often survives. The thinking that produced it does not.</p>
              <p className="heroSmall">ProvenanceOS™ is an experiment in capturing the observation, judgement, uncertainty, evidence request and change of mind — not just the conclusion.</p>
            </div>
            <a href="#experiment" className="scrollCue"><span>SEE THE EXPERIMENT</span><b>↓</b></a>
          </div>
        </section>

        <section className="statementSection">
          <div className="wideGrid">
            <div className="sectionNumber">01</div>
            <div><span className="eyebrow">THE IDEA</span><h2>Don't just capture<br /><em>the answer.</em></h2></div>
            <div className="statementCopy"><p className="bigCopy">Capture what they saw. What they think. Why they think it. How certain they are. What they need to know next. And what changes when they get it.</p></div>
          </div>
        </section>

        <section className="peopleNew">
          <div className="wideGrid peopleHead">
            <div className="sectionNumber">02</div>
            <div><span className="eyebrow">THREE PEOPLE · ONE QUESTION</span><h2>One unknown.<br /><em>Three ways in.</em></h2></div>
            <p>Phase One is deliberately small. The point is not to prove the whole system. It is to find out what the system needs to preserve.</p>
          </div>
          <div className="peopleLine">
            {PEOPLE.map((person) => <article key={person.no}><span className="personNo">{person.no}</span><span className="personRole">{person.role}</span><h3>{person.name}</h3><p>{person.detail}</p></article>)}
          </div>
        </section>

        <section className="methodNew">
          <div className="wideGrid">
            <div className="sectionNumber">03</div>
            <div><span className="eyebrow">THE METHOD</span><h2>Keep the<br /><em>chain intact.</em></h2></div>
            <div className="methodContent">
              <p className="bigCopy">The answer is only one point in a much longer chain of knowledge.</p>
              <div className="methodSteps">{METHOD.map(([no,title,body]) => <article key={no}><span>{no}</span><div><b>{title}</b><p>{body}</p></div></article>)}</div>
            </div>
          </div>
        </section>

        <section id="experiment" className="experimentSectionNew">
          <div className="experimentIntro wideGrid">
            <div className="sectionNumber">04</div>
            <div><span className="eyebrow">THE LIVING DEMO</span><h2>Let's run<br /><em>one.</em></h2></div>
            <div className="experimentLead"><p>Case 001 is a real field question. The photographs are supplied. The pXRF result is deliberately absent.</p><div className="caseBadge"><span>CASE 001</span><b>NO XRF DATA SUPPLIED</b></div></div>
          </div>
          <div className="demoFrame">
            <div className="demoFrameTop"><span>CASE 001 · LIVE PROTOTYPE</span><span>OBSERVE → INTERPRET → REQUEST → REASSESS → REVEAL</span></div>
            <KnowledgeExperiment />
          </div>
        </section>

        <section className="preserveNew">
          <div className="wideGrid">
            <div className="sectionNumber">05</div>
            <div><span className="eyebrow">WHAT REMAINS</span><h2>A history,<br /><em>not just a result.</em></h2></div>
            <div className="preserveList">
              {[["OBSERVATION","What was actually seen."],["JUDGEMENT","What each person thought — independently."],["UNCERTAINTY","What they did not know."],["EVIDENCE","What they needed next, and why."],["CHANGE","What moved when evidence arrived."],["DISAGREEMENT","Where expertise still sees differently."]].map(([a,b]) => <div key={a}><b>{a}</b><span>{b}</span></div>)}
            </div>
          </div>
        </section>

        <section className="phaseNew">
          <div className="phaseInner">
            <span className="eyebrow">PHASE ONE</span>
            <h2>Start small.<br /><em>Learn the system.</em></h2>
            <p>Three people. Real questions. Real observations. Real measurements. A closed-loop trial that can be tested and refined before it is taken to the miners.</p>
            <div className="phaseChain"><span>THREE PEOPLE</span><i>→</i><span>REAL QUESTIONS</span><i>→</i><span>TESTED WORKFLOW</span><i>→</i><span>MINERS</span></div>
          </div>
        </section>

        <section className="endNew"><span className="eyebrow">THE PROPOSITION</span><h2>The conclusion can move.<br /><em>The history stays.</em></h2><p>That is the difference between storing an answer and preserving knowledge.</p></section>
      </main>

      <footer className="siteFooter"><span>AUSTRALIAN PROVENANCE PROJECT</span><span>PROVENANCEOS™ · THE ANDAMOOKA EXPERIMENT</span></footer>
    </div>
  );
}
