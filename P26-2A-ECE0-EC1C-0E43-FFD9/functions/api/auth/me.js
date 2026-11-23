import { getUser, json } from "../../_lib/session.js";

export async function onRequestGet(ctx) {
  const user = await getUser(ctx);
  return json({ ok: true, user });
}
