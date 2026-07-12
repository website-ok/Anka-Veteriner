// ============================================================
// Firebase yapılandırması — Vet Anka Veteriner
// Firebase Console > Proje Ayarları > "Uygulamalarınız" > Web
// Ayrıntılı adımlar: KURULUM.md
// ============================================================

export const firebaseConfig = {
  apiKey: "AIzaSyCt8Cd7hpDCsTtvL5n9G1McEFwMd77xHB8",
  authDomain: "anka-veteriner-22f10.firebaseapp.com",
  projectId: "anka-veteriner-22f10",
  storageBucket: "anka-veteriner-22f10.firebasestorage.app",
  messagingSenderId: "599773283312",
  appId: "1:599773283312:web:bd55ed723d38e0b5d75335",
  measurementId: "G-X5MYEX8V4H",
};

// apiKey hâlâ "BURAYA" içeriyorsa Firebase kurulmamış demektir.
export const isConfigured = !String(firebaseConfig.apiKey).includes("BURAYA");
