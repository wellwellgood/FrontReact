import { randomBytes, createCipheriv, createDecipheriv } from 'node:crypto';
export function tokenVault(secret) {
  const key = Buffer.from(secret || '', 'base64');
  if (key.length !== 32) throw new Error('GitHub token encryption key is not configured');
  return {
    seal(value) { const iv = randomBytes(12); const cipher = createCipheriv('aes-256-gcm', key, iv); const data = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]); return Buffer.concat([iv, cipher.getAuthTag(), data]).toString('base64'); },
    open(value) { const data = Buffer.from(value, 'base64'); const decipher = createDecipheriv('aes-256-gcm', key, data.subarray(0, 12)); decipher.setAuthTag(data.subarray(12, 28)); return Buffer.concat([decipher.update(data.subarray(28)), decipher.final()]).toString('utf8'); },
  };
}
export function postgresStore(pool) {
  return {
    async init() {
      await pool.query(`CREATE TABLE IF NOT EXISTS github_connections (
        user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        github_id BIGINT UNIQUE NOT NULL, login TEXT NOT NULL, token TEXT NOT NULL,
        expires_at TIMESTAMPTZ, favorites JSONB NOT NULL DEFAULT '[]', connected_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )`);
      await pool.query(`CREATE TABLE IF NOT EXISTS github_oauth_states (
        state TEXT PRIMARY KEY, user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        verifier TEXT NOT NULL, expires_at TIMESTAMPTZ NOT NULL
      )`);
    },
    async putState(state, userId, verifier) {
      await pool.query('DELETE FROM github_oauth_states WHERE expires_at < NOW()');
      await pool.query(`INSERT INTO github_oauth_states(state,user_id,verifier,expires_at) VALUES($1,$2,$3,NOW()+INTERVAL '10 minutes') ON CONFLICT(user_id) DO UPDATE SET state=$1,verifier=$3,expires_at=NOW()+INTERVAL '10 minutes'`, [state,userId,verifier]);
    },
    async consumeState(state, userId) { return (await pool.query('DELETE FROM github_oauth_states WHERE state=$1 AND user_id=$2 AND expires_at>NOW() RETURNING verifier', [state,userId])).rows[0]?.verifier; },
    async get(userId) { return (await pool.query('SELECT * FROM github_connections WHERE user_id=$1', [userId])).rows[0]; },
    async put(userId, profile, token, expiresAt) {
      await pool.query(`INSERT INTO github_connections(user_id,github_id,login,token,expires_at) VALUES($1,$2,$3,$4,$5)
        ON CONFLICT(user_id) DO UPDATE SET github_id=$2,login=$3,token=$4,expires_at=$5,
        favorites=CASE WHEN github_connections.github_id=$2 THEN github_connections.favorites ELSE '[]'::jsonb END,connected_at=NOW()`, [userId,profile.id,profile.login,token,expiresAt]);
    },
    async favorite(userId, repoId, enabled) {
      const sql = enabled
        ? `UPDATE github_connections SET favorites=CASE WHEN favorites @> $2::jsonb THEN favorites ELSE favorites || $2::jsonb END WHERE user_id=$1 RETURNING favorites`
        : `UPDATE github_connections SET favorites=COALESCE((SELECT jsonb_agg(value) FROM jsonb_array_elements(favorites) WHERE value <> $2::jsonb),'[]'::jsonb) WHERE user_id=$1 RETURNING favorites`;
      return (await pool.query(sql,[userId,JSON.stringify(enabled ? [repoId] : repoId)])).rows[0]?.favorites;
    },
    async remove(userId) { await pool.query('DELETE FROM github_connections WHERE user_id=$1',[userId]); await pool.query('DELETE FROM github_oauth_states WHERE user_id=$1',[userId]); },
  };
}
