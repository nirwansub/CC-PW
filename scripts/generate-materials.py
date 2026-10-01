from pathlib import Path
import json, subprocess, shutil
from xml.sax.saxutils import escape
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, KeepTogether
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

root=Path(__file__).resolve().parents[1]
data=json.loads(subprocess.check_output(['node','--input-type=module','-e',"import {ROLES,COMMON_HANDBOOK,HANDBOOK} from './lib/assessment.js';console.log(JSON.stringify({roles:ROLES,common:COMMON_HANDBOOK,modules:HANDBOOK}));"],cwd=root))
out=root/'output/pdf';out.mkdir(parents=True,exist_ok=True)
assets=root/'materials';assets.mkdir(exist_ok=True)
pdfmetrics.registerFont(TTFont('DejaVu','/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'))
pdfmetrics.registerFont(TTFont('DejaVu-Bold','/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'))
styles=getSampleStyleSheet()
for name in ['Normal','BodyText','Heading1','Heading2','Heading3']:
 styles[name].fontName='DejaVu'
styles.add(ParagraphStyle(name='Brand',fontName='DejaVu-Bold',fontSize=10,textColor=colors.HexColor('#247E83'),spaceAfter=25))
styles.add(ParagraphStyle(name='TitleAnsena',fontName='DejaVu-Bold',fontSize=26,leading=33,spaceAfter=12,textColor=colors.HexColor('#152D3A')))
styles.add(ParagraphStyle(name='SubtitleAnsena',fontName='DejaVu',fontSize=10,leading=16,textColor=colors.HexColor('#536678'),spaceAfter=20))
styles['BodyText'].fontSize=10;styles['BodyText'].leading=16;styles['BodyText'].spaceAfter=12
styles['Heading2'].fontName='DejaVu-Bold';styles['Heading2'].fontSize=13;styles['Heading2'].leading=19;styles['Heading2'].spaceBefore=14;styles['Heading2'].spaceAfter=7
def text(value):return escape(value.replace('–','-').replace('—','-').replace('‑','-'))
def p(value,style='BodyText'):return Paragraph(text(value),styles[style])
def footer(canvas,doc):
 canvas.setStrokeColor(colors.HexColor('#DEE7E9'));canvas.line(44,44,551,44)
 canvas.setFont('DejaVu',8);canvas.setFillColor(colors.HexColor('#536678'));canvas.drawString(44,29,'ANSENA | CC-PW | Materi pendalaman');canvas.drawRightString(551,29,str(doc.page))
def create(name,story):
 dest=out/(name+'.pdf');SimpleDocTemplate(str(dest),pagesize=(595.28,841.89),leftMargin=44,rightMargin=44,topMargin=44,bottomMargin=60).build(story,onFirstPage=footer,onLaterPages=footer);shutil.copyfile(dest,assets/dest.name)
common=[p('ANSENA  /  CC-PW','Brand'),p('Prinsip bersama','TitleAnsena'),p('Pegangan kerja untuk Corporate Communications dan People & Workplace. Baca bagian ini bersama modul posisi yang telah kamu pilih dengan admin.','SubtitleAnsena')]
for title,body in data['common']:common.append(KeepTogether([p(title,'Heading2'),p(body)]))
common.extend([p('Sebelum post-test','Heading2'),p('Pahami alasan di balik tiap prinsip dan cara menerapkannya pada kasus baru. Kamu dapat membaca materi di waktu luang. Setelah membaca, masuk kembali ke web dengan kode peserta yang sama dan konfirmasi status membaca pada posisi yang dipilih. Post-test tidak memiliki batas waktu. Praktik dilakukan di luar web bersama tim.')])
create('common',common)
for key,module in data['modules'].items():
 role=data['roles'][key]
 story=[p('ANSENA  /  '+role['team'].upper(),'Brand'),p(role['role'],'TitleAnsena'),p(module['focus'],'SubtitleAnsena'),p('Cara kerja','Heading2')]
 for index,step in enumerate(module['steps'],1):story.append(p(str(index)+'. '+step))
 story.extend([p('Contoh penerapan','Heading2'),p(module['case']),p('Periksa pemahamanmu','Heading2'),p('Sebelum mengambil keputusan, tanyakan: fakta apa yang sudah terverifikasi, siapa owner-nya, apa batas kewenanganmu, kapan perlu eskalasi, dan bukti apa yang menunjukkan pekerjaan selesai?'),p('Setelah membaca','Heading2'),p('Terapkan prinsip bersama dan cara kerja posisi ini pada kasus baru dalam post-test. Gunakan kode peserta yang sama untuk kembali ke web. Latihan kerja langsung akan dibahas bersama tim di luar web.')])
 create(key,story)
print(json.dumps({'files':[p.name for p in assets.glob('*.pdf')]}))
