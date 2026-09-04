    window.$crisp=[];
    window.$crisp.push(["do", "chat:hide"]);
    window.CRISP_WEBSITE_ID="453fc521-ac48-4172-b5b5-c5da448f5178";
    (function(){
      var d=document;
      var s=d.createElement("script");
      s.src="https://client.crisp.chat/l.js";
      s.async=1;
      d.getElementsByTagName("head")[0].appendChild(s);
      var hideCrisp=function(){
        try{ if(window.$crisp) window.$crisp.push(["do", "chat:hide"]); }catch(e){}
        try{ document.querySelectorAll('.crisp-client').forEach(function(el){el.style.display='none';el.style.visibility='hidden';}); }catch(e){}
      };
      s.addEventListener('load', hideCrisp);
      setTimeout(hideCrisp, 1200);
      setTimeout(hideCrisp, 3500);
    })();

