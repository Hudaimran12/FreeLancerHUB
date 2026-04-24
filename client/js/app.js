
const API = "http://localhost:3000/api";

// ─── APP STATE ────────────────────────────────────────────────────────────────
// We keep the app's current state in this object
let state = {
  allServices: [],      // all services fetched from backend
  filteredServices: [], // services after search/filter/sort
  savedIds: new Set(),  // ids of saved services
  hiredIds: new Set(),  // ids of hired services
  currentPage: "home",  // which page we're on
  draggedServiceId: null, // id of card being dragged
};

// ─── UTILITY FUNCTIONS ────────────────────────────────────────────────────────

// Show a toast notification
function showToast(message, type = "info") {
  const container = document.getElementById("toast-container");
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  const icons = { success: "✅", error: "❌", info: "ℹ️" };
  toast.innerHTML = `${icons[type] || "ℹ️"} ${message}`;
  container.appendChild(toast);

  // Remove toast after 3 seconds
  setTimeout(() => {
    toast.style.animation = "slideOut 0.3s ease forwards";
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Generate star rating HTML
function getStars(rating) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  let stars = "★".repeat(full);
  if (half) stars += "☆";
  return stars;
}

// Format price
function formatPrice(price) {
  return `$${price}`;
}

// ─── PAGE NAVIGATION ──────────────────────────────────────────────────────────
function showPage(pageName) {
  // Hide all pages
  document.querySelectorAll(".page").forEach((p) => p.classList.remove("active"));

  // Show the requested page
  document.getElementById(`page-${pageName}`)?.classList.add("active");

  // Update nav link styles
  document.querySelectorAll(".nav-links a").forEach((a) => a.classList.remove("active"));
  document.querySelector(`[data-page="${pageName}"]`)?.classList.add("active");

  // Update mobile nav
  document.querySelectorAll(".mobile-nav-item").forEach((item) => {
    item.classList.toggle("active", item.dataset.page === pageName);
  });

  state.currentPage = pageName;

  // Load data for the page
  if (pageName === "services") loadServices();
  if (pageName === "dashboard") loadDashboard();
}

// ─── FETCH ALL SERVICES FROM BACKEND ─────────────────────────────────────────
async function loadServices(filters = {}) {
  const grid = document.getElementById("services-grid");
  grid.innerHTML = `<div class="loading"><div class="spinner"></div>Loading services...</div>`;

  try {
    // Build query string from filters
    const params = new URLSearchParams();
    if (filters.search)   params.append("search", filters.search);
    if (filters.category) params.append("category", filters.category);
    if (filters.sort)     params.append("sort", filters.sort);

    const url = `${API}/services?${params.toString()}`;
    const res = await fetch(url);
    const data = await res.json();

    if (!data.success) throw new Error(data.message);

    state.filteredServices = data.data;

    // Update results count
    document.getElementById("results-count").textContent = `${data.count} services found`;

    // Render cards
    renderServiceCards(data.data, grid);
  } catch (err) {
    grid.innerHTML = `<div class="empty-state">
      <div class="empty-icon">⚠️</div>
      <h3>Could not load services</h3>
      <p>${err.message}</p>
    </div>`;
  }
}

// ─── RENDER SERVICE CARDS ─────────────────────────────────────────────────────
function renderServiceCards(services, container) {
  if (services.length === 0) {
    container.innerHTML = `<div class="empty-state">
      <div class="empty-icon">🔍</div>
      <h3>No services found</h3>
      <p>Try a different search or filter</p>
    </div>`;
    return;
  }

  container.innerHTML = services.map((s) => createServiceCardHTML(s)).join("");

  // Add event listeners to all cards
  container.querySelectorAll(".service-card").forEach((card) => {
    const id = parseInt(card.dataset.id);

    // Click to open detail modal
    card.addEventListener("click", (e) => {
      // Don't open modal if a button was clicked
      if (e.target.closest(".btn")) return;
      openDetailModal(id);
    });

    // Drag and drop events
    card.addEventListener("dragstart", () => {
      state.draggedServiceId = id;
      card.classList.add("dragging");
    });

    card.addEventListener("dragend", () => {
      card.classList.remove("dragging");
    });
  });

  // Button listeners
  container.querySelectorAll(".btn-save").forEach((btn) => {
    btn.addEventListener("click", () => saveService(parseInt(btn.dataset.id)));
  });

  container.querySelectorAll(".btn-hire").forEach((btn) => {
    btn.addEventListener("click", () => openConfirmModal(parseInt(btn.dataset.id)));
  });
}

// ─── CREATE SERVICE CARD HTML ─────────────────────────────────────────────────
function createServiceCardHTML(service) {
  const isSaved = state.savedIds.has(service.id);
  const isHired = state.hiredIds.has(service.id);

  return `
    <div class="service-card" data-id="${service.id}" draggable="true">
      <div class="card-image">
        <img src="${service.image}" alt="${service.title}" loading="lazy"
             onerror="this.src='https://via.placeholder.com/400x250?text=FreelanceHub'">
        ${service.featured ? '<span class="card-badge featured">⭐ Featured</span>' : `<span class="card-badge">${service.category}</span>`}
      </div>
      <div class="card-body">
        <div class="card-category">${service.category}</div>
        <div class="card-title">${service.title}</div>
        <div class="card-seller">
          <img class="seller-avatar" src="${service.sellerAvatar}" alt="${service.seller}">
          <span class="seller-name">${service.seller}</span>
        </div>
        <div class="card-footer">
          <div class="card-rating">
            <span class="stars">${getStars(service.rating)}</span>
            <strong>${service.rating}</strong>
            <span>(${service.reviews})</span>
          </div>
          <div class="card-price">${formatPrice(service.price)} <span>starting</span></div>
        </div>
      </div>
      <div class="card-actions">
        <button class="btn btn-outline btn-save" data-id="${service.id}" 
          ${isSaved ? "disabled" : ""}>
          ${isSaved ? "✓ Saved" : "🔖 Save"}
        </button>
        <button class="btn btn-primary btn-hire" data-id="${service.id}"
          ${isHired ? "disabled" : ""}>
          ${isHired ? "✓ Hired" : "🚀 Hire"}
        </button>
      </div>
    </div>
  `;
}

// ─── OPEN DETAIL MODAL ────────────────────────────────────────────────────────
async function openDetailModal(serviceId) {
  try {
    // Fetch single service from backend
    const res = await fetch(`${API}/services/${serviceId}`);
    const data = await res.json();

    if (!data.success) throw new Error(data.message);

    const s = data.data;
    const isSaved = state.savedIds.has(s.id);
    const isHired = state.hiredIds.has(s.id);

    document.getElementById("detail-modal-body").innerHTML = `
      <img class="modal-image" src="${s.image}" alt="${s.title}"
           onerror="this.src='https://via.placeholder.com/640x220?text=FreelanceHub'">
      <div class="card-category">${s.category}</div>
      <h2 style="font-size:1.3rem;font-weight:700;margin:0.4rem 0 1rem">${s.title}</h2>
      <div class="modal-meta">
        <div class="meta-item">👤 <strong>${s.seller}</strong></div>
        <div class="meta-item">⏱️ Delivers in <strong>${s.delivery}</strong></div>
        <div class="meta-item">⭐ <strong>${s.rating}</strong> (${s.reviews} reviews)</div>
        <div class="meta-item">💰 Starting at <strong>${formatPrice(s.price)}</strong></div>
      </div>
      <p class="modal-description">${s.description}</p>
      <div class="modal-tags">
        ${s.tags.map((t) => `<span class="tag">#${t}</span>`).join("")}
      </div>
    `;

    // Set footer buttons
    document.getElementById("modal-save-btn").textContent = isSaved ? "✓ Saved" : "🔖 Save Service";
    document.getElementById("modal-save-btn").disabled = isSaved;
    document.getElementById("modal-hire-btn").textContent = isHired ? "✓ Already Hired" : "🚀 Hire Now";
    document.getElementById("modal-hire-btn").disabled = isHired;

    // Store current service id for button actions
    document.getElementById("modal-save-btn").dataset.id = s.id;
    document.getElementById("modal-hire-btn").dataset.id = s.id;

    document.getElementById("detail-modal").classList.add("open");
  } catch (err) {
    showToast("Could not load service details: " + err.message, "error");
  }
}

// ─── OPEN CONFIRMATION MODAL ──────────────────────────────────────────────────
async function openConfirmModal(serviceId) {
  try {
    const res = await fetch(`${API}/services/${serviceId}`);
    const data = await res.json();
    const s = data.data;

    document.getElementById("confirm-modal-body").innerHTML = `
      <div class="confirm-icon">🚀</div>
      <h3>Ready to hire this service?</h3>
      <p><strong>${s.title}</strong><br>by ${s.seller} · Delivery in ${s.delivery}</p>
      <div class="confirm-price">${formatPrice(s.price)}</div>
      <p style="font-size:0.8rem;color:var(--text-muted)">This is a simulated hire for lab purposes.</p>
    `;

    document.getElementById("confirm-hire-btn").dataset.id = s.id;
    document.getElementById("confirm-modal").classList.add("open");
  } catch (err) {
    showToast("Error: " + err.message, "error");
  }
}

// ─── SAVE SERVICE ─────────────────────────────────────────────────────────────
async function saveService(serviceId) {
  try {
    const res = await fetch(`${API}/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ serviceId }),
    });

    const data = await res.json();

    if (!data.success) {
      showToast(data.message, "error");
      return;
    }

    state.savedIds.add(serviceId);
    showToast("Service saved to your dashboard! 🔖", "success");

    // Refresh current view
    if (state.currentPage === "services") loadServices(getCurrentFilters());
    if (state.currentPage === "dashboard") loadDashboard();
  } catch (err) {
    showToast("Network error: " + err.message, "error");
  }
}

// ─── HIRE SERVICE ─────────────────────────────────────────────────────────────
async function hireService(serviceId) {
  try {
    const res = await fetch(`${API}/hire`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ serviceId }),
    });

    const data = await res.json();

    if (!data.success) {
      showToast(data.message, "error");
      return;
    }

    state.hiredIds.add(serviceId);
    closeAllModals();
    showToast("Service hired! Check your dashboard. 🎉", "success");

    // Refresh
    if (state.currentPage === "services") loadServices(getCurrentFilters());
    if (state.currentPage === "dashboard") loadDashboard();
  } catch (err) {
    showToast("Network error: " + err.message, "error");
  }
}

// ─── LOAD DASHBOARD ───────────────────────────────────────────────────────────
async function loadDashboard() {
  try {
    // Fetch saved and hired services in parallel
    const [savedRes, hiredRes] = await Promise.all([
      fetch(`${API}/saved`),
      fetch(`${API}/hired`),
    ]);

    const savedData = await savedRes.json();
    const hiredData = await hiredRes.json();

    const saved = savedData.data || [];
    const hired = hiredData.data || [];

    // Update stats
    document.getElementById("stat-saved").textContent = saved.length;
    document.getElementById("stat-hired").textContent = hired.length;
    document.getElementById("stat-spent").textContent =
      "$" + hired.reduce((sum, s) => sum + s.price, 0);
    document.getElementById("stat-total").textContent = state.allServices.length;

    // Update badge counts in section headers
    document.getElementById("saved-count").textContent = saved.length;
    document.getElementById("hired-count").textContent = hired.length;

    // Render saved list
    renderDashboardList(saved, "saved-list", "saved");
    // Render hired list
    renderDashboardList(hired, "hired-list", "hired");
  } catch (err) {
    showToast("Could not load dashboard: " + err.message, "error");
  }
}

// Render items in dashboard list
function renderDashboardList(items, containerId, type) {
  const container = document.getElementById(containerId);

  if (items.length === 0) {
    container.innerHTML = `<div class="empty-state">
      <div class="empty-icon">${type === "saved" ? "🔖" : "🚀"}</div>
      <h3>No ${type} services yet</h3>
      <p>Drag a card here or click ${type === "saved" ? "Save" : "Hire"}</p>
    </div>`;
    return;
  }

  container.innerHTML = items
    .map(
      (s) => `
    <div class="dashboard-item">
      <img src="${s.image}" alt="${s.title}" onerror="this.src='https://via.placeholder.com/50?text=?'">
      <div class="dashboard-item-info">
        <h4>${s.title}</h4>
        <p>${s.seller} · ${formatPrice(s.price)}</p>
      </div>
      <span class="status-pill ${type === "saved" ? "status-saved" : "status-progress"}">
        ${type === "saved" ? "Saved" : "In Progress"}
      </span>
    </div>
  `
    )
    .join("");
}

// ─── GET CURRENT FILTER VALUES ────────────────────────────────────────────────
function getCurrentFilters() {
  return {
    search: document.getElementById("search-input-services")?.value || "",
    category: document.getElementById("filter-category")?.value || "",
    sort: document.getElementById("filter-sort")?.value || "",
  };
}

// ─── CLOSE ALL MODALS ─────────────────────────────────────────────────────────
function closeAllModals() {
  document.querySelectorAll(".modal-overlay").forEach((m) => m.classList.remove("open"));
}

// ─── SETUP DRAG AND DROP ──────────────────────────────────────────────────────
function setupDragAndDrop() {
  // Drop zones in dashboard
  const dropZones = document.querySelectorAll(".drop-zone");

  dropZones.forEach((zone) => {
    zone.addEventListener("dragover", (e) => {
      e.preventDefault(); // needed to allow drop
      zone.classList.add("dragover");
    });

    zone.addEventListener("dragleave", () => {
      zone.classList.remove("dragover");
    });

    zone.addEventListener("drop", (e) => {
      e.preventDefault();
      zone.classList.remove("dragover");

      if (!state.draggedServiceId) return;

      const action = zone.dataset.action; // "save" or "hire"
      if (action === "save") {
        saveService(state.draggedServiceId);
      } else if (action === "hire") {
        openConfirmModal(state.draggedServiceId);
      }

      state.draggedServiceId = null;
    });
  });
}

// ─── LOAD HOME PAGE DATA ──────────────────────────────────────────────────────
async function loadHomePage() {
  try {
    const res = await fetch(`${API}/services`);
    const data = await res.json();
    state.allServices = data.data || [];

    // Show featured services on home page
    const featured = state.allServices.filter((s) => s.featured);
    const featuredGrid = document.getElementById("featured-grid");
    if (featuredGrid) renderServiceCards(featured, featuredGrid);
  } catch (err) {
    console.error("Could not load home page data:", err);
  }
}

// ─── SETUP EVENT LISTENERS ────────────────────────────────────────────────────
function setupEventListeners() {
  // Nav links
  document.querySelectorAll("[data-page]").forEach((el) => {
    el.addEventListener("click", () => showPage(el.dataset.page));
  });

  // ── Services page filters ──
  const searchInput = document.getElementById("search-input-services");
  const categoryFilter = document.getElementById("filter-category");
  const sortFilter = document.getElementById("filter-sort");

  if (searchInput) {
    // Search with debounce (wait 400ms after typing stops)
    let searchTimer;
    searchInput.addEventListener("input", () => {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => loadServices(getCurrentFilters()), 400);
    });
  }

  if (categoryFilter) {
    categoryFilter.addEventListener("change", () => loadServices(getCurrentFilters()));
  }

  if (sortFilter) {
    sortFilter.addEventListener("change", () => loadServices(getCurrentFilters()));
  }

  // ── Hero search bar ──
  const heroSearch = document.getElementById("hero-search");
  const heroSearchBtn = document.getElementById("hero-search-btn");

  if (heroSearchBtn) {
    heroSearchBtn.addEventListener("click", () => {
      const query = heroSearch.value.trim();
      showPage("services");
      if (query) {
        document.getElementById("search-input-services").value = query;
        loadServices({ search: query });
      }
    });
  }

  if (heroSearch) {
    heroSearch.addEventListener("keydown", (e) => {
      if (e.key === "Enter") heroSearchBtn.click();
    });
  }

  // ── Category cards on home page ──
  document.querySelectorAll(".category-card").forEach((card) => {
    card.addEventListener("click", () => {
      const cat = card.dataset.category;
      showPage("services");
      document.getElementById("filter-category").value = cat;
      loadServices({ category: cat });
    });
  });

  // ── Detail modal buttons ──
  document.getElementById("modal-save-btn")?.addEventListener("click", function () {
    saveService(parseInt(this.dataset.id));
    closeAllModals();
  });

  document.getElementById("modal-hire-btn")?.addEventListener("click", function () {
    closeAllModals();
    openConfirmModal(parseInt(this.dataset.id));
  });

  // ── Confirm hire button ──
  document.getElementById("confirm-hire-btn")?.addEventListener("click", function () {
    hireService(parseInt(this.dataset.id));
  });

  // ── Close modal when clicking overlay or X button ──
  document.querySelectorAll(".modal-overlay").forEach((overlay) => {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closeAllModals();
    });
  });

  document.querySelectorAll(".modal-close").forEach((btn) => {
    btn.addEventListener("click", closeAllModals);
  });

  // ── Add Service form (dashboard bonus) ──
  document.getElementById("add-service-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = e.target;
    const body = {
      title: form.title.value,
      category: form.category.value,
      price: form.price.value,
      description: form.description.value,
      delivery: form.delivery.value,
    };

    try {
      const res = await fetch(`${API}/services`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        showToast("New service added! ✨", "success");
        form.reset();
        loadServices();
      } else {
        showToast(data.message, "error");
      }
    } catch (err) {
      showToast("Error: " + err.message, "error");
    }
  });
}

// ─── INITIALIZE APP ───────────────────────────────────────────────────────────
async function init() {
  setupEventListeners();
  setupDragAndDrop();
  await loadHomePage();
  showPage("home");
}

// Run when DOM is ready
document.addEventListener("DOMContentLoaded", init);
