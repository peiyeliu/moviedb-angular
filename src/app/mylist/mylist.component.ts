import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-mylist',
  templateUrl: './mylist.component.html',
  styleUrls: ['./mylist.component.css']
})
export class MylistComponent implements OnInit {

  col: number;
  numOfItems: number;
  myListDisplayed: any[];
  row: number;

  constructor() {
  }

  ngOnInit(): void {
    this.col = 6;
    this.numOfItems = window.localStorage.length;
    const arr = Array(window.localStorage.length);
    for (let i = 0; i < window.localStorage.length; i++){
      arr[i] = JSON.parse(window.localStorage.getItem(window.localStorage.key(i)));
    }
    this.myListDisplayed = arr;
    this.row = Math.ceil(window.localStorage.length / this.col );
  }

  numberArray(num){
    return Array(num);
  }

}
