import express, { Request, Response } from 'express'
import dotenv from 'dotenv'
import { correspondants } from '../../database/database.mongoose'
import { extractUserRelatedData, extractUserRelatedThreads, getThreadsEdges } from '../helpers/object.helpers'

dotenv.config()

const sent = express.Router()

sent.get("/paging", async (req: Request, res: Response) => {
    try {
        const page = Number(req.query.page)
        const limit = Number(req.query.limit)

        const response = await correspondants.find({
            "content.message_status": 'sent',
            "content.delete": false,
            "content.draft": false
        })
        
        const results = extractUserRelatedData(response)
        if (results) {
            res.json( results )
            .status(200)
        } else {
            res.json({
                message: "cannot retrieved sent messages",
                status: 400
            })
            .status(400)
        }

    }
    catch (err) {
        console.log(err)
        res.json({
            message: "cannot retreive sent messages due to internal server err",
            status: 500
        })
        .status(500)
    }
})



////////////////////////////////////////////////////////////////////////////
// ***************************** VERSION 2 ****************************** //
//                                                                        //
//                                                                        //
//                              VERSION 2                                 //
//                                                                        //                        
//                                                                        //
////////////////////////////////////////////////////////////////////////////



sent.get("/paging/v2", async (req: Request, res: Response) => {
    try {
        const limit = Number(req.query.limit)
        const page = Number(req.query.page)

        const response = await correspondants.aggregate([
            {
                $group:{
                    _id: "$content.thread_id",
                    idForSort: { $first: "$_id" },    // sort internally based on the _id field of each corr, to preserve the order
                    message_status: { $first: "$content.message_status" },
                    Correspondence: { $push: "$$ROOT" },
                    count: { $sum: 1 },
                    isThreadStarred: { $max: "$content.starred" },
                    isThreadDeleted: { $max: "$content.delete" },
                    isThreadDrafted: { $max: "$content.draft" }
                },
            },
            {
                $match: {
                    $and: [
                        { isThreadDeleted: false },
                        { isThreadDrafted: false },
                        { message_status: "sent" }
                    ]
                }
            },
            {
                $sort: { "Correspondence.content.sent_date" : -1 }
            }, 
            {
                $skip: ( page - 1 ) * limit
            },
            {
                $limit: limit
            }
        ])

        const results = getThreadsEdges(extractUserRelatedThreads(response))
        if (results) {
            res.json(results)
            .status(200)
        } else {
            res.json({
                message: "cannot fetch sent threads",
                status: 400
            })
            .status(400)
        }
    }
    catch (err) {
        console.log(err)
        res.json({
            message: "cannot fetch sent corresponcenes due to internal server error",
            status: 500
        })
        .status(500)
    }
})


sent.get('/count/v2', async (req: Request, res: Response) => {
    try {
        const response = await correspondants.count({
            "content.message_status": 'sent',
            "content.delete": false,
            "content.draft": false,
            "content.replay_on": null
        })
        if (response) {
            res.json({ count: response })
            .status(200)
        } else {
            res.json({ 
                message: 'cannot fetch sent count',
                status: 400
            })
            .status(400)
        }
    }
    catch (err) {
        console.log(err)
        res.json({
            message: "cannot fetch sent count due to internal error",
            status: 500
        })
        .status(500)
    }
})


export default sent 