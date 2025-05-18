import React, {useEffect, useState, useCallback} from 'react';
import './finance.css';
import {createFinance, getFinance, updateFinance} from '../utils/financeUtils'
import { getAllProjects } from '../utils/projectUtils';
import {toast, Toaster} from "sonner";

const Finance = () => {  
  const Id = localStorage.getItem('Mongo_id');
  const [funds, setFunds] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newFund, setNewFund] = useState({ amount: '', purpose: '', source: '' });
  const [addAmounts, setAddAmounts] = useState({});
  const [activeTab, setActiveTab] = useState('active');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');

  const totalSpent = funds.reduce((sum, fund) => sum + fund.amountUsed, 0);
  const totalBudget = funds.reduce((sum, fund) => sum + fund.amount, 0);
  const remainingBudget = totalBudget - totalSpent;
  const percentageUsed = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

  const activeFunds = funds.filter(fund => fund.amountUsed < fund.amount);
  const exhaustedFunds = funds.filter(fund => fund.amountUsed >= fund.amount);

const fetchProjects = useCallback(async (Id) => {
    try {
        const Project_data = await getAllProjects(Id);
        
        if (!Array.isArray(Project_data)) {
            console.warn('API response is not an array:', Project_data);
            return [];
        }

        return Project_data.map((project) => ({
            id: project._id,
            title: project.title,
        }));

    } catch (error) {
        console.error('Error fetching projects:', error);
        return []; // Consistent return type
    }
}, [getAllProjects]); // Dependency: getAllProjects

const fetchFunds = useCallback(async () => {
    try {
        const Finance_data = await getFinance(Id);

        if (!Array.isArray(Finance_data)) {
            console.warn('API response is not an array:', Finance_data);
            return [];
        }

        return Finance_data.map((fund) => ({
            id: fund._id,
            amount: fund.amount,
            purpose: fund.purpose,  // Project ID
            source: fund.source,
            amountUsed: fund.used,
            // Consider adding:
            // date: fund.date,
            // status: fund.status
        }));

    } catch (error) {
        console.error('Error fetching funds:', error);
        setError(error.message);
        return []; // Consistent fallback
    }
}, [Id, getFinance, setError]); // All dependencies included

const loadFunds = useCallback(async () => {
  setIsLoading(true);
  try {
    const funds = await fetchFunds();
    setFunds(funds);
  } catch (error) {
    setError(error.message);
  } finally {
    setIsLoading(false);
  }
}, [fetchFunds, setFunds, setIsLoading, setError]); // Dependencies

const loadProjects = useCallback(async () => {
  setIsLoading(true);
  try {
    const projects = await fetchProjects(Id);
    setProjects(projects);
  } catch (error) {
    setError(error.message);
  } finally {
    setIsLoading(false);
  }
}, [Id, fetchProjects, setProjects, setIsLoading, setError]); // All dependencies included

  useEffect(() => {
    loadFunds();
    loadProjects();
  }, [Id, loadFunds, loadProjects]); //load functions in dependency array creating a weird glitchly effect

  const handleAddFund = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const selectedProject = projects.find(project => project.id === selectedProjectId);
      if (!selectedProject) {
        throw new Error('Please select a valid project');
      }

      const Data = {
        amount: Number(newFund.amount),
        used: 0,
        userId: Id,
        source: newFund.source,
        purpose: selectedProjectId // Store project ID as purpose
      }

      const result = await createFinance(Data);

      setFunds([...funds, {
        id: result._id,
        amount: Number(newFund.amount),
        purpose: selectedProjectId, // Store project ID
        source: newFund.source,
        amountUsed: 0
      }]);
      toast.success("New fund added successfully.", {
        style: { backgroundColor: "green", color: "white" },
      });

      setNewFund({ amount: '', source: '' });
      setSelectedProjectId('');
      setShowForm(false);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewFund(prev => ({ ...prev, [name]: value }));
  };

  const handleProjectChange = (e) => {
    setSelectedProjectId(e.target.value);
  };

  const handleAddAmountChange = (id, value) => {
    setAddAmounts(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const increaseAmountUsed = async (id) => {
    const amountToAdd = Number(addAmounts[id] || 0);
    if (isNaN(amountToAdd) || amountToAdd <= 0) return;

    setIsLoading(true);
    setError(null);

    try {
      const fund = funds.find(f => f.id === id);
      if (!fund) return;

      const available = fund.amount - fund.amountUsed;
      const actualAddition = Math.min(amountToAdd, available);
      const newAmountUsed = fund.amountUsed + actualAddition;

      const Data = {
        id: id,
        used: newAmountUsed
      }
      await updateFinance(Data);

      toast.success("Increased amount used", {
        style: { backgroundColor: "green", color: "white" },
      });

      setFunds(funds.map(fund => {
        if (fund.id === id) {
          return {
            ...fund,
            amountUsed: newAmountUsed
          };
        }
        return fund;
      }));

      setAddAmounts(prev => ({
        ...prev,
        [id]: ''
      }));
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to get project title by ID
  const getProjectTitle = (projectId) => {
    const project = projects.find(p => p.id === projectId);
    return project ? project.title : 'Unknown Project';
  };

  return (
      <main className="finance-page">
        <h2>Finances</h2>

        {error && <p className="error-message">{error}</p>}
        {isLoading && <p>Loading...</p>}

        <button className="toggle-form" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Add Fund'}
        </button>

        {showForm && (
            <form onSubmit={handleAddFund} className="fund-form">
              <fieldset>
                <legend>Add New Fund</legend>
                <label>
                  Amount:
                  <input
                      type="number"
                      name="amount"
                      value={newFund.amount}
                      onChange={handleInputChange}
                      placeholder="R4200"
                      required
                      min="0"
                  />
                </label>
                <label>
                  Project:
                  <select
                      value={selectedProjectId}
                      onChange={handleProjectChange}
                      required
                  >
                    <option value="">Select a project</option>
                    {projects.map(project => (
                        <option key={project.id} value={project.id}>
                          {project.title}
                        </option>
                    ))}
                  </select>
                </label>
                <label>
                  Source:
                  <input
                      type="text"
                      name="source"
                      value={newFund.source}
                      onChange={handleInputChange}
                      placeholder="Organization/Person"
                      required
                  />
                </label>
                <button type="submit" disabled={isLoading}>
                  {isLoading ? 'Adding...' : 'Add'}
                </button>
              </fieldset>
            </form>
        )}

        <section className="budget-summary">
          <h3>Budget Summary</h3>
          <p>
            <strong>Total Budget:</strong> R{totalBudget.toLocaleString()}
          </p>
          <p>
            <strong>Total Spent:</strong> R{totalSpent.toLocaleString()}
          </p>
          <p>
            <strong>Remaining Budget:</strong> R{remainingBudget.toLocaleString()}
          </p>
          <p>
            <strong>Percentage Used:</strong> {percentageUsed}%
          </p>
        </section>

        <nav className="fund-tabs">
          <button
              className={activeTab === 'active' ? 'active' : ''}
              onClick={() => setActiveTab('active')}
          >
            Active Funds ({activeFunds.length})
          </button>
          <button
              className={activeTab === 'exhausted' ? 'active' : ''}
              onClick={() => setActiveTab('exhausted')}
          >
            Exhausted Funds ({exhaustedFunds.length})
          </button>
        </nav>

        <section className="funds-list">
          {activeTab === 'active' ? (
              <>
                <h3>Active Funds</h3>
                {activeFunds.length > 0 ? (
                    activeFunds.map(fund => {
                      const available = fund.amount - fund.amountUsed;
                      const percentageUsed = Math.round((fund.amountUsed / fund.amount) * 100);

                      return (
                          <article key={fund.id} className="fund-card">
                            <header className="fund-header">
                              <h4>For: {getProjectTitle(fund.purpose)}</h4>
                              <p>R{fund.amount.toLocaleString()}</p>
                            </header>
                            <p>Source: {fund.source}</p>
                            <footer className="fund-usage">
                              <p>Used: R{fund.amountUsed.toLocaleString()} ({percentageUsed}%)</p>
                              <p>Available: R{available.toLocaleString()}</p>
                              <form onSubmit={(e) => {
                                e.preventDefault();
                                increaseAmountUsed(fund.id);
                              }}>
                                <label>
                                  Add amount:
                                  <input
                                      type="number"
                                      value={addAmounts[fund.id] || ''}
                                      onChange={(e) => handleAddAmountChange(fund.id, e.target.value)}
                                      min="0"
                                      max={available}
                                      placeholder={`Max R${available}`}
                                  />
                                </label>
                                <button type="submit" disabled={!addAmounts[fund.id] || addAmounts[fund.id] <= 0 || isLoading}>
                                  {isLoading ? 'Updating...' : 'Add'}
                                </button>
                              </form>
                            </footer>
                          </article>
                      );
                    })
                ) : (
                    <p>No active funds available</p>
                )}
              </>
          ) : (
              <>
                <h3>Exhausted Funds</h3>
                {exhaustedFunds.length > 0 ? (
                    exhaustedFunds.map(fund => {
                      const percentageUsed = Math.round((fund.amountUsed / fund.amount) * 100);

                      return (
                          <article key={fund.id} className="fund-card exhausted">
                            <header className="fund-header">
                              <h4>{fund.source}</h4>
                              <p>R{fund.amount.toLocaleString()}</p>
                            </header>
                            <p>{getProjectTitle(fund.purpose)}</p>
                            <footer className="fund-usage">
                              <p>Fully utilized: R{fund.amountUsed.toLocaleString()} ({percentageUsed}%)</p>
                            </footer>
                          </article>
                      );
                    })
                ) : (
                    <p>No exhausted funds</p>
                )}
              </>
          )}
        </section>
        <Toaster position="bottom-right" />
      </main>
  );
};

export default Finance;