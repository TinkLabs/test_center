
const fs = require('fs-extra');
const request = require('superagent');

const config = require('../config/index.json');

const APIKEY = config.api_key; //Postman API key. (Allows multiple keys)
const PATHCOL = config.path.collections; //Postman collections folder
const PATHENV = config.path.environments; //Postman environments folder

const APIURL = config.api_url;

const download = (path, filename, json) => {
  console.log(`downloaded collection ${filename}`);
  fs.ensureDirSync(path);
  fs.writeFileSync(path + '/' + filename, json, 'utf8');
};

const getData = async (url) => {
  const result = await request.get(url).set('X-Api-Key', APIKEY);
  if(result.statusCode != 200) {
    throw new Error('Api error');
  }
  return JSON.parse(result.text);
};

const getCollections = async () => {
  const {collections} = await getData(`${APIURL}collections/`);
  for(let {uid, name} of collections) {
     const data =  await getData(`${APIURL}collections/${uid}`);
     download(PATHCOL, `${name}.json`, JSON.stringify(data));
  }
};

const getEnviroments = async () => {
  const {environments} = await getData(`${APIURL}environments/`);
  for(let {uid, name} of environments) {
     const data =  await getData(`${APIURL}environments/${uid}`);
     if (name === 'dev') {
        const usertoken = await getLoginToken();
        data.environment.values.push({
          "description": {
                "content": "",
                "type": "text/plain"
            },
            "value": usertoken,
            "key": "usertoken",
            "enabled": true
        });
        download(PATHENV, `${name}.json`, JSON.stringify(data));
     }else {

     }
     
  }
};

const getLoginToken = async () => {
  const result = await request.post(`https://csp-dev.handytravel.tech/auth/v1/user/login`)
        .send({
          email: 'henry.lau@hi.com',
          password: 'Handy123',
          appid: '123'
        });

   return JSON.parse(result.text).data;
       
};

const downloadCollections = async () => {
  try {
    await getCollections();
    console.log('download collections completed');
    await getEnviroments();
    console.log('download environments completed');
    console.log('download completed');
  }catch(e) {
    console.log(e);
  }
};




exports.downloadCollections = downloadCollections;
