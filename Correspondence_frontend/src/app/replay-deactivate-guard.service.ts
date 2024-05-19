import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, CanDeactivate } from '@angular/router';
import { Observable } from 'rxjs';
import { ComposeReplayComponent } from './compose-replay/compose-replay.component';

@Injectable({
  providedIn: 'root'
})
export class ReplayDeactivateGaurd implements CanDeactivate<ComposeReplayComponent> {

  component: any;
  route: any;

  constructor() { }

  canDeactivate(
    component:ComposeReplayComponent,
    route: ActivatedRouteSnapshot, 
    state: RouterStateSnapshot,
    nextState: RouterStateSnapshot
  ) : Observable<boolean> | Promise<boolean> | boolean {

    if (component.toSend || !component.isFormChanged) {
      return true;
    } else {
      return component.canExit()
    }
  }
}
