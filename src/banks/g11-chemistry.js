// Grade 11 DP Chemistry. Original questions; numerical answers checked by calculation
// (molar volume of an ideal gas at STP = 22.7 dm³ mol⁻¹, R = 8.31 J K⁻¹ mol⁻¹, as in the DP data booklet).
module.exports = {
  course: 'uptown-g11-2026t1',
  subject: 'Chemistry',
  units: {
    // Unit 1: Structure 1, particulate nature of matter
    1: {
      m: [
        ['Which change of state is sublimation?', ['Liquid to gas', 'Solid to gas', 'Gas to liquid', 'Solid to liquid'], 1, 'Sublimation goes directly from solid to gas (e.g. solid CO₂, iodine).'],
        ['During melting, the temperature of a pure solid stays constant because', ['no energy is absorbed', 'the energy absorbed weakens the forces between particles', 'the particles stop moving', 'the mass decreases'], 1, 'Energy goes into overcoming intermolecular forces, not into raising kinetic energy.'],
        ['How many neutrons are in an atom of ³⁷Cl?', ['17', '37', '20', '54'], 2, 'Neutrons = mass number − atomic number = 37 − 17 = 20.'],
        ['How many electrons are in an Al³⁺ ion?', ['13', '10', '16', '3'], 1, 'Al has 13 electrons; losing 3 leaves 10.'],
        ['Isotopes of an element have', ['the same number of neutrons', 'different chemical properties', 'the same number of protons but different numbers of neutrons', 'different numbers of electrons in the neutral atom'], 2, 'Same proton number, different mass numbers; chemical properties are almost identical.'],
        ['Magnesium is 79.0% ²⁴Mg, 10.0% ²⁵Mg and 11.0% ²⁶Mg. Find its relative atomic mass.', ['24.00', '25.00', '24.32', '24.50'], 2, '(24 × 79 + 25 × 10 + 26 × 11)/100 = 24.32.'],
        ['What is the full electron configuration of sulfur (Z = 16)?', ['1s² 2s² 2p⁶ 3s² 3p⁴', '1s² 2s² 2p⁶ 3s² 3p⁶', '1s² 2s² 2p⁸ 3s² 3p²', '1s² 2s² 2p⁶ 3p⁶'], 0, '2 + 2 + 6 + 2 + 4 = 16.'],
        ['What is the electron configuration of copper (Z = 29)?', ['[Ar] 3d⁹ 4s²', '[Ar] 3d¹⁰ 4s¹', '[Ar] 4s² 4p⁹', '[Ar] 3d¹⁰ 4s²'], 1, 'Copper is an exception: a full 3d sub-level is more stable.'],
        ['In the hydrogen emission spectrum, the lines in the visible region come from electrons falling to', ['n = 1', 'n = 2', 'n = 3', 'n = ∞'], 1, 'The Balmer series ends at n = 2. Transitions to n = 1 (Lyman) are in the UV.'],
        ['Why do the lines of an emission spectrum get closer together at higher frequency?', ['Electrons move faster', 'Energy levels get closer together further from the nucleus', 'The nucleus gets larger', 'Light slows down'], 1, 'Energy levels converge, so the energy differences between transitions converge too.'],
        ['What is the mass of 0.500 mol of CO₂? (Mᵣ = 44.01)', ['88.0 g', '22.0 g', '44.0 g', '11.0 g'], 1, 'm = n × M = 0.500 × 44.01 = 22.0 g.'],
        ['How many molecules are in 0.25 mol of water?', ['6.02 × 10²³', '1.505 × 10²³', '4.52 × 10²³', '2.41 × 10²⁴'], 1, '0.25 × 6.02 × 10²³ = 1.505 × 10²³.'],
        ['How many atoms are in 1.00 mol of H₂O?', ['6.02 × 10²³', '1.20 × 10²⁴', '1.81 × 10²⁴', '3.00'], 2, 'Each molecule has 3 atoms: 3 × 6.02 × 10²³ = 1.81 × 10²⁴.'],
        ['A compound is 40.0% C, 6.7% H and 53.3% O by mass. What is its empirical formula?', ['CHO', 'CH₂O', 'C₂H₄O', 'CH₃O'], 1, 'Moles: C 3.33, H 6.6, O 3.33. Ratio 1 : 2 : 1.'],
        ['The relative formula mass of Ca(OH)₂ is', ['57.1', '74.1', '58.1', '114.2'], 1, '40.08 + 2 × (16.00 + 1.01) = 74.1.'],
        ['What is the concentration of 0.250 mol of NaCl dissolved to make 500 cm³ of solution?', ['0.125 mol dm⁻³', '0.500 mol dm⁻³', '2.00 mol dm⁻³', '0.250 mol dm⁻³'], 1, 'c = n/V = 0.250/0.500 dm³ = 0.500 mol dm⁻³.'],
        ['A gas occupies 2.0 dm³ at 100 kPa. At constant temperature the pressure falls to 50 kPa. What is the new volume?', ['1.0 dm³', '4.0 dm³', '2.0 dm³', '0.5 dm³'], 1, 'Boyle\'s law: p₁V₁ = p₂V₂, so V₂ = 2.0 × 100/50 = 4.0 dm³.'],
        ['What volume does 0.100 mol of an ideal gas occupy at STP?', ['2.27 dm³', '22.7 dm³', '0.227 dm³', '2.24 cm³'], 0, '0.100 × 22.7 = 2.27 dm³.'],
        ['Real gases behave least like ideal gases at', ['high temperature and low pressure', 'low temperature and high pressure', 'room conditions', 'high temperature and high volume'], 1, 'Particles are close together and slow, so their own volume and the forces between them matter.'],
        ['To use pV = nRT in SI units, the volume must be in', ['dm³', 'cm³', 'm³', 'litres'], 2, 'With p in Pa and T in K, V is in m³ (1 dm³ = 10⁻³ m³).'],
      ],
      w: [
        ['4.80 g of magnesium reacts completely with excess hydrochloric acid:\nMg(s) + 2HCl(aq) → MgCl₂(aq) + H₂(g)\n(a) Calculate the amount (mol) of magnesium. (Aᵣ Mg = 24.31)\n(b) Calculate the volume of hydrogen produced at STP.\n(c) State one reason why the volume measured in a lab might be lower.', ['M1 n = 4.80 / 24.31', 'A1 0.197 mol', 'M1 1 : 1 ratio, so 0.197 mol H₂', 'A1 0.197 × 22.7 = 4.48 dm³', 'R1 gas escapes before the stopper is fitted / not at STP / some H₂ dissolves (any one)']],
        ['0.500 g of a gas occupies 250 cm³ at 300 K and 101 kPa.\n(a) Calculate the amount of gas, using pV = nRT.\n(b) Calculate its molar mass.', ['M1 converts units: V = 2.50 × 10⁻⁴ m³, p = 1.01 × 10⁵ Pa', 'M1 n = pV/RT = (1.01 × 10⁵ × 2.50 × 10⁻⁴)/(8.31 × 300)', 'A1 n = 0.0101 mol', 'A1 M = 0.500/0.0101 = 49.4 g mol⁻¹']],
        ['A hydrocarbon contains 85.6% carbon by mass. Its molar mass is 56.1 g mol⁻¹.\n(a) Find its empirical formula.\n(b) Find its molecular formula.', ['M1 C: 85.6/12.01 = 7.13; H: 14.4/1.01 = 14.3', 'A1 ratio 1 : 2, empirical formula CH₂', 'M1 56.1/14.03 = 4', 'A1 C₄H₈']],
        ['(a) Write the electron configuration of Fe and of the Fe²⁺ ion.\n(b) Explain why electrons are removed from 4s before 3d when Fe forms ions.', ['A1 Fe: [Ar] 3d⁶ 4s²', 'A1 Fe²⁺: [Ar] 3d⁶', 'R1 once 3d is occupied, the 4s electrons are at higher energy / further from the nucleus, so they are lost first']],
        ['Describe the hydrogen emission spectrum and explain how it gives evidence for energy levels in atoms.', ['A1 a line spectrum: separate lines of specific frequencies (not continuous)', 'R1 electrons absorb energy and move to higher levels; they emit photons when they fall back', 'R1 each line matches a specific energy difference (E = hf), so levels are fixed (quantised)', 'A1 lines converge at higher frequency because levels converge']],
      ],
    },
    // Unit 2: Structure 3.1, the periodic table
    2: {
      m: [
        ['Across period 3 from Na to Cl, atomic radius', ['increases', 'decreases', 'stays the same', 'increases then decreases'], 1, 'Nuclear charge rises while shielding stays about the same, so electrons are pulled closer.'],
        ['Down group 1, first ionization energy', ['increases', 'decreases', 'stays the same', 'is zero'], 1, 'The outer electron is further away and better shielded.'],
        ['Which element has the highest electronegativity?', ['O', 'Cl', 'F', 'N'], 2, 'Fluorine: small atom with high effective nuclear charge.'],
        ['Compare the radius of Na⁺ with that of Na.', ['Na⁺ is larger', 'They are equal', 'Na⁺ is smaller', 'It depends on temperature'], 2, 'Na⁺ has lost its whole outer shell.'],
        ['Compare the radius of Cl⁻ with that of Cl.', ['Cl⁻ is larger', 'Cl⁻ is smaller', 'They are equal', 'Cl⁻ has no radius'], 0, 'The extra electron increases repulsion with the same nuclear charge.'],
        ['Which halogen is the most reactive?', ['I₂', 'Br₂', 'Cl₂', 'F₂'], 3, 'Reactivity of halogens decreases down the group: the atom gains electrons less easily.'],
        ['Which group 1 metal reacts most vigorously with water?', ['Li', 'Na', 'K', 'They all react equally'], 2, 'Reactivity increases down group 1 because the outer electron is lost more easily.'],
        ['Which is a metalloid?', ['Si', 'S', 'Mg', 'Ar'], 0, 'Silicon has properties between metals and non-metals (a semiconductor).'],
        ['Which oxide dissolves in water to form an acidic solution?', ['Na₂O', 'MgO', 'SO₃', 'CaO'], 2, 'Non-metal oxides are acidic: SO₃ + H₂O → H₂SO₄.'],
        ['Which equation is correct for sodium oxide and water?', ['Na₂O + H₂O → 2NaOH', 'Na₂O + H₂O → Na₂ + H₂O₂', 'Na₂O + 2H₂O → 2NaOH + H₂', 'Na₂O + H₂O → NaOH'], 0, 'A basic oxide forms a hydroxide; the equation must balance.'],
        ['Cl₂(aq) is added to KBr(aq). What happens?', ['No reaction', 'The solution turns orange-brown as Br₂ forms', 'A white precipitate forms', 'Cl₂ is formed'], 1, 'Chlorine is more reactive and displaces bromide: Cl₂ + 2Br⁻ → 2Cl⁻ + Br₂.'],
        ['Elements in the same group have the same', ['number of shells', 'number of valence electrons', 'mass number', 'atomic radius'], 1, 'That is why they have similar chemical properties.'],
        ['In which block is iron found?', ['s-block', 'p-block', 'd-block', 'f-block'], 2, 'Its highest-energy electrons are in the 3d sub-level.'],
        ['Which property increases across a period?', ['Atomic radius', 'Metallic character', 'Electronegativity', 'Number of shells'], 2, 'Effective nuclear charge increases across the period.'],
      ],
      w: [
        ['(a) Define first ionization energy.\n(b) Explain the general increase in first ionization energy across period 3.\n(c) Explain why the first ionization energy of sodium is lower than that of lithium.', ['A1 energy needed to remove one mole of electrons from one mole of gaseous atoms (to form 1+ ions)', 'R1 nuclear charge increases across the period', 'R1 electrons are added to the same shell, so shielding is similar and attraction increases', 'R1 Na\'s outer electron is in a shell further from the nucleus and more shielded, so less energy is needed']],
        ['(a) Write an equation for the reaction of magnesium oxide with water and state the pH of the solution formed.\n(b) Write an equation for the reaction of sulfur dioxide with water and state the type of solution formed.\n(c) State the trend in the acid–base character of the oxides across period 3.', ['A1 MgO + H₂O → Mg(OH)₂', 'A1 pH about 9–10 (weakly alkaline)', 'A1 SO₂ + H₂O → H₂SO₃, acidic', 'A1 basic → amphoteric (Al₂O₃) → acidic']],
        ['Chlorine water is added separately to potassium bromide solution and potassium iodide solution.\n(a) Describe what is seen in each.\n(b) Write an ionic equation for one reaction.\n(c) Explain the trend in reactivity of the halogens.', ['A1 KBr: turns yellow/orange', 'A1 KI: turns brown', 'A1 Cl₂ + 2Br⁻ → 2Cl⁻ + Br₂ (or with I⁻)', 'R1 down the group atoms are larger and more shielded, so they attract an extra electron less strongly']],
      ],
    },
    // Unit 3: Structure 2, models of bonding
    3: {
      m: [
        ['What is the formula of magnesium chloride?', ['MgCl', 'Mg₂Cl', 'MgCl₂', 'Mg₂Cl₃'], 2, 'Mg²⁺ and Cl⁻: two chloride ions balance one magnesium ion.'],
        ['Why do ionic compounds conduct electricity when molten but not when solid?', ['Electrons become free when molten', 'Ions are free to move when molten', 'Molten compounds are covalent', 'Solid ionic compounds have no ions'], 1, 'In the solid, ions are held in fixed positions in the lattice.'],
        ['Ionic compounds have high melting points because', ['of weak intermolecular forces', 'of strong electrostatic attraction between oppositely charged ions throughout the lattice', 'their molecules are large', 'of delocalised electrons'], 1, 'A lot of energy is needed to break the many strong ionic attractions.'],
        ['What is the shape of an ammonia (NH₃) molecule?', ['Trigonal planar', 'Tetrahedral', 'Trigonal pyramidal', 'Bent'], 2, '3 bonding pairs and 1 lone pair around N.'],
        ['What is the approximate H–O–H bond angle in water?', ['180°', '120°', '109.5°', '104.5°'], 3, '2 lone pairs repel more strongly than bonding pairs, reducing the 109.5° tetrahedral angle.'],
        ['What is the shape of BF₃?', ['Trigonal planar, 120°', 'Trigonal pyramidal, 107°', 'T-shaped', 'Tetrahedral, 109.5°'], 0, 'Boron has 3 bonding pairs and no lone pair.'],
        ['Which molecule is polar?', ['CO₂', 'CCl₄', 'H₂O', 'BF₃'], 2, 'Water is bent, so the bond dipoles do not cancel. The others are symmetrical.'],
        ['How many lone pairs are on the oxygen atom in water?', ['0', '1', '2', '3'], 2, 'O has 6 valence electrons: 2 used in bonds, 4 in two lone pairs.'],
        ['Which substance has hydrogen bonding between its molecules?', ['CH₄', 'HCl', 'NH₃', 'H₂'], 2, 'Hydrogen bonding needs H bonded to N, O or F.'],
        ['Why does H₂O have a much higher boiling point than H₂S?', ['H₂O has a larger molar mass', 'H₂O has hydrogen bonding between molecules', 'H₂S is ionic', 'H₂O has stronger covalent bonds'], 1, 'Boiling breaks intermolecular forces, not covalent bonds.'],
        ['The weakest type of intermolecular force is', ['hydrogen bonding', 'dipole–dipole', 'London (dispersion) forces', 'ionic bonding'], 2, 'London forces come from temporary dipoles; ionic bonding is not intermolecular.'],
        ['Down group 17, the boiling points of the halogens increase because', ['bond polarity increases', 'London forces increase with more electrons', 'hydrogen bonding increases', 'the covalent bonds get stronger'], 1, 'Larger molecules with more electrons have stronger dispersion forces.'],
        ['Metallic bonding is the attraction between', ['positive and negative ions', 'a lattice of cations and delocalised electrons', 'shared pairs of electrons', 'molecules'], 1, 'The delocalised electrons also explain electrical conductivity.'],
        ['Why are metals malleable?', ['Their electrons are fixed', 'Layers of cations can slide while the delocalised electrons keep holding them together', 'They contain ions of opposite charge', 'They have strong intermolecular forces'], 1, 'The bonding is not directional, so layers can move without breaking it.'],
        ['Which bond is the most polar?', ['C–H', 'H–F', 'H–Cl', 'Cl–Cl'], 1, 'The largest electronegativity difference is between H and F.'],
        ['Diamond has a very high melting point because', ['it is ionic', 'it has a giant covalent network of strong C–C bonds', 'it has strong London forces', 'it has delocalised electrons'], 1, 'Melting requires breaking many strong covalent bonds.'],
        ['Which is a coordination (dative) bond?', ['The H–H bond in H₂', 'The bond formed when NH₃ donates its lone pair to H⁺ in NH₄⁺', 'The bond in NaCl', 'The C=O bond in CO₂'], 1, 'Both electrons in the shared pair come from the same atom.'],
      ],
      w: [
        ['For each of CO₂, NH₃ and CH₂Cl₂:\n(a) draw the Lewis (electron dot) structure,\n(b) state the shape and bond angle,\n(c) state whether the molecule is polar, with a reason.', ['A1 CO₂: two double bonds, two lone pairs on each O; linear, 180°', 'A1 NH₃: three N–H bonds, one lone pair; trigonal pyramidal, about 107°', 'A1 CH₂Cl₂: tetrahedral, about 109.5°', 'R1 CO₂ non-polar: symmetrical, bond dipoles cancel', 'R1 NH₃ and CH₂Cl₂ polar: dipoles do not cancel']],
        ['The boiling points of some hydrides are: CH₄ −162 °C, NH₃ −33 °C, H₂O 100 °C.\nExplain the differences in terms of intermolecular forces.', ['A1 CH₄: only London forces (non-polar)', 'A1 NH₃ and H₂O: hydrogen bonding', 'R1 H₂O can form more hydrogen bonds per molecule (two lone pairs and two H atoms)', 'R1 more/stronger intermolecular forces need more energy to overcome, so a higher boiling point']],
        ['Compare sodium chloride and magnesium (the metal) in terms of\n(a) type of bonding and structure,\n(b) electrical conductivity when solid and when molten, with reasons.', ['A1 NaCl: ionic lattice of Na⁺ and Cl⁻', 'A1 Mg: metallic lattice of Mg²⁺ ions in delocalised electrons', 'R1 NaCl does not conduct when solid (ions fixed) but conducts when molten (ions mobile)', 'R1 Mg conducts in both states because delocalised electrons can move']],
      ],
    },
  },
  // HL only: extra topics in the shared units
  hlUnits: {
    1: {
      m: [
        ['Successive ionization energies of an element show a large jump between the 3rd and 4th. Which group is it in?', ['Group 1', 'Group 2', 'Group 13', 'Group 15'], 2, 'Three electrons are removed easily; the 4th comes from an inner shell.'],
        ['Why is the first ionization energy of Al lower than that of Mg?', ['Al has a smaller nuclear charge', 'Al\'s outer electron is in a 3p orbital, higher in energy than 3s', 'Al has more shells', 'Al has a paired 3p electron'], 1, 'The 3p electron is slightly further out and shielded by the 3s electrons.'],
        ['Why is the first ionization energy of S lower than that of P?', ['S has a smaller nuclear charge', 'In S, one 3p orbital holds a pair of electrons that repel each other', 'S has more shells', 'P is a metal'], 1, 'Electron–electron repulsion in the paired orbital makes one electron easier to remove.'],
      ],
      w: [
        ['The first six ionization energies of an element X (in kJ mol⁻¹) are 738, 1451, 7733, 10 543, 13 630, 18 020.\n(a) Deduce the group of X, with a reason.\n(b) Explain why each successive ionization energy is larger than the one before.', ['A1 group 2', 'R1 large jump between the 2nd and 3rd ionization energies: the 3rd electron comes from an inner shell', 'R1 each electron is removed from an increasingly positive ion', 'R1 less repulsion / smaller ion, so electrons are held more strongly']],
      ],
    },
    2: {
      m: [
        ['Which property is typical of transition elements?', ['Only one oxidation state', 'Coloured compounds and variable oxidation states', 'Very low melting points', 'Never act as catalysts'], 1, 'Partly filled d sub-levels allow both.'],
        ['Why is zinc not usually classed as a transition element?', ['It is not a metal', 'Its only ion, Zn²⁺, has a full 3d sub-level', 'It is in the p-block', 'It has no d electrons'], 1, 'A transition element has an incomplete d sub-level in at least one ion.'],
      ],
      w: [],
    },
    3: {
      m: [
        ['What is the hybridization of each carbon atom in ethene, C₂H₄?', ['sp', 'sp²', 'sp³', 'sp³d'], 1, 'Three electron domains around each carbon: trigonal planar, sp².'],
        ['What is the formal charge on nitrogen in NH₄⁺?', ['0', '+1', '−1', '+4'], 1, 'FC = 5 valence − 0 non-bonding − ½ × 8 bonding = +1.'],
        ['In the carbonate ion, CO₃²⁻, the three C–O bonds are', ['one double and two single, of different lengths', 'all the same length, because of resonance (delocalised electrons)', 'all double bonds', 'all single bonds of different lengths'], 1, 'The π electrons are delocalised over the three bonds.'],
        ['How many σ and π bonds are in ethyne, H–C≡C–H?', ['3 σ and 2 π', '2 σ and 3 π', '5 σ', '4 σ and 1 π'], 0, 'Two C–H σ bonds, plus one σ and two π in the triple bond.'],
      ],
      w: [
        ['Two Lewis structures can be drawn for CO₂: O=C=O and O≡C–O.\n(a) Calculate the formal charge on each atom in both structures.\n(b) Deduce which structure is preferred, with a reason.', ['A1 O=C=O: all atoms 0', 'A1 O≡C–O: O (triple) +1, C 0, O (single) −1', 'R1 O=C=O is preferred: formal charges closest to zero']],
      ],
    },
  },
};
