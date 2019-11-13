import { Component, OnInit } from '@angular/core';
import { MenuController, NavController, ActionSheetController, ModalController } from '@ionic/angular';
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
import { ChatPage } from '../chat/chat.page';
import { DirectionPage } from '../direction/direction.page';

@Component({
  selector: 'app-job',
  templateUrl: './job.page.html',
  styleUrls: ['./job.page.scss'],
})
export class JobPage implements OnInit {

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
  jobs:any = [];
  jobpage:any = true;
  myjobstitle:any = 'Please wait..';
  completedtitle:any = 'Completed';
  photo:any = '';
  customer_address:any = '';

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
    public actionSheetController: ActionSheetController,
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

    this.jobpage = true;

    this.storage.get('customer').then((val) => {
      this.user = val.data;
      this.profile = val.data.profile;  

      let address:any = this.profile.addresses[0];
      // if(address.street) { this.customer_address += address.street + ', '; }
      if(address.barangay) { this.customer_address += address.barangay + ', '; }
      if(address.city) { this.customer_address += address.city + ', '; }
      if(address.province) { this.customer_address += address.province + ', '; }
      if(address.country) { this.customer_address += address.country + ' '; }

      if(this.profile.photo!==null) {
        this.photo = this.env.IMAGE_URL + 'uploads/' + this.profile.photo;
      } else {
        this.photo = this.env.DEFAULT_IMG;
      }  

      /*Get My Jobs*/
      this.http.post(this.env.HERO_API + 'customer/jobs',{customer_id: this.user.id, app_key: this.env.APP_ID})
        .subscribe(data => {
            let response:any = data;
            if(response !== null) {
              this.jobs = response.data;
            } else {
              this.jobs = [];
            }
            this.myjobstitle = 'My Jobs';
            this.loading.dismiss();
        },error => { 
          this.myjobstitle = 'My Jobs'; 
          this.loading.dismiss();
          console.log(error);
        });

    });
  }

  tapJob(job) { 
    this.loading.present();
    this.router.navigate(['/tabs/jobview'],{
        queryParams: {
            job_id : job.id
        },
      });
    this.loading.dismiss();
      
  }

  tapCompleted() {
    this.loading.present();
    this.jobpage = false;
    this.completedtitle = 'Please wait...'
    /*Get My Jobs*/
    this.http.post(this.env.HERO_API + 'customer/jobcompleted',{customer_id: this.user.id, app_key: this.env.APP_ID})
      .subscribe(data => {
          let response:any = data;
          if(response !== null) {
            this.jobs = response.data;
          } else {
            this.jobs = [];
          }
          this.completedtitle = 'Completed';
      },error => { this.completedtitle = 'Completed'; });
    this.loading.dismiss();  
  } 

  tapMyJobs() {
    this.loading.present();
    this.jobpage = true;
    this.myjobstitle = 'Please wait...';
    /*Get My Jobs*/
    this.http.post(this.env.HERO_API + 'customer/jobs',{customer_id: this.user.id, app_key: this.env.APP_ID})
      .subscribe(data => {
          let response:any = data;
          if(response !== null) {
            this.jobs = response.data;
          } else {
            this.jobs = [];
          }
          this.myjobstitle = 'My Jobs';
      },error => { this.myjobstitle = 'My Jobs'; });
    this.loading.dismiss();
  } 

  async presentActionSheet(job) {
    let btns:any = [];

    btns.push({
      text: 'View Details',
      icon: 'eye',
      handler: () => {
        this.loading.present();
        let route:any = '';
        switch (job.status) {
          case "For Quotation":
            route = '/tabs/quotation';
            break; 
          
          default:
            route = '/tabs/jobview';
            break;
        }

        this.router.navigate([route],{
          queryParams: {
              job_id : job.id
          },
        });
        this.loading.dismiss();
      }
    });

    if(job.status == 'Pending' || job.status == 'For Confirmation') {
      btns.push({
        text: 'Chat with Hero',
        icon: 'chatbubbles',
        handler: () => {
          this.openChat(job);        }
      });
    }

    // if(job.hero_id != '') {
    //   btns.push({
    //     text: 'Get Direction',
    //     icon: 'pin',
    //     handler: () => {
    //       this.getDirection(job);        }
    //   });
    // }

    btns.push({
      text: 'Cancel',
      icon: 'close',
      role: 'cancel',
      handler: () => {
        console.log('Cancel clicked');
      }
    });

    const actionSheet = await this.actionSheetController.create({ buttons: btns });
    await actionSheet.present();
  } 

  async openChat(job) {
    const modal = await this.modalController.create({
      component: ChatPage,
      componentProps: { 
        job: job,
        customer: JSON.parse(job.customer_info)
      }
    });

    modal.onDidDismiss()
      .then((data) => {
        let response:any = data;
    });

    return await modal.present();
  }

  async getDirection(job) {
    // console.log(job);
    let hero_address:any = '';
    let address:any = job.hero.profile.addresses[0];
    // if(address.street) { hero_address += address.street + ', '; }
    if(address.barangay) { hero_address += address.barangay + ', '; }
    if(address.city) { hero_address += address.city + ', '; }
    if(address.province) { hero_address += address.province + ', '; }
    if(address.country) { hero_address += address.country + ' '; }

    const modal = await this.modalController.create({
      component: DirectionPage,
      componentProps: { 
        customer_address: this.customer_address,
        hero_address: hero_address
      }
    });

    modal.onDidDismiss()
      .then((data) => {
        let response:any = data;
    });

    return await modal.present();
  }

  logout() {
    this.loading.present();
    this.authService.logout();
    this.navCtrl.navigateRoot('/login');  
    this.loading.dismiss();
  }

}
