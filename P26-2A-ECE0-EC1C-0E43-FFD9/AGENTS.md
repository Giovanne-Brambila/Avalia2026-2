# Documentação de Engenharia de Agentes e Harness (P26-2A-ECE0-EC1C-0E43-FFD9)

**Requisito da Rubrica (25 pontos):** Uso obrigatório de no mínimo 3 agentes diferentes (sendo obrigatoriamente 1 agente dedicado a teste e validação), documentando em qual harness operaram e relacionando as skills na pasta `skills/`.

## 1. Ambiente de Orquestração (Harness Utilizado)

- **Harness:** cada agente foi usado em seu próprio ambiente de chat.
  - Gemini: https://gemini.google.com
  - Claude: chat do Claude (claude.ai), com geração de arquivos.
  - Copilot: https://copilot.com
- **Modelo(s) Base:** Gemini (modelo de IA do Google — atualização contínua) ; Claude Sonnet 5.5; Copilot (GPT-5 Chat).
- **Estratégia de Coordenação:** o estudante conduziu os três agentes em sequência (entender o enunciado, implementar, validar) e levou o resultado de um para o outro. O código foi publicado na subpasta `P26-2A-ECE0-EC1C-0E43-FFD9/` e conferido por testes manuais no site e por `validar-local.mjs`.

## 2. Agentes Utilizados e Responsabilidades

### Agente 1: Gemini — Análise do Enunciado e Planejamento

- **Papel:** interpretar o enunciado do Projeto #18 e a rubrica, e sugerir por onde começar, incluindo características a considerar.
- **Skill Utilizada:** nenhuma específica; trabalhou a partir do enunciado e da rubrica.
- **Entregas Realizadas:**
  - Lista de requisitos e plano de trabalho inicial, usados pelo estudante para organizar o desenvolvimento.

### Agente 2: Claude — Implementação Serverless (D1 e Discord OAuth2) e Interface Vanilla

- **Papel:** gerar o código do mural sobre o esqueleto do repositório: esquema D1 do mural (`migrations/0002_mural.sql`), Pages Functions com login Discord OAuth2 (parâmetro `state`, sessão em cookie assinado) e regras validadas no servidor (só o autor edita ou exclui; lido e fixado por usuário), e a interface em HTML5, CSS3 e JavaScript puro. Também apoiou o diagnóstico dos erros de deploy (pasta raiz, `database_id`, secrets e redirect do Discord).
- **Skills de referência:** `skills/serverless-d1-discord/SKILL.md` e `skills/vanilla-dom-ui/SKILL.md`.
- **Entregas Realizadas:**
  - Tabelas `disciplinas`, `inscricoes`, `avisos` e `avisos_estado` no Cloudflare D1.
  - Rotas em `functions/api/` e utilitários em `functions/_lib/`.
  - Interface em `public/index.html`, `public/styles.css` e `public/app.js`, com cabeçalho do usuário Discord e rodapé com a Chave Única `P26-2A-ECE0-EC1C-0E43-FFD9`.

### Agente 3: Copilot — Teste e Validação (Obrigatório)

- **Papel:** agente dedicado a teste e validação: orientou como conferir os testes e como verificar se tudo estava em ordem.
- **Skill Utilizada:** `skills/teste-validacao/SKILL.md`
- **Entregas Realizadas:**
  - Foi informado para fazer teste na Página inicial, como: A página abre sem erros no console, O layout funciona em desktop e celular, Todos os textos estão legíveis, Imagens carregam corretamente, Links funcionam. Orientou também para teste na Autenticação do Discord, como: Botão "Entrar com Discord" aparece,  Login redireciona para o Discord, Usuário retorna autenticado, Logout funciona, Tentativa de acessar áreas protegidas sem login é bloqueada. Solicitou testes para API/api/status: Retorna HTTP 200, Retorna JSON válido, Exibe status esperado na interface, Trata falhas de rede. Teste para o Banco D1: Registro de dados funciona, Dados persistem após atualizar a página, Dados inválidos são rejeitados, Não ocorre duplicação inesperada. Também testes para Validação de Formulários: Campos obrigatórios não podem ficar vazios, Campos aceitam apenas formatos válidos, Mensagens de erro são exibidas, Caracteres especiais são tratados corretamente.

## 3. Validação Realizada pelo Estudante
Login com conta real do Discord e conferência dos dados gravados no D1.
Roteiro manual no site publicado:
inscrever-se;
publicar conteúdo;
marcar publicação como lida;
marcar publicação como fixada;
editar publicação;
excluir publicação.
Teste realizado com uma segunda conta do Discord para validar permissões e visualização dos dados entre usuários.
Execução de node validar-local.mjs P26-2A-ECE0-EC1C-0E43-FFD9 concluída sem erros.
