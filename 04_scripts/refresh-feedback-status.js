#!/usr/bin/env node

/**
 * 피드백지 현황 자동 리프레시 스크립트
 * - 실제 폴더 구조 스캔
 * - 옵시디언 피드백지 현황.md 자동 업데이트
 */

const fs = require('fs');
const path = require('path');

const TUTORING_DIR = path.join(__dirname, '..', '00_tutoring');
const OUTPUT_FILE = path.join(
  process.env.HOME,
  'Library/CloudStorage/OneDrive-개인/문서/obsidian sync/복돌이/베라/학생/피드백지 현황.md'
);

// 활성 학생 목록
const ACTIVE_STUDENTS = [
  '임서휘', '진주', '정재영', '김예은', '김지환',
  '최유하', '박수빈', '최여진', '이하린', '윤석우',
  '박지율', '박은지', '정성엽', '오수민', '나진원',
  '연제우', '진소윤', '김종호', '조근영',
];

// 이탈 학생
const CHURNED_STUDENTS = [
  'x유연우', 'x박민교', 'x하나윤', 'x임소희', 'x강예슬',
  'x정민혁', 'x양지수', 'x이연율', '김의진'
];

/**
 * 학생 폴더 스캔
 */
function scanStudentFolder(studentName) {
  const studentDir = path.join(TUTORING_DIR, studentName);
  
  if (!fs.existsSync(studentDir)) {
    return {
      name: studentName,
      status: '⏸️ 미신청',
      progress: '-',
      dates: [],
      inputCount: 0,
      outputCount: 0,
    };
  }
  
  const inputDir = path.join(studentDir, 'input');
  const outputDir = path.join(studentDir, 'output');
  
  // 날짜 폴더 확인
  const inputDates = fs.existsSync(inputDir) 
    ? fs.readdirSync(inputDir).filter(f => /^\d{6}$/.test(f))
    : [];
  
  const outputDates = fs.existsSync(outputDir)
    ? fs.readdirSync(outputDir).filter(f => /^\d{6}$/.test(f))
    : [];
  
  const allDates = [...new Set([...inputDates, ...outputDates])].sort();
  
  // 상태 판단
  let status = '⏸️ 미신청';
  let progress = '-';
  
  if (inputDates.length > 0 && outputDates.length === 0) {
    status = '📋 신청';
    progress = 'Step 1';
  } else if (inputDates.length > 0 && outputDates.length > 0) {
    // output 폴더 내부 확인
    const latestOutputDate = outputDates[outputDates.length - 1];
    const outputFiles = fs.readdirSync(path.join(outputDir, latestOutputDate));
    
    if (outputFiles.some(f => f.endsWith('.pdf'))) {
      status = '✅ 완료';
      progress = '100%';
    } else if (outputFiles.some(f => f.endsWith('.md'))) {
      status = '🔄 진행 중';
      progress = 'Step 3';
    } else {
      status = '🔄 진행 중';
      progress = 'Step 2';
    }
  }
  
  // 파일 개수
  let inputCount = 0;
  let outputCount = 0;
  
  inputDates.forEach(date => {
    const files = fs.readdirSync(path.join(inputDir, date));
    inputCount += files.filter(f => f.match(/\.(jpe?g|png)$/i)).length;
  });
  
  outputDates.forEach(date => {
    const files = fs.readdirSync(path.join(outputDir, date));
    outputCount += files.length;
  });
  
  return {
    name: studentName,
    status,
    progress,
    dates: allDates,
    inputCount,
    outputCount,
  };
}

/**
 * 마크다운 생성
 */
function generateMarkdown(students) {
  const now = new Date();
  const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  
  // 상태별 분류
  const completed = students.filter(s => s.status === '✅ 완료');
  const inProgress = students.filter(s => s.status === '🔄 진행 중');
  const requested = students.filter(s => s.status === '📋 신청');
  const notRequested = students.filter(s => s.status === '⏸️ 미신청');
  
  let md = `# 피드백지 현황\n\n`;
  md += `> **마지막 업데이트:** ${dateStr} ${timeStr}  \n`;
  md += `> **관리:** 복돌이 🐕  \n`;
  md += `> **자동 생성:** \`node 04_scripts/refresh-feedback-status.js\`\n\n`;
  md += `---\n\n`;
  
  // 요약 통계
  md += `## 📊 요약\n\n`;
  md += `| 상태 | 학생 수 | 비율 |\n`;
  md += `|------|---------|------|\n`;
  md += `| ✅ 완료 | ${completed.length}명 | ${Math.round(completed.length / students.length * 100)}% |\n`;
  md += `| 🔄 진행 중 | ${inProgress.length}명 | ${Math.round(inProgress.length / students.length * 100)}% |\n`;
  md += `| 📋 신청 (미제작) | ${requested.length}명 | ${Math.round(requested.length / students.length * 100)}% |\n`;
  md += `| ⏸️ 미신청 | ${notRequested.length}명 | ${Math.round(notRequested.length / students.length * 100)}% |\n`;
  md += `| **합계** | **${students.length}명** | **100%** |\n\n`;
  
  // 전체 학생 통합 표
  md += `## 📋 전체 학생 현황 (엑셀 스타일)\n\n`;
  md += `| # | 학생명 | 상태 | 진행률 | 제작일 | 사진 수 | 산출물 | 비고 |\n`;
  md += `|---|--------|------|--------|--------|---------|--------|------|\n`;
  
  students.forEach((s, i) => {
    const num = String(i + 1).padStart(2, '0');
    const dateStr = s.dates.length > 0 ? s.dates.join(', ') : '-';
    const note = s.status === '📋 신청' ? '**🚨 즉시 처리 필요**' : '';
    
    md += `| ${num} | **${s.name}** | ${s.status} | ${s.progress} | ${dateStr} | ${s.inputCount} | ${s.outputCount} | ${note} |\n`;
  });
  
  md += `\n---\n\n`;
  
  // 긴급 처리 필요
  if (requested.length > 0) {
    md += `## 🚨 긴급: 신청 (미제작) - 즉시 처리 필요!\n\n`;
    requested.forEach(s => {
      md += `- **${s.name}** (${s.dates.join(', ')}) - 사진 ${s.inputCount}장\n`;
    });
    md += `\n---\n\n`;
  }
  
  // 세부 현황
  md += `## 📝 세부 현황\n\n`;
  
  if (completed.length > 0) {
    md += `### ✅ 완료 (${completed.length}명)\n\n`;
    completed.forEach(s => {
      md += `- **${s.name}** (${s.dates.join(', ')}) - 사진 ${s.inputCount}장, 산출물 ${s.outputCount}개\n`;
    });
    md += `\n`;
  }
  
  if (inProgress.length > 0) {
    md += `### 🔄 진행 중 (${inProgress.length}명)\n\n`;
    inProgress.forEach(s => {
      md += `- **${s.name}** (${s.dates.join(', ')}) - ${s.progress} 단계, 사진 ${s.inputCount}장\n`;
    });
    md += `\n`;
  }
  
  if (notRequested.length > 0) {
    md += `### ⏸️ 미신청 (${notRequested.length}명)\n\n`;
    notRequested.forEach(s => {
      md += `- ${s.name}\n`;
    });
    md += `\n`;
  }
  
  // 이탈 학생
  md += `---\n\n`;
  md += `## ❌ 이탈 학생 (제외) (${CHURNED_STUDENTS.length}명)\n\n`;
  CHURNED_STUDENTS.forEach((s, i) => {
    md += `${i + 1}. ${s}\n`;
  });
  
  md += `\n---\n\n`;
  md += `**작성자:** 복돌이 🐕\n`;
  
  return md;
}

/**
 * 메인 함수
 */
function main() {
  console.log('🔄 피드백지 현황 리프레시 중...\n');
  
  // 모든 활성 학생 스캔
  const students = ACTIVE_STUDENTS.map(scanStudentFolder);
  
  // 상태별 정렬 (긴급 → 진행 중 → 완료 → 미신청)
  students.sort((a, b) => {
    const order = { '📋 신청': 0, '🔄 진행 중': 1, '✅ 완료': 2, '⏸️ 미신청': 3 };
    return order[a.status] - order[b.status];
  });
  
  // 마크다운 생성
  const markdown = generateMarkdown(students);
  
  // 파일 저장
  fs.writeFileSync(OUTPUT_FILE, markdown, 'utf8');
  
  console.log('✅ 피드백지 현황 업데이트 완료!\n');
  console.log(`📄 파일: ${OUTPUT_FILE}\n`);
  
  // 요약 출력
  const completed = students.filter(s => s.status === '✅ 완료').length;
  const inProgress = students.filter(s => s.status === '🔄 진행 중').length;
  const requested = students.filter(s => s.status === '📋 신청').length;
  const notRequested = students.filter(s => s.status === '⏸️ 미신청').length;
  
  console.log('📊 요약:');
  console.log(`  ✅ 완료: ${completed}명`);
  console.log(`  🔄 진행 중: ${inProgress}명`);
  console.log(`  📋 신청 (미제작): ${requested}명`);
  console.log(`  ⏸️ 미신청: ${notRequested}명`);
  console.log(`  합계: ${students.length}명\n`);
  
  if (requested > 0) {
    console.log('🚨 긴급: 신청 (미제작) 학생이 있습니다! 즉시 처리 필요!\n');
  }
}

// 실행
if (require.main === module) {
  main();
}

module.exports = { scanStudentFolder, generateMarkdown };
