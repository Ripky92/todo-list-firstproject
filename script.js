/**
 * TaskFlow — Interactive Modern To-Do List Application
 * Core JavaScript Logic with Notes, Multi-Format Attachments & Comments
 */

// ==========================================================================
// 1. Initial State & Configuration
// ==========================================================================
const STORAGE_KEYS = {
  TASKS: 'taskflow_tasks_v2',
  SETTINGS: 'taskflow_settings_v2'
};

// Helper to create small sample inline SVG data URL for demo images
function createSampleSvgDataUrl(bgColor, text) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="250" viewBox="0 0 400 250">
    <rect width="400" height="250" rx="12" fill="${bgColor}"/>
    <circle cx="200" cy="110" r="45" fill="rgba(255,255,255,0.2)"/>
    <path d="M185 110L195 120L215 100" stroke="white" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
    <text x="200" y="185" font-family="sans-serif" font-size="20" font-weight="bold" fill="white" text-anchor="middle">${text}</text>
  </svg>`;
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

// Sample dummy text file data url
function createSampleDocDataUrl(text) {
  return 'data:text/plain;charset=utf-8,' + encodeURIComponent(text);
}

// Default initial tasks with rich details, notes, attachments, and comments
const INITIAL_SAMPLE_TASKS = [
  {
    id: 'task-1',
    title: 'Menyelesaikan desain antarmuka aplikasi TaskFlow',
    description: 'Pastikan tata letak Glassmorphism terlihat modern dan nyaman di mata pengguna. Periksa kontras warna untuk tema gelap dan pastikan seluruh tombol filter berfungsi dengan responsif.',
    completed: false,
    dueDate: getFormattedDateOffset(0), // Hari ini
    priority: 'high',
    category: 'Pekerjaan',
    attachments: [
      {
        id: 'att-1',
        name: 'Wireframe_Dashboard.svg',
        type: 'image/svg+xml',
        size: 14200,
        data: createSampleSvgDataUrl('#6366F1', 'TaskFlow UI Design'),
        uploadedAt: new Date(Date.now() - 7200000).toISOString()
      },
      {
        id: 'att-2',
        name: 'Design_System_Spec.txt',
        type: 'text/plain',
        size: 3450,
        data: createSampleDocDataUrl('TaskFlow Color Palette:\n- Primary: #6366F1\n- Accent: #8B5CF6\n- Background: #F4F6FC\n- Typography: Plus Jakarta Sans'),
        uploadedAt: new Date(Date.now() - 7000000).toISOString()
      }
    ],
    comments: [
      {
        id: 'com-1',
        text: 'Warna gradient dan komponen checkbox interaktif telah siap diuji coba.',
        author: 'Anda',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        attachment: null
      }
    ],
    createdAt: new Date(Date.now() - 10800000).toISOString()
  },
  {
    id: 'task-2',
    title: 'Belajar konsep JavaScript FileReader API & LocalStorage',
    description: 'Mempelajari cara mengubah berkas gambar dan dokumen menjadi format Base64 Data URL agar dapat disimpan dan diakses secara offline di LocalStorage browser.',
    completed: false,
    dueDate: getFormattedDateOffset(1), // Besok
    priority: 'medium',
    category: 'Belajar',
    attachments: [
      {
        id: 'att-3',
        name: 'Diagram_FileReader_API.svg',
        type: 'image/svg+xml',
        size: 12800,
        data: createSampleSvgDataUrl('#EC4899', 'FileReader API Workflow'),
        uploadedAt: new Date(Date.now() - 14400000).toISOString()
      }
    ],
    comments: [],
    createdAt: new Date(Date.now() - 18000000).toISOString()
  },
  {
    id: 'task-3',
    title: 'Membeli perlengkapan rumah & belanja bulanan',
    description: 'Daftar belanjaan: Deterjen, sabun mandi, buah-buahan segar, kopi bubuk, dan susu.',
    completed: true,
    dueDate: getFormattedDateOffset(-1), // Kemarin
    priority: 'low',
    category: 'Pribadi',
    attachments: [],
    comments: [
      {
        id: 'com-2',
        text: 'Semua item utama sudah dibeli di supermarket kemarin sore.',
        author: 'Anda',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        attachment: null
      }
    ],
    createdAt: new Date(Date.now() - 90000000).toISOString()
  }
];

// Application State
const state = {
  tasks: [],
  filters: {
    status: 'all',          // 'all' | 'active' | 'completed'
    searchQuery: '',
    datePreset: 'all',      // 'all' | 'today' | 'tomorrow' | 'week' | 'overdue'
    specificDate: '',
    sortBy: 'created-desc'  // 'created-desc' | 'created-asc' | 'due-asc' | 'due-desc' | 'name-asc' | 'name-desc' | 'priority-desc'
  },
  settings: {
    theme: 'light',
    soundEnabled: true
  },
  
  // Active selected task for detail modal
  selectedTaskId: null,
  
  // Pending attachments in forms
  pendingAddAttachments: [],
  pendingEditAttachments: [],
  editingTaskExistingAttachments: [],
  pendingCommentAttachment: null,
  
  lastDeletedTask: null,
  undoTimeout: null
};

// ==========================================================================
// 2. DOM Elements
// ==========================================================================
const DOM = {
  body: document.body,
  currentDateDisplay: document.getElementById('current-date-display'),
  themeToggleBtn: document.getElementById('theme-toggle-btn'),
  sunIcon: document.querySelector('.sun-icon'),
  moonIcon: document.querySelector('.moon-icon'),
  soundToggleBtn: document.getElementById('sound-toggle-btn'),
  soundOnIcon: document.querySelector('.sound-on-icon'),
  soundOffIcon: document.querySelector('.sound-off-icon'),
  
  // Stats
  statTotal: document.getElementById('stat-total'),
  statActive: document.getElementById('stat-active'),
  statCompleted: document.getElementById('stat-completed'),
  statRate: document.getElementById('stat-rate'),
  progressBarFill: document.getElementById('progress-bar-fill'),
  progressMotivationalText: document.getElementById('progress-motivational-text'),
  
  // Add Form
  addTaskForm: document.getElementById('add-task-form'),
  taskTitleInput: document.getElementById('task-title-input'),
  taskDueDateInput: document.getElementById('task-due-date-input'),
  taskPriorityInput: document.getElementById('task-priority-input'),
  taskCategoryInput: document.getElementById('task-category-input'),
  toggleAddNotesBtn: document.getElementById('toggle-add-notes-btn'),
  addTaskAdvancedSection: document.getElementById('add-task-advanced-section'),
  taskDescriptionInput: document.getElementById('task-description-input'),
  taskAttachmentsInput: document.getElementById('task-attachments-input'),
  addFileDropzone: document.getElementById('add-file-dropzone'),
  addTaskAttachmentsPreview: document.getElementById('add-task-attachments-preview'),
  
  // Controls & Filters
  searchNameInput: document.getElementById('search-name-input'),
  clearSearchBtn: document.getElementById('clear-search-btn'),
  statusTabs: document.querySelectorAll('.status-tab'),
  badgeAll: document.getElementById('badge-all'),
  badgeActive: document.getElementById('badge-active'),
  badgeCompleted: document.getElementById('badge-completed'),
  datePresetsContainer: document.getElementById('date-presets-container'),
  filterSpecificDate: document.getElementById('filter-specific-date'),
  clearDateFilterBtn: document.getElementById('clear-date-filter-btn'),
  sortBySelect: document.getElementById('sort-by-select'),
  showingCountText: document.getElementById('showing-count-text'),
  clearAllFiltersBtn: document.getElementById('clear-all-filters-btn'),
  clearCompletedBtn: document.getElementById('clear-completed-btn'),
  
  // Task List & Empty State
  taskList: document.getElementById('task-list'),
  emptyState: document.getElementById('empty-state'),
  emptyStateTitle: document.getElementById('empty-state-title'),
  emptyStateDesc: document.getElementById('empty-state-desc'),
  
  // Task Detail Modal
  detailModal: document.getElementById('detail-modal'),
  detailModalCloseBtn: document.getElementById('detail-modal-close-btn'),
  detailModalDoneBtn: document.getElementById('detail-modal-done-btn'),
  detailEditShortcutBtn: document.getElementById('detail-edit-shortcut-btn'),
  detailHeaderTags: document.getElementById('detail-header-tags'),
  detailModalTitle: document.getElementById('detail-modal-title'),
  detailModalCreated: document.getElementById('detail-modal-created'),
  detailModalDescription: document.getElementById('detail-modal-description'),
  detailAttachmentsSection: document.getElementById('detail-attachments-section'),
  detailAttachmentsCount: document.getElementById('detail-attachments-count'),
  detailModalAttachments: document.getElementById('detail-modal-attachments'),
  detailCommentsCount: document.getElementById('detail-comments-count'),
  detailCommentsList: document.getElementById('detail-comments-list'),
  addCommentForm: document.getElementById('add-comment-form'),
  newCommentText: document.getElementById('new-comment-text'),
  commentAttachmentInput: document.getElementById('comment-attachment-input'),
  commentAttachedFilename: document.getElementById('comment-attached-filename'),
  
  // Edit Modal
  editModal: document.getElementById('edit-modal'),
  modalCloseBtn: document.getElementById('modal-close-btn'),
  modalCancelBtn: document.getElementById('modal-cancel-btn'),
  editTaskForm: document.getElementById('edit-task-form'),
  editTaskId: document.getElementById('edit-task-id'),
  editTaskTitle: document.getElementById('edit-task-title'),
  editTaskDueDate: document.getElementById('edit-task-due-date'),
  editTaskPriority: document.getElementById('edit-task-priority'),
  editTaskCategory: document.getElementById('edit-task-category'),
  editTaskDescription: document.getElementById('edit-task-description'),
  editExistingAttachments: document.getElementById('edit-existing-attachments'),
  editTaskAttachmentsInput: document.getElementById('edit-task-attachments-input'),
  editFileDropzone: document.getElementById('edit-file-dropzone'),
  editNewAttachmentsPreview: document.getElementById('edit-new-attachments-preview'),
  
  // Lightbox Modal
  lightboxModal: document.getElementById('lightbox-modal'),
  lightboxImage: document.getElementById('lightbox-image'),
  lightboxFilename: document.getElementById('lightbox-filename'),
  lightboxDownloadBtn: document.getElementById('lightbox-download-btn'),
  lightboxCloseBtn: document.getElementById('lightbox-close-btn'),
  
  // Toast & Confetti
  toastContainer: document.getElementById('toast-container'),
  confettiCanvas: document.getElementById('confetti-canvas')
};

// ==========================================================================
// 3. Audio Effects (Web Audio API Synthesizer)
// ==========================================================================
class SoundFX {
  constructor() {
    this.ctx = null;
  }

  init() {
    if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
  }

  playTone(freq, type = 'sine', duration = 0.15, gainVal = 0.1) {
    if (!state.settings.soundEnabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      console.warn('Audio playback error:', e);
    }
  }

  playAdd() {
    this.playTone(523.25, 'sine', 0.12, 0.08); // C5
    setTimeout(() => this.playTone(659.25, 'sine', 0.18, 0.08), 80); // E5
  }

  playComplete() {
    this.playTone(523.25, 'triangle', 0.1, 0.09); // C5
    setTimeout(() => this.playTone(659.25, 'triangle', 0.1, 0.09), 80); // E5
    setTimeout(() => this.playTone(783.99, 'triangle', 0.1, 0.09), 160); // G5
    setTimeout(() => this.playTone(1046.50, 'triangle', 0.25, 0.1), 240); // C6
  }

  playDelete() {
    this.playTone(330.00, 'sine', 0.1, 0.08);
    setTimeout(() => this.playTone(220.00, 'sine', 0.15, 0.06), 70);
  }

  playClick() {
    this.playTone(440, 'sine', 0.05, 0.04);
  }
}

const soundFX = new SoundFX();

// ==========================================================================
// 4. Confetti Celebratory Effects
// ==========================================================================
class ConfettiEffect {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.animationId = null;
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  fire() {
    const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#3b82f6'];
    const particleCount = 70;

    for (let i = 0; i < particleCount; i++) {
      this.particles.push({
        x: window.innerWidth / 2 + (Math.random() - 0.5) * 200,
        y: window.innerHeight * 0.4,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 14,
        vy: (Math.random() - 0.5) * 14 - 6,
        gravity: 0.35,
        rotation: Math.random() * 360,
        vRot: (Math.random() - 0.5) * 10,
        opacity: 1
      });
    }

    if (!this.animationId) {
      this.animate();
    }
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.rotation += p.vRot;
      p.opacity -= 0.015;

      this.ctx.save();
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate((p.rotation * Math.PI) / 180);
      this.ctx.globalAlpha = Math.max(p.opacity, 0);
      this.ctx.fillStyle = p.color;
      this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      this.ctx.restore();

      if (p.opacity <= 0 || p.y > this.canvas.height) {
        this.particles.splice(i, 1);
      }
    }

    if (this.particles.length > 0) {
      this.animationId = requestAnimationFrame(() => this.animate());
    } else {
      this.animationId = null;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }
}

let confetti = null;

// ==========================================================================
// 5. Date & File Helper Functions
// ==========================================================================
function getFormattedDateOffset(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return formatDateToISO(d);
}

function formatDateToISO(dateObj) {
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function renderCurrentDateHeader() {
  const now = new Date();
  const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
  DOM.currentDateDisplay.textContent = now.toLocaleDateString('id-ID', options);
}

function formatDisplayDate(dateStr) {
  if (!dateStr) return '';
  
  const todayStr = getFormattedDateOffset(0);
  const tomorrowStr = getFormattedDateOffset(1);
  const yesterdayStr = getFormattedDateOffset(-1);

  if (dateStr === todayStr) {
    return 'Hari Ini';
  } else if (dateStr === tomorrowStr) {
    return 'Besok';
  } else if (dateStr === yesterdayStr) {
    return 'Kemarin';
  }

  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
  }
  return dateStr;
}

function formatFullDateTime(isoString) {
  if (!isoString) return '';
  const d = new Date(isoString);
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function isDateOverdue(dateStr) {
  if (!dateStr) return false;
  const today = getFormattedDateOffset(0);
  return dateStr < today;
}

function isDateWithinThisWeek(dateStr) {
  if (!dateStr) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);

  const parts = dateStr.split('-');
  const target = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  target.setHours(0, 0, 0, 0);

  return target >= today && target <= nextWeek;
}

function formatBytes(bytes, decimals = 1) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function getFileTypeInfo(fileType, fileName = '') {
  const lowerName = fileName.toLowerCase();
  const lowerType = (fileType || '').toLowerCase();

  if (lowerType.startsWith('image/') || /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(lowerName)) {
    return { isImage: true, icon: '🖼️', label: 'Gambar', colorClass: 'file-image' };
  }
  if (lowerType.includes('pdf') || lowerName.endsWith('.pdf')) {
    return { isImage: false, icon: '📄', label: 'PDF', colorClass: 'file-pdf' };
  }
  if (lowerType.includes('word') || /\.(doc|docx)$/i.test(lowerName)) {
    return { isImage: false, icon: '📝', label: 'Word', colorClass: 'file-word' };
  }
  if (lowerType.includes('sheet') || lowerType.includes('excel') || /\.(xls|xlsx|csv)$/i.test(lowerName)) {
    return { isImage: false, icon: '📊', label: 'Excel', colorClass: 'file-excel' };
  }
  if (lowerType.includes('presentation') || /\.(ppt|pptx)$/i.test(lowerName)) {
    return { isImage: false, icon: '📽️', label: 'PPT', colorClass: 'file-archive' };
  }
  if (lowerType.includes('zip') || lowerType.includes('compressed') || /\.(zip|rar|7z)$/i.test(lowerName)) {
    return { isImage: false, icon: '📦', label: 'Arsip', colorClass: 'file-archive' };
  }
  if (lowerType.includes('text') || lowerName.endsWith('.txt')) {
    return { isImage: false, icon: '📃', label: 'Teks', colorClass: 'file-default' };
  }
  return { isImage: false, icon: '📁', label: 'Berkas', colorClass: 'file-default' };
}

function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    // Check file size (limit 8MB per file for smooth localStorage persistence)
    const maxSizeBytes = 8 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      reject(new Error(`Ukuran file "${file.name}" melebihi batas 8MB`));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      resolve({
        id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        name: file.name,
        type: file.type || 'application/octet-stream',
        size: file.size,
        data: reader.result,
        uploadedAt: new Date().toISOString()
      });
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ==========================================================================
// 6. State Persistence & LocalStorage
// ==========================================================================
function loadStateFromStorage() {
  try {
    const savedTasks = localStorage.getItem(STORAGE_KEYS.TASKS);
    if (savedTasks) {
      state.tasks = JSON.parse(savedTasks);
    } else {
      // Check if old v1 tasks exist to migrate smoothly
      const oldV1 = localStorage.getItem('taskflow_tasks_v1');
      if (oldV1) {
        const parsed = JSON.parse(oldV1);
        state.tasks = parsed.map(t => ({
          ...t,
          description: t.description || '',
          attachments: t.attachments || [],
          comments: t.comments || []
        }));
      } else {
        state.tasks = [...INITIAL_SAMPLE_TASKS];
      }
      saveTasksToStorage();
    }

    const savedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (savedSettings) {
      state.settings = { ...state.settings, ...JSON.parse(savedSettings) };
    }
  } catch (e) {
    console.error('Failed to load from localStorage:', e);
    state.tasks = [...INITIAL_SAMPLE_TASKS];
  }
}

function saveTasksToStorage() {
  try {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(state.tasks));
  } catch (e) {
    console.error('Failed to save tasks to localStorage:', e);
    showToast('Peringatan: Penyimpanan browser hampir penuh.', 'warning');
  }
}

function saveSettingsToStorage() {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(state.settings));
  } catch (e) {
    console.error('Failed to save settings to localStorage:', e);
  }
}

// ==========================================================================
// 7. Filtering & Sorting Engine
// ==========================================================================
function getFilteredAndSortedTasks() {
  const { status, searchQuery, datePreset, specificDate, sortBy } = state.filters;
  const todayStr = getFormattedDateOffset(0);
  const tomorrowStr = getFormattedDateOffset(1);

  // 1. Filter Pipeline
  const filtered = state.tasks.filter(task => {
    // Status Filter
    if (status === 'active' && task.completed) return false;
    if (status === 'completed' && !task.completed) return false;

    // Search Query (Match Title, Description, or Category)
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      const matchTitle = task.title.toLowerCase().includes(q);
      const matchDesc = task.description && task.description.toLowerCase().includes(q);
      const matchCategory = task.category && task.category.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchCategory) return false;
    }

    // Specific Date Picker Filter
    if (specificDate) {
      if (task.dueDate !== specificDate) return false;
    } else {
      // Date Presets
      if (datePreset === 'today') {
        if (task.dueDate !== todayStr) return false;
      } else if (datePreset === 'tomorrow') {
        if (task.dueDate !== tomorrowStr) return false;
      } else if (datePreset === 'week') {
        if (!isDateWithinThisWeek(task.dueDate)) return false;
      } else if (datePreset === 'overdue') {
        if (!isDateOverdue(task.dueDate) || task.completed) return false;
      }
    }

    return true;
  });

  // 2. Sorting Pipeline
  const priorityWeights = { high: 3, medium: 2, low: 1 };

  filtered.sort((a, b) => {
    switch (sortBy) {
      case 'created-desc':
        return new Date(b.createdAt) - new Date(a.createdAt);
      case 'created-asc':
        return new Date(a.createdAt) - new Date(b.createdAt);
      case 'name-asc':
        return a.title.localeCompare(b.title, 'id');
      case 'name-desc':
        return b.title.localeCompare(a.title, 'id');
      case 'due-asc':
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.localeCompare(b.dueDate);
      case 'due-desc':
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return b.dueDate.localeCompare(a.dueDate);
      case 'priority-desc':
        return (priorityWeights[b.priority] || 0) - (priorityWeights[a.priority] || 0);
      default:
        return 0;
    }
  });

  return filtered;
}

// ==========================================================================
// 8. Render Engine
// ==========================================================================
function renderApp() {
  renderStatsAndProgress();
  renderFilterBadges();
  renderTaskList();
}

function renderStatsAndProgress() {
  const total = state.tasks.length;
  const completed = state.tasks.filter(t => t.completed).length;
  const active = total - completed;
  const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

  DOM.statTotal.textContent = total;
  DOM.statActive.textContent = active;
  DOM.statCompleted.textContent = completed;
  DOM.statRate.textContent = `${rate}%`;
  DOM.progressBarFill.style.width = `${rate}%`;

  if (total === 0) {
    DOM.progressMotivationalText.textContent = 'Belum ada tugas. Yuk tambahkan tugas pertamamu! ✨';
  } else if (rate === 100) {
    DOM.progressMotivationalText.textContent = '🎉 Luar biasa! Semua tugas hari ini telah terselesaikan!';
  } else if (rate >= 75) {
    DOM.progressMotivationalText.textContent = '🔥 Hebat! Hampir selesai, tetap semangat!';
  } else if (rate >= 50) {
    DOM.progressMotivationalText.textContent = '💪 Separuh perjalanan terlewati, lanjutkan!';
  } else if (rate > 0) {
    DOM.progressMotivationalText.textContent = '🌟 Langkah awal yang bagus! Terus produktif.';
  } else {
    DOM.progressMotivationalText.textContent = '🚀 Semangat memulai dan menuntaskan tugas hari ini!';
  }
}

function renderFilterBadges() {
  const total = state.tasks.length;
  const active = state.tasks.filter(t => !t.completed).length;
  const completed = state.tasks.filter(t => t.completed).length;

  DOM.badgeAll.textContent = total;
  DOM.badgeActive.textContent = active;
  DOM.badgeCompleted.textContent = completed;
}

function renderTaskList() {
  const visibleTasks = getFilteredAndSortedTasks();
  DOM.taskList.innerHTML = '';

  const hasActiveFilters = state.filters.status !== 'all' || 
                           state.filters.searchQuery !== '' || 
                           state.filters.datePreset !== 'all' || 
                           state.filters.specificDate !== '';

  DOM.showingCountText.textContent = `Menampilkan ${visibleTasks.length} dari ${state.tasks.length} tugas`;
  DOM.clearAllFiltersBtn.style.display = hasActiveFilters ? 'inline-block' : 'none';

  if (visibleTasks.length === 0) {
    DOM.emptyState.style.display = 'flex';
    if (state.tasks.length === 0) {
      DOM.emptyStateTitle.textContent = 'Tidak Ada Tugas';
      DOM.emptyStateDesc.textContent = 'Daftar tugas Anda masih kosong. Masukkan tugas baru pada formulir di atas!';
    } else {
      DOM.emptyStateTitle.textContent = 'Tidak Ada Tugas yang Cocok';
      DOM.emptyStateDesc.textContent = 'Tidak ditemukan tugas yang sesuai dengan kriteria filter atau pencarian Anda.';
    }
    return;
  }

  DOM.emptyState.style.display = 'none';

  visibleTasks.forEach(task => {
    const li = createTaskElement(task);
    DOM.taskList.appendChild(li);
  });
}

function createTaskElement(task) {
  const li = document.createElement('li');
  li.className = `task-item priority-${task.priority} ${task.completed ? 'completed' : ''}`;
  li.dataset.id = task.id;

  // Due Date Badge
  let dueDateHtml = '';
  if (task.dueDate) {
    const isOverdue = !task.completed && isDateOverdue(task.dueDate);
    const isToday = task.dueDate === getFormattedDateOffset(0);
    const dateClass = isOverdue ? 'overdue' : (isToday ? 'today' : '');
    const icon = isOverdue ? '⚠️' : '📅';
    
    dueDateHtml = `
      <span class="tag-badge tag-date ${dateClass}">
        <span>${icon}</span>
        <span>${formatDisplayDate(task.dueDate)}</span>
      </span>
    `;
  }

  // Priority Label
  const priorityLabels = {
    high: '🔴 Tinggi',
    medium: '🟡 Sedang',
    low: '🟢 Rendah'
  };

  // Attachments Info & Thumbnail Strip
  let attachmentsBadgeHtml = '';
  let attachmentsStripHtml = '';
  if (task.attachments && task.attachments.length > 0) {
    attachmentsBadgeHtml = `
      <span class="tag-info-pill" title="${task.attachments.length} berkas terlampir">
        <span>📎</span>
        <span>${task.attachments.length} Berkas</span>
      </span>
    `;

    // Extract image thumbnails (up to 3)
    const imageAttachments = task.attachments.filter(att => getFileTypeInfo(att.type, att.name).isImage);
    if (imageAttachments.length > 0) {
      const thumbsHtml = imageAttachments.slice(0, 3).map(img => `
        <img 
          src="${img.data}" 
          alt="${escapeHtml(img.name)}" 
          class="task-mini-thumb" 
          title="Klik untuk melihat: ${escapeHtml(img.name)}" 
          data-img-src="${img.data}" 
          data-img-name="${escapeHtml(img.name)}"
        />
      `).join('');

      attachmentsStripHtml = `
        <div class="task-card-attachments-strip">
          ${thumbsHtml}
          ${imageAttachments.length > 3 ? `<span class="tag-info-pill">+${imageAttachments.length - 3}</span>` : ''}
        </div>
      `;
    }
  }

  // Comments Badge
  let commentsBadgeHtml = '';
  if (task.comments && task.comments.length > 0) {
    commentsBadgeHtml = `
      <span class="tag-info-pill" title="${task.comments.length} catatan/komentar">
        <span>💬</span>
        <span>${task.comments.length}</span>
      </span>
    `;
  }

  // Description Snippet
  let descriptionSnippetHtml = '';
  if (task.description && task.description.trim()) {
    descriptionSnippetHtml = `
      <p class="task-description-snippet">${escapeHtml(task.description)}</p>
    `;
  }

  li.innerHTML = `
    <div class="task-main">
      <label class="custom-checkbox-wrapper" title="${task.completed ? 'Tandai belum selesai' : 'Tandai selesai'}">
        <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} />
        <span class="checkbox-custom">
          <svg viewBox="0 0 24 24" fill="none">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </span>
      </label>

      <div class="task-content-details" title="Klik untuk melihat detail & catatan">
        <span class="task-title">${escapeHtml(task.title)}</span>
        ${descriptionSnippetHtml}
        ${attachmentsStripHtml}
        <div class="task-meta-row">
          ${task.category ? `<span class="tag-badge tag-category">🏷️ ${escapeHtml(task.category)}</span>` : ''}
          <span class="tag-badge tag-priority-${task.priority}">${priorityLabels[task.priority] || task.priority}</span>
          ${dueDateHtml}
          ${attachmentsBadgeHtml}
          ${commentsBadgeHtml}
        </div>
      </div>
    </div>

    <div class="task-actions">
      <button class="action-icon-btn view-btn" title="Lihat Detail & Catatan" aria-label="Lihat Detail">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
          <circle cx="12" cy="12" r="3"></circle>
        </svg>
      </button>
      <button class="action-icon-btn edit-btn" title="Edit Tugas" aria-label="Edit Tugas">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
        </svg>
      </button>
      <button class="action-icon-btn delete-btn" title="Hapus Tugas" aria-label="Hapus Tugas">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="3 6 5 6 21 6"></polyline>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          <line x1="10" y1="11" x2="10" y2="17"></line>
          <line x1="14" y1="11" x2="14" y2="17"></line>
        </svg>
      </button>
    </div>
  `;

  // Checkbox Event
  const checkbox = li.querySelector('.task-checkbox');
  checkbox.addEventListener('change', () => toggleTaskCompleted(task.id));

  // Detail View Click on Content or View Button
  const contentDetails = li.querySelector('.task-content-details');
  contentDetails.addEventListener('click', (e) => {
    // If mini thumb clicked, open lightbox instead of full modal
    if (e.target.classList.contains('task-mini-thumb')) {
      e.stopPropagation();
      openLightbox(e.target.dataset.imgSrc, e.target.dataset.imgName);
      return;
    }
    openTaskDetailModal(task.id);
  });

  const viewBtn = li.querySelector('.view-btn');
  viewBtn.addEventListener('click', () => openTaskDetailModal(task.id));

  // Edit Button
  const editBtn = li.querySelector('.edit-btn');
  editBtn.addEventListener('click', () => openEditModal(task.id));

  // Delete Button
  const deleteBtn = li.querySelector('.delete-btn');
  deleteBtn.addEventListener('click', () => deleteTask(task.id, li));

  return li;
}

// ==========================================================================
// 9. Task Management (CRUD Operations)
// ==========================================================================
function addTask(title, dueDate, priority, category, description, attachments = []) {
  const trimmed = title.trim();
  if (!trimmed) return;

  const newTask = {
    id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    title: trimmed,
    description: description ? description.trim() : '',
    completed: false,
    dueDate: dueDate || '',
    priority: priority || 'medium',
    category: category || 'Umum',
    attachments: [...attachments],
    comments: [],
    createdAt: new Date().toISOString()
  };

  state.tasks.unshift(newTask);
  saveTasksToStorage();
  renderApp();

  soundFX.playAdd();
  showToast('Tugas baru berhasil ditambahkan! ✨', 'success');

  // Reset Add Form
  DOM.taskTitleInput.value = '';
  DOM.taskDueDateInput.value = '';
  DOM.taskDescriptionInput.value = '';
  DOM.taskAttachmentsInput.value = '';
  state.pendingAddAttachments = [];
  renderAddAttachmentsPreview();
}

function toggleTaskCompleted(taskId) {
  const task = state.tasks.find(t => t.id === taskId);
  if (!task) return;

  task.completed = !task.completed;
  saveTasksToStorage();
  renderApp();

  if (task.completed) {
    soundFX.playComplete();
    
    const total = state.tasks.length;
    const completed = state.tasks.filter(t => t.completed).length;
    if (total > 0 && total === completed) {
      if (confetti) confetti.fire();
      showToast('🎉 Hebat! Semua tugas telah selesai!', 'success');
    }
  } else {
    soundFX.playClick();
  }
}

function deleteTask(taskId, element) {
  const taskIndex = state.tasks.findIndex(t => t.id === taskId);
  if (taskIndex === -1) return;

  const deletedTask = state.tasks[taskIndex];
  state.lastDeletedTask = { task: deletedTask, index: taskIndex };

  soundFX.playDelete();

  // Close detail modal if the deleted task was open
  if (state.selectedTaskId === taskId) {
    closeTaskDetailModal();
  }

  if (element) {
    element.classList.add('removing');
    setTimeout(() => {
      state.tasks.splice(taskIndex, 1);
      saveTasksToStorage();
      renderApp();
      showUndoToast(`Tugas "${deletedTask.title.slice(0, 25)}..." dihapus`);
    }, 280);
  } else {
    state.tasks.splice(taskIndex, 1);
    saveTasksToStorage();
    renderApp();
    showUndoToast(`Tugas dihapus`);
  }
}

function undoDeleteTask() {
  if (!state.lastDeletedTask) return;

  const { task, index } = state.lastDeletedTask;
  state.tasks.splice(index, 0, task);
  state.lastDeletedTask = null;

  saveTasksToStorage();
  renderApp();

  soundFX.playAdd();
  showToast('Tugas berhasil dipulihkan! ↩️', 'info');
}

function clearCompletedTasks() {
  const completedCount = state.tasks.filter(t => t.completed).length;
  if (completedCount === 0) {
    showToast('Tidak ada tugas selesai untuk dihapus.', 'info');
    return;
  }

  if (confirm(`Apakah Anda yakin ingin menghapus ${completedCount} tugas yang sudah selesai?`)) {
    state.tasks = state.tasks.filter(t => !t.completed);
    saveTasksToStorage();
    renderApp();
    soundFX.playDelete();
    showToast(`${completedCount} tugas selesai berhasil dibersihkan! 🧹`, 'info');
  }
}

// ==========================================================================
// 10. Task Detail Modal & Comments System
// ==========================================================================
function openTaskDetailModal(taskId) {
  const task = state.tasks.find(t => t.id === taskId);
  if (!task) return;

  state.selectedTaskId = task.id;
  state.pendingCommentAttachment = null;
  DOM.newCommentText.value = '';
  DOM.commentAttachmentInput.value = '';
  DOM.commentAttachedFilename.textContent = '';

  // Render Header Tags
  const priorityLabels = { high: '🔴 Prioritas Tinggi', medium: '🟡 Prioritas Sedang', low: '🟢 Prioritas Rendah' };
  const statusLabel = task.completed ? '✅ Selesai' : '⏳ Aktif';
  const statusClass = task.completed ? 'tag-priority-low' : 'tag-category';

  DOM.detailHeaderTags.innerHTML = `
    <span class="tag-badge ${statusClass}">${statusLabel}</span>
    <span class="tag-badge tag-priority-${task.priority}">${priorityLabels[task.priority]}</span>
    ${task.category ? `<span class="tag-badge tag-category">🏷️ ${escapeHtml(task.category)}</span>` : ''}
    ${task.dueDate ? `<span class="tag-badge tag-date">📅 ${formatDisplayDate(task.dueDate)}</span>` : ''}
  `;

  DOM.detailModalTitle.textContent = task.title;
  DOM.detailModalCreated.textContent = `Dibuat pada: ${formatFullDateTime(task.createdAt)}`;

  // Render Description
  if (task.description && task.description.trim()) {
    DOM.detailModalDescription.textContent = task.description;
    DOM.detailModalDescription.classList.remove('empty');
  } else {
    DOM.detailModalDescription.textContent = 'Belum ada catatan detail untuk tugas ini. Klik "Edit Tugas" untuk menambahkan catatan atau instruksi.';
    DOM.detailModalDescription.classList.add('empty');
  }

  // Render Attachments Gallery
  renderDetailAttachmentsGallery(task);

  // Render Comments List
  renderDetailCommentsList(task);

  DOM.detailModal.classList.add('open');
  DOM.detailModal.setAttribute('aria-hidden', 'false');
  soundFX.playClick();
}

function closeTaskDetailModal() {
  DOM.detailModal.classList.remove('open');
  DOM.detailModal.setAttribute('aria-hidden', 'true');
  state.selectedTaskId = null;
}

function renderDetailAttachmentsGallery(task) {
  const attachments = task.attachments || [];
  DOM.detailAttachmentsCount.textContent = attachments.length;

  if (attachments.length === 0) {
    DOM.detailModalAttachments.innerHTML = `
      <p style="color: var(--text-muted); font-size: 0.85rem; grid-column: 1 / -1; font-style: italic;">
        Tidak ada berkas yang dilampirkan pada tugas ini.
      </p>
    `;
    return;
  }

  DOM.detailModalAttachments.innerHTML = '';
  attachments.forEach(att => {
    const typeInfo = getFileTypeInfo(att.type, att.name);
    const card = document.createElement('div');
    card.className = `attachment-gallery-card ${typeInfo.isImage ? 'image-card' : ''}`;

    if (typeInfo.isImage) {
      card.innerHTML = `
        <img src="${att.data}" alt="${escapeHtml(att.name)}" class="gallery-img-preview" />
        <div class="gallery-card-info">
          <span class="gallery-file-name" title="${escapeHtml(att.name)}">${escapeHtml(att.name)}</span>
          <div class="gallery-file-meta">
            <span>${formatBytes(att.size)}</span>
            <a href="${att.data}" download="${escapeHtml(att.name)}" class="download-link-btn" title="Unduh">⬇ Unduh</a>
          </div>
        </div>
      `;
      card.addEventListener('click', (e) => {
        if (!e.target.classList.contains('download-link-btn')) {
          openLightbox(att.data, att.name);
        }
      });
    } else {
      card.innerHTML = `
        <div class="gallery-file-badge">
          ${typeInfo.icon}
        </div>
        <div class="gallery-card-info">
          <span class="gallery-file-name" title="${escapeHtml(att.name)}">${escapeHtml(att.name)}</span>
          <div class="gallery-file-meta">
            <span>${formatBytes(att.size)}</span>
            <a href="${att.data}" download="${escapeHtml(att.name)}" class="download-link-btn" title="Unduh">⬇ Unduh</a>
          </div>
        </div>
      `;
    }

    DOM.detailModalAttachments.appendChild(card);
  });
}

function renderDetailCommentsList(task) {
  const comments = task.comments || [];
  DOM.detailCommentsCount.textContent = comments.length;

  if (comments.length === 0) {
    DOM.detailCommentsList.innerHTML = `
      <p style="color: var(--text-muted); font-size: 0.85rem; font-style: italic; padding: 0.5rem 0;">
        Belum ada komentar atau riwayat catatan. Tulis komentar pertamamu di bawah!
      </p>
    `;
    return;
  }

  DOM.detailCommentsList.innerHTML = '';
  comments.forEach(com => {
    const bubble = document.createElement('div');
    bubble.className = 'comment-bubble';

    let attachmentHtml = '';
    if (com.attachment) {
      const typeInfo = getFileTypeInfo(com.attachment.type, com.attachment.name);
      if (typeInfo.isImage) {
        attachmentHtml = `
          <div class="comment-file-preview">
            <img 
              src="${com.attachment.data}" 
              alt="${escapeHtml(com.attachment.name)}" 
              class="task-mini-thumb" 
              style="width: 48px; height: 48px;" 
              data-img-src="${com.attachment.data}" 
              data-img-name="${escapeHtml(com.attachment.name)}"
            />
          </div>
        `;
      } else {
        attachmentHtml = `
          <div class="comment-file-preview">
            <a href="${com.attachment.data}" download="${escapeHtml(com.attachment.name)}" class="tag-info-pill" style="text-decoration: none;">
              <span>${typeInfo.icon}</span>
              <span>${escapeHtml(com.attachment.name)}</span>
              <span>(${formatBytes(com.attachment.size)})</span>
            </a>
          </div>
        `;
      }
    }

    bubble.innerHTML = `
      <div class="comment-header">
        <span class="comment-author">👤 ${escapeHtml(com.author || 'Anda')}</span>
        <span class="comment-time">${formatFullDateTime(com.createdAt)}</span>
      </div>
      <div class="comment-text">${escapeHtml(com.text)}</div>
      ${attachmentHtml}
    `;

    // Click on thumbnail inside comment opens lightbox
    const thumb = bubble.querySelector('.task-mini-thumb');
    if (thumb) {
      thumb.addEventListener('click', () => openLightbox(thumb.dataset.imgSrc, thumb.dataset.imgName));
    }

    DOM.detailCommentsList.appendChild(bubble);
  });

  // Scroll comments to bottom
  DOM.detailCommentsList.scrollTop = DOM.detailCommentsList.scrollHeight;
}

function handleAddCommentSubmit(e) {
  e.preventDefault();
  if (!state.selectedTaskId) return;

  const task = state.tasks.find(t => t.id === state.selectedTaskId);
  if (!task) return;

  const text = DOM.newCommentText.value.trim();
  if (!text) return;

  if (!task.comments) task.comments = [];

  const newComment = {
    id: `com-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    text: text,
    author: 'Anda',
    createdAt: new Date().toISOString(),
    attachment: state.pendingCommentAttachment || null
  };

  task.comments.push(newComment);
  saveTasksToStorage();

  // Reset comment form
  DOM.newCommentText.value = '';
  DOM.commentAttachmentInput.value = '';
  DOM.commentAttachedFilename.textContent = '';
  state.pendingCommentAttachment = null;

  renderDetailCommentsList(task);
  renderApp(); // Update comment counter badge on task card

  soundFX.playClick();
  showToast('Catatan komentar berhasil ditambahkan! 💬', 'info');
}

// ==========================================================================
// 11. Lightbox Image Modal Management
// ==========================================================================
function openLightbox(imageSrc, filename) {
  DOM.lightboxImage.src = imageSrc;
  DOM.lightboxFilename.textContent = filename || 'Pratinjau Gambar';
  DOM.lightboxDownloadBtn.href = imageSrc;
  DOM.lightboxDownloadBtn.download = filename || 'gambar_taskflow.png';

  DOM.lightboxModal.classList.add('open');
  DOM.lightboxModal.setAttribute('aria-hidden', 'false');
  soundFX.playClick();
}

function closeLightbox() {
  DOM.lightboxModal.classList.remove('open');
  DOM.lightboxModal.setAttribute('aria-hidden', 'true');
  DOM.lightboxImage.src = '';
}

// ==========================================================================
// 12. Edit Modal Management
// ==========================================================================
function openEditModal(taskId) {
  const task = state.tasks.find(t => t.id === taskId);
  if (!task) return;

  DOM.editTaskId.value = task.id;
  DOM.editTaskTitle.value = task.title;
  DOM.editTaskDueDate.value = task.dueDate || '';
  DOM.editTaskPriority.value = task.priority || 'medium';
  DOM.editTaskCategory.value = task.category || 'Umum';
  DOM.editTaskDescription.value = task.description || '';

  // Setup attachments editing state
  state.editingTaskExistingAttachments = task.attachments ? [...task.attachments] : [];
  state.pendingEditAttachments = [];
  DOM.editTaskAttachmentsInput.value = '';

  renderEditAttachmentsList();
  renderEditNewAttachmentsPreview();

  // Close detail modal if open
  if (DOM.detailModal.classList.contains('open')) {
    closeTaskDetailModal();
  }

  DOM.editModal.classList.add('open');
  DOM.editModal.setAttribute('aria-hidden', 'false');
  DOM.editTaskTitle.focus();
}

function closeEditModal() {
  DOM.editModal.classList.remove('open');
  DOM.editModal.setAttribute('aria-hidden', 'true');
}

function renderEditAttachmentsList() {
  DOM.editExistingAttachments.innerHTML = '';

  if (state.editingTaskExistingAttachments.length === 0) {
    DOM.editExistingAttachments.innerHTML = `
      <span style="font-size: 0.8rem; color: var(--text-muted); font-style: italic;">
        Tidak ada berkas lampiran saat ini.
      </span>
    `;
    return;
  }

  state.editingTaskExistingAttachments.forEach((att, index) => {
    const typeInfo = getFileTypeInfo(att.type, att.name);
    const row = document.createElement('div');
    row.className = 'edit-attachment-row';

    row.innerHTML = `
      <div class="edit-attachment-row-info">
        <span>${typeInfo.icon}</span>
        <span class="file-name" style="font-weight: 500;">${escapeHtml(att.name)}</span>
        <span style="color: var(--text-muted); font-size: 0.72rem;">(${formatBytes(att.size)})</span>
      </div>
      <button type="button" class="edit-attachment-delete-btn" title="Hapus lampiran ini">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="3 6 5 6 21 6"></polyline>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        </svg>
      </button>
    `;

    const deleteBtn = row.querySelector('.edit-attachment-delete-btn');
    deleteBtn.addEventListener('click', () => {
      state.editingTaskExistingAttachments.splice(index, 1);
      renderEditAttachmentsList();
    });

    DOM.editExistingAttachments.appendChild(row);
  });
}

function renderEditNewAttachmentsPreview() {
  DOM.editNewAttachmentsPreview.innerHTML = '';
  state.pendingEditAttachments.forEach((att, index) => {
    const typeInfo = getFileTypeInfo(att.type, att.name);
    const chip = document.createElement('div');
    chip.className = 'attachment-chip';

    chip.innerHTML = `
      ${typeInfo.isImage ? `<img src="${att.data}" class="file-thumb" alt="thumb" />` : `<span class="file-type-icon">${typeInfo.icon}</span>`}
      <span class="file-name">${escapeHtml(att.name)}</span>
      <span class="file-size">${formatBytes(att.size)}</span>
      <button type="button" class="chip-remove-btn" title="Batal lampirkan">✕</button>
    `;

    const removeBtn = chip.querySelector('.chip-remove-btn');
    removeBtn.addEventListener('click', () => {
      state.pendingEditAttachments.splice(index, 1);
      renderEditNewAttachmentsPreview();
    });

    DOM.editNewAttachmentsPreview.appendChild(chip);
  });
}

function handleEditFormSubmit(e) {
  e.preventDefault();
  const id = DOM.editTaskId.value;
  const task = state.tasks.find(t => t.id === id);
  if (!task) return;

  const newTitle = DOM.editTaskTitle.value.trim();
  if (!newTitle) return;

  task.title = newTitle;
  task.dueDate = DOM.editTaskDueDate.value || '';
  task.priority = DOM.editTaskPriority.value;
  task.category = DOM.editTaskCategory.value;
  task.description = DOM.editTaskDescription.value.trim();

  // Combine existing attachments with newly uploaded attachments
  task.attachments = [
    ...state.editingTaskExistingAttachments,
    ...state.pendingEditAttachments
  ];

  saveTasksToStorage();
  renderApp();
  closeEditModal();

  soundFX.playClick();
  showToast('Perubahan tugas berhasil disimpan! 💾', 'success');
}

// ==========================================================================
// 13. File Upload Handlers (Add Form, Edit Form, Comment Form)
// ==========================================================================
function renderAddAttachmentsPreview() {
  DOM.addTaskAttachmentsPreview.innerHTML = '';
  state.pendingAddAttachments.forEach((att, index) => {
    const typeInfo = getFileTypeInfo(att.type, att.name);
    const chip = document.createElement('div');
    chip.className = 'attachment-chip';

    chip.innerHTML = `
      ${typeInfo.isImage ? `<img src="${att.data}" class="file-thumb" alt="thumb" />` : `<span class="file-type-icon">${typeInfo.icon}</span>`}
      <span class="file-name">${escapeHtml(att.name)}</span>
      <span class="file-size">${formatBytes(att.size)}</span>
      <button type="button" class="chip-remove-btn" title="Hapus berkas ini">✕</button>
    `;

    const removeBtn = chip.querySelector('.chip-remove-btn');
    removeBtn.addEventListener('click', () => {
      state.pendingAddAttachments.splice(index, 1);
      renderAddAttachmentsPreview();
    });

    DOM.addTaskAttachmentsPreview.appendChild(chip);
  });
}

async function handleFilesUpload(fileList, targetArray, renderCallback) {
  const files = Array.from(fileList);
  for (const file of files) {
    try {
      const processed = await readFileAsBase64(file);
      targetArray.push(processed);
    } catch (err) {
      showToast(err.message || 'Gagal membaca berkas.', 'warning');
    }
  }
  renderCallback();
}

// ==========================================================================
// 14. Toast Notifications
// ==========================================================================
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;

  DOM.toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('hiding');
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

function showUndoToast(message) {
  if (state.undoTimeout) {
    clearTimeout(state.undoTimeout);
  }

  const existing = DOM.toastContainer.querySelectorAll('.toast-undo');
  existing.forEach(el => el.remove());

  const toast = document.createElement('div');
  toast.className = 'toast toast-undo';
  toast.innerHTML = `
    <span>${escapeHtml(message)}</span>
    <button class="toast-btn" id="toast-undo-action-btn">Urungkan</button>
  `;

  DOM.toastContainer.appendChild(toast);

  const undoBtn = toast.querySelector('#toast-undo-action-btn');
  undoBtn.addEventListener('click', () => {
    undoDeleteTask();
    toast.classList.add('hiding');
    setTimeout(() => toast.remove(), 300);
  });

  state.undoTimeout = setTimeout(() => {
    state.lastDeletedTask = null;
    toast.classList.add('hiding');
    setTimeout(() => toast.remove(), 300);
  }, 5000);
}

// ==========================================================================
// 15. Theme & Sound Settings Handlers
// ==========================================================================
function applyTheme(theme) {
  state.settings.theme = theme;
  DOM.body.setAttribute('data-theme', theme);

  if (theme === 'dark') {
    DOM.sunIcon.style.display = 'none';
    DOM.moonIcon.style.display = 'block';
  } else {
    DOM.sunIcon.style.display = 'block';
    DOM.moonIcon.style.display = 'none';
  }

  saveSettingsToStorage();
}

function toggleTheme() {
  const nextTheme = state.settings.theme === 'dark' ? 'light' : 'dark';
  applyTheme(nextTheme);
  soundFX.playClick();
}

function applySoundSetting(enabled) {
  state.settings.soundEnabled = enabled;
  if (enabled) {
    DOM.soundOnIcon.style.display = 'block';
    DOM.soundOffIcon.style.display = 'none';
  } else {
    DOM.soundOnIcon.style.display = 'none';
    DOM.soundOffIcon.style.display = 'block';
  }
  saveSettingsToStorage();
}

function toggleSound() {
  applySoundSetting(!state.settings.soundEnabled);
  if (state.settings.soundEnabled) {
    soundFX.playTone(600, 'sine', 0.1, 0.08);
  }
}

// ==========================================================================
// 16. Event Listeners Setup
// ==========================================================================
function setupEventListeners() {
  // Theme & Sound
  DOM.themeToggleBtn.addEventListener('click', toggleTheme);
  DOM.soundToggleBtn.addEventListener('click', toggleSound);

  // Toggle Add Notes / Attachments Expandable Section
  DOM.toggleAddNotesBtn.addEventListener('click', () => {
    const isCollapsed = DOM.addTaskAdvancedSection.classList.contains('collapsed');
    DOM.addTaskAdvancedSection.classList.toggle('collapsed', !isCollapsed);
    DOM.toggleAddNotesBtn.classList.toggle('active', isCollapsed);
    if (isCollapsed) {
      DOM.taskDescriptionInput.focus();
    }
  });

  // Add Task File Input & Dropzone
  DOM.taskAttachmentsInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFilesUpload(e.target.files, state.pendingAddAttachments, renderAddAttachmentsPreview);
    }
  });

  setupDropzone(DOM.addFileDropzone, (files) => {
    handleFilesUpload(files, state.pendingAddAttachments, renderAddAttachmentsPreview);
  });

  // Add Task Form Submit
  DOM.addTaskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = DOM.taskTitleInput.value;
    const dueDate = DOM.taskDueDateInput.value;
    const priority = DOM.taskPriorityInput.value;
    const category = DOM.taskCategoryInput.value;
    const description = DOM.taskDescriptionInput.value;
    addTask(title, dueDate, priority, category, description, state.pendingAddAttachments);
  });

  // Search Input live filter
  DOM.searchNameInput.addEventListener('input', (e) => {
    state.filters.searchQuery = e.target.value;
    DOM.clearSearchBtn.style.display = e.target.value ? 'flex' : 'none';
    renderApp();
  });

  DOM.clearSearchBtn.addEventListener('click', () => {
    DOM.searchNameInput.value = '';
    state.filters.searchQuery = '';
    DOM.clearSearchBtn.style.display = 'none';
    renderApp();
    DOM.searchNameInput.focus();
  });

  // Status Tabs
  DOM.statusTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      DOM.statusTabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      state.filters.status = tab.dataset.status;
      soundFX.playClick();
      renderApp();
    });
  });

  // Date Preset Pills
  const presetPills = DOM.datePresetsContainer.querySelectorAll('.preset-pill');
  presetPills.forEach(pill => {
    pill.addEventListener('click', () => {
      presetPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');

      state.filters.datePreset = pill.dataset.datePreset;
      state.filters.specificDate = '';
      DOM.filterSpecificDate.value = '';
      DOM.clearDateFilterBtn.style.display = 'none';

      soundFX.playClick();
      renderApp();
    });
  });

  // Specific Date Picker Filter
  DOM.filterSpecificDate.addEventListener('change', (e) => {
    const val = e.target.value;
    state.filters.specificDate = val;
    DOM.clearDateFilterBtn.style.display = val ? 'block' : 'none';

    if (val) {
      presetPills.forEach(p => p.classList.remove('active'));
      state.filters.datePreset = 'custom';
    } else {
      const defaultPill = DOM.datePresetsContainer.querySelector('[data-date-preset="all"]');
      if (defaultPill) defaultPill.classList.add('active');
      state.filters.datePreset = 'all';
    }

    renderApp();
  });

  DOM.clearDateFilterBtn.addEventListener('click', () => {
    DOM.filterSpecificDate.value = '';
    state.filters.specificDate = '';
    DOM.clearDateFilterBtn.style.display = 'none';

    const defaultPill = DOM.datePresetsContainer.querySelector('[data-date-preset="all"]');
    if (defaultPill) {
      presetPills.forEach(p => p.classList.remove('active'));
      defaultPill.classList.add('active');
    }
    state.filters.datePreset = 'all';

    renderApp();
  });

  // Sort By Select
  DOM.sortBySelect.addEventListener('change', (e) => {
    state.filters.sortBy = e.target.value;
    soundFX.playClick();
    renderApp();
  });

  // Clear All Filters Button
  DOM.clearAllFiltersBtn.addEventListener('click', () => {
    state.filters.status = 'all';
    state.filters.searchQuery = '';
    state.filters.datePreset = 'all';
    state.filters.specificDate = '';

    DOM.searchNameInput.value = '';
    DOM.clearSearchBtn.style.display = 'none';
    DOM.filterSpecificDate.value = '';
    DOM.clearDateFilterBtn.style.display = 'none';

    DOM.statusTabs.forEach(t => {
      t.classList.toggle('active', t.dataset.status === 'all');
      t.setAttribute('aria-selected', t.dataset.status === 'all' ? 'true' : 'false');
    });

    presetPills.forEach(p => {
      p.classList.toggle('active', p.dataset.datePreset === 'all');
    });

    soundFX.playClick();
    renderApp();
    showToast('Semua filter direset', 'info');
  });

  // Clear Completed Button
  DOM.clearCompletedBtn.addEventListener('click', clearCompletedTasks);

  // Detail Modal Events
  DOM.detailModalCloseBtn.addEventListener('click', closeTaskDetailModal);
  DOM.detailModalDoneBtn.addEventListener('click', closeTaskDetailModal);
  DOM.detailEditShortcutBtn.addEventListener('click', () => {
    if (state.selectedTaskId) {
      openEditModal(state.selectedTaskId);
    }
  });

  DOM.detailModal.addEventListener('click', (e) => {
    if (e.target === DOM.detailModal) {
      closeTaskDetailModal();
    }
  });

  // Comment Form Submit
  DOM.addCommentForm.addEventListener('submit', handleAddCommentSubmit);

  // Comment Attachment Input
  DOM.commentAttachmentInput.addEventListener('change', async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      try {
        const file = e.target.files[0];
        const processed = await readFileAsBase64(file);
        state.pendingCommentAttachment = processed;
        DOM.commentAttachedFilename.textContent = `📎 ${file.name}`;
      } catch (err) {
        showToast(err.message, 'warning');
      }
    }
  });

  // Edit Modal Events
  DOM.modalCloseBtn.addEventListener('click', closeEditModal);
  DOM.modalCancelBtn.addEventListener('click', closeEditModal);
  DOM.editTaskForm.addEventListener('submit', handleEditFormSubmit);

  DOM.editTaskAttachmentsInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFilesUpload(e.target.files, state.pendingEditAttachments, renderEditNewAttachmentsPreview);
    }
  });

  setupDropzone(DOM.editFileDropzone, (files) => {
    handleFilesUpload(files, state.pendingEditAttachments, renderEditNewAttachmentsPreview);
  });

  DOM.editModal.addEventListener('click', (e) => {
    if (e.target === DOM.editModal) {
      closeEditModal();
    }
  });

  // Lightbox Events
  DOM.lightboxCloseBtn.addEventListener('click', closeLightbox);
  DOM.lightboxModal.addEventListener('click', (e) => {
    if (e.target === DOM.lightboxModal || e.target.classList.contains('lightbox-wrapper') || e.target.classList.contains('lightbox-img-container')) {
      closeLightbox();
    }
  });

  // Global Keyboard Shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (DOM.lightboxModal.classList.contains('open')) {
        closeLightbox();
      } else if (DOM.detailModal.classList.contains('open')) {
        closeTaskDetailModal();
      } else if (DOM.editModal.classList.contains('open')) {
        closeEditModal();
      }
    }
    if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
      e.preventDefault();
      DOM.searchNameInput.focus();
    }
  });
}

function setupDropzone(dropzoneEl, onFilesDropped) {
  if (!dropzoneEl) return;

  ['dragenter', 'dragover'].forEach(eventName => {
    dropzoneEl.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzoneEl.classList.add('dragover');
    });
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropzoneEl.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzoneEl.classList.remove('dragover');
    });
  });

  dropzoneEl.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    if (dt && dt.files && dt.files.length > 0) {
      onFilesDropped(dt.files);
    }
  });
}

// ==========================================================================
// 17. Application Bootstrapping
// ==========================================================================
function initApp() {
  loadStateFromStorage();
  applyTheme(state.settings.theme || 'light');
  applySoundSetting(state.settings.soundEnabled !== false);
  renderCurrentDateHeader();

  DOM.taskDueDateInput.value = getFormattedDateOffset(0);

  confetti = new ConfettiEffect(DOM.confettiCanvas);

  setupEventListeners();
  renderApp();
}

document.addEventListener('DOMContentLoaded', initApp);
