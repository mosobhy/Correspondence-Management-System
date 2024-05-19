import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FilterService {

  private baseUrl: String;
  constructor() { 
    this.baseUrl = 'http://localhost:5000/api/filter'
  }

  private async apiCall(urlObj: any) {
    const endpoint = urlObj.endpoint;
    const keyword = urlObj.keyword;
    const page = urlObj.page;
    const limit = urlObj.limit;
    const response = await fetch(
      `${this.baseUrl}/${endpoint}?keyword=${keyword}&page=${page}&limit=${limit}`,
      { method: "get" }
    )
    const data = await response.json()
    return data
  }

  public async filterForInbox(keyword: String, page: number, limit: number) {
    const response = await this.apiCall({
      endpoint: "filterForInbox",
      keyword: keyword,
      page: page,
      limit: limit
    })
    return response
  }

  public async filterForTrash(keyword: String, page: number, limit: number) {
    const response = await this.apiCall({
      endpoint: "filterForTrash",
      keyword: keyword,
      page: page,
      limit: limit
    })
    return response
  }

  public async filterForDraft(keyword: String, page: number, limit: number) {
    const response = await this.apiCall({
      endpoint: "filterForDraft",
      keyword: keyword,
      page: page,
      limit: limit
    })
    return response
  }

  public async filterForStarred(keyword: String, page: number, limit: number) {
    const response = await this.apiCall({
      endpoint: "filterForStarred",
      keyword: keyword,
      page: page,
      limit: limit
    })
    return response
  }

  public async filterForSent(keyword: String, page: number, limit: number) {
    const response = await this.apiCall({
      endpoint: "filterForSent",
      keyword: keyword,
      page: page,
      limit: limit
    })
    return response
  }
}
