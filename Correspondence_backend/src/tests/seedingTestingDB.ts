import { v4 as uuidv4 } from 'uuid';


const createSingleCorrespondence = async (doc: any, DBModel: any) => {
    const newDoc =  await new DBModel()
    newDoc.content._id = newDoc._id

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
    newDoc.content.received_date = new Date()
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


export const createNewThreads = async (doc: any, model: any) => {
    for (let i = 0; i < 5; i++) {
        await createSingleCorrespondence(doc, model)
    }
}


export const createNewThreadsWithReplys = async (doc: any, model: any) => {
    // create a single correspondence
    for (let i = 0; i < 5; i++) {
        const thread: any = await createSingleCorrespondence(doc, model)
        const replyOne: any = await createSingleCorrespondence(doc, model)
        const replyTwo: any = await createSingleCorrespondence(doc, model)

        replyOne.content.thread_id = thread.content.thread_id
        replyTwo.content.thread_id = thread.content.thread_id

        replyTwo.content.replay_on = replyOne.content._id
        replyOne.content.replay_on = thread.content._id

        await thread.save()
        await replyOne.save()
        await replyTwo.save()
    }
}


export const createNewDraftMessages = async (doc: any, model: any) => {
    for (let i = 0; i < 5; i++) {
        const draft = await createSingleCorrespondence(doc, model)
        draft.content.draft = true
        await draft.save()
    }
}


export const createNewThreadsWithDraftedReplys = async (doc: any, model: any) => {
    // create a single correspondence
    for (let i = 0; i < 5; i++) {
        const thread: any = await createSingleCorrespondence(doc, model)
        const replyOne: any = await createSingleCorrespondence(doc, model)
        const replyTwo: any = await createSingleCorrespondence(doc, model)

        replyOne.content.thread_id = thread.content.thread_id
        replyTwo.content.thread_id = thread.content.thread_id
        replyTwo.content.draft = true

        replyTwo.content.replay_on = replyOne.content._id
        replyOne.content.replay_on = thread.content._id

        await replyOne.save()
        await replyTwo.save()
    }
}


export const createNewDeletedMessages = async (doc: any, model: any) => {
    for (let i = 0; i < 5; i++) {
        const trashDoc = await createSingleCorrespondence(doc, model)
        trashDoc.content.delete = true
        trashDoc.content.deleteTime = Date()
        await trashDoc.save()
    }
}


export const createNewTrashedThreads = async (doc: any, model: any) => {
    // create a single correspondence
    for (let i = 0; i < 5; i++) {
        const thread: any = await createSingleCorrespondence(doc, model)
        const replyOne: any = await createSingleCorrespondence(doc, model)
        const replyTwo: any = await createSingleCorrespondence(doc, model)

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


export const createStarredMessages = async (doc: any, model: any) => {
    for (let i = 0; i < 5; i++) {
        const starredDoc = await createSingleCorrespondence(doc, model)
        starredDoc.content.starred = true
        await starredDoc.save()
    }
}


export const createStarredThreads = async (doc: any, model: any) => {
    // create a single correspondence
    for (let i = 0; i < 5; i++) {
        const thread: any = await createSingleCorrespondence(doc, model)
        const replyOne: any = await createSingleCorrespondence(doc, model)
        const replyTwo: any = await createSingleCorrespondence(doc, model)

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


export const createStarredDraftedMessages = async (doc: any, model: any) => {
    for (let i = 0; i < 5; i++) {
        const starredDoc = await createSingleCorrespondence(doc, model)
        starredDoc.content.starred = true
        starredDoc.content.draft = true
        await starredDoc.save()
    }
}


export const createStarredDraftedThreads = async (doc: any, model: any) => {
    for (let i = 0; i < 5; i++) {
        const thread: any = await createSingleCorrespondence(doc, model)
        const replyOne: any = await createSingleCorrespondence(doc, model)
        const replyTwo: any = await createSingleCorrespondence(doc, model)

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

