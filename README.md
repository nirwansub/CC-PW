# Ansena CC-PW Assessment

Web assessment untuk kandidat **Corporate Communications** dan **People & Workplace**.

## Fitur

- 8 assessment posisi: Strategist, Creative, Publicist, Executor, Curator, Developer, Workplace, Executor.
- Link undangan unik dan single-attempt.
- Scoring otomatis + capability breakdown.
- Admin dashboard untuk melihat hasil, security events, dan capability checklist.
- Role-fit matrix dari checklist manual admin.
- Fullscreen wajib saat tes.
- Keluar fullscreen, pindah tab/app, atau kehilangan fokus dapat mengakhiri assessment otomatis.
- Copy/cut/paste, text selection, context menu, dan shortcut umum print/save/source/reload diblokir sebisa browser.

> Browser anti-cheat adalah deterrence/detection, bukan proctoring absolut. Website tidak bisa 100% mencegah screenshot hardware, kamera/perangkat kedua, atau manipulasi OS/browser.

## Deploy ke Vercel

1. Import repository ini ke Vercel.
2. Buat / connect **Vercel Blob** store dengan akses **Private**.
3. Tambahkan Environment Variables:
   - `ADMIN_PASSWORD` — password login admin.
   - `ADMIN_SECRET` — string acak panjang untuk signing cookie admin.
   - `BLOB_READ_WRITE_TOKEN` — biasanya dibuat otomatis saat Blob store tersambung.
4. Deploy ulang setelah environment variables tersedia.

## URL

- Candidate: `/`
- Admin: `/admin.html`

Admin membuat invitation link dari halaman admin lalu membagikannya ke kandidat.

## Catatan

Disarankan memakai Chrome/Edge desktop untuk kandidat. Fullscreen API pada browser mobile/iOS memiliki keterbatasan.
