function fn() {   

    
    var config = { // base config JSON
      opfabUrl: 'http://localhost:2002/',
      opfabPublishCardUrl: 'http://localhost:2102/'
    };

    karate.log('url opfab :' + config.opfabUrl );
    // don't waste time waiting for a connection or if servers don't respond within 5 seconds
    karate.configure('connectTimeout', 5000);
    karate.configure('readTimeout', 5000);
    return config;
  }
