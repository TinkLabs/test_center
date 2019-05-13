const fs = require('fs-extra');
const request = require('superagent');
const config = require('../config');
const APIKEY = config.api_key; //Postman API key. (Allows multiple keys)
const PATHCOL = config.path.collections; //Postman collections folder
const PATHENV = config.path.environments; //Postman environments folder
const APIURL = config.api_url;

const {getLoginToken} = require('./user_service');

const getPipelineName = () => {
    let initiator = process.env.CODEBUILD_INITIATOR;
    if(!initiator) {
      initiator = 'aadd/MyTestPipeline';
    }
    return initiator.substring(initiator.indexOf('/') + 1, initiator.length);
};

const getPostmanConfig = () => {
    const pipelineName = getPipelineName();
    const postmanConfig = config['mapping'][pipelineName];
    if (!postmanConfig) {
        console.log(`Unable to find the pipeline ${pipelineName} in the config file`);
    }
    const {collectionList, env} = postmanConfig;
    return {
      collectionList, env, pipelineName
    };
};

const download = (path, filename, json) => {
    console.log(`downloaded collection ${filename}`);
    fs.ensureDirSync(path);
    fs.writeFileSync(path + '/' + filename, json, 'utf8');
};

const getData = async (url) => {
    const result = await request.get(url).set('X-Api-Key', APIKEY);
    if (result.statusCode != 200) {
        throw new Error('Api error');
    }
    return JSON.parse(result.text);
};

const getCollections = async ({collectionList}) => {
    const {collections} = await getData(`${APIURL}collections/`);
    for (let {uid,name} of collections) {
        const index = collectionList.findIndex((n) => {
            return n === name;
        });
        if(index == -1) {
            continue;
        }
        const data = await getData(`${APIURL}collections/${uid}`);
        download(PATHCOL, `${name}.json`, JSON.stringify(data));
    }
};

const getEnviroments = async ({env}) => {
    const {
        environments
    } = await getData(`${APIURL}environments/`);
    for (let {
            uid,
            name
        } of environments) {
        const data = await getData(`${APIURL}environments/${uid}`);
        const usertoken = await getLoginToken(data);
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
    }
};

const downloadCollections = async () => {
    try {
        const postmanConfig = getPostmanConfig();
        if (!postmanConfig) {
            return;
        }
        await getCollections(postmanConfig);
        console.log('download collections completed');
        await getEnviroments(postmanConfig);
        console.log('download environments completed');
        console.log('download completed');
        return postmanConfig;
    } catch (e) {
        console.log(e);
    }
};

exports.downloadCollections = downloadCollections;