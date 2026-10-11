// Grade 12 DP Chemistry. Original questions; numbers checked by calculation
// (c of water = 4.18 J g⁻¹ K⁻¹; bond enthalpies: C–H 414, O=O 498, C=O 804, O–H 463 kJ mol⁻¹).
module.exports = {
  course: 'uptown-g12-2026t1',
  subject: 'Chemistry',
  units: {
    // Unit 1: Reactivity 1, energetics
    1: {
      m: [
        ['An exothermic reaction has', ['ΔH > 0 and the surroundings cool', 'ΔH < 0 and the surroundings warm up', 'ΔH = 0', 'ΔH < 0 and the surroundings cool'], 1, 'Energy is released to the surroundings.'],
        ['In an energy profile for an exothermic reaction, the products are', ['higher than the reactants', 'lower than the reactants', 'at the same level as the reactants', 'at the top of the curve'], 1, 'They have less enthalpy than the reactants.'],
        ['50.0 g of water warms by 6.0 °C. How much energy did it absorb?', ['1254 J', '300 J', '209 J', '12.5 kJ'], 0, 'q = mcΔT = 50.0 × 4.18 × 6.0.'],
        ['Bond breaking is', ['exothermic', 'endothermic', 'neither', 'exothermic for double bonds only'], 1, 'Energy must be supplied to break a bond.'],
        ['Hess\'s law says that the enthalpy change of a reaction', ['depends on the route taken', 'is independent of the route, if start and end are the same', 'is always negative', 'equals the activation energy'], 1, 'Enthalpy is a state function.'],
        ['ΔH for A → B is −50 kJ and for B → C is +20 kJ. Find ΔH for A → C.', ['−70 kJ', '−30 kJ', '+30 kJ', '+70 kJ'], 1, '−50 + 20 = −30 kJ.'],
        ['If ΔH for X → Y is +80 kJ mol⁻¹, ΔH for Y → X is', ['+80', '−80', '0', '+160'], 1, 'Reversing a reaction changes the sign of ΔH.'],
        ['Why are calorimetry results for ΔH often less exothermic than data-book values?', ['Too much fuel is used', 'Heat is lost to the surroundings', 'The thermometer is too accurate', 'The water is too pure'], 1, 'Some of the energy released does not warm the water.'],
        ['Standard conditions for enthalpy data are', ['0 °C and 100 kPa', '298 K and 100 kPa', '273 K and 1 atm', '25 K and 1 kPa'], 1, '25 °C (298 K) and 100 kPa.'],
        ['Average bond enthalpies give less accurate ΔH values because', ['bonds have the same strength everywhere', 'they are averages over many compounds and assume gaseous states', 'they include activation energy', 'they are measured in solution'], 1, 'The real bond strength depends on its environment.'],
        ['Which fuel releases the most CO₂ per unit energy?', ['Hydrogen', 'Methane', 'Coal', 'They are equal'], 2, 'Coal is mostly carbon, so more CO₂ for each kJ.'],
        ['The standard enthalpy of combustion is measured for', ['1 mol of oxygen', '1 mol of the substance burned completely', '1 g of the substance', '1 mol of the products'], 1, 'Complete combustion of one mole of the substance.'],
      ],
      w: [
        ['0.025 mol of a salt is dissolved in 50.0 g of water and the temperature rises by 6.0 °C.\n(a) Calculate the heat released.\n(b) Calculate the enthalpy change of solution in kJ mol⁻¹.\n(c) State one assumption made.', ['M1 q = 50.0 × 4.18 × 6.0', 'A1 1254 J', 'M1 ΔH = −1.254 kJ / 0.025 mol', 'A1 −50.2 kJ mol⁻¹ (negative sign required)', 'R1 the solution has the specific heat capacity of water / no heat loss']],
        ['Use average bond enthalpies (C–H 414, O=O 498, C=O 804, O–H 463 kJ mol⁻¹) to calculate ΔH for:\nCH₄(g) + 2O₂(g) → CO₂(g) + 2H₂O(g)', ['M1 bonds broken: 4 × 414 + 2 × 498 = 2652', 'M1 bonds formed: 2 × 804 + 4 × 463 = 3460', 'M1 ΔH = broken − formed', 'A1 −808 kJ mol⁻¹']],
        ['Given:\nC(s) + O₂(g) → CO₂(g)   ΔH = −394 kJ mol⁻¹\nCO(g) + ½O₂(g) → CO₂(g)   ΔH = −283 kJ mol⁻¹\nUse Hess\'s law to find ΔH for C(s) + ½O₂(g) → CO(g).', ['M1 reverse the second equation (+283)', 'M1 add it to the first', 'A1 −111 kJ mol⁻¹']],
      ],
    },
    // Unit 2: Reactivity 2, how much, how fast, how far
    2: {
      m: [
        ['A catalyst increases the rate of reaction by', ['raising the temperature', 'providing a route with a lower activation energy', 'increasing the concentration', 'shifting the equilibrium to the right'], 1, 'More particles have enough energy to react.'],
        ['Increasing temperature increases rate mainly because', ['particles get bigger', 'a larger fraction of collisions have energy ≥ Ea', 'Ea decreases', 'there are more particles'], 1, 'The Maxwell–Boltzmann distribution shifts to higher energies.'],
        ['Powdered marble reacts faster with acid than lumps because', ['it has a larger surface area, so more frequent collisions', 'it has a lower Ea', 'it is more concentrated', 'it is a catalyst'], 0, 'More particles are exposed to the acid.'],
        ['For N₂ + 3H₂ ⇌ 2NH₃ (ΔH < 0), increasing the pressure', ['shifts the equilibrium to the left', 'shifts the equilibrium to the right', 'has no effect', 'changes K'], 1, 'The right side has fewer gas moles (2 vs 4).'],
        ['For the same reaction, increasing the temperature', ['increases the yield of NH₃ and K', 'decreases the yield of NH₃ and K', 'has no effect on K', 'increases K only'], 1, 'The reverse (endothermic) reaction is favoured, and K falls.'],
        ['Adding a catalyst to a system at equilibrium', ['increases the yield', 'decreases the yield', 'does not change the position, but equilibrium is reached faster', 'changes K'], 2, 'It speeds up both forward and reverse reactions equally.'],
        ['Write the equilibrium constant expression for H₂(g) + I₂(g) ⇌ 2HI(g).', ['[HI]/([H₂][I₂])', '[HI]²/([H₂][I₂])', '[H₂][I₂]/[HI]²', '2[HI]/([H₂][I₂])'], 1, 'Products over reactants, each raised to its coefficient.'],
        ['If Q < K, the reaction', ['is at equilibrium', 'moves forward to make more products', 'moves backward', 'stops'], 1, 'There are too few products compared with equilibrium.'],
        ['A very large K (e.g. 10¹⁰) means', ['the reaction is fast', 'at equilibrium, products are strongly favoured', 'reactants are favoured', 'the reaction is endothermic'], 1, 'K tells you about position, not speed.'],
        ['4.0 g of H₂ reacts with 32 g of O₂ to make water. Which is the limiting reactant?', ['H₂', 'O₂', 'Neither: they are in the exact ratio', 'Water'], 2, '2 mol H₂ needs 1 mol O₂; 32 g O₂ is exactly 1 mol.'],
        ['The theoretical yield is 20 g and 15 g is obtained. The percentage yield is', ['75%', '133%', '25%', '15%'], 0, '15/20 × 100.'],
        ['Rate of reaction can be measured by', ['the volume of gas produced per unit time', 'the total mass of products', 'the colour of the catalyst', 'the value of K'], 0, 'Any property that changes with time, divided by time.'],
      ],
      w: [
        ['Consider 2SO₂(g) + O₂(g) ⇌ 2SO₃(g), ΔH = −198 kJ mol⁻¹.\n(a) Write the expression for K.\n(b) Predict and explain the effect on the yield of SO₃ of (i) increasing pressure (ii) increasing temperature.\n(c) Explain why a compromise temperature is used in industry.', ['A1 K = [SO₃]²/([SO₂]²[O₂])', 'R1 higher pressure: shifts right, fewer gas moles (2 vs 3)', 'R1 higher temperature: shifts left, the forward reaction is exothermic', 'R1 low temperature gives high yield but a slow rate; a compromise gives a reasonable yield quickly']],
        ['Sketch a Maxwell–Boltzmann distribution and use it to explain how (a) a temperature rise and (b) a catalyst increase the rate of reaction.', ['A1 axes: number of particles vs kinetic energy, curve from the origin, not touching the x-axis at high energy', 'R1 at higher T the curve shifts right and flattens', 'R1 more particles have energy ≥ Ea', 'R1 a catalyst lowers Ea, so a larger area of the curve lies beyond it']],
        ['6.0 g of magnesium reacts with 0.40 mol of hydrochloric acid: Mg + 2HCl → MgCl₂ + H₂.\n(a) Determine the limiting reactant.\n(b) Calculate the mass of MgCl₂ formed. (Mᵣ = 95.21)', ['M1 n(Mg) = 6.0/24.31 = 0.247 mol', 'M1 0.247 mol Mg needs 0.494 mol HCl; only 0.40 mol available', 'A1 HCl is limiting', 'A1 0.20 mol MgCl₂ = 19 g']],
      ],
    },
    // Unit 3: Reactivity 3, proton and electron transfer
    3: {
      m: [
        ['A Brønsted–Lowry acid is a', ['proton acceptor', 'proton donor', 'electron pair donor', 'hydroxide donor'], 1, 'It donates H⁺.'],
        ['What is the conjugate base of H₂SO₄?', ['SO₄²⁻', 'HSO₄⁻', 'H₃SO₄⁺', 'H₂O'], 1, 'Remove one H⁺.'],
        ['What is the pH of 0.010 mol dm⁻³ HCl?', ['1', '2', '0.01', '12'], 1, 'Strong acid: [H⁺] = 10⁻², so pH = 2.'],
        ['The pH of a solution increases by 1. The [H⁺]', ['increases 10 times', 'decreases 10 times', 'decreases by 1', 'doubles'], 1, 'pH is a log scale: pH = −log[H⁺].'],
        ['Why does 0.1 mol dm⁻³ ethanoic acid have a higher pH than 0.1 mol dm⁻³ HCl?', ['It is more concentrated', 'It only partly dissociates', 'It is a base', 'It has more H atoms'], 1, 'A weak acid releases fewer H⁺ ions.'],
        ['What are the products of HCl + NaOH?', ['NaCl + H₂', 'NaCl + H₂O', 'NaH + HClO', 'Na₂O + HCl'], 1, 'Acid + base → salt + water.'],
        ['What is the oxidation state of Mn in KMnO₄?', ['+2', '+4', '+7', '+6'], 2, '+1 + Mn + 4(−2) = 0.'],
        ['What is the oxidation state of Cr in Cr₂O₇²⁻?', ['+3', '+6', '+7', '+12'], 1, '2Cr + 7(−2) = −2, so Cr = +6.'],
        ['Oxidation is', ['gain of electrons', 'loss of electrons', 'gain of hydrogen', 'decrease in oxidation state'], 1, 'OIL RIG: oxidation is loss.'],
        ['In Zn + Cu²⁺ → Zn²⁺ + Cu, the oxidizing agent is', ['Zn', 'Cu²⁺', 'Zn²⁺', 'Cu'], 1, 'Cu²⁺ is reduced, so it oxidizes zinc.'],
        ['In a voltaic (galvanic) cell, oxidation occurs at the', ['cathode', 'anode', 'salt bridge', 'voltmeter'], 1, 'An Ox, Red Cat.'],
        ['In electrolysis of molten NaCl, what forms at the cathode?', ['Cl₂', 'Na', 'O₂', 'H₂'], 1, 'Na⁺ gains electrons at the negative electrode.'],
        ['A titration: 20.0 cm³ of 0.100 mol dm⁻³ HCl neutralises 25.0 cm³ of NaOH. Find [NaOH].', ['0.125 mol dm⁻³', '0.080 mol dm⁻³', '0.100 mol dm⁻³', '0.0020 mol dm⁻³'], 1, 'n(HCl) = 0.00200 mol = n(NaOH); 0.00200/0.0250.'],
      ],
      w: [
        ['25.0 cm³ of sodium hydroxide is titrated with 0.100 mol dm⁻³ hydrochloric acid; 20.0 cm³ of acid is needed.\n(a) Write the equation.\n(b) Calculate the concentration of the NaOH.\n(c) Calculate the pH of the NaOH solution.', ['A1 NaOH + HCl → NaCl + H₂O', 'M1 n(HCl) = 0.100 × 0.0200 = 2.00 × 10⁻³ mol', 'A1 [NaOH] = 0.0800 mol dm⁻³', 'M1 pOH = −log 0.0800 = 1.10', 'A1 pH = 12.9']],
        ['Iron reacts with copper(II) sulfate solution: Fe + Cu²⁺ → Fe²⁺ + Cu.\n(a) Write the two half-equations.\n(b) Identify the species oxidized and the oxidizing agent.\n(c) State what is observed.', ['A1 Fe → Fe²⁺ + 2e⁻', 'A1 Cu²⁺ + 2e⁻ → Cu', 'A1 Fe is oxidized; Cu²⁺ is the oxidizing agent', 'A1 pink/brown copper forms; blue colour fades (to pale green)']],
        ['Distinguish between a strong acid and a weak acid, and describe two experiments that could tell them apart at the same concentration.', ['A1 strong acid fully dissociates; weak acid partly dissociates', 'R1 measure pH: the weak acid has a higher pH', 'R1 conductivity: the weak acid conducts less', 'R1 react with Mg or CaCO₃: the weak acid reacts more slowly']],
      ],
    },
  },
};
