#!/usr/bin/env node

/**
 * 학생 폴더 재구성 스크립트
 * - 기존 학생 파일들을 날짜별 폴더로 이동
 * - 활성 학생 전체 폴더 생성
 */

const fs = require('fs');
const path = require('path');

const BASE_DIR = path.join(__dirname, '..', '00_tutoring');

// 활성 학생 목록
const ACTIVE_STUDENTS = [
  '김종호',      // 완료
  '조근영',      // 진행 중
  '임서휘',
  '진주',
  '정재영',
  '김예은',
  '김지환',
  '최유하',
  '박수빈',
  '최여진',
  '이하린',
  '윤석우',
  '박지율',
  '박은지',
  '정성엽',
  '오수민',
  '나진원',
  '연제우',
  '진소윤',
];

// 파일명에서 날짜 추출 (KakaoTalk_Photo_2026-02-13...)
function extractDateFromFilename(filename) {
  const match = filename.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    const [_, year, month, day] = match;
    return year.slice(2) + month + day; // YYMMDD
  }
  return null;
}

// 폴더 생성 (재귀적)
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`✅ 폴더 생성: ${dirPath}`);
  }
}

// 파일 이동
function moveFile(srcPath, destPath) {
  ensureDir(path.dirname(destPath));
  fs.renameSync(srcPath, destPath);
  console.log(`  📦 이동: ${path.basename(srcPath)} → ${path.basename(destPath)}`);
}

// 기존 학생 재구성
function reorganizeExistingStudent(studentName) {
  const studentDir = path.join(BASE_DIR, studentName);
  if (!fs.existsSync(studentDir)) return;
  
  console.log(`\n👤 ${studentName} 재구성 중...`);
  
  // input 폴더
  const inputDir = path.join(studentDir, 'input');
  if (fs.existsSync(inputDir)) {
    const files = fs.readdirSync(inputDir).filter(f => f.endsWith('.jpeg') || f.endsWith('.jpg'));
    
    if (files.length > 0) {
      // 첫 번째 파일에서 날짜 추출
      const dateStr = extractDateFromFilename(files[0]);
      if (dateStr) {
        const dateDirPath = path.join(inputDir, dateStr);
        ensureDir(dateDirPath);
        
        // 모든 파일 이동
        files.forEach(file => {
          const srcPath = path.join(inputDir, file);
          const destPath = path.join(dateDirPath, file);
          moveFile(srcPath, destPath);
        });
        
        console.log(`  ✅ input 파일 ${files.length}개 → input/${dateStr}/`);
      }
    }
  }
  
  // output 폴더
  const outputDir = path.join(studentDir, 'output');
  if (fs.existsSync(outputDir)) {
    const files = fs.readdirSync(outputDir).filter(f => 
      f.endsWith('.md') || f.endsWith('.html') || f.endsWith('.pdf')
    );
    
    if (files.length > 0) {
      // input에서 날짜 가져오기
      const inputFiles = fs.readdirSync(inputDir);
      const dateFolders = inputFiles.filter(f => /^\d{6}$/.test(f));
      
      if (dateFolders.length > 0) {
        const dateStr = dateFolders[0]; // 첫 번째 날짜 폴더 사용
        const dateDirPath = path.join(outputDir, dateStr);
        ensureDir(dateDirPath);
        
        // 모든 파일 이동
        files.forEach(file => {
          const srcPath = path.join(outputDir, file);
          const destPath = path.join(dateDirPath, file);
          moveFile(srcPath, destPath);
        });
        
        console.log(`  ✅ output 파일 ${files.length}개 → output/${dateStr}/`);
      }
    }
  }
}

// 모든 활성 학생 폴더 생성
function createAllStudentFolders() {
  console.log('\n📁 활성 학생 폴더 생성 중...\n');
  
  ACTIVE_STUDENTS.forEach(student => {
    const studentDir = path.join(BASE_DIR, student);
    const inputDir = path.join(studentDir, 'input');
    const outputDir = path.join(studentDir, 'output');
    
    ensureDir(inputDir);
    ensureDir(outputDir);
  });
  
  console.log(`\n✅ 총 ${ACTIVE_STUDENTS.length}명 학생 폴더 생성 완료!`);
}

// 메인 함수
function main() {
  console.log('🚀 학생 폴더 재구성 시작...\n');
  
  // 1. 기존 학생 재구성
  console.log('=== 1단계: 기존 학생 날짜별 폴더 이동 ===');
  reorganizeExistingStudent('김종호');
  reorganizeExistingStudent('조근영');
  
  // 2. 모든 활성 학생 폴더 생성
  console.log('\n=== 2단계: 활성 학생 폴더 생성 ===');
  createAllStudentFolders();
  
  console.log('\n✅ 모든 작업 완료!\n');
}

// 실행
if (require.main === module) {
  main();
}
