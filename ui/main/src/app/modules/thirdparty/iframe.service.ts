import {Injectable, Output} from '@angular/core';
import {ReplaySubject} from "rxjs";
import {DomSanitizer, SafeUrl} from "@angular/platform-browser";

@Injectable({
  providedIn: 'root'
})
export class IframeService {

  constructor(
      private sanitizer: DomSanitizer
  ) { }

  @Output() urlUpdate: ReplaySubject<SafeUrl> = new ReplaySubject(1);
  //Using ReplaySubject because the first urlUpdate is emitted before the component can subscribe to it (when it is initialized).

  selectURL(url){
    this.urlUpdate.next(this.sanitizer.bypassSecurityTrustResourceUrl(url));
  }

}
