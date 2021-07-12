import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { CarouselPauseComponent } from './carousel-pause.component';
import {RouterModule} from '@angular/router';

@NgModule({
  imports: [BrowserModule, FormsModule, NgbModule, RouterModule],
  declarations: [CarouselPauseComponent],
  exports: [CarouselPauseComponent],
  bootstrap: [CarouselPauseComponent]
})
export class CarouselPauseComponentModule {}
