import { Injectable } from '@angular/core';
import { UserService } from '@ofServices/user.service';
import { AbstractControl, ValidationErrors } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class LoginValidatorService {

  constructor(
    private userService: UserService) {
  }

  isLoginAvailable(control: AbstractControl): Promise<ValidationErrors> | null {
    return new Promise((resolve, reject) => {
      this.userService.getAll().subscribe((response) => {
        if (response.filter(user => user.login === control.value).length > 0) {
          resolve({ shouldbeUnique: true });
        } else {
          resolve(null);
        }
      });
    });
  }
}
