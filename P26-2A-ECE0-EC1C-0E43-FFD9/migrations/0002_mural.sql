CREATE TABLE IF NOT EXISTS disciplinas (id INTEGER PRIMARY KEY AUTOINCREMENT, codigo TEXT NOT NULL UNIQUE, nome TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS inscricoes (user_id TEXT NOT NULL, disciplina_id INTEGER NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (user_id, disciplina_id));
CREATE TABLE IF NOT EXISTS avisos (id INTEGER PRIMARY KEY AUTOINCREMENT, disciplina_id INTEGER NOT NULL, user_id TEXT NOT NULL, username TEXT NOT NULL, tipo TEXT NOT NULL, titulo TEXT NOT NULL, conteudo TEXT NOT NULL, url TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT);
CREATE TABLE IF NOT EXISTS avisos_estado (user_id TEXT NOT NULL, aviso_id INTEGER NOT NULL, lido INTEGER NOT NULL DEFAULT 0, fixado INTEGER NOT NULL DEFAULT 0, PRIMARY KEY (user_id, aviso_id));
CREATE INDEX IF NOT EXISTS idx_avisos_disciplina ON avisos(disciplina_id);
CREATE INDEX IF NOT EXISTS idx_inscricoes_user ON inscricoes(user_id);
INSERT OR IGNORE INTO disciplinas (codigo, nome) VALUES ('ES101', 'Engenharia de Software'), ('BD201', 'Banco de Dados'), ('WEB301', 'Desenvolvimento Web Pratico'), ('RC101', 'Redes de Computadores');
