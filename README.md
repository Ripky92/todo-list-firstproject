<div align="center">

# ✨ TaskFlow — Interactive To-Do List & Task Manager

<p align="center">
  <b>Aplikasi manajemen tugas harian yang modern, interaktif, dan kaya fitur dengan dukungan lampiran berkas, filter pintar, statistik progres, dan tema gelap/terang.</b>
</p>

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)
[![Status](https://img.shields.io/badge/Status-Active-brightgreen.svg?style=for-the-badge)]()

<br />

<!-- Anda dapat mengganti link gambar di bawah dengan screenshot aplikasi setelah di-host/diunggah -->
<p align="center">
  <img src="https://via.placeholder.com/900x450/4f46e5/ffffff?text=TaskFlow+Preview" alt="TaskFlow Preview" width="85%" style="border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.15);" />
</p>

</div>

---

## 📑 Daftar Isi

- [Tentang Proyek](#-tentang-proyek)
- [Fitur Utama](#-fitur-utama)
- [Teknologi yang Digunakan](#-teknologi-yang-digunakan)
- [Struktur Folder](#-struktur-folder)
- [Cara Menjalankan Secara Lokal](#-cara-menjalankan-secara-lokal)
- [Panduan Penggunaan](#-panduan-penggunaan)
- [Pengembangan Selanjutnya](#-rencana-pengembangan-selanjutnya)
- [Kontributor](#-kontributor)
- [Lisensi](#-lisensi)

---

## 💡 Tentang Proyek

**TaskFlow** dirancang bukan sekadar to-do list sederhana. Aplikasi ini memberikan pengalaman produktivitas yang lengkap dan memuaskan dengan antarmuka berbasis *modern glassmorphism*, micro-interactions yang halus, efek suara interaktif, serta animasi *confetti* perayaan saat tugas diselesaikan.

Seluruh data tugas, catatan, dan lampiran disimpan secara persisten di browser pengguna menggunakan **LocalStorage**, sehingga privasi tetap terjaga tanpa memerlukan backend database terpisah.

---

## 🚀 Fitur Utama

### 📊 1. Statistik & Pelacakan Progres
* **Ringkasan Real-Time**: Menampilkan total tugas, tugas aktif, tugas selesai, dan persentase keberhasilan (*completion rate*).
* **Dynamic Progress Bar**: Bar progres responsif lengkap dengan pesan motivasi yang berubah sesuai persentase pencapaian.

### ✍️ 2. Input Tugas yang Komprehensif
* **Judul Tugas**: Input cepat dengan pintasan keyboard <kbd>Enter</kbd>.
* **Tenggat Waktu (Due Date)**: Pilih batas waktu pengerjaan dengan peringatan status terlewat (*overdue*).
* **Level Prioritas**: Kategorisasi tingkat urgensi (🟢 Rendah, 🟡 Sedang, 🔴 Tinggi).
* **Kategori Tugas**: Pengelompokan fleksibel (*Umum, Pekerjaan, Belajar, Pribadi, Kesehatan*).
* **Catatan / Deskripsi Detail**: Tambahkan penjelasan atau instruksi rinci pada setiap tugas.
* **Lampiran Berkas (Multi-format)**: Dukungan unggah gambar (JPG, PNG, WebP), dokumen (PDF, Word, Excel, TXT, CSV), lengkap dengan pratinjau.

### 🔍 3. Filter Cerdas & Pengurutan (Sorting)
* **Pencarian Cepat**: Filter langsung berdasarkan nama tugas, catatan, maupun kategori.
* **Tab Status**: Filter instan berdasarkan *Semua*, *Aktif*, dan *Selesai*.
* **Filter Tanggal**: Tombol cepat untuk *Semua*, *Hari Ini*, *Besok*, *Minggu Ini*, *Terlewat (Overdue)*, atau pilih tanggal spesifik.
* **Multi-Sort**: Urutkan berdasarkan deadline terdekat/terjauh, waktu pembuatan, urutan abjad (A-Z / Z-A), atau prioritas.

### 🎨 4. Tampilan & Pengalaman Pengguna (UX)
* **Mode Gelap / Terang (Dark / Light Theme)**: Transisi halus sesuai kenyamanan mata pengguna.
* **Efek Suara & Haptik**: Suara klik yang memuaskan saat menyelesaikan tugas (dapat diaktifkan/dinonaktifkan).
* **Animasi Confetti**: Efek perayaan visual ketika tugas ditandai selesai.
* **Modal Detail & Edit**: Tampilan pop-up modern untuk melihat dan menyunting detail tugas.
* **Desain Responsif**: Tampilan optimal di perangkat smartphone, tablet, maupun desktop.

---

## 🛠️ Teknologi yang Digunakan

| Komponen | Deskripsi |
| :--- | :--- |
| **HTML5** | Struktur semantik, aksesibilitas ARIA, modal dialog, dan elemen canvas. |
| **CSS3** | CSS Variables, Flexbox, Grid, Glassmorphism UI, Ambient Glows, dan Dark/Light Mode. |
| **Vanilla JavaScript (ES6+)** | Logika DOM manipulation, pengelolaan state, drag & drop files, animasi canvas, dan LocalStorage API. |
| **Google Fonts** | Tipografi modern menggunakan *Plus Jakarta Sans*. |

---

## 📁 Struktur Folder

```plaintext
todo-list/
├── 📄 index.html        # Struktur HTML utama dan modal
├── 🎨 style.css          # Desain antarmuka, variabel tema, dan animasi
├── ⚡ script.js         # Logika aplikasi, pengelolaan state, dan event listener
└── 📖 README.md          # Dokumentasi proyek
```

---

## 💻 Cara Menjalankan Secara Lokal

Proyek ini dibuat menggunakan *pure client-side* (tanpa dependensi npm/build tools), sehingga dapat langsung dibuka:

### Opsi 1: Langsung Melalui Browser
1. Clone repositori ini:
   ```bash
   git clone https://github.com/Ripky92/todo-list-firstproject.git
   ```
2. Masuk ke direktori:
   ```bash
   cd todo-list
   ```
3. Buka file `index.html` langsung di browser favorit Anda (Chrome, Firefox, Edge, Safari).

### Opsi 2: Menggunakan Live Server (VS Code / Ekstensi)
1. Buka folder `todo-list` di Visual Studio Code.
2. Klik kanan pada `index.html` lalu pilih **"Open with Live Server"**.
3. Aplikasi akan berjalan di `http://127.0.0.1:5500`.

---

## 🎯 Panduan Penggunaan

1. **Menambah Tugas Baru**:
   * Ketik nama tugas pada kolom input utama.
   * Pilih tanggal, tingkat prioritas, dan kategori.
   * *(Opsional)* Klik **"Tambah Catatan & Lampiran Berkas"** untuk melampirkan file atau deskripsi panjang.
   * Tekan tombol **Tambah Tugas** atau tekan <kbd>Enter</kbd>.

2. **Menyelesaikan Tugas**:
   * Centang kotak lingkaran di samping nama tugas. Animasi *confetti* dan efek suara akan menyala!

3. **Melihat / Mengubah Tugas**:
   * Klik ikon mata/detail pada item tugas untuk membuka jendela modal informasi lengkap atau menyunting data.

4. **Menghapus Tugas Selesai**:
   * Gunakan tombol **"Hapus yang Selesai"** pada bilah kontrol untuk membersihkan daftar dengan cepat.

---

## 🗺️ Rencana Pengembangan Selanjutnya

- [ ] Integrasi sinkronisasi cloud (Firebase / Supabase).
- [ ] Pengingat notifikasi browser (*Web Push Notifications*).
- [ ] Fitur ekspor & impor data tugas (JSON / CSV).
- [ ] Mode Pomodoro Timer terintegrasi untuk fokus kerja.

---

## 👤 Kontributor

* **Ripky92** - [GitHub Profil](https://github.com/Ripky92)

---

## 📄 Lisensi

Proyek ini didistribusikan di bawah lisensi **MIT**. Silakan gunakan dan kembangkan secara bebas.
