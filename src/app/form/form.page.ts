import { Component, OnInit } from '@angular/core';
import { MenuController, NavController, ModalController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { User } from 'src/app/models/user';
import { Profile } from 'src/app/models/profile';
import { AlertService } from 'src/app/services/alert.service';
import { EnvService } from 'src/app/services/env.service';
import { Storage } from '@ionic/storage';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LoadingService } from 'src/app/services/loading.service';
import { HeroPage } from '../hero/hero.page';
import { InclusionPage } from '../inclusion/inclusion.page';

@Component({
  selector: 'app-form',
  templateUrl: './form.page.html',
  styleUrls: ['./form.page.scss'],
})
export class FormPage implements OnInit {

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

  customer_info:any = {
    name: '',
    address: '',
    photo: ''
  }

  customer_city:any;
  customer_province:any;

  schedule_date:any = '';
  schedule_time:any = '';

  form:any = [];
  title:any = 'Please wait...';
  quote_enable:any;
  attributes:any = [];
  heroes:any = [];
  job:any = [];
  payType:any;
  payper:any = 1;
  option:any = [];
  photo:any = '';

  option_id:any;
  service_id:any;
  category_id:any;

  current_date:any = '';
  next_year:any = '';
  current_time:any = '';

  button_text:any = 'Loading...';

  constructor(
    private menu: MenuController, 
    private authService: AuthService,
    private navCtrl: NavController,
    private storage: Storage,
    private alertService: AlertService,
    public router : Router,
    public loading: LoadingService,
    public activatedRoute : ActivatedRoute,
    private http: HttpClient,
    private env: EnvService,
    public modalController: ModalController,
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
    this.schedule_date = '';
    this.schedule_time = '';
    let curday = function(sp){
      let today:any = new Date();
      let dd:any = today.getDate();
      let mm:any = today.getMonth()+1; //As January is 0.
      let yyyy:any = today.getFullYear();

      if(dd<10) dd='0'+dd;
      if(mm<10) mm='0'+mm;
      return (yyyy+sp+mm+sp+dd);
    };

    let nextYear = function(sp){
      let today:any = new Date();
      let dd:any = today.getDate();
      let mm:any = today.getMonth()+1; //As January is 0.
      let yyyy:any = today.getFullYear()+1;

      if(dd<10) dd='0'+dd;
      if(mm<10) mm='0'+mm;
      return (yyyy+sp+mm+sp+dd);
    };

    this.current_date = curday('-');
    this.next_year = nextYear('-');

    this.storage.get('customer').then((val) => {
      this.user = val.data;
      this.profile = val.data.profile;

      if(this.profile.photo!==null) {
        this.photo = this.env.IMAGE_URL + 'uploads/' + this.profile.photo;
      } else {
        this.photo = this.env.DEFAULT_IMG;
      }

      let address:any = this.profile.addresses[0];
      let contact:any = this.profile.contacts[0];
      let profile:any = this.profile;
      let customer_address:any = '';
      let customer_contact:any = '';
      let customer_name:any = '';

      if(address.street) { customer_address += address.street + ', '; }
      if(address.city) { 
        customer_address += address.city + ', '; 
        this.customer_city = address.city;
      }
      if(address.province) { 
        customer_address += address.province + ', '; 
        this.customer_province = address.province;
      }
      if(address.country) { customer_address += address.country + ' '; }
      if(address.zip) { customer_address += address.zip; }

      if(contact.dial_code) { customer_contact += contact.dial_code + ' '; }
      if(contact.number) { customer_contact += contact.number; }

      if(profile.first_name) { customer_name += profile.first_name + ' '; }
      if(profile.middle_name) { customer_name += profile.middle_name + ' '; }
      if(profile.last_name) { customer_name += profile.last_name; }

      this.customer_info = {
        name: customer_name,
        address: customer_address,
        photo: this.photo,
        // contact: customer_contact
      }

    });

    this.activatedRoute.queryParams.subscribe((res)=>{
      this.option_id = res.option_id;
      this.service_id = res.service_id;
      this.category_id = res.category_id;
      this.payType = res.payType;

      this.http.post(this.env.HERO_API + 'options/byID',{app_key: this.env.APP_ID, id: this.option_id })
        .subscribe(data => {
          let response:any = data;
          if(response!==null) {
            this.option = response.data;
            this.form = this.option.form;
            this.title = this.option.name;
            this.quote_enable = this.option.enable_quote;
            this.attributes = JSON.parse(this.form.attributes);  
            this.payper = this.option.min;

            if(this.quote_enable == 'No') {
              this.button_text = 'Find Hero';
            } else {
              this.button_text = 'Request Quote';
            }
          }
          this.loading.dismiss();
          
        },error => { 
          console.log(error); 
          this.loading.dismiss(); 
        }
      );
    });

  }

  tapBack() {
    this.form = [];
    this.customer_info = [];
    this.router.navigate(['/tabs/option'],{
      queryParams: {
        category_id : this.category_id,
        service_id : this.service_id
      },
    });   
  }

  requestQuote() {
    this.loading.present();

    let error:any = 0;
    let message:any = '';

    if(this.schedule_date == '' || this.schedule_time=='') {
      error++;
      message+= "REQUIRED: DATE AND TIME. ";
    }

    // console.log(this.attributes);

    this.attributes.forEach((a) => {   
      a.fields.forEach((f) => {   
          if(f.required) {
            if(f.input==null) {
              error++;
              message+= 'Required field '+ f.label + '. ';
            }
          }
      });
    });

    if(error == 0) {
      this.button_text = 'Searching for Hero...';
      this.http.post(this.env.HERO_API + 'options/heroes',
        {
           app_key: this.env.APP_ID, 
           id: this.option.id, 
           schedule_date: this.schedule_date, 
           schedule_time: this.schedule_time, 
           customer_city: this.customer_city,
           customer_province: this.customer_province,
           hours:0, 
        })
        .subscribe(data => {
          let response:any = data;
          this.heroes = response.data.heroes;
          
          if(this.heroes.length) {
             this.button_text = 'Sending Job to Available Heroes...';
             this.http.post(this.env.HERO_API + 'jobs/create',
                { app_key: this.env.APP_ID, 
                  customer_id: this.user.id, 
                  hero_id: '', 
                  amount: '', 
                  form_id: this.form.id, 
                  form_value: JSON.stringify(this.attributes), 
                  customer_info: JSON.stringify(this.customer_info), 
                  schedule_date: this.schedule_date, 
                  schedule_time: this.schedule_time, 
                  status: 'For Quotation',
                  customer_city: this.customer_city,
                  customer_province: this.customer_province
                }
              ).subscribe(
                  data => {
                    this.job = data;
                  },
                  error => {
                    console.log(error);
                    this.alertService.presentToast("Server not responding!"); 
                  },
                  () => {
                      this.alertService.presentToast("Your Job Request has been sent to all Heroes. Please wait for the quotation."); 
                      this.router.navigate(['/tabs/job'],{
                        queryParams: {
                          // service : JSON.stringify({ 
                          //   name: this.title,
                          //   amount: '0',
                          //   provider: '',
                          //   status: 'For Quotation'
                          // })
                        },
                      });
                    
                  }
                );
          } else {
            this.button_text = 'Try Again';
            this.alertService.presentToast("No heroes found. Change schedule date."); 
          }
        },error => { 
          console.log(error);  
      });
    } else {
      this.alertService.presentToast(message); 
      this.loading.dismiss();
    }
  }

  async findHero() {
    this.loading.present();

    let error:any = 0;
    let message:any = '';

    let selected_date:any = this.schedule_date.substring(0,10);
    let current_date:any = this.current_date;

    if(selected_date == current_date) {
      let selected_time:any = this.currentTime(new Date(this.schedule_time));
      let current_time:any = this.timePlusTwoHours(new Date);

      selected_time = new Date(selected_date+ ' ' +selected_time);
      current_time = new Date(selected_date+ ' ' +current_time);

      if(selected_time < current_time) {
        error++;
        message+= "Scheduled time must be two (2) hours ahead if booking is on the same day.";
      }
    }

    if(this.schedule_date == '' || this.schedule_time=='') {
      error++;
      message+= "Required Schedule Date & Time. ";
    }

    if( this.payper > (this.option.max * 1 ) ) {
      error++;
      message+= "Maximum of "+this.option.max+" hour/s. ";
    }

    if( this.payper < (this.option.min * 1 ) ) {
      error++;
      message+= "Minimum of "+this.option.min+" hour/s. ";
    }

    if( this.payper == '' || this.payper == null || this.payper == 0  ) {
      error++;
      message+= "Number of hours is required. ";
    }

    // console.log(this.attributes);

    this.attributes.forEach((a) => {   
      a.fields.forEach((f) => {   
          if(f.required) {
            if(f.input==null) {
              error++;
              message+= 'Required field '+ f.label + '. ';
            }
          }
      });
    });

    if(error == 0) {
      console.log({
          app_key: this.env.APP_ID, 
          id: this.option.id, 
          schedule_date: this.schedule_date, 
          schedule_time: this.schedule_time, 
          customer_city: this.customer_city,
          customer_province: this.customer_province,
          hours: this.payper,  
        });
      this.button_text = 'Searching for Hero...';
      this.http.post(this.env.HERO_API + 'options/heroes',
        {
          app_key: this.env.APP_ID, 
          id: this.option.id, 
          schedule_date: this.schedule_date, 
          schedule_time: this.schedule_time, 
          customer_city: this.customer_city,
          customer_province: this.customer_province,
          hours: this.payper,  
        })
        .subscribe(data => {
          let response:any = data; 
          let heroes:any = response.data.heroes;
          if(heroes.length) { 
            this.showHeroes(heroes);
            this.button_text = 'Find Hero';
          } else {
            this.button_text = 'Try Again';
            this.alertService.presentToast("No heroes found. Change schedule."); 
          }
          
          this.loading.dismiss();
        },error => { 
            console.log(error);  
            this.loading.dismiss();
        }
      );
    } else {
      this.alertService.presentToast(message); 
      this.loading.dismiss();
    }
  }

  async showHeroes(heroes) {
    this.option.heroes = heroes;

    const modal = await this.modalController.create({
      component: HeroPage,
      componentProps: { 
        input: {
          category_id : this.category_id,
          service_id : this.service_id,
          option_id : this.option_id,
          form_id : this.form.id,
          payper : this.payper,
          schedule_date: this.schedule_date,
          reapply: false
        },
        option: this.option,
        job: { 
          app_key: this.env.APP_ID, 
          customer_id: this.user.id, 
          form_id: this.form.id, 
          form_value: JSON.stringify(this.attributes), 
          customer_info: JSON.stringify(this.customer_info), 
          schedule_date: this.schedule_date, 
          schedule_time: this.schedule_time, 
          status: 'For Quotation',
          customer_city: this.customer_city,
          customer_province: this.customer_province
        }
      }
    });

    modal.onDidDismiss()
      .then((data) => {
        let response:any = data;
    });

    return await modal.present();
  }

  currentTime(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0'+minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
  }

  timePlusTwoHours(date) {
    var hours = date.getHours()+2;
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0'+minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
  }

  async showInclusion() {
    const modal = await this.modalController.create({
      component: InclusionPage,
      componentProps: { 
        form: this.form
      }
    });

    modal.onDidDismiss()
      .then((data) => {
      }
    );

    return await modal.present();
  }

  logout() {
    this.authService.logout();
    this.alertService.presentToast('Successfully logout');  
    this.navCtrl.navigateRoot('/login');  
  }

}
