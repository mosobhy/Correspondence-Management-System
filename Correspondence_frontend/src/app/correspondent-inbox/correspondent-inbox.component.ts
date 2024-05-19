import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CountsServiceService } from '../counts-service.service';
import { FilterService } from '../filter.service';
import { DataService } from '../data.service'
import { PaginatorService } from '../paginator.service';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-correspondent-inbox',
  templateUrl: './correspondent-inbox.component.html',
  styleUrls: ['./correspondent-inbox.component.css']
})
export class CorrespondentInboxComponent implements OnInit {

  public subscription: Subscription;

  public correspondence_objects: any[]
  public title: String;
  public starred_entries_num: number;
  public currentInboxCount: number;
  public corrs_to_delete: any[];

  page: number = 1;
  limit: number = 20
  public isPrevDisabled: Boolean;
  public isNextDisabled: Boolean;

  constructor( 
      public router: Router,
      public countsService: CountsServiceService,
      public dataService: DataService,
      public filterService: FilterService,
      public paginator: PaginatorService
    ) { 

    this.subscription = this.countsService.inbox.subscribe(count => this.currentInboxCount = count)

    this.correspondence_objects = []
    this.title = 'Inbox'
    this.starred_entries_num = 0;
    this.currentInboxCount = 0;
    this.corrs_to_delete = []

    this.isPrevDisabled = true
    this.isNextDisabled = false
  }

  async ngOnInit(): Promise<void> {

    this.currentInboxCount = await this.fetchInboxCount();
    await this.fetchFirst();

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
    if (this.currentInboxCount <= (this.page * this.limit)) {
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
      http://127.0.0.1:5000/api/inbox/paging/v2?page=${page}&limit=${limit}`,
      { method: "get"}     
    )
    const data = await response.json()
    return data
  }


  async filterByText() {
    // to handle the inner pagination, i can return also the current page and limit from the back, and control them from here inside of this function
    const filterText = (<HTMLInputElement>document.getElementById("filterInputBox")).value
    const data: any = await this.filterService.filterForInbox(filterText, this.page, this.limit)
    this.correspondence_objects = data
  }


  async starCorrespondent(event: any) {
    const thread_id = event.target.dataset.thread_id
    const response = await fetch(`http://127.0.0.1:5000/api/star/starThreadById?thread_id=${thread_id}`, {method: 'get'})
    const res = await response.json()
    if (res.status === 200) {
      if (res.update === true) {
        event.target.style.color = 'gold'
      } else {
        event.target.style.color = 'black'
      }
      this.countsService.updateStarredCount(await this.fetchStarredCount())
      return 
    } else {
      alert("An error occured")
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
    this.corrs_to_delete = []
    for (let obj of this.correspondence_objects) {
      const checkBox = (<HTMLInputElement>document.getElementById(String(obj.thread_id)))
      checkBox.checked = !checkBox.checked
    }
    // iterate over checked items and delete
    for ( let obj of this.correspondence_objects ) {
      const checkBox = (<HTMLInputElement>document.getElementById(String(obj.thread_id)))
      if ( checkBox.checked ) {
        this.corrs_to_delete.push(obj.thread_id)
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
      this.countsService.updateTrashCount(await this.fetchTrashCount())
      this.countsService.updateInboxCount(await this.fetchInboxCount())
      this.countsService.updateStarredCount(await this.fetchStarredCount())
      this.correspondence_objects = tempObjs
      this.corrs_to_delete = []
    }

    const refilledthreads = await this.reFillDeletedThreads(this.page, this.limit, itemsCountToReFill)
    this.correspondence_objects = this.correspondence_objects.concat(refilledthreads)
  }


  async reFillDeletedThreads(page: number, limit: number, count: number) {
    const threadsToAppendPromise = await fetch(
      `http://localhost:5000/api/delete/reFill?fromComp=inbox&page=${page}&limit=${limit}&count=${count}`,
      {
        method: 'get'
      }
    )
    const threadsToAppend = await threadsToAppendPromise.json()
    return threadsToAppend
  }


  updateMessageStatus(thread_id: any) {
    fetch(`http://localhost:5000/api/details/updateMessageStatus?thread_id=${thread_id}`)
  }

  // I use the corr_id instead of the thread_id to be able to traverse
  // using graphLookup to optimize upon the performance
  redirectToDetails(corr_id: String, thread_id: String) {
    this.router.navigate(['/details', { fromComp: 'inbox', corr_id: corr_id, thread_id: thread_id }])
  }


  handleClick(corr_id: String, thread_id: String) {
    this.updateMessageStatus(thread_id)
    this.redirectToDetails(corr_id, thread_id)
  }
  

   // fetch count of inbox
   async fetchInboxCount() {
    const response = await fetch("http://localhost:5000/api/inbox/count/v2", { method: 'get'})
    const data = await response.json()
    this.currentInboxCount = data.count
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


}
