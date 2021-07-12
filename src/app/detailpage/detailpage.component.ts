import { Component, OnInit } from '@angular/core';
import { ViewChild } from '@angular/core';
import { Service } from '../service/service';
import { NgbCarousel } from '@ng-bootstrap/ng-bootstrap';
import { Params } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { BreakpointObserver } from '@angular/cdk/layout';



@Component({
  selector: 'app-detailpage',
  templateUrl: './detailpage.component.html',
  styleUrls: ['./detailpage.component.css']
})
export class DetailpageComponent implements OnInit {
  constructor(private breakpointObserver: BreakpointObserver, private service: Service, private route: ActivatedRoute) {
  }
  detail: any;
  tweetShareURL: string;
  cast: any;
  paused = false;
  id: number;
  type: string;
  name: string;
  poster: string;
  recommendRow: number;
  recommendNum: number;
  similarRow: number;
  similarNum: number;
  col = 6;

  unpauseOnArrow = true;
  pauseOnIndicator = false;
  pauseOnHover = true;
  pauseOnFocus = true;
  castDetailOpened = false;
  showcarouselIndicators = true;
  buttonHTML = 'Add to Watchlist';
  clicked = false;
  itemAdded = false;

  @ViewChild('carousel', {static : true}) carousel: NgbCarousel;
  @ViewChild('alert', {static: false}) alert: any;
  @ViewChild('removealert', {static: false}) removealert: any;
  ngOnInit(): void {
    const that = this;
    this.route.params.subscribe((params: Params) => {
      this.id = params.id;
      this.type = params.type;
      this.clicked = false;
      this.itemAdded = this.verifyItemAdd(this.id, this.type);
      if (this.itemAdded){
        this.buttonHTML = 'Remove from watchlist';
      }
      else{
        this.buttonHTML = 'Add to Watchlist';
      }
      this.service.getDetail(this.id, this.type).subscribe((data: any) => {
        that.setDetailData(data);
        that.setTweetShareURL();
      });
    });
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

  setDetailData(data){
    this.detail = data;
    this.name = this.detail.detailData.original_title ? this.detail.detailData.original_title : this.detail.detailData.name;
    this.poster = this.detail.detailData.poster_path;
    this.recommendNum = this.detail.recomData.results.length;
    this.similarNum = this.detail.similarData.results.length;
    this.updateColRowNumbers();
  }

  setTweetShareURL(){
    let title = '';
    if (this.detail.detailData.original_title != null){
      title = this.detail.detailData.original_title;
    }
    else{
      title = this.detail.detailData.name;
    }
    const urlString = 'Watch ' + title + '\n' + 'https://www.youtube.com/watch?v=' + this.detail.youtube + '\n' + '#USC #CSCI571 #FightOn';
    this.tweetShareURL = encodeURIComponent(urlString);
  }

  showCastDetail(id){
    this.castDetailOpened = true;
    this.service.getCastDetail(id).subscribe((data: any) => {
      this.cast = data;
    });
  }

  addOrRemoveMyList(){
    this.clicked = true;
    if (this.itemAdded === true){
      this.removeEntry(this.id, this.type);
      this.itemAdded = false;
      this.buttonHTML = 'Add to watchlist';
      setTimeout(() => this.removealert.close(), 3000);
    }
    else{
      this.addEntry(this.id, this.type, this.name, this.poster);
      this.itemAdded = true;
      this.buttonHTML = 'Remove from watchlist';
      setTimeout(() => this.alert.close(), 3000);
    }
  }

  /**
   * return true if this movie/tv shows has been added
   */
  verifyItemAdd(id, type){
    return window.localStorage.getItem(id + type) != null;
  }


  addEntry(id, type, name, poster){
    const entry = {
      id: null,
      type: null,
      name: null,
      poster: null
    };
    entry.id = id;
    entry.type = type;
    entry.name = name;
    entry.poster = poster;
    const key = id + type;
    window.localStorage.setItem(key, JSON.stringify(entry));
  }

  removeEntry(id, type){
    window.localStorage.removeItem(id + type);
  }

  numberArray(num){
    return new Array(num);
  }

  updateColRowNumbers(){
    this.similarRow = Math.ceil(this.similarNum / this.col);
    this.recommendRow = Math.ceil(this.recommendNum / this.col);
  }
}
