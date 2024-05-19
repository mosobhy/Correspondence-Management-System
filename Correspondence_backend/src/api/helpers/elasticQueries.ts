import dotenv from 'dotenv'
import { Client } from '@elastic/elasticsearch'

dotenv.config()

const esClient = new Client({
    node: "http://localhost:9200"
})


export const filterForInbox = async (filterText: String, page: number, limit: number) => {
  const result = await esClient.search({
      index: 'correspondences',
      query: {
        bool: {
          must: [
            {
              query_string: {
                fields: [
                  "content.corr_subject",
                  "content.corr_body",
                ],
                query: `*${filterText}*`,
              },
            },
          ],
          //filter single drafted thread(draft corre)
          filter: {
            bool: {
              should: [
                {
                  term: { "content.delete": false },
                },
                {
                  bool: {
                    must: [
                      {
                        term: { "content.draft": true },
                      },
                    ],
                    must_not: [
                      {
                        term: { "content.replay_on": '' },
                      },
                    ],
                  },
                },
              ],
            },
          },
        },
      },
      //group based threadId
      collapse: {
        field: "content.thread_id.keyword",
      },
      aggs: {
        total: {
          cardinality: {
            field: "content.thread_id.keyword",
          },
        },
      },
      //paginate groups of the threads
      from: (page - 1) * limit,
      size: limit,
  });

  return result
}


export const filterForStarred = async (filterText: String, page: number, limit: number) => {
    const result = await esClient.search({
        index: String(process.env.INDEX_NAME),
        query: {
          bool: {
            must: [
              {
                query_string: {
                  fields: [
                    "content.corr_subject",
                    "content.corr_body",
                  ],
                  query: `*${filterText}*`,
                },
              },
              {
                term: {
                  "content.isThreadStarred": true,
                },
              },
            ],
            filter: [
              {
                term: { "content.delete": false },
              },
            ],
          },
        },
        collapse: {
          field: "content.thread_id.keyword",
        },
        aggs: {
          total: {
            cardinality: {
              field: "content.thread_id.keyword",
            },
          },
        },
        from: (page - 1) * limit,
        size: limit,
    });
    return result;
}


export const filterForDraft = async (filterText: String, page: number, limit: number) => {
    const result = await esClient.search({
        index: String(process.env.INDEX_NAME),
        query: {
          bool: {
            must: [
              {
                query_string: {
                  fields: [
                    "content.corr_subject",
                    "content.corr_body",
                  ],
                  query: `*${filterText}*`,
                },
              },
              {
                term: {
                  "content.isThreadDrafted": true,
                },
              },
            ],
            filter: [
              {
                term: { "content.delete": false },
              },
            ],
          },
        },
        collapse: {
          field: "content.thread_id.keyword",
        },
        aggs: {
          total: {
            cardinality: {
              field: "content.thread_id.keyword",
            },
          },
        },
        from: (page - 1) * limit,
        size: limit,
    });
    return result
}


export const filterForTrash = async (filterText: String, page: number, limit: number) => {
    const result = await esClient.search({
        index: String(process.env.INDEX_NAME),
        query: {
          bool: {
            must: [
              {
                query_string: {
                  fields: [
                    "content.corr_subject",
                    "content.corr_body",
                  ],
                  query: `*${filterText}*`,
                },
              },
              {
                term: {
                  "content.delete": true,
                },
              },
            ],
          },
        },
        collapse: {
          field: "content.thread_id.keyword",
        },
        aggs: {
          total: {
            cardinality: {
              field: "content.thread_id.keyword",
            },
          },
        },
        from: (page - 1) * limit,
        size: limit,
    });
    return result
}

