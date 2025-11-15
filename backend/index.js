const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

// Konfiguration
app.use(cors()); 
app.use(bodyParser.json());

// Die Fake-Mitarbeiterdaten laden
const employees = require('./demo_employees.json');

/**
 * Kernlogik: Berechnet den Match-Score eines Mitarbeiters für ein Projekt.
 * Fokussiert auf SkillScore, Capacity Penalty und Compliance Check.
 */
function computeMatch(project, emp) {
  // 1. Skill Score: Wie viele benötigte Skills sind vorhanden? (Gewichtet)
  const requiredSkills = project.required_skills || {};
  let score = 0;
  let count = 0;

  for (const k in requiredSkills) {
    const need = requiredSkills[k];
    const have = (emp.skills && emp.skills[k]) || 0;
    score += Math.min(have / need, 1);
    count++;
  }

  score = (count > 0) ? score / count : 0;
  
  // ----------------------------------------------------
  // 2. Penalties (Das macht den CPO-Unterschied!)
  let penaltyFactor = 1.0;
  let warning = "All good.";

  // Capacity Penalty: Starke Reduktion, wenn unter 20% verfügbar
  if (emp.capacity_percent < 20) {
    penaltyFactor *= 0.7; // 30% Score-Reduktion
    warning = "Capacity low: " + emp.capacity_percent + "%";
  }
  
  // Compliance Penalty: Schwere Reduktion, wenn geforderte Zertifikate fehlen
  const requiredCerts = project.required_certificates || [];
  const empCerts = emp.compliance || [];

  const isCompliant = requiredCerts.every(cert => empCerts.includes(cert));

  if (!isCompliant) {
    penaltyFactor *= 0.4; // 60% Score-Reduktion (Sehr harsch!)
    warning = (warning.includes("low") ? warning + " | " : "") + "Compliance missing!";
  }

  // Finaler Score
  score = score * penaltyFactor;

  // Ergebnis auf 2 Dezimalstellen runden
  const finalScore = Math.round(score * 100) / 100;
  
  return { finalScore, warning };
}

// ----------------------------------------------------
// API Endpoint
app.post('/api/match', (req, res) => {
  const project = req.body;
  
  // Scoring für alle Mitarbeiter
  const scored = employees.map(e => {
    const matchData = computeMatch(project, e);
    return {
      ...e, 
      score: matchData.finalScore,
      warning: matchData.warning
    };
  });

  // Nach Score sortieren (absteigend) und Top 5 auswählen
  const top = scored.sort((a, b) => b.score - a.score).slice(0, 5);
  
  res.json({
    projectId: 'DEMO-P-001',
    matches: top
  });
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Backend running on http://localhost:${port}`));