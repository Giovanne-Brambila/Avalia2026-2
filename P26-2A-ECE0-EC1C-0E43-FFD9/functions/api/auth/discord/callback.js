import { cookie, getCookie, signToken } from "../../../_lib/session.js";

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  if (!code || !state || state !== getCookie(request, "oauth_state")) {
    return new Response("Login inválido ou expirado. Volte e tente entrar de novo.", { status: 400 });
  }
  if (!env.DISCORD_CLIENT_ID || !env.DISCORD_CLIENT_SECRET || !env.SESSION_SECRET) {
    return new Response("Variáveis DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET e SESSION_SECRET não configuradas.", { status: 500 });
  }

  const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: env.DISCORD_CLIENT_ID,
      client_secret: env.DISCORD_CLIENT_SECRET,
      grant_type: "authorization_code",
      code,
      redirect_uri: new URL("/api/auth/discord/callback", url.origin).href,
    }),
  });
  if (!tokenRes.ok) return new Response("O Discord recusou o login (redirect_uri ou segredo incorretos).", { status: 400 });
  const tok = await tokenRes.json();

  const meRes = await fetch("https://discord.com/api/users/@me", { headers: { Authorization: `Bearer ${tok.access_token}` } });
  if (!meRes.ok) return new Response("Não foi possível ler o perfil do Discord.", { status: 400 });
  const me = await meRes.json();

  const username = me.global_name || me.username;
  const avatar = me.avatar
    ? `https://cdn.discordapp.com/avatars/${me.id}/${me.avatar}.png?size=64`
    : "https://cdn.discordapp.com/embed/avatars/0.png";

  await env.DB.prepare(
    "INSERT INTO discord_users (user_id, username, avatar, updated_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP) ON CONFLICT(user_id) DO UPDATE SET username = excluded.username, avatar = excluded.avatar, updated_at = CURRENT_TIMESTAMP"
  ).bind(me.id, username, avatar).run();

  const session = await signToken({ user_id: me.id, username, avatar, exp: Date.now() + 7 * 24 * 3600 * 1000 }, env.SESSION_SECRET);
  const headers = new Headers({ Location: "/" });
  headers.append("Set-Cookie", cookie("session", session, 7 * 24 * 3600));
  headers.append("Set-Cookie", cookie("oauth_state", "", 0));
  return new Response(null, { status: 302, headers });
}
