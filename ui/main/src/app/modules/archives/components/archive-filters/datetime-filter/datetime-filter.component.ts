import { Component, OnInit, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, FormGroup, FormControl,
  Validators,
  AbstractControl,
  ValidationErrors,
  NG_VALUE_ACCESSOR,
  NG_VALIDATORS,
  Validator} from '@angular/forms';

@Component({
  selector: 'of-datetime-filter',
  templateUrl: './datetime-filter.component.html',
  styleUrls: ['./datetime-filter.component.css'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => DatetimeFilterComponent),
    multi: true
  }, {
   provide: NG_VALIDATORS,
   useExisting: forwardRef(() => DatetimeFilterComponent),
   multi: true
 }
]
})
export class DatetimeFilterComponent implements ControlValueAccessor, Validator {

  disabled = true;
  time = {hour: 0, minute: 0};
  @Input() filterPath: string;
  public datetimeForm: FormGroup = new FormGroup({
    date: new FormControl(),
    time: new FormControl()
  });
  constructor() {
    this.onChanges();
  }
  /* istanbul ignore next */
  public onTouched: () => void = () => {};
  /* istanbul ignore next */
  writeValue(val: any): void {
    val && this.datetimeForm.setValue(val, { emitEvent: false });
  }
  /* istanbul ignore next */
  registerOnChange(fn: any): void {
    this.datetimeForm.valueChanges.subscribe(fn);
  }
  /* istanbul ignore next */
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
  /* istanbul ignore next */
  setDisabledState?(isDisabled: boolean): void {
    isDisabled ? this.datetimeForm.disable() : this.datetimeForm.enable();
  }
  /* istanbul ignore next */
  validate(c: AbstractControl): ValidationErrors | null {
    return this.datetimeForm.valid ? null : { invalidForm: {valid: false, message: 'datetimeForm fields are invalid'}};
  }

  onChanges(): void {
    this.datetimeForm.get('date').valueChanges.subscribe(val => {
      if (val) {
        this.disabled = false;
      }
    });
  }

  onChange(event): void {
    if (event.target.value === '') {
      this.disabled = true;
      this.time = {hour: 0, minute: 0};
    }
  }

}
