import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';

@Component({
  selector: 'of-datetime-filter',
  templateUrl: './datetime-filter.component.html',
  styleUrls: ['./datetime-filter.component.css']
})
export class DatetimeFilterComponent implements OnInit {

  @Input() parentForm: FormGroup;
  time = {hour: 13, minute: 30};
  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.parentForm = this.fb.group({
      startNotificationD: '',
      startNotificationH: [this.time, Validators.required],
    });
  }

}
