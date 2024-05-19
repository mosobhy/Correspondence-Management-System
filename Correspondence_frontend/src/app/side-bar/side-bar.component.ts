import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router'
import { CountsServiceService } from '../counts-service.service';
import { Subscription } from 'rxjs'
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-side-bar',
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.css']
})
export class SideBarComponent implements OnInit {

  public inboxSubscription: Subscription
  public starredSubscription: Subscription
  public draftSubscription: Subscription
  public trashSubscription: Subscription
  public sentSubscription: Subscription

  public inboxCount: number;
  public starredCount: number;
  public draftCount: number;
  public trashCount: number;
  public sentCount: number;

  constructor( 
    public router: Router, 
    public countsService: CountsServiceService,
    public translate: TranslateService
    ) { 

    this.inboxSubscription = this.countsService.inbox.subscribe(count => this.inboxCount = count)
    this.starredSubscription = this.countsService.starred.subscribe(count => this.starredCount = count)
    this.draftSubscription = this.countsService.draft.subscribe(count => this.draftCount = count)
    this.trashSubscription = this.countsService.trash.subscribe(count => this.trashCount = count)
    this.sentSubscription = this.countsService.sent.subscribe(count => this.sentCount = count)

    this.inboxCount = 0;
    this.starredCount = 0;
    this.draftCount = 0;
    this.trashCount = 0;
    this.sentCount = 0;
  }

  async ngOnInit(): Promise<void> {

    // get all counts in the same time
    [ 
      this.inboxCount, 
      this.starredCount, 
      this.draftCount, 
      this.sentCount, 
      this.trashCount 
    ] = await Promise.all([ 
        this.fetchInboxCount(),
        this.fetchStarredCount(), 
        this.fetchDraftCount(), 
        this.fetchSentCount(), 
        this.fetchTrashCount() 
      ])

  }

  handleCompose() {
    // navigate by url to the compose mesasge
    this.router.navigateByUrl('compose')
  }

  handleInbox() {
    this.router.navigateByUrl('')
  }

  handleSent() {
    this.router.navigateByUrl('sent')
  }

  handleDraft() {
    this.router.navigateByUrl('draft')
  }

  handleStarred() {
    this.router.navigateByUrl('starred')
  }

  handleTrash() {
    this.router.navigateByUrl('trash')
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
