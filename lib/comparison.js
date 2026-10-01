// Identical, untimed evidence tasks for all candidates; each capability is
// directly assessed twice. Operational evidence minimum, not a validity claim.
export const COMPARISON_VERSION='common-cases-v1-2026-10-01';
const tasks=[
 ['strategy','communication','Dua unit meminta dukungan pada hari yang sama. Unit A menghadapi keluhan publik yang belum terverifikasi; unit B punya acara besok dengan perlengkapan belum lengkap. Tenaga hanya cukup untuk satu pekerjaan penuh. Tentukan prioritas, informasi yang perlu diperiksa, lalu tulis pesan singkat kepada kedua unit.',
 'Prioritas memakai dampak, urgensi dan ketidakpastian; ada informasi penentu, alternatif bagi pekerjaan tertunda dan kondisi untuk mengubah prioritas.',
 'Pesan menjelaskan keputusan, alasan, langkah berikutnya dan waktu pembaruan dengan bahasa jelas tanpa menjanjikan hal yang belum pasti.'],
 ['communication','creative','Poster internal memuat judul menarik, tetapi tanggal acara tidak konsisten dengan pesan panitia. Poster belum dipublikasikan dan tenggat tinggal satu jam. Jelaskan perbaikan isi serta susunan visual, lalu tulis pesan konfirmasi kepada panitia.',
 'Memastikan tanggal dari sumber berwenang, menghindari publikasi informasi belum pasti, dan mengirim permintaan konfirmasi yang spesifik dengan tenggat.',
 'Menentukan hierarki informasi, keterbacaan dan pemeriksaan konsistensi; menjelaskan alasan desain yang membantu pembaca melakukan tindakan yang benar.'],
 ['creative','operations','Tim harus memasang papan informasi di tiga lokasi. Ada dua desain: menarik tetapi teks kecil, atau sederhana tetapi terbaca dari jauh. Ukuran cetak dan stok bahan terbatas. Tentukan desain atau adaptasinya serta langkah pengadaan dan pemasangan.',
 'Memilih atau mengadaptasi desain berdasarkan jarak baca, kebutuhan pengguna dan fungsi informasi, dengan uji contoh sebelum memperbanyak.',
 'Memeriksa ukuran, jumlah, bahan, stok, persetujuan dan jadwal; ada verifikasi barang serta pemasangan dan alternatif jika bahan tidak cukup.'],
 ['operations','people','Enam orang membantu pembagian perlengkapan. Dua orang berpengalaman, dua baru, dan dua belum pernah bekerja bersama tim ini. Daftar penerima berubah mendadak. Bagaimana kamu membagi pekerjaan dan memastikan distribusi serta penilaian kontribusi mereka tetap adil?',
 'Memakai daftar penerima terbaru dengan versi jelas, membagi tanggung jawab, memverifikasi jumlah dan mencatat serah-terima serta selisih.',
 'Pembagian memakai bukti kemampuan dan kebutuhan pendampingan; penilaian memakai kontribusi teramati, bukan kedekatan, label atau asumsi terhadap orang baru.'],
 ['people','learning','Seorang anggota melakukan kesalahan pencatatan tiga kali. Atasannya ingin langsung menyebutnya tidak teliti, tetapi format kerja baru belum pernah dijelaskan. Bagaimana kamu mencari penyebab, menilai kemampuannya dan menyusun tindak lanjut?',
 'Memisahkan fakta dari label, memeriksa contoh pekerjaan dan standar yang diberikan, serta memberi kesempatan menjelaskan sebelum menyimpulkan kemampuan.',
 'Menentukan kesenjangan spesifik, demonstrasi atau latihan, pemeriksaan pemahaman dan evaluasi hasil kerja berikutnya dengan indikator jelas.'],
 ['learning','workplace','Keluhan lantai toilet basah berulang meski petugas sudah diberi pengarahan. Sumbernya belum diketahui; mungkin cara membersihkan, kebocoran, atau pemakaian. Bagaimana kamu memeriksa kondisi dan menentukan apakah perlu pelatihan atau perbaikan fasilitas?',
 'Pelatihan didasarkan pada penyebab yang terverifikasi; jika metode kerja bermasalah, ada contoh praktik, latihan dan pemeriksaan penerapan, bukan pengarahan umum saja.',
 'Memeriksa lokasi, waktu, sumber air, alat dan alur pemakaian; ada mitigasi kondisi basah dan verifikasi bahwa tindakan memperbaiki kenyamanan atau kebersihan.'],
 ['workplace','risk','Ruangan training terasa pengap dan jalur keluar tertutup barang. Peserta akan datang 20 menit lagi. Apa yang kamu lakukan sebelum ruangan dipakai, siapa yang perlu dilibatkan, dan bagaimana kamu menentukan ruangan siap digunakan?',
 'Memeriksa ventilasi, kapasitas, penataan dan alternatif ruang; kesiapan dinilai dari kondisi teramati, bukan sekadar jadwal yang harus berjalan.',
 'Memprioritaskan jalur keluar aman, melibatkan penanggung jawab yang tepat, menghentikan penggunaan jika belum aman dan memverifikasi mitigasi.'],
 ['risk','documentation','Ada permintaan mengirim daftar nomor telepon karyawan ke vendor untuk koordinasi acara. Vendor meminta seluruh daftar, sementara kebutuhan dan izin belum jelas. Apa keputusanmu dan catatan apa yang harus dibuat?',
 'Memeriksa tujuan, kewenangan, kebutuhan minimum dan jalur persetujuan; tidak mengirim seluruh data sebelum dasar akses jelas, serta menawarkan alternatif yang lebih terbatas.',
 'Mencatat permintaan, tujuan, persetujuan, data yang dibagikan atau ditolak, penerima dan tindak lanjut dengan akses catatan yang sesuai.'],
 ['documentation','ownership','Kamu menerima pekerjaan dari rekan yang pindah tim. Dokumen statusnya tidak lengkap, satu vendor belum dibayar, dan ada tenggat besok. Susun langkah serah-terima serta cara memastikan pekerjaan tidak terlewat.',
 'Menginventarisasi status, bukti, kontak, komitmen, tenggat dan hal belum diketahui; membuat catatan bersama serta konfirmasi untuk informasi yang belum pasti.',
 'Menentukan siapa menangani setiap tindak lanjut, prioritas dan waktu pembaruan; mengejar verifikasi serta eskalasi bila terhambat tanpa mengabaikan batas kewenangan.'],
 ['ownership','strategy','Perbaikan proses yang kamu usulkan sudah berjalan seminggu. Keluhan turun, tetapi waktu kerja bertambah dan satu unit belum mengikuti proses baru. Apa evaluasimu dan keputusan untuk minggu berikutnya?',
 'Menetapkan pemilik tindak lanjut, waktu pemeriksaan dan bukti penutupan masalah; menindaklanjuti unit yang tertinggal dan tidak menganggap implementasi awal sebagai pekerjaan selesai.',
 'Membandingkan manfaat, biaya waktu, kualitas data dan kebutuhan unit; memilih lanjut, ubah atau hentikan dengan alasan, indikator serta kondisi evaluasi berikutnya.']
];
export const COMPARISON=tasks.map(([first,second,q,a,b],i)=>({id:'cmp'+String(i+1).padStart(2,'0'),type:'essay',role:null,q:q+' Jawab singkat; poin-poin diperbolehkan.',maxLength:1800,criteria:[{cap:first,description:a},{cap:second,description:b}]}));
