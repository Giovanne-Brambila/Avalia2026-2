import { fail, getUser, json } from "../../../_lib/session.js";

export async function onRequestPost(ctx) {
  const user = await getUser(ctx);
  if (!user) return fail("Entre com o Discord.", 401);
  const id = Number(ctx.params.id);
  if (!Number.isInteger(id)) return fail("Aviso inválido.");
  const visivel = await ctx.env.DB.prepare(
    "SELECT a.id FROM avisos a JOIN inscricoes i ON i.disciplina_id = a.disciplina_id AND i.user_id = ? WHERE a.id = ?"
  ).bind(user.user_id, id).first();
  if (!visivel) return fail("Aviso não encontrado no seu feed.", 404);

  const body = await ctx.request.json().catch(() => ({}));
  const atual = await ctx.env.DB.prepare("SELECT lido, fixado FROM avisos_estado WHERE user_id = ? AND aviso_id = ?").bind(user.user_id, id).first();
  const lido = body.lido === undefined ? (atual?.lido ?? 0) : body.lido ? 1 : 0;
  const fixado = body.fixado === undefined ? (atual?.fixado ?? 0) : body.fixado ? 1 : 0;
  await ctx.env.DB.prepare(
    "INSERT INTO avisos_estado (user_id, aviso_id, lido, fixado) VALUES (?, ?, ?, ?) ON CONFLICT(user_id, aviso_id) DO UPDATE SET lido = excluded.lido, fixado = excluded.fixado"
  ).bind(user.user_id, id, lido, fixado).run();
  return json({ ok: true, lido, fixado });
}
