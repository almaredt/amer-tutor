// Grade 11 (DP year 1), Uptown International School, Term 1 2026-27.
// Source: "Grade 11 Term 1 Curriculum Outline Plans" (school email, 17 Sep 2026) and Grade 11 announcements.
// Units and topics only, in the school's order. Each student's weekly plan is built from their own subjects
// and levels (see makeDynamicCourse in ../plan.js). Language subjects without units here are skipped for now.

const U = (t, topics) => ({ t, topics });

const MAA1 = U('Sequences and series', ['Arithmetic sequences and series, sigma notation, simple interest', 'Geometric sequences and series, compound interest and depreciation', 'Sum to infinity of a convergent geometric series', 'Binomial theorem, Pascal\'s triangle and nCr, term independent of x']);
const MAA2 = U('Algebra and functions 1', ['Equations of straight lines, gradient, parallel and perpendicular lines', 'Functions: domain, range, notation, graphs and GDC', 'Composite functions and their domain', 'Inverse functions, reflection in y = x, self-inverse and reciprocal functions', 'Transformations of graphs: translations, reflections and stretches']);

module.exports = {
  id: 'uptown-g11-2026t1',
  title: 'Grade 11 DP · Term 1 2026-27',
  school: 'Uptown International School',
  programme: 'DP',
  grade: 11,
  dynamic: true,
  termStart: '2026-10-11', // first week of this plan (Sunday)
  teachStart: '2026-08-24', // first teaching week of Term 1
  teachWeeks: 14.5, // teaching weeks in Term 1 (24 Aug – 10 Dec, minus the 12–16 Oct break)
  holidayWeeks: [0],
  holidayNote: 'School holiday (12–16 Oct). Use it to catch up on this topic and get ahead.',
  weeks: [
    { d: '11–15 Oct · holiday' }, { d: '18–22 Oct' }, { d: '25–29 Oct' }, { d: '1–5 Nov' }, { d: '8–12 Nov' },
    { d: '15–19 Nov' }, { d: '22–26 Nov' }, { d: '29 Nov–3 Dec' }, { d: '6–10 Dec' },
  ],
  // [date, what, subject (profile name) or empty for everyone]
  tests: [
    ['2026-11-23', 'Psychology summative (week of 23 Nov)', 'Psychology'],
  ],
  subjects: {
    'Mathematics: analysis and approaches': { code: 'MA', short: 'Math AA', color: 'Math', units: {
      SL: [MAA1, MAA2],
      HL: [U('Sequences and series', [...MAA1.topics, 'Counting principles, permutations and combinations']), MAA2,
        U('Polynomials, functions, equations and inequalities', ['Quadratic functions: forms, graph features, discriminant', 'Polynomial functions, factor and remainder theorems', 'Rational functions and their graphs', 'Solving equations and inequalities analytically and with technology', 'Partial fractions'])],
    } },
    'Mathematics: applications and interpretation': { code: 'MI', short: 'Math AI', color: 'Math', units: {
      SL: [U('Sequences and series', ['Arithmetic sequences and series, sigma notation, simple interest', 'Geometric sequences and series, compound interest and depreciation', 'Approximation, bounds, percentage error, standard form']),
        U('Descriptive statistics', ['Populations, sampling methods and bias', 'Discrete and continuous data, histograms, box plots, cumulative frequency', 'Mean, median, mode, range, IQR, standard deviation, skewness', 'Scatter graphs, correlation and Pearson\'s r', 'Line of best fit, regression line and predictions'])],
    } },
    Physics: { code: 'PH', short: 'Physics', color: 'Physics', units: {
      SL: [U('Measurements in physics', ['SI and derived units, metric multipliers', 'Significant figures and orders of magnitude', 'Uncertainties and error bars', 'Graphical analysis and gradients']),
        U('Space, time and motion', ['A1 Kinematics: motion graphs and suvat equations', 'A1 Projectile motion', 'A2 Forces, free-body diagrams and Newton\'s laws', 'A2 Momentum and impulse', 'A3 Work, energy and power'])],
      HL: [U('Measurements in physics', ['SI and derived units, metric multipliers', 'Significant figures and orders of magnitude', 'Uncertainties and error bars', 'Graphical analysis and gradients']),
        U('Space, time and motion', ['A1 Kinematics: motion graphs and suvat equations', 'A1 Projectile motion', 'A2 Forces, free-body diagrams and Newton\'s laws', 'A2 Momentum and impulse', 'A3 Work, energy and power', 'A4 Rigid body mechanics: torque and rotation', 'A5 Galilean and special relativity'])],
    } },
    Chemistry: { code: 'CH', short: 'Chemistry', color: 'Chemistry', units: {
      SL: [U('Structure 1: particulate nature of matter', ['S1.1 Particulate nature of matter, states and changes of state', 'S1.2 The nuclear atom and isotopes', 'S1.3 Electron configurations and emission spectra', 'S1.4 Counting particles by mass: the mole', 'S1.5 Ideal gases']),
        U('Structure 3.1: the periodic table', ['Periodic table, periodicity and trends', 'Classification of elements']),
        U('Structure 2: models of bonding', ['S2.1 The ionic model', 'S2.2 The covalent model: Lewis structures, VSEPR, polarity', 'S2.2 Intermolecular forces', 'S2.3 The metallic model'])],
      HL: [U('Structure 1: particulate nature of matter', ['S1.1 Particulate nature of matter, states and changes of state', 'S1.2 The nuclear atom and isotopes', 'S1.3 Electron configurations, ionization energies and emission spectra', 'S1.4 Counting particles by mass: the mole', 'S1.5 Ideal gases']),
        U('Structure 3.1: the periodic table', ['Periodic table, periodicity and trends', 'Transition elements and classification of elements']),
        U('Structure 2: models of bonding', ['S2.1 The ionic model', 'S2.2 The covalent model: Lewis structures, VSEPR, polarity', 'S2.2 Hybridization, formal charge and resonance', 'S2.2 Intermolecular forces', 'S2.3 The metallic model'])],
    } },
    Biology: { code: 'BI', short: 'Biology', color: 'Chemistry', units: {
      SL: [U('Theme A: unity and diversity', ['A1.1 Water', 'A1.2 Nucleic acids', 'A2.2 Cell structure', 'A3.1 Diversity of organisms', 'A3.2 Classification and cladistics', 'A4.1 Evolution and speciation', 'A4.2 Conservation of biodiversity']),
        U('Theme B: form and function', ['B1.1 Carbohydrates and lipids'])],
      HL: [U('Theme A: unity and diversity', ['A1.1 Water', 'A1.2 Nucleic acids', 'A2.1 Origins of cells', 'A2.2 Cell structure', 'A2.3 Viruses', 'A3.1 Diversity of organisms', 'A3.2 Classification and cladistics', 'A4.1 Evolution and speciation', 'A4.2 Conservation of biodiversity']),
        U('Theme B: form and function', ['B1.1 Carbohydrates and lipids'])],
    } },
    'Environmental systems and societies': { code: 'ES', short: 'ESS', color: 'Chemistry', units: {
      SL: [U('Foundation', ['1.1 Perspectives and environmental value systems', '1.2 Systems', '1.3 Sustainability']),
        U('Ecology', ['2.1 Individuals, populations, communities and ecosystems', '2.2 Energy and biomass', '2.3 Biogeochemical cycles', '2.4 Climate and biomes'])],
    } },
    Economics: { code: 'EC', short: 'Economics', color: 'Other', units: {
      SL: [U('What is economics?', ['Economics as a social science; scarcity, choice and sustainability', 'Production possibilities curve', 'Circular flow of income model', 'Economic methodology and economic thought']),
        U('Microeconomics', ['Demand and its determinants', 'Supply and its determinants', 'Competitive market equilibrium, price mechanism, allocative efficiency', 'Critique of the maximising behaviour of consumers and producers', 'Price and income elasticity of demand (PED, YED)', 'Price elasticity of supply (PES)'])],
      HL: [U('What is economics?', ['Economics as a social science; scarcity, choice and sustainability', 'Production possibilities curve', 'Circular flow of income model', 'Economic methodology and economic thought']),
        U('Microeconomics', ['Demand and its determinants', 'Supply and its determinants', 'Competitive market equilibrium, price mechanism, allocative efficiency', 'Behavioural economics: choice architecture and nudge theory; business objectives', 'Price and income elasticity of demand, PED for manufactured products', 'Price elasticity of supply, PES for manufactured products'])],
    } },
    'Business management': { code: 'BM', short: 'Business', color: 'Other', units: {
      SL: [U('Introduction to business management', ['1.1 What is a business', '1.2 Types of business entities', '1.3 Business objectives, vision and mission', '1.4 Stakeholders', '1.5 Growth and evolution', '1.6 Multinational companies; STEEPLE analysis'])],
    } },
    'English A: Language and literature': { code: 'EA', short: 'English A', color: 'English', units: {
      SL: [U('Texts, conflict and Paper 1', ['Paper 1 textual analysis of non-literary texts', 'Kate Chopin\'s short stories: societal expectations', 'War poetry (Owen, Duffy): imagery and language', 'Intertextual connections and preparing for the Individual Oral'])],
    } },
    Psychology: { code: 'PS', short: 'Psychology', color: 'Other', units: {
      SL: [U('Research methods and concepts', ['Key concepts: bias, causality, change, measurement, perspective, responsibility', 'Research methods: experiments, observations, surveys, interviews, correlational and case studies', 'Sampling, data analysis and research considerations']),
        U('Learning and cognition', ['Cognitive biases, dual processing model and schema theory', 'Classical and operant conditioning; social learning theory', 'Cognitive processes: models, biological, cultural and environmental factors'])],
    } },
    Geography: { code: 'GE', short: 'Geography', color: 'Other', units: {
      SL: [U('Changing populations', ['Population distribution and economic development', 'Demographic change: fertility, life expectancy, dependency ratios', 'Migration, core-periphery patterns and megacities', 'Forced migration and population policies']),
        U('Option D: geophysical hazards', ['Geophysical systems', 'Geophysical hazard risks', 'Hazard risk and vulnerability', 'Future resilience and adaptation'])],
    } },
    History: { code: 'HI', short: 'History', color: 'Other', units: {
      SL: [U('Authoritarian states (Paper 2)', ['Emergence of authoritarian states', 'Consolidation and maintenance of power', 'Treatment of people under authoritarian rule', 'Challenges to authoritarian rule']),
        U('The move to global war (Paper 1)', ['Japanese expansion in East Asia (1931–1941)', 'German and Italian expansion (1933–1940)'])],
    } },
    'Global politics': { code: 'GP', short: 'Global politics', color: 'Other', units: {
      SL: [U('Power and sovereignty', ['Power, sovereignty, legitimacy and interdependence', 'Realism, liberalism, constructivism and cosmopolitanism', 'State and non-state actors', 'Security, conflict, identity and borders; case studies'])],
    } },
  },
};
