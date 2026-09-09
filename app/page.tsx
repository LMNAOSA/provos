"use client";
import { KnowledgeExperiment } from "./components/KnowledgeExperimentClean";

const PEOPLE = [
  { role: "FIELD", name: "Matt Kathagen", detail: "Mooka Boys · field / mining knowledge", number: "01" },
  { role: "SCIENCE", name: "Professor Nigel Spooner", detail: "Radiation physics · luminescence", number: "02" },
  { role: "ANALYSIS", name: "Danielle Questiaux", detail: "Analytical interpretation · geological context", number: "03" },
];

const STEPS = [
  ["01", "OBSERVE", "The field question is recorded before interpretation begins."],
  ["02", "INTERPRET", "Each expert works from the same observation, independently."],
  ["03", "PROBE", "pXRF is absent until an expert decides the measurement would help."],
  ["04", "REASSESS", "New evidence changes the probability — or it does not."],
  ["05", "REVEAL", "The independent readings meet. Disagreement becomes part of the record."],
];

export default function Home() {
  return (
    <>
      <header className="topbar">
        <div className="barInner">
          <a className="brand" href="#top">PROVENANCEOS™</a>
          <span className="topMeta">THE ANDAMOOKA EXPERIMENT · PHASE ONE</span>
        </div>
      </header>

      <main id="top" className="presentation">
        <section className="presentationHero">
          <div className="shell heroInner">
            <span className="kicker">A CONTROLLED KNOWLEDGE EXPERIMENT</span>
            <p className="heroTitle">What happens when expertise is treated as <em>evidence?</em></p>
            <p className="heroDeck">ProvenanceOS™ is a way of preserving not only what an expert thinks, but how they got there — what they were uncertain about, what they asked for next, and whether the evidence changed their mind.</p>
            <div className="heroQuestion">
              <span>PHASE ONE · STOCK QUESTION</span>
              <strong>“Why is this hard matrix phosphorescing so much?”</strong>
            </div>
            <a className="enterLink" href="#live">ENTER THE LIVING DEMO <i>↓</i></a>
          </div>
        </section>

        <section className="storySection storyProblem">
          <div className="shell storyGrid">
            <div>
              <span className="kicker">THE PROBLEM</span>
              <h2>Knowledge lives in people.<br /><em>Then the moment is gone.</em></h2>
            </div>
            <div className="storyCopy">
              <p className="leadSerif">A miner can recognise something from years underground. A scientist can recognise a mechanism from years of measurement. An analyst can see a pattern others miss.</p>
              <p>But when the conversation ends, most systems keep the conclusion and lose the reasoning. The useful part of the interaction — the judgement, uncertainty, request for evidence and change in confidence — disappears.</p>
            </div>
          </div>
        </section>

        <section className="peopleSection">
          <div className="shell">
            <div className="sectionIntro">
              <span className="kicker">THREE PEOPLE · ONE UNKNOWN</span>
              <h2>Different expertise.<br /><em>Same question.</em></h2>
              <p>The first experiment deliberately stays small. Three people. One real question. One closed loop that can be observed, challenged and improved before it is scaled.</p>
            </div>
            <div className="peopleGrid">
              {PEOPLE.map((person) => (
                <article key={person.number}>
                  <span className="personNo">{person.number}</span>
                  <span className="personRole">{person.role}</span>
                  <h3>{person.name}</h3>
                  <p>{person.detail}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="methodSection">
          <div className="shell">
            <span className="kicker">THE METHOD</span>
            <h2>Don't capture the answer.<br /><em>Capture the reasoning.</em></h2>
            <div className="stepRail">
              {STEPS.map(([no, title, body]) => (
                <article key={no}>
                  <span>{no}</span>
                  <h3>{title}</h3>
                  <p>{body}</p>
                </article>
              ))}
            </div>
            <div className="methodQuote">“The original judgement is never overwritten.”</div>
          </div>
        </section>

        <section id="live" className="liveSection">
          <div className="shell">
            <div className="liveHeader">
              <div>
                <span className="kicker">THE LIVING DEMO</span>
                <h2>Now do one.</h2>
                <p>Use the participant control inside the prototype to move the same case through field observation, independent response, pXRF request, reassessment and reveal.</p>
              </div>
              <div className="liveMark"><span className="liveDot" />LIVE · PHASE ONE PROTOTYPE</div>
            </div>
            <div className="demoIntro">
              <div><span>CASE 001</span><strong>Why is this hard matrix phosphorescing so much?</strong></div>
              <p>pXRF starts as <b>NO DATA SUPPLIED</b>. That absence is part of the experiment.</p>
            </div>
            <KnowledgeExperiment />
          </div>
        </section>

        <section className="evidenceSection">
          <div className="shell evidenceGrid">
            <div>
              <span className="kicker">WHAT THE SYSTEM PRESERVES</span>
              <h2>A history, not just a result.</h2>
            </div>
            <div className="evidenceList">
              <div><b>OBSERVATION</b><span>What was actually seen in the field.</span></div>
              <div><b>INTERPRETATION</b><span>What each expert independently thought was happening.</span></div>
              <div><b>PROBABILITY</b><span>How confident they were before further evidence.</span></div>
              <div><b>EVIDENCE REQUEST</b><span>What information they believed would discriminate between possibilities.</span></div>
              <div><b>REASSESSMENT</b><span>What changed after the evidence arrived — and how much.</span></div>
              <div><b>DISAGREEMENT</b><span>Where different kinds of expertise continue to see the unknown differently.</span></div>
            </div>
          </div>
        </section>

        <section className="phaseSection">
          <div className="shell phaseGrid">
            <div>
              <span className="kicker">PHASE ONE</span>
              <h2>Start small.<br /><em>Learn the system.</em></h2>
            </div>
            <div className="phaseCopy">
              <p className="leadSerif">This is not a claim that the whole system has already been solved.</p>
              <p>Phase One is intentionally a closed-loop trial: a small group uses real questions, real expertise and real measurements to discover what needs to be captured, what should stay blind, and what makes the record genuinely useful.</p>
              <div className="phasePath"><span>THREE PEOPLE</span><i>→</i><span>REAL QUESTIONS</span><i>→</i><span>TESTED WORKFLOW</span><i>→</i><span>MINERS</span></div>
            </div>
          </div>
        </section>

        <section className="closingSection">
          <div className="shell">
            <span className="kicker">THE PROPOSITION</span>
            <h2>The conclusion can move.<br /><em>The history stays.</em></h2>
            <p>That is the difference between storing an answer and preserving knowledge.</p>
          </div>
        </section>
      </main>

      <footer>
        <div className="shell"><small>AUSTRALIAN PROVENANCE PROJECT · PROVENANCEOS™ · THE ANDAMOOKA EXPERIMENT · PHASE ONE</small></div>
      </footer>
    </>
  );
}
