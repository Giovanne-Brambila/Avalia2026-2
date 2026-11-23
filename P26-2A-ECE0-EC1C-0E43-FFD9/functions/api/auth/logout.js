import { cookie } from "../../_lib/session.js";

export async function onRequestPost() {
  const headers = new Headers({ "Content-Type": "application/json" });
  headers.append("Set-Cookie", cookie("session", "", 0));
  return new Response(JSON.stringify({ ok: true }), { headers });
}
