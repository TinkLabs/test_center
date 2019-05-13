const path = require('path');
const config = {
    mapping: {
        'MyTestPipeline': {
            collectionList: ['TEST', 'Profile'],
            env: 'dev'
        },
        "csp-build-uat": {
            collectionList: ['SSO Service', 'mail', 'Profile'],
            env: 'uat'
        }
    },
    "api_url": "https://api.getpostman.com/",
    "api_key": "ed671c1d38904551b3e1094574eb3c95",
    "path": {
        "collections": "files/collections",
        "environments": "files/environments"
    },
    /**
     * 返回或设置当前环镜
     */
    env: function() {
        global.$config = this;
        return global.$config;
    }
};
module.exports = config.env();