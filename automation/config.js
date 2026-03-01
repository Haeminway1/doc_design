'use strict';

const path = require('path');

module.exports = {
  // ⚠️ SAFETY: 절대 true로 바꾸지 마세요! 해민님 검토 후 활성화
  ACTIVE: false,

  // 프로젝트 루트
  PROJECT_ROOT: path.resolve(__dirname, '..'),

  // Google Drive
  DRIVE_ROOT_FOLDER_ID: '1MZc8wroL7Rqyf4PabfjLO1uaV62K1swN',

  // 카카오톡 채널
  KAKAO_CHANNEL_URL: 'https://business.kakao.com/_xjYlxan/chats',
  KAKAO_CDP_PORT: 18800,

  // 학생 드라이브 폴더 매핑
  STUDENT_DRIVE_FOLDERS: {
    '김준현': '13vCvRNHhmpsSp3P7GgXyGZh00IQ8Q1Yi',
    '이민희': '13U1yUp6soAiyZ4ldNRXzTu_FJYHEY9hW',
    '김수언': '1PhyqGuMOFgNBarIG48YpsGh31leIR7r0',
    '진소윤': '1pRfTANnKeowWo5-jrAv3uWwDzo1rfYmL',
    '정성엽': '1CwAJ0QWIN9AU0Bczrq43e1Quh15WVK6n',
    '박수빈': '1pmDAQyzzsMfrz5TXwRj9YnLvj9EXIfGY',
    '김예은': '1eQla9xd_OB6gWPu_uv3JSEgy6x73QJSw',
    '정재영': '1MV29rJhKyn494H_-bap9oozaodxvQYFI',
    '김지환': '1nJR29BaHAfVr9DC8coi5OOoDVYK2YfSs',
    '박은지': '1uLabzEfN9gREJuwNnZ_3gfjZRB_q5AUx',
    '박민교': '1ZK7Tpr7blutTy5iVfSjdOI4DF6vzmn3e',
    '임서휘': '1LyO2wiS-oOjodHZbArKzSdNYJi3xeRCd',
    '박지율': '1_oAU41uyo5mZ2WE22DvjcEaE49s090Lu',
    '조근영': '1TQH_81KR8716EJBxx1YBurRzKtttrMnu',
    '김종호': '1kvQDuAHHe2L2mLM_Q_7wUHDkiLz868-u',
    '이하린': '1uQOR6jBs2Hpq3b8BzZWK7JKfJGX7C-NZ',
    '윤석우': '1pfVx5NnHBzXvA6cfZ0Oya-bvcbFNeYx4',
    '최여진': '1xgl2tnWlBpS8uQ9x2W0yVe5gsf5-Bopi',
    '김태연': '1o2wDep6ThTLAZ-5bsMSaz0ka9s88c47n',
  },

  // 피드백자료 서브폴더명 (띄어쓰기 변형 처리)
  FEEDBACK_SUBFOLDER_NAMES: ['피드백자료', '피드백 자료'],

  // 폴링 간격 (실제 가동 시 참고용, 현재 비활성)
  POLLING_INTERVAL_MS: 15 * 60 * 1000,

  // Vision AI
  EXTRACTION_CONFIDENCE_THRESHOLD: 0.7,
  USE_ENSEMBLE: true,

  // 파일 경로
  TUTORING_DIR: path.resolve(__dirname, '..', '00_tutoring'),
  TEMPLATE_LIBRARY: path.resolve(__dirname, '..', 'template-library'),
  SCRIPTS_DIR: path.resolve(__dirname, '..', '04_scripts'),
  STATE_DIR: path.resolve(__dirname, 'state'),

  // PDF 생성
  CHROME_CDP_PORT: 47304,
};
