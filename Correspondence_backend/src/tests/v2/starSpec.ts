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


describe("Testing the Route '/star/paging/v2'", () => {
    beforeAll(async () => {
        await seeds.createStarredMessages(tempObject, correspondants)
        await seeds.createStarredDraftedMessages(tempObject, correspondants)
        await seeds.createStarredDraftedThreads(tempObject, correspondants)
        await seeds.createStarredThreads(tempObject, correspondants)
        await seeds.createNewThreads(tempObject, correspondants)
    })

    describe("Testing GET '/star/paging/v2?page=1&limit=20", () => {
        it("Should return 200 as a status and return 20 thread incase of page=1, limit=20", async () => {
            const page = 1
            const limit = 20
            const response = await request.get(`/api/star/paging/v2?page=${page}&limit=${limit}`)
            expect(response.status).toEqual(200)
            expect(response.body.length).toEqual(20)
        })

        it("Should return 200 as a status and return 0 thread incase of page=2, limit=20", async () => {
            const page = 2
            const limit = 20
            const response = await request.get(`/api/star/paging/v2?page=${page}&limit=${limit}`)
            expect(response.status).toEqual(200)
            expect(response.body.length).toEqual(0)
        })

        it("Should return 400 as a status code if any of page and limit is not Integer", async () => {
            const page = 'string'
            const limit = 20
            const response = await request.get(`/api/star/paging/v2?page=${page}&limit=${limit}`)
            expect(response.body.status).toEqual(400)
            expect(response.body.message).toEqual("pagination boundaries should be passed and be of type Integer")
        })

        it("Should return '400' as a status code if any of page or limit is not passed", async () => {
            const page = 1
            const response = await request.get(`/api/star/paging/v2?page=${page}&limit=`)
            expect(response.body.status).toEqual(400)
            expect(response.body.message).toEqual("pagination boundaries should be passed and be of type Integer")
        })
    })

    describe("Testing the Route '/star/paging/v2' behavior after performing some operations", () => {
        it("Should return the same threads even if we INSERTED other treads without starring any them", async () => {
            const starredThreadsBeforeInsertion = await correspondants.aggregate([
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
                }
            ])
            const success = await request.post('/api/insert/').send({ doc: tempObject })
            if (success) {
                const afterInsertion = await request.get("/api/star/paging/v2?page=1&limit=100")
                expect(afterInsertion.status).toEqual(200)
                expect(afterInsertion.body.length).toEqual(starredThreadsBeforeInsertion.length)
            }
        })

        it("Should return the same threads even if we DELETED other treads without starring any them", async () => {
            const starredThreadsBeforeInsertion = await correspondants.aggregate([
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
                }
            ])

            const inStarredThreadID = (await correspondants.aggregate([
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
                            { isStarred: false },
                            { isThreadDeleted: false }
                        ]
                    }
                }
            ]))[0]._id

            // delete that instarred thread
            const success = await correspondants.updateOne({
                'content.thread_id': inStarredThreadID
            }, {
                $set: {
                    "content.delete": true,
                    "content.starred": false,
                    "content.draft": false,
                    "content.deleteTime": Date()
                }
            })
            // delete a whole thread and expect the starred to be less by one
            if (success) {
                const afterInsertion = await request.get("/api/star/paging/v2?page=1&limit=100")
                expect(afterInsertion.status).toEqual(200)
                expect(afterInsertion.body.length).toEqual(starredThreadsBeforeInsertion.length)
            }
        })

        it("Should return the same threads - 1 after DELETING a starrd thread", async () => {
            const starredThreadsBeforeDeletion = await correspondants.aggregate([
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
                }
            ])
            const threadIDToBeDeleted = starredThreadsBeforeDeletion[0]._id
            const success = await correspondants.updateOne({
                'content.thread_id': threadIDToBeDeleted 
            }, {
                $set: {
                    "content.delete": true,
                    "content.starred": false,
                    "content.draft": false,
                    "content.deleteTime": Date()
                }
            })
            if (success) {
                const afterDeletion = await request.get("/api/star/paging/v2?page=1&limit=100")
                expect(afterDeletion.status).toEqual(200)
                expect(afterDeletion.body.length).toEqual(starredThreadsBeforeDeletion.length - 1)
            }
        })
    })

    describe("Testing the Route '/star/starThreadById' ", () => {
        it("Should return 200 given the thread_id of an unstarred thread, the thread head should be marked as starred", async () => {
            // get the thread_id of an unstarred thread
            const unstarredThreadId = (await correspondants.aggregate([
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
                            { isStarred: false },
                            { isThreadDeleted: false }
                        ]
                    }
                },
                {
                    $limit: 1
                }
            ]))[0]._id

            // star the thread by the endpoint
            const afterStarringThread = await request.get(`/api/star/starThreadById?thread_id=${unstarredThreadId}`)

            // get starred threads by db query
            const allStarredThreads = await correspondants.aggregate([
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

            // check if the thread_id belong to that list
            let threadIsStarredSuccessfully = false
            allStarredThreads.map((thread: any) => {
                if (thread._id === unstarredThreadId) threadIsStarredSuccessfully = true
            })

            expect(afterStarringThread.body.status).toEqual(200)
            expect(afterStarringThread.body.update).toEqual(true)
            expect(threadIsStarredSuccessfully).toEqual(true)
        })

        it("Should return 200 given the thread_id of a starred thread, and unstar all of its messages", async () => {
            // get the thread_id of a starred thread and iterate and star all its docs
            const starredThreadId = (await correspondants.aggregate([
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
                },
                {
                    $limit: 1
                }
            ]))[0]._id

            // star all the documents of that thread
            const _starringThreadDocs = await correspondants.updateMany(
                {
                    'content.thread_id': starredThreadId
                }, 
                {
                    $set: {
                        'content.starred': true
                    }
                }
            )

            // unstar the thread by the endpoint
            const afterUnstarringThread = await request.get(`/api/star/starThreadById?thread_id=${starredThreadId}`)

            // get the unstarred threads by db query
            const allUnStarredThreads = await correspondants.aggregate([
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
                            { isStarred: false },
                            { isThreadDeleted: false }
                        ]
                    }
                }
            ])

            // check if the thread_id belong to that list
            let isThreadUnstarredSuccessfully = false
            allUnStarredThreads.map((thread: any) => {
                if (thread._id === starredThreadId) isThreadUnstarredSuccessfully = true
            })

            expect(afterUnstarringThread.body.status).toEqual(200)
            expect(afterUnstarringThread.body.update).toEqual(false)
            expect(afterUnstarringThread.body.message).toEqual('thread has been unstarred successfully')
            expect(isThreadUnstarredSuccessfully).toEqual(true)
        })

        it("Should return 400 if thread_id parameter not passed", async () => {
            const response = await request.get("/api/star/starThreadById")
            expect(response.body.status).toEqual(400)
            expect(response.body.message).toEqual("thread_id should be passed")
        })

        it("Should return 400 if the thread_id is incorret", async () => {
            const response = await request.get('/api/star/starThreadById?thread_id=8jfrfjoslfd')
            expect(response.body.status).toEqual(400)
            expect(response.body.message).toEqual('invalid thread_id')
        })
    })

    describe("Testing the route '/star/starDocumentById'", () => {
        it("Should return 400 if corr_id parameter not passed", async () => {
            const response = await request.get("/api/star/starDocumentById")
            expect(response.body.status).toEqual(400)
            expect(response.body.message).toEqual("document _id should be passed")
        })

        it("Should return 400 if the corr_id is incorret", async () => {
            const response = await request.get('/api/star/starDocumentById?corr_id=8jfrfjoslfd')
            expect(response.body.status).toEqual(400)
            expect(response.body.message).toEqual('invalid document _id')
        })
        
        it("Should return 200 give a ID of an unstarred message and the resulting document should be starred", async () => {
            // get id of an unstarred message
            const unstarredMessageId = (await correspondants.findOne({ 'content.draft': true, 'content.starred': false }))._id   // this is a single message
            const response = await request.get(`/api/star/starDocumentById?corr_id=${unstarredMessageId}`)
            expect(response.body.status).toEqual(200)
            expect(response.body.message).toEqual('document has been starred successfully')
            expect(response.body.update).toEqual(true)
        })

        it("Should return 200 give a ID of an starred message and the resutling document should be unstarred", async () => {
            // get id of an unstarred message
            const starredMessageId = (await correspondants.findOne({ 'content.draft': true, 'content.starred': true }))._id   // this is a single message
            const response = await request.get(`/api/star/starDocumentById?corr_id=${starredMessageId}`)
            expect(response.body.status).toEqual(200)
            expect(response.body.message).toEqual('document has been unstarred successfully')
            expect(response.body.update).toEqual(false)
        })

        it("Should return 400 given an ID of an unstarred message, then deleting it, then trying to star it", async () => {
            const toBeDeletedUnstarredMessage = (await correspondants.findOne({ 'content.draft': true, 'content.starred': false }))._id
            const success = await correspondants.deleteOne({ _id: toBeDeletedUnstarredMessage })
            if (success) {
                // try to star it
                const response = await request.get(`/api/star/starDocumentById?corr_id=${toBeDeletedUnstarredMessage}`)
                expect(response.body.status).toEqual(400)
                expect(response.body.message).toEqual('no document with that id, it may be deleted')
            }
        })
        
    })

    describe("Testing the Route '/star/count/v2'", () => {
        it("Should return 200 and return the same count as the DB query", async () => {
            const realStarredCount = (await correspondants.aggregate([
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
            ])).length

            const endpointResult = await request.get('/api/star/count/v2')

            expect(endpointResult.body.status).toEqual(200)
            expect(endpointResult.body.count).toEqual(realStarredCount)
        })

        it("Should return 200 and the same count as the DB query after deleting a starred doc", async () => {
            const realStarredCount = (await correspondants.aggregate([
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
            ])).length

            const deletedDoc = await correspondants.deleteOne({ 'content.draft': true, 'content.starred': true })
            if (deletedDoc) {
                const endpointResult = await request.get("/api/star/count/v2")
                expect(endpointResult.body.status).toEqual(200)
                expect(endpointResult.body.count).toEqual(realStarredCount - 1)
            }
        })

        it("Should 200 and the same count as the DB query after deleting a starred item, and unstarring an item", async () => {
            const realStarredCount = (await correspondants.aggregate([
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
            ])).length

            // delete a starred doc
            await correspondants.deleteOne({ 'content.draft': true, 'content.starred': true })
            // unstar a starred doc
            await correspondants.updateOne({ 'content.draft': true, 'content.starred': true }, { $set: { 'content.starred': false } })
            const endpointResult = await request.get('/api/star/count/v2')
            expect(endpointResult.body.status).toEqual(200)
            expect(endpointResult.body.count).toEqual(realStarredCount - 2)
        })
    })

    afterAll(async () => {
        await correspondants.deleteMany({});
    })
})


