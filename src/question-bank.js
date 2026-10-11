// Hand-written, checked question bank. MCQ: [question, [A,B,C,D], correctIndex, explanation]. Written: [question, [mark-scheme points]]
module.exports={
M1:{m:[
["y is directly proportional to x. y = 12 when x = 3. Find k.",["4","36","1/4","15"],0,"y = kx → 12 = 3k → k = 4, so y = 4x."],
["y ∝ x and y = 12 when x = 3. Find y when x = 10.",["30","40","120","13"],1,"k = 4, so y = 4 × 10 = 40."],
["y is inversely proportional to x. y = 6 when x = 4. Find k.",["24","1.5","10","2/3"],0,"y = k/x → 6 = k/4 → k = 24."],
["y = 24/x. Find y when x = 8.",["3","192","16","1/3"],0,"y = 24 ÷ 8 = 3."],
["y ∝ x². y = 18 when x = 3. Find y when x = 5.",["30","50","25","10"],1,"18 = k × 9 → k = 2. y = 2 × 25 = 50."],
["Which equation shows inverse proportion?",["y = 5x","y = 5/x","y = x + 5","y = 5x²"],1,"Inverse proportion has the form y = k/x."],
["y ∝ x. If x doubles, what happens to y?",["Halves","Stays the same","Doubles","Multiplies by 4"],2,"y = kx, so doubling x doubles y."],
["y ∝ 1/x. If x is tripled, what happens to y?",["It is divided by 3","It is multiplied by 3","It is divided by 9","No change"],0,"y = k/x, so tripling x makes y one third as big."]
],w:[
["5 workers take 12 days to build a wall. How long would 8 workers take at the same rate? Show your method.",["Recognises inverse proportion (more workers → fewer days)","Total work = 5 × 12 = 60 worker-days (k = 60)","60 ÷ 8 = 7.5 days"]],
["The cost C (AED) of fabric is directly proportional to its length L (m). 4 m costs 26 AED.\n(a) Write a formula for C in terms of L.\n(b) Find the cost of 7 m.\n(c) What length costs 91 AED?",["k = 26 ÷ 4 = 6.5, so C = 6.5L","(b) 6.5 × 7 = 45.5 AED","(c) 91 ÷ 6.5 = 14 m"]],
["y is inversely proportional to x². y = 5 when x = 2.\n(a) Find a formula for y.\n(b) Find y when x = 5.\n(c) Find x when y = 20 (x > 0).",["Writes y = k/x²","k = 5 × 4 = 20, so y = 20/x²","(b) y = 20/25 = 0.8","(c) 20/x² = 20 → x = 1"]]
]},
M2:{m:[
["What does the graph of y ∝ x look like?",["A curve through the origin","A straight line through the origin","A horizontal line","A straight line not through the origin"],1,"Direct proportion is a straight line through (0, 0) with gradient k."],
["What does the graph of y ∝ 1/x look like (x > 0)?",["A straight line down to the x-axis","A curve that gets closer to both axes but never touches them","A U-shaped parabola","A horizontal line"],1,"The inverse proportion graph is a hyperbola: as x grows, y shrinks toward 0."],
["x: 1, 2, 3, 4 and y: 5, 10, 15, 20. What is the relationship?",["Direct proportion","Inverse proportion","Neither","Quadratic"],0,"y ÷ x = 5 every time, so y = 5x."],
["x: 1, 2, 4, 8 and y: 16, 8, 4, 2. What is the relationship?",["Direct proportion","Inverse proportion","Neither","Linear"],1,"x × y = 16 every time, so y = 16/x."],
["x: 2, 4, 6 and y: 5, 9, 13. What is the relationship?",["Direct proportion","Inverse proportion","Linear but not proportional","Quadratic"],2,"y ÷ x is not constant (2.5, 2.25, 2.17). It is a straight line (y = 2x + 1) but does not pass through the origin."],
["A direct proportion graph passes through (0, 0) and (4, 10). What is k?",["2.5","0.4","40","6"],0,"k = gradient = 10 ÷ 4 = 2.5."],
["Which point lies on the graph of y = 12/x?",["(3, 4)","(4, 4)","(6, 3)","(12, 12)"],0,"3 × 4 = 12 ✓. For the others x × y ≠ 12."],
["How can you test a table of values for inverse proportion?",["Check y ÷ x is constant","Check x × y is constant","Check y − x is constant","Check y increases"],1,"For y = k/x, x × y = k for every pair."]
],w:[
["x: 2, 5, 8 and y: 7, 17.5, 28.\nShow that y is directly proportional to x and find the equation.",["Calculates y ÷ x for each pair","Shows it equals 3.5 every time","Writes y = 3.5x"]],
["A journey is 120 km. At 60 km/h it takes 2 hours.\n(a) Explain why time t is inversely proportional to speed s.\n(b) Write an equation for t.\n(c) Find t at 80 km/h.",["Faster speed → less time; s × t is always 120","t = 120/s","t = 120 ÷ 80 = 1.5 hours"]],
["Describe the graphs of direct and inverse proportion and explain how to tell them apart.",["Direct: straight line through the origin","Inverse: curve that never touches the axes","Direct: y increases as x increases; inverse: y decreases as x increases"]]
]},
M3:{m:[
["Factorise x² + 5x + 6",["(x + 1)(x + 6)","(x + 2)(x + 3)","(x − 2)(x − 3)","(x + 5)(x + 1)"],1,"Two numbers that multiply to 6 and add to 5: 2 and 3."],
["Factorise x² − 7x + 12",["(x − 3)(x − 4)","(x + 3)(x + 4)","(x − 2)(x − 6)","(x − 12)(x + 1)"],0,"Multiply to +12, add to −7: −3 and −4."],
["Factorise x² + 2x − 15",["(x − 5)(x + 3)","(x + 5)(x − 3)","(x + 15)(x − 1)","(x − 15)(x + 1)"],1,"Multiply to −15, add to +2: +5 and −3."],
["Factorise x² − x − 20",["(x − 5)(x + 4)","(x + 5)(x − 4)","(x − 10)(x + 2)","(x − 20)(x + 1)"],0,"Multiply to −20, add to −1: −5 and +4."],
["Factorise x² − 49",["(x − 7)²","(x − 7)(x + 7)","(x + 7)²","x(x − 49)"],1,"Difference of two squares: a² − b² = (a − b)(a + b)."],
["Factorise 4x² − 9",["(4x − 3)(x + 3)","(2x − 3)(2x + 3)","(2x − 9)(2x + 1)","(4x − 9)(x + 1)"],1,"4x² = (2x)² and 9 = 3², so (2x − 3)(2x + 3)."],
["Solve x² − 5x = 0",["x = 5 only","x = 0 or x = 5","x = 0 or x = −5","x = √5"],1,"x(x − 5) = 0, so x = 0 or x = 5. Never divide by x — you lose the x = 0 solution."],
["Solve x² + x − 12 = 0",["x = 3 or x = −4","x = −3 or x = 4","x = 2 or x = −6","x = 12 or x = −1"],0,"(x + 4)(x − 3) = 0, so x = −4 or x = 3."]
],w:[
["Factorise fully 2x² − 18.",["Takes out the common factor: 2(x² − 9)","Spots difference of two squares","Final answer 2(x − 3)(x + 3)"]],
["Solve x² − 3x − 28 = 0 by factorising. Show your working.",["(x − 7)(x + 4) = 0","x = 7","x = −4"]],
["A rectangle has length (x + 5) cm and width (x − 2) cm. Its area is 30 cm².\nShow that x² + 3x − 40 = 0 and find the width.",["Expands: (x + 5)(x − 2) = x² + 3x − 10","Sets equal to 30 and rearranges to x² + 3x − 40 = 0","Factorises: (x + 8)(x − 5) = 0","Rejects x = −8 (width can't be negative); x = 5 so width = 3 cm"]]
]},
M4:{m:[
["Factorise 2x² + 7x + 3",["(2x + 1)(x + 3)","(2x + 3)(x + 1)","(x + 7)(2x + 3)","(2x − 1)(x − 3)"],0,"Check: (2x + 1)(x + 3) = 2x² + 6x + x + 3 = 2x² + 7x + 3 ✓"],
["Factorise 3x² − 10x + 8",["(3x − 2)(x − 4)","(3x − 4)(x − 2)","(3x + 4)(x + 2)","(3x − 8)(x − 1)"],1,"(3x − 4)(x − 2) = 3x² − 6x − 4x + 8 ✓"],
["Factorise 2x² + x − 6",["(2x + 3)(x − 2)","(2x − 3)(x + 2)","(2x − 2)(x + 3)","(2x + 6)(x − 1)"],1,"(2x − 3)(x + 2) = 2x² + 4x − 3x − 6 ✓"],
["Factorise 6x² + x − 2",["(3x + 2)(2x − 1)","(3x − 2)(2x + 1)","(6x − 1)(x + 2)","(2x + 2)(3x − 1)"],0,"(3x + 2)(2x − 1) = 6x² − 3x + 4x − 2 ✓"],
["Factorise 5x² − 13x − 6",["(5x − 2)(x + 3)","(5x + 2)(x − 3)","(5x + 3)(x − 2)","(5x − 3)(x + 2)"],1,"(5x + 2)(x − 3) = 5x² − 15x + 2x − 6 ✓"],
["Using the ac method on 2x² + 7x + 3, you need two numbers that…",["multiply to 3 and add to 7","multiply to 6 and add to 7","multiply to 7 and add to 6","multiply to 2 and add to 3"],1,"a × c = 2 × 3 = 6, and they must add to b = 7 (here 6 and 1)."],
["Solve 2x² − 5x − 3 = 0",["x = 3 or x = −1/2","x = −3 or x = 1/2","x = 3 or x = 1/2","x = 1 or x = −3/2"],0,"(2x + 1)(x − 3) = 0 → x = −1/2 or x = 3."],
["Factorise 9x² − 25",["(9x − 5)(x + 5)","(3x − 5)(3x + 5)","(3x − 5)²","(9x − 25)(x + 1)"],1,"Difference of two squares: (3x)² − 5²."]
],w:[
["Factorise 4x² − 4x − 15. Show your method.",["ac = −60; finds −10 and +6","Splits and groups: 2x(2x − 5) + 3(2x − 5)","Answer (2x + 3)(2x − 5)"]],
["Solve 3x² + 11x − 4 = 0 by factorising.",["(3x − 1)(x + 4) = 0","x = 1/3","x = −4"]],
["Factorise fully 12x² − 27.",["Common factor: 3(4x² − 9)","Difference of two squares","Answer 3(2x − 3)(2x + 3)"]]
]},
M5:{m:[
["Which is the quadratic formula for ax² + bx + c = 0?",["x = (−b ± √(b² − 4ac)) / 2a","x = (b ± √(b² − 4ac)) / 2a","x = (−b ± √(b² + 4ac)) / 2a","x = −b ± √(b² − 4ac) / 2"],0,"Learn it exactly: x = (−b ± √(b² − 4ac)) / 2a."],
["For 2x² + 3x − 5 = 0, what are a, b and c?",["2, 3, 5","2, 3, −5","3, 2, −5","2, −3, 5"],1,"Keep the signs: a = 2, b = 3, c = −5."],
["What is the discriminant of x² + 4x + 1?",["12","20","8","−12"],0,"b² − 4ac = 16 − 4 = 12."],
["If b² − 4ac < 0, the equation has…",["two real roots","one repeated root","no real roots","infinitely many roots"],2,"You cannot square-root a negative number, so there are no real roots. The graph doesn't cross the x-axis."],
["If b² − 4ac = 0, the equation has…",["two different real roots","one repeated root","no real roots","three roots"],1,"± 0 gives the same answer twice, so the graph just touches the x-axis."],
["How many real roots does x² − 6x + 9 = 0 have?",["0","1 (repeated)","2","3"],1,"Δ = 36 − 36 = 0. It is (x − 3)²."],
["Solve x² + 2x − 4 = 0 to 2 d.p.",["1.24 and −3.24","2.24 and −2.24","−1.24 and 3.24","1.00 and −4.00"],0,"x = (−2 ± √20) / 2 = −1 ± √5 → 1.24 or −3.24."],
["kx² + 4x + 1 = 0 has equal roots. Find k.",["k = 2","k = 4","k = 16","k = 1/4"],1,"Equal roots → 16 − 4k = 0 → k = 4."]
],w:[
["Solve 2x² − 3x − 4 = 0, giving answers to 2 decimal places.",["Substitutes a = 2, b = −3, c = −4 correctly","Discriminant = 9 + 32 = 41","x = (3 ± √41)/4 → x = 2.35 and x = −0.85"]],
["Use the discriminant to find how many real roots 3x² − 2x + 5 = 0 has. Explain what this means for the graph.",["b² − 4ac = 4 − 60","= −56, which is negative","No real roots: the graph does not cross the x-axis"]],
["Find the values of p for which x² + px + 9 = 0 has one repeated root.",["Sets the discriminant equal to 0","p² − 36 = 0","p = 6 or p = −6"]]
]},
M6:{m:[
["What is the vertex of y = (x − 3)² + 2?",["(3, 2)","(−3, 2)","(3, −2)","(2, 3)"],0,"Vertex form y = (x − h)² + k has vertex (h, k)."],
["What is the axis of symmetry of y = x² − 6x + 5?",["x = 6","x = 3","x = −3","x = 5"],1,"x = −b/2a = 6/2 = 3."],
["What is the vertex of y = (x + 1)² − 4?",["(1, −4)","(−1, −4)","(−1, 4)","(1, 4)"],1,"(x + 1) = (x − (−1)), so h = −1."],
["Complete the square: x² + 8x + 10",["(x + 4)² − 6","(x + 4)² + 10","(x + 8)² − 54","(x + 4)² − 16"],0,"(x + 4)² = x² + 8x + 16, so subtract 6 to get +10."],
["What are the roots of y = (x − 2)(x + 5)?",["2 and 5","−2 and 5","2 and −5","−2 and −5"],2,"Set each bracket to 0: x = 2, x = −5."],
["What is the y-intercept of y = 2x² − 3x + 7?",["2","−3","7","0"],2,"Put x = 0: y = 7. In standard form the y-intercept is c."],
["What is the axis of symmetry of y = (x − 1)(x − 7)?",["x = 1","x = 7","x = 4","x = −4"],2,"Halfway between the roots: (1 + 7)/2 = 4."],
["y = −(x − 2)² + 5 has…",["a minimum at (2, 5)","a maximum at (2, 5)","a maximum at (−2, 5)","a minimum at (−2, −5)"],1,"The negative in front makes it open downward, so the vertex is a maximum."]
],w:[
["For y = x² − 4x − 5:\n(a) Write it in vertex form and state the vertex.\n(b) Write it in factored form and state the roots.\n(c) State the y-intercept.",["Vertex form (x − 2)² − 9","Vertex (2, −9)","Factored form (x − 5)(x + 1), roots 5 and −1","y-intercept −5"]],
["Find the equation of the quadratic that passes through (0, 3), (1, 0) and (3, 0).",["Uses roots: y = a(x − 1)(x − 3)","Substitutes (0, 3): 3a = 3, so a = 1","y = x² − 4x + 3"]],
["Write y = 2x² + 12x + 7 in vertex form and state the vertex. Is it a maximum or minimum?",["Factors out 2: 2(x² + 6x) + 7","2(x + 3)² − 11","Vertex (−3, −11), a minimum because a > 0"]]
]},
M7:{m:[
["A ball's height is h = −5t² + 20t. At what time is it highest?",["t = 1 s","t = 2 s","t = 4 s","t = 20 s"],1,"t = −b/2a = −20/(−10) = 2 s."],
["For h = −5t² + 20t, what is the maximum height?",["10 m","20 m","40 m","4 m"],1,"h(2) = −20 + 40 = 20 m."],
["For h = −5t² + 20t, when does the ball land (t > 0)?",["t = 2 s","t = 4 s","t = 5 s","t = 20 s"],1,"−5t(t − 4) = 0, so t = 4 s."],
["A rectangle has perimeter 20 m. What is the largest possible area?",["20 m²","24 m²","25 m²","100 m²"],2,"A = x(10 − x), maximum at x = 5: a 5 × 5 square gives 25 m²."],
["Profit P = −x² + 40x − 300. Which x gives maximum profit?",["x = 10","x = 20","x = 30","x = 40"],1,"x = −b/2a = −40/(−2) = 20."],
["For P = −x² + 40x − 300, what is the maximum profit?",["100","300","400","20"],0,"P(20) = −400 + 800 − 300 = 100."],
["A parabola with a negative x² coefficient has a…",["minimum point","maximum point","no turning point","vertical line of symmetry only"],1,"It opens downward, so its vertex is the highest point."],
["Revenue R = x(100 − 2x). Which x gives maximum revenue?",["x = 25","x = 50","x = 100","x = 20"],0,"R = 100x − 2x², maximum at x = 100/4 = 25."]
],w:[
["A farmer has 40 m of fencing to make a rectangle against a wall (fence on 3 sides only). The width is x m.\nShow that the area is A = x(40 − 2x) and find the maximum area.",["Length = 40 − 2x, so A = x(40 − 2x) = 40x − 2x²","Maximum at x = 10 (from −b/2a or vertex)","Maximum area = 10 × 20 = 200 m²","States it is a maximum because the x² coefficient is negative"]],
["A ball's height is h = −4.9t² + 14.7t + 2.\nFind the time of maximum height and the maximum height.",["t = −14.7/(2 × −4.9)","t = 1.5 s","h = −4.9(2.25) + 14.7(1.5) + 2 ≈ 13.0 m (with units)"]],
["An arch is 10 m wide at the ground and 4 m high in the middle. Find a quadratic model y = ax(x − 10) for the arch.",["Chooses roots at x = 0 and x = 10","Uses the vertex (5, 4): 4 = a × 5 × (−5)","a = −0.16","y = −0.16x(x − 10)"]]
]},
P1:{m:[
["What is the difference between distance and displacement?",["Displacement has a direction; distance does not","Distance has a direction; displacement does not","They are the same","Displacement is always bigger"],0,"Displacement is a vector (size + direction). Distance is a scalar."],
["You walk 3 km east then 3 km west. What are your distance and displacement?",["6 km and 6 km","6 km and 0 km","0 km and 6 km","3 km and 3 km"],1,"Distance counts all the path (6 km). You end where you started, so displacement is 0."],
["A runner covers 100 m in 20 s. What is the average speed?",["2000 m/s","0.2 m/s","5 m/s","120 m/s"],2,"speed = distance ÷ time = 100 ÷ 20 = 5 m/s."],
["How is velocity different from speed?",["Velocity includes direction","Velocity is always larger","Velocity has no units","Velocity is only for cars"],0,"Velocity is speed in a given direction."],
["A car goes from 0 to 20 m/s in 5 s. What is its acceleration?",["100 m/s²","4 m/s²","0.25 m/s²","25 m/s²"],1,"a = (v − u)/t = (20 − 0)/5 = 4 m/s²."],
["What is the unit of acceleration?",["m/s","m/s²","m²/s","N"],1,"Change in velocity (m/s) per second → m/s²."],
["A car slows from 30 m/s to 10 m/s in 4 s. What is its acceleration?",["5 m/s²","−5 m/s²","10 m/s²","−10 m/s²"],1,"a = (10 − 30)/4 = −5 m/s². Negative means it is slowing down."],
["From rest, a = 2 m/s² over 25 m. Find the final speed using v² = u² + 2as.",["50 m/s","10 m/s","100 m/s","7 m/s"],1,"v² = 0 + 2 × 2 × 25 = 100, so v = 10 m/s."]
],w:[
["A runner completes one 400 m lap of a track in 80 s.\nCalculate the average speed and the displacement, and explain why they are different.",["Speed = 400 ÷ 80 = 5 m/s","Displacement = 0 m","Displacement is the straight-line change in position; the runner finishes where they started"]],
["A cyclist accelerates uniformly from 4 m/s to 10 m/s in 3 s.\n(a) Calculate the acceleration.\n(b) Use v² = u² + 2as to find the distance covered.",["a = (10 − 4)/3","a = 2 m/s²","100 = 16 + 2 × 2 × s","s = 21 m"]],
["A car travelling at 25 m/s brakes with a deceleration of 5 m/s² until it stops.\nCalculate the time taken and the braking distance.",["t = 25 ÷ 5 = 5 s","Uses 0 = 25² − 2 × 5 × s","s = 62.5 m (with units)"]]
]},
P2:{m:[
["On a distance–time graph, the gradient shows…",["acceleration","speed","distance","force"],1,"Gradient = distance ÷ time = speed."],
["A horizontal line on a distance–time graph means the object is…",["moving at constant speed","accelerating","stationary","decelerating"],2,"Distance isn't changing, so it isn't moving."],
["A horizontal line on a velocity–time graph means…",["stationary","constant velocity","constant acceleration","slowing down"],1,"Velocity isn't changing, so acceleration is zero."],
["The gradient of a velocity–time graph gives…",["distance","speed","acceleration","time"],2,"Gradient = change in velocity ÷ time = acceleration."],
["The area under a velocity–time graph gives…",["acceleration","distance travelled","force","speed"],1,"velocity × time = distance."],
["A v–t graph rises from 0 to 12 m/s in 4 s. What is the acceleration?",["48 m/s²","3 m/s²","0.33 m/s²","16 m/s²"],1,"12 ÷ 4 = 3 m/s²."],
["An object moves at a constant 10 m/s for 6 s. Distance travelled?",["16 m","60 m","1.67 m","600 m"],1,"Area of rectangle = 10 × 6 = 60 m."],
["A distance–time line that curves upward, getting steeper, shows…",["constant speed","slowing down","speeding up","stationary"],2,"A steeper gradient means a higher speed, so it is accelerating."]
],w:[
["A car accelerates from 0 to 20 m/s in 10 s, travels at 20 m/s for 15 s, then decelerates to rest in 5 s.\n(a) Find the acceleration in the first 10 s.\n(b) Find the total distance travelled.",["a = 20 ÷ 10 = 2 m/s²","First stage area: ½ × 10 × 20 = 100 m","Middle: 20 × 15 = 300 m; last: ½ × 5 × 20 = 50 m","Total distance = 450 m"]],
["A distance–time graph shows: a straight line from 0 m to 50 m over 0–10 s, flat from 10–20 s, then a straight line back to 0 m at 30 s.\nDescribe the motion fully, including speeds.",["0–10 s: constant speed of 5 m/s away from the start","10–20 s: stationary","20–30 s: returns to the start at constant 5 m/s"]],
["Explain how you would find the speed at one instant from a curved distance–time graph.",["Draw a tangent to the curve at that time","Find the gradient of the tangent (rise ÷ run)","That gradient is the instantaneous speed (with units)"]]
]},
P3:{m:[
["Stopping distance = …",["thinking distance + braking distance","thinking distance − braking distance","speed × time","braking distance only"],0,"The car travels during the reaction time and then while braking."],
["Which factor increases thinking distance?",["Icy road","Worn tyres","Driver using a phone","Worn brakes"],2,"Thinking distance depends on reaction time and speed. Distraction increases reaction time."],
["Which factor increases braking distance?",["Tiredness","Alcohol","Icy road","Loud music"],2,"Braking depends on the car and road: less friction means a longer braking distance."],
["If speed doubles, thinking distance…",["stays the same","doubles","is multiplied by 4","halves"],1,"Thinking distance = speed × reaction time, so it is directly proportional to speed."],
["If speed doubles, braking distance is multiplied by…",["2","3","4","8"],2,"Kinetic energy ∝ v², so double the speed means 4 times the energy to remove."],
["Reaction time 0.7 s at 20 m/s. What is the thinking distance?",["28.6 m","14 m","20.7 m","1.4 m"],1,"20 × 0.7 = 14 m."],
["Which does NOT affect braking distance?",["Speed","Road surface","Driver tiredness","Mass of the car"],2,"Tiredness affects reaction time, which is thinking distance."],
["Why does a wet road increase braking distance?",["Less friction between tyres and road","More air resistance","The driver reacts slower","The car is heavier"],0,"Less friction means a smaller braking force, so it takes longer to stop."]
],w:[
["A car travels at 30 m/s. The driver's reaction time is 0.6 s and the braking distance is 75 m.\nCalculate the thinking distance and the stopping distance.",["Thinking distance = 30 × 0.6","= 18 m","Stopping distance = 18 + 75 = 93 m"]],
["Explain why using a phone while driving increases the stopping distance but not the braking distance.",["The driver is distracted so reaction time increases","Thinking distance = speed × reaction time, so it increases","Braking distance depends on the car and road, which haven't changed"]],
["Explain why braking distance increases by a factor of 4 when speed doubles.",["Kinetic energy = ½mv²","Doubling v makes the kinetic energy 4 times larger","Work done by brakes = force × distance; with the same braking force the distance must be 4 times larger"]]
]},
P4:{m:[
["Which of these is a vector?",["Mass","Speed","Force","Energy"],2,"Force has a size and a direction."],
["Forces of 10 N right and 4 N left act on a box. What is the resultant force?",["14 N right","6 N right","6 N left","40 N"],1,"Opposite directions subtract: 10 − 4 = 6 N in the direction of the bigger force."],
["Newton's first law says an object…",["always slows down","stays at rest or at constant velocity unless a resultant force acts","accelerates when forces are balanced","moves in a circle"],1,"No resultant force means no change in motion."],
["A 1200 kg car accelerates at 2 m/s². What resultant force acts on it?",["600 N","2400 N","1202 N","24 000 N"],1,"F = ma = 1200 × 2 = 2400 N."],
["Newton's third law pairs of forces are…",["equal and opposite, acting on the same object","equal and opposite, acting on different objects","unequal and in the same direction","only gravitational"],1,"If A pushes B, B pushes A with an equal and opposite force."],
["A car moves at a steady speed in a straight line. The resultant force is…",["forward","backward","zero","equal to its weight"],2,"Constant velocity means zero acceleration, so the forces are balanced."],
["What is the weight of a 50 kg person (g = 10 N/kg)?",["5 N","50 N","500 N","5000 N"],2,"W = mg = 50 × 10 = 500 N."],
["A 20 N resultant force acts on a 4 kg mass. What is the acceleration?",["80 m/s²","5 m/s²","0.2 m/s²","24 m/s²"],1,"a = F/m = 20/4 = 5 m/s²."]
],w:[
["A 6 kg box is pushed with 50 N across the floor. Friction is 20 N.\nName all four forces on the box (free body diagram) and calculate its acceleration.",["Names push, friction, weight and normal reaction force","Resultant force = 50 − 20 = 30 N","a = 30 ÷ 6 = 5 m/s²"]],
["Use Newton's third law to explain how a rocket accelerates upward.",["The rocket pushes exhaust gas downward","The gas pushes the rocket upward with an equal force","The forces are opposite in direction and act on different objects"]],
["Forces of 3 N east and 4 N north act on an object. Find the size and direction of the resultant force.",["Uses Pythagoras: √(3² + 4²)","Resultant = 5 N","Direction: tan⁻¹(4/3) ≈ 53° north of east"]]
]},
P5:{m:[
["What is the momentum of a 2 kg ball moving at 3 m/s?",["1.5 kg m/s","5 kg m/s","6 kg m/s","9 kg m/s"],2,"p = mv = 2 × 3 = 6 kg m/s."],
["What is the unit of momentum?",["N","kg m/s","m/s²","J"],1,"mass (kg) × velocity (m/s)."],
["The principle of conservation of momentum says…",["momentum is always zero","total momentum before = total momentum after (in a closed system)","momentum is lost in collisions","momentum equals kinetic energy"],1,"Momentum is conserved when no external forces act."],
["What is the momentum of a 1000 kg car at 20 m/s?",["50 kg m/s","1020 kg m/s","20 000 kg m/s","200 000 kg m/s"],2,"1000 × 20 = 20 000 kg m/s."],
["Force can be calculated from momentum using…",["F = p × t","F = Δp / t","F = p / m","F = mv²"],1,"Force = rate of change of momentum."],
["Airbags reduce the force on a passenger by…",["reducing the change in momentum","increasing the time taken to stop","increasing the passenger's speed","reducing the passenger's mass"],1,"The same Δp over a longer time means a smaller force."],
["An 800 kg car stops from 15 m/s in 0.1 s. What is the average force?",["1200 N","12 000 N","120 000 N","120 N"],2,"Δp = 800 × 15 = 12 000; F = 12 000 ÷ 0.1 = 120 000 N."],
["Crumple zones make cars safer because they…",["make the car lighter","crumple to increase collision time and reduce force","stop the car from moving","increase momentum"],1,"Longer stopping time → smaller force on the people inside."]
],w:[
["A 2 kg trolley moving at 3 m/s hits a stationary 1 kg trolley and they stick together. Calculate their velocity after the collision.",["Momentum before = 2 × 3 = 6 kg m/s","Momentum after = (2 + 1) × v","v = 2 m/s"]],
["Explain how a seat belt reduces injuries in a crash.",["The belt stretches, so the passenger takes longer to stop","The change in momentum is the same","F = Δp/t, so a longer time gives a smaller force on the passenger"]],
["A 70 kg passenger slows from 20 m/s to rest.\n(a) Calculate the change in momentum.\n(b) Calculate the force if this takes 0.05 s.\n(c) Calculate the force if an airbag makes it take 0.5 s.",["Δp = 70 × 20 = 1400 kg m/s","(b) F = 1400 ÷ 0.05 = 28 000 N","(c) F = 1400 ÷ 0.5 = 2800 N"]]
]},
P6:{m:[
["At terminal velocity, the resultant force on a falling object is…",["equal to its weight","zero","increasing","upward"],1,"Weight = air resistance, so forces are balanced."],
["As a skydiver speeds up, air resistance…",["decreases","stays the same","increases","disappears"],2,"Drag increases with speed."],
["When a parachute opens, the skydiver…",["speeds up","slows down to a new, lower terminal velocity","stops in mid-air","keeps the same speed"],1,"Drag suddenly becomes bigger than weight, so the skydiver decelerates."],
["The moment of a force equals…",["force + distance","force × perpendicular distance from the pivot","force ÷ distance","mass × distance"],1,"M = F × d."],
["A 20 N force acts 0.5 m from a pivot. What is the moment?",["40 Nm","10 Nm","20.5 Nm","0.025 Nm"],1,"20 × 0.5 = 10 Nm."],
["What is the unit of a moment?",["N","N/m","Nm","J/s"],2,"Newton × metre = Nm."],
["A 300 N child sits 2 m from the pivot of a seesaw. Where must a 400 N child sit to balance?",["1.5 m","2.7 m","1 m","3 m"],0,"300 × 2 = 400 × d → d = 1.5 m."],
["Why is a long spanner easier to use?",["It is heavier","A larger distance gives a larger moment for the same force","It reduces friction","It increases the force"],1,"Moment = F × d, so more distance means less force is needed."]
],w:[
["Describe and explain the motion of a skydiver from jumping out of the plane to landing with a parachute.",["At first weight > air resistance, so she accelerates","Air resistance increases with speed until it equals weight → terminal velocity","When the parachute opens, air resistance > weight, so she slows down","Air resistance falls until it equals weight again → new, lower terminal velocity"]],
["A uniform beam is balanced at its centre. A 6 N weight hangs 30 cm to the left. What force 45 cm to the right will balance it?",["Uses the principle of moments: clockwise = anticlockwise","6 × 0.30 = 1.8 Nm","F = 1.8 ÷ 0.45 = 4 N"]],
["Explain why door handles are placed far from the hinges.",["Moment = force × perpendicular distance","A larger distance from the hinge (pivot)","So less force is needed to open the door"]]
]},
P7:{m:[
["Hooke's law states that…",["F = ma","F = kx (force is proportional to extension)","F = mg","F = Δp/t"],1,"Up to the limit of proportionality, force ∝ extension."],
["A spring has k = 200 N/m and is stretched 0.05 m. What force is applied?",["4000 N","10 N","0.00025 N","250 N"],1,"F = kx = 200 × 0.05 = 10 N."],
["A 6 N force stretches a spring by 3 cm. What is k?",["2 N/m","18 N/m","200 N/m","0.5 N/m"],2,"Convert to metres: k = 6 ÷ 0.03 = 200 N/m."],
["What is the limit of proportionality?",["The point where the spring breaks","The point beyond which force is no longer proportional to extension","The original length","The maximum mass"],1,"Past it, the F–x graph starts to curve."],
["Below the limit of proportionality, a graph of force against extension is…",["a curve","a straight line through the origin","a horizontal line","a straight line not through the origin"],1,"F ∝ x gives a straight line through (0, 0)."],
["Extension is calculated as…",["new length + original length","new length − original length","new length × original length","original length only"],1,"Always subtract the original length."],
["A spring is 10 cm long. With a load it is 14 cm. What is the extension?",["24 cm","14 cm","4 cm","1.4 cm"],2,"14 − 10 = 4 cm."],
["Elastic deformation means the object…",["breaks","returns to its original shape when the force is removed","stays permanently stretched","gets heavier"],1,"Inelastic (plastic) deformation is when it stays stretched."]
],w:[
["A spring has k = 40 N/m and an original length of 12 cm. A 2 N load is added.\nCalculate the extension and the new length.",["x = F/k = 2/40","x = 0.05 m = 5 cm","New length = 12 + 5 = 17 cm"]],
["Force (N): 0, 1, 2, 3, 4, 5. Extension (cm): 0, 2, 4, 6, 8.5, 12.\nWhere does Hooke's law stop holding? Justify using the data, and find k.",["Up to 3 N the extension rises by 2 cm per newton (proportional)","At 4 N extension is 8.5 cm, not 8 cm, so the limit is passed between 3 N and 4 N","k = 1 N ÷ 0.02 m = 50 N/m"]],
["Describe a method to investigate Hooke's law for a spring.",["Measure the original length with a ruler","Add masses in equal steps and measure the new length each time (eye level)","Calculate extension = new length − original length","Plot force against extension and look for a straight line through the origin"]]
]},
C1:{m:[
["What are isotopes?",["Atoms of the same element with the same number of protons but different numbers of neutrons","Atoms of the same element with different numbers of protons","Atoms of different elements with the same mass number","Atoms that have gained or lost electrons"],0,"Isotopes are the same element, so protons stay the same. Only neutrons (and mass number) change. Option D describes ions."],
["How many neutrons are in ³⁷₁₇Cl?",["17","20","37","54"],1,"Neutrons = mass number − atomic number = 37 − 17 = 20."],
["How many electrons are in a neutral atom of ³⁵₁₇Cl?",["35","18","17","52"],2,"A neutral atom has electrons = protons = atomic number = 17."],
["Chlorine is 75% ³⁵Cl and 25% ³⁷Cl. What is its relative atomic mass?",["36.0","35.5","36.5","35.0"],1,"(75 × 35 + 25 × 37) ÷ 100 = 3550 ÷ 100 = 35.5"],
["Boron is 20% ¹⁰B and 80% ¹¹B. What is its relative atomic mass?",["10.2","10.5","10.8","11.0"],2,"(20 × 10 + 80 × 11) ÷ 100 = 10.8. Closer to 11 because ¹¹B is more common."],
["What is the relative charge and location of a neutron?",["+1, in the nucleus","0, in the nucleus","−1, in shells","0, in shells"],1,"Neutrons have no charge and sit in the nucleus with the protons."],
["What is the relative mass of an electron compared with a proton?",["The same (1)","About 2","Very small (about 1/1840)","Exactly half"],2,"Electrons are almost massless, which is why mass number counts only protons + neutrons."],
["The atomic number tells you the number of…",["neutrons","protons + neutrons","protons","outer electrons"],2,"Atomic number = number of protons. This defines the element."],
["What is the electron configuration of sodium (11)?",["2, 9","2, 8, 1","8, 2, 1","2, 2, 7"],1,"2 in the first shell, 8 in the second, 1 left over."],
["What is the electron configuration of calcium (20)?",["2, 8, 10","2, 8, 8, 2","2, 18","2, 8, 9, 1"],1,"For the first 20 elements the third shell holds 8 before the fourth starts."],
["What is the electron configuration of potassium (19)?",["2, 8, 9","2, 8, 8, 1","2, 9, 8","2, 8, 1, 8"],1,"2, 8, 8, then the last electron starts the fourth shell."],
["An element has the configuration 2, 8, 7. Which element is it?",["Fluorine","Argon","Chlorine","Sulfur"],2,"2 + 8 + 7 = 17 electrons → atomic number 17: chlorine."],
["Sulfur is 2, 8, 6. Where is it in the periodic table?",["Group 3, Period 6","Group 6, Period 3","Group 8, Period 2","Group 6, Period 2"],1,"Number of shells = period (3). Outer electrons = group (6)."],
["Why do elements in the same group have similar chemical properties?",["Same number of shells","Same mass number","Same number of outer electrons","Same number of neutrons"],2,"Reactions involve outer electrons."],
["Which of these is a compound?",["O₂","Fe","Air","H₂O"],3,"H₂O has two different elements chemically bonded. O₂ is an element; air is a mixture."],
["Which of these is a mixture?",["Sodium chloride","Air","Carbon dioxide","Copper"],1,"Air is several gases mixed but not chemically joined."],
["Magnesium (12) forms an ion. Which statement is correct?",["It gains 2 electrons to form Mg²⁻","It loses 2 electrons to form Mg²⁺","It loses 2 protons to form Mg²⁺","It gains 6 electrons to form Mg⁶⁻"],1,"Mg is 2, 8, 2 and loses the 2 outer electrons → 2, 8. Protons never change."],
["What charge do Group 1 elements form as ions?",["1−","1+","2+","They don't form ions"],1,"They lose their 1 outer electron → 1+."],
["What is the electron configuration of O²⁻? (O = 8)",["2, 6","2, 8","2, 4","2, 8, 2"],1,"Oxygen 2, 6 gains 2 electrons → 2, 8."],
["Which ion has the same electron configuration as neon (2, 8)?",["K⁺","Cl⁻","Na⁺","Ca²⁺"],2,"Na (2, 8, 1) loses 1 electron → 2, 8. The others are 2, 8, 8."],
["Aluminium chloride is made of Al³⁺ and Cl⁻. What is its formula?",["AlCl","Al₃Cl","AlCl₃","Al₂Cl₃"],2,"One Al³⁺ (+3) needs three Cl⁻ (−3)."],
["Sodium oxide is made of Na⁺ and O²⁻. What is its formula?",["NaO","NaO₂","Na₂O","Na₂O₂"],2,"Two Na⁺ (+2) cancel one O²⁻ (−2)."],
["Why do isotopes of the same element react in the same way?",["Same number of neutrons","Same electron configuration","Same mass","Same density"],1,"Reactions depend on electrons, which are the same."],
["Which equation for burning methane is balanced?",["CH₄ + O₂ → CO₂ + H₂O","CH₄ + 2O₂ → CO₂ + 2H₂O","CH₄ + 3O₂ → CO₂ + 2H₂O","2CH₄ + O₂ → CO₂ + 4H₂O"],1,"Each side: 1 C, 4 H, 4 O."],
["Balance Al + O₂ → Al₂O₃",["2Al + 3O₂ → Al₂O₃","4Al + 3O₂ → 2Al₂O₃","2Al + O₂ → Al₂O₃","4Al + 2O₂ → 2Al₂O₃"],1,"6 O on each side, then 4 Al on each side."]
],w:[
["Define the term isotope. Explain why ³⁵Cl and ³⁷Cl have the same chemical properties.",["Same number of protons / same element","Different number of neutrons","Same electron configuration, so they react the same way"]],
["Copper is 69% ⁶³Cu and 31% ⁶⁵Cu. Calculate the relative atomic mass of copper to 1 decimal place.",["Multiplies each mass by its abundance: 69 × 63 and 31 × 65","Adds and divides by 100: (4347 + 2015) ÷ 100","Answer: 63.6"]],
["Describe the structure of an atom of ²³₁₁Na. Include the number and position of each type of particle.",["11 protons and 12 neutrons in the nucleus","11 electrons in shells around the nucleus","Electron configuration 2, 8, 1"]],
["Magnesium (12) reacts with oxygen (8). Explain, in terms of electrons, how each atom becomes an ion.",["Mg (2, 8, 2) loses its 2 outer electrons","Forms Mg²⁺ (2, 8)","O (2, 6) gains 2 electrons","Forms O²⁻ (2, 8); both have full outer shells"]],
["Lithium and sodium react with water to make a hydroxide and hydrogen. Predict how potassium reacts with water and explain using its position in the periodic table.",["Also makes KOH and hydrogen because it has 1 outer electron (Group 1)","Reacts more vigorously than sodium","Its outer electron is further from the nucleus, so it is lost more easily"]],
["Balance:\n(a) Fe + O₂ → Fe₂O₃\n(b) C₃H₈ + O₂ → CO₂ + H₂O\n(c) Ca + HCl → CaCl₂ + H₂\n(d) N₂ + H₂ → NH₃",["(a) 4Fe + 3O₂ → 2Fe₂O₃","(b) C₃H₈ + 5O₂ → 3CO₂ + 4H₂O","(c) Ca + 2HCl → CaCl₂ + H₂","(d) N₂ + 3H₂ → 2NH₃"]],
["12 g of magnesium burns in 8 g of oxygen. What mass of magnesium oxide forms? Explain using conservation of mass.",["20 g","Atoms are not created or destroyed, only rearranged, so total mass stays the same"]],
["Explain the difference between an element, a compound and a mixture, with one example of each.",["Element: one type of atom (e.g. iron)","Compound: elements chemically bonded in a fixed ratio (e.g. water)","Mixture: not chemically joined, separable physically (e.g. air)"]],
["Describe one use of a radioactive isotope and explain why it is useful for it.",["Names a real use, e.g. carbon-14 dating, iodine-131 thyroid treatment, cobalt-60 sterilising, medical tracer","Explains why, e.g. radiation can be detected / kills cells or bacteria / decays at a known rate"]]
]},
C2:{m:[
["What is an ion?",["An atom that has gained or lost electrons","An atom that has gained or lost protons","A neutral atom","A molecule"],0,"Electrons move; protons never change in chemical reactions."],
["Metals form ions that are…",["negative","positive","neutral","sometimes either"],1,"Metals lose electrons, so they become positive."],
["Which ion does chlorine form?",["Cl⁺","Cl⁻","Cl²⁻","Cl⁷⁺"],1,"Chlorine (2, 8, 7) gains 1 electron → Cl⁻."],
["In sodium chloride, what happens to the electrons?",["They are shared","One electron transfers from Na to Cl","One electron transfers from Cl to Na","Two electrons transfer"],1,"Ionic bonding = electron transfer from metal to non-metal."],
["An ionic bond is…",["a shared pair of electrons","electrostatic attraction between oppositely charged ions","attraction between molecules","a sea of electrons"],1,"The + and − ions attract each other strongly."],
["What is the formula of calcium chloride?",["CaCl","CaCl₂","Ca₂Cl","CaCl₃"],1,"Ca²⁺ needs two Cl⁻."],
["What is the formula of magnesium oxide?",["MgO","MgO₂","Mg₂O","Mg₂O₃"],0,"Mg²⁺ and O²⁻ cancel 1:1."],
["What charge is the ion formed by a Group 6 element?",["6+","2+","2−","6−"],2,"6 outer electrons, gains 2 → 2−."]
],w:[
["Describe how sodium (11) and chlorine (17) form sodium chloride. Include electron configurations.",["Na (2, 8, 1) transfers 1 electron to Cl (2, 8, 7)","Na⁺ is 2, 8 and Cl⁻ is 2, 8, 8","Both have full outer shells","Oppositely charged ions attract: ionic bond"]],
["Lithium (3) reacts with oxygen (8). Give the formula of lithium oxide and explain it in terms of electrons.",["Each Li loses 1 electron → Li⁺","O gains 2 electrons → O²⁻","Two Li⁺ are needed per O²⁻, so Li₂O"]],
["Magnesium oxide melts at 2852 °C; sodium chloride melts at 801 °C. Explain the difference.",["Mg²⁺ and O²⁻ have higher charges than Na⁺ and Cl⁻","Stronger electrostatic attraction between the ions","More energy needed to overcome it → higher melting point"]]
]},
C3:{m:[
["A covalent bond is…",["a transfer of electrons","a shared pair of electrons","attraction between ions","a sea of electrons"],1,"Atoms share electrons to fill their outer shells."],
["Covalent bonds usually form between…",["two metals","a metal and a non-metal","two non-metals","noble gases"],2,"Non-metals share electrons."],
["How many covalent bonds are in a water molecule (H₂O)?",["1","2","3","4"],1,"Oxygen forms a single bond with each of the two hydrogens."],
["What type of bond is in an oxygen molecule (O₂)?",["Single","Double","Triple","Ionic"],1,"Each O needs 2 more electrons, so they share two pairs."],
["What type of bond is in a nitrogen molecule (N₂)?",["Single","Double","Triple","Metallic"],2,"Each N needs 3 more electrons → three shared pairs."],
["Why do simple molecular substances have low melting points?",["Covalent bonds are weak","Intermolecular forces are weak","They have no bonds","They are ionic"],1,"Melting only overcomes the weak forces between molecules, not the strong covalent bonds."],
["Why don't simple molecular substances conduct electricity?",["They have no charged particles that can move","Their bonds are too strong","They are too small","They are metals"],0,"No ions and no free electrons."],
["How many shared pairs of electrons are in methane (CH₄)?",["2","3","4","8"],2,"Carbon shares one pair with each of the four hydrogens."]
],w:[
["Describe the bonding in methane, CH₄ (as you would show in a dot-and-cross diagram).",["Carbon (2, 4) shares one electron pair with each of 4 hydrogen atoms","4 single covalent bonds","Carbon now has 8 outer electrons and each H has 2 (full shells)"]],
["Covalent bonds are strong, but water boils at only 100 °C. Explain why.",["Covalent bonds within each molecule are strong","Forces between molecules are weak","Boiling only overcomes the weak intermolecular forces, not the covalent bonds, so little energy is needed"]],
["Describe a fair test to find how temperature affects how much of a solid dissolves in water.",["Independent variable: temperature of the water","Dependent variable: mass of solid that dissolves","Control: same volume of water, same solid, same stirring","Repeat each temperature and calculate a mean"]]
]},
C4:{m:[
["A giant ionic lattice is…",["a regular arrangement of oppositely charged ions","a group of small molecules","layers of carbon atoms","a sea of electrons"],0,"Ions are held in a repeating 3D structure."],
["Ionic compounds conduct electricity when…",["solid","molten or dissolved","cold","never"],1,"The ions must be free to move."],
["Why doesn't solid sodium chloride conduct electricity?",["It has no ions","The ions are fixed in place","It has free electrons","It is a metal"],1,"Ions can't move in the solid lattice."],
["In diamond, each carbon atom is bonded to…",["2 others","3 others","4 others","6 others"],2,"4 strong covalent bonds in a rigid 3D structure."],
["In graphite, each carbon atom is bonded to…",["2 others","3 others","4 others","1 other"],1,"3 bonds in flat layers; the fourth electron is delocalised."],
["Why does graphite conduct electricity?",["It contains ions","It has delocalised electrons","It is a metal","It is soft"],1,"One electron per carbon is free to move through the layers."],
["Why is graphite soft and slippery?",["It has weak covalent bonds","Its layers have weak forces between them and can slide","It is ionic","It contains water"],1,"The bonds within layers are strong, but layers slide easily."],
["Which is an example of a giant covalent structure?",["NaCl","CO₂","SiO₂","H₂O"],2,"Silicon dioxide (sand) is a giant covalent lattice."]
],w:[
["Explain why sodium chloride has a high melting point.",["Giant ionic lattice","Strong electrostatic attraction between oppositely charged ions in all directions","A lot of energy is needed to overcome these forces"]],
["Compare the structures of diamond and graphite, and explain one property of each.",["Diamond: each C makes 4 covalent bonds in a rigid 3D lattice","So diamond is very hard (e.g. cutting tools)","Graphite: each C makes 3 bonds in layers with weak forces between them","So graphite is soft/slippery (e.g. lubricant, pencils)"]],
["Explain why graphite conducts electricity but diamond does not.",["In graphite each carbon has one delocalised electron","Delocalised electrons can move through the structure and carry charge","In diamond all 4 outer electrons are in bonds, so none are free"]]
]},
C5:{m:[
["Graphene is…",["a single layer of graphite","a type of diamond","a metal","a carbon cage of 60 atoms"],0,"One atom thick, each carbon bonded to 3 others."],
["What is the formula of buckminsterfullerene?",["C₆","C₂₀","C₆₀","C₁₀₀"],2,"A hollow sphere of 60 carbon atoms."],
["Fullerenes are…",["giant ionic lattices","hollow cages or tubes of carbon atoms","metals","simple sugars"],1,"They include spheres (C₆₀) and nanotubes."],
["Carbon nanotubes are useful because they…",["are very weak","have very high tensile strength and conduct electricity","are ionic","dissolve in water"],1,"Used to strengthen materials and in electronics."],
["Metallic bonding is…",["shared pairs of electrons","positive metal ions in a sea of delocalised electrons","attraction between + and − ions","weak forces between molecules"],1,"The electrons are free to move throughout the metal."],
["Metals conduct electricity because…",["they contain ions that move","delocalised electrons can move through the structure","they are shiny","they are hard"],1,"Moving electrons carry the charge."],
["Metals are malleable because…",["layers of ions can slide over each other","they have weak bonds","they are soft","they contain water"],0,"The sea of electrons keeps holding the layers together as they slide."],
["Why are alloys harder than pure metals?",["They are heavier","Different-sized atoms distort the layers so they can't slide easily","They have no electrons","They are ionic"],1,"Distorted layers resist sliding."]
],w:[
["Describe metallic bonding and explain why most metals have high melting points.",["Lattice of positive metal ions","Sea of delocalised electrons","Strong electrostatic attraction between the ions and the electrons","A lot of energy is needed to overcome it"]],
["Explain why metals are malleable and good electrical conductors.",["Layers of ions can slide over each other","Bonding is kept because the delocalised electrons move with them","Delocalised electrons move through the metal carrying charge"]],
["Describe the structure of graphene and explain two of its useful properties.",["A single layer of carbon atoms, each bonded to 3 others","Very strong because of the strong covalent bonds","Conducts electricity because of delocalised electrons"]]
]},
C6:{m:[
["Substance A melts at 801 °C and conducts only when molten or dissolved. Its structure is…",["simple molecular","giant ionic","giant covalent","metallic"],1,"High melting point + conducts only when ions can move = ionic."],
["Substance B melts at −183 °C and does not conduct. Its structure is…",["simple molecular","giant ionic","giant covalent","metallic"],0,"Very low melting point = weak intermolecular forces."],
["Substance C has a very high melting point, does not conduct and is insoluble. Its structure is…",["simple molecular","giant ionic","giant covalent","metallic"],2,"Like diamond or SiO₂: many strong covalent bonds, no free charges."],
["Substance D conducts as a solid and a liquid and is malleable. Its structure is…",["simple molecular","giant ionic","giant covalent","metallic"],3,"Delocalised electrons and sliding layers."],
["Why are ionic compounds brittle?",["Layers slide and like charges line up and repel","Their bonds are weak","They contain water","They have free electrons"],0,"A small shift puts + next to + and − next to −."],
["Sugar dissolves in water but the solution does not conduct. Why?",["Sugar is ionic","Sugar is made of molecules with no charge","The water is too cold","Sugar is a metal"],1,"No ions are released, so there is nothing to carry charge."],
["Which has the highest melting point?",["Oxygen","Water","Methane","Diamond"],3,"Diamond is giant covalent; the others are simple molecular."],
["Why is copper used for electrical wires?",["It is brittle","It conducts well and is ductile (can be drawn into wires)","It is ionic","It has a low melting point"],1,"Delocalised electrons + sliding layers."]
],w:[
["Substance X melts at 1700 °C, does not conduct as a solid or liquid and is insoluble in water.\nDeduce its structure and explain your answer.",["Giant covalent structure","Many strong covalent bonds must be broken → very high melting point","No free electrons or ions → does not conduct"]],
["Explain why ionic compounds conduct electricity when dissolved but sugar solution does not.",["In solution the ions are free to move","Moving ions carry charge","Sugar is made of uncharged molecules, so there is nothing to carry charge"]],
["Explain why carbon nanotubes are used to strengthen tennis rackets.",["Very strong covalent bonds between carbon atoms","High tensile strength","Low density, so the racket stays light but strong"]]
]},
M8:{m:[
["What is the nth term of 5, 8, 11, 14, …?",["3n + 2","3n + 5","5n + 3","n + 3"],0,"Common difference 3, so 3n. When n = 1, 3n = 3; we need 5, so add 2: 3n + 2."],
["Using uₙ = 3n + 2, what is the 50th term?",["150","152","155","53"],1,"3 × 50 + 2 = 152."],
["What is the nth term of the geometric sequence 3, 6, 12, 24, …?",["3 × 2ⁿ","3 × 2ⁿ⁻¹","6n − 3","2 × 3ⁿ⁻¹"],1,"First term a = 3, ratio r = 2, so uₙ = a·rⁿ⁻¹ = 3 × 2ⁿ⁻¹."],
["u₁ = 4 and uₙ₊₁ = uₙ + 7. What is u₄?",["25","28","32","18"],0,"4 → 11 → 18 → 25."],
["Which sequence is geometric?",["2, 4, 6, 8","2, 6, 18, 54","1, 4, 9, 16","5, 10, 20, 35"],1,"Each term is multiplied by 3. The others have no common ratio."],
["What is the nth term of 2, 5, 10, 17, 26, …?",["n² + 1","3n − 1","2n² − 1","n² + 2"],0,"Second difference is 2, so n². Then n² gives 1, 4, 9 … and we need 1 more each time."],
["For 3, 8, 15, 24, … the second difference is 2. What is the coefficient of n²?",["2","1","4","½"],1,"The coefficient of n² is half the second difference: 2 ÷ 2 = 1."],
["Is 100 a term of the sequence 4n − 3?",["Yes, n = 25","Yes, n = 26","No, n would be 25.75","No, all terms are odd"],2,"4n − 3 = 100 → n = 25.75, which is not a whole number, so 100 is not a term."]
],w:[
["The sequence 7, 11, 15, 19, … continues.\n(a) Find the nth term.\n(b) Is 201 a term? Justify your answer.",["Common difference d = 4","nth term = 4n + 3","4n + 3 = 201 gives n = 49.5, not a whole number, so 201 is not a term"]],
["Find the nth term of the quadratic sequence 4, 9, 18, 31, 48, …",["Second difference is 4, so the n² term is 2n²","Subtracts 2n² to get 2, 1, 0, −1, −2 → −n + 3","nth term = 2n² − n + 3 (checked with n = 1: 4)"]],
["A colony of 500 bacteria doubles every hour.\n(a) Write an explicit formula for the number after n hours.\n(b) How many after 6 hours?\n(c) Write a recursive formula.",["uₙ = 500 × 2ⁿ","After 6 hours: 500 × 64 = 32 000","u₀ = 500, uₙ₊₁ = 2uₙ"]]
]},
M9:{m:[
["Which is the formula for the sum of the first n terms of an arithmetic series?",["Sₙ = n/2 (2a + (n − 1)d)","Sₙ = a(1 − rⁿ)/(1 − r)","Sₙ = a + (n − 1)d","Sₙ = n(a + d)"],0,"Sₙ = n/2 (2a + (n − 1)d), or n/2 (first + last)."],
["What is 1 + 2 + 3 + … + 100?",["5000","5050","10 100","5100"],1,"100/2 × (1 + 100) = 50 × 101 = 5050."],
["Find the sum of the first 20 terms of 3, 7, 11, …",["820","800","780","1640"],0,"a = 3, d = 4: 20/2 × (6 + 19 × 4) = 10 × 82 = 820."],
["Which is the formula for the sum of a finite geometric series (r ≠ 1)?",["Sₙ = n/2 (a + l)","Sₙ = a(1 − rⁿ)/(1 − r)","Sₙ = a/(1 − r)","Sₙ = arⁿ"],1,"Sₙ = a(1 − rⁿ)/(1 − r), which equals a(rⁿ − 1)/(r − 1)."],
["What is 2 + 6 + 18 + 54 + 162?",["242","240","486","222"],0,"a = 2, r = 3, n = 5: 2(3⁵ − 1)/(3 − 1) = 2 × 242/2 = 242."],
["An infinite geometric series has a sum only when…",["r > 1","|r| < 1","r is negative","a < 1"],1,"The terms must shrink toward 0, which happens only when −1 < r < 1."],
["What is the sum to infinity of 8 + 4 + 2 + 1 + …?",["15","16","∞","12"],1,"S∞ = a/(1 − r) = 8/(1 − ½) = 16."],
["What is the sum to infinity of 9 − 3 + 1 − ⅓ + …?",["6.75","13.5","12","4.5"],0,"r = −⅓: S∞ = 9/(1 + ⅓) = 9 ÷ 4/3 = 6.75."]
],w:[
["An arithmetic series has first term 5 and common difference 3. Find the sum of the first 30 terms.",["Uses Sₙ = n/2 (2a + (n − 1)d)","30/2 × (10 + 29 × 3) = 15 × 97","S₃₀ = 1455"]],
["A ball is dropped from 2 m. Each bounce reaches 60% of the previous height. Find the total distance it travels before it stops.",["Bounce heights 1.2, 0.72, … form a geometric series with r = 0.6","Sum of bounce heights = 1.2/(1 − 0.6) = 3 m","Each bounce goes up and down: 2 × 3 = 6 m","Total = 2 + 6 = 8 m"]],
["For 3 + 1.5 + 0.75 + …\n(a) Explain why it has a sum to infinity and find it.\n(b) Find the smallest n so that Sₙ > 5.9.",["r = 0.5 and |r| < 1, so it converges","S∞ = 3/(1 − 0.5) = 6","Sₙ = 6(1 − 0.5ⁿ) > 5.9 → 0.5ⁿ < 1/60","n = 6"]]
]},
P8:{m:[
["What is the SI unit of mass?",["gram (g)","kilogram (kg)","newton (N)","pound (lb)"],1,"The kilogram is the SI base unit. The newton measures force (weight)."],
["What is the SI unit of temperature?",["degree Celsius (°C)","kelvin (K)","degree Fahrenheit (°F)","joule (J)"],1,"Kelvin is the SI unit; 0 °C = 273 K."],
["A ruler is marked in millimetres. What is its resolution?",["1 cm","0.1 mm","1 mm","0.5 cm"],2,"Resolution is the smallest change the instrument shows: 1 mm."],
["How many significant figures does 0.004560 have?",["3","4","6","7"],1,"Leading zeros don't count; the final zero after 6 does. 4, 5, 6, 0 → 4 s.f."],
["Round 12.67 to 3 significant figures.",["12.6","12.7","13.0","12.67"],1,"The fourth figure is 7, so round up: 12.7."],
["A length is 25.0 ± 0.5 cm. What is the percentage uncertainty?",["0.5%","2%","5%","20%"],1,"0.5 ÷ 25.0 × 100 = 2%."],
["Which instrument is best for measuring the diameter of a thin wire (about 1 mm)?",["Metre rule","Measuring tape","Micrometer","Ruler"],2,"A micrometer reads to 0.01 mm, enough to measure 1 mm precisely."],
["For a single reading on an analogue scale, the absolute uncertainty is usually…",["the whole smallest division","half the smallest division","10% of the reading","zero"],1,"You can judge to about half a division on a scale."]
],w:[
["A length is measured as 48.0 cm ± 0.1 cm.\n(a) Calculate the percentage uncertainty.\n(b) Explain why writing \"48 cm\" would be worse.",["0.1 ÷ 48.0 × 100","≈ 0.21%","\"48.0\" shows the reading to the instrument's resolution; \"48\" suggests it is only known to the nearest cm"]],
["A rectangle measures 4.0 ± 0.1 cm by 2.5 ± 0.1 cm. Find its area and the uncertainty in the area.",["Area = 10 cm²","Percentage uncertainties: 2.5% and 4%","When multiplying, add percentages: 6.5%","Area = 10 ± 0.7 cm² (or ±0.65)"]],
["Explain the difference between accuracy and precision, with an example.",["Accuracy: how close a measurement is to the true value","Precision: how close repeated measurements are to each other (small spread)","A suitable example, e.g. readings 9.1, 9.1, 9.2 m/s² are precise but not accurate for g = 9.8"]]
]},
P9:{m:[
["In an investigation, the independent variable is the one you…",["measure","change on purpose","keep the same","ignore"],1,"You choose and change the independent variable."],
["The dependent variable is the one you…",["change","measure","control","guess"],1,"It depends on the independent variable, so you measure it."],
["A control variable is…",["kept the same so the test is fair","the variable you change","the result","the hypothesis"],0,"Controls are kept constant so only the independent variable affects the result."],
["A good hypothesis includes…",["only a prediction","a prediction with a scientific reason","the method","the results table"],1,"MYP hypotheses must predict AND justify with science."],
["How should a line of best fit be drawn?",["Join every point with straight lines","A smooth line or curve with points spread evenly either side","Always through the origin","Through the first and last points only"],1,"It shows the trend, not every point."],
["What is an anomalous result?",["The average","A result that doesn't fit the pattern","The first result","The control"],1,"Anomalies should be identified and repeated or left out of the mean."],
["Why repeat readings and take a mean?",["To reduce the effect of random errors","To make the graph bigger","To remove systematic errors","Because the teacher says so"],0,"Repeats average out random errors and show reliability. They don't fix a systematic error."],
["Investigating how wingspan affects how far a paper aeroplane flies: what is the independent variable?",["Distance flown","Wingspan","Paper type","Launch force"],1,"Wingspan is what you change on purpose."]
],w:[
["Write a research question and a hypothesis (with a scientific reason) for: \"How does the wing area of a paper aeroplane affect how far it flies?\"",["Research question names the independent and dependent variables","Hypothesis makes a clear prediction","Gives a scientific reason, e.g. more wing area gives more lift but also more drag"]],
["You investigate how drop height affects how high a ball bounces. Identify the independent variable, dependent variable and two control variables.",["Independent: drop height","Dependent: bounce height","Two controls, e.g. same ball, same surface, same way of measuring"]],
["A student timed falling paper with a hand stopwatch, once for each height. Suggest two improvements and explain why each helps.",["Repeat each height (3+ times) and calculate a mean","Reduces the effect of random errors / reaction time","Use a light gate or slow-motion video for more precise timing"]]
]},
C7:{m:[
["How are particles arranged in a solid?",["Far apart, random","Close together, regular, vibrating in place","Close together, random, sliding","Far apart, regular"],1,"Strong forces hold them in fixed positions; they only vibrate."],
["How do particles move in a gas?",["They vibrate in place","Fast and randomly, far apart","Slowly, sliding past each other","They don't move"],1,"Gas particles have lots of energy and very weak forces between them."],
["What is the change from solid directly to gas called?",["Evaporation","Condensation","Sublimation","Melting"],2,"Dry ice (solid CO₂) sublimes."],
["Why does temperature stay constant while a solid melts?",["The heater stops","Energy is used to overcome forces between particles, not to speed them up","Particles stop moving","Heat escapes"],1,"Energy breaks the attractions instead of raising kinetic energy."],
["Diffusion is…",["the net movement of particles from high to low concentration","particles moving from low to high concentration","only possible in solids","the same as melting"],0,"Particles spread out because of their random motion."],
["Diffusion is fastest…",["in solids","in liquids at low temperature","in gases at high temperature","in cold gases"],2,"Gas particles move fastest, and faster still when hot."],
["What is condensing?",["Liquid → solid","Gas → liquid","Solid → liquid","Liquid → gas"],1,"Gas particles lose energy and come together as a liquid."],
["A substance melts at −7 °C and boils at 59 °C. What state is it at 25 °C?",["Solid","Liquid","Gas","Plasma"],1,"25 °C is between its melting and boiling points."]
],w:[
["Use the particle model to explain what happens when ice melts.",["Particles gain energy (heat is absorbed)","Particles vibrate more","They overcome (some of) the forces of attraction","Particles can now move past each other; the regular arrangement breaks down"]],
["A heating curve for water has two flat sections. Explain why the temperature does not rise during these sections.",["The flat sections are changes of state (melting and boiling)","Energy is used to overcome forces between particles","Kinetic energy (temperature) does not increase until the change of state is complete"]],
["Cotton wool soaked in ammonia is put at one end of a tube and hydrochloric acid at the other. A white ring forms closer to the acid end. Explain why.",["The gases diffuse along the tube and react where they meet","Ammonia particles are lighter (smaller Mr) so they move faster","So ammonia travels further and the ring forms nearer the HCl end"]]
]},
C8:{m:[
["What is the test for hydrogen?",["Relights a glowing splint","A lit splint makes a squeaky pop","Turns limewater milky","Bleaches damp litmus paper"],1,"Hydrogen burns with a squeaky pop."],
["What is the test for oxygen?",["Relights a glowing splint","Squeaky pop","Limewater turns milky","Turns litmus blue"],0,"Oxygen supports combustion."],
["What is the test for carbon dioxide?",["Squeaky pop","Relights a glowing splint","Limewater turns milky (cloudy)","Bleaches litmus"],2,"CO₂ reacts with limewater to form insoluble calcium carbonate."],
["What is the test for chlorine?",["Bleaches damp litmus paper","Squeaky pop","Limewater turns milky","Relights a splint"],0,"Chlorine turns damp blue litmus red, then bleaches it white."],
["How would you separate sand from water?",["Distillation","Filtration","Chromatography","Evaporation"],1,"Sand is insoluble, so it is caught by the filter paper."],
["How would you get salt crystals from salt water?",["Filtration","Evaporation / crystallisation","Chromatography","Magnet"],1,"Heat to evaporate the water; salt is left behind."],
["How would you separate ethanol from water?",["Filtration","Fractional distillation","Chromatography","Decanting"],1,"They are miscible liquids with different boiling points."],
["How would you separate the dyes in ink?",["Filtration","Distillation","Chromatography","Crystallisation"],2,"Dyes travel different distances up the paper."]
],w:[
["Describe how to get pure, dry salt from rock salt (salt mixed with sand).",["Add to warm water and stir to dissolve the salt","Filter to remove the sand","Heat the filtrate to evaporate water until crystals form","Dry the crystals (e.g. on filter paper / in a warm oven)"]],
["In a chromatography experiment the solvent moved 7.5 cm and a dye spot moved 3.0 cm.\n(a) Calculate the Rf value.\n(b) Give two things you must do when setting up the paper.",["Rf = distance moved by spot ÷ distance moved by solvent","Rf = 3.0 ÷ 7.5 = 0.4","Start line in pencil (not pen)","Solvent level below the start line"]],
["Describe how simple distillation produces pure water from seawater.",["Heat the seawater so water boils / evaporates","The vapour passes into a condenser and is cooled","It condenses back to liquid water and is collected","Salt stays behind in the flask"]]
]},
E1:{m:[
["Where and when is To Kill a Mockingbird set?",["Atlanta, Georgia, in the 1960s","Maycomb, Alabama, in the 1930s","New York in the 1920s","Maycomb, Alabama, in the 1860s"],1,"The fictional town of Maycomb, Alabama, during the Great Depression of the 1930s."],
["Who narrates the novel?",["Atticus Finch","Jem Finch","Scout (Jean Louise Finch), looking back as an adult","Miss Maudie"],2,"Scout tells the story as an adult remembering her childhood, so we get two voices: the child and the older narrator."],
["Why does the child/adult double narrative voice matter?",["It makes the book shorter","The child's innocence shows injustice simply, while the adult voice adds reflection","It hides who the narrator is","It lets Atticus speak directly to the reader"],1,"Scout's naive view exposes adult prejudice; the older Scout helps us judge it."],
["How did the Great Depression affect Maycomb?",["Everyone became rich","Widespread poverty: some families paid for services with goods instead of money","The town was destroyed in a war","It had no effect"],1,"Poverty shapes characters like the Cunninghams, who pay Atticus in goods."],
["What were \"Jim Crow\" laws?",["Laws protecting birds","Laws enforcing racial segregation in the southern United States","Laws about farming","Laws giving everyone equal rights"],1,"They kept Black and white people separate and unequal, the background to Tom Robinson's trial."],
["Whom does Atticus defend in court?",["Bob Ewell","Boo Radley","Tom Robinson","Walter Cunningham"],2,"Tom Robinson, a Black man falsely accused by the Ewells."],
["What does the mockingbird symbolise?",["Danger","Innocence: harming someone who does no harm is wrong","Wealth","The law"],1,"Characters like Tom and Boo are \"mockingbirds\": innocent people harmed by others."],
["Which family represents poor but proud and honest farmers?",["The Ewells","The Cunninghams","The Finches","The Radleys"],1,"The Cunninghams are poor but refuse what they can't repay; the Ewells are shown very differently."]
],w:[
["Explain how the context of 1930s Alabama shapes the outcome of Tom Robinson's trial.",["Racism and segregation (Jim Crow) meant a Black man's word was valued less than a white person's","The jury was all white","The verdict reflects prejudice rather than the evidence","Links this to the novel's theme of justice / injustice"]],
["How does Lee's choice of a child narrator affect the reader? Refer to an event in the novel.",["Scout's innocence exposes adult hypocrisy or prejudice","The reader often understands more than Scout does (dramatic irony)","The adult narrator adds reflection and judgement","Refers to a relevant event (e.g. the trial, the mob at the jail)"]],
["Explain the significance of the novel's title.",["Mockingbirds only make music and harm no one","Characters say it is a sin to kill one","The bird symbolises innocence","Linked to innocent characters harmed by others, e.g. Tom Robinson or Boo Radley"]]
]},
E2:{m:[
["What does PETAL stand for?",["Point, Evidence, Technique, Analysis, Link","Plan, Edit, Type, Add, Leave","Point, Example, Tone, Answer, Language","Paragraph, Essay, Text, Argument, Language"],0,"Point, Evidence, Technique, Analysis, Link."],
["What should the Point sentence do?",["Retell the story","Answer the question directly in a clear topic sentence","Give a quotation","Describe the author's life"],1,"Your first sentence is your argument for this paragraph."],
["What is the best kind of evidence?",["A long passage copied out","A short quotation embedded in your own sentence","A summary of the whole chapter","Your opinion"],1,"Short, embedded quotes let you zoom in on exact words."],
["In PETAL, \"Technique\" means…",["how neat your handwriting is","naming the writer's method, e.g. simile, dialect, symbolism","the number of paragraphs","the plot"],1,"Name the method so you can analyse its effect."],
["Good analysis explains…",["what happens next","the effect on the reader and what the words suggest","the page number","whether you liked the book"],1,"Zoom in on a word: its connotations and its effect."],
["The Link sentence connects your paragraph back to…",["the next chapter","the question / your thesis (and possibly context)","your introduction only","the title page"],1,"It shows how the paragraph answers the question."],
["Which sentence is ANALYSIS rather than retelling?",["Then the boy ran home.","The verb \"snatched\" suggests panic, making the reader feel the boy's fear.","The story is set in a village.","The boy has a sister."],1,"It zooms in on a word and explains its effect."],
["A thesis statement is…",["the last sentence of the essay","the main argument of the whole essay in one or two sentences","a quotation","a list of techniques"],1,"Every paragraph should support your thesis."]
],w:[
["Extract (original): \"Mara stepped into the flooded street, the cold water biting at her knees, and did not look back at the shouting crowd.\"\nWrite one PETAL paragraph: How does the writer present Mara as brave?",["Clear point that answers the question","Short embedded quotation from the extract","Names a technique (e.g. personification \"biting\", verb choice, contrast with the crowd)","Explains the effect on the reader / what it suggests about Mara","Links back to bravery"]],
["Improve this weak paragraph: \"Jem changes in the book. At the start he plays games and at the end he is older. This shows he changes.\" Explain what is missing and write a better first two sentences.",["Says it retells events without analysis","Says it needs evidence / a specific moment","Says it needs a technique and its effect","Rewrite has a precise point and refers to a specific change (e.g. his reaction to the trial verdict)"]],
["Write a thesis statement for: \"How does Lee present Jem growing up?\"",["Makes an arguable claim, not a fact","Mentions the change from younger to older Jem","Says how Lee shows it (events, reactions, Scout's narration)"]]
]},
E3:{m:[
["A first-person narrative uses…",["he / she","I / we","you only","no pronouns"],1,"The reader sees events through the narrator's own eyes."],
["Third-person limited means…",["the narrator knows everything about everyone","the story follows one character's thoughts using he / she","the narrator is \"I\"","there is no narrator"],1,"We get one character's view from the outside voice."],
["A main effect of first person is…",["distance from the character","closeness to the narrator's feelings, but a limited view","knowing every character's thoughts","a neutral tone"],1,"Intimate, but we only know what the narrator knows or chooses to say."],
["Which line SHOWS rather than TELLS nervousness?",["She was very nervous.","Her hands shook as she folded the letter for the third time.","Nervousness filled her.","She felt nervous and scared."],1,"Actions let the reader infer the feeling."],
["Sensory detail means…",["details about the senses: sight, sound, smell, touch, taste","the reader's opinion","difficult vocabulary","dialogue only"],0,"Sensory details make a scene vivid."],
["An unreliable narrator is…",["a narrator whose account the reader cannot fully trust","a narrator who is always right","a narrator who never speaks","a third-person narrator"],0,"Bias, age or missing knowledge can make a narrator unreliable."],
["Writing in the present tense usually creates…",["distance","immediacy and tension","a formal tone","humour"],1,"Events feel as if they are happening now."],
["Rewriting a scene from Boo Radley's perspective mainly helps you…",["change the plot","explore empathy and how perspective changes interpretation","shorten the novel","practise spelling"],1,"The same events look different through another character's eyes."]
],w:[
["Write 5–6 sentences in the first person as a refugee arriving in a new city. Use at least two senses and one metaphor. Then underline (name) your metaphor.",["Consistent first-person voice","At least two different senses","One clear metaphor, identified","Shows emotion through detail rather than naming it"]],
["Explain how telling the same event through a different narrator can change the reader's response. Use an example.",["What the narrator knows or feels limits the information given","The reader's sympathy can shift to a different character","A relevant example (e.g. the Tom Robinson trial told by Boo, Mayella or Scout)"]],
["Describe three techniques a writer can use to create a distinctive narrative voice.",["Word choice / dialect / idiolect","Sentence length and rhythm","Inner thoughts, rhetorical questions or direct address (or choice of tense / person)"]]
]},
E4:{m:[
["What is a simile?",["A comparison using \"like\" or \"as\"","Saying something IS something else","Repeating a sound","A pause in a line"],0,"\"Brave as a lion\" is a simile."],
["What is a metaphor?",["A comparison using \"like\"","Saying something IS something else","A rhyme","A list"],1,"\"The classroom was a zoo.\""],
["What is enjambment?",["A sentence running over a line break without punctuation","A pause in the middle of a line","Repeated consonant sounds","A rhyme scheme"],0,"It can speed up a poem or create surprise at the start of the next line."],
["What is a caesura?",["A pause in the middle of a line, often marked by punctuation","The last line of a poem","A rhyming couplet","A long stanza"],0,"It slows the reader and emphasises the words around it."],
["What is alliteration?",["Repeated consonant sounds at the start of nearby words","Words that sound like their meaning","Comparing two things","A change in mood"],0,"\"Silent snow slipped softly.\""],
["In a poem, \"tone\" means…",["the number of lines","the poet's attitude or the mood created","the rhyme scheme","the title"],1,"Tone words: bitter, nostalgic, hopeful, menacing…"],
["A volta is…",["a type of rhyme","a turn or shift in thought or mood","a long line","a sound device"],1,"Often signalled by \"but\", \"yet\" or a new stanza."],
["\"The city breathes its smoky sigh\" uses mainly…",["simile","personification","onomatopoeia","enjambment"],1,"The city is given human actions (breathing, sighing)."]
],w:[
["Lines (original): \"The sea is a grey wolf at the harbour door, / gnawing the stones the fishermen once swore.\"\nAnalyse how the imagery creates a mood.",["Identifies the metaphor (sea = grey wolf)","Explains connotations of \"wolf\" (danger, hunger, predator)","Comments on the verb \"gnawing\" (slow, constant destruction)","States the mood created (threat / unease) and its effect on the reader"]],
["Explain how a poet can use structure (e.g. enjambment, caesura or stanza breaks) to create meaning.",["Names a structural feature","Explains where or how it is used","Explains its effect on pace, emphasis or meaning"]],
["List the steps you would follow to analyse an unseen poem in a test.",["Read for overall meaning: who is speaking, about what","Identify the tone and any shift (volta)","Annotate techniques AND their effects","Consider structure / form","Answer the question with a clear thesis"]]
]},
E5:{m:[
["Connotation is…",["the dictionary meaning of a word","the ideas or feelings a word suggests beyond its literal meaning","a type of punctuation","a long sentence"],1,"\"Home\" means a building but suggests safety and belonging."],
["Pathetic fallacy is when…",["characters argue","the weather or setting reflects a mood or emotion","the narrator lies","a story is sad"],1,"A storm during a tense scene is pathetic fallacy."],
["Using dialect in a novel shows…",["only that the author can't spell","a character's region, class or identity","the setting's weather","the year of publication"],1,"Dialect places characters socially and makes them feel real."],
["Juxtaposition is…",["placing contrasting ideas side by side","repeating a word","a comparison with \"like\"","a question"],0,"Contrast makes each idea stand out."],
["Foreshadowing is…",["a flashback","a hint of events to come","a description of shadows","the climax"],1,"It builds suspense."],
["A very short sentence is often used to create…",["confusion","tension, impact or emphasis","humour only","a formal register"],1,"\"Then silence.\""],
["Which verb makes the storm sound most violent? \"The wind ___ rain against the windows.\"",["blew","drifted","hurled","moved"],2,"\"Hurled\" suggests force and aggression."],
["Register means…",["how loud a text is","the level of formality of language","the number of paragraphs","the narrator"],1,"Formal for an essay; informal for a diary entry."]
],w:[
["Extract (original): \"The classroom was silent. Outside, rain hammered the windows as if trying to get in. Lena stared at the blank page, her pen frozen above it like a held breath.\"\nHow does the writer create tension?",["Short opening sentence creates stillness / suspense","\"hammered\" + personification (\"trying to get in\") makes the weather threatening","Simile \"like a held breath\" shows Lena's anxiety","Explains the overall effect on the reader"]],
["Explain how a writer can use dialect to reveal identity and social class. Use an example from a text you know.",["Dialect features show region and education","It positions the reader's attitude to a character","It reveals social hierarchy or complexity","A relevant example"]],
["Explain pathetic fallacy, write your own example sentence, and explain its effect.",["Correct definition","An original example sentence","Explains the mood or emotion it reflects"]]
]}
};
