# Ground Truth Dataset - Complete Documentation

**Status**: Complete Inventory Generated  
**Date**: 2026-03-02  
**Location**: `~/projects/doc_design/00_tutoring/`

---

## 📋 What is Ground Truth?

The **Ground Truth Dataset** consists of all successfully extracted student answer records (`answers.json` files) that represent verified/attempted extractions from student assignment images. These files are the baseline for measuring extraction quality and system performance.

---

## 📊 Dataset Overview

| Metric | Value |
|--------|-------|
| **Total Files** | 40 answers.json |
| **Total Questions** | 820 |
| **Students** | 15 |
| **Date Range** | 2026-02-25 to 2026-03-02 |
| **Verified with Feedback** | 16/40 (40.0%) |
| **Overall Success Rate** | 37.0% (303 correct) |
| **High Performers** | 진소윤 (92.2%), 최여진 (78.6%), 김준현 (80.0%) |
| **Problem Cases** | 박지율 (3.1%), 정성엽 (empty), 박수빈 (0.0%) |

---

## 📁 How to Use This Dataset

### 1. Quick Overview
Start with the quick reference guide:
```bash
cat ~/projects/doc_design/GROUND_TRUTH_QUICK_REFERENCE.txt
```

Key findings:
- 40.0% verification coverage (16/40 files have feedback HTML)
- 37.0% overall success rate across 820 questions
- 52.9% unknown/unverified answers (OCR challenge)
- Manual entries achieve 80% vs automated 37.3%

### 2. Detailed Analysis
For comprehensive student-by-student breakdown:
```bash
cat ~/projects/doc_design/GROUND_TRUTH_INVENTORY.md
```

Includes:
- Individual student statistics
- Subject distribution (Reading, Grammar, Syntax, Vocab)
- Temporal analysis (daily trends)
- Quality patterns and recommendations

### 3. File Location Reference
To locate specific answers.json or feedback files:
```bash
cat ~/projects/doc_design/GROUND_TRUTH_FILE_PATHS.md
```

Contains:
- All 40 file paths with verification status
- Feedback HTML output locations
- Priority files for verification
- Bash command shortcuts

---

## 🎯 Key Findings

### High-Performers (Should Use as Templates)
1. **진소윤** — 92.2% success (77 questions)
   - Excellent reading & vocab accuracy
   - Only 1/3 files verified — opportunity to verify remaining 2
   
2. **최여진** — 78.6% success (14 questions, reading)
   - High accuracy, completely unverified
   
3. **김준현** — 80.0% success (10 questions, syntax)
   - Manual entry (not automated) — best method

### Problem Cases (Need Investigation)
1. **박지율** — 3.1% success (64 questions, worst performer)
   - 3 files verified but showing 0% success
   - Likely image quality or marking format issue
   
2. **정성엽** — Empty extractions (0 questions)
   - Images may be corrupted or non-educational
   
3. **오수민 (260301)** — 100% unknown answers (32 questions)
   - No answer marks detected

### Verification Gaps
- **60% of files** lack feedback HTML verification
- **52.9% of answers** remain unknown/unverified
- **Only 32%** of individual answer records marked verified=true
- Creates gap between extraction and validation

---

## 📈 Extraction Quality by Subject

| Subject | Success Rate | Issue |
|---------|--------------|-------|
| Grammar (문법) | 30.4% | Needs answer key integration |
| Reading (독해) | 30.6% | High unknown ratio (61.6%), OCR challenge |
| Syntax (구문독해) | 30.8% | Similar to grammar/reading |
| Vocab (어휘) | 36.3% | Best performing subject |

---

## 🔍 Extraction Method Comparison

| Method | Files | Success Rate | Notes |
|--------|-------|--------------|-------|
| color-separation-2pass | 38 | 37.3% | Automated OCR, primary method |
| N/A (manual) | 2 | 80.0% | Manual entry performs 2.1x better |

**Insight**: Manual entries significantly outperform automated extraction, suggesting hybrid approach could improve results.

---

## ⚠️ Known Issues

### 1. High Unknown Ratio (52.9%)
- OCR cannot reliably detect answer marks in many images
- Most common in reading comprehension (61.6% unknown)
- Suggests color-separation-2pass needs improvement
- May indicate inconsistent student marking formats

### 2. Low Verification Coverage (40%)
- Only 16/40 files have corresponding feedback HTML
- Extraction ≠ validation (files created but not verified)
- Top priority: verify high-accuracy unverified files
  - 진소윤 (96.7%, 95.8%)
  - 최여진 (78.6%)
  - 김준현 (80.0%)

### 3. Method Inconsistency
- Most files use color-separation-2pass
- 2 files use manual (N/A)
- No clear documentation when each method is used
- Manual shows significantly better results

### 4. Empty/Corrupted Files
- 정성엽: 0 questions extracted (both files empty)
- 박수빈 (260226): 0 questions extracted
- Suggests image files may be corrupted or format issues

---

## 🚀 Recommended Next Steps

### Immediate Priorities (High ROI)
1. **Verify high-performers** (would increase coverage to 50%+)
   ```bash
   # Generate feedback for 진소윤 (260225, 260226)
   node 04_scripts/generate-feedback-from-json.js 진소윤 260225
   node 04_scripts/generate-feedback-from-json.js 진소윤 260226
   
   # Generate feedback for 최여진 (260226)
   node 04_scripts/generate-feedback-from-json.js 최여진 260226
   
   # Generate feedback for 김준현 (260226)
   node 04_scripts/generate-feedback-from-json.js 김준현 260226
   ```

2. **Diagnose problem cases**
   - Review image files for 박지율 (check quality/format)
   - Check if 정성엽 images exist and are readable
   - Investigate 오수민 (260301) unknown marks

3. **Analyze extraction method**
   - Why does manual (80%) beat automated (37.3%)?
   - Can we replicate manual accuracy in automated pipeline?
   - Test hybrid approach on high-performer files

### Medium-Term Improvements
4. **Improve OCR accuracy**
   - Test alternative color detection algorithms
   - Investigate marking format variations across students
   - Implement validation checks for suspicious patterns

5. **Close verification gaps**
   - Create verification checklist for remaining 24 files
   - Prioritize by success rate (high first)
   - Build feedback HTML for extraction-only files

### Long-Term Strategy
6. **Answer key integration**
   - Better integration with textbook answer data
   - Reduce reliance on OCR for answer validation
   - Implement cross-validation with known correct answers

---

## 📂 Document Structure

Three complementary reference documents created:

### 1. GROUND_TRUTH_QUICK_REFERENCE.txt
**Use for**: Executive summaries, quick lookups, rankings
- Student rankings by success rate
- Verified vs not verified file lists
- Subject distribution table
- Temporal analysis
- Known problems and next steps

### 2. GROUND_TRUTH_INVENTORY.md
**Use for**: Deep analysis, student profiles, trend discovery
- Detailed student-by-student breakdown
- Temporal coverage and patterns
- Key observations and recommendations
- High-performer and problem case analysis

### 3. GROUND_TRUTH_FILE_PATHS.md
**Use for**: File location lookups, batch operations
- Complete file paths (all 40 answers.json)
- Feedback HTML output paths (16 files)
- Quick bash commands
- Master tracking file reference

---

## 🔗 Related Files

| File | Purpose |
|------|---------|
| `~/projects/doc_design/00_tutoring/tracking.json` | Master metadata for all extractions |
| `~/projects/doc_design/04_scripts/feedback-schema.json` | JSON schema validation |
| `~/projects/doc_design/04_scripts/validate-feedback.js` | Feedback validation script |
| `~/projects/doc_design/04_scripts/generate-feedback-from-json.js` | HTML feedback generator |
| `~/projects/doc_design/CLAUDE.md` | Workflow documentation |

---

## 📊 Statistical Summary

### By Student Performance
```
Top 5 Performers:
1. 진소윤 — 92.2% (77 questions)
2. 김준현 — 80.0% (10 questions, manual)
3. 최여진 — 78.6% (14 questions)
4. 조근영 — 44.0% (109 questions)
5. 임서휘 — 43.2% (81 questions)

Bottom 3 Performers:
13. 박수빈 — 0.0% (10 questions)
14. 정성엽 — N/A (0 questions, empty)
15. 박지율 — 3.1% (64 questions)
```

### By Subject Coverage
```
Grammar (문법):      19 files, 362 questions, 30.4% success
Reading (독해):      13 files, 284 questions, 30.6% success
Syntax (구문독해):   3 files,  26 questions, 30.8% success
Vocab (어휘):        3 files,  91 questions, 36.3% success
Logic (논리):        0 files,   0 questions, N/A
────────────────────────────────────────────────────────
TOTAL:              40 files, 820 questions, 37.0% success
```

### By Verification Status
```
Verified (40%):          16 files, with feedback HTML
Not Verified (60%):      24 files, extraction only
   High-Priority (unverified but high accuracy): 4 files
   Problem Cases (unverified and low accuracy): 5 files
   Normal Cases: 15 files
```

---

## 🎓 Usage Examples

### Find all answers for a specific student
```bash
find ~/projects/doc_design/00_tutoring/김예은 -name "answers.json" -type f
```

### Get summary stats for a date
```bash
# Check all extractions for 2026-02-28 (peak day)
find ~/projects/doc_design/00_tutoring -path "*/260228/answers.json" -type f
```

### Check if feedback was generated
```bash
# Verify feedback HTML exists for a student
find ~/projects/doc_design/00_tutoring/임서휘/output -name "피드백지_*.html"
```

### Extract question count for analysis
```bash
# Get stats for specific file
jq '.stats' ~/projects/doc_design/00_tutoring/임서휘/input/260226/answers.json

# Count answers across all files
find ~/projects/doc_design/00_tutoring -name "answers.json" -type f \
  -exec jq '.answers | length' {} \; | awk '{sum+=$1} END {print sum}'
```

---

## 📝 Notes

- **Data quality varies significantly** by student (3.1% to 92.2% success rate)
- **Verification is incomplete** — only 40% of extractions verified with feedback HTML
- **Unknown ratio is high** — 52.9% of answers unverified, mostly due to OCR limitations
- **Manual entry outperforms automated** — suggests hybrid approach could be beneficial
- **Subject performance is consistent** — all subjects ~30-36%, no major outliers
- **Temporal peak** — 2026-02-28 had highest activity (10 files, 318 questions)

---

## 📞 Contact & Questions

For questions about:
- **Extraction accuracy**: Review GROUND_TRUTH_QUICK_REFERENCE.txt rankings
- **Specific file locations**: Check GROUND_TRUTH_FILE_PATHS.md
- **Student performance**: See GROUND_TRUTH_INVENTORY.md
- **Detailed analysis**: Read full CLAUDE.md workflow documentation

---

**Last Updated**: 2026-03-02 14:50 UTC  
**Generated by**: Ground Truth Analysis Script  
**Dataset Version**: v4 (color-separation-2pass + manual entries)  
**Schema Reference**: feedback-schema.json

