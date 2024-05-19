import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.css']
})
export class PaginationComponent implements OnInit {

  public offset: number;
  public limit: number;

  // @Input() componentName: String;     // it will be set from parentComponet as [componentName]="value"

  constructor() { 
    this.offset = 0
    this.limit = 20
  }

  ngOnInit(): void {
  }


}
