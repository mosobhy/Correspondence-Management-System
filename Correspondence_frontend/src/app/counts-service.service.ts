import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs'

@Injectable({
  providedIn: 'root'
})
export class CountsServiceService {

  public inbox = new BehaviorSubject(0);
  public starred = new BehaviorSubject(0);
  public draft = new BehaviorSubject(0);
  public trash = new BehaviorSubject(0);
  public sent = new BehaviorSubject(0);

  public inboxCount = this.inbox.asObservable()
  public starredCount = this.starred.asObservable()
  public draftCount = this.draft.asObservable()
  public trashCount = this.trash.asObservable()
  public sentCount = this.sent.asObservable()


  constructor() { }

  updateInboxCount(newCount: number) {
    // this will be updated from inside of inbox component
    this.inbox.next(newCount)
  }

  updateStarredCount(newCount: number) {
    // this will be updated fro inside of starred component
    this.starred.next(newCount)
  }

  updateDraftCount(newCount: number) {
    // this will be updated from inside of draft component
    this.draft.next(newCount)
  }

  updateTrashCount(newCount: number) {
    // this will be updated from inside of trash component
    this.trash.next(newCount)
  }

  updateSentCount(newCount: number) {
    this.sent.next(newCount)
  }

}
