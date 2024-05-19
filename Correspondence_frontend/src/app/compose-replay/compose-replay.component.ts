import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router'

@Component({
  selector: 'app-compose-replay',
  templateUrl: './compose-replay.component.html',
  styleUrls: ['./compose-replay.component.css']
})
export class ComposeReplayComponent implements OnInit {

  public formSchema: any;
  public parent_id: any;
  public corr_id: any;
  public thread_id: any;
  public title: String;
  public object_to_send: any;
  public corr: any;
  public toSend: Boolean;
  public onLoadCorr: any;
  public isFormChanged: Boolean;

  public initialFormFields;

  public authenticated_user: String;

  constructor(public route: ActivatedRoute, public router: Router) { 
    this.title = 'Replay: '
    this.object_to_send = {}
    this.corr = {}
    this.toSend = false
    this.initialFormFields = {}
    this.isFormChanged = false

    this.onLoadCorr = {
      "corr_no": "",
      "corr_type": "",
      "entity_no": "",
      "cc_entity": "",
      "to_entity": "",
      "to_department": "",
      "corr_subject": "",
      "docs_IDs": "",
      "due_date": "",
      "priority": "normal",
      "classification": "normal",
      "await_reply": false,
      "corr_body": "",
      "send": false
    }

    this.authenticated_user = 'me (authenticated)'
  }

  async ngOnInit(): Promise<void> {

    // fetch the form schema
    this.formSchema = await this.fetchFormSchema()

    // the id of the message to reply on, so it will be attached on the field of replay_on
    this.parent_id = this.route.snapshot.paramMap.get('parent_id')
    this.corr_id = this.route.snapshot.paramMap.get('corr_id')
    this.thread_id = this.route.snapshot.paramMap.get("thread_id")

    if (this.corr_id) {
      this.corr = await this.getCorrWithID(this.corr_id)
      this.onLoadCorr = Object.assign({}, this.corr)  // to be checked against on deactivating the comp
      this.updateInitialFormFields()
    }
  }


  async fetchFormSchema() {
    const response = await fetch(
      `http://localhost:5000/api/formDesign/getFormSchema`,
      { method: "get" }
    )
    return response.json()
  }


  async canExit(): Promise<boolean> {
    if(confirm("Are you sure you wanna leave?")) {
      await this.draftMessage() 
      return true
    } else {
      return false
    }
  }


  // its invoked every time the form is updated
  updateCurrentFormFields(event: any) { 
    if (event.data) {
      this.object_to_send = event.data
      this.isFormChanged =  this.detectIfFormChanged(event)
    }
  }


  detectIfFormChanged(event: any) {

    for (let item of Object.entries(event.data)) {
      if (
          item[0] === 'cc_entity' ||
          item[0] === 'docs_IDs'  || 
          item[0] === 'due_date'  || 
          item[0] === 'sent_date' ||
          item[0] === 'send'      ||
          item[0] === 'thread_id' ||
          item[0] === '_id'
          ) 
          continue
      if (this.onLoadCorr[item[0]] !== item[1]) return true
    }
    return false;
  }
  
  updateInitialFormFields() {
    this.initialFormFields = {
      data: {
        corr_no: this.corr.corr_no,
        corr_type: this.corr.corr_type,
        entity_no: this.corr.entity_no,
        cc_entity: this.getCommaSeparatedStrings(this.corr.cc_entity),
        to_entity: this.corr.to_entity,
        to_department: this.corr.to_department,
        corr_subject: this.corr.corr_subject,
        corr_body: this.corr.corr_body,
        docs_IDs: this.getCommaSeparatedStrings(this.corr.docs_IDs),
        due_date: this.corr.due_date,
        priority: this.corr.priority,
        classification: this.corr.classification,
        await_reply: this.corr.await_reply
      }
    } 
  }


  getCommaSeparatedStrings(arr: any) {
    let output = ''
    for (let i = 0; i < arr.length; i++) {
      if (i == arr.length - 1) {
        output += arr[i] 
      } else {
        output += arr[i] + ','
      }
    }
    return output
  }


  async draftMessage() {

    this.object_to_send._id       = this.corr_id || null  // the _id of the draft itself
    this.object_to_send.draft     = true
    this.object_to_send.starred   = false
    this.object_to_send.delete    = false
    this.object_to_send.from_user = this.authenticated_user
    this.object_to_send.sent_date = Date()

    const tempObj = {
      parent_id: this.parent_id,
      thread_id: this.thread_id,
      doc: this.object_to_send
    }

    const response = await fetch(
      `http://localhost:5000/api/draft/draftReply`, 
      { 
        method: 'post',
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(tempObj)
      }
    )
    const res = await response.json()
    if (res.status === 200) {
      this.corr_id = res.doc._id
      console.log("drafted successfully")
    }

  }


  async sendReplay(submission: any) {
    
    // flag to send
    this.toSend = true 

    const tempObj = {
      draft: false,
      starred: this.corr.starred || false,
      sent_date: Date(),
      message_status: 'sent',
      from_user: this.authenticated_user
    }

    const replayObj = {
      thread_id: this.thread_id,
      corr_id: this.corr_id,
      parent_id: this.parent_id,
      replay: Object.assign(submission.data, tempObj)
    }

    console.log("object to reply with ")
    console.log(replayObj)
    const response = await fetch(
      `http://localhost:5000/api/insert/addReplay`,
      {
        method: "post",
        headers: { "Content-Type": "application/json" },
        body:  JSON.stringify(replayObj)
      }
    )
    if (response.status === 200) {
      this.router.navigateByUrl('')
    } else {
      alert("Cannot post this replay")
    }
  }



  async getCorrWithID(corr_id: String) {
    const response = await fetch(`http://localhost:5000/api/details/detailsByID?corr_id=${corr_id}`, { method: 'get'})
    const data = await response.json()
    return data
  }

}
