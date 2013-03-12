
var URL_ROOT = '';

/*!
    json2.js
    2011-10-19

    Public Domain.

    NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

    See http://www.JSON.org/js.html
*/
var JSON;
if (!JSON) {
    JSON = {};
}

(function () {
    'use strict';

    function f(n) {
        // Format integers to have at least two digits.By
        return n < 10 ? '0' + n : n;
    }

    if (typeof Date.prototype.toJSON !== 'function') {

        Date.prototype.toJSON = function (key) {

            return isFinite(this.valueOf())
                ? this.getUTCFullYear() + '-' +
                    f(this.getUTCMonth() + 1) + '-' +
                    f(this.getUTCDate()) + 'T' +
                    f(this.getUTCHours()) + ':' +
                    f(this.getUTCMinutes()) + ':' +
                    f(this.getUTCSeconds()) + 'Z'
                : null;
        };

        String.prototype.toJSON =
            Number.prototype.toJSON =
            Boolean.prototype.toJSON = function (key) {
                return this.valueOf();
            };
    }

    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        gap,
        indent,
        meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"': '\\"',
            '\\': '\\\\'
        },
        rep;


    function quote(string) {

        // If the string contains no control characters, no quote characters, and no
        // backslash characters, then we can safely slap some quotes around it.
        // Otherwise we must also replace the offending characters with safe escape
        // sequences.

        escapable.lastIndex = 0;
        return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
            var c = meta[a];
            return typeof c === 'string'
                ? c
                : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
        }) + '"' : '"' + string + '"';
    }


    function str(key, holder) {

        // Produce a string from holder[key].

        var i,          // The loop counter.
            k,          // The member key.
            v,          // The member value.
            length,
            mind = gap,
            partial,
            value = holder[key];

        // If the value has a toJSON method, call it to obtain a replacement value.

        if (value && typeof value === 'object' &&
                typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }

        // If we were called with a replacer function, then call the replacer to
        // obtain a replacement value.

        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }

        // What happens next depends on the value's type.

        switch (typeof value) {
            case 'string':
                return quote(value);

            case 'number':

                // JSON numbers must be finite. Encode non-finite numbers as null.

                return isFinite(value) ? String(value) : 'null';

            case 'boolean':
            case 'null':

                // If the value is a boolean or null, convert it to a string. Note:
                // typeof null does not produce 'null'. The case is included here in
                // the remote chance that this gets fixed someday.

                return String(value);

                // If the type is 'object', we might be dealing with an object or an array or
                // null.

            case 'object':

                // Due to a specification blunder in ECMAScript, typeof null is 'object',
                // so watch out for that case.

                if (!value) {
                    return 'null';
                }

                // Make an array to hold the partial results of stringifying this object value.

                gap += indent;
                partial = [];

                // Is the value an array?

                if (Object.prototype.toString.apply(value) === '[object Array]') {

                    // The value is an array. Stringify every element. Use null as a placeholder
                    // for non-JSON values.

                    length = value.length;
                    for (i = 0; i < length; i += 1) {
                        partial[i] = str(i, value) || 'null';
                    }

                    // Join all of the elements together, separated with commas, and wrap them in
                    // brackets.

                    v = partial.length === 0
                        ? '[]'
                        : gap
                        ? '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']'
                        : '[' + partial.join(',') + ']';
                    gap = mind;
                    return v;
                }

                // If the replacer is an array, use it to select the members to be stringified.

                if (rep && typeof rep === 'object') {
                    length = rep.length;
                    for (i = 0; i < length; i += 1) {
                        if (typeof rep[i] === 'string') {
                            k = rep[i];
                            v = str(k, value);
                            if (v) {
                                partial.push(quote(k) + (gap ? ': ' : ':') + v);
                            }
                        }
                    }
                } else {

                    // Otherwise, iterate through all of the keys in the object.

                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = str(k, value);
                            if (v) {
                                partial.push(quote(k) + (gap ? ': ' : ':') + v);
                            }
                        }
                    }
                }

                // Join all of the member texts together, separated with commas,
                // and wrap them in braces.

                v = partial.length === 0
                    ? '{}'
                    : gap
                    ? '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}'
                    : '{' + partial.join(',') + '}';
                gap = mind;
                return v;
        }
    }

    // If the JSON object does not yet have a stringify method, give it one.

    if (typeof JSON.stringify !== 'function') {
        JSON.stringify = function (value, replacer, space) {

            // The stringify method takes a value and an optional replacer, and an optional
            // space parameter, and returns a JSON text. The replacer can be a function
            // that can replace values, or an array of strings that will select the keys.
            // A default replacer method can be provided. Use of the space parameter can
            // produce text that is more easily readable.

            var i;
            gap = '';
            indent = '';

            // If the space parameter is a number, make an indent string containing that
            // many spaces.

            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }

                // If the space parameter is a string, it will be used as the indent string.

            } else if (typeof space === 'string') {
                indent = space;
            }

            // If there is a replacer, it must be a function or an array.
            // Otherwise, throw an error.

            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                    (typeof replacer !== 'object' ||
                    typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }

            // Make a fake root object containing our value under the key of ''.
            // Return the result of stringifying the value.

            return str('', { '': value });
        };
    }


    // If the JSON object does not yet have a parse method, give it one.

    if (typeof JSON.parse !== 'function') {
        JSON.parse = function (text, reviver) { 
            // The parse method takes a text and an optional reviver function, and returns
            // a JavaScript value if the text is a valid JSON text.

            var j;

            function walk(holder, key) {

                // The walk method is used to recursively walk the resulting structure so
                // that modifications can be made.

                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }


            // Parsing happens in four stages. In the first stage, we replace certain
            // Unicode characters with escape sequences. JavaScript handles many characters
            // incorrectly, either silently deleting them, or treating them as line endings.

            text = String(text);
            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return '\\u' +
                        ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }

            // In the second stage, we run the text against regular expressions that look
            // for non-JSON patterns. We are especially concerned with '()' and 'new'
            // because they can cause invocation, and '=' because it can cause mutation.
            // But just to be safe, we want to reject all unexpected forms.

            // We split the second stage into 4 regexp operations in order to work around
            // crippling inefficiencies in IE's and Safari's regexp engines. First we
            // replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
            // replace all simple value tokens with ']' characters. Third, we delete all
            // open brackets that follow a colon or comma or that begin the text. Finally,
            // we look to see that the remaining characters are only whitespace or ']' or
            // ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

            if (/^[\],:{}\s]*$/
                    .test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
                        .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
                        .replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

                // In the third stage we use the eval function to compile the text into a
                // JavaScript structure. The '{' operator is subject to a syntactic ambiguity
                // in JavaScript: it can begin a block or an object literal. We wrap the text
                // in parens to eliminate the ambiguity.

                j = eval('(' + text + ')');

                // In the optional fourth stage, we recursively walk the new structure, passing
                // each name/value pair to a reviver function for possible transformation.

                return typeof reviver === 'function'
                    ? walk({ '': j }, '')
                    : j;
            }

            // If the text is not JSON parseable, then a SyntaxError is thrown.

            throw new SyntaxError('JSON.parse');
        };
    }
}());

/*!
 * The Microsoft Ajax Library type extensions extend base ECMAScript (JavaScript) object functionality.
 * -----------------------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 * -----------------------------------------------------------------------
 */
Function.createCallback = function Function$createCallback(method, context) {
    return function () {
        var l = arguments.length;
        if (l > 0) {
            var args = [];
            for (var i = 0; i < l; i++) {
                args[i] = arguments[i];
            }
            args[l] = context;
            return method.apply(this, args);
        }
        return method.call(this, context);
    }
};
Function.createDelegate = function Function$createDelegate(instance, method) {
    return function () {
        return method.apply(instance, arguments);
    }
};
Function.emptyFunction = Function.emptyMethod = function Function$emptyMethod() {
};
String.prototype.endsWith = function String$endsWith(suffix) {
    return (this.substr(this.length - suffix.length) === suffix);
};
String.prototype.startsWith = function String$startsWith(prefix) {
    return (this.substr(0, prefix.length) === prefix);
};
String.prototype.trim = function String$trim() {
    return this.replace(/^\s+|\s+$/g, '');
};
String.prototype.trimEnd = function String$trimEnd() {
    return this.replace(/\s+$/, '');
};
String.prototype.trimStart = function String$trimStart() {
    return this.replace(/^\s+/, '');
};
String.format = function String$format(format, args) {
    return String._toFormattedString(false, arguments);
};
String._toFormattedString = function String$_toFormattedString(useLocale, args) {
	try{
	    var result = '';
	    var format = args[0];
	    for (var i = 0; ;) {
	        var open = format.indexOf('{', i);
	        var close = format.indexOf('}', i);
	        if ((open < 0) && (close < 0)) {
	            result += format.slice(i);
	            break;
	        }
	        if ((close > 0) && ((close < open) || (open < 0))) {
	            if (format.charAt(close + 1) !== '}') {
	                throw new Error('format');
	            }
	            result += format.slice(i, close + 1);
	            i = close + 2;
	            continue;
	        }
	        result += format.slice(i, open);
	        i = open + 1;
	        if (format.charAt(i) === '{') {
	            result += '{';
	            i++;
	            continue;
	        }
	        if (close < 0) new Error('format');
	        var brace = format.substring(i, close);
	        var colonIndex = brace.indexOf(':');
	        var argNumber = parseInt((colonIndex < 0) ? brace : brace.substring(0, colonIndex), 10) + 1;
	        if (isNaN(argNumber)) new Error('format');
	        var argFormat = (colonIndex < 0) ? '' : brace.substring(colonIndex + 1);
	        var arg = args[argNumber];
	        if (typeof (arg) === "undefined" || arg === null) {
	            arg = '';
	        }
	        if (arg.toFormattedString) {
	            result += arg.toFormattedString(argFormat);
	        }
	        else if (useLocale && arg.localeFormat) {
	            result += arg.localeFormat(argFormat);
	        }
	        else if (arg.format) {
	            result += arg.format(argFormat);
	        }
	        else
	            result += arg.toString();
	        i = close + 1;
	    }
	    return result;
	}catch(e) {
	//	alert("-error--->"+ e);
	}   
};
Boolean.parse = function Boolean$parse(value) {
    var v = value.trim().toLowerCase();
    if (v === 'false') return false;
    if (v === 'true') return true;
    throw new Error('value');
};
Array.clone = function Array$clone(array) {
    if (array.length === 1) {
        return [array[0]];
    }
    else {
        return Array.apply(null, array);
    }
};

/*!
 * Type extensions extend base ECMAScript (JavaScript) object functionality.
 * -----------------------------------------------------------------------
 * Yeongseok, Yoon
 * -----------------------------------------------------------------------
 */
String.isNullOrEmpty = function (s) {
    // 빈 값 또는 null인지 확인한다.
    if (typeof (s) === 'undefined') {
        return true;
    }
    if (s == null) {
        return true;
    }
    return false;
};
String.isNullOrWhitespace = function (s) {
    // 빈 값이나 공백문자, null인지 확인한다.
    if (typeof (s) === 'undefined') {
        return true;
    }
    if (s == null) {
        return true;
    }
    if (s.trim(s).length == 0) {
        return true;
    }
    return false;
};
Object.nullToZero = function (o) {
    // null을 숫자 0으로 변경한다.
    return Object.nullTo(o, 0);
};
Object.nullToEmpty = function (o) {
    // null을 빈 문자열로 변경한다.
    return Object.nullTo(o, '');
};
Object.nullTo = function (o, to) {
    // null을 특정 값으로 변경한다.
    if (typeof (o) === 'undefined') {
        return to;
    }
    if (o == null) {
        return to;
    }
    if (typeof (o) === 'string') {
        o = o.trim();
        if (String.isNullOrWhitespace(o)) {
            return to;
        }
    }
    if (typeof (o) === 'number') {
        if (isNaN(o)) {
            return to;
        }
    }

    return o;
};
Array.addIfNotNull = function (array, o) {
    // Array에 빈 값 또는 null이 아닐경우 추가한다.
    if (typeof (o) === 'undefined') {
        return;
    }
    if (o == null) {
        return;
    }
    if (typeof (o) === 'string') {
        if (String.isNullOrWhitespace(o)) {
            return;
        }
    }
    if (typeof (o) === 'number') {
        if (isNaN(o)) {
            return;
        }
    }

    array.push(o);
};
Array.pivot = function (array, x, y, value) {
    var i, j, k, contains;
    var results = [];
    var xvalues = [];
    var yvalues = [];
    for (i = 0; i < array.length; i++) {
        contains = false;
        for (j = 0; j < xvalues.length; j++) {
            if (xvalues[j] == array[i][x]) {
                contains = true;
                break;
            }
        }
        if (!contains) {
            xvalues.push(array[i][x]);
        }
    }
    for (i = 0; i < array.length; i++) {
        contains = false;
        for (j = 0; j < yvalues.length; j++) {
            if (yvalues[j].value == array[i][y]) {
                yvalues[j].indexOf.push(i);
                contains = true;
                break;
            }
        }
        if (!contains) {
            yvalues.push({
                value: array[i][y],
                indexOf: [i]
            });
        }
    }
    for (i = 0; i < yvalues.length; i++) {
        var result = {};
        result[y] = yvalues[i].value;
        for (j = 0; j < xvalues.length; j++) {
            result[xvalues[j]] = 0;
        }

        for (j = 0; j < yvalues[i].indexOf.length; j++) {
            k = yvalues[i].indexOf[j];
            var r = array[k];
            result[r[x]] += r[value];
        }

        results.push(result);
    }

    xvalues.sort(function (a, b) {
        if (a < b) {
            return -1;
        }
        if (a > b) {
            return 1;
        }
        return 0;
    });
    results.headers = [y];
    for (i = 0; i < xvalues.length; i++) {
        results.headers.push(xvalues[i]);
    }
    return results;
};

/*!
 * jQuery Utils
 * -----------------------------------------------------------------------
 * Yeongseok, Yoon
 * -----------------------------------------------------------------------
 */
(function ($, undefined) {
    // 서버 연동 플러그인
    $.ajaxClient = function (options) {
        options = $.extend({
            url: '',
            data: null,
            success: null,
            error: null,
            errorMessage: 'Unknown Error.',
            denyMessage: 'Access Denied.',
            messages: null
        }, options);

        // AJAX 호출
        $.ajax({
            url: options.url,
            type: 'POST',
            dataType: 'json',
            data: options.data,
            cache: false,
            success: function (data, textStatus, jqXHR) {
                // 에러 코드, 메시지를 가져온다.
                var code = '';
                var message = '';
                if (data && data.body && data.body.error && data.body.error.code) {
                    code = data.body.error.code;
                }
                if (data && data.body && data.body.result&&data.body.result.code) {
                    code = data.body.result.code;
                }
                if (data && data.body && data.body.result && data.body.result.msg) {
                    message = data.body.result.msg;
                }

                // 성공
                if (code === '0000') {
                    if (message) {
                        $('#loading').hide();
                        // 메시지가 있을 경우 표시
                        $.messageBox.alert(Globalize.localize('label_titleSuccess'), message, function () {
                            if (typeof (options.success) === 'function') {
                                options.success(data.body.result);
                            }
                        });
                    } else {
                        if (typeof (options.success) === 'function') {
                            options.success(data.body.result);
                        }
                    }
                    return;
                }

                // 로그아웃
                if (code === '4001') {
                    $('#loading').hide();
                    // 로그인 페이지로 이동
                    $.messageBox.alert(Globalize.localize('label_titleError'), Globalize.localize('message_notLogin'), function () {
                        top.window.location.href = '/tm/admin/LoginViewController.jsp?ControllerAction=Logout';
                    });
                    return;
                }

                // API/Workflow 실패
                if (code === '2900') {
                    $('#loading').hide();
                    // 실패 메시지 표시
                    $.messageBox.alert(Globalize.localize('label_titleError'), message, function () {
                        if (typeof (options.error) === 'function') {
                            options.error(code, message);
                        }
                    });
                    return;
                }

                // 권한 없음
                if (code === '2101' || code === '2201' || code === '2301' || code === '2401' || code === '2801' || code === '5001') {
                    $('#loading').hide();
                    // 권한 없음 메시지 표시
                    $.messageBox.alert(Globalize.localize('label_titleError'), options.denyMessage, function () {
                        if (typeof (options.error) === 'function') {
                            options.error(code, message);
                        }
                    });
                    return;
                }

                // 기타 에러
                // - 특정 에러 코드에 대한 메시지가 옵션에 정의되어 있으면 알림표시
                // - 메시지의 값이 SERVER_MESSAGE 는 서버에서 전달된 메시지 그대로 표시
                if (options.messages && options.messages[code]) {
                    if (options.messages[code] == 'SERVER_MESSAGE') {
                        options.messages[code] = message;
                    }
                    $('#loading').hide();
                    $.messageBox.alert(Globalize.localize('label_titleError'), options.messages[code], function () {
                        if (typeof (options.error) === 'function') {
                            options.error(code, message);
                        }
                    });
                    return;
                }

                $('#loading').hide();
                $.messageBox.alert(Globalize.localize('label_titleError'), options.errorMessage.replace(/\n/g, '<br />'), function () {
                    if (typeof (options.error) === 'function') {
                        options.error(code, message);
                    }
                });
            },
            error: function (jqXHR, textStatus, errorThrown) {
                var code = jqXHR.status;
                var message = jqXHR.statusText;
                $('#loading').hide();
                // 실패 메시지 표시
                $.messageBox.alert(Globalize.localize('label_titleError'), options.errorMessage.replace(/\n/g, '<br />'), function () {;
                    if (typeof (options.error) === 'function') {
                        options.error(code, message);
                    }
                });
            }
        });
    };
})(jQuery);

(function ($, undefined) {
    // 브러우져 콘솔에 내용 표시
    $.debug = {
        isDebug: false,
        log: function (s) {
            if ((typeof (Debug) !== 'undefined') && Debug.writeln) {
                Debug.writeln(s);
            }
            if (window.console && window.console.log) {
                window.console.log(s);
            }
        }
    };
})(jQuery);

(function ($, undefined) {
    // 파일 다운로드 - 임시로 HTML FORM을 만들어 파일을 다운로드 한다.
    $.download = function (method, action, params) {
        var builder = [];
        builder.push('<form method="' + method + '" action="' + action + '" target="_blank">');
        for (var key in params) {
            builder.push('<input type="text" name="' + key + '" value="' + params[key] + '" />');
        }
        builder.push('<input type="submit" />');
        builder.push('</form>');
        $(builder.join('')).appendTo(document.body).submit().remove();
    };
})(jQuery);

/*!
 * jQuery - popup
 * -----------------------------------------------------------------------
 * Yeongseok, Yoon
 * -----------------------------------------------------------------------
 */
(function ($, undefined) {
    // 레이어 팝업 플러그인
    $.widget('ui.popup', {
        options: {
            title: '',
            zIndex: 1500,
            onClose: null
        },
        _create: function () {
            // JQuery DOM 설정
            this.elementCloseDelegate = Function.createDelegate(this, this._onClose);
            this.elementContent = $('<div class="ux-popup-content"></div>');
            this.elementContentTable = $('<table></table>');
            this.elementContentTR = $('<tr></tr>');
            this.elementContentTD = $('<td></td>');
            this.elementTitleWrap = $('<div class="ux-popup-title"></div>');
            this.elementTitle = $('<h3>' + this.options.title + '</h3>');
            this.elementClose = $('<button class="ux-btn-popup-close"></button>');
            this.elementClose.click(this.elementCloseDelegate);
            this.elementDialog = $('<div class="ux-popup-wrap"></div>');
            this.elementDialog
                .append(this.elementTitleWrap
                    .append(this.elementTitle)
                    .append(this.elementClose))
                .append(this.elementContent
            		.append(this.elementContentTable
        				.append(this.elementContentTR
    						.append(this.elementContentTD
								.append(this.element)))))
                .appendTo(document.body).css({ top: 0, left: 0, zIndex: this.options.zIndex }).hide();
            // 전체 팝업 드래그 설정
            this.elementDialog.draggable({
                cancel: '.ux-btn-popup-close, .ux-popup-content',
                handle: '.ux-popup-title',
                containment: 'document'
            });
            this._isOpen = false;
        },
        _onClose: function () {
            // X 버튼 클릭 처리
            this.close();
            if (typeof (this.options.onClose) === 'function') {
                this.options.onClose();
            }
        },
        open: function () { 
            // 팝업 열기
            if (this._isOpen) {
                return;
            }
            // 배경 표시
            if ($.ui.popup.overlay == null) {
                $.ui.popup.overlay = $('.ux-popup-overlay');
            }
            $.ui.popup.overlay.show();
            // 위치 지정및 표시 
            this.elementDialog.css({
                top: (($(document.body).height() - this.elementDialog.height()) / 4) + 'px',
                left: (($(document.body).width() - this.elementDialog.width()) / 2) + 'px',
                zIndex: this.options.zIndex
            }).show();
  
            
            // 화면 크기변경 이벤트 처리 되도록 - 두번
            $(window).resize();
            $(window).resize();
            this._isOpen = true;

            $.ui.popup.count++;
        },
        close: function () {
            // 팝업 닫기
            // 팝업이 하나이면 배경 감추기
            if ($.ui.popup.count == 1) {
                $.ui.popup.overlay.hide();
            }
            // 감추기
            this.elementDialog.hide();
            this._isOpen = false;

            $.ui.popup.count--;
        },
        destroy: function () {
            if (this._isOpen) {
                this.close();
            }
            this.elementClose.unbind('click', this.elementCloseDelegate);
            this.elementDialog.empty();
            delete this.elementContent;
            delete this.elementContentTable;
            delete this.elementContentTR;
            delete this.elementContentTD;
            delete this.elementTitle;
            delete this.elementClose;
            delete this.elementClose;
            delete this.elementDialog;
            delete this._isOpen;
            delete this.elementCloseDelegate;

            $.Widget.prototype.destroy.call(this);
        }
    });

    $.ui.popup.overlay = null;
    $.ui.popup.count = 0;
})(jQuery);

/*!
 * jQuery - messageBox
 * -----------------------------------------------------------------------
 * Yeongseok, Yoon
 * -----------------------------------------------------------------------
 */
(function ($, undefined) {
    // 메시지 표시 플러그인 - 팝업 플러그인을 이용하여 특정 메시지를 화면에 표시한다.
    $.messageBox = {
        alert: function (title, message, func) {
            // 알림 메시지 표시
            var element =$('<div></div>');
            var ok = function () {
                // 확인버튼 클릭 처리
                element.popup('destroy');
                if (typeof (func) === 'function') {
                    func();
                }
            };
            
            element
                .append($('<textarea readonly="readonly" rows="5" cols="50"></textarea>')
                    .css({ width: '300px', height: '100%', padding: '1em', border: 'none' })
                    .val(message))
                .append($('<div class="ux-layer-button">')
		            .append($('<a class="ux-btn-point"><span>Confirm</span></a>').click(ok)))
                .popup({ title: title, onClose: ok})
                .popup('open');
        },
        confirm: function (title, message, funcOk, funcCancel) {
            // 확인 메시지 표시
            var element = $('<div></div>');
            var ok = function () {
                // 확인버튼 클릭 처리
                element.popup('destroy');
                if (typeof (funcOk) === 'function') {
                    funcOk();
                }
            };
            var cancel = function () {
                // 취소버튼 클릭 처리
                element.popup('destroy');
                if (typeof (funcCancel) === 'function') {
                    funcCancel();
                }
            };
            element
                .append($('<textarea readonly="readonly" rows="5" cols="50"></textarea>')
                    .css({ width: '300px', height: '100px', padding: '1em', border: 'none' })
                    .val(message))
                .append($('<div class="ux-layer-button">')
		            .append($('<a class="ux-btn-point"><span>' + Globalize.localize('button_ok') + '</span></a>').click(ok))
		            .append($('<a class="ux-btn-layer"><span>' + Globalize.localize('button_cancel') + '</span></a>').click(cancel)))
                .popup({ title: title, onClose: cancel })
                .popup('open');
        }
    };
})(jQuery);

/*!
 * jQuery - datepickerFromTo
 * -----------------------------------------------------------------------
 * Yeongseok, Yoon
 * -----------------------------------------------------------------------
 */
(function ($, undefined) {
    // 달력 플러그인 - 두개의 달력을 표시하여 시작/종료일을 선택할 수 있다.
    $.widget('ui.datepickerFromTo', {
        options: {
            to: null,
            onOpen: null,
            onOk: null
        },
        _create: function () {
            var elementId = this.element.attr('id');
            if (String.isNullOrWhitespace(elementId)) {
                elementId = 'DATEPICKERFROMTO_' + Math.random().toString().replace(/\./g, ''); this.element.attr('id', elementId);
            }

            this._isOpen = false;
            this.elementInputFocusDelegate = Function.createDelegate(this, this._onFoucsInput);
            this.elementInputFromKeyupDelegate = Function.createDelegate(this, this._onKeyupInputFrom);
            this.elementInputToKeyupDelegate = Function.createDelegate(this, this._onKeyupInputTo);
            this.elementDatepickerSelectDelegate = Function.createDelegate(this, this._onDatepickerSelect);
            this.elementButtonOKClickDelegate = Function.createDelegate(this, this._onClickOk);
            this.elementButtonCancelClickDelegate = Function.createDelegate(this, this._onClickCancel);

            this.elementFrom = this.element;
            this.elementFrom.focus(this.elementInputFocusDelegate).keyup(this.elementInputFromKeyupDelegate);
            this.elementTo = $(this.options.to);
            this.elementTo.focus(this.elementInputFocusDelegate).keyup(this.elementInputToKeyupDelegate);
            this.elementDatepickerFrom = $('<div class="ux-datepickerFromTo-from"></div>');
            this.elementDatepickerFrom.datepicker({ onSelect: this.elementDatepickerSelectDelegate });
            this.elementDatepickerTo = $('<div class="ux-datepickerFromTo-to"></div>');
            this.elementDatepickerTo.datepicker({ onSelect: this.elementDatepickerSelectDelegate });
            this.elementButtonOk = $('<button class="ux-core-buttonOk ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only">OK</botton>');
            this.elementButtonOk.click(this.elementButtonOKClickDelegate);
            this.elementButtonCancel = $('<button class="ux-core-buttonCancel ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only">Cancel</botton>');
            this.elementButtonCancel.click(this.elementButtonCancelClickDelegate);
            this.elementButtons = $('<div class="ux-datepickerFromTo-buttons"></div>');
            this.elementToday = $('<span class="ux-datepickerFromTo-today"></span>');
            this.elementButtons.append(this.elementToday).append(this.elementButtonOk).append(this.elementButtonCancel);
            this.elementDialogId = elementId + '_DIALOG';
            this.elementDialog = $('<div id="' + this.elementDialogId + '" style="overflow: hidden;" class="ux-datepickerFromTo ui-widget ui-widget-content ui-corner-all"></div>');
//            this.elementDialog.appendTo(document.body).hide().css({ zIndex: 1000 }).append(this.elementDatepickerFrom).append(this.elementDatepickerTo).append(this.elementButtons);

			if(this.options.to !=null)  // Twin Calendar
               this.elementDialog.appendTo(document.body).hide().css({ zIndex: 1000 }).append(this.elementDatepickerFrom).append(this.elementDatepickerTo).append(this.elementButtons);
			else						// Single Calendar	
	           this.elementDialog.appendTo(document.body).hide().css({ zIndex: 1000 }).append(this.elementDatepickerFrom).append(this.elementButtons);
   
            
            this.externalMouseDownDelegate = Function.createDelegate(this, this._onMouseDown);
            $(document).mousedown(this.externalMouseDownDelegate);

            this.externalResizeDelegate = Function.createDelegate(this, this._onResize);
            $(window).resize(this.externalResizeDelegate);
        },
        _onFoucsInput: function (event) {
            // 시작, 종료일 INPUT에 포커스가 가면 이 플러그인을 표시한다.
            this.open();
        },
        _onKeyupInputFrom: function (event) {
            // INPUT에 직접 입력하여 값이 변경되면 이 플러그인의 값을 변경한다.
            var date = Globalize.parseDate(this.elementFrom.val(), 'A');
            if (date) {
                this.elementDatepickerFrom.datepicker("setDate", date);
            }
        },
        _onKeyupInputTo: function (event) {
            // INPUT에 직접 입력하여 값이 변경되면 이 플러그인의 값을 변경한다.
            var date = Globalize.parseDate(this.elementTo.val(), 'A');
            if (date) {
                this.elementDatepickerTo.datepicker("setDate", date);
            }
        },
        _onDatepickerSelect: function (event) {
            // 이 플러그인에서 날짜를 선택하면 INPUT에 선택한 날짜값을 적용한다.
            this.elementFrom.val(Globalize.format(this.elementDatepickerFrom.datepicker('getDate'), 'A'));
            this.elementTo.val(Globalize.format(this.elementDatepickerTo.datepicker('getDate'), 'A'));
        },
        _onClickOk: function (event) {
            // OK버튼을 클릭하면 이 플러그인에서 선택한 날짜를 INPUT에 적용한다.
            this.elementFrom.val(Globalize.format(this.elementDatepickerFrom.datepicker('getDate'), 'A'));
            this.elementTo.val(Globalize.format(this.elementDatepickerTo.datepicker('getDate'), 'A'));
            this.close();
            if (typeof (this.options.onOk) === 'function') {
                this.options.onOk();
            }
        },
        _onClickCancel: function (event) {
            // Cancel버튼을 클릭하면 INPUT에 원래 값을 적용한다.
            this.elementFrom.val(this.dateFrom ? Globalize.format(this.dateFrom, 'A') : '');
            this.elementTo.val(this.dateTo ? Globalize.format(this.dateTo, 'A') : '');
            this.close();
        },
        _onMouseDown: function (event) {
            // 이 플러그인 외의 다른 화면을 클릭하면 이 플러그인을 닫는다.
            if (!this._isOpen) {
                return;
            }

            // INPUT이면 아무동작 안함
            var target = $(event.target);
            if (target[0] == this.elementFrom[0] ||
                target[0] == this.elementTo[0]) {
                return;
            }

            // 이 플러그인을 클릭하지 않았으면 닫기
            if (target[0].id != this.elementDialogId &&
                target.parents('#' + this.elementDialogId).length == 0) {
                this.close();
            }
        },
        _onResize: function (event) {
            // 브라우져 크기가 변경되면 이 플러그인을 닫는다.
            if (this._isOpen) {
                this.close();
            };
        },
        open: function () {
            // 플러그인 표시
            if (this._isOpen) {
                return;
            }
            // 원본 날짜
            this.dateFrom = Globalize.parseDate(this.elementFrom.val(), 'A');
            this.dateTo = Globalize.parseDate(this.elementTo.val(), 'A');
            //this.elementToday.text(Globalize.localize('label_today') + ' : ' + Globalize.format(new Date(), 'A'));
            this.elementToday.text('today : ' + Globalize.format(new Date(), 'A'));
            // 플러그인의 날짜 선택
            if (this.dateFrom) {
                this.elementDatepickerFrom.datepicker("setDate", this.dateFrom);
            }
            if (this.dateTo) {
                this.elementDatepickerTo.datepicker("setDate", this.dateTo);
            }
            // 위치조정 및 표시
            var offset = this.element.offset(); offset.top += 18;
            if (this.elementDialog.width() + offset.left + 5 > $(document.body).width()) {
                offset.left = this.elementTo.offset().left + this.elementTo.width() - this.elementDialog.width() + 30;
            }
            this.elementDialog.css({ top: offset.top + 'px', left: offset.left + 'px' }).show();
            // 화면 크기변경 이벤트 처리 되도록 - 두번
            $(window).resize();
            $(window).resize();
            this._isOpen = true;
            // 이벤트 onOpen 발생
            if (typeof (this.options.onOpen) === 'function') {
                this.options.onOpen();
            }
        },
        close: function () {
            // 닫기
            this.elementDialog.hide();
            this._isOpen = false;
        },
        destroy: function () {
            this.elementFrom.unbind('focus', this.elementInputFocusDelegate);
            this.elementFrom.unbind('keyup', this.elementInputFromKeyupDelegate);
            this.elementTo.unbind('focus', this.elementInputFocusDelegate);
            this.elementTo.unbind('keyup', this.elementInputToKeyupDelegate);
            this.elementDatepickerFrom.datepicker('destroy');
            this.elementDatepickerTo.datepicker('destroy');
            this.elementButtonOk.unbind('click', this.elementButtonOKClickDelegate);
            this.elementButtonCancel.unbind('click', this.elementButtonCancelClickDelegate);
            this.elementDialog.remove().empty();
            delete this.elementFrom;
            delete this.elementTo;
            delete this.elementDatepickerFrom;
            delete this.elementDatepickerTo;
            delete this.elementButtonOk;
            delete this.elementButtonCancel;
            delete this.elementToday;
            delete this.elementButtons;
            delete this.elementDialog;
            delete this.elementDialogId;
            delete this.elementInputFocusDelegate;
            delete this.elementInputFromKeyupDelegate;
            delete this.elementInputToKeyupDelegate;
            delete this.elementDatepickerSelectDelegate;
            delete this.elementButtonOKClickDelegate;
            delete this.elementButtonCancelClickDelegate;
            delete this._isOpen;

            $(document).unbind('mousedown', this.externalMouseDownDelegate);
            delete this.externalMouseDownDelegate;

            $(window).unbind('resize', this.externalResizeDelegate);
            delete this.externalResizeDelegate;

            $.Widget.prototype.destroy.call(this);
        }
    });
})(jQuery);

/*!
 * jQuery - selectbox
 * -----------------------------------------------------------------------
 * Yeongseok, Yoon
 * -----------------------------------------------------------------------
 */
(function ($, undefined) {
    // 셀렉트 박스 플러그인
    $.widget('ui.selectbox', {
        options: {
            title: '',
            width: 60,
            widthByElement: false,
            codeProperty: 'code',
            nameProperty: 'name',
            showCode: false
        },
        _create: function () {
            var elementId = this.element.attr('id');
            if (String.isNullOrWhitespace(elementId)) {
                elementId = 'SELECTBOX_' + Math.random().toString().replace(/\./g, ''); this.element.attr('id', elementId);
            }
            if (this.options.widthByElement) {
                this.options.width = this.element.width();
            }

            this.elementListClickDelegate = Function.createDelegate(this, this._onClickList);
            this.elementArrowClickDelegate = Function.createDelegate(this, this._onArrowClick);
            this.elementLabel = $('<span style="width:' + (this.options.width - 19) + 'px"></span>').text(this.options.title).attr('title', this.options.title);
            this.elementLabel.click(this.elementArrowClickDelegate);
            this.elementArrow = $('<em></em>');
            this.elementArrow.click(this.elementArrowClickDelegate);
            this.elementList = $('<ul style="min-width:' + this.options.width + 'px"></ul>');
            this.elementDialogId = elementId + '_DIALOG';
            this.elementDialog = $('<div id="' + this.elementDialogId + '" class="ux-select-box-plan-layer" style="display: none;min-width:' + this.options.width + 'px"></div>');
            this.elementDialog.appendTo(document.body).append(this.elementList);
            this.elementDialogEmptyId = elementId + '_DIALOG_EMPTY';
            this.elementDialogEmpty = $('<div id="' + this.elementDialogEmptyId + '" class="ux-select-box-plan-layer" style="display: none; height: 16px;"></div>');
            this.elementDialogEmpty.appendTo(document.body);
            this.elementRoot = $('<div class="ux-select-box-plan" style="width:' + this.options.width + 'px"></div>');
            this.elementRoot.append(this.elementLabel).append(this.elementArrow).append('<div class="ux-clear"><span></span></div>');
            this.element.before(this.elementRoot).hide();
            this.selected = null;
            this._isOpen = false;

            this.externalMouseDownDelegate = Function.createDelegate(this, this._onMouseDown);
            $(document).mousedown(this.externalMouseDownDelegate);

            this.externalResizeDelegate = Function.createDelegate(this, this._onResize);
            $(window).resize(this.externalResizeDelegate);
        },
        _setOption: function (key, value) {
            // 그리드에서 사용하기 위해 크기변경 옵션은 최초 설정 후에도 변경가능.
            switch (key) {
                case "width":
                    this.elementList.css('min-width', value + 'px');
                    this.elementLabel.css('width', (value - 19) + 'px');
                    this.elementDialog.css('min-width', value + 'px');
                    this.elementRoot.css('width', value + 'px');
                    break;
            }

            $.Widget.prototype._setOption.apply(this, arguments);
        },
        _onArrowClick: function () {
            // 기본 HTML요소 클릭시 목록 표시및 감추기
            if (this._isOpen) {
                this.close();
            } else {
                this.open();
            }
        },
        _onClickList: function (event) {
            // 특정 항목 선택 시
            this.elementList.children('li').removeClass('selected');
            if (event.target.tagName === 'LI') {
                $(event.target).addClass('selected');
            } else {
                $(event.target).parent('LI').addClass('selected');
            }
            // 선택 값
            this.selected = event.data;
            // 닫기
            this.close();
        },
        _onMouseDown: function (event) {
            // 이 플러그인 외에 다른 화면을 클릭하면 이 플러그인을 닫는다.
            if (!this._isOpen) {
                return;
            }
            var target = $(event.target);
            // 기본 HTML요소 클릭 시 아무 작업 안함
            if (target[0] == this.elementLabel[0] ||
                target[0] == this.elementArrow[0]) {
                return;
            }
            // 목록을 클릭하지 않았을 경우 닫기.
            if (target[0].id != this.elementDialogId &&
                target.parents('#' + this.elementDialogId).length == 0 &&
                target[0].id != this.elementDialogEmptyId &&
                target.parents('#' + this.elementDialogEmptyId).length == 0) {
                this.close();
            }
        },
        _onResize: function (event) {
            // 윈도우 크기 변경시 이 플러그인을 닫는다.
            if (this._isOpen) {
                this.close();
            };
        },
        open: function () {
            // 이 플러그인 표시
            // 읽기전용일 경우 아무 작업도 하지 않는다.
            if (this.options.isReadonly) {
                return;
            }
            // 위치 설정및 표시
            var offset = this.elementRoot.offset(); offset.top += 17; //this.elementDatepickerFrom.outerHeight();
            if (this.elementList.children('li').length == 0) {
                // 표시할 값이 없으면 빈 화면 표시
                this.elementDialogEmpty.css({ top: offset.top + 'px', left: offset.left + 'px', width: this.elementRoot.width() }).show();
            } else {
                // 목록 표시
                if (this.elementDialog.width() + offset.left + 5 > $(document.body).width()) {
                    offset.left = this.elementRoot.offset().left + this.elementRoot.width() - this.elementDialog.width();
                }
                if (this.elementDialog.height() + offset.top + 5 > $(document.body).height()) {
                    offset.top = this.elementRoot.offset().top - this.elementDialog.height();
                }
                this.elementDialog.css({ top: offset.top + 'px', left: offset.left + 'px' }).show();
            }
            // 화면 크기변경 이벤트 처리 되도록 - 두번
            $(window).resize();
            $(window).resize();
            this._isOpen = true;
        },
        close: function () {
            // 닫기
            var valueBefore = this.element.val() || '';
            var value = this.selected ? this.selected.value : '';
            var label = this.selected ? this.selected.label : '';
            if (valueBefore != value) {
                this.element.val(value);
                this.element.change();
            }
	        if(this.elementLabel){    
	            if (label) { 
	                this.elementLabel.text(this.selected.label).attr('title', this.selected.label);
	            } else {
	                this.elementLabel.text(this.options.title).attr('title', this.options.title);
	            } 
	            this.elementDialog.hide();
	            this.elementDialogEmpty.hide();
	        }   
            this._isOpen = false;
        },
        update: function () {
            // 변경된 데이터에따라 UI업데이트
            var self = this;
            this.selected = null;
            this.elementList.children('li').unbind('click');
            this.elementList.empty();
            this.elementLabel.text(this.options.title).attr('title', this.options.title);
            this.element.children('option').each(function (index, element) {
                var value = $(element).val();
                var label = $(element).attr('label') + (self.options.showCode ? '(' + value + ')' : '');
                self.elementList.append($('<li' + (value == self.element.val() ? ' class="selected"' : '') + '></li>').append($('<span></span>').text(label)).click({ label: label, value: value }, self.elementListClickDelegate));
                if (value == self.element.val()) {
                    self.selected = { value: value, label: label };
                    self.elementLabel.text(label).attr('title', label);
                }
            });
        },
        applyData: function (data, defaultValue) {
            // 새로운 데이터 적용
            // 기존 목록 제거
            this.element.empty();
            // 값 추가 
            if (data && data instanceof Array) {
                for (var i = 0; i < data.length; i++) {
                    this.element.append($('<option></option>').val(data[i][this.options.codeProperty]).attr('label', data[i][this.options.nameProperty]));
                }
            }
            // 기본값 선택 
            if (typeof (defaultValue) !== 'undefined') {
                this.element.val(defaultValue);
            }
            // UI 업데이트
            this.update();
        },
        setValue: function (value) {
            // 선택값  setting
            this.element.val(value);
            // UI 업데이트
            this.update();
        },
        reset: function () {
            // 선택값 초기화
            this.element.val('');
            // UI 업데이트
            this.update();
        },
        readonly: function (isReadonly) {
            // 읽기전용으로 표시하거나 취소하기
            this.options.isReadonly = isReadonly;
        },
        destroy: function () {
            this.elementLabel.unbind('click', this.elementArrowClickDelegate);
            this.elementArrow.unbind('click', this.elementArrowClickDelegate);
            this.elementList.empty();
            this.elementDialog.remove().empty();
            this.elementRoot.empty().remove();
            this._isOpen = false;
            delete this.elementArrowClickDelegate;
            delete this.elementOkClickDelegate;
            delete this.elementLabel;
            delete this.elementArrow;
            delete this.elementList;
            delete this.elementDialog;
            delete this.elementDialogId;
            delete this.elementRoot;
            delete this._isOpen;

            $(document).unbind('mousedown', this.externalMouseDownDelegate);
            delete this.externalMouseDownDelegate;

            $(window).unbind('resize', this.externalResizeDelegate);
            delete this.externalResizeDelegate;

            $.Widget.prototype.destroy.call(this);
        }
    });
})(jQuery);

/*!
 * jQuery - selectWithCheckbox
 * -----------------------------------------------------------------------
 * Yeongseok, Yoon
 * -----------------------------------------------------------------------
 */
(function ($, undefined) {
    // 셀렉트 박스 플러그인 - 멀티 선택이 가능하도록 CHECKBOX 표시
    $.widget('ui.selectWithCheckbox', {
        options: {
            title: '',
            width: 60,
            search: false,
            codeProperty: 'code',
            nameProperty: 'name',
            showCode: false,
            useAll: true
        },
        _create: function () {
            var elementId = this.element.attr('id');
            if (String.isNullOrWhitespace(elementId)) {
                elementId = 'SELECTWITHCHECKBOX_' + Math.random().toString().replace(/\./g, ''); this.element.attr('id', elementId);
            }
			
            this.elementInputKeyupDelegate = Function.createDelegate(this, this._onKeyupClick);
            this.elementArrowClickDelegate = Function.createDelegate(this, this._onArrowClick);
            this.elementAllClickDelegate = Function.createDelegate(this, this._onAllSelect);
            this.elementArrow = $('<em></em>');
            this.elementInput = $('<input type="text" style="width:' + (this.options.width - 19) + 'px" />');
            this.elementInput.keyup(this.elementInputKeyupDelegate);
            this.elementLabel = $('<span style="width:' + (this.options.width - 19) + 'px"></span>').text(this.options.title).attr('title', this.options.title);
            this.elementLabel.click(this.elementArrowClickDelegate);
            this.elementArrow.click(this.elementArrowClickDelegate);
            this.elementList = $('<ul style="min-width:' + this.options.width + 'px"></ul>');
            this.elementDialogId = elementId + '_DIALOG';
            this.elementDialog = $('<div id="' + this.elementDialogId + '" class="ux-select-box-layer" style="display: none;min-width:' + this.options.width + 'px"></div>');
            this.elementDialog.appendTo(document.body).append(this.elementList);
            this.elementDialogEmptyId = elementId + '_DIALOG_EMPTY';
            this.elementDialogEmpty = $('<div id="' + this.elementDialogEmptyId + '" class="ux-select-box-layer" style="display: none; height: 16px;"></div>');
            this.elementDialogEmpty.appendTo(document.body);
            this.elementRoot = $('<div class="ux-select-box" style="width:' + this.options.width + 'px;border-bottom: 1px solid #a2a2a2; border-top: 1px solid #a2a2a2;"></div>');
            this.elementRoot.append(this.elementLabel).append(this.elementArrow).append('<div class="ux-clear" style="display: none;><span></span></div>');
            this.element.before(this.elementRoot).hide();
            this._isOpen = false;

            this.externalMouseDownDelegate = Function.createDelegate(this, this._onMouseDown);
            $(document).mousedown(this.externalMouseDownDelegate);

            this.externalResizeDelegate = Function.createDelegate(this, this._onResize);
            $(window).resize(this.externalResizeDelegate);
        },
        _setOption: function (key, value) {
            // 크기 변경 옵션은 초기설정 후에도 변경 가능 
            switch (key) {
                case "width":
                    this.elementList.css('min-width', value + 'px');
                    this.elementLabel.css('width', (value - 19) + 'px');
                    this.elementDialog.css('min-width', value + 'px');
                    this.elementRoot.css('width', value + 'px');
                    break;
            }

            $.Widget.prototype._setOption.apply(this, arguments);
        },
        _onKeyupClick: function (event) {
            // 목록 필터 기능 사용시 키입력 이벤트 처리
            // ESC 입력하면 닫기
            if (event.keyCode == 27) {
                this.close();
                return;
            }
            
            // 입력한 값으로 필터링 하기
            var value = this.elementInput.val();
            this.elementList.children('li').each(function (index, element) {
                if (index > 0) {
                    var label = $(element).find('span');
                    var checkbox = $(element).find('input');
                    if (label.text().split(value).length > 1 || checkbox.val().split(value).length > 1) {
                        $(element).show();
                    } else {
                        $(element).hide();
                        checkbox.removeAttr('checked');
                    }
                }
            });
            // 목록 위치 다시 조정
            var offset = this.elementRoot.offset(); offset.top += 17;
            if (this.elementDialog.width() + offset.left > $(document.body).width()) {
                offset.left = this.elementRoot.offset().left + this.elementRoot.width() - this.elementDialog.width();
            }
            this.elementDialog.css({ top: offset.top + 'px', left: offset.left + 'px' }).show();
        },
        _onArrowClick: function () {
            // 기본 HTML요소 클릭시 목록 표시및 감추기
            if (this._isOpen) {
                this.close();
            } else {
                this.open();
            }
        },
        _onAllSelect: function () {
            // 전체 선택및 해제 시
            var checked = false;
            // 화면에 표시된 목록중 전체를 선택하거나 해제한다.
            this.elementList.children('li:visible').each(function (index, element) {
                var checkbox = $(element).find('input');
                if (index == 0) {
                    checked = checkbox.is(':checked');
                } else {
                    if (checked) {
                        checkbox.attr('checked', 'checked');
                    } else {
                        checkbox.removeAttr('checked');
                    }
                }
            });
        },
        _onMouseDown: function (event) {
            // 이 플러그인 외에 다른 화면을 클릭하면 이 플러그인을 닫는다.
            if (!this._isOpen) {
                return;
            }
            var target = $(event.target);
            // 기본 HTML요소 클릭 시 아무 작업 안함
            if (target[0] == this.elementLabel[0] ||
                target[0] == this.elementArrow[0] ||
                target[0] == this.elementInput[0]) {
                return;
            }
            // 목록을 클릭하지 않았을 경우 닫기.
            if (target[0].id != this.elementDialogId &&
                target.parents('#' + this.elementDialogId).length == 0&&
                target[0].id != this.elementDialogEmptyId &&
                target.parents('#' + this.elementDialogEmptyId).length == 0) {
                this.close();
            }
        },
        _onResize: function (event) {
            // 윈도우 크기 변경시 이 플러그인을 닫는다.
            if (this._isOpen) {
                this.close();
            };
        },
        open: function () {
            // 이 플러그인 표시
            // 읽기전용일 경우 아무 작업도 하지 않는다.
            if (this.options.isReadonly) {
                return;
            }   
            // 위치 설정및 표시
            var offset = this.elementRoot.offset(); offset.top += 17;
            if (this.elementList.children('li').length == 0) {
                // 표시할 값이 없으면 빈 화면 표시
                this.elementDialogEmpty.css({ top: offset.top + 'px', left: offset.left + 'px', width: this.elementRoot.width() }).show();
            } else {
                // 목록 표시
                if (this.options.search) {
                    this.elementLabel.after(this.elementInput).hide();
                    this.elementInput.focus();
                }
                if (this.elementDialog.width() + offset.left + 5 > $(document.body).width()) {
                    offset.left = this.elementRoot.offset().left + this.elementRoot.width() - this.elementDialog.width();
                }
                if (this.elementDialog.height() + offset.top + 5 > $(document.body).height()) {
                    offset.top = this.elementRoot.offset().top - this.elementDialog.height();
                }
                this.elementDialog.css({ top: offset.top + 'px', left: offset.left + 'px' }).show();
            }
            // 화면 크기변경 이벤트 처리 되도록 - 두번
            $(window).resize();
            $(window).resize();
            this._isOpen = true;
        },
        close: function () {
            // 닫기
        	var self = this;
            var labels = [];
            var values = [];
            this.elementList.children('li').each(function (index, element) {
            	if (self.options.useAll) {
	                if (index > 0) {
	                    var label = $(element).find('span');
	                    var checkbox = $(element).find('input');
	                    if (checkbox.is(":checked")) {
	                        labels.push(label.text());
	                        values.push(checkbox.val());
	                    }
	                }
            	} else {
            		var label = $(element).find('span');
                    var checkbox = $(element).find('input');
                    if (checkbox.is(":checked")) {
                        labels.push(label.text());
                        values.push(checkbox.val());
                    }
            	}
            });
            // 이전값에서 변경되었으면 change이벤트 발생
            var valuesBefore = this.element.val() || [];
            if (valuesBefore.join(',') != values.join(',')) {
                this.element.val(values);
                this.element.change();
            }
            // 선택된 값 표시
            if (labels.length == 0) {
                // 선택된 값이 없을 때 - 기본 타이틀
                this.elementLabel.text(this.options.title);
            } else if (labels.length == 1) {
                // 하나 선택 - 선택된 값
                this.elementLabel.text(labels[0]);
            } else {
                // 여러개 선택 - ...
                this.elementLabel.text('...');
            }

            if (this.options.search) {
                this.elementLabel.show();
                this.elementInput.detach().val('');
                this.elementList.children('li').show();
            }
            this.elementDialog.hide();
            this.elementDialogEmpty.hide();
            this._isOpen = false;
        },
        update: function () {
            // 변경된 데이터에따라 UI업데이트
            var self = this;
            var labels = [];
            var values = [];
            this.elementList.empty();
            this.elementLabel.text(this.options.title).attr('title', this.options.title);
            this.element.children('option').each(function (index, element) {
                if (index == 0 && self.options.useAll) {
                    self.elementList.append($('<li></li>').append($('<input type="checkbox" class="ux-checkbox" />').click(self.elementAllClickDelegate)).append($('<span></span>').text('All')));
                }
                var value = $(element).val();
                var label = $(element).attr('label') + (self.options.showCode ? '(' + value + ')' : '');
                if ($(element).is(':selected')) {
                    self.elementList.append($('<li></li>').append($('<input type="checkbox" class="ux-checkbox" checked="checked" />').val(value)).append($('<span></span>').text(label)));
                    labels.push(label);
                    values.push(value);
                } else {
                    self.elementList.append($('<li></li>').append($('<input type="checkbox" class="ux-checkbox" />').val(value)).append($('<span></span>').text(label)));
                }
            });
            if (labels.length == 0) {
                this.elementLabel.text(this.options.title);
            } else if (labels.length == 1) {
                this.elementLabel.text(labels[0]);
            } else {
                this.elementLabel.text('...');
            }
        },
        applyData: function (data, defaultValue) {
            // 새로운 데이터 적용
            // 기존 목록 제거 
            this.element.empty();
            // 값 추가
            if (data && data instanceof Array) {
                var option = this.options;
                /*
                data.sort(function (a, b) {
                    if (a[option.nameProperty] == 'N/A') {
                        return 1;
                    }
                    if (b[option.nameProperty] == 'N/A') {
                        return -1;
                    }
                    if (a[option.nameProperty] > b[option.nameProperty]) {
                        return 1;
                    }
                    if (a[option.nameProperty] < b[option.nameProperty]) {
                        return -1;
                    }
                    return 0;
                });
                */
                for (var i = 0; i < data.length; i++) {
                    this.element.append($('<option></option>').val(data[i][this.options.codeProperty]).attr('label', data[i][this.options.nameProperty]));
                }
            }
            // 기본값 선택
            if (typeof (defaultValue) !== 'undefined') {
                this.element.val(defaultValue);
            }
            // UI 업데이트
            this.update();
        },
        setValue: function(obj){
            // 화면에 표시된  값을 셋팅한다. 
        	var value = '';
        	if( typeof (obj) === 'object') {
        		 for(var ikx=0;ikx<obj.length;ikx++){
        			 value+=obj[ikx].code+',';
        		 }
        	}else{
        		value = obj;
        	}
            this.elementList.children('li').each(function (index, element) {
                var checkbox = $(element).find('input');
                if (index > 0) {
                    if (value.indexOf(checkbox.val())>-1) {
                        checkbox.attr('checked', 'checked');
                    } else {
                        checkbox.removeAttr('checked');
                    }
                }
            });
            if(value.split(',').length>1)
            	this.elementLabel.text('...');
            else
            	this.elementLabel.text(value);
        }, 
        reset: function () {
            // 선택값 초기화
            this.element.val('');
            // UI 업데이트
            this.update();
        },
        readonly: function (isReadonly) {
            // 읽기전용으로 표시하거나 취소하기
            this.options.isReadonly = isReadonly;
        },
        destroy: function () {
            this.elementInput.unbind('keyup', this.elementInputKeyupDelegate);
            this.elementLabel.unbind('click', this.elementArrowClickDelegate);
            this.elementArrow.unbind('click', this.elementArrowClickDelegate);
            this.elementList.empty();
            this.elementDialog.remove().empty();
            this.elementRoot.empty().remove();
            this._isOpen = false;
            delete this.elementInputKeyupDelegate;
            delete this.elementArrowClickDelegate;
            delete this.elementAllClickDelegate;
            delete this.elementInput;
            delete this.elementLabel;
            delete this.elementArrow;
            delete this.elementList;
            delete this.elementDialog;
            delete this.elementDialogId;
            delete this.elementRoot;
            delete this._isOpen;

            $(document).unbind('mousedown', this.externalMouseDownDelegate);
            delete this.externalMouseDownDelegate;

            $(window).unbind('resize', this.externalResizeDelegate);
            delete this.externalResizeDelegate;

            $.Widget.prototype.destroy.call(this);
        }
    });
})(jQuery);

/*!
 * jQuery - grid
 * -----------------------------------------------------------------------
 * Yeongseok, Yoon
 * -----------------------------------------------------------------------
 */
(function ($, undefined) {
    var GridColumn = function (name, label, title, dataType, dataFormat, dataDefault, width, minWidth, maxWidth, align,color,bgcolor, useSort, useResize, useEdit, useEditDefault, useInsert, useCheckbox, isRequired, isShow, useMove, rowMerge, applyDataWithSelected, grouping, filtering, buttons, options, onClick, onButtonClick, onChanged) {
        // 그리드 컬럼 클래스
        this.name = name;
        this.label = label;
		this.title = title;
        this.dataType = dataType;
        this.dataFormat = dataFormat;
        this.dataDefault = dataDefault;
        this.width = width;
        this.minWidth = minWidth;
        this.maxWidth = maxWidth;
        this.align = align;
        this.color = color;
        this.bgcolor = bgcolor;
        this.useSort = useSort;
        this.useResize = useResize;
        this.useEdit = (useEditDefault ? false : useEdit);
        this.useEditDefault = useEditDefault;
        this.useInsert = useInsert;
        this.useCheckbox = useCheckbox;
        this.isRequired = isRequired;
        this.isShow = isShow;
        this.useMove = useMove;
        this.rowMerge = rowMerge;
        this.grouping = grouping; 
		this.filtering = filtering; 
        this.buttons = buttons;
        this.hasButtons = (this.buttons && this.buttons.length > 0);
        this.options = options;
        this.hasOptions = (this.options && this.options.length > 0);
        this.hasFileUpload = false;
        if (this.dataType === GridColumn.TYPE_FORM_FILE) {
            this.hasFileUpload = true;
            this.dataType = GridColumn.TYPE_NONE;
        }
        this.applyDataWithSelected = applyDataWithSelected;
        this.onClick = onClick;
        this.onButtonClick = onButtonClick;
        this.onChanged = onChanged; 
    };
    GridColumn.prototype = {
        format: function (value) {
            // 해당 데이터를 화면에 표시할 형식으로 변경
            if (typeof(value) === 'undefined' || value == null) {
                return '';
            }

            if (this.dataType == GridColumn.TYPE_NUMBER || this.dataType == GridColumn.TYPE_DECIMAL || this.dataType == GridColumn.TYPE_PERCENTAGE || this.dataType == GridColumn.TYPE_CURRENCY) {
                var n = value;
                if (n == null) {
                    $.debug.log(['GridColumn.format', this.name, value, 'value 값을 숫자 형식으로 변환 할수 없습니다.']);
                    return '';
                }
                if (typeof (n) !== 'number') {
                    if (n.trim().length == '') {
                        $.debug.log(['GridColumn.format', this.name, value, 'value 값을 숫자 형식으로 변환 할수 없습니다.']);
                        return '';
                    }
                    n = Globalize.parseFloat(n.trim());
                }
                if (isNaN(n)) {
                    $.debug.log(['GridColumn.format', this.name, value, 'value 값을 숫자 형식으로 변환 할수 없습니다.']);
                    return '';
                }
                return Globalize.format(n, this.dataFormat) + (this.dataType == GridColumn.TYPE_PERCENTAGE ? '%':'') ;
            } else if (this.dataType == GridColumn.TYPE_DATE || this.dataType == GridColumn.TYPE_DATETIME) {
            		var d= Globalize.parseDate(value, 'yyyy-MM-dd HH:mm:ss.z');
 					if(d==null){
 						$.debug.log(['GridColumn.format', this.name, value, 'value 값을 날짜 형식으로 변환 할수 없습니다.']);
 						return ''; 
					}	
 					return Globalize.format(d, (this.dataFormat )); 
           
            } else {
                if (typeof (value) === 'string') {
                    return value.trim();
                }

                return value.toString().trim();
            }
        },
        unformat: function (formatted) {
            // 화면에 표시한 데이터를 일반 데이터 형식으로 변경
			formatted = formatted.trim().replace(/_/g,'');  
            if (formatted.length == 0) {
                return '';
            }
            if (this.dataType == GridColumn.TYPE_NUMBER || this.dataType == GridColumn.TYPE_DECIMAL || this.dataType == GridColumn.TYPE_PERCENTAGE || this.dataType == GridColumn.TYPE_CURRENCY) {
                var n = Globalize.parseFloat(formatted, 10);
                if (n == null || isNaN(n)) {
                    $.debug.log(['GridColumn.unformat', this.name, formatted, 'formatted 값을 숫자 형식으로 변환 할수 없습니다.']);
                    return 'NaN';
                }
                return n;
            } else if (this.dataType == GridColumn.TYPE_DATE) {
				if(formatted.indexOf("_") >-1) 
					return  null;
                var d = Globalize.parseDate(formatted, (this.dataFormat || 'A'));
                if (d == null) {
                    $.debug.log(['GridColumn.unformat', this.name, formatted, 'formatted 값을 날짜 형식으로 변환 할수 없습니다.']);
                    return 'DaN';
                }
				return Globalize.format(d, this.dataFormat);
                //return Globalize.format(d, 'yyyy-MM-dd HH:mm:ss');
            } else if (this.dataType == GridColumn.TYPE_DATETIME) {
				if(formatted.indexOf("_") >-1) 
					return  null;
                var d = Globalize.parseDate(formatted, (this.dataFormat || 'B'));
                if (d == null) {
                    $.debug.log(['GridColumn.unformat', this.name, formatted, 'formatted 값을 날짜 형식으로 변환 할수 없습니다.']);
                    return 'DaN';
                }
				return Globalize.format(d, this.dataFormat);
               // return Globalize.format(d, 'yyyy-MM-dd HH:mm:ss');
            } else {
                return formatted;
            }
        },
        valid: function (formatted) {
            // 화면에 표시한 데이터의 형식및 필수 입력에 대한 유효성 검사
            formatted = formatted.trim();  
            if (formatted.length == 0) {
                return (!this.isRequired);
            }
            if (this.dataType == GridColumn.TYPE_NUMBER || this.dataType == GridColumn.TYPE_DECIMAL || this.dataType == GridColumn.TYPE_PERCENTAGE || this.dataType == GridColumn.TYPE_CURRENCY) {
                var n = Globalize.parseFloat(formatted, 10);
                if (n == null || isNaN(n)) {
                    $.debug.log(['GridColumn.valid', this.name, formatted, 'formatted 값을 숫자 형식으로 변환 할수 없습니다.']);
                    return false;
                }
                return true;
            } else if (this.dataType == GridColumn.TYPE_DATE) {
                var d = Globalize.parseDate(formatted, (this.dataFormat || 'A'));
                if (d == null) {
                    $.debug.log(['GridColumn.valid', this.name, formatted, 'formatted 값을 날짜 형식으로 변환 할수 없습니다.']);
                    return false;
                }
                return true;
            } else if (this.dataType == GridColumn.TYPE_DATETIME) {
                var d = Globalize.parseDate(formatted, (this.dataFormat || 'B'));
                if (d == null) {
                    $.debug.log(['GridColumn.valid', this.name, formatted, 'formatted 값을 날짜 형식으로 변환 할수 없습니다.']);
                    return false;
                }
                return true;
            } else {
                return true;
            }
        },
        isChange: function (original, value) {
            // 입력된 값을 원본값과 비교하여 변경 여부 확인
            original = Object.nullToEmpty(original);
            if (typeof (value) === 'number') {
                if (typeof (original) !== 'number' && original.length > 0) {
                    original = Globalize.parseFloat(original);
                }
            }
            return (original !== value);
        },
        defaultData: function () {
            // 이 컬럼의 기본 데이터 가져오기
            if (this.dataDefault == GridColumn.DEFAULT_TODAY) {
                return Globalize.format(new Date(), (this.dataFormat || 'A'));
            }
            if (this.dataDefault == GridColumn.DEFAULT_NOW) {
                return Globalize.format(new Date(), (this.dataFormat || 'B'));
            }
            return this.dataDefault;
        }
    };
    GridColumn.TYPE_NONE = 'none';
    GridColumn.TYPE_DATE = 'date';
    GridColumn.TYPE_DATETIME = 'datetime';
    GridColumn.TYPE_NUMBER = 'number';
    GridColumn.TYPE_DECIMAL = 'decimal';
    GridColumn.TYPE_PERCENTAGE = 'percentage';
    GridColumn.TYPE_CURRENCY = 'currency';
    GridColumn.TYPE_FORM_FILE = 'file';
    GridColumn.DEFAULT_TODAY = 'today';
    GridColumn.DEFAULT_NOW = 'now';
    GridColumn.WIDTH_CHECK = 24;
    GridColumn.WIDTH_GROUP_HIDE = 30;
    GridColumn.SUFFIX_FIXED = '_FIXED';
    GridColumn.SUFFIX_NORMAL = '_NORMAL';
    GridColumn.genIdTH = function (gridId, columnIndex) {
        /// 그리드의 해더 TH 요소에 사용할 id값
        return gridId + '_HEAD_' + columnIndex;
    };
    GridColumn.genIdTHCOL = function (gridId, columnIndex) {
        // 그리드의 해더 COL 요소에 사용할 id값
        return gridId + '_HEAD_COL_' + columnIndex;
    };
    GridColumn.genIdTHSELECT = function (gridId, columnIndex) {
        // 그리드의 해더 SELECT 요소에 사용할 id
        return gridId + '_HEAD_SELECT_' + columnIndex;
    };
    GridColumn.genIdTR = function (gridId, rowIndex) {
        // 그리드의 내용 TH 요소에 사용할 id값
        return gridId + '_BODY_ROW_' + rowIndex;
    };
    GridColumn.genIdTD = function (gridId, rowIndex, columnIndex) {
        // 그리드의 내용 TD 요소에 사용할 id값
        return gridId + '_BODY_' + rowIndex + '_' + columnIndex;
    };
    GridColumn.genIdTDCOL = function (gridId, columnIndex) {
        // 그리드의 내용 TD 요소에 사용할 id값
        return gridId + '_BODY_COL_' + columnIndex;
    };
    GridColumn.genIdTDINPUT = function (gridId, rowIndex, columnIndex) {
        // 그리드의 내용 수정 시 INPUT 요소에 사용할 id값
        return gridId + '_BODY_' + rowIndex + '_' + columnIndex + '_INPUT';
    };
    GridColumn.genIdTDSELECT = function (gridId, rowIndex, columnIndex) {
        // 그리드의 내용 수정 시 SELECT 요소에 사용할 id값
        return gridId + '_BODY_' + rowIndex + '_' + columnIndex + '_SELECT';
    };
    GridColumn.genIdTDCHECKBOX = function (gridId, rowIndex, columnIndex) {
        // 그리드의 선택 CHECKBOX 요소에 사용할 id값
        return gridId + '_BODY_' + rowIndex + '_' + columnIndex + '_CHECKBOX';
    };
    GridColumn.genIdTDSPAN = function (gridId, rowIndex, columnIndex) {
        // 그리드의 선택 SPAN 요소에 사용할 id값
    	return gridId + '_BODY_' + rowIndex + '_' + columnIndex + '_SPAN';
    };

    var GridColumnGrouping = function (name, label, columnCount, isShow, useMove, runtimeVisiblity) {
        // 그리드 그룹 컬럼 정보를 나타내는 클래스
        this.name = name;
        this.label = label;
        this.columnCount = columnCount;
        this.isShow = isShow;
        this.useMove = useMove;
        this.runtimeVisiblity = runtimeVisiblity;
    };
    GridColumnGrouping.prototype = {};

    var GridColumnFilter = function (name, label, isInput) {
        // 그리드 필터 정보를 나타내는 클래스
        this.name = name;
        this.label = label; 
        this.isInput = isInput; 
    };
    GridColumnFilter.prototype = {};
    var GridColumnSummary = function (name, type) {
        // 그리드 필터 정보를 나타내는 클래스
        this.name = name;
        this.type = type;  
    };
    GridColumnSummary.prototype = {};
    var Grid = function (element, elementPaging, elementPagingSummary, columns, filterColumns, summaryColumns, columnFixed, fitSize, width, height, thHeight, tdHeight, resizing, useSelection, useSelectionAll, onSort, onPaging, onClick, onRowSelected, onAllSelected, onRenderComplete) {
        // 그리드 클래스
        this.element = $(element);
        this.elementId = this.element.attr('id');
        this.elementHead = this.element.find('.grid-header');
        this.elementHeadFixed = this.element.find('.grid-header-fix');
        this.elementHeadNormal = this.element.find('.grid-header-org');
        this.elementBodyFixed = this.element.find('.grid-body-fix');
        this.elementBodyNormal = this.element.find('.grid-body-org');
        this.elementBodyWrapper = this.element.find('.grid-body');
        this.elementPaging = $(elementPaging);
        this.elementPagingSummary = $(elementPagingSummary);
        this.columns = columns;
		this.filterColumns = filterColumns;
		this.summaryColumns = summaryColumns;
        this.columnFixed = columnFixed;

        this.fitSize = fitSize;
        this.width = width;
        this.height = height;
        this.thHeight = thHeight;
        this.tdHeight = tdHeight; 
		this.resizing = resizing; 
        this.usePaging = this.elementPaging.length > 0;
        this.useSelection = useSelection;
        this.useSelectionAll = useSelectionAll;
        this.useFixed = this.columnFixed > 0;
        var i, column;
        this.useGrouping = false;
        this.useInnerMasked = false;
        this.useInnerOption = false;
        this.useInnerButton = false; 
        
        for (i = 0; i < this.columns.length; i++) {
            column = this.columns[i];
            if (column.grouping) {
                this.useGrouping = true;
            } 
            if (column.dataType == GridColumn.TYPE_DATE || column.dataType == GridColumn.TYPE_DATETIME || column.dataType == GridColumn.TYPE_NUMBER ) {  
                if (column.useEditDefault) {
                    this.useInnerMasked = true;
                }
            }
            if (column.options.length > 0) {
                if (column.useEditDefault) {
                    this.useInnerOption = true;
                }
            }
            if (column.buttons.length > 0) {
                this.useInnerButton = true;
            }
        }

        this.selectedRows = [];
        this.dataContext = {
            page: 0,
            pageSize: 100,
            pageTotal: 1,
            recordTotal: 100,
            records: [],
            sort: '',
            sortOrder: 'asc'
        };
        
        this.onSort = onSort;
        this.onPaging = onPaging;
        this.onClick = onClick;
        this.onRowSelected = onRowSelected;
        this.onAllSelected = onAllSelected;
        this.onRenderComplete = onRenderComplete;  
    };
    Grid.prototype = {
        initialize: function () {
            // 그리드 초기화
            for (var columnIndex = 0; columnIndex < this.columns.length; columnIndex++) {
                var column = this.columns[columnIndex];
                column.widthFit = !(typeof (column.width) == 'number');
            }
            // 기본 화면 그리기
            this.columnsFit();
            this.renderHead();
            this.size(this.width, this.height);
            // 스크롤 이벤트 처리
            var self = this;
            self.elementBodyWrapper.scroll(function () {
                self.elementBodyFixed.scrollTop($(this).scrollTop());
                self.elementHeadNormal.scrollLeft($(this).scrollLeft());
            }); 
            // Grid ID 생성 
            mGrid.newGrid(this.elementId);
            // Grid DataSet 생성
            setGridDataSet(this.elementId);
        },
        dispose: function () {
            this.elementPaging.empty();
            this.elementPagingSummary.empty();
            this.columns.length = 0;
            this.selectedRows.length = 0;
            this.dataContext.records.length = 0;

            delete this.element;
            delete this.elementId;
            delete this.elementHead;
            delete this.elementHeadFixed;
            delete this.elementHeadNormal;
            delete this.elementBodyFixed;
            delete this.elementBodyNormal;
            delete this.elementBodyWrapper;
            delete this.elementPaging;
            delete this.elementPagingSummary;
            delete this.columns;
			delete this.filterColumns;
			delete this.summaryColumns;
            delete this.columnFixed;
            delete this.fitSize;;
            delete this.width;
            delete this.height;
            delete this.thHeight;
            delete this.tdHeight;
            delete this.usePaging;
            delete this.useSelection;
            delete this.useSelectionAll;
            delete this.useFixed;
            delete this.useGrouping;
            delete this.useInnerMasked;
            delete this.useInnerOption;
            delete this.useInnerButton;
            delete this.selectedRows;
            delete this.dataContext;
            delete this.onSort;
            delete this.onPaging;
            delete this.onClick;
            delete this.onRowSelected;
            delete this.onAllSelected;
            delete this.onRenderComplete;
            delete this.resizing;
        },
            
        genHTMLHead: function (columnInd, columnLen, useSelection, suffix) {
            // 그리드 해더 그리기
            var builder = [], column, columnIndex, grouping, filtering, groupingRendered, sortCssClass,columnLabel, tWidth = 0;
            var height1, height2, height3;
            if (this.thHeight instanceof Array) {
                height1 = this.thHeight[0];
                height2 = this.thHeight[1];
                height3 = height1 + height2 + 1;
            } else {
                height1 = this.thHeight;
                height2 = this.thHeight;
                height3 = height1 + height2 + 1;
            }
            // TABLE
            builder.push('<table id=\''+suffix+'TableHeaderGroup\' class="grid-table">');
            // COLGROUP
            groupingRendered = {};
            builder.push('<colgroup id=\''+suffix+'ColHeaderGroup\' style=\'display:block\'>');
            // COL - CHECKBOX
            if (useSelection) {
                builder.push('<col width="' + GridColumn.WIDTH_CHECK + '" />');
                tWidth += GridColumn.WIDTH_CHECK;
            }
            // COL - columns 
            for (columnIndex = columnInd; columnIndex < columnLen; columnIndex++) {
                column = this.columns[columnIndex];
                if (column.grouping) {
                    grouping = column.grouping;
                    if (grouping.isShow) {
                        builder.push('<col id="' + GridColumn.genIdTHCOL(this.elementId, columnIndex) + '" width="' + column.width + '" />');
                        tWidth += column.width;
                    } else if (grouping.runtimeVisiblity && !groupingRendered[grouping.name]) {
                        builder.push('<col width="' + GridColumn.WIDTH_GROUP_HIDE + '" />');
                        tWidth += GridColumn.WIDTH_GROUP_HIDE;
                        groupingRendered[grouping.name] = true;
                    }
                } else {
                    if (column.isShow) {
                        builder.push('<col id="' + GridColumn.genIdTHCOL(this.elementId, columnIndex) + '" width="' + column.width + '" />');
                        tWidth += column.width;
                    }
                }
            }
            builder.push('</colgroup>');
            // WEBKIT 브라우져에서 COLGROUP 안먹는 문제 때문에 테이블 태그에 사이즈 포함하여 다시 설정
            builder[0] = '<table  id=\''+suffix+'TableHeaderGroup\' class="grid-table" style="width: ' + tWidth + 'px;">';
            // TR
            groupingRendered = {};
            builder.push('<tr>');
            // TH - CHECKBOX
            if (useSelection) {
                builder.push('<th' + (this.useGrouping ? ' rowspan="2" style="text-align: center; height: ' + height3 + 'px;"' : ' style="text-align: center; height: ' + height1 + 'px;"') + '>' + (this.useSelectionAll ? '<input type="checkbox" onclick="$(\'' + '#' + this.elementId + '\').grid(\'selectAllInternal\', this, event)" />' : '') + '</th>');
            }
            // TH - columns
            for (columnIndex = columnInd; columnIndex < columnLen; columnIndex++) {
                column = this.columns[columnIndex];
                if (column.grouping) {
                    grouping = column.grouping;
                    if (!groupingRendered[grouping.name]) {
                        if (grouping.isShow) {
                            builder.push('<th colspan="' + grouping.columnCount + '" style="height: ' + height1 + 'px;">');
                            if (grouping.runtimeVisiblity) {
                                builder.push('<button class="ux-btn-delete" onclick="$(\'' + '#' + this.elementId + '\').grid(\'showGroupingInternal\', this, event, \'' + grouping.name + '\', false)"></button>');
                            } else {
                                builder.push('<div class="ux-grid-rel"><span><em>' + grouping.label + '</em></span></div>');
                            }
							builder.push('</th>');
                        } else if (grouping.runtimeVisiblity) {
                            builder.push('<th style="height: ' + height1 + 'px;"><button class="ux-btn-add" onclick="$(\'' + '#' + this.elementId + '\').grid(\'showGroupingInternal\', this, event, \'' + grouping.name + '\', true)"></button></th>');
                        } 
                        groupingRendered[grouping.name] = true;
                    }
                } else {
                    if (column.isShow) {
                        if (column.useSort) {
                            if (column.name == this.dataContext.sort) {
                                sortCssClass = ' ux-use-sort ux-icon-' + this.dataContext.sortOrder;
                            } else {
                                sortCssClass = ' ux-use-sort';
                            }
                        } else {
                            sortCssClass = '';
                        }
						
						if (column.filtering) {  // filtering 
							 filtering = column.filtering;
							if(filtering.isInput) {  
								columnLabel = '<input type="text" id="filter_'+this.elementId+'_'+column.name+'" onchange="$(\'' + '#' + this.elementId + '\').grid(\'filterInternal\', '+this.elementId+', \'' + column.name + '\');"/>';
							} else {
								columnLabel = '<select id="filter_'+this.elementId+'_'+column.name+'" multiple="multiple" onchange="$(\'' + '#' + this.elementId + '\').grid(\'filterInternal\', '+this.elementId+', \'' + column.name + '\');"></select>'; 
							}
						}else {
							columnLabel =column.label; 
						}
                        if (column.dataType == GridColumn.TYPE_DATE) {
                            builder.push('<th' + (column.useResize ? ' class="grid-resize' + sortCssClass + '" columnindex="' + columnIndex + '"' : '') + ' id="' + GridColumn.genIdTH(this.elementId, columnIndex) + '"' + (this.useGrouping ? ' rowspan="2"' : '') + ' style="height: ' + (this.useGrouping ? height3 : height1) + 'px;" title="' + Globalize.culture(Globalize.cultureSelector).calendar.patterns.A + '"><div class="ux-grid-rel"><span><em>' + columnLabel + '</em></span></div></th>');
                        } else if (column.dataType == GridColumn.TYPE_DATETIME) {
                            builder.push('<th' + (column.useResize ? ' class="grid-resize' + sortCssClass + '" columnindex="' + columnIndex + '"' : '') + ' id="' + GridColumn.genIdTH(this.elementId, columnIndex) + '"' + (this.useGrouping ? ' rowspan="2"' : '') + ' style="height: ' + (this.useGrouping ? height3 : height1) + 'px;" title="' + Globalize.culture(Globalize.cultureSelector).calendar.patterns.B + '"><div class="ux-grid-rel"><span><em>' + columnLabel + '</em></span></div></th>');
                        } else {
                            builder.push('<th' + (column.useResize ? ' class="grid-resize' + sortCssClass + '" columnindex="' + columnIndex + '"' : '') + ' id="' + GridColumn.genIdTH(this.elementId, columnIndex) + '"' + (this.useGrouping ? ' rowspan="2"' : '') + ' style="height: ' + (this.useGrouping ? height3 : height1) + 'px;"><div class="ux-grid-rel"><span><em>' + columnLabel + '</em></span></div></th>');
                        }
                    }
                }
            }
            builder.push('</tr>');
            // TH - grouped columns
            if (this.useGrouping) {
                groupingRendered = {};
                builder.push('<tr>');
                for (columnIndex = columnInd; columnIndex < columnLen; columnIndex++) {
                    column = this.columns[columnIndex];
                    if (column.grouping) {
                        grouping = column.grouping;
                        if (grouping.isShow) {
                            if (column.useSort) {
                                if (column.name == this.dataContext.sort) {
                                    sortCssClass = ' ux-use-sort ux-icon-' + this.dataContext.sortOrder;
                                } else {
                                    sortCssClass = ' ux-use-sort';
                                }
                            } else {
                                sortCssClass = '';
                            } 
						 
							if (column.filtering) {  // filtering 
								filtering = column.filtering;
								if(filtering.isInput) {  
									columnLabel = '<input type="text" id="filter_'+this.elementId+'_'+column.name+'" onchange="$(\'' + '#' + this.elementId + '\').grid(\'filterInternal\', '+this.elementId+', \'' + column.name + '\');"/>';
								} else {
									columnLabel = '<select id="filter_'+this.elementId+'_'+column.name+'" multiple="multiple" onchange="$(\'' + '#' + this.elementId + '\').grid(\'filterInternal\', '+this.elementId+', \'' + column.name + '\');"></select>'; 
								}

							}else {
								columnLabel =column.label; 
							}
                            if (column.dataType == GridColumn.TYPE_DATE) {
                                builder.push('<th' + (column.useResize ? ' class="grid-resize' + sortCssClass + '" columnindex="' + columnIndex + '"' : '') + ' id="' + GridColumn.genIdTH(this.elementId, columnIndex) + '" style="height: ' + height2 + 'px;" title="' + Globalize.culture(Globalize.cultureSelector).calendar.patterns.A + '"><div class="ux-grid-rel"><span><em>' + columnLabel + '</em></span></div></th>');
                            } else if (column.dataType == GridColumn.TYPE_DATETIME) {
                                builder.push('<th' + (column.useResize ? ' class="grid-resize' + sortCssClass + '" columnindex="' + columnIndex + '"' : '') + ' id="' + GridColumn.genIdTH(this.elementId, columnIndex) + '" style="height: ' + height2 + 'px;" title="' + Globalize.culture(Globalize.cultureSelector).calendar.patterns.B + '"><div class="ux-grid-rel"><span><em>' + columnLabel + '</em></span></div></th>');
                            } else {
                                builder.push('<th' + (column.useResize ? ' class="grid-resize' + sortCssClass + '" columnindex="' + columnIndex + '"' : '') + ' id="' + GridColumn.genIdTH(this.elementId, columnIndex) + '" style="height: ' + height2 + 'px;"><div class="ux-grid-rel"><span><em>' + columnLabel + '</em></span></div></th>');
                            }
                        } else if (grouping.runtimeVisiblity && !groupingRendered[grouping.name]) {
                            builder.push('<th style="height: ' + height2 + 'px;"></th>');
                            groupingRendered[grouping.name] = true;
                        }
                    }
                }
                builder.push('</tr>');
            } 
            builder.push('</table>'); 
            return builder.join('');
        },
        genHTMLBodyTable: function (columnInd, columnLen, useSelection, suffix, bodyString) {
            // 그리드 내용 표시할 테이블 그리기
            var builder = [], column, columnIndex, grouping, groupingRendered, tWidth = 0;
            // TABLE
            builder.push('<table id=\''+suffix+'_TableBodyGroup\'  class="grid-table" >');
            // COLGROUP
            groupingRendered = {};
            builder.push('<colgroup id=\''+suffix+'ColBodyGroup\' style=\'display:block\'>');
            // COL - CHECKBOX
            if (useSelection) {
                builder.push('<col width="' + GridColumn.WIDTH_CHECK + '" />');
                tWidth += GridColumn.WIDTH_CHECK;
            }
            // COL - columns
            for (columnIndex = columnInd; columnIndex < columnLen; columnIndex++) {
                column = this.columns[columnIndex];
                if (column.grouping) {
                    grouping = column.grouping;
                    if (grouping.isShow) {
                        builder.push('<col id="' + GridColumn.genIdTDCOL(this.elementId, columnIndex) + '" width="' + column.width + '" />');
                        tWidth += column.width;
                    } else if (grouping.runtimeVisiblity && !groupingRendered[grouping.name]) {
                        builder.push('<col width="' + GridColumn.WIDTH_GROUP_HIDE + '" />');
                        tWidth += GridColumn.WIDTH_GROUP_HIDE;
                        groupingRendered[grouping.name] = true;
                    }
                } else {
                    if (column.isShow) {
                        builder.push('<col id="' + GridColumn.genIdTDCOL(this.elementId, columnIndex) + '" width="' + column.width + '" />');
                        tWidth += column.width;
                    }
                }
            }
            builder.push('</colgroup>');
            // WEBKIT 브라우져에서 COLGROUP 안먹는 문제 때문에 테이블 태그에 사이즈 포함하여 다시 설정
            builder[0] = '<table  id=\''+suffix+'TableBodyGroup\' class="grid-table" style="width: ' + tWidth + 'px;">';
            // THEAD
            builder.push('<thead style="display: none;">');
            // TR
            groupingRendered = {};
            builder.push('<tr>');
            // TH - CHECKBOX
            if (useSelection) {
                builder.push('<th' + (this.useGrouping ? ' rowspan="2"' : '') + '></th>');
            }
            // TH - columns
            for (columnIndex = columnInd; columnIndex < columnLen; columnIndex++) {
                column = this.columns[columnIndex];
                if (column.grouping) {
                    grouping = column.grouping;
                    if (!groupingRendered[grouping.name]) {
                        if (grouping.isShow) {
                            builder.push('<th colspan="' + grouping.columnCount + '"></th>');
                        } else if (grouping.runtimeVisiblity) {
                            builder.push('<th></th>');
                        }
                        groupingRendered[grouping.name] = true;
                    }
                } else {
                    if (column.isShow) {
                        builder.push('<th' + (this.useGrouping ? ' rowspan="2"' : '') + '></th>');
                    }
                }
            }
            builder.push('</tr>');
            if (this.useGrouping) {
                // TR - grouped
                groupingRendered = {};
                builder.push('<tr>');
                // TH - grouped columns
                for (columnIndex = columnInd; columnIndex < columnLen; columnIndex++) {
                    column = this.columns[columnIndex];
                    if (column.grouping) {
                        grouping = column.grouping;
                        if (grouping.isShow) {
                            builder.push('<th></th>');
                        } else if (grouping.runtimeVisiblity && !groupingRendered[grouping.name]) {
                            builder.push('<th></th>');
                            groupingRendered[grouping.name] = true;
                        }
                    }
                }
                builder.push('</tr>');
            }
            builder.push('</thead>');
            // TBODY
            builder.push(bodyString);
            builder.push('</table>');
            return builder.join('');
        },
        genHTMLBody: function (columnInd, columnLen, useSelection, suffix ,summary) {
            // 그리드 본문 내용 그리기
            var builder = [], columnPosition, column, eventClick, columnDisplay, rowIndex,loadIndex, columnIndex, grouping, groupingRendered, record, eventString,styleString, button, i;
            // TBODY
            builder.push('<tbody>');
            var recordForMerge = {}; 
			var startRow = this.dataContext.pageSize * (this.dataContext.page) ;
			var endRow = (startRow+ this.dataContext.pageSize > this.dataContext.recordTotal) ?  this.dataContext.recordTotal: startRow+ this.dataContext.pageSize ;
			for (loadIndex = startRow; loadIndex < endRow; loadIndex++) { 
                record = this.dataContext.records[loadIndex];
                if (record._flag === 'D' || record._flag === 'GARBAGE') {
                    continue;
                }  
				rowIndex =  (record.rowIndex == undefined ? loadIndex:record.rowIndex);  
                // TR - record
                groupingRendered = {};
                builder.push('<tr id="' + GridColumn.genIdTR(this.elementId, rowIndex) + suffix + '"' + (rowIndex % 2 != 0 ? ' class="ux-even"' : '') + ' style="height:' + this.tdHeight + 'px;">');
                // TD - CHECKBOX
                if (useSelection) {
                    builder.push('<td style="text-align: center;"><input type="checkbox" id="' + GridColumn.genIdTDCHECKBOX(this.elementId, rowIndex,0 ) + '" onclick="$(\'' + '#' + this.elementId + '\').grid(\'selectInternal\', this, event, ' + rowIndex + ')" /></td>');
                }
                
                // TD - columns
                for (columnIndex = columnInd; columnIndex < columnLen; columnIndex++) {
                	column = this.columns[columnIndex];
                	 // Row Click Event
                	eventClick = ' onclick="$(\'' + '#' + this.elementId + '\').grid(\'rowClickInternal\', this, event, ' + rowIndex + ', ' + columnIndex + ')"'; 
                	columnPosition = ' position = ['+rowIndex+ ','+columnIndex+']';

                    if (typeof (record[column.name]) !== 'undefined' && column.rowMerge && column.format(record[column.name]) === column.format(recordForMerge[column.name])) {
                        if (column.grouping) {
                            if (column.grouping.isShow) {
                                builder.push('<td></td>');
                            } else if (column.grouping.runtimeVisiblity && !groupingRendered[column.grouping.name]) {
                            	builder.push('<td></td>');
                                groupingRendered[column.grouping.name] = true;
                            }
                        } else {
                            if (column.isShow) {
                                builder.push('<td></td>');
                            }
                        }
                    } else {
                        columnDisplay = column.format(record[column.name]);
                        if (column.hasOptions) {
                            for (i = 0; i < column.options.length; i++) {
                                if (column.options[i].code == record[column.name]) {
                                    columnDisplay = column.options[i].name;
                                }
                            }
                        }
                        if (typeof (column.onClick) === 'function') {
                            columnDisplay = '<a href="#" onclick="$(\'' + '#' + this.elementId + '\').grid(\'cellClickInternal\', this, event, ' + rowIndex + ', ' + columnIndex + ')">' + columnDisplay + '</a>';
                        }
                        
                        styleString = 'text-align:' + column.align+';border:0 0 0 0';
                        if(column.color) 
                        	styleString += ';color:'+column.color;
                        if(column.bgcolor)
                        	styleString += ';background-color:'+column.bgcolor;  

                        if (column.grouping) {
                            if (column.grouping.isShow) {
                                if (column.hasButtons) {
                                    builder.push('<td id="' + GridColumn.genIdTD(this.elementId, rowIndex, columnIndex) + '" '+eventClick+' >');
                                    for (i = 0; i < column.buttons.length; i++) {
                                        button = column.buttons[i];
                                        builder.push('<a onclick="$(\'' + '#' + this.elementId + '\').grid(\'cellButtonClickInternal\', this, event, ' + rowIndex + ', ' + columnIndex + ', \'' + button.name + '\')" class="' + button.cssClass + '"><span>' + button.label + '</span></a>');
                                    }
                                    builder.push('</td>');
                                } else if (column.useEditDefault) {
                                    if (column.hasOptions) {
                                        if (column.applyDataWithSelected || typeof (column.onChanged) === 'function') {
                                            eventString = ' onchange="$(\'' + '#' + this.elementId + '\').grid(\'cellChangedInternal\', this, event, ' + rowIndex + ', ' + columnIndex + ')"';
                                        } else {
                                            eventString = '';
                                        }
                                        builder.push('<td id="' + GridColumn.genIdTD(this.elementId, rowIndex, columnIndex) + '" '+eventClick+' >');
                                        builder.push('<select id="' + GridColumn.genIdTDSELECT(this.elementId, rowIndex, columnIndex) + '" style="width:' + (column.width - 6) + 'px;'+styleString+';display:none;"' + eventString + '>');
                                        for (i = 0; i < column.options.length; i++) {
                                            builder.push('<option value="' + column.options[i].code + '" label="' + column.options[i].name + '" ' + (column.options[i].code == record[column.name] ? 'selected="selected"' : '') + '></option>');
                                        }
                                        builder.push('</select>');
                                        builder.push('</td>');
                                    } else if (column.hasFileUpload) {
                                        if (typeof (column.onChanged) === 'function') {
                                            eventString = ' onchange="$(\'' + '#' + this.elementId + '\').grid(\'cellChangedInternal\', this, event, ' + rowIndex + ', ' + columnIndex + ')"';
                                        } else {
                                            eventString = '';
                                        }
                                        builder.push('<td id="' + GridColumn.genIdTD(this.elementId, rowIndex, columnIndex) + '" '+eventClick+'><input type="file" id="' + GridColumn.genIdTDINPUT(this.elementId, rowIndex, columnIndex) + '" name="' + column.name + '" style="width:' + (column.width - 6) + 'px;'+styleString+'"' + eventString + ' /></td>');
                                    } else {
                                        if (column.applyDataWithSelected || typeof (column.onChanged) === 'function') {
                                           // eventString = ' onblur="$(\'' + '#' + this.elementId + '\').grid(\'cellBlurInternal\', this, event, ' + rowIndex + ', ' + columnIndex + ')" onkeyup="$(\'' + '#' + this.elementId + '\').grid(\'cellChangedInternal\', this, event, ' + rowIndex + ', ' + columnIndex + ')"';
                                            eventString = ' onblur="$(\'' + '#' + this.elementId + '\').grid(\'cellBlurInternal\', this, event, ' + rowIndex + ', ' + columnIndex + ')" onChange="$(\'' + '#' + this.elementId + '\').grid(\'cellChangedInternal\', this, event, ' + rowIndex + ', ' + columnIndex + ')"';
					                    } else {
                                            eventString = ' onfocus="this.style.border=\'1px solid #c30653\';" onblur="this.style.border=\'\';$(\'' + '#' + this.elementId + '\').grid(\'cellBlurInternal\', this, event, ' + rowIndex + ', ' + columnIndex + ')" ';
                                        } 
                                        builder.push('<td id="' + GridColumn.genIdTD(this.elementId, rowIndex, columnIndex) + '" '+eventClick+' ><input type="text" data-type="' + column.dataType + '" id="' + GridColumn.genIdTDINPUT(this.elementId, rowIndex, columnIndex) + '" value="' + column.format(record[column.name]) + '" style="width:' + (column.width - 6) + 'px;'+styleString+'"' + eventString + ' onkeydown = "$(\'' + '#' + this.elementId + '\').grid(\'cellChangingInternal\', this, event, ' + rowIndex + ', ' + columnIndex + ')" '+columnPosition+' /></td>');
                                    }
                                } else if (column.useCheckbox) {
                                	eventString = ' onclick="$(\'' + '#' + this.elementId + '\').grid(\'cellChangedInternal\', this, event, ' + rowIndex + ', ' + columnIndex + ')"';
                                    if(column.format(record[column.name]) =='Y'	)
                                    	eventString +=' checked=\'checked\' value =\'Y\'';
                                    else
                                    	eventString +=' value=\'N\'';
                                    builder.push('<td id="' + GridColumn.genIdTD(this.elementId, rowIndex, columnIndex) + '" '+eventClick+' ><input type="checkbox" id="' + GridColumn.genIdTDCHECKBOX(this.elementId, rowIndex, columnIndex) + '" name="' + column.name + '" style="width:' + (column.width - 6) + 'px;'+styleString+'"' + eventString  +'  /></td>');    
                                } else {
                                    builder.push('<td id="' + GridColumn.genIdTD(this.elementId, rowIndex, columnIndex) + '" '+eventClick+' ><span id="' + GridColumn.genIdTDSPAN(this.elementId, rowIndex, columnIndex) + '" style="' + styleString+';">' + columnDisplay + '</span></td>');
                                }
                            } else if (column.grouping.runtimeVisiblity && !groupingRendered[column.grouping.name]) {
                                builder.push('<td></td>');
                                groupingRendered[column.grouping.name] = true;
                            }
                        } else { 
							if (column.isShow) { 
                                if (column.hasButtons) {
                                    builder.push('<td id="' + GridColumn.genIdTD(this.elementId, rowIndex, columnIndex) + '">');
                                    for (var i = 0; i < column.buttons.length; i++) {
                                        button = column.buttons[i];
                                        builder.push('<a onclick="$(\'' + '#' + this.elementId + '\').grid(\'cellButtonClickInternal\', this, event, ' + rowIndex + ', ' + columnIndex + ', \'' + button.name + '\')" class="' + button.cssClass + '"><span>' + button.label + '</span></a>');
                                    }
                                    builder.push('</td>');
                                } else if (column.useEditDefault) {
                                    if (column.hasOptions) {
                                        if (column.applyDataWithSelected || typeof (column.onChanged) === 'function') {
                                            eventString = ' onchange="$(\'' + '#' + this.elementId + '\').grid(\'cellChangedInternal\', this, event, ' + rowIndex + ', ' + columnIndex + ')"';
                                        } else {
                                            eventString = '';
                                        }
                                        builder.push('<td id="' + GridColumn.genIdTD(this.elementId, rowIndex, columnIndex) + '" '+eventClick+' >');
                                        builder.push('<select id="' + GridColumn.genIdTDSELECT(this.elementId, rowIndex, columnIndex) + '" style="width:' + (column.width - 6) + 'px;'+styleString+';display:none;"' + eventString + '>');
                                        for (i = 0; i < column.options.length; i++) {
                                            builder.push('<option value="' + column.options[i].code + '" label="' + column.options[i].name + '" ' + (column.options[i].code == record[column.name] ? 'selected="selected"' : '') + '></option>');
                                        }
                                        builder.push('</select>');
                                        builder.push('</td>');
                                    } else if (column.hasFileUpload) {
                                        if (typeof (column.onChanged) === 'function') {
                                            eventString = ' onchange="$(\'' + '#' + this.elementId + '\').grid(\'cellChangedInternal\', this, event, ' + rowIndex + ', ' + columnIndex + ')"';
                                        } else {
                                            eventString = '';
                                        }
                                        builder.push('<td id="' + GridColumn.genIdTD(this.elementId, rowIndex, columnIndex) + '" '+eventClick+' ><input type="file" id="' + GridColumn.genIdTDINPUT(this.elementId, rowIndex, columnIndex) + '" name="' + column.name + '" style="width:' + (column.width - 6) + 'px;'+styleString+'"' + eventString + ' /></td>');
                                    } else {
                                        if (column.applyDataWithSelected || typeof (column.onChanged) === 'function') {
                                        	eventString = ' onblur="$(\'' + '#' + this.elementId + '\').grid(\'cellBlurInternal\', this, event, ' + rowIndex + ', ' + columnIndex + ')" onChange="$(\'' + '#' + this.elementId + '\').grid(\'cellChangedInternal\', this, event, ' + rowIndex + ', ' + columnIndex + ')"';
                                           // eventString = ' onblur="$(\'' + '#' + this.elementId + '\').grid(\'cellBlurInternal\', this, event, ' + rowIndex + ', ' + columnIndex + ')" onkeyup="$(\'' + '#' + this.elementId + '\').grid(\'cellChangedInternal\', this, event, ' + rowIndex + ', ' + columnIndex + ')"';
                                        } else {
                                            eventString = ' onfocus="this.style.border=\'1px solid #c30653\';" onblur="this.style.border=\'\';$(\'' + '#' + this.elementId + '\').grid(\'cellBlurInternal\', this, event, ' + rowIndex + ', ' + columnIndex + ')" ';
                                        }
                                        builder.push('<td id="' + GridColumn.genIdTD(this.elementId, rowIndex, columnIndex) + '" '+eventClick+' ><input type="text" data-type="' + column.dataType + '" id="' + GridColumn.genIdTDINPUT(this.elementId, rowIndex, columnIndex) + '" value="' + column.format(record[column.name]) + '" style="width:' + (column.width - 6) + 'px;'+styleString+'"' + eventString + ' onkeydown = "$(\'' + '#' + this.elementId + '\').grid(\'cellChangingInternal\', this, event, ' + rowIndex + ', ' + columnIndex + ')" '+columnPosition+' /></td>');
                                    }
                                } else if (column.useCheckbox) {
                                	eventString = ' onclick="$(\'' + '#' + this.elementId + '\').grid(\'cellChangedInternal\', this, event, ' + rowIndex + ', ' + columnIndex + ')"';
                                	if(column.format(record[column.name]) =='Y'	)
                                    	eventString +=' checked=\'checked\' value =\'Y\'';
                                    else
                                    	eventString +=' value=\'N\'';
                                    builder.push('<td id="' + GridColumn.genIdTD(this.elementId, rowIndex, columnIndex) + '" '+eventClick+' ><input type="checkbox" id="' + GridColumn.genIdTDCHECKBOX(this.elementId, rowIndex, columnIndex) + '" name="' + column.name + '" style="width:' + (column.width - 6) + 'px;'+styleString+'"' + eventString  +' /></td>');    
                                } else { 
                                    builder.push('<td id="' + GridColumn.genIdTD(this.elementId, rowIndex, columnIndex) + '" '+eventClick+' ><span id="' + GridColumn.genIdTDSPAN(this.elementId, rowIndex, columnIndex) + '" style="' +styleString+';">' + columnDisplay + '</span></td>');
                                }
                            }
                        }
                    }
                }
                builder.push('</tr>');
                recordForMerge = record;
            }
			if(this.summaryColumns) {
				// Start Summary line 
				builder.push('<tr id="' + GridColumn.genIdTR(this.elementId, rowIndex) + suffix + ' style="height:25px;" class="ux-summary" >');
				// TD - CHECKBOX
				if (useSelection) {
					builder.push('<td style="text-align: center;">&nbsp</td>');
				} 
				// TD - columns
				groupingRendered = {};
				for (columnIndex = columnInd; columnIndex < columnLen; columnIndex++) {
					column = this.columns[columnIndex];    
					if(summary[column.name] !=undefined){ 
						columnDisplay = summary[column.name];
						var summaryType;
						for(var colIndex=0;colIndex<this.summaryColumns.length;colIndex++ ){ 
            				if( this.summaryColumns[colIndex].name == column.name) {
								summaryType = this.summaryColumns[colIndex].type;
								break;
							}
						}     
						if(summaryType && summaryType ==='avg')
							columnDisplay = column.format(summary[column.name] / this.dataContext.records.length);
						else
							columnDisplay = column.format(summary[column.name]);
					}else{
						columnDisplay = '';
					}
					if (column.grouping) {
					    if (column.grouping.isShow) {
							builder.push('<td id="' + GridColumn.genIdTD(this.elementId, rowIndex, columnIndex)+'><span id="' + GridColumn.genIdTDSPAN(this.elementId, rowIndex, columnIndex) + '" style="text-align:' + column.align +';">' + columnDisplay + '</span></td>');
						}else if (column.grouping.runtimeVisiblity && !groupingRendered[column.grouping.name]) {
                            builder.push('<td></td>');   
							groupingRendered[column.grouping.name] = true;
						}
					}else{
						if (column.isShow) { 
							if (column.hasButtons || column.hasFileUpload || column.useCheckbox ) {
								builder.push('<td id="' + GridColumn.genIdTD(this.elementId, rowIndex, columnIndex)+'></td>'); 
							} else { 
								builder.push('<td id="' + GridColumn.genIdTD(this.elementId, rowIndex, columnIndex)+'><span id="' + GridColumn.genIdTDSPAN(this.elementId, rowIndex, columnIndex) + '" style="text-align:' + column.align +';">' + columnDisplay + '</span></td>');
							}  
						}
					}
				}
				builder.push('</tr>');			 
				// End Summary Line...
			}            
            builder.push('</tbody>');
            return this.genHTMLBodyTable(columnInd, columnLen, useSelection, suffix, builder.join(''));
        },
        renderHead: function () {
            // 해더 그리기
            // 리사이즈/정렬 해제
            $('.grid-resize', this.elementHead).girdColumnSplitter('destroy');
            $('.ux-use-sort', this.elementHead).girdColumnSortter('destroy');

            if (this.useFixed) {
                var htmlFixed = this.genHTMLHead(0, this.columnFixed, this.useSelection, GridColumn.SUFFIX_FIXED);
                var htmlNormal = this.genHTMLHead(this.columnFixed, this.columns.length, false, GridColumn.SUFFIX_NORMAL);
                this.elementHeadFixed[0].innerHTML = htmlFixed;
                this.elementHeadNormal[0].innerHTML = htmlNormal;
                this.elementBodyFixed[0].innerHTML = '';
                this.elementBodyNormal[0].innerHTML = '';
            } else {
                var html = this.genHTMLHead(0, this.columns.length, this.useSelection, GridColumn.SUFFIX_NORMAL);
                this.elementHeadFixed[0].innerHTML = '';
                this.elementHeadNormal[0].innerHTML = html;
                this.elementBodyFixed[0].innerHTML = '';
                this.elementBodyNormal[0].innerHTML = '';
            }
            // 리사이즈/정렬 설정
           	/*	
            $('.grid-resize', this.elementHead).girdColumnSplitter({
                grid: this,
                delay: false,
                distance: 0
            });
			*/
            $('.ux-use-sort', this.elementHead).girdColumnSortter({
                grid: this
            });

			// Grid Filter 만들기
			var column, filter, columnIndex =0; 
			for (columnIndex = 0; columnIndex < this.columns.length; columnIndex++) {
                column = this.columns[columnIndex];
				if(column.filtering) { 
					filter = column.filtering;
					if(!filter.isInput)
						$('#filter_'+this.elementId+'_'+column.name).selectWithCheckbox({ title: filter.label ,width: column.width-20,codeProperty: 'code',nameProperty: 'name'}); 
				}
			}	
        },
 
        renderBody: function () {
			
			//Start Sumamry Line
			var summary = {}; 
            var summaryColumns = this.summaryColumns;
        	if(summaryColumns){
	            for(var colIndex=0;colIndex<summaryColumns.length;colIndex++ ){ 
	            	  summary[summaryColumns[colIndex].name] = 0; 
	            } 
	            var tempValue =0;
	            for (var rowIndex = 0; rowIndex < this.dataContext.records.length; rowIndex++) {
	                record = this.dataContext.records[rowIndex]; 
	                for(var colIndex=0;colIndex<summaryColumns.length;colIndex++ ){ 
	                  tempValue = summary[summaryColumns[colIndex].name];
	                  tempValue += record[summaryColumns[colIndex].name]; 
	              	  summary[summaryColumns[colIndex].name] = tempValue ; 
	                }
	            }  
        	}    
			//END Sumamry Line
        
            // 본문 그리기
            if (this.useFixed) {
                if (this.useInnerMasked) {
                    // 마스크 해제
                    $('input[data-type="' + GridColumn.TYPE_DATE + '"]', this.elementBodyFixed).each(function (index, element) {
                        $(element).unmask();
                    });
                    $('input[data-type="' + GridColumn.TYPE_DATETIME + '"]', this.elementBodyFixed).each(function (index, element) {
                        $(element).unmask();
                    });
                    $('input[data-type="' + GridColumn.TYPE_DATE + '"]', this.elementBodyNormal).each(function (index, element) {
                        $(element).unmask();
                    });
                    $('input[data-type="' + GridColumn.TYPE_DATETIME + '"]', this.elementBodyNormal).each(function (index, element) {
                        $(element).unmask();
                    });
                }
                if (this.useInnerOption) {
                    // SELECT 플러그인 제거
                    $('select', this.elementBodyFixed).each(function (index, element) {
                        $(element).selectbox('destroy');
                    });
                    $('select', this.elementBodyNormal).each(function (index, element) {
                        $(element).selectbox('destroy');
                    });
                } 
				var columns = this.columns;
                if (this.dataContext && this.dataContext.records && this.dataContext.records.length > 0) {
                    var htmlFixed = this.genHTMLBody(0, this.columnFixed, this.useSelection, GridColumn.SUFFIX_FIXED, summary);
                    var htmlNormal = this.genHTMLBody(this.columnFixed, this.columns.length, false, GridColumn.SUFFIX_NORMAL, summary);
                    this.elementBodyFixed[0].innerHTML = htmlFixed;
                    this.elementBodyNormal[0].innerHTML = htmlNormal; 
                    if (this.useInnerMasked) { 
                        // 마스크 적용 
                        $('input[data-type="' + GridColumn.TYPE_DATE + '"]', this.elementBodyFixed).each(function (index, element) {  
							//$(element).mask(Globalize.culture(Globalize.cultureSelector).calendar.patterns.a); 
							var dataFormat = columns[eval(element.attributes.position.value)[1]].dataFormat; 
							if(dataFormat) $(element).mask(maskDateCheck(dataFormat));
                        });
                        $('input[data-type="' + GridColumn.TYPE_DATETIME + '"]', this.elementBodyFixed).each(function (index, element) {
                            //$(element).mask(Globalize.culture(Globalize.cultureSelector).calendar.patterns.b);
							var dataFormat = columns[eval(element.attributes.position.value)[1]].dataFormat;
							if(dataFormat) $(element).mask(maskDateCheck(dataFormat)); 
                        });
                        $('input[data-type="' + GridColumn.TYPE_NUMBER + '"]', this.elementBodyFixed).each(function (index, element) { 
                            //$(element).mask(Globalize.culture(Globalize.cultureSelector).calendar.patterns.b);
							var dataFormat = columns[eval(element.attributes.position.value)[1]].dataFormat;
							if(dataFormat) $(element).mask(maskDateCheck(dataFormat));
                        });
                        $('input[data-type="' + GridColumn.TYPE_DATE + '"]', this.elementBodyNormal).each(function (index, element) {
                            //$(element).mask(Globalize.culture(Globalize.cultureSelector).calendar.patterns.a);
							var dataFormat = columns[eval(element.attributes.position.value)[1]].dataFormat;
							if(dataFormat) $(element).mask(maskDateCheck(dataFormat)); 
                        });
                        $('input[data-type="' + GridColumn.TYPE_DATETIME + '"]', this.elementBodyNormal).each(function (index, element) {
                            //$(element).mask(Globalize.culture(Globalize.cultureSelector).calendar.patterns.b);
							var dataFormat = self.columns[eval(element.attributes.position.value)[1]].dataFormat;
							if(dataFormat) $(element).mask(maskDateCheck(dataFormat));
                        }); 
 
                    }
                    if (this.useInnerOption) {
                        // SELECT 플러그인 적용
                        $('select', this.elementBodyFixed).each(function (index, element) {
                            $(element).selectbox({ widthByElement: true }).selectbox('update');
                        });
                        $('select', this.elementBodyNormal).each(function (index, element) {
                            $(element).selectbox({ widthByElement: true }).selectbox('update');
                        });
                    }
                } else {
                    this.elementBodyFixed[0].innerHTML = '';
                    this.elementBodyNormal[0].innerHTML = '';
                }
            } else {
                if (this.useInnerMasked) {
                    // 마스크 해제
                    $('input[data-type="' + GridColumn.TYPE_DATE + '"]', this.elementBodyNormal).each(function (index, element) {
                        $(element).unmask();
                    });
                    $('input[data-type="' + GridColumn.TYPE_DATETIME + '"]', this.elementBodyNormal).each(function (index, element) {
                        $(element).unmask();
                    });
                }
                if (this.useInnerOption) {
                    // SELECT 플러그인 제거
                    $('select', this.elementBodyNormal).each(function (index, element) {
                        $(element).selectbox('destroy');
                    });
                }
                if (this.dataContext && this.dataContext.records && this.dataContext.records.length > 0) {
                    var html = this.genHTMLBody(0, this.columns.length, this.useSelection, GridColumn.SUFFIX_NORMAL, summary);
                    this.elementBodyFixed[0].innerHTML = '';
                    this.elementBodyNormal[0].innerHTML = html;
                    if (this.useInnerMasked) {
                        // 마스크 적용
                        $('input[data-type="' + GridColumn.TYPE_DATE + '"]', this.elementBodyFixed).each(function (index, element) { 
                            //$(element).mask(Globalize.culture(Globalize.cultureSelector).calendar.patterns.a);
							$(element).mask(maskDateCheck(this.value)); 
                        });
                        $('input[data-type="' + GridColumn.TYPE_DATETIME + '"]', this.elementBodyFixed).each(function (index, element) { 
                            //$(element).mask(Globalize.culture(Globalize.cultureSelector).calendar.patterns.b);
							$(element).mask(maskDateCheck(this.value)); 
                        });
                    }
                    if (this.useInnerOption) {
                        // SELECT 플러그인 적용
                        $('select', this.elementBodyNormal).each(function (index, element) {
                            $(element).selectbox({ widthByElement: true }).selectbox('update');
                        });
                    }
                } else {
                    this.elementBodyFixed[0].innerHTML = '';
                    this.elementBodyNormal[0].innerHTML = '';
                }
            }
            // 선택 인덱스 모두 제거
            this.selectedRows.length = 0;
        },
        renderPaging: function () { 
            if (this.usePaging) {
                this.elementPaging.html('');
                if (this.dataContext.recordTotal > 0) {
                    var builder = [];
                    var enableF = this.dataContext.page > 0;
                    var enableP = this.dataContext.page > 0;
                    var enableN = parseInt((this.dataContext.recordTotal + this.dataContext.pageSize - 1) / this.dataContext.pageSize) - 1 > this.dataContext.page;
                    var enableL = parseInt((this.dataContext.recordTotal + this.dataContext.pageSize - 1) / this.dataContext.pageSize) - 1 > this.dataContext.page;
                    builder.push('<a href="#" class="ux-page-first"' + (enableF ? ' onclick="$(\'' + '#' + this.elementId + '\').grid(\'pagingInternal\', this, event, 0)"' : '') + '></a>');
                    builder.push('<a href="#" class="ux-page-prev"' + (enableP ? ' onclick="$(\'' + '#' + this.elementId + '\').grid(\'pagingInternal\', this, event, ' + (this.dataContext.page - 1) + ')"' : '') + '></a>');
                    var pageCount = this.dataContext.pageTotal;
                    var pageCurrent = this.dataContext.page + 1;
                    var pageButtonCount = 5;
                    if (pageCount < pageButtonCount) {
                        pageButtonCount = pageCount;
                    }
                    var num = 1;
                    if (pageCurrent > pageButtonCount) {
                        var num2 = parseInt(this.dataContext.page / pageButtonCount);
                        num = (num2 * pageButtonCount) + 1;
                        pageButtonCount = (num + pageButtonCount) - 1;
                        if (pageButtonCount > pageCount) {
                            pageButtonCount = pageCount;
                        }
                    }
                    for (var i = num; i <= pageButtonCount; i++) {
                        if (i == pageCurrent) {
                            builder.push('<a href="#" class="ux-page-num ux-selected">' + i + '</a>');
                        }
                        else {
                            builder.push('<a href="#" class="ux-page-num" onclick="$(\'' + '#' + this.elementId + '\').grid(\'pagingInternal\', this, event, ' + (i - 1) + ')">' + i + '</a>');
                        }
                    }
                    builder.push('<a href="#" class="ux-page-next"' + (enableN ? ' onclick="$(\'' + '#' + this.elementId + '\').grid(\'pagingInternal\', this, event, ' + (this.dataContext.page + 1) + ')"' : '') + '></a>');
                    builder.push('<a href="#" class="ux-page-last"' + (enableL ? ' onclick="$(\'' + '#' + this.elementId + '\').grid(\'pagingInternal\', this, event, ' + (this.dataContext.pageTotal - 1) + ')"' : '') + '></a>');
                    this.elementPaging[0].innerHTML = builder.join('');
                } 
                if (this.elementPagingSummary) {
                    if (this.dataContext.recordTotal > 0) {
                    	var pageSummaryText = ( this.dataContext.page + 1);
                    		pageSummaryText += " / " +  this.dataContext.pageTotal +" page , total ";
                    		pageSummaryText += this.dataContext.recordTotal +" Records ";
                    		pageSummaryText += "("+ (this.dataContext.page * this.dataContext.pageSize + 1);
                    		pageSummaryText += " ~ " +  Math.min(this.dataContext.recordTotal,(this.dataContext.page + 1) * this.dataContext.pageSize);
                    		pageSummaryText += " ) ";
                    		this.elementPagingSummary.text(pageSummaryText);	
                        //this.elementPagingSummary.text(String.format(Globalize.localize('paging_summary'), this.dataContext.page + 1, this.dataContext.pageTotal, this.dataContext.page * this.dataContext.pageSize + 1, Math.min(this.dataContext.recordTotal, (this.dataContext.page + 1) * this.dataContext.pageSize), this.dataContext.recordTotal));
                    } else {
                        this.elementPagingSummary.text('');
                    }
                }
            }
        },
        columnsFit: function () {
            // 테이블 크기에 맞게 컬럼 크기조정
            var columnIndex, columnFit = 0, columnWidthFit = 0, tWidth = 2, tWidthAll = 2;
            for (columnIndex = 0; columnIndex < this.columns.length; columnIndex++) {
                var column = this.columns[columnIndex];
                if (column.widthFit) {
                    columnFit++;
                    tWidthAll += column.width;
                    tWidthAll++;
                } else {
                    tWidth += column.width;
                    tWidth++;
                    tWidthAll += column.width;
                    tWidthAll++;
                }
            }
            if (this.useSelection) {
                tWidth += GridColumn.WIDTH_CHECK;
                tWidth++;
                tWidthAll += GridColumn.WIDTH_CHECK;
                tWidthAll++;
            }
            if (this.width < tWidthAll + 17) {
                return;
            }

            if ((this.width - tWidth - 17) < (100 * columnFit)) {
                columnWidthFit = 100;
            } else {
                columnWidthFit = parseInt((this.width - tWidth - 17) / columnFit);
            }
            for (columnIndex = 0; columnIndex < this.columns.length; columnIndex++) {
                var column = this.columns[columnIndex];
                if (column.widthFit) {
                    column.width = columnWidthFit;
                    column.minWidth = columnWidthFit - 50;
                    column.maxWidth = columnWidthFit + 100;
                    $('#' + GridColumn.genIdTHCOL(this.elementId, columnIndex)).attr('width', column.width);
                    $('#' + GridColumn.genIdTDCOL(this.elementId, columnIndex)).attr('width', column.width);
                }
            }
        },
		applyFilter: function (grid) { 
			var records       = grid.records; 
			var filterColumns = this.filterColumns; 
			var iix=0,ijx=0,ikx=0;   
			var column ;
			if(filterColumns && records ) { 
				for(iix=0;iix<filterColumns.length;iix++){  
					var filterRec = [];	
					for(ikx=0;ikx<this.columns.length;ikx++){
						if(this.columns[ikx].name == filterColumns[iix].name){
							column = this.columns[ikx];
							break;
						}
					}
					if(!filterColumns[iix].isInput){ // select box 인경우
						for(ijx=0;ijx<records.length;ijx++) { 
							var isExist= false;
							for(ikx=0;ikx<filterRec.length;ikx++){ 
								if (column.format(records[ijx][filterColumns[iix].name])== column.format(filterRec[ikx].code)){
									isExist= true;
									break;
								} 
							}
							if(!isExist) {    
								filterRec.push({'code': column.format(records[ijx][filterColumns[iix].name]) , 'name': column.format(records[ijx][filterColumns[iix].name])  } );
							}	
						} 
						$('#filter_'+this.elementId+'_'+filterColumns[iix].name).selectWithCheckbox('applyData', filterRec); 
					}
				} 
			}
		},
		
        applyData: function (o) {
            // 데이터 설정
            this.dataContext.page = o.page;
            this.dataContext.pageSize = o.pageSize; 
            this.dataContext.pageTotal = Math.ceil(o.pageTotal);
            this.dataContext.recordTotal = o.recordTotal;
            this.dataContext.records = o.records;
            this.dataContext.sort = o.sort;
            this.dataContext.sortOrder = o.sortOrder;
           
            var scrollLeft = this.elementBodyWrapper.scrollLeft();
            var scrollTop = 0;
            // 해더 그리기
         //   this.renderHead();
            // 데이터 그리기 
            this.renderBody();
            // 페이징 그리기
            this.renderPaging();
            // 크기 설정
            this.size(this.width, this.height);
            // 이벤트 발생
            if (typeof (this.onRenderComplete) === 'function') {
                this.onRenderComplete(this);
            }
            
            this.elementBodyWrapper.scrollLeft(scrollLeft);
            this.elementBodyWrapper.scrollTop(scrollTop);
            this.elementBodyWrapper.scroll();
        },
        applyChanges: function () {
            // 변경된 데이터 반영 
        	var record, rowIndex, columnIndex;
        	for (rowIndex = 0; rowIndex < this.dataContext.records.length; rowIndex++) {
                record = this.dataContext.records[rowIndex];
                for (columnIndex = 0; columnIndex < this.columns.length; columnIndex++) {
                    column = this.columns[columnIndex];
                    if (column.useEdit || column.useEditDefault || column.useInsert) {
                        if (column.hasOptions) {
                            input = $('#' + GridColumn.genIdTDSELECT(this.elementId, rowIndex, columnIndex));
                        } else {
                            input = $('#' + GridColumn.genIdTDINPUT(this.elementId, rowIndex, columnIndex));
                        }
                        if (input.length > 0) {
                            record[column.name] = column.unformat(input.val());
                        }
                    }
                }
            }
        },
        size: function (width, height) {
            // 그리드 크기 변경
            if (typeof (width) === 'number' && !isNaN(width)) {
                this.width = width;
            }
            if (typeof (height) === 'number' && !isNaN(height)) {
                this.height = height;
            }

            // ROOT 크기 설정
            this.element.width(this.width);
            this.element.height(this.height);
            this.columnsFit();

            var w, h;
            var tableHeadFixed = $('table', this.elementHeadFixed);
            var tableHeadNormal = $('table', this.elementHeadNormal);
            var tableBodyFixed = $('table', this.elementBodyFixed);
            var tableBodyNormal = $('table', this.elementBodyNormal);
            // 테이블 크기 설정
            w = 0;
            h = Math.max(tableHeadFixed.height(), tableHeadNormal.height());
            $('col', tableHeadFixed).each(function (index, element) {
                w += parseInt(element.width);
            });
            tableHeadFixed.width(w).height(h);

            w = 0;
            $('col', tableHeadNormal).each(function (index, element) {
                w += parseInt(element.width);
            });
            if (this.fitSize && w + tableHeadFixed.width() < this.width) {
                w = this.width - tableHeadFixed.width() - 17;
            }
            tableHeadNormal.width(w).height(h);

            w = 0;
            h = this.height - h;
            if (this.dataContext && this.dataContext.records && (this.dataContext.records instanceof Array) && this.dataContext.records.length > 0) {
                h = Math.min(h, (this.tdHeight * (this.dataContext.records.length)));
            }
            $('col', tableBodyFixed).each(function (index, element) {
                w += parseInt(element.width);
            });
            tableBodyFixed.width(w);//.height(h);

            w = 0;
            $('col', tableBodyNormal).each(function (index, element) {
                w += parseInt(element.width);
            });
            if (this.fitSize && w + tableBodyFixed.width() < this.width) {
                w = this.width - tableBodyFixed.width() - 17;
            }
            tableBodyNormal.width(w);//.height(h);

            // DIV 설정
            w = tableHeadFixed.width() || 0;
            h = Math.max(tableHeadFixed.height(), tableHeadNormal.height()) || 0;
            this.elementHeadFixed.width(w);
            this.elementHeadNormal.width(this.width - w -17).css('paddingLeft', w);  // this.width-w-17
            this.elementBodyFixed.width(w).height(this.height - h - 17);//.css('top', h);
            this.elementBodyNormal.css('paddingLeft', w);
            this.elementBodyWrapper.width(this.width).height(this.height - h);

            // 데이터가 없을 때 빈 DIV 표시
            if (this.dataContext.records.length == 0) {
                this.elementBodyNormal[0].innerHTML = '<div style="width:' + tableHeadNormal.width() + 'px; height: 10px;"></div>';
            }
        },
        clear: function () {
            // 데이터 초기화
            this.dataContext.page = 0;
            this.dataContext.pageSize = 0;
            this.dataContext.pageTotal = 0;
            this.dataContext.recordTotal = 0;
            this.dataContext.records.length = 0;
            this.dataContext.sort = '';
            this.dataContext.sortOrder = ''; 
            this.dataContext.records = [];
            // 해더 새로 그리기(데이터 표시 제거)
            //  this.renderHead();

            this.elementPaging.empty();
            this.elementPagingSummary.empty();
            this.elementBodyFixed.empty();
            this.elementBodyNormal.empty(); 
            mDataSet[this.elementId].clearData();
            mGrid[this.elementId].records = [];
            
            // 세로 스크롤 이동
            this.elementBodyFixed.scrollTop(0);
            this.elementBodyWrapper.scrollTop(0);
        },
        selectInternal: function (element, event, rowIndex) {
            if ($(element).is(':checked')) {
                this.select(rowIndex, true);
            } else {
                this.unselect(rowIndex, true);
            }
            //new jQuery.Event(event).preventDefault();
        },
        
        filterSearch: function (gridData,useFilter) { 
			try{   
				if(useFilter){
					filterSearch(this,gridData.page);
				}else{
					filterReset(this);
					$('#'+this.elementId).grid('applyData',gridData);
				}	
			}catch(e){
			}
        },
        filterInternal: function (element, colName) { 
			try{
				filterSearch(this,0);
			}catch(e){
			}
        },

        selectAllInternal: function (element, event) {
            var regex = /BODY_(\d*)_0_CHECKBOX/;
            var id;
            var matches;
            var self = this;
            var root = (this.useFixed ? this.elementBodyFixed : this.elementBodyNormal); 
            var checked = $(element).is(':checked');
            if (checked) {
                root.find('input[type="checkbox"]').each(function (index, checkbox) {
                    id = $(checkbox).attr('id');
                    if (regex.test(id)) {
                        matches = regex.exec(id);
                        self.select(parseInt(matches[1], 10), false);
                    }
                });
            } else {
                root.find('input[type="checkbox"]').each(function (index, checkbox) {
                    id = $(checkbox).attr('id');
                    if (regex.test(id)) {
                        matches = regex.exec(id);
                        self.unselect(parseInt(matches[1], 10), false);
                    }
                });
            }
            if (typeof (this.onAllSelected) === 'function') {
                this.onAllSelected(this, checked);
            }
            //new jQuery.Event(event).preventDefault();
        },
        select: function (rowIndex, triggerEvent) {
            // 선택 여부 확인 
            for (var i = 0; i < this.selectedRows.length; i++) {
                if (this.selectedRows[i] == rowIndex) {
                    return;
                }
            }
			/*
            if (this.dataContext.records[rowIndex]._flag === 'D' || this.dataContext.records[rowIndex]._flag === 'GARBAGE') {
                return;
            }
			*/
			if (mDataSet[this.elementId].isRowSelectMark(rowIndex) ) {
                return;
            }
            var column, columnIndex, eventString, input, builder = [];
            // 선택한 로우 추가
            this.selectedRows.push(rowIndex);
            this.selectedRows.sort(function (a, b) {
                if (a < b) {
                    return -1;
                }
                if (a > b) {
                    return 1;
                }
                return 0;
            });

            // 데이터 수정 상태로 표시
            if (rowIndex % 2 != 0) {
                $('#' + GridColumn.genIdTR(this.elementId, rowIndex) + GridColumn.SUFFIX_FIXED).removeClass('ux-even').addClass('ux-selected');
                $('#' + GridColumn.genIdTR(this.elementId, rowIndex) + GridColumn.SUFFIX_NORMAL).removeClass('ux-even').addClass('ux-selected');
            } else {
                $('#' + GridColumn.genIdTR(this.elementId, rowIndex) + GridColumn.SUFFIX_FIXED).addClass('ux-selected');
                $('#' + GridColumn.genIdTR(this.elementId, rowIndex) + GridColumn.SUFFIX_NORMAL).addClass('ux-selected');
            }
            for (columnIndex = 0; columnIndex < this.columns.length; columnIndex++) {
                column = this.columns[columnIndex];
                if ((column.grouping && column.grouping.isShow) || column.isShow) {
                    if (column.useEdit || (column.useInsert && this.dataContext.records[rowIndex]._flag === 'I')) {
                        if (column.hasOptions) {
                            if (column.applyDataWithSelected || typeof (column.onChanged) === 'function') {
                                eventString = ' onchange="$(\'' + '#' + this.elementId + '\').grid(\'cellChangedInternal\', this, event, ' + rowIndex + ', ' + columnIndex + ')"';
                            } else {
                                eventString = '';
                            }
                            builder.length = 0;
                            builder.push('<select id="' + GridColumn.genIdTDSELECT(this.elementId, rowIndex, columnIndex) + '" style="width:' + (column.width - 6) + 'px; display:none;"' + eventString + '>');
                            for (i = 0; i < column.options.length; i++) {
                                builder.push('<option value="' + column.options[i].code + '" label="' + column.options[i].name + '" ' + (column.options[i].code == this.dataContext.records[rowIndex][column.name] ? 'selected="selected"' : '') + '></option>');
                            }
                            builder.push('</select>');
                            input = $('#' + GridColumn.genIdTD(this.elementId, rowIndex, columnIndex));
                            input.empty().html(builder.join(''));
                            // SELECT 플러그인 적용
                            $('#' + GridColumn.genIdTDSELECT(this.elementId, rowIndex, columnIndex)).selectbox({ widthByElement: true }).selectbox('update');
                        } else if (column.hasFileUpload) {
                            if (typeof (column.onChanged) === 'function') {
                                eventString = ' onchange="$(\'' + '#' + this.elementId + '\').grid(\'cellChangedInternal\', this, event, ' + rowIndex + ', ' + columnIndex + ')"';
                            } else {
                                eventString = '';
                            }
                            input = $('#' + GridColumn.genIdTD(this.elementId, rowIndex, columnIndex));
                            input.empty().html('<input type="file" id="' + GridColumn.genIdTDINPUT(this.elementId, rowIndex, columnIndex) + '" name="' + column.name + '" style="width:' + (column.width - 6) + 'px;"' + eventString + ' />');
                        } else {
                            if (column.applyDataWithSelected || typeof (column.onChanged) === 'function') {
                                eventString = ' onblur="$(\'' + '#' + this.elementId + '\').grid(\'cellBlurInternal\', this, event, ' + rowIndex + ', ' + columnIndex + ')" onkeyup="$(\'' + '#' + this.elementId + '\').grid(\'cellChangedInternal\', this, event, ' + rowIndex + ', ' + columnIndex + ')"';
                            } else {
                                eventString = ' onblur="$(\'' + '#' + this.elementId + '\').grid(\'cellBlurInternal\', this, event, ' + rowIndex + ', ' + columnIndex + ')"';
                            }
                            input = $('#' + GridColumn.genIdTD(this.elementId, rowIndex, columnIndex));
                            input.empty().html('<input type="text" data-type="' + column.dataType + '" id="' + GridColumn.genIdTDINPUT(this.elementId, rowIndex, columnIndex) + '" value="' + column.format(this.dataContext.records[rowIndex][column.name]) + '" style="width:' + (column.width - 6) + 'px;"' + eventString + ' onkeydown = "$(\'' + '#' + this.elementId + '\').grid(\'cellChangingInternal\', this, event, ' + rowIndex + ', ' + columnIndex + ')" />');
                            // 마스크 적용
                            if (column.dataType == GridColumn.TYPE_DATE) {
                                $('#' + GridColumn.genIdTDINPUT(this.elementId, rowIndex, columnIndex)).mask(Globalize.culture(Globalize.cultureSelector).calendar.patterns.a);
                            } else if (column.dataType == GridColumn.TYPE_DATETIME) {
                                $('#' + GridColumn.genIdTDINPUT(this.elementId, rowIndex, columnIndex)).mask(Globalize.culture(Globalize.cultureSelector).calendar.patterns.b);
                            }
                        }
                    }
                }
            }
            // 체크박스 체크
            $('#' + GridColumn.genIdTDCHECKBOX(this.elementId, rowIndex,0)).attr('checked', 'checked');
            // 이벤트 발생 
            if (typeof (this.onRowSelected) === 'function' && triggerEvent) {
                this.onRowSelected(this, rowIndex, this.dataContext.records[rowIndex], true);
            }
        },
        unselect: function (rowIndex, triggerEvent) {
            // 선택 여부 확인 
            var selected = false, i;
            for (i = 0; i < this.selectedRows.length; i++) {
                if (this.selectedRows[i] == rowIndex) {
                    selected = true;
                }
            }
            if (!selected) {
                return;
            }
			/*
            if (this.dataContext.records[rowIndex]._flag === 'D' || this.dataContext.records[rowIndex]._flag === 'GARBAGE') {
                return;
            }
			*/
			if (mDataSet[this.elementId].isRowSelectMark(rowIndex) ) {
                return;
            }

            var column, columnDisplay, columnIndex, eventString, input;
            // 데이터 수정 취소, 뷰 상태로 표시
            if (rowIndex % 2 != 0) {
                $('#' + GridColumn.genIdTR(this.elementId, rowIndex) + GridColumn.SUFFIX_FIXED).removeClass('ux-selected').addClass('ux-even');
                $('#' + GridColumn.genIdTR(this.elementId, rowIndex) + GridColumn.SUFFIX_NORMAL).removeClass('ux-selected').addClass('ux-even');
            } else {
                $('#' + GridColumn.genIdTR(this.elementId, rowIndex) + GridColumn.SUFFIX_FIXED).removeClass('ux-selected');
                $('#' + GridColumn.genIdTR(this.elementId, rowIndex) + GridColumn.SUFFIX_NORMAL).removeClass('ux-selected');
            }
            for (columnIndex = 0; columnIndex < this.columns.length; columnIndex++) {
                column = this.columns[columnIndex];
                if ((column.grouping && column.grouping.isShow) || column.isShow) {
                    if (column.useEdit || (column.useInsert && this.dataContext.records[rowIndex]._flag === 'I')) {
                        input = $('#' + GridColumn.genIdTD(this.elementId, rowIndex, columnIndex));
                        // SELECT 플러그인 제거
                        $('#' + GridColumn.genIdTDSELECT(this.elementId, rowIndex, columnIndex)).selectbox({ widthByElement: true }).selectbox('destroy');
                        // 마스크 해제
                        if (column.dataType == GridColumn.TYPE_DATE) {
                            $('#' + GridColumn.genIdTDINPUT(this.elementId, rowIndex, columnIndex)).unmask();
                        } else if (column.dataType == GridColumn.TYPE_DATETIME) {
                            $('#' + GridColumn.genIdTDINPUT(this.elementId, rowIndex, columnIndex)).unmask();
                        }
                        columnDisplay = column.format(this.dataContext.records[rowIndex][column.name]);
                        if (column.hasOptions) {
                            for (i = 0; i < column.options.length; i++) {
                                if (column.options[i].code == this.dataContext.records[rowIndex][column.name]) {
                                    columnDisplay = column.options[i].name;
                                }
                            }
                        }
                        if (typeof (column.onClick) === 'function') {
                            columnDisplay = '<a href="#" onclick="$(\'' + '#' + this.elementId + '\').grid(\'cellClickInternal\', this, event, ' + rowIndex + ', ' + columnIndex + ')">' + columnDisplay + '</a>';
                        }
                        input.empty().html('<span style="text-align:' + column.align + ';">' + columnDisplay + '</span>');
                    }
                }
            }

            // 체크박스 체크 해제
            $('#' + GridColumn.genIdTDCHECKBOX(this.elementId, rowIndex,0)).removeAttr('checked');

            // 선택한 로우 제거
            var indexOf = -1;
            for (var i = 0; i < this.selectedRows.length; i++) {
                if (this.selectedRows[i] == rowIndex) {
                    indexOf = i;
                    break;
                }
            }
            this.selectedRows.splice(indexOf, 1);
            // 이벤트 발생
            if (typeof (this.onRowSelected) === 'function' && triggerEvent) {
                this.onRowSelected(this, rowIndex, mDataSet[this.elementId].getAt(rowIndex), false);
            }
        },
        showGroupingInternal: function (element, event, groupName, isShow) {
			for (var columnIndex = 0; columnIndex < this.columns.length; columnIndex++) {
                if (this.columns[columnIndex].grouping && this.columns[columnIndex].grouping.name == groupName) {
                    this.columns[columnIndex].grouping.isShow = isShow;
                    this.renderHead();
                    this.renderBody();
                    this.size(this.width, this.height);
                    // 이벤트 발생
                    if (typeof (this.onRenderComplete) === 'function') {
                        this.onRenderComplete(this);
                    }
                    break;
                }
            }
            new jQuery.Event(event).preventDefault();
        },
        cellClickInternal: function (element, event, rowIndex, columnIndex) {
        	var self = this;
            var column = this.columns[columnIndex];
            var func = column.onClick;
            var colValue = mDataSet[self.elementId].getNameValue(rowIndex,column.name);
 
            if (typeof (func) === 'function') { 
                func(this, rowIndex, columnIndex, mDataSet[self.elementId].getAt(rowIndex),colValue);
            }
     //       new jQuery.Event(event).preventDefault();
        },
        rowClickInternal: function (element, event, rowIndex, columnIndex) {
        	
        	var self = this;
            var column = this.columns[columnIndex];  
            var func = this.onClick;   
            var colValue = mDataSet[self.elementId].getNameValue(rowIndex,column.name);  
            if (typeof (func) === 'function') {
                func(this, rowIndex, columnIndex, mDataSet[self.elementId].getAt(rowIndex),colValue);
            } 
            mGrid[self.elementId].rowIndex= rowIndex;
            mGrid[self.elementId].colIndex= columnIndex;
            
           // new jQuery.Event(event).preventDefault();
        },
        cellButtonClickInternal: function (element, event, rowIndex, columnIndex, buttonName) {
            var column = this.columns[columnIndex];
            var func = column.onButtonClick;
            if (typeof (func) === 'function') {
                func(this, rowIndex, columnIndex, mDataSet[this.elementId].getAt(rowIndex), buttonName);
            }
            new jQuery.Event(event).preventDefault();
        }, 
        cellChangingInternal: function (element, event, rowIndex, columnIndex) {  
            var column = this.columns[columnIndex];
            if (column.dataType == GridColumn.TYPE_NUMBER || column.dataType == GridColumn.TYPE_DECIMAL || column.dataType == GridColumn.TYPE_PERCENTAGE || column.dataType == GridColumn.TYPE_CURRENCY) {
                var key = (event.charCode ? event.charCode : (event.keyCode ? event.keyCode : 0));
                var allow = false; 
                if (key < 48 || key > 57 || key == 190) {
                    if (key == $.ui.keyCode.BACKSPACE ||
			            key == $.ui.keyCode.TAB ||
			            key == $.ui.keyCode.ENTER ||
			            key == $.ui.keyCode.HOME ||
			            key == $.ui.keyCode.END ||
			            key == $.ui.keyCode.LEFT ||
			            key == $.ui.keyCode.RIGHT ||
			            key == $.ui.keyCode.DELETE ||
                        key == 45 || key == 190) {
                        allow = true;
                    }
                    key = String.fromCharCode(key);
                    var culture = Globalize.culture();
                    if (column.dataType == GridColumn.TYPE_NUMBER || column.dataType == GridColumn.TYPE_DECIMAL) {
                        if (culture.numberFormat[','].indexOf(key) >= 0) {
                            allow = true;
                        }
                        if (culture.numberFormat['.'].indexOf(key) >= 0) {
                            allow = true;
                        }
                    } else if (column.dataType == GridColumn.TYPE_PERCENTAGE) {
                        if (culture.numberFormat.percent[','].indexOf(key) >= 0) {
                            allow = true;
                        }
                        if (culture.numberFormat.percent['.'].indexOf(key) >= 0) {
                            allow = true;
                        }
                        if (culture.numberFormat.percent.symbol >= 0) {
                            allow = true;
                        }
                    } else if (column.dataType == GridColumn.TYPE_CURRENCY) {
                        if (culture.numberFormat.currency[','].indexOf(key) >= 0) {
                            allow = true;
                        }
                        if (culture.numberFormat.currency['.'].indexOf(key) >= 0) {
                            allow = true;
                        }
                        if (culture.numberFormat.currency.symbol >= 0) {
                            allow = true;
                        }
                    }
                } else {
                    allow = true;
                }

                if (!allow) {
                    event.returnValue = false;
                    if (event.preventDefault) {
                        event.preventDefault();
                    }
                }
            }
        },
        cellBlurInternal: function (element, event, rowIndex, columnIndex) { 
            var column = this.columns[columnIndex];
            var value = $(element).val();
            var validFormat = true;  
			if (value) {
                value = column.unformat(value);
                if (typeof (value) === 'number') {
                    var s = value.toString();
                    var precision = 0;
                    if (s.lastIndexOf('.') >= 0) {
                        precision = s.slice(s.lastIndexOf('.') + 1).length;
                    };
                    if (precision > parseInt(column.dataFormat.slice(1), 10)) {
                        validFormat = false;
                    } 
                } else if (value) { 
                } else {
					if(value=='DaN' || value=='NaN')
                      validFormat = false; 
                }
            }
            if (!validFormat) {
                // alert(Globalize.localize('message_invalidFormat'));
				//alert('Invalid format !!');  
                $(element).val('').focus();
                this.cellChangedInternal(element, event, rowIndex, columnIndex);
            } else {
              //  var original = this.dataContext.records[rowIndex][column.name];
				var original = mDataSet[this.elementId].getNameValue(rowIndex,column.name);
                if (column.isChange(original, value)) {
                    $(element).val(column.format(value));
                    this.cellChangedInternal(element, event, rowIndex, columnIndex); 
                }
            }
        },
        cellChangedInternal: function (element, event, rowIndex, columnIndex) {
        	var column = this.columns[columnIndex];
            var value = $(element).val();
            if (column.dataType == GridColumn.TYPE_DATE || column.dataType == GridColumn.TYPE_DATETIME) {
                if (!column.valid(value)) {
                 //   if (!(/\d/g).test(value)) {
                        value = '';
						$(element).val(column.format(value));
                 //   }
                }else{
					value = Globalize.parseDate(value, (column.dataFormat || 'A')); 
                }
            } 
			if (column.dataType == GridColumn.TYPE_NUMBER || column.dataType == GridColumn.TYPE_DECIMAL || column.dataType == GridColumn.TYPE_PERCENTAGE || column.dataType == GridColumn.TYPE_CURRENCY) { 
                if (!column.valid(value)) {
                 //   if (!(/\d/g).test(value)) {
                        value = '';
						$(element).val(column.format(value));
                 //   }
                }else{
					if(value!='') 
						value = Globalize.parseFloat(value);
						$(element).val(column.format(value));
                }
            } 
            if (column.applyDataWithSelected) {
                var i, selected = false;
                for (i = 0; i < this.selectedRows.length; i++) {
                    if (this.selectedRows[i] == rowIndex) {
                        selected = true;
                        break;
                    }
                }
                if (selected) {
                    for (i = 0; i < this.selectedRows.length; i++) {
                        if (this.selectedRows[i] == rowIndex) {
                            continue;
                        }
                        // 선택된 다른 컬럼에 동일한 값 적용
                        $('#' + GridColumn.genIdTDINPUT(this.elementId, this.selectedRows[i], columnIndex)).val(value);
                    }
                }
            }else  if (column.useCheckbox) {
            	if($('#' + GridColumn.genIdTDCHECKBOX(this.elementId, rowIndex, columnIndex))[0].checked){
            		value = 'Y';
            	}else{  
            		value = 'N';
            	}		
            }
  
            // 데이터 수정 	 
        	mDataSet[this.elementId].setValue(rowIndex,columnIndex,value );
        	
            if (typeof (column.onChanged) === 'function') {
                column.onChanged(this, rowIndex, columnIndex, mDataSet[this.elementId].getAt(rowIndex), value);
            }
            if (!column.useCheckbox) 
            	new jQuery.Event(event).preventDefault();
        },
        sortInternal: function (element, event, sort, sortOrder) {
            if (this.resizing) {
                return;
            }
            if (typeof (this.onSort) === 'function') {
                this.onSort(this, sort, sortOrder);
            }
            new jQuery.Event(event).preventDefault();
        },
        pagingInternal: function (element, event, page) {
            if (typeof (this.onPaging) === 'function') {
                this.onPaging(this, page);
            }
            new jQuery.Event(event).preventDefault();
        },
        setFocus: function (rowIndex, columnIndex) {  
        	var column = this.columns[columnIndex];
            if (column.hasOptions) 
            	$('#' + GridColumn.genIdTDSELECT(this.elementId, rowIndex, columnIndex)).focus();
            else
            	$('#' + GridColumn.genIdTDINPUT(this.elementId, rowIndex, columnIndex)).focus();	
        },
         
        setStyle: function (rowIndex, columnIndex, styleType, styleValue) {
        	var column = this.columns[columnIndex]; 
            if (column.hasOptions){
            	if(styleType=='color')
            		$('#' + GridColumn.genIdTDSELECT(this.elementId, rowIndex, columnIndex))[0].style.color=styleValue;
            	else if(styleType=='bgcolor')
            		$('#' + GridColumn.genIdTDSELECT(this.elementId, rowIndex, columnIndex))[0].style.background=styleValue;
            	else if(styleType=='disabled') 
            		$('#' + GridColumn.genIdTDSELECT(this.elementId, rowIndex, columnIndex))[0].disabled=styleValue;
            		 
            	else if(styleType=='readonly')
            		$('#' + GridColumn.genIdTDSELECT(this.elementId, rowIndex, columnIndex))[0].readOnly=styleValue ;
            		
            }else if(column.useEditDefault){
            	if(styleType=='color')
            		$('#' + GridColumn.genIdTDINPUT(this.elementId, rowIndex, columnIndex))[0].style.color=styleValue;
            	else if(styleType=='bgcolor')
            		$('#' + GridColumn.genIdTDINPUT(this.elementId, rowIndex, columnIndex))[0].style.background=styleValue;
            	else if(styleType=='disabled') 
            		$('#' + GridColumn.genIdTDINPUT(this.elementId, rowIndex, columnIndex))[0].disabled=styleValue; 
            	else if(styleType=='readonly')
            		$('#' + GridColumn.genIdTDINPUT(this.elementId, rowIndex, columnIndex))[0].readOnly=styleValue;
            	
            }else{
            	if(styleType=='color')
            		$('#' + GridColumn.genIdTDSPAN(this.elementId, rowIndex, columnIndex))[0].style.color=styleValue;
            	else if(styleType=='bgcolor')
            		$('#' + GridColumn.genIdTDSPAN(this.elementId, rowIndex, columnIndex))[0].style.background=styleValue;
            }	
        },
         
        setValue: function (rowIndex, columnIndex, value) { 
			/*
            if (this.dataContext.records[rowIndex]._flag === 'D' || this.dataContext.records[rowIndex]._flag === 'GARBAGE') {
                return;
            }
			*/
			if (mDataSet[this.elementId].isRowSelectMark(rowIndex) ) {
                return;
            }
            if (typeof (columnIndex) == 'string') {
                var columnName = columnIndex;
                columnIndex = -1;
                for (var i = 0; i < this.columns.length; i++) {
                    if (this.columns[i].name == columnName) {
                        columnIndex = i;
                    }
                }
            }

            if (columnIndex >= 0) {
                var column = this.columns[columnIndex];
                var columnDisplay = column.format(this.dataContext.records[rowIndex][column.name] = value);
                if (column.hasOptions) {
                    for (i = 0; i < column.options.length; i++) {
                        if (column.options[i].code == this.dataContext.records[rowIndex][column.name]) {
                            columnDisplay = column.options[i].name;
                        }
                    }
                }
                if (typeof (column.onClick) === 'function') {
                    columnDisplay = '<a href="#" onclick="$(\'' + '#' + this.elementId + '\').grid(\'cellClickInternal\', this, event, ' + rowIndex + ', ' + columnIndex + ')">' + columnDisplay + '</a>';
                }
                $('#' + GridColumn.genIdTD(this.elementId, rowIndex, columnIndex)).html('<span style="text-align:' + column.align + ';">' + columnDisplay + '</span>');
            }
   
            // 데이터 수정 	
        	mDataSet[this.elementId].setValue(rowIndex,columnIndex,value ); 
            
        },
        setValueByEdit: function (rowIndex, columnIndex, value) { 
			/*
            if (this.dataContext.records[rowIndex]._flag === 'D' || this.dataContext.records[rowIndex]._flag === 'GARBAGE') {
                return;
            }
			*/
			if (mDataSet[this.elementId].isRowSelectMark(rowIndex) ) {
                return;
            }
            if (typeof (columnIndex) == 'string') {
                var columnName = columnIndex;
                columnIndex = -1;
                for (var i = 0; i < this.columns.length; i++) {
                    if (this.columns[i].name == columnName) {
                        columnIndex = i;
                    }
                }
            }
            var eventString = eventString = ' onchange="$(\'' + '#' + this.elementId + '\').grid(\'cellChangedInternal\', this, event, ' + rowIndex + ', ' + columnIndex + ')"';
            var builder; 
            var column = this.columns[columnIndex];
            var styleString = 'text-align:' + column.align+';border:0 0 0 0';
			var columnPosition = ' position = ['+rowIndex+ ','+columnIndex+']';
			if(column.color) 
				styleString += ';color:'+column.color;
			if(column.bgcolor)
				styleString += ';background-color:'+column.bgcolor;  
            if(column.hasOptions){
            	builder.push('<select id="' + GridColumn.genIdTDSELECT(self.elementId, rowIndex, columnIndex) + '" style="width:' + (column.width - 6) + 'px; display:none;"' + eventString + '>');
	            for (i = 0; i < column.options.length; i++) {
	                builder.push('<option value="' + column.options[i].code + '" label="' + column.options[i].name + '" ' + (column.options[i].code == value ? 'selected="selected"' : '') + '></option>');
	            }
	            builder.push('</select>');
	            $('#' + GridColumn.genIdTD(this.elementId, rowIndex, columnIndex)).html(builder);
            }else
            	$('#' + GridColumn.genIdTD(this.elementId, rowIndex, columnIndex))
            	.html('<input type="text" data-type="' + column.dataType + '" id="' + GridColumn.genIdTDINPUT(this.elementId, rowIndex, columnIndex) + '" value="' + value + '" style="width:' + (column.width - 6) + 'px;'+styleString+'"' + eventString + columnPosition +'/>');
           
            // 데이터 수정 	
        	mDataSet[this.elementId].setValue(rowIndex,columnIndex,value );  
        },
        setValueBySelect: function (rowIndex, columnIndex, options ,value ) {
            /*
			if (this.dataContext.records[rowIndex]._flag === 'D' || this.dataContext.records[rowIndex]._flag === 'GARBAGE') {
                return;
            }
			*/ 
			if (mDataSet[this.elementId].isRowSelectMark(rowIndex) ) {
                return;
            }

            if (typeof (columnIndex) == 'string') {
                var columnName = columnIndex;
                columnIndex = -1;
                for (var i = 0; i < this.columns.length; i++) {
                    if (this.columns[i].name == columnName) {
                        columnIndex = i;
                    }
                }
            }
            var column = this.columns[columnIndex];
            var eventString = eventString = ' onchange="$(\'' + '#' + this.elementId + '\').grid(\'cellChangedInternal\', this, event, ' + rowIndex + ', ' + columnIndex + ')"';
            var builder ='<select id="' + GridColumn.genIdTDSELECT(this.elementId, rowIndex, columnIndex) + '" style="width:' + (column.width - 2) + 'px; display:block;"' + eventString + '>';
            for (i = 0; i < options.length; i++) {
            	builder+='<option value="' + options[i].code + '" label="' + (options[i].name == undefined ? options[i].value:options[i].name)  + '" ' + (options[i].code == value ? 'selected="selected"' : '') + '></option>';
            }
            builder+='</select>'; 
            $('#' + GridColumn.genIdTD(this.elementId, rowIndex, columnIndex)).html(builder); 
            $('#'+GridColumn.genIdTDSELECT(this.elementId, rowIndex, columnIndex)).selectbox({ widthByElement: true }).selectbox('update');
           
             // 데이터 수정 	
        	mDataSet[this.elementId].setValue(rowIndex,columnIndex,value );  
        },
        setLabel: function (columnIndex,value ) {
        	var builder = [],columnLabel;
            var height1, height2, height3;
            if (this.thHeight instanceof Array) {
                height1 = this.thHeight[0];
                height2 = this.thHeight[1];
                height3 = height1 + height2 + 1;
            } else {
                height1 = this.thHeight;
                height2 = this.thHeight;
                height3 = height1 + height2 + 1;
            }	 
        	var  column = this.columns[columnIndex];
            if (column.grouping) {
                grouping = column.grouping;
                if (!groupingRendered[grouping.name]) {
                    if (grouping.isShow) {
                        builder.push('<th colspan="' + grouping.columnCount + '" style="height: ' + height1 + 'px;">');
                        if (grouping.runtimeVisiblity) {
                            builder.push('<button class="ux-btn-delete" onclick="$(\'' + '#' + this.elementId + '\').grid(\'showGroupingInternal\', this, event, \'' + grouping.name + '\', false)"></button>');
                        } else {
                            builder.push('<div class="ux-grid-rel"><span><em>' + grouping.label + '</em></span></div>');
                        }
						builder.push('</th>');
                    } else if (grouping.runtimeVisiblity) {
                        builder.push('<th style="height: ' + height1 + 'px;"><button class="ux-btn-add" onclick="$(\'' + '#' + this.elementId + '\').grid(\'showGroupingInternal\', this, event, \'' + grouping.name + '\', true)"></button></th>');
                    } 
                    groupingRendered[grouping.name] = true;
                }
            } else {
                if (column.isShow) {
                    if (column.useSort) {
                        if (column.name == this.dataContext.sort) {
                            sortCssClass = ' ux-use-sort ux-icon-' + this.dataContext.sortOrder;
                        } else {
                            sortCssClass = ' ux-use-sort';
                        }
                    } else {
                        sortCssClass = '';
                    }
                    columnLabel =value; 
                    if (column.dataType == GridColumn.TYPE_DATE) {
                        builder.push('<th' + (column.useResize ? ' class="grid-resize' + sortCssClass + '" columnindex="' + columnIndex + '"' : '') + ' id="' + GridColumn.genIdTH(this.elementId, columnIndex) + '"' + (this.useGrouping ? ' rowspan="2"' : '') + ' style="height: ' + (this.useGrouping ? height3 : height1) + 'px;" title="' + Globalize.culture(Globalize.cultureSelector).calendar.patterns.A + '"><div class="ux-grid-rel"><span><em>' + columnLabel + '</em></span></div></th>');
                    } else if (column.dataType == GridColumn.TYPE_DATETIME) {
                        builder.push('<th' + (column.useResize ? ' class="grid-resize' + sortCssClass + '" columnindex="' + columnIndex + '"' : '') + ' id="' + GridColumn.genIdTH(this.elementId, columnIndex) + '"' + (this.useGrouping ? ' rowspan="2"' : '') + ' style="height: ' + (this.useGrouping ? height3 : height1) + 'px;" title="' + Globalize.culture(Globalize.cultureSelector).calendar.patterns.B + '"><div class="ux-grid-rel"><span><em>' + columnLabel + '</em></span></div></th>');
                    } else {
                        builder.push('<th' + (column.useResize ? ' class="grid-resize' + sortCssClass + '" columnindex="' + columnIndex + '"' : '') + ' id="' + GridColumn.genIdTH(this.elementId, columnIndex) + '"' + (this.useGrouping ? ' rowspan="2"' : '') + ' style="height: ' + (this.useGrouping ? height3 : height1) + 'px;"><div class="ux-grid-rel"><span><em>' + columnLabel + '</em></span></div></th>');
                    }
                }
            };  
            var elementId = this.elementId;
            this.elementHeadFixed.find('th').each(function (index, element) {
            	if(element.id ==elementId+'_HEAD_'+columnIndex)
            		element.innerHTML= builder;
            });
            this.elementHeadNormal.find('th').each(function (index, element) {
            	if(element.id ==elementId+'_HEAD_'+columnIndex)
            		element.innerHTML= builder;
            });
             
        },
        getColumns: function (name) {
            if (typeof (name) === 'string') {
                for (var i = 0; i < this.columns.length; i++) {
                    if (this.columns[i].name == name) {
                        return this.columns[i];
                    }
                }
            }
            return this.columns;
        },
        setColumns: function (options) { 
        	if(options.columns) { 
        		var columnGroupingOption = {
                        name: '',
                        label: '',
                        isShow: true,
                        useMove: true,
                        runtimeVisiblity: false
                };
                var columnFilterOption = {
                    name: '',
                    label: '',
                    isInput: true 
                }; 
                if (options.columns == null) {
                    throw new Error(['jQuery.grid', 'columns 옵션을 지정하지 않았습니다.']);
                }
                if (!(options.columns instanceof Array)) {
                    throw new Error(['jQuery.grid', 'columns 옵션 타입이 Array가 아닙니다.']);
                }
                	
                var option, i, j, columns = [], columnsGrouping = {},columnsFilter = {}, buttons, selectOptions;
                if (options.columnsGrouping instanceof Array) {
                    for (i = 0; i < options.columnsGrouping.length; i++) {
                        option = $.extend({}, columnGroupingOption, options.columnsGrouping[i]);
                        if (option.runtimeVisiblity) {
                            useMove = false;
                        }
                        if (String.isNullOrWhitespace(option.name)) {
                            throw new Error(['jQuery.grid', 'columnsGrouping 옵션에 name 값이 없습니다.']);
                        }
                        columnsGrouping[option.name] = new GridColumnGrouping(option.name, option.label, 0, option.isShow, option.useMove, option.runtimeVisiblity);
                    }
                }
                
    			if (options.columnsFilter instanceof Array) {
                    for (i = 0; i < options.columnsFilter.length; i++) {
                        option = $.extend({}, columnFilterOption, options.columnsFilter[i]);
                         if (String.isNullOrWhitespace(option.name)) {
                            throw new Error(['jQuery.grid', 'columnsFilter 옵션에 name 값이 없습니다.']);
                        }
                        columnsFilter[option.name] = new GridColumnFilter(option.name, option.label, option.isInput );
                    }
                }
                for (i = 0; i < options.columns.length; i++) {
                    option = $.extend({}, options.columns[i]);
                    if (String.isNullOrWhitespace(option.name)) {
                        throw new Error(['jQuery.grid', 'column 옵션에 name 값이 없습니다.']);
                    }
                    if (columnsGrouping.hasOwnProperty(option.group)) {
                        columnsGrouping[option.group].columnCount++;
                    }

                    buttons = [];
                    if (option.buttons && option.buttons.length > 0) {
                        for (j = 0; j < option.buttons.length; j++) {
                            buttons.push(option.buttons[j]);
                        }
                    }

                    selectOptions = [];
                    if (option.options && option.options.length > 0) {
                        for (j = 0; j < option.options.length; j++) {
                            selectOptions.push(option.options[j]);
                        }
                    } 
                    if(options.columns[i].editType){
    	                if(options.columns[i].editType =='useEdit')
    	                	option.useEdit = true;
    	                else if(options.columns[i].editType =='useEditDefault')
    	                	option.useEditDefault = true;
    	                else if(options.columns[i].editType =='useCheckbox')
    	                	option.useCheckbox = true;
                    }; 
                    
                    if(options.columns[i].useSort ==='true' || options.columns[i].useSort == true ) 
                    	option.useSort=true;
                    else
                    	option.useSort=false; 
                    
                    if(options.columns[i].useResize  ==='true' || options.columns[i].useResize == true ) 
                    	option.useResize=true;
                    else
                    	option.useResize=false;
                    
                    if(options.columns[i].isRequired  ==='true' ||  options.columns[i].isRequired == true) 
                    	option.isRequired=true;
                    else
                    	option.isRequired=false;
                    
                    if(options.columns[i].useMove  ==='true' ||  options.columns[i].useMove == true) 
                    	option.useMove=true;
                    else
                    	option.useMove=false;

                    if(options.columns[i].rowMerge  ==='true' ||  options.columns[i].rowMerge == true) 
                    	option.rowMerge=true;
                    else
                    	option.rowMerge=false;
                    
                    if(options.columns[i].isShow  ==='false' ||  options.columns[i].isShow == false) 
                    	option.isShow=false;
                    else
                    	option.isShow=true;
                    
                    if(options.columns[i].width ===0 || options.columns[i].width ==='0') option.isShow = false;

    				columns.push(new GridColumn(option.name, option.label,option.title, option.dataType, option.dataFormat, option.dataDefault, option.width, option.minWidth || option.width - 50, option.maxWidth || option.width + 100, option.align, option.color, option.bgcolor, option.useSort, option.useResize, option.useEdit, option.useEditDefault, option.useInsert, option.useCheckbox, option.isRequired, option.isShow, option.useMove, option.rowMerge, option.applyDataWithSelected, columnsGrouping[option.group] || null,columnsFilter[option.name] || null, buttons, selectOptions, option.onClick, option.onButtonClick, option.onChanged));
                }    
        		this.columns = columns; 
        	}	
        	if(options.columnsGrouping)
        		this.columnsGrouping =  options.columnsGrouping;
        	if(options.columnsSummary)
        		this.columnsSummary =  options.columnsSummary;
        	if(options.columnsFilter)
        		this.columnsFilter =  options.columnsFilter;
        	if(options.columnsFixed)
        		this.columnFixed =  options.columnFixed;
        	this.initialize(); 
        },   
        getDataContext: function () {
            return this.dataContext;
        },
        getFilterColumns: function () {
            return this.filterColumns;
        },
        getRows: function (applyChanged) {
            var results = [], record, rowIndex, columnIndex;
            if (applyChanged) {
                for (rowIndex = 0; rowIndex < this.dataContext.records.length; rowIndex++) {
                    record = $.extend({ __rowIndex: rowIndex }, this.dataContext.records[rowIndex]);
                    for (columnIndex = 0; columnIndex < this.columns.length; columnIndex++) {
                        column = this.columns[columnIndex];
                        if (column.useEdit || column.useEditDefault || column.useInsert) {
                            if (column.hasOptions) {
                                input = $('#' + GridColumn.genIdTDSELECT(this.elementId, rowIndex, columnIndex));
                            } else {
                                input = $('#' + GridColumn.genIdTDINPUT(this.elementId, rowIndex, columnIndex));
                            }
                            if (input.length > 0) {
                                record[column.name] = column.unformat(input.val());
                            }
                        }
                    }
                    results.push(record);
                }
            } else {
                for (rowIndex = 0; rowIndex < this.dataContext.records.length; rowIndex++) {
                    record = $.extend({ __rowIndex: rowIndex }, this.dataContext.records[rowIndex]);
                    results.push(record);
                }
            }

            return results;
        },
        getSelectedRows: function (applyChanged) { 
            var results = [], record, rowIndex, columnIndex;
            if (applyChanged) {
                for (var i = 0; i < this.selectedRows.length; i++) {
                    rowIndex = this.selectedRows[i];
                    record = $.extend({ __rowIndex: rowIndex }, this.dataContext.records[rowIndex]);
                    for (columnIndex = 0; columnIndex < this.columns.length; columnIndex++) {
                        column = this.columns[columnIndex];
                        if (column.useEdit || column.useEditDefault || column.useInsert) {
                            if (column.hasOptions) {
                                input = $('#' + GridColumn.genIdTDSELECT(this.elementId, rowIndex, columnIndex));
                            } else {
                                input = $('#' + GridColumn.genIdTDINPUT(this.elementId, rowIndex, columnIndex));
                            }
                            if (input.length > 0) {
                                record[column.name] = column.unformat(input.val());
                            }
                        }
                    }
                    results.push(record);
                }
            } else {
                for (var i = 0; i < this.selectedRows.length; i++) {
                    rowIndex = this.selectedRows[i];
                    record = $.extend({ __rowIndex: rowIndex }, this.dataContext.records[rowIndex]);
                    results.push(record);
                }
            }

            return results;
        },
        getInsertedRows: function () {
            var results = [], record, rowIndex, columnIndex;
            for (rowIndex = 0; rowIndex < this.dataContext.records.length; rowIndex++) {
                record = this.dataContext.records[rowIndex];
                if (record._flag === 'I') {
                    for (columnIndex = 0; columnIndex < this.columns.length; columnIndex++) {
                        column = this.columns[columnIndex];
                        if (column.useEdit || column.useEditDefault || column.useInsert) {
                            if (column.hasOptions) {
                                input = $('#' + GridColumn.genIdTDSELECT(this.elementId, rowIndex, columnIndex));
                            } else {
                                input = $('#' + GridColumn.genIdTDINPUT(this.elementId, rowIndex, columnIndex));
                            }
                            if (input.length > 0) {
                                record[column.name] = column.unformat(input.val());
                            }
                        }
                    }
                    results.push($.extend({ __rowIndex: rowIndex }, record));
                }
            }

            return results;
        },
        getDeletedRows: function () {
            var results = [], record, rowIndex, columnIndex;
            for (rowIndex = 0; rowIndex < this.dataContext.records.length; rowIndex++) {
                record = this.dataContext.records[rowIndex];
                if (record._flag === 'D') {
                    for (columnIndex = 0; columnIndex < this.columns.length; columnIndex++) {
                        column = this.columns[columnIndex];
                        if (column.useEdit || column.useEditDefault || column.useInsert) {
                            if (column.hasOptions) {
                                input = $('#' + GridColumn.genIdTDSELECT(this.elementId, rowIndex, columnIndex));
                            } else {
                                input = $('#' + GridColumn.genIdTDINPUT(this.elementId, rowIndex, columnIndex));
                            }
                            if (input.length > 0) {
                                record[column.name] = column.unformat(input.val());
                            }
                        }
                    }
                    results.push($.extend({ __rowIndex: rowIndex }, record));
                }
            }

            return results;
        },
        getChangedRows: function (onlySelected) {
            var results = [], record, rowIndex, column, columnIndex, original, value, input, i, changed;
            var selectedRows = [];
            if (onlySelected) {
                for (i = 0; i < this.selectedRows.length; i++) {
                    if (this.dataContext.records[this.selectedRows[i]]._flag === 'I' || this.dataContext.records[this.selectedRows[i]]._flag === 'D' || this.dataContext.records[this.selectedRows[i]]._flag === 'GARBAGE') {
                        // 추가 또는 삭제된 ROW는 가져오지 않는다.
                    } else {
                        selectedRows.push(this.selectedRows[i]);
                    }
                }
            } else {
                for (i = 0; i < this.dataContext.records.length; i++) {
                    if (this.dataContext.records[i]._flag === 'I' || this.dataContext.records[i]._flag === 'D' || this.dataContext.records[i]._flag === 'GARBAGE') {
                        // 추가 또는 삭제된 ROW는 가져오지 않는다.
                    } else {
                        selectedRows.push(i);
                    }
                }
            }

            for (i = 0; i < selectedRows.length; i++) {
                rowIndex = selectedRows[i];
                record = $.extend({ __rowIndex: rowIndex }, this.dataContext.records[rowIndex]);
                changed = false;
                for (columnIndex = 0; columnIndex < this.columns.length; columnIndex++) {
                    column = this.columns[columnIndex];
                    if (column.useEdit || column.useEditDefault || column.useInsert) {
                        if (column.hasOptions) {
                            input = $('#' + GridColumn.genIdTDSELECT(this.elementId, rowIndex, columnIndex));
                        } else {
                            input = $('#' + GridColumn.genIdTDINPUT(this.elementId, rowIndex, columnIndex));
                        }
                        if (input.length > 0) {
                            if (column.hasFileUpload) {
                                original = '';
                            } else {
                                original = this.dataContext.records[rowIndex][column.name];
                            }
                            value = column.unformat(input.val());
                            if (column.isChange(original, value)) {
                                changed = true;
                                record[column.name] = value;
                            }
                        }
                    }
                }
                if (changed) {
                    results.push(record);
                }
            }

            return results;
        },
        validRows: function (onlySelected) {
            var rowIndex, column, columnIndex, formatted, input, i;
            var selectedRows = [];
            if (onlySelected) {
                for (i = 0; i < this.selectedRows.length; i++) {
                    if (this.dataContext.records[this.selectedRows[i]]._flag === 'D' || this.dataContext.records[this.selectedRows[i]]._flag === 'GARBAGE') {
                        // 추가 또는 삭제된 ROW는 가져오지 않는다.
                    } else {
                        selectedRows.push(this.selectedRows[i]);
                    }
                }
            } else {
                for (i = 0; i < this.dataContext.records.length; i++) {
                    if (this.dataContext.records[i]._flag === 'D' || this.dataContext.records[i]._flag === 'GARBAGE') {
                        // 삭제된 ROW는 유효성 검사를 수행하지 않는다.
                    } else {
                        selectedRows.push(i);
                    }
                }
            }

            for (var i = 0; i < selectedRows.length; i++) {
                rowIndex = selectedRows[i];
                for (columnIndex = 0; columnIndex < this.columns.length; columnIndex++) {
                    column = this.columns[columnIndex];
                    if (column.useEdit || column.useEditDefault || column.useInsert) {
                        if (column.hasOptions) {
                            input = $('#' + GridColumn.genIdTDSELECT(this.elementId, rowIndex, columnIndex));
                        } else {
                            input = $('#' + GridColumn.genIdTDINPUT(this.elementId, rowIndex, columnIndex));
                        }
                        if (input.length > 0) {
                            formatted = input.val();
                            if (column.dataType == GridColumn.TYPE_DATE) {
                                if (Globalize.culture(Globalize.cultureSelector).calendar.patterns.a.replace(/9/g, '_') == formatted) {
                                    input.val(formatted = '');
                                }
                            } else if (column.dataType == GridColumn.TYPE_DATETIME) {
                                if (Globalize.culture(Globalize.cultureSelector).calendar.patterns.b.replace(/9/g, '_') == formatted) {
                                    input.val(formatted = '');
                                }
                            }
                            if (column.valid(formatted) == false) {
                                input.focus();
                                return false;
                            }
                        }
                    }
                }
            }

            return true;
        },
        insertRow: function (record) { 
 
            var self = this;
			var rowIndex = mDataSet[self.elementId].getCount() == undefined ? this.dataContext.records.length : mDataSet[self.elementId].getCount(); 
			var columnPosition ; 
            var genHTMLTR = function (columnInd, columnLen, useSelection, suffix) {

                var builder = [],eventClick,columnIndex, column, columnDisplay, columnIndex, styleString, grouping, groupingRendered = {}, eventString, i;
                builder.push('<tr id="' + GridColumn.genIdTR(self.elementId, rowIndex) + suffix + '"' + (rowIndex % 2 != 0 ? ' class="ux-even"' : '') + ' style="height:' + self.tdHeight + 'px;">');
                
                if (useSelection) {
                    builder.push('<td style="text-align: center;"><input type="checkbox" id="' + GridColumn.genIdTDCHECKBOX(self.elementId, rowIndex,0) + '" onclick="$(\'' + '#' + self.elementId + '\').grid(\'selectInternal\', this, event, ' + rowIndex + ')" /></td>');
                }
                for (columnIndex = columnInd; columnIndex < columnLen; columnIndex++) {
                    column = self.columns[columnIndex];
                    columnDisplay = column.format(record[column.name]);
                    if (column.hasOptions) {
                        for (i = 0; i < column.options.length; i++) {
                            if (column.options[i].code == record[column.name]) {
                                columnDisplay = column.options[i].name;
                            }
                        }
                    }
					columnPosition = ' position = ['+rowIndex+ ','+columnIndex+']';
                   	eventClick = ' onclick="$(\'' + '#' + self.elementId + '\').grid(\'rowClickInternal\', this, event, ' + rowIndex + ', ' + columnIndex + ')"';
                    if (typeof (column.onClick) === 'function') {
                        columnDisplay = '<a href="#" onclick="$(\'' + '#' + self.elementId + '\').grid(\'cellClickInternal\', this, event, ' + rowIndex + ', ' + columnIndex + ')">' + columnDisplay + '</a>';
                    }
                    
					styleString = 'text-align:' + column.align+';border:0 0 0 0';
                    if(column.color) 
                    	styleString += ';color:'+column.color;
                    if(column.bgcolor)
                    	styleString += ';background-color:'+column.bgcolor;  
                    if (column.grouping) {
                        if (column.grouping.isShow) {
                            if (column.hasButtons) {
                                builder.push('<td '+eventClick+' id="' + GridColumn.genIdTD(self.elementId, rowIndex, columnIndex) + '">');
                                for (i = 0; i < column.buttons.length; i++) {
                                    var button = column.buttons[i];
                                    builder.push('<a onclick="$(\'' + '#' + self.elementId + '\').grid(\'cellButtonClickInternal\', this, event, ' + rowIndex + ', ' + columnIndex + ', \'' + button.name + '\')" class="' + button.cssClass + '"><span>' + button.label + '</span></a>');
                                }
                                builder.push('</td>');
                            } else if (column.useEditDefault) {
                                if (column.hasOptions) {
                                    if (column.applyDataWithSelected || typeof (column.onChanged) === 'function') {
                                        eventString = ' onchange="$(\'' + '#' + self.elementId + '\').grid(\'cellChangedInternal\', this, event, ' + rowIndex + ', ' + columnIndex + ')"';
                                    } else {
                                        eventString = '';
                                    }
                                    builder.push('<td '+eventClick+' id="' + GridColumn.genIdTD(self.elementId, rowIndex, columnIndex) + '">');
                                    builder.push('<select id="' + GridColumn.genIdTDSELECT(self.elementId, rowIndex, columnIndex) + '" style="width:' + (column.width - 6) + 'px;'+styleString+';display:none;"' + eventString + '>');
                                    for (i = 0; i < column.options.length; i++) {
                                        builder.push('<option value="' + column.options[i].code + '" label="' + column.options[i].name + '" ' + (column.options[i].code == record[column.name] ? 'selected="selected"' : '') + '></option>');
                                    }
                                    builder.push('</select>');
                                    builder.push('</td>');
                                } else if (column.hasFileUpload) {
                                    if (typeof (column.onChanged) === 'function') {
                                        eventString = ' onchange="$(\'' + '#' + self.elementId + '\').grid(\'cellChangedInternal\', this, event, ' + rowIndex + ', ' + columnIndex + ')"';
                                    } else {
                                        eventString = '';
                                    }
                                    builder.push('<td '+eventClick+' id="' + GridColumn.genIdTD(self.elementId, rowIndex, columnIndex) + '"><input type="file" id="' + GridColumn.genIdTDINPUT(self.elementId, rowIndex, columnIndex) + '" name="' + column.name + '" style="width:' + (column.width - 6) + 'px;'+styleString+'"' + eventString +  ' /></td>'); 
                                } else { 
                                	eventString = ' onchange="$(\'' + '#' + self.elementId + '\').grid(\'cellChangedInternal\', this, event, ' + rowIndex + ', ' + columnIndex + ')" onfocus="this.style.border=\'1px solid #c30653\';"';
			 						if (column.applyDataWithSelected || typeof (column.onChanged) === 'function') {
										eventString += ' onblur="this.style.border=\'\';$(\'' + '#' + self.elementId + '\').grid(\'cellBlurInternal\', this, event, ' + rowIndex + ', ' + columnIndex + ')" onChange="$(\'' + '#' + self.elementId + '\').grid(\'cellChangedInternal\', this, event, ' + rowIndex + ', ' + columnIndex + ')"';
									} else {
										eventString += ' onfocus="this.style.border=\'1px solid #c30653\';" onblur="this.style.border=\'\';$(\'' + '#' + self.elementId + '\').grid(\'cellBlurInternal\', this, event, ' + rowIndex + ', ' + columnIndex + ')" ';
									}
                                    builder.push('<td  '+eventClick+' id="' + GridColumn.genIdTD(self.elementId, rowIndex, columnIndex) + '"><input type="text" data-type="' + column.dataType + '" id="' + GridColumn.genIdTDINPUT(self.elementId, rowIndex, columnIndex) + '" value="' + column.format(record[column.name]) + '" style="width:' + (column.width - 6) + 'px;'+styleString+'"' + eventString + columnPosition +' /></td>');
                                }
                            } else if (column.useCheckbox) {
                            	eventString = ' onclick="$(\'' + '#' + self.elementId + '\').grid(\'cellChangedInternal\', this, event, ' + rowIndex + ', ' + columnIndex + ')"';
                                if(column.format(record[column.name]) =='Y'	)
                                	eventString +=' checked=\'checked\' value =\'Y\'';
                                else
                                	eventString +=' value=\'N\''; 
                                builder.push('<td '+eventClick+' id="' + GridColumn.genIdTD(self.elementId, rowIndex, columnIndex) + '"><input type="checkbox" id="' + GridColumn.genIdTDCHECKBOX(self.elementId, rowIndex, columnIndex) + '" name="' + column.name + '" style="width:' + (column.width - 6) + 'px;'+styleString+'"' + eventString +  columnPosition+'   /></td>'); 
                                    
                                
                            } else {
                                builder.push('<td '+eventClick+' id="' + GridColumn.genIdTD(self.elementId, rowIndex, columnIndex) + '"><span style="'+ styleString+';">' + columnDisplay + '</span></td>');
                            }
                        } else if (column.grouping.runtimeVisiblity && !groupingRendered[column.grouping.name]) {
                            builder.push('<td></td>');
                            groupingRendered[column.grouping.name] = true;
                        }
                    } else {
                        if (column.isShow) {
                            if (column.hasButtons) {
                                builder.push('<td '+eventClick+' id="' + GridColumn.genIdTD(self.elementId, rowIndex, columnIndex) + '">');
                                for (i = 0; i < column.buttons.length; i++) {
                                    var button = column.buttons[i];
                                    builder.push('<a onclick="$(\'' + '#' + self.elementId + '\').grid(\'cellButtonClickInternal\', this, event, ' + rowIndex + ', ' + columnIndex + ', \'' + button.name + '\')" class="' + button.cssClass + '"><span>' + button.label + '</span></a>');
                                }
                                builder.push('</td>');
                            } else if (column.useEditDefault) {
                                if (column.hasOptions) {
                                    if (column.applyDataWithSelected || typeof (column.onChanged) === 'function') {
                                        eventString = ' onchange="$(\'' + '#' + self.elementId + '\').grid(\'cellChangedInternal\', this, event, ' + rowIndex + ', ' + columnIndex + ')"';
                                    } else {
                                        eventString = '';
                                    }
                                    builder.push('<td '+eventClick+' id="' + GridColumn.genIdTD(self.elementId, rowIndex, columnIndex) + '">');
                                    builder.push('<select id="' + GridColumn.genIdTDSELECT(self.elementId, rowIndex, columnIndex) + '" style="width:' + (column.width - 6) + 'px;'+styleString+';display:none;"' + eventString + '>');
                                    for (i = 0; i < column.options.length; i++) {
                                        builder.push('<option value="' + column.options[i].code + '" label="' + column.options[i].name + '" ' + (column.options[i].code == record[column.name] ? 'selected="selected"' : '') + '></option>');
                                    }
                                    builder.push('</select>');
                                    builder.push('</td>');
                                } else if (column.hasFileUpload) {
                                    if (typeof (column.onChanged) === 'function') {
                                        eventString = ' onchange="$(\'' + '#' + self.elementId + '\').grid(\'cellChangedInternal\', this, event, ' + rowIndex + ', ' + columnIndex + ')"';
                                    } else {
                                        eventString = '';
                                    }
                                    builder.push('<td '+eventClick+' id="' + GridColumn.genIdTD(self.elementId, rowIndex, columnIndex) + '"><input type="file" id="' + GridColumn.genIdTDINPUT(self.elementId, rowIndex, columnIndex) + '" name="' + column.name + '" style="width:' + (column.width - 6) + 'px;'+styleString+'"' + eventString + ' /></td>');
                                } else {
									eventString = ' onchange="$(\'' + '#' + self.elementId + '\').grid(\'cellChangedInternal\', this, event, ' + rowIndex + ', ' + columnIndex + ')" onfocus="this.style.border=\'1px solid #c30653\';"';
									if (column.applyDataWithSelected || typeof (column.onChanged) === 'function') {
										eventString += ' onblur="this.style.border=\'\';$(\'' + '#' + self.elementId + '\').grid(\'cellBlurInternal\', this, event, ' + rowIndex + ', ' + columnIndex + ')" onChange="$(\'' + '#' + self.elementId + '\').grid(\'cellChangedInternal\', this, event, ' + rowIndex + ', ' + columnIndex + ')"';
									} else {
										eventString += ' onfocus="this.style.border=\'1px solid #c30653\';" onblur="this.style.border=\'\';$(\'' + '#' + self.elementId + '\').grid(\'cellBlurInternal\', this, event, ' + rowIndex + ', ' + columnIndex + ')" ';
									}
                                    builder.push('<td '+eventClick+' id="' + GridColumn.genIdTD(self.elementId, rowIndex, columnIndex) + '"><input type="text" data-type="' + column.dataType + '" id="' + GridColumn.genIdTDINPUT(self.elementId, rowIndex, columnIndex) + '" value="' + column.format(record[column.name]) + '" style="width:' + (column.width - 6) + 'px;'+styleString+'"' + eventString  + ' onkeydown = "$(\'' + '#' + this.elementId + '\').grid(\'cellChangingInternal\', this, event, ' + rowIndex + ', ' + columnIndex + ')"  '+columnPosition+'/></td>');
                                }
                            } else if (column.useCheckbox) { 
                                eventString = ' onclick="$(\'' + '#' + self.elementId + '\').grid(\'cellChangedInternal\', this, event, ' + rowIndex + ', ' + columnIndex + ')"'; 
                                if(column.format(record[column.name]) =='Y'	)
                                	eventString +=' checked=\'checked\' value =\'Y\'';
                                else
                                	eventString +=' value=\'N\'';
                                builder.push('<td '+eventClick+' id="' + GridColumn.genIdTD(self.elementId, rowIndex, columnIndex) + '"><input type="checkbox" id="' + GridColumn.genIdTDCHECKBOX(self.elementId, rowIndex, columnIndex) + '" name="' + column.name + '" style="width:' + (column.width - 6) + 'px;'+styleString+'"' + eventString  +' /></td>');    
                            } else {
                                builder.push('<td '+eventClick+' id="' + GridColumn.genIdTD(self.elementId, rowIndex, columnIndex) + '"><span style="' + styleString + ';">' + columnDisplay + '</span></td>');
                            }
                        }
                    }
                }  
                builder.push('</tr>');
                return builder.join('');
            }; 
            var tableFixed, tableNormal, trFixed, trNormal;
            if (this.useFixed) {
                // FIXED TABLE
                tableFixed = this.elementBodyFixed.find('table');
                if (tableFixed.length == 0) {
                    this.elementBodyFixed[0].innerHTML = this.genHTMLBodyTable(0, this.columnFixed, this.useSelection, GridColumn.SUFFIX_FIXED, '<tbody>' + genHTMLTR(0, this.columnFixed, this.useSelection, GridColumn.SUFFIX_FIXED) + '</tbody>');
                } else {
                    tableFixed.append(genHTMLTR(0, this.columnFixed, this.useSelection, GridColumn.SUFFIX_FIXED));
                }
                // NORMAL TABLE
                tableNormal = this.elementBodyNormal.find('table');
                if (tableNormal.length == 0) {
                    this.elementBodyNormal[0].innerHTML = this.genHTMLBodyTable(this.columnFixed, this.columns.length, false, GridColumn.SUFFIX_NORMAL, '<tbody>' + genHTMLTR(this.columnFixed, this.columns.length, false, GridColumn.SUFFIX_NORMAL) + '</tbody>');
                } else {
                    tableNormal.append(genHTMLTR(this.columnFixed, this.columns.length, false, GridColumn.SUFFIX_NORMAL));
                }
                trFixed = $('#' + GridColumn.genIdTR(this.elementId, rowIndex) + GridColumn.SUFFIX_FIXED);
                trNormal = $('#' + GridColumn.genIdTR(this.elementId, rowIndex) + GridColumn.SUFFIX_NORMAL);
			 
                if (this.useInnerMasked) {
                    // 마스크 적용
                    $('input[data-type="' + GridColumn.TYPE_DATE + '"]', trFixed).each(function (index, element) {
                        //$(element).mask(Globalize.culture(Globalize.cultureSelector).calendar.patterns.a);
						var dataFormat = self.columns[eval(element.attributes.position.value)[1]].dataFormat;
						if(dataFormat) $(element).mask(maskDateCheck(dataFormat));
                    });
                    $('input[data-type="' + GridColumn.TYPE_DATETIME + '"]', trFixed).each(function (index, element) {
                        //$(element).mask(Globalize.culture(Globalize.cultureSelector).calendar.patterns.b);
						var dataFormat = self.columns[eval(element.attributes.position.value)[1]].dataFormat;
						if(dataFormat) $(element).mask(maskDateCheck(dataFormat));
                    });
                    $('input[data-type="' + GridColumn.TYPE_DATE + '"]', trNormal).each(function (index, element) { 
                        //$(element).mask(Globalize.culture(Globalize.cultureSelector).calendar.patterns.a);
						var dataFormat = self.columns[eval(element.attributes.position.value)[1]].dataFormat;
						if(dataFormat) $(element).mask(maskDateCheck(dataFormat));
                    });
                    $('input[data-type="' + GridColumn.TYPE_DATETIME + '"]', trNormal).each(function (index, element) {
                        //$(element).mask(Globalize.culture(Globalize.cultureSelector).calendar.patterns.b);
						var dataFormat = self.columns[eval(element.attributes.position.value)[1]].dataFormat;
						if(dataFormat) $(element).mask(maskDateCheck(dataFormat)); 
                    });
                }  
                if (this.useInnerOption) {
                    // SELECT 플러그인 적용
                    $('select', trFixed).each(function (index, element) {
                        $(element).selectbox({ widthByElement: true }).selectbox('update');
                    });
                    $('select', trNormal).each(function (index, element) {
                        $(element).selectbox({ widthByElement: true }).selectbox('update');
                    });
                }
            } else {
                // NORMAL TABLE
                tableNormal = this.elementBodyNormal.find('table');
                if (tableNormal.length == 0) {
                    this.elementBodyNormal[0].innerHTML = this.genHTMLBodyTable(0, this.columns.length, this.useSelection, GridColumn.SUFFIX_NORMAL, '<tbody>' + genHTMLTR(0, this.columns.length, this.useSelection, GridColumn.SUFFIX_NORMAL) + '</tbody>');
                } else {
                    tableNormal.append(genHTMLTR(0, this.columns.length, this.useSelection, GridColumn.SUFFIX_NORMAL));
                }
                trNormal = $('#' + GridColumn.genIdTR(this.elementId, rowIndex) + GridColumn.SUFFIX_NORMAL);
                if (this.useInnerMasked) {
                    // 마스크 적용
                    $('input[data-type="' + GridColumn.TYPE_DATE + '"]', trNormal).each(function (index, element) {
                        //$(element).mask(Globalize.culture(Globalize.cultureSelector).calendar.patterns.a);
						var dataFormat = self.columns[eval(element.attributes.position.value)[1]].dataFormat;
						if(dataFormat) $(element).mask(maskDateCheck(dataFormat));  
                    });
                    $('input[data-type="' + GridColumn.TYPE_DATETIME + '"]', trNormal).each(function (index, element) {
                        //$(element).mask(Globalize.culture(Globalize.cultureSelector).calendar.patterns.b);
						var dataFormat = self.columns[eval(element.attributes.position.value)[1]].dataFormat;
						if(dataFormat) $(element).mask(maskDateCheck(dataFormat)); 
                    });
                }
                if (this.useInnerOption) {
                    // SELECT 플러그인 적용
                    $('select', trNormal).each(function (index, element) {
                        $(element).selectbox({ widthByElement: true }).selectbox('update');
                    });
                }
            }
            record._flag = 'I';
            
            this.dataContext.records.push(record);
            this.size(this.width, this.height);
     
            var row = mDataSet[self.elementId].newRecord(rowIndex);  
 
            for (columnIndex = 0; columnIndex < self.columns.length; columnIndex++) {
                column = self.columns[columnIndex];
                if(record[column.name]!=undefined )
                	mDataSet[self.elementId].setNameValue( rowIndex,column.name,record[column.name] );
            }
            return rowIndex;
        },
        deleteRow: function (rowIndex, useFlag) {
        	var self = this;
            if (rowIndex <= 0 && rowIndex >= this.dataContext.records.length) {
                $.debug.log(['Grid.deleteRow', '삭제할 데이터가 없습니다.']);
                return;
            } 
			if (mDataSet[this.elementId].isRowSelectMark(rowIndex) ) {
                return;
            }
 
/*
            if (this.dataContext.records[rowIndex]._flag === 'I') {
                this.dataContext.records[rowIndex]._flag = 'GARBAGE';
            } else if (useFlag) {
                this.dataContext.records[rowIndex]._flag = 'D';
            } else {
                this.dataContext.records[rowIndex]._flag = 'GARBAGE';
            }
*/		
            var trFixed, trNormal;
            if (this.useFixed) {
                trFixed = $('#' + GridColumn.genIdTR(this.elementId, rowIndex) + GridColumn.SUFFIX_FIXED);
                trNormal = $('#' + GridColumn.genIdTR(this.elementId, rowIndex) + GridColumn.SUFFIX_NORMAL);
                if (this.useInnerMasked) {
                    // 마스크 해제
                    $('input[data-type="' + GridColumn.TYPE_DATE + '"]', trFixed).each(function (index, element) {
                        $(element).unmask();
                    });
                    $('input[data-type="' + GridColumn.TYPE_DATETIME + '"]', trFixed).each(function (index, element) {
                        $(element).unmask();
                    });
                    $('input[data-type="' + GridColumn.TYPE_DATE + '"]', trNormal).each(function (index, element) {
                        $(element).unmask();
                    });
                    $('input[data-type="' + GridColumn.TYPE_DATETIME + '"]', trNormal).each(function (index, element) {
                        $(element).unmask();
                    });
                }
                if (this.useInnerOption) {
                    // SELECT 플러그인 제거
                    $('select', trFixed).each(function (index, element) {
                        $(element).selectbox('destroy');
                    });
                    $('select', trNormal).each(function (index, element) {
                        $(element).selectbox('destroy');
                    });
                }
                trFixed.remove();
                trNormal.remove();

                this.elementBodyFixed.find('table tr').each(function (index, element) {
                    if (index % 2 == 0) {
                        $(element).removeClass('ux-even');
                    } else {
                        $(element).addClass('ux-even');
                    }
                });
                this.elementBodyNormal.find('table tr').each(function (index, element) {
                    if (index % 2 == 0) {
                        $(element).removeClass('ux-even');
                    } else {
                        $(element).addClass('ux-even');
                    }
                });
            } else {
                trNormal = $('#' + GridColumn.genIdTR(this.elementId, rowIndex) + GridColumn.SUFFIX_NORMAL);
                if (this.useInnerMasked) {
                    // 마스크 해제
                    $('input[data-type="' + GridColumn.TYPE_DATE + '"]', trNormal).each(function (index, element) {
                        $(element).unmask();
                    });
                    $('input[data-type="' + GridColumn.TYPE_DATETIME + '"]', trNormal).each(function (index, element) {
                        $(element).unmask();
                    });
                }
                if (this.useInnerOption) {
                    // SELECT 플러그인 제거
                    $('select', trNormal).each(function (index, element) {
                        $(element).selectbox('destroy');
                    });
                }
                trNormal.remove();

                this.elementBodyNormal.find('table tr').each(function (index, element) {
                    if (index % 2 == 0) {
                        $(element).removeClass('ux-even');
                    } else {
                        $(element).addClass('ux-even');
                    }
                });
            }
         
            // 선택한 로우 제거
            var indexOf = -1;
            for (var i = 0; i < this.selectedRows.length; i++) {
                if (this.selectedRows[i] == rowIndex) {
                    indexOf = i;
                    break;
                }
            }
            if (indexOf >= 0) {
                this.selectedRows.splice(indexOf, 1);
            }
 
            if(rowIndex>-1)
               mDataSet[self.elementId].setRowSelectMark(rowIndex,true); 
        }  
    };

    $.widget('ui.grid', {
        options: {
            name: '',
            title: '',
            columns: null,
            columnFixed: 0,
            columnsGrouping: null,
			columnsFilter: null,
            fitSize: false,
            width: NaN,
            height: NaN,
            thHeight: 24,
            tdHeight: 24,
			resizing: false, 
            useSelection: false,
            useSelectionAll: true,
            pagingSelector: null,
            pagingSummarySelector: null,
            onSort: null,
            onPaging: null,
            onClik: null,
            onRowSelected: null,
            onAllSelected: null,
            onRenderComplete: null
        },
        _create: function () { 
            if (this.element.children('div').length == 0) {
                this.element.empty().html('<div class="grid-header"><div class="grid-header-fix"></div><div class="grid-header-org"></div></div><div class="grid-body-fix"></div><div class="grid-body"><div class="grid-body-org"></div></div>');
            }
            var elementId = this.element.attr('id');
            if (String.isNullOrWhitespace(elementId)) {
                elementId = 'GRID_' + new Date().getTime() + '_' + Math.random().toString().replace(/\./g, ''); this.element.attr('id', elementId);
            }
            var columnOption = {
                name: '',
                label: '',
				title: '',
                dataType: GridColumn.TYPE_NONE,
                dataFormat: null,
                dataDefault: '',
                width: 100,
                minWidth: null,
                maxWidth: null,
                align: 'center',
                color: null,
                bgcolor: null,
                editType: null,
                useSort: true,
                useResize: true, 
                useEdit: false,
                useEditDefault: false,
                useInsert: false,
                useCheckbox: false,
                isRequired: false,
                isShow: true,
                useMove: true,
                rowMerge: false,
                applyDataWithSelected: false,
                group: '',
				filter:  null,
                buttons: null,
                options: null,
                onClick: null,
                onButtonClick: null,
                onChanged: null
            };
            var columnGroupingOption = {
                name: '',
                label: '',
                isShow: true,
                useMove: true,
                runtimeVisiblity: false
            };
            var columnFilterOption = {
                name: '',
                label: '',
                isInput: true 
            };
            var options = this.options;
            if (options.columns == null) {
                throw new Error(['jQuery.grid', 'columns 옵션을 지정하지 않았습니다.']);
            }
            if (!(options.columns instanceof Array)) {
                throw new Error(['jQuery.grid', 'columns 옵션 타입이 Array가 아닙니다.']);
            }
            	
            var option, i, j, columns = [], columnsGrouping = {},columnsFilter = {}, buttons, selectOptions;
            if (options.columnsGrouping instanceof Array) {
                for (i = 0; i < options.columnsGrouping.length; i++) {
                    option = $.extend({}, columnGroupingOption, options.columnsGrouping[i]);
                    if (option.runtimeVisiblity) {
                        useMove = false;
                    }
                    if (String.isNullOrWhitespace(option.name)) {
                        throw new Error(['jQuery.grid', 'columnsGrouping 옵션에 name 값이 없습니다.']);
                    }
                    columnsGrouping[option.name] = new GridColumnGrouping(option.name, option.label, 0, option.isShow, option.useMove, option.runtimeVisiblity);
                }
            }
            
			if (options.columnsFilter instanceof Array) {
                for (i = 0; i < options.columnsFilter.length; i++) {
                    option = $.extend({}, columnFilterOption, options.columnsFilter[i]);
                     if (String.isNullOrWhitespace(option.name)) {
                        throw new Error(['jQuery.grid', 'columnsFilter 옵션에 name 값이 없습니다.']);
                    }
                    columnsFilter[option.name] = new GridColumnFilter(option.name, option.label, option.isInput );
                }
            }
            for (i = 0; i < options.columns.length; i++) {
                option = $.extend({}, columnOption, options.columns[i]);
                if (String.isNullOrWhitespace(option.name)) {
                    throw new Error(['jQuery.grid', 'column 옵션에 name 값이 없습니다.']);
                }
                if (columnsGrouping.hasOwnProperty(option.group)) {
                    columnsGrouping[option.group].columnCount++;
                }

                buttons = [];
                if (option.buttons && option.buttons.length > 0) {
                    for (j = 0; j < option.buttons.length; j++) {
                        buttons.push(option.buttons[j]);
                    }
                }

                selectOptions = [];
                if (option.options && option.options.length > 0) {
                    for (j = 0; j < option.options.length; j++) {
                        selectOptions.push(option.options[j]);
                    }
                } 
                if(options.columns[i].editType){
	                if(options.columns[i].editType =='useEdit')
	                	option.useEdit = true;
	                else if(options.columns[i].editType =='useEditDefault')
	                	option.useEditDefault = true;
	                else if(options.columns[i].editType =='useCheckbox')
	                	option.useCheckbox = true;
                }; 
                
                if(options.columns[i].useSort ==='true' || options.columns[i].useSort == true ) 
                	option.useSort=true;
                else
                	option.useSort=false; 
                
                if(options.columns[i].useResize  ==='true' || options.columns[i].useResize == true ) 
                	option.useResize=true;
                else
                	option.useResize=false;
                
                if(options.columns[i].isRequired  ==='true' ||  options.columns[i].isRequired == true) 
                	option.isRequired=true;
                else
                	option.isRequired=false;
                
                if(options.columns[i].useMove  ==='true' ||  options.columns[i].useMove == true) 
                	option.useMove=true;
                else
                	option.useMove=false;

                if(options.columns[i].rowMerge  ==='true' ||  options.columns[i].rowMerge == true) 
                	option.rowMerge=true;
                else
                	option.rowMerge=false;
                
                if(options.columns[i].isShow  ==='false' ||  options.columns[i].isShow == false) 
                	option.isShow=false;
                else
                	option.isShow=true;
                
                if(options.columns[i].width ===0 || options.columns[i].width ==='0') option.isShow = false;

				columns.push(new GridColumn(option.name, option.label,option.title, option.dataType, option.dataFormat, option.dataDefault, option.width, option.minWidth || option.width - 50, option.maxWidth || option.width + 100, option.align, option.color, option.bgcolor, option.useSort, option.useResize, option.useEdit, option.useEditDefault, option.useInsert, option.useCheckbox, option.isRequired, option.isShow, option.useMove, option.rowMerge, option.applyDataWithSelected, columnsGrouping[option.group] || null,columnsFilter[option.name] || null, buttons, selectOptions, option.onClick, option.onButtonClick, option.onChanged));
            }

            // 그리드 객체 생성
            var $paging, $pagingSummary;
            if (options.pagingSelector) {
                $paging = $(options.pagingSelector);
            } else {
                $paging = { length: 0 };
            }
            if (options.pagingSummarySelector) {
                $pagingSummary = $(options.pagingSummarySelector);
            } else {
                $pagingSummary = { length: 0 };
            }
            if (isNaN(options.width)) {
                options.width = this.element.width();
            }
            if (isNaN(options.height)) {
                options.height = this.element.height();
            } 

            this.grid = new Grid(this.element, ($paging.length > 0 ? $paging[0] : null), ($pagingSummary.length > 0 ? $pagingSummary[0] : null), columns,  options.columnsFilter, options.columnsSummary, options.columnFixed, options.fitSize, options.width, options.height, options.thHeight, options.tdHeight, options.resizing, options.useSelection, options.useSelectionAll, options.onSort, options.onPaging, options.onClick, options.onRowSelected, options.onAllSelected, options.onRenderComplete);
            this.grid.initialize();

            // 컬럼 설정 플러그인 설정
            var originalColumns = [], originalColumnFixed = this.grid.columnFixed;
            for (var i = 0; i < this.grid.columns.length; i++) {
                originalColumns.push($.extend(true, {}, this.grid.columns[i]));
            }
            this.columnConfigOkDelegate = Function.createDelegate(this, this._onOkColumnConfig);
            this.element.gridColumnConfig({
                title: this.options.title,
                originalColumns: originalColumns,
                originalColumnFixed: originalColumnFixed,
                onOk: this.columnConfigOkDelegate
            });
        },
        _onOkColumnConfig: function (columns, columnFixed) {
            this.grid.columns = columns;
            this.grid.columnFixed = columnFixed;
            this.grid.useFixed = columnFixed > 0;
            // 세로 스크롤 이동
            this.grid.elementBodyFixed.scrollTop(0);
            this.grid.elementBodyWrapper.scrollTop(0);
            // 해더 그리기
            this.grid.renderHead();
            // 데이터 그리기
            this.grid.renderBody();
            // 크기 설정
            this.grid.size();
            // 이벤트 발생
            if (typeof (this.grid.onRenderComplete) === 'function') {
                this.grid.onRenderComplete(this.grid);
            }

            var txtGridName = this.options.name;
            var txtFieldName = [];
            var txtShowFlag = [];
            var txtFixFlag = [];
            for (var i = 0; i < this.grid.columns.length; i++) {
                txtFieldName.push(this.grid.columns[i].name);
                txtShowFlag.push((this.grid.columns[i].grouping ? (this.grid.columns[i].grouping.isShow ? 'Y' : 'N') : (this.grid.columns[i].isShow ? 'Y' : 'N')));
                txtFixFlag.push(i < this.grid.columnFixed ? 'Y' : 'N');
            }
            $.ajax({
                url: URL_ROOT + '/JDAExt/tms/web/common/gridFieldUpdate.ajax',
                data: {
                    txtGridName: txtGridName,
                    txtFieldName: txtFieldName.join(','),
                    txtShowFlag: txtShowFlag.join(','),
                    txtFixFlag: txtFixFlag.join(',')
                },
                success: function (d) {
                    //alert("Success");
                },
                error: function (code, message) {
                    //alert("Failure");
                }
            });
        },
        selectInternal: function (element, event, rowIndex) {
            this.grid.selectInternal(element, event, rowIndex);
        },
        filterSearch: function (records,useFilter) {
            this.grid.filterSearch(records,useFilter);
        },
        filterInternal: function (element,  colName) {
            this.grid.filterInternal(element, colName);
        },
        selectAllInternal: function (element, event) {
            this.grid.selectAllInternal(element, event);
        },
        showGroupingInternal: function (element, event, groupName, isShow) {
            // 그룹 표시 감추기 실행
            this.grid.showGroupingInternal(element, event, groupName, isShow);
        },
        cellClickInternal: function (element, event, rowIndex, columnIndex) {
            // CELL 클릭 실행
            this.grid.cellClickInternal(element, event, rowIndex, columnIndex);
        },
        rowClickInternal: function (element, event, rowIndex, columnIndex) {
            // ROW 클릭 실행
            this.grid.rowClickInternal(element, event, rowIndex, columnIndex);
        },
        cellButtonClickInternal: function (element, event, rowIndex, columnIndex, buttonName) {
            // ROW 버튼 클릭 실행
            this.grid.cellButtonClickInternal(element, event, rowIndex, columnIndex, buttonName);
        },
        cellChangingInternal: function (element, event, rowIndex, columnIndex) {
            // CELL 수정 전 실행
            this.grid.cellChangingInternal(element, event, rowIndex, columnIndex);
        },
        cellBlurInternal: function (element, event, rowIndex, columnIndex) {
            // CELL 포커스 아웃 후 실행
            this.grid.cellBlurInternal(element, event, rowIndex, columnIndex);
        },
        cellChangedInternal: function (element, event, rowIndex, columnIndex) {
            // CELL 수정 후 실행
            this.grid.cellChangedInternal(element, event, rowIndex, columnIndex);
        },
        sortInternal: function (element, event, sort, sortOrder) {
            // Sort 실행
            this.grid.sortInternal(element, event, sort, sortOrder);
        },
        pagingInternal: function (element, event, page) {
            // Paging 실행
            this.grid.pagingInternal(element, event, page);
        },
        setFocus: function (rowIndex, columnIndex) {
            // Focus 이동
            this.grid.setFocus(rowIndex, columnIndex);
        },
        setStyle: function (rowIndex, columnIndex, style, value) {
            // Style 변경
            this.grid.setStyle(rowIndex, columnIndex, style, value);
        },
        setValue: function (rowIndex, columnIndex, value) {
            // 수정중인 데이터 적용
            this.grid.setValue(rowIndex, columnIndex, value);
        },
        setValueByEdit: function (rowIndex, columnIndex, value) {
            // 수정중인 데이터 적용
            this.grid.setValueByEdit(rowIndex, columnIndex, value);
        },
        setValueBySelect: function (rowIndex, columnIndex, options, value) {
            // 수정중인 데이터 적용
            this.grid.setValueBySelect(rowIndex, columnIndex, options, value);
        },
        setLabel: function (columnIndex, value) {
            // Grid Label 수정
            this.grid.setLabel(columnIndex, value);
        },
        showGrouping: function (groupName, isShow) {
            // 그룹으로 설정된 해더 표시/감추기
            this.grid.showGrouping(groupName, isShow);
        },
        resizing: function (value) {
            // Column  Resizing 적용/해제     
		   this.options.resizing = value;
        },
        columnFixedCnt: function () {
            // Column  Resizing 적용/해제     
		   return this.options.columnFixed;
        },
        select: function (rowIndex, triggerEvent) {
            // 로우 선택
            this.grid.select(rowIndex, triggerEvent);
        },
        unselect: function (rowIndex, triggerEvent) {
            // 로우 선택 해제
            this.grid.unselect(rowIndex, triggerEvent);
        },
        applyData: function (dataContext) {
            // 데이터 적용
            this.grid.applyData(dataContext);
        },
        applyFilter: function (dataRecords,filterColumns) {
            // Filter 적용
            this.grid.applyFilter(dataRecords,filterColumns);
        },
        applyChanges: function () {
            // 수정한 데이터 적용
            this.grid.applyChanges();
        },
        clear: function () {
            // 테이터 제거
            this.grid.clear();
        },
        size: function (width, height) {
            // 크기 조정
            this.grid.size(width, height);
        },
        getColumns: function (name) {
            return this.grid.getColumns(name);
        },
        setColumns: function (columns) {
            return this.grid.setColumns(columns);
        },    
        getDataContext: function () {
            return this.grid.getDataContext();
        },
        getFilterColumns: function () {
            return this.grid.getFilterColumns();
        },
        getRows: function (applyChanged) {
            // 전체 Row 가져오기
            return this.grid.getRows(applyChanged);
        },
        getSelectedRows: function (applyChanged) {
            // 선택한 Row 가져오기
            return this.grid.getSelectedRows(applyChanged);
        },
        getInsertedRows: function () {
            // 추가된 Row 가져오기
            return this.grid.getInsertedRows();
        },
        getDeletedRows: function () {
            // 추가된 Row 가져오기
            return this.grid.getDeletedRows();
        },
        getChangedRows: function (onlySelected) {
            // 수정된 Row 가져오기
            return this.grid.getChangedRows(onlySelected);
        },
        findInput: function (rowIndex, columnIndex) {
            var columns = this.grid.columns;
            if (typeof(columnIndex === 'string')) {
                for (var i = 0; i < columns.length; i++) {
                    if (columns[i].name == columnIndex) {
                        columnIndex = i;
                    }
                }
            }

            return $('#' + GridColumn.genIdTDINPUT(this.grid.elementId, rowIndex, columnIndex));
        },
        
        getValue: function (rowIndex, columnIndex) { 
            var column = this.grid.columns[columnIndex]  ;
            var colValue = mDataSet[this.grid.elementId].getNameValue(rowIndex,column.name); 
            return colValue;
        }, 
        findSelect: function (rowIndex, columnIndex) {
            var columns = this.grid.columns;
            if (typeof (columnIndex === 'string')) {
                for (var i = 0; i < columns.length; i++) {
                    if (columns[i].name == columnIndex) {
                        columnIndex = i;
                    }
                }
            }
            return $('#' + GridColumn.genIdTDSELECT(this.grid.elementId, rowIndex, columnIndex));
        },
        validRows: function (onlySelected) {
            return this.grid.validRows(onlySelected);
        },
        insertRow: function (record) {
            return this.grid.insertRow(record);
        },
        deleteRow: function (rowIndex, useFlag) {
            return this.grid.deleteRow(rowIndex, useFlag);
        },
        configColumns: function () {
            this.element.gridColumnConfig('open', this.grid.columns, this.grid.columnFixed);
        },
        updateColumns: function (fields) {
            if (!fields || fields.length == 0) {
                return;
            }
            var i, j;
            var columns = this.grid.columns;
            var newColumns = [];
            var newColumnFixed = 0;
            var newColumnsIndex = [];
            for (i = 0; i < fields.length; i++) {
                for (j = 0; j < columns.length; j++) {
                    if (columns[j].name == fields[i].fieldName) {
                        if (columns[j].grouping) {
                            columns[j].grouping.isShow = (fields[i].showFlag == 'Y');
                        } else {
                            columns[j].isShow = (fields[i].showFlag == 'Y');
                        }
                        newColumns.push(columns[j]);
                        newColumnsIndex.push(j);
                        if (fields[i].fixFlag == 'Y') {
                            newColumnFixed++;
                        }
                        break;
                    }
                }
            }
            var existColumnsIndex = [];
            for (i = 0; i < columns.length; i++) {
                existColumnsIndex.push(i);
            }
            var notColumnsIndex = [];
            for (i = 0; i < existColumnsIndex.length; i++) {
                var contains = false;
                for (j = 0; j < newColumnsIndex.length; j++) {
                    if (existColumnsIndex[i] == newColumnsIndex[j]) {
                        contains = true;
                    }
                }
                if (!contains) {
                    notColumnsIndex.push(i);
                }
            }
            for (i = 0; i < notColumnsIndex.length; i++) {
            	if (columns[notColumnsIndex[i]].grouping) {
            		var x = 0;
            		for (j = 0; j < newColumns.length; j++) {
            			if (newColumns[j].grouping && newColumns[j].grouping.name == columns[notColumnsIndex[i]].grouping.name) {
            				x = j;
            			}
            		}
            		if (x > 0) {
            			newColumns.splice(x + 1, 0, columns[notColumnsIndex[i]]);
            			if (x <= newColumnFixed) {
            				newColumnFixed = x + 2;
            			}
            		}
            	} else {
	                columns[notColumnsIndex[i]].isShow = false;
	                newColumns.push(columns[notColumnsIndex[i]]);
            	}
            }
            this.grid.columns = newColumns;
            this.grid.columnFixed = newColumnFixed;
            this.grid.useFixed = this.grid.columnFixed > 0;
            this.element.gridColumnConfig('option', 'originalColumns', newColumns);
            this.element.gridColumnConfig('option', 'originalColumnFixed', newColumnFixed);
        },
        destroy: function () {
            this.element.gridColumnConfig('destroy');
            this.grid.dispose();
            this.element[0].innerHTML = '';
            $.Widget.prototype.destroy.call(this);
        }
    });

    $.widget("ui.gridColumnConfig", {
        options: {
            title: 'Grid column configuration',
            onOk: null,
            originalColumns: [],
            originalColumnFixed: 0
        },
        _create: function () {
            this.elementPlusClickDelegate = Function.createDelegate(this, this._onPlusClick);
            this.elementLockClickDelegate = Function.createDelegate(this, this._onLockClick);
            this.elementMinusClickDelegate = Function.createDelegate(this, this._onMinusClick);
            this.elementOkClickDelegate = Function.createDelegate(this, this._onOkClick);
            this.elementCancelClickDelegate = Function.createDelegate(this, this._onCancelClick);
            this.elementResetClickDelegate = Function.createDelegate(this, this._onResetClick);
            this.elementSortableStop = Function.createDelegate(this, this._onSortableStop);

            this.elementRoot = $('<div class="ux-grid-column-config"></div>');
            this.elementEnabled = $('<div class="ux-grid-column-enabled"></div>');
            this.elementEnabledWrap = $('<div></div>');
            this.elementEnabledList = $('<ul></ul>');
            this.elementDisabled = $('<div class="ux-grid-column-disabled"></div>');
            this.elementDisabledWrap = $('<div></div>');
            this.elementDisabledList = $('<ul></ul>');
            this.elementButtons = $('<div class="ux-grid-column-buttons ux-layer-button"></div>');
            this.elementButtonOk = $('<a class="ux-btn-point"><span>' + Globalize.localize('button_ok') + '</span></a>');
            this.elementButtonCancel = $('<a class="ux-btn-layer"><span>' + Globalize.localize('button_cancel') + '</span></a>');
            this.elementButtonReset = $('<a class="ux-btn-layer"><span>' + Globalize.localize('button_reset') + '</span></a>');
            this.elementRoot
                .append(this.elementDisabled
                    .append('<h3>' + Globalize.localize('label_hideColumns') + '</h3>')
                    .append(this.elementDisabledWrap
                        .append(this.elementDisabledList)))
                .append(this.elementEnabled
                    .append('<h3>' + Globalize.localize('label_showColumns') + '</h3>')
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
                        .click(this.elementCancelClickDelegate))
                    .append(this.elementButtonReset
                        .click(this.elementResetClickDelegate)))
                .popup({
                    title: this.options.title
                });

            this.hideColumns = [];
        },
        _render: function () {
            var column, columnGrouping = {}, columns = this.columns, columnFixed = this.columnFixed;
            this.elementEnabledList.children('li').remove().empty();
            this.elementDisabledList.children('li').remove().empty();
            if (arguments.length == 0) {
                var self = this;
                setTimeout(function () {
                    self._render(true);
                }, 100);
                return;
            }
            this.hideColumns.length = 0;
            for (var columnIndex = 0; columnIndex < columns.length; columnIndex++) {
                column = columns[columnIndex];
                if (column.grouping) {
                    if (column.grouping.runtimeVisiblity) {
                        this.columnsRuntimeVisiblity.push(column);
                        this.columnFixed--;
                        continue;
                    }
                    if (!column.grouping.useMove) {
                        this.columnsCannotMove.push(column);
                        continue;
                    }
                    if (!columnGrouping[column.grouping.name]) {
                        columnGrouping[column.grouping.name] = true;
                        if (column.grouping.isShow) {
                            this.elementEnabledList.append(
                                $('<li>')
                                    .append($('<span class="' + (columnIndex < columnFixed ? '' : 'ui-state-disabled ') + 'ui-icon ui-icon-locked"></span>').click(this.elementLockClickDelegate))
                                    .append($('<span class="ui-icon ui-icon-arrowthick-1-w"></span>').click(this.elementMinusClickDelegate))
                                    .append($('<span class="label">' + column.grouping.label.replace(/\<br \/\>/g, ' ') + '</span>'))
                                    .data(column));
                        } else {
                            this.hideColumns.push(column);
                        }
                    }
                } else {
                    if (!column.useMove) {
                        this.columnsCannotMove.push(column);
                        continue;
                    }
                    if (column.isShow) {
                        this.elementEnabledList.append(
                                $('<li>')
                                    .append($('<span class="' + (columnIndex < columnFixed ? '' : 'ui-state-disabled ') + 'ui-icon ui-icon-locked"></span>').click(this.elementLockClickDelegate))
                                    .append($('<span class="ui-icon ui-icon-arrowthick-1-w"></span>').click(this.elementMinusClickDelegate))
                                    .append($('<span class="label">' + column.label.replace(/\<br \/\>/g, ' ') + '</span>'))
                                    .data(column));
                    } else {
                        this.hideColumns.push(column);
                    }
                }
            }
            this.hideColumns.sort(function (a, b) {
                var alabel = a.grouping ? a.grouping.label : a.label;
                var blabel = b.grouping ? b.grouping.label : b.label;
                if (alabel < blabel) {
                    return -1;
                }
                if (alabel > blabel) {
                    return 1;
                }
                return 0;
            });
            this.elementDisabledList.empty();
            for (var i = 0; i < this.hideColumns.length; i++) {
                var column = this.hideColumns[i];
                if (column.grouping) {
                    this.elementDisabledList.append(
                            $('<li>')
                                .append($('<span class="ui-icon ui-icon-arrowthick-1-e"></span>').click(this.elementPlusClickDelegate))
                                .append($('<span class="label">' + column.grouping.label.replace(/\<br \/\>/g, ' ') + '</span>'))
                                .data(column));
                } else {
                    this.elementDisabledList.append(
                            $('<li>')
                                .append($('<span class="ui-icon ui-icon-arrowthick-1-e"></span>').click(this.elementPlusClickDelegate))
                                .append($('<span class="label">' + column.label.replace(/\<br \/\>/g, ' ') + '</span>'))
                                .data(column));
                }
            }
        },
        _onLockClick: function (event) {
            var li = $(event.target).parent('li');
            var column = li.data();
            var columnFixed = 0;
            if (column.grouping) {
                columnFixed += column.grouping.columnCount;
            } else {
                columnFixed++;
            }
            li.prevAll('li').each(function (index, element) {
                column = $(element).data();
                if (column.grouping) {
                    columnFixed += column.grouping.columnCount;
                } else {
                    columnFixed++;
                }
            });
            this.columnFixed = columnFixed;

            var self = this;
            columnFixed = 0;
            this.elementEnabledList.children('li').each(function (index, element) {
                column = $(element).data();
                if (column.grouping) {
                    columnFixed += column.grouping.columnCount;
                } else {
                    columnFixed++;
                }
                if (columnFixed <= self.columnFixed) {
                    $(element).find('.ui-icon-locked').removeClass('ui-state-disabled');
                } else {
                    $(element).find('.ui-icon-locked').addClass('ui-state-disabled');
                }
            });
        },
        _onPlusClick: function (event) {
            var li = $(event.target).parent('li');
            var column = li.data();
            if (column.grouping) {
                this.elementEnabledList.append(
                                $('<li>')
                                    .append($('<span class="ui-state-disabled ui-icon ui-icon-locked"></span>').click(this.elementLockClickDelegate))
                                    .append($('<span class="ui-icon ui-icon-arrowthick-1-w"></span>').click(this.elementMinusClickDelegate))
                                    .append($('<span class="label">' + column.grouping.label.replace(/\<br \/\>/g, ' ') + '</span>'))
                                    .data(column));
            } else {
                this.elementEnabledList.append(
                                $('<li>')
                                    .append($('<span class="ui-state-disabled ui-icon ui-icon-locked"></span>').click(this.elementLockClickDelegate))
                                    .append($('<span class="ui-icon ui-icon-arrowthick-1-w"></span>').click(this.elementMinusClickDelegate))
                                    .append($('<span class="label">' + column.label.replace(/\<br \/\>/g, ' ') + '</span>'))
                                    .data(column));
            }
            li.remove().empty();

            for (var i = 0; i < this.hideColumns.length; i++) {
                if (column.name == this.hideColumns[i].name) {
                    this.hideColumns.splice(i, 1);
                    return;
                }
            }

            this.columnFixed = 0;
            this.elementEnabledList.children('li').each(function (index, element) {
                $(element).find('.ui-icon-locked').addClass('ui-state-disabled');
            });
        },
        _onMinusClick: function (event) {
            var li = $(event.target).parent('li');
            var column = li.data();
            li.remove().empty();

            this.columnFixed = 0;
            this.elementEnabledList.children('li').each(function (index, element) {
                $(element).find('.ui-icon-locked').addClass('ui-state-disabled');
            });

            this.hideColumns.push(column);
            this.hideColumns.sort(function (a, b) {
                var alabel = a.grouping ? a.grouping.label : a.label;
                var blabel = b.grouping ? b.grouping.label : b.label;
                if (alabel < blabel) {
                    return -1;
                }
                if (alabel > blabel) {
                    return 1;
                }
                return 0;
            });
            this.elementDisabledList.empty();
            for (var i = 0; i < this.hideColumns.length; i++) {
                var column = this.hideColumns[i];
                if (column.grouping) {
                    this.elementDisabledList.append(
                            $('<li>')
                                .append($('<span class="ui-icon ui-icon-arrowthick-1-e"></span>').click(this.elementPlusClickDelegate))
                                .append($('<span class="label">' + column.grouping.label.replace(/\<br \/\>/g, ' ') + '</span>'))
                                .data(column));
                } else {
                    this.elementDisabledList.append(
                            $('<li>')
                                .append($('<span class="ui-icon ui-icon-arrowthick-1-e"></span>').click(this.elementPlusClickDelegate))
                                .append($('<span class="label">' + column.label.replace(/\<br \/\>/g, ' ') + '</span>'))
                                .data(column));
                }

            }
        },
        _onSortableStop: function () {
            this.columnFixed = 0;
            this.elementEnabledList.children('li').each(function (index, element) {
                $(element).find('.ui-icon-locked').addClass('ui-state-disabled');
            });
        },
        _onOkClick: function () {
            var column, columnGrouping = {}, columns = this.columns, columnFixed = this.columnFixed, copyedColumns = Array.clone(columns), i, j;
            columns.length = 0;
            for (i = 0; i < this.columnsRuntimeVisiblity.length; i++) {
                columns.push(this.columnsRuntimeVisiblity[i]);
                columnFixed++;
            }
            for (i = 0; i < this.columnsCannotMove.length; i++) {
                columns.push(this.columnsCannotMove[i]);
                if (columnFixed > 0) {
                    columnFixed++;
                }
            }
            this.elementEnabledList.children('li').each(function (index, element) {
                column = $(element).data();
                if (column.grouping) {
                    column.grouping.isShow = true;
                    for (i = 0; i < copyedColumns.length; i++) {
                        if (copyedColumns[i].grouping && copyedColumns[i].grouping.name == column.grouping.name) {
                            copyedColumns[i].grouping = column.grouping;
                            columns.push(copyedColumns[i]);
                        }
                    }
                } else {
                    column.isShow = true;
                    columns.push(column);
                }
            });
            this.elementDisabledList.children('li').each(function (index, element) {
                column = $(element).data();
                if (column.grouping) {
                    column.grouping.isShow = false;
                    for (i = 0; i < copyedColumns.length; i++) {
                        if (copyedColumns[i].grouping && copyedColumns[i].grouping.name == column.grouping.name) {
                            copyedColumns[i].grouping = column.grouping;
                            columns.push(copyedColumns[i]);
                        }
                    }
                } else {
                    column.isShow = false;
                    columns.push(column);
                }
            });

            for (i = 0; i < columns.length; i++) {
                for (j = 0; j < copyedColumns.length; j++) {
                    if (columns[i].name == copyedColumns[j].name) {
                        if (copyedColumns[j].hasButtons) {
                            columns[i].hasButtons = true;
                            columns[i].buttons = copyedColumns[j].buttons;
                        }
                        if (copyedColumns[j].hasOptions) {
                            columns[i].hasOptions = true;
                            columns[i].options = copyedColumns[j].options;
                        }
                        break;
                    }
                }
            }

            if (typeof (this.options.onOk) === 'function') {
                this.options.onOk(columns, columnFixed);
            }

            this.elementRoot.popup('close');
        },
        _onCancelClick: function () {
            this.elementRoot.popup('close');
        },
        _onResetClick: function () {
            var columns = [];
            var columnFixed = this.options.originalColumnFixed;
            for (var i = 0; i < this.options.originalColumns.length; i++) {
                columns.push($.extend(true, {}, this.options.originalColumns[i]));
            }
            this.open(columns, columnFixed);
        },
        open: function (columns, columnFixed) {
            this.columns = columns;
            this.columnFixed = columnFixed;
            this.columnsRuntimeVisiblity = [];
            this.columnsCannotMove = [];
            this._render();

            this.elementRoot.popup('open');
        },
        destroy: function () {
            $.Widget.prototype.destroy.call(this);
        }
    });

    $.widget('ui.girdColumnSplitter', $.ui.mouse, {
        _create: function () {
            this._mouseInit();

            var columnIndex = this.element.attr('columnIndex');
            if (columnIndex) {
                this.columnIndex = parseInt(columnIndex);
                this.column = this.options.grid.columns[this.columnIndex];

                var self = this;
                this.element.mousemove(function (event) {
                    var offset = self.element.offset();
                    var width = self.element.width();
                    if (event.pageX - offset.left > width - 4) {
                        self.element.css('cursor', 'col-resize');
                    } else {
                        self.element.css('cursor', 'default');
                    }
                });
            }
        },
        _mouseStart: function (event) {
            if (!this.column) {
                return;
            } 
            var offset = this.element.offset();
            var width = this.element.width();
            //
            if (event.pageX - offset.left < width - 4) {
                return true;
            }  
            // 상태 변경 
           this.options.grid.resizing = true;
            // 컬럼 크기
            this.columnWidth = this.column.width;
            // 시작 위치
            this.currentX = event.pageX;
            // 
            $.ui.girdColumnSplitter.virtual.element.height(this.element.height()).css({
                top: offset.top + 'px',
                left: (offset.left + width - 4) + 'px'
            }).appendTo(document.body);
        },
        _mouseDrag: function (event) {
            if (!this.options.grid.resizing) {
                return;
            }
	        var currentX = event.pageX;
            if (this.columnWidth - (this.currentX - currentX) < this.column.minWidth/* ||
                this.columnWidth - (this.currentX - currentX) > this.column.maxWidth 최대값 제한 없음*/) {
                return;
            }
            this.columnWidth -= this.currentX - currentX;
            $.ui.girdColumnSplitter.virtual.element.css('left', (parseInt($.ui.girdColumnSplitter.virtual.element.css('left')) - (this.currentX - currentX)) + 'px');
            this.currentX = currentX;
        },
        _mouseStop: function (event) {
			try{
				if (!this.options.grid.resizing) {
					return;
				}
				this.column.width = this.columnWidth;

				var grid = this.options.grid;
				var colTH = $('#' + GridColumn.genIdTHCOL(grid.elementId, this.columnIndex));
				var colTD = $('#' + GridColumn.genIdTDCOL(grid.elementId, this.columnIndex));
				
				if (colTH.length > 0) {
					colTH[0].width = this.column.width;
				}
				if (colTD.length > 0) {
					colTD[0].width = this.column.width;
				}
				grid.size(grid.width, grid.height);
				for (var i = 0; i < grid.dataContext.records.length; i++) {
					$('#' + GridColumn.genIdTDINPUT(grid.elementId, i, this.columnIndex)).width(this.column.width - 6);
					$('#' + GridColumn.genIdTDSELECT(grid.elementId, i, this.columnIndex)).selectbox('option', 'width', this.column.width - 6);
				}

				// 상태 변경
				
				var timeoutID = setTimeout(function () {
					delete timeoutID;
					grid.resizing = false;
				}, 100);
			}catch (e) {
				
			}
            //

            $.ui.girdColumnSplitter.virtual.element.remove();
        },
        _mouseCapture: function (event) {
            if (!this.column) {
                return false;
            }
            return true;
        },
        destroy: function () {
            $.Widget.prototype.destroy.call(this);
        }
    });
    var GridSplitterUI = function () {
        this.element = $('<div></div>').width(4).css({
            position: 'absolute',
            backgroundColor: '#eee',
            zIndex: 1000
        });
    };
    $.ui.girdColumnSplitter.virtual = new GridSplitterUI();

    $.widget('ui.girdColumnSortter', {
        options: {
            grid: null
        },
        _create: function () {
            var columnIndex = this.element.attr('columnIndex');
            if (columnIndex) {
                this.columnIndex = parseInt(columnIndex);
                this.column = this.options.grid.columns[this.columnIndex];
                this.mouseOverDelegate = Function.createDelegate(this, this._onMouseOver);
                this.mouseOutDelegate = Function.createDelegate(this, this._onMouseOut);
                this.element.mouseover(this.mouseOverDelegate);
                this.element.mouseout(this.mouseOutDelegate);
            }
        },
        _onMouseOver: function (event) {
            var offset = this.element.offset();
            var width = this.element.width();
            $.ui.girdColumnSortter.virtual.grid = this.options.grid;
            $.ui.girdColumnSortter.virtual.column = this.column;
            $.ui.girdColumnSortter.virtual.visible = true;

            var parentOffset = this.options.grid.element.offset();
            var parentWidth = this.options.grid.element.width();
            if (offset.left + width + 7 < parentOffset.left + parentWidth) {
                $.ui.girdColumnSortter.virtual.element.height(this.element.height() - 10).css({
                    top: (offset.top + 4) + 'px',
                    left: (offset.left + width - 12) + 'px'
                }).appendTo(document.body);
            }
        },
        _onMouseOut: function (event) {
            $.ui.girdColumnSortter.virtual.visible = false;
            setTimeout(function () {
                if ($.ui.girdColumnSortter.virtual.visible == false) {
                    $.ui.girdColumnSortter.virtual.element.detach();
                }
            }, 100);
        },
        destroy: function () {
            $.Widget.prototype.destroy.call(this);
        }
    });
    var GridSortUI = function () {
        this.grid = null;
        this.column = null;
        this.columnIndex = 0;
        this.visible = true;
        this.elemntAscDelegate = Function.createDelegate(this, this._clickASC);
        this.elemntDescDelegate = Function.createDelegate(this, this._clickDESC);
        this.elemntOverDelegate = Function.createDelegate(this, this._mouseOver);
        this.elemntOutDelegate = Function.createDelegate(this, this._mouseOut);
        this.element = $('<div></div>').width(10).height(16).css({
            position: 'absolute',
            zIndex: 900,
            c: '#e5e5e5'
        })
            .append($('<a href="#" class="ux-sort-asc"></a>').click(this.elemntAscDelegate)).append($('<a href="#" class="ux-sort-desc"></a>').click(this.elemntDescDelegate))
            .mouseover(this.elemntOverDelegate)
            .mouseout(this.elemntOutDelegate);
    };
    GridSortUI.prototype = {
        _mouseOver: function (event) {
            this.visible = true;
        },
        _mouseOut: function (event) {
            var self = this;
            self.visible = false;
            setTimeout(function () {
                if (self.visible == false) {
                    self.element.detach();
                }
            }, 100);
        },
        _clickASC: function (event) {
            this.grid.sortInternal(this.grid, event, this.column.name, 'asc');
            event.preventDefault();
        },
        _clickDESC: function (event) {
            this.grid.sortInternal(this.grid, event, this.column.name, 'desc');
            event.preventDefault();
        }
    };
    $.ui.girdColumnSortter.virtual = new GridSortUI();
})(jQuery);


/*!
 * 공통 처리.
 * - 메뉴 감추기/보이기
 * - Enter preventDefault
 * -----------------------------------------------------------------------
 * Yeongseok, Yoon
 * -----------------------------------------------------------------------
 */
$(document).ready(function () {
    var isOpen = false;
    $('.ux-btn-lnb-close').click(function () {
        (function tmuiToggleNavarea(doc, frameId, frameName, colWidth, toggleButtonName, buttonSrc1, button1txt, buttonSrc2, button2txt) {
            if (doc.layers)
                return;

            var item = doc.getElementById(frameId);
            if (item != null) {
                var navbutton = document.getElementById(toggleButtonName);
                if (navbutton != null) {
                    if (navbutton.src.indexOf(buttonSrc1) > -1) {
                        navbutton.src = buttonSrc2;
                        navbutton.alt = button2txt;
                        isNavPadOpen = 1;
                    } else {
                        navbutton.src = buttonSrc1;
                        navbutton.alt = button1txt;
                        isNavPadOpen = 0;
                    }
                }
                if (item.tagName == "IFRAME" || item.tagName == "DIV") {
                    if (item.style.display == "none") {
                        item.style.display = ""; item.style.visibility = "visible";
                    } else {
                        item.style.display = "none";
                    }
                } else if (item.tagName == "FRAME") {
                    var colarray = item.parentElement.cols.split(",");
                    var result = "";
                    for (var i = 0, j = item.parentElement.children.length; i < j; i++) {
                        if (item.parentElement.children[i].name == frameName) {
                            if (item.style.display == "none") {
                                item.style.display = ""; item.style.visibility = "visible"; colarray[i] = colWidth;
                            } else {
                                item.style.display = "none"; colarray[i] = 0;
                            }
                        }
                        if (i > 0)
                            result += ","; result += colarray[i];
                    }
                    item.parentElement.cols = result;
                }
            }
        })(window.top.i2ui_shell_content.document, 'navFrame', 'nav', 165, 'EMPTY');

        if (isOpen) {
            isOpen = false;
            $(this).removeClass('ux-btn-lnb-open').addClass('ux-btn-lnb-close');
        } else {
            isOpen = true;
            $(this).removeClass('ux-btn-lnb-close').addClass('ux-btn-lnb-open');
        }
    });

    $('input').live('keydown', function (event) {
        if (event.keyCode == 13) {
            event.preventDefault();
        }
    });
});

/*!
 * GTMS - __AUTHORITY
 * -----------------------------------------------------------------------
 * Yeongseok, Yoon
 * -----------------------------------------------------------------------
 */
__AUTHORITY = {};
__AUTHORITY.initialize = function (authorityString, subsidiaryString, userDivision, userGroup) {
    var authority = JSON.parse(authorityString.trim());
    var subsidiary = (subsidiaryString ? subsidiaryString.split(',') : []);
    for (var i = 0; i < authority.length; i++) {
        this[authority[i].functionId] = (authority[i].useFlag == 'Y');
        this.userId = authority[i].userId;
    }
    this.userGroup = Object.nullToEmpty(userGroup);
    this.userDivision = Object.nullToEmpty(userDivision);
    this.subsidiary = subsidiary;
    this.hasSubsidiary = function (value) {
        if (this.subsidiary.length == 0) {
            return true;
        }

        for (var i = 0; i < this.subsidiary.length; i++) {
            if (this.subsidiary[i] === value) {
                return true;
            }
        }
        return false;
    };
    this.showPrice = function() {
    	return (this.userDivision.length == 0 || (this.userGroup.toUpperCase() != 'OUTSOURCING' && !('LG' + this.userGroup.toUpperCase()).startsWith(this.userDivision + 'PO')));
    };
};

/*!
 *  Multi Grid & Data Handling 
 * -----------------------------------------------------------------------
 * Byeong Jin, Jeong
 * -----------------------------------------------------------------------
 */
// multi DataSet 선언
var mDataSet = {};
mDataSet.newDataSet = function(pId, pField) {
	var fields = [];
	var vField = null;
	for(var intI = 0, len = pField.length; intI < len; intI++) {
		vField = new String( pField[intI] ).split(":");
		if(vField.length == 2) {
			fields[intI] = {id: vField[0], type: vField[1]};
		} else
			fields[intI] = {id: vField[0], type: "string"};
	} 
	var tempDataSet = new DU.data.LJsonDataSet({
		id: pId
		, fields: fields
	});

	mDataSet[pId] = tempDataSet;
	return tempDataSet;
};
// Multi Grid 선언 
var mGrid = {};
mGrid.newGrid = function(pId) {
    var option = { 
		rowIndex:null, // click 된 현재 row
		colIndex:null, // click 된 현재 col
		records:[]
    };	
    mGrid[pId] = option;
	return option;  
}
var setGridDataSet = function(pId) { 
	var	grid_column = $("#"+pId).grid('getColumns');
	var data_set = [];
	for(iqx=0;iqx<grid_column.length;iqx++){
		if( grid_column[iqx].dataType ==undefined || grid_column[iqx].dataType =='none'  ) 
			data_set.push(grid_column[iqx].name+":string") ;
		else
			data_set.push(grid_column[iqx].name+":"+grid_column[iqx].dataType);
  	}
  	mDataSet.newDataSet(pId,data_set);
}; 

//filter 그리드 데이터
var _filterGridData = {
    page: 0,
    pageSize: 100,
    pageTotal: 0,
    recordTotal: 0,
    records: [],
    sort: '',
    sortOrder: ''
}; 
var  filterReset = function(grid){
	var columns = grid.filterColumns;
	
	for(iix=0;iix< columns.length;iix++){ 
		if(columns[iix].isInput)
			$('#filter_'+grid.elementId+'_'+columns[iix].name).val('');
		else{ 
		    $('#filter_'+grid.elementId+'_'+columns[iix].name).selectWithCheckbox('reset'); 
		} 
	}
};
var  filterSearch = function(grid,page){ 
	var records = mGrid[grid.elementId].records; 
	var columns = grid.filterColumns;
	var filterData = [];
	var column ; 
	for(iix=0;iix< columns.length;iix++){ 
		var checkedRec= $('#filter_'+grid.elementId+'_'+columns[iix].name).val();
		for(ikx=0;ikx<grid.columns.length;ikx++){
			if(grid.columns[ikx].name == columns[iix].name){
				column = grid.columns[ikx];
				break;
			} 			
		}	
		if(checkedRec !=null && checkedRec !=''){ 
			filterData = filter(records,checkedRec,columns[iix],column); 
			records = filterData;
		} else{
			filterData = records;
		}
	} 
	_filterGridData.records=filterData;  
	_filterGridData.page = page;
	_filterGridData.pageSize = $('#'+grid.elementId).grid('getDataContext').pageSize; 
	_filterGridData.pageTotal = filterData.length/$('#'+grid.elementId).grid('getDataContext').pageSize; 
	_filterGridData.recordTotal = filterData.length; 
	$("#"+grid.elementId).grid('applyData', _filterGridData);  
};

var filter =function(sourceRec,checkRec,filterColumn,column ){  
	var filterData = [];   
	for(idx=0;idx<sourceRec.length;idx++){ 
		if(checkRec instanceof Array){
			for(ijx=0;ijx<checkRec.length;ijx++){
				if(filterColumn.isInput){
					if(column.format(sourceRec[idx][filterColumn.name]).toLowerCase().indexOf(checkRec[ijx].toLowerCase())>-1 ){
						sourceRec[idx].rowIndex = idx;
						filterData.push(sourceRec[idx]);
					}
				}else{
					if(column.format(sourceRec[idx][filterColumn.name]).toLowerCase() == checkRec[ijx].toLowerCase()){
						sourceRec[idx].rowIndex = idx;
						filterData.push(sourceRec[idx]);
					}
				}
			} 
		}else{
			if(filterColumn.isInput){
				if(column.format(sourceRec[idx][filterColumn.name]).toLowerCase().indexOf(checkRec.toLowerCase())>-1){
					sourceRec[idx].rowIndex = idx;
					filterData.push(sourceRec[idx]);
				}
			}else{	
				if(column.format(sourceRec[idx][filterColumn.name]).toLowerCase() == checkRec.toLowerCase()){
					sourceRec[idx].rowIndex = idx;
					filterData.push(sourceRec[idx]);
				}
			}	
		}
	} 
	return filterData;
}; 

var maskDateCheck = function(dateStr) {  
	var mask = dateStr.replace(/y|M|d|H|m|s/g, '9') ; 
	return mask;
};

(function ($, undefined) {
    // 달력 플러그인 - 두개의 달력을 표시하여 시작/종료일을 선택할 수 있다.
    //$.monthPickerFromTo = {
	$.widget('ui.monthpickerFromTo', {    		       	
		options: {
            to: null,
            onOpen: null,
            onOk: null,
            format: null
        },
        _create: function () {
       		var elementId = this.element.attr('id');
            if (String.isNullOrWhitespace(elementId)) {
                elementId = 'monthpickerFROMTO_' + Math.random().toString().replace(/\./g, ''); this.element.attr('id', elementId);
            }
            
           	this._isOpen = false;
           	//---------------함수 바인드---------------
            this.elementInputFocusDelegate = Function.createDelegate(this, this._onFoucsInput);
            this.elementInputFromKeyupDelegate = Function.createDelegate(this, this._onKeyupInputFrom);
            this.elementInputToKeyupDelegate = Function.createDelegate(this, this._onKeyupInputTo);
            this.elementMonthpickerSelectDelegate = Function.createDelegate(this, this._onMonthpickerSelect);
            this.elementButtonOKClickDelegate = Function.createDelegate(this, this._onClickOk);
            this.elementButtonCancelClickDelegate = Function.createDelegate(this, this._onClickCancel);
            this.elementSelectMonthDelegate = Function.createDelegate(this, this._onMonthpickerSelect);
            this.elementClickYearPlusDelegate = Function.createDelegate(this, this._nextYear);
            this.elementClickYearMinusDelegate = Function.createDelegate(this, this._prevYear);

            //---------------달력 영역 공통 Element (from, to 달력 상위 div)---------------
            this.elementFrom = this.element;
            this.elementFrom.focus(this.elementInputFocusDelegate).keyup(this.elementInputFromKeyupDelegate);
            this.maskFormat = (this.options.format).replace('yyyy','9999').replace('MM','99');
            this.elementFrom.mask(this.maskFormat);
            this.elementTo = $(this.options.to);
            this.elementTo.focus(this.elementInputFocusDelegate).keyup(this.elementInputToKeyupDelegate);
            this.elementMonthpickerFrom = $('<div class="ux-datepickerFromTo-from"></div>');
            this.elementMonthpickerTo = $('<div class="ux-datepickerFromTo-to"></div>');
            
			//---------------초기 년,월 (from, to 모두) 셋팅---------------
            this.yearDataFrom = this.elementFrom.val().substring(0,4);	//from 달력 year
            this.monthDataFrom = new Date().getMonth()+1;				//from 달력 month
            if(this.options.to !=null){ 
	            this.yearDataTo = this.elementTo.val().substring(0,4);		//to 달력 year
	            this.monthDataTo = new Date().getMonth()+1;					//to 달력 month
            }
            
            //--------------------그리기 element정의(1~12월 그리기): From--------------------
            this.elementInlineFrom = $('<div class="ui-datepicker-inline ui-datepicker ui-widget ui-widget-content ui-helper-clearfix ui-corner-all" style="display: block;"></div>');
            this.elementPickerHeaderFrom = $('<div class="ui-datepicker-header ui-widget-header ui-helper-clearfix ui-corner-all"></div>');
            this.elementPrevFrom = $('<a title="Prev" id="prevYearFrom" class="ui-datepicker-prev ui-corner-all" ></a>');
            this.elementAngleWFrom = $('<span class="ui-icon ui-icon-circle-triangle-w"></span>');
            this.elementNextFrom = $('<a title="Next" id="nextYearFrom" class="ui-datepicker-next ui-corner-all" ></a>');
            this.elementAngleEFrom = $('<span class="ui-icon ui-icon-circle-triangle-e"></span>');
            this.elementPickerTitleFrom = $('<div class="ui-datepicker-title">'+this.yearDataFrom+'</div>');
            this.elementYearFrom = $('<span class="ui-datepicker-year"></span>');
            this.elementTableFrom = $('<table class="ui-datepicker-calendar" sizset="0" ></table>');
            this.elementTbodyFrom = $('<tbody sizset="0"></tbody>');
            this.elementTr1From = $('<tr sizset="0"></tr>');
            this.elementTr2From = $('<tr sizset="0"></tr>');
            this.elementTr3From = $('<tr sizset="0"></tr>');
            
            this.elementPrevFrom.click(this.elementClickYearMinusDelegate);	//이전 해 이동 함수 바인드(From달력)
            this.elementNextFrom.click(this.elementClickYearPlusDelegate);	//다음 해 이동 함수 바인드(To달력)

            //-----------------TR, TD로 1~12 영역 만들기: From 
            for(var i=1; i<=4; i++){
            	this.elementTr1From.append(
            		$('<td class=" " tdGubun="from" data-month="'+i+'" width="20" ><a class="ui-state-default" href="#">'+i+'</a></td>').click(this.elementSelectMonthDelegate)
            	)
            }
            for(var i=5; i<=8; i++){
            	this.elementTr2From.append(
            		$('<td class=" " tdGubun="from" data-month="'+i+'" width="20" ><a class="ui-state-default" href="#">'+i+'</a></td>').click(this.elementSelectMonthDelegate)
            	)
            }
            for(var i=9; i<=12; i++){
            	this.elementTr3From.append(
            		$('<td class=" " tdGubun="from" data-month="'+i+'" width="20"><a class="ui-state-default" href="#">'+i+'</a></td>').click(this.elementSelectMonthDelegate)
            	)
            }
            
            //---------------정의된 Element로 From달력 이미지 만들기-----------------
            this.elementCalendarDataFrom = this.elementInlineFrom.append(this.elementPickerHeaderFrom
																		.append(this.elementPrevFrom
																				.append(this.elementAngleWFrom))
																		.append(this.elementPickerTitleFrom
																				.append(this.elementYearFrom))
																		.append(this.elementNextFrom
																				.append(this.elementAngleEFrom)))
																 .append(this.elementTableFrom
																		.append(this.elementTbodyFrom
																				.append(this.elementTr1From)
																				.append(this.elementTr2From)
																				.append(this.elementTr3From)))
																				
																				
			//--------------------그리기 element정의: To--------------------
			if(this.options.to !=null){ //to 옵션이 있을경우만 그리기
	            this.elementInlineTo = $('<div class="ui-datepicker-inline ui-datepicker ui-widget ui-widget-content ui-helper-clearfix ui-corner-all" style="display: block;"></div>');
	            this.elementPickerHeaderTo = $('<div class="ui-datepicker-header ui-widget-header ui-helper-clearfix ui-corner-all"></div>');
	            this.elementPrevTo = $('<a title="Prev" id="prevYearTo" class="ui-datepicker-prev ui-corner-all"></a>');
	            this.elementAngleWTo = $('<span class="ui-icon ui-icon-circle-triangle-w"></span>');
	            this.elementNextTo = $('<a title="Next" id="nextYearTo" class="ui-datepicker-next ui-corner-all" ></a>');
	            this.elementAngleETo = $('<span class="ui-icon ui-icon-circle-triangle-e"></span>');
	            this.elementPickerTitleTo = $('<div class="ui-datepicker-title">'+this.yearDataTo+'</div>');
	            this.elementYearTo = $('<span class="ui-datepicker-year"></span>');
	            this.elementTableTo = $('<table class="ui-datepicker-calendar" sizset="0" ></table>');
	            this.elementTbodyTo = $('<tbody sizset="0"></tbody>');
	            this.elementTr1To = $('<tr sizset="0"></tr>');
	            this.elementTr2To = $('<tr sizset="0"></tr>');
	            this.elementTr3To = $('<tr sizset="0"></tr>');
	            
	            this.elementPrevTo.click(this.elementClickYearMinusDelegate);	//이전 해 이동 함수 바인드(To 달력) 
	            this.elementNextTo.click(this.elementClickYearPlusDelegate);	//다음해 이동 함수 바인드 (To 달력) 
	            
	            //-----------------To 달력 mask정의-----------------
	            this.elementTo.mask(this.maskFormat);
	
	            //-----------------TR, TD로 1~12영역 만들기: To달력-----------------
	            for(var i=1; i<=4; i++){
	            	this.elementTr1To.append(
	            		$('<td class=" " tdGubun="to" data-month="'+i+'" width="20" ><a class="ui-state-default" href="#">'+i+'</a></td>').click(this.elementSelectMonthDelegate)
	            	)
	            }
	            for(var i=5; i<=8; i++){
	            	this.elementTr2To.append(
	            		$('<td class=" " tdGubun="to" data-month="'+i+'" width="20" ><a class="ui-state-default" href="#">'+i+'</a></td>').click(this.elementSelectMonthDelegate)
	            	)
	            }
	            for(var i=9; i<=12; i++){
	            	this.elementTr3To.append(
	            		$('<td class=" " tdGubun="to" data-month="'+i+'" width="20"><a class="ui-state-default" href="#">'+i+'</a></td>').click(this.elementSelectMonthDelegate)
	            	)
	            }
	            
	            //-----------------To 달력 이미지 만들기-----------------
	            this.elementCalendarDataTo = this.elementInlineTo.append(this.elementPickerHeaderTo
																			.append(this.elementPrevTo
																					.append(this.elementAngleWTo))
																			.append(this.elementPickerTitleTo
																					.append(this.elementYearTo))
																			.append(this.elementNextTo
																					.append(this.elementAngleETo)))
																	 .append(this.elementTableTo
																			.append(this.elementTbodyTo
																					.append(this.elementTr1To)
																					.append(this.elementTr2To)
																					.append(this.elementTr3To)))	
			}																		
																				
																				
			//-----------------달력 공통 영역 Element 정의: ok버튼, cancel버튼 등-----------------            
            this.elementButtonOk = $('<button class="ux-core-buttonOk ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only">OK</botton>');
            this.elementButtonOk.click(this.elementButtonOKClickDelegate);
            this.elementButtonCancel = $('<button class="ux-core-buttonCancel ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only">Cancel</botton>');
            this.elementButtonCancel.click(this.elementButtonCancelClickDelegate);
            this.elementButtons = $('<div class="ux-datepickerFromTo-buttons"></div>');
            this.elementToday = $('<span class="ux-datepickerFromTo-today"></span>');
            this.elementButtons.append(this.elementToday).append(this.elementButtonOk).append(this.elementButtonCancel);
            this.elementDialogId = elementId + '_DIALOG';
            this.elementDialog = $('<div id="' + this.elementDialogId + '" style="overflow: hidden;" class="ux-datepickerFromTo ui-widget ui-widget-content ui-corner-all"></div>');

            //-----------to 옵션이 있을경우 Twin 달력 생성-----------
			if(this.options.to !=null){  
				this.elementDialog.appendTo(document.body).hide().css({ zIndex: 1000 })
												.append(this.elementMonthpickerFrom
							               			    .append(this.elementCalendarDataFrom))
								               	.append(this.elementMonthpickerTo
								               			.append(this.elementCalendarDataTo))
								               	.append(this.elementButtons);
			//-----------to 옵션이 없을경우 Single 달력 생성-----------	
			}else{						
				this.elementDialog.appendTo(document.body).hide().css({ zIndex: 1000 })
									           .append(this.elementMonthpickerFrom
									        		   .append(this.elementCalendarDataFrom))
									           .append(this.elementButtons);
			}
            
            this.externalMouseDownDelegate = Function.createDelegate(this, this._onMouseDown);
            $(document).mousedown(this.externalMouseDownDelegate);
            
            this.externalResizeDelegate = Function.createDelegate(this, this._onResize);
            $(window).resize(this.externalResizeDelegate);
            
            
        },
        _onFoucsInput: function (event) {
        	// 시작, 종료일 INPUT에 포커스가 가면 이 플러그인을 표시한다.
            this.open();
        },
        _onKeyupInputFrom: function (event) {
            // INPUT에 직접 입력하여 값이 변경되면 이 플러그인의 값을 변경한다.
            var date = Globalize.parseDate(this.elementFrom.val(), this.options.format);
            if (date) {
                //this.elementMonthpickerFrom.monthpicker("setDate", date);
            }
        },
        _onKeyupInputTo: function (event) {
            // INPUT에 직접 입력하여 값이 변경되면 이 플러그인의 값을 변경한다.
            var date = Globalize.parseDate(this.elementTo.val(), this.options.format);
            if (date) {
                //this.elementMonthpickerTo.monthpicker("setDate", date);
            }
        },
        _onMonthpickerSelect: function (event) {
            // 이 플러그인에서 날짜를 선택하면 INPUT에 선택한 날짜값을 적용한다.
            var gubun = event.currentTarget.attributes['tdGubun'].value;
            var year = "";
          	var month = event.currentTarget.attributes['data-month'].value;
          	month = month<10? "0"+month: month;
            if(gubun=="from"){
            	year = this.yearDataFrom;
            	this.elementFrom.val(Globalize.format(new Date(year,month-1), this.options.format));
            }else if(gubun=="to"){
            	year = this.yearDataTo;
            	this.elementTo.val(Globalize.format(new Date(year,month-1), this.options.format));
            }
			
        },
        _onClickOk: function (event) {
            // OK버튼을 클릭하면 이 플러그인에서 선택한 날짜를 INPUT에 적용한다.
            this.close();
            if (typeof (this.options.onOk) === 'function') {
                this.options.onOk();
            }
        },
        _onClickCancel: function (event) {
            // Cancel버튼을 클릭하면 INPUT에 원래 값을 적용한다.
            //this.elementFrom.val(this.dateFrom ? Globalize.format(this.dateFrom, 'A') : '');
            //this.elementTo.val(this.dateTo ? Globalize.format(this.dateTo, 'A') : '');
            this.close();
        },
        _onMouseDown: function (event) {
            // 이 플러그인 외의 다른 화면을 클릭하면 이 플러그인을 닫는다.
            if (!this._isOpen) {
                return;
            }

            // INPUT이면 아무동작 안함
            var target = $(event.target);
            if (target[0] == this.elementFrom[0] ||
                target[0] == this.elementTo[0]) {
                return;
            }

            // 이 플러그인을 클릭하지 않았으면 닫기
            if (target[0].id != this.elementDialogId &&
                target.parents('#' + this.elementDialogId).length == 0) {
                this.close();
            }
        },
        _onResize: function (event) {
            // 브라우져 크기가 변경되면 이 플러그인을 닫는다.
            if (this._isOpen) {
                this.close();
            };
        },
        open: function () {
            // 플러그인 표시
            if (this._isOpen) {
                return;
            }
            // 원본 날짜
            this.dateFrom = Globalize.parseDate(this.elementFrom.val(), this.options.format);
            if(this.options.to !=null){
           		this.dateTo = Globalize.parseDate(this.elementTo.val(), this.options.format);
            }	
            this.elementToday.text('Today : ' + Globalize.format(new Date(), this.options.format));

            // 위치조정 및 표시
            var offset = this.element.offset(); offset.top += 18;
            if (this.elementDialog.width() + offset.left + 5 > $(document.body).width()) {
            	if(this.options.to !=null){
	            	offset.left = this.elementTo.offset().left + this.elementTo.width() - this.elementDialog.width() + 30;
            	}else{
	            	offset.left = this.elementDialog.width() + 30;
            	}
            }
            this.elementDialog.css({ top: offset.top + 'px', left: offset.left + 'px' }).show();
            // 화면 크기변경 이벤트 처리 되도록 - 두번
            $(window).resize();
            $(window).resize();
            this._isOpen = true;
            // 이벤트 onOpen 발생
            if (typeof (this.options.onOpen) === 'function') {
                this.options.onOpen();
            }
        },
        close: function () {
            // 닫기
            this.elementDialog.hide();
            this._isOpen = false;
        },
        destroy: function () {
            this.elementFrom.unbind('focus', this.elementInputFocusDelegate);
            this.elementFrom.unbind('keyup', this.elementInputFromKeyupDelegate);
            this.elementTo.unbind('focus', this.elementInputFocusDelegate);
            this.elementTo.unbind('keyup', this.elementInputToKeyupDelegate);
            this.elementMonthpickerFrom.monthpicker('destroy');
            this.elementMonthpickerTo.monthpicker('destroy');
            this.elementButtonOk.unbind('click', this.elementButtonOKClickDelegate);
            this.elementButtonCancel.unbind('click', this.elementButtonCancelClickDelegate);
            this.elementDialog.remove().empty();
            delete this.elementFrom;
            delete this.elementTo;
            delete this.elementMonthpickerFrom;
            delete this.elementMonthpickerTo;
            delete this.elementButtonOk;
            delete this.elementButtonCancel;
            delete this.elementToday;
            delete this.elementButtons;
            delete this.elementDialog;
            delete this.elementDialogId;
            delete this.elementInputFocusDelegate;
            delete this.elementInputFromKeyupDelegate;
            delete this.elementInputToKeyupDelegate;
            delete this.elementMonthpickerSelectDelegate;
            delete this.elementButtonOKClickDelegate;
            delete this.elementButtonCancelClickDelegate;
            delete this._isOpen;

            $(document).unbind('mousedown', this.externalMouseDownDelegate);
            delete this.externalMouseDownDelegate;

            $(window).unbind('resize', this.externalResizeDelegate);
            delete this.externalResizeDelegate;

            $.Widget.prototype.destroy.call(this);
        },
        _nextYear: function (event) {
            // 시작, 종료일 INPUT에 포커스가 가면 이 플러그인을 표시한다.
            var id = event.currentTarget.id;
            if(id=="nextYearFrom"){
	            this.yearDataFrom = Number(this.yearDataFrom)+1;
	            this.elementPickerTitleFrom[0].innerText = Number(this.elementPickerTitleFrom[0].innerText)+1;
	            //this.elementYearFrom[0].innerText = Number(this.elementYearFrom[0].innerText)+1;
            }else if(id=="nextYearTo"){
	            this.yearDataTo = Number(this.yearDataTo)+1;
	            this.elementPickerTitleTo[0].innerText = Number(this.elementPickerTitleTo[0].innerText)+1;
	            //this.elementYearTo[0].innerText = Number(this.elementYearTo[0].innerText)+1;
            }
        },
        _prevYear: function (event) {
            // 시작, 종료일 INPUT에 포커스가 가면 이 플러그인을 표시한다.
            var id = event.currentTarget.id;
            if(id=="prevYearFrom"){
	            this.yearDataFrom = Number(this.yearDataFrom)-1;
	            this.elementPickerTitleFrom[0].innerText = Number(this.elementPickerTitleFrom[0].innerText)-1;
            }else if(id=="prevYearTo"){
	            this.yearDataTo = Number(this.yearDataTo)-1;
	            this.elementPickerTitleTo[0].innerText = Number(this.elementPickerTitleTo[0].innerText)-1;
            }

        }
    });
})(jQuery);


/*!
monthpicker: 월 선택 calendar
2013-02-14 : seongchan wi
*/
(function ($, undefined) {
    // 달력 플러그인 - 두개의 달력을 표시하여 시작/종료일을 선택할 수 있다.
    //$.monthPickerFromTo = {
	$.widget('ui.monthpickerFromTo', {    		       	
		options: {
            to: null,
            onOpen: null,
            onOk: null,
            format: 'yyyy/MM'
        },
        _create: function () {
       		var elementId = this.element.attr('id');
            if (String.isNullOrWhitespace(elementId)) {
                elementId = 'monthpickerFROMTO_' + Math.random().toString().replace(/\./g, ''); this.element.attr('id', elementId);
            }
            
           	this._isOpen = false;
           	//---------------함수 바인드---------------
            this.elementInputFocusDelegate = Function.createDelegate(this, this._onFoucsInput);
            this.elementInputFromKeyupDelegate = Function.createDelegate(this, this._onKeyupInputFrom);
            this.elementInputToKeyupDelegate = Function.createDelegate(this, this._onKeyupInputTo);
            this.elementMonthpickerSelectDelegate = Function.createDelegate(this, this._onMonthpickerSelect);
            this.elementButtonOKClickDelegate = Function.createDelegate(this, this._onClickOk);
            this.elementButtonCancelClickDelegate = Function.createDelegate(this, this._onClickCancel);
            this.elementSelectMonthDelegate = Function.createDelegate(this, this._onMonthpickerSelect);
            this.elementClickYearPlusDelegate = Function.createDelegate(this, this._nextYear);
            this.elementClickYearMinusDelegate = Function.createDelegate(this, this._prevYear);

            //---------------달력 영역 공통 Element (from, to 달력 상위 div)---------------
            this.elementFrom = this.element;
            this.elementFrom.focus(this.elementInputFocusDelegate).keyup(this.elementInputFromKeyupDelegate);
			//mask
            this.maskFormat = (this.options.format).replace('yyyy','9999').replace('MM','99');

            this.elementFrom.mask(this.maskFormat);
            this.elementTo = $(this.options.to);
            this.elementTo.focus(this.elementInputFocusDelegate).keyup(this.elementInputToKeyupDelegate);
            this.elementMonthpickerFrom = $('<div class="ux-datepickerFromTo-from"></div>');
            this.elementMonthpickerTo = $('<div class="ux-datepickerFromTo-to"></div>');
            
			//---------------초기 년,월 (from, to 모두) 셋팅---------------
            this.yearDataFrom = this.elementFrom.val().substring(0,4);	//from 달력 year
            this.monthDataFrom = new Date().getMonth()+1;				//from 달력 month
            if(this.options.to !=null){ 
	            this.yearDataTo = this.elementTo.val().substring(0,4);		//to 달력 year
	            this.monthDataTo = new Date().getMonth()+1;					//to 달력 month
            }
            
            //--------------------그리기 element정의(1~12월 그리기): From--------------------
            this.elementInlineFrom = $('<div class="ui-datepicker-inline ui-datepicker ui-widget ui-widget-content ui-helper-clearfix ui-corner-all" style="display: block;"></div>');
            this.elementPickerHeaderFrom = $('<div class="ui-datepicker-header ui-widget-header ui-helper-clearfix ui-corner-all"></div>');
            this.elementPrevFrom = $('<a title="Prev" id="prevYearFrom" class="ui-datepicker-prev ui-corner-all" ></a>');
            this.elementAngleWFrom = $('<span class="ui-icon ui-icon-circle-triangle-w"></span>');
            this.elementNextFrom = $('<a title="Next" id="nextYearFrom" class="ui-datepicker-next ui-corner-all" ></a>');
            this.elementAngleEFrom = $('<span class="ui-icon ui-icon-circle-triangle-e"></span>');
            this.elementPickerTitleFrom = $('<div class="ui-datepicker-title">'+this.yearDataFrom+'</div>');
            this.elementYearFrom = $('<span class="ui-datepicker-year"></span>');
            this.elementTableFrom = $('<table class="ui-datepicker-calendar" sizset="0" ></table>');
            this.elementTbodyFrom = $('<tbody sizset="0"></tbody>');
            this.elementTr1From = $('<tr sizset="0"></tr>');
            this.elementTr2From = $('<tr sizset="0"></tr>');
            this.elementTr3From = $('<tr sizset="0"></tr>');
            
            this.elementPrevFrom.click(this.elementClickYearMinusDelegate);	//이전 해 이동 함수 바인드(From달력)
            this.elementNextFrom.click(this.elementClickYearPlusDelegate);	//다음 해 이동 함수 바인드(To달력)

            //-----------------TR, TD로 1~12 영역 만들기: From 
            for(var i=1; i<=4; i++){
            	this.elementTr1From.append(
            		$('<td class=" " tdGubun="from" data-month="'+i+'" width="20" ><a class="ui-state-default" href="#">'+i+'</a></td>').click(this.elementSelectMonthDelegate)
            	)
            }
            for(var i=5; i<=8; i++){
            	this.elementTr2From.append(
            		$('<td class=" " tdGubun="from" data-month="'+i+'" width="20" ><a class="ui-state-default" href="#">'+i+'</a></td>').click(this.elementSelectMonthDelegate)
            	)
            }
            for(var i=9; i<=12; i++){
            	this.elementTr3From.append(
            		$('<td class=" " tdGubun="from" data-month="'+i+'" width="20"><a class="ui-state-default" href="#">'+i+'</a></td>').click(this.elementSelectMonthDelegate)
            	)
            }
            
            //---------------정의된 Element로 From달력 이미지 만들기-----------------
            this.elementCalendarDataFrom = this.elementInlineFrom.append(this.elementPickerHeaderFrom
																		.append(this.elementPrevFrom
																				.append(this.elementAngleWFrom))
																		.append(this.elementPickerTitleFrom
																				.append(this.elementYearFrom))
																		.append(this.elementNextFrom
																				.append(this.elementAngleEFrom)))
																 .append(this.elementTableFrom
																		.append(this.elementTbodyFrom
																				.append(this.elementTr1From)
																				.append(this.elementTr2From)
																				.append(this.elementTr3From)))
																				
																				
			//--------------------그리기 element정의: To--------------------
			if(this.options.to !=null){ //to 옵션이 있을경우만 그리기
	            this.elementInlineTo = $('<div class="ui-datepicker-inline ui-datepicker ui-widget ui-widget-content ui-helper-clearfix ui-corner-all" style="display: block;"></div>');
	            this.elementPickerHeaderTo = $('<div class="ui-datepicker-header ui-widget-header ui-helper-clearfix ui-corner-all"></div>');
	            this.elementPrevTo = $('<a title="Prev" id="prevYearTo" class="ui-datepicker-prev ui-corner-all"></a>');
	            this.elementAngleWTo = $('<span class="ui-icon ui-icon-circle-triangle-w"></span>');
	            this.elementNextTo = $('<a title="Next" id="nextYearTo" class="ui-datepicker-next ui-corner-all" ></a>');
	            this.elementAngleETo = $('<span class="ui-icon ui-icon-circle-triangle-e"></span>');
	            this.elementPickerTitleTo = $('<div class="ui-datepicker-title">'+this.yearDataTo+'</div>');
	            this.elementYearTo = $('<span class="ui-datepicker-year"></span>');
	            this.elementTableTo = $('<table class="ui-datepicker-calendar" sizset="0" ></table>');
	            this.elementTbodyTo = $('<tbody sizset="0"></tbody>');
	            this.elementTr1To = $('<tr sizset="0"></tr>');
	            this.elementTr2To = $('<tr sizset="0"></tr>');
	            this.elementTr3To = $('<tr sizset="0"></tr>');
	            
	            this.elementPrevTo.click(this.elementClickYearMinusDelegate);	//이전 해 이동 함수 바인드(To 달력) 
	            this.elementNextTo.click(this.elementClickYearPlusDelegate);	//다음해 이동 함수 바인드 (To 달력) 
	            
	            //-----------------To 달력 mask정의-----------------
	            this.elementTo.mask(this.maskFormat);
	
	            //-----------------TR, TD로 1~12영역 만들기: To달력-----------------
	            for(var i=1; i<=4; i++){
	            	this.elementTr1To.append(
	            		$('<td class=" " tdGubun="to" data-month="'+i+'" width="20" ><a class="ui-state-default" href="#">'+i+'</a></td>').click(this.elementSelectMonthDelegate)
	            	)
	            }
	            for(var i=5; i<=8; i++){
	            	this.elementTr2To.append(
	            		$('<td class=" " tdGubun="to" data-month="'+i+'" width="20" ><a class="ui-state-default" href="#">'+i+'</a></td>').click(this.elementSelectMonthDelegate)
	            	)
	            }
	            for(var i=9; i<=12; i++){
	            	this.elementTr3To.append(
	            		$('<td class=" " tdGubun="to" data-month="'+i+'" width="20"><a class="ui-state-default" href="#">'+i+'</a></td>').click(this.elementSelectMonthDelegate)
	            	)
	            }
	            
	            //-----------------To 달력 이미지 만들기-----------------
	            this.elementCalendarDataTo = this.elementInlineTo.append(this.elementPickerHeaderTo
																			.append(this.elementPrevTo
																					.append(this.elementAngleWTo))
																			.append(this.elementPickerTitleTo
																					.append(this.elementYearTo))
																			.append(this.elementNextTo
																					.append(this.elementAngleETo)))
																	 .append(this.elementTableTo
																			.append(this.elementTbodyTo
																					.append(this.elementTr1To)
																					.append(this.elementTr2To)
																					.append(this.elementTr3To)))	
			}																		
																				
																				
			//-----------------달력 공통 영역 Element 정의: ok버튼, cancel버튼 등-----------------            
            this.elementButtonOk = $('<button class="ux-core-buttonOk ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only">OK</botton>');
            this.elementButtonOk.click(this.elementButtonOKClickDelegate);
            this.elementButtonCancel = $('<button class="ux-core-buttonCancel ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only">Cancel</botton>');
            this.elementButtonCancel.click(this.elementButtonCancelClickDelegate);
            this.elementButtons = $('<div class="ux-datepickerFromTo-buttons"></div>');
            this.elementToday = $('<span class="ux-datepickerFromTo-today"></span>');
            this.elementButtons.append(this.elementToday).append(this.elementButtonOk).append(this.elementButtonCancel);
            this.elementDialogId = elementId + '_DIALOG';
            this.elementDialog = $('<div id="' + this.elementDialogId + '" style="overflow: hidden;" class="ux-datepickerFromTo ui-widget ui-widget-content ui-corner-all"></div>');

            //-----------to 옵션이 있을경우 Twin 달력 생성-----------
			if(this.options.to !=null){  
				this.elementDialog.appendTo(document.body).hide().css({ zIndex: 1000 })
												.append(this.elementMonthpickerFrom
							               			    .append(this.elementCalendarDataFrom))
								               	.append(this.elementMonthpickerTo
								               			.append(this.elementCalendarDataTo))
								               	.append(this.elementButtons);
			//-----------to 옵션이 없을경우 Single 달력 생성-----------	
			}else{						
				this.elementDialog.appendTo(document.body).hide().css({ zIndex: 1000 })
									           .append(this.elementMonthpickerFrom
									        		   .append(this.elementCalendarDataFrom))
									           .append(this.elementButtons);
			}
            
            this.externalMouseDownDelegate = Function.createDelegate(this, this._onMouseDown);
            $(document).mousedown(this.externalMouseDownDelegate);
            
            this.externalResizeDelegate = Function.createDelegate(this, this._onResize);
            $(window).resize(this.externalResizeDelegate);
            
            
        },
        _onFoucsInput: function (event) {
        	// 시작, 종료일 INPUT에 포커스가 가면 이 플러그인을 표시한다.
            this.open();
        },
        _onKeyupInputFrom: function (event) {
            // INPUT에 직접 입력하여 값이 변경되면 이 플러그인의 값을 변경한다.
            var date = Globalize.parseDate(this.elementFrom.val(), this.options.format);
            if (date) {
                //this.elementMonthpickerFrom.monthpicker("setDate", date);
            }
        },
        _onKeyupInputTo: function (event) {
            // INPUT에 직접 입력하여 값이 변경되면 이 플러그인의 값을 변경한다.
            var date = Globalize.parseDate(this.elementTo.val(), this.options.format);
            if (date) {
                //this.elementMonthpickerTo.monthpicker("setDate", date);
            }
        },
        _onMonthpickerSelect: function (event) {
            // 이 플러그인에서 날짜를 선택하면 INPUT에 선택한 날짜값을 적용한다.
            var gubun = event.currentTarget.attributes['tdGubun'].value;
            var year = "";
          	var month = event.currentTarget.attributes['data-month'].value;
          	month = month<10? "0"+month: month;
          	
          	//debugger;
          	//$(event.target).addClass('ui-state-active');
          	
            if(gubun=="from"){
            	year = this.yearDataFrom;
            	this.elementFrom.val(Globalize.format(new Date(year,month-1), this.options.format));
            }else if(gubun=="to"){
            	year = this.yearDataTo;
            	this.elementTo.val(Globalize.format(new Date(year,month-1), this.options.format));
            }
        },
        _onClickOk: function (event) {
            // OK버튼을 클릭하면 이 플러그인에서 선택한 날짜를 INPUT에 적용한다.
            this.close();
            if (typeof (this.options.onOk) === 'function') {
                this.options.onOk();
            }
        },
        _onClickCancel: function (event) {
            // Cancel버튼을 클릭하면 INPUT에 원래 값을 적용한다.
            //this.elementFrom.val(this.dateFrom ? Globalize.format(this.dateFrom, 'A') : '');
            //this.elementTo.val(this.dateTo ? Globalize.format(this.dateTo, 'A') : '');
            this.close();
        },
        _onMouseDown: function (event) {
            // 이 플러그인 외의 다른 화면을 클릭하면 이 플러그인을 닫는다.
            if (!this._isOpen) {
                return;
            }

            // INPUT이면 아무동작 안함
            var target = $(event.target);
            if (target[0] == this.elementFrom[0] ||
                target[0] == this.elementTo[0]) {
                return;
            }

            // 이 플러그인을 클릭하지 않았으면 닫기
            if (target[0].id != this.elementDialogId &&
                target.parents('#' + this.elementDialogId).length == 0) {
                this.close();
            }
        },
        _onResize: function (event) {
            // 브라우져 크기가 변경되면 이 플러그인을 닫는다.
            if (this._isOpen) {
                this.close();
            };
        },
        open: function () {
            // 플러그인 표시
            if (this._isOpen) {
                return;
            }
            // 원본 날짜
            this.dateFrom = Globalize.parseDate(this.elementFrom.val(), this.options.format);
            if(this.options.to !=null){
           		this.dateTo = Globalize.parseDate(this.elementTo.val(), this.options.format);
            }	
            this.elementToday.text('Today : ' + Globalize.format(new Date(), this.options.format));

            // 위치조정 및 표시
            var offset = this.element.offset(); offset.top += 18;
            if (this.elementDialog.width() + offset.left + 5 > $(document.body).width()) {
            	if(this.options.to !=null){
	            	offset.left = this.elementTo.offset().left + this.elementTo.width() - this.elementDialog.width() + 30;
            	}else{
	            	offset.left = this.elementDialog.width() + 30;
            	}
            }
            this.elementDialog.css({ top: offset.top + 'px', left: offset.left + 'px' }).show();
            // 화면 크기변경 이벤트 처리 되도록 - 두번
            $(window).resize();
            $(window).resize();
            this._isOpen = true;
            // 이벤트 onOpen 발생
            if (typeof (this.options.onOpen) === 'function') {
                this.options.onOpen();
            }
        },
        close: function () {
            // 닫기
            this.elementDialog.hide();
            this._isOpen = false;
        },
        destroy: function () {
            this.elementFrom.unbind('focus', this.elementInputFocusDelegate);
            this.elementFrom.unbind('keyup', this.elementInputFromKeyupDelegate);
            this.elementTo.unbind('focus', this.elementInputFocusDelegate);
            this.elementTo.unbind('keyup', this.elementInputToKeyupDelegate);
            this.elementMonthpickerFrom.monthpicker('destroy');
            this.elementMonthpickerTo.monthpicker('destroy');
            this.elementButtonOk.unbind('click', this.elementButtonOKClickDelegate);
            this.elementButtonCancel.unbind('click', this.elementButtonCancelClickDelegate);
            this.elementDialog.remove().empty();
            delete this.elementFrom;
            delete this.elementTo;
            delete this.elementMonthpickerFrom;
            delete this.elementMonthpickerTo;
            delete this.elementButtonOk;
            delete this.elementButtonCancel;
            delete this.elementToday;
            delete this.elementButtons;
            delete this.elementDialog;
            delete this.elementDialogId;
            delete this.elementInputFocusDelegate;
            delete this.elementInputFromKeyupDelegate;
            delete this.elementInputToKeyupDelegate;
            delete this.elementMonthpickerSelectDelegate;
            delete this.elementButtonOKClickDelegate;
            delete this.elementButtonCancelClickDelegate;
            delete this._isOpen;

            $(document).unbind('mousedown', this.externalMouseDownDelegate);
            delete this.externalMouseDownDelegate;

            $(window).unbind('resize', this.externalResizeDelegate);
            delete this.externalResizeDelegate;

            $.Widget.prototype.destroy.call(this);
        },
        _nextYear: function (event) {
            // 시작, 종료일 INPUT에 포커스가 가면 이 플러그인을 표시한다.
            var id = event.currentTarget.id;
            if(id=="nextYearFrom"){
	            this.yearDataFrom = Number(this.yearDataFrom)+1;
	            this.elementPickerTitleFrom[0].innerText = Number(this.elementPickerTitleFrom[0].innerText)+1;
	            //this.elementYearFrom[0].innerText = Number(this.elementYearFrom[0].innerText)+1;
            }else if(id=="nextYearTo"){
	            this.yearDataTo = Number(this.yearDataTo)+1;
	            this.elementPickerTitleTo[0].innerText = Number(this.elementPickerTitleTo[0].innerText)+1;
	            //this.elementYearTo[0].innerText = Number(this.elementYearTo[0].innerText)+1;
            }
        },
        _prevYear: function (event) {
            // 시작, 종료일 INPUT에 포커스가 가면 이 플러그인을 표시한다.
            var id = event.currentTarget.id;
            if(id=="prevYearFrom"){
	            this.yearDataFrom = Number(this.yearDataFrom)-1;
	            this.elementPickerTitleFrom[0].innerText = Number(this.elementPickerTitleFrom[0].innerText)-1;
            }else if(id=="prevYearTo"){
	            this.yearDataTo = Number(this.yearDataTo)-1;
	            this.elementPickerTitleTo[0].innerText = Number(this.elementPickerTitleTo[0].innerText)-1;
            }

        }
    });
})(jQuery);

