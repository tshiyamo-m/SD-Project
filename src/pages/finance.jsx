import React, {useEffect, useState} from 'react';
import './finance.css';
import {createFinance, getFinance, updateFinance} from '../utils/financeUtils'

const Finance = () => {
  const Id = localStorage.getItem('Mongo_id');
  const [funds, setFunds] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newFund, setNewFund] = useState({ amount: '', purpose: '', source: '' });
  const [addAmounts, setAddAmounts] = useState({});
  const [activeTab, setActiveTab] = useState('active');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const totalSpent = funds.reduce((sum, fund) => sum + fund.amountUsed, 0);
  const totalBudget = funds.reduce((sum, fund) => sum + fund.amount, 0);
  const remainingBudget = totalBudget - totalSpent;
  const percentageUsed = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

  const activeFunds = funds.filter(fund => fund.amountUsed < fund.amount);
  const exhaustedFunds = funds.filter(fund => fund.amountUsed >= fund.amount);

  const fetchFunds = async () => {
    try {
      const Finance_data = await getFinance(Id);

      if (!Array.isArray(Finance_data)) {
        console.warn('API response is not an array:', Finance_data);
        return [];
      }
      return Finance_data.map((fund) => ({
        id: fund._id,
        amount: fund.amount,
        purpose: fund.purpose,
        source: fund.source,
        amountUsed: fund.used,
      }));
    } catch(error) {
      console.error('Error finding funds:', error);
      setError(error.message);
      return [];
    }
  }

  const loadFunds = async () => {
    setIsLoading(true);
    try {
      const funds = await fetchFunds();
      setFunds(funds);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {

    fetchFunds()
    loadFunds();
  }, [Id]);

  const handleAddFund = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const Data = {
        amount: Number(newFund.amount),
        used: 0,
        userId: Id,
        source: newFund.source,
        purpose: newFund.purpose
      }

      const result = await createFinance(Data);

      setFunds([...funds, {
        id: result._id,
        amount: Number(newFund.amount),
        purpose: newFund.purpose,
        source: newFund.source,
        amountUsed: 0
      }]);

      setNewFund({ amount: '', purpose: '', source: '' });
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
      // Find the fund to get current amountUsed
      const fund = funds.find(f => f.id === id);
      if (!fund) return;

      const available = fund.amount - fund.amountUsed;
      const actualAddition = Math.min(amountToAdd, available);
      const newAmountUsed = fund.amountUsed + actualAddition;

      // Update the fund in the database
      /*const response = await fetch('/api/Finance/update', {
        method: 'POST',
        body: JSON.stringify({
          id: id,
          used: newAmountUsed
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to update fund');
      }*/
      const Data = {
        id: id,
        used: newAmountUsed
      }
      await updateFinance(Data);

      // Update local state only after successful API call
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
                  Purpose:
                  <input
                      type="text"
                      name="purpose"
                      value={newFund.purpose}
                      onChange={handleInputChange}
                      placeholder="To monitor budget usage"
                      required
                  />
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
                              <h4>{fund.source}</h4>
                              <p>R{fund.amount.toLocaleString()}</p>
                            </header>
                            <p>{fund.purpose}</p>
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
                            <p>{fund.purpose}</p>
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
      </main>
  );
};

export default Finance;