"use client";

import { motion } from "motion/react";

const nodes = [
  { key: "matt", x: 9, y: 25, label: "MATT", detail: "field observation" },
  { key: "spec", x: 49, y: 50, label: "SPECIMEN", detail: "AND-MX-00017" },
  { key: "spooner", x: 80, y: 19, label: "SPOONER", detail: "scientific interpretation" },
  { key: "questiaux", x: 82, y: 78, label: "QUESTIAUX", detail: "geological interpretation" },
  { key: "pxrf", x: 18, y: 77, label: "pXRF", detail: "measurement" }
];

const edges = [
  ["matt", "spec"], ["spec", "spooner"], ["spec", "questiaux"], ["pxrf", "spec"], ["pxrf", "spooner"]
];

function pos(key: string) {
  const n = nodes.find((x) => x.key === key)!;
  return `${n.x}% ${n.y}%`;
}

export function KnowledgeGraph() {
  return (
    <div className="graph">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        {edges.map(([a, b], i) => {
          const A = nodes.find((n) => n.key === a)!;
          const B = nodes.find((n) => n.key === b)!;
          return <motion.line key={i} x1={A.x} y1={A.y} x2={B.x} y2={B.y} stroke="rgba(201,168,111,.38)" strokeWidth="0.3" strokeDasharray="1.6 1.8" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} transition={{ duration: 1.3, delay: i * 0.08 }} />;
        })}
      </svg>
      {nodes.map((n) => (
        <motion.div key={n.key} className={`graphNode node-${n.key}`} style={{ left: pos(n.key).split(" ")[0], top: pos(n.key).split(" ")[1] }} initial={{ scale: 0.8, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} transition={{ duration: 0.45, delay: 0.15 }}>
          <span>{n.label}</span><small>{n.detail}</small>
        </motion.div>
      ))}
      <div className="graphCore">THE<br/>KNOWLEDGE<br/>EVENT</div>
    </div>
  );
}
