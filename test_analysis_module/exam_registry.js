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
    }

    // ── 새 시험 추가 예시 ──
    // "2026 모의고사 1회": {
    //     displayName: "2026 모의고사 1회",
    //     totalQuestions: 50,
    //     pointsPerQuestion: 2,
    //     totalPoints: 100,
    //     officialAnswers: { "1": "A", "2": "C", ... },
    //     questionTypes: {
    //         "어법": { start: 1, end: 15, total: 15 },
    //         "어휘": { start: 16, end: 30, total: 15 },
    //         "독해": { start: 31, end: 50, total: 20 }
    //     }
    // }
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
        if (info.start <= qNum && qNum <= info.end) {
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
    lines.push('문항당 배점: ' + examData.pointsPerQuestion + '점');
    lines.push('');
    lines.push('문항 유형 구성:');
    for (var typeName in examData.questionTypes) {
        var info = examData.questionTypes[typeName];
        lines.push('  - ' + typeName + ': ' + info.start + '~' + info.end + '번 (' + info.total + '문항)');
    }
    return lines.join('\n');
}
