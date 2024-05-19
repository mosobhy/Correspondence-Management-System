import express, { Request, Response } from 'express'
import dotenv from 'dotenv'
import { v4 as uuidv4 } from 'uuid'
import { correspondants } from '../../database/database.mongoose'
import { extractUserRelatedData, extractUserRelatedThreads, getThreadsEdges } from '../helpers/object.helpers'

dotenv.config()


const draft = express.Router()


// DEPRECATED (WILL HAVE NO REACH SOON, TO BE DELETED)
draft.get("/paging", async (req: Request, res: Response) => {
    try {

        // TO BE CHANGED WHEN DEALING WITH DRAFTED REPLAYS
        const page = Number(req.query.page)
        const limit = Number(req.query.limit)

        const response = await correspondants.find({
            "content.draft": true
        })
        .limit(limit)
        .skip((page -1) * limit)
        .lean()

        const results = extractUserRelatedData(response)
        console.log(results)
        if (results) {
            res.json(results)
            .status(200)
        } else {
            res.json({
                message: "cannot fetch drafted documents dude",
                status: 400
            })
            .status(400)
        }
    }
    catch (err) {
        console.log(err)
        res.json({
            message: 'cannot fetch draftted messages due to internal error',
            status: 500
        })
        .status(500)
    }
})


// I THINK IT HAS NO REACH
draft.put("/updateDraft", async (req: Request, res: Response) => {
    try {
        const doc = req.body.updates
        const response = await correspondants.findOneAndUpdate({
            _id: doc._id
        }, {
            $set: {
                "content.corr_no": doc.corr_no,
                "content.corr_type": doc.corr_type,
                "content.entity_no": doc.entity_no,
                "content.from_entity": doc.from_entity,
                "content.from_department": doc.from_department,
                "content.from_user": doc.from_user,
                "content.from_email": doc.from_email,
                "content.entity_address": doc.entity_address,
                "content.cc_entity": doc.cc_entity,
                "content.to_entity": doc.to_entity,
                "content.to_department": doc.to_department,
                "content.received_date": doc.received_date,
                "content.received_user": doc.received_user,
                "content.sent_date": doc.sent_date,
                "content.priority": doc.priority,
                "content.classification": doc.classification,
                "content.corr_subject": doc.corr_subject,
                "content.corr_body": doc.corr_body,
                "content.await_reply": doc.await_reply,
                "content.message_status": doc.message_status,
                "content.docs_IDs": doc.docs_IDs,
                "content.due_date": doc.due_date,
                "content.starred": doc.starred,
                "content.delete": false,
                "content.draft": true
            }
        }, {
            new: true
        })
        .lean()

        if (response) {
            res.json({
                message: "draft updated successfully",
                status: 200
            })
            .status(200)
        } else {
            res.json({
                message: "cannot update drafted document",
                status: 400
            })
            .status(400)
        }
    }
    catch (err) {
        console.log(err)
        res.json({
            message: "cannot update drafted message due to internal error",
            status: 500
        })
        .status(500)
    }
})

// HAS NO REACH, (TO BE DELETED)
draft.get("/count", async (req: Request, res: Response) => {
    try {
        const response = await correspondants.count({
            "content.draft": {
                $eq: true
            },
            "content.replay_on": null
        })
        if (response) {
            res.json({ count: response })
            .status(200)
        } else {
            res.json({
                message: "cannot fetch the count drafted documents",
                status: 400
            })
            .status(400)
        }
    }
    catch (err) {
        console.log(err)
        res.json({
            message: "cannot fetch drafted documents count due to internal err",
            status: 500
        })
        .status(500)
    } 
})




///////////////////////////////////////////////////////////////////////////////////
// ***************************** VERSION 2 ************************************* //
///////////////////////////////////////////////////////////////////////////////////



draft.get("/paging/v2", async (req: Request, res: Response) => {
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
                    isThreadDrafted: { $max: "$content.draft" }
                },
            },
            {
                $match: {
                    $and: [
                        { isThreadDeleted: false },
                        { isThreadDrafted: true }
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
                message: "cannot fetch drafted threads",
                status: 400
            })
            .status(400)
        }
    }
    catch (err) {
        console.log(err)
        res.json({
            message: "cannot fetch drafted threads due to internal server error",
            status: 500
        })
        .status(500)
    }
})


draft.post("/draftDocument", async (req: Request, res: Response) => {
    try {
        const doc = req.body.doc || null
        if (!doc) {
            return res.json({
                message: "a document to draft should be passed",
                status: 400
            })
            .status(400)
        }
        if (Object.keys(doc).length === 0) {
            return res.json({
                message: "the passed document is empty",
                status: 400
            })
            .status(400)
        }

        let response: any;
        if (doc._id) {
            response = await correspondants.findOneAndUpdate({
                _id: doc._id
            }, {
                $set: {
                    "content.thread_id": doc.thread_id,
                    "content.corr_no": doc.corr_no,
                    "content.corr_type": doc.corr_type,
                    "content.entity_no": doc.entity_no,
                    "content.from_entity": doc.from_entity,
                    "content.from_department": doc.from_department,
                    "content.from_user": doc.from_user,
                    "content.from_email": doc.from_email,
                    "content.entity_address": doc.entity_address,
                    "content.cc_entity": doc.cc_entity,
                    "content.to_entity": doc.to_entity,
                    "content.to_department": doc.to_department,
                    "content.received_date": doc.received_date,
                    "content.received_user": doc.received_user,
                    "content.sent_date": Date(),    // every time the document is updated, update the sent_date
                    "content.priority": doc.priority,
                    "content.classification": doc.classification,
                    "content.corr_subject": doc.corr_subject,
                    "content.corr_body": doc.corr_body,
                    "content.await_reply": doc.await_reply,
                    "content.message_status": doc.message_status,
                    "content.docs_IDs": doc.docs_IDs,
                    "content.due_date": doc.due_date,
                    "content.starred": doc.starred,
                    "content.delete": doc.delete || false,
                    "content.draft": doc.draft || true,
                    "content.isThreadDrafted": true
                }
            }, {
                new: true
            })
        } else {
            // create a new doc
            const newDoc = new correspondants()
            newDoc.content = doc
            newDoc.content._id = newDoc._id
            newDoc.content.thread_id = uuidv4()
            newDoc.content.isThreadDrafted = true
            response = await newDoc.save()
        }

        if (response) {
            res.json({
                message: "document is drafted successfully",
                doc: response.content,
                status: 200
            })
            .status(200)
        } else {
            res.json({
                message: "cannot draft this document",
                status: 400
            })
            .status(400)
        }
    }
    catch (err) {
        console.log(err)
        res.json({
            message: "cannot draft that document due to internal error",
            status: 500
        })
        .status(500)
    }
})



draft.post('/draftReply', async (req: Request, res: Response) => {
    try {

        const thread_id = req.body.thread_id || null
        const parent_id = req.body.parent_id || null
        const doc = req.body.doc             || null
        if (!thread_id) return res.json({ message: "thread is should be passed and of type interger", status: 400}).status(400)
        if (!parent_id) return res.json({ message: "parent_id should be passed and of type integer", status: 400 }).status(400)
        if (!doc) return res.json({ message: "document to draft is not passed", status: 400 }).status(400)
        if(typeof doc === 'object') {
            if (Object.keys(doc).length === 0) {
                return res.json({
                    message: "the passed document is empty",
                    status: 400
                })
                .status(400)
            }
        } else {
            return res.json({
                message: "doc key must be of type object holding the correspondence to add",
                status: 400
            })
            .status(400)
        }

        let response: any;
        if (doc._id) {
            response = await correspondants.findOneAndUpdate({
                _id: doc._id
            }, {
                $set: {
                    "content.corr_no": doc.corr_no,
                    "content.corr_type": doc.corr_type,
                    "content.entity_no": doc.entity_no,
                    "content.from_entity": doc.from_entity,
                    "content.from_department": doc.from_department,
                    "content.from_user": doc.from_user,
                    "content.from_email": doc.from_email,
                    "content.entity_address": doc.entity_address,
                    "content.cc_entity": doc.cc_entity,
                    "content.to_entity": doc.to_entity,
                    "content.to_department": doc.to_department,
                    "content.received_date": doc.received_date,
                    "content.received_user": doc.received_user,
                    "content.sent_date": Date(),
                    "content.priority": doc.priority,
                    "content.classification": doc.classification,
                    "content.corr_subject": doc.corr_subject,
                    "content.corr_body": doc.corr_body,
                    "content.await_reply": doc.await_reply,
                    "content.message_status": doc.message_status,
                    "content.docs_IDs": doc.docs_IDs,
                    "content.due_date": doc.due_date,
                    "content.starred": doc.starred,
                    "content.delete": doc.delete,
                    "content.draft": doc.draft || true,
                    "content.replay_on": parent_id
                }
            }, {
                new: true
            })
        } else {
            // create a new doc
            const newDoc = new correspondants()
            newDoc.content = doc
            newDoc.content._id = newDoc._id
            newDoc.content.thread_id = thread_id
            newDoc.content.replay_on = parent_id
            response = await newDoc.save()
        }
        // put on the isThreadDrafted flag
        const done = await correspondants.updateMany({ 'content.thread_id': thread_id }, { $set: { 'content.isThreadDrafted': true }})
        if (response) {
            res.json({
                message: "draft updated successfully",
                doc: response.content,
                status: 200
            })
            .status(200)
        } else {
            res.json({
                message: "cannot update drafted document",
                status: 400
            })
            .status(400)
        }
    }
    catch (err: any) {
        if (err.name === 'CastError') {
            res.json({
                message: "parent_id is not valid",
                status: 400
            })
            .status(400)
        } else {
            console.log(err)
            res.json({
                message: "cannot update drafted message due to internal error",
                status: 500
            })
            .status(500)
        }
    }
})


draft.get("/count/v2", async (req: Request, res: Response) => {
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
                        { isThreadDrafted: true }
                    ]
                }
            }
        ])
        if (response) {
            res.json({
                status: 200,
                count: response.length
            })
            .status(200)
        } else {
            res.json({
                message: "cannot fetch draft count",
                status: 400
            })
            .status(400)
        }
    }
    catch (err) {
        console.log(err)
        res.json({
            message: "cannot fetch draft count due to internal error",
            status: 500
        })
        .status(500)
    }
})


export default draft
