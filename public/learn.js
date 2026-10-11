// Lesson content and diagrams (shared with the Claude artifact version).
// ===== Learn library: lessons for every Math (Extended), Physics and Chemistry topic in the Term 1 outline =====
// ---- diagram helpers (inline SVG, colours from theme tokens via classes) ----
function S(w,h,body,label){return `<svg class="fig" data-mw="${Math.round(w*1.3)}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${label}"><title>${label}</title>${body}</svg>`}
function T(x,y,s,cls,anchor){return `<text x="${x}" y="${y}" class="${cls||""}" text-anchor="${anchor||"middle"}">${s}</text>`}
function Ln(x1,y1,x2,y2,cls){return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="${cls||"ax"}"/>`}
function Ar(x1,y1,x2,y2,cls){const a=Math.atan2(y2-y1,x2-x1),h=8,p1=[x2-h*Math.cos(a-0.45),y2-h*Math.sin(a-0.45)],p2=[x2-h*Math.cos(a+0.45),y2-h*Math.sin(a+0.45)];
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="${cls||"arr"}"/><polygon points="${x2},${y2} ${p1[0].toFixed(1)},${p1[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}" class="${(cls||"arr")}h"/>`}
function Rc(x,y,w,h,cls,rx){return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx||4}" class="${cls||"box"}"/>`}
function Ci(x,y,r,cls){return `<circle cx="${x}" cy="${y}" r="${r}" class="${cls||"dot"}"/>`}
function nest(svg,x,y,w,h){return svg.replace(/<svg class="fig" data-mw="[^"]*"/,`<svg x="${x}" y="${y}" width="${w}" height="${h}"`)}
function graph(o){
  const w=o.w||320,h=o.h||210,pl=36,pr=14,pt=14,pb=30;
  const X=x=>pl+(x-o.xmin)/(o.xmax-o.xmin)*(w-pl-pr),Y=y=>h-pb-(y-o.ymin)/(o.ymax-o.ymin)*(h-pt-pb);
  let b="";
  const ax0=o.ymin<=0&&o.ymax>=0?Y(0):h-pb,ay0=o.xmin<=0&&o.xmax>=0?X(0):pl;
  b+=Ln(pl,ax0,w-pr,ax0)+Ln(ay0,pt,ay0,h-pb);
  b+=T(w-pr,ax0+16,o.xl||"x","lbl","end")+T(ay0+6,pt+4,o.yl||"y","lbl","start");
  (o.curves||[]).forEach(c=>{let d="",pen=false;const n=160;for(let i=0;i<=n;i++){const x=o.xmin+(o.xmax-o.xmin)*i/n,y=c.f(x);if(!isFinite(y)||y<o.ymin-0.01*(o.ymax-o.ymin)||y>o.ymax+0.01*(o.ymax-o.ymin)){pen=false;continue}d+=(pen?"L":"M")+X(x).toFixed(1)+" "+Y(y).toFixed(1)+" ";pen=true}
    b+=`<path d="${d}" class="${c.cls||"cv"}"/>`;if(c.label)b+=T(X(c.lx),Y(c.ly),c.label,c.lcls||"acct","start")});
  (o.pts||[]).forEach(p=>{b+=Ci(X(p[0]),Y(p[1]),3.5,p[3]||"pt");if(p[2])b+=T(X(p[0])+(p[4]||6),Y(p[1])-(p[5]||7),p[2],"small",p[6]||"start")});
  if(o.extra)b+=o.extra(X,Y);
  return S(w,h,b,o.label||"graph");
}
function atom(cx,cy,sym,shells,opt){opt=opt||{};let b=Ci(cx,cy,15,"nuc")+T(cx,cy+4,sym,"nuct");
  shells.forEach((n,i)=>{const r=26+i*16;b+=`<circle cx="${cx}" cy="${cy}" r="${r}" class="shell"/>`;for(let k=0;k<n;k++){const a=-Math.PI/2+k*2*Math.PI/n;b+=Ci(cx+r*Math.cos(a),cy+r*Math.sin(a),opt.cross&&i===shells.length-1&&k<opt.cross?4:3.4,opt.cross&&i===shells.length-1&&k<opt.cross?"ecross":"el")}});return b}
function particles(x,y,w,h,kind){let b=Rc(x,y,w,h,"box");const r=7;
  if(kind==="solid"){for(let i=0;i<5;i++)for(let j=0;j<4;j++)b+=Ci(x+14+i*(r*2+1),y+h-12-j*(r*2+1),r,"part")}
  else if(kind==="liquid"){const P=[[14,12],[29,14],[44,11],[60,13],[75,12],[20,27],[36,28],[52,26],[68,29],[12,41],[28,43],[45,42],[62,40],[78,43]];P.forEach(p=>b+=Ci(x+p[0],y+h-p[1],r,"part"))}
  else{const P=[[16,18],[62,24],[38,52],[80,60],[20,80],[58,86],[84,30]];P.forEach(p=>b+=Ci(x+p[0]*w/100,y+p[1]*h/100,r,"part"));b+=Ar(x+16*w/100+9,y+18*h/100,x+16*w/100+24,y+18*h/100+6,"arrt")+Ar(x+58*w/100-9,y+86*h/100,x+58*w/100-24,y+86*h/100-8,"arrt")}
  return b}

// ---- figures ----
const FIG={
seqLine:()=>{let b="";const xs=[30,100,170,240,310];const v=[5,8,11,14,17];xs.forEach((x,i)=>{b+=Ci(x,50,16,"soft")+T(x,55,v[i],"big");if(i<4)b+=`<path d="M${x+14},34 Q${x+35},6 ${x+56},34" class="cv"/>`+T(x+35,14,"+3","acct")});
  const g=[3,6,12,24,48];xs.forEach((x,i)=>{b+=Ci(x,130,16,"soft")+T(x,135,g[i],"big");if(i<4)b+=`<path d="M${x+14},114 Q${x+35},86 ${x+56},114" class="cv2"/>`+T(x+35,94,"×2","acc2t")});
  b+=T(340,55,"arithmetic: add d","small","start")+T(340,135,"geometric: multiply by r","small","start");return S(520,160,b,"Arithmetic sequence adds 3 each time; geometric sequence multiplies by 2")},
seqQuad:()=>{const v=[4,9,18,31,48],d1=[5,9,13,17];let b=T(20,30,"terms","lbl","start")+T(20,80,"1st diff","lbl","start")+T(20,130,"2nd diff","lbl","start");
  v.forEach((t,i)=>b+=Rc(100+i*80,12,50,28,"soft")+T(125+i*80,31,t,"big"));d1.forEach((t,i)=>b+=T(165+i*80,85,t,"acct"));[4,4,4].forEach((t,i)=>b+=T(205+i*80,135,t,"acc2t"));
  b+=T(500,135,"constant → quadratic: a = 4 ÷ 2 = 2","small","end");return S(520,150,b,"Differences table: second differences constant at 4")},
gauss:()=>{let b="";for(let i=1;i<=6;i++){for(let j=0;j<i;j++)b+=Rc(20+(i-1)*26,140-j*20,24,18,"acc");for(let j=0;j<7-i;j++)b+=Rc(20+(i-1)*26,140-(i+j)*20,24,18,"soft")}
  b+=T(270,60,"1+2+…+6 (blue)","small","start")+T(270,82,"plus the same staircase upside down","small","start")+T(270,104,"= a 6 × 7 rectangle","small","start")+T(270,130,"so the sum = 6 × 7 ÷ 2 = 21","acct","start")+T(270,152,"Sₙ = n/2 (first + last)","big","start");return S(520,170,b,"Two copies of 1 to 6 make a 6 by 7 rectangle")},
geoHalf:()=>{let b=Rc(20,30,400,40,"soft",2);let x=20,wd=200;["½","¼","⅛","1/16",""].forEach((l,i)=>{b+=Rc(x,30,wd-2,40,i%2?"acc2":"acc",2);if(l)b+=T(x+wd/2,56,l,"onacc");x+=wd;wd/=2});
  b+=T(20,100,"½ + ¼ + ⅛ + 1/16 + … gets closer and closer to 1","small","start")+T(20,122,"S∞ = a ÷ (1 − r) = ½ ÷ (1 − ½) = 1   (only when −1 < r < 1)","acct","start");return S(440,135,b,"Halving pieces fill a bar of length 1")},
propGraphs:()=>graph({w:340,h:220,xmin:0,xmax:10,ymin:0,ymax:10,xl:"x",yl:"y",curves:[{f:x=>0.9*x,cls:"cv",label:"y = kx (direct)",lx:5.4,ly:6.6},{f:x=>9/x,cls:"cv2",label:"y = k/x (inverse)",lx:5.2,ly:2.6,lcls:"acc2t"}],label:"Direct proportion is a straight line through the origin; inverse is a curve approaching the axes"}),
propThree:()=>graph({w:340,h:220,xmin:0,xmax:5,ymin:0,ymax:10,curves:[{f:x=>2*x,cls:"cv",label:"y = 2x",lx:3.2,ly:6.9},{f:x=>0.6*x*x,cls:"cv3",label:"y = 0.6x²",lx:3.2,ly:8.6,lcls:"acc3t"},{f:x=>4/x,cls:"cv2",label:"y = 4/x",lx:3.3,ly:2,lcls:"acc2t"}],label:"Graphs of y = kx, y = kx² and y = k/x"}),
areaModel:()=>{let b=Rc(80,30,160,160,"accl",0)+Rc(240,30,90,160,"soft",0)+Rc(80,190,160,60,"soft",0)+Rc(240,190,90,60,"acc2l",0);
  b+=T(160,115,"x²","big")+T(285,115,"3x","big")+T(160,226,"2x","big")+T(285,226,"6","big");b+=T(160,22,"x","lbl")+T(285,22,"+3","lbl")+T(66,115,"x","lbl")+T(66,226,"+2","lbl");
  b+=T(350,110,"x² + 5x + 6","acct","start")+T(350,135,"= (x + 2)(x + 3)","big","start")+T(350,165,"2 × 3 = 6, 2 + 3 = 5","small","start");return S(540,265,b,"Area model: x squared plus 5x plus 6 equals (x+2)(x+3)")},
acGrid:()=>{let b=T(20,24,"2x² + 7x + 3:   a × c = 2 × 3 = 6","big","start")+T(20,48,"numbers that multiply to 6 and add to 7 → 6 and 1","small","start");
  b+=Rc(60,70,120,50,"accl",0)+Rc(180,70,120,50,"soft",0)+Rc(60,120,120,50,"soft",0)+Rc(180,120,120,50,"acc2l",0);b+=T(120,101,"2x²","big")+T(240,101,"6x","big")+T(120,151,"x","big")+T(240,151,"3","big");
  b+=T(120,64,"2x","lbl")+T(240,64,"+3","lbl")+T(44,101,"x","lbl")+T(44,151,"+1","lbl");b+=T(320,110,"split 7x into 6x + x,","small","start")+T(320,130,"factor each row/column:","small","start")+T(320,158,"(2x + 3)(x + 1)","acct","start");return S(540,180,b,"Grid method for factorising 2x squared plus 7x plus 3")},
discr:()=>{let b="";const box=(ox,f,lbl,sub)=>{let s="";const X=x=>ox+15+(x+3)/6*140,Y=y=>150-(y+3)/9*130;s+=Ln(ox+10,Y(0),ox+160,Y(0));let d="";for(let i=0;i<=60;i++){const x=-3+6*i/60,y=f(x);if(y>6||y<-3)continue;d+=(d?"L":"M")+X(x).toFixed(1)+" "+Y(y).toFixed(1)}s+=`<path d="${d}" class="cv"/>`+T(ox+85,175,lbl,"acct")+T(ox+85,195,sub,"small");return s};
  b+=box(0,x=>x*x-2,"Δ > 0","2 real roots")+box(175,x=>x*x,"Δ = 0","1 repeated root")+box(350,x=>x*x+1.5,"Δ < 0","no real roots");return S(520,205,b,"Three parabolas: crossing the x-axis twice, touching once, not crossing")},
vertexForm:()=>graph({w:380,h:250,xmin:-2,xmax:6,ymin:-10,ymax:8,curves:[{f:x=>x*x-4*x-5,cls:"cv"}],pts:[[2,-9,"vertex (2, −9)",null,8,-4],[-1,0,"root −1",null,-52,-18],[5,0,"root 5",null,8,-18],[0,-5,"y-intercept −5",null,6,8]],extra:(X,Y)=>`<line x1="${X(2)}" y1="${Y(8)}" x2="${X(2)}" y2="${Y(-10)}" class="dash"/>`+T(X(2)+6,Y(6.5),"axis x = 2","acct","start"),label:"Parabola y = x² − 4x − 5 with vertex, roots, intercept and axis of symmetry"}),
projectile:()=>graph({w:380,h:230,xmin:0,xmax:4.4,ymin:0,ymax:24,xl:"time t (s)",yl:"height h (m)",curves:[{f:t=>-5*t*t+20*t,cls:"cv"}],pts:[[2,20,"max: t = 2 s, h = 20 m",null,8,-4],[4,0,"lands t = 4 s",null,-36,-10]],extra:(X,Y)=>`<line x1="${X(2)}" y1="${Y(20)}" x2="${X(2)}" y2="${Y(0)}" class="dash"/>`,label:"Height of a ball h = −5t² + 20t"}),
fence:()=>{let b=Rc(20,20,330,14,"acc2",2)+T(185,31,"WALL","onacc");b+=`<path d="M60,34 L60,140 L310,140 L310,34" class="thick"/>`+T(45,90,"x","big")+T(325,90,"x","big")+T(185,160,"40 − 2x","big")+T(185,90,"Area A = x(40 − 2x)","acct");return S(370,175,b,"Rectangle against a wall with width x and length 40 minus 2x")},
measure:()=>{let b=Rc(20,40,440,34,"soft",2);for(let i=0;i<=40;i++){const x=30+i*10,len=i%10===0?16:i%5===0?11:7;b+=Ln(x,40,x,40+len,"tick");if(i%10===0)b+=T(x,90,i/10+" cm","small")}
  b+=Rc(30,18,230,16,"acc",2)+Ar(260,8,260,38,"arr2")+T(268,16,"object ends at 23 mm → record 2.30 cm ± 0.05 cm","small","start");
  b+=T(20,120,"Resolution = smallest division = 1 mm.  Uncertainty ≈ ± half a division = ± 0.5 mm","acct","start");return S(560,135,b,"Reading a ruler to its resolution")},
uncert:()=>{let b=T(20,24,"Adding/subtracting → add ABSOLUTE uncertainties","big","start")+T(30,48,"(12.0 ± 0.1) + (5.0 ± 0.1) = 17.0 ± 0.2","small","start");
  b+=T(20,84,"Multiplying/dividing → add PERCENTAGE uncertainties","big","start")+T(30,108,"(4.0 ± 2.5%) × (2.5 ± 4%) = 10 ± 6.5%","small","start");return S(520,125,b,"Rules for combining uncertainties")},
investigation:()=>{let b="";const box=(x,y,t,s,cls)=>Rc(x,y,150,52,cls||"soft",8)+T(x+75,y+22,t,"big")+T(x+75,y+40,s,"small");
  b+=box(10,20,"Independent","what you CHANGE","accl")+box(190,20,"Dependent","what you MEASURE","acc2l")+box(370,20,"Controls","what you KEEP SAME");b+=Ar(160,46,188,46,"arr");
  b+=nest(graph({w:300,h:150,xmin:0,xmax:10,ymin:0,ymax:10,xl:"IV",yl:"DV",curves:[{f:x=>0.85*x+0.6,cls:"cv"}],pts:[[1,1.6],[2,2.1],[3,3.4],[4,3.9],[5,4.9],[6,5.6],[7,7.9,"anomaly",null,-24,12],[8,7.6],[9,8.2]]}),110,90,300,150);
  return S(530,250,b,"Variables in an investigation and a graph with a line of best fit and one anomaly")},
distDisp:()=>{let b=Ci(40,140,6,"pt")+T(40,162,"start","small")+Ci(300,140,6,"pt")+T(300,162,"finish","small");b+=`<path d="M40,140 C60,30 160,20 180,90 S260,170 300,140" class="cv2"/>`+T(150,30,"distance = length of the path walked","acc2t")+Ar(46,140,292,140,"arr")+T(170,130,"displacement = straight line + direction","acct");return S(360,175,b,"Distance follows the path; displacement is the straight-line change in position")},
motionGraphs:()=>{const g1=graph({w:300,h:190,xmin:0,xmax:30,ymin:0,ymax:60,xl:"t (s)",yl:"distance (m)",curves:[{f:t=>t<=10?5*t:t<=20?50:50-5*(t-20),cls:"cv"}],extra:(X,Y)=>T(X(6),Y(20),"gradient = speed","acct","start")+T(X(12),Y(54),"flat = stopped","small","start")});
  const g2=graph({w:300,h:190,xmin:0,xmax:30,ymin:0,ymax:25,xl:"t (s)",yl:"velocity (m/s)",curves:[{f:t=>t<=10?2*t:t<=25?20:20-4*(t-25),cls:"cv2"}],extra:(X,Y)=>`<path d="M${X(0)},${Y(0)} L${X(10)},${Y(20)} L${X(25)},${Y(20)} L${X(30)},${Y(0)} Z" class="fillsoft"/>`+T(X(17),Y(7),"area = distance","acc2t")+T(X(11.5),Y(16),"gradient = acceleration","small","start")});
  return S(620,200,nest(g1,0,0,300,190)+nest(g2,315,0,300,190),"Distance-time and velocity-time graphs")},
stopping:()=>{let b=Rc(20,40,150,40,"acc2",4)+T(95,65,"thinking","onacc")+Rc(170,40,300,40,"acc",4)+T(320,65,"braking","onacc");b+=Ar(20,100,470,100,"arr")+T(245,120,"stopping distance = thinking + braking","big");
  b+=T(95,28,"speed × reaction time","small")+T(320,28,"∝ speed²  (double speed → ×4)","small")+T(95,150,"tired, alcohol, phone ↑","acc2t")+T(320,150,"wet/icy road, worn tyres or brakes ↑","acct");return S(490,165,b,"Stopping distance equals thinking distance plus braking distance")},
fbd:()=>{let b=Rc(150,80,90,60,"soft",4)+T(195,115,"6 kg box","small");b+=Ar(240,110,330,110,"arr")+T(335,106,"push 50 N","acct","start")+Ar(150,110,90,110,"arr2")+T(85,106,"friction 20 N","acc2t","end")+Ar(195,140,195,200,"arr3")+T(205,195,"weight 60 N","small","start")+Ar(195,80,195,20,"arr3")+T(205,26,"normal 60 N","small","start");
  b+=T(195,232,"resultant = 50 − 20 = 30 N → a = F/m = 30 ÷ 6 = 5 m/s²","acct");return S(400,245,b,"Free body diagram of a pushed box")},
momentum:()=>{let b=T(20,22,"before","lbl","start")+Rc(30,40,80,40,"acc",4)+T(70,65,"2 kg","onacc")+Ar(115,60,165,60,"arr")+T(140,52,"3 m/s","small")+Rc(200,40,60,40,"soft",4)+T(230,65,"1 kg","small")+T(230,96,"at rest","small");
  b+=T(20,130,"after","lbl","start")+Rc(30,145,80,40,"acc",4)+Rc(110,145,60,40,"soft",4)+T(70,170,"2 kg","onacc")+T(140,170,"1 kg","small")+Ar(175,165,225,165,"arr")+T(200,157,"v = ?","small");
  b+=T(290,70,"p before = 2 × 3 = 6 kg m/s","small","start")+T(290,170,"p after = 3 × v = 6 → v = 2 m/s","acct","start");return S(540,200,b,"Momentum before and after a collision")},
skydiver:()=>{let b="";const stage=(x,w,d,t)=>{let s=Ci(x,90,10,"part")+Ar(x,102,x,102+w,"arr3")+T(x+8,102+w,"W","small","start");if(d)s+=Ar(x,78,x,78-d,"arr2")+T(x+8,78-d+10,"drag","small","start");s+=T(x,190,t,"small");return s};
  b+=stage(50,50,0,"jump: W > drag")+stage(160,50,25,"speeding up")+stage(270,50,50,"terminal: W = drag")+stage(390,50,80,"chute: drag > W")+stage(500,50,50,"new, slower terminal");return S(570,205,b,"Forces on a skydiver at five stages")},
moments:()=>{let b=`<polygon points="250,130 235,160 265,160" class="acc"/>`+Rc(40,120,420,10,"soft",2)+Ar(110,60,110,118,"arr3")+T(110,52,"300 N","small")+Ar(355,60,355,118,"arr3")+T(355,52,"400 N","small");
  b+=T(180,148,"2.0 m","small")+T(302,148,"1.5 m","small")+T(250,190,"anticlockwise 300 × 2.0 = 600 Nm = clockwise 400 × 1.5 = 600 Nm ✓","acct");return S(500,205,b,"Balanced seesaw: moments equal on both sides")},
hooke:()=>graph({w:360,h:230,xmin:0,xmax:14,ymin:0,ymax:6,xl:"extension (cm)",yl:"force (N)",curves:[{f:x=>x<=6?x/2:3+(Math.sqrt(1+(x-6)*0.6)-1)*1.6,cls:"cv"}],pts:[[6,3,"limit of proportionality",null,8,10]],extra:(X,Y)=>T(X(1.5),Y(2.6),"straight: F = kx","acct","start"),label:"Force against extension: straight line until the limit of proportionality"}),
states:()=>{let b=particles(20,30,100,80,"solid")+particles(170,30,100,80,"liquid")+particles(320,30,100,80,"gas");b+=T(70,128,"solid","big")+T(220,128,"liquid","big")+T(370,128,"gas","big");
  b+=T(70,146,"fixed, regular, vibrate","small")+T(220,146,"close, random, slide","small")+T(370,146,"far apart, fast, random","small");b+=Ar(124,62,166,62,"arr")+T(145,54,"melt","small")+Ar(274,62,316,62,"arr")+T(295,54,"boil","small");return S(440,160,b,"Particle diagrams of solid, liquid and gas")},
heating:()=>graph({w:380,h:230,xmin:0,xmax:10,ymin:-30,ymax:130,xl:"time (heat added)",yl:"temp (°C)",curves:[{f:t=>t<1?-20+20*t:t<3?0:t<5.5?40*(t-3):t<8.5?100:100+15*(t-8.5),cls:"cv"}],extra:(X,Y)=>T(X(1.2),Y(12),"melting (flat)","acct","start")+T(X(5.7),Y(112),"boiling (flat)","acct","start"),label:"Heating curve for water with flat sections at 0 and 100 degrees"}),
gasTests:()=>{const rows=[["Hydrogen","lit splint","squeaky pop"],["Oxygen","glowing splint","relights"],["Carbon dioxide","bubble through limewater","turns milky"],["Chlorine","damp litmus paper","bleached white"]];let b=Rc(10,10,500,30,"accl",4)+T(30,30,"Gas","big","start")+T(180,30,"Test","big","start")+T(360,30,"Positive result","big","start");
  rows.forEach((r,i)=>{b+=T(30,62+i*28,r[0],"","start")+T(180,62+i*28,r[1],"small","start")+T(360,62+i*28,r[2],"acct","start")});return S(520,180,b,"Tests for hydrogen, oxygen, carbon dioxide and chlorine")},
separation:()=>{let b="";const box=(x,y,t,s,cls)=>Rc(x,y,150,46,cls||"soft",8)+T(x+75,y+20,t,"big")+T(x+75,y+37,s,"small");
  b+=box(185,10,"What is the mixture?","","accl");b+=Ar(220,56,90,90,"arr")+Ar(260,56,260,90,"arr")+Ar(300,56,430,90,"arr");
  b+=box(15,92,"insoluble solid","+ liquid → filtration")+box(185,92,"dissolved solid","→ evaporation")+box(355,92,"two liquids","→ (fractional) distillation")+box(185,160,"coloured dyes","→ chromatography","acc2l");return S(520,215,b,"Choosing a separation technique")},
atomNa:()=>{let b=atom(110,110,"Na",[2,8,1])+T(110,200,"sodium: 2, 8, 1","acct");b+=T(240,40,"²³₁₁Na","big","start")+T(240,66,"protons = 11 (atomic number)","small","start")+T(240,88,"neutrons = 23 − 11 = 12","small","start")+T(240,110,"electrons = 11 (neutral atom)","small","start")+T(240,140,"shells fill 2, 8, 8 … for the first 20","small","start")+T(240,162,"3 shells → Period 3; 1 outer e⁻ → Group 1","acct","start");return S(520,210,b,"Sodium atom with shells 2, 8, 1")},
isotopes:()=>{let b="";const nuc=(x,p,n,l)=>{let s="";for(let i=0;i<p+n;i++){const a=i*2.4,r=4*Math.sqrt(i);s+=Ci(x+r*Math.cos(a),70+r*Math.sin(a),5,i<p?"proton":"neutron")}return s+T(x,140,l,"big")};
  b+=nuc(80,6,6,"carbon-12")+T(80,160,"6 p, 6 n","small")+nuc(250,6,8,"carbon-14")+T(250,160,"6 p, 8 n","small");b+=Ci(340,40,5,"proton")+T(350,44,"proton","small","start")+Ci(340,62,5,"neutron")+T(350,66,"neutron","small","start")+T(330,110,"same protons → same element","acct","start")+T(330,130,"different neutrons → different mass","small","start");return S(560,175,b,"Carbon-12 and carbon-14 nuclei")},
ionic:()=>{let b=atom(90,100,"Na",[2,8,1],{cross:1})+atom(300,100,"Cl",[2,8,7]);b+=`<path d="M147,62 Q200,20 250,60" class="cv2"/>`+`<polygon points="250,60 240,52 238,62" class="acc2"/>`+T(200,30,"1 electron moves","acc2t");
  b+=T(90,190,"Na → Na⁺ (2, 8)","acct")+T(300,190,"Cl → Cl⁻ (2, 8, 8)","acct")+T(195,215,"opposite charges attract: ionic bond","big");return S(400,225,b,"Sodium gives one electron to chlorine")},
covalent:()=>{let b=`<circle cx="150" cy="100" r="44" class="shell"/><circle cx="90" cy="150" r="28" class="shell"/><circle cx="210" cy="150" r="28" class="shell"/>`+T(150,105,"O","big")+T(90,155,"H","big")+T(210,155,"H","big");
  [[116,122,"el"],[123,130,"ecross"],[184,122,"el"],[177,130,"ecross"],[136,60,"el"],[164,60,"el"],[130,68,"el"],[170,68,"el"]].forEach(p=>b+=Ci(p[0],p[1],4,p[2]));
  b+=T(300,70,"water, H₂O","big","start")+T(300,95,"each overlap = one shared pair","small","start")+T(300,117,"= one covalent bond","small","start")+T(300,145,"O now has 8 outer e⁻, each H has 2","acct","start");return S(520,195,b,"Dot and cross diagram of water")},
giant:()=>{let b="";for(let i=0;i<5;i++)for(let j=0;j<4;j++){const na=(i+j)%2===0;b+=Ci(30+i*30,40+j*30,na?9:12,na?"proton":"neutron")+T(30+i*30,44+j*30,na?"+":"−","tiny")}b+=T(90,175,"NaCl lattice","small");
  for(let k=0;k<3;k++){let d="";for(let i=0;i<6;i++){const x=230+i*24,y=40+k*45+(i%2?8:0);d+=(d?"L":"M")+x+" "+y}b+=`<path d="${d}" class="cv"/>`}b+=T(290,175,"graphite: layers (3 bonds each)","small");
  b+=`<path d="M410,50 L450,80 L410,110 L370,80 Z M410,50 L410,110 M370,80 L450,80" class="cv2"/>`+T(410,175,"diamond: 4 bonds each","small");return S(500,190,b,"Giant ionic lattice, graphite layers and diamond")},
metallic:()=>{let b=Rc(20,20,220,140,"soft",8);for(let i=0;i<5;i++)for(let j=0;j<3;j++)b+=Ci(50+i*40,50+j*40,13,"acc")+T(50+i*40,55+j*40,"+","onacc");[[70,70],[110,92],[150,68],[190,95],[90,130],[170,128],[30,100],[220,40]].forEach(p=>b+=Ci(p[0],p[1],3.5,"el"));
  b+=T(130,180,"metal ions in a sea of delocalised electrons","small");let hx="";for(let i=0;i<3;i++)for(let j=0;j<2;j++){const cx=320+i*44+(j%2)*22,cy=60+j*38;let d="";for(let k=0;k<6;k++){const a=Math.PI/6+k*Math.PI/3;d+=(k?"L":"M")+(cx+22*Math.cos(a)).toFixed(1)+" "+(cy+22*Math.sin(a)).toFixed(1)}hx+=`<path d="${d}Z" class="cv"/>`}b+=hx+T(370,180,"graphene: one layer of hexagons","small");return S(470,195,b,"Metallic bonding and graphene")},
structureFlow:()=>{let b="";const box=(x,y,t,cls)=>Rc(x,y,140,40,cls||"soft",8)+T(x+70,y+25,t,"small");
  b+=box(190,8,"Conducts as a solid?","accl")+Ar(230,48,110,78,"arr")+Ar(290,48,400,78,"arr")+T(150,62,"yes","acct")+T(370,62,"no","acc2t");b+=box(40,80,"metallic (or graphite)")+box(330,80,"High melting point?","accl");
  b+=Ar(370,120,290,150,"arr")+Ar(430,120,450,150,"arr")+T(310,140,"no","acc2t")+T(470,140,"yes","acct");b+=box(200,152,"simple molecular")+box(380,152,"conducts when molten?","accl");b+=Ar(420,192,350,222,"arr")+Ar(480,192,470,222,"arr");b+=box(270,224,"giant ionic (yes)")+box(420,224,"giant covalent (no)");return S(570,275,b,"Flowchart to deduce structure from properties")}
};

// ---- topics: outcomes come from the school's Term 1 outline ----
const TOPICS=[
// ===================== MATH =====================
{id:"M8",subj:"Math",unit:"Unit 1 · Sequences and Series",title:"Sequences: nth term, arithmetic, geometric, quadratic",
 outcomes:["Understand and use recursive and explicit formulae for sequences","Recognise linear and quadratic sequences","Find a general formula for a linear or quadratic sequence","Use explicit and recursive formulae for arithmetic and geometric sequences","Find and justify general rules for sequences"],
 summary:"A sequence is an ordered list of numbers. An <b>explicit</b> formula gives any term directly from its position n; a <b>recursive</b> formula gives the next term from the one before.",
 sections:[
  {h:"Arithmetic vs geometric",p:"<b>Arithmetic</b>: add the same number (common difference <i>d</i>) each time. nth term <b>uₙ = a + (n − 1)d</b>.<br><b>Geometric</b>: multiply by the same number (common ratio <i>r</i>). nth term <b>uₙ = a·rⁿ⁻¹</b>.",fig:"seqLine"},
  {h:"Recursive formulae",p:"A recursive rule needs a starting value. Example: u₁ = 5, uₙ₊₁ = uₙ + 3 gives 5, 8, 11, 14 … The geometric version: u₁ = 3, uₙ₊₁ = 2uₙ gives 3, 6, 12, 24 …"},
  {h:"Quadratic sequences",p:"If the <b>second differences</b> are constant, the sequence is quadratic: uₙ = an² + bn + c. The coefficient <b>a = second difference ÷ 2</b>. Subtract an² from each term; what is left is a linear sequence bn + c.",fig:"seqQuad"}],
 examples:[
  {q:"Find the nth term of 7, 11, 15, 19 … and decide whether 201 is a term.",steps:["Common difference d = 4, so the nth term starts 4n.","When n = 1, 4n = 4 but we need 7 → add 3: uₙ = 4n + 3.","Solve 4n + 3 = 201 → 4n = 198 → n = 49.5.","n is not a whole number, so 201 is NOT a term."]},
  {q:"Find the nth term of 4, 9, 18, 31, 48 …",steps:["First differences: 5, 9, 13, 17. Second differences: 4, 4, 4.","a = 4 ÷ 2 = 2, so start with 2n²: 2, 8, 18, 32, 50.","Terms − 2n²: 2, 1, 0, −1, −2 → that is −n + 3.","uₙ = 2n² − n + 3. Check n = 2: 8 − 2 + 3 = 9 ✓"]}],
 mistakes:["Writing uₙ = a·rⁿ instead of a·rⁿ⁻¹ (the first term would then be wrong).","Forgetting to halve the second difference for the n² coefficient.","Saying a number is a term without checking that n is a positive whole number."]},
{id:"M9",subj:"Math",unit:"Unit 1 · Sequences and Series",title:"Series: arithmetic, finite and infinite geometric sums",
 outcomes:["Find the sum of an arithmetic series","Find the sum of a finite geometric series","Find the sum of an infinite geometric series, where appropriate","Recognise arithmetic and geometric sequences in context"],
 summary:"A <b>series</b> is the sum of the terms of a sequence. There is a formula for each type, so you never need to add terms one by one.",
 sections:[
  {h:"Arithmetic series",p:"<b>Sₙ = n/2 (2a + (n − 1)d)</b> or <b>Sₙ = n/2 (first + last)</b>. The trick: write the sum forwards and backwards; each pair adds to the same total.",fig:"gauss"},
  {h:"Finite geometric series",p:"<b>Sₙ = a(1 − rⁿ) / (1 − r)</b> (same as a(rⁿ − 1)/(r − 1), easier when r > 1)."},
  {h:"Infinite geometric series",p:"If <b>−1 &lt; r &lt; 1</b>, the terms shrink to 0 and the sum settles at <b>S∞ = a / (1 − r)</b>. If |r| ≥ 1 there is no sum to infinity.",fig:"geoHalf"}],
 examples:[
  {q:"Find the sum of the first 30 terms of 5, 8, 11, …",steps:["a = 5, d = 3, n = 30.","S₃₀ = 30/2 × (2×5 + 29×3) = 15 × (10 + 87).","= 15 × 97 = 1455."]},
  {q:"A ball dropped from 2 m bounces to 60% of its height each time. Total distance travelled?",steps:["Down 2 m first.","Bounce heights: 1.2, 0.72, … geometric with a = 1.2, r = 0.6.","Sum of heights = 1.2 ÷ (1 − 0.6) = 3 m; each bounce goes up AND down → 6 m.","Total = 2 + 6 = 8 m."]}],
 mistakes:["Using S∞ when |r| ≥ 1.","Mixing up n (number of terms) with the last term.","Forgetting that a bouncing ball travels each height twice (up and down)."]},
{id:"M1",subj:"Math",unit:"Unit 2 · Proportional Equations",title:"Direct and inverse proportion: finding k",
 outcomes:["Find a constant of proportionality","Set up direct and indirect proportion equations to model a situation"],
 summary:"<b>Direct</b>: y ∝ x means <b>y = kx</b> (double x → double y). <b>Inverse</b>: y ∝ 1/x means <b>y = k/x</b> (double x → halve y). Always find k first.",
 sections:[
  {h:"The 4-step method",p:"1) Write the equation with k (y = kx, y = k/x, y = kx², y = k/x² …). 2) Substitute the pair of values you know. 3) Solve for k. 4) Rewrite the equation with k and use it.",fig:"propGraphs"},
  {h:"Spotting which type",p:"\"More workers → fewer days\" is inverse. \"More metres → more cost\" is direct. Squares and roots appear in physics: area ∝ length², light intensity ∝ 1/distance²."}],
 examples:[
  {q:"5 workers take 12 days. How long for 8 workers?",steps:["Inverse: days = k / workers.","k = 5 × 12 = 60.","Days = 60 ÷ 8 = 7.5 days."]},
  {q:"y is inversely proportional to x². y = 5 when x = 2. Find y when x = 5.",steps:["y = k/x².","5 = k/4 → k = 20.","y = 20/25 = 0.8."]}],
 mistakes:["Using y = kx when the situation is inverse.","Forgetting to square x before substituting into y = kx².","Not writing the final equation with the value of k."]},
{id:"M2",subj:"Math",unit:"Unit 2 · Proportional Equations",title:"Proportion graphs and tables",
 outcomes:["Graph direct and indirect relationships","Recognise direct and inverse proportion from graphs","Identify direct and inverse proportion from tables of values"],
 summary:"From a table: if <b>y ÷ x</b> is constant it is direct; if <b>x × y</b> is constant it is inverse. From a graph: direct is a straight line <b>through the origin</b>.",
 sections:[
  {h:"What the graphs look like",p:"y = kx: straight line through (0, 0), gradient k. y = kx²: curve through (0, 0) that gets steeper. y = k/x: curve that gets close to both axes but never touches them.",fig:"propThree"},
  {h:"Testing a table",p:"Direct: x 1, 2, 3 → y 5, 10, 15 (y/x = 5). Inverse: x 1, 2, 4 → y 16, 8, 4 (xy = 16). A straight line that does NOT pass through the origin (e.g. y = 2x + 1) is linear but NOT proportional."}],
 examples:[
  {q:"x: 2, 5, 8 and y: 7, 17.5, 28. Is y ∝ x?",steps:["y ÷ x: 7/2 = 3.5, 17.5/5 = 3.5, 28/8 = 3.5.","Constant, so yes: y = 3.5x."]}],
 mistakes:["Calling any straight line \"direct proportion\": it must go through the origin.","Testing only one pair of values."]},
{id:"M3",subj:"Math",unit:"Unit 2 · Quadratic Functions",title:"Factorising quadratics (a = 1) and difference of two squares",
 outcomes:["Factorise quadratic expressions where the coefficient of x² is 1, including the difference of two squares","Solve quadratic equations algebraically"],
 summary:"For x² + bx + c, find two numbers that <b>multiply to c</b> and <b>add to b</b>. Difference of two squares: <b>a² − b² = (a − b)(a + b)</b>.",
 sections:[
  {h:"Why it works: the area model",p:"Expanding (x + 2)(x + 3) gives x² + 3x + 2x + 6 = x² + 5x + 6. Factorising runs this backwards.",fig:"areaModel"},
  {h:"Signs",p:"c positive, b positive → both numbers positive. c positive, b negative → both negative. c negative → one positive, one negative (the bigger one has the sign of b)."},
  {h:"Solving",p:"Set the expression = 0, factorise, then each bracket = 0. Never divide both sides by x: x² − 5x = 0 → x(x − 5) = 0 → x = 0 or x = 5."}],
 examples:[
  {q:"Solve x² − 3x − 28 = 0",steps:["Multiply to −28, add to −3: −7 and +4.","(x − 7)(x + 4) = 0.","x = 7 or x = −4."]},
  {q:"Factorise fully 2x² − 18",steps:["Common factor first: 2(x² − 9).","x² − 9 = x² − 3² → difference of two squares.","2(x − 3)(x + 3)."]}],
 mistakes:["Forgetting to take out a common factor first.","Writing x² + 9 = (x − 3)(x + 3): a SUM of squares does not factorise.","Dividing by x and losing the x = 0 solution."]},
{id:"M4",subj:"Math",unit:"Unit 2 · Quadratic Functions",title:"Factorising when a ≠ 1",
 outcomes:["Factorise quadratic expressions where the coefficient of x² is not 1"],
 summary:"Use the <b>ac method</b>: find two numbers that multiply to <b>a × c</b> and add to <b>b</b>, split the middle term, then factorise in pairs.",
 sections:[
  {h:"The grid (box) method",p:"Put ax² top-left and c bottom-right, the two split terms in the other boxes, then take out common factors from each row and column.",fig:"acGrid"},
  {h:"Always check",p:"Expand your answer. If it gives back the original, it's right."}],
 examples:[
  {q:"Factorise 4x² − 4x − 15",steps:["a × c = 4 × −15 = −60. Two numbers: −10 and +6.","4x² − 10x + 6x − 15.","2x(2x − 5) + 3(2x − 5).","(2x + 3)(2x − 5)."]},
  {q:"Solve 3x² + 11x − 4 = 0",steps:["ac = −12: numbers 12 and −1.","3x² + 12x − x − 4 = 3x(x + 4) − 1(x + 4).","(3x − 1)(x + 4) = 0 → x = ⅓ or x = −4."]}],
 mistakes:["Finding numbers that multiply to c instead of a × c.","Sign errors when taking out −1 in the second pair."]},
{id:"M5",subj:"Math",unit:"Unit 2 · Quadratic Functions",title:"Quadratic formula and the discriminant",
 outcomes:["Solve quadratic equations using the quadratic formula","Discriminant of a quadratic function"],
 summary:"For ax² + bx + c = 0: <b>x = (−b ± √(b² − 4ac)) / 2a</b>. The <b>discriminant Δ = b² − 4ac</b> tells you how many real roots there are.",
 sections:[
  {h:"What Δ tells you",p:"Δ > 0: two different roots (graph crosses the x-axis twice). Δ = 0: one repeated root (touches). Δ < 0: no real roots (doesn't reach the axis).",fig:"discr"},
  {h:"Using the formula safely",p:"Write a, b, c with their signs first. Work out Δ on its own line. Use brackets on the calculator: (−b + √Δ) ÷ (2a)."}],
 examples:[
  {q:"Solve 2x² − 3x − 4 = 0 to 2 d.p.",steps:["a = 2, b = −3, c = −4.","Δ = (−3)² − 4(2)(−4) = 9 + 32 = 41.","x = (3 ± √41) / 4.","x = 2.35 or x = −0.85."]},
  {q:"For which p does x² + px + 9 = 0 have one repeated root?",steps:["One root → Δ = 0.","p² − 4(1)(9) = 0 → p² = 36.","p = 6 or p = −6."]}],
 mistakes:["Writing −b as −3 when b = −3 (it should be +3).","Dividing only √Δ by 2a instead of the whole top.","Forgetting both ± answers."]},
{id:"M6",subj:"Math",unit:"Unit 2 · Quadratic Functions",title:"Three forms of a quadratic: vertex, axis, finding the equation",
 outcomes:["Express a quadratic function in standard, factored and vertex form","Find the axis of symmetry and vertex of a quadratic function","Find a quadratic function given three distinct points on its graph","Solve quadratic equations graphically"],
 summary:"<b>Standard</b> y = ax² + bx + c shows the y-intercept c. <b>Factored</b> y = a(x − p)(x − q) shows the roots p, q. <b>Vertex</b> y = a(x − h)² + k shows the vertex (h, k).",
 sections:[
  {h:"Reading a parabola",p:"Axis of symmetry: x = −b/2a, or halfway between the roots. a > 0 opens up (minimum); a < 0 opens down (maximum).",fig:"vertexForm"},
  {h:"Completing the square",p:"x² + bx + c = (x + b/2)² − (b/2)² + c. Example: x² − 4x − 5 = (x − 2)² − 4 − 5 = (x − 2)² − 9 → vertex (2, −9). If a ≠ 1, factor a out of the x terms first."},
  {h:"Finding the equation from points",p:"If you know the roots, use y = a(x − p)(x − q) and one more point to find a. If you know the vertex, use y = a(x − h)² + k."}],
 examples:[
  {q:"Find the quadratic through (0, 3), (1, 0) and (3, 0).",steps:["Roots 1 and 3: y = a(x − 1)(x − 3).","Use (0, 3): 3 = a(−1)(−3) = 3a → a = 1.","y = x² − 4x + 3."]},
  {q:"Write y = 2x² + 12x + 7 in vertex form.",steps:["Factor 2 from x terms: 2(x² + 6x) + 7.","Complete the square: 2[(x + 3)² − 9] + 7.","= 2(x + 3)² − 11 → vertex (−3, −11), a minimum."]}],
 mistakes:["Reading the vertex of (x + 3)² as (3, …) instead of (−3, …).","Forgetting to multiply the −(b/2)² by a when a ≠ 1."]},
{id:"M7",subj:"Math",unit:"Unit 2 · Quadratic Functions",title:"Quadratic optimisation and modelling a real-life parabola",
 outcomes:["Find a function to model a real-life parabola","Quadratic optimisation"],
 summary:"The maximum or minimum of a quadratic is at its <b>vertex</b>, where <b>x = −b/2a</b>. Real problems: highest point of a ball, biggest area, most profit.",
 sections:[
  {h:"Projectiles",p:"Height h = −5t² + 20t: the vertex t = −20/(2×−5) = 2 s gives the maximum height h(2) = 20 m. It lands when h = 0 again: t = 4 s.",fig:"projectile"},
  {h:"Area problems",p:"Write the area as a quadratic in one variable, then find its vertex.",fig:"fence"}],
 examples:[
  {q:"40 m of fence, rectangle against a wall (3 sides). Maximum area?",steps:["Width x, length 40 − 2x, A = x(40 − 2x) = 40x − 2x².","Vertex: x = −40/(2×−2) = 10.","A = 10 × 20 = 200 m². It's a maximum because a = −2 < 0."]},
  {q:"An arch is 10 m wide and 4 m high. Model it.",steps:["Put roots at x = 0 and x = 10: y = ax(x − 10).","Vertex (5, 4): 4 = a × 5 × (−5) → a = −0.16.","y = −0.16x(x − 10)."]}],
 mistakes:["Giving the x-value of the vertex when the question asks for the maximum value.","Forgetting units (m, s, m², AED)."]},
// ===================== PHYSICS =====================
{id:"P8",subj:"Physics",unit:"Unit 1 · Working as a Scientist",title:"Measurement: SI units, resolution, significant figures, uncertainty",
 outcomes:["Name the SI units for length, mass, time, volume and temperature","Choose the correct measuring instrument and read it accurately","Record every reading to the resolution the instrument allows","Use significant figures to show how precise a measurement is","State the uncertainty in a reading as absolute and percentage","Combine uncertainties when measurements are added or multiplied (extension)"],
 summary:"SI units: length <b>m</b>, mass <b>kg</b>, time <b>s</b>, volume <b>m³</b> (often cm³ or dm³), temperature <b>K</b>. Every reading has an <b>uncertainty</b>.",
 sections:[
  {h:"Resolution and uncertainty",p:"Resolution = smallest change an instrument can show. Record readings to that resolution (48.0 cm, not 48 cm). Absolute uncertainty ≈ ± half the smallest division for one reading. <b>% uncertainty = absolute ÷ reading × 100</b>.",fig:"measure"},
  {h:"Significant figures",p:"Leading zeros don't count (0.0045 has 2 s.f.); zeros between digits and trailing zeros after the decimal point do (4.050 has 4 s.f.). Give answers to the same s.f. as the least precise data."},
  {h:"Combining uncertainties (extension)",p:"",fig:"uncert"}],
 examples:[
  {q:"A length is 25.0 ± 0.5 cm. Percentage uncertainty?",steps:["0.5 ÷ 25.0 = 0.02.","× 100 = 2%."]},
  {q:"Area of 4.0 ± 0.1 cm by 2.5 ± 0.1 cm?",steps:["Area = 10 cm².","% uncertainties: 0.1/4.0 = 2.5%, 0.1/2.5 = 4%.","Multiplying → add: 6.5% of 10 = 0.65.","Area = 10 ± 0.7 cm²."]}],
 mistakes:["Using °C as the SI unit (it's K).","Writing more decimal places than the instrument can read.","Adding absolute uncertainties when multiplying."]},
{id:"P9",subj:"Physics",unit:"Unit 1 · Working as a Scientist",title:"Investigations: variables, hypothesis, method, graphs, evaluation",
 outcomes:["Identify the independent, dependent and control variables in an investigation","Write a research question and a hypothesis supported by a scientific reason","Write a method another person could follow and repeat","Present data in a results table and as a graph with a line of best fit","Write a conclusion from the evidence and evaluate the method used"],
 summary:"MYP Criteria B and C: plan a fair test, collect precise data, present it clearly, and judge how good your method was.",
 sections:[
  {h:"Variables and graphs",p:"Independent on the x-axis, dependent on the y-axis. Units in every column heading: \"Drop height (cm)\". Draw a line of best fit, not dot-to-dot, and circle anomalies.",fig:"investigation"},
  {h:"A strong hypothesis",p:"\"If the drop height increases, the bounce height will increase, <b>because</b> the ball gains more gravitational potential energy, which becomes more kinetic energy.\""},
  {h:"Evaluating",p:"Say what limited accuracy (e.g. reaction time with a stopwatch), how big its effect was, and a specific improvement (light gates, video, more repeats, wider range)."}],
 examples:[
  {q:"Bounce investigation: name the variables.",steps:["Independent: drop height.","Dependent: bounce height.","Controls: same ball, same surface, same person measuring at eye level."]}],
 mistakes:["Hypothesis with no scientific reason.","Vague improvements like \"be more careful\".","Joining points instead of a line of best fit."]},
{id:"P1",subj:"Physics",unit:"Unit 2 · Forces and Motion",title:"Distance, displacement, speed, velocity, acceleration",
 outcomes:["Distinguish distance from displacement and speed from velocity","Calculate acceleration and use the kinematics equation"],
 summary:"Scalars have size only (distance, speed). Vectors have size and direction (displacement, velocity, acceleration, force).",
 sections:[
  {h:"Distance vs displacement",p:"",fig:"distDisp"},
  {h:"Key equations",p:"speed = distance ÷ time.<br>acceleration <b>a = (v − u) / t</b> (m/s²).<br>kinematics: <b>v² = u² + 2as</b> (u = start velocity, v = final, s = displacement). Negative a means slowing down."}],
 examples:[
  {q:"A cyclist speeds up from 4 m/s to 10 m/s in 3 s. Find a and the distance.",steps:["a = (10 − 4)/3 = 2 m/s².","v² = u² + 2as → 100 = 16 + 4s.","s = 84 ÷ 4 = 21 m."]},
  {q:"A car at 25 m/s brakes at 5 m/s². Stopping distance?",steps:["0² = 25² − 2 × 5 × s.","10s = 625 → s = 62.5 m."]}],
 mistakes:["Forgetting the direction for velocity or displacement.","Using v² = u² + 2as with time in it (no t in this equation)."]},
{id:"P2",subj:"Physics",unit:"Unit 2 · Forces and Motion",title:"Distance–time and velocity–time graphs",
 outcomes:["Interpret distance–time and velocity–time graphs","Find speed from the gradient of a graph and distance from the area under it","Analyse a curved motion graph and find the speed at an instant (extension)"],
 summary:"On a distance–time graph, <b>gradient = speed</b>. On a velocity–time graph, <b>gradient = acceleration</b> and <b>area under = distance</b>.",
 sections:[
  {h:"Reading both graphs",p:"",fig:"motionGraphs"},
  {h:"Curved graphs (extension)",p:"To find the speed at one instant, draw a <b>tangent</b> at that point and find its gradient (rise ÷ run)."}],
 examples:[
  {q:"0→20 m/s in 10 s, steady for 15 s, then stops in 5 s. Total distance?",steps:["Triangle: ½ × 10 × 20 = 100 m.","Rectangle: 15 × 20 = 300 m.","Triangle: ½ × 5 × 20 = 50 m.","Total = 450 m."]}],
 mistakes:["Reading a flat line on a v–t graph as \"stopped\" (it means constant velocity).","Finding the gradient of a v–t graph when the question asks for distance."]},
{id:"P3",subj:"Physics",unit:"Unit 2 · Forces and Motion",title:"Stopping distance: thinking and braking",
 outcomes:["Explain what affects thinking distance and braking distance"],
 summary:"<b>Stopping distance = thinking distance + braking distance.</b> The driver affects thinking distance; the car and road affect braking distance; speed affects both.",
 sections:[{h:"What changes each part",p:"",fig:"stopping"},
  {h:"Why braking distance ∝ speed²",p:"Brakes do work to remove kinetic energy: F × d = ½mv². Double v → 4 × KE → 4 × braking distance for the same force."}],
 examples:[{q:"30 m/s, reaction time 0.6 s, braking distance 75 m. Stopping distance?",steps:["Thinking = 30 × 0.6 = 18 m.","Stopping = 18 + 75 = 93 m."]}],
 mistakes:["Saying tiredness increases braking distance (it increases thinking distance).","Saying double speed doubles braking distance (it's ×4)."]},
{id:"P4",subj:"Physics",unit:"Unit 2 · Forces and Motion",title:"Forces as vectors, free body diagrams, Newton's laws",
 outcomes:["Treat forces as vectors and draw free body diagrams","State and apply Newton's three laws of motion"],
 summary:"1st law: no resultant force → no change in motion. 2nd law: <b>F = ma</b>. 3rd law: forces come in equal and opposite pairs on <b>different</b> objects.",
 sections:[{h:"Free body diagrams",p:"Draw the object as a box, an arrow for each force from its centre, length showing size. Then find the resultant.",fig:"fbd"},
  {h:"Forces at right angles",p:"Use Pythagoras for the size and tan⁻¹ for the direction: 3 N east + 4 N north = 5 N at 53° north of east."}],
 examples:[{q:"6 kg box, push 50 N, friction 20 N. Acceleration?",steps:["Resultant = 50 − 20 = 30 N.","a = F/m = 30 ÷ 6 = 5 m/s²."]}],
 mistakes:["Putting both forces of a 3rd-law pair on the same object.","Thinking a moving object needs a resultant force to keep moving at constant speed."]},
{id:"P5",subj:"Physics",unit:"Unit 2 · Forces and Motion",title:"Momentum and car safety",
 outcomes:["Calculate momentum and state the principle of conservation","Explain how seat belts, airbags and crumple zones reduce the force felt (extension)","Apply conservation of momentum to an unfamiliar collision (extension)"],
 summary:"<b>p = mv</b> (kg m/s). In a collision, total momentum before = total momentum after. <b>F = Δp / t</b>: the same change in momentum over a longer time means a smaller force.",
 sections:[{h:"Conservation of momentum",p:"",fig:"momentum"},
  {h:"Car safety features",p:"Seat belts stretch, airbags squash, crumple zones crumple. Each <b>increases the time</b> it takes to stop, so for the same Δp the force on the person is smaller."}],
 examples:[{q:"70 kg passenger stops from 20 m/s. Force in 0.05 s vs 0.5 s with an airbag?",steps:["Δp = 70 × 20 = 1400 kg m/s.","No airbag: 1400 ÷ 0.05 = 28 000 N.","Airbag: 1400 ÷ 0.5 = 2800 N, ten times smaller."]}],
 mistakes:["Saying airbags reduce momentum (they reduce force by increasing time).","Forgetting that objects that stick together share one velocity."]},
{id:"P6",subj:"Physics",unit:"Unit 2 · Forces and Motion",title:"Terminal velocity and moments",
 outcomes:["Explain terminal velocity using the balance of forces","Calculate the moment of a force"],
 summary:"Terminal velocity: <b>weight = drag</b>, so resultant = 0 and speed stays constant. Moment = <b>force × perpendicular distance</b> from the pivot (Nm).",
 sections:[{h:"A skydiver, step by step",p:"",fig:"skydiver"},{h:"Principle of moments",p:"Balanced when total clockwise moment = total anticlockwise moment.",fig:"moments"}],
 examples:[{q:"6 N hangs 30 cm left of the pivot. What force 45 cm right balances it?",steps:["Anticlockwise: 6 × 0.30 = 1.8 Nm.","F × 0.45 = 1.8.","F = 4 N."]}],
 mistakes:["Saying there is no force at terminal velocity (forces are balanced, not absent).","Using distance in cm and mixing with m."]},
{id:"P7",subj:"Physics",unit:"Unit 2 · Forces and Motion",title:"Hooke's law and the limit of proportionality",
 outcomes:["Apply Hooke's Law","Judge where Hooke's Law stops holding and justify it from experimental data (extension)"],
 summary:"<b>F = kx</b>: force is proportional to extension up to the <b>limit of proportionality</b>. k is the spring constant (N/m). Extension = new length − original length.",
 sections:[{h:"Force–extension graph",p:"",fig:"hooke"},{h:"Using data",p:"Check whether extension rises by the same amount for each equal step in force. The first step that breaks the pattern shows where the limit was passed."}],
 examples:[{q:"k = 40 N/m, original length 12 cm, load 2 N. New length?",steps:["x = F/k = 2 ÷ 40 = 0.05 m = 5 cm.","New length = 12 + 5 = 17 cm."]}],
 mistakes:["Using the new length instead of the extension.","Forgetting to convert cm to m before using k in N/m."]},
// ===================== CHEMISTRY =====================
{id:"C7",subj:"Chemistry",unit:"Unit 1 · States of Matter",title:"Particle model, changes of state, diffusion",
 outcomes:["Describe the arrangement and movement of particles in solids, liquids and gases","Explain the changes of state using the particle model","Name melting, freezing, boiling, condensing and sublimation correctly","Explain why temperature stays constant during a change of state","Describe diffusion in terms of particle movement"],
 summary:"Everything is made of particles that are always moving. Adding energy makes them move more and can overcome the forces between them.",
 sections:[{h:"Solids, liquids, gases",p:"Changes: melting (s→l), freezing (l→s), boiling/evaporating (l→g), condensing (g→l), sublimation (s→g).",fig:"states"},
  {h:"Why the temperature stays flat",p:"During a change of state, the energy goes into overcoming the forces between particles, not into making them move faster, so the temperature doesn't rise.",fig:"heating"},
  {h:"Diffusion",p:"Net movement of particles from a high to a low concentration, caused by random motion. Faster in gases, at higher temperatures, and for lighter particles."}],
 examples:[{q:"Why does the white ring form nearer the HCl end when NH₃ and HCl diffuse along a tube?",steps:["Both gases diffuse and react where they meet.","NH₃ particles are lighter (Mr 17 vs 36.5), so they move faster.","NH₃ travels further, so the ring is closer to the HCl end."]}],
 mistakes:["Saying particles in a solid don't move (they vibrate).","Saying particles themselves expand or melt."]},
{id:"C8",subj:"Chemistry",unit:"Unit 1 · States of Matter",title:"Gas tests and separation techniques",
 outcomes:["Carry out the standard tests for common gases","Choose and carry out a suitable separating technique","Select a separation route for a mixture of more than two components (extension)"],
 summary:"Learn four gas tests and match each mixture to the right separation method.",
 sections:[{h:"Gas tests",p:"",fig:"gasTests"},{h:"Choosing a method",p:"Rf value in chromatography = distance moved by spot ÷ distance moved by solvent.",fig:"separation"}],
 examples:[{q:"Get pure dry salt from rock salt.",steps:["Dissolve in warm water and stir.","Filter: sand stays on the filter paper.","Evaporate the filtrate until crystals form.","Dry the crystals."]}],
 mistakes:["Using filtration to separate a dissolved solid.","Drawing the chromatography start line in pen (the ink would run)."]},
{id:"C1",subj:"Chemistry",unit:"Unit 2 · Atoms, Elements and Compounds",title:"Atoms, isotopes, electron configuration, balancing",
 outcomes:["Read the periodic table by group and period","Distinguish elements, compounds and mixtures","Name the proton, neutron and electron with their charges and locations","Work out atomic number and mass number","Define an isotope and describe its structure","Write the electronic configuration of the first twenty elements","Explain how ions form and work out common ionic charges","Balance a chemical equation","Explain relative atomic mass in terms of isotope abundance (extension)"],
 summary:"Proton (+1, nucleus), neutron (0, nucleus), electron (−1, shells). <b>Atomic number</b> = protons; <b>mass number</b> = protons + neutrons.",
 sections:[{h:"Inside an atom",p:"",fig:"atomNa"},
  {h:"Isotopes and relative atomic mass",p:"Isotopes: same protons, different neutrons. They react the same (same electrons). Ar = (mass₁ × %₁ + mass₂ × %₂) ÷ 100. Chlorine: (35×75 + 37×25)/100 = 35.5.",fig:"isotopes"},
  {h:"Ions and balancing",p:"Metals lose electrons → positive ions (Group 1: 1+, Group 2: 2+). Non-metals gain → negative (Group 6: 2−, Group 7: 1−). Balance equations by changing the big numbers in front, never the small ones: 2Mg + O₂ → 2MgO."}],
 examples:[{q:"Balance Al + O₂ → Al₂O₃",steps:["Oxygen: 2 on the left, 3 on the right → LCM 6: 3O₂ and 2Al₂O₃.","Now 4 Al on the right → 4Al.","4Al + 3O₂ → 2Al₂O₃."]},
  {q:"Copper: 69% ⁶³Cu and 31% ⁶⁵Cu. Find Ar.",steps:["(69 × 63 + 31 × 65) ÷ 100","= (4347 + 2015) ÷ 100","= 63.6"]}],
 mistakes:["Writing calcium as 2, 8, 10 (it's 2, 8, 8, 2).","Changing subscripts (H₂O → H₂O₂) to balance.","Saying ions form by gaining or losing protons."]},
{id:"C2",subj:"Chemistry",unit:"Unit 3 · Structure and Bonding",title:"How atoms become ions; ionic bonding",
 outcomes:["Explain how atoms become ions","Draw and explain ionic bonding"],
 summary:"Ionic bonding: a <b>metal transfers electrons to a non-metal</b>. The ions have full outer shells and attract each other strongly.",
 sections:[{h:"Dot and cross: sodium chloride",p:"",fig:"ionic"},{h:"Working out formulas",p:"Make the charges cancel: Ca²⁺ + 2Cl⁻ → CaCl₂; 2Li⁺ + O²⁻ → Li₂O; Mg²⁺ + O²⁻ → MgO."}],
 examples:[{q:"Why does MgO melt at a much higher temperature than NaCl?",steps:["Mg²⁺ and O²⁻ have charges of 2, not 1.","So the electrostatic attraction is stronger.","More energy is needed to overcome it."]}],
 mistakes:["Drawing shared electrons in an ionic bond (that's covalent).","Forgetting square brackets and charges on ions in diagrams."]},
{id:"C3",subj:"Chemistry",unit:"Unit 3 · Structure and Bonding",title:"Covalent bonding in simple molecules",
 outcomes:["Draw and explain covalent bonding in simple molecules"],
 summary:"Covalent bond: a <b>shared pair of electrons</b> between two non-metal atoms. Simple molecules have strong bonds inside but <b>weak forces between molecules</b>.",
 sections:[{h:"Dot and cross: water",p:"Single bond = 1 shared pair (H₂, H₂O, CH₄). Double = 2 pairs (O₂, CO₂). Triple = 3 pairs (N₂).",fig:"covalent"},
  {h:"Properties",p:"Low melting/boiling points (only weak intermolecular forces are overcome). Don't conduct (no ions or free electrons)."}],
 examples:[{q:"Why does water boil at only 100 °C if covalent bonds are strong?",steps:["Boiling separates molecules from each other.","Only the weak forces BETWEEN molecules are overcome.","The covalent bonds inside each molecule don't break."]}],
 mistakes:["Saying covalent bonds break when a simple molecular substance melts.","Drawing too many or too few outer electrons."]},
{id:"C4",subj:"Chemistry",unit:"Unit 3 · Structure and Bonding",title:"Giant ionic and giant covalent structures",
 outcomes:["Describe giant ionic structures and explain their properties","Describe giant covalent structures including diamond and graphite","Explain why graphite conducts electricity but diamond does not (extension)"],
 summary:"Giant structures have <b>millions of strong bonds</b>, so they have <b>high melting points</b>.",
 sections:[{h:"Three giant structures",p:"Ionic: conducts only when molten or dissolved (ions free to move). Diamond: each C bonded to 4, very hard, no conduction. Graphite: each C bonded to 3 in layers, one delocalised electron per C → conducts; layers slide → soft.",fig:"giant"}],
 examples:[{q:"Why does graphite conduct but diamond doesn't?",steps:["Graphite: each C uses 3 electrons in bonds; the 4th is delocalised.","Delocalised electrons move through the layers carrying charge.","Diamond: all 4 electrons are in bonds, none are free."]}],
 mistakes:["Saying solid NaCl conducts.","Saying graphite is soft because its covalent bonds are weak (it's the forces between layers)."]},
{id:"C5",subj:"Chemistry",unit:"Unit 3 · Structure and Bonding",title:"Fullerenes, graphene and metallic bonding",
 outcomes:["Describe fullerenes and graphene","Explain metallic bonding using delocalised electrons","Explain conductivity, melting point and malleability from structure"],
 summary:"Metals: positive ions in a <b>sea of delocalised electrons</b>. Graphene: one layer of graphite. Fullerenes: hollow carbon cages (C₆₀) and tubes.",
 sections:[{h:"Pictures of the structures",p:"",fig:"metallic"},
  {h:"Explaining metal properties",p:"Conduct: delocalised electrons move. High melting point: strong attraction between ions and electrons. Malleable: layers of ions slide but the electron sea keeps holding them. Alloys are harder: different-sized atoms distort the layers."}],
 examples:[{q:"Why are carbon nanotubes used in tennis rackets?",steps:["Strong covalent bonds → very high tensile strength.","Low density → light.","So the racket is strong but light."]}],
 mistakes:["Saying metals conduct because ions move (in a solid metal it's the electrons)."]},
{id:"C6",subj:"Chemistry",unit:"Unit 3 · Structure and Bonding",title:"Predicting properties from structure",
 outcomes:["Predict the properties of a substance from its structure and bonding (extension)","Deduce the bonding in an unknown substance from its observed properties (extension)","Judge the usefulness of a modern material from its structure (extension)"],
 summary:"Ask three questions: Does it conduct as a solid? Is the melting point high? Does it conduct when molten or dissolved?",
 sections:[{h:"Decision flowchart",p:"",fig:"structureFlow"}],
 examples:[{q:"X melts at 1700 °C and never conducts. Structure?",steps:["Very high melting point → giant structure.","Doesn't conduct even when molten → not ionic, not metallic.","Giant covalent (like SiO₂)."]}],
 mistakes:["Forgetting graphite: a non-metal that conducts as a solid."]},
{id:"C99",hidden:true}
].filter(t=>!t.hidden);

// ===== English lessons (Unit 1: To Kill a Mockingbird, Unit 2: Global Tales) =====
Object.assign(FIG,{
context:()=>{let b=Ln(30,70,500,70,"ax");const ev=[[60,"1929","Wall Street Crash"],[150,"1930s","Great Depression: poverty"],[270,"1933–35","novel's events in Maycomb"],[390,"Jim Crow","segregation laws in the South"],[480,"1960","novel published"]];
  ev.forEach((e,i)=>{b+=Ci(e[0],70,7,i===2?"acc":"pt")+T(e[0],50,e[1],"big")+T(e[0],96,e[2],"small")});b+=T(265,135,"Race · class · justice: the context shapes how characters are judged","acct");return S(540,150,b,"Timeline of the novel's historical context")},
petal:()=>{const st=[["P","Point","answer the question in one sentence"],["E","Evidence","short, embedded quotation"],["T","Technique","name the writer's method"],["A","Analysis","zoom in: connotations + effect on reader"],["L","Link","back to the question / context"]];let b="";
  st.forEach((s,i)=>{const y=12+i*40,x=20+i*28;b+=Rc(x,y,44,32,"acc",6)+T(x+22,y+22,s[0],"onacc")+T(x+56,y+15,s[1],"big","start")+T(x+56,y+29,s[2],"small","start")});return S(520,215,b,"PETAL paragraph steps as a staircase")},
voice:()=>{let b="";const col=(x,t,p,good,bad)=>Rc(x,10,160,150,"soft",10)+T(x+80,34,t,"big")+T(x+80,54,p,"acct")+T(x+80,86,"+ "+good,"small")+T(x+80,108,"− "+bad,"small");
  b+=col(10,"First person","I / we","close to feelings","limited, maybe unreliable")+col(180,"Third limited","he / she (one mind)","inside one character","others' thoughts hidden")+col(350,"Third omniscient","he / she (all minds)","knows everything","less intimate");return S(520,170,b,"Comparison of narrative perspectives")},
poetry:()=>{const r=[["Simile","like / as","brave as a lion"],["Metaphor","is / are","the sea is a wolf"],["Personification","human actions","the city breathes"],["Alliteration","repeated first sounds","silent snow slipped"],["Enjambment","line runs on","speeds up, surprises"],["Caesura","mid-line pause","slows, emphasises"],["Volta","turn in thought","\"but\", \"yet\", new stanza"]];
  let b=Rc(10,8,500,26,"accl",4)+T(24,26,"Device","big","start")+T(170,26,"How to spot it","big","start")+T(340,26,"Example / effect","big","start");r.forEach((x,i)=>{b+=T(24,56+i*24,x[0],"","start")+T(170,56+i*24,x[1],"small","start")+T(340,56+i*24,x[2],"acct","start")});return S(520,225,b,"Table of poetry devices")},
effect:()=>{let b="";const box=(x,t,s,cls)=>Rc(x,40,150,70,cls||"soft",10)+T(x+75,68,t,"big")+T(x+75,88,s,"small");
  b+=box(10,"Word / technique","\"hammered\"","accl")+Ar(160,75,190,75,"arr")+box(190,"What it suggests","force, violence")+Ar(340,75,370,75,"arr")+box(370,"Effect on reader","tension, unease","acc2l");b+=T(265,140,"Always go one step further than naming the technique","acct");return S(530,155,b,"Chain from word choice to suggestion to effect on reader")}
});
TOPICS.push(
{id:"E1",subj:"English",unit:"Unit 1 · To Kill a Mockingbird",title:"Context and narrative voice in To Kill a Mockingbird",
 outcomes:["Understand how social and historical context influences content and characterisation","Social and historical context of 1930s Alabama, including race, class, and justice","How perspective and narrative voice shape meaning in literature","Synthesise main ideas from chapters into concise summaries"],
 summary:"The novel is set in <b>Maycomb, Alabama, in the 1930s</b>: the Great Depression and Jim Crow segregation. It is narrated by <b>Scout as an adult looking back</b>, so we hear both a child's view and a grown-up's reflection.",
 sections:[{h:"Historical context",p:"Poverty (the Cunninghams, the Ewells), racial segregation and an all-white legal system shape every character's choices. Always link a character's behaviour to this context.",fig:"context"},
  {h:"Two voices in one narrator",p:"Young Scout notices things without fully understanding them; the adult narrator lets us judge them. This gap makes injustice feel shocking and simple."},
  {h:"Key symbols and themes",p:"The <b>mockingbird</b> = innocence (Tom Robinson, Boo Radley). Themes: prejudice, justice, courage, growing up, class."}],
 examples:[{q:"How does context shape Tom Robinson's trial?",steps:["Point: the verdict reflects prejudice, not evidence.","Context: under Jim Crow, a Black man's word counted less than a white person's.","Detail: the jury is all white, despite Atticus showing Tom could not have done it.","Link: Lee uses the trial to expose injustice in 1930s Alabama."]}],
 mistakes:["Retelling the plot instead of explaining HOW context shapes it.","Forgetting that the narrator is an adult looking back.","Using long quotations: keep evidence short and embedded."]},
{id:"E2",subj:"English",unit:"Unit 1 · To Kill a Mockingbird",title:"PETAL / PEEL paragraphs and character essays",
 outcomes:["Develop essay responses using the PETAL paragraph structure with evidence to support claims","Analyse character perspectives and development using textual evidence","Examine Jem's development by contrasting his younger and older self","Writing structured analytical paragraphs using the PETAL format"],
 summary:"Each analytical paragraph follows <b>PETAL</b>: Point → Evidence → Technique → Analysis → Link. PEEL (Point, Evidence, Explain, Link) is the same idea with technique folded into Explain.",
 sections:[{h:"The PETAL staircase",p:"",fig:"petal"},
  {h:"Analytical verbs that make you sound analytical",p:"suggests · implies · conveys · emphasises · reveals · highlights · positions the reader to… Avoid \"this shows\" every time."},
  {h:"Character development essays",p:"Compare <b>before and after</b>: what the character believes or does early on, the event that changes them, and how Lee shows the change (their words, reactions, Scout's narration)."}],
 examples:[{q:"Turn \"Jem changes a lot\" into a strong Point.",steps:["Be specific about the change: from games to understanding injustice.","Name what causes it: the trial verdict.","Point: \"Lee presents Jem's growing up as a painful loss of innocence, triggered by the injustice of Tom Robinson's trial.\""]}],
 mistakes:["Point sentences that are facts, not arguments.","Naming a technique without explaining its effect.","No Link back to the question."]},
{id:"E3",subj:"English",unit:"Unit 2 · Global Tales",title:"Narrative voice and perspective in creative writing",
 outcomes:["Explore how perspective offers different interpretations of events","Reconstruct scenes from alternative viewpoints, including Boo Radley's","Exploring voice and viewpoint through creative writing (diary entries, monologues)","Creative Essay: Refugee's Narrative Voice"],
 summary:"<b>Who tells the story</b> decides what the reader knows and feels. A strong narrative voice comes from word choice, sentence rhythm, inner thoughts and what the narrator notices.",
 sections:[{h:"Choosing a perspective",p:"",fig:"voice"},
  {h:"Show, don't tell",p:"Instead of \"I was scared\", write what fear does: \"My fingers would not stop counting the coins in my pocket.\" Use the senses: the smell of diesel at the border, the hum of a strange language."},
  {h:"Writing a refugee's voice respectfully",p:"Ground the voice in specific, ordinary details (a key from home, a mother's recipe) rather than stereotypes. Let hope and loss sit side by side."}],
 examples:[{q:"Rewrite \"I was sad to leave\" in a distinctive first-person voice.",steps:["Pick a concrete object: the key to the old front door.","Use a sense: its cold weight.","Hint at feeling through action: \"I still wear the key around my neck, though the door it opens no longer exists.\""]}],
 mistakes:["Switching between first and third person by accident.","Telling emotions directly instead of showing them.","Using clichés instead of specific details."]},
{id:"E4",subj:"English",unit:"Unit 2 · Global Tales",title:"Unseen poetry: devices, structure and tone",
 outcomes:["Analyse how language shapes the reader's perception","CFU: Unseen Poetry","Identify techniques and explain their effects"],
 summary:"For an unseen poem: work out <b>who is speaking and about what</b>, find the <b>tone</b> and any <b>shift</b>, then analyse <b>techniques with their effects</b>, including structure.",
 sections:[{h:"Devices to recognise",p:"",fig:"poetry"},
  {h:"A 5-step routine",p:"1) Read twice; summarise in one line. 2) Tone + any volta. 3) Annotate 3–4 techniques with effects. 4) Structure: line breaks, stanzas, rhyme. 5) Thesis that answers the question."}],
 examples:[{q:"Analyse: \"The sea is a grey wolf at the harbour door, / gnawing the stones the fishermen once swore.\"",steps:["Technique: metaphor, the sea IS a grey wolf.","Connotations: predator, hunger, danger at the \"door\" of the town.","Verb \"gnawing\": slow, constant destruction.","Effect: a menacing tone; the reader feels the village is under threat."]}],
 mistakes:["Listing devices without effects (\"feature spotting\").","Ignoring structure.","Not stating the overall tone or message."]},
{id:"E5",subj:"English",unit:"Unit 2 · Global Tales",title:"Language techniques, dialect and effect (unseen prose)",
 outcomes:["Analyse how language positions readers to perceive characters","Examine the influence of dialect and voice","Dialect, register, and language as reflections of identity and complexity in characters"],
 summary:"Every analysis is a chain: <b>word or technique → what it suggests → effect on the reader</b>. Dialect and register reveal identity, class and power.",
 sections:[{h:"From technique to effect",p:"",fig:"effect"},
  {h:"Techniques to know",p:"connotation · pathetic fallacy · juxtaposition · foreshadowing · short sentences for tension · dialect · register (formal / informal) · imagery."},
  {h:"Dialect and identity",p:"Non-standard spelling and grammar show where a character comes from and their education. Writers use it to make characters real and to show social hierarchy."}],
 examples:[{q:"How does \"rain hammered the windows as if trying to get in\" create tension?",steps:["Verb \"hammered\" suggests force and violence.","Personification: the rain seems to want to break in.","Effect: the setting feels threatening, mirroring the character's anxiety."]}],
 mistakes:["Saying \"it makes the reader want to read on\" without explaining why.","Confusing dialect with slang.","Analysing the whole sentence vaguely instead of zooming in on one word."]}
);

// ---- Textbook map: Haese "Mathematics for the International Student 9 (MYP 4)", 1st ed. 2008 ----
// Page numbers are the printed book pages. Only chapter/section pointers are kept here, no book content.
const BOOK_TITLE = "Mathematics for the International Student 9 (MYP 4), Haese";
const BOOK = {
  M8: { refs: [["13 D", "Formulae by induction: nth term of a pattern", "298–300"], ["22 C–D", "Growth and decay (the idea behind geometric sequences)", "440–443"]],
        gap: "Arithmetic and geometric sequences are not covered in this book. Use this lesson and your class notes." },
  M9: { refs: [], gap: "Series (sums of sequences) are not in this book. Use this lesson and your class notes." },
  M1: { refs: [["13 A–B", "Substituting into and rearranging formulae (finding k)", "290–294"]],
        gap: "The book's Variation chapter (26: direct and inverse variation) is only on its CD, not in the printed book." },
  M2: { refs: [["6 C", "Gradient: a direct proportion graph is a straight line through the origin, gradient k", "124–127"], ["22 E", "Simple rational functions y = k/x (inverse proportion graph)", "444–446"]] },
  M3: { refs: [["3 E–F", "Warm-up: difference of two squares and perfect square expansions", "78–81"], ["8 A–E", "Common factors, difference of two squares, perfect squares, four terms, x² + bx + c", "178–185"], ["16 A–C", "Solving: x² = k, the Null Factor law, solving by factorising", "341–345"]] },
  M4: { refs: [["8 F–G", "Miscellaneous factorisation and ax² + bx + c with a ≠ 1", "186–190"], ["8 Review", "Review sets 8A and 8B (good self-test)", "191"]] },
  M5: { refs: [["4 A–D", "Before you start: radicals, simplest radical form", "88–98"], ["16 D", "Completing the square", "346–348"], ["16 Inv.", "Investigation: the quadratic formula (and what b² − 4ac tells you)", "348"], ["16 Review", "Review sets 16A and 16B", "351–352"]],
        gap: "The book only touches the discriminant inside the investigation. Use this lesson for the Δ = b² − 4ac rules." },
  M6: { refs: [["19 A–C", "Quadratic functions, their graphs, sketching by transformations", "384–392"], ["19 D–F", "Graphing by completing the square, axes intercepts, quadratic graphs", "393–398"]],
        gap: "Finding a quadratic from three points is not in this book. Use this lesson." },
  M7: { refs: [["19 G", "Maximum and minimum values of quadratics", "399–400"], ["16 E", "Problem solving with quadratic equations", "349–350"], ["19 Review", "Review sets 19A and 19B", "401–402"], ["22 F", "Extension: optimisation with rational functions", "447–448"]] },
};
TOPICS.forEach((t) => { if (BOOK[t.id]) t.book = BOOK[t.id]; });
