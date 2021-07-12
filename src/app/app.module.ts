import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule} from '@angular/common/http';
import { AppComponent } from './app.component';
import { CarouselPauseComponent } from './carousel-pause/carousel-pause.component';
import { CarouselPauseComponentModule } from './carousel-pause/carousel-pause.module';
import { RouterModule } from '@angular/router';
import { DetailpageComponent } from './detailpage/detailpage.component';
import { NgbCarouselModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FooterComponent } from './footer/footer.component';
import { HeaderComponent } from './header/header.component';
import { FormsModule } from '@angular/forms';
import { YouTubePlayerModule } from '@angular/youtube-player';
import { MylistComponent } from './mylist/mylist.component';


const routes = [
  { path: '', component: CarouselPauseComponent},
  {
    path: 'watch/:type/:id',
    component: DetailpageComponent,
  },
  { path: 'mylist', component: MylistComponent}
];


@NgModule({
  declarations: [
    AppComponent,
    DetailpageComponent,
    FooterComponent,
    HeaderComponent,
    MylistComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    CarouselPauseComponentModule,
    RouterModule.forRoot(routes),
    RouterModule.forRoot(routes, {scrollPositionRestoration: 'enabled'}),
    NgbCarouselModule,
    NgbModule,
    FormsModule,
    YouTubePlayerModule,
  ],
  exports: [RouterModule],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
