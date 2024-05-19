import supertest from 'supertest';
import app from '../../index';
import * as seeds from '../seedingTestingDB'
import { correspondants } from '../../database/database.mongoose';

/**
 * Define the states that is inserted to the temp DB to test against
 */


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


describe("Testing the Route '/draft'", () => {
    beforeAll(async () => {
        await seeds.createNewThreads(tempObject, correspondants)
        await seeds.createNewThreadsWithDraftedReplys(tempObject, correspondants)
        await seeds.createNewDraftMessages(tempObject, correspondants)
        await seeds.createStarredDraftedMessages(tempObject, correspondants)
    })

    describe("Testing the Route '/draft/paging/v2'", () => {
        it("Should return 200 as a status and return 20 thread incase of page=1, limit=20", async () => {
            const page = 1
            const limit = 20
            const response = await request.get(`/api/draft/paging/v2?page=${page}&limit=${limit}`)
            expect(response.status).toEqual(200)
            expect(response.body.length).toEqual(15)
        })

        it("Should return 200 as a status and return 0 thread incase of page=2, limit=20", async () => {
            const page = 2
            const limit = 20
            const response = await request.get(`/api/draft/paging/v2?page=${page}&limit=${limit}`)
            expect(response.status).toEqual(200)
            expect(response.body.length).toEqual(0)
        })

        it("Should return 400 as a status code if any of page and limit is not Integer", async () => {
            const page = 'string'
            const limit = 20
            const response = await request.get(`/api/draft/paging/v2?page=${page}&limit=${limit}`)
            expect(response.body.status).toEqual(400)
            expect(response.body.message).toEqual("pagination boundaries should be passed and be of type Integer")
        })

        it("Should return '400' as a status code if any of page or limit is not passed", async () => {
            const page = 1
            const response = await request.get(`/api/draft/paging/v2?page=${page}&limit=`)
            expect(response.body.status).toEqual(400)
            expect(response.body.message).toEqual("pagination boundaries should be passed and be of type Integer")
        })
    })

    describe("Testing the Route '/draft/draftDocument'", () => {
        it("Should return 200 given a full document and it should be drafted and its data is not manipulated", async () => {
            const objToDraft: any = Object.assign({}, tempObject)
            objToDraft.draft = true
            const response = await request.post('/api/draft/draftDocument').send({ doc: objToDraft })

            expect(response.body.status).toEqual(200)
            expect(response.body.message).toEqual('document is drafted successfully')
            expect(response.body.doc.draft).toEqual(true)

            const keys = Object.keys(objToDraft)
            const key = keys[Math.floor(Math.random() * keys.length)]

            // this expect may fail anytime
            if (key !== 'sent_date' && key !== 'received_date') 
                expect(response.body.doc[key]).toEqual(objToDraft[key])
        })

        it("Should return 400 if an empty document is passed", async () => {
            const doc = {}
            const response = await request.post('/api/draft/draftDocument').send({ doc: doc })
            expect(response.body.status).toEqual(400)
            expect(response.body.message).toEqual('the passed document is empty')
        })

        it("Should return 400 not document to draft was passed", async () => {
            const response = await request.post('/api/draft/draftDocument').send({})
            expect(response.body.status).toEqual(400)
            expect(response.body.message).toEqual('a document to draft should be passed')
        })
    })

    describe("Testing the Route '/draft/draftReply'", () => {
        it("Should return 200 given a valid thread_id and a parent_id, and the document should be added to the parent and marked as drafted", async () => {
            const threads = await correspondants.aggregate([
                {
                    $group:{
                        _id: "$content.thread_id",
                        Correspondence: { $push: "$$ROOT" },
                        count: { $sum: 1 },
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
                },
                {
                    $limit: 1
                }
            ])

            const threadsIDs = threads.map((thread: any) => thread._id)

            // add a drafted reply to thread 0
            const reply = Object.assign({}, tempObject)

            const requestBody = {
                thread_id: threadsIDs[0],
                parent_id: threads[0].Correspondence[threads[0].Correspondence.length - 1]._id,
                doc: reply
            }

            const response = await request.post('/api/draft/draftReply').send( requestBody )

            expect(response.body.status).toEqual(200)
            expect(response.body.message).toEqual("draft updated successfully")
            expect(response.body.doc.thread_id).toEqual(threadsIDs[0])
            expect(response.body.doc.replay_on).toEqual(String(threads[0].Correspondence[threads[0].Correspondence.length - 1]._id))


            // check if the reply has been added as drafted
            const justUpdatedThread = await correspondants.aggregate([
                {
                    $match: {
                        'content.thread_id': threadsIDs[0]
                    }
                },
                {
                    $sort: { 'content.sent_date': -1 }
                }
            ])

            expect(justUpdatedThread[justUpdatedThread.length - 1].content.thread_id).toEqual(response.body.doc.thread_id)
            expect(justUpdatedThread[justUpdatedThread.length - 1].content.replay_on).toEqual(response.body.doc.replay_on)
            expect(justUpdatedThread[justUpdatedThread.length - 1].content.corr_no).toEqual(response.body.doc.corr_no)
        })

        it("Should return 400 if not passed any required parameters", async () => {
            const tempThread = (await correspondants.aggregate([
                {
                    $group:{
                        _id: "$content.thread_id",
                        Correspondence: { $push: "$$ROOT" },
                        count: { $sum: 1 },
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
                },
                {
                    $limit: 1
                }
            ]))[0]

            const tempObjectID = tempThread.Correspondence[tempThread.Correspondence.length - 1]._id

            const requestBody1 = {
                notValidParam: "whatever",
                parent_id: tempObjectID,
                doc: "whatever"
            }
            const response = await request.post('/api/draft/draftReply').send( requestBody1 )
            expect(response.body.status).toEqual(400)
            expect(response.body.message).toEqual('thread is should be passed and of type interger')


            const requestBody2  = {
                thread_id: "whatever",
                notValidParam: 'whatever',
                doc: "whatever"
            }
            const response2 = await request.post('/api/draft/draftReply').send( requestBody2 )
            expect(response2.body.status).toEqual(400)
            expect(response2.body.message).toEqual('parent_id should be passed and of type integer')


            const requestBody3 = {
                thread_id: "whatever",
                parent_id: tempObjectID,
                notValidParam: "whatever"
            }
            const response3 = await request.post('/api/draft/draftReply').send( requestBody3 )
            expect(response3.body.status).toEqual(400)
            expect(response3.body.message).toEqual('document to draft is not passed')
        })

        it("Should return 400 if provided any invalid parent ID", async () => {
            const invalidRequestBody = {
                thread_id: "345trdff",
                parent_id: 'fjweiofjwfiwu94',
                doc: {
                    "_id": 'fsdfsdfsdfsdfsdfsdf'
                }
            }
            const response = await request.post('/api/draft/draftReply').send(invalidRequestBody)
            expect(response.body.status).toEqual(400)
            expect(response.body.message).toEqual('parent_id is not valid')
        })

        it("Should return 400 if provided an empty doc object", async () => {
            const tempThread = (await correspondants.aggregate([
                {
                    $group:{
                        _id: "$content.thread_id",
                        Correspondence: { $push: "$$ROOT" },
                        count: { $sum: 1 },
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
                },
                {
                    $limit: 1
                }
            ]))[0]

            const tempObjectID = tempThread.Correspondence[tempThread.Correspondence.length - 1]._id

            const invalidRequestBody = {
                thread_id: "wtfjfsdsdsd",
                parent_id: tempObjectID,
                doc: {}
            }

            const response = await request.post('/api/draft/draftReply').send(invalidRequestBody)

            expect(response.body.status).toEqual(400)
            expect(response.body.message).toEqual('the passed document is empty')
        })

        it("Should return 400 if not give any document", async () => {
            const tempThread = (await correspondants.aggregate([
                {
                    $group:{
                        _id: "$content.thread_id",
                        Correspondence: { $push: "$$ROOT" },
                        count: { $sum: 1 },
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
                },
                {
                    $limit: 1
                }
            ]))[0]

            const tempObjectID = tempThread.Correspondence[tempThread.Correspondence.length - 1]._id

            const invalidRequestBody = {
                thread_id: "wtfjfsdsdsd",
                parent_id: tempObjectID,
            }

            const response = await request.post('/api/draft/draftReply').send(invalidRequestBody)

            expect(response.body.status).toEqual(400)
            expect(response.body.message).toEqual('document to draft is not passed')
        })
    })

    describe("Testing the Route '/draft/count/v2'", () => {
        it("Should return 200 and return the same count as the DB query", async () => {
            const realDraftCount = (await correspondants.aggregate([
                {
                    $group:{
                        _id: "$content.thread_id",
                        Correspondence: { $push: "$$ROOT" },
                        count: { $sum: 1 },
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
            ])).length
 
            const endpointResult = await request.get('/api/draft/count/v2')

            expect(endpointResult.body.status).toEqual(200)
            expect(endpointResult.body.count).toEqual(realDraftCount)
        })

        it("Should return 200 and the same count as the DB query after deleting a drafted doc", async () => {
            const draftedThreadIDs = (await correspondants.aggregate([
                {
                    $group:{
                        _id: "$content.thread_id",
                        Correspondence: { $push: "$$ROOT" },
                        count: { $sum: 1 },
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
            ])).map((thread: any) => thread._id)

            const beforeDeletingCount = draftedThreadIDs.length
            
            // delete a drafted thread
            const isFirstThreadDeleted = await correspondants.updateOne({ 'content.thread_id': draftedThreadIDs[0] }, { $set: { 'content.delete': true, 'content.draft': false }})
            if(isFirstThreadDeleted) {
                const response1 = await request.get('/api/draft/count/v2')
                expect(response1.body.status).toEqual(200)
                expect(response1.body.count).toEqual(beforeDeletingCount - 1)
            }
            
            // delete second drafted thread
            const isSecondThreadDeleted = await correspondants.updateOne({ 'content.thread_id': draftedThreadIDs[1] }, { $set: { 'content.delete': true, 'content.draft': false }})
            if (isSecondThreadDeleted) {
                const response2 = await request.get("/api/draft/count/v2")
                expect(response2.body.status).toEqual(200)
                expect(response2.body.count).toEqual(beforeDeletingCount - 2)
            }

            // delete third drafted thread
            const isThridThreadDeleted = await correspondants.updateOne({ 'content.thread_id': draftedThreadIDs[2] }, { $set: { 'content.delete': true, 'content.draft': false }})
            if (isThridThreadDeleted) {
                const response3  = await request.get("/api/draft/count/v2")
                expect(response3.body.status).toEqual(200)
                expect(response3.body.count).toEqual(beforeDeletingCount - 3) 
            }
        })
    })

    afterAll(async () => {
        await correspondants.deleteMany({})
    })
})