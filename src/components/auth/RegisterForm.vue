<template>
  <form @submit.prevent="register" class="auth-form">
    <h2>Lengkapi Data</h2>
    <input v-model="name" placeholder="Nama Lengkap" required />
    <input v-model="email" type="email" placeholder="Email" required />
    <input v-model="password" type="password" placeholder="Password" required />
    <input v-model="password_confirmation" type="password" placeholder="Konfirmasi Password" required />
    <button type="submit">Daftar</button>
    <div class="error" v-if="error">{{ error }}</div>
  </form>
</template>
<script setup>
import { ref } from 'vue';
import axios from 'axios';
import { useRouter, useRoute } from 'vue-router';
const name = ref('');
const email = ref('');
const password = ref('');
const password_confirmation = ref('');
const error = ref('');
const router = useRouter();
const route = useRoute();
const phone = route.query.phone;
const otp = route.query.otp;
const register = async () => {
  try {
    await axios.post('/api/auth/register', {
      phone,
      otp_code: otp,
      name: name.value,
      email: email.value,
      password: password.value,
      password_confirmation: password_confirmation.value
    });
    alert('Registrasi berhasil!');
    router.push({ name: 'Login' });
  } catch (e) {
    error.value = e.response?.data?.message || 'Registrasi gagal';
  }
};
</script>
<style scoped>
.auth-form { max-width: 350px; margin: auto; background: #fff; padding: 2rem; border-radius: 8px; box-shadow: 0 2px 8px #0001; }
input, button { display: block; margin: 10px 0; width: 100%; padding: 10px; border-radius: 4px; border: 1px solid #ccc; }
.error { color: red; margin-top: 10px; }
</style>
