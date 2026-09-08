export const runtime = "edge";

const SOURCE_URL =
  "https://raw.githubusercontent.com/LMNAOSA/provos/main/Matrixtwin_opal.glb";

export async function GET() {
  try {
    const upstream = await fetch(SOURCE_URL, {
      cache: "no-store",
      headers: { Accept: "application/octet-stream" },
    });

    if (!upstream.ok) {
      return new Response(`Specimen source unavailable (${upstream.status})`, {
        status: 502,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    const bytes = await upstream.arrayBuffer();
    const view = new Uint8Array(bytes);

    // A GLB starts with the ASCII magic "glTF". Fail clearly rather than
    // handing Three.js an HTML/JSON error response disguised as a model.
    if (
      view.length < 4 ||
      view[0] !== 0x67 ||
      view[1] !== 0x6c ||
      view[2] !== 0x54 ||
      view[3] !== 0x46
    ) {
      return new Response("Specimen source is not a valid GLB", {
        status: 502,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    return new Response(bytes, {
      status: 200,
      headers: {
        "Content-Type": "model/gltf-binary",
        "Content-Length": String(bytes.byteLength),
        "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
      },
    });
  } catch (error) {
    console.error("Matrix Twin proxy failed", error);
    return new Response("Unable to retrieve specimen model", {
      status: 502,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}
