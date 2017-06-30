import express from 'express'
import cors from 'cors'
import grasp from './grasp'

var router = express.Router()
router.get('/', (req, res) => {
  res.send('GET from NodeJS')
})

router.post('/grasp', (req, res) => {
  res.send(grasp.wrapperRun(req.body))
})

export default router
