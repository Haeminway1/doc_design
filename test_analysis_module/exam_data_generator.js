/**
 * 시험 데이터 생성기
 *
 * 시험 원본 문제를 Gemini에게 전달하여
 * 문항별 해설, 오답 분석, 취약점 진단 데이터를 생성하고 JSON으로 저장.
 *
 * 사용법:
 *   node exam_data_generator.js <시험이름> <문제파일경로>
 *
 * 예시:
 *   node exam_data_generator.js "2026 레벨테스트" ./raw_exams/level_test.txt
 *
 * 환경변수:
 *   GEMINI_API_KEY - Google Gemini API 키 (필수)
 *
 * 출력:
 *   test_analysis_module/exam_data/<시험이름>.json
 */

var fs = require('fs');
var path = require('path');
var https = require('https');

// ═══════════════════════════════════════
// 설정
// ═══════════════════════════════════════

var GEMINI_API_KEY = process.env.GEMINI_API_KEY;
var MODEL = 'gemini-3.1-pro-preview';
var MAX_OUTPUT_TOKENS = 65536;
var EXAM_DATA_DIR = path.join(__dirname, 'exam_data');

// ═══════════════════════════════════════
// 메인
// ═══════════════════════════════════════

function main() {
    var args = process.argv.slice(2);

    if (args.length < 2) {
        console.log('사용법: node exam_data_generator.js <시험이름> <문제파일경로>');
        console.log('');
        console.log('예시:');
        console.log('  node exam_data_generator.js "2026 레벨테스트" ./raw_exams/level_test.txt');
        console.log('');
        console.log('환경변수:');
        console.log('  GEMINI_API_KEY - Google Gemini API 키 (필수)');
        console.log('');
        console.log('문제 파일 형식:');
        console.log('  각 문항을 텍스트로 작성. 형식 자유 (AI가 파싱).');
        console.log('  정답이 포함되어 있으면 자동 추출.');
        console.log('  영역 구분이 있으면 자동 인식.');
        process.exit(1);
    }

    if (!GEMINI_API_KEY) {
        console.error('오류: GEMINI_API_KEY 환경변수를 설정하세요.');
        console.error('  export GEMINI_API_KEY=...');
        process.exit(1);
    }

    var examName = args[0];
    var filePath = args[1];

    if (!fs.existsSync(filePath)) {
        console.error('오류: 파일을 찾을 수 없습니다: ' + filePath);
        process.exit(1);
    }

    var rawContent = fs.readFileSync(filePath, 'utf-8');
    console.log('시험 데이터 생성 시작: ' + examName);
    console.log('파일: ' + filePath + ' (' + rawContent.length + '자)');
    console.log('모델: ' + MODEL);
    console.log('최대 출력 토큰: ' + MAX_OUTPUT_TOKENS);
    console.log('');

    generateExamData(examName, rawContent)
        .then(function (result) {
            // 저장 디렉토리 생성
            if (!fs.existsSync(EXAM_DATA_DIR)) {
                fs.mkdirSync(EXAM_DATA_DIR, { recursive: true });
            }

            var safeName = examName.replace(/[\/\\:*?"<>|]/g, '_');
            var outputPath = path.join(EXAM_DATA_DIR, safeName + '.json');

            fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), 'utf-8');
            console.log('');
            console.log('✓ 생성 완료: ' + outputPath);
            console.log('  문항 수: ' + result.questions.length);
            console.log('  영역: ' + Object.keys(result.questionTypes || {}).join(', '));
        })
        .catch(function (err) {
            console.error('오류: ' + err.message);
            process.exit(1);
        });
}


// ═══════════════════════════════════════
// AI 분석
// ═══════════════════════════════════════

function generateExamData(examName, rawContent) {
    var systemPrompt = '당신은 편입영어 시험 분석 전문가입니다.\n\n' +
        '사용자가 제공하는 시험 문제를 분석하여 아래 JSON 구조로 반환하세요.\n' +
        '반드시 순수 JSON만 출력하세요 (코드블록, 마크다운, 추가 설명 없이).\n\n' +
        '## 출력 JSON 구조\n\n' +
        '```json\n' +
        '{\n' +
        '  "examName": "시험명",\n' +
        '  "totalQuestions": 40,\n' +
        '  "pointsPerQuestion": 2.5,\n' +
        '  "questionTypes": {\n' +
        '    "어법": { "start": 1, "end": 10, "total": 10 },\n' +
        '    "어휘": { "start": 11, "end": 20, "total": 10 },\n' +
        '    "장문독해": { "start": 21, "end": 40, "total": 20 }\n' +
        '  },\n' +
        '  "questions": [\n' +
        '    {\n' +
        '      "number": 1,\n' +
        '      "type": "어법",\n' +
        '      "content": "문제 원본 텍스트 (지문 포함)",\n' +
        '      "options": {\n' +
        '        "A": "선택지 A",\n' +
        '        "B": "선택지 B",\n' +
        '        "C": "선택지 C",\n' +
        '        "D": "선택지 D"\n' +
        '      },\n' +
        '      "correct": "C",\n' +
        '      "explanation": "정답이 C인 이유를 상세히 설명",\n' +
        '      "testedSkill": "이 문항이 테스트하는 구체적 능력 (예: 주어-동사 수일치)",\n' +
        '      "difficulty": "상|중|하",\n' +
        '      "wrongChoiceAnalysis": {\n' +
        '        "A": {\n' +
        '          "whyChosen": "학생이 이 답을 고른 이유/심리 (예: do/does 구분을 모르는 경우)",\n' +
        '          "weakness": "이 답을 골랐다면 부족한 영역 (예: 3인칭 단수 조동사 규칙)",\n' +
        '          "studyAdvice": "구체적 학습 조언"\n' +
        '        },\n' +
        '        "B": { "whyChosen": "...", "weakness": "...", "studyAdvice": "..." },\n' +
        '        "D": { "whyChosen": "...", "weakness": "...", "studyAdvice": "..." }\n' +
        '      }\n' +
        '    }\n' +
        '  ]\n' +
        '}\n' +
        '```\n\n' +
        '## 분석 원칙\n\n' +
        '1. **문제 원본 보존**: content 필드에 문제 텍스트를 그대로 보존\n' +
        '2. **정확한 정답**: 주어진 정답을 그대로 사용. 정답이 명시되지 않은 경우 분석하여 결정\n' +
        '3. **상세한 해설**: 왜 정답인지 문법/어휘 규칙을 인용하여 설명\n' +
        '4. **오답 심리 분석**: 각 오답을 고른 학생의 사고 과정을 구체적으로 추론\n' +
        '5. **약점 진단**: 각 오답 선택이 시사하는 구체적 학습 부족 영역\n' +
        '6. **학습 조언**: 실천 가능한 구체적 조언 (교재명/학습법 등)\n' +
        '7. **영역 자동 분류**: 문제 유형에 따라 어법/어휘/독해 등으로 자동 분류\n' +
        '8. **정답 선택지는 wrongChoiceAnalysis에 포함하지 않음**\n\n' +
        '순수 JSON만 출력하세요.';

    var userPrompt = '시험명: ' + examName + '\n\n' +
        '아래 시험 문제를 분석하여 JSON으로 반환하세요:\n\n' +
        rawContent;

    return callGemini(systemPrompt, userPrompt).then(function (responseText) {
        // JSON 파싱
        var text = responseText.trim();

        // 코드블록 제거
        if (text.indexOf('```') !== -1) {
            var jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
            if (jsonMatch) {
                text = jsonMatch[1].trim();
            }
        }

        // JSON 객체 시작 찾기
        var jsonStart = text.indexOf('{');
        if (jsonStart > 0) {
            text = text.substring(jsonStart);
        }

        var data;
        try {
            data = JSON.parse(text);
        } catch (e) {
            // 일반적인 JSON 오류 수정 시도
            text = text.replace(/,\s*}/g, '}').replace(/,\s*]/g, ']');
            data = JSON.parse(text);
        }

        // 메타데이터 추가
        data.examName = data.examName || examName;
        data.generatedAt = new Date().toISOString().slice(0, 10);
        data.generatedBy = MODEL;

        // 검증
        if (!data.questions || data.questions.length === 0) {
            throw new Error('AI가 문항을 생성하지 못했습니다');
        }

        console.log('AI 분석 완료: ' + data.questions.length + '문항');

        // officialAnswers 맵 자동 생성 (exam_registry 호환)
        data.officialAnswers = {};
        for (var i = 0; i < data.questions.length; i++) {
            var q = data.questions[i];
            data.officialAnswers[String(q.number)] = q.correct;
        }

        return data;
    });
}


// ═══════════════════════════════════════
// Gemini API 호출
// ═══════════════════════════════════════

function callGemini(systemPrompt, userPrompt) {
    return new Promise(function (resolve, reject) {
        var requestBody = JSON.stringify({
            contents: [
                { role: 'user', parts: [{ text: userPrompt }] }
            ],
            systemInstruction: {
                parts: [{ text: systemPrompt }]
            },
            generationConfig: {
                maxOutputTokens: MAX_OUTPUT_TOKENS,
                temperature: 0.1
            }
        });

        var apiPath = '/v1beta/models/' + MODEL + ':generateContent?key=' + GEMINI_API_KEY;

        var options = {
            hostname: 'generativelanguage.googleapis.com',
            port: 443,
            path: apiPath,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(requestBody)
            }
        };

        console.log('Gemini API 호출 중...');

        var req = https.request(options, function (res) {
            var body = '';
            res.on('data', function (chunk) { body += chunk; });
            res.on('end', function () {
                try {
                    var response = JSON.parse(body);

                    if (res.statusCode !== 200) {
                        reject(new Error('API 오류 (' + res.statusCode + '): ' +
                            (response.error ? response.error.message : body)));
                        return;
                    }

                    if (!response.candidates || !response.candidates[0] ||
                        !response.candidates[0].content || !response.candidates[0].content.parts ||
                        !response.candidates[0].content.parts[0]) {
                        reject(new Error('빈 응답'));
                        return;
                    }

                    resolve(response.candidates[0].content.parts[0].text);
                } catch (e) {
                    reject(new Error('응답 파싱 실패: ' + e.message));
                }
            });
        });

        req.on('error', function (e) {
            reject(new Error('네트워크 오류: ' + e.message));
        });

        req.write(requestBody);
        req.end();
    });
}


// ═══════════════════════════════════════
// 실행
// ═══════════════════════════════════════

main();
