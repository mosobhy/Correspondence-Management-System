import { ObjectID } from 'mongodb';
import { connectToDatabaseClient, collections } from '../database';
import { correspondants } from '../database/database.mongoose';
import { IDBCrud } from '../types/IDBCrud';
import { ICorrespondant as Correspondant } from '../types/ICorrespondant'


// HAS NO REACH, (TO BE DELETED)


export class CorrespondantStore implements IDBCrud {

    async index() {
        try {
            // connect to the database
            await connectToDatabaseClient()
            // retrieve all the documents
            const data = await collections.correspondants?.find({ delete: false }).toArray() 
            // return them
            return data

        } catch (err) {
            throw new Error('cannot retrieve any document, ' + err)
        }
    }

    async findByCorrNo(corr_no: String) {
        try {
            await connectToDatabaseClient()
            const result = await collections.correspondants?.findOne({corr_no: corr_no})
            console.dir(result)
            return result
        }
        catch (err) {
            throw new Error("An error occured while finding a correspondent" + err)
        }
    }

    async getBetween(offset: number, limit: number) {
        try {
            await connectToDatabaseClient()
            const result = await collections.correspondants?.find({ delete: false }).limit(limit).skip(offset).toArray()
            console.dir(result)
            return result
        }
        catch (err) {
            throw new Error("An error occured while finding a correspondent" + err)
        }
    }

    async addNewCorrespondant(new_corr_obj: Correspondant): Promise<Boolean> {
        try {
            await connectToDatabaseClient()
            const result = await collections.correspondants?.insertOne(new_corr_obj)
            console.dir(result)
            let status = false
            if (result) status = true
            return status
        }
        catch (err) {
            throw new Error("An error occured while creating a correspondent" + err)
        }
    }

    async deleteCorrespondant(corr_no: String): Promise<Boolean> {
        try {
            await connectToDatabaseClient()
            const result = await collections.correspondants?.deleteOne({corr_no: corr_no})
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
            await connectToDatabaseClient();
            let statuses = []
            for( let corr of corrs_to_delete) {
                let objID = new ObjectID(corr)
                let date = new Date()
                let result = await collections.correspondants?.updateOne(
                    {
                        _id: objID
                    }, {
                        $set: {
                            delete: true,
                            deleteTime: date
                        }
                    }
                )
               console.log(result)
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
            await connectToDatabaseClient();
            let statuses = []
            for( let corr of corrs_to_untrash) {
                let objID = new ObjectID(corr)
                let result = await collections.correspondants?.updateOne(
                    {
                        _id: objID
                    }, {
                        $set: {
                            delete: false,
                        }
                    }
                )
               console.log(result)
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
            await connectToDatabaseClient()
            const data = await collections.correspondants?.find({ delete: true }).toArray()
            return data
        }
        catch(err) {
            throw new Error("An Error occured while fetching trashed items" + err)
        }
    }

    async deleteAllCorrespondants(): Promise<Boolean> {
        try {
            await connectToDatabaseClient()
            const result = await collections.correspondants?.deleteMany({})
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
            await connectToDatabaseClient()
            let result = await collections.correspondants?.findOne({correspondence_no: corr_no})
            if (!result) return false

            let corr_cpy = Object.assign({}, result)

            Object.entries(result).map( item => {
                // corr_cpy[item[0]] = corr_updates[item[0]]
            })
            
            // delete the none updated document
            let updated = await collections.correspondants?.deleteOne({corresponde_no: corr_no})
            if (updated) return true;
            else return false
        }
        catch (err) {
            throw new Error("An error occured while deleting a correspondent" + err)
        }
    }

    async filterCorrespondents(query: String) {
        try {
            await connectToDatabaseClient();
            let result = await collections.correspondants?.find( { $text: { $search: `${query}` } } ).toArray()
            return result
        }
        catch(err) {
            throw new Error("An error occured while filtering database: " + err)
        }
    }

    async starCorrespondent(corr_no: String, update: Boolean) {
        try {
            await connectToDatabaseClient();
            let result = await collections.correspondants?.updateOne({
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
            await connectToDatabaseClient()
            let result = await collections.correspondants?.find({ starred: true }).toArray()
            return result
        }
        catch(err) {
            throw new Error("Cannot retrieve starred messages due to: " + err)
        }
    }
}