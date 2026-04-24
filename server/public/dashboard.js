document.addEventListener('alpine:init', () => {
  Alpine.data('dashboard', () => ({
    categories: [],
    currentTab: null,
    items: [],
    modalOpen: false,
    editingItem: null,
    formData: { title: '', content: '', status: 'active', priority: 'medium', tags: '' },
    loading: true,
    search: '',
    sortBy: 'date',
    itemCounts: {},
    toast: { show: false, message: '', type: 'success' },
    mobileMenuOpen: false,
    
    async init() {
      await this.loadConfig();
      if (this.categories.length) {
        this.currentTab = this.categories[0].id;
        await this.loadItems();
      }
      await this.loadAllCounts();
      this.loading = false;
      this.$nextTick(() => {
        if (window.lucide) lucide.createIcons();
      });
    },
    
    get currentCategory() {
      return this.categories.find(c => c.id === this.currentTab) || {};
    },
    
    get filteredItems() {
      let list = [...this.items];
      if (this.search) {
        const s = this.search.toLowerCase();
        list = list.filter(i => 
          (i.title || '').toLowerCase().includes(s) || 
          (i.content || '').toLowerCase().includes(s) ||
          (i.tags || []).some(t => t.toLowerCase().includes(s))
        );
      }
      if (this.sortBy === 'date') {
        list.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
      } else if (this.sortBy === 'priority') {
        const pMap = { high: 3, medium: 2, low: 1 };
        list.sort((a, b) => (pMap[b.priority] || 0) - (pMap[a.priority] || 0));
      } else if (this.sortBy === 'status') {
        list.sort((a, b) => (a.status || '').localeCompare(b.status || ''));
      }
      return list;
    },
    
    async loadConfig() {
      try {
        const res = await fetch('/api/config');
        const data = await res.json();
        this.categories = data.categories || [];
      } catch (e) {
        this.showToast('Failed to load config', 'error');
        this.categories = [];
      }
    },
    
    async loadItems() {
      if (!this.currentTab || this.currentTab === 'manage') return;
      try {
        const res = await fetch(`/api/${this.currentTab}`);
        this.items = await res.json();
      } catch (e) {
        this.showToast('Failed to load items', 'error');
        this.items = [];
      }
      this.$nextTick(() => {
        if (window.lucide) lucide.createIcons();
      });
    },
    
    async loadAllCounts() {
      for (const cat of this.categories) {
        try {
          const res = await fetch(`/api/${cat.id}`);
          const items = await res.json();
          this.itemCounts[cat.id] = items.length;
        } catch (e) {
          this.itemCounts[cat.id] = 0;
        }
      }
    },
    
    async switchTab(tabId) {
      this.currentTab = tabId;
      this.search = '';
      if (tabId !== 'manage') {
        this.loading = true;
        await this.loadItems();
        this.loading = false;
      }
      this.$nextTick(() => {
        if (window.lucide) lucide.createIcons();
      });
    },
    
    openModal(item = null) {
      this.editingItem = item;
      if (item) {
        this.formData = { 
          ...item, 
          tags: Array.isArray(item.tags) ? item.tags.join(', ') : (item.tags || '')
        };
      } else {
        this.formData = { title: '', content: '', status: 'active', priority: 'medium', tags: '' };
      }
      this.modalOpen = true;
      this.$nextTick(() => {
        if (window.lucide) lucide.createIcons();
      });
    },
    
    closeModal() {
      this.modalOpen = false;
      this.editingItem = null;
    },
    
    async saveItem() {
      const payload = {
        ...this.formData,
        tags: this.formData.tags ? String(this.formData.tags).split(',').map(t => t.trim()).filter(Boolean) : []
      };
      try {
        if (this.editingItem) {
          await fetch(`/api/${this.currentTab}?id=${this.editingItem.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          this.showToast('Item updated successfully');
        } else {
          await fetch(`/api/${this.currentTab}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          this.showToast('Item created successfully');
        }
        await this.loadItems();
        await this.loadAllCounts();
        this.closeModal();
      } catch (e) {
        this.showToast('Error saving item: ' + e.message, 'error');
      }
    },
    
    async deleteItem(id) {
      if (!confirm('Are you sure you want to delete this item?')) return;
      try {
        await fetch(`/api/${this.currentTab}?id=${id}`, { method: 'DELETE' });
        this.showToast('Item deleted successfully');
        await this.loadItems();
        await this.loadAllCounts();
      } catch (e) {
        this.showToast('Error deleting item', 'error');
      }
    },
    
    addCategory() {
      const id = 'cat_' + Math.random().toString(36).substr(2, 6);
      this.categories.push({ id, label: 'New Category', icon: 'folder', color: 'slate' });
    },
    
    removeCategory(index) {
      if (confirm('Delete this category? Its data will be orphaned in KV.')) {
        this.categories.splice(index, 1);
      }
    },
    
    async saveConfig() {
      try {
        await fetch('/api/config', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ categories: this.categories })
        });
        this.showToast('Configuration saved');
        await this.loadConfig();
        if (this.currentTab === 'manage') {
          this.currentTab = this.categories[0]?.id || null;
        }
      } catch (e) {
        this.showToast('Error saving config', 'error');
      }
    },
    
    async handleImport(event) {
      const file = event.target.files[0];
      if (!file) return;
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        const res = await fetch('/api/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        if (res.ok) {
          this.showToast('Data imported successfully');
          await this.loadConfig();
          await this.loadAllCounts();
          if (this.currentTab !== 'manage') await this.loadItems();
        } else {
          const err = await res.json();
          this.showToast(err.error || 'Import failed', 'error');
        }
      } catch (e) {
        this.showToast('Invalid JSON file', 'error');
      }
      event.target.value = '';
    },
    
    showToast(message, type = 'success') {
      this.toast = { show: true, message, type };
      setTimeout(() => { this.toast.show = false; }, 3000);
    },
    
    formatDate(dateStr) {
      if (!dateStr) return '';
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  }));
});
