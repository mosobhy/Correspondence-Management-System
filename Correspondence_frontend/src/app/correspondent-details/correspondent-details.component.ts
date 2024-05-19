import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router'

@Component({
  selector: 'app-correspondent-details',
  templateUrl: './correspondent-details.component.html',
  styleUrls: ['./correspondent-details.component.css']
})
export class CorrespondentDetailsComponent implements OnInit {

  public fromComp: any
  public corr_id: any
  public thread_id: any
  public corr_details: any
  public corr_replays: any
  public last_undrafted_corr_id: any    // used when completeing drafted replys
  public authenticated_user: any

  // public isPrevDisabled = true
  // public isNextDisabled = false

  constructor( public route: ActivatedRoute, public router: Router ) { 
    this.authenticated_user = 'me (authenticated user)'
  }

  ngOnInit(): void {
    this.fromComp = this.route.snapshot.paramMap.get("fromComp")
    this.corr_id = this.route.snapshot.paramMap.get("corr_id")
    this.thread_id = this.route.snapshot.paramMap.get("thread_id")
    this.fetchingCorrespondentDetails()
  }



  async fetchingCorrespondentDetails() {
    const response = await fetch(`
      http://127.0.0.1:5000/api/details/traverseThread?corr_id=${this.corr_id}`,
      { 
        method: "get"
      }
    )
    const data = await response.json()
    console.dir(data)
    this.corr_details = data
    this.last_undrafted_corr_id = this.getLastUndraftedCorrId()
  }




  async deleteThisThread( thread_id: String ) {
    const response  = await fetch(`http://127.0.0.1:5000/api/delete/deleteThreadByID?thread_id=${thread_id}`, { method: "delete"})
    const data = await response.json()
    if (data.status === 200 ) {
      alert("Successfully Deleted")
      this.router.navigateByUrl('')
    } else {
      alert("Error")
    }
  }


  
  async starCorrespondent(event: any) {
    const corr_id = event.target.dataset.corr_id
    const response = await fetch(`http://127.0.0.1:5000/api/star/starDocumentById?corr_id=${corr_id}`, {method: 'get'})
    const res = await response.json()
    if (res.status === 200) {
      if (res.update === true) {
        event.target.style.color = 'gold'
        return
      }
      event.target.style.color = 'black'
    }
  } 

 
  replay_(parent_id: String, thread_id: String) {
    // corr_id is the parent_id
    this.router.navigate(['/replay', { parent_id: parent_id, thread_id: thread_id }])
  }


  completeReplay(parent_id: String, corr_id: String, thread_id: String) {
    // corr_id is id of the message itself to be completed
    this.router.navigate(['/replay', { parent_id: parent_id, corr_id: corr_id, thread_id: thread_id }])
  }

  
  async getPreviousThread(current_thread_id: any) {
    const prevThreadPromise = await fetch(
      `http://localhost:5000/api/details/getPreviousThreadByCurrentThreadID?fromComp=${this.fromComp}&current_thread_id=${current_thread_id}`,
      {
        method: "get"
      }
    )
    const prevThread = await prevThreadPromise.json()

    if (prevThread.status === 400) return;

    this.thread_id = prevThread[0].thread_id
    
    // single thread message is drafted, redirect to compose
    if(prevThread[0].draft) {
      this.router.navigate(['/compose', { fromComp: this.fromComp, corr_id: prevThread[0]._id, thread_id: prevThread[0].thread_id }])
    } else {
      this.corr_details = prevThread
    }
  }



  async getNextThread(current_thread_id: any) {
    const nextThreadPromise = await fetch(
      `http://localhost:5000/api/details/getNextThreadByCurrentThreadID?fromComp=${this.fromComp}&current_thread_id=${current_thread_id}`,
      {
        method: "get"
      }
    )
    const nextThread = await nextThreadPromise.json()

    if (nextThread.status === 400) return;

    this.thread_id = nextThread[0].thread_id

    // single thread message is drafted, redirect to compose
    if(nextThread[0].draft) {
      this.router.navigate(['/compose', { fromComp: this.fromComp, corr_id: nextThread[0]._id, thread_id: nextThread[0].thread_id }])
    } else {
      this.corr_details = nextThread
    }
  }
  



  getLastUndraftedCorrId() {
    let corr_id;
    for (let corr of this.corr_details) {
      if (!corr.draft) {
        corr_id = corr._id
      }
    }
    return corr_id
  }
}
