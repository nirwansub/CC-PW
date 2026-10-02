// Scheduled cutoff: 3 October 2026 at 09:00 Asia/Jakarta.
// This module only takes effect after the user authorizes deployment.
export const PRE_POST_DEADLINE_AT=Date.parse('2026-10-03T09:00:00+07:00');
export const PRE_POST_CLOSED_MESSAGE='Akses profil personal, pendalaman, modul leader, pilihan posisi, dan materi telah ditutup pada 3 Oktober 2026 pukul 09.00 WIB. Hubungi penyelenggara untuk informasi selanjutnya.';
export function prePostClosed(now=Date.now()){return now>=PRE_POST_DEADLINE_AT;}
export function blockedAfterDeadline(action,stage,now=Date.now()){
 if(!prePostClosed(now))return false;
 if(['profile','comparison-resume','leadership-resume','candidate-materials','material-pdf','materials','materials-read'].includes(action))return true;
 return ['comparison','leadership'].includes(stage)&&['start','quiz','save','submit','violation','evaluate','security-warning','security-resume','security-timeout'].includes(action);
}
