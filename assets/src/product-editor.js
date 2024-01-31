;(function($){

    var variantsHolder = $('#variants-holder');
    var product_gallery_frame;
    var product_featured_frame;
    var $image_gallery_ids = $('#product_image_gallery');
    var $product_images = $('#product_images_container ul.product_images');

    var Multistorex_Editor = {

        modal: false,
        /**
         * Constructor function
         */
        init: function() {

            product_type = 'simple';

            $('.product-edit-container').on( 'click', '.multistorex-section-heading', this.toggleProductSection );

            $('.product-edit-container').on('click', 'input[type=checkbox]#_downloadable', this.downloadable );
            $('.product-edit-container').on('click', 'a.sale-schedule', this.showDiscountSchedule );

            // gallery
            $('body, #multistorex-product-images').on('click', 'a.add-product-images', this.gallery.addImages );
            $('body, #multistorex-product-images').on( 'click', 'a.action-delete', this.gallery.deleteImage );
            this.gallery.sortable();

            // featured image
            $('body, .product-edit-container').on('click', 'a.multistorex-feat-image-btn', this.featuredImage.addImage );
            $('body, .product-edit-container').on('click', 'a.multistorex-remove-feat-image', this.featuredImage.removeImage );

            $('body, #variable_product_options').on( 'click', '.sale_schedule', this.saleSchedule );
            $('body, #variable_product_options').on( 'click', '.cancel_sale_schedule', this.cancelSchedule );

            // new product design variations
            $('.product-edit-container').on( 'change', 'input[type=checkbox]#_manage_stock', this.showManageStock );
            $( '.product-edit-container' ).on( 'click', 'a.upload_file_button', this.fileDownloadable );


            // File inputs
            $('body').on('click', 'a.insert-file-row', function(){
                $(this).closest('table').find('tbody').append( $(this).data( 'row' ) );
                return false;
            });

            $('body').on('click', 'a.multistorex-product-delete', function() {
                $(this).closest('tr').remove();
                return false;
            });

            $( 'body' ).on( 'submit', 'form.multistorex-product-edit-form', this.inputValidate );

            // For new desing in product page
            $( '.multistorex-product-listing' ).on( 'click', 'a.multistorex-add-new-product', this.addProductPopup );

            this.loadSelect2();
            this.bindProductTagDropdown();
            this.attribute.sortable();
            this.checkProductPostboxToggle();
            $( '.product-edit-container .multistorex-product-attribute-wrapper' ).on( 'click', 'a.multistorex-product-toggle-attribute, .multistorex-product-attribute-heading', this.attribute.toggleAttribute );
            $( '.product-edit-container .multistorex-product-attribute-wrapper' ).on( 'click', 'a.add_new_attribute', this.attribute.addNewAttribute );
            $( '.product-edit-container .multistorex-product-attribute-wrapper' ).on( 'keyup', 'input.multistorex-product-attribute-name', this.attribute.dynamicAttrNameChange );
            $( '.multistorex-product-attribute-wrapper ul.multistorex-attribute-option-list' ).on( 'click', 'button.multistorex-select-all-attributes', this.attribute.selectAllAttr );
            $( '.multistorex-product-attribute-wrapper ul.multistorex-attribute-option-list' ).on( 'click', 'button.multistorex-select-no-attributes', this.attribute.selectNoneAttr );
            $( '.multistorex-product-attribute-wrapper ul.multistorex-attribute-option-list' ).on( 'click', 'button.multistorex-add-new-attribute', this.attribute.addNewExtraAttr );
            $( '.product-edit-container .multistorex-product-attribute-wrapper' ).on( 'click', 'a.multistorex-product-remove-attribute', this.attribute.removeAttribute );
            $( '.product-edit-container .multistorex-product-attribute-wrapper' ).on( 'click', 'a.multistorex-save-attribute', this.attribute.saveAttribute );
            $( 'body' ).on( 'click', '.product-container-footer input[type="submit"]', this.createNewProduct );

            this.attribute.disbalePredefinedAttribute();

            $( 'body' ).trigger( 'multistorex-product-editor-loaded', this );
        },

        saleSchedule: function() {
            var $wrap = $(this).closest( '.multistorex-product-field-content', 'div, table' );
            $(this).hide();

            $wrap.find('.cancel_sale_schedule').show();
            $wrap.find('.sale_price_dates_fields').show();

            return false;
        },

        cancelSchedule: function() {
            var $wrap = $(this).closest( '.multistorex-product-field-content', 'div, table' );

            $(this).hide();
            $wrap.find('.sale_schedule').show();
            $wrap.find('.sale_price_dates_fields').hide();
            $wrap.find('.sale_price_dates_fields').find('input').val('');

            return false;
        },


        checkProductPostboxToggle: function() {
            var toggle = JSON.parse( localStorage.getItem( 'toggleClasses' ) );

            $.each( toggle, function(el, i) {
                var wrapper    = $( '.' + el.replace( /_/g, '-' ) ),
                    content    = wrapper.find( '.multistorex-section-content' ),
                    targetIcon = wrapper.find( 'i.fa-sort-desc' );

                if ( i ) {
                    content.show();
                    targetIcon.removeClass( 'fa-flip-horizointal' ).addClass( 'fa-flip-vertical' );
                    targetIcon.css( 'marginTop', '9px' );
                } else {
                    content.hide();
                    targetIcon.removeClass( 'fa-flip-vertical' ).addClass( 'fa-flip-horizointal' );
                    targetIcon.css( 'marginTop', '0px' );
                }
            });
        },

        toggleProductSection: function(e) {
            e.preventDefault();

            var self = $(this);
            if ( JSON.parse( localStorage.getItem( 'toggleClasses' ) ) != null ) {
                var toggleClasses = JSON.parse( localStorage.getItem( 'toggleClasses' ) );
            } else {
                var toggleClasses = {};
            }

            self.closest( '.multistorex-edit-row' ).find('.multistorex-section-content').slideToggle( 300, function() {
                if( $(this).is( ':visible' ) ) {
                    var targetIcon = self.find( 'i.fa-sort-desc' );
                    targetIcon.removeClass( 'fa-flip-horizointal' ).addClass( 'fa-flip-vertical' );
                    targetIcon.css( 'marginTop', '9px' );
                    toggleClasses[self.data('togglehandler')] = true;
                } else {
                    var targetIcon = self.find( 'i.fa-sort-desc' );
                    targetIcon.removeClass( 'fa-flip-vertical' ).addClass( 'fa-flip-horizointal' );
                    targetIcon.css( 'marginTop', '0px' );
                    toggleClasses[self.data('togglehandler')] = false;
                }

                localStorage.setItem( 'toggleClasses', JSON.stringify( toggleClasses ) );
            });

        },

        loadSelect2: function() {
            $('.multistorex-select2').select2(
                {
                    "language": {
                        "noResults": function () {
                            return multistorex.i18n_no_result_found;
                        }
                    }
                }
            );
        },

        bindProductTagDropdown: function () {
            $(".product_tag_search").select2({
                allowClear: false,
                tags: ( multistorex.product_vendors_can_create_tags && 'on' === multistorex.product_vendors_can_create_tags ),
                createTag: function ( $params ) {
                    var $term = $.trim( $params.term );
                    if ( $term === '' ) {
                      return null;
                    }

                    return {
                      id: $term,
                      text: $term,
                      newTag: true // add additional parameters
                    }
                },
                insertTag: function ( data, tag ) {
                    var $found = false;

                    $.each( data, function ( index, value ) {
                        if ( $.trim( tag.text ).toUpperCase() == $.trim( value.text ).toUpperCase() ) {
                            $found = true;
                        }
                    });

                    if ( ! $found ) data.unshift( tag );
                },
                minimumInputLength: 2,
                maximumSelectionLength: multistorex.maximum_tags_select_length !== undefined ? multistorex.maximum_tags_select_length : -1,
                ajax: {
                    url: multistorex.ajaxurl,
                    dataType: 'json',
                    delay: 250,
                    data: function (params) {
                        return {
                            q: params.term,
                            action: 'multistorex_json_search_products_tags',
                            security: multistorex.search_products_tags_nonce,
                            page: params.page || 1
                        };
                    },
                    processResults: function( data ) {
                        var options = [];
                        if ( data ) {
                            $.each( data, function( index, text ) {
                                options.push( { id: text[0], text: text[1]  } );
                            });
                        }
                        return {
                            results: options,
                            pagination: {
                                more: options.length == 0 ? false : true
                            }
                        };
                    },
                    cache: true
                },
                language: {
                    errorLoading: function() {
                        return multistorex.i18n_searching;
                    },
                    inputTooLong: function( args ) {
                        var overChars = args.input.length - args.maximum;

                        if ( 1 === overChars ) {
                            return multistorex.i18n_input_too_long_1;
                        }

                        return multistorex.i18n_input_too_long_n.replace( '%qty%', overChars );
                    },
                    inputTooShort: function( args ) {
                        var remainingChars = args.minimum - args.input.length;

                        if ( 1 === remainingChars ) {
                            return multistorex.i18n_input_too_short_1;
                        }

                        return multistorex.i18n_input_too_short_n.replace( '%qty%', remainingChars );
                    },
                    loadingMore: function() {
                        return multistorex.i18n_load_more;
                    },
                    maximumSelected: function( args ) {
                        if ( args.maximum === 1 ) {
                            return multistorex.i18n_selection_too_long_1;
                        }

                        return multistorex.i18n_selection_too_long_n.replace( '%qty%', args.maximum );
                    },
                    noResults: function() {
                        return multistorex.i18n_no_matches;
                    },
                    searching: function() {
                        return multistorex.i18n_searching;
                    }
                },
            });
        },

        addProductPopup: function (e) {
            e.preventDefault();
            Multistorex_Editor.openProductPopup();
        },

        openProductPopup: function() {
            const productTemplate = wp.template( 'multistorex-add-new-product' ),
                modalElem = $( '#multistorex-add-product-popup' );
                Multistorex_Editor.modal = modalElem.iziModal( {
                headerColor : multistorex.modal_header_color,
                overlayColor: 'rgba(0, 0, 0, 0.8)',
                width       : 690,
                top         : 32,
                onOpening   : () => {
                  Multistorex_Editor.reRenderPopupElements();
                },
                onClosed: () => {
                    product_gallery_frame  = undefined;
                    product_featured_frame = undefined;
                    $( '#multistorex-add-new-product-popup input[name="_sale_price_dates_from"], #multistorex-add-new-product-popup input[name="_sale_price_dates_to"]' ).datepicker( 'destroy' );
                },
            } );
            Multistorex_Editor.modal.iziModal( 'setContent', productTemplate().trim() );
            Multistorex_Editor.modal.iziModal( 'open' );
        },

        reRenderPopupElements: function() {
            Multistorex_Editor.loadSelect2();
            Multistorex_Editor.bindProductTagDropdown();

            $( '#multistorex-add-new-product-popup .sale_price_dates_fields input' ).daterangepicker({
                singleDatePicker: true,
                showDropdowns: false,
                autoApply: true,
                parentEl: '#multistorex-add-new-product-popup',
                opens: 'left',
                autoUpdateInput : false,
            } ).on( 'apply.daterangepicker', function( ev, picker ) {
                $( this ).val( picker.startDate.format( 'YYYY-MM-DD' ) );
            } );

            $( '.tips' ).tooltip();

            Multistorex_Editor.gallery.sortable();
            $( 'body' ).trigger( 'multistorex-product-editor-popup-opened', Multistorex_Editor );
        },

        createNewProduct: function (e) {
            e.preventDefault();

            var self = $(this),
                form = self.closest('form#multistorex-add-new-product-form'),
                btn_id = self.attr('data-btn_id');

            form.find( 'span.multistorex-show-add-product-success' ).html('');
            form.find( 'span.multistorex-show-add-product-error' ).html('');
            form.find( 'span.multistorex-add-new-product-spinner' ).css( 'display', 'inline-block' );

            self.attr( 'disabled', 'disabled' );

            if ( form.find( 'input[name="post_title"]' ).val() == '' ) {
                $( 'span.multistorex-show-add-product-error' ).html( multistorex.product_title_required );
                self.removeAttr( 'disabled' );
                form.find( 'span.multistorex-add-new-product-spinner' ).css( 'display', 'none' );
                return;
            }

            if ( form.find( 'select[name="product_cat"]' ).val() == '-1' ) {
                $( 'span.multistorex-show-add-product-error' ).html( multistorex.product_category_required );
                self.removeAttr( 'disabled' );
                form.find( 'span.multistorex-add-new-product-spinner' ).css( 'display', 'none' );
                return;
            }

            var data = {
                action:   'multistorex_create_new_product',
                postdata: form.serialize(),
                _wpnonce : multistorex.nonce
            };

            Multistorex_Editor.modal.iziModal('startLoading');
            $.post( multistorex.ajaxurl, data, function( resp ) {
                if ( resp.success ) {
                    self.removeAttr( 'disabled' );
                    if ( btn_id === 'create_new' ) {
                        $( '#multistorex-add-product-popup' ).iziModal('close');
                        window.location.href = resp.data;
                    } else {
                        product_featured_frame = undefined;
                        $('.multistorex-dashboard-product-listing-wrapper').load( window.location.href + ' table.product-listing-table' );
                        Multistorex_Editor.modal.iziModal('resetContent');
                        Multistorex_Editor.openProductPopup();
                        Multistorex_Editor.reRenderPopupElements();
                        $( 'span.multistorex-show-add-product-success' ).html( multistorex.product_created_response );

                        setTimeout(function() {
                            $( 'span.multistorex-show-add-product-success' ).html( '' );
                        }, 3000);
                    }
                } else {
                    self.removeAttr( 'disabled' );
                    $( 'span.multistorex-show-add-product-error' ).html( resp.data );
                }
                form.find( 'span.multistorex-add-new-product-spinner' ).css( 'display', 'none' );
            })
            .always( function () {
                Multistorex_Editor.modal.iziModal('stopLoading');
            });
        },

        attribute: {

            toggleAttribute: function(e) {
                e.preventDefault();

                var self = $(this),
                    list = self.closest('li'),
                    item = list.find('.multistorex-product-attribute-item');

                if ( $(item).hasClass('multistorex-hide') ) {
                    self.closest('.multistorex-product-attribute-heading').css({ borderBottom: '1px solid #e3e3e3' });
                    $(item).slideDown( 200, function() {
                        self.find('i.fa').removeClass('fa-flip-horizointal').addClass('fa-flip-vertical');
                        $(this).removeClass('multistorex-hide');
                        if ( ! $(e.target).hasClass( 'multistorex-product-attribute-heading' ) ) {
                            $(e.target).closest('a').css('top', '12px');
                        } else if ( $(e.target).hasClass( 'multistorex-product-attribute-heading' ) ) {
                            self.find( 'a.multistorex-product-toggle-attribute' ).css('top', '12px');
                        }
                    });
                } else {
                    $(item).slideUp( 200, function() {
                        $(this).addClass('multistorex-hide');
                        self.find('i.fa').removeClass('fa-flip-vertical').addClass('fa-flip-horizointal');
                        if ( ! $(e.target).hasClass('multistorex-product-attribute-heading') ) {
                            $(e.target).closest('a').css('top', '7px');
                        } else if ( $(e.target).hasClass( 'multistorex-product-attribute-heading' ) ) {
                            self.find('a.multistorex-product-toggle-attribute').css('top', '7px');
                        }
                        self.closest('.multistorex-product-attribute-heading').css({ borderBottom: 'none' });

                    })
                }
                return false;
            },

            sortable: function() {
                $('.multistorex-product-attribute-wrapper ul').sortable({
                    items: 'li.product-attribute-list',
                    cursor: 'move',
                    scrollSensitivity:40,
                    forcePlaceholderSize: true,
                    forceHelperSize: false,
                    helper: 'clone',
                    opacity: 0.65,
                    placeholder: 'multistorex-sortable-placeholder',
                    start:function(event,ui){
                        ui.item.css('background-color','#f6f6f6');
                    },
                    stop:function(event,ui){
                        ui.item.removeAttr('style');
                    },
                    update: function(event, ui) {
                        var attachment_ids = '';
                        Multistorex_Editor.attribute.reArrangeAttribute();
                    }
                });
            },

            dynamicAttrNameChange: function(e) {
                e.preventDefault();
                var self = $(this),
                    value = self.val();

                if ( value == '' ) {
                    self.closest( 'li' ).find( 'strong' ).html( multistorex.i18n_attribute_label );
                } else {
                    self.closest( 'li' ).find( 'strong' ).html( value );
                }
            },

            selectAllAttr: function(e) {
                e.preventDefault();
                $( this ).closest( 'li.product-attribute-list' ).find( 'select.multistorex_attribute_values option' ).attr( 'selected', 'selected' );
                $( this ).closest( 'li.product-attribute-list' ).find( 'select.multistorex_attribute_values' ).trigger( 'change' );
                return false;
            },

            selectNoneAttr: function(e) {
                e.preventDefault();
                $( this ).closest( 'li.product-attribute-list' ).find( 'select.multistorex_attribute_values option' ).removeAttr( 'selected' );
                $( this ).closest( 'li.product-attribute-list' ).find( 'select.multistorex_attribute_values' ).trigger( 'change' );
                return false;
            },

            reArrangeAttribute: function() {
                var attributeWrapper = $('.multistorex-product-attribute-wrapper').find('ul.multistorex-attribute-option-list');
                attributeWrapper.find( 'li.product-attribute-list' ).css( 'cursor', 'default' ).each(function( i ) {
                    $(this).find('.attribute_position').val(i);
                });
            },

            addNewExtraAttr: async function(e) {
                e.preventDefault();

                var $wrapper           = $(this).closest( 'li.product-attribute-list' );
                var attribute          = $wrapper.data( 'taxonomy' );
                let result             = await multistorex_sweetalert( multistorex.new_attribute_prompt, {
                    action : 'prompt',
                    input  :'text'
                } );
                var new_attribute_name = result.value;

                if ( new_attribute_name ) {

                    var data = {
                        action:   'multistorex_add_new_attribute',
                        taxonomy: attribute,
                        term:     new_attribute_name,
                        _wpnonce : multistorex.nonce
                    };

                    $.post( multistorex.ajaxurl, data, function( response ) {
                        if ( response.error ) {
                            multistorex_sweetalert( response.error, {
                                action : 'alert',
                                icon   : 'warning'
                            } );
                        } else if ( response.slug ) {
                            $wrapper.find( 'select.multistorex_attribute_values' ).append( '<option value="' + response.slug + '" selected="selected">' + response.name + '</option>' );
                            $wrapper.find( 'select.multistorex_attribute_values' ).trigger( 'change' );
                        }

                    });
                }
            },

            addNewAttribute: function(e) {
                e.preventDefault();

                var self  = $(this),
                    attrWrap  = self.closest('.multistorex-attribute-type').find('select#predefined_attribute'),
                    attribute = attrWrap.val(),
                    size         = $( 'ul.multistorex-attribute-option-list .product-attribute-list' ).length;


                var data = {
                    action   : 'multistorex_get_pre_attribute',
                    taxonomy : attribute,
                    i        : size,
                    _wpnonce : multistorex.nonce
                };

                self.closest('.multistorex-attribute-type').find('span.multistorex-attribute-spinner').removeClass('multistorex-hide');

                $.post( multistorex.ajaxurl, data, function( resp ) {
                    if ( resp.success ) {
                        var attributeWrapper = $('.multistorex-product-attribute-wrapper').find('ul.multistorex-attribute-option-list');
                        $html = $.parseHTML(resp.data);
                        $($html).find('.multistorex-product-attribute-item').removeClass('multistorex-hide');
                        $($html).find('i.fa.fa-sort-desc').removeClass('fa-flip-horizointal').addClass('fa-flip-vertical');
                        $($html).find('a.multistorex-product-toggle-attribute').css('top','12px');
                        $($html).find('.multistorex-product-attribute-heading').css({ borderBottom: '1px solid #e3e3e3' });

                        attributeWrapper.append( $html );
                        Multistorex_Editor.loadSelect2();
                        Multistorex_Editor.bindProductTagDropdown();
                        Multistorex_Editor.attribute.reArrangeAttribute();

                        if ( "variable" !== $( 'select#product_type' ).val() ) {
                            let labels = $( 'div.multistorex-product-attribute-wrapper label.show_if_variable' );

                            for( let label of labels ) {
                                let checkBox = $( label ).find('input[type="checkbox"]');

                                if ( checkBox.length > 0 && checkBox[0].getAttribute('name')?.startsWith('attribute_variation[') ) {
                                    $( label ).hide();
                                }
                            }
                        }
                    }

                    self.closest('.multistorex-attribute-type').find('span.multistorex-attribute-spinner').addClass('multistorex-hide');

                    if ( attribute ) {
                        attrWrap.find( 'option[value="' + attribute + '"]' ).attr( 'disabled','disabled' );
                        attrWrap.val( '' );
                    }
                })
                .done(function() {
                    $( 'select#product_type' ).trigger('change');
                });
            },

            removeAttribute: async function(evt) {
                evt.stopPropagation();
                evt.preventDefault();

                const isRemoved = await multistorex_sweetalert( multistorex.remove_attribute, {
                    action :'confirm',
                    icon   :'warning'
                } );

                if ( 'undefined' !== isRemoved && isRemoved.isConfirmed ) {
                    var $parent = $( this ).closest('li.product-attribute-list');

                    $parent.fadeOut( 300, function() {
                        if ( $parent.is( '.taxonomy' ) ) {
                            $parent.find( 'select, input[type=text]' ).val( '' );
                            $( 'select.multistorex_attribute_taxonomy' ).find( 'option[value="' + $parent.data( 'taxonomy' ) + '"]' ).removeAttr( 'disabled' );
                        } else {
                            $parent.find( 'select, input[type=text]' ).val( '' );
                            $parent.hide();
                        }

                        Multistorex_Editor.attribute.reArrangeAttribute();
                    });
                }

                return false;
            },

            saveAttribute: function(e) {
                e.preventDefault();

                var self = $(this),
                    data = {
                        post_id:  $('#multistorex-edit-product-id').val(),
                        data:     $( 'ul.multistorex-attribute-option-list' ).find( 'input, select, textarea' ).serialize(),
                        action:   'multistorex_save_attributes'
                    };

                $( '.multistorex-product-attribute-wrapper' ).block({
                    message: null,
                    fadeIn: 50,
                    fadeOut: 1000,
                    overlayCSS: {
                        background: '#fff',
                        opacity: 0.6
                    }
                });

                $.post( multistorex.ajaxurl, data, function( resp ) {
                    // Load variations panel.
                    $( '#multistorex-variable-product-options' ).load( window.location.toString() + ' #multistorex-variable-product-options-inner', function() {
                        $( '#multistorex-variable-product-options' ).trigger( 'reload' );
                        $( 'select#product_type' ).trigger('change');
                        $( '.multistorex-product-attribute-wrapper' ).unblock();
                    });
                });

            },

            disbalePredefinedAttribute: function() {
                $( 'ul.multistorex-attribute-option-list li.product-attribute-list' ).each( function( index, el ) {
                    if ( $( el ).css( 'display' ) !== 'none' && $( el ).is( '.taxonomy' ) ) {
                        $( 'select#predefined_attribute' ).find( 'option[value="' + $( el ).data( 'taxonomy' ) + '"]' ).attr( 'disabled', 'disabled' );
                    }
                });
            }
        },

        inputValidate: function( e ) {
            e.preventDefault();

            if ( $( '#post_title' ).val().trim() == '' ) {
                $( '#post_title' ).focus();
                $( 'div.multistorex-product-title-alert' ).removeClass('multistorex-hide');
                return;
            }else{
                $( 'div.multistorex-product-title-alert' ).hide();
            }

            if ( $( 'select.product_cat' ).val() == -1 ) {
                $( 'select.product_cat' ).focus();
                $( 'div.multistorex-product-cat-alert' ).removeClass('multistorex-hide');
                return;
            }else{
                $( 'div.multistorex-product-cat-alert' ).hide();
            }
            $( 'input[type=submit]' ).attr( 'disabled', 'disabled' );
            this.submit();
        },

        downloadable: function() {
            if ( $(this).prop('checked') ) {
                $(this).closest('aside').find('.multistorex-side-body').removeClass('multistorex-hide');
            } else {
                $(this).closest('aside').find('.multistorex-side-body').addClass('multistorex-hide');
            }
        },

        showDiscountSchedule: function(e) {
            e.preventDefault();
            $('.sale-schedule-container').slideToggle('fast');
        },

        showManageStock: function(e) {
            const product_type = $( '#product_type' ).val();

            if ( $(this).is(':checked') && 'external' !== product_type ) {
                $('.show_if_stock').slideDown('fast');
            } else {
                $('.show_if_stock').slideUp('fast');
            }

            if ( 'simple' === product_type ) {
                $(this).is(':checked') ? $('.hide_if_stock_global').slideUp('fast') : $('.hide_if_stock_global').slideDown('fast');
            }
        },

        gallery: {

            addImages: function(e) {
                e.preventDefault();

                var self = $(this),
                    p_images = self.closest('.multistorex-product-gallery').find('#product_images_container ul.product_images'),
                    images_gid = self.closest('.multistorex-product-gallery').find('#product_image_gallery');

                if ( product_gallery_frame ) {
                    product_gallery_frame.open();
                    return;
                } else {
                    // Create the media frame.
                    product_gallery_frame = wp.media({
                        // Set the title of the modal.
                        title: multistorex.i18n_choose_gallery,
                        library: {
                            type: 'image',
                        },
                        button: {
                            text: multistorex.i18n_choose_gallery_btn_text,
                        },
                        multiple: true
                    });

                    product_gallery_frame.on( 'select', function() {

                        var selection = product_gallery_frame.state().get('selection');

                        selection.map( function( attachment ) {
                            attachment     = attachment.toJSON();
                            attachment_ids = [];

                            // Check if attachment doesn't exist or attachment type is not image
                            if ( ! attachment.id || 'image' !== attachment.type ) {
                                return;
                            }

                            $('<li class="image" data-attachment_id="' + attachment.id + '">\
                                    <img src="' + attachment.url + '" />\
                                    <a href="#" class="action-delete">&times;</a>\
                                </li>').insertBefore( p_images.find('li.add-image') );

                            $('#product_images_container ul li.image').css('cursor','default').each(function() {
                                var attachment_id = jQuery(this).attr( 'data-attachment_id' );
                                attachment_ids.push( attachment_id );
                            });

                            images_gid.val( attachment_ids.join(',') );
                        } );
                    });

                    product_gallery_frame.open();
                }

            },

            deleteImage: function(e) {
                e.preventDefault();

                var self = $(this),
                    p_images = self.closest('.multistorex-product-gallery').find('#product_images_container ul.product_images'),
                    images_gid = self.closest('.multistorex-product-gallery').find('#product_image_gallery');

                self.closest('li.image').remove();

                var attachment_ids = [];

                $('#product_images_container ul li.image').css('cursor','default').each(function() {
                    var attachment_id = $(this).attr( 'data-attachment_id' );
                    attachment_ids.push( attachment_id );
                });

                images_gid.val( attachment_ids.join(',') );

                return false;
            },

            sortable: function() {
                // Image ordering
                $('body').find('#product_images_container ul.product_images').sortable({
                    items: 'li.image',
                    cursor: 'move',
                    scrollSensitivity:40,
                    forcePlaceholderSize: true,
                    forceHelperSize: false,
                    helper: 'clone',
                    opacity: 0.65,
                    placeholder: 'multistorex-sortable-placeholder',
                    start:function(event,ui){
                        ui.item.css('background-color','#f6f6f6');
                    },
                    stop:function(event,ui){
                        ui.item.removeAttr('style');
                    },
                    update: function(event, ui) {
                        var attachment_ids = [];

                        $('body').find('#product_images_container ul li.image').css('cursor','default').each(function() {
                            var attachment_id = jQuery(this).attr( 'data-attachment_id' );
                            attachment_ids.push( attachment_id );
                        });

                        $('body').find('#product_image_gallery').val( attachment_ids.join(',') );
                    }
                });
            }
        },

        featuredImage: {

            addImage: function(e) {
                e.preventDefault();

                var self = $(this);

                if ( product_featured_frame ) {
                    product_featured_frame.open();
                    return;
                } else {
                    product_featured_frame = wp.media({
                        // Set the title of the modal.
                        title: multistorex.i18n_choose_featured_img,
                        library: {
                            type: 'image',
                        },
                        button: {
                            text: multistorex.i18n_choose_featured_img_btn_text,
                        }
                    });

                    product_featured_frame.on('select', function() {
                        var selection = product_featured_frame.state().get('selection');

                        selection.map( function( attachment ) {
                            attachment = attachment.toJSON();

                            // Check if the attachment type is image.
                            if ( 'image' !== attachment.type ) {
                                return;
                            }

                            // set the image hidden id
                            self.siblings('input.multistorex-feat-image-id').val(attachment.id);

                            // set the image
                            var instruction = self.closest('.instruction-inside');
                            var wrap = instruction.siblings('.image-wrap');

                            // wrap.find('img').attr('src', attachment.sizes.thumbnail.url);
                            wrap.find('img').attr('src', attachment.url);
                            wrap.find('img').removeAttr( 'srcset' );

                            instruction.addClass('multistorex-hide');
                            wrap.removeClass('multistorex-hide');
                        });
                    });

                    product_featured_frame.open();
                }
            },

            removeImage: function(e) {
                e.preventDefault();

                var self = $(this);
                var wrap = self.closest('.image-wrap');
                var instruction = wrap.siblings('.instruction-inside');

                instruction.find('input.multistorex-feat-image-id').val('0');
                wrap.addClass('multistorex-hide');
                instruction.removeClass('multistorex-hide');
            }
        },

        fileDownloadable: function(e) {
            e.preventDefault();

            var self = $(this),
                downloadable_frame;

            if ( downloadable_frame ) {
                downloadable_frame.open();
                return;
            }

            downloadable_frame = wp.media({
                title: multistorex.i18n_choose_file,
                button: {
                    text: multistorex.i18n_choose_file_btn_text,
                },
                multiple: true
            });

            downloadable_frame.on('select', function() {
                var selection = downloadable_frame.state().get('selection');

                selection.map( function( attachment ) {
                    attachment = attachment.toJSON();

                    self.closest('tr').find( 'input.wc_file_url, input.wc_variation_file_url').val(attachment.url);
                });
            });

            downloadable_frame.on( 'ready', function() {
                downloadable_frame.uploader.options.uploader.params = {
                    type: 'downloadable_product'
                };
            });

            downloadable_frame.open();
        }
    };

    // On DOM ready
    $(function() {
        Multistorex_Editor.init();

        // PRODUCT TYPE SPECIFIC OPTIONS.
        $( 'select#product_type' ).on( 'change', function() {
            // Get value.
            var select_val = $( this ).val();

            if ( 'variable' === select_val ) {
                $( 'input#_manage_stock' ).trigger( 'change' );
                $( 'input#_downloadable' ).prop( 'checked', false );
                $( 'input#_virtual' ).removeAttr( 'checked' );
            }

            show_and_hide_panels();

            $( document.body ).trigger( 'multistorex-product-type-change', select_val, $( this ) );

        }).trigger( 'change' );

        $('.product-edit-container').on('change', 'input#_downloadable, input#_virtual', function() {
            show_and_hide_panels();
        }).trigger( 'change' );

        $( 'input#_downloadable' ).trigger( 'change' );
        $( 'input#_virtual' ).trigger( 'change' );

        function show_and_hide_panels() {
            var product_type    = $( '#product_type' ).val();
            var is_virtual      = $( 'input#_virtual:checked' ).length;
            var is_downloadable = $( 'input#_downloadable:checked' ).length;
            let shippingTaxContainer  = $( '.multistorex-product-shipping-tax' );

            // Hide/Show all with rules.
            var hide_classes = '.hide_if_downloadable, .hide_if_virtual';
            var show_classes = '.show_if_downloadable, .show_if_virtual';

            $.each( Object.keys( multistorex.product_types ), function( index, value ) {
                hide_classes = hide_classes + ', .hide_if_' + value;
                show_classes = show_classes + ', .show_if_' + value;
            });

            $( hide_classes ).show();
            $( show_classes ).hide();

            // Shows rules.
            if ( is_downloadable ) {
                $( '.show_if_downloadable' ).show();
            }
            if ( is_virtual ) {
                $( '.show_if_virtual' ).show();
            }

            $( '.show_if_' + product_type ).show();

            // Hide rules.
            if ( is_downloadable ) {
                $( '.hide_if_downloadable' ).hide();
            }
            if ( is_virtual ) {
                $( '.hide_if_virtual' ).hide();

                if ( 1 === $( '.multistorex-product-shipping-tax .multistorex-section-content' ).first().children().length ) {
                    shippingTaxContainer.hide();
                } else {
                    if ( shippingTaxContainer.hasClass('hide_if_virtual') ) {
                        shippingTaxContainer.removeClass('hide_if_virtual');
                    }

                    shippingTaxContainer.show();
                }
            } else {
                shippingTaxContainer.show();
            }

            $( '.hide_if_' + product_type ).hide();

            $( 'input#_manage_stock' ).trigger( 'change' );
        }

        // Sale price schedule.
        $( '.sale_price_dates_fields' ).each( function() {
            var $these_sale_dates = $( this );
            var sale_schedule_set = false;
            var $wrap = $these_sale_dates.closest( 'div, table' );

            $these_sale_dates.find( 'input' ).each( function() {
                if ( '' !== $( this ).val() ) {
                    sale_schedule_set = true;
                }
            });

            if ( sale_schedule_set ) {
                $wrap.find( '.sale_schedule' ).hide();
                $wrap.find( '.sale_price_dates_fields' ).show();
            } else {
                $wrap.find( '.sale_schedule' ).show();
                $wrap.find( '.sale_price_dates_fields' ).hide();
            }
        });

        $( '.product-edit-container' ).on( 'click', '.sale_schedule', function() {
            var $wrap = $(this).closest( '.product-edit-container, div.multistorex-product-variation-itmes, table' );
            $( this ).hide();
            $wrap.find( '.cancel_sale_schedule' ).show();
            $wrap.find( '.sale_price_dates_fields' ).show();

            return false;
        });

        $( '.product-edit-container' ).on( 'click', '.cancel_sale_schedule', function() {
            var $wrap = $( '.product-edit-container, div.multistorex-product-variation-itmes, table' );

            $( this ).hide();
            $wrap.find( '.sale_schedule' ).show();
            $wrap.find( '.sale_price_dates_fields' ).hide();
            $wrap.find( '.sale_price_dates_fields' ).find( 'input' ).val('');

            return false;
        });

        /**
         * Handle the editing of the post_name. Create the required HTML elements and
         * update the changes via Ajax.
         *
         * @global
         *
         * @return {void}
         */
        function multistorexProductEditPermalink() {
            var i, slug_value,
                $el, revert_e,
                c              = 0,
                real_slug      = $('#post_name'),
                revert_slug    = real_slug.val(),
                permalink      = $( '#sample-permalink' ),
                permalinkOrig  = permalink.html(),
                permalinkInner = $( '#sample-permalink a' ).html(),
                buttons        = $('#edit-slug-buttons'),
                buttonsOrig    = buttons.html(),
                full           = $('#editable-post-name-full');

            // Deal with Twemoji in the post-name.
            full.find( 'img' ).replaceWith( function() { return this.alt; } );
            full = full.html();

            permalink.html( permalinkInner );

            // Save current content to revert to when cancelling.
            $el      = $( '#editable-post-name' );
            revert_e = $el.html();

            buttons.html( '<button type="button" class="save button button-small">' + multistorex.i18n_ok_text + '</button> <button type="button" class="cancel button-link">' + multistorex.i18n_cancel_text + '</button>' );

            // Save permalink changes.
            buttons.children( '.save' ).on( 'click', function() {
                var new_slug = $el.children( 'input' ).val();

                if ( new_slug == $('#editable-post-name-full').text() ) {
                    buttons.children('.cancel').trigger( 'click' );
                    return;
                }

                $.post(
                    ajaxurl,
                    {
                        action: 'sample-permalink',
                        post_id: $('#multistorex-edit-product-id').val(),
                        new_slug: new_slug,
                        new_title: $('#post_title').val(),
                        samplepermalinknonce: $('#samplepermalinknonce').val()
                    },
                    function(data) {
                        var box = $('#edit-slug-box');
                        box.html(data);
                        if (box.hasClass('hidden')) {
                            box.fadeIn('fast', function () {
                                box.removeClass('hidden');
                            });
                        }

                        buttons.html(buttonsOrig);
                        permalink.html(permalinkOrig);
                        real_slug.val(new_slug);
                        $( '.edit-slug' ).focus();
                        $( '#editable-post-name-full-multistorex' ).val( $('#editable-post-name-full').html() );
                    }
                );
            });

            // Cancel editing of permalink.
            buttons.children( '.cancel' ).on( 'click', function() {
                $('#view-post-btn').show();
                $el.html(revert_e);
                buttons.html(buttonsOrig);
                permalink.html(permalinkOrig);
                real_slug.val(revert_slug);
                $( '.edit-slug' ).focus();
            });

            // If more than 1/4th of 'full' is '%', make it empty.
            for ( i = 0; i < full.length; ++i ) {
                if ( '%' == full.charAt(i) )
                    c++;
            }
            slug_value = ( c > full.length / 4 ) ? '' : full;

            $el.html( '<input type="text" id="new-post-slug" value="' + slug_value + '" autocomplete="off" />' ).children( 'input' ).on( 'keydown', function( e ) {
                var key = e.which;
                // On [Enter], just save the new slug, don't save the post.
                if ( 13 === key ) {
                    e.preventDefault();
                    buttons.children( '.save' ).trigger('click');
                }
                // On [Esc] cancel the editing.
                if ( 27 === key ) {
                    buttons.children( '.cancel' ).trigger('click');
                }
            } ).on( 'keyup', function() {
                real_slug.val( this.value );
            }).focus();
        }

        $( '#multistorex-product-title-area' ).on( 'click', '.edit-slug', function() {
            multistorexProductEditPermalink();
        });

        if ( $('#multistorex-edit-product-id').val() && $('#post_title').val() && $('#samplepermalinknonce').val() ) {
            $.post(
                ajaxurl,
                {
                    action: 'sample-permalink',
                    post_id: $('#multistorex-edit-product-id').val(),
                    new_slug: $('#edited-post-name-multistorex').val(),
                    new_title: $('#post_title').val(),
                    samplepermalinknonce: $('#samplepermalinknonce').val()
                },
                function(data) {
                    var box = $('#edit-slug-box');
                    box.html(data);
                }
            );
        }

        function debounce_delay( callback, ms ) {
            var timer   = 0;
            return function() {
                var context = this, args = arguments;
                clearTimeout(timer);
                timer = setTimeout(function () {
                  callback.apply(context, args);
                }, ms || 0);
            };
        }

        $( window ).on( "load", function (){
            if ( $( 'input#_virtual:checked' ).length ) {
                show_and_hide_panels();
            }
        });
    });
})(jQuery);