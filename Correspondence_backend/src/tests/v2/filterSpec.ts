import supertest from 'supertest'
import { correspondants } from '../../database/database.mongoose'
import app from '../../index'
import * as seeds from '../seedingTestingDB'
import { Client } from '@elastic/elasticsearch'


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


describe("Testing the Route '/filter", () => {
    beforeAll(async () => {
    }) 

    describe("Testing the Route '/filter/filterForInbox'", () => {
        it("To be implmented")
    })

    afterAll(async () => {
        await correspondants.deleteMany({})
    })
})