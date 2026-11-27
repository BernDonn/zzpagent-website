/* Purpose-specific optional measurement. No permission from legacy acceptance. */
(() => {
  'use strict';
  if (window.siteAnalyticsPrivacy) return;
  const key='site-analytics-opt-out', legacy='site-analytics-consent-v1', consentKey='site-cookie-choice-v2';
  const purposes=['ga','crisp','visitor','video'];
  const ids=['G-4BBKJXQGWV','G-FEM9HLKQ43'];
  const id=location.hostname.includes('mkbagents')?ids[1]:ids[0];
  const excludedPage=location.pathname.replace(/\/+$/,'')==='/analytics-uit';
  let emergency=false, loaded=false, crispStarted=false;
  let state={};
  const read=()=>{
    state={excluded:emergency||excludedPage,chosen:false,choices:{}};
    try {
      state.excluded ||= localStorage.getItem(key)==='1';
      const old=localStorage.getItem(legacy);
      const raw=JSON.parse(localStorage.getItem(consentKey)||'null');
      if(raw && raw.version===2 && purposes.every(p=>typeof raw.choices?.[p]==='boolean')) {
        state.chosen=true;state.choices=raw.choices;
      } else if(old==='refused') state.chosen=true;
    } catch(_) {state.excluded=true;}
    return state;
  };
  const disabled=p=>{read();return state.excluded||state.choices[p]!==true;};
  const isGaDisabled=()=>{const d=disabled('ga');ids.forEach(x=>window['ga-disable-'+x]=d);return d;};
  const erase=()=>{
    document.cookie.split(';').forEach(pair=>{
      const name=pair.split('=')[0].trim();
      const gaCookie=/^_ga(?:_|$)|^_gid$|^_gat/.test(name), crispCookie=/^crisp-client\//.test(name);
      if(!((gaCookie&&disabled('ga'))||(crispCookie&&disabled('crisp'))))return;
      ['',location.hostname,'.'+location.hostname.replace(/^www\./,'')].forEach(domain=>{
        document.cookie=name+'=; Max-Age=0; path=/'+(domain?'; domain='+domain:'');
      });
    });
    try {if(disabled('visitor'))['zzpagent_visitor_id_v1','mkbagents_visitor_id_v1'].forEach(k=>localStorage.removeItem(k));}catch(_){}
  };
  const start=()=>{
    if(isGaDisabled()||loaded)return;
    loaded=true;window.dataLayer=window.dataLayer||[];
    window.gtag=function(){if(!isGaDisabled())window.dataLayer.push(arguments);};
    window.gtag('js',new Date());
    window.gtag('config',id,{allow_google_signals:false,allow_ad_personalization_signals:false,page_location:location.origin+location.pathname,page_referrer:''});
    const s=document.createElement('script');s.async=true;s.src='https://www.googletagmanager.com/gtag/js?id='+id;document.head.append(s);
    window.dispatchEvent(new Event('site-analytics-allowed'));
  };
  const update=()=>{
    const ga=isGaDisabled(),crisp=disabled('crisp');
    erase();
    window.dispatchEvent(new Event('site-analytics-change'));
    if((ga&&loaded)||(crisp&&crispStarted)){location.reload();return;}
    start();
  };
  const failure=()=>{
    emergency=true;isGaDisabled();erase();
    window.dispatchEvent(new Event('site-analytics-change'));
    if(loaded||crispStarted){location.replace('/analytics-uit/?opslag=mislukt');}
    const note=document.querySelector('#site-consent-note');
    if(note)note.textContent='Je keuze kon niet worden opgeslagen. Optionele meting staat op deze pagina uit. Je eerdere keuze kan na herladen nog gelden.';
    return false;
  };
  const save=choices=>{
    const record=JSON.stringify({version:2,choices:Object.fromEntries(purposes.map(p=>[p,choices[p]===true]))});
    try {localStorage.setItem(consentKey,record);if(localStorage.getItem(consentKey)!==record)return failure();}catch(_){return failure();}
    update();return true;
  };
  const runAllowed=(purpose,fn)=>{
    let ran=false;const run=()=>{if(!ran&&!disabled(purpose)){ran=true;if(purpose==='crisp')crispStarted=true;fn();}};
    window.addEventListener('site-analytics-change',run);run();
  };
  window.siteAnalyticsPrivacy={isDisabled:isGaDisabled,isGaDisabled,
    isVisitorDisabled:()=>disabled('visitor'),isVideoDisabled:()=>disabled('video'),isCrispDisabled:()=>disabled('crisp'),
    runCrispWhenAllowed:fn=>runAllowed('crisp',fn),runVisitorWhenAllowed:fn=>runAllowed('visitor',fn),runWhenAllowed:fn=>runAllowed('ga',fn),
    setConsent:value=>save(Object.fromEntries(purposes.map(p=>[p,value==='accepted']))),setChoices:save,
    setDisabled(value){try{if(value)localStorage.setItem(key,'1');else localStorage.removeItem(key);if((localStorage.getItem(key)==='1')!==value)return failure();}catch(_){return failure();}update();return true;}
  };
  isGaDisabled();
  window.addEventListener('storage',e=>{if([key,legacy,consentKey,null].includes(e.key))update();});
  window.addEventListener('pageshow',e=>{if(e.persisted)update();});
  const ui=()=>{
    if(excludedPage){if(location.search.includes('opslag=mislukt')){const p=document.createElement('p');p.setAttribute('role','alert');p.textContent='Je keuze kon niet worden opgeslagen. Op deze pagina staat meting uit. Je eerdere keuze kan op andere pagina’s nog gelden.';document.body.prepend(p);}return;}
    const style=document.createElement('style');style.textContent=`
#site-consent{position:fixed;top:16px;left:16px;z-index:2147483646;width:calc(100% - 32px);max-width:540px;max-height:calc(100dvh - 32px);overflow:auto;box-sizing:border-box;padding:18px;border:1px solid #587368;border-radius:10px;background:#fff;color:#18332d;box-shadow:0 4px 22px #0002;font:14px/1.5 system-ui,sans-serif;text-align:left}
#site-consent[hidden],#site-consent [hidden]{display:none!important}#site-consent p{margin:0 0 12px;font:inherit;color:inherit}#site-consent .choice-actions{display:flex;gap:8px;flex-wrap:wrap;margin:12px 0}#site-consent button,#site-consent-settings{font:14px/1.4 system-ui,sans-serif;font-weight:400;border:1px solid #587368;border-radius:6px;background:#fff;color:#18332d;padding:10px 12px;cursor:pointer;text-transform:none;letter-spacing:normal}#site-consent .choice-actions button{flex:1;margin:0;min-width:88px}#site-consent a{color:#18332d;text-decoration:underline}#site-consent label{display:block;margin:14px 0;font:inherit;color:inherit}#site-consent input{appearance:auto;width:18px;height:18px;vertical-align:middle;margin:0 8px 0 0}#site-consent label span{display:block;margin-top:4px}#site-consent-settings{display:block;margin:16px auto 120px}#site-consent h2{font:700 18px/1.4 system-ui;margin:12px 0}#site-consent-note:empty{display:none}`;
    document.head.append(style);
    const panel=document.createElement('section');panel.id='site-consent';panel.setAttribute('aria-label','Cookiekeuze');
    panel.innerHTML=`<p id="site-consent-title">Deze website maakt gebruik van cookies.</p>
<div class="choice-actions"><button type="button" data-action="accept">Accepteren</button><button type="button" data-action="refuse">Weigeren</button><button type="button" data-action="settings">Instellen</button></div>
<a href="/privacy-cookies/">Privacy en cookies</a>
<div id="site-consent-details" hidden><h2>Cookie-instellingen</h2>
<p>Alle metingen zijn optioneel. Weigeren laat de website en video’s werken. Via Cookie-instellingen onderaan iedere pagina met meting kun je toestemming wijzigen of intrekken. Een browseruitsluiting gaat altijd voor.</p>
<label><input type="checkbox" data-purpose="ga">Websitestatistieken — Google Analytics 4<span>Google ontvangt pagina- en gebruiksgegevens, cookiecodes en technische gegevens, waaronder IP-adres en apparaatkenmerken, voor bezoekers- en gebruiksstatistieken. Geen advertentiepersonalisatie.</span></label>
<label><input type="checkbox" data-purpose="crisp">Live bezoekersmonitor — Crisp<span>Crisp ontvangt bezoekactiviteit, sessiecodes, IP-adres en browsergegevens zodat de beheerder live bezoek kan bekijken en bezoekersmeldingen kan ontvangen, ook zonder chat.</span></label>
<label><input type="checkbox" data-purpose="visitor">Bezoekmeldingen<span>Een afzonderlijke melding aan de websitebeheerder via onze Sophie-server, Cloudflare en eventueel ntfy.sh: bezoekerscode, pagina inclusief query, verwijzer, taal, schermmaat, tijdzone, tijdstip en IP-adres. Dit is geen Google- of Crisp-meting.</span></label>
<label><input type="checkbox" data-purpose="video">Videostatistieken<span>Onze server ontvangt via Cloudflare de videocode, start, afspeeltijd en eindbereik. Transport verwerkt ook IP- en technische gegevens. De video zelf werkt zonder deze toestemming.</span></label>
<p>Opslag, bewaartermijnen en doorgiften: <a href="/privacy-cookies/">Privacy en cookies</a>.</p>
<div class="choice-actions"><button type="button" data-action="save">Keuzes opslaan</button><button type="button" data-action="close">Sluiten</button></div></div><p id="site-consent-note" role="status"></p>`;
    const settings=document.createElement('button');settings.id='site-consent-settings';settings.type='button';settings.textContent='Cookie-instellingen';settings.setAttribute('aria-controls','site-consent');
    const details=panel.querySelector('#site-consent-details');
    const open=()=>{read();panel.hidden=false;details.hidden=false;panel.querySelectorAll('[data-purpose]').forEach(e=>e.checked=state.choices[e.dataset.purpose]===true);details.querySelector('h2').setAttribute('tabindex','-1');details.querySelector('h2').focus();};
    const close=()=>{panel.hidden=true;settings.focus();};
    panel.addEventListener('click',e=>{const a=e.target.dataset.action;if(!a)return;
      if(a==='settings'){open();return;}
      if(a==='close'){close();return;}
      const choices=Object.fromEntries(purposes.map(p=>[p,a==='accept'||(a==='save'&&panel.querySelector('[data-purpose="'+p+'"]').checked)]));
      if(save(choices))close();
    });
    settings.addEventListener('click',()=>open());
    panel.addEventListener('keydown',e=>{if(e.key==='Escape')close();});
    read();panel.hidden=state.chosen||state.excluded;
    document.body.append(panel);(document.querySelector('footer')||document.body).append(settings);start();
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ui);else ui();
})();
