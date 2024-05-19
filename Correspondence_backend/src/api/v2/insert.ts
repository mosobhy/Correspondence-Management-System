import express, { Request, Response } from 'express'
import dotenv from 'dotenv'
import { correspondants } from '../../database/database.mongoose'
import { v4 as uuidv4 } from 'uuid'
import { joiValidatorSchema } from '../helpers/inputValidators'

dotenv.config()

const insert = express.Router()

insert.post("/", async (req: Request, res: Response) => {
    try {

        if (JSON.stringify(req.body.doc) === '{}') {
            return res.json({
                message: "no body is provided",
                status: 400
            })
            .status(400)
        }

        const errors = await joiValidatorSchema.validate(req.body.doc)
        if (errors.error) {
            return res.json({
                errors: errors.error?.details[0].message,
                status: 400
            })
            .status(400)
        }

        const doc = req.body.doc
        let response;
        // check if the object already exit with the same id, update else create new
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
                    "content.received_date": doc.received_date,     // MUST BE SET FROM FRONT
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
                    "content.delete": doc.delete,
                    "content.draft": doc.draft,
                    "content.isThreadDrafted": false
                }
            })
        } else {
            const newDoc = await new correspondants()

            newDoc.content.thread_id = uuidv4() 
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
            newDoc.content.isThreadDrafted = false
            // newDoc.content.starred = doc.starred
            // newDoc.content.delete = doc.delete
            // newDoc.content.draft = doc.draft      // MAY BE UNCOMMONTED LATER

            newDoc.content._id = newDoc._id

            response = await newDoc.save()
        }
        if (response) {
            res.json({ 
                message: "correspondence inserted successfully",
                doc: response.content,
                status: 200
            })
            .status(200)
        } else {
            res.json({ 
                message: 'cannot insert that document',
                status: 400
            })
            .status(400)
        }
    }
    catch (err) {
        console.log(err)
        res.json({
            message: "cannot insert document due to internal error",
            status: 500
        })
        .status(500)
    }
})



////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////


// HAS NO REACH (TO BE DELETED)
insert.post("/addReplay", async (req: Request, res: Response) => {
    try {

        const thread_id = req.body.thread_id
        const corr_id = req.body.corr_id
        const parent_id = req.body.parent_id
        const doc = req.body.replay

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
                    "content.received_date": doc.received_date,     // MUST BE SET FROM FRONT
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
    catch (err) {
        console.log(err)
        res.json({
            message: "cannot add a replay due to internal error",
            status: 500
        })
        .status(500)
    }
})



export default insert