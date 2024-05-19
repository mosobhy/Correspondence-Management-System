import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';



@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})


export class AppComponent {

  public title = 'correspondence';
  // public language: string;

  constructor( public translate: TranslateService ) {
    // this.language =    
  }


  changeLang(event: any) {
    // this.language = event.target.innerHTML;
    this.translate.use(event.target.innerHTML)
    // window.location.reload()  
  }
}
