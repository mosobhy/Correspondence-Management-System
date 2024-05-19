import express, { Request, response, Response } from 'express'
import { correspondants } from '../../database/database.mongoose'
import dotenv from 'dotenv'
import { extractUserRelatedData, extractUserRelatedThreads, getThreadsEdges } from '../helpers/object.helpers'
import { ObjectId } from 'mongodb'
import { aggregationQueries } from '../helpers/aggregationQueries'

dotenv.config()

const delete_ = express.Router()



// retreive deleted items to be displayed in trash
delete_.get("/paging", async (req: Request, res: Response) => {
    try {
        const page = Number(req.body.page)
        const limit = Number(req.body.limit)

        const response = await correspondants.find({
            "content.delete": true
        })
        .limit(limit)
        .skip((page -1 ) * limit)
        .lean()

        const results = extractUserRelatedData(response)
        if (results) {
            res.json(results)
            .status(200)
        } else {
            res.json({
                message: "didn't find docs in trash",
                status: 400
            })
            .status(400)
        }
    }
    catch (err) {
        console.log(err)
        res.json({
            message: "cannot fetch junk documents due to internal error",
            status: 500
        })
        .status(500)
    }
})


// delete one from inside of the trash
delete_.delete("/", async (req: Request, res: Response) => {
    try {
        const corr_no = req.query.corr_no
        const response = await correspondants.deleteOne({
            "content.corr_no": corr_no
        })
        if (response) {
            res.json({
                message: 'corr has been deleted successuflly',
                status: 200
            })
            .status(200)
        } else {
            res.json({
                message: "cannot delete this document",
                status: 400
            })
            .status(400)
        }
    }
    catch (err) {
        console.log(err)
        res.json({
            message: 'cannot delete this document due to internal error',
            status: 500
        })
        .status(500)
    }
})

delete_.delete("/deleteByID", async (req: Request, res: Response) => {
    try {
        const corr_id = req.query.corr_id
        const response = await correspondants.deleteOne({
            "_id": corr_id
        })
        if (response) {
            res.json({
                message: 'corr has been deleted successuflly',
                status: 200
            })
            .status(200)
        } else {
            res.json({
                message: "cannot delete this document",
                status: 400
            })
            .status(400)
        }
    }
    catch (err) {
        console.log(err)
        res.json({
            message: 'cannot delete this document due to internal error',
            status: 500
        })
        .status(500)
    }
})


// delete all from inside of the trash
delete_.delete("/deleltBulkPermenant", async (req: Request, res: Response) => {
    try {
        const docsToDelete = req.body.corrs
        let results: Array<Boolean> = []
        for (let docId of docsToDelete) {
            const response = await correspondants.deleteOne({
                _id: docId
            })
            if (response.deletedCount === 1) {
                results.push(true)
            }
        }
        console.log(results)
        if (results.length === docsToDelete.length) {
            res.json({
                message: "documents are deleted successfully",
                status: 200
            })
            .status(200)
        } else {
            res.json({
                message: "cannot delete these documetns",
                status: 400
            })
            .status(400)
        }
     }
    catch (err) {
        console.log(err)
        res.json({
            message: "cannot delete the provided documents' IDs due intenal err",
            status: 500
        })
        .status(500)
    }
})


delete_.delete("/deleteBulk", async (req: Request, res: Response) => {
    try {
        const docsToDelete = req.body.corrs
        let results: Array<Boolean> = []
        for (let docId of docsToDelete) {
            const tempCorr = await correspondants.findOne({
                _id: docId
            })
            tempCorr.content.delete = true
            tempCorr.content.deleteTime = Date()
            tempCorr.content.draft = false
            tempCorr.content.starred = false
            const response = await tempCorr.save()
            if (response.content.delete) {
                results.push(true)
            }
        }
        if (results.length === docsToDelete.length) {
            res.json({
                message: "documents are deleted successfully",
                status: 200
            })
            .status(200)
        } else {
            res.json({
                message: "cannot delete these documetns",
                status: 400
            })
            .status(400)
        }
     }
    catch (err) {
        console.log(err)
        res.json({
            message: "cannot delete the provided documents' IDs due intenal err",
            status: 500
        })
        .status(500)
    }
})


delete_.post("/untrash", async (req: Request, res: Response) => {
    try {
        const docsToUntrash = req.body.corrs
        let results: any = []
        for (let docId of docsToUntrash) {
            const tempDoc = await correspondants.findOne({
                _id: docId
            })
            tempDoc.content.delete = false;
            tempDoc.content.deleteTime = ''
            const response = await tempDoc.save()
            if (!response.content.delete) {
                results.push(true)
            }
        }
        if (results.length === docsToUntrash.length) {
            res.json({
                message: "documents are untrashed successfully",
                status: 200
            })
            .status(200)
        } else {
            res.json({
                message: "cannot untrash these documetns",
                status: 400
            })
            .status(400)
        }
    }
    catch (err) {
        console.log(err)
        res.json({
            message: "cannot untrash these documents due to internal error",
            status: 500
        })
        .status(500)
    }
})


delete_.get("/count/old", async (req: Request, res: Response) => {
    try {
        const response = await correspondants.find({
            "content.delete": true,
            "content.replay_on": null
        })
        .lean()
        if (response) {
            res.json({
                count: response.length
            })
            .status(200)
        } else {
            res.json({
                message: "cannot get deleted count"
            })
            .status(400)
        }
    }
    catch (err) {
        console.log(err)
        res.json({
            message: "cannot find deleted counts due to internal error",
            status: 500
        })
        .status(500)
    }
})


////////////////////////////////////////////////////////////////////////////
// ***************************** VERSION 2 ****************************** //
// ////////////////////////////////////////////////////////////////////// //
// ////////////////////////////////////////////////////////////////////// //
//                              VERSION 2                                 //
// ////////////////////////////////////////////////////////////////////// //
// ////////////////////////////////////////////////////////////////////// //
////////////////////////////////////////////////////////////////////////////




// the logic will be exactly the same as inbox and star
delete_.get("/paging/v2", async (req: Request, res: Response) => {
    try {
        const limit = Number(req.query.limit) || null
        const page = Number(req.query.page)   || null
        if (!limit || !page) {
            return res.json({
                message: "pagination boundaries should be passed and of type integer",
                status: 400
            })
            .status(400)
        }

        const response = await correspondants.aggregate([
            {
                $group:{
                    _id: "$content.thread_id",
                    Correspondence: { $push: "$$ROOT" },
                    count: { $sum: 0 },
                    isThreadDeleted: { $max: "$content.delete" },
                },
            },
            {
                $match: {
                    $and: [
                        { isThreadDeleted: true },
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
                message: "cannot fetch trash data",
                status: 400
            })
            .status(400)
        }
    }
    catch (err) {
        console.log(err)
        res.json({
            message: "cannot fetch thrash threads due to internal server error",
            status: 500
        })
        .status(500)
    }
})



delete_.delete('/deleteBulkThreads', async (req: Request, res: Response) => {
    try {
        // mark the head of thread to be deleted
        const threadsToDelete = req.body.thread_IDs || null
        if (!threadsToDelete) {
            return res.json({
                message: "thread IDs to be deleted should be passed",
                status: 400
            })
            .status(400)
        }

        let results: Array<Boolean> = []
        for (let thread_id of threadsToDelete) {
            const response = await correspondants.aggregate([
                {
                    $match: {
                        "content.thread_id": thread_id
                    }
                },
                {
                    $sort: {
                        "content.sent_date": 1
                    }
                },
                {
                    $limit: 1
                }
            ])
            if (response.length === 0) {
                return res.json({
                    message: `${thread_id} is not a valid thread ID`,
                    status: 400
                })
                .status(400)
            }
            // update
            const updated = await correspondants.updateOne({
                _id: new ObjectId(response[0]._id)
            }, 
            {
                $set: {     // THE DELETE SHOULD NOT PUT OFF THE DRAFT OR STAR FLAGS
                    "content.delete": true,
                    "content.starred": false,
                    "content.draft": false,     
                    "content.deleteTime": Date()
                }
            })
            if (updated) results.push(true)
        }

        if (results.length === threadsToDelete.length) {
            res.json({
                message: "documents are deleted successfully",
                status: 200
            })
            .status(200)
        } else {
            res.json({
                message: "cannot delete these documetns",
                status: 400
            })
            .status(400)
        }
     }
    catch (err) {
        console.log(err)
        res.json({
            message: "cannot delete the provided documents' IDs due intenal err",
            status: 500
        })
        .status(500)
    }
})



delete_.delete("/deleteThreadById", async (req: Request, res: Response) => {
    try {
        const thread_id = req.query.thread_id || null
        if (!thread_id) {
            return res.json({
                message: "thread ID should be passed",
                status: 400
            })
            .status(400)
        }

        const response = await correspondants.aggregate([
            {
                $match: {
                    "content.thread_id": thread_id
                }
            },
            {
                $sort: {
                    "content.sent_date": 1
                }
            },
            {
                $limit: 1
            },
        ])
        if (response.length === 0) {
            return res.json({
                message: "invalid thread ID",
                status: 400
            })
            .status(400)
        }

        // update
        const updated = await correspondants.updateOne({
            _id: new ObjectId(response[0]._id)
        }, 
        {
            $set: {
                "content.delete": true,
                "content.starred": false,
                "content.draft": false,
                "content.deleteTime": Date()    // not exist in the schema
            }
        })
        
        if (updated) {
            res.json({
                message: "thread is deleted successfully",
                status: 200
            })
            .status(200)
        } else {
            res.json({
                message: "cannot delete this thread",
                status: 400
            })
            .status(400)
        }
    }
    catch (err) {
        console.log(err)
        res.json({
            message: "cannot mark this thread as deleted due to internal server error",
            status: 500
        })
        .status(500)
    }
})



delete_.post('/untrashThread', async (req: Request, res: Response) => {
    try {
        // mark the head of thread to be deleted
        const threadsToUntrash = req.body.thread_IDs || null
        if (!threadsToUntrash) {
            return res.json({
                message: "list of threads to restore should be passed",
                status: 400
            })
            .status(400)
        }

        let results: Array<Boolean> = []
        for (let thread_id of threadsToUntrash) {
            const response = await correspondants.aggregate([
                {
                    $match: {
                        "content.thread_id": thread_id
                    }
                },
                {
                    $sort: {
                        "content.sent_date": 1
                    }
                },
                {
                    $limit: 1
                }
            ])
            if (response.length === 0) {
                return res.json({
                    message: `${thread_id} is not a valid thread ID`,
                    status: 400
                })
                .status(400)
            }
             // update
             const updated = await correspondants.updateOne({
                _id: new ObjectId(response[0]._id)
            }, 
            {
                $set: {
                    "content.delete": false,
                    "content.deleteTime": ''
                }
            })
            if (updated) results.push(true)
        }

        if (results.length === threadsToUntrash.length) {
            res.json({
                message: "documents are restored successfully",
                status: 200
            })
            .status(200)
        } else {
            res.json({
                message: "cannot restore these documetns",
                status: 400
            })
            .status(400)
        }
     }
    catch (err) {
        console.log(err)
        res.json({
            message: "cannot restore the provided documents' IDs due intenal err",
            status: 500
        })
        .status(500)
    }
})


delete_.get("/reFill", async (req: Request, res: Response) => {
    try {
        const fromComp: any = String(req.query.fromComp)
        const count = Number(req.query.count)
        const limit = Number(req.query.limit)
        const page = Number(req.query.page)

        const aggregateQurey = aggregationQueries[fromComp]
        const paginationPipes = [ { $skip: (page - 1) * limit }, { $limit: limit } ]
        const aggregationPipeline = aggregateQurey.concat(paginationPipes)

        const response = await correspondants.aggregate( aggregationPipeline )

        const results = getThreadsEdges(extractUserRelatedThreads(response.slice(response.length - count)))
        if (results) {
            res.json(results)
            .status(200)
        } else {
            res.json({
                message: "cannot refill data",
                status: 400
            })
            .status(400)
        }
    }
    catch (err) {
        console.log(err)
        res.json({
            message: "cannot refill corresponcenes due to internal server error",
            status: 500
        })
        .status(500)
    }
})


delete_.get("/count", async (req: Request, res: Response) => {
    try {
        const response = await correspondants.find({
            "content.delete": true,
            "content.replay_on": null
        })
        .lean()
        if (response) {
            res.json({
                count: response.length,
                status: 200
            })
            .status(200)
        } else {
            res.json({
                message: "cannot get deleted count",
                status: 400
            })
            .status(400)
        }
    }
    catch (err) {
        console.log(err)
        res.json({
            message: "cannot find deleted counts due to internal error",
            status: 500
        })
        .status(500)
    }
})


export default delete_
