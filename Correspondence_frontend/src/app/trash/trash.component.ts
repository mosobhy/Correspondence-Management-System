import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router'
import { CountsServiceService } from '../counts-service.service';
import { FilterService } from '../filter.service'

@Component({
  selector: 'app-trash',
  templateUrl: './trash.component.html',
  styleUrls: ['./trash.component.css']
})
export class TrashComponent implements OnInit {

  public title: String;
  public correspondence_objects: any[]
  public corrs_to_untrash: any[]

  public trashCount: number;

  public page: number = 1;
  public limit: number = 20;
  public isPrevDisabled: Boolean;
  public isNextDisabled: Boolean;

  constructor( 
      public router: Router,
      public countsSerivce: CountsServiceService,
      public filterService: FilterService
    ) { 

    this.correspondence_objects = []
    this.corrs_to_untrash = []
    this.title = "Trash"
    this.trashCount = 0;

    this.isPrevDisabled = true;
    this.isNextDisabled = false;
  }

  async ngOnInit(): Promise<void> {
    // get the count of trashed messages
    this.countsSerivce.updateTrashCount(await this.fetchTrashCount())
    this.fetchFirst();
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
    if (this.trashCount <= (this.page * this.limit)) {
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
      http://localhost:5000/api/delete/paging/v2?page=${page}&limit=${limit}`,
      { method: "get"}     
    )
    const data = await response.json()
    return data
  }



  async filterByText() {
    const filterText = (<HTMLInputElement>document.getElementById("filterForTrash")).value
    const data = await this.filterService.filterForTrash(filterText, this.page, this.limit)
    this.correspondence_objects = data
  }


  selectItemToUntrash(corr_id: String) {
    const element_checked = (<HTMLInputElement>document.getElementById(String(corr_id))).checked;
    if(element_checked) {
      this.corrs_to_untrash.push(corr_id)
    } else {
      const corr_id_index = this.corrs_to_untrash.indexOf(corr_id)
      if (corr_id_index > -1) {
        this.corrs_to_untrash.splice(corr_id_index, 1)
      }
    }
  }

  async selectAllToUntrash() {
    // apply click event on all selections in the page
    this.corrs_to_untrash = []

    for (let obj of this.correspondence_objects) {
      const checkBox = (<HTMLInputElement>document.getElementById(String(obj.thread_id)))
      checkBox.checked = !checkBox.checked
    }

    // iterate over checked items and delete
    for ( let obj of this.correspondence_objects ) {
      const checkBox = (<HTMLInputElement>document.getElementById(String(obj.thread_id)))
      if ( checkBox.checked ) {
        this.corrs_to_untrash.push(obj.thread_id)
      }
    }
  }

  async untrashSelectedCorrs() {
    if (this.corrs_to_untrash.length < 1) return

    const itemsCountToReFill = this.corrs_to_untrash.length

    const response = await fetch("http://localhost:5000/api/delete/untrashThread",
    {
      method: "post",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ thread_IDs: this.corrs_to_untrash})
    })
    const result = await response.json()
    if ( result.status === 200) {
      let tempObjs = this.correspondence_objects.filter((obj, index, arr) => {
        return !this.corrs_to_untrash.includes(obj.thread_id)
      })
      this.countsSerivce.updateTrashCount(await this.fetchTrashCount())
      this.countsSerivce.updateDraftCount(await this.fetchDraftCount())
      this.countsSerivce.updateInboxCount(await this.fetchInboxCount())
      this.countsSerivce.updateStarredCount(await this.fetchStarredCount())
      this.countsSerivce.updateSentCount(await this.fetchSentCount())
      this.correspondence_objects = tempObjs
      this.corrs_to_untrash = []
    }

    const refilledthreads = await this.reFillDeletedThreads(this.page, this.limit, itemsCountToReFill)
    this.correspondence_objects = this.correspondence_objects.concat(refilledthreads)
  }


  async reFillDeletedThreads(page: number, limit: number, count: number) {
    const threadsToAppendPromise = await fetch(
      `http://localhost:5000/api/delete/reFill?fromComp=trash&page=${page}&limit=${limit}&count=${count}`,
      {
        method: 'get'
      }
    )
    const threadsToAppend = await threadsToAppendPromise.json()
    return threadsToAppend
  }
  
  async deleteCorrsPermenantly() {
    if (confirm("Are you sure you need to delete Correspondences permenenantrly?")) {
      if (this.corrs_to_untrash.length < 1) return
      const response = await fetch("http://localhost:5000/api/delete/deleltBulkPermenant",
      {
        method: "delete",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ corrs: this.corrs_to_untrash})
      })
      const result = await response.json()
      if ( result.status === 200) {
        let tempObjs = this.correspondence_objects.filter((obj, index, arr) => {
          return !this.corrs_to_untrash.includes(obj._id)
        })
        this.correspondence_objects = tempObjs
        this.corrs_to_untrash = []
      }
    } else {
      return 
    }
  }


  redirectToDetails(corr_id: String, thread_id: String) {
    this.router.navigate(['/details', { corr_id: corr_id, thread_id: thread_id }])
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
    this.trashCount = data.count
    return data.count
  }

  async fetchSentCount() {
    const response = await fetch("http://localhost:5000/api/sent/count/v2", { method: 'get'})
    const data = await response.json()
    return data.count
  }


}
