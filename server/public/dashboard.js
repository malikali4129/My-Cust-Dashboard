document.addEventListener('alpine:init', () => {
  Alpine.data('app', () => ({
    // Auth
    token: localStorage.getItem('dash_token') || null,
    admin: null,
    authLoading: true,
    loginForm: { username: '', password: '', error: '' },
    
    // Navigation
    page: 'login',
    currentTab: null,
    
    // Data
    categories: [],
    items: [],
    loading: false,
    search: '',
    
    // Item modal
    modalOpen: false,
    editingItem: null,
    formData: { title: '', content: '', status: 'active', priority: 'medium', tags: '' },
    
    // Admin management
    showAdminModal: false,
    admins: [],
    newAdmin: { username: '', password: '', role: 'admin', error: '' },
    
    // Logs
    showLogModal: false,
    logs: [],
    logFilter: '',
    
    // Toast
    toast: { show: false, message: '', type: 'success' },
    
    async init() {
      if (this.token) {
        await this.validateToken();
      } else {
        this.authLoading = false;
        this.page = 'login';
      }
    },
    
    showToast(message, type = 'success') {
      this.toast = { show: true, message, type };
      setTimeout(() => this.toast.show = false, 3000);
    },
    
    // ─── Auth ───
    async validateToken() {
      try {
        const res = await fetch('/api/auth/me', {
          headers: { 'Authorization': `Bearer ${this.token}` }
        });
        if (res.ok) {
          const data = await res.json();
          this.admin = data.admin;
          this.authLoading = false;
          this.page = 'dashboard';
          await this.loadConfig();
        } else {
          this.logout();
        }
      } catch (e) {
        this.logout();
      }
    },
    
    async login() {
      this.loginForm.error = '';
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: this.loginForm.username, password: this.loginForm.password })
        });
        const data = await res.json();
        if (!res.ok) {
          this.loginForm.error = data.error || 'Login failed';
          return;
        }
        this.token = data.token;
        this.admin = data.admin;
        localStorage.setItem('dash_token', this.token);
        this.page = 'dashboard';
        await this.loadConfig();
      } catch (e) {
        this.loginForm.error = 'Network error';
      }
    },
    
    logout() {
      this.token = null;
      this.admin = null;
      localStorage.removeItem('dash_token');
      this.authLoading = false;
      this.page = 'login';
      this.categories = [];
      this.items = [];
    },
    
    get authHeaders() {
      return { 'Authorization': `Bearer ${this.token}`, 'Content-Type': 'application/json' };
    },
    
    // ─── Config & Categories ───
    async loadConfig() {
      try {
        const res = await fetch('/api/config');
        const data = await res.json();
        this.categories = data.categories || [];
        if (this.categories.length && !this.currentTab) {
          this.currentTab = this.categories[0].id;
        }
        await this.loadItems();
      } catch (e) {
        console.error('Failed to load config', e);
      }
    },
    
    async saveConfig() {
      try {
        await fetch('/api/config', {
          method: 'PUT',
          headers: this.authHeaders,
          body: JSON.stringify({ categories: this.categories })
        });
        this.showToast('Configuration saved');
        await this.loadConfig();
      } catch (e) {
        this.showToast('Failed to save config', 'error');
      }
    },
    
    addCategory() {
      const id = prompt('Category ID (lowercase, no spaces):');
      if (!id) return;
      const label = prompt('Category Label:') || id;
      this.categories.push({
        id,
        label,
        icon: 'folder',
        color: 'slate'
      });
      this.saveConfig();
    },
    
    removeCategory(index) {
      if (!confirm('Delete this category and all its items?')) return;
      this.categories.splice(index, 1);
      this.saveConfig();
    },
    
    // ─── Items ───
    async loadItems() {
      if (!this.currentTab) return;
      this.loading = true;
      try {
        const res = await fetch(`/api/${this.currentTab}`);
        this.items = await res.json();
      } catch (e) {
        this.items = [];
      }
      this.loading = false;
      this.$nextTick(() => window.lucide && lucide.createIcons());
    },
    
    get filteredItems() {
      let list = [...this.items];
      if (this.search) {
        const s = this.search.toLowerCase();
        list = list.filter(i => (i.title + i.content + (i.tags || []).join(' ')).toLowerCase().includes(s));
      }
      return list.sort((a, b) => new Date(b.date) - new Date(a.date));
    },
    
    openItemModal(item = null) {
      this.editingItem = item;
      if (item) {
        this.formData = { ...item, tags: (item.tags || []).join(', ') };
      } else {
        this.formData = { title: '', content: '', status: 'active', priority: 'medium', tags: '' };
      }
      this.modalOpen = true;
    },
    
    closeModal() {
      this.modalOpen = false;
      this.editingItem = null;
    },
    
    async saveItem() {
      const payload = {
        ...this.formData,
        tags: this.formData.tags.split(',').map(t => t.trim()).filter(Boolean)
      };
      try {
        if (this.editingItem) {
          await fetch(`/api/${this.currentTab}?id=${this.editingItem.id}`, {
            method: 'PUT',
            headers: this.authHeaders,
            body: JSON.stringify(payload)
          });
          this.showToast('Item updated');
        } else {
          await fetch(`/api/${this.currentTab}`, {
            method: 'POST',
            headers: this.authHeaders,
            body: JSON.stringify(payload)
          });
          this.showToast('Item created');
        }
        await this.loadItems();
        this.closeModal();
      } catch (e) {
        this.showToast('Error saving item', 'error');
      }
    },
    
    async deleteItem(id) {
      if (!confirm('Delete this item?')) return;
      try {
        await fetch(`/api/${this.currentTab}?id=${id}`, {
          method: 'DELETE',
          headers: this.authHeaders
        });
        this.showToast('Item deleted');
        await this.loadItems();
      } catch (e) {
        this.showToast('Error deleting item', 'error');
      }
    },
    
    // ─── Admin Management ───
    async loadAdmins() {
      try {
        const res = await fetch('/api/admins', { headers: { 'Authorization': `Bearer ${this.token}` } });
        this.admins = await res.json();
      } catch (e) {
        this.admins = [];
      }
    },
    
    openAdminModal() {
      this.newAdmin = { username: '', password: '', role: 'admin', error: '' };
      this.loadAdmins();
      this.showAdminModal = true;
    },
    
    closeAdminModal() {
      this.showAdminModal = false;
    },
    
    async createAdmin() {
      this.newAdmin.error = '';
      try {
        const res = await fetch('/api/admins', {
          method: 'POST',
          headers: this.authHeaders,
          body: JSON.stringify(this.newAdmin)
        });
        const data = await res.json();
        if (!res.ok) {
          this.newAdmin.error = data.error || 'Failed to create admin';
          return;
        }
        this.newAdmin = { username: '', password: '', role: 'admin', error: '' };
        this.showToast('Admin created');
        await this.loadAdmins();
      } catch (e) {
        this.newAdmin.error = 'Network error';
      }
    },
    
    async deleteAdmin(id) {
      if (!confirm('Delete this admin?')) return;
      try {
        await fetch(`/api/admins?id=${id}`, {
          method: 'DELETE',
          headers: this.authHeaders
        });
        this.showToast('Admin deleted');
        await this.loadAdmins();
      } catch (e) {
        this.showToast('Error deleting admin', 'error');
      }
    },
    
    // ─── Logs ───
    async loadLogs() {
      try {
        const res = await fetch('/api/logs?limit=100', { headers: { 'Authorization': `Bearer ${this.token}` } });
        const data = await res.json();
        this.logs = data.logs || [];
      } catch (e) {
        this.logs = [];
      }
    },
    
    openLogModal() {
      this.loadLogs();
      this.showLogModal = true;
    },
    
    closeLogModal() {
      this.showLogModal = false;
    },
    
    get filteredLogs() {
      if (!this.logFilter) return this.logs;
      return this.logs.filter(l => 
        l.action.toLowerCase().includes(this.logFilter.toLowerCase()) ||
        l.adminName.toLowerCase().includes(this.logFilter.toLowerCase()) ||
        l.target.toLowerCase().includes(this.logFilter.toLowerCase())
      );
    },
    
    formatDate(dateStr) {
      return new Date(dateStr).toLocaleString();
    },
    
    // ─── Export / Import ───
    async handleImport(event) {
      const file = event.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = JSON.parse(e.target.result);
          const res = await fetch('/api/import', {
            method: 'POST',
            headers: this.authHeaders,
            body: JSON.stringify(data)
          });
          if (res.ok) {
            this.showToast('Import successful');
            await this.loadConfig();
          } else {
            this.showToast('Import failed', 'error');
          }
        } catch (err) {
          this.showToast('Invalid JSON file', 'error');
        }
      };
      reader.readAsText(file);
    },
    
    // ─── UI Helpers ───
    getStatusColor(status) {
      const map = { active: 'bg-emerald-500/20 text-emerald-300', completed: 'bg-blue-500/20 text-blue-300', archived: 'bg-slate-500/20 text-slate-300' };
      return map[status] || map.active;
    },
    
    getPriorityColor(priority) {
      const map = { low: 'text-slate-400', medium: 'text-amber-400', high: 'text-rose-400' };
      return map[priority] || map.medium;
    },
    
    getCategoryColor(color) {
      const map = {
        indigo: 'bg-indigo-500/20 text-indigo-300',
        amber: 'bg-amber-500/20 text-amber-300',
        emerald: 'bg-emerald-500/20 text-emerald-300',
        slate: 'bg-slate-500/20 text-slate-300'
      };
      return map[color] || map.slate;
    }
  }));
});
