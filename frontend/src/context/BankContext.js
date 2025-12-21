import React, { createContext, useContext, useState, useEffect } from 'react';

const BankContext = createContext();

export const useBankContext = () => {
  const context = useContext(BankContext);
  if (!context) {
    throw new Error('useBankContext must be used within a BankProvider');
  }
  return context;
};

export const BankProvider = ({ children }) => {
  // Current logged-in user
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // All users data
  const [users, setUsers] = useState([
    {
      id: 1,
      name: 'Jamie Doe',
      email: 'jamie@example.com',
      accountNumber: '****4892',
      balance: 48920.15,
      checking: 18400.00,
      savings: 30520.15,
      transactions: [
        { id: 1, date: '2025-12-20', description: 'Grocery Store', amount: -152.43, category: 'Shopping', status: 'completed' },
        { id: 2, date: '2025-12-19', description: 'Salary Deposit', amount: 5200.00, category: 'Income', status: 'completed' },
        { id: 3, date: '2025-12-18', description: 'Coffee Shop', amount: -8.50, category: 'Dining', status: 'completed' },
      ],
      pendingTransactions: [],
    },
    {
      id: 2,
      name: 'Alex Smith',
      email: 'alex@example.com',
      accountNumber: '****3421',
      balance: 25300.50,
      checking: 12500.00,
      savings: 12800.50,
      transactions: [
        { id: 1, date: '2025-12-21', description: 'Rent Payment', amount: -1500.00, category: 'Bills', status: 'completed' },
        { id: 2, date: '2025-12-20', description: 'Freelance Income', amount: 3200.00, category: 'Income', status: 'completed' },
      ],
      pendingTransactions: [],
    },
  ]);

  // Admin pending approvals
  const [pendingApprovals, setPendingApprovals] = useState([]);

  // Backend: helper to call API with cookies
  const apiBase = process.env.REACT_APP_API_BASE || 'http://localhost:5000/api';

  const fetchProfile = async () => {
    try {
      const res = await fetch(`${apiBase}/auth/profile`, {
        method: 'GET',
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser({
          id: data.user._id || data.user.id,
          name: `${data.user.firstName} ${data.user.lastName}`.trim() || data.user.email,
          email: data.user.email,
          phone: data.user.phone,
          avatarUrl: data.user.avatarUrl,
          accountNumber: '****' + String(Math.floor(1000 + Math.random() * 9000)),
          balance: data.user.balance ?? 0,
          checking: (data.user.accounts?.find(a => a.accountType==='checking')?.balance) ?? 0,
          savings: (data.user.accounts?.find(a => a.accountType==='savings')?.balance) ?? 0,
          transactions: [],
          pendingTransactions: [],
        });
        setIsAuthenticated(true);
        return true;
      }
      // Silently handle non-200 responses (401, 403, etc. are expected when no session)
      setIsAuthenticated(false);
      setCurrentUser(null);
      return false;
    } catch (err) {
      setIsAuthenticated(false);
      setCurrentUser(null);
      return false;
    }
  };

  // Initialize auth on mount
  useEffect(() => {
    const hasSession = typeof window !== 'undefined' && localStorage.getItem('hasSession') === 'true';
    if (hasSession) {
      fetchProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Login function via backend
  const login = async (email, password) => {
    try {
      const res = await fetch(`${apiBase}/auth/login`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        return { success: false, message: errorData.message || 'Login failed' };
      }
      await fetchProfile();
      if (typeof window !== 'undefined') {
        localStorage.setItem('hasSession', 'true');
      }
      return { success: true };
    } catch {
      return { success: false, message: 'Network error. Please try again.' };
    }
  };

  // Signup function
  const signup = async (userData) => {
    try {
      const nameParts = userData.name?.trim().split(/\s+/) || [];
      const firstName = nameParts[0] || userData.firstName || '';
      const lastName = nameParts.slice(1).join(' ') || userData.lastName || 'User';
      
      const res = await fetch(`${apiBase}/auth/register`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userData.email,
          password: userData.password,
          firstName,
          lastName,
          phone: userData.phone || undefined,
        }),
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        return { success: false, message: errorData.message || errorData.errors?.[0]?.msg || 'Registration failed' };
      }
      
      const data = await res.json();

      // Server now sets auth cookies on register; fetch profile to hydrate state.
      await fetchProfile();
      if (typeof window !== 'undefined') {
        localStorage.setItem('hasSession', 'true');
      }

      return { success: true, message: data.message, verificationLink: data.verificationLink };
    } catch (err) {
      return { success: false, message: 'Network error. Please try again.' };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await fetch(`${apiBase}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch {}
    setCurrentUser(null);
    setIsAuthenticated(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('hasSession');
    }
  };

  // Update profile
  const updateProfile = async (profileData) => {
    try {
      const res = await fetch(`${apiBase}/auth/profile`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        return { success: false, message: errorData.message || 'Update failed' };
      }
      const data = await res.json();
      setCurrentUser((prev) => ({
        ...prev,
        name: `${data.user.firstName} ${data.user.lastName}`.trim() || data.user.email,
        email: data.user.email,
        phone: data.user.phone,
        avatarUrl: data.user.avatarUrl,
      }));
      return { success: true, message: data.message, user: data.user };
    } catch (err) {
      return { success: false, message: 'Network error. Please try again.' };
    }
  };

  // Add transaction (pending admin approval for large amounts)
  const addTransaction = (userId, transaction) => {
    const needsApproval = Math.abs(transaction.amount) > 1000;
    
    setUsers(prevUsers => prevUsers.map(user => {
      if (user.id === userId) {
        if (needsApproval) {
          // Add to pending transactions
          const pendingTransaction = {
            ...transaction,
            id: Date.now(),
            status: 'pending',
            userId: userId,
            userName: user.name,
          };
          setPendingApprovals(prev => [...prev, pendingTransaction]);
          return {
            ...user,
            pendingTransactions: [...user.pendingTransactions, pendingTransaction],
          };
        } else {
          // Auto-approve small transactions
          const newTransaction = {
            ...transaction,
            id: Date.now(),
            status: 'completed',
          };
          return {
            ...user,
            balance: user.balance + transaction.amount,
            checking: transaction.accountType === 'checking' 
              ? user.checking + transaction.amount 
              : user.checking,
            savings: transaction.accountType === 'savings' 
              ? user.savings + transaction.amount 
              : user.savings,
            transactions: [newTransaction, ...user.transactions],
          };
        }
      }
      return user;
    }));

    // Update current user if it's them
    if (currentUser?.id === userId) {
      setCurrentUser(prev => {
        const updatedUser = users.find(u => u.id === userId);
        return updatedUser || prev;
      });
    }
  };

  // Admin approve transaction
  const approveTransaction = (transactionId) => {
    const approval = pendingApprovals.find(t => t.id === transactionId);
    if (!approval) return;

    setUsers(prevUsers => prevUsers.map(user => {
      if (user.id === approval.userId) {
        return {
          ...user,
          balance: user.balance + approval.amount,
          checking: approval.accountType === 'checking' 
            ? user.checking + approval.amount 
            : user.checking,
          savings: approval.accountType === 'savings' 
            ? user.savings + approval.amount 
            : user.savings,
          transactions: [
            { ...approval, status: 'completed' },
            ...user.transactions,
          ],
          pendingTransactions: user.pendingTransactions.filter(t => t.id !== transactionId),
        };
      }
      return user;
    }));

    setPendingApprovals(prev => prev.filter(t => t.id !== transactionId));
  };

  // Admin reject transaction
  const rejectTransaction = (transactionId) => {
    setUsers(prevUsers => prevUsers.map(user => ({
      ...user,
      pendingTransactions: user.pendingTransactions.filter(t => t.id !== transactionId),
    })));

    setPendingApprovals(prev => prev.filter(t => t.id !== transactionId));
  };

  // Admin update user balance
  const updateUserBalance = (userId, field, amount) => {
    setUsers(prevUsers => prevUsers.map(user => {
      if (user.id === userId) {
        const updatedUser = { ...user };
        if (field === 'checking') {
          updatedUser.checking = amount;
          updatedUser.balance = amount + user.savings;
        } else if (field === 'savings') {
          updatedUser.savings = amount;
          updatedUser.balance = user.checking + amount;
        } else if (field === 'balance') {
          updatedUser.balance = amount;
        }
        return updatedUser;
      }
      return user;
    }));
  };

  // Transfer between accounts
  const transferMoney = (fromUserId, toEmail, amount, fromAccount = 'checking') => {
    const recipient = users.find(u => u.email === toEmail);
    if (!recipient) return { success: false, message: 'Recipient not found' };

    const transaction = {
      date: new Date().toISOString().split('T')[0],
      description: `Transfer to ${recipient.name}`,
      amount: -amount,
      category: 'Transfer',
      accountType: fromAccount,
    };

    addTransaction(fromUserId, transaction);

    // Add to recipient
    const recipientTransaction = {
      date: new Date().toISOString().split('T')[0],
      description: `Transfer from ${currentUser.name}`,
      amount: amount,
      category: 'Transfer',
      accountType: 'checking',
    };
    addTransaction(recipient.id, recipientTransaction);

    return { success: true, message: 'Transfer initiated' };
  };

  // Pay bill
  const payBill = (userId, billData) => {
    const transaction = {
      date: new Date().toISOString().split('T')[0],
      description: `Bill Payment: ${billData.payee}`,
      amount: -billData.amount,
      category: 'Bills',
      accountType: billData.fromAccount,
    };
    addTransaction(userId, transaction);
  };

  const value = {
    currentUser,
    isAuthenticated,
    users,
    pendingApprovals,
    login,
    signup,
    logout,
    updateProfile,
    addTransaction,
    approveTransaction,
    rejectTransaction,
    updateUserBalance,
    transferMoney,
    payBill,
  };

  return <BankContext.Provider value={value}>{children}</BankContext.Provider>;
};
