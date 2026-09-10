import type { Metadata } from "next";
import "./globals.css";
import "./experiment.css";
import "./experiment-v2.css";
import "./ive.css";
import "./ive-detail.css";
import "./knowledge-experiment.css";
import "./presentation.css";
import "./provenance-redesign.css";
import "./demo-polish.css";
import "./case-image-fix.css";

export const metadata: Metadata = {
  title: "The Andamooka Experiment — ProvenanceOS™",
  description: "A closed-loop experiment in learning from human expertise without losing where the knowledge came from.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
