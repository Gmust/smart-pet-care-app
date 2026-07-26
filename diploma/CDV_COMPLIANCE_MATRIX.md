# Smart Pet Care App - CDV Compliance Matrix

## Purpose and authority boundary

This matrix maps the public Collegium Da Vinci graduation materials verified on
25 July 2026 to the current thesis workspace. It is a document-control record,
not a substitute for the materials available to the students in Wirtualna
Uczelnia (WU).

The evidence has three different authority levels:

1. The public 2026/2027 CDV study regulation is now available and governs
   general eligibility, language approval, and defence conditions for that
   academic cycle.
2. Rector's Order 31/2025 and its `PR_WSZJK_5_Dyplomowanie` procedure remain
   the current public university-wide process documents.
3. The public graduation page and Informatics packages still expose
   2024/2025-labelled dates or templates. Current programme-specific deadlines,
   Dean's orders, title-page file, and binding submission instructions must
   therefore be confirmed in WU and with the supervisor before submission.

No public 2024/2025 deadline is treated as the team's current deadline.

## Verified source baseline

| ID     | Official source                                                                                                                                                       | Current verification                                                                                    | Authority and limitation                                                                                                       |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| CDV-01 | [CDV graduation page](https://cdv.pl/dyplomowanie/)                                                                                                                   | Public page inspected 25.07.2026; still labelled 2024/2025                                              | Confirms the general workflow and practical-project submission, but directs students to WU for binding Dean's orders and dates |
| CDV-02 | [Rector's Order 31/2025](https://cdv.pl/app/uploads/2025/10/zarzadzenie-nr-31-2025-w-sprawie-wprowadzenia-wewnetrznego-systemu-zapewnienia-jakosci-ksztalcenia-2.pdf) | SHA-256 `de6a07a5f74bcf6155bca5b763f1cb0543521514edd24856b228de14c3f4bbe3`                              | Effective 12.09.2025; replaced Rector's Orders 41/2024 and 53/2024                                                             |
| CDV-03 | [PR_WSZJK_5_Dyplomowanie, version 1.0](https://cdv.pl/app/uploads/2025/10/zalacznik-6-dyplomowanie-pl-1.pdf)                                                          | SHA-256 `fbff0c921a547c58a9a161511d7e1eed00a9ec14e3c64fa23fa07aae1361c44d`                              | Current public university-wide diploma procedure; programme requirements remain governed by Dean's guidance                    |
| CDV-04 | [Full-time Informatics package](https://cdv.pl/app/uploads/2025/10/informatyka-tryb-stacjonarny-20250912t140141z-1-001-1.zip)                                         | HTTP 200, valid 12-file ZIP; SHA-256 `63e27a1e09db4f352b1853a71fd197928e9e2243acb78754666eb056bc2f6ba7` | Publicly served on 25.07.2026, but internal guide/template names reference 2024/2025                                           |
| CDV-05 | [Part-time Informatics package](https://cdv.pl/app/uploads/2025/10/informatyka-tryb-niestacjonarny-20250912t140142z-1-001.zip)                                        | HTTP 200, valid 12-file ZIP; SHA-256 `1afa78bfd8c2564adb2fa556c16c518dd5915f5d2980aa0c3d2276fe5039780a` | Same age limitation; use only after the team's study mode is confirmed                                                         |
| CDV-06 | [Regulamin studiów dyplomowych 2026/2027](https://cdv.pl/app/uploads/2026/01/regulamin-studiow-dyplomowych-26-27.pdf)                                                 | Public PDF inspected 25.07.2026; §§22, 32-34 were reviewed                                              | Current general regulation for the 2026/2027 cycle; it does not replace programme-specific Dean/WU instructions                |

The refreshed ZIP hashes match the earlier temporary copies exactly. The
full-time and part-time packages contain the same eight-page Informatics guide.
The inspected title page, thesis card, and version 3 allocation-sheet layouts
are visually equivalent between the two packages, although their PDFs are not
all binary-identical. The correct package must still follow the confirmed study
mode.

## Current 2026/2027 public-regulation findings

The current public regulation adds requirements that should be treated as
gates in the thesis plan:

- the thesis and defence may be conducted in a language selected by the student
  only after the required request and approval involving the deputy dean and
  thesis supervisor (§22.2);
- eligibility for the defence includes completing the programme, required
  examinations and placements, obtaining the required ECTS, preparing a thesis
  accepted by the supervisor and submitted to the Dean's Office, and settling
  required fees (§34.2);
- the engineering defence is oral (§34.4), and its scope is set by a Dean's
  order and communicated during the specified academic period (§34.5);
- the commission has three members and includes the supervisor, reviewer, and
  chair (§34.6); and
- the defence is scheduled within the regulation's stated four-month window
  after all conditions are met, subject to the Dean's published schedule
  (§34.8).

These are current public-regulation requirements, not proof that this team has
satisfied them. The exact deadline, topic approval, title-page file, submission
medium, and defence question list remain external WU/Dean inputs.

## Requirement-to-artifact matrix

Status meanings:

- **Confirmed** - current workspace evidence satisfies the public requirement.
- **Partial** - the structure exists, but approved data, evidence, or final
  review is missing.
- **Missing** - the required final artifact or decision is not present.
- **External** - only WU, the supervisor, or another team repository can provide
  the evidence.

| Public requirement                                                                                                                                                                                                                               | Current thesis evidence                                                                                                           | Status                           | Required closure                                                                                                                           |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Engineering work normally prepared by a 3-4 person team                                                                                                                                                                                          | Four named team roles are recorded throughout the workspace                                                                       | Partial                          | Add legal names, album numbers, contribution evidence, and signatures                                                                      |
| Approved Polish and English title                                                                                                                                                                                                                | Candidate titles are used consistently in the working DOCX                                                                        | Partial                          | Confirm the Quality Committee/supervisor-approved title from the thesis card                                                               |
| Official title-page hierarchy and typography                                                                                                                                                                                                     | Builder uses the official Verdana sizes and four-author structure                                                                 | Partial                          | Insert approved metadata and visually compare the rendered DOCX with the binding WU template                                               |
| A4, Verdana 10 pt, 1.15 spacing, justified body, first-line indents, no inter-paragraph gaps                                                                                                                                                     | Builder styles and structural audit implement these properties                                                                    | Confirmed structurally           | Complete page-image inspection in Word or LibreOffice                                                                                      |
| Chapter titles 12 pt bold; subchapter/lower titles 10 pt bold; left alignment; numbered chapters on new pages                                                                                                                                    | Heading styles and section audit implement the hierarchy                                                                          | Confirmed structurally           | Inspect pagination after final content and field updates                                                                                   |
| Page numbers counted from the title page but displayed from Introduction in the right footer                                                                                                                                                     | DOCX uses a separate body section and right-aligned `PAGE` field                                                                  | Confirmed structurally           | Update fields and visually verify the first displayed number                                                                               |
| Required order: title, contents, unnumbered Introduction, numbered knowledge/objective/method/implementation/deployment chapters, unnumbered conclusions, bibliography, figure/table lists, Polish and English abstracts, final allocation sheet | All required top-level sections exist in the working DOCX                                                                         | Partial                          | Replace markers with approved content; append the signed official allocation form                                                          |
| Introduction and conclusions each no more than two pages                                                                                                                                                                                         | Both sections exist                                                                                                               | Partial                          | Final prose and rendered page counts are unavailable                                                                                       |
| Functional requirements in tables for all identified use cases                                                                                                                                                                                   | DOCX Table 2.3 and `USE_CASE_TRACEABILITY_AUDIT.md` map UC-01-UC-18 to FRs, implementation boundaries, and verification scenarios | Partial                          | Approve the UC boundaries; decide UC-08/FR-13, server-logout semantics, and additional contract surfaces; execute final evidence           |
| Minimum software-engineering diagrams: use case, class/object, component with dependencies/interfaces, and deployment/protocol view                                                                                                              | Eight compiled figures include all four required views plus three sequence diagrams and the second use-case view                  | Partial                          | Backend/AI owners must verify provisional external-service facts                                                                           |
| Numbered table titles above and figure captions below; left aligned; visuals/tables centred and inside margins; every item sourced and referenced from prose                                                                                     | Rebuilt DOCX contains eleven table captions and eight figure captions with sources and body references; structural audits pass    | Confirmed structurally           | Visual page QA remains unavailable                                                                                                         |
| Chapter-qualified table/figure numbering, illustrated publicly as `Table 2.1` and `Figure 3.2`                                                                                                                                                   | Rebuilt DOCX contains Tables 1.1, 2.1-2.5, 3.1, 4.1-4.2, 5.1, A.1 and Figures 3.1-3.8 with Word sequence fields                   | Confirmed structurally           | Update Word fields and inspect the generated lists                                                                                         |
| Numeric in-text citations in square brackets; no footnotes                                                                                                                                                                                       | Continuous citations 1-23; no temporary IDs; no footnotes                                                                         | Confirmed for current source set | Repeat the audit after every source change                                                                                                 |
| Bibliography alphabetized, with separate scientific/printed and online sections; each entry cited; access dates for online sources                                                                                                               | Two working sections and cross-reference audit exist                                                                              | Partial                          | Authors and supervisor must approve every original source and final formatting                                                             |
| Polish and English abstracts with five or six keywords                                                                                                                                                                                           | Both headings and markers exist                                                                                                   | Missing                          | Write only after final results and conclusions are approved                                                                                |
| Signed allocation sheet as the final, unnumbered pages; each task row and overall allocation sum to 100%                                                                                                                                         | Working allocation tables and evidence intake exist                                                                               | Missing                          | Complete the official three-page version 3 form, reconcile percentages, sign by four authors and supervisor, then append                   |
| Practical project submitted with the thesis; each team member submits the required documents/carrier under the published 2024/2025 workflow                                                                                                      | Mobile repository and partial build evidence exist                                                                                | External                         | Confirm the current WU submission medium, naming, archive contents, declarations, and per-author obligations                               |
| JSA anti-plagiarism review under the supervisor                                                                                                                                                                                                  | Integrity controls and citation audits exist                                                                                      | External                         | Submit the final approved text through the official JSA workflow                                                                           |
| AI use should be critical, ethically considered, cited where used, and accompanied by retained conversation evidence under the public 2024/2025 guide                                                                                            | `AI_USE_LOG.md` records assistance and verification limits                                                                        | Partial                          | Confirm current WU/supervisor rules, retain the session export/screenshots, add every author's AI use, and approve disclosure placement    |
| 2026/2027 defence eligibility and oral three-person commission                                                                                                                                                                                   | Public Regulation 2026/2027 §§34.2, 34.4-34.8 is recorded above; the plan includes a final eligibility/defence gate               | Partial                          | Confirm programme completion, practice/ECTS/fee status, supervisor acceptance, Dean's order, reviewer, chair, deadline, and question scope |
| Thesis language approval                                                                                                                                                                                                                         | Regulation §22.2 permits a student-selected language with the required approval; the working DOCX is English                      | Partial                          | Obtain written language approval and ensure title page, abstract, body, and defence materials use the approved language convention         |
| Final assessment uses a 50-point sheet covering content/title, objective/current knowledge, literature, implementation, results, originality, value, language, and formatting                                                                    | Blueprint maps the current four-author assessment sheet                                                                           | Partial                          | Run a documented internal scoring review after all evidence and prose are final                                                            |

## Confirmed public submission process

The public CDV page and Informatics guide support the following provisional
checklist:

1. Complete all course, placement, and payment obligations.
2. Obtain supervisor acceptance of the electronic thesis.
3. Use the current Dean's order in WU for the binding submission and defence
   date.
4. Prepare one PDF with the correct filename/label plus the Informatics
   practical project.
5. Prepare the required team/independent-work and diploma-delivery
   declarations.
6. For a team thesis, follow the current per-author submission obligation.
7. Complete JSA review under the supervisor.
8. Confirm the oral defence format, three-person commission, place, and
   question scope through the current university notice.
9. Confirm that programme, placement, ECTS, fee, supervisor-acceptance, and
   Dean's-order conditions are all recorded before booking the defence.

Items 3-9 must be reconfirmed against the team's current WU materials because
the public page and Informatics package still describe an older cycle.

## Binding inputs still required

The following cannot be inferred safely:

- full-time or part-time study mode;
- current academic year and Dean's order;
- exact submission and defence deadlines;
- approved Polish and English titles;
- full legal names and album numbers;
- supervisor's full title and name;
- approved thesis card;
- binding title-page file from WU;
- current submission medium, filename, archive, and declaration set;
- final AI-use disclosure requirements;
- evidence-backed work-allocation percentages and signatures.

Until these values are supplied, the document remains a structurally compliant
working draft rather than a submission-ready thesis.
