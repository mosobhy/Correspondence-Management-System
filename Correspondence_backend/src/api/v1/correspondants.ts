import express, { Request, Response } from 'express';
import { CorrespondantStore } from '../../models/correspondants';
import { CorrespondantMongooseStore } from '../../models/correspondants.mongoose';
import { ICorrespondant as Correspondant } from '../../types/ICorrespondant';
import dotenv from 'dotenv' 
import { correspondants } from '../../database/database.mongoose';

dotenv.config()


const correspontant = express.Router()


// THIS IS THE OLD VERSION, TO BE JUNKED




correspontant.post("/testingMongoosastic", async (req, res) => {
    const newObj = new correspondants( req.body )
    newObj.save((error: any) => {
        if (error) throw error;

        newObj.on("es_indexed", (error: any, response: any) => {
            if (error) throw error

            console.log("object is indexed successfully")
            res.json(response)
        })
    })
})

correspontant.get("/", async (req: Request, res: Response) => {
    try {
        const corr_obj = new CorrespondantMongooseStore()
        const data = await corr_obj.index();
        res.json(data).status(200)
    }
    catch (err) {
        res.json({'message': "cannot find any correspondants", status: 404}).status(404)
    }
})


correspontant.get("/corrById", async (req: Request, res: Response) => {
    // try {
    //     const corr_obj = new CorrespondantMongooseStore();
    //     const data: any = await corr_obj.findById(req.query.corr_id);
    //     console.log("inside of getting fucking cor by id")
    //     console.log(data)
    //     res.json(data).status(200)
    // }
    // catch(err) {
    //     res.json({ message: "cannot get that correspondent", status: 404}).status(404)
    // }
    res.redirect("../inbox/detailsByID")
})

correspontant.get("/inbox/count", async (req: Request, res: Response) => {
    res.redirect(307, "../inbox/count") 
})

correspontant.get("/details", async (req: Request, res: Response) => {
    res.redirect('../inbox/details')
})

correspontant.get("/paging", async (req: Request, res: Response) => {
    res.redirect("../inbox/")
})


correspontant.post("/", async (req: Request, res: Response) => {
    res.redirect("../insert/")
})


correspontant.delete("/delCorr", async (req: Request, res: Response) => {
    res.redirect("../delete/")
})

correspontant.delete("/", async(req: Request, res: Response) => {
    res.redirect("../delete/deleteAll")
})

correspontant.get("/filter", async (req: Request, res: Response) => {
    // try {
    //     const corr_obj = new CorrespondantMongooseStore()
    //     const query = String(req.query.query)
    //     const data = await corr_obj.filterCorrespondents(query)
    //     return res.json(data).status(200)
    // }
    // catch(err) {
    //     console.log(err)
    //     res.json({ message: "cannot filter database"}).status(500)
    // }
    res.redirect('../filter')
})

correspontant.get("/star", async (req: Request, res: Response) => {
    res.redirect('../star/starDocument')
})

correspontant.get("/starred", async (req: Request, res: Response) => {
    res.redirect('../star/')
})


correspontant.get("/starred/count", async (req: Request, res: Response) => {
    res.redirect("../star/count")
})


correspontant.delete("/deleteBulk", async (req: Request, res: Response) => {
    res.redirect('../delete/deleteBulk')
})


correspontant.post("/untrash", async (req: Request, res: Response) => {
    res.redirect("../delete/untrash")
})


correspontant.get("/deleted", async (req: Request, res: Response) => {
    res.redirect('../delete/trash')
})


correspontant.get('/trash/count', async (req: Request, res: Response) => {
    res.redirect("../delete/count")
})


correspontant.post('/draft', async (req: Request, res: Response) => {
    // try {
    //     const corr_obj = new CorrespondantMongooseStore();
    //     const body = (req.body) as Correspondant;
    //     console.log('this is the body')
    //     console.log(body)
    //     const result = await corr_obj.drafting(body)
    //     if (result) res.json({ message: "message drafted successfully", status: 200}).status(200)
    //     else res.json({ message: "cannot draft that message", status: 400}).status(400)
    // } catch(err) {
    //     console.log(err)
    //     res.json({ message: "cannot draft that message due to server error", status: 500}).status(500)
    // }
    res.redirect("../draft/draftDocument")
})

correspontant.get('/drafted', async (req: Request, res: Response) => {
    res.redirect('../draft/')
})


correspontant.get("/draft/count", async (req: Request, res: Response) => {
    // try {
    //     const corr_obj = new CorrespondantMongooseStore()
    //     const data: any = await corr_obj.getDrafted();
    //     res.json({ count: data.length }).status(200)
    // }
    // catch( err ) {
    //     console.log(err)
    //     res.json({ message: "cannot fetch drafts count due to server error", status: 500}).status(500)
    // }
    res.redirect("../draft/count")
})


correspontant.put("/update", async (req: Request, res: Response) => {
    // try {
    //     const corr_obj = new CorrespondantMongooseStore()
    //     const result = await corr_obj.updateDraft(req.body.updates)
    //     if (result) res.json({ message: "updated successfully", status: 200}).status(200)
    //     else res.json({ message: 'cannot update this message', status: 400}).status(400)
    // }
    // catch(err) {
    //     console.log(err)
    //     res.json({ message: "cannot update this message due server error", status: 500}).status(500)
    // }
    res.redirect("../draft/updateDraft")
})


export default correspontant;