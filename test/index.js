const {downloadCollections} = require('../service');
const exec = require('child_process').execSync;

const runTest = async () => {
	try{
		await downloadCollections();

		const CURRENT_DATE = process.env.CURRENT_DATE;
		const newmanCommand = 'newman run files/collections/Profile.json -e files/environments/dev.json -r html,cli --reporter-html-export report.html';
		exec(newmanCommand, {
			cwd: process.cwd(),
			stdio: 'inherit'
		});
	}catch(e) {
		console.log(e);
	}finally {
		const s3Command = `aws s3 cp ./report.html s3://postman-reports/reports/report-${CURRENT_DATE}.html`;
		exec(s3Command, {
			cwd: process.cwd(),
			stdio: 'inherit'
		});
	}
	
};

exports.runTest = runTest;