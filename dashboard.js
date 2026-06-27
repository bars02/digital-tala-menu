/**
 * dashboard.js — Tala Restaurant & Café Dashboard
 * ────────────────────────────────────────────────
 * Core admin client logic for managing categories, dishes,
 * image uploads, automatic translations, and data migrations.
 */

'use strict';

(function() {

let supabase = null;
let currentCategories = [];
let currentDishes = [];
let currentExcellenceItems = [];
let editingDishId = null;
let editingCategoryId = null;
let editingExcellenceId = null;
let isResettingPassword = false;
let resetEmailAddress = '';

// DOM Elements Reference
const elements = {
  // Connection
  connectionBadge: document.getElementById('connection-badge'),
  connectionStatusText: document.getElementById('connection-status-text'),

  // Stats
  statDishesCount: document.getElementById('stat-dishes-count'),
  statCategoriesCount: document.getElementById('stat-categories-count'),
  statFeaturedCount: document.getElementById('stat-featured-count'),


  // Tabs
  tabButtons: document.querySelectorAll('.tab-btn'),
  tabContents: document.querySelectorAll('.tab-content'),

  // Dishes Tab
  dishSearch: document.getElementById('dish-search'),
  dishCategoryFilter: document.getElementById('dish-category-filter'),
  addDishBtn: document.getElementById('add-dish-btn'),
  dishesTbody: document.getElementById('dishes-tbody'),

  // Categories Tab
  addCategoryBtn: document.getElementById('add-category-btn'),
  categoriesTbody: document.getElementById('categories-tbody'),

  // Excellence Tab
  addExcellenceBtn: document.getElementById('add-excellence-btn'),
  excellenceTbody: document.getElementById('excellence-tbody'),

  // Excellence Modal
  excellenceModal: document.getElementById('excellence-modal'),
  excellenceModalTitle: document.getElementById('excellence-modal-title'),
  excellenceModalClose: document.getElementById('excellence-modal-close'),
  excellenceModalCancel: document.getElementById('excellence-modal-cancel'),
  excellenceForm: document.getElementById('excellence-form'),
  excellenceId: document.getElementById('excellence-id'),
  excellenceImportDish: document.getElementById('excellence-import-dish'),
  excellenceImageUrl: document.getElementById('excellence-image-url'),
  excellenceImageFile: document.getElementById('excellence-image-file'),
  excellenceImagePreview: document.getElementById('excellence-image-preview'),
  excellenceFileStatus: document.getElementById('excellence-file-status'),
  excellencePrice: document.getElementById('excellence-price'),
  excellenceNameAr: document.getElementById('excellence-name-ar'),
  excellenceNameEn: document.getElementById('excellence-name-en'),
  excellenceNameKu: document.getElementById('excellence-name-ku'),
  excellenceDescAr: document.getElementById('excellence-desc-ar'),
  excellenceDescEn: document.getElementById('excellence-desc-en'),
  excellenceDescKu: document.getElementById('excellence-desc-ku'),
  excellenceSubmitBtn: document.getElementById('excellence-submit-btn'),
  btnTranslateExcellenceNames: document.getElementById('btn-translate-excellence-names'),
  btnTranslateExcellenceDescs: document.getElementById('btn-translate-excellence-descs'),

  // Dish Modal
  dishModal: document.getElementById('dish-modal'),
  dishModalTitle: document.getElementById('dish-modal-title'),
  dishModalClose: document.getElementById('dish-modal-close'),
  dishModalCancel: document.getElementById('dish-modal-cancel'),
  dishForm: document.getElementById('dish-form'),
  dishId: document.getElementById('dish-id'),
  dishImageUrl: document.getElementById('dish-image-url'),
  dishImageFile: document.getElementById('dish-image-file'),
  dishImagePreview: document.getElementById('dish-image-preview'),
  fileUploadStatus: document.getElementById('file-upload-status'),
  dishCategory: document.getElementById('dish-category'),
  dishPrice: document.getElementById('dish-price'),
  dishNameAr: document.getElementById('dish-name-ar'),
  dishNameEn: document.getElementById('dish-name-en'),
  dishNameKu: document.getElementById('dish-name-ku'),
  dishDescAr: document.getElementById('dish-desc-ar'),
  dishDescEn: document.getElementById('dish-desc-en'),
  dishDescKu: document.getElementById('dish-desc-ku'),
  // dishFeatured removed — excellence items are managed separately
  dishSubmitBtn: document.getElementById('dish-submit-btn'),
  btnTranslateNames: document.getElementById('btn-translate-names'),
  btnTranslateDescs: document.getElementById('btn-translate-descs'),

  // Category Modal
  categoryModal: document.getElementById('category-modal'),
  categoryModalTitle: document.getElementById('category-modal-title'),
  categoryModalClose: document.getElementById('category-modal-close'),
  categoryModalCancel: document.getElementById('category-modal-cancel'),
  categoryForm: document.getElementById('category-form'),
  catIdInput: document.getElementById('cat-id-input'),
  catIconInput: document.getElementById('cat-icon-input'),
  catTitleAr: document.getElementById('cat-title-ar'),
  catTitleEn: document.getElementById('cat-title-en'),
  catTitleKu: document.getElementById('cat-title-ku'),
  catOrderInput: document.getElementById('cat-order-input'),
  categorySubmitBtn: document.getElementById('category-submit-btn'),
  btnTranslateCats: document.getElementById('btn-translate-cats'),

  // Toast
  toast: document.getElementById('toast'),
  toastText: document.getElementById('toast-text'),
};

/* ══════════════════════════════════════════════════════
   TOAST NOTIFICATION HELPER
   ══════════════════════════════════════════════════════ */
function showToast(message, type = 'success') {
  elements.toastText.textContent = message;
  elements.toast.className = `toast show toast--${type}`;
  clearTimeout(elements.toast._timer);
  elements.toast._timer = setTimeout(() => {
    elements.toast.classList.remove('show');
  }, 3000);
}

/* ══════════════════════════════════════════════════════
   SUPABASE CLIENT INITIALIZATION
   ══════════════════════════════════════════════════════ */
function initSupabase() {
  // 1. Check supabase-config.js credentials
  let url = (typeof supabaseConfig !== 'undefined') ? supabaseConfig.url : '';
  let anonKey = (typeof supabaseConfig !== 'undefined') ? supabaseConfig.anonKey : '';

  // 2. Check localStorage if config is empty
  if (!url || !anonKey) {
    url = localStorage.getItem('tala_supabase_url') || '';
    anonKey = localStorage.getItem('tala_supabase_anon_key') || '';
  }

  if (url && anonKey) {
    try {
      supabase = window.supabase.createClient(url, anonKey);
      setupAuthListeners();
    } catch (error) {
      console.error('Supabase initialization failed:', error);
      updateConnectionStatus(false, 'خطأ في التهيئة');
    }
  } else {
    updateConnectionStatus(false, 'غير مهيأ — يرجى إضافة البيانات في supabase-config.js');
  }
}

function setupAuthListeners() {
  // Listen to auth changes
  supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === 'PASSWORD_RECOVERY') {
      isResettingPassword = true;
      showNewPasswordView();
      return;
    }

    if (session) {
      if (isResettingPassword) {
        // In the middle of password reset flow, do not show dashboard
        return;
      }
      
      const user = session.user;
      const authorizedEmail = (typeof supabaseConfig !== 'undefined') ? supabaseConfig.authorizedEmail : '';
      
      if (authorizedEmail && user.email === authorizedEmail) {
        // Correct admin email
        showDashboardView();
        // Load data if not already connected
        testConnection();
      } else {
        // Logged in but not authorized
        showToast('حساب غير مصرح له بدخول لوحة التحكم', 'error');
        await supabase.auth.signOut();
        showLoginView();
        showLoginError('هذا الحساب غير مصرح له بدخول لوحة التحكم.');
      }
    } else {
      // No active session, only reset if not currently in reset flow
      if (!isResettingPassword) {
        showLoginView();
      }
    }
  });

  // UI transition links
  const linkForgot = document.getElementById('link-forgot-password');
  const linkBack = document.getElementById('link-back-to-login');
  const linkOtpBack = document.getElementById('link-otp-back-to-login');

  if (linkForgot) {
    linkForgot.addEventListener('click', (e) => {
      e.preventDefault();
      showForgotView();
    });
  }

  if (linkBack) {
    linkBack.addEventListener('click', (e) => {
      e.preventDefault();
      showLoginView();
    });
  }

  if (linkOtpBack) {
    linkOtpBack.addEventListener('click', (e) => {
      e.preventDefault();
      isResettingPassword = false;
      showLoginView();
    });
  }

  // Setup form submission
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value.trim();
      const password = document.getElementById('login-password').value;
      const submitBtn = document.getElementById('login-submit-btn');
      const errDiv = document.getElementById('login-error');
      
      errDiv.style.display = 'none';
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="spinner"></span> جاري التحقق...';
      
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email,
          password: password
        });
        
        if (error) throw error;
      } catch (error) {
        console.error('Login error:', error);
        let friendlyMessage = 'فشل تسجيل الدخول: تأكد من صحة البيانات.';
        if (error.message === 'Invalid login credentials') {
          friendlyMessage = 'البريد الإلكتروني أو كلمة المرور غير صحيحة.';
        } else if (error.message) {
          friendlyMessage = `خطأ: ${error.message}`;
        }
        showLoginError(friendlyMessage);
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'دخول';
      }
    });
  }

  // Setup forgot password request
  const forgotForm = document.getElementById('forgot-form');
  if (forgotForm) {
    forgotForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('forgot-email').value.trim();
      const submitBtn = document.getElementById('forgot-submit-btn');
      const errDiv = document.getElementById('forgot-error');
      const authorizedEmail = (typeof supabaseConfig !== 'undefined') ? supabaseConfig.authorizedEmail : '';

      errDiv.style.display = 'none';

      // Check if email matches authorized email
      if (authorizedEmail && email !== authorizedEmail) {
        errDiv.textContent = 'هذا البريد الإلكتروني غير مصرح له بالوصول لوحة التحكم.';
        errDiv.style.display = 'block';
        return;
      }

      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="spinner"></span> جاري الإرسال...';

      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin + window.location.pathname
        });
        if (error) throw error;
        
        resetEmailAddress = email;
        showToast('تم إرسال رابط إعادة التعيين إلى بريدك الإلكتروني');
        document.getElementById('forgot-form').style.display = 'none';
        document.getElementById('login-card-subtitle').textContent = 'تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني. الرجاء الضغط على الرابط في الرسالة لتعيين كلمة مرور جديدة.';
      } catch (error) {
        console.error('Reset password request error:', error);
        errDiv.textContent = error.message ? `خطأ: ${error.message}` : 'فشل إرسال رابط إعادة التعيين.';
        errDiv.style.display = 'block';
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'إرسال رابط إعادة التعيين';
      }
    });
  }

  // Setup OTP verify form
  const otpForm = document.getElementById('otp-verify-form');
  if (otpForm) {
    otpForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const otpCode = document.getElementById('otp-code').value.trim();
      const submitBtn = document.getElementById('otp-submit-btn');
      const errDiv = document.getElementById('otp-error');

      errDiv.style.display = 'none';
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="spinner"></span> جاري التحقق...';

      try {
        const { data, error } = await supabase.auth.verifyOtp({
          email: resetEmailAddress,
          token: otpCode,
          type: 'recovery'
        });

        if (error) throw error;

        isResettingPassword = true;
        showToast('تم التحقق بنجاح. يرجى تعيين كلمة المرور الجديدة.');
        showNewPasswordView();
      } catch (error) {
        console.error('OTP verification error:', error);
        errDiv.textContent = error.message === 'Token has expired or is invalid' || error.message === 'Invalid token' 
          ? 'رمز التحقق غير صحيح أو منتهي الصلاحية.' 
          : `خطأ: ${error.message || 'فشل التحقق.'}`;
        errDiv.style.display = 'block';
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'تحقق من الرمز';
      }
    });
  }

  // Setup new password form
  const newPasswordForm = document.getElementById('new-password-form');
  if (newPasswordForm) {
    newPasswordForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const newPassword = document.getElementById('new-password').value;
      const confirmPassword = document.getElementById('confirm-new-password').value;
      const submitBtn = document.getElementById('new-password-submit-btn');
      const errDiv = document.getElementById('new-password-error');

      errDiv.style.display = 'none';

      if (newPassword.length < 6) {
        errDiv.textContent = 'يجب أن تتكون كلمة المرور من 6 خانات على الأقل.';
        errDiv.style.display = 'block';
        return;
      }

      if (newPassword !== confirmPassword) {
        errDiv.textContent = 'كلمتا المرور غير متطابقتين.';
        errDiv.style.display = 'block';
        return;
      }

      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="spinner"></span> جاري الحفظ...';

      try {
        const { error } = await supabase.auth.updateUser({
          password: newPassword
        });

        if (error) throw error;

        showToast('تم تغيير كلمة المرور بنجاح. يرجى تسجيل الدخول مجدداً.');
        isResettingPassword = false;
        await supabase.auth.signOut();
        showLoginView();
      } catch (error) {
        console.error('Password update error:', error);
        errDiv.textContent = error.message ? `خطأ: ${error.message}` : 'فشل تغيير كلمة المرور.';
        errDiv.style.display = 'block';
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'حفظ وتغيير كلمة المرور';
      }
    });
  }

  // Setup logout button
  const logoutBtn = document.getElementById('btn-logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      if (confirm('هل أنت متأكد من رغبتك في تسجيل الخروج؟')) {
        await supabase.auth.signOut();
      }
    });
  }
}

function showDashboardView() {
  document.getElementById('login-container').style.display = 'none';
  document.getElementById('dashboard-container').style.display = 'block';
  document.getElementById('btn-logout').style.display = 'inline-flex';
}

function showLoginView() {
  document.getElementById('login-card-title').textContent = 'تسجيل الدخول لوحة تحكم تالة';
  document.getElementById('login-card-subtitle').textContent = 'الرجاء إدخال البريد الإلكتروني وكلمة المرور للمتابعة';

  document.getElementById('login-form').style.display = 'block';
  document.getElementById('forgot-form').style.display = 'none';
  document.getElementById('otp-verify-form').style.display = 'none';
  document.getElementById('new-password-form').style.display = 'none';

  document.getElementById('login-container').style.display = 'flex';
  document.getElementById('dashboard-container').style.display = 'none';
  document.getElementById('btn-logout').style.display = 'none';

  document.getElementById('login-password').value = '';
}

function showForgotView() {
  document.getElementById('login-card-title').textContent = 'إعادة تعيين كلمة المرور';
  document.getElementById('login-card-subtitle').textContent = 'أدخل بريدك الإلكتروني لإرسال رابط إعادة التعيين';

  document.getElementById('login-form').style.display = 'none';
  document.getElementById('forgot-form').style.display = 'block';
  document.getElementById('otp-verify-form').style.display = 'none';
  document.getElementById('new-password-form').style.display = 'none';
  document.getElementById('forgot-error').style.display = 'none';
}

function showOtpVerifyView() {
  document.getElementById('login-card-title').textContent = 'تحقق من رمز OTP';
  document.getElementById('login-card-subtitle').textContent = `تم إرسال رمز التحقق إلى ${resetEmailAddress}`;

  document.getElementById('login-form').style.display = 'none';
  document.getElementById('forgot-form').style.display = 'none';
  document.getElementById('otp-verify-form').style.display = 'block';
  document.getElementById('new-password-form').style.display = 'none';
  document.getElementById('otp-error').style.display = 'none';
  document.getElementById('otp-code').value = '';
}

function showNewPasswordView() {
  document.getElementById('login-card-title').textContent = 'كلمة المرور الجديدة';
  document.getElementById('login-card-subtitle').textContent = 'الرجاء تعيين كلمة المرور الجديدة للوحة التحكم';

  document.getElementById('login-form').style.display = 'none';
  document.getElementById('forgot-form').style.display = 'none';
  document.getElementById('otp-verify-form').style.display = 'none';
  document.getElementById('new-password-form').style.display = 'block';
  document.getElementById('new-password-error').style.display = 'none';
  document.getElementById('new-password').value = '';
  document.getElementById('confirm-new-password').value = '';
}

function showLoginError(msg) {
  const errDiv = document.getElementById('login-error');
  errDiv.textContent = msg;
  errDiv.style.display = 'block';
}

async function testConnection() {
  updateConnectionStatus(false, 'جاري فحص الاتصال...');
  try {
    // Attempt simple query
    const { count, error } = await supabase
      .from('categories')
      .select('*', { count: 'exact', head: true });

    if (error) throw error;

    updateConnectionStatus(true, 'متصل بنجاح');
    enableControls();
    loadDashboardData();
  } catch (error) {
    console.error('Connection test failed:', error);
    updateConnectionStatus(false, 'فشل الاتصال بقاعدة البيانات');
    showToast('فشل الاتصال: تأكد من الإعدادات وصحة الجداول', 'error');
  }
}

function updateConnectionStatus(isConnected, text) {
  if (isConnected) {
    elements.connectionBadge.classList.add('connected');
    elements.connectionStatusText.textContent = text;
  } else {
    elements.connectionBadge.classList.remove('connected');
    elements.connectionStatusText.textContent = text;
  }
}

function enableControls() {
  elements.addDishBtn.disabled = false;
  elements.addCategoryBtn.disabled = false;
  elements.addExcellenceBtn.disabled = false;
}

/* ══════════════════════════════════════════════════════
   DASHBOARD DATA LOADER
   ══════════════════════════════════════════════════════ */
async function loadDashboardData() {
  try {
    // Load categories
    const { data: categoriesData, error: catError } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true });

    if (catError) throw catError;
    currentCategories = categoriesData || [];

    // Load dishes
    const { data: dishesData, error: dishError } = await supabase
      .from('dishes')
      .select('*')
      .order('created_at', { ascending: false });

    if (dishError) throw dishError;
    currentDishes = dishesData || [];

    // Load excellence items
    const { data: excellenceData, error: excellenceError } = await supabase
      .from('excellence_items')
      .select('*')
      .order('created_at', { ascending: false });
    if (!excellenceError) {
      currentExcellenceItems = excellenceData || [];
    } else {
      currentExcellenceItems = [];
    }

    updateStats();
    populateCategoryDropdowns();
    renderCategoriesTable();
    renderDishesTable();
    renderExcellenceTable();
  } catch (error) {
    console.error('Failed to load data:', error);
    showToast('حدث خطأ أثناء تحميل البيانات من قاعدة البيانات', 'error');
  }
}

function updateStats() {
  elements.statDishesCount.textContent = currentDishes.length;
  elements.statCategoriesCount.textContent = currentCategories.length;
  elements.statFeaturedCount.textContent = currentExcellenceItems.length;
}

function populateCategoryDropdowns() {
  // Dish category filter dropdown
  const filterDropdown = elements.dishCategoryFilter;
  const formDropdown = elements.dishCategory;

  filterDropdown.innerHTML = '<option value="all">كل الأقسام</option>';
  formDropdown.innerHTML = '';

  currentCategories.forEach(cat => {
    const title = cat.title || cat.id;
    // Filter option
    const optFilter = document.createElement('option');
    optFilter.value = cat.id;
    optFilter.textContent = `${cat.icon || ''} ${title}`;
    filterDropdown.appendChild(optFilter);

    // Form option
    const optForm = document.createElement('option');
    optForm.value = cat.id;
    optForm.textContent = `${cat.icon || ''} ${title}`;
    formDropdown.appendChild(optForm);
  });
}

/* ══════════════════════════════════════════════════════
   TRANSLATION HELPERS
   ══════════════════════════════════════════════════════ */
async function translateText(text, fromLang, toLang) {
  if (!text) return '';
  try {
    // Map 'ku' to 'ckb' for Central Kurdish (Sorani - Arabic script)
    const targetLang = toLang === 'ku' ? 'ckb' : toLang;
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${fromLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url);
    const data = await res.json();
    
    if (data && data[0]) {
      return data[0].map(item => item[0]).join('');
    }
  } catch (error) {
    console.error('Translation error:', error);
  }
  return '';
}

async function handleTranslateNames() {
  const arName = elements.dishNameAr.value.trim();
  if (!arName) {
    showToast('يرجى كتابة الاسم بالعربية أولاً للترجمة', 'error');
    return;
  }

  elements.btnTranslateNames.disabled = true;
  elements.btnTranslateNames.innerHTML = '<span class="spinner"></span> جاري الترجمة...';

  try {
    // Translate to English
    if (!elements.dishNameEn.value.trim()) {
      const enTranslated = await translateText(arName, 'ar', 'en');
      if (enTranslated) elements.dishNameEn.value = enTranslated;
    }

    // Translate to Kurdish (Sorani)
    if (!elements.dishNameKu.value.trim()) {
      const kuTranslated = await translateText(arName, 'ar', 'ku');
      if (kuTranslated) elements.dishNameKu.value = kuTranslated;
    }

    showToast('اكتملت الترجمة لاسم الطبق');
  } catch (error) {
    showToast('حدث خطأ أثناء الترجمة التلقائية', 'error');
  } finally {
    elements.btnTranslateNames.disabled = false;
    elements.btnTranslateNames.textContent = '✨ ترجمة فورية من العربية';
  }
}

async function handleTranslateDescs() {
  const arDesc = elements.dishDescAr.value.trim();
  if (!arDesc) {
    showToast('يرجى كتابة الوصف بالعربية أولاً للترجمة', 'error');
    return;
  }

  elements.btnTranslateDescs.disabled = true;
  elements.btnTranslateDescs.innerHTML = '<span class="spinner"></span> جاري الترجمة...';

  try {
    // Translate to English
    if (!elements.dishDescEn.value.trim()) {
      const enTranslated = await translateText(arDesc, 'ar', 'en');
      if (enTranslated) elements.dishDescEn.value = enTranslated;
    }

    // Translate to Kurdish (Sorani)
    if (!elements.dishDescKu.value.trim()) {
      const kuTranslated = await translateText(arDesc, 'ar', 'ku');
      if (kuTranslated) elements.dishDescKu.value = kuTranslated;
    }

    showToast('اكتملت الترجمة لوصف الطبق');
  } catch (error) {
    showToast('حدث خطأ أثناء الترجمة التلقائية', 'error');
  } finally {
    elements.btnTranslateDescs.disabled = false;
    elements.btnTranslateDescs.textContent = '✨ ترجمة فورية من العربية';
  }
}

async function handleTranslateCats() {
  const arTitle = elements.catTitleAr.value.trim();
  if (!arTitle) {
    showToast('يرجى كتابة الاسم بالعربية أولاً للترجمة', 'error');
    return;
  }

  elements.btnTranslateCats.disabled = true;
  elements.btnTranslateCats.innerHTML = '<span class="spinner"></span> جاري الترجمة...';

  try {
    // Translate to English
    if (!elements.catTitleEn.value.trim()) {
      const enTranslated = await translateText(arTitle, 'ar', 'en');
      if (enTranslated) elements.catTitleEn.value = enTranslated;
    }

    // Translate to Kurdish (Sorani)
    if (!elements.catTitleKu.value.trim()) {
      const kuTranslated = await translateText(arTitle, 'ar', 'ku');
      if (kuTranslated) elements.catTitleKu.value = kuTranslated;
    }

    showToast('اكتملت الترجمة لاسم القسم');
  } catch (error) {
    showToast('حدث خطأ أثناء الترجمة التلقائية', 'error');
  } finally {
    elements.btnTranslateCats.disabled = false;
    elements.btnTranslateCats.textContent = '✨ ترجمة فورية من العربية';
  }
}

/* ══════════════════════════════════════════════════════
   IMAGE UPLOAD TO STORAGE
   ══════════════════════════════════════════════════════ */
async function handleImageUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    showToast('حجم الصورة كبير جداً، الحد الأقصى 5 ميجابايت', 'error');
    e.target.value = '';
    return;
  }

  elements.fileUploadStatus.textContent = 'جاري الرفع...';
  
  // Local preview
  const reader = new FileReader();
  reader.onload = (event) => {
    elements.dishImagePreview.innerHTML = `<img src="${event.target.result}" alt="Preview" />`;
  };
  reader.readAsDataURL(file);

  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    const filePath = `dishes/${fileName}`;

    // Upload file
    const { data, error } = await supabase.storage
      .from('menu-images')
      .upload(filePath, file);

    if (error) throw error;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('menu-images')
      .getPublicUrl(filePath);

    elements.dishImageUrl.value = publicUrl;
    elements.fileUploadStatus.innerHTML = '<span style="color: var(--clr-success);">تم الرفع بنجاح!</span>';
    showToast('تم رفع الصورة بنجاح وتوليد الرابط');

  } catch (error) {
    console.error('Image upload error:', error);
    elements.fileUploadStatus.innerHTML = '<span style="color: var(--clr-danger);">فشل الرفع</span>';
    showToast('حدث خطأ أثناء رفع الصورة لقاعدة البيانات', 'error');
  }
}

// Preview image when URL is pasted/changed manually
elements.dishImageUrl.addEventListener('input', (e) => {
  const url = e.target.value.trim();
  if (url) {
    elements.dishImagePreview.innerHTML = `<img src="${url}" alt="Preview" onerror="this.parentElement.innerHTML='📷'" />`;
    elements.fileUploadStatus.textContent = '';
  } else {
    elements.dishImagePreview.innerHTML = '<span style="color: var(--clr-text-muted); font-size: 1.5rem;">📷</span>';
  }
});

/* ══════════════════════════════════════════════════════
   RENDER TABLES
   ══════════════════════════════════════════════════════ */

// Format currency
function formatPrice(n) {
  return n.toLocaleString('en-IQ') + ' د.ع';
}

function renderDishesTable() {
  const tbody = elements.dishesTbody;
  tbody.innerHTML = '';

  const searchQuery = elements.dishSearch.value.toLowerCase().trim();
  const catFilter = elements.dishCategoryFilter.value;

  // Filter dishes
  const filtered = currentDishes.filter(dish => {
    // Category match
    if (catFilter !== 'all' && dish.category !== catFilter) return false;
    
    // Search match
    if (searchQuery) {
      const matchText = `${dish.name} ${dish.name_en || ''} ${dish.name_ku || ''}`.toLowerCase();
      return matchText.includes(searchQuery);
    }
    
    return true;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="empty-state">
          <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          <h3>لا توجد أطباق مطابقة للبحث</h3>
          <p>جرّب تعديل معايير التصفية أو أضف طبقاً جديداً.</p>
        </td>
      </tr>
    `;
    return;
  }

  filtered.forEach(dish => {
    const tr = document.createElement('tr');
    
    // Find category title
    const cat = currentCategories.find(c => c.id === dish.category);
    const catName = cat ? `${cat.icon || ''} ${cat.title}` : dish.category;

    tr.innerHTML = `
      <td class="text-center">
        <img class="td-image" src="${dish.image || 'data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'50\' height=\'50\'><rect width=\'50\' height=\'50\' fill=\'%23221f1a\'/><text x=\'25\' y=\'30\' fill=\'%23777\' text-anchor=\'middle\'>📷</text></svg>'}" alt="${dish.name}" onerror="handleImageError(this, 'dish')" />
      </td>
      <td>
        <strong style="display:block;">${dish.name}</strong>
        <span style="font-size:0.75rem; color:var(--clr-text-muted);">${dish.name_en || ''} | ${dish.name_ku || ''}</span>
      </td>
      <td>${catName}</td>
      <td><strong style="color:var(--clr-gold-start);">${formatPrice(dish.price)}</strong></td>
      <td class="text-center">
        ${dish.is_featured ? '<span class="badge-featured">★ مميز</span>' : '<span style="color:var(--clr-text-muted); font-size:0.8rem;">لا</span>'}
      </td>
      <td class="actions-cell">
        <button class="btn btn--secondary btn--small edit-dish-btn" data-id="${dish.id}">تعديل</button>
        <button class="btn btn--danger btn--small delete-dish-btn" data-id="${dish.id}">حذف</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function renderCategoriesTable() {
  const tbody = elements.categoriesTbody;
  tbody.innerHTML = '';

  if (currentCategories.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="empty-state">
          <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <h3>لا توجد أقسام مضافة بعد</h3>
          <p>قم بإضافة قسم جديد لتبدأ بعرض الأطباق.</p>
        </td>
      </tr>
    `;
    return;
  }

  currentCategories.forEach(cat => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="text-center" style="font-size: 1.5rem;">${cat.icon || ''}</td>
      <td><code>${cat.id}</code></td>
      <td><strong>${cat.title}</strong></td>
      <td>${cat.title_en || ''}</td>
      <td>${cat.title_ku || ''}</td>
      <td class="text-center">${cat.sort_order}</td>
      <td class="actions-cell">
        <button class="btn btn--secondary btn--small edit-cat-btn" data-id="${cat.id}">تعديل</button>
        <button class="btn btn--danger btn--small delete-cat-btn" data-id="${cat.id}">حذف</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

/* ══════════════════════════════════════════════════════
   DISH ADD / EDIT / DELETE ACTIONS
   ══════════════════════════════════════════════════════ */
function openDishModal(dish = null) {
  if (currentCategories.length === 0) {
    showToast('يرجى إنشاء الأقسام أولاً قبل إضافة أطباق جديدة', 'error');
    return;
  }

  elements.dishForm.reset();
  elements.dishImagePreview.innerHTML = '<span style="color: var(--clr-text-muted); font-size: 1.5rem;">📷</span>';
  elements.fileUploadStatus.textContent = '';
  elements.dishImageFile.value = '';

  if (dish) {
    editingDishId = dish.id;
    elements.dishModalTitle.textContent = 'تعديل طبق';
    elements.dishId.value = dish.id;
    elements.dishImageUrl.value = dish.image || '';
    if (dish.image) {
      elements.dishImagePreview.innerHTML = `<img src="${dish.image}" alt="Preview" />`;
    }
    elements.dishCategory.value = dish.category;
    elements.dishPrice.value = dish.price;
    elements.dishNameAr.value = dish.name;
    elements.dishNameEn.value = dish.name_en || '';
    elements.dishNameKu.value = dish.name_ku || '';
    elements.dishDescAr.value = dish.description || '';
    elements.dishDescEn.value = dish.description_en || '';
    elements.dishDescKu.value = dish.description_ku || '';
    elements.dishSubmitBtn.textContent = 'حفظ التعديلات';
  } else {
    editingDishId = null;
    elements.dishModalTitle.textContent = 'إضافة طبق جديد';
    elements.dishId.value = '';
    elements.dishSubmitBtn.textContent = 'حفظ الطبق';
  }

  openModal(elements.dishModal);
}

async function handleDishFormSubmit(e) {
  e.preventDefault();

  const id = editingDishId || 'd' + Math.random().toString(36).substring(2, 9);
  const dishData = {
    id: id,
    category: elements.dishCategory.value,
    price: parseInt(elements.dishPrice.value),
    image: elements.dishImageUrl.value.trim() || null,
    name: elements.dishNameAr.value.trim(),
    name_en: elements.dishNameEn.value.trim() || null,
    name_ku: elements.dishNameKu.value.trim() || null,
    description: elements.dishDescAr.value.trim() || null,
    description_en: elements.dishDescEn.value.trim() || null,
    description_ku: elements.dishDescKu.value.trim() || null
  };

  elements.dishSubmitBtn.disabled = true;
  elements.dishSubmitBtn.innerHTML = '<span class="spinner"></span> جاري الحفظ...';

  try {
    const { error } = await supabase
      .from('dishes')
      .upsert(dishData);

    if (error) throw error;

    showToast(editingDishId ? 'تم تعديل الطبق بنجاح!' : 'تم إضافة الطبق بنجاح!');
    closeModal(elements.dishModal);
    loadDashboardData();
  } catch (error) {
    console.error('Submit dish error:', error);
    showToast('فشل حفظ الطبق: ' + error.message, 'error');
  } finally {
    elements.dishSubmitBtn.disabled = false;
    elements.dishSubmitBtn.textContent = editingDishId ? 'حفظ التعديلات' : 'حفظ الطبق';
  }
}

async function deleteDish(id) {
  const dish = currentDishes.find(d => d.id === id);
  if (!dish) return;

  const confirmed = confirm(`هل أنت متأكد من حذف الطبق "${dish.name}"؟`);
  if (!confirmed) return;

  try {
    const { error } = await supabase
      .from('dishes')
      .delete()
      .eq('id', id);

    if (error) throw error;

    showToast('تم حذف الطبق بنجاح');
    loadDashboardData();
  } catch (error) {
    console.error('Delete dish error:', error);
    showToast('حدث خطأ أثناء الحذف: ' + error.message, 'error');
  }
}

/* ══════════════════════════════════════════════════════
   CATEGORY ADD / EDIT / DELETE ACTIONS
   ══════════════════════════════════════════════════════ */
function openCategoryModal(cat = null) {
  elements.categoryForm.reset();

  if (cat) {
    editingCategoryId = cat.id;
    elements.categoryModalTitle.textContent = 'تعديل القسم';
    elements.catIdInput.value = cat.id;
    elements.catIdInput.disabled = true; // Cannot edit slug ID once created
    elements.catIconInput.value = cat.icon || '';
    elements.catTitleAr.value = cat.title;
    elements.catTitleEn.value = cat.title_en || '';
    elements.catTitleKu.value = cat.title_ku || '';
    elements.catOrderInput.value = cat.sort_order;
    elements.categorySubmitBtn.textContent = 'حفظ التعديلات';
  } else {
    editingCategoryId = null;
    elements.categoryModalTitle.textContent = 'إضافة قسم جديد';
    elements.catIdInput.value = '';
    elements.catIdInput.disabled = false;
    elements.categorySubmitBtn.textContent = 'حفظ القسم';
  }

  openModal(elements.categoryModal);
}

async function handleCategoryFormSubmit(e) {
  e.preventDefault();

  const id = elements.catIdInput.value.trim().toLowerCase().replace(/\s+/g, '-');
  if (!id) {
    showToast('المعرف الخاص بالقسم مطلوب', 'error');
    return;
  }

  const catData = {
    id: id,
    title: elements.catTitleAr.value.trim(),
    title_en: elements.catTitleEn.value.trim() || null,
    title_ku: elements.catTitleKu.value.trim() || null,
    icon: elements.catIconInput.value.trim() || null,
    sort_order: parseInt(elements.catOrderInput.value) || 0
  };

  elements.categorySubmitBtn.disabled = true;
  elements.categorySubmitBtn.innerHTML = '<span class="spinner"></span> جاري الحفظ...';

  try {
    const { error } = await supabase
      .from('categories')
      .upsert(catData);

    if (error) throw error;

    showToast(editingCategoryId ? 'تم تعديل القسم بنجاح!' : 'تم إضافة القسم بنجاح!');
    closeModal(elements.categoryModal);
    loadDashboardData();
  } catch (error) {
    console.error('Submit category error:', error);
    showToast('فشل حفظ القسم: ' + error.message, 'error');
  } finally {
    elements.categorySubmitBtn.disabled = false;
    elements.categorySubmitBtn.textContent = editingCategoryId ? 'حفظ التعديلات' : 'حفظ القسم';
  }
}

async function deleteCategory(id) {
  const cat = currentCategories.find(c => c.id === id);
  if (!cat) return;

  const confirmed = confirm(`هل أنت متأكد من حذف القسم "${cat.title}"؟ سيؤدي ذلك أيضاً لحذف كافة الأطباق المرتبطة به!`);
  if (!confirmed) return;

  try {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) throw error;

    showToast('تم حذف القسم والمنتجات المرتبطة به');
    loadDashboardData();
  } catch (error) {
    console.error('Delete category error:', error);
    showToast('حدث خطأ أثناء الحذف: ' + error.message, 'error');
  }
}

/* ══════════════════════════════════════════════════════
   SETTINGS MODAL SAVE
   ══════════════════════════════════════════════════════ */
function handleSettingsSubmit(e) {
  e.preventDefault();
  const url = elements.settingsUrl.value.trim();
  const anonKey = elements.settingsAnon.value.trim();

  if (url && anonKey) {
    localStorage.setItem('tala_supabase_url', url);
    localStorage.setItem('tala_supabase_anon_key', anonKey);

    closeModal(elements.settingsModal);
    showToast('تم حفظ الإعدادات، جاري إعادة الفحص...');

    try {
      supabase = window.supabase.createClient(url, anonKey);
      testConnection();
    } catch (error) {
      console.error(error);
      updateConnectionStatus(false, 'خطأ في الربط');
    }
  }
}

/* ══════════════════════════════════════════════════════
   MODAL CORE LOGIC
   ══════════════════════════════════════════════════════ */
function openModal(modal) {
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal(modal) {
  modal.classList.remove('active');
  document.body.style.overflow = '';
}

/* ══════════════════════════════════════════════════════
   EXCELLENCE ITEMS — RENDER TABLE
   ══════════════════════════════════════════════════════ */
function renderExcellenceTable() {
  const tbody = elements.excellenceTbody;
  tbody.innerHTML = '';

  if (currentExcellenceItems.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="4" class="empty-state">
          <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path></svg>
          <h3>لا توجد أطباق تميز مضافة بعد</h3>
          <p>قم بإضافة طبق تميز ليظهر في النافذة المنبثقة للزبائن في الصفحة الرئيسية.</p>
        </td>
      </tr>
    `;
    return;
  }

  const FALLBACK_IMG = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='50' height='50'><rect width='50' height='50' fill='%23221f1a'/><text x='25' y='30' fill='%23777' text-anchor='middle'>📷</text></svg>";

  currentExcellenceItems.forEach(item => {
    const tr = document.createElement('tr');
    const imgSrc = item.image || FALLBACK_IMG;
    tr.innerHTML = `
      <td class="text-center">
        <img class="td-image" src="${imgSrc}" alt="${item.name}" onerror="handleImageError(this, 'dish')" />
      </td>
      <td>
        <strong style="display:block;">${item.name}</strong>
        <span style="font-size:0.75rem; color:var(--clr-text-muted);">${item.name_en || ''} | ${item.name_ku || ''}</span>
      </td>
      <td><strong style="color:var(--clr-gold-start);">${formatPrice(item.price)}</strong></td>
      <td class="actions-cell">
        <button class="btn btn--secondary btn--small edit-excellence-btn" data-id="${item.id}">تعديل</button>
        <button class="btn btn--danger btn--small delete-excellence-btn" data-id="${item.id}">حذف</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

/* ══════════════════════════════════════════════════════
   EXCELLENCE ITEMS — OPEN / SUBMIT / DELETE
   ══════════════════════════════════════════════════════ */
function openExcellenceModal(item = null) {
  elements.excellenceForm.reset();
  elements.excellenceImagePreview.innerHTML = '<span style="color: var(--clr-text-muted); font-size: 1.5rem;">📷</span>';
  elements.excellenceFileStatus.textContent = '';
  elements.excellenceImageFile.value = '';
  
  // Populate the import dropdown
  elements.excellenceImportDish.innerHTML = '<option value="">-- اختر طبقاً لنسخ بياناته --</option>';
  currentDishes.forEach(dish => {
    const opt = document.createElement('option');
    opt.value = dish.id;
    opt.textContent = dish.name;
    elements.excellenceImportDish.appendChild(opt);
  });
  elements.excellenceImportDish.value = '';


  if (item) {
    editingExcellenceId = item.id;
    elements.excellenceModalTitle.textContent = 'تعديل طبق التميز';
    elements.excellenceId.value = item.id;
    elements.excellenceImageUrl.value = item.image || '';
    if (item.image) {
      elements.excellenceImagePreview.innerHTML = `<img src="${item.image}" alt="Preview" />`;
    }
    elements.excellencePrice.value = item.price;
    elements.excellenceNameAr.value = item.name;
    elements.excellenceNameEn.value = item.name_en || '';
    elements.excellenceNameKu.value = item.name_ku || '';
    elements.excellenceDescAr.value = item.description || '';
    elements.excellenceDescEn.value = item.description_en || '';
    elements.excellenceDescKu.value = item.description_ku || '';
    elements.excellenceSubmitBtn.textContent = 'حفظ التعديلات';
  } else {
    editingExcellenceId = null;
    elements.excellenceModalTitle.textContent = 'إضافة طبق تميز جديد';
    elements.excellenceId.value = '';
    elements.excellenceSubmitBtn.textContent = 'حفظ طبق التميز';
  }

  openModal(elements.excellenceModal);
}

async function handleExcellenceFormSubmit(e) {
  e.preventDefault();

  const id = editingExcellenceId || 'exc' + Math.random().toString(36).substring(2, 9);
  const itemData = {
    id,
    price: parseInt(elements.excellencePrice.value),
    image: elements.excellenceImageUrl.value.trim() || null,
    name: elements.excellenceNameAr.value.trim(),
    name_en: elements.excellenceNameEn.value.trim() || null,
    name_ku: elements.excellenceNameKu.value.trim() || null,
    description: elements.excellenceDescAr.value.trim() || null,
    description_en: elements.excellenceDescEn.value.trim() || null,
    description_ku: elements.excellenceDescKu.value.trim() || null,
  };

  elements.excellenceSubmitBtn.disabled = true;
  elements.excellenceSubmitBtn.innerHTML = '<span class="spinner"></span> جاري الحفظ...';

  try {
    const { error } = await supabase.from('excellence_items').upsert(itemData);
    if (error) throw error;
    showToast(editingExcellenceId ? 'تم تعديل طبق التميز بنجاح!' : 'تم إضافة طبق التميز بنجاح!');
    closeModal(elements.excellenceModal);
    loadDashboardData();
  } catch (error) {
    console.error('Excellence submit error:', error);
    showToast('فشل حفظ الطبق: ' + error.message, 'error');
  } finally {
    elements.excellenceSubmitBtn.disabled = false;
    elements.excellenceSubmitBtn.textContent = editingExcellenceId ? 'حفظ التعديلات' : 'حفظ طبق التميز';
  }
}

async function deleteExcellenceItem(id) {
  const item = currentExcellenceItems.find(x => x.id === id);
  if (!item) return;
  if (!confirm(`هل أنت متأكد من حذف طبق التميز "${item.name}"؟`)) return;

  try {
    const { error } = await supabase.from('excellence_items').delete().eq('id', id);
    if (error) throw error;
    showToast('تم حذف طبق التميز بنجاح');
    loadDashboardData();
  } catch (error) {
    console.error('Delete excellence error:', error);
    showToast('حدث خطأ أثناء الحذف: ' + error.message, 'error');
  }
}

async function handleExcellenceImageUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    showToast('حجم الصورة كبير جداً. الحد الأقصى 5MB', 'error');
    return;
  }

  elements.excellenceFileStatus.textContent = 'جاري رفع الصورة...';
  
  const fileExt = file.name.split('.').pop();
  const fileName = `excellence_${Date.now()}.${fileExt}`;

  try {
    const { data, error } = await supabase.storage
      .from('menu-images')
      .upload(fileName, file, { upsert: true });

    if (error) throw error;

    const { data: urlData } = supabase.storage.from('menu-images').getPublicUrl(fileName);
    const publicUrl = urlData.publicUrl;

    elements.excellenceImageUrl.value = publicUrl;
    elements.excellenceImagePreview.innerHTML = `<img src="${publicUrl}" alt="Preview" />`;
    elements.excellenceFileStatus.textContent = '✓ تم رفع الصورة بنجاح';
  } catch (error) {
    console.error('Excellence image upload error:', error);
    elements.excellenceFileStatus.textContent = 'فشل رفع الصورة';
    showToast('فشل رفع الصورة: ' + error.message, 'error');
  }
}

async function handleTranslateExcellenceNames() {
  const arText = elements.excellenceNameAr.value.trim();
  if (!arText) { showToast('يرجى إدخال الاسم بالعربية أولاً', 'error'); return; }
  elements.btnTranslateExcellenceNames.disabled = true;
  elements.btnTranslateExcellenceNames.textContent = '⏳ جاري الترجمة...';
  try {
    const [en, ku] = await Promise.all([
      translateText(arText, 'ar', 'en'),
      translateText(arText, 'ar', 'ku')
    ]);
    if (en) elements.excellenceNameEn.value = en;
    if (ku) elements.excellenceNameKu.value = ku;
    showToast('تمت الترجمة بنجاح!');
  } catch (err) {
    showToast('حدث خطأ أثناء الترجمة', 'error');
  } finally {
    elements.btnTranslateExcellenceNames.disabled = false;
    elements.btnTranslateExcellenceNames.textContent = '✨ ترجمة فورية من العربية';
  }
}

async function handleTranslateExcellenceDescs() {
  const arText = elements.excellenceDescAr.value.trim();
  if (!arText) { showToast('يرجى إدخال الوصف بالعربية أولاً', 'error'); return; }
  elements.btnTranslateExcellenceDescs.disabled = true;
  elements.btnTranslateExcellenceDescs.textContent = '⏳ جاري الترجمة...';
  try {
    const [en, ku] = await Promise.all([
      translateText(arText, 'ar', 'en'),
      translateText(arText, 'ar', 'ku')
    ]);
    if (en) elements.excellenceDescEn.value = en;
    if (ku) elements.excellenceDescKu.value = ku;
    showToast('تمت الترجمة بنجاح!');
  } catch (err) {
    showToast('حدث خطأ أثناء الترجمة', 'error');
  } finally {
    elements.btnTranslateExcellenceDescs.disabled = false;
    elements.btnTranslateExcellenceDescs.textContent = '✨ ترجمة فورية من العربية';
  }
}

/* ══════════════════════════════════════════════════════
   EVENT LISTENERS & TAB IMPLEMENTATION
   ══════════════════════════════════════════════════════ */

// Tab switching
elements.tabButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    elements.tabButtons.forEach(b => b.classList.remove('active'));
    elements.tabContents.forEach(c => c.classList.remove('active'));

    btn.classList.add('active');
    document.getElementById(btn.dataset.target).classList.add('active');
  });
});

// Dishes search & filter trigger
elements.dishSearch.addEventListener('input', renderDishesTable);
elements.dishCategoryFilter.addEventListener('change', renderDishesTable);

// Button click listeners
elements.addDishBtn.addEventListener('click', () => openDishModal());
elements.addCategoryBtn.addEventListener('click', () => openCategoryModal());

// Translation Trigger buttons
elements.btnTranslateNames.addEventListener('click', handleTranslateNames);
elements.btnTranslateDescs.addEventListener('click', handleTranslateDescs);
elements.btnTranslateCats.addEventListener('click', handleTranslateCats);

// Image File Input Trigger
elements.dishImageFile.addEventListener('change', handleImageUpload);

// Form submits
elements.dishForm.addEventListener('submit', handleDishFormSubmit);
elements.categoryForm.addEventListener('submit', handleCategoryFormSubmit);
elements.excellenceForm.addEventListener('submit', handleExcellenceFormSubmit);

elements.dishModalClose.addEventListener('click', () => closeModal(elements.dishModal));
elements.dishModalCancel.addEventListener('click', () => closeModal(elements.dishModal));

elements.categoryModalClose.addEventListener('click', () => closeModal(elements.categoryModal));
elements.categoryModalCancel.addEventListener('click', () => closeModal(elements.categoryModal));

elements.excellenceModalClose.addEventListener('click', () => closeModal(elements.excellenceModal));
elements.excellenceModalCancel.addEventListener('click', () => closeModal(elements.excellenceModal));

// Import from dish change listener
elements.excellenceImportDish.addEventListener('change', (e) => {
  const dishId = e.target.value;
  if (!dishId) return;
  const dish = currentDishes.find(d => d.id === dishId);
  if (dish) {
    elements.excellenceNameAr.value = dish.name;
    elements.excellenceNameEn.value = dish.name_en || '';
    elements.excellenceNameKu.value = dish.name_ku || '';
    elements.excellenceDescAr.value = dish.description || '';
    elements.excellenceDescEn.value = dish.description_en || '';
    elements.excellenceDescKu.value = dish.description_ku || '';
    elements.excellencePrice.value = dish.price || '';
    
    if (dish.image) {
      elements.excellenceImageUrl.value = dish.image;
      elements.excellenceImagePreview.innerHTML = `<img src="${dish.image}" alt="Preview" />`;
    }
    
    showToast('تم استيراد بيانات الطبق بنجاح');
  }
});

// Excellence button listeners
elements.addExcellenceBtn.addEventListener('click', () => openExcellenceModal());
elements.btnTranslateExcellenceNames.addEventListener('click', handleTranslateExcellenceNames);
elements.btnTranslateExcellenceDescs.addEventListener('click', handleTranslateExcellenceDescs);
elements.excellenceImageFile.addEventListener('change', handleExcellenceImageUpload);

// Excellence table delegation
elements.excellenceTbody.addEventListener('click', (e) => {
  const target = e.target;
  if (target.classList.contains('edit-excellence-btn')) {
    const id = target.dataset.id;
    const item = currentExcellenceItems.find(x => x.id === id);
    openExcellenceModal(item);
  } else if (target.classList.contains('delete-excellence-btn')) {
    deleteExcellenceItem(target.dataset.id);
  }
});
// Modal Backdrop Click closes modal (optionally)
document.querySelectorAll('.modal').forEach(modal => {
  modal.querySelector('.modal__backdrop').addEventListener('click', () => {
    closeModal(modal);
  });
});

// Event Delegation for Edit/Delete Buttons in Tables
elements.dishesTbody.addEventListener('click', (e) => {
  const target = e.target;
  if (target.classList.contains('edit-dish-btn')) {
    const id = target.dataset.id;
    const dish = currentDishes.find(d => d.id === id);
    openDishModal(dish);
  } else if (target.classList.contains('delete-dish-btn')) {
    const id = target.dataset.id;
    deleteDish(id);
  }
});

elements.categoriesTbody.addEventListener('click', (e) => {
  const target = e.target;
  if (target.classList.contains('edit-cat-btn')) {
    const id = target.dataset.id;
    const cat = currentCategories.find(c => c.id === id);
    openCategoryModal(cat);
  } else if (target.classList.contains('delete-cat-btn')) {
    const id = target.dataset.id;
    deleteCategory(id);
  }
});

// ESC key closes modals
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal.active').forEach(modal => {
      closeModal(modal);
    });
  }
});

// Initialize on Load
window.addEventListener('DOMContentLoaded', initSupabase);

})();
