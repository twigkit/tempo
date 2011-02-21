function SolrJS(host) {
	this.h = host;
	this.params = {};
	
	return this;
}

SolrJS.prototype = {
	q : function(query) {
		if (query != undefined) {
			this._reset();
			this.params.q = query;
		} else {
			return this.params.q;
		}
	},
	
	add_fq : function(field, value) {
		this.params.fq.push({'field': field, 'value': value});
	},
	
	remove_fq : function(field, value) {
		for (var i in this.params.fq) {
			if (this.params.fq[i] != undefined && this.params.fq[i].field == field && this.params.fq[i].value == value) {
				this.params.fq[i] = undefined;
			}
		}
	},
	
	url : function() {
		var req = this.h + '&q=' + this.params.q;
		for (var i in this.params.fq) {
			if (this.params.fq[i] != undefined) {
				req += '&fq=' + this.params.fq[i].field + ':("' + this.params.fq[i].value + '")';
			}
		}
		return req;
	},
	
	_reset : function() {
		this.params.q = '';
		this.params.fq = [];
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