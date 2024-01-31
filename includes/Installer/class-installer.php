<?php
namespace MultiStoreX;

/**
 * Installer Class
 * 
 * @package MultiStoreX
 */ 
class Installer {

    /**
     * Constructor
     */ 
	public function __construct() {
		
	}

    /**
     * Create Setup
     * 
     * @return void
     */ 
	public function create_setup() {
		$this->add_roles();
		$this->setup_pages();
		$this->woocommerce_settings();
		$this->create_tables();
	}


    /**
     * Add Roles
     * 
     * @return void
     */ 
	public function add_roles() {
        global $wp_roles;

        if ( class_exists( 'WP_Roles' ) && ! isset( $wp_roles ) ) {
            $wp_roles = new WP_Roles(); // @codingStandardsIgnoreLine
        }

        add_role(
            'seller',
            __( 'Seller', 'multistorex-lite' ),
            array(
				'read'                      => true,
				'publish_posts'             => true,
				'edit_posts'                => true,
				'delete_published_posts'    => true,
				'edit_published_posts'      => true,
				'delete_posts'              => true,
				'manage_categories'         => true,
				'moderate_comments'         => true,
				'upload_files'              => true,
				'edit_shop_orders'          => true,
				'edit_product'              => true,
				'read_product'              => true,
				'delete_product'            => true,
				'edit_products'             => true,
				'publish_products'          => true,
				'read_private_products'     => true,
				'delete_products'           => true,
				'delete_private_products'   => true,
				'delete_published_products' => true,
				'edit_private_products'     => true,
				'edit_published_products'   => true,
				'manage_product_terms'      => true,
				'delete_product_terms'      => true,
				'assign_product_terms'      => true,
				'seller'                  	=> true,
            )
        );

        $capabilities = array();
        // $all_cap      = multistorex_get_all_caps();

        // foreach ( $all_cap as $key => $cap ) {
        //     $capabilities = array_merge( $capabilities, array_keys( $cap ) );
        // }

        $wp_roles->add_cap( 'shop_manager', 'seller' );
        $wp_roles->add_cap( 'administrator', 'seller' );

        foreach ( $capabilities as $key => $capability ) {
            $wp_roles->add_cap( 'seller', $capability );
            $wp_roles->add_cap( 'administrator', $capability );
            $wp_roles->add_cap( 'shop_manager', $capability );
        }
    }

    /**
     * Setup Pages
     * 
     * @return void|string
     */ 
    public function setup_pages() {
        $meta_key = '_wp_page_template';

        // return if pages were created before.
        $page_created = get_option( 'multistorex_pages_created', false );

        if ( $page_created ) {
            return;
        }

        $pages = array(
            array(
                'post_title' => __( 'Dashboard', 'multistorex-lite' ),
                'slug'       => 'dashboard',
                'page_id'    => 'dashboard',
                'content'    => '[multistorex-dashboard]',
            ),
            array(
                'post_title' => __( 'Store List', 'multistorex-lite' ),
                'slug'       => 'store-listing',
                'page_id'    => 'store_listing',
                'content'    => '[multistorex-stores]',
            ),
            array(
                'post_title' => __( 'My Orders', 'multistorex-lite' ),
                'slug'       => 'my-orders',
                'page_id'    => 'my_orders',
                'content'    => '[multistorex-my-orders]',
            ),
        );

        $multistorex_page_settings = array();

        if ( $pages ) {
            foreach ( $pages as $page ) {
                $page_id = $this->create_page( $page );

                if ( $page_id ) {
                    $multistorex_page_settings[ $page['page_id'] ] = $page_id;

                    if ( isset( $page['child'] ) && count( $page['child'] ) > 0 ) {
                        foreach ( $page['child'] as $child_page ) {
                            $child_page_id = $this->create_page( $child_page );

                            if ( $child_page_id ) {
                                $multistorex_page_settings[ $child_page['page_id'] ] = $child_page_id;

                                wp_update_post(
                                    array(
										'ID'          => $child_page_id,
										'post_parent' => $page_id,
                                    )
                                );
                            }
                        }
                    }
                }
            }
        }

        update_option( 'multistorex_pages', $multistorex_page_settings );
        update_option( 'multistorex_pages_created', true );
    }

    /**
     * Enable My Account Registration
     *
     * @return void
     */ 
    public function woocommerce_settings() {
    	update_option( 'woocommerce_enable_myaccount_registration', 'yes' );
    }

    /**
     * Create Pages
     * 
     * @param string $page page.
     * 
     * @return boolean
     */ 
    public function create_page( $page ) {
        $meta_key = '_wp_page_template';
        $page_obj = get_page_by_path( $page['post_title'] );

        if ( ! $page_obj ) {
            $page_id = wp_insert_post(
                array(
					'post_title'     => $page['post_title'],
					'post_name'      => $page['slug'],
					'post_content'   => $page['content'],
					'post_status'    => 'publish',
					'post_type'      => 'page',
					'comment_status' => 'closed',
                )
            );

            if ( $page_id && ! is_wp_error( $page_id ) ) {
                if ( isset( $page['template'] ) ) {
                    update_post_meta( $page_id, $meta_key, $page['template'] );
                }

                return $page_id;
            }
        }

        return false;
    }

    /**
     * Create Tables
     * 
     * @return void
     */ 
    public function create_tables() {
    	include_once ABSPATH . 'wp-admin/includes/upgrade.php';

        $this->create_withdraw_table();
        $this->create_sync_table();
        $this->create_refund_table();
        $this->create_vendor_balance_table();
    }

    /**
     * Create Withdraw Table
     * 
     * @return void
     */ 
    public function create_withdraw_table() {
        global $wpdb;

        $sql = "CREATE TABLE IF NOT EXISTS `{$wpdb->prefix}multistorex_withdraw` (
                    `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
                    `user_id` bigint(20) unsigned NOT NULL,
                    `amount` decimal(19,4) NOT NULL,
                    `date` timestamp NOT NULL,
                    `status` int(1) NOT NULL,
                    `method` varchar(30) NOT NULL,
                    `note` text NOT NULL,
                    `details` longtext DEFAULT NULL,
                    `ip` varchar(50) NOT NULL,
                    PRIMARY KEY (id)
               ) ENGINE=InnoDB {$wpdb->get_charset_collate()};";

        dbDelta( $sql );
    }

    /**
     * Create Sync Table
     * 
     * @return void
     */ 
    public function create_sync_table() {
    	global $wpdb;

        $sql = "CREATE TABLE IF NOT EXISTS `{$wpdb->prefix}multistorex_orders` (
                    `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
                    `order_id` bigint(20) DEFAULT NULL,
                    `seller_id` bigint(20) DEFAULT NULL,
                    `order_total` decimal(19,4) DEFAULT NULL,
                    `net_amount` decimal(19,4) DEFAULT NULL,
                    `order_status` varchar(30) DEFAULT NULL,
                    PRIMARY KEY (`id`),
                    KEY `order_id` (`order_id`),
                    KEY `seller_id` (`seller_id`)
               ) ENGINE=InnoDB {$wpdb->get_charset_collate()};";

        dbDelta( $sql );
    }

    /**
     * Create Refund Table
     * 
     * @return void
     */ 
    public function create_refund_table() {
        global $wpdb;

        $sql = "CREATE TABLE IF NOT EXISTS `{$wpdb->prefix}multistorex_refund` (
                    `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
                    `order_id` bigint(20) unsigned NOT NULL,
                    `seller_id` bigint(20) NOT NULL,
                    `refund_amount` decimal(19,4) NOT NULL,
                    `refund_reason` text NULL,
                    `item_qtys` varchar(200) NULL,
                    `item_totals` text NULL,
                    `item_tax_totals` text NULL,
                    `restock_items` varchar(10) NULL,
                    `date` timestamp NOT NULL,
                    `status` int(1) NOT NULL,
                    `method` varchar(30) NOT NULL,
                    PRIMARY KEY (id)
               ) ENGINE=InnoDB {$wpdb->get_charset_collate()};";

        dbDelta( $sql );
    }


    /**
     * Create Vendor Balance Table
     * 
     * @return void
     */ 
    public function create_vendor_balance_table() {
        global $wpdb;

        $sql = "CREATE TABLE IF NOT EXISTS `{$wpdb->prefix}multistorex_vendor_balance` (
                    `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
                    `vendor_id` bigint(20) unsigned NOT NULL,
                    `trn_id` bigint(20) unsigned NOT NULL,
                    `trn_type` varchar(30) NOT NULL,
                    `perticulars` text NOT NULL,
                    `debit` decimal(19,4) NOT NULL,
                    `credit` decimal(19,4) NOT NULL,
                    `status` varchar(30) DEFAULT NULL,
                    `trn_date` timestamp NOT NULL,
                    `balance_date` timestamp NOT NULL,
                    PRIMARY KEY (id)
                ) ENGINE=InnoDB {$wpdb->get_charset_collate()};";

        dbDelta( $sql );
    }
}
