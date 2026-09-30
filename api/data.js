export const ROLES={
  "cc-strategist":{team:"Corporate Communications",role:"Strategist",duration:15},
  "cc-creative":{team:"Corporate Communications",role:"Creative",duration:15},
  "cc-publicist":{team:"Corporate Communications",role:"Publicist",duration:15},
  "cc-executor":{team:"Corporate Communications",role:"Executor",duration:12},
  "pw-curator":{team:"People & Workplace",role:"Curator",duration:15},
  "pw-developer":{team:"People & Workplace",role:"Developer",duration:15},
  "pw-workplace":{team:"People & Workplace",role:"Workplace",duration:15},
  "pw-executor":{team:"People & Workplace",role:"Executor",duration:12}
};

export const QUESTIONS={
  "cc-strategist":[
    {id:"s1",q:"Kamu menemukan logo, tone komunikasi, dan signage beberapa unit berbeda-beda. Langkah pertama?",o:["Langsung buat guideline baru","Audit seluruh titik yang berbeda dan prioritaskan dampaknya","Minta Creative merapikan semuanya","Pilih versi yang paling bagus secara visual"],a:1,t:["strategic","systematic","brand"]},
    {id:"s2",q:"Ada isu negatif kecil mengenai perusahaan mulai beredar. Apa tindakan awal terbaik?",o:["Segera buat klarifikasi panjang","Diam sampai isu membesar","Verifikasi fakta, sumber, jangkauan, dan risikonya","Hapus semua konten terkait"],a:2,t:["risk","judgment","communication"]},
    {id:"s3",q:"Ada tawaran CSR menarik tetapi tidak relevan dengan positioning perusahaan.",o:["Terima karena CSR selalu positif","Nilai kesesuaian tujuan, dampak, biaya, dan reputasinya","Serahkan seluruh keputusan ke Publicist","Terima jika dokumentasinya bagus"],a:1,t:["strategic","csr","judgment"]},
    {id:"s4",q:"Draft kontrak partner punya klausul yang risikonya belum jelas. Apa yang paling tepat?",o:["Revisi sendiri supaya lebih aman","Tanda tangani karena partner yang membuat","Identifikasi bagian yang perlu review, kumpulkan konteks, lalu koordinasikan dengan external counsel","Serahkan seluruh proses ke Publicist"],a:2,t:["legal","risk","judgment"]},
    {id:"s5",q:"Sistem memberi reminder kontrak akan habis dalam 30 hari.",o:["Buat kontrak baru langsung","Pastikan owner bisnis menentukan lanjut/tidak, lalu koordinasikan dokumen yang diperlukan","Tunggu partner bertanya","Serahkan ke Executor"],a:1,t:["legal","followup","systematic"]}
  ],
  "cc-creative":[
    {id:"c1",q:"Brief meminta desain tetapi tujuan komunikasinya belum jelas.",o:["Mulai dari referensi visual","Klarifikasi tujuan dan audiens terlebih dahulu","Gunakan template lama","Buat opsi sebanyak mungkin"],a:1,t:["brief","communication","judgment"]},
    {id:"c2",q:"Brand memiliki banyak unit dengan identitas terkait.",o:["Semua dibuat identik","Semua dibuat bebas supaya unik","Pertahankan sistem visual bersama dengan ruang variasi yang jelas","Ikuti selera PIC masing-masing"],a:2,t:["visual","systematic","brand"]},
    {id:"c3",q:"Vendor mengirim hasil cetak berbeda dari desain.",o:["Terima karena sudah diproduksi","Bandingkan dengan spesifikasi dan minta koreksi bila deviasinya signifikan","Ubah desain digital agar sesuai hasil cetak","Serahkan sepenuhnya ke Executor"],a:1,t:["detail","quality","vendor"]},
    {id:"c4",q:"File final akan dipakai ulang beberapa bulan lagi.",o:["Simpan JPG final saja","Simpan file editable, asset, referensi font, dan final secara terstruktur","Simpan di laptop designer","Kirim lewat chat supaya mudah dicari"],a:1,t:["documentation","systematic","detail"]},
    {id:"c5",q:"Deadline sangat mepet.",o:["Hilangkan QC","Kurangi scope tetapi pertahankan standard minimum","Gunakan desain apa pun yang tercepat","Tunggu sampai ada waktu lebih longgar"],a:1,t:["quality","judgment","delivery"]}
  ],
  "cc-publicist":[
    {id:"p1",q:"Komentar publik berisi kritik yang sebagian benar.",o:["Hapus","Bantah semua","Verifikasi dan respons hanya pada fakta yang sudah dipastikan","Tidak usah merespons"],a:2,t:["reputation","judgment","communication"]},
    {id:"p2",q:"Partner CSR meminta posting sebelum detail program final.",o:["Posting agar partner senang","Minta Creative segera membuat visual","Finalkan fakta, wording, tanggung jawab, dan approval terlebih dahulu","Posting teaser tanpa approval"],a:2,t:["csr","accuracy","stakeholder"]},
    {id:"p3",q:"Kamu menemukan profil perusahaan lama masih online.",o:["Abaikan karena bukan kanal utama","Catat, nilai dampaknya, lalu koreksi atau minta pembaruan","Buat posting baru untuk menutupinya","Minta semua orang report link"],a:1,t:["sweeping","followup","reputation"]},
    {id:"p4",q:"Ada isu belum memiliki fakta lengkap tetapi media meminta komentar.",o:["Berspekulasi agar tidak terlihat diam","Berikan holding statement yang hanya memuat fakta terverifikasi","Ceritakan informasi internal agar terlihat transparan","Tidak pernah menjawab media"],a:1,t:["crisis","accuracy","communication"]},
    {id:"p5",q:"Saat event, stakeholder penting komplain di depan umum.",o:["Debat agar fakta tidak salah","Dengarkan, jaga manner, pindahkan pembahasan ke jalur yang tepat, dan dokumentasikan isu","Abaikan","Langsung posting klarifikasi"],a:1,t:["hospitality","reputation","communication"]}
  ],
  "cc-executor":[
    {id:"e1",q:"Vendor menawarkan harga lebih murah tetapi spesifikasinya berbeda.",o:["Ambil yang murah","Bandingkan spesifikasi sebelum memutuskan","Ambil lalu informasikan setelahnya","Minta vendor memilih"],a:1,t:["procurement","detail","judgment"]},
    {id:"e2",q:"Dua pekerjaan lapangan datang bersamaan.",o:["Kerjakan yang paling dekat","Kerjakan yang paling mudah","Cek deadline, urgensi, dan dampak lalu konfirmasi prioritas","Pilih secara acak"],a:2,t:["priority","communication","delivery"]},
    {id:"e3",q:"Setelah belanja, struk hilang.",o:["Tidak masalah kalau nominal kecil","Buat sendiri bukti baru","Hubungi vendor dan cari bukti transaksi yang sah","Masukkan tanpa bukti"],a:2,t:["integrity","documentation","procurement"]},
    {id:"e4",q:"Banner event ternyata salah ukuran saat tiba.",o:["Paksa dipasang","Laporkan segera dan cari opsi koreksi paling realistis","Diam sampai acara","Potong sendiri tanpa konfirmasi"],a:1,t:["problem","communication","delivery"]},
    {id:"e5",q:"Task selesai tetapi tidak di-update.",o:["Tetap dianggap selesai","Tidak masalah bila PIC tahu","Belum dianggap closed sampai status dan bukti diperbarui","Update hanya saat diminta"],a:2,t:["documentation","ownership","followup"]}
  ],
  "pw-curator":[
    {id:"u1",q:"Kandidat sangat komunikatif tetapi informasi CV dan wawancaranya berbeda.",o:["Abaikan karena komunikasinya bagus","Langsung gugurkan","Verifikasi perbedaan sebelum membuat kesimpulan","Percaya CV"],a:2,t:["verification","objectivity","interview"]},
    {id:"u2",q:"Teman dekatmu menjadi kandidat.",o:["Nilai lebih tinggi karena sudah mengenalnya","Gunakan indikator yang sama dan deklarasikan potensi bias","Tidak perlu assessment","Serahkan ke kandidat lain"],a:1,t:["objectivity","integrity","assessment"]},
    {id:"u3",q:"Tidak ada kebutuhan kandidat baru bulan ini.",o:["Tetap scouting sebanyak mungkin","Fokus memperbarui talent mapping dan database","Tidak perlu melakukan apa pun","Ubah target scouting menjadi training"],a:1,t:["mapping","systematic","judgment"]},
    {id:"u4",q:"Kandidat punya CV biasa tetapi hasil assessment sangat kuat.",o:["CV selalu lebih penting","Nilai berdasarkan seluruh evidence, bukan CV saja","Gugurkan","Tunggu kandidat lain"],a:1,t:["assessment","objectivity","judgment"]},
    {id:"u5",q:"Background check menemukan informasi negatif yang tidak relevan dengan pekerjaan.",o:["Otomatis menggugurkan kandidat","Sebarkan ke user department","Pisahkan informasi relevan dan tidak relevan sebelum mengambil keputusan","Simpan sebagai catatan informal"],a:2,t:["background","privacy","objectivity"]}
  ],
  "pw-developer":[
    {id:"d1",q:"Tim meminta training karena performanya turun.",o:["Langsung buat training","Cari dahulu gap kemampuan dan apakah training memang solusinya","Kirim video pembelajaran","Buat ujian"],a:1,t:["diagnosis","development","judgment"]},
    {id:"d2",q:"Peserta mendapat nilai teori tinggi tetapi perilaku kerjanya buruk.",o:["Lulus karena nilai tinggi","Gagal otomatis","Nilai kompetensi dan perilaku sebagai komponen berbeda","Abaikan attitude"],a:2,t:["attitude","evaluation","objectivity"]},
    {id:"d3",q:"Kamu diminta membentuk tim baru.",o:["Cari orang dulu","Tentukan fungsi, scope, posisi, kompetensi, dan KPI sebelum placement","Copy struktur tim lama","Tunjuk leader dulu"],a:1,t:["orgdev","systematic","strategic"]},
    {id:"d4",q:"Dua posisi saling melempar pekerjaan.",o:["Biarkan mereka menyelesaikan sendiri","Dokumentasikan owner, batas peran, handover, dan approval","Beri pekerjaan pada orang yang paling cepat","Tambah orang baru"],a:1,t:["orgdev","documentation","problem"]},
    {id:"d5",q:"Training selesai.",o:["Program selesai begitu kelas berakhir","Nilai completion saja","Ukur hasil, perilaku setelah training, dan tindak lanjut","Berikan sertifikat"],a:2,t:["evaluation","followup","coaching"]}
  ],
  "pw-workplace":[
    {id:"w1",q:"Toilet tampak bersih tetapi lantainya sering basah.",o:["Tidak masalah selama tidak bau","Masukkan kondisi kering sebagai standard inspeksi","Tambah pewangi","Bersihkan hanya pagi"],a:1,t:["cleanliness","standard","safety"]},
    {id:"w2",q:"Banyak karyawan mengeluh ruang kerja terlalu panas.",o:["Itu masalah personal","Langsung beli AC baru","Verifikasi suhu, area, waktu kejadian, dan kondisi peralatan","Minta karyawan pindah tempat"],a:2,t:["comfort","diagnosis","facility"]},
    {id:"w3",q:"Kabel listrik melintang di jalur orang berjalan.",o:["Tunggu jadwal inspeksi","Foto untuk laporan bulanan","Amankan risiko segera lalu dokumentasikan tindakan","Beri tanda saja"],a:2,t:["safety","risk","urgency"]},
    {id:"w4",q:"OB malam mengatakan pekerjaan pagi belum selesai.",o:["Suruh malam menyelesaikan","Buat checklist handover yang jelas per shift","Ganti OB pagi","Tambah pekerjaan malam"],a:1,t:["handover","documentation","cleanliness"]},
    {id:"w5",q:"Tiga orang mengeluh bau di satu area kantor tetapi tidak ada kerusakan terlihat.",o:["Pasang pengharum","Tunggu keluhan berikutnya","Periksa sumber, waktu kejadian, ventilasi/drainase/peralatan terkait, lalu catat temuan","Minta OB lebih sering mengepel"],a:2,t:["diagnosis","comfort","facility"]}
  ],
  "pw-executor":[
    {id:"x1",q:"Workplace meminta alat kebersihan dengan spesifikasi tertentu.",o:["Beli yang tersedia","Pastikan spesifikasi, jumlah, dan deadline sebelum membeli","Pilih merek termahal","Minta OB membeli"],a:1,t:["procurement","detail","communication"]},
    {id:"x2",q:"Barang harus didistribusikan ke tiga area.",o:["Antar tanpa pencatatan","Buat daftar barang, penerima, jumlah, dan serah-terima","Berikan semua ke satu PIC","Minta penerima mengambil sendiri"],a:1,t:["documentation","asset","ownership"]},
    {id:"x3",q:"Setup training belum selesai 30 menit sebelum mulai.",o:["Diam dan percepat sendiri","Identifikasi blocker dan eskalasi segera sambil menyelesaikan prioritas utama","Tunda acara tanpa konfirmasi","Kurangi perlengkapan tanpa izin"],a:1,t:["delivery","escalation","problem"]},
    {id:"x4",q:"Vendor terlambat mengirim perlengkapan safety.",o:["Tunggu","Cari status, informasikan PIC, dan siapkan alternatif","Batalkan tanpa pemberitahuan","Ubah deadline di tracker"],a:1,t:["vendor","communication","problem"]},
    {id:"x5",q:"Kamu selesai melakukan pekerjaan lapangan.",o:["Pulang","Kirim 'done'","Update status, dokumentasi, bukti, dan kendala bila ada","Tunggu ditanya"],a:2,t:["documentation","ownership","followup"]}
  ]
};

export const TRAIT_LABELS={
 strategic:"Strategis",systematic:"Sistematis",brand:"Pemahaman brand",risk:"Peka risiko",judgment:"Pertimbangan",communication:"Komunikasi",
 csr:"CSR judgment",legal:"Legal coordination",followup:"Follow-up",brief:"Memahami brief",visual:"Visual sense",detail:"Ketelitian",quality:"Quality control",
 vendor:"Vendor handling",documentation:"Dokumentasi",delivery:"Delivery",reputation:"Reputasi",accuracy:"Akurasi",stakeholder:"Stakeholder management",
 sweeping:"Penyisiran konten",crisis:"Crisis communication",hospitality:"Manner/Hospitality",procurement:"Pengadaan",priority:"Prioritas",integrity:"Integritas",
 problem:"Problem solving",ownership:"Ownership",verification:"Verifikasi",objectivity:"Objektivitas",interview:"Wawancara",assessment:"Penilaian",mapping:"Pemetaan talent",
 background:"Background check",privacy:"Privasi",diagnosis:"Diagnosis kebutuhan",development:"Development sense",attitude:"Manner & attitude",evaluation:"Evaluasi",
 orgdev:"Organization development",coaching:"Coaching",cleanliness:"Kebersihan",standard:"Menjaga standard",safety:"Keselamatan",comfort:"Kenyamanan",
 facility:"Fasilitas",urgency:"Sense of urgency",handover:"Handover",asset:"Kontrol aset",escalation:"Eskalasi"
};

export const CAPABILITY_TRAITS=[
 "Manner bagus","Hospitality","Komunikatif","Tulisan bagus","Strategis","Kreatif","Teliti","Sistematis","Objektif","Membaca orang",
 "Mengajar / coaching","Tegas","Menjaga rahasia","Peka risiko","Peka kenyamanan","Peka kebersihan","Rapi dokumentasi","Follow-up","Responsif",
 "Mobile / mau lapangan","Vendor handling","Problem solving","Ownership","Integritas","Patuh prosedur","Visual sense","Legal/risk awareness"
];

export const ROLE_TRAIT_WEIGHTS={
 "cc-strategist":{"Strategis":3,"Sistematis":3,"Tulisan bagus":2,"Komunikatif":2,"Teliti":2,"Peka risiko":2,"Legal/risk awareness":3,"Problem solving":2,"Ownership":3,"Follow-up":2,"Menjaga rahasia":2},
 "cc-creative":{"Kreatif":3,"Visual sense":3,"Teliti":3,"Sistematis":2,"Rapi dokumentasi":2,"Problem solving":2,"Ownership":2,"Komunikatif":1},
 "cc-publicist":{"Manner bagus":3,"Hospitality":3,"Komunikatif":3,"Tulisan bagus":3,"Responsif":3,"Menjaga rahasia":2,"Problem solving":2,"Follow-up":2,"Ownership":2,"Peka risiko":1},
 "cc-executor":{"Teliti":2,"Rapi dokumentasi":3,"Follow-up":3,"Responsif":3,"Mobile / mau lapangan":3,"Vendor handling":3,"Problem solving":2,"Ownership":3,"Integritas":3,"Patuh prosedur":2},
 "pw-curator":{"Teliti":3,"Sistematis":2,"Objektif":3,"Membaca orang":3,"Menjaga rahasia":3,"Komunikatif":2,"Follow-up":2,"Ownership":2,"Integritas":3},
 "pw-developer":{"Manner bagus":3,"Hospitality":2,"Komunikatif":3,"Strategis":2,"Sistematis":3,"Objektif":2,"Membaca orang":3,"Mengajar / coaching":3,"Tegas":2,"Menjaga rahasia":2,"Problem solving":2,"Ownership":3},
 "pw-workplace":{"Manner bagus":2,"Hospitality":2,"Teliti":3,"Sistematis":3,"Tegas":2,"Peka risiko":3,"Peka kenyamanan":3,"Peka kebersihan":3,"Rapi dokumentasi":2,"Responsif":3,"Problem solving":3,"Ownership":3,"Patuh prosedur":3},
 "pw-executor":{"Teliti":2,"Rapi dokumentasi":3,"Follow-up":3,"Responsif":3,"Mobile / mau lapangan":3,"Vendor handling":2,"Problem solving":2,"Ownership":3,"Integritas":3,"Patuh prosedur":2,"Peka kebersihan":1,"Peka risiko":1}
};
