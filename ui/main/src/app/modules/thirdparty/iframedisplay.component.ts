
import {Component, OnInit} from '@angular/core';
import {selectMenuStateSelectedIframeURL,} from "@ofSelectors/menu.selectors";
import {Store} from "@ngrx/store";
import {AppState} from "@ofStore/index";
import {DomSanitizer, SafeUrl} from "@angular/platform-browser";

@Component({
  selector: 'of-iframedisplay',
  templateUrl: './iframedisplay.component.html',
  styleUrls: ['./iframedisplay.component.scss']
})
export class IframeDisplayComponent implements OnInit {

  private _selectedIframeURL: SafeUrl;

  constructor(private store: Store<AppState>,
              private sanitizer: DomSanitizer
  ) { }

  ngOnInit() {

    this.store.select(selectMenuStateSelectedIframeURL).subscribe( iframeURL => {
      this._selectedIframeURL = this.sanitizer.bypassSecurityTrustResourceUrl(iframeURL);
    })

  }

  get selectedIframeURL(): SafeUrl {
    return this._selectedIframeURL;
  }

}
