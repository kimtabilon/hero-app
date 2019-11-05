import { Component, OnInit } from '@angular/core';
import { ModalController, NavController, AlertController } from '@ionic/angular';
import { LoginPage } from '../login/login.page';
import { AuthService } from 'src/app/services/auth.service';
import { NgForm, Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { AlertService } from 'src/app/services/alert.service';
import { Storage } from '@ionic/storage';
import { LoadingService } from 'src/app/services/loading.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { EnvService } from 'src/app/services/env.service';
import { UsernameValidator } from '../validators/username.validator';
import { PhoneValidator } from '../validators/phone.validator';
import { PasswordValidator } from '../validators/password.validator';
import { CountryPhone } from './country-phone.model';
import { OrderPipe } from 'ngx-order-pipe';
import { IonicSelectableComponent } from 'ionic-selectable';
import { TermPage } from '../term/term.page';
import { PrivacyPage } from '../privacy/privacy.page';

class Port {
  public id: number;
  public name: string;
}

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {
  validations_form: FormGroup;
  matching_passwords_group: FormGroup;
  country_phone_group: FormGroup;

  countries: Array<CountryPhone>;
  genders: Array<string>;

  provinces:any = [];
  cities:any = [];
  barangays:any = [];

  eightenyearsAgo:any = '';

  signup_btn:any = 'SIGN UP';

  constructor(
    private http: HttpClient,
    private modalController: ModalController,
    private authService: AuthService,
    private navCtrl: NavController,
    private alertService: AlertService,
    private storage: Storage,
    public loading: LoadingService,
    private env: EnvService,
    public formBuilder: FormBuilder,
    private orderPipe: OrderPipe,
    public alertCtrl: AlertController,
  ) {
  }

  ngOnInit() {
    fetch('./assets/json/refprovince.json').then(res => res.json())
    .then(json => {
      // console.log(json.RECORDS);
      this.provinces = this.orderPipe.transform(json.RECORDS, 'provDesc');
    });

    this.countries = [
      new CountryPhone('PH', 'PHILIPPINES')
    ];

    this.genders = [
      "Male",
      "Female"
    ];

    this.matching_passwords_group = new FormGroup({
      password: new FormControl('', Validators.compose([
        Validators.minLength(5),
        Validators.required,
        Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])[a-zA-Z0-9]+$')
      ])),
      confirm_password: new FormControl('', Validators.required)
    }, (formGroup: FormGroup) => {
      return PasswordValidator.areEqual(formGroup);
    });

    let country = new FormControl(this.countries[0], Validators.required);
    let phone = new FormControl('', Validators.compose([
      Validators.required,
      PhoneValidator.validCountryPhone(country)
    ]));
    this.country_phone_group = new FormGroup({
      country: country,
      phone: phone
    });

    this.validations_form = this.formBuilder.group({
      // username: new FormControl('', Validators.compose([
      //   UsernameValidator.validUsername,
      //   Validators.maxLength(25),
      //   Validators.minLength(5),
      //   Validators.pattern('^(?=.*[a-zA-Z])(?=.*[0-9])[a-zA-Z0-9]+$'),
      //   Validators.required
      // ])),
      // first_name: new FormControl('', Validators.required),
      first_name: new FormControl('', Validators.compose([
        Validators.required,
        Validators.pattern('[a-zA-Z]+')
      ])),
      middle_name: new FormControl(''),
      last_name: new FormControl('', Validators.compose([
        Validators.required,
        Validators.pattern('[a-zA-Z]+')
      ])),
      birthday: new FormControl('', Validators.required),
      birthyear: new FormControl('', Validators.required),
      birthmonth: new FormControl('', Validators.required),
      gender: new FormControl('', Validators.required),
      country_phone: this.country_phone_group,
      street: new FormControl('', Validators.required),
      barangay: new FormControl('', Validators.required),
      city: new FormControl('', Validators.required),
      province: new FormControl('', Validators.required),
      country: new FormControl('PHILIPPINES', Validators.required),
      zip: new FormControl('', Validators.compose([
        Validators.required,
        Validators.maxLength(4),
        Validators.minLength(4),
        Validators.pattern('[0-9]+')
      ])),

      email: new FormControl('', Validators.compose([
        Validators.required,
        Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')
      ])),
      matching_passwords: this.matching_passwords_group,
      // terms: new FormControl(true, Validators.pattern('true'))
    });
  }

  validation_messages:any = {
    // 'username': [
    //   { type: 'required', message: 'Username is required.' },
    //   { type: 'minlength', message: 'Username must be at least 5 characters long.' },
    //   { type: 'maxlength', message: 'Username cannot be more than 25 characters long.' },
    //   { type: 'pattern', message: 'Your username must contain only numbers and letters.' },
    //   { type: 'validUsername', message: 'Your username has already been taken.' }
    // ],
    'first_name': [
      { type: 'required', message: 'First name is required.' },
      { type: 'pattern', message: 'Your firstname must contain only letters.' }
    ],
    'last_name': [
      { type: 'required', message: 'Last name is required.' },
      { type: 'pattern', message: 'Your lastname must contain only letters.' }
    ],
    'birthday': [
      { type: 'required', message: 'Birthday is required.' }
    ],
    'birthyear': [
      { type: 'required', message: 'Year is required.' }
    ],
    'birthmonth': [
      { type: 'required', message: 'Month is required.' }
    ],
    'email': [
      { type: 'required', message: 'Email is required.' },
      { type: 'pattern', message: 'Please enter a valid email.' }
    ],
    'phone': [
      { type: 'required', message: 'Phone is required.' },
      { type: 'validCountryPhone', message: 'The phone is incorrect.' }
    ],
    'street': [
      { type: 'required', message: 'Street is required.' }
    ],
    'barangay': [
      { type: 'required', message: 'Barangay is required.' }
    ],
    'city': [
      { type: 'required', message: 'City is required.' }
    ],
    'province': [
      { type: 'required', message: 'Province is required.' }
    ],
    'country': [
      { type: 'required', message: 'Country is required.' }
    ],
    'zip': [
      { type: 'required', message: 'Zip is required.' },
      { type: 'minlength', message: 'Zip must be at least 4 characters long.' },
      { type: 'maxlength', message: 'Zip cannot be more than 4 characters long.' },
      { type: 'pattern', message: 'Your zip must contain only numbers.' }
    ],
    'password': [
      { type: 'required', message: 'Password is required.' },
      { type: 'minlength', message: 'Password must be at least 5 characters long.' },
      { type: 'pattern', message: 'Your password must contain at least one uppercase, one lowercase, and one number.' }
    ],
    'confirm_password': [
      { type: 'required', message: 'Confirm password is required.' }
    ],
    'matching_passwords': [
      { type: 'areEqual', message: 'Password mismatch.' }
    ],
    'terms': [
      { type: 'pattern', message: 'You must accept terms and conditions.' }
    ],
  };

  tapProvince(event){ 
    let province:any = event.value;
    fetch('./assets/json/refcitymun.json').then(res => res.json())
    .then(json => {
      let records:any = json.RECORDS
      this.cities = records.filter(item => item.provCode === province.provCode);
      this.cities = this.orderPipe.transform(this.cities, 'citymunDesc');
    });
  };

  tapCity(event){ 
    let city:any = event.value;
    fetch('./assets/json/refbrgy.json').then(res => res.json())
    .then(json => {
      let records:any = json.RECORDS
      this.barangays = records.filter(item => item.citymunCode === city.citymunCode);
      this.barangays = this.orderPipe.transform(this.barangays, 'brgyDesc');
    });
  };

  tapBarangay(event){ 
  };

  async notifyEmailExist() {
    let alert = await this.alertCtrl.create({
      header: 'Email Issue',
      message: 'Email already used.',
      buttons: [
        {
          text: 'Cancel',
          handler: () => {
            this.navCtrl.navigateRoot('/login');
          }
        },
        {
          text: 'Try Again',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            
          }
        }
      ]
    });
    await alert.present();
  }

  async notifyRegistrationSuccess(email, password) {
    let alert = await this.alertCtrl.create({
      header: 'Success',
      message: 'You are now registered! Check your e-mail for account activation. If you don\'t receive an e-mail from us, tap Resend.',
      buttons: [
        {
          text: 'Resend',
          cssClass: 'secondary',
          handler: () => {
            this.notifyRegistrationSuccess(email, password);
            this.http.post(this.env.API_URL + 'customer/mail/resendactivation',{password: password, email: email, app_key: this.env.APP_ID})
              .subscribe(data => {
                  let response:any = data;
                  this.loading.dismiss();
                  this.alertService.presentToast("Check your Email for your Activation Link");
                  this.authService.log(response.data.id, 'resend_activation', 'Resend activation link');
              },error => { 
                console.log(error);
                this.authService.http_error(error);
                this.loading.dismiss();
                this.alertService.presentToast("Account not Found");
              });
          }
        },
        {
          text: 'Done',
          handler: (blah) => {
            this.navCtrl.navigateRoot('/login');
          }
        }
      ]
    });
    await alert.present();
  }

  onSubmit(values) {
    this.loading.present();
    // console.log(values);
    this.signup_btn = 'Please wait...';
    if(this.validations_form.valid) {

      this.http.post(this.env.API_URL + 'customer/mail/check',{email: values.email})
      .subscribe(data => {
        this.authService.register(
            values.first_name, 
            values.middle_name, 
            values.last_name, 
            
            values.street, 
            values.barangay.brgyDesc, 
            values.city.citymunDesc, 
            values.province.provDesc, 
            values.country, 
            values.zip, 

            values.birthmonth, 
            values.birthday, 
            values.birthyear, 
            values.gender, 
            values.country_phone.phone,   

            values.email, 
            values.matching_passwords.password,
            values.matching_passwords.confirm_password
          ).subscribe(
          data => {
            let response:any = data;
            console.log(response);
            this.authService.log(response.data.customer.id, 'registered', 'New account created');
            this.notifyRegistrationSuccess(values.email, values.matching_passwords.password);
          },
          error => {
            this.signup_btn = 'Try Again';
            this.loading.dismiss();
            this.alertService.presentToast('Email already exist.');
            console.log(error);
            this.authService.http_error(error);
          },
          () => {
            
          }
        );
      },error => { 
        this.notifyEmailExist();
        this.loading.dismiss(); 
        this.signup_btn = 'CREATE ACCOUNT';
        this.authService.http_error(error);  
      });

    } else {
      let message:any = 'Input all required fields. ';
      for (let key in this.validation_messages) {
        let validations:any = this.validation_messages[key];
        for (let index in validations) {
          let validation:any = validations[index];
          if(this.validations_form.get(key)!=null) {  
            if(this.validations_form.get(key).hasError(validation.type)){
              message += validation.message + ' ';
            }
          } else {
            message += validation.message + ' ';
          } 
        }
      }   
      this.loading.dismiss();
      this.alertService.presentToast(message);
    }
  }

  ionViewWillEnter() {

    let eightenyearsAgo = function(sp){
      let today:any = new Date();
      let dd:any = today.getDate();
      let mm:any = today.getMonth()+1; //As January is 0.
      let yyyy:any = today.getFullYear()-18;

      if(dd<10) dd='0'+dd;
      if(mm<10) mm='0'+mm;
      return (yyyy+sp+mm+sp+dd);
    };
    this.eightenyearsAgo = eightenyearsAgo('-');

    this.authService.getToken().then(() => {
      if(this.authService.isLoggedIn) {
        this.navCtrl.navigateRoot('/tabs/home');
      }
    });
    
  }

  async terms() {
    const modal = await this.modalController.create({
      component: TermPage,
      componentProps: { 
        user: {}
      }
    });

    modal.onDidDismiss()
      .then((data) => {
        let response:any = data;
    });

    return await modal.present();
  }

  async privacy() {
    const modal = await this.modalController.create({
      component: PrivacyPage,
      componentProps: { 
        user: {}
      }
    });

    modal.onDidDismiss()
      .then((data) => {
        let response:any = data;
    });

    return await modal.present();
  }

}
