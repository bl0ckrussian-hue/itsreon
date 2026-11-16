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
  // ==================== [1. ABL생명] (ABL생명 보험금청구서.pdf - 정밀보정 및 8P 고객확인서 반영) ====================
  abl_life: {
    fields: [
      // 1P: 피보험자 및 수익자 인적사항 (실측 정렬 완료)
      { page: 0, key: 'insuredName', x: 132, y: 737, size: 10, bold: true },
      { page: 0, key: 'insuredRrnFull', x: 282, y: 737, size: 10 },
      { page: 0, key: 'insuredJob', x: 275, y: 720, size: 9.5 },
      { page: 0, key: 'insuredPhone', x: 458, y: 720, size: 9.5 },
      { page: 0, key: 'beneficiaryName', x: 132, y: 687, size: 10, bold: true },
      { page: 0, key: 'beneficiaryRrnFull', x: 282, y: 687, size: 10 },
      { page: 0, key: 'relSelf', x: 164, y: 670, size: 9.5 },
      { page: 0, key: 'beneficiaryPhone', x: 458, y: 670, size: 9.5 },
      { page: 0, key: 'beneficiaryAddress', x: 125, y: 653, size: 9 },
      // 1P: 수령계좌 및 하단 접수일자/보험수익자 성명
      { page: 0, key: 'bankName', x: 185, y: 613, size: 9.5 },
      { page: 0, key: 'beneficiaryName', x: 280, y: 613, size: 9.5 },
      { page: 0, key: 'accountNumber', x: 398, y: 613, size: 9.5 },
      { page: 0, key: 'todayYearShort', x: 93, y: 217, size: 10 },
      { page: 0, key: 'todayMonth', x: 132, y: 217, size: 10 },
      { page: 0, key: 'todayDay', x: 164, y: 217, size: 10 },
      { page: 0, key: 'claimantName', x: 325, y: 217, size: 10, bold: true },

      // 2P(별첨 청구세부내용): 진단명, 청구사유별 일자 보조기입, 사고일시·장소·경위
      { page: 1, key: 'diagnosisName', x: 325, y: 640, size: 10, bold: true },
      { page: 1, key: 'accidentDate', cond: (d) => d.coverages.includes('통원'), x: 280, y: 521, size: 9 },
      { page: 1, key: 'accidentDate', cond: (d) => d.coverages.includes('수술'), x: 195, y: 462, size: 9 },
      { page: 1, key: 'diagnosisName', cond: (d) => d.coverages.includes('수술'), x: 308, y: 462, size: 9 },
      { page: 1, key: 'accidentDate', cond: (d) => d.coverages.includes('진단'), x: 195, y: 422, size: 9 },
      { page: 1, key: 'accYear', x: 132, y: 322, size: 10 },
      { page: 1, key: 'accMonth', x: 195, y: 322, size: 10 },
      { page: 1, key: 'accDay', x: 248, y: 322, size: 10 },
      { page: 1, key: 'accidentPlace', x: 132, y: 300, size: 9.5 },
      { page: 1, key: 'accidentDesc', x: 182, y: 276, size: 9.5 },

      // 5P(동의서 3): 하단 성명 및 동의일자 ('20' 바로 옆 x=131로 보정)
      { page: 4, key: 'insuredName', cond: (d) => !d.isUnder14, x: 105, y: 114, size: 10, bold: true },
      { page: 4, key: 'beneficiaryName', cond: (d) => !d.isSameInsBen || !d.isUnder14, x: 105, y: 83, size: 10, bold: true },
      { page: 4, key: 'guardianName19', cond: (d) => d.isUnder19, x: 375, y: 114, size: 10, bold: true },
      { page: 4, key: 'todayYearShort', x: 131, y: 59, size: 10 },
      { page: 4, key: 'todayMonth', x: 186, y: 59, size: 10 },
      { page: 4, key: 'todayDay', x: 236, y: 59, size: 10 },

      // 8P(고객확인서 개인용 - page: 7 추가 작성): 계약자, 수익자 신원정보, 직장/직종, 하단 확인서명란
      { page: 7, key: 'holderName', x: 105, y: 709, size: 9.5 },
      { page: 7, key: 'beneficiaryName', x: 105, y: 656, size: 9.5, bold: true },
      { page: 7, key: 'beneficiaryRrnFull', x: 265, y: 656, size: 9.5 },
      { page: 7, key: 'beneficiaryBirth', x: 105, y: 640, size: 9.5 },
      { page: 7, key: 'beneficiaryAddress', x: 105, y: 624, size: 9 },
      { page: 7, key: 'beneficiaryPhone', x: 288, y: 607, size: 9.5 },
      { page: 7, key: 'beneficiaryJob', x: 105, y: 511, size: 9.5 },
      { page: 7, key: 'beneficiaryName', x: 165, y: 299, size: 10, bold: true },
      { page: 7, key: 'todayDateSlash', x: 395, y: 299, size: 9.5 }
    ],
    checks: [
      // 1P(실측 BOX 중심점): 의료수급권자 아니오(208,705), 설계사/진행단계(127.5), 지급지연/내역 모바일(153)
      { page: 0, cond: () => true, x: 208, y: 705 },
      { page: 0, cond: (d) => d.notifyPlanner, x: 127.5, y: 506 },
      { page: 0, cond: (d) => !d.notifyPlanner, x: 164.5, y: 506 },
      { page: 0, cond: (d) => d.notifyCustomer, x: 127.5, y: 484 },
      { page: 0, cond: (d) => d.notifyCustomer, x: 153, y: 461 },
      { page: 0, cond: (d) => d.notifyCustomer, x: 153, y: 439 },

      // 2P(실측 BOX 중심점 교정: x=120.5): 추가접수, 정액/동시, 사고유형, 청구사유, 자보 아니오
      { page: 1, cond: (d) => d.claimCategory === '추가', x: 150, y: 680 },
      { page: 1, cond: (d) => !d.coverages.includes('실손의료비'), x: 150, y: 660 },
      { page: 1, cond: (d) => d.coverages.includes('실손의료비'), x: 194, y: 660 },
      { page: 1, cond: (d) => d.accidentType === '질병', x: 120.5, y: 620 },
      { page: 1, cond: (d) => d.accidentType === '상해', x: 120.5, y: 601 },
      { page: 1, cond: (d) => d.accidentType === '교통사고', x: 120.5, y: 581 },
      { page: 1, cond: (d) => d.coverages.includes('입원'), x: 120.5, y: 552 },
      { page: 1, cond: (d) => d.coverages.includes('통원'), x: 120.5, y: 502 },
      { page: 1, cond: (d) => d.coverages.includes('수술'), x: 120.5, y: 453 },
      { page: 1, cond: (d) => d.coverages.includes('진단'), x: 120.5, y: 423 },
      { page: 1, cond: (d) => d.coverages.includes('장해'), x: 120.5, y: 364 },
      { page: 1, cond: () => true, x: 286, y: 119 }, // 자동차보험 처리여부: 아니오

      // 3P(동의서 1 - 실측 BOX 중심점 x=289.5, 459.5, 501.5)
      { page: 2, cond: () => true, x: 289.5, y: 388 },
      { page: 2, cond: () => true, x: 501.5, y: 388 },
      { page: 2, cond: () => true, x: 459.5, y: 250 },
      { page: 2, cond: () => true, x: 289.5, y: 94 },
      { page: 2, cond: () => true, x: 501.5, y: 94 },

      // 4P(동의서 2 - 실측 BOX 중심점 x=292, 462.5, 506.5)
      { page: 3, cond: () => true, x: 292, y: 374 },
      { page: 3, cond: () => true, x: 506.5, y: 374 },
      { page: 3, cond: () => true, x: 462.5, y: 255 },
      { page: 3, cond: () => true, x: 292, y: 117 },
      { page: 3, cond: () => true, x: 506.5, y: 117 },

      // 5P(동의서 3 - 실측 BOX 중심점 x=289.5, 459.5, 501.5)
      { page: 4, cond: () => true, x: 289.5, y: 564 },
      { page: 4, cond: () => true, x: 501.5, y: 564 },
      { page: 4, cond: () => true, x: 459.5, y: 483 },
      { page: 4, cond: () => true, x: 289.5, y: 388 },
      { page: 4, cond: () => true, x: 501.5, y: 388 },
      { page: 4, cond: () => true, x: 289.5, y: 175 },
      { page: 4, cond: () => true, x: 501.5, y: 175 },

      // 8P(고객확인서 개인용): 대상자(수익자), 주민등록번호, 성별(남/여), 실제소유자(예), 거래목적(보험금수령)
      { page: 7, cond: () => true, x: 141, y: 691 }, // 대상자구분: 수익자
      { page: 7, cond: () => true, x: 401, y: 653 }, // 실명번호: 주민등록번호
      { page: 7, cond: (d) => d.beneficiaryGender === 'M', x: 282, y: 640 },
      { page: 7, cond: (d) => d.beneficiaryGender === 'F', x: 306, y: 640 },
      { page: 7, cond: () => true, x: 125, y: 426 }, // 실제소유자 여부: 예
      { page: 7, cond: () => true, x: 315, y: 381 }  // 거래목적: 보험 및 대출 제지급금 수령
    ],
    signatures: [
      { page: 0, role: 'beneficiary', x: 455, y: 217, w: 50, h: 20 },
      { page: 4, role: 'insured', cond: (d) => !d.isUnder14, x: 218, y: 114, w: 48, h: 20 },
      { page: 4, role: 'beneficiary', x: 218, y: 83, w: 48, h: 20 },
      { page: 4, role: 'guardian', cond: (d) => d.isUnder19, x: 486, y: 114, w: 48, h: 20 },
      { page: 7, role: 'beneficiary', x: 265, y: 299, w: 48, h: 20 } // 8P 고객확인서 서명
    ]
  },

  // ==================== [2. AIA생명] (AIA생명 보험금청구서.pdf - 벡터 셀·체크박스 실측 보정 완료) ====================
  aia_life: {
    fields: [
      // 1P 상단: 피보험자 (가로 1줄 배치: 한글이름 / 주민등록번호 / 휴대폰번호, 실측 셀 y=670.6..685.6)
      { page: 0, key: 'insuredName', x: 150, y: 673, size: 9.5, bold: true },
      { page: 0, key: 'insuredRrnFull', x: 278, y: 673, size: 9.5 },
      { page: 0, key: 'insuredPhone', x: 452, y: 673, size: 9.5 },

      // 1P 상단: 수익자 (한글이름 / 주민등록번호 / 휴대폰번호 / 주소 / 직업, 실측 셀 y=654.6, 638.4, 590.5)
      { page: 0, key: 'beneficiaryName', x: 150, y: 657, size: 9.5, bold: true },
      { page: 0, key: 'beneficiaryRrnFull', x: 278, y: 657, size: 9.5 },
      { page: 0, key: 'beneficiaryPhone', x: 452, y: 657, size: 9.5 },
      { page: 0, key: 'beneficiaryAddress', x: 332, y: 641, size: 9 },
      { page: 0, key: 'beneficiaryJob', x: 150, y: 593, size: 9 },

      // 1P 중단: 보험금 수령 계좌 (은행명 / 계좌번호 / 예금주, 실측 셀 y=444.6..459.6)
      { page: 0, key: 'bankName', x: 150, y: 447, size: 9.5 },
      { page: 0, key: 'accountNumber', x: 276, y: 447, size: 9 },
      { page: 0, key: 'beneficiaryName', x: 405, y: 447, size: 9.5 },

      // 1P 하단: 사고일시, 사고장소, 사고경위, 실손 질병명 (실측 셀 y=323.6, 291.6, 275.6)
      { page: 0, key: 'accidentDate', x: 150, y: 326, size: 9.5 },
      { page: 0, key: 'accidentPlace', x: 295, y: 326, size: 9.5 },
      { page: 0, key: 'accidentDesc', x: 150, y: 294, size: 9 },
      { page: 0, key: 'diagnosisName', x: 150, y: 278, size: 9, bold: true },

      // 1P 최하단: 작성일(우측 상단 y=105) 및 수익자/청구인 성명 박스(x=398..498, y=65.6..85.7)
      { page: 0, key: 'todayYear', x: 478, y: 105, size: 9.5 },
      { page: 0, key: 'todayMonth', x: 522, y: 105, size: 9.5 },
      { page: 0, key: 'todayDay', x: 548, y: 105, size: 9.5 },
      { page: 0, key: 'claimantName', x: 432, y: 71, size: 10, bold: true },

      // 2P & 3P(동의서 1/3, 2/3): 상단 피보험자 성명 박스 (실측 셀 x=131.4..298.4, y=709.4..729.5)
      { page: 1, key: 'insuredName', x: 145, y: 715, size: 10, bold: true },
      { page: 2, key: 'insuredName', x: 145, y: 715, size: 10, bold: true },

      // 4P(동의서 3/3): 동의일자(x=460..557, y=264.7..279.7) 및 3열×2행 가로 서명 표
      { page: 3, key: 'todayYear', x: 465, y: 267, size: 9.5 },
      { page: 3, key: 'todayMonth', x: 512, y: 267, size: 9.5 },
      { page: 3, key: 'todayDay', x: 538, y: 267, size: 9.5 },
      // 윗줄(y=217.6..237.6): 1열 피보험자 / 2열 수익자
      { page: 3, key: 'insuredName', cond: (d) => !d.isUnder14, x: 65, y: 223, size: 10, bold: true },
      { page: 3, key: 'beneficiaryName', cond: (d) => !d.isSameInsBen && !d.isUnder14, x: 250, y: 223, size: 10, bold: true },
      // 아랫줄(y=171.6..191.6): 1열 법정대리인1 / 3열 법정대리인(친권자) 1인 합의 서명란
      { page: 3, key: 'guardianName19', cond: (d) => d.isUnder19, x: 65, y: 177, size: 10, bold: true },
      { page: 3, key: 'guardianName19', cond: (d) => d.isUnder19, x: 432, y: 177, size: 10, bold: true }
    ],
    checks: [
      // 1P(실측 8x8 체크박스 좌표): 국적 대한민국(필수), 직전계좌, 일시금, 청구유형, 청구사유
      { page: 0, cond: () => true, x: 150, y: 578 }, // 국적: 대한민국 (체크 필수)
      { page: 0, cond: (d) => d.useAutoTransfer, x: 35, y: 464 },
      { page: 0, cond: () => true, x: 100, y: 432 }, // 사고연금: 일시금
      { page: 0, cond: (d) => d.accidentType === '질병', x: 100, y: 374 },
      { page: 0, cond: (d) => d.accidentType !== '질병', x: 180, y: 374 },
      { page: 0, cond: (d) => d.coverages.includes('입원'), x: 100, y: 358 },
      { page: 0, cond: (d) => d.coverages.includes('수술'), x: 180, y: 358 },
      { page: 0, cond: (d) => d.coverages.includes('통원'), x: 435, y: 358 },
      { page: 0, cond: (d) => d.coverages.includes('실손의료비'), x: 100, y: 343 },
      { page: 0, cond: (d) => d.coverages.includes('진단'), x: 231, y: 343 },
      { page: 0, cond: (d) => d.coverages.includes('장해'), x: 340, y: 343 },

      // 2P(동의서 1/3 - 실측 12x12 네모칸 x=511..522 정중앙): 수집·이용 동의함 3곳
      { page: 1, cond: () => true, x: 512, y: 436 },
      { page: 1, cond: () => true, x: 512, y: 373 },
      { page: 1, cond: () => true, x: 512, y: 296 },

      // 3P(동의서 2/3 - 실측 네모칸 정중앙): 국내제공 3곳 + 국외 민감정보 1곳
      { page: 2, cond: () => true, x: 512, y: 585 },
      { page: 2, cond: () => true, x: 512, y: 518 },
      { page: 2, cond: () => true, x: 512, y: 442 },
      { page: 2, cond: () => true, x: 512, y: 76 },

      // 4P(동의서 3/3 - 실측 네모칸 정중앙): 국외 개인신용 1곳 + 조회 3곳 + 손해사정서 수령 동의 3곳
      { page: 3, cond: () => true, x: 512, y: 674 },
      { page: 3, cond: () => true, x: 512, y: 469 },
      { page: 3, cond: () => true, x: 512, y: 437 },
      { page: 3, cond: () => true, x: 512, y: 370 },
      { page: 3, cond: () => true, x: 133, y: 306 },
      { page: 3, cond: () => true, x: 285, y: 306 },
      { page: 3, cond: () => true, x: 438, y: 306 }
    ],
    signatures: [
      { page: 0, role: 'beneficiary', x: 505, y: 71, w: 52, h: 18 },
      { page: 3, role: 'insured', cond: (d) => !d.isUnder14, x: 142, y: 223, w: 48, h: 18 },
      { page: 3, role: 'beneficiary', cond: (d) => !d.isSameInsBen && !d.isUnder14, x: 326, y: 223, w: 48, h: 18 },
      { page: 3, role: 'guardian', cond: (d) => d.isUnder19, x: 142, y: 177, w: 48, h: 18 },
      { page: 3, role: 'guardian', cond: (d) => d.isUnder19, x: 510, y: 177, w: 48, h: 18 }
    ]
  },

  // ==================== [3. 카디프생명] (BNP파리바카디프생명 보험금청구서.pdf - 4P 동의일 및 체크박스 정밀보정 완료) ====================
  cardif_life: {
    fields: [
      { page: 0, key: 'insuredName', x: 95, y: 702, size: 10, bold: true },
      { page: 0, key: 'insuredRrnFull', x: 250, y: 702, size: 10 },
      { page: 0, key: 'insuredPhone', x: 432, y: 702, size: 9.5 },
      { page: 0, key: 'beneficiaryName', x: 95, y: 652, size: 10, bold: true },
      { page: 0, key: 'beneficiaryRrnFull', x: 250, y: 652, size: 10 },
      { page: 0, key: 'beneficiaryPhone', x: 432, y: 652, size: 9.5 },
      { page: 0, key: 'beneficiaryAddress', x: 95, y: 622, size: 9 },
      { page: 0, key: 'relSelf', x: 445, y: 622, size: 9.5 },
      { page: 0, key: 'bankName', x: 95, y: 593, size: 10 },
      { page: 0, key: 'accountNumber', x: 245, y: 593, size: 10 },
      { page: 0, key: 'beneficiaryName', x: 432, y: 593, size: 10 },
      // 1P 재해발생 시간, 장소, 경위
      { page: 0, key: 'accYear', x: 112, y: 370, size: 9.5 },
      { page: 0, key: 'accMonth', x: 166, y: 370, size: 9.5 },
      { page: 0, key: 'accDay', x: 206, y: 370, size: 9.5 },
      { page: 0, key: 'accidentPlace', x: 112, y: 347, size: 9.5 },
      { page: 0, key: 'descWithDiag', x: 112, y: 309, size: 9.5 },
      // 1P 하단 확인일 및 확인자 성명
      { page: 0, key: 'todayYear', x: 148, y: 136, size: 10 },
      { page: 0, key: 'todayMonth', x: 218, y: 136, size: 10 },
      { page: 0, key: 'todayDay', x: 274, y: 136, size: 10 },
      { page: 0, key: 'claimantName', x: 468, y: 136, size: 10, bold: true },
      // 4P(동의서 3/3, W:612 H:792): 우측 동의일(x=372..562) 및 성명란
      { page: 3, key: 'todayYear', x: 428, y: 158, size: 10 },
      { page: 3, key: 'todayMonth', x: 492, y: 158, size: 10 },
      { page: 3, key: 'todayDay', x: 536, y: 158, size: 10 },
      { page: 3, key: 'insuredName', cond: (d) => !d.isUnder14, x: 135, y: 132, size: 10, bold: true },
      { page: 3, key: 'beneficiaryName', cond: (d) => !d.isSameInsBen || !d.isUnder14, x: 135, y: 110, size: 10, bold: true },
      { page: 3, key: 'guardianName19', cond: (d) => d.isUnder19, x: 398, y: 132, size: 10, bold: true }
    ],
    checks: [
      // 1P(실측 6.6x6.6 네모박스 정중앙: x=95.5, 293, 154.5, 213.5, 272.5, 449, 39)
      { page: 0, cond: (d) => d.accidentType === '질병', x: 95.5, y: 505 },
      { page: 0, cond: (d) => d.accidentType !== '질병', x: 293, y: 505 },
      { page: 0, cond: (d) => d.coverages.includes('입원'), x: 95.5, y: 470 },
      { page: 0, cond: (d) => d.coverages.includes('수술'), x: 154.5, y: 470 },
      { page: 0, cond: (d) => d.coverages.includes('진단'), x: 213.5, y: 470 },
      { page: 0, cond: (d) => d.coverages.includes('장해'), x: 272.5, y: 470 },
      { page: 0, cond: (d) => d.coverages.includes('실손의료비') || d.coverages.includes('통원'), x: 449, y: 470 },
      { page: 0, cond: () => true, x: 95.5, y: 448 }, // 모든 유지계약 심사·지급 요청
      { page: 0, cond: (d) => d.notifyCustomer, x: 39, y: 229 },
      // 2~4P 상세동의서 □ 동의함 11곳 (실측 x=524)
      { page: 1, cond: () => true, x: 524, y: 424 },
      { page: 1, cond: () => true, x: 524, y: 346 },
      { page: 1, cond: () => true, x: 524, y: 251 },
      { page: 2, cond: () => true, x: 524, y: 554 },
      { page: 2, cond: () => true, x: 524, y: 477 },
      { page: 2, cond: () => true, x: 524, y: 382 },
      { page: 2, cond: () => true, x: 524, y: 70 },
      { page: 3, cond: () => true, x: 524, y: 692 },
      { page: 3, cond: () => true, x: 524, y: 381 },
      { page: 3, cond: () => true, x: 524, y: 332 },
      { page: 3, cond: () => true, x: 524, y: 237 }
    ],
    signatures: [
      { page: 0, role: 'beneficiary', x: 525, y: 136, w: 48, h: 18 },
      { page: 3, role: 'insured', cond: (d) => !d.isUnder14, x: 242, y: 132, w: 48, h: 18 },
      { page: 3, role: 'beneficiary', cond: (d) => !d.isSameInsBen || !d.isUnder14, x: 242, y: 110, w: 48, h: 18 },
      { page: 3, role: 'guardian', cond: (d) => d.isUnder19, x: 502, y: 132, w: 48, h: 18 }
    ]
  },

  // ==================== [4. DB생명] (db생명 보험금청구서.pdf - 직업란·청구유형 박스 정밀보정 완료) ====================
  db_life: {
    fields: [
      { page: 0, key: 'insuredName', x: 125, y: 703, size: 10, bold: true },
      { page: 0, key: 'insuredRrnFull', x: 235, y: 703, size: 10 },
      { page: 0, key: 'insuredPhone', x: 385, y: 703, size: 9.5 },
      { page: 0, key: 'insuredJob', x: 532, y: 703, size: 9 },
      { page: 0, key: 'beneficiaryName', x: 125, y: 680, size: 10, bold: true },
      { page: 0, key: 'beneficiaryRrnFull', x: 235, y: 680, size: 10 },
      { page: 0, key: 'beneficiaryPhone', x: 385, y: 680, size: 9.5 },
      { page: 0, key: 'relSelf', x: 554, y: 680, size: 9.5 },
      { page: 0, key: 'beneficiaryAddress', x: 125, y: 656, size: 9 },
      { page: 0, key: 'beneficiaryJob', x: 245, y: 632, size: 9 }, // 안내문구 겹침 방지 x=245
      // 1P 수령계좌 및 사고내용
      { page: 0, key: 'bankName', x: 115, y: 506, size: 10 },
      { page: 0, key: 'accountNumber', x: 250, y: 506, size: 10 },
      { page: 0, key: 'beneficiaryName', x: 440, y: 506, size: 10 },
      { page: 0, key: 'accYear', x: 142, y: 356, size: 9.5 },
      { page: 0, key: 'accMonth', x: 196, y: 356, size: 9.5 },
      { page: 0, key: 'accDay', x: 232, y: 356, size: 9.5 },
      { page: 0, key: 'accidentPlace', x: 398, y: 356, size: 9.5 },
      { page: 0, key: 'accidentDesc', x: 102, y: 324, size: 9.5 },
      { page: 0, key: 'diagnosisName', x: 405, y: 338, size: 9.5, bold: true },
      // 1P 하단 청구일자 및 수익자/대표친권자 성명
      { page: 0, key: 'todayYear', x: 105, y: 97, size: 10 },
      { page: 0, key: 'todayMonth', x: 172, y: 97, size: 10 },
      { page: 0, key: 'todayDay', x: 218, y: 97, size: 10 },
      { page: 0, key: 'beneficiaryName', x: 375, y: 110, size: 10, bold: true },
      { page: 0, key: 'guardianName19', cond: (d) => d.isUnder19, x: 375, y: 93, size: 10, bold: true },
      // 4P(동의서 3/3): 신청일 및 피보험자/수익자/친권자 성명
      { page: 3, key: 'todayYear', x: 372, y: 123, size: 10 },
      { page: 3, key: 'todayMonth', x: 455, y: 123, size: 10 },
      { page: 3, key: 'todayDay', x: 525, y: 123, size: 10 },
      { page: 3, key: 'insuredName', cond: (d) => !d.isUnder14, x: 85, y: 93, size: 10, bold: true },
      { page: 3, key: 'beneficiaryName', cond: (d) => !d.isSameInsBen || !d.isUnder14, x: 85, y: 66, size: 10, bold: true },
      { page: 3, key: 'guardianName19', cond: (d) => d.isUnder19, x: 315, y: 93, size: 10, bold: true }
    ],
    checks: [
      { page: 0, cond: (d) => d.accidentType === '질병', x: 98, y: 425 },
      { page: 0, cond: (d) => d.accidentType !== '질병', x: 342, y: 425 },
      // 청구 유형 네모박스 정중앙 정렬 (42pt 간격)
      { page: 0, cond: (d) => d.coverages.includes('장해'), x: 138, y: 386 },
      { page: 0, cond: (d) => d.coverages.includes('진단'), x: 180, y: 386 },
      { page: 0, cond: (d) => d.coverages.includes('수술'), x: 222, y: 386 },
      { page: 0, cond: (d) => d.coverages.includes('입원'), x: 264, y: 386 },
      { page: 0, cond: (d) => d.coverages.includes('통원'), x: 306, y: 386 },
      { page: 0, cond: (d) => d.coverages.includes('실손의료비'), x: 348, y: 386 },
      { page: 0, cond: () => true, x: 518, y: 392 }, // 연금/분할: 일시
      { page: 0, cond: () => true, x: 264, y: 273 }, // 의료급여: 아니오
      { page: 0, cond: (d) => d.notifyCustomer, x: 123, y: 216 },
      { page: 0, cond: (d) => d.notifyCustomer, x: 370, y: 216 },
      { page: 0, cond: (d) => d.notifyPlanner, x: 123, y: 202 },
      { page: 0, cond: (d) => d.notifyCustomer, x: 370, y: 202 },
      // 2~4P 상세동의서 동의함 10곳
      { page: 1, cond: () => true, x: 484, y: 301 },
      { page: 1, cond: () => true, x: 484, y: 198 },
      { page: 1, cond: () => true, x: 484, y: 59 },
      { page: 2, cond: () => true, x: 485, y: 288 },
      { page: 2, cond: () => true, x: 485, y: 185 },
      { page: 2, cond: () => true, x: 485, y: 75 },
      { page: 3, cond: () => true, x: 485, y: 552 },
      { page: 3, cond: () => true, x: 485, y: 314 },
      { page: 3, cond: () => true, x: 485, y: 238 },
      { page: 3, cond: () => true, x: 485, y: 163 }
    ],
    signatures: [
      { page: 0, role: 'beneficiary', x: 485, y: 110, w: 48, h: 18 },
      { page: 0, role: 'guardian', cond: (d) => d.isUnder19, x: 485, y: 93, w: 48, h: 18 },
      { page: 3, role: 'insured', cond: (d) => !d.isUnder14, x: 155, y: 93, w: 48, h: 20 },
      { page: 3, role: 'beneficiary', cond: (d) => !d.isSameInsBen || !d.isUnder14, x: 155, y: 66, w: 48, h: 20 },
      { page: 3, role: 'guardian', cond: (d) => d.isUnder19, x: 375, y: 93, w: 48, h: 20 }
    ]
  },

  // ==================== [5. iM라이프생명보험] (im라이프 보험금청구서.pdf - 정밀보정 및 5P 고객거래확인서 반영) ====================
  im_life: {
    fields: [
      // 1P 상단: 사고(발병)일시, 장소, 경위, 병명 (병명코드 괄호 침범 방지 x=162 적용)
      { page: 0, key: 'accYearShort', x: 214, y: 646, size: 9.5 },
      { page: 0, key: 'accMonth', x: 248, y: 646, size: 9.5 },
      { page: 0, key: 'accDay', x: 280, y: 646, size: 9.5 },
      { page: 0, key: 'accidentPlace', x: 466, y: 646, size: 9.5 },
      { page: 0, key: 'accidentDesc', x: 200, y: 623, size: 9.5 },
      { page: 0, key: 'diagnosisName', x: 162, y: 602, size: 8.5, bold: true },

      // 1P 중단: 피보험자 인적사항 (하이픈 분리형 정밀 정렬, 실측 y=495, 479)
      { page: 0, key: 'insuredName', x: 105, y: 495, size: 10, bold: true },
      { page: 0, key: 'insuredRrn1', x: 254, y: 495, size: 9.5 },
      { page: 0, key: 'insuredRrn2', x: 308, y: 495, size: 9.5 },
      { page: 0, key: 'insuredPhone1', x: 454, y: 495, size: 9.5 },
      { page: 0, key: 'insuredPhone2', x: 493, y: 495, size: 9.5 },
      { page: 0, key: 'insuredPhone3', x: 533, y: 495, size: 9.5 },
      { page: 0, key: 'insuredAddress', x: 105, y: 479, size: 9 },
      { page: 0, key: 'insuredJob', x: 454, y: 479, size: 9.5 },

      // 1P 중단: 보험수익자 정보 및 송금계좌 (실측 y=443, 427, 410, 377)
      { page: 0, key: 'beneficiaryName', x: 105, y: 443, size: 10, bold: true },
      { page: 0, key: 'beneficiaryRrn1', x: 432, y: 443, size: 9.5 },
      { page: 0, key: 'beneficiaryRrn2', x: 496, y: 443, size: 9.5 },
      { page: 0, key: 'beneficiaryPhone1', x: 432, y: 427, size: 9.5 },
      { page: 0, key: 'beneficiaryPhone2', x: 474, y: 427, size: 9.5 },
      { page: 0, key: 'beneficiaryPhone3', x: 520, y: 427, size: 9.5 },
      { page: 0, key: 'beneficiaryAddress', x: 105, y: 410, size: 9 },
      { page: 0, key: 'bankName', x: 152, y: 377, size: 10 },
      { page: 0, key: 'accountNumber', x: 308, y: 377, size: 10 },
      { page: 0, key: 'beneficiaryName', x: 475, y: 377, size: 10 },

      // 1P 하단: 청구자 정보 및 작성일 (실측 y=124, 103)
      { page: 0, key: 'claimantName', x: 82, y: 124, size: 10, bold: true },
      { page: 0, key: 'relSelf', x: 220, y: 124, size: 9.5 },
      { page: 0, key: 'beneficiaryRrn1', x: 315, y: 124, size: 9 },
      { page: 0, key: 'beneficiaryRrn2', x: 374, y: 124, size: 9 },
      { page: 0, key: 'beneficiaryPhone1', x: 460, y: 124, size: 9 },
      { page: 0, key: 'beneficiaryPhone2', x: 492, y: 124, size: 9 },
      { page: 0, key: 'beneficiaryPhone3', x: 528, y: 124, size: 9 },
      { page: 0, key: 'todayYearShort', x: 248, y: 103, size: 10 },
      { page: 0, key: 'todayMonth', x: 305, y: 103, size: 10 },
      { page: 0, key: 'todayDay', x: 358, y: 103, size: 10 },

      // 4P(동의서 3/3): 동의일 및 피보험자/수익자/법정대리인1 성명 (실측 셀 y=251, 215, 188)
      { page: 3, key: 'todayYearShort', x: 224, y: 251, size: 10 },
      { page: 3, key: 'todayMonth', x: 278, y: 251, size: 10 },
      { page: 3, key: 'todayDay', x: 322, y: 251, size: 10 },
      { page: 3, key: 'insuredName', cond: (d) => !d.isUnder14, x: 76, y: 215, size: 9.5, bold: true },
      { page: 3, key: 'beneficiaryName', cond: (d) => !d.isSameInsBen || !d.isUnder14, x: 76, y: 188, size: 9.5, bold: true },
      { page: 3, key: 'guardianName19', cond: (d) => d.isUnder19, x: 212, y: 215, size: 9.5, bold: true },

      // 5P(개인고객 거래 확인서 - page: 4 추가 작성): 실명번호, 성명, 자택주소, 연락처, 작성일자
      { page: 4, key: 'beneficiaryRrnFull', x: 115, y: 618, size: 9.5 },
      { page: 4, key: 'beneficiaryName', x: 278, y: 618, size: 10, bold: true },
      { page: 4, key: 'beneficiaryAddress', x: 192, y: 422, size: 8.5 },
      { page: 4, key: 'beneficiaryPhone', x: 430, y: 422, size: 9 },
      { page: 4, key: 'todayDateSlash', x: 115, y: 114, size: 9.5 }
    ],
    checks: [
      // 1P: 발생원인(질병 x=97 / 재해 x=262), 청구사유(34pt 정밀 간격), 의료급여(N), 자동이체, 문자안내
      { page: 0, cond: (d) => d.accidentType === '질병', x: 97, y: 687 },
      { page: 0, cond: (d) => d.accidentType !== '질병', x: 262, y: 687 },
      { page: 0, cond: (d) => d.coverages.includes('장해'), x: 130.5, y: 673 },
      { page: 0, cond: (d) => d.coverages.includes('진단'), x: 164.5, y: 673 },
      { page: 0, cond: (d) => d.coverages.includes('입원'), x: 198.5, y: 673 },
      { page: 0, cond: (d) => d.coverages.includes('수술'), x: 232.5, y: 673 },
      { page: 0, cond: (d) => d.coverages.includes('통원'), x: 266.5, y: 673 },
      { page: 0, cond: (d) => d.coverages.includes('실손의료비'), x: 300.5, y: 673 },
      { page: 0, cond: () => true, x: 269, y: 575 }, // 의료급여 수급권자: N
      { page: 0, cond: (d) => d.useAutoTransfer, x: 102, y: 395 },
      { page: 0, cond: (d) => d.notifyCustomer, x: 431, y: 339 },

      // 2P(동의서 1): □동의함 3곳 (실측 x=499, y=555, 499, 406)
      { page: 1, cond: () => true, x: 499, y: 555 },
      { page: 1, cond: () => true, x: 499, y: 499 },
      { page: 1, cond: () => true, x: 499, y: 406 },

      // 3P(동의서 2): 국내제공 3곳(x=499) + 국외제공 2곳(x=497)
      { page: 2, cond: () => true, x: 499, y: 748 },
      { page: 2, cond: () => true, x: 499, y: 672 },
      { page: 2, cond: () => true, x: 499, y: 570 },
      { page: 2, cond: () => true, x: 497, y: 171 },
      { page: 2, cond: () => true, x: 497, y: 90 },

      // 4P(동의서 3): 조회 □동의함 3곳 (실측 x=499, y=523, 457, 342)
      { page: 3, cond: () => true, x: 499, y: 523 },
      { page: 3, cond: () => true, x: 499, y: 457 },
      { page: 3, cond: () => true, x: 499, y: 342 },

      // 5P(개인고객 거래 확인서): 개인(119,591), 실제소유자 예(115,323), 사고보험금 수령(163,212)
      { page: 4, cond: () => true, x: 119, y: 591 },
      { page: 4, cond: () => true, x: 115, y: 323 },
      { page: 4, cond: () => true, x: 163, y: 212 }
    ],
    signatures: [
      { page: 0, role: 'beneficiary', x: 135, y: 124, w: 42, h: 18 },
      { page: 3, role: 'insured', cond: (d) => !d.isUnder14, x: 112, y: 215, w: 38, h: 18 },
      { page: 3, role: 'beneficiary', cond: (d) => !d.isSameInsBen || !d.isUnder14, x: 112, y: 188, w: 38, h: 18 },
      { page: 3, role: 'guardian', cond: (d) => d.isUnder19, x: 244, y: 215, w: 38, h: 18 },
      // 4P 우측 하단 '법정대리인 1인 합의' 전용 서명칸(x=450..540, y=177..205) 정중앙 배치
      { page: 3, role: 'guardian', cond: (d) => d.isUnder19, x: 458, y: 188, w: 55, h: 18 }
    ]
  },

  // ==================== [6. KB라이프생명] (KB생명 보험금청구서.pdf - 날짜 겹침 및 체크박스 정밀보정 완료) ====================
  kb_life: {
    fields: [
      // 1P 상단: 초진병원명, 최초진료일, 사고일시, 장소, 사고내용 상세(진단명 포함) (실측 y=665, 637, 623)
      { page: 0, key: 'hospitalName', x: 290, y: 665, size: 9.5 },
      { page: 0, key: 'accYear', x: 466, y: 665, size: 8.5 },
      { page: 0, key: 'accMonth', x: 502, y: 665, size: 8.5 },
      { page: 0, key: 'accDay', x: 538, y: 665, size: 8.5 },
      { page: 0, key: 'accYear', x: 130, y: 637, size: 9.5 },
      { page: 0, key: 'accMonth', x: 182, y: 637, size: 9.5 },
      { page: 0, key: 'accDay', x: 222, y: 637, size: 9.5 },
      { page: 0, key: 'accidentPlace', x: 390, y: 637, size: 9.5 },
      { page: 0, key: 'descWithDiag', x: 130, y: 623, size: 9.5 },

      // 1P 중단: 피보험자 및 수익자 인적사항 (실측 y=511, 496, 479, 423, 409)
      { page: 0, key: 'insuredName', x: 130, y: 511, size: 10, bold: true },
      { page: 0, key: 'insuredRrnFull', x: 255, y: 511, size: 9.5 },
      { page: 0, key: 'insuredPhone', x: 380, y: 511, size: 9 },
      { page: 0, key: 'insuredJob', x: 492, y: 511, size: 9 },
      { page: 0, key: 'beneficiaryName', x: 130, y: 496, size: 10, bold: true },
      { page: 0, key: 'beneficiaryRrnFull', x: 255, y: 496, size: 9.5 },
      { page: 0, key: 'beneficiaryPhone', x: 380, y: 496, size: 9 },
      { page: 0, key: 'relSelf', x: 140, y: 479, size: 9.5 },
      { page: 0, key: 'beneficiaryJob', x: 255, y: 479, size: 9 },
      { page: 0, key: 'beneficiaryAddress', x: 205, y: 423, size: 9 },
      { page: 0, key: 'bankName', x: 165, y: 409, size: 10 },
      { page: 0, key: 'accountNumber', x: 330, y: 409, size: 10 },
      { page: 0, key: 'beneficiaryName', x: 498, y: 409, size: 10 },

      // 1P 하단: 작성일(년 x=234, 월 x=292, 일 x=350 기준 정밀배치) 및 수익자/법정대리인(부·모) 성명
      { page: 0, key: 'todayYear', x: 198, y: 178, size: 10 },
      { page: 0, key: 'todayMonth', x: 258, y: 178, size: 10 },
      { page: 0, key: 'todayDay', x: 312, y: 178, size: 10 },
      { page: 0, key: 'beneficiaryName', x: 115, y: 152, size: 10, bold: true },
      { page: 0, key: 'guardianFatherName', cond: (d) => d.isUnder19 && d.guardianRel !== '모', x: 354, y: 152, size: 9.5, bold: true },
      { page: 0, key: 'guardianMotherName', cond: (d) => d.isUnder19 && d.guardianRel === '모', x: 476, y: 152, size: 9.5, bold: true },

      // 4P(동의서 3/3): 동의일자(년 x=476 기준) 및 표 형태 성명란 (실측 y=214, 181, 164)
      { page: 3, key: 'todayYear', x: 445, y: 214, size: 9.5 },
      { page: 3, key: 'todayMonth', x: 496, y: 214, size: 9.5 },
      { page: 3, key: 'todayDay', x: 542, y: 214, size: 9.5 },
      { page: 3, key: 'insuredName', cond: (d) => !d.isUnder14, x: 152, y: 181, size: 10, bold: true },
      { page: 3, key: 'beneficiaryName', cond: (d) => !d.isSameInsBen || !d.isUnder14, x: 152, y: 164, size: 10, bold: true },
      { page: 3, key: 'guardianName19', cond: (d) => d.isUnder19, x: 430, y: 181, size: 10, bold: true }
    ],
    checks: [
      // 1P(실측 8.5x8.5 네모칸 중심): 청구사유, 발생원인, 일시금, 동일체크, 실제소유자 예, 자택, 알림톡, FAX
      { page: 0, cond: (d) => d.coverages.includes('수술'), x: 91, y: 680 },
      { page: 0, cond: (d) => d.coverages.includes('입원'), x: 121.5, y: 680 },
      { page: 0, cond: (d) => d.coverages.includes('장해'), x: 214, y: 680 },
      { page: 0, cond: (d) => d.coverages.includes('진단'), x: 290, y: 680 },
      { page: 0, cond: (d) => d.coverages.includes('통원'), x: 382, y: 680 },
      { page: 0, cond: (d) => d.coverages.includes('실손의료비'), x: 412, y: 680 },
      { page: 0, cond: (d) => d.accidentType === '질병', x: 91, y: 666 },
      { page: 0, cond: (d) => d.accidentType === '상해', x: 121.5, y: 666 },
      { page: 0, cond: (d) => d.accidentType === '교통사고', x: 165.5, y: 666 },
      { page: 0, cond: () => true, x: 335, y: 595 }, // 사고 분할보험금: 일시금
      { page: 0, cond: (d) => d.isSameInsBen, x: 350, y: 555 },
      { page: 0, cond: () => true, x: 382, y: 479 }, // 실제소유자 여부: 예
      { page: 0, cond: () => true, x: 130, y: 423 }, // 주소: 자택
      { page: 0, cond: (d) => d.notifyCustomer, x: 132, y: 372 },
      { page: 0, cond: () => true, x: 266, y: 44 },  // 접수경로: FAX

      // 2P(동의서 1/3 - 실측 10x10 박스 x=533.3..543.3): 동의함 3곳
      { page: 1, cond: () => true, x: 534, y: 419 },
      { page: 1, cond: () => true, x: 534, y: 338 },
      { page: 1, cond: () => true, x: 534, y: 233 },

      // 3P(동의서 2/3 - 실측 박스 x=532.2..542.2): 국내제공 동의함 3곳
      { page: 2, cond: () => true, x: 533, y: 501 },
      { page: 2, cond: () => true, x: 533, y: 429 },
      { page: 2, cond: () => true, x: 533, y: 332 },

      // 4P(동의서 3/3 - 실측 박스 x=532.7..543.3): 국외제공 2곳 + 조회 3곳
      { page: 3, cond: () => true, x: 533.5, y: 673 },
      { page: 3, cond: () => true, x: 533.5, y: 580 },
      { page: 3, cond: () => true, x: 534, y: 356 },
      { page: 3, cond: () => true, x: 534, y: 312 },
      { page: 3, cond: () => true, x: 534, y: 236 }
    ],
    signatures: [
      { page: 0, role: 'beneficiary', x: 188, y: 152, w: 45, h: 18 },
      { page: 0, role: 'guardian', cond: (d) => d.isUnder19 && d.guardianRel !== '모', x: 388, y: 152, w: 42, h: 18 },
      { page: 0, role: 'guardian', cond: (d) => d.isUnder19 && d.guardianRel === '모', x: 512, y: 152, w: 42, h: 18 },
      { page: 3, role: 'insured', cond: (d) => !d.isUnder14, x: 245, y: 181, w: 48, h: 18 },
      { page: 3, role: 'beneficiary', cond: (d) => !d.isSameInsBen || !d.isUnder14, x: 245, y: 164, w: 48, h: 18 },
      { page: 3, role: 'guardian', cond: (d) => d.isUnder19, x: 522, y: 181, w: 48, h: 18 }
    ]
  },

  // ==================== [7. KDB생명] (kdb생명 보험금청구서.pdf - 체크박스·날짜·동의서 서명 정밀보정 완료) ====================
  kdb_life: {
    fields: [
      // 1P 상단: 피보험자 및 수익자 인적사항 (실측 y=736, 710, 685, 660, 606, 585)
      { page: 0, key: 'insuredName', x: 145, y: 736, size: 10, bold: true },
      { page: 0, key: 'insuredRrnFull', x: 295, y: 736, size: 10 },
      { page: 0, key: 'insuredPhone', x: 445, y: 736, size: 9.5 },
      { page: 0, key: 'insuredJob', x: 155, y: 710, size: 9.5 },
      { page: 0, key: 'beneficiaryName', x: 145, y: 685, size: 10, bold: true },
      { page: 0, key: 'beneficiaryRrnFull', x: 295, y: 685, size: 10 },
      { page: 0, key: 'beneficiaryPhone', x: 445, y: 685, size: 9.5 },
      { page: 0, key: 'beneficiaryAddress', x: 145, y: 660, size: 9 },
      { page: 0, key: 'beneficiaryJob', x: 192, y: 606, size: 9.5 },
      { page: 0, key: 'bankName', x: 135, y: 585, size: 10 },
      { page: 0, key: 'beneficiaryName', x: 245, y: 585, size: 10 },
      { page: 0, key: 'accountNumber', x: 358, y: 585, size: 10 },

      // 1P 중단: 사고일시('일' 겹침 방지 x=166, 204, 234), 장소, 경위, 병명 (실측 y=399, 381, 324)
      { page: 0, key: 'accYearShort', x: 166, y: 399, size: 9.5 },
      { page: 0, key: 'accMonth', x: 204, y: 399, size: 9.5 },
      { page: 0, key: 'accDay', x: 234, y: 399, size: 9.5 },
      { page: 0, key: 'accidentPlace', x: 380, y: 399, size: 9.5 },
      { page: 0, key: 'accidentDesc', x: 145, y: 381, size: 9.5 },
      { page: 0, key: 'diagnosisName', x: 166, y: 324, size: 9.5, bold: true },

      // 1P 하단: 필수안내 확인서명(y=181) 및 청구인 작성란(주민번호 하이픈 x=415.1 기준 분리)
      { page: 0, key: 'beneficiaryName', x: 452, y: 181, size: 10, bold: true },
      { page: 0, key: 'claimantName', x: 96, y: 102, size: 9.5, bold: true },
      { page: 0, key: 'relSelf', x: 262, y: 102, size: 9.5 },
      { page: 0, key: 'beneficiaryRrn1', x: 368, y: 102, size: 9 },
      { page: 0, key: 'beneficiaryRrn2', x: 421, y: 102, size: 9 },
      { page: 0, key: 'beneficiaryPhone', x: 506, y: 102, size: 8.5 },
      { page: 0, key: 'todayDateSlash', x: 96, y: 84, size: 9.5 },

      // 5P(동의서 4/4): 피보험자/수익자/청구자/법정대리인 성명 및 날짜 ('년' 글자 x=245 기준 정렬)
      { page: 4, key: 'insuredName', cond: (d) => !d.isUnder14, x: 155, y: 319, size: 10, bold: true },
      { page: 4, key: 'beneficiaryName', cond: (d) => !d.isSameInsBen || !d.isUnder14, x: 155, y: 294, size: 10, bold: true },
      { page: 4, key: 'claimantName', x: 155, y: 268, size: 10, bold: true },
      { page: 4, key: 'guardianName19', cond: (d) => d.isUnder19, x: 418, y: 313, size: 10, bold: true },
      { page: 4, key: 'todayYear', x: 205, y: 147, size: 10 },
      { page: 4, key: 'todayMonth', x: 292, y: 147, size: 10 },
      { page: 4, key: 'todayDay', x: 342, y: 147, size: 10 }
    ],
    checks: [
      // 1P(실측 9.2x9.2 / 10.2x10.2 네모박스 중심): 의료수급 비대상(339,711), 일시금, 문자안내, 청구유형/사유, 자보 아니오, 일부청구 아니오
      { page: 0, cond: () => true, x: 339, y: 711 },
      { page: 0, cond: () => true, x: 523, y: 556 }, // 사고분할보험금: 일시금
      { page: 0, cond: (d) => d.notifyCustomer, x: 99, y: 511 },
      { page: 0, cond: (d) => d.notifyCustomer, x: 393.5, y: 511 },
      { page: 0, cond: (d) => d.accidentType === '질병', x: 99, y: 437 },
      { page: 0, cond: (d) => d.accidentType !== '질병', x: 240.5, y: 437 },
      { page: 0, cond: (d) => d.coverages.includes('장해'), x: 130.5, y: 418 },
      { page: 0, cond: (d) => d.coverages.includes('진단'), x: 162, y: 418 },
      { page: 0, cond: (d) => d.coverages.includes('수술'), x: 194, y: 418 },
      { page: 0, cond: (d) => d.coverages.includes('입원'), x: 225.5, y: 418 },
      { page: 0, cond: (d) => d.coverages.includes('통원'), x: 257, y: 418 },
      { page: 0, cond: (d) => d.coverages.includes('실손의료비'), x: 397.5, y: 418 },
      { page: 0, cond: () => true, x: 245, y: 362 }, // 자동차보험/산재보험 처리여부: 아니오
      { page: 0, cond: () => true, x: 135, y: 286 }, // 일부청구: 아니오

      // 2P(동의서 1/4): 동의함 3곳 (실측 x=505, y=428, 349, 257)
      { page: 1, cond: () => true, x: 505, y: 428 },
      { page: 1, cond: () => true, x: 505, y: 349 },
      { page: 1, cond: () => true, x: 505, y: 257 },

      // 3P(동의서 2/4): 국내제공 동의함 3곳 (실측 x=505, y=385, 296, 204)
      { page: 2, cond: () => true, x: 505, y: 385 },
      { page: 2, cond: () => true, x: 505, y: 296 },
      { page: 2, cond: () => true, x: 505, y: 204 },

      // 4P(동의서 3/4): 국외제공 동의함 2곳 (실측 x=505, y=205, 114)
      { page: 3, cond: () => true, x: 505, y: 205 },
      { page: 3, cond: () => true, x: 505, y: 114 },

      // 5P(동의서 4/4): 조회 동의함 3곳 (실측 x=505, y=510, 460, 369)
      { page: 4, cond: () => true, x: 505, y: 510 },
      { page: 4, cond: () => true, x: 505, y: 460 },
      { page: 4, cond: () => true, x: 505, y: 369 }
    ],
    signatures: [
      { page: 0, role: 'beneficiary', x: 515, y: 181, w: 45, h: 18 },
      { page: 0, role: 'beneficiary', x: 142, y: 102, w: 42, h: 18 },
      { page: 4, role: 'insured', cond: (d) => !d.isUnder14, x: 245, y: 319, w: 48, h: 18 },
      { page: 4, role: 'beneficiary', cond: (d) => !d.isSameInsBen || !d.isUnder14, x: 245, y: 294, w: 48, h: 18 },
      { page: 4, role: 'beneficiary', x: 245, y: 268, w: 48, h: 18 },
      { page: 4, role: 'guardian', cond: (d) => d.isUnder19, x: 515, y: 313, w: 48, h: 18 }
    ]
  },

  // ==================== [8. 교보생명] (교보생명 보험금청구서.pdf - 정밀보정 완료) ====================
  kyobo_life: {
    fields: [
      { page: 0, key: 'insuredName', x: 105, y: 747, size: 10, bold: true },
      { page: 0, key: 'insuredRrnFull', x: 222, y: 747, size: 10 },
      { page: 0, key: 'insuredPhone', x: 365, y: 747, size: 9.5 },
      { page: 0, key: 'beneficiaryName', x: 105, y: 699, size: 10, bold: true },
      { page: 0, key: 'beneficiaryRrnFull', x: 222, y: 699, size: 10 },
      { page: 0, key: 'beneficiaryPhone', x: 365, y: 699, size: 9.5 },
      { page: 0, key: 'beneficiaryAddress', x: 105, y: 675, size: 9 },
      // 1P 사고일시 ('20' 인쇄 우측 2자리 연도 및 월/일 정렬)
      { page: 0, key: 'accYearShort', x: 148, y: 555, size: 9.5 },
      { page: 0, key: 'accMonth', x: 182, y: 555, size: 9.5 },
      { page: 0, key: 'accDay', x: 212, y: 555, size: 9.5 },
      { page: 0, key: 'accidentPlace', x: 360, y: 555, size: 9.5 },
      { page: 0, key: 'accidentDesc', x: 212, y: 540, size: 9.5 },
      { page: 0, key: 'diagnosisName', x: 312, y: 501, size: 9.5, bold: true },
      // 1P 계좌 및 수익자(청구자)
      { page: 0, key: 'bankName', x: 148, y: 413, size: 10 },
      { page: 0, key: 'accountNumber', x: 292, y: 413, size: 10 },
      { page: 0, key: 'beneficiaryName', x: 472, y: 413, size: 10 },
      { page: 0, key: 'claimantName', x: 382, y: 135, size: 10, bold: true },
      { page: 0, key: 'beneficiaryRrnFull', cond: (d) => !d.isSameInsBen || d.isUnder19, x: 340, y: 83, size: 9 },
      { page: 0, key: 'relIfDiff', cond: (d) => !d.isSameInsBen || d.isUnder19, x: 495, y: 83, size: 9.5 },
      { page: 0, key: 'beneficiaryPhone', cond: (d) => !d.isSameInsBen || d.isUnder19, x: 340, y: 59, size: 9 },
      // 5P(동의서 4/4): 날짜 및 성명
      { page: 4, key: 'todayYearShort', x: 254, y: 145, size: 10 },
      { page: 4, key: 'todayMonth', x: 298, y: 145, size: 10 },
      { page: 4, key: 'todayDay', x: 336, y: 145, size: 10 },
      { page: 4, key: 'insuredName', cond: (d) => !d.isUnder14, x: 222, y: 109, size: 10, bold: true },
      { page: 4, key: 'beneficiaryName', cond: (d) => !d.isSameInsBen || !d.isUnder14, x: 222, y: 80, size: 10, bold: true },
      { page: 4, key: 'guardianName19', cond: (d) => d.isUnder19, x: 432, y: 109, size: 10, bold: true }
    ],
    checks: [
      { page: 0, cond: () => true, x: 232, y: 723 }, // 의료급여: 아니오
      { page: 0, cond: (d) => d.coverages.includes('실손의료비'), x: 76, y: 624 },
      { page: 0, cond: (d) => d.coverages.includes('입원'), x: 158, y: 624 },
      { page: 0, cond: (d) => d.coverages.includes('통원'), x: 215, y: 624 },
      { page: 0, cond: (d) => d.coverages.includes('수술'), x: 273, y: 624 },
      { page: 0, cond: (d) => d.coverages.includes('진단'), x: 331, y: 624 },
      { page: 0, cond: (d) => d.coverages.includes('장해'), x: 389, y: 624 },
      { page: 0, cond: (d) => d.accidentType === '질병', x: 76, y: 601 },
      { page: 0, cond: (d) => d.accidentType !== '질병', x: 135, y: 601 },
      { page: 0, cond: () => true, x: 500, y: 601 }, // 자보/산재 처리여부: 아니오
      { page: 0, cond: () => true, x: 500, y: 466 }, // 미청구보험금: 아니오
      { page: 0, cond: () => true, x: 495, y: 382 }, // 일시금 신청
      { page: 0, cond: (d) => d.notifyCustomer, x: 108, y: 335 },
      { page: 0, cond: () => true, x: 542, y: 235 }, // 4. 필수확인사항: 확인
      { page: 1, cond: () => true, x: 503, y: 338 },
      { page: 1, cond: () => true, x: 503, y: 219 },
      { page: 1, cond: () => true, x: 503, y: 43 },
      { page: 2, cond: () => true, x: 503, y: 310 },
      { page: 2, cond: () => true, x: 503, y: 205 },
      { page: 2, cond: () => true, x: 503, y: 64 },
      { page: 3, cond: () => true, x: 503, y: 319 },
      { page: 3, cond: () => true, x: 503, y: 163 },
      { page: 4, cond: () => true, x: 503, y: 472 },
      { page: 4, cond: () => true, x: 503, y: 383 },
      { page: 4, cond: () => true, x: 503, y: 215 }
    ],
    signatures: [
      { page: 0, role: 'beneficiary', x: 478, y: 135, w: 48, h: 18 },
      { page: 4, role: 'insured', cond: (d) => !d.isUnder14, x: 315, y: 109, w: 45, h: 18 },
      { page: 4, role: 'beneficiary', cond: (d) => !d.isSameInsBen || !d.isUnder14, x: 315, y: 80, w: 45, h: 18 },
      { page: 4, role: 'guardian', cond: (d) => d.isUnder19, x: 528, y: 109, w: 45, h: 18 }
    ]
  },

  // ==================== [9. NH농협생명] (농협생명 보험금청구서.pdf - 동의서 체크박스 및 사고일시 정밀보정 완료) ====================
  nh_life: {
    fields: [
      { page: 0, key: 'insuredName', x: 112, y: 744, size: 10, bold: true },
      { page: 0, key: 'insuredRrnFull', x: 235, y: 744, size: 9.5 },
      { page: 0, key: 'insuredPhone', x: 378, y: 744, size: 9.5 },
      { page: 0, key: 'insuredJob', x: 518, y: 744, size: 9 },
      // 1P 사고일시('월'·'일' 겹침 해소), 장소, 경위, 치료병명
      { page: 0, key: 'accYear', x: 178, y: 673, size: 9.5 },
      { page: 0, key: 'accMonth', x: 226, y: 673, size: 9.5 },
      { page: 0, key: 'accDay', x: 256, y: 673, size: 9.5 },
      { page: 0, key: 'accidentPlace', x: 382, y: 673, size: 9.5 },
      { page: 0, key: 'accidentDesc', x: 235, y: 660, size: 9.5 },
      { page: 0, key: 'diagnosisName', x: 252, y: 608, size: 9.5, bold: true },
      // 1P 수익자 정보 및 수령계좌
      { page: 0, key: 'beneficiaryName', x: 112, y: 565, size: 10, bold: true },
      { page: 0, key: 'beneficiaryRrnFull', x: 235, y: 565, size: 9.5 },
      { page: 0, key: 'beneficiaryPhone', x: 378, y: 565, size: 9.5 },
      { page: 0, key: 'beneficiaryJob', x: 518, y: 565, size: 9 },
      { page: 0, key: 'beneficiaryAddress', x: 112, y: 543, size: 9 },
      { page: 0, key: 'relSelf', x: 530, y: 543, size: 9.5 },
      { page: 0, key: 'bankName', x: 162, y: 469, size: 10 },
      { page: 0, key: 'beneficiaryName', x: 305, y: 469, size: 10 },
      { page: 0, key: 'accountNumber', x: 452, y: 469, size: 10 },
      // 1P 하단 청구일 및 수익자 성명
      { page: 0, key: 'todayYear', x: 138, y: 161, size: 10 },
      { page: 0, key: 'todayMonth', x: 198, y: 161, size: 10 },
      { page: 0, key: 'todayDay', x: 245, y: 161, size: 10 },
      { page: 0, key: 'claimantName', x: 375, y: 161, size: 10, bold: true },
      // 4P(동의서 3/3): 필수기재 날짜 및 피보험자/수익자/친권자 성명
      { page: 3, key: 'todayYear', x: 235, y: 178, size: 10 },
      { page: 3, key: 'todayMonth', x: 292, y: 178, size: 10 },
      { page: 3, key: 'todayDay', x: 342, y: 178, size: 10 },
      { page: 3, key: 'insuredName', cond: (d) => !d.isUnder14, x: 105, y: 139, size: 10, bold: true },
      { page: 3, key: 'beneficiaryName', cond: (d) => !d.isSameInsBen || !d.isUnder14, x: 280, y: 139, size: 10, bold: true },
      { page: 3, key: 'guardianName19', cond: (d) => d.isUnder19, x: 458, y: 146, size: 10, bold: true }
    ],
    checks: [
      { page: 0, cond: (d) => d.accidentType === '질병', x: 123, y: 728 },
      { page: 0, cond: (d) => d.accidentType !== '질병', x: 305, y: 728 },
      { page: 0, cond: (d) => d.coverages.includes('장해'), x: 162, y: 710 },
      { page: 0, cond: (d) => d.coverages.includes('진단'), x: 201, y: 710 },
      { page: 0, cond: (d) => d.coverages.includes('수술'), x: 239, y: 710 },
      { page: 0, cond: (d) => d.coverages.includes('입원'), x: 278, y: 710 },
      { page: 0, cond: (d) => d.coverages.includes('통원'), x: 316, y: 710 },
      { page: 0, cond: (d) => d.coverages.includes('실손의료비'), x: 355, y: 710 },
      { page: 0, cond: () => true, x: 531, y: 660 }, // 자보/산재: 아니오
      { page: 0, cond: () => true, x: 531, y: 629 }, // 의료수급권자: 아니오
      { page: 0, cond: () => true, x: 531, y: 515 }, // 실제소유자: 여
      { page: 0, cond: () => true, x: 134, y: 416 }, // 보험금 수령방법: 일시금
      { page: 0, cond: (d) => d.notifyCustomer, x: 123, y: 335 },
      { page: 0, cond: (d) => d.notifyCustomer, x: 380, y: 335 },
      { page: 0, cond: (d) => d.notifyPlanner, x: 531, y: 335 },
      // 2P(동의서 1/3): '※필수체크' 우측 실제 □ 동의함 네모칸 (x=452)
      { page: 1, cond: () => true, x: 452, y: 363 },
      { page: 1, cond: () => true, x: 452, y: 238 },
      { page: 1, cond: () => true, x: 452, y: 102 },
      // 3P(동의서 2/3): 실제 □ 동의함 네모칸 (x=452)
      { page: 2, cond: () => true, x: 452, y: 289 },
      { page: 2, cond: () => true, x: 452, y: 199 },
      { page: 2, cond: () => true, x: 452, y: 97 },
      // 4P(동의서 3/3): 실제 □ 동의함 네모칸 (x=449)
      { page: 3, cond: () => true, x: 449, y: 444 },
      { page: 3, cond: () => true, x: 449, y: 353 },
      { page: 3, cond: () => true, x: 449, y: 217 }
    ],
    signatures: [
      { page: 0, role: 'beneficiary', x: 505, y: 161, w: 48, h: 18 },
      { page: 3, role: 'insured', cond: (d) => !d.isUnder14, x: 155, y: 139, w: 45, h: 18 },
      { page: 3, role: 'beneficiary', cond: (d) => !d.isSameInsBen || !d.isUnder14, x: 330, y: 139, w: 45, h: 18 },
      { page: 3, role: 'guardian', cond: (d) => d.isUnder19, x: 508, y: 146, w: 45, h: 18 }
    ]
  },

  // ==================== [10. 동양생명] (동양생명 보험금청구서.pdf - 정밀보정 완료) ====================
  tongyang_life: {
    fields: [
      { page: 0, key: 'insuredName', x: 82, y: 706, size: 10, bold: true },
      { page: 0, key: 'insuredRrn1', x: 220, y: 706, size: 9.5 },
      { page: 0, key: 'insuredRrn2', x: 256, y: 706, size: 9 },
      { page: 0, key: 'insuredPhone', x: 448, y: 706, size: 9.5 },
      { page: 0, key: 'insuredJob', x: 225, y: 686, size: 9.5 },
      // 1P 수익자 정보 및 계좌
      { page: 0, key: 'beneficiaryName', x: 112, y: 643, size: 10, bold: true },
      { page: 0, key: 'beneficiaryRrn1', x: 266, y: 643, size: 9.5 },
      { page: 0, key: 'beneficiaryRrn2', x: 312, y: 643, size: 9 },
      { page: 0, key: 'relSelf', x: 438, y: 643, size: 9.5 },
      { page: 0, key: 'beneficiaryPhone', x: 118, y: 628, size: 9.5 },
      { page: 0, key: 'beneficiaryAddress', x: 118, y: 613, size: 9 },
      { page: 0, key: 'bankName', x: 178, y: 590, size: 9.5 },
      { page: 0, key: 'accountNumber', x: 322, y: 590, size: 9.5 },
      { page: 0, key: 'beneficiaryName', x: 505, y: 590, size: 9.5 },
      { page: 0, key: 'beneficiaryJob', x: 435, y: 538, size: 9.5 },
      // 1P 사고일시('일' 겹침 해소), 장소, 경위(우측 라벨 침범 방지 8.5pt), 병명
      { page: 0, key: 'accYear', x: 186, y: 347, size: 9.5 },
      { page: 0, key: 'accMonth', x: 238, y: 347, size: 9.5 },
      { page: 0, key: 'accDay', x: 274, y: 347, size: 9.5 },
      { page: 0, key: 'accidentPlace', x: 398, y: 347, size: 9.5 },
      { page: 0, key: 'accidentDesc', x: 175, y: 336, size: 8.2 },
      { page: 0, key: 'diagnosisName', x: 425, y: 336, size: 9, bold: true },
      { page: 0, key: 'diagnosisName', x: 168, y: 322, size: 9 },
      // 1P 최하단 접수일자 및 청구인(수익자) 성명 (라벨 우측 x=355로 정렬)
      { page: 0, key: 'todayYearShort', x: 150, y: 188, size: 10 },
      { page: 0, key: 'todayMonth', x: 194, y: 188, size: 10 },
      { page: 0, key: 'todayDay', x: 230, y: 188, size: 10 },
      { page: 0, key: 'claimantName', x: 355, y: 188, size: 10, bold: true },
      // 5P(동의서 4/4): 성명 및 날짜 ('년' 글자 x=216.9 기준 정렬)
      { page: 4, key: 'insuredName', cond: (d) => !d.isUnder14, x: 118, y: 168, size: 10, bold: true },
      { page: 4, key: 'beneficiaryName', cond: (d) => !d.isSameInsBen || !d.isUnder14, x: 118, y: 140, size: 10, bold: true },
      { page: 4, key: 'guardianName19', cond: (d) => d.isUnder19, x: 382, y: 168, size: 10, bold: true },
      { page: 4, key: 'todayYear', x: 178, y: 97, size: 10 },
      { page: 4, key: 'todayMonth', x: 262, y: 97, size: 10 },
      { page: 4, key: 'todayDay', x: 336, y: 97, size: 10 }
    ],
    checks: [
      { page: 0, cond: (d) => d.notifyCustomer, x: 503, y: 692 },
      { page: 0, cond: (d) => d.notifyCustomer, x: 503, y: 682 },
      { page: 0, cond: () => true, x: 433, y: 609 }, // 수령방법: 일시금
      { page: 0, cond: () => true, x: 238, y: 564 }, // 실제소유자: 예
      { page: 0, cond: () => true, x: 438, y: 564 }, // 국내거주: 거주
      { page: 0, cond: (d) => d.notifyCustomer, x: 205, y: 493 },
      { page: 0, cond: (d) => d.notifyCustomer, x: 455, y: 493 },
      { page: 0, cond: (d) => d.notifyPlanner, x: 420, y: 473 },
      { page: 0, cond: (d) => d.accidentType === '질병', x: 114, y: 393 },
      { page: 0, cond: (d) => d.accidentType === '상해', x: 264, y: 393 },
      { page: 0, cond: (d) => d.accidentType === '교통사고', x: 436, y: 393 },
      { page: 0, cond: (d) => d.coverages.includes('입원'), x: 114, y: 377 },
      { page: 0, cond: (d) => d.coverages.includes('수술'), x: 156, y: 377 },
      { page: 0, cond: (d) => d.coverages.includes('진단'), x: 198, y: 377 },
      { page: 0, cond: (d) => d.coverages.includes('장해'), x: 240, y: 377 },
      { page: 0, cond: (d) => d.coverages.includes('통원'), x: 365, y: 377 },
      { page: 0, cond: (d) => d.coverages.includes('실손의료비'), x: 407, y: 377 },
      { page: 0, cond: () => true, x: 512, y: 316 }, // 의료급여: 아니오
      { page: 0, cond: () => true, x: 525, y: 244 }, // 상기내용 확인 체크
      { page: 1, cond: () => true, x: 316, y: 359 },
      { page: 1, cond: () => true, x: 316, y: 237 },
      { page: 1, cond: () => true, x: 316, y: 86 },
      { page: 2, cond: () => true, x: 316, y: 315 },
      { page: 2, cond: () => true, x: 316, y: 215 },
      { page: 2, cond: () => true, x: 316, y: 85 },
      { page: 3, cond: () => true, x: 316, y: 247 },
      { page: 3, cond: () => true, x: 316, y: 105 },
      { page: 4, cond: () => true, x: 316, y: 533 },
      { page: 4, cond: () => true, x: 316, y: 422 },
      { page: 4, cond: () => true, x: 316, y: 286 }
    ],
    signatures: [
      { page: 0, role: 'beneficiary', x: 455, y: 188, w: 48, h: 18 },
      { page: 4, role: 'insured', cond: (d) => !d.isUnder14, x: 192, y: 168, w: 45, h: 18 },
      { page: 4, role: 'beneficiary', cond: (d) => !d.isSameInsBen || !d.isUnder14, x: 192, y: 140, w: 45, h: 18 },
      { page: 4, role: 'guardian', cond: (d) => d.isUnder19, x: 458, y: 168, w: 45, h: 18 }
    ]
  },

  // ==================== [11. 라이나생명] (라이나생명 보험금청구서.pdf - 동의박스 정중앙 및 9P 본인확인서 반영) ====================
  lina_life: {
    fields: [
      { page: 0, key: 'insuredName', x: 100, y: 660, size: 10, bold: true },
      { page: 0, key: 'insuredRrn1', x: 227, y: 660, size: 10 },
      { page: 0, key: 'insuredRrn2', x: 311, y: 660, size: 10 },
      { page: 0, key: 'insuredPhone1', x: 410, y: 660, size: 9.5 },
      { page: 0, key: 'insuredPhone2', x: 459, y: 660, size: 9.5 },
      { page: 0, key: 'insuredPhone3', x: 518, y: 660, size: 9.5 },
      { page: 0, key: 'beneficiaryName', x: 100, y: 599, size: 10, bold: true },
      { page: 0, key: 'beneficiaryRrn1', x: 225, y: 599, size: 10 },
      { page: 0, key: 'beneficiaryRrn2', x: 309, y: 599, size: 10 },
      { page: 0, key: 'beneficiaryPhone1', x: 410, y: 599, size: 9.5 },
      { page: 0, key: 'beneficiaryPhone2', x: 459, y: 599, size: 9.5 },
      { page: 0, key: 'beneficiaryPhone3', x: 518, y: 599, size: 9.5 },
      { page: 0, key: 'beneficiaryJob', x: 88, y: 577, size: 9.5 },
      { page: 0, key: 'beneficiaryAddress', x: 105, y: 553, size: 9 },
      { page: 0, key: 'relIfDiff', cond: (d) => !d.isSameInsBen, x: 492, y: 539, size: 9.5 },
      { page: 0, key: 'bankName', x: 132, y: 504, size: 10 },
      { page: 0, key: 'accountNumber', x: 255, y: 504, size: 10 },
      // 1P 사고일시 및 경위
      { page: 0, key: 'accYear', x: 175, y: 315, size: 10 },
      { page: 0, key: 'accMonth', x: 242, y: 315, size: 10 },
      { page: 0, key: 'accDay', x: 286, y: 315, size: 10 },
      { page: 0, key: 'descWithDiag', x: 165, y: 296, size: 9.5 },
      // 1P 하단 작성일 및 피보험자/보험수익자/친권자 성명
      { page: 0, key: 'todayYear', x: 432, y: 90, size: 10 },
      { page: 0, key: 'todayMonth', x: 484, y: 90, size: 10 },
      { page: 0, key: 'todayDay', x: 522, y: 90, size: 10 },
      { page: 0, key: 'insuredName', cond: (d) => !d.isUnder14, x: 145, y: 65, size: 10, bold: true },
      { page: 0, key: 'beneficiaryName', cond: (d) => !d.isSameInsBen || !d.isUnder14, x: 145, y: 47, size: 10, bold: true },
      { page: 0, key: 'guardianName19', cond: (d) => d.isUnder19, x: 415, y: 65, size: 10, bold: true },
      // 2P(동의서 1/3): 상단 피보험자 성명·주민번호
      { page: 1, key: 'insuredName', x: 145, y: 613, size: 10, bold: true },
      { page: 1, key: 'insuredRrn1', x: 398, y: 613, size: 10 },
      { page: 1, key: 'insuredRrn2', x: 485, y: 613, size: 10 },
      // 4P(동의서 3/3): 동의일 및 피보험자/수익자/친권자 성명
      { page: 3, key: 'todayYearShort', x: 235, y: 161, size: 10 },
      { page: 3, key: 'todayMonth', x: 295, y: 161, size: 10 },
      { page: 3, key: 'todayDay', x: 350, y: 161, size: 10 },
      { page: 3, key: 'insuredName', cond: (d) => !d.isUnder14, x: 145, y: 111, size: 10, bold: true },
      { page: 3, key: 'beneficiaryName', cond: (d) => !d.isSameInsBen || !d.isUnder14, x: 145, y: 86, size: 10, bold: true },
      { page: 3, key: 'guardianName19', cond: (d) => d.isUnder19, x: 415, y: 111, size: 10, bold: true },
      // 9P(FATCA-CRS 본인확인서 - page: 8 추가 작성)
      { page: 8, key: 'beneficiaryName', x: 105, y: 550, size: 10, bold: true },
      { page: 8, key: 'nationalityKor', x: 265, y: 550, size: 9.5 },
      { page: 8, key: 'beneficiaryPhone', x: 435, y: 550, size: 9.5 },
      { page: 8, key: 'beneficiaryAddress', x: 105, y: 528, size: 9 },
      { page: 8, key: 'beneficiaryRrnFull', x: 435, y: 528, size: 9.5 },
      { page: 8, key: 'todayYearShort', x: 175, y: 95, size: 10 },
      { page: 8, key: 'todayMonth', x: 218, y: 95, size: 10 },
      { page: 8, key: 'todayDay', x: 258, y: 95, size: 10 },
      { page: 8, key: 'beneficiaryName', x: 472, y: 84, size: 10, bold: true }
    ],
    checks: [
      { page: 0, cond: (d) => d.isSameInsBen, x: 407, y: 539 },
      { page: 0, cond: (d) => !d.isSameInsBen, x: 443, y: 539 },
      { page: 0, cond: () => true, x: 407, y: 504 }, // 실소유주: 본인
      { page: 0, cond: (d) => d.notifyCustomer, x: 158, y: 468 },
      { page: 0, cond: (d) => d.accidentType === '질병', x: 100, y: 360 },
      { page: 0, cond: (d) => d.accidentType !== '질병', x: 246, y: 360 }, // 재해 네모박스 정중앙
      { page: 0, cond: (d) => d.coverages.includes('장해'), x: 136, y: 344 },
      { page: 0, cond: (d) => d.coverages.includes('진단'), x: 174, y: 344 },
      { page: 0, cond: (d) => d.coverages.includes('수술'), x: 274, y: 344 },
      { page: 0, cond: (d) => d.coverages.includes('입원'), x: 312, y: 344 },
      { page: 0, cond: (d) => d.coverages.includes('통원'), x: 350, y: 344 },
      { page: 0, cond: (d) => d.coverages.includes('실손의료비'), x: 388, y: 344 },
      { page: 0, cond: () => true, x: 100, y: 278 }, // 모든 유지계약 심사·지급 요청
      { page: 0, cond: () => true, x: 450, y: 262 }, // 의료수급권자: 비해당
      // 2P(동의서 1/3 - 실측 BOX x=341..352, x=502..513 정중앙)
      { page: 1, cond: () => true, x: 343, y: 346 },
      { page: 1, cond: (d) => !d.isSameInsBen, x: 504, y: 346 },
      { page: 1, cond: () => true, x: 342, y: 245 },
      { page: 1, cond: (d) => !d.isSameInsBen, x: 503, y: 245 },
      { page: 1, cond: () => true, x: 342, y: 139 },
      { page: 1, cond: (d) => !d.isSameInsBen, x: 503, y: 139 },
      // 3P(동의서 2/3)
      { page: 2, cond: () => true, x: 342, y: 265 },
      { page: 2, cond: (d) => !d.isSameInsBen, x: 503, y: 265 },
      { page: 2, cond: () => true, x: 342, y: 166 },
      { page: 2, cond: (d) => !d.isSameInsBen, x: 503, y: 166 },
      { page: 2, cond: () => true, x: 343, y: 71 },
      { page: 2, cond: (d) => !d.isSameInsBen, x: 504, y: 71 },
      // 4P(동의서 3/3)
      { page: 3, cond: () => true, x: 343, y: 487 },
      { page: 3, cond: (d) => !d.isSameInsBen, x: 504, y: 487 },
      { page: 3, cond: () => true, x: 342, y: 437 },
      { page: 3, cond: (d) => !d.isSameInsBen, x: 503, y: 437 },
      { page: 3, cond: () => true, x: 342, y: 332 },
      { page: 3, cond: (d) => !d.isSameInsBen, x: 503, y: 332 },
      // 9P(FATCA-CRS 본인확인서): 미국인 아니요 / 해외거주지 아니요 체크
      { page: 8, cond: () => true, x: 468, y: 486 },
      { page: 8, cond: () => true, x: 468, y: 422 }
    ],
    signatures: [
      { page: 0, role: 'insured', cond: (d) => !d.isUnder14, x: 225, y: 65, w: 48, h: 18 },
      { page: 0, role: 'beneficiary', cond: (d) => !d.isSameInsBen || !d.isUnder14, x: 225, y: 47, w: 48, h: 18 },
      { page: 0, role: 'guardian', cond: (d) => d.isUnder19, x: 495, y: 65, w: 48, h: 18 },
      { page: 3, role: 'insured', cond: (d) => !d.isUnder14, x: 240, y: 111, w: 48, h: 18 },
      { page: 3, role: 'beneficiary', cond: (d) => !d.isSameInsBen || !d.isUnder14, x: 240, y: 86, w: 48, h: 18 },
      { page: 3, role: 'guardian', cond: (d) => d.isUnder19, x: 508, y: 111, w: 48, h: 18 },
      { page: 8, role: 'beneficiary', x: 525, y: 84, w: 45, h: 18 }
    ]
  },

  // ==================== [12. 메트라이프생명] (메트라이프 보험금청구서.pdf - 전 페이지 박스 높이 정밀보정 완료) ====================
  metlife: {
    fields: [
      // 1P 상단: 발생일시, 장소, 발생경위(병명 포함) (실측 y=672, 642)
      { page: 0, key: 'accYear', x: 256, y: 672, size: 9 },
      { page: 0, key: 'accMonth', x: 302, y: 672, size: 9 },
      { page: 0, key: 'accDay', x: 328, y: 672, size: 9 },
      { page: 0, key: 'accidentPlace', x: 438, y: 672, size: 9.5 },
      { page: 0, key: 'descWithDiag', x: 125, y: 642, size: 9 },
      // 1P 중단: 피보험자 및 수익자 인적사항 (실측 y=580, 501, 485, 477, 392, 376)
      { page: 0, key: 'insuredName', x: 125, y: 580, size: 10, bold: true },
      { page: 0, key: 'insuredRrn1', x: 275, y: 580, size: 9.5 },
      { page: 0, key: 'insuredRrn2', x: 342, y: 580, size: 9.5 },
      { page: 0, key: 'insuredPhone', x: 442, y: 580, size: 9.5 },
      { page: 0, key: 'beneficiaryName', x: 125, y: 501, size: 10, bold: true },
      { page: 0, key: 'beneficiaryRrn1', x: 275, y: 501, size: 9.5 },
      { page: 0, key: 'beneficiaryRrn2', x: 342, y: 501, size: 9.5 },
      { page: 0, key: 'beneficiaryPhone', x: 442, y: 501, size: 9.5 },
      { page: 0, key: 'beneficiaryJob', x: 435, y: 485, size: 9.5 },
      { page: 0, key: 'beneficiaryAddress', x: 125, y: 477, size: 9 },
      { page: 0, key: 'bankName', x: 275, y: 392, size: 10 },
      { page: 0, key: 'beneficiaryName', x: 435, y: 392, size: 10 },
      { page: 0, key: 'accountNumber', x: 275, y: 376, size: 10 },
      // 1P 하단: 작성일(년 x=104, 월 x=136, 일 x=162 기준) 및 수익자/대표친권자 성명 (실측 y=147)
      { page: 0, key: 'todayYear', x: 70, y: 147, size: 9.5 },
      { page: 0, key: 'todayMonth', x: 118, y: 147, size: 9.5 },
      { page: 0, key: 'todayDay', x: 148, y: 147, size: 9.5 },
      { page: 0, key: 'beneficiaryName', x: 272, y: 147, size: 10, bold: true },
      { page: 0, key: 'guardianName19', cond: (d) => d.isUnder19, x: 452, y: 147, size: 10, bold: true },
      // 3P(필수동의서 2-2): 성명 및 날짜 (수익자1 성명 상시 보강)
      { page: 2, key: 'insuredName', cond: (d) => !d.isUnder14, x: 125, y: 263, size: 10, bold: true },
      { page: 2, key: 'beneficiaryName', cond: (d) => !d.isSameInsBen || !d.isUnder14, x: 125, y: 234, size: 10, bold: true },
      { page: 2, key: 'guardianFatherName', cond: (d) => d.isUnder19 && d.guardianRel !== '모', x: 395, y: 263, size: 9.5, bold: true },
      { page: 2, key: 'guardianMotherName', cond: (d) => d.isUnder19 && d.guardianRel === '모', x: 395, y: 234, size: 9.5, bold: true },
      { page: 2, key: 'todayYear', x: 202, y: 90, size: 10 },
      { page: 2, key: 'todayMonth', x: 262, y: 90, size: 10 },
      { page: 2, key: 'todayDay', x: 315, y: 90, size: 10 },
      // 4P([선택] 설계사 안내 동의서)
      { page: 3, key: 'insuredName', cond: (d) => d.notifyPlanner && !d.isUnder14, x: 125, y: 279, size: 10, bold: true },
      { page: 3, key: 'beneficiaryName', cond: (d) => d.notifyPlanner && (!d.isSameInsBen || !d.isUnder14), x: 125, y: 250, size: 10, bold: true },
      { page: 3, key: 'guardianFatherName', cond: (d) => d.notifyPlanner && d.isUnder19 && d.guardianRel !== '모', x: 395, y: 279, size: 9.5, bold: true },
      { page: 3, key: 'guardianMotherName', cond: (d) => d.notifyPlanner && d.isUnder19 && d.guardianRel === '모', x: 395, y: 250, size: 9.5, bold: true },
      { page: 3, key: 'todayYear', cond: (d) => d.notifyPlanner, x: 202, y: 90, size: 10 },
      { page: 3, key: 'todayMonth', cond: (d) => d.notifyPlanner, x: 262, y: 90, size: 10 },
      { page: 3, key: 'todayDay', cond: (d) => d.notifyPlanner, x: 315, y: 90, size: 10 }
    ],
    checks: [
      // 1P(실측 BOX y=688.7, 671.4, 385.5, 361.8, 340, 130 정중앙)
      { page: 0, cond: (d) => d.coverages.includes('입원'), x: 89, y: 690 },
      { page: 0, cond: (d) => d.coverages.includes('수술'), x: 125, y: 690 },
      { page: 0, cond: (d) => d.coverages.includes('통원') || d.coverages.includes('실손의료비'), x: 161, y: 690 },
      { page: 0, cond: (d) => d.coverages.includes('진단'), x: 219, y: 690 },
      { page: 0, cond: (d) => d.coverages.includes('장해'), x: 255, y: 690 },
      { page: 0, cond: () => true, x: 463, y: 690 }, // 연금 지급방법: 일시금
      { page: 0, cond: (d) => d.accidentType === '질병', x: 127, y: 673 },
      { page: 0, cond: (d) => d.accidentType !== '질병', x: 165.5, y: 673 },
      { page: 0, cond: (d) => d.useAutoTransfer, x: 103, y: 387 },
      { page: 0, cond: (d) => !d.useAutoTransfer, x: 135.5, y: 387 },
      { page: 0, cond: (d) => d.notifyCustomer, x: 96, y: 363 },
      { page: 0, cond: () => true, x: 306, y: 341 }, // 대한민국 거주: 예
      { page: 0, cond: () => true, x: 254, y: 130 }, // 접수사항: 팩스
      // 2P(필수동의서 2-1 - 실측 BOX x=498.3..506.5, y=521, 446, 371, 201, 157, 97)
      { page: 1, cond: () => true, x: 499, y: 521 },
      { page: 1, cond: () => true, x: 499, y: 446 },
      { page: 1, cond: () => true, x: 499, y: 371 },
      { page: 1, cond: () => true, x: 499, y: 201 },
      { page: 1, cond: () => true, x: 499, y: 157 },
      { page: 1, cond: () => true, x: 499, y: 97 },
      // 3P(필수동의서 2-2 - 실측 BOX x=498.3..506.5, y=497, 424, 343 + 대표행사 체크)
      { page: 2, cond: () => true, x: 499, y: 497 },
      { page: 2, cond: () => true, x: 499, y: 424 },
      { page: 2, cond: () => true, x: 499, y: 343 },
      { page: 2, cond: (d) => d.isUnder19 && d.guardianRel !== '모', x: 494, y: 263 },
      { page: 2, cond: (d) => d.isUnder19 && d.guardianRel === '모', x: 494, y: 234 },
      // 4P(선택동의서 - 실측 BOX x=498.3..506.5, y=401, 333)
      { page: 3, cond: (d) => d.notifyPlanner, x: 499, y: 401 },
      { page: 3, cond: (d) => d.notifyPlanner, x: 499, y: 333 },
      { page: 3, cond: (d) => d.notifyPlanner && d.isUnder19 && d.guardianRel !== '모', x: 494, y: 279 },
      { page: 3, cond: (d) => d.notifyPlanner && d.isUnder19 && d.guardianRel === '모', x: 494, y: 250 }
    ],
    signatures: [
      { page: 0, role: 'beneficiary', x: 332, y: 147, w: 45, h: 18 },
      { page: 0, role: 'guardian', cond: (d) => d.isUnder19, x: 518, y: 147, w: 45, h: 18 },
      { page: 2, role: 'insured', cond: (d) => !d.isUnder14, x: 255, y: 263, w: 45, h: 18 },
      { page: 2, role: 'beneficiary', cond: (d) => !d.isSameInsBen || !d.isUnder14, x: 255, y: 234, w: 45, h: 18 },
      { page: 2, role: 'guardian', cond: (d) => d.isUnder19 && d.guardianRel !== '모', x: 522, y: 263, w: 45, h: 18 },
      { page: 2, role: 'guardian', cond: (d) => d.isUnder19 && d.guardianRel === '모', x: 522, y: 234, w: 45, h: 18 },
      { page: 3, role: 'insured', cond: (d) => d.notifyPlanner && !d.isUnder14, x: 255, y: 279, w: 45, h: 18 },
      { page: 3, role: 'beneficiary', cond: (d) => d.notifyPlanner && (!d.isSameInsBen || !d.isUnder14), x: 255, y: 250, w: 45, h: 18 },
      { page: 3, role: 'guardian', cond: (d) => d.notifyPlanner && d.isUnder19 && d.guardianRel !== '모', x: 522, y: 279, w: 45, h: 18 },
      { page: 3, role: 'guardian', cond: (d) => d.notifyPlanner && d.isUnder19 && d.guardianRel === '모', x: 522, y: 250, w: 45, h: 18 }
    ]
  },

  // ==================== [13. 미래에셋생명] (미래에셋생명 보험금청구서.pdf - 정밀보정 완료) ====================
  mirae_life: {
    fields: [
      { page: 0, key: 'insuredName', x: 135, y: 732, size: 10, bold: true },
      { page: 0, key: 'insuredRrnFull', x: 245, y: 732, size: 9.5 },
      { page: 0, key: 'insuredPhone', x: 360, y: 732, size: 9 },
      { page: 0, key: 'beneficiaryName', x: 135, y: 689, size: 10, bold: true },
      { page: 0, key: 'beneficiaryRrnFull', x: 245, y: 689, size: 9.5 },
      { page: 0, key: 'beneficiaryPhone', x: 360, y: 689, size: 9 },
      { page: 0, key: 'beneficiaryAddress', x: 135, y: 667, size: 9 },
      { page: 0, key: 'beneficiaryJob', x: 245, y: 606, size: 9.5 },
      { page: 0, key: 'bankName', x: 135, y: 585, size: 10 },
      { page: 0, key: 'beneficiaryName', x: 245, y: 585, size: 10 },
      { page: 0, key: 'accountNumber', x: 365, y: 585, size: 10 },
      // 1P 사고내용 및 병명
      { page: 0, key: 'accYear', x: 140, y: 471, size: 9.5 },
      { page: 0, key: 'accMonth', x: 192, y: 471, size: 9.5 },
      { page: 0, key: 'accDay', x: 228, y: 471, size: 9.5 },
      { page: 0, key: 'accidentPlace', x: 368, y: 471, size: 9.5 },
      { page: 0, key: 'accidentDesc', x: 140, y: 451, size: 9.5 },
      { page: 0, key: 'diagnosisName', x: 140, y: 408, size: 9.5, bold: true },
      // 1P 하단 작성일 및 청구인 성명
      { page: 0, key: 'todayYearShort', x: 100, y: 201, size: 10 },
      { page: 0, key: 'todayMonth', x: 145, y: 201, size: 10 },
      { page: 0, key: 'todayDay', x: 182, y: 201, size: 10 },
      { page: 0, key: 'claimantName', x: 295, y: 201, size: 10, bold: true },
      { page: 0, key: 'relSelf', x: 528, y: 201, size: 9 },
      // 4P(동의서 3/3): 동의일 및 주황색 세로 서명 표
      { page: 3, key: 'todayYearShort', x: 244, y: 287, size: 10 },
      { page: 3, key: 'todayMonth', x: 295, y: 287, size: 10 },
      { page: 3, key: 'todayDay', x: 342, y: 287, size: 10 },
      { page: 3, key: 'insuredName', cond: (d) => !d.isUnder14, x: 102, y: 192, size: 10, bold: true },
      { page: 3, key: 'beneficiaryName', cond: (d) => !d.isSameInsBen || !d.isUnder14, x: 102, y: 143, size: 10, bold: true },
      { page: 3, key: 'guardianName19', cond: (d) => d.isUnder19, x: 102, y: 94, size: 10, bold: true }
    ],
    checks: [
      { page: 0, cond: () => true, x: 525, y: 732 }, // 의료급여: 비해당
      { page: 0, cond: () => true, x: 451, y: 685 }, // E-mail: 없음
      { page: 0, cond: () => true, x: 394, y: 606 }, // 실제소유자: 예
      { page: 0, cond: () => true, x: 145, y: 568 }, // 사고연금: 일시금
      { page: 0, cond: (d) => d.accidentType === '질병', x: 102, y: 521 },
      { page: 0, cond: (d) => d.accidentType === '상해', x: 260, y: 521 },
      { page: 0, cond: (d) => d.accidentType === '교통사고', x: 418, y: 521 },
      { page: 0, cond: (d) => d.coverages.includes('입원'), x: 102, y: 491 },
      { page: 0, cond: (d) => d.coverages.includes('통원'), x: 140, y: 491 },
      { page: 0, cond: (d) => d.coverages.includes('수술'), x: 178, y: 491 },
      { page: 0, cond: (d) => d.coverages.includes('실손의료비'), x: 216, y: 491 },
      { page: 0, cond: (d) => d.coverages.includes('진단'), x: 352, y: 491 },
      { page: 0, cond: (d) => d.coverages.includes('장해'), x: 390, y: 491 },
      { page: 0, cond: (d) => d.notifyCustomer, x: 99, y: 364 },
      { page: 0, cond: (d) => d.notifyCustomer, x: 278, y: 353 },
      { page: 0, cond: (d) => d.notifyCustomer, x: 448, y: 364 },
      // 2~4P 동의함 체크 9곳 (실측 x=518)
      { page: 1, cond: () => true, x: 518, y: 374 },
      { page: 1, cond: () => true, x: 518, y: 266 },
      { page: 1, cond: () => true, x: 518, y: 155 },
      { page: 2, cond: () => true, x: 518, y: 330 },
      { page: 2, cond: () => true, x: 518, y: 222 },
      { page: 2, cond: () => true, x: 518, y: 111 },
      { page: 3, cond: () => true, x: 518, y: 538 },
      { page: 3, cond: () => true, x: 518, y: 413 },
      { page: 3, cond: () => true, x: 518, y: 322 }
    ],
    signatures: [
      { page: 0, role: 'beneficiary', x: 392, y: 201, w: 50, h: 20 },
      { page: 3, role: 'insured', cond: (d) => !d.isUnder14, x: 175, y: 192, w: 48, h: 20 },
      { page: 3, role: 'beneficiary', cond: (d) => !d.isSameInsBen || !d.isUnder14, x: 175, y: 143, w: 48, h: 20 },
      { page: 3, role: 'guardian', cond: (d) => d.isUnder19, x: 175, y: 94, w: 48, h: 20 }
    ]
  },

  // ==================== [14. 삼성생명] (삼성생명 보험금청구서.pdf - 수익자 동의서 서명 보강 완료) ====================
  samsung_life: {
    fields: [
      { page: 0, key: 'insuredName', x: 112, y: 714, size: 10, bold: true },
      { page: 0, key: 'insuredRrnFull', x: 230, y: 714, size: 9.5 },
      { page: 0, key: 'insuredPhone', x: 372, y: 714, size: 9 },
      { page: 0, key: 'accYear', x: 156, y: 654, size: 9.5 },
      { page: 0, key: 'accMonth', x: 212, y: 654, size: 9.5 },
      { page: 0, key: 'accDay', x: 245, y: 654, size: 9.5 },
      { page: 0, key: 'accidentDesc', x: 196, y: 637, size: 9.5 },
      { page: 0, key: 'diagnosisName', x: 156, y: 578, size: 9.5, bold: true },
      // 1P 수익자 및 계좌
      { page: 0, key: 'beneficiaryName', x: 112, y: 499, size: 10, bold: true },
      { page: 0, key: 'beneficiaryRrnFull', x: 230, y: 499, size: 9.5 },
      { page: 0, key: 'beneficiaryPhone', x: 372, y: 499, size: 9 },
      { page: 0, key: 'beneficiaryAddress', x: 112, y: 465, size: 9 },
      { page: 0, key: 'bankName', x: 158, y: 380, size: 10 },
      { page: 0, key: 'beneficiaryName', x: 282, y: 380, size: 10 },
      { page: 0, key: 'accountNumber', x: 412, y: 380, size: 10 },
      // 1P 하단 작성일 및 수익자(대리인)
      { page: 0, key: 'todayYear', x: 266, y: 113, size: 9.5 },
      { page: 0, key: 'todayMonth', x: 314, y: 113, size: 9.5 },
      { page: 0, key: 'todayDay', x: 340, y: 113, size: 9.5 },
      { page: 0, key: 'claimantName', x: 442, y: 113, size: 10, bold: true },
      { page: 0, key: 'relIfDiff', cond: (d) => !d.isSameInsBen || d.isUnder19, x: 445, y: 97, size: 9.5 },
      // 4P(요약동의서 3/3) 성명 및 신청일
      { page: 3, key: 'insuredName', cond: (d) => !d.isUnder14, x: 132, y: 167, size: 10, bold: true },
      { page: 3, key: 'beneficiaryName', cond: (d) => !d.isSameInsBen || !d.isUnder14, x: 132, y: 138, size: 10, bold: true },
      { page: 3, key: 'guardianFatherName', cond: (d) => d.isUnder19 && d.guardianRel !== '모', x: 344, y: 167, size: 9.5, bold: true },
      { page: 3, key: 'guardianMotherName', cond: (d) => d.isUnder19 && d.guardianRel === '모', x: 485, y: 167, size: 9.5, bold: true },
      { page: 3, key: 'todayYear', x: 265, y: 87, size: 10 },
      { page: 3, key: 'todayMonth', x: 316, y: 87, size: 10 },
      { page: 3, key: 'todayDay', x: 348, y: 87, size: 10 },
      // 8P(상세동의서 4/4) 성명 및 신청일
      { page: 7, key: 'insuredName', cond: (d) => !d.isUnder14, x: 132, y: 167, size: 10, bold: true },
      { page: 7, key: 'beneficiaryName', cond: (d) => !d.isSameInsBen || !d.isUnder14, x: 132, y: 138, size: 10, bold: true },
      { page: 7, key: 'guardianFatherName', cond: (d) => d.isUnder19 && d.guardianRel !== '모', x: 344, y: 167, size: 9.5, bold: true },
      { page: 7, key: 'guardianMotherName', cond: (d) => d.isUnder19 && d.guardianRel === '모', x: 485, y: 167, size: 9.5, bold: true },
      { page: 7, key: 'todayYear', x: 265, y: 87, size: 10 },
      { page: 7, key: 'todayMonth', x: 316, y: 87, size: 10 },
      { page: 7, key: 'todayDay', x: 348, y: 87, size: 10 }
    ],
    checks: [
      { page: 0, cond: () => true, x: 526, y: 705 }, // 의료수급: 아니오
      { page: 0, cond: (d) => d.accidentType === '질병', x: 122, y: 687 },
      { page: 0, cond: (d) => d.accidentType !== '질병', x: 122, y: 673 },
      { page: 0, cond: (d) => d.coverages.includes('장해'), x: 359, y: 687 },
      { page: 0, cond: (d) => d.coverages.includes('진단'), x: 407, y: 687 },
      { page: 0, cond: (d) => d.coverages.includes('수술'), x: 448, y: 687 },
      { page: 0, cond: (d) => d.coverages.includes('입원'), x: 488, y: 687 },
      { page: 0, cond: (d) => d.coverages.includes('통원'), x: 528, y: 687 },
      { page: 0, cond: (d) => d.coverages.includes('실손의료비'), x: 359, y: 673 },
      { page: 0, cond: () => true, x: 483, y: 654 }, // 자보처리: 아니오
      { page: 0, cond: () => true, x: 526, y: 508 }, // 실제소유자: 예
      { page: 0, cond: () => true, x: 482, y: 342 }, // 분할보험금: 일시금 신청
      { page: 0, cond: (d) => d.notifyCustomer, x: 122, y: 312 },
      { page: 0, cond: (d) => d.notifyCustomer, x: 238, y: 304 },
      { page: 0, cond: () => true, x: 489, y: 215 }, // 3. 확인 (필수)
      // 2~4P 요약동의서
      { page: 1, cond: () => true, x: 514, y: 655 },
      { page: 1, cond: () => true, x: 415, y: 425 },
      { page: 1, cond: (d) => !d.isSameInsBen, x: 520, y: 425 },
      { page: 1, cond: () => true, x: 415, y: 365 },
      { page: 1, cond: (d) => !d.isSameInsBen, x: 520, y: 365 },
      { page: 1, cond: () => true, x: 415, y: 281 },
      { page: 1, cond: (d) => !d.isSameInsBen, x: 520, y: 281 },
      { page: 2, cond: () => true, x: 415, y: 696 },
      { page: 2, cond: (d) => !d.isSameInsBen, x: 520, y: 696 },
      { page: 2, cond: () => true, x: 415, y: 637 },
      { page: 2, cond: (d) => !d.isSameInsBen, x: 520, y: 637 },
      { page: 2, cond: () => true, x: 415, y: 556 },
      { page: 2, cond: (d) => !d.isSameInsBen, x: 520, y: 556 },
      { page: 2, cond: () => true, x: 415, y: 179 },
      { page: 2, cond: (d) => !d.isSameInsBen, x: 520, y: 179 },
      { page: 2, cond: () => true, x: 415, y: 98 },
      { page: 2, cond: (d) => !d.isSameInsBen, x: 520, y: 98 },
      { page: 3, cond: () => true, x: 415, y: 560 },
      { page: 3, cond: (d) => !d.isSameInsBen, x: 520, y: 560 },
      { page: 3, cond: () => true, x: 415, y: 514 },
      { page: 3, cond: (d) => !d.isSameInsBen, x: 520, y: 514 },
      { page: 3, cond: () => true, x: 415, y: 433 },
      { page: 3, cond: (d) => !d.isSameInsBen, x: 520, y: 433 },
      // 5~8P 상세동의서
      { page: 4, cond: () => true, x: 415, y: 387 },
      { page: 4, cond: (d) => !d.isSameInsBen, x: 520, y: 387 },
      { page: 4, cond: () => true, x: 415, y: 266 },
      { page: 4, cond: (d) => !d.isSameInsBen, x: 520, y: 266 },
      { page: 4, cond: () => true, x: 415, y: 115 },
      { page: 4, cond: (d) => !d.isSameInsBen, x: 520, y: 115 },
      { page: 5, cond: () => true, x: 414, y: 321 },
      { page: 5, cond: (d) => !d.isSameInsBen, x: 520, y: 321 },
      { page: 5, cond: () => true, x: 414, y: 221 },
      { page: 5, cond: (d) => !d.isSameInsBen, x: 520, y: 221 },
      { page: 5, cond: () => true, x: 414, y: 98 },
      { page: 5, cond: (d) => !d.isSameInsBen, x: 520, y: 98 },
      { page: 6, cond: () => true, x: 414, y: 338 },
      { page: 6, cond: (d) => !d.isSameInsBen, x: 520, y: 338 },
      { page: 6, cond: () => true, x: 414, y: 214 },
      { page: 6, cond: (d) => !d.isSameInsBen, x: 520, y: 214 },
      { page: 7, cond: () => true, x: 414, y: 533 },
      { page: 7, cond: (d) => !d.isSameInsBen, x: 520, y: 533 },
      { page: 7, cond: () => true, x: 414, y: 476 },
      { page: 7, cond: (d) => !d.isSameInsBen, x: 520, y: 476 },
      { page: 7, cond: () => true, x: 414, y: 380 },
      { page: 7, cond: (d) => !d.isSameInsBen, x: 520, y: 380 }
    ],
    signatures: [
      { page: 0, role: 'beneficiary', x: 505, y: 113, w: 48, h: 18 },
      { page: 3, role: 'insured', cond: (d) => !d.isUnder14, x: 180, y: 167, w: 45, h: 18 },
      { page: 3, role: 'beneficiary', cond: (d) => !d.isSameInsBen || !d.isUnder14, x: 180, y: 138, w: 45, h: 18 },
      { page: 3, role: 'guardian', cond: (d) => d.isUnder19 && d.guardianRel !== '모', x: 386, y: 167, w: 42, h: 18 },
      { page: 3, role: 'guardian', cond: (d) => d.isUnder19 && d.guardianRel === '모', x: 526, y: 167, w: 42, h: 18 },
      { page: 7, role: 'insured', cond: (d) => !d.isUnder14, x: 180, y: 167, w: 45, h: 18 },
      { page: 7, role: 'beneficiary', cond: (d) => !d.isSameInsBen || !d.isUnder14, x: 180, y: 138, w: 45, h: 18 },
      { page: 7, role: 'guardian', cond: (d) => d.isUnder19 && d.guardianRel !== '모', x: 386, y: 167, w: 42, h: 18 },
      { page: 7, role: 'guardian', cond: (d) => d.isUnder19 && d.guardianRel === '모', x: 526, y: 167, w: 42, h: 18 }
    ]
  },

  // ==================== [15. 신한라이프] (신한라이프 보험금청구서.pdf - 계좌·날짜·체크박스 정밀보정 완료) ====================
  shinhan_life: {
    fields: [
      // 1P 상단: 사고일시('일' 겹침 해소), 장소(초진병원), 경위(8.5pt), 병명
      { page: 0, key: 'accYearShort', x: 168, y: 677, size: 9.5 },
      { page: 0, key: 'accMonth', x: 200, y: 677, size: 9.5 },
      { page: 0, key: 'accDay', x: 228, y: 677, size: 9.5 },
      { page: 0, key: 'accidentPlace', x: 430, y: 677, size: 9.5 },
      { page: 0, key: 'accidentDesc', x: 162, y: 661, size: 8.5 },
      { page: 0, key: 'diagnosisName', x: 336, y: 661, size: 9.5, bold: true },
      // 1P 상단: 보험금 수령 계좌 ('예금주'·'계좌번호' 라벨 침범 방지: x=138, 222, 302)
      { page: 0, key: 'bankName', x: 138, y: 586, size: 9 },
      { page: 0, key: 'beneficiaryName', x: 222, y: 586, size: 9 },
      { page: 0, key: 'accountNumber', x: 302, y: 586, size: 9.5 },
      // 1P 중단: 피보험자 및 수익자 인적사항
      { page: 0, key: 'insuredName', x: 162, y: 502, size: 10, bold: true },
      { page: 0, key: 'insuredRrnFull', x: 318, y: 502, size: 9.5 },
      { page: 0, key: 'insuredPhone', x: 468, y: 502, size: 9 },
      { page: 0, key: 'insuredJob', x: 180, y: 486, size: 9.5 },
      { page: 0, key: 'relIfDiff', cond: (d) => !d.isSameInsBen, x: 392, y: 471, size: 9 },
      { page: 0, key: 'beneficiaryName', x: 162, y: 455, size: 10, bold: true },
      { page: 0, key: 'beneficiaryRrnFull', x: 318, y: 455, size: 9.5 },
      { page: 0, key: 'beneficiaryPhone', x: 468, y: 455, size: 9 },
      { page: 0, key: 'beneficiaryAddress', x: 162, y: 439, size: 9 },
      { page: 0, key: 'beneficiaryJob', x: 180, y: 423, size: 9.5 },
      // 1P 하단: 작성일 및 보험수익자(청구자) 성명
      { page: 0, key: 'todayYearShort', x: 146, y: 171, size: 10 },
      { page: 0, key: 'todayMonth', x: 188, y: 171, size: 10 },
      { page: 0, key: 'todayDay', x: 222, y: 171, size: 10 },
      { page: 0, key: 'claimantName', x: 365, y: 171, size: 10, bold: true },
      // 4P(동의서 3/3): 피보험자/수익자/법정대리인 성명·관계 및 동의일
      { page: 3, key: 'insuredName', cond: (d) => !d.isUnder14, x: 135, y: 307, size: 10, bold: true },
      { page: 3, key: 'beneficiaryName', cond: (d) => !d.isSameInsBen || !d.isUnder14, x: 135, y: 290, size: 10, bold: true },
      { page: 3, key: 'guardianName19', cond: (d) => d.isUnder19, x: 365, y: 307, size: 10, bold: true },
      { page: 3, key: 'guardianRel', cond: (d) => d.isUnder19, x: 528, y: 307, size: 9.5 },
      { page: 3, key: 'todayYearShort', x: 244, y: 220, size: 10 },
      { page: 3, key: 'todayMonth', x: 295, y: 220, size: 10 },
      { page: 3, key: 'todayDay', x: 338, y: 220, size: 10 }
    ],
    checks: [
      // 1P(실측 BOX 중심점): 발생원인(103, 256.5, 432.5), 청구사유, 추가접수, 일시금, 계좌선택, 문자안내, 팩스
      { page: 0, cond: (d) => d.accidentType === '질병', x: 103, y: 744 },
      { page: 0, cond: (d) => d.accidentType === '상해', x: 256.5, y: 744 },
      { page: 0, cond: (d) => d.accidentType === '교통사고', x: 432.5, y: 744 },
      { page: 0, cond: (d) => d.coverages.includes('장해'), x: 139, y: 727 },
      { page: 0, cond: (d) => d.coverages.includes('진단'), x: 173, y: 727 },
      { page: 0, cond: (d) => d.coverages.includes('입원'), x: 207.5, y: 727 },
      { page: 0, cond: (d) => d.coverages.includes('수술'), x: 241.5, y: 727 },
      { page: 0, cond: (d) => d.coverages.includes('통원'), x: 273.5, y: 727 },
      { page: 0, cond: (d) => d.coverages.includes('실손의료비'), x: 304, y: 727 },
      { page: 0, cond: (d) => d.claimCategory === '추가', x: 327, y: 695 },
      { page: 0, cond: (d) => d.claimCategory === '신규', x: 355, y: 695 },
      { page: 0, cond: () => true, x: 322, y: 631 }, // 사고분할보험금: 일시금
      { page: 0, cond: (d) => d.useAutoTransfer, x: 103, y: 610 },
      { page: 0, cond: (d) => !d.useAutoTransfer, x: 103, y: 587 }, // 은행계좌 직접입력 체크
      { page: 0, cond: (d) => !d.isSameInsBen, x: 355, y: 471 },
      { page: 0, cond: (d) => d.notifyCustomer, x: 103, y: 339 },
      { page: 0, cond: () => true, x: 228, y: 122 }, // 접수방법: 팩스
      // 2~4P 상세동의서 □ 동의함 11곳
      { page: 1, cond: () => true, x: 493, y: 527 },
      { page: 1, cond: () => true, x: 493, y: 457 },
      { page: 1, cond: () => true, x: 493, y: 377 },
      { page: 2, cond: () => true, x: 509, y: 724 },
      { page: 2, cond: () => true, x: 509, y: 653 },
      { page: 2, cond: () => true, x: 509, y: 569 },
      { page: 2, cond: () => true, x: 493, y: 223 },
      { page: 2, cond: () => true, x: 493, y: 155 },
      { page: 3, cond: () => true, x: 493, y: 555 },
      { page: 3, cond: () => true, x: 493, y: 502 },
      { page: 3, cond: () => true, x: 493, y: 421 }
    ],
    signatures: [
      { page: 0, role: 'beneficiary', x: 422, y: 171, w: 48, h: 18 },
      { page: 3, role: 'insured', cond: (d) => !d.isUnder14, x: 225, y: 307, w: 48, h: 18 },
      { page: 3, role: 'beneficiary', cond: (d) => !d.isSameInsBen || !d.isUnder14, x: 225, y: 290, w: 48, h: 18 },
      { page: 3, role: 'guardian', cond: (d) => d.isUnder19, x: 448, y: 307, w: 48, h: 18 }
    ]
  },

  // ==================== [16. 처브라이프생명] (처브라이프 보험금청구서(구,ace).pdf - 해외정보·동의박스 정밀보정 완료) ====================
  chubb_life: {
    fields: [
      { page: 0, key: 'insuredName', x: 155, y: 731, size: 10, bold: true },
      { page: 0, key: 'insuredPhone', x: 392, y: 731, size: 9.5 },
      { page: 0, key: 'insuredRrn1', x: 275, y: 711, size: 10 },
      { page: 0, key: 'insuredRrn2', x: 372, y: 711, size: 10 },
      // 1P 사고일시, 장소, 경위
      { page: 0, key: 'accYear', x: 162, y: 660, size: 9.5 },
      { page: 0, key: 'accMonth', x: 218, y: 660, size: 9.5 },
      { page: 0, key: 'accDay', x: 268, y: 660, size: 9.5 },
      { page: 0, key: 'accidentPlace', x: 425, y: 660, size: 9.5 },
      { page: 0, key: 'descWithDiag', x: 162, y: 647, size: 9.5 },
      // 1P 수익자 및 계좌
      { page: 0, key: 'beneficiaryName', x: 155, y: 631, size: 10, bold: true },
      { page: 0, key: 'beneficiaryRrn1', x: 412, y: 631, size: 9.5 },
      { page: 0, key: 'beneficiaryRrn2', x: 490, y: 631, size: 9.5 },
      { page: 0, key: 'beneficiaryAddress', x: 142, y: 614, size: 9 },
      { page: 0, key: 'beneficiaryPhone', x: 392, y: 614, size: 9.5 },
      { page: 0, key: 'bankName', x: 155, y: 595, size: 10 },
      { page: 0, key: 'accountNumber', x: 310, y: 595, size: 10 },
      { page: 0, key: 'beneficiaryName', x: 495, y: 595, size: 10 },
      // 1P 하단 작성일 및 피보험자/수익자 성명
      { page: 0, key: 'todayYearShort', x: 238, y: 328, size: 10 },
      { page: 0, key: 'todayMonth', x: 298, y: 328, size: 10 },
      { page: 0, key: 'todayDay', x: 348, y: 328, size: 10 },
      { page: 0, key: 'insuredName', cond: (d) => !d.isUnder14, x: 115, y: 303, size: 10, bold: true },
      { page: 0, key: 'guardianName', cond: (d) => d.isUnder14, x: 115, y: 303, size: 10, bold: true },
      { page: 0, key: 'claimantName', x: 365, y: 303, size: 10, bold: true },
      // 3P(동의서 2/2): 피보험자/수익자/법정대리인 성명·관계 및 날짜
      { page: 2, key: 'insuredName', cond: (d) => !d.isUnder14, x: 125, y: 110, size: 10, bold: true },
      { page: 2, key: 'beneficiaryName', cond: (d) => !d.isSameInsBen || !d.isUnder14, x: 125, y: 97, size: 10, bold: true },
      { page: 2, key: 'guardianName19', cond: (d) => d.isUnder19, x: 355, y: 110, size: 10, bold: true },
      { page: 2, key: 'guardianRel', cond: (d) => d.isUnder19, x: 512, y: 110, size: 9.5 },
      { page: 2, key: 'todayYear', x: 205, y: 66, size: 10 },
      { page: 2, key: 'todayMonth', x: 268, y: 66, size: 10 },
      { page: 2, key: 'todayDay', x: 318, y: 66, size: 10 }
    ],
    checks: [
      // 1P: 청구사유(44pt 간격), 사고유형(질병 168 / 재해 348), 대한민국 거주 '예'(116,503), 문자메세지(108,475)
      { page: 0, cond: (d) => d.coverages.includes('입원'), x: 111, y: 693 },
      { page: 0, cond: (d) => d.coverages.includes('수술'), x: 155, y: 693 },
      { page: 0, cond: (d) => d.coverages.includes('진단'), x: 199, y: 693 },
      { page: 0, cond: (d) => d.coverages.includes('장해'), x: 243, y: 693 },
      { page: 0, cond: (d) => d.coverages.includes('통원') || d.coverages.includes('실손의료비'), x: 375, y: 693 },
      { page: 0, cond: (d) => d.accidentType === '질병', x: 168, y: 676 },
      { page: 0, cond: (d) => d.accidentType !== '질병', x: 348, y: 676 },
      { page: 0, cond: () => true, x: 116, y: 503 }, // 해외정보 대한민국 입니까? □ 예 정중앙
      { page: 0, cond: (d) => d.notifyCustomer, x: 108, y: 475 },
      // 2P(동의서 1/2 - 실측 BOX x=495.5..503.8 정중앙)
      { page: 1, cond: () => true, x: 496.5, y: 502 },
      { page: 1, cond: () => true, x: 496.5, y: 433 },
      { page: 1, cond: () => true, x: 496.5, y: 355 },
      // 3P(동의서 2/2 - 실측 BOX x=495.2..507.3 정중앙)
      { page: 2, cond: () => true, x: 500, y: 725 },
      { page: 2, cond: () => true, x: 500, y: 671 },
      { page: 2, cond: () => true, x: 498, y: 610 },
      { page: 2, cond: () => true, x: 497, y: 410 },
      { page: 2, cond: () => true, x: 496, y: 365 },
      { page: 2, cond: () => true, x: 500, y: 236 },
      { page: 2, cond: () => true, x: 500, y: 203 },
      { page: 2, cond: () => true, x: 500, y: 158 }
    ],
    signatures: [
      { page: 0, role: 'insured', x: 245, y: 303, w: 48, h: 18 },
      { page: 0, role: 'beneficiary', x: 505, y: 303, w: 48, h: 18 },
      { page: 2, role: 'insured', cond: (d) => !d.isUnder14, x: 212, y: 110, w: 45, h: 18 },
      { page: 2, role: 'beneficiary', cond: (d) => !d.isSameInsBen || !d.isUnder14, x: 212, y: 97, w: 45, h: 18 },
      { page: 2, role: 'guardian', cond: (d) => d.isUnder19, x: 435, y: 110, w: 45, h: 18 }
    ]
  },

  // ==================== [17. 푸본현대생명] (푸본현대라이프 보험금청구서.pdf - 주민번호 셀·동의일 정밀보정 완료) ====================
  fubon_life: {
    fields: [
      // 1P 상단: 피보험자 인적사항 (실측 셀 x=99.6..207.9, 279.1..387.4, 458.6..566.9)
      { page: 0, key: 'insuredName', x: 106, y: 698, size: 10, bold: true },
      { page: 0, key: 'insuredRrnFull', x: 285, y: 698, size: 9.5 },
      { page: 0, key: 'insuredJob', x: 285, y: 682, size: 9 },
      { page: 0, key: 'insuredPhone', x: 464, y: 682, size: 9.5 },
      // 1P 중단: 수익자 정보 및 송금계좌
      { page: 0, key: 'beneficiaryName', x: 106, y: 647, size: 10, bold: true },
      { page: 0, key: 'beneficiaryRrnFull', x: 285, y: 647, size: 9.5 },
      { page: 0, key: 'beneficiaryPhone', x: 106, y: 631, size: 9.5 },
      { page: 0, key: 'beneficiaryJob', x: 285, y: 631, size: 9 },
      { page: 0, key: 'relIfDiff', cond: (d) => !d.isSameInsBen, x: 370, y: 616, size: 9.5 },
      { page: 0, key: 'beneficiaryAddress', x: 106, y: 600, size: 9 },
      { page: 0, key: 'bankName', x: 140, y: 584, size: 9.5 },
      { page: 0, key: 'accountNumber', x: 256, y: 584, size: 9.5 },
      { page: 0, key: 'beneficiaryName', x: 430, y: 584, size: 9.5 },
      // 1P 중단: 사고일시, 장소, 경위, 병명
      { page: 0, key: 'accYear', x: 162, y: 414, size: 9.5 },
      { page: 0, key: 'accMonth', x: 205, y: 414, size: 9.5 },
      { page: 0, key: 'accDay', x: 235, y: 414, size: 9.5 },
      { page: 0, key: 'accidentPlace', x: 398, y: 414, size: 9.5 },
      { page: 0, key: 'accidentDesc', x: 168, y: 398, size: 9.5 },
      { page: 0, key: 'diagnosisName', x: 135, y: 368, size: 9.5, bold: true },
      // 1P 하단: 작성일 및 청구인 성명
      { page: 0, key: 'todayYear', x: 112, y: 217, size: 10 },
      { page: 0, key: 'todayMonth', x: 188, y: 217, size: 10 },
      { page: 0, key: 'todayDay', x: 256, y: 217, size: 10 },
      { page: 0, key: 'claimantName', x: 415, y: 217, size: 10, bold: true },
      // 5P(동의서 4/4): 날짜(년 x=136.8 기준 겹침 해소) 및 성명란
      { page: 4, key: 'todayYear', x: 96, y: 180, size: 10 },
      { page: 4, key: 'todayMonth', x: 162, y: 180, size: 10 },
      { page: 4, key: 'todayDay', x: 222, y: 180, size: 10 },
      { page: 4, key: 'insuredName', cond: (d) => !d.isUnder14, x: 405, y: 180, size: 10, bold: true },
      { page: 4, key: 'beneficiaryName', cond: (d) => !d.isSameInsBen || !d.isUnder14, x: 405, y: 156, size: 10, bold: true },
      { page: 4, key: 'guardianName19', cond: (d) => d.isUnder19, x: 145, y: 156, size: 10, bold: true },
      { page: 4, key: 'guardianName19', cond: (d) => d.isUnder19, x: 405, y: 133, size: 10, bold: true },
      // 6P(고객거래확인서 개인용)
      { page: 5, key: 'beneficiaryName', x: 175, y: 666, size: 10, bold: true },
      { page: 5, key: 'beneficiaryRrnFull', x: 218, y: 626, size: 9.5 },
      { page: 5, key: 'beneficiaryAddress', x: 282, y: 587, size: 9 },
      { page: 5, key: 'beneficiaryPhone', x: 435, y: 567, size: 9.5 },
      { page: 5, key: 'beneficiaryJob', x: 372, y: 509, size: 9.5 },
      { page: 5, key: 'todayYearShort', x: 438, y: 137, size: 10 },
      { page: 5, key: 'todayMonth', x: 484, y: 137, size: 10 },
      { page: 5, key: 'todayDay', x: 522, y: 137, size: 10 },
      { page: 5, key: 'claimantName', x: 405, y: 118, size: 10, bold: true }
    ],
    checks: [
      { page: 0, cond: (d) => d.isSameInsBen, x: 103.5, y: 617 },
      { page: 0, cond: (d) => !d.isSameInsBen, x: 335, y: 617 },
      { page: 0, cond: () => true, x: 103, y: 501 }, // 전체보험금 청구
      { page: 0, cond: (d) => d.accidentType === '질병', x: 103, y: 473 },
      { page: 0, cond: (d) => d.accidentType === '상해', x: 144, y: 473 },
      { page: 0, cond: (d) => d.accidentType === '교통사고', x: 201, y: 473 },
      { page: 0, cond: (d) => d.coverages.includes('장해'), x: 201, y: 446 },
      { page: 0, cond: (d) => d.coverages.includes('진단'), x: 235, y: 446 },
      { page: 0, cond: (d) => d.coverages.includes('입원'), x: 268, y: 446 },
      { page: 0, cond: (d) => d.coverages.includes('통원'), x: 302, y: 446 },
      { page: 0, cond: (d) => d.coverages.includes('수술'), x: 336, y: 446 },
      { page: 0, cond: (d) => d.coverages.includes('실손의료비'), x: 403, y: 446 },
      { page: 0, cond: () => true, x: 233, y: 430 }, // 실제소유자: Y
      { page: 0, cond: () => true, x: 144, y: 336 }, // 의료급여: 비대상
      { page: 0, cond: () => true, x: 103, y: 321 }, // 분할보험금: 일시금
      { page: 0, cond: () => true, x: 195, y: 107 }, // 접수방법: FAX
      // 2~5P 상세동의서 동의함 (실측 BOX x=525.2..535.7 정중앙)
      { page: 1, cond: () => true, x: 527, y: 399 },
      { page: 1, cond: () => true, x: 527, y: 378 },
      { page: 1, cond: () => true, x: 527, y: 299 },
      { page: 1, cond: () => true, x: 527, y: 278 },
      { page: 1, cond: () => true, x: 527, y: 185 },
      { page: 1, cond: () => true, x: 527, y: 164 },
      { page: 2, cond: () => true, x: 527, y: 303 },
      { page: 2, cond: () => true, x: 527, y: 287 },
      { page: 2, cond: () => true, x: 527, y: 214 },
      { page: 2, cond: () => true, x: 527, y: 199 },
      { page: 2, cond: () => true, x: 527, y: 112 },
      { page: 2, cond: () => true, x: 527, y: 96 },
      { page: 3, cond: () => true, x: 527, y: 300 },
      { page: 3, cond: () => true, x: 527, y: 279 },
      { page: 3, cond: () => true, x: 527, y: 210 },
      { page: 3, cond: () => true, x: 527, y: 189 },
      { page: 4, cond: () => true, x: 527, y: 548 },
      { page: 4, cond: () => true, x: 527, y: 532 },
      { page: 4, cond: () => true, x: 527, y: 488 },
      { page: 4, cond: () => true, x: 527, y: 472 },
      { page: 4, cond: () => true, x: 527, y: 397 },
      { page: 4, cond: () => true, x: 527, y: 381 },
      { page: 4, cond: (d) => d.notifyCustomer, x: 527, y: 306 },
      // 6P 고객거래확인서: 국내거주, 성별(남/여), 실제소유자 예, 가족보장
      { page: 5, cond: () => true, x: 436, y: 666 },
      { page: 5, cond: (d) => d.beneficiaryGender === 'M', x: 436, y: 606 },
      { page: 5, cond: (d) => d.beneficiaryGender === 'F', x: 492, y: 606 },
      { page: 5, cond: () => true, x: 175, y: 469 },
      { page: 5, cond: () => true, x: 107, y: 247 }
    ],
    signatures: [
      { page: 0, role: 'beneficiary', x: 492, y: 217, w: 48, h: 18 },
      { page: 4, role: 'insured', cond: (d) => !d.isUnder14, x: 495, y: 180, w: 48, h: 18 },
      { page: 4, role: 'beneficiary', cond: (d) => !d.isSameInsBen || !d.isUnder14, x: 495, y: 156, w: 48, h: 18 },
      { page: 4, role: 'guardian', cond: (d) => d.isUnder19, x: 215, y: 156, w: 48, h: 18 },
      { page: 4, role: 'guardian', cond: (d) => d.isUnder19, x: 495, y: 133, w: 48, h: 18 },
      { page: 5, role: 'beneficiary', x: 505, y: 118, w: 48, h: 18 }
    ]
  },

  // ==================== [18. 하나생명] (하나생명 보험금청구서.pdf - 낱칸 spacing 및 전 페이지 정밀보정 완료) ====================
  hana_life: {
    fields: [
      // 1P(CA01): 피보험자 및 수익자 (실측 13칸/11칸 개별 박스 간격 15.88pt 완벽 적용)
      { page: 0, key: 'insuredName', x: 115, y: 595, size: 10, bold: true },
      { page: 0, key: 'insuredRrn1', x: 319, y: 595, size: 10, spacing: 15.88 },
      { page: 0, key: 'insuredRrn2', x: 423, y: 595, size: 10, spacing: 15.88 },
      { page: 0, key: 'insuredJob', x: 115, y: 575, size: 9.5 },
      { page: 0, key: 'insuredPhone1', x: 319, y: 575, size: 10, spacing: 15.88 },
      { page: 0, key: 'insuredPhone2', x: 375, y: 575, size: 10, spacing: 15.88 },
      { page: 0, key: 'insuredPhone3', x: 447, y: 575, size: 10, spacing: 15.88 },
      { page: 0, key: 'beneficiaryName', x: 115, y: 518, size: 10, bold: true },
      { page: 0, key: 'beneficiaryRrn1', x: 319, y: 518, size: 10, spacing: 15.88 },
      { page: 0, key: 'beneficiaryRrn2', x: 423, y: 518, size: 10, spacing: 15.88 },
      { page: 0, key: 'beneficiaryPhone1', x: 319, y: 498, size: 10, spacing: 15.88 },
      { page: 0, key: 'beneficiaryPhone2', x: 375, y: 498, size: 10, spacing: 15.88 },
      { page: 0, key: 'beneficiaryPhone3', x: 447, y: 498, size: 10, spacing: 15.88 },
      { page: 0, key: 'beneficiaryJob', x: 115, y: 478, size: 9.5 },
      { page: 0, key: 'beneficiaryAddress', x: 140, y: 438, size: 9 },
      { page: 0, key: 'bankName', x: 145, y: 160, size: 10 },
      { page: 0, key: 'beneficiaryName', x: 360, y: 160, size: 10 },
      { page: 0, key: 'accountNumber', x: 145, y: 140, size: 10 },
      // 2P(CA02): 청구항목, 8칸 사고일자(spacing: 15.88), 장소, 경위, 작성일 및 수익자
      { page: 1, key: 'diagnosisName', x: 192, y: 640, size: 9.5, bold: true },
      { page: 1, key: 'accYear', x: 146, y: 522, size: 10, spacing: 15.88 },
      { page: 1, key: 'accMonth', x: 218, y: 522, size: 10, spacing: 15.88 },
      { page: 1, key: 'accDay', x: 258, y: 522, size: 10, spacing: 15.88 },
      { page: 1, key: 'accidentPlace', x: 365, y: 522, size: 9.5 },
      { page: 1, key: 'accidentDesc', x: 145, y: 501, size: 9.5 },
      { page: 1, key: 'todayDateSlash', x: 115, y: 214, size: 10 },
      { page: 1, key: 'claimantName', x: 332, y: 214, size: 10, bold: true },
      { page: 1, key: 'relSelf', x: 482, y: 214, size: 9.5 },
      // 3P(HB01 고객거래확인서): 국문성명, 생년월일(6자리), 국적, 주소, 휴대폰, 직업
      { page: 2, key: 'beneficiaryName', x: 115, y: 676, size: 10, bold: true },
      { page: 2, key: 'beneficiaryBirth', x: 115, y: 658, size: 9.5 },
      { page: 2, key: 'nationalityKor', x: 365, y: 658, size: 9.5 },
      { page: 2, key: 'beneficiaryAddress', x: 115, y: 584, size: 9 },
      { page: 2, key: 'beneficiaryPhone', x: 115, y: 566, size: 9.5 },
      { page: 2, key: 'beneficiaryJob', x: 115, y: 529, size: 9.5 },
      // 6P(CA05 동의서 3): 성명 및 동의일
      { page: 5, key: 'insuredName', cond: (d) => !d.isUnder14, x: 345, y: 292, size: 10, bold: true },
      { page: 5, key: 'beneficiaryName', cond: (d) => !d.isSameInsBen || !d.isUnder14, x: 345, y: 269, size: 10, bold: true },
      { page: 5, key: 'guardianName19', cond: (d) => d.isUnder19, x: 345, y: 246, size: 10, bold: true },
      { page: 5, key: 'todayYear', x: 70, y: 201, size: 10 },
      { page: 5, key: 'todayMonth', x: 125, y: 201, size: 10 },
      { page: 5, key: 'todayDay', x: 162, y: 201, size: 10 },
      // 7P(CA06 국외제공동의서)
      { page: 6, key: 'todayYear', x: 80, y: 159, size: 10 },
      { page: 6, key: 'todayMonth', x: 135, y: 159, size: 10 },
      { page: 6, key: 'todayDay', x: 172, y: 159, size: 10 },
      { page: 6, key: 'insuredName', cond: (d) => !d.isUnder14, x: 365, y: 165, size: 10, bold: true },
      { page: 6, key: 'guardianName19', cond: (d) => d.isUnder19, x: 365, y: 142, size: 10, bold: true }
    ],
    checks: [
      { page: 0, cond: () => true, x: 153, y: 259 }, // 실제소유자: 예
      { page: 0, cond: () => true, x: 153, y: 200 }, // 사고연금: 일시금 수령
      // 2P(실측 13x17 네모칸 정중앙): 전체청구, 청구유형, 발생원인(질병 108 / 재해 314), 문자안내
      { page: 1, cond: () => true, x: 108, y: 681 },
      { page: 1, cond: (d) => d.coverages.includes('장해'), x: 183, y: 622 },
      { page: 1, cond: (d) => d.coverages.includes('진단'), x: 257, y: 622 },
      { page: 1, cond: (d) => d.coverages.includes('수술'), x: 332, y: 622 },
      { page: 1, cond: (d) => d.coverages.includes('입원'), x: 407, y: 622 },
      { page: 1, cond: (d) => d.coverages.includes('통원') || d.coverages.includes('실손의료비'), x: 481, y: 622 },
      { page: 1, cond: (d) => d.accidentType === '질병', x: 108, y: 562 },
      { page: 1, cond: (d) => d.accidentType !== '질병', x: 314, y: 562 }, // 재해 네모칸 정중앙
      { page: 1, cond: (d) => d.notifyCustomer, x: 219, y: 399 },
      { page: 1, cond: (d) => d.notifyCustomer, x: 219, y: 379 },
      { page: 1, cond: (d) => d.notifyCustomer, x: 422, y: 359 },
      // 3P(HB01): 국내거주, 성별(남/여), 대리인 아니오, 실제소유자 예, 보장성
      { page: 2, cond: () => true, x: 112, y: 639 },
      { page: 2, cond: (d) => d.beneficiaryGender === 'M', x: 277, y: 602 },
      { page: 2, cond: (d) => d.beneficiaryGender === 'F', x: 347, y: 602 },
      { page: 2, cond: () => true, x: 330, y: 490 },
      { page: 2, cond: () => true, x: 139, y: 403 },
      { page: 2, cond: () => true, x: 111, y: 328 },
      // 4~7P 상세동의서 □ 동의함 11곳 (실측 BOX x=495.7..508.7 정중앙)
      { page: 3, cond: () => true, x: 498, y: 362 },
      { page: 3, cond: () => true, x: 498, y: 263 },
      { page: 3, cond: () => true, x: 498, y: 163 },
      { page: 4, cond: () => true, x: 498, y: 294 },
      { page: 4, cond: () => true, x: 498, y: 218 },
      { page: 4, cond: () => true, x: 498, y: 118 },
      { page: 5, cond: () => true, x: 498, y: 490 },
      { page: 5, cond: () => true, x: 498, y: 423 },
      { page: 5, cond: () => true, x: 498, y: 334 },
      { page: 6, cond: () => true, x: 498, y: 284 },
      { page: 6, cond: () => true, x: 498, y: 212 }
    ],
    signatures: [
      { page: 1, role: 'beneficiary', x: 392, y: 214, w: 48, h: 18 },
      { page: 5, role: 'insured', cond: (d) => !d.isUnder14, x: 468, y: 292, w: 48, h: 18 },
      { page: 5, role: 'beneficiary', cond: (d) => !d.isSameInsBen || !d.isUnder14, x: 468, y: 269, w: 48, h: 18 },
      { page: 5, role: 'guardian', cond: (d) => d.isUnder19, x: 468, y: 246, w: 48, h: 18 },
      { page: 6, role: 'insured', cond: (d) => !d.isUnder14, x: 468, y: 165, w: 48, h: 18 },
      { page: 6, role: 'guardian', cond: (d) => d.isUnder19, x: 468, y: 142, w: 48, h: 18 }
    ]
  },

  // ==================== [19. 한화생명] (한화생명 보험금청구서.pdf - 1P 행 밀림(19pt) 및 5P 확인일 정밀보정 완료) ====================
  hanwha_life: {
    fields: [
      // 1P(595x842): 피보험자 인적사항 (섹션 제목 아래 실제 입력 행: y=703, 684)
      { page: 0, key: 'insuredName', x: 118, y: 703, size: 10, bold: true },
      { page: 0, key: 'insuredRrnFull', x: 310, y: 703, size: 10 },
      { page: 0, key: 'insuredJob', x: 118, y: 684, size: 9.5 },
      { page: 0, key: 'insuredPhone', x: 466, y: 684, size: 9.5 },
      // 1P: 대표 수령인 인적사항 및 입금계좌 (1줄 하향 교정: y=604, 585, 566, 528)
      { page: 0, key: 'beneficiaryName', x: 118, y: 604, size: 10, bold: true },
      { page: 0, key: 'beneficiaryRrnFull', x: 310, y: 604, size: 10 },
      { page: 0, key: 'beneficiaryPhone', x: 118, y: 585, size: 9.5 },
      { page: 0, key: 'relSelf', x: 466, y: 585, size: 9.5 },
      { page: 0, key: 'beneficiaryAddress', x: 118, y: 566, size: 9 },
      { page: 0, key: 'bankName', x: 118, y: 528, size: 10 },
      { page: 0, key: 'beneficiaryName', x: 265, y: 528, size: 10 },
      { page: 0, key: 'accountNumber', x: 412, y: 528, size: 10 },
      // 1P: 사고일시, 장소, 경위, 병명 (실측 행 y=462, 443, 418)
      { page: 0, key: 'accidentDate', x: 165, y: 462, size: 9.5 },
      { page: 0, key: 'accidentPlace', x: 358, y: 462, size: 9.5 },
      { page: 0, key: 'accidentDesc', x: 165, y: 443, size: 8.5 },
      { page: 0, key: 'diagnosisName', x: 175, y: 420, size: 9.5, bold: true },
      // 1P 하단: 작성일자 및 수령인 성명 (헤더 아래 실제 입력칸 y=120)
      { page: 0, key: 'todayYear', x: 118, y: 120, size: 10 },
      { page: 0, key: 'todayMonth', x: 186, y: 120, size: 10 },
      { page: 0, key: 'todayDay', x: 236, y: 120, size: 10 },
      { page: 0, key: 'claimantName', x: 392, y: 120, size: 10, bold: true },
      // 5P(동의서 4/4, 559x792): 성명 및 확인일 ('년'·'월'·'일' 빈칸 정밀 정렬)
      { page: 4, key: 'insuredName', cond: (d) => !d.isUnder14, x: 118, y: 254, size: 10, bold: true },
      { page: 4, key: 'guardianName19', cond: (d) => d.isUnder19, x: 372, y: 254, size: 10, bold: true },
      { page: 4, key: 'beneficiaryName', cond: (d) => !d.isSameInsBen || !d.isUnder14, x: 118, y: 225, size: 10, bold: true },
      { page: 4, key: 'todayYear', x: 368, y: 225, size: 10 },
      { page: 4, key: 'todayMonth', x: 430, y: 225, size: 10 },
      { page: 4, key: 'todayDay', x: 478, y: 225, size: 10 }
    ],
    checks: [
      { page: 0, cond: () => true, x: 147, y: 669 }, // 의료수급권자: 아니오
      { page: 0, cond: () => true, x: 135, y: 548 }, // 수령방법: 송금
      { page: 0, cond: (d) => d.accidentType === '질병', x: 118, y: 501 },
      { page: 0, cond: (d) => d.accidentType !== '질병', x: 284, y: 501 },
      { page: 0, cond: (d) => d.coverages.includes('장해'), x: 151, y: 482 },
      { page: 0, cond: (d) => d.coverages.includes('진단'), x: 185, y: 482 },
      { page: 0, cond: (d) => d.coverages.includes('수술'), x: 219, y: 482 },
      { page: 0, cond: (d) => d.coverages.includes('입원'), x: 252, y: 482 },
      { page: 0, cond: (d) => d.coverages.includes('통원'), x: 285, y: 482 },
      { page: 0, cond: (d) => d.coverages.includes('실손의료비'), x: 367, y: 482 },
      { page: 0, cond: () => true, x: 496, y: 445 }, // 자보처리: 아니오
      { page: 0, cond: () => true, x: 118, y: 390 }, // 청구구분: 일시금
      { page: 0, cond: () => true, x: 390, y: 390 }, // 일부청구: 아니오
      { page: 0, cond: (d) => d.notifyCustomer, x: 131, y: 324 },
      { page: 0, cond: (d) => d.notifyCustomer, x: 311, y: 324 },
      { page: 0, cond: (d) => d.notifyPlanner, x: 131, y: 305 },
      { page: 0, cond: (d) => d.notifyCustomer, x: 311, y: 305 },
      { page: 0, cond: () => true, x: 513, y: 195 }, // 확인(필수) 체크박스
      // 2~5P 상세동의서(559x792) 아래쪽 '동의함' 박스 (실측 중심 x=459)
      { page: 1, cond: () => true, x: 459, y: 386 },
      { page: 1, cond: () => true, x: 459, y: 304 },
      { page: 1, cond: () => true, x: 459, y: 190 },
      { page: 2, cond: () => true, x: 459, y: 302 },
      { page: 2, cond: () => true, x: 459, y: 230 },
      { page: 2, cond: () => true, x: 459, y: 129 },
      { page: 3, cond: () => true, x: 459, y: 300 },
      { page: 3, cond: () => true, x: 459, y: 218 },
      { page: 4, cond: () => true, x: 459, y: 475 },
      { page: 4, cond: () => true, x: 459, y: 415 },
      { page: 4, cond: () => true, x: 459, y: 333 }
    ],
    signatures: [
      { page: 0, role: 'beneficiary', x: 505, y: 120, w: 50, h: 20 },
      { page: 4, role: 'insured', cond: (d) => !d.isUnder14, x: 212, y: 254, w: 48, h: 18 },
      { page: 4, role: 'guardian', cond: (d) => d.isUnder19, x: 466, y: 254, w: 48, h: 18 },
      { page: 4, role: 'beneficiary', cond: (d) => !d.isSameInsBen || !d.isUnder14, x: 212, y: 225, w: 48, h: 18 }
    ]
  },

  // ==================== [20. 흥국생명] (흥국생명 보험금청구서.pdf - 2550x3561 고해상도 표·서명란 정밀보정 완료) ====================
  heungkuk_life: {
    fields: [
      // 1P(2550x3561): 피보험자 인적사항
      { page: 0, key: 'insuredName', x: 430, y: 3090, size: 42, bold: true },
      { page: 0, key: 'insuredRrnFull', x: 1050, y: 3090, size: 40 },
      { page: 0, key: 'insuredPhone', x: 1200, y: 2970, size: 40 },
      // 1P: 수익자 인적사항 및 수령계좌
      { page: 0, key: 'relIfDiff', cond: (d) => !d.isSameInsBen, x: 1850, y: 2725, size: 38 },
      { page: 0, key: 'beneficiaryName', x: 420, y: 2605, size: 42, bold: true },
      { page: 0, key: 'beneficiaryRrnFull', x: 1050, y: 2605, size: 40 },
      { page: 0, key: 'beneficiaryPhone', x: 1200, y: 2480, size: 40 },
      { page: 0, key: 'beneficiaryAddress', x: 430, y: 2380, size: 36 },
      { page: 0, key: 'beneficiaryJob', x: 430, y: 2295, size: 38 },
      { page: 0, key: 'bankName', x: 430, y: 2080, size: 40 },
      { page: 0, key: 'beneficiaryName', x: 1160, y: 2080, size: 40 },
      { page: 0, key: 'accountNumber', x: 1800, y: 2080, size: 40 },
      // 1P: 사고일시('일' 누락 방지 x=1060), 장소, 경위, 병명
      { page: 0, key: 'accYear', x: 460, y: 1250, size: 40 },
      { page: 0, key: 'accMonth', x: 800, y: 1250, size: 40 },
      { page: 0, key: 'accDay', x: 1030, y: 1250, size: 40 },
      { page: 0, key: 'accidentPlace', x: 1960, y: 1250, size: 38 },
      { page: 0, key: 'accidentDesc', x: 430, y: 1150, size: 38 },
      { page: 0, key: 'diagnosisName', x: 430, y: 1050, size: 40, bold: true },
      // 1P 하단: 좌측 작성일(20__년 __월 __일) + 우측 수익자(청구인) 성명 (동일 행 y=305)
      { page: 0, key: 'todayYearShort', x: 240, y: 305, size: 42 },
      { page: 0, key: 'todayMonth', x: 480, y: 305, size: 42 },
      { page: 0, key: 'todayDay', x: 680, y: 305, size: 42 },
      { page: 0, key: 'claimantName', x: 1320, y: 305, size: 42, bold: true },
      // 5P(동의서 4/4, 2550x3561): 동의일(y=925) 및 2열×2행 서명 표(윗줄 y=720, 아랫줄 y=500)
      { page: 4, key: 'todayYearShort', x: 1020, y: 925, size: 42 },
      { page: 4, key: 'todayMonth', x: 1290, y: 925, size: 42 },
      { page: 4, key: 'todayDay', x: 1520, y: 925, size: 42 },
      { page: 4, key: 'insuredName', cond: (d) => !d.isUnder14, x: 450, y: 720, size: 42, bold: true },
      { page: 4, key: 'guardianName19', cond: (d) => d.isUnder19, x: 1680, y: 720, size: 40, bold: true },
      { page: 4, key: 'beneficiaryName', cond: (d) => !d.isSameInsBen || !d.isUnder14, x: 450, y: 500, size: 42, bold: true },
      { page: 4, key: 'claimantName', x: 1680, y: 500, size: 40, bold: true }
    ],
    checks: [
      { page: 0, cond: () => true, x: 750, y: 2975, size: 48 }, // 의료수급: 비해당
      { page: 0, cond: (d) => d.isSameInsBen, x: 735, y: 2725, size: 48 },
      { page: 0, cond: (d) => !d.isSameInsBen && d.guardianRel === '부', x: 965, y: 2725, size: 48 },
      { page: 0, cond: (d) => !d.isSameInsBen && d.guardianRel === '모', x: 1135, y: 2725, size: 48 },
      { page: 0, cond: (d) => !d.isSameInsBen && d.guardianRel !== '부' && d.guardianRel !== '모', x: 1680, y: 2725, size: 48 },
      { page: 0, cond: () => true, x: 470, y: 2485, size: 48 }, // 실제소유자: 예
      { page: 0, cond: () => true, x: 451, y: 1575, size: 48 }, // 전체청구
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
      { page: 0, cond: (d) => d.notifyCustomer, x: 960, y: 685, size: 48 },
      // 2~5P 상세동의서 우측 '동의' 체크 11곳
      { page: 1, cond: () => true, x: 2290, y: 1950, size: 48 },
      { page: 1, cond: () => true, x: 2290, y: 1565, size: 48 },
      { page: 1, cond: () => true, x: 2290, y: 1035, size: 48 },
      { page: 2, cond: () => true, x: 2290, y: 1560, size: 48 },
      { page: 2, cond: () => true, x: 2290, y: 1260, size: 48 },
      { page: 2, cond: () => true, x: 2290, y: 830, size: 48 },
      { page: 3, cond: () => true, x: 2290, y: 1900, size: 48 },
      { page: 3, cond: () => true, x: 2290, y: 1370, size: 48 },
      { page: 4, cond: () => true, x: 2290, y: 2040, size: 48 },
      { page: 4, cond: () => true, x: 2290, y: 1720, size: 48 },
      { page: 4, cond: () => true, x: 2290, y: 1170, size: 48 }
    ],
    signatures: [
      { page: 0, role: 'beneficiary', x: 2080, y: 305, w: 230, h: 85 }, // 1P 수익자 서명란(y=305)
      { page: 4, role: 'insured', cond: (d) => !d.isUnder14, x: 920, y: 720, w: 220, h: 80 },
      { page: 4, role: 'guardian', cond: (d) => d.isUnder19, x: 2120, y: 720, w: 220, h: 80 },
      { page: 4, role: 'beneficiary', cond: (d) => !d.isSameInsBen || !d.isUnder14, x: 920, y: 500, w: 220, h: 80 },
      { page: 4, role: 'beneficiary', x: 2120, y: 500, w: 220, h: 80 }
    ]
  }
});
