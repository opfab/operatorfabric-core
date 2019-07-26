import {Component, Input, OnInit} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Action} from "@ofModel/thirds.model";
import {I18nService} from "@ofServices/i18n.service";
import {I18n} from "@ofModel/i18n.model";

@Component({
  selector: 'of-action',
  templateUrl: './action.component.html',
  styleUrls: ['./action.component.scss']
})
export class ActionComponent implements OnInit {

  @Input() readonly action:Action;
  @Input() readonly i18nPrefix:I18n;
  constructor(private httpClient: HttpClient, private i18n: I18nService) { }

  ngOnInit() {
  }

  submit(){
    const protocol = 'http://';
    const domain = 'localhost';
    const port = '8080';
    const instanceProcessId='TEST_process1';
    const state = 'firstState';
    const actionId = 'action1';
    const resource = `/process/${instanceProcessId}/states/${state}/actions/${actionId}`
    const url = `${protocol}${domain}:${port}/soapui-mock/test-process`;

this.httpClient.post(url
,this.action
    ).subscribe();
  }

}
