// ---------- Helpers ----------
const $ = sel => document.querySelector(sel);
const hex = (r,g,b)=>'#'+[r,g,b].map(v=>v.toString(16).padStart(2,'0')).join('').toUpperCase();
const clamp = (v,min,max)=>Math.max(min,Math.min(max,v));

// Copy to clipboard function for inline onclick handlers
function copyToClipboard(text) {
  console.log('copyToClipboard called with:', text);
  navigator.clipboard.writeText(text).then(() => {
    showToast('Copied!', `"${text}" copied to clipboard`, 'ok');
  }).catch(() => {
    showToast('Copy failed', 'Clipboard blocked', 'warn');
  });
}

// Make copyToClipboard function globally accessible for inline onclick handlers
window.copyToClipboard = copyToClipboard;

const showToast=(title,msg,type='ok')=>{ 
  const t=$('#toast'); 
  t.innerHTML=`<div class="t-title">${title}</div><div class="small">${msg||''}</div>`; 
  t.className=`toast ${type}`; 
  t.style.display='block'; 
  // Add show class after a brief delay to trigger animation
  setTimeout(() => t.classList.add('show'), 10);
  clearTimeout(showToast._h); 
  showToast._h=setTimeout(()=>{
    t.classList.remove('show');
    setTimeout(() => t.style.display='none', 300);
  }, 4200); 
};

// Theme management
let currentTheme = 'dark';
const themeToggle = $('#themeToggle');
const sunIcon = $('.sun-icon');
const moonIcon = $('.moon-icon');
const themeText = $('.theme-text');

function setTheme(theme) {
  currentTheme = theme;
  document.documentElement.setAttribute('data-theme', theme);
  
  if (theme === 'light') {
    sunIcon.style.display = 'none';
    moonIcon.style.display = 'block';
    themeText.textContent = 'Dark Mode';
  } else {
    sunIcon.style.display = 'block';
    moonIcon.style.display = 'none';
    themeText.textContent = 'Light Mode';
  }
  
  localStorage.setItem('theme', theme);
}

function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 'dark';
  setTheme(savedTheme);
}

themeToggle.addEventListener('click', () => {
  setTheme(currentTheme === 'dark' ? 'light' : 'dark');
});

// Initialize theme on load
initTheme();

window.addEventListener('error', (e)=>{ 
  showToast('Runtime error', e.message || 'Unknown error', 'err'); 
});

window.addEventListener('unhandledrejection', (e)=>{ 
  showToast('Unhandled promise', (e.reason && (e.reason.message||e.reason)) || 'Unknown', 'err'); 
});

function rgbToHsl(r,g,b){ 
  r/=255; g/=255; b/=255; 
  const max=Math.max(r,g,b), min=Math.min(r,g,b); 
  let h,s,l=(max+min)/2; 
  if(max===min){ h=s=0; } else { 
    const d=max-min; 
    s = l>0.5 ? d/(2-max-min) : d/(max+min); 
    switch(max){ 
      case r: h=(g-b)/d+(g<b?6:0); break; 
      case g: h=(b-r)/d+2; break; 
      case b: h=(r-g)/d+4; break;
    } 
    h/=6; 
  } 
  return [Math.round(h*360), Math.round(s*100), Math.round(l*100)]; 
}

function hslToRgb(h,s,l){ 
  h/=360; s/=100; l/=100; 
  if(s===0){ 
    const v=Math.round(l*255); 
    return [v,v,v]; 
  } 
  const hue2rgb=(p,q,t)=>{ 
    if(t<0) t+=1; 
    if(t>1) t-=1; 
    if(t<1/6) return p+(q-p)*6*t; 
    if(t<1/2) return q; 
    if(t<2/3) return p+(q-p)*(2/3 - t)*6; 
    return p; 
  }; 
  const q = l<.5 ? l*(1+s) : l + s - l*s; 
  const p = 2*l - q; 
  const r=hue2rgb(p,q,h+1/3), g=hue2rgb(p,q,h), b=hue2rgb(p,q,h-1/3); 
  return [Math.round(r*255), Math.round(g*255), Math.round(b*255)]; 
}

function adjustLuma([r,g,b], factor){ 
  const [h,s,l]=rgbToHsl(r,g,b); 
  const l2 = clamp(Math.round(l*factor), 3, 97); 
  return hslToRgb(h,s,l2); 
}

function perceivedLuma([r,g,b]){ 
  return 0.2126*r + 0.7152*g + 0.0722*b; 
}

function hexToRgb(h){ 
  const m = h.replace('#',''); 
  return [parseInt(m.slice(0,2),16), parseInt(m.slice(2,4),16), parseInt(m.slice(4,6),16)]; 
}

// ---------- Image handling ----------
const drop = $('#drop'); 
const fileInput = $('#file'); 
const img = $('#img'); 
const imgWrap = $('#imgWrap');

['dragenter','dragover'].forEach(evt=>drop.addEventListener(evt, e=>{e.preventDefault(); drop.classList.add('drag')}));
['dragleave','drop'].forEach(evt=>drop.addEventListener(evt, e=>{e.preventDefault(); drop.classList.remove('drag')}));
drop.addEventListener('click',()=>fileInput.click());
drop.addEventListener('drop', e=>{ 
  const f = e.dataTransfer.files?.[0]; 
  if(f) handleFile(f); 
});

fileInput.addEventListener('change', e=>{ 
  const f = e.target.files?.[0]; 
  if(f) handleFile(f); 
});

function handleFile(f){ 
  try{ 
    if(!f.type.startsWith('image/')) return alert('Please choose an image file.'); 
    const url = URL.createObjectURL(f); 
    img.src = url; 
    img.onload = ()=>{ 
      URL.revokeObjectURL(url); 
      imgWrap.style.display='block'; 
    }; 
  }catch(err){ 
    showToast('Image load failed', err.message||String(err), 'err'); 
  } 
}

// synthetic sample
function makeSampleDataURL(){ 
  const c=document.createElement('canvas'); 
  c.width=640; 
  c.height=420; 
  const ctx=c.getContext('2d'); 
  const blocks=[[240,68,68],[16,185,129],[59,130,246],[234,179,8]]; 
  blocks.forEach((rgb,i)=>{ 
    ctx.fillStyle=hex(...rgb); 
    ctx.fillRect(i*160,0,160,210); 
  }); 
  const grad=ctx.createLinearGradient(0,210,640,420); 
  grad.addColorStop(0,'#111827'); 
  grad.addColorStop(1,'#93c5fd'); 
  ctx.fillStyle=grad; 
  ctx.fillRect(0,210,640,210); 
  ctx.fillStyle='#0b1020'; 
  ctx.font='bold 20px Inter, system-ui, sans-serif'; 
  ctx.fillText('Palette Generator Sample', 18,400); 
  return c.toDataURL('image/png'); 
}

$('#sampleBtn').addEventListener('click', ()=>{ 
  img.src = makeSampleDataURL(); 
  imgWrap.style.display='block'; 
});

// ---------- Palette extraction (k-means) ----------
async function extractPalette(k=8, style='auto', algorithm='kmeans'){
  try{
    if(!img.src) { alert('Upload an image first.'); return []; }
    const canvas = $('#hiddenCanvas'); 
    const ctx = canvas.getContext('2d', { willReadFrequently:true });
    const maxW = 350; 
    const ratio = img.naturalWidth>maxW ? maxW / img.naturalWidth : 1; 
    canvas.width = Math.max(1, Math.round(img.naturalWidth*ratio)); 
    canvas.height = Math.max(1, Math.round(img.naturalHeight*ratio)); 
    ctx.drawImage(img,0,0,canvas.width,canvas.height);
    const data = ctx.getImageData(0,0,canvas.width,canvas.height).data;
    const step = 4, stride = 6; 
    const samples = [];
    for(let i=0;i<data.length;i+=step*stride){ 
      const r=data[i], g=data[i+1], b=data[i+2], a=data[i+3]; 
      if(a<200) continue; 
      samples.push([r,g,b]); 
    }
    if(samples.length===0){ alert('Could not read pixels.'); return []; }
    
    let palette = [];
    
    switch(algorithm) {
      case 'kmeans':
        palette = await kMeansExtraction(samples, k, style);
        break;
      case 'median':
        palette = medianCutExtraction(samples, k, style);
        break;
      // Octree case removed - not functional
      case 'kmeansplus':
        palette = await kMeansPlusExtraction(samples, k, style);
        break;
      default:
        palette = await kMeansExtraction(samples, k, style);
    }
    
    return palette;
  }catch(err){ 
    showToast('Palette extraction failed', err.message||String(err), 'err'); 
    return []; 
  }
}

// Enhanced K-Means extraction
async function kMeansExtraction(samples, k, style) {
  let centroids = []; 
  centroids.push(samples[Math.floor(Math.random()*samples.length)]);
  
  while(centroids.length<k){ 
    const dists = samples.map(p=>{ 
      let d=Infinity; 
      for(const c of centroids){ 
        const dx=p[0]-c[0], dy=p[1]-c[1], dz=p[2]-c[2]; 
        const di = dx*dx+dy*dy+dz*dz; 
        if(di<d) d=di; 
      } 
      return d; 
    }); 
    let sum=dists.reduce((a,b)=>a+b,0), r2=Math.random()*sum, acc=0, idx=0; 
    for(let i=0;i<dists.length;i++){ 
      acc+=dists[i]; 
      if(acc>=r2){ idx=i; break; } 
    } 
    centroids.push(samples[idx]); 
  }
  
  let labels = new Array(samples.length).fill(0);
  for(let iter=0; iter<15; iter++){
    for(let i=0;i<samples.length;i++){
      let best=0, bestd=Infinity; 
      const p=samples[i];
      for(let c=0;c<centroids.length;c++){ 
        const cc=centroids[c]; 
        const dx=p[0]-cc[0], dy=p[1]-cc[1], dz=p[2]-cc[2]; 
        const d=dx*dx+dy*dy+dz*dz; 
        if(d<bestd){ bestd=d; best=c; } 
      }
      labels[i]=best;
    }
    const sums = Array.from({length:k},()=>[0,0,0,0]);
    for(let i=0;i<samples.length;i++){ 
      const l=labels[i]; 
      sums[l][0]+=samples[i][0]; 
      sums[l][1]+=samples[i][1]; 
      sums[l][2]+=samples[i][2]; 
      sums[l][3]++; 
    }
    for(let c=0;c<k;c++) if(sums[c][3]>0){ 
      centroids[c]=[ 
        Math.round(sums[c][0]/sums[c][3]), 
        Math.round(sums[c][1]/sums[c][3]), 
        Math.round(sums[c][2]/sums[c][3]) 
      ]; 
    }
  }
  
  const counts = Array.from({length:k},()=>0); 
  for(const l of labels) counts[l]++;
  let palette = centroids.map((c,i)=>({rgb:c, count:counts[i]}));
  
  return applyStyleBias(palette, style);
}

// Median Cut extraction
function medianCutExtraction(samples, k, style) {
  const boxes = [samples];
  const palette = [];
  
  while (boxes.length < k && boxes.some(box => box.length > 1)) {
    const boxIndex = boxes.findIndex(box => box.length > 1);
    const box = boxes[boxIndex];
    
    // Find the color channel with the greatest range
    let rMin = 255, rMax = 0, gMin = 255, gMax = 0, bMin = 255, bMax = 0;
    box.forEach(color => {
      rMin = Math.min(rMin, color[0]); rMax = Math.max(rMax, color[0]);
      gMin = Math.min(gMin, color[1]); gMax = Math.max(gMax, color[1]);
      bMin = Math.min(bMin, color[2]); bMax = Math.max(bMax, color[2]);
    });
    
    const rRange = rMax - rMin;
    const gRange = gMax - gMin;
    const bRange = bMax - bMin;
    
    const maxRange = Math.max(rRange, gRange, bRange);
    let sortIndex = 0;
    if (maxRange === gRange) sortIndex = 1;
    else if (maxRange === bRange) sortIndex = 2;
    
    // Sort by the channel with greatest range
    box.sort((a, b) => a[sortIndex] - b[sortIndex]);
    
    // Split at median
    const median = Math.floor(box.length / 2);
    const box1 = box.slice(0, median);
    const box2 = box.slice(median);
    
    boxes.splice(boxIndex, 1, box1, box2);
  }
  
  // Calculate average color for each box
  boxes.forEach(box => {
    if (box.length > 0) {
      const avgR = Math.round(box.reduce((sum, color) => sum + color[0], 0) / box.length);
      const avgG = Math.round(box.reduce((sum, color) => sum + color[1], 0) / box.length);
      const avgB = Math.round(box.reduce((sum, color) => sum + color[2], 0) / box.length);
      palette.push({rgb: [avgR, avgG, avgB], count: box.length});
    }
  });
  
  return applyStyleBias(palette, style);
}

// Octree extraction removed - not functional

// K-Means++ extraction
async function kMeansPlusExtraction(samples, k, style) {
  let centroids = [samples[Math.floor(Math.random()*samples.length)]];
  
  // Initialize centroids using k-means++ algorithm
  for (let i = 1; i < k; i++) {
    const distances = samples.map(point => {
      let minDist = Infinity;
      centroids.forEach(centroid => {
        const dist = Math.hypot(point[0] - centroid[0], point[1] - centroid[1], point[2] - centroid[2]);
        minDist = Math.min(minDist, dist);
      });
      return minDist;
    });
    
    const totalDist = distances.reduce((sum, dist) => sum + dist, 0);
    let random = Math.random() * totalDist;
    let selectedIndex = 0;
    
    for (let j = 0; j < distances.length; j++) {
      random -= distances[j];
      if (random <= 0) {
        selectedIndex = j;
        break;
      }
    }
    
    centroids.push(samples[selectedIndex]);
  }
  
  // Run k-means clustering
  return await kMeansExtraction(samples, k, style);
}

// Apply style bias to palette
function applyStyleBias(palette, style) {
  const addStyleBias = (item)=>{ 
    const [r,g,b]=item.rgb; 
    const [h,s,l]=rgbToHsl(r,g,b); 
    let bias=0; 
    if(style==='vibrant') bias += s*0.6 + (100-Math.abs(l-50))*0.2; 
    if(style==='muted') bias += (100-s)*0.6 + Math.abs(l-50)*0.2; 
    if(style==='balanced') bias += 50 - Math.abs(l-50); 
    return item.count + bias; 
  };
  
  palette.sort((a,b)=> addStyleBias(b) - addStyleBias(a));
  return palette.map(p=>p.rgb);
}

// Octree class removed - not functional

// ---------- Harmonies ----------
function makeHarmony(rgb, type){
  if(type==='none' || !rgb) return [];
  const [h,s,l] = rgbToHsl(...rgb);
  const H=(x)=>{ let v=(x%360); if(v<0) v+=360; return v; };
  const sat = clamp(s, 35, 96); // nudge for nicer schemes
  const light = clamp(l, 30, 70);
  const toRgb=(hh,ll=light,ss=sat)=>hslToRgb(hh, ss, ll);
  switch(type){
    case 'complementary': return [ toRgb(H(h)), toRgb(H(h+180)) ];
    case 'analogous':     return [ toRgb(H(h-30)), toRgb(H(h)), toRgb(H(h+30)) ];
    case 'triadic':       return [ toRgb(H(h)), toRgb(H(h+120)), toRgb(H(h+240)) ];
    case 'tetradic':      return [ toRgb(H(h)), toRgb(H(h+90)), toRgb(H(h+180)), toRgb(H(h+270)) ];
    case 'monochrome':    return [ toRgb(H(h), clamp(light*0.7,10,90)), toRgb(H(h), light), toRgb(H(h), clamp(light*1.3,10,90)) ];
    default: return [];
  }
}

// ---------- Rendering swatches & harmony UI ----------
const swatchesEl=$('#swatches'); 
const copyAllBtn=$('#copyAll'); 
const downloadPNGBtn=$('#downloadPNG');
const baseIdxSel=$('#baseIdx'); 
const harmonySel=$('#harmony'); 
const harmonyWrap=$('#harmonyWrap'); 
const useHarmonyChk=$('#useHarmony');
let currentPalette=[]; 
let currentHarmony=[];

// Enhanced palette controls
const addColorBtn = $('#addColorBtn');
const sortByHueBtn = $('#sortByHueBtn');
const sortBySaturationBtn = $('#sortBySaturationBtn');
const sortByLightnessBtn = $('#sortByLightnessBtn');
const randomizeBtn = $('#randomizeBtn');

// Color editor modal
const colorModal = $('#colorModal');
const hexInput = $('#hexInput');
const redInput = $('#redInput');
const greenInput = $('#greenInput');
const blueInput = $('#blueInput');
const saveEditBtn = $('#saveEdit');
const cancelEditBtn = $('#cancelEdit');

// Color wheel elements
const colorWheel = $('#colorWheel');
const wheelCursor = $('#wheelCursor');
const colorPreview = $('#colorPreview');
const currentColorText = $('#currentColorText');
const newColorText = $('#newColorText');

// HSL sliders
const hueSlider = $('#hueSlider');
const saturationSlider = $('#saturationSlider');
const lightnessSlider = $('#lightnessSlider');
const hueValue = $('#hueValue');
const saturationValue = $('#saturationValue');
const lightnessValue = $('#lightnessValue');

// Debug: Check if elements are found
console.log('Color editor elements found:', {
  colorModal: !!colorModal,
  hexInput: !!hexInput,
  redInput: !!redInput,
  greenInput: !!greenInput,
  blueInput: !!blueInput,
  saveEditBtn: !!saveEditBtn,
  cancelEditBtn: !!cancelEditBtn,
  colorWheel: !!colorWheel,
  wheelCursor: !!wheelCursor,
  colorPreview: !!colorPreview,
  currentColorText: !!currentColorText,
  newColorText: !!newColorText,
  hueSlider: !!hueSlider,
  saturationSlider: !!saturationSlider,
  lightnessSlider: !!lightnessSlider,
  hueValue: !!hueValue,
  saturationValue: !!saturationValue,
  lightnessValue: !!lightnessValue
});

let editingColorIndex = -1;
let currentHue = 0;
let currentSaturation = 100;
let currentLightness = 50;
let isUpdatingFromWheel = false;

// Initialize color wheel
function initColorWheel() {
  const ctx = colorWheel.getContext('2d');
  const centerX = colorWheel.width / 2;
  const centerY = colorWheel.height / 2;
  const radius = Math.min(centerX, centerY) - 2;
  
  // Draw color wheel
  for (let angle = 0; angle < 360; angle += 1) {
    for (let sat = 0; sat <= radius; sat += 1) {
      const hue = angle;
      const saturation = (sat / radius) * 100;
      const lightness = 50;
      
      const rgb = hslToRgb(hue, saturation, lightness);
      const x = centerX + sat * Math.cos(angle * Math.PI / 180);
      const y = centerY + sat * Math.sin(angle * Math.PI / 180);
      
      ctx.fillStyle = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
      ctx.fillRect(x, y, 1, 1);
    }
  }
}

function renderSwatches(palette){
  console.log('Rendering swatches for palette:', palette);
  swatchesEl.innerHTML=''; 
  currentPalette=palette; 
  copyAllBtn.disabled = palette.length===0; 
  downloadPNGBtn.disabled = palette.length===0;
  baseIdxSel.innerHTML = palette.map((c,i)=>`<option value="${i}">#${(i+1).toString().padStart(2,'0')} ${hex(...c)}</option>`).join('');
  
  const frag = document.createDocumentFragment();
  palette.forEach((rgbVals, idx)=>{
    const h = hex(...rgbVals); 
    const [hu, sa, li] = rgbToHsl(...rgbVals);
    const wrap = document.createElement('div'); 
    wrap.className='swatch';
    
    // Create the swatch HTML with inline event handlers
    const swatchHTML = `
      <div class="chip" style="background:${h}"></div>
      <div class="edit-overlay">
        <button class="edit-btn" onclick="openColorEditor(${idx})" data-index="${idx}">Edit</button>
        <button class="edit-btn" onclick="removeColor(${idx})" data-index="${idx}" data-action="remove">×</button>
      </div>
      <div class="swmeta">
        <div style="display:flex; align-items:center; justify-content:space-between; gap:8px; margin-bottom:6px">
          <strong>#${(idx+1).toString().padStart(2,'0')}</strong>
          <span class="hint">HSL ${hu} ${sa}% ${li}%</span>
        </div>
        <div class="code"><span>${h}</span><span class="copy" onclick="copyToClipboard('${h}')" data-copy="${h}">📋</span></div>
      </div>`;
    
    console.log(`Swatch ${idx} HTML:`, swatchHTML);
    wrap.innerHTML = swatchHTML;
    frag.appendChild(wrap);
  });
  swatchesEl.appendChild(frag);
  console.log('Swatches rendered, total swatches:', swatchesEl.querySelectorAll('.swatch').length);
  console.log('Edit buttons found:', swatchesEl.querySelectorAll('.edit-btn').length);
  updateHarmony();
}

// Update color wheel cursor position
function updateWheelCursor(hue, saturation) {
  const centerX = colorWheel.width / 2;
  const centerY = colorWheel.height / 2;
  const radius = Math.min(centerX, centerY) - 2;
  
  const satRadius = (saturation / 100) * radius;
  const x = centerX + satRadius * Math.cos(hue * Math.PI / 180);
  const y = centerY + satRadius * Math.sin(hue * Math.PI / 180);
  
  wheelCursor.style.left = x + 'px';
  wheelCursor.style.top = y + 'px';
}

// Update color preview
function updateColorPreview() {
  const rgb = hslToRgb(currentHue, currentSaturation, currentLightness);
  const hexColor = hex(...rgb);
  
  colorPreview.style.background = hexColor;
  newColorText.textContent = hexColor;
  
  // Update input fields
  hexInput.value = hexColor;
  redInput.value = rgb[0];
  greenInput.value = rgb[1];
  blueInput.value = rgb[2];
  
  // Update slider values
  if (!isUpdatingFromWheel) {
    hueSlider.value = currentHue;
    saturationSlider.value = currentSaturation;
    lightnessSlider.value = currentLightness;
    
    hueValue.textContent = `${Math.round(currentHue)}°`;
    saturationValue.textContent = `${Math.round(currentSaturation)}%`;
    lightnessValue.textContent = `${Math.round(currentLightness)}%`;
  }
}

// Handle color wheel click
function handleWheelClick(e) {
  const rect = colorWheel.getBoundingClientRect();
  const centerX = colorWheel.width / 2;
  const centerY = colorWheel.height / 2;
  const radius = Math.min(centerX, centerY) - 2;
  
  const x = e.clientX - rect.left - centerX;
  const y = e.clientY - rect.top - centerY;
  
  // Calculate angle and distance
  const angle = Math.atan2(y, x) * 180 / Math.PI;
  const distance = Math.sqrt(x * x + y * y);
  
  // Convert to hue and saturation
  currentHue = (angle + 360) % 360;
  currentSaturation = Math.min(100, Math.max(0, (distance / radius) * 100));
  
  updateWheelCursor(currentHue, currentSaturation);
  updateColorPreview();
}

// Handle slider changes
function handleHueChange() {
  currentHue = parseInt(hueSlider.value);
  currentSaturation = parseInt(saturationSlider.value);
  currentLightness = parseInt(lightnessSlider.value);
  
  updateWheelCursor(currentHue, currentSaturation);
  updateColorPreview();
}

function handleSaturationChange() {
  currentSaturation = parseInt(saturationSlider.value);
  updateWheelCursor(currentHue, currentSaturation);
  updateColorPreview();
}

function handleLightnessChange() {
  currentLightness = parseInt(lightnessSlider.value);
  updateColorPreview();
}

// Manual color editing
function openColorEditor(index) {
  console.log('Opening color editor for index:', index);
  editingColorIndex = index;
  const color = currentPalette[index];
  const hexColor = hex(...color);
  
  console.log('Color:', color, 'Hex:', hexColor);
  
  // Set current color display
  currentColorText.textContent = hexColor;
  colorPreview.style.background = hexColor;
  
  // Convert to HSL for sliders
  const [h, s, l] = rgbToHsl(...color);
  currentHue = h;
  currentSaturation = s;
  currentLightness = l;
  
  console.log('HSL:', h, s, l);
  
  // Update wheel cursor
  updateWheelCursor(currentHue, currentSaturation);
  
  // Update all inputs
  updateColorPreview();
  
  console.log('Adding active class to modal');
  colorModal.classList.add('active');
  console.log('Modal classes:', colorModal.className);
  console.log('Modal display:', colorModal.style.display);
  
  // Check computed styles
  const computedStyle = window.getComputedStyle(colorModal);
  console.log('Modal computed styles:', {
    display: computedStyle.display,
    visibility: computedStyle.visibility,
    opacity: computedStyle.opacity,
    zIndex: computedStyle.zIndex,
    position: computedStyle.position
  });
  
  // Check if modal is visible
  const rect = colorModal.getBoundingClientRect();
  console.log('Modal bounding rect:', rect);
  
  // Check modal overlay
  const modalOverlay = colorModal.closest('.modal-overlay');
  if (modalOverlay) {
    console.log('Modal overlay found:', modalOverlay);
    console.log('Modal overlay classes:', modalOverlay.className);
    const overlayComputedStyle = window.getComputedStyle(modalOverlay);
    console.log('Modal overlay computed styles:', {
      display: overlayComputedStyle.display,
      visibility: overlayComputedStyle.visibility,
      opacity: overlayComputedStyle.opacity,
      zIndex: overlayComputedStyle.zIndex,
      position: overlayComputedStyle.position
    });
  } else {
    console.log('Modal overlay not found');
  }
}

// Make functions globally accessible for inline onclick handlers
window.openColorEditor = openColorEditor;

function closeColorEditor() {
  console.log('Closing color editor');
  colorModal.classList.remove('active');
  editingColorIndex = -1;
  console.log('Modal classes after close:', colorModal.className);
}

function saveColorEdit() {
  if (editingColorIndex === -1) return;
  
  const hexColor = hexInput.value.trim();
  const red = parseInt(redInput.value);
  const green = parseInt(greenInput.value);
  const blue = parseInt(blueInput.value);
  
  let newColor;
  
  if (hexColor.match(/^#[0-9A-Fa-f]{6}$/)) {
    newColor = hexToRgb(hexColor);
  } else if (!isNaN(red) && !isNaN(green) && !isNaN(blue) && 
             red >= 0 && red <= 255 && green >= 0 && green <= 255 && blue >= 0 && blue <= 255) {
    newColor = [red, green, blue];
  } else {
    showToast('Invalid color', 'Please enter a valid HEX color or RGB values', 'err');
    return;
  }
  
  currentPalette[editingColorIndex] = newColor;
  renderSwatches(currentPalette);
  recalcTheme();
  closeColorEditor();
  showToast('Color updated', 'The color has been successfully modified', 'ok');
}

function removeColor(index) {
  if (currentPalette.length <= 3) {
    showToast('Cannot remove', 'Palette must have at least 3 colors', 'warn');
    return;
  }
  
  currentPalette.splice(index, 1);
  renderSwatches(currentPalette);
  recalcTheme();
  showToast('Color removed', 'The color has been removed from the palette', 'ok');
}

// Make removeColor function globally accessible for inline onclick handlers
window.removeColor = removeColor;

function addRandomColor() {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  
  currentPalette.push([r, g, b]);
  renderSwatches(currentPalette);
  recalcTheme();
  showToast('Color added', 'A random color has been added to the palette', 'ok');
}

// Palette sorting functions
function sortPaletteByHue() {
  currentPalette.sort((a, b) => {
    const [ha, sa, la] = rgbToHsl(...a);
    const [hb, sb, lb] = rgbToHsl(...b);
    return ha - hb;
  });
  renderSwatches(currentPalette);
  recalcTheme();
}

function sortPaletteBySaturation() {
  currentPalette.sort((a, b) => {
    const [ha, sa, la] = rgbToHsl(...a);
    const [hb, sb, lb] = rgbToHsl(...b);
    return sa - sb;
  });
  renderSwatches(currentPalette);
  recalcTheme();
}

function sortPaletteByLightness() {
  currentPalette.sort((a, b) => {
    const [ha, sa, la] = rgbToHsl(...a);
    const [hb, sb, lb] = rgbToHsl(...b);
    return la - lb;
  });
  renderSwatches(currentPalette);
  recalcTheme();
}

function randomizePalette() {
  // Fisher-Yates shuffle
  for (let i = currentPalette.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [currentPalette[i], currentPalette[j]] = [currentPalette[j], currentPalette[i]];
  }
  renderSwatches(currentPalette);
  recalcTheme();
}

// Event listeners for enhanced controls
addColorBtn.addEventListener('click', addRandomColor);
sortByHueBtn.addEventListener('click', sortPaletteByHue);
sortBySaturationBtn.addEventListener('click', sortPaletteBySaturation);
sortByLightnessBtn.addEventListener('click', sortPaletteByLightness);
randomizeBtn.addEventListener('click', randomizePalette);

// Test button removed - no longer needed

// Color wheel event listeners
colorWheel.addEventListener('click', handleWheelClick);
hueSlider.addEventListener('input', handleHueChange);
saturationSlider.addEventListener('input', handleSaturationChange);
lightnessSlider.addEventListener('input', handleLightnessChange);

// Color editor modal events
saveEditBtn.addEventListener('click', saveColorEdit);
cancelEditBtn.addEventListener('click', closeColorEditor);

// Close modal when clicking outside
colorModal.addEventListener('click', (e) => {
  if (e.target === colorModal) {
    closeColorEditor();
  }
});

console.log('Event listeners attached to color editor elements');

// Initialize color wheel when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  initColorWheel();
  
  // Add document-level click handler for debugging
  document.addEventListener('click', (e) => {
    if (e.target.closest('.edit-btn')) {
      console.log('Document click detected on edit button:', e.target.closest('.edit-btn'));
    }
  });
  
  // Add document-level event delegation for edit buttons as backup
  document.addEventListener('click', (e) => {
    const editBtn = e.target.closest('.edit-btn');
    if (editBtn) {
      console.log('Document-level edit button click detected');
      const index = parseInt(editBtn.getAttribute('data-index'));
      const action = editBtn.getAttribute('data-action');
      
      if (action === 'remove') {
        console.log('Document-level: Removing color at index:', index);
        removeColor(index);
      } else {
        console.log('Document-level: Opening color editor for index:', index);
        openColorEditor(index);
      }
    }
  });
});

// Handle swatch interactions
swatchesEl.addEventListener('click', (e) => {
  const target = e.target;
  console.log('Swatch clicked:', target, 'Classes:', target.className, 'Tag:', target.tagName);
  
  // Check if the clicked element is an edit button or inside one
  let editBtn = null;
  let copyBtn = null;
  
  // Check if target is the button itself
  if (target.classList.contains('edit-btn')) {
    editBtn = target;
  } else if (target.classList.contains('copy')) {
    copyBtn = target;
  } else {
    // Check if target is inside a button
    const parentEditBtn = target.closest('.edit-btn');
    const parentCopyBtn = target.closest('.copy');
    
    if (parentEditBtn) editBtn = parentEditBtn;
    if (parentCopyBtn) copyBtn = parentCopyBtn;
  }
  
  if (copyBtn) {
    console.log('Copy button clicked');
    navigator.clipboard.writeText(copyBtn.getAttribute('data-copy')).then(()=>{ 
      copyBtn.textContent='✓'; 
      setTimeout(()=>copyBtn.textContent='📋', 900); 
    }).catch(()=> showToast('Copy failed','Clipboard blocked.','warn')); 
    return;
  }
  
  if (editBtn) {
    console.log('Edit button clicked, index:', editBtn.getAttribute('data-index'), 'action:', editBtn.getAttribute('data-action'));
    const index = parseInt(editBtn.getAttribute('data-index'));
    const action = editBtn.getAttribute('data-action');
    
    if (action === 'remove') {
      console.log('Removing color at index:', index);
      removeColor(index);
    } else {
      console.log('Opening color editor for index:', index);
      openColorEditor(index);
    }
  }
});

// Algorithm selection
const algorithmOptions = document.querySelectorAll('.algorithm-option');
let selectedAlgorithm = 'kmeans';

algorithmOptions.forEach(option => {
  option.addEventListener('click', () => {
    algorithmOptions.forEach(opt => opt.classList.remove('active'));
    option.classList.add('active');
    selectedAlgorithm = option.getAttribute('data-algorithm');
  });
});

function renderHarmony(list){
  harmonyWrap.innerHTML=''; 
  currentHarmony=list||[];
  if(!list || !list.length){ 
    harmonyWrap.innerHTML='<div class="hint">No harmony selected.</div>'; 
    return; 
  }
  const frag=document.createDocumentFragment();
  list.forEach((rgb, i)=>{
    const h = hex(...rgb);
    const el=document.createElement('div'); 
    el.className='swatch';
    el.innerHTML=`<div class="chip" style="background:${h}"></div>
      <div class="swmeta"><div class="code"><span>${h}</span><span class="copy" data-copy="${h}">📋</span></div></div>`;
    frag.appendChild(el);
  });
  harmonyWrap.appendChild(frag);
}

harmonySel.addEventListener('change', updateHarmony);
baseIdxSel.addEventListener('change', updateHarmony);
useHarmonyChk.addEventListener('change', ()=>{ recalcTheme(); });

function updateHarmony(){
  const idx=parseInt(baseIdxSel.value||'0',10); 
  const base=currentPalette[idx];
  renderHarmony(makeHarmony(base, harmonySel.value));
  recalcTheme();
}

// Duplicate event listener removed - functionality is now handled by the main swatch event listener above

copyAllBtn.addEventListener('click',()=>{ 
  if(!currentPalette.length) return; 
  navigator.clipboard.writeText(currentPalette.map(c=>hex(...c)).join('\n')).then(()=>{ 
    copyAllBtn.textContent='Copied!'; 
    setTimeout(()=>copyAllBtn.textContent='Copy HEX list',1200); 
  }).catch(()=> showToast('Copy failed','Clipboard blocked.','warn')); 
});

function downloadPalettePNG(){ 
  const w=1100, h=160+Math.ceil(currentPalette.length/6)*130; 
  const c=document.createElement('canvas'); 
  c.width=w; 
  c.height=h; 
  const ctx=c.getContext('2d'); 
  ctx.fillStyle='#0b1020'; 
  ctx.fillRect(0,0,w,h); 
  ctx.font='bold 20px Inter, system-ui, sans-serif'; 
  ctx.fillStyle='#e7ecff'; 
  ctx.fillText('Palette Generator Export',24,36); 
  ctx.font='14px Inter, system-ui, sans-serif'; 
  ctx.fillStyle='#aab3d4'; 
  ctx.fillText('HEX · generated '+new Date().toLocaleString(),24,58); 
  const cols=6, gap=16, sw=(w-48-(cols-1)*gap)/cols, sh=80; 
  let i=0; 
  for(const rgb of currentPalette){ 
    const col=i%cols; 
    const row=Math.floor(i/cols); 
    const x=24+col*(sw+gap), y=90+row*(sh+54); 
    ctx.fillStyle=hex(...rgb); 
    ctx.fillRect(x,y,sw,sh); 
    ctx.strokeStyle='rgba(255,255,255,.15)'; 
    ctx.strokeRect(x+0.5,y+0.5,sw-1,sh-1); 
    ctx.fillStyle='#e7ecff'; 
    ctx.fillRect(x,y+sh,sw,32); 
    ctx.fillStyle='#0b1020'; 
    ctx.font='bold 13px Inter, system-ui, sans-serif'; 
    ctx.fillText(hex(...rgb), x+8, y+sh+21); 
    i++; 
  } 
  const a=document.createElement('a'); 
  a.download='palette.png'; 
  a.href=c.toDataURL('image/png'); 
  a.click(); 
}

$('#downloadPNG').addEventListener('click', downloadPalettePNG);

// ---------- Themes & preview ----------
const rolesEl=$('#roles'); 
const modeSel=$('#mode'); 
const bgStrengthSel=$('#bgStrength'); 
const previewEl=$('#preview');
const downloadPBIBtn=$('#downloadPBI'); 
const downloadOfficeBtn=$('#downloadOffice'); 
const downloadCSSBtn=$('#downloadCSS'); 
const downloadTailwindBtn=$('#downloadTailwind');
const downloadFigmaBtn=$('#downloadFigma');
const downloadSketchBtn=$('#downloadSketch');
const dlBothBtn=$('#dlBoth');
let theme=null;

function accentsSource(){ 
  return useHarmonyChk.checked && currentHarmony.length ? currentHarmony : currentPalette; 
}

function deriveTheme(){
  const palette=accentsSource(); 
  if(!palette || palette.length<1) return null;
  const byChroma=[...palette].sort((a,b)=> rgbToHsl(...b)[1]-rgbToHsl(...a)[1]);
  const accents = byChroma.slice(0, Math.min(8, byChroma.length));
  const mode = modeSel.value; 
  const strength = bgStrengthSel.value;
  let bg = mode==='dark' ? [14,18,40] : [250,252,255];
  if(mode==='dark'){ 
    if(strength==='soft') bg=[16,21,46]; 
    if(strength==='bold') bg=[6,9,20]; 
  } else { 
    if(strength==='soft') bg=[245,247,252]; 
    if(strength==='bold') bg=[255,255,255]; 
  }
  const fg = perceivedLuma(bg) > 128 ? [18,23,40] : [231,236,255];
  const link = accents[0]; 
  const followed = adjustLuma(accents[0], mode==='dark'?0.8:1.2);
  return { background:bg, foreground:fg, accents, hyperlink:link, followed:followed };
}

function renderRoles(t){ 
  if(!t){ rolesEl.innerHTML=''; return; } 
  const slots=[ 
    ['Background',t.background], 
    ['Foreground',t.foreground], 
    ['Accent 1',t.accents[0]||t.foreground], 
    ['Accent 2',t.accents[1]||t.foreground], 
    ['Accent 3',t.accents[2]||t.foreground], 
    ['Accent 4',t.accents[3]||t.foreground], 
    ['Accent 5',t.accents[4]||t.foreground], 
    ['Accent 6',t.accents[5]||t.foreground], 
    ['Hyperlink',t.hyperlink], 
    ['Followed link',t.followed] 
  ]; 
  rolesEl.innerHTML = slots.map(([name, rgb])=>{ 
    const h = hex(...rgb); 
    return `<div class="role"><div class="top" style="background:${h}"></div><div class="meta"><div style="font-weight:700">${name}</div><div class="code" style="margin-top:6px"><span>${h}</span><span class="copy" data-copy="${h}">📋</span></div></div></div>`; 
  }).join(''); 
}

function renderPreview(t){ 
  if(!t){ previewEl.innerHTML=''; return; } 
  const as=t.accents.map(a=>hex(...a)); 
  const bg=hex(...t.background), fg=hex(...t.foreground); 
  const link=hex(...t.hyperlink); 
  const chips=as.map(h=>`<span class="pill" style="background:${h}; color:${perceivedLuma(hexToRgb(h))>160?'#101623':'#F8FAFF'}">${h}</span>`).join(''); 
  previewEl.innerHTML=`
  <div class="pane" style="background:${bg}; color:${fg}">
    <div class="head">UI Preview</div>
    <div class="content">
      <div>Heading • <a style="color:${link}" href="#">Hyperlink</a></div>
      <div class="chiprow">${chips}</div>
      <button class="btn" style="background:${as[0]||fg}; border-color:rgba(255,255,255,.2); color:${perceivedLuma(hexToRgb(as[0]||fg))>160?'#101623':'#F8FAFF'}">Primary</button>
      <button class="btn" style="background:${as[1]||fg}; border-color:rgba(255,255,255,.2); color:${perceivedLuma(hexToRgb(as[1]||fg))>160?'#101623':'#F8FAFF'}">Secondary</button>
    </div>
  </div>
  <div class="pane" style="background:${hex(...adjustLuma(t.background, t===theme && modeSel.value==='dark'?0.85:1.15))}; color:${fg}">
    <div class="head">Cards</div>
    <div class="content">
      <div class="pill" style="background:${as[2]||fg}; color:${perceivedLuma(hexToRgb(as[2]||fg))>160?'#101623':'#F8FAFF'}">Badge</div>
      <div class="pill" style="background:${as[3]||fg}; color:${perceivedLuma(hexToRgb(as[3]||fg))>160?'#101623':'#F8FAFF'}">Badge</div>
      <div style="border:1px solid rgba(255,255,255,.15); border-radius:10px; padding:10px">Text sample using ${fg} on ${bg}</div>
    </div>
  </div>`; 
}

// Export functions for different formats
function toPowerBITheme(t){ 
  return JSON.stringify({ 
    name:'Palette Generator Theme', 
    foreground:hex(...t.foreground), 
    background:hex(...t.background), 
    tableAccent:hex(...(t.accents[2]||t.accents[0]||[0,122,204])), 
    dataColors:t.accents.map(a=>hex(...a)) 
  }, null, 2); 
}

function toOfficeTheme(t){ 
  // Generate Office .thmx file content
  // .thmx files are ZIP archives containing XML theme files
  const themeXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="Palette Generator Theme">
  <a:themeElements>
    <a:clrScheme name="Palette Generator Colors">
      <a:dk1><a:srgbClr val="000000"/></a:dk1>
      <a:lt1><a:srgbClr val="FFFFFF"/></a:lt1>
      <a:dk2><a:srgbClr val="${hex(...t.background).replace('#','')}"/></a:dk2>
      <a:lt2><a:srgbClr val="${hex(...adjustLuma(t.background, 1.4)).replace('#','')}"/></a:lt2>
      <a:accent1><a:srgbClr val="${hex(...(t.accents[0] || [0,112,192])).replace('#','')}"/></a:accent1>
      <a:accent2><a:srgbClr val="${hex(...(t.accents[1] || [112,48,160])).replace('#','')}"/></a:accent2>
      <a:accent3><a:srgbClr val="${hex(...(t.accents[2] || [255,192,0])).replace('#','')}"/></a:accent3>
      <a:accent4><a:srgbClr val="${hex(...(t.accents[3] || [255,0,0])).replace('#','')}"/></a:accent4>
      <a:accent5><a:srgbClr val="${hex(...(t.accents[4] || [112,173,71])).replace('#','')}"/></a:accent5>
      <a:accent6><a:srgbClr val="${hex(...(t.accents[5] || [0,176,240])).replace('#','')}"/></a:accent6>
      <a:hlink><a:srgbClr val="${hex(...t.hyperlink).replace('#','')}"/></a:hlink>
      <a:folHlink><a:srgbClr val="${hex(...t.followed).replace('#','')}"/></a:folHlink>
    </a:clrScheme>
    <a:fontScheme name="Palette Generator Fonts">
      <a:majorFont>
        <a:latin typeface="Calibri"/>
        <a:ea typeface=""/>
        <a:cs typeface=""/>
      </a:majorFont>
      <a:minorFont>
        <a:latin typeface="Calibri"/>
        <a:ea typeface=""/>
        <a:cs typeface=""/>
      </a:minorFont>
    </a:fontScheme>
    <a:fmtScheme name="Palette Generator Formats">
      <a:fillStyleLst>
        <a:solidFill>
          <a:schemeClr val="phClr"/>
        </a:solidFill>
        <a:gradFill rotWithShape="1">
          <a:gsLst>
            <a:gs pos="0">
              <a:schemeClr val="phClr">
                <a:tint val="50000"/>
                <a:satMod val="300000"/>
              </a:schemeClr>
            </a:gs>
            <a:gs pos="35000">
              <a:schemeClr val="phClr">
                <a:tint val="37000"/>
                <a:satMod val="300000"/>
              </a:schemeClr>
            </a:gs>
            <a:gs pos="100000">
              <a:schemeClr val="phClr">
                <a:tint val="15000"/>
                <a:satMod val="350000"/>
              </a:schemeClr>
            </a:gs>
          </a:gsLst>
          <a:lin ang="16200000" scaled="1"/>
        </a:gradFill>
        <a:gradFill rotWithShape="1">
          <a:gsLst>
            <a:gs pos="0">
              <a:schemeClr val="phClr">
                <a:shade val="51000"/>
                <a:satMod val="130000"/>
              </a:schemeClr>
            </a:gs>
            <a:gs pos="80000">
              <a:schemeClr val="phClr">
                <a:shade val="93000"/>
                <a:satMod val="130000"/>
              </a:schemeClr>
            </a:gs>
            <a:gs pos="100000">
              <a:schemeClr val="phClr">
                <a:shade val="94000"/>
                <a:satMod val="135000"/>
              </a:schemeClr>
            </a:gs>
          </a:gsLst>
          <a:lin ang="16200000" scaled="0"/>
        </a:gradFill>
      </a:fillStyleLst>
      <a:lnStyleLst>
        <a:ln w="9525" cap="flat" cmpd="sng" algn="ctr">
          <a:solidFill>
            <a:schemeClr val="phClr">
              <a:shade val="95000"/>
              <a:satMod val="105000"/>
            </a:schemeClr>
          </a:solidFill>
          <a:prstDash val="solid"/>
        </a:ln>
        <a:ln w="25400" cap="flat" cmpd="sng" algn="ctr">
          <a:solidFill>
            <a:schemeClr val="phClr"/>
          </a:solidFill>
          <a:prstDash val="solid"/>
        </a:ln>
        <a:ln w="38100" cap="flat" cmpd="sng" algn="ctr">
          <a:solidFill>
            <a:schemeClr val="phClr"/>
          </a:solidFill>
          <a:prstDash val="solid"/>
        </a:ln>
      </a:lnStyleLst>
      <a:effectStyleLst>
        <a:effectStyle>
          <a:effectLst>
            <a:outerShdw blurRad="40000" dist="20000" dir="5400000" rotWithShape="0">
              <a:srgbClr val="000000">
                <a:alpha val="38000"/>
              </a:srgbClr>
            </a:outerShdw>
          </a:effectLst>
        </a:effectStyle>
        <a:effectStyle>
          <a:effectLst>
            <a:outerShdw blurRad="40000" dist="23000" dir="5400000" rotWithShape="0">
              <a:srgbClr val="000000">
                <a:alpha val="35000"/>
              </a:srgbClr>
            </a:outerShdw>
          </a:effectLst>
        </a:effectStyle>
        <a:effectStyle>
          <a:effectLst>
            <a:outerShdw blurRad="40000" dist="23000" dir="5400000" rotWithShape="0">
              <a:srgbClr val="000000">
                <a:alpha val="35000"/>
              </a:srgbClr>
            </a:outerShdw>
            <a:prstTransf>
              <a:xfrm>
                <a:off x="0" y="0"/>
                <a:ext cx="0" cy="0"/>
              </a:xfrm>
            </a:prstTransf>
          </a:effectLst>
        </a:effectStyle>
      </a:effectStyleLst>
      <a:bgFillStyleLst>
        <a:solidFill>
          <a:schemeClr val="phClr"/>
        </a:solidFill>
        <a:gradFill rotWithShape="1">
          <a:gsLst>
            <a:gs pos="0">
              <a:schemeClr val="phClr">
                <a:tint val="40000"/>
                <a:satMod val="350000"/>
              </a:schemeClr>
            </a:gs>
            <a:gs pos="40000">
              <a:schemeClr val="phClr">
                <a:tint val="45000"/>
                <a:satMod val="350000"/>
                <a:shade val="99000"/>
              </a:schemeClr>
            </a:gs>
            <a:gs pos="100000">
              <a:schemeClr val="phClr">
                <a:shade val="20000"/>
                <a:satMod val="255000"/>
              </a:schemeClr>
            </a:gs>
          </a:gsLst>
          <a:path path="circle">
            <a:fillToRect l="50000" t="-80000" r="50000" b="180000"/>
          </a:path>
        </a:gradFill>
        <a:gradFill rotWithShape="1">
          <a:gsLst>
            <a:gs pos="0">
              <a:schemeClr val="phClr">
                <a:tint val="80000"/>
                <a:satMod val="300000"/>
              </a:schemeClr>
            </a:gs>
            <a:gs pos="100000">
              <a:schemeClr val="phClr">
                <a:shade val="30000"/>
                <a:satMod val="200000"/>
              </a:schemeClr>
            </a:gs>
          </a:gsLst>
          <a:path path="circle">
            <a:fillToRect l="50000" t="50000" r="50000" b="50000"/>
          </a:path>
        </a:gradFill>
      </a:bgFillStyleLst>
    </a:fmtScheme>
  </a:themeElements>
  <a:objectDefaults/>
  <a:extraClrSchemeLst/>
</a:theme>`;
  
  return themeXml;
}

function toCSS(t){ 
  const vars=[ 
    ['background',hex(...t.background)], 
    ['foreground',hex(...t.foreground)], 
    ...t.accents.map((a,i)=>['accent'+(i+1), hex(...a)]), 
    ['hyperlink',hex(...t.hyperlink)], 
    ['followed',hex(...t.followed)] 
  ]; 
  return `:root{\n${vars.map(([k,v])=>`  --${k}: ${v};`).join('\n')}\n}`; 
}

function toTailwindConfig(t) {
  const colors = {
    background: hex(...t.background),
    foreground: hex(...t.foreground),
    ...t.accents.reduce((acc, color, i) => {
      acc[`accent${i + 1}`] = hex(...color);
      return acc;
    }, {}),
    hyperlink: hex(...t.hyperlink),
    followed: hex(...t.followed)
  };
  
  return `module.exports = {
  theme: {
    extend: {
      colors: ${JSON.stringify(colors, null, 6)}
    }
  }
}`;
}

function toFigmaTokens(t) {
  const tokens = {
    "Palette Generator": {
      "background": {
        "value": hex(...t.background),
        "type": "color"
      },
      "foreground": {
        "value": hex(...t.foreground),
        "type": "color"
      },
      ...t.accents.reduce((acc, color, i) => {
        acc[`accent${i + 1}`] = {
          "value": hex(...color),
          "type": "color"
        };
        return acc;
      }, {}),
      "hyperlink": {
        "value": hex(...t.hyperlink),
        "type": "color"
      },
      "followed": {
        "value": hex(...t.followed),
        "type": "color"
      }
    }
  };
  
  return JSON.stringify(tokens, null, 2);
}

function toSketchColors(t) {
  // Sketch color palette format
  const colors = [
    { name: 'Background', color: hex(...t.background) },
    { name: 'Foreground', color: hex(...t.foreground) },
    ...t.accents.map((color, i) => ({ 
      name: `Accent ${i + 1}`, 
      color: hex(...color) 
    })),
    { name: 'Hyperlink', color: hex(...t.hyperlink) },
    { name: 'Followed Link', color: hex(...t.followed) }
  ];
  
  return JSON.stringify(colors, null, 2);
}

function enableExports(on){ 
  downloadPBIBtn.disabled = !on; 
  downloadOfficeBtn.disabled = !on; 
  downloadCSSBtn.disabled = !on; 
  downloadTailwindBtn.disabled = !on;
  downloadFigmaBtn.disabled = !on;
  downloadSketchBtn.disabled = !on;
}

function recalcTheme(){ 
  theme = deriveTheme(); 
  renderRoles(theme); 
  renderPreview(theme); 
  enableExports(!!theme); 
}

modeSel.addEventListener('change', recalcTheme); 
bgStrengthSel.addEventListener('change', recalcTheme);

function download(filename, text){ 
  const a=document.createElement('a'); 
  a.setAttribute('href','data:text/plain;charset=utf-8,'+encodeURIComponent(text)); 
  a.setAttribute('download', filename); 
  a.click(); 
}

downloadPBIBtn.addEventListener('click', ()=> theme && download('palette-powerbi.json', toPowerBITheme(theme)) );
downloadOfficeBtn.addEventListener('click', ()=> theme && download('office-theme.thmx', toOfficeTheme(theme)) );
downloadCSSBtn.addEventListener('click', ()=> theme && download('palette.css', toCSS(theme)) );
downloadTailwindBtn.addEventListener('click', ()=> theme && download('tailwind-colors.js', toTailwindConfig(theme)) );
downloadFigmaBtn.addEventListener('click', ()=> theme && download('figma-tokens.json', toFigmaTokens(theme)) );
downloadSketchBtn.addEventListener('click', ()=> theme && download('sketch-colors.json', toSketchColors(theme)) );

dlBothBtn.addEventListener('click', ()=>{
  if(!currentPalette.length){ 
    showToast('No palette','Upload and extract a palette first.','warn'); 
    return; 
  }
  const prevMode=modeSel.value; 
  const variants=['light','dark'];
  for(const m of variants){ 
    modeSel.value=m; 
    recalcTheme(); 
    download(`palette-${m}-powerbi.json`, toPowerBITheme(theme)); 
    download(`palette-${m}-office.thmx`, toOfficeTheme(theme)); 
  }
  modeSel.value=prevMode; 
  recalcTheme();
});

// ---------- Controls ----------
$('#extractBtn').addEventListener('click', async ()=>{ 
  const k=parseInt($('#k').value,10); 
  const style=$('#style').value; 
  const pal=await extractPalette(k, style, selectedAlgorithm); 
  renderSwatches(pal); 
  recalcTheme(); 
});

window.addEventListener('paste', e=>{ 
  if(!e.clipboardData) return; 
  for(const item of e.clipboardData.items){ 
    if(item.type.startsWith('image/')){ 
      const f=item.getAsFile(); 
      if(f) handleFile(f); 
    } 
  } 
});

// ---------- Self-tests ----------
function approxEq(a,b,eps){ 
  return Math.abs(a-b)<=eps; 
}

function logCase(name, ok, info=''){ 
  const el=document.createElement('div'); 
  el.className='case'; 
  el.innerHTML=`<span>${name}</span><span class="${ok?'pass':'fail'}">${ok?'✓ pass':'✗ fail'}</span>`; 
  $('#testResults').appendChild(el); 
  if(!ok && info) $('#testResults').appendChild(Object.assign(document.createElement('div'),{className:'small mono',textContent:info})); 
  return ok; 
}

function runTests(){ 
  $('#testResults').innerHTML=''; 
  let all=true; 
  try{
    for(let i=0;i<5;i++){ 
      const r=~~(Math.random()*256), g=~~(Math.random()*256), b=~~(Math.random()*256); 
      const hsl=rgbToHsl(r,g,b); 
      const rgb=hslToRgb(...hsl); 
      const ok=approxEq(r,rgb[0],2)&&approxEq(g,rgb[1],2)&&approxEq(b,rgb[2],2); 
      all = logCase(`RGB↔HSL round‑trip #${i+1}`, ok) && all; 
    }
    const hx='#3FA7D6'; 
    const rb=hexToRgb(hx); 
    all = logCase('HEX→RGB', rb.join(',')==='63,167,214') && all;
    const dark=[10,10,10], light=[240,240,240]; 
    all = logCase('Perceived luma order', perceivedLuma(light)>perceivedLuma(dark)) && all;
    // Harmony tests
    const base=[200,100,50]; 
    const comp=makeHarmony(base,'complementary'); 
    all = logCase('Complementary size=2', comp.length===2) && all; 
    const tri=makeHarmony(base,'triadic'); 
    all = logCase('Triadic size=3', tri.length===3) && all; 
    const tet=makeHarmony(base,'tetradic'); 
    all = logCase('Tetradic size=4', tet.length===4) && all;
    // Sample image and export tests (async)
    const url=makeSampleDataURL(); 
    img.src=url; 
    imgWrap.style.display='block'; 
    setTimeout(async ()=>{ 
      const pal=await extractPalette(6,'balanced'); 
      const hasRed=pal.some(rgb=> Math.hypot(rgb[0]-240,rgb[1]-68,rgb[2]-68)<25); 
      logCase('Palette includes red block', hasRed); 
      const t=deriveTheme(); 
      const pbi = JSON.parse(toPowerBITheme(t)); 
      logCase('Power BI JSON parse', !!pbi && Array.isArray(pbi.dataColors)); 
      const xml=toOfficeColorXML(t); 
      logCase('Office XML contains accents', /accent1|accent6/.test(xml)); 
      if(all) showToast('Tests finished','Some tests async; see results above.','ok'); 
      else showToast('Tests finished with failures','Review details above.','warn'); 
    }, 40);
  } catch(err){ 
    showToast('Tests crashed', err.message||String(err), 'err'); 
  } 
}

$('#runTests').addEventListener('click', runTests);
