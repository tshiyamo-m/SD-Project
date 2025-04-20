import React, { useState } from 'react';
import './finance.css';

const Finance = () => {
  const [funds, setFunds] = useState([
    { id: 1, amount: 4200, purpose: 'To monitor and display budget usage', source: 'U-Collab', amountUsed: 2000 }
  ]);
  const [showForm, setShowForm] = useState(false);
  const [newFund, setNewFund] = useState({ amount: '', purpose: '', source: '' });

  const totalSpent = funds.reduce((sum, fund) => sum + fund.amountUsed, 0);
  const totalBudget = funds.reduce((sum, fund) => sum + fund.amount, 0);
  const remainingBudget = totalBudget - totalSpent;
  const percentageUsed = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

  const handleAddFund = (e) => {
    e.preventDefault();
    setFunds([...funds, {
      id: funds.length + 1,
      amount: Number(newFund.amount),
      purpose: newFund.purpose,
      source: newFund.source,
      amountUsed: 0
    }]);
    setNewFund({ amount: '', purpose: '', source: '' });
    setShowForm(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewFund(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="finance-page">
      <h2>Finances</h2>
      
      <button className="toggle-form" onClick={() => setShowForm(!showForm)}>
        {showForm ? 'Cancel' : 'Add Fund'}
      </button>

      {showForm && (
        <form onSubmit={handleAddFund} className="fund-form">
          <div className="form-group">
            <label>Amount:</label>
            <input
              type="number"
              name="amount"
              value={newFund.amount}
              onChange={handleInputChange}
              placeholder="R4200"
              required
            />
          </div>
          <div className="form-group">
            <label>Purpose:</label>
            <input
              type="text"
              name="purpose"
              value={newFund.purpose}
              onChange={handleInputChange}
              placeholder="To monitor budget usage"
              required
            />
          </div>
          <div className="form-group">
            <label>Source:</label>
            <input
              type="text"
              name="source"
              value={newFund.source}
              onChange={handleInputChange}
              placeholder="Organization/Person"
              required
            />
          </div>
          <button type="submit">Add</button>
        </form>
      )}

      <div className="budget-summary">
        <div className="summary-item">
          <span>Total Spent:</span>
          <span>R{totalSpent.toLocaleString()}</span>
        </div>
        <div className="summary-item">
          <span>Remaining Budget:</span>
          <span>R{remainingBudget.toLocaleString()}</span>
        </div>
        <div className="summary-item">
          <span>Percentage Used:</span>
          <span>{percentageUsed}%</span>
        </div>
      </div>

      <div className="funds-list">
        {funds.map(fund => (
          <div key={fund.id} className="fund-card">
            <div className="fund-header">
              <h3>{fund.source}</h3>
              <span>R{fund.amount.toLocaleString()}</span>
            </div>
            <p>{fund.purpose}</p>
            <div className="fund-usage">
              <span>Used: R{fund.amountUsed.toLocaleString()}</span>
              <span>({Math.round((fund.amountUsed / fund.amount) * 100)}%)</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Finance;
