<template>
  <form @submit.prevent="sendOtp" class="auth-form">
    <h2>Daftar - Verifikasi No HP</h2>
    <input v-model="phone" placeholder="Nomor Handphone" required />
    <button type="submit">Kirim OTP</button>
    <div class="error" v-if="error">{{ error }}</div>
  </form>
</template>
<script setup>
import { ref } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';
const phone = ref('');
const error = ref('');
const router = useRouter();
const sendOtp = async () => {
  try {
    await axios.post('/api/auth/send-register-otp', { phone: phone.value });
    router.push({ name: 'RegisterOtp', query: { phone: phone.value } });
  } catch (e) {
    error.value = e.response?.data?.message || 'Gagal mengirim OTP';
  }
};
</script>
<style scoped>
.auth-form { max-width: 350px; margin: auto; background: #fff; padding: 2rem; border-radius: 8px; box-shadow: 0 2px 8px #0001; }
input, button { display: block; margin: 10px 0; width: 100%; padding: 10px; border-radius: 4px; border: 1px solid #ccc; }
.error { color: red; margin-top: 10px; }
</style>
