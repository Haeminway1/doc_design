/**
 * HWPX 단어 정리표 — Dayoooun/hwpx-mcp API로 스타일 완전 적용
 * 참조 이미지: 남색 PART 배너 + 볼드 제목 + 미니멀 테이블
 */
const path = require('path');
const fs = require('fs');
const { HwpxDocument } = require('/tmp/hwpx-mcp/mcp-server/dist/HwpxDocument');

const VOCAB = [
  ["numerous","많은, 다수의"],["benefit","이점"],["sort through","~을 정리하다"],
  ["anxiety","불안(감)"],["figure out","~을 알다, 알아내다"],["gratitude","감사함"],
  ["reflect on","~을 되돌아보다"],["reveal","드러내다"],["document","기록하다"],
  ["extend","확장하다"],["boost","증진시키다"],["enhance","향상하다"],
  ["aid","돕다"],["foster","촉진하다, 조성하다"],["empathetic","공감하는, 감정 이입되는"],
  ["evidence","증거하다"],["distress","고통, 괴로움"],["significant","상당한, 의미심장한"],
  ["ivory","상아"],["confirm","확인하다"],["highlight","강조하다"],["status","지위"],
  ["channel","통하다, 쏟다"],["actionable","실행 가능한"],["assist","돕다"],
  ["comfort","위안하다"],["emotional contagion","감정의 전염"],["demonstrate","보여주다"],
  ["mirror","반영하다"],["soothing","진정시키는"],["underscore","강조하다"],
  ["illegal","불법의"],["horror","공포"],["kin","친족"],
  ["come of age","성숙해지다"],["centerpiece","중심"],["whereabouts","행방, 소재"],
  ["happenstance","우연"],["narrative","이야기"],["formulation","공식화"],
  ["acclimation","순응"],["distinctive","독특한"],["journaling","일기 쓰기"],
  ["complicated","복잡한"],["self-talk","자기 대화"],["gratitude","감사하는 마음"],
  ["self-discovery","자기 발견"],["organize","조직하다"],
  ["entry","항목, 기재"],["exploration","탐색, 탐구"],
];

async function main() {
  const outDir = '/mnt/d/projects/doc_design/hwpx_project/output';

  // ═══════════════════════════════════════════════
  // 1. 문서 생성
  // ═══════════════════════════════════════════════
  const doc = HwpxDocument.createNew('vocab', '단어 정리표', 'HWPX Generator');

  // ═══════════════════════════════════════════════
  // 2. 단락 삽입
  // ═══════════════════════════════════════════════
  // 0: secPr (기본), 1: PART 0, 2: 빈줄, 3: 제목, 4: 빈줄
  doc.insertParagraph(0, 0, 'PART 0');
  doc.insertParagraph(0, 1, '');
  doc.insertParagraph(0, 2, '1과  VOCABULARY');
  doc.insertParagraph(0, 3, '');

  // ═══════════════════════════════════════════════
  // 3. 단락 스타일 적용
  // ═══════════════════════════════════════════════

  // PART 0 — 배경색 + 흰색 글씨 + 작은 폰트
  doc.applyCharacterStyle(0, 1, 0, {
    fontName: '맑은 고딕', fontSize: 8, fontColor: '#FFFFFF', bold: true,
    backgroundColor: '#1F3864'
  });
  doc.applyParagraphStyle(0, 1, { alignment: 'left' });

  // 제목 — 큰 볼드
  doc.applyCharacterStyle(0, 3, 0, {
    fontName: '맑은 고딕', fontSize: 18, fontColor: '#000000', bold: true
  });
  doc.applyParagraphStyle(0, 3, { alignment: 'left' });

  console.log('✓ Paragraphs styled');

  // ═══════════════════════════════════════════════
  // 4. 단어 테이블 삽입
  // ═══════════════════════════════════════════════
  const numRows = 26; // 1 header + 25 data
  const numCols = 7;  // No, VOCA, MEANING, gap, No, VOCA, MEANING
  const tableData = [];

  // 헤더
  tableData.push(['', 'VOCA', 'MEANING', '', '', 'VOCA', 'MEANING']);

  // 데이터
  const left = VOCAB.slice(0, 25);
  const right = VOCAB.slice(25, 50);
  for (let i = 0; i < 25; i++) {
    const ln = i < left.length ? String(i + 1) : '';
    const lv = i < left.length ? left[i][0] : '';
    const lm = i < left.length ? left[i][1] : '';
    const rn = i < right.length ? String(i + 26) : '';
    const rv = i < right.length ? right[i][0] : '';
    const rm = i < right.length ? right[i][1] : '';
    tableData.push([ln, lv, lm, '', rn, rv, rm]);
  }

  doc.insertTable(0, 4, numRows, numCols, tableData);
  console.log('✓ Table inserted');

  // ═══════════════════════════════════════════════
  // 5. 테이블 셀 스타일 적용
  // ═══════════════════════════════════════════════

  // 셀 너비 설정 (hwpunit)
  const colWidths = [1800, 9000, 9500, 700, 1800, 9000, 9500];

  for (let r = 0; r < numRows; r++) {
    for (let c = 0; c < numCols; c++) {
      // 너비 설정
      doc.setCellProperties(0, 0, r, c, {
        width: colWidths[c],
        height: 950
      });
    }
  }

  // 헤더 행 (row 0) — 볼드 텍스트
  for (let c of [0, 1, 2, 4, 5, 6]) {
    doc.setCellProperties(0, 0, 0, c, {
      width: colWidths[c],
      height: 1000,
    });
  }

  // 번호 컬럼 (col 0, 4) — 볼드
  // 데이터 행의 스타일은 updateTableCell의 charShapeId로 설정 가능
  // 하지만 직접 cell text style을 설정하는 건 제한적

  console.log('✓ Cell properties set');

  // ═══════════════════════════════════════════════
  // 6. 페이지 번호 단락
  // ═══════════════════════════════════════════════
  doc.insertParagraph(0, 6, '1');
  doc.applyCharacterStyle(0, 7, 0, {
    fontName: '맑은 고딕', fontSize: 8, fontColor: '#999999'
  });
  doc.applyParagraphStyle(0, 7, { alignment: 'center' });

  // ═══════════════════════════════════════════════
  // 7. 저장
  // ═══════════════════════════════════════════════
  await doc.save(path.join(outDir, '01_단어정리표.hwpx'));
  console.log('✓ Saved: 01_단어정리표.hwpx (' + fs.statSync(path.join(outDir, '01_단어정리표.hwpx')).size + ' bytes)');

  // ═══════════════════════════════════════════════
  // 빈칸 채우기 문서
  // ═══════════════════════════════════════════════
  const doc2 = HwpxDocument.createNew('fill', '빈칸 채우기', 'HWPX Generator');
  doc2.insertParagraph(0, 0, '빈칸 채우기');
  doc2.applyCharacterStyle(0, 1, 0, {
    fontName: '맑은 고딕', fontSize: 8, fontColor: '#FFFFFF', bold: true,
    backgroundColor: '#1F3864'
  });

  const fillProblems = [
    { num: '20', src: '모의고사 20번',
      text: 'Fans who are inclined to spend a lot of time thinking about what athletes owe them as fans should also think about the (A) obligations that fans might have as fans.' },
    { num: '21', src: '모의고사 21번',
      text: 'The concept of ecosystem states should be (A) to anyone with a home vegetable garden. The garden is a small ecosystem (what/ that) the grower attempts to keep in a specific state.' },
  ];

  let idx = 1;
  for (const prob of fillProblems) {
    doc2.insertParagraph(0, idx++, '');
    doc2.insertParagraph(0, idx, `${prob.num}. ${prob.src}`);
    doc2.applyCharacterStyle(0, idx + 1, 0, { fontName: '맑은 고딕', fontSize: 11, bold: true });
    idx++;
    doc2.insertParagraph(0, idx, '');
    idx++;
    doc2.insertParagraph(0, idx, prob.text);
    doc2.applyCharacterStyle(0, idx + 1, 0, { fontName: '맑은 고딕', fontSize: 10 });
    idx++;
    doc2.insertParagraph(0, idx, '');
    idx++;

    doc2.insertTable(0, idx, 1, 2, [['(A)  ________________', '(B)  ________________']]);
    idx++;
    doc2.insertParagraph(0, idx, '');
    idx++;
  }

  await doc2.save(path.join(outDir, '02_빈칸채우기.hwpx'));
  console.log('✓ Saved: 02_빈칸채우기.hwpx');

  // ═══════════════════════════════════════════════
  // 문법 선택 문서
  // ═══════════════════════════════════════════════
  const doc3 = HwpxDocument.createNew('grammar', '문법 선택', 'HWPX Generator');
  doc3.insertParagraph(0, 0, '문법 선택');
  doc3.applyCharacterStyle(0, 1, 0, {
    fontName: '맑은 고딕', fontSize: 8, fontColor: '#FFFFFF', bold: true,
    backgroundColor: '#1F3864'
  });

  const grammarProblems = [
    { num: '22', src: '모의고사 22번',
      text: 'Commitment is the glue (held / holding) together characteristically human forms of social life.',
      choices: [['held', 'holding']] },
    { num: '23', src: '모의고사 23번',
      text: 'If the brain has already stored someone\'s face and name, why do we still end up (to remember/ remembering) one and not the other?',
      choices: [['to remember', 'remembering']] },
  ];

  idx = 1;
  for (const prob of grammarProblems) {
    doc3.insertParagraph(0, idx++, '');
    doc3.insertParagraph(0, idx, `${prob.num}. ${prob.src}`);
    doc3.applyCharacterStyle(0, idx + 1, 0, { fontName: '맑은 고딕', fontSize: 11, bold: true });
    idx++;
    doc3.insertParagraph(0, idx, '');
    idx++;
    doc3.insertParagraph(0, idx, prob.text);
    doc3.applyCharacterStyle(0, idx + 1, 0, { fontName: '맑은 고딕', fontSize: 10 });
    idx++;
    doc3.insertParagraph(0, idx, '');
    idx++;

    const choiceData = prob.choices.map(([a, b]) => [`① ${a}`, `② ${b}`]);
    doc3.insertTable(0, idx, choiceData.length, 2, choiceData);
    idx++;
    doc3.insertParagraph(0, idx, '');
    idx++;
  }

  await doc3.save(path.join(outDir, '03_문법선택.hwpx'));
  console.log('✓ Saved: 03_문법선택.hwpx');

  console.log('\n✓ 모든 파일 생성 완료!');
}

main().catch(e => {
  console.error('Error:', e.message);
  console.error(e.stack);
});
