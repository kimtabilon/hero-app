import { AfterViewInit, Component, ElementRef, OnInit, ViewChild, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
declare var google;

@Component({
  selector: 'app-direction',
  templateUrl: './direction.page.html',
  styleUrls: ['./direction.page.scss'],
})

export class DirectionPage implements OnInit, AfterViewInit {
  @ViewChild('mapElement') mapNativeElement: ElementRef;
  @ViewChild('directionsPanel') directionsPanel: ElementRef;

  directionsService = new google.maps.DirectionsService;
  directionsDisplay = new google.maps.DirectionsRenderer;

  @Input() customer_address:any;
  @Input() hero_address:any;

  constructor(
    public modalController: ModalController,
   ) { }

  ngOnInit() {

  }
  ngAfterViewInit(): void {
    const that = this;
    this.directionsDisplay.setPanel(this.directionsPanel.nativeElement);
    this.directionsService.route({
      origin: this.customer_address,
      destination: this.hero_address,
      travelMode: 'DRIVING'
    }, (response, status) => {
      if (status === 'OK') {
        console.log(response);
        this.directionsDisplay.setDirections(response);
      } else {
        window.alert('Directions request failed due to ' + status);
      }
    });

    const map = new google.maps.Map(this.mapNativeElement.nativeElement, {
      zoom: 7,
      center: {lat: 41.85, lng: -87.65}
    });
    this.directionsDisplay.setMap(map);
  }

  dismiss() {
    this.modalController.dismiss({
      'dismissed': true,
      input: {}
    });
  }
}
