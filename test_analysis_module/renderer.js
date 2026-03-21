/**
 * 시험 분석 렌더러
 *
 * 고정 HTML 템플릿 + 채점 데이터 + AI JSON → 최종 HTML 생성
 * Google Apps Script 호환 (ES5, DOM 미사용)
 *
 * 핵심 원리:
 * - 채점(scoring)은 시스템이 수행 → scoringData
 * - 분석/해설/솔루션은 AI가 생성 → aiContent (schema.json 구조)
 * - 렌더러가 둘을 합쳐서 고정 템플릿에 주입
 */

/**
 * 시험 분석 HTML 생성
 * @param {Object} scoringData - 시스템이 생성한 채점 데이터
 * @param {Object} aiContent - AI가 생성한 분석 콘텐츠 (schema.json 구조)
 * @returns {string} 렌더링된 HTML 문자열
 */
function renderAnalysis(scoringData, aiContent) {
    var html = getAnalysisTemplateHtml();

    var totalQuestions = scoringData.totalQuestions || 0;
    var correctCount = scoringData.correctCount || 0;
    var correctRate = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
    var totalScore = scoringData.totalScore || (correctCount * (scoringData.pointsPerQuestion || 2.5));
    var totalPossible = scoringData.totalPossible || 100;

    // 페이지 수 계산
    var sectionCount = aiContent.sectionAnalyses ? aiContent.sectionAnalyses.length : 0;
    var ROWS_PER_TABLE_PAGE = 20;
    var oxTablePageCount = Math.ceil(totalQuestions / ROWS_PER_TABLE_PAGE);
    // 총평(1) + OX그리드(1) + OX테이블(N) + 영역별(M) + 솔루션(1)
    var totalPages = 1 + 1 + oxTablePageCount + sectionCount + 1;

    var analysisDate = new Date().toISOString().slice(0, 10);

    // 1) 단순 변수 치환
    html = replaceAll(html, '{{studentName}}', escapeHtml(aiContent.studentName));
    html = replaceAll(html, '{{examName}}', escapeHtml(aiContent.examName));
    html = replaceAll(html, '{{analysisDate}}', analysisDate);
    html = replaceAll(html, '{{totalScore}}', String(totalScore));
    html = replaceAll(html, '{{totalPossible}}', String(totalPossible));
    html = replaceAll(html, '{{correctRate}}', String(correctRate));
    html = replaceAll(html, '{{correctCount}}', String(correctCount));
    html = replaceAll(html, '{{totalQuestions}}', String(totalQuestions));
    html = replaceAll(html, '{{totalPages}}', String(totalPages));
    html = replaceAll(html, '{{overallComment}}', aiContent.overallComment);
    html = replaceAll(html, '{{solutionOverview}}', aiContent.solutionOverview || aiContent.overallComment);
    // 콘텐츠 순서 기반 번호: 01 종합, 02 채점, 03~N 영역별, N+1 솔루션
    html = replaceAll(html, '{{solutionSectionNum}}', padNum(2 + sectionCount + 1));
    html = replaceAll(html, '{{encouragement}}', aiContent.encouragement);

    // 2) 영역별 성취도 도넛 차트
    html = renderDonutCharts(html, scoringData.sectionStats);

    // 3) OX 그리드
    html = renderOxGrid(html, scoringData.results);

    // 4) OX 테이블 (페이지 분할)
    html = renderOxTablePages(html, scoringData.results, totalPages, ROWS_PER_TABLE_PAGE);

    // 5) 영역별 분석 페이지 (OX 테이블 페이지 수를 오프셋으로 전달)
    html = renderSectionPages(html, aiContent.sectionAnalyses, scoringData.sectionStats, sectionCount, oxTablePageCount, totalPages);

    // 6) 솔루션
    html = renderSolutions(html, aiContent.solutions);

    return html;
}


// ═══════════════════════════════════════
// 채점 데이터 생성 (시스템 레벨)
// ═══════════════════════════════════════

/**
 * 학생 답안과 정답을 비교하여 채점 데이터 생성
 * @param {Object} studentAnswers - 학생 답안 { 문항번호: "A"|"B"|"C"|"D" }
 * @param {Object} officialAnswers - 정답 { 문항번호: "A"|"B"|"C"|"D" }
 * @param {Object} questionTypes - 문항 유형 정보 (exam_registry 제공)
 * @param {number} pointsPerQuestion - 문항당 배점 (기본: 2.5)
 * @returns {Object} scoringData
 */
function generateScoringData(studentAnswers, officialAnswers, questionTypes, pointsPerQuestionOrExamData) {
    // 수능형 변동 배점 지원: examData 객체가 넘어오면 pointsMap 사용
    var examData = null;
    var defaultPoints = 2.5;
    if (pointsPerQuestionOrExamData && typeof pointsPerQuestionOrExamData === 'object') {
        examData = pointsPerQuestionOrExamData;
        defaultPoints = examData.defaultPoints || examData.pointsPerQuestion || 2.5;
    } else {
        defaultPoints = pointsPerQuestionOrExamData || 2.5;
    }

    var results = []; // { number, type, correct, student, mark }
    var correctCount = 0;
    var totalQuestions = 0;
    var totalScore = 0;
    var totalPossible = 0;
    var sectionStats = {}; // { sectionName: { correct, total, percentage } }

    // 문항 유형별 초기화
    if (questionTypes) {
        for (var typeName in questionTypes) {
            sectionStats[typeName] = { name: typeName, correct: 0, total: 0, percentage: 0 };
        }
    }

    // 전체 문항 수 결정
    var maxQ = 0;
    for (var k in officialAnswers) {
        var num = parseInt(k, 10);
        if (num > maxQ) maxQ = num;
    }
    for (var k2 in studentAnswers) {
        var num2 = parseInt(k2, 10);
        if (num2 > maxQ) maxQ = num2;
    }

    // 채점
    for (var q = 1; q <= maxQ; q++) {
        var official = officialAnswers[q] || officialAnswers[String(q)] || null;
        var student = studentAnswers[q] || studentAnswers[String(q)] || null;
        var qType = getQuestionTypeFromRegistry(q, questionTypes);
        var pts = (examData && examData.pointsMap && examData.pointsMap[String(q)])
            ? examData.pointsMap[String(q)] : defaultPoints;
        var mark;

        if (official === null) {
            mark = '-';
        } else {
            totalQuestions++;
            totalPossible += pts;
            if (sectionStats[qType]) sectionStats[qType].total++;

            if (student === null) {
                mark = 'X';
            } else if (student === official) {
                mark = 'O';
                correctCount++;
                totalScore += pts;
                if (sectionStats[qType]) sectionStats[qType].correct++;
            } else {
                mark = 'X';
            }
        }

        results.push({
            number: q,
            type: qType,
            correct: official || '-',
            student: student || '-',
            mark: mark
        });
    }

    // 영역별 퍼센트 계산
    for (var sName in sectionStats) {
        var s = sectionStats[sName];
        s.percentage = s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0;
        s.level = s.percentage >= 80 ? 'high' : (s.percentage >= 50 ? 'mid' : 'low');
    }

    return {
        results: results,
        correctCount: correctCount,
        totalQuestions: totalQuestions,
        totalScore: totalScore,
        totalPossible: totalPossible,
        pointsPerQuestion: defaultPoints,
        sectionStats: sectionStats
    };
}


// ═══════════════════════════════════════
// 렌더링 헬퍼 함수
// ═══════════════════════════════════════

/**
 * SVG 도넛 차트로 영역별 성취도 렌더링
 */
function renderDonutCharts(html, sectionStats) {
    var items = [];
    for (var name in sectionStats) {
        items.push(sectionStats[name]);
    }

    var chartsHtml = '';
    var RADIUS = 62;
    var CIRCUMFERENCE = 2 * Math.PI * RADIUS; // ~389.56
    var SVG_SIZE = 170;
    var SVG_VIEWBOX = 170;
    var CENTER = 85;

    for (var i = 0; i < items.length; i++) {
        var s = items[i];
        var pct = s.percentage || 0;
        var fillLen = CIRCUMFERENCE * (pct / 100);

        // 4단계 색상: 30/55/80 기준, 같은 계열 여러 색 블렌딩
        var colorStart, colorMid, colorEnd;
        if (pct >= 80) {
            colorStart = '#047857';   // emerald
            colorMid = '#10b981';     // green
            colorEnd = '#0d9488';     // teal
        } else if (pct >= 55) {
            colorStart = '#b45309';   // amber-brown
            colorMid = '#d97706';     // amber
            colorEnd = '#ca8a04';     // yellow-gold
        } else if (pct >= 30) {
            colorStart = '#c2410c';   // burnt orange
            colorMid = '#ea580c';     // orange
            colorEnd = '#d97706';     // amber
        } else {
            colorStart = '#9f1239';   // rose
            colorMid = '#dc2626';     // red
            colorEnd = '#c2410c';     // red-orange
        }

        // SVG gradient ID unique per chart
        var gradId = 'donut-grad-' + i;

        chartsHtml += '<div class="donut-item">\n' +
            '    <span class="donut-badge">' + (i + 1) + '</span>\n' +
            '    <svg width="' + SVG_SIZE + '" height="' + SVG_SIZE + '" viewBox="0 0 ' + SVG_VIEWBOX + ' ' + SVG_VIEWBOX + '">\n' +
            '        <defs>\n' +
            '            <linearGradient id="' + gradId + '" x1="0%" y1="0%" x2="100%" y2="100%">\n' +
            '                <stop offset="0%" stop-color="' + colorStart + '"/>\n' +
            '                <stop offset="50%" stop-color="' + colorMid + '"/>\n' +
            '                <stop offset="100%" stop-color="' + colorEnd + '"/>\n' +
            '            </linearGradient>\n' +
            '        </defs>\n' +
            '        <circle cx="' + CENTER + '" cy="' + CENTER + '" r="' + RADIUS + '" fill="none" stroke="#e8e6e1" stroke-width="22"/>\n' +
            '        <circle cx="' + CENTER + '" cy="' + CENTER + '" r="' + RADIUS + '" fill="none" stroke="url(#' + gradId + ')" stroke-width="22"\n' +
            '                stroke-dasharray="' + fillLen.toFixed(1) + ' ' + CIRCUMFERENCE.toFixed(1) + '"\n' +
            '                stroke-linecap="round" transform="rotate(-90 ' + CENTER + ' ' + CENTER + ')"/>\n' +
            '        <text x="' + CENTER + '" y="' + (CENTER - 6) + '" text-anchor="middle" font-family="Playfair Display,serif" font-size="34" font-weight="800" fill="#1a1a2e">' + pct + '%</text>\n' +
            '        <text x="' + CENTER + '" y="' + (CENTER + 16) + '" text-anchor="middle" font-family="DM Mono,monospace" font-size="14" fill="#7a7a8a">' + s.correct + '/' + s.total + '</text>\n' +
            '    </svg>\n' +
            '    <span class="donut-name">' + escapeHtml(s.name) + '</span>\n' +
            '</div>\n';
    }

    html = html.replace(
        /<!-- DONUT_CHARTS: renderer\.js가 생성 -->/,
        chartsHtml
    );

    return html;
}

function renderOxGrid(html, results) {
    return renderRepeatBlock(html, 'oxResults', results, function (item) {
        var resultClass = item.mark === 'O' ? 'is-correct' : (item.mark === 'X' ? 'is-incorrect' : '');
        return '<div class="ox-cell ' + resultClass + '">\n' +
            '                    <span class="ox-q">' + item.number + '</span>\n' +
            '                    <span>' + item.mark + '</span>\n' +
            '                </div>';
    });
}

/**
 * OX 상세 테이블을 페이지 단위로 분할 렌더링
 * 각 페이지는 자체 .page 래퍼 + 헤더 + 푸터를 가짐
 */
function renderOxTablePages(html, results, totalPages, rowsPerPage) {
    rowsPerPage = rowsPerPage || 25;

    var theadHtml = '<thead><tr>' +
        '<th style="width:8%">번호</th>' +
        '<th style="width:12%">유형</th>' +
        '<th style="width:10%">정답</th>' +
        '<th style="width:10%">제출</th>' +
        '<th style="width:10%">결과</th>' +
        '</tr></thead>\n';

    // 결과를 페이지별 청크로 분할
    var chunks = [];
    for (var i = 0; i < results.length; i += rowsPerPage) {
        chunks.push(results.slice(i, i + rowsPerPage));
    }

    var pagesHtml = '';
    for (var c = 0; c < chunks.length; c++) {
        var chunk = chunks[c];
        var pageNum = 3 + c; // OX 테이블은 3페이지부터
        var pageTitle = '문항별 상세 채점표';

        var rowsHtml = '';
        for (var r = 0; r < chunk.length; r++) {
            var item = chunk[r];
            var studentClass = item.mark === 'X' ? 'student-wrong' : '';
            var resultClass = item.mark === 'O' ? 'correct' : (item.mark === 'X' ? 'incorrect' : 'no-answer');
            rowsHtml += '<tr>' +
                '<td class="q-num">' + item.number + '</td>' +
                '<td class="q-type">' + escapeHtml(item.type) + '</td>' +
                '<td>' + item.correct + '</td>' +
                '<td class="' + studentClass + '">' + item.student + '</td>' +
                '<td class="' + resultClass + '">' + item.mark + '</td>' +
                '</tr>\n';
        }

        pagesHtml += '    <div class="page">\n' +
            '        <div class="page-accent"></div>\n' +
            '        <div class="page-body">\n' +
            '            <div class="page-header"><h1>' + pageTitle + '</h1></div>\n' +
            '            <table class="ox-table">\n' +
            '                ' + theadHtml +
            '                <tbody>\n' + rowsHtml + '                </tbody>\n' +
            '            </table>\n' +
            '        </div>\n' +
            '        <div class="page-footer">\n' +
            '            <span class="brand">Vera Jin Academy</span>\n' +
            '            <span>Page ' + pageNum + ' / ' + totalPages + '</span>\n' +
            '        </div>\n' +
            '    </div>\n\n';
    }

    html = html.replace(
        /<!-- OX_TABLE_PAGES: renderer\.js가 문항별 상세 테이블 페이지를 생성 -->/,
        pagesHtml
    );

    return html;
}

function renderSectionPages(html, sectionAnalyses, sectionStats, sectionCount, oxTablePageCount, totalPages) {
    if (!sectionAnalyses || sectionAnalyses.length === 0) return html;

    oxTablePageCount = oxTablePageCount || 0;
    // 콘텐츠 순서 기반: 01 종합 + 02 채점 = 2, 영역분석은 03부터
    var contentOffset = 2;
    // 페이지 번호 계산용 (푸터)
    var pageOffset = 2 + oxTablePageCount;

    var pages = [];
    for (var i = 0; i < sectionAnalyses.length; i++) {
        var sa = sectionAnalyses[i];
        var stats = sectionStats[sa.sectionName] || { correct: 0, total: 0, percentage: 0 };

        var wrongHtml = '';
        if (sa.wrongItems) {
            for (var w = 0; w < sa.wrongItems.length; w++) {
                var wi = sa.wrongItems[w];
                if (wi.grouped) {
                    // 유형별 그룹 표시
                    wrongHtml += '<div class="wrong-item">\n' +
                        '                <span class="q-badge">' + escapeHtml(wi.label) + '</span>\n' +
                        '                <div class="q-explanation">\n' +
                        '                    ' + escapeHtml(wi.explanation) + '\n' +
                        '                </div>\n' +
                        '            </div>\n';
                } else {
                    // 개별 문항 표시 (기존 호환)
                    wrongHtml += '<div class="wrong-item">\n' +
                        '                <span class="q-badge">Q' + wi.number + '</span>\n' +
                        '                <div class="q-explanation">\n' +
                        '                    <strong>정답: ' + escapeHtml(wi.correct) + ' / 제출: ' + escapeHtml(wi.student) + '</strong><br>\n' +
                        '                    ' + escapeHtml(wi.explanation) + '\n' +
                        '                </div>\n' +
                        '            </div>\n';
                }
            }
            if (false) { // 그룹 모드에서는 잔여 표시 불필요
            }
        }

        // 정답 노트
        var correctNote = '';
        if (stats.correct > 0) {
            correctNote = '<div class="correct-note">' +
                escapeHtml(sa.sectionName) + ' 영역에서 ' + stats.correct + '문항 정답 처리되었습니다.' +
                '</div>\n';
        }

        // 학습 포인트
        var studyPointsHtml = '';
        if (sa.studyPoints) {
            for (var sp = 0; sp < sa.studyPoints.length; sp++) {
                studyPointsHtml += '                    <li>' + escapeHtml(sa.studyPoints[sp]) + '</li>\n';
            }
        }

        pages.push({
            title: sa.sectionName,
            sectionNum: padNum(contentOffset + 1 + i),
            correct: stats.correct,
            total: stats.total,
            percentage: stats.percentage,
            overview: sa.overview,
            wrongHtml: wrongHtml,
            correctNote: correctNote,
            studyPointsHtml: studyPointsHtml,
            pageNum: pageOffset + 1 + i,
            totalPages: totalPages
        });
    }

    return renderRepeatBlock(html, 'sectionPages', pages, function (page) {
        return '<div class="page">\n' +
            '        <div class="page-accent"></div>\n' +
            '        <div class="page-body">\n' +
            '            <div class="page-header"><h1>' + escapeHtml(page.title) + ' 영역 분석</h1></div>\n' +
            '            <div class="section-header first">\n' +
            '                <span class="section-num">' + page.sectionNum + '</span>\n' +
            '                <span class="section-divider"></span>\n' +
            '                <span class="section-title">' + escapeHtml(page.title) + ' 분석 (' + page.correct + '/' + page.total + ', ' + page.percentage + '%)</span>\n' +
            '            </div>\n' +
            '            <div class="analysis-card no-break">\n' +
            '                <h4>영역 개요</h4>\n' +
            '                <p>' + escapeHtml(page.overview) + '</p>\n' +
            '            </div>\n' +
            page.wrongHtml +
            page.correctNote +
            '            <div class="analysis-card no-break">\n' +
            '                <h4>학습 포인트</h4>\n' +
            '                <ul>\n' +
            page.studyPointsHtml +
            '                </ul>\n' +
            '            </div>\n' +
            '        </div>\n' +
            '        <div class="page-footer">\n' +
            '            <span class="brand">Vera Jin Academy</span>\n' +
            '            <span>Page ' + page.pageNum + ' / ' + page.totalPages + '</span>\n' +
            '        </div>\n' +
            '    </div>';
    });
}

function renderSolutions(html, solutions) {
    if (!solutions) return html;

    return renderRepeatBlock(html, 'solutions', solutions, function (sol, idx) {
        var itemsHtml = '';
        if (sol.items) {
            for (var i = 0; i < sol.items.length; i++) {
                itemsHtml += '                    <li>' + escapeHtml(sol.items[i]) + '</li>\n';
            }
        }
        return '<div class="solution-box no-break">\n' +
            '                <span class="priority-badge">PRIORITY ' + (idx + 1) + '</span>\n' +
            '                <h4>' + escapeHtml(sol.title) + '</h4>\n' +
            '                <ul>\n' +
            itemsHtml +
            '                </ul>\n' +
            '            </div>';
    });
}


// ═══════════════════════════════════════
// 유틸리티 함수
// ═══════════════════════════════════════

function renderRepeatBlock(html, blockName, items, renderFn) {
    var startTag = '<!-- REPEAT:' + blockName + ' -->';
    var endTag = '<!-- /REPEAT:' + blockName + ' -->';

    var startIdx = html.indexOf(startTag);
    var endIdx = html.indexOf(endTag);

    if (startIdx === -1 || endIdx === -1) return html;

    var before = html.substring(0, startIdx);
    var after = html.substring(endIdx + endTag.length);

    var rendered = '';
    for (var i = 0; i < items.length; i++) {
        rendered += renderFn(items[i], i) + '\n';
    }

    return before + rendered + after;
}

function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function replaceAll(str, search, replacement) {
    return str.split(search).join(replacement);
}

function padNum(n) {
    return n < 10 ? '0' + n : String(n);
}

function getQuestionTypeFromRegistry(qNum, questionTypes) {
    if (!questionTypes) return '기타';
    for (var typeName in questionTypes) {
        var info = questionTypes[typeName];
        // 비연속 범위 (questions 배열) 지원
        if (info.questions) {
            if (info.questions.indexOf(qNum) !== -1) {
                return typeName;
            }
        }
        // 연속 범위 (start/end) 호환
        else if (info.start <= qNum && qNum <= info.end) {
            return typeName;
        }
    }
    return '기타';
}

function getAnalysisTemplateHtml() {
    return ANALYSIS_MODULE_TEMPLATE;
}
