import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ModalVideoService {

  public event = new Subject<boolean>();

  constructor() { }

  abrirModal() {
    this.event.next(true);
  }

  cerrarModal() {
    this.event.next(false);
  }
}
