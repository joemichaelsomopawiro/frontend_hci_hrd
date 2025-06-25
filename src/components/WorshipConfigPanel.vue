<template>
  <div class="worship-config-panel">
    <div class="config-header">
      <h3>⚙️ Konfigurasi Renungan Pagi</h3>
      <p class="config-subtitle">Pengaturan jadwal dan mode testing untuk renungan pagi</p>
    </div>

    <div class="config-content">
      <!-- Testing Mode Toggle -->
      <div class="config-section">
        <div class="section-header">
          <h4>🧪 Mode Testing</h4>
          <div class="toggle-switch">
            <input 
              type="checkbox" 
              id="testingMode" 
              v-model="localConfig.testingMode"
              @change="updateTestingMode"
            >
            <label for="testingMode" class="toggle-label">
              <span class="toggle-slider"></span>
            </label>
          </div>
        </div>
        <p class="section-description">
          {{ localConfig.testingMode ? 
            '✅ Mode testing aktif - Button zoom selalu bisa diklik' : 
            '❌ Mode production - Button zoom mengikuti jadwal' 
          }}
        </p>
      </div>

      <!-- Worship Schedule -->
      <div class="config-section">
        <h4>📅 Jadwal Renungan Pagi</h4>
        
        <!-- Hari Worship -->
        <div class="form-group">
          <label>Hari Renungan:</label>
          <div class="days-selector">
            <div 
              v-for="(day, index) in dayOptions" 
              :key="index"
              class="day-option"
              :class="{ active: localConfig.worshipDays.includes(index) }"
              @click="toggleDay(index)"
            >
              {{ day }}
            </div>
          </div>
        </div>

        <!-- Waktu Worship -->
        <div class="time-config">
          <div class="form-group">
            <label>Jam Mulai:</label>
            <div class="time-input">
              <input 
                type="number" 
                v-model.number="localConfig.startHour"
                min="0" 
                max="23"
                @change="updateWorshipTime"
              >
              <span>:</span>
              <input 
                type="number" 
                v-model.number="localConfig.startMinute"
                min="0" 
                max="59"
                @change="updateWorshipTime"
              >
            </div>
          </div>

          <div class="form-group">
            <label>Jam Selesai:</label>
            <div class="time-input">
              <input 
                type="number" 
                v-model.number="localConfig.endHour"
                min="0" 
                max="23"
                @change="updateWorshipTime"
              >
              <span>:</span>
              <input 
                type="number" 
                v-model.number="localConfig.endMinute"
                min="0" 
                max="59"
                @change="updateWorshipTime"
              >
            </div>
          </div>
        </div>
      </div>

      <!-- Current Status -->
      <div class="config-section">
        <h4>📊 Status Saat Ini</h4>
        <div class="status-info">
          <div class="status-item">
            <span class="status-label">Hari ini:</span>
            <span class="status-value" :class="{ active: store.isTodayWorshipDay }">
              {{ getCurrentDayStatus() }}
            </span>
          </div>
          <div class="status-item">
            <span class="status-label">Status Zoom:</span>
            <span class="status-value" :class="store.zoomTimeStatus.toLowerCase()">
              {{ store.zoomTimeStatus }}
            </span>
          </div>
          <div class="status-item">
            <span class="status-label">Waktu Sekarang:</span>
            <span class="status-value">{{ currentTime }}</span>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="config-section">
        <h4>⚡ Aksi Cepat</h4>
        <div class="quick-actions">
          <button 
            class="btn btn-primary"
            @click="setDefaultSchedule"
          >
            📋 Set Jadwal Default
          </button>
          <button 
            class="btn btn-warning"
            @click="enableTestingMode"
          >
            🧪 Aktifkan Testing
          </button>
          <button 
            class="btn btn-success"
            @click="setProductionMode"
          >
            🚀 Mode Production
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useGaStore } from '../stores/gaStore'

export default {
  name: 'WorshipConfigPanel',
  setup() {
    const store = useGaStore()
    return { store }
  },
  data() {
    return {
      localConfig: {
        testingMode: true,
        startHour: 7,
        startMinute: 30,
        endHour: 7,
        endMinute: 35,
        worshipDays: [1, 3, 5]
      },
      dayOptions: ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'],
      currentTime: ''
    }
  },
  mounted() {
    this.loadCurrentConfig()
    this.updateCurrentTime()
    this.timeInterval = setInterval(this.updateCurrentTime, 1000)
  },
  beforeUnmount() {
    if (this.timeInterval) {
      clearInterval(this.timeInterval)
    }
  },
  methods: {
    loadCurrentConfig() {
      this.localConfig = {
        testingMode: this.store.testingMode,
        startHour: this.store.worshipConfig.startHour,
        startMinute: this.store.worshipConfig.startMinute,
        endHour: this.store.worshipConfig.endHour,
        endMinute: this.store.worshipConfig.endMinute,
        worshipDays: [...this.store.worshipConfig.worshipDays]
      }
    },
    
    updateTestingMode() {
      this.store.toggleTestingMode()
      this.$toast.success(
        this.localConfig.testingMode ? 
        'Mode testing diaktifkan!' : 
        'Mode production diaktifkan!'
      )
    },
    
    toggleDay(dayIndex) {
      const index = this.localConfig.worshipDays.indexOf(dayIndex)
      if (index > -1) {
        this.localConfig.worshipDays.splice(index, 1)
      } else {
        this.localConfig.worshipDays.push(dayIndex)
      }
      this.localConfig.worshipDays.sort()
      this.updateWorshipConfig()
    },
    
    updateWorshipTime() {
      this.store.setWorshipTime(
        this.localConfig.startHour,
        this.localConfig.startMinute,
        this.localConfig.endHour,
        this.localConfig.endMinute
      )
      this.$toast.success('Jadwal worship berhasil diupdate!')
    },
    
    updateWorshipConfig() {
      this.store.updateWorshipConfig({
        worshipDays: this.localConfig.worshipDays
      })
      this.$toast.success('Hari worship berhasil diupdate!')
    },
    
    setDefaultSchedule() {
      this.localConfig = {
        ...this.localConfig,
        startHour: 7,
        startMinute: 30,
        endHour: 7,
        endMinute: 35,
        worshipDays: [1, 3, 5]
      }
      this.updateWorshipTime()
      this.updateWorshipConfig()
      this.$toast.success('Jadwal default berhasil diterapkan!')
    },
    
    enableTestingMode() {
      this.localConfig.testingMode = true
      this.store.testingMode = true
      this.$toast.success('Mode testing diaktifkan!')
    },
    
    setProductionMode() {
      this.localConfig.testingMode = false
      this.store.testingMode = false
      this.$toast.success('Mode production diaktifkan!')
    },
    
    getCurrentDayStatus() {
      const today = new Date().getDay()
      const dayName = this.dayOptions[today]
      const isWorshipDay = this.store.isTodayWorshipDay
      return `${dayName} ${isWorshipDay ? '✅' : '❌'}`
    },
    
    updateCurrentTime() {
      const now = new Date()
      this.currentTime = now.toLocaleTimeString('id-ID')
    }
  }
}
</script>

<style scoped>
.worship-config-panel {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-width: 800px;
  margin: 0 auto;
}

.config-header {
  text-align: center;
  margin-bottom: 32px;
  padding-bottom: 16px;
  border-bottom: 2px solid #f0f0f0;
}

.config-header h3 {
  color: #2c3e50;
  margin: 0 0 8px 0;
  font-size: 24px;
}

.config-subtitle {
  color: #7f8c8d;
  margin: 0;
  font-size: 14px;
}

.config-section {
  margin-bottom: 32px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #3498db;
}

.config-section h4 {
  color: #2c3e50;
  margin: 0 0 16px 0;
  font-size: 18px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.section-description {
  color: #7f8c8d;
  font-size: 14px;
  margin: 0;
}

/* Toggle Switch */
.toggle-switch {
  position: relative;
}

.toggle-switch input[type="checkbox"] {
  display: none;
}

.toggle-label {
  display: block;
  width: 50px;
  height: 24px;
  background: #ddd;
  border-radius: 12px;
  cursor: pointer;
  transition: background 0.3s;
}

.toggle-slider {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  transition: transform 0.3s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

input[type="checkbox"]:checked + .toggle-label {
  background: #27ae60;
}

input[type="checkbox"]:checked + .toggle-label .toggle-slider {
  transform: translateX(26px);
}

/* Days Selector */
.days-selector {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.day-option {
  padding: 8px 16px;
  background: white;
  border: 2px solid #ddd;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 14px;
  font-weight: 500;
}

.day-option:hover {
  border-color: #3498db;
}

.day-option.active {
  background: #3498db;
  color: white;
  border-color: #3498db;
}

/* Time Input */
.time-config {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #2c3e50;
}

.time-input {
  display: flex;
  align-items: center;
  gap: 8px;
}

.time-input input {
  width: 60px;
  padding: 8px;
  border: 2px solid #ddd;
  border-radius: 6px;
  text-align: center;
  font-size: 16px;
  font-weight: 600;
}

.time-input input:focus {
  outline: none;
  border-color: #3498db;
}

.time-input span {
  font-size: 18px;
  font-weight: bold;
  color: #7f8c8d;
}

/* Status Info */
.status-info {
  display: grid;
  gap: 12px;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: white;
  border-radius: 6px;
  border-left: 4px solid #ecf0f1;
}

.status-label {
  font-weight: 600;
  color: #2c3e50;
}

.status-value {
  font-weight: 500;
  padding: 4px 12px;
  border-radius: 12px;
  background: #ecf0f1;
  color: #7f8c8d;
}

.status-value.active {
  background: #d5f4e6;
  color: #27ae60;
}

.status-value.hadir {
  background: #d5f4e6;
  color: #27ae60;
}

.status-value.terlambat {
  background: #fef9e7;
  color: #f39c12;
}

.status-value.closed {
  background: #fadbd8;
  color: #e74c3c;
}

/* Quick Actions */
.quick-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
  font-size: 14px;
}

.btn-primary {
  background: #3498db;
  color: white;
}

.btn-primary:hover {
  background: #2980b9;
}

.btn-warning {
  background: #f39c12;
  color: white;
}

.btn-warning:hover {
  background: #e67e22;
}

.btn-success {
  background: #27ae60;
  color: white;
}

.btn-success:hover {
  background: #229954;
}

@media (max-width: 768px) {
  .time-config {
    grid-template-columns: 1fr;
  }
  
  .quick-actions {
    flex-direction: column;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}
</style>