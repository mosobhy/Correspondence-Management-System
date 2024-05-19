/**
 * The purpose of this script is to insert some documents and threads 
 * in the test database collection to be able to perform the test cases
 */
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import { wholeSystemSchema } from '../database/database.mongoose'
import { synchronizeCompletionEvent } from '../database/database.mongoose'
import { v4 as uuidv4 } from 'uuid';


dotenv.config()


const testDBConnectionString = String(process.env.TEST_MONGODB_CONNECTION_STRING)
const testCollectionName     = String(process.env.TEST_COLLECTION_NAME)

mongoose.connect(testDBConnectionString)

const CorrespondenceModel: any = mongoose.model(testCollectionName, wholeSystemSchema)

const doc = {
    corr_no: "string",
    corr_type: "string",
    entity_no: "string",
    from_entity: "string",
    from_department: "string",
    from_user: "string",
    from_email: "string",
    cc_entity: ["string", "string2"],
    entity_address: "string",
    to_entity: "string",
    to_department: "string",
    received_date: "string",
    received_user: "string",
    sent_date: "string",
    priority: "String",
    classification: "string",
    corr_subject: "string",
    corr_body: "string",
    await_reply: false,
    message_status: "string",
    docs_IDs: ["string1", "string2"],
    due_date: "string",
    starred: false,
    draft: false,
    delete: false,
    replay_on: null
}


const createSingleCorrespondence = async (doc: any) => {
    const newDoc =  await new CorrespondenceModel()
    newDoc.content._id = String(newDoc._id) // not working

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
    newDoc.content.received_user = doc.received_user
    newDoc.content.sent_date = new Date()
    newDoc.content.priority = doc.priority
    newDoc.content.classification = doc.classification
    newDoc.content.corr_subject = doc.corr_subject
    newDoc.content.corr_body = doc.corr_body
    newDoc.content.await_reply = doc.await_reply
    newDoc.content.message_status = doc.message_status
    newDoc.content.docs_IDs = doc.docs_IDs
    newDoc.content.starred = doc.starred
    newDoc.content.draft = doc.draft
    newDoc.content.delete = doc.delete
    newDoc.content.thread_id = uuidv4()
    newDoc.content.replay_on = doc.replay_on

    const response = await newDoc.save()

    return response
}


export const createNewThreads = async () => {
    for (let i = 0; i < 5; i++) {
        await createSingleCorrespondence(doc)
        console.warn('-----created document {' + Number(i+1) + '}------')
    }
}


export const createNewThreadsWithReplys = async () => {
    // create a single correspondence
    for (let i = 0; i < 5; i++) {
        const thread: any = await createSingleCorrespondence(doc)
        const replyOne: any = await createSingleCorrespondence(doc)
        const replyTwo: any = await createSingleCorrespondence(doc)

        console.log('-----created thread {' + Number(i+1) + '}------')

        replyOne.content.thread_id = thread.content.thread_id
        replyTwo.content.thread_id = thread.content.thread_id

        replyTwo.content.replay_on = replyOne.content._id
        replyOne.content.replay_on = thread.content._id

        await replyOne.save()
        await replyTwo.save()
    }
}


export const createNewDraftMessages = async () => {
    for (let i = 0; i < 5; i++) {
        const draft = await createSingleCorrespondence(doc)
        draft.content.draft = true
        await draft.save()
        console.log('-----created draft {' + Number(i+1) + '}------')
    }
}


export const createNewThreadsWithDraftedReplys = async () => {
    // create a single correspondence
    for (let i = 0; i < 5; i++) {
        const thread: any = await createSingleCorrespondence(doc)
        const replyOne: any = await createSingleCorrespondence(doc)
        const replyTwo: any = await createSingleCorrespondence(doc)

        console.log('-----created thread with drafted reply {' + Number(i+1) + '}------')

        replyOne.content.thread_id = thread.content.thread_id
        replyTwo.content.thread_id = thread.content.thread_id
        replyTwo.content.draft = true

        replyTwo.content.replay_on = replyOne.content._id
        replyOne.content.replay_on = thread.content._id

        await replyOne.save()
        await replyTwo.save()
    }
}


export const createNewDeletedMessages = async () => {
    for (let i = 0; i < 5; i++) {
        const trashDoc = await createSingleCorrespondence(doc)
        trashDoc.content.delete = true
        trashDoc.content.deleteTime = Date()
        await trashDoc.save()
        console.log('-----created trashed document {' + Number(i+1) + '}------')
    }
}


export const createNewTrashedThreads = async () => {
    // create a single correspondence
    for (let i = 0; i < 5; i++) {
        const thread: any = await createSingleCorrespondence(doc)
        const replyOne: any = await createSingleCorrespondence(doc)
        const replyTwo: any = await createSingleCorrespondence(doc)

        console.log('-----created trashed thread {' + Number(i+1) + '}------')

        replyOne.content.thread_id = thread.content.thread_id
        replyTwo.content.thread_id = thread.content.thread_id

        replyTwo.content.replay_on = replyOne.content._id
        replyOne.content.replay_on = thread.content._id

        thread.content.delete = true
        thread.content.starred = false
        thread.content.draft = false
        thread.content.deleteTime = Date()

        await replyOne.save()
        await replyTwo.save()
        await thread.save()
    }
}


export const createStarredMessages = async () => {
    for (let i = 0; i < 5; i++) {
        const starredDoc = await createSingleCorrespondence(doc)
        starredDoc.content.starred = true
        await starredDoc.save()
        console.log('-----Created Starred Document {' + Number(i+1) + '}------')
    }
}


export const createStarredThreads = async () => {
    // create a single correspondence
    for (let i = 0; i < 5; i++) {
        const thread: any = await createSingleCorrespondence(doc)
        const replyOne: any = await createSingleCorrespondence(doc)
        const replyTwo: any = await createSingleCorrespondence(doc)

        console.log('-----Created Starred Thread {' + Number(i+1) + '}------')

        replyOne.content.thread_id = thread.content.thread_id
        replyTwo.content.thread_id = thread.content.thread_id

        replyTwo.content.replay_on = replyOne.content._id
        replyOne.content.replay_on = thread.content._id

        thread.content.starred = true

        await replyOne.save()
        await replyTwo.save()
        await thread.save()
    }
}


export const createStarredDraftedMessages = async () => {
    for (let i = 0; i < 5; i++) {
        const starredDoc = await createSingleCorrespondence(doc)
        starredDoc.content.starred = true
        starredDoc.content.draft = true
        await starredDoc.save()
        console.log('-----Created Starred Drafted Document {' + Number(i+1) + '}------')
    }
}


export const createStarredDraftedThreads = async () => {
    for (let i = 0; i < 5; i++) {
        const thread: any = await createSingleCorrespondence(doc)
        const replyOne: any = await createSingleCorrespondence(doc)
        const replyTwo: any = await createSingleCorrespondence(doc)

        console.log('-----Created Starred Drafted Thread {' + Number(i+1) + '}------')

        replyOne.content.thread_id = thread.content.thread_id
        replyTwo.content.thread_id = thread.content.thread_id

        replyTwo.content.replay_on = replyOne.content._id
        replyOne.content.replay_on = thread.content._id

        thread.content.starred = true
        replyTwo.content.draft = true

        await replyOne.save()
        await replyTwo.save()
        await thread.save()
    }
}


// after the elasticsearch finishes syncing with mongo, seed the database
synchronizeCompletionEvent.once("syncDone", async () => { 

    console.log("------------Creating Single Correspondences----------------\n");
    await createNewThreads()
    console.log("\n------------Finished Single Correspondences----------------\n");

    console.log("------------Creating Threads with Replys-------------------\n");
    await createNewThreadsWithReplys()
    console.log("\n------------Finished Threads and Replays-------------------\n");

    console.log("-----------------Creating Draft messages---------------------\n");
    await createNewDraftMessages()
    console.log("\n--------------Finished Draft Messages---------------------\n");

    console.log("-----------------Creating Draft Threads---------------------\n");
    await createNewThreadsWithDraftedReplys()
    console.log("\n--------------Finished Draft Threads---------------------\n");

    console.log("-----------------Creating Trashed Messages---------------------\n");
    await createNewDeletedMessages()
    console.log("\n--------------Finished Trashed Messages---------------------\n");

    console.log("-----------------Creating Trashed Threads---------------------\n");
    await createNewTrashedThreads()
    console.log("\n--------------Finished Trashed Threads---------------------\n");

    console.log("-----------------Creating Starred Messages---------------------\n");
    await createStarredMessages()
    console.log("\n--------------Finished Starred Messages---------------------\n");

    console.log("-----------------Creating Starred Threads---------------------\n");
    await createStarredThreads()
    console.log("\n--------------Finished Starred Threads---------------------\n");

    console.log("-------------Creating Starred Drafted Messages----------------\n");
    await createStarredDraftedMessages()
    console.log("\n-----------Finished Starred Drafted Messages-----------------\n");

    console.log("---------------Creating Starred Drafted Threads---------------\n");
    await createStarredDraftedThreads()
    console.log("\n-----------Finished Starred Drafted Threads-----------------\n");

    // close the mongo connection
    await mongoose.connection.close() 
})






