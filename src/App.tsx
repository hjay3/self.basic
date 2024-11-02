import React from 'react';
import SelfMapVisualization from './components/SelfMapVisualization';

// Synthetic data
const mockData = {
  "Creative Expression": {
    Strength: 8,
    Title: "Artist & Innovator",
    Beliefs: "Art drives innovation and personal growth",
    Style: "Experimental and intuitive"
  },
  "Technical Mastery": {
    Strength: 9,
    Title: "Problem Solver",
    Beliefs: "Technology empowers human potential",
    Style: "Analytical and systematic"
  },
  "Community Building": {
    Strength: 7,
    Title: "Connector",
    Beliefs: "Together we achieve more",
    Style: "Collaborative and inclusive"
  },
  "Personal Growth": {
    Strength: 6,
    Title: "Lifelong Learner",
    Beliefs: "Growth mindset is essential",
    Style: "Reflective and adaptive"
  },
  "Leadership": {
    Strength: 8,
    Title: "Vision Driver",
    Beliefs: "Lead by example and empower others",
    Style: "Strategic and empathetic"
  }
};

function App() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <SelfMapVisualization data={mockData} />
      </div>
    </div>
  );
}

export default App;