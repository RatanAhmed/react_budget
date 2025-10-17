import{r as l,j as t,y as x}from"./app-CtJn7BAP.js";import{P as f}from"./PrimaryButton-E_e2Xg1j.js";import{I as d}from"./InputLabel-D8GhLFQ7.js";/**
 * @license lucide-react v0.545.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const v=s=>s.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase(),j=s=>s.replace(/^([A-Z])|[\s-_]+(\w)/g,(e,r,a)=>a?a.toUpperCase():r.toLowerCase()),c=s=>{const e=j(s);return e.charAt(0).toUpperCase()+e.slice(1)},u=(...s)=>s.filter((e,r,a)=>!!e&&e.trim()!==""&&a.indexOf(e)===r).join(" ").trim(),b=s=>{for(const e in s)if(e.startsWith("aria-")||e==="role"||e==="title")return!0};/**
 * @license lucide-react v0.545.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var w={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v0.545.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const C=l.forwardRef(({color:s="currentColor",size:e=24,strokeWidth:r=2,absoluteStrokeWidth:a,className:o="",children:n,iconNode:m,...i},p)=>l.createElement("svg",{ref:p,...w,width:e,height:e,stroke:s,strokeWidth:a?Number(r)*24/Number(e):r,className:u("lucide",o),...!n&&!b(i)&&{"aria-hidden":"true"},...i},[...m.map(([g,h])=>l.createElement(g,h)),...Array.isArray(n)?n:[n]]));/**
 * @license lucide-react v0.545.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const k=(s,e)=>{const r=l.forwardRef(({className:a,...o},n)=>l.createElement(C,{ref:n,iconNode:e,className:u(`lucide-${v(c(s))}`,`lucide-${s}`,a),...o}));return r.displayName=c(s),r};/**
 * @license lucide-react v0.545.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const y=[["path",{d:"M10 20a1 1 0 0 0 .553.895l2 1A1 1 0 0 0 14 21v-7a2 2 0 0 1 .517-1.341L21.74 4.67A1 1 0 0 0 21 3H3a1 1 0 0 0-.742 1.67l7.225 7.989A2 2 0 0 1 10 14z",key:"sc7q7i"}]],A=k("funnel",y);function N({tasks:s}){const[e,r]=l.useState({date:new Date().toISOString().split("T")[0],status:""}),a=o=>{o.preventDefault(),x.get(route("tasks.index"),e,{preserveState:!0,preserveScroll:!0})};return t.jsx("div",{className:"",children:t.jsx("form",{onSubmit:a,children:t.jsxs("div",{className:"grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 mb-2",children:[t.jsxs("div",{children:[t.jsx(d,{htmlFor:"date",value:"Date",className:"block text-sm font-medium mb-1"}),t.jsx("input",{id:"date",name:"date",type:"date",value:e==null?void 0:e.date,onChange:o=>r({...e,date:o.target.value}),className:"border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm  block w-full"})]}),t.jsxs("div",{children:[t.jsx(d,{htmlFor:"status",value:"Status",className:"block text-sm font-medium mb-1"}),t.jsxs("select",{id:"status",name:"status",value:e==null?void 0:e.status,onChange:o=>r({...e,status:o.target.value}),className:"border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm block w-full",children:[t.jsx("option",{value:"",children:"All"}),t.jsx("option",{value:0,children:"Pending"}),t.jsx("option",{value:1,children:"Completed"}),t.jsx("option",{value:2,children:"In Progress"}),t.jsx("option",{value:3,children:"Cancelled"})]})]}),t.jsx("div",{className:"pt-1 sm:pt-6 flex gap-2",children:t.jsx(f,{children:t.jsx(A,{size:24})})})]})})})}const _=Object.freeze(Object.defineProperty({__proto__:null,default:N},Symbol.toStringTag,{value:"Module"}));export{N as T,_ as a,k as c};
