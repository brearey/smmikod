import { Pool } from 'pg'
import { query } from '../database/db'

async function getTickets(pool: Pool, dateTimeFrom: Date, dateTimeTo: Date, limit?: number, offset?: number) {
	let sql = `
    SELECT 
      "Id",
      "DateAndTime",
      "ClientPhone",
      "ClientEmail",
      "FormName",
      "ClientFullName"
    FROM "IDENT_Tickets"
    WHERE "DateAndTime" >= $1 AND "DateAndTime" <= $2
    ORDER BY "DateAndTime"
  `

	const params: (Date | number)[] = [dateTimeFrom, dateTimeTo]

	if (limit !== undefined) {
		params.push(limit)
		sql += ` LIMIT $${params.length}`
	}

	if (offset !== undefined) {
		params.push(offset)
		sql += ` OFFSET $${params.length}`
	}

	return await query(pool, sql, params)
}

export { getTickets }
