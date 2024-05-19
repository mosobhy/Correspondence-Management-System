import { ISchemaDoc } from "../../types/ISchemaDoc";


// this function accepts an array of objects of type ISchemaDoc and
// extracts user related data
export function extractUserRelatedData( response: Array<ISchemaDoc> ) {
    try {
        let results = []
        for (let object of response) {
            if(object) {
                let tempObj: any = {}
                tempObj._id = object._id
                for (let entry of Object.entries(object.content)) {
                    if (entry[0] !== 'SystemContentType') {
                        tempObj[entry[0]] = entry[1]
                    }
                }
                results.push(tempObj)
            }
        }
        return results
    }
    catch (err) {
        console.log(err)
        throw err
    }
}

export function extractUserRelatedThreads(response: any) {
    try {
        let results = []
        for (let item of response) {
            const tempArrObj = extractUserRelatedData( item.Correspondence )
            for (let corrObj of tempArrObj) {
                corrObj.isThreadStarred = item.isThreadStarred
                corrObj.isThreadDrafted = item.isThreadDrafted
            }
            results.push(tempArrObj)
        }
        return results
    }
    catch (err) {
        console.log(err)
        throw err
    }
}


// accepts an array of objects
export function getThreadsEdges(response: any) {
    try {
        const results = []
        for (let items_arr of response) {
            if (items_arr.length === 1) {
                const threadEdge = items_arr[0]
                threadEdge.threadReadStatus = items_arr[items_arr.length-1].message_status
                results.push( items_arr[0] )
            } else {
                // add a field to indicate that its a thread edge, so I can add the 'open conversation'
                const threadEdge = items_arr[items_arr.length-1]
                threadEdge.isThread = true
                threadEdge.threadReadStatus = threadEdge.isThreadDrafted ? items_arr[items_arr.length-2].message_status : items_arr[items_arr.length-1].message_status
                results.push( items_arr[items_arr.length-1] )
            }
        }
        return results
    }
    catch (err) {
        console.log(err)
        throw err
    }
}