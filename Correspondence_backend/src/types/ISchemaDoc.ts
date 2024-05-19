import { MongoosasticDocument } from 'mongoosastic-ts/dist/types';
import { Document } from 'mongoose'




export interface ISchemaDoc extends Document, MongoosasticDocument { 
    name : String;
    type : String;
    parentId : String;
    children : { type: Array<String>, es_indexed: true };
    path : String;
    totalSize : Number;
    createdDate : Date; 
    createdBy : String;
    content: {
        thread_id: { type: String, es_indexed: true };
        corr_no: String;
        corr_type: String;
        entity_no: String;
        from_entity: String;
        from_department: String;
        from_user: String;
        from_email: String;
        entity_address: String;
        cc_entity: Array<any>;
        to_entity: String;
        to_department: String;
        received_date: Date;
        received_user: String;
        sent_date: String;
        priority: String;
        classification: String;
        corr_subject: String;
        corr_body: String;
        await_reply: Boolean;
        message_status: String;
        docs_IDs: Array<any>;
        due_date: Date;
        starred: Boolean;
        delete: Boolean;
        draft: Boolean;
        replay_on: { type: String, es_indexed: true },

        SystemContentType: {
            data: {
                VersionContentType: {
                    data: {
                        versionNumber: Number;
                        currentRenditionSize: Number;
                        currentVersionSize: Number;
                        extention: String;
                    }
                }, 
                CommonContentType: {
                    data: {
                        id: String;
                        name: String;
                        type: String;
                        creationDate: Date;
                        creationBy: String;
                        modificationDate: Date;
                        modificationBy: String;
                        currentSize: Number;
                        icon: String;
                        contentTypeName: String; 
                    }
                }
            }
        }        
    },


    contentTypeId : String;
    allowedDocTypes : { type: Array<String>, es_indexed: true };
    binaryData : String;
    modifiedDate : Date;
    modifiedBy : String;
    contentTypeGroupId : String;
    favouriteUsers : { type: Array<String>, es_indexed: true },
    isCheckedOut : Boolean; 
    checkedOutBy : String;
    checkedOutDate : Date;

    ACP: {
        DACL : { type: Array<any> },
        IACL : { type: Array<any> },
        SHACL : { type: Array<any> }
    },

    isBroke : Boolean;
    newPath : String;

    userInfo: {
        id : String;
        email : String;
        fullName : String;
        ImageUrl : String;
    },
    contentTypeInfo: {
        id : String;
        title : String;
        groupId : String;
        key : String;
    },

    assignedProcesses : { type: Array<String>, es_indexed: true };
    fields : { type: Array<String>, es_indexed: true };

}



