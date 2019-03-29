import { Component, OnInit, Input } from '@angular/core';
import { ModalVideoService } from 'src/app/services/modal-video.service';
import { tap } from 'rxjs/operators';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-modal-video',
  templateUrl: './modal-video.component.html',
  styles: []
})
export class ModalVideoComponent implements OnInit {
  show = false;

  @Input() urlVideo: string;

  urlSafe: any;

  constructor(private modalVideoService:ModalVideoService,
    private sanitizer: DomSanitizer) { }

  ngOnInit() {
    this.modalVideoService.event.pipe(
      tap(show => this.show = show),
    ).subscribe();

    this.urlSafe = this.sanitizer.bypassSecurityTrustResourceUrl(this.urlVideo);
  }

  cerrarModal(){
    this.modalVideoService.cerrarModal();
  }

}
