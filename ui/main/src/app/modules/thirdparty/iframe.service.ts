import {EventEmitter, Injectable, Output} from '@angular/core';
import {ReplaySubject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class IframeService {

  iframeURL : string = "";

  @Output() urlUpdate: ReplaySubject<string> = new ReplaySubject(1);
  //Using ReplaySubject because the first urlUpdate is emitted before the component can subscribe to it (when it is initialized).

  selectURL(url){
    this.iframeURL = url;
    this.urlUpdate.next(this.iframeURL);
  }

}
