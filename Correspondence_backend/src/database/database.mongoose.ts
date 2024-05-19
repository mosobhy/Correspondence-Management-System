import EventEmitter from 'events'
import fs from 'fs'
import mongoose from 'mongoose'
import { mongoosastic } from 'mongoosastic-ts'
import { Client } from '@elastic/elasticsearch'
import dotenv from 'dotenv'
import { ISchemaDoc } from '../types/ISchemaDoc'
import { IReplaySchema } from '../types/IReplaySchema'
import { MongoosasticPluginOpts } from 'mongoosastic-ts/dist/types'
import isodate from 'isodate'

dotenv.config()

const serverMode = String(process.env.ENV)
let dbConnectionString = (serverMode !== 'test' ? String(process.env.PROD_MONGODB_CONNECTION_STRING) : String(process.env.TEST_MONGODB_CONNECTION_STRING));
let collectionName = (serverMode !== 'test' ? String(process.env.PROD_COLLECTION_NAME) : String(process.env.TEST_COLLECTION_NAME));


mongoose.connect(dbConnectionString)


export const wholeSystemSchema: any = new mongoose.Schema<ISchemaDoc>({
    name : { type: String, es_indexed: true, default: 'default val' },
    type : { type: String, es_indexed: true , default: 'default val'},
    parentId : { type: String, es_indexed: true , default: 'default val', es_type: "keyword" },
    children : { type: Array<String>, es_indexed: true , default: ['default val'] },  
    path : { type: String, es_indexed: true , default: 'default val'},
    totalSize : { type: Number, es_indexed: true, default: 1 },
    createdDate : { type: Date, es_indexed: true, default: isodate("2022-08-30T16:11:39.810Z") }, 
    createdBy : { type: String, es_indexed: true , default: 'default val'},
    content: {

        thread_id: { type: String, default: null, es_indexed: true, es_type: "keyword" },
        corr_no: { type: String, es_indexed: true , es_type: "keyword"},
        corr_type: { type: String, es_indexed: true },
        entity_no: { type: String, es_indexed: true },
        from_entity: { type: String, es_indexed: true },
        from_department: { type: String, es_indexed: true },
        from_user: { type: String, es_indexed: true },
        from_email: { type: String, es_indexed: true },
        entity_address: { type: String, es_indexed: true },
        cc_entity: { type: Array<any>, es_indexed: true, default: ['default val'] },
        to_entity: { type: String, es_indexed: true },
        to_department: { type: String, es_indexed: true },
        received_date: { type: Date, es_indexed: true , default: isodate("2022-08-30T16:11:39.810Z")},
        received_user: { type: String, es_indexed: true },
        sent_date: { type: Date, es_indexed: true , default: isodate("2022-08-30T16:11:39.810Z")},
        priority: { type: String, default: 'low', es_indexed: true },
        classification: { type: String, default: 'normal', es_indexed: true },
        corr_subject: { type: String, es_indexed: true },
        corr_body: { type: String, es_indexed: true },
        await_reply: { type: Boolean, es_indexed: true, default: false },
        message_status: { type: String, default: 'sent' },
        docs_IDs: { type: Array<any>, es_indexed: true, default: ['default val'] },
        due_date: { type: Date, es_indexed: true , default: isodate("2022-08-30T16:11:39.810Z")},
        starred: { type: Boolean, default: false, es_indexed: true },
        delete: { type: Boolean, default: false, es_indexed: true },
        draft: { type: Boolean, default: false, es_indexed: true },
        replay_on: { type: String, default: null, es_indexed: true },
        isThreadStarred: { type: Boolean, default: false, es_indexed: true },
        isThreadDrafted: { type: Boolean, default: false, es_indexed: true },
        // deletedDate: { type: Date, default: '', es_indexed: true },
        // draftedDate: { type: Date, default: '', es_indexed: true }

        SystemContentType: {
            data: {
                VersionContentType: {
                    data: {
                        versionNumber: { type: Number, es_indexed: true, default: 1 },
                        currentRenditionSize: { type: Number, es_indexed: true, default: 1 },
                        currentVersionSize: { type: Number, es_indexed: true , default: 1},
                        extention: { type: String, es_indexed: true , default: 'default val'}
                    }
                },
                CommonContentType: {
                    data: {
                        id: { type: String, es_indexed: true , default: 'default val', es_type: "keyword"},
                        name: { type: String, es_indexed: true , default: 'default val'},
                        type: { type: String, es_indexed: true , default: 'default val'},
                        creationDate: { type: Date, es_indexed: true, default: isodate("2022-08-30T16:11:39.810Z") },
                        creationBy: { type: String, es_indexed: true , default: 'default val'},
                        modificationDate: { type: Date, es_indexed: true, default: isodate("2022-08-30T16:11:39.810Z") },
                        modificationBy: { type: String, es_indexed: true , default: 'default val'},
                        currentSize: { type: Number, es_indexed: true , default: 1},
                        icon: { type: String, es_indexed: true , default: 'default val'},
                        contentTypeName: { type: String, es_indexed: true , default: 'default val'}
                    }
                }
            }
        }        
    },

    contentTypeId : { type: String, es_indexed: true , default: 'default val', es_type: "keyword" },
    allowedDocTypes : { type: Array<String>, es_indexed: true , default: ['default val']},
    binaryData : { type: String, es_indexed: true , default: 'default val'},
    modifiedDate : { type: Date, es_indexed: true , default: isodate("2022-08-30T16:11:39.810Z")},
    modifiedBy : { type: String, es_indexed: true , default: 'default val'},
    contentTypeGroupId : { type: String, es_indexed: true , default: 'default val', es_type: "keyword" },
    favouriteUsers : { type: Array<String>, es_indexed: true , default: ['default val']},
    isCheckedOut :  { type: Boolean, es_indexed: true ,defualt: false },
    checkedOutBy : { type: String, es_indexed: true , default: 'default val'},
    checkedOutDate : { type: Date, es_indexed: true , default: isodate("2022-08-30T16:11:39.810Z")},

    ACP: {
        DACL : { type: Array<any>, es_indexed: true },
        IACL : { type: Array<any>, es_indexed: true },
        SHACL : { type: Array<any>, es_indexed: true }
    },

    isBroke : { type: Boolean, es_indexed: true, default: false },
    newPath : { type: String, es_indexed: true, default: 'default val'},

    userInfo: {
        id : { type: String, es_indexed: true , default: 'default val', es_type: "keyword" },
        email : { type: String, es_indexed: true , default: 'default val', es_type: "keyword" },
        fullName : { type: String, es_indexed: true , default: 'default val'},
        ImageUrl : { type: String, es_indexed: true , default: 'default val'}
    },
    contentTypeInfo: {
        id : { type: String, es_indexed: true , default: 'default val', es_type: "keyword" },
        title : { type: String, es_indexed: true , default: 'default val'},
        groupId : { type: String, es_indexed: true , default: 'default val', es_type: "keyword" },
        key : { type: String, es_indexed: true, default: 'default val', es_type: "keyword" }
    },

    assignedProcesses : { type: Array<String>, es_indexed: true , default: ['default val']},
    fields : { type: Array<String>, es_indexed: true, default: ['default val'] }
})


export const esClient = new Client({
    node: `https://localhost:9200/`,
    auth: {
        username: `elastic`,
        password: `GuG+9IbeDNuoeXUc-yr*`
    },
    tls: {
        ca: fs.readFileSync('/home/mosobhy/Desktop/test/back/http_ca.crt'),
        rejectUnauthorized: false
    }
})


console.log('before plugin to mongoosastic')

wholeSystemSchema.plugin(mongoosastic, {
    hosts: [
        `${process.env.LOCAL_ELASTICSEARCH}`
    ],
    hydrate:true, 
    hydrateOptions: { lean: true } 
} as MongoosasticPluginOpts )


console.log('after plugin to mongoosastic')


// create a database collectoin (anology to a table)
export const correspondants: any = mongoose.model(collectionName, wholeSystemSchema)

// sync correspondences
export const synchronizeCompletionEvent = new EventEmitter()
let stream = correspondants.synchronize();
let count = 0;

stream.on('data', (err: any, doc: any) => {
  count++;
});

stream.on('close', () => {
  console.log('indexed ' + count + ' documents!');
  // to be uncommnted
  synchronizeCompletionEvent.emit('syncDone')
});

stream.on('error', (err: any) => {
    console.log('inside of the mongoosasitc err')
  console.log(err);
});
