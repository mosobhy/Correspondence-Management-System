import dotenv from 'dotenv'
import express, { Request, Response } from 'express'
import { correspondants } from '../../database/database.mongoose'
import { extractUserRelatedData, extractUserRelatedThreads, getThreadsEdges } from '../helpers/object.helpers'
import { aggregationQueries } from '../helpers/aggregationQueries'


dotenv.config()


const details = express.Router()


details.get("/details", async (req: Request, res: Response) => {
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


details.get("/detailsByID", async (req: Request, res: Response) => {
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


details.get("/threadDetails", async (req: Request, res: Response) => {
    try {
        const thread_id = req.query.thread_id
        const response = await correspondants.find({

        })
    }
    catch (err) {
        console.log(err)
        res.json({
            message: "cannot fetch thread details due to internal error",
            status: 500
        })
        .status(500)
    }
})



////////////////////////////////////////////////////////////////////////////////
// ***************************** VERSION 2 *************************************
////////////////////////////////////////////////////////////////////////////////


// need to be tested
// works with threads of lots of messages
details.get("/traverseThread", async (req: Request, res: Response) => {
    try {
        const corr_id = req.query.corr_id || null
        if (!corr_id) return res.json({ message: "corr_id is not passed", status: 400 }).status(400)

        const thread: any = []
        const obj = await correspondants.findOne({ _id: corr_id }).lean()
        thread.push(obj)
        let replay_on = obj.content.replay_on || null
        while (replay_on !== null) {
            const tempObj = await correspondants.findOne({ _id: replay_on }).lean()
            replay_on = tempObj.content.replay_on || null
            thread.push(tempObj)
        }

        const results = extractUserRelatedData(thread)
        if (results) {
            res.json(results.reverse())
            .status(200)
        }
   }
    catch (err: any) {
        if (err.name === 'CastError') {
            res.json({
                message: "correspondence ID is not valid",
                status: 400
            })
            .status(400)
        } else {
            console.error(err)
            res.json({
                message: "cannot fetch thread messages due to internal server error",
                status: 500
            })
            .status(500)
        }
    }
})


details.get("/getNextThreadByCurrentThreadID", async (req: Request, res: Response) => {
    try {
        const fromComp: any = req.query.fromComp
        const current_thread_id: any = req.query.current_thread_id
        const allThreads = await correspondants.aggregate( aggregationQueries[fromComp] )
        
        // iterate over the threads and access the on next to the current
        let resultedNextThread; 
        for(let i = 0; i < allThreads.length; i++) {
            if (allThreads[i]._id === current_thread_id) {
                resultedNextThread = allThreads[i+1]
                break
            }
        }

        const results = resultedNextThread
                        ?
                        extractUserRelatedData(resultedNextThread.Correspondence)
                        :
                        null

        if (results) {
            res.json(results)
            .status(200)
        } else {
            res.json({
                message: "cannot fetch next thread",
                status: 400
            })
            .status(400)
        }
    }
    catch (err) {
        console.log(err)
        res.json({
            message: "cannot fetch thread details due to internal error",
            status: 500
        })
        .status(500)
    }
})


details.get("/getPreviousThreadByCurrentThreadID", async (req: Request, res: Response) => {
    try {
        const fromComp: any = req.query.fromComp
        const current_thread_id: any = req.query.current_thread_id
        const allThreads = await correspondants.aggregate( aggregationQueries[fromComp] )
        
        // iterate over the threads and access the on next to the current
        let resultedPrevThread; 
        for(let i = 0; i < allThreads.length; i++) {
            if (allThreads[i]._id === current_thread_id) {
                resultedPrevThread= allThreads[i-1]
                break
            }
        }

        const results = resultedPrevThread
                        ? 
                        extractUserRelatedData(resultedPrevThread.Correspondence) 
                        : 
                        null

        if (results) {
            res.json(results)
            .status(200)
        } else {
            res.json({
                message: "cannot fetch next thread",
                status: 400
            })
            .status(400)
        }
    }
    catch (err) {
        console.log(err)
        res.json({
            message: "cannot fetch thread details due to internal error",
            status: 500
        })
        .status(500)
    }
})


details.get("/updateMessageStatus", async (req: Request, res: Response) => {
    try {
        // if the last message is drafted, then update the one before it
        const thread_id: any = req.query.thread_id || null
        if (!thread_id) {
            return res.json({
                message: "thread ID is not passed",
                status: 400
            })
            .status(400)
        }

        const thread = await correspondants.find({ 'content.thread_id': thread_id }).sort({ 'content.sent_date': 1 })
        
        let response 
        if (thread[thread.length-1].content.draft) {
            const message = await correspondants.findOneAndUpdate(
                {
                    _id: thread[thread.length-2]._id
                },
                {
                    $set: { 'content.message_status': 'read' }
                },
                {
                    new: true
                }
            )
            response = message
        } else {
            const message = await correspondants.findOneAndUpdate(
                {
                    _id: thread[thread.length-1]._id
                },
                {
                    $set: { 'content.message_status': 'read' }
                },
                {
                    new: true
                }
            )
            response = message
        }
        if (response) {
            res.json({
                update: response.content.message_status,
                message: "thread status updated successfully",
                status: 200
            })
            .status(200)
        } else {
            res.json({
                message: "cannot update the thread status",
                status: 400
            })
            .status(400)
        }
    }
    catch (err) {
        console.log(err)
        res.json({
            message: "cannot fetch thread details due to internal error",
            status: 500
        })
        .status(500)
    }
})


export default details
