// Grade 12 DP Physics. Original questions; numbers checked by calculation (g = 9.81 m s⁻², R = 8.31 J K⁻¹ mol⁻¹).
module.exports = {
  course: 'uptown-g12-2026t1',
  subject: 'Physics',
  units: {
    // Unit 1: Theme B, the particulate nature of matter
    1: {
      m: [
        ['How much energy raises 2.0 kg of water by 10 °C? (c = 4200 J kg⁻¹ K⁻¹)', ['8400 J', '84 000 J', '42 000 J', '840 J'], 1, 'Q = mcΔT = 2.0 × 4200 × 10.'],
        ['How much energy melts 0.50 kg of ice at 0 °C? (L = 3.34 × 10⁵ J kg⁻¹)', ['1.67 × 10⁵ J', '3.34 × 10⁵ J', '6.68 × 10⁵ J', '1.67 × 10⁴ J'], 0, 'Q = mL = 0.50 × 3.34 × 10⁵.'],
        ['Convert 27 °C to kelvin.', ['246 K', '300 K', '27 K', '273 K'], 1, 'T(K) = 27 + 273.'],
        ['While a substance melts, its temperature stays constant because the energy', ['is lost to the surroundings', 'increases the potential energy of the particles', 'increases the kinetic energy of the particles', 'is stored in the container'], 1, 'Temperature measures average kinetic energy, which does not change.'],
        ['The absolute temperature of a black body doubles. Its emitted power becomes', ['2 times', '4 times', '8 times', '16 times'], 3, 'Stefan–Boltzmann: P ∝ T⁴, and 2⁴ = 16.'],
        ['The Sun\'s surface temperature is about 5800 K. Use Wien\'s law (b = 2.9 × 10⁻³ m K) to find λmax.', ['500 nm', '5 µm', '50 nm', '2 µm'], 0, 'λ = 2.9 × 10⁻³ / 5800 = 5.0 × 10⁻⁷ m.'],
        ['Albedo is', ['the power emitted per unit area', 'the fraction of incoming radiation that is reflected', 'the temperature of a planet', 'the absorption of infrared by CO₂'], 1, 'Albedo = reflected power / incident power.'],
        ['Greenhouse gases warm the Earth because they', ['absorb incoming ultraviolet', 'absorb and re-emit infrared radiation from the surface', 'reflect visible light', 'increase the albedo'], 1, 'Some re-emitted infrared goes back towards the surface.'],
        ['At constant volume, the absolute temperature of a fixed mass of ideal gas doubles. The pressure', ['halves', 'stays the same', 'doubles', 'quadruples'], 2, 'p/T is constant when V and n are fixed.'],
        ['In the kinetic model, gas pressure is caused by', ['particles attracting each other', 'particles colliding with the container walls, changing momentum', 'the weight of the gas', 'particles vibrating in place'], 1, 'Force = rate of change of momentum at the walls.'],
        ['The average kinetic energy of ideal-gas particles is proportional to', ['the pressure', 'the absolute temperature', 'the volume', 'the number of moles'], 1, 'Ēk = (3/2) kT.'],
        ['Which is the best thermal conductor?', ['Air', 'Copper', 'Wood', 'Water'], 1, 'Metals have free electrons that transfer energy quickly.'],
        ['A 6.0 V battery drives 0.50 A through a resistor. Find the resistance.', ['3.0 Ω', '12 Ω', '0.083 Ω', '6.5 Ω'], 1, 'R = V/I = 6.0/0.50.'],
        ['Two 6 Ω resistors are connected in parallel. The total resistance is', ['12 Ω', '6 Ω', '3 Ω', '1/3 Ω'], 2, '1/R = 1/6 + 1/6, so R = 3 Ω.'],
      ],
      w: [
        ['0.20 kg of water at 80 °C is mixed with 0.30 kg of water at 20 °C in an insulated container.\n(a) Calculate the final temperature.\n(b) State one assumption you made.', ['M1 energy lost by hot water = energy gained by cold water', 'M1 0.20 × c × (80 − T) = 0.30 × c × (T − 20)', 'A1 T = 44 °C', 'R1 no energy lost to the surroundings or container']],
        ['2.0 mol of an ideal gas is at 300 K in a 0.050 m³ container.\n(a) Calculate the pressure.\n(b) The gas is heated to 450 K at constant volume. Find the new pressure.\n(c) Explain the change using the kinetic model.', ['M1 p = nRT/V', 'A1 9.97 × 10⁴ Pa', 'A1 1.50 × 10⁵ Pa', 'R1 particles move faster: more frequent and harder collisions with the walls']],
        ['Explain, in terms of energy balance, how an increase in greenhouse gases raises the Earth\'s mean surface temperature.', ['R1 the surface emits infrared radiation', 'R1 greenhouse gases absorb some infrared and re-emit it in all directions, some back to the surface', 'R1 less energy escapes, so incoming power is greater than outgoing', 'R1 the temperature rises until the surface emits enough to restore balance']],
      ],
    },
    // Unit 2: Theme C, wave behaviour
    2: {
      m: [
        ['A wave has frequency 50 Hz and wavelength 2.0 m. Find its speed.', ['25 m s⁻¹', '100 m s⁻¹', '52 m s⁻¹', '0.04 m s⁻¹'], 1, 'v = fλ.'],
        ['A wave has frequency 250 Hz. Its period is', ['4 ms', '250 s', '0.4 s', '25 ms'], 0, 'T = 1/f = 0.004 s.'],
        ['In simple harmonic motion, the acceleration is', ['constant', 'proportional to the displacement and directed towards equilibrium', 'greatest at the equilibrium position', 'proportional to the velocity'], 1, 'a = −ω²x.'],
        ['Find the period of a simple pendulum of length 1.0 m.', ['1.0 s', '2.0 s', '3.1 s', '6.3 s'], 1, 'T = 2π√(L/g) = 2π√(1/9.81) ≈ 2.0 s.'],
        ['In SHM, the speed is greatest', ['at maximum displacement', 'at the equilibrium position', 'halfway to the maximum displacement', 'everywhere equally'], 1, 'All the energy is kinetic there.'],
        ['Sound is a', ['transverse wave', 'longitudinal wave', 'electromagnetic wave', 'standing wave only'], 1, 'The air particles oscillate parallel to the direction of travel.'],
        ['Light goes from air into glass (n = 1.5) at 30° to the normal. Find the angle of refraction.', ['45°', '19.5°', '30°', '20.0°'], 1, 'sin r = sin 30° / 1.5 = 0.333.'],
        ['Find the critical angle for glass of refractive index 1.5.', ['41.8°', '48.2°', '33.7°', '60.0°'], 0, 'sin c = 1/n = 0.667.'],
        ['Light of wavelength 600 nm passes through two slits 0.50 mm apart onto a screen 2.0 m away. Find the fringe spacing.', ['0.24 mm', '2.4 mm', '24 mm', '1.2 mm'], 1, 's = λD/d = (600 × 10⁻⁹ × 2.0)/(0.50 × 10⁻³).'],
        ['Diffraction is most noticeable when the gap is', ['much larger than the wavelength', 'about the same size as the wavelength', 'zero', 'filled with glass'], 1, 'Similar sizes give the most spreading.'],
        ['For a string fixed at both ends, the wavelength of the first harmonic is', ['L', '2L', 'L/2', '4L'], 1, 'The string holds half a wavelength: one loop.'],
        ['Constructive interference happens when the path difference is', ['a whole number of wavelengths', 'an odd number of half wavelengths', 'always zero', 'a quarter wavelength'], 0, 'The waves arrive in phase.'],
        ['An ambulance siren approaches you. The frequency you hear is', ['lower than emitted', 'higher than emitted', 'the same', 'zero'], 1, 'Doppler effect: wavefronts are squashed in front of the source.'],
        ['Light from a distant galaxy is redshifted. This shows the galaxy is', ['moving towards us', 'moving away from us', 'very hot', 'not moving'], 1, 'Longer received wavelength means the source is receding.'],
      ],
      w: [
        ['In a double-slit experiment, the slits are 0.25 mm apart and the screen is 1.5 m away. The distance across 10 fringe spacings is 36 mm.\n(a) Calculate the fringe spacing.\n(b) Calculate the wavelength of the light.\n(c) State and explain one way to make the fringes wider apart.', ['A1 s = 3.6 mm', 'M1 λ = sd/D', 'A1 λ = 6.0 × 10⁻⁷ m (600 nm)', 'R1 move the screen further away / slits closer together / longer wavelength, since s = λD/d']],
        ['A guitar string 0.65 m long vibrates at its first harmonic at 196 Hz.\n(a) Calculate the speed of waves on the string.\n(b) Find the frequency of the third harmonic.\n(c) Describe the difference between a node and an antinode.', ['A1 λ = 2L = 1.30 m', 'A1 v = fλ = 255 m s⁻¹', 'A1 588 Hz', 'R1 node: zero amplitude; antinode: maximum amplitude']],
        ['A mass on a spring oscillates with SHM, amplitude 4.0 cm and period 0.50 s.\n(a) Calculate the angular frequency.\n(b) Calculate the maximum speed.\n(c) Calculate the maximum acceleration.', ['A1 ω = 2π/T = 12.6 rad s⁻¹', 'M1 vmax = ωA', 'A1 0.50 m s⁻¹', 'A1 amax = ω²A = 6.3 m s⁻²']],
      ],
    },
    // Unit 3: Theme D, fields
    3: {
      m: [
        ['The distance between two masses is doubled. The gravitational force becomes', ['half', 'a quarter', 'double', 'four times'], 1, 'Inverse-square law: F ∝ 1/r².'],
        ['The electric force between two charges is F. Both charges are doubled and the distance is unchanged. The new force is', ['2F', '4F', 'F/2', 'F'], 1, 'F ∝ q₁q₂.'],
        ['Electric field lines point', ['from negative to positive', 'from positive to negative', 'in circles', 'towards both charges'], 1, 'They show the direction of force on a positive test charge.'],
        ['A wire 0.50 m long carries 3.0 A at right angles to a 0.20 T field. Find the force.', ['0.30 N', '3.0 N', '0.03 N', '0.60 N'], 0, 'F = BIL = 0.20 × 3.0 × 0.50.'],
        ['An electron moves at right angles to a uniform magnetic field. Its path is', ['a straight line', 'a parabola', 'a circle', 'a spiral outwards'], 2, 'The force is always perpendicular to the velocity.'],
        ['A charged particle moves parallel to a magnetic field. The magnetic force on it is', ['maximum', 'zero', 'qvB', 'opposite to its motion'], 1, 'F = qvB sin θ and θ = 0.'],
        ['A charged particle enters a uniform electric field at right angles to the field. Its path is', ['a circle', 'a parabola', 'a straight line', 'a helix'], 1, 'Constant force in one direction, like a projectile.'],
        ['Gravitational potential is always negative because', ['gravity is weak', 'it is defined as zero at infinity and gravity is attractive', 'mass is negative', 'of the direction of the field lines'], 1, 'Work must be done to move a mass out to infinity.'],
        ['For a circular orbit of radius r around a mass M, the orbital speed is', ['√(GM/r)', 'GM/r²', '√(2GM/r)', 'GMr'], 0, 'Gravity provides the centripetal force: GMm/r² = mv²/r.'],
        ['A satellite moves to a larger circular orbit. Its orbital speed', ['increases', 'decreases', 'stays the same', 'becomes zero'], 1, 'v = √(GM/r) falls as r rises.'],
        ['The gravitational field strength at the Earth\'s surface is about', ['6.67 × 10⁻¹¹ N kg⁻¹', '9.81 N kg⁻¹', '1 N kg⁻¹', '3.0 × 10⁸ N kg⁻¹'], 1, 'g = GM/R² ≈ 9.81.'],
        ['The radius of a charged particle\'s circular path in a magnetic field is', ['r = qB/(mv)', 'r = mv/(qB)', 'r = qvB', 'r = mvqB'], 1, 'qvB = mv²/r.'],
      ],
      w: [
        ['A satellite moves in a circular orbit of radius 7.0 × 10⁶ m around the Earth (M = 5.97 × 10²⁴ kg, G = 6.67 × 10⁻¹¹ N m² kg⁻²).\n(a) Show that the orbital speed is about 7.5 km s⁻¹.\n(b) Calculate the orbital period.', ['M1 GMm/r² = mv²/r', 'A1 v = √(GM/r) = 7.54 × 10³ m s⁻¹', 'M1 T = 2πr/v', 'A1 5.83 × 10³ s (about 97 minutes)']],
        ['An electron (q = 1.60 × 10⁻¹⁹ C, m = 9.11 × 10⁻³¹ kg) moves at 2.0 × 10⁶ m s⁻¹ at right angles to a 5.0 mT magnetic field.\n(a) Calculate the force on it.\n(b) Calculate the radius of its path.\n(c) Explain why the field does no work on the electron.', ['A1 F = qvB = 1.6 × 10⁻¹⁵ N', 'M1 r = mv/(qB)', 'A1 r = 2.3 × 10⁻³ m', 'R1 the force is perpendicular to the velocity, so the speed and kinetic energy do not change']],
        ['Compare gravitational and electric fields: give two similarities and two differences.', ['A1 both follow an inverse-square law for point sources', 'A1 both are described by field strength and potential', 'A1 gravity is only attractive; electric forces can attract or repel', 'A1 gravity acts on mass, electric force on charge (and is far stronger for particles)']],
      ],
    },
  },
};
