
import { Component, OnInit, Input } from '@angular/core';
import { Observable, of } from 'rxjs';
import { I18n } from '@ofModel/i18n.model';
import { TranslateService } from '@ngx-translate/core';
import { FormGroup, FormControl } from '@angular/forms';

@Component({
  selector: 'of-multi-filter',
  templateUrl: './multi-filter.component.html',
  styleUrls: ['./multi-filter.component.css']
})
export class MultiFilterComponent implements OnInit {

  preparedList: { value: string, label: Observable<string> }[];
  @Input() values: ({ value: string, label: (I18n | string) } | string)[];
  @Input() parentForm: FormGroup;

  @Input() filterPath: string;
  constructor(private translateService: TranslateService) {
    this.parentForm = new   FormGroup({
      [this.filterPath]: new FormControl()
    });
  }

  ngOnInit() {
    this.preparedList = [];
    if (this.values) {
      for (const v of this.values) {
        if (typeof v === 'string') {
          this.preparedList.push({value: v, label: of(v)});
        } else if (typeof v.label === 'string') {
          this.preparedList.push({value: v.value, label: of(v.label)});
        } else {
          this.preparedList.push({
            value: v.value,
            label: this.translateService.get(v.label.key, v.label.parameters)
          });
        }
      }
    }
  }

}
