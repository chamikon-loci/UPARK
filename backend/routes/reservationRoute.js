import express from 'express'

import { reserve, getReservations, getParkingHistory, cancelReservation, getCurrentParking } from '../controllers/reservation.js'

const router = express.Router()

router.post('/reserve', reserve)
router.post('/cancel', cancelReservation)
router.get("/getReservations", getReservations)
router.get("/getParkingHistory", getParkingHistory)
router.get("/getCurrentParking", getCurrentParking)

export default router