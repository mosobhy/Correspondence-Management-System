import express, { Request, Response } from 'express'
import { correspondants } from '../../database/database.mongoose'
import dotenv from 'dotenv'
import { extractUserRelatedData, extractUserRelatedThreads, getThreadsEdges } from '../helpers/object.helpers'


dotenv.config()

const inbox = express.Router()


inbox.get("/paging/v2", async (req: Request, res: Response) => {
    try {

        const limit = Number(req.query.limit) || null
        const page = Number(req.query.page)   || null

        if (!limit || !page) {
            return res.json({
                message: "pagination boundaries should be passed and be of type Integer",
                status: 400
            })
            .status(400)
        }

        const response = await correspondants.aggregate([
            {
                $group:{
                    _id: "$content.thread_id",
                    Correspondence: { $push: "$$ROOT" },
                    count: { $sum: 1 }, 
                    isThreadStarred: { $max: "$content.starred" },
                    isThreadDeleted: { $max: "$content.delete" },
                    isThreadDrafted: { $max: "$content.draft" },
                },
            },
            {
                $match: {
                    $and: [
                        { isThreadDeleted: false },
                    ]
                }
            },
            {
                $match: {
                    $or: [
                        {
                            $and: [
                                { isThreadDrafted: false },
                                { count: { $gte: 1 }}
                            ]
                        },
                        {
                            $and: [
                                { isThreadDrafted: true },
                                { count: { $gt: 1 }}
                            ]
                        }
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
        // res.json(response)
        const results = getThreadsEdges(extractUserRelatedThreads(response))
        if (results) {
            res.json(results)
            .status(200)
        } else {
            res.json({
                message: "cannot fetch inbox data",
                status: 400
            })
            .status(400)
        }
    }
    catch (err) {
        console.log(err)
        res.json({
            message: "cannot fetch inbox corresponcenes due to internal server error",
            status: 500
        })
        .status(500)
    }
})


inbox.get("/count/v2", async (req: Request, res: Response) => {
    try {
        const response = await correspondants.aggregate([
            {
                $group:{
                    _id: "$content.thread_id",
                    Correspondence: { $push: "$$ROOT" },
                    isThreadDeleted: { $max: "$content.delete" },
                    isThreadDrafted: { $max: "$content.draft" }
                },
            },
            {
                $match: {
                    $and: [
                        { isThreadDeleted: false },
                        { isThreadDrafted: false }
                    ]
                }
            }
        ])
        if (response) {
            res.json({
                count: response.length
            })
            .status(200)
        } else {
            res.json({
                message: "cannot fetch inbox data",
                status: 400
            })
            .status(400)
        }
    }
    catch (err) {
        console.log(err)
        res.json({
            message: "cannot fetch inbox count due to internal error",
            status: 500
        })
        .status(500)
    }
})



// HAS NO REACH (TO BE DELETED)
// get whole correspondences from mongo
inbox.get("/paging", async (req: Request, res: Response) => {
    try {
        const page = Number(req.query.page);
        const limit = Number(req.query.limit);

        // WE STILL NEED TO FILTER FOR ONLY THE RECEIVED MESSAGES message_status



        // USE THE GROUPING IN MONGOOSE
        const response = await correspondants.find({ 
            'content.delete': false,
            'content.draft': false,
            'content.replay_on': null,
            // 'content.message_status': "received",
        })
        .limit(limit)
        .skip((page - 1) * limit)
        .lean()

        const results = extractUserRelatedData(response)
        if (results) {
            res.json( results ).status(200)
        } else {
            res.json({ message: "cannot fetch correspondences from mongodb", status: 400}).status(400)
        }
    }
    catch(err) {
        console.log(err)
        res.json({ message: "oops @#$%$, internal error", status: 500}).status(500)
    }
})



// HAS NO REACH (TO BE DELETED)
inbox.get("/details", async (req: Request, res: Response) => {
    try {
        const corr_no = req.query.corr_no
        const response = await correspondants.findOne({
            "content.corr_no": corr_no
        })
        .lean()
        console.log(response)
        const result = extractUserRelatedData(response)
        if (result) {
            res.json( result ).status(200)
        } else {
            res.json({ message: "cannot fetch the details of that correspondence", status: 400}).status(400)
        }
    }
    catch (err) {
        console.log(err)
        res.json({ 
            message: "cannot fetch the details of that correspondece due to internal error",
            status: 500
        })
        .status(500)
    }
})




// NO REACH FOR IT (TO BE DELETED)
inbox.get("/detailsByID", async (req: Request, res: Response) => {
    try {
        const documentID = req.query.corr_id
        const response = await correspondants.find({
            _id: documentID
        })
        .lean()
        const result = extractUserRelatedData(response)
        if (result) {
            res.json( result[0] ).status(200)
        } else {
            res.json({ message: "cannot fetch the details of that correspondence", status: 400}).status(400)
        }
    }
    catch (err) {
        console.log(err)
        res.json({ 
            message: "cannot fetch the details of that correspondece due to internal error",
            status: 500
        })
        .status(500)
    }
})


// NO REACH FOR IT (TO BE DELETED)
inbox.get("/count", async (req: Request, res: Response) => {
    try {
        console.log("inside of the new api")
        const response = await correspondants.count({
            "content.delete": false,
            "content.draft": false,
            "content.replay_on": null
        })
        if (response) {
            res.json({ count: response })
            .status(200)
        } else {
            res.json({ 
                message: 'cannot fetch inbox count',
                status: 400
            })
            .status(400)
        }
    }
    catch (err) {
        console.log(err)
        res.json({
            message: "cannot fetch inbox count due to internal error",
            status: 500
        })
        .status(500)
    }
})


export default inbox
