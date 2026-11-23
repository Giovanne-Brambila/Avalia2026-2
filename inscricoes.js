import { fail, getUser, json } from "../_lib/session.js";

export async function onRequestPost(ctx) {
  const user = await getUser(ctx);
  if (!user) return fail("Entre com o Discord.", 401);
  const body = await ctx.request.json().catch(() => ({}));
  const id = Number(body.disciplina_id);
  if (!Number.isInteger(id)) return fail("Disciplina inválida.");
  const disc = await ctx.env.DB.prepare("SELECT id FROM disciplinas WHERE id = ?").bind(id).first();
  if (!disc) return fail("Disciplina não encontrada.", 404);
  if (body.inscrito) {
    await ctx.env.DB.prepare("INSERT OR IGNORE INTO inscricoes (user_id, disciplina_id) VALUES (?, ?)").bind(user.user_id, id).run();
  } else {
    await ctx.env.DB.prepare("DELETE FROM inscricoes WHERE user_id = ? AND disciplina_id = ?").bind(user.user_id, id).run();
  }
  return json({ ok: true });
}
