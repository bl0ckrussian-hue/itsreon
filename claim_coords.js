/**
 * 잇츠리온(It's RION) 보험금 청구 엔진 - 마스터 DB 및 양식 좌표 설정 파일
 * ★ 양식의 글자 위치나 체크박스 좌표를 수정할 때는 이 파일만 수정하면 전체 화면에 즉시 반영됩니다.
 */

const LOGO_RENDERER = {
  samsung: (txt) => `<span style="color:#034EA2; font-weight:900; font-size:13px; letter-spacing:-0.5px;">${txt}</span>`,
  lina: () => `<div style="background:#000; color:#fff; font-weight:900; font-size:10px; line-height:1.05; padding:4px 5px; border-radius:3px; position:relative;">LI<br>NA<span style="position:absolute; right:2px; bottom:2px; width:4px; height:8px; background:#f59e0b; transform:skewX(-15deg);"></span></div>`,
  hanwha: () => `<div style="width:28px; height:28px; border-radius:50%; border:2.5px solid #F37321; box-shadow: 2px -1px 0 #F37321;"></div>`,
  shinhan: () => `<div style="width:28px; height:28px; border-radius:50%; background:#0046FF; color:#fff; font-weight:900; font-size:15px; display:flex; align-items:center; justify-content:center; font-family:serif;">S</div>`,
  kyobo: () => `<div style="color:#65a30d; font-weight:900; font-size:22px;">🌱</div>`,
  tongyang: () => `<div style="color:#0284c7; font-weight:800; font-size:11px; text-align:center; line-height:1.1;"><span style="font-size:9px; color:#38bdf8;">수호천사</span><br>동양생명</div>`,
  heungkuk: () => `<div style="display:flex; align-items:center; gap:2px;"><div style="display:flex; flex-direction:column; gap:2px;"><span style="width:6px; height:6px; background:#d90429; display:block;"></span><span style="width:6px; height:6px; background:#d90429; display:block;"></span></div><span style="width:12px; height:12px; background:#e11d48; transform:rotate(45deg); display:block; margin-left:3px;"></span></div>`,
  post: () => `<div style="color:#e11d48; font-weight:900; font-size:18px; letter-spacing:-2px;"><u><i>E</i></u></div>`,
  aia: () => `<div style="border:1.8px solid #d90429; border-radius:50%; width:28px; height:28px; display:flex; align-items:center; justify-content:center; color:#d90429; font-weight:900; font-size:10px;">AIA</div>`,
  mirae: () => `<div style="color:#0f172a; font-weight:800; font-size:9.5px; letter-spacing:-0.5px;">MIRAE ASSET<span style="color:#f97316;">/</span></div>`,
  abl: () => `<div style="color:#ef4444; font-weight:900; font-size:14px;">ABL</div>`,
  nh: () => `<div style="color:#f59e0b; font-weight:900; font-size:20px;">ɤ</div>`,
  db: () => `<div style="display:flex; align-items:center;"><span style="width:9px; height:16px; background:#f97316; border-radius:8px 0 0 8px;"></span><span style="width:11px; height:22px; background:#16a34a; border-radius:0 10px 10px 0; margin-left:-2px;"></span></div>`,
  kdb: () => `<div style="width:24px; height:24px; border:4px solid #0284c7; border-radius:4px; transform:rotate(45deg);"></div>`,
  metlife: () => `<div style="display:flex;"><span style="width:10px; height:18px; background:#0284c7; border-radius:0 8px 0 0;"></span><span style="width:10px; height:18px; background:#65a30d; border-radius:8px 0 0 0; margin-left:-2px;"></span></div>`,
  im: () => `<div style="color:#0d9488; font-weight:900; font-size:18px;">iM</div>`,
  fubon: () => `<div style="background:#0284c7; color:#fff; font-weight:900; font-size:15px; width:24px; height:24px; border-radius:5px; display:flex; align-items:center; justify-content:center;">F<span style="color:#65a30d; font-size:12px;">b</span></div>`,
  ktcu: () => `<div style="color:#1e3a8a; font-weight:800; font-size:11px;">교직<span style="color:#65a30d;">🌱</span>Life</div>`,
  chubb: () => `<div style="color:#1e293b; font-weight:800; font-size:10px; letter-spacing:1.5px;">CHUBB</div>`,
  planet: () => `<div style="color:#0284c7; font-weight:800; font-size:11px;"><span style="color:#84cc16;">life</span>planet</div>`,
  hana: () => `<div style="color:#0d9488; font-weight:900; font-size:20px; position:relative;">亠<span style="position:absolute; top:-2px; left:7px; width:5px; height:5px; background:#e11d48; border-radius:50%;"></span></div>`,
  cardif: () => `<div style="background:#059669; color:#fff; width:24px; height:24px; border-radius:4px; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:900;">✦</div>`,
  kb: () => `<div style="color:#eab308; font-weight:900; font-size:19px; letter-spacing:-1px;">＊b</div>`,
  hyundai: () => `<div style="color:#ea580c; font-weight:900; font-size:22px;">H</div>`,
  meritz: () => `<div style="color:#dc2626; font-weight:900; font-size:14px; letter-spacing:-0.5px;">meritz</div>`,
  lotte: () => `<div style="color:#111827; font-weight:900; font-size:16px; font-family:serif;">let<span style="color:#dc2626;">:</span></div>`,
  mg: () => `<div style="color:#0284c7; font-weight:900; font-size:22px;">☁</div>`,
  aig: () => `<div style="border:1.8px solid #0284c7; color:#0284c7; font-weight:900; font-size:11px; padding:2px 5px;">AIG</div>`,
  axa: () => `<div style="background:#1e3a8a; color:#fff; font-weight:900; font-size:11px; width:26px; height:24px; display:flex; align-items:center; justify-content:center;">AXA</div>`,
  carrot: () => `<div style="width:26px; height:26px; border-radius:50%; background:#ff5000; color:#fff; font-weight:900; font-size:15px; display:flex; align-items:center; justify-content:center;">G</div>`
};

const INSURER_DB = {
  life: [
    { id: 'samsung_life', name: '삼성생명', logo: LOGO_RENDERER.samsung('삼성생명'), fax: '콜센터 가상팩스 발급', call: '1588-3114', faxType: 'virtual', pdfFile: '' },
    { id: 'lina_life', name: '라이나생명', logo: LOGO_RENDERER.lina(), fax: '02-6944-1200', call: '1588-0058', faxType: 'fixed', pdfFile: '' },
    { id: 'hanwha_life', name: '한화생명', logo: LOGO_RENDERER.hanwha(), fax: '콜센터 가상팩스 발급', call: '1588-6363', faxType: 'virtual', pdfFile: '' },
    { id: 'shinhan_life', name: '신한라이프', logo: LOGO_RENDERER.shinhan(), fax: '콜센터 가상팩스 발급', call: '1588-5580', faxType: 'virtual', pdfFile: '' },
    { id: 'kyobo_life', name: '교보생명', logo: LOGO_RENDERER.kyobo(), fax: '콜센터 가상팩스 발급', call: '1588-1001', faxType: 'virtual', pdfFile: '' },
    { id: 'tongyang_life', name: '동양생명', logo: LOGO_RENDERER.tongyang(), fax: '02-3289-5500', call: '1577-1004', faxType: 'fixed', pdfFile: '' },
    { id: 'heungkuk_life', name: '흥국생명', logo: LOGO_RENDERER.heungkuk(), fax: '0504-800-0800', call: '1588-2288', faxType: 'fixed', pdfFile: '' },
    { id: 'post_ins', name: '우체국보험', logo: LOGO_RENDERER.post(), fax: '0505-005-1261', call: '1599-0100', faxType: 'fixed', pdfFile: '' },
    { id: 'aia_life', name: 'AIA생명', logo: LOGO_RENDERER.aia(), fax: '02-2021-4540', call: '1588-9898', faxType: 'fixed', pdfFile: '' },
    { id: 'mirae_life', name: '미래에셋생명', logo: LOGO_RENDERER.mirae(), fax: '콜센터 가상팩스 발급', call: '1588-0220', faxType: 'virtual', pdfFile: '' },
    { id: 'abl_life', name: 'ABL생명', logo: LOGO_RENDERER.abl(), fax: '02-3787-8796', call: '1588-6500', faxType: 'fixed', pdfFile: '' },
    { id: 'nh_life', name: 'NH농협생명', logo: LOGO_RENDERER.nh(), fax: '02-3786-8540', call: '1544-4161', faxType: 'fixed', pdfFile: '' },
    { id: 'db_life', name: 'DB생명', logo: LOGO_RENDERER.db(), fax: '0505-087-1234', call: '1588-3131', faxType: 'fixed', pdfFile: '' },
    { id: 'kdb_life', name: 'KDB생명', logo: LOGO_RENDERER.kdb(), fax: '02-2669-7930', call: '1588-4040', faxType: 'fixed', pdfFile: '' },
    { id: 'metlife', name: '메트라이프생명', logo: LOGO_RENDERER.metlife(), fax: '02-3469-9700', call: '1588-9600', faxType: 'fixed', pdfFile: '' },
    { id: 'im_life', name: 'iM라이프생명보험', logo: LOGO_RENDERER.im(), fax: '02-2081-2890', call: '1588-4770', faxType: 'fixed', pdfFile: '' },
    { id: 'fubon_life', name: '푸본현대생명', logo: LOGO_RENDERER.fubon(), fax: '02-6925-5400', call: '1577-3311', faxType: 'fixed', pdfFile: '' },
    { id: 'ktcu_life', name: '교직원공제회보험', logo: LOGO_RENDERER.ktcu(), fax: '02-767-0190', call: '1577-3993', faxType: 'fixed', pdfFile: '' },
    { id: 'chubb_life', name: '처브라이프생명', logo: LOGO_RENDERER.chubb(), fax: '02-2142-3090', call: '1599-4600', faxType: 'fixed', pdfFile: '' },
    { id: 'kyobo_planet', name: '교보라이프플래닛생명', logo: LOGO_RENDERER.planet(), fax: '02-6959-5600', call: '1566-0999', faxType: 'fixed', pdfFile: '' },
    { id: 'hana_life', name: '하나생명', logo: LOGO_RENDERER.hana(), fax: '02-3709-7900', call: '1577-1112', faxType: 'fixed', pdfFile: '' },
    { id: 'cardif_life', name: '카디프생명', logo: LOGO_RENDERER.cardif(), fax: '02-3782-2790', call: '1688-1118', faxType: 'fixed', pdfFile: '' },
    { id: 'kb_life', name: 'KB라이프생명', logo: LOGO_RENDERER.kb(), fax: '02-6220-9912', call: '1588-9922', faxType: 'fixed', pdfFile: '' }
  ],
  nonLife: [
    { id: 'db_nonlife', name: 'DB손해보험', logo: LOGO_RENDERER.db(), fax: '0505-181-4861', call: '1588-0100', faxType: 'fixed', pdfFile: 'DB손해 보험금청구서.pdf' },
    { id: 'hyundai', name: '현대해상', logo: LOGO_RENDERER.hyundai(), fax: '0507-774-6060', call: '1588-5656', faxType: 'fixed', pdfFile: '현대해상 보험금청구서.pdf' },
    { id: 'kb_nonlife', name: 'KB손해보험', logo: LOGO_RENDERER.kb(), fax: '0505-136-6500', call: '1544-0114', faxType: 'fixed', pdfFile: 'KB손해보험 보험금청구서.pdf' },
    { id: 'meritz', name: '메리츠화재', logo: LOGO_RENDERER.meritz(), fax: '0505-021-3400', call: '1566-7711', faxType: 'fixed', pdfFile: '메리츠화재 보험금청구서.pdf' },
    { id: 'samsung_fire', name: '삼성화재', logo: LOGO_RENDERER.samsung('삼성화재'), fax: '0505-161-1199', call: '1588-5114', faxType: 'fixed', pdfFile: '삼성화재 보험금청구서.pdf' },
    { id: 'hanwha_nonlife', name: '한화손해보험', logo: LOGO_RENDERER.hanwha(), fax: '0502-779-1004', call: '1566-8000', faxType: 'fixed', pdfFile: '한화손해 보험금청구서.pdf' },
    { id: 'heungkuk_fire', name: '흥국화재', logo: LOGO_RENDERER.heungkuk(), fax: '0504-800-0700', call: '1688-1688', faxType: 'fixed', pdfFile: '흥국화재 보험금청구서.pdf' },
    { id: 'lotte', name: '롯데손해보험', logo: LOGO_RENDERER.lotte(), fax: '0507-333-9999', call: '1588-3344', faxType: 'fixed', pdfFile: '롯데손해 보험금청구서.pdf' },
    { id: 'mg_yebyul', name: 'MG손해보험', subName: '(예별손해보험)', logo: LOGO_RENDERER.mg(), fax: '0505-088-1646', call: '1588-5959', faxType: 'fixed', pdfFile: '예별손햅보험 보험금청구서.pdf' },
    { id: 'nh_nonlife', name: 'NH농협손해보험', logo: LOGO_RENDERER.nh(), fax: '0505-060-7000', call: '1644-9000', faxType: 'fixed', pdfFile: '농협손해 보험금청구서.pdf' },
    { id: 'aig', name: 'AIG손해보험', logo: LOGO_RENDERER.aig(), fax: '02-2011-4607', call: '1544-2792', faxType: 'fixed', pdfFile: 'aig 보험금청구서.PDF' },
    { id: 'hana_nonlife', name: '하나손해보험', logo: LOGO_RENDERER.hana(), fax: '0505-152-0698', call: '1566-3000', faxType: 'fixed', pdfFile: '하나손해 보험금청구서.pdf' },
    { id: 'lina_nonlife', name: '라이나손해보험', logo: LOGO_RENDERER.lina(), fax: '02-2127-2308', call: '1566-5800', faxType: 'fixed', pdfFile: '라이나손해 보험금청구서.pdf' },
    { id: 'axa', name: 'AXA손해보험', logo: LOGO_RENDERER.axa(), fax: '02-3479-2660', call: '1566-1566', faxType: 'fixed', pdfFile: '' },
    { id: 'shinhan_ez', name: '신한EZ손해보험', logo: LOGO_RENDERER.shinhan(), fax: '02-3782-2890', call: '1544-2580', faxType: 'fixed', pdfFile: '' },
    { id: 'carrot', name: '캐롯손해보험', logo: LOGO_RENDERER.carrot(), fax: '02-6959-1600', call: '1566-0300', faxType: 'fixed', pdfFile: '' }
  ]
};

// 보험사별 PDF 정밀 좌표 매핑 테이블
const PDF_COORD_MAP = {
  // [1. 삼성화재]
  samsung_fire: {
    fields: [
      { page: 0, key: 'insuredName', x: 130, y: 663, size: 10, bold: true },
      { page: 0, key: 'insuredRrn1', x: 275, y: 663, size: 10 },
      { page: 0, key: 'insuredRrn2', x: 342, y: 663, size: 10 },
      { page: 0, key: 'insuredJob', x: 472, y: 663, size: 9.5 },
      { page: 0, key: 'holderName', x: 130, y: 643, size: 10 },
      { page: 0, key: 'holderRrn1', x: 275, y: 643, size: 10 },
      { page: 0, key: 'holderRrn2', x: 342, y: 643, size: 10 },
      { page: 0, key: 'beneficiaryName', x: 190, y: 623, size: 10 },
      { page: 0, key: 'insuredPhone', x: 310, y: 623, size: 10 },
      { page: 0, key: 'insuredAddress', x: 280, y: 580, size: 9 },
      { page: 0, key: 'accYearShort', x: 142, y: 505, size: 10 },
      { page: 0, key: 'accMonth', x: 178, y: 505, size: 10 },
      { page: 0, key: 'accDay', x: 214, y: 505, size: 10 },
      { page: 0, key: 'accidentPlace', x: 330, y: 505, size: 9.5 },
      { page: 0, key: 'accidentDesc', x: 130, y: 485, size: 9.5 },
      { page: 0, key: 'hospitalName', x: 130, y: 465, size: 9.5 },
      { page: 0, key: 'diagnosisName', x: 330, y: 465, size: 9.5 },
      { page: 0, key: 'bankName', x: 185, y: 335, size: 10 },
      { page: 0, key: 'accountNumber', x: 305, y: 335, size: 10 },
      { page: 0, key: 'beneficiaryName', x: 475, y: 335, size: 10 },
      { page: 0, key: 'todayYear', x: 80, y: 175, size: 10 },
      { page: 0, key: 'todayMonth', x: 120, y: 175, size: 10 },
      { page: 0, key: 'todayDay', x: 147, y: 175, size: 10 },
      { page: 0, key: 'insuredName', x: 440, y: 175, size: 10, bold: true },
      { page: 0, key: 'beneficiaryName', x: 440, y: 147, size: 10, bold: true },
      { page: 4, key: 'todayYearShort', x: 115, y: 437, size: 10 },
      { page: 4, key: 'todayMonth', x: 152, y: 437, size: 10 },
      { page: 4, key: 'todayDay', x: 190, y: 437, size: 10 },
      { page: 4, key: 'insuredName', x: 410, y: 437, size: 10, bold: true },
      { page: 4, key: 'beneficiaryName', x: 410, y: 397, size: 10, bold: true },
      { page: 5, key: 'todayYearShort', x: 115, y: 329, size: 10 },
      { page: 5, key: 'todayMonth', x: 152, y: 329, size: 10 },
      { page: 5, key: 'todayDay', x: 190, y: 329, size: 10 },
      { page: 5, key: 'insuredName', x: 410, y: 329, size: 10, bold: true },
      { page: 5, key: 'beneficiaryName', x: 410, y: 289, size: 10, bold: true }
    ],
    checks: [
      { page: 0, cond: () => true, x: 525, y: 633 },
      { page: 0, cond: () => true, x: 192, y: 592 },
      { page: 0, cond: (d) => d.accidentType === '상해', x: 153, y: 525 },
      { page: 0, cond: (d) => d.accidentType === '질병', x: 196, y: 525 },
      { page: 0, cond: (d) => d.accidentType === '교통사고', x: 252, y: 525 },
      { page: 0, cond: (d) => d.claimCategory === '신규', x: 412, y: 525 },
      { page: 0, cond: (d) => d.claimCategory === '추가', x: 498, y: 525 },
      { page: 0, cond: (d) => d.coverages.includes('실손의료비'), x: 101, y: 393 },
      { page: 0, cond: (d) => d.coverages.includes('입원'), x: 158, y: 393 },
      { page: 0, cond: (d) => d.coverages.includes('진단'), x: 206, y: 393 },
      { page: 0, cond: (d) => d.coverages.includes('수술'), x: 254, y: 393 },
      { page: 0, cond: (d) => d.coverages.includes('장해'), x: 348, y: 393 },
      { page: 1, cond: () => true, x: 496, y: 361 },
      { page: 1, cond: () => true, x: 496, y: 266 },
      { page: 1, cond: () => true, x: 496, y: 170 },
      { page: 3, cond: () => true, x: 496, y: 672 },
      { page: 3, cond: () => true, x: 496, y: 575 },
      { page: 3, cond: () => true, x: 496, y: 494 },
      { page: 3, cond: () => true, x: 496, y: 413 },
      { page: 4, cond: () => true, x: 496, y: 690 },
      { page: 4, cond: () => true, x: 496, y: 612 },
      { page: 4, cond: () => true, x: 496, y: 542 },
      { page: 5, cond: () => true, x: 488, y: 440 },
      { page: 5, cond: () => true, x: 488, y: 386 }
    ],
    signatures: [
      { page: 0, x: 485, y: 175, w: 48, h: 20 },
      { page: 0, x: 485, y: 147, w: 48, h: 20 },
      { page: 4, x: 480, y: 437, w: 48, h: 20 },
      { page: 4, x: 480, y: 397, w: 48, h: 20 },
      { page: 5, x: 480, y: 329, w: 48, h: 20 },
      { page: 5, x: 480, y: 289, w: 48, h: 20 }
    ]
  },

  // [2. DB손해보험]
  db_nonlife: {
    fields: [
      { page: 0, key: 'insuredName', x: 142, y: 691, size: 10, bold: true },
      { page: 0, key: 'insuredRrnFull', x: 288, y: 691, size: 10 },
      { page: 0, key: 'insuredJob', x: 465, y: 668, size: 9.5 },
      { page: 0, key: 'insuredAddress', x: 142, y: 645, size: 9.5 },
      { page: 0, key: 'insuredPhone', x: 185, y: 598, size: 10 },
      { page: 0, key: 'accYear', x: 112, y: 465, size: 9.5 },
      { page: 0, key: 'accMonth', x: 162, y: 465, size: 9.5 },
      { page: 0, key: 'accDay', x: 194, y: 465, size: 9.5 },
      { page: 0, key: 'diagnosisName', x: 375, y: 465, size: 9.5 },
      { page: 0, key: 'accidentPlace', x: 112, y: 440, size: 9.5 },
      { page: 0, key: 'hospitalName', x: 375, y: 440, size: 9.5 },
      { page: 0, key: 'accidentDesc', x: 112, y: 414, size: 9.5 },
      { page: 0, key: 'accountNumber', x: 192, y: 282, size: 10 },
      { page: 0, key: 'bankName', x: 365, y: 282, size: 10 },
      { page: 0, key: 'beneficiaryName', x: 482, y: 282, size: 10 },
      { page: 0, key: 'todayYear', x: 92, y: 144, size: 10 },
      { page: 0, key: 'todayMonth', x: 152, y: 144, size: 10 },
      { page: 0, key: 'todayDay', x: 192, y: 144, size: 10 },
      { page: 0, key: 'insuredName', x: 422, y: 144, size: 10, bold: true },
      { page: 0, key: 'beneficiaryName', x: 422, y: 110, size: 10, bold: true },
      { page: 4, key: 'todayYearShort', x: 110, y: 158, size: 10 },
      { page: 4, key: 'todayMonth', x: 156, y: 158, size: 10 },
      { page: 4, key: 'todayDay', x: 198, y: 158, size: 10 },
      { page: 4, key: 'insuredName', x: 422, y: 158, size: 10, bold: true },
      { page: 4, key: 'beneficiaryName', x: 422, y: 122, size: 10, bold: true }
    ],
    checks: [
      { page: 0, cond: () => true, x: 516, y: 691 }, // 의료급여 비대상
      { page: 0, cond: () => true, x: 222, y: 621 }, // 보상안내: 피보험자
      { page: 0, cond: () => true, x: 485, y: 598 }, // 문자안내: 예
      { page: 0, cond: () => true, x: 42, y: 554 },  // 타사 가입사항 없음
      { page: 0, cond: (d) => d.accidentType === '상해', x: 118, y: 489 },
      { page: 0, cond: (d) => d.accidentType === '질병', x: 158, y: 489 },
      { page: 0, cond: (d) => d.accidentType === '교통사고', x: 198, y: 489 },
      { page: 0, cond: (d) => d.claimCategory === '신규', x: 392, y: 489 },
      { page: 0, cond: (d) => d.claimCategory === '추가', x: 454, y: 489 },
      { page: 0, cond: (d) => d.coverages.includes('입원'), x: 42, y: 325 },
      { page: 0, cond: (d) => d.coverages.includes('통원'), x: 78, y: 325 },
      { page: 0, cond: (d) => d.coverages.includes('수술'), x: 114, y: 325 },
      { page: 0, cond: (d) => d.coverages.includes('진단'), x: 150, y: 325 },
      { page: 0, cond: (d) => d.useAutoTransfer, x: 126, y: 304 },
      // 상세동의서 2~5P [동의함] 체크박스 위치 보정
      { page: 1, cond: () => true, x: 506, y: 416 },
      { page: 1, cond: () => true, x: 506, y: 328 },
      { page: 1, cond: () => true, x: 506, y: 237 },
      { page: 2, cond: () => true, x: 506, y: 325 },
      { page: 2, cond: () => true, x: 506, y: 223 },
      { page: 2, cond: () => true, x: 506, y: 86 },
      { page: 3, cond: () => true, x: 506, y: 329 },
      { page: 3, cond: () => true, x: 506, y: 229 },
      { page: 4, cond: () => true, x: 506, y: 650 },
      { page: 4, cond: () => true, x: 506, y: 579 },
      { page: 4, cond: () => true, x: 506, y: 444 }
    ],
    signatures: [
      { page: 0, x: 495, y: 144, w: 48, h: 20 },
      { page: 0, x: 495, y: 110, w: 48, h: 20 },
      { page: 4, x: 495, y: 158, w: 48, h: 20 },
      { page: 4, x: 495, y: 122, w: 48, h: 20 }
    ]
  },

  // [3. KB손해보험]
  kb_nonlife: {
    fields: [
      { page: 0, key: 'insuredName', x: 115, y: 730, size: 10, bold: true },
      // 주민등록번호 개별 숫자 박스 (spacing 적용)
      { page: 0, key: 'insuredRrn1', x: 256, y: 730, size: 10, spacing: 14.2 },
      { page: 0, key: 'insuredRrn2', x: 362, y: 730, size: 10, spacing: 14.2 },
      { page: 0, key: 'insuredPhone', x: 130, y: 700, size: 10 },
      { page: 0, key: 'insuredJob', x: 485, y: 700, size: 9.5 },
      { page: 0, key: 'insuredAddress', x: 115, y: 673, size: 9.5 },
      { page: 0, key: 'holderName', x: 115, y: 641, size: 10 },
      { page: 0, key: 'holderRrn1', x: 256, y: 641, size: 10, spacing: 14.2 },
      { page: 0, key: 'holderRrn2', x: 362, y: 641, size: 10, spacing: 14.2 },
      { page: 0, key: 'insuredPhone', x: 130, y: 583, size: 10 },
      { page: 0, key: 'accYear', x: 135, y: 412, size: 10 },
      { page: 0, key: 'accMonth', x: 225, y: 412, size: 10 },
      { page: 0, key: 'accDay', x: 282, y: 412, size: 10 },
      { page: 0, key: 'accidentPlace', x: 415, y: 412, size: 9.5 },
      { page: 0, key: 'accidentDesc', x: 115, y: 382, size: 9.5 },
      { page: 0, key: 'hospitalName', x: 415, y: 384, size: 9.5 },
      { page: 0, key: 'diagnosisName', x: 415, y: 357, size: 9.5 },
      { page: 0, key: 'bankName', x: 115, y: 173, size: 10 },
      { page: 0, key: 'accountNumber', x: 245, y: 173, size: 10, spacing: 12.8 },
      { page: 0, key: 'beneficiaryName', x: 495, y: 173, size: 10 },
      { page: 0, key: 'todayYear', x: 92, y: 72, size: 10 },
      { page: 0, key: 'todayMonth', x: 146, y: 72, size: 10 },
      { page: 0, key: 'todayDay', x: 182, y: 72, size: 10 },
      { page: 0, key: 'insuredName', x: 335, y: 72, size: 10, bold: true },
      { page: 3, key: 'insuredName', x: 105, y: 354, size: 10, bold: true },
      { page: 3, key: 'beneficiaryName', x: 105, y: 302, size: 10, bold: true },
      { page: 3, key: 'todayYear', x: 392, y: 223, size: 10 },
      { page: 3, key: 'todayMonth', x: 458, y: 223, size: 10 },
      { page: 3, key: 'todayDay', x: 505, y: 223, size: 10 }
    ],
    checks: [
      { page: 0, cond: () => true, x: 536, y: 673 }, // 의료급여 비대상
      { page: 0, cond: () => true, x: 204, y: 613 }, // 보상안내: 피보험자
      { page: 0, cond: () => true, x: 158, y: 506 }, // 타사 계약: 없음
      { page: 0, cond: (d) => d.accidentType === '상해', x: 102, y: 441 },
      { page: 0, cond: (d) => d.accidentType === '질병', x: 150, y: 441 },
      { page: 0, cond: (d) => d.accidentType === '교통사고', x: 198, y: 441 },
      { page: 0, cond: (d) => d.claimCategory === '추가', x: 446, y: 441 },
      { page: 0, cond: (d) => d.useAutoTransfer, x: 248, y: 208 },
      { page: 1, cond: () => true, x: 530, y: 507 },
      { page: 1, cond: () => true, x: 530, y: 430 },
      { page: 1, cond: () => true, x: 530, y: 345 },
      { page: 2, cond: () => true, x: 530, y: 697 },
      { page: 2, cond: () => true, x: 530, y: 617 },
      { page: 2, cond: () => true, x: 530, y: 529 },
      { page: 2, cond: () => true, x: 530, y: 194 },
      { page: 2, cond: () => true, x: 530, y: 118 },
      { page: 3, cond: () => true, x: 528, y: 583 },
      { page: 3, cond: () => true, x: 528, y: 556 },
      { page: 3, cond: () => true, x: 528, y: 445 }
    ],
    signatures: [
      { page: 0, x: 445, y: 72, w: 50, h: 22 },
      { page: 3, x: 185, y: 354, w: 50, h: 22 },
      { page: 3, x: 185, y: 302, w: 50, h: 22 }
    ]
  },

  // [5. 메리츠화재]
  meritz: {
    fields: [
      { page: 0, key: 'holderName', x: 110, y: 733, size: 10 },
      // 계약자·피보험자 주민번호 개별 숫자 박스 (spacing 적용)
      { page: 0, key: 'holderRrn1', x: 272, y: 733, size: 10, spacing: 13.5 },
      { page: 0, key: 'holderRrn2', x: 374, y: 733, size: 10, spacing: 13.5 },
      { page: 0, key: 'insuredName', x: 110, y: 706, size: 10, bold: true },
      { page: 0, key: 'insuredRrn1', x: 272, y: 706, size: 10, spacing: 13.5 },
      { page: 0, key: 'insuredRrn2', x: 374, y: 706, size: 10, spacing: 13.5 },
      { page: 0, key: 'insuredJob', x: 445, y: 680, size: 9.5 },
      { page: 0, key: 'insuredName', x: 110, y: 625, size: 10 },
      { page: 0, key: 'insuredPhone', x: 255, y: 625, size: 10 },
      { page: 0, key: 'accYear', x: 120, y: 426, size: 10 },
      { page: 0, key: 'accMonth', x: 198, y: 426, size: 10 },
      { page: 0, key: 'accDay', x: 252, y: 426, size: 10 },
      { page: 0, key: 'accidentDesc', x: 110, y: 397, size: 9.5 },
      { page: 0, key: 'accidentPlace', x: 435, y: 397, size: 9.5 },
      { page: 0, key: 'diagnosisName', x: 110, y: 371, size: 9.5 },
      { page: 0, key: 'hospitalName', x: 385, y: 371, size: 9.5 },
      { page: 0, key: 'bankName', x: 105, y: 218, size: 10 },
      { page: 0, key: 'beneficiaryName', x: 215, y: 218, size: 10 },
      { page: 0, key: 'beneficiaryRrn1', x: 332, y: 218, size: 9.5, spacing: 11.2 },
      { page: 0, key: 'beneficiaryRrn2', x: 412, y: 218, size: 9.5, spacing: 11.2 },
      { page: 0, key: 'relSelf', x: 522, y: 218, size: 9.5 },
      { page: 0, key: 'accountNumber', x: 120, y: 195, size: 10, spacing: 13.2 },
      { page: 0, key: 'todayYear', x: 128, y: 78, size: 10 },
      { page: 0, key: 'todayMonth', x: 184, y: 78, size: 10 },
      { page: 0, key: 'todayDay', x: 222, y: 78, size: 10 },
      { page: 0, key: 'insuredName', x: 405, y: 78, size: 10, bold: true },
      { page: 3, key: 'todayYear', x: 62, y: 412, size: 10 },
      { page: 3, key: 'todayMonth', x: 126, y: 412, size: 10 },
      { page: 3, key: 'todayDay', x: 178, y: 412, size: 10 },
      { page: 3, key: 'insuredName', x: 432, y: 412, size: 10, bold: true }
    ],
    checks: [
      { page: 0, cond: () => true, x: 318, y: 678 }, // 의료급여 대상아님
      { page: 0, cond: () => true, x: 152, y: 556 }, // 타사 계약: 해당사항 없음
      { page: 0, cond: (d) => d.accidentType === '질병', x: 86, y: 472 },
      { page: 0, cond: (d) => d.accidentType === '상해', x: 216, y: 472 },
      { page: 0, cond: (d) => d.coverages.includes('입원'), x: 88, y: 450 },
      { page: 0, cond: (d) => d.coverages.includes('통원'), x: 136, y: 450 },
      { page: 0, cond: (d) => d.coverages.includes('수술'), x: 184, y: 450 },
      { page: 0, cond: (d) => d.coverages.includes('진단'), x: 232, y: 450 },
      { page: 0, cond: (d) => d.useAutoTransfer, x: 132, y: 245 },
      { page: 0, cond: () => true, x: 288, y: 84 },  // 작성자: 본인 체크
      // 상세동의서 2~4P (기존 '동의하지 않음' x:502 → 우측 '동의함' x:552 이동)
      { page: 1, cond: () => true, x: 552, y: 553 },
      { page: 1, cond: () => true, x: 552, y: 482 },
      { page: 1, cond: () => true, x: 552, y: 391 },
      { page: 2, cond: () => true, x: 552, y: 761 },
      { page: 2, cond: () => true, x: 552, y: 695 },
      { page: 2, cond: () => true, x: 552, y: 614 },
      { page: 2, cond: () => true, x: 552, y: 220 },
      { page: 2, cond: () => true, x: 552, y: 122 },
      { page: 3, cond: () => true, x: 552, y: 606 },
      { page: 3, cond: () => true, x: 552, y: 554 },
      { page: 3, cond: () => true, x: 552, y: 472 }
    ],
    signatures: [
      { page: 0, x: 495, y: 78, w: 48, h: 20 },
      { page: 3, x: 505, y: 412, w: 48, h: 20 }
    ]
  },

  // [4. 현대해상]
  hyundai: {
    fields: [
      { page: 0, key: 'insuredName', x: 135, y: 606, size: 10, bold: true },
      { page: 0, key: 'insuredRrn1', x: 280, y: 606, size: 10 },
      { page: 0, key: 'insuredRrn2', x: 412, y: 606, size: 10 },
      { page: 0, key: 'insuredJob', x: 135, y: 584, size: 9.5 },
      { page: 0, key: 'holderName', x: 135, y: 561, size: 10 },
      { page: 0, key: 'holderRrn1', x: 280, y: 561, size: 10 },
      { page: 0, key: 'holderRrn2', x: 412, y: 561, size: 10 },
      { page: 0, key: 'insuredName', x: 135, y: 538, size: 10 },
      { page: 0, key: 'insuredPhone', x: 280, y: 538, size: 10 },
      { page: 0, key: 'accYearShort', x: 122, y: 432, size: 10 },
      { page: 0, key: 'accMonth', x: 165, y: 432, size: 10 },
      { page: 0, key: 'accDay', x: 205, y: 432, size: 10 },
      { page: 0, key: 'accidentDesc', x: 135, y: 383, size: 9.5 },
      { page: 0, key: 'hospitalWithDiag', x: 405, y: 383, size: 9 },
      { page: 0, key: 'bankName', x: 115, y: 212, size: 10 },
      { page: 0, key: 'accountNumber', x: 260, y: 212, size: 10 },
      { page: 0, key: 'beneficiaryName', x: 485, y: 212, size: 10 },
      { page: 0, key: 'todayYearShort', x: 122, y: 127, size: 10 },
      { page: 0, key: 'todayMonth', x: 175, y: 127, size: 10 },
      { page: 0, key: 'todayDay', x: 222, y: 127, size: 10 },
      { page: 0, key: 'insuredName', x: 435, y: 127, size: 10, bold: true },
      { page: 1, key: 'insuredName', x: 85, y: 743, size: 10, bold: true },
      { page: 1, key: 'insuredRrn1', x: 285, y: 743, size: 10 },
      { page: 2, key: 'insuredName', x: 85, y: 743, size: 10, bold: true },
      { page: 2, key: 'insuredRrn1', x: 285, y: 743, size: 10 },
      { page: 3, key: 'insuredName', x: 85, y: 743, size: 10, bold: true },
      { page: 3, key: 'insuredRrn1', x: 285, y: 743, size: 10 },
      { page: 4, key: 'insuredName', x: 85, y: 743, size: 10, bold: true },
      { page: 4, key: 'insuredRrn1', x: 285, y: 743, size: 10 },
      { page: 4, key: 'todayYear', x: 225, y: 370, size: 10 },
      { page: 4, key: 'todayMonth', x: 345, y: 370, size: 10 },
      { page: 4, key: 'todayDay', x: 445, y: 370, size: 10 },
      { page: 4, key: 'insuredName', x: 335, y: 328, size: 10, bold: true }
    ],
    checks: [
      { page: 0, cond: () => true, x: 326, y: 584 },
      { page: 0, cond: () => true, x: 138, y: 515 },
      { page: 0, cond: () => true, x: 136, y: 492 },
      { page: 0, cond: () => true, x: 482, y: 475 },
      { page: 0, cond: (d) => d.claimCategory === '신규', x: 391, y: 432 },
      { page: 0, cond: (d) => d.claimCategory === '추가', x: 448, y: 432 },
      { page: 0, cond: (d) => d.accidentType === '질병', x: 93, y: 410 },
      { page: 0, cond: (d) => d.accidentType === '상해', x: 136, y: 410 },
      { page: 0, cond: (d) => d.accidentType === '교통사고', x: 180, y: 410 },
      { page: 0, cond: (d) => d.coverages.includes('통원'), x: 448, y: 410 },
      { page: 0, cond: (d) => d.coverages.includes('입원'), x: 392, y: 410 },
      { page: 0, cond: (d) => d.coverages.includes('실손의료비'), x: 84, y: 310 },
      { page: 0, cond: (d) => d.coverages.includes('입원'), x: 136, y: 310 },
      { page: 0, cond: (d) => d.coverages.includes('진단'), x: 185, y: 310 },
      { page: 0, cond: (d) => d.coverages.includes('수술'), x: 230, y: 310 },
      { page: 0, cond: (d) => d.useAutoTransfer, x: 136, y: 235 },
      { page: 1, cond: () => true, x: 515, y: 406 },
      { page: 1, cond: () => true, x: 515, y: 301 },
      { page: 1, cond: () => true, x: 515, y: 178 },
      { page: 2, cond: () => true, x: 515, y: 277 },
      { page: 2, cond: () => true, x: 515, y: 178 },
      { page: 3, cond: () => true, x: 515, y: 634 },
      { page: 3, cond: () => true, x: 515, y: 215 },
      { page: 3, cond: () => true, x: 515, y: 123 },
      { page: 4, cond: () => true, x: 515, y: 553 },
      { page: 4, cond: () => true, x: 515, y: 507 },
      { page: 4, cond: () => true, x: 515, y: 418 }
    ],
    signatures: [
      { page: 0, x: 505, y: 127, w: 50, h: 22 },
      { page: 4, x: 505, y: 328, w: 50, h: 22 }
    ]
  },

  // [5. 메리츠화재]
  meritz: {
    fields: [
      { page: 0, key: 'holderName', x: 110, y: 733, size: 10 },
      // 계약자·피보험자 주민번호 개별 숫자 박스 (spacing 적용)
      { page: 0, key: 'holderRrn1', x: 272, y: 733, size: 10, spacing: 13.5 },
      { page: 0, key: 'holderRrn2', x: 374, y: 733, size: 10, spacing: 13.5 },
      { page: 0, key: 'insuredName', x: 110, y: 706, size: 10, bold: true },
      { page: 0, key: 'insuredRrn1', x: 272, y: 706, size: 10, spacing: 13.5 },
      { page: 0, key: 'insuredRrn2', x: 374, y: 706, size: 10, spacing: 13.5 },
      { page: 0, key: 'insuredJob', x: 445, y: 680, size: 9.5 },
      { page: 0, key: 'insuredName', x: 110, y: 625, size: 10 },
      { page: 0, key: 'insuredPhone', x: 255, y: 625, size: 10 },
      { page: 0, key: 'accYear', x: 120, y: 426, size: 10 },
      { page: 0, key: 'accMonth', x: 198, y: 426, size: 10 },
      { page: 0, key: 'accDay', x: 252, y: 426, size: 10 },
      { page: 0, key: 'accidentDesc', x: 110, y: 397, size: 9.5 },
      { page: 0, key: 'accidentPlace', x: 435, y: 397, size: 9.5 },
      { page: 0, key: 'diagnosisName', x: 110, y: 371, size: 9.5 },
      { page: 0, key: 'hospitalName', x: 385, y: 371, size: 9.5 },
      { page: 0, key: 'bankName', x: 105, y: 218, size: 10 },
      { page: 0, key: 'beneficiaryName', x: 215, y: 218, size: 10 },
      { page: 0, key: 'beneficiaryRrn1', x: 332, y: 218, size: 9.5, spacing: 11.2 },
      { page: 0, key: 'beneficiaryRrn2', x: 412, y: 218, size: 9.5, spacing: 11.2 },
      { page: 0, key: 'relSelf', x: 522, y: 218, size: 9.5 },
      { page: 0, key: 'accountNumber', x: 120, y: 195, size: 10, spacing: 13.2 },
      { page: 0, key: 'todayYear', x: 128, y: 78, size: 10 },
      { page: 0, key: 'todayMonth', x: 184, y: 78, size: 10 },
      { page: 0, key: 'todayDay', x: 222, y: 78, size: 10 },
      { page: 0, key: 'insuredName', x: 405, y: 78, size: 10, bold: true },
      { page: 3, key: 'todayYear', x: 62, y: 412, size: 10 },
      { page: 3, key: 'todayMonth', x: 126, y: 412, size: 10 },
      { page: 3, key: 'todayDay', x: 178, y: 412, size: 10 },
      { page: 3, key: 'insuredName', x: 432, y: 412, size: 10, bold: true }
    ],
    checks: [
      { page: 0, cond: () => true, x: 318, y: 678 }, // 의료급여 대상아님
      { page: 0, cond: () => true, x: 152, y: 556 }, // 타사 계약: 해당사항 없음
      { page: 0, cond: (d) => d.accidentType === '질병', x: 86, y: 472 },
      { page: 0, cond: (d) => d.accidentType === '상해', x: 216, y: 472 },
      { page: 0, cond: (d) => d.coverages.includes('입원'), x: 88, y: 450 },
      { page: 0, cond: (d) => d.coverages.includes('통원'), x: 136, y: 450 },
      { page: 0, cond: (d) => d.coverages.includes('수술'), x: 184, y: 450 },
      { page: 0, cond: (d) => d.coverages.includes('진단'), x: 232, y: 450 },
      { page: 0, cond: (d) => d.useAutoTransfer, x: 132, y: 245 },
      { page: 0, cond: () => true, x: 288, y: 84 },  // 작성자: 본인 체크
      // 상세동의서 2~4P (기존 '동의하지 않음' x:502 → 우측 '동의함' x:552 이동)
      { page: 1, cond: () => true, x: 552, y: 553 },
      { page: 1, cond: () => true, x: 552, y: 482 },
      { page: 1, cond: () => true, x: 552, y: 391 },
      { page: 2, cond: () => true, x: 552, y: 761 },
      { page: 2, cond: () => true, x: 552, y: 695 },
      { page: 2, cond: () => true, x: 552, y: 614 },
      { page: 2, cond: () => true, x: 552, y: 220 },
      { page: 2, cond: () => true, x: 552, y: 122 },
      { page: 3, cond: () => true, x: 552, y: 606 },
      { page: 3, cond: () => true, x: 552, y: 554 },
      { page: 3, cond: () => true, x: 552, y: 472 }
    ],
    signatures: [
      { page: 0, x: 495, y: 78, w: 48, h: 20 },
      { page: 3, x: 505, y: 412, w: 48, h: 20 }
    ]
  },
  
  // [6. MG손해보험 / 예별손해보험]
  mg_yebyul: {
    fields: [
      { page: 0, key: 'insuredName', x: 145, y: 738, size: 10, bold: true },
      { page: 0, key: 'insuredRrn1', x: 285, y: 738, size: 10 },
      { page: 0, key: 'insuredRrn2', x: 365, y: 738, size: 10 },
      { page: 0, key: 'insuredPhone', x: 145, y: 718, size: 10 },
      { page: 0, key: 'insuredJob', x: 420, y: 718, size: 9.5 },
      { page: 0, key: 'insuredAddress', x: 145, y: 698, size: 9.5 },
      { page: 0, key: 'holderName', x: 145, y: 662, size: 10 },
      { page: 0, key: 'holderRrn1', x: 285, y: 662, size: 10 },
      { page: 0, key: 'holderRrn2', x: 365, y: 662, size: 10 },
      { page: 0, key: 'insuredPhone', x: 145, y: 622, size: 10 },
      { page: 0, key: 'accYear', x: 132, y: 455, size: 10 },
      { page: 0, key: 'accMonth', x: 184, y: 455, size: 10 },
      { page: 0, key: 'accDay', x: 220, y: 455, size: 10 },
      { page: 0, key: 'accidentPlace', x: 380, y: 455, size: 9.5 },
      { page: 0, key: 'accidentDesc', x: 145, y: 432, size: 9.5 },
      // 진단명(좌측) / 병원명(중앙) 위치 교정
      { page: 0, key: 'diagnosisName', x: 145, y: 392, size: 9.5 },
      { page: 0, key: 'hospitalName', x: 345, y: 392, size: 9.5 },
      { page: 0, key: 'bankName', x: 110, y: 198, size: 10 },
      { page: 0, key: 'accountNumber', x: 265, y: 198, size: 10 },
      { page: 0, key: 'beneficiaryName', x: 475, y: 198, size: 10 },
      { page: 0, key: 'todayYearShort', x: 142, y: 98, size: 10 },
      { page: 0, key: 'todayMonth', x: 185, y: 98, size: 10 },
      { page: 0, key: 'todayDay', x: 225, y: 98, size: 10 },
      { page: 0, key: 'insuredName', x: 445, y: 98, size: 10, bold: true },
      // 5P 하단 날짜 및 성명 줄 정렬 보정
      { page: 4, key: 'todayYear', x: 162, y: 92, size: 10 },
      { page: 4, key: 'todayMonth', x: 226, y: 92, size: 10 },
      { page: 4, key: 'todayDay', x: 274, y: 92, size: 10 },
      { page: 4, key: 'insuredName', x: 405, y: 108, size: 10, bold: true }
    ],
    checks: [
      { page: 0, cond: () => true, x: 528, y: 662 }, // 계약자: 피보험자와 동일
      { page: 0, cond: () => true, x: 138, y: 642 }, // 보상안내: 피보험자
      { page: 0, cond: (d) => d.accidentType === '질병', x: 66, y: 524 },
      { page: 0, cond: (d) => d.accidentType === '상해', x: 298, y: 524 },
      { page: 0, cond: (d) => d.coverages.includes('실손의료비'), x: 90, y: 508 },
      { page: 0, cond: (d) => d.coverages.includes('수술'), x: 90, y: 492 },
      { page: 0, cond: (d) => d.coverages.includes('진단'), x: 90, y: 477 },
      { page: 0, cond: (d) => d.claimCategory === '신규', x: 226, y: 372 }, // 추가청구: 아니오
      { page: 0, cond: (d) => d.claimCategory === '추가', x: 184, y: 372 }, // 추가청구: 예
      { page: 0, cond: () => true, x: 318, y: 266 }, // 다른 보험계약사항: 없음
      { page: 0, cond: (d) => !d.useAutoTransfer, x: 113, y: 222 },
      { page: 0, cond: (d) => d.useAutoTransfer, x: 185, y: 222 },
      // 상세동의서 2, 4, 5P (기존 '동의하지않음' x:501 → 우측 '동의함' x:545 이동)
      { page: 1, cond: () => true, x: 545, y: 349 },
      { page: 1, cond: () => true, x: 545, y: 255 },
      { page: 1, cond: () => true, x: 545, y: 134 },
      { page: 3, cond: () => true, x: 545, y: 704 },
      { page: 3, cond: () => true, x: 545, y: 610 },
      { page: 3, cond: () => true, x: 545, y: 489 },
      { page: 3, cond: () => true, x: 545, y: 315 },
      { page: 3, cond: () => true, x: 545, y: 223 },
      { page: 4, cond: () => true, x: 545, y: 526 },
      { page: 4, cond: () => true, x: 545, y: 446 },
      { page: 4, cond: () => true, x: 545, y: 340 }
    ],
    signatures: [
      { page: 0, x: 510, y: 98, w: 48, h: 20 },
      { page: 4, x: 495, y: 108, w: 48, h: 20 }
    ]
  },
  // [7. NH농협손해보험]
  nh_nonlife: {
    fields: [
      { page: 0, key: 'holderName', x: 155, y: 689, size: 10 },
      { page: 0, key: 'holderRrn1', x: 375, y: 689, size: 10 },
      { page: 0, key: 'holderRrn2', x: 460, y: 689, size: 10 },
      { page: 0, key: 'insuredName', x: 155, y: 663, size: 10, bold: true },
      { page: 0, key: 'insuredRrn1', x: 375, y: 663, size: 10 },
      { page: 0, key: 'insuredRrn2', x: 460, y: 663, size: 10 },
      { page: 0, key: 'insuredJob', x: 155, y: 636, size: 9.5 },
      { page: 0, key: 'insuredName', x: 155, y: 559, size: 10 },
      { page: 0, key: 'insuredPhone', x: 360, y: 559, size: 10 },
      { page: 0, key: 'accYear', x: 118, y: 371, size: 10 },
      { page: 0, key: 'accMonth', x: 192, y: 371, size: 10 },
      { page: 0, key: 'accDay', x: 245, y: 371, size: 10 },
      { page: 0, key: 'accidentDesc', x: 105, y: 346, size: 9.5 },
      { page: 0, key: 'accidentPlace', x: 365, y: 346, size: 9.5 },
      { page: 0, key: 'diagnosisName', x: 105, y: 318, size: 9.5 },
      { page: 0, key: 'hospitalName', x: 365, y: 318, size: 9.5 },
      { page: 0, key: 'bankName', x: 95, y: 243, size: 10 },
      { page: 0, key: 'beneficiaryName', x: 212, y: 243, size: 10 },
      { page: 0, key: 'beneficiaryRrnFull', x: 352, y: 243, size: 9.5 },
      { page: 0, key: 'relSelf', x: 525, y: 243, size: 9.5 },
      { page: 0, key: 'accountNumber', x: 115, y: 222, size: 10 },
      { page: 0, key: 'todayYear', x: 95, y: 127, size: 10 },
      { page: 0, key: 'todayMonth', x: 152, y: 127, size: 10 },
      { page: 0, key: 'todayDay', x: 190, y: 127, size: 10 },
      { page: 0, key: 'relSelf', x: 398, y: 127, size: 9.5 },
      { page: 0, key: 'insuredName', x: 482, y: 127, size: 10, bold: true },
      { page: 4, key: 'insuredName', x: 225, y: 153, size: 10, bold: true },
      { page: 4, key: 'todayYear', x: 200, y: 70, size: 10 },
      { page: 4, key: 'todayMonth', x: 270, y: 70, size: 10 },
      { page: 4, key: 'todayDay', x: 325, y: 70, size: 10 }
    ],
    checks: [
      { page: 0, cond: () => true, x: 220, y: 610 },
      { page: 0, cond: () => true, x: 262, y: 468 },
      { page: 0, cond: (d) => d.accidentType === '질병', x: 112, y: 405 },
      { page: 0, cond: (d) => d.accidentType === '상해', x: 180, y: 405 },
      { page: 0, cond: (d) => d.useAutoTransfer, x: 145, y: 267 },
      { page: 1, cond: () => true, x: 505, y: 341 },
      { page: 1, cond: () => true, x: 505, y: 235 },
      { page: 1, cond: () => true, x: 505, y: 107 },
      { page: 2, cond: () => true, x: 495, y: 315 },
      { page: 2, cond: () => true, x: 495, y: 217 },
      { page: 2, cond: () => true, x: 495, y: 109 },
      { page: 3, cond: () => true, x: 507, y: 243 },
      { page: 3, cond: () => true, x: 507, y: 106 },
      { page: 4, cond: () => true, x: 506, y: 504 },
      { page: 4, cond: () => true, x: 506, y: 400 },
      { page: 4, cond: () => true, x: 506, y: 208 }
    ],
    signatures: [
      { page: 0, x: 535, y: 127, w: 45, h: 20 },
      { page: 4, x: 225, y: 124, w: 55, h: 22 }
    ]
  },

  // [8. 한화손해보험]
  hanwha_nonlife: {
    fields: [
      { page: 0, key: 'insuredName', x: 115, y: 726, size: 10, bold: true },
      { page: 0, key: 'insuredAddress', x: 310, y: 726, size: 9.5 },
      { page: 0, key: 'insuredRrn1', x: 135, y: 705, size: 10 },
      { page: 0, key: 'insuredRrn2', x: 245, y: 705, size: 10 },
      { page: 0, key: 'insuredPhone', x: 120, y: 683, size: 10 },
      { page: 0, key: 'insuredJob', x: 115, y: 661, size: 9.5 },
      { page: 0, key: 'accYear', x: 140, y: 548, size: 10 },
      { page: 0, key: 'accMonth', x: 215, y: 548, size: 10 },
      { page: 0, key: 'accDay', x: 265, y: 548, size: 10 },
      { page: 0, key: 'accidentPlace', x: 395, y: 548, size: 9.5 },
      { page: 0, key: 'accidentDesc', x: 115, y: 468, size: 9.5 },
      { page: 0, key: 'hospitalName', x: 395, y: 468, size: 9.5 },
      { page: 0, key: 'bankName', x: 112, y: 347, size: 10 },
      { page: 0, key: 'accountNumber', x: 300, y: 347, size: 10 },
      { page: 0, key: 'beneficiaryName', x: 112, y: 328, size: 10 },
      { page: 0, key: 'beneficiaryRrn1', x: 330, y: 328, size: 10 },
      { page: 0, key: 'beneficiaryRrn2', x: 425, y: 328, size: 10 },
      { page: 0, key: 'todayYear', x: 115, y: 138, size: 10 },
      { page: 0, key: 'todayMonth', x: 185, y: 138, size: 10 },
      { page: 0, key: 'todayDay', x: 232, y: 138, size: 10 },
      { page: 0, key: 'insuredName', x: 430, y: 138, size: 10, bold: true },
      { page: 2, key: 'insuredName', x: 435, y: 143, size: 10, bold: true },
      { page: 2, key: 'todayYear', x: 195, y: 120, size: 10 },
      { page: 2, key: 'todayMonth', x: 260, y: 120, size: 10 },
      { page: 2, key: 'todayDay', x: 305, y: 120, size: 10 }
    ],
    checks: [
      { page: 0, cond: () => true, x: 112, y: 638 },
      { page: 0, cond: (d) => d.accidentType === '질병', x: 118, y: 519 },
      { page: 0, cond: (d) => d.accidentType === '상해', x: 182, y: 519 },
      { page: 0, cond: (d) => d.accidentType === '교통사고', x: 268, y: 519 },
      { page: 0, cond: (d) => d.coverages.includes('실손의료비'), x: 118, y: 485 },
      { page: 0, cond: (d) => d.coverages.includes('수술'), x: 275, y: 485 },
      { page: 0, cond: (d) => d.coverages.includes('진단'), x: 328, y: 485 },
      { page: 0, cond: (d) => d.useAutoTransfer, x: 135, y: 368 },
      { page: 0, cond: () => true, x: 518, y: 281 },
      { page: 1, cond: () => true, x: 516, y: 520 },
      { page: 1, cond: () => true, x: 516, y: 473 },
      { page: 1, cond: () => true, x: 516, y: 409 },
      { page: 2, cond: () => true, x: 516, y: 724 },
      { page: 2, cond: () => true, x: 516, y: 677 },
      { page: 2, cond: () => true, x: 516, y: 610 },
      { page: 2, cond: () => true, x: 516, y: 524 },
      { page: 2, cond: () => true, x: 516, y: 299 },
      { page: 2, cond: () => true, x: 516, y: 265 },
      { page: 2, cond: () => true, x: 516, y: 215 }
    ],
    signatures: [
      { page: 0, x: 508, y: 138, w: 48, h: 20 },
      { page: 2, x: 515, y: 143, w: 48, h: 20 }
    ]
  },

  // [9. 흥국화재]
  heungkuk_fire: {
    fields: [
      { page: 0, key: 'insuredName', x: 165, y: 713, size: 10, bold: true },
      { page: 0, key: 'insuredRrnFull', x: 395, y: 713, size: 10 },
      { page: 0, key: 'insuredPhone', x: 165, y: 691, size: 10 },
      { page: 0, key: 'insuredJob', x: 395, y: 691, size: 9.5 },
      { page: 0, key: 'insuredAddress', x: 165, y: 669, size: 9.5 },
      { page: 0, key: 'beneficiaryName', x: 165, y: 647, size: 10 },
      { page: 0, key: 'relSelf', x: 405, y: 647, size: 9.5 },
      { page: 0, key: 'insuredPhone', x: 165, y: 626, size: 10 },
      { page: 0, key: 'accidentDate', x: 105, y: 551, size: 10 },
      { page: 0, key: 'accidentPlace', x: 355, y: 551, size: 9.5 },
      { page: 0, key: 'accidentDesc', x: 105, y: 528, size: 9.5 },
      { page: 0, key: 'diagnosisName', x: 105, y: 505, size: 9.5 },
      { page: 0, key: 'hospitalName', x: 360, y: 505, size: 9.5 },
      { page: 0, key: 'bankName', x: 168, y: 409, size: 10 },
      { page: 0, key: 'accountNumber', x: 305, y: 409, size: 10 },
      { page: 0, key: 'beneficiaryName', x: 475, y: 409, size: 10 },
      { page: 0, key: 'todayYear', x: 195, y: 98, size: 10 },
      { page: 0, key: 'todayMonth', x: 262, y: 98, size: 10 },
      { page: 0, key: 'todayDay', x: 312, y: 98, size: 10 },
      { page: 0, key: 'insuredName', x: 465, y: 98, size: 10, bold: true },
      { page: 3, key: 'todayYear', x: 200, y: 72, size: 10 },
      { page: 3, key: 'todayMonth', x: 268, y: 72, size: 10 },
      { page: 3, key: 'todayDay', x: 318, y: 72, size: 10 },
      { page: 3, key: 'insuredName', x: 440, y: 87, size: 10, bold: true },
      { page: 4, key: 'todayYear', x: 195, y: 221, size: 10 },
      { page: 4, key: 'todayMonth', x: 262, y: 221, size: 10 },
      { page: 4, key: 'todayDay', x: 312, y: 221, size: 10 },
      { page: 4, key: 'insuredName', x: 408, y: 247, size: 10, bold: true }
    ],
    checks: [
      { page: 0, cond: (d) => d.accidentType === '질병', x: 133, y: 572 },
      { page: 0, cond: (d) => d.accidentType === '상해', x: 175, y: 572 },
      { page: 0, cond: (d) => d.accidentType === '교통사고', x: 215, y: 572 },
      { page: 0, cond: (d) => d.claimCategory === '신규', x: 389, y: 572 },
      { page: 0, cond: (d) => d.claimCategory === '추가', x: 455, y: 572 },
      { page: 0, cond: (d) => d.coverages.includes('실손의료비'), x: 105, y: 440 },
      { page: 1, cond: () => true, x: 512, y: 341 },
      { page: 1, cond: () => true, x: 512, y: 227 },
      { page: 1, cond: () => true, x: 512, y: 94 },
      { page: 2, cond: () => true, x: 508, y: 338 },
      { page: 2, cond: () => true, x: 508, y: 231 },
      { page: 2, cond: () => true, x: 508, y: 121 },
      { page: 3, cond: () => true, x: 498, y: 471 },
      { page: 3, cond: () => true, x: 498, y: 400 },
      { page: 3, cond: () => true, x: 498, y: 211 },
      { page: 3, cond: () => true, x: 498, y: 180 },
      { page: 3, cond: () => true, x: 498, y: 112 },
      { page: 4, cond: () => true, x: 498, y: 418 },
      { page: 4, cond: () => true, x: 498, y: 326 }
    ],
    signatures: [
      { page: 0, x: 525, y: 98, w: 48, h: 20 },
      { page: 3, x: 495, y: 87, w: 48, h: 20 },
      { page: 4, x: 470, y: 247, w: 48, h: 20 }
    ]
  },

  // [10. 하나손해보험]
  hana_nonlife: {
    fields: [
      { page: 0, key: 'insuredName', x: 145, y: 650, size: 10, bold: true },
      { page: 0, key: 'insuredRrnFull', x: 355, y: 650, size: 10 },
      { page: 0, key: 'insuredJob', x: 355, y: 633, size: 9.5 },
      { page: 0, key: 'insuredName', x: 145, y: 598, size: 10 },
      { page: 0, key: 'insuredPhone', x: 355, y: 598, size: 10 },
      { page: 0, key: 'accidentDate', x: 115, y: 468, size: 10 },
      { page: 0, key: 'accidentPlace', x: 340, y: 468, size: 9.5 },
      { page: 0, key: 'accidentDesc', x: 115, y: 451, size: 9.5 },
      { page: 0, key: 'hospitalName', x: 115, y: 434, size: 9.5 },
      { page: 0, key: 'diagnosisName', x: 340, y: 434, size: 9.5 },
      { page: 0, key: 'accountNumber', x: 150, y: 327, size: 10 },
      { page: 0, key: 'bankName', x: 385, y: 327, size: 10 },
      { page: 0, key: 'beneficiaryName', x: 495, y: 327, size: 10 },
      { page: 0, key: 'todayYearShort', x: 92, y: 92, size: 10 },
      { page: 0, key: 'todayMonth', x: 155, y: 92, size: 10 },
      { page: 0, key: 'todayDay', x: 215, y: 92, size: 10 },
      { page: 0, key: 'insuredName', x: 430, y: 92, size: 10, bold: true },
      { page: 4, key: 'todayYear', x: 195, y: 410, size: 10 },
      { page: 4, key: 'todayMonth', x: 280, y: 410, size: 10 },
      { page: 4, key: 'todayDay', x: 350, y: 410, size: 10 },
      { page: 4, key: 'insuredName', x: 115, y: 368, size: 10, bold: true },
      { page: 4, key: 'beneficiaryName', x: 420, y: 358, size: 10, bold: true }
    ],
    checks: [
      { page: 0, cond: () => true, x: 190, y: 615 },
      { page: 0, cond: () => true, x: 218, y: 525 },
      { page: 0, cond: (d) => d.accidentType === '상해', x: 258, y: 486 },
      { page: 0, cond: (d) => d.accidentType === '질병', x: 314, y: 486 },
      { page: 0, cond: (d) => d.accidentType === '교통사고', x: 370, y: 486 },
      { page: 0, cond: (d) => d.coverages.includes('실손의료비'), x: 512, y: 366 },
      { page: 1, cond: () => true, x: 472, y: 443 },
      { page: 1, cond: () => true, x: 472, y: 380 },
      { page: 1, cond: () => true, x: 472, y: 286 },
      { page: 2, cond: () => true, x: 472, y: 285 },
      { page: 2, cond: () => true, x: 472, y: 222 },
      { page: 2, cond: () => true, x: 472, y: 128 },
      { page: 3, cond: () => true, x: 472, y: 353 },
      { page: 3, cond: () => true, x: 472, y: 289 },
      { page: 4, cond: () => true, x: 472, y: 550 },
      { page: 4, cond: () => true, x: 472, y: 498 },
      { page: 4, cond: () => true, x: 472, y: 428 }
    ],
    signatures: [
      { page: 0, x: 505, y: 92, w: 50, h: 22 },
      { page: 4, x: 195, y: 368, w: 50, h: 22 },
      { page: 4, x: 475, y: 358, w: 50, h: 22 }
    ]
  },

  // [11. 라이나손해보험]
  lina_nonlife: {
    fields: [
      { page: 0, key: 'holderName', x: 148, y: 632, size: 10 },
      { page: 0, key: 'holderRrn1', x: 290, y: 632, size: 10 },
      { page: 0, key: 'holderRrn2', x: 358, y: 632, size: 10 },
      { page: 0, key: 'insuredPhone', x: 462, y: 632, size: 9.5 },
      { page: 0, key: 'insuredName', x: 148, y: 608, size: 10, bold: true },
      { page: 0, key: 'insuredRrn1', x: 290, y: 608, size: 10 },
      { page: 0, key: 'insuredRrn2', x: 358, y: 608, size: 10 },
      { page: 0, key: 'insuredPhone', x: 462, y: 608, size: 9.5 },
      { page: 0, key: 'insuredAddress', x: 148, y: 585, size: 9.5 },
      { page: 0, key: 'insuredJob', x: 465, y: 585, size: 9.5 },
      { page: 0, key: 'insuredPhone', x: 162, y: 542, size: 10 },
      { page: 0, key: 'accYear', x: 112, y: 369, size: 10 },
      { page: 0, key: 'accMonth', x: 162, y: 369, size: 10 },
      { page: 0, key: 'accDay', x: 198, y: 369, size: 10 },
      { page: 0, key: 'accidentPlace', x: 418, y: 369, size: 9.5 },
      { page: 0, key: 'accidentDesc', x: 115, y: 332, size: 9.5 },
      { page: 0, key: 'hospitalName', x: 115, y: 294, size: 9.5 },
      { page: 0, key: 'diagnosisName', x: 418, y: 294, size: 9.5 },
      { page: 0, key: 'beneficiaryName', x: 115, y: 184, size: 10 },
      { page: 0, key: 'beneficiaryRrn1', x: 265, y: 184, size: 10 },
      { page: 0, key: 'beneficiaryRrn2', x: 340, y: 184, size: 10 },
      { page: 0, key: 'insuredJob', x: 465, y: 184, size: 9.5 },
      { page: 0, key: 'bankName', x: 115, y: 161, size: 10 },
      { page: 0, key: 'accountNumber', x: 265, y: 161, size: 10 },
      { page: 3, key: 'todayYearShort', x: 448, y: 126, size: 10 },
      { page: 3, key: 'todayMonth', x: 490, y: 126, size: 10 },
      { page: 3, key: 'todayDay', x: 525, y: 126, size: 10 },
      { page: 3, key: 'insuredName', x: 365, y: 104, size: 10, bold: true }
    ],
    checks: [
      { page: 0, cond: () => true, x: 256, y: 655 }, // 의료수급권자: 비대상
      { page: 0, cond: () => true, x: 196, y: 559 }, // 보상안내: 피보험자
      { page: 0, cond: () => true, x: 142, y: 505 }, // 안내방법: SMS
      { page: 0, cond: () => true, x: 172, y: 454 }, // 타사 계약사항: 없음
      { page: 0, cond: (d) => d.accidentType === '질병', x: 96, y: 392 },
      { page: 0, cond: (d) => d.accidentType === '상해', x: 152, y: 392 },
      { page: 0, cond: (d) => d.accidentType === '교통사고', x: 208, y: 392 },
      { page: 0, cond: (d) => d.claimCategory === '신규', x: 437, y: 392 },
      { page: 0, cond: (d) => d.claimCategory === '추가', x: 498, y: 392 },
      { page: 1, cond: () => true, x: 505, y: 383 },
      { page: 1, cond: () => true, x: 505, y: 317 },
      { page: 1, cond: () => true, x: 505, y: 199 },
      { page: 2, cond: () => true, x: 505, y: 338 },
      { page: 2, cond: () => true, x: 505, y: 274 },
      { page: 2, cond: () => true, x: 505, y: 182 },
      { page: 3, cond: () => true, x: 505, y: 522 },
      { page: 3, cond: () => true, x: 505, y: 486 },
      { page: 3, cond: () => true, x: 505, y: 279 },
      { page: 3, cond: () => true, x: 505, y: 238 },
      { page: 3, cond: () => true, x: 505, y: 184 }
    ],
    signatures: [
      { page: 3, x: 495, y: 104, w: 50, h: 22 }
    ]
  },
  
  // [12. 롯데손해보험]
  lotte: {
    fields: [
      { page: 0, key: 'insuredName', x: 155, y: 625, size: 10, bold: true },
      { page: 0, key: 'insuredRrnFull', x: 315, y: 625, size: 10 },
      { page: 0, key: 'insuredJob', x: 155, y: 602, size: 9.5 },
      { page: 0, key: 'holderName', x: 155, y: 578, size: 10 },
      { page: 0, key: 'holderRrnFull', x: 315, y: 578, size: 10 },
      { page: 0, key: 'insuredName', x: 155, y: 554, size: 10 },
      { page: 0, key: 'insuredPhone', x: 315, y: 554, size: 10 },
      { page: 0, key: 'relSelf', x: 155, y: 532, size: 9.5 },
      { page: 0, key: 'insuredAddress', x: 315, y: 510, size: 9 },
      { page: 0, key: 'accYear', x: 105, y: 468, size: 9.5 },
      { page: 0, key: 'accMonth', x: 155, y: 468, size: 9.5 },
      { page: 0, key: 'accDay', x: 190, y: 468, size: 9.5 },
      { page: 0, key: 'diagnosisName', x: 365, y: 468, size: 9.5 },
      { page: 0, key: 'accidentPlace', x: 135, y: 445, size: 9.5 },
      { page: 0, key: 'hospitalName', x: 365, y: 445, size: 9.5 },
      { page: 0, key: 'accidentDesc', x: 135, y: 422, size: 9.5 },
      { page: 0, key: 'beneficiaryName', x: 135, y: 262, size: 10 },
      { page: 0, key: 'beneficiaryRrnFull', x: 315, y: 262, size: 10 },
      { page: 0, key: 'bankName', x: 135, y: 238, size: 10 },
      { page: 0, key: 'accountNumber', x: 315, y: 238, size: 10 },
      { page: 0, key: 'todayYearShort', x: 145, y: 105, size: 10 },
      { page: 0, key: 'todayMonth', x: 185, y: 105, size: 10 },
      { page: 0, key: 'todayDay', x: 222, y: 105, size: 10 },
      { page: 0, key: 'insuredName', x: 385, y: 105, size: 10, bold: true },
      { page: 4, key: 'insuredName', x: 115, y: 150, size: 10, bold: true },
      { page: 4, key: 'todayDateSlash', x: 435, y: 150, size: 10 },
      { page: 5, key: 'insuredName', x: 115, y: 235, size: 10, bold: true },
      { page: 5, key: 'todayDateSlash', x: 435, y: 235, size: 10 }
    ],
    checks: [
      { page: 0, cond: () => true, x: 515, y: 602 },
      { page: 0, cond: () => true, x: 315, y: 532 },
      { page: 0, cond: (d) => d.accidentType === '질병', x: 152, y: 490 },
      { page: 0, cond: (d) => d.accidentType !== '질병', x: 192, y: 490 },
      { page: 0, cond: (d) => d.claimCategory === '신규', x: 515, y: 422 },
      { page: 0, cond: (d) => d.coverages.includes('실손의료비'), x: 122, y: 356 },
      { page: 0, cond: (d) => d.useAutoTransfer, x: 175, y: 286 },
      { page: 1, cond: () => true, x: 492, y: 300 },
      { page: 1, cond: () => true, x: 492, y: 205 },
      { page: 1, cond: () => true, x: 492, y: 100 },
      { page: 3, cond: () => true, x: 492, y: 715 },
      { page: 3, cond: () => true, x: 492, y: 615 },
      { page: 3, cond: () => true, x: 492, y: 505 },
      { page: 4, cond: () => true, x: 492, y: 715 },
      { page: 4, cond: () => true, x: 492, y: 625 },
      { page: 4, cond: () => true, x: 492, y: 405 },
      { page: 4, cond: () => true, x: 492, y: 345 },
      { page: 4, cond: () => true, x: 492, y: 255 },
      { page: 5, cond: () => true, x: 492, y: 415 },
      { page: 5, cond: () => true, x: 492, y: 340 }
    ],
    signatures: [
      { page: 0, x: 475, y: 105, w: 52, h: 22 },
      { page: 4, x: 170, y: 150, w: 52, h: 22 },
      { page: 5, x: 170, y: 235, w: 52, h: 22 }
    ]
  },

  // [13. AIG손해보험]
  aig: {
    fields: [
      // 1P 전체 행 상향 보정 (한 줄씩 밀리던 현상 해결)
      { page: 0, key: 'insuredName', x: 135, y: 718, size: 10, bold: true },
      { page: 0, key: 'insuredRrnFull', x: 355, y: 718, size: 10 },
      { page: 0, key: 'insuredPhone', x: 135, y: 696, size: 10 },
      { page: 0, key: 'insuredJob', x: 315, y: 696, size: 9.5 },
      { page: 0, key: 'beneficiaryName', x: 145, y: 642, size: 10 },
      { page: 0, key: 'beneficiaryRrnFull', x: 355, y: 642, size: 10 },
      { page: 0, key: 'insuredPhone', x: 355, y: 618, size: 10 },
      { page: 0, key: 'accYear', x: 135, y: 472, size: 10 },
      { page: 0, key: 'accMonth', x: 186, y: 472, size: 10 },
      { page: 0, key: 'accDay', x: 218, y: 472, size: 10 },
      { page: 0, key: 'accidentPlace', x: 425, y: 472, size: 9.5 },
      { page: 0, key: 'accidentDesc', x: 145, y: 448, size: 9.5 },
      { page: 0, key: 'diagnosisName', x: 145, y: 424, size: 9.5 },
      { page: 0, key: 'hospitalName', x: 355, y: 424, size: 9.5 },
      { page: 0, key: 'bankName', x: 125, y: 308, size: 10 },
      { page: 0, key: 'beneficiaryName', x: 265, y: 308, size: 10 },
      { page: 0, key: 'accountNumber', x: 415, y: 308, size: 10 },
      { page: 0, key: 'insuredAddress', x: 125, y: 284, size: 9 },
      { page: 0, key: 'insuredPhone', x: 415, y: 284, size: 10 },
      { page: 0, key: 'todayYear', x: 122, y: 62, size: 10 },
      { page: 0, key: 'todayMonth', x: 175, y: 62, size: 10 },
      { page: 0, key: 'todayDay', x: 208, y: 62, size: 10 },
      { page: 0, key: 'beneficiaryName', x: 415, y: 62, size: 10, bold: true },
      // 7P(page: 6) 상세동의서 하단 서명표 내부로 정렬
      { page: 6, key: 'todayYear', x: 225, y: 212, size: 10 },
      { page: 6, key: 'todayMonth', x: 278, y: 212, size: 10 },
      { page: 6, key: 'todayDay', x: 315, y: 212, size: 10 },
      { page: 6, key: 'insuredName', x: 145, y: 182, size: 10, bold: true },
      // 8P(page: 7) 국외 제3자 제공 동의서 하단 정렬
      { page: 7, key: 'insuredName', x: 145, y: 142, size: 10, bold: true },
      { page: 7, key: 'todayYear', x: 275, y: 142, size: 10 },
      { page: 7, key: 'todayMonth', x: 328, y: 142, size: 10 },
      { page: 7, key: 'todayDay', x: 365, y: 142, size: 10 }
    ],
    checks: [
      { page: 0, cond: () => true, x: 536, y: 696 }, // 의료급여: 아니오
      { page: 0, cond: () => true, x: 196, y: 642 }, // 수익자: 상동
      { page: 0, cond: () => true, x: 142, y: 618 }, // 실제소유자: 예
      { page: 0, cond: () => true, x: 298, y: 618 }, // 보상안내 받을 분: 상동
      { page: 0, cond: (d) => d.accidentType === '질병', x: 112, y: 540 },
      { page: 0, cond: (d) => d.accidentType === '상해', x: 288, y: 540 },
      { page: 0, cond: (d) => d.claimCategory === '추가', x: 468, y: 520 },
      { page: 0, cond: (d) => d.coverages.includes('입원'), x: 112, y: 496 },
      { page: 0, cond: (d) => d.coverages.includes('통원'), x: 152, y: 496 },
      { page: 0, cond: (d) => d.coverages.includes('수술'), x: 192, y: 496 },
      { page: 0, cond: (d) => d.coverages.includes('진단'), x: 232, y: 496 },
      // 상세동의서 4, 6, 7, 8P (기존 '동의안함' x:492 → 우측 '동의함' x:538 이동)
      { page: 3, cond: () => true, x: 538, y: 382 },
      { page: 3, cond: () => true, x: 538, y: 272 },
      { page: 3, cond: () => true, x: 538, y: 142 },
      { page: 5, cond: () => true, x: 538, y: 695 },
      { page: 5, cond: () => true, x: 538, y: 565 },
      { page: 5, cond: () => true, x: 538, y: 425 },
      { page: 6, cond: () => true, x: 538, y: 695 },
      { page: 6, cond: () => true, x: 538, y: 585 },
      { page: 6, cond: () => true, x: 538, y: 465 },
      { page: 7, cond: () => true, x: 538, y: 325 },
      { page: 7, cond: () => true, x: 538, y: 225 }
    ],
    signatures: [
      { page: 0, x: 495, y: 62, w: 52, h: 22 },
      { page: 6, x: 235, y: 182, w: 52, h: 22 },
      { page: 7, x: 455, y: 142, w: 52, h: 22 }
    ]
  }
};
