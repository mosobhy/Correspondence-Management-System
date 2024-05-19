import express, { Request, Response } from 'express'
import dotenv from 'dotenv'
import { correspondants } from '../../database/database.mongoose'
import { extractUserRelatedData } from '../helpers/object.helpers'


dotenv.config()


const replay = express.Router()


replay.post("/addReplay", async (req: Request, res: Response) => {
    try {

        const thread_id = req.body.thread_id || null
        const corr_id = req.body.corr_id
        const parent_id = req.body.parent_id || null
        const doc = req.body.replay          || null
        if (!thread_id) return res.json({ message: "thread_id should be passed", status: 400 }).status(400)
        if (!parent_id) return res.json({ message: "parent_id should be passed", status: 400 }).status(400)
        if (!doc) return res.json({ message: "doc should be passed", status: 400 }).status(400)
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

        let response;
        if (corr_id) {
            response = await correspondants.findOneAndUpdate({
                _id: corr_id
            }, {
                $set: {
                    "content.thread_id": thread_id,
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
                    "content.sent_date": new Date(),
                    "content.priority": doc.priority,
                    "content.classification": doc.classification,
                    "content.corr_subject": doc.corr_subject,
                    "content.corr_body": doc.corr_body,
                    "content.await_reply": doc.await_reply,
                    "content.message_status": doc.message_status,
                    "content.docs_IDs": doc.docs_IDs,
                    "content.due_date": doc.due_date,
                    "content.starred": doc.starred,
                    "content.draft": doc.draft,
                    "content.replay_on": parent_id
                }
            })
        } else {
            const newDoc = await new correspondants()

            newDoc.content.replay_on = parent_id
            newDoc.content.thread_id = thread_id
            newDoc.content.corr_no = doc.corr_no
            newDoc.content.corr_type = doc.corr_type
            newDoc.content.entity_no = doc.entity_no
            newDoc.content.from_entity = doc.from_entity
            newDoc.content.from_department = doc.from_department
            newDoc.content.from_user = doc.from_user
            newDoc.content.from_email = doc.from_email
            newDoc.content.entity_address = doc.entity_address
            newDoc.content.cc_entity = doc.cc_entity
            newDoc.content.to_entity = doc.to_entity
            newDoc.content.to_department = doc.to_department
            newDoc.content.received_date = doc.received_date
            newDoc.content.received_user = doc.received_user
            newDoc.content.sent_date = new Date()
            newDoc.content.priority = doc.priority
            newDoc.content.classification = doc.classification
            newDoc.content.corr_subject = doc.corr_subject
            newDoc.content.corr_body = doc.corr_body
            newDoc.content.await_reply = doc.await_reply
            newDoc.content.message_status = doc.message_status
            newDoc.content.docs_IDs = doc.docs_IDs
            newDoc.content.due_date = doc.due_date
            newDoc.content.starred = doc.starred

            newDoc.content._id = newDoc._id

            response = await newDoc.save()
        }
        // put off all the thread's messages of being drafted
        const done = await correspondants.updateMany({ 'content.thread_id': thread_id }, { $set: { 'content.isThreadDrafted': false }})
        if (response) {
            res.json({ 
                message: "Reply is added successfully",
                status: 200
            })
            .status(200)
        } else {
            res.json({ 
                message: 'cannot add reply',
                status: 400
            })
            .status(400)
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
            console.log(err)
            res.json({
                message: "cannot add a replay due to internal error",
                status: 500
            })
            .status(500)
        }
    }
})



// HAS NO REACH, ( TO BE DELETED )
replay.get('/getReplays', async (req: Request, res: Response) => {
    try {
        // here we need to perform a very special query to retrieve all replys of
        // an specific id of a correpondence
        const corr_id = req.query.corr_id
        const response = await correspondants.find({ 'content.replay_on': corr_id })
        const result = extractUserRelatedData(response) 
        console.log(result)
        if (result) {
            res.json(result)
            .status(200)
        } else {
            res.json({
                message: "cannot retreive replays of that correspondence",
                status: 400
            })
            .status(400)
        }
    }
    catch (err) {
        console.log(err)
        res.json({
            message: "cannot reteive replays due to internal server error",
            status: 500
        })
        .status(500)
    }
})


// SHOULD BE MOVED TO THE DETAILS INSEATED OF TRAVERSE THREAD FUNCTIONALITY
replay.get("/getReplays/v2", async (req: Request, res: Response) => {
    try {

        // e3mal el query elbedan beta3 graphLookup 3sha te traverse the documents
        // way way performant
        const thread_id = req.query.thread_id

        const response = await correspondants.aggregate([
            {
                $graphLookup: {
                    from: "correspondences",
                    startWith: thread_id,
                    connectedFromField: "replay_on",
                    connectedToField: { $toString: "_id" },
                    as: "replays"
                }
            }
        ])
        
    }
    catch (err) {
        console.log(err)
        res.json({
            message: "cannot reteive replays due to internal server error",
            status: 500
        })
        .status(500)
    }
})


export default replay