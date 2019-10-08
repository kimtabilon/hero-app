import { Component, OnInit } from '@angular/core';
import { ModalController, NavController, AlertController } from '@ionic/angular';
import { RegisterPage } from '../register/register.page';
import { NgForm } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { LoadingService } from 'src/app/services/loading.service';
import { AlertService } from 'src/app/services/alert.service';
import { Storage } from '@ionic/storage';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { EnvService } from '../services/env.service';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { Market } from '@ionic-native/market/ngx';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  login_btn:any = 'LOGIN';

  constructor(
  	private modalController: ModalController,
    private authService: AuthService,
    private navCtrl: NavController,
    private alertService: AlertService,
    private storage: Storage,
    public loading: LoadingService,
    private http: HttpClient,
    private env: EnvService,
    private appVersion: AppVersion,
    private market: Market,
    public alertController: AlertController,
  ) { }

  ngOnInit() {
    
  }

  login(form: NgForm) {
    this.loading.present();

    if(form.value.email != '' && form.value.password != '') 
    {
      this.login_btn = 'Please wait...';
      this.authService.login(form.value.email, form.value.password).subscribe(
        data => {
          let response:any = data;
          this.loading.dismiss();
          this.storage.set('customer', data)
          this.login_btn = 'LOGIN';
          this.authService.log(response.data.id, 'login', 'You have been successfully logged in!');
        },
        error => {
          console.log(error);
          this.loading.dismiss();
          this.alertService.presentToast("Wrong Email/Password or Inactive account. ");
          this.login_btn = 'LOGIN';
          this.authService.http_error(error);
          // this.alertService.presentToast(error.message);
        },
        () => {
          this.navCtrl.navigateRoot('/tabs/home');
        }
      );
    } else {
      this.loading.dismiss();
      this.alertService.presentToast("Empty Email/Password");
    }
      
  }

  ionViewWillEnter() {
    this.authService.getToken().then(() => {
      if(this.authService.isLoggedIn) {
        this.navCtrl.navigateRoot('/tabs/home');
      }
    });
  }

}
