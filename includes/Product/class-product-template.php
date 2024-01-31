<?php
namespace MultiStoreX\Product;

/**
 * Product Frontend Functionality Handler
 * 
 * @package MultiStoreX
 */
class ProductTemplate {

	/**
	 * Constructor
	 * 
	 */ 
	public function __construct() {
		
		add_action( 'template_redirect', array( $this, 'process_product_add' ), 11 );

        add_action( 'template_redirect', array( $this, 'process_product_update' ), 11 );
        
        add_action( 'template_redirect', array( $this, 'process_delete_product' ) );
	}

	/**
	 * Process Product Adding to db
	 * 
	 * @return void
	 */ 
	public function process_product_add() {
		
		if ( ! is_user_logged_in() ) {
            return;
        }

		if( isset( $_POST['multistorex_add_product'] ) ) {
			
			$post_title     = sanitize_text_field( $_POST['post_title'] );
			$post_content   = sanitize_text_field( $_POST['post_content'] );

			$data = array(
				'post_type'    => 'product',
				'post_title'   => $post_title,
				'post_content' => $post_content,
			);

			$product_id = wp_insert_post( $data );

			if ( $product_id ) {
				
				if ( isset( $_POST['regular_price'] ) ) {
					$regular_price = $_POST['regular_price'];
					update_post_meta( $product_id, '_regular_price', $regular_price );
				}

				do_action( 'multistorex_new_product_added', $product_id, $post_data );
			}
		}
	}

	/**
	 * Process Product Updating to db
	 * 
	 * @return void
	 */ 
	public function process_product_update() {
		if ( ! is_user_logged_in() ) {
            return;
        }

		if( isset( $_POST['multistorex_update_product'] ) ) {
			
			$post_title     = sanitize_text_field( $_POST['post_title'] );
			$post_content   = sanitize_text_field( $_POST['post_content'] );

			$post_id = absint( $_POST['post_id'] );

			$data = array(
				'ID'		   => $post_id,
				'post_type'    => 'product',
				'post_title'   => $post_title,
				'post_content' => $post_content,
			);

			wp_update_post( $data );

			do_action( 'multistorex_product_updated', $post_id, $post_data );
		}
	}

	/**
	 * Process Product Delete to db
	 * 
	 * @return void
	 */ 
	public function process_delete_product() {
		if ( ! is_user_logged_in() ) {
            return;
        }

		$product_id = isset( $_GET['post_id'] ) ? intval( $_GET['post_id'] ) : 0;

		do_action( 'multistorex_product_deleted', $product_id );
	}
}
