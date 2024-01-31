<?php
namespace MultiStoreX;

/**
 * Ajax Class
 * 
 * @package MultiStoreX
 */ 
class Ajax {
	
	/**
	 * Constructor
	 */ 
	public function __construct() {
		add_action( 'wp_ajax_multistorex_create_new_product', array( $this, 'create_product' ) );
	}

	/**
	 * Create Product
	 * 
	 * @return void
	 */ 
	public function create_product() {

	}
}