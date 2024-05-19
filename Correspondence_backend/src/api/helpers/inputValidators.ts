import Joi from 'joi'


export const joiValidatorSchema = Joi.object({

    _id: Joi.string().allow(null),
    corr_no: Joi.string().required().messages({
        'string.required': '400.1',
        'string.empty': '400.1'
    }),
    corr_type: Joi.string().required().messages({
        'string.required': "400.2",
        'string.empty': "400.2"
    }),
    entity_no: Joi.string().required().messages({
        'string.empty': "400.3",
        'string.required': "400.3"
    }),
    from_entity: Joi.string().required().allow(null, ''),
    from_department: Joi.string().required().allow(null, ''),
    from_user: Joi.string().required().messages({
        'string.empty': "400.6",
        'string.required': "400.6"
    }),
    from_email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net', 'org'] } }).required().messages({
        'email.empty': "400.7",
        'email.required': "400.7"
    }),
    entity_address: Joi.string().required().messages({
        "string.empty": "400.8",
        'string.required': "400.8"
    }),
    to_entity: Joi.string().required().messages({
        'string.empty': "400.9",
        'string.required': "400.9"
    }),
    to_department: Joi.string().required().messages({
        'string.empty': "400.10",
        'string.required': "400.10"
    }),
    priority: Joi.string().required().messages({
        'string.required': "400.11",
        "string.empty": "400.11"
    }),
    classification: Joi.string().required().messages({
        'string.empty': "400.12",
        'string.required': "400.12"
    }),
    corr_subject: Joi.string().required().messages({
        'string.empty': "400.13",
        'string.required': "400.13"
    }),
    corr_body: Joi.string().required().messages({
        'string.empty': "400.14",
        'string.required': "400.14"
    }),
    cc_entity: Joi.array().items(Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net', 'org'] } })),
    sent_date: Joi.date(),
    received_date: Joi.date().allow(null),
    received_user: Joi.string(),
    await_reply: Joi.boolean(),
    message_status: Joi.string(),
    docs_IDs: Joi.array().items(Joi.string()),
    due_date: Joi.date(),
    starred: Joi.boolean(),
    draft: Joi.boolean(),
    delete: Joi.boolean(),
    thread_id: Joi.string(),
    send: Joi.boolean().allow(null)
})

