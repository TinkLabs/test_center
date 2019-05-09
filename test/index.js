const {downloadCollections} = require('../service');
const exec = require('child_process').execSync;

const runTest = () => {
	const newmanCommand = 'newman run files/collections/Profile.json -e files/environments/dev.json -r html,cli --reporter-html-export report.html';
	exec(newmanCommand, {
		cwd: process.cwd(),
		stdio: 'inherit'
	});
	
};

const recordS3 = () => {
	try {
		const s3Command = `aws s3 cp ./report.html s3://postman-reports/reports/report-${process.env.CURRENT_DATE}.html`;
		exec(s3Command, {
			cwd: process.cwd(),
			stdio: 'inherit'
		});
	}catch(e) {
		console.log(e);
	}
	
};

const test = async () => {
	try {
		await downloadCollections();
		runTest();
	} finally {
		recordS3();
	}
	
};

exports.test = test;