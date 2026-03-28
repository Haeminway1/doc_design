#!/usr/bin/env python3
"""
HWPX 워크북 생성기 v8 — 프리미엄 디자인 풀 패키지
- 양쪽정렬 (JUSTIFY) 전면 적용
- 빈칸: 밑줄+볼드, 이지선다: 볼드 강조
- 네이비+골드 2색 프리미엄 테마
- 제목 아래 골드 악센트 라인
- 문제번호 네이비 배지
- 지문 좌측 세로 악센트 바
- 헤더 바 (과목명+시험 정보)
- 세련된 페이지 번호 (— N —)
- 문제 간 구분선
- 단어표 영어칸 넓게
"""
import os, re, zipfile, copy
import xml.etree.ElementTree as ET
from io import BytesIO
from hwpx import HwpxDocument

ET.register_namespace("hh", "http://www.hancom.co.kr/hwpml/2011/head")
ET.register_namespace("hc", "http://www.hancom.co.kr/hwpml/2011/core")
ET.register_namespace("hp", "http://www.hancom.co.kr/hwpml/2011/paragraph")
ET.register_namespace("hs", "http://www.hancom.co.kr/hwpml/2011/section")

HH = "{http://www.hancom.co.kr/hwpml/2011/head}"
HC = "{http://www.hancom.co.kr/hwpml/2011/core}"
HP = "{http://www.hancom.co.kr/hwpml/2011/paragraph}"

# ══════════════════════════════════════════════════════════════
# 페이지 레이아웃 (A4)
# ══════════════════════════════════════════════════════════════
PAGE_W = 59528
PAGE_H = 84189
M_LEFT  = 3400
M_RIGHT = 3400
M_TOP   = 1417
M_BOTTOM = 1417
USABLE_W = PAGE_W - M_LEFT - M_RIGHT  # 52728

# ══════════════════════════════════════════════════════════════
# 컬러 팔레트 — 네이비+골드 프리미엄 테마
# ══════════════════════════════════════════════════════════════
CLR_NAVY     = "#1F3864"
CLR_BLUE_MED = "#2E75B6"
CLR_BLUE_LT  = "#D6E4F0"
CLR_LINE     = "#B8CCE4"
CLR_RULE     = "#D0D8E8"
CLR_GOLD     = "#C49A3C"   # 프리미엄 골드 악센트
CLR_GOLD_LT  = "#F5ECD7"   # 라이트 골드
CLR_TEXT     = "#222222"
CLR_TEXT_SUB = "#444444"
CLR_GRAY     = "#888888"
CLR_GRAY_LT  = "#AAAAAA"
CLR_HDR_TEXT = "#999999"   # 헤더 텍스트

# ══════════════════════════════════════════════════════════════
# 스타일 ID
# ══════════════════════════════════════════════════════════════

# borderFill
BF_CLEAN       = 3
BF_BANNER      = 4
BF_HDR         = 5
BF_DATA        = 6
BF_INVIS       = 7
BF_BLANK_ANS   = 8
BF_RULE        = 9
BF_ACCENT_LINE = 10  # 골드 악센트 라인
BF_ACCENT_BAR  = 11  # 네이비 좌측 세로 바
BF_NUM_BADGE   = 12  # 문제번호 배지 (네이비 배경)
BF_HDR_BAR     = 13  # 헤더 바 하단선
BF_COL_DIV     = 14  # 분석서 컬럼 구분 (우측 보더)
BF_LABEL_BAR   = 15  # 섹션 라벨 골드 하단선
BF_BLUE_BOX    = 16  # 하늘색 박스 배경
BF_LABEL_NAVY  = 17  # 섹션 라벨 연한 네이비 배경

# charPr
CP_BANNER       = 7
CP_TITLE        = 8
CP_HDR          = 9
CP_NUM          = 10
CP_VOCA         = 11
CP_MEANING      = 12
CP_PAGENUM      = 13
CP_PROB_TITLE   = 14
CP_PROB_BODY    = 15
CP_PROB_BOLD    = 16
CP_SPACER       = 17
CP_BLANK_INLINE = 18
CP_CHOICE_BOLD  = 19
CP_PAGENUM_DECO = 20
CP_NUM_BADGE    = 21  # 배지 번호: 11pt 흰색 볼드
CP_HDR_BAR_TEXT = 22  # 헤더 바: 8pt 연회색
CP_SECTION_LBL  = 23  # 섹션 라벨: 9pt 네이비 볼드
CP_ANALYSIS_NUM = 24  # 지문 번호: 12pt 네이비 볼드
CP_UNDERLINE    = 25  # 빈칸 밑줄: 10pt 회색
CP_AN_BODY      = 26  # 분석서 본문: 9pt

# paraPr
PP_LEFT    = 20
PP_CENTER  = 21
PP_JUSTIFY = 22
PP_RIGHT   = 23

# ── ID 카운터 ──
_nid = 3000000000
def nid():
    global _nid; _nid += 1; return str(_nid)


# ══════════════════════════════════════════════════════════════
# header.xml 스타일 주입
# ══════════════════════════════════════════════════════════════

def inject_header_styles(hdr_root):
    ref = hdr_root.find(f"{HH}refList")

    bf_list = ref.find(f"{HH}borderFills")
    for bf in bf_list.findall(f"{HH}borderFill"):
        diag = bf.find(f"{HH}diagonal")
        if diag is not None:
            diag.set("type", "NONE")

    for font in ref.findall(f".//{HH}font"):
        font.set("face", "맑은 고딕")

    # ── charPr ──
    cp_list = ref.find(f"{HH}charProperties")
    base_cp = cp_list.find(f"{HH}charPr[@id='0']")

    def add_cp(cid, height, color="#000000", bold=False, underline=False):
        cp = copy.deepcopy(base_cp)
        cp.set("id", str(cid))
        cp.set("height", str(height))
        cp.set("textColor", color)
        cp.set("borderFillIDRef", "1")
        for b in cp.findall(f"{HH}bold"):
            cp.remove(b)
        if bold:
            ul = cp.find(f"{HH}underline")
            if ul is not None:
                cp.insert(list(cp).index(ul), ET.Element(f"{HH}bold"))
            else:
                ET.SubElement(cp, f"{HH}bold")
        ul_elem = cp.find(f"{HH}underline")
        if underline:
            if ul_elem is not None:
                ul_elem.set("type", "BOTTOM")
                ul_elem.set("shape", "SOLID")
                ul_elem.set("color", color)
            else:
                ET.SubElement(cp, f"{HH}underline", {
                    "type": "BOTTOM", "shape": "SOLID", "color": color})
        else:
            if ul_elem is not None:
                ul_elem.set("type", "NONE")
        cp_list.append(cp)

    add_cp(CP_BANNER,       1100, "#FFFFFF",    bold=True)
    add_cp(CP_TITLE,        2400, CLR_TEXT,     bold=True)
    add_cp(CP_HDR,          1000, CLR_TEXT,     bold=True)
    add_cp(CP_NUM,          1000, CLR_NAVY,     bold=True)
    add_cp(CP_VOCA,         1000, CLR_TEXT,     bold=True)
    add_cp(CP_MEANING,      1000, CLR_TEXT_SUB)
    add_cp(CP_PAGENUM,       800, CLR_GRAY)
    add_cp(CP_PROB_TITLE,   1200, CLR_TEXT,     bold=True)
    add_cp(CP_PROB_BODY,    1050, CLR_TEXT)
    add_cp(CP_PROB_BOLD,    1050, CLR_TEXT,     bold=True)
    add_cp(CP_SPACER,        600, "#FFFFFF")
    add_cp(CP_BLANK_INLINE, 1050, CLR_TEXT,     bold=True)
    add_cp(CP_CHOICE_BOLD,  1050, CLR_NAVY,     bold=True)
    add_cp(CP_PAGENUM_DECO,  800, CLR_GRAY_LT)
    add_cp(CP_NUM_BADGE,    1100, "#FFFFFF",    bold=True)
    add_cp(CP_HDR_BAR_TEXT,  800, CLR_HDR_TEXT)
    add_cp(CP_SECTION_LBL,  900, CLR_NAVY, bold=True)
    add_cp(CP_ANALYSIS_NUM, 1200, CLR_NAVY, bold=True)
    add_cp(CP_UNDERLINE,    1000, CLR_GRAY, underline=True)
    add_cp(CP_AN_BODY,      900, CLR_TEXT)
    cp_list.set("itemCnt", str(len(cp_list.findall(f"{HH}charPr"))))

    # ── borderFill ──
    NO = {"type": "NONE", "width": "0.1 mm", "color": "#000000"}

    def add_bf(bid, bg_color=None, left=None, right=None, top=None, bottom=None):
        bf = ET.SubElement(bf_list, f"{HH}borderFill", {
            "id": str(bid), "threeD": "0", "shadow": "0",
            "centerLine": "NONE", "breakCellSeparateLine": "0"})
        ET.SubElement(bf, f"{HH}slash",     {"type": "NONE", "Crooked": "0", "isCounter": "0"})
        ET.SubElement(bf, f"{HH}backSlash", {"type": "NONE", "Crooked": "0", "isCounter": "0"})
        ET.SubElement(bf, f"{HH}leftBorder",   left or NO)
        ET.SubElement(bf, f"{HH}rightBorder",  right or NO)
        ET.SubElement(bf, f"{HH}topBorder",    top or NO)
        ET.SubElement(bf, f"{HH}bottomBorder", bottom or NO)
        ET.SubElement(bf, f"{HH}diagonal", {"type": "NONE", "width": "0.1 mm", "color": "#000000"})
        if bg_color:
            fb = ET.SubElement(bf, f"{HC}fillBrush")
            ET.SubElement(fb, f"{HC}winBrush",
                          {"faceColor": bg_color, "hatchColor": "#FFFFFF", "alpha": "0"})

    add_bf(BF_CLEAN)
    add_bf(BF_BANNER, bg_color=CLR_NAVY)
    add_bf(BF_HDR,    bg_color=CLR_BLUE_LT,
           bottom={"type": "SOLID", "width": "0.12 mm", "color": CLR_NAVY})
    add_bf(BF_DATA,
           bottom={"type": "SOLID", "width": "0.1 mm",  "color": CLR_LINE})
    add_bf(BF_INVIS)
    add_bf(BF_BLANK_ANS,
           bottom={"type": "SOLID", "width": "0.1 mm", "color": "#CCCCCC"})
    add_bf(BF_RULE,
           bottom={"type": "SOLID", "width": "0.08 mm", "color": CLR_RULE})
    add_bf(BF_ACCENT_LINE,
           bottom={"type": "SOLID", "width": "0.2 mm",  "color": CLR_GOLD})
    add_bf(BF_ACCENT_BAR,
           left={"type": "SOLID", "width": "0.7 mm", "color": CLR_NAVY})
    add_bf(BF_NUM_BADGE, bg_color=CLR_NAVY)
    add_bf(BF_HDR_BAR,
           bottom={"type": "SOLID", "width": "0.1 mm", "color": CLR_GOLD})
    add_bf(BF_COL_DIV,
           right={"type": "SOLID", "width": "0.12 mm", "color": CLR_LINE})
    add_bf(BF_LABEL_BAR,
           bottom={"type": "SOLID", "width": "0.15 mm", "color": CLR_GOLD})
    add_bf(BF_BLUE_BOX, bg_color="#EDF4FA")
    add_bf(BF_LABEL_NAVY, bg_color="#F0F4F8",
           bottom={"type": "SOLID", "width": "0.08 mm", "color": CLR_LINE})
    bf_list.set("itemCnt", str(len(bf_list.findall(f"{HH}borderFill"))))

    # ── paraPr ──
    pp_list = ref.find(f"{HH}paraProperties")
    base_pp = pp_list.find(f"{HH}paraPr[@id='0']")

    def add_pp(pid, align):
        pp = copy.deepcopy(base_pp)
        pp.set("id", str(pid))
        al = pp.find(f"{HH}align")
        if al is not None:
            al.set("horizontal", align)
        pp_list.append(pp)

    add_pp(PP_LEFT,    "LEFT")
    add_pp(PP_CENTER,  "CENTER")
    add_pp(PP_JUSTIFY, "JUSTIFY")
    add_pp(PP_RIGHT,   "RIGHT")
    pp_list.set("itemCnt", str(len(pp_list.findall(f"{HH}paraPr"))))


# ══════════════════════════════════════════════════════════════
# 기본 빌드 함수
# ══════════════════════════════════════════════════════════════

def mkp(parent, text="", cp="0", pp="0"):
    p = ET.SubElement(parent, f"{HP}p", {
        "id": nid(), "paraPrIDRef": str(pp), "styleIDRef": "0",
        "pageBreak": "0", "columnBreak": "0", "merged": "0"})
    r = ET.SubElement(p, f"{HP}run", {"charPrIDRef": str(cp)})
    t = ET.SubElement(r, f"{HP}t"); t.text = text
    lsa = ET.SubElement(p, f"{HP}linesegarray")
    ET.SubElement(lsa, f"{HP}lineseg", {
        "textpos": "0", "vertpos": "0", "vertsize": "1000",
        "textheight": "1000", "baseline": "850", "spacing": "600",
        "horzpos": "0", "horzsize": "0", "flags": "0"})
    return p


def mkp_runs(parent, segments, pp="0"):
    p = ET.SubElement(parent, f"{HP}p", {
        "id": nid(), "paraPrIDRef": str(pp), "styleIDRef": "0",
        "pageBreak": "0", "columnBreak": "0", "merged": "0"})
    for text, cp in segments:
        r = ET.SubElement(p, f"{HP}run", {"charPrIDRef": str(cp)})
        t = ET.SubElement(r, f"{HP}t")
        t.text = text
    lsa = ET.SubElement(p, f"{HP}linesegarray")
    ET.SubElement(lsa, f"{HP}lineseg", {
        "textpos": "0", "vertpos": "0", "vertsize": "1000",
        "textheight": "1000", "baseline": "850", "spacing": "600",
        "horzpos": "0", "horzsize": "0", "flags": "0"})
    return p


def spacer(parent, n=1):
    for _ in range(n):
        mkp(parent, "", cp=str(CP_SPACER), pp=str(PP_LEFT))


# ══════════════════════════════════════════════════════════════
# 프리미엄 디자인 컴포넌트
# ══════════════════════════════════════════════════════════════

def mk_header_bar(parent, left="영어 내신 대비 워크북", right="고2 · 3월 모의고사"):
    """상단 헤더 바: 과목명 + 시험정보, 골드 하단선"""
    half = USABLE_W // 2
    rows = [[
        {"t": left, "bf": str(BF_HDR_BAR), "cp": str(CP_HDR_BAR_TEXT),
         "pp": str(PP_LEFT), "ml": 200, "mr": 100, "mt": 200, "mb": 200},
        {"t": right, "bf": str(BF_HDR_BAR), "cp": str(CP_HDR_BAR_TEXT),
         "pp": str(PP_RIGHT), "ml": 100, "mr": 200, "mt": 200, "mb": 200},
    ]]
    mktable(parent, rows, [half, USABLE_W - half], 1200, bf_outer=str(BF_CLEAN))


def mk_accent_line(parent):
    """제목 아래 골드 악센트 라인"""
    mktable(parent,
            [[{"t": "", "bf": str(BF_ACCENT_LINE), "cp": "0", "pp": str(PP_LEFT),
               "ml": 0, "mr": 0, "mt": 0, "mb": 0}]],
            [USABLE_W], 200, bf_outer=str(BF_CLEAN))


def mk_prob_badge(parent, number, source=""):
    """문제번호 네이비 배지 + 출처 텍스트"""
    badge_w = 2800
    src_w = USABLE_W - badge_w
    rows = [[
        {"t": str(number), "bf": str(BF_NUM_BADGE), "cp": str(CP_NUM_BADGE),
         "pp": str(PP_CENTER), "ml": 200, "mr": 200, "mt": 300, "mb": 300},
        {"t": source, "bf": str(BF_CLEAN), "cp": str(CP_PROB_TITLE),
         "pp": str(PP_LEFT), "ml": 500, "mr": 200, "mt": 300, "mb": 300},
    ]]
    mktable(parent, rows, [badge_w, src_w], 1800, bf_outer=str(BF_CLEAN))


def mkrule(parent):
    """문제 간 얇은 구분선"""
    mktable(parent,
            [[{"t": "", "bf": str(BF_RULE), "cp": "0", "pp": str(PP_LEFT),
               "ml": 0, "mr": 0, "mt": 0, "mb": 0}]],
            [USABLE_W], 400, bf_outer=str(BF_CLEAN))


def mk_page_number(parent, num):
    """세련된 페이지 번호: — N —"""
    mkp_runs(parent, [
        ("—  ", str(CP_PAGENUM_DECO)),
        (str(num), str(CP_PAGENUM)),
        ("  —", str(CP_PAGENUM_DECO)),
    ], pp=str(PP_CENTER))


# ══════════════════════════════════════════════════════════════
# 지문 좌측 세로 악센트 바
# ══════════════════════════════════════════════════════════════

def mkcell_runs(col, row, w, h, segments, bf="3", pp="20",
                ml=300, mr=200, mt=250, mb=250):
    """멀티런 테이블 셀 (혼합 스타일 텍스트)"""
    tc = ET.Element(f"{HP}tc", {
        "name": "", "header": "0", "hasMargin": "1", "protect": "0",
        "editable": "0", "dirty": "0", "borderFillIDRef": str(bf)})
    sl = ET.SubElement(tc, f"{HP}subList", {
        "id": "", "textDirection": "HORIZONTAL", "lineWrap": "BREAK",
        "vertAlign": "CENTER", "linkListIDRef": "0", "linkListNextIDRef": "0",
        "textWidth": "0", "textHeight": "0", "hasTextRef": "0", "hasNumRef": "0"})
    p = ET.SubElement(sl, f"{HP}p", {
        "id": nid(), "paraPrIDRef": str(pp), "styleIDRef": "0",
        "pageBreak": "0", "columnBreak": "0", "merged": "0"})
    for text, cp in segments:
        r = ET.SubElement(p, f"{HP}run", {"charPrIDRef": str(cp)})
        t = ET.SubElement(r, f"{HP}t")
        t.text = text
    lsa = ET.SubElement(p, f"{HP}linesegarray")
    ET.SubElement(lsa, f"{HP}lineseg", {
        "textpos": "0", "vertpos": "0", "vertsize": "1000",
        "textheight": "1000", "baseline": "850", "spacing": "600",
        "horzpos": "0", "horzsize": "0", "flags": "0"})
    ET.SubElement(tc, f"{HP}cellAddr",   {"colAddr": str(col), "rowAddr": str(row)})
    ET.SubElement(tc, f"{HP}cellSpan",   {"colSpan": "1", "rowSpan": "1"})
    ET.SubElement(tc, f"{HP}cellSz",     {"width": str(w), "height": str(h)})
    ET.SubElement(tc, f"{HP}cellMargin", {
        "left": str(ml), "right": str(mr), "top": str(mt), "bottom": str(mb)})
    return tc


def mk_passage_bar(parent, segments, pp=str(PP_JUSTIFY)):
    """지문을 좌측 네이비 악센트 바가 있는 테이블로 감쌈"""
    tw = USABLE_W
    row_h = 2000

    p = ET.SubElement(parent, f"{HP}p", {
        "id": nid(), "paraPrIDRef": "0", "styleIDRef": "0",
        "pageBreak": "0", "columnBreak": "0", "merged": "0"})
    run_el = ET.SubElement(p, f"{HP}run", {"charPrIDRef": "0"})

    tbl = ET.SubElement(run_el, f"{HP}tbl", {
        "id": nid(), "zOrder": "0", "numberingType": "TABLE",
        "textWrap": "TOP_AND_BOTTOM", "textFlow": "BOTH_SIDES",
        "lock": "0", "dropcapstyle": "None", "pageBreak": "CELL",
        "repeatHeader": "0", "rowCnt": "1", "colCnt": "1",
        "cellSpacing": "0", "borderFillIDRef": str(BF_CLEAN), "noAdjust": "0"})
    ET.SubElement(tbl, f"{HP}sz", {
        "width": str(tw), "widthRelTo": "ABSOLUTE",
        "height": str(row_h), "heightRelTo": "ABSOLUTE", "protect": "0"})
    ET.SubElement(tbl, f"{HP}pos", {
        "treatAsChar": "1", "affectLSpacing": "0", "flowWithText": "1",
        "allowOverlap": "0", "holdAnchorAndSO": "0",
        "vertRelTo": "PARA", "horzRelTo": "COLUMN",
        "vertAlign": "TOP", "horzAlign": "LEFT",
        "vertOffset": "0", "horzOffset": "0"})
    ET.SubElement(tbl, f"{HP}outMargin",
                  {"left": "0", "right": "0", "top": "0", "bottom": "0"})
    ET.SubElement(tbl, f"{HP}inMargin",
                  {"left": "0", "right": "0", "top": "0", "bottom": "0"})

    czl = ET.SubElement(tbl, f"{HP}cellzoneList")
    ET.SubElement(czl, f"{HP}cellzone", {
        "startRowAddr": "0", "startColAddr": "0",
        "endRowAddr": "0", "endColAddr": "0",
        "borderFillIDRef": str(BF_CLEAN)})

    tr = ET.SubElement(tbl, f"{HP}tr")
    tc = mkcell_runs(0, 0, tw, row_h, segments,
                     bf=str(BF_ACCENT_BAR), pp=pp,
                     ml=700, mr=300, mt=400, mb=400)
    tr.append(tc)
    return tbl


# ══════════════════════════════════════════════════════════════
# 지문 파싱 — 빈칸/선택지 스타일 분리
# ══════════════════════════════════════════════════════════════

def parse_passage(text):
    patterns = [
        (r'\(([A-C])\)\s{4,}',                          'blank_label'),
        (r'\(\s{4,}\)',                                   'blank_connector'),
        (r'\(([^/\(\)]{1,25})\s*/\s*([^\)]{1,25})\)',    'choice'),
    ]

    matches = []
    for pat, kind in patterns:
        for m in re.finditer(pat, text):
            matches.append((m.start(), m.end(), m, kind))
    matches.sort(key=lambda x: x[0])

    filtered = []
    last_end = 0
    for start, end, m, kind in matches:
        if start >= last_end:
            filtered.append((start, end, m, kind))
            last_end = end

    segments = []
    pos = 0
    body_cp = str(CP_PROB_BODY)
    blank_cp = str(CP_BLANK_INLINE)
    choice_cp = str(CP_CHOICE_BOLD)

    for start, end, m, kind in filtered:
        if pos < start:
            segments.append((text[pos:start], body_cp))
        if kind == 'blank_label':
            label = m.group(1)
            segments.append((f"({label})\u00A0________________", blank_cp))
        elif kind == 'blank_connector':
            segments.append(("(연결사)\u00A0________________", blank_cp))
        elif kind == 'choice':
            a = m.group(1).strip()
            b = m.group(2).strip()
            segments.append((f"({a} / {b})", choice_cp))
        pos = end

    if pos < len(text):
        segments.append((text[pos:], body_cp))

    return segments


# ══════════════════════════════════════════════════════════════
# 테이블 빌드
# ══════════════════════════════════════════════════════════════

def mkcell(col, row, w, h, text, bf="3", cp="0", pp="20",
           ml=300, mr=200, mt=250, mb=250, va="CENTER"):
    tc = ET.Element(f"{HP}tc", {
        "name": "", "header": "0", "hasMargin": "1", "protect": "0",
        "editable": "0", "dirty": "0", "borderFillIDRef": str(bf)})
    sl = ET.SubElement(tc, f"{HP}subList", {
        "id": "", "textDirection": "HORIZONTAL", "lineWrap": "BREAK",
        "vertAlign": va, "linkListIDRef": "0", "linkListNextIDRef": "0",
        "textWidth": "0", "textHeight": "0", "hasTextRef": "0", "hasNumRef": "0"})
    p = ET.SubElement(sl, f"{HP}p", {
        "id": nid(), "paraPrIDRef": str(pp), "styleIDRef": "0",
        "pageBreak": "0", "columnBreak": "0", "merged": "0"})
    r = ET.SubElement(p, f"{HP}run", {"charPrIDRef": str(cp)})
    t = ET.SubElement(r, f"{HP}t"); t.text = text
    lsa = ET.SubElement(p, f"{HP}linesegarray")
    ET.SubElement(lsa, f"{HP}lineseg", {
        "textpos": "0", "vertpos": "0", "vertsize": "1000",
        "textheight": "1000", "baseline": "850", "spacing": "600",
        "horzpos": "0", "horzsize": "0", "flags": "0"})
    ET.SubElement(tc, f"{HP}cellAddr",   {"colAddr": str(col), "rowAddr": str(row)})
    ET.SubElement(tc, f"{HP}cellSpan",   {"colSpan": "1", "rowSpan": "1"})
    ET.SubElement(tc, f"{HP}cellSz",     {"width": str(w), "height": str(h)})
    ET.SubElement(tc, f"{HP}cellMargin", {
        "left": str(ml), "right": str(mr), "top": str(mt), "bottom": str(mb)})
    return tc


def mktable(parent, rows_data, col_widths, row_h, bf_outer="3"):
    nr = len(rows_data)
    nc = len(col_widths)
    tw = sum(col_widths)

    p = ET.SubElement(parent, f"{HP}p", {
        "id": nid(), "paraPrIDRef": "0", "styleIDRef": "0",
        "pageBreak": "0", "columnBreak": "0", "merged": "0"})
    run = ET.SubElement(p, f"{HP}run", {"charPrIDRef": "0"})

    tbl = ET.SubElement(run, f"{HP}tbl", {
        "id": nid(), "zOrder": "0", "numberingType": "TABLE",
        "textWrap": "TOP_AND_BOTTOM", "textFlow": "BOTH_SIDES",
        "lock": "0", "dropcapstyle": "None", "pageBreak": "CELL",
        "repeatHeader": "0", "rowCnt": str(nr), "colCnt": str(nc),
        "cellSpacing": "0", "borderFillIDRef": str(bf_outer), "noAdjust": "0"})
    ET.SubElement(tbl, f"{HP}sz", {
        "width": str(tw), "widthRelTo": "ABSOLUTE",
        "height": str(row_h * nr), "heightRelTo": "ABSOLUTE", "protect": "0"})
    ET.SubElement(tbl, f"{HP}pos", {
        "treatAsChar": "1", "affectLSpacing": "0", "flowWithText": "1",
        "allowOverlap": "0", "holdAnchorAndSO": "0",
        "vertRelTo": "PARA", "horzRelTo": "COLUMN",
        "vertAlign": "TOP", "horzAlign": "LEFT",
        "vertOffset": "0", "horzOffset": "0"})
    ET.SubElement(tbl, f"{HP}outMargin",
                  {"left": "0", "right": "0", "top": "0", "bottom": "0"})
    ET.SubElement(tbl, f"{HP}inMargin",
                  {"left": "0", "right": "0", "top": "0", "bottom": "0"})

    czl = ET.SubElement(tbl, f"{HP}cellzoneList")
    for c in range(nc):
        ET.SubElement(czl, f"{HP}cellzone", {
            "startRowAddr": "0", "startColAddr": str(c),
            "endRowAddr": str(nr - 1), "endColAddr": str(c),
            "borderFillIDRef": str(BF_CLEAN)})

    for ri, row in enumerate(rows_data):
        tr = ET.SubElement(tbl, f"{HP}tr")
        for ci, cd in enumerate(row):
            tc = mkcell(ci, ri, col_widths[ci], row_h,
                        cd.get("t", ""),
                        bf=cd.get("bf", str(BF_DATA)),
                        cp=cd.get("cp", str(CP_VOCA)),
                        pp=cd.get("pp", str(PP_LEFT)),
                        ml=cd.get("ml", 300),
                        mr=cd.get("mr", 200),
                        mt=cd.get("mt", 250),
                        mb=cd.get("mb", 250))
            tr.append(tc)
    return tbl


# ══════════════════════════════════════════════════════════════
# 셀 데이터 헬퍼
# ══════════════════════════════════════════════════════════════

def _hdr(t):
    return {"t": t, "bf": str(BF_HDR), "cp": str(CP_HDR), "pp": str(PP_CENTER),
            "ml": 200, "mr": 200, "mt": 250, "mb": 250}

def _gap():
    return {"t": "", "bf": str(BF_INVIS), "cp": "0", "pp": str(PP_CENTER),
            "ml": 0, "mr": 0, "mt": 0, "mb": 0}

def _num(n):
    return {"t": str(n) if n else "", "bf": str(BF_DATA), "cp": str(CP_NUM),
            "pp": str(PP_CENTER), "ml": 150, "mr": 150, "mt": 250, "mb": 250}

def _voca(t):
    return {"t": t, "bf": str(BF_DATA), "cp": str(CP_VOCA), "pp": str(PP_LEFT),
            "ml": 300, "mr": 150, "mt": 250, "mb": 250}

def _mean(t):
    return {"t": t, "bf": str(BF_DATA), "cp": str(CP_MEANING), "pp": str(PP_LEFT),
            "ml": 300, "mr": 150, "mt": 250, "mb": 250}

def _banner(t, ml=500):
    return {"t": t, "bf": str(BF_BANNER), "cp": str(CP_BANNER), "pp": str(PP_LEFT),
            "ml": ml, "mr": 200, "mt": 400, "mb": 400}

def _blank(t):
    return {"t": t, "bf": str(BF_BLANK_ANS), "cp": str(CP_PROB_BOLD), "pp": str(PP_LEFT),
            "ml": 400, "mr": 200, "mt": 250, "mb": 250}

def _choice(t):
    return {"t": t, "bf": str(BF_DATA), "cp": str(CP_PROB_BOLD), "pp": str(PP_LEFT),
            "ml": 400, "mr": 200, "mt": 250, "mb": 250}


# ══════════════════════════════════════════════════════════════
# 문서 빌드 공통
# ══════════════════════════════════════════════════════════════

def build_doc(build_fn):
    doc = HwpxDocument.new()
    raw = doc.to_bytes()
    buf = BytesIO(raw)
    zin = zipfile.ZipFile(buf, 'r')

    hdr = ET.fromstring(zin.read("Contents/header.xml"))
    inject_header_styles(hdr)

    sec = ET.fromstring(zin.read("Contents/section0.xml"))
    margin = sec.find(f".//{HP}margin")
    if margin is not None:
        margin.set("left", str(M_LEFT));  margin.set("right", str(M_RIGHT))
        margin.set("top", str(M_TOP));    margin.set("bottom", str(M_BOTTOM))

    for p in list(sec.findall(f"{HP}p"))[1:]:
        sec.remove(p)

    build_fn(sec)

    new_hdr = ET.tostring(hdr, encoding="utf-8", xml_declaration=True)
    new_sec = ET.tostring(sec, encoding="utf-8", xml_declaration=True)

    out = BytesIO()
    with zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED) as zo:
        for item in zin.infolist():
            if item.filename == "Contents/header.xml":
                zo.writestr(item, new_hdr)
            elif item.filename == "Contents/section0.xml":
                zo.writestr(item, new_sec)
            else:
                zo.writestr(item, zin.read(item.filename))
    zin.close()
    return out.getvalue()


# ══════════════════════════════════════════════════════════════
# 1. 단어 정리표
# ══════════════════════════════════════════════════════════════

def build_vocab(words, part="PART 0", title="1과  VOCABULARY"):
    def content(sec):
        mk_header_bar(sec)

        mktable(sec,
                [[_banner(f"  {part}")]],
                [USABLE_W], 2200, bf_outer=str(BF_CLEAN))
        spacer(sec, 1)

        mkp(sec, title, cp=str(CP_TITLE), pp=str(PP_LEFT))
        mk_accent_line(sec)

        gap = 800
        half = (USABLE_W - gap) // 2
        nw = 1500; vw = 11500; mw = half - nw - vw
        cws = [nw, vw, mw, gap, nw, vw, mw]
        ROW_H = 2100

        left, right = words[:25], words[25:50]
        n = max(len(left), len(right))

        rows = [[_hdr(""), _hdr("VOCA"), _hdr("MEANING"),
                 _gap(),
                 _hdr(""), _hdr("VOCA"), _hdr("MEANING")]]

        for i in range(n):
            r = []
            if i < len(left):
                r += [_num(i+1), _voca(left[i][0]), _mean(left[i][1])]
            else:
                r += [_num(""), _voca(""), _mean("")]
            r.append(_gap())
            if i < len(right):
                r += [_num(i+26), _voca(right[i][0]), _mean(right[i][1])]
            else:
                r += [_num(""), _voca(""), _mean("")]
            rows.append(r)

        mktable(sec, rows, cws, ROW_H, bf_outer=str(BF_CLEAN))

        spacer(sec, 2)
        mk_page_number(sec, 1)

    return build_doc(content)


# ══════════════════════════════════════════════════════════════
# 2. 빈칸 채우기
# ══════════════════════════════════════════════════════════════

def build_fill_blank(problems, title="빈칸 채우기"):
    def content(sec):
        mk_header_bar(sec)
        spacer(sec, 1)

        mktable(sec,
                [[_banner(f"  {title}")]],
                [USABLE_W], 2800, bf_outer=str(BF_CLEAN))
        spacer(sec, 1)
        mk_accent_line(sec)
        spacer(sec, 2)

        for pi, prob in enumerate(problems):
            mk_prob_badge(sec, prob['number'], prob.get('source', ''))
            spacer(sec, 1)

            segments = parse_passage(prob["passage"])
            mk_passage_bar(sec, segments, pp=str(PP_JUSTIFY))
            spacer(sec, 1)

            if prob.get("blanks"):
                half = USABLE_W // 2
                brows = []
                for j in range(0, len(prob["blanks"]), 2):
                    row = []
                    for k in range(2):
                        idx = j + k
                        if idx < len(prob["blanks"]):
                            lb, ans = prob["blanks"][idx]
                            row.append(_blank(f"({lb})  {ans}"))
                        else:
                            row.append({"t": "", "bf": str(BF_CLEAN),
                                        "cp": str(CP_PROB_BODY), "pp": str(PP_LEFT)})
                    brows.append(row)
                mktable(sec, brows, [half, USABLE_W - half], 1400, bf_outer=str(BF_CLEAN))

            spacer(sec, 2)

            if pi < len(problems) - 1:
                mkrule(sec)
                spacer(sec, 2)

        spacer(sec, 1)
        spacer(sec, 2)
        mk_page_number(sec, 1)

    return build_doc(content)


# ══════════════════════════════════════════════════════════════
# 3. 문법 선택
# ══════════════════════════════════════════════════════════════

def build_grammar(problems, title="문법 선택"):
    def content(sec):
        mk_header_bar(sec)
        spacer(sec, 1)

        mktable(sec,
                [[_banner(f"  {title}")]],
                [USABLE_W], 2800, bf_outer=str(BF_CLEAN))
        spacer(sec, 1)
        mk_accent_line(sec)
        spacer(sec, 2)

        for pi, prob in enumerate(problems):
            mk_prob_badge(sec, prob['number'], prob.get('source', ''))
            spacer(sec, 1)

            segments = parse_passage(prob["passage"])
            mk_passage_bar(sec, segments, pp=str(PP_JUSTIFY))
            spacer(sec, 1)

            if prob.get("choices"):
                half = USABLE_W // 2
                crows = []
                for oa, ob in prob["choices"]:
                    crows.append([_choice(f"\u2460 {oa}"), _choice(f"\u2461 {ob}")])
                mktable(sec, crows, [half, USABLE_W - half], 1400, bf_outer=str(BF_CLEAN))

            spacer(sec, 2)

            if pi < len(problems) - 1:
                mkrule(sec)
                spacer(sec, 2)

        spacer(sec, 1)
        spacer(sec, 2)
        mk_page_number(sec, 1)

    return build_doc(content)


# ══════════════════════════════════════════════════════════════
# 4. 지문 분석서 — 멀티로우 2단 테이블
# ══════════════════════════════════════════════════════════════

def build_analysis(problems, title="지문 분석서"):
    def content(sec):
        mkp(sec, title, cp=str(CP_TITLE), pp=str(PP_LEFT))
        mk_accent_line(sec)

        for i in range(0, len(problems), 2):
            L = problems[i]
            R = problems[i + 1] if i + 1 < len(problems) else None

            gap_w = 600
            col_w = (USABLE_W - gap_w) // 2
            cws = [col_w, gap_w, col_w]
            nc = 3

            Lv = L.get('vocab', [])
            Rv = R.get('vocab', []) if R else []
            Lg = L.get('grammar', [])
            Rg = R.get('grammar', []) if R else []
            nv = max(len(Lv), len(Rv) if R else 0)
            ng = max(len(Lg), len(Rg) if R else 0)

            # ── 셀 정의 헬퍼 ──
            _E = {"t": "", "bf": str(BF_CLEAN), "cp": "0", "pp": str(PP_LEFT),
                  "ml": 0, "mr": 0, "mt": 0, "mb": 0}

            def _c(t, bf=BF_CLEAN, cp=CP_AN_BODY, pp=PP_LEFT,
                   ml=350, mr=250, mt=150, mb=150):
                return {"t": t, "bf": str(bf), "cp": str(cp), "pp": str(pp),
                        "ml": ml, "mr": mr, "mt": mt, "mb": mb}

            def _sp(h=500):
                """섹션 간 여백 행"""
                return (h, _E, _E)

            # ── 행 리스트 구성 ──
            rows = []

            # 번호
            rows.append((1600,
                _c(f"{L['number']}.", cp=CP_ANALYSIS_NUM, mt=250, mb=150),
                _c(f"{R['number']}.", cp=CP_ANALYSIS_NUM, mt=250, mb=150) if R else _E))

            # 지문
            rows.append((18000,
                _c(L['passage'], bf=BF_ACCENT_BAR, pp=PP_JUSTIFY,
                   ml=650, mr=300, mt=250, mb=250),
                _c(R['passage'], bf=BF_ACCENT_BAR, pp=PP_JUSTIFY,
                   ml=650, mr=300, mt=250, mb=250) if R else _E))

            rows.append(_sp(1200))

            # 주제/제목
            rows.append((1200,
                _c("주제 / 제목", bf=BF_LABEL_BAR, cp=CP_SECTION_LBL,
                   ml=350, mt=250, mb=250),
                _c("주제 / 제목", bf=BF_LABEL_BAR, cp=CP_SECTION_LBL,
                   ml=350, mt=250, mb=250) if R else _E))
            rows.append((1600,
                _c(L.get('topic', ''), cp=CP_PROB_BOLD, ml=400, mt=300, mb=350),
                _c(R.get('topic', ''), cp=CP_PROB_BOLD, ml=400, mt=300, mb=350) if R else _E))

            rows.append(_sp(1200))

            # 핵심어휘
            rows.append((1300,
                _c("핵심 어휘", bf=BF_LABEL_BAR, cp=CP_SECTION_LBL,
                   ml=350, mt=300, mb=300),
                _c("핵심 어휘", bf=BF_LABEL_BAR, cp=CP_SECTION_LBL,
                   ml=350, mt=300, mb=300) if R else _E))

            for vi in range(nv):
                lv = f"\u2022  {Lv[vi]}" if vi < len(Lv) else ""
                rv = f"\u2022  {Rv[vi]}" if R and vi < len(Rv) else ""
                rows.append((1150,
                    _c(lv, ml=500, mt=180, mb=180),
                    _c(rv, ml=500, mt=180, mb=180) if R else _E))

            # ── 기타포인트를 하단 정렬하기 위한 동적 여백 ──
            top_h = sum(r[0] for r in rows)
            bottom_h = 1300 + ng * 1500   # 라벨 + 문법 항목
            PAGE_USABLE = PAGE_H - M_TOP - M_BOTTOM
            filler_h = max(600, PAGE_USABLE - 4000 - top_h - bottom_h)
            rows.append((filler_h, _E, _E))

            # 기타포인트
            rows.append((1300,
                _c("기타포인트", bf=BF_BLUE_BOX, cp=CP_SECTION_LBL,
                   ml=350, mt=300, mb=300),
                _c("기타포인트", bf=BF_BLUE_BOX, cp=CP_SECTION_LBL,
                   ml=350, mt=300, mb=300) if R else _E))

            for gi in range(ng):
                lg = Lg[gi] if gi < len(Lg) else ""
                rg = Rg[gi] if R and gi < len(Rg) else ""
                rows.append((1500,
                    _c(lg, bf=BF_BLUE_BOX, ml=400, mt=250, mb=250),
                    _c(rg, bf=BF_BLUE_BOX, ml=400, mt=250, mb=250) if R else _E))

            # ── 테이블 생성 ──
            nr = len(rows)
            tw = sum(cws)
            total_h = sum(r[0] for r in rows)

            p = ET.SubElement(sec, f"{HP}p", {
                "id": nid(), "paraPrIDRef": "0", "styleIDRef": "0",
                "pageBreak": "0", "columnBreak": "0", "merged": "0"})
            run_el = ET.SubElement(p, f"{HP}run", {"charPrIDRef": "0"})

            tbl = ET.SubElement(run_el, f"{HP}tbl", {
                "id": nid(), "zOrder": "0", "numberingType": "TABLE",
                "textWrap": "TOP_AND_BOTTOM", "textFlow": "BOTH_SIDES",
                "lock": "0", "dropcapstyle": "None", "pageBreak": "CELL",
                "repeatHeader": "0", "rowCnt": str(nr), "colCnt": str(nc),
                "cellSpacing": "0", "borderFillIDRef": str(BF_CLEAN),
                "noAdjust": "0"})
            ET.SubElement(tbl, f"{HP}sz", {
                "width": str(tw), "widthRelTo": "ABSOLUTE",
                "height": str(total_h), "heightRelTo": "ABSOLUTE",
                "protect": "0"})
            ET.SubElement(tbl, f"{HP}pos", {
                "treatAsChar": "1", "affectLSpacing": "0",
                "flowWithText": "1", "allowOverlap": "0",
                "holdAnchorAndSO": "0",
                "vertRelTo": "PARA", "horzRelTo": "COLUMN",
                "vertAlign": "TOP", "horzAlign": "LEFT",
                "vertOffset": "0", "horzOffset": "0"})
            ET.SubElement(tbl, f"{HP}outMargin",
                          {"left": "0", "right": "0", "top": "0", "bottom": "0"})
            ET.SubElement(tbl, f"{HP}inMargin",
                          {"left": "0", "right": "0", "top": "0", "bottom": "0"})

            czl = ET.SubElement(tbl, f"{HP}cellzoneList")
            for c in range(nc):
                ET.SubElement(czl, f"{HP}cellzone", {
                    "startRowAddr": "0", "startColAddr": str(c),
                    "endRowAddr": str(nr - 1), "endColAddr": str(c),
                    "borderFillIDRef": str(BF_CLEAN)})

            for ri, (rh, lcd, rcd) in enumerate(rows):
                tr = ET.SubElement(tbl, f"{HP}tr")
                tr.append(mkcell(0, ri, cws[0], rh, lcd["t"],
                                 bf=lcd["bf"], cp=lcd["cp"], pp=lcd["pp"],
                                 ml=lcd["ml"], mr=lcd["mr"],
                                 mt=lcd["mt"], mb=lcd["mb"], va="TOP"))
                tr.append(mkcell(1, ri, gap_w, rh, "",
                                 bf=str(BF_CLEAN), cp="0", pp=str(PP_LEFT),
                                 ml=0, mr=0, mt=0, mb=0))
                tr.append(mkcell(2, ri, cws[2], rh, rcd["t"],
                                 bf=rcd["bf"], cp=rcd["cp"], pp=rcd["pp"],
                                 ml=rcd["ml"], mr=rcd["mr"],
                                 mt=rcd["mt"], mb=rcd["mb"], va="TOP"))

    return build_doc(content)


# ══════════════════════════════════════════════════════════════
# 데이터
# ══════════════════════════════════════════════════════════════

VOCAB = [
    ("numerous", "많은, 다수의"), ("benefit", "이점"),
    ("sort through", "~을 정리하다"), ("anxiety", "불안(감)"),
    ("figure out", "~을 알다, 알아내다"), ("gratitude", "감사함"),
    ("reflect on", "~을 되돌아보다"), ("reveal", "드러내다"),
    ("document", "기록하다"), ("extend", "확장하다"),
    ("boost", "증진시키다"), ("enhance", "향상하다"),
    ("aid", "돕다"), ("foster", "촉진하다, 조성하다"),
    ("empathetic", "공감하는, 감정 이입되는"), ("evidence", "증거하다"),
    ("distress", "고통, 괴로움, 괴롭히다"), ("significant", "상당한, 의미심장한"),
    ("ivory", "상아"), ("confirm", "확인하다"),
    ("highlight", "강조하다"), ("status", "지위"),
    ("channel", "통하다, 쏟다"), ("actionable", "실행 가능한"),
    ("assist", "돕다"),
    ("comfort", "위안하다"), ("emotional contagion", "감정의 전염"),
    ("demonstrate", "보여주다"), ("mirror", "반영하다"),
    ("soothing", "진정시키는"), ("underscore", "강조하다"),
    ("illegal", "불법의"), ("horror", "공포"),
    ("kin", "친족"), ("come of age", "성숙해지다"),
    ("centerpiece", "중심"), ("whereabouts", "행방, 소재"),
    ("happenstance", "우연"), ("narrative", "이야기"),
    ("formulation", "공식화"), ("acclimation", "순응"),
    ("distinctive", "독특한"), ("journaling", "일기 쓰기, 기록하기"),
    ("complicated", "복잡한"), ("self-talk", "자기 대화"),
    ("gratitude", "감사하는 마음"), ("self-discovery", "자기 발견"),
    ("organize", "조직하다, 체계화하다"), ("entry", "항목, 기재"),
    ("exploration", "탐색, 탐구"), ("obligation", "의무"),
]

FILL_PROBLEMS = [
    {"number": "20", "source": "모의고사 20번",
     "passage": "Fans who are inclined to spend a lot of time thinking about what athletes owe them as fans should also think about the (A)               that fans might have as fans. One who thinks only about (that/ what) they are entitled to receive from their friends without ever giving a moment's thought to (that/ what) they owe their friends is, to put it mildly, not a very good friend. (           ), fans who only think about (that/ what) athletes owe them without ever thinking about what they owe to athletes (has/ have) failed to take the fan/athlete relationship all that (serious/ seriously). As in nearly every other (area/ areas) of human life, whatever special rights fans may possess (is/ are) limited by a corresponding set of obligations, and fans who never think about how they can be better fans even as they confidently (B)               about what athletes owe them (is/ are) hardly fulfilling their end of the bargain.",
     "blanks": [("A", "________________"), ("B", "________________")]},
    {"number": "22", "source": "모의고사 22번",
     "passage": "Commitment is the glue (held / holding) together characteristically human forms of social life. Commitments make individuals' behavior (predictable/ predictably) in the face of (A)               in their desires and interests, thereby (facilitate/ facilitating) the planning and coordination of (B)               actions (involved/ involving) multiple agents. (           ), commitments make people (unwilling/ willing) to perform actions that they would not (likewise/ otherwise) perform. (           ), a taxi driver picks up his clients and transports them to their desired destination because they are committed to (pay/ paying) him afterwards for the service, and a construction worker (performing/ performs) her job every day because her employer has made a (C)               commitment to pay her at the end of the month.",
     "blanks": [("A", "________________"), ("B", "________________"), ("C", "________________")]},
]

GRAMMAR_PROBLEMS = [
    {"number": "23", "source": "모의고사 23번",
     "passage": "If the brain has already stored someone's face and name, why do we still end up (to remember/ remembering) one and not the other? This is (because/ why) the brain has something of a two-tier memory system at work when it comes to (retrieve/ retrieving) memories, and this gives rise to a common yet frustrating sensation: recognising someone, but not (be/ being) able to remember how or why, or what their name is. This (is happened/ happens) because the brain distinguishes between familiarity and recall. To clarify, familiarity (or recognition) is when you encounter someone or something and you know you've (done/ been) so before. (           ) beyond that, you've got nothing; all you can say (is/ are) this person/thing is already in your memories. Recall is when you can retrieve the original memory of how and why you know this person; recognition is just flagging up the fact (which/ that) the memory exists.",
     "choices": [("to remember", "remembering"), ("because", "why"), ("retrieve", "retrieving"), ("be", "being"), ("is happened", "happens"), ("done", "been"), ("is", "are"), ("which", "that")]},
    {"number": "33", "source": "모의고사 33번",
     "passage": "When we realize we've said something in error and we pause to go back to correct it, we stop (to gesture/ gesturing) a couple of hundred milliseconds before we stop speaking. Such observations suggest the (startled/ startling) notion that our hands \"know\" (that/ what) we're going to say before our conscious minds (are/ do), and in fact this is often the case. Gesture can mentally activate a word so that the right term comes to our lips. When people are prevented from gesturing, they talk less (fluent/ fluently); their speech becomes halting because their hands are no longer able to supply them with the next word, and the next. Not being able to gesture (has/ have) other cognitive effects: without gesture to help our mental processes along, we remember less useful information, we solve problems less well, and we are less able to explain our thinking.",
     "choices": [("to gesture", "gesturing"), ("startled", "startling"), ("that", "what"), ("are", "do"), ("fluent", "fluently"), ("has", "have")]},
]

ANALYSIS_PROBLEMS = [
    {"number": "20", "source": "모의고사 20번",
     "passage": "Fans who are inclined to spend a lot of time thinking about what athletes owe them as fans should also think about the obligations that fans might have as fans. One who thinks only about what they are entitled to receive from their friends without ever giving a moment's thought to what they owe their friends is, to put it mildly, not a very good friend. Similarly, fans who only think about what athletes owe them without ever thinking about what they owe to athletes have failed to take the fan/athlete relationship all that seriously. As in nearly every other area of human life, whatever special rights fans may possess are limited by a corresponding set of obligations, and fans who never think about how they can be better fans even as they confidently pronounce about what athletes owe them are hardly fulfilling their end of the bargain.",
     "topic": "팬과 선수의 관계에서의 상호 의무와 권리",
     "vocab": ["Inclined", "Entitled", "Obligation", "Possess",
               "Corresponding", "Fulfilling", "Bargain",
               "Confidently", "Put it mildly", "Deserve"],
     "grammar": ["what vs. that: what = 선행사 포함 관계대명사, that = 접속사",
                  "수일치: every + 단수명사 → 단수동사 (is)"]},
    {"number": "22", "source": "모의고사 22번",
     "passage": "Commitment is the glue holding together characteristically human forms of social life. Commitments make individuals' behavior predictable in the face of fluctuations in their desires and interests, thereby facilitating the planning and coordination of joint actions involving multiple agents. Moreover, commitments make people willing to perform actions that they would not otherwise perform. For instance, a taxi driver picks up his clients and transports them to their desired destination because they are committed to paying him afterwards for the service, and a construction worker performs her job every day because her employer has made a binding commitment to pay her at the end of the month.",
     "topic": "약속(commitment)이 사회적 협력을 가능하게 하는 원리",
     "vocab": ["Commitment", "Predictable", "Facilitate",
               "Coordination", "Otherwise", "Transport",
               "Employer", "Perform", "Unwilling", "Desired"],
     "grammar": ["분사구문: thereby facilitating — 주절 결과를 나타내는 부대상황",
                  "be committed to + -ing: to는 전치사 → 뒤에 동명사"]},
]


# ══════════════════════════════════════════════════════════════
# 실행
# ══════════════════════════════════════════════════════════════

def main():
    outdir = "/mnt/d/projects/doc_design/hwpx_project/output"

    docs = [
        ("01_단어정리표.hwpx",  build_vocab(VOCAB)),
        ("02_빈칸채우기.hwpx",  build_fill_blank(FILL_PROBLEMS)),
        ("03_문법선택.hwpx",    build_grammar(GRAMMAR_PROBLEMS)),
        ("04_분석서.hwpx",      build_analysis(ANALYSIS_PROBLEMS)),
    ]

    for name, data in docs:
        path = os.path.join(outdir, name)
        with open(path, "wb") as f:
            f.write(data)
        print(f"✓ {name} ({len(data):,} bytes)")

    print("\n모든 파일 생성 완료!")


if __name__ == "__main__":
    main()
