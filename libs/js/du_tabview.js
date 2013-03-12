/*
 * 
 */


/*
 * @(#) du_tabview.js
 * build version : 1.4.5 $Revision: 13636 $
 *  
 * Copyright ⓒ LG CNS, Inc. All rights reserved.
 *
 * devon@lgcns.com
 * http://www.dev-on.com
 *
 * Do Not Erase This Comment!!! (이 주석문을 지우지 말것)
 *
 * dujsf/license.txt를 반드시 읽어보고 사용하시기 바랍니다.
 *
 * 1. 사내 사용시 KAMS를 통해 요청하여 사용허가를 받아야만 소프트웨어 라이센스 계약서에 동의하는 것으로 간주됩니다.
 * 2. DevOn RUI가 포함된 제품을 판매할 경우에도 KAMS를 통해 요청하여 사용허가를 받아야만 합니다.
 * 3. KAMS를 통해 사용허가를 받지 않은 경우 소프트웨어 라이센스 계약을 위반한 것으로 간주됩니다.
 * 4. 별도로 판매될 경우 LGCNS의 소프트웨어 판매정책을 따릅니다. (KAMS에 문의 바랍니다.)
 *
 * (주의!) 원저자의 허락없이 재배포 할 수 없으며
 * LG CNS 외부로의 유출을 하여서는 안 된다.
 */

/**
* @description TabView 객체
* @module widget_tab
* @requires DU, event
* @namespace DU.widget
* @title tab
*/
(function() {

    var Dom = DU.util.LDom,
        Event = DU.util.LEvent,
        document = window.document,

    // STRING CONSTANTS
        ACTIVE = 'active',
        ACTIVE_INDEX = 'activeIndex',
        ACTIVE_TAB = 'activeTab',
        CONTENT_EL = 'contentEl',
        CONTENT_HEIGHT = "contentHeight",
        CONTENT_WIDTH = "contentWidth",
        ELEMENT = 'element',
        

    /**
    * <div class="plugins">Include : /dujsf/plugins/tabview/du_tabview.js</div>
    * tab을 출력하는 TabView 객체
    * @namespace DU.widget
    * @class LTabView
    * @extends DU.LElement
    * @sample default
    * @constructor
    * @param {HTMLElement | String | Object} el(optional) dom id 
    * @param {Object} attr (optional) 속성값
    */
    LTabView = function(el, attr) {
        attr = attr || {};
        if (arguments.length == 1 && !DU.isString(el) && !el.nodeName) {
            attr = el; // treat first arg as attr object
            el = attr.element || null;
        }
        attr = DU.util.LDom.applyIfProperties(attr, '$.ext.tabView');

        if (!el && !attr.element) { // create if we dont have one
            el = this._createTabViewElement(attr);
        }
        
        if (attr.dataSet && attr.fields)
        {
            this.dataSet = attr.dataSet;
            this.fields = attr.fields;
            //this.dataSet.unOn("load", this.onLoadDataSetDelegate);
            this.dataSet.on("load", this.onLoadDataSet, this, true);
        }  
        
        //render가 없는 구조였음, id를 넣으면 충돌 발생.  render를 위해서 별도 id 사용.
        if (attr.id) {
            this.el = DU.get(attr.id);
            attr.id = null;
        }
        //config로 tab 추가
        if(attr.tabs){
            this.tabs = attr.tabs;
        }
        
        LTabView.superclass.constructor.call(this, el, attr);
        
        /**
         * @description 탭객체가 그려질때 호출되는 이벤트
         * @event render
         * @sample default
         */
        this.createEvent('render');
    };

    DU.extend(LTabView, DU.LElement, {
        el : null,
        /**
         * @description 각 탭의 항목들을 json형식으로 정의한 배열
         * @config tabs
         * @sample default
         * @type {Array}
         * @default null
         */
        /**
        * @description 각 탭의 항목들을 json형식으로 정의한 배열
        * @property tabs
        * @default null
        */
        tabs : null,
        /**
        * @description The className to add when building from scratch. 
        * @property CLASSNAME
        * @private
        * @default "navset"
        */
        CLASSNAME: 'L-navset',

        /**
        * @description The className of the HTMLElement containing the LTabView's tab elements
        * to look for when building from existing markup, or to add when building
        * from scratch. 
        * All childNodes of the tab container are treated as Tabs when building
        * from existing markup.
        * @property TAB_PARENT_CLASSNAME
        * @private
        * @default "nav"
        */
        TAB_PARENT_CLASSNAME: 'L-nav',

        /**
        * @description The className of the HTMLElement containing the LTabView's label elements
        * to look for when building from existing markup, or to add when building
        * from scratch. 
        * All childNodes of the content container are treated as content elements when
        * building from existing markup.
        * @property CONTENT_PARENT_CLASSNAME
        * @private
        * @default "nav-content"
        */
        CONTENT_PARENT_CLASSNAME: 'L-content',
        /**
        * @description tab에 binding할 dataset
        * @property dataSet
        * @default null
        */
        dataSet:null,
        /**
         * @description tab에 binding할 datase의 field정보
         * @config fields
         * @sample default
         * @type {Array}
         * @default null
         */
        /**
        * @description tab에 binding할 datase의 field정보
        * @property fields
        * @default null
        */
        fields:null,        
        _tabParent: null,
        _contentParent: null,

        /**
        * @description LTabView에 LTab을 추가하는 메소드
        * @method addTab
        * @sample default
        * @param {DU.widget.LTab} tab LTab 객체
        * @param {Integer} index [optional] 추가할 index 
        * @return {void}
        */
        addTab: function(tab, index) {
            var tabs = this.get('tabs'),
                before = this.getTab(index),
                tabParent = this._tabParent,
                contentParent = this._contentParent,
                tabElement = tab.get(ELEMENT),
                contentEl = tab.get(CONTENT_EL);

            if (!tabs) { // not ready yet
                this._queue[this._queue.length] = ['addTab', arguments];
                return false;
            }

            index = (index === undefined) ? tabs.length : index;

            if (before) {
                tabParent.insertBefore(tabElement, before.get(ELEMENT));
            } else {
                tabParent.appendChild(tabElement);
            }

            if (contentEl && !Dom.isAncestor(contentParent, contentEl)) {
                contentParent.appendChild(contentEl);
            }

            if (!tab.get(ACTIVE)) {
                tab.set('contentVisible', false, true); /* hide if not active */
            } else {
                this.set(ACTIVE_TAB, tab, true);
                this.set(ACTIVE_INDEX, index, true); 
            }            

            this._initTabEvents(tab);
            tabs.splice(index, 0, tab);
        },
        /**
        * @description onLoadDataSet
        * @method onLoadDataSet
        * @private
        * @return {void}
        */
        onLoadDataSet : function(){
            if (this.dataSet) {
                //기존 추가한 것 삭제       
                this._removeDataSetTabs();
                this.addTabsByDataSet();
            }
        },
        /**
        * @description DataSet의 특정 컬럼을 label과 content로 설정, 활성화 여부 설정, 추가후 실행할 function 설정
        * @method addTabsByDataSet
        * @private
        * @return {void}
        */
        addTabsByDataSet: function() {
            if(this._rendered !== true) return;
            /*
            var fields = {
            //parentId와 rootValue가 없으면 모든 data에 대해서 Tab을 만듬.  rootValue가 없으면 ""을 rootValue로 설정
            rootValue:"",
            parentId: "PARENT_MENU_ID",
            //tab의 label column
            label: "NM",
            //content column 기술하지 않으면 tab만 보임.
            content: "URL",
            //tab 순서 column, 기술하지 않으면 record 순서대로 tab 만듬.
            order: "SEQ",
            //최초 활성화될 tab index 기술하지 않으면 첫번째 tab 활성화, -1이면 활성화 하지 않는다.
            active: -1
            };
            */
                
            var rs = new Array();
            if (this.fields.parentId) {
                rs = this._getChildRecords(this.fields.rootValue)[0];
            }
            else {
                var row_count = this.dataSet.getCount();
                var r = null;
                for (var i = 0; i < row_count; i++) {
                    rs.push(this.dataSet.getAt(i));
                }
            }

            //tab 추가
            var _label = "";
            var _content = "";
            var _active = false;
            this.fields.active = this.fields.active ? this.fields.active : 0;
            for (var i = 0; i < rs.length; i++) {
                _label = rs[i].get(this.fields.label);
                _content = this.fields.content ? rs[i].get(this.fields.content) : "";
                _active = (this.fields.active == i) ? true : false;
                
                var tab = new DU.widget.LTab({
                    label: _label,
                    content: _content,
                    active: _active,
                    //record id 저장.  event에서 사용
                    recordId: rs[i].id
                });
   
                this.addTab(tab);
            }
            
            this.selectTab(this.fields.active);
        },
        /**
        * @description 신규 dataSet이 load될 경우 기존 dataSet으로 그렸던것 삭제
        * @method _removeDataSetTabs
        * @private        
        * @return {Void}
        */
        _removeDataSetTabs : function(){
            //dataSet에 의해 생성된 이전 tab 삭제하기           
            var tabs = this.get('tabs');
            var dataSetTabs = new Array();
            for (var i = 0; i < tabs.length; i++) {
                if (!DU.isEmpty(tabs[i].get("recordId"))) 
                    dataSetTabs.push(tabs[i]);
            }
            for(var i=0;i<dataSetTabs.length ;i++){
                this.removeTab(dataSetTabs[i]);
            }
        },
        /**
        * @description DataSet에서 자식 record목록
        * @method _getChildRecords
        * @private        
        * @param {string} parent_id
        * @return {Array}
        */
        _getChildRecords: function(parent_id) {
            var rs = new Array();
            var row_count = this.dataSet.getCount();
            var r = null;
            for (var i = 0; i < row_count; i++) {
                r = this.dataSet.getAt(i);
                if (r.get(this.fields.parentId) == parent_id) {
                    //부모id가 같으면 행 저장
                    rs.push(r);
                }
            }

            //order field 번호가 중복값이 있으면 group끼리 []로 싸준다.
            //중복값이 있으면 rs sorting을 해서 return
            var grouped = false;
            if (this.fields.order) {
                var sr = this._getSortedRecords(rs);
                grouped = sr[0];
                rs = sr[1];
            }

            return [rs, grouped];
        },

        /**
        * @description sort column이 있는 경우 sorting해서 return하기, grouping된 경우는 grouping 여부를 같이 return
        * @method _getSortedRecords
        * @private        
        * @param {Array} rs record's array
        * @return {Array}
        */
        _getSortedRecords: function(rs) {
            //1. order.idx 문자열값을 가지는 array를 record 수만큼 만든다.
            var sort_order_idx = new Array();
            var order;
            for (var i = 0; i < rs.length; i++) {
                order = rs[i].get(this.fields.order);                
                sort_order_idx.push((order ? order : 10000000000) + "." + i.toString());
            }
            //2. array를 order field를 기준으로 sort한다.
            sort_order_idx.sort(function(x, y) { return x - y; });
            //3. sort한 순서대로 record array를 새로 만든다.
            var sorted_rs = new Array();
            var idx = -1;
            var is_same_order = false;
            var prev = -1;
            var cur = -1;
            var s = null;
            for (var i = 0; i < sort_order_idx.length; i++) {
                s = sort_order_idx[i].split('.');
                idx = parseInt(s[1], 10);
                cur = parseInt(s[0], 10);
                //같은 order가 있는지 검사하기
                if (!is_same_order) {
                    is_same_order = (cur == prev) ? true : false;
                }
                sorted_rs.push(rs[idx]);
                prev = cur;
            }

            return [is_same_order, sorted_rs];
        },
        /**
        * @description config를 통해 들어온 tabs 배열로 tab들을 추가한다.
        * @method addTabs 
        * @sample default
        * @param {Array} 
        * @return {void}            
        */
        addTabs : function(tabs){
            if (tabs && tabs.length > 0) {
                for (var i = 0; i < tabs.length; i++) {
                    this.addTab(new DU.widget.LTab(tabs[i]));
                }
            }
        },
        /**
        * @description id에 자식이 있을 경우 tab으로 만들기
        * @method addTabsByChild
        * @param {HTMLElement}
        * @return {void}
        */
        addTabsByChild : function(dom){
            //한번만 수행한다.
            if (!this.addedChild) {
                var _active = true;
                if (dom && dom.childNodes.length > 0) {
                    //text node 문제와 IE의 경우 tab으로 만들어 지는 순간 childNodes에서 빠져버려서 counting이 잘못된다.
                    var childs = new Array();
                    for (var i = 0; i < dom.childNodes.length; i++) {
                        if (dom.childNodes[i].tagName && dom.childNodes[i].tagName.toLowerCase() == 'div') 
                            childs.push(dom.childNodes[i]);
                    }
                    for (var i = 0; i < childs.length; i++) {
                        var _label = childs[i].title;
                        this.addTab(new DU.widget.LTab({
                            label: _label,
                            contentEl: childs[i],
                            active: _active
                        }));
                        _active = false;
                    }
                }
            }
            this.addedChild = true;
        },
        /**
        * @description 객체를 Render하는 메소드로 render시 appendToNode의 객체가 존재하지 않으면 에러가 발생한다.
        * @method render 
        * @sample default
        * @param {HTMLElement|string} appendToNode 트리를 생성할 html dom 
        * @return {void}             
        */
        render: function(target) {
            this.el = target ? DU.get(target) : this.el;
            if(this.dataSet) this.addTabsByDataSet();
            this.addTabsByChild(this.el.dom);
            this.addTabs(this.tabs);            
            this.appendTo(this.el.dom);          
            //content가 필요없을 경우 설정
            if (this.fields && !this.fields.content) {
                this.hideContent();
            }
            this._rendered = true;
            this.fireEvent("render",this);
        },
        /**
        * @description tab event 초기화
        * @method _initTabEvents 
        * @private
        * @param {DU.widget.LTab}             
        */
        _initTabEvents: function(tab) {
            //Element.addListener('event명',handler,event arguments, scope)
            tab.addListener(tab.get('activationEvent'), tab._onActivate, this, tab);

            tab.addListener(
                'activationEventChange',
                function(e) {
                    if (e.prevValue != e.newValue) {
                        tab.removeListener(e.prevValue, tab._onActivate);
                        tab.addListener(e.newValue, tab._onActivate, this, tab);
                    }
                });
        },

        /**
        * @description Routes childNode events.
        * @method DOMEventHandler
        * @private
        * @param {event} e The Dom event that is being handled.
        * @return {void}
        */
        DOMEventHandler: function(e) {
            var target = Event.getTarget(e),
                tabParent = this._tabParent,
                tabs = this.get('tabs'),
                tab,
                tabEl,
                contentEl;


            if (Dom.isAncestor(tabParent, target)) {
                for (var i = 0, len = tabs.length; i < len; i++) {
                    tabEl = tabs[i].get(ELEMENT);
                    contentEl = tabs[i].get(CONTENT_EL);

                    if (target == tabEl || Dom.isAncestor(tabEl, target)) {
                        tab = tabs[i];
                        break; // note break
                    }
                }

                if (tab) {
                    tab.fireEvent(e.type, e);
                }
            }
        },

        /**
        * @description index에 대한 tab 객체를 리턴한다.
        * @method getTab
        * @sample default
        * @param {Integer} index tab index
        * @return {DU.widget.LTab}
        */
        getTab: function(index) {
            return this.get('tabs')[index];
        },

        /**
        * @description tab의 index를 리턴한다.
        * @method getTabIndex
        * @sample default
        * @param {DU.widget.LTab} tab tab 객체
        * @return {int}
        */
        getTabIndex: function(tab) {
            var index = null,
                tabs = this.get('tabs');
            for (var i = 0, len = tabs.length; i < len; ++i) {
                if (tab == tabs[i]) {
                    index = i;
                    break;
                }
            }

            return index;
        },
        
        /**
        * @description tab의 갯수를 리턴한다.
        * @method getTabCount
        * @return {int}
        */
        getTabCount: function(){
            return this.get('tabs').length;
        },

        /**
        * @description LTab을 삭제한다.
        * @method removeTab
        * @sample default
        * @param {DU.widget.LTab} tab 삭제할 LTab 객체
        * @return {void}
        */
        removeTab: function(tab) {
            var tabCount = this.get('tabs').length,
                index = this.getTabIndex(tab);

            if (tab === this.get(ACTIVE_TAB)) {
                if (tabCount > 1) { // select another tab
                    if (index + 1 === tabCount) { // if last, activate previous
                        this.set(ACTIVE_INDEX, index - 1);
                    } else { // activate next tab
                        this.set(ACTIVE_INDEX, index + 1);
                    }
                } else { // no more tabs
                    this.set(ACTIVE_TAB, null);
                }
            }

            this._tabParent.removeChild(tab.get(ELEMENT));
            this._contentParent.removeChild(tab.get(CONTENT_EL));
            this._configs.tabs.value.splice(index, 1);

            tab.fireEvent('remove', { type: 'remove', tabview: this });
        },

        /**
        * @description index에 해당되는 LTab을 삭제한다.
        * @method removeAt
        * @sample default
        * @param {int} inx 삭제할 tab index
        * @return {void}
        */
        removeAt: function(inx) {
            this.removeTab(this.getTab(inx));            
        },

        /**
        * @description 객체 정보
        * @method toString
        * @return {String}
        */
        toString: function() {
            var name = this.get('id') || this.get('tagName');
            return "LTabView " + name;
        },

        /**
        * @description The transiton to use when switching between tabs.
        * @method contentTransition
        * @private
        */
        contentTransition: function(newTab, oldTab) {
            if (newTab) {
                newTab.set('contentVisible', true);
            }
            if (oldTab) {
                oldTab.set('contentVisible', false);
            }
        },
        /**
        * @description menu 용도로 사용될 경우 content는 필요없을 경우도 있음. 
        * @method hideContent
        * @private
        * @param bool default로 true이며 보여야 할 경우는 false를 입력하면 된다.
        */
        hideContent: function(p_hide) {
            p_hide = p_hide || true;
            var display = "";
            if (p_hide) {
                display = "none";
            }
            this._contentParent.style.display = display;
        },
        /**
        * @description setAttributeConfigs LTabView specific properties.
        * @method initAttributes
        * @private
        * @param {Object} attr Hash of initial attributes
        */
        initAttributes: function(attr) {
            LTabView.superclass.initAttributes.call(this, attr);

            if (!attr.orientation) {
                attr.orientation = 'top';
            }

            var el = this.get(ELEMENT);

            if (!Dom.hasClass(el, this.CLASSNAME)) {
                Dom.addClass(el, this.CLASSNAME);
            }

            /**
            * @description The Tabs belonging to the LTabView instance.
            * @attribute tabs
            * @type Array
            */
            this.setAttributeConfig('tabs', {
                value: [],
                readOnly: true
            });

            /**
            * @description The container of the tabView's label elements.
            * @property _tabParent
            * @private
            * @type HTMLElement
            */
            this._tabParent =
                    this.getElementsByClassName(this.TAB_PARENT_CLASSNAME,
                            'ul')[0] || this._createTabParent();

            /**
            * @description The container of the tabView's content elements.
            * @property _contentParent
            * @type HTMLElement
            * @private
            */
            this._contentParent =
                    this.getElementsByClassName(this.CONTENT_PARENT_CLASSNAME,
                            'div')[0] || this._createContentParent();

            /**
            * @description How the Tabs should be oriented relative to the LTabView.
            * @attribute orientation
            * @type String
            * @default "top"
            */
            this.setAttributeConfig('orientation', {
                value: attr.orientation,
                method: function(value) {
                    var current = this.get('orientation');
                    this.addClass('L-navset-' + value);

                    if (current != value) {
                        this.removeClass('L-navset-' + current);
                    }

                    if (value === 'bottom') {
                        this.appendChild(this._tabParent);
                    }
                }
            });

            /**
            * @description The index of the tab currently active.
            * @attribute activeIndex
            * @type Int
            */
            this.setAttributeConfig(ACTIVE_INDEX, {
                value: attr.activeIndex,
                method: function(value) {
                },
                validator: function(value) {
                    var ret = true;
                    var tab = this.getTab(value);
                    if (value && (!tab || tab.get('disabled'))) { // cannot activate if disabled
                        ret = false;
                    }
                    return ret;
                }
            });

            /**
            * @description The tab currently active.
            * @attribute activeTab
            * @type DU.widget.LTab
            */
            this.setAttributeConfig(ACTIVE_TAB, {
                value: attr.activeTab,
                method: function(tab) {
                    var activeTab = this.get(ACTIVE_TAB);

                    if (tab) {
                        tab.set(ACTIVE, true);
                    }

                    if (activeTab && activeTab !== tab) {
                        activeTab.set(ACTIVE, false);
                    }

                    if (activeTab && tab !== activeTab) { // no transition if only 1
                        this.contentTransition(tab, activeTab);
                    } else if (tab) {
                        tab.set('contentVisible', true);
                    }
                },
                validator: function(value) {
                    var ret = true;
                    if (value && value.get('disabled')) { // cannot activate if disabled
                        ret = false;
                    }
                    return ret;
                }
            });
            
            /**
            * @description tab content height 설정
            * @attribute contentHeight
            * @type String
            */
            this.setAttributeConfig(CONTENT_HEIGHT, {
                value: attr.contentHeight,
                method: function(value) {
                    var cEl = DU.get(this._contentParent);    
                    cEl.setHeight(value);
                }
            });
            
            /**
            * @description tab content width 설정
            * @attribute contentHeight
            * @type String
            */
            this.setAttributeConfig(CONTENT_WIDTH, {
                value: attr.contentWidth,
                method: function(value) {                    
                    DU.get(this.get(ELEMENT)).setWidth(value);
                }
            });

            //event listener를 추가하고, event 작동시 _onActive...가 먼저 실행되고 사용자 event가 실행된다.
            /**
             * @description active tab change
             * @event activeTabChange            
             */
            this.on('activeTabChange', this._onActiveTabChange);
            /**
             * @description activeIndexChange
             * @event activeIndexChange            
             */
            this.on('activeIndexChange', this._onActiveIndexChange);            

            if (this._tabParent) {
                this._initTabs();
            }

            // Due to delegation we add all DOM_EVENTS to the LTabView container
            // but IE will leak when unsupported events are added, so remove these
            this.DOM_EVENTS.submit = false;
            this.DOM_EVENTS.focus = false;
            this.DOM_EVENTS.blur = false;

            for (var type in this.DOM_EVENTS) {
                if (DU.hasOwnProperty(this.DOM_EVENTS, type)) {
                    this.addListener.call(this, type, this.DOMEventHandler);
                }
            }
        },

        /**
        * @description index에 해당되는 활성화된 탭을 취소한다.
        * @method deselectTab
        * @sample default
        * @param {int} index 취소할 tab index 
        * @return {void}
        */
        deselectTab: function(index) {
            if (this.getTab(index) === this.get('activeTab')) {
                this.set('activeTab', null);
            }
        },

        /**
        * @description 활성화할 tab을 선택한다.
        * @method selectTab
        * @sample default
        * @param {int} index 선택할 탭 index
        * @return {void}
        */
        selectTab: function(index) {
            this.set('activeTab', this.getTab(index));
        },
        
        /**
        * @description 현재 선택된 Tab의 index
        * @method getActiveIndex
        * @return {int} 
        */
        getActiveIndex : function() {
            return this.get(ACTIVE_INDEX);
        },

        /**
        * @description 현재 선택된 Tab을 리턴한다.
        * @method getActiveTab
        * @return {DU.widget.LTab} 
        */
        getActiveTab : function() {
            return this.getTab(this.get(ACTIVE_INDEX));
        },

        _onActiveTabChange: function(e) {
            //alert("activeTabChange");
            var activeIndex = this.get(ACTIVE_INDEX),
                newIndex = this.getTabIndex(e.newValue);

            if (activeIndex !== newIndex) {
                if (!(this.set(ACTIVE_INDEX, newIndex))) { // NOTE: setting
                    // revert if activeIndex update fails (cancelled via beforeChange) 
                    this.set(ACTIVE_TAB, e.prevValue);
                }
            }
        },

        _onActiveIndexChange: function(e) {
            // no set if called from ActiveTabChange event
            if (e.newValue !== this.getTabIndex(this.get(ACTIVE_TAB))) {
                if (!(this.set(ACTIVE_TAB, this.getTab(e.newValue)))) { // NOTE: setting
                    // revert if activeTab update fails (cancelled via beforeChange) 
                    this.set(ACTIVE_INDEX, e.prevValue);
                }
            }
        },

        /**
        * @description Creates Tab instances from a collection of HTMLElements.
        * @method _initTabs
        * @private
        * @return {void}
        */
        _initTabs: function() {
            var tabs = Dom.getChildren(this._tabParent),
                contentElements = Dom.getChildren(this._contentParent),
                activeIndex = this.get(ACTIVE_INDEX),
                tab,
                attr,
                active;

            for (var i = 0, len = tabs.length; i < len; ++i) {
                attr = {};

                if (contentElements[i]) {
                    attr.contentEl = contentElements[i];
                }

                tab = new DU.widget.LTab(tabs[i], attr);
                this.addTab(tab);

                if (tab.hasClass(tab.ACTIVE_CLASSNAME)) {
                    active = tab;
                }
            }
            if (activeIndex) {
                this.set(ACTIVE_TAB, this.getTab(activeIndex));
            } else {
                this._configs.activeTab.value = active; // dont invoke method
                this._configs.activeIndex.value = this.getTabIndex(active);
            }
            //높이 넓이 설정
            if (this._configs.contentHeight.value) {
                this.set("contentHeight", this._configs.contentHeight.value);                
            }
                
            if (this._configs.contentWidth.value) {
                this.set("contentWidth", this._configs.contentWidth.value);
            }
        },

        _createTabViewElement: function(attr) {
            var el = document.createElement('div');

            if (this.CLASSNAME) {
                el.className = this.CLASSNAME + (this.isFixedClass ? " L-fixed" : "");
            }

            return el;
        },

        _createTabParent: function(attr) {
            var el = document.createElement('ul');

            if (this.TAB_PARENT_CLASSNAME) {
                el.className = this.TAB_PARENT_CLASSNAME;
            }

            this.get(ELEMENT).appendChild(el);

            return el;
        },

        _createContentParent: function(attr) {
            var el = document.createElement('div');

            if (this.CONTENT_PARENT_CLASSNAME) {
                el.className = this.CONTENT_PARENT_CLASSNAME;
            }

            this.get(ELEMENT).appendChild(el);

            return el;
        }
    });


    DU.widget.LTabView = LTabView;
})();

/**
* @module widget_tab
* @requires DU, event
* @namespace DU.widget
* @title tab
*/
//범위를 한정시키기위해 괄호로 묶는다.
(function() {
    var Dom = DU.util.LDom,
    ACTIVE_TAB = 'activeTab',
    LABEL = 'label',
    LABEL_EL = 'labelEl',
    CONTENT = 'content',
    CONTENT_EL = 'contentEl',
    ELEMENT = 'element',
    CACHE_DATA = 'cacheData',
    DATA_SRC = 'dataSrc',
    DATA_LOADED = 'dataLoaded',
    DATA_TIMEOUT = 'dataTimeout',
    LOAD_METHOD = 'loadMethod',
    POST_DATA = 'postData',
    DISABLED = 'disabled',
    //LDataSet binding시 record id 저장할 곳
    RECORED_ID = 'recordId';
    
    /**
    * @description
    * <div class="plugins">Include : /dujsf/plugins/tabview/du_tabview.js</div> 
    * Tab의 label과 content를 표시하는 object이다.
    * constructor로 Tab을 정의한다.  DU.widget.Tab으로 정의할 수도 있고, 나중에 할당해도 된다.
    * @class LTab
    * @extends DU.LElement
    * @constructor
    * @param element {HTMLElement | String} (optional) element는 TabView이거나 null일 수 있다.
    * @param {Object} properties로 최초 properties의 key map이다.
    */
    var LTab = function(el, attr) {
        //attr이 없으면 빈 object할당
        attr = attr || {};        
        //el만 입력되면 el에서 attr과 el을 다시 만든다.
        if (arguments.length == 1 && !DU.isString(el) && !el.nodeName) {
            attr = el;
            el = attr.element;
        }
        //추가, id를 넣으면 contentEl로 변환
        if (attr.id) {
            var contentEl = DU.get(attr.id);
            if(contentEl && contentEl.dom){
                attr.contentEl = contentEl.dom;
            }
        }
        //el이 입력되지 않았으면 attr로 el을 만든다.
        if (!el && !attr.element) {
            el = this._createTabElement(attr);
        } 
        //성공이면 responseText로 Content를 채운다.
        this.loadHandler = {
            success: function(o) { this.set(CONTENT, o.responseText); },
            failure: function(o) { }
        };
        
        //parent class(Element) constructor를 call
        //this.dom에 dom obj를 넣는다. this.id에 값을 넣고 this.visibilityMode = true, 기본 css class할당.
        LTab.superclass.constructor.call(this, el, attr);

        //tabView에 delegating한다.
        this.DOM_EVENTS = {};
    };

    //LTab Constructor와 Element를 상속받아 구현한다.
    DU.extend(LTab, DU.LElement, {
        /**
        * @description LTab 내부 element의 기본 tag name으로 em (Emphasized text)
        * @LABEL_TAGNAME
        * @type String
        * @private
        * @default "em" 
        */
        LABEL_TAGNAME: 'em',
        /**
        * @description active tab에 설정될 class name
        * @property ACTIVE_CLASSNAME
        * @type String
        * @private
        * @default "selected"
        */
        ACTIVE_CLASSNAME: 'selected',
        /**
        * @description The class name applied to hidden tabs.
        * @property HIDDEN_CLASSNAME
        * @type String
        * @private
        * @default "L-nav-hidden"
        */
        HIDDEN_CLASSNAME: 'L-nav-hidden',
        /**
        * @description The title applied to active tabs.
        * @property ACTIVE_TITLE
        * @type String
        * @private
        * @default "active"
        */
        ACTIVE_TITLE: 'active',
        /**
        * @description The class name applied to disabled tabs.
        * @property DISABLED_CLASSNAME
        * @type String
        * @private
        * @default "disabled"
        */
        DISABLED_CLASSNAME: DISABLED,
        /**
        * @description The class name applied to dynamic tabs while loading.
        * @property LOADING_CLASSNAME
        * @type String
        * @private
        * @default "disabled"
        */
        LOADING_CLASSNAME: 'loading',
        /**
        * @description connection request object로 data를 동적으로 load할 때 사용한다.  특정 url을 data로 보여줄 때 사용.
        * @property dataConnection
        * @type Object
        */
        dataConnection: null,
        /**
        * @description Object containing success and failure callbacks for loading data.
        * @property loadHandler
        * @type object
        */
        loadHandler: null,

        _loading: false,

        /**
        * @description Provides a readable name for the tab.
        * @method toString
        * @return {String}
        */
        toString: function() {
            var el = this.get(ELEMENT),
                id = el.id || el.tagName;
            return "LTab " + id;
        },
        /**
        * @description setAttributeConfigs LTabView specific properties.  property 초기화
        * @method initAttributes
        * @private
        * @param {Object} attr Hash of initial attributes
        */
        initAttributes: function(attr) {
            attr = attr || {};
            //부모인 Element.initAttributes 호출, Element에는 코드가 없고 정의만 되어 있다.
            LTab.superclass.initAttributes.call(this, attr);

            //Element.setAttributeConfig(key, map, init)를 호출한다.  attribute의 값을 설정하거나 update한다.
            //el이 있으면 name, method, value등을 설정하고 Attribute object를 this._configs[key]로 만든다.
            //el이 없으면 AttributeProvider를 만든다.  결과적으로 attribute object관련 설정이다.
            /**
            * @description Tab이 활성화 될 때 발생하는 event 정의 입력된 것이 없는 경우는 default click이다.
            * @attribute activationEvent
            * @type String
            */
            this.setAttributeConfig('activationEvent', { value: attr.activationEvent || 'click' });
            /**
            * @description label을 포함하는 element를 설정.  같으면 설정하지 않고, 같지 않으면 입력한 element로 교체한다.
            * @attribute labelEl
            * @type HTMLElement
            */
            this.setAttributeConfig(
                LABEL_EL,
                {
                    value: attr[LABEL_EL] || this._getLabelEl(),
                    method: function(value) {
                        value = Dom.get(value);
                        var current = this.get(LABEL_EL);

                        if (current) {
                            if (current == value) {
                                return false; // already set
                            }

                            current.parentNode.replaceChild(value, current);
                            this.set(LABEL, value.innerHTML);
                        }
                    }
                }
            );
            /**
            * @description The tab's label text (or innerHTML).  없으면 labelEl 생성해서 설정
            * @attribute label
            * @type String
            */
            this.setAttributeConfig(
                LABEL,
                {
                    value: attr.label || this._getLabel(),
                    method: function(value) {
                        var labelEl = this.get(LABEL_EL);
                        if (!labelEl) { // create if needed
                            this.set(LABEL_EL, this._createLabelEl());
                        }

                        labelEl.innerHTML = value;
                    }
                }); /**
            * @description The HTMLElement that contains the tab's content. 없으면 div 생성.
            * @attribute contentEl
            * @type HTMLElement
            */
            this.setAttributeConfig(
                CONTENT_EL,
                {
                    value: attr[CONTENT_EL] || document.createElement('div'),
                    method: function(value) {
                        value = Dom.get(value);
                        var current = this.get(CONTENT_EL);

                        if (current) {
                            if (current === value) {
                                return false; // already set
                            }
                            if (!this.get('selected')) {
                                Dom.addClass(value, 'L-nav-hidden');
                            }
                            current.parentNode.replaceChild(value, current);
                            this.set(CONTENT, value.innerHTML);
                        }
                    }
                });

            /**
            * @description The tab's content. CONTENT_EL의 innerHTML에 할달될 내용
            * @attribute content
            * @type String
            */
            this.setAttributeConfig(CONTENT, {
                value: attr[CONTENT],
                method: function(value) {
                    DU.util.LDom.appendHtml(this.get(CONTENT_EL), value);
                    //this.get(CONTENT_EL).innerHTML = value;                    
                }
            });

            /**
            * @description The tab's data source, used for loading content dynamically.
            * @attribute dataSrc
            * @type String
            */
            this.setAttributeConfig(DATA_SRC, {
                value: attr.dataSrc
            });

            /**
            * @description Content를 볼때 cache할지 여부. Whether or not content should be reloaded for every view.
            * @attribute cacheData
            * @type Boolean
            * @default false
            */
            this.setAttributeConfig(CACHE_DATA, {
                value: attr.cacheData || false,
                validator: DU.isBoolean
            });

            /**
            * @description data request시 사용될 method (POST|GET). The method to use for the data request.
            * @attribute loadMethod
            * @type String
            * @default "GET"
            */
            this.setAttributeConfig(LOAD_METHOD, {
                value: attr.loadMethod || 'GET',
                validator: DU.isString
            });

            /**
            * @description data request에 의해 data가 load되었는지 여부, Whether or not any data has been loaded from the server.
            * @attribute dataLoaded
            * @type Boolean
            */
            this.setAttributeConfig(DATA_LOADED, {
                value: false,
                validator: DU.isBoolean,
                writeOnce: true
            });

            /**
            * @description data request에 대한 응답 대기 종료 시간, Number if milliseconds before aborting and calling failure handler.
            * @attribute dataTimeout
            * @type Number
            * @default null
            */
            this.setAttributeConfig(DATA_TIMEOUT, {
                value: attr.dataTimeout || null,
                validator: DU.isNumber
            });

            /**
            * @description POST로 request시 argument, Arguments to pass when POST method is used 
            * @attribute postData
            * @default null
            */
            this.setAttributeConfig(POST_DATA, {
                value: attr.postData || null
            });

            /**
            * @description 현재 tab이 active이지 여부 
            * Whether or not the tab is currently active.
            * If a dataSrc is set for the tab, the content will be loaded from
            * the given source.
            * @attribute active
            * @type Boolean
            */
            this.setAttributeConfig('active', {
                value: attr.active || this.hasClass(this.ACTIVE_CLASSNAME),
                method: function(value) {
                    if (value === true) {
                        this.addClass(this.ACTIVE_CLASSNAME);
                        this.set('title', this.ACTIVE_TITLE);
                    } else {
                        this.removeClass(this.ACTIVE_CLASSNAME);
                        this.set('title', '');
                    }
                },
                validator: function(value) {
                    return DU.isBoolean(value) && !this.get(DISABLED);
                }
            });

            /**
            * @description Whether or not the tab is disabled.
            * @attribute disabled
            * @type Boolean
            */
            this.setAttributeConfig(DISABLED, {
                value: attr.disabled || this.hasClass(this.DISABLED_CLASSNAME),
                method: function(value) {
                    if (value === true) {
                        Dom.addClass(this.get(ELEMENT), this.DISABLED_CLASSNAME);
                    } else {
                        Dom.removeClass(this.get(ELEMENT), this.DISABLED_CLASSNAME);
                    }
                },
                validator: DU.isBoolean
            });

            /**
            * @description The href of the tab's anchor element.
            * @attribute href
            * @type String
            * @default '#'
            */
            this.setAttributeConfig('href', {
                value: attr.href ||
                        this.getElementsByTagName('a')[0].getAttribute('href', 2) || '#',
                method: function(value) {
                    this.getElementsByTagName('a')[0].href = value;
                },
                validator: DU.isString
            });

            /**
            * @description The Whether or not the tab's content is visible.
            * @attribute contentVisible
            * @type Boolean
            * @default false
            */
            this.setAttributeConfig('contentVisible', {
                value: attr.contentVisible,
                method: function(value) {
                    if (value) {
                        Dom.removeClass(this.get(CONTENT_EL), this.HIDDEN_CLASSNAME);

                        if (this.get(DATA_SRC)) {
                            // load dynamic content unless already loading or loaded and caching
                            if (!this._loading && !(this.get(DATA_LOADED) && this.get(CACHE_DATA))) {
                                this._dataConnect();
                            }
                        }
                    } else {
                        Dom.addClass(this.get(CONTENT_EL), this.HIDDEN_CLASSNAME);
                    }
                },
                validator: DU.isBoolean
            });

            /**
            * @description DataSet으로 설정시 record id 저장
            * @attribute recordId
            * @default null
            */
            this.setAttributeConfig(RECORED_ID, {
                value: attr.recordId || null
            });        
        },

        _dataConnect: function() {
            if (!DU.LConnect) {
                return false;
            }

            Dom.addClass(this.get(CONTENT_EL).parentNode, this.LOADING_CLASSNAME);
            this._loading = true;
            this.dataConnection = DU.LConnect.asyncRequest(
                this.get(LOAD_METHOD),
                this.get(DATA_SRC),
                {
                    success: function(o) {
                        this.loadHandler.success.call(this, o);
                        this.set(DATA_LOADED, true);
                        this.dataConnection = null;
                        Dom.removeClass(this.get(CONTENT_EL).parentNode,
                                this.LOADING_CLASSNAME);
                        this._loading = false;
                    },
                    failure: function(o) {
                        this.loadHandler.failure.call(this, o);
                        this.dataConnection = null;
                        Dom.removeClass(this.get(CONTENT_EL).parentNode,
                                this.LOADING_CLASSNAME);
                        this._loading = false;
                    },
                    scope: this,
                    timeout: this.get(DATA_TIMEOUT)
                },

                this.get(POST_DATA)
            );
        },
        _createTabElement: function(attr) {
            var el = document.createElement('li'),
                a = document.createElement('a'),
                label = attr.label || null,
                labelEl = attr.labelEl || null;

            a.href = attr.href || '#'; // TODO: Use Dom.setAttribute?
            el.appendChild(a);

            if (labelEl) { // user supplied labelEl
                if (!label) { // user supplied label
                    label = this._getLabel();
                }
            } else {
                labelEl = this._createLabelEl();
            }

            a.appendChild(labelEl);

            return el;
        },

        _getLabelEl: function() {
            return this.getElementsByTagName(this.LABEL_TAGNAME)[0];
        },

        _createLabelEl: function() {
            var el = document.createElement(this.LABEL_TAGNAME);
            return el;
        },


        _getLabel: function() {
            var el = this.get(LABEL_EL);

            if (!el) {
                return undefined;
            }

            return el.innerHTML;
        },

        _onActivate: function(e, tabview) {
            var tab = this,
                silent = false;


            DU.util.LEvent.preventDefault(e);
            if (tab === tabview.get(ACTIVE_TAB)) {
                silent = true; // dont fire activeTabChange if already active
            }
            tabview.set(ACTIVE_TAB, tab, silent);
        }
    });


    /**
    * @description Fires when a tab is removed from the tabview
    * @event remove
    * @type LCustomEvent
    * @param {Event} An event object with fields for "type" ("remove")
    * and "tabview" (the tabview instance it was removed from) 
    */

    DU.widget.LTab = LTab;
})();

