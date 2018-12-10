import {Component, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {FormControl, FormGroup} from "@angular/forms";
import {Store} from "@ngrx/store";
import {AppState} from '@state/app.interface';
import {TryToLogIn} from "@state/identification/identification.actions";

@Component({
  selector: 'app-log-in-form',
  providers: [],
  templateUrl: './login.component.html',
  styles: ['.button-row button {margin-right: 8px;}']
})
export class LoginComponent implements OnInit{

  public loginData = {username: "", password: ""};

  hide: boolean;
  userForm: FormGroup;


  constructor(
      // private authService: AuthService,
              private router: Router,
      private store: Store<AppState>) {}

  ngOnInit() {
    this.hide = true;
    this.userForm = new FormGroup({
        identifier: new FormControl(''),
        password: new FormControl('')
      }
    );
  }

  onSubmit(): void {
    if (this.userForm.valid) {
      const username = this.userForm.get('identifier').value;
      const password = this.userForm.get('password').value;
        this.store.dispatch(new TryToLogIn( {username: username, password: password}));
        // the following had to be done in an effect rather here
        this.router.navigateByUrl('/feed');
    }
  }

  resetForm(): void {
    this.userForm.reset();
  }

}
