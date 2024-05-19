import supertest from 'supertest'
import { correspondants } from '../../database/database.mongoose'
import app from '../../index'
import * as seeds from '../seedingTestingDB'


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


describe("Testing the Route '/delete", () => {
    beforeAll(async () => {
        await seeds.createStarredThreads(tempObject, correspondants)
        await seeds.createNewThreads(tempObject, correspondants)
        await seeds.createNewDeletedMessages(tempObject, correspondants)
        await seeds.createNewDeletedMessages(tempObject, correspondants)
        await seeds.createNewTrashedThreads(tempObject, correspondants)
        await seeds.createNewTrashedThreads(tempObject, correspondants)
    }) 

    describe("Testing the Route of '/delete/paging/v2'", () => {
        it("Should return 200 as a status and return 20 thread incase of page=1, limit=20", async () => {
            const page = 1
            const limit = 20
            const response = await request.get(`/api/delete/paging/v2?page=${page}&limit=${limit}`)
            expect(response.status).toEqual(200)
            expect(response.body.length).toEqual(20)
        })

        it("Should return 200 as a status and return 0 thread incase of page=2, limit=20", async () => {
            const page = 2
            const limit = 20
            const response = await request.get(`/api/delete/paging/v2?page=${page}&limit=${limit}`)
            expect(response.status).toEqual(200)
            expect(response.body.length).toEqual(0)
        })

        it("Should return 400 as a status code if any of page and limit is not Integer", async () => {
            const page = 'string'
            const limit = 20
            const response = await request.get(`/api/delete/paging/v2?page=${page}&limit=${limit}`)
            expect(response.body.status).toEqual(400)
            expect(response.body.message).toEqual("pagination boundaries should be passed and of type integer")
        })

        it("Should return '400' as a status code if any of page or limit is not passed", async () => {
            const page = 1
            const response = await request.get(`/api/delete/paging/v2?page=${page}&limit=`)
            expect(response.body.status).toEqual(400)
            expect(response.body.message).toEqual("pagination boundaries should be passed and of type integer")
        })
    })

    describe("Testing the Route '/delete/deleteBulkThreads'", () => {
        it("Should return 200 given a list of thread_ids to be marked as deleted", async () => {
            const unDeletedThreads = await correspondants.aggregate([
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
                            { isThreadDeleted: false },
                        ]
                    }
                }
            ])
            const toBeDeletedThreads = (unDeletedThreads.map((thread: any) => thread._id)).slice(0, 5)

            const response = await request.delete('/api/delete/deleteBulkThreads').send({ thread_IDs: toBeDeletedThreads })

            const restofUnDeletedThreads = (await correspondants.aggregate([
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
                            { isThreadDeleted: false },
                        ]
                    }
                }
            ])).map((thread: any) => thread._id)

            // undeleted - tobedeleted = restofundeleted
            expect(
                (unDeletedThreads.slice(5, unDeletedThreads.length))
                .map( (thread: any) => thread._id)
                .sort()
            ).toEqual(restofUnDeletedThreads.sort())
            expect(response.body.status).toEqual(200)
            expect(response.body.message).toEqual('documents are deleted successfully')
        })

        it("Should 400 when not passing the list of thread IDs", async () => {
            const response = await request.delete('/api/delete/deleteBulkThreads').send({})
            expect(response.body.status).toEqual(400)
            expect(response.body.message).toEqual("thread IDs to be deleted should be passed")
        })

        it("Should return 400 if given an invalid thread IDs list", async () => {
            const invalidThreadIDsList = ['invalidID1', 'invalidID2', 'invalidID3']
            const response = await request.delete('/api/delete/deleteBulkThreads').send({ thread_IDs: invalidThreadIDsList })

            expect(response.body.status).toEqual(400)
            expect(response.body.message).toEqual("invalidID1 is not a valid thread ID")

            const restOfList = invalidThreadIDsList.slice(1, invalidThreadIDsList.length)
            const response2 = await request.delete('/api/delete/deleteBulkThreads').send({ thread_IDs: restOfList })

            expect(response2.body.status).toEqual(400)
            expect(response2.body.message).toEqual("invalidID2 is not a valid thread ID")

            const lastOfList = invalidThreadIDsList.slice(2, invalidThreadIDsList.length)
            const response3 = await request.delete('/api/delete/deleteBulkThreads').send({ thread_IDs: lastOfList })
            
            expect(response3.body.status).toEqual(400)
            expect(response3.body.message).toEqual("invalidID3 is not a valid thread ID")
        })

        it("Delete given a list containing a combination of valid and invalid thread IDs")
    })

    describe("Testing the Route '/delete/deleteThreadById'", () => {
        it("Should return 200 if give a valid thread ID and the thread head message should be marked as deleted", async () => {
            const unDeletedThreadID = (await correspondants.aggregate([
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
                            { isThreadDeleted: false },
                        ]
                    }
                },
                {
                    $limit: 1
                }
            ]))[0]._id

            const response = await request.delete(`/api/delete/deleteThreadById?thread_id=${unDeletedThreadID}`)

            expect(response.body.status).toEqual(200)
            expect(response.body.message).toEqual('thread is deleted successfully')
        })

        it("Should return 400 if no thread ID param is not passed", async () => {
            const response = await request.delete("/api/delete/deleteThreadById?thread_id=")
            expect(response.body.status).toEqual(400)
            expect(response.body.message).toEqual("thread ID should be passed")
        })
    
        it("Should return 400 if an invalid thread ID is passed", async () => {
            const response = await request.delete("/api/delete/deleteThreadById?thread_id=invalidThreadId")
            expect(response.body.status).toEqual(400)
            expect(response.body.message).toEqual("invalid thread ID")
        })
    })

    describe("Testing the Route '/delete/untrashThread'", () => {
        it("Should return 200 given a list of deleted threads, and the endpoint should restore them", async () => {
            // same as /deleteBulkThread
            const deletedThreads = await correspondants.aggregate([
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
                }
            ])
            const toBeRestoredThreads = (deletedThreads.map((thread: any) => thread._id)).slice(0, 5)

            // untrash them
            const response = await request.post('/api/delete/untrashThread').send({ thread_IDs: toBeRestoredThreads })
            
            const restofDeletedThreads = (await correspondants.aggregate([
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
                }
            ])).map((thread: any) => thread._id)

            expect(
                (deletedThreads.slice(5, deletedThreads.length))
                .map( (thread: any) => thread._id)
                .sort()
            ).toEqual(restofDeletedThreads.sort())
            expect(response.body.status).toEqual(200)
            expect(response.body.message).toEqual('documents are restored successfully')
        })

        it("Should 400 when not passing the list of thread IDs", async () => {
            const response = await request.post('/api/delete/untrashThread').send({})
            expect(response.body.status).toEqual(400)
            expect(response.body.message).toEqual("list of threads to restore should be passed")
        })

        it("Should return 400 if given an invalid thread IDs list", async () => {
            const invalidThreadIDsList = ['invalidID1', 'invalidID2', 'invalidID3']
            const response = await request.post('/api/delete/untrashThread').send({ thread_IDs: invalidThreadIDsList })

            expect(response.body.status).toEqual(400)
            expect(response.body.message).toEqual("invalidID1 is not a valid thread ID")

            const restOfList = invalidThreadIDsList.slice(1, invalidThreadIDsList.length)
            const response2 = await request.post('/api/delete/untrashThread').send({ thread_IDs: restOfList })

            expect(response2.body.status).toEqual(400)
            expect(response2.body.message).toEqual("invalidID2 is not a valid thread ID")

            const lastOfList = invalidThreadIDsList.slice(2, invalidThreadIDsList.length)
            const response3 = await request.post('/api/delete/untrashThread').send({ thread_IDs: lastOfList })
            
            expect(response3.body.status).toEqual(400)
            expect(response3.body.message).toEqual("invalidID3 is not a valid thread ID")
        })
    })

    describe("Testing the Route '/delete/count'", () => {
        it("Should return 200 and return the same count as the DB query", async () => {
            const realDeletedCount = (await correspondants.aggregate([
                {
                    $group:{
                        _id: "$content.thread_id",
                        Correspondence: { $push:"$$ROOT" },
                        count: { $sum: 0 },
                        isThreadDeleted: { $max: "$content.delete" },
                    },
                },
                {
                    $sort: {"Correspondence.content.sent_date": -1}
                },
                {
                    $match: {
                        $and: [
                            { isThreadDeleted: true }
                        ]
                    }
                }
            ])).length

            const endpointResult = await request.get('/api/delete/count')

            expect(endpointResult.body.status).toEqual(200)
            expect(endpointResult.body.count).toEqual(realDeletedCount)
        })

        it("Should return 200 and the same count as the DB query after restoring a deleted doc", async () => {
            const realDeletedCount = (await correspondants.aggregate([
                {
                    $group:{
                        _id: "$content.thread_id",
                        Correspondence: { $push:"$$ROOT" },
                        count: { $sum: 0 },
                        isThreadDeleted: { $max: "$content.delete" },
                    },
                },
                {
                    $sort: {"Correspondence.content.sent_date": -1}
                },
                {
                    $match: {
                        $and: [
                            { isThreadDeleted: true }
                        ]
                    }
                }
            ])).length

            const restoredDoc = await correspondants.updateOne({ 'content.delete': true }, { $set: { 'content.delete': false }})
            if (restoredDoc) {
                const endpointResult = await request.get("/api/delete/count")
                expect(endpointResult.body.status).toEqual(200)
                expect(endpointResult.body.count).toEqual(realDeletedCount- 1)
            }
        })
    })

    afterAll(async () => {
        await correspondants.deleteMany({})
    })
})