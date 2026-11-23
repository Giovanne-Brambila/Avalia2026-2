export const TIPOS = ["aviso", "lembrete", "link"];

export function validarAviso(body) {
  const tipo = String(body.tipo || "aviso");
  const titulo = String(body.titulo || "").trim();
  const conteudo = String(body.conteudo || "").trim();
  const url = String(body.url || "").trim();
  if (!TIPOS.includes(tipo)) return { error: "Tipo inválido." };
  if (titulo.length < 1 || titulo.length > 120) return { error: "O título deve ter de 1 a 120 caracteres." };
  if (conteudo.length < 1 || conteudo.length > 1000) return { error: "O texto deve ter de 1 a 1000 caracteres." };
  if (tipo === "link" && !/^https?:\/\/\S+$/i.test(url)) return { error: "Informe um link começando com http:// ou https://." };
  return { value: { tipo, titulo, conteudo, url: tipo === "link" ? url : null } };
}
