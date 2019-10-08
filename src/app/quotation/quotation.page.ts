import { Component, OnInit } from '@angular/core';
import { MenuController, NavController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { User } from 'src/app/models/user';
import { Profile } from 'src/app/models/profile';
import { AlertService } from 'src/app/services/alert.service';
import { EnvService } from 'src/app/services/env.service';
import { Storage } from '@ionic/storage';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LoadingService } from 'src/app/services/loading.service';

@Component({
  selector: 'app-quotation',
  templateUrl: './quotation.page.html',
  styleUrls: ['./quotation.page.scss'],
})
export class QuotationPage implements OnInit {
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
  title:any;
  job:any;
  quotations:any;
  photo:any = '';

  img_link:any = '';
  default_photo:any = '';
  
  constructor(
  	private menu: MenuController, 
  	private authService: AuthService,
  	private navCtrl: NavController,
    private storage: Storage,
    private alertService: AlertService,
    public router : Router,
    public activatedRoute : ActivatedRoute,
    private http: HttpClient,
    public loading: LoadingService,
    private env: EnvService
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
    });

    this.img_link = this.env.IMAGE_URL + 'uploads/';
    this.default_photo = this.env.DEFAULT_IMG;

    this.activatedRoute.queryParams.subscribe((res)=>{
        let job_id:any = res.job_id;
        let noti_id:any = res.noti_id;
        this.http.post(this.env.HERO_API + 'jobs/byID',{id: job_id})
          .subscribe(data => {
              let response:any = data;
              this.job = response.data;
              this.quotations = this.job.quotations;
              this.title = this.job.form.option.name;
              this.loading.dismiss();
        },error => { 
          this.authService.http_error(error);
          this.loading.dismiss();
          console.log(error); 
        });  
    });
  }

  tapHero(quote) {
    this.loading.present();
    this.http.post(this.env.HERO_API + 'jobs/modify',
        {
          job_id: this.job.id, 
          hero_id: quote.hero.id, 
          amount: quote.amount
        })
      .subscribe(
        data => {
          let response:any = data;
          this.authService.log(this.user.id, 'quotation_selected', 'You select a quotation');
          // this.job = response.data;

          let photo:any = this.env.DEFAULT_IMG;
          if(quote.hero.profile.photo!=null) {
            photo = this.img_link+quote.hero.profile.photo;
          }

          this.router.navigate(['/tabs/payment'],{ 
            queryParams: {
              service : JSON.stringify({ 
                name: this.job.form.option.service.name + ' - ' + this.job.form.option.name,
                amount: quote.amount,
                provider: quote.hero.profile.first_name + ' ' + quote.hero.profile.last_name,
                status: this.job.status,
                photo: photo
              })
            },
          });
        },
        error => {
          this.authService.http_error(error);
          this.alertService.presentToast("Server not responding!"); 
        },
        () => {
        }
      );
    this.loading.dismiss();
  }

  tapBack() {
    this.loading.present();
    this.router.navigate(['/tabs/inbox'],{
      queryParams: {},
    });   
    this.loading.dismiss();
  }

  logout() {
    this.loading.present();
    this.authService.logout();
    this.alertService.presentToast('Successfully logout');  
    this.navCtrl.navigateRoot('/login');  
    this.loading.dismiss();
  }

}
