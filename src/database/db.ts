import { Pool } from 'pg'
import { logger } from '../utils/logger'

function createPool(host: string, user: string, password: string, database?: string) {
  try {
    logger.info(`host = ${host} user = ${user} password = ${password} database = ${database || 'default'}`)
    const pool = new Pool({
      host: host,
      user: user,
      password: password,
      database: database,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
      maxLifetimeSeconds: 60
    })
    logger.info(`pool created totalCount = ${pool.totalCount}`)
    return pool
  } catch(e) {
    logger.error(e as Error)
    return null
  }
}

async function query(pool: Pool, q: string, params: unknown[] = []) {
  try {
    return await pool.query(q, params)
  } catch (err) {
    logger.error(err as Error);
    return null
  }
}

export {
  createPool,
  query
}