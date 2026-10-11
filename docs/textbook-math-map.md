# Math textbook map

**Book:** Haese & Harris, *Mathematics for the International Student 9 (MYP 4)*, 1st edition 2008 (ISBN 978-1-876543-29-7). 576 pages. The printed page numbers are the same as the PDF page numbers.

This file only holds chapter, section and page pointers. Do not copy the book's exercises, examples or text into the app. Claude-written questions are original and use the book's wording (see `MATH_STYLE` in `src/ai.js`).

## School Term 1 topics → book

| Set | School topic | Book sections (pages) | Gap |
|---|---|---|---|
| M8 | Sequences | 13D Formulae by induction (298–300); 22C–D Growth and decay (440–443) | Arithmetic and geometric sequences are not in the book |
| M9 | Series | none | Not in the book |
| M1 | Direct and inverse proportion, k | 13A–B Substituting and rearranging formulae (290–294) | Ch 26 Variation is on the CD only |
| M2 | Proportion graphs and tables | 6C Gradient (124–127); 22E y = k/x (444–446) | |
| M3 | Factorising, a = 1, DOTS | 3E–F (78–81); 8A–E (178–185); 16A–C Null Factor law (341–345) | |
| M4 | Factorising, a ≠ 1 | 8F–G (186–190); Review sets 8A/8B (191) | |
| M5 | Quadratic formula and discriminant | 4A–D Radicals (88–98); 16D Completing the square (346–348); Investigation: the quadratic formula (348); Review 16A/B (351–352) | The discriminant appears only as a question in the investigation |
| M6 | Vertex form, axis, three forms | 19A–F (384–398) | Finding a quadratic from three points is not in the book |
| M7 | Optimisation and modelling | 19G Max/min (399–400); 16E Problem solving (349–350); Review 19A/B (401–402); 22F (447–448, extension) | |

## Whole book (chapter: first page)

1 Algebra: notation and equations (29) · 2 Indices (51) · 3 Algebraic expansion and simplification (71) · 4 Radicals/surds (87) · 5 Sets and Venn diagrams (101) · 6 Coordinate geometry (117) · 7 Mensuration (145) · 8 Quadratic factorisation (177) · 9 Statistics (193) · 10 Probability (219) · 11 Financial mathematics (241) · 12 Trigonometry (267) · 13 Formulae (289) · 14 Comparing numerical data (303) · 15 Transformation geometry (315) · 16 Quadratic equations (339) · 17 Simultaneous equations (353) · 18 Matrices (367) · 19 Quadratic functions (383) · 20 Tree diagrams and binomial probabilities (403) · 21 Algebraic fractions (419) · 22 Other functions: exponential, rational (435) · 23 Vectors (453) · 24 Deductive geometry (473) · 25 Non-right angled triangle trigonometry (501) · 26 Variation, 27 Two variable analysis, 28 Logic (CD only) · Answers (523) · Index (573)

Every chapter ends with Review sets A and B. Many chapters have an "Investigation" box, which suits MYP Criterion B (investigating patterns).

## Where the app uses it

- `public/learn.js` `BOOK`: an "In your textbook" box on each Math Learn topic, and a collapsed one on Math session cards (`sets` now comes with each plan day).
- `src/ai.js` `MATH_STYLE`: Claude uses the book's terms ("Null Factor law", "simplest radical form", "axis of symmetry x = h", vertex form) in new Math questions.
- Term 2 candidates once the school publishes the outline: trigonometry (12, 25), simultaneous equations (17), probability (10, 20), statistics (9, 14), coordinate geometry (6), vectors (23), exponential functions (22), deductive geometry (24).
