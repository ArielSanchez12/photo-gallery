import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource, Photo as CameraPhoto } from '@capacitor/camera';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Preferences } from '@capacitor/preferences';

@Injectable({
  providedIn: 'root'
})
export class PhotoService {

  public photos: UserPhoto[] = [];
  private PHOTO_STORAGE: string = 'photos'; //toca aplicar una 'clave' para guardar 

  constructor() { }

  //Toma una nueva foto y la guarda
  public async addNewToGallery() {
    //Tomar foto desde la cámara
    const capturedPhoto = await Camera.getPhoto({
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      quality: 100
    });

    //Guardar en filesystem (como que en el localstorage del navegador)
    const savedImageFile = await this.savePicture(capturedPhoto);

    //Agregar al inicio cada foto nuevo
    this.photos.unshift(savedImageFile);

    //Guardar el arreglo completo en Preferences
    await Preferences.set({
      key: this.PHOTO_STORAGE,
      value: JSON.stringify(this.photos)
    });

    console.log('Foto capturada y guardada:', savedImageFile);
    return savedImageFile;
  }

  //Luego hay que cargar las fotos guardadas desde Preferences y Filesystem
  public async loadSaved() {
    //Devolvemos el array de fotos guardado en Preferences
    const { value } = await Preferences.get({ key: this.PHOTO_STORAGE });
    this.photos = (value ? JSON.parse(value) : []) as UserPhoto[];

    //Luego hay queleer cada foto desde el filesystem y reconstruir la ruta
    for (let photo of this.photos) {
      try {
        const readFile = await Filesystem.readFile({
          path: photo.filepath,
          directory: Directory.Data,
        });

        //usamos base64 para mostrar la imagen
        photo.webviewPath = `data:image/jpeg;base64,${readFile.data}`;
      } catch (error) {
        console.error('Error al leer la foto guardada:', error);
      }
    }

    console.log('Fotos cargadas desde almacenamiento:', this.photos);
  }

  //guardar cada foto en el filesystem
  private async savePicture(photo: CameraPhoto) {
    const base64Data = await this.readAsBase64(photo);

    const fileName = Date.now() + '.jpeg';
    await Filesystem.writeFile({
      path: fileName,
      data: base64Data,
      directory: Directory.Data
    });

    return {
      filepath: fileName,
      webviewPath: photo.webPath
    };
  }

  //Toca cnvertir las fotos a base64
  private async readAsBase64(photo: CameraPhoto) {
    const response = await fetch(photo.webPath!);
    const blob = await response.blob();

    return await this.convertBlobToBase64(blob) as string;
  }

  //ahora convertir un Blob a base64
  private convertBlobToBase64 = (blob: Blob) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      resolve(reader.result);
    };
    reader.readAsDataURL(blob);
  });
}

export interface UserPhoto {
  filepath: string;
  webviewPath?: string;
}
