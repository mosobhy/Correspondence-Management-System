
export const aggregationQueries: any = {
    inbox: [
        {
            $group:{
                _id: "$content.thread_id",
                Correspondence: { $push: "$$ROOT" },
                count: { $sum: 1 }, 
                isThreadStarred: { $max: "$content.starred" },
                isThreadDeleted: { $max: "$content.delete" },
                isThreadDrafted: { $max: "$content.draft" },
            },
        },
        {
            $match: {
                $and: [
                    { isThreadDeleted: false },
                ]
            }
        },
        {
            $match: {
                $or: [
                    {
                        $and: [
                            { isThreadDrafted: false },
                            { count: { $gte: 1 }}
                        ]
                    },
                    {
                        $and: [
                            { isThreadDrafted: true },
                            { count: { $gt: 1 }}
                        ]
                    }
                ] 
            }
        },
        {
            $sort: { "Correspondence.content.sent_date" : -1 }
        }
    ],
    starred: [
        {
            $group: {
                _id: "$content.thread_id",
                Correspondence: { $push: "$$ROOT" },
                isStarred: { $max: "$content.starred" },
                isTrashed: { $max: "$content.delete" }
            }
        },
        {
            $match: {
                $and: [
                    { isStarred : true },
                    { isTrashed: false },
                ]
            }
        },
        {
            $sort: { "Correspondence.content.sent_date": -1 }
        }
    ],
    trash: [
        {
            $match: {
                $and: [
                    { "content.delete": true }
                ]
            }
        },
        {
            $group: {
                _id: "$content.thread_id",
                Correspondence: { $push: "$$ROOT" },
                isTrashed : { $max: "$content.delete" },
            }
        },
        {
            $match: {
                $and: [
                    { isTrashed: true }
                ]
            }
        },
        {
            $sort: { "Correspondence.content.sent_date": -1 }
        }
    ],
    draft: [
        {
            $group:{
                _id: "$content.thread_id",
                Correspondence: { $push: "$$ROOT" },
                count: { $sum: 1 },
                isThreadDeleted: { $max: "$content.delete" },
                isThreadDrafted: { $max: "$content.draft" }
            },
        },
        {
            $match: {
                $and: [
                    { isThreadDeleted: false },
                    { isThreadDrafted: true }
                ]
            }
        },
        {
            $sort: { "Correspondence.content.sent_date" : -1 }
        }
    ],
    sent: [
        // {
        //     $match: {
        //         $and: [
        //             // { "content.message_status": "sent" }
        //         ]
        //     }
        // },
        {
            $group: {
                _id: "$content.thread_id",
                Correspondence: { $push: "$$ROOT" },
                isTrashed: { $max: "$content.delete" },
                isDrafted: { $max: "$content.draft" }
            }
        },
        {
            $match: {
                $and: [
                    { isDrafted: false },
                    { isTrashed: false }
                ]
            }
        },
        {
            $sort: { "Correspondence.content.sent_date": -1 }
        }
    ]
}