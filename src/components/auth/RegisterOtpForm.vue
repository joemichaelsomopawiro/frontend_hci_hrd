<template>
  <div class="auth-form">
    <h2>Masukkan OTP</h2>
    <v-otp-input :num-inputs="6" @on-complete="verifyOtp" input-classes="otp-input"/>
    <div class="error" v-if="error">{{ error }}</div>
  </div>
</template>
<script setup>
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
const error = ref('');
const router = useRouter();
const route = useRoute();
const phone = route.query.phone;
const verifyOtp = (otp) => {
  router.push({ name: 'RegisterForm', query: { phone, otp } });
};
</script>
<style scoped>
.auth-form { max-width: 350px; margin: auto; background: #fff; padding: 2rem; border-radius: 8px; box-shadow: 0 2px 8px #0001; }
.otp-input { width: 40px; height: 40px; margin: 0 5px; text-align: center; font-size: 20px; }
.error { color: red; margin-top: 10px; }
</style>
