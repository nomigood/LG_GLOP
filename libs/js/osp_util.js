
(function ($,undefined) { 
   
   $.configCategory =  {
		   options: {
			    id: 'CategoryId',
	            title: '',
	            onOk: null
	        },
	        _create: function () { 	        
	        	this.elementPlusClickDelegate 	= Function.createDelegate(this, this._onPlusClick);
	            this.elementMinusClickDelegate 	= Function.createDelegate(this, this._onMinusClick);
	            this.elementOkClickDelegate 	= Function.createDelegate(this, this._onOkClick);
	            this.elementCancelClickDelegate = Function.createDelegate(this, this._onCancelClick);

	            this.elementRoot 			= $('<div class="ux-grid-column-config"></div>');
	            this.elementEnabled 		= $('<div class="ux-grid-column-enabled"></div>');
	            this.elementEnabledWrap 	= $('<div></div>');
	            this.elementEnabledList 	= $('<ul></ul>');
	            this.elementDisabled 		= $('<div class="ux-grid-column-disabled"></div>');
	            this.elementDisabledWrap 	= $('<div></div>');
	            this.elementDisabledList 	= $('<ul></ul>');
	            this.elementButtons 		= $('<div class="ux-grid-column-buttons ux-layer-button"></div>');
	            this.elementButtonOk 		= $('<a class="ux-btn-point"><span>Confirm</span></a>');
	            this.elementButtonCancel 	= $('<a class="ux-btn-layer"><span>Cancel</span></a>');
	            this.elementRoot
	                .append(this.elementDisabled
	                    .append('<h3> Hidden </h3>')
	                    .append(this.elementDisabledWrap
	                        .append(this.elementDisabledList)))
	                .append(this.elementEnabled
	                    .append('<h3> Show </h3>')
	                    .append(this.elementEnabledWrap
	                        .append(this.elementEnabledList
	                            .sortable({
	                                axis: 'y',
	                                scroll: true,
	                                stop: this.elementSortableStop
	                            }))))
	                .append(this.elementButtons
	                    .append(this.elementButtonOk
	                        .click(this.elementOkClickDelegate))
	                    .append(this.elementButtonCancel
	                        .click(this.elementCancelClickDelegate)))
	                .popup({
	                    title: this.options.title
	                });
	        },
		   _render: function () { 
			    var column;
			    this.elementEnabledList.empty();
			    this.elementDisabledList.empty();
	            if (arguments.length == 0) {
	                var self = this;
	                setTimeout(function () {
	                    self._render(true);
	                }, 100);
	                return;
	            }
	            var hiddenFlag=false;
	            this.hideColumns;
	            var temp = [] ;
		        for (var i = 0; i < this.masterColumns.length; i++) { 
		        	hiddenFlag=false;
		        	for (var k = 0; k < this.showColumns.length; k++) { 
		        		if( this.masterColumns[i].code == this.showColumns[k].code){
		        			this.elementEnabledList.append(
		        			$('<li>') 
		                        .append($('<span class="ui-icon ui-icon-arrowthick-1-w"></span>').click(this.elementMinusClickDelegate))
		                        .append($('<span class="label">' + this.masterColumns[i].name.replace(/\<br \/\>/g, ' ') + '</span>'))
		                        .data(this.masterColumns[i]));   
		        				hiddenFlag=true; 
		        				break;
		        		} 
		        	} 
		        	if(hiddenFlag==false){
			        	this.elementDisabledList.append(
	        			$('<li>') 
	                        .append($('<span class="ui-icon ui-icon-arrowthick-1-e"></span>').click(this.elementMinusClickDelegate))
	                        .append($('<span class="label">' + this.masterColumns[i].name.replace(/\<br \/\>/g, ' ') + '</span>'))
	                        .data(this.masterColumns[i])); 
			        		temp.push(this.masterColumns[i]);
		        	}
		        }
		        this.hideColumns = temp;
	       },
	       _onPlusClick: function (event) {
	    	    //debugger; 
	    	    var li = $(event.target).parent('li');
	            var column = li.data();  
	            this.elementEnabledList.append(
                        $('<li>')
                            .append($('<span class="ui-icon ui-icon-arrowthick-1-w"></span>').click(this.elementMinusClickDelegate))
                            .append($('<span class="label">' + column.name.replace(/\<br \/\>/g, ' ') + '</span>'))
                            .data(column));

	            li.remove().empty(); 
	            for (var i = 0; i < this.hideColumns.length; i++) {
	                if (column.name == this.hideColumns[i].name) {
	                    this.hideColumns.splice(i, 1);
	                    return;
	                }
	            }  
 	       },
	       _onMinusClick: function (event) {
	            var li = $(event.target).parent('li');
	            var column = li.data();
	            li.remove().empty();
                this.hideColumns.push(column); 
	            this.elementDisabledList.empty();
	            for (var i = 0; i < this.hideColumns.length; i++) {
	                var column = this.hideColumns[i];
	                    this.elementDisabledList.append(
                        $('<li>')
                            .append($('<span class="ui-icon ui-icon-arrowthick-1-e"></span>').click(this.elementPlusClickDelegate))
                            .append($('<span class="label">' + column.name.replace(/\<br \/\>/g, ' ') + '</span>'))
                            .data(column));
	            }
	        },
	       _onOkClick: function () {
	    	    var column ={}, columns, i, j; 
	            var showColumn =[];
	            this.elementEnabledList.children('li').each(function (index, element) { 
	            	columns = $(element).data(); 
	            	column = {code:columns.code};  
                    showColumn.push(column);
	            });
	            if (typeof (this.options.onOk) === 'function') {
	                this.options.onOk(showColumn);
	            }  
	            this.elementRoot.popup('close');
	       },
	       _onCancelClick: function () { 
	    	   this.elementRoot.popup('close');
	       },
		   open: function (showColumns,masterColumns) {  
			   this.masterColumns = masterColumns; 
			   this.showColumns   = showColumns;  
			   this._create();
			   this._render(); 
		       this.elementRoot.popup('open');
		   },
		   clear: function () {
			   this.elementEnabledList.empty(); 
			   this.elementDisabledList.empty(); 
		   }
   }
   
})(jQuery);