jQuery(function($) {
  var api = wp.customize;

  $('.datepicker').datepicker({
    dateFormat: 'yy-mm-dd'
  });

  // Toggle list table rows on small screens.
  $('.multistorex-table tbody').on('click', '.toggle-row', function() {
    $(this)
      .closest('tr')
      .toggleClass('is-expanded');
  });

  $('.multistorex-start-date').datepicker({
    defaultDate: '',
    dateFormat: 'yy-mm-dd',
    numberOfMonths: 1,
    onSelect: function(selectedDate) {
      let date = new Date(selectedDate);
      date.setDate(date.getDate() + 1);
      $('.multistorex-end-date').datepicker('option', {
        minDate: date
      });
    }
  });

  $('.multistorex-end-date').datepicker({
    defaultDate: '',
    dateFormat: 'yy-mm-dd',
    numberOfMonths: 1,
    onSelect: function(selectedDate) {
      let date = new Date(selectedDate);
      date.setDate(date.getDate() - 1);
      $('multistorex-start-date').datepicker('option', {
        maxDate: date
      });
    }
  });

  $('.tips').tooltip();

  function showTooltip(x, y, contents) {
    jQuery('<div class="chart-tooltip">' + contents + '</div>')
      .css({
        top: y - 16,
        left: x + 20
      })
      .appendTo('body')
      .fadeIn(200);
  }

  var prev_data_index = null;
  var prev_series_index = null;

  jQuery('.chart-placeholder').on('plothover', function(event, pos, item) {
    if (item) {
      if (
        prev_data_index != item.dataIndex ||
        prev_series_index != item.seriesIndex
      ) {
        prev_data_index = item.dataIndex;
        prev_series_index = item.seriesIndex;

        jQuery('.chart-tooltip').remove();

        if (item.series.points.show || item.series.enable_tooltip) {
          var y = item.series.data[item.dataIndex][1];

          tooltip_content = '';

          if (item.series.prepend_label)
            tooltip_content = tooltip_content + item.series.label + ': ';

          if (item.series.prepend_tooltip)
            tooltip_content = tooltip_content + item.series.prepend_tooltip;

          tooltip_content = tooltip_content + y;

          if (item.series.append_tooltip)
            tooltip_content = tooltip_content + item.series.append_tooltip;

          if (item.series.pie.show) {
            showTooltip(pos.pageX, pos.pageY, tooltip_content);
          } else {
            showTooltip(item.pageX, item.pageY, tooltip_content);
          }
        }
      }
    } else {
      jQuery('.chart-tooltip').remove();
      prev_data_index = null;
    }
  });
});

//multistorex settings
(function($) {
  $.validator.setDefaults({ ignore: ':hidden' });

  var validatorError = function(error, element) {
    var form_group = $(element).closest('.multistorex-form-group');
    form_group.addClass('has-error').append(error);
  };

  var validatorSuccess = function(error, element) {
    $(element)
      .closest('.multistorex-form-group')
      .removeClass('has-error');
    $(error).remove();
  };

  var api = wp.customize;

  var selectors = 'input[name="settings[bank][disconnect]"], input[name="settings[paypal][disconnect]"], input[name="settings[skrill][disconnect]"], input[name="settings[multistorex_custom][disconnect]"]';

  var Multistorex_Settings = {
    init: function() {
      var self = this;

      //image upload
      $('a.multistorex-banner-drag').on('click', this.imageUpload);
      $('a.multistorex-remove-banner-image').on('click', this.removeBanner);

      $('a.multistorex-pro-gravatar-drag').on('click', this.gragatarImageUpload);
      $('a.multistorex-gravatar-drag').on('click', this.simpleImageUpload);
      $('a.multistorex-remove-gravatar-image').on('click', this.removeGravatar);

      $('.multistorex-update-setting-top-button').on( 'click', function(){
          $("input[name='multistorex_update_store_settings']").trigger( 'click' );
      });


      this.validateForm(self);

      $('.multistorex_payment_disconnect_btn').on( 'click', function(){
        var form = $(this).closest('form');
        var self = $('form#' + form.attr('id'));

        $(':input',form)
        .not(':button, :submit, :reset, :hidden, :checkbox')
        .val('')
        .prop('selected', false);

        var data = form.serializeArray().reduce(function(obj, item) {
            obj[item.name] = item.value;
            return obj;
        }, {});

        data[$(this).attr('name')] = ''
        data['form_id'] = form.attr('id');
        data['action'] = 'multistorex_settings';

        var isDisconnect = true;

        Multistorex_Settings.handleRequest( self, data, isDisconnect );
      });

      return false;
    },

    calculateImageSelectOptions: function(attachment, controller) {
      var xInit = parseInt(multistorex.store_banner_dimension.width, 10),
        yInit = parseInt(multistorex.store_banner_dimension.height, 10),
        flexWidth = !!parseInt(multistorex.store_banner_dimension['flex-width'], 10),
        flexHeight = !!parseInt(
          multistorex.store_banner_dimension['flex-height'],
          10
        ),
        ratio,
        xImg,
        yImg,
        realHeight,
        realWidth,
        imgSelectOptions;

      realWidth = attachment.get('width');
      realHeight = attachment.get('height');

      this.headerImage = new api.HeaderTool.ImageModel();
      this.headerImage.set({
        themeWidth: xInit,
        themeHeight: yInit,
        themeFlexWidth: flexWidth,
        themeFlexHeight: flexHeight,
        imageWidth: realWidth,
        imageHeight: realHeight
      });

      controller.set('canSkipCrop', !this.headerImage.shouldBeCropped());

      ratio = xInit / yInit;
      xImg = realWidth;
      yImg = realHeight;

      if (xImg / yImg > ratio) {
        yInit = yImg;
        xInit = yInit * ratio;
      } else {
        xInit = xImg;
        yInit = xInit / ratio;
      }

      imgSelectOptions = {
        handles: true,
        keys: true,
        instance: true,
        persistent: true,
        imageWidth: realWidth,
        imageHeight: realHeight,
        x1: 0,
        y1: 0,
        x2: xInit,
        y2: yInit
      };

      if (flexHeight === false && flexWidth === false) {
        imgSelectOptions.aspectRatio = xInit + ':' + yInit;
      }
      if (flexHeight === false) {
        imgSelectOptions.maxHeight = yInit;
      }
      if (flexWidth === false) {
        imgSelectOptions.maxWidth = xInit;
      }

      return imgSelectOptions;
    },

    onSelect: function() {
      this.frame.setState('cropper');
    },

    onCropped: function(croppedImage) {
      var url = croppedImage.url,
        attachmentId = croppedImage.attachment_id,
        w = croppedImage.width,
        h = croppedImage.height;
      this.setImageFromURL(url, attachmentId, w, h);
    },

    onSkippedCrop: function(selection) {
      var url = selection.get('url'),
        w = selection.get('width'),
        h = selection.get('height');
      this.setImageFromURL(url, selection.id, w, h);
    },

    setImageFromURL: function(url, attachmentId, width, height) {
      var banner_profile_upload_status = false;
      if ($(this.uploadBtn).hasClass('multistorex-banner-drag')) {
        var wrap = $(this.uploadBtn).closest('.multistorex-banner');

        wrap.find('input.multistorex-file-field').val(attachmentId);
        wrap.find('img.multistorex-banner-img').attr('src', url);

        $(this.uploadBtn)
          .parent()
          .siblings('.image-wrap', wrap)
          .removeClass('multistorex-hide');

        $(this.uploadBtn)
          .parent('.button-area')
          .addClass('multistorex-hide');

        banner_profile_upload_status = true;

      } else if ($(this.uploadBtn).hasClass('multistorex-pro-gravatar-drag')) {
        var wrap = $(this.uploadBtn).closest('.multistorex-gravatar');

        wrap.find('input.multistorex-file-field').val(attachmentId);
        wrap.find('img.multistorex-gravatar-img').attr('src', url);

        banner_profile_upload_status = true;

        $(this.uploadBtn)
          .parent()
          .siblings('.gravatar-wrap', wrap)
          .removeClass('multistorex-hide');

        $(this.uploadBtn)
          .parent('.gravatar-button-area')
          .addClass('multistorex-hide');
      }

      if ( banner_profile_upload_status === true ) {
        $(window).on("beforeunload", function() {
          return multistorex.multistorex_banner_added_alert_msg;
        });

        $(document).ready(function() {
          $("#store-form").on("submit", function(e) {
            $(window).off("beforeunload");
            return true;
          });
        });
      }
    },

    removeImage: function() {
      api.HeaderTool.currentHeader.trigger('hide');
      api.HeaderTool.CombinedList.trigger('control:removeImage');
    },

    imageUpload: function(e) {
      e.preventDefault();

      var file_frame,
        settings = Multistorex_Settings;

      settings.uploadBtn = this;

      settings.frame = wp.media({
        multiple: false,
        button: {
          text: multistorex.selectAndCrop,
          close: false
        },
        states: [
          new wp.media.controller.Library({
            title: multistorex.chooseImage,
            library: wp.media.query({ type: 'image' }),
            multiple: false,
            date: false,
            priority: 20,
            suggestedWidth: multistorex.store_banner_dimension.width,
            suggestedHeight: multistorex.store_banner_dimension.height
          }),
          new wp.media.controller.Cropper({
            suggestedWidth: 5000,
            imgSelectOptions: settings.calculateImageSelectOptions
          })
        ]
      });

      settings.frame.on('select', settings.onSelect, settings);
      settings.frame.on('cropped', settings.onCropped, settings);
      settings.frame.on('skippedcrop', settings.onSkippedCrop, settings);

      settings.frame.open();
    },

    calculateImageSelectOptionsProfile: function(attachment, controller) {
      var xInit = 150,
        yInit = 150,
        flexWidth = !!parseInt(multistorex.store_banner_dimension['flex-width'], 10),
        flexHeight = !!parseInt(
          multistorex.store_banner_dimension['flex-height'],
          10
        ),
        ratio,
        xImg,
        yImg,
        realHeight,
        realWidth,
        imgSelectOptions;

      realWidth = attachment.get('width');
      realHeight = attachment.get('height');

      this.headerImage = new api.HeaderTool.ImageModel();
      this.headerImage.set({
        themeWidth: xInit,
        themeHeight: yInit,
        themeFlexWidth: flexWidth,
        themeFlexHeight: flexHeight,
        imageWidth: realWidth,
        imageHeight: realHeight
      });

      controller.set('canSkipCrop', !this.headerImage.shouldBeCropped());

      ratio = xInit / yInit;
      xImg = realWidth;
      yImg = realHeight;

      if (xImg / yImg > ratio) {
        yInit = yImg;
        xInit = yInit * ratio;
      } else {
        xInit = xImg;
        yInit = xInit / ratio;
      }

      imgSelectOptions = {
        handles: true,
        keys: true,
        instance: true,
        persistent: true,
        imageWidth: realWidth,
        imageHeight: realHeight,
        x1: 0,
        y1: 0,
        x2: xInit,
        y2: yInit
      };

      if (flexHeight === false && flexWidth === false) {
        imgSelectOptions.aspectRatio = xInit + ':' + yInit;
      }
      if (flexHeight === false) {
        imgSelectOptions.maxHeight = yInit;
      }
      if (flexWidth === false) {
        imgSelectOptions.maxWidth = xInit;
      }

      return imgSelectOptions;
    },

    simpleImageUpload: function(e) {
      e.preventDefault();
      var file_frame,
        self = $(this);

      // If the media frame already exists, reopen it.
      if (file_frame) {
        file_frame.open();
        return;
      }

      // Create the media frame.
      file_frame = wp.media.frames.file_frame = wp.media({
        title: jQuery(this).data('uploader_title'),
        button: {
          text: jQuery(this).data('uploader_button_text')
        },
        multiple: false
      });

      // When an image is selected, run a callback.
      file_frame.on('select', function() {
        var attachment = file_frame
          .state()
          .get('selection')
          .first()
          .toJSON();

        var wrap = self.closest('.multistorex-gravatar');
        wrap.find('input.multistorex-file-field').val(attachment.id);
        wrap.find('img.multistorex-gravatar-img').attr('src', attachment.url);
        self
          .parent()
          .siblings('.gravatar-wrap', wrap)
          .removeClass('multistorex-hide');
        self.parent('.gravatar-button-area').addClass('multistorex-hide');
      });

      // Finally, open the modal
      file_frame.open();
    },

    gragatarImageUpload: function(e) {
      e.preventDefault();

      var file_frame,
        settings = Multistorex_Settings;

      settings.uploadBtn = this;

      settings.frame = wp.media({
        multiple: false,
        button: {
          text: multistorex.selectAndCrop,
          close: false
        },
        states: [
          new wp.media.controller.Library({
            title: multistorex.chooseImage,
            library: wp.media.query({ type: 'image' }),
            multiple: false,
            date: false,
            priority: 20,
            suggestedWidth: 150,
            suggestedHeight: 150
          }),
          new wp.media.controller.Cropper({
            imgSelectOptions: settings.calculateImageSelectOptionsProfile
          })
        ]
      });

      settings.frame.on('select', settings.onSelect, settings);
      settings.frame.on('cropped', settings.onCropped, settings);
      settings.frame.on('skippedcrop', settings.onSkippedCrop, settings);

      settings.frame.open();
    },

    submitSettings: function(form_id) {
      if (typeof tinyMCE != 'undefined') {
        tinyMCE.triggerSave();
      }

      var self = $('form#' + form_id),
        form_data = self.serialize() + '&action=multistorex_settings&form_id=' + form_id;

      var isDisconnect = false;

      Multistorex_Settings.handleRequest( self, form_data, isDisconnect );
    },

    handleRequest: function ( self, form_data, isDisconnect ) {
      if (isDisconnect) {
        self.find('.ajax_prev.disconnect').append('<span class="multistorex-loading"> </span>');
      } else {
        self.find('.ajax_prev.save').append('<span class="multistorex-loading"> </span>');
      }

      $('.multistorex-update-setting-top-button span.multistorex-loading').remove();
      $('.multistorex-update-setting-top-button').append('<span class="multistorex-loading"> </span>');

      $.post(multistorex.ajaxurl, form_data, function(resp) {
        self.find('span.multistorex-loading').remove();
        $('.multistorex-update-setting-top-button span.multistorex-loading').remove();
        $('html,body').animate({ scrollTop: $('.multistorex-dashboard-header').offset().top });

        if (resp.success) {
          // Harcoded Customization for template-settings function
          $('.multistorex-ajax-response').html(
            $('<div/>', {
              class: 'multistorex-alert multistorex-alert-success',
              html: '<p>' + resp.data.msg + '</p>'
            })
          );

          $('.multistorex-ajax-response').append(resp.data.progress);

          if ( multistorex && multistorex.storeProgressBar ) {
            multistorex.storeProgressBar.init();
          }

          selectors = selectors.replaceAll( 'input', 'button' );
          if (isDisconnect){
            self.find(selectors).addClass('multistorex-hide');
          } else {
            self.find(selectors).removeClass('multistorex-hide');
          }
        } else {
          $('.multistorex-ajax-response').html(
            $('<div/>', {
              class: 'multistorex-alert multistorex-alert-danger',
              html: '<p>' + resp.data + '</p>'
            })
          );
        }
      });
    },

    validateForm: function(self) {
      $(
        'form#settings-form, form#profile-form, form#store-form, form#payment-form'
      ).validate({
        //errorLabelContainer: '#errors'
        submitHandler: function(form) {
          self.submitSettings(form.getAttribute('id'));
        },
        errorElement: 'span',
        errorClass: 'error',
        errorPlacement: validatorError,
        success: validatorSuccess,
        ignore:
          '.select2-search__field, :hidden, .mapboxgl-ctrl-geocoder--input'
      });
    },

    removeBanner: function(e) {
      e.preventDefault();

      var self = $(this);
      var wrap = self.closest('.image-wrap');
      var instruction = wrap.siblings('.button-area');

      wrap.find('input.multistorex-file-field').val('0');
      wrap.addClass('multistorex-hide');
      instruction.removeClass('multistorex-hide');
    },

    removeGravatar: function(e) {
      e.preventDefault();

      var self = $(this);
      var wrap = self.closest('.gravatar-wrap');
      var instruction = wrap.siblings('.gravatar-button-area');

      wrap.find('input.multistorex-file-field').val('0');
      wrap.addClass('multistorex-hide');
      instruction.removeClass('multistorex-hide');
    }
  };

  var Multistorex_Withdraw = {
    init: function() {
      var self = this;

      this.withdrawValidate(self);
    },

    withdrawValidate: function(self) {
      $('form.withdraw').validate({
        //errorLabelContainer: '#errors'

        errorElement: 'span',
        errorClass: 'error',
        errorPlacement: validatorError,
        success: validatorSuccess
      });
    }
  };

  var Multistorex_Seller = {
    init: function() {
      this.validate(this);
    },

    validate: function(self) {
      $('form#multistorex-form-contact-seller').validate({
        errorPlacement: validatorError,
        errorElement: 'span',
        success: function(label, element) {
          label.removeClass('error');
          label.remove();
        },
        submitHandler: async function(form, event) {
          event.preventDefault();

          $(form).block({
            message: null,
            overlayCSS: {
              background:
                '#fff url(' + multistorex.ajax_loader + ') no-repeat center',
              opacity: 0.6
            }
          });

          // Run recaptcha executer
          await multistorex_execute_recaptcha( 'form#multistorex-form-contact-seller .multistorex_recaptcha_token', 'multistorex_contact_seller_recaptcha' );

          var form_data = $(form).serialize();
          $.post(multistorex.ajaxurl, form_data, function(resp) {
            $(form).unblock();

            if (typeof resp.data !== 'undefined') {
              $(form)
                .find('.ajax-response')
                .html(resp.data);
            }

            $(form)
              .find('input[type=text], input[type=email], textarea, input[name=multistorex_recaptcha_token]')
              .val('')
              .removeClass('valid');
          });
        }
      });
    }
  };

  $(function() {
    Multistorex_Settings.init();
    Multistorex_Withdraw.init();
    Multistorex_Seller.init();

    $('.multistorex-form-horizontal').on(
      'change',
      'input[type=checkbox]#lbl_setting_minimum_quantity',
      function() {
        var showSWDiscount = $('.show_if_needs_sw_discount');
        if ($(this).is(':checked')) {
          showSWDiscount.find('input[type="number"]').val('');
          showSWDiscount.slideDown('slow');
        } else {
          showSWDiscount.slideUp('slow');
        }
      }
    );
  });
})(jQuery);

//localize Validation messages
(function($) {
  var multistorex_messages = MultistorexValidateMsg;

  multistorex_messages.maxlength = $.validator.format(multistorex_messages.maxlength_msg);
  multistorex_messages.minlength = $.validator.format(multistorex_messages.minlength_msg);
  multistorex_messages.rangelength = $.validator.format(
    multistorex_messages.rangelength_msg
  );
  multistorex_messages.range = $.validator.format(multistorex_messages.range_msg);
  multistorex_messages.max = $.validator.format(multistorex_messages.max_msg);
  multistorex_messages.min = $.validator.format(multistorex_messages.min_msg);

  $.validator.messages = multistorex_messages;

  $(document)
    .on('click', '#multistorex_store_tnc_enable', function(e) {
      if ($(this).is(':checked')) {
        $('#multistorex_tnc_text').show();
      } else {
        $('#multistorex_tnc_text').hide();
      }
    })
    .ready(function(e) {
      if ($('#multistorex_store_tnc_enable').is(':checked')) {
        $('#multistorex_tnc_text').show();
      } else {
        $('#multistorex_tnc_text').hide();
      }
    });
})(jQuery);

(function($) {
  var hasSelectiveRefresh =
    'undefined' !== typeof wp && wp.customize && wp.customize.selectiveRefresh;

  function resize_dummy_image() {
    var width = multistorex.store_banner_dimension.width,
      height =
        (multistorex.store_banner_dimension.height /
          multistorex.store_banner_dimension.width) *
        $('#multistorex-content').width();

    $('.multistorex-profile-frame-wrapper .profile-info-img.dummy-image').css({
      height: height
    });
  }

  resize_dummy_image();

  $(window).on('resize', function(e) {
    resize_dummy_image();
  });

  if (hasSelectiveRefresh) {
    wp.customize.selectiveRefresh.bind('partial-content-rendered', function(
      placement
    ) {
      console.log('placement', placement);
      if (placement.partial.id === 'store_header_template') {
        resize_dummy_image();
      }
    });
  }

  // Ajax product search box
  $(':input.multistorex-product-search')
    .filter(':not(.enhanced)')
    .each(function() {
      var select2_args = {
        allowClear: $(this).data('allow_clear') ? true : false,
        placeholder: $(this).data('placeholder'),
        minimumInputLength: $(this).data('minimum_input_length')
          ? $(this).data('minimum_input_length')
          : '3',
        escapeMarkup: function(m) {
          return m;
        },
        language: {
          errorLoading: function() {
            // Workaround for https://github.com/select2/select2/issues/4355 instead of i18n_ajax_error.
            return multistorex.i18n_searching;
          },
          inputTooLong: function(args) {
            var overChars = args.input.length - args.maximum;

            if (1 === overChars) {
              return multistorex.i18n_input_too_long_1;
            }

            return multistorex.i18n_input_too_long_n.replace('%qty%', overChars);
          },
          inputTooShort: function(args) {
            var remainingChars = args.minimum - args.input.length;

            if (1 === remainingChars) {
              return multistorex.i18n_input_too_short_1;
            }

            return multistorex.i18n_input_too_short_n.replace(
              '%qty%',
              remainingChars
            );
          },
          loadingMore: function() {
            return multistorex.i18n_load_more;
          },
          maximumSelected: function(args) {
            if (args.maximum === 1) {
              return multistorex.i18n_selection_too_long_1;
            }

            return multistorex.i18n_selection_too_long_n.replace(
              '%qty%',
              args.maximum
            );
          },
          noResults: function() {
            return multistorex.i18n_no_matches;
          },
          searching: function() {
            return multistorex.i18n_searching;
          }
        },
        ajax: {
          url: multistorex.ajaxurl,
          dataType: 'json',
          delay: 250,
          data: function(params) {
            return {
              term: params.term,
              action:
                $(this).data('action') ||
                'multistorex_json_search_products_and_variations',
              security: multistorex.search_products_nonce,
              exclude: $(this).data('exclude'),
              user_ids: $(this).data('user_ids'),
              include: $(this).data('include'),
              limit: $(this).data('limit')
            };
          },
          processResults: function(data) {
            var terms = [];

            if (data) {
              $.each(data, function(id, text) {
                terms.push({ id: id, text: text });
              });
            }
            return {
              results: terms
            };
          },
          cache: true
        }
      };

      // select2_args = $.extend( select2_args, {} );

      $(this)
        .select2(select2_args)
        .addClass('enhanced');

      if ($(this).data('sortable')) {
        var $select = $(this);
        var $list = $(this)
          .next('.select2-container')
          .find('ul.select2-selection__rendered');

        $list.sortable({
          placeholder: 'ui-state-highlight select2-selection__choice',
          forcePlaceholderSize: true,
          items: 'li:not(.select2-search__field)',
          tolerance: 'pointer',
          stop: function() {
            $(
              $list
                .find('.select2-selection__choice')
                .get()
                .reverse()
            ).each(function() {
              var id = $(this).data('data').id;
              var option = $select.find('option[value="' + id + '"]')[0];
              $select.prepend(option);
            });
          }
        });
      }
    });

  /**
   * Trigger bulk item checkbox selections
   */
  var bulkItemsSelection = {
    init: function() {
      selected_items = [];

      $('#cb-select-all').on('change', function(e) {
        var self = $(this);

        var item_id = $('.cb-select-items');

        if (self.is(':checked')) {
          item_id.each(function(key, value) {
            var item = $(value);
            item.prop('checked', 'checked');
          });
        } else {
          item_id.each(function(key, value) {
            $(value).prop('checked', '');
            selected_items.pop();
          });
        }
      });
    }
  };

  bulkItemsSelection.init();
})(jQuery);

(function($) {
  // Field validation error tips
  $(document.body)
    .on('wc_add_error_tip', function(e, element, error_type) {
      var offset = element.position();

      if (element.parent().find('.wc_error_tip').length === 0) {
        element.after(
          '<div class="wc_error_tip ' +
            error_type +
            '">' +
            multistorex[error_type] +
            '</div>'
        );
        element
          .parent()
          .find('.wc_error_tip')
          .css(
            'left',
            offset.left +
              element.width() -
              element.width() / 2 -
              $('.wc_error_tip').width() / 2
          )
          .css('top', offset.top + element.height())
          .fadeIn('100');
      }
    })

    .on('wc_remove_error_tip', function(e, element, error_type) {
      element
        .parent()
        .find('.wc_error_tip.' + error_type)
        .fadeOut('100', function() {
          $(this).remove();
        });
    })

    .on('click', function() {
      $('.wc_error_tip').fadeOut('100', function() {
        $(this).remove();
      });
    })

    .on(
      'blur',
      '.wc_input_decimal[type=text], .wc_input_price[type=text], .wc_input_country_iso[type=text]',
      function() {
        $('.wc_error_tip').fadeOut('100', function() {
          $(this).remove();
        });
      }
    )

    .on(
      'change',
      '.wc_input_price[type=text], .wc_input_decimal[type=text], .wc-order-totals #refund_amount[type=text]',
      function() {
        var regex,
          decimalRegex,
          decimailPoint = multistorex.decimal_point;

        if ($(this).is('.wc_input_price') || $(this).is('#refund_amount')) {
          decimailPoint = multistorex.mon_decimal_point;
        }

        regex = new RegExp('[^-0-9%\\' + decimailPoint + ']+', 'gi');
        decimalRegex = new RegExp('\\' + decimailPoint + '+', 'gi');

        var value = $(this).val();
        var newvalue = value
          .replace(regex, '')
          .replace(decimalRegex, decimailPoint);

        if (value !== newvalue) {
          $(this).val(newvalue);
        }
      }
    )

    .on(
      'keyup',
      // eslint-disable-next-line max-len
      '.wc_input_price[type=text], .wc_input_decimal[type=text], .wc_input_country_iso[type=text], .wc-order-totals #refund_amount[type=text]',
      function() {
        var regex, error, decimalRegex;
        var checkDecimalNumbers = false;

        if ($(this).is('.wc_input_price') || $(this).is('#refund_amount')) {
          checkDecimalNumbers = true;
          regex = new RegExp(
            '[^-0-9%\\' + multistorex.mon_decimal_point + ']+',
            'gi'
          );
          decimalRegex = new RegExp(
            '[^\\' + multistorex.mon_decimal_point + ']',
            'gi'
          );
          error = 'i18n_mon_decimal_error';
        } else if ($(this).is('.wc_input_country_iso')) {
          regex = new RegExp('([^A-Z])+|(.){3,}', 'im');
          error = 'i18n_country_iso_error';
        } else {
          checkDecimalNumbers = true;
          regex = new RegExp('[^-0-9%\\' + multistorex.decimal_point + ']+', 'gi');
          decimalRegex = new RegExp('[^\\' + multistorex.decimal_point + ']', 'gi');
          error = 'i18n_decimal_error';
        }

        var value = $(this).val();
        var newvalue = value.replace(regex, '');

        // Check if newvalue have more than one decimal point.
        if (
          checkDecimalNumbers &&
          1 < newvalue.replace(decimalRegex, '').length
        ) {
          newvalue = newvalue.replace(decimalRegex, '');
        }

        if (value !== newvalue) {
          $(document.body).triggerHandler('wc_add_error_tip', [$(this), error]);
        } else {
          $(document.body).triggerHandler('wc_remove_error_tip', [
            $(this),
            error
          ]);
        }
      }
    )

    .on(
      'change',
      '#_sale_price.wc_input_price[type=text], .wc_input_price[name^=variable_sale_price], #_subscription_sale_price.wc_input_price[type=text]',
      function() {
        var sale_price_field = $(this),
          product_type_selector = $('#product_type'),
          regular_price_field;

        if (sale_price_field.attr('name').indexOf('variable') !== -1) {
          regular_price_field = sale_price_field
            .parents('.variable_pricing')
            .find('.wc_input_price[name^=variable_regular_price]');
        } else if ( product_type_selector.length && 'subscription' === product_type_selector.find(':selected').val() ) {
          regular_price_field = $('#_subscription_price');
        } else {
          regular_price_field = $('#_regular_price');
        }

        var sale_price = parseFloat(
          window.accounting.unformat(
            sale_price_field.val(),
            multistorex.mon_decimal_point
          )
        );
        var regular_price = parseFloat(
          window.accounting.unformat(
            regular_price_field.val(),
            multistorex.mon_decimal_point
          )
        );

        if (sale_price >= regular_price) {
          $(this).val('');
        }
      }
    )

    .on(
      'keyup',
      '#_sale_price.wc_input_price[type=text], .wc_input_price[name^=variable_sale_price], #_subscription_sale_price.wc_input_price[type=text]',
      function() {
        var sale_price_field = $(this),
          product_type_selector = $('#product_type'),
          regular_price_field;

        if (sale_price_field.attr('name').indexOf('variable') !== -1) {
          regular_price_field = sale_price_field
            .parents('.variable_pricing')
            .find('.wc_input_price[name^=variable_regular_price]');
        } else if ( product_type_selector.length && 'subscription' === product_type_selector.find(':selected').val() ) {
          regular_price_field = $('#_subscription_price');
        } else {
          regular_price_field = $('#_regular_price');
        }

        var sale_price = parseFloat(
          window.accounting.unformat(
            sale_price_field.val(),
            multistorex.mon_decimal_point
          )
        );
        var regular_price = parseFloat(
          window.accounting.unformat(
            regular_price_field.val(),
            multistorex.mon_decimal_point
          )
        );

        if (sale_price >= regular_price) {
          $(document.body).triggerHandler('wc_add_error_tip', [
            $(this),
            'i18n_sale_less_than_regular_error'
          ]);
        } else {
          $(document.body).triggerHandler('wc_remove_error_tip', [
            $(this),
            'i18n_sale_less_than_regular_error'
          ]);
        }
      }
    )

    .on('init_tooltips', function() {
      $('.tips, .help_tip, .woocommerce-help-tip').tipTip({
        attribute: 'data-tip',
        fadeIn: 50,
        fadeOut: 50,
        delay: 200
      });

      $('.column-wc_actions .wc-action-button').tipTip({
        fadeIn: 50,
        fadeOut: 50,
        delay: 200
      });

      // Add tiptip to parent element for widefat tables
      $('.parent-tips').each(function() {
        $(this)
          .closest('a, th')
          .attr('data-tip', $(this).data('tip'))
          .tipTip({
            attribute: 'data-tip',
            fadeIn: 50,
            fadeOut: 50,
            delay: 200
          })
          .css('cursor', 'help');
      });
    });

    // Submenu navigation on vendor dashboard
    $( '#multistorex-navigation .multistorex-dashboard-menu li.has-submenu:not(.active)' )
    .on( 'mouseover', (e) => {
        multistorexNavigateSubmenu(e);
    } )
    .on( 'mouseout', (e) => {
        multistorexNavigateSubmenu( e, true );
    } );

    /**
     * Navigates submenu on hovering the parent menu.
     *
     * @param {event}   evt  The dom event
     * @param {boolean} hide Hide or show sub menu
     *
     * @return {void}
     */
    function multistorexNavigateSubmenu( evt, hide ) {
        const elem = $( evt.target ).closest( 'li.has-submenu' );

        elem.find( '.navigation-submenu' ).each( ( index, subElem ) => {
            if ( ! hide ) {
                elem.addClass( 'submenu-hovered' );

                let elemRect        = elem[0].getBoundingClientRect(),
                    subElemRect     = subElem.getBoundingClientRect(),
                    dashboard       = $( '.multistorex-dashboard-wrap' ),
                    dashboardRect   = dashboard[0].getBoundingClientRect(),
                    dashboardHeight = Math.min( dashboardRect.bottom, dashboardRect.height );

                if ( dashboardHeight < subElemRect.height ) {
                    let extendedHeight = subElemRect.height - dashboardHeight;
                    if ( elemRect.top < elemRect.height ) {
                        extendedHeight += elemRect.top;
                    }
                    dashboard.css( 'height', dashboardRect.height + extendedHeight );
                } else {
                    dashboard.css( 'height', '' );
                }

                if ( elemRect.top < elemRect.height ) {
                    $(subElem).css( 'bottom', 'unset' );
                    $(subElem).css( 'top', 0 );
                } else {
                    $(subElem).css( 'top', 'unset' );

                    let dist = elemRect.top - subElemRect.height;
                    if ( dist > 0 ) {
                        $(subElem).css( 'bottom', 0 );

                        subElemRect = subElem.getBoundingClientRect();
                        if ( subElemRect.top < 0 ) {
                            $(subElem).css( 'bottom', 'unset' );
                            $(subElem).css( 'top', 0 );
                        }
                    } else {
                        $(subElem).css( 'bottom', dist );

                        let navRect             = $( '.multistorex-dash-sidebar' )[0].getBoundingClientRect(),
                            navElderSiblingRect = $( '.entry-header' )[0].getBoundingClientRect();
                        subElemRect = subElem.getBoundingClientRect();

                        if ( subElemRect.bottom > navRect.bottom ) {
                            dist += subElemRect.bottom - navRect.bottom;
                        } else if ( subElemRect.bottom - navElderSiblingRect.bottom < subElemRect.height ) {
                            dist += subElemRect.bottom - navElderSiblingRect.bottom - subElemRect.height - 20;
                        }

                        $(subElem).css( 'bottom', dist );
                    }
                }
            } else {
                elem.removeClass( 'submenu-hovered' );
                $( '.multistorex-dashboard-wrap' ).css( 'height', '' );
                $(subElem).css( 'bottom', 0 );
                $(subElem).removeAttr( 'style' );
            }
        } );
    }
})(jQuery);
/**
 * Show Delete Button Prompt
 *
 * @param {object} event
 * @param {string} messgae
 *
 * @returns boolean
 */
window.multistorex_show_delete_prompt = async function ( event, messgae ) {
  event.preventDefault();

  let answer = await multistorex_sweetalert( messgae, {
    action  : 'confirm',
    icon    : 'warning'
  } );

  if( answer.isConfirmed && undefined !== event.target.href ) {
      window.location.href = event.target.href;
  }
  else if( answer.isConfirmed && undefined !== event.target.dataset.url ) {
      window.location.href = event.target.dataset.url;
  }
  else {
    return false;
  }
}

/**
 * Shows bulk action delete operation confirmation
 *
 * @param {object} event
 * @param {string} message
 * @param {string} inputSelector
 * @param {string} formSelector
 */
window.multistorex_bulk_delete_prompt = async function ( event, message, inputSelector, formSelector ) {
  if ( 'delete' === jQuery( inputSelector ).val() ) {
    // only prevent default if action is delete
    event.preventDefault();

    let answer = await multistorex_sweetalert( message, {
      action  : 'confirm',
      icon    : 'warning'
    } );

    if( answer.isConfirmed ) {
      jQuery( formSelector ).submit()
    }
  }
}