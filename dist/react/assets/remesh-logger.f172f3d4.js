import{R as l,f as y}from"./remesh-react.691c86dd.js";const f=d=>{const c=d.getHours().toString().padStart(2,"0"),n=d.getMinutes().toString().padStart(2,"0"),s=d.getSeconds().toString().padStart(2,"0"),m=d.getMilliseconds().toString().padStart(3,"0");return`${c}:${n}:${s}.${m}`},p=()=>{const d=new Date;return f(d)},v=d=>{const c={include:["state","domain","query","event","command"],...d};return{onActive:(s,m)=>{var r;(r=c.exclude)!=null&&r.includes(s)||(c.include?c.include.includes(s)&&m():m())}}},N=()=>{if(typeof window!="undefined")return window.__REDUX_DEVTOOLS_EXTENSION__},$=d=>{const c=N();if(!!c)return n=>{var o;const s=v(d),m=c.connect({name:n==null?void 0:n.name,features:{pause:!1,lock:!1,persist:!1,export:!1,import:!1,jump:!1,skip:!1,reorder:!1,dispatch:!1,test:!1}}),r=(e,t)=>{m.send(t,null)},i=l.store({name:`RemeshReduxDevtools(${(o=n==null?void 0:n.name)!=null?o:""})`}),g=i.getDomain(y()),u=e=>{const t={domainId:e.Domain.domainId,domainName:e.Domain.domainName};return e.arg!==void 0?{...t,domainArg:e.arg}:t};return s.onActive("domain",()=>{i.subscribeEvent(g.event.RemeshDomainStorageEvent,e=>{const t=e.storage.Domain,a={type:`${e.type}::${t.domainName}`,domainId:t.domainId,domainName:t.domainName};e.storage.arg!==void 0?r(a.type,{...a,domainArg:e.storage.arg}):r(a.type,a)})}),s.onActive("state",()=>{i.subscribeEvent(g.event.RemeshStateStorageEvent,e=>{const t=e.storage.State,a={type:`${e.type}::${t.stateName}`,owner:u(t.owner),stateId:t.stateId,stateName:t.stateName,stateValue:e.storage.currentState};r(a.type,a)})}),s.onActive("query",()=>{i.subscribeEvent(g.event.RemeshQueryStorageEvent,e=>{const t=e.storage.Query,a={type:`${e.type}::${t.queryName}`,owner:u(t.owner),queryId:t.queryId,queryName:t.queryName};e.storage.arg!==void 0?r(a.type,{...a,queryArg:e.storage.arg}):r(a.type,a)})}),s.onActive("command",()=>{i.subscribeEvent(g.event.RemeshCommandReceivedEvent,e=>{const t=e.action.Command,a={type:`${e.type}::${t.commandName}`,owner:u(t.owner),commandId:t.commandId,commandName:t.commandName};e.action.arg!==void 0?r(a.type,{...a,commandArg:e.action.arg}):r(a.type,a)})}),s.onActive("event",()=>{i.subscribeEvent(g.event.RemeshEventEmittedEvent,e=>{const t=e.action.Event,a={type:`${e.type}::${t.eventName}`,owner:u(t.owner),eventId:t.eventId,eventName:t.eventName};e.action.arg!==void 0?r(a.type,{...a,eventArg:e.action.arg}):r(a.type,a)})}),i}},E={domain:"#bfb1cc",event:"#aec6d4",state:"#adc7af",entity:"#d9bdc5",query:"#d6c9ad",command:"#debdb6"},b=d=>c=>{var u;const n={collapsed:!0,colors:E,...d},s=v(n),m=(o,e,t)=>{n.collapsed&&console.groupCollapsed(`%c${o}%c @ ${p()}`,`background-color:${t}; color: #000; font-weight: bold`,"color:#9E9E9E; font-weight: lighter"),console.log(e),n.collapsed&&console.groupEnd()},r=l.store({...c,name:`RemeshLogger(${(u=c==null?void 0:c.name)!=null?u:""})`}),i=r.getDomain(y()),g=o=>{const e={domainId:o.Domain.domainId,domainName:o.Domain.domainName};return o.arg!==void 0?{...e,domainArg:o.arg}:e};return s.onActive("domain",()=>{r.subscribeEvent(i.event.RemeshDomainStorageEvent,o=>{const e=o.storage.Domain,t={type:`${o.type}::${e.domainName}`,domainId:e.domainId,domainName:e.domainName};o.storage.arg!==void 0?m(t.type,{...t,domainArg:o.storage.arg},n.colors.domain):m(t.type,t,n.colors.domain)})}),s.onActive("state",()=>{r.subscribeEvent(i.event.RemeshStateStorageEvent,o=>{const e=o.storage.State,t={type:`${o.type}::${e.stateName}`,owner:g(e.owner),stateId:e.stateId,stateName:e.stateName,stateValue:o.storage.currentState};m(t.type,t,n.colors.state)})}),s.onActive("query",()=>{r.subscribeEvent(i.event.RemeshQueryStorageEvent,o=>{const e=o.storage.Query,t={type:`${o.type}::${e.queryName}`,owner:g(e.owner),queryId:e.queryId,queryName:e.queryName,queryValue:o.storage.currentValue};o.storage.arg!==void 0?m(t.type,{...t,queryArg:o.storage.arg},n.colors.query):m(t.type,t,n.colors.query)})}),s.onActive("command",()=>{r.subscribeEvent(i.event.RemeshCommandReceivedEvent,o=>{const e=o.action.Command,t={type:`${o.type}::${e.commandName}`,owner:g(e.owner),commandId:e.commandId,commandName:e.commandName};o.action.arg!==void 0?m(t.type,{...t,commandArg:o.action.arg},n.colors.command):m(t.type,t,n.colors.command)})}),s.onActive("event",()=>{r.subscribeEvent(i.event.RemeshEventEmittedEvent,o=>{const e=o.action.Event,t={type:`${o.type}::${e.eventName}`,owner:g(e.owner),eventId:e.eventId,eventName:e.eventName};o.action.arg!==void 0?m(t.type,{...t,eventArg:o.action.arg},n.colors.event):m(t.type,t,n.colors.event)})}),r};export{$ as R,b as a};
//# sourceMappingURL=remesh-logger.f172f3d4.js.map