import express from 'express'

var router = express.Router()

router.get('/', (req, res) => {
  res.send('GET')
})

router.post('/grasp', (req, res) => {
  res.send(JSON.stringify(req.body, null, 2))
})

export default router