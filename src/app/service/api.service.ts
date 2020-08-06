import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
declare let window:any;
declare var require: any;
var CryptoJS = require("crypto-js");
var key = CryptoJS.enc.Utf8.parse('amol$1234567');
var iv = CryptoJS.enc.Utf8.parse('0001000100010001');

@Injectable({
  providedIn: 'root'
})

export class ApiService {

  constructor(private http:HttpClient) { }

  apiCall(api,param){
    return new Promise((resolve, reject) => {
      this.encryptData(param).then((enParam)=>{
        this.http.post<any>(api,{param:enParam}).subscribe(data => {
          this.decryptData(data.res).then((decrpData)=>{
            console.log(decrpData);
            resolve(decrpData[0]);
          })
        },(err)=>{
          console.log(err);
          reject();
        })
      })
    })
    
    // this.http.post<any>('https://jsonplaceholder.typicode.com/posts', {}).toPromise().then(data => {
    //   console.log(data.id);
    // },(err)=>{
    //   console.log(err);
    // })
  }

  decryptData(Data: any) {
		return new Promise(function(resolve,reject) {
			var decrypted = CryptoJS.AES.decrypt(Data,key, {keySize: 128 /8,iv: iv,mode: CryptoJS.mode.CBC,padding: CryptoJS.pad.Pkcs7});
			var cipherUsrCredentials = JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
            //console.log('decryptData',cipherUsrCredentials);
			resolve(cipherUsrCredentials);
		});
	}
		
	encryptData(Data:any) {
		return new Promise(function (resolve,reject) {
			var text = JSON.stringify(Data);
			var encrypted = CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(text),key,{keySize: 128 /8,iv: iv,mode: CryptoJS.mode.CBC,padding: CryptoJS.pad.Pkcs7});
            text = encrypted.toString();
            //console.log('encryptData',text);
			resolve(text);
		});
  }

}
