import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-inclusion',
  templateUrl: './inclusion.page.html',
  styleUrls: ['./inclusion.page.scss'],
})
export class InclusionPage implements OnInit {

	@Input() form:any;

  constructor(
  	public modalController: ModalController,
  ) { }

  ngOnInit() {
  }

  dismiss() {
    this.modalController.dismiss({
      'dismissed': true,
      input: {}
    });
  }

}
