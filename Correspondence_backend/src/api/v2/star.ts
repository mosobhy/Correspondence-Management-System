import express, { Request, Response } from 'express'
import dotenv from 'dotenv'
import { correspondants } from '../../database/database.mongoose'
import { extractUserRelatedData, extractUserRelatedThreads, getThreadsEdges } from '../helpers/object.helpers'

dotenv.config()

const star = express.Router()


star.get("/paging", async (req: Request, res: Response) => {
    try {
        const page = Number(req.query.page)
        const limit = Number(req.query.limit)

        const response = await correspondants.find({
            "content.starred": true,
            "content.replay_on": null
        })
        .limit(limit)
        .skip((page - 1) * limit)
        .lean()

        const results = extractUserRelatedData(response)
        if (results) {
            res.json(results)
            .status(200)
        } else {
            res.json({
                message: "no starred documents to fetch",
                status: 400
            })
            .status(400)
        }
    }
    catch (err) {
        console.log(err)
        res.json({
            message: "cannot fetch starred documents due to internal err",
            status: 500
        })
        .status(500)
    }
})



star.get("/starDocument", async (req: Request, res: Response) => {
    try {
        // reverse the value of starred ever request
        const corr_no = req.query.corr_no;
        const oldCorr = await correspondants.findOne({ 
            "content.corr_no": corr_no
        })
        const oldCorrState = oldCorr.content.starred
        oldCorr.content.starred = !oldCorrState
        const response = await oldCorr.save()
        if (response) {
            res.json({
                message: "document has been starred successfully",
                update: !oldCorrState,
                status: 200
            })
            .status(200)
        } else {
            res.json({
                message: "document cannot be starred",
                status: 400
            })
            .status(400)
        }
    }
    catch (err) {
        console.log(err)
        res.json({
            message: "cannot star document due to internal err",
            status: 500
        })
        .status(500)
    }
})


// TO BE CHANGED THE LOGIC, TO REFLECT THE REAL NUMBER OF ITEMS TO APPEAR IN STARRED
// WE WILL HAVE TO TRAVERSE THE WHOLE DOCS AND IF ANY OF THE PARENTS IS STARRED, COUNT IT
// IF ANY CHILD AND HIS PARENT IS STARRED, COUNT THE PARENT ONLY
// IF ANY CHILD STARRED AND HIS PARENT IS NOT, COUNT THE PARENT 
star.get("/count", async (req: Request, res: Response) => {
    try {
        const response = await correspondants.count({
            "content.starred": {
                $eq: true
            },
            "content.replay_on": null
        })
        console.log("starred count: ", response)
        if (response) {
            res.json({ count: response })
            .status(200)
        } else {
            res.json({
                message: "cannot fetch the count starred documents",
                status: 400
            })
            .status(400)
        }
    }
    catch (err) {
        console.log(err)
        res.json({
            message: "cannot fetch starred documents count due to internal err",
            status: 500
        })
        .status(500)
    }
})


/////////////////////////////////////////////////////////////////////////
// ************************* VERSION 2 ******************************** //
////////////////////////////////////////////////////////////////////////


star.get("/paging/v2", async (req: Request, res: Response) => {
    try {
        const page = Number(req.query.page)   || null
        const limit = Number(req.query.limit) || null

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
                    Correspondence: { $push:"$$ROOT" },
                    count: { $sum: 0 },
                    isStarred: { $max: "$content.starred" },
                    isThreadDeleted: { $max: "$content.delete" },
                    isThreadDrafted: { $max: "$content.draft" }
                },
            },
            {
                $sort: {"Correspondence.content.sent_date": -1}
            },
            {
                $match: {
                    $and: [
                        { isStarred: true },
                        { isThreadDeleted: false }
                    ]
                }
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
                message: "cannot fetch starred threads",
                status: 400
            })
            .status(400)
        }
    }
    catch (err) {
        console.log(err)
        res.json({
            message: "cannot fetch starred documents due to internal err",
            status: 500
        })
        .status(500)
    }
})


star.get("/starThreadById", async (req: Request, res: Response) => {
    // starres the last message in the thread
    try {

        const thread_id = req.query.thread_id || null

        if (!thread_id) {
            return res.json({
                message: "thread_id should be passed",
                status: 400
            })
            .status(400)
        }

        const response_: any = await correspondants.find({
            "content.thread_id": thread_id
        })
        .sort({ "content.sent_date": 1 })

        if (response_.length === 0){
            return res.json({
                message: "invalid thread_id",
                status: 400
            })
            .status(400)
        }

        let result;
        let isThreadStarred = false
        response_.map((message: any) => {
            if (message.content.starred) isThreadStarred = true
        })

        if (isThreadStarred) {
            // unstar all of docs
            result = await correspondants.updateMany({ 
                'content.thread_id': thread_id 
            }, 
            { 
                $set: { 'content.starred': false, 'content.isThreadStarred': false }
            }) 

        } else {
            // put on the isThreadStarred Flag
            const done = await correspondants.updateMany({ 'content.thread_id': thread_id }, { $set: { 'content.isThreadStarred': true }})
            // star the last doc
            const res = response_[response_.length - 1]
            res.content.starred = true
            result = await res.save()
        }

        if (result) {
            res.json({
                message: `thread has been ${!isThreadStarred ? 'starred' : 'unstarred'} successfully`,
                update: !isThreadStarred,
                status: 200
            })
            .status(200)
        } else {
            res.json({
                message: "thread cannot be starred",
                status: 400
            })
            .status(400)
        }
    }
    catch (err) {
        console.log(err)
        res.json({
            message: "cannot star this thread due to internal server error",
            status: 500
        })
        .status(500)
    }
})


star.get("/starDocumentById", async (req: Request, res: Response) => {
    try {
        // reverse the value of starred ever request
        const corr_id = req.query.corr_id || null;
        if (!corr_id) {
            return res.json({
                message: "document _id should be passed",
                status: 400
            })
            .status(400)
        }

        const oldCorr = await correspondants.findOne({ _id: corr_id })
        if(!oldCorr) {
            return res.json({
                message: "no document with that id, it may be deleted",
                status: 400
            })
            .status(400)
        }
        
        const oldCorrState = oldCorr.content.starred
        oldCorr.content.starred = !oldCorrState
        const response = await oldCorr.save()

        // put off/on isThreadStarred flag in all docs
        await correspondants.updateMany({
            'content.thread_id': oldCorr.content.thread_id
        },
        {
            $set: { 'content.isThreadStarred': !oldCorrState }
        })

        if (response) {
            res.json({
                message: `document has been ${!oldCorrState ? 'starred' : 'unstarred'} successfully`,
                update: !oldCorrState,
                status: 200
            })
            .status(200)
        } else {
            res.json({
                message: "document cannot be starred",
                status: 400
            })
            .status(400)
        }
    }
    catch (err: any) {
        if (err.name === 'CastError') {
            res.json({
                message: "invalid document _id",
                status: 400
            })
        } else {
            console.error(err)
            res.json({
                message: "cannot star document due to internal err",
                status: 500
            })
            .status(500)
        }
    }
})


star.get("/count/v2", async (req: Request, res: Response) => {
    try {
        const response = await correspondants.aggregate([
            {
                $group:{
                    _id: "$content.thread_id",
                    Correspondence: { $push:"$$ROOT" },
                    count: { $sum: 0 },
                    isStarred: { $max: "$content.starred" },
                    isThreadDeleted: { $max: "$content.delete" },
                },
            },
            {
                $sort: {"Correspondence.content.sent_date": -1}
            },
            {
                $match: {
                    $and: [
                        { isStarred: true },
                        { isThreadDeleted: false }
                    ]
                }
            }
        ])

        if (response) {
            res.json({
                count: response.length,
                status: 200
            })
            .status(200)
        } else {
            res.json({
                message: "cannot fetch the count of starred threads",
                status: 400
            })
            .status(400)
        }
    }
    catch (err) {
        console.log(err)
        res.json({
            message: "cannot fetch starred documents count due to internal err",
            status: 500
        })
        .status(500)
    }
})


export default star