// Mensajes
const messages = [
  "Eres la chica más increible del mundo",
  "Te amo mivida",
  "Como puedes ser tan GUAPAAA",
  "Te mando besitos desde mi casaa 😘",
  "Que ganas de verteeeeee 🩵",
  "Como puedo tener una novia tan geniaaal?",
  "Tu puedes con todo mi vidaa",
  "LLamame si necesitas algooooo",
  "Quiero que nos veamos prontooo 🩵",
  "Tus ojos son preciosooossss",
  "Cuando necesites apoyo, aquí estoy",
  "Eres mi persona favorita",
  "No se como puedo amarte tanto 😍",
  "Quiero mi futuro a tu lado",
  "Cuando estoy trieste,pienso en tu sonrisa",
  "Estoy muy orgulloso de ti",
  "Cuando pienses en rendirte, piensa en nuestro futuro juntos",
  "Mandame un besitoooo 😘",
  "Eres mi droga, me tienes enamoradooo",
  "Que suerte tengo de tenerte 🩵"
];

const colorClasses = ["neon-red","neon-blue","neon-yellow","neon-purple","neon-green","neon-sky"];
const jarInner = document.getElementById("jarInner");
const lid = document.getElementById("lid");
const stageLayer = document.getElementById("stageLayer");
const modal = document.getElementById("messageModal");
const modalText = document.getElementById("modalText");
const modalClose = document.getElementById("modalClose");
const taken = new Array(20).fill(false);

// Crear bolas en el tarro simulando montañita
function createBalls() {
  jarInner.innerHTML = "";
  const jarRect = jarInner.getBoundingClientRect();
  const positions = [];
  for (let i=0;i<20;i++){
    const ball = document.createElement("div");
    ball.className = "ball "+colorClasses[i%colorClasses.length];
    ball.dataset.index = i;

    // posiciones aleatorias simulando física
    let x, y, tries=0;
    do{
      x = Math.random() * (jarRect.width - 52);
      y = jarRect.height - 52 - Math.random()*80; // fondo + variación
      tries++;
    } while(positions.some(p=>Math.hypot(p.x-x,p.y-y)<45) && tries<20);
    positions.push({x,y});
    ball.style.left = x+"px";
    ball.style.top = y+"px";

    jarInner.appendChild(ball);
  }
}
createBalls();

// Extraer bola aleatoria al tocar la tapa
let busy=false;
lid.addEventListener("click", async()=>{
  if(busy) return;
  busy=true;

  const available = [];
  for(let i=0;i<20;i++) if(!taken[i]) available.push(i);
  if(available.length===0){ showModal("No quedan bolas","Recarga la página para volver a jugar."); busy=false; return; }
  const idx = available[Math.floor(Math.random()*available.length)];
  taken[idx]=true;

  const ballEl = jarInner.querySelector(`.ball[data-index='${idx}']`);
  if(!ballEl){ showModal("Error","Bola no encontrada"); busy=false; return; }

  const rect = ballEl.getBoundingClientRect();
  const clone = ballEl.cloneNode(true);
  clone.style.position="fixed";
  clone.style.left=rect.left+"px";
  clone.style.top=rect.top+"px";
  clone.style.width=rect.width+"px";
  clone.style.height=rect.height+"px";
  clone.style.margin=0;
  clone.style.zIndex=900;
  stageLayer.appendChild(clone);
  ballEl.style.opacity=0.08;

  // animación subir
  await animateElement(clone,[
    { transform:"translate3d(0,0,0) rotate(0deg) scale(1)", offset:0 },
    { transform:"translate3d(0,-160px,0) rotate(540deg) scale(1.05)", offset:0.65 },
    { transform:"translate3d(0,-200px,0) rotate(700deg) scale(0.98)", offset:1 }
  ],950);

  // separar en dos mitades
  const leftHalf = clone.cloneNode(true);
  const rightHalf = clone.cloneNode(true);
  leftHalf.style.clipPath="inset(0 50% 0 0)";
  rightHalf.style.clipPath="inset(0 0 0 50%)";
  leftHalf.style.position="fixed";
  rightHalf.style.position="fixed";
  leftHalf.style.left=clone.style.left; leftHalf.style.top=clone.style.top;
  rightHalf.style.left=clone.style.left; rightHalf.style.top=clone.style.top;
  leftHalf.style.zIndex=910; rightHalf.style.zIndex=910;
  stageLayer.appendChild(leftHalf); stageLayer.appendChild(rightHalf);
  clone.remove();

  leftHalf.animate([{transform:"translateX(0) rotate(0deg)"},{transform:"translateX(-60px) rotate(-20deg)"},{transform:"translateX(-90px) rotate(-30deg)"}],{duration:700,easing:"cubic-bezier(.2,.8,.2,1)"});
  rightHalf.animate([{transform:"translateX(0) rotate(0deg)"},{transform:"translateX(60px) rotate(20deg)"},{transform:"translateX(90px) rotate(30deg)"}],{duration:700,easing:"cubic-bezier(.2,.8,.2,1)"});

  await sleep(520);

  const paperWrap=document.createElement("div");
  paperWrap.style.position="fixed";
  const parentRect=leftHalf.getBoundingClientRect();
  paperWrap.style.left=(parentRect.left+parentRect.width/2-100)+"px";
  paperWrap.style.top=(parentRect.top-20)+"px";
  paperWrap.style.zIndex=920;
  paperWrap.style.display="flex"; paperWrap.style.alignItems="center"; paperWrap.style.justifyContent="center";

  const paper=document.createElement("div"); 
  paper.className="paper"; 
  paper.style.transformOrigin="top center"; 
  paper.style.animation="paperOpen 560ms cubic-bezier(.2,.9,.2,1) forwards";
  const paperText=document.createElement("div"); 
  paperText.className="paper-text"; 
  paperText.innerText=messages[idx];
  paper.appendChild(paperText); 
  paperWrap.appendChild(paper); 
  stageLayer.appendChild(paperWrap);

  await sleep(1100);
  leftHalf.remove(); rightHalf.remove();
  setTimeout(()=>{ 
    paperWrap.animate([{opacity:1},{opacity:0}],{duration:450}).onfinish=()=>paperWrap.remove() 
  },2000);
  ballEl.style.transform="scale(0.92)"; ballEl.style.opacity="0.18";
  showModal("Mensaje",messages[idx]);
  busy=false;
});

function animateElement(el,keyframes,duration){ 
  return new Promise(res=>{
    const anim=el.animate(keyframes,{duration:duration,easing:"cubic-bezier(.2,.9,.2,1)",fill:"forwards"}); 
    anim.onfinish=()=>res(); 
  }); 
}
function sleep(ms){return new Promise(r=>setTimeout(r,ms));}
function showModal(title,text){ 
  modal.querySelector("#modalTitle").innerText=title; 
  modalText.innerText=text; 
  modal.classList.add("show"); 
  modal.setAttribute("aria-hidden","false"); 
}
modalClose.addEventListener("click",()=>{modal.classList.remove("show"); modal.setAttribute("aria-hidden","true");});

// ------------------------
// MARIPOSAS ANIMADAS
// ------------------------

// Array de clases CSS de mariposas
const butterflyClasses = [
  "butterfly-red1","butterfly-red2",
  "butterfly-blue1","butterfly-blue2",
  "butterfly-sky1","butterfly-sky2",
  "butterfly-green1","butterfly-green2",
  "butterfly-purple1","butterfly-purple2",
  "butterfly-white1","butterfly-white2",
  "butterfly-yellow1","butterfly-yellow2"
];

const butterflyLayer = document.getElementById("butterflyLayer");

function createButterfly() {
  const b = document.createElement("div");
  b.className = "butterfly";

  const colorClass = butterflyClasses[Math.floor(Math.random()*butterflyClasses.length)];
  b.classList.add(colorClass);

  const size = Math.random()*16 + 12;
  b.style.width = size + "px";
  b.style.height = size + "px";

  b.style.left = Math.random()*window.innerWidth + "px";
  b.style.top = Math.random()*window.innerHeight + "px";

  b.style.opacity = Math.random()*0.8 + 0.3;

  butterflyLayer.appendChild(b);

  const dx = (Math.random()-0.5)*0.7;
  const dy = (Math.random()*0.7 + 0.2);

  function move() {
    const rect = b.getBoundingClientRect();
    let x = rect.left + dx;
    let y = rect.top + dy;

    if(x < 0) x = window.innerWidth;
    if(x > window.innerWidth) x = 0;
    if(y < 0) y = window.innerHeight;
    if(y > window.innerHeight) y = 0;

    b.style.left = x + "px";
    b.style.top = y + "px";

    requestAnimationFrame(move);
  }
  move();
}

for(let i = 0; i < 30; i++) createButterfly();

// Musica de fondo de ambiente
const music = document.getElementById("bgMusic");
const musicBtn = document.getElementById("musicBtn");

// Reproducir automáticamente (algunas restricciones de navegador requieren interacción del usuario)
music.play().catch(()=>console.log("Interactúa con la página para iniciar la música"));

// Control de reproducción
musicBtn.addEventListener("click", ()=>{
  if(music.paused){
    music.play();
    musicBtn.innerText = "⏸️ Pausar música";
  } else {
    music.pause();
    musicBtn.innerText = "▶️ Reproducir música";
  }
});


