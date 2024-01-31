<?php
/**
 * Custom template tags for this theme.
 *
 * Eventually, some of the functionality here could be replaced by core features
 *
 * @package multistorex
 */

use WeDevs\multistorex\Vendor\Vendor;

if ( ! function_exists( 'multistorex_content_nav' ) ) :

    /**
     * Display navigation to next/previous pages when applicable
     * 
     * @param int $nav_id nav_id.
     * @param int $query  query.
     * 
     * @return void|string
     */
    function multistorex_content_nav( $nav_id, $query = null ) {
        global $wp_query, $post;

        if ( $query ) {
            $wp_query = $query; //phpcs:ignore
        }

        // Don't print empty markup on single pages if there's nowhere to navigate.
        if ( is_single() ) {
            $previous = ( is_attachment() ) ? get_post( $post->post_parent ) : get_adjacent_post( false, '', true );
            $next = get_adjacent_post( false, '', false );

            if ( ! $next && ! $previous ) {
                return;
            }
        }

        // Don't print empty markup in archives if there's only one page.
        if ( $wp_query->max_num_pages < 2 && ( is_home() || is_archive() || is_search() ) ) {
            return;
        }

        $nav_class = 'site-navigation paging-navigation';
        if ( is_single() ) {
            $nav_class = 'site-navigation post-navigation';
        }
        ?>
        <nav role="navigation" id="<?php echo esc_attr( $nav_id ); ?>" class="<?php echo esc_attr( $nav_class ); ?>">

            <ul class="pager">
            <?php if ( is_single() ) : // navigation links for single posts ?>

                <li class="previous">
                    <?php previous_post_link( '%link', _x( '&larr;', 'Previous post link', 'multistorex-lite' ) . ' %title' ); ?>
                </li>
                <li class="next">
                    <?php next_post_link( '%link', '%title ' . _x( '&rarr;', 'Next post link', 'multistorex-lite' ) ); ?>
                </li>

            <?php endif; ?>
            </ul>


            <?php if ( $wp_query->max_num_pages > 1 && ( multistorex_is_store_page() || is_home() || is_archive() || is_search() ) ) : // navigation links for home, archive, and search pages ?>
                <?php multistorex_page_navi( '', '', $wp_query ); ?>
            <?php endif; ?>

        </nav>
        <?php
    }

endif;

if ( ! function_exists( 'multistorex_page_navi' ) ) :

    /**
     * Display navigation to next/previous pages when applicable
     * 
     * @param string $before before.
     * @param string $after  after.
     * @param object $wp_query wp_query.
     * 
     * @return void|string
     */
    function multistorex_page_navi( $before, $after, $wp_query ) {
        if ( ! ( $wp_query instanceof WP_Query ) ) {
            return;
        }

        $posts_per_page = intval( get_query_var( 'posts_per_page' ) );
        $paged          = intval( get_query_var( 'paged' ) );
        $numposts       = $wp_query->found_posts;
        $max_page       = $wp_query->max_num_pages;

        if ( $numposts <= $posts_per_page ) {
            return;
        }

        if ( empty( $paged ) || $paged === 0 ) {
            $paged = 1;
        }

        $pages_to_show         = 7;
        $pages_to_show_minus_1 = $pages_to_show - 1;
        $half_page_start       = floor( $pages_to_show_minus_1 / 2 );
        $half_page_end         = ceil( $pages_to_show_minus_1 / 2 );
        $start_page            = $paged - $half_page_start;

        if ( $start_page <= 0 ) {
            $start_page = 1;
        }

        $end_page = $paged + $half_page_end;

        if ( ( $end_page - $start_page ) !== $pages_to_show_minus_1 ) {
            $end_page = $start_page + $pages_to_show_minus_1;
        }

        if ( $end_page > $max_page ) {
            $start_page = $max_page - $pages_to_show_minus_1;
            $end_page = $max_page;
        }

        if ( $start_page <= 0 ) {
            $start_page = 1;
        }

        echo wp_kses_post( $before ) . '<div class="multistorex-pagination-container"><ul class="multistorex-pagination">';
        if ( $paged > 1 ) {
            $first_page_text = '&laquo;';
            echo '<li class="prev"><a href="' . esc_url( get_pagenum_link() ) . '" title="First">' . esc_html( $first_page_text ) . '</a></li>';
        }

        $prevposts = get_previous_posts_link( __( '&larr; Previous', 'multistorex-lite' ) );
        if ( $prevposts ) {
            echo '<li>' . wp_kses( $prevposts, [ 'a' => [ 'href' => [] ] ] ) . '</li>';
        } else {
            echo '<li class="disabled"><a href="#">' . esc_html__( '&larr; Previous', 'multistorex-lite' ) . '</a></li>';
        }
        for ( $i = $start_page; $i <= $end_page; $i++ ) {
            if ( (int) $i === $paged ) {
                echo '<li class="active"><a href="#">' . esc_html( $i ) . '</a></li>';
            } else {
                echo '<li><a href="' . esc_url( get_pagenum_link( $i ) ) . '">' . esc_html( number_format_i18n( $i ) ) . '</a></li>';
            }
        }

        if ( (int) $paged < $max_page ) {
            echo '<li class="">';
            next_posts_link( __( 'Next &rarr;', 'multistorex-lite' ) );
            echo '</li>';
        } else {
            echo '<li class="disabled"><a href="#">' . esc_html__( 'Next &rarr;', 'multistorex-lite' ) . '</a></li>';
        }
        if ( (int) $paged < $max_page ) {
            $last_page_text = '&raquo;';
            echo '<li class="next"><a href="' . esc_url( get_pagenum_link( $max_page ) ) . '" title="Last">' . esc_html( $last_page_text ) . '</a></li>';
        }

        echo '</ul></div>' . wp_kses_post( $after );
    }

endif;

/**
 * Product Dashboard Errors
 * 
 * @return void
 */
function multistorex_product_dashboard_errors() {
    $type = isset( $_GET['message'] ) ? sanitize_text_field( wp_unslash( $_GET['message'] ) ) : ''; //phpcs:ignore

    switch ( $type ) {
        case 'product_deleted':
            multistorex_get_template_part(
                'global/multistorex-success', '', array(
                    'deleted' => true,
                    'message' => __( 'Product successfully deleted', 'multistorex-lite' ),
                )
            );
            break;

        case 'error':
            multistorex_get_template_part(
                'global/multistorex-error', '', array(
                    'deleted' => false,
                    'message' => __( 'Something went wrong!', 'multistorex-lite' ),
                )
            );
            break;

        default:
            do_action( 'multistorex_product_dashboard_errors', $type );
            break;
    }
}

/**
 * Product Listing Status Filter
 * 
 * @return void
 */
function multistorex_product_listing_status_filter() {
    $permalink         = multistorex_get_navigation_url( 'products' );
    $status_class      = 'all';
    $post_counts       = multistorex_count_posts( 'product', multistorex_get_current_user_id() );
    $instock_counts    = multistorex_count_stock_posts( 'product', multistorex_get_current_user_id(), 'instock' );
    $outofstock_counts = multistorex_count_stock_posts( 'product', multistorex_get_current_user_id(), 'outofstock' );
    $statuses          = multistorex_get_post_status();

    if ( isset( $_GET['_product_listing_filter_nonce'], $_GET['post_status'] ) && wp_verify_nonce( sanitize_key( wp_unslash( $_GET['_product_listing_filter_nonce'] ) ), 'product_listing_filter' ) ) {
        $status_class = sanitize_text_field( wp_unslash( $_GET['post_status'] ) );
    }

    multistorex_get_template_part(
        'products/listing-status-filter', '', array(
            'permalink'         => $permalink,
            'status_class'      => $status_class,
            'post_counts'       => $post_counts,
            'instock_counts'    => $instock_counts,
            'outofstock_counts' => $outofstock_counts,
            'statuses'          => $statuses,
        )
    );
}

/**
 * Order Listing Status Filter
 * 
 * @return void
 */
function multistorex_order_listing_status_filter() {
    $orders_url = multistorex_get_navigation_url( 'orders' );

    $status_class         = 'all';
    $orders_counts        = multistorex_count_orders( multistorex_get_current_user_id() );
    $order_date           = '';
    $date_filter          = array();
    $all_order_url        = array();
    $complete_order_url   = array();
    $processing_order_url = array();
    $pending_order_url    = array();
    $on_hold_order_url    = array();
    $canceled_order_url   = array();
    $refund_order_url     = array();
    $failed_order_url     = array();
    $filter_nonce         = wp_create_nonce( 'seller-order-filter-nonce' );

    if ( isset( $_GET['seller_order_filter_nonce'] ) && wp_verify_nonce( sanitize_key( wp_unslash( $_GET['seller_order_filter_nonce'] ) ), 'seller-order-filter-nonce' ) ) {
        $status_class = isset( $_GET['order_status'] ) ? sanitize_text_field( wp_unslash( $_GET['order_status'] ) ) : $status_class;
        $order_date   = isset( $_GET['order_date'] ) ? sanitize_text_field( wp_unslash( $_GET['order_date'] ) ) : $order_date;
    }
    ?>

    <ul class="list-inline order-statuses-filter">
        <li<?php echo $status_class === 'all' ? ' class="active"' : ''; ?>>
            <?php
            if ( $order_date ) {
                $date_filter = array(
                    'order_date' => $order_date,
                    'multistorex_order_filter' => 'Filter',
                );
            }
            $all_order_url = array_merge( $date_filter, array( 'order_status' => 'all', 'seller_order_filter_nonce' => $filter_nonce ) ); // phpcs:ignore
            $all_order_url = ( empty( $all_order_url ) ) ? $orders_url : add_query_arg( $complete_order_url, $orders_url );
            ?>
            <a href="<?php echo esc_url( $all_order_url ); ?>">
                <?php
                // translators: %d : order count total
                printf( esc_html__( 'All (%d)', 'multistorex-lite' ), number_format_i18n( $orders_counts->total ) );
                ?>
                </span>
            </a>
        </li>
        <li<?php echo $status_class === 'wc-completed' ? ' class="active"' : ''; ?>>
            <?php
            if ( $order_date ) {
                $date_filter = array(
                    'order_date' => $order_date,
                    'multistorex_order_filter' => 'Filter',
                );
            }
            $complete_order_url = array_merge( array( 'order_status' => 'wc-completed', 'seller_order_filter_nonce' => $filter_nonce ), $date_filter ); // phpcs:ignore
            ?>
            <a href="<?php echo esc_url( add_query_arg( $complete_order_url, $orders_url ) ); ?>">
                <?php
                // translators: %d : order count completed status
                printf( esc_html__( 'Completed (%d)', 'multistorex-lite' ), number_format_i18n( $orders_counts->{'wc-completed'} ) );
                ?>
                </span>
            </a>
        </li>
        <li<?php echo $status_class === 'wc-processing' ? ' class="active"' : ''; ?>>
            <?php
            if ( $order_date ) {
                $date_filter = array(
                    'order_date' => $order_date,
                    'multistorex_order_filter' => 'Filter',
                );
            }
            $processing_order_url = array_merge( $date_filter, array( 'order_status' => 'wc-processing', 'seller_order_filter_nonce' => $filter_nonce ) ); // phpcs:ignore
            ?>
            <a href="<?php echo esc_url( add_query_arg( $processing_order_url, $orders_url ) ); ?>">
                <?php
                // translators: %d : order count processing status
                printf( esc_html__( 'Processing (%d)', 'multistorex-lite' ), number_format_i18n( $orders_counts->{'wc-processing'} ) );
                ?>
                </span>
            </a>
        </li>
        <li<?php echo $status_class === 'wc-on-hold' ? ' class="active"' : ''; ?>>
            <?php
            if ( $order_date ) {
                $date_filter = array(
                    'order_date' => $order_date,
                    'multistorex_order_filter' => 'Filter',
                );
            }
            $on_hold_order_url = array_merge( $date_filter, array( 'order_status' => 'wc-on-hold', 'seller_order_filter_nonce' => $filter_nonce ) ); // phpcs:ignore
            ?>
            <a href="<?php echo esc_url( add_query_arg( $on_hold_order_url, $orders_url ) ); ?>">
                <?php
                // translators: %d : order count on hold status
                printf( esc_html__( 'On-hold (%d)', 'multistorex-lite' ), number_format_i18n( $orders_counts->{'wc-on-hold'} ) );
                ?>
                </span>
            </a>
        </li>
        <li<?php echo $status_class === 'wc-pending' ? ' class="active"' : ''; ?>>
            <?php
            if ( $order_date ) {
                $date_filter = array(
                    'order_date' => $order_date,
                    'multistorex_order_filter' => 'Filter',
                );
            }
            $pending_order_url = array_merge( $date_filter, array( 'order_status' => 'wc-pending', 'seller_order_filter_nonce' => $filter_nonce ) ); // phpcs:ignore
            ?>
            <a href="<?php echo esc_url( add_query_arg( $pending_order_url, $orders_url ) ); ?>">
                <?php
                // translators: %d : order count pending status
                printf( esc_html__( 'Pending (%d)', 'multistorex-lite' ), number_format_i18n( $orders_counts->{'wc-pending'} ) );
                ?>
                </span>
            </a>
        </li>
        <li<?php echo $status_class === 'wc-cancelled' ? ' class="active"' : ''; ?>>
            <?php
            if ( $order_date ) {
                $date_filter = array(
                    'order_date' => $order_date,
                    'multistorex_order_filter' => 'Filter',
                );
            }
            $canceled_order_url = array_merge( $date_filter, array( 'order_status' => 'wc-cancelled', 'seller_order_filter_nonce' => $filter_nonce ) ); // phpcs:ignore
            ?>
            <a href="<?php echo esc_url( add_query_arg( $canceled_order_url, $orders_url ) ); ?>">
                <?php
                // translators: %d : order count cancelled status
                printf( esc_html__( 'Cancelled (%d)', 'multistorex-lite' ), number_format_i18n( $orders_counts->{'wc-cancelled'} ) );
                ?>
                </span>
            </a>
        </li>
        <li<?php echo $status_class === 'wc-refunded' ? ' class="active"' : ''; ?>>
            <?php
            if ( $order_date ) {
                $date_filter = array(
                    'order_date' => $order_date,
                    'multistorex_order_filter' => 'Filter',
                );
            }
            $refund_order_url = array_merge( $date_filter, array( 'order_status' => 'wc-refunded', 'seller_order_filter_nonce' => $filter_nonce ) ); // phpcs:ignore
            ?>
            <a href="<?php echo esc_url( add_query_arg( $refund_order_url, $orders_url ) ); ?>">
                <?php
                // translators: %d : order count refunded status
                printf( esc_html__( 'Refunded (%d)', 'multistorex-lite' ), number_format_i18n( $orders_counts->{'wc-refunded'} ) );
                ?>
                </span>
            </a>
        </li>
        <li<?php echo $status_class === 'wc-failed' ? ' class="active"' : ''; ?>>
            <?php
            if ( $order_date ) {
                $date_filter = array(
                    'order_date'         => $order_date,
                    'multistorex_order_filter' => 'Filter',
                );
            }

            $failed_order_url = array_merge( $date_filter, array( 'order_status' => 'wc-failed', 'seller_order_filter_nonce' => $filter_nonce ) ); // phpcs:ignore
            ?>
            <a href="<?php echo esc_url( add_query_arg( $failed_order_url, $orders_url ) ); ?>">
                <?php
                // translators: %d : order count failed status
                printf( esc_html__( 'Failed (%d)', 'multistorex-lite' ), number_format_i18n( $orders_counts->{'wc-failed'} ) );
                ?>
                </span>
            </a>
        </li>

        <?php do_action( 'multistorex_status_listing_item', $orders_counts ); ?>
    </ul>
    <?php
}

/**
 * Navigation Sort By Position
 * 
 * @return void
 */
function multistorex_nav_sort_by_pos( $a, $b ) {
    if ( isset( $a['pos'] ) && isset( $b['pos'] ) ) {
        return $a['pos'] - $b['pos'];
    } else {
        return 199;
    }
}

/**
 * Dashboard Navigation menus
 *
 * @return array
 */
function multistorex_get_dashboard_nav() {
    $menus = array(
        'dashboard' => array(
            'title'      => __( 'Dashboard', 'multistorex-lite' ),
            'icon'       => '<i class="fas fa-tachometer-alt"></i>',
            'url'        => multistorex_get_navigation_url(),
            'pos'        => 10,
            'permission' => 'multistorex_view_overview_menu',
        ),
        'posts' => array(
            'title'      => __( 'Posts', 'multistorex-lite' ),
            'icon'       => '<i class="fas fa-briefcase"></i>',
            'url'        => multistorex_get_navigation_url( 'posts' ),
            'pos'        => 30,
            'permission' => 'multistorex_view_post_menu',
        ),
        'products' => array(
            'title'      => __( 'Products', 'multistorex-lite' ),
            'icon'       => '<i class="fas fa-briefcase"></i>',
            'url'        => multistorex_get_navigation_url( 'products' ),
            'pos'        => 30,
            'permission' => 'multistorex_view_product_menu',
        ),
        'orders' => array(
            'title'      => __( 'Orders', 'multistorex-lite' ),
            'icon'       => '<i class="fas fa-shopping-cart"></i>',
            'url'        => multistorex_get_navigation_url( 'orders' ),
            'pos'        => 50,
            'permission' => 'multistorex_view_order_menu',
        ),
        'withdraw' => array(
            'title'      => __( 'Withdraw', 'multistorex-lite' ),
            'icon'       => '<i class="fas fa-upload"></i>',
            'url'        => multistorex_get_navigation_url( 'withdraw' ),
            'pos'        => 70,
            'permission' => 'multistorex_view_withdraw_menu',
        ),
        'settings' => array(
            'title' => __( 'Settings', 'multistorex-lite' ),
            'icon'  => '<i class="fas fa-cog"></i>',
            'url'   => multistorex_get_navigation_url( 'settings/store' ),
            'pos'   => 200,
        ),
    );

    $settings_sub = array(
        'store' => array(
            'title'      => __( 'Store', 'multistorex-lite' ),
            'icon'       => '<i class="fas fa-university"></i>',
            'url'        => multistorex_get_navigation_url( 'settings/store' ),
            'pos'        => 30,
            'permission' => 'multistorex_view_store_settings_menu',
        ),
        'payment' => array(
            'title'      => __( 'Payment', 'multistorex-lite' ),
            'icon'       => '<i class="far fa-credit-card"></i>',
            'url'        => multistorex_get_navigation_url( 'settings/payment' ),
            'pos'        => 50,
            'permission' => 'multistorex_view_store_payment_menu',
        ),
    );

    /**
     * Filter to get the seller dashboard settings navigation.
     *
     * @since 2.2
     *
     * @param array.
     */
    $menus['settings']['submenu'] = apply_filters( 'multistorex_get_dashboard_settings_nav', $settings_sub );

    /**
     * Filters nav menu items.
     *
     * @param array<string,array> $menus
     */
    $nav_menus = apply_filters( 'multistorex_get_dashboard_nav', $menus );

    foreach ( $nav_menus as $nav_key => $menu ) {
        if ( ! isset( $menu['pos'] ) ) {
            $nav_menus[ $nav_key ]['pos'] = 190;
        }

        $submenu_items = empty( $menu['submenu'] ) ? [] : $menu['submenu'];

        /**
         * Filters the vendor dashboard submenu item for each menu.
         *
         * @since 3.7.7
         *
         * @param array<string,array> $submenu_items Associative array of submenu items.
         * @param string              $menu_key      Key of the corresponding menu.
         */
        $submenu_items = apply_filters( 'multistorex_dashboard_nav_submenu', $submenu_items, $nav_key );

        if ( empty( $submenu_items ) ) {
            continue;
        }

        foreach ( $submenu_items as $key => $submenu ) {
            if ( ! isset( $submenu['pos'] ) ) {
                $submenu['pos'] = 200;
            }

            $submenu_items[ $key ] = $submenu;
        }

        // Sort items according to positional value
        uasort( $submenu_items, 'multistorex_nav_sort_by_pos' );

        // Filter items according to permissions
        // $submenu_items = array_filter( $submenu_items, 'multistorex_check_menu_permission' );

        // Manage menu with submenus after permission check
        if ( count( $submenu_items ) < 1 ) {
            unset( $nav_menus[ $nav_key ] );
        } else {
            $nav_menus[ $nav_key ]['submenu'] = $submenu_items;
        }
    }

    // Sort items according to positional value
    uasort( $nav_menus, 'multistorex_nav_sort_by_pos' );

    // Filter main menu according to permission
    // $nav_menus = array_filter( $nav_menus, 'multistorex_check_menu_permission' );

    return $nav_menus;
}

/**
 * Checking menu permissions
 *
 * @return boolean
 */
function multistorex_check_menu_permission( $menu ) {
    if ( isset( $menu['permission'] ) && ! current_user_can( $menu['permission'] ) ) {
        return false;
    }

    return true;
}

/**
 * Renders the multistorex dashboard menu
 * 
 * @param string $active_menu
 *
 * @return string rendered menu HTML
 */
function multistorex_dashboard_nav( $active_menu = '' ) {
    $nav_menu          = multistorex_get_dashboard_nav();
    $active_menu_parts = explode( '/', $active_menu );
    $active_submenu    = '';

    if ( $active_menu && false !== strpos( $active_menu, '/' ) ) {
        $active_menu    = $active_menu_parts[0];
        $active_submenu = $active_menu_parts[1];
    }

    $menu           = '';
    $hamburger_menu = apply_filters( 'multistorex_load_hamburger_menu', true );

    if ( $hamburger_menu ) {
        $menu .= '<div id="multistorex-navigation" aria-label="Menu">';
        $hamburger = apply_filters(
            'multistorex_vendor_dashboard_menu_hamburger',
            '<label id="mobile-menu-icon" for="toggle-mobile-menu" aria-label="Menu">&#9776;</label><input id="toggle-mobile-menu" type="checkbox" />'
        );

        $menu .= $hamburger;
    }

    $menu .= '<ul class="multistorex-dashboard-menu menu">';

    foreach ( $nav_menu as $key => $item ) {
        /**
         * Filters menu key according to slug if needed.
         *
         * @since multistorex_PRO_SINCE
         *
         * @param string $menu_key
         */
        $filtered_key = apply_filters( 'multistorex_dashboard_nav_menu_key', $key );

        $class     = $active_menu === $filtered_key || 0 === stripos( $active_menu, $filtered_key ) ? 'active ' . $key : $key;  // checking starts with the key
        $title     = isset( $item['title'] ) ? $item['title'] : __( 'No title', 'multistorex-lite' );
        $menu_slug = $filtered_key;
        $submenu   = '';

        if ( ! empty( $item['submenu'] ) ) {
            $class .= ' has-submenu';
            $title .= ' <i class="fas fa-caret-right menu-dropdown"></i>';
            $submenu = sprintf( '<ul class="navigation-submenu %s">', $key );
            $subkey_slugs = [];

            foreach ( $item['submenu'] as $sub_key => $sub ) {
                /**
                 * Filters menu key according to slug if needed.
                 *
                 * @since multistorex_PRO_SINCE
                 *
                 * @param string $submenu_key
                 * @param string $menu_key
                 */
                $filtered_subkey = apply_filters( 'multistorex_dashboard_nav_submenu_key', $sub_key, $key );

                $submenu_class = $active_submenu === $filtered_subkey || 0 === stripos( $active_submenu, $filtered_subkey ) ? "current $sub_key" : $sub_key;

                $submenu .= sprintf(
                    '<li class="submenu-item %s"><a href="%s" class="submenu-link">%s %s</a></li>',
                    $submenu_class,
                    isset( $sub['url'] ) ? $sub['url'] : multistorex_get_navigation_url( "{$filtered_key}/{$filtered_subkey}" ),
                    isset( $sub['icon'] ) ? $sub['icon'] : '<i class="fab fa-staylinked"></i>',
                    isset( $sub['title'] ) ? $sub['title'] : __( 'No title', 'multistorex-lite' )
                );

                $subkey_slugs[] = $filtered_subkey;
            }

            $submenu .= '</ul>';

            // Building parent menu slug pointing to the first submenu item
            if ( isset( $subkey_slugs[0] ) ) {
                $menu_slug = trailingslashit( $menu_slug ) . $subkey_slugs[0];
            }
        }

        $menu .= sprintf(
            '<li class="%s"><a href="%s">%s %s</a>%s</li>',
            $class,
            isset( $item['url'] ) ? $item['url'] : multistorex_get_navigation_url( $menu_slug ),
            isset( $item['icon'] ) ? $item['icon'] : '<i class="fab fa-staylinked"></i>',
            $title,
            $submenu
        );
    }

    $common_links = '<li class="multistorex-common-links multistorex-clearfix">
            <a title="' . __( 'Visit Store', 'multistorex-lite' ) . '" class="tips" data-placement="top" href="' . multistorex_get_store_url( multistorex_get_current_user_id() ) . '" target="_blank"><i class="fas fa-external-link-alt"></i></a>
            <a title="' . __( 'Edit Account', 'multistorex-lite' ) . '" class="tips" data-placement="top" href="' . multistorex_get_navigation_url( 'edit-account' ) . '"><i class="fas fa-user"></i></a>
            <a title="' . __( 'Log out', 'multistorex-lite' ) . '" class="tips" data-placement="top" href="' . wp_logout_url( home_url() ) . '"><i class="fas fa-power-off"></i></a>
        </li>';

    $menu .= apply_filters( 'multistorex_dashboard_nav_common_link', $common_links );

    $menu .= '</ul>';

    if ( $hamburger_menu ) {
        $menu .= '</div>';
    }

    return $menu;
}


if ( ! function_exists( 'multistorex_store_category_menu' ) ) :

    /**
     * Store category menu for a store
     * 
     * @param  int $seller_id
     * 
     * @return void
     */
    function multistorex_store_category_menu( $seller_id, $title = '' ) {
        ?>
    <div class="store-cat-stack-multistorex cat-drop-stack">
        <?php
        $seller_id = empty( $seller_id ) ? get_query_var( 'author' ) : $seller_id;
        $vendor    = multistorex()->vendor->get( $seller_id );
        if ( $vendor instanceof Vendor ) {
            $categories = $vendor->get_store_categories();
            $walker = new \WeDevs\multistorex\Walkers\StoreCategory( $seller_id );
            echo '<ul>';
            echo call_user_func_array( array( &$walker, 'walk' ), array( $categories, 0, array() ) ); //phpcs:ignore WordPress.XSS.EscapeOutput.OutputNotEscaped
            echo '</ul>';
        }
        ?>
    </div>
        <?php
    }

endif;

if ( ! function_exists( 'multistorex_store_term_menu_list' ) ) :

    /**
     * Store category menu for a store
     *
     * @param int    $seller_id  seller_id.
     * @param array  $taxonomy   taxonomy.
     * @param string $query_type query_type.
     *
     * @return void
     */
    function multistorex_store_term_menu_list( $seller_id, $taxonomy, $query_type ) {
        ?>
        <div class="store-cat-stack-multistorex cat-drop-stack">
        <?php
        $seller_id = empty( $seller_id ) ? get_query_var( 'author' ) : $seller_id;
        $vendor    = multistorex()->vendor->get( $seller_id );
        $store_url = multistorex_get_store_url( $seller_id );

        if ( $vendor instanceof Vendor ) {
            $terms = $vendor->get_vendor_used_terms_list( $seller_id, $taxonomy );

            echo '<ul>';
            $_chosen_attributes = multistorex_get_chosen_taxonomy_attributes();
            foreach ( $terms as $term ) {
                $current_values = isset( $_chosen_attributes[ $taxonomy ]['terms'] ) ? $_chosen_attributes[ $taxonomy ]['terms'] : [];
                $option_is_set  = in_array( $term->slug, $current_values, true );
                $filter_name    = 'filter_' . wc_attribute_taxonomy_slug( $taxonomy );
                // phpcs:ignore
                $current_filter = isset( $_GET[ $filter_name ] ) ? explode( ',', wc_clean( wp_unslash( $_GET[ $filter_name ] ) ) ) : array();

                if ( ! in_array( $term->slug, $current_filter, true ) ) {
                    $current_filter[] = $term->slug;
                }

                $link = remove_query_arg( $filter_name, $store_url );
                // Add current filters to URL.
                foreach ( $current_filter as $key => $value ) {
                    // Exclude query arg for current term archive term.
                    if ( $value === multistorex_get_current_term_slug() ) {
                        unset( $current_filter[ $key ] );
                    }

                    // Exclude self so filter can be unset on click.
                    if ( $option_is_set && $value === $term->slug ) {
                        unset( $current_filter[ $key ] );
                    }
                }

                if ( ! empty( $current_filter ) ) {
                    asort( $current_filter );
                    $link = add_query_arg( $filter_name, implode( ',', $current_filter ), $link );

                    // Add Query type Arg to URL.
                    if ( 'or' === $query_type && ! ( 1 === count( $current_filter ) && $option_is_set ) ) {
                        $link = add_query_arg( 'query_type_' . wc_attribute_taxonomy_slug( $taxonomy ), 'or', $link );
                    }
                    $link = str_replace( '%2C', ',', $link );
                }

                $checked = '';
                if ( $option_is_set ) {
                    $checked = 'checked';
                }

                echo '
                <li class="parent-cat-wrap">
                    <a href=' . esc_url( $link ) . '> <input style="pointer-events: none;" type="checkbox" ' . $checked . '> &nbsp;' . $term->name . ' <span style="float: right" class="count">(' . $term->count . ')</span> </a>
                </li>';
            }
            echo '</ul>';
        }
        ?>
    </div>
        <?php
    }

endif;
/**
 * Return the currently viewed term slug.
 *
 * @return int
 */
function multistorex_get_current_term_slug() {
    return absint( is_tax() ? get_queried_object()->slug : 0 );
}

/**
 * Get chosen taxonomy attributes.
 *
 * @return array
 */
function multistorex_get_chosen_taxonomy_attributes() {
    $attributes = [];
    // phpcs:disable WordPress.Security.NonceVerification.Recommended
    if ( empty( $_GET ) ) {
        return $attributes;
    }

    foreach ( $_GET as $key => $value ) {
        if ( 0 !== strpos( $key, 'filter_' ) ) {
            continue;
        }

        $attribute    = wc_sanitize_taxonomy_name( str_replace( 'filter_', '', $key ) );
        $taxonomy     = wc_attribute_taxonomy_name( $attribute );
        $filter_terms = ! empty( $value ) ? explode( ',', wc_clean( wp_unslash( $value ) ) ) : [];

        if ( empty( $filter_terms ) || ! taxonomy_exists( $taxonomy ) || ! wc_attribute_taxonomy_id_by_name( $attribute ) ) {
            continue;
        }

        // phpcs:ignore
        $query_type                            = ! empty( $_GET['query_type_' . $attribute] ) && in_array(  $_GET['query_type_' . $attribute], [ 'and', 'or' ], true ) ? wc_clean( wp_unslash( $_GET['query_type_' . $attribute] ) ) : '';
        $attributes[ $taxonomy ]['terms']      = array_map( 'sanitize_title', $filter_terms ); // Ensures correct encoding.
        $attributes[ $taxonomy ]['query_type'] = $query_type ? $query_type : 'and';
    }
    // phpcs:enable WordPress.Security.NonceVerification.Recommended
    return $attributes;
}

/**
 * Add Seller Registration Form Fields
 * 
 * @return void
 */
function multistorex_seller_reg_form_fields() {
    $data       = multistorex_get_seller_registration_form_data();
    $role       = isset( $data['role'] ) ? $data['role'] : 'customer';
    $role_style = ( $role === 'customer' ) ? 'display:none' : '';

    multistorex_get_template_part(
        'global/seller-registration-form', '', [
            'data'       => $data,
            'role'       => $role,
            'role_style' => $role_style,
        ]
    );
}

add_action( 'woocommerce_register_form', 'multistorex_seller_reg_form_fields' );

if ( ! function_exists( 'multistorex_seller_not_enabled_notice' ) ) :
    /**
     * Seller not Enable
     * 
     * @return void
     */ 
    function multistorex_seller_not_enabled_notice() {
        multistorex_get_template_part( 'global/seller-warning' );
    }

endif;

if ( ! function_exists( 'multistorex_header_user_menu' ) ) :

    /**
     * User top navigation menu
     *
     * @return void
     */
    function multistorex_header_user_menu() {
        global $current_user;

        $user_id  = multistorex_get_current_user_id();
        $nav_urls = multistorex_get_dashboard_nav();

        multistorex_get_template_part(
            'global/header-menu', '', array(
                'current_user' => $current_user,
                'user_id' => $user_id,
                'nav_urls' => $nav_urls,
            )
        );
    }

endif;

add_action( 'template_redirect', 'multistorex_myorder_login_check' );

/**
 * Redirect My order in Login page without user logged login
 *
 * @return [redirect]
 */
function multistorex_myorder_login_check() {
    global $post;

    if ( ! $post ) {
        return;
    }

    if ( ! isset( $post->ID ) ) {
        return;
    }

    $my_order_page_id = multistorex_get_option( 'my_orders', 'multistorex_pages' );

    if ( (int) $my_order_page_id === $post->ID ) {
        multistorex_redirect_login();
    }
}

/**
 * Store sidebar widget args
 *
 * @return array
 */
function multistorex_store_sidebar_args() {
    $args = [
        'before_widget' => '<aside class="widget multistorex-store-widget %s">',
        'after_widget'  => '</aside>',
        'before_title'  => '<h3 class="widget-title">',
        'after_title'   => '</h3>',
    ];

    return apply_filters( 'multistorex_store_sidebar_args', $args );
}

/**
 * Store single category widget
 *
 * @return void
 */
function multistorex_store_category_widget() {
    $args = multistorex_store_sidebar_args();

    if ( multistorex()->widgets->is_exists( 'store_category_menu' ) ) {
        the_widget( multistorex()->widgets->store_category_menu, [ 'title' => __( 'Store Product Category', 'multistorex-lite' ) ], $args );
    }
}

/**
 * Store single location widget
 *
 * @return void
 */
function multistorex_store_location_widget() {
    $args = multistorex_store_sidebar_args();

    if ( multistorex()->widgets->is_exists( 'store_location' ) && 'on' === multistorex_get_option( 'store_map', 'multistorex_general', 'on' ) ) {
        the_widget( multistorex()->widgets->store_location, [ 'title' => __( 'Store Location', 'multistorex-lite' ) ], $args );
    }
}

/**
 * Store opening/closing time widget
 *
 * @return void
 */
function multistorex_store_time_widget() {
    $args = multistorex_store_sidebar_args();

    if ( multistorex()->widgets->is_exists( 'store_open_close' ) && 'on' === multistorex_get_option( 'store_open_close', 'multistorex_general', 'on' ) ) {
        the_widget( multistorex()->widgets->store_open_close, [ 'title' => __( 'Store Time', 'multistorex-lite' ) ], $args );
    }
}

/**
 * Store contact form widget
 *
 * @return void
 */
function multistorex_store_contact_widget() {
    $args = multistorex_store_sidebar_args();

    if ( multistorex()->widgets->is_exists( 'store_contact_form' ) && 'on' === multistorex_get_option( 'contact_seller', 'multistorex_general', 'on' ) ) {
        the_widget( multistorex()->widgets->store_contact_form, [ 'title' => __( 'Contact Vendor', 'multistorex-lite' ) ], $args );
    }
}

/**
 * Get multistorex seller registration form data
 *
 * @return string[]
 */
function multistorex_get_seller_registration_form_data() {
    // prepare form data
    $data = [
        'fname'    => '',
        'lname'    => '',
        'username' => '',
        'email'    => '',
        'phone'    => '',
        'password' => '',
        'shopname' => '',
        'shopurl'  => '',
    ];
    // check if user submitted data
    if ( isset( $_POST['woocommerce-register-nonce'] ) && wp_verify_nonce( sanitize_key( wp_unslash( $_POST['woocommerce-register-nonce'] ) ), 'woocommerce-register' ) ) {
        $data = [
            'fname'    => isset( $_POST['fname'] ) ? sanitize_text_field( wp_unslash( $_POST['fname'] ) ) : '',
            'lname'    => isset( $_POST['lname'] ) ? sanitize_text_field( wp_unslash( $_POST['lname'] ) ) : '',
            'username' => isset( $_POST['username'] ) ? sanitize_user( wp_unslash( $_POST['username'] ) ) : '',
            'email'    => isset( $_POST['email'] ) ? sanitize_email( wp_unslash( $_POST['email'] ) ) : '',
            'phone'    => isset( $_POST['phone'] ) ? sanitize_text_field( wp_unslash( $_POST['phone'] ) ) : '',
            'password' => isset( $_POST['password'] ) ? wp_unslash( $_POST['password'] ) : '', // phpcs:ignore
            'shopname' => isset( $_POST['shopname'] ) ? sanitize_text_field( wp_unslash( $_POST['shopname'] ) ) : '',
            'shopurl'  => isset( $_POST['shopurl'] ) ? sanitize_title( wp_unslash( $_POST['shopurl'] ) ) : '',
        ];
    }

    return $data;
}