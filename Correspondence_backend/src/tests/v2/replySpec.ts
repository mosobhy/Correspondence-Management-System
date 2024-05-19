import supertest from 'supertest';
import app from '../../index';
import * as seeds from '../seedingTestingDB'
import { correspondants } from '../../database/database.mongoose';


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


describe("Testing the endpoint of '/reply'", () => {
    beforeAll(async () => {
        await seeds.createNewThreads(tempObject, correspondants)
        await seeds.createNewThreadsWithReplys(tempObject, correspondants)
        await seeds.createNewThreadsWithDraftedReplys(tempObject, correspondants)
    })

    describe("Testing the Route '/reply/addReply'", () => {
        it("Should return 200 given a document to add for a specific thread", async () => {
            const threadToAddReply = await correspondants.aggregate([
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
            const lastMessage = threadToAddReply[0].Correspondence[threadToAddReply[0].Correspondence.length - 1]
            const thread_id = threadToAddReply[0].Correspondence[0].content.thread_id
            const parent_id = lastMessage._id

            const requestBody = {
                thread_id: thread_id,
                parent_id: parent_id,
                replay: tempObject
            }

            const response = await request.post('/api/replay/addReplay').send(requestBody)

            expect(response.body.status).toEqual(200)
            expect(response.body.message).toEqual("Reply is added successfully")

            const wholeThread = await correspondants.aggregate([
                {
                    $match: { 'content.thread_id': thread_id }
                }
            ])
            const lastReply = wholeThread[wholeThread.length - 1]

            expect(lastReply.content.thread_id).toEqual(thread_id)
            expect(lastReply.content.replay_on).toEqual(String(parent_id))
        })

        it("Should return 400 if no thread_id is providded", async () => {
            const requestBody = {
                parent_id: "wwfefwe",
                replay: {
                    "whatever": "whatver"
                }
            }
            const response = await request.post("/api/replay/addReplay").send(requestBody)
            expect(response.body.status).toEqual(400)
            expect(response.body.message).toEqual('thread_id should be passed')
        })

        it("Should return 400 if no parent_id is providded", async () => {
            const requestBody = {
                thread_id: "wwfefwe",
                replay: {
                    "whatever": "whatver"
                }
            }
            const response = await request.post("/api/replay/addReplay").send(requestBody)
            expect(response.body.status).toEqual(400)
            expect(response.body.message).toEqual('parent_id should be passed')
        })
    
        it("Should return 400 if no doc is providded", async () => {
            const requestBody = {
                thread_id: "wwfefwe",
                parent_id: 'werwr'
            }
            const response = await request.post("/api/replay/addReplay").send(requestBody)
            expect(response.body.status).toEqual(400)
            expect(response.body.message).toEqual('doc should be passed')
        })

        it("Should return 400 if provided an empty doc", async () => {
            const requestBody = {
                thread_id: "wwfefwe",
                parent_id: 'werwr',
                replay: { }
            }
            const response = await request.post("/api/replay/addReplay").send(requestBody)
            expect(response.body.status).toEqual(400)
            expect(response.body.message).toEqual('the passed document is empty')
        })

        it("Should return 400 if the replay was of type other than object", async () => {
            const requestBody = {
                thread_id: "wwfefwe",
                parent_id: 'werwr',
                replay: "whatever"
            }
            const response = await request.post("/api/replay/addReplay").send(requestBody)
            expect(response.body.status).toEqual(400)
            expect(response.body.message).toEqual('doc key must be of type object holding the correspondence to add')
        })

        it("Should return 400 if an invalid corr_id is provided incase of drafted reply", async () => {
            const requestBody = {
                thread_id: "whatever",
                parent_id: "whatever",
                corr_id: "whatever", // will make the endpoint throw
                replay: { name: "whatever"}
            }
            const response = await request.post("/api/replay/addReplay").send(requestBody)
            expect(response.body.status).toEqual(400)
            expect(response.body.message).toEqual('correspondence ID is not valid')
        })
    })

    afterAll(async () => {
        await correspondants.deleteMany({})
    })
})