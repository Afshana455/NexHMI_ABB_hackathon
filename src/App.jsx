import { useState, useEffect, useRef } from "react";

/* ─────────────────────────────────────────────────────────────
   ENTERPRISE DESIGN TOKENS
───────────────────────────────────────────────────────────── */
const P  = "#1D4ED8";   // primary — deep sapphire
const PL = "#EEF2FF";   // primary light tint
const PM = "#BFDBFE";   // primary mid
const PD = "#1E3A8A";   // primary dark
const DK = "#080F1E";   // near-black navy
const MID= "#1E3A5F";   // mid navy for headings

// Slate scale — cool blue-gray
const S={
  0:  "#FFFFFF",
  25: "#F8FAFD",
  50: "#F1F5FA",
  100:"#E8EEF6",
  150:"#D9E3EF",
  200:"#C8D6E8",
  300:"#9DB3CC",
  400:"#6B8BAB",
  500:"#4A6882",
  600:"#324D64",
  700:"#1F3347",
  800:"#132130",
  900:"#080F1E",
};

// Status — refined, slightly desaturated
const EM = "#047857"; const EML="#ECFDF5"; const EMB="#A7F3D0";
const AM = "#B45309"; const AML="#FFFBEB"; const AMB="#FCD34D";
const CR = "#B91C1C"; const CRL="#FFF1F2"; const CRB="#FECACA";

// Shadows
const SD={
  xs:  "0 1px 2px rgba(8,15,30,0.06)",
  sm:  "0 1px 4px rgba(8,15,30,0.08), 0 1px 2px rgba(8,15,30,0.04)",
  md:  "0 4px 12px rgba(8,15,30,0.08), 0 2px 4px rgba(8,15,30,0.05)",
  lg:  "0 12px 32px rgba(8,15,30,0.10), 0 4px 8px rgba(8,15,30,0.06)",
  xl:  "0 24px 64px rgba(8,15,30,0.14), 0 8px 20px rgba(8,15,30,0.08)",
  blue:"0 4px 16px rgba(29,78,216,0.18), 0 1px 4px rgba(29,78,216,0.10)",
};

/* ─────────────────────────────────────────────────────────────
   DATA — unchanged from original
───────────────────────────────────────────────────────────── */
const PRESETS=[
  {id:"food",  name:"Food Processing",    desc:"Conveyor, mixing, thermal control", color:"#B45309",bg:"#FFFBEB"},
  {id:"water", name:"Water Treatment",    desc:"Flow, pressure, chemical dosing",   color:"#0369A1",bg:"#F0F9FF"},
  {id:"pharma",name:"Pharmaceuticals",    desc:"Sterile temp, humidity, pressure",  color:"#6D28D9",bg:"#F5F3FF"},
  {id:"energy",name:"Energy Systems",     desc:"Power generation, load monitoring", color:"#B91C1C",bg:"#FFF1F2"},
  {id:"mfg",   name:"Manufacturing",      desc:"CNC, assembly, QA monitoring",      color:"#047857",bg:"#ECFDF5"},
];
const COMP_LIB=[
  {id:"temp",     label:"Temperature Sensor",unit:"°C",   base:46,  min:0,  max:100,icon:"ti-thermometer",  drift:0.3},
  {id:"conveyor", label:"Conveyor Belt",     unit:"%",    base:78,  min:0,  max:100,icon:"ti-arrows-right", drift:0.35},
  {id:"mixer",    label:"Mixer / Stirrer",   unit:"RPM",  base:120, min:0,  max:300,icon:"ti-refresh",      drift:2},
  {id:"pressure", label:"Pressure Sensor",   unit:"bar",  base:2.5, min:0,  max:10, icon:"ti-gauge",        drift:0.04},
  {id:"flow",     label:"Flow Rate Sensor",  unit:"L/min",base:145, min:0,  max:500,icon:"ti-wave-sine",    drift:1.5},
  {id:"humidity", label:"Humidity Sensor",   unit:"%RH",  base:52,  min:0,  max:100,icon:"ti-droplet",      drift:0.2},
  {id:"ph",       label:"pH Sensor",         unit:"pH",   base:7.2, min:6,  max:9,  icon:"ti-flask",        drift:0.03},
  {id:"lidar",    label:"LIDAR Safety Zone", unit:"",     base:0,   min:0,  max:1,  icon:"ti-shield-check", drift:0,isSafety:true},
  {id:"vibration",label:"Vibration Monitor", unit:"mm/s", base:3.2, min:0,  max:50, icon:"ti-activity",     drift:0.1},
  {id:"speed",    label:"Motor Speed",       unit:"RPM",  base:1450,min:0,  max:3000,icon:"ti-engine",      drift:10},
];
const DEFAULT_ROLES=[
  {id:"operator", label:"Operator",  color:EM, bg:EML,initials:"OP",canConfig:false,canExport:false,desc:"Day-to-day monitoring and basic controls"},
  {id:"engineer", label:"Engineer",  color:P,  bg:PL, initials:"EN",canConfig:true, canExport:true, desc:"Full system access, configuration, analytics"},
];
const ROLE_PRESETS=[
  {id:"maintenance",label:"Maintenance Tech",  color:"#6D28D9",bg:"#F5F3FF",initials:"MT",canConfig:false,canExport:false,desc:"Equipment status, RUL data, maintenance logs"},
  {id:"manager",    label:"Plant Manager",     color:"#0369A1",bg:"#F0F9FF",initials:"PM",canConfig:false,canExport:true, desc:"Summary dashboards, KPIs, shift reports"},
  {id:"quality",    label:"Quality Inspector", color:"#B45309",bg:"#FFFBEB",initials:"QI",canConfig:false,canExport:true, desc:"Quality metrics, compliance data, audit trail"},
  {id:"safety",     label:"Safety Officer",    color:CR,       bg:CRL,      initials:"SO",canConfig:false,canExport:true, desc:"Safety perimeter, incident logs, alerts only"},
];
const GEN_STEPS=[
  "Parsing facility configuration…","Detecting component types…",
  "Loading protocol connector…","Mapping to widget library…",
  "Configuring AI alarm priority engine…","Training anomaly baseline model…",
  "Initialising RUL prediction engine…","Applying role-based access rules…",
  "Generating role interfaces…","Compiling access control matrix…",
  "✓ Interface ready — redirecting to login",
];
const RUL_BASE={
  temp:{name:"Heating Element",days:127,total:180},conveyor:{name:"Conveyor Belt",days:43,total:90},
  mixer:{name:"Stirrer Motor",days:89,total:120},lidar:{name:"LIDAR Sensor",days:12,total:90},
  pressure:{name:"Pressure Sensor",days:67,total:120},flow:{name:"Flow Meter",days:155,total:200},
  humidity:{name:"Humidity Probe",days:34,total:60},ph:{name:"pH Electrode",days:22,total:45},
  vibration:{name:"Vibration Probe",days:78,total:120},speed:{name:"Speed Encoder",days:234,total:365},
};
const COMP_INSIGHTS={
  temp:{riskLevel:"medium",healthScore:72,insight:"Temperature is cycling normally within the batch profile. The rising trend is expected during dark chocolate processing phase.",recommendation:"No action required. Monitor if trend exceeds 65°C before expected peak.",shiftAvg:44.8,shiftMin:38.2,shiftMax:58.6,prediction60s:48.2,prediction5m:51.4,anomalyScore:0.08,efficiency:91,events:[{t:"10:22",msg:"Peaked at 61.2°C — within tolerance",type:"info"},{t:"09:44",msg:"Heating element active — cycle start",type:"ok"},{t:"08:30",msg:"Shift start — calibration OK",type:"ok"}]},
  conveyor:{riskLevel:"low",healthScore:88,insight:"Belt running at optimal throughput. Speed stability index at 96% — one of the strongest sessions this week.",recommendation:"No action required. Schedule belt tension check within 3 days based on RUL data.",shiftAvg:76.4,shiftMin:71,shiftMax:82,prediction60s:78.3,prediction5m:78.1,anomalyScore:0.03,efficiency:96,events:[{t:"09:15",msg:"Speed adjusted to 78% — operator input",type:"info"},{t:"08:31",msg:"Belt start — no slip detected",type:"ok"}]},
  pressure:{riskLevel:"low",healthScore:83,insight:"Chamber pressure holding steady. Micro-fluctuations are normal during stirrer direction reversal cycles.",recommendation:"Inspect seals at next scheduled maintenance. Pressure variance slightly elevated vs last week.",shiftAvg:2.48,shiftMin:2.31,shiftMax:2.74,prediction60s:2.51,prediction5m:2.49,anomalyScore:0.14,efficiency:87,events:[{t:"10:44",msg:"Micro-spike +0.12 bar — auto-stabilised",type:"warn"},{t:"09:00",msg:"Pressure nominal at shift start",type:"ok"}]},
  flow:{riskLevel:"low",healthScore:91,insight:"Flow rate consistent with Stage 2 filtration profile. Throughput 4% above daily average.",recommendation:"Filter membrane RUL at 28 days. Plan replacement within this maintenance window.",shiftAvg:143.2,shiftMin:138,shiftMax:152,prediction60s:145.8,prediction5m:144.9,anomalyScore:0.05,efficiency:94,events:[{t:"12:01",msg:"Brief dip — pump cycling (8s)",type:"info"},{t:"10:30",msg:"Flow stable — Stage 2 confirmed",type:"ok"}]},
  humidity:{riskLevel:"low",healthScore:95,insight:"Clean room humidity well-controlled. Stable within ±2%RH of target all shift.",recommendation:"HEPA filter due for replacement in 22 days. Order replacement unit now to avoid downtime.",shiftAvg:51.8,shiftMin:49.4,shiftMax:54.2,prediction60s:52.1,prediction5m:52.3,anomalyScore:0.02,efficiency:98,events:[{t:"08:00",msg:"Humidity control active — nominal",type:"ok"}]},
  ph:{riskLevel:"medium",healthScore:68,insight:"pH trending slightly acidic over the past 20 minutes. Still within acceptable band but warrants attention before dosing cycle.",recommendation:"Check chlorine dosing pump output. Initiate corrective dose if pH drops below 6.9.",shiftAvg:7.3,shiftMin:7.0,shiftMax:7.6,prediction60s:7.18,prediction5m:7.11,anomalyScore:0.31,efficiency:74,events:[{t:"11:52",msg:"pH drifting acidic — monitoring",type:"warn"},{t:"10:15",msg:"Dosing pump activated — pH corrected",type:"ok"},{t:"08:00",msg:"pH 7.4 at shift start — optimal",type:"ok"}]},
  vibration:{riskLevel:"high",healthScore:41,insight:"Vibration levels elevated above the 4.0 mm/s advisory threshold. Pattern consistent with early bearing wear on Motor 2.",recommendation:"Schedule bearing inspection within 48 hours. Do not run at >80% load until inspected.",shiftAvg:3.8,shiftMin:2.9,shiftMax:5.1,prediction60s:3.9,prediction5m:4.1,anomalyScore:0.67,efficiency:52,events:[{t:"11:30",msg:"Peak 5.1 mm/s — anomaly flagged",type:"warn"},{t:"10:45",msg:"Vibration elevated — ML pattern match",type:"warn"},{t:"08:00",msg:"Vibration 3.1 mm/s at shift start",type:"ok"}]},
  speed:{riskLevel:"low",healthScore:86,insight:"Motor running at steady 1450 RPM. Frequency signature clean — no harmonic distortion detected.",recommendation:"Speed encoder RUL is healthy at 234 days. Continue standard monitoring schedule.",shiftAvg:1448,shiftMin:1430,shiftMax:1465,prediction60s:1451,prediction5m:1449,anomalyScore:0.04,efficiency:93,events:[{t:"08:00",msg:"Motor start — nominal RPM",type:"ok"}]},
  mixer:{riskLevel:"low",healthScore:84,insight:"Stirrer performing bi-directional cycles correctly. Forward/reverse transitions smooth — no torque spikes detected.",recommendation:"Motor brushes due for inspection in 89 days. Continue normal operation.",shiftAvg:118,shiftMin:112,shiftMax:126,prediction60s:120,prediction5m:119,anomalyScore:0.06,efficiency:89,events:[{t:"11:00",msg:"12th reversal cycle — nominal",type:"ok"},{t:"09:30",msg:"6th reversal cycle — nominal",type:"ok"}]},
};

/* ─────────────────────────────────────────────────────────────
   HARDWARE CONNECTION DATA
───────────────────────────────────────────────────────────── */
const PROTOCOLS = [
  { id:"uart",       label:"UART / Serial",  icon:"ti-plug-connected",  desc:"RS-232 / RS-485 serial port",   color:"#047857", bg:"#ECFDF5" },
  { id:"modbus_tcp", label:"Modbus TCP",      icon:"ti-network",          desc:"TCP/IP over Ethernet",          color:"#1D4ED8", bg:"#EEF2FF" },
  { id:"modbus_rtu", label:"Modbus RTU",      icon:"ti-plug",             desc:"Serial RTU framing",            color:"#6D28D9", bg:"#F5F3FF" },
  { id:"mqtt",       label:"MQTT",            icon:"ti-broadcast",        desc:"Pub/sub IoT messaging",         color:"#B45309", bg:"#FFFBEB" },
  { id:"opc_ua",     label:"OPC-UA",          icon:"ti-topology-star-3",  desc:"Industrial interoperability",   color:"#0369A1", bg:"#F0F9FF" },
  { id:"rest",       label:"REST API",        icon:"ti-api",              desc:"HTTP polling / webhooks",       color:"#B91C1C", bg:"#FFF1F2" },
];

const PROTOCOL_FIELDS = {
  uart:       [
    { key:"port",     label:"COM Port",     placeholder:"e.g. COM3 or /dev/ttyUSB0",   type:"text" },
    { key:"baud",     label:"Baud Rate",    placeholder:"",  type:"select", options:["9600","19200","38400","57600","115200"] },
  ],
  modbus_tcp: [
    { key:"ip",       label:"IP Address",   placeholder:"e.g. 192.168.1.100",           type:"text" },
    { key:"port",     label:"Port",         placeholder:"502",                           type:"text" },
    { key:"slave",    label:"Slave ID",     placeholder:"1",                             type:"text" },
  ],
  modbus_rtu: [
    { key:"port",     label:"COM Port",     placeholder:"e.g. COM4",                    type:"text" },
    { key:"baud",     label:"Baud Rate",    placeholder:"",  type:"select", options:["9600","19200","38400","57600","115200"] },
    { key:"slave",    label:"Slave ID",     placeholder:"1",                             type:"text" },
  ],
  mqtt:       [
    { key:"broker",   label:"Broker URL",   placeholder:"mqtt://broker.local:1883",     type:"text" },
    { key:"topic",    label:"Topic",        placeholder:"factory/sensors/#",             type:"text" },
    { key:"user",     label:"Username",     placeholder:"optional",                      type:"text" },
    { key:"pass",     label:"Password",     placeholder:"optional",                      type:"password" },
  ],
  opc_ua:     [
    { key:"endpoint", label:"Endpoint URL", placeholder:"opc.tcp://server:4840",        type:"text" },
    { key:"security", label:"Security Mode",placeholder:"", type:"select", options:["None","Basic128Rsa15","Basic256","Basic256Sha256"] },
    { key:"user",     label:"Username",     placeholder:"optional",                      type:"text" },
    { key:"pass",     label:"Password",     placeholder:"optional",                      type:"password" },
  ],
  rest:       [
    { key:"url",      label:"Base URL",     placeholder:"https://api.factory.local/v1", type:"text" },
    { key:"key",      label:"API Key",      placeholder:"Bearer token or API key",       type:"text" },
    { key:"interval", label:"Poll Interval",placeholder:"", type:"select", options:["500ms","1s","5s","10s","30s"] },
  ],
};

const MOCK_SIGNALS = [
  { raw:"TMP_01",  suggestedName:"Boiler Temperature",  type:"temperature", unit:"°C",    icon:"ti-thermometer"  },
  { raw:"CNV_01",  suggestedName:"Conveyor Speed",       type:"conveyor",    unit:"%",     icon:"ti-arrows-right" },
  { raw:"MXR_01",  suggestedName:"Mixer RPM",            type:"mixer",       unit:"RPM",   icon:"ti-refresh"      },
  { raw:"PRE_01",  suggestedName:"Chamber Pressure",     type:"pressure",    unit:"bar",   icon:"ti-gauge"        },
  { raw:"LDR_01",  suggestedName:"LIDAR Safety Zone",    type:"safety",      unit:"",      icon:"ti-shield-check" },
  { raw:"HUM_01",  suggestedName:"Clean Room Humidity",  type:"humidity",    unit:"%RH",   icon:"ti-droplet"      },
];

const AI_RECS = {
  temperature:{ widget:"Gauge + Sparkline",    safeRange:"20 – 80 °C",   priority:"High",     priorityColor:AM, priorityBg:AML, viz:"Gradient heat gauge" },
  conveyor:   { widget:"Progress Bar",         safeRange:"0 – 100 %",    priority:"Medium",   priorityColor:P,  priorityBg:PL,  viz:"Linear throughput bar" },
  mixer:      { widget:"RPM Dial",             safeRange:"0 – 300 RPM",  priority:"Low",      priorityColor:EM, priorityBg:EML, viz:"Circular arc gauge" },
  pressure:   { widget:"Pressure Gauge",       safeRange:"0 – 10 bar",   priority:"Medium",   priorityColor:P,  priorityBg:PL,  viz:"Radial pressure dial" },
  safety:     { widget:"Status Indicator",     safeRange:"Clear / Alert", priority:"Critical", priorityColor:CR, priorityBg:CRL, viz:"Full-width banner" },
  humidity:   { widget:"Percentage Bar",       safeRange:"40 – 70 %RH",  priority:"Low",      priorityColor:EM, priorityBg:EML, viz:"Filled percentage bar" },
};

/* ─────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────── */
function clamp(v,a,b){return Math.max(a,Math.min(b,v));}
function fmt(v,d=1){return Number(v).toFixed(d);}
function pctOf(v,mn,mx){return clamp(((v-mn)/(mx-mn))*100,0,100);}
function rulColor(p){return p>50?EM:p>20?AM:CR;}
function healthColor(s){return s>70?EM:s>40?AM:CR;}

/* ─────────────────────────────────────────────────────────────
   DESIGN PRIMITIVES
───────────────────────────────────────────────────────────── */
function Btn({children,onClick,variant="primary",small,full,style:sx={},disabled}){
  const sz=small?{padding:"6px 14px",fontSize:12,borderRadius:7}:{padding:"10px 22px",fontSize:13,borderRadius:9};
  const base={border:"none",cursor:disabled?"not-allowed":"pointer",fontFamily:"'DM Sans',system-ui,sans-serif",
    fontWeight:600,transition:"all .18s cubic-bezier(.4,0,.2,1)",opacity:disabled?.45:1,
    letterSpacing:"-0.01em",width:full?"100%":undefined,...sz,...sx};
  const map={
    primary:{...base,background:`linear-gradient(135deg,${P},${PD})`,color:"#fff",boxShadow:disabled?"none":SD.blue},
    secondary:{...base,background:S[50],color:S[600],border:`1px solid ${S[150]}`},
    outline:{...base,background:S[0],color:S[600],border:`1px solid ${S[150]}`,boxShadow:SD.xs},
    ghost:{...base,background:"transparent",color:S[500],padding:small?"5px 10px":"8px 14px"},
    danger:{...base,background:`linear-gradient(135deg,${CR},#991B1B)`,color:"#fff"},
  };
  return(
    <button onClick={disabled?undefined:onClick} style={map[variant]}
      onMouseEnter={e=>{if(!disabled&&variant==="primary")e.currentTarget.style.boxShadow="0 6px 20px rgba(29,78,216,0.30),0 2px 6px rgba(29,78,216,0.15)";}}
      onMouseLeave={e=>{if(!disabled&&variant==="primary")e.currentTarget.style.boxShadow=SD.blue;}}>
      {children}
    </button>
  );
}

function Card({children,style:sx={},onClick,hover=false}){
  const base={background:S[0],border:`1px solid ${S[100]}`,borderRadius:14,boxShadow:SD.sm,transition:"all .18s ease",...sx};
  return(
    <div onClick={onClick} style={base}
      onMouseEnter={hover?e=>{e.currentTarget.style.boxShadow=SD.md;e.currentTarget.style.transform="translateY(-1px)";}:undefined}
      onMouseLeave={hover?e=>{e.currentTarget.style.boxShadow=SD.sm;e.currentTarget.style.transform="translateY(0)";}:undefined}>
      {children}
    </div>
  );
}

function Label({children,style:sx={}}){
  return <div style={{fontSize:10,fontWeight:700,color:S[400],letterSpacing:"0.10em",textTransform:"uppercase",marginBottom:6,...sx}}>{children}</div>;
}

function Badge({children,color=P,bg=PL,style:sx={}}){
  return <span style={{fontSize:10,fontWeight:700,color,background:bg,padding:"2px 8px",borderRadius:20,letterSpacing:"0.04em",...sx}}>{children}</span>;
}

function StatusPill({label,status="ok"}){
  const map={ok:{dot:EM,bg:EML,border:EMB,text:EM},warn:{dot:AM,bg:AML,border:AMB,text:AM},crit:{dot:CR,bg:CRL,border:CRB,text:CR}};
  const c=map[status]||map.ok;
  return(
    <div style={{display:"flex",alignItems:"center",gap:6,background:c.bg,border:`1px solid ${c.border}`,borderRadius:20,padding:"3px 10px"}}>
      <div style={{width:6,height:6,borderRadius:"50%",background:c.dot,animation:status!=="ok"?"blink 1.2s ease-in-out infinite":"none"}}/>
      <span style={{fontSize:11,fontWeight:600,color:c.text}}>{label}</span>
    </div>
  );
}

function Input({value,onChange,placeholder,type="text",style:sx={},onKeyDown}){
  return(
    <input value={value} onChange={onChange} placeholder={placeholder} type={type} onKeyDown={onKeyDown}
      style={{width:"100%",border:`1.5px solid ${S[150]}`,borderRadius:9,padding:"9px 12px",
        fontSize:13,fontFamily:"'DM Sans',system-ui,sans-serif",color:DK,background:S[25],
        outline:"none",transition:"border-color .15s,box-shadow .15s",boxSizing:"border-box",...sx}}
      onFocus={e=>{e.target.style.borderColor=P;e.target.style.boxShadow=`0 0 0 3px ${PL}`;}}
      onBlur={e=>{e.target.style.borderColor=S[150];e.target.style.boxShadow="none";}}/>
  );
}

function Select({value,onChange,options,style:sx={}}){
  return(
    <select value={value} onChange={onChange}
      style={{width:"100%",border:`1.5px solid ${S[150]}`,borderRadius:9,padding:"9px 12px",
        fontSize:13,fontFamily:"'DM Sans',system-ui,sans-serif",color:DK,background:S[25],
        outline:"none",transition:"border-color .15s",boxSizing:"border-box",cursor:"pointer",...sx}}
      onFocus={e=>{e.target.style.borderColor=P;e.target.style.boxShadow=`0 0 0 3px ${PL}`;}}
      onBlur={e=>{e.target.style.borderColor=S[150];e.target.style.boxShadow="none";}}>
      {options.map(o=><option key={o} value={o}>{o}</option>)}
    </select>
  );
}

function Logo(){
  return(
    <div style={{display:"flex",alignItems:"center",gap:9}}>
      <div style={{width:30,height:30,background:`linear-gradient(135deg,${P},${PD})`,borderRadius:8,
        display:"flex",alignItems:"center",justifyContent:"center",boxShadow:SD.blue}}>
        <i className="ti ti-circuit-switchboard" style={{fontSize:15,color:"#fff"}} aria-hidden="true"/>
      </div>
      <div>
        <span style={{fontSize:15,fontWeight:800,color:DK,letterSpacing:"-0.04em",fontFamily:"'DM Sans',system-ui,sans-serif"}}>NexHMI</span>
        <span style={{fontSize:9,fontWeight:600,color:S[400],letterSpacing:"0.12em",display:"block",marginTop:-2}}>PLATFORM</span>
      </div>
    </div>
  );
}

function Sparkline({data,color=P,height=40,width=160,fill=true}){
  if(!data||data.length<2)return null;
  const mn=Math.min(...data),mx=Math.max(...data),range=mx-mn||1;
  const pts=data.map((v,i)=>`${(i/(data.length-1))*width},${height-((v-mn)/range)*(height-6)-3}`).join(" ");
  return(
    <svg width={width} height={height} style={{overflow:"visible"}}>
      {fill&&<polyline points={`0,${height} ${pts} ${width},${height}`} fill={color+"15"} stroke="none"/>}
      <polyline points={pts} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx={(data.length-1)/(data.length-1)*width} cy={height-((data[data.length-1]-mn)/range)*(height-6)-3} r={3.5} fill={color} stroke={S[0]} strokeWidth={2}/>
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────
   ANALYTICS MODAL
───────────────────────────────────────────────────────────── */
function AnalyticsModal({comp,value,history,onClose,rul}){
  if(!comp)return null;
  const ins=COMP_INSIGHTS[comp.id]||{riskLevel:"low",healthScore:80,insight:"Signal operating normally.",recommendation:"No action required.",shiftAvg:comp.base,shiftMin:comp.min,shiftMax:comp.max,prediction60s:value,prediction5m:value,anomalyScore:0.05,efficiency:85,events:[{t:"08:00",msg:"Shift start — nominal",type:"ok"}]};
  const rC=ins.riskLevel==="high"?CR:ins.riskLevel==="medium"?AM:EM;
  const rBg=ins.riskLevel==="high"?CRL:ins.riskLevel==="medium"?AML:EML;
  const d=comp.unit==="pH"?2:comp.unit==="°C"&&(comp.max||100)<50?2:1;
  const hC=healthColor(ins.healthScore);
  const spark=history?.length>0?history:Array.from({length:20},(_,i)=>comp.base+(Math.sin(i/3)*comp.drift*3)+(Math.random()-.5)*comp.drift);

  return(
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(8,15,30,0.60)",zIndex:1000,
      display:"flex",alignItems:"center",justifyContent:"center",padding:16,backdropFilter:"blur(4px)"}}>
      <div onClick={e=>e.stopPropagation()} style={{background:S[0],borderRadius:18,width:"100%",maxWidth:660,
        maxHeight:"90vh",overflowY:"auto",boxShadow:SD.xl,border:`1px solid ${S[100]}`}}>

        {/* Header */}
        <div style={{padding:"20px 24px",borderBottom:`1px solid ${S[100]}`,display:"flex",alignItems:"center",justifyContent:"space-between",background:S[25],borderRadius:"18px 18px 0 0"}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:40,height:40,borderRadius:11,background:PL,border:`1px solid ${PM}`,display:"flex",alignItems:"center",justifyContent:"center"}}>
              <i className={`ti ${comp.icon}`} style={{fontSize:19,color:P}} aria-hidden="true"/>
            </div>
            <div>
              <div style={{fontSize:15,fontWeight:700,color:DK,letterSpacing:"-0.02em"}}>{comp.label}</div>
              <div style={{fontSize:11,color:S[400],marginTop:1}}>Signal Analytics · Current shift</div>
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <Badge color={rC} bg={rBg} style={{fontSize:11,padding:"3px 10px",textTransform:"capitalize"}}>{ins.riskLevel} risk</Badge>
            <button onClick={onClose} style={{background:S[50],border:`1px solid ${S[150]}`,borderRadius:8,
              width:32,height:32,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:SD.xs}}>
              <i className="ti ti-x" style={{fontSize:14,color:S[500]}} aria-hidden="true"/>
            </button>
          </div>
        </div>

        {/* Stat strip */}
        <div style={{padding:"16px 24px",display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:10,borderBottom:`1px solid ${S[100]}`}}>
          {[{label:"Current",val:fmt(value,d),unit:comp.unit,color:DK,bg:PL},
            {label:"Shift Average",val:fmt(ins.shiftAvg,d),unit:comp.unit,color:S[700],bg:S[50]},
            {label:"Shift Min",val:fmt(ins.shiftMin,d),unit:comp.unit,color:EM,bg:EML},
            {label:"Shift Max",val:fmt(ins.shiftMax,d),unit:comp.unit,color:AM,bg:AML}].map(s=>(
            <div key={s.label} style={{background:s.bg,borderRadius:11,padding:"11px 13px",border:`1px solid ${s.bg==="PL"?PM:S[100]}`}}>
              <div style={{fontSize:10,color:S[400],marginBottom:5,fontWeight:600,letterSpacing:"0.06em",textTransform:"uppercase"}}>{s.label}</div>
              <div style={{fontSize:22,fontWeight:800,color:s.color,letterSpacing:"-0.04em",lineHeight:1,fontVariantNumeric:"tabular-nums"}}>{s.val}</div>
              <div style={{fontSize:10,color:S[300],marginTop:3}}>{s.unit}</div>
            </div>
          ))}
        </div>

        {/* Trend + Health */}
        <div style={{padding:"16px 24px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,borderBottom:`1px solid ${S[100]}`}}>
          <div>
            <Label>Trend — last 20 readings</Label>
            <div style={{background:S[25],borderRadius:11,padding:"13px 15px",display:"flex",alignItems:"flex-end",gap:14,border:`1px solid ${S[100]}`}}>
              <Sparkline data={spark} color={P} height={56} width={140}/>
              <div>
                <div style={{fontSize:10,color:S[400],fontWeight:600,letterSpacing:"0.06em",textTransform:"uppercase",marginBottom:3}}>60s prediction</div>
                <div style={{fontSize:18,fontWeight:800,color:P,letterSpacing:"-0.03em"}}>{fmt(ins.prediction60s,d)}<span style={{fontSize:11,color:S[400],marginLeft:3}}>{comp.unit}</span></div>
                <div style={{fontSize:10,color:S[400],fontWeight:600,letterSpacing:"0.06em",textTransform:"uppercase",marginTop:6,marginBottom:2}}>5 min forecast</div>
                <div style={{fontSize:14,fontWeight:700,color:S[700]}}>{fmt(ins.prediction5m,d)}<span style={{fontSize:10,color:S[400],marginLeft:3}}>{comp.unit}</span></div>
              </div>
            </div>
          </div>
          <div>
            <Label>Health Indicators</Label>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {[
                {label:"Component health",val:ins.healthScore,color:hC},
                {label:"Operating efficiency",val:ins.efficiency,color:ins.efficiency>80?EM:ins.efficiency>60?AM:CR},
              ].map(m=>(
                <div key={m.label} style={{background:S[25],borderRadius:10,padding:"10px 12px",border:`1px solid ${S[100]}`}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:7}}>
                    <span style={{fontSize:11,color:S[500]}}>{m.label}</span>
                    <span style={{fontSize:13,fontWeight:800,color:m.color}}>{m.val}%</span>
                  </div>
                  <div style={{background:S[150],borderRadius:4,height:5,overflow:"hidden"}}>
                    <div style={{width:`${m.val}%`,height:"100%",background:m.color,borderRadius:4,transition:"width .6s ease"}}/>
                  </div>
                </div>
              ))}
              <div style={{background:S[25],borderRadius:10,padding:"10px 12px",display:"flex",justifyContent:"space-between",alignItems:"center",border:`1px solid ${S[100]}`}}>
                <div>
                  <div style={{fontSize:10,color:S[400],fontWeight:600,letterSpacing:"0.06em",textTransform:"uppercase",marginBottom:3}}>AI anomaly score</div>
                  <div style={{fontSize:14,fontWeight:800,color:ins.anomalyScore>0.5?CR:ins.anomalyScore>0.2?AM:EM,letterSpacing:"-0.02em"}}>{ins.anomalyScore.toFixed(2)}<span style={{fontSize:10,color:S[400],marginLeft:2}}>/ 1.00</span></div>
                </div>
                <Badge color={ins.anomalyScore>0.5?CR:ins.anomalyScore>0.2?AM:EM} bg={ins.anomalyScore>0.5?CRL:ins.anomalyScore>0.2?AML:EML} style={{fontSize:11,padding:"3px 10px"}}>
                  {ins.anomalyScore>0.5?"Anomalous":ins.anomalyScore>0.2?"Watch":"Normal"}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* AI + Recommendation */}
        <div style={{padding:"16px 24px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,borderBottom:`1px solid ${S[100]}`}}>
          <div style={{background:PL,borderRadius:11,padding:"13px 15px",border:`1px solid ${PM}`}}>
            <div style={{display:"flex",gap:8,alignItems:"flex-start"}}>
              <i className="ti ti-brain" style={{fontSize:15,color:P,marginTop:2,flexShrink:0}} aria-hidden="true"/>
              <div>
                <div style={{fontSize:10,fontWeight:700,color:P,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:5}}>AI Interpretation</div>
                <div style={{fontSize:12,color:S[700],lineHeight:1.65}}>{ins.insight}</div>
              </div>
            </div>
          </div>
          <div style={{background:rBg,borderRadius:11,padding:"13px 15px",border:`1px solid ${ins.riskLevel==="high"?CRB:ins.riskLevel==="medium"?AMB:EMB}`}}>
            <div style={{display:"flex",gap:8,alignItems:"flex-start"}}>
              <i className="ti ti-tool" style={{fontSize:15,color:rC,marginTop:2,flexShrink:0}} aria-hidden="true"/>
              <div>
                <div style={{fontSize:10,fontWeight:700,color:rC,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:5}}>Recommended Action</div>
                <div style={{fontSize:12,color:S[700],lineHeight:1.65}}>{ins.recommendation}</div>
              </div>
            </div>
          </div>
        </div>

        {/* RUL */}
        {rul&&(
          <div style={{padding:"14px 24px",borderBottom:`1px solid ${S[100]}`}}>
            <Label>Remaining Useful Life</Label>
            <div style={{display:"flex",alignItems:"center",gap:14}}>
              <div style={{flex:1}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:7}}>
                  <span style={{fontSize:12,color:S[700],fontWeight:500}}>{rul.name}</span>
                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                    <span style={{fontSize:13,fontWeight:800,color:rulColor(Math.round((rul.days/rul.total)*100)),letterSpacing:"-0.02em"}}>{rul.days} days</span>
                    <span style={{fontSize:10,color:S[300]}}>of {rul.total}d</span>
                  </div>
                </div>
                <div style={{background:S[150],borderRadius:5,height:7,overflow:"hidden"}}>
                  <div style={{width:`${Math.round((rul.days/rul.total)*100)}%`,height:"100%",background:rulColor(Math.round((rul.days/rul.total)*100)),borderRadius:5}}/>
                </div>
              </div>
              <div style={{textAlign:"center",background:S[50],borderRadius:11,padding:"9px 16px",border:`1px solid ${S[150]}`}}>
                <div style={{fontSize:10,color:S[400],fontWeight:600,letterSpacing:"0.06em",textTransform:"uppercase",marginBottom:3}}>Next service</div>
                <div style={{fontSize:13,fontWeight:800,color:DK,letterSpacing:"-0.02em"}}>{new Date(Date.now()+rul.days*86400000).toLocaleDateString("en-GB",{day:"numeric",month:"short"})}</div>
              </div>
            </div>
          </div>
        )}

        {/* Events */}
        <div style={{padding:"14px 24px"}}>
          <Label>Recent Events</Label>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {ins.events.map((ev,i)=>(
              <div key={i} style={{display:"flex",gap:10,alignItems:"flex-start",padding:"9px 12px",
                background:ev.type==="warn"?AML:ev.type==="ok"?EML:PL,
                borderRadius:9,border:`1px solid ${ev.type==="warn"?AMB:ev.type==="ok"?EMB:PM}`}}>
                <div style={{width:7,height:7,borderRadius:"50%",background:ev.type==="warn"?AM:ev.type==="ok"?EM:P,marginTop:4,flexShrink:0}}/>
                <div style={{flex:1,fontSize:12,color:S[700],lineHeight:1.45}}>{ev.msg}</div>
                <div style={{fontSize:11,color:S[400],fontVariantNumeric:"tabular-nums",flexShrink:0,fontWeight:500}}>{ev.t}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   LANDING
───────────────────────────────────────────────────────────── */
function Landing({onStart}){
  return(
    <div style={{fontFamily:"'DM Sans',system-ui,sans-serif",background:`linear-gradient(180deg,${S[25]} 0%,${S[0]} 100%)`,minHeight:600}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&display=swap');
        @keyframes blink{0%,100%{opacity:1}50%{opacity:.3}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
        .feat-card:hover{border-color:${PM}!important;box-shadow:${SD.lg}!important;transform:translateY(-2px)}
        .feat-card{transition:all .22s cubic-bezier(.4,0,.2,1)}
        .nav-link:hover{color:${P}!important}
      `}</style>

      {/* Nav */}
      <div style={{background:`rgba(255,255,255,0.92)`,borderBottom:`1px solid ${S[100]}`,
        padding:"0 28px",display:"flex",alignItems:"center",justifyContent:"space-between",
        position:"sticky",top:0,zIndex:10,height:58,backdropFilter:"blur(12px)",boxShadow:SD.xs}}>
        <div style={{display:"flex",alignItems:"center",gap:16}}>
          <Logo/>
          <div style={{width:1,height:18,background:S[150]}}/>
          <StatusPill label="All systems operational" status="ok"/>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:16}}>
          {["Docs","Pricing","Blog"].map(l=>(
            <span key={l} className="nav-link" style={{fontSize:13,color:S[500],cursor:"pointer",fontWeight:500,transition:"color .15s"}}>{l}</span>
          ))}
          <div style={{width:1,height:16,background:S[150]}}/>
          <Btn onClick={onStart} small>Get Started →</Btn>
        </div>
      </div>

      {/* Hero */}
      <div style={{padding:"60px 32px 44px",textAlign:"center",maxWidth:860,margin:"0 auto"}}>
        <div style={{display:"inline-flex",alignItems:"center",gap:8,background:PL,border:`1px solid ${PM}`,
          borderRadius:20,padding:"5px 14px",marginBottom:22,boxShadow:`0 2px 8px rgba(29,78,216,0.12)`}}>
          <i className="ti ti-sparkles" style={{fontSize:13,color:P}} aria-hidden="true"/>
          <span style={{fontSize:12,color:P,fontWeight:600,letterSpacing:"0.02em"}}>Now with Alarm DNA Fingerprinting + RUL Predictor + Widget Analytics</span>
        </div>
        <h1 style={{fontSize:46,fontWeight:800,color:DK,letterSpacing:"-0.05em",margin:"0 0 18px",lineHeight:1.08}}>
          Industrial intelligence,<br/>
          <span style={{background:`linear-gradient(135deg,${P},${PD})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>
            beautifully designed.
          </span>
        </h1>
        <p style={{fontSize:16,color:S[500],maxWidth:480,margin:"0 auto 30px",lineHeight:1.7,fontWeight:400}}>
          The smart HMI framework that connects to any industrial hardware, configures itself through conversation, and gives every role exactly what they need.
        </p>
      </div>

      {/* Stat strip */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:0,background:S[0],
        borderTop:`1px solid ${S[100]}`,borderBottom:`1px solid ${S[100]}`,boxShadow:SD.xs}}>
        {[["< 5 min","Average setup time"],["10×","Faster alarm response"],["6+","Configurable roles"],["∞","Analytics depth"]].map(([v,l],i)=>(
          <div key={l} style={{padding:"22px 24px",textAlign:"center",borderRight:i<3?`1px solid ${S[100]}`:"none"}}>
            <div style={{fontSize:28,fontWeight:800,color:P,letterSpacing:"-0.05em",lineHeight:1}}>{v}</div>
            <div style={{fontSize:12,color:S[400],marginTop:5,fontWeight:500}}>{l}</div>
          </div>
        ))}
      </div>

      {/* Features */}
      <div style={{padding:"44px 28px 28px"}}>
        <div style={{textAlign:"center",marginBottom:24}}>
          <Badge color={P} bg={PL} style={{fontSize:11,padding:"4px 12px",marginBottom:12}}>Platform Features</Badge>
          <h2 style={{fontSize:26,fontWeight:800,color:DK,letterSpacing:"-0.04em",margin:"8px 0 0"}}>Everything operators need.<br/>Nothing they don't.</h2>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,maxWidth:900,margin:"0 auto"}}>
          {[
            ["ti-code-dots","MDL Engine","Machine Description Language auto-generates your full interface from a text description"],
            ["ti-brain","AI Alarm Priority","Context-aware scoring 1–10 with multi-signal anomaly fingerprinting and DNA pattern library"],
            ["ti-chart-trending-up","RUL Predictor","ML-powered remaining useful life forecasting per component with degradation curves"],
            ["ti-shield-check","Safety Zones","Universal LIDAR management with automatic halt, cognitive load scoring, and emergency mode"],
            ["ti-users-group","Custom Roles","Unlimited configurable roles with per-signal access control and tailored interfaces"],
            ["ti-chart-bar","Widget Analytics","Click any signal for deep operational insights, AI interpretation, and shift history"],
          ].map(([icon,title,desc])=>(
            <Card key={title} style={{padding:"18px",cursor:"default"}} hover className="feat-card">
              <div style={{width:38,height:38,background:PL,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:12,border:`1px solid ${PM}`}}>
                <i className={`ti ${icon}`} style={{fontSize:18,color:P}} aria-hidden="true"/>
              </div>
              <div style={{fontSize:13,fontWeight:700,color:DK,marginBottom:5,letterSpacing:"-0.01em"}}>{title}</div>
              <div style={{fontSize:12,color:S[400],lineHeight:1.6}}>{desc}</div>
            </Card>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{margin:"8px 28px 32px",background:DK,borderRadius:18,padding:"36px 32px",textAlign:"center",
        boxShadow:SD.xl,backgroundImage:`radial-gradient(ellipse at 60% 0%,${PD}44 0%,transparent 60%)`}}>
        <div style={{fontSize:22,fontWeight:800,color:S[0],letterSpacing:"-0.04em",marginBottom:10}}>Ready to eliminate alarm fatigue?</div>
        <p style={{fontSize:14,color:S[300],marginBottom:24,maxWidth:400,margin:"0 auto 24px",lineHeight:1.6}}>Configure NexHMI for your facility in under 5 minutes. No hardware required for the demo.</p>
        <Btn onClick={onStart} style={{background:S[0],color:DK,padding:"12px 28px",fontSize:14}}>Start Configuration →</Btn>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   INDUSTRIES
───────────────────────────────────────────────────────────── */
function Industries({industries,selected,onSelect,onNext,onBack,customInds,setCustomInds}){
  const [showForm,setShowForm]=useState(false);
  const [name,setName]=useState("");const [desc,setDesc]=useState("");
  const all=[...industries,...customInds];
  const addIndustry=()=>{
    if(!name.trim())return;
    const ni={id:"c_"+Date.now(),name,desc:desc||"Custom industry",color:P,bg:PL,isCustom:true};
    setCustomInds(p=>[...p,ni]);onSelect(ni.id);setName("");setDesc("");setShowForm(false);
  };
  return(
    <div style={{fontFamily:"'DM Sans',system-ui,sans-serif",background:S[25],minHeight:540}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');`}</style>
      <div style={{background:S[0],borderBottom:`1px solid ${S[100]}`,padding:"0 24px",height:54,display:"flex",alignItems:"center",gap:12,boxShadow:SD.xs}}>
        <Logo/><i className="ti ti-chevron-right" style={{fontSize:13,color:S[300]}} aria-hidden="true"/>
        <span style={{fontSize:13,color:S[400],fontWeight:500}}>Industry Selection</span>
      </div>
      <div style={{padding:"28px 24px"}}>
        <h2 style={{fontSize:20,fontWeight:800,color:DK,letterSpacing:"-0.03em",margin:"0 0 6px"}}>What type of facility are you configuring?</h2>
        <p style={{fontSize:13,color:S[400],margin:"0 0 22px",lineHeight:1.5}}>Select an industry to pre-load common components and safe operating ranges. Customize everything in the next step.</p>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:14}}>
          {all.map(ind=>{
            const sel=selected===ind.id;
            return(
              <div key={ind.id} onClick={()=>onSelect(ind.id)} style={{border:`${sel?"2px":"1px"} solid ${sel?ind.color:S[150]}`,
                borderRadius:12,padding:"15px",cursor:"pointer",background:sel?ind.bg:S[0],
                transition:"all .18s",boxShadow:sel?`0 4px 12px ${ind.color}22`:SD.xs}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
                  <span style={{fontSize:13,fontWeight:700,color:DK,letterSpacing:"-0.01em"}}>{ind.name}</span>
                  {ind.isCustom&&<Badge color={S[500]} bg={S[100]} style={{fontSize:9}}>Custom</Badge>}
                </div>
                <div style={{fontSize:11,color:S[400],lineHeight:1.5,marginBottom:sel?8:0}}>{ind.desc}</div>
                {sel&&<div style={{display:"flex",alignItems:"center",gap:5,marginTop:8}}>
                  <div style={{width:6,height:6,borderRadius:"50%",background:ind.color}}/>
                  <span style={{fontSize:11,color:ind.color,fontWeight:600}}>Selected</span>
                </div>}
              </div>
            );
          })}
          <div onClick={()=>setShowForm(true)} style={{border:`1px dashed ${S[200]}`,borderRadius:12,padding:"15px",
            cursor:"pointer",background:S[50],display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:90,gap:7,boxShadow:SD.xs}}>
            <div style={{width:32,height:32,borderRadius:"50%",background:S[100],display:"flex",alignItems:"center",justifyContent:"center"}}>
              <i className="ti ti-plus" style={{fontSize:16,color:S[400]}} aria-hidden="true"/>
            </div>
            <div style={{fontSize:12,fontWeight:600,color:S[400]}}>Add Industry</div>
          </div>
        </div>
        {showForm&&(
          <Card style={{padding:"18px",marginBottom:14,borderColor:PM,boxShadow:`0 0 0 3px ${PL}`}}>
            <div style={{fontSize:13,fontWeight:700,color:DK,marginBottom:14}}>Define custom industry</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
              <div><Label>Industry name</Label><Input value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Textile Processing"/></div>
              <div><Label>Short description</Label><Input value={desc} onChange={e=>setDesc(e.target.value)} placeholder="e.g. Spinning, weaving, dyeing"/></div>
            </div>
            <div style={{display:"flex",gap:8}}><Btn onClick={addIndustry} small>Add Industry</Btn><Btn variant="ghost" onClick={()=>setShowForm(false)} small>Cancel</Btn></div>
          </Card>
        )}
        <div style={{display:"flex",justifyContent:"space-between",paddingTop:6}}>
          <Btn variant="outline" onClick={onBack}>← Back</Btn>
          <Btn onClick={onNext} disabled={!selected}>Continue →</Btn>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   CONFIG METHOD
───────────────────────────────────────────────────────────── */
function ConfigMethod({onSelect,onBack,industry}){
  return(
    <div style={{fontFamily:"'DM Sans',system-ui,sans-serif",background:S[25],minHeight:480}}>
      <div style={{background:S[0],borderBottom:`1px solid ${S[100]}`,padding:"0 24px",height:54,display:"flex",alignItems:"center",gap:8,boxShadow:SD.xs}}>
        <Logo/><i className="ti ti-chevron-right" style={{fontSize:13,color:S[300]}} aria-hidden="true"/>
        <span style={{fontSize:13,color:S[400],fontWeight:500}}>Configuration Method</span>
      </div>
      <div style={{padding:"36px 24px"}}>
        <div style={{marginBottom:30,textAlign:"center"}}>
          <h2 style={{fontSize:20,fontWeight:800,color:DK,margin:"0 0 6px",letterSpacing:"-0.03em"}}>How would you like to configure?</h2>
          <p style={{fontSize:13,color:S[400],margin:0}}>Industry: <strong style={{color:DK}}>{industry?.name}</strong></p>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,maxWidth:580,margin:"0 auto 28px"}}>
          {[
            {id:"ai",icon:"ti-sparkles",title:"AI Configuration",sub:"Describe your facility in plain English",desc:"Our AI reads your description, identifies components, configures thresholds, assigns roles, and builds the interface automatically.",badge:"Recommended",bColor:EM,bBg:EML},
            {id:"wizard",icon:"ti-list-check",title:"Guided Wizard",sub:"Answer step-by-step questions",desc:"Walk through components, parameters, and role assignments one step at a time. Fully customisable — add your own roles and components.",badge:"Most detailed",bColor:P,bBg:PL},
          ].map(m=>(
            <Card key={m.id} hover style={{padding:"22px",cursor:"pointer",transition:"all .2s"}}
              onClick={()=>onSelect(m.id)}>
              <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:14}}>
                <div style={{width:42,height:42,background:PL,border:`1px solid ${PM}`,borderRadius:11,display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <i className={`ti ${m.icon}`} style={{fontSize:21,color:P}} aria-hidden="true"/>
                </div>
                <Badge color={m.bColor} bg={m.bBg} style={{fontSize:11,padding:"3px 10px"}}>{m.badge}</Badge>
              </div>
              <div style={{fontSize:14,fontWeight:800,color:DK,marginBottom:4,letterSpacing:"-0.02em"}}>{m.title}</div>
              <div style={{fontSize:12,color:S[400],marginBottom:10,fontWeight:500}}>{m.sub}</div>
              <div style={{fontSize:12,color:S[500],lineHeight:1.6,marginBottom:14}}>{m.desc}</div>
              <div style={{display:"flex",alignItems:"center",gap:5,color:P,fontSize:12,fontWeight:700}}>
                Choose this <i className="ti ti-arrow-right" style={{fontSize:13}} aria-hidden="true"/>
              </div>
            </Card>
          ))}
        </div>
        <div style={{textAlign:"center"}}><Btn variant="ghost" onClick={onBack}>← Back to industries</Btn></div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   CONFIG AI
───────────────────────────────────────────────────────────── */
function ConfigAI({industry,onGenerate,onBack}){
  const [prompt,setPrompt]=useState("");
  const examples=["We have three temperature sensors on mixing chambers (safe: 20-75°C), a conveyor belt, a bi-directional stirring motor, and a LIDAR safety perimeter. Roles: operators for monitoring, engineers for full access, maintenance team for RUL data only.",
    "Water treatment facility: flow rate sensors (50-200 L/min), pH monitors (6.5-8.5), pump pressure gauges, and a safety gate. Manager role needs summary reports, quality inspector needs pH and chlorine only."];
  return(
    <div style={{fontFamily:"'DM Sans',system-ui,sans-serif",background:S[25],minHeight:500}}>
      <div style={{background:S[0],borderBottom:`1px solid ${S[100]}`,padding:"0 24px",height:54,display:"flex",alignItems:"center",gap:8,boxShadow:SD.xs}}>
        <Logo/><i className="ti ti-chevron-right" style={{fontSize:13,color:S[300]}} aria-hidden="true"/>
        <span style={{fontSize:13,color:S[400],fontWeight:500}}>AI Configuration</span>
      </div>
      <div style={{padding:"28px 24px"}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
          <div style={{width:36,height:36,background:PL,border:`1px solid ${PM}`,borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center"}}>
            <i className="ti ti-sparkles" style={{fontSize:17,color:P}} aria-hidden="true"/>
          </div>
          <div>
            <h2 style={{fontSize:16,fontWeight:800,color:DK,margin:0,letterSpacing:"-0.02em"}}>Describe your facility</h2>
            <p style={{fontSize:11,color:S[400],margin:0,fontWeight:500}}>Industry: {industry?.name} · Include roles in your description</p>
          </div>
        </div>
        <p style={{fontSize:13,color:S[500],lineHeight:1.65,margin:"0 0 14px"}}>Mention sensors, motors, safety equipment, safe operating ranges, and organisational roles. Our AI extracts every configuration detail automatically.</p>
        <textarea value={prompt} onChange={e=>setPrompt(e.target.value)}
          placeholder="e.g. Chocolate production line with temperature sensors (20-75°C), conveyor belt, stirring motor, and LIDAR safety sensor. Operators see simple status views. Engineers get full analytics. Maintenance technicians need RUL and component health only..."
          style={{width:"100%",height:148,border:`1.5px solid ${S[150]}`,borderRadius:11,padding:"13px",
            fontSize:13,fontFamily:"'DM Sans',system-ui,sans-serif",color:DK,resize:"none",
            outline:"none",lineHeight:1.65,background:S[0],boxSizing:"border-box",transition:"border-color .15s,box-shadow .15s"}}
          onFocus={e=>{e.target.style.borderColor=P;e.target.style.boxShadow=`0 0 0 3px ${PL}`;}}
          onBlur={e=>{e.target.style.borderColor=S[150];e.target.style.boxShadow="none";}}/>
        <div style={{margin:"14px 0"}}>
          <Label>Or try an example prompt</Label>
          <div style={{display:"flex",flexDirection:"column",gap:7}}>
            {examples.map((ex,i)=>(
              <div key={i} onClick={()=>setPrompt(ex)} style={{border:`1px solid ${S[150]}`,borderRadius:10,
                padding:"11px 14px",cursor:"pointer",fontSize:12,color:S[500],lineHeight:1.55,background:S[0],
                boxShadow:SD.xs,transition:"all .15s"}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=PM;e.currentTarget.style.color=P;e.currentTarget.style.background=PL;}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor=S[150];e.currentTarget.style.color=S[500];e.currentTarget.style.background=S[0];}}>
                <i className="ti ti-quote" style={{fontSize:11,marginRight:6,color:S[300]}} aria-hidden="true"/>{ex.slice(0,110)}…
              </div>
            ))}
          </div>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",paddingTop:4}}>
          <Btn variant="outline" onClick={onBack}>← Back</Btn>
          <Btn onClick={onGenerate} disabled={prompt.trim().length<20}>
            <i className="ti ti-sparkles" style={{marginRight:6}} aria-hidden="true"/>Generate Interface →
          </Btn>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   CONFIG WIZARD  (5 steps — Hardware Connection added first)
───────────────────────────────────────────────────────────── */
function ConfigWizard({industry,allComps,onGenerate,onBack}){
  const STEPS=["Hardware Connection","Components","Parameters","Roles","Access Control"];
  const [step,setStep]=useState(0);

  /* ── Hardware Connection state ── */
  const [hwProtocol,setHwProtocol]=useState(null);
  const [hwFields,setHwFields]=useState({});
  const [scanning,setScanning]=useState(false);
  const [scanProgress,setScanProgress]=useState(0);
  const [scanDone,setScanDone]=useState(false);
  const [scannedSignals,setScannedSignals]=useState([]);
  const [signalMap,setSignalMap]=useState({});
  const scanRef=useRef(null);

  /* ── Existing wizard state ── */
  const [selected,setSelected]=useState([]);
  const [configured,setConfigured]=useState({});
  const [customComps,setCustomComps]=useState([]);
  const [showCC,setShowCC]=useState(false);
  const [cName,setCName]=useState("");const [cUnit,setCUnit]=useState("");
  const [roles,setRoles]=useState(DEFAULT_ROLES.map(r=>({...r})));
  const [showRF,setShowRF]=useState(false);
  const [nRN,setNRN]=useState("");const [nRD,setNRD]=useState("");
  const [sigRoles,setSigRoles]=useState({});
  const allC=[...allComps,...customComps];
  const toggle=(id)=>setSelected(p=>p.includes(id)?p.filter(x=>x!==id):[...p,id]);
  const selComps=allC.filter(c=>selected.includes(c.id));
  const addComp=()=>{if(!cName.trim())return;const nc={id:"cc_"+Date.now(),label:cName,unit:cUnit||"units",base:50,min:0,max:100,icon:"ti-adjustments",drift:0.5,isCustom:true};setCustomComps(p=>[...p,nc]);setSelected(p=>[...p,nc.id]);setCName("");setCUnit("");setShowCC(false);};
  const addRole=()=>{if(!nRN.trim())return;const cls=["#7C3AED","#0369A1","#B45309","#B91C1C","#047857","#4338CA"];const bgs=["#F5F3FF","#F0F9FF","#FFFBEB","#FFF1F2","#ECFDF5","#EEF2FF"];const idx=roles.length%6;const ini=nRN.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();const nr={id:"r_"+Date.now(),label:nRN,color:cls[idx],bg:bgs[idx],initials:ini,canConfig:false,canExport:false,desc:nRD||"Custom role",isCustom:true};setRoles(p=>[...p,nr]);setNRN("");setNRD("");setShowRF(false);};
  const removeRole=(id)=>setRoles(p=>p.filter(r=>r.id!==id));
  const toggleSR=(cid,rid)=>setSigRoles(prev=>{const cur=prev[cid]||roles.map(r=>r.id);const nxt=cur.includes(rid)?cur.filter(x=>x!==rid):[...cur,rid];return{...prev,[cid]:nxt};});

  /* ── Scan handler ── */
  const doScan=()=>{
    if(!hwProtocol)return;
    setScanning(true);setScanDone(false);setScanProgress(0);setScannedSignals([]);
    let prog=0;
    scanRef.current=setInterval(()=>{
      prog+=Math.random()*14+6;
      const clamped=Math.min(prog,100);
      setScanProgress(clamped);
      if(clamped>=100){
        clearInterval(scanRef.current);
        const count=4+Math.floor(Math.random()*3);
        const sigs=MOCK_SIGNALS.slice(0,count);
        setScannedSignals(sigs);
        const m={};sigs.forEach(s=>{m[s.raw]=s.suggestedName;});
        setSignalMap(m);
        setScanning(false);setScanDone(true);
      }
    },160);
  };

  const canProceedHW=hwProtocol&&scanDone&&scannedSignals.length>0;

  const selProto=PROTOCOLS.find(p=>p.id===hwProtocol);
  const fields=hwProtocol?PROTOCOL_FIELDS[hwProtocol]:[];

  return(
    <div style={{fontFamily:"'DM Sans',system-ui,sans-serif",background:S[25],minHeight:560}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes scanPulse{0%,100%{opacity:1}50%{opacity:.5}}
        .proto-card:hover{border-color:${PM}!important;box-shadow:${SD.md}!important;transform:translateY(-1px)}
        .proto-card{transition:all .18s cubic-bezier(.4,0,.2,1)!important}
      `}</style>

      {/* Topbar */}
      <div style={{background:S[0],borderBottom:`1px solid ${S[100]}`,padding:"0 24px",height:54,display:"flex",alignItems:"center",gap:8,boxShadow:SD.xs}}>
        <Logo/><i className="ti ti-chevron-right" style={{fontSize:13,color:S[300]}} aria-hidden="true"/>
        <span style={{fontSize:13,color:S[400],fontWeight:500}}>Guided Setup — Step {step+1} of {STEPS.length}</span>
      </div>

      {/* Progress bar */}
      <div style={{padding:"0 24px 4px",borderBottom:`1px solid ${S[100]}`,background:S[0]}}>
        <div style={{display:"flex",gap:0,paddingTop:14,paddingBottom:6}}>
          {STEPS.map((s,i)=>(
            <div key={i} style={{flex:1,display:"flex",alignItems:"center",flexDirection:"column",gap:4}}>
              <div style={{width:"100%",display:"flex",alignItems:"center"}}>
                {i>0&&<div style={{flex:1,height:2,borderRadius:1,background:i<=step?P:S[150],transition:"background .3s"}}/>}
                <div style={{width:28,height:28,borderRadius:"50%",background:i<step?P:i===step?P:S[100],
                  border:`2px solid ${i<=step?P:S[200]}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,
                  boxShadow:i===step?`0 0 0 4px ${PL}`:i<step?SD.sm:"none",transition:"all .3s"}}>
                  {i<step?<i className="ti ti-check" style={{fontSize:12,color:"#fff"}} aria-hidden="true"/>
                    :<span style={{fontSize:11,fontWeight:700,color:i===step?"#fff":S[400]}}>{i+1}</span>}
                </div>
                {i<STEPS.length-1&&<div style={{flex:1,height:2,borderRadius:1,background:i<step?P:S[150],transition:"background .3s"}}/>}
              </div>
              <div style={{fontSize:10,fontWeight:i===step?700:500,color:i===step?P:S[300],letterSpacing:"0.02em",textAlign:"center",maxWidth:72,lineHeight:1.2}}>{s}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── STEP 0: Hardware Connection ─── */}
      {step===0&&(<div style={{padding:"20px 24px"}}>
        <h2 style={{fontSize:16,fontWeight:800,color:DK,margin:"0 0 4px",letterSpacing:"-0.02em"}}>Connect your hardware</h2>
        <p style={{fontSize:13,color:S[400],marginBottom:18,lineHeight:1.5}}>Select the communication protocol your hardware uses. NexHMI will discover connected devices and signals automatically.</p>

        {/* Protocol cards */}
        <Label>Select Protocol</Label>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:18}}>
          {PROTOCOLS.map(proto=>{
            const sel=hwProtocol===proto.id;
            return(
              <div key={proto.id} className="proto-card" onClick={()=>{setHwProtocol(proto.id);setScanDone(false);setScannedSignals([]);setScanProgress(0);setHwFields({});}}
                style={{border:`${sel?"2px":"1px"} solid ${sel?proto.color:S[150]}`,borderRadius:12,padding:"13px 14px",cursor:"pointer",
                  background:sel?proto.bg:S[0],boxShadow:sel?`0 4px 12px ${proto.color}22`:SD.xs}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                  <div style={{width:30,height:30,borderRadius:8,background:sel?proto.color:S[100],display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all .18s"}}>
                    <i className={`ti ${proto.icon}`} style={{fontSize:14,color:sel?"#fff":S[400]}} aria-hidden="true"/>
                  </div>
                  <span style={{fontSize:12,fontWeight:700,color:DK,letterSpacing:"-0.01em"}}>{proto.label}</span>
                </div>
                <div style={{fontSize:10,color:sel?proto.color:S[400],fontWeight:sel?600:400,lineHeight:1.4}}>{proto.desc}</div>
                {sel&&(
                  <div style={{display:"flex",alignItems:"center",gap:4,marginTop:7}}>
                    <div style={{width:5,height:5,borderRadius:"50%",background:proto.color}}/>
                    <span style={{fontSize:10,color:proto.color,fontWeight:700}}>Selected</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Dynamic connection form */}
        {hwProtocol&&(
          <Card style={{padding:"16px",marginBottom:16,borderColor:selProto?selProto.color+"44":PM,boxShadow:`0 0 0 3px ${selProto?selProto.bg:PL}`}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
              <div style={{width:28,height:28,borderRadius:7,background:selProto?.bg||PL,display:"flex",alignItems:"center",justifyContent:"center",border:`1px solid ${selProto?.color||P}44`}}>
                <i className={`ti ${selProto?.icon||"ti-plug"}`} style={{fontSize:13,color:selProto?.color||P}} aria-hidden="true"/>
              </div>
              <div>
                <div style={{fontSize:13,fontWeight:700,color:DK,letterSpacing:"-0.01em"}}>{selProto?.label} Connection</div>
                <div style={{fontSize:10,color:S[400],fontWeight:500}}>Enter connection parameters below</div>
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:`repeat(${Math.min(fields.length,2)},1fr)`,gap:10}}>
              {fields.map(f=>(
                <div key={f.key}>
                  <Label>{f.label}</Label>
                  {f.type==="select"?(
                    <Select value={hwFields[f.key]||f.options[0]} onChange={e=>setHwFields(p=>({...p,[f.key]:e.target.value}))} options={f.options}/>
                  ):(
                    <Input value={hwFields[f.key]||""} onChange={e=>setHwFields(p=>({...p,[f.key]:e.target.value}))} placeholder={f.placeholder} type={f.type}/>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Scan Devices */}
        {hwProtocol&&(
          <div style={{marginBottom:16}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
              <Label style={{marginBottom:0}}>Device Discovery</Label>
              {scanDone&&<StatusPill label={`${scannedSignals.length} signals found`} status="ok"/>}
            </div>

            {/* Scan button + progress */}
            {!scanDone?(
              <div style={{background:S[50],border:`1px solid ${S[150]}`,borderRadius:12,padding:"14px 16px"}}>
                {scanning?(
                  <div>
                    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                      <i className="ti ti-radar" style={{fontSize:16,color:P,animation:"spin 1.5s linear infinite"}} aria-hidden="true"/>
                      <span style={{fontSize:13,fontWeight:600,color:DK}}>Scanning for devices…</span>
                      <span style={{fontSize:12,color:S[400],marginLeft:"auto",fontVariantNumeric:"tabular-nums"}}>{Math.round(scanProgress)}%</span>
                    </div>
                    <div style={{background:S[150],borderRadius:5,height:6,overflow:"hidden"}}>
                      <div style={{width:`${scanProgress}%`,height:"100%",background:`linear-gradient(90deg,${P},${PD})`,borderRadius:5,transition:"width .15s linear",position:"relative"}}>
                        <div style={{position:"absolute",right:0,top:"50%",transform:"translateY(-50%)",width:10,height:10,borderRadius:"50%",background:"#fff",boxShadow:`0 0 6px ${P}`}}/>
                      </div>
                    </div>
                    <div style={{fontSize:11,color:S[400],marginTop:8,fontWeight:500,animation:"scanPulse 1.5s ease-in-out infinite"}}>
                      Probing {selProto?.label} bus for active devices…
                    </div>
                  </div>
                ):(
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                    <div>
                      <div style={{fontSize:13,fontWeight:600,color:DK,marginBottom:3}}>Ready to scan</div>
                      <div style={{fontSize:11,color:S[400]}}>NexHMI will query all addresses on the {selProto?.label} bus</div>
                    </div>
                    <Btn onClick={doScan} small>
                      <i className="ti ti-radar" style={{marginRight:6}} aria-hidden="true"/>Scan Devices
                    </Btn>
                  </div>
                )}
              </div>
            ):(
              /* Signal mapping table */
              <div>
                <div style={{background:EML,border:`1px solid ${EMB}`,borderRadius:10,padding:"9px 13px",marginBottom:12,display:"flex",gap:8,alignItems:"center"}}>
                  <i className="ti ti-circle-check" style={{fontSize:14,color:EM,flexShrink:0}} aria-hidden="true"/>
                  <span style={{fontSize:12,color:S[700],fontWeight:500}}><strong>{scannedSignals.length} hardware signals</strong> discovered on {selProto?.label}. Map raw tags to readable names below.</span>
                </div>

                {/* Table header */}
                <div style={{display:"grid",gridTemplateColumns:"28px 1fr 90px 1fr",gap:10,padding:"7px 12px",
                  background:S[100],borderRadius:"9px 9px 0 0",border:`1px solid ${S[150]}`,borderBottom:"none"}}>
                  {["","Raw Hardware Tag","Unit","Display Name"].map((h,i)=>(
                    <div key={i} style={{fontSize:10,fontWeight:700,color:S[400],letterSpacing:"0.08em",textTransform:"uppercase"}}>{h}</div>
                  ))}
                </div>

                <div style={{border:`1px solid ${S[150]}`,borderRadius:"0 0 9px 9px",overflow:"hidden",marginBottom:14}}>
                  {scannedSignals.map((sig,i)=>(
                    <div key={sig.raw} style={{display:"grid",gridTemplateColumns:"28px 1fr 90px 1fr",gap:10,
                      padding:"9px 12px",background:i%2===0?S[0]:S[25],
                      borderBottom:i<scannedSignals.length-1?`1px solid ${S[100]}`:"none",alignItems:"center"}}>
                      <div style={{width:24,height:24,borderRadius:6,background:PL,border:`1px solid ${PM}`,display:"flex",alignItems:"center",justifyContent:"center"}}>
                        <i className={`ti ${sig.icon}`} style={{fontSize:11,color:P}} aria-hidden="true"/>
                      </div>
                      <div>
                        <div style={{fontSize:12,fontWeight:700,color:DK,fontFamily:"'DM Mono',monospace,monospace",letterSpacing:"0.02em"}}>{sig.raw}</div>
                        <div style={{fontSize:10,color:S[400],textTransform:"capitalize"}}>{sig.type}</div>
                      </div>
                      <div style={{fontSize:12,color:S[500],fontWeight:500}}>{sig.unit||"—"}</div>
                      <input
                        value={signalMap[sig.raw]||""}
                        onChange={e=>setSignalMap(p=>({...p,[sig.raw]:e.target.value}))}
                        style={{border:`1.5px solid ${S[150]}`,borderRadius:7,padding:"5px 9px",fontSize:12,
                          fontFamily:"'DM Sans',system-ui,sans-serif",color:DK,background:S[0],
                          outline:"none",width:"100%",boxSizing:"border-box",transition:"border-color .15s"}}
                        onFocus={e=>{e.target.style.borderColor=P;e.target.style.boxShadow=`0 0 0 3px ${PL}`;}}
                        onBlur={e=>{e.target.style.borderColor=S[150];e.target.style.boxShadow="none";}}
                      />
                    </div>
                  ))}
                </div>

                {/* Re-scan */}
                <button onClick={()=>{setScanDone(false);setScannedSignals([]);setScanProgress(0);}}
                  style={{background:"none",border:`1px dashed ${S[200]}`,borderRadius:8,padding:"6px 13px",
                    cursor:"pointer",fontSize:11,color:S[400],fontFamily:"inherit",fontWeight:600,display:"flex",
                    alignItems:"center",gap:6,marginBottom:16}}>
                  <i className="ti ti-refresh" style={{fontSize:12}} aria-hidden="true"/>Re-scan
                </button>

                {/* AI Recommendation Panel */}
                <div style={{background:DK,borderRadius:13,padding:"14px 16px",backgroundImage:`radial-gradient(ellipse at 80% 0%,${PD}55,transparent 65%)`}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
                    <div style={{width:28,height:28,borderRadius:7,background:PL,display:"flex",alignItems:"center",justifyContent:"center"}}>
                      <i className="ti ti-brain" style={{fontSize:13,color:P}} aria-hidden="true"/>
                    </div>
                    <div>
                      <div style={{fontSize:12,fontWeight:800,color:"#fff",letterSpacing:"-0.01em"}}>AI Signal Recommendations</div>
                      <div style={{fontSize:10,color:S[300],fontWeight:500}}>Suggested widget, range and alert priority per discovered signal</div>
                    </div>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:7}}>
                    {scannedSignals.map(sig=>{
                      const rec=AI_RECS[sig.type]||{widget:"Status Card",safeRange:"—",priority:"Medium",priorityColor:P,priorityBg:PL,viz:"Status indicator"};
                      const displayName=signalMap[sig.raw]||sig.suggestedName;
                      return(
                        <div key={sig.raw} style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.10)",
                          borderRadius:10,padding:"10px 13px",display:"grid",gridTemplateColumns:"1fr auto",gap:10,alignItems:"center"}}>
                          <div style={{minWidth:0}}>
                            <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:5,flexWrap:"wrap",gap:6}}>
                              <span style={{fontSize:12,fontWeight:700,color:"#fff",letterSpacing:"-0.01em"}}>{displayName}</span>
                              <span style={{fontSize:9,color:S[300],fontFamily:"monospace",background:"rgba(255,255,255,0.08)",padding:"1px 6px",borderRadius:4}}>{sig.raw}</span>
                            </div>
                            <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                              <div style={{display:"flex",alignItems:"center",gap:4}}>
                                <i className="ti ti-layout-dashboard" style={{fontSize:11,color:S[300]}} aria-hidden="true"/>
                                <span style={{fontSize:11,color:S[300],fontWeight:500}}>{rec.widget}</span>
                              </div>
                              <div style={{width:1,background:"rgba(255,255,255,0.15)"}}/>
                              <div style={{display:"flex",alignItems:"center",gap:4}}>
                                <i className="ti ti-ruler-measure" style={{fontSize:11,color:S[300]}} aria-hidden="true"/>
                                <span style={{fontSize:11,color:S[300],fontWeight:500}}>{rec.safeRange}</span>
                              </div>
                              <div style={{width:1,background:"rgba(255,255,255,0.15)"}}/>
                              <div style={{display:"flex",alignItems:"center",gap:4}}>
                                <i className="ti ti-chart-bar" style={{fontSize:11,color:S[300]}} aria-hidden="true"/>
                                <span style={{fontSize:11,color:S[300],fontWeight:500}}>{rec.viz}</span>
                              </div>
                            </div>
                          </div>
                          <Badge color={rec.priorityColor} bg={rec.priorityBg} style={{fontSize:10,padding:"3px 9px",whiteSpace:"nowrap"}}>
                            {rec.priority}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div style={{display:"flex",justifyContent:"space-between",paddingTop:6}}>
          <Btn variant="outline" onClick={onBack}>← Back</Btn>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            {!canProceedHW&&hwProtocol&&!scanDone&&!scanning&&(
              <span style={{fontSize:11,color:S[400]}}>Scan devices to continue</span>
            )}
            <Btn onClick={()=>setStep(1)} disabled={!canProceedHW}>Next →</Btn>
          </div>
        </div>
      </div>)}

      {/* ─── STEP 1: Components (was step 0) ─── */}
      {step===1&&(<div style={{padding:"20px 24px"}}>
        <h2 style={{fontSize:16,fontWeight:800,color:DK,margin:"0 0 4px",letterSpacing:"-0.02em"}}>What components does your system have?</h2>
        <p style={{fontSize:13,color:S[400],marginBottom:16,lineHeight:1.5}}>Select all that apply. Add custom ones if yours isn't listed.</p>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
          {allC.map(c=>{
            const sel=selected.includes(c.id);
            return(
              <div key={c.id} onClick={()=>toggle(c.id)} style={{border:`${sel?"2px":"1px"} solid ${sel?P:S[150]}`,
                borderRadius:10,padding:"10px 12px",cursor:"pointer",background:sel?PL:S[0],
                display:"flex",alignItems:"center",gap:10,transition:"all .15s",
                boxShadow:sel?`0 0 0 3px ${PL},${SD.xs}`:SD.xs}}>
                <div style={{width:32,height:32,borderRadius:8,background:sel?P:S[100],display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all .15s"}}>
                  <i className={`ti ${c.icon}`} style={{fontSize:15,color:sel?"#fff":S[400]}} aria-hidden="true"/>
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:12,fontWeight:600,color:DK,letterSpacing:"-0.01em"}}>{c.label}</div>
                  <div style={{fontSize:10,color:S[400]}}>{c.unit||"on/off"}{c.isCustom?" · custom":""}</div>
                </div>
                {sel&&<i className="ti ti-check" style={{fontSize:15,color:P,flexShrink:0}} aria-hidden="true"/>}
              </div>
            );
          })}
          <div onClick={()=>setShowCC(true)} style={{border:`1px dashed ${S[200]}`,borderRadius:10,padding:"10px 12px",cursor:"pointer",display:"flex",alignItems:"center",gap:10,background:S[50],boxShadow:SD.xs}}>
            <div style={{width:32,height:32,borderRadius:8,background:S[100],display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <i className="ti ti-plus" style={{fontSize:16,color:S[400]}} aria-hidden="true"/>
            </div>
            <div style={{fontSize:12,fontWeight:600,color:S[400]}}>Add custom component</div>
          </div>
        </div>
        {showCC&&(
          <Card style={{padding:"14px",marginBottom:12,borderColor:PM,boxShadow:`0 0 0 3px ${PL}`}}>
            <div style={{fontSize:12,fontWeight:700,color:DK,marginBottom:10}}>Define custom component</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
              <div><Label>Name</Label><Input value={cName} onChange={e=>setCName(e.target.value)} placeholder="e.g. UV Sterilizer"/></div>
              <div><Label>Unit</Label><Input value={cUnit} onChange={e=>setCUnit(e.target.value)} placeholder="e.g. mJ/cm²"/></div>
            </div>
            <div style={{display:"flex",gap:7}}><Btn onClick={addComp} small>Add</Btn><Btn variant="ghost" onClick={()=>setShowCC(false)} small>Cancel</Btn></div>
          </Card>
        )}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",paddingTop:4}}>
          <Btn variant="outline" onClick={()=>setStep(0)}>← Back</Btn>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:12,color:S[400],fontWeight:500}}>{selected.length} selected</span>
            <Btn onClick={()=>setStep(2)} disabled={selected.length===0}>Next →</Btn>
          </div>
        </div>
      </div>)}

      {/* ─── STEP 2: Parameters (was step 1) ─── */}
      {step===2&&(<div style={{padding:"20px 24px"}}>
        <h2 style={{fontSize:16,fontWeight:800,color:DK,margin:"0 0 4px",letterSpacing:"-0.02em"}}>Configure each component</h2>
        <p style={{fontSize:13,color:S[400],marginBottom:14,lineHeight:1.5}}>Set safe operating ranges. Industry defaults are pre-filled — adjust as needed.</p>
        <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:16,maxHeight:320,overflowY:"auto"}}>
          {selComps.map(c=>{
            const cfg=configured[c.id]||{min:c.min||0,max:c.max||100};
            return(
              <Card key={c.id} style={{padding:"12px 14px"}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <div style={{width:30,height:30,borderRadius:8,background:PL,border:`1px solid ${PM}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    <i className={`ti ${c.icon}`} style={{fontSize:14,color:P}} aria-hidden="true"/>
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:12,fontWeight:700,color:DK,marginBottom:7,letterSpacing:"-0.01em"}}>{c.label} <span style={{color:S[400],fontWeight:400}}>({c.unit})</span></div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 80px",gap:8}}>
                      <div><div style={{fontSize:10,color:S[400],fontWeight:600,marginBottom:3}}>Min safe</div>
                        <input type="number" value={cfg.min} onChange={e=>setConfigured(p=>({...p,[c.id]:{...cfg,min:+e.target.value}}))}
                          style={{width:"100%",border:`1.5px solid ${S[150]}`,borderRadius:7,padding:"6px 8px",fontSize:12,fontFamily:"inherit",outline:"none",background:S[25]}}/>
                      </div>
                      <div><div style={{fontSize:10,color:S[400],fontWeight:600,marginBottom:3}}>Max safe</div>
                        <input type="number" value={cfg.max} onChange={e=>setConfigured(p=>({...p,[c.id]:{...cfg,max:+e.target.value}}))}
                          style={{width:"100%",border:`1.5px solid ${S[150]}`,borderRadius:7,padding:"6px 8px",fontSize:12,fontFamily:"inherit",outline:"none",background:S[25]}}/>
                      </div>
                      <div><div style={{fontSize:10,color:S[400],fontWeight:600,marginBottom:3}}>Unit</div>
                        <div style={{border:`1px solid ${S[150]}`,borderRadius:7,padding:"6px 8px",fontSize:12,color:S[500],background:S[50]}}>{c.unit||"—"}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
        <div style={{display:"flex",justifyContent:"space-between"}}>
          <Btn variant="outline" onClick={()=>setStep(1)}>← Back</Btn>
          <Btn onClick={()=>setStep(3)}>Next →</Btn>
        </div>
      </div>)}

      {/* ─── STEP 3: Roles (was step 2) ─── */}
      {step===3&&(<div style={{padding:"20px 24px"}}>
        <h2 style={{fontSize:16,fontWeight:800,color:DK,margin:"0 0 4px",letterSpacing:"-0.02em"}}>Configure user roles</h2>
        <p style={{fontSize:13,color:S[400],marginBottom:14,lineHeight:1.5}}>Define all roles in your organisation. Each gets a dedicated login and purpose-built interface.</p>
        <div style={{display:"flex",flexDirection:"column",gap:7,marginBottom:12}}>
          {roles.map(r=>(
            <div key={r.id} style={{display:"flex",alignItems:"center",gap:10,padding:"11px 14px",
              border:`1px solid ${S[150]}`,borderRadius:10,background:S[0],boxShadow:SD.xs}}>
              <div style={{width:34,height:34,borderRadius:"50%",background:r.bg,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,border:`1.5px solid ${r.color}44`}}>
                <span style={{fontSize:11,fontWeight:800,color:r.color}}>{r.initials}</span>
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  <span style={{fontSize:12,fontWeight:700,color:DK,letterSpacing:"-0.01em"}}>{r.label}</span>
                  {r.isCustom&&<Badge color={S[500]} bg={S[100]} style={{fontSize:9}}>Custom</Badge>}
                </div>
                <div style={{fontSize:11,color:S[400]}}>{r.desc}</div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                {[["canExport","Export"],["canConfig","Config"]].map(([k,l])=>(
                  <label key={k} style={{display:"flex",alignItems:"center",gap:5,cursor:"pointer"}}>
                    <input type="checkbox" checked={r[k]} onChange={()=>{const nr=[...roles];const idx=nr.findIndex(x=>x.id===r.id);nr[idx]={...r,[k]:!r[k]};setRoles(nr);}} style={{accentColor:P,width:13,height:13}}/>
                    <span style={{fontSize:11,color:S[500],fontWeight:500}}>{l}</span>
                  </label>
                ))}
                {r.isCustom&&<button onClick={()=>removeRole(r.id)} style={{background:"none",border:"none",cursor:"pointer",color:S[300],padding:2,borderRadius:5}}><i className="ti ti-trash" style={{fontSize:14}} aria-hidden="true"/></button>}
              </div>
            </div>
          ))}
        </div>
        <div style={{marginBottom:12}}>
          <Label>Quick-add from presets</Label>
          <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
            {ROLE_PRESETS.filter(p=>!roles.find(r=>r.id===p.id)).map(p=>(
              <div key={p.id} onClick={()=>setRoles(r=>[...r,{...p}])} style={{border:`1px solid ${S[150]}`,borderRadius:8,
                padding:"5px 11px",cursor:"pointer",display:"flex",alignItems:"center",gap:7,background:S[0],boxShadow:SD.xs,transition:"all .15s"}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=PM;e.currentTarget.style.background=PL;}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor=S[150];e.currentTarget.style.background=S[0];}}>
                <div style={{width:20,height:20,borderRadius:"50%",background:p.bg,display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <span style={{fontSize:8,fontWeight:800,color:p.color}}>{p.initials}</span>
                </div>
                <span style={{fontSize:11,color:S[700],fontWeight:600}}>{p.label}</span>
                <i className="ti ti-plus" style={{fontSize:11,color:S[300]}} aria-hidden="true"/>
              </div>
            ))}
          </div>
        </div>
        {showRF?(
          <Card style={{padding:"14px",marginBottom:12,borderColor:PM,boxShadow:`0 0 0 3px ${PL}`}}>
            <div style={{fontSize:12,fontWeight:700,color:DK,marginBottom:10}}>Define custom role</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
              <div><Label>Role name</Label><Input value={nRN} onChange={e=>setNRN(e.target.value)} placeholder="e.g. Shift Supervisor"/></div>
              <div><Label>Description</Label><Input value={nRD} onChange={e=>setNRD(e.target.value)} placeholder="e.g. Oversees production shifts"/></div>
            </div>
            <div style={{display:"flex",gap:7}}><Btn onClick={addRole} small>Add Role</Btn><Btn variant="ghost" onClick={()=>setShowRF(false)} small>Cancel</Btn></div>
          </Card>
        ):(
          <button onClick={()=>setShowRF(true)} style={{display:"flex",alignItems:"center",gap:8,background:S[0],
            border:`1px dashed ${S[200]}`,borderRadius:9,padding:"9px 14px",cursor:"pointer",color:S[400],
            fontSize:12,fontFamily:"inherit",marginBottom:14,width:"100%",justifyContent:"center",fontWeight:600,boxShadow:SD.xs}}>
            <i className="ti ti-plus" style={{fontSize:14}} aria-hidden="true"/>Create custom role
          </button>
        )}
        <div style={{display:"flex",justifyContent:"space-between"}}>
          <Btn variant="outline" onClick={()=>setStep(2)}>← Back</Btn>
          <Btn onClick={()=>setStep(4)}>Next →</Btn>
        </div>
      </div>)}

      {/* ─── STEP 4: Access Control (was step 3) ─── */}
      {step===4&&(<div style={{padding:"20px 24px"}}>
        <h2 style={{fontSize:16,fontWeight:800,color:DK,margin:"0 0 4px",letterSpacing:"-0.02em"}}>Signal access control</h2>
        <p style={{fontSize:13,color:S[400],marginBottom:12,lineHeight:1.5}}>Choose which roles can see each signal. All roles have access by default — toggle to restrict.</p>
        <div style={{display:"flex",flexDirection:"column",gap:7,marginBottom:14,maxHeight:300,overflowY:"auto"}}>
          {selComps.map(c=>{
            const acc=sigRoles[c.id]||roles.map(r=>r.id);
            return(
              <div key={c.id} style={{padding:"11px 13px",border:`1px solid ${S[150]}`,borderRadius:10,background:S[0],boxShadow:SD.xs}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:9}}>
                  <i className={`ti ${c.icon}`} style={{fontSize:14,color:S[400]}} aria-hidden="true"/>
                  <span style={{fontSize:12,fontWeight:700,color:DK,letterSpacing:"-0.01em"}}>{c.label}</span>
                </div>
                <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                  {roles.map(r=>{const has=acc.includes(r.id);return(
                    <div key={r.id} onClick={()=>toggleSR(c.id,r.id)} style={{display:"flex",alignItems:"center",gap:5,
                      border:`1.5px solid ${has?r.color:S[200]}`,borderRadius:7,padding:"4px 10px",cursor:"pointer",
                      background:has?r.bg:S[0],transition:"all .15s",boxShadow:has?`0 0 0 2px ${r.color}22`:SD.xs}}>
                      <div style={{width:15,height:15,borderRadius:"50%",background:has?r.color:S[200],display:"flex",alignItems:"center",justifyContent:"center",transition:"all .15s"}}>
                        {has&&<i className="ti ti-check" style={{fontSize:9,color:"#fff"}} aria-hidden="true"/>}
                      </div>
                      <span style={{fontSize:11,color:has?r.color:S[400],fontWeight:has?600:500}}>{r.label}</span>
                    </div>
                  );})}
                </div>
              </div>
            );
          })}
        </div>
        <div style={{padding:"12px 14px",marginBottom:16,background:EML,border:`1px solid ${EMB}`,borderRadius:10,display:"flex",gap:8,alignItems:"flex-start"}}>
          <i className="ti ti-info-circle" style={{fontSize:15,color:EM,flexShrink:0,marginTop:1}} aria-hidden="true"/>
          <div style={{fontSize:12,color:S[700],lineHeight:1.5}}><strong>{selComps.length} signals</strong> · <strong>{roles.length} roles</strong> configured. NexHMI will generate a purpose-built interface for each role automatically.</div>
        </div>
        <div style={{display:"flex",justifyContent:"space-between"}}>
          <Btn variant="outline" onClick={()=>setStep(3)}>← Back</Btn>
          <Btn onClick={onGenerate}><i className="ti ti-sparkles" style={{marginRight:6}} aria-hidden="true"/>Generate Interfaces →</Btn>
        </div>
      </div>)}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   GENERATING
───────────────────────────────────────────────────────────── */
function Generating({step,industry}){
  const prog=step<0?0:Math.round((step/(GEN_STEPS.length-1))*100);
  return(
    <div style={{fontFamily:"'DM Sans',system-ui,sans-serif",background:S[25],minHeight:500,
      display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"2rem"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700;800&display=swap');
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
      <div style={{width:54,height:54,background:PL,border:`2px solid ${PM}`,borderRadius:16,
        display:"flex",alignItems:"center",justifyContent:"center",marginBottom:20,boxShadow:SD.blue}}>
        <i className="ti ti-settings" style={{fontSize:26,color:P,animation:"spin 3s linear infinite"}} aria-hidden="true"/>
      </div>
      <h2 style={{fontSize:18,fontWeight:800,color:DK,margin:"0 0 6px",letterSpacing:"-0.03em"}}>Building your HMI…</h2>
      <p style={{fontSize:13,color:S[400],margin:"0 0 28px",fontWeight:500}}>{industry?.name} · Generating role-based interfaces</p>
      <div style={{width:"100%",maxWidth:440}}>
        <div style={{background:S[150],borderRadius:6,height:5,overflow:"hidden",marginBottom:20,position:"relative"}}>
          <div style={{width:`${prog}%`,height:"100%",background:`linear-gradient(90deg,${P},${PD})`,borderRadius:6,transition:"width .4s ease",position:"relative"}}>
            <div style={{position:"absolute",right:0,top:"50%",transform:"translateY(-50%)",width:10,height:10,borderRadius:"50%",background:P,boxShadow:`0 0 8px ${P}88`}}/>
          </div>
        </div>
        {GEN_STEPS.map((s,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"5px 0",opacity:i<=step?1:.18,transition:"opacity .3s"}}>
            <div style={{width:18,height:18,borderRadius:"50%",background:i<step?P:i===step?PL:S[150],
              border:`1.5px solid ${i<=step?P:S[200]}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all .3s",
              boxShadow:i===step?`0 0 0 3px ${PL}`:i<step?SD.xs:"none"}}>
              {i<step?<i className="ti ti-check" style={{fontSize:10,color:"#fff"}} aria-hidden="true"/>:i===step?<div style={{width:5,height:5,borderRadius:"50%",background:P}}/>:null}
            </div>
            <span style={{fontSize:12,color:i===step?DK:S[400],fontWeight:i===step?600:400}}>{s}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   LOGIN
───────────────────────────────────────────────────────────── */
function Login({onLogin,industry,roles}){
  const [form,setForm]=useState({username:"",password:""});
  const [error,setError]=useState("");
  const allUsers=[
    {username:"operator",password:"demo123",role:"operator",name:"Rajesh Kumar",initials:"RK"},
    {username:"engineer",password:"demo123",role:"engineer",name:"Priya Sharma",initials:"PS"},
    ...(roles||[]).filter(r=>!["operator","engineer"].includes(r.id)).map(r=>({username:r.label.toLowerCase().replace(/\s+/g,"_"),password:"demo123",role:r.id,name:`Demo ${r.label}`,initials:r.initials,roleData:r})),
  ];
  const attempt=()=>{
    const u=allUsers.find(u=>u.username===form.username&&u.password===form.password);
    if(u){const rd=(roles||[]).find(r=>r.id===u.role)||DEFAULT_ROLES.find(r=>r.id===u.role)||{id:u.role,label:u.role,color:P,bg:PL};onLogin({...u,roleData:rd});setError("");}
    else setError("Invalid credentials. Click any account below to auto-fill.");
  };
  const allRoles=(roles||DEFAULT_ROLES);
  return(
    <div style={{fontFamily:"'DM Sans',system-ui,sans-serif",background:`linear-gradient(135deg,${S[25]} 0%,${PL} 100%)`,
      minHeight:540,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"2rem"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes shake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-6px)}40%,80%{transform:translateX(6px)}}`}</style>
      <div style={{textAlign:"center",marginBottom:24}}>
        <Logo/>
        <p style={{fontSize:12,color:S[400],marginTop:8,fontWeight:500}}>{industry?.name} · {allRoles.length} role{allRoles.length>1?"s":""} configured</p>
      </div>
      <Card style={{width:"100%",maxWidth:380,padding:"28px",marginBottom:12,boxShadow:SD.xl}}>
        <div style={{textAlign:"center",marginBottom:24}}>
          <div style={{fontSize:16,fontWeight:800,color:DK,marginBottom:5,letterSpacing:"-0.02em"}}>Sign in to continue</div>
          <div style={{fontSize:12,color:S[400],fontWeight:500}}>Your role determines which interface you'll see</div>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:16}}>
          <div><Label>Username</Label><Input value={form.username} onChange={e=>setForm(p=>({...p,username:e.target.value}))} placeholder="Enter username" onKeyDown={e=>e.key==="Enter"&&attempt()}/></div>
          <div><Label>Password</Label><Input value={form.password} onChange={e=>setForm(p=>({...p,password:e.target.value}))} placeholder="Enter password" type="password" onKeyDown={e=>e.key==="Enter"&&attempt()}/></div>
        </div>
        {error&&<div style={{background:CRL,border:`1px solid ${CRB}`,borderRadius:8,padding:"9px 13px",fontSize:12,color:CR,marginBottom:12,animation:"shake .4s",fontWeight:500}}>{error}</div>}
        <Btn onClick={attempt} full style={{padding:"11px 22px",fontSize:14}}>Sign In →</Btn>
      </Card>
      <Card style={{width:"100%",maxWidth:380,padding:"16px",boxShadow:SD.md}}>
        <Label>Demo Accounts</Label>
        <div style={{display:"flex",flexDirection:"column",gap:7,maxHeight:190,overflowY:"auto"}}>
          {allUsers.map(u=>{const rd=allRoles.find(r=>r.id===u.role)||{color:P,bg:PL,initials:u.initials};return(
            <div key={u.username} onClick={()=>setForm({username:u.username,password:"demo123"})} style={{display:"flex",alignItems:"center",justifyContent:"space-between",cursor:"pointer",padding:"8px 10px",borderRadius:9,border:`1px solid ${S[150]}`,background:S[25],boxShadow:SD.xs,transition:"all .15s"}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=PM;e.currentTarget.style.background=PL;}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor=S[150];e.currentTarget.style.background=S[25];}}>
              <div style={{display:"flex",alignItems:"center",gap:9}}>
                <div style={{width:28,height:28,borderRadius:"50%",background:rd.bg||PL,display:"flex",alignItems:"center",justifyContent:"center",border:`1.5px solid ${rd.color||P}44`}}>
                  <span style={{fontSize:10,fontWeight:800,color:rd.color||P}}>{rd.initials||u.initials}</span>
                </div>
                <div><div style={{fontSize:12,fontWeight:600,color:DK}}>{u.name}</div><div style={{fontSize:10,color:S[400]}}>{allRoles.find(r=>r.id===u.role)?.label||u.role} · demo123</div></div>
              </div>
              <span style={{fontSize:10,color:S[300],fontWeight:500}}>Click →</span>
            </div>
          );})}
        </div>
      </Card>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   DASHBOARD
───────────────────────────────────────────────────────────── */
function Dashboard({user,components,values,histories,lidarAlert,setLidarAlert,clock,uptime,onLogout,industry}){
  const [selectedComp,setSelectedComp]=useState(null);
  const rd=user.roleData||{id:user.role,label:user.role,color:P,bg:PL};
  const isEng=user.role==="engineer";
  const isMaint=user.role==="maintenance";
  const isMgr=user.role==="manager";
  const uptStr=`${String(Math.floor(uptime/3600)).padStart(2,"0")}:${String(Math.floor((uptime%3600)/60)).padStart(2,"0")}:${String(uptime%60).padStart(2,"0")}`;
  const rulItems=components.slice(0,4).map(c=>RUL_BASE[c.id]||{name:c.label,days:60,total:120});
  const alarms=lidarAlert?[
    {score:10,title:"LIDAR intrusion — all motors halted",sub:"Safety system · Priority 10/10",time:"now",c:CR,bg:CRL,bd:CRB},
    {score:5, title:"Production paused — awaiting clearance",sub:"System alert",time:"now",c:AM,bg:AML,bd:AMB},
  ]:[
    {score:5,title:`${components[0]?.label||"Signal"} trending upward`,sub:"AI · approaching upper threshold",time:"now",c:AM,bg:AML,bd:AMB},
    {score:3,title:`RUL: ${rulItems[rulItems.length-1]?.name||"Component"}`,sub:`${rulItems[rulItems.length-1]?.days||14}d to maintenance`,time:"2m",c:P,bg:PL,bd:PM},
    {score:2,title:"Anomaly score elevated (0.31)",sub:"AI · pattern outside normal band",time:"7m",c:S[500],bg:S[50],bd:S[150]},
    {score:1,title:"Batch cycle counter updated",sub:"System · informational",time:"14m",c:S[400],bg:S[50],bd:S[150]},
  ];
  const visComps=components.filter(c=>!c.isSafety);
  const cols=isEng?Math.min(visComps.length,4):3;

  return(
    <div style={{fontFamily:"'DM Sans',system-ui,sans-serif",background:S[25],minHeight:580}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&display=swap');
        @keyframes blink{0%,100%{opacity:1}50%{opacity:.3}}
        .sig-card:hover{border-color:${PM}!important;box-shadow:${SD.md}!important;transform:translateY(-2px);cursor:pointer}
        .sig-card{transition:all .18s cubic-bezier(.4,0,.2,1)!important}
      `}</style>

      {selectedComp&&<AnalyticsModal comp={selectedComp} value={values[selectedComp.id]||selectedComp.base} history={histories[selectedComp.id]} rul={RUL_BASE[selectedComp.id]} onClose={()=>setSelectedComp(null)}/>}

      {/* Topbar */}
      <div style={{background:"rgba(255,255,255,0.96)",borderBottom:`1px solid ${S[100]}`,padding:"0 20px",height:56,
        display:"flex",alignItems:"center",justifyContent:"space-between",backdropFilter:"blur(8px)",boxShadow:SD.sm,position:"sticky",top:0,zIndex:5}}>
        <div style={{display:"flex",alignItems:"center",gap:14}}>
          <Logo/>
          <div style={{width:1,height:18,background:S[150]}}/>
          <StatusPill label={lidarAlert?"SAFETY HOLD":"All systems normal"} status={lidarAlert?"crit":"ok"}/>
          <span style={{fontSize:12,color:S[400],fontWeight:500}}>{industry?.name}</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:14}}>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:12,color:S[500],fontWeight:600,fontVariantNumeric:"tabular-nums"}}>{clock}</div>
            <div style={{fontSize:10,color:S[300],fontWeight:500}}>Uptime {uptStr}</div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8,background:S[50],border:`1px solid ${S[150]}`,borderRadius:22,padding:"5px 12px",boxShadow:SD.xs}}>
            <div style={{width:28,height:28,borderRadius:"50%",background:rd.bg,display:"flex",alignItems:"center",justifyContent:"center",border:`1.5px solid ${rd.color}44`}}>
              <span style={{fontSize:10,fontWeight:800,color:rd.color}}>{rd.initials}</span>
            </div>
            <div>
              <div style={{fontSize:12,fontWeight:700,color:DK,letterSpacing:"-0.01em"}}>{user.name}</div>
              <div style={{fontSize:10,color:S[400],fontWeight:500}}>{rd.label}</div>
            </div>
          </div>
          <Btn variant="ghost" onClick={onLogout} small>Sign out</Btn>
        </div>
      </div>

      {/* Safety banner */}
      {lidarAlert&&(
        <div style={{background:`linear-gradient(90deg,#7F1D1D,#991B1B)`,padding:"11px 20px",
          display:"flex",alignItems:"center",justifyContent:"space-between",boxShadow:SD.md}}>
          <div style={{display:"flex",alignItems:"center",gap:11}}>
            <div style={{width:36,height:36,borderRadius:9,background:"rgba(252,165,165,0.15)",border:"1px solid rgba(252,165,165,0.3)",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <i className="ti ti-alert-triangle" style={{fontSize:18,color:"#FCA5A5"}} aria-hidden="true"/>
            </div>
            <div>
              <div style={{fontSize:13,fontWeight:800,color:"#FCA5A5",letterSpacing:"-0.01em"}}>SAFETY ALERT — LIDAR INTRUSION DETECTED</div>
              <div style={{fontSize:11,color:"#FCA5A5",opacity:.75,marginTop:1}}>All motors halted automatically · Clear perimeter before resuming operations</div>
            </div>
          </div>
          <button onClick={()=>setLidarAlert(false)} style={{background:"#FCA5A5",color:"#7F1D1D",border:"none",borderRadius:8,
            padding:"7px 16px",fontSize:12,fontWeight:800,cursor:"pointer",fontFamily:"inherit",boxShadow:"0 2px 8px rgba(0,0,0,0.2)"}}>
            Clear & Resume
          </button>
        </div>
      )}

      {/* Click hint */}
      {!isMaint&&!isMgr&&(
        <div style={{padding:"12px 18px 0"}}>
          <div style={{background:PL,border:`1px solid ${PM}`,borderRadius:9,padding:"8px 14px",display:"flex",alignItems:"center",gap:8,boxShadow:SD.xs}}>
            <i className="ti ti-hand-click" style={{fontSize:14,color:P}} aria-hidden="true"/>
            <span style={{fontSize:12,color:P,fontWeight:500}}>Click any signal card to view detailed analytics, AI insights, RUL status and operational history.</span>
          </div>
        </div>
      )}

      {/* Manager view */}
      {isMgr&&(
        <div style={{padding:"16px 18px"}}>
          <Label style={{marginBottom:14}}>Plant Manager Summary</Label>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:10,marginBottom:14}}>
            {[["Overall Health","84%",EM,"ti-heart-rate-monitor"],["Active Alerts","3",AM,"ti-bell"],["RUL Critical","2",CR,"ti-tool"],["Uptime","98.2%",P,"ti-trending-up"]].map(([l,v,c,ic])=>(
              <Card key={l} style={{padding:"16px"}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                  <div style={{width:30,height:30,borderRadius:8,background:c==="EM"?EML:c===AM?AML:c===CR?CRL:PL,display:"flex",alignItems:"center",justifyContent:"center"}}>
                    <i className={`ti ${ic}`} style={{fontSize:15,color:c}} aria-hidden="true"/>
                  </div>
                  <span style={{fontSize:11,color:S[400],fontWeight:500}}>{l}</span>
                </div>
                <div style={{fontSize:28,fontWeight:800,color:c,letterSpacing:"-0.05em"}}>{v}</div>
              </Card>
            ))}
          </div>
          <Card style={{padding:"16px"}}>
            <div style={{fontSize:12,fontWeight:700,color:DK,marginBottom:12,letterSpacing:"-0.01em"}}>Shift Performance</div>
            {components.filter(c=>!c.isSafety).slice(0,3).map(c=>{
              const v=values[c.id]||c.base;const p=pctOf(v,c.min||0,c.max||100);
              return(
                <div key={c.id} style={{display:"flex",alignItems:"center",gap:12,padding:"7px 0",borderBottom:`1px solid ${S[100]}`}}>
                  <span style={{fontSize:12,color:S[600],fontWeight:500,minWidth:150}}>{c.label}</span>
                  <div style={{flex:1,background:S[150],borderRadius:4,height:6}}>
                    <div style={{width:`${p}%`,height:"100%",background:p>85?AM:P,borderRadius:4,transition:"width .8s"}}/>
                  </div>
                  <span style={{fontSize:12,fontWeight:700,color:DK,minWidth:65,textAlign:"right",fontVariantNumeric:"tabular-nums"}}>{fmt(v,1)} {c.unit}</span>
                </div>
              );
            })}
          </Card>
        </div>
      )}

      {/* Maintenance view */}
      {isMaint&&(
        <div style={{padding:"16px 18px"}}>
          <Label style={{marginBottom:14}}>Component Health — Maintenance View</Label>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            {components.filter(c=>!c.isSafety).map(c=>{
              const rul=RUL_BASE[c.id]||{name:c.label,days:60,total:120};
              const p=Math.round((rul.days/rul.total)*100);
              const ins=COMP_INSIGHTS[c.id]||{healthScore:80,riskLevel:"low",recommendation:"No action required."};
              const rC=ins.riskLevel==="high"?CR:ins.riskLevel==="medium"?AM:EM;
              const rBg=ins.riskLevel==="high"?CRL:ins.riskLevel==="medium"?AML:EML;
              return(
                <Card key={c.id} style={{padding:"16px"}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <div style={{width:30,height:30,borderRadius:8,background:S[100],display:"flex",alignItems:"center",justifyContent:"center"}}>
                        <i className={`ti ${c.icon}`} style={{fontSize:14,color:S[500]}} aria-hidden="true"/>
                      </div>
                      <span style={{fontSize:13,fontWeight:700,color:DK,letterSpacing:"-0.01em"}}>{c.label}</span>
                    </div>
                    <Badge color={rC} bg={rBg} style={{fontSize:10,textTransform:"capitalize"}}>{ins.riskLevel}</Badge>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:10}}>
                    <div style={{flex:1}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                        <span style={{fontSize:10,color:S[400],fontWeight:600}}>RUL</span>
                        <span style={{fontSize:11,fontWeight:700,color:rulColor(p)}}>{rul.days}d / {rul.total}d</span>
                      </div>
                      <div style={{background:S[150],borderRadius:4,height:5}}><div style={{width:`${p}%`,height:"100%",background:rulColor(p),borderRadius:4}}/></div>
                    </div>
                    <div style={{fontSize:18,fontWeight:800,color:healthColor(ins.healthScore),minWidth:40,textAlign:"center",letterSpacing:"-0.03em"}}>{ins.healthScore}%</div>
                  </div>
                  <div style={{fontSize:11,color:S[500],lineHeight:1.5}}>{ins.recommendation}</div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Standard signal grid */}
      {!isMgr&&!isMaint&&(
        <div style={{display:"grid",gridTemplateColumns:`repeat(${cols},1fr)`,gap:10,padding:"14px 18px"}}>
          {visComps.map(c=>{
            const v=values[c.id]||c.base;const mn=c.min||0,mx=c.max||100;
            const p=pctOf(v,mn,mx);const warn=p>88||p<8;
            const d=c.unit==="pH"?2:c.unit==="°C"&&mx<50?2:1;
            const hist=histories[c.id]||[];
            const sC=warn?CR:p>75?AM:P;
            return(
              <Card key={c.id} onClick={()=>setSelectedComp(c)} className="sig-card"
                style={{padding:"14px 16px",borderColor:warn?CRB:S[100],background:S[0]}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
                  <div style={{display:"flex",alignItems:"center",gap:7}}>
                    <div style={{width:28,height:28,borderRadius:8,background:warn?CRL:PL,border:`1px solid ${warn?CRB:PM}`,display:"flex",alignItems:"center",justifyContent:"center"}}>
                      <i className={`ti ${c.icon}`} style={{fontSize:13,color:warn?CR:P}} aria-hidden="true"/>
                    </div>
                    <span style={{fontSize:11,color:S[500],fontWeight:500}}>{c.label}</span>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                    {warn&&<div style={{width:7,height:7,borderRadius:"50%",background:CR,animation:"blink 1s infinite"}}/>}
                    <i className="ti ti-chevron-right" style={{fontSize:11,color:S[300]}} aria-hidden="true"/>
                  </div>
                </div>
                <div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between",marginBottom:10}}>
                  <div style={{display:"flex",alignItems:"baseline",gap:4}}>
                    <span style={{fontSize:28,fontWeight:800,color:warn?CR:DK,letterSpacing:"-0.05em",fontVariantNumeric:"tabular-nums",lineHeight:1}}>{fmt(v,d)}</span>
                    <span style={{fontSize:11,color:S[400],fontWeight:500,marginBottom:2}}>{c.unit}</span>
                  </div>
                  {hist.length>3&&<Sparkline data={hist.slice(-10)} color={sC} height={30} width={62} fill={false}/>}
                </div>
                <div style={{background:S[150],borderRadius:5,height:5,overflow:"hidden",marginBottom:4}}>
                  <div style={{width:`${p}%`,height:"100%",borderRadius:5,background:sC,transition:"width .8s ease"}}/>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:9,color:S[300],fontWeight:500}}>
                  <span>{mn}{c.unit}</span><span>{mx}{c.unit}</span>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Bottom panels */}
      {!isMgr&&!isMaint&&(
        <div style={{display:"grid",gridTemplateColumns:isEng?"1fr 1fr 1fr":"1fr 1fr",gap:10,padding:"0 18px 14px"}}>
          <Card style={{padding:"14px 16px"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
              <Label style={{marginBottom:0}}>Active Alerts</Label>
              <Badge color={alarms.length>2?CR:EM} bg={alarms.length>2?CRL:EML}>{alarms.length} active</Badge>
            </div>
            {alarms.map((a,i)=>(
              <div key={i} style={{display:"flex",gap:8,padding:"7px 0",borderBottom:i<alarms.length-1?`1px solid ${S[100]}`:"none",alignItems:"flex-start"}}>
                <div style={{minWidth:26,height:26,borderRadius:7,background:a.bg,border:`1px solid ${a.bd}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  <span style={{fontSize:10,fontWeight:800,color:a.c}}>{a.score}</span>
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:12,fontWeight:600,color:a.score>=7?a.c:DK,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",letterSpacing:"-0.01em"}}>{a.title}</div>
                  <div style={{fontSize:10,color:S[400],marginTop:2,fontWeight:500}}>{a.sub}</div>
                </div>
                <div style={{fontSize:10,color:S[300],flexShrink:0,fontWeight:500}}>{a.time}</div>
              </div>
            ))}
          </Card>

          <Card style={{padding:"14px 16px"}}>
            <Label>Remaining Useful Life</Label>
            {rulItems.map((item,i)=>{
              const p=Math.round((item.days/item.total)*100);const c=rulColor(p);
              return(
                <div key={i} style={{marginBottom:11}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                    <span style={{fontSize:11,color:S[600],fontWeight:500}}>{item.name}</span>
                    <span style={{fontSize:11,fontWeight:800,color:c,letterSpacing:"-0.02em"}}>{item.days}d</span>
                  </div>
                  <div style={{background:S[150],borderRadius:4,height:5,overflow:"hidden"}}><div style={{width:`${p}%`,height:"100%",borderRadius:4,background:c}}/></div>
                </div>
              );
            })}
            <div style={{marginTop:10,padding:"9px 11px",background:EML,border:`1px solid ${EMB}`,borderRadius:9,display:"flex",gap:8,alignItems:"flex-start"}}>
              <i className="ti ti-brain" style={{fontSize:13,color:EM,marginTop:1,flexShrink:0}} aria-hidden="true"/>
              <div style={{fontSize:11,color:S[700],lineHeight:1.5,fontWeight:500}}>ML model predicts components at risk based on current degradation trends.</div>
            </div>
          </Card>

          {isEng&&(
            <Card style={{padding:"14px 16px"}}>
              <Label>Anomaly Timeline</Label>
              {["04:12 — Score 0.31 · speed variance · resolved","03:44 — Temp rising 2× normal · self-corrected","02:17 — Pressure spike · auto-stabilised","01:05 — Fingerprint 003 forming · pre-empted"].map((t,i)=>(
                <div key={i} style={{display:"flex",gap:9,padding:"5px 0",borderBottom:i<3?`1px solid ${S[100]}`:"none"}}>
                  <div style={{width:6,height:6,borderRadius:"50%",background:i===0?AM:EM,marginTop:5,flexShrink:0}}/>
                  <div style={{fontSize:11,color:S[500],lineHeight:1.5,fontWeight:500}}>{t}</div>
                </div>
              ))}
              <div style={{marginTop:10,padding:"9px 11px",background:PL,border:`1px solid ${PM}`,borderRadius:9}}>
                <div style={{fontSize:10,fontWeight:700,color:P,marginBottom:3,letterSpacing:"0.04em",textTransform:"uppercase"}}>Alarm DNA Fingerprinting</div>
                <div style={{fontSize:11,color:S[700],lineHeight:1.5,fontWeight:500}}>Pattern 003 (motor overload) was 60% assembled and pre-empted before any threshold breach.</div>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* AI footer bar */}
      <div style={{margin:"0 18px 16px",padding:"12px 16px",background:S[0],border:`1px solid ${S[100]}`,
        borderRadius:12,display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10,boxShadow:SD.sm}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:30,height:30,borderRadius:8,background:PL,border:`1px solid ${PM}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            <i className="ti ti-brain" style={{fontSize:14,color:P}} aria-hidden="true"/>
          </div>
          <div style={{fontSize:12,color:S[600],maxWidth:420,lineHeight:1.5,fontWeight:500}}>
            <strong style={{color:DK,fontWeight:700}}>AI Insight: </strong>
            {lidarAlert?"Safety event active. Clear the perimeter and acknowledge all alerts before resuming production.":"All systems nominal. Temperature rising at 0.8°C/min — within expected batch profile. Estimated completion in 38 minutes."}
          </div>
        </div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          <Btn variant="outline" small onClick={()=>setLidarAlert(!lidarAlert)}>{lidarAlert?"Clear LIDAR Alert":"Trigger LIDAR Alert"}</Btn>
          {(isEng||user.roleData?.canExport)&&<Btn variant="secondary" small>Export Shift Report</Btn>}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   ROOT
───────────────────────────────────────────────────────────── */
export default function NexHMI(){
  const [screen,setScreen]=useState("landing");
  const [industry,setIndustry]=useState(null);
  const [customInds,setCustomInds]=useState([]);
  const [configuredRoles]=useState(DEFAULT_ROLES);
  const [genStep,setGenStep]=useState(-1);
  const [user,setUser]=useState(null);
  const [values,setValues]=useState({});
  const [histories,setHistories]=useState({});
  const [lidar,setLidar]=useState(false);
  const [clock,setClock]=useState("");
  const [uptime,setUptime]=useState(0);
  const simRef=useRef(null);const genRef=useRef(null);
  const allInds=[...PRESETS,...customInds];
  const selInd=allInds.find(i=>i.id===industry);
  const getDashComps=()=>{
    const defs={food:["temp","conveyor","mixer","lidar"],water:["flow","pressure","ph","lidar"],pharma:["temp","humidity","pressure","lidar"],energy:["speed","vibration","pressure","lidar"],mfg:["speed","temp","vibration","lidar"]};
    const ids=defs[industry]||["temp","pressure","lidar"];
    return ids.map(id=>COMP_LIB.find(c=>c.id===id)).filter(Boolean).map(c=>({...c,role:"both"}));
  };
  useEffect(()=>{const t=setInterval(()=>{setClock(new Date().toTimeString().slice(0,8));setUptime(u=>u+1);},1000);return()=>clearInterval(t);},[]);
  useEffect(()=>{
    if(screen!=="dashboard"){clearInterval(simRef.current);simRef.current=null;return;}
    const comps=getDashComps();
    const init={};comps.forEach(c=>{init[c.id]=c.base;});setValues(init);
    const initH={};comps.forEach(c=>{initH[c.id]=Array.from({length:20},()=>c.base+(Math.random()-.5)*c.drift*4);});setHistories(initH);
    simRef.current=setInterval(()=>{
      if(lidar)return;
      setValues(prev=>{const next={...prev};comps.forEach(c=>{if(c.isSafety)return;const noise=(Math.random()-.5)*c.drift*2;next[c.id]=clamp((prev[c.id]||c.base)+noise,c.min*.95||0,(c.max||100)*.95);});return next;});
      setHistories(prev=>{const next={...prev};comps.forEach(c=>{if(c.isSafety)return;const cur=prev[c.id]||[];const last=cur[cur.length-1]||c.base;const nv=clamp(last+(Math.random()-.5)*c.drift*2,c.min*.95||0,(c.max||100)*.95);next[c.id]=[...cur.slice(-29),nv];});return next;});
    },1500);
    return()=>clearInterval(simRef.current);
  },[screen,lidar]);
  const startGen=()=>{setScreen("generating");setGenStep(-1);let i=-1;genRef.current=setInterval(()=>{i++;setGenStep(i);if(i>=GEN_STEPS.length-1){clearInterval(genRef.current);setTimeout(()=>setScreen("login"),700);}},340);};
  if(screen==="landing")return <Landing onStart={()=>setScreen("industries")}/>;
  if(screen==="industries")return <Industries industries={PRESETS} selected={industry} onSelect={setIndustry} onNext={()=>setScreen("config_method")} onBack={()=>setScreen("landing")} customInds={customInds} setCustomInds={setCustomInds}/>;
  if(screen==="config_method")return <ConfigMethod onSelect={m=>setScreen(m==="ai"?"config_ai":"config_wizard")} onBack={()=>setScreen("industries")} industry={selInd}/>;
  if(screen==="config_ai")return <ConfigAI industry={selInd} onGenerate={startGen} onBack={()=>setScreen("config_method")}/>;
  if(screen==="config_wizard")return <ConfigWizard industry={selInd} allComps={COMP_LIB} onGenerate={startGen} onBack={()=>setScreen("config_method")}/>;
  if(screen==="generating")return <Generating step={genStep} industry={selInd}/>;
  if(screen==="login")return <Login onLogin={u=>{setUser(u);setScreen("dashboard");}} industry={selInd} roles={configuredRoles}/>;
  if(screen==="dashboard")return <Dashboard user={user} components={getDashComps()} values={values} histories={histories} lidarAlert={lidar} setLidarAlert={setLidar} clock={clock} uptime={uptime} onLogout={()=>{setScreen("login");setUser(null);setLidar(false);}} industry={selInd}/>;
  return null;
}