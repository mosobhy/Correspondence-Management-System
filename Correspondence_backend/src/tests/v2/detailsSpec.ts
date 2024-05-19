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


describe("Testing the Route '/details'", () => {
    beforeAll(async () => {
        await seeds.createNewThreadsWithDraftedReplys(tempObject, correspondants)
        await seeds.createNewThreads(tempObject, correspondants)
    })

    describe("Testing the Route 'details/traverseThread'", () => {
        it("Should return 200 and the thread if given a valid corr_id", async () => {
            const threads = await correspondants.aggregate([
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
                            { isThreadDeleted: false }
                        ]
                    }
                }
            ])

            const lastMessage = threads[6].Correspondence[threads[6].Correspondence.length - 1]
            
            const response = await request.get(`/api/details/traverseThread?corr_id=${lastMessage._id}`)

            expect(response.status).toEqual(200)
            expect(response.body.length).toEqual(threads[6].Correspondence.length)

            const lastReturnedMessage = response.body[response.body.length - 1]

            expect(lastReturnedMessage._id).toEqual(String(lastMessage._id))
            expect(lastReturnedMessage.replay_on).toEqual(String(threads[6].Correspondence[threads[6].Correspondence.length - 2]._id))
        })

        it("Should return 400 incase of an invalid corr_id", async () => {
            const invalidCorrID = 'whatever'
            const response = await request.get(`/api/details/traverseThread?corr_id=${invalidCorrID}`)
            
            expect(response.body.status).toEqual(400)
            expect(response.body.message).toEqual("correspondence ID is not valid")
        })

        it("Should return 400 incase of corr_id is not passed", async () => {
            const response = await request.get('/api/details/traverseThread')
            expect(response.body.status).toEqual(400)
            expect(response.body.message).toEqual('corr_id is not passed')
        })
    })

    afterAll(async () => {
        await correspondants.deleteMany({})
    })
})