import { Component, OnInit } from '@angular/core';
import { Platform, MenuController, NavController, AlertController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { InitService } from '../services/init.service';
import { AlertService } from 'src/app/services/alert.service';
import { LoadingService } from 'src/app/services/loading.service';
import { Storage } from '@ionic/storage';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { EnvService } from 'src/app/services/env.service';
import { OneSignal } from '@ionic-native/onesignal/ngx';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

  user:any = {
    email: '',
    password: '',
    status: ''
  };  
  profile:any = {
    first_name: '',
    middle_name: '',
    last_name: '',
    birthday: '',
    gender: '',
    photo: ''
  };  
  photo:any = '';	
  categories:any = [];
  title:any = 'Please wait...';

  constructor(
    private platform: Platform,
  	private menu: MenuController, 
  	private authService: AuthService,
    private initService: InitService,
  	private navCtrl: NavController,
    public alertController: AlertController,
    private storage: Storage,
    private alertService: AlertService,
    public loading: LoadingService,
    public router : Router,
    private http: HttpClient,
    private env: EnvService,
    private oneSignal: OneSignal,
  ) { 
  	this.menu.enable(true);	
  }

  ngOnInit() {
    
  }

  doRefresh(event) {   
    this.ionViewWillEnter(); 

    setTimeout(() => {
      event.target.complete();
    }, 2000);
  }

  ionViewWillEnter() {
    this.loading.present(); 
    this.initService.checkNetwork();
    
    this.storage.get('customer').then((val) => {
      // console.log(val.data);
      this.user = val.data;
      this.profile = val.data.profile;

      if(this.profile.photo!==null) {
        this.photo = this.env.IMAGE_URL + 'uploads/' + this.profile.photo;
      } else {
        this.photo = this.env.DEFAULT_IMG;
      }

      if (this.platform.is('cordova')) {
        this.setupPush();
      }

      this.checkUser(this.user);
    });

    this.http.post(this.env.HERO_API + 'categories/all',{key: this.env.APP_ID})
      .subscribe(data => {
          let response:any = data;
          if(response !== null) {
            this.categories = response.data;
            this.title = "Services"; 
            if(this.categories.length == 1) {
              this.router.navigate(['/tabs/service'],{
                queryParams: {
                    category_id : this.categories[0].id
                },
              });
            }
          }

          this.loading.dismiss();
            
      },error => {
        console.log(error);
        this.loading.dismiss();
      });
  }

  tapCategory(category) {
    this.loading.present(); 
    if(category.services.length) {
      this.router.navigate(['/tabs/service'],{
        queryParams: {
            category_id : category.id
        },
      });
    } else {
      this.alertService.presentToast("No Service Available");
    }
    this.loading.dismiss();  
  }

  checkUser(user) {
    this.oneSignal.getIds().then((id) => {
      this.http
      .post(this.env.HERO_API + 'customer/login',{email: user.email, password:  user.password, player_id: id.userId})
      .subscribe(data => {
          let response:any = data;
          this.storage.set('customer', response);
          this.user = response.data;
      },error => { 
        this.logout();
        console.log(error); 
      });
    });
  }

  setupPush() {
    // I recommend to put these into your environment.ts
    this.oneSignal.startInit(this.env.ONESIGNAL_APP_ID, this.env.FCM_SENDER_ID);
 
    this.oneSignal.inFocusDisplaying(this.oneSignal.OSInFocusDisplayOption.None);
 
    // Notifcation was received in general
    this.oneSignal.handleNotificationReceived().subscribe(data => {
      
      let msg = data.payload.body;
      let title = data.payload.title;
      let response = data.payload.additionalData;
      // this.alertService.presentToast(JSON.stringify(response)); 
      switch (response.route) {
        case "jobview":
          this.showAlert(title, msg, 'Open Job', '/tabs/jobview', {job_id : response.id});
          break;
        
        default:
          this.showAlert(title, msg, 'Goto Inbox', '/tabs/inbox', {});
          break;
      }
      
    });
 
    // Notification was really clicked/opened
    this.oneSignal.handleNotificationOpened().subscribe(data => {
      // Just a note that the data is a different place here!
      let response = data.notification.payload.additionalData;
      // this.alertService.presentToast(JSON.stringify(response)); 

      switch (response.route) {
        case "jobview":
          this.router.navigate(['/tabs/jobview'],{
            queryParams: { job_id : response.id },
          });
          break;
        
        default:
          this.router.navigate(['/tabs/inbox'],{
            queryParams: {},
          });
          break;
      }

      // this.showAlert('Notification opened', 'You already read this before', additionalData.task);
    });
 
    this.oneSignal.endInit();
  }
 
  async showAlert(title, msg, task, route, params) {
    const alert = await this.alertController.create({
      header: title,
      subHeader: msg,
      buttons: [
        {
          text: `${task}`,
          handler: () => {
            this.router.navigate([route],{
              queryParams: params,
            });
          }
        }
      ]
    })
    alert.present();
  }

  logout() {
    this.loading.present(); 
    this.authService.logout();
    this.navCtrl.navigateRoot('/login');  
    this.loading.dismiss();
  }

}
