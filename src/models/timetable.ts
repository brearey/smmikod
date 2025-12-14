import { Pool } from 'pg'
import { query } from '../database/db'
import { BranchDto, DoctorDto, IntervalDto } from '../types/app-types'

async function upsertBranches(pool: Pool, branches: BranchDto[]) {
	if (!branches.length) {
		return { rowCount: 0, rows: [] }
	}

	const values: unknown[] = []
	const placeholders = branches.map((branch, idx) => {
		const base = idx * 2
		values.push(branch.Id, branch.Name)
		return `($${base + 1}, $${base + 2})`
	})

	const sql = `
		INSERT INTO "IDENT_Branches" ("Id", "Name")
		VALUES ${placeholders.join(', ')}
		ON CONFLICT ("Id") DO UPDATE
		SET "Name" = EXCLUDED."Name"
	`

	return await query(pool, sql, values)
}

async function upsertDoctors(pool: Pool, doctors: DoctorDto[]) {
	if (!doctors.length) {
		return { rowCount: 0, rows: [] }
	}

	const values: unknown[] = []
	const placeholders = doctors.map((doctor, idx) => {
		const base = idx * 2
		values.push(doctor.Id, doctor.Name)
		return `($${base + 1}, $${base + 2})`
	})

	const sql = `
		INSERT INTO "IDENT_Doctors" ("Id", "Name")
		VALUES ${placeholders.join(', ')}
		ON CONFLICT ("Id") DO UPDATE
		SET "Name" = EXCLUDED."Name"
	`

	return await query(pool, sql, values)
}

async function upsertIntervals(pool: Pool, intervals: IntervalDto[]) {
	if (!intervals.length) {
		return { rowCount: 0, rows: [] }
	}

	const values: unknown[] = []
	const placeholders = intervals.map((interval, idx) => {
		const base = idx * 5
		values.push(
			interval.BranchId,
			interval.DoctorId,
			new Date(interval.StartDateTime),
			interval.LengthInMinutes,
			interval.IsBusy
		)
		return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5})`
	})

	const sql = `
		INSERT INTO "IDENT_Intervals" ("BranchId", "DoctorId", "StartDateTime", "LengthInMinutes", "IsBusy")
		VALUES ${placeholders.join(', ')}
		ON CONFLICT ("BranchId", "DoctorId", "StartDateTime") DO UPDATE
		SET
			"LengthInMinutes" = EXCLUDED."LengthInMinutes",
			"IsBusy" = EXCLUDED."IsBusy"
	`

	return await query(pool, sql, values)
}

async function getDoctors(pool: Pool) {
	const sql = `SELECT "Id", "Name" FROM "IDENT_Doctors" ORDER BY "Name"`
	return await query(pool, sql, [])
}

async function getBranches(pool: Pool) {
	const sql = `SELECT "Id", "Name" FROM "IDENT_Branches" ORDER BY "Name"`
	return await query(pool, sql, [])
}

async function getIntervals(
	pool: Pool,
	dateTimeFrom?: Date,
	dateTimeTo?: Date,
	doctorId?: number,
	branchId?: number
) {
	const conditions: string[] = []
	const params: unknown[] = []
	let paramIndex = 1

	if (dateTimeFrom) {
		conditions.push(`"StartDateTime" >= $${paramIndex}`)
		params.push(dateTimeFrom)
		paramIndex++
	}

	if (dateTimeTo) {
		conditions.push(`"StartDateTime" <= $${paramIndex}`)
		params.push(dateTimeTo)
		paramIndex++
	}

	if (doctorId !== undefined) {
		conditions.push(`"DoctorId" = $${paramIndex}`)
		params.push(doctorId)
		paramIndex++
	}

	if (branchId !== undefined) {
		conditions.push(`"BranchId" = $${paramIndex}`)
		params.push(branchId)
		paramIndex++
	}

	const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

	const sql = `
		SELECT 
			i."BranchId",
			i."DoctorId",
			i."StartDateTime",
			i."LengthInMinutes",
			i."IsBusy",
			d."Name" as "DoctorName",
			b."Name" as "BranchName"
		FROM "IDENT_Intervals" i
		INNER JOIN "IDENT_Doctors" d ON i."DoctorId" = d."Id"
		INNER JOIN "IDENT_Branches" b ON i."BranchId" = b."Id"
		${whereClause}
		ORDER BY i."StartDateTime" ASC
	`

	return await query(pool, sql, params)
}

export { upsertBranches, upsertDoctors, upsertIntervals, getDoctors, getBranches, getIntervals }
