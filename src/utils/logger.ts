import { type Request, type Response, type NextFunction } from 'express'
import { ApiError } from '../types/app-types'

export const logger = {
	instance: console,
	info: (message: string) => {
		const now = new Date().toLocaleString()
		logger.instance.info(`${now} | INFO | ${message}`)
	},
	error: (error: ApiError | Error) => {
		const now = new Date().toLocaleString()
		logger.instance.error(`${now} | ERROR | ${error.name} ${error.message}`)
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
