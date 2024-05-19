import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CountsServiceService } from '../counts-service.service';
import { FilterService } from '../filter.service'

@Component({
  selector: 'app-draft',
  templateUrl: './draft.component.html',
  styleUrls: ['./draft.component.css']
})
export class DraftComponent implements OnInit {

  public title: String
  public draftCount: number;
  public correspondence_objects: any[]
  public corrs_to_delete: any[]


  public page: number = 1;
  public limit: number = 20;
  public isPrevDisabled: Boolean;
  public isNextDisabled: Boolean;

  constructor( 
      public router: Router,
      public countsService: CountsServiceService,
      public filterService: FilterService
    ) { 

    this.title = 'Draft'
    this.draftCount = 0;
    this.correspondence_objects = []
    this.corrs_to_delete = []

    this.isPrevDisabled = true
    this.isNextDisabled = false
  }

  async ngOnInit(): Promise<void> {
    // fetch the drafts count form db
    this.countsService.updateDraftCount(await this.fetchDraftCount())
    this.fetchFirst()
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
    if (this.draftCount <= (this.page * this.limit)) {
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
      http://127.0.0.1:5000/api/draft/paging/v2?page=${page}&limit=${limit}`,
      { method: "get"}     
    )
    const data = await response.json()
    return data
  }



  async filterByText() {
    const filterText = (<HTMLInputElement>document.getElementById("filterForDraft")).value
    const data = await this.filterService.filterForDraft(filterText, this.page, this.limit)
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
        this.corrs_to_delete.push(obj.thread_id)
      }
    }
  }


  async deleteCheckedCorrs() {
    if (this.corrs_to_delete.length < 1) return
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
      this.countsService.updateDraftCount(await this.fetchDraftCount())
      this.countsService.updateStarredCount(await this.fetchStarredCount())
      this.countsService.updateTrashCount(await this.fetchTrashCount())
      this.correspondence_objects = tempObjs
      this.corrs_to_delete = []
    }
  }


  // fetch count of inbox
  async fetchDraftCount() {
    const response = await fetch("http://localhost:5000/api/draft/count/v2", { method: 'get'})
    const data = await response.json()
    this.draftCount = data.count
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
 

  redirectToCompose( corr_id: String, thread_id: String ) {
    this.router.navigate(['/compose', { fromComp: 'draft', corr_id: corr_id, thread_id: thread_id }])
  }

  redirectToDetails(corr_id: String, thread_id: String) {
    this.router.navigate(['/details', { fromComp: 'draft', corr_id: corr_id, thread_id: thread_id }])
  }

}
