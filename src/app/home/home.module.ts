import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './layout/home.component';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { ModalVideoComponent } from './modal-video/modal-video.component';

@NgModule({
  declarations: [HomeComponent, HeaderComponent, FooterComponent, ModalVideoComponent],
  imports: [
    CommonModule
  ],
  exports: [HomeComponent]
})
export class HomeModule { }
