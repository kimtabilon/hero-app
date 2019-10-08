import { Component, OnInit } from '@angular/core';
import { MenuController, NavController, AlertController, ActionSheetController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { User } from 'src/app/models/user';
import { Profile } from 'src/app/models/profile';
import { AlertService } from 'src/app/services/alert.service';
import { LoadingService } from 'src/app/services/loading.service';
import { GetService } from 'src/app/services/get.service';
import { Storage } from '@ionic/storage';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { EnvService } from 'src/app/services/env.service';

@Component({
  selector: 'app-inbox',
  templateUrl: './inbox.page.html',
  styleUrls: ['./inbox.page.scss'],
})
export class InboxPage implements OnInit {

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
  notifications:any = [];
  title:any = 'Please wait...';

  constructor(
    private http: HttpClient,
    private menu: MenuController, 
    private authService: AuthService,
    private navCtrl: NavController,
    private storage: Storage,
    private alertService: AlertService,
    public loading: LoadingService,
    public getService: GetService,
    public router : Router,
    private env: EnvService,
    public alertCtrl: AlertController,
    public actionSheetController: ActionSheetController,
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

    this.storage.get('customer').then((val) => {
      this.user = val.data;
      this.profile = val.data.profile;    
      if(this.profile.photo!==null) {
        this.photo = this.env.IMAGE_URL + 'uploads/' + this.profile.photo;
      } else {
        this.photo = this.env.DEFAULT_IMG;
      }
      
      /*Get My Jobs*/
      this.http.post(this.env.HERO_API + 'inboxes/byUser',{app_key: this.env.APP_ID, user_id: this.user.id})
        .subscribe(data => {
            let response:any = data;
            this.notifications = response.data;
            // console.log(this.notifications);
            this.title = 'My Inbox';
            this.loading.dismiss();
        },error => { 
            console.log(error); 
            this.title = 'My Inbox'; 
            this.loading.dismiss(); 
        });

    });
  }

  async tapNoti(noti) {
    let options:any = {
        buttons: [{
          text: 'Delete Notification',
          role: 'destructive',
          icon: 'trash',
          handler: () => {
            this.loading.present();
            this.http.post(this.env.HERO_API + 'inboxes/hide',{id: noti.id})
            .subscribe(data => {
                let response:any = data;
                noti.seen = 'Yes';
                this.loading.dismiss();
            },error => { this.loading.dismiss(); });
          }
        }, {
          text: 'Cancel',
          icon: 'close',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        }]
      };

    if(noti.type == 'Available Job' || noti.type == 'For Confirmation'){
       options = {
        buttons: [{
          text: 'View Job',
          icon: 'arrow-dropright-circle',
          handler: () => {
            switch (noti.type) {
              case "Available Job":
                this.router.navigate(['/tabs/quotation'],{
                    queryParams: {
                        job_id : noti.redirect_id,
                        noti_id: noti.id
                    },
                  });
                this.loading.dismiss();
                break;

              case "For Confirmation":
                this.router.navigate(['/tabs/jobview'],{
                    queryParams: {
                        job_id : noti.redirect_id,
                        noti_id: noti.id
                    },
                  });
                this.loading.dismiss();
                break;  

              default:
                this.loading.dismiss();
                break;
            }
          }
        }, {
          text: 'Delete Notification',
          role: 'destructive',
          icon: 'trash',
          handler: () => {
            this.loading.present();
            this.http.post(this.env.HERO_API + 'inboxes/hide',{id: noti.id})
            .subscribe(data => {
                let response:any = data;
                noti.seen = 'Yes';
                this.loading.dismiss();
            },error => { this.loading.dismiss(); });
          }
        }, {
          text: 'Cancel',
          icon: 'close',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        }]
      };
    }

    const actionSheet = await this.actionSheetController.create(options);
    await actionSheet.present();
      
  }

  logout() {
    this.loading.present();
    this.authService.logout();
    this.navCtrl.navigateRoot('/login');  
    this.loading.dismiss();
  }

}
