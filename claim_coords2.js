/**
 * 잇츠리온(It's RION) 생명보험사 전용 양식 파일 매핑 및 정밀 좌표 데이터 (claim_coords2.js)
 * - 양식 폴더 경로: ./forms2/
 */

// 1. 생명보험사 탭(INSURER_DB.life)과 forms2 폴더 내 실제 업로드 파일명·팩스번호 자동 연동
const LIFE_PDF_FILES = {
  abl_life:    { pdfFile: 'ABL생명 보험금청구서.pdf', fax: '02-3787-8796', faxType: 'fixed' },
  aia_life:    { pdfFile: 'AIA생명 보험금청구서.pdf', fax: '02-2021-4540', faxType: 'fixed' },
  cardif_life: { pdfFile: 'BNP파리바카디프생명 보험금청구서.pdf', fax: '02-3788-8939', faxType: 'fixed' },
  db_life:     { pdfFile: 'db생명 보험금청구서.pdf', fax: '0505-129-3134', faxType: 'fixed' }
  // 이어지는 16개 생명보험사도 이곳에 순차적으로 추가됩니다.
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
});
