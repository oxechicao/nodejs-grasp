import express from 'express'
import cors from 'cors'
import grasp from './grasp'

var router = express.Router()

var corsOptions = {
  origin: '*',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

router.get('/', (req, res) => {
  res.send('GET from NodeJS')
})

router.post('/grasp', (req, res) => {
  res.send(grasp.name)
})

export default router
