import { Injectable, OnInit } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DataService implements OnInit {

  private baseURL: String;

  constructor() { 
    this.baseURL = 'http://localhost:5000/api'
  }

  async ngOnInit() {

  }


  public async getSentData(params: any) {
    const response = await fetch(
      `${this.baseURL}/sent/paging?page=${params.page}&limit=${params.limit}`,
      { method: "get" }
    )
    const result = await response.json()
    if (result.status === 200) {
      return result
    } else {
      return {}
    }
  }



  // this method will be common for all of the endpoint
  public async getCount(endpoint: String) {
    const response = await fetch(
      `${this.baseURL}/${endpoint}/count`,
      {
        method: "get"
      }
    )
    const result = await response.json()
    if(result.count) {
      // return the actual number
      return result.count
    } else {
      return 0
    }
  }


  async fetchInboxCount() {
    const response = await fetch("http://localhost:5000/api/inbox/count/v2", { method: 'get'})
    const data = await response.json()
    return data.count
  }

  async fetchDraftCount() {
    const response = await fetch("http://localhost:5000/api/draft/count/v2", { method: 'get'})
    const data = await response.json()
    return data.count
  }

  async fetchStarredCount() {
    const response = await fetch('http://localhost:5000/api/star/count/v2', { method: 'get'})
    const data = await response.json()
    return data.count
  }

  async fetchTrashCount() {
    const response = await fetch("http://localhost:5000/api/delete/count", { method: 'get'})
    const data = await response.json()
    return data.count
  }

  async fetchSentCount() {
    const response = await fetch("http://localhost:5000/api/sent/count/v2", { method: 'get'})
    const data = await response.json()
    return data.count
  }

}
