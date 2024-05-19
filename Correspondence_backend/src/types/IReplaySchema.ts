import { MongoosasticDocument } from 'mongoosastic-ts/dist/types';
import { Document } from 'mongoose'


export interface IReplaySchema extends Document, MongoosasticDocument {
    corr_no: String;
    corr_type: String;
    entity_no: String;
    from_entity: String;
    from_department: String;
    from_user: String;
    from_email: String;
    entity_address: String;
    cc_entity: { type: Array<String>, es_indexed: true },
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
    docs_IDs: { type: Array<String>, es_indexed: true },
    due_date: Date;
}