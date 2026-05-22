App({
  onLaunch() {
    // Initialize cloud development
    if (!wx.cloud) {
      console.error('Please use WeChat base library 2.2.3 or above');
    } else {
      wx.cloud.init({
        env: 'your-env-id', // Replace with actual env ID
        traceUser: true
      });
    }
  }
});