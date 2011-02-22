Tempo
=====

Usage
-----

1. Include the Tempo script

	<script src="js/tempo.js" type="text/javascript"></script>
	<script>Tempo.prepare("tweets").render(data);</script>

2. Compose the data template inline in HTML

	<ol id="tweets">
		<li data-template>
			<img src="{{profile_image_url}}" />
			<h3>{{from_user}}</h3>
			<p>{{text}}</p>
		</li>
	</ol>