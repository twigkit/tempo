Tempo
=====

Tempo is a tiny JSON rendering engine that enables you to craft data templates in pure HTML.

Usage
-----

1. Include the Tempo script

	&lt;script src=&quot;js/tempo.js&quot; type=&quot;text/javascript&quot;&gt;&lt;/script&gt;
	&lt;script&gt;Tempo.prepare(&quot;tweets&quot;).render(data);&lt;/script&gt;
	

2. Compose the data template inline in HTML

	&lt;ol id=&quot;tweets&quot;&gt;
		&lt;li data-template&gt;
			&lt;img src=&quot;{{profile_image_url}}&quot; /&gt;
			&lt;h3&gt;{{from_user}}&lt;/h3&gt;
			&lt;p&gt;{{text}}&lt;/p&gt;
		&lt;/li&gt;
	&lt;/ol&gt;