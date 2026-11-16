const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const plans={
 p110:{label:'110㎡',name:'110㎡四房两厅三卫',desc:'以横向客餐厅为家庭核心，主卧与儿童房分置两侧；保留多功能书房、亲子互动区以及独立电梯厅关系。',overview:'render-110.webp',plan:'plan-110.webp',prefix:'110'},
 p121square:{label:'121㎡方厅',name:'121㎡方厅四房两厅三卫',desc:'客厅、餐厅与中岛形成开阔家庭社交场；户外聚会烧烤与休闲露台分别承接用餐和放松场景。',overview:'render-121-square.webp',plan:'plan-121-square.webp',prefix:'121square'},
 p121end:{label:'121㎡端厅',name:'121㎡端厅四房两厅三卫',desc:'入户花园建立归家缓冲，端厅大面宽连接绿化平台；主卧套房、书房与儿童房形成相对独立的静区。',overview:'render-121-end.webp',plan:'plan-121-end.webp',prefix:'121end'}
};
const viewLabels={overview:'全屋鸟瞰',elevator:'出电梯视角',northhall:'北光厅视角',living:'精装客厅',dining:'餐厨空间',master:'主卧套房',masterout:'主卧向外看',bed2out:'次卧向外看',childout:'儿童房向外看',multiout:'多功能房向外看',terrace:'景观露台'};
const order=['overview','elevator','northhall','living','dining','master','masterout','bed2out','childout','multiout','terrace'];
const links={
 overview:[['elevator','从电梯入户',46,54],['northhall','查看北光厅',52,23],['living','进入客厅',67,61],['master','进入主卧',25,70]],
 elevator:[['northhall','前往北光厅',24,66],['living','进入客厅',70,53],['overview','返回鸟瞰',50,12]],
 northhall:[['elevator','返回玄关',17,68],['living','前往客厅',78,58],['multiout','进入多功能房',88,65],['overview','返回鸟瞰',50,12]],
 living:[['dining','前往餐厨',20,72],['terrace','推门到露台',78,44],['master','前往主卧',90,68],['overview','返回鸟瞰',50,12]],
 dining:[['living','回到客厅',14,67],['bed2out','前往次卧',83,63],['childout','前往儿童房',72,22],['overview','返回鸟瞰',50,12]],
 master:[['masterout','从主卧向外看',50,70],['living','前往客厅',84,65],['overview','返回鸟瞰',50,12]],
 masterout:[['master','转身看主卧',17,68],['living','走向客厅',78,58],['overview','返回鸟瞰',50,12]],
 bed2out:[['dining','走向餐厨',75,62],['childout','查看儿童房',18,67],['overview','返回鸟瞰',50,12]],
 childout:[['dining','走向餐厨',77,62],['multiout','前往多功能房',17,67],['overview','返回鸟瞰',50,12]],
 multiout:[['northhall','走向北光厅',75,60],['living','前往客厅',18,67],['overview','返回鸟瞰',50,12]],
 terrace:[['living','返回客厅',48,58],['dining','前往餐厨',76,66],['overview','返回鸟瞰',50,12]]
};
const filters={cream:'brightness(1.02) saturate(1.02)',walnut:'sepia(.10) saturate(1.1) contrast(1.03)',greige:'saturate(.78) contrast(1.05) brightness(.99)'};
let currentPlan='p110',currentStyle='cream',currentView='overview',zoom=1,panX=0,dragging=false,startX=0,startPan=0,autoTimer=null;
const scene=$('#scene'),image=$('#tourImage'),hotspots=$('#hotspots');
function srcFor(view){const p=plans[currentPlan];return './assets-web/'+(view==='overview'?p.overview:p.prefix+'-'+view+'.webp')}
function renderHotspots(){
 hotspots.innerHTML='';
 for(const [view,label,x,y] of links[currentView]){
  const b=document.createElement('button');b.className='tour-hotspot';b.dataset.view=view;b.style.left=x+'%';b.style.top=y+'%';b.innerHTML='<i></i><span>'+label+'</span>';b.onclick=()=>{stopAuto();setView(view)};hotspots.appendChild(b);
 }
}
function applyTransform(){image.style.transform='translate3d('+panX+'px,0,0) scale('+zoom+')';image.style.filter=filters[currentStyle]+($('#nightToggle').checked?' brightness(.82) contrast(1.08)':'')}
function setView(view,animate=true){
 currentView=view;zoom=1;panX=0;
 if(animate){image.classList.add('changing');setTimeout(()=>{image.src=srcFor(view);image.classList.remove('changing')},180)}else image.src=srcFor(view);
 scene.classList.toggle('overview',view==='overview');$('#viewName').textContent=viewLabels[view];renderHotspots();applyTransform();
 $$('[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===view));
}
function updatePlan(){
 const p=plans[currentPlan];$('#planName').textContent=p.name;$('#planDesc').textContent=p.desc;$('#renderImage').src='./assets-web/'+p.overview;$('#planImage').src='./assets-web/'+p.plan;setView('overview',false);updateStatus()
}
function updateStatus(){$('#statusTitle').textContent=plans[currentPlan].label+' · '+({cream:'奶油原木',walnut:'胡桃自然',greige:'米灰静奢'}[currentStyle])}
function stopAuto(){if(autoTimer){clearInterval(autoTimer);autoTimer=null;$('#walkHint').classList.remove('show');$('#walkBtn').textContent='开始顺序漫游'}}
function startAuto(){let i=Math.max(0,order.indexOf(currentView));stopAuto();$('#walkHint').classList.add('show');$('#walkBtn').textContent='暂停顺序漫游';autoTimer=setInterval(()=>{i=(i+1)%order.length;setView(order[i])},4800)}
function stepNode(delta){const i=order.indexOf(currentView);setView(order[(i+delta+order.length)%order.length])}
function turn(delta){if(currentView==='overview')return;panX=Math.max(-420,Math.min(420,panX+delta));applyTransform()}
$$('[data-plan]').forEach(b=>b.onclick=()=>{stopAuto();currentPlan=b.dataset.plan;$$('[data-plan]').forEach(x=>x.classList.toggle('active',x===b));updatePlan()});
$$('[data-style]').forEach(b=>b.onclick=()=>{currentStyle=b.dataset.style;$$('[data-style]').forEach(x=>x.classList.toggle('active',x===b));applyTransform();updateStatus()});
$$('[data-view]').forEach(b=>b.onclick=()=>{stopAuto();setView(b.dataset.view)});
$('#walkBtn').onclick=()=>autoTimer?stopAuto():startAuto();
$('#hotspotToggle').onchange=e=>hotspots.hidden=!e.target.checked;
$('#nightToggle').onchange=applyTransform;
$('#fullToggle').onchange=async e=>{if(e.target.checked){if(scene.requestFullscreen)await scene.requestFullscreen()}else if(document.fullscreenElement)await document.exitFullscreen()};
document.addEventListener('fullscreenchange',()=>{$('#fullToggle').checked=!!document.fullscreenElement});
scene.addEventListener('pointerdown',e=>{if(e.target.closest('button'))return;dragging=true;startX=e.clientX;startPan=panX;image.classList.add('grabbing');scene.setPointerCapture(e.pointerId)});
scene.addEventListener('pointermove',e=>{if(!dragging||currentView==='overview')return;panX=Math.max(-260,Math.min(260,startPan+(e.clientX-startX)));applyTransform()});
scene.addEventListener('pointerup',()=>{dragging=false;image.classList.remove('grabbing')});
scene.addEventListener('wheel',e=>{e.preventDefault();zoom=Math.max(1,Math.min(1.5,zoom+(e.deltaY<0?.08:-.08)));applyTransform()},{passive:false});
scene.addEventListener('dblclick',()=>{zoom=zoom>1?1:1.25;panX=0;applyTransform()});
document.addEventListener('keydown',e=>{if(/INPUT|TEXTAREA|SELECT/.test(e.target.tagName))return;const k=e.key.toLowerCase();if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright'].includes(k))e.preventDefault();if(k==='w'||k==='arrowup'){stopAuto();stepNode(1)}if(k==='s'||k==='arrowdown'){stopAuto();stepNode(-1)}if(k==='a'||k==='arrowleft')turn(90);if(k==='d'||k==='arrowright')turn(-90)});
$('#helpBtn').onclick=()=>$('#helpDialog').showModal();$('#closeHelp').onclick=()=>$('#helpDialog').close();
image.onload=()=>image.classList.add('loaded');updatePlan();
