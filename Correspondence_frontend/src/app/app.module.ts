import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router'
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPrintModule } from 'ngx-print';
import { HttpClient, HttpClientModule } from '@angular/common/http'
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SideBarComponent } from './side-bar/side-bar.component';
import { CorrespondentInboxComponent } from './correspondent-inbox/correspondent-inbox.component';
import { CorrespondentComposeComponent } from './correspondent-compose/correspondent-compose.component';
import { CorrespondentSentComponent } from './correspondent-sent/correspondent-sent.component';
import { CorrespondentStarredComponent } from './correspondent-starred/correspondent-starred.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DraftComponent } from './draft/draft.component';
import { CorrespondentDetailsComponent } from './correspondent-details/correspondent-details.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { PaginationComponent } from './pagination/pagination.component';
import { TrashComponent } from './trash/trash.component';
import { DeactivateGuardService } from './deactivate-guard.service';
import { ComposeReplayComponent } from './compose-replay/compose-replay.component';
import { ReplayDeactivateGaurd } from './replay-deactivate-guard.service'
import { FormioModule } from '@formio/angular';



// this is needed for the localization
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}



@NgModule({
  declarations: [
    AppComponent,
    SideBarComponent,
    CorrespondentInboxComponent,
    CorrespondentComposeComponent,
    CorrespondentSentComponent,
    CorrespondentStarredComponent,
    DraftComponent,
    CorrespondentDetailsComponent,
    PaginationComponent,
    TrashComponent,
    ComposeReplayComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
      defaultLanguage: "en"
    }),
    FormsModule,
    NgxPaginationModule,
    ReactiveFormsModule,
    NgxPrintModule,
    HttpClientModule,
    FormioModule,
    RouterModule.forRoot([
      {
        path: '',
        component: CorrespondentInboxComponent 
      },
      {
        path: 'compose',
        component: CorrespondentComposeComponent,
        canDeactivate: [DeactivateGuardService]
      },
      {
        path: 'starred',
        component: CorrespondentStarredComponent
      },
      {
        path: 'draft',
        component: DraftComponent
      },
      {
        path: 'sent',
        component: CorrespondentSentComponent
      },
      {
        path: 'details',
        component: CorrespondentDetailsComponent
      },
      {
        path: 'trash',
        component: TrashComponent
      }, 
      {
        path: 'replay',
        component: ComposeReplayComponent,
        canDeactivate: [ReplayDeactivateGaurd]
      }
      // {
      //   path: "details/:word",
      //   component: CorrespondentDetailsComponent
      // }
    ]),
    BrowserAnimationsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
