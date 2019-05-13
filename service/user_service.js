const request = require('superagent');
// const fs = require('fs-extra');

const getInfo = (data, key) => {
	const object = data.find((n) => {
		return n.key === key;
	});
	return object.value;
};

const getSSOInfo = (data) => {
	const ssohost = getInfo(data, 'ssohost');
	const useremail = getInfo(data, 'useremail');
	const userpassword = getInfo(data, 'userpassword');
	const appid = getInfo(data, 'appid');
	return {
		ssohost,
		useremail,
		userpassword,
		appid
	};
};

// const readEnvironment = (filename) => {
// 	return JSON.parse(fs.readFileSync(`../files/environments/${filename}`));
// };

const getLoginToken = async (data) => {
	try{
		const {ssohost, useremail, userpassword, appid} = getSSOInfo(data.environment.values);
		console.log(ssohost, useremail, userpassword, appid);

		const result = await request.post(`https://${ssohost}/v1/user/login`).send({
	        email: useremail,
	        password: userpassword,
	        appid: appid
	    });
	    return JSON.parse(result.text).data;
	}catch(e) {
		console.log(e);
	}
};

exports.getLoginToken = getLoginToken;