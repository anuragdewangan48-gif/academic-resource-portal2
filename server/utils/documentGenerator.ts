import fs from 'fs';
import path from 'path';

/**
 * Generate a complete, polished academic examination & study document
 * that opens cleanly in any browser and prints/saves to PDF.
 */
export function generateAcademicDocumentHtml(resource: {
  title: string;
  category: string;
  semester: number;
  branch?: string;
  year?: number;
  courseType?: string;
  uploadedByName?: string;
}): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${resource.title} - Academic Portal</title>
  <style>
    :root {
      --primary: #4338ca;
      --primary-light: #e0e7ff;
      --text: #0f172a;
      --muted: #475569;
      --border: #cbd5e1;
      --bg: #f8fafc;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background-color: var(--bg);
      color: var(--text);
      line-height: 1.6;
      padding: 2rem 1rem;
    }
    .container {
      max-width: 820px;
      margin: 0 auto;
      background: #ffffff;
      border: 1px solid var(--border);
      border-radius: 12px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
      padding: 2.5rem;
    }
    .header {
      border-bottom: 2px solid var(--primary);
      padding-bottom: 1.5rem;
      margin-bottom: 2rem;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 1rem;
    }
    .university-title {
      font-size: 0.85rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--primary);
      font-weight: 700;
      margin-bottom: 0.25rem;
    }
    h1 {
      font-size: 1.5rem;
      color: #1e1b4b;
      line-height: 1.3;
      margin-bottom: 0.75rem;
    }
    .meta-badges {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-top: 0.5rem;
    }
    .badge {
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.25rem 0.6rem;
      border-radius: 6px;
      background: #f1f5f9;
      color: #334155;
      border: 1px solid #e2e8f0;
    }
    .badge-primary {
      background: var(--primary-light);
      color: var(--primary);
      border-color: #c7d2fe;
    }
    .print-btn {
      background: var(--primary);
      color: #ffffff;
      border: none;
      padding: 0.5rem 1rem;
      font-size: 0.85rem;
      font-weight: 600;
      border-radius: 6px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      white-space: nowrap;
    }
    .print-btn:hover { background: #3730a3; }
    .section {
      margin-bottom: 2rem;
    }
    h2 {
      font-size: 1.15rem;
      color: #1e293b;
      margin-bottom: 0.75rem;
      padding-bottom: 0.35rem;
      border-bottom: 1px solid #e2e8f0;
    }
    .question-block {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 1rem 1.25rem;
      margin-bottom: 1rem;
    }
    .q-header {
      display: flex;
      justify-content: space-between;
      font-weight: 700;
      color: #1e293b;
      margin-bottom: 0.5rem;
      font-size: 0.95rem;
    }
    .marks {
      font-size: 0.8rem;
      color: var(--primary);
      background: var(--primary-light);
      padding: 0.15rem 0.5rem;
      border-radius: 4px;
    }
    ul, ol {
      padding-left: 1.5rem;
      margin-bottom: 0.75rem;
    }
    li {
      margin-bottom: 0.4rem;
    }
    .solution-box {
      background: #ffffff;
      border-left: 3px solid #10b981;
      padding: 0.75rem 1rem;
      margin-top: 0.75rem;
      font-size: 0.9rem;
      color: #334155;
    }
    .footer {
      margin-top: 3rem;
      padding-top: 1rem;
      border-top: 1px solid #e2e8f0;
      font-size: 0.75rem;
      color: var(--muted);
      text-align: center;
    }
    @media print {
      body { background: #fff; padding: 0; }
      .container { border: none; box-shadow: none; padding: 0; }
      .print-btn { display: none; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div>
        <div class="university-title">University Academic Repository • Examination Resource</div>
        <h1>${resource.title}</h1>
        <div class="meta-badges">
          ${resource.branch ? `<span class="badge" style="background:#eef2ff; color:#3730a3; border-color:#c7d2fe; font-weight:700;">Branch: ${resource.branch}</span>` : ''}
          <span class="badge badge-primary">${resource.category}</span>
          <span class="badge">Semester ${resource.semester}</span>
          ${resource.year ? `<span class="badge">Year ${resource.year}</span>` : ''}
          ${resource.courseType ? `<span class="badge">${resource.courseType}</span>` : ''}
          <span class="badge">Contributed by: ${resource.uploadedByName || 'Verified Academic Member'}</span>
        </div>
      </div>
      <button class="print-btn" onclick="window.print()">
        <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M2.5 8a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1z"/><path d="M5 1a2 2 0 0 0-2 2v2H2a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h1v1a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-1h1a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-1V3a2 2 0 0 0-2-2H5zM4 3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2H4V3zm1 5a2 2 0 0 0-2 2v1H2a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v-1a2 2 0 0 0-2-2H5zm7 2v4a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1z"/></svg>
        Print / Save PDF
      </button>
    </div>

    <div class="section">
      <h2>1. Overview & Marking Distribution</h2>
      <p>This document contains complete examination questions, model step-by-step solutions, and key theoretical derivations for <strong>${resource.title}</strong>.</p>
      <ul>
        <li><strong>Duration:</strong> 3 Hours Examination Format</li>
        <li><strong>Total Marks:</strong> 100 Marks (Section A: 20 Marks, Section B: 40 Marks, Section C: 40 Marks)</li>
        <li><strong>Recommended Preparation Time:</strong> 4 to 6 focused study hours</li>
      </ul>
    </div>

    <div class="section">
      <h2>2. Section A: High-Yield Solved Questions (10 Marks Each)</h2>

      <div class="question-block">
        <div class="q-header">
          <span>Question 1: Foundational Theory & Core Principles</span>
          <span class="marks">10 Marks</span>
        </div>
        <p>Explain the core operational mechanism, necessary preconditions, and structural trade-offs related to this module. Draw the appropriate block architecture or trace diagram.</p>
        <div class="solution-box">
          <strong>Model Solution Summary:</strong>
          <ol>
            <li><strong>Definition & Scope:</strong> Clearly define the governing mathematical formula or state invariants before proceeding to derivations.</li>
            <li><strong>Step-by-Step Procedure:</strong> List boundary conditions (initial state $S_0$ and termination conditions).</li>
            <li><strong>Complexity:</strong> Time Complexity is strictly bounded by $O(n \\log n)$ or $O(V + E)$ depending on graph or tree representation.</li>
          </ol>
        </div>
      </div>

      <div class="question-block">
        <div class="q-header">
          <span>Question 2: Numerical Derivation & Algorithm Execution</span>
          <span class="marks">10 Marks</span>
        </div>
        <p>Perform a complete step-by-step trace with tabular values for the given test instance. Analyze worst-case and average-case space complexity.</p>
        <div class="solution-box">
          <strong>Key Evaluation Criteria:</strong>
          <p>Examiners award 4 marks for the state table, 3 marks for edge-case justification, and 3 marks for final conclusion and asymptotic analysis.</p>
        </div>
      </div>
    </div>

    <div class="section">
      <h2>3. Section B: Key Formulas & Cheat-Sheet</h2>
      <ul>
        <li><strong>Theorem Statement:</strong> $T(n) = aT(n/b) + f(n)$ where $a \\ge 1, b > 1$.</li>
        <li><strong>Memory Bound:</strong> Effective Access Time $(EAT) = h \\times (t_{TLB} + t_{mem}) + (1 - h) \\times (t_{TLB} + 2t_{mem})$.</li>
        <li><strong>Invariants:</strong> Verify ACID compliance across commit and rollback checkpoints.</li>
      </ul>
    </div>

    <div class="footer">
      Verified by Academic Resource & PYQ Portal • Document ID: REF-${Date.now().toString(36).toUpperCase()}
    </div>
  </div>
</body>
</html>`;
}

/**
 * Ensures standard sample files exist in uploads directory so seed resources can be viewed directly
 */
export function ensureSeedDocumentsExist(): void {
  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const sampleFiles = [
    {
      filename: 'OS-EndSem-2024-Solved-PYQ.html',
      title: 'Operating Systems End-Sem Solved PYQ 2024 (Paging, LRU, Deadlocks & Synchronization)',
      category: 'PYQ',
      semester: 5,
      year: 2024,
      courseType: 'Core Theory',
    },
    {
      filename: 'Master-Theorem-Algorithms-Notes.html',
      title: 'Master Theorem, Recurrence Relations & Asymptotic Complexity Cheat-Sheet',
      category: 'Lecture Notes',
      semester: 3,
      year: 2024,
      courseType: 'Core Theory',
    },
    {
      filename: 'Graph-Algorithms-MidSem-PYQ.html',
      title: 'Graph Algorithms Mid-Sem PYQ 2023 (Dijkstra, Bellman-Ford, Kruskal & Prim Minimum Spanning Tree)',
      category: 'PYQ',
      semester: 3,
      year: 2023,
      courseType: 'Core Theory',
    },
    {
      filename: 'DBMS-EndTerm-Solved-PYQ-2024.html',
      title: 'DBMS End-Term Solved PYQ 2024 (ACID Transactions, 3NF/BCNF Normalization & B+ Trees)',
      category: 'PYQ',
      semester: 4,
      year: 2024,
      courseType: 'Core Theory',
    },
    {
      filename: 'Computer-Networks-PYQ-ExamGuide.html',
      title: 'Computer Networks Comprehensive PYQ & Viva Questions (TCP vs UDP, Subnetting, OSI Model)',
      category: 'PYQ',
      semester: 6,
      year: 2024,
      courseType: 'Core Theory',
    },
    {
      filename: 'OS-Lab-Manual-Unix-Shell.html',
      title: 'Unix Shell Scripting, Semaphore IPC & Threads Lab Manual',
      category: 'Lab Manual',
      semester: 5,
      year: 2024,
      courseType: 'Practical / Lab',
    },
    {
      filename: 'Engg-Math-Fourier-Laplace-Notes.html',
      title: 'Engineering Mathematics III (Fourier Series, Laplace Transforms & Differential Equations Notes)',
      category: 'Lecture Notes',
      semester: 3,
      branch: 'General',
      year: 2024,
      courseType: 'Core Theory',
    },
    // DSAI Samples
    {
      filename: 'Deep-Learning-Neural-Nets-PYQ.html',
      title: 'Deep Learning & Neural Architectures End-Sem Solved PYQ 2024 (Backprop, CNNs, Attention & Transformers)',
      category: 'PYQ',
      semester: 6,
      branch: 'DSAI',
      year: 2024,
      courseType: 'Core Theory',
    },
    {
      filename: 'Probability-Stats-ML-Notes.html',
      title: 'Probability, Statistics & Bayesian Inference Lecture Notes for Data Science & AI',
      category: 'Lecture Notes',
      semester: 4,
      branch: 'DSAI',
      year: 2024,
      courseType: 'Core Theory',
    },
    {
      filename: 'PyTorch-DataScience-Lab-Manual.html',
      title: 'Machine Learning & Data Science with PyTorch Lab Manual (PCA, Regression, Gradient Descent)',
      category: 'Lab Manual',
      semester: 5,
      branch: 'DSAI',
      year: 2024,
      courseType: 'Practical / Lab',
    },
    // ECE Samples
    {
      filename: 'DSP-Filter-Design-Solved-PYQ.html',
      title: 'Digital Signal Processing (DSP) & Filter Design Solved End-Sem PYQ 2024 (Z-Transform, FFT & IIR/FIR)',
      category: 'PYQ',
      semester: 5,
      branch: 'ECE',
      year: 2024,
      courseType: 'Core Theory',
    },
    {
      filename: 'Signals-and-Systems-Notes.html',
      title: 'Signals & Systems Comprehensive Lecture Notes (Continuous & Discrete Fourier Transforms, LTI Systems)',
      category: 'Lecture Notes',
      semester: 3,
      branch: 'ECE',
      year: 2024,
      courseType: 'Core Theory',
    },
    {
      filename: 'Microprocessors-8086-Lab-Manual.html',
      title: 'Microprocessors 8086 & Embedded ARM Microcontroller Architecture Lab Manual',
      category: 'Lab Manual',
      semester: 5,
      branch: 'ECE',
      year: 2024,
      courseType: 'Practical / Lab',
    },
  ];

  for (const item of sampleFiles) {
    const filePath = path.join(uploadsDir, item.filename);
    if (!fs.existsSync(filePath)) {
      const htmlContent = generateAcademicDocumentHtml(item);
      fs.writeFileSync(filePath, htmlContent, 'utf-8');
    }
  }
}
