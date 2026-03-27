import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
  User, Crafter, Order, CustomerOrder, WalletTransaction, InventoryItem, Expense, AuditLog, Yarn, Product
} from '../types';

export const useData = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!localStorage.getItem('tb_admin_token'));
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [crafters, setCrafters] = useState<Crafter[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customerOrders, setCustomerOrders] = useState<CustomerOrder[]>([]);
  const [walletTxns, setWalletTxns] = useState<WalletTransaction[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [activeTab, setActiveTab] = useState<'admin' | 'crafters' | 'sales' | 'wallet' | 'inventory' | 'expenses' | 'audit'>('admin');

  // Profile Settings Modal
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isAddingUserModalOpen, setIsAddingUserModalOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserPhotoUrl, setNewUserPhotoUrl] = useState('');
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [profilePassword, setProfilePassword] = useState('');
  const [profilePhotoUrl, setProfilePhotoUrl] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [currentCrafterId, setCurrentCrafterId] = useState<string>('');
  const [newCrafterName, setNewCrafterName] = useState('');
  const [newCrafterPhone, setNewCrafterPhone] = useState('');
  const [newCrafterAddress, setNewCrafterAddress] = useState('');
  const [editOrderId, setEditOrderId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Crafter Form State
  const [orderDate, setOrderDate] = useState('');
  const [piece, setPiece] = useState('');
  const [yarns, setYarns] = useState<Yarn[]>([{ color: '', qty: '' }]);
  const [stuffing, setStuffing] = useState('');
  const [wire, setWire] = useState('');
  const [eyes, setEyes] = useState('');
  const [materialCost, setMaterialCost] = useState<number | ''>('');
  const [qtyOrdered, setQtyOrdered] = useState<number | ''>('');
  const [qtyReceived, setQtyReceived] = useState<number | ''>('');
  const [timeTaken, setTimeTaken] = useState('');
  const [laborCost, setLaborCost] = useState<number | ''>('');
  const [sellingPrice, setSellingPrice] = useState<number | ''>('');

  // Sales Form State
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [salesOrderDate, setSalesOrderDate] = useState(new Date().toISOString().split('T')[0]);
  const [products, setProducts] = useState<Product[]>([{ name: '', price: 0, qty: 1 }]);
  const [shippingCharge, setShippingCharge] = useState<number | ''>(0);
  const [actualShippingCost, setActualShippingCost] = useState<number | ''>(0);
  const [salesStatus, setSalesStatus] = useState('Pending');
  const [isSalesFormOpen, setIsSalesFormOpen] = useState(false);
  const [editSalesOrderId, setEditSalesOrderId] = useState<string | null>(null);

  // Wallet Form State
  const [walletDate, setWalletDate] = useState(new Date().toISOString().split('T')[0]);
  const [aggregator, setAggregator] = useState('Shiprocket');
  const [walletAmount, setWalletAmount] = useState<number | ''>('');
  const [referenceId, setReferenceId] = useState('');
  const [isWalletFormOpen, setIsWalletFormOpen] = useState(false);

  // Inventory Form State
  const [isInventoryFormOpen, setIsInventoryFormOpen] = useState(false);
  const [editInventoryId, setEditInventoryId] = useState<string | null>(null);
  const [invName, setInvName] = useState('');
  const [invCategory, setInvCategory] = useState('Yarn');
  const [invQty, setInvQty] = useState<number | ''>('');
  const [invUnit, setInvUnit] = useState('skeins');
  const [invCost, setInvCost] = useState<number | ''>('');
  const [invThreshold, setInvThreshold] = useState<number | ''>(5);

  // Expenses Form State
  const [isExpenseFormOpen, setIsExpenseFormOpen] = useState(false);
  const [editExpenseId, setEditExpenseId] = useState<string | null>(null);
  const [expDate, setExpDate] = useState(new Date().toISOString().split('T')[0]);
  const [expCategory, setExpCategory] = useState('Packaging');
  const [expAmount, setExpAmount] = useState<number | ''>('');
  const [expDesc, setExpDesc] = useState('');

  // UX Filters State
  const [globalSearch, setGlobalSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const fetchData = async () => {
    const token = localStorage.getItem('tb_admin_token');
    if (!token) {
      setIsAuthenticated(false);
      return;
    }

    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      const [craftersRes, ordersRes, customerOrdersRes, walletRes, invRes, expRes, meRes, auditRes] = await Promise.all([
        fetch('/api/crafters', { headers }),
        fetch('/api/orders', { headers }),
        fetch('/api/customer-orders', { headers }),
        fetch('/api/wallet/transactions', { headers }),
        fetch('/api/inventory', { headers }),
        fetch('/api/expenses', { headers }),
        fetch('/api/me', { headers }),
        fetch('/api/audit', { headers })
      ]);

      const allRes = [craftersRes, ordersRes, customerOrdersRes, walletRes, invRes, expRes, meRes, auditRes];
      const authFailed = allRes.some(r => r.status === 401 || r.status === 403);

      if (authFailed) {
        handleLogout();
        return;
      }

      if (!craftersRes.ok) throw new Error(`Failed to load Crafters (${craftersRes.status})`);
      if (!ordersRes.ok) throw new Error(`Failed to load Orders (${ordersRes.status})`);
      if (!customerOrdersRes.ok) throw new Error(`Failed to load Customer Orders (${customerOrdersRes.status})`);
      if (!walletRes.ok) throw new Error(`Failed to load Wallet Transactions (${walletRes.status})`);
      if (!invRes.ok) throw new Error(`Failed to load Inventory (${invRes.status})`);
      if (!expRes.ok) throw new Error(`Failed to load Expenses (${expRes.status})`);

      const [craftersData, ordersData, customerOrdersData, walletData, invData, expData] = await Promise.all([
        craftersRes.json(), ordersRes.json(), customerOrdersRes.json(),
        walletRes.json(), invRes.json(), expRes.json()
      ]);

      if (meRes.ok) {
        const meData = await meRes.json();
        setCurrentUser(meData);
        setProfileName(meData.name);
        setProfileEmail(meData.email);
        setProfilePhotoUrl(meData.profilePhotoUrl || '');
      }

      if (auditRes.ok) {
        const auditData = await auditRes.json();
        setAuditLogs(auditData);
      }

      setCrafters(craftersData);
      setOrders(ordersData);
      setCustomerOrders(customerOrdersData);
      setWalletTxns(walletData);
      setInventory(invData);
      setExpenses(expData);
      setError('');
    } catch (err: any) {
      console.error('FetchData error:', err);
      // Differentiate between network errors and others
      if (err.message === 'Failed to fetch') {
        setError('Network error: Could not reach the server. Please check your internet or if the server is down.');
      } else {
        setError(err.message || 'An unexpected error occurred while loading data.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail.toLowerCase(), password: loginPassword })
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('tb_admin_token', data.token);
        setCurrentUser(data.user);
        setIsAuthenticated(true);
        setIsProfileDropdownOpen(false);
        setIsProfileModalOpen(false);
        toast.success(`Welcome back, ${data.user.name}!`);
      } else {
        const errData = await res.json().catch(() => ({ error: `Server error (${res.status})` }));
        toast.error(errData.error || `Login failed with status ${res.status}`);
      }
    } catch (err: any) {
      console.error('Login error:', err);
      toast.error(err.message === 'Failed to fetch' ? 'Connection failed: Server unreachable.' : 'An error occurred during login.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('tb_admin_token');
    setIsAuthenticated(false);
    setCurrentUser(null);
    setIsProfileDropdownOpen(false);
    setIsProfileModalOpen(false);
    // Do not toast if it was an automatic logout due to 401
  };

  const handleAddCrafter = async () => {
    if (!newCrafterName.trim()) return;
    const token = localStorage.getItem('tb_admin_token');
    try {
      const res = await fetch('/api/crafters', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newCrafterName.trim(),
          phone: newCrafterPhone.trim(),
          address: newCrafterAddress.trim(),
          hooks: 0
        })
      });
      if (res.status === 401) return handleLogout();
      const newCrafter = await res.json();
      setCrafters([...crafters, newCrafter]);
      setNewCrafterName('');
      setNewCrafterPhone('');
      setNewCrafterAddress('');
      setCurrentCrafterId(newCrafter._id);
      setActiveTab('crafters');
      toast.success('Crafter added successfully!');
    } catch (err) {
      console.error('Failed to add crafter', err);
      toast.error('Failed to add crafter.');
    }
  };

  const handleDeleteCrafter = async (id: string) => {
    if (window.confirm('Are you SURE you want to delete this portfolio? This will permanently delete her and ALL of her order history!')) {
      const token = localStorage.getItem('tb_admin_token');
      try {
        const res = await fetch(`/api/crafters/${id}`, { 
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.status === 401) return handleLogout();
        setCrafters(crafters.filter(c => c._id !== id));
        setOrders(orders.filter(o => o.crafterId !== id));
        if (currentCrafterId === id) {
          setCurrentCrafterId('');
          setActiveTab('admin');
        }
        toast.success('Crafter deleted permanently.');
      } catch (err) {
        console.error('Failed to delete crafter', err);
        toast.error('Failed to delete crafter portfolio.');
      }
    }
  };

  const handleHooksChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value) || 0;
    if (!currentCrafterId) return;
    setCrafters(crafters.map(c => c._id === currentCrafterId ? { ...c, hooks: val } : c));
    const token = localStorage.getItem('tb_admin_token');
    try {
      const res = await fetch(`/api/crafters/${currentCrafterId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ hooks: val })
      });
      if (res.status === 401) return handleLogout();
    } catch (err) {
      console.error('Failed to update hooks', err);
      fetchData();
    }
  };

  const addYarn = () => setYarns([...yarns, { color: '', qty: '' }]);
  const removeYarn = (index: number) => setYarns(yarns.filter((_, i) => i !== index));
  const updateYarn = (index: number, field: keyof Yarn, value: string) => {
    const newYarns = [...yarns];
    newYarns[index][field] = value;
    setYarns(newYarns);
  };

  const resetForm = () => {
    setOrderDate(''); setPiece(''); setYarns([{ color: '', qty: '' }]);
    setStuffing(''); setWire(''); setEyes(''); setMaterialCost('');
    setQtyOrdered(''); setQtyReceived(''); setTimeTaken('');
    setLaborCost(''); setSellingPrice(''); setEditOrderId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const mCost = Number(materialCost) || 0;
    const qOrdered = Number(qtyOrdered) || 0;
    const qReceived = Number(qtyReceived) || 0;
    const lCost = Number(laborCost) || 0;
    const sPrice = Number(sellingPrice) || 0;

    const totalLabor = lCost * qReceived;
    const totalCostToYou = mCost + totalLabor;
    const totalRevenueValue = sPrice * qReceived;
    const netProfitValue = totalRevenueValue - totalCostToYou;

    const orderData = {
      crafterId: currentCrafterId, orderDate, piece,
      materialsObj: { yarns: yarns.filter(y => y.color.trim() || y.qty.trim()), stuffing, wire, eyes },
      qtyOrdered: qOrdered, qtyReceived: qReceived, timeTaken: timeTaken || 'Pending',
      materialCost: mCost, laborCost: lCost, sellingPrice: sPrice,
      totalLabor, totalCost: totalCostToYou, revenue: totalRevenueValue, profit: netProfitValue,
      completed: qReceived >= qOrdered && qOrdered > 0
    };

    const token = localStorage.getItem('tb_admin_token');
    try {
      if (editOrderId) {
        const res = await fetch(`/api/orders/${editOrderId}`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(orderData)
        });
        if (res.status === 401) return handleLogout();
        const updatedOrder = await res.json();
        setOrders(orders.map(o => o._id === editOrderId ? updatedOrder : o));
      } else {
        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(orderData)
        });
        if (res.status === 401) return handleLogout();
        const newOrder = await res.json();
        setOrders([...orders, newOrder]);
      }
      resetForm(); setIsFormOpen(false);
    } catch (err) {
      console.error('Failed to save order', err);
    }
  };

  const handleEdit = (order: Order) => {
    setOrderDate(order.orderDate); setPiece(order.piece);
    setYarns(order.materialsObj?.yarns?.length > 0 ? order.materialsObj.yarns : [{ color: '', qty: '' }]);
    setStuffing(order.materialsObj?.stuffing || ''); setWire(order.materialsObj?.wire || '');
    setEyes(order.materialsObj?.eyes || ''); setMaterialCost(order.materialCost || '');
    setQtyOrdered(order.qtyOrdered || ''); setQtyReceived(order.qtyReceived || '');
    setTimeTaken(order.timeTaken === 'Pending' ? '' : order.timeTaken);
    setLaborCost(order.laborCost || ''); setSellingPrice(order.sellingPrice || '');
    setEditOrderId(order._id || null); setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      const token = localStorage.getItem('tb_admin_token');
      try {
        const res = await fetch(`/api/orders/${id}`, { 
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.status === 401) return handleLogout();
        setOrders(orders.filter(o => o._id !== id));
      } catch (err) {
        console.error('Failed to delete order', err);
      }
    }
  };

  const toggleOrderStatus = async (orderId: string, currentStatus: boolean, order: Order) => {
    const token = localStorage.getItem('tb_admin_token');
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ completed: !currentStatus }),
      });
      if (res.status === 401) return handleLogout();
      const updatedOrder = await res.json();
      setOrders(orders.map(o => o._id === orderId ? updatedOrder : o));

      if (!currentStatus) {
        if (window.confirm(`Order completed! Deduct materials from Inventory?`)) {
          order.materialsObj?.yarns?.forEach(async (y) => {
            if (!y.color || !y.qty) return;
            const matchedItem = inventory.find(i => i.name.toLowerCase().includes(y.color.toLowerCase()));
            if (matchedItem && matchedItem._id) {
              const newQty = Math.max(0, matchedItem.quantity - Number(y.qty));
              const invRes = await fetch(`/api/inventory/${matchedItem._id}`, {
                method: 'PUT', 
                headers: { 
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ ...matchedItem, quantity: newQty })
              });
              if (invRes.status === 401) return handleLogout();
              const updatedInv = await invRes.json();
              setInventory(prev => prev.map(inv => inv._id === updatedInv._id ? updatedInv : inv));
            }
          });
        }
      }
    } catch (err) { console.error(err); }
  };

  const addSaleProduct = () => setProducts([...products, { name: '', price: 0, qty: 1 }]);
  const removeSaleProduct = (index: number) => setProducts(products.filter((_, i) => i !== index));
  const updateSaleProduct = (index: number, field: keyof Product, value: any) => {
    const newProducts = [...products];
    newProducts[index] = { ...newProducts[index], [field]: value };
    setProducts(newProducts);
  };

  const resetSalesForm = () => {
    setCustomerName(''); setCustomerPhone(''); setCustomerAddress('');
    setSalesOrderDate(new Date().toISOString().split('T')[0]);
    setProducts([{ name: '', price: 0, qty: 1 }]); 
    setShippingCharge(0); setActualShippingCost(0);
    setSalesStatus('Pending'); setEditSalesOrderId(null); setIsSalesFormOpen(false);
  };

  const handleSalesSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validProducts = products.filter(p => p.name.trim() !== '');
    const sCharge = Number(shippingCharge) || 0;
    const actualSCost = salesStatus === 'Cancelled' ? 0 : (Number(actualShippingCost) || 0);
    const totalAmt = validProducts.reduce((sum, p) => sum + (p.price * p.qty), 0) + sCharge;

    const orderData = {
      customerName, customerPhone, customerAddress, orderDate: salesOrderDate,
      products: validProducts, shippingCharge: sCharge, actualShippingCost: actualSCost, totalAmount: totalAmt, status: salesStatus
    };

    const token = localStorage.getItem('tb_admin_token');
    try {
      let savedOrder: CustomerOrder;
      if (editSalesOrderId) {
        const res = await fetch(`/api/customer-orders/${editSalesOrderId}`, {
          method: 'PUT', 
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }, 
          body: JSON.stringify(orderData)
        });
        if (res.status === 401) return handleLogout();
        savedOrder = await res.json();
        setCustomerOrders(customerOrders.map(o => o._id === editSalesOrderId ? savedOrder : o));
      } else {
        const res = await fetch('/api/customer-orders', {
          method: 'POST', 
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }, 
          body: JSON.stringify(orderData)
        });
        if (res.status === 401) return handleLogout();
        savedOrder = await res.json();
        setCustomerOrders([savedOrder, ...customerOrders]);
      }

      // Handle Wallet Deduction based on ACTUAL cost (and status)
      const orderId = savedOrder._id;
      const existingTxn = walletTxns.find(t => t.referenceId === `Order: ${orderId}`);
      
      if (existingTxn) {
        if (actualSCost > 0 && salesStatus !== 'Cancelled') {
          // Update existing txn
          const walletRes = await fetch(`/api/wallet/transactions/${existingTxn._id}`, {
            method: 'PUT',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ ...existingTxn, amount: actualSCost, date: salesOrderDate })
          });
          if (walletRes.ok) {
            const updatedTxn = await walletRes.json();
            setWalletTxns(walletTxns.map(t => t._id === updatedTxn._id ? updatedTxn : t));
          }
        } else {
          // Delete existing txn if actualSCost is 0 or order is Cancelled
          await fetch(`/api/wallet/transactions/${existingTxn._id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
          });
          setWalletTxns(walletTxns.filter(t => t._id !== existingTxn._id));
        }
      } else if (actualSCost > 0 && salesStatus !== 'Cancelled') {
        // Create new txn
        const walletRes = await fetch('/api/wallet/transactions', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            date: salesOrderDate,
            aggregator: 'Shiprocket',
            type: 'deduct_shipping',
            amount: actualSCost,
            referenceId: `Order: ${orderId}`
          })
        });
        if (walletRes.ok) {
          const newTxn = await walletRes.json();
          setWalletTxns([newTxn, ...walletTxns]);
        }
      }

      resetSalesForm();
    } catch (err) { console.error(err); }
  };

  const handleSalesEdit = (order: CustomerOrder) => {
    setCustomerName(order.customerName); setCustomerPhone(order.customerPhone || '');
    setCustomerAddress(order.customerAddress || ''); setSalesOrderDate(order.orderDate);
    setProducts([...order.products]); setShippingCharge(order.shippingCharge);
    setActualShippingCost(order.actualShippingCost || 0);
    setSalesStatus(order.status); setEditSalesOrderId(order._id!);
    setIsSalesFormOpen(true); window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSalesDelete = async (id: string) => {
    if (window.confirm('Delete this order?')) {
      const token = localStorage.getItem('tb_admin_token');
      const res = await fetch(`/api/customer-orders/${id}`, { 
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.status === 401) return handleLogout();
      
      // Also delete associated wallet transaction
      const txn = walletTxns.find(t => t.referenceId === `Order: ${id}`);
      if (txn) {
        await fetch(`/api/wallet/transactions/${txn._id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setWalletTxns(walletTxns.filter(t => t._id !== txn._id));
      }

      setCustomerOrders(customerOrders.filter(o => o._id !== id));
    }
  };

  const toggleSalesOrderStatus = async (order: CustomerOrder) => {
    const newStatus = order.status === 'Completed' ? 'Pending' : 'Completed';
    const updatePayload = {
      ...order, status: newStatus,
      completedDate: newStatus === 'Completed' ? new Date().toISOString().split('T')[0] : undefined
    };
    const token = localStorage.getItem('tb_admin_token');
    const res = await fetch(`/api/customer-orders/${order._id}`, {
      method: 'PUT', 
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }, 
      body: JSON.stringify(updatePayload)
    });
    if (res.status === 401) return handleLogout();
    const updated = await res.json();
    setCustomerOrders(customerOrders.map(o => o._id === order._id ? updated : o));
  };

  const handleWalletSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const txnData = {
      date: walletDate, aggregator, type: 'add_funds', amount: Number(walletAmount), referenceId
    };
    const token = localStorage.getItem('tb_admin_token');
    const res = await fetch('/api/wallet/transactions', {
      method: 'POST', 
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }, 
      body: JSON.stringify(txnData)
    });
    if (res.status === 401) return handleLogout();
    const newTxn = await res.json();
    setWalletTxns([newTxn, ...walletTxns]);
    setWalletAmount(''); setReferenceId(''); setIsWalletFormOpen(false);
  };

  const handleWalletDelete = async (id: string) => {
    if (window.confirm('Delete transaction?')) {
      const token = localStorage.getItem('tb_admin_token');
      const res = await fetch(`/api/wallet/transactions/${id}`, { 
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.status === 401) return handleLogout();
      setWalletTxns(walletTxns.filter(t => t._id !== id));
    }
  };

  const handleInventorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const invData = {
      name: invName, category: invCategory, quantity: Number(invQty),
      unit: invUnit, costPerUnit: Number(invCost), lowStockThreshold: Number(invThreshold)
    };
    const token = localStorage.getItem('tb_admin_token');
    if (editInventoryId) {
      const res = await fetch(`/api/inventory/${editInventoryId}`, {
        method: 'PUT', 
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }, 
        body: JSON.stringify(invData)
      });
      if (res.status === 401) return handleLogout();
      const updated = await res.json();
      setInventory(inventory.map(i => i._id === editInventoryId ? updated : i));
    } else {
      const res = await fetch('/api/inventory', {
        method: 'POST', 
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }, 
        body: JSON.stringify(invData)
      });
      if (res.status === 401) return handleLogout();
      const saved = await res.json();
      setInventory([...inventory, saved]);
    }
    resetInventoryForm();
  };

  const handleInventoryEdit = (item: InventoryItem) => {
    setInvName(item.name); setInvCategory(item.category); setInvQty(item.quantity);
    setInvUnit(item.unit); setInvCost(item.costPerUnit); setInvThreshold(item.lowStockThreshold);
    setEditInventoryId(item._id!); setIsInventoryFormOpen(true);
  };

  const handleInventoryDelete = async (id: string) => {
    if (window.confirm('Delete item?')) {
      const token = localStorage.getItem('tb_admin_token');
      const res = await fetch(`/api/inventory/${id}`, { 
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.status === 401) return handleLogout();
      setInventory(inventory.filter(i => i._id !== id));
    }
  };

  const resetInventoryForm = () => {
    setInvName(''); setInvCategory('Yarn'); setInvQty(''); setInvUnit('skeins');
    setInvCost(''); setInvThreshold(5); setEditInventoryId(null); setIsInventoryFormOpen(false);
  };

  const handleExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const expData = { date: expDate, category: expCategory, amount: Number(expAmount), description: expDesc };
    const token = localStorage.getItem('tb_admin_token');
    if (editExpenseId) {
      const res = await fetch(`/api/expenses/${editExpenseId}`, {
        method: 'PUT', 
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }, 
        body: JSON.stringify(expData)
      });
      if (res.status === 401) return handleLogout();
      const updated = await res.json();
      setExpenses(expenses.map(exp => exp._id === editExpenseId ? updated : exp));
    } else {
      const res = await fetch('/api/expenses', {
        method: 'POST', 
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }, 
        body: JSON.stringify(expData)
      });
      if (res.status === 401) return handleLogout();
      const saved = await res.json();
      setExpenses([saved, ...expenses]);
    }
    resetExpenseForm();
  };

  const handleExpenseEdit = (exp: Expense) => {
    setExpDate(exp.date); setExpCategory(exp.category); setExpAmount(exp.amount);
    setExpDesc(exp.description); setEditExpenseId(exp._id!); setIsExpenseFormOpen(true);
  };

  const handleExpenseDelete = async (id: string) => {
    if (window.confirm('Delete expense?')) {
      const token = localStorage.getItem('tb_admin_token');
      const res = await fetch(`/api/expenses/${id}`, { 
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.status === 401) return handleLogout();
      setExpenses(expenses.filter(e => e._id !== id));
    }
  };

  const resetExpenseForm = () => {
    setExpDate(new Date().toISOString().split('T')[0]); setExpCategory('Packaging');
    setExpAmount(''); setExpDesc(''); setEditExpenseId(null); setIsExpenseFormOpen(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, isNewUser: boolean = false) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1024 * 1024) { toast.error('Image must be less than 1MB'); return; }
    const reader = new FileReader();
    reader.onloadend = () => {
      const b64 = reader.result as string;
      if (isNewUser) setNewUserPhotoUrl(b64); else setProfilePhotoUrl(b64);
      toast.success('Photo uploaded!');
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    const payload: any = { name: profileName, email: profileEmail.toLowerCase(), profilePhotoUrl };
    if (profilePassword) payload.password = profilePassword;
    const token = localStorage.getItem('tb_admin_token');
    const res = await fetch('/api/me', {
      method: 'PUT', 
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }, 
      body: JSON.stringify(payload)
    });
    if (res.status === 401) {
      setIsUpdatingProfile(false);
      return handleLogout();
    }
    if (res.ok) {
      const updated = await res.json();
      setCurrentUser(updated); setIsProfileModalOpen(false); setProfilePassword('');
      toast.success('Profile updated!');
    }
    setIsUpdatingProfile(false);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingUser(true);
    const token = localStorage.getItem('tb_admin_token');
    const res = await fetch('/api/users', {
      method: 'POST', 
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ name: newUserName, email: newUserEmail.toLowerCase(), password: newUserPassword, profilePhotoUrl: newUserPhotoUrl })
    });
    if (res.status === 401) {
      setIsCreatingUser(false);
      return handleLogout();
    }
    if (res.ok) {
      toast.success(`User ${newUserName} created!`);
      setIsAddingUserModalOpen(false);
      setNewUserName(''); setNewUserEmail(''); setNewUserPassword(''); setNewUserPhotoUrl('');
    }
    setIsCreatingUser(false);
  };


  // Calculations for KPI
  const totalRevenue = orders.reduce((sum, o) => sum + (o.completed ? o.revenue : 0), 0) +
    customerOrders.filter(o => o.status === 'Completed').reduce((sum, o) => sum + o.totalAmount, 0);
  const totalLaborCost = orders.reduce((sum, o) => sum + (o.totalLabor || 0), 0);
  const totalMaterialCost = orders.reduce((sum, o) => sum + (o.materialCost || 0), 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalShippingDeductions = walletTxns.filter(t => t.type === 'deduct_shipping').reduce((sum, t) => sum + t.amount, 0);
  const walletTotalAdded = walletTxns.filter(t => t.type === 'add_funds').reduce((sum, t) => sum + t.amount, 0);
  const walletBalance = walletTotalAdded - totalShippingDeductions;
  const inventoryTotalCost = inventory.reduce((sum, i) => sum + (i.quantity * i.costPerUnit), 0);
  const totalProfit = totalRevenue - totalLaborCost - totalMaterialCost - totalExpenses - totalShippingDeductions;
  const totalCosts = totalLaborCost + totalMaterialCost + totalExpenses + totalShippingDeductions;
  const trueROI = totalCosts > 0 ? ((totalProfit / totalCosts) * 100).toFixed(1) : '0.0';
  const completedOrdersCount = orders.filter(o => o.completed).length + customerOrders.filter(o => o.status === 'Completed').length;
  const avgOrderValue = completedOrdersCount > 0 ? (totalRevenue / completedOrdersCount).toFixed(0) : '0';
  const netMargin = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : '0.0';
  const lowStockCount = inventory.filter(i => i.quantity <= (i.lowStockThreshold || 5)).length;
  const inventoryHealth = inventory.length > 0 ? (((inventory.length - lowStockCount) / inventory.length) * 100).toFixed(0) : '0';
  const adminTotalHooks = crafters.reduce((sum, c) => sum + (c.hooks || 0), 0);

  // Chart data
  const productSalesMap = new Map<string, number>();
  customerOrders.forEach(o => { if (o.status !== 'Cancelled') o.products.forEach(p => productSalesMap.set(p.name, (productSalesMap.get(p.name) || 0) + p.qty)); });
  const bestSellersData = Array.from(productSalesMap.entries()).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 5);
  const revenueByMonth = new Map<string, number>();
  const addRev = (d: string, a: number) => { if (d) revenueByMonth.set(d.substring(0, 7), (revenueByMonth.get(d.substring(0, 7)) || 0) + a); };
  orders.filter(o => o.completed).forEach(o => addRev(o.orderDate, o.revenue));
  customerOrders.filter(o => o.status === 'Completed').forEach(o => addRev(o.orderDate, o.totalAmount));
  const monthlyTrendData = Array.from(revenueByMonth.entries()).map(([month, revenue]) => ({ month, revenue })).sort((a, b) => a.month.localeCompare(b.month)).slice(-6);
  const clvMap = new Map<string, number>();
  customerOrders.filter(o => o.status === 'Completed').forEach(o => { const k = `${o.customerName}${o.customerPhone ? ' (' + o.customerPhone + ')' : ''}`; clvMap.set(k, (clvMap.get(k) || 0) + o.totalAmount); });
  const clvData = Array.from(clvMap.entries()).map(([name, totalSpent]) => ({ name, totalSpent })).sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 5);
  let totalFulfillmentDays = 0, fulfilledCount = 0;
  customerOrders.filter(o => o.status === 'Completed' && o.completedDate).forEach(o => { totalFulfillmentDays += (new Date(o.completedDate!).getTime() - new Date(o.orderDate).getTime()) / (1000 * 60 * 60 * 24); fulfilledCount++; });
  const avgFulfillmentTime = fulfilledCount > 0 ? (totalFulfillmentDays / fulfilledCount).toFixed(1) : '-';
  const pendingYarnDemand = new Map<string, number>();
  let totalPendingStuffing = 0;
  orders.filter(o => !o.completed).forEach(o => { o.materialsObj?.yarns?.forEach(y => { if (y.color && y.qty) pendingYarnDemand.set(y.color.toLowerCase(), (pendingYarnDemand.get(y.color.toLowerCase()) || 0) + Number(y.qty)); }); if (o.materialsObj?.stuffing) totalPendingStuffing += Number(o.materialsObj.stuffing); });
  const inventoryWarnings: string[] = [];
  inventory.forEach(inv => {
    if (inv.category.toLowerCase().includes('yarn')) {
      const demand = pendingYarnDemand.get(inv.name.toLowerCase()) || 0;
      if (inv.quantity < demand) inventoryWarnings.push(`Shortage: Need ${demand}${inv.unit} of ${inv.name}, but only ${inv.quantity}${inv.unit} in stock!`);
    } else if (inv.category.toLowerCase().includes('stuff') && inv.quantity < totalPendingStuffing) {
      inventoryWarnings.push(`Shortage: Need ${totalPendingStuffing}${inv.unit} of Stuffing, but only ${inv.quantity}${inv.unit} in stock!`);
    }
  });

  const COLORS = ['#8b5cf6', '#ec4899', '#0ea5e9', '#f59e0b', '#10b981'];

  // Helper: Copy Shipping Label
  const handleCopyLabel = (order: CustomerOrder) => {
    const labelText = `To:\n${order.customerName}\n${order.customerAddress || ''}\nPhone: ${order.customerPhone || ''}\n\n[Twisted Bliss]`;
    navigator.clipboard.writeText(labelText);
    toast.success('Shipping Label copied to clipboard!');
  };

  return {
    isAuthenticated, currentUser, loginEmail, setLoginEmail, loginPassword, setLoginPassword, isLoggingIn, handleLogin, handleLogout,
    crafters, orders, customerOrders, walletTxns, inventory, expenses, auditLogs, activeTab, setActiveTab,
    isProfileModalOpen, setIsProfileModalOpen, isProfileDropdownOpen, setIsProfileDropdownOpen, isAddingUserModalOpen, setIsAddingUserModalOpen,
    newUserName, setNewUserName, newUserEmail, setNewUserEmail, newUserPassword, setNewUserPassword, newUserPhotoUrl, setNewUserPhotoUrl, isCreatingUser,
    profileName, setProfileName, profileEmail, setProfileEmail, profilePassword, setProfilePassword, profilePhotoUrl, setProfilePhotoUrl, isUpdatingProfile,
    currentCrafterId, setCurrentCrafterId, newCrafterName, setNewCrafterName, newCrafterPhone, setNewCrafterPhone, newCrafterAddress, setNewCrafterAddress,
    editOrderId, setEditOrderId, isFormOpen, setIsFormOpen, loading, error, setError,
    orderDate, setOrderDate, piece, setPiece, yarns, addYarn, removeYarn, updateYarn, stuffing, setStuffing, wire, setWire, eyes, setEyes,
    materialCost, setMaterialCost, qtyOrdered, setQtyOrdered, qtyReceived, setQtyReceived, timeTaken, setTimeTaken, laborCost, setLaborCost, sellingPrice, setSellingPrice,
    customerName, setCustomerName, customerPhone, setCustomerPhone, customerAddress, setCustomerAddress, salesOrderDate, setSalesOrderDate,
    products, setProducts, shippingCharge, setShippingCharge, actualShippingCost, setActualShippingCost, salesStatus, setSalesStatus, isSalesFormOpen, setIsSalesFormOpen, editSalesOrderId,
    walletDate, setWalletDate, aggregator, setAggregator, walletAmount, setWalletAmount, referenceId, setReferenceId, isWalletFormOpen, setIsWalletFormOpen,
    isInventoryFormOpen, setIsInventoryFormOpen, editInventoryId, setEditInventoryId, invName, setInvName, invCategory, setInvCategory, invQty, setInvQty,
    invUnit, setInvUnit, invCost, setInvCost, invThreshold, setInvThreshold,
    isExpenseFormOpen, setIsExpenseFormOpen, editExpenseId, setEditExpenseId, expDate, setExpDate, expCategory, setExpCategory, expAmount, setExpAmount, expDesc, setExpDesc,
    globalSearch, setGlobalSearch, statusFilter, setStatusFilter,
    handleAddCrafter, handleDeleteCrafter, handleHooksChange, resetForm, handleSubmit, handleEdit, handleDelete, toggleOrderStatus,
    addSaleProduct, removeSaleProduct, updateSaleProduct, resetSalesForm, handleSalesSubmit, handleSalesEdit, handleSalesDelete, toggleSalesOrderStatus,
    handleWalletSubmit, handleWalletDelete, handleInventorySubmit, handleInventoryEdit, handleInventoryDelete, resetInventoryForm,
    handleExpenseSubmit, handleExpenseEdit, handleExpenseDelete, resetExpenseForm, handleFileUpload, handleUpdateProfile, handleCreateUser,
    totalRevenue, totalLaborCost, totalMaterialCost, totalExpenses, totalShippingDeductions, walletTotalAdded, walletBalance, inventoryTotalCost,
    totalProfit, totalCosts, trueROI, avgOrderValue, netMargin, lowStockCount, inventoryHealth, adminTotalHooks,
    bestSellersData, monthlyTrendData, clvData, avgFulfillmentTime, inventoryWarnings, COLORS, handleCopyLabel
  };
};
