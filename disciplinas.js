import { fail, getUser, json } from "../_lib/session.js";

export async function onRequestGet(ctx) {
  const user = await getUser(ctx);
  if (!user) return fail("Entre com o Discord para ver as disciplinas.", 401);
  const { results } = await ctx.env.DB.prepare(
    "SELECT d.id, d.codigo, d.nome, CASE WHEN i.user_id IS NULL THEN 0 ELSE 1 END AS inscrito FROM disciplinas d LEFT JOIN inscricoes i ON i.disciplina_id = d.id AND i.user_id = ? ORDER BY d.codigo"
  ).bind(user.user_id).all();
  return json({ ok: true, disciplinas: results });
}

export async function onRequestPost(ctx) {
  const user = await getUser(ctx);
  if (!user) return fail("Entre com o Discord para criar disciplinas.", 401);
  const body = await ctx.request.json().catch(() => ({}));
  const codigo = String(body.codigo || "").trim().toUpperCase();
  const nome = String(body.nome || "").trim();
  if (!/^[A-Z0-9-]{2,12}$/.test(codigo)) return fail("Código inválido: use 2 a 12 letras, números ou hífen.");
  if (nome.length < 2 || nome.length > 80) return fail("O nome deve ter de 2 a 80 caracteres.");
  try {
    await ctx.env.DB.prepare("INSERT INTO disciplinas (codigo, nome) VALUES (?, ?)").bind(codigo, nome).run();
  } catch {
    return fail("Já existe uma disciplina com esse código.", 409);
  }
  return json({ ok: true }, 201);
}
