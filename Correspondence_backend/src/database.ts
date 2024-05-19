import * as mongoDB from 'mongodb'
import dotenv from 'dotenv'



// HAS NO REACH, (TO BE DELETED)



dotenv.config()

export const collections: { correspondants?: mongoDB.Collection } = {}


export const connectToDatabaseClient = async () => {

    try {
        const client: mongoDB.MongoClient = new mongoDB.MongoClient(String(process.env.DB_CONNECTION_STRING));
        
        await client.connect();
       
        const db: mongoDB.Db = client.db(String(process.env.DB_NAME));
        
        const correspondantsCollection: mongoDB.Collection = db.collection(String(process.env.COLLECTION_NAME));
        
        // add that collection to the global scope
        collections.correspondants = correspondantsCollection
    
        console.log(`Successfully connected to database: ${db.databaseName} and collection: ${correspondantsCollection.collectionName}`);

    } catch (err) {
        throw new Error("cannot connect to the database server")
    }
}

