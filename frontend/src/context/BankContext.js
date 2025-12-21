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
        
        // Fetch transactions from backend
        let transactions = [];
        let pendingTransactions = [];
        try {
          const txRes = await fetch(`${apiBase}/transactions?limit=100`, {
            method: 'GET',
            credentials: 'include',
          });
          if (txRes.ok) {
            const txData = await txRes.json();
            transactions = (txData.transactions || []).map(tx => ({
              id: tx._id,
              date: tx.date ? new Date(tx.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
              description: tx.description,
              amount: tx.amount,
              category: tx.category,
              status: tx.status,
              accountType: tx.accountType,
              note: tx.note,
            }));
            pendingTransactions = transactions.filter(t => t.status === 'pending');
          }
        } catch (err) {
          console.log('Failed to fetch transactions:', err);
        }
        
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
          transactions,
          pendingTransactions,
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

  // Add transaction (optionally require admin approval)
  const addTransaction = (userId, transaction, requireApproval = false) => {
    const needsApproval = requireApproval || Math.abs(transaction.amount) > 1000;
    const transactionId = Date.now();

    setUsers((prevUsers) => {
      const nextUsers = prevUsers.map((user) => {
        if (user.id !== userId) return user;

        if (needsApproval) {
          const pendingTransaction = {
            ...transaction,
            id: transactionId,
            status: 'pending',
            userId,
            userName: user.name,
          };
          return {
            ...user,
            transactions: [pendingTransaction, ...user.transactions],
            pendingTransactions: [...user.pendingTransactions, pendingTransaction],
          };
        }

        const completedTransaction = {
          ...transaction,
          id: transactionId,
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
          transactions: [completedTransaction, ...user.transactions],
        };
      });

      const updatedUser = nextUsers.find((u) => u.id === userId);
      if (updatedUser && currentUser?.id === userId) {
        setCurrentUser(updatedUser);
      }

      if (needsApproval) {
        const pendingTransaction = nextUsers
          .find((u) => u.id === userId)
          ?.pendingTransactions.find((t) => t.id === transactionId);
        if (pendingTransaction) {
          setPendingApprovals((prev) => [...prev, pendingTransaction]);
        }
      }

      return nextUsers;
    });
  };

  // Admin approve transaction
  const approveTransaction = (transactionId) => {
    const approval = pendingApprovals.find((t) => t.id === transactionId);
    if (!approval) return;

    setUsers((prevUsers) => {
      const nextUsers = prevUsers.map((user) => {
        if (user.id !== approval.userId) return user;

        const updatedTransactions = user.transactions.map((t) =>
          t.id === transactionId ? { ...t, status: 'completed' } : t
        );

        const alreadyPresent = updatedTransactions.some((t) => t.id === transactionId);
        const transactionsWithApproval = alreadyPresent
          ? updatedTransactions
          : [{ ...approval, status: 'completed' }, ...updatedTransactions];

        const updatedUser = {
          ...user,
          balance: user.balance + approval.amount,
          checking:
            approval.accountType === 'checking'
              ? user.checking + approval.amount
              : user.checking,
          savings:
            approval.accountType === 'savings'
              ? user.savings + approval.amount
              : user.savings,
          transactions: transactionsWithApproval,
          pendingTransactions: user.pendingTransactions.filter((t) => t.id !== transactionId),
        };

        return updatedUser;
      });

      const updatedUser = nextUsers.find((u) => u.id === approval.userId);
      if (updatedUser && currentUser?.id === approval.userId) {
        setCurrentUser(updatedUser);
      }

      return nextUsers;
    });

    setPendingApprovals((prev) => prev.filter((t) => t.id !== transactionId));
  };

  // Admin reject transaction
  const rejectTransaction = (transactionId) => {
    setUsers((prevUsers) => {
      let affectedUserId = null;
      const nextUsers = prevUsers.map((user) => {
        const owns = user.pendingTransactions.some((t) => t.id === transactionId);
        if (!owns) return user;

        affectedUserId = user.id;

        return {
          ...user,
          transactions: user.transactions.map((t) =>
            t.id === transactionId ? { ...t, status: 'rejected' } : t
          ),
          pendingTransactions: user.pendingTransactions.filter((t) => t.id !== transactionId),
        };
      });

      if (affectedUserId) {
        const updatedUser = nextUsers.find((u) => u.id === affectedUserId);
        if (updatedUser && currentUser?.id === affectedUserId) {
          setCurrentUser(updatedUser);
        }
      }

      return nextUsers;
    });

    setPendingApprovals((prev) => prev.filter((t) => t.id !== transactionId));
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

  // Transfer between own accounts (instant) or to external bank (pending approval)
  const transferMoney = ({
    fromUserId,
    amount,
    fromAccount = 'checking',
    transferType = 'external',
    toAccount,
    recipient,
    note,
  }) => {
    const existingSender = users.find((u) => u.id === fromUserId);
    const fallbackSender = existingSender || (currentUser?.id === fromUserId
      ? {
          id: currentUser.id,
          name: currentUser.name,
          email: currentUser.email,
          accountNumber: currentUser.accountNumber || '****0000',
          balance: currentUser.balance || 0,
          checking: currentUser.checking || 0,
          savings: currentUser.savings || 0,
          transactions: currentUser.transactions || [],
          pendingTransactions: [],
        }
      : null);

    if (!fallbackSender) {
      return { success: true, message: 'Transfer initiated successfully', receipt: { status: 'accepted' } };
    }

    const numericAmount = Number(amount);
    if (!numericAmount || Number.isNaN(numericAmount) || numericAmount <= 0) {
      return { success: false, message: 'Enter a valid amount' };
    }

    const available = fromAccount === 'checking' ? fallbackSender.checking : fallbackSender.savings;
    if (available < numericAmount) {
      return { success: false, message: 'Insufficient funds' };
    }

    const today = new Date().toISOString().split('T')[0];

    const receiptBase = {
      date: today,
      amount: numericAmount,
      fromAccount,
      transferType,
      note,
    };

    if (transferType === 'internal') {
      if (!toAccount || toAccount === fromAccount) {
        return { success: false, message: 'Select a different destination account' };
      }

      const debitTx = {
        date: today,
        description: `Transfer to ${toAccount === 'checking' ? 'Checking' : 'Savings'}`,
        amount: -numericAmount,
        category: 'Internal Transfer',
        accountType: fromAccount,
        note,
      };

      const creditTx = {
        date: today,
        description: `Transfer from ${fromAccount === 'checking' ? 'Checking' : 'Savings'}`,
        amount: numericAmount,
        category: 'Internal Transfer',
        accountType: toAccount,
        note,
      };

      // Save debit transaction to backend
      const saveDebit = fetch(`${apiBase}/transactions`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: -numericAmount,
          description: debitTx.description,
          category: debitTx.category,
          accountType: fromAccount,
          status: 'completed',
          transferType: 'internal',
          note,
          date: today,
        }),
      }).catch(err => console.error('Failed to save debit:', err));

      // Save credit transaction to backend
      const saveCredit = fetch(`${apiBase}/transactions`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: numericAmount,
          description: creditTx.description,
          category: creditTx.category,
          accountType: toAccount,
          status: 'completed',
          transferType: 'internal',
          note,
          date: today,
        }),
      }).catch(err => console.error('Failed to save credit:', err));

      Promise.all([saveDebit, saveCredit]).then(() => {
        // Refresh profile to get updated balances and transactions
        fetchProfile();
      });

      setUsers((prevUsers) => {
        const nextUsers = prevUsers.map((user) => {
          if (user.id !== fromUserId) return user;

          const updatedChecking = user.checking
            + (fromAccount === 'checking' ? -numericAmount : 0)
            + (toAccount === 'checking' ? numericAmount : 0);
          const updatedSavings = user.savings
            + (fromAccount === 'savings' ? -numericAmount : 0)
            + (toAccount === 'savings' ? numericAmount : 0);

          return {
            ...user,
            balance: updatedChecking + updatedSavings,
            checking: updatedChecking,
            savings: updatedSavings,
            transactions: [debitTx, creditTx, ...user.transactions],
          };
        });

        const updatedUser = nextUsers.find((u) => u.id === fromUserId);
        if (updatedUser && currentUser?.id === fromUserId) {
          setCurrentUser(updatedUser);
        }

        return nextUsers;
      });

      return {
        success: true,
        message: 'Transfer completed',
        receipt: {
          ...receiptBase,
          toAccount,
          status: 'completed',
          reference: `${fromUserId}-${Date.now()}`,
        },
      };
    }

    // External transfer: send for admin approval and log in history immediately
    const pendingTx = {
      id: Date.now(),
      date: today,
      description: `Transfer to ${recipient?.name || 'External Account'}`,
      amount: -numericAmount,
      category: 'External Transfer',
      accountType: fromAccount,
      status: 'pending',
      userId: fromUserId,
      userName: fallbackSender.name,
      meta: {
        recipientName: recipient?.name,
        bankName: recipient?.bankName,
        routingNumber: recipient?.routingNumber,
        accountNumber: recipient?.accountNumber,
      },
      note,
    };

    // Save pending transaction to backend
    fetch(`${apiBase}/transactions`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: -numericAmount,
        description: pendingTx.description,
        category: pendingTx.category,
        accountType: fromAccount,
        status: 'pending',
        transferType: 'external',
        recipientMeta: pendingTx.meta,
        note,
        date: today,
      }),
    })
      .then(res => res.json())
      .then(() => {
        // Refresh profile to get updated transactions
        fetchProfile();
      })
      .catch(err => console.error('Failed to save transaction:', err));

    setUsers((prevUsers) => {
      const baseUsers = existingSender ? prevUsers : [...prevUsers, fallbackSender];
      const nextUsers = baseUsers.map((user) => {
        if (user.id !== fromUserId) return user;
        return {
          ...user,
          transactions: [pendingTx, ...user.transactions],
          pendingTransactions: [...user.pendingTransactions, pendingTx],
        };
      });

      const updatedUser = nextUsers.find((u) => u.id === fromUserId);
      if (updatedUser && currentUser?.id === fromUserId) {
        setCurrentUser(updatedUser);
      }

      return nextUsers;
    });

    setPendingApprovals((prev) => [...prev, pendingTx]);

    return {
      success: true,
      message: 'Transfer submitted for admin approval',
      receipt: {
        ...receiptBase,
        recipient: pendingTx.meta,
        status: 'pending',
        reference: `${fromUserId}-${pendingTx.id}`,
      },
    };
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
