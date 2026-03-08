#!/usr/bin/env node
/**
 * serve-review.js — Review Dashboard Server (port 3456)
 * Serves student correction table review dashboard
 * Discord-free standalone version with auto-extraction
 * Usage: node 04_scripts/serve-review.js
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PORT = process.env.REVIEW_PORT || 3456;
const ACCESS_TOKEN = process.env.REVIEW_TOKEN || null; // null = 인증 비활성화
const BASE_DIR = '/Users/haemin/projects/doc_design';
const TUTORING_DIR = path.join(BASE_DIR, '00_tutoring');
const HTML_FILE = path.join(BASE_DIR, '04_scripts', 'review-dashboard.html');
const REEXTRACT_NOTES_FILE = '_reextract_notes.json';

const VERAJIN_DIR = '/Users/haemin/projects/verajin';
const APPROVAL_STATE_PATH = path.join(VERAJIN_DIR, 'data', 'approval-state.json');
const CONFIG_PATH = path.join(VERAJIN_DIR, 'config', 'config.json');

/* ── Verajin module imports ── */
let runPreApproval, runPostApproval;
try {
  const orchestrator = require(path.join(VERAJIN_DIR, 'scripts/feedback-orchestrator'));
  runPreApproval = orchestrator.runPreApproval;
  runPostApproval = orchestrator.runPostApproval;
  console.log('[verajin] feedback-orchestrator 로드 성공');
} catch (e) {
  console.warn('[verajin] feedback-orchestrator 로드 실패:', e.message);
  runPreApproval = null;
  runPostApproval = null;
}

let classifyDirectory;
try {
  const classifier = require(path.join(VERAJIN_DIR, 'scripts/classify'));
  classifyDirectory = classifier.classifyDirectory;
  console.log('[verajin] classify 모듈 로드 성공');
} catch (e) {
  console.warn('[verajin] classify 모듈 로드 실패:', e.message);
  classifyDirectory = null;
}

function loadVerajinConfig() {
  try {
    return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
  } catch (e) {
    console.warn('verajin config 로드 실패:', e.message);
    return {};
  }
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript',
  '.css':  'text/css',
  '.json': 'application/json',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png':  'image/png',
  '.gif':  'image/gif',
  '.webp': 'image/webp',
  '.pdf':  'application/pdf',
};

/* ── Config ── */
let verajinConfig = null;
function loadConfig() {
  verajinConfig = loadVerajinConfig();
}
loadConfig();

/* ── Extraction / Generation status tracking ── */
const extractionStatus = new Map(); // key: "student_date", value: { status, startedAt, completedAt, result, error }
const generationStatus = new Map(); // key: "student_date", value: { status, startedAt, completedAt, pdfPath, error }

const EXTRACT_CONCURRENCY = 5;
let activeExtractions = 0;
const extractionQueue = [];
const GENERATION_CONCURRENCY = 1;
let activeGenerations = 0;
const generationQueue = [];

function enqueueExtraction(student, date) {
  return new Promise((resolve) => {
    const run = () => {
      activeExtractions++;
      doExtraction(student, date).then(result => {
        activeExtractions--;
        resolve(result);
        // Process next in queue
        if (extractionQueue.length > 0) {
          const next = extractionQueue.shift();
          next();
        }
      });
    };

    if (activeExtractions < EXTRACT_CONCURRENCY) {
      run();
    } else {
      extractionQueue.push(run);
    }
  });
}

async function doExtraction(student, date) {
  const key = `${student}_${date}`;
  extractionStatus.set(key, { status: 'running', startedAt: new Date().toISOString() });

  try {
    if (!runPreApproval) {
      throw new Error('feedback-orchestrator 모듈을 로드할 수 없습니다');
    }
    const config = loadVerajinConfig();
    const dateDir = path.join(TUTORING_DIR, student, 'input', date);
    const notes = readReextractNotes(dateDir);
    if (notes && (notes.sessionNote || Object.keys(notes.imageNotes || {}).length > 0)) {
      config.extractionNotes = notes;
    }
    const result = await runPreApproval({
      studentName: student,
      dateStr: date,
      config,
      skipDiscord: true,
    });
    extractionStatus.set(key, {
      status: result.success ? 'done' : 'error',
      startedAt: extractionStatus.get(key).startedAt,
      completedAt: new Date().toISOString(),
      result: { success: result.success, stepsCount: result.steps?.length || 0 },
      error: result.success ? null : 'Pre-approval 실패',
    });
    return result;
  } catch (e) {
    extractionStatus.set(key, {
      status: 'error',
      startedAt: extractionStatus.get(key).startedAt,
      completedAt: new Date().toISOString(),
      result: null,
      error: e.message,
    });
    return { success: false, error: e.message };
  }
}

/* ── Approval State helpers ── */
function readApprovalState() {
  try {
    return JSON.parse(fs.readFileSync(APPROVAL_STATE_PATH, 'utf8'));
  } catch (e) {
    return { pending: [], completed: [] };
  }
}

function writeApprovalState(state) {
  fs.writeFileSync(APPROVAL_STATE_PATH, JSON.stringify(state, null, 2), 'utf8');
}

function startGenerationJob(job) {
  const { key, run, onDone } = job;
  activeGenerations++;
  const prev = generationStatus.get(key) || {};
  generationStatus.set(key, {
    status: 'generating',
    queuedAt: prev.queuedAt || null,
    startedAt: new Date().toISOString(),
  });

  run()
    .then(result => onDone(null, result))
    .catch(err => onDone(err))
    .finally(() => {
      activeGenerations--;
      if (generationQueue.length > 0) {
        const next = generationQueue.shift();
        startGenerationJob(next);
      }
    });
}

function enqueueGeneration(student, date, run, onDone) {
  const key = `${student}_${date}`;
  const current = generationStatus.get(key);
  if (current && (current.status === 'generating' || current.status === 'queued')) {
    return current.status;
  }

  const job = { key, run, onDone };
  if (activeGenerations < GENERATION_CONCURRENCY) {
    startGenerationJob(job);
    return 'generating';
  }

  generationStatus.set(key, {
    status: 'queued',
    queuedAt: new Date().toISOString(),
  });
  generationQueue.push(job);
  return 'queued';
}

function listImageFiles(dateDir) {
  try {
    return fs.readdirSync(dateDir).filter(f => /\.(jpg|jpeg|png|gif|webp)$/i.test(f));
  } catch (_) {
    return [];
  }
}

function normalizeNoteText(value) {
  if (value == null) return '';
  return String(value).replace(/\r\n/g, '\n').trim();
}

function normalizeNotesData(raw, validImages = null) {
  const sessionNote = normalizeNoteText(raw?.sessionNote || '');
  const imageNotes = {};
  const src = raw && typeof raw.imageNotes === 'object' && raw.imageNotes ? raw.imageNotes : {};
  for (const [filename, note] of Object.entries(src)) {
    if (!filename || filename.includes('..')) continue;
    if (validImages && !validImages.has(filename)) continue;
    const text = normalizeNoteText(note);
    if (text) imageNotes[filename] = text;
  }
  return {
    sessionNote,
    imageNotes,
    updatedAt: raw?.updatedAt || null,
  };
}

function readReextractNotes(dateDir) {
  const notesPath = path.join(dateDir, REEXTRACT_NOTES_FILE);
  const validImages = new Set(listImageFiles(dateDir));
  if (!fs.existsSync(notesPath)) {
    return { sessionNote: '', imageNotes: {}, updatedAt: null };
  }
  try {
    const raw = JSON.parse(fs.readFileSync(notesPath, 'utf8'));
    return normalizeNotesData(raw, validImages);
  } catch (_) {
    return { sessionNote: '', imageNotes: {}, updatedAt: null };
  }
}

function writeReextractNotes(dateDir, notes) {
  const notesPath = path.join(dateDir, REEXTRACT_NOTES_FILE);
  const hasSession = !!normalizeNoteText(notes?.sessionNote);
  const hasImageNotes = notes?.imageNotes && Object.keys(notes.imageNotes).length > 0;

  if (!hasSession && !hasImageNotes) {
    if (fs.existsSync(notesPath)) {
      try { fs.unlinkSync(notesPath); } catch (_) {}
    }
    return { sessionNote: '', imageNotes: {}, updatedAt: null };
  }

  const payload = {
    sessionNote: normalizeNoteText(notes.sessionNote),
    imageNotes: notes.imageNotes || {},
    updatedAt: new Date().toISOString(),
  };
  fs.writeFileSync(notesPath, JSON.stringify(payload, null, 2), 'utf8');
  return payload;
}

function isSkippedCompletion(completedItem) {
  if (!completedItem) return false;
  const status = String(completedItem.status || '').trim();
  const reason = String(completedItem.reason || '').trim();
  return (
    status === 'skipped' ||
    status === 'skipped-all-correct' ||
    reason === 'skipped' ||
    reason === '100점'
  );
}

function isDeliveredCompletion(completedItem) {
  if (!completedItem) return false;
  const status = String(completedItem.status || '').trim();
  if (status !== 'completed') return false;
  if (!completedItem.pdfPath) return false;
  // 엄격 모드: Drive 업로드 성공이 명시적으로 확인된 경우만 "전송완료"
  return completedItem.driveUpload?.success === true;
}

function runtimeRowId(row, rowIndex) {
  const src = row?.sourceImageIndex == null ? 'none' : row.sourceImageIndex;
  const q = row?.q == null ? 'unknown' : row.q;
  return `${src}::${q}::${rowIndex}`;
}

/* ── HTTP helpers ── */
function sendJSON(res, data, status = 200) {
  const body = JSON.stringify(data, null, 2);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Length': Buffer.byteLength(body),
  });
  res.end(body);
}

function sendError(res, status, message) {
  sendJSON(res, { error: message }, status);
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => { data += chunk; });
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch (e) {
        reject(new Error('Invalid JSON body'));
      }
    });
    req.on('error', reject);
  });
}

/**
 * GET /api/students
 */
function handleStudents(res) {
  let students;
  try {
    students = fs.readdirSync(TUTORING_DIR).filter(name => {
      const p = path.join(TUTORING_DIR, name);
      return fs.statSync(p).isDirectory();
    });
  } catch (e) {
    return sendError(res, 500, '학생 폴더를 읽을 수 없습니다: ' + e.message);
  }

  // Read approval state once
  const approvalState = readApprovalState();

  const result = [];

  for (const student of students) {
    const inputDir = path.join(TUTORING_DIR, student, 'input');
    if (!fs.existsSync(inputDir)) continue;

    let dates;
    try {
      dates = fs.readdirSync(inputDir).filter(d => {
        const p = path.join(inputDir, d);
        return fs.statSync(p).isDirectory() && /^\d{6}$/.test(d);
      }).sort().reverse();
    } catch (e) {
      continue;
    }

    const dateEntries = [];
    for (const date of dates) {
      const dateDir = path.join(inputDir, date);
      const mergedPath = path.join(dateDir, '_merged_answers.json');
      const summaryPath = path.join(dateDir, '_summary.json');

      const entry = { date, hasMerged: false, hasSummary: false };

      if (fs.existsSync(mergedPath)) {
        entry.hasMerged = true;
        try {
          const merged = JSON.parse(fs.readFileSync(mergedPath, 'utf8'));
          entry.totalQ = merged.totalQ ?? null;
          entry.wrongQ = merged.wrongQ ?? null;
          entry.correctRate = merged.correctRate ?? null;
        } catch (_) {}
      }

      if (fs.existsSync(summaryPath)) {
        entry.hasSummary = true;
        try {
          const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));
          entry.subjects = [...new Set((summary.images || []).map(i => i.subject).filter(Boolean))];
          entry.feedbackReady = summary.feedbackReady ?? false;
          const imgs = summary.images || [];
          entry.feedbackImageCount = imgs.filter(i => i.category === 'FEEDBACK' || i.category === 'external-textbook').length;
        } catch (_) {}
      }

      // Also check _image_index.json for feedbackImageCount (more reliable)
      const imageIndexPath = path.join(dateDir, '_image_index.json');
      if (fs.existsSync(imageIndexPath)) {
        try {
          const idx = JSON.parse(fs.readFileSync(imageIndexPath, 'utf8'));
          entry.feedbackImageCount = (idx.feedbackImages || []).length;
          if (!entry.hasSummary) entry.hasSummary = true;
        } catch (_) {}
      }

      // Check if agent1 extraction was attempted
      const agent1Path = path.join(dateDir, '_agent1_results.json');
      entry.hasAgent1 = fs.existsSync(agent1Path);

      // Check approval status
      const pendingItem = approvalState.pending?.find(p => p.student === student && p.date === date);
      const completedItem = (approvalState.completed || []).find(c => c.student === student && c.date === date);
      const completedAsSkipped = isSkippedCompletion(completedItem);
      const completedAsDelivered = isDeliveredCompletion(completedItem);
      if (pendingItem && pendingItem.approved) {
        entry.approved = true;
      } else if (completedItem) {
        entry.approved = true;
        entry.completedStatus = completedAsSkipped ? 'skipped' : completedItem.status; // normalize legacy skipped records
        entry.completedPdfPath = completedItem.pdfPath || null;
        entry.completedReason = completedItem.reason || null;
      }

      // count images
      try {
        const files = fs.readdirSync(dateDir);
        entry.imageCount = files.filter(f => /\.(jpg|jpeg|png|gif|webp)$/i.test(f)).length;
      } catch (_) {
        entry.imageCount = 0;
      }

      // Check if PDF exists on disk
      const outDir = path.join(TUTORING_DIR, student, 'output', date);
      entry.hasPdf = false;
      try {
        if (fs.existsSync(outDir)) {
          const outFiles = fs.readdirSync(outDir);
          entry.hasPdf = outFiles.some(f => f.endsWith('.pdf'));
        }
      } catch (_) {}

      // Check extraction status
      const extKey = `${student}_${date}`;
      if (extractionStatus.has(extKey)) {
        entry.extractionStatus = extractionStatus.get(extKey).status;
      }

      // Check generation status
      if (generationStatus.has(extKey)) {
        entry.generationStatus = generationStatus.get(extKey).status;
      }

      // Compute completionStatus for sidebar badge
      if (completedAsSkipped) {
        entry.completionStatus = 'skipped'; // 건너뛰기
      } else if (
        entry.extractionStatus === 'running' ||
        entry.generationStatus === 'generating' ||
        entry.generationStatus === 'queued'
      ) {
        entry.completionStatus = 'processing'; // 진행중
      } else if (completedAsDelivered) {
        entry.completionStatus = 'sent'; // 전송완료
      } else if (entry.hasPdf) {
        entry.completionStatus = 'pdf-done'; // PDF완료
      } else if (entry.hasMerged && entry.wrongQ === 0) {
        entry.completionStatus = 'perfect'; // 전원정답
      } else if (entry.hasMerged && entry.totalQ > 0 && entry.wrongQ === entry.totalQ) {
        entry.completionStatus = 'all-wrong'; // 전원오답 (데이터 오류 의심)
      } else if (entry.hasMerged && entry.wrongQ > 0) {
        entry.completionStatus = 'need-review'; // 검토필요
      } else if (!entry.hasSummary && entry.imageCount > 0) {
        entry.completionStatus = 'need-classify'; // 분류필요
      } else if (entry.hasSummary && !entry.hasMerged && (entry.feedbackImageCount || 0) > 0 && entry.hasAgent1) {
        entry.completionStatus = 'extract-fail'; // 추출실패 (agent1 실행했으나 merge 안됨)
      } else if (entry.hasSummary && !entry.hasMerged && (entry.feedbackImageCount || 0) > 0) {
        entry.completionStatus = 'need-extract'; // 추출필요
      } else if (entry.hasSummary && (entry.feedbackImageCount || 0) === 0) {
        entry.completionStatus = 'no-feedback'; // 피드백 대상 아님 (전부 제외됨)
      } else {
        entry.completionStatus = 'no-data'; // 데이터없음
      }

      dateEntries.push(entry);
    }

    if (dateEntries.length > 0) {
      result.push({ student, dates: dateEntries });
    }
  }

  result.sort((a, b) => {
    const aLatest = a.dates[0]?.date ?? '';
    const bLatest = b.dates[0]?.date ?? '';
    return bLatest.localeCompare(aLatest);
  });

  sendJSON(res, result);
}

/**
 * GET /api/review/:student/:date
 */
function handleReview(res, student, date) {
  const dateDir = path.join(TUTORING_DIR, student, 'input', date);

  if (!fs.existsSync(dateDir)) {
    return sendError(res, 404, `폴더를 찾을 수 없습니다: ${student}/${date}`);
  }

  const result = { student, date };
  result.reextractNotes = readReextractNotes(dateDir);

  // Merged answers
  const mergedPath = path.join(dateDir, '_merged_answers.json');
  if (fs.existsSync(mergedPath)) {
    try {
      result.mergedAnswers = JSON.parse(fs.readFileSync(mergedPath, 'utf8'));
    } catch (e) {
      result.mergedAnswersError = e.message;
    }
  }

  // Summary
  const summaryPath = path.join(dateDir, '_summary.json');
  if (fs.existsSync(summaryPath)) {
    try {
      result.summary = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));
    } catch (e) {
      result.summaryError = e.message;
    }
  }

  // Images
  try {
    const files = fs.readdirSync(dateDir);
    result.images = files
      .filter(f => /\.(jpg|jpeg|png|gif|webp)$/i.test(f))
      .sort();
  } catch (e) {
    result.images = [];
  }

  // Excluded images list (from summary or image_index)
  result.excludedImages = [];
  try {
    const idxPath = path.join(dateDir, '_image_index.json');
    if (fs.existsSync(idxPath)) {
      const idx = JSON.parse(fs.readFileSync(idxPath, 'utf8'));
      result.excludedImages = (idx.excludedImages || []).map(e => e.filename || e);
    } else if (result.summary && result.summary.images) {
      result.excludedImages = result.summary.images
        .filter(i => i.category === 'EXCLUDE')
        .map(i => i.file);
    }
  } catch (e) { /* ignore */ }

  // Build imageQuestionMap: merged rows + agent1/agent2 source mapping fallback
  result.imageQuestionMap = {};
  const imageIndexPath = path.join(dateDir, '_image_index.json');
  const agent1Path = path.join(dateDir, '_agent1_results.json');
  const agent2Path = path.join(dateDir, '_agent2_results.json');
  try {
    let feedbackFiles = [];
    // Get ordered FEEDBACK image filenames
    if (fs.existsSync(imageIndexPath)) {
      const idx = JSON.parse(fs.readFileSync(imageIndexPath, 'utf8'));
      feedbackFiles = (idx.feedbackImages || []).map(e => e.filename);
    } else if (result.summary && result.summary.images) {
      feedbackFiles = result.summary.images
        .filter(i => i.category === 'FEEDBACK' || i.category === 'external-textbook')
        .map(i => i.file);
    }

    if (feedbackFiles.length > 0 && (fs.existsSync(agent1Path) || fs.existsSync(agent2Path))) {
      let answers = [];
      if (fs.existsSync(agent1Path)) {
        try {
          const agent1 = JSON.parse(fs.readFileSync(agent1Path, 'utf8'));
          answers = Array.isArray(agent1.answers) ? agent1.answers : [];
        } catch (_) {
          answers = [];
        }
      }

      // Build feedbackFile→fullImageIndex lookup (needed for enrichment first)
      const feedbackToFull = {};
      for (let fi = 0; fi < feedbackFiles.length; fi++) {
        const fullIdx = result.images.indexOf(feedbackFiles[fi]);
        if (fullIdx >= 0) feedbackToFull[fi] = fullIdx;
      }
      const feedbackSet = new Set(feedbackFiles);
      const toFullImageIndex = (rawIndex) => {
        const idx = Number(rawIndex);
        if (!Number.isInteger(idx) || idx < 0) return null;
        // Primary path: merged/agent sourceImageIndex is feedback-index based (0..feedback-1).
        // Always prefer explicit feedback->full mapping first, otherwise excluded pages
        // interleaved in result.images can cause +N / -N page drift.
        if (Object.prototype.hasOwnProperty.call(feedbackToFull, idx)) {
          return feedbackToFull[idx];
        }
        // Fallback for legacy rows that may already store full-image index.
        if (result.images[idx] && feedbackSet.has(result.images[idx])) return idx;
        return idx;
      };

      // Enrich merged rows with sourceImageIndex (converted to full images array index)
      if (result.mergedAnswers && result.mergedAnswers.rows) {
        const merged = result.mergedAnswers;
        for (const row of merged.rows) {
          if (row.sourceImageIndex != null) {
            const converted = toFullImageIndex(row.sourceImageIndex);
            row.sourceImageIndex = converted;
          }
        }

        if (answers.length > 0 && answers[0].sourceImageIndex != null) {
          const qToIdx = {};
          for (const a of answers) {
            const qNo = a.questionNo ?? a.q;
            if (qNo != null && a.sourceImageIndex != null) {
              qToIdx[String(qNo)] = toFullImageIndex(a.sourceImageIndex);
            }
          }
          for (const row of merged.rows) {
            if (row.sourceImageIndex == null && row.q != null) {
              row.sourceImageIndex = qToIdx[String(row.q)] ?? null;
            }
          }
        } else if (feedbackFiles.length > 0) {
          // Check if rows have _pageGroup (from duplicate Q merge)
          const hasPageGroup = merged.rows.some(r => r._pageGroup != null);
          if (hasPageGroup) {
            // Map _pageGroup to feedback image index
            // Collect unique page groups in order
            const groups = [...new Set(merged.rows.filter(r => r._pageGroup != null).map(r => r._pageGroup))].sort((a,b) => a - b);
            for (const row of merged.rows) {
              if (row.sourceImageIndex == null && row._pageGroup != null) {
                const groupIdx = groups.indexOf(row._pageGroup);
                if (groupIdx >= 0) {
                  // Clamp to last feedback image if more groups than images
                  const fbIdx = Math.min(groupIdx, feedbackFiles.length - 1);
                  row.sourceImageIndex = toFullImageIndex(fbIdx);
                }
              }
            }
          } else if (answers.length > 0) {
            // Legacy naive heuristic: divide evenly
            const perImage = Math.ceil(answers.length / feedbackFiles.length);
            for (let ri = 0; ri < merged.rows.length; ri++) {
              if (merged.rows[ri].sourceImageIndex == null) {
                const aIdx = answers.findIndex(a => String(a.questionNo ?? a.q) === String(merged.rows[ri].q));
                if (aIdx >= 0) {
                  const feedbackIdx = Math.floor(aIdx / perImage);
                  merged.rows[ri].sourceImageIndex = toFullImageIndex(feedbackIdx);
                }
              }
            }
          }
        }

        // Agent2 fallback: Agent1이 비어있거나 sourceImageIndex 누락 시 문제-이미지 매핑을 보강
        if (merged.rows.some(r => r.sourceImageIndex == null) && fs.existsSync(agent2Path)) {
          try {
            const agent2 = JSON.parse(fs.readFileSync(agent2Path, 'utf8'));
            const problems = Array.isArray(agent2.problems) ? agent2.problems : [];
            if (problems.length > 0) {
              const uniqueByQ = new Map();
              const conflictedQ = new Set();
              const orderedByQ = new Map();

              for (const p of problems) {
                const qNo = p.questionNo ?? p.q;
                const sourceIdx = toFullImageIndex(p.sourceImageIndex);
                if (qNo == null || sourceIdx == null) continue;
                const qKey = String(qNo);

                if (!orderedByQ.has(qKey)) orderedByQ.set(qKey, []);
                orderedByQ.get(qKey).push(sourceIdx);

                if (!uniqueByQ.has(qKey)) {
                  uniqueByQ.set(qKey, sourceIdx);
                } else if (uniqueByQ.get(qKey) !== sourceIdx) {
                  conflictedQ.add(qKey);
                }
              }

              // Pass 1: unique question mapping
              for (const row of merged.rows) {
                if (row.sourceImageIndex != null || row.q == null) continue;
                const qKey = String(row.q);
                if (!conflictedQ.has(qKey) && uniqueByQ.has(qKey)) {
                  row.sourceImageIndex = uniqueByQ.get(qKey);
                }
              }

              // Pass 2: conflicted question mapping by occurrence order
              const cursorByQ = new Map();
              for (const row of merged.rows) {
                if (row.q == null) continue;
                const qKey = String(row.q);
                if (!conflictedQ.has(qKey)) continue;
                const seq = orderedByQ.get(qKey) || [];
                const cursor = cursorByQ.get(qKey) || 0;
                if (cursor < seq.length) {
                  if (row.sourceImageIndex == null) {
                    row.sourceImageIndex = seq[cursor];
                  }
                  cursorByQ.set(qKey, cursor + 1);
                }
              }
            }
          } catch (_) {
            // agent2 fallback 실패 시 기존 동작 유지
          }
        }
      }

      // Build imageQuestionMap from enriched merged rows (after sourceImageIndex is set)
      // Uses rowId with row index to avoid collisions on duplicate Q numbers
      if (result.mergedAnswers && result.mergedAnswers.rows) {
        const fullToFeedback = {};
        for (const [fi, fullIdx] of Object.entries(feedbackToFull)) {
          fullToFeedback[fullIdx] = feedbackFiles[fi];
        }
        for (let ri = 0; ri < result.mergedAnswers.rows.length; ri++) {
          const row = result.mergedAnswers.rows[ri];
          const rowId = runtimeRowId(row, ri);
          row.rowId = rowId;
          if (row.sourceImageIndex != null && row.q != null) {
            const fname = fullToFeedback[row.sourceImageIndex];
            if (fname) {
              if (!result.imageQuestionMap[fname]) result.imageQuestionMap[fname] = [];
              result.imageQuestionMap[fname].push(rowId);
            }
          }
        }
      }
    }
  } catch (e) {
    console.error(`[serve-review] imageQuestionMap 빌드 에러: ${e.message}`);
  }

  // Ensure all rows always have unique rowId (even when image map generation is skipped)
  if (result.mergedAnswers && result.mergedAnswers.rows) {
    for (let ri = 0; ri < result.mergedAnswers.rows.length; ri++) {
      const row = result.mergedAnswers.rows[ri];
      row.rowId = runtimeRowId(row, ri);
    }
  }

  // Approval status
  const approvalState = readApprovalState();
  const pendingItem = approvalState.pending?.find(p => p.student === student && p.date === date);
  const completedItem = (approvalState.completed || []).find(c => c.student === student && c.date === date);
  if (pendingItem && pendingItem.approved) {
    result.approved = true;
    result.approvedAt = pendingItem.approvedAt;
  } else if (completedItem) {
    result.approved = true;
  }

  // Check if PDF exists
  const outputDir = path.join(TUTORING_DIR, student, 'output', date);
  result.hasPdf = false;
  result.pdfFileName = null;
  try {
    if (fs.existsSync(outputDir)) {
      const outFiles = fs.readdirSync(outputDir);
      const pdfFile = outFiles.find(f => f.endsWith('.pdf'));
      if (pdfFile) {
        result.hasPdf = true;
        result.pdfFileName = pdfFile;
      }
    }
  } catch (_) {}

  sendJSON(res, result);
}

/**
 * GET /images/:student/:date/:filename
 */
function handleImage(res, student, date, filename) {
  if (filename.includes('..') || student.includes('..') || date.includes('..')) {
    return sendError(res, 400, '잘못된 경로입니다');
  }

  const filePath = path.join(TUTORING_DIR, student, 'input', date, filename);

  if (!fs.existsSync(filePath)) {
    return sendError(res, 404, '이미지를 찾을 수 없습니다');
  }

  const ext = path.extname(filename).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  let data;
  try {
    data = fs.readFileSync(filePath);
  } catch (e) {
    return sendError(res, 500, '이미지를 읽을 수 없습니다: ' + e.message);
  }

  res.writeHead(200, {
    'Content-Type': contentType,
    'Content-Length': data.length,
    'Cache-Control': 'public, max-age=3600',
    'Access-Control-Allow-Origin': '*',
  });
  res.end(data);
}

/**
 * POST /api/update-answer/:student/:date
 * body: { q, rowIdx, rowId, field, value }
 *   field: 'studentAnswer' | 'correct' | 'ox'
 *   rowIdx: 행 인덱스 (중복 Q번호 대응)
 *   rowId: 고유 행 식별자 (우선 사용)
 *
 * Legacy: { q, studentAnswer } 도 지원 (하위호환)
 */
async function handleUpdateAnswer(req, res, student, date) {
  let body;
  try {
    body = await parseBody(req);
  } catch (e) {
    return sendError(res, 400, e.message);
  }

  const dateDir = path.join(TUTORING_DIR, student, 'input', date);
  const mergedPath = path.join(dateDir, '_merged_answers.json');

  if (!fs.existsSync(mergedPath)) {
    return sendError(res, 404, '_merged_answers.json을 찾을 수 없습니다');
  }

  let merged;
  try {
    merged = JSON.parse(fs.readFileSync(mergedPath, 'utf8'));
  } catch (e) {
    return sendError(res, 500, '파일 읽기 실패: ' + e.message);
  }

  if (!merged.rows) {
    return sendError(res, 400, 'rows 필드가 없습니다');
  }

  // Find the target row (rowId 우선, 중복 q 안전 처리)
  let row;
  if (body.rowId != null) {
    const rowIdRaw = String(body.rowId);
    row = merged.rows.find((r, idx) => {
      const rowId = r.rowId || runtimeRowId(r, idx);
      return String(rowId) === rowIdRaw;
    });

    // Fallback: rowId src 부분이 API 표시용 인덱스로 변환된 경우를 대비해
    // 마지막 rowIndex 토큰으로 안정적으로 재매칭
    if (!row) {
      const m = rowIdRaw.match(/::(\d+)$/);
      if (m) {
        const idx = Number(m[1]);
        if (Number.isInteger(idx) && idx >= 0 && idx < merged.rows.length) {
          const candidate = merged.rows[idx];
          if (!body.q || String(candidate.q) === String(body.q)) {
            row = candidate;
          }
        }
      }
    }
  }

  // rowId가 없는 구버전 호출만 rowIdx 사용
  if (!row && body.rowId == null && body.rowIdx != null && body.rowIdx >= 0 && body.rowIdx < merged.rows.length) {
    const candidate = merged.rows[body.rowIdx];
    if (!body.q || String(candidate.q) === String(body.q)) {
      row = candidate;
    }
  }

  // 최후 fallback: q가 유일할 때만 허용 (중복 q 오매칭 방지)
  if (!row && body.q != null) {
    const matched = merged.rows.filter(r => String(r.q) === String(body.q));
    if (matched.length === 1) row = matched[0];
  }

  if (!row) {
    return sendError(res, 404, `문제를 찾을 수 없습니다`);
  }

  // Determine field and value
  const field = body.field || 'studentAnswer';
  const value = body.value ?? body.studentAnswer;

  if (value == null) {
    return sendError(res, 400, 'value 필드가 필요합니다');
  }

  // Apply edit
  if (field === 'studentAnswer') {
    row.studentAnswer = value;
    // Auto-recalculate O/X if correct is known
    if (row.correct && row.correct !== '?' && row.correct !== '[object Object]') {
      const norm = (a) => String(a).trim().replace(/\s+/g, ' ');
      row.ox = norm(row.studentAnswer) === norm(row.correct) ? 'O' : 'X';
    }
  } else if (field === 'correct') {
    row.correct = value;
    // Auto-recalculate O/X
    if (value && value !== '?' && row.studentAnswer && row.studentAnswer !== '미응답') {
      const norm = (a) => String(a).trim().replace(/\s+/g, ' ');
      row.ox = norm(row.studentAnswer) === norm(value) ? 'O' : 'X';
    }
  } else if (field === 'ox') {
    row.ox = value; // Direct O/X override
  }

  // Recalculate totalQ / wrongQ / correctRate
  const wrongRows = merged.rows.filter(r => r.ox === 'X');
  merged.totalQ = merged.rows.length;
  merged.wrongQ = wrongRows.length;
  if (merged.totalQ > 0) {
    const correctCount = merged.rows.filter(r => r.ox === 'O').length;
    merged.correctRate = Math.round(correctCount / merged.totalQ * 100) + '%';
  }

  // Rebuild table string
  let table = '| Q# | 학생답 | 정답 | O/X |\n|----|--------|------|-----|\n';
  for (const r of merged.rows) {
    table += `| Q${r.q} | ${r.studentAnswer ?? ''} | ${r.correct ?? '?'} | ${r.ox ?? '?'} |\n`;
  }
  merged.table = table;

  try {
    fs.writeFileSync(mergedPath, JSON.stringify(merged, null, 2), 'utf8');
  } catch (e) {
    return sendError(res, 500, '파일 저장 실패: ' + e.message);
  }

  sendJSON(res, {
    success: true,
    row,
    totalQ: merged.totalQ,
    wrongQ: merged.wrongQ,
    correctRate: merged.correctRate,
  });
}

/**
 * POST /api/extract/:student/:date — 단일 항목 데이터 추출 시작
 */
function handleExtract(res, student, date) {
  const key = `${student}_${date}`;

  // Already running?
  const current = extractionStatus.get(key);
  if (current && current.status === 'running') {
    return sendJSON(res, { status: 'already-running', key });
  }

  // Fire and forget
  enqueueExtraction(student, date);

  sendJSON(res, { status: 'started', key });
}

/**
 * POST /api/re-extract-answers/:student/:date — 답만 재추출 (agent1만 재실행)
 * 기존 _agent1_results.json, _merged_answers.json 삭제 후 재추출
 */
async function handleReExtractAnswers(res, student, date) {
  const key = `${student}_${date}`;
  const current = extractionStatus.get(key);
  if (current && current.status === 'running') {
    return sendJSON(res, { status: 'already-running', key });
  }

  const dateDir = path.join(TUTORING_DIR, student, 'input', date);
  if (!fs.existsSync(dateDir)) {
    return sendError(res, 404, `폴더를 찾을 수 없습니다: ${student}/${date}`);
  }

  // Delete old results to force re-extraction
  const filesToDelete = ['_agent1_results.json', '_merged_answers.json', '_merged_answers.md'];
  for (const f of filesToDelete) {
    const fp = path.join(dateDir, f);
    try { if (fs.existsSync(fp)) fs.unlinkSync(fp); } catch (_) {}
  }

  // Fire extraction
  enqueueExtraction(student, date);
  sendJSON(res, { status: 'started', key, message: '답 재추출 시작 (agent1 재실행)' });
}

/**
 * GET /api/notes/:student/:date — 재추출 노트 조회
 */
function handleGetNotes(res, student, date) {
  const dateDir = path.join(TUTORING_DIR, student, 'input', date);
  if (!fs.existsSync(dateDir)) {
    return sendError(res, 404, `폴더를 찾을 수 없습니다: ${student}/${date}`);
  }
  const notes = readReextractNotes(dateDir);
  sendJSON(res, { success: true, notes });
}

/**
 * PUT /api/notes/:student/:date — 재추출 노트 저장
 * body: { sessionNote: string, imageNotes: { [filename]: string } }
 */
async function handleSaveNotes(req, res, student, date) {
  let body;
  try {
    body = await parseBody(req);
  } catch (e) {
    return sendError(res, 400, e.message);
  }

  const dateDir = path.join(TUTORING_DIR, student, 'input', date);
  if (!fs.existsSync(dateDir)) {
    return sendError(res, 404, `폴더를 찾을 수 없습니다: ${student}/${date}`);
  }

  const validImages = new Set(listImageFiles(dateDir));
  const normalized = normalizeNotesData(body, validImages);
  const saved = writeReextractNotes(dateDir, normalized);
  sendJSON(res, { success: true, notes: saved });
}

/**
 * DELETE /api/notes/:student/:date — 재추출 노트 전체 삭제
 */
function handleDeleteNotes(res, student, date) {
  const dateDir = path.join(TUTORING_DIR, student, 'input', date);
  if (!fs.existsSync(dateDir)) {
    return sendError(res, 404, `폴더를 찾을 수 없습니다: ${student}/${date}`);
  }
  const cleared = writeReextractNotes(dateDir, { sessionNote: '', imageNotes: {} });
  sendJSON(res, { success: true, notes: cleared });
}

/**
 * DELETE /api/notes/:student/:date/image/:filename — 이미지별 노트 삭제
 */
function handleDeleteImageNote(res, student, date, filename) {
  if (!filename || filename.includes('..')) {
    return sendError(res, 400, '잘못된 파일명입니다');
  }
  const dateDir = path.join(TUTORING_DIR, student, 'input', date);
  if (!fs.existsSync(dateDir)) {
    return sendError(res, 404, `폴더를 찾을 수 없습니다: ${student}/${date}`);
  }

  const notes = readReextractNotes(dateDir);
  if (notes.imageNotes && Object.prototype.hasOwnProperty.call(notes.imageNotes, filename)) {
    delete notes.imageNotes[filename];
  }
  const saved = writeReextractNotes(dateDir, notes);
  sendJSON(res, { success: true, notes: saved });
}

/**
 * POST /api/skip/:student/:date — 피드백 건너뛰기
 */
function handleSkip(res, student, date) {
  const state = readApprovalState();

  // Already completed?
  const existing = (state.completed || []).find(c => c.student === student && c.date === date);
  if (existing) {
    return sendJSON(res, { success: true, message: '이미 처리됨', status: existing.reason || existing.status });
  }

  // Remove from pending if exists
  const idx = (state.pending || []).findIndex(p => p.student === student && p.date === date);
  if (idx !== -1) state.pending.splice(idx, 1);

  if (!state.completed) state.completed = [];
  state.completed.push({
    student,
    date,
    status: 'skipped',
    reason: 'skipped',
    approvedAt: new Date().toISOString(),
  });
  writeApprovalState(state);

  return sendJSON(res, { success: true, status: 'skipped' });
}

/**
 * POST /api/add-answer-row/:student/:date — 수동 문제 추가
 * body: { q, studentAnswer, correct, ox }
 */
async function handleAddAnswerRow(req, res, student, date) {
  let body;
  try { body = await parseBody(req); } catch (e) { return sendError(res, 400, e.message); }

  const dateDir = path.join(TUTORING_DIR, student, 'input', date);
  const mergedPath = path.join(dateDir, '_merged_answers.json');

  if (!fs.existsSync(mergedPath)) {
    return sendError(res, 404, '_merged_answers.json을 찾을 수 없습니다');
  }

  let merged;
  try { merged = JSON.parse(fs.readFileSync(mergedPath, 'utf8')); } catch (e) {
    return sendError(res, 500, '파일 읽기 실패: ' + e.message);
  }

  if (!merged.rows) merged.rows = [];

  const newRow = {
    q: body.q || `NEW-${merged.rows.length + 1}`,
    studentAnswer: body.studentAnswer || '미응답',
    correct: body.correct || '?',
    ox: body.ox || '?',
    sourceImageIndex: body.sourceImageIndex ?? null,
    manual: true,
  };
  merged.rows.push(newRow);

  // Recalculate stats
  merged.totalQ = merged.rows.length;
  merged.wrongQ = merged.rows.filter(r => r.ox === 'X').length;
  const correctCount = merged.rows.filter(r => r.ox === 'O').length;
  merged.correctRate = merged.totalQ > 0 ? Math.round(correctCount / merged.totalQ * 100) + '%' : '0%';

  try { fs.writeFileSync(mergedPath, JSON.stringify(merged, null, 2), 'utf8'); } catch (e) {
    return sendError(res, 500, '파일 저장 실패: ' + e.message);
  }

  sendJSON(res, { success: true, row: newRow, totalQ: merged.totalQ, wrongQ: merged.wrongQ, correctRate: merged.correctRate });
}

/**
 * POST /api/extract-all — 데이터 없는 항목 전체 자동 추출
 */
function handleExtractAll(res) {
  let students;
  try {
    students = fs.readdirSync(TUTORING_DIR).filter(name => {
      const p = path.join(TUTORING_DIR, name);
      return fs.statSync(p).isDirectory();
    });
  } catch (e) {
    return sendError(res, 500, '학생 폴더 읽기 실패: ' + e.message);
  }

  const items = [];
  let started = 0;
  let skipped = 0;
  const approvalState = readApprovalState();
  const completedSet = new Set(
    (approvalState.completed || []).map(c => `${c.student}_${c.date}`)
  );

  for (const student of students) {
    const inputDir = path.join(TUTORING_DIR, student, 'input');
    if (!fs.existsSync(inputDir)) continue;

    let dates;
    try {
      dates = fs.readdirSync(inputDir).filter(d => {
        const p = path.join(inputDir, d);
        return fs.statSync(p).isDirectory() && /^\d{6}$/.test(d);
      });
    } catch (e) {
      continue;
    }

    for (const date of dates) {
      const dateDir = path.join(inputDir, date);
      const mergedPath = path.join(dateDir, '_merged_answers.json');
      const summaryPath = path.join(dateDir, '_summary.json');

      // Check if has images
      let imageCount = 0;
      try {
        const files = fs.readdirSync(dateDir);
        imageCount = files.filter(f => /\.(jpg|jpeg|png|gif|webp)$/i.test(f)).length;
      } catch (_) {}

      if (imageCount === 0) continue;

      const key = `${student}_${date}`;

      // Already completed (approved/sent/skipped/no-feedback 처리됨)
      if (completedSet.has(key)) {
        items.push({ student, date, status: 'already-completed', key });
        skipped++;
        continue;
      }

      // Already extracted data exists → do not auto re-extract
      if (fs.existsSync(mergedPath)) {
        items.push({ student, date, status: 'already-extracted', key });
        skipped++;
        continue;
      }

      // No summary = classification not done yet
      if (!fs.existsSync(summaryPath)) {
        items.push({ student, date, status: 'no-summary', key });
        skipped++;
        continue;
      }

      // Check if has feedback images (skip if no feedback target)
      let feedbackImageCount = 0;
      const imageIndexPath = path.join(dateDir, '_image_index.json');
      if (fs.existsSync(imageIndexPath)) {
        try {
          const idx = JSON.parse(fs.readFileSync(imageIndexPath, 'utf8'));
          feedbackImageCount = (idx.feedbackImages || []).length;
        } catch (_) {}
      } else {
        try {
          const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));
          const imgs = summary.images || [];
          feedbackImageCount = imgs.filter(i => i.category === 'FEEDBACK' || i.category === 'external-textbook' || i.category === 'our-textbook').length;
        } catch (_) {}
      }

      if (feedbackImageCount === 0) {
        items.push({ student, date, status: 'no-feedback', key });
        skipped++;
        continue;
      }

      // Already running?
      const current = extractionStatus.get(key);
      if (current && current.status === 'running') {
        items.push({ student, date, status: 'already-running', key });
        skipped++;
        continue;
      }

      // Enqueue extraction
      enqueueExtraction(student, date);
      items.push({ student, date, status: 'started', key });
      started++;
    }
  }

  sendJSON(res, {
    total: items.length,
    started,
    skipped,
    items,
  });
}

/**
 * GET /api/extract-status — 추출 진행 상태
 */
function handleExtractStatus(res) {
  const result = {};
  for (const [key, value] of extractionStatus) {
    result[key] = value;
  }
  sendJSON(res, result);
}

/**
 * POST /api/approve/:student/:date — Discord 없이 직접 승인
 * body (optional): { corrections: "12: 2, 14: 3" }
 */
async function handleApprove(req, res, student, date) {
  let body;
  try {
    body = await parseBody(req);
  } catch (e) {
    return sendError(res, 400, e.message);
  }

  const corrections = body.corrections || null;

  const state = readApprovalState();

  // Re-approval: remove old completed entry and delete old PDF
  const completedIdx = (state.completed || []).findIndex(c => c.student === student && c.date === date);
  if (completedIdx !== -1) {
    state.completed.splice(completedIdx, 1);
    // Delete old PDF/HTML outputs
    const outputDir = path.join(TUTORING_DIR, student, 'output', date);
    try {
      if (fs.existsSync(outputDir)) {
        for (const f of fs.readdirSync(outputDir)) {
          if (f.endsWith('.pdf') || f.endsWith('.html')) {
            fs.unlinkSync(path.join(outputDir, f));
          }
        }
      }
    } catch (_) {}
    console.log(`[approve] 재승인: ${student}/${date} 기존 승인 삭제 + PDF 정리`);
  }

  // Read merged answers
  const dateDir = path.join(TUTORING_DIR, student, 'input', date);
  const mergedPath = path.join(dateDir, '_merged_answers.json');
  let wrongQ = null;
  if (fs.existsSync(mergedPath)) {
    try {
      const merged = JSON.parse(fs.readFileSync(mergedPath, 'utf8'));
      wrongQ = merged.wrongQ ?? null;
    } catch (_) {}
  }

  // Remove from pending if exists
  const idx = (state.pending || []).findIndex(p => p.student === student && p.date === date);
  if (idx !== -1) {
    state.pending.splice(idx, 1);
  }

  // 100점 case: no feedback sheet needed
  if (wrongQ === 0 && !corrections) {
    if (!state.completed) state.completed = [];
    state.completed.push({
      student,
      date,
      status: 'skipped',
      reason: '100점',
      approvedAt: new Date().toISOString(),
    });
    writeApprovalState(state);
    return sendJSON(res, { status: 'skipped', reason: '100점', wrongQ: 0 });
  }

  // Has wrong answers or corrections -> generate feedback sheet
  if (!state.completed) state.completed = [];
  state.completed.push({
    student,
    date,
    status: 'approved',
    approvedAt: new Date().toISOString(),
    corrections: corrections || null,
  });
  writeApprovalState(state);

  // If wrongQ > 0, start feedback generation asynchronously
  if ((wrongQ > 0 || corrections) && runPostApproval) {
    const key = `${student}_${date}`;
    const currentGen = generationStatus.get(key);
    if (currentGen && (currentGen.status === 'generating' || currentGen.status === 'queued')) {
      return sendJSON(res, {
        status: currentGen.status,
        wrongQ,
        corrections: corrections || null,
        message: currentGen.status === 'queued' ? '피드백지 생성 대기중' : '피드백지 생성 진행중',
      });
    }

    const config = loadVerajinConfig();
    const inputDir = path.join(TUTORING_DIR, student, 'input', date);
    const outputDir = path.join(TUTORING_DIR, student, 'output', date);

    const enqueueStatus = enqueueGeneration(
      student,
      date,
      () => runPostApproval({
        studentName: student,
        dateStr: date,
        config,
        approvalResult: { approved: true, corrections: corrections || null },
        inputDir,
        outputDir,
        skipDiscord: true,
      }),
      (err, result) => {
        const prev = generationStatus.get(key) || {};
        if (err) {
          generationStatus.set(key, {
            status: 'error',
            queuedAt: prev.queuedAt || null,
            startedAt: prev.startedAt || null,
            completedAt: new Date().toISOString(),
            pdfPath: null,
            error: err.message,
          });
          console.error(`[generation] ${student}/${date} 에러:`, err.message);
          return;
        }

        generationStatus.set(key, {
          status: result.success ? 'done' : 'error',
          queuedAt: prev.queuedAt || null,
          startedAt: prev.startedAt || null,
          completedAt: new Date().toISOString(),
          pdfPath: result.pdfPath || null,
          error: result.success ? null : 'Post-approval 실패',
        });
        console.log(`[generation] ${student}/${date}: ${result.success ? '완료' : '실패'} ${result.pdfPath || ''}`);
      }
    );

    return sendJSON(res, {
      status: enqueueStatus,
      wrongQ,
      corrections: corrections || null,
      message: enqueueStatus === 'queued' ? '피드백지 생성 대기열 등록됨' : '피드백지 생성 시작됨',
    });
  }

  // No wrong answers and no runPostApproval
  sendJSON(res, {
    status: 'approved',
    wrongQ,
    message: '승인 완료',
  });
}

/**
 * GET /api/generation-status — 피드백지 생성 진행 상태
 */
function handleGenerationStatus(res) {
  const result = {};
  for (const [key, value] of generationStatus) {
    result[key] = value;
  }
  sendJSON(res, result);
}

/**
 * POST /api/classify/:student/:date — 이미지 분류 (summary 없는 항목용)
 */
async function handleClassify(res, student, date) {
  if (!classifyDirectory) {
    return sendJSON(res, { error: '분류 모듈을 로드할 수 없습니다. 수동 분류가 필요합니다.' }, 500);
  }

  const dateDir = path.join(TUTORING_DIR, student, 'input', date);
  if (!fs.existsSync(dateDir)) {
    return sendError(res, 404, `폴더를 찾을 수 없습니다: ${student}/${date}`);
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return sendJSON(res, { error: 'GEMINI_API_KEY 환경변수가 필요합니다. 수동 분류가 필요합니다.' }, 500);
  }

  try {
    const config = loadVerajinConfig();
    const model = config.classify?.model || 'gemini-3-flash-preview';
    const result = await classifyDirectory(dateDir, apiKey, { model });
    sendJSON(res, {
      status: 'done',
      classified: result.classified,
      skipped: result.skipped,
      errors: result.errors,
      feedbackReady: result.feedbackReady,
    });
  } catch (e) {
    sendJSON(res, { error: `분류 실패: ${e.message}` }, 500);
  }
}

/**
 * GET /api/pipeline-status/:student/:date — _pipeline_state.json 반환
 */
function handlePipelineStatus(res, student, date) {
  const stateFile = path.join(TUTORING_DIR, student, 'input', date, '_pipeline_state.json');
  if (!fs.existsSync(stateFile)) {
    return sendJSON(res, { status: 'not_found' });
  }
  try {
    const state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
    sendJSON(res, state);
  } catch (e) {
    sendJSON(res, { status: 'not_found', error: e.message });
  }
}

/**
 * GET /api/pdf/:student/:date — PDF 파일 서빙
 */
function handlePdf(res, student, date) {
  const outputDir = path.join(TUTORING_DIR, student, 'output', date);
  if (!fs.existsSync(outputDir)) {
    return sendError(res, 404, 'output 폴더를 찾을 수 없습니다');
  }

  // Find PDF file
  let pdfFile = null;
  try {
    const files = fs.readdirSync(outputDir);
    pdfFile = files.find(f => f.endsWith('.pdf'));
  } catch (e) {
    return sendError(res, 500, 'output 폴더 읽기 실패');
  }

  if (!pdfFile) {
    return sendError(res, 404, 'PDF 파일을 찾을 수 없습니다');
  }

  const pdfPath = path.join(outputDir, pdfFile);
  let data;
  try {
    data = fs.readFileSync(pdfPath);
  } catch (e) {
    return sendError(res, 500, 'PDF 읽기 실패: ' + e.message);
  }

  res.writeHead(200, {
    'Content-Type': 'application/pdf',
    'Content-Length': data.length,
    'Content-Disposition': `inline; filename="${encodeURIComponent(pdfFile)}"`,
    'Access-Control-Allow-Origin': '*',
  });
  res.end(data);
}

/**
 * POST /api/drive-upload/:student/:date — PDF를 Google Drive에 업로드
 */
async function handleDriveUpload(res, student, date) {
  const outputDir = path.join(TUTORING_DIR, student, 'output', date);
  if (!fs.existsSync(outputDir)) {
    return sendError(res, 404, 'output 폴더를 찾을 수 없습니다');
  }

  let pdfFile;
  try {
    const files = fs.readdirSync(outputDir);
    pdfFile = files.find(f => f.endsWith('.pdf'));
  } catch (e) {
    return sendError(res, 500, 'output 폴더 읽기 실패');
  }

  if (!pdfFile) {
    return sendError(res, 404, 'PDF 파일을 찾을 수 없습니다');
  }

  const pdfPath = path.join(outputDir, pdfFile);

  try {
    // gog drive upload 실행
    const parentFlag = '';
    const cmd = `gog drive upload "${pdfPath}" --no-input`;
    console.log(`[drive-upload] ${cmd}`);
    const result = execSync(cmd, { encoding: 'utf8', timeout: 60000 }).trim();
    console.log(`[drive-upload] ${student}/${date}: ${result}`);

    // 학생 피드백자료 폴더에 업로드 시도
    let driveUrl = null;
    try {
      const driveUploader = require(path.join(VERAJIN_DIR, 'scripts/lib/drive-uploader'));
      // 학생 폴더 → output → 날짜 폴더 찾기
      const studentFolder = driveUploader.findSubfolder(driveUploader.TUTORING_DRIVE_ROOT, student);
      if (studentFolder) {
        const outFolder = driveUploader.findSubfolder(studentFolder.id, 'output');
        if (outFolder) {
          const dateFolder = driveUploader.findSubfolder(outFolder.id, date);
          if (dateFolder) {
            driveUrl = `https://drive.google.com/drive/folders/${dateFolder.id}`;
          }
        }
      }
    } catch (_) {}

    sendJSON(res, {
      success: true,
      pdfFile,
      driveUrl,
      message: `${pdfFile} 업로드 완료`,
    });
  } catch (e) {
    console.error(`[drive-upload] ${student}/${date} 실패:`, e.message);
    sendError(res, 500, `드라이브 업로드 실패: ${e.message}`);
  }
}

/**
 * GET /
 */
function handleRoot(res) {
  if (!fs.existsSync(HTML_FILE)) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('review-dashboard.html을 찾을 수 없습니다');
    return;
  }
  const html = fs.readFileSync(HTML_FILE);
  res.writeHead(200, {
    'Content-Type': 'text/html; charset=utf-8',
    'Content-Length': html.length,
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
    'Clear-Site-Data': '"cache"',
  });
  res.end(html);
}

const server = http.createServer(async (req, res) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    return res.end();
  }

  const url = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = url.pathname;

  // Browser default favicon request
  if (req.method === 'GET' && pathname === '/favicon.ico') {
    res.writeHead(204);
    return res.end();
  }

  // 토큰 인증 (REVIEW_TOKEN 설정 시 활성화)
  if (ACCESS_TOKEN) {
    const token = url.searchParams.get('token') || req.headers['x-review-token'];
    const isRoot = req.method === 'GET' && (pathname === '/' || pathname === '/index.html');
    if (!isRoot && token !== ACCESS_TOKEN) {
      return sendError(res, 401, '인증 토큰이 필요합니다. ?token=... 또는 x-review-token 헤더를 추가하세요.');
    }
  }

  // Route: GET /api/students
  if (req.method === 'GET' && pathname === '/api/students') {
    return handleStudents(res);
  }

  // Route: GET /api/review/:student/:date
  const reviewMatch = pathname.match(/^\/api\/review\/([^/]+)\/(\d{6})$/);
  if (req.method === 'GET' && reviewMatch) {
    const student = decodeURIComponent(reviewMatch[1]);
    const date = reviewMatch[2];
    return handleReview(res, student, date);
  }

  // Route: /api/notes/:student/:date (GET/PUT/DELETE)
  const notesMatch = pathname.match(/^\/api\/notes\/([^/]+)\/(\d{6})$/);
  if (notesMatch) {
    const student = decodeURIComponent(notesMatch[1]);
    const date = notesMatch[2];
    if (req.method === 'GET') return handleGetNotes(res, student, date);
    if (req.method === 'PUT') return handleSaveNotes(req, res, student, date);
    if (req.method === 'DELETE') return handleDeleteNotes(res, student, date);
  }

  // Route: DELETE /api/notes/:student/:date/image/:filename
  const noteImageDeleteMatch = pathname.match(/^\/api\/notes\/([^/]+)\/(\d{6})\/image\/([^/]+)$/);
  if (req.method === 'DELETE' && noteImageDeleteMatch) {
    const student = decodeURIComponent(noteImageDeleteMatch[1]);
    const date = noteImageDeleteMatch[2];
    const filename = decodeURIComponent(noteImageDeleteMatch[3]);
    return handleDeleteImageNote(res, student, date, filename);
  }

  // Route: POST /api/update-answer/:student/:date
  const updateMatch = pathname.match(/^\/api\/update-answer\/([^/]+)\/(\d{6})$/);
  if (req.method === 'POST' && updateMatch) {
    const student = decodeURIComponent(updateMatch[1]);
    const date = updateMatch[2];
    return handleUpdateAnswer(req, res, student, date);
  }

  // Route: POST /api/extract/:student/:date
  const extractMatch = pathname.match(/^\/api\/extract\/([^/]+)\/(\d{6})$/);
  if (req.method === 'POST' && extractMatch) {
    const student = decodeURIComponent(extractMatch[1]);
    const date = extractMatch[2];
    return handleExtract(res, student, date);
  }

  // Route: POST /api/extract-all
  if (req.method === 'POST' && pathname === '/api/extract-all') {
    return handleExtractAll(res);
  }

  // Route: GET /api/extract-status
  if (req.method === 'GET' && pathname === '/api/extract-status') {
    return handleExtractStatus(res);
  }

  // Route: POST /api/approve/:student/:date
  const approveMatch = pathname.match(/^\/api\/approve\/([^/]+)\/(\d{6})$/);
  if (req.method === 'POST' && approveMatch) {
    const student = decodeURIComponent(approveMatch[1]);
    const date = approveMatch[2];
    return handleApprove(req, res, student, date);
  }

  // Route: GET /api/generation-status
  if (req.method === 'GET' && pathname === '/api/generation-status') {
    return handleGenerationStatus(res);
  }

  // Route: POST /api/classify/:student/:date
  const classifyMatch = pathname.match(/^\/api\/classify\/([^/]+)\/(\d{6})$/);
  if (req.method === 'POST' && classifyMatch) {
    const student = decodeURIComponent(classifyMatch[1]);
    const date = classifyMatch[2];
    return handleClassify(res, student, date);
  }

  // Route: GET /api/pipeline-status/:student/:date
  const pipelineStatusMatch = pathname.match(/^\/api\/pipeline-status\/([^/]+)\/(\d{6})$/);
  if (req.method === 'GET' && pipelineStatusMatch) {
    const student = decodeURIComponent(pipelineStatusMatch[1]);
    const date = pipelineStatusMatch[2];
    return handlePipelineStatus(res, student, date);
  }

  // Route: POST /api/re-extract-answers/:student/:date
  const reExtractMatch = pathname.match(/^\/api\/re-extract-answers\/([^/]+)\/(\d{6})$/);
  if (req.method === 'POST' && reExtractMatch) {
    const student = decodeURIComponent(reExtractMatch[1]);
    const date = reExtractMatch[2];
    return handleReExtractAnswers(res, student, date);
  }

  // Route: POST /api/skip/:student/:date
  const skipMatch = pathname.match(/^\/api\/skip\/([^/]+)\/(\d{6})$/);
  if (req.method === 'POST' && skipMatch) {
    const student = decodeURIComponent(skipMatch[1]);
    const date = skipMatch[2];
    return handleSkip(res, student, date);
  }

  // Route: POST /api/add-answer-row/:student/:date
  const addRowMatch = pathname.match(/^\/api\/add-answer-row\/([^/]+)\/(\d{6})$/);
  if (req.method === 'POST' && addRowMatch) {
    const student = decodeURIComponent(addRowMatch[1]);
    const date = addRowMatch[2];
    return handleAddAnswerRow(req, res, student, date);
  }

  // Route: POST /api/drive-upload/:student/:date
  const driveUploadMatch = pathname.match(/^\/api\/drive-upload\/([^/]+)\/(\d{6})$/);
  if (req.method === 'POST' && driveUploadMatch) {
    const student = decodeURIComponent(driveUploadMatch[1]);
    const date = driveUploadMatch[2];
    return handleDriveUpload(res, student, date);
  }

  // Route: GET /api/pdf/:student/:date
  const pdfMatch = pathname.match(/^\/api\/pdf\/([^/]+)\/(\d{6})$/);
  if (req.method === 'GET' && pdfMatch) {
    const student = decodeURIComponent(pdfMatch[1]);
    const date = pdfMatch[2];
    return handlePdf(res, student, date);
  }

  // Route: GET /images/:student/:date/:filename
  const imageMatch = pathname.match(/^\/images\/([^/]+)\/(\d{6})\/([^/]+)$/);
  if (req.method === 'GET' && imageMatch) {
    const student = decodeURIComponent(imageMatch[1]);
    const date = imageMatch[2];
    const filename = decodeURIComponent(imageMatch[3]);
    return handleImage(res, student, date, filename);
  }

  // Route: GET /
  if (req.method === 'GET' && (pathname === '/' || pathname === '/index.html')) {
    return handleRoot(res);
  }

  sendError(res, 404, '경로를 찾을 수 없습니다: ' + pathname);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Review Dashboard 서버 시작됨 (모든 인터페이스)`);
  console.log(`  로컬: http://localhost:${PORT}`);
  try {
    const { networkInterfaces } = require('os');
    const nets = networkInterfaces();
    for (const name of Object.keys(nets)) {
      for (const net of nets[name]) {
        if (net.family === 'IPv4' && !net.internal) {
          console.log(`  LAN:  http://${net.address}:${PORT}`);
        }
      }
    }
  } catch { /* ignore */ }
  if (ACCESS_TOKEN) {
    console.log(`  인증: 활성화 (API 요청에 ?token=... 필요)`);
  } else {
    console.log(`  인증: 비활성화 (REVIEW_TOKEN 미설정)`);
  }
  console.log(`  승인 상태: ${APPROVAL_STATE_PATH}`);
  console.log('  종료: Ctrl+C');
});

server.on('error', (e) => {
  if (e.code === 'EADDRINUSE') {
    console.error(`포트 ${PORT}이 이미 사용 중입니다. 다른 프로세스를 종료하거나 PORT를 변경하세요.`);
  } else {
    console.error('서버 오류:', e.message);
  }
  process.exit(1);
});
