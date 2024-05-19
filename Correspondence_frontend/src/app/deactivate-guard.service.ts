import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, CanDeactivate } from '@angular/router';
import { Observable } from 'rxjs';
import { CorrespondentComposeComponent } from './correspondent-compose/correspondent-compose.component';

@Injectable({
  providedIn: 'root'
})
export class DeactivateGuardService implements CanDeactivate<CorrespondentComposeComponent> {

  component: any;
  route: any;

  constructor() { }

  canDeactivate(
    component:CorrespondentComposeComponent,
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
