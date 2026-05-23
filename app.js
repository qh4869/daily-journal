// Try to load local config first
let cloudEnvId = 'your-cloud-env-id';
try {
  const localConfig = require('./config.js');
  if (localConfig && localConfig.cloudEnvId) {
    cloudEnvId = localConfig.cloudEnvId;
  }
} catch (e) {
  // config.js not found, use default
}

App({
  onLaunch() {
    // Initialize cloud development
    if (!wx.cloud) {
      console.error('Please use WeChat base library 2.2.3 or above');
    } else {
      wx.cloud.init({
        env: cloudEnvId,
        traceUser: true
      });
    }
  }
});