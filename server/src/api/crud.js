const express = require('express');
const router = express.Router();
//mongo connection
const monk = require('monk');
const db = monk(process.env.MONGO_PATH);
const user = db.get('user');
//schema for validation
const joi = require('@hapi/joi');
const schema = joi.object({
  'name':joi.string().trim().required(),
  'email':joi.string().trim().required(),
  'password':joi.string().trim().required()
})
//crypto
var CryptoJS = require("crypto-js");
const serverPath = 'http://52.172.206.240/';
const key = CryptoJS.enc.Utf8.parse('amol$1234567');
const iv = CryptoJS.enc.Utf8.parse('0001000100010001');

//jwt token
var jwt = require('jsonwebtoken');
const privateKey = 'privateKey';
const jwtOpt = {};//{ expiresIn: 60 * 10 };// 

router.get('/' , async(req, res, next) => {
  try {
    let items = await user.find({});
    res.json([{'status':'success','items':items}]);
  } catch (error) {
    next(error);
  }
});

router.get('/delete', async(req, res, next) => {
  try {
    user.remove({});
    let items = await user.find({});
    res.json([{'status':'success','items':items}]);
  } catch (error) {
    next(error);
  }
});

//create
router.post('/signup',interMediatetorFun, async(req, res, next) => {
  try {
    let value = await schema.validateAsync(req.body);
    let data = await user.find({'email':req.body.email});
    if(data.length>0){
      response(res,200,'',[{'status':'User exist.'}])
    }else{
      user.insert(value);
      jwt.sign({id:req.body.email}, privateKey, jwtOpt, function(err, token) {
        if (err){
          response(res,400,err,{'status':'failed'});
        }else{ 
          let respara = req.body;
          respara['token'] = token;
          response(res,200,'',[{'status':'success',data:respara}])
        } 
      });
    }
  } catch (error) {
    next(error);
  }
});

//login
router.post('/login',interMediatetorFun, async(req, res, next) => {
  try {
    let data = await user.find({'email':req.body.email,'password':req.body.password});
    if(!data) return next();
    if(data.length==0) return response(res,200,'',[{'status':'User not found.'}])
    jwt.sign({id:req.body.email}, privateKey, jwtOpt, function(err, token) {
      if (err){
        response(res,400,err,{'status':'failed'});
      }else{
        let respara = data[0];
        respara['token'] = token;
        response(res,200,'',[{'status':'success',data:respara}])
      } 
    })
  } catch (error) {
    next(error);
  }
});

//update
router.post('/resetPassword',interMediatetorFun, async(req, res, next) => {
  try {
    let items = await user.find({'email':req.body.email});
    if(!items) return next();
    if(items.length>0){
      let update = await user.update({email:req.body.email},{$set:req.body});
      jwt.sign({id:req.body.email}, privateKey, jwtOpt, function(err, token) {
        if (err){
          response(res,400,err,{'status':'failed'});
        }else{
          let respara = items[0];
          respara['token'] = token;
          response(res,200,'',[{'status':'success','data':respara}])
        }
      })
    }else{
      response(res,200,'',[{'status':'User not found'}])
    }
  } catch (error) {
    next(error);
  }
});

function response(res,resStatus,err,resData){
  encryptData(resData).then((encryptedData)=>{
    res.status(resStatus).json({'res':encryptedData});
  });
  if(resStatus==400){
      throw err;
  }
}

function interMediatetorFun(req,res,next){
  decryptData(req.body.param).then((paramDecrpted)=>{
    paramDecrpted.password = encryptPass(paramDecrpted.password);
    console.log('amol');
    req.body = paramDecrpted;
    next();
  });
}

function decryptData(Data) {
  return new Promise(function(resolve,reject) {
      if(Data){
          let decrypted = CryptoJS.AES.decrypt(Data,key, {keySize: 128 /8,iv: iv,mode: CryptoJS.mode.CBC,padding: CryptoJS.pad.Pkcs7});
    let cipherUsrCredentials = JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
          resolve(cipherUsrCredentials);
      }else{
          resolve('');
      }
  });
}

function encryptData(Data) {
  return new Promise(function (resolve,reject) {
      if(Data){
          let text = JSON.stringify(Data);
          let encrypted = CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(text),key,{keySize: 128 /8,iv: iv,mode: CryptoJS.mode.CBC,padding: CryptoJS.pad.Pkcs7});
          text = encrypted.toString();
          //console.log('encryptData',text);
          resolve(text);
      }else{
          resolve('');
      }
  });
}

function encryptPass(text) {
  var abc = CryptoJS.SHA256(text)
  return abc.toString(CryptoJS.enc.Base64);
}

module.exports = router;