<div class="multistorex">
	<?php do_action( 'multistorex_dashboard_content_before' ); ?>

	<div class="multistorex-content">	
		<h2 class="multistorex-title"> Add Post </h2>
		<form class="multistorex-add-post" enctype="multipart/form-data" method="post">

			<div class="multistorex-form-group">
				<label class="multistorex-label"> Post Title </label>
				<input class="multistorex-form-control" type="text" name="post_title" />
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
					<label class="multistorex-label"> Post Status </label>
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
				<input type="submit" name="multistorex_add_post" value="Add Post" class="multistorex-btn btn" />
			</div>

		</form>

	</div>

	<?php do_action( 'multistorex_dashboard_content_after' ); ?>

</div>