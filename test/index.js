const {
    downloadCollections
} = require('../service');
const exec = require('child_process').execSync;
const runTest = ({
    collectionList,
    env,
    pipelineName
}) => {
    for (let collectionName of collectionList) {
    	try{
    		let newmanCommand = `newman run files/collections/${collectionName}.json -e files/environments/${env}.json -r html,cli --reporter-html-export report-${collectionName}.html`;
	        exec(newmanCommand, {
	            cwd: process.cwd(),
	            stdio: 'inherit'
	        });
    	}finally {
    		saveToS3(collectionName, pipelineName);
    	}
        
    }
};
const saveToS3 = (collectionName, pipelineName) => {
    try {
        const s3Command = `aws s3 cp ./report-${collectionName}.html s3://postman-reports/reports/${pipelineName}/${process.env.CURRENT_DATE}/report-${collectionName}.html`;
        exec(s3Command, {
            cwd: process.cwd(),
            stdio: 'inherit'
        });
    } catch (e) {
        console.log(e);
    }
};
const test = async () => {
    const postmanConfig = await downloadCollections();
    runTest(postmanConfig);				
};

exports.test = test;