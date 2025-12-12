import { config } from 'dotenv'
config() // dotenv
import express, { Application, Request, Response } from 'express'
import bodyParser from 'body-parser'
import { ApiResponse } from './types/app-types'
import { logger } from './utils/logger'
import { getTickets } from './models/ticket'
import {createPool} from './database/db'
import { checkAuth } from './middlewares/auth'

const app: Application = express()
const PORT = process.env.SERVER_PORT || 5100
const pool = createPool(
  'localhost',
  process.env.POSTGRES_USER as string,
  process.env.POSTGRES_PASSWORD as string,
)

app.use(bodyParser.json())

app.get('/health', logger.request, (req: Request, res: Response) => {
	const response: ApiResponse = {
		success: true,
		message: 'ok',
		data: null,
		errors: [],
	}
	res.status(200).json(response)
})

app.get('/GetTickets', logger.getTickets, checkAuth, async (req: Request, res: Response) => {
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
    
    const result = await getTickets(pool, dateTimeFrom, dateTimeTo, limit, offset)
    
    if (result === null) {
      const msg = 'Ошибка в БД'
      logger.error(new Error(msg))
      return res.status(500).send(msg)
    }
    
    const tickets = result.rows.map(row => {
      const dateAndTime = new Date(row.DateAndTime)
      const isoDate = dateAndTime.toISOString().replace(/\.\d{3}Z$/, '+00:00')
      
      return {
        Id: row.Id,
        DateAndTime: isoDate,
        ClientPhone: row.ClientPhone || null,
        ClientEmail: row.ClientEmail || null,
        FormName: row.FormName || null,
        ClientFullName: row.ClientFullName || null
      }
    })
    
    res.status(200).json(tickets)
    
  } catch (error) {
    logger.error(error as Error)
    res.status(500).send('Ошибка на сервере')
  }
})

app.listen(PORT, () => {
	logger.info(`Server running at http://localhost:${PORT}`)
})
