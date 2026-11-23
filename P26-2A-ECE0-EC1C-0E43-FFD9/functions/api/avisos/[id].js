import { fail, getUser, json } from "../../_lib/session.js";
import { validarAviso } from "../../_lib/avisos.js";

async function carregar(ctx) {
  const user = await getUser(ctx);
  if (!user) return { error: fail("Entre com o Discord.", 401) };
  const id = Number(ctx.params.id);
  if (!Number.isInteger(id)) return { error: fail("Aviso inválido.") };
  const aviso = await ctx.env.DB.prepare("SELECT id, user_id FROM avisos WHERE id = ?").bind(id).first();
  if (!aviso) return { error: fail("Aviso não encontrado.", 404) };
  if (aviso.user_id !== user.user_id) return { error: fail("Só o autor pode alterar este aviso.", 403) };
  return { id };
}

export async function onRequestPut(ctx) {
  const r = await carregar(ctx);
  if (r.error) return r.error;
  const body = await ctx.request.json().catch(() => ({}));
  const v = validarAviso(body);
  if (v.error) return fail(v.error);
  const { tipo, titulo, conteudo, url } = v.value;
  await ctx.env.DB.prepare("UPDATE avisos SET tipo = ?, titulo = ?, conteudo = ?, url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
    .bind(tipo, titulo, conteudo, url, r.id).run();
  return json({ ok: true });
}

export async function onRequestDelete(ctx) {
  const r = await carregar(ctx);
  if (r.error) return r.error;
  await ctx.env.DB.batch([
    ctx.env.DB.prepare("DELETE FROM avisos_estado WHERE aviso_id = ?").bind(r.id),
    ctx.env.DB.prepare("DELETE FROM avisos WHERE id = ?").bind(r.id),
  ]);
  return json({ ok: true });
}
