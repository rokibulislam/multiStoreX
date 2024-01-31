<?php
namespace MultiStoreX;

/**
 * Product Class
 * 
 * @package MultiStoreX
 */
class Product {

	/**
	 * Constructor
	 * 
	 */ 
	public function __construct() {
		
	}

	/**
	 * Get All Product 
	 * 
	 * @param array $args
	 * 
	 * @return void
	 */
	public function all( $args = [] ) {

	}

	/**
	 * Get Product
	 * 
	 * @param int $product_id
	 * 
	 * @return void
	 */
	public function get( $product_id ) {
		return wc_get_product( $product_id );
	}

	/**
	 * Create Product 
	 * 
	 * @param array $args
	 * 
	 * @return void
	 */
	public function create( $args = [] ) {

	}

	/**
	 * Update Product 
	 * 
	 * @param array $args
	 * 
	 * @return void
	 */
	public function update( $args = array() ) {

	}

	/**
	 * Delete Product
	 * 
	 * @param int     $product_id
	 * @param boolean $force
	 * 
	 * @return void
	 */ 
	public function delete( $product_id, $force = false ) {
        
		$product = $this->get( $product_id );
        
		if ( $product ) {
            $product->delete( array( 'force_delete' => $force ) );
        }

        return $product;
	}
}
