import { Component } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { AlertService } from 'src/app/services/alert.service';
import { LoadingService } from 'src/app/services/loading.service';
import { Storage } from '@ionic/storage';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { EnvService } from 'src/app/services/env.service';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage {

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

  count:any = 0;

  constructor(
    private http: HttpClient,
  	private authService: AuthService,
    private storage: Storage,
    private alertService: AlertService,
    public loading: LoadingService,
    private env: EnvService,
  ) { 
  }

  ionViewWillEnter() {
    this.loading.present();

    this.storage.get('customer').then((val) => {
      this.user = val.data;
      this.profile = val.data.profile;  
      
      /*Get My Jobs*/
      this.http.post(this.env.HERO_API + 'inboxes/byUser',{app_key: this.env.APP_ID, user_id: this.user.id})
        .subscribe(data => {
            let response:any = data;
            this.count = response.data.length;
            this.loading.dismiss();
        },error => { 
            console.log(error); 
            this.loading.dismiss(); 
        });

    });
  }

  clearNoti() {
    this.count = 0;
  }
}
