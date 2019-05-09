const {downloadCollections} = require('../service');
const exec = require('child_process').execSync;

const runTest = async () => {
	try{
		await downloadCollections();

		console.log(process.env);
		const newmanCommand = 'newman run files/collections/Profile.json -e files/environments/dev.json -r html,cli --reporter-html-export report.html';
		exec(newmanCommand, {
			cwd: process.cwd(),
			stdio: 'inherit'
		});

		const s3Command = 'aws s3 cp ./report.html s3://postman-reports --recursive';
		exec(s3Command, {
			cwd: process.cwd(),
			stdio: 'inherit'
		});
	}catch(e) {
		console.log(e);
	}
	
};

exports.runTest = runTest;