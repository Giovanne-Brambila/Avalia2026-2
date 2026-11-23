const $ = (s) => document.querySelector(s);
const state = { user: null, disciplinas: [], avisos: [], filtro: "" };

async function api(path, opts = {}) {
  const res = await fetch(path, {
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    ...opts,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Erro " + res.status);
  return data;
}

function el(tag, props = {}, ...kids) {
  const node = document.createElement(tag);
  Object.assign(node, props);
  kids.flat().forEach((k) => node.append(k));
  return node;
}

function setMsg(text, isErr = false) {
  const m = $("#msg");
  m.textContent = text;
  m.className = isErr ? "err" : "";
}

function renderAuth() {
  const box = $("#auth");
  box.replaceChildren();
  if (!state.user) return;
  box.append(
    el("img", { src: state.user.avatar, alt: "" }),
    el("span", { textContent: state.user.username }),
    el("button", { className: "btn small", textContent: "Sair", onclick: sair })
  );
}

function renderDisciplinas() {
  const wrap = $("#disciplinas");
  wrap.replaceChildren();
  state.disciplinas.forEach((d) => {
    const chip = el("button", {
      className: "chip",
      type: "button",
      textContent: d.codigo + " · " + d.nome + (d.inscrito ? " ✓" : ""),
      title: d.inscrito ? "Clique para cancelar a inscrição" : "Clique para se inscrever",
    });
    chip.setAttribute("aria-pressed", d.inscrito ? "true" : "false");
    chip.onclick = async () => {
      try {
        await api("/api/inscricoes", { method: "POST", body: { disciplina_id: d.id, inscrito: !d.inscrito } });
        await carregar();
      } catch (e) { setMsg(e.message, true); }
    };
    wrap.append(chip);
  });

  const inscritas = state.disciplinas.filter((d) => d.inscrito);
  const sel = $("#selDisc");
  sel.replaceChildren(...(inscritas.length
    ? inscritas.map((d) => el("option", { value: d.id, textContent: d.codigo + " · " + d.nome }))
    : [el("option", { value: "", textContent: "Inscreva-se em uma disciplina primeiro" })]));

  const f = $("#filtro");
  f.replaceChildren(el("option", { value: "", textContent: "Todas as minhas disciplinas" }),
    ...inscritas.map((d) => el("option", { value: d.id, textContent: d.codigo })));
  f.value = state.filtro;
}

function fmtData(s) {
  if (!s) return "";
  const d = new Date(s.replace(" ", "T") + "Z");
  return isNaN(d) ? s : d.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

function renderFeed() {
  const feed = $("#feed");
  feed.replaceChildren();
  const lista = state.avisos.filter((a) => !state.filtro || String(a.disciplina_id) === String(state.filtro));
  if (!lista.length) {
    feed.append(el("p", { className: "empty", textContent: "Nenhum comunicado ainda. Inscreva-se em uma disciplina e publique o primeiro." }));
    return;
  }
  lista.forEach((a) => {
    const meta = a.codigo + " · " + a.tipo + " · por " + a.username + " · " + fmtData(a.created_at) + (a.updated_at ? " (editado)" : "");
    const card = el("article", { className: "aviso" + (a.fixado ? " fixado" : "") + (a.lido ? " lido" : "") },
      el("h3", { textContent: (a.fixado ? "📌 " : "") + a.titulo }),
      el("div", { className: "meta", textContent: meta }),
      el("p", { textContent: a.conteudo }));
    if (a.url) card.append(el("p", {}, el("a", { href: a.url, target: "_blank", rel: "noopener noreferrer", textContent: a.url })));

    const acoes = el("div", { className: "actions" },
      el("button", { className: "btn small" + (a.lido ? " on" : ""), textContent: a.lido ? "Lido ✓" : "Marcar como lido", onclick: () => estado(a.id, { lido: !a.lido }) }),
      el("button", { className: "btn small pin" + (a.fixado ? " on" : ""), textContent: a.fixado ? "Fixado" : "Fixar", onclick: () => estado(a.id, { fixado: !a.fixado }) }));
    if (state.user && a.user_id === state.user.user_id) {
      acoes.append(
        el("button", { className: "btn small", textContent: "Editar", onclick: () => abrirEdicao(a) }),
        el("button", { className: "btn small danger", textContent: "Excluir", onclick: () => excluir(a) }));
    }
    card.append(acoes);
    feed.append(card);
  });
}

async function carregar() {
  const [d, a] = await Promise.all([api("/api/disciplinas"), api("/api/avisos")]);
  state.disciplinas = d.disciplinas;
  state.avisos = a.avisos;
  if (state.filtro && !state.disciplinas.some((x) => x.inscrito && String(x.id) === String(state.filtro))) state.filtro = "";
  renderDisciplinas();
  renderFeed();
}

async function estado(id, patch) {
  try { await api("/api/avisos/" + id + "/estado", { method: "POST", body: patch }); await carregar(); }
  catch (e) { setMsg(e.message, true); }
}

async function excluir(a) {
  if (!confirm("Excluir o comunicado \"" + a.titulo + "\"?")) return;
  try { await api("/api/avisos/" + a.id, { method: "DELETE" }); await carregar(); }
  catch (e) { setMsg(e.message, true); }
}

let editId = null;
function abrirEdicao(a) {
  editId = a.id;
  const f = $("#editForm");
  f.tipo.value = a.tipo; f.titulo.value = a.titulo; f.conteudo.value = a.conteudo; f.url.value = a.url || "";
  $("#editDlg").showModal();
}

async function sair() {
  await api("/api/auth/logout", { method: "POST" }).catch(() => {});
  location.reload();
}

$("#selTipo").addEventListener("change", (e) => {
  const link = e.target.value === "link";
  $("#inpUrl").hidden = !link;
  $("#inpUrl").required = link;
});

$("#filtro").addEventListener("change", (e) => { state.filtro = e.target.value; renderFeed(); });

$("#novaDisc").addEventListener("submit", async (e) => {
  e.preventDefault();
  const f = e.target;
  try {
    await api("/api/disciplinas", { method: "POST", body: { codigo: f.codigo.value, nome: f.nome.value } });
    f.reset(); setMsg("Disciplina criada. Inscreva-se nela para publicar."); await carregar();
  } catch (err) { setMsg(err.message, true); }
});

$("#novoAviso").addEventListener("submit", async (e) => {
  e.preventDefault();
  const f = e.target;
  try {
    await api("/api/avisos", { method: "POST", body: {
      disciplina_id: f.disciplina_id.value, tipo: f.tipo.value, titulo: f.titulo.value, conteudo: f.conteudo.value, url: f.url.value } });
    f.titulo.value = ""; f.conteudo.value = ""; f.url.value = "";
    setMsg("Comunicado publicado."); await carregar();
  } catch (err) { setMsg(err.message, true); }
});

$("#editForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const f = e.target;
  try {
    await api("/api/avisos/" + editId, { method: "PUT", body: { tipo: f.tipo.value, titulo: f.titulo.value, conteudo: f.conteudo.value, url: f.url.value } });
    $("#editDlg").close(); await carregar();
  } catch (err) { alert(err.message); }
});
$("#edCancel").addEventListener("click", () => $("#editDlg").close());

(async function iniciar() {
  try {
    const me = await api("/api/auth/me");
    state.user = me.user;
  } catch { state.user = null; }
  renderAuth();
  if (!state.user) { $("#loginBox").hidden = false; return; }
  $("#app").hidden = false;
  try { await carregar(); } catch (e) { setMsg(e.message, true); }
})();
