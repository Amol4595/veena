import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  token:any;
  
  constructor() { 
    this.token = localStorage.getItem('token');
  }

  ngOnInit(): void {
  }

}
