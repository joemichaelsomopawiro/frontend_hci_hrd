<template>
  <div class="auth-bg">
    <div class="auth-center">
      <div class="auth-logo-section">
        <img src="/hopechannel.jpg" alt="Hope Channel" class="auth-logo" />
        <div class="auth-title">
          <h1>Hope Channel Indonesia</h1>
          <p>Enterprise HR System</p>
        </div>
      </div>
      <router-view />
      <div class="auth-footer">
        &copy; {{ new Date().getFullYear() }} Hope Channel Indonesia
      </div>
    </div>
  </div>
</template>
<script setup></script>
<style scoped>
.auth-bg { min-height: 100vh; background: linear-gradient(135deg, #2563eb 0%, #1e3a8a 100%); display: flex; align-items: center; justify-content: center; }
.auth-center { width: 100%; max-width: 420px; margin: 2rem; background: var(--bg-secondary); border-radius: 16px; box-shadow: 0 8px 32px rgba(30,58,138,0.12); padding: 2.5rem 2rem 1.5rem 2rem; display: flex; flex-direction: column; align-items: center; }
.auth-logo-section { display: flex; flex-direction: column; align-items: center; margin-bottom: 2rem; }
.auth-logo { width: 60px; height: 60px; border-radius: 12px; object-fit: cover; margin-bottom: 0.7rem; box-shadow: 0 2px 8px #0002; }
.auth-title h1 { font-size: 1.25rem; font-weight: 700; color: #1e3a8a; margin-bottom: 0.25rem; text-align: center; }
.auth-title p { font-size: 0.95rem; color: #64748b; text-align: center; }
.auth-footer { margin-top: 2.5rem; color: #94a3b8; font-size: 0.9rem; text-align: center; }
@media (max-width: 600px) { .auth-center { padding: 1.2rem 0.5rem 1rem 0.5rem; max-width: 98vw; } }
</style>
