// ==========================================
// HOSTEL MANAGEMENT SYSTEM - CORE SCRIPT
// ==========================================

const DATA_VERSION = 'v2.0';
// Asset loading uses versioned CSS/JS URLs in HTML files.

// ===== THEME MANAGEMENT =====
function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeToggleIcon(savedTheme);
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  updateThemeToggleIcon(newTheme);
}

function updateThemeToggleIcon(theme) {
  const btn = document.getElementById('themeToggleBtn');
  if (btn) {
    btn.innerHTML = theme === 'dark' 
      ? '<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="18" height="18"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>'
      : '<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="18" height="18"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>';
  }
}

function initPwa() {
  if (!('serviceWorker' in navigator)) return;
  if (window.location.protocol !== 'http:' && window.location.protocol !== 'https:') return;
  navigator.serviceWorker.register('sw.js').catch(() => {
    // PWA support is optional; ignore registration failures.
  });
}

// Initialize theme on page load
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initPwa();
});

// ===== DATA STORE =====
const HMS = {
  KEYS: { users:'hms_users', rooms:'hms_rooms', bookings:'hms_bookings', payments:'hms_payments', requests:'hms_requests', visitors:'hms_visitors', attendance:'hms_attendance', notices:'hms_notices', outpasses:'hms_outpasses' },

  defaults: {
    users: [
      // Staff
      { id:'u1', username:'admin', role:'admin', name:'Rajesh Kumar', email:'admin@hostelpro.com', phone:'9876543210' },
      { id:'u3', username:'reception', role:'receptionist', name:'Priya Patel', email:'priya@hostelpro.com', phone:'9876543213' },
      // Students
      { id:'u2',  username:'student123', role:'student', name:'Arjun Sharma',   email:'arjun@student.com',   phone:'9811001001', studentId:'STU001', roomId:'r1', bloodGroup:'O+',  emergencyContact:'9811001002', course:'B.Tech CSE',  year:'2nd Year', fatherName:'Ramesh Sharma',  address:'12 Rajouri Garden, Delhi' },
      { id:'u4',  username:'rahul456',   role:'student', name:'Rahul Verma',    email:'rahul@student.com',   phone:'9811002001', studentId:'STU002', roomId:'r2', bloodGroup:'A+',  emergencyContact:'9811002002', course:'B.Tech ECE',  year:'3rd Year', fatherName:'Suresh Verma',   address:'45 Andheri West, Mumbai' },
      { id:'u5',  username:'sneha789',   role:'student', name:'Sneha Singh',    email:'sneha@student.com',   phone:'9811003001', studentId:'STU003', roomId:'r3', bloodGroup:'B+',  emergencyContact:'9811003002', course:'MCA',         year:'1st Year', fatherName:'Deepak Singh',   address:'78 Whitefield, Bangalore' },
      { id:'u6',  username:'priya.k',    role:'student', name:'Priya Kapoor',   email:'priya.k@student.com', phone:'9811004001', studentId:'STU004', roomId:'r2', bloodGroup:'AB+', emergencyContact:'9811004002', course:'B.Sc IT',     year:'2nd Year', fatherName:'Rakesh Kapoor',  address:'22 Salt Lake, Kolkata' },
      { id:'u7',  username:'ankit.y',    role:'student', name:'Ankit Yadav',    email:'ankit.y@student.com', phone:'9811005001', studentId:'STU005', roomId:'r3', bloodGroup:'O-',  emergencyContact:'9811005002', course:'B.Tech ME',   year:'4th Year', fatherName:'Ramkesh Yadav',  address:'33 Civil Lines, Allahabad' },
      { id:'u8',  username:'kavya.r',    role:'student', name:'Kavya Reddy',    email:'kavya.r@student.com', phone:'9811006001', studentId:'STU006', roomId:'r3', bloodGroup:'B-',  emergencyContact:'9811006002', course:'MBA',         year:'1st Year', fatherName:'Venkat Reddy',   address:'56 Banjara Hills, Hyderabad' },
      { id:'u9',  username:'rohit.m',    role:'student', name:'Rohit Mehta',    email:'rohit.m@student.com', phone:'9811007001', studentId:'STU007', roomId:'r4', bloodGroup:'A-',  emergencyContact:'9811007002', course:'B.Tech Civil',year:'3rd Year', fatherName:'Anil Mehta',     address:'67 Navrangpura, Ahmedabad' },
      { id:'u10', username:'pooja.g',    role:'student', name:'Pooja Gupta',    email:'pooja.g@student.com', phone:'9811008001', studentId:'STU008', roomId:'r4', bloodGroup:'AB-', emergencyContact:'9811008002', course:'BCA',         year:'2nd Year', fatherName:'Sanjay Gupta',   address:'89 Hazratganj, Lucknow' },
      { id:'u11', username:'sanjay.j',   role:'student', name:'Sanjay Joshi',   email:'sanjay.j@student.com',phone:'9811009001', studentId:'STU009', roomId:'r5', bloodGroup:'O+',  emergencyContact:'9811009002', course:'M.Tech CSE',  year:'1st Year', fatherName:'Mohan Joshi',    address:'101 Koregaon Park, Pune' },
      { id:'u12', username:'meera.k',    role:'student', name:'Meera Krishnan', email:'meera.k@student.com', phone:'9811010001', studentId:'STU010', roomId:'r6', bloodGroup:'B+',  emergencyContact:'9811010002', course:'BBA',         year:'3rd Year', fatherName:'Krishnan Pillai',address:'14 T Nagar, Chennai' },
      { id:'u13', username:'aditya.p',   role:'student', name:'Aditya Patil',   email:'aditya.p@student.com',phone:'9811011001', studentId:'STU011', roomId:'r6', bloodGroup:'A+',  emergencyContact:'9811011002', course:'B.Tech CSE',  year:'2nd Year', fatherName:'Ramesh Patil',   address:'55 FC Road, Pune' },
    ],
    rooms: [
      { id:'r1', number:'A-101', floor:'Ground Floor', type:'Single', beds:1, occupied:1, bathrooms:'Shared',   rent:5000, status:'occupied',  amenities:['AC','WiFi','Study Table','Wardrobe'] },
      { id:'r2', number:'A-102', floor:'Ground Floor', type:'Double', beds:2, occupied:2, bathrooms:'Shared',   rent:4000, status:'occupied',  amenities:['Fan','WiFi','Study Table'] },
      { id:'r3', number:'B-201', floor:'2nd Floor',   type:'Triple', beds:3, occupied:3, bathrooms:'Attached',  rent:3500, status:'occupied',  amenities:['AC','WiFi','Attached Bath','Balcony'] },
      { id:'r4', number:'B-202', floor:'2nd Floor',   type:'Double', beds:2, occupied:2, bathrooms:'Shared',   rent:4000, status:'occupied',  amenities:['Fan','WiFi'] },
      { id:'r5', number:'C-301', floor:'3rd Floor',   type:'Single', beds:1, occupied:1, bathrooms:'Attached',  rent:6000, status:'occupied',  amenities:['AC','WiFi','Attached Bath','TV'] },
      { id:'r6', number:'C-302', floor:'3rd Floor',   type:'Triple', beds:3, occupied:2, bathrooms:'Attached',  rent:3500, status:'partial',   amenities:['Fan','WiFi','Attached Bath'] },
      { id:'r7', number:'D-401', floor:'4th Floor',   type:'Double', beds:2, occupied:0, bathrooms:'Attached',  rent:4500, status:'available', amenities:['AC','WiFi','Attached Bath','Study Table'] },
      { id:'r8', number:'D-402', floor:'4th Floor',   type:'Single', beds:1, occupied:0, bathrooms:'Attached',  rent:6500, status:'available', amenities:['AC','WiFi','Attached Bath','TV','Mini Fridge'] },
    ],
    bookings: [
      { id:'b1',  studentId:'u2',  roomId:'r1', checkIn:'2024-07-01', checkOut:'2025-06-30', amount:5000, status:'active' },
      { id:'b2',  studentId:'u4',  roomId:'r2', checkIn:'2024-08-01', checkOut:'2025-05-31', amount:4000, status:'active' },
      { id:'b3',  studentId:'u5',  roomId:'r3', checkIn:'2024-09-01', checkOut:'2025-08-31', amount:3500, status:'active' },
      { id:'b5',  studentId:'u6',  roomId:'r2', checkIn:'2024-08-01', checkOut:'2025-07-31', amount:4000, status:'active' },
      { id:'b6',  studentId:'u7',  roomId:'r3', checkIn:'2024-07-15', checkOut:'2025-07-14', amount:3500, status:'active' },
      { id:'b7',  studentId:'u8',  roomId:'r3', checkIn:'2024-10-01', checkOut:'2025-09-30', amount:3500, status:'active' },
      { id:'b8',  studentId:'u9',  roomId:'r4', checkIn:'2024-09-01', checkOut:'2025-08-31', amount:4000, status:'active' },
      { id:'b9',  studentId:'u10', roomId:'r4', checkIn:'2024-11-01', checkOut:'2025-10-31', amount:4000, status:'active' },
      { id:'b10', studentId:'u11', roomId:'r5', checkIn:'2025-01-01', checkOut:'2025-12-31', amount:6000, status:'active' },
      { id:'b11', studentId:'u12', roomId:'r6', checkIn:'2024-08-01', checkOut:'2025-07-31', amount:3500, status:'active' },
      { id:'b12', studentId:'u13', roomId:'r6', checkIn:'2024-09-01', checkOut:'2025-08-31', amount:3500, status:'active' },
      { id:'b4',  studentId:'u2',  roomId:'r1', checkIn:'2023-07-01', checkOut:'2024-06-30', amount:4500, status:'completed' },
    ],
    payments: [
      // Arjun Sharma (STU001)
      { id:'p1',  bookingId:'b1',  studentId:'u2',  amount:5000, method:'UPI',         date:'2025-04-01', status:'paid',    type:'Monthly Rent', txnId:'TXN2504010001' },
      { id:'p2',  bookingId:'b1',  studentId:'u2',  amount:5000, method:'Net Banking', date:'2025-03-01', status:'paid',    type:'Monthly Rent', txnId:'TXN2503010002' },
      { id:'p3',  bookingId:'b1',  studentId:'u2',  amount:5000, method:'UPI',         date:'2025-02-01', status:'paid',    type:'Monthly Rent', txnId:'TXN2502010003' },
      { id:'p6',  bookingId:'b1',  studentId:'u2',  amount:5000, method:'',            date:'2025-05-01', status:'pending', type:'Monthly Rent', txnId:'' },
      // Rahul Verma (STU002)
      { id:'p4',  bookingId:'b2',  studentId:'u4',  amount:4000, method:'Debit Card',  date:'2025-04-01', status:'paid',    type:'Monthly Rent', txnId:'TXN2504010004' },
      { id:'p7',  bookingId:'b2',  studentId:'u4',  amount:4000, method:'UPI',         date:'2025-03-01', status:'paid',    type:'Monthly Rent', txnId:'TXN2503010007' },
      { id:'p17', bookingId:'b2',  studentId:'u4',  amount:4000, method:'',            date:'2025-05-01', status:'pending', type:'Monthly Rent', txnId:'' },
      // Sneha Singh (STU003)
      { id:'p5',  bookingId:'b3',  studentId:'u5',  amount:3500, method:'UPI',         date:'2025-04-01', status:'paid',    type:'Monthly Rent', txnId:'TXN2504010005' },
      { id:'p8',  bookingId:'b3',  studentId:'u5',  amount:3500, method:'Net Banking', date:'2025-03-01', status:'paid',    type:'Monthly Rent', txnId:'TXN2503010008' },
      // Priya Kapoor (STU004)
      { id:'p9',  bookingId:'b5',  studentId:'u6',  amount:4000, method:'UPI',         date:'2025-04-01', status:'paid',    type:'Monthly Rent', txnId:'TXN2504010009' },
      { id:'p18', bookingId:'b5',  studentId:'u6',  amount:4000, method:'',            date:'2025-05-01', status:'pending', type:'Monthly Rent', txnId:'' },
      // Ankit Yadav (STU005)
      { id:'p10', bookingId:'b6',  studentId:'u7',  amount:3500, method:'Credit Card', date:'2025-04-01', status:'paid',    type:'Monthly Rent', txnId:'TXN2504010010' },
      // Kavya Reddy (STU006)
      { id:'p11', bookingId:'b7',  studentId:'u8',  amount:3500, method:'UPI',         date:'2025-04-01', status:'paid',    type:'Monthly Rent', txnId:'TXN2504010011' },
      { id:'p19', bookingId:'b7',  studentId:'u8',  amount:3500, method:'',            date:'2025-05-01', status:'pending', type:'Monthly Rent', txnId:'' },
      // Rohit Mehta (STU007)
      { id:'p12', bookingId:'b8',  studentId:'u9',  amount:4000, method:'Net Banking', date:'2025-04-01', status:'paid',    type:'Monthly Rent', txnId:'TXN2504010012' },
      // Pooja Gupta (STU008)
      { id:'p13', bookingId:'b9',  studentId:'u10', amount:4000, method:'UPI',         date:'2025-04-01', status:'paid',    type:'Monthly Rent', txnId:'TXN2504010013' },
      { id:'p20', bookingId:'b9',  studentId:'u10', amount:4000, method:'',            date:'2025-05-01', status:'pending', type:'Monthly Rent', txnId:'' },
      // Sanjay Joshi (STU009)
      { id:'p14', bookingId:'b10', studentId:'u11', amount:6000, method:'Debit Card',  date:'2025-04-01', status:'paid',    type:'Monthly Rent', txnId:'TXN2504010014' },
      // Meera Krishnan (STU010)
      { id:'p15', bookingId:'b11', studentId:'u12', amount:3500, method:'UPI',         date:'2025-04-01', status:'paid',    type:'Monthly Rent', txnId:'TXN2504010015' },
      // Aditya Patil (STU011)
      { id:'p16', bookingId:'b12', studentId:'u13', amount:3500, method:'UPI',         date:'2025-04-01', status:'paid',    type:'Monthly Rent', txnId:'TXN2504010016' },
      { id:'p21', bookingId:'b12', studentId:'u13', amount:3500, method:'',            date:'2025-05-01', status:'pending', type:'Monthly Rent', txnId:'' },
    ],
    requests: [
      { id:'req1', studentId:'u2', type:'Maintenance', description:'Light bulb not working in room', date:'2025-04-08', status:'pending', response:'' },
      { id:'req2', studentId:'u4', type:'Room Change', description:'Requesting room change to 3rd floor for better study environment', date:'2025-04-05', status:'approved', response:'Request approved. Room change will be processed next month.' },
      { id:'req3', studentId:'u5', type:'Complaint', description:'Noise issue from neighboring room after 11 PM', date:'2025-04-07', status:'resolved', response:'Issue has been addressed. Students counseled.' },
      { id:'req4', studentId:'u2', type:'Other', description:'Need extra blanket and pillow', date:'2025-04-09', status:'pending', response:'' },
    ],
    visitors: [
      { id:'v1', name:'Meena Sharma', studentId:'u2', phone:'9876543220', checkIn:'2025-04-10 10:30', checkOut:null, status:'active', purpose:'Family Visit' },
      { id:'v2', name:'Ramesh Verma', studentId:'u4', phone:'9876543221', checkIn:'2025-04-10 09:15', checkOut:'2025-04-10 11:00', status:'checked-out', purpose:'Family Visit' },
      { id:'v3', name:'Anita Singh', studentId:'u5', phone:'9876543222', checkIn:'2025-04-09 14:00', checkOut:'2025-04-09 16:30', status:'checked-out', purpose:'Friend' },
    ],
    attendance: [
      { id:'at1', studentId:'u2', date:'2025-04-10', status:'present', checkIn:'21:30', checkOut:null },
      { id:'at2', studentId:'u4', date:'2025-04-10', status:'present', checkIn:'20:45', checkOut:null },
      { id:'at3', studentId:'u5', date:'2025-04-10', status:'out-pass', checkIn:null, checkOut:'09:00' },
    ],
    notices: [
      { id:'n1', title:'Monthly Fee Due – May 2025', body:'Monthly hostel fee for May 2025 is due by 10th May. Please pay on time to avoid ₹500 late fee charges.', date:'2025-04-01', type:'warning', author:'Admin' },
      { id:'n2', title:'Water Supply Interruption', body:'Water supply will be interrupted on April 12th from 10 AM to 2 PM for annual pipe maintenance.', date:'2025-04-08', type:'info', author:'Admin' },
      { id:'n3', title:'Annual Sports Day – April 20', body:'Annual hostel sports day will be held on April 20th. Events: cricket, badminton, chess. Register by April 18th.', date:'2025-04-05', type:'success', author:'Admin' },
      { id:'n4', title:'Hostel Gate Closing Time Updated', body:'Effective immediately, hostel gate will close at 10:00 PM on weekdays and 11:00 PM on weekends.', date:'2025-04-03', type:'danger', author:'Admin' },
    ]
  },

  init() {
    Object.keys(this.KEYS).forEach(k => {
      if (!localStorage.getItem(this.KEYS[k]) && this.defaults[k]) {
        localStorage.setItem(this.KEYS[k], JSON.stringify(this.defaults[k]));
      }
    });
  },

  async syncFromDB() {
    try {
      const res = await fetch('api/sync.php', { credentials: 'same-origin' });
      if (!res.ok) return false;
      const result = await res.json();
      if (result.success && result.data) {
        // Always overwrite localStorage with DB data (even empty arrays)
        Object.entries(result.data).forEach(([k, v]) => {
          localStorage.setItem(this.KEYS[k], JSON.stringify(sanitizePayloadDeep(v ?? [])));
        });
        return true;
      }
    } catch (e) { /* offline – keep localStorage */ }
    return false;
  },

  async refreshSessionState() {
    try {
      // Timestamp query param busts any service-worker or browser cache so we
      // always receive the current PHP session's CSRF token, not a stale copy.
      const res = await fetch(`api/session.php?_=${Date.now()}`, { credentials: 'same-origin' });
      if (!res.ok) return false;
      const data = await res.json().catch(() => ({}));
      if (!data.success || !data.user) return false;
      this.setSession({ userId: data.user.id, role: data.user.role, name: data.user.name });
      if (data.csrfToken) this.setCsrfToken(data.csrfToken);
      return true;
    } catch (e) {
      return false;
    }
  },

  async persist(table, action, data) {
    try {
      if (!this.getCsrfToken()) {
        await this.refreshSessionState();
      }

      const send = async () => fetch('api/data.php', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': this.getCsrfToken() || '',
        },
        body: JSON.stringify({ table, action, data }),
      });

      let res = await send();

      if (!res.ok && res.status === 403) {
        const firstResult = await res.json().catch(() => ({}));
        if ((firstResult.error || '').toLowerCase().includes('csrf')) {
          const refreshed = await this.refreshSessionState();
          if (!refreshed) {
            notify('Session expired. Please login again.', 'error');
            return;
          }
          res = await send();
        } else {
          notify(firstResult.error || 'Server rejected this change', 'error');
          return;
        }
      }

      if (!res.ok) {
        const result = await res.json().catch(() => ({}));
        notify(result.error || 'Server rejected this change', 'error');
      }
    } catch (e) { /* offline – already saved to localStorage */ }
  },

  get(key) { return JSON.parse(localStorage.getItem(this.KEYS[key]) || '[]'); },
  set(key, data) { localStorage.setItem(this.KEYS[key], JSON.stringify(data)); },
  add(key, item) {
    const d = this.get(key);
    const persistItem = sanitizePayloadDeep(item);
    const safeLocalItem = stripSensitiveFieldsDeep(persistItem);
    d.push(safeLocalItem);
    this.set(key, d);
    this.persist(key, 'add', persistItem);
    return safeLocalItem;
  },
  update(key, id, updates) {
    const d = this.get(key);
    const i = d.findIndex(x => x.id === id);
    if (i !== -1) {
      const persistUpdates = sanitizePayloadDeep(updates);
      const safeLocalUpdates = stripSensitiveFieldsDeep(persistUpdates);
      d[i] = { ...d[i], ...safeLocalUpdates };
      this.set(key, d);
      this.persist(key, 'update', { id, ...persistUpdates });
      return d[i];
    }
    return null;
  },
  remove(key, id) { this.set(key, this.get(key).filter(x => x.id !== id)); this.persist(key, 'remove', { id }); },
  findById(key, id) { return this.get(key).find(x => x.id === id); },
  where(key, fn) { return this.get(key).filter(fn); },
  genId() { return '_' + Math.random().toString(36).slice(2, 11); },
  // Generates sequential payment IDs (p1, p2, p3...) instead of random strings,
  // keeping payment IDs consistent with seeded data and readable in the UI.
  genPaymentId() {
    const payments = this.get('payments');
    const max = payments.reduce((m, p) => {
      const n = parseInt((p.id || '').replace(/^p/, ''));
      return (!isNaN(n) && n > m) ? n : m;
    }, 0);
    return 'p' + (max + 1);
  },

  getSession() {
    const sessionRaw = sessionStorage.getItem('hms_session') || localStorage.getItem('hms_session') || 'null';
    const parsed = JSON.parse(sessionRaw);
    if (parsed && !sessionStorage.getItem('hms_session')) {
      sessionStorage.setItem('hms_session', JSON.stringify(parsed));
    }
    return parsed;
  },
  setSession(data) {
    const raw = JSON.stringify(data);
    sessionStorage.setItem('hms_session', raw);
    localStorage.setItem('hms_session', raw);
  },
  getCsrfToken() {
    const token = sessionStorage.getItem('hms_csrf') || localStorage.getItem('hms_csrf') || '';
    if (token && !sessionStorage.getItem('hms_csrf')) {
      sessionStorage.setItem('hms_csrf', token);
    }
    return token;
  },
  setCsrfToken(token) {
    const value = token || '';
    sessionStorage.setItem('hms_csrf', value);
    localStorage.setItem('hms_csrf', value);
  },
  clearSession() {
    sessionStorage.removeItem('hms_session');
    sessionStorage.removeItem('hms_csrf');
    localStorage.removeItem('hms_session');
    localStorage.removeItem('hms_csrf');
  },
};

// ===== AUTH =====
let loginInFlight = false;
let pendingTwoFactorChallenge = null;
let adminRecoveryCodes = [];
let adminTwofaState = { enabled: false, recoveryRemaining: 0, recoveryLastGeneratedAt: null };
let qrLibraryLoadPromise = null;

function ensureQrLibraryLoaded() {
  if (typeof QRCode !== 'undefined') {
    return Promise.resolve(true);
  }
  if (qrLibraryLoadPromise) {
    return qrLibraryLoadPromise;
  }

  qrLibraryLoadPromise = new Promise((resolve) => {
    const existing = document.querySelector('script[data-qr-lib="local"]');
    if (existing) {
      existing.addEventListener('load', () => resolve(typeof QRCode !== 'undefined'), { once: true });
      existing.addEventListener('error', () => resolve(false), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = `assets/vendor/qrcode.min.js?v=${Date.now()}`;
    script.dataset.qrLib = 'local';
    script.onload = () => resolve(typeof QRCode !== 'undefined');
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });

  return qrLibraryLoadPromise;
}

function redirectAfterLogin(user) {
  const routes = { admin:'owner-dashboard.html', student:'student-dashboard.html', receptionist:'receptionist-dashboard.html' };
  HMS.setSession({ userId: user.id, role: user.role, name: user.name });
  window.location.href = routes[user.role] || 'login.html';
}

function setLoginMode(isTwoFactorStep) {
  const usernameEl = document.getElementById('username');
  const passwordEl = document.getElementById('password');
  const roleEl = document.getElementById('role');
  const roleTrigger = document.getElementById('roleTrigger');
  const otpGroup = document.getElementById('otpGroup');
  const otpInput = document.getElementById('otpCode');
  const cancelBtn = document.getElementById('otpCancelBtn');
  const passwordToggle = document.getElementById('passwordToggle');

  if (usernameEl) usernameEl.disabled = isTwoFactorStep;
  if (passwordEl) passwordEl.disabled = isTwoFactorStep;
  if (roleEl) roleEl.disabled = isTwoFactorStep;
  if (roleTrigger) {
    roleTrigger.style.pointerEvents = isTwoFactorStep ? 'none' : '';
    roleTrigger.style.opacity = isTwoFactorStep ? '0.7' : '';
  }
  if (passwordToggle) passwordToggle.disabled = isTwoFactorStep;

  if (otpGroup) otpGroup.style.display = isTwoFactorStep ? '' : 'none';
  if (cancelBtn) cancelBtn.style.display = isTwoFactorStep ? '' : 'none';
  if (!isTwoFactorStep && otpInput) otpInput.value = '';
}

function setLoginButtonState(loading) {
  const btn = document.querySelector('.btn-login');
  if (!btn) return;
  if (loading) {
    btn.textContent = pendingTwoFactorChallenge ? 'Verifying code…' : 'Signing in…';
    btn.disabled = true;
    return;
  }
  btn.textContent = pendingTwoFactorChallenge ? 'Verify Code' : 'Sign In';
  btn.disabled = false;
}

function cancelTwoFactorLoginState(showInfo = false) {
  pendingTwoFactorChallenge = null;
  setLoginMode(false);
  setLoginButtonState(false);
  loginInFlight = false;
  if (showInfo) {
    notify('2FA step cancelled. You can sign in with another account.', 'info');
  }
}

async function handleLogin(e) {
  e.preventDefault();
  if (loginInFlight) {
    return;
  }

  const roleEl = document.getElementById('role');
  const usernameEl = document.getElementById('username');
  const passwordEl = document.getElementById('password');
  const otpEl = document.getElementById('otpCode');
  const role = roleEl ? roleEl.value : '';
  const username = usernameEl ? usernameEl.value.trim() : '';
  const password = passwordEl ? passwordEl.value : '';
  const otp = otpEl ? otpEl.value.trim() : '';
  const otpNormalized = (otp || '').replace(/\s+/g, '').toUpperCase();

  if (!pendingTwoFactorChallenge && (!username || !password)) {
    notify('Please fill in all fields', 'error');
    return;
  }
  if (pendingTwoFactorChallenge && !otpNormalized) {
    notify('Enter your authenticator code or backup code', 'error');
    return;
  }
  if (pendingTwoFactorChallenge && !(/^\d{6}$/.test(otpNormalized.replace(/\D/g, '')) || /^[A-Z0-9-]{8,16}$/.test(otpNormalized))) {
    notify('Enter a valid 6-digit authenticator code or backup code', 'error');
    return;
  }

  loginInFlight = true;
  setLoginButtonState(true);

  try {
    const isOtpStep = !!pendingTwoFactorChallenge;
    const endpoint = isOtpStep ? 'api/login-2fa.php' : 'api/login.php';
    const payload = isOtpStep
      ? { challengeId: pendingTwoFactorChallenge, code: otpNormalized }
      : { username, password, role };

    const res = await fetch(endpoint, {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    if (data.success && data.twoFactorRequired) {
      pendingTwoFactorChallenge = data.challengeId || null;
      if (!pendingTwoFactorChallenge) {
        throw new Error('Missing 2FA challenge id');
      }
      setLoginMode(true);
      setLoginButtonState(false);
      loginInFlight = false;
      if (otpEl) otpEl.focus();
      notify('Password verified. Enter your authenticator code or backup code to continue.', 'info');
      return;
    }

    if (data.success) {
      pendingTwoFactorChallenge = null;
      HMS.setCsrfToken(data.csrfToken || '');
      if (data.usedRecoveryCode) {
        notify(`Signed in with backup code. Remaining backup codes: ${data.recoveryRemaining ?? 'unknown'}.`, 'warning');
      }
      redirectAfterLogin(data.user);
      return;
    }

    if (pendingTwoFactorChallenge && /expired|challenge|login again/i.test(data.error || '')) {
      cancelTwoFactorLoginState(false);
    }
    notify(data.error || 'Invalid credentials. Please check and try again.', 'error');
  } catch (err) {
    notify('Login server unavailable. Please try again shortly.', 'error');
  }

  setLoginButtonState(false);
  loginInFlight = false;
}

function fillCred(username, password, role) {
  cancelTwoFactorLoginState(false);
  document.getElementById('username').value = username;
  document.getElementById('password').value = password;
  document.getElementById('role').value = role;
  syncRoleUI(role);
}

// ===== ROLE PICKER =====
const _roleData = {
  student:      { name: 'Student',       sub: 'Hostel resident access',  color: 'blue'   },
  admin:        { name: 'Admin / Owner', sub: 'Full system control',      color: 'purple' },
  receptionist: { name: 'Receptionist', sub: 'Front desk operations',    color: 'cyan'   },
};

function toggleRolePicker() {
  const trigger = document.getElementById('roleTrigger');
  const panel   = document.getElementById('roleDropdownPanel');
  if (!trigger || !panel) return;
  const isOpen = panel.classList.contains('open');
  if (isOpen) { closeRolePicker(); } else {
    trigger.classList.add('open');
    panel.classList.add('open');
  }
}

function closeRolePicker() {
  const trigger = document.getElementById('roleTrigger');
  const panel   = document.getElementById('roleDropdownPanel');
  if (trigger) trigger.classList.remove('open');
  if (panel)   panel.classList.remove('open');
}

function selectRoleOption(el) {
  if (pendingTwoFactorChallenge) {
    cancelTwoFactorLoginState(false);
  }
  const value = el.dataset.value;
  document.getElementById('role').value = value;
  document.querySelectorAll('.role-option').forEach(o => o.classList.remove('selected'));
  el.classList.add('selected');
  syncRoleUI(value);
  closeRolePicker();
}

function syncRoleUI(value) {
  const data = _roleData[value];
  if (!data) return;
  const nameEl = document.getElementById('roleTriggerName');
  const subEl  = document.getElementById('roleTriggerSub');
  const iconEl = document.getElementById('roleTriggerIcon');
  if (nameEl) nameEl.textContent = data.name;
  if (subEl)  subEl.textContent  = data.sub;
  // sync selected state in panel
  document.querySelectorAll('.role-option').forEach(o => {
    o.classList.toggle('selected', o.dataset.value === value);
  });
  // sync trigger icon gradient color accent
  if (iconEl) {
    iconEl.style.background = value === 'admin'
      ? 'linear-gradient(135deg,#7c3aed,#a855f7)'
      : value === 'receptionist'
        ? 'linear-gradient(135deg,#0891b2,#06b6d4)'
        : 'linear-gradient(135deg,var(--primary),var(--secondary))';
    // swap icon svg to match the selected option icon
    const srcIcon = document.querySelector(`.role-option[data-value="${value}"] .role-opt-icon svg`);
    if (srcIcon) iconEl.innerHTML = srcIcon.outerHTML;
  }
}

// Close role picker when clicking outside
document.addEventListener('click', function(e) {
  const picker = document.getElementById('rolePicker');
  if (picker && !picker.contains(e.target)) closeRolePicker();
});

function logout() {
  const modal = document.getElementById('logoutConfirmModal');
  if (modal) {
    openModal('logoutConfirmModal');
  } else if (confirm('Are you sure you want to logout?')) {
    confirmLogout();
  }
}

function confirmLogout() {
  fetch('api/logout.php', {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'X-CSRF-Token': HMS.getCsrfToken() || '' },
  }).finally(() => {
    HMS.clearSession();
    window.location.href = 'login.html';
  });
}

async function requireAuth(requiredRole) {
  HMS.init();

  // Fast path: session already in local storage
  let session = HMS.getSession();
  if (session && (!requiredRole || session.role === requiredRole)) {
    return session;
  }

  // Slow path: ask the server (handles hard-refresh / SW cache miss)
  const restored = await HMS.refreshSessionState();
  if (restored) {
    session = HMS.getSession();
    if (session && (!requiredRole || session.role === requiredRole)) {
      return session;
    }
  }

  // Genuinely not logged in
  window.location.href = 'login.html';
  return null;
}

// ===== NAVIGATION =====
function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const page = document.getElementById(pageId);
  if (page) page.classList.add('active');
  document.querySelectorAll(`[data-page="${pageId}"]`).forEach(n => n.classList.add('active'));
  document.getElementById('pageTitle').textContent = document.querySelector(`[data-page="${pageId}"]`)?.dataset.title || 'Dashboard';
  if (pageId === 'audit-logs' && adminAuditState.autoRefresh && !adminAuditState.refreshTimer) {
    const toggle = document.getElementById('auditAutoRefreshToggle');
    if (toggle) toggle.checked = true;
    toggleAuditAutoRefresh();
  }
  if (window.innerWidth <= 768) closeMobileSidebar();
}

function closeCustomFilterSelects(except) {
  document.querySelectorAll('.custom-select.open').forEach((el) => {
    if (except && el === except) return;
    el.classList.remove('open');
    const trigger = el.querySelector('.custom-select-trigger');
    if (trigger) trigger.setAttribute('aria-expanded', 'false');
  });
}

function buildCustomFilterSelect(select) {
  if (!select || select.dataset.customSelectInit === '1') return;
  select.dataset.customSelectInit = '1';

  const wrapper = document.createElement('div');
  wrapper.className = 'custom-select';

  const parent = select.parentNode;
  if (!parent) return;
  parent.insertBefore(wrapper, select);
  wrapper.appendChild(select);

  select.classList.add('custom-select-native');

  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.className = 'custom-select-trigger';
  trigger.setAttribute('aria-haspopup', 'listbox');
  trigger.setAttribute('aria-expanded', 'false');

  const triggerLabel = document.createElement('span');
  triggerLabel.className = 'custom-select-label';
  trigger.appendChild(triggerLabel);

  const menu = document.createElement('div');
  menu.className = 'custom-select-menu';
  menu.setAttribute('role', 'listbox');

  wrapper.appendChild(trigger);
  wrapper.appendChild(menu);

  const syncFromNative = () => {
    const selected = select.options[select.selectedIndex];
    triggerLabel.textContent = selected ? selected.textContent : 'Select';

    menu.querySelectorAll('.custom-select-option').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.value === select.value);
      btn.setAttribute('aria-selected', btn.dataset.value === select.value ? 'true' : 'false');
    });
  };

  const renderOptions = () => {
    menu.innerHTML = '';
    Array.from(select.options).forEach((opt) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'custom-select-option';
      btn.textContent = opt.textContent || '';
      btn.dataset.value = opt.value;
      btn.setAttribute('role', 'option');
      btn.setAttribute('aria-selected', 'false');

      if (opt.disabled) {
        btn.disabled = true;
        btn.classList.add('disabled');
      }

      btn.addEventListener('click', () => {
        if (opt.disabled) return;
        if (select.value !== opt.value) {
          select.value = opt.value;
          select.dispatchEvent(new Event('change', { bubbles: true }));
        }
        syncFromNative();
        closeCustomFilterSelects();
      });

      menu.appendChild(btn);
    });
    syncFromNative();
  };

  trigger.addEventListener('click', () => {
    const willOpen = !wrapper.classList.contains('open');
    closeCustomFilterSelects(wrapper);
    wrapper.classList.toggle('open', willOpen);
    trigger.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
  });

  trigger.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!wrapper.classList.contains('open')) {
        closeCustomFilterSelects(wrapper);
        wrapper.classList.add('open');
        trigger.setAttribute('aria-expanded', 'true');
      }
      const active = menu.querySelector('.custom-select-option.active') || menu.querySelector('.custom-select-option:not(.disabled)');
      if (active) active.focus();
    }
  });

  menu.addEventListener('keydown', (e) => {
    const options = Array.from(menu.querySelectorAll('.custom-select-option:not(.disabled)'));
    if (!options.length) return;
    const idx = options.indexOf(document.activeElement);

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = options[Math.min(options.length - 1, idx + 1)] || options[0];
      next.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = options[Math.max(0, idx - 1)] || options[0];
      prev.focus();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      closeCustomFilterSelects();
      trigger.focus();
    }
  });

  select.addEventListener('change', syncFromNative);

  const observer = new MutationObserver(() => renderOptions());
  observer.observe(select, { childList: true, subtree: true, attributes: true, attributeFilter: ['disabled', 'label', 'selected', 'value'] });

  renderOptions();
}

function initCustomFilterSelects(root = document) {
  const host = root && root.querySelectorAll ? root : document;
  host.querySelectorAll('select.filter-select').forEach((sel) => buildCustomFilterSelect(sel));
}

document.addEventListener('click', (e) => {
  if (!e.target.closest('.custom-select')) {
    closeCustomFilterSelects();
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeCustomFilterSelects();
  }
});

function initTopbar(session) {
  document.getElementById('topbarUserName').textContent = session.name.split(' ')[0];
  document.getElementById('topbarUserAvatar').textContent = session.name[0];
  const sidebarName = document.getElementById('sidebarUserName');
  const sidebarRole = document.getElementById('sidebarUserRole');
  const sidebarAvatar = document.getElementById('sidebarUserAvatar');
  if (sidebarName) sidebarName.textContent = session.name;
  if (sidebarRole) sidebarRole.textContent = session.role.charAt(0).toUpperCase() + session.role.slice(1);
  if (sidebarAvatar) sidebarAvatar.textContent = session.name[0];
}

// Mobile sidebar
function toggleMobileSidebar() {
  document.querySelector('.sidebar').classList.toggle('mobile-open');
  document.getElementById('sidebarOverlay').classList.toggle('visible');
}
function closeMobileSidebar() {
  document.querySelector('.sidebar').classList.remove('mobile-open');
  document.getElementById('sidebarOverlay').classList.remove('visible');
}

function updateSidebarToggleButtonIcon(sidebar) {
  const host = sidebar || document.querySelector('.sidebar');
  if (!host) return;

  const btn = host.querySelector('.sidebar-collapse-btn');
  const arrow = host.querySelector('.sidebar-collapse-btn .toggle-arrow-path');
  const leftArrow = host.querySelector('.sidebar-collapse-btn .toggle-arrow-left');
  const rightArrow = host.querySelector('.sidebar-collapse-btn .toggle-arrow-right');
  const collapsed = host.classList.contains('collapsed');

  if (btn) {
    btn.title = collapsed ? 'Expand sidebar' : 'Collapse sidebar';
  }

  if (leftArrow && rightArrow) {
    leftArrow.style.display = collapsed ? 'none' : '';
    rightArrow.style.display = collapsed ? '' : 'none';
  } else if (arrow) {
    arrow.setAttribute('d', collapsed ? 'M11.7 9.5l2.8 2.5-2.8 2.5' : 'M14.5 9.5L11.7 12l2.8 2.5');
  }
}

function initSidebarUI() {
  const sidebar = document.querySelector('.sidebar');
  if (!sidebar) return;
  const sections = sidebar.querySelectorAll('.sidebar-section');

  if (window.innerWidth <= 768) {
    sidebar.classList.remove('collapsed');
    sections.forEach(s => s.classList.add('open'));
    updateSidebarToggleButtonIcon(sidebar);
    return;
  }

  const collapsed = localStorage.getItem('hms_sidebar_collapsed') === '1';
  sidebar.classList.toggle('collapsed', collapsed);
  if (collapsed) {
    sections.forEach(s => s.classList.remove('open'));
  } else {
    sections.forEach(s => s.classList.add('open'));
  }
  updateSidebarToggleButtonIcon(sidebar);
}

function toggleSidebarSize() {
  const sidebar = document.querySelector('.sidebar');
  if (!sidebar || window.innerWidth <= 768) return;
  const sections = sidebar.querySelectorAll('.sidebar-section');

  const nextCollapsed = !sidebar.classList.contains('collapsed');
  sidebar.classList.toggle('collapsed', nextCollapsed);
  localStorage.setItem('hms_sidebar_collapsed', nextCollapsed ? '1' : '0');

  if (nextCollapsed) {
    sections.forEach(s => s.classList.remove('open'));
  } else {
    sections.forEach(s => s.classList.add('open'));
  }
  updateSidebarToggleButtonIcon(sidebar);
}

window.addEventListener('resize', () => {
  const sidebar = document.querySelector('.sidebar');
  if (!sidebar) return;
  if (window.innerWidth <= 768) {
    sidebar.classList.remove('collapsed');
    sidebar.querySelectorAll('.sidebar-section.open').forEach(s => s.classList.remove('open'));
    updateSidebarToggleButtonIcon(sidebar);
  } else {
    initSidebarUI();
  }
});

document.addEventListener('click', (e) => {
  const sidebar = document.querySelector('.sidebar');
  if (!sidebar) return;

  const toggleBtn = e.target.closest('.sidebar-section-toggle');
  if (toggleBtn) {
    const section = toggleBtn.closest('.sidebar-section');
    if (!section) return;

    if (window.innerWidth > 768 && sidebar.classList.contains('collapsed')) {
      sidebar.querySelectorAll('.sidebar-section.open').forEach(s => s.classList.remove('open'));
      // In collapsed desktop mode, rely on hover flyouts to avoid sticky overlapping panels.
    } else {
      section.classList.toggle('open');
    }
    return;
  }

  if (window.innerWidth > 768 && sidebar.classList.contains('collapsed') && !e.target.closest('.sidebar')) {
    sidebar.querySelectorAll('.sidebar-section.open').forEach(s => s.classList.remove('open'));
  }
});

// ===== MODALS =====
function openModal(id) {
  const m = document.getElementById(id);
  if (m) { m.classList.add('open'); document.body.style.overflow = 'hidden'; }
}
function closeModal(id) {
  const m = document.getElementById(id);
  if (m) { m.classList.remove('open'); document.body.style.overflow = ''; }
}
// Close on backdrop click
document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-overlay')) closeModal(e.target.id);
});

// ===== NOTIFICATIONS =====
function notify(msg, type = 'info', title = '') {
  const icons = {
    success: '<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>',
    error: '<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>',
    warning: '<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>',
    info: '<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>'
  };
  const titles = { success:'Success', error:'Error', warning:'Warning', info:'Info' };
  const container = document.querySelector('.notifications-container') || (() => {
    const c = document.createElement('div'); c.className = 'notifications-container'; document.body.appendChild(c); return c;
  })();
  const n = document.createElement('div');
  n.className = `notification ${type === 'error' ? 'error' : type}`;
  n.innerHTML = `<div class="notification-icon">${icons[type] || icons.info}</div>
    <div class="notification-body">
      <div class="notification-title"></div>
      <div class="notification-msg"></div>
    </div>
    <button class="notification-close" onclick="this.parentElement.remove()"><svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg></button>`;
  const titleEl = n.querySelector('.notification-title');
  const msgEl = n.querySelector('.notification-msg');
  if (titleEl) titleEl.textContent = sanitizeText(title || titles[type]);
  if (msgEl) msgEl.textContent = sanitizeText(msg);
  container.appendChild(n);
  setTimeout(() => { n.classList.add('hide'); setTimeout(() => n.remove(), 300); }, 4000);
}

// ===== UTILITIES =====
function sanitizeText(value) {
  return String(value ?? '').replace(/[<>"'`]/g, '').trim();
}

function escHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escAttr(value) {
  return escHtml(value).replace(/`/g, '&#96;');
}

function escJs(value) {
  return String(value ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/\"/g, '\\"')
    .replace(/[\r\n]/g, '');
}

function sanitizePayloadDeep(value) {
  if (Array.isArray(value)) {
    return value.map(sanitizePayloadDeep);
  }
  if (value && typeof value === 'object') {
    const out = {};
    Object.keys(value).forEach(k => {
      out[k] = sanitizePayloadDeep(value[k]);
    });
    return out;
  }
  if (typeof value === 'string') {
    return sanitizeText(value);
  }
  return value;
}

function stripSensitiveFieldsDeep(value) {
  if (Array.isArray(value)) {
    return value.map(stripSensitiveFieldsDeep);
  }
  if (value && typeof value === 'object') {
    const out = {};
    Object.keys(value).forEach(k => {
      const key = String(k).toLowerCase();
      if (key === 'password' || key === 'password_hash') return;
      out[k] = stripSensitiveFieldsDeep(value[k]);
    });
    return out;
  }
  return value;
}

function fmtCurrency(n) { return '₹' + Number(n).toLocaleString('en-IN'); }
function fmtDate(d) { return d ? new Date(d).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }) : '-'; }
function fmtDateTime(d) { return d ? new Date(d).toLocaleString('en-IN', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' }) : '-'; }
function today() { return new Date().toISOString().split('T')[0]; }
function avatarLetter(name) { return name ? name[0].toUpperCase() : '?'; }
function avatarColor(name) {
  const colors = ['','green','orange','red','purple'];
  return colors[(name?.charCodeAt(0) || 0) % colors.length];
}

function togglePassword() {
  const inp = document.getElementById('password');
  const btn = document.getElementById('passwordToggle');
  if (inp.type === 'password') {
    inp.type = 'text';
    btn.innerHTML = '<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="18" height="18"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21"/></svg>';
  } else {
    inp.type = 'password';
    btn.innerHTML = '<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="18" height="18"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>';
  }
}

function filterTable(searchId, tableId) {
  const term = document.getElementById(searchId).value.toLowerCase();
  document.querySelectorAll(`#${tableId} tbody tr`).forEach(row => {
    row.style.display = row.textContent.toLowerCase().includes(term) ? '' : 'none';
  });
}

function exportTableCSV(tableId, filename) {
  const table = document.getElementById(tableId);
  if (!table) return;
  const rows = Array.from(table.querySelectorAll('tr'));
  const csv = rows.map(r => Array.from(r.querySelectorAll('th,td')).map(c => `"${c.textContent.trim()}"`).join(',')).join('\n');
  const a = document.createElement('a');
  a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
  a.download = filename + '.csv'; a.click();
  notify('CSV exported successfully', 'success');
}

// ===== STUDENT DASHBOARD =====
async function renderMyActivity(containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;
  try {
    const res = await fetch('api/my-activity.php?limit=10', { credentials: 'same-origin' });
    const data = await res.json();
    if (!data.success || !Array.isArray(data.logs) || !data.logs.length) {
      el.innerHTML = '<p class="text-muted text-center" style="padding:16px 0">No recent activity found.</p>';
      return;
    }
    el.innerHTML = data.logs.map((log, i) => {
      const label = auditActionLabel(log.action_name || '-');
      const statusClass = log.status === 'success' ? 'badge-success' : 'badge-danger';
      const time = log.created_at ? fmtDateTime(log.created_at) : '-';
      const details = escHtml(log.details || '');
      const border = i < data.logs.length - 1 ? 'border-bottom:1px solid var(--border);' : '';
      return `<div style="display:flex;align-items:flex-start;gap:10px;padding:10px 0;${border}">
        <div style="flex:1">
          <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
            <span class="badge badge-secondary">${escHtml(label)}</span>
            <span class="badge ${statusClass}">${escHtml(log.status || '-')}</span>
            <span class="text-muted" style="font-size:12px">${escHtml(time)}</span>
          </div>
          ${details ? `<div class="text-muted" style="font-size:12px;margin-top:4px">${details}</div>` : ''}
        </div>
      </div>`;
    }).join('');
  } catch (e) {
    el.innerHTML = '<p class="text-muted text-center" style="padding:16px 0">Unable to load activity.</p>';
  }
}

async function initStudentDashboard() {
  const session = await requireAuth('student');
  if (!session) return;
  initSidebarUI();
  await HMS.refreshSessionState();
  initTopbar(session);
  initCustomFilterSelects();
  showPage('dashboard');
  const synced = await HMS.syncFromDB();
  const student = HMS.findById('users', session.userId);
  if (!student) {
    if (!synced) {
      // Sync failed — verify whether the PHP session is still active before forcing logout.
      // (syncFromDB can fail on a transient network error even when the session is valid.)
      const sessionStillValid = await HMS.refreshSessionState();
      if (sessionStillValid) {
        notify('Unable to load your data. Please refresh the page.', 'error');
        return; // Session is valid — stay on page, let user retry
      }
    }
    // Session is genuinely expired, or sync succeeded but student ID is not in DB.
    notify('Your session has expired. Please login again.', 'error');
    HMS.clearSession();
    window.location.href = 'login.html';
    return;
  }
  renderStudentDashboard(student);
  renderStudentBookings(student);
  renderStudentPayments(student);
  renderStudentRequests(student);
  renderStudentProfile(student);
  renderNotices();
}

function renderStudentDashboard(student) {
  const bookings = HMS.where('bookings', b => b.studentId === student.id && b.status === 'active');
  const booking = bookings[0];
  const room = booking ? HMS.findById('rooms', booking.roomId) : null;
  const pendingPayments = HMS.where('payments', p => p.studentId === student.id && p.status === 'pending');
  const pendingAmt = pendingPayments.reduce((s,p) => s + p.amount, 0);
  const allPayments = HMS.where('payments', p => p.studentId === student.id && p.status === 'paid');

  set('statRoom', room ? room.number : 'N/A');
  set('statPending', fmtCurrency(pendingAmt));
  set('statPaidTotal', fmtCurrency(allPayments.reduce((s,p) => s + p.amount, 0)));
  set('statBookingStatus', booking ? 'Active' : 'None');

  if (booking && room) {
    const el = document.getElementById('currentBookingInfo');
    if (el) el.innerHTML = `
      <div class="info-row"><span class="info-label">Room Number</span><span class="info-value fw-600 color-primary">${room.number}</span></div>
      <div class="info-row"><span class="info-label">Room Type</span><span class="info-value">${room.type}</span></div>
      <div class="info-row"><span class="info-label">Floor</span><span class="info-value">${room.floor}</span></div>
      <div class="info-row"><span class="info-label">Monthly Rent</span><span class="info-value fw-600">${fmtCurrency(room.rent)}</span></div>
      <div class="info-row"><span class="info-label">Check-In Date</span><span class="info-value">${fmtDate(booking.checkIn)}</span></div>
      <div class="info-row"><span class="info-label">Check-Out Date</span><span class="info-value">${fmtDate(booking.checkOut)}</span></div>
      <div class="info-row"><span class="info-label">Amenities</span><span class="info-value">${room.amenities.join(', ')}</span></div>
    `;
  }

  const recentPay = HMS.where('payments', p => p.studentId === student.id).slice(-3).reverse();
  const payBody = document.getElementById('recentPaymentsBody');
  if (payBody) payBody.innerHTML = recentPay.length ? recentPay.map(p =>
    `<tr><td>${p.txnId || '-'}</td><td>${p.type}</td><td>${fmtCurrency(p.amount)}</td>
     <td>${fmtDate(p.date)}</td><td><span class="badge ${p.status==='paid'?'badge-success':'badge-warning'}">${p.status}</span></td></tr>`
  ).join('') : '<tr><td colspan="5" class="text-center text-muted">No payments found</td></tr>';
}

function renderStudentBookings(student) {
  const bookings = HMS.where('bookings', b => b.studentId === student.id);
  const tbody = document.getElementById('bookingsBody');
  if (!tbody) return;
  tbody.innerHTML = bookings.length ? bookings.map(b => {
    const room = HMS.findById('rooms', b.roomId);
    return `<tr><td>${b.id}</td><td>${room ? room.number : '-'}</td><td>${room ? room.type : '-'}</td>
      <td>${fmtDate(b.checkIn)}</td><td>${fmtDate(b.checkOut)}</td>
      <td>${fmtCurrency(b.amount)}/mo</td>
      <td><span class="badge ${b.status==='active'?'badge-success':b.status==='pending'?'badge-warning':'badge-secondary'}">${b.status}</span></td></tr>`;
  }).join('') : '<tr><td colspan="7" class="text-center text-muted" style="padding:24px">No bookings found</td></tr>';
}

function renderStudentPayments(student) {
  let payments = HMS.where('payments', p => p.studentId === student.id);
  const pending = payments.filter(p => p.status === 'pending');
  const pendingAmt = pending.reduce((s,p) => s + p.amount, 0);

  set('paymentHeroAmount', fmtCurrency(pendingAmt));
  set('paymentHeroLabel', pendingAmt > 0 ? 'Amount Due' : 'No Pending Dues');
  set('paymentDueDate', pendingAmt > 0 ? 'Due by 10th of this month' : 'All payments up to date');

  // Apply date range filter
  const fromEl = document.getElementById('stuPayDateFrom');
  const toEl = document.getElementById('stuPayDateTo');
  const from = fromEl ? fromEl.value : '';
  const to = toEl ? toEl.value : '';
  let filtered = [...payments];
  if (from) filtered = filtered.filter(p => p.date && p.date >= from);
  if (to)   filtered = filtered.filter(p => p.date && p.date <= to);
  // Apply sort
  const { col: sc, dir: sd } = stuSortState.payments;
  filtered.sort((a, b) => {
    if (sc === 'amount') return sd === 'asc' ? (a.amount||0) - (b.amount||0) : (b.amount||0) - (a.amount||0);
    if (sc === 'status') return sd === 'asc' ? (a.status||'').localeCompare(b.status||'') : (b.status||'').localeCompare(a.status||'');
    // FIX: Use direct < > comparison instead of localeCompare() for ISO date strings (YYYY-MM-DD).
    // localeCompare() is locale-sensitive and produces wrong order on Indian/non-English Windows locales.
    const da = a.date || '', db = b.date || '';
    return sd === 'asc' ? (da < db ? -1 : da > db ? 1 : 0) : (db < da ? -1 : db > da ? 1 : 0);
  });

  const tbody = document.getElementById('paymentHistoryBody');
  if (!tbody) return;
  tbody.innerHTML = filtered.length ? filtered.map(p =>
    `<tr><td>${p.txnId || '-'}</td><td>${p.type}</td><td>${fmtCurrency(p.amount)}</td>
     <td>${p.method || '-'}</td><td>${fmtDate(p.date)}</td>
     <td><span class="badge ${p.status==='paid'?'badge-success':'badge-warning'}">${p.status}</span></td>
     <td>${p.status==='paid'?`<button class="btn btn-sm btn-secondary" onclick="printReceipt('${p.id}')">Receipt</button>`:'—'}</td></tr>`
  ).join('') : '<tr><td colspan="7" class="text-center text-muted" style="padding:24px">No payment records found</td></tr>';
}

function renderStudentRequests(student) {
  const reqs = HMS.where('requests', r => r.studentId === student.id);
  const tbody = document.getElementById('requestsBody');
  if (!tbody) return;
  // Apply sort
  const { col: rc, dir: rd } = stuSortState.requests;
  const sorted = [...reqs].sort((a, b) => {
    if (rc === 'status') return rd === 'asc' ? (a.status||'').localeCompare(b.status||'') : (b.status||'').localeCompare(a.status||'');
    // default: date
    return rd === 'asc' ? (a.date||'').localeCompare(b.date||'') : (b.date||'').localeCompare(a.date||'');
  });
  tbody.innerHTML = sorted.length ? sorted.map(r =>
    `<tr><td>${escHtml(r.id)}</td><td><span class="badge badge-info">${escHtml(r.type)}</span></td>
     <td>${escHtml(r.description)}</td><td>${escHtml(fmtDate(r.date))}</td>
     <td><span class="badge ${r.status==='resolved'||r.status==='approved'?'badge-success':r.status==='rejected'?'badge-danger':'badge-warning'}">${escHtml(r.status)}</span></td>
     <td>${escHtml(r.response || '—')}</td></tr>`
  ).join('') : '<tr><td colspan="6" class="text-center text-muted" style="padding:24px">No requests submitted</td></tr>';
}

function renderStudentProfile(student) {
  set('profileInitial', student.name[0]);
  set('profileFullName', student.name);
  set('profileRoleBadge', 'Student');
  setInput('editName', student.name);
  setInput('editEmail', student.email);
  setInput('editPhone', student.phone);
  setInput('editStudentId', student.studentId);
  setInput('editBloodGroup', student.bloodGroup);
  setInput('editEmergency', student.emergencyContact);
  setInput('editCourse', student.course);
  setInput('editYear', student.year);
  setInput('editFather', student.fatherName);
  setInput('editAddress', student.address);
}

function submitRequest(e) {
  e.preventDefault();
  const session = HMS.getSession();
  const type = document.getElementById('reqType').value;
  const desc = document.getElementById('reqDesc').value.trim();
  if (!desc) { notify('Please describe your request', 'warning'); return; }
  HMS.add('requests', { id: HMS.genId(), studentId: session.userId, type, description: desc, date: today(), status: 'pending', response: '' });
  notify('Request submitted successfully', 'success');
  closeModal('requestModal');
  e.target.reset();
  const student = HMS.findById('users', session.userId);
  renderStudentRequests(student);
}

// Pre-fills the amount field with the current pending due so the student
// sees exactly what they owe before editing it for a partial payment.
function openPaymentModal() {
  const session = HMS.getSession();
  const pending = HMS.where('payments', p => p.studentId === session.userId && p.status === 'pending');
  const amtEl = document.getElementById('payAmount');
  if (amtEl && pending.length) amtEl.value = pending[0].amount;
  openModal('paymentModal');
}

async function submitPayment(e) {
  e.preventDefault();
  const session = HMS.getSession();
  const method = document.getElementById('payMethod').value;
  const amount = Number(document.getElementById('payAmount').value);
  if (!method || !amount) { notify('Please fill in all payment details', 'warning'); return; }

  const refreshed = await HMS.refreshSessionState();
  const activeSession = HMS.getSession() || session;
  if (refreshed && activeSession?.role !== 'student') {
    notify('Payment blocked: active session is not Student. Please login as Student.', 'error');
    return;
  }

  const idempotencyKey = (typeof crypto !== 'undefined' && crypto.randomUUID)
    ? crypto.randomUUID()
    : `pay-${Date.now()}-${Math.random().toString(16).slice(2)}`;

  const sendPayment = async () => fetch('api/payments.php', {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': HMS.getCsrfToken() || '',
    },
    body: JSON.stringify({ method, amount, idempotencyKey }),
  });

  try {
    let res = await sendPayment();
    let data = await res.json().catch(() => ({}));

    if (!res.ok && res.status === 403 && String(data.error || '').toLowerCase().includes('csrf')) {
      const refreshedCsrf = await HMS.refreshSessionState();
      if (refreshedCsrf) {
        res = await sendPayment();
        data = await res.json().catch(() => ({}));
      }
    }

    if (!res.ok || !data.success) {
      notify(data.error || 'Payment failed', 'error');
      return;
    }

    await HMS.syncFromDB();
    notify(`Payment of ${fmtCurrency(data.paidAmount || amount)} submitted successfully.`, 'success');
    closeModal('paymentModal');
    e.target.reset();
    const latestSession = HMS.getSession() || activeSession;
    const student = HMS.findById('users', latestSession?.userId || '');
    if (student) {
      renderStudentPayments(student);
      renderStudentDashboard(student);
    }
  } catch (err) {
    notify('Payment service unavailable. Please try again.', 'error');
  }
}

function updateProfile(e) {
  e.preventDefault();
  const session = HMS.getSession();
  HMS.update('users', session.userId, {
    name: document.getElementById('editName').value,
    email: document.getElementById('editEmail').value,
    phone: document.getElementById('editPhone').value,
    bloodGroup: document.getElementById('editBloodGroup').value,
    emergencyContact: document.getElementById('editEmergency').value,
    course: document.getElementById('editCourse').value,
    year: document.getElementById('editYear').value,
    fatherName: document.getElementById('editFather').value,
    address: document.getElementById('editAddress').value,
  });
  notify('Profile updated successfully', 'success');
  const updated = HMS.findById('users', session.userId);
  HMS.setSession({ ...session, name: updated.name });
  initTopbar(HMS.getSession());
  renderStudentProfile(updated);
}

async function changePassword(e) {
  e.preventDefault();
  const session = HMS.getSession();
  const old = document.getElementById('oldPass').value;
  const np  = document.getElementById('newPass').value;
  const cp  = document.getElementById('confirmPass').value;
  if (np.length < 10) { notify('New password must be at least 10 characters', 'warning'); return; }
  if (np !== cp) { notify('New passwords do not match', 'error'); return; }

  try {
    const res = await fetch('api/change-password.php', {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': HMS.getCsrfToken() || '',
      },
      body: JSON.stringify({ oldPassword: old, newPassword: np }),
    });
    const data = await res.json();
    if (!data.success) { notify(data.error || 'Current password is incorrect', 'error'); return; }
  } catch (err) {
    notify('Password service unavailable. Please try again.', 'error');
    return;
  }

  notify('Password changed successfully', 'success');
  e.target.reset();
}

function printReceipt(paymentId) {
  const p = HMS.findById('payments', paymentId);
  if (!p) return;
  const student = HMS.findById('users', p.studentId);
  const safeTxnId = escHtml(p.txnId || '-');
  const safeDate = escHtml(fmtDate(p.date));
  const safeStudent = escHtml(student?.name || '-');
  const safeType = escHtml(p.type || '-');
  const safeMethod = escHtml(p.method || '-');
  const safeAmount = escHtml(fmtCurrency(p.amount));
  const w = window.open('', '_blank');
  w.document.head.innerHTML = `<title>Receipt</title><style>body{font-family:Arial;padding:40px;max-width:500px;margin:0 auto}h2{color:#4338ca}.amount{font-size:24px;font-weight:700;color:#10b981}p{margin:8px 0}hr{border:none;border-top:1px solid #eee;margin:16px 0}</style>`;
  w.document.body.innerHTML = `<h2>Hostel Pro - Payment Receipt</h2><hr>
    <p><strong>Transaction ID:</strong> ${safeTxnId}</p>
    <p><strong>Date:</strong> ${safeDate}</p>
    <p><strong>Student:</strong> ${safeStudent}</p>
    <p><strong>Payment Type:</strong> ${safeType}</p>
    <p><strong>Method:</strong> ${safeMethod}</p>
    <p class="amount">Amount: ${safeAmount}</p>
    <p><strong>Status:</strong> PAID</p><hr>
    <p style="font-size:12px;color:#666">This is a computer-generated receipt. No signature required.</p>`;
  w.print();
}

// ===== NOTICES =====
function renderNotices() {
  const notices = HMS.get('notices');
  const containers = document.querySelectorAll('.notices-list');
  if (!containers.length) return;
  const html = notices.length ? [...notices].reverse().map(n =>
    `<div class="notice-item ${escAttr(n.type)}">
      <div class="notice-title">${escHtml(n.title)}</div>
      <div class="notice-body">${escHtml(n.body)}</div>
      <div class="notice-meta">Posted by ${escHtml(n.author)} · ${escHtml(fmtDate(n.date))}</div>
    </div>`
  ).join('') : '<p class="text-muted text-sm">No notices posted</p>';
  containers.forEach(c => c.innerHTML = html);
}

// ===== ADMIN SORT STATE =====
const adminSortState = {
  students: { col: 'id', dir: 'asc' },
  payments: { col: 'date', dir: 'desc' }
};
// ===== RECEPTIONIST SORT STATE =====
const recSortState = {
  students:   { col: 'name',  dir: 'asc'  },
  visitors:   { col: 'date',  dir: 'desc' },
  attendance: { col: 'name',  dir: 'asc'  },
  payments:   { col: 'date',  dir: 'desc' }
};
// ===== STUDENT SORT STATE =====
const stuSortState = {
  payments: { col: 'date', dir: 'desc' },
  requests: { col: 'date', dir: 'desc' }
};

const adminAuditState = {
  page: 1,
  pageSize: 20,
  totalPages: 1,
  total: 0,
  logs: [],
  action: '',
  status: '',
  actorRole: '',
  q: '',
  dateFrom: '',
  dateTo: '',
  includeSystem: false,
  autoRefresh: false,
  refreshTimer: null,
  lastRefreshAt: '',
};

function isAuditPageVisible() {
  return !!document.getElementById('audit-logs')?.classList.contains('active');
}

function getAuditRisk(log) {
  const action = String(log?.action_name || '');
  const status = String(log?.status || '');
  const details = String(log?.details || '').toLowerCase();

  if (status === 'failed' && action === 'login') return { level: 'high', score: 90 };
  if (status === 'failed' && action === 'payment_submit') return { level: 'high', score: 85 };
  if (action === 'data_remove') return { level: 'high', score: 80 };
  if (action === 'twofa_disable') return { level: 'high', score: 75 };
  if (status === 'failed') return { level: 'medium', score: 60 };
  if (action === 'password_change') return { level: 'medium', score: 55 };
  if (action === 'twofa_recovery_regenerate') return { level: 'medium', score: 50 };
  if (action === 'login_2fa_recovery') return { level: 'medium', score: 50 };
  if (action === 'twofa_enable') return { level: 'medium', score: 45 };
  if (action === 'twofa_setup_begin') return { level: 'medium', score: 40 };
  if (details.includes('forbidden') || details.includes('invalid')) return { level: 'medium', score: 50 };
  return { level: 'low', score: 20 };
}

function riskBadge(level) {
  if (level === 'high') return '<span class="badge badge-danger">high</span>';
  if (level === 'medium') return '<span class="badge badge-warning">medium</span>';
  return '<span class="badge badge-success">low</span>';
}

function ensureAuditCellModal() {
  if (document.getElementById('auditCellModal')) return;

  const host = document.createElement('div');
  host.id = 'auditCellModal';
  host.className = 'modal-overlay';
  host.innerHTML = `
    <div class="modal audit-cell-modal">
      <div class="modal-header">
        <div class="modal-title" id="auditCellModalTitle">Audit Detail</div>
        <button class="modal-close" onclick="closeModal('auditCellModal')"><svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg></button>
      </div>
      <div class="modal-body">
        <div class="audit-cell-fulltext" id="auditCellModalText"></div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="closeModal('auditCellModal')">Close</button>
      </div>
    </div>
  `;

  document.body.appendChild(host);
}

function openAuditCellPanel(label, value) {
  ensureAuditCellModal();
  const titleEl = document.getElementById('auditCellModalTitle');
  const textEl = document.getElementById('auditCellModalText');
  if (titleEl) titleEl.textContent = label || 'Audit Detail';
  if (textEl) textEl.textContent = value || '-';
  openModal('auditCellModal');
}

document.addEventListener('click', (e) => {
  const trigger = e.target.closest('.audit-cell-trigger');
  if (!trigger) return;
  const label = trigger.getAttribute('data-audit-label') || 'Audit Detail';
  const value = trigger.getAttribute('data-audit-value') || trigger.textContent || '-';
  openAuditCellPanel(label, value);
});

function auditActionLabel(action) {
  const map = {
    login: 'Login',
    logout: 'Logout',
    data_add: 'Data Add',
    data_update: 'Data Update',
    data_remove: 'Data Remove',
    password_change: 'Password Change',
    payment_submit: 'Payment Submit',
    twofa_setup_begin: '2FA Setup Started',
    twofa_setup_cancel: '2FA Setup Cancelled',
    twofa_enable: '2FA Enabled',
    twofa_disable: '2FA Disabled',
    twofa_recovery_regenerate: '2FA Recovery Regenerated',
    login_2fa: '2FA Login',
    login_2fa_recovery: '2FA Recovery Login',
  };
  return map[action] || String(action || '-').replace(/_/g, ' ');
}

function displayIp(ip) {
  const value = String(ip || '').trim();
  if (!value) return '-';
  if (value === '::1' || value === '127.0.0.1') return 'Localhost';
  return value;
}

function toggleAuditAutoRefresh() {
  const enabled = !!document.getElementById('auditAutoRefreshToggle')?.checked;
  adminAuditState.autoRefresh = enabled;

  if (adminAuditState.refreshTimer) {
    clearInterval(adminAuditState.refreshTimer);
    adminAuditState.refreshTimer = null;
  }

  if (enabled) {
    notify('Audit auto refresh enabled (15s)', 'info');
    adminAuditState.refreshTimer = setInterval(() => {
      if (!adminAuditState.autoRefresh) return;
      if (document.hidden) return;
      if (!isAuditPageVisible()) return;
      renderAuditLogs(adminAuditState.page);
    }, 15000);
  } else {
    notify('Audit auto refresh disabled', 'info');
  }
}

function exportAuditCsv() {
  const rows = adminAuditState.logs || [];
  if (!rows.length) {
    notify('No audit rows to export', 'warning');
    return;
  }

  const header = ['created_at', 'action_name', 'status', 'risk', 'actor_user_id', 'actor_role', 'target_type', 'target_id', 'ip_address', 'details'];
  const lines = [header.join(',')];

  rows.forEach(log => {
    const risk = getAuditRisk(log).level;
    const values = [
      log.created_at || '',
      log.action_name || '',
      log.status || '',
      risk,
      log.actor_user_id || '',
      log.actor_role || '',
      log.target_type || '',
      log.target_id || '',
      log.ip_address || '',
      log.details || '',
    ].map(v => `"${String(v).replace(/"/g, '""')}"`);

    lines.push(values.join(','));
  });

  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `audit-logs-${today()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  notify('Audit CSV exported', 'success');
}

async function renderAuditSummary() {
  try {
    const res = await fetch('api/audit-summary.php', { credentials: 'same-origin' });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.success) return;

    set('auditFailed24h', data.summary?.failed24h ?? 0);
    set('auditHighRisk24h', data.summary?.highRisk24h ?? 0);
    set('auditTopIp', data.summary?.topIp || '-');
    set('auditTopActor', data.summary?.topActor || '-');
  } catch (e) {
    // Keep dashboard usable if summary endpoint is unavailable.
  }
}

async function renderDbHealth() {
  const meta = document.getElementById('dbHealthMeta');
  const auditMeta = document.getElementById('auditDbHealthMeta');
  if (meta) meta.textContent = 'Loading database health...';
  if (auditMeta) auditMeta.textContent = 'Loading database health...';

  try {
    const res = await fetch('api/db-health.php', { credentials: 'same-origin' });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.success) {
      if (meta) meta.textContent = 'Unable to load database health';
      if (auditMeta) auditMeta.textContent = 'Unable to load database health';
      return;
    }

    set('dbUsersCount', data.counts?.users ?? 0);
    set('dbPaymentsCount', data.counts?.payments ?? 0);
    set('dbAuditCount', data.counts?.audit_logs ?? 0);
    set('dbAttendanceCount', data.counts?.attendance ?? 0);

    const generated = data.generatedAt ? fmtDateTime(data.generatedAt) : '-';
    const db = data.database || '-';
    const label = `Database: ${db} | Last updated: ${generated}`;
    if (meta) meta.textContent = label;
    if (auditMeta) auditMeta.textContent = label;
  } catch (e) {
    if (meta) meta.textContent = 'Unable to load database health';
    if (auditMeta) auditMeta.textContent = 'Unable to load database health';
  }
}

function applyAuditFilters() {
  adminAuditState.action = document.getElementById('auditActionFilter')?.value || '';
  adminAuditState.status = document.getElementById('auditStatusFilter')?.value || '';
  adminAuditState.actorRole = document.getElementById('auditRoleFilter')?.value || '';
  adminAuditState.q = document.getElementById('auditSearch')?.value.trim() || '';
  adminAuditState.dateFrom = document.getElementById('auditDateFrom')?.value || '';
  adminAuditState.dateTo = document.getElementById('auditDateTo')?.value || '';
  adminAuditState.includeSystem = !!document.getElementById('auditIncludeSystem')?.checked;
  renderAuditLogs(1);
}

function clearAuditFilters() {
  const ids = ['auditActionFilter', 'auditStatusFilter', 'auditRoleFilter', 'auditSearch', 'auditDateFrom', 'auditDateTo'];
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.value = '';
  });
  const includeSystem = document.getElementById('auditIncludeSystem');
  if (includeSystem) includeSystem.checked = false;
  adminAuditState.action = '';
  adminAuditState.status = '';
  adminAuditState.actorRole = '';
  adminAuditState.q = '';
  adminAuditState.dateFrom = '';
  adminAuditState.dateTo = '';
  adminAuditState.includeSystem = false;
  renderAuditLogs(1);
}

function auditPrevPage() {
  if (adminAuditState.page > 1) renderAuditLogs(adminAuditState.page - 1);
}

function auditNextPage() {
  if (adminAuditState.page < adminAuditState.totalPages) renderAuditLogs(adminAuditState.page + 1);
}

async function renderAuditLogs(page = 1) {
  adminAuditState.page = Math.max(1, page);
  const tbody = document.getElementById('auditLogsBody');
  if (!tbody) return;

  const params = new URLSearchParams({
    page: String(adminAuditState.page),
    pageSize: String(adminAuditState.pageSize),
  });
  if (adminAuditState.action) params.set('action', adminAuditState.action);
  if (adminAuditState.status) params.set('status', adminAuditState.status);
  if (adminAuditState.actorRole) params.set('actorRole', adminAuditState.actorRole);
  if (adminAuditState.q) params.set('q', adminAuditState.q);
  if (adminAuditState.dateFrom) params.set('dateFrom', adminAuditState.dateFrom);
  if (adminAuditState.dateTo) params.set('dateTo', adminAuditState.dateTo);
  if (adminAuditState.includeSystem) params.set('includeSystem', '1');

  tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted" style="padding:20px">Loading audit logs...</td></tr>';

  try {
    const res = await fetch(`api/audit-logs.php?${params.toString()}`, { credentials: 'same-origin' });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.success) {
      tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted" style="padding:20px">Unable to load audit logs</td></tr>';
      return;
    }

    const logs = Array.isArray(data.logs) ? data.logs : [];
    adminAuditState.logs = logs;
    adminAuditState.totalPages = Number(data.pagination?.totalPages || 1);
    adminAuditState.total = Number(data.pagination?.total || 0);
    adminAuditState.page = Number(data.pagination?.page || adminAuditState.page);

    if (!logs.length) {
      tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted" style="padding:20px">No audit events found</td></tr>';
    } else {
      tbody.innerHTML = logs.map(log => {
        const statusClass = log.status === 'success' ? 'badge-success' : (log.status === 'failed' ? 'badge-danger' : 'badge-warning');
        const risk = getAuditRisk(log);
        const actorName = log.actor_name || log.actor_user_id || '-';
        const actorLabel = `${actorName}${log.actor_role ? ` (${log.actor_role})` : ''}`;
        const targetLabel = log.target_display || `${log.target_type || '-'}${log.target_id ? `:${log.target_id}` : ''}`;
        const rowStyle = risk.level === 'high' ? ' style="background:rgba(239,68,68,0.08)"' : (risk.level === 'medium' ? ' style="background:rgba(245,158,11,0.08)"' : '');
        return `<tr${rowStyle}>
          <td>${escHtml(fmtDateTime(log.created_at || ''))}</td>
          <td><div class="audit-action-wrap"><span class="badge badge-secondary">${escHtml(auditActionLabel(log.action_name || '-'))}</span>${riskBadge(risk.level)}</div></td>
          <td><span class="badge ${statusClass}">${escHtml(log.status || '-')}</span></td>
          <td>${escHtml(actorLabel)}</td>
          <td><div class="audit-target-scroll audit-cell-trigger" data-audit-label="Target" data-audit-value="${escAttr(targetLabel)}" title="Click to view full target">${escHtml(targetLabel)}</div></td>
          <td>${escHtml(displayIp(log.ip_address || '-'))}</td>
          <td><div class="audit-detail-scroll audit-cell-trigger" data-audit-label="Details" data-audit-value="${escAttr(log.details || '-')}" title="Click to view full details">${escHtml(log.details || '-')}</div></td>
        </tr>`;
      }).join('');
    }

    adminAuditState.lastRefreshAt = new Date().toISOString();
    const info = document.getElementById('auditPageInfo');
    if (info) {
      info.textContent = `Page ${adminAuditState.page} of ${adminAuditState.totalPages} • ${adminAuditState.total} events • Last refresh: ${fmtDateTime(adminAuditState.lastRefreshAt)}`;
    }

    const prevBtn = document.getElementById('auditPrevBtn');
    const nextBtn = document.getElementById('auditNextBtn');
    if (prevBtn) prevBtn.disabled = adminAuditState.page <= 1;
    if (nextBtn) nextBtn.disabled = adminAuditState.page >= adminAuditState.totalPages;

    renderAuditSummary();
    renderDbHealth();
  } catch (e) {
    tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted" style="padding:20px">Unable to load audit logs</td></tr>';
  }
}

// ===== ADMIN DASHBOARD =====
function reconcileRooms() {
  // Recalculate room occupancy from actual student assignments (fixes stale/wrong counts)
  const rooms = HMS.get('rooms');
  rooms.forEach(room => {
    const occupants = HMS.where('users', u => u.role === 'student' && u.roomId === room.id);
    const actual = occupants.length;
    let newStatus = room.status;
    if (room.status !== 'maintenance') {
      if (actual === 0) newStatus = 'available';
      else if (actual >= room.beds) newStatus = 'occupied';
      else newStatus = 'partial';
    }
    if (room.occupied !== actual || room.status !== newStatus) {
      HMS.update('rooms', room.id, { occupied: actual, status: newStatus });
    }
  });
}

async function initAdminDashboard() {
  const session = await requireAuth('admin');
  if (!session) return;
  initSidebarUI();
  await HMS.refreshSessionState();
  initTopbar(session);
  initCustomFilterSelects();
  showPage('dashboard');
  await HMS.syncFromDB();
  reconcileRooms();
  renderAdminStats(); renderAdminRooms(); renderAdminStudents();
  renderAdminRequests(); renderAdminPayments(); renderAdminActivity();
  renderNoticesAdmin(); populateRoomDropdowns();
  renderDbHealth();
  loadAdminTwofaStatus(true);
  setTimeout(initCharts, 100);
}

function setAdminTwofaUi(state) {
  const status = document.getElementById('twofaStatusMsg');
  const setupBlock = document.getElementById('twofaSetupBlock');
  const disableBlock = document.getElementById('twofaDisableBlock');
  const recoveryBlock = document.getElementById('twofaRecoveryBlock');
  const recoveryMsg = document.getElementById('twofaRecoveryMsg');
  const recoveryCodes = document.getElementById('twofaRecoveryCodes');
  const copyBtn = document.getElementById('twofaCopyRecoveryBtn');
  const downloadBtn = document.getElementById('twofaDownloadRecoveryBtn');
  const regenBtn = document.getElementById('twofaRegenRecoveryBtn');
  const beginBtn = document.getElementById('twofaBeginBtn');
  const confirmBtn = document.getElementById('twofaConfirmBtn');
  const cancelSetupBtn = document.getElementById('twofaCancelSetupBtn');
  const disableBtn = document.getElementById('twofaDisableBtn');
  const secretInput = document.getElementById('twofaSecret');
  const uriInput = document.getElementById('twofaUri');

  adminTwofaState.enabled = !!state.enabled;
  adminTwofaState.recoveryRemaining = Number(state.recoveryRemaining || 0);
  adminTwofaState.recoveryLastGeneratedAt = state.recoveryLastGeneratedAt || null;

  if (status) status.textContent = state.message || '';
  if (setupBlock) setupBlock.style.display = state.setupPending ? '' : 'none';
  if (disableBlock) disableBlock.style.display = state.enabled ? '' : 'none';
  if (recoveryBlock) recoveryBlock.style.display = (state.enabled || (state.recoveryCodes || []).length) ? '' : 'none';
  if (beginBtn) beginBtn.style.display = (!state.enabled && !state.setupPending) ? '' : 'none';
  if (confirmBtn) confirmBtn.style.display = state.setupPending ? '' : 'none';
  if (cancelSetupBtn) cancelSetupBtn.style.display = state.setupPending ? '' : 'none';
  if (disableBtn) disableBtn.style.display = state.enabled ? '' : 'none';
  if (secretInput) secretInput.value = state.secret || '';
  if (uriInput) uriInput.value = state.otpauthUri || '';

  adminRecoveryCodes = Array.isArray(state.recoveryCodes) ? state.recoveryCodes.slice() : adminRecoveryCodes;
  const hasFreshCodes = adminRecoveryCodes.length > 0;
  if (recoveryCodes) {
    recoveryCodes.style.display = hasFreshCodes ? '' : 'none';
    recoveryCodes.textContent = hasFreshCodes ? adminRecoveryCodes.join('\n') : '';
  }
  if (copyBtn) copyBtn.style.display = hasFreshCodes ? '' : 'none';
  if (downloadBtn) downloadBtn.style.display = hasFreshCodes ? '' : 'none';
  if (regenBtn) regenBtn.style.display = state.enabled ? '' : 'none';
  if (recoveryMsg) {
    const generatedAtText = adminTwofaState.recoveryLastGeneratedAt
      ? ` Last regenerated: ${fmtDateTime(adminTwofaState.recoveryLastGeneratedAt)}.`
      : '';
    recoveryMsg.textContent = hasFreshCodes
      ? `Save these backup codes now. Each code works once. They will not be shown again.${generatedAtText}`
      : `Unused backup codes remaining: ${adminTwofaState.recoveryRemaining}.${generatedAtText}`;
  }

  renderAdminTwofaTopbarBadge();
  renderTwofaQr(state.otpauthUri || '', state.setupPending);
}

function renderTwofaQr(otpauthUri, setupPending) {
  const canvas = document.getElementById('twofaQrCanvas');
  const wrap = document.getElementById('twofaQrWrap');
  if (!canvas || !wrap) return;
  const existingFallback = document.getElementById('twofaQrFallback');

  if (!setupPending || !otpauthUri) {
    canvas.style.display = '';
    if (existingFallback) existingFallback.remove();
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    return;
  }

  if (typeof QRCode === 'undefined') {
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#475569';
      ctx.font = '12px sans-serif';
      ctx.fillText('Loading QR library...', 36, 98);
    }
    ensureQrLibraryLoaded().then((ok) => {
      if (ok) renderTwofaQr(otpauthUri, setupPending);
    });
    return;
  }

  if (typeof QRCode !== 'undefined' && QRCode && typeof QRCode.toCanvas === 'function') {
    canvas.style.display = '';
    if (existingFallback) existingFallback.remove();
    QRCode.toCanvas(canvas, otpauthUri, { width: 180, margin: 1 }, () => {});
    return;
  }

  if (typeof QRCode === 'function') {
    canvas.style.display = 'none';
    if (existingFallback) existingFallback.remove();
    const holder = document.createElement('div');
    holder.id = 'twofaQrFallback';
    wrap.appendChild(holder);
    try {
      // QRCode.CorrectLevel.M === 0 (falsy) — always use H (=2) so we never accidentally
      // pass undefined and override the default, which causes a "Too long data" throw.
      const level = (QRCode.CorrectLevel && QRCode.CorrectLevel.H) || 2;
      new QRCode(holder, { text: otpauthUri, width: 180, height: 180, correctLevel: level });
    } catch (err) {
      holder.style.cssText = 'font-size:11px;word-break:break-all;padding:8px;color:#475569;max-width:180px';
      holder.textContent = 'QR render failed. Copy the URI above into any QR generator.';
    }
    return;
  }

  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  canvas.style.display = '';
  if (existingFallback) existingFallback.remove();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#475569';
  ctx.font = '12px sans-serif';
  ctx.fillText('QR library failed to load.', 20, 85);
  ctx.fillText('Use Setup URI below.', 38, 105);
}

function renderAdminTwofaTopbarBadge() {
  const badge = document.getElementById('topbarTwofaBadge');
  if (!badge) return;
  badge.style.display = adminTwofaState.enabled ? '' : 'none';
}

async function postTwofaAction(payload) {
  if (!HMS.getCsrfToken()) {
    await HMS.refreshSessionState();
  }

  const send = async () => fetch('api/twofa.php', {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': HMS.getCsrfToken() || '',
    },
    body: JSON.stringify(payload),
  });

  let res = await send();
  let data = await res.json().catch(() => ({}));

  if (!res.ok && res.status === 403 && String(data.error || '').toLowerCase().includes('csrf')) {
    const refreshed = await HMS.refreshSessionState();
    if (!refreshed) {
      return { success: false, error: 'Session expired. Please login again.' };
    }
    res = await send();
    data = await res.json().catch(() => ({}));
  }

  return data;
}

async function loadAdminTwofaStatus(silent = false) {
  let data;
  try {
    const res = await fetch('api/twofa.php', { credentials: 'same-origin' });
    data = await res.json();
  } catch (e) {
    if (!silent) notify('Unable to load 2FA settings right now', 'error');
    return;
  }

  if (!data.success) {
    if (!silent) notify(data.error || 'Unable to read 2FA status', 'error');
    return;
  }

  const message = data.enabled
    ? `2FA is enabled. Backup codes remaining: ${data.recoveryRemaining ?? 0}.`
    : (data.setupPending
      ? 'Setup in progress. Add the secret to your authenticator app and confirm using a 6-digit code.'
      : '2FA is currently disabled. You can begin setup to protect this admin account.');

  adminRecoveryCodes = [];

  setAdminTwofaUi({
    enabled: !!data.enabled,
    setupPending: !!data.setupPending,
    recoveryRemaining: Number(data.recoveryRemaining || 0),
    recoveryLastGeneratedAt: data.recoveryLastGeneratedAt || null,
    recoveryCodes: [],
    secret: data.secret || '',
    otpauthUri: data.otpauthUri || '',
    message,
  });
}

async function openAdminTwofaModal() {
  openModal('adminTwofaModal');
  adminRecoveryCodes = [];
  setAdminTwofaUi({ enabled: false, setupPending: false, message: 'Checking 2FA status...' });
  await HMS.refreshSessionState();
  loadAdminTwofaStatus();
}

async function beginAdminTwofaSetup() {
  try {
    const data = await postTwofaAction({ action: 'begin_setup' });
    if (!data.success) {
      notify(data.error || 'Unable to start 2FA setup', 'error');
      return;
    }
    setAdminTwofaUi({
      enabled: false,
      setupPending: true,
      secret: data.secret || '',
      otpauthUri: data.otpauthUri || '',
      message: 'Setup started. Save this secret in your authenticator app, then verify with a 6-digit code.',
    });
    notify('2FA setup started', 'success');
  } catch (e) {
    notify('Unable to start 2FA setup', 'error');
  }
}

async function cancelAdminTwofaSetup() {
  try {
    const data = await postTwofaAction({ action: 'cancel_setup' });
    if (!data.success) {
      notify(data.error || 'Unable to cancel setup', 'error');
      return;
    }
    notify('2FA setup cancelled', 'info');
    await loadAdminTwofaStatus();
  } catch (e) {
    notify('Unable to cancel setup', 'error');
  }
}

async function confirmAdminTwofaSetup() {
  const otp = (document.getElementById('twofaSetupOtp')?.value || '').replace(/\D/g, '');
  if (!/^\d{6}$/.test(otp)) {
    notify('Enter a valid 6-digit code', 'error');
    return;
  }

  try {
    const data = await postTwofaAction({ action: 'confirm_setup', otp });
    if (!data.success) {
      notify(data.error || 'Unable to enable 2FA', 'error');
      return;
    }
    const setupOtpInput = document.getElementById('twofaSetupOtp');
    if (setupOtpInput) setupOtpInput.value = '';
    notify('2FA enabled for admin account', 'success');
    setAdminTwofaUi({
      enabled: true,
      setupPending: false,
      recoveryRemaining: Number(data.recoveryRemaining || 0),
      recoveryLastGeneratedAt: data.recoveryLastGeneratedAt || null,
      recoveryCodes: Array.isArray(data.recoveryCodes) ? data.recoveryCodes : [],
      secret: '',
      otpauthUri: '',
      message: `2FA enabled. Store these backup codes safely. Remaining: ${data.recoveryRemaining ?? 0}.`,
    });
  } catch (e) {
    notify('Unable to enable 2FA', 'error');
  }
}

async function regenerateAdminRecoveryCodes() {
  const otp = (document.getElementById('twofaDisableOtp')?.value || '').replace(/\D/g, '');
  if (!/^\d{6}$/.test(otp)) {
    notify('Enter your current 6-digit authenticator code first', 'error');
    return;
  }

  try {
    const data = await postTwofaAction({ action: 'regenerate_recovery', otp });
    if (!data.success) {
      notify(data.error || 'Unable to regenerate backup codes', 'error');
      return;
    }

    setAdminTwofaUi({
      enabled: true,
      setupPending: false,
      recoveryRemaining: Number(data.recoveryRemaining || 0),
      recoveryLastGeneratedAt: data.recoveryLastGeneratedAt || null,
      recoveryCodes: Array.isArray(data.recoveryCodes) ? data.recoveryCodes : [],
      secret: '',
      otpauthUri: '',
      message: 'Backup codes regenerated. Save the new set now; old codes are invalid.',
    });
    notify('Backup codes regenerated', 'success');
  } catch (e) {
    notify('Unable to regenerate backup codes', 'error');
  }
}

async function copyAdminRecoveryCodes() {
  if (!adminRecoveryCodes.length) {
    notify('No backup codes to copy', 'warning');
    return;
  }
  try {
    await navigator.clipboard.writeText(adminRecoveryCodes.join('\n'));
    notify('Backup codes copied to clipboard', 'success');
  } catch (e) {
    notify('Clipboard copy failed. Use Download Codes.', 'warning');
  }
}

function downloadAdminRecoveryCodes() {
  if (!adminRecoveryCodes.length) {
    notify('No backup codes to download', 'warning');
    return;
  }
  const content = `AVM Hostel Admin Recovery Codes\nGenerated: ${new Date().toISOString()}\n\n${adminRecoveryCodes.join('\n')}\n\nEach code can be used once.`;
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'avm-admin-recovery-codes.txt';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

async function disableAdminTwofa() {
  const otp = (document.getElementById('twofaDisableOtp')?.value || '').replace(/\D/g, '');
  if (!/^\d{6}$/.test(otp)) {
    notify('Enter a valid 6-digit code', 'error');
    return;
  }

  try {
    const data = await postTwofaAction({ action: 'disable', otp });
    if (!data.success) {
      notify(data.error || 'Unable to disable 2FA', 'error');
      return;
    }
    const disableOtpInput = document.getElementById('twofaDisableOtp');
    if (disableOtpInput) disableOtpInput.value = '';
    adminRecoveryCodes = [];
    notify('2FA disabled for admin account', 'warning');
    await loadAdminTwofaStatus();
  } catch (e) {
    notify('Unable to disable 2FA', 'error');
  }
}

function renderAdminStats() {
  const rooms = HMS.get('rooms');
  const students = HMS.where('users', u => u.role === 'student');
  const requestsAll = HMS.get('requests') || [];
  const payments = HMS.get('payments');
  const requests = HMS.where('requests', r => r.status === 'pending');
  const curMonth = new Date().toISOString().slice(0, 7); // e.g. "2026-05"
  const monthlyRev = payments.filter(p => p.status==='paid' && p.date?.startsWith(curMonth)).reduce((s,p) => s+p.amount, 0);
  const occupied = rooms.filter(r => r.status === 'occupied' || r.status === 'partial').length;
  const pendingPayAmt = payments.filter(p=>p.status==='pending').reduce((s,p)=>s+p.amount,0);

  const totalBeds = rooms.reduce((sum, room) => sum + (Number(room.beds) || 0), 0);
  const occupiedBeds = students.filter(s => !!s.roomId).length;
  const occupancyPct = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

  const openIssues = requestsAll.filter(r => {
    const status = String(r.status || '').toLowerCase();
    return !status || status === 'pending';
  });
  const issueTypeCount = openIssues.reduce((map, r) => {
    const type = String(r.type || 'General').trim() || 'General';
    map[type] = (map[type] || 0) + 1;
    return map;
  }, {});
  let topIssueLabel = 'No open issues';
  let topIssueCount = 0;
  Object.entries(issueTypeCount).forEach(([type, count]) => {
    if (count > topIssueCount) {
      topIssueLabel = type;
      topIssueCount = count;
    }
  });

  set('statTotalRooms', rooms.length);
  set('statOccupied', `${occupied}/${rooms.length}`);
  set('statStudents', students.length);
  set('statMonthRevenue', fmtCurrency(monthlyRev));
  set('statPendingReqs', requests.length);
  set('statPendingPay', fmtCurrency(pendingPayAmt));

  // Demo-ready owner KPI strip
  set('ownerKpiCollected', fmtCurrency(monthlyRev));
  set('ownerKpiPendingDues', fmtCurrency(pendingPayAmt));
  set('ownerKpiOccupancyPct', `${occupancyPct}%`);
  set('ownerKpiTopIssue', topIssueCount > 0 ? `${topIssueLabel} (${topIssueCount})` : topIssueLabel);
  set('ownerKpiUpdatedAt', `Updated ${new Date().toLocaleString('en-IN', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' })}`);

  // Sales-oriented KPIs: aged dues and complaint resolution SLA.
  const nowTs = Date.now();
  const msInDay = 24 * 60 * 60 * 1000;
  const duesAgingAmt = payments
    .filter(p => p.status === 'pending' && p.date)
    .filter(p => {
      const ts = new Date(p.date).getTime();
      return Number.isFinite(ts) && (nowTs - ts) / msInDay > 30;
    })
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  set('statDuesAging', fmtCurrency(duesAgingAmt));

  const resolvedRequests = HMS.where('requests', r =>
    (r.status === 'resolved' || r.status === 'approved' || r.status === 'rejected') &&
    r.date &&
    r.resolvedAt
  );
  let avgResolutionHours = null;
  if (resolvedRequests.length) {
    const totalHours = resolvedRequests.reduce((sum, r) => {
      const created = new Date(r.date).getTime();
      const resolved = new Date(r.resolvedAt).getTime();
      if (!Number.isFinite(created) || !Number.isFinite(resolved) || resolved < created) return sum;
      return sum + ((resolved - created) / (1000 * 60 * 60));
    }, 0);
    avgResolutionHours = totalHours / resolvedRequests.length;
  }
  set('statComplaintSla', avgResolutionHours === null ? '-' : `${avgResolutionHours.toFixed(1)}h`);

  // Update sidebar badge
  const badge = document.getElementById('pendingReqBadge');
  if (badge) { badge.textContent = requests.length || ''; badge.style.display = requests.length ? '' : 'none'; }
  // Also sync analytics page stats
  set('statMonthRevenue2', fmtCurrency(monthlyRev));
  set('statOccupied2', `${occupied}/${rooms.length}`);
  set('statStudents2', students.length);
}

function printOwnerMonthlyReport() {
  const monthName = new Date().toLocaleString('en-IN', { month: 'long', year: 'numeric' });
  const collected = document.getElementById('ownerKpiCollected')?.textContent || '₹0';
  const dues = document.getElementById('ownerKpiPendingDues')?.textContent || '₹0';
  const occupancy = document.getElementById('ownerKpiOccupancyPct')?.textContent || '0%';
  const issue = document.getElementById('ownerKpiTopIssue')?.textContent || 'No open issues';

  const reportHtml = `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>AVM Monthly Owner Report</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 24px; color: #111827; }
    .header { border-bottom: 2px solid #4f46e5; padding-bottom: 12px; margin-bottom: 16px; }
    .title { font-size: 22px; font-weight: 700; }
    .sub { color: #6b7280; margin-top: 4px; }
    .meta { margin-top: 8px; font-size: 13px; color: #374151; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 16px; }
    .card { border: 1px solid #d1d5db; border-radius: 10px; padding: 12px; }
    .label { font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.4px; }
    .value { font-size: 20px; font-weight: 700; margin-top: 6px; }
    .footer { margin-top: 22px; font-size: 12px; color: #6b7280; }
  </style>
</head>
<body>
  <div class="header">
    <div class="title">AVM Hostel - Monthly Owner Report</div>
    <div class="sub">Business snapshot for ${monthName}</div>
    <div class="meta">Generated: ${new Date().toLocaleString('en-IN')}</div>
  </div>
  <div class="grid">
    <div class="card"><div class="label">Collected This Month</div><div class="value">${collected}</div></div>
    <div class="card"><div class="label">Pending Dues</div><div class="value">${dues}</div></div>
    <div class="card"><div class="label">Occupancy</div><div class="value">${occupancy}</div></div>
    <div class="card"><div class="label">Top Issue</div><div class="value">${issue}</div></div>
  </div>
  <div class="footer">Tip: use browser Save as PDF in the print dialog for a shareable report.</div>
</body>
</html>`;

  const w = window.open('', '_blank', 'width=900,height=700');
  if (!w) {
    notify('Popup blocked. Please allow popups to print report.', 'warning');
    return;
  }
  w.document.open();
  w.document.write(reportHtml);
  w.document.close();
  w.focus();
  setTimeout(() => w.print(), 250);
}

function renderAdminRooms() {
  const statusFilter = document.getElementById('roomStatusFilter')?.value || '';
  // Sort rooms alphabetically by room number so they always appear in A→Z order
  let rooms = HMS.get('rooms').slice().sort((a, b) => (a.number || '').localeCompare(b.number || '', undefined, { numeric: true }));
  if (statusFilter) rooms = rooms.filter(r => r.status === statusFilter);
  const container = document.getElementById('roomsContainer');
  if (!container) return;
  container.innerHTML = rooms.map(r => {
    const occupants = HMS.where('users', u => u.role === 'student' && u.roomId === r.id);
    const actualOccupied = occupants.length;
    const pct = r.beds > 0 ? Math.round((actualOccupied / r.beds) * 100) : 0;
    const color = pct === 100 ? 'red' : pct > 50 ? 'orange' : 'green';
    const statusBadge = { occupied:'badge-danger', partial:'badge-warning', available:'badge-success', maintenance:'badge-secondary' }[r.status] || 'badge-secondary';
    const amenities = (r.amenities||[]).map(a => `<span class="amenity-tag">${a}</span>`).join('');
    return `<div class="room-card">
      <div class="room-card-header">
        <div class="room-card-top">
          <div><div class="room-card-number">${r.number}</div><div class="room-card-type">${r.type} · ${r.floor}</div></div>
          <div class="text-right"><div class="room-card-rent">${fmtCurrency(r.rent)}</div><div class="room-card-rent-label">/month</div></div>
        </div>
      </div>
      <div class="room-card-body">
        <div class="room-info-row"><span>Beds</span><strong>${r.beds}</strong></div>
        <div class="room-info-row"><span>Occupied</span><strong>${actualOccupied}/${r.beds}</strong></div>
        <div class="room-info-row"><span>Bathroom</span><strong>${r.bathrooms}</strong></div>
        <div class="room-info-row"><span>Status</span><span class="badge ${statusBadge}">${r.status}</span></div>
        <div class="room-occupancy">
          <div class="occupancy-text"><span>Occupancy</span><span>${pct}%</span></div>
          <div class="progress-bar"><div class="progress-fill ${color}" style="width:${pct}%"></div></div>
        </div>
        ${amenities ? `<div class="room-amenities">${amenities}</div>` : ''}
      </div>
      <div class="room-card-footer">
        <button class="btn btn-sm btn-outline" onclick="openEditRoom('${r.id}')"><svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>Edit</button>
        <button class="btn btn-sm btn-secondary" onclick="deleteRoom('${r.id}')"><svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>Delete</button>
      </div>
    </div>`;
  }).join('');
}

function renderAdminStudents() {
  let students = HMS.where('users', u => u.role === 'student');
  // Apply check-in date range filter if set
  const fromEl = document.getElementById('stuDateFrom');
  const toEl = document.getElementById('stuDateTo');
  const from = fromEl ? fromEl.value : '';
  const to = toEl ? toEl.value : '';
  if (from || to) {
    students = students.filter(s => {
      const booking = HMS.where('bookings', b => b.studentId === s.id && b.status === 'active')[0];
      const checkIn = booking ? booking.checkIn : '';
      if (!checkIn) return false;
      if (from && checkIn < from) return false;
      if (to && checkIn > to) return false;
      return true;
    });
  }
  const { col, dir } = adminSortState.students;
  students = [...students].sort((a, b) => {
    let va = '', vb = '';
    if (col === 'id') { va = a.studentId || ''; vb = b.studentId || ''; }
    else if (col === 'name') { va = a.name || ''; vb = b.name || ''; }
    else if (col === 'room') {
      va = a.roomId ? (HMS.findById('rooms', a.roomId)?.number || '') : '';
      vb = b.roomId ? (HMS.findById('rooms', b.roomId)?.number || '') : '';
    }
    return dir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
  });
  const tbody = document.getElementById('studentsBody');
  if (!tbody) return;
  tbody.innerHTML = students.length ? students.map(s => {
    const room = s.roomId ? HMS.findById('rooms', s.roomId) : null;
    const booking = HMS.where('bookings', b => b.studentId === s.id && b.status === 'active')[0];
    const cl = avatarColor(s.name);
    // CHANGED: STATUS column now reads s.status (active/inactive) instead of booking status.
    //          Deactivate/Activate button added to Actions column — calls toggleStudentStatus().
    const isActive = (s.status || 'active') === 'active';
    return `<tr>
      <td>${s.studentId || '-'}</td>
      <td><div class="td-name"><div class="avatar ${cl} sm">${avatarLetter(s.name)}</div><div><div class="fw-600">${s.name || '-'}</div><div class="td-sub">${s.email || ''}</div></div></div></td>
      <td>${s.phone || '-'}</td>
      <td>${room ? room.number : '<span class="text-muted">Not assigned</span>'}</td>
      <td>${s.course || '-'}</td>
      <td><span class="badge ${isActive ? 'badge-success' : 'badge-secondary'}">${isActive ? 'Active' : 'Inactive'}</span></td>
      <td class="actions-cell">
        <div class="btn-group">
          <button class="btn btn-sm btn-outline" onclick="viewStudent('${s.id}')">View</button>
          <button class="btn btn-sm btn-secondary" onclick="editStudent('${s.id}')">Edit</button>
          <button class="btn btn-sm ${isActive ? 'btn-warning' : 'btn-success'}" onclick="toggleStudentStatus('${s.id}')" title="${isActive ? 'Set Inactive' : 'Set Active'}">${isActive ? 'Deactivate' : 'Activate'}</button>
          <button class="btn btn-sm btn-danger" onclick="deleteStudent('${s.id}')">Remove</button>
        </div>
      </td></tr>`;
  }).join('') : '<tr><td colspan="7" class="text-center text-muted" style="padding:24px">No students found</td></tr>';
}

function renderAdminRequests() {
  const requests = HMS.get('requests');
  const tbody = document.getElementById('requestsAdminBody');
  if (!tbody) return;
  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const badge = document.getElementById('adminReqBadge');
  if (badge) { badge.textContent = pendingCount || ''; badge.style.display = pendingCount ? '' : 'none'; }
  tbody.innerHTML = requests.length ? [...requests].reverse().map(r => {
    const student = HMS.findById('users', r.studentId);
    const cls = r.status==='resolved'||r.status==='approved' ? 'badge-success' : r.status==='rejected' ? 'badge-danger' : 'badge-warning';
    const canRespond = r.status === 'pending' || r.status === 'approved';
    return `<tr>
      <td style="font-size:11px;color:var(--text-2)">#${escHtml(r.id?.slice(-6)||'-')}</td>
      <td><div class="fw-600">${escHtml(student?.name||'Unknown')}</div><div style="font-size:11px;color:var(--text-2)">${escHtml(student?.studentId||'')}</div></td>
      <td><span class="badge badge-secondary" style="font-size:11px">${escHtml(r.type||'General')}</span></td>
      <td style="max-width:220px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:13px" title="${escAttr(r.description||'')}">${escHtml(r.description||'-')}</td>
      <td style="font-size:12px">${r.date ? new Date(r.date).toLocaleDateString('en-IN') : '-'}</td>
      <td><span class="badge ${cls}">${escHtml(r.status||'pending')}</span></td>
      <td>${canRespond
        ? `<button class="btn btn-sm btn-primary" onclick="openAdminRespond('${escJs(r.id)}')">Respond</button>`
        : `<span style="font-size:12px;color:var(--text-2)">${escHtml(r.response||'—')}</span>`}
      </td></tr>`;
  }).join('') : '<tr><td colspan="7" class="text-center text-muted" style="padding:24px">No requests found</td></tr>';
}

function openAdminRespond(id) {
  const req = HMS.findById('requests', id);
  if (!req) return;
  const s = HMS.findById('users', req.studentId);
  setInput('adminRespondId', id);
  const info = document.getElementById('adminRespondInfo');
  if (info) info.innerHTML = `<strong>${escHtml(s?.name||'Unknown')}</strong> — <em>${escHtml(req.type||'General')}</em><br><span style="color:var(--text-2);margin-top:4px;display:block">${escHtml(req.description||'')}</span>`;
  const note = document.getElementById('adminRespondNote');
  if (note) note.value = req.response || '';
  openModal('adminRespondModal');
}

function adminActOnRequest(newStatus) {
  const id = document.getElementById('adminRespondId')?.value;
  const note = document.getElementById('adminRespondNote')?.value.trim() || '';
  if (!id) return;
  HMS.update('requests', id, {
    status: newStatus,
    response: note || (newStatus==='approved'?'Request approved.':newStatus==='rejected'?'Request rejected.':'Issue resolved.'),
    resolvedAt: new Date().toISOString(),
    resolvedBy: HMS.getSession()?.name || 'Admin'
  });
  closeModal('adminRespondModal');
  notify('Request ' + newStatus + ' successfully', newStatus==='rejected'?'warning':'success');
  renderAdminRequests(); renderAdminStats();
  renderAdminActivity();
  if (typeof populateQuickRequests === 'function') populateQuickRequests();
}

function renderAdminPayments() {
  let payments = HMS.get('payments');
  const { col, dir } = adminSortState.payments;
  // Apply date range filter if set
  const fromEl = document.getElementById('payDateFrom');
  const toEl = document.getElementById('payDateTo');
  const from = fromEl ? fromEl.value : '';
  const to = toEl ? toEl.value : '';
  if (from) payments = payments.filter(p => p.date && p.date >= from);
  if (to)   payments = payments.filter(p => p.date && p.date <= to);
  // FIX: Use direct < > comparison for date sort — locale-safe for YYYY-MM-DD on all Windows locales.
  payments = [...payments].sort((a, b) => {
    if (col === 'date') {
      const da = a.date || '', db = b.date || '';
      return dir === 'asc' ? (da < db ? -1 : da > db ? 1 : 0) : (db < da ? -1 : db > da ? 1 : 0);
    }
    let va = '', vb = '';
    if (col === 'name') {
      va = HMS.findById('users', a.studentId)?.name || '';
      vb = HMS.findById('users', b.studentId)?.name || '';
    } else if (col === 'id') {
      va = HMS.findById('users', a.studentId)?.studentId || '';
      vb = HMS.findById('users', b.studentId)?.studentId || '';
    }
    return dir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
  });
  const tbody = document.getElementById('paymentsAdminBody');
  if (!tbody) return;
  tbody.innerHTML = payments.length ? payments.map(p => {
    const student = HMS.findById('users', p.studentId);
    return `<tr>
      <td>${p.txnId || '-'}</td>
      <td>${student?.name || '-'}</td>
      <td>${student?.studentId || p.studentSid || '-'}</td>
      <td>${p.type}</td>
      <td>${fmtCurrency(p.amount)}</td>
      <td>${p.method || '-'}</td>
      <td>${fmtDate(p.date)}</td>
      <td><span class="badge ${p.status==='paid'?'badge-success':'badge-warning'}">${p.status}</span></td>
    </tr>`;
  }).join('') : '<tr><td colspan="8" class="text-center text-muted" style="padding:24px">No payments</td></tr>';
}

function renderAdminActivity() {
  const container = document.getElementById('activityFeed');
  if (!container) return;
  const usersById = new Map(HMS.get('users').map(u => [u.id, u]));
  const rows = [];

  const humanTime = (ts) => {
    if (!Number.isFinite(ts) || ts <= 0) return '-';
    const diff = Math.max(0, Date.now() - ts);
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins} minute${mins === 1 ? '' : 's'} ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} hour${hrs === 1 ? '' : 's'} ago`;
    const days = Math.floor(hrs / 24);
    if (days === 1) return 'Yesterday';
    return `${days} days ago`;
  };

  HMS.get('payments').forEach(p => {
    if (p.status !== 'paid') return;
    const ts = Date.parse(p.collectedAt || p.date || '');
    const student = usersById.get(p.studentId);
    rows.push({
      ts: Number.isFinite(ts) ? ts : 0,
      color: 'green',
      text: `${student?.name || p.studentName || 'Student'} made payment of ${fmtCurrency(p.amount)} via ${p.method || 'online'}`,
    });
  });

  HMS.get('requests').forEach(r => {
    const student = usersById.get(r.studentId);
    const submittedTs = Date.parse(r.date || '');
    rows.push({
      ts: Number.isFinite(submittedTs) ? submittedTs : 0,
      color: 'blue',
      text: `New request submitted by ${student?.name || 'Student'}: ${r.type || 'General'}`,
    });

    if (['resolved', 'approved', 'rejected'].includes(String(r.status || '').toLowerCase())) {
      const resolvedTs = Date.parse(r.resolvedAt || r.date || '');
      rows.push({
        ts: Number.isFinite(resolvedTs) ? resolvedTs : 0,
        color: r.status === 'rejected' ? 'red' : 'purple',
        text: `${student?.name || 'Student'} request ${r.status}${r.type ? `: ${r.type}` : ''}`,
      });
    }
  });

  HMS.get('visitors').forEach(v => {
    const ts = Date.parse(v.checkIn || '');
    const student = usersById.get(v.studentId);
    rows.push({
      ts: Number.isFinite(ts) ? ts : 0,
      color: 'orange',
      text: `Visitor ${v.name || 'Guest'} checked in for ${student?.name || 'student'}`,
    });
  });

  const activities = rows
    .filter(a => a.ts > 0)
    .sort((a, b) => b.ts - a.ts);

  if (!activities.length) {
    container.innerHTML = '<div class="text-muted text-sm">No recent activity</div>';
    return;
  }

  container.innerHTML = activities.map(a =>
    `<div class="activity-item"><div class="activity-dot ${escAttr(a.color)}"></div><div class="activity-body"><div class="activity-text">${escHtml(a.text)}</div><div class="activity-time">${escHtml(humanTime(a.ts))}</div></div></div>`
  ).join('');
}

function renderNoticesAdmin() {
  const notices = HMS.get('notices');
  const container = document.getElementById('noticesAdminList');
  if (!container) return;
  container.innerHTML = notices.length ? [...notices].reverse().map(n =>
    `<div class="notice-item ${escAttr(n.type)}">
      <div class="notice-title">${escHtml(n.title)}
        <button class="btn btn-sm btn-ghost" style="margin-left:8px" onclick="deleteNotice('${escJs(n.id)}')"><svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="13" height="13"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg></button>
      </div>
      <div class="notice-body">${escHtml(n.body)}</div>
      <div class="notice-meta">Posted by ${escHtml(n.author)} · ${escHtml(fmtDate(n.date))}</div>
    </div>`
  ).join('') : '<p class="text-muted text-sm">No notices posted yet</p>';
}

// Admin CRUD
function addRoom(e) {
  e.preventDefault();
  const amenities = document.getElementById('roomAmenities').value.split(',').map(a=>a.trim()).filter(Boolean);
  const newRoom = {
    id: HMS.genId(), number: document.getElementById('roomNumber').value,
    floor: document.getElementById('roomFloor').value, type: document.getElementById('roomType').value,
    beds: Number(document.getElementById('roomBeds').value), occupied: 0,
    bathrooms: document.getElementById('roomBath').value,
    rent: Number(document.getElementById('roomRent').value),
    status: 'available', amenities
  };
  HMS.add('rooms', newRoom);
  notify('Room added successfully', 'success');
  closeModal('addRoomModal');
  e.target.reset();
  renderAdminRooms(); renderAdminStats();
}

function openEditRoom(id) {
  const r = HMS.findById('rooms', id);
  if (!r) return;
  setInput('editRoomId', r.id); setInput('editRoomNumber', r.number);
  setInput('editRoomFloor', r.floor); setInput('editRoomType', r.type);
  setInput('editRoomBeds', r.beds); setInput('editRoomBath', r.bathrooms);
  setInput('editRoomRent', r.rent); setInput('editRoomStatus', r.status);
  setInput('editRoomAmenities', r.amenities.join(', '));
  // Populate current occupants
  const occupants = HMS.where('users', u => u.role === 'student' && u.roomId === id);
  const container = document.getElementById('editRoomOccupants');
  if (container) {
    if (occupants.length) {
      container.innerHTML = `<div class="form-label-d" style="margin-bottom:8px">Current Occupants (${occupants.length}/${r.beds})</div>` +
        occupants.map(s => {
          const cl = avatarColor(s.name);
          const booking = HMS.where('bookings', b => b.studentId === s.id && b.status === 'active')[0];
          return `<div class="occupant-row">
            <div class="td-name">
              <div class="avatar ${cl} sm">${avatarLetter(s.name)}</div>
              <div>
                <div class="fw-600">${s.name} <span class="text-muted text-sm">(${s.studentId||'-'})</span></div>
                <div class="td-sub">Check-in: ${booking ? fmtDate(booking.checkIn) : '-'}</div>
              </div>
            </div>
          </div>`;
        }).join('');
    } else {
      container.innerHTML = '<div class="text-muted text-sm" style="padding:8px 0">No students currently assigned to this room.</div>';
    }
  }
  openModal('editRoomModal');
}

function saveRoom(e) {
  e.preventDefault();
  const id = document.getElementById('editRoomId').value;
  const amenities = document.getElementById('editRoomAmenities').value.split(',').map(a=>a.trim()).filter(Boolean);
  HMS.update('rooms', id, {
    number: document.getElementById('editRoomNumber').value,
    floor: document.getElementById('editRoomFloor').value,
    type: document.getElementById('editRoomType').value,
    beds: Number(document.getElementById('editRoomBeds').value),
    bathrooms: document.getElementById('editRoomBath').value,
    rent: Number(document.getElementById('editRoomRent').value),
    status: document.getElementById('editRoomStatus').value,
    amenities
  });
  notify('Room updated successfully', 'success');
  closeModal('editRoomModal');
  renderAdminRooms(); renderAdminStats();
}

function deleteRoom(id) {
  if (!confirm('Delete this room? This action cannot be undone.')) return;
  HMS.remove('rooms', id);
  notify('Room deleted', 'success');
  renderAdminRooms(); renderAdminStats();
}

function addStudent(e) {
  e.preventDefault();
  const roomId = document.getElementById('newStudentRoom').value;
  const username = document.getElementById('newStudentUser').value;
  const existing = HMS.where('users', u => u.username === username);
  if (existing.length) { notify('Username already exists', 'error'); return; }
  const newStudent = {
    id: HMS.genId(), username, password: document.getElementById('newStudentPass').value,
    role: 'student', name: document.getElementById('newStudentName').value,
    email: document.getElementById('newStudentEmail').value,
    phone: document.getElementById('newStudentPhone').value,
    studentId: 'STU' + String(HMS.where('users', u=>u.role==='student').length + 1).padStart(3,'0'),
    roomId, course: document.getElementById('newStudentCourse').value,
    year: document.getElementById('newStudentYear').value,
    bloodGroup: '', emergencyContact: '', fatherName: '', address: ''
  };
  HMS.add('users', newStudent);
  if (roomId) {
    const room = HMS.findById('rooms', roomId);
    if (room) {
      const newOccupied = Math.min(room.occupied + 1, room.beds);
      HMS.update('rooms', roomId, { occupied: newOccupied, status: newOccupied >= room.beds ? 'occupied' : 'partial' });
      const bookingId = HMS.genId();
      HMS.add('bookings', { id: bookingId, studentId: newStudent.id, roomId, checkIn: today(), checkOut: '', amount: room.rent, status: 'active' });
      // FIX: Automatically create a pending payment for the current month when a room is assigned.
      // Without this, new students showed ₹0 dues even though they had an active booking.
      const monthStart = today().slice(0, 7) + '-01';
      HMS.add('payments', { id: HMS.genPaymentId(), bookingId, studentId: newStudent.id, amount: room.rent, method: '', date: monthStart, status: 'pending', type: 'Monthly Rent', txnId: '' });
    }
  }
  notify('Student added successfully', 'success');
  closeModal('addStudentModal');
  e.target.reset(); populateRoomDropdowns();
  renderAdminStudents(); renderAdminStats(); renderAdminRooms();
}

// REWRITTEN: viewStudent() now shows a rich two-column modal:
//   - Header: avatar, name, studentId · course · email, Active/Inactive badge
//   - Left column: Personal Info (phone, blood group, emergency, father, check-in, address)
//   - Right column: Room & Payments (room, rent from room.rent, total paid, pending, year)
//   - Footer: Edit Student button + Set Inactive/Set Active toggle button
//   - BUG FIX: was using room.price (always ₹0) — now correctly uses room.rent
function viewStudent(id) {
  const s = HMS.findById('users', id);
  if (!s) return;
  const room = s.roomId ? HMS.findById('rooms', s.roomId) : null;
  const booking = HMS.where('bookings', b => b.studentId === id && b.status === 'active')[0];
  const payments = HMS.where('payments', p => p.studentId === id);
  const totalPaid = payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + Number(p.amount), 0);
  const pendingAmt = payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + Number(p.amount), 0);
  const isActive = (s.status || 'active') === 'active';
  const body = document.getElementById('viewStudentBody');
  if (body) body.innerHTML = `
    <div style="display:flex;align-items:center;gap:18px;margin-bottom:20px;padding-bottom:18px;border-bottom:1px solid var(--border)">
      <div style="width:64px;height:64px;border-radius:50%;background:${avatarColor(s.name)};display:flex;align-items:center;justify-content:center;font-size:24px;color:#fff;font-weight:700;flex-shrink:0">${avatarLetter(s.name)}</div>
      <div style="flex:1">
        <div style="font-size:20px;font-weight:700">${s.name}</div>
        <div style="font-size:13px;color:var(--text-2);margin-top:2px">${[s.studentId, s.course, s.email].filter(Boolean).join(' · ')}</div>
        <div style="margin-top:6px;display:flex;gap:8px;align-items:center">
          <span class="badge ${isActive ? 'badge-success' : 'badge-secondary'}">${isActive ? 'Active' : 'Inactive'}</span>
          ${booking ? '<span class="badge badge-info" style="font-size:10px">Booking Active</span>' : ''}
        </div>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:18px">
      <div>
        <div style="font-size:11px;font-weight:600;text-transform:uppercase;color:var(--text-2);margin-bottom:8px">Personal Info</div>
        <table style="width:100%;font-size:13px"><tbody>
          <tr><td style="color:var(--text-2);padding:4px 0;width:45%">Phone</td><td>${s.phone || '—'}</td></tr>
          <tr><td style="color:var(--text-2);padding:4px 0">Blood Group</td><td>${s.bloodGroup || '—'}</td></tr>
          <tr><td style="color:var(--text-2);padding:4px 0">Emergency</td><td>${s.emergencyContact || '—'}</td></tr>
          <tr><td style="color:var(--text-2);padding:4px 0">Father</td><td>${s.fatherName || '—'}</td></tr>
          <tr><td style="color:var(--text-2);padding:4px 0">Check-In</td><td>${booking ? fmtDate(booking.checkIn) : '—'}</td></tr>
          <tr><td style="color:var(--text-2);padding:4px 0">Address</td><td style="font-size:12px">${s.address || '—'}</td></tr>
        </tbody></table>
      </div>
      <div>
        <div style="font-size:11px;font-weight:600;text-transform:uppercase;color:var(--text-2);margin-bottom:8px">Room & Payments</div>
        <table style="width:100%;font-size:13px"><tbody>
          <tr><td style="color:var(--text-2);padding:4px 0;width:45%">Room</td><td>${room ? room.number + ' (' + room.type + ')' : '—'}</td></tr>
          <tr><td style="color:var(--text-2);padding:4px 0">Rent</td><td>${room ? fmtCurrency(room.rent || 0) + '/mo' : '—'}</td></tr>
          <tr><td style="color:var(--text-2);padding:4px 0">Total Paid</td><td style="color:var(--success);font-weight:600">${fmtCurrency(totalPaid)}</td></tr>
          <tr><td style="color:var(--text-2);padding:4px 0">Pending</td><td style="color:${pendingAmt > 0 ? 'var(--danger)' : 'var(--text-2)'};font-weight:${pendingAmt > 0 ? '600' : '400'}">${fmtCurrency(pendingAmt)}</td></tr>
          <tr><td style="color:var(--text-2);padding:4px 0">Year</td><td>${s.year || '—'}</td></tr>
        </tbody></table>
      </div>
    </div>
    <div style="margin-top:18px;padding-top:14px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end">
      <button class="btn btn-secondary" onclick="closeModal('viewStudentModal');editStudent('${s.id}')">Edit Student</button>
      <button class="btn ${isActive ? 'btn-danger' : 'btn-success'}" onclick="toggleStudentStatus('${s.id}')">
        ${isActive ? 'Set Inactive' : 'Set Active'}
      </button>
    </div>
  `;
  openModal('viewStudentModal');
}

// ADDED: toggleStudentStatus() — flips a student between active and inactive.
//   Writes the new status via HMS.update() which persists to DB through api/data.php.
//   Closes the profile modal and re-renders the students table so the badge updates immediately.
function toggleStudentStatus(id) {
  const s = HMS.findById('users', id);
  if (!s) return;
  const newStatus = (s.status || 'active') === 'active' ? 'inactive' : 'active';
  HMS.update('users', id, { status: newStatus });
  notify(`${s.name} marked as ${newStatus}`, newStatus === 'active' ? 'success' : 'warning');
  closeModal('viewStudentModal');
  renderAdminStudents();
}

function editStudent(id) {
  const s = HMS.findById('users', id);
  setInput('editStudentId', s.id); setInput('editStudentName', s.name);
  setInput('editStudentEmail', s.email); setInput('editStudentPhone', s.phone);
  setInput('editStudentCourse', s.course); setInput('editStudentYear', s.year);
  setInput('editStudentBlood', s.bloodGroup);
  // Clear password fields
  setInput('editStudentNewPass', ''); setInput('editStudentConfirmPass', '');
  const roomSel = document.getElementById('editStudentRoom');
  if (roomSel) {
    populateRoomDropdown(roomSel);
    roomSel.value = s.roomId || '';
  }
  openModal('editStudentModal');
}

// FIX: saveStudent now fully handles room changes — releases old room/booking, creates new booking,
// updates occupancy counts on both rooms, and creates a pending payment for the new room if needed.
function saveStudent(e) {
  e.preventDefault();
  const id = document.getElementById('editStudentId').value;
  const newRoomId = document.getElementById('editStudentRoom').value;
  const existing = HMS.findById('users', id);
  const oldRoomId = existing ? existing.roomId : '';
  const updates = {
    name: document.getElementById('editStudentName').value,
    email: document.getElementById('editStudentEmail').value,
    phone: document.getElementById('editStudentPhone').value,
    course: document.getElementById('editStudentCourse').value,
    year: document.getElementById('editStudentYear').value,
    bloodGroup: document.getElementById('editStudentBlood').value,
    roomId: newRoomId,
  };
  // Handle optional password change
  const newPass = (document.getElementById('editStudentNewPass')?.value || '').trim();
  const confirmPass = (document.getElementById('editStudentConfirmPass')?.value || '').trim();
  if (newPass) {
    if (newPass.length < 6) { notify('Password must be at least 6 characters', 'error'); return; }
    if (newPass !== confirmPass) { notify('Passwords do not match', 'error'); return; }
    updates.password = newPass;
  }
  HMS.update('users', id, updates);
  // Handle room assignment change
  if (newRoomId !== oldRoomId) {
    // Release old room
    if (oldRoomId) {
      const oldRoom = HMS.findById('rooms', oldRoomId);
      if (oldRoom) {
        const occ = Math.max(0, oldRoom.occupied - 1);
        HMS.update('rooms', oldRoomId, { occupied: occ, status: occ <= 0 ? 'available' : occ < oldRoom.beds ? 'partial' : 'occupied' });
      }
      // Close old active booking
      const oldBooking = HMS.where('bookings', b => b.studentId === id && b.status === 'active')[0];
      if (oldBooking) HMS.update('bookings', oldBooking.id, { status: 'inactive', checkOut: today() });
    }
    // Assign new room
    if (newRoomId) {
      const newRoom = HMS.findById('rooms', newRoomId);
      if (newRoom) {
        const newOcc = Math.min(newRoom.occupied + 1, newRoom.beds);
        HMS.update('rooms', newRoomId, { occupied: newOcc, status: newOcc >= newRoom.beds ? 'occupied' : 'partial' });
        const bookingId = HMS.genId();
        HMS.add('bookings', { id: bookingId, studentId: id, roomId: newRoomId, checkIn: today(), checkOut: '', amount: newRoom.rent, status: 'active' });
        // Create pending payment only if no existing pending payment for this student
        const hasPending = HMS.where('payments', p => p.studentId === id && p.status === 'pending').length > 0;
        if (!hasPending) {
          const monthStart = today().slice(0, 7) + '-01';
          HMS.add('payments', { id: HMS.genPaymentId(), bookingId, studentId: id, amount: newRoom.rent, method: '', date: monthStart, status: 'pending', type: 'Monthly Rent', txnId: '' });
        }
      }
    }
    renderAdminRooms();
  }
  // Clear password fields
  if (document.getElementById('editStudentNewPass')) document.getElementById('editStudentNewPass').value = '';
  if (document.getElementById('editStudentConfirmPass')) document.getElementById('editStudentConfirmPass').value = '';
  notify('Student updated successfully' + (newPass ? ' (password changed)' : ''), 'success');
  closeModal('editStudentModal');
  renderAdminStudents(); renderAdminStats();
}

function deleteStudent(id) {
  if (!confirm('Remove this student? All their records will remain in the system.')) return;
  const s = HMS.findById('users', id);
  if (s?.roomId) {
    const room = HMS.findById('rooms', s.roomId);
    if (room) HMS.update('rooms', s.roomId, { occupied: Math.max(0, room.occupied-1), status: room.occupied-1 <= 0 ? 'available' : room.occupied-1 < room.beds ? 'partial' : 'occupied' });
  }
  HMS.remove('users', id);
  notify('Student removed', 'success');
  renderAdminStudents(); renderAdminStats(); renderAdminRooms();
}

// respondRequest / resolveRequest kept for backward compatibility if called elsewhere
function respondRequest(id, status) {
  openAdminRespond(id);
}
function resolveRequest(id) {
  openAdminRespond(id);
}

function postNotice(e) {
  e.preventDefault();
  HMS.add('notices', {
    id: HMS.genId(),
    title: document.getElementById('noticeTitle').value,
    body: document.getElementById('noticeBody').value,
    type: document.getElementById('noticeType').value,
    date: today(), author: 'Admin'
  });
  notify('Notice posted successfully', 'success');
  closeModal('noticeModal');
  e.target.reset();
  renderNoticesAdmin();
}

function deleteNotice(id) {
  HMS.remove('notices', id);
  notify('Notice deleted', 'success');
  renderNoticesAdmin();
}

function populateRoomDropdowns() {
  const rooms = HMS.get('rooms');
  document.querySelectorAll('.room-dropdown').forEach(sel => populateRoomDropdown(sel, rooms));
}

function populateRoomDropdown(sel, rooms) {
  if (!rooms) rooms = HMS.get('rooms');
  // Sort alphabetically by room number so dropdown list is always in order
  rooms = rooms.slice().sort((a, b) => (a.number || '').localeCompare(b.number || '', undefined, { numeric: true }));
  sel.innerHTML = '<option value="">Select Room</option>' + rooms.map(r => {
    const free = r.beds - r.occupied;
    const full = free <= 0 || r.status === 'occupied';
    const label = full
      ? `${r.number} (${r.type}) – FULL – ${fmtCurrency(r.rent)}/mo`
      : `${r.number} (${r.type}) – ${free} bed${free > 1 ? 's' : ''} free – ${fmtCurrency(r.rent)}/mo`;
    return `<option value="${r.id}" ${full ? 'disabled style="color:var(--text-muted,#aaa)"' : ''}>${label}</option>`;
  }).join('');
}

// ===== CHARTS =====
const chartInstances = { revenue: null, occupancy: null, payStatus: null };

function destroyCharts() {
  Object.keys(chartInstances).forEach(key => {
    if (chartInstances[key]) {
      chartInstances[key].destroy();
      chartInstances[key] = null;
    }
  });
}

function initCharts() {
  if (typeof Chart === 'undefined') return;
  destroyCharts();
  
  const payments = HMS.get('payments').filter(p => p.status === 'paid');
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const revData = months.map((_, i) => {
    const m = String(i+1).padStart(2,'0');
    return payments.filter(p => p.date?.includes(`-${m}-`) || p.date?.includes(`-${m}-2025`)).reduce((s,p) => s+p.amount, 0);
  });

  const revenueCtx = document.getElementById('revenueChart');
  if (revenueCtx) {
    chartInstances.revenue = new Chart(revenueCtx, {
      type:'line',
      data:{ labels:months, datasets:[{ label:'Revenue (₹)', data:revData, borderColor:'#4338ca', backgroundColor:'rgba(67,56,202,0.08)', tension:0.4, fill:true, pointBackgroundColor:'#4338ca', pointRadius:4 }] },
      options:{ responsive:true, maintainAspectRatio:false, plugins:{ legend:{display:false} }, scales:{ y:{ beginAtZero:true, grid:{color:'#f1f5f9'}, ticks:{callback:v=>'₹'+Number(v).toLocaleString('en-IN')} }, x:{ grid:{display:false} } } }
    });
  }

  const rooms = HMS.get('rooms');
  const occCtx = document.getElementById('occupancyChart');
  if (occCtx) {
    const occ = rooms.filter(r=>r.status==='occupied').length;
    const part = rooms.filter(r=>r.status==='partial').length;
    const avail = rooms.filter(r=>r.status==='available').length;
    chartInstances.occupancy = new Chart(occCtx, {
      type:'doughnut',
      data:{ labels:['Occupied','Partial','Available'], datasets:[{ data:[occ,part,avail], backgroundColor:['#ef4444','#f59e0b','#10b981'], borderWidth:0, hoverOffset:4 }] },
      options:{ responsive:true, maintainAspectRatio:false, plugins:{ legend:{position:'bottom'} }, cutout:'65%' }
    });
  }

  const payStatusCtx = document.getElementById('payStatusChart');
  if (payStatusCtx) {
    const allPay = HMS.get('payments');
    const paid = allPay.filter(p=>p.status==='paid').length;
    const pend = allPay.filter(p=>p.status==='pending').length;
    chartInstances.payStatus = new Chart(payStatusCtx, {
      type:'bar',
      data:{ labels:['Paid','Pending'], datasets:[{ data:[paid,pend], backgroundColor:['#10b981','#f59e0b'], borderRadius:6, borderWidth:0 }] },
      options:{ responsive:true, maintainAspectRatio:false, plugins:{ legend:{display:false} }, scales:{ y:{beginAtZero:true,grid:{color:'#f1f5f9'}}, x:{grid:{display:false}} } }
    });
  }
}

// ===== RECEPTIONIST DASHBOARD =====
async function initReceptionistDashboard() {
  const session = await requireAuth('receptionist');
  if (!session) return;
  initSidebarUI();
  await HMS.refreshSessionState();
  initTopbar(session);
  initCustomFilterSelects();
  showPage('dashboard');
  await HMS.syncFromDB();
  reconcileRooms();
  renderReceptionistStats(); renderStudentsList(); renderRoomsList();
  renderVisitorsList(); renderAttendanceLog(); populateStudentDropdowns();
  // Render dashboard widgets defined in inline script (available after DOMContentLoaded)
  setTimeout(() => {
    if (typeof renderOutpassList === 'function') renderOutpassList();
    if (typeof renderRecRequests === 'function') renderRecRequests();
    if (typeof renderRecPayments === 'function') renderRecPayments();
    if (typeof renderRecNotices === 'function') renderRecNotices();
  }, 0);
}

function renderReceptionistStats() {
  const students = HMS.where('users', u => u.role === 'student');
  const attendance = HMS.where('attendance', a => a.date === today());
  const present = attendance.filter(a => a.status === 'present').length;
  const visitors = HMS.where('visitors', v => v.status === 'active');
  const pendingReqs = HMS.where('requests', r => r.status === 'pending').length;
  const activeOutpasses = (HMS.get('outpasses') || []).filter(op => op.status === 'active').length;

  set('recStatStudents', students.length);
  set('recStatPresent', present);
  set('recStatOut', students.length - present);
  set('recStatVisitors', visitors.length);
  set('recStatPendingReqs', pendingReqs);
  set('recStatOutpass', activeOutpasses);

  // Dashboard today's attendance widget
  const tbody = document.getElementById('attendanceBody');
  if (tbody) {
    const records = [...attendance].sort((a,b) => (b.checkIn||'').localeCompare(a.checkIn||''));
    tbody.innerHTML = records.length ? records.slice(0,8).map(a => {
      const s = HMS.findById('users', a.studentId);
      const room = s?.roomId ? HMS.findById('rooms', s.roomId) : null;
      const statusCls = a.status==='present'?'badge-success':a.status==='out-pass'?'badge-warning':a.status==='out'?'badge-secondary':'badge-secondary';
      return `<tr>
        <!-- FIX: td-sub always renders (never conditional) so all rows are same height; min-height:14px in CSS reserves space when studentId is empty -->
        <td><div class="td-name"><div class="avatar sm" style="background:${avatarColor(s?.name||'?')}">${avatarLetter(s?.name||'?')}</div><div><div class="fw-600" style="font-size:13px">${s?.name||'Unknown'}</div><div class="td-sub">${s?.studentId||''}</div></div></div></td>
        <td style="font-size:13px">${room?.number||'—'}</td>
        <td style="font-size:12px">${a.checkIn||'—'}</td>
        <td style="font-size:12px;color:${a.checkOut?'var(--danger)':'var(--text-3)'}">${a.checkOut||'—'}</td>
        <td><span class="badge ${statusCls}">${a.status}</span></td>
      </tr>`;
    }).join('') : '<tr><td colspan="5" class="text-center text-muted" style="padding:16px">No attendance records today</td></tr>';
  }

  // Dashboard active visitors widget
  const activeVisitorsBody = document.getElementById('activeVisitorsBody');
  if (activeVisitorsBody) {
    const recentActiveVisitors = [...visitors]
      .sort((a, b) => (b.checkIn || '').localeCompare(a.checkIn || ''))
      .slice(0, 5);

    activeVisitorsBody.innerHTML = recentActiveVisitors.length ? recentActiveVisitors.map(v => {
      const student = HMS.findById('users', v.studentId);
      return `<tr>
        <td>${v.name || '-'}</td>
        <td>${student?.name || '-'}</td>
        <td style="font-size:12px">${v.checkIn || '—'}</td>
        <td><button class="btn btn-sm btn-warning" onclick="checkoutVisitor('${v.id}')">Check Out</button></td>
      </tr>`;
    }).join('') : '<tr><td colspan="4" class="text-center text-muted" style="padding:12px">No active visitors</td></tr>';
  }
}

function renderStudentsList() {
  let students = HMS.where('users', u => u.role === 'student');
  // Apply sort
  const { col, dir } = recSortState.students;
  students = [...students].sort((a, b) => {
    let va = '', vb = '';
    if (col === 'id') { va = a.studentId || ''; vb = b.studentId || ''; }
    else if (col === 'room') {
      va = a.roomId ? (HMS.findById('rooms', a.roomId)?.number || '') : '';
      vb = b.roomId ? (HMS.findById('rooms', b.roomId)?.number || '') : '';
    } else { va = a.name || ''; vb = b.name || ''; }
    return dir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
  });
  const tbody = document.getElementById('studentsListBody');
  if (!tbody) return;
  tbody.innerHTML = students.map(s => {
    const room = s.roomId ? HMS.findById('rooms', s.roomId) : null;
    const att = HMS.where('attendance', a => a.studentId === s.id && a.date === today())[0];
    const present = att?.status === 'present';
    const pendingPay = HMS.where('payments', p => p.studentId === s.id && p.status === 'pending').length;
    const attStatus = att?.status || 'absent';
    const attCls = present ? 'badge-success' : attStatus === 'out-pass' ? 'badge-warning' : 'badge-secondary';
    return `<tr>
      <td style="font-size:11px;color:var(--text-2)">${s.studentId||'-'}</td>
      <td><div class="td-name"><div class="avatar sm" style="background:${avatarColor(s.name)}">${avatarLetter(s.name)}</div><div class="fw-600">${s.name}</div></div></td>
      <td>${room?room.number:'—'}</td>
      <td>${s.phone||'-'}</td>
      <td style="font-size:12px;color:var(--text-2)">${s.course||'-'}</td>
      <td>${pendingPay > 0 ? `<span class="badge badge-danger">${pendingPay} pending</span>` : '<span class="badge badge-success">Clear</span>'}</td>
      <td><span class="badge ${attCls}">${present?'Present':attStatus}</span></td>
      <td class="actions-cell">
        <div class="btn-group">
          <button class="btn btn-sm btn-primary" onclick="viewRecStudent('${s.id}')">View</button>
          ${!present?`<button class="btn btn-sm btn-success" onclick="quickCheckIn('${s.id}')">In</button>`:`<button class="btn btn-sm btn-secondary" onclick="markOut('${s.id}')">Out</button>`}
        </div>
      </td></tr>`;
  }).join('');
}

function renderRoomsList() {
  const statusFilter = document.getElementById('recRoomStatusFilter')?.value || '';
  // Sort alphabetically by room number so rooms always appear in A→Z order
  let rooms = HMS.get('rooms').slice().sort((a, b) => (a.number || '').localeCompare(b.number || '', undefined, { numeric: true }));
  if (statusFilter) rooms = rooms.filter(r => r.status === statusFilter);
  const container = document.getElementById('recRoomsContainer');
  if (!container) return;
  if (!rooms.length) {
    container.innerHTML = '<div class="text-center text-muted" style="padding:40px;grid-column:1/-1">No rooms found</div>';
    return;
  }
  container.innerHTML = rooms.map(r => {
    // Calculate actual occupancy from students
    const occupants = HMS.where('users', u => u.role === 'student' && u.roomId === r.id);
    const actualOccupied = occupants.length;
    const pct = r.beds > 0 ? Math.round((actualOccupied / r.beds) * 100) : 0;
    const color = pct === 100 ? 'red' : pct > 50 ? 'orange' : 'green';
    const statusBadge = {occupied:'badge-danger',partial:'badge-warning',available:'badge-success',maintenance:'badge-secondary'}[r.status]||'badge-secondary';
    const amenities = (r.amenities||[]).map(a => `<span class="amenity-tag">${a}</span>`).join('');
    return `<div class="room-card">
      <div class="room-card-header">
        <div class="room-card-top">
          <div><div class="room-card-number">${r.number}</div><div class="room-card-type">${r.type} · ${r.floor}</div></div>
          <div class="text-right"><div class="room-card-rent">${fmtCurrency(r.rent||0)}</div><div class="room-card-rent-label">/month</div></div>
        </div>
      </div>
      <div class="room-card-body">
        <div class="room-info-row"><span>Beds</span><strong>${r.beds}</strong></div>
        <div class="room-info-row"><span>Occupied</span><strong>${actualOccupied}/${r.beds}</strong></div>
        <div class="room-info-row"><span>Bathroom</span><strong>${r.bathrooms||'—'}</strong></div>
        <div class="room-info-row"><span>Status</span><span class="badge ${statusBadge}">${r.status}</span></div>
        <div class="room-occupancy">
          <div class="occupancy-text"><span>Occupancy</span><span>${pct}%</span></div>
          <div class="progress-bar"><div class="progress-fill ${color}" style="width:${pct}%"></div></div>
        </div>
        ${amenities ? `<div class="room-amenities">${amenities}</div>` : ''}
      </div>
      <div class="room-card-footer">
        <button class="btn btn-sm btn-outline" onclick="openEditRoomRec('${r.id}')">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>Edit Status
        </button>
      </div>
    </div>`;
  }).join('');
}

function filterRecRooms() {
  renderRoomsList();
}

function openEditRoomRec(id) {
  const r = HMS.findById('rooms', id);
  if (!r) return;
  setInput('editRoomId', r.id);
  setInput('editRoomNumber', r.number);
  setInput('editRoomFloor', r.floor);
  setInput('editRoomType', r.type);
  setInput('editRoomBeds', r.beds);
  setInput('editRoomRent', r.rent);
  setInput('editRoomStatus', r.status);
  // Show current occupants
  const occupants = HMS.where('users', u => u.role === 'student' && u.roomId === id);
  const container = document.getElementById('editRoomOccupants');
  if (container) {
    container.innerHTML = occupants.length
      ? `<div class="form-label-d" style="margin-bottom:8px">Current Occupants (${occupants.length}/${r.beds})</div>` +
        occupants.map(s => {
          const booking = HMS.where('bookings', b => b.studentId === s.id && b.status === 'active')[0];
          return `<div class="occupant-row"><div class="td-name"><div class="avatar sm" style="background:${avatarColor(s.name)}">${avatarLetter(s.name)}</div><div><div class="fw-600">${s.name} <span class="text-muted text-sm">(${s.studentId||'-'})</span></div><div class="td-sub">Since: ${booking ? fmtDate(booking.checkIn) : '-'}</div></div></div></div>`;
        }).join('')
      : '<div class="text-muted text-sm" style="padding:8px 0">No students assigned to this room.</div>';
  }
  openModal('editRoomModal');
}

function saveRoomRec(e) {
  e.preventDefault();
  const id = document.getElementById('editRoomId').value;
  HMS.update('rooms', id, { status: document.getElementById('editRoomStatus').value });
  notify('Room status updated', 'success');
  closeModal('editRoomModal');
  renderRoomsList();
}

function renderVisitorsList() {
  let visitors = HMS.get('visitors');
  // Apply date range filter if set
  const fromEl = document.getElementById('visDateFrom');
  const toEl = document.getElementById('visDateTo');
  const from = fromEl ? fromEl.value : '';
  const to = toEl ? toEl.value : '';
  if (from || to) {
    visitors = visitors.filter(v => {
      const d = v.checkIn ? v.checkIn.slice(0, 10) : '';
      if (!d) return false;
      if (from && d < from) return false;
      if (to && d > to) return false;
      return true;
    });
  }
  const tbody = document.getElementById('visitorsBody');
  if (!tbody) return;
  // Apply sort state
  const { col: vc, dir: vd } = recSortState.visitors;
  const visitorsArr = [...visitors].sort((a, b) => {
    if (vc === 'name') return vd === 'asc' ? (a.name||'').localeCompare(b.name||'') : (b.name||'').localeCompare(a.name||'');
    if (vc === 'student') {
      const sa = HMS.findById('users', a.studentId)?.name || '';
      const sb = HMS.findById('users', b.studentId)?.name || '';
      return vd === 'asc' ? sa.localeCompare(sb) : sb.localeCompare(sa);
    }
    if (vc === 'status') return vd === 'asc' ? (a.status||'').localeCompare(b.status||'') : (b.status||'').localeCompare(a.status||'');
    // default: date desc — direct string comparison (locale-safe)
    const ca = a.checkIn || '', cb = b.checkIn || '';
    return vd === 'asc' ? (ca < cb ? -1 : ca > cb ? 1 : 0) : (cb < ca ? -1 : cb > ca ? 1 : 0);
  });
  tbody.innerHTML = visitorsArr.length ? visitorsArr.map(v => {
    const student = HMS.findById('users', v.studentId);
    const isActive = v.status === 'active';
    return `<tr>
      <!-- FIX: td-sub always renders so visitor rows without phone are same height as those with phone -->
      <td><div class="td-name"><div class="avatar sm" style="background:#f59e0b;color:#fff">${(v.name||'?')[0].toUpperCase()}</div><div><div class="fw-600">${v.name}</div><div class="td-sub">${v.phone||''}</div></div></div></td>
      <td>${student?.name||'-'}</td>
      <td style="font-size:12px;color:var(--text-2)">${v.relation||'—'}</td>
      <td>${v.purpose||'-'}</td>
      <td style="font-size:12px">${v.checkIn||'—'}</td>
      <td style="font-size:12px">${v.checkOut||'—'}</td>
      <td><span class="badge ${isActive?'badge-success':'badge-secondary'}">${isActive?'Active':'Checked-Out'}</span></td>
      <td>${isActive?`<button class="btn btn-sm btn-warning" onclick="checkoutVisitor('${v.id}')">Check Out</button>`:'—'}</td>
    </tr>`;
  }).join('') : '<tr><td colspan="8" class="text-center text-muted" style="padding:24px">No visitors found</td></tr>';
}

function renderAttendanceLog() {
  // Update the full check-in/out log table (on the check-in/out page)
  let attendance = HMS.where('attendance', a => a.date === today());
  const tbody = document.getElementById('fullAttendanceBody');
  if (!tbody) return;
  if (!attendance.length) { tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted" style="padding:24px">No attendance records for today</td></tr>'; return; }
  // Apply sort
  const { col: ac, dir: ad } = recSortState.attendance;
  attendance = [...attendance].sort((a, b) => {
    if (ac === 'room') {
      const ra = HMS.findById('users', a.studentId)?.roomId;
      const rb = HMS.findById('users', b.studentId)?.roomId;
      const rna = ra ? (HMS.findById('rooms', ra)?.number || '') : '';
      const rnb = rb ? (HMS.findById('rooms', rb)?.number || '') : '';
      return ad === 'asc' ? rna.localeCompare(rnb) : rnb.localeCompare(rna);
    }
    if (ac === 'checkIn') { const ca = a.checkIn||'', cb = b.checkIn||''; return ad === 'asc' ? (ca < cb ? -1 : ca > cb ? 1 : 0) : (cb < ca ? -1 : cb > ca ? 1 : 0); }
    if (ac === 'status') return ad === 'asc' ? (a.status||'').localeCompare(b.status||'') : (b.status||'').localeCompare(a.status||'');
    // default: name
    const na = HMS.findById('users', a.studentId)?.name || '';
    const nb = HMS.findById('users', b.studentId)?.name || '';
    return ad === 'asc' ? na.localeCompare(nb) : nb.localeCompare(na);
  });
  tbody.innerHTML = attendance.map(a => {
    const student = HMS.findById('users', a.studentId);
    const room = student?.roomId ? HMS.findById('rooms', student.roomId) : null;
    const cls = a.status==='present'?'badge-success':a.status==='out-pass'?'badge-warning':'badge-secondary';
    return `<tr>
      <td style="font-size:12px;color:var(--text-2)">${student?.studentId||'-'}</td>
      <td><div class="fw-600">${student?.name||'-'}</div></td>
      <td>${room?.number||'-'}</td>
      <td style="font-size:12px">${a.checkIn||'—'}</td>
      <td style="font-size:12px">${a.checkOut||'—'}</td>
      <td><span class="badge ${cls}">${a.status}</span></td>
      <td>${a.status !== 'present' ? `<button class="btn btn-sm btn-success" onclick="quickCheckIn('${a.studentId}')">Check In</button>` : `<button class="btn btn-sm btn-secondary" onclick="markOut('${a.studentId}')">Check Out</button>`}</td>
    </tr>`;
  }).join('');
}

async function quickCheckIn(studentId) {
  await HMS.refreshSessionState();
  const time = new Date().toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' });
  const existing = HMS.where('attendance', a => a.studentId === studentId && a.date === today());
  if (existing.length) {
    HMS.update('attendance', existing[0].id, { status:'present', checkIn: time });
  } else {
    HMS.add('attendance', { id:HMS.genId(), studentId, date:today(), status:'present', checkIn:time, checkOut:null });
  }
  const student = HMS.findById('users', studentId);
  notify(`${student?.name} checked in at ${time}`, 'success');
  renderStudentsList(); renderReceptionistStats(); renderAttendanceLog();
}

async function markOut(studentId) {
  await HMS.refreshSessionState();
  const time = new Date().toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' });
  const existing = HMS.where('attendance', a => a.studentId === studentId && a.date === today());
  if (existing.length) HMS.update('attendance', existing[0].id, { status:'out', checkOut: time });
  const student = HMS.findById('users', studentId);
  notify(`${student?.name} marked as out at ${time}`, 'info');
  renderStudentsList(); renderReceptionistStats(); renderAttendanceLog();
}

async function handleCheckIn(e) {
  e.preventDefault();
  const studentId = document.getElementById('ciStudentId').value;
  const student = HMS.where('users', u => (u.studentId === studentId || u.id === studentId) && u.role === 'student')[0];
  if (!student) { notify('Student not found. Check the ID.', 'error'); return; }
  await quickCheckIn(student.id);
  closeModal('checkInModal');
  e.target.reset();
}

async function handleCheckOut(e) {
  e.preventDefault();
  const studentId = document.getElementById('coStudentId').value;
  const reason = document.getElementById('coReason').value;
  const student = HMS.where('users', u => (u.studentId === studentId || u.id === studentId) && u.role === 'student')[0];
  if (!student) { notify('Student not found. Check the ID.', 'error'); return; }
  await HMS.refreshSessionState();
  const time = new Date().toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' });
  const existing = HMS.where('attendance', a => a.studentId === student.id && a.date === today());
  const status = reason === 'on-pass' ? 'out-pass' : 'out';
  if (existing.length) HMS.update('attendance', existing[0].id, { status, checkOut: time });
  else HMS.add('attendance', { id:HMS.genId(), studentId:student.id, date:today(), status, checkIn:null, checkOut:time });
  notify(`${student.name} checked out (${reason}) at ${time}`, 'info');
  closeModal('checkOutModal');
  e.target.reset();
  renderStudentsList(); renderReceptionistStats(); renderAttendanceLog();
}

async function registerVisitor(e) {
  e.preventDefault();
  await HMS.refreshSessionState();
  const studentId = document.getElementById('visitorForStudent').value;
  const student = HMS.findById('users', studentId);
  const checkInTime = new Date().toLocaleString('en-IN', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' });
  HMS.add('visitors', {
    id: HMS.genId(),
    name: document.getElementById('visitorName').value,
    studentId, phone: document.getElementById('visitorPhone').value,
    relation: (document.getElementById('visitorRelation') || {}).value || '',
    idProof: (document.getElementById('visitorIdProof') || {}).value || '',
    purpose: document.getElementById('visitorPurpose').value,
    checkIn: checkInTime, checkOut: null, status: 'active'
  });
  notify(`Visitor registered for ${student?.name}`, 'success');
  closeModal('visitorModal');
  e.target.reset();
  renderVisitorsList(); renderReceptionistStats();
}

async function checkoutVisitor(id) {
  await HMS.refreshSessionState();
  const time = new Date().toLocaleString('en-IN', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' });
  HMS.update('visitors', id, { status:'checked-out', checkOut: time });
  notify('Visitor checked out', 'success');
  renderVisitorsList(); renderReceptionistStats();
}

function populateStudentDropdowns() {
  const students = HMS.where('users', u => u.role === 'student');
  document.querySelectorAll('.student-dropdown').forEach(sel => {
    sel.innerHTML = '<option value="">Select Student</option>' + students.map(s =>
      `<option value="${s.id}">${s.name} (${s.studentId||s.id})</option>`
    ).join('');
  });
}

// ===== HELPERS =====
function set(id, val) { const el = document.getElementById(id); if (el) el.textContent = val; }
function setInput(id, val) { const el = document.getElementById(id); if (el) el.value = val || ''; }

// Password toggle for login
document.addEventListener('DOMContentLoaded', () => {
  HMS.init();
  setLoginMode(false);
  const loginForm = document.getElementById('loginForm');
  if (loginForm) loginForm.addEventListener('submit', handleLogin);
});
