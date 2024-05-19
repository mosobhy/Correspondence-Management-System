import express from 'express'
import swaggerUi from 'swagger-ui-express'
import fs from 'fs'
import cors from 'cors'
import morgan from 'morgan'
import dotenv from 'dotenv'
import inbox from './api/v2/inbox'
import insert from './api/v2/insert'
import filter from './api/v2/filter'
import draft from './api/v2/draft'
import sent from './api/v2/sent'
import delete_ from './api/v2/delete'
import star from './api/v2/star'
import replay from './api/v2/replay'
import details from './api/v2/details'
import formDesign from './api/v2/formDesign'
import { synchronizeCompletionEvent } from './database/database.mongoose'


dotenv.config()


const swaggerDocs = JSON.parse(fs.readFileSync('./src/swagger/swagger.json', 'utf-8'))


const app = express()
const port = process.env.PORT


app.use(cors())
app.use(morgan('dev'))
app.use(express.json())


app.use("/api-docs/", swaggerUi.serve, swaggerUi.setup(swaggerDocs))
app.use("/api/inbox", inbox)
app.use("/api/filter", filter)
app.use("/api/insert", insert)
app.use("/api/draft", draft)
app.use("/api/sent", sent)
app.use("/api/delete", delete_)
app.use("/api/star", star)
app.use("/api/replay", replay)
app.use("/api/details", details)
app.use("/api/formDesign", formDesign)

app.get("/", (req, res) => {
    res.send("hello mongodb")
})


// start the server after synching with elastic is completed
synchronizeCompletionEvent.once("syncDone", () => {
    app.listen(port, () => {
        console.log(`server is up and running at:  http://127.0.0.1:${port}`)
    })
})


export default app;