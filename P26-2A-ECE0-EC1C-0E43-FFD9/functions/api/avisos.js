import { fail, getUser, json } from "../_lib/session.js";
import { validarAviso } from "../_lib/avisos.js";

export async function onRequestGet(ctx) {
  const user = await getUser(ctx);
  if (!user) return fail("Entre com o Discord.", 401);
  const { results } = await ctx.env.DB.prepare(
    "SELECT a.id, a.disciplina_id, d.codigo, d.nome AS disciplina_nome, a.user_id, a.username, a.tipo, a.titulo, a.conteudo, a.url, a.created_at, a.updated_at, COALESCE(e.lido, 0) AS lido, COALESCE(e.fixado, 0) AS fixado FROM avisos a JOIN disciplinas d ON d.id = a.disciplina_id JOIN inscricoes i ON i.disciplina_id = a.disciplina_id AND i.user_id = ? LEFT JOIN avisos_estado e ON e.aviso_id = a.id AND e.user_id = ? ORDER BY fixado DESC, a.id DESC LIMIT 100"
  ).bind(user.user_id, user.user_id).all();
  return json({ ok: true, avisos: results });
}

export async function onRequestPost(ctx) {
  const user = await getUser(ctx);
  if (!user) return fail("Entre com o Discord para publicar.", 401);
  const body = await ctx.request.json().catch(() => ({}));
  const disciplinaId = Number(body.disciplina_id);
  if (!Number.isInteger(disciplinaId)) return fail("Escolha uma disciplina.");
  const v = validarAviso(body);
  if (v.error) return fail(v.error);
  const inscrito = await ctx.env.DB.prepare("SELECT 1 AS ok FROM inscricoes WHERE user_id = ? AND disciplina_id = ?").bind(user.user_id, disciplinaId).first();
  if (!inscrito) return fail("Inscreva-se na disciplina antes de publicar nela.", 403);
  const { tipo, titulo, conteudo, url } = v.value;
  await ctx.env.DB.prepare(
    "INSERT INTO avisos (disciplina_id, user_id, username, tipo, titulo, conteudo, url) VALUES (?, ?, ?, ?, ?, ?, ?)"
  ).bind(disciplinaId, user.user_id, user.username, tipo, titulo, conteudo, url).run();
  return json({ ok: true }, 201);
}
