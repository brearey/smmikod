import { type Request, type Response, type NextFunction } from 'express'
import { ApiError } from '../types/app-types'

export const logger = {
	now: new Date().toLocaleString(),
	instance: console, // тут можно поставить логгер получше типа winston, pino
	info: (message: string) => {
		logger.instance.info(`${logger.now} | INFO | ${message}`)
	},
	error: (error: ApiError | Error) => {
		logger.instance.error(`${logger.now} | ERROR | ${error.name} ${error.message}`)
	},
	request: (req: Request, res: Response, next: NextFunction) => {
		const timestamp = new Date().toISOString()
		const method = req.method
		const path = req.path

		let requestData = ''

		if (method === 'GET' || method === 'DELETE') {
			if (Object.keys(req.query).length > 0) {
				requestData = ` | Query: ${JSON.stringify(req.query)}`
			}
		} else if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
			if (req.body && Object.keys(req.body).length > 0) {
				requestData = ` | Body: ${JSON.stringify(req.body)}`
			}
		}

		logger.instance.info(`${timestamp} | REQUEST | ${method} ${path}${requestData}`)

		next()
	},
}
