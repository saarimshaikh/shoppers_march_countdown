// Countdown target: 2026-03-31 23:59 IST (UTC+05:30)
const TARGET_ISO = '2026-03-31T23:59:00+05:30';
const targetDate = new Date(TARGET_ISO);

const el = id => document.getElementById(id);

// Storage keys
const KEY_ORIGINAL = 'sc_original_target';
const KEY_ACCUMULATED = 'sc_accumulated';

function formatNumber(n){
  return String(n).padStart(2,'0');
}

function updateCountdown(){
  const now = new Date();
  let diff = targetDate - now;
  const statusEl = el('status');
  if (diff <= 0){
    el('days').textContent = '00';
    el('hours').textContent = '00';
    el('minutes').textContent = '00';
    el('seconds').textContent = '00';
    statusEl.textContent = 'Deadline reached';
    calculateStats();
    return;
  }

  const days = Math.floor(diff / (1000*60*60*24));
  diff -= days * (1000*60*60*24);
  const hours = Math.floor(diff / (1000*60*60));
  diff -= hours * (1000*60*60);
  const minutes = Math.floor(diff / (1000*60));
  diff -= minutes * (1000*60);
  const seconds = Math.floor(diff / 1000);

  el('days').textContent = formatNumber(days);
  el('hours').textContent = formatNumber(hours);
  el('minutes').textContent = formatNumber(minutes);
  el('seconds').textContent = formatNumber(seconds);
  statusEl.textContent = `Time left (${Intl.DateTimeFormat('en-IN',{timeZone:'Asia/Kolkata'}).resolvedOptions().timeZone})`;

  // little pulse animation whenever seconds change
  animatePulse('seconds');
  calculateStats();
}

function animatePulse(id){
  const s = el(id);
  s.classList.add('pulse');
  setTimeout(()=>s.classList.remove('pulse'),160);
}

function daysRemaining(){
  const now = new Date();
  const ms = targetDate - now;
  if (ms <= 0) return 0;
  return Math.ceil(ms / (1000*60*60*24));
}

function getOriginal(){
  const v = parseFloat(localStorage.getItem(KEY_ORIGINAL));
  return Number.isFinite(v) ? v : null;
}

function getAccumulated(){
  const v = parseFloat(localStorage.getItem(KEY_ACCUMULATED));
  return Number.isFinite(v) ? v : 0;
}

function saveOriginal(v){
  if (v == null || isNaN(v) || v < 0) return;
  localStorage.setItem(KEY_ORIGINAL, String(v));
}

function saveAccumulated(v){
  localStorage.setItem(KEY_ACCUMULATED, String(v));
}

function calculateStats(){
  const original = getOriginal();
  const accumulated = getAccumulated();
  const remDays = daysRemaining();

  el('accumulated').textContent = accumulated;
  el('remainingDays').textContent = remDays;

  if (original == null){
    el('remainingAmount').textContent = '--';
    el('dailyTarget').textContent = '--';
    return;
  }

  const remainingAmount = Math.max(0, original - accumulated);
  el('remainingAmount').textContent = remainingAmount;

  let daily = 0;
  if (remainingAmount <= 0){
    daily = 0;
  } else if (remDays <= 0){
    daily = remainingAmount; // last day
  } else {
    daily = Math.ceil(remainingAmount / remDays);
  }

  el('dailyTarget').textContent = daily;
}

function init(){
  // wire up buttons
  el('saveTarget').addEventListener('click', ()=>{
    const val = parseFloat(el('originalTarget').value);
    if (isNaN(val) || val < 0){
      alert('Please enter a valid non-negative number for original target');
      return;
    }
    saveOriginal(val);
    calculateStats();
  });

  el('addAchieved').addEventListener('click', ()=>{
    const v = parseFloat(el('todayAchieved').value);
    if (isNaN(v) || v <= 0){
      alert('Enter a positive number for achieved today');
      return;
    }
    const accumulated = getAccumulated() + v;
    saveAccumulated(accumulated);
    el('todayAchieved').value = '';
    calculateStats();
  });

  el('resetAll').addEventListener('click', ()=>{
    if (!confirm('Clear saved target and accumulated data?')) return;
    localStorage.removeItem(KEY_ORIGINAL);
    localStorage.removeItem(KEY_ACCUMULATED);
    el('originalTarget').value = '';
    calculateStats();
  });

  // init display values
  el('originalTarget').value = getOriginal() ?? '';
  calculateStats();

  // run countdown every second
  updateCountdown();
  setInterval(updateCountdown, 1000);
}

document.addEventListener('DOMContentLoaded', init);
