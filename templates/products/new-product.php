<div class="multistorex">
	<?php do_action( 'multistorex_dashboard_content_before' ); ?>

	<div class="multistorex-content">	
		<h2 class="multistorex-title"> Add Product </h2>
		<form class="multistorex-add-product" enctype="multipart/form-data" method="post">

			<div class="multistorex-form-group">
				<label class="multistorex-label"> Product Title </label>
				<input class="multistorex-form-control" type="text" name="product_title" />
			</div>

			<div class="multistorex-form-group">
				<div class="multistorex-form-group">
					<label>	<input type="checkbox" name="manage_stock" value="yes" /> Enable product stock management </label>
				</div>

				<!-- <div class="multistorex-form-group">
					<label>	<input type="checkbox"  /> Allow only one quantity of this product to be bought in a single order </label>
				</div> -->
			</div>

			<div class="multistorex-form-group">

				<div>
					<label class="multistorex-label"> Price </label>
					<input class="multistorex-form-control" type="text" name="regular_price" id="regular_price" />
				</div>

				<div>
					<label class="multistorex-label"> Discounted Price </label>
					<input class="multistorex-form-control" type="text" name="sale_price" id="sale_price" />
				</div>

			</div>

			<div class="multistorex-form-group">

				<div>
					<label class="multistorex-label"> From </label>
					<input class="multistorex-form-control" type="date" />
				</div>

				<div>
					<label class="multistorex-label"> To </label>
					<input class="multistorex-form-control" type="date" />
				</div>

			</div>

			<div class="multistorex-form-group">
				
				<div>
					<label class="multistorex-label"> Category </label>
					<select class="multistorex-form-control" name="product_category" id="product_category">
						<option value="instock"> In Stock </option>
						<option value="outofstock"> Out of Stock </option>
						<option value="onbackorder"> On Backorder </option>
					</select>
				</div>

				<div>
					<label class="multistorex-label"> Tags </label>
					<input class="multistorex-form-control" type="text" />
				</div>

			</div>

			<div class="multistorex-form-group">
				<div>
					<label class="multistorex-label"> Description </label>
					<textarea class="multistorex-form-control" name="post_content" id="post_content"> </textarea>
				</div>
			</div>

			<div class="multistorex-form-group">
				<div>
					<label class="multistorex-label"> Short Description </label>
					<textarea class="multistorex-form-control" name="short_description" id="short_description"> </textarea>
				</div>
			</div>

			<div class="multistorex-form-group">

				<div>
					<label class="multistorex-label"> Sku </label>
					<input class="multistorex-form-control" type="text" name="product_sku" id="product_sku"/>
				</div>

				<div>
					<label class="multistorex-label"> Stock Status </label>
					<select class="multistorex-form-control" name="stock_status" id="stock_status">
						<option value="instock"> In Stock </option>
						<option value="outofstock"> Out of Stock </option>
						<option value="onbackorder"> On Backorder </option>
					</select>
				</div>

			</div>

			<div class="multistorex-form-group">
				
				<div>
					<label class="multistorex-label"> Stock quantity </label>
					<input class="multistorex-form-control" type="text" name="stock_qty" id="stock_qty"/>
				</div>

				<div>
					<label class="multistorex-label"> Low stock threshold </label>
					<input class="multistorex-form-control" type="text" name="stock_qty" id="stock_qty" />
				</div>

			</div>

			<div class="multistorex-form-group">
				<label> Allow Backorders </label>
				<select class="multistorex-form-control" >
					<option value="no"> Do not allow </option>
					<option value="notify"> Allow but notify customer </option>
					<option value="yes"> Allow </option>
				</select>
			</div>

			<!-- <div class="multistorex-form-group">
				<label>	<input type="checkbox" /> Enable product stock management </label>
			</div>

			<div class="multistorex-form-group">
				<label>	<input type="checkbox" /> Allow only one quantity of this product to be bought in a single order </label>
			</div> -->

			<div class="multistorex-form-group">

				<div>
					<label class="multistorex-label"> Product Status </label>
					<select class="multistorex-form-control" >
						<option value="draft"> Draft </option>
						<option value="pending"> Pending Review </option>
					</select>
				</div>

				<div>
					<label class="multistorex-label"> Visibility </label>
					<select class="multistorex-form-control" name="visibility" id="visibility">
						<option value="visible"> Visible </option>
						<option value="catalog"> Catalog </option>
						<option value="search"> Search </option>
						<option value="hidden"> Hidden </option>
					</select>
				</div>

			</div>

			<div class="multistorex-form-group">
				<label class="multistorex-label"> Purchase Note </label>
				<textarea class="multistorex-form-control" name="purchase_note" id="purchase_note"> </textarea>
			</div>

			<div class="multistorex-form-group">
				<label>	<input type="checkbox" name="enable_reviews" id="enable_reviews" value="yes" />  Enable product reviews </label>
			</div>

			<div class="multistorex-form-group">
				<input type="submit" name="multistorex_add_product" value="Add Product" class="multistorex-btn btn" />
			</div>

		</form>

	</div>

	<?php do_action( 'multistorex_dashboard_content_after' ); ?>

</div>