function SolrJS() {
	return this;
}

SolrJS.prototype.query = {
	query : function(query) {
		if (query != undefined) {
			this._reset();
			this.q = query;
		} else {
			return q;
		}
	},
	
	add_filter : function(field, value) {
		this.filters.push({'field': field, 'value': value});
	},
	
	remove_filter : function(field, value) {
		for (var i in this.filters) {
			if (this.filters[i] != undefined && this.filters[i].field == field && this.filters[i].value == value) {
				this.filters[i] = undefined;
			}
		}
	},
	
	host : function(host) {
		if (host != undefined) {
			return this.host = host;
		} else {
			return this.host;
		}
	},
	
	url : function() {
		var req = this.host + '&q=' + this.q;
		for (var i in this.filters) {
			if (this.filters[i] != undefined) {
				req += '&fq=' + this.filters[i].field + ':("' + this.filters[i].value + '")';
			}
		}
		return req;
	},
	
	_reset : function() {
		this.q = '';
		this.filters = [];
	},
}

SolrJS.prototype.response = {
		getFacetsAsArray : function(facet_fields) {
		var facets = [];

		for (var field in facet_fields) {
			var f = {'name' : field};

			var facet = [];
			var i = 0;
			while (i < facet_fields[field].length) {
				facet.push({'field': field, 'label': facet_fields[field][i++], 'count': facet_fields[field][i++]});
			}
			f['facet'] = facet;

			facets.push(f);
		}

		return facets;
	}
}