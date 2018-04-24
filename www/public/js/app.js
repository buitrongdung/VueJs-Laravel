webpackJsonp([0],[
/* 0 */,
/* 1 */
/***/ (function(module, exports) {

/* globals __VUE_SSR_CONTEXT__ */

// IMPORTANT: Do NOT use ES2015 features in this file.
// This module is a runtime utility for cleaner component module output and will
// be included in the final webpack user bundle.

module.exports = function normalizeComponent (
  rawScriptExports,
  compiledTemplate,
  functionalTemplate,
  injectStyles,
  scopeId,
  moduleIdentifier /* server only */
) {
  var esModule
  var scriptExports = rawScriptExports = rawScriptExports || {}

  // ES6 modules interop
  var type = typeof rawScriptExports.default
  if (type === 'object' || type === 'function') {
    esModule = rawScriptExports
    scriptExports = rawScriptExports.default
  }

  // Vue.extend constructor export interop
  var options = typeof scriptExports === 'function'
    ? scriptExports.options
    : scriptExports

  // render functions
  if (compiledTemplate) {
    options.render = compiledTemplate.render
    options.staticRenderFns = compiledTemplate.staticRenderFns
    options._compiled = true
  }

  // functional template
  if (functionalTemplate) {
    options.functional = true
  }

  // scopedId
  if (scopeId) {
    options._scopeId = scopeId
  }

  var hook
  if (moduleIdentifier) { // server build
    hook = function (context) {
      // 2.3 injection
      context =
        context || // cached call
        (this.$vnode && this.$vnode.ssrContext) || // stateful
        (this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext) // functional
      // 2.2 with runInNewContext: true
      if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
        context = __VUE_SSR_CONTEXT__
      }
      // inject component styles
      if (injectStyles) {
        injectStyles.call(this, context)
      }
      // register component module identifier for async chunk inferrence
      if (context && context._registeredComponents) {
        context._registeredComponents.add(moduleIdentifier)
      }
    }
    // used by ssr in case component is cached and beforeCreate
    // never gets called
    options._ssrRegister = hook
  } else if (injectStyles) {
    hook = injectStyles
  }

  if (hook) {
    var functional = options.functional
    var existing = functional
      ? options.render
      : options.beforeCreate

    if (!functional) {
      // inject component registration as beforeCreate hook
      options.beforeCreate = existing
        ? [].concat(existing, hook)
        : [hook]
    } else {
      // for template-only hot-reload because in that case the render fn doesn't
      // go through the normalizer
      options._injectStyles = hook
      // register for functioal component in vue file
      options.render = function renderWithStyleInjection (h, context) {
        hook.call(context)
        return existing(h, context)
      }
    }
  }

  return {
    esModule: esModule,
    exports: scriptExports,
    options: options
  }
}


/***/ }),
/* 2 */,
/* 3 */,
/* 4 */,
/* 5 */,
/* 6 */,
/* 7 */,
/* 8 */,
/* 9 */,
/* 10 */,
/* 11 */,
/* 12 */,
/* 13 */
/***/ (function(module, exports) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
// css base code, injected by the css-loader
module.exports = function(useSourceMap) {
	var list = [];

	// return the list of modules as css string
	list.toString = function toString() {
		return this.map(function (item) {
			var content = cssWithMappingToString(item, useSourceMap);
			if(item[2]) {
				return "@media " + item[2] + "{" + content + "}";
			} else {
				return content;
			}
		}).join("");
	};

	// import a list of modules into the list
	list.i = function(modules, mediaQuery) {
		if(typeof modules === "string")
			modules = [[null, modules, ""]];
		var alreadyImportedModules = {};
		for(var i = 0; i < this.length; i++) {
			var id = this[i][0];
			if(typeof id === "number")
				alreadyImportedModules[id] = true;
		}
		for(i = 0; i < modules.length; i++) {
			var item = modules[i];
			// skip already imported module
			// this implementation is not 100% perfect for weird media query combinations
			//  when a module is imported multiple times with different media queries.
			//  I hope this will never occur (Hey this way we have smaller bundles)
			if(typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
				if(mediaQuery && !item[2]) {
					item[2] = mediaQuery;
				} else if(mediaQuery) {
					item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
				}
				list.push(item);
			}
		}
	};
	return list;
};

function cssWithMappingToString(item, useSourceMap) {
	var content = item[1] || '';
	var cssMapping = item[3];
	if (!cssMapping) {
		return content;
	}

	if (useSourceMap && typeof btoa === 'function') {
		var sourceMapping = toComment(cssMapping);
		var sourceURLs = cssMapping.sources.map(function (source) {
			return '/*# sourceURL=' + cssMapping.sourceRoot + source + ' */'
		});

		return [content].concat(sourceURLs).concat([sourceMapping]).join('\n');
	}

	return [content].join('\n');
}

// Adapted from convert-source-map (MIT)
function toComment(sourceMap) {
	// eslint-disable-next-line no-undef
	var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap))));
	var data = 'sourceMappingURL=data:application/json;charset=utf-8;base64,' + base64;

	return '/*# ' + data + ' */';
}


/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
  Modified by Evan You @yyx990803
*/

var hasDocument = typeof document !== 'undefined'

if (typeof DEBUG !== 'undefined' && DEBUG) {
  if (!hasDocument) {
    throw new Error(
    'vue-style-loader cannot be used in a non-browser environment. ' +
    "Use { target: 'node' } in your Webpack config to indicate a server-rendering environment."
  ) }
}

var listToStyles = __webpack_require__(47)

/*
type StyleObject = {
  id: number;
  parts: Array<StyleObjectPart>
}

type StyleObjectPart = {
  css: string;
  media: string;
  sourceMap: ?string
}
*/

var stylesInDom = {/*
  [id: number]: {
    id: number,
    refs: number,
    parts: Array<(obj?: StyleObjectPart) => void>
  }
*/}

var head = hasDocument && (document.head || document.getElementsByTagName('head')[0])
var singletonElement = null
var singletonCounter = 0
var isProduction = false
var noop = function () {}
var options = null
var ssrIdKey = 'data-vue-ssr-id'

// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
// tags it will allow on a page
var isOldIE = typeof navigator !== 'undefined' && /msie [6-9]\b/.test(navigator.userAgent.toLowerCase())

module.exports = function (parentId, list, _isProduction, _options) {
  isProduction = _isProduction

  options = _options || {}

  var styles = listToStyles(parentId, list)
  addStylesToDom(styles)

  return function update (newList) {
    var mayRemove = []
    for (var i = 0; i < styles.length; i++) {
      var item = styles[i]
      var domStyle = stylesInDom[item.id]
      domStyle.refs--
      mayRemove.push(domStyle)
    }
    if (newList) {
      styles = listToStyles(parentId, newList)
      addStylesToDom(styles)
    } else {
      styles = []
    }
    for (var i = 0; i < mayRemove.length; i++) {
      var domStyle = mayRemove[i]
      if (domStyle.refs === 0) {
        for (var j = 0; j < domStyle.parts.length; j++) {
          domStyle.parts[j]()
        }
        delete stylesInDom[domStyle.id]
      }
    }
  }
}

function addStylesToDom (styles /* Array<StyleObject> */) {
  for (var i = 0; i < styles.length; i++) {
    var item = styles[i]
    var domStyle = stylesInDom[item.id]
    if (domStyle) {
      domStyle.refs++
      for (var j = 0; j < domStyle.parts.length; j++) {
        domStyle.parts[j](item.parts[j])
      }
      for (; j < item.parts.length; j++) {
        domStyle.parts.push(addStyle(item.parts[j]))
      }
      if (domStyle.parts.length > item.parts.length) {
        domStyle.parts.length = item.parts.length
      }
    } else {
      var parts = []
      for (var j = 0; j < item.parts.length; j++) {
        parts.push(addStyle(item.parts[j]))
      }
      stylesInDom[item.id] = { id: item.id, refs: 1, parts: parts }
    }
  }
}

function createStyleElement () {
  var styleElement = document.createElement('style')
  styleElement.type = 'text/css'
  head.appendChild(styleElement)
  return styleElement
}

function addStyle (obj /* StyleObjectPart */) {
  var update, remove
  var styleElement = document.querySelector('style[' + ssrIdKey + '~="' + obj.id + '"]')

  if (styleElement) {
    if (isProduction) {
      // has SSR styles and in production mode.
      // simply do nothing.
      return noop
    } else {
      // has SSR styles but in dev mode.
      // for some reason Chrome can't handle source map in server-rendered
      // style tags - source maps in <style> only works if the style tag is
      // created and inserted dynamically. So we remove the server rendered
      // styles and inject new ones.
      styleElement.parentNode.removeChild(styleElement)
    }
  }

  if (isOldIE) {
    // use singleton mode for IE9.
    var styleIndex = singletonCounter++
    styleElement = singletonElement || (singletonElement = createStyleElement())
    update = applyToSingletonTag.bind(null, styleElement, styleIndex, false)
    remove = applyToSingletonTag.bind(null, styleElement, styleIndex, true)
  } else {
    // use multi-style-tag mode in all other cases
    styleElement = createStyleElement()
    update = applyToTag.bind(null, styleElement)
    remove = function () {
      styleElement.parentNode.removeChild(styleElement)
    }
  }

  update(obj)

  return function updateStyle (newObj /* StyleObjectPart */) {
    if (newObj) {
      if (newObj.css === obj.css &&
          newObj.media === obj.media &&
          newObj.sourceMap === obj.sourceMap) {
        return
      }
      update(obj = newObj)
    } else {
      remove()
    }
  }
}

var replaceText = (function () {
  var textStore = []

  return function (index, replacement) {
    textStore[index] = replacement
    return textStore.filter(Boolean).join('\n')
  }
})()

function applyToSingletonTag (styleElement, index, remove, obj) {
  var css = remove ? '' : obj.css

  if (styleElement.styleSheet) {
    styleElement.styleSheet.cssText = replaceText(index, css)
  } else {
    var cssNode = document.createTextNode(css)
    var childNodes = styleElement.childNodes
    if (childNodes[index]) styleElement.removeChild(childNodes[index])
    if (childNodes.length) {
      styleElement.insertBefore(cssNode, childNodes[index])
    } else {
      styleElement.appendChild(cssNode)
    }
  }
}

function applyToTag (styleElement, obj) {
  var css = obj.css
  var media = obj.media
  var sourceMap = obj.sourceMap

  if (media) {
    styleElement.setAttribute('media', media)
  }
  if (options.ssrId) {
    styleElement.setAttribute(ssrIdKey, obj.id)
  }

  if (sourceMap) {
    // https://developer.chrome.com/devtools/docs/javascript-debugging
    // this makes source maps inside style tags work properly in Chrome
    css += '\n/*# sourceURL=' + sourceMap.sources[0] + ' */'
    // http://stackoverflow.com/a/26603875
    css += '\n/*# sourceMappingURL=data:application/json;base64,' + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + ' */'
  }

  if (styleElement.styleSheet) {
    styleElement.styleSheet.cssText = css
  } else {
    while (styleElement.firstChild) {
      styleElement.removeChild(styleElement.firstChild)
    }
    styleElement.appendChild(document.createTextNode(css))
  }
}


/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(16);
__webpack_require__(70);
module.exports = __webpack_require__(71);


/***/ }),
/* 16 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_vue__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_vue__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_axios__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_axios___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_axios__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_vue_axios__ = __webpack_require__(37);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_vue_axios___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2_vue_axios__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_vue_breadcrumbs__ = __webpack_require__(38);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_vue_breadcrumbs___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3_vue_breadcrumbs__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_vue_progressbar__ = __webpack_require__(39);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_vue_progressbar___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_4_vue_progressbar__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__routes__ = __webpack_require__(40);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__components_views_layouts_Sidebar_vue__ = __webpack_require__(67);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__components_views_layouts_Sidebar_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_6__components_views_layouts_Sidebar_vue__);









__WEBPACK_IMPORTED_MODULE_0_vue___default.a.use(__WEBPACK_IMPORTED_MODULE_2_vue_axios___default.a, __WEBPACK_IMPORTED_MODULE_1_axios___default.a);
__WEBPACK_IMPORTED_MODULE_0_vue___default.a.use(__WEBPACK_IMPORTED_MODULE_3_vue_breadcrumbs___default.a, {
    template: '<div id="breadcrumb" v-if="$breadcrumbs.length">' + '<router-link class="breadcrumb-item" v-for="(crumb, key) in $breadcrumbs" :to="linkProp(crumb)" :key="key">{{ crumb | crumbText }}</router-link> ' + '</div>' });
__WEBPACK_IMPORTED_MODULE_0_vue___default.a.use(__WEBPACK_IMPORTED_MODULE_4_vue_progressbar___default.a, { color: 'rgb(143, 255, 199)', failedColor: 'red', height: '2px' });

window.onload = function () {
    new __WEBPACK_IMPORTED_MODULE_0_vue___default.a({
        router: __WEBPACK_IMPORTED_MODULE_5__routes__["a" /* default */],
        components: {
            Sidebar: __WEBPACK_IMPORTED_MODULE_6__components_views_layouts_Sidebar_vue___default.a
        }
    }).$mount('#home-app');
};

/***/ }),
/* 17 */,
/* 18 */,
/* 19 */,
/* 20 */,
/* 21 */,
/* 22 */,
/* 23 */,
/* 24 */,
/* 25 */,
/* 26 */,
/* 27 */,
/* 28 */,
/* 29 */,
/* 30 */,
/* 31 */,
/* 32 */,
/* 33 */,
/* 34 */,
/* 35 */,
/* 36 */,
/* 37 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;var _typeof="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(o){return typeof o}:function(o){return o&&"function"==typeof Symbol&&o.constructor===Symbol&&o!==Symbol.prototype?"symbol":typeof o};!function(){function o(e,t){if(!o.installed){if(o.installed=!0,!t)return void console.error("You have to install axios");e.axios=t,Object.defineProperties(e.prototype,{axios:{get:function(){return t}},$http:{get:function(){return t}}})}}"object"==( false?"undefined":_typeof(exports))?module.exports=o: true?!(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = (function(){return o}).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)):window.Vue&&window.axios&&Vue.use(o,window.axios)}();

/***/ }),
/* 38 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*!
 * vue-breadcrumbs v1.1.1
 * (c) 2017 Sam Turrell
 * Released under the MIT License.
 */


function install(Vue, options) {
  function getMatchedRoutes(routes) {
    // Convert to an array if Vue 1.x
    if (parseFloat(Vue.version) < 2) {
      routes = Object.keys(routes).filter(function (key) {
        return !isNaN(key);
      }).map(function (key) {
        return routes[key];
      });
    }

    return routes;
  }

  // Add the $breadcrumbs property to the Vue instance
  Object.defineProperty(Vue.prototype, '$breadcrumbs', {
    get: function get() {
      var crumbs = [];

      var matched = getMatchedRoutes(this.$route.matched);

      matched.forEach(function (route) {
        // Backwards compatibility
        var hasBreadcrumb = parseFloat(Vue.version) < 2 ? route.handler && route.handler.breadcrumb : route.meta && route.meta.breadcrumb;

        if (hasBreadcrumb) {
          crumbs.push(route);
        }
      });

      return crumbs;
    }
  });

  var defaults = {
    methods: {
      // Return the correct prop data
      linkProp: function linkProp(crumb) {
        // If it's a named route, we'll base the route
        // off of that instead
        if (crumb.name || crumb.handler && crumb.handler.name) {
          return {
            name: crumb.name || crumb.handler.name,
            params: this.$route.params
          };
        }

        return {
          path: crumb.handler && crumb.handler.fullPath ? crumb.handler.fullPath : crumb.path,
          params: this.$route.params
        };
      }
    },

    filters: {
      // Display the correct breadcrumb text
      // depending on the Vue version
      crumbText: function crumbText(crumb) {
        return parseFloat(Vue.version) < 2 ? crumb.handler.breadcrumb : crumb.meta.breadcrumb;
      }
    },

    template: '<nav class="breadcrumbs" v-if="$breadcrumbs.length"> ' + '<ul> ' + '<li v-for="crumb in $breadcrumbs"> ' + '<router-link :to="linkProp(crumb)">{{ crumb | crumbText }}</router-link> ' + '</li> ' + '</ul> ' + '</nav>'
  };

  // Add a default breadcrumbs component
  Vue.component('breadcrumbs', Object.assign(defaults, options));
}

var index = {
  install: install,
  version: '0.3.1'
};

module.exports = index;

/***/ }),
/* 39 */
/***/ (function(module, exports, __webpack_require__) {

!function(t,o){ true?module.exports=o():"function"==typeof define&&define.amd?define(o):t.VueProgressBar=o()}(this,function(){"use strict";!function(){if("undefined"!=typeof document){var t=document.head||document.getElementsByTagName("head")[0],o=document.createElement("style"),i=" .__cov-progress { position: fixed; opacity: 1; z-index: 999999; } ";o.type="text/css",o.styleSheet?o.styleSheet.cssText=i:o.appendChild(document.createTextNode(i)),t.appendChild(o)}}();var t="undefined"!=typeof window,r={render:function(){var t=this,o=t.$createElement;return(t._self._c||o)("div",{staticClass:"__cov-progress",style:t.style})},staticRenderFns:[],name:"VueProgress",serverCacheKey:function(){return"Progress"},computed:{style:function(){var t=this.progress.options.location,o={"background-color":this.progress.options.canSuccess?this.progress.options.color:this.progress.options.failedColor,opacity:this.progress.options.show?1:0};return"top"==t||"bottom"==t?("top"===t?o.top="0px":o.bottom="0px",this.progress.options.inverse?o.right="0px":o.left="0px",o.width=this.progress.percent+"%",o.height=this.progress.options.thickness,o.transition="width "+this.progress.options.transition.speed+", opacity "+this.progress.options.transition.opacity):"left"!=t&&"right"!=t||("left"===t?o.left="0px":o.right="0px",this.progress.options.inverse?o.top="0px":o.bottom="0px",o.height=this.progress.percent+"%",o.width=this.progress.options.thickness,o.transition="height "+this.progress.options.transition.speed+", opacity "+this.progress.options.transition.opacity),o},progress:function(){return t?window.VueProgressBarEventBus.RADON_LOADING_BAR:{percent:0,options:{canSuccess:!0,show:!1,color:"rgb(19, 91, 55)",failedColor:"red",thickness:"2px",transition:{speed:"0.2s",opacity:"0.6s",termination:300},location:"top",autoRevert:!0,inverse:!1}}}}};return{install:function(o){var t=1<arguments.length&&void 0!==arguments[1]?arguments[1]:{},i=(o.version.split(".")[0],"undefined"!=typeof window),e={$vm:null,state:{tFailColor:"",tColor:"",timer:null,cut:0},init:function(t){this.$vm=t},start:function(t){var o=this;this.$vm&&(t||(t=3e3),this.$vm.RADON_LOADING_BAR.percent=0,this.$vm.RADON_LOADING_BAR.options.show=!0,this.$vm.RADON_LOADING_BAR.options.canSuccess=!0,this.state.cut=1e4/Math.floor(t),clearInterval(this.state.timer),this.state.timer=setInterval(function(){o.increase(o.state.cut*Math.random()),95<o.$vm.RADON_LOADING_BAR.percent&&o.$vm.RADON_LOADING_BAR.options.autoFinish&&o.finish()},100))},set:function(t){this.$vm.RADON_LOADING_BAR.options.show=!0,this.$vm.RADON_LOADING_BAR.options.canSuccess=!0,this.$vm.RADON_LOADING_BAR.percent=Math.floor(t)},get:function(){return Math.floor(this.$vm.RADON_LOADING_BAR.percent)},increase:function(t){this.$vm.RADON_LOADING_BAR.percent=Math.min(99,this.$vm.RADON_LOADING_BAR.percent+Math.floor(t))},decrease:function(t){this.$vm.RADON_LOADING_BAR.percent=this.$vm.RADON_LOADING_BAR.percent-Math.floor(t)},hide:function(){var t=this;clearInterval(this.state.timer),this.state.timer=null,setTimeout(function(){t.$vm.RADON_LOADING_BAR.options.show=!1,o.nextTick(function(){setTimeout(function(){t.$vm.RADON_LOADING_BAR.percent=0},100),t.$vm.RADON_LOADING_BAR.options.autoRevert&&setTimeout(function(){t.revert()},300)})},this.$vm.RADON_LOADING_BAR.options.transition.termination)},pause:function(){clearInterval(this.state.timer)},finish:function(){this.$vm&&(this.$vm.RADON_LOADING_BAR.percent=100,this.hide())},fail:function(){this.$vm.RADON_LOADING_BAR.options.canSuccess=!1,this.$vm.RADON_LOADING_BAR.percent=100,this.hide()},setFailColor:function(t){this.$vm.RADON_LOADING_BAR.options.failedColor=t},setColor:function(t){this.$vm.RADON_LOADING_BAR.options.color=t},setLocation:function(t){this.$vm.RADON_LOADING_BAR.options.location=t},setTransition:function(t){this.$vm.RADON_LOADING_BAR.options.transition=t},tempFailColor:function(t){this.state.tFailColor=this.$vm.RADON_LOADING_BAR.options.failedColor,this.$vm.RADON_LOADING_BAR.options.failedColor=t},tempColor:function(t){this.state.tColor=this.$vm.RADON_LOADING_BAR.options.color,this.$vm.RADON_LOADING_BAR.options.color=t},tempLocation:function(t){this.state.tLocation=this.$vm.RADON_LOADING_BAR.options.location,this.$vm.RADON_LOADING_BAR.options.location=t},tempTransition:function(t){this.state.tTransition=this.$vm.RADON_LOADING_BAR.options.transition,this.$vm.RADON_LOADING_BAR.options.transition=t},revertColor:function(){this.$vm.RADON_LOADING_BAR.options.color=this.state.tColor,this.state.tColor=""},revertFailColor:function(){this.$vm.RADON_LOADING_BAR.options.failedColor=this.state.tFailColor,this.state.tFailColor=""},revertLocation:function(){this.$vm.RADON_LOADING_BAR.options.location=this.state.tLocation,this.state.tLocation=""},revertTransition:function(){this.$vm.RADON_LOADING_BAR.options.transition=this.state.tTransition,this.state.tTransition={}},revert:function(){this.$vm.RADON_LOADING_BAR.options.autoRevert&&(this.state.tColor&&this.revertColor(),this.state.tFailColor&&this.revertFailColor(),this.state.tLocation&&this.revertLocation(),!this.state.tTransition||void 0===this.state.tTransition.speed&&void 0===this.state.tTransition.opacity||this.revertTransition())},parseMeta:function(t){for(var o in t.func){var i=t.func[o];switch(i.call){case"color":switch(i.modifier){case"set":this.setColor(i.argument);break;case"temp":this.tempColor(i.argument)}break;case"fail":switch(i.modifier){case"set":this.setFailColor(i.argument);break;case"temp":this.tempFailColor(i.argument)}break;case"location":switch(i.modifier){case"set":this.setLocation(i.argument);break;case"temp":this.tempLocation(i.argument)}break;case"transition":switch(i.modifier){case"set":this.setTransition(i.argument);break;case"temp":this.tempTransition(i.argument)}}}}},s=function(t,o){for(var i,e,s=1;s<arguments.length;++s)for(i in e=arguments[s])Object.prototype.hasOwnProperty.call(e,i)&&(t[i]=e[i]);return t}({canSuccess:!0,show:!1,color:"#73ccec",failedColor:"red",thickness:"2px",transition:{speed:"0.2s",opacity:"0.6s",termination:300},autoRevert:!0,location:"top",inverse:!1,autoFinish:!0},t),n=new o({data:{RADON_LOADING_BAR:{percent:0,options:s}}});i&&(window.VueProgressBarEventBus=n,e.init(n)),o.component("vue-progress-bar",r),o.prototype.$Progress=e}}});


/***/ }),
/* 40 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_vue__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_vue__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_vue_router__ = __webpack_require__(12);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__components_views_Home_vue__ = __webpack_require__(41);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__components_views_Home_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2__components_views_Home_vue__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__components_views_NotFound_vue__ = __webpack_require__(44);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__components_views_NotFound_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3__components_views_NotFound_vue__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__components_views_employee_Employee_vue__ = __webpack_require__(55);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__components_views_employee_Employee_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_4__components_views_employee_Employee_vue__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__components_views_employee_ListEmployee_vue__ = __webpack_require__(58);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__components_views_employee_ListEmployee_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_5__components_views_employee_ListEmployee_vue__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__components_views_employee_EmployeeNew_vue__ = __webpack_require__(61);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__components_views_employee_EmployeeNew_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_6__components_views_employee_EmployeeNew_vue__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__components_views_employee_EmployeeDetail_vue__ = __webpack_require__(64);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__components_views_employee_EmployeeDetail_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_7__components_views_employee_EmployeeDetail_vue__);











__WEBPACK_IMPORTED_MODULE_0_vue___default.a.use(__WEBPACK_IMPORTED_MODULE_1_vue_router__["default"]);

var routes = [{ path: '/dashboard', name: 'home', component: __WEBPACK_IMPORTED_MODULE_2__components_views_Home_vue___default.a, meta: { breadcrumb: 'Home' } },
// {path: '/employee', redirect: '/employee/list'},
{
    path: '/employee',
    name: 'employee',
    component: __WEBPACK_IMPORTED_MODULE_4__components_views_employee_Employee_vue___default.a,
    redirect: 'employee/',
    meta: { permission: 'any', fail: '/', title: 'Employee', breadcrumb: 'Employee' },
    children: [{ path: '', name: 'employee-list', component: __WEBPACK_IMPORTED_MODULE_5__components_views_employee_ListEmployee_vue___default.a, meta: { permission: 'any', fail: '/', breadcrumb: 'List' } }, { path: ':idEmp/detail', name: 'employee-detail', component: __WEBPACK_IMPORTED_MODULE_7__components_views_employee_EmployeeDetail_vue___default.a, meta: { permission: 'any', fail: '/', breadcrumb: 'Detail' } }, { path: 'new', name: 'employee-new', component: __WEBPACK_IMPORTED_MODULE_6__components_views_employee_EmployeeNew_vue___default.a, meta: { permission: 'any', fail: '/', breadcrumb: 'New' } }]
}, {
    path: '/404',
    name: 'notFound',
    component: __WEBPACK_IMPORTED_MODULE_3__components_views_NotFound_vue___default.a
}, { path: '*', component: __WEBPACK_IMPORTED_MODULE_3__components_views_NotFound_vue___default.a, meta: { title: 'not found' }

    // {path: '/menu/:idMenu', name: 'menuDetail', component: MenuDetail, meta: {permission: 'any', fail: '/'}}
}];

/* harmony default export */ __webpack_exports__["a"] = (new __WEBPACK_IMPORTED_MODULE_1_vue_router__["default"]({
    mode: 'history',
    routes: routes,
    redirect: { '*': '/' }
}));

/***/ }),
/* 41 */
/***/ (function(module, exports, __webpack_require__) {

var disposed = false
var normalizeComponent = __webpack_require__(1)
/* script */
var __vue_script__ = __webpack_require__(42)
/* template */
var __vue_template__ = __webpack_require__(43)
/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = null
/* scopeId */
var __vue_scopeId__ = null
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __vue_script__,
  __vue_template__,
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "resources\\assets\\js\\components\\views\\Home.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-03a755c4", Component.options)
  } else {
    hotAPI.reload("data-v-03a755c4", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

module.exports = Component.exports


/***/ }),
/* 42 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
//
//
//
//
//

/* harmony default export */ __webpack_exports__["default"] = ({
    name: 'home'
});

/***/ }),
/* 43 */
/***/ (function(module, exports, __webpack_require__) {

var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _vm._m(0)
}
var staticRenderFns = [
  function() {
    var _vm = this
    var _h = _vm.$createElement
    var _c = _vm._self._c || _h
    return _c("div", [_c("h3", [_vm._v("Dashboard")])])
  }
]
render._withStripped = true
module.exports = { render: render, staticRenderFns: staticRenderFns }
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-03a755c4", module.exports)
  }
}

/***/ }),
/* 44 */
/***/ (function(module, exports, __webpack_require__) {

var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(45)
}
var normalizeComponent = __webpack_require__(1)
/* script */
var __vue_script__ = __webpack_require__(48)
/* template */
var __vue_template__ = __webpack_require__(54)
/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = injectStyle
/* scopeId */
var __vue_scopeId__ = null
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __vue_script__,
  __vue_template__,
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "resources\\assets\\js\\components\\views\\NotFound.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-d0039a58", Component.options)
  } else {
    hotAPI.reload("data-v-d0039a58", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

module.exports = Component.exports


/***/ }),
/* 45 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(46);
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var update = __webpack_require__(14)("64ee42b6", content, false, {});
// Hot Module Replacement
if(false) {
 // When the styles change, update the <style> tags
 if(!content.locals) {
   module.hot.accept("!!../../../../../node_modules/css-loader/index.js?sourceMap!../../../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-d0039a58\",\"scoped\":false,\"hasInlineConfig\":true}!../../../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./NotFound.vue", function() {
     var newContent = require("!!../../../../../node_modules/css-loader/index.js?sourceMap!../../../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-d0039a58\",\"scoped\":false,\"hasInlineConfig\":true}!../../../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./NotFound.vue");
     if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
     update(newContent);
   });
 }
 // When the module is disposed, remove the <style> tags
 module.hot.dispose(function() { update(); });
}

/***/ }),
/* 46 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(13)(true);
// imports


// module
exports.push([module.i, "\n#not-found {\n    margin-top: 10%;\n}\n", "", {"version":3,"sources":["D:/laravel/www/resources/assets/js/components/views/resources/assets/js/components/views/NotFound.vue"],"names":[],"mappings":";AA4BA;IACA,gBAAA;CACA","file":"NotFound.vue","sourcesContent":["<template>\r\n    <section class=\"container margin-top-1 col-7\" id=\"not-found\">\r\n        <div class=\"no-content-wrapper user-select\">\r\n            <map-icon width=\"260\" height=\"260\"></map-icon>\r\n            <p v-text=\"message\"></p>\r\n        </div>\r\n    </section>\r\n</template>\r\n\r\n\r\n<script>\r\n    import MapIcon from './Icons/MapIcon.vue';\r\n\r\n    export default {\r\n        components: {\r\n            MapIcon\r\n        },\r\n\r\n        data() {\r\n            return {\r\n                message:\r\n                    \"I hate to be the one breaking it to you, but you've been given a wrong address!\"\r\n            };\r\n        }\r\n    };\r\n</script>\r\n\r\n<style>\r\n    #not-found {\r\n        margin-top: 10%;\r\n    }\r\n</style>\r\n"],"sourceRoot":""}]);

// exports


/***/ }),
/* 47 */
/***/ (function(module, exports) {

/**
 * Translates the list format produced by css-loader into something
 * easier to manipulate.
 */
module.exports = function listToStyles (parentId, list) {
  var styles = []
  var newStyles = {}
  for (var i = 0; i < list.length; i++) {
    var item = list[i]
    var id = item[0]
    var css = item[1]
    var media = item[2]
    var sourceMap = item[3]
    var part = {
      id: parentId + ':' + i,
      css: css,
      media: media,
      sourceMap: sourceMap
    }
    if (!newStyles[id]) {
      styles.push(newStyles[id] = { id: id, parts: [part] })
    } else {
      newStyles[id].parts.push(part)
    }
  }
  return styles
}


/***/ }),
/* 48 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__Icons_MapIcon_vue__ = __webpack_require__(49);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__Icons_MapIcon_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__Icons_MapIcon_vue__);
//
//
//
//
//
//
//
//
//
//



/* harmony default export */ __webpack_exports__["default"] = ({
    components: {
        MapIcon: __WEBPACK_IMPORTED_MODULE_0__Icons_MapIcon_vue___default.a
    },

    data: function data() {
        return {
            message: "I hate to be the one breaking it to you, but you've been given a wrong address!"
        };
    }
});

/***/ }),
/* 49 */
/***/ (function(module, exports, __webpack_require__) {

var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(50)
}
var normalizeComponent = __webpack_require__(1)
/* script */
var __vue_script__ = __webpack_require__(52)
/* template */
var __vue_template__ = __webpack_require__(53)
/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = injectStyle
/* scopeId */
var __vue_scopeId__ = null
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __vue_script__,
  __vue_template__,
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "resources\\assets\\js\\components\\views\\Icons\\MapIcon.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-177b8afe", Component.options)
  } else {
    hotAPI.reload("data-v-177b8afe", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

module.exports = Component.exports


/***/ }),
/* 50 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(51);
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var update = __webpack_require__(14)("3616d9c4", content, false, {});
// Hot Module Replacement
if(false) {
 // When the styles change, update the <style> tags
 if(!content.locals) {
   module.hot.accept("!!../../../../../../node_modules/css-loader/index.js?sourceMap!../../../../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-177b8afe\",\"scoped\":false,\"hasInlineConfig\":true}!../../../../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./MapIcon.vue", function() {
     var newContent = require("!!../../../../../../node_modules/css-loader/index.js?sourceMap!../../../../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-177b8afe\",\"scoped\":false,\"hasInlineConfig\":true}!../../../../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./MapIcon.vue");
     if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
     update(newContent);
   });
 }
 // When the module is disposed, remove the <style> tags
 module.hot.dispose(function() { update(); });
}

/***/ }),
/* 51 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(13)(true);
// imports


// module
exports.push([module.i, "\n.heroicon-map .heroicon-outline {\n    fill: #303034;\n}\n.heroicon-map .heroicon-component-fill {\n    fill: #fff;\n}\n.heroicon-map .heroicon-component-accent {\n    fill: #919495;\n}\n.heroicon-map .heroicon-shadows {\n    fill: #303034;\n    opacity: 0.4;\n}\n", "", {"version":3,"sources":["D:/laravel/www/resources/assets/js/components/views/Icons/resources/assets/js/components/views/Icons/MapIcon.vue"],"names":[],"mappings":";AAWA;IACA,cAAA;CACA;AACA;IACA,WAAA;CACA;AACA;IACA,cAAA;CACA;AACA;IACA,cAAA;IACA,aAAA;CACA","file":"MapIcon.vue","sourcesContent":["<template>\r\n    <svg xmlns=\"http://www.w3.org/2000/svg\" :width=\"this.width + 'px'\" :height=\"this.height + 'px'\" viewBox=\"0 0 60 60\" class=\"heroicon-map heroicon heroicon-sm\">\r\n        <path class=\"heroicon-map-outer heroicon-component-accent heroicon-component-fill\" d=\"M20.05 13.02L15 11 0 17v40l15-6 15 6 15-6 15 6V17l-15-6-5.05 2.02c.03.32.05.65.05.98 0 5.52-10 20-10 20S20 19.52 20 14c0-.33.02-.66.05-.98z\"></path>\r\n        <path class=\"heroicon-map-inner heroicon-component-fill\" d=\"M21.14 18.46L15 16 4 20v30l11-4 15 6 15-6 11 4V20l-11-4-6.14 2.46C36.23 24.97 30 34 30 34s-6.23-9.03-8.86-15.54z\"></path>\r\n        <path class=\"heroicon-map-pin heroicon-component-accent heroicon-component-fill\" d=\"M30 34S20 19.52 20 14a10 10 0 1 1 20 0c0 5.52-10 20-10 20zm0-18a3 3 0 1 0 0-6 3 3 0 0 0 0 6z\"></path>\r\n        <path class=\"heroicon-shadows\" d=\"M30 37S20 22.52 20 17c0-.58.05-1.15.14-1.7C21.37 21.5 30 34 30 34l.27-.4.73-1.09v3L30 37v20l15-6V11l-5.05 2.02c.03.32.05.65.05.98 0 4.98-8.14 17.25-9.73 19.6L30 37zM0 17l15-6v40L0 57V17z\"></path>\r\n        <path class=\"heroicon-outline\" d=\"M20.05 13.02a10 10 0 0 1 19.9 0L45 11l15 6v40l-15-6-15 6-15-6-15 6V17l15-6 5.05 2.02zm1.28 5.9L16 16.79v13.53l13 5.2v-3a69.99 69.99 0 0 1-.2-.31c-1.88-2.87-5.51-8.63-7.47-13.3zm-.5-1.26c-.32-.89-.57-1.72-.7-2.46L16 13.55v2.16l4.83 1.93v.02zM39.9 15.1c-.13.75-.38 1.61-.72 2.53L44 15.7v-2.16l-4.13 1.65.02-.09zm-1.2 3.75c-1.95 4.67-5.6 10.47-7.49 13.35l-.2.3v3.01l13-5.2V16.8l-5.33 2.13.02-.06zm-5.42 6.2a66.36 66.36 0 0 0 3.34-6.4C37.54 16.52 38 14.92 38 14a8 8 0 1 0-16 0c0 .93.46 2.53 1.4 4.65.9 2.06 2.1 4.3 3.33 6.42 1.18 2.03 2.36 3.9 3.27 5.32.91-1.42 2.09-3.29 3.27-5.32zM46 13.57v2.15l10 4v14.61l2 .8V18.35l-12-4.8zM14 15.7v-2.16l-12 4.8v16.77l2-.8V19.71l10-4zM5 33.92l9-3.6V16.8l-9 3.6v13.53zm-1 2.56l-2 .8v16.77l12-4.8v-2.16l-9 3.6-1 .4V36.48zM14 46V32.48l-9 3.6V49.6l9-3.6zm2 1.08v2.16l13 5.2v-2.16l-13-5.2zm13 4.12V37.68l-13-5.2V46l13 5.2zm2 1.08v2.16l13-5.2v-2.16l-13 5.2zm13-6.28V32.48l-13 5.2V51.2l13-5.2zm2 1.08v2.16l12 4.8V37.28l-2-.8v14.61l-1-.4-9-3.6zm9-11.01l-9-3.6V46l9 3.6V36.08zm0-2.16V20.4l-9-3.6v13.53l9 3.6zM30 17a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm2-4a2 2 0 1 0-4 0 2 2 0 0 0 4 0z\"></path>\r\n    </svg>\r\n</template>\r\n\r\n<style>\r\n    .heroicon-map .heroicon-outline {\r\n        fill: #303034;\r\n    }\r\n    .heroicon-map .heroicon-component-fill {\r\n        fill: #fff;\r\n    }\r\n    .heroicon-map .heroicon-component-accent {\r\n        fill: #919495;\r\n    }\r\n    .heroicon-map .heroicon-shadows {\r\n        fill: #303034;\r\n        opacity: 0.4;\r\n    }\r\n</style>\r\n\r\n<script>\r\n    export default {\r\n        props: ['width', 'height']\r\n    };\r\n</script>\r\n"],"sourceRoot":""}]);

// exports


/***/ }),
/* 52 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

/* harmony default export */ __webpack_exports__["default"] = ({
    props: ['width', 'height']
});

/***/ }),
/* 53 */
/***/ (function(module, exports, __webpack_require__) {

var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "svg",
    {
      staticClass: "heroicon-map heroicon heroicon-sm",
      attrs: {
        xmlns: "http://www.w3.org/2000/svg",
        width: this.width + "px",
        height: this.height + "px",
        viewBox: "0 0 60 60"
      }
    },
    [
      _c("path", {
        staticClass:
          "heroicon-map-outer heroicon-component-accent heroicon-component-fill",
        attrs: {
          d:
            "M20.05 13.02L15 11 0 17v40l15-6 15 6 15-6 15 6V17l-15-6-5.05 2.02c.03.32.05.65.05.98 0 5.52-10 20-10 20S20 19.52 20 14c0-.33.02-.66.05-.98z"
        }
      }),
      _vm._v(" "),
      _c("path", {
        staticClass: "heroicon-map-inner heroicon-component-fill",
        attrs: {
          d:
            "M21.14 18.46L15 16 4 20v30l11-4 15 6 15-6 11 4V20l-11-4-6.14 2.46C36.23 24.97 30 34 30 34s-6.23-9.03-8.86-15.54z"
        }
      }),
      _vm._v(" "),
      _c("path", {
        staticClass:
          "heroicon-map-pin heroicon-component-accent heroicon-component-fill",
        attrs: {
          d:
            "M30 34S20 19.52 20 14a10 10 0 1 1 20 0c0 5.52-10 20-10 20zm0-18a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"
        }
      }),
      _vm._v(" "),
      _c("path", {
        staticClass: "heroicon-shadows",
        attrs: {
          d:
            "M30 37S20 22.52 20 17c0-.58.05-1.15.14-1.7C21.37 21.5 30 34 30 34l.27-.4.73-1.09v3L30 37v20l15-6V11l-5.05 2.02c.03.32.05.65.05.98 0 4.98-8.14 17.25-9.73 19.6L30 37zM0 17l15-6v40L0 57V17z"
        }
      }),
      _vm._v(" "),
      _c("path", {
        staticClass: "heroicon-outline",
        attrs: {
          d:
            "M20.05 13.02a10 10 0 0 1 19.9 0L45 11l15 6v40l-15-6-15 6-15-6-15 6V17l15-6 5.05 2.02zm1.28 5.9L16 16.79v13.53l13 5.2v-3a69.99 69.99 0 0 1-.2-.31c-1.88-2.87-5.51-8.63-7.47-13.3zm-.5-1.26c-.32-.89-.57-1.72-.7-2.46L16 13.55v2.16l4.83 1.93v.02zM39.9 15.1c-.13.75-.38 1.61-.72 2.53L44 15.7v-2.16l-4.13 1.65.02-.09zm-1.2 3.75c-1.95 4.67-5.6 10.47-7.49 13.35l-.2.3v3.01l13-5.2V16.8l-5.33 2.13.02-.06zm-5.42 6.2a66.36 66.36 0 0 0 3.34-6.4C37.54 16.52 38 14.92 38 14a8 8 0 1 0-16 0c0 .93.46 2.53 1.4 4.65.9 2.06 2.1 4.3 3.33 6.42 1.18 2.03 2.36 3.9 3.27 5.32.91-1.42 2.09-3.29 3.27-5.32zM46 13.57v2.15l10 4v14.61l2 .8V18.35l-12-4.8zM14 15.7v-2.16l-12 4.8v16.77l2-.8V19.71l10-4zM5 33.92l9-3.6V16.8l-9 3.6v13.53zm-1 2.56l-2 .8v16.77l12-4.8v-2.16l-9 3.6-1 .4V36.48zM14 46V32.48l-9 3.6V49.6l9-3.6zm2 1.08v2.16l13 5.2v-2.16l-13-5.2zm13 4.12V37.68l-13-5.2V46l13 5.2zm2 1.08v2.16l13-5.2v-2.16l-13 5.2zm13-6.28V32.48l-13 5.2V51.2l13-5.2zm2 1.08v2.16l12 4.8V37.28l-2-.8v14.61l-1-.4-9-3.6zm9-11.01l-9-3.6V46l9 3.6V36.08zm0-2.16V20.4l-9-3.6v13.53l9 3.6zM30 17a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm2-4a2 2 0 1 0-4 0 2 2 0 0 0 4 0z"
        }
      })
    ]
  )
}
var staticRenderFns = []
render._withStripped = true
module.exports = { render: render, staticRenderFns: staticRenderFns }
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-177b8afe", module.exports)
  }
}

/***/ }),
/* 54 */
/***/ (function(module, exports, __webpack_require__) {

var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "section",
    { staticClass: "container margin-top-1 col-7", attrs: { id: "not-found" } },
    [
      _c(
        "div",
        { staticClass: "no-content-wrapper user-select" },
        [
          _c("map-icon", { attrs: { width: "260", height: "260" } }),
          _vm._v(" "),
          _c("p", { domProps: { textContent: _vm._s(_vm.message) } })
        ],
        1
      )
    ]
  )
}
var staticRenderFns = []
render._withStripped = true
module.exports = { render: render, staticRenderFns: staticRenderFns }
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-d0039a58", module.exports)
  }
}

/***/ }),
/* 55 */
/***/ (function(module, exports, __webpack_require__) {

var disposed = false
var normalizeComponent = __webpack_require__(1)
/* script */
var __vue_script__ = __webpack_require__(56)
/* template */
var __vue_template__ = __webpack_require__(57)
/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = null
/* scopeId */
var __vue_scopeId__ = null
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __vue_script__,
  __vue_template__,
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "resources\\assets\\js\\components\\views\\employee\\Employee.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-38723047", Component.options)
  } else {
    hotAPI.reload("data-v-38723047", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

module.exports = Component.exports


/***/ }),
/* 56 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
//
//
//
//
//

/* harmony default export */ __webpack_exports__["default"] = ({
    beforeRouteEnter: function beforeRouteEnter(to, from, next) {
        next();
    }
});

/***/ }),
/* 57 */
/***/ (function(module, exports, __webpack_require__) {

var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("div", { attrs: { id: "employee" } }, [_c("router-view")], 1)
}
var staticRenderFns = []
render._withStripped = true
module.exports = { render: render, staticRenderFns: staticRenderFns }
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-38723047", module.exports)
  }
}

/***/ }),
/* 58 */
/***/ (function(module, exports, __webpack_require__) {

var disposed = false
var normalizeComponent = __webpack_require__(1)
/* script */
var __vue_script__ = __webpack_require__(59)
/* template */
var __vue_template__ = __webpack_require__(60)
/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = null
/* scopeId */
var __vue_scopeId__ = null
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __vue_script__,
  __vue_template__,
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "resources\\assets\\js\\components\\views\\employee\\ListEmployee.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-67d54f85", Component.options)
  } else {
    hotAPI.reload("data-v-67d54f85", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

module.exports = Component.exports


/***/ }),
/* 59 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_vue__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_vue__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_axios__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_axios___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_axios__);
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//




/* harmony default export */ __webpack_exports__["default"] = ({
    data: function data() {
        return {
            emps: {
                items: [],
                errors: [],
                loading: false
            }

        };
    },
    created: function created() {
        this.getList();
    },
    methods: {
        getList: function getList() {
            var _this = this;

            this.$Progress.start();
            this.emps.items = [];
            this.loading = true;
            __WEBPACK_IMPORTED_MODULE_1_axios___default.a.get('/api/employee').then(function (response) {
                _this.emps.items = response.data;
                _this.loading = false;
                _this.$Progress.finish();
            }).catch(function (err) {
                _this.loading = false;
                _this.errors.push(err);
                _this.$Progress.fail();
            });
        }
    }
});

/***/ }),
/* 60 */
/***/ (function(module, exports, __webpack_require__) {

var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("div", { staticClass: "widget-box" }, [
    _vm._m(0),
    _vm._v(" "),
    _c("div", { staticClass: "widget-content nopadding" }, [
      _c("table", { staticClass: "table table-bordered data-table" }, [
        _c("thead", [
          _c("tr", [
            _c("th", [_vm._v("Office")]),
            _vm._v(" "),
            _c("th", [_vm._v("Name")]),
            _vm._v(" "),
            _c("th", { staticClass: "td-10" }, [_vm._v("Gender")]),
            _vm._v(" "),
            _c("th", [_vm._v("Email")]),
            _vm._v(" "),
            _c("th", [_vm._v("Phone")]),
            _vm._v(" "),
            _c(
              "th",
              { staticClass: "td-10" },
              [
                _c(
                  "router-link",
                  {
                    attrs: {
                      to: { name: "employee-new" },
                      "active-class": "is-active"
                    }
                  },
                  [_vm._v("New")]
                )
              ],
              1
            )
          ])
        ]),
        _vm._v(" "),
        _c(
          "tbody",
          _vm._l(_vm.emps.items, function(emp) {
            return _c("tr", { staticClass: "gradeX" }, [
              _c("td", { domProps: { textContent: _vm._s(emp.type_name) } }),
              _vm._v(" "),
              _c("td", { domProps: { textContent: _vm._s(emp.name) } }),
              _vm._v(" "),
              _c("td", {
                staticClass: "td-10",
                domProps: { textContent: _vm._s(emp.gender) }
              }),
              _vm._v(" "),
              _c("td", { domProps: { textContent: _vm._s(emp.email) } }),
              _vm._v(" "),
              _c("td", { domProps: { textContent: _vm._s(emp.phone) } }),
              _vm._v(" "),
              _c(
                "td",
                { staticClass: "td-10" },
                [
                  _c(
                    "router-link",
                    {
                      staticClass: "tip-top",
                      attrs: {
                        to: {
                          name: "employee-detail",
                          params: { idEmp: emp.id }
                        },
                        "active-class": "is-active",
                        "data-toggle": "tooltip",
                        title: "View"
                      }
                    },
                    [_c("i", { staticClass: "icon-search" })]
                  ),
                  _vm._v(" "),
                  _vm._m(1, true),
                  _vm._v(" "),
                  _vm._m(2, true)
                ],
                1
              )
            ])
          })
        )
      ])
    ])
  ])
}
var staticRenderFns = [
  function() {
    var _vm = this
    var _h = _vm.$createElement
    var _c = _vm._self._c || _h
    return _c("div", { staticClass: "widget-title" }, [
      _c("span", { staticClass: "icon" }, [
        _c("i", { staticClass: "icon-th" })
      ]),
      _vm._v(" "),
      _c("h5", [_vm._v("Employee")])
    ])
  },
  function() {
    var _vm = this
    var _h = _vm.$createElement
    var _c = _vm._self._c || _h
    return _c(
      "a",
      {
        staticClass: "tip-top",
        attrs: { href: "#", "data-toggle": "tooltip", title: "Edit" }
      },
      [_c("i", { staticClass: "icon-edit" })]
    )
  },
  function() {
    var _vm = this
    var _h = _vm.$createElement
    var _c = _vm._self._c || _h
    return _c(
      "a",
      {
        staticClass: "tip-top",
        attrs: { href: "#", "data-toggle": "tooltip", title: "Delete" }
      },
      [_c("i", { staticClass: "icon-remove-circle" })]
    )
  }
]
render._withStripped = true
module.exports = { render: render, staticRenderFns: staticRenderFns }
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-67d54f85", module.exports)
  }
}

/***/ }),
/* 61 */
/***/ (function(module, exports, __webpack_require__) {

var disposed = false
var normalizeComponent = __webpack_require__(1)
/* script */
var __vue_script__ = __webpack_require__(62)
/* template */
var __vue_template__ = __webpack_require__(63)
/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = null
/* scopeId */
var __vue_scopeId__ = null
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __vue_script__,
  __vue_template__,
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "resources\\assets\\js\\components\\views\\employee\\EmployeeNew.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-300a1409", Component.options)
  } else {
    hotAPI.reload("data-v-300a1409", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

module.exports = Component.exports


/***/ }),
/* 62 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_vue__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_vue__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_axios__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_axios___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_axios__);
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//



/* harmony default export */ __webpack_exports__["default"] = ({
    data: function data() {
        return {
            emps: {
                items: [],
                loading: false,
                errors: []
            }
        };
    },

    created: function created() {
        this.getTypeEmp();
    },
    methods: {
        getTypeEmp: function getTypeEmp() {
            var _this = this;

            this.$Progress.start();
            this.emps.items = [];
            this.loading = true;
            __WEBPACK_IMPORTED_MODULE_1_axios___default.a.get('/api/type-employee').then(function (response) {
                _this.emps.items = response.data;
                _this.loading = false;
                _this.$Progress.finish();
            }).catch(function (err) {
                _this.loading = false;
                _this.errors.push(err);
                _this.$Progress.fail();
            });
        }
    }
});

/***/ }),
/* 63 */
/***/ (function(module, exports, __webpack_require__) {

var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("div", { attrs: { id: "empNew" } }, [
    _c("div", { staticClass: "row-fluid" }, [
      _c("div", { staticClass: "span6" }, [
        _c("div", { staticClass: "widget-box" }, [
          _vm._m(0),
          _vm._v(" "),
          _c("div", { staticClass: "widget-content nopadding" }, [
            _c(
              "form",
              {
                staticClass: "form-horizontal",
                attrs: { action: "#", method: "get" }
              },
              [
                _c("div", { staticClass: "control-group" }, [
                  _c("label", { staticClass: "control-label" }, [
                    _vm._v("Select Office:")
                  ]),
                  _vm._v(" "),
                  _c("div", { staticClass: "controls" }, [
                    _vm.emps.items
                      ? _c(
                          "select",
                          { attrs: { name: "type_emp", id: "type_emp" } },
                          _vm._l(_vm.emps.items, function(item) {
                            return _c(
                              "option",
                              { domProps: { value: item.id } },
                              [_vm._v(_vm._s(item.name))]
                            )
                          })
                        )
                      : _vm._e()
                  ])
                ]),
                _vm._v(" "),
                _vm._m(1),
                _vm._v(" "),
                _vm._m(2),
                _vm._v(" "),
                _vm._m(3),
                _vm._v(" "),
                _vm._m(4),
                _vm._v(" "),
                _vm._m(5),
                _vm._v(" "),
                _vm._m(6),
                _vm._v(" "),
                _vm._m(7)
              ]
            )
          ])
        ])
      ])
    ])
  ])
}
var staticRenderFns = [
  function() {
    var _vm = this
    var _h = _vm.$createElement
    var _c = _vm._self._c || _h
    return _c("div", { staticClass: "widget-title" }, [
      _c("span", { staticClass: "icon" }, [
        _c("i", { staticClass: "icon-align-justify" })
      ]),
      _vm._v(" "),
      _c("h5", [_vm._v("Employee New")])
    ])
  },
  function() {
    var _vm = this
    var _h = _vm.$createElement
    var _c = _vm._self._c || _h
    return _c("div", { staticClass: "control-group" }, [
      _c("label", { staticClass: "control-label" }, [_vm._v("Image:")]),
      _vm._v(" "),
      _c("div", { staticClass: "controls" }, [
        _c("input", { attrs: { type: "file", name: "image" } })
      ])
    ])
  },
  function() {
    var _vm = this
    var _h = _vm.$createElement
    var _c = _vm._self._c || _h
    return _c("div", { staticClass: "control-group" }, [
      _c("label", { staticClass: "control-label" }, [_vm._v("First Name:")]),
      _vm._v(" "),
      _c("div", { staticClass: "controls" }, [
        _c("input", {
          attrs: { type: "text", name: "firstName", id: "firstName" }
        })
      ])
    ])
  },
  function() {
    var _vm = this
    var _h = _vm.$createElement
    var _c = _vm._self._c || _h
    return _c("div", { staticClass: "control-group" }, [
      _c("label", { staticClass: "control-label" }, [_vm._v("Last Name:")]),
      _vm._v(" "),
      _c("div", { staticClass: "controls" }, [
        _c("input", {
          attrs: { type: "text", name: "lastName", id: "lastName" }
        })
      ])
    ])
  },
  function() {
    var _vm = this
    var _h = _vm.$createElement
    var _c = _vm._self._c || _h
    return _c("div", { staticClass: "control-group" }, [
      _c("label", { staticClass: "control-label" }, [_vm._v("Gender:")]),
      _vm._v(" "),
      _c("div", { staticClass: "controls" }, [
        _c("label", [
          _c("input", { attrs: { type: "radio", name: "male" } }),
          _vm._v("\n                                    Male")
        ]),
        _vm._v(" "),
        _c("label", [
          _c("input", { attrs: { type: "radio", name: "female" } }),
          _vm._v("\n                                    Female")
        ])
      ])
    ])
  },
  function() {
    var _vm = this
    var _h = _vm.$createElement
    var _c = _vm._self._c || _h
    return _c("div", { staticClass: "control-group" }, [
      _c("label", { staticClass: "control-label" }, [_vm._v("Email:")]),
      _vm._v(" "),
      _c("div", { staticClass: "controls" }, [
        _c("input", { attrs: { type: "text", name: "email", id: "email" } })
      ])
    ])
  },
  function() {
    var _vm = this
    var _h = _vm.$createElement
    var _c = _vm._self._c || _h
    return _c("div", { staticClass: "control-group" }, [
      _c("label", { staticClass: "control-label" }, [_vm._v("Phone:")]),
      _vm._v(" "),
      _c("div", { staticClass: "controls" }, [
        _c("input", { attrs: { type: "number", name: "phone", id: "phone" } })
      ])
    ])
  },
  function() {
    var _vm = this
    var _h = _vm.$createElement
    var _c = _vm._self._c || _h
    return _c("div", { staticClass: "form-actions" }, [
      _c(
        "button",
        {
          staticClass: "btn btn-success",
          attrs: { type: "submit", name: "saveEmp", id: "saveEmp" }
        },
        [_vm._v("Save")]
      )
    ])
  }
]
render._withStripped = true
module.exports = { render: render, staticRenderFns: staticRenderFns }
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-300a1409", module.exports)
  }
}

/***/ }),
/* 64 */
/***/ (function(module, exports, __webpack_require__) {

var disposed = false
var normalizeComponent = __webpack_require__(1)
/* script */
var __vue_script__ = __webpack_require__(65)
/* template */
var __vue_template__ = __webpack_require__(66)
/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = null
/* scopeId */
var __vue_scopeId__ = null
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __vue_script__,
  __vue_template__,
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "resources\\assets\\js\\components\\views\\employee\\EmployeeDetail.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-156854f8", Component.options)
  } else {
    hotAPI.reload("data-v-156854f8", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

module.exports = Component.exports


/***/ }),
/* 65 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
//
//
//
//
//

/* harmony default export */ __webpack_exports__["default"] = ({});

/***/ }),
/* 66 */
/***/ (function(module, exports, __webpack_require__) {

var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("div", [_vm._v("\n    Employee Detail\n")])
}
var staticRenderFns = []
render._withStripped = true
module.exports = { render: render, staticRenderFns: staticRenderFns }
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-156854f8", module.exports)
  }
}

/***/ }),
/* 67 */
/***/ (function(module, exports, __webpack_require__) {

var disposed = false
var normalizeComponent = __webpack_require__(1)
/* script */
var __vue_script__ = __webpack_require__(68)
/* template */
var __vue_template__ = __webpack_require__(69)
/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = null
/* scopeId */
var __vue_scopeId__ = null
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __vue_script__,
  __vue_template__,
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "resources\\assets\\js\\components\\views\\layouts\\Sidebar.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-1b800998", Component.options)
  } else {
    hotAPI.reload("data-v-1b800998", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

module.exports = Component.exports


/***/ }),
/* 68 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_vue__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_vue__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_axios__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_axios___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_axios__);
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//



/* harmony default export */ __webpack_exports__["default"] = ({
    name: 'sidebar',
    data: function data() {
        return {
            menus: [],
            errors: []
        };
    },
    mounted: function mounted() {
        var _this = this;

        __WEBPACK_IMPORTED_MODULE_1_axios___default.a.get('/api/menu').then(function (response) {
            _this.menus = response.data;
        }).catch(function (e) {
            _this.errors.push(e);
        });
    }
});

/***/ }),
/* 69 */
/***/ (function(module, exports, __webpack_require__) {

var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("div", { attrs: { id: "sidebar" } }, [
    _vm._m(0),
    _vm._v(" "),
    _c("ul", [
      _c(
        "li",
        { staticClass: "active" },
        [
          _c("router-link", { attrs: { to: { name: "home" } } }, [
            _c("i", { staticClass: "icon icon-home" }),
            _vm._v(" "),
            _c("span", [_vm._v("Dashboard")])
          ])
        ],
        1
      ),
      _vm._v(" "),
      _vm.menus
        ? _c("li", { staticClass: "active" }, [
            _c("i", { staticClass: "icon icon-th-list" }),
            _vm._v(" "),
            _c("span", [_vm._v("Menu")]),
            _c("span", { staticClass: "label label-important" }, [
              _vm._v(_vm._s(_vm.menus.length))
            ]),
            _vm._v(" "),
            _c(
              "ul",
              _vm._l(_vm.menus, function(menu) {
                return _c("li", [_c("span", [_vm._v(_vm._s(menu.name))])])
              })
            )
          ])
        : _vm._e(),
      _vm._v(" "),
      _c(
        "li",
        { staticClass: "active" },
        [
          _c("router-link", { attrs: { to: { name: "employee-list" } } }, [
            _c("span", [_vm._v("Employee")])
          ])
        ],
        1
      )
    ])
  ])
}
var staticRenderFns = [
  function() {
    var _vm = this
    var _h = _vm.$createElement
    var _c = _vm._self._c || _h
    return _c("a", { staticClass: "visible-phone", attrs: { href: "#" } }, [
      _c("i", { staticClass: "icon icon-th-list" }),
      _vm._v(" Tables")
    ])
  }
]
render._withStripped = true
module.exports = { render: render, staticRenderFns: staticRenderFns }
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-1b800998", module.exports)
  }
}

/***/ }),
/* 70 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 71 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ })
],[15]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvY29tcG9uZW50LW5vcm1hbGl6ZXIuanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvbGliL2Nzcy1iYXNlLmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy92dWUtc3R5bGUtbG9hZGVyL2xpYi9hZGRTdHlsZXNDbGllbnQuanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9hcHAuanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL3Z1ZS1heGlvcy9kaXN0L3Z1ZS1heGlvcy5taW4uanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL3Z1ZS1icmVhZGNydW1icy9kaXN0L3Z1ZS1icmVhZGNydW1icy5jb21tb24uanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL3Z1ZS1wcm9ncmVzc2Jhci9kaXN0L3Z1ZS1wcm9ncmVzc2Jhci5qcyIsIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3JvdXRlcy9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvYXNzZXRzL2pzL2NvbXBvbmVudHMvdmlld3MvSG9tZS52dWUiLCJ3ZWJwYWNrOi8vL3Jlc291cmNlcy9hc3NldHMvanMvY29tcG9uZW50cy92aWV3cy9Ib21lLnZ1ZSIsIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvYXNzZXRzL2pzL2NvbXBvbmVudHMvdmlld3MvSG9tZS52dWU/OWEyNiIsIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvYXNzZXRzL2pzL2NvbXBvbmVudHMvdmlld3MvTm90Rm91bmQudnVlIiwid2VicGFjazovLy8uL3Jlc291cmNlcy9hc3NldHMvanMvY29tcG9uZW50cy92aWV3cy9Ob3RGb3VuZC52dWU/M2UwYSIsIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvYXNzZXRzL2pzL2NvbXBvbmVudHMvdmlld3MvTm90Rm91bmQudnVlPzkxYTAiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL3Z1ZS1zdHlsZS1sb2FkZXIvbGliL2xpc3RUb1N0eWxlcy5qcyIsIndlYnBhY2s6Ly8vcmVzb3VyY2VzL2Fzc2V0cy9qcy9jb21wb25lbnRzL3ZpZXdzL05vdEZvdW5kLnZ1ZSIsIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvYXNzZXRzL2pzL2NvbXBvbmVudHMvdmlld3MvSWNvbnMvTWFwSWNvbi52dWUiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9jb21wb25lbnRzL3ZpZXdzL0ljb25zL01hcEljb24udnVlP2QwNzEiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9jb21wb25lbnRzL3ZpZXdzL0ljb25zL01hcEljb24udnVlPzlkZmQiLCJ3ZWJwYWNrOi8vL3Jlc291cmNlcy9hc3NldHMvanMvY29tcG9uZW50cy92aWV3cy9JY29ucy9NYXBJY29uLnZ1ZSIsIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvYXNzZXRzL2pzL2NvbXBvbmVudHMvdmlld3MvSWNvbnMvTWFwSWNvbi52dWU/MzljZSIsIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvYXNzZXRzL2pzL2NvbXBvbmVudHMvdmlld3MvTm90Rm91bmQudnVlPzlmMGEiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9jb21wb25lbnRzL3ZpZXdzL2VtcGxveWVlL0VtcGxveWVlLnZ1ZSIsIndlYnBhY2s6Ly8vcmVzb3VyY2VzL2Fzc2V0cy9qcy9jb21wb25lbnRzL3ZpZXdzL2VtcGxveWVlL0VtcGxveWVlLnZ1ZSIsIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvYXNzZXRzL2pzL2NvbXBvbmVudHMvdmlld3MvZW1wbG95ZWUvRW1wbG95ZWUudnVlP2VjZWEiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9jb21wb25lbnRzL3ZpZXdzL2VtcGxveWVlL0xpc3RFbXBsb3llZS52dWUiLCJ3ZWJwYWNrOi8vL3Jlc291cmNlcy9hc3NldHMvanMvY29tcG9uZW50cy92aWV3cy9lbXBsb3llZS9MaXN0RW1wbG95ZWUudnVlIiwid2VicGFjazovLy8uL3Jlc291cmNlcy9hc3NldHMvanMvY29tcG9uZW50cy92aWV3cy9lbXBsb3llZS9MaXN0RW1wbG95ZWUudnVlP2FkZDIiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9jb21wb25lbnRzL3ZpZXdzL2VtcGxveWVlL0VtcGxveWVlTmV3LnZ1ZSIsIndlYnBhY2s6Ly8vcmVzb3VyY2VzL2Fzc2V0cy9qcy9jb21wb25lbnRzL3ZpZXdzL2VtcGxveWVlL0VtcGxveWVlTmV3LnZ1ZSIsIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvYXNzZXRzL2pzL2NvbXBvbmVudHMvdmlld3MvZW1wbG95ZWUvRW1wbG95ZWVOZXcudnVlPzM2M2QiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9jb21wb25lbnRzL3ZpZXdzL2VtcGxveWVlL0VtcGxveWVlRGV0YWlsLnZ1ZSIsIndlYnBhY2s6Ly8vcmVzb3VyY2VzL2Fzc2V0cy9qcy9jb21wb25lbnRzL3ZpZXdzL2VtcGxveWVlL0VtcGxveWVlRGV0YWlsLnZ1ZSIsIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvYXNzZXRzL2pzL2NvbXBvbmVudHMvdmlld3MvZW1wbG95ZWUvRW1wbG95ZWVEZXRhaWwudnVlPzZhMjciLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9jb21wb25lbnRzL3ZpZXdzL2xheW91dHMvU2lkZWJhci52dWUiLCJ3ZWJwYWNrOi8vL3Jlc291cmNlcy9hc3NldHMvanMvY29tcG9uZW50cy92aWV3cy9sYXlvdXRzL1NpZGViYXIudnVlIiwid2VicGFjazovLy8uL3Jlc291cmNlcy9hc3NldHMvanMvY29tcG9uZW50cy92aWV3cy9sYXlvdXRzL1NpZGViYXIudnVlPzY3YjEiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2Fzc2V0cy9zYXNzL2FwcC5zY3NzPzZkMTAiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2Fzc2V0cy9zYXNzL2luYy9sb2dpbi5zY3NzIl0sIm5hbWVzIjpbIlZ1ZSIsInVzZSIsInRlbXBsYXRlIiwiY29sb3IiLCJmYWlsZWRDb2xvciIsImhlaWdodCIsIndpbmRvdyIsIm9ubG9hZCIsInJvdXRlciIsImNvbXBvbmVudHMiLCJTaWRlYmFyIiwiJG1vdW50Iiwicm91dGVzIiwicGF0aCIsIm5hbWUiLCJjb21wb25lbnQiLCJtZXRhIiwiYnJlYWRjcnVtYiIsInJlZGlyZWN0IiwicGVybWlzc2lvbiIsImZhaWwiLCJ0aXRsZSIsImNoaWxkcmVuIiwiTm90Rm91bmQiLCJtb2RlIl0sIm1hcHBpbmdzIjoiOzs7OztBQUFBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EseUJBQXlCO0FBQ3pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDdEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxtQ0FBbUMsZ0JBQWdCO0FBQ25ELElBQUk7QUFDSjtBQUNBO0FBQ0Es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QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGtCQUFrQjtBQUNsQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQzs7Ozs7O0FDdEVBLHlDOzs7Ozs7QUNBQSx5QyIsImZpbGUiOiJcXGpzXFxhcHAuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBnbG9iYWxzIF9fVlVFX1NTUl9DT05URVhUX18gKi9cblxuLy8gSU1QT1JUQU5UOiBEbyBOT1QgdXNlIEVTMjAxNSBmZWF0dXJlcyBpbiB0aGlzIGZpbGUuXG4vLyBUaGlzIG1vZHVsZSBpcyBhIHJ1bnRpbWUgdXRpbGl0eSBmb3IgY2xlYW5lciBjb21wb25lbnQgbW9kdWxlIG91dHB1dCBhbmQgd2lsbFxuLy8gYmUgaW5jbHVkZWQgaW4gdGhlIGZpbmFsIHdlYnBhY2sgdXNlciBidW5kbGUuXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gbm9ybWFsaXplQ29tcG9uZW50IChcbiAgcmF3U2NyaXB0RXhwb3J0cyxcbiAgY29tcGlsZWRUZW1wbGF0ZSxcbiAgZnVuY3Rpb25hbFRlbXBsYXRlLFxuICBpbmplY3RTdHlsZXMsXG4gIHNjb3BlSWQsXG4gIG1vZHVsZUlkZW50aWZpZXIgLyogc2VydmVyIG9ubHkgKi9cbikge1xuICB2YXIgZXNNb2R1bGVcbiAgdmFyIHNjcmlwdEV4cG9ydHMgPSByYXdTY3JpcHRFeHBvcnRzID0gcmF3U2NyaXB0RXhwb3J0cyB8fCB7fVxuXG4gIC8vIEVTNiBtb2R1bGVzIGludGVyb3BcbiAgdmFyIHR5cGUgPSB0eXBlb2YgcmF3U2NyaXB0RXhwb3J0cy5kZWZhdWx0XG4gIGlmICh0eXBlID09PSAnb2JqZWN0JyB8fCB0eXBlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgZXNNb2R1bGUgPSByYXdTY3JpcHRFeHBvcnRzXG4gICAgc2NyaXB0RXhwb3J0cyA9IHJhd1NjcmlwdEV4cG9ydHMuZGVmYXVsdFxuICB9XG5cbiAgLy8gVnVlLmV4dGVuZCBjb25zdHJ1Y3RvciBleHBvcnQgaW50ZXJvcFxuICB2YXIgb3B0aW9ucyA9IHR5cGVvZiBzY3JpcHRFeHBvcnRzID09PSAnZnVuY3Rpb24nXG4gICAgPyBzY3JpcHRFeHBvcnRzLm9wdGlvbnNcbiAgICA6IHNjcmlwdEV4cG9ydHNcblxuICAvLyByZW5kZXIgZnVuY3Rpb25zXG4gIGlmIChjb21waWxlZFRlbXBsYXRlKSB7XG4gICAgb3B0aW9ucy5yZW5kZXIgPSBjb21waWxlZFRlbXBsYXRlLnJlbmRlclxuICAgIG9wdGlvbnMuc3RhdGljUmVuZGVyRm5zID0gY29tcGlsZWRUZW1wbGF0ZS5zdGF0aWNSZW5kZXJGbnNcbiAgICBvcHRpb25zLl9jb21waWxlZCA9IHRydWVcbiAgfVxuXG4gIC8vIGZ1bmN0aW9uYWwgdGVtcGxhdGVcbiAgaWYgKGZ1bmN0aW9uYWxUZW1wbGF0ZSkge1xuICAgIG9wdGlvbnMuZnVuY3Rpb25hbCA9IHRydWVcbiAgfVxuXG4gIC8vIHNjb3BlZElkXG4gIGlmIChzY29wZUlkKSB7XG4gICAgb3B0aW9ucy5fc2NvcGVJZCA9IHNjb3BlSWRcbiAgfVxuXG4gIHZhciBob29rXG4gIGlmIChtb2R1bGVJZGVudGlmaWVyKSB7IC8vIHNlcnZlciBidWlsZFxuICAgIGhvb2sgPSBmdW5jdGlvbiAoY29udGV4dCkge1xuICAgICAgLy8gMi4zIGluamVjdGlvblxuICAgICAgY29udGV4dCA9XG4gICAgICAgIGNvbnRleHQgfHwgLy8gY2FjaGVkIGNhbGxcbiAgICAgICAgKHRoaXMuJHZub2RlICYmIHRoaXMuJHZub2RlLnNzckNvbnRleHQpIHx8IC8vIHN0YXRlZnVsXG4gICAgICAgICh0aGlzLnBhcmVudCAmJiB0aGlzLnBhcmVudC4kdm5vZGUgJiYgdGhpcy5wYXJlbnQuJHZub2RlLnNzckNvbnRleHQpIC8vIGZ1bmN0aW9uYWxcbiAgICAgIC8vIDIuMiB3aXRoIHJ1bkluTmV3Q29udGV4dDogdHJ1ZVxuICAgICAgaWYgKCFjb250ZXh0ICYmIHR5cGVvZiBfX1ZVRV9TU1JfQ09OVEVYVF9fICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICBjb250ZXh0ID0gX19WVUVfU1NSX0NPTlRFWFRfX1xuICAgICAgfVxuICAgICAgLy8gaW5qZWN0IGNvbXBvbmVudCBzdHlsZXNcbiAgICAgIGlmIChpbmplY3RTdHlsZXMpIHtcbiAgICAgICAgaW5qZWN0U3R5bGVzLmNhbGwodGhpcywgY29udGV4dClcbiAgICAgIH1cbiAgICAgIC8vIHJlZ2lzdGVyIGNvbXBvbmVudCBtb2R1bGUgaWRlbnRpZmllciBmb3IgYXN5bmMgY2h1bmsgaW5mZXJyZW5jZVxuICAgICAgaWYgKGNvbnRleHQgJiYgY29udGV4dC5fcmVnaXN0ZXJlZENvbXBvbmVudHMpIHtcbiAgICAgICAgY29udGV4dC5fcmVnaXN0ZXJlZENvbXBvbmVudHMuYWRkKG1vZHVsZUlkZW50aWZpZXIpXG4gICAgICB9XG4gICAgfVxuICAgIC8vIHVzZWQgYnkgc3NyIGluIGNhc2UgY29tcG9uZW50IGlzIGNhY2hlZCBhbmQgYmVmb3JlQ3JlYXRlXG4gICAgLy8gbmV2ZXIgZ2V0cyBjYWxsZWRcbiAgICBvcHRpb25zLl9zc3JSZWdpc3RlciA9IGhvb2tcbiAgfSBlbHNlIGlmIChpbmplY3RTdHlsZXMpIHtcbiAgICBob29rID0gaW5qZWN0U3R5bGVzXG4gIH1cblxuICBpZiAoaG9vaykge1xuICAgIHZhciBmdW5jdGlvbmFsID0gb3B0aW9ucy5mdW5jdGlvbmFsXG4gICAgdmFyIGV4aXN0aW5nID0gZnVuY3Rpb25hbFxuICAgICAgPyBvcHRpb25zLnJlbmRlclxuICAgICAgOiBvcHRpb25zLmJlZm9yZUNyZWF0ZVxuXG4gICAgaWYgKCFmdW5jdGlvbmFsKSB7XG4gICAgICAvLyBpbmplY3QgY29tcG9uZW50IHJlZ2lzdHJhdGlvbiBhcyBiZWZvcmVDcmVhdGUgaG9va1xuICAgICAgb3B0aW9ucy5iZWZvcmVDcmVhdGUgPSBleGlzdGluZ1xuICAgICAgICA/IFtdLmNvbmNhdChleGlzdGluZywgaG9vaylcbiAgICAgICAgOiBbaG9va11cbiAgICB9IGVsc2Uge1xuICAgICAgLy8gZm9yIHRlbXBsYXRlLW9ubHkgaG90LXJlbG9hZCBiZWNhdXNlIGluIHRoYXQgY2FzZSB0aGUgcmVuZGVyIGZuIGRvZXNuJ3RcbiAgICAgIC8vIGdvIHRocm91Z2ggdGhlIG5vcm1hbGl6ZXJcbiAgICAgIG9wdGlvbnMuX2luamVjdFN0eWxlcyA9IGhvb2tcbiAgICAgIC8vIHJlZ2lzdGVyIGZvciBmdW5jdGlvYWwgY29tcG9uZW50IGluIHZ1ZSBmaWxlXG4gICAgICBvcHRpb25zLnJlbmRlciA9IGZ1bmN0aW9uIHJlbmRlcldpdGhTdHlsZUluamVjdGlvbiAoaCwgY29udGV4dCkge1xuICAgICAgICBob29rLmNhbGwoY29udGV4dClcbiAgICAgICAgcmV0dXJuIGV4aXN0aW5nKGgsIGNvbnRleHQpXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBlc01vZHVsZTogZXNNb2R1bGUsXG4gICAgZXhwb3J0czogc2NyaXB0RXhwb3J0cyxcbiAgICBvcHRpb25zOiBvcHRpb25zXG4gIH1cbn1cblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL2NvbXBvbmVudC1ub3JtYWxpemVyLmpzXG4vLyBtb2R1bGUgaWQgPSAxXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8qXG5cdE1JVCBMaWNlbnNlIGh0dHA6Ly93d3cub3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvbWl0LWxpY2Vuc2UucGhwXG5cdEF1dGhvciBUb2JpYXMgS29wcGVycyBAc29rcmFcbiovXG4vLyBjc3MgYmFzZSBjb2RlLCBpbmplY3RlZCBieSB0aGUgY3NzLWxvYWRlclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbih1c2VTb3VyY2VNYXApIHtcblx0dmFyIGxpc3QgPSBbXTtcblxuXHQvLyByZXR1cm4gdGhlIGxpc3Qgb2YgbW9kdWxlcyBhcyBjc3Mgc3RyaW5nXG5cdGxpc3QudG9TdHJpbmcgPSBmdW5jdGlvbiB0b1N0cmluZygpIHtcblx0XHRyZXR1cm4gdGhpcy5tYXAoZnVuY3Rpb24gKGl0ZW0pIHtcblx0XHRcdHZhciBjb250ZW50ID0gY3NzV2l0aE1hcHBpbmdUb1N0cmluZyhpdGVtLCB1c2VTb3VyY2VNYXApO1xuXHRcdFx0aWYoaXRlbVsyXSkge1xuXHRcdFx0XHRyZXR1cm4gXCJAbWVkaWEgXCIgKyBpdGVtWzJdICsgXCJ7XCIgKyBjb250ZW50ICsgXCJ9XCI7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRyZXR1cm4gY29udGVudDtcblx0XHRcdH1cblx0XHR9KS5qb2luKFwiXCIpO1xuXHR9O1xuXG5cdC8vIGltcG9ydCBhIGxpc3Qgb2YgbW9kdWxlcyBpbnRvIHRoZSBsaXN0XG5cdGxpc3QuaSA9IGZ1bmN0aW9uKG1vZHVsZXMsIG1lZGlhUXVlcnkpIHtcblx0XHRpZih0eXBlb2YgbW9kdWxlcyA9PT0gXCJzdHJpbmdcIilcblx0XHRcdG1vZHVsZXMgPSBbW251bGwsIG1vZHVsZXMsIFwiXCJdXTtcblx0XHR2YXIgYWxyZWFkeUltcG9ydGVkTW9kdWxlcyA9IHt9O1xuXHRcdGZvcih2YXIgaSA9IDA7IGkgPCB0aGlzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHR2YXIgaWQgPSB0aGlzW2ldWzBdO1xuXHRcdFx0aWYodHlwZW9mIGlkID09PSBcIm51bWJlclwiKVxuXHRcdFx0XHRhbHJlYWR5SW1wb3J0ZWRNb2R1bGVzW2lkXSA9IHRydWU7XG5cdFx0fVxuXHRcdGZvcihpID0gMDsgaSA8IG1vZHVsZXMubGVuZ3RoOyBpKyspIHtcblx0XHRcdHZhciBpdGVtID0gbW9kdWxlc1tpXTtcblx0XHRcdC8vIHNraXAgYWxyZWFkeSBpbXBvcnRlZCBtb2R1bGVcblx0XHRcdC8vIHRoaXMgaW1wbGVtZW50YXRpb24gaXMgbm90IDEwMCUgcGVyZmVjdCBmb3Igd2VpcmQgbWVkaWEgcXVlcnkgY29tYmluYXRpb25zXG5cdFx0XHQvLyAgd2hlbiBhIG1vZHVsZSBpcyBpbXBvcnRlZCBtdWx0aXBsZSB0aW1lcyB3aXRoIGRpZmZlcmVudCBtZWRpYSBxdWVyaWVzLlxuXHRcdFx0Ly8gIEkgaG9wZSB0aGlzIHdpbGwgbmV2ZXIgb2NjdXIgKEhleSB0aGlzIHdheSB3ZSBoYXZlIHNtYWxsZXIgYnVuZGxlcylcblx0XHRcdGlmKHR5cGVvZiBpdGVtWzBdICE9PSBcIm51bWJlclwiIHx8ICFhbHJlYWR5SW1wb3J0ZWRNb2R1bGVzW2l0ZW1bMF1dKSB7XG5cdFx0XHRcdGlmKG1lZGlhUXVlcnkgJiYgIWl0ZW1bMl0pIHtcblx0XHRcdFx0XHRpdGVtWzJdID0gbWVkaWFRdWVyeTtcblx0XHRcdFx0fSBlbHNlIGlmKG1lZGlhUXVlcnkpIHtcblx0XHRcdFx0XHRpdGVtWzJdID0gXCIoXCIgKyBpdGVtWzJdICsgXCIpIGFuZCAoXCIgKyBtZWRpYVF1ZXJ5ICsgXCIpXCI7XG5cdFx0XHRcdH1cblx0XHRcdFx0bGlzdC5wdXNoKGl0ZW0pO1xuXHRcdFx0fVxuXHRcdH1cblx0fTtcblx0cmV0dXJuIGxpc3Q7XG59O1xuXG5mdW5jdGlvbiBjc3NXaXRoTWFwcGluZ1RvU3RyaW5nKGl0ZW0sIHVzZVNvdXJjZU1hcCkge1xuXHR2YXIgY29udGVudCA9IGl0ZW1bMV0gfHwgJyc7XG5cdHZhciBjc3NNYXBwaW5nID0gaXRlbVszXTtcblx0aWYgKCFjc3NNYXBwaW5nKSB7XG5cdFx0cmV0dXJuIGNvbnRlbnQ7XG5cdH1cblxuXHRpZiAodXNlU291cmNlTWFwICYmIHR5cGVvZiBidG9hID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0dmFyIHNvdXJjZU1hcHBpbmcgPSB0b0NvbW1lbnQoY3NzTWFwcGluZyk7XG5cdFx0dmFyIHNvdXJjZVVSTHMgPSBjc3NNYXBwaW5nLnNvdXJjZXMubWFwKGZ1bmN0aW9uIChzb3VyY2UpIHtcblx0XHRcdHJldHVybiAnLyojIHNvdXJjZVVSTD0nICsgY3NzTWFwcGluZy5zb3VyY2VSb290ICsgc291cmNlICsgJyAqLydcblx0XHR9KTtcblxuXHRcdHJldHVybiBbY29udGVudF0uY29uY2F0KHNvdXJjZVVSTHMpLmNvbmNhdChbc291cmNlTWFwcGluZ10pLmpvaW4oJ1xcbicpO1xuXHR9XG5cblx0cmV0dXJuIFtjb250ZW50XS5qb2luKCdcXG4nKTtcbn1cblxuLy8gQWRhcHRlZCBmcm9tIGNvbnZlcnQtc291cmNlLW1hcCAoTUlUKVxuZnVuY3Rpb24gdG9Db21tZW50KHNvdXJjZU1hcCkge1xuXHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW5kZWZcblx0dmFyIGJhc2U2NCA9IGJ0b2EodW5lc2NhcGUoZW5jb2RlVVJJQ29tcG9uZW50KEpTT04uc3RyaW5naWZ5KHNvdXJjZU1hcCkpKSk7XG5cdHZhciBkYXRhID0gJ3NvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2NoYXJzZXQ9dXRmLTg7YmFzZTY0LCcgKyBiYXNlNjQ7XG5cblx0cmV0dXJuICcvKiMgJyArIGRhdGEgKyAnICovJztcbn1cblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvbGliL2Nzcy1iYXNlLmpzXG4vLyBtb2R1bGUgaWQgPSAxM1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvKlxuICBNSVQgTGljZW5zZSBodHRwOi8vd3d3Lm9wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL21pdC1saWNlbnNlLnBocFxuICBBdXRob3IgVG9iaWFzIEtvcHBlcnMgQHNva3JhXG4gIE1vZGlmaWVkIGJ5IEV2YW4gWW91IEB5eXg5OTA4MDNcbiovXG5cbnZhciBoYXNEb2N1bWVudCA9IHR5cGVvZiBkb2N1bWVudCAhPT0gJ3VuZGVmaW5lZCdcblxuaWYgKHR5cGVvZiBERUJVRyAhPT0gJ3VuZGVmaW5lZCcgJiYgREVCVUcpIHtcbiAgaWYgKCFoYXNEb2N1bWVudCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAndnVlLXN0eWxlLWxvYWRlciBjYW5ub3QgYmUgdXNlZCBpbiBhIG5vbi1icm93c2VyIGVudmlyb25tZW50LiAnICtcbiAgICBcIlVzZSB7IHRhcmdldDogJ25vZGUnIH0gaW4geW91ciBXZWJwYWNrIGNvbmZpZyB0byBpbmRpY2F0ZSBhIHNlcnZlci1yZW5kZXJpbmcgZW52aXJvbm1lbnQuXCJcbiAgKSB9XG59XG5cbnZhciBsaXN0VG9TdHlsZXMgPSByZXF1aXJlKCcuL2xpc3RUb1N0eWxlcycpXG5cbi8qXG50eXBlIFN0eWxlT2JqZWN0ID0ge1xuICBpZDogbnVtYmVyO1xuICBwYXJ0czogQXJyYXk8U3R5bGVPYmplY3RQYXJ0PlxufVxuXG50eXBlIFN0eWxlT2JqZWN0UGFydCA9IHtcbiAgY3NzOiBzdHJpbmc7XG4gIG1lZGlhOiBzdHJpbmc7XG4gIHNvdXJjZU1hcDogP3N0cmluZ1xufVxuKi9cblxudmFyIHN0eWxlc0luRG9tID0gey8qXG4gIFtpZDogbnVtYmVyXToge1xuICAgIGlkOiBudW1iZXIsXG4gICAgcmVmczogbnVtYmVyLFxuICAgIHBhcnRzOiBBcnJheTwob2JqPzogU3R5bGVPYmplY3RQYXJ0KSA9PiB2b2lkPlxuICB9XG4qL31cblxudmFyIGhlYWQgPSBoYXNEb2N1bWVudCAmJiAoZG9jdW1lbnQuaGVhZCB8fCBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaGVhZCcpWzBdKVxudmFyIHNpbmdsZXRvbkVsZW1lbnQgPSBudWxsXG52YXIgc2luZ2xldG9uQ291bnRlciA9IDBcbnZhciBpc1Byb2R1Y3Rpb24gPSBmYWxzZVxudmFyIG5vb3AgPSBmdW5jdGlvbiAoKSB7fVxudmFyIG9wdGlvbnMgPSBudWxsXG52YXIgc3NySWRLZXkgPSAnZGF0YS12dWUtc3NyLWlkJ1xuXG4vLyBGb3JjZSBzaW5nbGUtdGFnIHNvbHV0aW9uIG9uIElFNi05LCB3aGljaCBoYXMgYSBoYXJkIGxpbWl0IG9uIHRoZSAjIG9mIDxzdHlsZT5cbi8vIHRhZ3MgaXQgd2lsbCBhbGxvdyBvbiBhIHBhZ2VcbnZhciBpc09sZElFID0gdHlwZW9mIG5hdmlnYXRvciAhPT0gJ3VuZGVmaW5lZCcgJiYgL21zaWUgWzYtOV1cXGIvLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudC50b0xvd2VyQ2FzZSgpKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChwYXJlbnRJZCwgbGlzdCwgX2lzUHJvZHVjdGlvbiwgX29wdGlvbnMpIHtcbiAgaXNQcm9kdWN0aW9uID0gX2lzUHJvZHVjdGlvblxuXG4gIG9wdGlvbnMgPSBfb3B0aW9ucyB8fCB7fVxuXG4gIHZhciBzdHlsZXMgPSBsaXN0VG9TdHlsZXMocGFyZW50SWQsIGxpc3QpXG4gIGFkZFN0eWxlc1RvRG9tKHN0eWxlcylcblxuICByZXR1cm4gZnVuY3Rpb24gdXBkYXRlIChuZXdMaXN0KSB7XG4gICAgdmFyIG1heVJlbW92ZSA9IFtdXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdHlsZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBpdGVtID0gc3R5bGVzW2ldXG4gICAgICB2YXIgZG9tU3R5bGUgPSBzdHlsZXNJbkRvbVtpdGVtLmlkXVxuICAgICAgZG9tU3R5bGUucmVmcy0tXG4gICAgICBtYXlSZW1vdmUucHVzaChkb21TdHlsZSlcbiAgICB9XG4gICAgaWYgKG5ld0xpc3QpIHtcbiAgICAgIHN0eWxlcyA9IGxpc3RUb1N0eWxlcyhwYXJlbnRJZCwgbmV3TGlzdClcbiAgICAgIGFkZFN0eWxlc1RvRG9tKHN0eWxlcylcbiAgICB9IGVsc2Uge1xuICAgICAgc3R5bGVzID0gW11cbiAgICB9XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBtYXlSZW1vdmUubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBkb21TdHlsZSA9IG1heVJlbW92ZVtpXVxuICAgICAgaWYgKGRvbVN0eWxlLnJlZnMgPT09IDApIHtcbiAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBkb21TdHlsZS5wYXJ0cy5sZW5ndGg7IGorKykge1xuICAgICAgICAgIGRvbVN0eWxlLnBhcnRzW2pdKClcbiAgICAgICAgfVxuICAgICAgICBkZWxldGUgc3R5bGVzSW5Eb21bZG9tU3R5bGUuaWRdXG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGFkZFN0eWxlc1RvRG9tIChzdHlsZXMgLyogQXJyYXk8U3R5bGVPYmplY3Q+ICovKSB7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgc3R5bGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGl0ZW0gPSBzdHlsZXNbaV1cbiAgICB2YXIgZG9tU3R5bGUgPSBzdHlsZXNJbkRvbVtpdGVtLmlkXVxuICAgIGlmIChkb21TdHlsZSkge1xuICAgICAgZG9tU3R5bGUucmVmcysrXG4gICAgICBmb3IgKHZhciBqID0gMDsgaiA8IGRvbVN0eWxlLnBhcnRzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgIGRvbVN0eWxlLnBhcnRzW2pdKGl0ZW0ucGFydHNbal0pXG4gICAgICB9XG4gICAgICBmb3IgKDsgaiA8IGl0ZW0ucGFydHMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgZG9tU3R5bGUucGFydHMucHVzaChhZGRTdHlsZShpdGVtLnBhcnRzW2pdKSlcbiAgICAgIH1cbiAgICAgIGlmIChkb21TdHlsZS5wYXJ0cy5sZW5ndGggPiBpdGVtLnBhcnRzLmxlbmd0aCkge1xuICAgICAgICBkb21TdHlsZS5wYXJ0cy5sZW5ndGggPSBpdGVtLnBhcnRzLmxlbmd0aFxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgcGFydHMgPSBbXVxuICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBpdGVtLnBhcnRzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgIHBhcnRzLnB1c2goYWRkU3R5bGUoaXRlbS5wYXJ0c1tqXSkpXG4gICAgICB9XG4gICAgICBzdHlsZXNJbkRvbVtpdGVtLmlkXSA9IHsgaWQ6IGl0ZW0uaWQsIHJlZnM6IDEsIHBhcnRzOiBwYXJ0cyB9XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVN0eWxlRWxlbWVudCAoKSB7XG4gIHZhciBzdHlsZUVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdHlsZScpXG4gIHN0eWxlRWxlbWVudC50eXBlID0gJ3RleHQvY3NzJ1xuICBoZWFkLmFwcGVuZENoaWxkKHN0eWxlRWxlbWVudClcbiAgcmV0dXJuIHN0eWxlRWxlbWVudFxufVxuXG5mdW5jdGlvbiBhZGRTdHlsZSAob2JqIC8qIFN0eWxlT2JqZWN0UGFydCAqLykge1xuICB2YXIgdXBkYXRlLCByZW1vdmVcbiAgdmFyIHN0eWxlRWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ3N0eWxlWycgKyBzc3JJZEtleSArICd+PVwiJyArIG9iai5pZCArICdcIl0nKVxuXG4gIGlmIChzdHlsZUVsZW1lbnQpIHtcbiAgICBpZiAoaXNQcm9kdWN0aW9uKSB7XG4gICAgICAvLyBoYXMgU1NSIHN0eWxlcyBhbmQgaW4gcHJvZHVjdGlvbiBtb2RlLlxuICAgICAgLy8gc2ltcGx5IGRvIG5vdGhpbmcuXG4gICAgICByZXR1cm4gbm9vcFxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBoYXMgU1NSIHN0eWxlcyBidXQgaW4gZGV2IG1vZGUuXG4gICAgICAvLyBmb3Igc29tZSByZWFzb24gQ2hyb21lIGNhbid0IGhhbmRsZSBzb3VyY2UgbWFwIGluIHNlcnZlci1yZW5kZXJlZFxuICAgICAgLy8gc3R5bGUgdGFncyAtIHNvdXJjZSBtYXBzIGluIDxzdHlsZT4gb25seSB3b3JrcyBpZiB0aGUgc3R5bGUgdGFnIGlzXG4gICAgICAvLyBjcmVhdGVkIGFuZCBpbnNlcnRlZCBkeW5hbWljYWxseS4gU28gd2UgcmVtb3ZlIHRoZSBzZXJ2ZXIgcmVuZGVyZWRcbiAgICAgIC8vIHN0eWxlcyBhbmQgaW5qZWN0IG5ldyBvbmVzLlxuICAgICAgc3R5bGVFbGVtZW50LnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoc3R5bGVFbGVtZW50KVxuICAgIH1cbiAgfVxuXG4gIGlmIChpc09sZElFKSB7XG4gICAgLy8gdXNlIHNpbmdsZXRvbiBtb2RlIGZvciBJRTkuXG4gICAgdmFyIHN0eWxlSW5kZXggPSBzaW5nbGV0b25Db3VudGVyKytcbiAgICBzdHlsZUVsZW1lbnQgPSBzaW5nbGV0b25FbGVtZW50IHx8IChzaW5nbGV0b25FbGVtZW50ID0gY3JlYXRlU3R5bGVFbGVtZW50KCkpXG4gICAgdXBkYXRlID0gYXBwbHlUb1NpbmdsZXRvblRhZy5iaW5kKG51bGwsIHN0eWxlRWxlbWVudCwgc3R5bGVJbmRleCwgZmFsc2UpXG4gICAgcmVtb3ZlID0gYXBwbHlUb1NpbmdsZXRvblRhZy5iaW5kKG51bGwsIHN0eWxlRWxlbWVudCwgc3R5bGVJbmRleCwgdHJ1ZSlcbiAgfSBlbHNlIHtcbiAgICAvLyB1c2UgbXVsdGktc3R5bGUtdGFnIG1vZGUgaW4gYWxsIG90aGVyIGNhc2VzXG4gICAgc3R5bGVFbGVtZW50ID0gY3JlYXRlU3R5bGVFbGVtZW50KClcbiAgICB1cGRhdGUgPSBhcHBseVRvVGFnLmJpbmQobnVsbCwgc3R5bGVFbGVtZW50KVxuICAgIHJlbW92ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHN0eWxlRWxlbWVudC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHN0eWxlRWxlbWVudClcbiAgICB9XG4gIH1cblxuICB1cGRhdGUob2JqKVxuXG4gIHJldHVybiBmdW5jdGlvbiB1cGRhdGVTdHlsZSAobmV3T2JqIC8qIFN0eWxlT2JqZWN0UGFydCAqLykge1xuICAgIGlmIChuZXdPYmopIHtcbiAgICAgIGlmIChuZXdPYmouY3NzID09PSBvYmouY3NzICYmXG4gICAgICAgICAgbmV3T2JqLm1lZGlhID09PSBvYmoubWVkaWEgJiZcbiAgICAgICAgICBuZXdPYmouc291cmNlTWFwID09PSBvYmouc291cmNlTWFwKSB7XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuICAgICAgdXBkYXRlKG9iaiA9IG5ld09iailcbiAgICB9IGVsc2Uge1xuICAgICAgcmVtb3ZlKClcbiAgICB9XG4gIH1cbn1cblxudmFyIHJlcGxhY2VUZXh0ID0gKGZ1bmN0aW9uICgpIHtcbiAgdmFyIHRleHRTdG9yZSA9IFtdXG5cbiAgcmV0dXJuIGZ1bmN0aW9uIChpbmRleCwgcmVwbGFjZW1lbnQpIHtcbiAgICB0ZXh0U3RvcmVbaW5kZXhdID0gcmVwbGFjZW1lbnRcbiAgICByZXR1cm4gdGV4dFN0b3JlLmZpbHRlcihCb29sZWFuKS5qb2luKCdcXG4nKVxuICB9XG59KSgpXG5cbmZ1bmN0aW9uIGFwcGx5VG9TaW5nbGV0b25UYWcgKHN0eWxlRWxlbWVudCwgaW5kZXgsIHJlbW92ZSwgb2JqKSB7XG4gIHZhciBjc3MgPSByZW1vdmUgPyAnJyA6IG9iai5jc3NcblxuICBpZiAoc3R5bGVFbGVtZW50LnN0eWxlU2hlZXQpIHtcbiAgICBzdHlsZUVsZW1lbnQuc3R5bGVTaGVldC5jc3NUZXh0ID0gcmVwbGFjZVRleHQoaW5kZXgsIGNzcylcbiAgfSBlbHNlIHtcbiAgICB2YXIgY3NzTm9kZSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGNzcylcbiAgICB2YXIgY2hpbGROb2RlcyA9IHN0eWxlRWxlbWVudC5jaGlsZE5vZGVzXG4gICAgaWYgKGNoaWxkTm9kZXNbaW5kZXhdKSBzdHlsZUVsZW1lbnQucmVtb3ZlQ2hpbGQoY2hpbGROb2Rlc1tpbmRleF0pXG4gICAgaWYgKGNoaWxkTm9kZXMubGVuZ3RoKSB7XG4gICAgICBzdHlsZUVsZW1lbnQuaW5zZXJ0QmVmb3JlKGNzc05vZGUsIGNoaWxkTm9kZXNbaW5kZXhdKVxuICAgIH0gZWxzZSB7XG4gICAgICBzdHlsZUVsZW1lbnQuYXBwZW5kQ2hpbGQoY3NzTm9kZSlcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gYXBwbHlUb1RhZyAoc3R5bGVFbGVtZW50LCBvYmopIHtcbiAgdmFyIGNzcyA9IG9iai5jc3NcbiAgdmFyIG1lZGlhID0gb2JqLm1lZGlhXG4gIHZhciBzb3VyY2VNYXAgPSBvYmouc291cmNlTWFwXG5cbiAgaWYgKG1lZGlhKSB7XG4gICAgc3R5bGVFbGVtZW50LnNldEF0dHJpYnV0ZSgnbWVkaWEnLCBtZWRpYSlcbiAgfVxuICBpZiAob3B0aW9ucy5zc3JJZCkge1xuICAgIHN0eWxlRWxlbWVudC5zZXRBdHRyaWJ1dGUoc3NySWRLZXksIG9iai5pZClcbiAgfVxuXG4gIGlmIChzb3VyY2VNYXApIHtcbiAgICAvLyBodHRwczovL2RldmVsb3Blci5jaHJvbWUuY29tL2RldnRvb2xzL2RvY3MvamF2YXNjcmlwdC1kZWJ1Z2dpbmdcbiAgICAvLyB0aGlzIG1ha2VzIHNvdXJjZSBtYXBzIGluc2lkZSBzdHlsZSB0YWdzIHdvcmsgcHJvcGVybHkgaW4gQ2hyb21lXG4gICAgY3NzICs9ICdcXG4vKiMgc291cmNlVVJMPScgKyBzb3VyY2VNYXAuc291cmNlc1swXSArICcgKi8nXG4gICAgLy8gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL2EvMjY2MDM4NzVcbiAgICBjc3MgKz0gJ1xcbi8qIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsJyArIGJ0b2EodW5lc2NhcGUoZW5jb2RlVVJJQ29tcG9uZW50KEpTT04uc3RyaW5naWZ5KHNvdXJjZU1hcCkpKSkgKyAnICovJ1xuICB9XG5cbiAgaWYgKHN0eWxlRWxlbWVudC5zdHlsZVNoZWV0KSB7XG4gICAgc3R5bGVFbGVtZW50LnN0eWxlU2hlZXQuY3NzVGV4dCA9IGNzc1xuICB9IGVsc2Uge1xuICAgIHdoaWxlIChzdHlsZUVsZW1lbnQuZmlyc3RDaGlsZCkge1xuICAgICAgc3R5bGVFbGVtZW50LnJlbW92ZUNoaWxkKHN0eWxlRWxlbWVudC5maXJzdENoaWxkKVxuICAgIH1cbiAgICBzdHlsZUVsZW1lbnQuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoY3NzKSlcbiAgfVxufVxuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9ub2RlX21vZHVsZXMvdnVlLXN0eWxlLWxvYWRlci9saWIvYWRkU3R5bGVzQ2xpZW50LmpzXG4vLyBtb2R1bGUgaWQgPSAxNFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJpbXBvcnQgVnVlIGZyb20gJ3Z1ZSdcbmltcG9ydCBheGlvcyBmcm9tICdheGlvcydcbmltcG9ydCBWdWVBeGlvcyBmcm9tICd2dWUtYXhpb3MnXG5pbXBvcnQgVnVlQnJlYWRjcnVtYnMgZnJvbSAndnVlLWJyZWFkY3J1bWJzJ1xuaW1wb3J0IFZ1ZVByb2dyZXNzQmFyIGZyb20gJ3Z1ZS1wcm9ncmVzc2JhcidcblxuaW1wb3J0IHJvdXRlciBmcm9tICcuL3JvdXRlcydcbmltcG9ydCBTaWRlYmFyIGZyb20gJy4vY29tcG9uZW50cy92aWV3cy9sYXlvdXRzL1NpZGViYXIudnVlJ1xuXG5WdWUudXNlKFZ1ZUF4aW9zLCBheGlvcyk7XG5WdWUudXNlKFZ1ZUJyZWFkY3J1bWJzLCB7XG4gICAgdGVtcGxhdGU6ICc8ZGl2IGlkPVwiYnJlYWRjcnVtYlwiIHYtaWY9XCIkYnJlYWRjcnVtYnMubGVuZ3RoXCI+JyArXG4gICAgJzxyb3V0ZXItbGluayBjbGFzcz1cImJyZWFkY3J1bWItaXRlbVwiIHYtZm9yPVwiKGNydW1iLCBrZXkpIGluICRicmVhZGNydW1ic1wiIDp0bz1cImxpbmtQcm9wKGNydW1iKVwiIDprZXk9XCJrZXlcIj57eyBjcnVtYiB8IGNydW1iVGV4dCB9fTwvcm91dGVyLWxpbms+ICcgK1xuICAgICc8L2Rpdj4nfSk7XG5WdWUudXNlKFZ1ZVByb2dyZXNzQmFyLCB7Y29sb3I6ICdyZ2IoMTQzLCAyNTUsIDE5OSknLGZhaWxlZENvbG9yOiAncmVkJyxoZWlnaHQ6ICcycHgnfSk7XG5cblxud2luZG93Lm9ubG9hZCA9IGZ1bmN0aW9uICgpIHtcbiAgICBuZXcgVnVlKHtcbiAgICAgICAgcm91dGVyLFxuICAgICAgICBjb21wb25lbnRzOiB7XG4gICAgICAgICAgICBTaWRlYmFyXG4gICAgICAgIH1cbiAgICB9KS4kbW91bnQoJyNob21lLWFwcCcpO1xufTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3Jlc291cmNlcy9hc3NldHMvanMvYXBwLmpzIiwiXCJ1c2Ugc3RyaWN0XCI7dmFyIF90eXBlb2Y9XCJmdW5jdGlvblwiPT10eXBlb2YgU3ltYm9sJiZcInN5bWJvbFwiPT10eXBlb2YgU3ltYm9sLml0ZXJhdG9yP2Z1bmN0aW9uKG8pe3JldHVybiB0eXBlb2Ygb306ZnVuY3Rpb24obyl7cmV0dXJuIG8mJlwiZnVuY3Rpb25cIj09dHlwZW9mIFN5bWJvbCYmby5jb25zdHJ1Y3Rvcj09PVN5bWJvbCYmbyE9PVN5bWJvbC5wcm90b3R5cGU/XCJzeW1ib2xcIjp0eXBlb2Ygb307IWZ1bmN0aW9uKCl7ZnVuY3Rpb24gbyhlLHQpe2lmKCFvLmluc3RhbGxlZCl7aWYoby5pbnN0YWxsZWQ9ITAsIXQpcmV0dXJuIHZvaWQgY29uc29sZS5lcnJvcihcIllvdSBoYXZlIHRvIGluc3RhbGwgYXhpb3NcIik7ZS5heGlvcz10LE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKGUucHJvdG90eXBlLHtheGlvczp7Z2V0OmZ1bmN0aW9uKCl7cmV0dXJuIHR9fSwkaHR0cDp7Z2V0OmZ1bmN0aW9uKCl7cmV0dXJuIHR9fX0pfX1cIm9iamVjdFwiPT0oXCJ1bmRlZmluZWRcIj09dHlwZW9mIGV4cG9ydHM/XCJ1bmRlZmluZWRcIjpfdHlwZW9mKGV4cG9ydHMpKT9tb2R1bGUuZXhwb3J0cz1vOlwiZnVuY3Rpb25cIj09dHlwZW9mIGRlZmluZSYmZGVmaW5lLmFtZD9kZWZpbmUoW10sZnVuY3Rpb24oKXtyZXR1cm4gb30pOndpbmRvdy5WdWUmJndpbmRvdy5heGlvcyYmVnVlLnVzZShvLHdpbmRvdy5heGlvcyl9KCk7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9ub2RlX21vZHVsZXMvdnVlLWF4aW9zL2Rpc3QvdnVlLWF4aW9zLm1pbi5qc1xuLy8gbW9kdWxlIGlkID0gMzdcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLyohXG4gKiB2dWUtYnJlYWRjcnVtYnMgdjEuMS4xXG4gKiAoYykgMjAxNyBTYW0gVHVycmVsbFxuICogUmVsZWFzZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlLlxuICovXG4ndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIGluc3RhbGwoVnVlLCBvcHRpb25zKSB7XG4gIGZ1bmN0aW9uIGdldE1hdGNoZWRSb3V0ZXMocm91dGVzKSB7XG4gICAgLy8gQ29udmVydCB0byBhbiBhcnJheSBpZiBWdWUgMS54XG4gICAgaWYgKHBhcnNlRmxvYXQoVnVlLnZlcnNpb24pIDwgMikge1xuICAgICAgcm91dGVzID0gT2JqZWN0LmtleXMocm91dGVzKS5maWx0ZXIoZnVuY3Rpb24gKGtleSkge1xuICAgICAgICByZXR1cm4gIWlzTmFOKGtleSk7XG4gICAgICB9KS5tYXAoZnVuY3Rpb24gKGtleSkge1xuICAgICAgICByZXR1cm4gcm91dGVzW2tleV07XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gcm91dGVzO1xuICB9XG5cbiAgLy8gQWRkIHRoZSAkYnJlYWRjcnVtYnMgcHJvcGVydHkgdG8gdGhlIFZ1ZSBpbnN0YW5jZVxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoVnVlLnByb3RvdHlwZSwgJyRicmVhZGNydW1icycsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgIHZhciBjcnVtYnMgPSBbXTtcblxuICAgICAgdmFyIG1hdGNoZWQgPSBnZXRNYXRjaGVkUm91dGVzKHRoaXMuJHJvdXRlLm1hdGNoZWQpO1xuXG4gICAgICBtYXRjaGVkLmZvckVhY2goZnVuY3Rpb24gKHJvdXRlKSB7XG4gICAgICAgIC8vIEJhY2t3YXJkcyBjb21wYXRpYmlsaXR5XG4gICAgICAgIHZhciBoYXNCcmVhZGNydW1iID0gcGFyc2VGbG9hdChWdWUudmVyc2lvbikgPCAyID8gcm91dGUuaGFuZGxlciAmJiByb3V0ZS5oYW5kbGVyLmJyZWFkY3J1bWIgOiByb3V0ZS5tZXRhICYmIHJvdXRlLm1ldGEuYnJlYWRjcnVtYjtcblxuICAgICAgICBpZiAoaGFzQnJlYWRjcnVtYikge1xuICAgICAgICAgIGNydW1icy5wdXNoKHJvdXRlKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIHJldHVybiBjcnVtYnM7XG4gICAgfVxuICB9KTtcblxuICB2YXIgZGVmYXVsdHMgPSB7XG4gICAgbWV0aG9kczoge1xuICAgICAgLy8gUmV0dXJuIHRoZSBjb3JyZWN0IHByb3AgZGF0YVxuICAgICAgbGlua1Byb3A6IGZ1bmN0aW9uIGxpbmtQcm9wKGNydW1iKSB7XG4gICAgICAgIC8vIElmIGl0J3MgYSBuYW1lZCByb3V0ZSwgd2UnbGwgYmFzZSB0aGUgcm91dGVcbiAgICAgICAgLy8gb2ZmIG9mIHRoYXQgaW5zdGVhZFxuICAgICAgICBpZiAoY3J1bWIubmFtZSB8fCBjcnVtYi5oYW5kbGVyICYmIGNydW1iLmhhbmRsZXIubmFtZSkge1xuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBuYW1lOiBjcnVtYi5uYW1lIHx8IGNydW1iLmhhbmRsZXIubmFtZSxcbiAgICAgICAgICAgIHBhcmFtczogdGhpcy4kcm91dGUucGFyYW1zXG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgcGF0aDogY3J1bWIuaGFuZGxlciAmJiBjcnVtYi5oYW5kbGVyLmZ1bGxQYXRoID8gY3J1bWIuaGFuZGxlci5mdWxsUGF0aCA6IGNydW1iLnBhdGgsXG4gICAgICAgICAgcGFyYW1zOiB0aGlzLiRyb3V0ZS5wYXJhbXNcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgZmlsdGVyczoge1xuICAgICAgLy8gRGlzcGxheSB0aGUgY29ycmVjdCBicmVhZGNydW1iIHRleHRcbiAgICAgIC8vIGRlcGVuZGluZyBvbiB0aGUgVnVlIHZlcnNpb25cbiAgICAgIGNydW1iVGV4dDogZnVuY3Rpb24gY3J1bWJUZXh0KGNydW1iKSB7XG4gICAgICAgIHJldHVybiBwYXJzZUZsb2F0KFZ1ZS52ZXJzaW9uKSA8IDIgPyBjcnVtYi5oYW5kbGVyLmJyZWFkY3J1bWIgOiBjcnVtYi5tZXRhLmJyZWFkY3J1bWI7XG4gICAgICB9XG4gICAgfSxcblxuICAgIHRlbXBsYXRlOiAnPG5hdiBjbGFzcz1cImJyZWFkY3J1bWJzXCIgdi1pZj1cIiRicmVhZGNydW1icy5sZW5ndGhcIj4gJyArICc8dWw+ICcgKyAnPGxpIHYtZm9yPVwiY3J1bWIgaW4gJGJyZWFkY3J1bWJzXCI+ICcgKyAnPHJvdXRlci1saW5rIDp0bz1cImxpbmtQcm9wKGNydW1iKVwiPnt7IGNydW1iIHwgY3J1bWJUZXh0IH19PC9yb3V0ZXItbGluaz4gJyArICc8L2xpPiAnICsgJzwvdWw+ICcgKyAnPC9uYXY+J1xuICB9O1xuXG4gIC8vIEFkZCBhIGRlZmF1bHQgYnJlYWRjcnVtYnMgY29tcG9uZW50XG4gIFZ1ZS5jb21wb25lbnQoJ2JyZWFkY3J1bWJzJywgT2JqZWN0LmFzc2lnbihkZWZhdWx0cywgb3B0aW9ucykpO1xufVxuXG52YXIgaW5kZXggPSB7XG4gIGluc3RhbGw6IGluc3RhbGwsXG4gIHZlcnNpb246ICcwLjMuMSdcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gaW5kZXg7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9ub2RlX21vZHVsZXMvdnVlLWJyZWFkY3J1bWJzL2Rpc3QvdnVlLWJyZWFkY3J1bWJzLmNvbW1vbi5qc1xuLy8gbW9kdWxlIGlkID0gMzhcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiIWZ1bmN0aW9uKHQsbyl7XCJvYmplY3RcIj09dHlwZW9mIGV4cG9ydHMmJlwidW5kZWZpbmVkXCIhPXR5cGVvZiBtb2R1bGU/bW9kdWxlLmV4cG9ydHM9bygpOlwiZnVuY3Rpb25cIj09dHlwZW9mIGRlZmluZSYmZGVmaW5lLmFtZD9kZWZpbmUobyk6dC5WdWVQcm9ncmVzc0Jhcj1vKCl9KHRoaXMsZnVuY3Rpb24oKXtcInVzZSBzdHJpY3RcIjshZnVuY3Rpb24oKXtpZihcInVuZGVmaW5lZFwiIT10eXBlb2YgZG9jdW1lbnQpe3ZhciB0PWRvY3VtZW50LmhlYWR8fGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKFwiaGVhZFwiKVswXSxvPWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzdHlsZVwiKSxpPVwiIC5fX2Nvdi1wcm9ncmVzcyB7IHBvc2l0aW9uOiBmaXhlZDsgb3BhY2l0eTogMTsgei1pbmRleDogOTk5OTk5OyB9IFwiO28udHlwZT1cInRleHQvY3NzXCIsby5zdHlsZVNoZWV0P28uc3R5bGVTaGVldC5jc3NUZXh0PWk6by5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShpKSksdC5hcHBlbmRDaGlsZChvKX19KCk7dmFyIHQ9XCJ1bmRlZmluZWRcIiE9dHlwZW9mIHdpbmRvdyxyPXtyZW5kZXI6ZnVuY3Rpb24oKXt2YXIgdD10aGlzLG89dC4kY3JlYXRlRWxlbWVudDtyZXR1cm4odC5fc2VsZi5fY3x8bykoXCJkaXZcIix7c3RhdGljQ2xhc3M6XCJfX2Nvdi1wcm9ncmVzc1wiLHN0eWxlOnQuc3R5bGV9KX0sc3RhdGljUmVuZGVyRm5zOltdLG5hbWU6XCJWdWVQcm9ncmVzc1wiLHNlcnZlckNhY2hlS2V5OmZ1bmN0aW9uKCl7cmV0dXJuXCJQcm9ncmVzc1wifSxjb21wdXRlZDp7c3R5bGU6ZnVuY3Rpb24oKXt2YXIgdD10aGlzLnByb2dyZXNzLm9wdGlvbnMubG9jYXRpb24sbz17XCJiYWNrZ3JvdW5kLWNvbG9yXCI6dGhpcy5wcm9ncmVzcy5vcHRpb25zLmNhblN1Y2Nlc3M/dGhpcy5wcm9ncmVzcy5vcHRpb25zLmNvbG9yOnRoaXMucHJvZ3Jlc3Mub3B0aW9ucy5mYWlsZWRDb2xvcixvcGFjaXR5OnRoaXMucHJvZ3Jlc3Mub3B0aW9ucy5zaG93PzE6MH07cmV0dXJuXCJ0b3BcIj09dHx8XCJib3R0b21cIj09dD8oXCJ0b3BcIj09PXQ/by50b3A9XCIwcHhcIjpvLmJvdHRvbT1cIjBweFwiLHRoaXMucHJvZ3Jlc3Mub3B0aW9ucy5pbnZlcnNlP28ucmlnaHQ9XCIwcHhcIjpvLmxlZnQ9XCIwcHhcIixvLndpZHRoPXRoaXMucHJvZ3Jlc3MucGVyY2VudCtcIiVcIixvLmhlaWdodD10aGlzLnByb2dyZXNzLm9wdGlvbnMudGhpY2tuZXNzLG8udHJhbnNpdGlvbj1cIndpZHRoIFwiK3RoaXMucHJvZ3Jlc3Mub3B0aW9ucy50cmFuc2l0aW9uLnNwZWVkK1wiLCBvcGFjaXR5IFwiK3RoaXMucHJvZ3Jlc3Mub3B0aW9ucy50cmFuc2l0aW9uLm9wYWNpdHkpOlwibGVmdFwiIT10JiZcInJpZ2h0XCIhPXR8fChcImxlZnRcIj09PXQ/by5sZWZ0PVwiMHB4XCI6by5yaWdodD1cIjBweFwiLHRoaXMucHJvZ3Jlc3Mub3B0aW9ucy5pbnZlcnNlP28udG9wPVwiMHB4XCI6by5ib3R0b209XCIwcHhcIixvLmhlaWdodD10aGlzLnByb2dyZXNzLnBlcmNlbnQrXCIlXCIsby53aWR0aD10aGlzLnByb2dyZXNzLm9wdGlvbnMudGhpY2tuZXNzLG8udHJhbnNpdGlvbj1cImhlaWdodCBcIit0aGlzLnByb2dyZXNzLm9wdGlvbnMudHJhbnNpdGlvbi5zcGVlZCtcIiwgb3BhY2l0eSBcIit0aGlzLnByb2dyZXNzLm9wdGlvbnMudHJhbnNpdGlvbi5vcGFjaXR5KSxvfSxwcm9ncmVzczpmdW5jdGlvbigpe3JldHVybiB0P3dpbmRvdy5WdWVQcm9ncmVzc0JhckV2ZW50QnVzLlJBRE9OX0xPQURJTkdfQkFSOntwZXJjZW50OjAsb3B0aW9uczp7Y2FuU3VjY2VzczohMCxzaG93OiExLGNvbG9yOlwicmdiKDE5LCA5MSwgNTUpXCIsZmFpbGVkQ29sb3I6XCJyZWRcIix0aGlja25lc3M6XCIycHhcIix0cmFuc2l0aW9uOntzcGVlZDpcIjAuMnNcIixvcGFjaXR5OlwiMC42c1wiLHRlcm1pbmF0aW9uOjMwMH0sbG9jYXRpb246XCJ0b3BcIixhdXRvUmV2ZXJ0OiEwLGludmVyc2U6ITF9fX19fTtyZXR1cm57aW5zdGFsbDpmdW5jdGlvbihvKXt2YXIgdD0xPGFyZ3VtZW50cy5sZW5ndGgmJnZvaWQgMCE9PWFyZ3VtZW50c1sxXT9hcmd1bWVudHNbMV06e30saT0oby52ZXJzaW9uLnNwbGl0KFwiLlwiKVswXSxcInVuZGVmaW5lZFwiIT10eXBlb2Ygd2luZG93KSxlPXskdm06bnVsbCxzdGF0ZTp7dEZhaWxDb2xvcjpcIlwiLHRDb2xvcjpcIlwiLHRpbWVyOm51bGwsY3V0OjB9LGluaXQ6ZnVuY3Rpb24odCl7dGhpcy4kdm09dH0sc3RhcnQ6ZnVuY3Rpb24odCl7dmFyIG89dGhpczt0aGlzLiR2bSYmKHR8fCh0PTNlMyksdGhpcy4kdm0uUkFET05fTE9BRElOR19CQVIucGVyY2VudD0wLHRoaXMuJHZtLlJBRE9OX0xPQURJTkdfQkFSLm9wdGlvbnMuc2hvdz0hMCx0aGlzLiR2bS5SQURPTl9MT0FESU5HX0JBUi5vcHRpb25zLmNhblN1Y2Nlc3M9ITAsdGhpcy5zdGF0ZS5jdXQ9MWU0L01hdGguZmxvb3IodCksY2xlYXJJbnRlcnZhbCh0aGlzLnN0YXRlLnRpbWVyKSx0aGlzLnN0YXRlLnRpbWVyPXNldEludGVydmFsKGZ1bmN0aW9uKCl7by5pbmNyZWFzZShvLnN0YXRlLmN1dCpNYXRoLnJhbmRvbSgpKSw5NTxvLiR2bS5SQURPTl9MT0FESU5HX0JBUi5wZXJjZW50JiZvLiR2bS5SQURPTl9MT0FESU5HX0JBUi5vcHRpb25zLmF1dG9GaW5pc2gmJm8uZmluaXNoKCl9LDEwMCkpfSxzZXQ6ZnVuY3Rpb24odCl7dGhpcy4kdm0uUkFET05fTE9BRElOR19CQVIub3B0aW9ucy5zaG93PSEwLHRoaXMuJHZtLlJBRE9OX0xPQURJTkdfQkFSLm9wdGlvbnMuY2FuU3VjY2Vzcz0hMCx0aGlzLiR2bS5SQURPTl9MT0FESU5HX0JBUi5wZXJjZW50PU1hdGguZmxvb3IodCl9LGdldDpmdW5jdGlvbigpe3JldHVybiBNYXRoLmZsb29yKHRoaXMuJHZtLlJBRE9OX0xPQURJTkdfQkFSLnBlcmNlbnQpfSxpbmNyZWFzZTpmdW5jdGlvbih0KXt0aGlzLiR2bS5SQURPTl9MT0FESU5HX0JBUi5wZXJjZW50PU1hdGgubWluKDk5LHRoaXMuJHZtLlJBRE9OX0xPQURJTkdfQkFSLnBlcmNlbnQrTWF0aC5mbG9vcih0KSl9LGRlY3JlYXNlOmZ1bmN0aW9uKHQpe3RoaXMuJHZtLlJBRE9OX0xPQURJTkdfQkFSLnBlcmNlbnQ9dGhpcy4kdm0uUkFET05fTE9BRElOR19CQVIucGVyY2VudC1NYXRoLmZsb29yKHQpfSxoaWRlOmZ1bmN0aW9uKCl7dmFyIHQ9dGhpcztjbGVhckludGVydmFsKHRoaXMuc3RhdGUudGltZXIpLHRoaXMuc3RhdGUudGltZXI9bnVsbCxzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7dC4kdm0uUkFET05fTE9BRElOR19CQVIub3B0aW9ucy5zaG93PSExLG8ubmV4dFRpY2soZnVuY3Rpb24oKXtzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7dC4kdm0uUkFET05fTE9BRElOR19CQVIucGVyY2VudD0wfSwxMDApLHQuJHZtLlJBRE9OX0xPQURJTkdfQkFSLm9wdGlvbnMuYXV0b1JldmVydCYmc2V0VGltZW91dChmdW5jdGlvbigpe3QucmV2ZXJ0KCl9LDMwMCl9KX0sdGhpcy4kdm0uUkFET05fTE9BRElOR19CQVIub3B0aW9ucy50cmFuc2l0aW9uLnRlcm1pbmF0aW9uKX0scGF1c2U6ZnVuY3Rpb24oKXtjbGVhckludGVydmFsKHRoaXMuc3RhdGUudGltZXIpfSxmaW5pc2g6ZnVuY3Rpb24oKXt0aGlzLiR2bSYmKHRoaXMuJHZtLlJBRE9OX0xPQURJTkdfQkFSLnBlcmNlbnQ9MTAwLHRoaXMuaGlkZSgpKX0sZmFpbDpmdW5jdGlvbigpe3RoaXMuJHZtLlJBRE9OX0xPQURJTkdfQkFSLm9wdGlvbnMuY2FuU3VjY2Vzcz0hMSx0aGlzLiR2bS5SQURPTl9MT0FESU5HX0JBUi5wZXJjZW50PTEwMCx0aGlzLmhpZGUoKX0sc2V0RmFpbENvbG9yOmZ1bmN0aW9uKHQpe3RoaXMuJHZtLlJBRE9OX0xPQURJTkdfQkFSLm9wdGlvbnMuZmFpbGVkQ29sb3I9dH0sc2V0Q29sb3I6ZnVuY3Rpb24odCl7dGhpcy4kdm0uUkFET05fTE9BRElOR19CQVIub3B0aW9ucy5jb2xvcj10fSxzZXRMb2NhdGlvbjpmdW5jdGlvbih0KXt0aGlzLiR2bS5SQURPTl9MT0FESU5HX0JBUi5vcHRpb25zLmxvY2F0aW9uPXR9LHNldFRyYW5zaXRpb246ZnVuY3Rpb24odCl7dGhpcy4kdm0uUkFET05fTE9BRElOR19CQVIub3B0aW9ucy50cmFuc2l0aW9uPXR9LHRlbXBGYWlsQ29sb3I6ZnVuY3Rpb24odCl7dGhpcy5zdGF0ZS50RmFpbENvbG9yPXRoaXMuJHZtLlJBRE9OX0xPQURJTkdfQkFSLm9wdGlvbnMuZmFpbGVkQ29sb3IsdGhpcy4kdm0uUkFET05fTE9BRElOR19CQVIub3B0aW9ucy5mYWlsZWRDb2xvcj10fSx0ZW1wQ29sb3I6ZnVuY3Rpb24odCl7dGhpcy5zdGF0ZS50Q29sb3I9dGhpcy4kdm0uUkFET05fTE9BRElOR19CQVIub3B0aW9ucy5jb2xvcix0aGlzLiR2bS5SQURPTl9MT0FESU5HX0JBUi5vcHRpb25zLmNvbG9yPXR9LHRlbXBMb2NhdGlvbjpmdW5jdGlvbih0KXt0aGlzLnN0YXRlLnRMb2NhdGlvbj10aGlzLiR2bS5SQURPTl9MT0FESU5HX0JBUi5vcHRpb25zLmxvY2F0aW9uLHRoaXMuJHZtLlJBRE9OX0xPQURJTkdfQkFSLm9wdGlvbnMubG9jYXRpb249dH0sdGVtcFRyYW5zaXRpb246ZnVuY3Rpb24odCl7dGhpcy5zdGF0ZS50VHJhbnNpdGlvbj10aGlzLiR2bS5SQURPTl9MT0FESU5HX0JBUi5vcHRpb25zLnRyYW5zaXRpb24sdGhpcy4kdm0uUkFET05fTE9BRElOR19CQVIub3B0aW9ucy50cmFuc2l0aW9uPXR9LHJldmVydENvbG9yOmZ1bmN0aW9uKCl7dGhpcy4kdm0uUkFET05fTE9BRElOR19CQVIub3B0aW9ucy5jb2xvcj10aGlzLnN0YXRlLnRDb2xvcix0aGlzLnN0YXRlLnRDb2xvcj1cIlwifSxyZXZlcnRGYWlsQ29sb3I6ZnVuY3Rpb24oKXt0aGlzLiR2bS5SQURPTl9MT0FESU5HX0JBUi5vcHRpb25zLmZhaWxlZENvbG9yPXRoaXMuc3RhdGUudEZhaWxDb2xvcix0aGlzLnN0YXRlLnRGYWlsQ29sb3I9XCJcIn0scmV2ZXJ0TG9jYXRpb246ZnVuY3Rpb24oKXt0aGlzLiR2bS5SQURPTl9MT0FESU5HX0JBUi5vcHRpb25zLmxvY2F0aW9uPXRoaXMuc3RhdGUudExvY2F0aW9uLHRoaXMuc3RhdGUudExvY2F0aW9uPVwiXCJ9LHJldmVydFRyYW5zaXRpb246ZnVuY3Rpb24oKXt0aGlzLiR2bS5SQURPTl9MT0FESU5HX0JBUi5vcHRpb25zLnRyYW5zaXRpb249dGhpcy5zdGF0ZS50VHJhbnNpdGlvbix0aGlzLnN0YXRlLnRUcmFuc2l0aW9uPXt9fSxyZXZlcnQ6ZnVuY3Rpb24oKXt0aGlzLiR2bS5SQURPTl9MT0FESU5HX0JBUi5vcHRpb25zLmF1dG9SZXZlcnQmJih0aGlzLnN0YXRlLnRDb2xvciYmdGhpcy5yZXZlcnRDb2xvcigpLHRoaXMuc3RhdGUudEZhaWxDb2xvciYmdGhpcy5yZXZlcnRGYWlsQ29sb3IoKSx0aGlzLnN0YXRlLnRMb2NhdGlvbiYmdGhpcy5yZXZlcnRMb2NhdGlvbigpLCF0aGlzLnN0YXRlLnRUcmFuc2l0aW9ufHx2b2lkIDA9PT10aGlzLnN0YXRlLnRUcmFuc2l0aW9uLnNwZWVkJiZ2b2lkIDA9PT10aGlzLnN0YXRlLnRUcmFuc2l0aW9uLm9wYWNpdHl8fHRoaXMucmV2ZXJ0VHJhbnNpdGlvbigpKX0scGFyc2VNZXRhOmZ1bmN0aW9uKHQpe2Zvcih2YXIgbyBpbiB0LmZ1bmMpe3ZhciBpPXQuZnVuY1tvXTtzd2l0Y2goaS5jYWxsKXtjYXNlXCJjb2xvclwiOnN3aXRjaChpLm1vZGlmaWVyKXtjYXNlXCJzZXRcIjp0aGlzLnNldENvbG9yKGkuYXJndW1lbnQpO2JyZWFrO2Nhc2VcInRlbXBcIjp0aGlzLnRlbXBDb2xvcihpLmFyZ3VtZW50KX1icmVhaztjYXNlXCJmYWlsXCI6c3dpdGNoKGkubW9kaWZpZXIpe2Nhc2VcInNldFwiOnRoaXMuc2V0RmFpbENvbG9yKGkuYXJndW1lbnQpO2JyZWFrO2Nhc2VcInRlbXBcIjp0aGlzLnRlbXBGYWlsQ29sb3IoaS5hcmd1bWVudCl9YnJlYWs7Y2FzZVwibG9jYXRpb25cIjpzd2l0Y2goaS5tb2RpZmllcil7Y2FzZVwic2V0XCI6dGhpcy5zZXRMb2NhdGlvbihpLmFyZ3VtZW50KTticmVhaztjYXNlXCJ0ZW1wXCI6dGhpcy50ZW1wTG9jYXRpb24oaS5hcmd1bWVudCl9YnJlYWs7Y2FzZVwidHJhbnNpdGlvblwiOnN3aXRjaChpLm1vZGlmaWVyKXtjYXNlXCJzZXRcIjp0aGlzLnNldFRyYW5zaXRpb24oaS5hcmd1bWVudCk7YnJlYWs7Y2FzZVwidGVtcFwiOnRoaXMudGVtcFRyYW5zaXRpb24oaS5hcmd1bWVudCl9fX19fSxzPWZ1bmN0aW9uKHQsbyl7Zm9yKHZhciBpLGUscz0xO3M8YXJndW1lbnRzLmxlbmd0aDsrK3MpZm9yKGkgaW4gZT1hcmd1bWVudHNbc10pT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGUsaSkmJih0W2ldPWVbaV0pO3JldHVybiB0fSh7Y2FuU3VjY2VzczohMCxzaG93OiExLGNvbG9yOlwiIzczY2NlY1wiLGZhaWxlZENvbG9yOlwicmVkXCIsdGhpY2tuZXNzOlwiMnB4XCIsdHJhbnNpdGlvbjp7c3BlZWQ6XCIwLjJzXCIsb3BhY2l0eTpcIjAuNnNcIix0ZXJtaW5hdGlvbjozMDB9LGF1dG9SZXZlcnQ6ITAsbG9jYXRpb246XCJ0b3BcIixpbnZlcnNlOiExLGF1dG9GaW5pc2g6ITB9LHQpLG49bmV3IG8oe2RhdGE6e1JBRE9OX0xPQURJTkdfQkFSOntwZXJjZW50OjAsb3B0aW9uczpzfX19KTtpJiYod2luZG93LlZ1ZVByb2dyZXNzQmFyRXZlbnRCdXM9bixlLmluaXQobikpLG8uY29tcG9uZW50KFwidnVlLXByb2dyZXNzLWJhclwiLHIpLG8ucHJvdG90eXBlLiRQcm9ncmVzcz1lfX19KTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vbm9kZV9tb2R1bGVzL3Z1ZS1wcm9ncmVzc2Jhci9kaXN0L3Z1ZS1wcm9ncmVzc2Jhci5qc1xuLy8gbW9kdWxlIGlkID0gMzlcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiaW1wb3J0IFZ1ZSBmcm9tICd2dWUnXHJcbmltcG9ydCBWdWVSb3V0ZXIgZnJvbSAndnVlLXJvdXRlcidcclxuXHJcbmltcG9ydCBIb21lIGZyb20gJy4uL2NvbXBvbmVudHMvdmlld3MvSG9tZS52dWUnXHJcbmltcG9ydCBOb3RGb3VuZCBmcm9tICcuLi9jb21wb25lbnRzL3ZpZXdzL05vdEZvdW5kLnZ1ZSdcclxuXHJcbmltcG9ydCBFbXBsb3llZSBmcm9tICcuLi9jb21wb25lbnRzL3ZpZXdzL2VtcGxveWVlL0VtcGxveWVlLnZ1ZSdcclxuaW1wb3J0IEVtcGxveWVlTGlzdCBmcm9tICcuLi9jb21wb25lbnRzL3ZpZXdzL2VtcGxveWVlL0xpc3RFbXBsb3llZS52dWUnXHJcbmltcG9ydCBFbXBsb3llZU5ldyBmcm9tICcuLi9jb21wb25lbnRzL3ZpZXdzL2VtcGxveWVlL0VtcGxveWVlTmV3LnZ1ZSdcclxuaW1wb3J0IEVtcGxveWVlRGV0YWlsIGZyb20gJy4uL2NvbXBvbmVudHMvdmlld3MvZW1wbG95ZWUvRW1wbG95ZWVEZXRhaWwudnVlJ1xyXG5cclxuVnVlLnVzZShWdWVSb3V0ZXIpO1xyXG5cclxuY29uc3Qgcm91dGVzID0gW1xyXG4gICAge3BhdGg6ICcvZGFzaGJvYXJkJywgbmFtZTogJ2hvbWUnLCBjb21wb25lbnQ6IEhvbWUsIG1ldGE6IHticmVhZGNydW1iOiAnSG9tZSd9fSxcclxuICAgIC8vIHtwYXRoOiAnL2VtcGxveWVlJywgcmVkaXJlY3Q6ICcvZW1wbG95ZWUvbGlzdCd9LFxyXG4gICAge1xyXG4gICAgICAgIHBhdGg6ICcvZW1wbG95ZWUnLFxyXG4gICAgICAgIG5hbWU6ICdlbXBsb3llZScsXHJcbiAgICAgICAgY29tcG9uZW50OiBFbXBsb3llZSxcclxuICAgICAgICByZWRpcmVjdDogJ2VtcGxveWVlLycsXHJcbiAgICAgICAgbWV0YToge3Blcm1pc3Npb246ICdhbnknLCBmYWlsOiAnLycsIHRpdGxlOiAnRW1wbG95ZWUnLCBicmVhZGNydW1iOiAnRW1wbG95ZWUnfSxcclxuICAgICAgICBjaGlsZHJlbjogW1xyXG4gICAgICAgICAgICB7cGF0aDogJycsIG5hbWU6ICdlbXBsb3llZS1saXN0JywgY29tcG9uZW50OiBFbXBsb3llZUxpc3QsIG1ldGE6IHtwZXJtaXNzaW9uOiAnYW55JywgZmFpbDogJy8nLCBicmVhZGNydW1iOiAnTGlzdCd9fSxcclxuICAgICAgICAgICAge3BhdGg6ICc6aWRFbXAvZGV0YWlsJywgbmFtZTogJ2VtcGxveWVlLWRldGFpbCcsIGNvbXBvbmVudDogRW1wbG95ZWVEZXRhaWwsIG1ldGE6IHtwZXJtaXNzaW9uOiAnYW55JywgZmFpbDogJy8nLCBicmVhZGNydW1iOiAnRGV0YWlsJ319LFxyXG4gICAgICAgICAgICB7cGF0aDogJ25ldycsIG5hbWU6ICdlbXBsb3llZS1uZXcnLCBjb21wb25lbnQ6IEVtcGxveWVlTmV3LCBtZXRhOiB7cGVybWlzc2lvbjogJ2FueScsIGZhaWw6ICcvJywgYnJlYWRjcnVtYjogJ05ldyd9fVxyXG4gICAgICAgIF1cclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgICAgcGF0aDogJy80MDQnLFxyXG4gICAgICAgIG5hbWU6ICdub3RGb3VuZCcsXHJcbiAgICAgICAgY29tcG9uZW50OiBOb3RGb3VuZFxyXG4gICAgfSxcclxuICAgIHtwYXRoOiAnKicsIGNvbXBvbmVudDogTm90Rm91bmQsIG1ldGE6IHt0aXRsZTogJ25vdCBmb3VuZCd9fVxyXG5cclxuICAgIC8vIHtwYXRoOiAnL21lbnUvOmlkTWVudScsIG5hbWU6ICdtZW51RGV0YWlsJywgY29tcG9uZW50OiBNZW51RGV0YWlsLCBtZXRhOiB7cGVybWlzc2lvbjogJ2FueScsIGZhaWw6ICcvJ319XHJcbl07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBuZXcgVnVlUm91dGVyKHtcclxuICAgIG1vZGU6ICdoaXN0b3J5JyxcclxuICAgIHJvdXRlcyxcclxuICAgIHJlZGlyZWN0OnsgJyonIDogJy8nfVxyXG59KVxyXG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3JvdXRlcy9pbmRleC5qcyIsInZhciBkaXNwb3NlZCA9IGZhbHNlXG52YXIgbm9ybWFsaXplQ29tcG9uZW50ID0gcmVxdWlyZShcIiEuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvY29tcG9uZW50LW5vcm1hbGl6ZXJcIilcbi8qIHNjcmlwdCAqL1xudmFyIF9fdnVlX3NjcmlwdF9fID0gcmVxdWlyZShcIiEhYmFiZWwtbG9hZGVyP3tcXFwiY2FjaGVEaXJlY3RvcnlcXFwiOnRydWUsXFxcInByZXNldHNcXFwiOltbXFxcImVudlxcXCIse1xcXCJtb2R1bGVzXFxcIjpmYWxzZSxcXFwidGFyZ2V0c1xcXCI6e1xcXCJicm93c2Vyc1xcXCI6W1xcXCI+IDIlXFxcIl0sXFxcInVnbGlmeVxcXCI6dHJ1ZX19XV0sXFxcInBsdWdpbnNcXFwiOltcXFwidHJhbnNmb3JtLW9iamVjdC1yZXN0LXNwcmVhZFxcXCIsW1xcXCJ0cmFuc2Zvcm0tcnVudGltZVxcXCIse1xcXCJwb2x5ZmlsbFxcXCI6ZmFsc2UsXFxcImhlbHBlcnNcXFwiOmZhbHNlfV1dfSEuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvc2VsZWN0b3I/dHlwZT1zY3JpcHQmaW5kZXg9MCEuL0hvbWUudnVlXCIpXG4vKiB0ZW1wbGF0ZSAqL1xudmFyIF9fdnVlX3RlbXBsYXRlX18gPSByZXF1aXJlKFwiISEuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvdGVtcGxhdGUtY29tcGlsZXIvaW5kZXg/e1xcXCJpZFxcXCI6XFxcImRhdGEtdi0wM2E3NTVjNFxcXCIsXFxcImhhc1Njb3BlZFxcXCI6ZmFsc2UsXFxcImJ1YmxlXFxcIjp7XFxcInRyYW5zZm9ybXNcXFwiOnt9fX0hLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL3NlbGVjdG9yP3R5cGU9dGVtcGxhdGUmaW5kZXg9MCEuL0hvbWUudnVlXCIpXG4vKiB0ZW1wbGF0ZSBmdW5jdGlvbmFsICovXG52YXIgX192dWVfdGVtcGxhdGVfZnVuY3Rpb25hbF9fID0gZmFsc2Vcbi8qIHN0eWxlcyAqL1xudmFyIF9fdnVlX3N0eWxlc19fID0gbnVsbFxuLyogc2NvcGVJZCAqL1xudmFyIF9fdnVlX3Njb3BlSWRfXyA9IG51bGxcbi8qIG1vZHVsZUlkZW50aWZpZXIgKHNlcnZlciBvbmx5KSAqL1xudmFyIF9fdnVlX21vZHVsZV9pZGVudGlmaWVyX18gPSBudWxsXG52YXIgQ29tcG9uZW50ID0gbm9ybWFsaXplQ29tcG9uZW50KFxuICBfX3Z1ZV9zY3JpcHRfXyxcbiAgX192dWVfdGVtcGxhdGVfXyxcbiAgX192dWVfdGVtcGxhdGVfZnVuY3Rpb25hbF9fLFxuICBfX3Z1ZV9zdHlsZXNfXyxcbiAgX192dWVfc2NvcGVJZF9fLFxuICBfX3Z1ZV9tb2R1bGVfaWRlbnRpZmllcl9fXG4pXG5Db21wb25lbnQub3B0aW9ucy5fX2ZpbGUgPSBcInJlc291cmNlc1xcXFxhc3NldHNcXFxcanNcXFxcY29tcG9uZW50c1xcXFx2aWV3c1xcXFxIb21lLnZ1ZVwiXG5cbi8qIGhvdCByZWxvYWQgKi9cbmlmIChtb2R1bGUuaG90KSB7KGZ1bmN0aW9uICgpIHtcbiAgdmFyIGhvdEFQSSA9IHJlcXVpcmUoXCJ2dWUtaG90LXJlbG9hZC1hcGlcIilcbiAgaG90QVBJLmluc3RhbGwocmVxdWlyZShcInZ1ZVwiKSwgZmFsc2UpXG4gIGlmICghaG90QVBJLmNvbXBhdGlibGUpIHJldHVyblxuICBtb2R1bGUuaG90LmFjY2VwdCgpXG4gIGlmICghbW9kdWxlLmhvdC5kYXRhKSB7XG4gICAgaG90QVBJLmNyZWF0ZVJlY29yZChcImRhdGEtdi0wM2E3NTVjNFwiLCBDb21wb25lbnQub3B0aW9ucylcbiAgfSBlbHNlIHtcbiAgICBob3RBUEkucmVsb2FkKFwiZGF0YS12LTAzYTc1NWM0XCIsIENvbXBvbmVudC5vcHRpb25zKVxuICB9XG4gIG1vZHVsZS5ob3QuZGlzcG9zZShmdW5jdGlvbiAoZGF0YSkge1xuICAgIGRpc3Bvc2VkID0gdHJ1ZVxuICB9KVxufSkoKX1cblxubW9kdWxlLmV4cG9ydHMgPSBDb21wb25lbnQuZXhwb3J0c1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9yZXNvdXJjZXMvYXNzZXRzL2pzL2NvbXBvbmVudHMvdmlld3MvSG9tZS52dWVcbi8vIG1vZHVsZSBpZCA9IDQxXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIjx0ZW1wbGF0ZT5cclxuICAgIDxkaXY+XHJcbiAgICAgICAgPGgzPkRhc2hib2FyZDwvaDM+XHJcbiAgICA8L2Rpdj5cclxuPC90ZW1wbGF0ZT5cclxuPHNjcmlwdD5cclxuICAgIGV4cG9ydCBkZWZhdWx0IHtcclxuICAgICAgICBuYW1lOiAnaG9tZSdcclxuICAgIH1cclxuPC9zY3JpcHQ+XG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIHJlc291cmNlcy9hc3NldHMvanMvY29tcG9uZW50cy92aWV3cy9Ib21lLnZ1ZSIsInZhciByZW5kZXIgPSBmdW5jdGlvbigpIHtcbiAgdmFyIF92bSA9IHRoaXNcbiAgdmFyIF9oID0gX3ZtLiRjcmVhdGVFbGVtZW50XG4gIHZhciBfYyA9IF92bS5fc2VsZi5fYyB8fCBfaFxuICByZXR1cm4gX3ZtLl9tKDApXG59XG52YXIgc3RhdGljUmVuZGVyRm5zID0gW1xuICBmdW5jdGlvbigpIHtcbiAgICB2YXIgX3ZtID0gdGhpc1xuICAgIHZhciBfaCA9IF92bS4kY3JlYXRlRWxlbWVudFxuICAgIHZhciBfYyA9IF92bS5fc2VsZi5fYyB8fCBfaFxuICAgIHJldHVybiBfYyhcImRpdlwiLCBbX2MoXCJoM1wiLCBbX3ZtLl92KFwiRGFzaGJvYXJkXCIpXSldKVxuICB9XG5dXG5yZW5kZXIuX3dpdGhTdHJpcHBlZCA9IHRydWVcbm1vZHVsZS5leHBvcnRzID0geyByZW5kZXI6IHJlbmRlciwgc3RhdGljUmVuZGVyRm5zOiBzdGF0aWNSZW5kZXJGbnMgfVxuaWYgKG1vZHVsZS5ob3QpIHtcbiAgbW9kdWxlLmhvdC5hY2NlcHQoKVxuICBpZiAobW9kdWxlLmhvdC5kYXRhKSB7XG4gICAgcmVxdWlyZShcInZ1ZS1ob3QtcmVsb2FkLWFwaVwiKSAgICAgIC5yZXJlbmRlcihcImRhdGEtdi0wM2E3NTVjNFwiLCBtb2R1bGUuZXhwb3J0cylcbiAgfVxufVxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL3RlbXBsYXRlLWNvbXBpbGVyP3tcImlkXCI6XCJkYXRhLXYtMDNhNzU1YzRcIixcImhhc1Njb3BlZFwiOmZhbHNlLFwiYnVibGVcIjp7XCJ0cmFuc2Zvcm1zXCI6e319fSEuL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2xpYi9zZWxlY3Rvci5qcz90eXBlPXRlbXBsYXRlJmluZGV4PTAhLi9yZXNvdXJjZXMvYXNzZXRzL2pzL2NvbXBvbmVudHMvdmlld3MvSG9tZS52dWVcbi8vIG1vZHVsZSBpZCA9IDQzXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciBkaXNwb3NlZCA9IGZhbHNlXG5mdW5jdGlvbiBpbmplY3RTdHlsZSAoc3NyQ29udGV4dCkge1xuICBpZiAoZGlzcG9zZWQpIHJldHVyblxuICByZXF1aXJlKFwiISF2dWUtc3R5bGUtbG9hZGVyIWNzcy1sb2FkZXI/c291cmNlTWFwIS4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2xpYi9zdHlsZS1jb21waWxlci9pbmRleD97XFxcInZ1ZVxcXCI6dHJ1ZSxcXFwiaWRcXFwiOlxcXCJkYXRhLXYtZDAwMzlhNThcXFwiLFxcXCJzY29wZWRcXFwiOmZhbHNlLFxcXCJoYXNJbmxpbmVDb25maWdcXFwiOnRydWV9IS4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2xpYi9zZWxlY3Rvcj90eXBlPXN0eWxlcyZpbmRleD0wIS4vTm90Rm91bmQudnVlXCIpXG59XG52YXIgbm9ybWFsaXplQ29tcG9uZW50ID0gcmVxdWlyZShcIiEuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvY29tcG9uZW50LW5vcm1hbGl6ZXJcIilcbi8qIHNjcmlwdCAqL1xudmFyIF9fdnVlX3NjcmlwdF9fID0gcmVxdWlyZShcIiEhYmFiZWwtbG9hZGVyP3tcXFwiY2FjaGVEaXJlY3RvcnlcXFwiOnRydWUsXFxcInByZXNldHNcXFwiOltbXFxcImVudlxcXCIse1xcXCJtb2R1bGVzXFxcIjpmYWxzZSxcXFwidGFyZ2V0c1xcXCI6e1xcXCJicm93c2Vyc1xcXCI6W1xcXCI+IDIlXFxcIl0sXFxcInVnbGlmeVxcXCI6dHJ1ZX19XV0sXFxcInBsdWdpbnNcXFwiOltcXFwidHJhbnNmb3JtLW9iamVjdC1yZXN0LXNwcmVhZFxcXCIsW1xcXCJ0cmFuc2Zvcm0tcnVudGltZVxcXCIse1xcXCJwb2x5ZmlsbFxcXCI6ZmFsc2UsXFxcImhlbHBlcnNcXFwiOmZhbHNlfV1dfSEuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvc2VsZWN0b3I/dHlwZT1zY3JpcHQmaW5kZXg9MCEuL05vdEZvdW5kLnZ1ZVwiKVxuLyogdGVtcGxhdGUgKi9cbnZhciBfX3Z1ZV90ZW1wbGF0ZV9fID0gcmVxdWlyZShcIiEhLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL3RlbXBsYXRlLWNvbXBpbGVyL2luZGV4P3tcXFwiaWRcXFwiOlxcXCJkYXRhLXYtZDAwMzlhNThcXFwiLFxcXCJoYXNTY29wZWRcXFwiOmZhbHNlLFxcXCJidWJsZVxcXCI6e1xcXCJ0cmFuc2Zvcm1zXFxcIjp7fX19IS4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2xpYi9zZWxlY3Rvcj90eXBlPXRlbXBsYXRlJmluZGV4PTAhLi9Ob3RGb3VuZC52dWVcIilcbi8qIHRlbXBsYXRlIGZ1bmN0aW9uYWwgKi9cbnZhciBfX3Z1ZV90ZW1wbGF0ZV9mdW5jdGlvbmFsX18gPSBmYWxzZVxuLyogc3R5bGVzICovXG52YXIgX192dWVfc3R5bGVzX18gPSBpbmplY3RTdHlsZVxuLyogc2NvcGVJZCAqL1xudmFyIF9fdnVlX3Njb3BlSWRfXyA9IG51bGxcbi8qIG1vZHVsZUlkZW50aWZpZXIgKHNlcnZlciBvbmx5KSAqL1xudmFyIF9fdnVlX21vZHVsZV9pZGVudGlmaWVyX18gPSBudWxsXG52YXIgQ29tcG9uZW50ID0gbm9ybWFsaXplQ29tcG9uZW50KFxuICBfX3Z1ZV9zY3JpcHRfXyxcbiAgX192dWVfdGVtcGxhdGVfXyxcbiAgX192dWVfdGVtcGxhdGVfZnVuY3Rpb25hbF9fLFxuICBfX3Z1ZV9zdHlsZXNfXyxcbiAgX192dWVfc2NvcGVJZF9fLFxuICBfX3Z1ZV9tb2R1bGVfaWRlbnRpZmllcl9fXG4pXG5Db21wb25lbnQub3B0aW9ucy5fX2ZpbGUgPSBcInJlc291cmNlc1xcXFxhc3NldHNcXFxcanNcXFxcY29tcG9uZW50c1xcXFx2aWV3c1xcXFxOb3RGb3VuZC52dWVcIlxuXG4vKiBob3QgcmVsb2FkICovXG5pZiAobW9kdWxlLmhvdCkgeyhmdW5jdGlvbiAoKSB7XG4gIHZhciBob3RBUEkgPSByZXF1aXJlKFwidnVlLWhvdC1yZWxvYWQtYXBpXCIpXG4gIGhvdEFQSS5pbnN0YWxsKHJlcXVpcmUoXCJ2dWVcIiksIGZhbHNlKVxuICBpZiAoIWhvdEFQSS5jb21wYXRpYmxlKSByZXR1cm5cbiAgbW9kdWxlLmhvdC5hY2NlcHQoKVxuICBpZiAoIW1vZHVsZS5ob3QuZGF0YSkge1xuICAgIGhvdEFQSS5jcmVhdGVSZWNvcmQoXCJkYXRhLXYtZDAwMzlhNThcIiwgQ29tcG9uZW50Lm9wdGlvbnMpXG4gIH0gZWxzZSB7XG4gICAgaG90QVBJLnJlbG9hZChcImRhdGEtdi1kMDAzOWE1OFwiLCBDb21wb25lbnQub3B0aW9ucylcbiAgfVxuICBtb2R1bGUuaG90LmRpc3Bvc2UoZnVuY3Rpb24gKGRhdGEpIHtcbiAgICBkaXNwb3NlZCA9IHRydWVcbiAgfSlcbn0pKCl9XG5cbm1vZHVsZS5leHBvcnRzID0gQ29tcG9uZW50LmV4cG9ydHNcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9jb21wb25lbnRzL3ZpZXdzL05vdEZvdW5kLnZ1ZVxuLy8gbW9kdWxlIGlkID0gNDRcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLy8gc3R5bGUtbG9hZGVyOiBBZGRzIHNvbWUgY3NzIHRvIHRoZSBET00gYnkgYWRkaW5nIGEgPHN0eWxlPiB0YWdcblxuLy8gbG9hZCB0aGUgc3R5bGVzXG52YXIgY29udGVudCA9IHJlcXVpcmUoXCIhIS4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2luZGV4LmpzP3NvdXJjZU1hcCEuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvc3R5bGUtY29tcGlsZXIvaW5kZXguanM/e1xcXCJ2dWVcXFwiOnRydWUsXFxcImlkXFxcIjpcXFwiZGF0YS12LWQwMDM5YTU4XFxcIixcXFwic2NvcGVkXFxcIjpmYWxzZSxcXFwiaGFzSW5saW5lQ29uZmlnXFxcIjp0cnVlfSEuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvc2VsZWN0b3IuanM/dHlwZT1zdHlsZXMmaW5kZXg9MCEuL05vdEZvdW5kLnZ1ZVwiKTtcbmlmKHR5cGVvZiBjb250ZW50ID09PSAnc3RyaW5nJykgY29udGVudCA9IFtbbW9kdWxlLmlkLCBjb250ZW50LCAnJ11dO1xuaWYoY29udGVudC5sb2NhbHMpIG1vZHVsZS5leHBvcnRzID0gY29udGVudC5sb2NhbHM7XG4vLyBhZGQgdGhlIHN0eWxlcyB0byB0aGUgRE9NXG52YXIgdXBkYXRlID0gcmVxdWlyZShcIiEuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvdnVlLXN0eWxlLWxvYWRlci9saWIvYWRkU3R5bGVzQ2xpZW50LmpzXCIpKFwiNjRlZTQyYjZcIiwgY29udGVudCwgZmFsc2UsIHt9KTtcbi8vIEhvdCBNb2R1bGUgUmVwbGFjZW1lbnRcbmlmKG1vZHVsZS5ob3QpIHtcbiAvLyBXaGVuIHRoZSBzdHlsZXMgY2hhbmdlLCB1cGRhdGUgdGhlIDxzdHlsZT4gdGFnc1xuIGlmKCFjb250ZW50LmxvY2Fscykge1xuICAgbW9kdWxlLmhvdC5hY2NlcHQoXCIhIS4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2luZGV4LmpzP3NvdXJjZU1hcCEuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvc3R5bGUtY29tcGlsZXIvaW5kZXguanM/e1xcXCJ2dWVcXFwiOnRydWUsXFxcImlkXFxcIjpcXFwiZGF0YS12LWQwMDM5YTU4XFxcIixcXFwic2NvcGVkXFxcIjpmYWxzZSxcXFwiaGFzSW5saW5lQ29uZmlnXFxcIjp0cnVlfSEuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvc2VsZWN0b3IuanM/dHlwZT1zdHlsZXMmaW5kZXg9MCEuL05vdEZvdW5kLnZ1ZVwiLCBmdW5jdGlvbigpIHtcbiAgICAgdmFyIG5ld0NvbnRlbnQgPSByZXF1aXJlKFwiISEuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9pbmRleC5qcz9zb3VyY2VNYXAhLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL3N0eWxlLWNvbXBpbGVyL2luZGV4LmpzP3tcXFwidnVlXFxcIjp0cnVlLFxcXCJpZFxcXCI6XFxcImRhdGEtdi1kMDAzOWE1OFxcXCIsXFxcInNjb3BlZFxcXCI6ZmFsc2UsXFxcImhhc0lubGluZUNvbmZpZ1xcXCI6dHJ1ZX0hLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL3NlbGVjdG9yLmpzP3R5cGU9c3R5bGVzJmluZGV4PTAhLi9Ob3RGb3VuZC52dWVcIik7XG4gICAgIGlmKHR5cGVvZiBuZXdDb250ZW50ID09PSAnc3RyaW5nJykgbmV3Q29udGVudCA9IFtbbW9kdWxlLmlkLCBuZXdDb250ZW50LCAnJ11dO1xuICAgICB1cGRhdGUobmV3Q29udGVudCk7XG4gICB9KTtcbiB9XG4gLy8gV2hlbiB0aGUgbW9kdWxlIGlzIGRpc3Bvc2VkLCByZW1vdmUgdGhlIDxzdHlsZT4gdGFnc1xuIG1vZHVsZS5ob3QuZGlzcG9zZShmdW5jdGlvbigpIHsgdXBkYXRlKCk7IH0pO1xufVxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vbm9kZV9tb2R1bGVzL3Z1ZS1zdHlsZS1sb2FkZXIhLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlcj9zb3VyY2VNYXAhLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvc3R5bGUtY29tcGlsZXI/e1widnVlXCI6dHJ1ZSxcImlkXCI6XCJkYXRhLXYtZDAwMzlhNThcIixcInNjb3BlZFwiOmZhbHNlLFwiaGFzSW5saW5lQ29uZmlnXCI6dHJ1ZX0hLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvc2VsZWN0b3IuanM/dHlwZT1zdHlsZXMmaW5kZXg9MCEuL3Jlc291cmNlcy9hc3NldHMvanMvY29tcG9uZW50cy92aWV3cy9Ob3RGb3VuZC52dWVcbi8vIG1vZHVsZSBpZCA9IDQ1XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsImV4cG9ydHMgPSBtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9saWIvY3NzLWJhc2UuanNcIikodHJ1ZSk7XG4vLyBpbXBvcnRzXG5cblxuLy8gbW9kdWxlXG5leHBvcnRzLnB1c2goW21vZHVsZS5pZCwgXCJcXG4jbm90LWZvdW5kIHtcXG4gICAgbWFyZ2luLXRvcDogMTAlO1xcbn1cXG5cIiwgXCJcIiwge1widmVyc2lvblwiOjMsXCJzb3VyY2VzXCI6W1wiRDovbGFyYXZlbC93d3cvcmVzb3VyY2VzL2Fzc2V0cy9qcy9jb21wb25lbnRzL3ZpZXdzL3Jlc291cmNlcy9hc3NldHMvanMvY29tcG9uZW50cy92aWV3cy9Ob3RGb3VuZC52dWVcIl0sXCJuYW1lc1wiOltdLFwibWFwcGluZ3NcIjpcIjtBQTRCQTtJQUNBLGdCQUFBO0NBQ0FcIixcImZpbGVcIjpcIk5vdEZvdW5kLnZ1ZVwiLFwic291cmNlc0NvbnRlbnRcIjpbXCI8dGVtcGxhdGU+XFxyXFxuICAgIDxzZWN0aW9uIGNsYXNzPVxcXCJjb250YWluZXIgbWFyZ2luLXRvcC0xIGNvbC03XFxcIiBpZD1cXFwibm90LWZvdW5kXFxcIj5cXHJcXG4gICAgICAgIDxkaXYgY2xhc3M9XFxcIm5vLWNvbnRlbnQtd3JhcHBlciB1c2VyLXNlbGVjdFxcXCI+XFxyXFxuICAgICAgICAgICAgPG1hcC1pY29uIHdpZHRoPVxcXCIyNjBcXFwiIGhlaWdodD1cXFwiMjYwXFxcIj48L21hcC1pY29uPlxcclxcbiAgICAgICAgICAgIDxwIHYtdGV4dD1cXFwibWVzc2FnZVxcXCI+PC9wPlxcclxcbiAgICAgICAgPC9kaXY+XFxyXFxuICAgIDwvc2VjdGlvbj5cXHJcXG48L3RlbXBsYXRlPlxcclxcblxcclxcblxcclxcbjxzY3JpcHQ+XFxyXFxuICAgIGltcG9ydCBNYXBJY29uIGZyb20gJy4vSWNvbnMvTWFwSWNvbi52dWUnO1xcclxcblxcclxcbiAgICBleHBvcnQgZGVmYXVsdCB7XFxyXFxuICAgICAgICBjb21wb25lbnRzOiB7XFxyXFxuICAgICAgICAgICAgTWFwSWNvblxcclxcbiAgICAgICAgfSxcXHJcXG5cXHJcXG4gICAgICAgIGRhdGEoKSB7XFxyXFxuICAgICAgICAgICAgcmV0dXJuIHtcXHJcXG4gICAgICAgICAgICAgICAgbWVzc2FnZTpcXHJcXG4gICAgICAgICAgICAgICAgICAgIFxcXCJJIGhhdGUgdG8gYmUgdGhlIG9uZSBicmVha2luZyBpdCB0byB5b3UsIGJ1dCB5b3UndmUgYmVlbiBnaXZlbiBhIHdyb25nIGFkZHJlc3MhXFxcIlxcclxcbiAgICAgICAgICAgIH07XFxyXFxuICAgICAgICB9XFxyXFxuICAgIH07XFxyXFxuPC9zY3JpcHQ+XFxyXFxuXFxyXFxuPHN0eWxlPlxcclxcbiAgICAjbm90LWZvdW5kIHtcXHJcXG4gICAgICAgIG1hcmdpbi10b3A6IDEwJTtcXHJcXG4gICAgfVxcclxcbjwvc3R5bGU+XFxyXFxuXCJdLFwic291cmNlUm9vdFwiOlwiXCJ9XSk7XG5cbi8vIGV4cG9ydHNcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXI/c291cmNlTWFwIS4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL3N0eWxlLWNvbXBpbGVyP3tcInZ1ZVwiOnRydWUsXCJpZFwiOlwiZGF0YS12LWQwMDM5YTU4XCIsXCJzY29wZWRcIjpmYWxzZSxcImhhc0lubGluZUNvbmZpZ1wiOnRydWV9IS4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL3NlbGVjdG9yLmpzP3R5cGU9c3R5bGVzJmluZGV4PTAhLi9yZXNvdXJjZXMvYXNzZXRzL2pzL2NvbXBvbmVudHMvdmlld3MvTm90Rm91bmQudnVlXG4vLyBtb2R1bGUgaWQgPSA0NlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvKipcbiAqIFRyYW5zbGF0ZXMgdGhlIGxpc3QgZm9ybWF0IHByb2R1Y2VkIGJ5IGNzcy1sb2FkZXIgaW50byBzb21ldGhpbmdcbiAqIGVhc2llciB0byBtYW5pcHVsYXRlLlxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGxpc3RUb1N0eWxlcyAocGFyZW50SWQsIGxpc3QpIHtcbiAgdmFyIHN0eWxlcyA9IFtdXG4gIHZhciBuZXdTdHlsZXMgPSB7fVxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgaXRlbSA9IGxpc3RbaV1cbiAgICB2YXIgaWQgPSBpdGVtWzBdXG4gICAgdmFyIGNzcyA9IGl0ZW1bMV1cbiAgICB2YXIgbWVkaWEgPSBpdGVtWzJdXG4gICAgdmFyIHNvdXJjZU1hcCA9IGl0ZW1bM11cbiAgICB2YXIgcGFydCA9IHtcbiAgICAgIGlkOiBwYXJlbnRJZCArICc6JyArIGksXG4gICAgICBjc3M6IGNzcyxcbiAgICAgIG1lZGlhOiBtZWRpYSxcbiAgICAgIHNvdXJjZU1hcDogc291cmNlTWFwXG4gICAgfVxuICAgIGlmICghbmV3U3R5bGVzW2lkXSkge1xuICAgICAgc3R5bGVzLnB1c2gobmV3U3R5bGVzW2lkXSA9IHsgaWQ6IGlkLCBwYXJ0czogW3BhcnRdIH0pXG4gICAgfSBlbHNlIHtcbiAgICAgIG5ld1N0eWxlc1tpZF0ucGFydHMucHVzaChwYXJ0KVxuICAgIH1cbiAgfVxuICByZXR1cm4gc3R5bGVzXG59XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL25vZGVfbW9kdWxlcy92dWUtc3R5bGUtbG9hZGVyL2xpYi9saXN0VG9TdHlsZXMuanNcbi8vIG1vZHVsZSBpZCA9IDQ3XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIjx0ZW1wbGF0ZT5cclxuICAgIDxzZWN0aW9uIGNsYXNzPVwiY29udGFpbmVyIG1hcmdpbi10b3AtMSBjb2wtN1wiIGlkPVwibm90LWZvdW5kXCI+XHJcbiAgICAgICAgPGRpdiBjbGFzcz1cIm5vLWNvbnRlbnQtd3JhcHBlciB1c2VyLXNlbGVjdFwiPlxyXG4gICAgICAgICAgICA8bWFwLWljb24gd2lkdGg9XCIyNjBcIiBoZWlnaHQ9XCIyNjBcIj48L21hcC1pY29uPlxyXG4gICAgICAgICAgICA8cCB2LXRleHQ9XCJtZXNzYWdlXCI+PC9wPlxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgPC9zZWN0aW9uPlxyXG48L3RlbXBsYXRlPlxyXG5cclxuXHJcbjxzY3JpcHQ+XHJcbiAgICBpbXBvcnQgTWFwSWNvbiBmcm9tICcuL0ljb25zL01hcEljb24udnVlJztcclxuXHJcbiAgICBleHBvcnQgZGVmYXVsdCB7XHJcbiAgICAgICAgY29tcG9uZW50czoge1xyXG4gICAgICAgICAgICBNYXBJY29uXHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgZGF0YSgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIG1lc3NhZ2U6XHJcbiAgICAgICAgICAgICAgICAgICAgXCJJIGhhdGUgdG8gYmUgdGhlIG9uZSBicmVha2luZyBpdCB0byB5b3UsIGJ1dCB5b3UndmUgYmVlbiBnaXZlbiBhIHdyb25nIGFkZHJlc3MhXCJcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG48L3NjcmlwdD5cclxuXHJcbjxzdHlsZT5cclxuICAgICNub3QtZm91bmQge1xyXG4gICAgICAgIG1hcmdpbi10b3A6IDEwJTtcclxuICAgIH1cclxuPC9zdHlsZT5cclxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIHJlc291cmNlcy9hc3NldHMvanMvY29tcG9uZW50cy92aWV3cy9Ob3RGb3VuZC52dWUiLCJ2YXIgZGlzcG9zZWQgPSBmYWxzZVxuZnVuY3Rpb24gaW5qZWN0U3R5bGUgKHNzckNvbnRleHQpIHtcbiAgaWYgKGRpc3Bvc2VkKSByZXR1cm5cbiAgcmVxdWlyZShcIiEhdnVlLXN0eWxlLWxvYWRlciFjc3MtbG9hZGVyP3NvdXJjZU1hcCEuLi8uLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvc3R5bGUtY29tcGlsZXIvaW5kZXg/e1xcXCJ2dWVcXFwiOnRydWUsXFxcImlkXFxcIjpcXFwiZGF0YS12LTE3N2I4YWZlXFxcIixcXFwic2NvcGVkXFxcIjpmYWxzZSxcXFwiaGFzSW5saW5lQ29uZmlnXFxcIjp0cnVlfSEuLi8uLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvc2VsZWN0b3I/dHlwZT1zdHlsZXMmaW5kZXg9MCEuL01hcEljb24udnVlXCIpXG59XG52YXIgbm9ybWFsaXplQ29tcG9uZW50ID0gcmVxdWlyZShcIiEuLi8uLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvY29tcG9uZW50LW5vcm1hbGl6ZXJcIilcbi8qIHNjcmlwdCAqL1xudmFyIF9fdnVlX3NjcmlwdF9fID0gcmVxdWlyZShcIiEhYmFiZWwtbG9hZGVyP3tcXFwiY2FjaGVEaXJlY3RvcnlcXFwiOnRydWUsXFxcInByZXNldHNcXFwiOltbXFxcImVudlxcXCIse1xcXCJtb2R1bGVzXFxcIjpmYWxzZSxcXFwidGFyZ2V0c1xcXCI6e1xcXCJicm93c2Vyc1xcXCI6W1xcXCI+IDIlXFxcIl0sXFxcInVnbGlmeVxcXCI6dHJ1ZX19XV0sXFxcInBsdWdpbnNcXFwiOltcXFwidHJhbnNmb3JtLW9iamVjdC1yZXN0LXNwcmVhZFxcXCIsW1xcXCJ0cmFuc2Zvcm0tcnVudGltZVxcXCIse1xcXCJwb2x5ZmlsbFxcXCI6ZmFsc2UsXFxcImhlbHBlcnNcXFwiOmZhbHNlfV1dfSEuLi8uLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvc2VsZWN0b3I/dHlwZT1zY3JpcHQmaW5kZXg9MCEuL01hcEljb24udnVlXCIpXG4vKiB0ZW1wbGF0ZSAqL1xudmFyIF9fdnVlX3RlbXBsYXRlX18gPSByZXF1aXJlKFwiISEuLi8uLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvdGVtcGxhdGUtY29tcGlsZXIvaW5kZXg/e1xcXCJpZFxcXCI6XFxcImRhdGEtdi0xNzdiOGFmZVxcXCIsXFxcImhhc1Njb3BlZFxcXCI6ZmFsc2UsXFxcImJ1YmxlXFxcIjp7XFxcInRyYW5zZm9ybXNcXFwiOnt9fX0hLi4vLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL3NlbGVjdG9yP3R5cGU9dGVtcGxhdGUmaW5kZXg9MCEuL01hcEljb24udnVlXCIpXG4vKiB0ZW1wbGF0ZSBmdW5jdGlvbmFsICovXG52YXIgX192dWVfdGVtcGxhdGVfZnVuY3Rpb25hbF9fID0gZmFsc2Vcbi8qIHN0eWxlcyAqL1xudmFyIF9fdnVlX3N0eWxlc19fID0gaW5qZWN0U3R5bGVcbi8qIHNjb3BlSWQgKi9cbnZhciBfX3Z1ZV9zY29wZUlkX18gPSBudWxsXG4vKiBtb2R1bGVJZGVudGlmaWVyIChzZXJ2ZXIgb25seSkgKi9cbnZhciBfX3Z1ZV9tb2R1bGVfaWRlbnRpZmllcl9fID0gbnVsbFxudmFyIENvbXBvbmVudCA9IG5vcm1hbGl6ZUNvbXBvbmVudChcbiAgX192dWVfc2NyaXB0X18sXG4gIF9fdnVlX3RlbXBsYXRlX18sXG4gIF9fdnVlX3RlbXBsYXRlX2Z1bmN0aW9uYWxfXyxcbiAgX192dWVfc3R5bGVzX18sXG4gIF9fdnVlX3Njb3BlSWRfXyxcbiAgX192dWVfbW9kdWxlX2lkZW50aWZpZXJfX1xuKVxuQ29tcG9uZW50Lm9wdGlvbnMuX19maWxlID0gXCJyZXNvdXJjZXNcXFxcYXNzZXRzXFxcXGpzXFxcXGNvbXBvbmVudHNcXFxcdmlld3NcXFxcSWNvbnNcXFxcTWFwSWNvbi52dWVcIlxuXG4vKiBob3QgcmVsb2FkICovXG5pZiAobW9kdWxlLmhvdCkgeyhmdW5jdGlvbiAoKSB7XG4gIHZhciBob3RBUEkgPSByZXF1aXJlKFwidnVlLWhvdC1yZWxvYWQtYXBpXCIpXG4gIGhvdEFQSS5pbnN0YWxsKHJlcXVpcmUoXCJ2dWVcIiksIGZhbHNlKVxuICBpZiAoIWhvdEFQSS5jb21wYXRpYmxlKSByZXR1cm5cbiAgbW9kdWxlLmhvdC5hY2NlcHQoKVxuICBpZiAoIW1vZHVsZS5ob3QuZGF0YSkge1xuICAgIGhvdEFQSS5jcmVhdGVSZWNvcmQoXCJkYXRhLXYtMTc3YjhhZmVcIiwgQ29tcG9uZW50Lm9wdGlvbnMpXG4gIH0gZWxzZSB7XG4gICAgaG90QVBJLnJlbG9hZChcImRhdGEtdi0xNzdiOGFmZVwiLCBDb21wb25lbnQub3B0aW9ucylcbiAgfVxuICBtb2R1bGUuaG90LmRpc3Bvc2UoZnVuY3Rpb24gKGRhdGEpIHtcbiAgICBkaXNwb3NlZCA9IHRydWVcbiAgfSlcbn0pKCl9XG5cbm1vZHVsZS5leHBvcnRzID0gQ29tcG9uZW50LmV4cG9ydHNcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9jb21wb25lbnRzL3ZpZXdzL0ljb25zL01hcEljb24udnVlXG4vLyBtb2R1bGUgaWQgPSA0OVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvLyBzdHlsZS1sb2FkZXI6IEFkZHMgc29tZSBjc3MgdG8gdGhlIERPTSBieSBhZGRpbmcgYSA8c3R5bGU+IHRhZ1xuXG4vLyBsb2FkIHRoZSBzdHlsZXNcbnZhciBjb250ZW50ID0gcmVxdWlyZShcIiEhLi4vLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvaW5kZXguanM/c291cmNlTWFwIS4uLy4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2xpYi9zdHlsZS1jb21waWxlci9pbmRleC5qcz97XFxcInZ1ZVxcXCI6dHJ1ZSxcXFwiaWRcXFwiOlxcXCJkYXRhLXYtMTc3YjhhZmVcXFwiLFxcXCJzY29wZWRcXFwiOmZhbHNlLFxcXCJoYXNJbmxpbmVDb25maWdcXFwiOnRydWV9IS4uLy4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2xpYi9zZWxlY3Rvci5qcz90eXBlPXN0eWxlcyZpbmRleD0wIS4vTWFwSWNvbi52dWVcIik7XG5pZih0eXBlb2YgY29udGVudCA9PT0gJ3N0cmluZycpIGNvbnRlbnQgPSBbW21vZHVsZS5pZCwgY29udGVudCwgJyddXTtcbmlmKGNvbnRlbnQubG9jYWxzKSBtb2R1bGUuZXhwb3J0cyA9IGNvbnRlbnQubG9jYWxzO1xuLy8gYWRkIHRoZSBzdHlsZXMgdG8gdGhlIERPTVxudmFyIHVwZGF0ZSA9IHJlcXVpcmUoXCIhLi4vLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3Z1ZS1zdHlsZS1sb2FkZXIvbGliL2FkZFN0eWxlc0NsaWVudC5qc1wiKShcIjM2MTZkOWM0XCIsIGNvbnRlbnQsIGZhbHNlLCB7fSk7XG4vLyBIb3QgTW9kdWxlIFJlcGxhY2VtZW50XG5pZihtb2R1bGUuaG90KSB7XG4gLy8gV2hlbiB0aGUgc3R5bGVzIGNoYW5nZSwgdXBkYXRlIHRoZSA8c3R5bGU+IHRhZ3NcbiBpZighY29udGVudC5sb2NhbHMpIHtcbiAgIG1vZHVsZS5ob3QuYWNjZXB0KFwiISEuLi8uLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9pbmRleC5qcz9zb3VyY2VNYXAhLi4vLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL3N0eWxlLWNvbXBpbGVyL2luZGV4LmpzP3tcXFwidnVlXFxcIjp0cnVlLFxcXCJpZFxcXCI6XFxcImRhdGEtdi0xNzdiOGFmZVxcXCIsXFxcInNjb3BlZFxcXCI6ZmFsc2UsXFxcImhhc0lubGluZUNvbmZpZ1xcXCI6dHJ1ZX0hLi4vLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL3NlbGVjdG9yLmpzP3R5cGU9c3R5bGVzJmluZGV4PTAhLi9NYXBJY29uLnZ1ZVwiLCBmdW5jdGlvbigpIHtcbiAgICAgdmFyIG5ld0NvbnRlbnQgPSByZXF1aXJlKFwiISEuLi8uLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9pbmRleC5qcz9zb3VyY2VNYXAhLi4vLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL3N0eWxlLWNvbXBpbGVyL2luZGV4LmpzP3tcXFwidnVlXFxcIjp0cnVlLFxcXCJpZFxcXCI6XFxcImRhdGEtdi0xNzdiOGFmZVxcXCIsXFxcInNjb3BlZFxcXCI6ZmFsc2UsXFxcImhhc0lubGluZUNvbmZpZ1xcXCI6dHJ1ZX0hLi4vLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL3NlbGVjdG9yLmpzP3R5cGU9c3R5bGVzJmluZGV4PTAhLi9NYXBJY29uLnZ1ZVwiKTtcbiAgICAgaWYodHlwZW9mIG5ld0NvbnRlbnQgPT09ICdzdHJpbmcnKSBuZXdDb250ZW50ID0gW1ttb2R1bGUuaWQsIG5ld0NvbnRlbnQsICcnXV07XG4gICAgIHVwZGF0ZShuZXdDb250ZW50KTtcbiAgIH0pO1xuIH1cbiAvLyBXaGVuIHRoZSBtb2R1bGUgaXMgZGlzcG9zZWQsIHJlbW92ZSB0aGUgPHN0eWxlPiB0YWdzXG4gbW9kdWxlLmhvdC5kaXNwb3NlKGZ1bmN0aW9uKCkgeyB1cGRhdGUoKTsgfSk7XG59XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9ub2RlX21vZHVsZXMvdnVlLXN0eWxlLWxvYWRlciEuL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyP3NvdXJjZU1hcCEuL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2xpYi9zdHlsZS1jb21waWxlcj97XCJ2dWVcIjp0cnVlLFwiaWRcIjpcImRhdGEtdi0xNzdiOGFmZVwiLFwic2NvcGVkXCI6ZmFsc2UsXCJoYXNJbmxpbmVDb25maWdcIjp0cnVlfSEuL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2xpYi9zZWxlY3Rvci5qcz90eXBlPXN0eWxlcyZpbmRleD0wIS4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9jb21wb25lbnRzL3ZpZXdzL0ljb25zL01hcEljb24udnVlXG4vLyBtb2R1bGUgaWQgPSA1MFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJleHBvcnRzID0gbW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiLi4vLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvbGliL2Nzcy1iYXNlLmpzXCIpKHRydWUpO1xuLy8gaW1wb3J0c1xuXG5cbi8vIG1vZHVsZVxuZXhwb3J0cy5wdXNoKFttb2R1bGUuaWQsIFwiXFxuLmhlcm9pY29uLW1hcCAuaGVyb2ljb24tb3V0bGluZSB7XFxuICAgIGZpbGw6ICMzMDMwMzQ7XFxufVxcbi5oZXJvaWNvbi1tYXAgLmhlcm9pY29uLWNvbXBvbmVudC1maWxsIHtcXG4gICAgZmlsbDogI2ZmZjtcXG59XFxuLmhlcm9pY29uLW1hcCAuaGVyb2ljb24tY29tcG9uZW50LWFjY2VudCB7XFxuICAgIGZpbGw6ICM5MTk0OTU7XFxufVxcbi5oZXJvaWNvbi1tYXAgLmhlcm9pY29uLXNoYWRvd3Mge1xcbiAgICBmaWxsOiAjMzAzMDM0O1xcbiAgICBvcGFjaXR5OiAwLjQ7XFxufVxcblwiLCBcIlwiLCB7XCJ2ZXJzaW9uXCI6MyxcInNvdXJjZXNcIjpbXCJEOi9sYXJhdmVsL3d3dy9yZXNvdXJjZXMvYXNzZXRzL2pzL2NvbXBvbmVudHMvdmlld3MvSWNvbnMvcmVzb3VyY2VzL2Fzc2V0cy9qcy9jb21wb25lbnRzL3ZpZXdzL0ljb25zL01hcEljb24udnVlXCJdLFwibmFtZXNcIjpbXSxcIm1hcHBpbmdzXCI6XCI7QUFXQTtJQUNBLGNBQUE7Q0FDQTtBQUNBO0lBQ0EsV0FBQTtDQUNBO0FBQ0E7SUFDQSxjQUFBO0NBQ0E7QUFDQTtJQUNBLGNBQUE7SUFDQSxhQUFBO0NBQ0FcIixcImZpbGVcIjpcIk1hcEljb24udnVlXCIsXCJzb3VyY2VzQ29udGVudFwiOltcIjx0ZW1wbGF0ZT5cXHJcXG4gICAgPHN2ZyB4bWxucz1cXFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcXFwiIDp3aWR0aD1cXFwidGhpcy53aWR0aCArICdweCdcXFwiIDpoZWlnaHQ9XFxcInRoaXMuaGVpZ2h0ICsgJ3B4J1xcXCIgdmlld0JveD1cXFwiMCAwIDYwIDYwXFxcIiBjbGFzcz1cXFwiaGVyb2ljb24tbWFwIGhlcm9pY29uIGhlcm9pY29uLXNtXFxcIj5cXHJcXG4gICAgICAgIDxwYXRoIGNsYXNzPVxcXCJoZXJvaWNvbi1tYXAtb3V0ZXIgaGVyb2ljb24tY29tcG9uZW50LWFjY2VudCBoZXJvaWNvbi1jb21wb25lbnQtZmlsbFxcXCIgZD1cXFwiTTIwLjA1IDEzLjAyTDE1IDExIDAgMTd2NDBsMTUtNiAxNSA2IDE1LTYgMTUgNlYxN2wtMTUtNi01LjA1IDIuMDJjLjAzLjMyLjA1LjY1LjA1Ljk4IDAgNS41Mi0xMCAyMC0xMCAyMFMyMCAxOS41MiAyMCAxNGMwLS4zMy4wMi0uNjYuMDUtLjk4elxcXCI+PC9wYXRoPlxcclxcbiAgICAgICAgPHBhdGggY2xhc3M9XFxcImhlcm9pY29uLW1hcC1pbm5lciBoZXJvaWNvbi1jb21wb25lbnQtZmlsbFxcXCIgZD1cXFwiTTIxLjE0IDE4LjQ2TDE1IDE2IDQgMjB2MzBsMTEtNCAxNSA2IDE1LTYgMTEgNFYyMGwtMTEtNC02LjE0IDIuNDZDMzYuMjMgMjQuOTcgMzAgMzQgMzAgMzRzLTYuMjMtOS4wMy04Ljg2LTE1LjU0elxcXCI+PC9wYXRoPlxcclxcbiAgICAgICAgPHBhdGggY2xhc3M9XFxcImhlcm9pY29uLW1hcC1waW4gaGVyb2ljb24tY29tcG9uZW50LWFjY2VudCBoZXJvaWNvbi1jb21wb25lbnQtZmlsbFxcXCIgZD1cXFwiTTMwIDM0UzIwIDE5LjUyIDIwIDE0YTEwIDEwIDAgMSAxIDIwIDBjMCA1LjUyLTEwIDIwLTEwIDIwem0wLTE4YTMgMyAwIDEgMCAwLTYgMyAzIDAgMCAwIDAgNnpcXFwiPjwvcGF0aD5cXHJcXG4gICAgICAgIDxwYXRoIGNsYXNzPVxcXCJoZXJvaWNvbi1zaGFkb3dzXFxcIiBkPVxcXCJNMzAgMzdTMjAgMjIuNTIgMjAgMTdjMC0uNTguMDUtMS4xNS4xNC0xLjdDMjEuMzcgMjEuNSAzMCAzNCAzMCAzNGwuMjctLjQuNzMtMS4wOXYzTDMwIDM3djIwbDE1LTZWMTFsLTUuMDUgMi4wMmMuMDMuMzIuMDUuNjUuMDUuOTggMCA0Ljk4LTguMTQgMTcuMjUtOS43MyAxOS42TDMwIDM3ek0wIDE3bDE1LTZ2NDBMMCA1N1YxN3pcXFwiPjwvcGF0aD5cXHJcXG4gICAgICAgIDxwYXRoIGNsYXNzPVxcXCJoZXJvaWNvbi1vdXRsaW5lXFxcIiBkPVxcXCJNMjAuMDUgMTMuMDJhMTAgMTAgMCAwIDEgMTkuOSAwTDQ1IDExbDE1IDZ2NDBsLTE1LTYtMTUgNi0xNS02LTE1IDZWMTdsMTUtNiA1LjA1IDIuMDJ6bTEuMjggNS45TDE2IDE2Ljc5djEzLjUzbDEzIDUuMnYtM2E2OS45OSA2OS45OSAwIDAgMS0uMi0uMzFjLTEuODgtMi44Ny01LjUxLTguNjMtNy40Ny0xMy4zem0tLjUtMS4yNmMtLjMyLS44OS0uNTctMS43Mi0uNy0yLjQ2TDE2IDEzLjU1djIuMTZsNC44MyAxLjkzdi4wMnpNMzkuOSAxNS4xYy0uMTMuNzUtLjM4IDEuNjEtLjcyIDIuNTNMNDQgMTUuN3YtMi4xNmwtNC4xMyAxLjY1LjAyLS4wOXptLTEuMiAzLjc1Yy0xLjk1IDQuNjctNS42IDEwLjQ3LTcuNDkgMTMuMzVsLS4yLjN2My4wMWwxMy01LjJWMTYuOGwtNS4zMyAyLjEzLjAyLS4wNnptLTUuNDIgNi4yYTY2LjM2IDY2LjM2IDAgMCAwIDMuMzQtNi40QzM3LjU0IDE2LjUyIDM4IDE0LjkyIDM4IDE0YTggOCAwIDEgMC0xNiAwYzAgLjkzLjQ2IDIuNTMgMS40IDQuNjUuOSAyLjA2IDIuMSA0LjMgMy4zMyA2LjQyIDEuMTggMi4wMyAyLjM2IDMuOSAzLjI3IDUuMzIuOTEtMS40MiAyLjA5LTMuMjkgMy4yNy01LjMyek00NiAxMy41N3YyLjE1bDEwIDR2MTQuNjFsMiAuOFYxOC4zNWwtMTItNC44ek0xNCAxNS43di0yLjE2bC0xMiA0Ljh2MTYuNzdsMi0uOFYxOS43MWwxMC00ek01IDMzLjkybDktMy42VjE2LjhsLTkgMy42djEzLjUzem0tMSAyLjU2bC0yIC44djE2Ljc3bDEyLTQuOHYtMi4xNmwtOSAzLjYtMSAuNFYzNi40OHpNMTQgNDZWMzIuNDhsLTkgMy42VjQ5LjZsOS0zLjZ6bTIgMS4wOHYyLjE2bDEzIDUuMnYtMi4xNmwtMTMtNS4yem0xMyA0LjEyVjM3LjY4bC0xMy01LjJWNDZsMTMgNS4yem0yIDEuMDh2Mi4xNmwxMy01LjJ2LTIuMTZsLTEzIDUuMnptMTMtNi4yOFYzMi40OGwtMTMgNS4yVjUxLjJsMTMtNS4yem0yIDEuMDh2Mi4xNmwxMiA0LjhWMzcuMjhsLTItLjh2MTQuNjFsLTEtLjQtOS0zLjZ6bTktMTEuMDFsLTktMy42VjQ2bDkgMy42VjM2LjA4em0wLTIuMTZWMjAuNGwtOS0zLjZ2MTMuNTNsOSAzLjZ6TTMwIDE3YTQgNCAwIDEgMSAwLTggNCA0IDAgMCAxIDAgOHptMi00YTIgMiAwIDEgMC00IDAgMiAyIDAgMCAwIDQgMHpcXFwiPjwvcGF0aD5cXHJcXG4gICAgPC9zdmc+XFxyXFxuPC90ZW1wbGF0ZT5cXHJcXG5cXHJcXG48c3R5bGU+XFxyXFxuICAgIC5oZXJvaWNvbi1tYXAgLmhlcm9pY29uLW91dGxpbmUge1xcclxcbiAgICAgICAgZmlsbDogIzMwMzAzNDtcXHJcXG4gICAgfVxcclxcbiAgICAuaGVyb2ljb24tbWFwIC5oZXJvaWNvbi1jb21wb25lbnQtZmlsbCB7XFxyXFxuICAgICAgICBmaWxsOiAjZmZmO1xcclxcbiAgICB9XFxyXFxuICAgIC5oZXJvaWNvbi1tYXAgLmhlcm9pY29uLWNvbXBvbmVudC1hY2NlbnQge1xcclxcbiAgICAgICAgZmlsbDogIzkxOTQ5NTtcXHJcXG4gICAgfVxcclxcbiAgICAuaGVyb2ljb24tbWFwIC5oZXJvaWNvbi1zaGFkb3dzIHtcXHJcXG4gICAgICAgIGZpbGw6ICMzMDMwMzQ7XFxyXFxuICAgICAgICBvcGFjaXR5OiAwLjQ7XFxyXFxuICAgIH1cXHJcXG48L3N0eWxlPlxcclxcblxcclxcbjxzY3JpcHQ+XFxyXFxuICAgIGV4cG9ydCBkZWZhdWx0IHtcXHJcXG4gICAgICAgIHByb3BzOiBbJ3dpZHRoJywgJ2hlaWdodCddXFxyXFxuICAgIH07XFxyXFxuPC9zY3JpcHQ+XFxyXFxuXCJdLFwic291cmNlUm9vdFwiOlwiXCJ9XSk7XG5cbi8vIGV4cG9ydHNcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXI/c291cmNlTWFwIS4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL3N0eWxlLWNvbXBpbGVyP3tcInZ1ZVwiOnRydWUsXCJpZFwiOlwiZGF0YS12LTE3N2I4YWZlXCIsXCJzY29wZWRcIjpmYWxzZSxcImhhc0lubGluZUNvbmZpZ1wiOnRydWV9IS4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL3NlbGVjdG9yLmpzP3R5cGU9c3R5bGVzJmluZGV4PTAhLi9yZXNvdXJjZXMvYXNzZXRzL2pzL2NvbXBvbmVudHMvdmlld3MvSWNvbnMvTWFwSWNvbi52dWVcbi8vIG1vZHVsZSBpZCA9IDUxXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIjx0ZW1wbGF0ZT5cclxuICAgIDxzdmcgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiIDp3aWR0aD1cInRoaXMud2lkdGggKyAncHgnXCIgOmhlaWdodD1cInRoaXMuaGVpZ2h0ICsgJ3B4J1wiIHZpZXdCb3g9XCIwIDAgNjAgNjBcIiBjbGFzcz1cImhlcm9pY29uLW1hcCBoZXJvaWNvbiBoZXJvaWNvbi1zbVwiPlxyXG4gICAgICAgIDxwYXRoIGNsYXNzPVwiaGVyb2ljb24tbWFwLW91dGVyIGhlcm9pY29uLWNvbXBvbmVudC1hY2NlbnQgaGVyb2ljb24tY29tcG9uZW50LWZpbGxcIiBkPVwiTTIwLjA1IDEzLjAyTDE1IDExIDAgMTd2NDBsMTUtNiAxNSA2IDE1LTYgMTUgNlYxN2wtMTUtNi01LjA1IDIuMDJjLjAzLjMyLjA1LjY1LjA1Ljk4IDAgNS41Mi0xMCAyMC0xMCAyMFMyMCAxOS41MiAyMCAxNGMwLS4zMy4wMi0uNjYuMDUtLjk4elwiPjwvcGF0aD5cclxuICAgICAgICA8cGF0aCBjbGFzcz1cImhlcm9pY29uLW1hcC1pbm5lciBoZXJvaWNvbi1jb21wb25lbnQtZmlsbFwiIGQ9XCJNMjEuMTQgMTguNDZMMTUgMTYgNCAyMHYzMGwxMS00IDE1IDYgMTUtNiAxMSA0VjIwbC0xMS00LTYuMTQgMi40NkMzNi4yMyAyNC45NyAzMCAzNCAzMCAzNHMtNi4yMy05LjAzLTguODYtMTUuNTR6XCI+PC9wYXRoPlxyXG4gICAgICAgIDxwYXRoIGNsYXNzPVwiaGVyb2ljb24tbWFwLXBpbiBoZXJvaWNvbi1jb21wb25lbnQtYWNjZW50IGhlcm9pY29uLWNvbXBvbmVudC1maWxsXCIgZD1cIk0zMCAzNFMyMCAxOS41MiAyMCAxNGExMCAxMCAwIDEgMSAyMCAwYzAgNS41Mi0xMCAyMC0xMCAyMHptMC0xOGEzIDMgMCAxIDAgMC02IDMgMyAwIDAgMCAwIDZ6XCI+PC9wYXRoPlxyXG4gICAgICAgIDxwYXRoIGNsYXNzPVwiaGVyb2ljb24tc2hhZG93c1wiIGQ9XCJNMzAgMzdTMjAgMjIuNTIgMjAgMTdjMC0uNTguMDUtMS4xNS4xNC0xLjdDMjEuMzcgMjEuNSAzMCAzNCAzMCAzNGwuMjctLjQuNzMtMS4wOXYzTDMwIDM3djIwbDE1LTZWMTFsLTUuMDUgMi4wMmMuMDMuMzIuMDUuNjUuMDUuOTggMCA0Ljk4LTguMTQgMTcuMjUtOS43MyAxOS42TDMwIDM3ek0wIDE3bDE1LTZ2NDBMMCA1N1YxN3pcIj48L3BhdGg+XHJcbiAgICAgICAgPHBhdGggY2xhc3M9XCJoZXJvaWNvbi1vdXRsaW5lXCIgZD1cIk0yMC4wNSAxMy4wMmExMCAxMCAwIDAgMSAxOS45IDBMNDUgMTFsMTUgNnY0MGwtMTUtNi0xNSA2LTE1LTYtMTUgNlYxN2wxNS02IDUuMDUgMi4wMnptMS4yOCA1LjlMMTYgMTYuNzl2MTMuNTNsMTMgNS4ydi0zYTY5Ljk5IDY5Ljk5IDAgMCAxLS4yLS4zMWMtMS44OC0yLjg3LTUuNTEtOC42My03LjQ3LTEzLjN6bS0uNS0xLjI2Yy0uMzItLjg5LS41Ny0xLjcyLS43LTIuNDZMMTYgMTMuNTV2Mi4xNmw0LjgzIDEuOTN2LjAyek0zOS45IDE1LjFjLS4xMy43NS0uMzggMS42MS0uNzIgMi41M0w0NCAxNS43di0yLjE2bC00LjEzIDEuNjUuMDItLjA5em0tMS4yIDMuNzVjLTEuOTUgNC42Ny01LjYgMTAuNDctNy40OSAxMy4zNWwtLjIuM3YzLjAxbDEzLTUuMlYxNi44bC01LjMzIDIuMTMuMDItLjA2em0tNS40MiA2LjJhNjYuMzYgNjYuMzYgMCAwIDAgMy4zNC02LjRDMzcuNTQgMTYuNTIgMzggMTQuOTIgMzggMTRhOCA4IDAgMSAwLTE2IDBjMCAuOTMuNDYgMi41MyAxLjQgNC42NS45IDIuMDYgMi4xIDQuMyAzLjMzIDYuNDIgMS4xOCAyLjAzIDIuMzYgMy45IDMuMjcgNS4zMi45MS0xLjQyIDIuMDktMy4yOSAzLjI3LTUuMzJ6TTQ2IDEzLjU3djIuMTVsMTAgNHYxNC42MWwyIC44VjE4LjM1bC0xMi00Ljh6TTE0IDE1Ljd2LTIuMTZsLTEyIDQuOHYxNi43N2wyLS44VjE5LjcxbDEwLTR6TTUgMzMuOTJsOS0zLjZWMTYuOGwtOSAzLjZ2MTMuNTN6bS0xIDIuNTZsLTIgLjh2MTYuNzdsMTItNC44di0yLjE2bC05IDMuNi0xIC40VjM2LjQ4ek0xNCA0NlYzMi40OGwtOSAzLjZWNDkuNmw5LTMuNnptMiAxLjA4djIuMTZsMTMgNS4ydi0yLjE2bC0xMy01LjJ6bTEzIDQuMTJWMzcuNjhsLTEzLTUuMlY0NmwxMyA1LjJ6bTIgMS4wOHYyLjE2bDEzLTUuMnYtMi4xNmwtMTMgNS4yem0xMy02LjI4VjMyLjQ4bC0xMyA1LjJWNTEuMmwxMy01LjJ6bTIgMS4wOHYyLjE2bDEyIDQuOFYzNy4yOGwtMi0uOHYxNC42MWwtMS0uNC05LTMuNnptOS0xMS4wMWwtOS0zLjZWNDZsOSAzLjZWMzYuMDh6bTAtMi4xNlYyMC40bC05LTMuNnYxMy41M2w5IDMuNnpNMzAgMTdhNCA0IDAgMSAxIDAtOCA0IDQgMCAwIDEgMCA4em0yLTRhMiAyIDAgMSAwLTQgMCAyIDIgMCAwIDAgNCAwelwiPjwvcGF0aD5cclxuICAgIDwvc3ZnPlxyXG48L3RlbXBsYXRlPlxyXG5cclxuPHN0eWxlPlxyXG4gICAgLmhlcm9pY29uLW1hcCAuaGVyb2ljb24tb3V0bGluZSB7XHJcbiAgICAgICAgZmlsbDogIzMwMzAzNDtcclxuICAgIH1cclxuICAgIC5oZXJvaWNvbi1tYXAgLmhlcm9pY29uLWNvbXBvbmVudC1maWxsIHtcclxuICAgICAgICBmaWxsOiAjZmZmO1xyXG4gICAgfVxyXG4gICAgLmhlcm9pY29uLW1hcCAuaGVyb2ljb24tY29tcG9uZW50LWFjY2VudCB7XHJcbiAgICAgICAgZmlsbDogIzkxOTQ5NTtcclxuICAgIH1cclxuICAgIC5oZXJvaWNvbi1tYXAgLmhlcm9pY29uLXNoYWRvd3Mge1xyXG4gICAgICAgIGZpbGw6ICMzMDMwMzQ7XHJcbiAgICAgICAgb3BhY2l0eTogMC40O1xyXG4gICAgfVxyXG48L3N0eWxlPlxyXG5cclxuPHNjcmlwdD5cclxuICAgIGV4cG9ydCBkZWZhdWx0IHtcclxuICAgICAgICBwcm9wczogWyd3aWR0aCcsICdoZWlnaHQnXVxyXG4gICAgfTtcclxuPC9zY3JpcHQ+XHJcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyByZXNvdXJjZXMvYXNzZXRzL2pzL2NvbXBvbmVudHMvdmlld3MvSWNvbnMvTWFwSWNvbi52dWUiLCJ2YXIgcmVuZGVyID0gZnVuY3Rpb24oKSB7XG4gIHZhciBfdm0gPSB0aGlzXG4gIHZhciBfaCA9IF92bS4kY3JlYXRlRWxlbWVudFxuICB2YXIgX2MgPSBfdm0uX3NlbGYuX2MgfHwgX2hcbiAgcmV0dXJuIF9jKFxuICAgIFwic3ZnXCIsXG4gICAge1xuICAgICAgc3RhdGljQ2xhc3M6IFwiaGVyb2ljb24tbWFwIGhlcm9pY29uIGhlcm9pY29uLXNtXCIsXG4gICAgICBhdHRyczoge1xuICAgICAgICB4bWxuczogXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiLFxuICAgICAgICB3aWR0aDogdGhpcy53aWR0aCArIFwicHhcIixcbiAgICAgICAgaGVpZ2h0OiB0aGlzLmhlaWdodCArIFwicHhcIixcbiAgICAgICAgdmlld0JveDogXCIwIDAgNjAgNjBcIlxuICAgICAgfVxuICAgIH0sXG4gICAgW1xuICAgICAgX2MoXCJwYXRoXCIsIHtcbiAgICAgICAgc3RhdGljQ2xhc3M6XG4gICAgICAgICAgXCJoZXJvaWNvbi1tYXAtb3V0ZXIgaGVyb2ljb24tY29tcG9uZW50LWFjY2VudCBoZXJvaWNvbi1jb21wb25lbnQtZmlsbFwiLFxuICAgICAgICBhdHRyczoge1xuICAgICAgICAgIGQ6XG4gICAgICAgICAgICBcIk0yMC4wNSAxMy4wMkwxNSAxMSAwIDE3djQwbDE1LTYgMTUgNiAxNS02IDE1IDZWMTdsLTE1LTYtNS4wNSAyLjAyYy4wMy4zMi4wNS42NS4wNS45OCAwIDUuNTItMTAgMjAtMTAgMjBTMjAgMTkuNTIgMjAgMTRjMC0uMzMuMDItLjY2LjA1LS45OHpcIlxuICAgICAgICB9XG4gICAgICB9KSxcbiAgICAgIF92bS5fdihcIiBcIiksXG4gICAgICBfYyhcInBhdGhcIiwge1xuICAgICAgICBzdGF0aWNDbGFzczogXCJoZXJvaWNvbi1tYXAtaW5uZXIgaGVyb2ljb24tY29tcG9uZW50LWZpbGxcIixcbiAgICAgICAgYXR0cnM6IHtcbiAgICAgICAgICBkOlxuICAgICAgICAgICAgXCJNMjEuMTQgMTguNDZMMTUgMTYgNCAyMHYzMGwxMS00IDE1IDYgMTUtNiAxMSA0VjIwbC0xMS00LTYuMTQgMi40NkMzNi4yMyAyNC45NyAzMCAzNCAzMCAzNHMtNi4yMy05LjAzLTguODYtMTUuNTR6XCJcbiAgICAgICAgfVxuICAgICAgfSksXG4gICAgICBfdm0uX3YoXCIgXCIpLFxuICAgICAgX2MoXCJwYXRoXCIsIHtcbiAgICAgICAgc3RhdGljQ2xhc3M6XG4gICAgICAgICAgXCJoZXJvaWNvbi1tYXAtcGluIGhlcm9pY29uLWNvbXBvbmVudC1hY2NlbnQgaGVyb2ljb24tY29tcG9uZW50LWZpbGxcIixcbiAgICAgICAgYXR0cnM6IHtcbiAgICAgICAgICBkOlxuICAgICAgICAgICAgXCJNMzAgMzRTMjAgMTkuNTIgMjAgMTRhMTAgMTAgMCAxIDEgMjAgMGMwIDUuNTItMTAgMjAtMTAgMjB6bTAtMThhMyAzIDAgMSAwIDAtNiAzIDMgMCAwIDAgMCA2elwiXG4gICAgICAgIH1cbiAgICAgIH0pLFxuICAgICAgX3ZtLl92KFwiIFwiKSxcbiAgICAgIF9jKFwicGF0aFwiLCB7XG4gICAgICAgIHN0YXRpY0NsYXNzOiBcImhlcm9pY29uLXNoYWRvd3NcIixcbiAgICAgICAgYXR0cnM6IHtcbiAgICAgICAgICBkOlxuICAgICAgICAgICAgXCJNMzAgMzdTMjAgMjIuNTIgMjAgMTdjMC0uNTguMDUtMS4xNS4xNC0xLjdDMjEuMzcgMjEuNSAzMCAzNCAzMCAzNGwuMjctLjQuNzMtMS4wOXYzTDMwIDM3djIwbDE1LTZWMTFsLTUuMDUgMi4wMmMuMDMuMzIuMDUuNjUuMDUuOTggMCA0Ljk4LTguMTQgMTcuMjUtOS43MyAxOS42TDMwIDM3ek0wIDE3bDE1LTZ2NDBMMCA1N1YxN3pcIlxuICAgICAgICB9XG4gICAgICB9KSxcbiAgICAgIF92bS5fdihcIiBcIiksXG4gICAgICBfYyhcInBhdGhcIiwge1xuICAgICAgICBzdGF0aWNDbGFzczogXCJoZXJvaWNvbi1vdXRsaW5lXCIsXG4gICAgICAgIGF0dHJzOiB7XG4gICAgICAgICAgZDpcbiAgICAgICAgICAgIFwiTTIwLjA1IDEzLjAyYTEwIDEwIDAgMCAxIDE5LjkgMEw0NSAxMWwxNSA2djQwbC0xNS02LTE1IDYtMTUtNi0xNSA2VjE3bDE1LTYgNS4wNSAyLjAyem0xLjI4IDUuOUwxNiAxNi43OXYxMy41M2wxMyA1LjJ2LTNhNjkuOTkgNjkuOTkgMCAwIDEtLjItLjMxYy0xLjg4LTIuODctNS41MS04LjYzLTcuNDctMTMuM3ptLS41LTEuMjZjLS4zMi0uODktLjU3LTEuNzItLjctMi40NkwxNiAxMy41NXYyLjE2bDQuODMgMS45M3YuMDJ6TTM5LjkgMTUuMWMtLjEzLjc1LS4zOCAxLjYxLS43MiAyLjUzTDQ0IDE1Ljd2LTIuMTZsLTQuMTMgMS42NS4wMi0uMDl6bS0xLjIgMy43NWMtMS45NSA0LjY3LTUuNiAxMC40Ny03LjQ5IDEzLjM1bC0uMi4zdjMuMDFsMTMtNS4yVjE2LjhsLTUuMzMgMi4xMy4wMi0uMDZ6bS01LjQyIDYuMmE2Ni4zNiA2Ni4zNiAwIDAgMCAzLjM0LTYuNEMzNy41NCAxNi41MiAzOCAxNC45MiAzOCAxNGE4IDggMCAxIDAtMTYgMGMwIC45My40NiAyLjUzIDEuNCA0LjY1LjkgMi4wNiAyLjEgNC4zIDMuMzMgNi40MiAxLjE4IDIuMDMgMi4zNiAzLjkgMy4yNyA1LjMyLjkxLTEuNDIgMi4wOS0zLjI5IDMuMjctNS4zMnpNNDYgMTMuNTd2Mi4xNWwxMCA0djE0LjYxbDIgLjhWMTguMzVsLTEyLTQuOHpNMTQgMTUuN3YtMi4xNmwtMTIgNC44djE2Ljc3bDItLjhWMTkuNzFsMTAtNHpNNSAzMy45Mmw5LTMuNlYxNi44bC05IDMuNnYxMy41M3ptLTEgMi41NmwtMiAuOHYxNi43N2wxMi00Ljh2LTIuMTZsLTkgMy42LTEgLjRWMzYuNDh6TTE0IDQ2VjMyLjQ4bC05IDMuNlY0OS42bDktMy42em0yIDEuMDh2Mi4xNmwxMyA1LjJ2LTIuMTZsLTEzLTUuMnptMTMgNC4xMlYzNy42OGwtMTMtNS4yVjQ2bDEzIDUuMnptMiAxLjA4djIuMTZsMTMtNS4ydi0yLjE2bC0xMyA1LjJ6bTEzLTYuMjhWMzIuNDhsLTEzIDUuMlY1MS4ybDEzLTUuMnptMiAxLjA4djIuMTZsMTIgNC44VjM3LjI4bC0yLS44djE0LjYxbC0xLS40LTktMy42em05LTExLjAxbC05LTMuNlY0Nmw5IDMuNlYzNi4wOHptMC0yLjE2VjIwLjRsLTktMy42djEzLjUzbDkgMy42ek0zMCAxN2E0IDQgMCAxIDEgMC04IDQgNCAwIDAgMSAwIDh6bTItNGEyIDIgMCAxIDAtNCAwIDIgMiAwIDAgMCA0IDB6XCJcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICBdXG4gIClcbn1cbnZhciBzdGF0aWNSZW5kZXJGbnMgPSBbXVxucmVuZGVyLl93aXRoU3RyaXBwZWQgPSB0cnVlXG5tb2R1bGUuZXhwb3J0cyA9IHsgcmVuZGVyOiByZW5kZXIsIHN0YXRpY1JlbmRlckZuczogc3RhdGljUmVuZGVyRm5zIH1cbmlmIChtb2R1bGUuaG90KSB7XG4gIG1vZHVsZS5ob3QuYWNjZXB0KClcbiAgaWYgKG1vZHVsZS5ob3QuZGF0YSkge1xuICAgIHJlcXVpcmUoXCJ2dWUtaG90LXJlbG9hZC1hcGlcIikgICAgICAucmVyZW5kZXIoXCJkYXRhLXYtMTc3YjhhZmVcIiwgbW9kdWxlLmV4cG9ydHMpXG4gIH1cbn1cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2xpYi90ZW1wbGF0ZS1jb21waWxlcj97XCJpZFwiOlwiZGF0YS12LTE3N2I4YWZlXCIsXCJoYXNTY29wZWRcIjpmYWxzZSxcImJ1YmxlXCI6e1widHJhbnNmb3Jtc1wiOnt9fX0hLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvc2VsZWN0b3IuanM/dHlwZT10ZW1wbGF0ZSZpbmRleD0wIS4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9jb21wb25lbnRzL3ZpZXdzL0ljb25zL01hcEljb24udnVlXG4vLyBtb2R1bGUgaWQgPSA1M1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgcmVuZGVyID0gZnVuY3Rpb24oKSB7XG4gIHZhciBfdm0gPSB0aGlzXG4gIHZhciBfaCA9IF92bS4kY3JlYXRlRWxlbWVudFxuICB2YXIgX2MgPSBfdm0uX3NlbGYuX2MgfHwgX2hcbiAgcmV0dXJuIF9jKFxuICAgIFwic2VjdGlvblwiLFxuICAgIHsgc3RhdGljQ2xhc3M6IFwiY29udGFpbmVyIG1hcmdpbi10b3AtMSBjb2wtN1wiLCBhdHRyczogeyBpZDogXCJub3QtZm91bmRcIiB9IH0sXG4gICAgW1xuICAgICAgX2MoXG4gICAgICAgIFwiZGl2XCIsXG4gICAgICAgIHsgc3RhdGljQ2xhc3M6IFwibm8tY29udGVudC13cmFwcGVyIHVzZXItc2VsZWN0XCIgfSxcbiAgICAgICAgW1xuICAgICAgICAgIF9jKFwibWFwLWljb25cIiwgeyBhdHRyczogeyB3aWR0aDogXCIyNjBcIiwgaGVpZ2h0OiBcIjI2MFwiIH0gfSksXG4gICAgICAgICAgX3ZtLl92KFwiIFwiKSxcbiAgICAgICAgICBfYyhcInBcIiwgeyBkb21Qcm9wczogeyB0ZXh0Q29udGVudDogX3ZtLl9zKF92bS5tZXNzYWdlKSB9IH0pXG4gICAgICAgIF0sXG4gICAgICAgIDFcbiAgICAgIClcbiAgICBdXG4gIClcbn1cbnZhciBzdGF0aWNSZW5kZXJGbnMgPSBbXVxucmVuZGVyLl93aXRoU3RyaXBwZWQgPSB0cnVlXG5tb2R1bGUuZXhwb3J0cyA9IHsgcmVuZGVyOiByZW5kZXIsIHN0YXRpY1JlbmRlckZuczogc3RhdGljUmVuZGVyRm5zIH1cbmlmIChtb2R1bGUuaG90KSB7XG4gIG1vZHVsZS5ob3QuYWNjZXB0KClcbiAgaWYgKG1vZHVsZS5ob3QuZGF0YSkge1xuICAgIHJlcXVpcmUoXCJ2dWUtaG90LXJlbG9hZC1hcGlcIikgICAgICAucmVyZW5kZXIoXCJkYXRhLXYtZDAwMzlhNThcIiwgbW9kdWxlLmV4cG9ydHMpXG4gIH1cbn1cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2xpYi90ZW1wbGF0ZS1jb21waWxlcj97XCJpZFwiOlwiZGF0YS12LWQwMDM5YTU4XCIsXCJoYXNTY29wZWRcIjpmYWxzZSxcImJ1YmxlXCI6e1widHJhbnNmb3Jtc1wiOnt9fX0hLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvc2VsZWN0b3IuanM/dHlwZT10ZW1wbGF0ZSZpbmRleD0wIS4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9jb21wb25lbnRzL3ZpZXdzL05vdEZvdW5kLnZ1ZVxuLy8gbW9kdWxlIGlkID0gNTRcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIGRpc3Bvc2VkID0gZmFsc2VcbnZhciBub3JtYWxpemVDb21wb25lbnQgPSByZXF1aXJlKFwiIS4uLy4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2xpYi9jb21wb25lbnQtbm9ybWFsaXplclwiKVxuLyogc2NyaXB0ICovXG52YXIgX192dWVfc2NyaXB0X18gPSByZXF1aXJlKFwiISFiYWJlbC1sb2FkZXI/e1xcXCJjYWNoZURpcmVjdG9yeVxcXCI6dHJ1ZSxcXFwicHJlc2V0c1xcXCI6W1tcXFwiZW52XFxcIix7XFxcIm1vZHVsZXNcXFwiOmZhbHNlLFxcXCJ0YXJnZXRzXFxcIjp7XFxcImJyb3dzZXJzXFxcIjpbXFxcIj4gMiVcXFwiXSxcXFwidWdsaWZ5XFxcIjp0cnVlfX1dXSxcXFwicGx1Z2luc1xcXCI6W1xcXCJ0cmFuc2Zvcm0tb2JqZWN0LXJlc3Qtc3ByZWFkXFxcIixbXFxcInRyYW5zZm9ybS1ydW50aW1lXFxcIix7XFxcInBvbHlmaWxsXFxcIjpmYWxzZSxcXFwiaGVscGVyc1xcXCI6ZmFsc2V9XV19IS4uLy4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2xpYi9zZWxlY3Rvcj90eXBlPXNjcmlwdCZpbmRleD0wIS4vRW1wbG95ZWUudnVlXCIpXG4vKiB0ZW1wbGF0ZSAqL1xudmFyIF9fdnVlX3RlbXBsYXRlX18gPSByZXF1aXJlKFwiISEuLi8uLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvdGVtcGxhdGUtY29tcGlsZXIvaW5kZXg/e1xcXCJpZFxcXCI6XFxcImRhdGEtdi0zODcyMzA0N1xcXCIsXFxcImhhc1Njb3BlZFxcXCI6ZmFsc2UsXFxcImJ1YmxlXFxcIjp7XFxcInRyYW5zZm9ybXNcXFwiOnt9fX0hLi4vLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL3NlbGVjdG9yP3R5cGU9dGVtcGxhdGUmaW5kZXg9MCEuL0VtcGxveWVlLnZ1ZVwiKVxuLyogdGVtcGxhdGUgZnVuY3Rpb25hbCAqL1xudmFyIF9fdnVlX3RlbXBsYXRlX2Z1bmN0aW9uYWxfXyA9IGZhbHNlXG4vKiBzdHlsZXMgKi9cbnZhciBfX3Z1ZV9zdHlsZXNfXyA9IG51bGxcbi8qIHNjb3BlSWQgKi9cbnZhciBfX3Z1ZV9zY29wZUlkX18gPSBudWxsXG4vKiBtb2R1bGVJZGVudGlmaWVyIChzZXJ2ZXIgb25seSkgKi9cbnZhciBfX3Z1ZV9tb2R1bGVfaWRlbnRpZmllcl9fID0gbnVsbFxudmFyIENvbXBvbmVudCA9IG5vcm1hbGl6ZUNvbXBvbmVudChcbiAgX192dWVfc2NyaXB0X18sXG4gIF9fdnVlX3RlbXBsYXRlX18sXG4gIF9fdnVlX3RlbXBsYXRlX2Z1bmN0aW9uYWxfXyxcbiAgX192dWVfc3R5bGVzX18sXG4gIF9fdnVlX3Njb3BlSWRfXyxcbiAgX192dWVfbW9kdWxlX2lkZW50aWZpZXJfX1xuKVxuQ29tcG9uZW50Lm9wdGlvbnMuX19maWxlID0gXCJyZXNvdXJjZXNcXFxcYXNzZXRzXFxcXGpzXFxcXGNvbXBvbmVudHNcXFxcdmlld3NcXFxcZW1wbG95ZWVcXFxcRW1wbG95ZWUudnVlXCJcblxuLyogaG90IHJlbG9hZCAqL1xuaWYgKG1vZHVsZS5ob3QpIHsoZnVuY3Rpb24gKCkge1xuICB2YXIgaG90QVBJID0gcmVxdWlyZShcInZ1ZS1ob3QtcmVsb2FkLWFwaVwiKVxuICBob3RBUEkuaW5zdGFsbChyZXF1aXJlKFwidnVlXCIpLCBmYWxzZSlcbiAgaWYgKCFob3RBUEkuY29tcGF0aWJsZSkgcmV0dXJuXG4gIG1vZHVsZS5ob3QuYWNjZXB0KClcbiAgaWYgKCFtb2R1bGUuaG90LmRhdGEpIHtcbiAgICBob3RBUEkuY3JlYXRlUmVjb3JkKFwiZGF0YS12LTM4NzIzMDQ3XCIsIENvbXBvbmVudC5vcHRpb25zKVxuICB9IGVsc2Uge1xuICAgIGhvdEFQSS5yZWxvYWQoXCJkYXRhLXYtMzg3MjMwNDdcIiwgQ29tcG9uZW50Lm9wdGlvbnMpXG4gIH1cbiAgbW9kdWxlLmhvdC5kaXNwb3NlKGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgZGlzcG9zZWQgPSB0cnVlXG4gIH0pXG59KSgpfVxuXG5tb2R1bGUuZXhwb3J0cyA9IENvbXBvbmVudC5leHBvcnRzXG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3Jlc291cmNlcy9hc3NldHMvanMvY29tcG9uZW50cy92aWV3cy9lbXBsb3llZS9FbXBsb3llZS52dWVcbi8vIG1vZHVsZSBpZCA9IDU1XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIjx0ZW1wbGF0ZT5cclxuICAgIDxkaXYgaWQ9XCJlbXBsb3llZVwiPlxyXG4gICAgICAgIDxyb3V0ZXItdmlldz48L3JvdXRlci12aWV3PlxyXG4gICAgPC9kaXY+XHJcbjwvdGVtcGxhdGU+XHJcbjxzY3JpcHQ+XHJcbiAgICBleHBvcnQgZGVmYXVsdCB7XHJcbiAgICAgICAgYmVmb3JlUm91dGVFbnRlcih0bywgZnJvbSwgbmV4dClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIG5leHQoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbjwvc2NyaXB0PlxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyByZXNvdXJjZXMvYXNzZXRzL2pzL2NvbXBvbmVudHMvdmlld3MvZW1wbG95ZWUvRW1wbG95ZWUudnVlIiwidmFyIHJlbmRlciA9IGZ1bmN0aW9uKCkge1xuICB2YXIgX3ZtID0gdGhpc1xuICB2YXIgX2ggPSBfdm0uJGNyZWF0ZUVsZW1lbnRcbiAgdmFyIF9jID0gX3ZtLl9zZWxmLl9jIHx8IF9oXG4gIHJldHVybiBfYyhcImRpdlwiLCB7IGF0dHJzOiB7IGlkOiBcImVtcGxveWVlXCIgfSB9LCBbX2MoXCJyb3V0ZXItdmlld1wiKV0sIDEpXG59XG52YXIgc3RhdGljUmVuZGVyRm5zID0gW11cbnJlbmRlci5fd2l0aFN0cmlwcGVkID0gdHJ1ZVxubW9kdWxlLmV4cG9ydHMgPSB7IHJlbmRlcjogcmVuZGVyLCBzdGF0aWNSZW5kZXJGbnM6IHN0YXRpY1JlbmRlckZucyB9XG5pZiAobW9kdWxlLmhvdCkge1xuICBtb2R1bGUuaG90LmFjY2VwdCgpXG4gIGlmIChtb2R1bGUuaG90LmRhdGEpIHtcbiAgICByZXF1aXJlKFwidnVlLWhvdC1yZWxvYWQtYXBpXCIpICAgICAgLnJlcmVuZGVyKFwiZGF0YS12LTM4NzIzMDQ3XCIsIG1vZHVsZS5leHBvcnRzKVxuICB9XG59XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvdGVtcGxhdGUtY29tcGlsZXI/e1wiaWRcIjpcImRhdGEtdi0zODcyMzA0N1wiLFwiaGFzU2NvcGVkXCI6ZmFsc2UsXCJidWJsZVwiOntcInRyYW5zZm9ybXNcIjp7fX19IS4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL3NlbGVjdG9yLmpzP3R5cGU9dGVtcGxhdGUmaW5kZXg9MCEuL3Jlc291cmNlcy9hc3NldHMvanMvY29tcG9uZW50cy92aWV3cy9lbXBsb3llZS9FbXBsb3llZS52dWVcbi8vIG1vZHVsZSBpZCA9IDU3XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciBkaXNwb3NlZCA9IGZhbHNlXG52YXIgbm9ybWFsaXplQ29tcG9uZW50ID0gcmVxdWlyZShcIiEuLi8uLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvY29tcG9uZW50LW5vcm1hbGl6ZXJcIilcbi8qIHNjcmlwdCAqL1xudmFyIF9fdnVlX3NjcmlwdF9fID0gcmVxdWlyZShcIiEhYmFiZWwtbG9hZGVyP3tcXFwiY2FjaGVEaXJlY3RvcnlcXFwiOnRydWUsXFxcInByZXNldHNcXFwiOltbXFxcImVudlxcXCIse1xcXCJtb2R1bGVzXFxcIjpmYWxzZSxcXFwidGFyZ2V0c1xcXCI6e1xcXCJicm93c2Vyc1xcXCI6W1xcXCI+IDIlXFxcIl0sXFxcInVnbGlmeVxcXCI6dHJ1ZX19XV0sXFxcInBsdWdpbnNcXFwiOltcXFwidHJhbnNmb3JtLW9iamVjdC1yZXN0LXNwcmVhZFxcXCIsW1xcXCJ0cmFuc2Zvcm0tcnVudGltZVxcXCIse1xcXCJwb2x5ZmlsbFxcXCI6ZmFsc2UsXFxcImhlbHBlcnNcXFwiOmZhbHNlfV1dfSEuLi8uLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvc2VsZWN0b3I/dHlwZT1zY3JpcHQmaW5kZXg9MCEuL0xpc3RFbXBsb3llZS52dWVcIilcbi8qIHRlbXBsYXRlICovXG52YXIgX192dWVfdGVtcGxhdGVfXyA9IHJlcXVpcmUoXCIhIS4uLy4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2xpYi90ZW1wbGF0ZS1jb21waWxlci9pbmRleD97XFxcImlkXFxcIjpcXFwiZGF0YS12LTY3ZDU0Zjg1XFxcIixcXFwiaGFzU2NvcGVkXFxcIjpmYWxzZSxcXFwiYnVibGVcXFwiOntcXFwidHJhbnNmb3Jtc1xcXCI6e319fSEuLi8uLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvc2VsZWN0b3I/dHlwZT10ZW1wbGF0ZSZpbmRleD0wIS4vTGlzdEVtcGxveWVlLnZ1ZVwiKVxuLyogdGVtcGxhdGUgZnVuY3Rpb25hbCAqL1xudmFyIF9fdnVlX3RlbXBsYXRlX2Z1bmN0aW9uYWxfXyA9IGZhbHNlXG4vKiBzdHlsZXMgKi9cbnZhciBfX3Z1ZV9zdHlsZXNfXyA9IG51bGxcbi8qIHNjb3BlSWQgKi9cbnZhciBfX3Z1ZV9zY29wZUlkX18gPSBudWxsXG4vKiBtb2R1bGVJZGVudGlmaWVyIChzZXJ2ZXIgb25seSkgKi9cbnZhciBfX3Z1ZV9tb2R1bGVfaWRlbnRpZmllcl9fID0gbnVsbFxudmFyIENvbXBvbmVudCA9IG5vcm1hbGl6ZUNvbXBvbmVudChcbiAgX192dWVfc2NyaXB0X18sXG4gIF9fdnVlX3RlbXBsYXRlX18sXG4gIF9fdnVlX3RlbXBsYXRlX2Z1bmN0aW9uYWxfXyxcbiAgX192dWVfc3R5bGVzX18sXG4gIF9fdnVlX3Njb3BlSWRfXyxcbiAgX192dWVfbW9kdWxlX2lkZW50aWZpZXJfX1xuKVxuQ29tcG9uZW50Lm9wdGlvbnMuX19maWxlID0gXCJyZXNvdXJjZXNcXFxcYXNzZXRzXFxcXGpzXFxcXGNvbXBvbmVudHNcXFxcdmlld3NcXFxcZW1wbG95ZWVcXFxcTGlzdEVtcGxveWVlLnZ1ZVwiXG5cbi8qIGhvdCByZWxvYWQgKi9cbmlmIChtb2R1bGUuaG90KSB7KGZ1bmN0aW9uICgpIHtcbiAgdmFyIGhvdEFQSSA9IHJlcXVpcmUoXCJ2dWUtaG90LXJlbG9hZC1hcGlcIilcbiAgaG90QVBJLmluc3RhbGwocmVxdWlyZShcInZ1ZVwiKSwgZmFsc2UpXG4gIGlmICghaG90QVBJLmNvbXBhdGlibGUpIHJldHVyblxuICBtb2R1bGUuaG90LmFjY2VwdCgpXG4gIGlmICghbW9kdWxlLmhvdC5kYXRhKSB7XG4gICAgaG90QVBJLmNyZWF0ZVJlY29yZChcImRhdGEtdi02N2Q1NGY4NVwiLCBDb21wb25lbnQub3B0aW9ucylcbiAgfSBlbHNlIHtcbiAgICBob3RBUEkucmVsb2FkKFwiZGF0YS12LTY3ZDU0Zjg1XCIsIENvbXBvbmVudC5vcHRpb25zKVxuICB9XG4gIG1vZHVsZS5ob3QuZGlzcG9zZShmdW5jdGlvbiAoZGF0YSkge1xuICAgIGRpc3Bvc2VkID0gdHJ1ZVxuICB9KVxufSkoKX1cblxubW9kdWxlLmV4cG9ydHMgPSBDb21wb25lbnQuZXhwb3J0c1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9yZXNvdXJjZXMvYXNzZXRzL2pzL2NvbXBvbmVudHMvdmlld3MvZW1wbG95ZWUvTGlzdEVtcGxveWVlLnZ1ZVxuLy8gbW9kdWxlIGlkID0gNThcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiPHRlbXBsYXRlPlxyXG4gICAgPGRpdiBjbGFzcz1cIndpZGdldC1ib3hcIj5cclxuICAgICAgICA8ZGl2IGNsYXNzPVwid2lkZ2V0LXRpdGxlXCI+XHJcbiAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwiaWNvblwiPjxpIGNsYXNzPVwiaWNvbi10aFwiPjwvaT48L3NwYW4+XHJcbiAgICAgICAgICAgIDxoNT5FbXBsb3llZTwvaDU+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgPGRpdiBjbGFzcz1cIndpZGdldC1jb250ZW50IG5vcGFkZGluZ1wiPlxyXG4gICAgICAgICAgICA8dGFibGUgY2xhc3M9XCJ0YWJsZSB0YWJsZS1ib3JkZXJlZCBkYXRhLXRhYmxlXCI+XHJcbiAgICAgICAgICAgICAgICA8dGhlYWQ+XHJcbiAgICAgICAgICAgICAgICA8dHI+XHJcbiAgICAgICAgICAgICAgICAgICAgPHRoPk9mZmljZTwvdGg+XHJcbiAgICAgICAgICAgICAgICAgICAgPHRoPk5hbWU8L3RoPlxyXG4gICAgICAgICAgICAgICAgICAgIDx0aCBjbGFzcz1cInRkLTEwXCI+R2VuZGVyPC90aD5cclxuICAgICAgICAgICAgICAgICAgICA8dGg+RW1haWw8L3RoPlxyXG4gICAgICAgICAgICAgICAgICAgIDx0aD5QaG9uZTwvdGg+XHJcbiAgICAgICAgICAgICAgICAgICAgPHRoIGNsYXNzPVwidGQtMTBcIj48cm91dGVyLWxpbmsgOnRvPVwie25hbWU6ICdlbXBsb3llZS1uZXcnfVwiIGFjdGl2ZS1jbGFzcz1cImlzLWFjdGl2ZVwiPk5ldzwvcm91dGVyLWxpbms+PC90aD5cclxuICAgICAgICAgICAgICAgIDwvdHI+XHJcbiAgICAgICAgICAgICAgICA8L3RoZWFkPlxyXG4gICAgICAgICAgICAgICAgPHRib2R5PlxyXG4gICAgICAgICAgICAgICAgPHRyIGNsYXNzPVwiZ3JhZGVYXCIgdi1mb3I9XCJlbXAgaW4gZW1wcy5pdGVtc1wiPlxyXG4gICAgICAgICAgICAgICAgICAgIDx0ZCB2LXRleHQ9XCJlbXAudHlwZV9uYW1lXCI+PC90ZD5cclxuICAgICAgICAgICAgICAgICAgICA8dGQgdi10ZXh0PVwiZW1wLm5hbWVcIj48L3RkPlxyXG4gICAgICAgICAgICAgICAgICAgIDx0ZCB2LXRleHQ9XCJlbXAuZ2VuZGVyXCIgY2xhc3M9XCJ0ZC0xMFwiPjwvdGQ+XHJcbiAgICAgICAgICAgICAgICAgICAgPHRkIHYtdGV4dD1cImVtcC5lbWFpbFwiPjwvdGQ+XHJcbiAgICAgICAgICAgICAgICAgICAgPHRkIHYtdGV4dD1cImVtcC5waG9uZVwiPjwvdGQ+XHJcbiAgICAgICAgICAgICAgICAgICAgPHRkIGNsYXNzPVwidGQtMTBcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPHJvdXRlci1saW5rIDp0bz1cIntuYW1lOiAnZW1wbG95ZWUtZGV0YWlsJywgcGFyYW1zOiB7aWRFbXA6IGVtcC5pZH19XCIgYWN0aXZlLWNsYXNzPVwiaXMtYWN0aXZlXCIgY2xhc3M9XCJ0aXAtdG9wXCIgZGF0YS10b2dnbGU9XCJ0b29sdGlwXCIgdGl0bGU9XCJWaWV3XCI+PGkgY2xhc3M9XCJpY29uLXNlYXJjaFwiPjwvaT48L3JvdXRlci1saW5rPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8YSBocmVmPVwiI1wiIGNsYXNzPVwidGlwLXRvcFwiIGRhdGEtdG9nZ2xlPVwidG9vbHRpcFwiIHRpdGxlPVwiRWRpdFwiPjxpIGNsYXNzPVwiaWNvbi1lZGl0XCI+PC9pPjwvYT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPGEgaHJlZj1cIiNcIiBjbGFzcz1cInRpcC10b3BcIiBkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIiB0aXRsZT1cIkRlbGV0ZVwiPjxpIGNsYXNzPVwiaWNvbi1yZW1vdmUtY2lyY2xlXCI+PC9pPjwvYT5cclxuICAgICAgICAgICAgICAgICAgICA8L3RkPlxyXG4gICAgICAgICAgICAgICAgPC90cj5cclxuXHJcbiAgICAgICAgICAgICAgICA8L3Rib2R5PlxyXG4gICAgICAgICAgICA8L3RhYmxlPlxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgPC9kaXY+XHJcbjwvdGVtcGxhdGU+XHJcbjxzY3JpcHQ+XHJcbiAgICBpbXBvcnQgVnVlIGZyb20gJ3Z1ZSdcclxuICAgIGltcG9ydCBheGlvcyBmcm9tICdheGlvcydcclxuXHJcbiAgICBleHBvcnQgZGVmYXVsdCB7XHJcbiAgICAgICAgZGF0YTogZnVuY3Rpb24gKClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICBlbXBzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaXRlbXM6IFtdLFxyXG4gICAgICAgICAgICAgICAgICAgIGVycm9yczogW10sXHJcbiAgICAgICAgICAgICAgICAgICAgbG9hZGluZzogZmFsc2VcclxuICAgICAgICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICBjcmVhdGVkOiBmdW5jdGlvbiAoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5nZXRMaXN0KClcclxuICAgICAgICB9LFxyXG4gICAgICAgIG1ldGhvZHM6IHtcclxuICAgICAgICAgICAgZ2V0TGlzdCAoKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLiRQcm9ncmVzcy5zdGFydCgpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5lbXBzLml0ZW1zID0gW107XHJcbiAgICAgICAgICAgICAgICB0aGlzLmxvYWRpbmcgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgYXhpb3MuZ2V0KCcvYXBpL2VtcGxveWVlJylcclxuICAgICAgICAgICAgICAgICAgICAudGhlbigocmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5lbXBzLml0ZW1zID0gcmVzcG9uc2UuZGF0YTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2FkaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuJFByb2dyZXNzLmZpbmlzaCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgLmNhdGNoKGVyciA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubG9hZGluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmVycm9ycy5wdXNoKGVycik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuJFByb2dyZXNzLmZhaWwoKTtcclxuICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG48L3NjcmlwdD5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gcmVzb3VyY2VzL2Fzc2V0cy9qcy9jb21wb25lbnRzL3ZpZXdzL2VtcGxveWVlL0xpc3RFbXBsb3llZS52dWUiLCJ2YXIgcmVuZGVyID0gZnVuY3Rpb24oKSB7XG4gIHZhciBfdm0gPSB0aGlzXG4gIHZhciBfaCA9IF92bS4kY3JlYXRlRWxlbWVudFxuICB2YXIgX2MgPSBfdm0uX3NlbGYuX2MgfHwgX2hcbiAgcmV0dXJuIF9jKFwiZGl2XCIsIHsgc3RhdGljQ2xhc3M6IFwid2lkZ2V0LWJveFwiIH0sIFtcbiAgICBfdm0uX20oMCksXG4gICAgX3ZtLl92KFwiIFwiKSxcbiAgICBfYyhcImRpdlwiLCB7IHN0YXRpY0NsYXNzOiBcIndpZGdldC1jb250ZW50IG5vcGFkZGluZ1wiIH0sIFtcbiAgICAgIF9jKFwidGFibGVcIiwgeyBzdGF0aWNDbGFzczogXCJ0YWJsZSB0YWJsZS1ib3JkZXJlZCBkYXRhLXRhYmxlXCIgfSwgW1xuICAgICAgICBfYyhcInRoZWFkXCIsIFtcbiAgICAgICAgICBfYyhcInRyXCIsIFtcbiAgICAgICAgICAgIF9jKFwidGhcIiwgW192bS5fdihcIk9mZmljZVwiKV0pLFxuICAgICAgICAgICAgX3ZtLl92KFwiIFwiKSxcbiAgICAgICAgICAgIF9jKFwidGhcIiwgW192bS5fdihcIk5hbWVcIildKSxcbiAgICAgICAgICAgIF92bS5fdihcIiBcIiksXG4gICAgICAgICAgICBfYyhcInRoXCIsIHsgc3RhdGljQ2xhc3M6IFwidGQtMTBcIiB9LCBbX3ZtLl92KFwiR2VuZGVyXCIpXSksXG4gICAgICAgICAgICBfdm0uX3YoXCIgXCIpLFxuICAgICAgICAgICAgX2MoXCJ0aFwiLCBbX3ZtLl92KFwiRW1haWxcIildKSxcbiAgICAgICAgICAgIF92bS5fdihcIiBcIiksXG4gICAgICAgICAgICBfYyhcInRoXCIsIFtfdm0uX3YoXCJQaG9uZVwiKV0pLFxuICAgICAgICAgICAgX3ZtLl92KFwiIFwiKSxcbiAgICAgICAgICAgIF9jKFxuICAgICAgICAgICAgICBcInRoXCIsXG4gICAgICAgICAgICAgIHsgc3RhdGljQ2xhc3M6IFwidGQtMTBcIiB9LFxuICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgX2MoXG4gICAgICAgICAgICAgICAgICBcInJvdXRlci1saW5rXCIsXG4gICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGF0dHJzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgdG86IHsgbmFtZTogXCJlbXBsb3llZS1uZXdcIiB9LFxuICAgICAgICAgICAgICAgICAgICAgIFwiYWN0aXZlLWNsYXNzXCI6IFwiaXMtYWN0aXZlXCJcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgIFtfdm0uX3YoXCJOZXdcIildXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAxXG4gICAgICAgICAgICApXG4gICAgICAgICAgXSlcbiAgICAgICAgXSksXG4gICAgICAgIF92bS5fdihcIiBcIiksXG4gICAgICAgIF9jKFxuICAgICAgICAgIFwidGJvZHlcIixcbiAgICAgICAgICBfdm0uX2woX3ZtLmVtcHMuaXRlbXMsIGZ1bmN0aW9uKGVtcCkge1xuICAgICAgICAgICAgcmV0dXJuIF9jKFwidHJcIiwgeyBzdGF0aWNDbGFzczogXCJncmFkZVhcIiB9LCBbXG4gICAgICAgICAgICAgIF9jKFwidGRcIiwgeyBkb21Qcm9wczogeyB0ZXh0Q29udGVudDogX3ZtLl9zKGVtcC50eXBlX25hbWUpIH0gfSksXG4gICAgICAgICAgICAgIF92bS5fdihcIiBcIiksXG4gICAgICAgICAgICAgIF9jKFwidGRcIiwgeyBkb21Qcm9wczogeyB0ZXh0Q29udGVudDogX3ZtLl9zKGVtcC5uYW1lKSB9IH0pLFxuICAgICAgICAgICAgICBfdm0uX3YoXCIgXCIpLFxuICAgICAgICAgICAgICBfYyhcInRkXCIsIHtcbiAgICAgICAgICAgICAgICBzdGF0aWNDbGFzczogXCJ0ZC0xMFwiLFxuICAgICAgICAgICAgICAgIGRvbVByb3BzOiB7IHRleHRDb250ZW50OiBfdm0uX3MoZW1wLmdlbmRlcikgfVxuICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgX3ZtLl92KFwiIFwiKSxcbiAgICAgICAgICAgICAgX2MoXCJ0ZFwiLCB7IGRvbVByb3BzOiB7IHRleHRDb250ZW50OiBfdm0uX3MoZW1wLmVtYWlsKSB9IH0pLFxuICAgICAgICAgICAgICBfdm0uX3YoXCIgXCIpLFxuICAgICAgICAgICAgICBfYyhcInRkXCIsIHsgZG9tUHJvcHM6IHsgdGV4dENvbnRlbnQ6IF92bS5fcyhlbXAucGhvbmUpIH0gfSksXG4gICAgICAgICAgICAgIF92bS5fdihcIiBcIiksXG4gICAgICAgICAgICAgIF9jKFxuICAgICAgICAgICAgICAgIFwidGRcIixcbiAgICAgICAgICAgICAgICB7IHN0YXRpY0NsYXNzOiBcInRkLTEwXCIgfSxcbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICBfYyhcbiAgICAgICAgICAgICAgICAgICAgXCJyb3V0ZXItbGlua1wiLFxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgc3RhdGljQ2xhc3M6IFwidGlwLXRvcFwiLFxuICAgICAgICAgICAgICAgICAgICAgIGF0dHJzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0bzoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBcImVtcGxveWVlLWRldGFpbFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJhbXM6IHsgaWRFbXA6IGVtcC5pZCB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJhY3RpdmUtY2xhc3NcIjogXCJpcy1hY3RpdmVcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiZGF0YS10b2dnbGVcIjogXCJ0b29sdGlwXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICB0aXRsZTogXCJWaWV3XCJcbiAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIFtfYyhcImlcIiwgeyBzdGF0aWNDbGFzczogXCJpY29uLXNlYXJjaFwiIH0pXVxuICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICAgIF92bS5fdihcIiBcIiksXG4gICAgICAgICAgICAgICAgICBfdm0uX20oMSwgdHJ1ZSksXG4gICAgICAgICAgICAgICAgICBfdm0uX3YoXCIgXCIpLFxuICAgICAgICAgICAgICAgICAgX3ZtLl9tKDIsIHRydWUpXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAxXG4gICAgICAgICAgICAgIClcbiAgICAgICAgICAgIF0pXG4gICAgICAgICAgfSlcbiAgICAgICAgKVxuICAgICAgXSlcbiAgICBdKVxuICBdKVxufVxudmFyIHN0YXRpY1JlbmRlckZucyA9IFtcbiAgZnVuY3Rpb24oKSB7XG4gICAgdmFyIF92bSA9IHRoaXNcbiAgICB2YXIgX2ggPSBfdm0uJGNyZWF0ZUVsZW1lbnRcbiAgICB2YXIgX2MgPSBfdm0uX3NlbGYuX2MgfHwgX2hcbiAgICByZXR1cm4gX2MoXCJkaXZcIiwgeyBzdGF0aWNDbGFzczogXCJ3aWRnZXQtdGl0bGVcIiB9LCBbXG4gICAgICBfYyhcInNwYW5cIiwgeyBzdGF0aWNDbGFzczogXCJpY29uXCIgfSwgW1xuICAgICAgICBfYyhcImlcIiwgeyBzdGF0aWNDbGFzczogXCJpY29uLXRoXCIgfSlcbiAgICAgIF0pLFxuICAgICAgX3ZtLl92KFwiIFwiKSxcbiAgICAgIF9jKFwiaDVcIiwgW192bS5fdihcIkVtcGxveWVlXCIpXSlcbiAgICBdKVxuICB9LFxuICBmdW5jdGlvbigpIHtcbiAgICB2YXIgX3ZtID0gdGhpc1xuICAgIHZhciBfaCA9IF92bS4kY3JlYXRlRWxlbWVudFxuICAgIHZhciBfYyA9IF92bS5fc2VsZi5fYyB8fCBfaFxuICAgIHJldHVybiBfYyhcbiAgICAgIFwiYVwiLFxuICAgICAge1xuICAgICAgICBzdGF0aWNDbGFzczogXCJ0aXAtdG9wXCIsXG4gICAgICAgIGF0dHJzOiB7IGhyZWY6IFwiI1wiLCBcImRhdGEtdG9nZ2xlXCI6IFwidG9vbHRpcFwiLCB0aXRsZTogXCJFZGl0XCIgfVxuICAgICAgfSxcbiAgICAgIFtfYyhcImlcIiwgeyBzdGF0aWNDbGFzczogXCJpY29uLWVkaXRcIiB9KV1cbiAgICApXG4gIH0sXG4gIGZ1bmN0aW9uKCkge1xuICAgIHZhciBfdm0gPSB0aGlzXG4gICAgdmFyIF9oID0gX3ZtLiRjcmVhdGVFbGVtZW50XG4gICAgdmFyIF9jID0gX3ZtLl9zZWxmLl9jIHx8IF9oXG4gICAgcmV0dXJuIF9jKFxuICAgICAgXCJhXCIsXG4gICAgICB7XG4gICAgICAgIHN0YXRpY0NsYXNzOiBcInRpcC10b3BcIixcbiAgICAgICAgYXR0cnM6IHsgaHJlZjogXCIjXCIsIFwiZGF0YS10b2dnbGVcIjogXCJ0b29sdGlwXCIsIHRpdGxlOiBcIkRlbGV0ZVwiIH1cbiAgICAgIH0sXG4gICAgICBbX2MoXCJpXCIsIHsgc3RhdGljQ2xhc3M6IFwiaWNvbi1yZW1vdmUtY2lyY2xlXCIgfSldXG4gICAgKVxuICB9XG5dXG5yZW5kZXIuX3dpdGhTdHJpcHBlZCA9IHRydWVcbm1vZHVsZS5leHBvcnRzID0geyByZW5kZXI6IHJlbmRlciwgc3RhdGljUmVuZGVyRm5zOiBzdGF0aWNSZW5kZXJGbnMgfVxuaWYgKG1vZHVsZS5ob3QpIHtcbiAgbW9kdWxlLmhvdC5hY2NlcHQoKVxuICBpZiAobW9kdWxlLmhvdC5kYXRhKSB7XG4gICAgcmVxdWlyZShcInZ1ZS1ob3QtcmVsb2FkLWFwaVwiKSAgICAgIC5yZXJlbmRlcihcImRhdGEtdi02N2Q1NGY4NVwiLCBtb2R1bGUuZXhwb3J0cylcbiAgfVxufVxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL3RlbXBsYXRlLWNvbXBpbGVyP3tcImlkXCI6XCJkYXRhLXYtNjdkNTRmODVcIixcImhhc1Njb3BlZFwiOmZhbHNlLFwiYnVibGVcIjp7XCJ0cmFuc2Zvcm1zXCI6e319fSEuL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2xpYi9zZWxlY3Rvci5qcz90eXBlPXRlbXBsYXRlJmluZGV4PTAhLi9yZXNvdXJjZXMvYXNzZXRzL2pzL2NvbXBvbmVudHMvdmlld3MvZW1wbG95ZWUvTGlzdEVtcGxveWVlLnZ1ZVxuLy8gbW9kdWxlIGlkID0gNjBcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIGRpc3Bvc2VkID0gZmFsc2VcbnZhciBub3JtYWxpemVDb21wb25lbnQgPSByZXF1aXJlKFwiIS4uLy4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2xpYi9jb21wb25lbnQtbm9ybWFsaXplclwiKVxuLyogc2NyaXB0ICovXG52YXIgX192dWVfc2NyaXB0X18gPSByZXF1aXJlKFwiISFiYWJlbC1sb2FkZXI/e1xcXCJjYWNoZURpcmVjdG9yeVxcXCI6dHJ1ZSxcXFwicHJlc2V0c1xcXCI6W1tcXFwiZW52XFxcIix7XFxcIm1vZHVsZXNcXFwiOmZhbHNlLFxcXCJ0YXJnZXRzXFxcIjp7XFxcImJyb3dzZXJzXFxcIjpbXFxcIj4gMiVcXFwiXSxcXFwidWdsaWZ5XFxcIjp0cnVlfX1dXSxcXFwicGx1Z2luc1xcXCI6W1xcXCJ0cmFuc2Zvcm0tb2JqZWN0LXJlc3Qtc3ByZWFkXFxcIixbXFxcInRyYW5zZm9ybS1ydW50aW1lXFxcIix7XFxcInBvbHlmaWxsXFxcIjpmYWxzZSxcXFwiaGVscGVyc1xcXCI6ZmFsc2V9XV19IS4uLy4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2xpYi9zZWxlY3Rvcj90eXBlPXNjcmlwdCZpbmRleD0wIS4vRW1wbG95ZWVOZXcudnVlXCIpXG4vKiB0ZW1wbGF0ZSAqL1xudmFyIF9fdnVlX3RlbXBsYXRlX18gPSByZXF1aXJlKFwiISEuLi8uLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvdGVtcGxhdGUtY29tcGlsZXIvaW5kZXg/e1xcXCJpZFxcXCI6XFxcImRhdGEtdi0zMDBhMTQwOVxcXCIsXFxcImhhc1Njb3BlZFxcXCI6ZmFsc2UsXFxcImJ1YmxlXFxcIjp7XFxcInRyYW5zZm9ybXNcXFwiOnt9fX0hLi4vLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL3NlbGVjdG9yP3R5cGU9dGVtcGxhdGUmaW5kZXg9MCEuL0VtcGxveWVlTmV3LnZ1ZVwiKVxuLyogdGVtcGxhdGUgZnVuY3Rpb25hbCAqL1xudmFyIF9fdnVlX3RlbXBsYXRlX2Z1bmN0aW9uYWxfXyA9IGZhbHNlXG4vKiBzdHlsZXMgKi9cbnZhciBfX3Z1ZV9zdHlsZXNfXyA9IG51bGxcbi8qIHNjb3BlSWQgKi9cbnZhciBfX3Z1ZV9zY29wZUlkX18gPSBudWxsXG4vKiBtb2R1bGVJZGVudGlmaWVyIChzZXJ2ZXIgb25seSkgKi9cbnZhciBfX3Z1ZV9tb2R1bGVfaWRlbnRpZmllcl9fID0gbnVsbFxudmFyIENvbXBvbmVudCA9IG5vcm1hbGl6ZUNvbXBvbmVudChcbiAgX192dWVfc2NyaXB0X18sXG4gIF9fdnVlX3RlbXBsYXRlX18sXG4gIF9fdnVlX3RlbXBsYXRlX2Z1bmN0aW9uYWxfXyxcbiAgX192dWVfc3R5bGVzX18sXG4gIF9fdnVlX3Njb3BlSWRfXyxcbiAgX192dWVfbW9kdWxlX2lkZW50aWZpZXJfX1xuKVxuQ29tcG9uZW50Lm9wdGlvbnMuX19maWxlID0gXCJyZXNvdXJjZXNcXFxcYXNzZXRzXFxcXGpzXFxcXGNvbXBvbmVudHNcXFxcdmlld3NcXFxcZW1wbG95ZWVcXFxcRW1wbG95ZWVOZXcudnVlXCJcblxuLyogaG90IHJlbG9hZCAqL1xuaWYgKG1vZHVsZS5ob3QpIHsoZnVuY3Rpb24gKCkge1xuICB2YXIgaG90QVBJID0gcmVxdWlyZShcInZ1ZS1ob3QtcmVsb2FkLWFwaVwiKVxuICBob3RBUEkuaW5zdGFsbChyZXF1aXJlKFwidnVlXCIpLCBmYWxzZSlcbiAgaWYgKCFob3RBUEkuY29tcGF0aWJsZSkgcmV0dXJuXG4gIG1vZHVsZS5ob3QuYWNjZXB0KClcbiAgaWYgKCFtb2R1bGUuaG90LmRhdGEpIHtcbiAgICBob3RBUEkuY3JlYXRlUmVjb3JkKFwiZGF0YS12LTMwMGExNDA5XCIsIENvbXBvbmVudC5vcHRpb25zKVxuICB9IGVsc2Uge1xuICAgIGhvdEFQSS5yZWxvYWQoXCJkYXRhLXYtMzAwYTE0MDlcIiwgQ29tcG9uZW50Lm9wdGlvbnMpXG4gIH1cbiAgbW9kdWxlLmhvdC5kaXNwb3NlKGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgZGlzcG9zZWQgPSB0cnVlXG4gIH0pXG59KSgpfVxuXG5tb2R1bGUuZXhwb3J0cyA9IENvbXBvbmVudC5leHBvcnRzXG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3Jlc291cmNlcy9hc3NldHMvanMvY29tcG9uZW50cy92aWV3cy9lbXBsb3llZS9FbXBsb3llZU5ldy52dWVcbi8vIG1vZHVsZSBpZCA9IDYxXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIjx0ZW1wbGF0ZT5cclxuICAgIDxkaXYgaWQ9XCJlbXBOZXdcIj5cclxuICAgICAgICA8ZGl2IGNsYXNzPVwicm93LWZsdWlkXCI+XHJcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJzcGFuNlwiPlxyXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIndpZGdldC1ib3hcIj5cclxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwid2lkZ2V0LXRpdGxlXCI+IDxzcGFuIGNsYXNzPVwiaWNvblwiPiA8aSBjbGFzcz1cImljb24tYWxpZ24tanVzdGlmeVwiPjwvaT4gPC9zcGFuPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8aDU+RW1wbG95ZWUgTmV3PC9oNT5cclxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwid2lkZ2V0LWNvbnRlbnQgbm9wYWRkaW5nXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxmb3JtIGFjdGlvbj1cIiNcIiBtZXRob2Q9XCJnZXRcIiBjbGFzcz1cImZvcm0taG9yaXpvbnRhbFwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImNvbnRyb2wtZ3JvdXBcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bGFiZWwgY2xhc3M9XCJjb250cm9sLWxhYmVsXCI+U2VsZWN0IE9mZmljZTo8L2xhYmVsPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJjb250cm9sc1wiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c2VsZWN0IG5hbWU9XCJ0eXBlX2VtcFwiIGlkPVwidHlwZV9lbXBcIiB2LWlmPVwiZW1wcy5pdGVtc1wiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPG9wdGlvbiB2LWZvcj1cIml0ZW0gaW4gZW1wcy5pdGVtc1wiIDp2YWx1ZT1cIml0ZW0uaWRcIj57e2l0ZW0ubmFtZX19PC9vcHRpb24+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvc2VsZWN0PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiY29udHJvbC1ncm91cFwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxsYWJlbCBjbGFzcz1cImNvbnRyb2wtbGFiZWxcIj5JbWFnZTo8L2xhYmVsPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJjb250cm9sc1wiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cImZpbGVcIiBuYW1lPVwiaW1hZ2VcIiAvPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiY29udHJvbC1ncm91cFwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxsYWJlbCBjbGFzcz1cImNvbnRyb2wtbGFiZWxcIj5GaXJzdCBOYW1lOjwvbGFiZWw+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImNvbnRyb2xzXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVwidGV4dFwiIG5hbWU9XCJmaXJzdE5hbWVcIiBpZD1cImZpcnN0TmFtZVwiIC8+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJjb250cm9sLWdyb3VwXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGxhYmVsIGNsYXNzPVwiY29udHJvbC1sYWJlbFwiPkxhc3QgTmFtZTo8L2xhYmVsPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJjb250cm9sc1wiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cInRleHRcIiBuYW1lPVwibGFzdE5hbWVcIiBpZD1cImxhc3ROYW1lXCIgLz5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImNvbnRyb2wtZ3JvdXBcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bGFiZWwgY2xhc3M9XCJjb250cm9sLWxhYmVsXCI+R2VuZGVyOjwvbGFiZWw+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImNvbnRyb2xzXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxsYWJlbD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVwicmFkaW9cIiBuYW1lPVwibWFsZVwiIC8+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBNYWxlPC9sYWJlbD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGxhYmVsPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJyYWRpb1wiIG5hbWU9XCJmZW1hbGVcIiAvPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgRmVtYWxlPC9sYWJlbD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImNvbnRyb2wtZ3JvdXBcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bGFiZWwgY2xhc3M9XCJjb250cm9sLWxhYmVsXCI+RW1haWw6PC9sYWJlbD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiY29udHJvbHNcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJ0ZXh0XCIgbmFtZT1cImVtYWlsXCIgaWQ9XCJlbWFpbFwiPlxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImNvbnRyb2wtZ3JvdXBcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bGFiZWwgY2xhc3M9XCJjb250cm9sLWxhYmVsXCI+UGhvbmU6PC9sYWJlbD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiY29udHJvbHNcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJudW1iZXJcIiBuYW1lPVwicGhvbmVcIiBpZD1cInBob25lXCIgLz5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZvcm0tYWN0aW9uc1wiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cInN1Ym1pdFwiIG5hbWU9XCJzYXZlRW1wXCIgaWQ9XCJzYXZlRW1wXCIgY2xhc3M9XCJidG4gYnRuLXN1Y2Nlc3NcIj5TYXZlPC9idXR0b24+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPC9mb3JtPlxyXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgPC9kaXY+XHJcbjwvdGVtcGxhdGU+XHJcbjxzY3JpcHQ+XHJcbiAgICBpbXBvcnQgVnVlIGZyb20gJ3Z1ZSdcclxuICAgIGltcG9ydCBheGlvcyBmcm9tICdheGlvcydcclxuICAgIGV4cG9ydCBkZWZhdWx0XHJcbiAgICB7XHJcblxyXG4gICAgICAgIGRhdGEgKCkge1xyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgZW1wczoge1xyXG4gICAgICAgICAgICAgICAgICAgIGl0ZW1zOiBbXSxcclxuICAgICAgICAgICAgICAgICAgICBsb2FkaW5nOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICBlcnJvcnM6IFtdXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIGNyZWF0ZWQ6IGZ1bmN0aW9uICgpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLmdldFR5cGVFbXAoKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIG1ldGhvZHM6IHtcclxuICAgICAgICAgICAgZ2V0VHlwZUVtcCgpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuJFByb2dyZXNzLnN0YXJ0KCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmVtcHMuaXRlbXMgPSBbXTtcclxuICAgICAgICAgICAgICAgIHRoaXMubG9hZGluZyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICBheGlvcy5nZXQoJy9hcGkvdHlwZS1lbXBsb3llZScpXHJcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4ocmVzcG9uc2UgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZW1wcy5pdGVtcyA9IHJlc3BvbnNlLmRhdGE7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2FkaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy4kUHJvZ3Jlc3MuZmluaXNoKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICAuY2F0Y2ggKGVyciA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2FkaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5lcnJvcnMucHVzaChlcnIpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuJFByb2dyZXNzLmZhaWwoKTtcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbjwvc2NyaXB0PlxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyByZXNvdXJjZXMvYXNzZXRzL2pzL2NvbXBvbmVudHMvdmlld3MvZW1wbG95ZWUvRW1wbG95ZWVOZXcudnVlIiwidmFyIHJlbmRlciA9IGZ1bmN0aW9uKCkge1xuICB2YXIgX3ZtID0gdGhpc1xuICB2YXIgX2ggPSBfdm0uJGNyZWF0ZUVsZW1lbnRcbiAgdmFyIF9jID0gX3ZtLl9zZWxmLl9jIHx8IF9oXG4gIHJldHVybiBfYyhcImRpdlwiLCB7IGF0dHJzOiB7IGlkOiBcImVtcE5ld1wiIH0gfSwgW1xuICAgIF9jKFwiZGl2XCIsIHsgc3RhdGljQ2xhc3M6IFwicm93LWZsdWlkXCIgfSwgW1xuICAgICAgX2MoXCJkaXZcIiwgeyBzdGF0aWNDbGFzczogXCJzcGFuNlwiIH0sIFtcbiAgICAgICAgX2MoXCJkaXZcIiwgeyBzdGF0aWNDbGFzczogXCJ3aWRnZXQtYm94XCIgfSwgW1xuICAgICAgICAgIF92bS5fbSgwKSxcbiAgICAgICAgICBfdm0uX3YoXCIgXCIpLFxuICAgICAgICAgIF9jKFwiZGl2XCIsIHsgc3RhdGljQ2xhc3M6IFwid2lkZ2V0LWNvbnRlbnQgbm9wYWRkaW5nXCIgfSwgW1xuICAgICAgICAgICAgX2MoXG4gICAgICAgICAgICAgIFwiZm9ybVwiLFxuICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgc3RhdGljQ2xhc3M6IFwiZm9ybS1ob3Jpem9udGFsXCIsXG4gICAgICAgICAgICAgICAgYXR0cnM6IHsgYWN0aW9uOiBcIiNcIiwgbWV0aG9kOiBcImdldFwiIH1cbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgIF9jKFwiZGl2XCIsIHsgc3RhdGljQ2xhc3M6IFwiY29udHJvbC1ncm91cFwiIH0sIFtcbiAgICAgICAgICAgICAgICAgIF9jKFwibGFiZWxcIiwgeyBzdGF0aWNDbGFzczogXCJjb250cm9sLWxhYmVsXCIgfSwgW1xuICAgICAgICAgICAgICAgICAgICBfdm0uX3YoXCJTZWxlY3QgT2ZmaWNlOlwiKVxuICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICBfdm0uX3YoXCIgXCIpLFxuICAgICAgICAgICAgICAgICAgX2MoXCJkaXZcIiwgeyBzdGF0aWNDbGFzczogXCJjb250cm9sc1wiIH0sIFtcbiAgICAgICAgICAgICAgICAgICAgX3ZtLmVtcHMuaXRlbXNcbiAgICAgICAgICAgICAgICAgICAgICA/IF9jKFxuICAgICAgICAgICAgICAgICAgICAgICAgICBcInNlbGVjdFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICB7IGF0dHJzOiB7IG5hbWU6IFwidHlwZV9lbXBcIiwgaWQ6IFwidHlwZV9lbXBcIiB9IH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgIF92bS5fbChfdm0uZW1wcy5pdGVtcywgZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBfYyhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwib3B0aW9uXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IGRvbVByb3BzOiB7IHZhbHVlOiBpdGVtLmlkIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtfdm0uX3YoX3ZtLl9zKGl0ZW0ubmFtZSkpXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICA6IF92bS5fZSgpXG4gICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgIF92bS5fdihcIiBcIiksXG4gICAgICAgICAgICAgICAgX3ZtLl9tKDEpLFxuICAgICAgICAgICAgICAgIF92bS5fdihcIiBcIiksXG4gICAgICAgICAgICAgICAgX3ZtLl9tKDIpLFxuICAgICAgICAgICAgICAgIF92bS5fdihcIiBcIiksXG4gICAgICAgICAgICAgICAgX3ZtLl9tKDMpLFxuICAgICAgICAgICAgICAgIF92bS5fdihcIiBcIiksXG4gICAgICAgICAgICAgICAgX3ZtLl9tKDQpLFxuICAgICAgICAgICAgICAgIF92bS5fdihcIiBcIiksXG4gICAgICAgICAgICAgICAgX3ZtLl9tKDUpLFxuICAgICAgICAgICAgICAgIF92bS5fdihcIiBcIiksXG4gICAgICAgICAgICAgICAgX3ZtLl9tKDYpLFxuICAgICAgICAgICAgICAgIF92bS5fdihcIiBcIiksXG4gICAgICAgICAgICAgICAgX3ZtLl9tKDcpXG4gICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIClcbiAgICAgICAgICBdKVxuICAgICAgICBdKVxuICAgICAgXSlcbiAgICBdKVxuICBdKVxufVxudmFyIHN0YXRpY1JlbmRlckZucyA9IFtcbiAgZnVuY3Rpb24oKSB7XG4gICAgdmFyIF92bSA9IHRoaXNcbiAgICB2YXIgX2ggPSBfdm0uJGNyZWF0ZUVsZW1lbnRcbiAgICB2YXIgX2MgPSBfdm0uX3NlbGYuX2MgfHwgX2hcbiAgICByZXR1cm4gX2MoXCJkaXZcIiwgeyBzdGF0aWNDbGFzczogXCJ3aWRnZXQtdGl0bGVcIiB9LCBbXG4gICAgICBfYyhcInNwYW5cIiwgeyBzdGF0aWNDbGFzczogXCJpY29uXCIgfSwgW1xuICAgICAgICBfYyhcImlcIiwgeyBzdGF0aWNDbGFzczogXCJpY29uLWFsaWduLWp1c3RpZnlcIiB9KVxuICAgICAgXSksXG4gICAgICBfdm0uX3YoXCIgXCIpLFxuICAgICAgX2MoXCJoNVwiLCBbX3ZtLl92KFwiRW1wbG95ZWUgTmV3XCIpXSlcbiAgICBdKVxuICB9LFxuICBmdW5jdGlvbigpIHtcbiAgICB2YXIgX3ZtID0gdGhpc1xuICAgIHZhciBfaCA9IF92bS4kY3JlYXRlRWxlbWVudFxuICAgIHZhciBfYyA9IF92bS5fc2VsZi5fYyB8fCBfaFxuICAgIHJldHVybiBfYyhcImRpdlwiLCB7IHN0YXRpY0NsYXNzOiBcImNvbnRyb2wtZ3JvdXBcIiB9LCBbXG4gICAgICBfYyhcImxhYmVsXCIsIHsgc3RhdGljQ2xhc3M6IFwiY29udHJvbC1sYWJlbFwiIH0sIFtfdm0uX3YoXCJJbWFnZTpcIildKSxcbiAgICAgIF92bS5fdihcIiBcIiksXG4gICAgICBfYyhcImRpdlwiLCB7IHN0YXRpY0NsYXNzOiBcImNvbnRyb2xzXCIgfSwgW1xuICAgICAgICBfYyhcImlucHV0XCIsIHsgYXR0cnM6IHsgdHlwZTogXCJmaWxlXCIsIG5hbWU6IFwiaW1hZ2VcIiB9IH0pXG4gICAgICBdKVxuICAgIF0pXG4gIH0sXG4gIGZ1bmN0aW9uKCkge1xuICAgIHZhciBfdm0gPSB0aGlzXG4gICAgdmFyIF9oID0gX3ZtLiRjcmVhdGVFbGVtZW50XG4gICAgdmFyIF9jID0gX3ZtLl9zZWxmLl9jIHx8IF9oXG4gICAgcmV0dXJuIF9jKFwiZGl2XCIsIHsgc3RhdGljQ2xhc3M6IFwiY29udHJvbC1ncm91cFwiIH0sIFtcbiAgICAgIF9jKFwibGFiZWxcIiwgeyBzdGF0aWNDbGFzczogXCJjb250cm9sLWxhYmVsXCIgfSwgW192bS5fdihcIkZpcnN0IE5hbWU6XCIpXSksXG4gICAgICBfdm0uX3YoXCIgXCIpLFxuICAgICAgX2MoXCJkaXZcIiwgeyBzdGF0aWNDbGFzczogXCJjb250cm9sc1wiIH0sIFtcbiAgICAgICAgX2MoXCJpbnB1dFwiLCB7XG4gICAgICAgICAgYXR0cnM6IHsgdHlwZTogXCJ0ZXh0XCIsIG5hbWU6IFwiZmlyc3ROYW1lXCIsIGlkOiBcImZpcnN0TmFtZVwiIH1cbiAgICAgICAgfSlcbiAgICAgIF0pXG4gICAgXSlcbiAgfSxcbiAgZnVuY3Rpb24oKSB7XG4gICAgdmFyIF92bSA9IHRoaXNcbiAgICB2YXIgX2ggPSBfdm0uJGNyZWF0ZUVsZW1lbnRcbiAgICB2YXIgX2MgPSBfdm0uX3NlbGYuX2MgfHwgX2hcbiAgICByZXR1cm4gX2MoXCJkaXZcIiwgeyBzdGF0aWNDbGFzczogXCJjb250cm9sLWdyb3VwXCIgfSwgW1xuICAgICAgX2MoXCJsYWJlbFwiLCB7IHN0YXRpY0NsYXNzOiBcImNvbnRyb2wtbGFiZWxcIiB9LCBbX3ZtLl92KFwiTGFzdCBOYW1lOlwiKV0pLFxuICAgICAgX3ZtLl92KFwiIFwiKSxcbiAgICAgIF9jKFwiZGl2XCIsIHsgc3RhdGljQ2xhc3M6IFwiY29udHJvbHNcIiB9LCBbXG4gICAgICAgIF9jKFwiaW5wdXRcIiwge1xuICAgICAgICAgIGF0dHJzOiB7IHR5cGU6IFwidGV4dFwiLCBuYW1lOiBcImxhc3ROYW1lXCIsIGlkOiBcImxhc3ROYW1lXCIgfVxuICAgICAgICB9KVxuICAgICAgXSlcbiAgICBdKVxuICB9LFxuICBmdW5jdGlvbigpIHtcbiAgICB2YXIgX3ZtID0gdGhpc1xuICAgIHZhciBfaCA9IF92bS4kY3JlYXRlRWxlbWVudFxuICAgIHZhciBfYyA9IF92bS5fc2VsZi5fYyB8fCBfaFxuICAgIHJldHVybiBfYyhcImRpdlwiLCB7IHN0YXRpY0NsYXNzOiBcImNvbnRyb2wtZ3JvdXBcIiB9LCBbXG4gICAgICBfYyhcImxhYmVsXCIsIHsgc3RhdGljQ2xhc3M6IFwiY29udHJvbC1sYWJlbFwiIH0sIFtfdm0uX3YoXCJHZW5kZXI6XCIpXSksXG4gICAgICBfdm0uX3YoXCIgXCIpLFxuICAgICAgX2MoXCJkaXZcIiwgeyBzdGF0aWNDbGFzczogXCJjb250cm9sc1wiIH0sIFtcbiAgICAgICAgX2MoXCJsYWJlbFwiLCBbXG4gICAgICAgICAgX2MoXCJpbnB1dFwiLCB7IGF0dHJzOiB7IHR5cGU6IFwicmFkaW9cIiwgbmFtZTogXCJtYWxlXCIgfSB9KSxcbiAgICAgICAgICBfdm0uX3YoXCJcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBNYWxlXCIpXG4gICAgICAgIF0pLFxuICAgICAgICBfdm0uX3YoXCIgXCIpLFxuICAgICAgICBfYyhcImxhYmVsXCIsIFtcbiAgICAgICAgICBfYyhcImlucHV0XCIsIHsgYXR0cnM6IHsgdHlwZTogXCJyYWRpb1wiLCBuYW1lOiBcImZlbWFsZVwiIH0gfSksXG4gICAgICAgICAgX3ZtLl92KFwiXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgRmVtYWxlXCIpXG4gICAgICAgIF0pXG4gICAgICBdKVxuICAgIF0pXG4gIH0sXG4gIGZ1bmN0aW9uKCkge1xuICAgIHZhciBfdm0gPSB0aGlzXG4gICAgdmFyIF9oID0gX3ZtLiRjcmVhdGVFbGVtZW50XG4gICAgdmFyIF9jID0gX3ZtLl9zZWxmLl9jIHx8IF9oXG4gICAgcmV0dXJuIF9jKFwiZGl2XCIsIHsgc3RhdGljQ2xhc3M6IFwiY29udHJvbC1ncm91cFwiIH0sIFtcbiAgICAgIF9jKFwibGFiZWxcIiwgeyBzdGF0aWNDbGFzczogXCJjb250cm9sLWxhYmVsXCIgfSwgW192bS5fdihcIkVtYWlsOlwiKV0pLFxuICAgICAgX3ZtLl92KFwiIFwiKSxcbiAgICAgIF9jKFwiZGl2XCIsIHsgc3RhdGljQ2xhc3M6IFwiY29udHJvbHNcIiB9LCBbXG4gICAgICAgIF9jKFwiaW5wdXRcIiwgeyBhdHRyczogeyB0eXBlOiBcInRleHRcIiwgbmFtZTogXCJlbWFpbFwiLCBpZDogXCJlbWFpbFwiIH0gfSlcbiAgICAgIF0pXG4gICAgXSlcbiAgfSxcbiAgZnVuY3Rpb24oKSB7XG4gICAgdmFyIF92bSA9IHRoaXNcbiAgICB2YXIgX2ggPSBfdm0uJGNyZWF0ZUVsZW1lbnRcbiAgICB2YXIgX2MgPSBfdm0uX3NlbGYuX2MgfHwgX2hcbiAgICByZXR1cm4gX2MoXCJkaXZcIiwgeyBzdGF0aWNDbGFzczogXCJjb250cm9sLWdyb3VwXCIgfSwgW1xuICAgICAgX2MoXCJsYWJlbFwiLCB7IHN0YXRpY0NsYXNzOiBcImNvbnRyb2wtbGFiZWxcIiB9LCBbX3ZtLl92KFwiUGhvbmU6XCIpXSksXG4gICAgICBfdm0uX3YoXCIgXCIpLFxuICAgICAgX2MoXCJkaXZcIiwgeyBzdGF0aWNDbGFzczogXCJjb250cm9sc1wiIH0sIFtcbiAgICAgICAgX2MoXCJpbnB1dFwiLCB7IGF0dHJzOiB7IHR5cGU6IFwibnVtYmVyXCIsIG5hbWU6IFwicGhvbmVcIiwgaWQ6IFwicGhvbmVcIiB9IH0pXG4gICAgICBdKVxuICAgIF0pXG4gIH0sXG4gIGZ1bmN0aW9uKCkge1xuICAgIHZhciBfdm0gPSB0aGlzXG4gICAgdmFyIF9oID0gX3ZtLiRjcmVhdGVFbGVtZW50XG4gICAgdmFyIF9jID0gX3ZtLl9zZWxmLl9jIHx8IF9oXG4gICAgcmV0dXJuIF9jKFwiZGl2XCIsIHsgc3RhdGljQ2xhc3M6IFwiZm9ybS1hY3Rpb25zXCIgfSwgW1xuICAgICAgX2MoXG4gICAgICAgIFwiYnV0dG9uXCIsXG4gICAgICAgIHtcbiAgICAgICAgICBzdGF0aWNDbGFzczogXCJidG4gYnRuLXN1Y2Nlc3NcIixcbiAgICAgICAgICBhdHRyczogeyB0eXBlOiBcInN1Ym1pdFwiLCBuYW1lOiBcInNhdmVFbXBcIiwgaWQ6IFwic2F2ZUVtcFwiIH1cbiAgICAgICAgfSxcbiAgICAgICAgW192bS5fdihcIlNhdmVcIildXG4gICAgICApXG4gICAgXSlcbiAgfVxuXVxucmVuZGVyLl93aXRoU3RyaXBwZWQgPSB0cnVlXG5tb2R1bGUuZXhwb3J0cyA9IHsgcmVuZGVyOiByZW5kZXIsIHN0YXRpY1JlbmRlckZuczogc3RhdGljUmVuZGVyRm5zIH1cbmlmIChtb2R1bGUuaG90KSB7XG4gIG1vZHVsZS5ob3QuYWNjZXB0KClcbiAgaWYgKG1vZHVsZS5ob3QuZGF0YSkge1xuICAgIHJlcXVpcmUoXCJ2dWUtaG90LXJlbG9hZC1hcGlcIikgICAgICAucmVyZW5kZXIoXCJkYXRhLXYtMzAwYTE0MDlcIiwgbW9kdWxlLmV4cG9ydHMpXG4gIH1cbn1cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2xpYi90ZW1wbGF0ZS1jb21waWxlcj97XCJpZFwiOlwiZGF0YS12LTMwMGExNDA5XCIsXCJoYXNTY29wZWRcIjpmYWxzZSxcImJ1YmxlXCI6e1widHJhbnNmb3Jtc1wiOnt9fX0hLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvc2VsZWN0b3IuanM/dHlwZT10ZW1wbGF0ZSZpbmRleD0wIS4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9jb21wb25lbnRzL3ZpZXdzL2VtcGxveWVlL0VtcGxveWVlTmV3LnZ1ZVxuLy8gbW9kdWxlIGlkID0gNjNcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIGRpc3Bvc2VkID0gZmFsc2VcbnZhciBub3JtYWxpemVDb21wb25lbnQgPSByZXF1aXJlKFwiIS4uLy4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2xpYi9jb21wb25lbnQtbm9ybWFsaXplclwiKVxuLyogc2NyaXB0ICovXG52YXIgX192dWVfc2NyaXB0X18gPSByZXF1aXJlKFwiISFiYWJlbC1sb2FkZXI/e1xcXCJjYWNoZURpcmVjdG9yeVxcXCI6dHJ1ZSxcXFwicHJlc2V0c1xcXCI6W1tcXFwiZW52XFxcIix7XFxcIm1vZHVsZXNcXFwiOmZhbHNlLFxcXCJ0YXJnZXRzXFxcIjp7XFxcImJyb3dzZXJzXFxcIjpbXFxcIj4gMiVcXFwiXSxcXFwidWdsaWZ5XFxcIjp0cnVlfX1dXSxcXFwicGx1Z2luc1xcXCI6W1xcXCJ0cmFuc2Zvcm0tb2JqZWN0LXJlc3Qtc3ByZWFkXFxcIixbXFxcInRyYW5zZm9ybS1ydW50aW1lXFxcIix7XFxcInBvbHlmaWxsXFxcIjpmYWxzZSxcXFwiaGVscGVyc1xcXCI6ZmFsc2V9XV19IS4uLy4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2xpYi9zZWxlY3Rvcj90eXBlPXNjcmlwdCZpbmRleD0wIS4vRW1wbG95ZWVEZXRhaWwudnVlXCIpXG4vKiB0ZW1wbGF0ZSAqL1xudmFyIF9fdnVlX3RlbXBsYXRlX18gPSByZXF1aXJlKFwiISEuLi8uLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvdGVtcGxhdGUtY29tcGlsZXIvaW5kZXg/e1xcXCJpZFxcXCI6XFxcImRhdGEtdi0xNTY4NTRmOFxcXCIsXFxcImhhc1Njb3BlZFxcXCI6ZmFsc2UsXFxcImJ1YmxlXFxcIjp7XFxcInRyYW5zZm9ybXNcXFwiOnt9fX0hLi4vLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL3NlbGVjdG9yP3R5cGU9dGVtcGxhdGUmaW5kZXg9MCEuL0VtcGxveWVlRGV0YWlsLnZ1ZVwiKVxuLyogdGVtcGxhdGUgZnVuY3Rpb25hbCAqL1xudmFyIF9fdnVlX3RlbXBsYXRlX2Z1bmN0aW9uYWxfXyA9IGZhbHNlXG4vKiBzdHlsZXMgKi9cbnZhciBfX3Z1ZV9zdHlsZXNfXyA9IG51bGxcbi8qIHNjb3BlSWQgKi9cbnZhciBfX3Z1ZV9zY29wZUlkX18gPSBudWxsXG4vKiBtb2R1bGVJZGVudGlmaWVyIChzZXJ2ZXIgb25seSkgKi9cbnZhciBfX3Z1ZV9tb2R1bGVfaWRlbnRpZmllcl9fID0gbnVsbFxudmFyIENvbXBvbmVudCA9IG5vcm1hbGl6ZUNvbXBvbmVudChcbiAgX192dWVfc2NyaXB0X18sXG4gIF9fdnVlX3RlbXBsYXRlX18sXG4gIF9fdnVlX3RlbXBsYXRlX2Z1bmN0aW9uYWxfXyxcbiAgX192dWVfc3R5bGVzX18sXG4gIF9fdnVlX3Njb3BlSWRfXyxcbiAgX192dWVfbW9kdWxlX2lkZW50aWZpZXJfX1xuKVxuQ29tcG9uZW50Lm9wdGlvbnMuX19maWxlID0gXCJyZXNvdXJjZXNcXFxcYXNzZXRzXFxcXGpzXFxcXGNvbXBvbmVudHNcXFxcdmlld3NcXFxcZW1wbG95ZWVcXFxcRW1wbG95ZWVEZXRhaWwudnVlXCJcblxuLyogaG90IHJlbG9hZCAqL1xuaWYgKG1vZHVsZS5ob3QpIHsoZnVuY3Rpb24gKCkge1xuICB2YXIgaG90QVBJID0gcmVxdWlyZShcInZ1ZS1ob3QtcmVsb2FkLWFwaVwiKVxuICBob3RBUEkuaW5zdGFsbChyZXF1aXJlKFwidnVlXCIpLCBmYWxzZSlcbiAgaWYgKCFob3RBUEkuY29tcGF0aWJsZSkgcmV0dXJuXG4gIG1vZHVsZS5ob3QuYWNjZXB0KClcbiAgaWYgKCFtb2R1bGUuaG90LmRhdGEpIHtcbiAgICBob3RBUEkuY3JlYXRlUmVjb3JkKFwiZGF0YS12LTE1Njg1NGY4XCIsIENvbXBvbmVudC5vcHRpb25zKVxuICB9IGVsc2Uge1xuICAgIGhvdEFQSS5yZWxvYWQoXCJkYXRhLXYtMTU2ODU0ZjhcIiwgQ29tcG9uZW50Lm9wdGlvbnMpXG4gIH1cbiAgbW9kdWxlLmhvdC5kaXNwb3NlKGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgZGlzcG9zZWQgPSB0cnVlXG4gIH0pXG59KSgpfVxuXG5tb2R1bGUuZXhwb3J0cyA9IENvbXBvbmVudC5leHBvcnRzXG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3Jlc291cmNlcy9hc3NldHMvanMvY29tcG9uZW50cy92aWV3cy9lbXBsb3llZS9FbXBsb3llZURldGFpbC52dWVcbi8vIG1vZHVsZSBpZCA9IDY0XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIjx0ZW1wbGF0ZT5cclxuICAgIDxkaXY+XHJcbiAgICAgICAgRW1wbG95ZWUgRGV0YWlsXHJcbiAgICA8L2Rpdj5cclxuPC90ZW1wbGF0ZT5cclxuPHNjcmlwdD5cclxuICAgIGV4cG9ydCBkZWZhdWx0IHtcclxuXHJcbiAgICB9XHJcbjwvc2NyaXB0PlxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyByZXNvdXJjZXMvYXNzZXRzL2pzL2NvbXBvbmVudHMvdmlld3MvZW1wbG95ZWUvRW1wbG95ZWVEZXRhaWwudnVlIiwidmFyIHJlbmRlciA9IGZ1bmN0aW9uKCkge1xuICB2YXIgX3ZtID0gdGhpc1xuICB2YXIgX2ggPSBfdm0uJGNyZWF0ZUVsZW1lbnRcbiAgdmFyIF9jID0gX3ZtLl9zZWxmLl9jIHx8IF9oXG4gIHJldHVybiBfYyhcImRpdlwiLCBbX3ZtLl92KFwiXFxuICAgIEVtcGxveWVlIERldGFpbFxcblwiKV0pXG59XG52YXIgc3RhdGljUmVuZGVyRm5zID0gW11cbnJlbmRlci5fd2l0aFN0cmlwcGVkID0gdHJ1ZVxubW9kdWxlLmV4cG9ydHMgPSB7IHJlbmRlcjogcmVuZGVyLCBzdGF0aWNSZW5kZXJGbnM6IHN0YXRpY1JlbmRlckZucyB9XG5pZiAobW9kdWxlLmhvdCkge1xuICBtb2R1bGUuaG90LmFjY2VwdCgpXG4gIGlmIChtb2R1bGUuaG90LmRhdGEpIHtcbiAgICByZXF1aXJlKFwidnVlLWhvdC1yZWxvYWQtYXBpXCIpICAgICAgLnJlcmVuZGVyKFwiZGF0YS12LTE1Njg1NGY4XCIsIG1vZHVsZS5leHBvcnRzKVxuICB9XG59XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvdGVtcGxhdGUtY29tcGlsZXI/e1wiaWRcIjpcImRhdGEtdi0xNTY4NTRmOFwiLFwiaGFzU2NvcGVkXCI6ZmFsc2UsXCJidWJsZVwiOntcInRyYW5zZm9ybXNcIjp7fX19IS4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL3NlbGVjdG9yLmpzP3R5cGU9dGVtcGxhdGUmaW5kZXg9MCEuL3Jlc291cmNlcy9hc3NldHMvanMvY29tcG9uZW50cy92aWV3cy9lbXBsb3llZS9FbXBsb3llZURldGFpbC52dWVcbi8vIG1vZHVsZSBpZCA9IDY2XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciBkaXNwb3NlZCA9IGZhbHNlXG52YXIgbm9ybWFsaXplQ29tcG9uZW50ID0gcmVxdWlyZShcIiEuLi8uLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvY29tcG9uZW50LW5vcm1hbGl6ZXJcIilcbi8qIHNjcmlwdCAqL1xudmFyIF9fdnVlX3NjcmlwdF9fID0gcmVxdWlyZShcIiEhYmFiZWwtbG9hZGVyP3tcXFwiY2FjaGVEaXJlY3RvcnlcXFwiOnRydWUsXFxcInByZXNldHNcXFwiOltbXFxcImVudlxcXCIse1xcXCJtb2R1bGVzXFxcIjpmYWxzZSxcXFwidGFyZ2V0c1xcXCI6e1xcXCJicm93c2Vyc1xcXCI6W1xcXCI+IDIlXFxcIl0sXFxcInVnbGlmeVxcXCI6dHJ1ZX19XV0sXFxcInBsdWdpbnNcXFwiOltcXFwidHJhbnNmb3JtLW9iamVjdC1yZXN0LXNwcmVhZFxcXCIsW1xcXCJ0cmFuc2Zvcm0tcnVudGltZVxcXCIse1xcXCJwb2x5ZmlsbFxcXCI6ZmFsc2UsXFxcImhlbHBlcnNcXFwiOmZhbHNlfV1dfSEuLi8uLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvc2VsZWN0b3I/dHlwZT1zY3JpcHQmaW5kZXg9MCEuL1NpZGViYXIudnVlXCIpXG4vKiB0ZW1wbGF0ZSAqL1xudmFyIF9fdnVlX3RlbXBsYXRlX18gPSByZXF1aXJlKFwiISEuLi8uLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvdGVtcGxhdGUtY29tcGlsZXIvaW5kZXg/e1xcXCJpZFxcXCI6XFxcImRhdGEtdi0xYjgwMDk5OFxcXCIsXFxcImhhc1Njb3BlZFxcXCI6ZmFsc2UsXFxcImJ1YmxlXFxcIjp7XFxcInRyYW5zZm9ybXNcXFwiOnt9fX0hLi4vLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL3NlbGVjdG9yP3R5cGU9dGVtcGxhdGUmaW5kZXg9MCEuL1NpZGViYXIudnVlXCIpXG4vKiB0ZW1wbGF0ZSBmdW5jdGlvbmFsICovXG52YXIgX192dWVfdGVtcGxhdGVfZnVuY3Rpb25hbF9fID0gZmFsc2Vcbi8qIHN0eWxlcyAqL1xudmFyIF9fdnVlX3N0eWxlc19fID0gbnVsbFxuLyogc2NvcGVJZCAqL1xudmFyIF9fdnVlX3Njb3BlSWRfXyA9IG51bGxcbi8qIG1vZHVsZUlkZW50aWZpZXIgKHNlcnZlciBvbmx5KSAqL1xudmFyIF9fdnVlX21vZHVsZV9pZGVudGlmaWVyX18gPSBudWxsXG52YXIgQ29tcG9uZW50ID0gbm9ybWFsaXplQ29tcG9uZW50KFxuICBfX3Z1ZV9zY3JpcHRfXyxcbiAgX192dWVfdGVtcGxhdGVfXyxcbiAgX192dWVfdGVtcGxhdGVfZnVuY3Rpb25hbF9fLFxuICBfX3Z1ZV9zdHlsZXNfXyxcbiAgX192dWVfc2NvcGVJZF9fLFxuICBfX3Z1ZV9tb2R1bGVfaWRlbnRpZmllcl9fXG4pXG5Db21wb25lbnQub3B0aW9ucy5fX2ZpbGUgPSBcInJlc291cmNlc1xcXFxhc3NldHNcXFxcanNcXFxcY29tcG9uZW50c1xcXFx2aWV3c1xcXFxsYXlvdXRzXFxcXFNpZGViYXIudnVlXCJcblxuLyogaG90IHJlbG9hZCAqL1xuaWYgKG1vZHVsZS5ob3QpIHsoZnVuY3Rpb24gKCkge1xuICB2YXIgaG90QVBJID0gcmVxdWlyZShcInZ1ZS1ob3QtcmVsb2FkLWFwaVwiKVxuICBob3RBUEkuaW5zdGFsbChyZXF1aXJlKFwidnVlXCIpLCBmYWxzZSlcbiAgaWYgKCFob3RBUEkuY29tcGF0aWJsZSkgcmV0dXJuXG4gIG1vZHVsZS5ob3QuYWNjZXB0KClcbiAgaWYgKCFtb2R1bGUuaG90LmRhdGEpIHtcbiAgICBob3RBUEkuY3JlYXRlUmVjb3JkKFwiZGF0YS12LTFiODAwOTk4XCIsIENvbXBvbmVudC5vcHRpb25zKVxuICB9IGVsc2Uge1xuICAgIGhvdEFQSS5yZWxvYWQoXCJkYXRhLXYtMWI4MDA5OThcIiwgQ29tcG9uZW50Lm9wdGlvbnMpXG4gIH1cbiAgbW9kdWxlLmhvdC5kaXNwb3NlKGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgZGlzcG9zZWQgPSB0cnVlXG4gIH0pXG59KSgpfVxuXG5tb2R1bGUuZXhwb3J0cyA9IENvbXBvbmVudC5leHBvcnRzXG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3Jlc291cmNlcy9hc3NldHMvanMvY29tcG9uZW50cy92aWV3cy9sYXlvdXRzL1NpZGViYXIudnVlXG4vLyBtb2R1bGUgaWQgPSA2N1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCI8dGVtcGxhdGU+XHJcbiAgICA8ZGl2IGlkPVwic2lkZWJhclwiPiA8YSBocmVmPVwiI1wiIGNsYXNzPVwidmlzaWJsZS1waG9uZVwiPjxpIGNsYXNzPVwiaWNvbiBpY29uLXRoLWxpc3RcIj48L2k+IFRhYmxlczwvYT5cclxuICAgICAgICA8dWw+XHJcbiAgICAgICAgICAgIDxsaSBjbGFzcz1cImFjdGl2ZVwiPjxyb3V0ZXItbGluayA6dG89XCJ7bmFtZTogJ2hvbWUnfVwiPjxpIGNsYXNzPVwiaWNvbiBpY29uLWhvbWVcIj48L2k+IDxzcGFuPkRhc2hib2FyZDwvc3Bhbj48L3JvdXRlci1saW5rPjwvbGk+XHJcbiAgICAgICAgICAgIDxsaSBjbGFzcz1cImFjdGl2ZVwiIHYtaWY9XCJtZW51c1wiPjxpIGNsYXNzPVwiaWNvbiBpY29uLXRoLWxpc3RcIj48L2k+IDxzcGFuPk1lbnU8L3NwYW4+PHNwYW4gY2xhc3M9XCJsYWJlbCBsYWJlbC1pbXBvcnRhbnRcIj57e21lbnVzLmxlbmd0aH19PC9zcGFuPlxyXG4gICAgICAgICAgICAgICAgPHVsPlxyXG4gICAgICAgICAgICAgICAgICAgIDxsaSB2LWZvcj1cIm1lbnUgaW4gbWVudXNcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4+e3ttZW51Lm5hbWV9fTwvc3Bhbj5cclxuICAgICAgICAgICAgICAgICAgICA8L2xpPlxyXG4gICAgICAgICAgICAgICAgPC91bD5cclxuICAgICAgICAgICAgPC9saT5cclxuICAgICAgICAgICAgPGxpIGNsYXNzPVwiYWN0aXZlXCI+PHJvdXRlci1saW5rIDp0bz1cIntuYW1lOiAnZW1wbG95ZWUtbGlzdCd9XCI+PHNwYW4+RW1wbG95ZWU8L3NwYW4+PC9yb3V0ZXItbGluaz5cclxuICAgICAgICAgICAgPC9saT5cclxuICAgICAgICA8L3VsPlxyXG4gICAgPC9kaXY+XHJcbjwvdGVtcGxhdGU+XHJcbjxzY3JpcHQ+XHJcbiAgICBpbXBvcnQgVnVlIGZyb20gJ3Z1ZSdcclxuICAgIGltcG9ydCBheGlvcyBmcm9tICdheGlvcydcclxuICAgIGV4cG9ydCBkZWZhdWx0IHtcclxuICAgICAgICBuYW1lOiAnc2lkZWJhcicsXHJcbiAgICAgICAgZGF0YSAoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICBtZW51czogW10sXHJcbiAgICAgICAgICAgICAgICBlcnJvcnM6IFtdXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIG1vdW50ZWQgKCkge1xyXG4gICAgICAgICAgICBheGlvcy5nZXQoJy9hcGkvbWVudScpLnRoZW4ocmVzcG9uc2UgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5tZW51cyA9IHJlc3BvbnNlLmRhdGFcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLmNhdGNoKGUgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5lcnJvcnMucHVzaChlKVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbjwvc2NyaXB0PlxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyByZXNvdXJjZXMvYXNzZXRzL2pzL2NvbXBvbmVudHMvdmlld3MvbGF5b3V0cy9TaWRlYmFyLnZ1ZSIsInZhciByZW5kZXIgPSBmdW5jdGlvbigpIHtcbiAgdmFyIF92bSA9IHRoaXNcbiAgdmFyIF9oID0gX3ZtLiRjcmVhdGVFbGVtZW50XG4gIHZhciBfYyA9IF92bS5fc2VsZi5fYyB8fCBfaFxuICByZXR1cm4gX2MoXCJkaXZcIiwgeyBhdHRyczogeyBpZDogXCJzaWRlYmFyXCIgfSB9LCBbXG4gICAgX3ZtLl9tKDApLFxuICAgIF92bS5fdihcIiBcIiksXG4gICAgX2MoXCJ1bFwiLCBbXG4gICAgICBfYyhcbiAgICAgICAgXCJsaVwiLFxuICAgICAgICB7IHN0YXRpY0NsYXNzOiBcImFjdGl2ZVwiIH0sXG4gICAgICAgIFtcbiAgICAgICAgICBfYyhcInJvdXRlci1saW5rXCIsIHsgYXR0cnM6IHsgdG86IHsgbmFtZTogXCJob21lXCIgfSB9IH0sIFtcbiAgICAgICAgICAgIF9jKFwiaVwiLCB7IHN0YXRpY0NsYXNzOiBcImljb24gaWNvbi1ob21lXCIgfSksXG4gICAgICAgICAgICBfdm0uX3YoXCIgXCIpLFxuICAgICAgICAgICAgX2MoXCJzcGFuXCIsIFtfdm0uX3YoXCJEYXNoYm9hcmRcIildKVxuICAgICAgICAgIF0pXG4gICAgICAgIF0sXG4gICAgICAgIDFcbiAgICAgICksXG4gICAgICBfdm0uX3YoXCIgXCIpLFxuICAgICAgX3ZtLm1lbnVzXG4gICAgICAgID8gX2MoXCJsaVwiLCB7IHN0YXRpY0NsYXNzOiBcImFjdGl2ZVwiIH0sIFtcbiAgICAgICAgICAgIF9jKFwiaVwiLCB7IHN0YXRpY0NsYXNzOiBcImljb24gaWNvbi10aC1saXN0XCIgfSksXG4gICAgICAgICAgICBfdm0uX3YoXCIgXCIpLFxuICAgICAgICAgICAgX2MoXCJzcGFuXCIsIFtfdm0uX3YoXCJNZW51XCIpXSksXG4gICAgICAgICAgICBfYyhcInNwYW5cIiwgeyBzdGF0aWNDbGFzczogXCJsYWJlbCBsYWJlbC1pbXBvcnRhbnRcIiB9LCBbXG4gICAgICAgICAgICAgIF92bS5fdihfdm0uX3MoX3ZtLm1lbnVzLmxlbmd0aCkpXG4gICAgICAgICAgICBdKSxcbiAgICAgICAgICAgIF92bS5fdihcIiBcIiksXG4gICAgICAgICAgICBfYyhcbiAgICAgICAgICAgICAgXCJ1bFwiLFxuICAgICAgICAgICAgICBfdm0uX2woX3ZtLm1lbnVzLCBmdW5jdGlvbihtZW51KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9jKFwibGlcIiwgW19jKFwic3BhblwiLCBbX3ZtLl92KF92bS5fcyhtZW51Lm5hbWUpKV0pXSlcbiAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIClcbiAgICAgICAgICBdKVxuICAgICAgICA6IF92bS5fZSgpLFxuICAgICAgX3ZtLl92KFwiIFwiKSxcbiAgICAgIF9jKFxuICAgICAgICBcImxpXCIsXG4gICAgICAgIHsgc3RhdGljQ2xhc3M6IFwiYWN0aXZlXCIgfSxcbiAgICAgICAgW1xuICAgICAgICAgIF9jKFwicm91dGVyLWxpbmtcIiwgeyBhdHRyczogeyB0bzogeyBuYW1lOiBcImVtcGxveWVlLWxpc3RcIiB9IH0gfSwgW1xuICAgICAgICAgICAgX2MoXCJzcGFuXCIsIFtfdm0uX3YoXCJFbXBsb3llZVwiKV0pXG4gICAgICAgICAgXSlcbiAgICAgICAgXSxcbiAgICAgICAgMVxuICAgICAgKVxuICAgIF0pXG4gIF0pXG59XG52YXIgc3RhdGljUmVuZGVyRm5zID0gW1xuICBmdW5jdGlvbigpIHtcbiAgICB2YXIgX3ZtID0gdGhpc1xuICAgIHZhciBfaCA9IF92bS4kY3JlYXRlRWxlbWVudFxuICAgIHZhciBfYyA9IF92bS5fc2VsZi5fYyB8fCBfaFxuICAgIHJldHVybiBfYyhcImFcIiwgeyBzdGF0aWNDbGFzczogXCJ2aXNpYmxlLXBob25lXCIsIGF0dHJzOiB7IGhyZWY6IFwiI1wiIH0gfSwgW1xuICAgICAgX2MoXCJpXCIsIHsgc3RhdGljQ2xhc3M6IFwiaWNvbiBpY29uLXRoLWxpc3RcIiB9KSxcbiAgICAgIF92bS5fdihcIiBUYWJsZXNcIilcbiAgICBdKVxuICB9XG5dXG5yZW5kZXIuX3dpdGhTdHJpcHBlZCA9IHRydWVcbm1vZHVsZS5leHBvcnRzID0geyByZW5kZXI6IHJlbmRlciwgc3RhdGljUmVuZGVyRm5zOiBzdGF0aWNSZW5kZXJGbnMgfVxuaWYgKG1vZHVsZS5ob3QpIHtcbiAgbW9kdWxlLmhvdC5hY2NlcHQoKVxuICBpZiAobW9kdWxlLmhvdC5kYXRhKSB7XG4gICAgcmVxdWlyZShcInZ1ZS1ob3QtcmVsb2FkLWFwaVwiKSAgICAgIC5yZXJlbmRlcihcImRhdGEtdi0xYjgwMDk5OFwiLCBtb2R1bGUuZXhwb3J0cylcbiAgfVxufVxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL3RlbXBsYXRlLWNvbXBpbGVyP3tcImlkXCI6XCJkYXRhLXYtMWI4MDA5OThcIixcImhhc1Njb3BlZFwiOmZhbHNlLFwiYnVibGVcIjp7XCJ0cmFuc2Zvcm1zXCI6e319fSEuL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2xpYi9zZWxlY3Rvci5qcz90eXBlPXRlbXBsYXRlJmluZGV4PTAhLi9yZXNvdXJjZXMvYXNzZXRzL2pzL2NvbXBvbmVudHMvdmlld3MvbGF5b3V0cy9TaWRlYmFyLnZ1ZVxuLy8gbW9kdWxlIGlkID0gNjlcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLy8gcmVtb3ZlZCBieSBleHRyYWN0LXRleHQtd2VicGFjay1wbHVnaW5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3Jlc291cmNlcy9hc3NldHMvc2Fzcy9hcHAuc2Nzc1xuLy8gbW9kdWxlIGlkID0gNzBcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLy8gcmVtb3ZlZCBieSBleHRyYWN0LXRleHQtd2VicGFjay1wbHVnaW5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3Jlc291cmNlcy9hc3NldHMvc2Fzcy9pbmMvbG9naW4uc2Nzc1xuLy8gbW9kdWxlIGlkID0gNzFcbi8vIG1vZHVsZSBjaHVua3MgPSAwIl0sInNvdXJjZVJvb3QiOiIifQ==