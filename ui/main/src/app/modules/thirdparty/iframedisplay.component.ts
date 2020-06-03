

import {Component, OnInit} from '@angular/core';
import {DomSanitizer, SafeUrl} from "@angular/platform-browser";
import {ActivatedRoute} from '@angular/router';
import { ThirdsService } from '@ofServices/thirds.service';


@Component({
  selector: 'of-iframedisplay',
  templateUrl: './iframedisplay.component.html',
  styleUrls: ['./iframedisplay.component.scss']
})
export class IframeDisplayComponent implements OnInit {

  public iframeURL: SafeUrl;

  constructor(
              private sanitizer: DomSanitizer,
              private route: ActivatedRoute,
              private thirdService : ThirdsService
  ) { }

  ngOnInit() {
    this.route.paramMap.subscribe( paramMap => 
        this.thirdService.queryMenuEntryURL(paramMap.get("menu_id"),paramMap.get("menu_version"),paramMap.get("menu_entry_id"))
          .subscribe( url =>
              this.iframeURL = this.sanitizer.bypassSecurityTrustResourceUrl(url)
          )
    )
  }

}
