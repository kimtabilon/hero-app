import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { NavController, AlertController } from '@ionic/angular';
import { tap } from 'rxjs/operators';
import { Storage } from '@ionic/storage';
import { EnvService } from './env.service';
import { AlertService } from './alert.service';

@Injectable({
  providedIn: 'root'
})

export class AuthService {
  isLoggedIn = false;
  token:any;
  customerId = '';

  constructor(
  	private http: HttpClient,
    private storage: Storage,
    private env: EnvService,
    private navCtrl: NavController,
    private alertService: AlertService,
    public alertController: AlertController,
  ) { }

  login(email: String, password: String) {
    return this.http.post(this.env.API_URL + 'customer/login',
      {email: email, password: password, app_key: this.env.APP_ID}
    ).pipe(
      tap(token => {
        this.storage.set('token', token)
        .then(
          () => {
            // console.log('Token Stored');
          },
          error => console.error('Error storing item', error)
        );
        this.token = token;
        this.isLoggedIn = true;
        return token;
      }),
    );

    /*return this.http.get(this.env.API_URL + 'customers/1').subscribe((response) => {
	    console.log(response);
	});*/
  }

  register(
  		first_name: String, 
  		middle_name: String, 
  		last_name: String, 
  		 
  		street: String, 
      barangay: String, 
      city: String, 
  		province: String, 
  		country: String, 
  		zip: String, 

  		birthmonth: String, 
  		birthday: String, 
  		birthyear: String, 
      gender: String, 
  		
  		phone_number: String, 

  		email: String,
  		password: String, 
  		password_confirm: String
  		) {
    return this.http.post(this.env.API_URL + 'customer/register',
      {
      	first_name: first_name, 
      	middle_name: middle_name, 
      	last_name: last_name, 
      	 
      	street: street, 
      	barangay: barangay, 
        city: city, 
      	province: province, 
      	country: country, 
      	zip: zip, 

      	birthmonth: birthmonth, 
      	birthday: birthday, 
      	birthyear: birthyear, 
        gender: gender, 
      	phone_number: phone_number, 

      	email: email,
      	password: password,
      	password_confirm: password_confirm,
        app_key: this.env.APP_ID
      }
    )
  }

  logout() {
    this.storage.get('customer').then((val) => {
      let user:any = val.data;
      this.log(user.id, 'logout', 'You have been successfully logged out!');
    });
    
    this.storage.remove("token");
    this.storage.remove("customer");
    this.isLoggedIn = false;
    delete this.token;
    return '';
  }

  getToken() {
    return this.storage.get('token').then(
      data => {
        this.token = data;
        if(this.token != null) {
          this.isLoggedIn=true;
        } else {
          this.isLoggedIn=false;
        }
      },
      error => {
        this.token = null;
        this.isLoggedIn=false;
      }
    );
  }

  log(user_id, type, label) {

    this.storage.get('app').then((val) => {
      let app:any = val.data;

      this.http.post(this.env.HERO_API + 'logs/save', 
          { 
            app_id: app.id,
            user_id: user_id, 
            type: type,
            label: label
          }
        )
        .subscribe(data => { 
          let response:any = data;
        },error => { 
          this.alertService.presentToast("Server not responding!");
          console.log(error);
        },() => { 
      });
    }); 
        
  }

  http_error(error) {
    if(error.error) {
      let err:any = error.error;
      let label:any = '';
      label = err.message + ' at line '+ err.line +' in '+err.file;
      this.log('0', 'system_error', label);
    }
  }
}
