import {Component, OnChanges, OnInit} from '@angular/core';
import { ViewChild } from '@angular/core';
import { Service } from '../service/service';
import { NgbCarousel} from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import {BreakpointObserver} from '@angular/cdk/layout';


@Component({
  selector: 'app-carousel-pause',
  templateUrl: './carousel-pause.component.html',
  styleUrls: ['./carousel-pause.component.css']
})


export class CarouselPauseComponent implements OnChanges, OnInit{
  homePageData: any;
  continueWatchingNum: number;
  continueWatchingRow: number;

  popMovNum: number;
  popMovRow: number;
  topMovNum: number;
  topMovRow: number;
  trendMovNum: number;
  trendMovRow: number;

  popTvNum: number;
  popTvRow: number;
  topTvNum: number;
  topTvRow: number;
  trendTvNum: number;
  trendTvRow: number;

  col = 6;

  getNumberOfColumns(): number {
    return window.innerWidth >= 992 ? 6 : 1; // Adjust the breakpoint as needed
  }

  constructor(private breakpointObserver: BreakpointObserver, private service: Service, private router: Router) {

  }
  showcarouselIndicators = true;
  myListDisplayed: any[];
  paused = false;
  unpauseOnArrow = true;
  pauseOnIndicator = false;
  pauseOnHover = true;
  pauseOnFocus = true;
  @ViewChild('carousel', {static : true}) carousel: NgbCarousel;
  ngOnInit() {
    this.ngOnChanges();
  }

  ngOnChanges(){
    const that = this;
    this.service.getCurrPlayingExpress().pipe(
    ).subscribe(
      (data: any) => {
        that.setCurrPlaying(data);
      }
    );

    const layoutSmall = this.breakpointObserver.observe([
      '(max-width: 599px)'
    ]);

    layoutSmall.subscribe(result => {
      if (result.matches) {
        this.showcarouselIndicators = false;
        this.col = 1;
        this.updateColRowNumbers();
      }
    });
  }
  setCurrPlaying(data) {
    this.homePageData = data;
    this.continueWatchingNum = window.localStorage.length;
    this.continueWatchingRow = Math.ceil(window.localStorage.length / this.col);
    const arr = Array(window.localStorage.length);
    for (let i = 0; i < window.localStorage.length; i++){
      arr[i] = JSON.parse(window.localStorage.getItem(window.localStorage.key(i)));
    }
    this.myListDisplayed = arr;
    this.popMovNum = this.homePageData.popMov.results.length;
    this.popMovRow = Math.ceil(this.homePageData.popMov.results.length / this.col);
    this.topMovNum = this.homePageData.topMov.results.length;
    this.topMovRow = Math.ceil(this.homePageData.topMov.results.length / this.col);
    this.trendMovNum = this.homePageData.trendMov.results.length;
    this.trendMovRow = Math.ceil(this.homePageData.trendMov.results.length / this.col);
    this.popTvNum = this.homePageData.popTv.results.length;
    this.popTvRow = Math.ceil(this.homePageData.popTv.results.length / this.col);
    this.topTvNum = this.homePageData.topTv.results.length;
    this.topTvRow = Math.ceil(this.homePageData.topTv.results.length / this.col);
    this.trendTvNum = this.homePageData.trendTv.results.length;
    this.trendTvRow = Math.ceil(this.homePageData.trendTv.results.length / this.col);
  }

  updateColRowNumbers(){
    this.continueWatchingRow = this.continueWatchingNum;
    this.popMovRow = this.popMovNum;
    this.topMovRow = this.topMovNum;
    this.trendMovRow = this.trendMovNum;
    this.popTvRow = this.popTvNum;
    this.topTvRow = this.topTvNum;
    this.trendTvRow = this.trendTvNum;
  }

  numberArray(num){
    return new Array(num);
  }

}
