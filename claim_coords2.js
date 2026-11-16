/**
 * 잇츠리온(It's RION) 생명보험사 전용 양식 파일 매핑 및 정밀 좌표 데이터 (claim_coords2.js)
 * - 양식 폴더 경로: ./forms2/
 */

// 1. 생명보험사 탭(INSURER_DB.life)과 forms2 폴더 내 실제 업로드 파일명·팩스번호 자동 연동
const LIFE_PDF_FILES = {
  abl_life:      { pdfFile: 'ABL생명 보험금청구서.pdf', fax: '02-3787-8796', faxType: 'fixed' },
  aia_life:      { pdfFile: 'AIA생명 보험금청구서.pdf', fax: '02-2021-4540', faxType: 'fixed' },
  cardif_life:   { pdfFile: 'BNP파리바카디프생명 보험금청구서.pdf', fax: '02-3788-8939', faxType: 'fixed' },
  db_life:       { pdfFile: 'db생명 보험금청구서.pdf', fax: '0505-129-3134', faxType: 'fixed' },
  im_life:       { pdfFile: 'im라이프 보험금청구서.pdf', fax: '02-2081-2890', faxType: 'fixed' },
  kb_life:       { pdfFile: 'KB생명 보험금청구서.pdf', fax: '02-6220-9912', faxType: 'fixed' },
  kdb_life:      { pdfFile: 'kdb생명 보험금청구서.pdf', fax: '02-2669-7930', faxType: 'fixed' },
  kyobo_life:    { pdfFile: '교보생명 보험금청구서.pdf', fax: '콜센터 가상팩스 발급', faxType: 'virtual' },
  nh_life:       { pdfFile: '농협생명 보험금청구서.pdf', fax: '02-6971-6040', faxType: 'fixed' },
  tongyang_life: { pdfFile: '동양생명 보험금청구서.pdf', fax: '02-3289-5500', faxType: 'fixed' },
  lina_life:     { pdfFile: '라이나생명 보험금청구서.pdf', fax: '02-6944-1200', faxType: 'fixed' },
  metlife:       { pdfFile: '메트라이프 보험금청구서.pdf', fax: '콜센터 가상팩스 발급', faxType: 'virtual' },
  mirae_life:    { pdfFile: '미래에셋생명 보험금청구서.pdf', fax: '콜센터 가상팩스 발급', faxType: 'virtual' },
  samsung_life:  { pdfFile: '삼성생명 보험금청구서.pdf', fax: '콜센터 가상팩스 발급', faxType: 'virtual' },
  shinhan_life:  { pdfFile: '신한라이프 보험금청구서.pdf', fax: '콜센터 가상팩스 발급', faxType: 'virtual' },
  chubb_life:    { pdfFile: '처브라이프 보험금청구서(구,ace).pdf', fax: '02-3480-7801', faxType: 'fixed' },
  fubon_life:    { pdfFile: '푸본현대라이프 보험금청구서.pdf', fax: '0505-106-0311', faxType: 'fixed' },
  hana_life:     { pdfFile: '하나생명 보험금청구서.pdf', fax: '콜센터 가상팩스 발급', faxType: 'virtual' },
  hanwha_life:   { pdfFile: '한화생명 보험금청구서.pdf', fax: '콜센터 가상팩스 발급', faxType: 'virtual' },
  heungkuk_life: { pdfFile: '흥국생명 보험금청구서.pdf', fax: '콜센터 가상팩스 발급', faxType: 'virtual' }
};

if (typeof INSURER_DB !== 'undefined' && Array.isArray(INSURER_DB.life)) {
  INSURER_DB.life.forEach(item => {
    if (LIFE_PDF_FILES[item.id]) {
      item.pdfFile = LIFE_PDF_FILES[item.id].pdfFile;
      if (LIFE_PDF_FILES[item.id].fax) item.fax = LIFE_PDF_FILES[item.id].fax;
      if (LIFE_PDF_FILES[item.id].faxType) item.faxType = LIFE_PDF_FILES[item.id].faxType;
    }
  });
}

// 2. 생명보험사별 정밀 좌표 등록 (PDF_COORD_MAP에 병합)
Object.assign(PDF_COORD_MAP, {
  // ==================== [1. ABL생명] (ABL생명 보험금청구서.pdf) ====================
  abl_life: {
    fields: [
      // 1P: 피보험자 및 수익자 인적사항
      { page: 0, key: 'insuredName', x: 132, y: 736, size: 10, bold: true },
      { page: 0, key: 'insuredRrnFull', x: 282, y: 736, size: 10 },
      { page: 0, key: 'insuredJob', x: 275, y: 719, size: 9.5 },
      { page: 0, key: 'insuredPhone', x: 458, y: 719, size: 9.5 },
      { page: 0, key: 'beneficiaryName', x: 132, y: 686, size: 10, bold: true },
      { page: 0, key: 'beneficiaryRrnFull', x: 282, y: 686, size: 10 },
      { page: 0, key: 'relSelf', x: 162, y: 669, size: 9.5 },
      { page: 0, key: 'beneficiaryPhone', x: 458, y: 669, size: 9.5 },
      { page: 0, key: 'beneficiaryAddress', x: 132, y: 652, size: 9 },
      // 1P: 수령계좌 및 하단 접수일자/수익자 성명
      { page: 0, key: 'bankName', x: 185, y: 612, size: 9.5 },
      { page: 0, key: 'beneficiaryName', x: 280, y: 612, size: 9.5 },
      { page: 0, key: 'accountNumber', x: 400, y: 612, size: 9.5 },
      { page: 0, key: 'todayYearShort', x: 96, y: 216, size: 10 },
      { page: 0, key: 'todayMonth', x: 132, y: 216, size: 10 },
      { page: 0, key: 'todayDay', x: 165, y: 216, size: 10 },
      { page: 0, key: 'claimantName', x: 320, y: 216, size: 10, bold: true },
      // 2P(별첨): 진단명, 사고일시, 장소, 경위
      { page: 1, key: 'diagnosisName', x: 325, y: 639, size: 10, bold: true },
      { page: 1, key: 'accYear', x: 135, y: 321, size: 10 },
      { page: 1, key: 'accMonth', x: 195, y: 321, size: 10 },
      { page: 1, key: 'accDay', x: 248, y: 321, size: 10 },
      { page: 1, key: 'accidentPlace', x: 135, y: 299, size: 9.5 },
      { page: 1, key: 'accidentDesc', x: 185, y: 275, size: 9.5 },
      // 5P(동의서 3/3): 하단 성명 및 동의일자
      { page: 4, key: 'insuredName', cond: (d) => !d.isUnder14, x: 105, y: 113, size: 10, bold: true },
      { page: 4, key: 'beneficiaryName', cond: (d) => !d.isSameInsBen || !d.isUnder14, x: 105, y: 82, size: 10, bold: true },
      { page: 4, key: 'guardianName19', cond: (d) => d.isUnder19, x: 375, y: 113, size: 10, bold: true },
      { page: 4, key: 'todayYearShort', x: 138, y: 58, size: 10 },
      { page: 4, key: 'todayMonth', x: 192, y: 58, size: 10 },
      { page: 4, key: 'todayDay', x: 242, y: 58, size: 10 }
    ],
    checks: [
      // 1P: 의료수급권자 아니오, 설계사/진행단계 문자안내 신청
      { page: 0, cond: () => true, x: 206, y: 703 },
      { page: 0, cond: (d) => d.notifyPlanner, x: 132, y: 506 },
      { page: 0, cond: (d) => d.notifyCustomer, x: 132, y: 483 },
      { page: 0, cond: (d) => d.notifyCustomer, x: 157, y: 461 },
      { page: 0, cond: (d) => d.notifyCustomer, x: 157, y: 438 },
      // 2P: 추가접수, 청구유형(동시), 사고유형, 청구사유
      { page: 1, cond: (d) => d.claimCategory === '추가', x: 134, y: 679 },
      { page: 1, cond: (d) => d.coverages.includes('실손의료비'), x: 196, y: 659 },
      { page: 1, cond: (d) => d.accidentType === '질병', x: 64, y: 620 },
      { page: 1, cond: (d) => d.accidentType === '상해', x: 54, y: 600 },
      { page: 1, cond: (d) => d.accidentType === '교통사고', x: 54, y: 580 },
      { page: 1, cond: (d) => d.coverages.includes('입원'), x: 64, y: 550 },
      { page: 1, cond: (d) => d.coverages.includes('통원'), x: 64, y: 501 },
      { page: 1, cond: (d) => d.coverages.includes('수술'), x: 64, y: 451 },
      { page: 1, cond: (d) => d.coverages.includes('진단'), x: 64, y: 422 },
      { page: 1, cond: (d) => d.coverages.includes('장해'), x: 64, y: 362 },
      // 3P(동의서1): 피보험자 동의함(x:292/460) & 수익자 동의함(x:504)
      { page: 2, cond: () => true, x: 292, y: 386 },
      { page: 2, cond: () => true, x: 504, y: 386 },
      { page: 2, cond: () => true, x: 460, y: 249 },
      { page: 2, cond: () => true, x: 292, y: 92 },
      { page: 2, cond: () => true, x: 504, y: 92 },
      // 4P(동의서2): 제공 동의함
      { page: 3, cond: () => true, x: 295, y: 372 },
      { page: 3, cond: () => true, x: 509, y: 372 },
      { page: 3, cond: () => true, x: 465, y: 253 },
      { page: 3, cond: () => true, x: 295, y: 115 },
      { page: 3, cond: () => true, x: 509, y: 115 },
      // 5P(동의서3): 조회 및 국외제공 동의함
      { page: 4, cond: () => true, x: 292, y: 562 },
      { page: 4, cond: () => true, x: 504, y: 562 },
      { page: 4, cond: () => true, x: 460, y: 480 },
      { page: 4, cond: () => true, x: 292, y: 386 },
      { page: 4, cond: () => true, x: 504, y: 386 },
      { page: 4, cond: () => true, x: 292, y: 174 },
      { page: 4, cond: () => true, x: 504, y: 174 }
    ],
    signatures: [
      { page: 0, role: 'beneficiary', x: 455, y: 215, w: 50, h: 20 },
      { page: 4, role: 'insured', cond: (d) => !d.isUnder14, x: 185, y: 113, w: 48, h: 20 },
      { page: 4, role: 'beneficiary', x: 185, y: 82, w: 48, h: 20 },
      { page: 4, role: 'guardian', cond: (d) => d.isUnder19, x: 455, y: 113, w: 48, h: 20 }
    ]
  },

  // ==================== [2. AIA생명] (AIA생명 보험금청구서.pdf) ====================
  aia_life: {
    fields: [
      // 1P: 피보험자 및 수익자 인적사항
      { page: 0, key: 'insuredName', x: 155, y: 696, size: 10, bold: true },
      { page: 0, key: 'insuredPhone', x: 415, y: 696, size: 9.5 },
      { page: 0, key: 'insuredRrnFull', x: 155, y: 675, size: 10 },
      { page: 0, key: 'beneficiaryName', x: 155, y: 650, size: 10, bold: true },
      { page: 0, key: 'beneficiaryPhone', x: 415, y: 650, size: 9.5 },
      { page: 0, key: 'beneficiaryRrnFull', x: 155, y: 629, size: 10 },
      { page: 0, key: 'beneficiaryAddress', x: 155, y: 608, size: 9 },
      { page: 0, key: 'beneficiaryJob', x: 155, y: 545, size: 9.5 },
      // 1P: 수령계좌
      { page: 0, key: 'bankName', x: 145, y: 405, size: 10 },
      { page: 0, key: 'beneficiaryName', x: 295, y: 405, size: 10 },
      { page: 0, key: 'accountNumber', x: 435, y: 405, size: 10 },
      // 1P: 사고내용 및 질병명
      { page: 0, key: 'accidentDate', x: 155, y: 282, size: 10 },
      { page: 0, key: 'accidentPlace', x: 415, y: 282, size: 9.5 },
      { page: 0, key: 'accidentDesc', x: 155, y: 260, size: 9.5 },
      { page: 0, key: 'diagnosisName', x: 155, y: 216, size: 9.5 },
      // 1P: 하단 작성일 및 수익자/청구인 성명
      { page: 0, key: 'todayYear', x: 142, y: 108, size: 10 },
      { page: 0, key: 'todayMonth', x: 202, y: 108, size: 10 },
      { page: 0, key: 'todayDay', x: 242, y: 108, size: 10 },
      { page: 0, key: 'claimantName', x: 395, y: 108, size: 10, bold: true },
      // 2P & 3P: 동의서 상단 피보험자 성명 기재란
      { page: 1, key: 'insuredName', x: 185, y: 742, size: 10, bold: true },
      { page: 2, key: 'insuredName', x: 185, y: 742, size: 10, bold: true },
      // 4P(동의서 3/3): 하단 날짜 및 서명자 성명
      { page: 3, key: 'todayYear', x: 415, y: 318, size: 10 },
      { page: 3, key: 'todayMonth', x: 472, y: 318, size: 10 },
      { page: 3, key: 'todayDay', x: 512, y: 318, size: 10 },
      { page: 3, key: 'insuredName', cond: (d) => !d.isUnder14, x: 245, y: 290, size: 10, bold: true },
      { page: 3, key: 'beneficiaryName', cond: (d) => !d.isSameInsBen && !d.isUnder14, x: 245, y: 266, size: 10, bold: true },
      { page: 3, key: 'guardianName19', cond: (d) => d.isUnder19, x: 245, y: 218, size: 10, bold: true },
      { page: 3, key: 'guardianName19', cond: (d) => d.isUnder19, x: 245, y: 165, size: 10, bold: true }
    ],
    checks: [
      // 1P: 국적(대한민국 필수), 심사현황(문자), 자동계좌, 청구유형, 청구사유
      { page: 0, cond: () => true, x: 152, y: 524 },
      { page: 0, cond: (d) => d.notifyCustomer, x: 152, y: 482 },
      { page: 0, cond: (d) => d.useAutoTransfer, x: 105, y: 426 },
      { page: 0, cond: (d) => d.accidentType === '질병', x: 145, y: 342 },
      { page: 0, cond: (d) => d.accidentType !== '질병', x: 205, y: 342 },
      { page: 0, cond: (d) => d.coverages.includes('입원'), x: 145, y: 320 },
      { page: 0, cond: (d) => d.coverages.includes('수술'), x: 205, y: 320 },
      { page: 0, cond: (d) => d.coverages.includes('통원'), x: 395, y: 320 },
      { page: 0, cond: (d) => d.coverages.includes('실손의료비'), x: 145, y: 302 },
      { page: 0, cond: (d) => d.coverages.includes('진단'), x: 275, y: 302 },
      { page: 0, cond: (d) => d.coverages.includes('장해'), x: 395, y: 302 },
      // 2P(동의서 1/3): 수집·이용 동의함 3곳
      { page: 1, cond: () => true, x: 502, y: 468 },
      { page: 1, cond: () => true, x: 502, y: 390 },
      { page: 1, cond: () => true, x: 502, y: 305 },
      // 3P(동의서 2/3): 국내/국외 제공 동의함 4곳
      { page: 2, cond: () => true, x: 502, y: 642 },
      { page: 2, cond: () => true, x: 502, y: 562 },
      { page: 2, cond: () => true, x: 502, y: 478 },
      { page: 2, cond: () => true, x: 502, y: 122 },
      // 4P(동의서 3/3): 국외제공·조회 동의함 4곳 + 손해사정서 수령동의
      { page: 3, cond: () => true, x: 502, y: 706 },
      { page: 3, cond: () => true, x: 502, y: 515 },
      { page: 3, cond: () => true, x: 502, y: 465 },
      { page: 3, cond: () => true, x: 502, y: 395 },
      { page: 3, cond: () => true, x: 165, y: 342 },
      { page: 3, cond: () => true, x: 295, y: 342 },
      { page: 3, cond: () => true, x: 425, y: 342 }
    ],
    signatures: [
      { page: 0, role: 'beneficiary', x: 485, y: 108, w: 52, h: 22 },
      { page: 3, role: 'insured', cond: (d) => !d.isUnder14, x: 445, y: 290, w: 50, h: 20 },
      { page: 3, role: 'beneficiary', cond: (d) => !d.isSameInsBen && !d.isUnder14, x: 445, y: 266, w: 50, h: 20 },
      { page: 3, role: 'guardian', cond: (d) => d.isUnder19, x: 445, y: 218, w: 50, h: 20 },
      { page: 3, role: 'guardian', cond: (d) => d.isUnder19, x: 445, y: 165, w: 50, h: 20 }
    ]
  },

  // ==================== [3. 카디프생명] (BNP파리바카디프생명 보험금청구서.pdf) ====================
  cardif_life: {
    fields: [
      // 1P: 피보험자 및 수익자 정보 (실측 y=701, 651, 621, 591)
      { page: 0, key: 'insuredName', x: 95, y: 701, size: 10, bold: true },
      { page: 0, key: 'insuredRrnFull', x: 250, y: 701, size: 10 },
      { page: 0, key: 'insuredPhone', x: 425, y: 701, size: 9.5 },
      { page: 0, key: 'beneficiaryName', x: 95, y: 651, size: 10, bold: true },
      { page: 0, key: 'beneficiaryRrnFull', x: 250, y: 651, size: 10 },
      { page: 0, key: 'beneficiaryPhone', x: 425, y: 651, size: 9.5 },
      { page: 0, key: 'beneficiaryAddress', x: 95, y: 621, size: 9 },
      { page: 0, key: 'relSelf', x: 445, y: 621, size: 9.5 },
      { page: 0, key: 'bankName', x: 95, y: 592, size: 10 },
      { page: 0, key: 'accountNumber', x: 245, y: 592, size: 10 },
      { page: 0, key: 'beneficiaryName', x: 430, y: 592, size: 10 },
      // 1P: 사고일시, 장소, 경위(진단명 포함)
      { page: 0, key: 'accYear', x: 112, y: 369, size: 9.5 },
      { page: 0, key: 'accMonth', x: 168, y: 369, size: 9.5 },
      { page: 0, key: 'accDay', x: 212, y: 369, size: 9.5 },
      { page: 0, key: 'accidentPlace', x: 112, y: 346, size: 9.5 },
      { page: 0, key: 'descWithDiag', x: 112, y: 308, size: 9.5 },
      // 1P: 하단 확인일 및 확인자 성명 (실측 y=134)
      { page: 0, key: 'todayYear', x: 152, y: 135, size: 10 },
      { page: 0, key: 'todayMonth', x: 222, y: 135, size: 10 },
      { page: 0, key: 'todayDay', x: 278, y: 135, size: 10 },
      { page: 0, key: 'claimantName', x: 472, y: 135, size: 10, bold: true },
      // 4P(동의서 3/3, W:612 H:792): 피보험자/수익자/법정대리인 성명 및 동의일
      { page: 3, key: 'insuredName', cond: (d) => !d.isUnder14, x: 135, y: 131, size: 10, bold: true },
      { page: 3, key: 'beneficiaryName', cond: (d) => !d.isUnder14, x: 135, y: 109, size: 10, bold: true },
      { page: 3, key: 'guardianName19', cond: (d) => d.isUnder19, x: 395, y: 131, size: 10, bold: true },
      { page: 3, key: 'todayYear', x: 140, y: 156, size: 10 },
      { page: 3, key: 'todayMonth', x: 205, y: 156, size: 10 },
      { page: 3, key: 'todayDay', x: 255, y: 156, size: 10 }
    ],
    checks: [
      // 1P: 유형(질병/재해), 청구사유, 모든 유지계약 심사요청, SMS 안내
      { page: 0, cond: (d) => d.accidentType === '질병', x: 90, y: 502 },
      { page: 0, cond: (d) => d.accidentType !== '질병', x: 288, y: 502 },
      { page: 0, cond: (d) => d.coverages.includes('입원'), x: 90, y: 468 },
      { page: 0, cond: (d) => d.coverages.includes('수술'), x: 149, y: 468 },
      { page: 0, cond: (d) => d.coverages.includes('진단'), x: 208, y: 468 },
      { page: 0, cond: (d) => d.coverages.includes('장해'), x: 267, y: 468 },
      { page: 0, cond: (d) => d.coverages.includes('실손의료비') || d.coverages.includes('통원'), x: 444, y: 468 },
      { page: 0, cond: () => true, x: 90, y: 446 },
      { page: 0, cond: (d) => d.notifyCustomer, x: 34, y: 227 },
      // 2P(동의서 1/3): 동의함 (실측 x=524, y=423, 345, 250)
      { page: 1, cond: () => true, x: 524, y: 423 },
      { page: 1, cond: () => true, x: 524, y: 345 },
      { page: 1, cond: () => true, x: 524, y: 250 },
      // 3P(동의서 2/3): 동의함 (실측 x=524, y=553, 476, 381, 69)
      { page: 2, cond: () => true, x: 524, y: 553 },
      { page: 2, cond: () => true, x: 524, y: 476 },
      { page: 2, cond: () => true, x: 524, y: 381 },
      { page: 2, cond: () => true, x: 524, y: 69 },
      // 4P(동의서 3/3): 동의함 (실측 x=524, y=691, 380, 331, 236)
      { page: 3, cond: () => true, x: 524, y: 691 },
      { page: 3, cond: () => true, x: 524, y: 380 },
      { page: 3, cond: () => true, x: 524, y: 331 },
      { page: 3, cond: () => true, x: 524, y: 236 }
    ],
    signatures: [
      { page: 0, role: 'beneficiary', x: 525, y: 135, w: 48, h: 20 },
      { page: 3, role: 'insured', cond: (d) => !d.isUnder14, x: 245, y: 131, w: 48, h: 20 },
      { page: 3, role: 'beneficiary', cond: (d) => !d.isUnder14, x: 245, y: 109, w: 48, h: 20 },
      { page: 3, role: 'guardian', cond: (d) => d.isUnder19, x: 505, y: 131, w: 48, h: 20 }
    ]
  },

  // ==================== [4. DB생명] (db생명 보험금청구서.pdf) ====================
  db_life: {
    fields: [
      // 1P: 피보험자 및 수익자 인적사항 (실측 y=702, 680, 656, 632)
      { page: 0, key: 'insuredName', x: 125, y: 703, size: 10, bold: true },
      { page: 0, key: 'insuredRrnFull', x: 235, y: 703, size: 10 },
      { page: 0, key: 'insuredPhone', x: 385, y: 703, size: 9.5 },
      { page: 0, key: 'insuredJob', x: 532, y: 703, size: 9 },
      { page: 0, key: 'beneficiaryName', x: 125, y: 680, size: 10, bold: true },
      { page: 0, key: 'beneficiaryRrnFull', x: 235, y: 680, size: 10 },
      { page: 0, key: 'beneficiaryPhone', x: 385, y: 680, size: 9.5 },
      { page: 0, key: 'relSelf', x: 554, y: 680, size: 9.5 },
      { page: 0, key: 'beneficiaryAddress', x: 125, y: 656, size: 9 },
      { page: 0, key: 'beneficiaryJob', x: 288, y: 632, size: 9 },
      // 1P: 수령계좌 (실측 y=506: ___은행 / 계좌번호 ___ / 예금주 ___)
      { page: 0, key: 'bankName', x: 115, y: 506, size: 10 },
      { page: 0, key: 'accountNumber', x: 250, y: 506, size: 10 },
      { page: 0, key: 'beneficiaryName', x: 440, y: 506, size: 10 },
      // 1P: 사고일시, 장소, 경위, 진단명 (실측 y=356, 338)
      { page: 0, key: 'accYear', x: 142, y: 356, size: 9.5 },
      { page: 0, key: 'accMonth', x: 196, y: 356, size: 9.5 },
      { page: 0, key: 'accDay', x: 232, y: 356, size: 9.5 },
      { page: 0, key: 'accidentPlace', x: 398, y: 356, size: 9.5 },
      { page: 0, key: 'accidentDesc', x: 102, y: 324, size: 9.5 },
      { page: 0, key: 'diagnosisName', x: 405, y: 338, size: 9.5 },
      // 1P: 하단 청구일자 및 수익자/대표친권자 성명 (실측 y=96, 110, 93)
      { page: 0, key: 'todayYear', x: 105, y: 97, size: 10 },
      { page: 0, key: 'todayMonth', x: 172, y: 97, size: 10 },
      { page: 0, key: 'todayDay', x: 218, y: 97, size: 10 },
      { page: 0, key: 'beneficiaryName', x: 375, y: 110, size: 10, bold: true },
      { page: 0, key: 'guardianName19', cond: (d) => d.isUnder19, x: 375, y: 93, size: 10, bold: true },
      // 4P(동의서 3/3): 신청일 및 피보험자/수익자/친권자 성명 (실측 y=123, 93, 66)
      { page: 3, key: 'todayYear', x: 372, y: 123, size: 10 },
      { page: 3, key: 'todayMonth', x: 455, y: 123, size: 10 },
      { page: 3, key: 'todayDay', x: 525, y: 123, size: 10 },
      { page: 3, key: 'insuredName', cond: (d) => !d.isUnder14, x: 85, y: 93, size: 10, bold: true },
      { page: 3, key: 'beneficiaryName', cond: (d) => !d.isSameInsBen && !d.isUnder14, x: 85, y: 66, size: 10, bold: true },
      { page: 3, key: 'guardianName', cond: (d) => d.isUnder14, x: 315, y: 93, size: 10, bold: true }
    ],
    checks: [
      // 1P: 청구원인(질병/재해), 청구유형(진단/수술/입원/통원/실손), 의료급여(아니오), 알림신청
      { page: 0, cond: (d) => d.accidentType === '질병', x: 98, y: 425 },
      { page: 0, cond: (d) => d.accidentType !== '질병', x: 342, y: 425 },
      { page: 0, cond: (d) => d.coverages.includes('장해'), x: 152, y: 386 },
      { page: 0, cond: (d) => d.coverages.includes('진단'), x: 198, y: 386 },
      { page: 0, cond: (d) => d.coverages.includes('수술'), x: 244, y: 386 },
      { page: 0, cond: (d) => d.coverages.includes('입원'), x: 290, y: 386 },
      { page: 0, cond: (d) => d.coverages.includes('통원'), x: 336, y: 386 },
      { page: 0, cond: (d) => d.coverages.includes('실손의료비'), x: 382, y: 386 },
      { page: 0, cond: () => true, x: 264, y: 273 },
      { page: 0, cond: (d) => d.notifyCustomer, x: 123, y: 216 },
      { page: 0, cond: (d) => d.notifyCustomer, x: 370, y: 216 },
      { page: 0, cond: (d) => d.notifyPlanner, x: 123, y: 202 },
      { page: 0, cond: (d) => d.notifyCustomer, x: 370, y: 202 },
      // 2P(동의서 1/3): 동의함 (실측 x=483, y=301, 198, 59)
      { page: 1, cond: () => true, x: 483, y: 301 },
      { page: 1, cond: () => true, x: 483, y: 198 },
      { page: 1, cond: () => true, x: 483, y: 59 },
      // 3P(동의서 2/3): 동의함 (실측 x=485, y=288, 185, 75)
      { page: 2, cond: () => true, x: 485, y: 288 },
      { page: 2, cond: () => true, x: 485, y: 185 },
      { page: 2, cond: () => true, x: 485, y: 75 },
      // 4P(동의서 3/3): 동의함 (실측 x=485, y=552, 314, 238, 163)
      { page: 3, cond: () => true, x: 485, y: 552 },
      { page: 3, cond: () => true, x: 485, y: 314 },
      { page: 3, cond: () => true, x: 485, y: 238 },
      { page: 3, cond: () => true, x: 485, y: 163 }
    ],
    signatures: [
      { page: 0, role: 'beneficiary', x: 485, y: 110, w: 48, h: 18 },
      { page: 0, role: 'guardian', cond: (d) => d.isUnder19, x: 485, y: 93, w: 48, h: 18 },
      { page: 3, role: 'insured', cond: (d) => !d.isUnder14, x: 155, y: 93, w: 48, h: 20 },
      { page: 3, role: 'beneficiary', cond: (d) => !d.isSameInsBen && !d.isUnder14, x: 155, y: 66, w: 48, h: 20 },
      { page: 3, role: 'guardian', cond: (d) => d.isUnder14, x: 375, y: 93, w: 48, h: 20 }
    ]
  },

  // ==================== [5. iM라이프생명보험] (im라이프 보험금청구서.pdf) ====================
  im_life: {
    fields: [
      // 1P 상단: 사고(발병)일시, 장소, 경위, 병명 (실측 y=645, 622, 601)
      { page: 0, key: 'accYearShort', x: 215, y: 645, size: 10 },
      { page: 0, key: 'accMonth', x: 252, y: 645, size: 10 },
      { page: 0, key: 'accDay', x: 286, y: 645, size: 10 },
      { page: 0, key: 'accidentPlace', x: 465, y: 645, size: 9.5 },
      { page: 0, key: 'accidentDesc', x: 198, y: 622, size: 9.5 },
      { page: 0, key: 'diagnosisName', x: 315, y: 601, size: 9.5, bold: true },
      // 1P 중단: 피보험자 인적사항 (하이픈 분리형 주민번호·연락처 정밀 매핑, 실측 y=494, 478)
      { page: 0, key: 'insuredName', x: 95, y: 494, size: 10, bold: true },
      { page: 0, key: 'insuredRrn1', x: 256, y: 494, size: 9.5 },
      { page: 0, key: 'insuredRrn2', x: 308, y: 494, size: 9.5 },
      { page: 0, key: 'insuredPhone1', x: 452, y: 494, size: 9.5 },
      { page: 0, key: 'insuredPhone2', x: 492, y: 494, size: 9.5 },
      { page: 0, key: 'insuredPhone3', x: 533, y: 494, size: 9.5 },
      { page: 0, key: 'insuredAddress', x: 95, y: 478, size: 9 },
      { page: 0, key: 'insuredJob', x: 445, y: 478, size: 9.5 },
      // 1P 중단: 보험수익자 정보 및 송금계좌 (실측 y=442, 426, 409, 376)
      { page: 0, key: 'beneficiaryName', x: 95, y: 442, size: 10, bold: true },
      { page: 0, key: 'beneficiaryRrn1', x: 438, y: 442, size: 9.5 },
      { page: 0, key: 'beneficiaryRrn2', x: 496, y: 442, size: 9.5 },
      { page: 0, key: 'beneficiaryPhone1', x: 434, y: 426, size: 9.5 },
      { page: 0, key: 'beneficiaryPhone2', x: 474, y: 426, size: 9.5 },
      { page: 0, key: 'beneficiaryPhone3', x: 520, y: 426, size: 9.5 },
      { page: 0, key: 'beneficiaryAddress', x: 95, y: 409, size: 9 },
      { page: 0, key: 'bankName', x: 155, y: 376, size: 10 },
      { page: 0, key: 'accountNumber', x: 308, y: 376, size: 10 },
      { page: 0, key: 'beneficiaryName', x: 475, y: 376, size: 10 },
      // 1P 하단: 청구자 정보 및 작성일 (실측 y=123, 102)
      { page: 0, key: 'claimantName', x: 82, y: 123, size: 10, bold: true },
      { page: 0, key: 'relSelf', x: 222, y: 123, size: 9.5 },
      { page: 0, key: 'beneficiaryRrn1', x: 318, y: 123, size: 9 },
      { page: 0, key: 'beneficiaryRrn2', x: 372, y: 123, size: 9 },
      { page: 0, key: 'beneficiaryPhone1', x: 458, y: 123, size: 9 },
      { page: 0, key: 'beneficiaryPhone2', x: 492, y: 123, size: 9 },
      { page: 0, key: 'beneficiaryPhone3', x: 528, y: 123, size: 9 },
      { page: 0, key: 'todayYearShort', x: 248, y: 102, size: 10 },
      { page: 0, key: 'todayMonth', x: 305, y: 102, size: 10 },
      { page: 0, key: 'todayDay', x: 358, y: 102, size: 10 },
      // 4P(동의서 마지막장): 동의일 및 피보험자/수익자/법정대리인 성명 (실측 y=250, 214, 187)
      { page: 3, key: 'todayYearShort', x: 225, y: 250, size: 10 },
      { page: 3, key: 'todayMonth', x: 278, y: 250, size: 10 },
      { page: 3, key: 'todayDay', x: 322, y: 250, size: 10 },
      { page: 3, key: 'insuredName', cond: (d) => !d.isUnder14, x: 82, y: 214, size: 10, bold: true },
      { page: 3, key: 'beneficiaryName', cond: (d) => !d.isSameInsBen && !d.isUnder14, x: 82, y: 187, size: 10, bold: true },
      { page: 3, key: 'guardianName19', cond: (d) => d.isUnder19, x: 212, y: 214, size: 10, bold: true }
    ],
    checks: [
      // 1P: 발생원인(질병/재해), 청구사유, 의료급여(N), 자동이체, 문자안내
      { page: 0, cond: (d) => d.accidentType === '질병', x: 96, y: 686 },
      { page: 0, cond: (d) => d.accidentType !== '질병', x: 270, y: 686 },
      { page: 0, cond: (d) => d.coverages.includes('장해'), x: 128, y: 672 },
      { page: 0, cond: (d) => d.coverages.includes('진단'), x: 160, y: 672 },
      { page: 0, cond: (d) => d.coverages.includes('입원'), x: 192, y: 672 },
      { page: 0, cond: (d) => d.coverages.includes('수술'), x: 224, y: 672 },
      { page: 0, cond: (d) => d.coverages.includes('통원'), x: 256, y: 672 },
      { page: 0, cond: (d) => d.coverages.includes('실손의료비'), x: 288, y: 672 },
      { page: 0, cond: () => true, x: 272, y: 574 },
      { page: 0, cond: (d) => d.useAutoTransfer, x: 101, y: 394 },
      { page: 0, cond: (d) => d.notifyCustomer, x: 432, y: 338 },
      // 2P(동의서 1): 동의함 3곳 (실측 x=500, y=553, 498, 404)
      { page: 1, cond: () => true, x: 500, y: 553 },
      { page: 1, cond: () => true, x: 500, y: 498 },
      { page: 1, cond: () => true, x: 500, y: 404 },
      // 3P(동의서 2): 국내/국외 제공 동의함 5곳 (실측 x=500, y=747, 671, 569, 170, 89)
      { page: 2, cond: () => true, x: 500, y: 747 },
      { page: 2, cond: () => true, x: 500, y: 671 },
      { page: 2, cond: () => true, x: 500, y: 569 },
      { page: 2, cond: () => true, x: 498, y: 170 },
      { page: 2, cond: () => true, x: 498, y: 89 },
      // 4P(동의서 3): 조회 동의함 3곳 (실측 x=500, y=521, 456, 340)
      { page: 3, cond: () => true, x: 500, y: 521 },
      { page: 3, cond: () => true, x: 500, y: 456 },
      { page: 3, cond: () => true, x: 500, y: 340 }
    ],
    signatures: [
      { page: 0, role: 'beneficiary', x: 138, y: 123, w: 45, h: 20 },
      { page: 3, role: 'insured', cond: (d) => !d.isUnder14, x: 122, y: 214, w: 45, h: 20 },
      { page: 3, role: 'beneficiary', cond: (d) => !d.isSameInsBen && !d.isUnder14, x: 122, y: 187, w: 45, h: 20 },
      { page: 3, role: 'guardian', cond: (d) => d.isUnder19, x: 252, y: 214, w: 45, h: 20 },
      { page: 3, role: 'guardian', cond: (d) => d.isUnder19, x: 495, y: 187, w: 45, h: 20 }
    ]
  },

  // ==================== [6. KB라이프생명] (KB생명 보험금청구서.pdf) ====================
  kb_life: {
    fields: [
      // 1P 상단: 초진병원명, 최초진료일, 사고일시, 장소, 사고내용 상세(진단명 포함) (실측 y=664, 636, 622)
      { page: 0, key: 'hospitalName', x: 295, y: 664, size: 9.5 },
      { page: 0, key: 'accYear', x: 465, y: 664, size: 9 },
      { page: 0, key: 'accMonth', x: 512, y: 664, size: 9 },
      { page: 0, key: 'accDay', x: 545, y: 664, size: 9 },
      { page: 0, key: 'accYear', x: 140, y: 636, size: 9.5 },
      { page: 0, key: 'accMonth', x: 192, y: 636, size: 9.5 },
      { page: 0, key: 'accDay', x: 228, y: 636, size: 9.5 },
      { page: 0, key: 'accidentPlace', x: 392, y: 636, size: 9.5 },
      { page: 0, key: 'descWithDiag', x: 132, y: 622, size: 9.5 },
      // 1P 중단: 피보험자 및 수익자 인적사항 (실측 y=510, 495, 478, 422, 408)
      { page: 0, key: 'insuredName', x: 130, y: 510, size: 10, bold: true },
      { page: 0, key: 'insuredRrnFull', x: 255, y: 510, size: 9.5 },
      { page: 0, key: 'insuredPhone', x: 380, y: 510, size: 9 },
      { page: 0, key: 'insuredJob', x: 492, y: 510, size: 9 },
      { page: 0, key: 'beneficiaryName', x: 130, y: 495, size: 10, bold: true },
      { page: 0, key: 'beneficiaryRrnFull', x: 255, y: 495, size: 9.5 },
      { page: 0, key: 'beneficiaryPhone', x: 380, y: 495, size: 9 },
      { page: 0, key: 'relSelf', x: 140, y: 478, size: 9.5 },
      { page: 0, key: 'beneficiaryJob', x: 255, y: 478, size: 9 },
      { page: 0, key: 'beneficiaryAddress', x: 205, y: 422, size: 9 },
      { page: 0, key: 'bankName', x: 165, y: 408, size: 10 },
      { page: 0, key: 'accountNumber', x: 330, y: 408, size: 10 },
      { page: 0, key: 'beneficiaryName', x: 498, y: 408, size: 10 },
      // 1P 하단: 작성일 및 수익자/법정대리인(부·모 자동판별) 성명 (실측 y=177, 151)
      { page: 0, key: 'todayYear', x: 195, y: 177, size: 10 },
      { page: 0, key: 'todayMonth', x: 265, y: 177, size: 10 },
      { page: 0, key: 'todayDay', x: 320, y: 177, size: 10 },
      { page: 0, key: 'beneficiaryName', x: 115, y: 151, size: 10, bold: true },
      { page: 0, key: 'guardianName19', cond: (d) => d.isUnder19 && d.guardianRel !== '모', x: 358, y: 151, size: 9.5, bold: true },
      { page: 0, key: 'guardianName19', cond: (d) => d.isUnder19 && d.guardianRel === '모', x: 478, y: 151, size: 9.5, bold: true },
      // 4P(동의서 3/3): 동의일자 및 표 형태 성명란 (실측 y=212, 179, 163)
      { page: 3, key: 'todayYear', x: 438, y: 212, size: 10 },
      { page: 3, key: 'todayMonth', x: 502, y: 212, size: 10 },
      { page: 3, key: 'todayDay', x: 548, y: 212, size: 10 },
      { page: 3, key: 'insuredName', cond: (d) => !d.isUnder14, x: 152, y: 179, size: 10, bold: true },
      { page: 3, key: 'beneficiaryName', cond: (d) => !d.isSameInsBen || !d.isUnder14, x: 152, y: 163, size: 10, bold: true },
      { page: 3, key: 'guardianName19', cond: (d) => d.isUnder19, x: 430, y: 179, size: 10, bold: true }
    ],
    checks: [
      // 1P: 청구사유, 발생원인, 피보험자=수익자 동일, 실제소유자 '예', 자택주소, 알림톡 안내
      { page: 0, cond: (d) => d.coverages.includes('수술'), x: 91, y: 679 },
      { page: 0, cond: (d) => d.coverages.includes('입원'), x: 121, y: 679 },
      { page: 0, cond: (d) => d.coverages.includes('장해'), x: 215, y: 679 },
      { page: 0, cond: (d) => d.coverages.includes('진단'), x: 292, y: 679 },
      { page: 0, cond: (d) => d.coverages.includes('통원'), x: 382, y: 679 },
      { page: 0, cond: (d) => d.coverages.includes('실손의료비'), x: 412, y: 679 },
      { page: 0, cond: (d) => d.accidentType === '질병', x: 91, y: 665 },
      { page: 0, cond: (d) => d.accidentType === '상해', x: 122, y: 665 },
      { page: 0, cond: (d) => d.accidentType === '교통사고', x: 168, y: 665 },
      { page: 0, cond: (d) => d.isSameInsBen, x: 350, y: 554 },
      { page: 0, cond: () => true, x: 382, y: 478 },
      { page: 0, cond: () => true, x: 130, y: 422 },
      { page: 0, cond: (d) => d.notifyCustomer, x: 132, y: 371 },
      // 2P(동의서 1/3): 동의함 3곳 (실측 x=535, y=417, 336, 231)
      { page: 1, cond: () => true, x: 535, y: 417 },
      { page: 1, cond: () => true, x: 535, y: 336 },
      { page: 1, cond: () => true, x: 535, y: 231 },
      // 3P(동의서 2/3): 동의함 3곳 (실측 x=535, y=499, 427, 330)
      { page: 2, cond: () => true, x: 535, y: 499 },
      { page: 2, cond: () => true, x: 535, y: 427 },
      { page: 2, cond: () => true, x: 535, y: 330 },
      // 4P(동의서 3/3): 국외제공·조회 동의함 5곳 (실측 x=535, y=671, 578, 354, 310, 234)
      { page: 3, cond: () => true, x: 535, y: 671 },
      { page: 3, cond: () => true, x: 535, y: 578 },
      { page: 3, cond: () => true, x: 535, y: 354 },
      { page: 3, cond: () => true, x: 535, y: 310 },
      { page: 3, cond: () => true, x: 535, y: 234 }
    ],
    signatures: [
      { page: 0, role: 'beneficiary', x: 205, y: 151, w: 48, h: 18 },
      { page: 0, role: 'guardian', cond: (d) => d.isUnder19 && d.guardianRel !== '모', x: 405, y: 151, w: 45, h: 18 },
      { page: 0, role: 'guardian', cond: (d) => d.isUnder19 && d.guardianRel === '모', x: 528, y: 151, w: 45, h: 18 },
      { page: 3, role: 'insured', cond: (d) => !d.isUnder14, x: 245, y: 179, w: 48, h: 18 },
      { page: 3, role: 'beneficiary', cond: (d) => !d.isSameInsBen || !d.isUnder14, x: 245, y: 163, w: 48, h: 18 },
      { page: 3, role: 'guardian', cond: (d) => d.isUnder19, x: 522, y: 179, w: 48, h: 18 }
    ]
  },

  // ==================== [7. KDB생명] (kdb생명 보험금청구서.pdf) ====================
  kdb_life: {
    fields: [
      // 1P 상단: 피보험자 및 수익자 인적사항 (실측 y=735, 709, 684, 659, 605, 584)
      { page: 0, key: 'insuredName', x: 145, y: 735, size: 10, bold: true },
      { page: 0, key: 'insuredRrnFull', x: 295, y: 735, size: 10 },
      { page: 0, key: 'insuredPhone', x: 445, y: 735, size: 9.5 },
      { page: 0, key: 'insuredJob', x: 155, y: 709, size: 9.5 },
      { page: 0, key: 'beneficiaryName', x: 145, y: 684, size: 10, bold: true },
      { page: 0, key: 'beneficiaryRrnFull', x: 295, y: 684, size: 10 },
      { page: 0, key: 'beneficiaryPhone', x: 445, y: 684, size: 9.5 },
      { page: 0, key: 'beneficiaryAddress', x: 145, y: 659, size: 9 },
      { page: 0, key: 'beneficiaryJob', x: 195, y: 605, size: 9.5 },
      { page: 0, key: 'bankName', x: 135, y: 584, size: 10 },
      { page: 0, key: 'beneficiaryName', x: 245, y: 584, size: 10 },
      { page: 0, key: 'accountNumber', x: 358, y: 584, size: 10 },
      // 1P 중단: 사고일시, 장소, 경위, 병명 (실측 y=398, 380, 323)
      { page: 0, key: 'accYearShort', x: 170, y: 398, size: 10 },
      { page: 0, key: 'accMonth', x: 212, y: 398, size: 10 },
      { page: 0, key: 'accDay', x: 245, y: 398, size: 10 },
      { page: 0, key: 'accidentPlace', x: 380, y: 398, size: 9.5 },
      { page: 0, key: 'accidentDesc', x: 152, y: 380, size: 9.5 },
      { page: 0, key: 'diagnosisName', x: 168, y: 323, size: 9.5, bold: true },
      // 1P 하단: 필수안내 확인서명(y=180) 및 청구인 작성란(y=101, 83)
      { page: 0, key: 'beneficiaryName', x: 455, y: 180, size: 10, bold: true },
      { page: 0, key: 'claimantName', x: 96, y: 101, size: 9.5, bold: true },
      { page: 0, key: 'relSelf', x: 258, y: 101, size: 9.5 },
      { page: 0, key: 'beneficiaryRrn1', x: 372, y: 101, size: 9 },
      { page: 0, key: 'beneficiaryRrn2', x: 422, y: 101, size: 9 },
      { page: 0, key: 'beneficiaryPhone', x: 502, y: 101, size: 8.5 },
      { page: 0, key: 'todayDateSlash', x: 85, y: 83, size: 9.5 },
      // 5P(동의서 4/4): 피보험자/수익자/청구자/법정대리인 성명 및 날짜 (실측 y=318, 292, 267, 146)
      { page: 4, key: 'insuredName', cond: (d) => !d.isUnder14, x: 155, y: 318, size: 10, bold: true },
      { page: 4, key: 'beneficiaryName', cond: (d) => !d.isSameInsBen && !d.isUnder14, x: 155, y: 292, size: 10, bold: true },
      { page: 4, key: 'claimantName', x: 155, y: 267, size: 10, bold: true },
      { page: 4, key: 'guardianName19', cond: (d) => d.isUnder19, x: 418, y: 312, size: 10, bold: true },
      { page: 4, key: 'todayYear', x: 205, y: 146, size: 10 },
      { page: 4, key: 'todayMonth', x: 282, y: 146, size: 10 },
      { page: 4, key: 'todayDay', x: 338, y: 146, size: 10 }
    ],
    checks: [
      // 1P: 의료수급권자(비대상), 안내방법(문자), 청구유형, 청구사유, 일부청구(아니오)
      { page: 0, cond: () => true, x: 342, y: 709 },
      { page: 0, cond: (d) => d.notifyCustomer, x: 100, y: 510 },
      { page: 0, cond: (d) => d.notifyCustomer, x: 394, y: 510 },
      { page: 0, cond: (d) => d.accidentType === '질병', x: 98, y: 436 },
      { page: 0, cond: (d) => d.accidentType !== '질병', x: 240, y: 436 },
      { page: 0, cond: (d) => d.coverages.includes('장해'), x: 130, y: 417 },
      { page: 0, cond: (d) => d.coverages.includes('진단'), x: 162, y: 417 },
      { page: 0, cond: (d) => d.coverages.includes('수술'), x: 194, y: 417 },
      { page: 0, cond: (d) => d.coverages.includes('입원'), x: 225, y: 417 },
      { page: 0, cond: (d) => d.coverages.includes('통원'), x: 257, y: 417 },
      { page: 0, cond: (d) => d.coverages.includes('실손의료비'), x: 397, y: 417 },
      { page: 0, cond: () => true, x: 137, y: 285 },
      // 2P(동의서 1/4): 동의함 3곳 (실측 x=506, y=426, 347, 255)
      { page: 1, cond: () => true, x: 506, y: 426 },
      { page: 1, cond: () => true, x: 506, y: 347 },
      { page: 1, cond: () => true, x: 506, y: 255 },
      // 3P(동의서 2/4): 동의함 3곳 (실측 x=506, y=383, 294, 202)
      { page: 2, cond: () => true, x: 506, y: 383 },
      { page: 2, cond: () => true, x: 506, y: 294 },
      { page: 2, cond: () => true, x: 506, y: 202 },
      // 4P(동의서 3/4): 국외제공 동의함 2곳 (실측 x=506, y=203, 112)
      { page: 3, cond: () => true, x: 506, y: 203 },
      { page: 3, cond: () => true, x: 506, y: 112 },
      // 5P(동의서 4/4): 조회 동의함 3곳 (실측 x=506, y=508, 458, 367)
      { page: 4, cond: () => true, x: 506, y: 508 },
      { page: 4, cond: () => true, x: 506, y: 458 },
      { page: 4, cond: () => true, x: 506, y: 367 }
    ],
    signatures: [
      { page: 0, role: 'beneficiary', x: 515, y: 180, w: 45, h: 18 },
      { page: 0, role: 'beneficiary', x: 145, y: 101, w: 42, h: 18 },
      { page: 4, role: 'insured', cond: (d) => !d.isUnder14, x: 245, y: 318, w: 48, h: 18 },
      { page: 4, role: 'beneficiary', cond: (d) => !d.isSameInsBen && !d.isUnder14, x: 245, y: 292, w: 48, h: 18 },
      { page: 4, role: 'beneficiary', x: 245, y: 267, w: 48, h: 18 },
      { page: 4, role: 'guardian', cond: (d) => d.isUnder19, x: 515, y: 312, w: 48, h: 18 }
    ]
  },

  // ==================== [8. 교보생명] (교보생명 보험금청구서.pdf) ====================
  kyobo_life: {
    fields: [
      // 1P: 피보험자 및 수익자 인적사항 (실측 y=746, 698, 674)
      { page: 0, key: 'insuredName', x: 105, y: 746, size: 10, bold: true },
      { page: 0, key: 'insuredRrnFull', x: 222, y: 746, size: 10 },
      { page: 0, key: 'insuredPhone', x: 365, y: 746, size: 9.5 },
      { page: 0, key: 'beneficiaryName', x: 105, y: 698, size: 10, bold: true },
      { page: 0, key: 'beneficiaryRrnFull', x: 222, y: 698, size: 10 },
      { page: 0, key: 'beneficiaryPhone', x: 365, y: 698, size: 9.5 },
      { page: 0, key: 'beneficiaryAddress', x: 105, y: 674, size: 9 },
      // 1P: 사고일시, 장소, 경위, 병명 (실측 y=554, 525, 500)
      { page: 0, key: 'accYear', x: 128, y: 554, size: 9.5 },
      { page: 0, key: 'accMonth', x: 178, y: 554, size: 9.5 },
      { page: 0, key: 'accDay', x: 215, y: 554, size: 9.5 },
      { page: 0, key: 'accidentPlace', x: 360, y: 554, size: 9.5 },
      { page: 0, key: 'accidentDesc', x: 215, y: 539, size: 9.5 },
      { page: 0, key: 'diagnosisName', x: 312, y: 500, size: 9.5, bold: true },
      // 1P: 입금계좌 및 하단 수익자(청구자) 성명 (실측 y=412, 134)
      { page: 0, key: 'bankName', x: 148, y: 412, size: 10 },
      { page: 0, key: 'accountNumber', x: 292, y: 412, size: 10 },
      { page: 0, key: 'beneficiaryName', x: 472, y: 412, size: 10 },
      { page: 0, key: 'claimantName', x: 402, y: 134, size: 10, bold: true },
      // 수익자 본인이 아닌 타인/미성년 청구 시 하단 [청구자 정보] 보조 기입
      { page: 0, key: 'beneficiaryRrnFull', cond: (d) => !d.isSameInsBen || d.isUnder19, x: 340, y: 82, size: 9 },
      { page: 0, key: 'relIfDiff', cond: (d) => !d.isSameInsBen || d.isUnder19, x: 495, y: 82, size: 9.5 },
      { page: 0, key: 'beneficiaryPhone', cond: (d) => !d.isSameInsBen || d.isUnder19, x: 340, y: 58, size: 9 },
      // 5P(동의서 4/4): 동의일자 및 피보험자/수익자/친권자 성명 (실측 y=144, 108, 79)
      { page: 4, key: 'todayYearShort', x: 256, y: 144, size: 10 },
      { page: 4, key: 'todayMonth', x: 298, y: 144, size: 10 },
      { page: 4, key: 'todayDay', x: 335, y: 144, size: 10 },
      { page: 4, key: 'insuredName', cond: (d) => !d.isUnder14, x: 222, y: 108, size: 10, bold: true },
      { page: 4, key: 'beneficiaryName', cond: (d) => !d.isSameInsBen && !d.isUnder14, x: 222, y: 79, size: 10, bold: true },
      { page: 4, key: 'guardianName19', cond: (d) => d.isUnder19, x: 432, y: 108, size: 10, bold: true }
    ],
    checks: [
      // 1P: 의료급여(아니오), 청구내용(담보/원인), 미청구보험금(아니오), 문자안내, 필수확인 체크
      { page: 0, cond: () => true, x: 242, y: 722 },
      { page: 0, cond: (d) => d.coverages.includes('실손의료비'), x: 76, y: 623 },
      { page: 0, cond: (d) => d.coverages.includes('입원'), x: 158, y: 623 },
      { page: 0, cond: (d) => d.coverages.includes('통원'), x: 215, y: 623 },
      { page: 0, cond: (d) => d.coverages.includes('수술'), x: 273, y: 623 },
      { page: 0, cond: (d) => d.coverages.includes('진단'), x: 331, y: 623 },
      { page: 0, cond: (d) => d.coverages.includes('장해'), x: 389, y: 623 },
      { page: 0, cond: (d) => d.accidentType === '질병', x: 76, y: 600 },
      { page: 0, cond: (d) => d.accidentType !== '질병', x: 135, y: 600 },
      { page: 0, cond: () => true, x: 500, y: 465 },
      { page: 0, cond: (d) => d.notifyCustomer, x: 108, y: 334 },
      { page: 0, cond: () => true, x: 542, y: 234 }, // 4. 필수확인사항 '확인' 체크박스
      // 2P(동의서 1/4): ①~③ 동의함 (실측 x=503, y=337, 218, 42)
      { page: 1, cond: () => true, x: 503, y: 337 },
      { page: 1, cond: () => true, x: 503, y: 218 },
      { page: 1, cond: () => true, x: 503, y: 42 },
      // 3P(동의서 2/4): ④~⑥ 동의함 (실측 x=503, y=309, 204, 63)
      { page: 2, cond: () => true, x: 503, y: 309 },
      { page: 2, cond: () => true, x: 503, y: 204 },
      { page: 2, cond: () => true, x: 503, y: 63 },
      // 4P(동의서 3/4): ⑦~⑧ 동의함 (실측 x=503, y=318, 162)
      { page: 3, cond: () => true, x: 503, y: 318 },
      { page: 3, cond: () => true, x: 503, y: 162 },
      // 5P(동의서 4/4): ⑨~⑪ 동의함 (실측 x=503, y=471, 382, 214)
      { page: 4, cond: () => true, x: 503, y: 471 },
      { page: 4, cond: () => true, x: 503, y: 382 },
      { page: 4, cond: () => true, x: 503, y: 214 }
    ],
    signatures: [
      { page: 0, role: 'beneficiary', x: 485, y: 134, w: 50, h: 20 },
      { page: 4, role: 'insured', cond: (d) => !d.isUnder14, x: 315, y: 108, w: 45, h: 18 },
      { page: 4, role: 'beneficiary', cond: (d) => !d.isSameInsBen && !d.isUnder14, x: 315, y: 79, w: 45, h: 18 },
      { page: 4, role: 'guardian', cond: (d) => d.isUnder19, x: 528, y: 108, w: 45, h: 18 }
    ]
  },

  // ==================== [9. NH농협생명] (농협생명 보험금청구서.pdf) ====================
  nh_life: {
    fields: [
      // 1P 상단: 피보험자 인적사항 (실측 y=743)
      { page: 0, key: 'insuredName', x: 112, y: 743, size: 10, bold: true },
      { page: 0, key: 'insuredRrnFull', x: 235, y: 743, size: 9.5 },
      { page: 0, key: 'insuredPhone', x: 378, y: 743, size: 9.5 },
      { page: 0, key: 'insuredJob', x: 518, y: 743, size: 9 },
      // 1P 상단: 사고일시, 장소, 경위, 치료병명 (실측 y=672, 659, 607)
      { page: 0, key: 'accYear', x: 185, y: 672, size: 9.5 },
      { page: 0, key: 'accMonth', x: 238, y: 672, size: 9.5 },
      { page: 0, key: 'accDay', x: 268, y: 672, size: 9.5 },
      { page: 0, key: 'accidentPlace', x: 382, y: 672, size: 9.5 },
      { page: 0, key: 'accidentDesc', x: 235, y: 659, size: 9.5 },
      { page: 0, key: 'diagnosisName', x: 252, y: 607, size: 9.5, bold: true },
      // 1P 중단: 수익자 정보 및 수령계좌 (실측 y=564, 542, 468)
      { page: 0, key: 'beneficiaryName', x: 112, y: 564, size: 10, bold: true },
      { page: 0, key: 'beneficiaryRrnFull', x: 235, y: 564, size: 9.5 },
      { page: 0, key: 'beneficiaryPhone', x: 378, y: 564, size: 9.5 },
      { page: 0, key: 'beneficiaryJob', x: 518, y: 564, size: 9 },
      { page: 0, key: 'beneficiaryAddress', x: 112, y: 542, size: 9 },
      { page: 0, key: 'relSelf', x: 530, y: 542, size: 9.5 },
      { page: 0, key: 'bankName', x: 162, y: 468, size: 10 },
      { page: 0, key: 'beneficiaryName', x: 305, y: 468, size: 10 },
      { page: 0, key: 'accountNumber', x: 452, y: 468, size: 10 },
      // 1P 하단: 청구일 및 수익자(미성년 시 대표친권자) 성명 (실측 y=160)
      { page: 0, key: 'todayYear', x: 138, y: 160, size: 10 },
      { page: 0, key: 'todayMonth', x: 198, y: 160, size: 10 },
      { page: 0, key: 'todayDay', x: 245, y: 160, size: 10 },
      { page: 0, key: 'claimantName', x: 375, y: 160, size: 10, bold: true },
      // 4P(동의서 3/3): 필수기재 날짜 및 피보험자/수익자/친권자 성명 (실측 y=177, 138)
      { page: 3, key: 'todayYear', x: 235, y: 177, size: 10 },
      { page: 3, key: 'todayMonth', x: 292, y: 177, size: 10 },
      { page: 3, key: 'todayDay', x: 342, y: 177, size: 10 },
      { page: 3, key: 'insuredName', cond: (d) => !d.isUnder14, x: 105, y: 138, size: 10, bold: true },
      { page: 3, key: 'beneficiaryName', cond: (d) => !d.isSameInsBen && !d.isUnder14, x: 280, y: 138, size: 10, bold: true },
      { page: 3, key: 'guardianName', cond: (d) => d.isUnder14, x: 458, y: 145, size: 10, bold: true }
    ],
    checks: [
      // 1P: 사고유형, 청구유형, 자보처리(아니오), 의료수급권자(아니오), 실제소유자(여), 일시금, 안내신청
      { page: 0, cond: (d) => d.accidentType === '질병', x: 123, y: 727 },
      { page: 0, cond: (d) => d.accidentType !== '질병', x: 305, y: 727 },
      { page: 0, cond: (d) => d.coverages.includes('장해'), x: 162, y: 709 },
      { page: 0, cond: (d) => d.coverages.includes('진단'), x: 201, y: 709 },
      { page: 0, cond: (d) => d.coverages.includes('수술'), x: 239, y: 709 },
      { page: 0, cond: (d) => d.coverages.includes('입원'), x: 278, y: 709 },
      { page: 0, cond: (d) => d.coverages.includes('통원'), x: 316, y: 709 },
      { page: 0, cond: (d) => d.coverages.includes('실손의료비'), x: 355, y: 709 },
      { page: 0, cond: () => true, x: 531, y: 659 },
      { page: 0, cond: () => true, x: 531, y: 628 },
      { page: 0, cond: () => true, x: 531, y: 514 }, // 실제소유자 '여'
      { page: 0, cond: () => true, x: 134, y: 415 }, // 보험금 수령방법 '일시금'
      { page: 0, cond: (d) => d.notifyCustomer, x: 123, y: 334 },
      { page: 0, cond: (d) => d.notifyCustomer, x: 380, y: 334 },
      { page: 0, cond: (d) => d.notifyPlanner, x: 531, y: 334 },
      // 2P(동의서 1/3): 필수체크 □ 동의함 (실측 x=438, y=362, 237, 101)
      { page: 1, cond: () => true, x: 438, y: 362 },
      { page: 1, cond: () => true, x: 438, y: 237 },
      { page: 1, cond: () => true, x: 438, y: 101 },
      // 3P(동의서 2/3): 필수체크 □ 동의함 (실측 x=438, y=288, 198, 96)
      { page: 2, cond: () => true, x: 438, y: 288 },
      { page: 2, cond: () => true, x: 438, y: 198 },
      { page: 2, cond: () => true, x: 438, y: 96 },
      // 4P(동의서 3/3): 필수체크 □ 동의함 (실측 x=435, y=443, 352, 216)
      { page: 3, cond: () => true, x: 435, y: 443 },
      { page: 3, cond: () => true, x: 435, y: 352 },
      { page: 3, cond: () => true, x: 435, y: 216 }
    ],
    signatures: [
      { page: 0, role: 'beneficiary', x: 515, y: 160, w: 48, h: 18 },
      { page: 3, role: 'insured', cond: (d) => !d.isUnder14, x: 155, y: 138, w: 45, h: 18 },
      { page: 3, role: 'beneficiary', cond: (d) => !d.isSameInsBen && !d.isUnder14, x: 330, y: 138, w: 45, h: 18 },
      { page: 3, role: 'guardian', cond: (d) => d.isUnder14, x: 508, y: 145, w: 45, h: 18 }
    ]
  },

  // ==================== [10. 동양생명] (동양생명 보험금청구서.pdf) ====================
  tongyang_life: {
    fields: [
      // 1P 상단: 피보험자 인적사항 (실측 y=705, 685)
      { page: 0, key: 'insuredName', x: 82, y: 705, size: 10, bold: true },
      { page: 0, key: 'insuredRrn1', x: 222, y: 705, size: 9.5 },
      { page: 0, key: 'insuredRrn2', x: 262, y: 705, size: 9.5 },
      { page: 0, key: 'insuredPhone', x: 452, y: 705, size: 9.5 },
      { page: 0, key: 'insuredJob', x: 225, y: 685, size: 9.5 },
      // 1P 중단: 수익자 정보 및 입금계좌 (실측 y=642, 627, 612, 589, 537)
      { page: 0, key: 'beneficiaryName', x: 115, y: 642, size: 10, bold: true },
      { page: 0, key: 'beneficiaryRrn1', x: 268, y: 642, size: 9.5 },
      { page: 0, key: 'beneficiaryRrn2', x: 316, y: 642, size: 9.5 },
      { page: 0, key: 'relSelf', x: 438, y: 642, size: 9.5 },
      { page: 0, key: 'beneficiaryPhone', x: 118, y: 627, size: 9.5 },
      { page: 0, key: 'beneficiaryAddress', x: 118, y: 612, size: 9 },
      { page: 0, key: 'bankName', x: 180, y: 589, size: 9.5 },
      { page: 0, key: 'accountNumber', x: 325, y: 589, size: 9.5 },
      { page: 0, key: 'beneficiaryName', x: 505, y: 589, size: 9.5 },
      { page: 0, key: 'beneficiaryJob', x: 435, y: 537, size: 9.5 },
      // 1P 하단: 사고일시, 장소, 경위, 병명 (실측 y=346, 335, 321)
      { page: 0, key: 'accYear', x: 192, y: 346, size: 9.5 },
      { page: 0, key: 'accMonth', x: 246, y: 346, size: 9.5 },
      { page: 0, key: 'accDay', x: 285, y: 346, size: 9.5 },
      { page: 0, key: 'accidentPlace', x: 398, y: 346, size: 9.5 },
      { page: 0, key: 'accidentDesc', x: 192, y: 335, size: 9.5 },
      { page: 0, key: 'diagnosisName', x: 425, y: 335, size: 9.5, bold: true },
      { page: 0, key: 'diagnosisName', x: 168, y: 321, size: 9.5 },
      // 1P 최하단: 접수일자 및 청구인(수익자) 성명 (실측 y=186)
      { page: 0, key: 'todayYearShort', x: 162, y: 186, size: 10 },
      { page: 0, key: 'todayMonth', x: 198, y: 186, size: 10 },
      { page: 0, key: 'todayDay', x: 232, y: 186, size: 10 },
      { page: 0, key: 'claimantName', x: 365, y: 186, size: 10, bold: true },
      // 5P(동의서 4/4): 피보험자/수익자/친권자 성명 및 날짜 (실측 y=167, 139, 96)
      { page: 4, key: 'insuredName', cond: (d) => !d.isUnder14, x: 118, y: 167, size: 10, bold: true },
      { page: 4, key: 'beneficiaryName', cond: (d) => !d.isSameInsBen && !d.isUnder14, x: 118, y: 139, size: 10, bold: true },
      { page: 4, key: 'guardianName19', cond: (d) => d.isUnder19, x: 382, y: 167, size: 10, bold: true },
      { page: 4, key: 'todayYear', x: 182, y: 96, size: 10 },
      { page: 4, key: 'todayMonth', x: 268, y: 96, size: 10 },
      { page: 4, key: 'todayDay', x: 342, y: 96, size: 10 }
    ],
    checks: [
      // 1P: 안내신청, 일시금, 실제소유자(예), 국내거주(거주), FC안내, 발생원인, 청구사유, 의료급여(아니오), 확인체크
      { page: 0, cond: (d) => d.notifyCustomer, x: 503, y: 691 },
      { page: 0, cond: (d) => d.notifyCustomer, x: 503, y: 681 },
      { page: 0, cond: () => true, x: 433, y: 608 },
      { page: 0, cond: () => true, x: 238, y: 563 }, // 실제소유자 '예'
      { page: 0, cond: () => true, x: 438, y: 563 }, // 국내거주 '거주'
      { page: 0, cond: (d) => d.notifyCustomer, x: 205, y: 492 },
      { page: 0, cond: (d) => d.notifyCustomer, x: 455, y: 492 },
      { page: 0, cond: (d) => d.notifyPlanner, x: 420, y: 472 },
      { page: 0, cond: (d) => d.accidentType === '질병', x: 114, y: 392 },
      { page: 0, cond: (d) => d.accidentType === '상해', x: 266, y: 392 },
      { page: 0, cond: (d) => d.accidentType === '교통사고', x: 436, y: 392 },
      { page: 0, cond: (d) => d.coverages.includes('입원'), x: 114, y: 376 },
      { page: 0, cond: (d) => d.coverages.includes('수술'), x: 156, y: 376 },
      { page: 0, cond: (d) => d.coverages.includes('진단'), x: 198, y: 376 },
      { page: 0, cond: (d) => d.coverages.includes('장해'), x: 240, y: 376 },
      { page: 0, cond: (d) => d.coverages.includes('통원'), x: 365, y: 376 },
      { page: 0, cond: (d) => d.coverages.includes('실손의료비'), x: 407, y: 376 },
      { page: 0, cond: () => true, x: 512, y: 315 }, // 의료급여 아니오
      { page: 0, cond: () => true, x: 525, y: 243 }, // 상기내용을 확인하였습니다
      // 2P(동의서 1): '동의' 체크 (실측 x=316, y=358, 236, 85)
      { page: 1, cond: () => true, x: 316, y: 358 },
      { page: 1, cond: () => true, x: 316, y: 236 },
      { page: 1, cond: () => true, x: 316, y: 85 },
      // 3P(동의서 2): '동의' 체크 (실측 x=316, y=314, 214, 84)
      { page: 2, cond: () => true, x: 316, y: 314 },
      { page: 2, cond: () => true, x: 316, y: 214 },
      { page: 2, cond: () => true, x: 316, y: 84 },
      // 4P(동의서 3): '동의' 체크 (실측 x=316, y=246, 104)
      { page: 3, cond: () => true, x: 316, y: 246 },
      { page: 3, cond: () => true, x: 316, y: 104 },
      // 5P(동의서 4): '동의' 체크 (실측 x=316, y=532, 421, 285)
      { page: 4, cond: () => true, x: 316, y: 532 },
      { page: 4, cond: () => true, x: 316, y: 421 },
      { page: 4, cond: () => true, x: 316, y: 285 }
    ],
    signatures: [
      { page: 0, role: 'beneficiary', x: 465, y: 186, w: 48, h: 18 },
      { page: 4, role: 'insured', cond: (d) => !d.isUnder14, x: 190, y: 167, w: 45, h: 18 },
      { page: 4, role: 'beneficiary', cond: (d) => !d.isSameInsBen && !d.isUnder14, x: 190, y: 139, w: 45, h: 18 },
      { page: 4, role: 'guardian', cond: (d) => d.isUnder19, x: 455, y: 167, w: 45, h: 18 }
    ]
  },

  // ==================== [11. 라이나생명] (라이나생명 보험금청구서.pdf) ====================
  lina_life: {
    fields: [
      // 1P: 피보험자 및 수익자 인적사항 (공식 SAMPLE 역산 좌표: y=659, 598, 576, 552, 503)
      { page: 0, key: 'insuredName', x: 100, y: 659, size: 10, bold: true },
      { page: 0, key: 'insuredRrn1', x: 227, y: 659, size: 10 },
      { page: 0, key: 'insuredRrn2', x: 311, y: 659, size: 10 },
      { page: 0, key: 'insuredPhone1', x: 410, y: 659, size: 9.5 },
      { page: 0, key: 'insuredPhone2', x: 459, y: 659, size: 9.5 },
      { page: 0, key: 'insuredPhone3', x: 518, y: 659, size: 9.5 },
      { page: 0, key: 'beneficiaryName', x: 100, y: 598, size: 10, bold: true },
      { page: 0, key: 'beneficiaryRrn1', x: 225, y: 598, size: 10 },
      { page: 0, key: 'beneficiaryRrn2', x: 309, y: 598, size: 10 },
      { page: 0, key: 'beneficiaryPhone1', x: 410, y: 598, size: 9.5 },
      { page: 0, key: 'beneficiaryPhone2', x: 459, y: 598, size: 9.5 },
      { page: 0, key: 'beneficiaryPhone3', x: 518, y: 598, size: 9.5 },
      { page: 0, key: 'beneficiaryJob', x: 88, y: 576, size: 9.5 },
      { page: 0, key: 'beneficiaryAddress', x: 105, y: 552, size: 9 },
      { page: 0, key: 'relIfDiff', cond: (d) => !d.isSameInsBen, x: 488, y: 538, size: 9.5 },
      { page: 0, key: 'bankName', x: 132, y: 503, size: 10 },
      { page: 0, key: 'accountNumber', x: 255, y: 503, size: 10 },
      // 1P: 사고일시 및 사고경위(병명 포함) (실측 y=314, 295)
      { page: 0, key: 'accYear', x: 175, y: 314, size: 10 },
      { page: 0, key: 'accMonth', x: 242, y: 314, size: 10 },
      { page: 0, key: 'accDay', x: 286, y: 314, size: 10 },
      { page: 0, key: 'descWithDiag', x: 165, y: 295, size: 9.5 },
      // 1P 하단: 작성일 및 피보험자/수익자/친권자 성명 (실측 y=89, 64, 46)
      { page: 0, key: 'todayYear', x: 432, y: 89, size: 10 },
      { page: 0, key: 'todayMonth', x: 485, y: 89, size: 10 },
      { page: 0, key: 'todayDay', x: 525, y: 89, size: 10 },
      { page: 0, key: 'insuredName', cond: (d) => !d.isUnder14, x: 145, y: 64, size: 10, bold: true },
      { page: 0, key: 'beneficiaryName', cond: (d) => !d.isUnder14, x: 145, y: 46, size: 10, bold: true },
      { page: 0, key: 'guardianName19', cond: (d) => d.isUnder19, x: 415, y: 64, size: 10, bold: true },
      // 2P(동의서 1/3): 상단 굵은 박스 피보험자 성명·주민번호 필수 기재란 (실측 y=612)
      { page: 1, key: 'insuredName', x: 145, y: 612, size: 10, bold: true },
      { page: 1, key: 'insuredRrn1', x: 398, y: 612, size: 10 },
      { page: 1, key: 'insuredRrn2', x: 485, y: 612, size: 10 },
      // 4P(동의서 3/3): 동의일 및 피보험자/보험수익자/친권자 성명 (실측 y=160, 110, 85)
      { page: 3, key: 'todayYearShort', x: 235, y: 160, size: 10 },
      { page: 3, key: 'todayMonth', x: 295, y: 160, size: 10 },
      { page: 3, key: 'todayDay', x: 350, y: 160, size: 10 },
      { page: 3, key: 'insuredName', cond: (d) => !d.isUnder14, x: 145, y: 110, size: 10, bold: true },
      { page: 3, key: 'beneficiaryName', cond: (d) => !d.isSameInsBen && !d.isUnder14, x: 145, y: 85, size: 10, bold: true },
      { page: 3, key: 'guardianName19', cond: (d) => d.isUnder19, x: 415, y: 110, size: 10, bold: true }
    ],
    checks: [
      // 1P: 피보험자관계(본인/그외), 실소유주(본인), 문자안내, 유형, 청구유형, 모든유지계약심사, 의료수급(비해당)
      { page: 0, cond: (d) => d.isSameInsBen, x: 407, y: 538 },
      { page: 0, cond: (d) => !d.isSameInsBen, x: 443, y: 538 },
      { page: 0, cond: () => true, x: 407, y: 503 },
      { page: 0, cond: (d) => d.notifyCustomer, x: 158, y: 467 },
      { page: 0, cond: (d) => d.accidentType === '질병', x: 100, y: 359 },
      { page: 0, cond: (d) => d.accidentType !== '질병', x: 266, y: 359 },
      { page: 0, cond: (d) => d.coverages.includes('장해'), x: 142, y: 343 },
      { page: 0, cond: (d) => d.coverages.includes('진단'), x: 185, y: 343 },
      { page: 0, cond: (d) => d.coverages.includes('수술'), x: 295, y: 343 },
      { page: 0, cond: (d) => d.coverages.includes('입원'), x: 338, y: 343 },
      { page: 0, cond: (d) => d.coverages.includes('통원'), x: 382, y: 343 },
      { page: 0, cond: (d) => d.coverages.includes('실손의료비'), x: 425, y: 343 },
      { page: 0, cond: () => true, x: 100, y: 277 }, // 모든 유지계약 심사·지급 요청
      { page: 0, cond: () => true, x: 485, y: 256 }, // 의료수급권자 비해당
      // 2P(동의서 1/3): 피보험자 동의함(x=330) & 타인수익자일 때 수익자 동의함(x=491)
      { page: 1, cond: () => true, x: 330, y: 343 },
      { page: 1, cond: (d) => !d.isSameInsBen, x: 491, y: 343 },
      { page: 1, cond: () => true, x: 330, y: 241 },
      { page: 1, cond: (d) => !d.isSameInsBen, x: 491, y: 241 },
      { page: 1, cond: () => true, x: 330, y: 137 },
      { page: 1, cond: (d) => !d.isSameInsBen, x: 491, y: 137 },
      // 3P(동의서 2/3): 제공 동의함
      { page: 2, cond: () => true, x: 330, y: 263 },
      { page: 2, cond: (d) => !d.isSameInsBen, x: 491, y: 263 },
      { page: 2, cond: () => true, x: 330, y: 164 },
      { page: 2, cond: (d) => !d.isSameInsBen, x: 491, y: 164 },
      { page: 2, cond: () => true, x: 330, y: 69 },
      { page: 2, cond: (d) => !d.isSameInsBen, x: 491, y: 69 },
      // 4P(동의서 3/3): 조회 동의함
      { page: 3, cond: () => true, x: 330, y: 484 },
      { page: 3, cond: (d) => !d.isSameInsBen, x: 491, y: 484 },
      { page: 3, cond: () => true, x: 330, y: 434 },
      { page: 3, cond: (d) => !d.isSameInsBen, x: 491, y: 434 },
      { page: 3, cond: () => true, x: 330, y: 330 },
      { page: 3, cond: (d) => !d.isSameInsBen, x: 491, y: 330 }
    ],
    signatures: [
      { page: 0, role: 'insured', cond: (d) => !d.isUnder14, x: 225, y: 64, w: 48, h: 18 },
      { page: 0, role: 'beneficiary', cond: (d) => !d.isUnder14, x: 225, y: 46, w: 48, h: 18 },
      { page: 0, role: 'guardian', cond: (d) => d.isUnder19, x: 495, y: 64, w: 48, h: 18 },
      { page: 3, role: 'insured', cond: (d) => !d.isUnder14, x: 240, y: 110, w: 48, h: 18 },
      { page: 3, role: 'beneficiary', cond: (d) => !d.isSameInsBen && !d.isUnder14, x: 240, y: 85, w: 48, h: 18 },
      { page: 3, role: 'guardian', cond: (d) => d.isUnder19, x: 508, y: 110, w: 48, h: 18 }
    ]
  },

  // ==================== [12. 메트라이프생명] (메트라이프 보험금청구서.pdf) ====================
  metlife: {
    fields: [
      // 1P 상단: 발생일시, 장소, 발생경위(병명 포함) (실측 y=663, 637)
      { page: 0, key: 'accYear', x: 262, y: 663, size: 9.5 },
      { page: 0, key: 'accMonth', x: 308, y: 663, size: 9.5 },
      { page: 0, key: 'accDay', x: 335, y: 663, size: 9.5 },
      { page: 0, key: 'accidentPlace', x: 440, y: 663, size: 9.5 },
      { page: 0, key: 'descWithDiag', x: 125, y: 637, size: 9.5 },
      // 1P 중단: 피보험자 및 수익자 정보 (실측 y=579, 500, 484, 476, 391, 375)
      { page: 0, key: 'insuredName', x: 125, y: 579, size: 10, bold: true },
      { page: 0, key: 'insuredRrn1', x: 275, y: 579, size: 9.5 },
      { page: 0, key: 'insuredRrn2', x: 338, y: 579, size: 9.5 },
      { page: 0, key: 'insuredPhone', x: 442, y: 579, size: 9.5 },
      { page: 0, key: 'beneficiaryName', x: 125, y: 500, size: 10, bold: true },
      { page: 0, key: 'beneficiaryRrn1', x: 275, y: 500, size: 9.5 },
      { page: 0, key: 'beneficiaryRrn2', x: 338, y: 500, size: 9.5 },
      { page: 0, key: 'beneficiaryPhone', x: 442, y: 500, size: 9.5 },
      { page: 0, key: 'beneficiaryJob', x: 435, y: 484, size: 9.5 },
      { page: 0, key: 'beneficiaryAddress', x: 125, y: 476, size: 9 },
      { page: 0, key: 'bankName', x: 275, y: 391, size: 10 },
      { page: 0, key: 'beneficiaryName', x: 435, y: 391, size: 10 },
      { page: 0, key: 'accountNumber', x: 275, y: 375, size: 10 },
      // 1P 하단: 작성일 및 수익자/대표친권자 성명 (실측 y=145)
      { page: 0, key: 'todayYear', x: 70, y: 145, size: 10 },
      { page: 0, key: 'todayMonth', x: 118, y: 145, size: 10 },
      { page: 0, key: 'todayDay', x: 148, y: 145, size: 10 },
      { page: 0, key: 'beneficiaryName', x: 268, y: 145, size: 10, bold: true },
      { page: 0, key: 'guardianName19', cond: (d) => d.isUnder19, x: 445, y: 145, size: 10, bold: true },
      // 3P(필수동의서 2-2): 피보험자/수익자/친권자(부·모 자동분기) 성명 및 날짜 (실측 y=261, 232, 89)
      { page: 2, key: 'insuredName', cond: (d) => !d.isUnder14, x: 125, y: 261, size: 10, bold: true },
      { page: 2, key: 'beneficiaryName', cond: (d) => !d.isSameInsBen && !d.isUnder14, x: 125, y: 232, size: 10, bold: true },
      { page: 2, key: 'guardianName19', cond: (d) => d.isUnder19 && d.guardianRel !== '모', x: 395, y: 261, size: 9.5, bold: true },
      { page: 2, key: 'guardianName19', cond: (d) => d.isUnder19 && d.guardianRel === '모', x: 395, y: 232, size: 9.5, bold: true },
      { page: 2, key: 'todayYear', x: 202, y: 89, size: 10 },
      { page: 2, key: 'todayMonth', x: 268, y: 89, size: 10 },
      { page: 2, key: 'todayDay', x: 318, y: 89, size: 10 },
      // 4P([선택] 설계사 안내 동의서 - notifyPlanner 체크 시 자동 작성, 실측 y=277, 248, 89)
      { page: 3, key: 'insuredName', cond: (d) => d.notifyPlanner && !d.isUnder14, x: 125, y: 277, size: 10, bold: true },
      { page: 3, key: 'beneficiaryName', cond: (d) => d.notifyPlanner && !d.isSameInsBen && !d.isUnder14, x: 125, y: 248, size: 10, bold: true },
      { page: 3, key: 'guardianName19', cond: (d) => d.notifyPlanner && d.isUnder19 && d.guardianRel !== '모', x: 395, y: 277, size: 9.5, bold: true },
      { page: 3, key: 'guardianName19', cond: (d) => d.notifyPlanner && d.isUnder19 && d.guardianRel === '모', x: 395, y: 248, size: 9.5, bold: true },
      { page: 3, key: 'todayYear', cond: (d) => d.notifyPlanner, x: 202, y: 89, size: 10 },
      { page: 3, key: 'todayMonth', cond: (d) => d.notifyPlanner, x: 268, y: 89, size: 10 },
      { page: 3, key: 'todayDay', cond: (d) => d.notifyPlanner, x: 318, y: 89, size: 10 }
    ],
    checks: [
      // 1P: 청구사유, 발생원인, 자동이체계좌(예/아니오), 문자안내, 대한민국거주(예), 팩스접수 체크
      { page: 0, cond: (d) => d.coverages.includes('입원'), x: 97, y: 680 },
      { page: 0, cond: (d) => d.coverages.includes('수술'), x: 133, y: 680 },
      { page: 0, cond: (d) => d.coverages.includes('통원') || d.coverages.includes('실손의료비'), x: 169, y: 680 },
      { page: 0, cond: (d) => d.coverages.includes('진단'), x: 227, y: 680 },
      { page: 0, cond: (d) => d.coverages.includes('장해'), x: 263, y: 680 },
      { page: 0, cond: (d) => d.accidentType === '질병', x: 135, y: 663 },
      { page: 0, cond: (d) => d.accidentType !== '질병', x: 173, y: 663 },
      { page: 0, cond: (d) => d.useAutoTransfer, x: 111, y: 377 },
      { page: 0, cond: (d) => !d.useAutoTransfer, x: 144, y: 377 },
      { page: 0, cond: (d) => d.notifyCustomer, x: 104, y: 353 },
      { page: 0, cond: () => true, x: 315, y: 332 }, // 대한민국 국적/거주 '예'
      { page: 0, cond: () => true, x: 263, y: 121 }, // 팩스 접수 체크
      // 2P(필수동의서 2-1): 수집·이용 3곳 + 조회 3곳 = 총 6곳 (실측 x=505)
      { page: 1, cond: () => true, x: 505, y: 509 },
      { page: 1, cond: () => true, x: 505, y: 435 },
      { page: 1, cond: () => true, x: 505, y: 359 },
      { page: 1, cond: () => true, x: 505, y: 189 },
      { page: 1, cond: () => true, x: 505, y: 145 },
      { page: 1, cond: () => true, x: 505, y: 85 },
      // 3P(필수동의서 2-2): 제공 3곳 + 미성년 친권 대표행사 체크
      { page: 2, cond: () => true, x: 505, y: 485 },
      { page: 2, cond: () => true, x: 505, y: 412 },
      { page: 2, cond: () => true, x: 505, y: 332 },
      { page: 2, cond: (d) => d.isUnder19 && d.guardianRel !== '모', x: 492, y: 261 },
      { page: 2, cond: (d) => d.isUnder19 && d.guardianRel === '모', x: 492, y: 232 },
      // 4P(선택동의서): 설계사 안내 체크 시에만 동의함 2곳 체크
      { page: 3, cond: (d) => d.notifyPlanner, x: 505, y: 389 },
      { page: 3, cond: (d) => d.notifyPlanner, x: 505, y: 321 },
      { page: 3, cond: (d) => d.notifyPlanner && d.isUnder19 && d.guardianRel !== '모', x: 492, y: 277 },
      { page: 3, cond: (d) => d.notifyPlanner && d.isUnder19 && d.guardianRel === '모', x: 492, y: 248 }
    ],
    signatures: [
      { page: 0, role: 'beneficiary', x: 335, y: 145, w: 48, h: 18 },
      { page: 0, role: 'guardian', cond: (d) => d.isUnder19, x: 518, y: 145, w: 48, h: 18 },
      { page: 2, role: 'insured', cond: (d) => !d.isUnder14, x: 255, y: 261, w: 45, h: 18 },
      { page: 2, role: 'beneficiary', cond: (d) => !d.isSameInsBen && !d.isUnder14, x: 255, y: 232, w: 45, h: 18 },
      { page: 2, role: 'guardian', cond: (d) => d.isUnder19 && d.guardianRel !== '모', x: 522, y: 261, w: 45, h: 18 },
      { page: 2, role: 'guardian', cond: (d) => d.isUnder19 && d.guardianRel === '모', x: 522, y: 232, w: 45, h: 18 },
      { page: 3, role: 'insured', cond: (d) => d.notifyPlanner && !d.isUnder14, x: 255, y: 277, w: 45, h: 18 },
      { page: 3, role: 'beneficiary', cond: (d) => d.notifyPlanner && !d.isSameInsBen && !d.isUnder14, x: 255, y: 248, w: 45, h: 18 },
      { page: 3, role: 'guardian', cond: (d) => d.notifyPlanner && d.isUnder19 && d.guardianRel !== '모', x: 522, y: 277, w: 45, h: 18 },
      { page: 3, role: 'guardian', cond: (d) => d.notifyPlanner && d.isUnder19 && d.guardianRel === '모', x: 522, y: 248, w: 45, h: 18 }
    ]
  },

  // ==================== [13. 미래에셋생명] (미래에셋생명 보험금청구서.pdf) ====================
  mirae_life: {
    fields: [
      // 1P 상단: 피보험자 및 수익자 인적사항 (실측 y=731, 688, 666, 605, 584)
      { page: 0, key: 'insuredName', x: 135, y: 731, size: 10, bold: true },
      { page: 0, key: 'insuredRrnFull', x: 245, y: 731, size: 9.5 },
      { page: 0, key: 'insuredPhone', x: 360, y: 731, size: 9 },
      { page: 0, key: 'beneficiaryName', x: 135, y: 688, size: 10, bold: true },
      { page: 0, key: 'beneficiaryRrnFull', x: 245, y: 688, size: 9.5 },
      { page: 0, key: 'beneficiaryPhone', x: 360, y: 688, size: 9 },
      { page: 0, key: 'beneficiaryAddress', x: 135, y: 666, size: 9 },
      { page: 0, key: 'beneficiaryJob', x: 245, y: 605, size: 9.5 },
      { page: 0, key: 'bankName', x: 135, y: 584, size: 10 },
      { page: 0, key: 'beneficiaryName', x: 245, y: 584, size: 10 },
      { page: 0, key: 'accountNumber', x: 365, y: 584, size: 10 },
      // 1P 중단: 사고일시, 장소, 경위, 병명 (실측 y=470, 450, 407)
      { page: 0, key: 'accYear', x: 142, y: 470, size: 9.5 },
      { page: 0, key: 'accMonth', x: 192, y: 470, size: 9.5 },
      { page: 0, key: 'accDay', x: 228, y: 470, size: 9.5 },
      { page: 0, key: 'accidentPlace', x: 368, y: 470, size: 9.5 },
      { page: 0, key: 'accidentDesc', x: 142, y: 450, size: 9.5 },
      { page: 0, key: 'diagnosisName', x: 142, y: 407, size: 9.5, bold: true },
      // 1P 하단: 작성일, 청구인 성명, 사고자와의 관계 (실측 y=200)
      { page: 0, key: 'todayYearShort', x: 102, y: 200, size: 10 },
      { page: 0, key: 'todayMonth', x: 145, y: 200, size: 10 },
      { page: 0, key: 'todayDay', x: 182, y: 200, size: 10 },
      { page: 0, key: 'claimantName', x: 295, y: 200, size: 10, bold: true },
      { page: 0, key: 'relSelf', x: 528, y: 200, size: 9 },
      // 4P(동의서 3/3): 동의일자 및 세로형 서명란 (실측 y=286, 191, 142, 93)
      { page: 3, key: 'todayYearShort', x: 245, y: 286, size: 10 },
      { page: 3, key: 'todayMonth', x: 295, y: 286, size: 10 },
      { page: 3, key: 'todayDay', x: 342, y: 286, size: 10 },
      { page: 3, key: 'insuredName', cond: (d) => !d.isUnder14, x: 102, y: 191, size: 10, bold: true },
      { page: 3, key: 'beneficiaryName', cond: (d) => !d.isSameInsBen && !d.isUnder14, x: 102, y: 142, size: 10, bold: true },
      { page: 3, key: 'guardianName19', cond: (d) => d.isUnder19, x: 102, y: 93, size: 10, bold: true }
    ],
    checks: [
      // 1P: 의료급여(비해당), E-mail(없음), 실제소유자(예), 사고유형, 청구사유, 문자안내 신청
      { page: 0, cond: () => true, x: 525, y: 731 },
      { page: 0, cond: () => true, x: 451, y: 684 },
      { page: 0, cond: () => true, x: 394, y: 605 },
      { page: 0, cond: (d) => d.accidentType === '질병', x: 102, y: 520 },
      { page: 0, cond: (d) => d.accidentType === '상해', x: 260, y: 520 },
      { page: 0, cond: (d) => d.accidentType === '교통사고', x: 418, y: 520 },
      { page: 0, cond: (d) => d.coverages.includes('입원'), x: 102, y: 490 },
      { page: 0, cond: (d) => d.coverages.includes('통원'), x: 138, y: 490 },
      { page: 0, cond: (d) => d.coverages.includes('수술'), x: 174, y: 490 },
      { page: 0, cond: (d) => d.coverages.includes('실손의료비'), x: 210, y: 490 },
      { page: 0, cond: (d) => d.coverages.includes('진단'), x: 325, y: 490 },
      { page: 0, cond: (d) => d.coverages.includes('장해'), x: 362, y: 490 },
      { page: 0, cond: (d) => d.notifyCustomer, x: 99, y: 363 },
      { page: 0, cond: (d) => d.notifyCustomer, x: 278, y: 352 },
      { page: 0, cond: (d) => d.notifyCustomer, x: 448, y: 363 },
      // 2P(동의서 1/3): 동의함 3곳 (실측 x=517, y=373, 265, 154)
      { page: 1, cond: () => true, x: 517, y: 373 },
      { page: 1, cond: () => true, x: 517, y: 265 },
      { page: 1, cond: () => true, x: 517, y: 154 },
      // 3P(동의서 2/3): 제공 동의함 3곳 (실측 x=517, y=329, 221, 110)
      { page: 2, cond: () => true, x: 517, y: 329 },
      { page: 2, cond: () => true, x: 517, y: 221 },
      { page: 2, cond: () => true, x: 517, y: 110 },
      // 4P(동의서 3/3): 조회 동의함 3곳 (실측 x=517, y=537, 412, 321)
      { page: 3, cond: () => true, x: 517, y: 537 },
      { page: 3, cond: () => true, x: 517, y: 412 },
      { page: 3, cond: () => true, x: 517, y: 321 }
    ],
    signatures: [
      { page: 0, role: 'beneficiary', x: 392, y: 200, w: 50, h: 20 },
      { page: 3, role: 'insured', cond: (d) => !d.isUnder14, x: 175, y: 191, w: 48, h: 20 },
      { page: 3, role: 'beneficiary', cond: (d) => !d.isSameInsBen && !d.isUnder14, x: 175, y: 142, w: 48, h: 20 },
      { page: 3, role: 'guardian', cond: (d) => d.isUnder19, x: 175, y: 93, w: 48, h: 20 }
    ]
  },

  // ==================== [14. 삼성생명] (삼성생명 보험금청구서.pdf) ====================
  samsung_life: {
    fields: [
      // 1P 상단: 피보험자 및 청구 사유 (실측 y=713, 653, 636, 577)
      { page: 0, key: 'insuredName', x: 112, y: 713, size: 10, bold: true },
      { page: 0, key: 'insuredRrnFull', x: 230, y: 713, size: 9.5 },
      { page: 0, key: 'insuredPhone', x: 372, y: 713, size: 9 },
      { page: 0, key: 'accYear', x: 156, y: 653, size: 9.5 },
      { page: 0, key: 'accMonth', x: 212, y: 653, size: 9.5 },
      { page: 0, key: 'accDay', x: 245, y: 653, size: 9.5 },
      { page: 0, key: 'accidentDesc', x: 198, y: 636, size: 9.5 },
      { page: 0, key: 'diagnosisName', x: 156, y: 577, size: 9.5, bold: true },
      // 1P 중단: 수익자 정보 및 수령 계좌 (실측 y=498, 464, 379)
      { page: 0, key: 'beneficiaryName', x: 112, y: 498, size: 10, bold: true },
      { page: 0, key: 'beneficiaryRrnFull', x: 230, y: 498, size: 9.5 },
      { page: 0, key: 'beneficiaryPhone', x: 372, y: 498, size: 9 },
      { page: 0, key: 'beneficiaryAddress', x: 112, y: 464, size: 9 },
      { page: 0, key: 'bankName', x: 158, y: 379, size: 10 },
      { page: 0, key: 'beneficiaryName', x: 282, y: 379, size: 10 },
      { page: 0, key: 'accountNumber', x: 412, y: 379, size: 10 },
      // 1P 하단: 작성일 및 수익자(대리인) 성명·관계 (실측 y=112, 96)
      { page: 0, key: 'todayYear', x: 262, y: 112, size: 9.5 },
      { page: 0, key: 'todayMonth', x: 315, y: 112, size: 9.5 },
      { page: 0, key: 'todayDay', x: 342, y: 112, size: 9.5 },
      { page: 0, key: 'claimantName', x: 442, y: 112, size: 10, bold: true },
      { page: 0, key: 'relIfDiff', cond: (d) => !d.isSameInsBen || d.isUnder19, x: 445, y: 96, size: 9.5 },
      // 4P(요약동의서 3/3): 피보험자/수익자/친권자(부·모) 성명 및 신청일 (실측 y=166, 137, 86)
      { page: 3, key: 'insuredName', cond: (d) => !d.isUnder14, x: 132, y: 166, size: 10, bold: true },
      { page: 3, key: 'beneficiaryName', cond: (d) => !d.isSameInsBen && !d.isUnder14, x: 132, y: 137, size: 10, bold: true },
      { page: 3, key: 'guardianName19', cond: (d) => d.isUnder19 && d.guardianRel !== '모', x: 345, y: 166, size: 9.5, bold: true },
      { page: 3, key: 'guardianName19', cond: (d) => d.isUnder19 && d.guardianRel === '모', x: 486, y: 166, size: 9.5, bold: true },
      { page: 3, key: 'todayYear', x: 265, y: 86, size: 10 },
      { page: 3, key: 'todayMonth', x: 318, y: 86, size: 10 },
      { page: 3, key: 'todayDay', x: 352, y: 86, size: 10 },
      // 8P(상세동의서 4/4): 피보험자/수익자/친권자(부·모) 성명 및 신청일 (실측 y=166, 137, 86)
      { page: 7, key: 'insuredName', cond: (d) => !d.isUnder14, x: 132, y: 166, size: 10, bold: true },
      { page: 7, key: 'beneficiaryName', cond: (d) => !d.isSameInsBen && !d.isUnder14, x: 132, y: 137, size: 10, bold: true },
      { page: 7, key: 'guardianName19', cond: (d) => d.isUnder19 && d.guardianRel !== '모', x: 345, y: 166, size: 9.5, bold: true },
      { page: 7, key: 'guardianName19', cond: (d) => d.isUnder19 && d.guardianRel === '모', x: 486, y: 166, size: 9.5, bold: true },
      { page: 7, key: 'todayYear', x: 265, y: 86, size: 10 },
      { page: 7, key: 'todayMonth', x: 318, y: 86, size: 10 },
      { page: 7, key: 'todayDay', x: 352, y: 86, size: 10 }
    ],
    checks: [
      // 1P: 의료수급(아니오), 유형/세부유형, 자보처리(아니오), 실제소유자(예), 문자안내, 필수확인 체크
      { page: 0, cond: () => true, x: 525, y: 704 },
      { page: 0, cond: (d) => d.accidentType === '질병', x: 120, y: 686 },
      { page: 0, cond: (d) => d.accidentType !== '질병', x: 120, y: 672 },
      { page: 0, cond: (d) => d.coverages.includes('장해'), x: 358, y: 686 },
      { page: 0, cond: (d) => d.coverages.includes('진단'), x: 406, y: 686 },
      { page: 0, cond: (d) => d.coverages.includes('수술'), x: 447, y: 686 },
      { page: 0, cond: (d) => d.coverages.includes('입원'), x: 487, y: 686 },
      { page: 0, cond: (d) => d.coverages.includes('통원'), x: 527, y: 686 },
      { page: 0, cond: (d) => d.coverages.includes('실손의료비'), x: 358, y: 672 },
      { page: 0, cond: () => true, x: 481, y: 653 },
      { page: 0, cond: () => true, x: 525, y: 507 }, // 실제소유자 '예'
      { page: 0, cond: (d) => d.notifyCustomer, x: 120, y: 311 },
      { page: 0, cond: (d) => d.notifyCustomer, x: 238, y: 303 },
      { page: 0, cond: () => true, x: 488, y: 214 }, // 3. 확인 (필수) 체크박스
      // 2~4P(요약동의서): 전체동의서요청(아니오) + 피보험자 동의함(x=414) / 타인수익자 동의함(x=519)
      { page: 1, cond: () => true, x: 514, y: 653 },
      { page: 1, cond: () => true, x: 414, y: 424 },
      { page: 1, cond: (d) => !d.isSameInsBen, x: 519, y: 424 },
      { page: 1, cond: () => true, x: 414, y: 363 },
      { page: 1, cond: (d) => !d.isSameInsBen, x: 519, y: 363 },
      { page: 1, cond: () => true, x: 414, y: 279 },
      { page: 1, cond: (d) => !d.isSameInsBen, x: 519, y: 279 },
      { page: 2, cond: () => true, x: 414, y: 695 },
      { page: 2, cond: (d) => !d.isSameInsBen, x: 519, y: 695 },
      { page: 2, cond: () => true, x: 414, y: 636 },
      { page: 2, cond: (d) => !d.isSameInsBen, x: 519, y: 636 },
      { page: 2, cond: () => true, x: 414, y: 555 },
      { page: 2, cond: (d) => !d.isSameInsBen, x: 519, y: 555 },
      { page: 2, cond: () => true, x: 414, y: 178 },
      { page: 2, cond: (d) => !d.isSameInsBen, x: 519, y: 178 },
      { page: 2, cond: () => true, x: 414, y: 97 },
      { page: 2, cond: (d) => !d.isSameInsBen, x: 519, y: 97 },
      { page: 3, cond: () => true, x: 414, y: 559 },
      { page: 3, cond: (d) => !d.isSameInsBen, x: 519, y: 559 },
      { page: 3, cond: () => true, x: 414, y: 513 },
      { page: 3, cond: (d) => !d.isSameInsBen, x: 519, y: 513 },
      { page: 3, cond: () => true, x: 414, y: 431 },
      { page: 3, cond: (d) => !d.isSameInsBen, x: 519, y: 431 },
      // 5~8P(상세동의서): 피보험자 동의함(x=413) / 타인수익자 동의함(x=519)
      { page: 4, cond: () => true, x: 413, y: 385 },
      { page: 4, cond: (d) => !d.isSameInsBen, x: 519, y: 385 },
      { page: 4, cond: () => true, x: 413, y: 264 },
      { page: 4, cond: (d) => !d.isSameInsBen, x: 519, y: 264 },
      { page: 4, cond: () => true, x: 413, y: 113 },
      { page: 4, cond: (d) => !d.isSameInsBen, x: 519, y: 113 },
      { page: 5, cond: () => true, x: 413, y: 320 },
      { page: 5, cond: (d) => !d.isSameInsBen, x: 519, y: 320 },
      { page: 5, cond: () => true, x: 413, y: 220 },
      { page: 5, cond: (d) => !d.isSameInsBen, x: 519, y: 220 },
      { page: 5, cond: () => true, x: 413, y: 97 },
      { page: 5, cond: (d) => !d.isSameInsBen, x: 519, y: 97 },
      { page: 6, cond: () => true, x: 413, y: 337 },
      { page: 6, cond: (d) => !d.isSameInsBen, x: 519, y: 337 },
      { page: 6, cond: () => true, x: 413, y: 213 },
      { page: 6, cond: (d) => !d.isSameInsBen, x: 519, y: 213 },
      { page: 7, cond: () => true, x: 413, y: 531 },
      { page: 7, cond: (d) => !d.isSameInsBen, x: 519, y: 531 },
      { page: 7, cond: () => true, x: 413, y: 474 },
      { page: 7, cond: (d) => !d.isSameInsBen, x: 519, y: 474 },
      { page: 7, cond: () => true, x: 413, y: 378 },
      { page: 7, cond: (d) => !d.isSameInsBen, x: 519, y: 378 }
    ],
    signatures: [
      { page: 0, role: 'beneficiary', x: 505, y: 112, w: 48, h: 18 },
      // 4P 요약동의서 서명
      { page: 3, role: 'insured', cond: (d) => !d.isUnder14, x: 180, y: 166, w: 45, h: 18 },
      { page: 3, role: 'beneficiary', cond: (d) => !d.isSameInsBen && !d.isUnder14, x: 180, y: 137, w: 45, h: 18 },
      { page: 3, role: 'guardian', cond: (d) => d.isUnder19 && d.guardianRel !== '모', x: 385, y: 166, w: 42, h: 18 },
      { page: 3, role: 'guardian', cond: (d) => d.isUnder19 && d.guardianRel === '모', x: 525, y: 166, w: 42, h: 18 },
      // 8P 상세동의서 서명
      { page: 7, role: 'insured', cond: (d) => !d.isUnder14, x: 180, y: 166, w: 45, h: 18 },
      { page: 7, role: 'beneficiary', cond: (d) => !d.isSameInsBen && !d.isUnder14, x: 180, y: 137, w: 45, h: 18 },
      { page: 7, role: 'guardian', cond: (d) => d.isUnder19 && d.guardianRel !== '모', x: 385, y: 166, w: 42, h: 18 },
      { page: 7, role: 'guardian', cond: (d) => d.isUnder19 && d.guardianRel === '모', x: 525, y: 166, w: 42, h: 18 }
    ]
  },

  // ==================== [15. 신한라이프] (신한라이프 보험금청구서.pdf) ====================
  shinhan_life: {
    fields: [
      // 1P 상단: 사고일시, 장소(초진병원), 경위, 병명 (실측 y=676, 660)
      { page: 0, key: 'accYearShort', x: 175, y: 676, size: 9.5 },
      { page: 0, key: 'accMonth', x: 210, y: 676, size: 9.5 },
      { page: 0, key: 'accDay', x: 240, y: 676, size: 9.5 },
      { page: 0, key: 'accidentPlace', x: 430, y: 676, size: 9.5 },
      { page: 0, key: 'accidentDesc', x: 165, y: 660, size: 9.5 },
      { page: 0, key: 'diagnosisName', x: 338, y: 660, size: 9.5, bold: true },
      // 1P 상단: 보험금 수령 계좌 (실측 y=585)
      { page: 0, key: 'bankName', x: 145, y: 585, size: 9.5 },
      { page: 0, key: 'beneficiaryName', x: 245, y: 585, size: 9.5 },
      { page: 0, key: 'accountNumber', x: 345, y: 585, size: 9.5 },
      // 1P 중단: 피보험자 및 수익자 인적사항 (실측 y=501, 485, 454, 438, 422)
      { page: 0, key: 'insuredName', x: 162, y: 501, size: 10, bold: true },
      { page: 0, key: 'insuredRrnFull', x: 318, y: 501, size: 9.5 },
      { page: 0, key: 'insuredPhone', x: 468, y: 501, size: 9 },
      { page: 0, key: 'insuredJob', x: 180, y: 485, size: 9.5 },
      { page: 0, key: 'relIfDiff', cond: (d) => !d.isSameInsBen, x: 392, y: 470, size: 9 },
      { page: 0, key: 'beneficiaryName', x: 162, y: 454, size: 10, bold: true },
      { page: 0, key: 'beneficiaryRrnFull', x: 318, y: 454, size: 9.5 },
      { page: 0, key: 'beneficiaryPhone', x: 468, y: 454, size: 9 },
      { page: 0, key: 'beneficiaryAddress', x: 162, y: 438, size: 9 },
      { page: 0, key: 'beneficiaryJob', x: 180, y: 422, size: 9.5 },
      // 1P 하단: 작성일 및 보험수익자(청구자) 성명 (실측 y=170)
      { page: 0, key: 'todayYearShort', x: 148, y: 170, size: 10 },
      { page: 0, key: 'todayMonth', x: 192, y: 170, size: 10 },
      { page: 0, key: 'todayDay', x: 232, y: 170, size: 10 },
      { page: 0, key: 'claimantName', x: 365, y: 170, size: 10, bold: true },
      // 4P(동의서 3/3): 피보험자/수익자/법정대리인 성명·관계 및 동의일 (실측 y=306, 289, 219)
      { page: 3, key: 'insuredName', cond: (d) => !d.isUnder14, x: 135, y: 306, size: 10, bold: true },
      { page: 3, key: 'beneficiaryName', cond: (d) => !d.isSameInsBen && !d.isUnder14, x: 135, y: 289, size: 10, bold: true },
      { page: 3, key: 'guardianName19', cond: (d) => d.isUnder19, x: 365, y: 306, size: 10, bold: true },
      { page: 3, key: 'guardianRel', cond: (d) => d.isUnder19, x: 528, y: 306, size: 9.5 },
      { page: 3, key: 'todayYearShort', x: 245, y: 219, size: 10 },
      { page: 3, key: 'todayMonth', x: 295, y: 219, size: 10 },
      { page: 3, key: 'todayDay', x: 338, y: 219, size: 10 }
    ],
    checks: [
      // 1P: 발생원인, 청구사유, 추가접수(예/아니오), 자동이체, 문자안내, 팩스접수
      { page: 0, cond: (d) => d.accidentType === '질병', x: 98, y: 741 },
      { page: 0, cond: (d) => d.accidentType === '상해', x: 268, y: 741 },
      { page: 0, cond: (d) => d.accidentType === '교통사고', x: 428, y: 741 },
      { page: 0, cond: (d) => d.coverages.includes('장해'), x: 135, y: 724 },
      { page: 0, cond: (d) => d.coverages.includes('진단'), x: 169, y: 724 },
      { page: 0, cond: (d) => d.coverages.includes('입원'), x: 203, y: 724 },
      { page: 0, cond: (d) => d.coverages.includes('수술'), x: 237, y: 724 },
      { page: 0, cond: (d) => d.coverages.includes('통원'), x: 270, y: 724 },
      { page: 0, cond: (d) => d.coverages.includes('실손의료비'), x: 300, y: 724 },
      { page: 0, cond: (d) => d.claimCategory === '추가', x: 323, y: 692 },
      { page: 0, cond: (d) => d.claimCategory === '신규', x: 351, y: 692 },
      { page: 0, cond: (d) => d.useAutoTransfer, x: 98, y: 607 },
      { page: 0, cond: (d) => !d.isSameInsBen, x: 354, y: 470 },
      { page: 0, cond: (d) => d.notifyCustomer, x: 101, y: 337 },
      { page: 0, cond: () => true, x: 226, y: 121 }, // 접수방법: 팩스
      // 2P(동의서 1/3): 동의함 3곳 (실측 x=492, y=526, 456, 376)
      { page: 1, cond: () => true, x: 492, y: 526 },
      { page: 1, cond: () => true, x: 492, y: 456 },
      { page: 1, cond: () => true, x: 492, y: 376 },
      // 3P(동의서 2/3): 국내제공 동의함 3곳(x=508) + 국외제공 동의함 2곳(x=492)
      { page: 2, cond: () => true, x: 508, y: 723 },
      { page: 2, cond: () => true, x: 508, y: 652 },
      { page: 2, cond: () => true, x: 508, y: 568 },
      { page: 2, cond: () => true, x: 492, y: 222 },
      { page: 2, cond: () => true, x: 492, y: 154 },
      // 4P(동의서 3/3): 조회 동의함 3곳 (실측 x=492, y=554, 501, 420)
      { page: 3, cond: () => true, x: 492, y: 554 },
      { page: 3, cond: () => true, x: 492, y: 501 },
      { page: 3, cond: () => true, x: 492, y: 420 }
    ],
    signatures: [
      { page: 0, role: 'beneficiary', x: 420, y: 170, w: 50, h: 20 },
      { page: 3, role: 'insured', cond: (d) => !d.isUnder14, x: 225, y: 306, w: 48, h: 18 },
      { page: 3, role: 'beneficiary', cond: (d) => !d.isSameInsBen && !d.isUnder14, x: 225, y: 289, w: 48, h: 18 },
      { page: 3, role: 'guardian', cond: (d) => d.isUnder19, x: 448, y: 306, w: 48, h: 18 }
    ]
  },

  // ==================== [16. 처브라이프생명] (처브라이프 보험금청구서(구,ace).pdf) ====================
  chubb_life: {
    fields: [
      // 1P 상단: 피보험자 정보 (실측 y=730, 710)
      { page: 0, key: 'insuredName', x: 155, y: 730, size: 10, bold: true },
      { page: 0, key: 'insuredPhone', x: 392, y: 730, size: 9.5 },
      { page: 0, key: 'insuredRrn1', x: 275, y: 710, size: 10 },
      { page: 0, key: 'insuredRrn2', x: 372, y: 710, size: 10 },
      // 1P 중단: 사고일시, 장소, 사고경위(진단명 포함) (실측 y=659, 646)
      { page: 0, key: 'accYear', x: 162, y: 659, size: 9.5 },
      { page: 0, key: 'accMonth', x: 218, y: 659, size: 9.5 },
      { page: 0, key: 'accDay', x: 268, y: 659, size: 9.5 },
      { page: 0, key: 'accidentPlace', x: 425, y: 659, size: 9.5 },
      { page: 0, key: 'descWithDiag', x: 162, y: 646, size: 9.5 },
      // 1P 중단: 수익자 정보 및 수령계좌 (실측 y=630, 613, 594)
      { page: 0, key: 'beneficiaryName', x: 155, y: 630, size: 10, bold: true },
      { page: 0, key: 'beneficiaryRrn1', x: 412, y: 630, size: 9.5 },
      { page: 0, key: 'beneficiaryRrn2', x: 490, y: 630, size: 9.5 },
      { page: 0, key: 'beneficiaryAddress', x: 142, y: 613, size: 9 },
      { page: 0, key: 'beneficiaryPhone', x: 392, y: 613, size: 9.5 },
      { page: 0, key: 'bankName', x: 155, y: 594, size: 10 },
      { page: 0, key: 'accountNumber', x: 310, y: 594, size: 10 },
      { page: 0, key: 'beneficiaryName', x: 495, y: 594, size: 10 },
      // 1P 하단: 작성일 및 피보험자/수익자 성명 (실측 y=327, 302)
      { page: 0, key: 'todayYearShort', x: 238, y: 327, size: 10 },
      { page: 0, key: 'todayMonth', x: 298, y: 327, size: 10 },
      { page: 0, key: 'todayDay', x: 348, y: 327, size: 10 },
      { page: 0, key: 'insuredName', x: 115, y: 302, size: 10, bold: true },
      { page: 0, key: 'claimantName', x: 365, y: 302, size: 10, bold: true },
      // 3P(동의서 2/2): 피보험자/수익자/법정대리인 성명·관계 및 날짜 (실측 y=109, 96, 65)
      { page: 2, key: 'insuredName', cond: (d) => !d.isUnder14, x: 125, y: 109, size: 10, bold: true },
      { page: 2, key: 'beneficiaryName', cond: (d) => !d.isSameInsBen && !d.isUnder14, x: 125, y: 96, size: 10, bold: true },
      { page: 2, key: 'guardianName19', cond: (d) => d.isUnder19, x: 355, y: 109, size: 10, bold: true },
      { page: 2, key: 'guardianRel', cond: (d) => d.isUnder19, x: 512, y: 109, size: 9.5 },
      { page: 2, key: 'todayYear', x: 205, y: 65, size: 10 },
      { page: 2, key: 'todayMonth', x: 268, y: 65, size: 10 },
      { page: 2, key: 'todayDay', x: 318, y: 65, size: 10 }
    ],
    checks: [
      // 1P: 청구사유, 사고유형, 대한민국 거주 '예', 문자메세지 안내
      { page: 0, cond: (d) => d.coverages.includes('입원'), x: 110, y: 692 },
      { page: 0, cond: (d) => d.coverages.includes('수술'), x: 148, y: 692 },
      { page: 0, cond: (d) => d.coverages.includes('진단'), x: 186, y: 692 },
      { page: 0, cond: (d) => d.coverages.includes('장해'), x: 224, y: 692 },
      { page: 0, cond: (d) => d.coverages.includes('통원') || d.coverages.includes('실손의료비'), x: 342, y: 692 },
      { page: 0, cond: (d) => d.accidentType === '질병', x: 167, y: 675 },
      { page: 0, cond: (d) => d.accidentType !== '질병', x: 342, y: 675 },
      { page: 0, cond: () => true, x: 345, y: 514 }, // 대한민국 거주 '예'
      { page: 0, cond: (d) => d.notifyCustomer, x: 108, y: 474 },
      // 2P(동의서 1/2): 수집·이용 동의함 3곳 (실측 x=493, y=499, 429, 351)
      { page: 1, cond: () => true, x: 493, y: 499 },
      { page: 1, cond: () => true, x: 493, y: 429 },
      { page: 1, cond: () => true, x: 493, y: 351 },
      // 3P(동의서 2/2): 국내제공 3곳 + 국외제공 2곳 + 조회 3곳 = 총 8곳 (실측 x=494)
      { page: 2, cond: () => true, x: 494, y: 723 },
      { page: 2, cond: () => true, x: 494, y: 668 },
      { page: 2, cond: () => true, x: 494, y: 608 },
      { page: 2, cond: () => true, x: 493, y: 408 },
      { page: 2, cond: () => true, x: 492, y: 363 },
      { page: 2, cond: () => true, x: 494, y: 234 },
      { page: 2, cond: () => true, x: 495, y: 201 },
      { page: 2, cond: () => true, x: 495, y: 156 }
    ],
    signatures: [
      { page: 0, role: 'insured', x: 245, y: 302, w: 48, h: 18 },
      { page: 0, role: 'beneficiary', x: 505, y: 302, w: 48, h: 18 },
      { page: 2, role: 'insured', cond: (d) => !d.isUnder14, x: 212, y: 109, w: 45, h: 18 },
      { page: 2, role: 'beneficiary', cond: (d) => !d.isSameInsBen && !d.isUnder14, x: 212, y: 96, w: 45, h: 18 },
      { page: 2, role: 'guardian', cond: (d) => d.isUnder19, x: 435, y: 109, w: 45, h: 18 }
    ]
  },

  // ==================== [17. 푸본현대생명] (푸본현대라이프 보험금청구서.pdf) ====================
  fubon_life: {
    fields: [
      // 1P 상단: 피보험자 인적사항 (실측 y=697, 681)
      { page: 0, key: 'insuredName', x: 105, y: 697, size: 10, bold: true },
      { page: 0, key: 'insuredRrnFull', x: 272, y: 697, size: 9.5 },
      { page: 0, key: 'insuredJob', x: 282, y: 681, size: 9 },
      { page: 0, key: 'insuredPhone', x: 448, y: 681, size: 9.5 },
      // 1P 중단: 수익자 정보 및 송금계좌 (실측 y=646, 630, 615, 599, 583)
      { page: 0, key: 'beneficiaryName', x: 105, y: 646, size: 10, bold: true },
      { page: 0, key: 'beneficiaryRrnFull', x: 272, y: 646, size: 9.5 },
      { page: 0, key: 'beneficiaryPhone', x: 105, y: 630, size: 9.5 },
      { page: 0, key: 'beneficiaryJob', x: 282, y: 630, size: 9 },
      { page: 0, key: 'relIfDiff', cond: (d) => !d.isSameInsBen, x: 372, y: 615, size: 9.5 },
      { page: 0, key: 'beneficiaryAddress', x: 105, y: 599, size: 9 },
      { page: 0, key: 'bankName', x: 140, y: 583, size: 9.5 },
      { page: 0, key: 'accountNumber', x: 256, y: 583, size: 9.5 },
      { page: 0, key: 'beneficiaryName', x: 430, y: 583, size: 9.5 },
      // 1P 중단: 사고일시, 장소, 경위, 병명 (실측 y=413, 397, 367)
      { page: 0, key: 'accYear', x: 162, y: 413, size: 9.5 },
      { page: 0, key: 'accMonth', x: 205, y: 413, size: 9.5 },
      { page: 0, key: 'accDay', x: 235, y: 413, size: 9.5 },
      { page: 0, key: 'accidentPlace', x: 398, y: 413, size: 9.5 },
      { page: 0, key: 'accidentDesc', x: 168, y: 397, size: 9.5 },
      { page: 0, key: 'diagnosisName', x: 135, y: 367, size: 9.5, bold: true },
      // 1P 하단: 작성일 및 청구인 성명 (실측 y=216)
      { page: 0, key: 'todayYear', x: 112, y: 216, size: 10 },
      { page: 0, key: 'todayMonth', x: 192, y: 216, size: 10 },
      { page: 0, key: 'todayDay', x: 258, y: 216, size: 10 },
      { page: 0, key: 'claimantName', x: 415, y: 216, size: 10, bold: true },
      // 5P(동의서 4/4): 날짜 및 피보험자/수익자/친권자(법정대리인) 성명 (실측 y=179, 155, 132)
      { page: 4, key: 'todayYear', x: 95, y: 179, size: 10 },
      { page: 4, key: 'todayMonth', x: 168, y: 179, size: 10 },
      { page: 4, key: 'todayDay', x: 232, y: 179, size: 10 },
      { page: 4, key: 'insuredName', cond: (d) => !d.isUnder14, x: 405, y: 179, size: 10, bold: true },
      { page: 4, key: 'beneficiaryName', cond: (d) => !d.isSameInsBen && !d.isUnder14, x: 405, y: 155, size: 10, bold: true },
      { page: 4, key: 'guardianName19', cond: (d) => d.isUnder19, x: 145, y: 155, size: 10, bold: true },
      { page: 4, key: 'guardianName19', cond: (d) => d.isUnder19, x: 405, y: 132, size: 10, bold: true },
      // 6P(고객거래확인서 개인용): 성명, 주민번호, 자택주소, 휴대전화, 직무, 작성일 및 신청인 성명
      { page: 5, key: 'beneficiaryName', x: 155, y: 665, size: 10, bold: true },
      { page: 5, key: 'beneficiaryRrnFull', x: 218, y: 625, size: 9.5 },
      { page: 5, key: 'beneficiaryAddress', x: 282, y: 586, size: 9 },
      { page: 5, key: 'beneficiaryPhone', x: 432, y: 566, size: 9.5 },
      { page: 5, key: 'beneficiaryJob', x: 372, y: 508, size: 9.5 },
      { page: 5, key: 'todayYearShort', x: 438, y: 136, size: 10 },
      { page: 5, key: 'todayMonth', x: 482, y: 136, size: 10 },
      { page: 5, key: 'todayDay', x: 522, y: 136, size: 10 },
      { page: 5, key: 'claimantName', x: 405, y: 117, size: 10, bold: true }
    ],
    checks: [
      // 1P: 관계(본인/기타), 전체청구, 발생원인, 청구사유, 실제소유자(Y), 의료수급(비대상), 일시금, FAX접수
      { page: 0, cond: (d) => d.isSameInsBen, x: 101, y: 615 },
      { page: 0, cond: (d) => !d.isSameInsBen, x: 333, y: 615 },
      { page: 0, cond: () => true, x: 101, y: 500 }, // 전체보험금 청구
      { page: 0, cond: (d) => d.accidentType === '질병', x: 101, y: 472 },
      { page: 0, cond: (d) => d.accidentType === '상해', x: 142, y: 472 },
      { page: 0, cond: (d) => d.accidentType === '교통사고', x: 199, y: 472 },
      { page: 0, cond: (d) => d.coverages.includes('장해'), x: 199, y: 445 },
      { page: 0, cond: (d) => d.coverages.includes('진단'), x: 233, y: 445 },
      { page: 0, cond: (d) => d.coverages.includes('입원'), x: 266, y: 445 },
      { page: 0, cond: (d) => d.coverages.includes('통원'), x: 300, y: 445 },
      { page: 0, cond: (d) => d.coverages.includes('수술'), x: 334, y: 445 },
      { page: 0, cond: (d) => d.coverages.includes('실손의료비'), x: 401, y: 445 },
      { page: 0, cond: () => true, x: 232, y: 429 }, // 실제소유자: Y
      { page: 0, cond: () => true, x: 142, y: 335 }, // 의료급여 수급권자: 비대상
      { page: 0, cond: () => true, x: 101, y: 320 }, // 분할보험금: 일시금
      { page: 0, cond: () => true, x: 194, y: 106 }, // 접수방법: FAX
      // 2P(동의서 1/4): 피보험자/수익자 동의함 6곳 (실측 x=526, y=397/376, 297/276, 183/162)
      { page: 1, cond: () => true, x: 526, y: 397 },
      { page: 1, cond: () => true, x: 526, y: 376 },
      { page: 1, cond: () => true, x: 526, y: 297 },
      { page: 1, cond: () => true, x: 526, y: 276 },
      { page: 1, cond: () => true, x: 526, y: 183 },
      { page: 1, cond: () => true, x: 526, y: 162 },
      // 3P(동의서 2/4): 국내제공 동의함 6곳 (실측 x=526, y=302/286, 213/198, 111/95)
      { page: 2, cond: () => true, x: 526, y: 302 },
      { page: 2, cond: () => true, x: 526, y: 286 },
      { page: 2, cond: () => true, x: 526, y: 213 },
      { page: 2, cond: () => true, x: 526, y: 198 },
      { page: 2, cond: () => true, x: 526, y: 111 },
      { page: 2, cond: () => true, x: 526, y: 95 },
      // 4P(동의서 3/4): 국외제공 동의함 4곳 (실측 x=526, y=299/278, 209/188)
      { page: 3, cond: () => true, x: 526, y: 299 },
      { page: 3, cond: () => true, x: 526, y: 278 },
      { page: 3, cond: () => true, x: 526, y: 209 },
      { page: 3, cond: () => true, x: 526, y: 188 },
      // 5P(동의서 4/4): 조회 동의함 6곳 + 심사안내 문자수령 동의 (실측 x=526)
      { page: 4, cond: () => true, x: 526, y: 546 },
      { page: 4, cond: () => true, x: 526, y: 530 },
      { page: 4, cond: () => true, x: 526, y: 486 },
      { page: 4, cond: () => true, x: 526, y: 470 },
      { page: 4, cond: () => true, x: 526, y: 395 },
      { page: 4, cond: () => true, x: 526, y: 379 },
      { page: 4, cond: (d) => d.notifyCustomer, x: 526, y: 304 },
      // 6P(고객거래확인서): 국내거주, 실제소유자 예(본인), 가족보장 체크
      { page: 5, cond: () => true, x: 435, y: 665 },
      { page: 5, cond: () => true, x: 174, y: 468 },
      { page: 5, cond: () => true, x: 106, y: 246 }
    ],
    signatures: [
      { page: 0, role: 'beneficiary', x: 505, y: 216, w: 48, h: 18 },
      { page: 4, role: 'insured', cond: (d) => !d.isUnder14, x: 502, y: 179, w: 48, h: 18 },
      { page: 4, role: 'beneficiary', cond: (d) => !d.isSameInsBen && !d.isUnder14, x: 502, y: 155, w: 48, h: 18 },
      { page: 4, role: 'guardian', cond: (d) => d.isUnder19, x: 225, y: 155, w: 48, h: 18 },
      { page: 4, role: 'guardian', cond: (d) => d.isUnder19, x: 502, y: 132, w: 48, h: 18 },
      { page: 5, role: 'beneficiary', x: 505, y: 117, w: 48, h: 18 }
    ]
  },

  // ==================== [18. 하나생명] (하나생명 보험금청구서.pdf) ====================
  hana_life: {
    fields: [
      // 1P(CA01): 피보험자 및 수익자 인적사항·송금계좌 (실측 y=593, 573, 517, 497, 477, 437, 159, 139)
      { page: 0, key: 'insuredName', x: 115, y: 593, size: 10, bold: true },
      { page: 0, key: 'insuredRrnFull', x: 320, y: 593, size: 10 },
      { page: 0, key: 'insuredJob', x: 115, y: 573, size: 9.5 },
      { page: 0, key: 'insuredPhone', x: 320, y: 573, size: 9.5 },
      { page: 0, key: 'beneficiaryName', x: 115, y: 517, size: 10, bold: true },
      { page: 0, key: 'beneficiaryRrnFull', x: 320, y: 517, size: 10 },
      { page: 0, key: 'beneficiaryPhone', x: 320, y: 497, size: 9.5 },
      { page: 0, key: 'beneficiaryJob', x: 115, y: 477, size: 9.5 },
      { page: 0, key: 'beneficiaryAddress', x: 140, y: 437, size: 9 },
      { page: 0, key: 'bankName', x: 145, y: 159, size: 10 },
      { page: 0, key: 'beneficiaryName', x: 360, y: 159, size: 10 },
      { page: 0, key: 'accountNumber', x: 145, y: 139, size: 10 },
      // 2P(CA02): 청구항목(진단명), 사고일자, 장소, 경위, 작성일 및 수익자 성명 (실측 y=639, 520, 500, 213)
      { page: 1, key: 'diagnosisName', x: 192, y: 639, size: 9.5, bold: true },
      { page: 1, key: 'accidentDate', x: 145, y: 520, size: 9.5 },
      { page: 1, key: 'accidentPlace', x: 360, y: 520, size: 9.5 },
      { page: 1, key: 'accidentDesc', x: 145, y: 500, size: 9.5 },
      { page: 1, key: 'todayDateSlash', x: 115, y: 213, size: 10 },
      { page: 1, key: 'claimantName', x: 332, y: 213, size: 10, bold: true },
      { page: 1, key: 'relSelf', x: 482, y: 213, size: 9.5 },
      // 3P(HB01 고객거래확인서): 수익자 본인확인 기본사항 (실측 y=675, 657, 583, 565, 528)
      { page: 2, key: 'beneficiaryName', x: 115, y: 675, size: 10, bold: true },
      { page: 2, key: 'beneficiaryRrnFull', x: 115, y: 657, size: 9.5 },
      { page: 2, key: 'beneficiaryAddress', x: 115, y: 583, size: 9 },
      { page: 2, key: 'beneficiaryPhone', x: 115, y: 565, size: 9.5 },
      { page: 2, key: 'beneficiaryJob', x: 115, y: 528, size: 9.5 },
      // 6P(CA05 동의서 3): 피보험자/수익자/법정대리인 성명 및 동의일 (실측 y=291, 268, 245, 200)
      { page: 5, key: 'insuredName', cond: (d) => !d.isUnder14, x: 345, y: 291, size: 10, bold: true },
      { page: 5, key: 'beneficiaryName', cond: (d) => !d.isSameInsBen && !d.isUnder14, x: 345, y: 268, size: 10, bold: true },
      { page: 5, key: 'guardianName19', cond: (d) => d.isUnder19, x: 345, y: 245, size: 10, bold: true },
      { page: 5, key: 'todayYear', x: 70, y: 200, size: 10 },
      { page: 5, key: 'todayMonth', x: 125, y: 200, size: 10 },
      { page: 5, key: 'todayDay', x: 162, y: 200, size: 10 },
      // 7P(CA06 국외제공동의서): 날짜 및 피보험자/법정대리인 성명 (실측 y=158, 164, 141)
      { page: 6, key: 'todayYear', x: 80, y: 158, size: 10 },
      { page: 6, key: 'todayMonth', x: 135, y: 158, size: 10 },
      { page: 6, key: 'todayDay', x: 172, y: 158, size: 10 },
      { page: 6, key: 'insuredName', cond: (d) => !d.isUnder14, x: 365, y: 164, size: 10, bold: true },
      { page: 6, key: 'guardianName19', cond: (d) => d.isUnder19, x: 365, y: 141, size: 10, bold: true }
    ],
    checks: [
      // 1P: 실제소유자 '예', 사고연금 '일시금 수령'
      { page: 0, cond: () => true, x: 153, y: 258 },
      { page: 0, cond: () => true, x: 153, y: 199 },
      // 2P: 전체청구, 청구유형, 발생원인(질병/재해), 진행단계/지급지연/결과 문자안내
      { page: 1, cond: () => true, x: 113, y: 679 },
      { page: 1, cond: (d) => d.coverages.includes('장해'), x: 188, y: 620 },
      { page: 1, cond: (d) => d.coverages.includes('진단'), x: 262, y: 620 },
      { page: 1, cond: (d) => d.coverages.includes('수술'), x: 336, y: 620 },
      { page: 1, cond: (d) => d.coverages.includes('입원'), x: 411, y: 620 },
      { page: 1, cond: (d) => d.coverages.includes('통원') || d.coverages.includes('실손의료비'), x: 484, y: 620 },
      { page: 1, cond: (d) => d.accidentType === '질병', x: 113, y: 560 },
      { page: 1, cond: (d) => d.accidentType !== '질병', x: 305, y: 560 },
      { page: 1, cond: (d) => d.notifyCustomer, x: 219, y: 398 },
      { page: 1, cond: (d) => d.notifyCustomer, x: 219, y: 378 },
      { page: 1, cond: (d) => d.notifyCustomer, x: 422, y: 358 },
      // 3P(고객거래확인서): 국내거주, 대리인 아니오, 실제소유자 예, 보장성 체크
      { page: 2, cond: () => true, x: 112, y: 638 },
      { page: 2, cond: () => true, x: 330, y: 489 },
      { page: 2, cond: () => true, x: 139, y: 402 },
      { page: 2, cond: () => true, x: 111, y: 327 },
      // 4P(CA03): 수집·이용 동의함 3곳 (실측 x=500, y=360, 260, 160)
      { page: 3, cond: () => true, x: 500, y: 360 },
      { page: 3, cond: () => true, x: 500, y: 260 },
      { page: 3, cond: () => true, x: 500, y: 160 },
      // 5P(CA04): 국내제공 동의함 3곳 (실측 x=500, y=292, 216, 116)
      { page: 4, cond: () => true, x: 500, y: 292 },
      { page: 4, cond: () => true, x: 500, y: 216 },
      { page: 4, cond: () => true, x: 500, y: 116 },
      // 6P(CA05): 조회 동의함 3곳 (실측 x=500, y=488, 421, 331)
      { page: 5, cond: () => true, x: 500, y: 488 },
      { page: 5, cond: () => true, x: 500, y: 421 },
      { page: 5, cond: () => true, x: 500, y: 331 },
      // 7P(CA06): 국외제공 동의함 2곳 (실측 x=500, y=282, 210)
      { page: 6, cond: () => true, x: 500, y: 282 },
      { page: 6, cond: () => true, x: 500, y: 210 }
    ],
    signatures: [
      { page: 1, role: 'beneficiary', x: 405, y: 213, w: 48, h: 18 },
      { page: 5, role: 'insured', cond: (d) => !d.isUnder14, x: 475, y: 291, w: 48, h: 18 },
      { page: 5, role: 'beneficiary', cond: (d) => !d.isSameInsBen && !d.isUnder14, x: 475, y: 268, w: 48, h: 18 },
      { page: 5, role: 'guardian', cond: (d) => d.isUnder19, x: 475, y: 245, w: 48, h: 18 },
      { page: 6, role: 'insured', cond: (d) => !d.isUnder14, x: 475, y: 164, w: 48, h: 18 },
      { page: 6, role: 'guardian', cond: (d) => d.isUnder19, x: 475, y: 141, w: 48, h: 18 }
    ]
  },

  // ==================== [19. 한화생명] (한화생명 보험금청구서.pdf) ====================
  hanwha_life: {
    fields: [
      // 1P(595x842): 피보험자 인적사항 (실측 표 라인 y=699~718, 680~699)
      { page: 0, key: 'insuredName', x: 120, y: 706, size: 10, bold: true },
      { page: 0, key: 'insuredRrnFull', x: 312, y: 706, size: 10 },
      { page: 0, key: 'insuredJob', x: 120, y: 687, size: 9.5 },
      { page: 0, key: 'insuredPhone', x: 468, y: 687, size: 9.5 },
      // 1P: 대표 수령인 인적사항 및 입금계좌 (실측 표 라인 y=617~636, 597~617, 578~597, 539~559)
      { page: 0, key: 'beneficiaryName', x: 120, y: 624, size: 10, bold: true },
      { page: 0, key: 'beneficiaryRrnFull', x: 312, y: 624, size: 10 },
      { page: 0, key: 'beneficiaryPhone', x: 120, y: 604, size: 9.5 },
      { page: 0, key: 'relSelf', x: 468, y: 604, size: 9.5 },
      { page: 0, key: 'beneficiaryAddress', x: 120, y: 585, size: 9 },
      { page: 0, key: 'bankName', x: 120, y: 546, size: 10 },
      { page: 0, key: 'beneficiaryName', x: 268, y: 546, size: 10 },
      { page: 0, key: 'accountNumber', x: 415, y: 546, size: 10 },
      // 1P: 사고일시, 장소, 경위, 치료병명 (실측 표 라인 y=456~475, 437~456, 402~437)
      { page: 0, key: 'accidentDate', x: 165, y: 463, size: 9.5 },
      { page: 0, key: 'accidentPlace', x: 360, y: 463, size: 9.5 },
      { page: 0, key: 'accidentDesc', x: 165, y: 444, size: 9.5 },
      { page: 0, key: 'diagnosisName', x: 175, y: 422, size: 9.5, bold: true },
      // 1P 하단: 작성일자 및 수령인 성명 (실측 표 라인 y=133~153)
      { page: 0, key: 'todayYear', x: 125, y: 140, size: 10 },
      { page: 0, key: 'todayMonth', x: 192, y: 140, size: 10 },
      { page: 0, key: 'todayDay', x: 242, y: 140, size: 10 },
      { page: 0, key: 'claimantName', x: 392, y: 140, size: 10, bold: true },
      // 5P(동의서 4/4, 559x792): 피보험자/친권자/수령인 성명 및 확인일 (실측 표 라인 y=243~273, 214~243)
      { page: 4, key: 'insuredName', cond: (d) => !d.isUnder14, x: 122, y: 255, size: 10, bold: true },
      { page: 4, key: 'guardianName19', cond: (d) => d.isUnder19, x: 375, y: 255, size: 10, bold: true },
      { page: 4, key: 'beneficiaryName', cond: (d) => !d.isSameInsBen && !d.isUnder14, x: 122, y: 226, size: 10, bold: true },
      { page: 4, key: 'todayYear', x: 375, y: 226, size: 10 },
      { page: 4, key: 'todayMonth', x: 442, y: 226, size: 10 },
      { page: 4, key: 'todayDay', x: 492, y: 226, size: 10 }
    ],
    checks: [
      // 1P(실측 체크박스 좌표): 의료수급(아니오), 송금, 질병/재해, 청구사유, 자보(아니오), 일시금, 일부청구(아니오), 안내신청, 확인(필수)
      { page: 0, cond: () => true, x: 150, y: 671 },
      { page: 0, cond: () => true, x: 138, y: 569 }, // 수령방법: 송금
      { page: 0, cond: (d) => d.accidentType === '질병', x: 121, y: 503 },
      { page: 0, cond: (d) => d.accidentType !== '질병', x: 287, y: 503 },
      { page: 0, cond: (d) => d.coverages.includes('장해'), x: 154, y: 484 },
      { page: 0, cond: (d) => d.coverages.includes('진단'), x: 188, y: 484 },
      { page: 0, cond: (d) => d.coverages.includes('수술'), x: 222, y: 484 },
      { page: 0, cond: (d) => d.coverages.includes('입원'), x: 255, y: 484 },
      { page: 0, cond: (d) => d.coverages.includes('통원'), x: 288, y: 484 },
      { page: 0, cond: (d) => d.coverages.includes('실손의료비'), x: 370, y: 484 },
      { page: 0, cond: () => true, x: 499, y: 447 }, // 자보처리 아니오
      { page: 0, cond: () => true, x: 121, y: 392 }, // 청구구분: 일시금
      { page: 0, cond: () => true, x: 393, y: 392 }, // 일부청구: 아니오
      { page: 0, cond: (d) => d.notifyCustomer, x: 134, y: 326 },
      { page: 0, cond: (d) => d.notifyCustomer, x: 314, y: 326 },
      { page: 0, cond: (d) => d.notifyPlanner, x: 134, y: 307 },
      { page: 0, cond: (d) => d.notifyCustomer, x: 314, y: 307 },
      { page: 0, cond: () => true, x: 516, y: 197 }, // 필수 안내사항 '확인(필수)'
      // 2P(동의서 1/4, 559x792): 세로형 중 아래쪽 '동의함' 네모칸 (실측 x=462, y=388, 306, 192)
      { page: 1, cond: () => true, x: 462, y: 388 },
      { page: 1, cond: () => true, x: 462, y: 306 },
      { page: 1, cond: () => true, x: 462, y: 192 },
      // 3P(동의서 2/4): 아래쪽 '동의함' 네모칸 (실측 x=462, y=304, 232, 131)
      { page: 2, cond: () => true, x: 462, y: 304 },
      { page: 2, cond: () => true, x: 462, y: 232 },
      { page: 2, cond: () => true, x: 462, y: 131 },
      // 4P(동의서 3/4): 국외제공 아래쪽 '동의함' 네모칸 (실측 x=462, y=302, 220)
      { page: 3, cond: () => true, x: 462, y: 302 },
      { page: 3, cond: () => true, x: 462, y: 220 },
      // 5P(동의서 4/4): 조회 아래쪽 '동의함' 네모칸 (실측 x=462, y=477, 417, 335)
      { page: 4, cond: () => true, x: 462, y: 477 },
      { page: 4, cond: () => true, x: 462, y: 417 },
      { page: 4, cond: () => true, x: 462, y: 335 }
    ],
    signatures: [
      { page: 0, role: 'beneficiary', x: 505, y: 140, w: 50, h: 20 },
      { page: 4, role: 'insured', cond: (d) => !d.isUnder14, x: 215, y: 255, w: 48, h: 18 },
      { page: 4, role: 'guardian', cond: (d) => d.isUnder19, x: 470, y: 255, w: 48, h: 18 },
      { page: 4, role: 'beneficiary', cond: (d) => !d.isSameInsBen && !d.isUnder14, x: 215, y: 226, w: 48, h: 18 }
    ]
  },

  // ==================== [20. 흥국생명] (흥국생명 보험금청구서.pdf - 2550x3561 고해상도 규격) ====================
  heungkuk_life: {
    fields: [
      // 1P(2550x3561): 피보험자 인적사항 (실측 표 라인 y=3038~3158, 2918~3038)
      { page: 0, key: 'insuredName', x: 430, y: 3090, size: 42, bold: true },
      { page: 0, key: 'insuredRrnFull', x: 1050, y: 3090, size: 40 },
      { page: 0, key: 'insuredPhone', x: 1200, y: 2970, size: 40 },
      // 1P: 수익자 인적사항 (실측 표 라인 y=2669~2790, 2549~2669, 2428~2549, 2345~2428)
      { page: 0, key: 'relIfDiff', cond: (d) => !d.isSameInsBen, x: 1850, y: 2720, size: 38 },
      { page: 0, key: 'beneficiaryName', x: 430, y: 2600, size: 42, bold: true },
      { page: 0, key: 'beneficiaryRrnFull', x: 1050, y: 2600, size: 40 },
      { page: 0, key: 'beneficiaryPhone', x: 1200, y: 2480, size: 40 },
      { page: 0, key: 'beneficiaryAddress', x: 430, y: 2380, size: 36 },
      { page: 0, key: 'beneficiaryJob', x: 430, y: 2295, size: 38 },
      // 1P: 보험금 수령계좌 (실측 표 라인 y=2045~2125)
      { page: 0, key: 'bankName', x: 430, y: 2080, size: 40 },
      { page: 0, key: 'beneficiaryName', x: 1120, y: 2080, size: 40 },
      { page: 0, key: 'accountNumber', x: 1810, y: 2080, size: 40 },
      // 1P: 사고일시, 장소, 경위, 병명 (실측 표 라인 y=1195~1315, 1116~1195, 996~1116)
      { page: 0, key: 'accYear', x: 480, y: 1250, size: 40 },
      { page: 0, key: 'accMonth', x: 830, y: 1250, size: 40 },
      { page: 0, key: 'accDay', x: 1080, y: 1250, size: 40 },
      { page: 0, key: 'accidentPlace', x: 1960, y: 1250, size: 38 },
      { page: 0, key: 'accidentDesc', x: 430, y: 1150, size: 38 },
      { page: 0, key: 'diagnosisName', x: 430, y: 1050, size: 40, bold: true },
      // 1P 하단: 작성일 및 수익자(청구인) 성명 (실측 표 라인 y=269~357, 166~258)
      { page: 0, key: 'todayYearShort', x: 960, y: 308, size: 42 },
      { page: 0, key: 'todayMonth', x: 1200, y: 308, size: 42 },
      { page: 0, key: 'todayDay', x: 1360, y: 308, size: 42 },
      { page: 0, key: 'claimantName', x: 460, y: 205, size: 42, bold: true },
      // 5P(동의서 4/4, 2550x3561): 동의일 및 피보험자/친권자/수익자/청구자 성명 (실측 y=930, 730, 500)
      { page: 4, key: 'todayYearShort', x: 1050, y: 925, size: 42 },
      { page: 4, key: 'todayMonth', x: 1320, y: 925, size: 42 },
      { page: 4, key: 'todayDay', x: 1550, y: 925, size: 42 },
      { page: 4, key: 'insuredName', cond: (d) => !d.isUnder14, x: 420, y: 725, size: 42, bold: true },
      { page: 4, key: 'guardianName19', cond: (d) => d.isUnder19, x: 1620, y: 760, size: 40, bold: true },
      { page: 4, key: 'beneficiaryName', cond: (d) => !d.isSameInsBen && !d.isUnder14, x: 420, y: 500, size: 42, bold: true }
    ],
    checks: [
      // 1P(size: 48 적용): 의료수급(비해당), 관계(본인/기타), 실소유자(예), 전체청구, 유형/사항, 안내동의
      { page: 0, cond: () => true, x: 750, y: 2975, size: 48 },
      { page: 0, cond: (d) => d.isSameInsBen, x: 735, y: 2725, size: 48 },
      { page: 0, cond: (d) => !d.isSameInsBen, x: 1680, y: 2725, size: 48 },
      { page: 0, cond: () => true, x: 470, y: 2485, size: 48 }, // 실제소유자 '예'
      { page: 0, cond: () => true, x: 451, y: 1575, size: 48 }, // 청구범위: 전체청구
      { page: 0, cond: (d) => d.accidentType === '질병', x: 451, y: 1455, size: 48 },
      { page: 0, cond: (d) => d.accidentType === '상해', x: 665, y: 1455, size: 48 },
      { page: 0, cond: (d) => d.accidentType === '교통사고', x: 885, y: 1455, size: 48 },
      { page: 0, cond: (d) => d.coverages.includes('장해'), x: 885, y: 1357, size: 48 },
      { page: 0, cond: (d) => d.coverages.includes('진단'), x: 1049, y: 1357, size: 48 },
      { page: 0, cond: (d) => d.coverages.includes('입원'), x: 1213, y: 1357, size: 48 },
      { page: 0, cond: (d) => d.coverages.includes('통원'), x: 1383, y: 1357, size: 48 },
      { page: 0, cond: (d) => d.coverages.includes('수술'), x: 1553, y: 1357, size: 48 },
      { page: 0, cond: (d) => d.coverages.includes('실손의료비'), x: 1742, y: 1357, size: 48 },
      { page: 0, cond: (d) => d.notifyCustomer, x: 960, y: 805, size: 48 },
      { page: 0, cond: (d) => d.notifyPlanner, x: 2020, y: 805, size: 48 },
      // 2P(동의서 1/4): 우측 '동의' 체크 3곳 (실측 x=2290, y=1950, 1565, 1035)
      { page: 1, cond: () => true, x: 2290, y: 1950, size: 48 },
      { page: 1, cond: () => true, x: 2290, y: 1565, size: 48 },
      { page: 1, cond: () => true, x: 2290, y: 1035, size: 48 },
      // 3P(동의서 2/4): 국내제공 우측 '동의' 체크 3곳 (실측 x=2290, y=1560, 1260, 830)
      { page: 2, cond: () => true, x: 2290, y: 1560, size: 48 },
      { page: 2, cond: () => true, x: 2290, y: 1260, size: 48 },
      { page: 2, cond: () => true, x: 2290, y: 830, size: 48 },
      // 4P(동의서 3/4): 국외제공 우측 '동의' 체크 2곳 (실측 x=2290, y=1900, 1370)
      { page: 3, cond: () => true, x: 2290, y: 1900, size: 48 },
      { page: 3, cond: () => true, x: 2290, y: 1370, size: 48 },
      // 5P(동의서 4/4): 조회 우측 '동의' 체크 3곳 (실측 x=2290, y=2040, 1720, 1170)
      { page: 4, cond: () => true, x: 2290, y: 2040, size: 48 },
      { page: 4, cond: () => true, x: 2290, y: 1720, size: 48 },
      { page: 4, cond: () => true, x: 2290, y: 1170, size: 48 }
    ],
    signatures: [
      { page: 0, role: 'beneficiary', x: 2080, y: 205, w: 230, h: 85 },
      { page: 4, role: 'insured', cond: (d) => !d.isUnder14, x: 880, y: 725, w: 220, h: 85 },
      { page: 4, role: 'guardian', cond: (d) => d.isUnder19, x: 2080, y: 760, w: 220, h: 85 },
      { page: 4, role: 'beneficiary', cond: (d) => !d.isSameInsBen && !d.isUnder14, x: 880, y: 500, w: 220, h: 85 }
    ]
  }
});
