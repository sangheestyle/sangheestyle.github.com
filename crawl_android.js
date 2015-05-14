(function() {
  var museAPI = "http://sangheestyle.com:8080/muse/count?callback=?";
  $.getJSON(museAPI)
  .done(function(data) {
    var chart = c3.generate({
      bindto: '#crawl_android',
      data: {
        json: data.result,
        keys: {value: ['date', 'count']},
        x: 'date'
      },
      axis : {
        x : {
          type : 'timeseries',
          tick : {
            format : "%Y-%m-%d"
          },
          label: 'date'
          },
          y: {
              label: 'number of created repo'
          }
      },
      zoom: {
              enabled: true
      }
    });
  });
})();
