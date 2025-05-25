import React, { useEffect, useState, useRef, useCallback } from 'react';
import './dashboard.css';
import { getFinance } from '../utils/financeUtils';
import { getAllProjects } from '../utils/projectUtils';
import html2pdf from 'html2pdf.js';


const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [funds, setFunds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const pdfFundingRef = useRef(null);
  const pdfProjectsRef = useRef(null);
  const [isDownloading, SetIsDownloading] = useState(false);

  const userId = localStorage.getItem('Mongo_id');

  // Calculate overall funding stats
  const totalSpent = funds.reduce((sum, fund) => sum + fund.amountUsed, 0);
  const totalBudget = funds.reduce((sum, fund) => sum + fund.amount, 0);
  const remainingBudget = totalBudget - totalSpent;
  const percentageUsed = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

  // Calculate per-project funding stats
  const getProjectFundingStats = (projectId) => {
    const projectFunds = funds.filter(fund => fund.purpose === projectId);
    const projectSpent = projectFunds.reduce((sum, fund) => sum + fund.amountUsed, 0);
    const projectBudget = projectFunds.reduce((sum, fund) => sum + fund.amount, 0);
    const projectRemaining = projectBudget - projectSpent;
    const projectPercentage = projectBudget > 0 ? Math.round((projectSpent / projectBudget) * 100) : 0;
    
    return {
      spent: projectSpent,
      budget: projectBudget,
      remaining: projectRemaining,
      percentage: projectPercentage
    };
  };

const fetchData = useCallback(async () => {
  try {
    setIsLoading(true);
    
    // Fetch projects
    const projectsData = await getAllProjects(userId);
    const formattedProjects = Array.isArray(projectsData) ? 
      projectsData.map(project => ({
        id: project._id,
        title: project.title,
        startDate: project.startDate,
        endDate: project.endDate,
        status: project.status
      })) : [];
    
    // Fetch funds
    const fundsData = await getFinance(userId);
    const formattedFunds = Array.isArray(fundsData) ? 
      fundsData.map(fund => ({
        id: fund._id,
        amount: fund.amount,
        purpose: fund.purpose,
        source: fund.source,
        amountUsed: fund.used,
      })) : [];

    setProjects(formattedProjects);
    setFunds(formattedFunds);
    
  } catch (error) {
    setError(error.message);
  } finally {
    setIsLoading(false);
  }
}, [userId, /*getAllProjects, getFinance,*/ setProjects, setFunds, setIsLoading, setError]);

  useEffect(() => {
    fetchData();
  }, [userId, fetchData]);

  if (isLoading) return <section className="loading"><p>Loading...</p></section>;
  if (error) return <section className="error"><p>Error: {error}</p></section>;

 const exportProjectsToCSV = () => {
    SetIsDownloading(true);
    if (!projects.length) return;
    
    const headers = ['Title', 'Start Date', 'End Date', 'Status'];
    const rows = projects.map(project => [
      `"${project.title}"`,
      new Date(project.startDate).toLocaleDateString(),
      new Date(project.endDate).toLocaleDateString(),
      project.status
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    downloadCSV(csvContent, 'projects_export.csv');
    SetIsDownloading(false);
  };
const exportProjectsToPDF = () => {
  SetIsDownloading(true);
  if (!projects.length) return;

  const content = `
    <h1>Projects Report</h1>
    <table border="1" cellpadding="5" cellspacing="0">
      <thead>
        <tr>
          <th>Title</th>
          <th>Start Date</th>
          <th>End Date</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        ${projects.map(project => `
          <tr>
            <td>${project.title}</td>
            <td>${new Date(project.startDate).toLocaleDateString()}</td>
            <td>${new Date(project.endDate).toLocaleDateString()}</td>
            <td>${project.status}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;

  const opt = {
    margin: 10,
    filename: 'projects_report.pdf',
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  html2pdf().set(opt).from(content).save();
  SetIsDownloading(false);
};

  const exportFundingToCSV = () => {
    SetIsDownloading(true);
    if (!funds.length) return;
    
    const headers = ['Project', 'Source', 'Budget', 'Spent', 'Remaining', 'Percentage Used'];
    const rows = projects.map(project => {
      const stats = getProjectFundingStats(project.id);
      return [
        `"${project.title}"`,
        `"${funds.find(f => f.purpose === project.id)?.source || 'N/A'}"`,
        `R${stats.budget.toLocaleString()}`,
        `R${stats.spent.toLocaleString()}`,
        `R${stats.remaining.toLocaleString()}`,
        `${stats.percentage}%`
      ];
    });
    
    // Add summary row
    rows.push([
      '"TOTAL"',
      '""',
      `R${totalBudget.toLocaleString()}`,
      `R${totalSpent.toLocaleString()}`,
      `R${remainingBudget.toLocaleString()}`,
      `${percentageUsed}%`
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    downloadCSV(csvContent, 'funding_export.csv');
    SetIsDownloading(false);
  };

  const downloadCSV = (content, filename) => {
    const blob = new Blob([content], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };
 
const exportFundingToPDF = () => {
  SetIsDownloading(true);
  if (!projects.length) return;

  const content = `
    <h1>Funding Report</h1>
    <h2>Total Across All Projects</h2>
    <table border="1" cellpadding="5" cellspacing="0">
      <thead>
        <tr>
          <th>Total Budget</th>
          <th>Total Spent</th>
          <th>Remaining</th>
          <th>Percentage Used</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>R${totalBudget.toLocaleString()}</td>
          <td>R${totalSpent.toLocaleString()}</td>
          <td>R${remainingBudget.toLocaleString()}</td>
          <td>${percentageUsed}%</td>
        </tr>
      </tbody>
    </table>

    <h2>Per Project Breakdown</h2>
    <table border="1" cellpadding="5" cellspacing="0">
      <thead>
        <tr>
          <th>Project</th>
          <th>Source</th>
          <th>Budget</th>
          <th>Spent</th>
          <th>Remaining</th>
          <th>Percentage Used</th>
        </tr>
      </thead>
      <tbody>
        ${projects.map(project => {
          const stats = getProjectFundingStats(project.id);
          return `
            <tr>
              <td>${project.title}</td>
              <td>${funds.find(f => f.purpose === project.id)?.source || 'N/A'}</td>
              <td>R${stats.budget.toLocaleString()}</td>
              <td>R${stats.spent.toLocaleString()}</td>
              <td>R${stats.remaining.toLocaleString()}</td>
              <td>${stats.percentage}%</td>
            </tr>
          `;
        }).join('')}
      </tbody>
    </table>
  `;

  const opt = {
    margin: 10,
    filename: 'funding_report.pdf',
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  html2pdf().set(opt).from(content).save();
  SetIsDownloading(false);
};
  return (
    <main className="dashboard-container">
      <header className="dashboard-header">
        <h1 className="dashboard-title">Dashboard</h1>
      </header>
      
      <section className="dashboard-section" ref={pdfProjectsRef} id="projects-container">
        <header className="section-header">
          <h2 className="sectiontitle">Projects</h2>
        </header>
        
        <section className="section-content">
          {projects.length > 0 ? (
            <section className="projects-grid" role="list">
              {projects.map(project => (
                <article key={project.id} className="project-card" role="listitem">
                  <h3 className="project-title">{project.title}</h3>
                  <section className="project-dates">
                    <time dateTime={project.startDate}>
                      {new Date(project.startDate).toLocaleDateString()}
                    </time>
                    <span> - </span>
                    <time dateTime={project.endDate}>
                      {new Date(project.endDate).toLocaleDateString()}
                    </time>
                  </section>
                  <section className={`project-status ${project.status.toLowerCase().replace(' ', '-')}`}>
                    {project.status}
                  </section>
                </article>
              ))}
            </section>
          ) : (
            <p className="no-data">No projects found</p>
          )}
        </section>
        
       <footer className="section-footer">
          <button 
            className="section-button" 
            onClick={exportProjectsToCSV}
            disabled={!projects.length || isDownloading}
          >
            Download CSV
          </button>
          <button 
            onClick={exportProjectsToPDF}
            disabled={isDownloading}         
          >Download PDF</button>
        </footer>
      </section>
      
      <section className="dashboard-section" ref={pdfFundingRef} id="funding-container">
        <header className="section-header">
          <h2 className="sectiontitle">Funding Overview</h2>
        </header>
        
        <section className="section-content">
          {/* Overall Funding Stats */}
          <section className="funding-overview">
            <h3>Total Across All Projects</h3>
            <section className="funding-stats" role="list">
              <article className="stat-card" role="listitem">
                <p className="stat-number">R{totalBudget.toLocaleString()}</p>
                <h3 className="stat-title">Total Budget</h3>
              </article>
              
              <article className="stat-card" role="listitem">
                <p className="stat-number">R{totalSpent.toLocaleString()}</p>
                <h3 className="stat-title">Total Spent ({percentageUsed}%)</h3>
              </article>
              
              <article className="stat-card" role="listitem">
                <p className="stat-number">R{remainingBudget.toLocaleString()}</p>
                <h3 className="stat-title">Remaining Budget</h3>
              </article>
            </section>
          </section>
          
          {/* Per-Project Funding Breakdown */}
          <section className="project-funding-breakdown">
            <h3>Per Project Breakdown</h3>
            {projects.length > 0 ? (
              <section role="list">
                {projects.map(project => {
                  const stats = getProjectFundingStats(project.id);
                  return (
                    <details key={project.id} className="project-funding-details" role="listitem">
                      <summary className="project-funding-summary">
                        {project.title} - Budget: R{stats.budget.toLocaleString()}
                      </summary>
                      <section className="project-funding-stats" role="list">
                        <article className="stat-card" role="listitem">
                          <p className="stat-number">R{stats.spent.toLocaleString()}</p>
                          <h3 className="stat-title">Spent ({stats.percentage}%)</h3>
                        </article>
                        <article className="stat-card" role="listitem">
                          <p className="stat-number">R{stats.remaining.toLocaleString()}</p>
                          <h3 className="stat-title">Remaining</h3>
                        </article>
                      </section>
                    </details>
                  );
                })}
              </section>
            ) : (
              <p className="no-data">No projects with funding data</p>
            )}
          </section>
        </section>
        
        <footer className="section-footer">
          <button 
            className="section-button" 
            onClick={exportFundingToCSV}
            disabled={!funds.length || isDownloading}
          >
            Download CSV
          </button>
            <button 
              onClick={exportFundingToPDF}
              disabled={isDownloading}           
            >Download PDF</button>
        </footer>
      </section>
    </main>
  );
};

export default Dashboard;
