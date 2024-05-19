import supertest from 'supertest';
import app from '../../index';
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
}


describe("Testing the Route '/insert'", () => {
    describe("Testing the 'POST /insert' endpoint for new correspondents", () => {

        it("Should return '200' as a status code if a proper object passed", async () => {
            const response = await request.post('/api/insert/').send({ doc: tempObject })
            expect(response.body.status).toEqual(200)
            expect(response.body.doc.corr_no).toEqual(tempObject.corr_no)
            expect(response.body.doc.corr_subject).toEqual(tempObject.corr_subject)
            expect(response.body.message).toEqual("correspondence inserted successfully")
        })

        it("should return '400' as a status code if an empty object is provided", async () => {
            const response = await request.post('/api/insert/').send({ doc: {} })
            expect(response.body.status).toEqual(400)
            expect(response.body.message).toEqual("no body is provided")
        })

        describe("Testing proper handling for inproper input params", () => {
            it("Should return '400' as a status code in case of Integer input param", async () => {
                const response = await request.post("/api/insert/").send({ doc: 10 })
                expect(response.body.status).toEqual(400)
                expect(response.body.errors).toEqual('"value" must be of type object')
            })

            it("Should return '400' as a status code in case of String input param", async () => {
                const response = await request.post("/api/insert/").send({ doc: "string" })
                expect(response.body.status).toEqual(400)
                expect(response.body.errors).toEqual('"value" must be of type object')
            })

            it("Should return '400' as a status code in case of Invalid Object input param", async () => {
                const response = await request.post("/api/insert/").send({ doc: { name: "string" } })
                expect(response.body.status).toEqual(400)
                expect(response.body.errors).toEqual('"corr_no" is required')
            })
        })

        describe("Testing the if one or more of the required values are misssing", () => {
            it("Should return '400' and error when missing 1 of the required values", async () => {
                const missingValueObj = Object.assign({}, tempObject)
                missingValueObj.corr_no = ''
                const response = await request.post('/api/insert/').send({ doc: missingValueObj })
                expect(response.body.status).toEqual(400)
                expect(response.body.errors).toEqual('"corr_no" is not allowed to be empty')
            })

            it("Should return '400' and error when missing 2 of the required values", async () => {
                const missingValueObj = Object.assign({}, tempObject)
                missingValueObj.corr_body = '' 
                const response = await request.post('/api/insert/').send({ doc: missingValueObj })
                expect(response.body.status).toEqual(400)
                expect(response.body.errors).toEqual('"corr_body" is not allowed to be empty')
            })
        })
    })

    afterAll(async () => {
        await correspondants.deleteMany({});
    })

})


