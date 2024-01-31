(function($, api) {
  api('multistorex_appearance[store_map]', function(value) {
    value.bind(function(show) {
      var div = $('.multistorex-store-widget.multistorex-store-location');

      if (show) {
        div.show();
      } else {
        div.hide();
      }
    });
  });

  api.selectiveRefresh.bind('partial-content-rendered', function(placement) {
    console.log(placement);
  });
})(jQuery, wp.customize);