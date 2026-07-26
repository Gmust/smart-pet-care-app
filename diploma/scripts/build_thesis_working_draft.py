from __future__ import annotations

from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile, ZipInfo

from docx import Document
from docx.enum.section import WD_SECTION
from docx.enum.style import WD_STYLE_TYPE
from docx.enum.table import WD_CELL_VERTICAL_ALIGNMENT, WD_TABLE_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Cm, Pt, RGBColor

ROOT = Path(__file__).resolve().parents[2]
OUTPUT_DIR = ROOT / "diploma" / "output"
OUTPUT_PATH = OUTPUT_DIR / "Smart_Pet_Care_CDV_Thesis_Working_Draft.docx"
DIAGRAM_DIR = ROOT / "diploma" / "diagrams"

FONT_NAME = "Verdana"
BLACK = RGBColor(0x00, 0x00, 0x00)
PLACEHOLDER_COLOR = RGBColor(0x9C, 0x00, 0x06)
TABLE_HEADER_FILL = "E7E6E6"
NOTE_FILL = "FFF2CC"
ASSIGNMENT_FILL = "D9EAF7"
CONTENT_WIDTH_DXA = 9060
PACKAGE_TIMESTAMP = (1980, 1, 1, 0, 0, 0)

SECTION_ASSIGNMENTS = {
    "Introduction": "Illia assembles; all authors provide and review the description of their contribution.",
    "1. Current state of knowledge": "Kseniia leads the literature chapter; all authors review claims related to their technical area.",
    "1.1 Pet-care workflow context": "Kseniia writes the research context; Anastasia confirms the owner problem and product need.",
    "1.2 Review of existing solutions": "Kseniia writes the comparison; Anastasia reviews product and UX observations.",
    "1.3 Cross-platform mobile architecture": "Illia writes and provides mobile-architecture evidence.",
    "1.4 Client-server communication and server state": "Illia writes the mobile integration; Volodymyr reviews the C# backend boundary.",
    "1.5 Runtime validation, privacy, and safety boundaries": "Illia writes technical and AI boundaries; Kseniia verifies supporting research.",
    "1.6 Mobile-application testing": "Illia writes the test approach; Kseniia reviews methodology and evidence.",
    "1.7 Synthesis and project positioning": "Kseniia and Illia write; Anastasia confirms product positioning.",
    "2. Objective and scope": "Anastasia leads product scope; Illia integrates the final team decision.",
    "2.1 Main objective": "Anastasia drafts the objective; Illia makes it measurable and consistent with the implementation.",
    "2.2 Actors": "Anastasia defines user actors; Illia and Volodymyr confirm technical actors.",
    "2.3 Functional requirements": "Anastasia drafts user requirements; Volodymyr and Illia confirm backend, mobile, and AI feasibility.",
    "2.4 Non-functional requirements": "Illia drafts measurable technical requirements; Kseniia verifies research support.",
    "2.5 Use-case catalogue and traceability": "Anastasia writes user flows; Illia maps implementation and verification.",
    "2.6 Scope limitations": "Illia coordinates; every author adds limitations from their owned area.",
    "2.7 Team roles and work allocation": "Illia assembles; all four authors review and approve their own responsibility description.",
    "2.8 Author-confirmed first-version scope": "Illia maintains the scope table; all authors classify and approve included, deferred, and omitted items.",
    "3. Methodology": "Illia coordinates the chapter; Kseniia reviews the research method.",
    "3.1 Requirements discovery and prioritization": "Anastasia describes product decisions; Kseniia documents the research method; Illia records prioritization.",
    "3.2 Project organization": "Illia writes the actual workflow, tools, meetings, reviews, and evidence process.",
    "3.3 System architecture": "Volodymyr writes the C# backend architecture; Illia writes mobile and AI architecture.",
    "3.4 Domain and interaction models": "Volodymyr confirms backend/domain relations; Illia confirms contracts and sequences; Anastasia reviews user flows.",
    "3.5 Technology-selection method": "Illia writes technical decisions; Kseniia checks sources and rejected alternatives.",
    "3.6 Verification method": "Illia writes the verification process; Kseniia checks methodology; every technical owner supplies test procedures.",
    "4. Project implementation": "Each technical owner writes their subsections; Illia integrates the chapter.",
    "4.1 Mobile application structure": "Illia writes; Anastasia reviews frontend/product structure.",
    "4.2 Authentication and session lifecycle": "Illia writes the mobile flow; Volodymyr writes or reviews backend authentication behavior.",
    "4.3 Pet-profile management": "Anastasia describes the UI; Illia describes mobile integration; Volodymyr confirms backend behavior.",
    "4.4 Reminders and native notifications": "Illia writes mobile and FCM-client behavior; Volodymyr writes backend reminder and notification behavior.",
    "4.5 Pet-scoped assistant": "Illia writes mobile and Python AI analysis; Kseniia writes the C# persistence/integration part; Volodymyr reviews shared backend work.",
    "4.6 Offline behavior and error recovery": "Illia writes and supplies mobile recovery evidence.",
    "4.7 User interface, localization, and accessibility": "Anastasia writes product, UX, and design decisions; Illia adds implementation and test evidence.",
    "4.8 External backend and AI-service boundaries": "Volodymyr writes core C# backend; Kseniia writes owned backend features and classifier integration; Illia writes Python AI service.",
    "4.9 Verification results": "Illia assembles; every owner supplies results for their modules and reviews the interpretation.",
    "5. Deployment and operation": "Volodymyr writes backend deployment; Illia writes mobile and AI deployment and integrates the chapter.",
    "5.1 Prerequisites and configuration": "Illia documents mobile/AI prerequisites; Volodymyr documents backend/database prerequisites.",
    "5.2 Installation and Android execution": "Illia writes and supplies the final Android build, installation, and execution evidence.",
    "5.3 External system boundaries": "Volodymyr documents backend, database, and Firebase boundaries; Illia documents Google and AI-service boundaries.",
    "5.4 User operation": "Anastasia writes user instructions and selects screenshots; Illia confirms they match the final build.",
    "5.5 Maintenance and limitations": "Volodymyr writes backend operational limits; Illia writes mobile/AI limits; all authors review.",
    "Summary and conclusions": "All authors provide conclusions from their area; Illia assembles the final two-page section.",
    "Bibliography": "Kseniia maintains and verifies the bibliography; all authors confirm sources used in their sections.",
    "Printed and scientific literature": "Kseniia verifies metadata, relevance, and source-to-claim mapping.",
    "Online sources": "Kseniia verifies links, access dates, metadata, and source-to-claim mapping.",
    "List of figures": "Illia updates the Word field after all figures are final.",
    "List of tables": "Illia updates the Word field after all tables are final.",
    "Streszczenie": "Illia drafts from the final conclusions; Kseniia and the full team review the Polish text.",
    "Abstract": "Illia drafts from the final conclusions; Kseniia and the full team review the English text.",
    "Team work-allocation sheet": "Illia collects the final entries; every author verifies and signs their allocation.",
}

SECTION_TIPS = {
    "Introduction": "Briefly explain the pet-owner problem, project objective, method, evaluated scope, main contribution, limitations, and chapter structure.",
    "1. Current state of knowledge": "Use peer-reviewed and primary sources to explain what is already known; do not describe project implementation here.",
    "1.1 Pet-care workflow context": "Search for pet-owner information needs, reminder and record-keeping problems, online health-information behavior, and mobile pet-care requirements.",
    "1.2 Review of existing solutions": "Compare current pet-care applications using the same dated criteria: profiles, health records, reminders, sharing, assistant behavior, platform, and limitations.",
    "1.3 Cross-platform mobile architecture": "Explain React Native and Expo trade-offs using official documentation and empirical cross-platform performance or energy studies.",
    "1.4 Client-server communication and server state": "Explain OpenAPI-generated clients, React Query caching/invalidation, Axios requests, authentication refresh, and why a contract is not runtime proof.",
    "1.5 Runtime validation, privacy, and safety boundaries": "Research Zod runtime validation, SecureStore, relevant OWASP MASVS controls, and veterinary generative-AI risks and disclaimers.",
    "1.6 Mobile-application testing": "Describe static, unit, component, integration, Android-device, accessibility, and usability testing; search relevant ISO testing and usability concepts.",
    "1.7 Synthesis and project positioning": "Summarize the literature gap and state the engineering contribution without claiming clinical effectiveness, market novelty, or framework superiority.",
    "2. Objective and scope": "State exactly what the first version will deliver and verify, then separate version-2, omitted, and clinically excluded functionality.",
    "2.1 Main objective": "Write one measurable objective using action verbs such as design, implement, integrate, and verify; define what evidence proves completion.",
    "2.2 Actors": "List only people and external systems that interact with the evaluated release, then check them against routes, APIs, Google identity, Firebase, and the assistant flow.",
    "2.3 Functional requirements": "Write testable 'the user/system can' statements and connect each requirement to an implementation path and acceptance scenario.",
    "2.4 Non-functional requirements": "Define measurable quality targets with context, method, and units for reliability, security, accessibility, performance, maintainability, and recovery.",
    "2.5 Use-case catalogue and traceability": "For each use case record actor, preconditions, main flow, alternative/error flow, requirement ID, implementation, and verification evidence.",
    "2.6 Scope limitations": "List what was not evaluated: clinical accuracy, unsupported platforms/languages, unexecuted security or scalability work, branch-only features, and missing runtime evidence.",
    "2.7 Team roles and work allocation": "Describe responsibilities using repositories, Figma, research, testing, review, and coordination evidence; do not calculate effort from commit counts alone.",
    "2.8 Author-confirmed first-version scope": "Classify every checklist item as included, version 2, excluded, or unconfirmed, and record the accepted revision and required evidence.",
    "3. Methodology": "Explain how the team actually worked and how evidence was collected; avoid naming a formal method unless the team can demonstrate it.",
    "3.1 Requirements discovery and prioritization": "Describe where requirements came from, who decided priorities, what changed, and which evidence records the decisions.",
    "3.2 Project organization": "Describe Git branches, Jira, reviews, meetings, responsibility handoffs, quality gates, and how disagreements or scope changes were handled.",
    "3.3 System architecture": "Describe the mobile, C# backend, PostgreSQL, Firebase/Google, and Python AI components, their protocols, ownership, and deployment boundaries.",
    "3.4 Domain and interaction models": "Explain the main entities and relationships, then describe authentication, notification, and assistant sequences using the final API contract.",
    "3.5 Technology-selection method": "For each important technology record the requirement, alternatives actually considered, decision criteria, trade-off, participants, and reconsideration trigger.",
    "3.6 Verification method": "Define PASS, FAIL, BLOCKED, and NOT RUN; record revision, environment, steps, expected/observed result, executor, date, and evidence for each test.",
    "4. Project implementation": "Write what was actually built, why important decisions were made, problems encountered, solutions applied, and evidence for each subsystem.",
    "4.1 Mobile application structure": "Explain Expo Router, providers, feature modules, shared components, state/data flow, and which accepted revision contains the structure.",
    "4.2 Authentication and session lifecycle": "Describe registration/login, token storage, restoration, refresh, concurrent 401 handling, Google sign-in, logout, and related mobile/backend tests.",
    "4.3 Pet-profile management": "Describe list/detail/create/edit/delete/photo and accepted weight/health/care flows, cache invalidation, validation, backend endpoints, and Android evidence.",
    "4.4 Reminders and native notifications": "Describe reminder CRUD, schedules/time zones, FCM token registration/rotation, notification tap routing, backend delivery, and lifecycle tests.",
    "4.5 Pet-scoped assistant": "Separate mobile presentation, C# session/history integration, and Python analysis; explain consent, last-eight context, safety rules, prediction, Gemini text, failures, and disclaimers.",
    "4.6 Offline behavior and error recovery": "Describe what remains visible offline, which operations fail or pause, reconnection behavior, retry limits, error UI, and tested transitions.",
    "4.7 User interface, localization, and accessibility": "Explain design system and major UX choices; provide Figma/screenshots and evidence for English localization, labels, scaling, contrast, focus, and touch targets.",
    "4.8 External backend and AI-service boundaries": "Document final repository revisions, owned modules, data flow, contracts, persistence, model/provider boundary, resilience, deployment, monitoring, and tests.",
    "4.9 Verification results": "Report observed results in tables with exact revisions and environments; include failures and limitations and avoid converting repository presence into PASS.",
    "5. Deployment and operation": "Explain how each accepted component is configured, built, deployed, operated, monitored, and rolled back using sanitized evidence.",
    "5.1 Prerequisites and configuration": "List exact supported tool/runtime versions, required environment variables by name only, external services, database setup, and secret-handling rules.",
    "5.2 Installation and Android execution": "Give repeatable build/install/run steps and record device model, Android/API level, package/version, artifact digest, and observed launch result.",
    "5.3 External system boundaries": "Explain Google identity, Firebase, Cloudinary if retained, backend database, and AI service responsibilities, credentials, protocols, timeouts, and failure behavior.",
    "5.4 User operation": "Write short step-by-step instructions for the final core flows and insert sanitized screenshots taken from the identified accepted build.",
    "5.5 Maintenance and limitations": "Describe migrations, logging, monitoring, backups, dependency/model updates, rollback, known defects, operational risks, and future improvements.",
    "Summary and conclusions": "Answer the objective and every acceptance criterion using final results; state achieved, partial, failed, and future work without adding new evidence.",
    "Bibliography": "Include only sources cited in the thesis, verify metadata against authoritative records, preserve the required format, and remove unsupported or duplicate entries.",
    "Printed and scientific literature": "Check authors, title, journal/standard, year, volume/pages, DOI or identifier, full-text access, and the exact claim supported.",
    "Online sources": "Prefer official documentation; record title, publisher, stable URL, version where relevant, access date, and the thesis claim supported.",
    "List of figures": "After final captions are fixed, update the Word field and check that every figure number, title, body reference, and page number is correct.",
    "List of tables": "After final captions are fixed, update the Word field and check that every table number, title, body reference, and page number is correct.",
    "Streszczenie": "Write a concise Polish summary of problem, objective, method, implementation, main verified results, limitations, and five or six keywords.",
    "Abstract": "Write the English equivalent of the approved Polish summary with the same facts, result boundaries, and five or six keywords.",
    "Team work-allocation sheet": "Copy the final evidence-reviewed responsibilities and percentages into the official CDV form and collect all required signatures.",
}


def normalize_docx_package(path: Path) -> None:
    normalized_path = path.with_suffix(".normalized.docx")
    with ZipFile(path) as source_archive:
        entries = [
            (source_info, source_archive.read(source_info.filename))
            for source_info in source_archive.infolist()
        ]

    with ZipFile(
        normalized_path,
        "w",
        compression=ZIP_DEFLATED,
        compresslevel=9,
    ) as normalized_archive:
        for source_info, payload in entries:
            normalized_info = ZipInfo(source_info.filename, PACKAGE_TIMESTAMP)
            normalized_info.compress_type = source_info.compress_type
            normalized_info.comment = source_info.comment
            normalized_info.extra = source_info.extra
            normalized_info.create_system = source_info.create_system
            normalized_info.create_version = source_info.create_version
            normalized_info.extract_version = source_info.extract_version
            normalized_info.flag_bits = source_info.flag_bits
            normalized_info.volume = source_info.volume
            normalized_info.internal_attr = source_info.internal_attr
            normalized_info.external_attr = source_info.external_attr
            normalized_archive.writestr(normalized_info, payload)

    normalized_path.replace(path)


def set_run_font(
    run,
    *,
    size: float = 10,
    bold: bool = False,
    italic: bool = False,
    color: RGBColor = BLACK,
) -> None:
    run.font.name = FONT_NAME
    run.font.size = Pt(size)
    run.font.bold = bold
    run.font.italic = italic
    run.font.color.rgb = color
    run_properties = run._element.get_or_add_rPr()
    fonts = run_properties.rFonts
    if fonts is None:
        fonts = OxmlElement("w:rFonts")
        run_properties.insert(0, fonts)
    fonts.set(qn("w:ascii"), FONT_NAME)
    fonts.set(qn("w:hAnsi"), FONT_NAME)
    fonts.set(qn("w:eastAsia"), FONT_NAME)
    fonts.set(qn("w:cs"), FONT_NAME)


def set_cell_shading(cell, fill: str) -> None:
    cell_properties = cell._tc.get_or_add_tcPr()
    shading = cell_properties.find(qn("w:shd"))
    if shading is None:
        shading = OxmlElement("w:shd")
        cell_properties.append(shading)
    shading.set(qn("w:fill"), fill)


def set_cell_margins(
    cell,
    *,
    top: int = 90,
    start: int = 100,
    bottom: int = 90,
    end: int = 100,
) -> None:
    cell_properties = cell._tc.get_or_add_tcPr()
    margins = cell_properties.first_child_found_in("w:tcMar")
    if margins is None:
        margins = OxmlElement("w:tcMar")
        cell_properties.append(margins)
    for edge, value in (
        ("top", top),
        ("start", start),
        ("bottom", bottom),
        ("end", end),
    ):
        node = margins.find(qn(f"w:{edge}"))
        if node is None:
            node = OxmlElement(f"w:{edge}")
            margins.append(node)
        node.set(qn("w:w"), str(value))
        node.set(qn("w:type"), "dxa")


def set_cell_width(cell, width_dxa: int) -> None:
    cell_properties = cell._tc.get_or_add_tcPr()
    width = cell_properties.find(qn("w:tcW"))
    if width is None:
        width = OxmlElement("w:tcW")
        cell_properties.append(width)
    width.set(qn("w:w"), str(width_dxa))
    width.set(qn("w:type"), "dxa")


def set_repeat_table_header(row) -> None:
    row_properties = row._tr.get_or_add_trPr()
    repeat = OxmlElement("w:tblHeader")
    repeat.set(qn("w:val"), "true")
    row_properties.append(repeat)


def set_table_geometry(table, widths_dxa: list[int]) -> None:
    if sum(widths_dxa) != CONTENT_WIDTH_DXA:
        raise ValueError("Table widths must total the configured content width")

    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    table_properties = table._tbl.tblPr

    table_width = table_properties.find(qn("w:tblW"))
    if table_width is None:
        table_width = OxmlElement("w:tblW")
        table_properties.append(table_width)
    table_width.set(qn("w:w"), str(CONTENT_WIDTH_DXA))
    table_width.set(qn("w:type"), "dxa")

    table_indent = table_properties.find(qn("w:tblInd"))
    if table_indent is None:
        table_indent = OxmlElement("w:tblInd")
        table_properties.append(table_indent)
    table_indent.set(qn("w:w"), "100")
    table_indent.set(qn("w:type"), "dxa")

    layout = table_properties.find(qn("w:tblLayout"))
    if layout is None:
        layout = OxmlElement("w:tblLayout")
        table_properties.append(layout)
    layout.set(qn("w:type"), "fixed")

    grid = table._tbl.tblGrid
    for child in list(grid):
        grid.remove(child)
    for width_dxa in widths_dxa:
        grid_column = OxmlElement("w:gridCol")
        grid_column.set(qn("w:w"), str(width_dxa))
        grid.append(grid_column)

    for row in table.rows:
        for index, cell in enumerate(row.cells):
            set_cell_width(cell, widths_dxa[index])
            set_cell_margins(cell)
            cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER


def set_table_borders(table, color: str = "808080", size: int = 4) -> None:
    table_properties = table._tbl.tblPr
    borders = table_properties.find(qn("w:tblBorders"))
    if borders is None:
        borders = OxmlElement("w:tblBorders")
        table_properties.append(borders)
    for edge in ("top", "left", "bottom", "right", "insideH", "insideV"):
        border = borders.find(qn(f"w:{edge}"))
        if border is None:
            border = OxmlElement(f"w:{edge}")
            borders.append(border)
        border.set(qn("w:val"), "single")
        border.set(qn("w:sz"), str(size))
        border.set(qn("w:space"), "0")
        border.set(qn("w:color"), color)


def add_table(
    document: Document,
    headers: list[str],
    rows: list[list[str]],
    widths_dxa: list[int],
    *,
    caption_text: str,
    chapter_prefix: str,
    sequence_number: int,
    restart_sequence: bool = False,
):
    caption = document.add_paragraph(style="Caption")
    caption.alignment = WD_ALIGN_PARAGRAPH.LEFT
    caption.paragraph_format.keep_with_next = True
    prefix = caption.add_run(f"Table {chapter_prefix}.")
    set_run_font(prefix, size=9)
    sequence_instruction = " SEQ Table \\* ARABIC "
    if restart_sequence:
        sequence_instruction = " SEQ Table \\r 1 \\* ARABIC "
    add_field(
        caption,
        sequence_instruction,
        str(sequence_number),
    )
    suffix = caption.add_run(f". {caption_text}")
    set_run_font(suffix, size=9)
    for run in caption.runs:
        if run.font.name is None:
            set_run_font(run, size=9)

    table = document.add_table(rows=1, cols=len(headers))
    set_table_geometry(table, widths_dxa)
    set_table_borders(table)
    header_row = table.rows[0]
    set_repeat_table_header(header_row)

    for index, header in enumerate(headers):
        cell = header_row.cells[index]
        set_cell_shading(cell, TABLE_HEADER_FILL)
        paragraph = cell.paragraphs[0]
        paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER
        paragraph.paragraph_format.first_line_indent = Cm(0)
        paragraph.paragraph_format.space_before = Pt(0)
        paragraph.paragraph_format.space_after = Pt(0)
        run = paragraph.add_run(header)
        set_run_font(run, size=9, bold=True)

    for row_values in rows:
        row = table.add_row()
        for index, value in enumerate(row_values):
            cell = row.cells[index]
            paragraph = cell.paragraphs[0]
            paragraph.alignment = WD_ALIGN_PARAGRAPH.LEFT
            paragraph.paragraph_format.first_line_indent = Cm(0)
            paragraph.paragraph_format.space_before = Pt(0)
            paragraph.paragraph_format.space_after = Pt(0)
            run = paragraph.add_run(value)
            set_run_font(run, size=9)

    set_table_geometry(table, widths_dxa)
    document.add_paragraph()
    return table


def add_field(paragraph, instruction: str, placeholder: str = "") -> None:
    run = paragraph.add_run()
    begin = OxmlElement("w:fldChar")
    begin.set(qn("w:fldCharType"), "begin")
    instruction_text = OxmlElement("w:instrText")
    instruction_text.set(qn("xml:space"), "preserve")
    instruction_text.text = instruction
    separate = OxmlElement("w:fldChar")
    separate.set(qn("w:fldCharType"), "separate")
    text = OxmlElement("w:t")
    text.text = placeholder
    end = OxmlElement("w:fldChar")
    end.set(qn("w:fldCharType"), "end")
    run._r.extend([begin, instruction_text, separate, text, end])


def set_page_number_continuation(section) -> None:
    section_properties = section._sectPr
    page_number_type = section_properties.find(qn("w:pgNumType"))
    if page_number_type is None:
        page_number_type = OxmlElement("w:pgNumType")
        section_properties.append(page_number_type)
    page_number_type.attrib.pop(qn("w:start"), None)


def add_page_number_footer(section) -> None:
    section.footer.is_linked_to_previous = False
    paragraph = section.footer.paragraphs[0]
    paragraph.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    paragraph.paragraph_format.first_line_indent = Cm(0)
    paragraph.paragraph_format.space_before = Pt(0)
    paragraph.paragraph_format.space_after = Pt(0)
    add_field(paragraph, " PAGE ", "1")
    for run in paragraph.runs:
        set_run_font(run, size=10)


def add_placeholder_paragraph(
    document: Document,
    text: str,
    *,
    label: str = "AUTHOR INPUT REQUIRED",
) -> None:
    paragraph = document.add_paragraph(style="Draft Note")
    run = paragraph.add_run(f"{label}: {text}")
    set_run_font(run, size=9, bold=True, color=PLACEHOLDER_COLOR)
    paragraph_properties = paragraph._p.get_or_add_pPr()
    shading = OxmlElement("w:shd")
    shading.set(qn("w:fill"), NOTE_FILL)
    paragraph_properties.append(shading)


def add_body_paragraph(
    document: Document,
    text: str,
    *,
    bold_prefix: str | None = None,
) -> None:
    paragraph = document.add_paragraph()
    if bold_prefix is not None and text.startswith(bold_prefix):
        prefix = paragraph.add_run(bold_prefix)
        set_run_font(prefix, bold=True)
        remainder = paragraph.add_run(text[len(bold_prefix) :])
        set_run_font(remainder)
        return
    run = paragraph.add_run(text)
    set_run_font(run)


def add_figure(
    document: Document,
    *,
    image_name: str,
    caption_text: str,
    alt_text: str,
    chapter_prefix: str,
    sequence_number: int,
    restart_sequence: bool = False,
    width_cm: float,
) -> None:
    image_path = DIAGRAM_DIR / image_name
    if not image_path.is_file():
        raise FileNotFoundError(f"Required thesis figure is missing: {image_path}")

    image_paragraph = document.add_paragraph()
    image_paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER
    image_paragraph.paragraph_format.first_line_indent = Cm(0)
    image_paragraph.paragraph_format.space_before = Pt(6)
    image_paragraph.paragraph_format.space_after = Pt(0)
    image_paragraph.paragraph_format.keep_with_next = True

    image_run = image_paragraph.add_run()
    inline_shape = image_run.add_picture(str(image_path), width=Cm(width_cm))
    drawing_properties = inline_shape._inline.docPr
    drawing_properties.set("name", image_path.stem)
    drawing_properties.set("title", caption_text)
    drawing_properties.set("descr", alt_text)

    caption = document.add_paragraph(style="Caption")
    caption.alignment = WD_ALIGN_PARAGRAPH.LEFT
    caption.paragraph_format.keep_with_next = False
    prefix = caption.add_run(f"Figure {chapter_prefix}.")
    set_run_font(prefix, size=9)
    sequence_instruction = " SEQ Figure \\* ARABIC "
    if restart_sequence:
        sequence_instruction = " SEQ Figure \\r 1 \\* ARABIC "
    add_field(
        caption,
        sequence_instruction,
        str(sequence_number),
    )
    suffix = caption.add_run(
        f". {caption_text} "
        "(source: authors' own work; working draft requiring verification)."
    )
    set_run_font(suffix, size=9)
    for run in caption.runs:
        if run.font.name is None:
            set_run_font(run, size=9)


def add_heading(document: Document, text: str, level: int) -> None:
    paragraph = document.add_paragraph(style=f"Heading {level}")
    run = paragraph.add_run(text)
    set_run_font(run, size=12 if level == 1 else 10, bold=True)
    assignment = SECTION_ASSIGNMENTS.get(text)
    if assignment is not None:
        assignment_paragraph = document.add_paragraph(style="Section Assignment")
        assignment_run = assignment_paragraph.add_run(f"WHO WRITES THIS: {assignment}")
        set_run_font(
            assignment_run,
            size=9,
            bold=True,
            color=RGBColor(0x1F, 0x4D, 0x78),
        )
        assignment_properties = assignment_paragraph._p.get_or_add_pPr()
        shading = OxmlElement("w:shd")
        shading.set(qn("w:fill"), ASSIGNMENT_FILL)
        assignment_properties.append(shading)
        tip = SECTION_TIPS.get(text)
        if tip is not None:
            tip_break = assignment_paragraph.add_run()
            tip_break.add_break()
            tip_run = assignment_paragraph.add_run(f"TIP: {tip}")
            set_run_font(
                tip_run,
                size=8.5,
                bold=False,
                color=RGBColor(0x1F, 0x4D, 0x78),
            )


def configure_styles(document: Document) -> None:
    styles = document.styles

    normal = styles["Normal"]
    normal.font.name = FONT_NAME
    normal.font.size = Pt(10)
    normal._element.rPr.rFonts.set(qn("w:ascii"), FONT_NAME)
    normal._element.rPr.rFonts.set(qn("w:hAnsi"), FONT_NAME)
    normal.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    normal.paragraph_format.first_line_indent = Cm(1.25)
    normal.paragraph_format.space_before = Pt(0)
    normal.paragraph_format.space_after = Pt(0)
    normal.paragraph_format.line_spacing = 1.15

    for level in (1, 2, 3):
        style = styles[f"Heading {level}"]
        style.font.name = FONT_NAME
        style.font.size = Pt(12 if level == 1 else 10)
        style.font.bold = True
        style.font.color.rgb = BLACK
        style._element.rPr.rFonts.set(qn("w:ascii"), FONT_NAME)
        style._element.rPr.rFonts.set(qn("w:hAnsi"), FONT_NAME)
        style.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.LEFT
        style.paragraph_format.first_line_indent = Cm(0)
        style.paragraph_format.space_before = Pt(15 if level > 1 else 0)
        style.paragraph_format.space_after = Pt(15)
        style.paragraph_format.line_spacing = 1.0
        style.paragraph_format.keep_with_next = True
        if level == 1:
            style.paragraph_format.page_break_before = True

    caption = styles["Caption"]
    caption.font.name = FONT_NAME
    caption.font.size = Pt(10)
    caption.font.color.rgb = BLACK
    caption._element.rPr.rFonts.set(qn("w:ascii"), FONT_NAME)
    caption._element.rPr.rFonts.set(qn("w:hAnsi"), FONT_NAME)
    caption.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.LEFT
    caption.paragraph_format.first_line_indent = Cm(0)
    caption.paragraph_format.space_before = Pt(6)
    caption.paragraph_format.space_after = Pt(6)

    if "Draft Note" not in styles:
        draft_note = styles.add_style("Draft Note", WD_STYLE_TYPE.PARAGRAPH)
    else:
        draft_note = styles["Draft Note"]
    draft_note.font.name = FONT_NAME
    draft_note.font.size = Pt(9)
    draft_note.font.bold = True
    draft_note.font.color.rgb = PLACEHOLDER_COLOR
    draft_note._element.rPr.rFonts.set(qn("w:ascii"), FONT_NAME)
    draft_note._element.rPr.rFonts.set(qn("w:hAnsi"), FONT_NAME)
    draft_note.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.LEFT
    draft_note.paragraph_format.first_line_indent = Cm(0)
    draft_note.paragraph_format.space_before = Pt(6)
    draft_note.paragraph_format.space_after = Pt(6)
    draft_note.paragraph_format.line_spacing = 1.0

    if "Section Assignment" not in styles:
        section_assignment = styles.add_style(
            "Section Assignment",
            WD_STYLE_TYPE.PARAGRAPH,
        )
    else:
        section_assignment = styles["Section Assignment"]
    section_assignment.font.name = FONT_NAME
    section_assignment.font.size = Pt(9)
    section_assignment.font.bold = True
    section_assignment.font.color.rgb = RGBColor(0x1F, 0x4D, 0x78)
    section_assignment._element.rPr.rFonts.set(qn("w:ascii"), FONT_NAME)
    section_assignment._element.rPr.rFonts.set(qn("w:hAnsi"), FONT_NAME)
    section_assignment.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.LEFT
    section_assignment.paragraph_format.first_line_indent = Cm(0)
    section_assignment.paragraph_format.left_indent = Cm(0.2)
    section_assignment.paragraph_format.right_indent = Cm(0.2)
    section_assignment.paragraph_format.space_before = Pt(0)
    section_assignment.paragraph_format.space_after = Pt(6)
    section_assignment.paragraph_format.line_spacing = 1.0
    section_assignment.paragraph_format.keep_with_next = True


def configure_sections(document: Document) -> None:
    for section in document.sections:
        section.page_width = Cm(21)
        section.page_height = Cm(29.7)
        section.top_margin = Cm(2.5)
        section.bottom_margin = Cm(2.5)
        section.left_margin = Cm(2.5)
        section.right_margin = Cm(2.5)
        section.header_distance = Cm(1.25)
        section.footer_distance = Cm(1.25)


def add_centered_line(
    document: Document,
    text: str,
    *,
    size: float,
    bold: bool = False,
    before: float = 0,
    after: float = 0,
) -> None:
    paragraph = document.add_paragraph()
    paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER
    paragraph.paragraph_format.first_line_indent = Cm(0)
    paragraph.paragraph_format.space_before = Pt(before)
    paragraph.paragraph_format.space_after = Pt(after)
    paragraph.paragraph_format.line_spacing = 1.0
    run = paragraph.add_run(text)
    set_run_font(run, size=size, bold=bold)


def add_title_page(document: Document) -> None:
    add_centered_line(
        document,
        "COLLEGIUM DA VINCI",
        size=16,
        bold=True,
        before=18,
        after=12,
    )
    add_centered_line(
        document,
        "Faculty of Applied Sciences",
        size=14,
        bold=True,
        after=10,
    )
    add_centered_line(
        document,
        "Major: INFORMATION TECHNOLOGY",
        size=14,
        bold=True,
        after=2,
    )
    add_centered_line(
        document,
        "first-cycle studies",
        size=12,
        bold=True,
        after=34,
    )

    for author in (
        "Illia Dolbnia, album no. 30151",
        "Kseniia Kushlak, album no. 30081",
        "Volodymyr Biletskyi, album no. 29934",
        "Anastasia Leonova, album no. 29945",
    ):
        add_centered_line(document, author, size=12, bold=True, after=2)

    add_centered_line(
        document,
        "Smart Pet Care Assistant",
        size=14,
        bold=True,
        before=26,
        after=12,
    )
    add_centered_line(
        document,
        "Inteligentny asystent opieki nad zwierzętami",
        size=14,
        bold=True,
        after=18,
    )
    add_centered_line(document, "Engineering thesis", size=11, after=34)

    supervisor = document.add_paragraph()
    supervisor.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    supervisor.paragraph_format.first_line_indent = Cm(0)
    supervisor.paragraph_format.space_before = Pt(0)
    supervisor.paragraph_format.space_after = Pt(38)
    supervisor.paragraph_format.line_spacing = 1.0
    supervisor_run = supervisor.add_run(
        "Thesis supervised by\nDr. Engineer Michał Janowski"
    )
    set_run_font(supervisor_run, size=11)

    add_centered_line(document, "Poznań [YEAR]", size=11)
    document.add_page_break()


def add_table_of_contents(document: Document) -> None:
    title = document.add_paragraph()
    title.alignment = WD_ALIGN_PARAGRAPH.LEFT
    title.paragraph_format.first_line_indent = Cm(0)
    title.paragraph_format.space_after = Pt(15)
    run = title.add_run("Table of contents / Spis treści")
    set_run_font(run, size=12, bold=True)

    toc = document.add_paragraph()
    toc.paragraph_format.first_line_indent = Cm(0)
    add_field(
        toc,
        ' TOC \\o "1-3" \\h \\z \\u ',
        "Right-click and update this field in Word.",
    )

    add_placeholder_paragraph(
        document,
        "Update the table of contents after all headings and page breaks are final.",
        label="DRAFT INSTRUCTION",
    )


def add_introduction(document: Document) -> None:
    add_heading(document, "Introduction", 1)
    add_placeholder_paragraph(
        document,
        "Replace this block with the authors' original motivation, the approved "
        "problem context, and a concise explanation of why the project was "
        "undertaken. The complete Introduction must not exceed two pages.",
    )
    add_body_paragraph(
        document,
        "This working draft concerns a cross-platform mobile client intended to "
        "support selected pet-care workflows. The implemented client groups "
        "authenticated access, pet profiles, reminders, notification handling, "
        "and pet-scoped informational assistance in one application. This "
        "statement is provisional and must be revised by the authors to match "
        "the approved thesis card and the final evaluated release.",
    )
    add_placeholder_paragraph(
        document,
        "Add one short paragraph describing the structure of the finished thesis "
        "after the chapter contents are stable.",
    )


def add_current_state(document: Document) -> None:
    add_heading(document, "1. Current state of knowledge", 1)
    add_placeholder_paragraph(
        document,
        "This chapter now contains source-backed English working prose. Ksenia "
        "must review every original source, rewrite the text in the team's own "
        "academic voice, and obtain supervisor approval. The bibliography now "
        "uses a continuous working numeric sequence. If the approved source set "
        "changes, update the sequence and rerun the citation-integrity audit.",
        label="DRAFT CITATION NOTE",
    )
    add_body_paragraph(
        document,
        "The preliminary source search was recorded on 25 July 2026. Web search "
        "was used for discovery, while titles, authorship, publication details, "
        "and retained claims were checked against publisher pages, DOI records, "
        "PubMed where applicable, and official technical documentation. "
        "Inclusion required direct relevance to pet-owner information, "
        "veterinary application design, mobile software engineering, or a "
        "specific implemented technology boundary; sources with unverified "
        "metadata, only marketing-level technical claims, or a remote analogy "
        "were excluded. The process was a targeted preliminary review rather "
        "than a systematic review, and every retained original still requires "
        "review and approval by the responsible authors and supervisor.",
    )

    add_heading(document, "1.1 Pet-care workflow context", 2)
    add_body_paragraph(
        document,
        "Digital support for pet owners occupies a health-adjacent area: an "
        "application may organize owner-entered data and improve access to "
        "information, but it cannot infer that the information is complete or "
        "replace a physical veterinary examination. A 2025 literature review of "
        "requirements for pet-owner mHealth applications screened 955 "
        "publications and extracted ten requirements from thirteen included "
        "publications. The most frequently recurring themes were complete user "
        "input and prominent communication of application limitations "
        "[4]. The small number of included studies also demonstrates that "
        "the evidence base remains limited.",
    )
    add_body_paragraph(
        document,
        "Online veterinary information is nevertheless a normal part of many "
        "owners' decision processes. A questionnaire study of 2,117 dog and cat "
        "owners in Austria, Denmark, and the United Kingdom found that owners "
        "used several types of internet resources before or after veterinary "
        "consultations. The authors identified potential benefits for informed "
        "discussion as well as risks of misunderstanding information or delaying "
        "professional consultation [12]. An earlier United Kingdom survey of "
        "571 owners likewise found high internet use while veterinarians remained "
        "among the sources rated most trustworthy [11]. These surveys justify "
        "careful information design, but they do not establish prevalence among "
        "Polish users or prove that a mobile application improves animal-health "
        "outcomes.",
    )
    add_body_paragraph(
        document,
        "For this project, the defensible problem boundary is therefore "
        "organizational rather than clinical. Pet profiles, care reminders, "
        "notification handling, and pet-scoped informational assistance can be "
        "combined into one owner-facing workflow. Any assistant response must be "
        "presented as general information, accompanied by clear limitations and "
        "escalation language, and evaluated as software behavior rather than as "
        "a diagnosis.",
    )

    add_heading(document, "1.2 Review of existing solutions", 2)
    add_body_paragraph(
        document,
        "A desk review was performed on 25 July 2026 using public English "
        "Google Play listings. Inclusion required an Android product directly "
        "concerned with pet-care organization, a listing that described records, "
        "reminders, or provider contact, and evidence of either recent "
        "maintenance or an established installation base. The comparison "
        "criteria were defined before extracting product claims: multi-pet "
        "organization, records, reminders, provider integration, sharing or "
        "export, developer-declared data safety, and an assistant when explicitly "
        "advertised.",
    )
    add_table(
        document,
        [
            "Product",
            "Advertised organization",
            "Integration / sharing",
            "Data-safety declaration",
            "Assistant",
        ],
        [
            [
                "11pets; updated 22.07.2026 [13]",
                "Reminders, appointments, tracking, and documents",
                "Veterinary record sharing; separate business product",
                "No third-party sharing declared; collection declared; encrypted in transit; deletion request",
                "Not stated",
            ],
            [
                "VitusVet; updated 07.11.2025 [22]",
                "Multiple pets, health records, medication, and reminders",
                "Care-provider sharing; partner-practice appointment/refill requests",
                "No third-party sharing declared; collection declared; encrypted in transit; deletion request",
                "Not stated",
            ],
            [
                "PetDesk; updated 03.07.2026 [18]",
                "Reminders, messages, to-dos, and refill requests",
                "Provider management, appointment requests, and loyalty",
                "Sharing and collection declared; encrypted in transit; deletion request",
                "Not stated",
            ],
            [
                "PetnotePlus; updated 24.07.2026 [19]",
                "Multiple pets, records, routines, reminders, charts, diary, and expenses",
                "Household sharing; premium CSV and batch export",
                "Sharing and collection declared; encrypted in transit; deletion request",
                "Not stated",
            ],
        ],
        [1420, 2140, 1920, 2580, 1000],
        caption_text=(
            "Comparison of selected pet-care products based on official Google "
            "Play listings (sources: [13, 18, 19, 22])."
        ),
        chapter_prefix="1",
        sequence_number=1,
        restart_sequence=True,
    )
    add_body_paragraph(
        document,
        "Table 1.1 shows that, across the reviewed listings, organization through "
        "records, schedules, "
        "and reminders was the common product proposition. VitusVet and PetDesk "
        "emphasized participating-provider workflows, 11pets advertised "
        "veterinary record sharing, and PetnotePlus emphasized household "
        "collaboration and export [13, 18, 19, 22]. None of the reviewed "
        "listing texts stated an informational or AI assistant. This is a "
        "non-mention, not proof that the products lack such a function, and it "
        "does not support a claim that Smart Pet Care is novel.",
    )
    add_body_paragraph(
        document,
        "The comparison records public product claims rather than observed "
        "behavior. Google Play identifies data-safety information as supplied "
        "by developers and subject to change. Consequently, the matrix cannot "
        "establish reliability, usability, privacy compliance, or security. Its "
        "purpose is to position the student project cautiously: Smart Pet Care "
        "combines pet profiles, reminders, notification handling, and a "
        "pet-scoped informational assistant, while its actual behavior must be "
        "demonstrated independently.",
    )
    add_placeholder_paragraph(
        document,
        "Before submission, recheck every listing, obtain supervisor approval "
        "for the comparison set, and, where access and terms permit, record "
        "hands-on observations on a named Android device or emulator. Record "
        "country, exact version, account state, observation date, official URL, "
        "and minimal redacted evidence screenshots. Distinguish unobserved from "
        "absent behavior.",
    )

    add_heading(document, "1.3 Cross-platform mobile architecture", 2)
    add_body_paragraph(
        document,
        "Cross-platform mobile development seeks to reuse a common codebase "
        "across operating systems while preserving access to platform "
        "capabilities. The approach can reduce duplicated implementation work, "
        "but it introduces framework abstractions and does not remove "
        "platform-specific behavior. An empirical study comparing five "
        "cross-platform frameworks with a native Android baseline found that "
        "performance depended on the framework, feature, and measurement; no "
        "single approach was superior in every context [1]. Consequently, "
        "framework selection should follow explicit functional and quality "
        "requirements rather than a general claim of native-equivalent "
        "performance.",
    )
    add_body_paragraph(
        document,
        "A narrower controlled comparison reported six to eight percent greater "
        "energy consumption for the investigated React Native implementation "
        "than for its native Android counterpart [3]. That value is not a "
        "prediction for Smart Pet Care: the paper used an older framework "
        "generation, a specific application, and a defined test scenario. It is "
        "useful here as a methodological warning that portability and developer "
        "productivity must be evaluated separately from runtime resource use.",
    )
    add_body_paragraph(
        document,
        "The project uses Expo and React Native to maintain shared application "
        "logic and native user-interface components for its declared platforms. "
        "Expo Router derives application routes from the file structure and "
        "supports universal navigation concepts [15]. This architecture is "
        "consistent with the repository's TypeScript skill set and modular "
        "feature organization. The choice must still be verified by the final "
        "Android build, and no conclusion about iOS parity or performance should "
        "be drawn without platform-specific execution evidence.",
    )

    add_heading(document, "1.4 Client-server communication and server state", 2)
    add_body_paragraph(
        document,
        "The mobile client and backend are independently deployed components, so "
        "their interface requires an explicit contract. In this project, an "
        "OpenAPI snapshot is used to generate typed request functions and data "
        "models [16]. Generated types reduce manual duplication and make contract "
        "changes visible to the TypeScript compiler, but they describe the "
        "declared interface rather than proving that a live response is valid or "
        "that the server implements every documented behavior.",
    )
    add_body_paragraph(
        document,
        "Remote data also has a lifecycle distinct from transient interface "
        "state. TanStack Query provides query caching, invalidation, and "
        "background refetch behavior. Its React Native guidance additionally "
        "connects query behavior with application focus and network state "
        "[21]. After a successful mutation, targeted invalidation can mark "
        "related cached data stale and trigger an appropriate refetch "
        "[20]. Correct cache keys and invalidation scopes remain "
        "application-specific design responsibilities.",
    )
    add_body_paragraph(
        document,
        "Authentication adds a second state machine around outgoing requests. "
        "The client must attach current credentials, distinguish recoverable "
        "expiration from other authorization failures, serialize or otherwise "
        "control refresh attempts, retry only appropriate requests, and clear "
        "local state when recovery fails. These properties require both code "
        "review and scenario tests; the existence of an HTTP interceptor alone "
        "does not demonstrate a reliable session lifecycle.",
    )

    add_heading(
        document,
        "1.5 Runtime validation, privacy, and safety boundaries",
        2,
    )
    add_body_paragraph(
        document,
        "Static TypeScript types are removed during execution and cannot validate "
        "untrusted network or form input. Runtime schemas are therefore needed "
        "at selected boundaries where values can differ from the compile-time "
        "model. Zod documents parsing and a `safeParse()` result that "
        "discriminates success from validation failure while deriving static "
        "types from the schema [23]. Validation should produce an explicit "
        "success or failure before "
        "data is stored, displayed, or passed to a safety-sensitive workflow. "
        "The final thesis must identify which boundaries are validated and which "
        "still rely on the backend contract.",
    )
    add_body_paragraph(
        document,
        "Authentication material stored on the device requires platform-aware "
        "protection. Expo SecureStore uses platform facilities for encrypted "
        "key-value storage and documents persistence, backup, accessibility, and "
        "payload limitations [14]. This supports the choice of a protected "
        "storage API, but it does not establish end-to-end security. The OWASP "
        "MASVS separates mobile security into storage, cryptography, "
        "authentication, network, platform, code, resilience, and privacy "
        "control groups [17]. A scoped review must record which controls were "
        "tested and leave remote API security outside the mobile-only result.",
    )
    add_body_paragraph(
        document,
        "Generative language models introduce an additional reliability "
        "boundary because plausible language is not evidence of factual or "
        "clinical correctness. Veterinary guidance identifies hallucination, "
        "inaccuracy, data privacy, transparency, and regulatory uncertainty as "
        "material risks and recommends that AI augment rather than replace "
        "veterinary expertise [2]. For Smart Pet Care, the assistant must "
        "therefore remain non-diagnostic, disclose its limitations, avoid "
        "unnecessary personal or clinical data, and direct urgent concerns to an "
        "appropriate professional or emergency service.",
    )
    add_body_paragraph(
        document,
        "Client-side urgency cues can support conservative presentation, but "
        "they cannot validate the assistant's clinical reasoning. Verification "
        "should cover consent, pet-context selection, safe fallback behavior, "
        "retry limits, error states, and the visibility of warnings. Claims "
        "about medical accuracy require a separate expert-designed evaluation "
        "and are outside the current thesis scope.",
    )

    add_heading(document, "1.6 Mobile-application testing", 2)
    add_body_paragraph(
        document,
        "Software quality must be translated into observable criteria. "
        "ISO/IEC 25010:2023 provides a product-quality model that can help "
        "organize requirements and testing objectives [6], while "
        "ISO/IEC/IEEE 29119-1:2022 establishes general software-testing concepts "
        "[7]. The standards do not make a project compliant by citation; "
        "the team must define the relevant characteristic, context, metric, "
        "target, and evidence for each selected requirement.",
    )
    add_body_paragraph(
        document,
        "The verification strategy should combine complementary levels. Static "
        "type checking and linting detect selected source-level defects. Unit "
        "tests exercise isolated logic, component and page tests observe "
        "rendering and interaction under controlled dependencies, integration "
        "tests cover boundaries between modules, and Android scenarios evaluate "
        "native configuration, permissions, deep links, notifications, network "
        "changes, and process restarts. A passing lower-level suite cannot prove "
        "that an end-to-end device flow works.",
    )
    add_body_paragraph(
        document,
        "Usability is likewise an outcome of use in a specified context rather "
        "than a synonym for visual consistency [5]. The final evaluation "
        "should name representative users or reviewers, tasks, devices, "
        "conditions, success criteria, observed errors, and limitations. "
        "Automated accessibility checks and property inspection are useful, but "
        "they must be complemented by manual focus, label, scaling, contrast, "
        "touch-target, and non-color-cue checks on critical Android flows.",
    )

    add_heading(document, "1.7 Synthesis and project positioning", 2)
    add_body_paragraph(
        document,
        "The reviewed literature establishes a defensible problem boundary "
        "rather than proof of a product outcome. Pet-owner applications should "
        "make input expectations and limitations prominent [4], and owner "
        "surveys show that online information can support discussion while also "
        "creating risks of misunderstanding or delayed professional consultation "
        "[11, 12]. Generative AI adds plausible but potentially inaccurate "
        "language, privacy, transparency, and regulatory concerns [2]. These "
        "sources support organizational and informational assistance with "
        "explicit limits; they do not support a diagnostic or clinically "
        "validated claim.",
    )
    add_body_paragraph(
        document,
        "The dated product-listing comparison shows that records, schedules, "
        "reminders, sharing, and provider-related workflows are already common "
        "advertised propositions [13, 18, 19, 22]. The reviewed listing text did "
        "not state an AI or informational assistant, but non-mention is not "
        "evidence of absence and cannot establish novelty. Likewise, empirical "
        "cross-platform studies show that performance depends on framework, "
        "feature, and measurement context [1, 3], so the selected Expo/React "
        "Native architecture must be evaluated through the final project rather "
        "than justified by a universal efficiency claim.",
    )
    add_body_paragraph(
        document,
        "Accordingly, the intended engineering contribution is the documented "
        "design, implementation, integration, and verification of one "
        "owner-facing mobile client that combines the approved pet-care "
        "workflows and a bounded pet-scoped assistant. The contribution is not a "
        "claim of medical novelty, improved animal-health outcomes, framework "
        "superiority, or market uniqueness. Its final value must be assessed "
        "against the approved requirements, inspectable implementation evidence, "
        "and repeatable results presented in the following chapters.",
    )


def add_objective_and_scope(document: Document) -> None:
    add_heading(document, "2. Objective and scope", 1)
    add_heading(document, "2.1 Main objective", 2)
    add_body_paragraph(
        document,
        "The provisional objective is to design, implement, and verify the "
        "Smart Pet Care Assistant as a cross-platform mobile application for "
        "selected pet-care workflows. The solution should provide authenticated "
        "access, pet-profile management, reminders, notification handling, and a "
        "pet-scoped assistant while applying typed API integration, runtime "
        "boundary validation, protected session storage, connectivity-aware data "
        "fetching, and automated tests.",
    )
    add_body_paragraph(
        document,
        "In this provisional title, ‘smart’ or ‘intelligent’ means observable "
        "assistant behavior such as pet-context selection, consent handling, "
        "structured response presentation, configured urgency cues, and retry or "
        "failure handling. It does not mean veterinary diagnosis, clinical "
        "effectiveness, or general artificial-intelligence superiority. The final "
        "definition and acceptance evidence require author and supervisor approval.",
    )
    add_placeholder_paragraph(
        document,
        "Obtain supervisor approval for the objective and replace broad terms with "
        "measurable acceptance criteria.",
    )

    add_heading(document, "2.2 Actors", 2)
    add_body_paragraph(
        document,
        "Candidate actors are the unauthenticated visitor, authenticated pet "
        "owner, Google identity provider, external backend API, Firebase Cloud "
        "Messaging, and assistant service. The final use-case diagram must show "
        "only actors and interactions present in the evaluated system.",
    )

    add_heading(document, "2.3 Functional requirements", 2)
    add_body_paragraph(
        document,
        "Table 2.1 presents candidate requirements inferred from the current "
        "mobile repository and committed API contract. Their status remains "
        "provisional until the corresponding Android scenarios are verified.",
    )
    add_table(
        document,
        ["ID", "Candidate requirement", "Acceptance evidence", "Status"],
        [
            [
                "FR-01",
                "The user can register, confirm an account, and sign in.",
                "Android scenario and API result",
                "Verify",
            ],
            [
                "FR-02",
                "The user can authenticate with Google on Android.",
                "Configured device scenario",
                "Verify",
            ],
            [
                "FR-03",
                "The application restores or refreshes a saved session.",
                "Restart and expired-token scenarios",
                "Verify",
            ],
            [
                "FR-04",
                "The user can create, view, edit, and delete pet profiles.",
                "CRUD scenario set",
                "Verify",
            ],
            [
                "FR-05",
                "The user can upload or replace a pet photograph.",
                "Image-selection and upload scenario",
                "Verify",
            ],
            [
                "FR-06",
                "The user can create, view, update, and delete reminders.",
                "Reminder scenario set",
                "Verify",
            ],
            [
                "FR-07",
                "The application registers an Android notification token.",
                "Sanitized backend request evidence",
                "Verify",
            ],
            [
                "FR-08",
                "A reminder notification can open the status workflow.",
                "Foreground/background/terminated tests",
                "Verify",
            ],
            [
                "FR-09",
                "The assistant requires consent and a selected pet.",
                "Page tests and Android scenario",
                "Partially tested",
            ],
            [
                "FR-10",
                "The assistant loads sessions and exchanges messages.",
                "Hook/page tests and live API scenario",
                "Partially tested",
            ],
            [
                "FR-11",
                "The application presents offline and recovery states.",
                "Offline/reconnect scenario",
                "Verify",
            ],
            [
                "FR-12",
                "The user can update the profile and sign out.",
                "Profile and cleanup scenario",
                "Verify",
            ],
        ],
        [900, 3420, 3120, 1620],
        caption_text=(
            "Candidate functional requirements and planned acceptance evidence "
            "(source: authors' own work based on the repository and committed "
            "OpenAPI contract)."
        ),
        chapter_prefix="2",
        sequence_number=1,
        restart_sequence=True,
    )

    add_heading(document, "2.4 Non-functional requirements", 2)
    add_body_paragraph(
        document,
        "Table 2.2 translates selected quality concerns into candidate measurable "
        "requirements. Targets and methods remain provisional until the final "
        "device, dataset, and approved verification protocol are fixed.",
    )
    add_table(
        document,
        ["ID", "Category", "Candidate measurable requirement", "Verification"],
        [
            [
                "NFR-01",
                "Type safety",
                "The final client passes the strict TypeScript check.",
                "`tsc --noEmit`",
            ],
            [
                "NFR-02",
                "Code quality",
                "The final client passes lint with no errors or warnings.",
                "ESLint",
            ],
            [
                "NFR-03",
                "Reliability",
                "Documented error and reconnect scenarios recover without restart.",
                "Android scenario set",
            ],
            [
                "NFR-04",
                "Privacy",
                "Session material is stored through the platform protected-storage API.",
                "Code review and platform documentation",
            ],
            [
                "NFR-05",
                "Accessibility",
                "Critical flows meet the named label, focus, touch-target, and non-color-cue checks.",
                "Accessibility checklist",
            ],
            [
                "NFR-06",
                "Performance",
                "Selected screens meet a defined threshold on a named device and dataset.",
                "Measurement protocol required",
            ],
        ],
        [900, 1560, 4140, 2460],
        caption_text=(
            "Candidate non-functional requirements and verification methods "
            "(source: authors' own work)."
        ),
        chapter_prefix="2",
        sequence_number=2,
    )

    add_heading(document, "2.5 Use-case catalogue and traceability", 2)
    add_body_paragraph(
        document,
        "Table 2.3 assigns stable working identifiers to every current use case "
        "and connects it to the candidate requirements and final verification "
        "protocol. Several requirements intentionally decompose into multiple "
        "use cases; FR-11 is represented as a cross-cutting recovery flow. The "
        "mapping proves planned coverage only and does not convert an unexecuted "
        "scenario into a pass.",
    )
    add_table(
        document,
        ["Use case", "Goal", "Requirement", "Evidence boundary", "Verification status"],
        [
            [
                "UC-01",
                "Register account",
                "FR-01",
                "Registration form and `POST /api/auth/register`",
                "B-01; runtime proof required",
            ],
            [
                "UC-02",
                "Confirm email account",
                "FR-01",
                "Confirmation/resend pages and endpoints",
                "B-02; runtime proof required",
            ],
            [
                "UC-03",
                "Sign in with email",
                "FR-01",
                "Email form, session persistence, login endpoint",
                "B-02-B-03; runtime proof required",
            ],
            [
                "UC-04",
                "Sign in with Google",
                "FR-02",
                "Native Google flow and mobile token exchange",
                "B-04-B-05; runtime proof required",
            ],
            [
                "UC-05",
                "Resume authenticated session",
                "FR-03",
                "Protected storage, refresh, and interceptor paths",
                "B-06-B-09; partially verified",
            ],
            [
                "UC-06",
                "Manage account profile",
                "FR-12",
                "Profile, user-update, and avatar interfaces",
                "C-08; runtime proof required",
            ],
            [
                "UC-07",
                "Sign out",
                "FR-12",
                "Local, Google, and notification cleanup paths",
                "B-09-B-10; partially verified",
            ],
            [
                "UC-08",
                "Delete account",
                "Candidate FR-13",
                "Profile deletion UI and user-delete endpoint",
                "C-09; scope decision required",
            ],
            [
                "UC-09",
                "Manage pet profiles",
                "FR-04",
                "Pet pages, mutations, schemas, and CRUD endpoints",
                "C-01-C-04; runtime proof required",
            ],
            [
                "UC-10",
                "Manage pet photograph",
                "FR-05",
                "Image selection, upload hook, and photo endpoint",
                "C-05-C-07; runtime proof required",
            ],
            [
                "UC-11",
                "Manage reminders",
                "FR-06",
                "Reminder UI, mutations, and contract operations",
                "D-01-D-03; runtime proof required",
            ],
            [
                "UC-12",
                "Synchronize Android notification token",
                "FR-07",
                "Notification provider, token service, and endpoints",
                "D-04-D-06; automated client scope",
            ],
            [
                "UC-13",
                "Open reminder status from notification",
                "FR-08",
                "Notification-response prompt and status drawer",
                "D-07-D-10; runtime proof required",
            ],
            [
                "UC-14",
                "Review and decide assistant consent",
                "FR-09",
                "Consent dialog and protected local storage",
                "E-01, E-11; partially verified",
            ],
            [
                "UC-15",
                "Select pet context",
                "FR-09",
                "Assistant pet-selection and creation routes",
                "E-02; partially verified",
            ],
            [
                "UC-16",
                "Manage assistant conversation",
                "FR-10",
                "Session/history/send paths and API boundary",
                "E-03-E-10; partially verified",
            ],
            [
                "UC-17",
                "Retry failed assistant message",
                "FR-10",
                "Retry mutation and dedicated endpoint",
                "E-06-E-07; partially verified",
            ],
            [
                "UC-18",
                "Recover after connectivity change",
                "FR-11",
                "Connectivity manager, offline UI, and query recovery",
                "F-01-F-04; runtime proof required",
            ],
        ],
        [840, 2280, 1200, 2280, 2460],
        caption_text=(
            "Provisional use-case-to-requirement and verification mapping "
            "(source: authors' own work based on the mobile repository, "
            "committed OpenAPI contract, and verification protocol)."
        ),
        chapter_prefix="2",
        sequence_number=3,
    )
    add_body_paragraph(
        document,
        "UC-08 is implemented in the inspected mobile client but is not included "
        "in FR-01-FR-12. Before scope freeze, the team and supervisor must either "
        "approve a separate FR-13 and retain scenario C-09, or explicitly exclude "
        "account deletion from the evaluated scope. The committed contract also "
        "exposes weight, health, and feeding operations, while the live contract "
        "adds journal and symptom-catalogue surfaces; none may be claimed as "
        "evaluated functionality without a requirement, implementation evidence, "
        "verification scenario, and result.",
    )

    add_heading(document, "2.6 Scope limitations", 2)
    add_body_paragraph(
        document,
        "Unless separate evidence is supplied, the thesis does not evaluate "
        "backend implementation internals, clinical correctness, iOS production "
        "notification delivery, complete accessibility conformance, security "
        "certification, or scalability beyond measured datasets.",
    )

    add_heading(document, "2.7 Team roles and work allocation", 2)
    add_body_paragraph(
        document,
        "The four-person team contains complementary backend, frontend, research, "
        "product, AI-service, infrastructure, and coordination responsibilities. "
        "Table 2.4 reconciles the authors' confirmed role descriptions with the "
        "visible repository histories inspected on 26 July 2026. The official "
        "CDV breakdown sheet assigns an equal overall share of 25% to each "
        "author; that administrative allocation still requires signatures and "
        "does not replace evidence of the actual work described in the thesis.",
    )
    add_table(
        document,
        ["Team member", "Confirmed responsibility", "Official overall share"],
        [
            [
                "Volodymyr Biletskyi",
                "Lead C# backend developer: architecture, persistence, "
                "authentication, core APIs, reminders, notifications, and "
                "infrastructure.",
                "25%",
            ],
            [
                "Kseniia Kushlak",
                "Backend feature developer and researcher: pet photographs, "
                "feeding, weight history, and C# classifier/chat integration.",
                "25%",
            ],
            [
                "Anastasia Leonova",
                "Idea and product lead; frontend developer responsible for "
                "product direction, UX, and care-related interface work.",
                "25%",
            ],
            [
                "Illia Dolbnia",
                "Team lead, frontend lead, and AI backend-service lead: mobile "
                "integration, coordination, classifier service, and AI safety.",
                "25%",
            ],
        ],
        [1920, 5340, 1800],
        caption_text=(
            "Confirmed team responsibilities and official overall contribution "
            "shares (source: authors' role confirmation, supplied CDV breakdown "
            "sheet, and repository histories inspected on 26 July 2026)."
        ),
        chapter_prefix="2",
        sequence_number=4,
    )
    add_body_paragraph(
        document,
        "The evaluated mobile revision's reachable history contains 26 human "
        "commits attributed to Illia Dolbnia, while a separate care-screen "
        "branch contains 30 commits attributed to Anastasia Leonova. In the C# "
        "backend history, Volodymyr Biletskyi has 39 non-merge commits and "
        "Kseniia Kushlak has four identifiable squash commits, two of which "
        "record Volodymyr as co-author. Illia is the sole visible author of the "
        "seven inspected AI-service commits. These histories support technical "
        "attribution but do not measure design, research, review, coordination, "
        "pair programming, or effort. The equal shares in Table 2.4 are therefore "
        "an official working allocation, not a metric calculated from commits.",
    )
    add_placeholder_paragraph(
        document,
        "Each author must review the description of their work, link the final "
        "accepted artifacts, and sign the CDV work-allocation sheet. Add "
        "Anastasia Leonova's design evidence and non-commit research, review, and "
        "coordination records for all authors.",
    )

    add_heading(document, "2.8 Author-confirmed first-version scope", 2)
    add_body_paragraph(
        document,
        "On 26 July 2026, Illia classified the numbered implementation checklist "
        "into ready first-version ranges, version-2 items, and omitted items. "
        "Table 2.5 uses this response as an author-confirmed drafting baseline. "
        "It is not an acceptance-test result: every included area still requires "
        "an immutable release revision, a mapped verification scenario, an "
        "observed result, and review by the responsible authors and supervisor.",
    )
    add_table(
        document,
        [
            "Product area",
            "Author-confirmed status",
            "Repository support",
            "Thesis treatment",
        ],
        [
            [
                "Authentication, account, profile, and session handling",
                "First version (reported ready)",
                "Mobile and C# backend implementation artifacts are present.",
                "Describe implementation; retain pending Android and API "
                "acceptance evidence.",
            ],
            [
                "Pets, photographs, weight, health, journal, and symptoms",
                "First version (reported ready)",
                "Mobile, API, backend, live-contract, and branch artifacts exist "
                "across different revisions.",
                "Describe the accepted functionality only after the release set "
                "is identified; make no diagnostic claim.",
            ],
            [
                "Reminders and Android notifications",
                "First version (reported ready)",
                "Client, backend, and automated-test artifacts are present.",
                "Describe implementation; final FCM lifecycle scenarios remain "
                "acceptance evidence.",
            ],
            [
                "Pet-scoped assistant and condition pre-assessment",
                "First version (reported ready)",
                "C# chat integration is on the backend main history; unified "
                "`/chat` is on AI-service feature revision 74019ea.",
                "Describe both ownership boundaries; identify the merged or "
                "deployed AI revision before reporting a final result.",
            ],
            [
                "Feeding mobile interface and nutrition goals (items 25-26)",
                "Version 2",
                "C# feeding API implementation exists; the end-to-end mobile "
                "workflow is not part of the confirmed first version.",
                "Document the backend boundary where relevant and list the mobile "
                "experience as future work.",
            ],
            [
                "Omitted checklist items 27, 39-40, 42-43, and 58-63",
                "Unconfirmed",
                "The author's response did not classify these dashboard and "
                "smart-feature items.",
                "Do not claim them until the team explicitly includes or defers "
                "each item.",
            ],
            [
                "English UI, recovery, accessibility, Android, tests, CI, deployment",
                "First version for confirmed checklist ranges",
                "Mobile and service repositories contain relevant implementation, "
                "tests, workflows, and deployment definitions.",
                "Describe repository-supported design; report runtime outcomes "
                "only after clean-revision execution.",
            ],
            [
                "Polish interface (item 68)",
                "Unconfirmed",
                "The inspected mobile baseline configures English resources only.",
                "Describe English localization accurately and retain Polish as "
                "unconfirmed or future work.",
            ],
        ],
        [1500, 2820, 2280, 2460],
        caption_text=(
            "Author-confirmed first-version, version-2, and unconfirmed scope "
            "(source: Illia Dolbnia's checklist response and repository "
            "reconciliation performed on 26 July 2026)."
        ),
        chapter_prefix="2",
        sequence_number=5,
    )
    add_body_paragraph(
        document,
        "The detailed status register records that the author's answer used the "
        "range 74-90 although the checklist ended at item 81; only items 74-81 "
        "were therefore classified. The final dated freeze must classify every "
        "omitted item and identify accepted mobile, backend, AI-service, and "
        "contract revisions before the requirements and results are finalized.",
    )


def add_methodology(document: Document) -> None:
    add_heading(document, "3. Methodology", 1)
    add_heading(document, "3.1 Requirements discovery and prioritization", 2)
    add_body_paragraph(
        document,
        "Requirements are represented as uniquely identified functional and "
        "non-functional statements with an actor or quality category, acceptance "
        "evidence, and implementation status. This supports traceability from "
        "the approved objective through implementation and verification. "
        "ISO/IEC/IEEE 29148:2018 treats requirements engineering and its "
        "information items as life-cycle concerns [9], while "
        "ISO/IEC 25010:2023 supplies a reference model for organizing product "
        "quality requirements [6]. The project uses these publications as "
        "conceptual references, not as a claim of standards conformance.",
    )
    add_placeholder_paragraph(
        document,
        "Describe how the team actually discovered, discussed, prioritized, "
        "changed, and accepted the requirements. Add the approved thesis card, "
        "dated meeting/design evidence, rejected alternatives, and a traceability "
        "matrix from every final requirement to implementation and test evidence.",
    )

    add_heading(document, "3.2 Project organization", 2)
    add_body_paragraph(
        document,
        "The visible mobile-client history begins with the initial commit on "
        "11 April 2026. Reusable interface components and automated review "
        "support appeared in April and May. Home, navigation, and query work "
        "followed at the start of June; authentication was introduced on 6 June; "
        "pet and owner-profile workflows were added between 20 and 30 June; "
        "reminder and notification integration was extended from 1 to 13 July; "
        "and the assistant screen was integrated on 15 July. The corresponding "
        "commit identifiers and attribution limitations are recorded in the "
        "project chronology.",
    )
    add_body_paragraph(
        document,
        "All named human commits reachable from the evaluated revision are "
        "attributed to Illia Dolbnia; separate local branch references contain "
        "Anastasia Leonova's care-screen history. This establishes a bounded "
        "repository-visible chronology but not the complete collaboration model "
        "or final-release inclusion. The final methodology must incorporate "
        "backend and AI-service histories, design-tool versions, research logs, "
        "reviews, pair-programming evidence, merged-release evidence, and team "
        "decisions before work is assigned to individual authors.",
    )
    add_placeholder_paragraph(
        document,
        "Describe the version-control and pull-request strategy, issue or change "
        "proposal process, review responsibilities, communication cadence, and "
        "actual quality gates. Do not name Scrum, Kanban, or another formal "
        "method unless the team can demonstrate that it was used.",
    )

    add_heading(document, "3.3 System architecture", 2)
    add_body_paragraph(
        document,
        "The system is divided into a cross-platform mobile client, a C# core "
        "backend, and a Python AI microservice. The client consumes the backend "
        "through an OpenAPI-described HTTPS interface, delegates Google identity "
        "to the native authentication flow, and registers Android notification "
        "tokens for Firebase Cloud Messaging. The core backend authenticates and "
        "authorizes pet-scoped operations, persists domain and chat data, and "
        "forwards bounded assistant context to the AI microservice.",
    )
    add_body_paragraph(
        document,
        "The architecture description should communicate the concerns of the "
        "reader through complementary views rather than one overloaded diagram. "
        "ISO/IEC/IEEE 42010:2022 distinguishes an architecture from its "
        "documented architecture description and defines concepts for viewpoints "
        "and models [10]. The CDV guide separately requires use-case, "
        "class/object, component, and deployment diagrams. Those university "
        "requirements determine the minimum diagram set for this thesis.",
    )
    add_body_paragraph(
        document,
        "Figure 3.1 separates the three implemented repositories and shows the "
        "assistant ownership boundary: the C# service owns authorization, "
        "sessions, history, persistence, resilience, and public error mapping, "
        "whereas the Python service owns routing, condition prediction, "
        "deterministic safety rules, and response generation. Figure 3.2 maps "
        "the verified deployment definitions to runtime nodes while retaining "
        "explicit confirmation labels for the actual deployed release identifiers "
        "and data-store host.",
    )
    add_figure(
        document,
        image_name="system-components.png",
        caption_text=(
            "Component view of the mobile client, C# backend, and AI-service "
            "ownership boundaries"
        ),
        alt_text=(
            "Component diagram showing the Expo Router mobile "
            "client, authentication, pet, reminder, notification, assistant, "
            "query, generated API, and protected-storage components, plus the "
            "C# backend, Python AI service, Google, and Firebase boundaries."
        ),
        chapter_prefix="3",
        sequence_number=1,
        restart_sequence=True,
        width_cm=14,
    )
    add_figure(
        document,
        image_name="deployment.png",
        caption_text=(
            "Deployment-definition view with final release identifiers still "
            "requiring confirmation"
        ),
        alt_text=(
            "Deployment diagram with an Android device, protected "
            "storage, Google-managed identity and messaging services, a backend "
            "container and PostgreSQL data store, an AWS Lambda AI-service "
            "definition, communication protocols, and remaining release evidence."
        ),
        chapter_prefix="3",
        sequence_number=2,
        width_cm=15.5,
    )
    add_placeholder_paragraph(
        document,
        "Review Figures 3.1 and 3.2 with the backend and AI-service leads. Add "
        "the accepted image, migration, model, API, and deployment revision "
        "identifiers, and distinguish a deployment definition from evidence that "
        "the same artifact was deployed and exercised.",
    )

    add_heading(document, "3.4 Domain and interaction models", 2)
    add_body_paragraph(
        document,
        "The principal domain concepts visible in the client contract include a "
        "user profile, pets, pet photographs, weight and health records, feeding "
        "logs, reminders and reminder runs, notification tokens, and assistant "
        "sessions and messages. A domain model must distinguish these declared "
        "API entities from client-only view state and from unverified backend "
        "persistence entities.",
    )
    add_body_paragraph(
        document,
        "Figure 3.3 covers account, pet, reminder, and notification interactions; "
        "Figure 3.4 covers assistant and connectivity behavior. Together they "
        "form the complete provisional use-case view, and their stable "
        "UC-01-UC-18 identifiers map to Table 2.3. Figure 3.5 is derived "
        "from the committed OpenAPI response models and uses "
        "foreign-key fields and embedded response structures to express only "
        "contract-level relationships. It therefore does not claim that the "
        "backend uses the same classes, multiplicities, or persistence design.",
    )
    add_figure(
        document,
        image_name="use-cases.png",
        caption_text="Provisional account and pet-care use-case view",
        alt_text=(
            "Provisional use-case diagram showing UC-01 through UC-13 for "
            "registration, account confirmation, email and Google sign-in, "
            "session restoration, profile and account actions, pet profiles and "
            "photographs, reminders, notification-token synchronization, and "
            "notification status handling, with pet-owner, Google, and Firebase "
            "actors."
        ),
        chapter_prefix="3",
        sequence_number=3,
        width_cm=11.5,
    )
    add_figure(
        document,
        image_name="assistant-platform-use-cases.png",
        caption_text="Provisional assistant and connectivity use-case view",
        alt_text=(
            "Provisional use-case diagram showing UC-14 through UC-18 for "
            "assistant consent, pet selection, conversation management, failed "
            "message retry, and connectivity recovery, with pet-owner, Android "
            "connectivity, and unverified AI-service actors."
        ),
        chapter_prefix="3",
        sequence_number=4,
        width_cm=12,
    )
    add_figure(
        document,
        image_name="domain-class.png",
        caption_text=(
            "Contract-level conceptual domain classes derived from the committed "
            "OpenAPI snapshot"
        ),
        alt_text=(
            "Conceptual class diagram showing user profile, pet, reminder, "
            "reminder run, feeding log, health record, weight log, assistant "
            "session, and assistant message response models and their "
            "contract-visible relationships."
        ),
        chapter_prefix="3",
        sequence_number=5,
        width_cm=15.5,
    )
    add_body_paragraph(
        document,
        "Figures 3.6-3.8 then describe three implementation-critical interaction "
        "paths: session restoration and refresh after authentication failure; "
        "Android notification-token synchronization followed by reminder-status "
        "handling; and assistant consent, session bootstrap, message submission, "
        "and retry. Each sequence ends with the evidence boundary that remains "
        "outside the current automated or repository-level proof.",
    )
    add_figure(
        document,
        image_name="auth-refresh-sequence.png",
        caption_text="Authentication restoration and access-token refresh sequence",
        alt_text=(
            "Sequence diagram showing application startup, SecureStore session "
            "restoration, expired-token refresh, one shared refresh operation, "
            "one retry after an HTTP 401 response, and sign-out on failure."
        ),
        chapter_prefix="3",
        sequence_number=6,
        width_cm=10,
    )
    add_figure(
        document,
        image_name="notification-status-sequence.png",
        caption_text=(
            "Android notification-token synchronization and reminder-status "
            "interaction"
        ),
        alt_text=(
            "Sequence diagram showing Android notification permission and token "
            "synchronization, Firebase delivery, notification tap handling, "
            "reminder identifier validation, reminder loading, and status update."
        ),
        chapter_prefix="3",
        sequence_number=7,
        width_cm=15.5,
    )
    add_figure(
        document,
        image_name="assistant-send-retry-sequence.png",
        caption_text=(
            "Assistant consent, pet-scoped session, message submission, and retry "
            "sequence"
        ),
        alt_text=(
            "Sequence diagram showing assistant-consent restoration, pet "
            "selection, session bootstrap, paginated messages, message "
            "submission through the backend to an unverified AI-service "
            "boundary, query invalidation, failure state, and retry."
        ),
        chapter_prefix="3",
        sequence_number=8,
        width_cm=13,
    )
    add_placeholder_paragraph(
        document,
        "Review Figures 3.3-3.8 against the final approved requirements, Android "
        "release, OpenAPI contract, backend implementation, and AI-service "
        "evidence. Resolve the provisional User-Pet multiplicity and external AI "
        "topology, then remove all draft labels before submission.",
    )

    add_heading(document, "3.5 Technology-selection method", 2)
    add_body_paragraph(
        document,
        "Technology decisions were assessed against project constraints rather "
        "than described as universally optimal. The working criteria are "
        "platform reach, team competence, native API access, typed integration, "
        "development and release workflow, testability, maintainability, "
        "performance risk, ecosystem maturity, and compatibility with the "
        "backend contract. Cross-platform performance remains context dependent "
        "[1], so current dependency presence or popularity cannot establish "
        "superiority.",
    )
    add_body_paragraph(
        document,
        "To limit retrospective rationalization, the audit distinguishes "
        "versioned implementation evidence from ignored local OpenSpec decision "
        "records and from missing author confirmation. Table 3.1 therefore uses "
        "present-tense claims for the evaluated client. Expo Router, TanStack "
        "Query, Orval, and Zod documentation explains library behavior "
        "[15, 16, 20, 21, 23], but project selection history must come from the "
        "team's own dated evidence.",
    )
    add_table(
        document,
        [
            "Technology boundary",
            "Repository evidence",
            "Recorded rationale / alternative",
            "Thesis status",
        ],
        [
            [
                "Expo, React Native, and Expo Router",
                "`package.json`, `app.json`, routes, native plugins, typed routes, and runtime/update configuration",
                "Local record selects route-level boundaries over one top-level boundary and rejects a separate assistant route group/fifth tab.",
                "Implemented; original framework-selection date, participants, and alternatives unverified",
            ],
            [
                "TypeScript and Zod",
                "Strict compiler configuration plus feature schemas for forms, routes, persistence, and runtime boundaries",
                "Local records select route-entry parsing and discriminated models instead of unsafe coercion.",
                "Implemented; original language and schema-library choice history unverified",
            ],
            [
                "TanStack Query and Axios",
                "Shared clients/providers and feature query/mutation hooks implement transport, caching, and invalidation",
                "Local records reject global focus refresh, central option maps, and direct page-to-Axios assistant coupling.",
                "Implemented; initial library comparison and team approval unverified",
            ],
            [
                "OpenAPI and Orval",
                "Committed contract, Orval configuration, generated Axios client/models, and reproducibility record",
                "Local record keeps generated calls behind feature hooks and rejects coercing incomplete DTOs into obsolete richer types.",
                "Implemented; original generator-versus-handwritten-client decision unverified",
            ],
            [
                "Unistyles and reusable UI primitives",
                "Theme configuration, shared components, feature styles, and Figma-related repository history",
                "No explicit comparison with React Native StyleSheet, styled-components, or another styling system was found.",
                "Implemented; comparative rationale is retrospective until author-confirmed",
            ],
            [
                "Jest and React Native Testing Library",
                "Configured commands, test files, and recorded unit/component results",
                "Design records require deterministic boundary tests but contain no initial test-framework comparison.",
                "Implemented; choice criteria, participants, and alternatives unverified",
            ],
            [
                "EAS Build and Expo Updates",
                "Build profiles, channels, fingerprint runtime policy, and CI workflows",
                "No release-platform comparison was found; configuration proves intended process, not a production deployment.",
                "Configured; selection history and final deployment proof unverified",
            ],
        ],
        [1680, 2580, 3000, 1800],
        caption_text=(
            "Provisional technology-decision matrix for the evaluated mobile "
            "client (source: authors' own work based on revision 0d5e33b and "
            "local OpenSpec records inspected on 25 July 2026)."
        ),
        chapter_prefix="3",
        sequence_number=1,
        restart_sequence=True,
    )
    add_body_paragraph(
        document,
        "Table 3.1 supports the narrower conclusion that the technologies are "
        "implemented coherently and that several later architecture refinements "
        "have written trade-offs. It does not prove that all alternatives were "
        "prototyped, benchmarked, or approved by the four-person team. The "
        "ignored OpenSpec files are useful working records, but their filenames "
        "and filesystem dates are weaker provenance than versioned issues, "
        "commits, or signed meeting notes.",
    )
    add_placeholder_paragraph(
        document,
        "Confirm Table 3.1 with the relevant owners. For every retained row, "
        "record the decision date or phase, participants, requirement or "
        "constraint, alternatives genuinely reviewed, accepted trade-off, and "
        "reconsideration trigger. Link versioned decision evidence where "
        "available and remove any retrospective rationale that the team cannot "
        "verify.",
    )

    add_heading(document, "3.6 Verification method", 2)
    add_body_paragraph(
        document,
        "Verification is organized around requirements rather than around a "
        "single test command. ISO/IEC/IEEE 29119-2:2021 defines generic software "
        "test processes applicable across development life cycles [8]. For "
        "this project, each final requirement should identify a test level, "
        "preconditions, input data, device or runtime, steps, expected result, "
        "observed result, evidence location, executor, date, and defect reference "
        "where applicable.",
    )
    add_body_paragraph(
        document,
        "The planned evidence layers are source and contract review; strict "
        "TypeScript and lint checks; automated unit, hook, context, component, "
        "and page tests; generated-client checks; Android user scenarios; "
        "notification lifecycle checks; offline and recovery scenarios; "
        "accessibility review; and measurements performed on named devices and "
        "datasets. Security checks are scoped to named OWASP MASVS categories "
        "[17]. Assistant checks cover software safety behavior and do not "
        "claim veterinary correctness.",
    )
    add_body_paragraph(
        document,
        "Each executed protocol item receives one primary outcome. PASS means "
        "that the observed result matches the approved expectation and that the "
        "identified final system, executor, date, and sanitized evidence are "
        "complete. FAIL means that the observed result contradicts the "
        "expectation. BLOCKED means that a stated precondition or external "
        "dependency prevented execution, while NOT RUN means that the team did "
        "not execute the item. A thesis-level label such as partially verified "
        "may summarize several items, but it must not replace these primary "
        "outcomes in the underlying records.",
    )
    add_body_paragraph(
        document,
        "Requirement-level synthesis uses the most restrictive mandatory "
        "outcome rather than a majority vote. A requirement is verified only "
        "when every mandatory mapped item passes on the identified final "
        "system; any failed, blocked, or not-run mandatory item keeps the "
        "requirement open and is discussed explicitly. Quantitative results "
        "must retain units, dataset size, device state, repetitions, aggregation "
        "method, and raw observations. Inferential claims are excluded unless "
        "the authors approve a study design that supports them.",
    )
    add_placeholder_paragraph(
        document,
        "Create the final traceability/results table. Repeat all automated checks "
        "on a clean final revision, execute the Android scenarios, preserve "
        "sanitized logs and screenshots, and record all failures as well as "
        "passes.",
    )


def add_implementation(document: Document) -> None:
    add_heading(document, "4. Project implementation", 1)
    add_placeholder_paragraph(
        document,
        "The paragraphs in this chapter are repository-grounded starting points. "
        "Each technical lead must verify and rewrite the sections describing "
        "their work, add diagrams/screenshots, and document important problems "
        "encountered during implementation.",
    )

    implementation_sections = (
        (
            "4.1 Mobile application structure",
            (
                "The executable entry point loads the shared style and API "
                "configuration before delegating to Expo Router. Routes are "
                "declared by the directory structure under `src/app`, with "
                "separate unauthenticated and tab-based route groups. The root "
                "layout loads fonts, controls the splash-screen transition, "
                "applies Android navigation-bar behavior, and wraps navigation "
                "with application and authentication providers.",
                "The application provider composes the gesture, keyboard, bottom "
                "sheet, server-state, portal, and toast infrastructure. Domain "
                "features are separated into `auth`, `home`, `pets`, `reminders`, "
                "`profile`, `notifications`, and `assistant` modules. Each feature "
                "combines only the pages, components, queries, schemas, utilities, "
                "and local translation resources it needs, while shared API, UI, "
                "style, and error-recovery code remains under common modules.",
            ),
        ),
        (
            "4.2 Authentication and session lifecycle",
            (
                "The authentication context models three client states: loading, "
                "authenticated, and unauthenticated. Email/password and Google "
                "flows pass a backend authentication response to one session "
                "transition. Access tokens, optional refresh tokens, and expiry "
                "timestamps are stored through the shared SecureStore policy and "
                "mirrored in memory so request interceptors do not read protected "
                "storage for every request.",
                "On startup, the context loads the stored session. An unexpired "
                "access token is applied directly; an expired session with a "
                "refresh token attempts one refresh before local data is cleared. "
                "A shared promise serializes refresh calls inside the context. "
                "The Axios interceptor adds the current bearer token, retries a "
                "particular failed request at most once after a successful refresh, "
                "and invokes the registered unauthorized handler when recovery "
                "fails.",
                "Sign-out attempts to unregister the stored Android notification "
                "token and clear a previous Google session, then deletes local "
                "authentication material and transitions the client to the "
                "unauthenticated state. Automated tests cover failure tolerance "
                "during this cleanup, but restoration, expiry, concurrent `401` "
                "handling, and configured Google sign-in still require final "
                "scenario evidence.",
            ),
        ),
        (
            "4.3 Pet-profile management",
            (
                "The pet module separates list and profile pages from create, "
                "edit, delete, and photograph interactions. List and detail "
                "queries use distinct server-state keys. Successful creation "
                "invalidates the list, updating writes the returned pet into the "
                "detail cache before invalidation, and deletion invalidates both "
                "the list and the removed detail. This behavior is intended to "
                "keep screens consistent with the backend without treating cached "
                "data as an independent source of truth.",
                "Before photograph upload, the selected image is rendered and "
                "saved as a compressed JPEG. The client converts the native file "
                "URI into a React Native multipart value and sends it to the "
                "contract endpoint. This implementation choice reduces upload "
                "size and handles the native networking boundary, but image "
                "dimensions, quality, permissions, failure recovery, and actual "
                "backend storage must be evaluated on the final Android build.",
            ),
        ),
        (
            "4.4 Reminders and native notifications",
            (
                "Reminder pages and drawers implement list, description, creation, "
                "status, update, and deletion interactions. Read queries distinguish "
                "all reminders, pet-scoped reminders, and detail records. Create "
                "and schedule-changing update requests add the current UTC offset, "
                "and successful mutations invalidate the reminder query family. "
                "The use of a 60-second stale interval for reminder queries is a "
                "client caching decision, not a guarantee of real-time delivery.",
                "When an authenticated Android client becomes active, the "
                "notification provider creates the default channel, checks or "
                "requests permission, obtains the native Android push token, and "
                "synchronizes it with the backend. Token rotation triggers another "
                "registration. A replaced token is deleted where possible, and "
                "sign-out attempts remote and local cleanup. Eight automated tests "
                "cover these token and permission branches.",
                "A tapped notification is accepted only when its data contains a "
                "string `reminderId`. The response identifier prevents duplicate "
                "handling, and a reminder-status drawer is opened for the parsed "
                "identifier. This source path does not prove delivery or routing "
                "in foreground, background, and terminated application states. "
                "Those lifecycle cases, notification icons, channel behavior, and "
                "permission revocation require device-level evidence.",
            ),
        ),
        (
            "4.5 Pet-scoped assistant",
            (
                "Assistant entry is gated by stored consent and pet selection. "
                "For the active pet, the client loads existing backend sessions, "
                "selects the latest matching session, or creates the first session "
                "when none exists. A pet-reference guard prevents completion for a "
                "previous selection from replacing the current state. Message "
                "history is loaded in cursor pages of eight records and normalized "
                "before presentation.",
                "Sending and retrying use dedicated backend endpoints and query "
                "keys. Successful sends mark the relevant history stale without "
                "immediately discarding displayed data and invalidate the session "
                "list. Runtime schemas restrict request length and validate "
                "response identifiers, mode, answer, optional prediction, "
                "urgency, confidence ranges, related topics, clarification state, "
                "and disclaimer before the client treats a response as valid.",
                "A short local phrase list can trigger immediate conservative "
                "emergency presentation while a message is still submitted. This "
                "logic is not a classifier and must not be described as emergency "
                "detection. The server-provided urgency and prediction fields are "
                "also presentation data rather than clinical validation. Seven "
                "mobile test files cover consent, session bootstrap, pagination, send, "
                "retry, rate limiting, malformed states, urgency presentation, "
                "and selected accessibility behavior.",
                "The C# service persists sessions and messages, supplies at most "
                "eight prior messages plus the latest symptom summary to the "
                "downstream service, and implements retry metadata, failure "
                "mapping, metrics, and a circuit breaker. The AI service's "
                "unified `/chat` branch applies deterministic emergency and "
                "abstention rules, invokes the local condition classifier for "
                "health mode, and uses Gemini for human-readable response "
                "generation. The C# layer therefore owns integration and history, "
                "while the AI service owns analysis. A versioned live-service "
                "evaluation is still required.",
            ),
        ),
        (
            "4.6 Offline behavior and error recovery",
            (
                "A shared connectivity adapter passes native connection and "
                "internet-reachability changes to the server-state manager. "
                "Queries are configured to refetch after reconnection, with "
                "automatic query retry disabled and a default one-hour stale "
                "interval unless a feature overrides it. The global offline banner "
                "and route error fallback distinguish offline recovery from a "
                "generic rendering failure.",
                "This design pauses or recovers selected reads but does not "
                "implement an offline mutation queue, conflict resolution, or "
                "complete offline operation. The final evaluation must show what "
                "data remains visible, what actions are disabled or fail, and how "
                "authentication, pets, reminders, and assistant state behave "
                "across an offline-to-online transition.",
            ),
        ),
        (
            "4.7 User interface, localization, and accessibility",
            (
                "The interface uses shared style tokens and UI primitives together "
                "with feature-specific pages and components. Inter and Fraunces "
                "font families are loaded before the splash screen is hidden. "
                "Bottom sheets, portals, keyboard control, gestures, toasts, "
                "skeletons, and route-level recovery provide repeated interaction "
                "patterns across features.",
                "Internationalization resources are divided by feature namespace, "
                "but the configured language inventory currently contains English "
                "only. This organization supports future translation; it does not "
                "make the current application multilingual. The final thesis must "
                "describe English localization accurately and should not list "
                "loaded date-library locales as available interface languages.",
                "Selected components expose accessibility labels, hints, or target "
                "sizes, and assistant urgency is presented with text or icon cues "
                "rather than color alone. Current automated accessibility evidence "
                "is limited to the assistant page. Manual Android evaluation of "
                "focus order, TalkBack output, font scaling, contrast, touch "
                "targets, and error announcements is required across every "
                "critical flow.",
            ),
        ),
    )

    for title, paragraphs in implementation_sections:
        add_heading(document, title, 2)
        for paragraph in paragraphs:
            add_body_paragraph(document, paragraph)
        if title == "4.1 Mobile application structure":
            add_body_paragraph(
                document,
                "Repository attribution was evaluated at two scopes. The ancestry "
                "reachable from revision `0d5e33b` contains 26 human commits, all "
                "attributed to Illia Dolbnia. The separate `feature/care-screen` "
                "branch has the evaluated revision as its merge base and is 30 "
                "commits ahead, all attributed to Anastasia Leonova. Commit "
                "identity supports a repository-visible contribution, not sole "
                "design authorship, complete effort, or a contribution percentage.",
            )
            add_table(
                document,
                [
                    "Implementation scope",
                    "Paths / revisions",
                    "Visible attribution",
                    "Inclusion and claim boundary",
                ],
                [
                    [
                        "Application shell and shared UI",
                        "`src/app`, `src/common`, `src/styles`, `src/shadecn`; 8ee6c2e-0d5e33b",
                        "Reachable commits attributed to Illia",
                        "Present in evaluated revision; design, review, and pair contributions unverified",
                    ],
                    [
                        "Authentication and profile",
                        "`src/auth`, `src/profile`; 63a6b46, 47b8c7f, 1d25103",
                        "Reachable commits attributed to Illia",
                        "Client implementation present; backend and final device behavior separate",
                    ],
                    [
                        "Pets, reminders, and notifications",
                        "`src/pets`, `src/reminders`, `src/notifications`; 8f17f55-1d25103",
                        "Reachable commits attributed to Illia",
                        "Client paths present; CRUD, scheduling, FCM, and lifecycle results unverified",
                    ],
                    [
                        "Assistant client",
                        "`src/assistant`; 0d5e33b",
                        "Reachable commit attributed to Illia",
                        "Client present; AI-service implementation and clinical validity not proved",
                    ],
                    [
                        "Care-screen branch",
                        "`feature/care-screen`; 9c54123-15da8ee; 30 branch-only commits",
                        "Branch-only commits attributed to Anastasia",
                        "Not in evaluated revision; mock-backed and without care-specific tests",
                    ],
                    [
                        "C# core backend",
                        "`smart-pet-care-api`; main through 6d79951",
                        "Volodymyr: 39 non-merge commits; Kseniia: four squash commits",
                        "Implementation evidence present; final release and runtime acceptance remain separate",
                    ],
                    [
                        "Python AI service",
                        "`pet-diseases-classifier`; main 682dfb5; unified-chat branch 74019ea",
                        "Seven commits attributed to Illia",
                        "Implementation and branch evidence present; merged/deployed revision and model evaluation remain open",
                    ],
                ],
                [1680, 2760, 2100, 2520],
                caption_text=(
                    "Repository-grounded mobile implementation attribution and "
                    "release-inclusion boundaries (source: authors' own work based "
                    "on revision 0d5e33b and local Git references inspected on "
                    "25 July 2026)."
                ),
                chapter_prefix="4",
                sequence_number=1,
                restart_sequence=True,
            )
            add_body_paragraph(
                document,
                "Table 4.1 establishes that the evaluated client and the "
                "care-screen branch are different evidence populations. The "
                "branch proves that Anastasia has a substantial visible frontend "
                "history, but its mock collections, absence from the evaluated "
                "revision, and lack of care-specific test files prevent a claim "
                "of accepted or backend-integrated release functionality. Final "
                "allocation must also include Figma, reviews, external "
                "repositories, testing, research, and coordination evidence.",
            )
        add_placeholder_paragraph(
            document,
            "Add author attribution, source-code figure or diagram references, "
            "implementation decisions, encountered problems, and verified results.",
        )

    add_heading(document, "4.8 External backend and AI-service boundaries", 2)
    add_body_paragraph(
        document,
        "The core backend was inspected in the public `smart-pet-care-api` "
        "repository through main revision `6d79951`. It is an ASP.NET Core "
        "service with Entity Framework migrations, PostgreSQL persistence, "
        "JWT-based authentication, pet ownership checks, OpenAPI documentation, "
        "Firebase notification integration, and modules for users, pets, "
        "photographs, weight, health, feeding, reminders, journal, and chat. "
        "Docker and workflow artifacts describe build and deployment paths, but "
        "the final hosted release and its sanitized runtime configuration still "
        "require an acceptance record.",
    )
    add_body_paragraph(
        document,
        "The chat module makes the service boundary explicit. The C# backend owns "
        "authorization, session replacement, message persistence and status, "
        "history ordering and truncation, symptom-summary persistence, request "
        "forwarding, timeout and cancellation handling, error translation, retry "
        "metadata, metrics, and circuit-breaker behavior. The downstream Python "
        "service is stateless and owns general-versus-health routing, symptom "
        "analysis, condition prediction, urgency assignment, clarification "
        "behavior, and the informational answer. This allocation prevents the "
        "C# integration work from being misdescribed as implementation of the "
        "analysis model.",
    )
    add_body_paragraph(
        document,
        "The Python `pet-diseases-classifier` repository is attributed entirely "
        "to Illia Dolbnia in its visible history. Its main revision `682dfb5` "
        "contains FastAPI `/predict`, `/ask`, and `/wellness` routes plus AWS SAM "
        "and container definitions. The integrated stateless `/chat` contract, "
        "deterministic emergency and abstention rules, tests, CI, ONNX support, "
        "and model-release documentation are present on "
        "`origin/feature/unified-caht-endpoint-tests-and-docs` at `74019ea`. "
        "Because that revision is not the repository's main branch, the team must "
        "identify whether it was merged, tagged, or deployed before calling it "
        "the final production release.",
    )
    add_body_paragraph(
        document,
        "An authenticated, read-only comparison on 25 July 2026 found additive "
        "contract drift between the committed mobile snapshot and the configured "
        "backend description. The committed description contains 34 paths, 50 "
        "operations, and 60 component schemas; the fetched description contains "
        "38 paths, 57 operations, and 70 schemas, with no removals. The additions "
        "cover pet journal operations, a symptom catalogue, and symptom support "
        "in the existing health-record contract. The generated client inspected "
        "during the check contains no corresponding journal or symptom-catalogue "
        "symbols. This result proves that release reconciliation is required; it "
        "does not prove endpoint behavior, mobile implementation, backend "
        "revision attribution, or clinical validity.",
    )
    add_body_paragraph(
        document,
        "A separate temporary generation check used the installed Orval 8.14.0 "
        "client generator against the committed snapshot without overwriting "
        "repository source. The temporary and committed generated `index.ts` "
        "files were byte-for-byte identical: both contained 1,252 lines, "
        "occupied 34,534 bytes, and had SHA-256 "
        "`6116b5bab5e86f7e7abbeb8c3fa1df66554127f8995113a7d520e2f398f43aa2`. "
        "A fresh strict TypeScript check also passed. This proves deterministic "
        "generation for the currently committed snapshot, not approval of that "
        "snapshot as the final contract, live endpoint behavior, or final Gate "
        "A-02; the worktree was not clean and the live additive drift remains "
        "unresolved.",
    )
    add_body_paragraph(
        document,
        "Backend Git evidence separates the two backend roles. Volodymyr "
        "Biletskyi authored the dominant architectural and feature history, "
        "including persistence, authentication, pet CRUD, reminders, "
        "notifications, health, journal, OpenAPI, and deployment work. Kseniia "
        "Kushlak's identifiable squash commits cover Cloudinary pet photographs, "
        "feeding, weight history and tests, and classifier/chat integration; the "
        "last two commits record Volodymyr as co-author. Jira assignments provide "
        "planning context but do not override contradictory commit and comment "
        "evidence.",
    )
    add_placeholder_paragraph(
        document,
        "Insert final immutable service tags or image digests, sanitized "
        "deployment records, successful live contract exchanges, database "
        "migration state, monitoring evidence, and test results. Redact all "
        "secrets and personal data.",
    )

    add_heading(document, "4.9 Verification results", 2)
    add_body_paragraph(
        document,
        "A provisional repository validation was repeated on 25 July 2026 at "
        "Git revision `0d5e33b091e9582a7075786c0b9cf724510825f9` with Node.js "
        "`v24.18.0`. The configured `pnpm lint` command and a separate strict "
        "TypeScript check completed with exit code zero. A broader "
        "`eslint . --max-warnings=0` check failed with one Prettier error and "
        "zero warnings in the ignored generated declaration `expo-env.d.ts`. "
        "The same broad diagnostic passed with "
        "`--ignore-pattern expo-env.d.ts`. The configured static gate therefore "
        "passes, while the exact final generated-file exclusion still requires "
        "approval and a clean-revision rerun.",
    )
    add_body_paragraph(
        document,
        "Nine of nine Jest suites and 79 of 79 tests passed in repeated standard "
        "and `--detectOpenHandles` executions. The latest standard run reported "
        "that Jest did not exit one second after completion, while the latest "
        "diagnostic run reported no concrete open handle. Earlier executions "
        "emitted React `act(...)` warnings from assistant-query/page or "
        "`VirtualizedList` update paths, with counts that varied by timing and "
        "grouping. The result is therefore passing but not teardown-clean. Seven "
        "of the nine test files target the assistant module; the other two target "
        "authentication sign-out and Android notification-token registration. "
        "No current test file directly targets the pet, reminder, home, profile, "
        "or general navigation modules.",
    )
    add_body_paragraph(
        document,
        "An Android-only Expo export also completed, bundling 2,817 modules and "
        "84 assets. The generated Hermes bundle occupied approximately 6.8 MiB "
        "on disk and had SHA-256 "
        "`b4785f3588da7eab6f7e45c36745804c7d3df889b1b72b4f4fae32fbff34fb7d`. "
        "This demonstrates JavaScript and asset bundling in the evaluated "
        "environment; it does not demonstrate an APK, native linking, "
        "installation, OAuth, FCM delivery, live backend behavior, or production "
        "deployment. The working tree was not clean, so the Git revision alone "
        "does not identify the evaluated file state.",
    )
    add_body_paragraph(
        document,
        "A connected physical Samsung SM-G781B running Android 13 (API 33) was "
        "also inspected on 25 July 2026. Android reported the installed package "
        "`com.anonymous.smartpetcareapp`, version 1.0.0, version code 1, target "
        "SDK 36. The main activity resolved successfully and `am start -W` "
        "returned status `ok` with a 3,057 ms wait time. The device remained "
        "locked, so the UI hierarchy exposed Android System UI rather than "
        "application content. The installed artifact was not linked by digest "
        "to the evaluated source revision; consequently, this is device and "
        "launch-intent availability evidence, not a functional or performance "
        "result.",
    )
    add_body_paragraph(
        document,
        "Table 4.2 classifies the evidence currently available for the working "
        "draft. Its rows are checkpoints, not a substitute for the final "
        "requirement-results matrix. In particular, a provisional pass is "
        "limited to the exact sub-check and evaluated file state described in "
        "the evidence column.",
    )
    add_table(
        document,
        ["Checkpoint", "Current observation", "Bounded interpretation"],
        [
            [
                "A-02",
                "Orval 8.14.0 reproduced the committed generated client byte-for-byte.",
                "Current-snapshot sub-check passes; final contract approval and clean-release rerun remain open.",
            ],
            [
                "A-03",
                "Configured lint completed with exit code zero.",
                "Provisional static pass for the evaluated worktree; repeat on the final clean revision.",
            ],
            [
                "A-03b",
                "Broad lint failed on the ignored generated declaration and passed when that file was excluded.",
                "Final scope and exclusion are unapproved; the checkpoint remains open.",
            ],
            [
                "A-04",
                "Strict TypeScript checking completed with exit code zero.",
                "Provisional pass for the evaluated file state; repeat on the final clean revision.",
            ],
            [
                "A-05",
                "Nine suites and 79 tests passed, but delayed exit and earlier asynchronous warnings remain unresolved.",
                "Passing assertions do not satisfy the warning-free final gate; the checkpoint remains open.",
            ],
            [
                "A-06",
                "Android Expo export produced a JavaScript and asset bundle.",
                "Bundling sub-check passes; no native build, installation, or functional behavior is established.",
            ],
            [
                "Device",
                "Android exposed package metadata and accepted the launch intent while the device remained locked.",
                "Availability only; no Gate B-F functional, accessibility, or performance item passes.",
            ],
            [
                "Contract",
                "The configured live description contains additive journal and symptom surfaces.",
                "Drift is verified; endpoint behavior and final release consistency remain unverified.",
            ],
        ],
        [1260, 4140, 3660],
        caption_text=(
            "Current verification checkpoints and claim boundaries (source: "
            "authors' own work based on the recorded 25 July 2026 evidence)."
        ),
        chapter_prefix="4",
        sequence_number=2,
    )
    add_body_paragraph(
        document,
        "The current evidence therefore supports selected static, generation, "
        "and bundling observations only. It does not yet verify FR-01-FR-12, "
        "Android accessibility or performance, notification lifecycle behavior, "
        "or live backend and assistant-service behavior. The final version must "
        "replace this checkpoint view with requirement-level outcomes, preserve "
        "all failures and blocked or not-run items, and use those outcomes as "
        "the sole basis for the summary and conclusions.",
    )
    add_placeholder_paragraph(
        document,
        "Repeat all checks on the final clean revision, approve and encode the "
        "exact generated-file lint exclusion, resolve every unaccepted test "
        "warning and delayed-exit condition, add Android and external-service "
        "scenario evidence, and replace this provisional text with the complete "
        "requirement-results table.",
    )


def add_deployment(document: Document) -> None:
    add_heading(document, "5. Deployment and operation", 1)
    add_heading(document, "5.1 Prerequisites and configuration", 2)
    add_body_paragraph(
        document,
        "The repository declares Node.js 24.18.0 and pnpm 11.5.1. The mobile "
        "client uses Expo 56 and React Native 0.85.3. It requires a backend API "
        "URL and web, iOS, and Android Google OAuth client identifiers from the "
        "configured identity project. Android push-notification builds "
        "additionally require the Firebase Android client configuration. "
        "`EXPO_PUBLIC_*` values are compiled into the client and must never be "
        "treated as secrets; backend credentials, Firebase service-account "
        "material, signing data, and access tokens must not be included in the "
        "thesis or client bundle.",
    )
    add_body_paragraph(
        document,
        "The committed application configuration declares portrait orientation, "
        "the Android package `com.anonymous.smartpetcareapp`, an iOS bundle "
        "identifier, the `smartpetcareapp` scheme, a fingerprint-based EAS "
        "runtime policy, and native plugins for protected storage, "
        "notifications, Google sign-in, image selection, and date/time input. "
        "These declarations require confirmation against the final release. The "
        "Android manifest request for `RECORD_AUDIO` must be justified by an "
        "evaluated feature or removed before release.",
    )

    add_heading(document, "5.2 Installation and Android execution", 2)
    add_body_paragraph(
        document,
        "Table 5.1 summarizes the repository-grounded installation and Android "
        "execution sequence. It separates reproducible local steps from external "
        "configuration that must be supplied through approved channels.",
    )
    add_table(
        document,
        ["Step", "Repository command or action", "Purpose"],
        [
            [
                "1",
                "`pnpm install --frozen-lockfile`",
                "Install the declared dependency graph reproducibly",
            ],
            [
                "2",
                "Generate and compare the API client",
                "Confirm the approved OpenAPI snapshot is reproducible",
            ],
            [
                "3",
                "Copy `.env.example` to `.env`",
                "Create local public configuration without committing values",
            ],
            ["4", "Set `EXPO_PUBLIC_API_URL`", "Select the external backend host"],
            ["5", "Configure OAuth client identifiers", "Enable native Google sign-in"],
            [
                "6",
                "Provide Android Firebase client file",
                "Enable native FCM registration",
            ],
            [
                "7",
                "`pnpm android` or an identified EAS artifact",
                "Build, install, and run the native Android application",
            ],
        ],
        [780, 3540, 4740],
        caption_text=(
            "Installation and Android execution sequence (source: authors' own "
            "work based on repository configuration)."
        ),
        chapter_prefix="5",
        sequence_number=1,
        restart_sequence=True,
    )
    add_body_paragraph(
        document,
        "Expo Go cannot validate the native Google sign-in and FCM paths used by "
        "this project. The repository defines internal Android APK profiles for "
        "development and preview, plus a production profile with automatic "
        "version incrementing. A successful Metro export is a useful bundling "
        "gate but does not replace native build and installation evidence.",
    )
    add_placeholder_paragraph(
        document,
        "Re-run these steps from a clean checkout and record the exact successful "
        "environment. Never paste real tokens, passwords, or private configuration.",
    )

    add_heading(document, "5.3 External system boundaries", 2)
    add_body_paragraph(
        document,
        "The backend is external to the mobile repository. The client consumes a "
        "committed OpenAPI snapshot and regenerates a typed Axios and server-state "
        "client. Google identity and Firebase messaging are also external service "
        "boundaries. A final deployment diagram must show the actual hosted nodes, "
        "interfaces, and communication protocols supplied by the backend leads.",
    )
    add_body_paragraph(
        document,
        "The pull-request workflow declares frozen dependency installation, API "
        "generation, lint, TypeScript, Jest, and Expo export gates. Separate "
        "preview workflows request an EAS Android build when native-affecting "
        "configuration changes and publish JavaScript/asset updates for other "
        "changes. The fingerprint runtime policy helps separate compatible "
        "updates from builds requiring new native binaries. Workflow definitions "
        "prove intended automation, not successful runs; final GitHub Actions and "
        "EAS identifiers are still required.",
    )

    add_heading(document, "5.4 User operation", 2)
    add_body_paragraph(
        document,
        "The intended operating sequence begins with email or Google "
        "authentication, continues through the home overview and pet-profile "
        "creation, and then exposes pet-scoped reminders and the assistant. A "
        "notification carrying a valid reminder identifier opens the status "
        "workflow. Assistant use requires consent and pet selection, and its "
        "responses must be presented as informational rather than diagnostic. "
        "Profile maintenance and sign-out complete the owner-facing lifecycle.",
    )
    add_placeholder_paragraph(
        document,
        "Insert final-artifact screenshots and concise numbered instructions for "
        "authentication, pet creation, reminder management, notification status, "
        "assistant use, profile update, and sign-out. Record the build, device, "
        "test-data identity, and observation date; redact all personal and secret "
        "data.",
    )

    add_heading(document, "5.5 Maintenance and limitations", 2)
    add_body_paragraph(
        document,
        "The API client is regenerated from the committed OpenAPI contract rather "
        "than edited directly. Contract changes require regeneration, type "
        "checking, review of the resulting diff, and coordinated backend "
        "versioning. Native dependencies, notification configuration, OAuth "
        "configuration, and incompatible runtime changes require a native "
        "rebuild; JavaScript and asset changes may be eligible for a compatible "
        "EAS update.",
    )
    add_body_paragraph(
        document,
        "A thesis-evaluated release should identify the mobile revision, "
        "lockfile and artifact digests, OpenAPI snapshot, backend and AI-service "
        "releases, EAS build profile and identifier, environment, device, "
        "executor, and evidence location. Current limitations include uneven "
        "automated-test distribution, unresolved test warnings and direct-ESLint "
        "scope, unverified native permissions, missing Android scenario results, "
        "and unavailable external-service deployment evidence.",
    )


def add_back_matter(document: Document) -> None:
    add_heading(document, "Summary and conclusions", 1)
    add_placeholder_paragraph(
        document,
        "Write this section only after the final results are available. Address "
        "every objective and acceptance criterion, distinguish achieved and "
        "partially achieved outcomes, interpret evidence, discuss problems and "
        "trade-offs, and identify grounded future work. Maximum two pages.",
    )

    add_heading(document, "Bibliography", 1)
    add_placeholder_paragraph(
        document,
        "The entries below use a continuous working numeric sequence and are "
        "cross-referenced from the current prose. Ksenia and the relevant "
        "technical lead must still review every original source. Before "
        "submission, approve the source set, preserve alphabetical ordering "
        "within both sections, renumber if any entry changes, add every source "
        "needed by later chapters, and remove every uncited entry.",
        label="DRAFT BIBLIOGRAPHY NOTE",
    )
    add_heading(document, "Printed and scientific literature", 2)
    scientific_sources = (
        "[1] Biørn-Hansen A., Rieger C., Grønli T.-M., Majchrzak T.A., "
        "Ghinea G., An empirical investigation of performance overhead in "
        "cross-platform mobile development frameworks, Empirical Software "
        "Engineering, 2020, 25, pp. 2997-3040, "
        "https://doi.org/10.1007/s10664-020-09827-6.",
        "[2] Chu C.P., ChatGPT in veterinary medicine: a practical "
        "guidance of generative artificial intelligence in clinics, education, "
        "and research, Frontiers in Veterinary Science, 2024, 11:1395934, "
        "https://doi.org/10.3389/fvets.2024.1395934.",
        "[3] Dorfer T., Demetz L., Huber S., Impact of mobile "
        "cross-platform development on CPU, memory and battery of mobile "
        "devices when using common mobile app features, Procedia Computer "
        "Science, 2020, 175, pp. 189-196, "
        "https://doi.org/10.1016/j.procs.2020.07.029.",
        "[4] Haase L., Sedlmayr B., Sedlmayr M., Monett D., Winter J., "
        "Towards mHealth applications for pet animal owners: a comprehensive "
        "literature review of requirements, BMC Veterinary Research, 2025, "
        "21:190, https://doi.org/10.1186/s12917-025-04658-3.",
        "[5] International Organization for Standardization, ISO "
        "9241-11:2018, Ergonomics of human-system interaction - Part 11: "
        "Usability: Definitions and concepts, Edition 2, 2018.",
        "[6] International Organization for Standardization, ISO/IEC "
        "25010:2023, Systems and software engineering - Systems and software "
        "Quality Requirements and Evaluation (SQuaRE) - Product quality model, "
        "Edition 2, 2023.",
        "[7] International Organization for Standardization, "
        "ISO/IEC/IEEE 29119-1:2022, Software and systems engineering - Software "
        "testing - Part 1: General concepts, Edition 2, 2022.",
        "[8] International Organization for Standardization, "
        "ISO/IEC/IEEE 29119-2:2021, Software and systems engineering - Software "
        "testing - Part 2: Test processes, Edition 2, 2021.",
        "[9] International Organization for Standardization, "
        "ISO/IEC/IEEE 29148:2018, Systems and software engineering - Life cycle "
        "processes - Requirements engineering, Edition 2, 2018.",
        "[10] International Organization for Standardization, "
        "ISO/IEC/IEEE 42010:2022, Software, systems and enterprise - "
        "Architecture description, Edition 2, 2022.",
        "[11] Kogan L., Oxley J.A., Hellyer P., Schoenfeld R., Rishniw M., "
        "UK pet owners' use of the internet for online pet health information, "
        "Veterinary Record, 2018, 182(21):601, "
        "https://doi.org/10.1136/vr.104716.",
        "[12] Springer S., Lund T.B., Corr S.A., Sandøe P., Does 'Dr. "
        "Google' improve discussion and decisions in small animal practice? Dog "
        "and cat owners use of internet resources to find medical information "
        "about their pets in three European countries, Frontiers in Veterinary "
        "Science, 2024, 11:1417927, "
        "https://doi.org/10.3389/fvets.2024.1417927.",
    )
    for source in scientific_sources:
        add_body_paragraph(document, source)

    add_placeholder_paragraph(
        document,
        "Confirm whether the complete ISO standards are available through the "
        "CDV library. If only the official abstracts were reviewed, limit the "
        "corresponding thesis claims and record the official ISO pages as online "
        "sources instead of implying full-text review.",
    )

    add_heading(document, "Online sources", 2)
    online_sources = (
        "[13] 11 Pets Ltd, 11pets: Pet care, Google Play, "
        "https://play.google.com/store/apps/details?id=com.m11pets.elevenpets "
        "(accessed: 25.07.2026).",
        "[14] Expo, Expo SecureStore, SDK 56, "
        "https://docs.expo.dev/versions/v56.0.0/sdk/securestore/ (accessed: "
        "25.07.2026).",
        "[15] Expo, Introduction to Expo Router, "
        "https://docs.expo.dev/router/introduction/ (accessed: 25.07.2026).",
        "[16] Orval Labs, Overview - Generate type-safe TypeScript clients "
        "from OpenAPI specifications, https://orval.dev/docs/ (accessed: "
        "25.07.2026).",
        "[17] OWASP Foundation, OWASP Mobile Application Security "
        "Verification Standard (MASVS), version 2.1.0, "
        "https://mas.owasp.org/MASVS/ (accessed: 25.07.2026).",
        "[18] PetDesk, LLC, PetDesk - Pet Health Reminders, Google Play, "
        "https://play.google.com/store/apps/details?id=com.locai.petpartner "
        "(accessed: 25.07.2026).",
        "[19] Shibapp LLC, Dog and cat care - PetnotePlus, Google Play, "
        "https://play.google.com/store/apps/details?id=com.lancerdog.petnote_plus "
        "(accessed: 25.07.2026).",
        "[20] TanStack, Query Invalidation - TanStack Query v5, "
        "https://tanstack.com/query/v5/docs/framework/react/guides/"
        "query-invalidation (accessed: 25.07.2026).",
        "[21] TanStack, React Native - TanStack Query v5, "
        "https://tanstack.com/query/v5/docs/framework/react/react-native "
        "(accessed: 25.07.2026).",
        "[22] Vitus Animal Health, Inc., VitusVet: Pet Health Care App, "
        "Google Play, "
        "https://play.google.com/store/apps/details?id=com.vitusvet.android "
        "(accessed: 25.07.2026).",
        "[23] Zod, Basic usage, https://zod.dev/basics (accessed: "
        "25.07.2026).",
    )
    for source in online_sources:
        add_body_paragraph(document, source)

    add_heading(document, "List of figures", 1)
    figure_list = document.add_paragraph()
    figure_list.paragraph_format.first_line_indent = Cm(0)
    add_field(
        figure_list,
        ' TOC \\h \\z \\c "Figure" ',
        "Update after final captions are inserted.",
    )
    add_placeholder_paragraph(
        document,
        "Use the final caption label required by the thesis language and update "
        "this field in Word.",
    )

    add_heading(document, "List of tables", 1)
    table_list = document.add_paragraph()
    table_list.paragraph_format.first_line_indent = Cm(0)
    add_field(
        table_list,
        ' TOC \\h \\z \\c "Table" ',
        "Update after final captions are inserted.",
    )
    add_placeholder_paragraph(
        document,
        "Use the final caption label required by the thesis language and update "
        "this field in Word.",
    )

    add_heading(document, "Streszczenie", 1)
    add_placeholder_paragraph(
        document,
        "Add the final Polish abstract and five or six Polish keywords after the "
        "conclusions are approved.",
    )

    add_heading(document, "Abstract", 1)
    add_placeholder_paragraph(
        document,
        "Add the final English abstract and five or six English keywords after "
        "the conclusions are approved.",
    )

    add_heading(document, "Team work-allocation sheet", 1)
    add_body_paragraph(
        document,
        "Table A.1 is a working phase allocation derived from the confirmed roles. "
        "The official CDV sheet, completed consistently and signed by all "
        "authors, must replace or follow this table as the final pages of the "
        "submission.",
    )
    add_table(
        document,
        [
            "Project phase",
            "Weight",
            "Volodymyr",
            "Ksenia",
            "Anastasia Leonova",
            "Illia",
        ],
        [
            ["Domain research and requirements", "15%", "15%", "40%", "30%", "15%"],
            [
                "System architecture and product design",
                "10%",
                "30%",
                "15%",
                "20%",
                "35%",
            ],
            ["Core backend and API", "20%", "50%", "35%", "5%", "10%"],
            ["Mobile frontend", "25%", "5%", "5%", "45%", "45%"],
            ["AI backend service", "10%", "20%", "15%", "5%", "60%"],
            ["Testing and quality assurance", "10%", "25%", "25%", "25%", "25%"],
            [
                "Deployment, thesis evidence, and documentation",
                "10%",
                "30%",
                "25%",
                "20%",
                "25%",
            ],
        ],
        [2760, 900, 1200, 1080, 1740, 1380],
        caption_text=(
            "Working phase allocation among the four authors (source: authors' "
            "own working allocation)."
        ),
        chapter_prefix="A",
        sequence_number=1,
        restart_sequence=True,
    )
    add_placeholder_paragraph(
        document,
        "Add full legal names and album numbers, reconcile the percentages with "
        "verifiable artifacts, obtain all authors' and supervisor's approval, and "
        "append the signed official CDV sheet.",
    )


def set_document_properties(document: Document) -> None:
    properties = document.core_properties
    properties.title = "Smart Pet Care Assistant - CDV Engineering Thesis Working Draft"
    properties.subject = "Collegium Da Vinci Informatics engineering thesis"
    properties.author = "Smart Pet Care App thesis team"
    properties.keywords = "CDV, engineering thesis, Informatics, Smart Pet Care Assistant"
    properties.comments = (
        "Working draft generated from verified repository evidence and official "
        "CDV Informatics requirements. Not submission-ready."
    )


def enable_field_updates(document: Document) -> None:
    settings = document.settings._element
    update_fields = settings.find(qn("w:updateFields"))
    if update_fields is None:
        update_fields = OxmlElement("w:updateFields")
        settings.append(update_fields)
    update_fields.set(qn("w:val"), "true")


def build_document() -> None:
    document = Document()
    configure_styles(document)
    configure_sections(document)
    set_document_properties(document)
    enable_field_updates(document)

    add_title_page(document)
    add_table_of_contents(document)

    body_section = document.add_section(WD_SECTION.NEW_PAGE)
    configure_sections(document)
    set_page_number_continuation(body_section)
    add_page_number_footer(body_section)

    add_introduction(document)
    add_current_state(document)
    add_objective_and_scope(document)
    add_methodology(document)
    add_implementation(document)
    add_deployment(document)
    add_back_matter(document)

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    document.save(OUTPUT_PATH)
    normalize_docx_package(OUTPUT_PATH)
    print(OUTPUT_PATH)


if __name__ == "__main__":
    build_document()
