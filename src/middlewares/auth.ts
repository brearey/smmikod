import { config } from 'dotenv'
config() // dotenv
import { NextFunction, Request, Response } from 'express'
import { logger } from '../utils/logger'

function checkAuth(req: Request, res: Response, next: NextFunction) {
	const integrationKey = req.headers['ident-integration-key'] as string
	const expectedKey = process.env.IDENT_INTEGRATION_KEY

	if (!integrationKey || integrationKey !== expectedKey) {
		const msg = 'Доступ запрещен'
		logger.error(new Error(msg))
		return res.status(403).send(msg)
	}
	next()
}

export { checkAuth }
