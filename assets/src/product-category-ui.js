;( function( $ ) {
    let modal                 = $( '#multistorex-product-category-modal' );
    let searchResultContainer = $( '#multistorex-cat-search-res' );
    let searchResUl           = $( '#multistorex-cat-search-res-ul' );
    let rightIndicator        = $( '.multistorex-single-categories-right' );
    let leftIndicator         = $( '.multistorex-single-categories-left' );

    let categoriesState   = [];
    let searchResultState = [];
    let inputHolder       = '';
    let selectedFrom      = 0;
    let selectedCatId     = '';

    var ProductCategory = {

        init() {

            $( 'body' ).on( 'click', '.multistorex-product-category-li', this.categoryLiClick );

            $( 'body' ).on( 'click', '.multistorex-cat-search-res-li', this.clickSearchResLi );

            $( 'body' ).on( 'keyup', '#multistorex-single-cat-search-input', ProductCategory.debounce( this.typeToSearch, 500 ) );

            $( 'body' ).on ( 'scroll', '#multistorex-single-categories', this.categoryScroll );

            $( 'body' ).on( 'click', '.multistorex-single-categories-right-box', ProductCategory.indicatorScrollTo );

            $( 'body' ).on( 'click', '.multistorex-single-categories-left-box', function() {
                ProductCategory.indicatorScrollTo( false );
            } );

            $( 'body' ).on( 'click', '.multistorex-single-cat-select-btn', ProductCategory.chooseCatButton );

            $( 'body' ).on( 'click', '.multistorex-category-open-modal', ProductCategory.initModal );

            $( 'body' ).on( 'click', '#multistorex-category-close-modal', ProductCategory.hideCategoryModal );

            $( 'body' ).on( 'click', '.multistorex-single-cat-add-btn', ProductCategory.addANewCatBox );

            $( 'body' ).on( 'click', '.multistorex-select-product-category-remove-container', ProductCategory.removeCatBox );
        },

        initModal() {
            inputHolder   = $( this ).data( 'multistorexsclevel' );
            selectedFrom  = $( this ).data( 'selectfor' );
            let chosenCat = $( this ).siblings( ".multistorex-cat-inputs-holder" ).find( ".multistorex_chosen_product_cat" );
            $(this).parent().attr('data-activate', 'yes');

            ProductCategory.openModal( chosenCat );
        },

        removeCatBox() {
            $( this ).closest( '.multistorex-select-product-category-container' )[0].remove();
        },

        categoryLiClick() {
            let { catlevel, termId, name, haschild } = $( this ).data();
            selectedCatId = termId;

            ProductCategory.removeAfterClickedUls( catlevel, termId );
            ProductCategory.loadChildCategories( catlevel, termId, name, haschild );
        },

        clickSearchResLi() {
            let { termid, index, name } = $( this ).data();
            if ( termid ) {
                selectedCatId = termid;
                ProductCategory.setCatUiBasedOnOneCat( termid, searchResultState[ index ] );
            }
        },

        typeToSearch() {
            let inputText = $( this ).val();
            $( '#multistorex-cat-search-text-limit' ).html( inputText.length );

            if ( inputText.length > 0 ) {
                ProductCategory.hideSearchResults( false );
                ProductCategory.doSearchCates( inputText );
            } else {
                ProductCategory.hideSearchResults();
            }
        },

        categoryScroll() {
            let totalScrollable = $( '#multistorex-single-categories' ).get( 0 ).scrollWidth - $( '#multistorex-single-categories' ).innerWidth();
            let left = $( this ).scrollLeft();
            let right = totalScrollable - left;

            ProductCategory.showIndicators( leftIndicator, left );
            ProductCategory.showIndicators( rightIndicator, right );
        },

        chooseCatButton() {
            let category_box = `.multistorex-select-product-category-container.multistorex_select_cat_for_${selectedFrom}_${inputHolder}[data-activate='yes']`;
            let cat_exists_in_list = $(category_box).parent().children( '.multistorex-select-product-category-container' ).children( '.multistorex-cat-inputs-holder' ).find(`.multistorex_chosen_product_cat_${selectedCatId}`).length;

            if ( cat_exists_in_list ) {
                multistorex_sweetalert( multistorex_product_category_data.i18n.duplicate_category, { icon: 'warning', } );
                return;
            }

            ProductCategory.setCatName( ProductCategory.getSelectedLabel(), $( category_box ) );
            ProductCategory.setCatId( selectedCatId, $( category_box ) );
            ProductCategory.hideCategoryModal();

            // Any one can use this hook and do anything after any category is selected.
            wp.hooks.doAction( 'multistorex_selected_multistep_category', selectedCatId );

            $(category_box).attr('data-activate', 'no');
        },

        setCatUiBasedOnOneCat: function( catId, category ) {
            let disable = undefined !== category.children.length && category.children.length > 0
            ProductCategory.disableDoneBtn( disable );

            let allUl = [ ...category.parents ];
            let selectedInUls = [ ...category.parents ];

            allUl.unshift( 0 );
            selectedInUls.push( Number( catId ) );

            let UL = allUl.map( ( id, index ) => {
                return ProductCategory.getCategoriesWithParentId( id, index + 1, selectedInUls[ index ] );
            });

            categoriesState = UL;
            ProductCategory.updateCategoryUi();

            ProductCategory.hideSearchResults();
            ProductCategory.scrollTo( UL.length );
        },

        async doSearchCates( text ) {
            let searchResult = [];
            for ( const key in multistorex_product_category_data.categories ) {
                let category = multistorex_product_category_data.categories[ key ];
                let fullText = category.name;
                text = text.toLowerCase();
                let found    = fullText.toLowerCase().indexOf( text );

                if ( found >= 0 ) {
                    searchResult.push( category );
                }
            }

            searchResultState = searchResult;
            ProductCategory.updateSearchResultUi();
        },

        hideSearchResults( status = true ) {
            status ? searchResultContainer.addClass( 'multistorex-hide' ) : searchResultContainer.removeClass( 'multistorex-hide' );
        },

        showIndicators( element, scrolled ) {
            ( scrolled > 5 ) ? element.removeClass( 'multistorex-hide' ) : element.addClass( 'multistorex-hide' );
        },

        showCategoryModal() {
            selectedCatId = '';
            ProductCategory.disableDoneBtn();
            modal.css( 'display', 'flex' );
            ProductCategory.hideSearchResults();
            $( '#multistorex-single-cat-search-input' ).val('');

            categoriesState = [];
            ProductCategory.loadAllParentCategories();
        },

        disableDoneBtn( disable = true ) {
            $( '.multistorex-single-cat-select-btn' ).prop( 'disabled', disable );
        },

        hideCategoryModal() {
            modal.css( 'display', 'none' );

            $('.multistorex-select-product-category-container').attr('data-activate', 'no');
        },

        loadAllParentCategories() {
            categoriesState.push( ProductCategory.getCategoriesWithParentId() );
            ProductCategory.updateCategoryUi();
        },

        getCategoriesWithParentId( parentId = 0, level = 1, selectedId = false ) {
            let returnableCategories = [];

            for ( const key in multistorex_product_category_data.categories ) {
                let currentCategory = multistorex_product_category_data.categories[ key ];
                if ( currentCategory.parent_id == parentId ) {
                    currentCategory.uiActivaion = Number( currentCategory.term_id ) === selectedId ? 'multistorex-product-category-li-active' : false;
                    returnableCategories.push( currentCategory );
                }
            }

            // sort categories by name
            returnableCategories.sort((a,b) => (a.name.toLowerCase() > b.name.toLowerCase()) ? 1 : ((b.name.toLowerCase() > a.name.toLowerCase()) ? -1 : 0))

            return {
                categories: returnableCategories,
                level: level,
                term_id: parentId,
            };
        },

        loadChildCategories( catlevel, termId, name, haschild ) {
            /**
             * If enabled any one middle category in multistorex product multi-step category selection.
             */
            const middleCategorySelection = multistorex_product_category_data.any_category_selection;

            // If selected category has no child OR middle category selection is true then enable the category select done button else disable.
            if ( ! haschild || true === Boolean( middleCategorySelection ) ) {
                ProductCategory.disableDoneBtn(false);
            } else {
                ProductCategory.disableDoneBtn();
            }

            // If the selected category has more children category then show them.
            if (haschild) {
                let categories = ProductCategory.getCategoriesWithParentId( termId, catlevel + 1 );
                categoriesState.push( categories );
                ProductCategory.updateCategoryUi();
                ProductCategory.scrollTo( catlevel );
            }
        },

        updateSearchResultUi() {
            let html = '';

            html = searchResultState.map( ( element, index ) => {
                return `<li data-name="${ element.name }" data-termid="${ element.term_id }" data-index="${ index }" class="multistorex-cat-search-res-li">
                        <div class="multistorex-cat-search-res-item">
                            ${ element.name }
                        </div>
                        <div class="multistorex-cat-search-res-history">
                            ${ ProductCategory.getSearchedParentHistory( element.parents, element.name ) }
                        </div>
                    </li>`;
            });

            if ( 0 == searchResultState.length ) {
                html = `<li data-name="" data-termid="" data-index="" class="multistorex-cat-search-res-li">
                        <div class="multistorex-cat-search-res-item">
                            ${ window.multistorex.i18n_no_result_found }
                        </div>
                        <div class="multistorex-cat-search-res-history">
                        </div>
                    </li>`;
            }

            searchResUl.html( html );
        },

        getSearchedParentHistory( parents, searched ) {
            let html = "";

            html = parents.map( ( parentId, index ) => {
                return `<span class="multistorex-cat-search-res-suggestion">${ ProductCategory.findCategory( parentId ).name }</span>
                    <span class="multistorex-cat-search-res-indicator"><i class="fas fa-caret-right"></i></span>`;
            }).join('');

            html += `<span class="multistorex-cat-search-res-suggestion-selected">${ ProductCategory.highlight( searched ) }</span>`;

            return html;
        },

        highlight( fullText ) {
            let text = $( '#multistorex-single-cat-search-input' ).val().toLowerCase();
            let index = fullText.toLowerCase().indexOf( text );

            if ( index >= 0 ) {
                return `<span>${ fullText.substring( 0, index ) }</span>
                    <span class='multistorex-cat-highlight'>${ fullText.substring( index, index + text.length ) }</span>
                    <span>${ fullText.substring( index + text.length ) }</span>`;
            }
        },

        updateCategoryUi() {
            let html = ProductCategory.getCatUlHtml();

            $( '#multistorex-single-categories' ).html( html );
            ProductCategory.updateSelectedLabel();
            ProductCategory.adjustCategoryPosition();
        },

        updateSelectedLabel() {
            $( '#multistorex-selected-category-span' ).html( ProductCategory.getSelectedLabel() );
        },

        adjustCategoryPosition() {
            $.each(  $('.multistorex-product-category-ul').find('.multistorex-product-category-li-active'), function ( index, item ) {
                let { catlevel, indexli } = $(item).data();
                $( `#${catlevel}-level-cat-ul` ).scrollTop( 36.38 * indexli );
            } );
        },

        getSelectedLabel() {
            let activatedLi = $( '.multistorex-product-category-li-active' );
            let liLength    = activatedLi.length;
            let ui          = '';

            activatedLi.each( ( index, obj ) => {
                var allDataSets = obj.dataset;

                ui += `<span class="multistorex-selected-category-product ${ liLength == index + 1 ? 'multistorex-cat-selected' : '' }">${ allDataSets.name }</span>
                ${ liLength != index + 1 ? '<span class="multistorex-selected-category-icon"><i class="fas fa-chevron-right"></i></span>' : '' }`;
            });

            return ui;
        },

        updateCategorySelection( catlevel, termId ) {
            let expectedLi = categoriesState[ catlevel - 1 ];
            let updatedLi  = expectedLi.categories.map( element => {
                element.term_id == termId ? element.uiActivaion = 'multistorex-product-category-li-active' : element.uiActivaion = '';
                return element;
            });

            categoriesState[ catlevel - 1 ].categories = updatedLi;
            ProductCategory.updateCategoryUi();
        },

        getCatUlHtml() {
            let html = categoriesState.map( ( element, index ) => {
                let li = ProductCategory.getCatLiHtml( element.categories, element.level );
                return `<ul id="${ element.level }-level-cat-ul" class="multistorex-product-category-ul ${ element.level }-level-cat" data-level="${ element.level }">${ li }</ul>`;
            });

            return html;
        },

        getCatLiHtml( element, level ) {
            let html = '';

            element.forEach( ( category, index ) => {
                html += `<li data-indexli="${ index }" data-haschild="${ category.children.length > 0 }" data-name="${ category.name }" data-catLevel="${ level }" class="${ category.uiActivaion ? category.uiActivaion : '' } multistorex-product-category-li ${ category.children.length > 0 ? 'multistorex-cat-has-child' : '' }" data-term-id="${ category.term_id }" data-taxonomy="product_cat">
                        <span class="multistorex-product-category">${ category.name }</span>
                        <span class="multistorex-product-category-icon"><i class="fas fa-chevron-right"></i></span>
                    </li>`;
            });

            return html;
        },

        removeAfterClickedUls( catlevel, termId ) {
            let newCategories = categoriesState.filter( data => {
                if ( data.level <= catlevel ) {
                    return data;
                }
            });

            categoriesState = newCategories;
            ProductCategory.updateCategorySelection( catlevel, termId );
        },

        scrollTo( to = 0 ) {
            $( '#multistorex-single-categories' ).animate( { scrollLeft: 300 * to }, 800 );
        },

        indicatorScrollTo( left = true ) {
            $( '#multistorex-single-categories' ).animate( { scrollLeft: `${ left ? '+' : '-' }=350px` }, 800 );
        },

        setCatId( id, category_box ) {
            let ui = `<input data-field-name="chosen_product_cat" type="hidden" class="multistorex_chosen_product_cat multistorex_chosen_product_cat_${id}" name="chosen_product_cat[]" value="${ id }"></input>`;
            ui += `<input type="hidden" name="chosen_product_cat_bulk[]" value="${ id }"></input>`;

            category_box.children( `.multistorex-cih-level-${ inputHolder }` ).html( ui );
        },

        setCatName( name, category_box ) {
            category_box.children( '.multistorex-select-product-category' ).children( `.multistorex-ssct-level-${ inputHolder }` ).html( name );
        },

        addANewCatBox() {
            let addCatBtn      = $( this )[0];
            let from           = $( addCatBtn ).data( 'selectfor' );
            selectedFrom       = from;
            let lastCatElement = $(this).parent().siblings('.multistorex-add-new-cat-box').children('.multistorex-select-product-category-container').length;
            let lastCat        = $(this).parent().siblings('.multistorex-add-new-cat-box').children('.multistorex-select-product-category-container')[lastCatElement-1];
            let boxCounter     = $(lastCat).find('#multistorex-category-open-modal').data('multistorexsclevel') + 1;

            if ( isNaN( boxCounter ) ) {
                boxCounter = 0;
            }

            let html = `
                <div data-activate="no" class="multistorex-select-product-category-container multistorex_select_cat_for_${from}_${boxCounter}">
                    <div class="multistorex-form-group multistorex-select-product-category multistorex-category-open-modal" data-multistorexsclevel="${ boxCounter }" id="multistorex-category-open-modal" data-selectfor="${from}">
                        <span id="multistorex_product_cat_res" class="multistorex-select-product-category-title multistorex-ssct-level-${ boxCounter }">- ${multistorex_product_category_data.i18n.select_a_category} -</span>
                        <span class="multistorex-select-product-category-icon"><i class="fas fa-edit"></i></span>
                    </div>
                        ${ ! multistorex_product_category_data.is_single ? `
                        <div class="multistorex-select-product-category-remove-container">
                            <span class="multistorex-select-product-category-remove"><i class="fas fa-times"></i></span>
                        </div>`
                        : ''}
                    <span class="multistorex-cat-inputs-holder multistorex-cih-level-${ boxCounter }" ></span>
                </div>
                `;

                $(this).parent().parent().children(`.cat_box_for_${from}`).append( html );
        },

        findCategory( id ) {
            return multistorex_product_category_data.categories[ id ];
        },

        debounce(func, wait, immediate) {
            var timeout;
            return function() {
                var context = this, args = arguments;
                var later = function() {
                    timeout = null;
                    if (!immediate) func.apply(context, args);
                };
                var callNow = immediate && !timeout;
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
                if (callNow) func.apply(context, args);
            };
        },

        openModal( chosenCat ) {
            ProductCategory.showCategoryModal();

            if ( chosenCat.length > 0 ) {
                let catId    = chosenCat.val();
                selectedCatId = catId;
                let category = multistorex_product_category_data.categories[ catId ];

                ProductCategory.setCatUiBasedOnOneCat( catId, category );
            }
        }
    };

    // On DOM ready.
    $( document ).ready( function() {
        ProductCategory.init();
    });
} )( jQuery );