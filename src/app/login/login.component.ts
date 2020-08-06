import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../service/api.service';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  @ViewChild('loginForm') loginForm:any;
  name:any;
  email:any;
  password:any;
  tab:string='s';
  server = 'http://localhost:5000/api/user/';
  ForgotP:boolean=false;
  status:string='';

  constructor(private route:Router,private api:ApiService) {}

  ngOnInit(): void {
  }

  submit(type){
    this.status = '';
    if(this.loginForm.valid){
      let api = this.server+'login';
      if(this.tab=='r'){
        api = this.server+'signup';
      }else if(type=='reset'){
        api = this.server+'resetPassword';
      }
      this.api.apiCall(api,this.loginForm.value).then((data)=>{
        this.status = data['status'];
        if(data['status']=='success'){
          localStorage.setItem('token',data['data'].token)
          this.route.navigate(['home']);
        }
      });
    }
  }

  tabSelect(a){
    this.tab = a;
  }

  gforgot(){
    this.ForgotP = true;
  }

  //this.loginForm.setValue({'email':'aaa'});
  //this.loginForm.patchValue({'email':'aaa','password':'111'});
  //this.loginForm.reset();

}
