import { config } from 'dotenv'
config() // dotenv
import axios from 'axios'
import { createPool, query } from '../src/database/db'

const IDENT_KEY = process.env.IDENT_INTEGRATION_KEY as string
const BASE_URL = `http://localhost:${process.env.SERVER_PORT}`

jest.setTimeout(10000)

describe('POST /PostTimeTable (e2e)', () => {
  const pool = createPool(
    'localhost',
    process.env.POSTGRES_USER as string,
    process.env.POSTGRES_PASSWORD as string,
  )

  beforeAll(async () => {
    const maxAttempts = 10
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        await axios.get(`${BASE_URL}/health`)
        return
      } catch (err) {
        console.error(err)
        await new Promise((resolve) => setTimeout(resolve, 500))
      }
    }
    throw new Error(`Server is not running on ${BASE_URL}`)
  })

  afterAll(async () => {
    if (pool) await pool.end()
  })

  it('should upsert timetable without duplicates on repeated calls', async () => {
    const branchId = 9000 + Math.floor(Math.random() * 1000)
    const doctorId = 8000 + Math.floor(Math.random() * 1000)

    const startIso = new Date(Date.UTC(2030, 0, 1, 10, 0, 0))
      .toISOString()
      .replace(/\.\d{3}Z$/, '+00:00')

    const payload = {
      Doctors: [
        { Id: doctorId, Name: `Доктор ${doctorId}` },
      ],
      Branches: [
        { Id: branchId, Name: `Филиал ${branchId}` },
      ],
      Intervals: [
        {
          DoctorId: doctorId,
          BranchId: branchId,
          StartDateTime: startIso,
          LengthInMinutes: 60,
          IsBusy: false,
        },
        {
          DoctorId: doctorId,
          BranchId: branchId,
          StartDateTime: startIso.replace('10:00:00', '12:00:00'),
          LengthInMinutes: 30,
          IsBusy: true,
        },
      ],
    }

    const headers = {
      'IDENT-Integration-Key': IDENT_KEY,
      'Content-Type': 'application/json',
    }

    const postOnce = await axios.post(`${BASE_URL}/PostTimeTable`, payload, { headers })
    expect(postOnce.status).toBe(200)

    const postTwice = await axios.post(`${BASE_URL}/PostTimeTable`, payload, { headers })
    expect(postTwice.status).toBe(200)

    if (pool) {
      const result = await query(
        pool,
        `SELECT COUNT(*)::int as cnt FROM "IDENT_Intervals" WHERE "BranchId" = $1 AND "DoctorId" = $2`,
        [branchId, doctorId],
      )

      expect(result?.rows[0]?.cnt).toBe(2)
    }
  })
})

