import { Component, OnInit } from '@angular/core';
import { MenuController, NavController, ModalController, AlertController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { User } from 'src/app/models/user';
import { Profile } from 'src/app/models/profile';
import { AlertService } from 'src/app/services/alert.service';
import { EnvService } from 'src/app/services/env.service';
import { Storage } from '@ionic/storage';
import { LoadingService } from 'src/app/services/loading.service';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { HeroPage } from '../hero/hero.page';
import { ChatPage } from '../chat/chat.page';
import { ReviewPage } from '../review/review.page';

@Component({
  selector: 'app-jobview',
  templateUrl: './jobview.page.html',
  styleUrls: ['./jobview.page.scss'],
})
export class JobviewPage implements OnInit {

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
  job:any;
  hero:any;
  heroExist:any = false;
  attributes:any;
  form:any;
  formExist:any = false;

  enableCancel:any = false;
  enableNoshow:any = false;
  enableReview:any = false;
  
  status:any = '';
  photo:any = '';
  customer_info:any = [];
  customer_city:any;

  constructor(
  	private menu: MenuController, 
  	private authService: AuthService,
  	private navCtrl: NavController,
    private storage: Storage,
    private alertService: AlertService,
    public router : Router,
    public activatedRoute : ActivatedRoute,
    public loading: LoadingService,
    private http: HttpClient,
    private env: EnvService,
    public modalController: ModalController,
    public alertCtrl: AlertController
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
    // this.loading.present();
    this.storage.get('customer').then((val) => {
      this.user = val.data;
      this.profile = val.data.profile;

      let address:any = this.profile.addresses[0];

      if(address.city) { 
        this.customer_city = address.city;
      }

      if(this.profile.photo!==null) {
        this.photo = this.env.IMAGE_URL + 'uploads/' + this.profile.photo;
      } else {
        this.photo = this.env.DEFAULT_IMG;
      }
    });

    this.activatedRoute.queryParams.subscribe((res)=>{
      let job_id:any = res.job_id;

      this.http.post(this.env.HERO_API + 'jobs/byID',{id: job_id})
        .subscribe(data => {
            let response:any = data;
            this.job = response.data;
            this.attributes = JSON.parse(this.job.form_value);
            this.customer_info = JSON.parse(this.job.customer_info);
            this.status = this.job.status;

            if(this.job.form !== null) {
              this.form = this.job.form;
              this.formExist = true;
            }else{
              this.formExist = false;
            }

            if(this.job.hero !== null) {
              this.hero = this.job.hero;
              this.heroExist = true;
            } else {
              this.heroExist = false;
            }

            if(this.job.status == 'Cancelled' || 
               this.job.status == 'Completed' || 
               this.job.status == 'Waiting for Payment' ||
               this.job.status == 'Paid'
            ) {
              this.enableCancel = false;
            } else {
              this.enableCancel = true;
            }

            /*NOSHOW*/
            let curday = function(sp){
              let today:any = new Date();
              let dd:any = today.getDate();
              let mm:any = today.getMonth()+1; //As January is 0.
              let yyyy:any = today.getFullYear();

              if(dd<10) dd='0'+dd;
              if(mm<10) mm='0'+mm;
              return (yyyy+sp+mm+sp+dd);
            };

            let now:any = new Date();
            now.setMinutes(now.getMinutes() + 30); 

            let curtime:any = new Date(now);

            let schedtime:any = new Date(this.job.schedule_date+ ' ' +this.job.schedule_time);

            let curdate:any = new Date(curday('-')+' '+'00:00');
            let scheddate:any = new Date(this.job.schedule_date);

            if(curdate >= scheddate && curtime >= schedtime) {
              this.enableNoshow = true;
            } else {
              this.enableNoshow = false;
            }

            if(this.job.status == 'No Show : Client' || 
               this.job.status == 'No Show : Hero' || 
               this.job.status == 'Cancelled' || 
               this.job.status == 'Denied' || 
               this.job.status == 'Completed' ||
               this.job.status == 'Waiting for Payment' ||
               this.job.status == 'Paid'
            ) {
              this.enableNoshow = false;
            }

            if(this.job.status == 'Completed' ||
               this.job.status == 'Paid'
            ) { 
              this.checkExistingReview();
            }
        },error => { console.log(error); });    
    });

    // this.loading.dismiss();

  }

  checkExistingReview() {
    this.http.post(this.env.HERO_API + 'reviews/checkExisting',
       {
         job_id: this.job.id,
         hero_id: this.job.hero_id,
         from: 'client',
       }
    )
    .subscribe(data => {
      this.enableReview = true;
      let response:any = data;
      if(response.data.length) {
        this.enableReview = false;
      }
    },error => { 
      this.enableReview = true;
    },() => { });
  }

  tapBack() {
    this.loading.present();
    this.router.navigate(['/tabs/job'],{
      queryParams: {},
    }); 
    this.loading.dismiss();  
  }

  async tapCancel() {

    let alert = await this.alertCtrl.create({
      header: 'Cancel Job?',
      message: 'By tapping continue, the job will tag as Cancelled',
      buttons: [
        {
          text: 'Back',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            
          }
        }, {
          text: 'Continue',
          handler: () => {
            this.loading.present();
            this.http.post(this.env.HERO_API + 'jobs/cancel',{id: this.job.id})
              .subscribe(data => {
              },error => { 
                this.alertService.presentToast("Server no response");
                console.log(error);
              },() => { this.navCtrl.navigateRoot('/tabs/job'); }
            ); 
          }
        }
      ]
    });
    await alert.present();
  }

  async tapNoShow() {

    let alert = await this.alertCtrl.create({
      header: 'Hero not showing?',
      message: 'By tapping continue, the job will tag as No Show.',
      buttons: [
        {
          text: 'Back',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            
          }
        }, {
          text: 'Continue',
          handler: () => {
            this.loading.present();
            this.http.post(this.env.HERO_API + 'jobs/noshowhero',{id: this.job.id})
              .subscribe(data => {
              },error => { 
                this.alertService.presentToast("Server no response");
                console.log(error);
              },() => { this.navCtrl.navigateRoot('/tabs/job'); }
            ); 
          }
        }
      ]
    });
    await alert.present();
  }

  async findHero() {
    this.loading.present();
    console.log({app_key: this.env.APP_ID, id: this.job.form.option.id, schedule_date: this.job.schedule_date, schedule_time: this.job.schedule_time, customer_city: this.customer_city });
    
    this.http.post(this.env.HERO_API + 'options/heroes',{app_key: this.env.APP_ID, id: this.job.form.option.id, schedule_date: this.job.schedule_date, schedule_time: this.job.schedule_time, customer_city: this.customer_city })
      .subscribe(data => {
        let response:any = data; 
        // console.log(response);

        let heroes:any = response.data.heroes;
        if(heroes.length) { 
          this.showHeroes(heroes);
        } else {
          this.alertService.presentToast("No heroes found. Change schedule."); 
        }
        
        this.loading.dismiss();
      },error => { 
          console.log(error);  
          this.loading.dismiss();
      }
    );
  }

  async showHeroes(heroes) {
    this.job.form.option.heroes = heroes;

    const modal = await this.modalController.create({
      component: HeroPage,
      componentProps: { 
        input: {
          option_id : this.job.form.option.id,
          form_id : this.job.form.id,
          payper : this.job.amount,
          schedule_date: this.job.schedule_date,
          reapply: true
        },
        option: this.job.form.option,
        job: { 
          app_key: this.env.APP_ID, 
          customer_id: this.user.id, 
          form_id: this.form.id, 
          form_value: JSON.stringify(this.attributes), 
          customer_info: JSON.stringify(this.customer_info), 
          schedule_date: this.job.schedule_date, 
          schedule_time: this.job.schedule_time, 
          status: 'For Quotation',
          id: this.job.id
        }
      }
    });

    modal.onDidDismiss()
      .then((data) => {
        // const user = data['data']; // Here's your selected user!
        let response:any = data;
        // this.account.settings.block_dates = response.data.block_dates;
        // this.saveSettings();
    });

    return await modal.present();
  }

  async chatHero() {
    const modal = await this.modalController.create({
      component: ChatPage,
      componentProps: { 
        job: this.job,
        customer: this.profile
      }
    });

    modal.onDidDismiss()
      .then((data) => {
        let response:any = data;
    });

    return await modal.present();
  }

  async tapReview() {

    const modal = await this.modalController.create({
      component: ReviewPage,
      componentProps: { 
        job: this.job
      }
    });

    modal.onDidDismiss()
      .then((data) => {
        let response:any = data;
        this.enableReview = false;
    });

    return await modal.present();
  }

  async tapPayWithCash() {

    let alert = await this.alertCtrl.create({
      header: 'Pay with Cash',
      message: 'By tapping continue, provider must recieved the amount in cash',
      buttons: [
        {
          text: 'Back',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            
          }
        }, {
          text: 'Continue',
          handler: () => {
            this.loading.present();
            this.http.post(this.env.HERO_API + 'jobs/payCash',{id: this.job.id})
              .subscribe(data => {
              },error => { 
                this.alertService.presentToast("Server no response");
                console.log(error);
              },() => { this.navCtrl.navigateRoot('/tabs/job'); }
            ); 
          }
        }
      ]
    });
    await alert.present();
  }

  logout() {
    this.loading.present();
    this.authService.logout();
    this.alertService.presentToast('Successfully logout');  
    this.navCtrl.navigateRoot('/login');  
    this.loading.dismiss();
  }

}
