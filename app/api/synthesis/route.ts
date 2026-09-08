import { NextResponse } from "next/server";

/**
 * Phase One API seam.
 *
 * This endpoint deliberately returns a provisional, structured synthesis without
 * inventing scientific evidence. Replace the placeholder logic with AI SDK 7
 * tool calls once authenticated Phase One data sources are connected.
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const claim = typeof body?.claim === "string" ? body.claim : "No claim supplied";
  const confidence = Number(body?.confidence ?? 0);
  const evidence = Array.isArray(body?.evidence) ? body.evidence : [];

  return NextResponse.json({
    status: "provisional",
    synthesis: `Provisional synthesis of: ${claim}`,
    confidence: Math.max(0, Math.min(100, confidence)),
    evidence,
    provenance: {
      mode: "DEMONSTRATION",
      authenticated: false,
      note: "No scientific conclusion should be inferred from this placeholder synthesis."
    }
  });
}
