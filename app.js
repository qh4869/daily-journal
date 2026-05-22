App({
  onLaunch() {
    // Initialize cloud development
    if (!wx.cloud) {
      console.error('Please use WeChat base library 2.2.3 or above');
    } else {
      wx.cloud.init({
        env: 'cloud1-d3g6deswg44d72dff', // Replace with actual env ID
        traceUser: true
      });
    }
  }
});