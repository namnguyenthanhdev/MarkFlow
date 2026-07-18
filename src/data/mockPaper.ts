import type { PastPaper } from "@/types";

export const mockPaper: PastPaper = {
  id: "paper_001",
  metadata: {
    curriculum: "Cambridge International A-Level",
    subject: "Biology",
    year: 2024,
    paperNumber: "Paper 4 (Extended)",
    totalPoints: 24,
    durationMinutes: 60,
  },
  questions: [
    {
      id: "q1",
      questionNumber: "1",
      type: "multiple_choice",
      points: 2,
      prompt:
        "Which of the following statements best describes the role of ATP synthase in oxidative phosphorylation?",
      options: [
        "A. It transports electrons across the inner mitochondrial membrane",
        "B. It uses the proton gradient to catalyse the synthesis of ATP from ADP and inorganic phosphate",
        "C. It reduces molecular oxygen to form water",
        "D. It oxidises NADH to regenerate NAD⁺",
      ],
      correctAnswer:
        "B. It uses the proton gradient to catalyse the synthesis of ATP from ADP and inorganic phosphate",
      markSchemeCriteria: [
        "Identifies ATP synthase as using the proton motive force (proton gradient)",
        "Correctly states ATP is synthesised from ADP + Pi",
      ],
    },
    {
      id: "q2",
      questionNumber: "2",
      type: "short_answer",
      points: 4,
      prompt:
        "Describe the role of the light-independent reactions (Calvin cycle) in photosynthesis. In your answer, name the key enzyme responsible for carbon fixation and state where in the chloroplast these reactions occur.",
      markSchemeCriteria: [
        "Calvin cycle occurs in the stroma of the chloroplast",
        "Carbon fixation is catalysed by RuBisCO (ribulose-1,5-bisphosphate carboxylase/oxygenase)",
        "RuBP combines with CO₂ to form an unstable 6-carbon intermediate",
        "ATP and NADPH from the light-dependent reactions are used to reduce GP to triose phosphate (TP)",
      ],
    },
    {
      id: "q3",
      questionNumber: "3",
      type: "long_form",
      points: 18,
      prompt: `An investigation was carried out to study the effect of temperature on the rate of oxygen consumption in germinating mung bean seeds.

The seeds were placed in a sealed respirometer and the volume of oxygen consumed was recorded over 30 minutes at four different temperatures: 10°C, 20°C, 30°C, and 40°C.

The results are shown in the table below:

| Temperature (°C) | O₂ consumed (cm³) at 30 min |
|:---:|:---:|
| 10 | 0.8 |
| 20 | 2.1 |
| 30 | 4.5 |
| 40 | 5.2 |

(a) Plot a graph of oxygen consumption against temperature and describe the trend shown by the data.
(b) Explain the biochemical reasons for the increase in oxygen consumption between 10°C and 30°C.
(c) Suggest why the rate of increase slows between 30°C and 40°C, and predict what would happen if the temperature were raised to 60°C.
(d) The experiment was repeated using seeds that had been boiled for 10 minutes prior to the investigation. Predict and explain the results you would expect.`,
      markSchemeCriteria: [
        "Graph drawn with correctly labelled axes (O₂ consumed on y-axis, Temperature on x-axis), points plotted accurately, and a line of best fit (or joined points)",
        "Describes positive correlation / increase in O₂ consumption with temperature up to 40°C",
        "As temperature increases, kinetic energy of enzyme and substrate molecules increases",
        "More frequent enzyme-substrate collisions occur, increasing rate of respiration",
        "Between 30-40°C rate of increase slows; enzymes (e.g. those in respiratory pathway) begin to denature",
        "At 60°C enzymes would be fully denatured — oxygen consumption would stop (or drop to near zero)",
        "Boiled seeds: no oxygen consumption expected because enzymes are denatured by boiling",
        "Reference to loss of tertiary structure / active site shape at high temperatures",
      ],
    },
  ],
};
