import { Component, OnInit, Input } from '@angular/core';
import { ModalController, AlertController } from '@ionic/angular';
import { EnvService } from 'src/app/services/env.service';

@Component({
  selector: 'app-profileview',
  templateUrl: './profileview.page.html',
  styleUrls: ['./profileview.page.scss'],
})
export class ProfileviewPage implements OnInit {

	@Input() user:any;
	img_link:any = '';
  address:any = '';
  name:any = '';
  photo:any = '';

  info:any = {
    eb: '',
    cert: '',
    we: ''
  }

  constructor(
  	public modalController: ModalController,
    public alertController: AlertController,
    private env: EnvService,
  ) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    console.log(this.user);
    this.img_link = this.env.IMAGE_URL + 'uploads/';
    this.photo = this.env.DEFAULT_IMG;

    let address:any = this.user.profile.addresses[0];
    let contact:any = this.user.profile.contacts[0];
    let profile:any = this.user.profile;
    let customer_address:any = '';
    let customer_contact:any = '';
    let customer_name:any = '';

    if(this.user.profile.photo!=null){ this.photo = this.img_link+this.user.profile.photo }

    if(address.street) { customer_address += address.street + ', '; }
    if(address.city) { customer_address += address.city + ', '; }
    if(address.province) { customer_address += address.province + ', '; }
    if(address.country) { customer_address += address.country + ' '; }
    if(address.zip) { customer_address += address.zip; }

    if(contact.dial_code) { customer_contact += contact.dial_code + ' '; }
    if(contact.number) { customer_contact += contact.number; }

    if(profile.first_name) { customer_name += profile.first_name + ' '; }
    if(profile.middle_name) { customer_name += profile.middle_name + ' '; }
    if(profile.last_name) { customer_name += profile.last_name; }

    this.address = customer_address;
    this.name = customer_name;

    console.log(this.user.hero_info);

    if(this.user.hero_info) {
      this.info = {
        eb: this.user.hero_info.educational_background,
        cert: this.user.hero_info.certification,
        we: this.user.hero_info.work_experience
      }
    }
  }

  parse(customer_info) {
    return JSON.parse(customer_info);
  }

  dismiss() {
    this.modalController.dismiss({
      'dismissed': true,
      input: {}
    });
  }

}
