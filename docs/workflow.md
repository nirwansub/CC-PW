# CC-PW — alur aktif

Keputusan Nirwan, 1 Oktober 2026 pukul 12.37 WIB, menggantikan bagian durasi/practical/routing pendalaman dari audit sebelumnya.

- CC = Corporate Communications; PW = People & Workplace, masing-masing empat role.
- Pre-assessment tetap 32 soal; durasi tepat 15 menit. Soal dan opsi diacak per sesi, tersimpan dengan ID asli.
- Post-test tanpa batas waktu. Practical dilakukan di luar web dan tidak ikut nilai gabungan web.
- Kode peserta enam digit unik dibuat dengan nama dan tim saat ini. Kode yang sama berlaku dari pre sampai post; masa undangan membatasi awal pre, bukan kelanjutan post setelah pre dimulai.
- Kandidat mengisi pre, lalu profil opsional. English dan seluruh profil tetap non-scoring.
- Admin melihat skor seluruh role, preferensi awal, dan dua rekomendasi sistem. Pilihan awal materi adalah gabungan preferensi dan dua rekomendasi tersebut.
- Setelah berdiskusi dengan kandidat, admin memilih role dan menerbitkan materi. Pilihan dapat mencakup lebih dari dua role; skor dan rekomendasi pre tidak berubah.
- PDF yang diunduh dari QR berisi prinsip bersama satu kali dan hanya modul role yang diterbitkan. QR langsung membuka unduhan PDF. Login post tetap memakai kode peserta yang sama.
- Post-test hanya tersedia untuk role yang diterbitkan dan telah dikonfirmasi dibaca. Role dengan post-test yang sudah dimulai tidak dapat dicabut dari pilihan.
- Kode pendek tidak disimpan di repository; mapping dan jawaban ada di private Blob. Percobaan kode salah berulang dibatasi.
- Rancangan bank soal, rubrik dan bobot dipakai untuk trial. Kalibrasi berikutnya memakai masukan Nirwan dari trial; tidak menghambat penggunaan versi ini.
- Repository tetap public sesuai keputusan user. Daftar kandidat nyata tidak ditulis ke repository.

Validasi lokal: 14 tes otomatis lulus, build dan sintaks lulus. Semua sembilan aset PDF dirender dan ditinjau.

Penilai AI memilih indeks potongan jawaban asli sebagai evidence; server mengembalikan kutipan persis untuk setiap kriteria. Nilai dan bobot tidak berubah.

Revisi keamanan 1 Oktober 2026 pukul 13.57 WIB: keluar fullscreen, pindah tab/aplikasi atau kehilangan fokus menampilkan popup Kecurangan terdeteksi dengan tombol lanjutkan tes. Kesempatan dan jawaban tidak langsung diakhiri. Konfirmasi mengembalikan fullscreen; timer pre tetap berjalan. Peringatan dan konfirmasinya tercatat untuk admin. Waktu habis tetap menutup tes.


## Security policy updated 1 October 2026, 14:10 WIB

Fullscreen is attempted at start and is optional thereafter. Fullscreen exit alone never flags cheating. On a touch device, visible-page focus loss while an editable field is active is treated as an on-screen keyboard transition; a hidden page still raises a warning. Copy, cut, paste, clipboard/drop beforeinput, context menu, drag/drop, auxiliary link clicks and intercepted browser shortcuts are blocked during an active test. Browsers/OS may reserve shortcuts and browser chrome actions, so this is detection and deterrence, not a kiosk guarantee.

A warning displays “Kecurangan terdeteksi” and “lanjutkan tes”, plus a ten-second countdown. Without confirmation, partial saved answers are submitted and locked, marked for admin review. Warning deadlines are persisted on the server and cannot be extended by duplicate events or reload. A suspended browser may delay its network request; the persisted deadline is settled on the next candidate/admin request and late resume/save requests are rejected. The assessment timer also continues.
