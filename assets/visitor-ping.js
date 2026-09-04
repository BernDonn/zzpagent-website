    // Visitor ping with server-side IP logging. Browser JavaScript cannot read
    // the visitor IP itself; the Sophie/Mac-mini endpoint logs it from request headers.
    (function(){
      var key="zzpagent_visitor_ping_sent_v2";
      if (window.sessionStorage && sessionStorage.getItem(key)) return;
      if (window.sessionStorage) sessionStorage.setItem(key,"1");
      var endpointBase=(window.ZZPAGENT_VOICE_URL || "https://sophie.zzpagent.nl?v=site").replace(/[?#].*$/, '').replace(/\/$/, '');
      var visitorId;
      try {
        visitorId=localStorage.getItem('zzpagent_visitor_id_v1');
        if(!visitorId){
          visitorId=(crypto && crypto.randomUUID) ? crypto.randomUUID() : String(Date.now()) + '-' + Math.random().toString(16).slice(2);
          localStorage.setItem('zzpagent_visitor_id_v1', visitorId);
        }
      } catch(e) {
        visitorId=String(Date.now()) + '-' + Math.random().toString(16).slice(2);
      }
      var payload=JSON.stringify({
        site:"zzpagent.nl",
        visitorId:visitorId,
        path:location.pathname + location.search,
        referrer:document.referrer || "",
        language:navigator.language || "",
        width:window.innerWidth,
        height:window.innerHeight,
        timezone:(Intl.DateTimeFormat && Intl.DateTimeFormat().resolvedOptions().timeZone) || "",
        time:new Date().toISOString()
      });
      setTimeout(function(){
        try {
          fetch(endpointBase + "/visitor-ping", {
            method:"POST",
            mode:"no-cors",
            headers:{"Content-Type":"text/plain;charset=UTF-8"},
            body:payload,
            keepalive:true
          });
        } catch(e) {}
      }, 900);
    })();
