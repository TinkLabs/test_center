const {
    downloadCollections
} = require('../service');
const exec = require('child_process').execSync;
let failedCount = 0;

const runTest = ({collectionList, env, pipelineName}) => {
	
    for (let collectionName of collectionList) {
    	try{
    		let newmanCommand = `newman run files/collections/${collectionName}.json -e files/environments/${env}.json -r html,cli --reporter-html-export report-${collectionName}.html`;
	        const result = exec(newmanCommand, {
	            cwd: process.cwd(),
	            stdio: 'inherit',
	            env: process.env
	        });
    	}catch(e) {
    		failedCount++;
    	}finally {
    		saveToS3(collectionName, pipelineName);
    	}
        
    }
    if(failedCount > 0) {
    	process.exit(1);
    }
};

const saveToS3 = (collectionName, pipelineName) => {
    try {
        const s3Command = `aws s3 cp ./report-${collectionName}.html s3://api-test.handy.travel/reports/${pipelineName}/${process.env.CURRENT_DATE}/report-${collectionName}.html`;
        exec(s3Command, {
            cwd: process.cwd(),
            stdio: 'inherit',
            env: process.env
        });
    } catch (e) {
        console.log(e);
    }
};
const test = async () => {
    const postmanConfig = await downloadCollections();
    if(!postmanConfig) {
    	console.log('download collection failed');
    	process.exit(1);
    }
    runTest(postmanConfig);				
};

exports.test = test;