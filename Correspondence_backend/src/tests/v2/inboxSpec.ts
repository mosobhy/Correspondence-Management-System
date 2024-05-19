import dotenv from 'dotenv'
import mongoose from 'mongoose'
import supertest from 'supertest';
import app from '../../index';
import * as seeds from '../seedingTestingDB'
import { correspondants } from '../../database/database.mongoose';


dotenv.config()



// initialize the ajax requester
const request = supertest(app)


const tempObject = {
    corr_no: "string",
    corr_type: "string",
    entity_no: "string",
    from_entity: "string",
    from_department: "string",
    from_user: "string",
    from_email: "string@gmail.com",
    cc_entity: ["string@gmail.com", "string2@yahoo.com"],
    entity_address: "string",
    to_entity: "string",
    to_department: "string",
    received_date: Date(),
    received_user: "string",
    sent_date: Date(),
    priority: "normal",
    classification: "normal",
    corr_subject: "string",
    corr_body: "string",
    await_reply: false,
    message_status: "string",
    docs_IDs: ["string1", "string2"],
    delete: false, 
    starred: false,
    draft: false,
    replay_on: null
}


describe("Testing the Route '/inbox/paging/v2'", () => {

    beforeAll(async () => {
        await seeds.createNewThreads(tempObject, correspondants)
        await seeds.createNewDraftMessages(tempObject, correspondants) // should not be counted in inbox
        await seeds.createNewThreadsWithReplys(tempObject, correspondants)
    })

    describe("Testing the 'GET /inbox/paging/v2?page=1&limit=20' for fetching a page of threads of size 20", () => {
        it("Should return '200' as a status code if a we got back 20 thread or less", async () => {
            const page = 1
            const limit = 20
            const response = await request.get(`/api/inbox/paging/v2?page=${page}&limit=${limit}`)
            expect(response.status).toEqual(200)
            expect(response.body).toBeInstanceOf(Array)
            expect(response.body.length).toBeLessThanOrEqual(limit)
        })

        it("Should return 200 as a status code and an array of 10 threads", async () => {
            const page = 1
            const limit = 20
            const response = await request.get(`/api/inbox/paging/v2?page=${page}&limit=${limit}`)
            expect(response.status).toEqual(200)
            expect(response.body).toBeInstanceOf(Array)
            expect(response.body.length).toEqual(10)
        })

        it("Should return '400' as a status code if any of page and limit is not Integer", async () => {
            const page = 'string'
            const limit = 20
            const response = await request.get(`/api/inbox/paging/v2?page=${page}&limit=${limit}`)
            expect(response.body.status).toEqual(400)
            expect(response.body.message).toEqual("pagination boundaries should be passed and be of type Integer")
        })

        it("Should return '400' as a status code if any of page or limit is not passed", async () => {
            const page = 1
            const response = await request.get(`/api/inbox/paging/v2?page=${page}&limit=`)
            expect(response.body.status).toEqual(400)
            expect(response.body.message).toEqual("pagination boundaries should be passed and be of type Integer")
        })
    })

    describe("Testing the GET /inbox/paging/v2 after performing other operations", () => {
        it("Should return 200 as a status code after performing an insertion and fetching the inbox", async () => {
            const response = await request.get("/api/inbox/paging/v2?page=1&limit=100")
            const beforeInsertionInboxCount = response.body.length;
            const insertionResponse = await request.post("/api/insert/").send({ doc: tempObject })
            if (insertionResponse.body.status === 200) {
                const afterInsertionInbox = await request.get("/api/inbox/paging/v2?page=1&limit=100")
                expect(afterInsertionInbox.status).toEqual(200)
                expect(afterInsertionInbox.body).toBeInstanceOf(Array)
                expect(afterInsertionInbox.body.length).toEqual(beforeInsertionInboxCount + 1)
            }
        })

        it("Should return 200 as a status code after  performing a deletion operation", async () => {
            const response = await request.get("/api/inbox/paging/v2?page=1&limit=100")
            const beforeDeletionInboxCount = response.body.length;
            // delete an item
            const success = await correspondants.deleteOne({ 'content.delete': false })
            if (success) {
                const inboxAfterDeletion = await request.get('/api/inbox/paging/v2?page=1&limit=100')
                expect(inboxAfterDeletion.status).toEqual(200)
                expect(inboxAfterDeletion.body).toBeInstanceOf(Array)
                expect(inboxAfterDeletion.body.length).toEqual(beforeDeletionInboxCount - 1)
            }
        })

        it("Should return 200 as a status code after performing a star operation", async () => {
            const response = await request.get("/api/inbox/paging/v2?page=1&limit=100")
            const beforeStarringInboxCount = response.body.length
            // star an item 
            const success = await correspondants.findOneAndUpdate({
                'content.starred': false
            }, {
                $set: {
                    'content.starred': true
                }
            })
            if (success) {
                const inboxAfterStarring = await request.get('/api/inbox/paging/v2?page=1&limit=100')
                expect(inboxAfterStarring.status).toEqual(200)
                expect(inboxAfterStarring.body).toBeInstanceOf(Array)
                expect(inboxAfterStarring.body.length).toEqual(beforeStarringInboxCount)
            }
        })
    })

    describe("Testing the Route '/inbox/count/v2'", () => {
        it("Should return the 200 as a status code of a successful request with real count of threads with delete set to false", async () => {
            const realValue = await correspondants.aggregate([
                {
                    $group:{
                        _id: "$content.thread_id",
                        Correspondence: { $push: "$$ROOT" },
                        count: { $sum: 1 }, 
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
                }
            ])
            
            const endpointValue = await request.get("/api/inbox/count/v2")
            
            expect(endpointValue.status).toEqual(200)
            expect(endpointValue.body.count).toEqual(realValue.length)
        })
    })

    afterAll(async () => {
        await correspondants.deleteMany({});
    })
})





