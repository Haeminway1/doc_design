/**
 * 로컬 시험 분석지 생성기
 *
 * exam_data JSON 없이 채점 결과 + 두루뭉실한 영역별 분석으로
 * HTML 분석지를 생성.
 *
 * 사용법:
 *   node generate-analysis-local.js <시험이름> <학생이름> <학생답안>
 *
 * 예시:
 *   node generate-analysis-local.js "2026-3월-고1" "김예은" "4,5,2,3,5,3,2,4,3,2,2,4,1,4,4,5,3,3,3,2,1,1,5,1,4,4,2,2,4,5,1,3,4,1,2,5,5,3,5,1,1,2,4,3,2"
 *
 * 출력:
 *   test_analysis_module/output/<학생이름>_<시험이름>.html
 */

var fs = require('fs');
var path = require('path');

// ── 모듈 로드 (ES5 global 방식이라 eval) ──
eval(fs.readFileSync(path.join(__dirname, 'exam_registry.js'), 'utf-8'));
var rendererCode = fs.readFileSync(path.join(__dirname, 'renderer.js'), 'utf-8');
// getAnalysisTemplateHtml가 ANALYSIS_MODULE_TEMPLATE 전역변수를 참조하므로 주입
var ANALYSIS_MODULE_TEMPLATE = fs.readFileSync(path.join(__dirname, 'template.html'), 'utf-8');
eval(rendererCode);


// ═══════════════════════════════════════
// 메인
// ═══════════════════════════════════════

function main() {
    var args = process.argv.slice(2);

    if (args.length < 3) {
        console.log('사용법: node generate-analysis-local.js <시험이름> <학생이름> <학생답안>');
        console.log('');
        console.log('학생답안: 쉼표로 구분된 번호 (1~5)');
        console.log('  예: "4,5,2,3,5,3,2,4,3,2,..."');
        console.log('');
        console.log('등록된 시험:');
        listExams().forEach(function (name) {
            console.log('  - ' + name);
        });
        process.exit(1);
    }

    var examName = args[0];
    var studentName = args[1];
    var answersRaw = args[2];

    // 시험 데이터 조회
    var exam = findExam(examName);
    if (!exam) {
        console.error('오류: "' + examName + '" 시험을 찾을 수 없습니다.');
        console.error('등록된 시험: ' + listExams().join(', '));
        process.exit(1);
    }

    // 학생 답안 파싱
    var answerList = answersRaw.split(',').map(function (s) { return s.trim(); });
    var studentAnswers = {};
    for (var i = 0; i < answerList.length; i++) {
        studentAnswers[String(i + 1)] = answerList[i];
    }

    console.log('시험: ' + exam.displayName);
    console.log('학생: ' + studentName);
    console.log('답안 수: ' + answerList.length + ' / ' + exam.totalQuestions);

    // ── 채점 ──
    var scoringData = generateScoringData(
        studentAnswers,
        exam.officialAnswers,
        exam.questionTypes,
        exam  // examData 객체 전달 (변동 배점 지원)
    );

    console.log('정답: ' + scoringData.correctCount + '/' + scoringData.totalQuestions);
    console.log('점수: ' + scoringData.totalScore + '/' + scoringData.totalPossible);

    // ── AI 콘텐츠 생성 (두루뭉실 버전) ──
    var aiContent = buildGenericAiContent(studentName, exam, scoringData);

    // ── 렌더링 ──
    var html = renderAnalysis(scoringData, aiContent);

    // ── 저장 ──
    var outputDir = path.join(__dirname, 'output');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    var safeName = (studentName + '_' + examName).replace(/[\/\\:*?"<>|]/g, '_');
    var outputPath = path.join(outputDir, safeName + '.html');
    fs.writeFileSync(outputPath, html, 'utf-8');

    console.log('');
    console.log('생성 완료: ' + outputPath);
}


// ═══════════════════════════════════════
// 두루뭉실 AI 콘텐츠 생성
// ═══════════════════════════════════════

function buildGenericAiContent(studentName, exam, scoringData) {
    var stats = scoringData.sectionStats;
    var correctRate = Math.round((scoringData.correctCount / scoringData.totalQuestions) * 100);

    // 영역별 분석 생성
    var sectionAnalyses = [];
    for (var sName in stats) {
        var s = stats[sName];
        var analysis = buildSectionAnalysis(sName, s, scoringData.results, exam);
        sectionAnalyses.push(analysis);
    }

    // 종합 소견
    var overallComment = buildOverallComment(correctRate, stats);

    // 솔루션
    var solutions = buildSolutions(stats);

    // 격려 메시지
    var encouragement = buildEncouragement(correctRate, studentName);

    return {
        studentName: studentName,
        examName: exam.displayName,
        overallComment: overallComment,
        sectionAnalyses: sectionAnalyses,
        solutions: solutions,
        encouragement: encouragement
    };
}

function buildSectionAnalysis(sectionName, sectionStat, results, exam) {
    var pct = sectionStat.percentage;
    var wrongCount = sectionStat.total - sectionStat.correct;

    // 쉬운 문항 목록 (틀리면 기본 어휘 부족 추정)
    var easyQuestions = [18, 19, 43, 44, 45];

    // 틀린 문항을 subType별로 그룹핑
    var wrongByType = {}; // { subType: [번호, ...] }
    var wrongNums = [];
    var easyWrongCount = 0;

    for (var i = 0; i < results.length; i++) {
        var r = results[i];
        if (r.type === sectionName && r.mark === 'X') {
            var subType = '기타';
            if (exam.questionMeta && exam.questionMeta[String(r.number)]) {
                subType = exam.questionMeta[String(r.number)].subType;
            }
            if (!wrongByType[subType]) wrongByType[subType] = [];
            wrongByType[subType].push(r.number);
            wrongNums.push(r.number);
            if (easyQuestions.indexOf(r.number) !== -1) easyWrongCount++;
        }
    }

    // 맞춘 subType 목록 (학습포인트에서 언급 안 하기 위함)
    var correctTypes = {};
    for (var j = 0; j < results.length; j++) {
        var cr = results[j];
        if (cr.type === sectionName && cr.mark === 'O') {
            var cSubType = '기타';
            if (exam.questionMeta && exam.questionMeta[String(cr.number)]) {
                cSubType = exam.questionMeta[String(cr.number)].subType;
            }
            correctTypes[cSubType] = true;
        }
    }

    // 유형별 그룹 wrongItems 생성
    var wrongItems = [];
    for (var typeName in wrongByType) {
        var nums = wrongByType[typeName];
        wrongItems.push({
            grouped: true,
            label: typeName,
            explanation: nums.join(', ') + '번 — ' + nums.length + '문항 오답'
        });
    }

    // 영역별 overview
    var overview = buildOverviewText(sectionName, wrongCount, wrongByType, easyWrongCount);

    // 학습 포인트 (실제 오답 유형 기반)
    var studyPoints = buildStudyPoints(sectionName, wrongCount, wrongByType, correctTypes, easyWrongCount);

    return {
        sectionName: sectionName,
        overview: overview,
        wrongItems: wrongItems,
        studyPoints: studyPoints
    };
}

function buildOverviewText(sectionName, wrongCount, wrongByType, easyWrongCount) {
    if (sectionName === '듣기') {
        if (wrongCount === 0) {
            return '듣기 영역에서 전 문항 정답으로, 안정적인 청취 능력을 갖추고 있는 것으로 판단됩니다.';
        } else if (wrongCount === 1) {
            return '듣기 영역에서 1문항 오답으로, 전반적인 청취력은 양호한 편입니다. 독해 문제와 듣기를 동시에 풀면서 발생하는 집중력 분산에 의한 실수일 가능성이 있으며, 이 부분도 보완할 필요가 있을 것 같습니다.';
        } else if (wrongCount === 2) {
            return '듣기 영역에서 2문항 오답이 발생했습니다. 기본적인 청취력은 갖추고 있으나, 세부 정보를 놓치는 경향이 있는 것으로 추정됩니다.';
        } else {
            return '듣기 영역에서 ' + wrongCount + '문항 오답이 발생했습니다. 듣기에 필요한 기본 어휘가 부족한 것으로 추정되며, 듣기 전용 어휘 학습과 듣기 문제 연습을 병행할 필요가 있을 것 같습니다.';
        }
    }

    if (sectionName === '기본독해') {
        if (wrongCount === 0) {
            return '기본 독해 영역에서 전 문항 정답으로, 탄탄한 독해력을 보유하고 있는 것으로 판단됩니다.';
        }

        // 틀린 유형 목록화
        var wrongTypeNames = [];
        for (var t in wrongByType) wrongTypeNames.push(t);
        var typeListStr = wrongTypeNames.join(', ');

        if (wrongCount <= 3) {
            var msg = '기본 독해 영역에서 어느 정도의 독해력을 보이고 있습니다. 다만 ' + typeListStr + ' 유형에서 오답이 발생했으며, ';
            if (easyWrongCount > 0) {
                msg += '기본 난이도 문항에서의 오답은 어휘력 부족이 원인인 것으로 추정됩니다.';
            } else {
                msg += '해당 유형에서의 풀이 전략 보완이 필요할 것 같습니다.';
            }
            return msg;
        } else {
            var msg2 = '기본 독해 영역에서 어느 정도의 독해력을 보이지만, ' + typeListStr + ' 등 다수 유형에서 오답이 발생하고 있습니다. ';
            if (easyWrongCount > 0) {
                msg2 += '기본 난이도 문항에서도 오답이 있는 것으로 보아 어휘력 보강이 우선적으로 필요한 것으로 추정됩니다.';
            } else {
                msg2 += '글의 핵심 파악 능력과 선택지 분석 능력을 함께 보강할 필요가 있을 것 같습니다.';
            }
            return msg2;
        }
    }

    if (sectionName === '고난도독해') {
        if (wrongCount === 0) {
            return '고난도 독해 영역에서 전 문항 정답으로, 상위 수준의 독해 능력을 갖추고 있는 것으로 판단됩니다.';
        }

        var wrongTypeNames2 = [];
        for (var t2 in wrongByType) wrongTypeNames2.push(t2 + ' ' + wrongByType[t2].length + '문항');
        var typeDetail = wrongTypeNames2.join(', ');

        if (wrongCount <= 2) {
            return '고난도 독해 영역에서 ' + typeDetail + ' 오답이 발생했으나, 전반적으로 양호한 독해 기술을 보유하고 있는 것으로 보입니다. 해당 유형에 대한 집중 연습으로 충분히 보완 가능할 것 같습니다.';
        } else {
            return '고난도 독해 영역에서 ' + typeDetail + ' 오답이 발생하고 있습니다. 해당 독해 기술을 더욱 연습할 필요가 있으며, 글의 논리적 흐름을 파악하는 훈련이 필요할 것 같습니다.';
        }
    }

    return sectionName + ' 영역 ' + (wrongCount > 0 ? wrongCount + '문항 오답 발생' : '전 문항 정답') + '입니다.';
}

function buildStudyPoints(sectionName, wrongCount, wrongByType, correctTypes, easyWrongCount) {
    if (wrongCount === 0) {
        if (sectionName === '듣기') return ['현재 듣기 실력이 안정적인 것으로 판단되며, 이 수준을 유지하는 것이 좋을 것 같습니다.'];
        if (sectionName === '기본독해') return ['기본 독해력이 안정적인 것으로 판단되며, 시간 관리 능력을 함께 키우면 좋을 것 같습니다.'];
        if (sectionName === '고난도독해') return ['고난도 독해 기술이 안정적인 것으로 판단되며, 현재 수준을 유지하는 것이 좋을 것 같습니다.'];
        return ['전 문항 정답으로, 현재 수준 유지가 좋을 것 같습니다.'];
    }

    var points = [];

    // 듣기
    if (sectionName === '듣기') {
        if (wrongCount <= 2) {
            points.push('집중력을 유지한 상태에서 듣기와 독해를 동시에 처리하는 연습이 필요할 것 같습니다.');
            points.push('틀린 문항의 스크립트를 확인하여 놓친 표현이나 키워드를 정리하는 것이 도움이 될 것으로 보입니다.');
        } else {
            points.push('듣기에 필요한 기본 어휘가 부족한 것으로 추정되며, 듣기 전용 어휘 학습을 병행할 필요가 있을 것 같습니다.');
            points.push('매일 듣기 문제 연습을 꾸준히 진행하면서 자주 등장하는 표현 패턴에 익숙해질 필요가 있습니다.');
        }
        return points;
    }

    // 기본독해 — 실제 틀린 유형만 언급
    if (sectionName === '기본독해') {
        if (easyWrongCount > 0) {
            points.push('기본 난이도 문항에서도 오답이 발생하고 있으며, 이는 기본 어휘력 부족이 원인인 것으로 추정됩니다. 어휘 학습이 가장 시급할 것 같습니다.');
        }
        if (wrongByType['어법']) {
            points.push('어법 문항에서 오답이 발생하고 있어, 기본 문법 규칙(수일치, 시제, 관계사 등)을 정리하고 적용하는 연습이 필요할 것 같습니다.');
        }
        if (wrongByType['어휘(밑줄)'] || wrongByType['어휘']) {
            points.push('어휘 문항에서 오답이 있는 것으로 보아, 문맥 속에서 단어의 의미를 유추하는 훈련이 필요할 것 같습니다.');
        }
        if (wrongByType['심경변화'] || wrongByType['요지'] || wrongByType['주장'] || wrongByType['주제']) {
            var readingTypes = [];
            if (wrongByType['심경변화']) readingTypes.push('심경변화');
            if (wrongByType['요지']) readingTypes.push('요지');
            if (wrongByType['주장']) readingTypes.push('주장');
            if (wrongByType['주제']) readingTypes.push('주제');
            points.push(readingTypes.join(', ') + ' 유형에서 오답이 발생하고 있어, 글의 핵심 내용을 빠르게 파악하는 연습이 필요할 것 같습니다.');
        }
        if (wrongByType['무관한문장']) {
            points.push('무관한 문장 유형에서 오답이 있는 것으로 보아, 글의 논리적 흐름을 따라가는 연습이 필요할 것 같습니다.');
        }
        if (wrongByType['제목(장문)'] || wrongByType['순서배열(장문)'] || wrongByType['지칭추론(장문)'] || wrongByType['내용일치(장문)']) {
            var longTypes = [];
            if (wrongByType['제목(장문)']) longTypes.push('제목');
            if (wrongByType['순서배열(장문)']) longTypes.push('순서배열');
            if (wrongByType['지칭추론(장문)']) longTypes.push('지칭추론');
            if (wrongByType['내용일치(장문)']) longTypes.push('내용일치');
            points.push('장문 독해(' + longTypes.join(', ') + ')에서 오답이 발생하고 있어, 긴 지문을 끝까지 집중하여 읽는 훈련과 함께 지문 구조 파악 능력을 키울 필요가 있을 것 같습니다.');
        }
        if (points.length === 0) {
            points.push('틀린 유형을 중심으로 풀이 전략을 점검하면 충분히 개선 가능할 것으로 보입니다.');
        }
        return points;
    }

    // 고난도독해 — 실제 틀린 유형만 언급
    if (sectionName === '고난도독해') {
        if (wrongByType['빈칸추론']) {
            var cnt = wrongByType['빈칸추론'].length;
            if (cnt >= 3) {
                points.push('빈칸추론 유형에서 ' + cnt + '문항 모두 오답이 발생하고 있어, 이 유형에 대한 집중 훈련이 시급할 것 같습니다. 빈칸 앞뒤 문장의 논리적 관계를 파악하고, 선택지를 넣어 보며 일관성을 검증하는 연습이 필요합니다.');
            } else {
                points.push('빈칸추론 유형에서 ' + cnt + '문항 오답이 발생하고 있어, 빈칸 앞뒤 문맥에서 핵심 개념을 파악하는 연습이 필요할 것 같습니다.');
            }
        }
        if (wrongByType['순서배열']) {
            points.push('순서배열 유형에서 오답이 발생하고 있어, 연결어(however, therefore, for example 등)를 단서로 활용하여 글의 전개 방식을 파악하는 훈련이 필요할 것 같습니다.');
        }
        if (wrongByType['문장삽입']) {
            points.push('문장삽입 유형에서 오답이 발생하고 있어, 대명사·지시어가 가리키는 대상을 추적하며 삽입 위치를 추론하는 전략을 훈련할 필요가 있습니다.');
        }
        if (wrongByType['함축의미(밑줄)']) {
            points.push('함축의미 유형에서 오답이 발생하고 있어, 밑줄 친 표현의 문맥적 의미를 추론하는 연습이 필요할 것 같습니다.');
        }
        if (points.length === 0) {
            points.push('틀린 유형에 대한 집중 연습으로 보완이 가능할 것으로 보입니다.');
        }
        return points;
    }

    return ['해당 영역에 대한 집중 복습이 필요할 것 같습니다.'];
}

function buildOverallComment(correctRate, stats) {
    var parts = [];
    if (correctRate >= 80) {
        parts.push('전체적으로 양호한 성취도를 보이고 있으며, 기본기가 잘 갖춰져 있는 것으로 판단됩니다.');
    } else if (correctRate >= 60) {
        parts.push('전체적으로 어느 정도의 영어 실력을 갖추고 있는 것으로 보이지만, 영역별로 보완이 필요한 부분이 있는 것으로 추정됩니다.');
    } else if (correctRate >= 40) {
        parts.push('전체적으로 기본기는 있으나 여러 영역에서 보강이 필요한 것으로 판단됩니다.');
    } else {
        parts.push('기초 영어 능력 전반에 걸쳐 체계적인 보강이 필요한 것으로 추정됩니다.');
    }

    // 가장 약한 영역 찾기
    var weakest = null;
    var strongest = null;
    for (var name in stats) {
        var s = stats[name];
        if (!weakest || s.percentage < weakest.percentage) weakest = s;
        if (!strongest || s.percentage > strongest.percentage) strongest = s;
    }

    if (strongest && weakest && strongest.name !== weakest.name) {
        parts.push(strongest.name + ' 영역(' + strongest.percentage + '%)이 상대적으로 강한 편이며, ' +
            weakest.name + ' 영역(' + weakest.percentage + '%)에 대한 집중적인 보완이 필요할 것 같습니다.');
    }

    return parts.join(' ');
}

function buildSolutions(stats) {
    var solutions = [];

    // 약한 영역 순으로 정렬
    var sorted = [];
    for (var name in stats) {
        sorted.push(stats[name]);
    }
    sorted.sort(function (a, b) { return a.percentage - b.percentage; });

    for (var i = 0; i < sorted.length; i++) {
        var s = sorted[i];
        if (s.percentage >= 90) continue;
        var wrongCount = s.total - s.correct;
        var sol = { title: '', items: [] };

        if (s.name === '듣기') {
            sol.title = '듣기 영역 보완';
            if (wrongCount <= 2) {
                sol.items = [
                    '시험 환경과 유사한 조건에서 듣기 모의 연습을 반복하는 것이 좋을 것 같습니다.',
                    '틀린 문항 스크립트를 정독하여 놓친 표현을 정리할 필요가 있습니다.',
                    '독해와 듣기를 병행 처리할 때의 집중력 분산을 줄이는 연습이 필요할 것 같습니다.'
                ];
            } else {
                sol.items = [
                    '듣기 전용 어휘 학습을 병행하는 것이 시급할 것 같습니다.',
                    '매일 EBS 듣기 파일 1회분 청취 및 받아쓰기를 진행할 필요가 있습니다.',
                    '유형별(목적, 금액, 응답) 기출 문항을 반복 훈련하는 것이 좋을 것 같습니다.'
                ];
            }
        } else if (s.name === '기본독해') {
            sol.title = '기본 독해력 보강';
            sol.items = [
                '기본 어휘력 보강이 가장 우선적으로 필요할 것으로 추정됩니다.',
                '하루 3지문 이상 독해 연습을 진행하면 점진적인 향상이 가능할 것 같습니다.',
                '어법 기본 규칙(수일치, 시제, 관계사)을 정리하고 적용하는 연습이 필요할 것 같습니다.'
            ];
        } else if (s.name === '고난도독해') {
            sol.title = '고난도 독해 기술 강화';
            sol.items = [
                '빈칸 추론: 선택지를 넣어 보며 논리적 일관성을 검증하는 훈련이 필요할 것 같습니다.',
                '순서 배열: 글의 전개 방식(시간순, 인과, 대조)을 파악하는 연습이 도움이 될 것으로 보입니다.',
                '문장 삽입: 대명사·연결어를 단서로 위치를 추론하는 전략을 훈련할 필요가 있습니다.',
                '주 3회 이상 고난도 유형 전용 문제를 풀어보는 것이 좋을 것 같습니다.'
            ];
        } else {
            sol.title = s.name + ' 보강';
            sol.items = ['해당 영역 기출문항을 반복 풀이할 필요가 있습니다.', '오답 분석 노트를 작성하는 것이 도움이 될 것으로 보입니다.'];
        }

        solutions.push(sol);
    }

    if (solutions.length === 0) {
        solutions.push({
            title: '실력 유지 및 심화',
            items: ['현재 수준을 유지하면서 고난도 문항 비율을 점차 늘려가는 것이 좋을 것 같습니다.', '실전 모의고사 시간 내 풀이 연습을 병행하면 실전 대응력 향상에 도움이 될 것으로 보입니다.']
        });
    }

    return solutions;
}

function buildEncouragement(correctRate, studentName) {
    if (correctRate >= 80) {
        return '전반적으로 안정적인 실력을 보여주고 있으며, 약간의 보완만으로도 더 높은 성취가 충분히 가능할 것으로 판단됩니다. 현재의 학습 방향을 유지하면서 취약 부분만 집중적으로 보완하면 좋은 결과가 있을 것으로 기대됩니다.';
    }
    if (correctRate >= 60) {
        return '기본기가 어느 정도 갖춰져 있는 것으로 보이며, 취약 영역을 집중적으로 보완하면 큰 폭의 성적 향상이 가능할 것으로 추정됩니다. 특히 오답이 발생한 영역의 학습 포인트를 중심으로 단계적인 보완을 진행하는 것이 좋을 것 같습니다.';
    }
    if (correctRate >= 40) {
        return '현재 점수에서 성장 가능성이 충분히 있는 것으로 판단됩니다. 기본 어휘력과 독해 기초를 다지는 것에 집중하면 의미 있는 향상을 기대할 수 있을 것 같습니다. 학습 포인트를 참고하여 하나씩 보완해 나가면 좋겠습니다.';
    }
    return '현재 점수가 전부는 아니며, 올바른 학습 전략을 세우고 꾸준히 실행하면 충분히 향상 가능할 것으로 판단됩니다. 기초부터 단계적으로 접근하는 것이 가장 효과적일 것 같습니다.';
}


// ═══════════════════════════════════════
// 실행
// ═══════════════════════════════════════

main();
