/**
 * 로드맵 렌더러
 *
 * 고정 HTML 템플릿 + JSON 데이터 → 최종 HTML 생성
 * Google Apps Script 호환 (ES5, DOM 미사용)
 */

/**
 * JSON 데이터를 받아 완성된 로드맵 HTML을 반환
 * @param {Object} data - schema.json 구조의 JSON 데이터
 * @returns {string} 렌더링된 HTML 문자열
 */
function renderRoadmap(data) {
    var html = getRoadmapTemplateHtml();

    // 1) 단순 변수 치환
    html = html.replace(/\{\{studentName\}\}/g, escapeHtml(data.studentName));
    html = html.replace(/\{\{subtitle\}\}/g, escapeHtml(data.subtitle));
    html = html.replace(/\{\{roadmapTitle\}\}/g, escapeHtml(data.roadmapTitle));
    html = html.replace(/\{\{finalMessage\}\}/g, data.finalMessage); // HTML 마크업 허용

    // 2) 프로필 치환
    html = html.replace(/\{\{profile\.sleepPattern\}\}/g, escapeHtml(data.profile.sleepPattern));
    html = html.replace(/\{\{profile\.strengths\}\}/g, escapeHtml(data.profile.strengths));
    html = html.replace(/\{\{profile\.keyChallenge\}\}/g, escapeHtml(data.profile.keyChallenge));

    // 3) 분석 치환
    html = html.replace(/\{\{analysis\.title\}\}/g, escapeHtml(data.analysis.title));
    html = html.replace(/\{\{analysis\.content\}\}/g, data.analysis.content); // HTML 마크업 허용

    // 4) 전략 반복 블록
    html = renderRepeatBlock(html, 'strategies', data.strategies, function (strategy) {
        return '<div class="strategy-box no-break">\n' +
            '                <h4>' + escapeHtml(strategy.title) + '</h4>\n' +
            '                <p>' + strategy.content + '</p>\n' +
            '            </div>';
    });

    // 5) Phase 반복 블록
    html = renderRepeatBlock(html, 'phases', data.phases, function (phase) {
        var itemsHtml = '';
        for (var i = 0; i < phase.items.length; i++) {
            itemsHtml += '                            <li>' + phase.items[i] + '</li>\n';
        }

        return '<div class="phase">\n' +
            '                    <div class="phase-dot"></div>\n' +
            '                    <div class="phase-header">\n' +
            '                        <span class="phase-name">' + escapeHtml(phase.name) + '</span>\n' +
            '                        <span class="phase-period">' + escapeHtml(phase.period) + '</span>\n' +
            '                    </div>\n' +
            '                    <div class="phase-body">\n' +
            '                        <ul>\n' +
            itemsHtml +
            '                        </ul>\n' +
            '                    </div>\n' +
            '                </div>';
    });

    // 6) 스케줄 테이블 생성
    html = renderScheduleTable(html, data.schedule);

    return html;
}


// ═══════════════════════════════════════
// 스케줄 테이블 렌더러
// ═══════════════════════════════════════

/**
 * 스케줄 JSON 데이터를 테이블 행으로 렌더링
 * 동일한 인접 셀을 자동으로 colspan 병합
 */
function renderScheduleTable(html, scheduleRows) {
    var DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
    var tbodyHtml = '';

    for (var r = 0; r < scheduleRows.length; r++) {
        var row = scheduleRows[r];
        tbodyHtml += '                    <tr>\n';
        tbodyHtml += '                        <td>' + escapeHtml(row.time) + '</td>\n';

        // 인접 동일 셀 병합 로직
        var d = 0;
        while (d < DAYS.length) {
            var cell = row[DAYS[d]];
            if (!cell) {
                tbodyHtml += '                        <td></td>\n';
                d++;
                continue;
            }

            // 동일한 셀이 연속으로 몇 개인지 카운트
            var span = 1;
            while (d + span < DAYS.length) {
                var nextCell = row[DAYS[d + span]];
                if (nextCell && nextCell.label === cell.label && nextCell.type === cell.type) {
                    span++;
                } else {
                    break;
                }
            }

            var colspanAttr = span > 1 ? ' colspan="' + span + '"' : '';
            var cellClass = 'cell-' + (cell.type || 'break');
            var detailHtml = '';
            if (cell.detail) {
                var detailLines = cell.detail.split('\n');
                detailHtml = '<span class="cell-detail">' + detailLines.map(escapeHtml).join('<br>') + '</span>';
            }

            tbodyHtml += '                        <td' + colspanAttr + ' class="' + cellClass + '">' +
                '<span class="cell-label">' + escapeHtml(cell.label) + '</span>' +
                detailHtml +
                '</td>\n';

            d += span;
        }

        tbodyHtml += '                    </tr>\n';
    }

    // SCHEDULE_BODY 마커 대체
    html = html.replace(
        /<!-- SCHEDULE_BODY: renderer\.js가 생성 -->/,
        tbodyHtml
    );

    return html;
}


// ═══════════════════════════════════════
// 유틸리티 함수
// ═══════════════════════════════════════

/**
 * REPEAT 블록을 렌더링
 * <!-- REPEAT:name --> ... <!-- /REPEAT:name --> 구간을 찾아
 * 배열 아이템마다 renderFn 콜백으로 HTML 생성
 */
function renderRepeatBlock(html, blockName, items, renderFn) {
    var startTag = '<!-- REPEAT:' + blockName + ' -->';
    var endTag = '<!-- /REPEAT:' + blockName + ' -->';

    var startIdx = html.indexOf(startTag);
    var endIdx = html.indexOf(endTag);

    if (startIdx === -1 || endIdx === -1) {
        return html;
    }

    var before = html.substring(0, startIdx);
    var after = html.substring(endIdx + endTag.length);

    var renderedItems = '';
    for (var i = 0; i < items.length; i++) {
        renderedItems += renderFn(items[i], i) + '\n';
    }

    return before + renderedItems + after;
}

/**
 * HTML 이스케이프
 */
function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

/**
 * 템플릿 HTML 반환
 * 실제 배포시에는 파일에서 읽거나 상수로 관리
 */
function getRoadmapTemplateHtml() {
    // GAS 환경: HtmlService.createHtmlOutputFromFile('roadmap_template').getContent()
    // 또는 상수로 인라인 (compile_code.py가 처리)
    return ROADMAP_MODULE_TEMPLATE;
}


// ═══════════════════════════════════════
// 사용 예시 (테스트용)
// ═══════════════════════════════════════

/*
var sampleData = {
    studentName: "이연율",
    subtitle: "어휘 집중 강화를 통한 상위권 도약 전략",
    profile: {
        sleepPattern: "08:15 기상 / 01:30 취침",
        strengths: "독해/문법 기본기 보유",
        keyChallenge: "절대적인 어휘량 부족"
    },
    analysis: {
        title: "분석: 연료가 부족한 고성능 엔진",
        content: "연율 학생은 문장을 구조적으로 파악하는 「엔진(독해/문법)」의 성능은 이미 일정 수준에 도달했습니다."
    },
    strategies: [
        { title: "전략 1: 「어휘 FIRST」 원칙 확립", content: "모든 학습의 중심에 「어휘」를 둡니다." },
        { title: "전략 2: 다각적 & 주기적 반복 시스템", content: "보고, 듣고, 쓰고, 말하는 방식을 모두 활용합니다." }
    ],
    roadmapTitle: "어휘력 폭발을 위한 3단계 로드맵",
    phases: [
        {
            name: "Phase 1: Critical Mass",
            period: "~1개월: 어휘 임계량 돌파기",
            items: [
                "<span class=\"tag\">[목표]</span> 편입 필수/기본 어휘 1회독 완주",
                "<span class=\"tag\">[학습]</span> 어원을 활용한 암기법을 익혀 학습 효율 극대화",
                "<span class=\"tag\">[결과]</span> 독해 지문의 60~70% 이상을 해석할 수 있는 어휘력 확보"
            ]
        },
        {
            name: "Phase 2: Contextualization",
            period: "~3개월: 문맥 속 어휘 체화기",
            items: [
                "<span class=\"tag\">[목표]</span> 암기한 어휘를 독해와 문법에 실제 적용",
                "<span class=\"tag\">[학습]</span> 유의어, 반의어, 다의어 집중 학습",
                "<span class=\"tag\">[결과]</span> 문맥에 맞는 적절한 어휘를 고르는 능력 향상"
            ]
        },
        {
            name: "Phase 3: Mastery",
            period: "~시험 직전: 고난도 어휘 정복기",
            items: [
                "<span class=\"tag\">[목표]</span> 고난도 및 추상 어휘 완전 정복",
                "<span class=\"tag\">[학습]</span> 기출문제 어휘 파트 집중 분석",
                "<span class=\"tag\">[결과]</span> 어휘 문제에 대한 자신감 확보 및 시간 단축"
            ]
        }
    ],
    schedule: [
        {
            time: "08:15-09:00",
            mon: { label: "기상 및 루틴", type: "break" },
            tue: { label: "기상 및 루틴", type: "break" },
            wed: { label: "기상 및 루틴", type: "break" },
            thu: { label: "기상 및 루틴", type: "break" },
            fri: { label: "기상 및 루틴", type: "break" },
            sat: { label: "기상 및 루틴", type: "break" },
            sun: { label: "기상 및 루틴", type: "break" }
        },
        {
            time: "09:00-12:30",
            mon: { label: "어휘 집중 학습", detail: "새 단어 암기\n어원 분석", type: "vocab" },
            tue: { label: "어휘 집중 학습", detail: "새 단어 암기\n어원 분석", type: "vocab" },
            wed: { label: "어휘 집중 학습", detail: "새 단어 암기\n어원 분석", type: "vocab" },
            thu: { label: "어휘 집중 학습", detail: "새 단어 암기\n어원 분석", type: "vocab" },
            fri: { label: "어휘 집중 학습", detail: "새 단어 암기\n어원 분석", type: "vocab" },
            sat: { label: "주간 어휘 총정리", detail: "누적 테스트", type: "review" },
            sun: { label: "실전 모의고사", detail: "시간 측정 풀이", type: "test" }
        }
    ],
    finalMessage: "<span class=\"emphasis\">연율 학생</span>의 합격을 진심으로 응원합니다. 꾸준함이 재능을 이깁니다."
};

var resultHtml = renderRoadmap(sampleData);
*/
