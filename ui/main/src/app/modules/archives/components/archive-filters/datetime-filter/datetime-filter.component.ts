
import { Component,Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, FormGroup, FormControl,
  NG_VALUE_ACCESSOR,
  } from '@angular/forms';

@Component({
  selector: 'of-datetime-filter',
  templateUrl: './datetime-filter.component.html',
  styleUrls: ['./datetime-filter.component.css'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => DatetimeFilterComponent),
    multi: true
  }
]
})
export class DatetimeFilterComponent implements ControlValueAccessor {

  disabled = true;
  time = {hour: 0, minute: 0};
  @Input() filterPath: string;
  public datetimeForm: FormGroup = new FormGroup({
    date: new FormControl(),
    time: new FormControl()
  });
  constructor() {
    this.onChanges();
    this.resetTime();

  }
  /* istanbul ignore next */
  public onTouched: () => void = () => {};
 
  // Methode call when archive-filter.component.ts set value to 0 
  writeValue(val: any): void {
    this.disabled = true;
    this.resetTime();
    val && this.datetimeForm.setValue(val, { emitEvent: false });
  }

  registerOnChange(fn: any): void {
    this.datetimeForm.valueChanges.subscribe(fn);
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    isDisabled ? this.datetimeForm.disable() : this.datetimeForm.enable();
  }



  // Set time to enable when a date has been set
  onChanges(): void {
    this.datetimeForm.get('date').valueChanges.subscribe(val => {
      if (val) {
        this.disabled = false;
      }
    });
  }

  // Set time to disable when date is empty 
  onChange(event): void {
    if (event.target.value === '') {
      this.disabled = true;
      this.resetTime();
    }
  }

  resetTime()
  {
    this.datetimeForm.get('time').setValue({hour: 0, minute: 0});
  }

}
