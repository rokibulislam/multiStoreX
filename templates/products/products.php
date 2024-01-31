<div class="multistorex">

	<?php do_action( 'multistorex_dashboard_content_before' ); ?>

	<div class="multistorex-content">
		
		<h2 class="multistorex-title"> Product List </h2>

		<?php 

	        $new_product_url = add_query_arg(
	            [
	                '_multistorex_add_product_nonce' => wp_create_nonce( 'multistorex_add_product_nonce' ),
	            ],
	            multistorex_get_navigation_url( 'new-product' )
	        );
       	?>

        <a href="<?php echo esc_url( $new_product_url ); ?>" class="multistorex-btn multistorex-btn-theme multistorex-add-new-product'; ?>">
            <i class="fas fa-briefcase">&nbsp;</i>
            <?php esc_html_e( 'Add new product', 'multistorex-lite' ); ?>
        </a>

		<table class="multistorex-table">
			
			<thead>
				<tr>
					<th> <?php esc_html_e( 'Image', 'multistorex' ); ?> </th>
					<th> <?php esc_html_e( 'Name', 'multistorex' ); ?> </th>
					<th> <?php esc_html_e( 'Sku', 'multistorex' ); ?> </th>
					<th> <?php esc_html_e( 'Status', 'multistorex' ); ?> </th>
					<th> <?php esc_html_e( 'Stock', 'multistorex' ); ?> </th>
					<th> <?php esc_html_e( 'Price', 'multistorex' ); ?> </th>
				</tr>
			</thead>

			<tbody>
				<tr>
					<td> 6350ecd177c2b </td>
					<td> Angus MacGyver </td>
					<td> $22 </td>
					<td> Complete </td>
					<td> Product delivered </td>
					<td> $20 </td>
				</tr>
			</tbody>

		</table>

	</div>

	<?php do_action( 'multistorex_dashboard_content_after' ); ?>

</div>