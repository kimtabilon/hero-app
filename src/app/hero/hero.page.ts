import { Component, OnInit, Input, AfterViewInit } from '@angular/core';
import { ModalController, AlertController } from '@ionic/angular';
import { AlertService } from 'src/app/services/alert.service';
import { EnvService } from 'src/app/services/env.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LoadingService } from 'src/app/services/loading.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ProfileviewPage } from '../profileview/profileview.page';
import { PaymentPage } from '../payment/payment.page';
import { OrderPipe } from 'ngx-order-pipe';
declare var google;
@Component({
  selector: 'app-hero',
  templateUrl: './hero.page.html',
  styleUrls: ['./hero.page.scss'],
})
export class HeroPage implements OnInit, AfterViewInit {

  img_link:any = '';
  default_photo:any = '';

  @Input() input:any;
  @Input() option:any;
  @Input() job:any;
  @Input() customer_address:any;

  directionsService = new google.maps.DirectionsService;

  heroes:any = [];
  
  constructor(
    private alertService: AlertService,
    private http: HttpClient,
    public loading: LoadingService,
    private env: EnvService,
    public modalController: ModalController,
    public alertController: AlertController,
    public router : Router,
    private orderPipe: OrderPipe,
  ) {
  }

  ngOnInit() {

  }

  ionViewWillEnter() {
    this.showPaymentMethod();
    this.heroes = this.option.heroes;

    // console.log(this.heroes);
    this.img_link = this.env.IMAGE_URL + 'uploads/';
    this.default_photo = this.env.DEFAULT_IMG;
  }

  async showPaymentMethod() {
    const modal = await this.modalController.create({
      component: PaymentPage,
      componentProps: { 
        
      }
    });

    modal.onDidDismiss()
      .then((data) => {
        let response:any = data;
    });

    return await modal.present();
  }

  ngAfterViewInit(): void { 
    // console.log('loading distance...');
    for(let _hero of this.option.heroes) {
      // console.log('calculating route for '+_hero.email);
      let hero_address:any = '';
      let address:any = _hero.profile.addresses[0];
      // if(address.street) { hero_address += address.street + ', '; }
      if(address.barangay) { hero_address += address.barangay + ', '; }
      if(address.city) { hero_address += address.city + ', '; }
      if(address.province) { hero_address += address.province + ', '; }
      if(address.country) { hero_address += address.country + ' '; }

      _hero.location = hero_address;
      this.getRoute(_hero, this.customer_address, hero_address);
      // console.log(_hero);

    }
  }

  getRoute(hero, from, to) {
    this.directionsService.route({
      origin: from,
      destination: to,
      travelMode: 'DRIVING'
    }, (response, status) => {
      if (status === 'OK') {
        // console.log(response.routes[0].legs[0]);
        // this.directionsDisplay.setDirections(response);
        hero.route = response.routes[0].legs[0];
      } else {
        // window.alert('Directions request failed due to ' + status);
      }
    });
  }

  async selectHero(hero) {
    // this.loading.present();
    let amount:any = (hero.pivot.pay_per*1)*(this.input.payper*1);
    let booking_fee:any = (amount / 100) * this.env.BOOKING_FEE;

    this.job.hero_id = hero.id;
    this.job.amount = amount;
    this.job.hero_fee = amount - booking_fee;
    this.job.booking_fee = this.env.BOOKING_FEE;
    this.job.hours = this.input.payper;

    let photo:any = this.default_photo;
    if(hero.profile.photo != null) {
      photo = this.img_link+hero.profile.photo;
    } 

    if(hero.settings.auto_confirm) {
      this.job.status = "Pending";
    } else {
      this.job.status = "For Confirmation";
    }

    const alert = await this.alertController.create({
      header: 'You Selected a Hero',
      message: hero.profile.first_name +' ' + hero.profile.last_name + ' will be your hero for this job.',
      buttons: [
        {
          text: 'Dismiss',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            // console.log('Confirm Cancel: blah');

          }
        }, {
          text: 'Continue',
          handler: () => {
            this.loading.present();

            let job_url:any = this.env.HERO_API + 'jobs/create';

            if(this.input.reapply) {
              job_url = this.env.HERO_API + 'jobs/reapply';
            }

            this.http
              .post(job_url, this.job)
              .subscribe(
                data => {
                  // this.job = data;
                },
                error => {
                  this.loading.dismiss();
                  this.alertService.presentToast("Server not responding!"); 
                },
                () => {
                  // this.alertService.presentToast("Please wait for confirmation!"); 
                  this.modalController.dismiss({
                    'dismissed': true,
                    input: this.input
                  });

                  this.router.navigate(['/tabs/summary'],{ 
                    queryParams: {
                      service : JSON.stringify({ 
                        name: this.option.service.name + ' - ' + this.option.name,
                        amount: amount,
                        provider: hero.profile.first_name + ' ' + hero.profile.last_name,
                        status: this.job.status,
                        photo: photo
                      })
                    },
                  });
                  this.loading.dismiss();
                }
              );

          }
        }
      ]
    });

    await alert.present();

    
  }

  async view(hero) {
    const modal = await this.modalController.create({
      component: ProfileviewPage,
      componentProps: { 
        user: hero
      }
    });

    modal.onDidDismiss()
      .then((data) => {
        let response:any = data;
    });

    return await modal.present();
  }

  dismiss() {
    this.modalController.dismiss({
      'dismissed': true,
      input: this.input
    });
  }

  tapFilter(event){ 
    let filter:any = event.detail.value;
    // this.heroes.filter(item => item.citymunCode === city.citymunCode);
    switch (filter) {
      case "amount":
        this.heroes = this.orderPipe.transform(this.heroes, 'pivot.pay_per');
        break;

    case "ratings":
        this.heroes = this.orderPipe.transform(this.heroes, 'rating', true);
        break;    
      
      default:
        // code...
        break;
    }
  };

}
