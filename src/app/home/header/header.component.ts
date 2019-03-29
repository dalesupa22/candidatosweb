import { Component, OnInit } from '@angular/core';
import { ModalVideoService } from 'src/app/services/modal-video.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  constructor(private modalVideoService:ModalVideoService,private router: Router) { }

  ngOnInit() {
  }

  abrirModal() {
    this.modalVideoService.abrirModal();
  }

  redirect(pagename: string) {
    this.router.navigate(['/'+pagename]);
  }

}
