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

export { upsertBranches, upsertDoctors, upsertIntervals }
