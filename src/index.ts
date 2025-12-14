import { config } from 'dotenv'
config() // dotenv
import express, { Application, Request, Response } from 'express'
import bodyParser from 'body-parser'
import compression from 'compression'
import { ApiResponse } from './types/app-types'
import { logger } from './utils/logger'
import { getTickets } from './models/ticket'
import { createPool } from './database/db'
import { checkAuth } from './middlewares/auth'
import { upsertBranches, upsertDoctors, upsertIntervals } from './models/timetable'
import { Pool } from 'pg'

const app: Application = express()
const PORT = process.env.SERVER_PORT || 5100
let pool: Pool

app.use(compression())
app.use(bodyParser.json({ limit: '50mb' }))
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }))
app.use(logger.request)

app.get('/health', (req: Request, res: Response) => {
	const response: ApiResponse = {
		success: true,
		message: 'ok',
		data: null,
		errors: [],
	}
	res.status(200).json(response)
})

app.get('/GetTickets', checkAuth, async (req: Request, res: Response) => {
	try {
		const dateTimeFromStr = req.query.dateTimeFrom as string
		const dateTimeToStr = req.query.dateTimeTo as string

		if (!dateTimeFromStr || !dateTimeToStr) {
			return res.status(400).send('Параметры dateTimeFrom и dateTimeTo обязательны')
		}

		const dateTimeFrom = new Date(decodeURIComponent(dateTimeFromStr))
		const dateTimeTo = new Date(decodeURIComponent(dateTimeToStr))

		if (isNaN(dateTimeFrom.getTime()) || isNaN(dateTimeTo.getTime())) {
			return res.status(400).send('Формат даты должны быть в ISO 8601')
		}

		if (dateTimeFrom > dateTimeTo) {
			return res.status(400).send('dateTimeFrom должен быть раньше чем dateTimeTo')
		}

		let limit: number | undefined
		let offset: number | undefined

		if (req.query.limit !== undefined) {
			limit = parseInt(req.query.limit as string, 10)
			if (isNaN(limit) || limit < 0) {
				return res.status(400).send('limit должен быть положительным')
			}
		}

		if (req.query.offset !== undefined) {
			offset = parseInt(req.query.offset as string, 10)
			if (isNaN(offset) || offset < 0) {
				return res.status(400).send('offset должен быть положительным')
			}
		}

		let result
		if (pool) {
			result = await getTickets(pool, dateTimeFrom, dateTimeTo, limit, offset)
		} else {
			const msg = 'Ошибка в БД'
			logger.error(new Error(msg))
			return res.status(500).send(msg)
		}

		if (result === null) {
			const msg = 'Ошибка в БД'
			logger.error(new Error(msg))
			return res.status(500).send(msg)
		}

		const tickets = result.rows.map((row) => {
			const dateAndTime = new Date(row.DateAndTime)
			const isoDate = dateAndTime.toISOString().replace(/\.\d{3}Z$/, '+00:00')

			return {
				Id: row.Id,
				DateAndTime: isoDate,
				ClientPhone: row.ClientPhone || null,
				ClientEmail: row.ClientEmail || null,
				FormName: row.FormName || null,
				ClientFullName: row.ClientFullName || null,
				ClientSurname: row.ClientSurname || null,
				ClientName: row.ClientName || null,
				ClientPatronymic: row.ClientPatronymic || null,
				PlanStart: row.PlanStart ? new Date(row.PlanStart).toISOString().replace(/\.\d{3}Z$/, '+00:00') : null,
				PlanEnd: row.PlanEnd ? new Date(row.PlanEnd).toISOString().replace(/\.\d{3}Z$/, '+00:00') : null,
				Comment: row.Comment || null,
				DoctorId: row.DoctorId || null,
				DoctorName: row.DoctorName || null,
				UtmSource: row.UtmSource || null,
				UtmMedium: row.UtmMedium || null,
				UtmCampaign: row.UtmCampaign || null,
				UtmTerm: row.UtmTerm || null,
				UtmContent: row.UtmContent || null,
				HttpReferer: row.HttpReferer || null,
			}
		})

		res.status(200).json(tickets)
	} catch (error) {
		logger.error(error as Error)
		res.status(500).send('Ошибка на сервере')
	}
})

app.post('/PostTimeTable', checkAuth, async (req: Request, res: Response) => {
	try {
		const { Doctors, Branches, Intervals } = req.body || {}

		if (!Array.isArray(Doctors) || !Array.isArray(Branches) || !Array.isArray(Intervals)) {
			return res.status(400).send('Поля Doctors, Branches, Intervals должны быть массивами')
		}

		// Валидация Branches
		for (let i = 0; i < Branches.length; i++) {
			const branch = Branches[i]
			if (!branch || typeof branch.Id !== 'number' || typeof branch.Name !== 'string') {
				return res.status(400).send(`Неверный формат Branches[${i}]: ожидается {Id: number, Name: string}`)
			}
		}

		// Валидация Doctors
		for (let i = 0; i < Doctors.length; i++) {
			const doctor = Doctors[i]
			if (!doctor || typeof doctor.Id !== 'number' || typeof doctor.Name !== 'string') {
				return res.status(400).send(`Неверный формат Doctors[${i}]: ожидается {Id: number, Name: string}`)
			}
		}

		// Валидация Intervals
		for (let i = 0; i < Intervals.length; i++) {
			const interval = Intervals[i]
			if (!interval) {
				return res.status(400).send(`Неверный формат Intervals[${i}]: объект отсутствует`)
			}
			const { BranchId, DoctorId, StartDateTime, LengthInMinutes, IsBusy } = interval

			if (
				typeof BranchId !== 'number' ||
				typeof DoctorId !== 'number' ||
				typeof LengthInMinutes !== 'number' ||
				typeof IsBusy !== 'boolean'
			) {
				return res
					.status(400)
					.send(
						`Неверный формат Intervals[${i}]: ожидается {BranchId: number, DoctorId: number, StartDateTime: string, LengthInMinutes: number, IsBusy: boolean}`
					)
			}

			if (typeof StartDateTime !== 'string') {
				return res.status(400).send(`Неверный формат Intervals[${i}]: StartDateTime должен быть строкой`)
			}

			const parsedDate = new Date(StartDateTime)
			if (isNaN(parsedDate.getTime())) {
				return res.status(400).send(`Неверная дата в Intervals[${i}]: StartDateTime = "${StartDateTime}"`)
			}
		}

		if (!pool) {
			const msg = 'База данных не инициализирована'
			logger.error(new Error(msg))
			return res.status(500).send(msg)
		}

		// Сохранение данных (пустые массивы обрабатываются корректно функциями upsert)
		if (Branches.length > 0) {
			const branchesResult = await upsertBranches(pool, Branches)
			if (branchesResult === null) {
				const msg = 'Ошибка сохранения филиалов'
				logger.error(new Error(msg))
				return res.status(500).send(msg)
			}
		}

		if (Doctors.length > 0) {
			const doctorsResult = await upsertDoctors(pool, Doctors)
			if (doctorsResult === null) {
				const msg = 'Ошибка сохранения докторов'
				logger.error(new Error(msg))
				return res.status(500).send(msg)
			}
		}

		if (Intervals.length > 0) {
			const intervalsResult = await upsertIntervals(pool, Intervals)
			if (intervalsResult === null) {
				const msg = 'Ошибка сохранения расписания'
				logger.error(new Error(msg))
				return res.status(500).send(msg)
			}
		}

		return res.status(200).send('Данные успешно сохранены')
	} catch (error) {
		logger.error(error as Error)
		res.status(500).send('Ошибка на сервере')
	}
})

app.listen(PORT, () => {
	logger.info(`Server running at http://localhost:${PORT}`)
	const dbHost = process.env.POSTGRES_HOST || 'localhost'
	pool = createPool(
		dbHost,
		process.env.POSTGRES_USER as string,
		process.env.POSTGRES_PASSWORD as string,
		process.env.POSTGRES_DB as string
	) as Pool
})
