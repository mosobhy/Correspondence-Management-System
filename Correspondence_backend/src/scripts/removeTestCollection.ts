const mongooseconnection = require("mongoose");
import dotenv from 'dotenv'

dotenv.config()

const testDBConnectionString = String(process.env.TEST_MONGODB_CONNECTION_STRING)
const collectionName = String(process.env.TEST_COLLECTION_NAME)

mongooseconnection.connect(testDBConnectionString, {
    useNewUrlParser: true
});

const connection = mongooseconnection.connection;
connection.once("open", function() {
    console.log("\n--------Deleting the testing collection----------\n");
    mongooseconnection.connection.db.dropCollection(
        collectionName+'s',
        function(err: any, result: any) {
            console.log("\tCollection has been destroyed successfully")
            mongooseconnection.connection.close()
            console.log("\n--------------Connection is closed----------------\n")
        }
    )
});
