import {Component, ViewChild, OnInit, ViewEncapsulation} from '@angular/core';
import {NgbTypeahead} from '@ng-bootstrap/ng-bootstrap';
import {Observable, Subject, merge, OperatorFunction, of} from 'rxjs';
import {catchError, debounceTime, distinctUntilChanged, filter, map, switchMap, tap} from 'rxjs/operators';
import { Service } from '../service/service';
import {BreakpointObserver} from '@angular/cdk/layout';


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class HeaderComponent implements OnInit {

  constructor(private service: Service, private breakpointObserver: BreakpointObserver) {}

  model: any;
  searching = false;
  searchFailed = false;

  ngOnInit(): void {
    const layoutSmall = this.breakpointObserver.observe([
      '(max-width: 599px)'
    ]);

    layoutSmall.subscribe(result => {
      if (result.matches) {
        document.getElementById('home').style.textAlign = 'right';
        document.getElementById('mylist').style.textAlign = 'right';
      }
    });
  }

  search: OperatorFunction<string, readonly {name, id, type, path}[]> = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap(() => this.searching = true),
      switchMap(term =>
        this.service.getSearchResult(term).pipe(
          map(response => response.results),
          tap(() => this.searchFailed = false),
          catchError(() => {
            this.searchFailed = true;
            return of([]);
          }))
      ),
      tap(() => this.searching = false)
    )
  formatter = (x: {name: string}) => x.name;
}
