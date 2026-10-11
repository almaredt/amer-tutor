// Grade 12 (DP year 2), Term 1 2026-27.
// No school outline for Grade 12 yet: units follow the usual second-year order of each DP subject
// (the topics not normally taught in year 1). Replace with the school's order when its outline arrives.
// Each student's weekly plan is built from their own subjects and levels (see makeDynamicCourse in ../plan.js).

const U = (t, topics) => ({ t, topics });

const MAA = [
  U('Differential calculus', ['Limits and the derivative as a gradient', 'Derivatives of xⁿ, eˣ, ln x, sin x, cos x', 'Chain, product and quotient rules', 'Tangents and normals', 'Stationary points, concavity and optimisation']),
  U('Integral calculus', ['Anti-differentiation and boundary conditions', 'Definite integrals', 'Areas under and between curves', 'Kinematics: displacement, velocity, acceleration']),
  U('Probability distributions', ['Discrete random variables and expected value', 'The binomial distribution', 'The normal distribution and standardisation']),
];
const MAA_HL = [
  U('Differential calculus', [...MAA[0].topics, 'Implicit differentiation and related rates', 'Derivatives of tan x, inverse trigonometric functions']),
  U('Integral calculus', [...MAA[1].topics, 'Integration by substitution and by parts', 'Volumes of revolution']),
  U('Probability distributions', [...MAA[2].topics, 'Continuous random variables and Bayes\' theorem']),
];

module.exports = {
  id: 'uptown-g12-2026t1',
  title: 'Grade 12 DP · Term 1 2026-27',
  school: 'Uptown International School',
  programme: 'DP',
  grade: 12,
  dynamic: true,
  termStart: '2026-10-11', // first week of this plan (Sunday)
  teachStart: '2026-08-24', // first teaching week of Term 1
  teachWeeks: 14.5,
  holidayWeeks: [0],
  holidayNote: 'School holiday (12–16 Oct). Use it to catch up on this topic and get ahead.',
  weeks: [
    { d: '11–15 Oct · holiday' }, { d: '18–22 Oct' }, { d: '25–29 Oct' }, { d: '1–5 Nov' }, { d: '8–12 Nov' },
    { d: '15–19 Nov' }, { d: '22–26 Nov' }, { d: '29 Nov–3 Dec' }, { d: '6–10 Dec' },
  ],
  tests: [], // [date, what, subject (profile name)] — add when the school announces them
  subjects: {
    'Mathematics: analysis and approaches': { code: 'MA', short: 'Math AA', color: 'Math', units: { SL: MAA, HL: MAA_HL } },
    'Mathematics: applications and interpretation': { code: 'MI', short: 'Math AI', color: 'Math', units: {
      SL: [U('Probability distributions', ['Probability, Venn and tree diagrams', 'Discrete random variables and expected value', 'The binomial distribution', 'The normal distribution']),
        U('Statistical tests', ['Hypotheses, significance level and p-values', 'χ² test for independence', 'χ² goodness of fit test', 'Spearman\'s rank correlation']),
        U('Introductory calculus', ['The derivative as a gradient and rate of change', 'Differentiating polynomials; tangents and normals', 'Increasing and decreasing functions; optimisation', 'Integration of polynomials and areas', 'Trapezoidal rule'])],
    } },
    Physics: { code: 'PH', short: 'Physics', color: 'Physics', units: {
      SL: [U('Theme B: the particulate nature of matter', ['B1 Thermal energy transfers: specific heat and latent heat', 'B1 Conduction, convection and radiation; Stefan–Boltzmann and Wien', 'B2 Greenhouse effect: albedo and energy balance', 'B3 Gas laws and the kinetic model', 'B5 Current and circuits']),
        U('Theme C: wave behaviour', ['C1 Simple harmonic motion', 'C2 Wave model: v = fλ, transverse and longitudinal', 'C3 Wave phenomena: reflection, refraction, diffraction, interference', 'C4 Standing waves and resonance', 'C5 Doppler effect']),
        U('Theme D: fields', ['D1 Gravitational fields and orbits', 'D2 Electric and magnetic fields', 'D3 Motion in electromagnetic fields'])],
      HL: [U('Theme B: the particulate nature of matter', ['B1 Thermal energy transfers: specific heat and latent heat', 'B1 Conduction, convection and radiation; Stefan–Boltzmann and Wien', 'B2 Greenhouse effect: albedo and energy balance', 'B3 Gas laws and the kinetic model', 'B4 Thermodynamics: first law, entropy, heat engines', 'B5 Current and circuits']),
        U('Theme C: wave behaviour', ['C1 Simple harmonic motion (including energy and phase)', 'C2 Wave model: v = fλ, transverse and longitudinal', 'C3 Wave phenomena: interference, single and multiple slits', 'C4 Standing waves and resonance', 'C5 Doppler effect']),
        U('Theme D: fields', ['D1 Gravitational fields, potential and orbits', 'D2 Electric and magnetic fields, potential', 'D3 Motion in electromagnetic fields', 'D4 Induction'])],
    } },
    Chemistry: { code: 'CH', short: 'Chemistry', color: 'Chemistry', units: {
      SL: [U('Reactivity 1: energetics', ['R1.1 Measuring enthalpy changes: calorimetry', 'R1.2 Energy cycles: Hess\'s law and bond enthalpies', 'R1.3 Energy from fuels']),
        U('Reactivity 2: how much, how fast, how far', ['R2.1 Amounts: stoichiometry, limiting reactant, yield', 'R2.2 Rates: collision theory, activation energy, catalysts', 'R2.3 Equilibrium: K, Q and Le Châtelier']),
        U('Reactivity 3: mechanisms of change', ['R3.1 Proton transfer: Brønsted–Lowry acids and bases, pH', 'R3.2 Electron transfer: oxidation states, redox, cells', 'R3.3 and R3.4 Organic reaction types'])],
      HL: [U('Reactivity 1: energetics', ['R1.1 Measuring enthalpy changes: calorimetry', 'R1.2 Energy cycles: Hess\'s law, bond enthalpies, Born–Haber', 'R1.3 Energy from fuels', 'R1.4 Entropy and spontaneity: ΔG']),
        U('Reactivity 2: how much, how fast, how far', ['R2.1 Amounts: stoichiometry, limiting reactant, yield', 'R2.2 Rates: rate equations, orders, Arrhenius', 'R2.3 Equilibrium: K, Q, Le Châtelier and ΔG']),
        U('Reactivity 3: mechanisms of change', ['R3.1 Proton transfer: pH, pOH, Ka, Kb and buffers', 'R3.2 Electron transfer: redox, cells, standard electrode potentials', 'R3.3 and R3.4 Organic mechanisms: SN1, SN2, electrophilic addition'])],
    } },
    Biology: { code: 'BI', short: 'Biology', color: 'Chemistry', units: {
      SL: [U('Theme C: interaction and interdependence', ['C1.1 Enzymes and metabolism', 'C1.2 Cell respiration', 'C1.3 Photosynthesis', 'C2.1 Chemical signalling', 'C2.2 Neural signalling', 'C3.1 Integration of body systems', 'C4.1 Populations and communities']),
        U('Theme D: continuity and change', ['D1.1 DNA replication', 'D1.2 Protein synthesis', 'D2.1 Cell and nuclear division', 'D3.2 Inheritance', 'D4.1 Natural selection', 'D3.3 and D4.3 Homeostasis and climate change'])],
    } },
    Economics: { code: 'EC', short: 'Economics', color: 'Other', units: {
      SL: [U('Macroeconomics', ['Measuring economic activity: GDP', 'Aggregate demand and aggregate supply', 'Macroeconomic objectives: growth, unemployment, inflation', 'Fiscal, monetary and supply-side policies']),
        U('The global economy', ['Benefits of international trade', 'Types of trade protection', 'Exchange rates', 'Economic development'])],
    } },
    'Business management': { code: 'BM', short: 'Business', color: 'Other', units: {
      SL: [U('Finance and accounts', ['Sources of finance', 'Costs and revenues; break-even', 'Final accounts', 'Profitability and liquidity ratios', 'Cash flow and investment appraisal']),
        U('Marketing and operations', ['Marketing planning and the 4 Ps', 'Market research and sales forecasting', 'Operations methods and lean production', 'Location and production planning'])],
    } },
    Psychology: { code: 'PS', short: 'Psychology', color: 'Other', units: {
      SL: [U('Human relationships and health', ['Personal and group relationships', 'Social influence', 'Health and wellbeing: determinants and promotion']),
        U('Research and exam skills', ['Evaluating studies', 'Paper 3: research methods questions', 'Writing extended responses'])],
    } },
    'English A: Language and literature': { code: 'EA', short: 'English A', color: 'English', units: {
      SL: [U('Paper 1 and Paper 2 preparation', ['Paper 1: guided analysis of non-literary texts', 'Paper 2: comparative essay on two literary works', 'Individual oral: global issue, extracts and structure'])],
    } },
  },
};
