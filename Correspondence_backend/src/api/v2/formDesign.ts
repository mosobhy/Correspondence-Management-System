import express, { Request, Response } from 'express'
import fs from 'fs'
import dotenv from 'dotenv' 


dotenv.config() 


const formDesign = express.Router()


formDesign.get("/getFormSchema", (req: Request, res: Response) => {
    try {
        const formSchema = fs.readFileSync('./src/FormSchemas/formSchema.json', 'utf-8')
        if (formSchema) {
            res.json(JSON.parse(formSchema))
            .status(200)
        } else {
            res.json({
                message: "cannot fetch the form schema",
                status: 400
            })
            .status(400)
        }
    }
    catch (err) {
        console.log(err)
        res.json({
            message: "cannot read the form schema due to internal server error",
            status: 500
        })
        .status(500)
    }
})


export default formDesign