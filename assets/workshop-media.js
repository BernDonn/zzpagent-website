(() => {
const dialog=document.querySelector('#slide-dialog'), opener=document.querySelector('.slide-thumb'), total=14; let current=0;
const english=()=>document.documentElement.lang==='en';
function showSlide(i){current=Math.max(0,Math.min(total-1,i)); const img=document.querySelector('#slide-full'); img.src=`assets/slide-${String(current+1).padStart(2,'0')}.png`;img.alt=`${english()?'Slide':'Dia'} ${current+1}`;document.querySelector('#slide-count').textContent=`${current+1} / ${total}`;document.querySelector('#slide-prev').disabled=current===0;document.querySelector('#slide-next').disabled=current===total-1;}
opener.addEventListener('click',()=>{showSlide(0);dialog.showModal()});
document.querySelector('#slide-prev').onclick=()=>showSlide(current-1);document.querySelector('#slide-next').onclick=()=>showSlide(current+1);document.querySelector('#slide-close').onclick=()=>dialog.close();dialog.addEventListener('close',()=>opener.focus());dialog.addEventListener('keydown',e=>{if(e.key==='ArrowRight'){e.preventDefault();showSlide(current+1)}if(e.key==='ArrowLeft'){e.preventDefault();showSlide(current-1)}});
const disclosure=document.querySelector('#evolution-video');disclosure.addEventListener('toggle',()=>{if(!disclosure.open)disclosure.querySelector('video').pause()});
function labels(){const en=english();dialog.setAttribute('aria-label',en?'Workshop presentation slides':'Workshopdia vergroot');opener.setAttribute('aria-label',en?'View all 14 slides':'Bekijk alle 14 dia’s');opener.querySelector('img').alt=en?'Slide 1':'Dia 1';for(const [id,nl,eng] of [['slide-prev','Vorige dia','Previous slide'],['slide-next','Volgende dia','Next slide'],['slide-close','Sluiten','Close']])document.getElementById(id).setAttribute('aria-label',en?eng:nl);if(dialog.open)showSlide(current)}
new MutationObserver(labels).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});labels();
})();
