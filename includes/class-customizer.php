<?php
namespace MultiStoreX;

/**
 * MultiStoreX Customizer
 * 
 * @package MultiStoreX
 */ 
class Customizer {

	/**
	 * Constructor
	 */ 
	public function __construct() {
	    add_action( 'customize_register', array( $this, 'add_sections' ) );
        add_action( 'customize_controls_enqueue_scripts', array( $this, 'enqueue_control_scripts' ) );
        add_action( 'customize_preview_init', array( $this, 'enqueue_preview_scripts' ) );	
	}

	/**
	 * Add Section
	 * 
	 * @return void
	 */
	public function add_sections() {

	}

	/**
	 * Enqueue Control Scripts
	 * 
	 * @return void
	 */
	public function enqueue_control_scripts() {

	}

	/**
	 * Enqueue Preview Scripts
	 * 
	 * @return void
	 */
	public function enqueue_preview_scripts() {
		
	}
}