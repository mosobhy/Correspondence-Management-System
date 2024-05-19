import { IDBCrud } from "../types/IDBCrud";
import { correspondants } from "../database/database.mongoose";
import { ObjectID } from 'mongodb';
import { ICorrespondant as Correspondant } from '../types/ICorrespondant'



// HAS NO REACH, (TO BE DELETED)



export class CorrespondantMongooseStore implements IDBCrud {

    async index() {
        try {
            // retrieve all the documents
            const data = await correspondants.find({ delete: false, draft: false }).lean() 
            // return them
            return data

        } catch (err) {
            throw new Error('cannot retrieve any document, ' + err)
        }
    }

    async findById(corr_id: any) {
        try {
            const idObj = new ObjectID(corr_id)
            const result = await correspondants.findOne({ _id : idObj })
            // console.dir(result)
            return result
        }
        catch (err) {
            throw new Error("An error occured while finding a correspondent" + err)
        }
    }


    async findByCorrNo(corr_no: String) {
        try {
            const result = await correspondants.findOne({corr_no: corr_no})
            // console.dir(result)
            return result
        }
        catch (err) {
            throw new Error("An error occured while finding a correspondent" + err)
        }
    }

    async getBetween(offset: number, limit: number) {
        try {
            const result = await correspondants.find({ delete: false, draft: false }).limit(limit).skip(offset).lean()
            // console.dir(result)
            return result
        }
        catch (err) {
            throw new Error("An error occured while finding a correspondent" + err)
        }
    }

    async addNewCorrespondant(new_corr_obj: any): Promise<Boolean> {
        try {
            console.log('from inside of insertion ya man')
            console.log(new_corr_obj)
            console.log("logging the id")
            console.log(new_corr_obj._id)
            let status = false
            if (new_corr_obj._id) {
                // update
                const idObj = new ObjectID(new_corr_obj._id)
                const result = await correspondants.replaceOne(
                    { _id: idObj }, {
                        corr_no: new_corr_obj.corr_no,
                        corr_type: new_corr_obj.corr_type,
                        entity_no: new_corr_obj.entity_no,
                        from_user: new_corr_obj.from_user,
                        cc_entity: new_corr_obj.cc_entity,
                        to_entity: new_corr_obj.to_entity,
                        to_department: new_corr_obj.to_department,
                        sent_date: new_corr_obj.sent_date,
                        classification: new_corr_obj.classification,
                        corr_subject: new_corr_obj.corr_subject,
                        corr_body: new_corr_obj.corr_body,
                        message_status: new_corr_obj.message_status,
                        docs_IDs: new_corr_obj.docs_IDs,
                        due_date: new_corr_obj.due_date,
                        starred: new_corr_obj.starred,
                        delete: new_corr_obj.delete,
                        draft: new_corr_obj.draft
                    }) 
                    console.log(result)
                    if (result) status = true;
            } else {
                // new
                const result = await correspondants.create(new_corr_obj)
                if (result) status = true
            }
            return status
        }
        catch (err) {
            throw new Error("An error occured while creating a correspondent" + err)
        }
    }


    async drafting(new_corr_obj: any): Promise<Boolean> {
        try {
            let status = false
            if (new_corr_obj._id) {
                const idObj = new ObjectID(new_corr_obj._id)
                const result = await correspondants.replaceOne(
                    { _id: idObj }, {
                        corr_no: new_corr_obj.corr_no,
                        corr_type: new_corr_obj.corr_type,
                        entity_no: new_corr_obj.entity_no,
                        from_user: new_corr_obj.from_user,
                        cc_entity: new_corr_obj.cc_entity,
                        to_entity: new_corr_obj.to_entity,
                        to_department: new_corr_obj.to_department,
                        sent_date: new_corr_obj.sent_date,
                        classification: new_corr_obj.classification,
                        corr_subject: new_corr_obj.corr_subject,
                        corr_body: new_corr_obj.corr_body,
                        message_status: new_corr_obj.message_status,
                        docs_IDs: new_corr_obj.docs_IDs,
                        due_date: new_corr_obj.due_date,
                        starred: new_corr_obj.starred,
                        delete: new_corr_obj.delete,
                        draft: new_corr_obj.draft
                    })                
                if (result) status = true;
                console.log(result)
            }
            else {
                const result = await correspondants.create(new_corr_obj)
                if (result) status = true
                console.log(result)
            }
            return status
        }

        catch (err) {
            throw new Error("An error occured while drafting the message " + err)
        }
    }


    async getDrafted() {
        try {
            const data = await correspondants.find({ draft: true, delete: false }).lean()
            return data;
        }
        catch(err) {
            throw new Error("An error occured while fetching drafted messages " + err)
        }
    }


    async updateDraft(updates: any) {
        try {
            const idObj = new ObjectID(updates._id)
            const result = await correspondants.replaceOne(
                { _id: idObj }, {
                    corr_no: updates.corr_no,
                    corr_type: updates.corr_type,
                    entity_no: updates.entity_no,
                    from_user: updates.from_user,
                    cc_entity: updates.cc_entity,
                    to_entity: updates.to_entity,
                    to_department: updates.to_department,
                    sent_date: updates.sent_date,
                    classification: updates.classification,
                    corr_subject: updates.corr_subject,
                    corr_body: updates.corr_body,
                    message_status: updates.message_status,
                    docs_IDs: updates.docs_IDs,
                    due_date: updates.due_date,
                    starred: updates.starred,
                    delete: false,
                    draft: true
                }
            )
            if (result) return true;
            else return false
        }
        catch(err) {
            throw new Error("cannot update that correspodence")
        }
    }


    async deleteCorrespondant(corr_no: String): Promise<Boolean> {
        try {
            const result = await correspondants.deleteOne({corr_no: corr_no})
            let status = false
            if (result) status = true
            return status
        }
        catch (err) {
            throw new Error("An error occured while deleting a correspondent" + err)
        }
    }

    async deleteMany(corrs_to_delete: []): Promise<Boolean> {
        try {
            let statuses = []
            for( let corr of corrs_to_delete) {
                let objID = new ObjectID(corr)
                let date = new Date()
                let result = await correspondants.updateOne(
                    {
                        _id: objID
                    }, {
                        $set: {
                            starred: false,
                            delete: true,
                            deleteTime: date
                        }
                    }
                )
            //    console.log(result)
                statuses.push(result)
            }
            let final_result = true;
            statuses.forEach( status => {
                if (!status)
                    final_result = false;
            })
            return final_result
        }
        catch(err) {
            throw new Error("An error occured while deleting bulk of corrspondants" + err)
        }
    }

    async untrash(corrs_to_untrash: []): Promise<Boolean> {
        try {
            let statuses = []
            for( let corr of corrs_to_untrash) {
                let objID = new ObjectID(corr)
                let result = await correspondants.updateOne(
                    {
                        _id: objID
                    }, {
                        $set: {
                            delete: false,
                        }
                    }
                )
            //    console.log(result)
                statuses.push(result)
            }
            let final_result = true;
            statuses.forEach( status => {
                if (!status)
                    final_result = false;
            })
            return final_result
        }
        catch(err) {
            throw new Error("An error occured while untrashing corrspondants" + err)
        }
    }

    async getTrashed() {
        try {
            const data = await correspondants.find({ delete: true }).lean()
            return data
        }
        catch(err) {
            throw new Error("An Error occured while fetching trashed items" + err)
        }
    }

    async deleteAllCorrespondants(): Promise<Boolean> {
        try {
            const result = await correspondants.deleteMany({})
            let status = false
            if (result) status = true
            return status;
        }
        catch( err ) {
            throw new Error("An error occured while deleting all documents in collection: " + err)
        }
    }

    async updateCorrespondant(corr_no: String, corr_updates: Object): Promise<Boolean> {
        try {
            let result = await correspondants.findOne({correspondence_no: corr_no})
            if (!result) return false

            let corr_cpy = Object.assign({}, result)

            Object.entries(result).map( item => {
                // corr_cpy[item[0]] = corr_updates[item[0]]
            })
            
            // delete the none updated document
            let updated = await correspondants.deleteOne({corresponde_no: corr_no})
            if (updated) return true;
            else return false
        }
        catch (err) {
            throw new Error("An error occured while deleting a correspondent" + err)
        }
    }

    async filterCorrespondents(query: String) {
        try {
            let result = await correspondants.find( { $text: { $search: `${query}` } } ).lean()
            return result
        }
        catch(err) {
            throw new Error("An error occured while filtering database: " + err)
        }
    }

    async starCorrespondent(corr_no: String, update: Boolean) {
        try {
            let result = await correspondants.updateOne({
                    corr_no: corr_no
                },
                {
                    $set: {
                        starred: update 
                    }
                }
            )
            if (result) return true;
            else return false;
        }
        catch(err) {
            throw new Error("Cannot Star that correspondent due to: " + err)
        }
    }

    async filterStarred() {
        try {
            let result = await correspondants.find({ starred: true }).lean()
            return result
        }
        catch(err) {
            throw new Error("Cannot retrieve starred messages due to: " + err)
        }
    }
}