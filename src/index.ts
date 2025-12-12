import { config } from 'dotenv'
config() // dotenv
import express, { Application, Request, Response } from 'express'
import bodyParser from 'body-parser'
import { ApiResponse } from './types/app-types'
import { logger } from './utils/logger'

const app: Application = express()
const PORT = process.env.SERVER_PORT || 5100

app.use(bodyParser.json())
app.use(logger.request)

app.get('/api/health', (req: Request, res: Response) => {
	const response: ApiResponse = {
		success: true,
		message: 'ok',
		data: null,
		errors: [],
	}
	res.status(200).json(response)
})

app.listen(PORT, () => {
	console.log(`Server running at http://localhost:${PORT}`)
})
