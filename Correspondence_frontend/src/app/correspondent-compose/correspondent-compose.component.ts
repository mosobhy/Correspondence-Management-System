import { Component, createNgModule, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CountsServiceService } from '../counts-service.service';
import { TranslateService } from '@ngx-translate/core'
import { AppModule } from '../app.module'



@Component({
  selector: 'app-correspondent-compose',
  templateUrl: './correspondent-compose.component.html',
  styleUrls: ['./correspondent-compose.component.css']
})

export class CorrespondentComposeComponent implements OnInit {
  // public language: string;
  public formSchema: any;
  public formIOLangOptions: any;
  public object_to_send: any;
  // flag for excluding the sending button
  public toSend: Boolean;
  // flag to allow switching to other componets without trigering the diactivate service
  public isFormChanged: Boolean;

  // got from the draft
  public corr_id: any
  public corr: any
  public onLoadCorr: any
  public thread_id: any
  public fromComp: any

  public initialFormFields;

  constructor( 
    public router: Router,
    public route: ActivatedRoute,
    public countsService: CountsServiceService,
    public translate: TranslateService
  ) { 

    // this.language = 'ar'
    // this.translate.use(this.language)
    this.object_to_send = {}
    this.toSend = false
    this.isFormChanged = false
    
    this.corr = {}
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
    this.initialFormFields = {}

    this.setFormIOLangOptions();

  }

  async ngOnInit(): Promise<void> {
    
    // fetch the form schema
    this.formSchema = await this.fetchFormSchema()

    this.fromComp = this.route.snapshot.paramMap.get('fromComp')
    this.corr_id = this.route.snapshot.paramMap.get('corr_id')
    this.thread_id = this.route.snapshot.paramMap.get('thread_id')

    // fetch from db where it has id
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


  setFormIOLangOptions() {
    this.translate.get('COMPOSE.PLACEHOLDERS').subscribe(res => {
      this.formIOLangOptions = {
        language: this.translate.getBrowserLang(),
        i18n: {
          en: {
            1: res['1'],
            2: res['2'],
            3: res['3'],
            4: res['4'],
            5: res['5'],
            6: res['6'],
            7: res['7'],
            8: res['8'],
            9: res['9'],
            10: res['10'],
            11: res['11'],
            12: res['12'],
            13: res['13'],
            14: res['14']
          },
          ar: {
            1: res['1'],
            2: res['2'],
            3: res['3'],
            4: res['4'],
            5: res['5'],
            6: res['6'],
            7: res['7'],
            8: res['8'],
            9: res['9'],
            10: res['10'],
            11: res['11'],
            12: res['12'],
            13: res['13'],
            14: res['14']
          },
          fr: {
            1: res['1'],
            2: res['2'],
            3: res['3'],
            4: res['4'],
            5: res['5'],
            6: res['6'],
            7: res['7'],
            8: res['8'],
            9: res['9'],
            10: res['10'],
            11: res['11'],
            12: res['12'],
            13: res['13'],
            14: res['14']
          }
        }
      }
    })
  }

  async canExit(): Promise<boolean> {
    if(confirm("Are you sure you wanna leave?")) {
      await this.draftMessage() 
      return true
    } else {
      return false
    }
  }


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



 async sendCorrespondence(submission: any) {

    // flag to send to stop the behaviour of closing event
    this.toSend = true;

    // if the message was drafted, undraft it before send
    const tempObj = {
      _id: this.corr_id,
      draft: false,
      starred: this.corr.starred,
      sent_date: Date(),
      message_status: 'sent',
      from_user: 'mosobhy',
      from_entity: 'contellect csp',
      entity_address: 'Eltiran street',
      from_department: 'R&D',
      from_email: "mosobhy266@gmail.com"
    }

    const objectToSend: any = Object.assign(submission.data, tempObj)

    objectToSend.cc_entity = objectToSend.cc_entity.split(',')
    objectToSend.docs_IDs = objectToSend.docs_IDs.split(',')

    const response = await fetch(
      `http://localhost:5000/api/insert/`,
      {
        method: "post",
        body: JSON.stringify({ doc: objectToSend }),
        headers: { "Content-Type": "application/json" }
      }
    )

    const res = await response.json()
    console.log(res)
    if (res.status === 200) {
      this.countsService.updateInboxCount(await this.fetchInboxCount())
      this.router.navigateByUrl('')
    } else {
      const errors = res.errors.split('.')
      this.translate.get(`COMPOSE.ERROR.${errors[0]}.${errors[1]}`).subscribe((res: any) => {
        alert(res)
      })
    }
  }



  async draftMessage() {

    this.object_to_send.draft     = true
    this.object_to_send._id       = this.corr_id        || null
    this.object_to_send.thread_id = this.thread_id      || null
    this.object_to_send.starred   = this.corr.starred   || false
    this.object_to_send.delete    = this.corr.delete    || false
    this.object_to_send.from_user = 'mosobhy'
    this.object_to_send.sent_date = Date()

    const response = await fetch(
      `http://localhost:5000/api/draft/draftDocument`, 
      { 
        method: 'post',
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ doc: this.object_to_send })
      }
    )
    const res = await response.json()
    if (res.status === 200) {
      this.countsService.updateDraftCount(await this.fetchDraftCount())
      this.object_to_send = {}
      this.corr = {}
      this.onLoadCorr = {}
      this.isFormChanged = false
    }

  }


  async getCorrWithID(corr_id: String) {
    const response = await fetch(`http://localhost:5000/api/details/detailsByID?corr_id=${corr_id}`, { method: 'get'})
    const data = await response.json()
    return data
  }


  async getPreviousThread(current_thread_id: any) {

    await this.triggerDraftMessage()

    const prevThreadPromise = await fetch(
      `http://localhost:5000/api/details/getPreviousThreadByCurrentThreadID?fromComp=${this.fromComp}&current_thread_id=${current_thread_id}`,
      {
        method: "get"
      }
    )
    const prevThread = await prevThreadPromise.json()
    
    if (prevThread.status === 400) return;
    
    if (prevThread.length <= 1) {
      if (!prevThread[0].draft) {
        this.router.navigate(['/details', { fromComp: this.fromComp, corr_id: prevThread[0]._id, thread_id: prevThread[0].thread_id }])
      } else {
        this.corr = prevThread[0]
        this.onLoadCorr = prevThread[0]
        this.corr_id = prevThread[0]._id
        this.thread_id = prevThread[0].thread_id
        this.updateInitialFormFields()
        this.isFormChanged = false
      }
    } else {
      this.router.navigate(['/details', { fromComp: this.fromComp, corr_id: prevThread[prevThread.length-1]._id, thread_id: prevThread[prevThread.length-1].thread_id }])
    }

  }



  async getNextThread(current_thread_id: any) {

    await this.triggerDraftMessage()

    const nextThreadPromise = await fetch(
      `http://localhost:5000/api/details/getNextThreadByCurrentThreadID?fromComp=${this.fromComp}&current_thread_id=${current_thread_id}`,
      {
        method: "get"
      }
    )
    const nextThread = await nextThreadPromise.json()

    if (nextThread.status === 400) return;

    if (nextThread.length <= 1) {
      if (!nextThread[0].draft) {
        this.router.navigate(['/details', { fromComp: this.fromComp, corr_id: nextThread[0]._id, thread_id: nextThread[0].thread_id }])
      } else {
        this.corr = nextThread[0]
        this.onLoadCorr = nextThread[0]
        this.corr_id = nextThread[0]._id
        this.thread_id = nextThread[0].thread_id
        this.updateInitialFormFields()
        this.isFormChanged = false
      }
    } else {
      this.router.navigate(['/details', { fromComp: this.fromComp, corr_id: nextThread[nextThread.length-1]._id, thread_id: nextThread[nextThread.length-1].thread_id }])
    }
  }



  // this method will be triggered if when switching between drafted 
  // correspondences using inner pagination
  async triggerDraftMessage() {
    if (this.isFormChanged) {
      const answer = await this.canExit()
      if (answer) {
        this.isFormChanged = false
      }
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

}
