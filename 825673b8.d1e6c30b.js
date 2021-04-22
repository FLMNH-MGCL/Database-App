(window.webpackJsonp=window.webpackJsonp||[]).push([[11],{168:function(e,t,r){"use strict";r.r(t),t.default=r.p+"assets/images/advquerybuilder-8634c8015e5f287ab6d868086f73c9ef.png"},169:function(e,t,r){"use strict";r.r(t),t.default=r.p+"assets/images/advquerybuilderexample-da20e582aa828d9f44cc3dc5ea56ec82.png"},170:function(e,t,r){"use strict";r.r(t),t.default=r.p+"assets/images/advquerybuilderexample2-3607226fa63e7e891b124e4750f0fcff.png"},79:function(e,t,r){"use strict";r.r(t),r.d(t,"frontMatter",(function(){return o})),r.d(t,"metadata",(function(){return i})),r.d(t,"rightToc",(function(){return c})),r.d(t,"default",(function(){return s}));var n=r(3),a=(r(0),r(97));const o={id:"advancedbuilder",title:"Advanced Query Builder"},i={unversionedId:"advancedbuilder",id:"advancedbuilder",isDocsHomePage:!1,title:"Advanced Query Builder",description:"The Advanced Query Builder allows for more complex queries to be constructed without writing any SQL yourself.",source:"@site/docs/advancedbuilder.md",slug:"/advancedbuilder",permalink:"/spesql/docs/advancedbuilder",version:"current",sidebar:"docs",previous:{title:"Insert Single",permalink:"/spesql/docs/insertsingle"},next:{title:"Layout",permalink:"/spesql/docs/visualizationlayout"}},c=[{value:"Overview",id:"overview",children:[]},{value:"Conditional Statements",id:"conditional-statements",children:[]}],l={rightToc:c};function s({components:e,...t}){return Object(a.b)("wrapper",Object(n.a)({},l,t,{components:e,mdxType:"MDXLayout"}),Object(a.b)("p",null,"The Advanced Query Builder allows for more complex queries to be constructed without writing any SQL yourself."),Object(a.b)("img",{src:r(168).default,alt:"Select Query Form",class:"shadow round"}),Object(a.b)("h3",{id:"overview"},"Overview"),Object(a.b)("p",null,Object(a.b)("inlineCode",{parentName:"p"},"select"),", ",Object(a.b)("inlineCode",{parentName:"p"},"count")," and ",Object(a.b)("inlineCode",{parentName:"p"},"update")," queries may all be created in this modal. This is separate than the ",Object(a.b)("em",{parentName:"p"},"advanced")," options found in each of those modals, however, as there is no requirement to write your own SQL."),Object(a.b)("p",null,"There is a select input which triggers different forms to be rendered based on the query type you want to construct. They are largely similar to the forms found in their separate modals, as well."),Object(a.b)("h3",{id:"conditional-statements"},"Conditional Statements"),Object(a.b)("p",null,"The main difference between this modal and the corresponding modals for ",Object(a.b)("inlineCode",{parentName:"p"},"select"),", ",Object(a.b)("inlineCode",{parentName:"p"},"count")," and ",Object(a.b)("inlineCode",{parentName:"p"},"update"),", is the manner in which ",Object(a.b)("em",{parentName:"p"},"conditional statements")," are built."),Object(a.b)("p",null,"You construct ",Object(a.b)("em",{parentName:"p"},"groups")," of ",Object(a.b)("em",{parentName:"p"},"rules"),", in which groups are AND'd together and rules are either AND'd or OR'd together. Groups are indended in the UI, and there is a SQL preview which shows the equivalent SQL code for the form constructed. Below is a simple example:"),Object(a.b)("img",{src:r(169).default,alt:"Select Query Form",class:"shadow round"}),Object(a.b)("p",null,"In this case, the AND selected is not actually used since there is only one rule. If I were to add another rule in the form:"),Object(a.b)("img",{src:r(170).default,alt:"Select Query Form",class:"shadow round"}),Object(a.b)("p",null,"you can see they are now AND'd together."))}s.isMDXComponent=!0},97:function(e,t,r){"use strict";r.d(t,"a",(function(){return d})),r.d(t,"b",(function(){return f}));var n=r(0),a=r.n(n);function o(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function i(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function c(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?i(Object(r),!0).forEach((function(t){o(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):i(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function l(e,t){if(null==e)return{};var r,n,a=function(e,t){if(null==e)return{};var r,n,a={},o=Object.keys(e);for(n=0;n<o.length;n++)r=o[n],t.indexOf(r)>=0||(a[r]=e[r]);return a}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(n=0;n<o.length;n++)r=o[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(a[r]=e[r])}return a}var s=a.a.createContext({}),u=function(e){var t=a.a.useContext(s),r=t;return e&&(r="function"==typeof e?e(t):c(c({},t),e)),r},d=function(e){var t=u(e.components);return a.a.createElement(s.Provider,{value:t},e.children)},p={inlineCode:"code",wrapper:function(e){var t=e.children;return a.a.createElement(a.a.Fragment,{},t)}},b=a.a.forwardRef((function(e,t){var r=e.components,n=e.mdxType,o=e.originalType,i=e.parentName,s=l(e,["components","mdxType","originalType","parentName"]),d=u(r),b=n,f=d["".concat(i,".").concat(b)]||d[b]||p[b]||o;return r?a.a.createElement(f,c(c({ref:t},s),{},{components:r})):a.a.createElement(f,c({ref:t},s))}));function f(e,t){var r=arguments,n=t&&t.mdxType;if("string"==typeof e||n){var o=r.length,i=new Array(o);i[0]=b;var c={};for(var l in t)hasOwnProperty.call(t,l)&&(c[l]=t[l]);c.originalType=e,c.mdxType="string"==typeof e?e:n,i[1]=c;for(var s=2;s<o;s++)i[s]=r[s];return a.a.createElement.apply(null,i)}return a.a.createElement.apply(null,r)}b.displayName="MDXCreateElement"}}]);