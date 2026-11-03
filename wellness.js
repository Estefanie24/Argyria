(()=>{'use strict';
const KEY='argyria.wellness.v1', GOAL_KEY='argyria.wellness.goals.v1', DEFAULT_GOALS={water:8,sleep:8,steps:8000}, $=id=>document.getElementById(id), today=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}, fresh=()=>({date:today(),water:0,sleep:null,steps:null,mood:null});
function load(){try{const x=JSON.parse(localStorage.getItem(KEY)||'null');if(x&&x.date===today())return {...fresh(),...x}}catch(e){console.warn(e)}return fresh()}
let data=load();
function loadGoals(){try{const g=JSON.parse(localStorage.getItem(GOAL_KEY)||'null');return {...DEFAULT_GOALS,...(g||{})}}catch(e){return {...DEFAULT_GOALS}}}
let goals=loadGoals();
const clamp=(x,a,b)=>Math.min(b,Math.max(a,x)), fmt=x=>new Intl.NumberFormat().format(x);
function toast(s){const t=$('toast');t.textContent=s;t.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>t.classList.remove('show'),2200)}
function save(){try{localStorage.setItem(KEY,JSON.stringify(data))}catch(e){toast('Could not save. Check browser storage settings.')}render()}
function render(){
$('waterValue').textContent=data.water;$('waterProgress').style.width=clamp(data.water/8*100,0,100)+'%';$('waterNote').textContent=data.water>=8?'You reached the example target. Well done.':'Every glass is a small act of care.';
$('sleepValue').textContent=data.sleep===null?'—':data.sleep;$('sleepProgress').style.width=data.sleep===null?'0%':clamp(data.sleep/8*100,0,100)+'%';
$('stepsValue').textContent=data.steps===null?'0':fmt(data.steps);$('stepsProgress').style.width=data.steps===null?'0%':clamp(data.steps/8000*100,0,100)+'%';$('stepsNote').textContent=data.steps===null?'Enter a step count to track your day.':'Manually entered steps; not a sensor reading.';
$('moodValue').textContent=data.mood||'Not recorded';const tips={Happy:'Enjoy this moment and notice what is helping you feel well.',Calm:'You might take a moment to appreciate this sense of calm.',Neutral:'A neutral moment is valid. Check in again later if you wish.',Tired:'Consider a gentle pause, some water, or rest if available.',Stressed:'Try a few comfortable breaths or take a short break.',Sad:'Be gentle with yourself. Consider reaching out to someone you trust if support would help.'};$('moodSuggestion').textContent=data.mood?tips[data.mood]:'How are you feeling at this moment?';
document.querySelectorAll('[data-mood]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mood===data.mood)));
const waterPct=clamp(data.water/goals.water*100,0,100),sleepPct=data.sleep===null?0:clamp(data.sleep/goals.sleep*100,0,100),stepsPct=data.steps===null?0:clamp(data.steps/goals.steps*100,0,100),moodPct=data.mood?100:0;
$('waterGoalText').textContent=`${data.water} / ${goals.water} glasses · ${Math.round(waterPct)}%`;$('waterGoalProgress').style.width=waterPct+'%';
$('sleepGoalText').textContent=data.sleep===null?'Not recorded':`${data.sleep} / ${goals.sleep} hours · ${Math.round(sleepPct)}%`;$('sleepGoalProgress').style.width=sleepPct+'%';
$('stepsGoalText').textContent=data.steps===null?'Not recorded':`${fmt(data.steps)} / ${fmt(goals.steps)} steps · ${Math.round(stepsPct)}%`;$('stepsGoalProgress').style.width=stepsPct+'%';
$('moodGoalText').textContent=data.mood?'Check-in complete':'Not recorded';$('moodGoalProgress').style.width=moodPct+'%';
const n=[data.water>0,data.sleep!==null,data.steps!==null,!!data.mood].filter(Boolean).length;$('entryCount').textContent=`${n} / 4`;$('entryProgress').style.width=n/4*100+'%';
$('encouragement').textContent=n===4?'You checked in across all four areas. Thank yourself for taking the time.':n===0?'There is no perfect day to achieve. Start wherever you are.':`${n} of 4 areas recorded. Progress is personal; no need to complete every goal.`;
}
$('waterTarget').value=goals.water;$('sleepTarget').value=goals.sleep;$('stepsTarget').value=goals.steps;
$('goalForm').onsubmit=e=>{e.preventDefault();const water=Number($('waterTarget').value),sleep=Number($('sleepTarget').value),steps=Number($('stepsTarget').value);
if(!Number.isInteger(water)||water<1||water>30)return toast('Water goal must be 1–30 glasses.');
if(!Number.isFinite(sleep)||sleep<1||sleep>24||Math.round(sleep*2)!==sleep*2)return toast('Sleep goal must be 1–24 hours, in half-hour steps.');
if(!Number.isInteger(steps)||steps<1||steps>100000)return toast('Step goal must be 1–100,000.');
goals={water,sleep,steps};try{localStorage.setItem(GOAL_KEY,JSON.stringify(goals))}catch(e){toast('Could not save goals. Check browser storage settings.');return}render();toast('Your daily goals have been saved.');};
$('todayLabel').textContent=new Intl.DateTimeFormat(undefined,{weekday:'short',month:'short',day:'numeric'}).format(new Date());$('dateChip').textContent=new Intl.DateTimeFormat(undefined,{year:'numeric',month:'long',day:'numeric'}).format(new Date());
$('waterPlus').onclick=()=>{data.water=clamp(data.water+1,0,30);save()};$('waterMinus').onclick=()=>{data.water=clamp(data.water-1,0,30);save()};
$('sleepForm').onsubmit=e=>{e.preventDefault();const raw=$('sleepInput').value,v=Number(raw);if(!raw.trim()||!Number.isFinite(v)||v<0||v>24)return toast('Enter sleep from 0 to 24 hours.');data.sleep=Math.round(v*2)/2;save();toast('Sleep record saved.')};
$('stepsForm').onsubmit=e=>{e.preventDefault();const raw=$('stepsInput').value,v=Number(raw);if(!raw.trim()||!Number.isInteger(v)||v<0||v>100000)return toast('Enter a whole number from 0 to 100,000.');data.steps=v;save();toast('Step record saved.')};
document.querySelectorAll('[data-mood]').forEach(b=>b.onclick=()=>{data.mood=b.dataset.mood;save();toast('Mood check-in saved.')});
const dlg=$('privacyDialog');$('privacyButton').onclick=()=>dlg.showModal();$('privacyOk').onclick=()=>dlg.close();$('privacyClose').onclick=()=>dlg.close();
$('resetButton').onclick=()=>{if(confirm('Reset all Argyria wellness records for today on this browser?')){data=fresh();try{localStorage.removeItem(KEY)}catch(e){}render();toast("Today's records have been reset.")}};
let phase='idle',end=0,phaseTimer=null,endTimer=null;function stop(msg='Practice stopped. Take your time.'){clearTimeout(phaseTimer);clearTimeout(endTimer);phaseTimer=endTimer=null;phase='idle';$('breathOrb').className='orb';$('breathWord').textContent='Breathe';$('breathStart').disabled=false;$('breathStop').disabled=true;$('breathStatus').textContent=msg}
function cycle(){if(Date.now()>=end){stop('Practice complete. Notice how you feel.');return}const inhale=phase!=='inhale';phase=inhale?'inhale':'exhale';$('breathWord').textContent=inhale?'Breathe in':'Breathe out';$('breathOrb').className='orb '+phase;phaseTimer=setTimeout(cycle,inhale?4000:6000)}
$('breathStart').onclick=()=>{if(phase!=='idle')return;end=Date.now()+Number($('breathDuration').value)*1000;$('breathStart').disabled=true;$('breathStop').disabled=false;$('breathStatus').textContent='Follow the orb gently. Breathe comfortably; do not force your breath.';phase='exhale';cycle();endTimer=setTimeout(()=>stop('Practice complete. Notice how you feel.'),end-Date.now())};
$('breathStop').onclick=()=>stop();document.addEventListener('visibilitychange',()=>{if(document.hidden&&phase!=='idle')stop('Practice paused when you left the page.')});
render();
})();