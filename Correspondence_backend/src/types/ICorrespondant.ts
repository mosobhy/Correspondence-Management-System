import { wholeSystemSchema } from "../database/database.mongoose";
import { compile, compileFromFile } from 'json-schema-to-typescript'


export interface ICorrespondant {
    corr_no: String;
    corr_type: String;
    entry_no: String;
    from_entity: String;
    from_department: String;
    from_user: String;
    from_email: String;
    entity_address: String;
    cc_entity?: String[];
    to_entity: String;
    to_department: String;
    received_date?: Date;
    received_user?: String;
    sent_date: Date;
    priority: String;                // ['high', 'normal', 'low']
    classification: String;          // ['confidential', 'normal']
    corr_subject: String;
    corr_body: String;
    await_reply: Boolean;
    message_status: String;          // ['sent' defualt, 'recieved', 'seen', 'rejected']
    attached_docs_ids?: String[];
    due_date: Date;
    starred: Boolean;
    delete: Boolean;
    draft: Boolean;
    replay_ref: String;
}
