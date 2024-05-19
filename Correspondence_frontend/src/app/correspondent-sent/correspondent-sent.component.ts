import { Component, OnInit } from '@angular/core';
import { CountsServiceService } from '../counts-service.service';
import { Router } from '@angular/router';
import { FilterService } from '../filter.service'
import { PaginatorService } from '../paginator.service';

@Component({
  selector: 'app-correspondent-sent',
  templateUrl: './correspondent-sent.component.html',
  styleUrls: ['./correspondent-sent.component.css']
})
export class CorrespondentSentComponent implements OnInit {

  public title: String;
  public correspondence_objects: any[];
  public sentCount: number;
  public corrs_to_delete: any

  public page: number;
  public limit: number;
  isPrevDisabled: Boolean;
  isNextDisabled: Boolean;

  constructor(
    public router: Router,
    public countsService: CountsServiceService,
    public filterService: FilterService,
    public paginator: PaginatorService
  ) { 

    this.title = "Sent Messages"
    this.correspondence_objects = []
    this.page = 1
    this.limit = 20
    this.sentCount = 0
    this.corrs_to_delete = []

    this.isPrevDisabled = true
    this.isNextDisabled = false
  }


  async ngOnInit(): Promise<void> {
    // update the count of inbox in countsService
    this.countsService.updateSentCount(await this.fetchSentCount())
    await this.fetchFirst()
  }


  async getPrevious() {
    if (this.page === 1) {
      // disable prev
      this.isPrevDisabled = true
    }
    if (this.page !== 1) {
      // enable next
      this.isNextDisabled = false
      this.page--
      const data = await this.getPaginatedCorrespondents(this.page, this.limit)
      this.correspondence_objects = data
    }
  }

  async getNext() {
    if (this.sentCount <= (this.page * this.limit)) {
      // disable next
      this.isNextDisabled = true
    } else {
      // enable prev
      this.isPrevDisabled = false
      this.page++
      const data = await this.getPaginatedCorrespondents(this.page, this.limit)
      this.correspondence_objects = data
    }
  }

  

  async fetchFirst() {
    const data = await this.getPaginatedCorrespondents(this.page, this.limit)
    this.correspondence_objects = data
  }

  async getPaginatedCorrespondents(page: number, limit: number) {
    const response = await fetch(`
      http://127.0.0.1:5000/api/sent/paging/v2?page=${page}&limit=${limit}`,
      { method: "get"}     
    )
    const data = await response.json()
    return data
  }



  async filterByText() {
    const filterText = (<HTMLInputElement>document.getElementById("filterForSent")).value
    const data: any = await this.filterService.filterForSent(filterText, this.page, this.limit)
    this.correspondence_objects = data
  }


  async starCorrespondent(event: any) {
    const thread_id = event.target.dataset.thread_id
    const response = await fetch(`http://127.0.0.1:5000/api/star/starThreadById?thread_id=${thread_id}`, {method: 'get'})
    const res = await response.json()
    if (res.status === 200) {
      if (res.update === true) {
        event.target.style.color = 'gold'
        return
      }
      event.target.style.color = 'black'
    }
  }


  selectItemToDelete(corr_id: String) {
    const element_checked = (<HTMLInputElement>document.getElementById(String(corr_id))).checked;
    if(element_checked) {
      this.corrs_to_delete.push(corr_id)
    } else {
      const corr_id_index = this.corrs_to_delete.indexOf(corr_id)
      if (corr_id_index > -1) {
        this.corrs_to_delete.splice(corr_id_index, 1)
      }
    }
  }

  async selectAllItemsToDelete() {
    // apply click event on all selections in the page
    this.corrs_to_delete = []

    for (let obj of this.correspondence_objects) {
      const checkBox = (<HTMLInputElement>document.getElementById(String(obj.thread_id)))
      checkBox.checked = !checkBox.checked
    }

    // iterate over checked items and delete
    for ( let obj of this.correspondence_objects ) {
      const checkBox = (<HTMLInputElement>document.getElementById(String(obj.thread_id)))
      if ( checkBox.checked ) {
        this.corrs_to_delete.push(obj._id)
      }
    }
  }

  
  async deleteCheckedCorrs() {
    if (this.corrs_to_delete.length < 1) return

    const itemsCountToReFill = this.corrs_to_delete.length

    const response = await fetch("http://localhost:5000/api/delete/deleteBulkThreads",
    {
      method: "delete",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ thread_IDs: this.corrs_to_delete })
    })
    const result = await response.json()
    if ( result.status === 200) {
      let tempObjs = this.correspondence_objects.filter((obj, index, arr) => {
        return !this.corrs_to_delete.includes(obj.thread_id)
      })
      this.correspondence_objects = tempObjs
      this.corrs_to_delete = []
    }

    const refilledthreads = await this.reFillDeletedThreads(this.page, this.limit, itemsCountToReFill)
    this.correspondence_objects = this.correspondence_objects.concat(refilledthreads)
  }


  async reFillDeletedThreads(page: number, limit: number, count: number) {
    const threadsToAppendPromise = await fetch(
      `http://localhost:5000/api/delete/reFill?fromComp=sent&page=${page}&limit=${limit}&count=${count}`,
      {
        method: 'get'
      }
    )
    const threadsToAppend = await threadsToAppendPromise.json()
    return threadsToAppend
  }



  // fetch count of inbox
  async fetchSentCount() {
    const response = await fetch("http://localhost:5000/api/sent/count/v2", { method: 'get'})
    const data = await response.json()
    this.sentCount = data.count
    return data.count
  }

  redirectToDetails(corr_id: String, thread_id: String) {
    this.router.navigate(['/details', { fromComp: "sent", corr_id: corr_id, thread_id: thread_id }])
  }

}
