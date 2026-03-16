/**
 * 시험 유형 레지스트리
 *
 * 다양한 시험 유형을 등록하고 관리하는 모듈.
 * 레벨테스트 외에 모의고사, 중간/기말고사, 편입 기출 등 추가 가능.
 *
 * Google Apps Script 호환 (ES5)
 */

// ═══════════════════════════════════════
// 시험 데이터 레지스트리
// ═══════════════════════════════════════

var EXAM_REGISTRY = {

    // ── 레벨테스트 ──
    "레벨테스트": {
        displayName: "레벨테스트",
        totalQuestions: 40,
        pointsPerQuestion: 2.5,
        totalPoints: 100,
        officialAnswers: {
            "1": "D", "2": "D", "3": "D", "4": "A", "5": "B",
            "6": "C", "7": "C", "8": "A", "9": "B", "10": "C",
            "11": "C", "12": "B", "13": "C", "14": "D", "15": "D",
            "16": "A", "17": "B", "18": "A", "19": "C", "20": "A",
            "21": "C", "22": "B", "23": "C", "24": "B", "25": "C",
            "26": "D", "27": "C", "28": "C", "29": "C", "30": "B",
            "31": "C", "32": "A", "33": "B", "34": "C", "35": "B",
            "36": "C", "37": "C", "38": "C", "39": "A", "40": "A"
        },
        questionTypes: {
            "어법": { start: 1, end: 10, total: 10 },
            "어휘": { start: 11, end: 20, total: 10 },
            "장문독해": { start: 21, end: 40, total: 20 }
        }
    },

    // ── 레벨테스트2 ──
    "레벨테스트2": {
        displayName: "2025 편입학 대비 영어 레벨테스트 2",
        totalQuestions: 40,
        pointsPerQuestion: 2.5,
        totalPoints: 100,
        officialAnswers: {
            "1": "D", "2": "D", "3": "D", "4": "A", "5": "B",
            "6": "C", "7": "C", "8": "A", "9": "B", "10": "C",
            "11": "C", "12": "B", "13": "C", "14": "D", "15": "D",
            "16": "A", "17": "B", "18": "A", "19": "C", "20": "A",
            "21": "C", "22": "B", "23": "C", "24": "B", "25": "C",
            "26": "D", "27": "C", "28": "C", "29": "C", "30": "B",
            "31": "C", "32": "A", "33": "B", "34": "C", "35": "B",
            "36": "C", "37": "C", "38": "C", "39": "A", "40": "A"
        },
        questionTypes: {
            "어법": { start: 1, end: 10, total: 10 },
            "어휘": { start: 11, end: 20, total: 10 },
            "장문독해": { start: 21, end: 40, total: 20 }
        }
    },

    // ── 수능형 모의고사: 2025 3월 고1 ──
    "2025-3월-고1": {
        displayName: "2025학년도 3월 고1 전국연합학력평가",
        examType: "수능형",
        totalQuestions: 45,
        totalPoints: 100,
        defaultPoints: 2,
        pointsMap: {
            "6": 3, "14": 3, "15": 3,
            "21": 3, "30": 3,
            "33": 3, "34": 3, "36": 3, "37": 3,
            "42": 3
        },
        officialAnswers: {
            "1": "4", "2": "5", "3": "2", "4": "3", "5": "5",
            "6": "3", "7": "2", "8": "4", "9": "3", "10": "2",
            "11": "2", "12": "4", "13": "1", "14": "4", "15": "4",
            "16": "5", "17": "3",
            "18": "3", "19": "3", "20": "2", "21": "1", "22": "1",
            "23": "5", "24": "1", "25": "4", "26": "4", "27": "2",
            "28": "2", "29": "4", "30": "5", "31": "1", "32": "3",
            "33": "4", "34": "1", "35": "2", "36": "5", "37": "5",
            "38": "3", "39": "5", "40": "1", "41": "1", "42": "2",
            "43": "4", "44": "3", "45": "2"
        },
        questionTypes: {
            "듣기": {
                questions: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17],
                total: 17
            },
            "기본독해": {
                questions: [18,19,20,22,23,24,25,26,27,28,29,30,35,40,41,42,43,44,45],
                total: 19
            },
            "고난도독해": {
                questions: [21,31,32,33,34,36,37,38,39],
                total: 9
            }
        },
        questionMeta: {
            "1": { subType: "목적파악" }, "2": { subType: "의견파악" },
            "3": { subType: "요지파악" }, "4": { subType: "그림불일치" },
            "5": { subType: "할일파악" }, "6": { subType: "금액계산" },
            "7": { subType: "이유파악" }, "8": { subType: "언급안된것" },
            "9": { subType: "내용일치" }, "10": { subType: "도표파악" },
            "11": { subType: "적절한응답" }, "12": { subType: "적절한응답" },
            "13": { subType: "적절한응답" }, "14": { subType: "적절한응답" },
            "15": { subType: "상황에적절한말" },
            "16": { subType: "주제파악(세트)" }, "17": { subType: "언급안된것(세트)" },
            "18": { subType: "글의목적" }, "19": { subType: "심경변화" },
            "20": { subType: "주장" }, "22": { subType: "요지" },
            "23": { subType: "주제" }, "24": { subType: "제목" },
            "25": { subType: "도표" }, "26": { subType: "내용불일치(인물)" },
            "27": { subType: "안내문불일치" }, "28": { subType: "안내문일치" },
            "29": { subType: "어법" }, "30": { subType: "어휘" },
            "35": { subType: "무관한문장" }, "40": { subType: "요약문" },
            "41": { subType: "제목(장문)" }, "42": { subType: "어휘(밑줄)" },
            "43": { subType: "순서배열(장문)" }, "44": { subType: "지칭추론(장문)" },
            "45": { subType: "내용일치(장문)" },
            "21": { subType: "함축의미(밑줄)" },
            "31": { subType: "빈칸추론" }, "32": { subType: "빈칸추론" },
            "33": { subType: "빈칸추론" }, "34": { subType: "빈칸추론" },
            "36": { subType: "순서배열" }, "37": { subType: "순서배열" },
            "38": { subType: "문장삽입" }, "39": { subType: "문장삽입" }
        }
    },

    // ── 수능형 모의고사: 2026 3월 고1 ──
    "2026-3월-고1": {
        displayName: "2026학년도 3월 고1 전국연합학력평가",
        examType: "수능형",
        totalQuestions: 45,
        totalPoints: 100,
        defaultPoints: 2,
        pointsMap: {
            "6": 3, "14": 3, "15": 3,
            "21": 3, "30": 3,
            "33": 3, "34": 3, "36": 3, "37": 3,
            "42": 3
        },
        officialAnswers: {
            "1": "4", "2": "5", "3": "2", "4": "3", "5": "5",
            "6": "3", "7": "2", "8": "4", "9": "3", "10": "2",
            "11": "2", "12": "4", "13": "1", "14": "4", "15": "4",
            "16": "5", "17": "3",
            "18": "3", "19": "3", "20": "2", "21": "1", "22": "1",
            "23": "5", "24": "1", "25": "4", "26": "4", "27": "2",
            "28": "2", "29": "4", "30": "5", "31": "1", "32": "3",
            "33": "4", "34": "1", "35": "2", "36": "5", "37": "5",
            "38": "3", "39": "5", "40": "1", "41": "1", "42": "2",
            "43": "4", "44": "3", "45": "2"
        },
        questionTypes: {
            "듣기": {
                questions: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17],
                total: 17
            },
            "기본독해": {
                questions: [18,19,20,22,23,24,25,26,27,28,29,30,35,40,41,42,43,44,45],
                total: 19
            },
            "고난도독해": {
                questions: [21,31,32,33,34,36,37,38,39],
                total: 9
            }
        },
        questionMeta: {
            "1": { subType: "목적파악" }, "2": { subType: "의견파악" },
            "3": { subType: "요지파악" }, "4": { subType: "그림불일치" },
            "5": { subType: "할일파악" }, "6": { subType: "금액계산" },
            "7": { subType: "이유파악" }, "8": { subType: "언급안된것" },
            "9": { subType: "내용일치" }, "10": { subType: "도표파악" },
            "11": { subType: "적절한응답" }, "12": { subType: "적절한응답" },
            "13": { subType: "적절한응답" }, "14": { subType: "적절한응답" },
            "15": { subType: "상황에적절한말" },
            "16": { subType: "주제파악(세트)" }, "17": { subType: "언급안된것(세트)" },
            "18": { subType: "글의목적" }, "19": { subType: "심경변화" },
            "20": { subType: "주장" }, "22": { subType: "요지" },
            "23": { subType: "주제" }, "24": { subType: "제목" },
            "25": { subType: "도표" }, "26": { subType: "내용불일치(인물)" },
            "27": { subType: "안내문불일치" }, "28": { subType: "안내문일치" },
            "29": { subType: "어법" }, "30": { subType: "어휘" },
            "35": { subType: "무관한문장" }, "40": { subType: "요약문" },
            "41": { subType: "제목(장문)" }, "42": { subType: "어휘(밑줄)" },
            "43": { subType: "순서배열(장문)" }, "44": { subType: "지칭추론(장문)" },
            "45": { subType: "내용일치(장문)" },
            "21": { subType: "함축의미(밑줄)" },
            "31": { subType: "빈칸추론" }, "32": { subType: "빈칸추론" },
            "33": { subType: "빈칸추론" }, "34": { subType: "빈칸추론" },
            "36": { subType: "순서배열" }, "37": { subType: "순서배열" },
            "38": { subType: "문장삽입" }, "39": { subType: "문장삽입" }
        }
    }
};


// ═══════════════════════════════════════
// 레지스트리 API
// ═══════════════════════════════════════

/**
 * 시험 데이터 조회
 * @param {string} examName - 시험 이름 (정확 매칭 → 부분 매칭 → null)
 * @returns {Object|null} 시험 데이터
 */
function findExam(examName) {
    if (!examName) return null;

    // 정확 매칭
    if (EXAM_REGISTRY[examName]) {
        return EXAM_REGISTRY[examName];
    }

    // 부분 매칭
    for (var key in EXAM_REGISTRY) {
        if (key.indexOf(examName) !== -1 || examName.indexOf(key) !== -1) {
            return EXAM_REGISTRY[key];
        }
    }

    return null;
}

/**
 * 등록된 모든 시험 이름 반환
 * @returns {string[]}
 */
function listExams() {
    var names = [];
    for (var key in EXAM_REGISTRY) {
        names.push(key);
    }
    return names;
}

/**
 * 새 시험 동적 등록
 * @param {string} name - 시험 이름
 * @param {Object} examData - 시험 데이터
 */
function registerExam(name, examData) {
    EXAM_REGISTRY[name] = examData;
}

/**
 * 사용자 입력 정답 텍스트로 커스텀 시험 생성
 *
 * 정답 텍스트 + 영역 구분 정보 → 시험 데이터 객체 반환
 * 레벨테스트 외의 시험에 사용
 *
 * @param {string} examName - 시험 이름
 * @param {Object} answers - 정답 { "1": "A", "2": "B", ... }
 * @param {Object} sections - 영역 정보 (선택)
 *   예: { "어법": { start: 1, end: 15 }, "어휘": { start: 16, end: 30 } }
 * @param {number} pointsPerQuestion - 문항당 배점 (기본: 자동 계산)
 * @returns {Object} 시험 데이터
 */
function createCustomExam(examName, answers, sections, pointsPerQuestion) {
    var totalQ = Object.keys(answers).length;
    var ptsPerQ = pointsPerQuestion || (100 / totalQ);

    var questionTypes = {};
    if (sections) {
        for (var sName in sections) {
            var sec = sections[sName];
            questionTypes[sName] = {
                start: sec.start,
                end: sec.end,
                total: sec.end - sec.start + 1
            };
        }
    } else {
        // 영역 정보 없으면 전체를 하나의 영역으로
        questionTypes["전체"] = {
            start: 1,
            end: totalQ,
            total: totalQ
        };
    }

    var examData = {
        displayName: examName,
        totalQuestions: totalQ,
        pointsPerQuestion: ptsPerQ,
        totalPoints: totalQ * ptsPerQ,
        officialAnswers: answers,
        questionTypes: questionTypes
    };

    // 레지스트리에 자동 등록
    EXAM_REGISTRY[examName] = examData;

    return examData;
}

/**
 * 문항 번호의 유형 반환
 * @param {number} qNum - 문항 번호
 * @param {Object} questionTypes - 문항 유형 맵
 * @returns {string} 유형명
 */
function getQuestionTypeByNumber(qNum, questionTypes) {
    if (!questionTypes) return '기타';
    for (var typeName in questionTypes) {
        var info = questionTypes[typeName];
        // 비연속 범위 (questions 배열) 지원
        if (info.questions) {
            if (info.questions.indexOf(qNum) !== -1) {
                return typeName;
            }
        }
        // 기존 연속 범위 (start/end) 호환
        else if (info.start <= qNum && qNum <= info.end) {
            return typeName;
        }
    }
    return '기타';
}

/**
 * 채점용 프롬프트 컨텍스트 생성
 *
 * AI에게 전달할 시험 정보 텍스트 생성
 * @param {Object} examData - 시험 데이터
 * @returns {string} 문항 유형 구성 텍스트
 */
function buildExamContext(examData) {
    if (!examData || !examData.questionTypes) return '(문항 유형 정보 없음)';

    var lines = [];
    lines.push('시험명: ' + examData.displayName);
    lines.push('총 문항 수: ' + examData.totalQuestions);

    // 수능형: 문항별 배점이 다름
    if (examData.defaultPoints && examData.pointsMap) {
        var threePointQs = [];
        for (var q in examData.pointsMap) {
            if (examData.pointsMap[q] === 3) threePointQs.push(q);
        }
        lines.push('기본 배점: ' + examData.defaultPoints + '점');
        lines.push('3점 문항: ' + threePointQs.join(', ') + '번 (' + threePointQs.length + '문항)');
    } else if (examData.pointsPerQuestion) {
        lines.push('문항당 배점: ' + examData.pointsPerQuestion + '점');
    }

    lines.push('총점: ' + examData.totalPoints + '점');
    lines.push('');
    lines.push('문항 유형 구성:');
    for (var typeName in examData.questionTypes) {
        var info = examData.questionTypes[typeName];
        // 비연속 범위
        if (info.questions) {
            lines.push('  - ' + typeName + ': ' + info.questions.join(',') + '번 (' + info.total + '문항)');
        }
        // 연속 범위
        else {
            lines.push('  - ' + typeName + ': ' + info.start + '~' + info.end + '번 (' + info.total + '문항)');
        }
    }
    return lines.join('\n');
}

/**
 * 문항 배점 조회
 * @param {number|string} qNum - 문항 번호
 * @param {Object} examData - 시험 데이터
 * @returns {number} 배점
 */
function getQuestionPoints(qNum, examData) {
    var key = String(qNum);
    if (examData.pointsMap && examData.pointsMap[key]) {
        return examData.pointsMap[key];
    }
    return examData.defaultPoints || examData.pointsPerQuestion || 0;
}

/**
 * 문항 세부유형 조회
 * @param {number|string} qNum - 문항 번호
 * @param {Object} examData - 시험 데이터
 * @returns {string} 세부유형명
 */
function getQuestionSubType(qNum, examData) {
    var key = String(qNum);
    if (examData.questionMeta && examData.questionMeta[key]) {
        return examData.questionMeta[key].subType || '';
    }
    return '';
}
