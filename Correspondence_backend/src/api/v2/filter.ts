import express, { Request, Response } from 'express'
import { correspondants } from '../../database/database.mongoose'
import dotenv from 'dotenv'
import { extractUserRelatedThreads, getThreadsEdges } from '../helpers/object.helpers'
import { filterForDraft, filterForInbox, filterForStarred, filterForTrash } from '../helpers/elasticQueries'

dotenv.config()


const filter = express.Router()


filter.get("/filterForInbox", async (req: Request, res: Response) => {
  try {
    const filterText = String(req.query.keyword) || null
    const page = Number(req.query.page)          || null
    const limit = Number(req.query.limit)        || null

    if (!filterText || !page || !limit) {
      return res.json({
        message: "you should pass the keyword for search and the page and limit params",
        status: 400
      })
      .status(400)
    }

    if (typeof page !== 'number' || typeof limit !== 'number') {
      return res.json({
        message: "page and limit params must be of type numbers",
        status: 400
      })
      .status(400)
    }

    const elasticResponse: any = await filterForInbox(filterText, page, limit)

    let inboxFilterThreadIDs: any = []
    elasticResponse.hits.hits.forEach( (item: any) => {
      inboxFilterThreadIDs.push(item['fields']['content.thread_id.keyword'][0])
    })

    const threads = await correspondants.aggregate([
      {
        $match: {
          "content.thread_id": {
            $in: inboxFilterThreadIDs
          }
        }
      },
      {
        $group: {
          _id: "$content.thread_id",
          Correspondence: { $push: "$$ROOT" },
          count: { $sum: 1 },
          isThreadStarred: { $max: "$content.starred" },
          isThreadDrafted: { $max: "$content.draft" }
        }
      },
      {
        $sort: { "Correspondence.content.sent_date": -1 }
      }
    ])

    const results = getThreadsEdges(extractUserRelatedThreads(threads))
    if (results) {
      res.json(results)
      .status(200)
    } else {
      res.json({
          message: "cannot fetch inbox data",
          status: 400
      })
      .status(400)
    }
  }
  catch (err) {
    console.log(err)
    res.json({
      message: "cannot filter due to internal err",
      status: 500
    })
    .status(500)
  }
})



filter.get("/filterForStarred", async (req: Request, res: Response) => {
    try {
      const filterText = String(req.query.keyword) || null
      const page = Number(req.query.page)          || null
      const limit = Number(req.query.limit)        || null

      if (!filterText || !page || !limit) {
        return res.json({
          message: "you should pass the keyword for search and the page and limit params",
          status: 400
        })
        .status(400)
      }

      if (typeof page !== 'number' || typeof limit !== 'number') {
        return res.json({
          message: "page and limit params must be of type numbers",
          status: 400
        })
        .status(400)
      }

      const elasticResponse: any = await filterForStarred(filterText, page, limit)

      let starredFilterThreadIDs: any = []
      elasticResponse.hits.hits.forEach( (item: any) => {
        starredFilterThreadIDs.push(item['fields']['content.thread_id.keyword'][0])
      })

      const threads = await correspondants.aggregate([
        {
          $match: {
            "content.thread_id": {
              $in: starredFilterThreadIDs
            }
          }
        },
        {
          $group: {
            _id: "$content.thread_id",
            Correspondence: { $push: "$$ROOT" },
            count: { $sum: 1 },
            isThreadStarred: { $max: "$content.starred" },
            isThreadDrafted: { $max: "$content.draft" }
          }
        },
        {
          $sort: { "Correspondence.content.sent_date": -1 }
        }
      ])

      const results = getThreadsEdges(extractUserRelatedThreads(threads))
      if (results) {
        res.json(results)
        .status(200)
      } else {
        res.json({
          message: "cannot fetch starred data",
          status: 400
        })
        .status(400)
      }
    }
    catch (err) {
        console.log(err)
        res.json({
            message: "cannot filter due to internal err",
            status: 500
        })
        .status(500)
    }
})



filter.get("/filterForDraft", async (req: Request, res: Response) => {
  try {
    const filterText = String(req.query.keyword) || null
    const page = Number(req.query.page)          || null
    const limit = Number(req.query.limit)        || null

    if (!filterText || !page || !limit) {
      return res.json({
        message: "you should pass the keyword for search and the page and limit params",
        status: 400
      })
      .status(400)
    }

    if (typeof page !== 'number' || typeof limit !== 'number') {
      return res.json({
        message: "page and limit params must be of type numbers",
        status: 400
      })
      .status(400)
    }

    const elasticResponse: any = await filterForDraft(filterText, page, limit)

    let draftFilterThreadIDs: any = []
    elasticResponse.hits.hits.forEach( (item: any) => {
      draftFilterThreadIDs.push(item['fields']['content.thread_id.keyword'][0])
    })

    const threads = await correspondants.aggregate([
      {
        $match: {
          "content.thread_id": {
            $in: draftFilterThreadIDs
          }
        }
      },
      {
        $group: {
          _id: "$content.thread_id",
          Correspondence: { $push: "$$ROOT" },
          count: { $sum: 1 },
          isThreadStarred: { $max: "$content.starred" },
          isThreadDrafted: { $max: "$content.draft" }
        }
      },
      {
        $sort: { "Correspondence.content.sent_date": -1 }
      }
    ])

    const results = getThreadsEdges(extractUserRelatedThreads(threads))
    if (results) {
      res.json(results)
      .status(200)
    } else {
      res.json({
          message: "cannot fetch draft data",
          status: 400
      })
      .status(400)
    }
  }
  catch (err) {
      console.log(err)
      res.json({
          message: "cannot filter due to internal err",
          status: 500
      })
      .status(500)
  }
})



filter.get("/filterForTrash", async (req: Request, res: Response) => {
  try {
    const filterText = String(req.query.keyword) || null
    const page = Number(req.query.page)          || null
    const limit = Number(req.query.limit)        || null

    if (!filterText || !page || !limit) {
      return res.json({
        message: "you should pass the keyword for search and the page and limit params",
        status: 400
      })
      .status(400)
    }

    if (typeof page !== 'number' || typeof limit !== 'number') {
      return res.json({
        message: "page and limit params must be of type numbers",
        status: 400
      })
      .status(400)
    }

    const elasticResponse: any = await filterForTrash(filterText, page, limit)

    let trashFilterThreadIDs: any = []
    elasticResponse.hits.hits.forEach( (item: any) => {
      trashFilterThreadIDs.push(item['fields']['content.thread_id.keyword'][0])
    })

    const threads = await correspondants.aggregate([
      {
        $match: {
          "content.thread_id": {
            $in: trashFilterThreadIDs
          }
        }
      },
      {
        $group: {
          _id: "$content.thread_id",
          Correspondence: { $push: "$$ROOT" },
          count: { $sum: 1 },
          isThreadStarred: { $max: "$content.starred" },
          isThreadDrafted: { $max: "$content.draft" }
        }
      },
      {
        $sort: { "Correspondence.content.sent_date": -1 }
      }
    ])

    const results = getThreadsEdges(extractUserRelatedThreads(threads))
    if (results) {
      res.json(results)
      .status(200)
    } else {
      res.json({
        message: "cannot fetch trash data",
        status: 400
      })
      .status(400)
    }
  }
  catch (err) {
      console.log(err)
      res.json({
        message: "cannot filter due to internal err",
        status: 500
      })
      .status(500)
  }
})


// to be modified on the sent component
filter.get("/filterForSent", async (req: Request, res: Response) => {
  try {
    const filterText = String(req.query.keyword) || null
    const page = Number(req.query.page)          || null
    const limit = Number(req.query.limit)        || null

    if (!filterText || !page || !limit) {
      return res.json({
        message: "you should pass the keyword for search and the page and limit params",
        status: 400
      })
      .status(400)
    }

    if (typeof page !== 'number' || typeof limit !== 'number') {
      return res.json({
        message: "page and limit params must be of type numbers",
        status: 400
      })
      .status(400)
    }

    const elasticResponse: any = await filterForInbox(filterText, page, limit)

    let inboxFilterThreadIDs: Array<String> = []
    elasticResponse.hits.hits.forEach( (item: any) => {
      inboxFilterThreadIDs.push(item['fields']['content.thread_id.keyword'][0])
    })

    const threads = await correspondants.aggregate([
      {
        $match: {
          "content.thread_id": {
            $in: inboxFilterThreadIDs
          }
        }
      },
      {
        $group: {
          _id: "$content.thread_id",
          Correspondence: { $push: "$$ROOT" },
          count: { $sum: 1 },
          isThreadStarred: { $max: "$content.starred" },
          isThreadDrafted: { $max: "$content.draft" }
        }
      },
      {
        $sort: { "Correspondence.content.sent_date": -1 }
      }
    ])

    const results = getThreadsEdges(extractUserRelatedThreads(threads))
    if (results) {
      res.json(results)
      .status(200)
    } else {
      res.json({
        message: "cannot fetch inbox data",
        status: 400
      })
      .status(400)
    }
  }
  catch (err) {
    console.log(err)
    res.json({
      message: "cannot filter due to internal err",
      status: 500
    })
    .status(500)
  }
})



export default filter