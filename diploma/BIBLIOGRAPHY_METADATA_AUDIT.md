# Smart Pet Care App - Bibliography Metadata Audit

## Purpose

This audit checks whether the 23 working bibliography entries identify real,
traceable sources with accurate core metadata. It does not replace the authors'
obligation to read the original material, verify every supported claim, and
approve the final source set with the supervisor.

## Audit baseline

- Audit date: 25 July 2026.
- Working bibliography: entries 1-23 in
  `diploma/output/Smart_Pet_Care_CDV_Thesis_Working_Draft.docx`.
- Numeric assignment authority: `diploma/SOURCE_REGISTER.md`.
- Claim-mapping authority: `diploma/SOURCE_CLAIM_COVERAGE_AUDIT.md`.
- Mechanical citation result: all entries 1-23 are cited and every numeric
  citation has an entry.

Core metadata means author or organization, title, publication or product,
year/version, volume/article/pages where applicable, DOI or stable official
URL, and access date for online sources.

## Result codes

- **MV - metadata verified:** core bibliographic metadata agrees with an
  authoritative publisher, DOI, PubMed, or official product record.
- **AO - official abstract only:** ISO identifier, title, edition, and year are
  verified, but the complete standard has not been supplied or reviewed.
- **OD - official documentation:** the cited page is the official
  project/vendor documentation and resolves to the described topic.
- **DL - dynamic listing:** the official store listing and publisher identity
  resolve, but features and display metadata can change and require a final
  dated recheck.

## Entry-level audit

| No. | Working source                                          | Authority checked                                                                                               | Result | Decision and remaining limitation                                                                                                                                                 |
| --: | ------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|   1 | Biørn-Hansen et al., cross-platform performance         | Springer Nature article and DOI `10.1007/s10664-020-09827-6`                                                    | MV     | Five named authors, title, journal, 2020, volume 25, and pages 2997-3040 agree. The study predates the project's React Native generation and cannot replace project measurements. |
|   2 | Chu, ChatGPT in veterinary medicine                     | Frontiers article/PDF and DOI `10.3389/fvets.2024.1395934`                                                      | MV     | Author, title, 2024, volume 11, and article 1395934 agree. It is a mini review, not clinical validation of the project.                                                           |
|   3 | Dorfer et al., mobile cross-platform CPU/memory/battery | Elsevier ScienceDirect and DOI `10.1016/j.procs.2020.07.029`                                                    | MV     | Three authors, title, Procedia Computer Science 175 (2020), and pages 189-196 agree. Results remain specific to the studied app, devices, and older framework.                    |
|   4 | Haase et al., pet-owner mHealth requirements review     | BMC Veterinary Research article/PDF and DOI `10.1186/s12917-025-04658-3`                                        | MV     | Five authors, title, 2025, volume 21, and article 190 agree. The review's small included-study set and triage context must remain visible.                                        |
|   5 | ISO 9241-11:2018                                        | [ISO record 63500](https://www.iso.org/standard/63500.html)                                                     | AO     | Identifier, title, Edition 2, and 2018 agree. Use only concepts exposed by the official abstract until lawful full-text access is recorded.                                       |
|   6 | ISO/IEC 25010:2023                                      | [ISO record 78176](https://www.iso.org/standard/78176.html)                                                     | AO     | Identifier, title, Edition 2, and 2023 agree. The abstract supports quality-model framing, not reproduction of the complete model or a conformance claim.                         |
|   7 | ISO/IEC/IEEE 29119-1:2022                               | [ISO record 81291](https://www.iso.org/standard/81291.html)                                                     | AO     | Identifier, title, Edition 2, and 2022 agree. The official abstract supports general testing concepts only.                                                                       |
|   8 | ISO/IEC/IEEE 29119-2:2021                               | [ISO record 79428](https://www.iso.org/standard/79428.html)                                                     | AO     | Identifier, title, Edition 2, and 2021 agree. The official abstract supports generic test-process scope only.                                                                     |
|   9 | ISO/IEC/IEEE 29148:2018                                 | [ISO record 72089](https://www.iso.org/standard/72089.html)                                                     | AO     | Identifier, title, Edition 2, and 2018 agree. ISO confirmed this edition in 2024 and marked it for revision in 2026; it remains the current published edition until replaced.     |
|  10 | ISO/IEC/IEEE 42010:2022                                 | [ISO record 74393](https://www.iso.org/standard/74393.html)                                                     | AO     | Identifier, title, Edition 2, and 2022 agree. The abstract distinguishes architecture from its description and does not prescribe UML.                                            |
|  11 | Kogan et al., UK pet owners' internet use               | [PubMed 29549181](https://pubmed.ncbi.nlm.nih.gov/29549181/) and DOI `10.1136/vr.104716`                        | MV     | Five authors, title, Veterinary Record 182(21):601, and 2018 agree. The 571-person UK online survey is not current Polish prevalence evidence.                                    |
|  12 | Springer et al., “Dr. Google” study                     | Frontiers article/PDF and DOI `10.3389/fvets.2024.1417927`                                                      | MV     | Four authors, title, 2024, volume 11, and article 1417927 agree. The 2,117-person three-country survey does not establish project effectiveness or Polish-user behavior.          |
|  13 | 11pets: Pet care                                        | [Google Play listing](https://play.google.com/store/apps/details?id=com.m11pets.elevenpets)                     | DL     | Package, title, and publisher `11 Pets Ltd` resolve. Features and listing text must be rechecked on the source-freeze date; listing claims are not hands-on evaluation.           |
|  14 | Expo SecureStore, SDK 56                                | [Expo SDK 56 documentation](https://docs.expo.dev/versions/v56.0.0/sdk/securestore/)                            | OD     | Versioned official page matches the project SDK family and supports storage-library behavior only, not an application-wide security claim.                                        |
|  15 | Introduction to Expo Router                             | [Expo documentation](https://docs.expo.dev/router/introduction/)                                                | OD     | Official page resolves and describes file-based routing. It is living documentation, so the final access date must remain visible.                                                |
|  16 | Orval overview                                          | [Orval documentation](https://orval.dev/docs/)                                                                  | OD     | Official page resolves and supports OpenAPI-to-TypeScript generation behavior. Project reproducibility remains supported by separate project evidence.                            |
|  17 | OWASP MASVS 2.1.0                                       | [OWASP MASVS](https://mas.owasp.org/MASVS/) and official release record                                         | OD     | Version 2.1.0 remains the latest official MASVS release found. It supplies verification categories, not certification or proof that Smart Pet Care is secure.                     |
|  18 | PetDesk - Pet Health Reminders                          | [Google Play listing](https://play.google.com/store/apps/details?id=com.locai.petpartner)                       | DL     | Package and title resolve; the listing displays PetDesk and identifies `PetDesk, LLC` in developer details. Recheck dynamic features and publisher display at source freeze.      |
|  19 | Dog and cat care - PetnotePlus                          | [Google Play listing](https://play.google.com/store/apps/details?id=com.lancerdog.petnote_plus)                 | DL     | Package, title, and publisher `Shibapp LLC` resolve. Recheck dynamic features at source freeze.                                                                                   |
|  20 | TanStack Query invalidation                             | [TanStack Query v5 documentation](https://tanstack.com/query/v5/docs/framework/react/guides/query-invalidation) | OD     | Official v5 page supports stale marking and targeted/background refetch behavior. It does not prove the project's invalidation choices are complete.                              |
|  21 | TanStack Query for React Native                         | [TanStack Query v5 documentation](https://tanstack.com/query/v5/docs/framework/react/react-native)              | OD     | Official v5 page supports React Native connectivity and focus integration. Project offline/reconnect behavior still requires device evidence.                                     |
|  22 | VitusVet: Pet Health Care App                           | [Google Play listing](https://play.google.com/store/apps/details?id=com.vitusvet.android)                       | DL     | Package and title resolve; the listing displays VitusVet and identifies `VITUS ANIMAL HEALTH, INC.` in developer details. Recheck dynamic features at source freeze.              |
|  23 | Zod basic usage                                         | [Zod documentation](https://zod.dev/basics)                                                                     | OD     | Official page supports schema parsing, errors, safe parsing, and inferred types. It does not prove completeness of the project's schemas.                                         |

## Findings

### Bibliography text

No demonstrable author, title, DOI, standard identifier, edition, publication
year, journal, volume, article number, page range, package identifier, or cited
official URL defect was found in the 23 working entries. The numeric sequence
therefore remains unchanged.

### Local records corrected

- The completion audit incorrectly described the online bibliography as entries
  13-21; the correct range is 13-23.
- Source-register candidate-section mappings that referred to a nonexistent
  Chapter 6 were corrected to section 4.9.
- Other stale section labels were reconciled with the current thesis headings.

### Academic-integrity boundary

The six ISO entries remain **AO**, not full-text-reviewed sources. Their current
placement in the printed/scientific section is provisional. Before source
freeze, Ksenia must record either:

1. lawful access to and review of each complete standard used for a detailed
   claim; or
2. an abstract-only decision that limits the prose to the official ISO record
   and treats that record according to the supervisor-approved bibliography
   convention.

## Source-freeze gate

The bibliography can be called supervisor-ready only when:

- [ ] Ksenia records an accept/exclude decision for entries 1-23 after reading
      each original source or the explicitly permitted official abstract.
- [ ] The relevant technical owner confirms every official-documentation claim
      against the project version and implementation boundary.
- [ ] Entries 13, 18, 19, and 22 receive a final dated listing recheck.
- [ ] ISO full-text or abstract-only treatment is resolved for entries 5-10.
- [ ] The approved thesis scope and completed chapters introduce no unsupported
      claim requiring an additional source.
- [ ] Unused entries are removed and the bibliography is renumbered if the set
      changes.
- [ ] The numeric citation audit passes after the final rebuild.
- [ ] All authors and the supervisor approve the retained source set.
