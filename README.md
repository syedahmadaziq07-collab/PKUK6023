# KEDAI MINI BIJAK – 3D POV ADVENTURE
> *“Jom Membeli-Belah dengan Bijak!”*

Permainan 3D Orang Pertama (First-Person Perspective) Pendidikan Khas untuk Murid Berkeperluan Pendidikan Khas (MBPK) di Malaysia.

---

## 🌟 Pengenalan & Objektif Pembelajaran

**KEDAI MINI BIJAK** membawa murid meneroka sebuah kedai runcit / supermarket 3D yang ceria dan mesra kanak-kanak melalui perspektif pandangan orang pertama (POV). Murid dapat berjalan, melihat sekeliling, memilih barangan dari rak, mengenali wang kertas Malaysia (RM1, RM5, RM10), dan membuat bayaran di kaunter juruwang.

### Objektif Pembelajaran (KSSR Pendidikan Khas - Matematik: Wang)
1. **Mengenali Mata Wang Malaysia**:
   - RM1 (Warna Biru, motif Wau Bulan)
   - RM5 (Warna Hijau, motif Burung Enggang Badak)
   - RM10 (Warna Merah, motif Bunga Rafflesia)
2. **Memadankan Nilai & Tanda Harga**:
   - Membaca tanda harga barangan (Roti RM2, Susu RM5, Pensel RM1, Buku Nota RM3, Epal RM4, Air Mineral RM1).
   - Memilih kombinasi wang kertas yang sepadan dengan harga.
3. **Simulasi Pembayaran di Kaunter Juruwang**:
   - Interaksi sosial mesra bersama avatar juruwang (Kak Siti).
   - Memilih wang dari dompet maya dan meletakkannya di atas dulang bayaran.
   - Mengesahkan persamaan wang (contoh: RM1 + RM1 = RM2).

---

## 🎮 Kawalan Permainan (Controls)

### 💻 Komputer / Komputer Riba:
- **W / A / S / D** atau **Anak Panah**: Bergerak ke hadapan, belakang, kiri, dan kanan.
- **Tetikus**: Menggerakkan pandangan kamera 3D ke sekeliling (Pointer-Lock).
- **E / Enter / Ruang**: Berinteraksi dengan barangan rak, stesen wang, atau juruwang.
- **ESC**: Melepaskan kawalan tetikus.

### 📱 Telefon Pintar / Tablet:
- **Kayu Riang Maya (Kiri Bawah)**: Kawalan analog pergerakan pemain.
- **Seret Skrin (Kanan)**: Mengubah arah pandangan kamera 3D.
- **Butang Besar "AMBIL / INTERAKSI"**: Muncul secara automatik apabila dekat dengan objek.
- **Butang "Bawa Saya Ke..."**: Pilihan navigasi pantas (teleport) ke stesen wang, rak barangan, atau kaunter juruwang.

---

## 🏫 Ruang Guru & Penyelaras MBPK

Boleh diakses melalui menu utama atau butang "Ruang Guru" pada paparan HUD:
- **Ringkasan Prestasi**: Ketepatan percubaan pertama, jumlah cubaan semula, dan penggunaan petunjuk.
- **Log Pembelian**: Senarai transaksi lengkap berserta cap masa dan cubaan.
- **Penilaian Diagnostik**:
  - Penilaian Awal (*Pre-Test*) – 5 soalan asas.
  - Penilaian Akhir (*Post-Test*) – 5 soalan pengukuhan.
- **Teori Pembelajaran**: Penjelasan teori Kognitif (Piaget), Behavioral (Skinner), dan Sosioemosional.
- **Eksport Laporan CSV**: Memuat turun laporan kemajuan murid dalam format fail CSV untuk pemfailan IEP / fail murid tanpa mengumpul maklumat peribadi sensitif.

---

## 🛠️ Teknologi & Seni Bina

- **Framework**: React 19 + TypeScript + Vite
- **Grafik 3D**: Three.js (r183+)
- **Sintesis Audio**: Web Audio API (prosedural, sifar kebergantungan fail luar)
- **Sintesis Pertuturan**: Web Speech API (Bahasa Melayu)
- **Gaya & Reka Bentuk**: Tailwind CSS + Lucide Icons + Fredoka & Nunito Typography
- **Penyimpanan**: Browser LocalStorage
- **Ujian Unit**: Node.js Test Runner (`node:test`)

---

## 🚀 Arahan Pemasangan & Pelaksanaan

### 1. Pemasangan Pakej
```bash
npm install
```

### 2. Menjalankan Pelayan Pembangunan
```bash
npm run dev
```

### 3. Menjalankan Ujian Unit
```bash
npx --yes tsx --test src/game/currency.test.ts
```

### 4. Membina untuk Pelancaran (Production Build)
```bash
npm run build
```

---

## 🌐 Penerbitan di Render (Render Static Site)

- **Service Type**: Static Site
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `dist`
- Konfigurasi automasi disertakan dalam fail `render.yaml`.
