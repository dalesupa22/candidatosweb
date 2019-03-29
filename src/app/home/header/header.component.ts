import { Component, OnInit } from '@angular/core';
import { ModalVideoService } from 'src/app/services/modal-video.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  constructor(private modalVideoService:ModalVideoService) { }

  ngOnInit() {
  }

  abrirModal() {
    this.modalVideoService.abrirModal();
  }

}
