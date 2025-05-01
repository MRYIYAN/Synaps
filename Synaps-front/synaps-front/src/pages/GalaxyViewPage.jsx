import React, { useEffect, useState } from "react";

// ------------------------------------------------------------
// Componentes React
// ------------------------------------------------------------

import GalaxyGrao from "../components/GalaxyGraph";

// ------------------------------------------------------------
// APP
// ------------------------------------------------------------

const GalaxyView = function() {

  // Datos de ejemplo para tu grafo: 50 nodos temáticos y conexiones selectivas.
  const graphData = {
    nodes: [
      { id: 'node1',  name: 'AI Overview',                 group: 1 },
      { id: 'node2',  name: 'Machine Learning',            group: 2 },
      { id: 'node3',  name: 'Deep Learning',               group: 2 },
      { id: 'node4',  name: 'Neural Networks',             group: 2 },
      { id: 'node5',  name: 'Computer Vision',             group: 2 },
      { id: 'node6',  name: 'Natural Language Processing', group: 2 },
      { id: 'node7',  name: 'Reinforcement Learning',      group: 2 },
      { id: 'node8',  name: 'AI Ethics',                   group: 1 },
      { id: 'node9',  name: 'AI in Finance',               group: 5 },
      { id: 'node10', name: 'Stock Market Analysis',       group: 5 },
      { id: 'node11', name: 'Algorithmic Trading',         group: 5 },
      { id: 'node12', name: 'Portfolio Optimization',      group: 5 },
      { id: 'node13', name: 'Quantitative Finance',        group: 5 },
      { id: 'node14', name: 'FinTech Trends',              group: 5 },
      { id: 'node15', name: 'Blockchain Basics',           group: 9 },
      { id: 'node16', name: 'Smart Contracts',             group: 9 },
      { id: 'node17', name: 'Cryptocurrency',              group: 9 },
      { id: 'node18', name: 'Ethereum',                    group: 9 },
      { id: 'node19', name: 'DeFi',                        group: 9 },
      { id: 'node20', name: 'Data Science',                group: 3 },
      { id: 'node21', name: 'Big Data',                    group: 3 },
      { id: 'node22', name: 'Data Visualization',          group: 3 },
      { id: 'node23', name: 'Pandas',                      group: 3 },
      { id: 'node24', name: 'SQL Databases',               group: 3 },
      { id: 'node25', name: 'NoSQL Databases',             group: 3 },
      { id: 'node26', name: 'Python Programming',          group: 4 },
      { id: 'node27', name: 'JavaScript',                  group: 4 },
      { id: 'node28', name: 'React',                       group: 7 },
      { id: 'node29', name: 'Vue.js',                      group: 7 },
      { id: 'node30', name: 'Angular',                     group: 7 },
      { id: 'node31', name: 'Node.js',                     group: 7 },
      { id: 'node32', name: 'DevOps',                      group: 10 },
      { id: 'node33', name: 'Docker',                      group: 10 },
      { id: 'node34', name: 'Kubernetes',                  group: 10 },
      { id: 'node35', name: 'CI/CD',                       group: 10 },
      { id: 'node36', name: 'AWS',                         group: 6 },
      { id: 'node37', name: 'Azure',                       group: 6 },
      { id: 'node38', name: 'Google Cloud',                group: 6 },
      { id: 'node39', name: 'Serverless',                  group: 6 },
      { id: 'node40', name: 'Web Security',                group: 7 },
      { id: 'node41', name: 'UX Design',                   group: 4 }, // aislado
      { id: 'node42', name: 'Mobile Development',          group: 8 },
      { id: 'node43', name: 'Android',                     group: 8 },
      { id: 'node44', name: 'iOS',                         group: 8 },
      { id: 'node45', name: 'Flutter',                     group: 8 },
      { id: 'node46', name: 'React Native',                group: 8 },
      { id: 'node47', name: 'Microservices',               group: 10 },
      { id: 'node48', name: 'REST API',                    group: 7 },
      { id: 'node49', name: 'GraphQL',                     group: 7 },
      { id: 'node50', name: 'Cloud Security',              group: 6 },
      { id: 'node51', name: 'Augmented Reality',           group: 11 },
      { id: 'node52', name: 'Virtual Reality',             group: 11 },
      { id: 'node53', name: 'Mixed Reality',               group: 11 },
      { id: 'node54', name: 'Quantum Computing',           group: 12 },
      { id: 'node55', name: 'Qubits',                      group: 12 },
      { id: 'node56', name: 'Quantum Algorithms',          group: 12 },
      { id: 'node57', name: 'Internet of Things',          group: 13 },
      { id: 'node58', name: 'Edge Computing',              group: 13 },
      { id: 'node59', name: '5G Networks',                 group: 13 },
      { id: 'node60', name: 'Robotics',                    group: 14 },
      { id: 'node61', name: 'Automation',                  group: 14 },
      { id: 'node62', name: 'Bioinformatics',              group: 15 },
      { id: 'node63', name: 'Genomics',                    group: 15 },
      { id: 'node64', name: 'Proteomics',                  group: 15 },
      { id: 'node65', name: 'Threat Intelligence',         group: 16 },
      { id: 'node66', name: 'Penetration Testing',         group: 16 },
      { id: 'node67', name: 'Zero Trust',                  group: 16 },
      { id: 'node68', name: 'Social Networks',             group: 17 },
      { id: 'node69', name: 'Influencer Marketing',        group: 17 },
      { id: 'node70', name: 'Game Development',            group: 18 },
      { id: 'node71', name: 'Unreal Engine',               group: 18 },
      { id: 'node72', name: 'Unity',                       group: 18 },
      { id: 'node73', name: 'ETL Pipelines',               group: 3 },
      { id: 'node74', name: 'Apache Kafka',                group: 3 }
    ],
    links: [
      // IA y ML
      { source: 'node1',  target: 'node2' },
      { source: 'node1',  target: 'node3' },
      { source: 'node2',  target: 'node4' },
      { source: 'node2',  target: 'node5' },
      { source: 'node3',  target: 'node6' },
      { source: 'node4',  target: 'node7' },
      { source: 'node5',  target: 'node6' },
      { source: 'node6',  target: 'node7' },
      { source: 'node8',  target: 'node9' },

      // Finanzas  
      { source: 'node9',  target: 'node10' },
      { source: 'node10', target: 'node11' },
      { source: 'node11', target: 'node12' },
      { source: 'node12', target: 'node13' },
      { source: 'node13', target: 'node14' },

      // Blockchain  
      { source: 'node15', target: 'node16' },
      { source: 'node16', target: 'node17' },
      { source: 'node17', target: 'node18' },
      { source: 'node18', target: 'node19' },

      // Ciencia de Datos  
      { source: 'node20', target: 'node21' },
      { source: 'node20', target: 'node22' },
      { source: 'node21', target: 'node23' },
      { source: 'node22', target: 'node23' },
      { source: 'node23', target: 'node24' },
      { source: 'node24', target: 'node25' },
      { source: 'node20', target: 'node73' }, // ETL dentro de Data Science
      { source: 'node73', target: 'node74' }, // Kafka en pipelines

      // Lenguajes y frameworks  
      { source: 'node26', target: 'node20' },
      { source: 'node26', target: 'node27' },
      { source: 'node27', target: 'node28' },
      { source: 'node28', target: 'node29' },
      { source: 'node29', target: 'node30' },
      { source: 'node30', target: 'node31' },
      { source: 'node31', target: 'node48' },
      { source: 'node48', target: 'node49' },

      // DevOps y Cloud  
      { source: 'node32', target: 'node33' },
      { source: 'node33', target: 'node34' },
      { source: 'node34', target: 'node35' },
      { source: 'node35', target: 'node47' },
      { source: 'node47', target: 'node36' },
      { source: 'node36', target: 'node37' },
      { source: 'node37', target: 'node38' },
      { source: 'node38', target: 'node39' },
      { source: 'node39', target: 'node50' },
      { source: 'node50', target: 'node36' },

      // Mobile  
      { source: 'node42', target: 'node43' },
      { source: 'node43', target: 'node44' },
      { source: 'node44', target: 'node45' },
      { source: 'node45', target: 'node46' },
      { source: 'node46', target: 'node42' },

      // AR/VR  
      { source: 'node51', target: 'node52' },
      { source: 'node52', target: 'node53' },
      { source: 'node51', target: 'node1' }, // AI → AR  
      { source: 'node52', target: 'node3' }, // VR → Deep Learning  

      // Quantum  
      { source: 'node54', target: 'node55' },
      { source: 'node55', target: 'node56' },
      { source: 'node54', target: 'node3' }, // Deep Learning → Quantum Alg.  

      // IoT & Edge  
      { source: 'node57', target: 'node58' },
      { source: 'node57', target: 'node59' },
      { source: 'node58', target: 'node36' }, // Edge → AWS  

      // Robotics  
      { source: 'node60', target: 'node61' },
      { source: 'node60', target: 'node2' },  // ML → Robotics  
      { source: 'node60', target: 'node7' },  // RL → Robotics  

      // Bioinformatics  
      { source: 'node62', target: 'node63' },
      { source: 'node63', target: 'node64' },
      { source: 'node62', target: 'node20' }, // Data Science → Bioinformatics  

      // Cybersecurity  
      { source: 'node65', target: 'node66' },
      { source: 'node65', target: 'node67' },
      { source: 'node65', target: 'node40' }, // Web Security → Threat Int.  
      { source: 'node65', target: 'node50' }, // Cloud Security → Threat Int.  

      // Social & Marketing  
      { source: 'node68', target: 'node69' },
      { source: 'node68', target: 'node21' }, // Big Data → Social Networks  

      // Gaming  
      { source: 'node70', target: 'node71' },
      { source: 'node71', target: 'node72' },
      { source: 'node70', target: 'node28' }, // React → Game Dev  

      // Node aislados: node41 (UX Design)
    ]
  };

  // HTML del formulario
  return (
    <div style={{ padding: "2rem" }}>
      <h1>Galaxy View</h1>

      <div style={{ width: '100vw', height: '100vh' }}>
        <GalaxyGrao data={graphData} />
      </div>
    </div>
  );
}

export default GalaxyView;
