import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Coffee, ShoppingCart, Search, Plus, Minus, Trash2, Clock, CheckCircle, ChefHat, X, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import { getMenuAPI, placeOrderAPI, getMyOrdersAPI, getAllOrdersAPI, updateOrderStatusAPI, addMenuItemAPI, toggleMenuItemAvailabilityAPI } from '../../api/canteen.api';

const AddMenuItemModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Snacks',
    imageUrl: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await addMenuItemAPI({ ...formData, price: Number(formData.price) });
      toast.success('Menu item added successfully');
      onSuccess();
    } catch (err) {
      toast.error('Failed to add item');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-black/50 p-4">
      <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-dark-900">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Add Menu Item</h3>
          <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-800">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Name</label>
            <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm dark:border-dark-700 dark:bg-dark-950 dark:text-white" />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Category</label>
            <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm dark:border-dark-700 dark:bg-dark-950 dark:text-white">
              <option value="Snacks">Snacks</option>
              <option value="Meals">Meals</option>
              <option value="Beverages">Beverages</option>
              <option value="Desserts">Desserts</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Price (₹)</label>
            <input type="number" min="0" required value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm dark:border-dark-700 dark:bg-dark-950 dark:text-white" />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
            <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm dark:border-dark-700 dark:bg-dark-950 dark:text-white" rows="2"></textarea>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Image URL (Optional)</label>
            <input type="text" value={formData.imageUrl} onChange={e => setFormData({ ...formData, imageUrl: e.target.value })} className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm dark:border-dark-700 dark:bg-dark-950 dark:text-white" placeholder="https://..." />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t dark:border-dark-800">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-300 dark:border-dark-700 dark:text-slate-300">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm font-medium rounded-lg bg-brand-500 text-white hover:bg-brand-600 disabled:opacity-50">Add Item</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const CanteenDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const isAdmin = ['Super Admin', 'College Admin'].includes(user?.role?.name || user?.role);

  const [menu, setMenu] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(isAdmin ? 'incoming' : 'menu'); // Student: menu, my-orders. Admin: incoming, manage-menu
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [showAddMenuModal, setShowAddMenuModal] = useState(false);

  const fetchMenu = async () => {
    try {
      const res = await getMenuAPI();
      setMenu(res.data?.data || []);
    } catch (err) {
      toast.error('Failed to load menu');
    }
  };

  const fetchOrders = async () => {
    try {
      const res = isAdmin ? await getAllOrdersAPI() : await getMyOrdersAPI();
      setOrders(res.data?.data || []);
    } catch (err) {
      toast.error('Failed to load orders');
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchMenu();
      if (isAdmin || activeTab === 'my-orders') {
        await fetchOrders();
      }
      setLoading(false);
    };
    loadData();
    
    // Simple polling for admin to get new orders
    let interval;
    if (isAdmin && activeTab === 'incoming') {
      interval = setInterval(fetchOrders, 10000); // 10 seconds
    }
    return () => clearInterval(interval);
  }, [isAdmin, activeTab]);

  // Cart operations
  const addToCart = (item) => {
    setCart((prev) => {
      const existing = prev.find(i => i._id === item._id);
      if (existing) {
        return prev.map(i => i._id === item._id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    toast.success(`${item.name} added to cart`);
  };

  const updateCartQuantity = (id, delta) => {
    setCart((prev) => prev.map(i => {
      if (i._id === id) {
        const newQ = i.quantity + delta;
        return newQ > 0 ? { ...i, quantity: newQ } : i;
      }
      return i;
    }));
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter(i => i._id !== id));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;
    try {
      setIsPlacingOrder(true);
      const items = cart.map(i => ({ menuItemId: i._id, quantity: i.quantity }));
      await placeOrderAPI({ items });
      toast.success('Order placed successfully! Pay at counter.');
      setCart([]);
      setActiveTab('my-orders');
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const handleToggleAvailability = async (id) => {
    try {
      await toggleMenuItemAvailabilityAPI(id);
      toast.success('Availability updated');
      fetchMenu();
    } catch (err) {
      toast.error('Failed to update availability');
    }
  };

  const handleUpdateOrderStatus = async (id, status) => {
    try {
      await updateOrderStatusAPI(id, { status });
      toast.success(`Order marked as ${status}`);
      fetchOrders();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Preparing': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Ready': return 'bg-green-100 text-green-700 border-green-200';
      case 'Completed': return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-dark-800 dark:text-slate-400 dark:border-dark-700';
      case 'Cancelled': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const filteredMenu = menu.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white dark:bg-dark-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-dark-800">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            <Coffee className="text-orange-500" size={32} /> Cafeteria
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            {isAdmin ? 'Manage menu and process incoming orders.' : 'Order your favorite food and pick it up at the counter.'}
          </p>
        </div>
        
        {isAdmin && activeTab === 'manage-menu' && (
          <button
            onClick={() => setShowAddMenuModal(true)}
            className="flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-bold text-white shadow-md hover:bg-orange-600 transition-colors"
          >
            <Plus size={18} /> Add Menu Item
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 dark:border-dark-800">
        {!isAdmin ? (
          <>
            <button onClick={() => setActiveTab('menu')} className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'menu' ? 'border-orange-500 text-orange-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>Food Menu</button>
            <button onClick={() => { setActiveTab('my-orders'); fetchOrders(); }} className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'my-orders' ? 'border-orange-500 text-orange-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>My Orders</button>
          </>
        ) : (
          <>
            <button onClick={() => setActiveTab('incoming')} className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'incoming' ? 'border-orange-500 text-orange-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>Incoming Orders</button>
            <button onClick={() => setActiveTab('manage-menu')} className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'manage-menu' ? 'border-orange-500 text-orange-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>Manage Menu</button>
          </>
        )}
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-orange-500"></div>
        </div>
      ) : (
        <div className="mt-6">
          
          {/* MENU TAB (Student) */}
          {activeTab === 'menu' && (
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Menu Grid */}
              <div className="flex-1 space-y-6">
                <div className="relative">
                  <Search className="absolute left-4 top-3 text-slate-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search for pizza, coffee, snacks..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white pl-12 pr-4 py-3 text-sm font-medium shadow-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 dark:border-dark-700 dark:bg-dark-900 dark:text-white"
                  />
                </div>

                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {filteredMenu.map(item => (
                    <div key={item._id} className="flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm hover:shadow-lg transition-all dark:border-dark-800 dark:bg-dark-900">
                      <div className="h-40 bg-slate-100 dark:bg-dark-800 relative">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full items-center justify-center text-slate-300 dark:text-dark-700">
                            <Coffee size={48} />
                          </div>
                        )}
                        <span className="absolute top-3 right-3 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-slate-800 shadow-sm backdrop-blur-sm dark:bg-dark-900/90 dark:text-slate-200">
                          {item.category}
                        </span>
                      </div>
                      <div className="p-5 flex-1 flex flex-col">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-lg text-slate-900 dark:text-white leading-tight">{item.name}</h3>
                          <span className="font-black text-orange-600 dark:text-orange-400 text-lg">₹{item.price}</span>
                        </div>
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">{item.description || 'Delicious freshly prepared item.'}</p>
                        <div className="mt-auto pt-4 border-t border-slate-100 dark:border-dark-800">
                          <button
                            onClick={() => addToCart(item)}
                            className="w-full rounded-xl bg-orange-50 text-orange-600 px-4 py-2.5 text-sm font-bold hover:bg-orange-500 hover:text-white transition-colors dark:bg-orange-500/10 dark:text-orange-400 dark:hover:bg-orange-500 dark:hover:text-white flex items-center justify-center gap-2"
                          >
                            <Plus size={16} /> Add to Cart
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cart Sidebar */}
              <div className="w-full lg:w-80 shrink-0">
                <div className="sticky top-6 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm dark:border-dark-800 dark:bg-dark-900">
                  <h3 className="flex items-center gap-2 text-xl font-black text-slate-900 dark:text-white mb-6">
                    <ShoppingCart className="text-orange-500" /> Your Cart
                  </h3>
                  
                  {cart.length === 0 ? (
                    <div className="text-center py-10 text-slate-400 flex flex-col items-center">
                      <div className="p-4 bg-slate-50 rounded-full mb-3 dark:bg-dark-800">
                        <ShoppingCart size={32} className="opacity-50" />
                      </div>
                      <p className="font-medium text-sm">Your cart is empty</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {cart.map(item => (
                        <div key={item._id} className="flex items-center justify-between gap-2 border-b border-slate-50 pb-4 dark:border-dark-800">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">{item.name}</h4>
                            <p className="text-xs font-bold text-orange-500">₹{item.price}</p>
                          </div>
                          <div className="flex items-center gap-2 bg-slate-50 rounded-lg p-1 dark:bg-dark-800 border border-slate-200 dark:border-dark-700">
                            <button onClick={() => updateCartQuantity(item._id, -1)} className="p-1 text-slate-500 hover:text-slate-900 dark:hover:text-white">
                              {item.quantity > 1 ? <Minus size={14} /> : <Trash2 size={14} className="text-red-500" />}
                            </button>
                            <span className="w-4 text-center text-sm font-bold">{item.quantity}</span>
                            <button onClick={() => updateCartQuantity(item._id, 1)} className="p-1 text-slate-500 hover:text-slate-900 dark:hover:text-white">
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                      
                      <div className="pt-4 border-t-2 border-dashed border-slate-200 dark:border-dark-800">
                        <div className="flex justify-between items-center mb-6">
                          <span className="text-sm font-bold text-slate-500">Total</span>
                          <span className="text-2xl font-black text-slate-900 dark:text-white">₹{cartTotal}</span>
                        </div>
                        <button
                          onClick={handlePlaceOrder}
                          disabled={isPlacingOrder}
                          className="w-full rounded-xl bg-orange-500 py-3 text-sm font-bold text-white shadow-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
                        >
                          {isPlacingOrder ? 'Processing...' : 'Place Order & Pay at Counter'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* MY ORDERS TAB (Student) */}
          {activeTab === 'my-orders' && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {orders.length === 0 ? (
                <div className="col-span-full py-16 text-center text-slate-500 bg-white rounded-2xl border border-slate-100 dark:bg-dark-900 dark:border-dark-800">
                  <ChefHat size={48} className="mx-auto mb-4 opacity-20" />
                  <p className="font-medium">You have no orders yet.</p>
                </div>
              ) : (
                orders.map(order => (
                  <div key={order._id} className={`rounded-2xl border-2 p-5 ${order.status === 'Ready' ? 'border-green-500 bg-green-50/30 dark:bg-green-900/10' : 'border-slate-100 bg-white dark:border-dark-800 dark:bg-dark-900'}`}>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className="text-xs font-bold text-slate-400">ORDER #{order._id.slice(-6).toUpperCase()}</span>
                        <p className="text-[11px] text-slate-400 mt-0.5">{new Date(order.createdAt).toLocaleString()}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                    
                    <div className="space-y-2 mb-4 min-h-[80px]">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span className="text-slate-700 dark:text-slate-300"><span className="font-bold text-slate-400">{item.quantity}x</span> {item.menuItem?.name || 'Item Removed'}</span>
                          <span className="font-medium text-slate-900 dark:text-white">₹{item.priceAtTimeOfOrder * item.quantity}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-dark-800">
                      <span className="text-sm font-bold text-slate-500">Total</span>
                      <span className="text-lg font-black text-slate-900 dark:text-white">₹{order.totalAmount}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* INCOMING ORDERS TAB (Admin POS) */}
          {activeTab === 'incoming' && (
            <div className="grid gap-6 sm:grid-cols-3">
              {['Pending', 'Preparing', 'Ready'].map(statusGroup => (
                <div key={statusGroup} className="flex flex-col gap-4 rounded-2xl bg-slate-50/50 p-4 border border-slate-100 dark:bg-dark-900/50 dark:border-dark-800">
                  <h3 className="font-black text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${statusGroup === 'Pending' ? 'bg-yellow-400' : statusGroup === 'Preparing' ? 'bg-blue-400' : 'bg-green-400'}`}></span>
                    {statusGroup} 
                    <span className="ml-auto bg-white px-2 py-0.5 rounded-full text-xs border border-slate-200 dark:bg-dark-800 dark:border-dark-700">
                      {orders.filter(o => o.status === statusGroup).length}
                    </span>
                  </h3>
                  
                  <div className="space-y-3">
                    {orders.filter(o => o.status === statusGroup).map(order => (
                      <div key={order._id} className="rounded-xl bg-white p-4 shadow-sm border border-slate-200 dark:bg-dark-800 dark:border-dark-700">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-bold text-sm text-slate-900 dark:text-white">#{order._id.slice(-6).toUpperCase()}</span>
                          <span className="font-black text-orange-500">₹{order.totalAmount}</span>
                        </div>
                        <p className="text-xs font-medium text-slate-500 mb-3">{order.user?.firstName} {order.user?.lastName} ({order.user?.rollNumber})</p>
                        
                        <div className="space-y-1 mb-4 bg-slate-50 p-2 rounded-lg dark:bg-dark-900/50 border border-slate-100 dark:border-dark-800">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="text-xs flex justify-between">
                              <span className="text-slate-700 dark:text-slate-300 font-medium">{item.quantity}x {item.menuItem?.name || 'Unknown'}</span>
                            </div>
                          ))}
                        </div>

                        <div className="flex gap-2">
                          {statusGroup === 'Pending' && (
                            <button onClick={() => handleUpdateOrderStatus(order._id, 'Preparing')} className="flex-1 rounded-lg bg-blue-50 text-blue-600 py-1.5 text-xs font-bold hover:bg-blue-100 border border-blue-200">Start Prep</button>
                          )}
                          {statusGroup === 'Preparing' && (
                            <button onClick={() => handleUpdateOrderStatus(order._id, 'Ready')} className="flex-1 rounded-lg bg-green-500 text-white py-1.5 text-xs font-bold hover:bg-green-600 shadow-sm">Mark Ready</button>
                          )}
                          {statusGroup === 'Ready' && (
                            <button onClick={() => handleUpdateOrderStatus(order._id, 'Completed')} className="flex-1 rounded-lg bg-slate-800 text-white py-1.5 text-xs font-bold hover:bg-slate-700 dark:bg-slate-700">Completed (Paid)</button>
                          )}
                          {statusGroup === 'Pending' && (
                            <button onClick={() => handleUpdateOrderStatus(order._id, 'Cancelled')} className="px-3 rounded-lg bg-red-50 text-red-500 text-xs font-bold hover:bg-red-100 border border-red-200">X</button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* MANAGE MENU TAB (Admin) */}
          {activeTab === 'manage-menu' && (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-dark-800 dark:bg-dark-900">
              <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
                <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500 dark:bg-dark-800 dark:text-slate-400 border-b border-slate-200 dark:border-dark-700">
                  <tr>
                    <th className="px-6 py-4">Item Name</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Price</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-dark-800">
                  {menu.map(item => (
                    <tr key={item._id} className="hover:bg-slate-50/50 dark:hover:bg-dark-800/50">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900 dark:text-white">{item.name}</div>
                        <div className="text-xs text-slate-500">{item.description}</div>
                      </td>
                      <td className="px-6 py-4 font-medium">{item.category}</td>
                      <td className="px-6 py-4 font-black text-orange-500">₹{item.price}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${item.isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {item.isAvailable ? 'Available' : 'Out of Stock'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleToggleAvailability(item._id)}
                          className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50 dark:border-dark-700 dark:text-slate-300 dark:hover:bg-dark-800"
                        >
                          Toggle Status
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>
      )}

      {showAddMenuModal && (
        <AddMenuItemModal 
          onClose={() => setShowAddMenuModal(false)}
          onSuccess={() => {
            setShowAddMenuModal(false);
            fetchMenu();
          }}
        />
      )}
    </div>
  );
};

export default CanteenDashboard;
