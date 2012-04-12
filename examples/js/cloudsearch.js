function CloudSearchJS(host) {
    this.h = host;
    this.params = {};
    this.params.bq = [];

    return this;
}

CloudSearchJS.prototype = {
    q : function(query) {
        if (query != undefined) {
            this.params.q = query;
        } else {
            return this.params.q;
        }
    },

    add_bq : function(field, value) {
        this.params.bq.push({'field': field, 'value': value});
    },

    remove_bq : function(field, value) {
        for (var i in this.params.bq) {
            if (this.params.bq[i] != undefined && this.params.bq[i].field == field && this.params.bq[i].value == value) {
                this.params.bq[i] = undefined;
            }
        }
    },

    url : function() {
        var req = this.h + '&q=' + this.params.q;
        var filters = '';
        for (var i in this.params.bq) {
            if (this.params.bq[i] != undefined) {
                filters += ' (field ' + this.params.bq[i].field + ' \'' + this.params.bq[i].value + '\')';
            }
        }
        if (filters.length > 0) {
            req += '&bq=(and' + filters + ' )';
            
        }
        return req;
    },

    reset : function() {
        this.params.q = '';
        this.params = {};
        this.params.bq = [];
    }
}