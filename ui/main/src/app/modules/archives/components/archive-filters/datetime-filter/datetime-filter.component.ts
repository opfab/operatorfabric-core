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

  readonlyInputs: boolean;
  @Input() filterPath: string;
  public datetimeForm: FormGroup = new FormGroup({
    date: new FormControl(),
    time: new FormControl()
  });
  constructor() {
    this.readonlyInputs = false;
  }

  public onTouched: () => void = () => {};

  writeValue(val: any): void {
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

  validate(c: AbstractControl): ValidationErrors | null {
    return this.datetimeForm.valid ? null : { invalidForm: {valid: false, message: 'datetimeForm fields are invalid'}};
  }

}
