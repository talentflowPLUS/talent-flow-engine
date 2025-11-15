import { useState } from 'react';
import './App.css'; // Behält das Basis-Styling bei

// Definiert das Datenmodell für einen Match (TypeScript-Standard!)
interface EmployeeMatch {
  id: string;
  name: string;
  role: string;
  skills: { [key: string]: number };
  capacity_percent: number;
  compliance: string[];
  score: number;
  warning: string;
}

function App() {
  const [project, setProject] = useState({
    title: 'AI-Native Talent Scout (Finance)',
    // Dies sind die geforderten Skills für das Projekt
    required_skills: { java: 5, react: 4, aws: 3 }, 
    required_certificates: ['gdpr_2024', 'itsec_level_2']
  });
  const [matches, setMatches] = useState<EmployeeMatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMatches = async () => {
    setLoading(true);
    setError(null);
    try {
      // WICHTIG: Die Adresse des laufenden Backend-Servers
      const res = await fetch('http://localhost:4000/api/match', { 
        method: 'POST', 
        headers: {'Content-Type':'application/json'}, 
        body: JSON.stringify(project)
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      setMatches(data.matches);

    } catch (e) {
      console.error("Fetch Error:", e);
      setError("Konnte Backend nicht erreichen. Läuft 'npx nodemon index.js' in einem separaten Fenster?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{padding: 40, fontFamily: 'sans-serif', backgroundColor: '#f9f9f9', minHeight: '100vh'}}>
      <h1 style={{color: '#1D70B8'}}>TALENT FLOW+ 🚀 Demo</h1>
      <p style={{marginBottom: 20}}>Project: <strong>{project.title}</strong> | Required Skills: {Object.keys(project.required_skills).join(', ')}</p>

      <div style={{marginBottom: 30}}>
        <button 
          onClick={fetchMatches} 
          disabled={loading} 
          style={{
            padding:'12px 20px', 
            background: loading ? '#ccc' : '#1D70B8', // Newwork-Blau
            color:'#fff', 
            border:0, 
            borderRadius: 8,
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'background 0.3s'
          }}
          onMouseOver={(e) => (e.currentTarget.style.background = loading ? '#ccc' : '#005f99')}
          onMouseOut={(e) => (e.currentTarget.style.background = loading ? '#ccc' : '#1D70B8')}>
          {loading ? 'Analysiere...' : '🎯 Projekt Matchen (CPO Demo)'}
        </button>
        {error && <p style={{color: 'red', marginTop: 10, fontWeight: 'bold'}}>{error}</p>}
      </div>

      <h2>Top 5 Matches ({matches.length})</h2>
      <div style={{display: 'grid', gap: '15px'}}>
        {matches.map(m => (
          <div key={m.id} style={{
            padding: 15, 
            border: '1px solid #ddd', 
            borderRadius: 8,
            backgroundColor: '#fff',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
          }}>
            <div style={{display:'flex',justifyContent:'space-between', alignItems: 'center'}}>
              <div style={{fontSize: '1.1em'}}>
                <strong>{m.name}</strong> — {m.role}
              </div>
              <div style={{
                textAlign:'right', 
                fontWeight: 'bold',
                fontSize: '1.2em',
                color: m.score > 0.6 ? '#2b8' : '#C62828' 
              }}>
                Score: {Math.round(m.score * 100)}%
              </div>
            </div>
            <div style={{marginTop: 8, fontSize: '0.9em', color: '#555'}}>
              Kapazität: 
              <strong style={{color: m.capacity_percent > 85 ? '#C62828' : '#2b8', marginLeft: 5}}>
                {m.capacity_percent}%
              </strong> | 
              Compliance: 
              <strong style={{marginLeft: 5}}>
                 {project.required_certificates.every(cert => m.compliance.includes(cert)) ? '✅ OK' : '❌ FEHLT'}
              </strong>
            </div>
             {m.warning !== 'All good.' && (
                <p style={{fontSize: '0.8em', color: '#FF7F50', marginTop: 5, fontWeight: 'bold'}}>
                   ⚠️ {m.warning}
                </p>
             )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;