
/****************************************************************************************************
 * const */
var gfnc_positionSize = function() {
	var MIN_WIDTH = 820;
	var MIN_HEIGHT = 600;
	var BOTTOM_HEIGHT = 300;
	
	// 기본 여백
	var MARGIN_TOP = 51;
	var MARGIN_LEFT = parseInt($('.ux-content-wrap').css('paddingLeft'), 10);
	var MARGIN_RIGHT = parseInt($('.ux-content-wrap').css('paddingRight'), 10);
	var MARGIN_BOTTOM = parseInt($('.ux-content-wrap').css('paddingBottom'), 10) + 5;
	  
	var width  = $(window).width();
	var height = $(window).height();
	var middleHeight = height - MARGIN_TOP - MARGIN_BOTTOM - $('#layout-bottom').outerHeight();
	
	var defaultWidth = width - MARGIN_LEFT - MARGIN_RIGHT - 2;
	var defaultHeight = middleHeight - $('#layout-middle .ux-grid-title').outerHeight() - $('#layout-middle .ux-grid-btm').outerHeight() - 2;
	var position = new Object;
	position.x = defaultWidth;
	position.y = defaultHeight;
	return position;
} 