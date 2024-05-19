import { Injectable } from '@angular/core';
import { DataService } from './data.service';

@Injectable({
  providedIn: 'root'
})
export class PaginatorService {

  public inboxPage: number;
  public trashPage: number;
  public starPage: number;
  public sentPage : number;
  public draftPage: number;

  public limit: number;

  constructor( public dataService: DataService) { 
    this.trashPage = 1;
    this.inboxPage = 1;
    this.starPage = 1;
    this.sentPage = 1;
    this.draftPage = 1;

    this.limit = 20;
  }



  // getNext and getPrevious
  public async getNext() {
    
  }



  public async getSentData(){
    const output: any = {}

    const params = {
      page: this.sentPage,
      limit: this.limit
    }

    const count = await this.dataService.getCount('sent')
    if (count) {
      output.count = count
    } else {
      output.count = 0
    }

    const results = await this.dataService.getSentData(params);
    if (results.status === 200) {
      output.data = results
    } else {
      output.data = {}
    }

    // increment the page number
    this.sentPage++

    return output
  }





  public async reFill(itemsNum: number) {

  }
  
}
