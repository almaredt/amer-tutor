// Grade 12 DP Mathematics: analysis and approaches. Original questions, answers checked by calculation.
module.exports = {
  course: 'uptown-g12-2026t1',
  subject: 'Mathematics: analysis and approaches',
  units: {
    // Unit 1: Differential calculus
    1: {
      m: [
        ['Find dy/dx when y = 3x⁴.', ['12x³', '3x³', '12x⁴', '4x³'], 0, 'Bring down the power and reduce it by 1: 3 × 4x³.'],
        ['Find the limit of (x² − 9)/(x − 3) as x → 3.', ['0', '3', '6', 'It does not exist'], 2, '(x − 3)(x + 3)/(x − 3) = x + 3 → 6.'],
        ['Find the gradient of y = x² + 3x at x = 2.', ['10', '7', '5', '4'], 1, 'dy/dx = 2x + 3 = 7.'],
        ['Find the equation of the tangent to y = x² + 3x at x = 2.', ['y = 7x − 4', 'y = 7x + 10', 'y = 10x − 7', 'y = 7x − 14'], 0, 'Point (2, 10), gradient 7: y − 10 = 7(x − 2).'],
        ['The tangent at a point has gradient 4. What is the gradient of the normal there?', ['−4', '4', '1/4', '−1/4'], 3, 'The normal is perpendicular: −1/4.'],
        ['Differentiate e³ˣ.', ['e³ˣ', '3e³ˣ', 'e³ˣ/3', '3xe³ˣ⁻¹'], 1, 'Chain rule: the derivative of 3x is 3.'],
        ['Differentiate sin(2x).', ['cos(2x)', '2cos(2x)', '−2cos(2x)', '2sin(2x)'], 1, 'Chain rule: 2 × cos(2x).'],
        ['Differentiate ln(3x).', ['1/(3x)', '3/x', '1/x', 'ln 3'], 2, 'ln(3x) = ln 3 + ln x, so the derivative is 1/x.'],
        ['Differentiate (2x + 1)⁵.', ['5(2x + 1)⁴', '10(2x + 1)⁴', '10(2x + 1)⁵', '(2x + 1)⁴'], 1, 'Chain rule: 5(2x + 1)⁴ × 2.'],
        ['Differentiate x²eˣ.', ['2xeˣ', 'eˣ(x² + 2x)', 'x²eˣ', 'eˣ(2x + 1)'], 1, 'Product rule: 2x·eˣ + x²·eˣ.'],
        ['Differentiate x/(x + 1).', ['1/(x + 1)²', '−1/(x + 1)²', '1', '(2x + 1)/(x + 1)²'], 0, 'Quotient rule: ((x + 1) − x)/(x + 1)².'],
        ['Find the x-coordinates of the stationary points of f(x) = x³ − 3x.', ['0 only', '±1', '±3', '±√3'], 1, 'f′(x) = 3x² − 3 = 0 gives x = ±1.'],
        ['Find the minimum value of f(x) = x² − 4x + 7.', ['7', '2', '3', '−4'], 2, 'f′(x) = 2x − 4 = 0 at x = 2; f(2) = 3.'],
        ['At x = a, f′(a) = 0 and f″(a) < 0. The point is', ['a local minimum', 'a local maximum', 'a point of inflection', 'not stationary'], 1, 'Negative second derivative: concave down.'],
        ['Find the x-coordinate of the point of inflection of y = x³ − 6x².', ['0', '4', '2', '−2'], 2, 'y″ = 6x − 12 = 0 at x = 2, and y″ changes sign there.'],
        ['If f′(x) > 0 for all x in an interval, then f is', ['decreasing there', 'increasing there', 'constant there', 'concave up there'], 1, 'A positive gradient means the function is increasing.'],
        ['Differentiate cos x.', ['sin x', '−sin x', '−cos x', 'tan x'], 1, 'd/dx(cos x) = −sin x.'],
        ['The displacement of a particle is s = t³ − 2t. Find its velocity at t = 2.', ['4 m s⁻¹', '10 m s⁻¹', '12 m s⁻¹', '8 m s⁻¹'], 1, 'v = ds/dt = 3t² − 2 = 10.'],
      ],
      w: [
        ['f(x) = x³ − 6x² + 9x + 1.\n(a) Find f′(x).\n(b) Find the coordinates of the stationary points and determine their nature.\n(c) Find the point of inflection.', ['A1 f′(x) = 3x² − 12x + 9', 'M1 solves 3(x − 1)(x − 3) = 0', 'A1 (1, 5) local maximum', 'A1 (3, 1) local minimum (using f″ or a sign table)', 'A1 f″(x) = 6x − 12 = 0: inflection at (2, 3)']],
        ['An open box is made from a 12 cm by 12 cm square of card by cutting a square of side x cm from each corner.\n(a) Show that V = x(12 − 2x)².\n(b) Find the value of x that gives the maximum volume, and the maximum volume.', ['A1 base side 12 − 2x, height x', 'M1 differentiates (product or expanded form)', 'A1 dV/dx = (12 − 2x)(12 − 6x)', 'A1 x = 2 (x = 6 gives zero volume)', 'A1 V = 128 cm³']],
        ['Consider y = e²ˣ.\n(a) Find the equation of the tangent at x = 0.\n(b) Find the equation of the normal at x = 0.\n(c) Find where the normal meets the x-axis.', ['A1 point (0, 1), dy/dx = 2e²ˣ = 2', 'A1 tangent y = 2x + 1', 'A1 normal y = −x/2 + 1', 'A1 (2, 0)']],
      ],
    },
    // Unit 2: Integral calculus
    2: {
      m: [
        ['Find ∫ 6x² dx.', ['12x + C', '2x³ + C', '6x³ + C', '3x³ + C'], 1, 'Raise the power by 1 and divide by the new power: 6x³/3.'],
        ['Evaluate ∫ from 0 to 2 of 3x² dx.', ['6', '8', '12', '4'], 1, '[x³] from 0 to 2 = 8.'],
        ['Find ∫ e²ˣ dx.', ['2e²ˣ + C', 'e²ˣ + C', '½e²ˣ + C', 'e²ˣ⁺¹/(2x + 1) + C'], 2, 'Reverse of the chain rule: divide by 2.'],
        ['Find ∫ (1/x) dx.', ['ln|x| + C', '−1/x² + C', 'x⁰ + C', '1/(2x²) + C'], 0, 'The power rule does not work for x⁻¹.'],
        ['Find ∫ cos x dx.', ['−sin x + C', 'sin x + C', '−cos x + C', 'tan x + C'], 1, 'd/dx(sin x) = cos x.'],
        ['Find the area between y = x² and the x-axis from x = 0 to x = 3.', ['27', '6', '9', '3'], 2, '[x³/3] from 0 to 3 = 9.'],
        ['Evaluate ∫ from 1 to e of (1/x) dx.', ['e', '1', '0', 'e − 1'], 1, 'ln e − ln 1 = 1.'],
        ['Evaluate ∫ from 0 to π of sin x dx.', ['0', '1', '2', 'π'], 2, '[−cos x] from 0 to π = 1 + 1 = 2.'],
        ['Find ∫ (2x + 1)³ dx.', ['(2x + 1)⁴/4 + C', '(2x + 1)⁴/8 + C', '3(2x + 1)² + C', '(2x + 1)⁴/2 + C'], 1, 'Divide by 4 for the power and by 2 for the inner derivative.'],
        ['f′(x) = 2x and f(1) = 5. Find f(x).', ['x² + 5', 'x² + 4', '2x + 3', 'x² + 6'], 1, 'f(x) = x² + C and 1 + C = 5.'],
        ['Find the area enclosed by y = x and y = x² (between x = 0 and x = 1).', ['1/2', '1/3', '1/6', '1'], 2, '∫ from 0 to 1 of (x − x²) dx = 1/2 − 1/3 = 1/6.'],
        ['A particle has velocity v = 3t² m s⁻¹. Find its displacement from t = 0 to t = 2.', ['12 m', '6 m', '8 m', '4 m'], 2, 'Displacement = ∫ v dt = [t³] from 0 to 2 = 8.'],
        ['A particle has constant acceleration 6 m s⁻² and initial velocity 2 m s⁻¹. Find v(t).', ['6t', '6t + 2', '3t² + 2', '2t + 6'], 1, 'v = ∫ 6 dt = 6t + C, with v(0) = 2.'],
        ['When a velocity–time graph goes below the axis, the total distance travelled is found by', ['∫ v dt', '∫ |v| dt', 'the gradient of v', '∫ a dt'], 1, 'Areas below the axis count as distance, not negative displacement.'],
        ['∫ from a to b of f(x) dx is negative. This means', ['the integral is wrong', 'more of the area lies below the x-axis than above it', 'f is decreasing', 'a > b always'], 1, 'Areas below the axis give negative values.'],
      ],
      w: [
        ['A particle moves with velocity v(t) = t² − 4t + 3 m s⁻¹ for 0 ≤ t ≤ 4.\n(a) Find the times when the particle is at rest.\n(b) Find the displacement from t = 0 to t = 4.\n(c) Find the total distance travelled.', ['A1 t = 1 and t = 3', 'M1 ∫ from 0 to 4 of (t² − 4t + 3) dt', 'A1 4/3 m', 'M1 splits at t = 1 and t = 3 (or uses |v|)', 'A1 4/3 + 4/3 + 4/3 = 4 m']],
        ['The curves y = 4 − x² and y = x + 2 intersect at A and B.\n(a) Find the x-coordinates of A and B.\n(b) Find the area of the region enclosed by the two curves.', ['M1 4 − x² = x + 2 so x² + x − 2 = 0', 'A1 x = −2 and x = 1', 'M1 ∫ from −2 to 1 of (2 − x − x²) dx', 'A1 4.5']],
        ['The gradient of a curve is dy/dx = 3x² − 4x. The curve passes through (2, 5).\n(a) Find the equation of the curve.\n(b) Find the y-intercept.', ['M1 integrates: y = x³ − 2x² + C', 'M1 substitutes (2, 5): 8 − 8 + C = 5', 'A1 y = x³ − 2x² + 5', 'A1 (0, 5)']],
      ],
    },
    // Unit 3: Probability distributions
    3: {
      m: [
        ['P(X = 1) = 0.1, P(X = 2) = 0.3, P(X = 3) = k, P(X = 4) = 0.2. Find k.', ['0.3', '0.4', '0.5', '0.6'], 1, 'Probabilities sum to 1.'],
        ['For the distribution above (k = 0.4), find E(X).', ['2.5', '2.7', '3.0', '2.4'], 1, '0.1 + 0.6 + 1.2 + 0.8 = 2.7.'],
        ['X ~ B(10, 0.3). Find E(X).', ['0.3', '3', '7', '2.1'], 1, 'E(X) = np = 3.'],
        ['X ~ B(10, 0.3). Find Var(X).', ['3', '2.1', '0.21', '1.45'], 1, 'Var(X) = np(1 − p) = 2.1.'],
        ['A fair coin is tossed 5 times. Find P(exactly 2 heads).', ['0.4', '0.3125', '0.2', '0.5'], 1, '⁵C₂ × 0.5⁵ = 10/32.'],
        ['Which is NOT a condition for a binomial model?', ['A fixed number of trials', 'Independent trials', 'The same probability of success each trial', 'Probability of success equal to 0.5'], 3, 'p can be any value between 0 and 1.'],
        ['A game costs $2. You roll a die and win $6 on a six, nothing otherwise. What is your expected gain?', ['$0', '−$1', '$1', '−$2'], 1, '6 × 1/6 − 2 = −1.'],
        ['A game is called fair when', ['every outcome is equally likely', 'the expected gain is 0', 'you cannot lose', 'the probability of winning is 0.5'], 1, 'On average, players neither win nor lose.'],
        ['Z ~ N(0, 1). Find P(Z < 0).', ['0', '0.5', '1', '0.68'], 1, 'The normal curve is symmetric about the mean.'],
        ['About what percentage of a normal distribution lies within one standard deviation of the mean?', ['50%', '68%', '95%', '99.7%'], 1, 'Roughly 68%, 95% within two and 99.7% within three.'],
        ['X ~ N(50, 10²). Find the z-score of x = 65.', ['15', '1.5', '6.5', '0.15'], 1, 'z = (65 − 50)/10.'],
        ['X ~ N(50, 4²). Find P(X > 58).', ['0.0228', '0.977', '0.159', '0.0013'], 0, 'z = 2, and P(Z > 2) ≈ 0.0228.'],
        ['A and B are independent with P(A) = 0.4 and P(B) = 0.5. Find P(A ∩ B).', ['0.9', '0.2', '0.1', '0.7'], 1, 'For independent events, P(A ∩ B) = P(A)P(B).'],
        ['If X ~ N(μ, σ²) and σ increases, the curve becomes', ['taller and narrower', 'lower and wider', 'shifted to the right', 'skewed'], 1, 'The total area stays 1, so it spreads out and drops.'],
      ],
      w: [
        ['A spinner lands on red with probability 0.25. It is spun 8 times. X is the number of reds.\n(a) State the distribution of X.\n(b) Find P(X = 2).\n(c) Find P(X ≥ 2).', ['A1 X ~ B(8, 0.25)', 'M1 ⁸C₂ × 0.25² × 0.75⁶', 'A1 0.311', 'M1 1 − P(X ≤ 1)', 'A1 0.633']],
        ['Heights of students are normally distributed with mean 165 cm and standard deviation 8 cm.\n(a) Find the probability that a student is taller than 175 cm.\n(b) Find the probability that a student is between 155 cm and 175 cm.\n(c) 90% of students are shorter than h cm. Find h.', ['A1 0.106', 'A1 0.789', 'M1 uses inverse normal with 0.9', 'A1 h = 175 cm (175.3)']],
        ['A bag has 3 red and 2 blue balls. Two are taken without replacement. X is the number of red balls.\n(a) Find the probability distribution of X.\n(b) Find E(X).', ['A1 P(X = 0) = 2/5 × 1/4 = 0.1', 'A1 P(X = 1) = 2 × 3/5 × 2/4 = 0.6', 'A1 P(X = 2) = 3/5 × 2/4 = 0.3', 'A1 E(X) = 0.6 + 0.6 = 1.2']],
      ],
    },
  },
  // HL only
  hlUnits: {
    1: {
      m: [
        ['x² + y² = 25. Find dy/dx at (3, 4).', ['3/4', '−3/4', '−4/3', '4/3'], 1, 'Implicit: 2x + 2y dy/dx = 0, so dy/dx = −x/y.'],
        ['Differentiate arctan x.', ['1/(1 + x²)', '1/√(1 − x²)', 'sec² x', '−1/(1 + x²)'], 0, 'A standard result in the formula booklet.'],
        ['Differentiate tan x.', ['sec² x', 'sec x tan x', '−cosec² x', 'ln|sec x|'], 0, 'Quotient rule on sin x / cos x.'],
      ],
      w: [
        ['The radius of a circular ripple increases at 3 cm s⁻¹. Find the rate at which its area increases when the radius is 10 cm.', ['M1 A = πr², dA/dr = 2πr', 'M1 dA/dt = dA/dr × dr/dt', 'A1 60π cm² s⁻¹ (≈ 188)']],
      ],
    },
    2: {
      m: [
        ['Find ∫ xeˣ dx.', ['xeˣ + C', 'eˣ(x − 1) + C', 'eˣ(x + 1) + C', 'x²eˣ/2 + C'], 1, 'By parts with u = x: xeˣ − ∫ eˣ dx.'],
        ['The region under y = √x from x = 0 to x = 4 is rotated 360° about the x-axis. Find the volume.', ['4π', '8π', '16π', '2π'], 1, 'V = π ∫ from 0 to 4 of x dx = 8π.'],
        ['Use u = x² + 1 to find ∫ 2x(x² + 1)³ dx.', ['(x² + 1)⁴/4 + C', '(x² + 1)⁴ + C', '2(x² + 1)⁴ + C', '(x² + 1)³/3 + C'], 0, 'du = 2x dx, so ∫ u³ du = u⁴/4.'],
      ],
      w: [
        ['Use integration by parts to find ∫ x sin x dx, and hence evaluate it from 0 to π.', ['M1 u = x, dv = sin x dx', 'A1 −x cos x + sin x + C', 'A1 π']],
      ],
    },
    3: {
      m: [
        ['f(x) = kx for 0 ≤ x ≤ 2 (0 otherwise) is a probability density function. Find k.', ['1', '1/2', '2', '1/4'], 1, '∫ from 0 to 2 of kx dx = 2k = 1.'],
        ['A test is 95% accurate for people with a condition and gives false positives 10% of the time. 2% of people have the condition. Which theorem finds P(condition | positive)?', ['The binomial theorem', 'Bayes\' theorem', 'The central limit theorem', 'The factor theorem'], 1, 'Bayes\' theorem reverses a conditional probability. (Here it is about 0.162.)'],
      ],
      w: [],
    },
  },
};
