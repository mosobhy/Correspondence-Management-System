import { Client } from '@elastic/elasticsearch'
import dotenv from 'dotenv'

dotenv.config()


const esClient = new Client({
    node: `${process.env.LOCAL_ELASTICSEARCH}`
})

const body: any = {
    properties: {
        id : { type: "keyword" },
        name : { type: "text" },
        type : { type: "text" },
        parentId : { type: "keyword" },
        children : { type: "text"},
        path : { type: "text" },
        totalSize : { type: "text" },
        createdDate : { type: "date"},
        createdBy : { type: "text" },
        content: {
            properties: {
                Correspondence: {
                    properties: {
                        corr_no: { type: "keyword" },
                        corr_type: { type: "text"},
                        entity_no: { type: "keyword" },
                        from_entity:{ type: "text" }, 
                        from_department:{ type: "text" }, 
                        from_user:{ type: "text" }, 
                        from_email:{ type: "keyword" }, 
                        entity_address:{ type: "text" }, 
                        cc_entity:{ type: "text" }, 
                        to_entity:{ type: "text" }, 
                        to_department:{ type: "text" }, 
                        received_date:{ type: "date" }, 
                        received_user:{ type: "text" }, 
                        sent_date: { type: "date" },
                        priority: { type: "text" },
                        classification:{ type: "text" }, 
                        corr_subject:{ type: "text" }, 
                        corr_body: { type: "text" },
                        await_reply:{ type: "boolean" }, 
                        message_status:{ type: "text" }, 
                        docs_IDs:{ type: "text" }, 
                        due_date:{ type: "date" }, 
                        starred:{ type: "boolean" }, 
                        delete:{ type: "boolean" }, 
                        draft:{ type: "boolean" }, 
                    },
                }
                ,
                SystemContentType: {
                    properties: {
                        data: {
                            properties: {
                                VersionContentType: {
                                    properties: {
                                        data: {
                                            properties: {
                                                versionNumber:{ type: "text" }, 
                                                currentRenditionSize:{ type: "text" }, 
                                                currentVersionSize:{ type: "text" }, 
                                                extention:{ type: "text" }, 
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        CommonContentType: {
                            properties: {
                                data: {
                                    properties: {
                                        id:{ type: "keyword" }, 
                                        name:{ type: "text" }, 
                                        type:{ type: "text" }, 
                                        creationDate:{ type: "date" }, 
                                        creationBy: { type: "text" },
                                        modificationDate: { type: "date" },
                                        modificationBy: { type: "text" },
                                        currentSize:{ type: "text" }, 
                                        icon:{ type: "text" }, 
                                        contentTypeName: { type: "text" },
                                    }
                                }
                            }
                        }
                    }
                }        
            }
        },
        contentTypeId :{ type: "keyword" }, 
        allowedDocTypes :{ type: "text" }, 
        binaryData : { type: "text" },
        modifiedDate :{ type: "date" }, 
        modifiedBy :{ type: "text" }, 
        contentTypeGroupId :{ type: "keyword" }, 
        favouriteUsers :{ type: "text" }, 
        isCheckedOut : { type: "text" },
        checkedOutBy :{ type: "text" }, 
        checkedOutDate :{ type: "date" }, 

        ACP: {
            properties: {
                // these mappings to be changed to a nested schema not an array objects
                // refere to https://www.elastic.co/guide/en/elasticsearch/reference/current/array.html
                // TAKE A LOOK AT THE note IN THAT PAGE
                DACL : { type: "text" },
                IACL : { type: "text" },
                SHACL : { type: "text" }
            }
        },

        isBroke : { type: "boolean" },
        newPath :{ type: "text" }, 

        userInfo: {
            properties: {
                id :{ type: "keyword" }, 
                email :{ type: "keyword" }, 
                fullName :{ type: "text" }, 
                ImageUrl :{ type: "keyword" },
            } 
        },
        contentTypeInfo: {
            properties: {
                id :{ type: "keyword" }, 
                title :{ type: "text" }, 
                groupId :{ type: "keyword" }, 
                key : { type: "keyword" }
            }
        },

        assignedProcesses :{ type: "text" }, 
        fields :{ type: "text" }, 

    }
}

export const run = async () => {
    await esClient.indices.putMapping({
        index: `${process.env.INDEX_NAME}`,
        body: body
    })
    console.log("mappings are put successfully")
}

run()