import {EventEmitter, Injectable, Output} from '@angular/core';
import {ReplaySubject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class IframeService {

  @Output() urlUpdate: ReplaySubject<string> = new ReplaySubject(1);
  //Using ReplaySubject because the first urlUpdate is emitted before the component can subscribe to it (when it is initialized).

  selectURL(url){
    this.urlUpdate.next(url);
  }

}
