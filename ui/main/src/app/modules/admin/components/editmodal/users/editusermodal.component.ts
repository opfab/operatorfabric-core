import { FormGroup, FormControl, Validators, AbstractControl } from '@angular/forms';
import { OnInit, Component, Input } from '@angular/core';
import { User } from '@ofModel/user.model';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { UserService } from '@ofServices/user.service';
import { DataTableShareService } from 'app/modules/admin/services/data.service';
import { GroupsService } from '@ofServices/groups.service';
import { EntitiesService } from '@ofServices/entities.service';
import { Entity } from '@ofModel/entity.model';
import { Group } from '@ofModel/group.model';
import { LoginValidatorService } from 'app/modules/admin/services/login-validator.service';

@Component({
  selector: 'of-editmodal',
  templateUrl: './editusermodal.component.html',
  styleUrls: ['./editusermodal.component.scss']
})
export class EditUsermodalComponent implements OnInit {

  form = new FormGroup({
    login: new FormControl(''
      , [Validators.required, Validators.minLength(4), Validators.maxLength(20)]
      , this.existsLogin.bind(this)),
    firstName: new FormControl('', [Validators.required, Validators.maxLength(20)]),
    lastName: new FormControl('', [Validators.required, Validators.maxLength(20)]),
    groups: new FormControl([]),
    entities: new FormControl([])
  });

  entitiesList: Array<Entity>;
  groupsList: Array<Group>;

  @Input() user: User;

  constructor(
    public activeModal: NgbActiveModal,
    private userService: UserService,
    private data: DataTableShareService,
    private groupsService: GroupsService,
    private entitesService: EntitiesService,
    private loginValidator: LoginValidatorService) {
  }

  ngOnInit() {
    if (this.user) {
      this.form.patchValue(this.user, { onlySelf: true });
    }
    this.initializeEntities();
    this.initializeGroups();
  }

  updateUser() {
  
    this.cleanForm(); 
    this.groups.setValue(this.groups.value.filter((item: string) => item.length > 0));
    this.entities.setValue(this.entities.value.filter((item: string) => item.length > 0));
    this.userService.update(this.form.value).subscribe(() => {
      this.data.changeMessage(this.form.value);
      this.activeModal.dismiss('Update click');
    });
  }

  private cleanForm() {
    if (this.user) {
      this.form.value['login'] = this.user.login;
    }
    this.login.setValue((this.login.value as string).trim());
    this.lastName.setValue((this.lastName.value as string).trim());
    this.firstName.setValue((this.firstName.value as string).trim());
  
  }

  get login() {
    return this.form.get('login') as FormControl;
  }

  get firstName() {
    return this.form.get('firstName') as FormControl;
  }

  get lastName() {
    return this.form.get('lastName') as FormControl;
  }

  get groups() {
    return this.form.get('groups') as FormControl;
  }

  get entities() {
    return this.form.get('entities') as FormControl;
  }



  private initializeEntities(): void {
    this.entitesService.getAll().subscribe(response => {
      this.entitiesList = response;
    });

  }

  private initializeGroups(): void {
    this.groupsService.getAll().subscribe(response => {
      this.groupsList = response;
    });

  }

  existsLogin(control: AbstractControl) {
    // if create
    if (!this.user) {
      return this.loginValidator.isLoginAvailable(control);
    } else {
      return new Promise((resolve) => {
        resolve(null);
      });
    }
  }

}
