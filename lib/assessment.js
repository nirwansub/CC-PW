import {LEADERSHIP} from './leadership.js';
import {COMPARISON} from './comparison.js';
export const VERSION='pilot-2026-10-01-evidence-v3';
export const ROLES={
 'cc-strategist':{team:'Corporate Communications',role:'Strategist'},
 'cc-creative':{team:'Corporate Communications',role:'Creative'},
 'cc-publicist':{team:'Corporate Communications',role:'Publicist'},
 'cc-executor':{team:'Corporate Communications',role:'Executor'},
 'pw-curator':{team:'People & Workplace',role:'Curator'},
 'pw-developer':{team:'People & Workplace',role:'Developer'},
 'pw-workplace':{team:'People & Workplace',role:'Workplace'},
 'pw-executor':{team:'People & Workplace',role:'Executor'}
};
export const CAPS={strategy:'Strategi & prioritas',communication:'Komunikasi & pelayanan',creative:'Kreativitas & kualitas visual',operations:'Pelaksanaan & pengadaan',people:'Penilaian talent & objektivitas',learning:'Pengembangan & coaching',workplace:'Kebersihan & kenyamanan',risk:'Risiko, keselamatan & batas kewenangan',documentation:'Dokumentasi & ketelitian',ownership:'Tanggung jawab & tindak lanjut'};
export const WEIGHTS={
 'cc-strategist':{strategy:4,communication:2,creative:1,operations:1,people:1,learning:1,workplace:1,risk:3,documentation:2,ownership:3},
 'cc-creative':{strategy:2,communication:2,creative:5,operations:1,people:1,learning:1,workplace:1,risk:1,documentation:3,ownership:2},
 'cc-publicist':{strategy:2,communication:5,creative:1,operations:1,people:2,learning:1,workplace:1,risk:3,documentation:2,ownership:3},
 'cc-executor':{strategy:1,communication:2,creative:1,operations:5,people:1,learning:1,workplace:1,risk:2,documentation:3,ownership:4},
 'pw-curator':{strategy:2,communication:3,creative:1,operations:1,people:5,learning:2,workplace:1,risk:3,documentation:3,ownership:2},
 'pw-developer':{strategy:3,communication:3,creative:1,operations:1,people:3,learning:5,workplace:1,risk:2,documentation:2,ownership:3},
 'pw-workplace':{strategy:2,communication:2,creative:1,operations:3,people:1,learning:1,workplace:5,risk:4,documentation:3,ownership:3},
 'pw-executor':{strategy:1,communication:2,creative:1,operations:5,people:1,learning:1,workplace:2,risk:3,documentation:3,ownership:4}
};
// Every option carries several signals. 0..4 is evidence quality, not a binary answer key.
const option=(text,signals)=>({text,signals});
const sjt=(id,role,q,options)=>({id,type:'sjt',role,q,options:options.map(x=>option(x[0],x[1]))});
const essay=(id,q,criteria,role=null)=>({id,type:'essay',role,q,criteria:criteria.map(([cap,description])=>({cap,description})),maxLength:2500});
export const PRE=[
 sjt('pre01','cc-strategist','Identitas beberapa unit berbeda. Anggaran audit hanya cukup untuk satu minggu. Apa fokus awalmu?',[
 ['Inventarisasi seluruh variasi, lalu pilih titik berdampak tinggi untuk diuji lebih dulu.',{strategy:4,documentation:4,ownership:3}],
 ['Samakan kanal utama terlebih dahulu, sambil mencatat pengecualian untuk tahap berikutnya.',{strategy:3,creative:3,operations:3}],
 ['Wawancarai pengelola unit untuk memahami alasan variasi, lalu tetapkan prioritas bersama.',{strategy:3,communication:4,people:3}],
 ['Uji satu sistem visual pada unit pilot, ukur respons, lalu perluas bila efektif.',{strategy:3,creative:4,learning:3}]]),
 sjt('pre02','cc-strategist','Partner meminta kontrak segera ditandatangani, tetapi klausul tanggung jawab belum jelas. Langkahmu?',[
 ['Susun ringkasan risiko dan kebutuhan bisnis untuk review penasihat hukum sebelum keputusan owner.',{risk:4,strategy:4,documentation:4}],
 ['Minta partner menjelaskan klausul tertulis, lalu sampaikan penjelasannya ke owner bisnis.',{risk:3,communication:4,documentation:3}],
 ['Usulkan batas sementara untuk kegiatan yang sudah disetujui sambil menunggu review klausul.',{risk:3,operations:4,ownership:3}],
 ['Ajukan penundaan singkat beserta dampak komersial dan jadwal keputusan yang jelas.',{risk:3,strategy:3,ownership:4}]]),
 sjt('pre03','cc-strategist','Program CSR mendapat antusiasme, tetapi biaya naik dan dampaknya belum terukur. Apa rekomendasimu?',[
 ['Tetapkan indikator dampak dan biaya, lalu jalankan pilot lebih kecil sebelum memperluas.',{strategy:4,learning:4,documentation:3}],
 ['Pertahankan cakupan dengan mencari partner pendanaan, sambil mengukur hasil program.',{strategy:3,communication:4,operations:3}],
 ['Fokuskan kegiatan ke kelompok penerima paling relevan, lalu evaluasi manfaatnya.',{strategy:4,people:3,ownership:3}],
 ['Negosiasikan format yang lebih hemat sambil mempertahankan komitmen yang sudah diumumkan.',{strategy:3,operations:4,risk:3}]]),
 sjt('pre04','cc-creative','Brief visual cukup lengkap, tetapi audiens dan tujuan materi berbeda menurut dua PIC. Apa yang kamu lakukan?',[
 ['Tulis dua interpretasi tujuan dan minta satu owner menyepakati kriteria keberhasilan.',{strategy:4,communication:4,documentation:4}],
 ['Buat dua sketsa sederhana untuk membantu PIC membandingkan arah komunikasi.',{creative:4,communication:3,operations:3}],
 ['Audit materi sebelumnya dan usulkan arah paling konsisten dengan sistem brand.',{creative:4,strategy:3,documentation:3}],
 ['Pilih bagian brief yang disepakati untuk dikerjakan sambil menjadwalkan klarifikasi sisanya.',{operations:4,ownership:3,communication:3}]]),
 sjt('pre05','cc-creative','Hasil cetak berbeda warna dari proof, acara besok, dan vendor menawarkan cetak ulang sebagian. Prioritasmu?',[
 ['Bandingkan deviasi dengan standar, pilih materi paling terlihat untuk dicetak ulang, catat keputusan.',{creative:4,documentation:4,operations:4}],
 ['Gunakan materi digital untuk titik utama dan batasi cetakan yang menyimpang ke area sekunder.',{creative:3,strategy:3,operations:4}],
 ['Minta sample koreksi cepat dan pastikan waktu pengiriman sebelum menyetujui cetak ulang.',{creative:4,operations:4,ownership:3}],
 ['Konsultasikan batas toleransi kepada owner brand dan kirim opsi biaya serta jadwal.',{risk:4,communication:4,documentation:3}]]),
 sjt('pre06','cc-creative','File desain harus diteruskan ke orang lain dalam dua bulan. Apa bentuk handover yang kamu pilih?',[
 ['Folder editable, aset berlisensi, spesifikasi, versi final, dan catatan penggunaan.',{creative:4,documentation:4,ownership:4}],
 ['Template terstandardisasi dan walkthrough singkat untuk penerima, disertai tautan aset.',{learning:4,creative:3,documentation:3}],
 ['Paket export berbagai ukuran dengan indeks kebutuhan kanal dan kontak penanggung jawab.',{operations:4,communication:3,documentation:3}],
 ['Panduan visual singkat beserta file sumber dan daftar keputusan yang masih terbuka.',{creative:4,strategy:3,documentation:4}]]),
 sjt('pre07','cc-publicist','Kritik publik sebagian benar; fakta lain belum jelas. Apa respons awalmu?',[
 ['Akui bagian terverifikasi, jelaskan tindak lanjut, dan hindari menyimpulkan bagian belum jelas.',{communication:4,risk:4,ownership:4}],
 ['Hubungi pengkritik untuk mengumpulkan kronologi lalu berikan pembaruan publik pada waktu tertentu.',{communication:4,people:3,ownership:3}],
 ['Koordinasikan fakta dan satu juru bicara sebelum mengirim pernyataan singkat.',{risk:4,documentation:3,strategy:3}],
 ['Susun FAQ internal agar petugas menjawab konsisten sambil memantau perkembangan isu.',{communication:3,documentation:4,strategy:3}]]),
 sjt('pre08','cc-publicist','Partner meminta teaser CSR sebelum angka penerima manfaat final. Apa pilihanmu?',[
 ['Tawarkan teaser tujuan tanpa angka, setelah fakta dan wording mendapat persetujuan.',{communication:4,risk:4,creative:3}],
 ['Minta partner memfinalkan angka minimum yang dapat dipertanggungjawabkan untuk teaser.',{communication:3,documentation:4,ownership:3}],
 ['Jadwalkan teaser setelah konfirmasi data, sambil mengirim materi yang siap ditinjau.',{risk:4,operations:3,ownership:4}],
 ['Gunakan cerita kebutuhan komunitas yang telah diverifikasi, tanpa janji hasil program.',{creative:4,communication:4,risk:3}]]),
 sjt('pre09','cc-publicist','Stakeholder komplain di depan tamu saat event. Apa responsmu?',[
 ['Dengarkan singkat, akui keluhannya, ajak ke tempat tenang, dan koordinasikan tindak lanjut.',{communication:4,people:4,ownership:4}],
 ['Minta petugas melanjutkan acara sementara kamu menemani stakeholder mencari solusi.',{communication:4,operations:4,people:3}],
 ['Berikan pilihan penanganan yang ada dalam kewenanganmu dan catat yang perlu keputusan owner.',{communication:3,risk:4,ownership:4}],
 ['Libatkan PIC terkait dengan ringkasan fakta agar stakeholder tidak harus mengulang keluhan.',{documentation:4,communication:4,operations:3}]]),
 sjt('pre10','cc-executor','Dua permintaan lapangan harus selesai hari ini: banner acara sore dan stok alat kantor menipis. Bagaimana mengatur urutan?',[
 ['Bandingkan deadline dan dampak bila tertunda, konfirmasi urutan, lalu beri estimasi kedua PIC.',{operations:4,strategy:4,communication:4}],
 ['Gabungkan rute belanja bila memungkinkan dan sisihkan waktu cadangan untuk pemasangan.',{operations:4,documentation:3,ownership:3}],
 ['Amankan kebutuhan acara dahulu, lalu atur pemenuhan minimum stok kantor dengan PIC.',{operations:4,strategy:3,ownership:3}],
 ['Cari rekan untuk pembagian tugas dengan daftar spesifikasi dan bukti serah-terima.',{communication:4,documentation:4,operations:3}]]),
 sjt('pre11','cc-executor','Vendor lebih murah menawarkan bahan berbeda dari spesifikasi. Apa langkahmu?',[
 ['Bandingkan dampak bahan, minta persetujuan perubahan, dan catat selisih biaya.',{operations:4,risk:4,documentation:4}],
 ['Minta sample kedua bahan untuk memastikan perbedaan kualitas sebelum keputusan.',{creative:3,operations:4,documentation:3}],
 ['Cari vendor pembanding dengan spesifikasi semula untuk menguji kewajaran harga.',{operations:4,strategy:3,ownership:3}],
 ['Negosiasikan bahan sesuai spesifikasi dengan pengurangan fitur yang kurang penting.',{operations:3,strategy:4,communication:4}]]),
 sjt('pre12','cc-executor','Barang sudah dibeli, tetapi bukti transaksi belum diterima dan PIC meminta pekerjaan ditutup. Apa tindakanmu?',[
 ['Tandai pengadaan selesai secara fisik, administrasi masih terbuka, dan minta bukti sah ke vendor.',{documentation:4,ownership:4,risk:4}],
 ['Lampirkan bukti transfer dan rincian barang sementara, lalu beri batas waktu follow-up invoice.',{documentation:3,ownership:4,operations:3}],
 ['Hubungi vendor langsung untuk mengirim invoice sebelum mengubah status menjadi selesai.',{documentation:4,operations:3,communication:3}],
 ['Eskalasi bukti yang tertunda ke PIC pengadaan, dengan catatan jumlah dan identitas transaksi.',{risk:4,documentation:4,communication:3}]]),
 sjt('pre13','pw-curator','CV dan cerita wawancara berbeda tentang peran kandidat dalam proyek. Apa langkahmu?',[
 ['Minta contoh kontribusi pribadi dan bukti yang relevan, lalu catat perbedaannya secara netral.',{people:4,documentation:4,risk:4}],
 ['Gunakan pertanyaan kasus untuk menguji kemampuan yang diklaim sebelum menarik kesimpulan.',{people:4,learning:3,strategy:3}],
 ['Klarifikasi definisi peran dan periode proyek agar perbedaan konteks tidak dianggap kebohongan.',{people:4,communication:4,risk:3}],
 ['Lakukan pemeriksaan referensi dengan izin kandidat pada bagian klaim yang berdampak pada pekerjaan.',{people:3,risk:4,documentation:4}]]),
 sjt('pre14','pw-curator','Temanmu melamar dan mendapat hasil tes kuat. Bagaimana menjaga penilaian adil?',[
 ['Deklarasikan hubungan, gunakan rubrik yang sama, dan minta penilai kedua pada keputusan penting.',{people:4,risk:4,documentation:4}],
 ['Serahkan interview kepada rekan sambil menyediakan hasil tes dan informasi pekerjaan yang relevan.',{people:4,communication:3,risk:4}],
 ['Bandingkan bukti kandidat secara anonim pada tahap penilaian karya.',{people:4,documentation:3,strategy:3}],
 ['Pisahkan pengamatan pribadi dari bukti assessment dan tandai bagian yang masih perlu verifikasi.',{people:4,documentation:4,ownership:3}]]),
 sjt('pre15','pw-curator','Bulan ini tidak ada kebutuhan rekrutmen baru. Apa prioritas talent mapping?',[
 ['Perbarui kebutuhan kemampuan dan data talent yang relevan berdasarkan perubahan tim.',{people:4,strategy:4,documentation:4}],
 ['Validasi minat dan kesiapan talent yang sudah ada agar database tidak kedaluwarsa.',{people:4,communication:3,ownership:4}],
 ['Audit kualitas bukti assessment untuk kandidat potensial dan identifikasi gap informasi.',{people:4,documentation:4,risk:3}],
 ['Koordinasikan rencana kebutuhan berikutnya dengan owner dan susun daftar prioritas sourcing.',{strategy:4,communication:4,people:3}]]),
 sjt('pre16','pw-developer','Performa tim turun dan leader meminta training. Apa langkah awalmu?',[
 ['Bandingkan gap kemampuan dengan hambatan proses, alat, dan pembagian peran sebelum memilih intervensi.',{learning:4,strategy:4,people:4}],
 ['Amati satu pekerjaan nyata dan minta anggota menjelaskan hambatan yang mereka temui.',{learning:4,people:4,documentation:3}],
 ['Jalankan sesi coaching kecil sambil mengumpulkan data untuk memvalidasi kebutuhan training.',{learning:3,communication:4,ownership:3}],
 ['Petakan indikator hasil dan bukti perubahan yang diharapkan bersama leader.',{learning:4,strategy:4,documentation:4}]]),
 sjt('pre17','pw-developer','Peserta mendapat nilai teori tinggi, tetapi belum konsisten menjalankan prosedur. Bagaimana menilai hasil belajar?',[
 ['Pisahkan pengetahuan dan penerapan, lalu uji tugas nyata dengan indikator perilaku yang jelas.',{learning:4,people:4,documentation:4}],
 ['Minta peserta mengulang simulasi dengan umpan balik spesifik pada langkah yang terlewat.',{learning:4,communication:4,ownership:3}],
 ['Periksa apakah SOP dan alat kerja mendukung penerapan sebelum menyimpulkan masalah kemampuan.',{learning:4,strategy:3,operations:3}],
 ['Susun follow-up bersama leader dengan target perilaku dan waktu observasi.',{learning:4,ownership:4,communication:3}]]),
 sjt('pre18','pw-developer','Dua posisi saling melempar pekerjaan. Apa intervensimu?',[
 ['Petakan output, owner, batas kewenangan, dan handover berdasarkan kasus kerja yang nyata.',{learning:4,strategy:4,documentation:4}],
 ['Fasilitasi pembahasan contoh tugas untuk menyepakati aturan sementara lalu uji selama satu minggu.',{communication:4,learning:4,operations:3}],
 ['Minta leader menentukan satu owner sementara agar pekerjaan berjalan, lalu evaluasi struktur.',{operations:4,risk:3,ownership:3}],
 ['Audit distribusi beban dan kapasitas sebelum menetapkan pembagian permanen.',{people:4,strategy:4,documentation:3}]]),
 sjt('pre19','pw-workplace','Toilet bersih secara visual tetapi lantai sering basah pada pergantian shift. Apa tindak lanjutmu?',[
 ['Amankan area licin, cari sumber basah, dan tambahkan kondisi kering pada checklist handover.',{workplace:4,risk:4,documentation:4}],
 ['Atur inspeksi menjelang pergantian shift dan catat pola kejadian untuk menentukan perbaikan.',{workplace:4,documentation:4,operations:3}],
 ['Koordinasikan jadwal pembersihan agar lantai sempat kering sebelum jam penggunaan tinggi.',{workplace:4,operations:4,communication:3}],
 ['Uji perubahan alat atau metode pengeringan, lalu ukur hasilnya bersama OB.',{workplace:4,learning:3,operations:4}]]),
 sjt('pre20','pw-workplace','Keluhan panas hanya muncul sore hari di satu sisi ruang. Apa yang kamu lakukan?',[
 ['Catat suhu, waktu, kepadatan, dan kondisi pendingin sebelum menentukan solusi.',{workplace:4,documentation:4,strategy:3}],
 ['Berikan penyesuaian tempat sementara sambil memeriksa ventilasi dan pendingin.',{workplace:4,communication:3,ownership:3}],
 ['Minta teknisi mengecek performa alat pada jam keluhan, disertai data lokasi.',{workplace:4,operations:3,documentation:3}],
 ['Uji perubahan penggunaan tirai dan pengaturan udara dengan pemantauan keluhan.',{workplace:4,learning:3,operations:3}]]),
 sjt('pre21','pw-workplace','Kabel melintang di jalur tamu menjelang acara. Apa prioritasmu?',[
 ['Amankan akses segera, koordinasikan pemindahan kabel oleh petugas yang berwenang, lalu dokumentasikan.',{risk:4,workplace:4,ownership:4}],
 ['Alihkan jalur tamu sementara dan minta teknisi memasang pelindung atau rute kabel yang sesuai.',{risk:4,operations:4,communication:3}],
 ['Tempatkan penjaga sementara pada area tersebut sambil meminta penyelesaian sebelum tamu datang.',{risk:3,communication:4,ownership:3}],
 ['Tunda penggunaan area sampai PIC mengonfirmasi kontrol risiko sudah memadai.',{risk:4,strategy:3,documentation:3}]]),
 sjt('pre22','pw-executor','Alat kebersihan perlu didistribusikan ke tiga area dengan kebutuhan berbeda. Apa caramu?',[
 ['Cocokkan spesifikasi dan jumlah tiap area, rencanakan rute, lalu catat penerima dan serah-terima.',{operations:4,documentation:4,workplace:4}],
 ['Konfirmasi prioritas area yang stoknya habis dan kirim kebutuhan minimum lebih dahulu.',{operations:4,strategy:3,ownership:3}],
 ['Siapkan paket per area dengan label dan daftar barang untuk pemeriksaan bersama penerima.',{operations:4,documentation:4,communication:3}],
 ['Koordinasikan jadwal pengambilan dengan PIC area agar distribusi tidak mengganggu operasional.',{operations:4,communication:4,workplace:3}]]),
 sjt('pre23','pw-executor','Setup training belum selesai 30 menit sebelum mulai karena proyektor bermasalah. Apa langkahmu?',[
 ['Laporkan blocker dan estimasi, siapkan alternatif tampilan, lalu selesaikan kebutuhan inti peserta.',{operations:4,communication:4,ownership:4}],
 ['Minta bantuan teknis sambil menyiapkan materi cetak atau akses materi di perangkat peserta.',{operations:4,learning:3,communication:3}],
 ['Usulkan perubahan urutan sesi agar pembukaan dapat berjalan sambil alat diperbaiki.',{strategy:4,operations:4,learning:3}],
 ['Konfirmasi standar minimum dengan fasilitator dan batasi setup tambahan yang belum penting.',{operations:4,strategy:3,risk:3}]]),
 sjt('pre24','pw-executor','Perlengkapan safety terlambat dikirim. Area akan dipakai pagi besok. Apa tindak lanjutmu?',[
 ['Minta status terverifikasi, informasikan dampak ke PIC, dan cari alternatif sesuai spesifikasi.',{operations:4,risk:4,ownership:4}],
 ['Koordinasikan peminjaman perlengkapan setara dari area lain dengan bukti serah-terima.',{operations:4,documentation:4,communication:3}],
 ['Minta pengiriman sebagian untuk kebutuhan paling kritis sambil menyepakati pemenuhan sisanya.',{strategy:4,operations:4,ownership:3}],
 ['Minta PIC mengubah rencana penggunaan area jika kontrol risiko belum tersedia.',{risk:4,communication:4,strategy:3}]]),
 essay('pre25','Kamu menerima tugas baru yang brief-nya belum lengkap. Tuliskan pesan klarifikasi singkat, rencana awal, dan cara melaporkan kemajuan.',[['communication','Pesan sopan, jelas, menanyakan output, deadline dan audiens tanpa menyalahkan.'],['strategy','Memilih prioritas dan asumsi yang perlu dikonfirmasi.'],['ownership','Menentukan langkah berikut, owner dan waktu update.'],['documentation','Mencatat keputusan dan bukti penyelesaian.']]),
 essay('pre26','Satu file kandidat berisi informasi pribadi terkirim ke grup yang tidak semestinya. Jelaskan tindakan segera dan pencegahan kejadian ulang.',[['risk','Membatasi penyebaran, meminta penghapusan melalui owner dan mengeskalasi sesuai kewenangan.'],['people','Menjaga kerahasiaan dan menghindari stigma atau informasi tidak relevan.'],['documentation','Mencatat insiden seperlunya tanpa menyebarkan ulang data sensitif.'],['ownership','Memberi tindak lanjut dengan akses dan prosedur yang diperbaiki.']]),
 essay('pre27','Rekan baru mengulang kesalahan pada handover walau sudah membaca SOP. Buat rencana bantuan singkat dan cara mengecek kemajuannya.',[['learning','Mendiagnosis kesulitan, memberi contoh serta praktik dan feedback spesifik.'],['people','Membedakan hambatan proses dengan kebutuhan belajar tanpa label pribadi.'],['communication','Menjelaskan bantuan dengan manner yang baik.'],['documentation','Menetapkan bukti penerapan dan jadwal evaluasi.']]),
 essay('pre28','Acara internal harus tetap rapi dengan anggaran dipotong 25%. Usulkan prioritas pengalaman peserta, tampilan, kebutuhan fisik, dan cara memastikan kualitas.',[['creative','Menjaga konsistensi dan kejelasan visual dengan alternatif realistis.'],['operations','Mengurangi scope, membandingkan spesifikasi serta kebutuhan inti.'],['workplace','Mempertimbangkan kebersihan, akses dan kenyamanan peserta.'],['strategy','Menghubungkan prioritas dengan tujuan acara dan trade-off biaya.']]),
 sjt('pre29',null,'Di acara rekrutmen, antrean panjang, signage membingungkan, dan ada keluhan publik. Apa yang kamu mulai dulu?',[
 ['Amankan alur peserta, bagi owner untuk signage dan respons, lalu beri waktu update.',{workplace:4,operations:4,communication:4,ownership:4}],
 ['Tempatkan petugas pengarah dan kirim pembaruan proses ke peserta sambil mengecek akar antrean.',{communication:4,people:4,operations:3}],
 ['Ubah penjadwalan masuk dan perbaiki informasi utama setelah disepakati PIC.',{strategy:4,creative:3,risk:3}],
 ['Buka area tunggu nyaman dan tugaskan satu PIC mendokumentasikan masalah untuk koordinasi.',{workplace:4,documentation:4,people:3}]]),
 sjt('pre30',null,'Atasan meminta konten segera, sementara vendor butuh keputusan dan kandidat menunggu jadwal interview. Bagaimana mengelolanya?',[
 ['Petakan deadline dan dampak, beri respons awal ke setiap pihak, lalu konfirmasi prioritas dan owner.',{strategy:4,communication:4,ownership:4,people:3}],
 ['Delegasikan follow-up vendor dengan spesifikasi tertulis sambil menyelesaikan konten dan jadwal kandidat.',{operations:4,documentation:4,communication:3}],
 ['Selesaikan keputusan yang membuka pekerjaan pihak lain terlebih dahulu, lalu update estimasi tugas lainnya.',{strategy:4,operations:4,ownership:3}],
 ['Ajukan pembagian pekerjaan ke atasan dengan status dan opsi yang siap diputuskan.',{communication:4,documentation:4,risk:3}]]),
 essay('pre31','Karyawan mengeluh kantor panas dan kotor, sementara tim komunikasi ingin mengambil foto employer branding besok. Susun rencana lintas tim: tindakan segera, owner, komunikasi, dan bukti perbaikan.',[['workplace','Memverifikasi kondisi dan mengutamakan perbaikan kebersihan serta kenyamanan nyata.'],['communication','Komunikasi jujur dan menghargai keluhan, tidak sekadar menutupi kondisi untuk foto.'],['creative','Menentukan kesiapan lokasi dan standar tampilan yang realistis.'],['documentation','Bukti kondisi sebelum/sesudah dan checklist.'],['ownership','Owner, tenggat, eskalasi dan follow-up yang konkret.']]),
 essay('pre32','Hasil tes kandidat kuat untuk dua posisi tetapi minatnya hanya satu. Tim sedang kekurangan orang lapangan. Jelaskan cara mengambil keputusan yang adil dan cara memvalidasi kecocokan.',[['people','Memisahkan evidence kemampuan, preferensi kandidat dan kebutuhan organisasi tanpa memaksa.'],['strategy','Membandingkan kebutuhan dan trade-off berdasarkan bukti.'],['learning','Mengusulkan practical atau pendalaman yang relevan.'],['risk','Menjaga privasi dan menghindari keputusan dari stereotip atau profil personal.'],['communication','Mengomunikasikan alternatif secara jelas dan menghormati kandidat.']])
];
export const COMMON_HANDBOOK=[
 ['Tanggung jawab','Pastikan tugas memiliki output, owner, tenggat dan standar selesai. Beri update saat ada perubahan; pekerjaan selesai ketika output dan bukti diserahkan.'],
 ['Dokumentasi','Catat keputusan, versi, sumber fakta dan serah-terima di tempat yang disepakati. Simpan bukti relevan agar orang berikutnya bisa meneruskan pekerjaan.'],
 ['Eskalasi','Amankan risiko segera dalam kewenanganmu. Eskalasi dengan fakta, dampak, opsi dan waktu keputusan. Jangan mengambil keputusan legal atau teknis di luar kewenangan.'],
 ['Kerahasiaan','Akses dan bagikan data hanya sesuai kebutuhan pekerjaan. Pisahkan informasi relevan dari informasi pribadi; batasi akses dan laporkan insiden melalui jalur yang benar.'],
 ['Pelayanan','Dengarkan kebutuhan, jawab dengan sopan dan akurat, berikan estimasi realistis, serta pastikan tindak lanjut. Pelayanan yang baik tetap menjaga standar dan batas kewenangan.']
];
const modules={
 'cc-strategist':{focus:'Menghubungkan tujuan bisnis, reputasi, brand, CSR, dan koordinasi legal dengan prioritas yang terukur.',steps:['Audit konteks, stakeholder dan bukti sebelum merumuskan masalah.','Bandingkan opsi menggunakan tujuan, dampak, biaya dan risiko; pilih pilot bila belum pasti.','Koordinasi legal: siapkan konteks dan klausul untuk penasihat hukum, sementara owner bisnis mengambil keputusan.','Buat indikator hasil, owner, approval, reminder kontrak dan jadwal evaluasi.'],case:'Kontrak sponsorship akan habis 30 hari lagi. Kumpulkan hasil program dan kebutuhan bisnis; minta owner menentukan lanjut/tidak, siapkan opsi untuk review hukum, dan dokumentasikan tenggat keputusan.',task:'Buat memo keputusan untuk program employer branding Rp20 juta dengan dua opsi: acara besar sekali atau empat kegiatan kecil. Dampak belum diketahui dan kontrak partner perlu review. Sertakan tujuan, pembandingan opsi, risiko, koordinasi legal, owner dan ukuran keberhasilan.',caps:['strategy','risk','documentation','ownership']},
 'cc-creative':{focus:'Menerjemahkan tujuan komunikasi menjadi sistem visual yang konsisten, mudah digunakan dan terjaga kualitasnya.',steps:['Klarifikasi tujuan, audiens, kanal dan standar keberhasilan sebelum mengejar gaya.','Gunakan aturan visual bersama, dengan batas variasi tiap unit.','Periksa ukuran, kontras, hierarki, versi, proof produksi dan lisensi aset.','Handover file editable, aset, spesifikasi dan cara penggunaan secara terstruktur.'],case:'Signage untuk tiga unit memiliki ukuran berbeda. Pertahankan hierarki dan komponen visual bersama; buat template adaptif, proof ukuran asli dan checklist pemasangan.',task:'Susun brief dan konsep tekstual signage acara rekrutmen untuk pintu masuk, registrasi dan ruang interview. Tentukan hierarki teks, konsistensi visual, spesifikasi produksi dan checklist QC. Tidak perlu mengunggah gambar.',caps:['creative','strategy','documentation','operations']},
 'cc-publicist':{focus:'Menjaga komunikasi publik dan hubungan stakeholder melalui fakta, manner, konsistensi dan tindak lanjut.',steps:['Verifikasi sumber, fakta, jangkauan isu dan batas informasi yang boleh dibagikan.','Gunakan satu jalur approval dan juru bicara sesuai konteks.','Buat respons awal yang faktual dan waktu update saat investigasi belum selesai.','Catat komitmen stakeholder, pantau kanal dan tutup follow-up.'],case:'Media menanyakan keterlambatan layanan. Akui fakta yang sudah pasti, jelaskan tindakan dan jadwal update; hindari spekulasi atau menyebarkan data internal.',task:'Tulis holding statement maksimal 120 kata untuk keluhan publik tentang antrean event Ansena. Fakta: antrean 40 menit dan tim menambah petugas; penyebab lengkap belum terverifikasi. Lalu buat rencana approval dan follow-up stakeholder.',caps:['communication','risk','documentation','ownership']},
 'cc-executor':{focus:'Memenuhi kebutuhan lapangan komunikasi dan event sesuai spesifikasi, prioritas dan bukti serah-terima.',steps:['Konfirmasi spesifikasi, jumlah, deadline, anggaran dan pihak yang menyetujui perubahan.','Bandingkan vendor berdasarkan kesesuaian, waktu dan biaya total.','Susun rute serta cadangan waktu; laporkan blocker sebelum terlambat.','Periksa barang dan pemasangan, simpan bukti sah lalu update status.'],case:'Banner salah ukuran tiba dua jam sebelum acara. Catat deviasi, laporkan opsi koreksi beserta waktu dan biaya, tunggu persetujuan perubahan, dan lakukan QC setelah pemasangan.',task:'Buat rencana pengadaan dan setup: 3 banner, 40 cocard dan meja registrasi untuk acara pukul 16.00. Vendor banner terlambat satu jam. Tuliskan urutan, spesifikasi yang perlu dikonfirmasi, opsi cadangan dan bukti penyelesaian.',caps:['operations','documentation','ownership','risk']},
 'pw-curator':{focus:'Memetakan talent berdasarkan bukti kemampuan yang relevan, objektivitas, privasi dan kebutuhan tim.',steps:['Mulai dari kebutuhan fungsi dan indikator kemampuan yang bisa dibuktikan.','Gunakan rubrik konsisten dan pertanyaan perilaku yang meminta kontribusi pribadi.','Klarifikasi informasi berbeda; cek referensi hanya dengan izin dan relevansi kerja.','Pisahkan preferensi, evidence dan data personal; dokumentasikan gap yang perlu validasi.'],case:'CV sederhana tetapi practical kuat. Bandingkan hasil dengan rubrik dan minta bukti kontribusi; jangan menyamakan kualitas CV dengan kemampuan kerja.',task:'Buat matriks evidence untuk kandidat A (CV kuat, jawaban umum) dan B (CV singkat, practical terstruktur). Susun lima pertanyaan verifikasi, risiko bias dan rekomendasi pendalaman tanpa menentukan kelulusan dari CV saja.',caps:['people','risk','communication','documentation']},
 'pw-developer':{focus:'Mendiagnosis kebutuhan pengembangan dan membantu kemampuan diterapkan dalam pekerjaan nyata.',steps:['Pisahkan gap pengetahuan, praktik, alat, proses dan pembagian peran.','Tentukan tujuan belajar berupa perilaku yang dapat diamati.','Gunakan contoh, latihan, feedback spesifik dan kesempatan mengulang.','Ukur pre–post dan penerapan setelahnya; perbaiki program dari hasil observasi.'],case:'Peserta paham SOP tetapi gagal handover. Amati langkah yang sulit, berikan contoh handover dan simulasi, lalu cek bukti penerapan pada dua pergantian shift.',task:'Rancang microlearning 15 menit untuk handover antarshift yang sering tidak lengkap. Sertakan diagnosis, tujuan perilaku, contoh, latihan, feedback, penilaian pre–post dan evaluasi penerapan satu minggu.',caps:['learning','people','communication','strategy']},
 'pw-workplace':{focus:'Menjaga kebersihan, fasilitas, kenyamanan dan keselamatan dengan inspeksi, handover dan perbaikan berbasis bukti.',steps:['Amankan bahaya segera, lalu koordinasikan penanganan teknis dengan pihak berwenang.','Gunakan standar teramati: bersih, kering, stok tersedia, jalur aman dan fungsi alat.','Catat pola lokasi, waktu dan frekuensi keluhan untuk mencari akar masalah.','Atur checklist tiap shift, owner, serah-terima dan verifikasi perbaikan.'],case:'Bau berulang sore hari di toilet. Periksa pola penggunaan, drainase dan ventilasi; lakukan mitigasi, minta teknisi sesuai temuan, kemudian verifikasi pada jam keluhan.',task:'Buat checklist dan rencana tindak lanjut untuk toilet basah, ruang panas sore hari, dan kabel melintang jalur tamu. Bedakan tindakan segera, inspeksi, bantuan teknis, owner, handover OB dan bukti perbaikan.',caps:['workplace','risk','operations','documentation']},
 'pw-executor':{focus:'Menjalankan pengadaan, distribusi dan setup kegiatan People & Workplace dengan ketelitian serta tindak lanjut.',steps:['Konfirmasi kebutuhan per area dan spesifikasi, termasuk perlengkapan safety.','Prioritaskan kebutuhan kritis dan koordinasikan alternatif dengan PIC.','Periksa jumlah, kondisi, penerima dan catat serah-terima barang.','Siapkan setup minimum kegiatan, update kendala dan tutup pekerjaan dengan bukti.'],case:'Proyektor training rusak sebelum mulai. Minta bantuan teknis, siapkan materi alternatif, koordinasikan urutan sesi, lalu dokumentasikan kondisi alat dan tindak lanjut.',task:'Susun rencana distribusi alat kebersihan ke tiga area dan setup training 20 orang pukul 09.00. Stok sarung tangan safety belum datang dan proyektor belum diuji. Tuliskan prioritas, alternatif, komunikasi PIC dan checklist serah-terima.',caps:['operations','documentation','ownership','risk','workplace']}
};
export const HANDBOOK=modules;
const postScenarios={
 'cc-strategist':[
 ['Program komunitas berhasil menjangkau banyak orang tetapi tidak mendukung tujuan perusahaan. Bagaimana mengevaluasinya?',['Bandingkan dampak, tujuan, biaya dan opsi revisi program.','Cari tujuan perusahaan yang bisa didukung oleh hasil yang sudah ada.','Diskusikan kebutuhan penerima dengan stakeholder untuk mengubah format.','Jalankan pilot terarah dengan indikator yang disepakati.']],
 ['Reminder lisensi muncul, owner lama sudah pindah tim. Apa tindak lanjutmu?',['Identifikasi owner baru, tenggat dan kebutuhan bisnis lalu koordinasikan review.','Kumpulkan dokumen dan minta leader menetapkan pengambil keputusan.','Hubungi partner untuk memahami batas waktu dan opsi perpanjangan.','Susun opsi serta risiko penundaan untuk keputusan manajemen.']],
 ['Isu reputasi baru melibatkan beberapa unit. Bagaimana memulai?',['Petakan fakta, jangkauan, owner dan risiko sebelum rencana respons.','Buat jalur approval satu pintu dan pembaruan status terjadwal.','Lakukan monitoring kanal untuk menentukan urgensi tindakan.','Temui owner unit agar konteks operasional ikut dipertimbangkan.']],
 ['Dua program bersaing untuk anggaran yang sama. Apa pendekatanmu?',['Gunakan tujuan, dampak dan risiko sebagai kriteria pembandingan.','Ajukan pilot kecil pada kedua program dengan batas anggaran.','Prioritaskan program yang membuka dependensi pekerjaan lain.','Minta owner menyepakati indikator dan trade-off sebelum keputusan.']]],
 'cc-creative':[
 ['Materi digital tampak bagus, tetapi teks tak terbaca pada ukuran cetak. Apa langkahmu?',['Uji proof ukuran asli dan perbaiki hierarki serta kontras.','Kurangi isi dengan konfirmasi tujuan utama kepada PIC.','Pisahkan informasi detail ke kanal pendamping yang disetujui.','Gunakan versi cetak khusus dengan aturan brand yang sama.']],
 ['Dua unit meminta gaya visual berbeda pada satu event. Apa solusi awal?',['Tentukan sistem bersama dan ruang variasi sesuai audiens.','Buat contoh untuk memperjelas batas variasi kepada PIC.','Prioritaskan elemen brand bersama pada titik utama acara.','Minta owner menyepakati aturan konsistensi sebelum produksi.']],
 ['Asset foto menarik belum jelas lisensinya. Apa keputusanmu?',['Verifikasi hak pakai atau pilih aset legal sebelum produksi.','Minta bukti lisensi dari pemasok sambil menyiapkan alternatif.','Ubah konsep agar tetap kuat tanpa aset tersebut.','Ajukan pembelian lisensi dengan rincian biaya dan kebutuhan.']],
 ['Revisi terakhir mengubah tanggal acara. Bagaimana memastikan tidak ada versi salah?',['Perbarui sumber utama, cek seluruh turunan dan arsipkan versi lama.','Buat daftar kanal distribusi dan minta PIC mengonfirmasi penggantian.','Bandingkan export baru dengan checklist detail produksi.','Tandai versi final dan lakukan pemeriksaan kedua sebelum distribusi.']]],
 'cc-publicist':[
 ['Media meminta angka yang belum terverifikasi. Bagaimana merespons?',['Jelaskan yang sudah pasti dan beri jadwal pembaruan angka.','Minta sumber data memvalidasi angka sambil mengirim holding statement.','Tawarkan konteks program yang faktual tanpa klaim angka.','Koordinasikan jawaban dengan juru bicara resmi.']],
 ['Partner mengutip komitmen yang berbeda dari notulen. Apa langkahmu?',['Cocokkan bukti, klarifikasi dengan sopan lalu dokumentasikan kesepakatan.','Temui partner untuk memahami interpretasinya sebelum respons formal.','Minta owner menilai batas komitmen dan opsi pemenuhan.','Siapkan ringkasan opsi agar hubungan tetap terjaga.']],
 ['Informasi profil perusahaan lama masih muncul di kanal pihak ketiga. Apa tindakanmu?',['Catat dampak, hubungi pengelola dan follow-up pembaruan.','Perbarui sumber resmi agar pengelola punya rujukan yang jelas.','Prioritaskan kanal dengan jangkauan dan risiko tertinggi.','Susun daftar perubahan untuk konsistensi seluruh kanal.']],
 ['Tamu penting kesulitan registrasi tetapi acara sedang berlangsung. Apa responsmu?',['Dampingi ke jalur penanganan tepat tanpa mengganggu acara.','Koordinasikan satu petugas registrasi khusus untuk menyelesaikan kasus.','Jelaskan proses dan waktu tunggu secara realistis.','Catat kendala untuk follow-up sambil menjaga kenyamanan tamu.']]],
 'cc-executor':[
 ['Vendor mengganti jumlah kemasan tanpa konfirmasi. Apa langkahmu?',['Bandingkan spesifikasi dan minta persetujuan perubahan sebelum menerima.','Minta vendor melengkapi kekurangan dengan estimasi jelas.','Periksa dampak ke setup dan laporkan opsi kepada PIC.','Catat deviasi pada bukti penerimaan untuk tindak lanjut.']],
 ['Dua lokasi pemasangan berjauhan dan waktu terbatas. Apa rencanamu?',['Susun rute berdasarkan deadline, dampak dan cadangan waktu.','Bagi tugas dengan daftar spesifikasi dan bukti pemasangan.','Konfirmasi kesiapan lokasi sebelum kendaraan berangkat.','Prioritaskan kebutuhan inti sambil memberi estimasi tiap PIC.']],
 ['Kuitansi nominalnya berbeda dari pembayaran. Apa tindakanmu?',['Cocokkan transaksi dan minta koreksi bukti sah.','Hubungi vendor dengan bukti transfer untuk klarifikasi.','Tandai administrasi terbuka dan beri waktu follow-up.','Eskalasi selisih kepada PIC keuangan dengan rincian.']],
 ['Setup selesai tetapi belum diperiksa PIC. Apa langkahmu?',['Lakukan QC, kirim bukti dan minta konfirmasi sesuai standar selesai.','Periksa daftar kebutuhan utama lalu laporkan status.','Temani PIC melakukan walkthrough sebelum acara.','Catat perubahan terakhir dan owner tindak lanjut.']]],
 'pw-curator':[
 ['Kandidat kurang lancar bicara tetapi karya kuat. Apa penilaianmu?',['Pisahkan kebutuhan komunikasi peran dari kualitas karya dan verifikasi kontribusi.','Gunakan pertanyaan terstruktur untuk memperjelas reasoning kandidat.','Minta practical relevan agar evidence tidak didominasi interview.','Bandingkan dengan rubrik yang sama untuk seluruh kandidat.']],
 ['Referensi menyampaikan rumor pribadi kandidat. Apa tindakanmu?',['Batasi pada bukti relevan kerja dan hindari menyebarkan rumor.','Minta contoh perilaku kerja yang bisa diverifikasi.','Catat bahwa informasi tersebut belum menjadi evidence pekerjaan.','Gunakan sumber lain dengan izin kandidat untuk klaim relevan.']],
 ['Hasil dua penilai berbeda jauh. Apa langkahmu?',['Bandingkan evidence dan interpretasi rubrik sebelum membuat keputusan.','Gunakan practical tambahan pada dimensi yang belum jelas.','Minta penilai mencatat alasan berdasarkan contoh spesifik.','Libatkan penilai ketiga pada gap yang berdampak besar.']],
 ['Database talent banyak yang tidak diperbarui setahun. Apa prioritasmu?',['Validasi kontak, minat dan kemampuan untuk kebutuhan paling relevan.','Audit status persetujuan dan akses data sebelum outreach.','Tandai data kedaluwarsa dan jadwalkan pembaruan bertahap.','Koordinasikan kebutuhan tim agar pembaruan lebih terarah.']]],
 'pw-developer':[
 ['Training selesai, skor naik, tetapi pekerjaan belum membaik. Apa evaluasimu?',['Uji penerapan nyata dan hambatan proses selain pengetahuan.','Amati perilaku target bersama leader dengan checklist.','Berikan coaching pada langkah yang masih sulit.','Bandingkan kesempatan praktik peserta dengan tujuan program.']],
 ['Tim baru belum punya pembagian output jelas. Apa yang kamu buat dulu?',['Petakan fungsi, output, owner dan handover sebelum placement.','Fasilitasi pembahasan contoh tugas bersama calon anggota.','Susun indikator kompetensi untuk tiap fungsi yang dibutuhkan.','Uji struktur sederhana melalui pekerjaan pilot.']],
 ['Peserta defensif ketika mendapat feedback. Apa pendekatanmu?',['Gunakan contoh perilaku spesifik dan sepakati satu langkah latihan.','Tanyakan hambatan yang dirasakan dan cocokkan dengan observasi.','Berikan contoh pembanding lalu minta refleksi peserta.','Jadwalkan sesi pribadi agar peserta lebih nyaman membahas gap.']],
 ['Materi terlalu panjang untuk petugas shift. Apa solusi awal?',['Pecah ke latihan singkat sesuai tugas dengan indikator penerapan.','Prioritaskan risiko dan kesalahan paling sering pada sesi pertama.','Gunakan contoh visual dan checklist di titik kerja.','Atur pengulangan pendek dengan feedback setelah shift.']]],
 'pw-workplace':[
 ['Ada bau berulang meski jadwal pembersihan lengkap. Apa pemeriksaanmu?',['Cari pola lokasi/waktu dan sumber drainase, ventilasi atau alat.','Amati metode pembersihan bersama OB pada jam keluhan.','Koordinasikan inspeksi teknisi berdasarkan temuan awal.','Catat dampak dan lakukan mitigasi sambil menelusuri sumber.']],
 ['Jalur evakuasi dipakai menyimpan barang acara. Apa prioritasmu?',['Kosongkan jalur dengan PIC dan verifikasi akses aman.','Alihkan barang ke lokasi alternatif yang disetujui.','Koordinasikan tim setup agar penyimpanan tidak berulang.','Catat pelanggaran dan perbaiki checklist kesiapan acara.']],
 ['Keluhan kenyamanan tidak konsisten antararea. Apa caramu?',['Ukur kondisi per lokasi dan jam sebelum menentukan solusi.','Kumpulkan contoh keluhan terstruktur dari pengguna area.','Periksa fungsi alat dan kepadatan penggunaan ruang.','Uji perbaikan kecil dengan pemantauan kondisi.']],
 ['OB shift berikutnya tidak tahu stok yang habis. Apa perbaikanmu?',['Buat handover stok, kondisi area, owner dan tindak lanjut.','Tetapkan batas minimum dan jadwal cek stok per shift.','Gunakan daftar serah-terima yang diperiksa bersama.','Koordinasikan pengadaan dengan data pemakaian.']]],
 'pw-executor':[
 ['Barang safety datang dengan model berbeda. Apa keputusanmu?',['Verifikasi kesetaraan spesifikasi dan persetujuan PIC sebelum digunakan.','Minta dokumen spesifikasi vendor untuk perbandingan.','Siapkan pengganti sesuai spesifikasi sambil melaporkan deviasi.','Catat jumlah serta kondisi barang dan eskalasi kebutuhan.']],
 ['Dua kegiatan training perlu alat yang sama. Apa langkahmu?',['Konfirmasi jadwal, kapasitas dan alternatif lalu sepakati pembagian.','Siapkan peminjaman alat setara dengan serah-terima.','Usulkan perubahan urutan sesi pada fasilitator.','Prioritaskan sesi paling bergantung alat sambil memberi estimasi.']],
 ['Penerima mengaku jumlah distribusi kurang. Apa tindakanmu?',['Cocokkan daftar dan bukti serah-terima lalu verifikasi fisik.','Hubungi pihak pengantar dan penerima untuk menelusuri titik selisih.','Penuhi kebutuhan kritis sementara dengan catatan status.','Periksa kemasan dan catatan perpindahan antararea.']],
 ['Petugas meminta pembelian mendadak tanpa spesifikasi. Apa responsmu?',['Konfirmasi kebutuhan, jumlah, standar dan approval sebelum membeli.','Tawarkan contoh pilihan untuk mempercepat klarifikasi.','Cek stok area lain untuk kebutuhan minimum sementara.','Minta PIC menetapkan prioritas serta batas anggaran.']]]
};
export const POST=Object.fromEntries(Object.entries(modules).map(([role,m])=>[role,[
 ...postScenarios[role].map(([q,texts],i)=>sjt(`${role}-post${i+1}`,role,q,texts.map((t,j)=>[t,Object.fromEntries(m.caps.map((cap,k)=>[cap,j===0?4:((j+k+i)%3===0?4:3)]))]))),
 essay(`${role}-post5`,'Jelaskan keputusan yang kamu ambil ketika kualitas, deadline dan batas kewenangan bertentangan pada posisi ini. Berikan contoh langkah, trade-off dan bukti yang akan kamu catat.',m.caps.map(cap=>[cap,`Menunjukkan ${CAPS[cap].toLowerCase()} melalui keputusan spesifik yang relevan dengan ${ROLES[role].role}; bukan hanya slogan.`]),role),
 essay(`${role}-post6`,'Buat rencana evaluasi satu minggu setelah perbaikan kerja pada posisi ini. Tentukan indikator, cara mengumpulkan bukti, owner dan tindak lanjut jika hasil belum baik.',m.caps.map(cap=>[cap,`Menghubungkan ${CAPS[cap].toLowerCase()} dengan indikator teramati, bukti, owner dan tindak lanjut yang realistis.`]),role)
]]));
export const PRACTICAL=Object.fromEntries(Object.entries(modules).map(([role,m])=>[role,[essay(`${role}-practical`,m.task,m.caps.map(cap=>[cap,`Output memenuhi ${CAPS[cap].toLowerCase()} secara konkret sesuai tugas: ada langkah, alasan, batas kewenangan dan bukti yang dapat dicek.`]),role)]]));
export function questionsFor(stage){if(stage==='pre')return PRE;if(stage==='comparison')return COMPARISON;if(stage==='leadership')return LEADERSHIP;const [kind,...parts]=stage.split(':');const role=parts.join(':');return kind==='post'?POST[role]:kind==='practical'?PRACTICAL[role]:null;}
export function publicQuestions(stage,presentation){
 const qs=questionsFor(stage).map(q=>({id:q.id,type:q.type,q:q.q,maxLength:q.maxLength,options:q.options?.map((o,id)=>({id,text:o.text}))}));
 if(!presentation)return qs;
 const rank=ids=>new Map(ids.map((id,index)=>[id,index]));const order=rank(presentation.questions||qs.map(q=>q.id));
 for(const q of qs)if(q.options){const opts=rank(presentation.options?.[q.id]||q.options.map(o=>o.id));q.options.sort((a,b)=>opts.get(a.id)-opts.get(b.id));}
 return qs.sort((a,b)=>order.get(a.id)-order.get(b.id));
}
export const DURATION={pre:15,comparison:null,leadership:null,post:9,practical:null};
export const PILOT={version:VERSION,calibrated:false,thirdGap:3,finalWeights:{pre:.5,post:.3,practical:.2}};

