import express from 'express'
import bodyParser from 'body-parser'
import routes from './routes'
import cors from 'cors'

const app = express();
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(
  cors(
    {
      origin: '*',
      methods: ['GET', 'POST'],
      allowedHeaders: ['content-type', 'Access-Control-Allow-Origin'],
      optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
    }
  )
)
app.use(routes)

export default app
