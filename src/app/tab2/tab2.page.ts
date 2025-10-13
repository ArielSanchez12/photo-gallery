import { Component } from '@angular/core';
import { PhotoService } from '../services/photo';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: false,
})
export class Tab2Page {

  constructor(public photoService: PhotoService) { }

  //Se ejecuta cada vez que regreso a la pestaña para mostrar las fotos guardadas
  async ionViewWillEnter() {
    await this.photoService.loadSaved();
  }

  addPhotoToGallery() {
    this.photoService.addNewToGallery();
  }
}