// Grade 12 DP Mathematics: applications and interpretation. Original questions, answers checked by calculation.
module.exports = {
  course: 'uptown-g12-2026t1',
  subject: 'Mathematics: applications and interpretation',
  units: {
    // Unit 1: Probability distributions
    1: {
      m: [
        ['P(A) = 0.6, P(B) = 0.5 and P(A ∩ B) = 0.3. Find P(A ∪ B).', ['1.1', '0.8', '0.3', '0.9'], 1, 'P(A ∪ B) = 0.6 + 0.5 − 0.3.'],
        ['For the events above, are A and B independent?', ['Yes, because P(A)P(B) = P(A ∩ B)', 'No, because P(A ∩ B) ≠ 0', 'Yes, because they overlap', 'It cannot be told'], 0, '0.6 × 0.5 = 0.3.'],
        ['X ~ B(12, 0.2). Find E(X).', ['2.4', '1.92', '0.2', '9.6'], 0, 'np = 12 × 0.2.'],
        ['X ~ B(12, 0.2). Find P(X = 3), to 3 s.f.', ['0.236', '0.133', '0.795', '0.0512'], 0, '¹²C₃ × 0.2³ × 0.8⁹ ≈ 0.236 (binompdf on the GDC).'],
        ['A discrete random variable has P(X = 0) = 0.5, P(X = 1) = 0.3, P(X = 2) = 0.2. Find E(X).', ['1', '0.7', '0.5', '1.5'], 1, '0 + 0.3 + 0.4.'],
        ['Masses are N(500, 5²) grams. What percentage are between 495 g and 505 g (approximately)?', ['50%', '68%', '95%', '99.7%'], 1, 'Within one standard deviation of the mean.'],
        ['X ~ N(500, 5²). Find P(X < 490).', ['0.0228', '0.159', '0.977', '0.5'], 0, '490 is two standard deviations below the mean.'],
        ['Which situation suits a binomial model?', ['Heights of students', 'The number of sixes in 20 rolls of a die', 'Time to run 100 m', 'Daily temperature'], 1, 'A fixed number of independent trials with the same probability of success.'],
        ['From a tree diagram, the probability of two successive events is found by', ['adding along the branches', 'multiplying along the branches', 'subtracting from 1', 'dividing'], 1, 'Then add the probabilities of different paths.'],
        ['P(rain) = 0.3. What is P(no rain)?', ['0.3', '0.7', '1.3', '0'], 1, 'Complementary events: 1 − 0.3.'],
      ],
      w: [
        ['20% of a factory\'s light bulbs are faulty. A box contains 12 bulbs.\n(a) Find the expected number of faulty bulbs.\n(b) Find the probability that exactly 3 are faulty.\n(c) Find the probability that at most 2 are faulty.', ['A1 2.4', 'M1 X ~ B(12, 0.2)', 'A1 0.236', 'A1 0.558']],
        ['The times to finish a puzzle are N(12, 2²) minutes.\n(a) Find the probability that a person takes more than 15 minutes.\n(b) Find the time exceeded by only 5% of people.', ['A1 0.0668', 'M1 inverse normal with area 0.95 to the left', 'A1 15.3 minutes']],
      ],
    },
    // Unit 2: Statistical tests
    2: {
      m: [
        ['In a χ² test for independence, the null hypothesis H₀ is that', ['the variables are dependent', 'the variables are independent', 'the means are equal', 'the data are normal'], 1, 'H₀ always states "no association".'],
        ['A contingency table has 3 rows and 4 columns. The degrees of freedom are', ['12', '7', '6', '5'], 2, '(3 − 1)(4 − 1) = 6.'],
        ['The expected frequency of a cell is', ['(row total × column total) / grand total', 'row total / column total', 'the observed value', 'grand total / number of cells'], 0, 'What you would expect if the variables were independent.'],
        ['The p-value is 0.03 and the significance level is 5%. You should', ['accept H₀', 'reject H₀', 'increase the sample', 'change the significance level'], 1, 'p < 0.05, so the result is significant.'],
        ['The p-value is 0.12 at the 5% significance level. The conclusion is', ['reject H₀', 'there is insufficient evidence to reject H₀', 'H₀ is proved true', 'H₁ is true'], 1, 'Failing to reject does not prove H₀.'],
        ['χ² tests are unreliable if', ['any expected frequency is below 5', 'any observed frequency is above 5', 'the table is 2 × 2', 'the sample is large'], 0, 'Combine rows or columns to fix it.'],
        ['A goodness of fit test with 6 categories (no estimated parameters) has degrees of freedom', ['6', '5', '4', '1'], 1, 'Number of categories − 1.'],
        ['Spearman\'s rank correlation coefficient of −1 means', ['no correlation', 'a perfect decreasing monotonic relationship', 'a perfect linear increasing relationship', 'the data are wrong'], 1, 'As one variable increases, the other always decreases.'],
        ['Spearman\'s rank is better than Pearson\'s r when', ['the relationship is linear', 'the relationship is monotonic but not linear', 'there are no outliers', 'the data are normal'], 1, 'It uses ranks, so it measures monotonic relationships.'],
        ['A larger χ² calculated value means', ['observed values are close to expected', 'observed values differ more from expected', 'the test is invalid', 'fewer degrees of freedom'], 1, 'Then the p-value is smaller.'],
      ],
      w: [
        ['200 students were asked whether they prefer football or basketball, by gender. A χ² test for independence at the 5% level gives χ²calc = 5.84 with p = 0.016.\n(a) Write down the hypotheses.\n(b) State the degrees of freedom for a 2 × 2 table.\n(c) State the conclusion, with a reason.', ['A1 H₀: sport preference is independent of gender', 'A1 H₁: sport preference is not independent of gender', 'A1 df = 1', 'R1 p = 0.016 < 0.05, so reject H₀: there is evidence of an association']],
        ['A die is rolled 60 times: 1 → 8, 2 → 12, 3 → 9, 4 → 11, 5 → 6, 6 → 14.\n(a) State the expected frequency for each score if the die is fair.\n(b) Calculate χ².\n(c) Given the critical value 11.07 at 5% with 5 df, state the conclusion.', ['A1 10', 'M1 Σ (O − E)²/E', 'A1 χ² = 4.2', 'R1 4.2 < 11.07: do not reject H₀; no evidence the die is biased']],
      ],
    },
    // Unit 3: Introductory calculus
    3: {
      m: [
        ['Find dy/dx when y = 5x³ − 2x.', ['15x² − 2', '5x² − 2', '15x³ − 2', '15x²'], 0, 'Differentiate term by term.'],
        ['Find the gradient of y = x² − 3x + 1 at x = 4.', ['5', '4', '8', '1'], 0, 'dy/dx = 2x − 3 = 5.'],
        ['Find the x-coordinate of the stationary point of y = x² − 6x + 2.', ['6', '3', '−3', '2'], 1, '2x − 6 = 0.'],
        ['If dy/dx < 0 on an interval, then y is', ['increasing', 'decreasing', 'constant', 'at a maximum'], 1, 'A negative gradient means decreasing.'],
        ['Find ∫ (4x³ + 2) dx.', ['x⁴ + 2x + C', '12x² + C', '4x⁴ + 2x + C', 'x⁴ + C'], 0, 'Integrate term by term.'],
        ['Evaluate ∫ from 0 to 3 of (x² + 1) dx.', ['9', '12', '10', '27'], 1, '[x³/3 + x] from 0 to 3 = 9 + 3.'],
        ['The trapezoidal rule with 3 strips (h = 1) for y = x² + 1 from 0 to 3 gives', ['12', '12.5', '11.5', '13'], 1, '½ × 1 × (1 + 10 + 2(2 + 5)) = 12.5.'],
        ['For y = x² + 1, the trapezoidal rule gives an overestimate because the curve is', ['concave down', 'concave up', 'linear', 'decreasing'], 1, 'The straight tops of the trapezoids lie above the curve.'],
        ['The cost of making x items is C(x) = x² − 40x + 500. Find the number of items for minimum cost.', ['40', '20', '500', '10'], 1, 'C′(x) = 2x − 40 = 0.'],
        ['The normal to a curve at a point is', ['parallel to the tangent', 'perpendicular to the tangent', 'the x-axis', 'the same as the tangent'], 1, 'Its gradient is −1/(gradient of tangent).'],
      ],
      w: [
        ['A farmer has 100 m of fence to make a rectangular pen against a wall (only three sides need fence). The side perpendicular to the wall is x m.\n(a) Show that the area is A = x(100 − 2x).\n(b) Find the value of x that maximises the area.\n(c) Find the maximum area.', ['A1 the side parallel to the wall is 100 − 2x', 'M1 dA/dx = 100 − 4x = 0', 'A1 x = 25 m', 'A1 A = 1250 m²']],
        ['Consider y = x³ − 3x² + 2.\n(a) Find dy/dx.\n(b) Find the equation of the tangent at x = 1.\n(c) Find the coordinates of the stationary points.', ['A1 3x² − 6x', 'A1 point (1, 0), gradient −3', 'A1 y = −3x + 3', 'A1 (0, 2) and (2, −2)']],
      ],
    },
  },
};
