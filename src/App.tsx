import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'react-hot-toast';
import {
  LayoutDashboard, ShoppingBag, Box, Receipt, History, User, UserPlus, X, Truck, Factory, Eye, EyeOff, Store
} from 'lucide-react';

import { useData } from './hooks/useData';
import { YarnBall } from './components/Common';
import { InsightsTab } from './components/tabs/InsightsTab';
import { ProductionTab } from './components/tabs/ProductionTab';
import { OrderDeskTab } from './components/tabs/OrderDeskTab';
import { ShippingTab } from './components/tabs/ShippingTab';
import { InventoryTab } from './components/tabs/InventoryTab';
import { ExpensesTab } from './components/tabs/ExpensesTab';
import { AuditTab } from './components/tabs/AuditTab';
import { CatalogueTab } from './components/tabs/CatalogueTab';
import { ProfileModal } from './components/modals/ProfileModal';
import { AddUserModal } from './components/modals/AddUserModal';
import { exportToCSV } from './utils';

export default function App() {
  const d = useData();
  const [showLoginPassword, setShowLoginPassword] = React.useState(false);

  if (!d.isAuthenticated) {
    return (
      <div className="min-h-screen bg-sky-50 flex items-center justify-center p-4">
        <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-8 rounded-3xl shadow-2xl max-w-sm w-full border border-sky-100"
        >
          <div className="flex justify-center mb-6">
            <img src="/Twisted_Bliss_Logo.jpg" alt="Twisted Bliss Logo" className="h-32 sm:h-48 w-auto rounded-2xl shadow-lg shadow-sky-200/50" />
          </div>
          <p className="text-center text-slate-500 mb-8 text-sm">Access the secure admin gateway</p>

          <form onSubmit={d.handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-2">Admin Email</label>
              <input
                type="email" required placeholder="Enter your email..." value={d.loginEmail}
                onChange={(e) => d.setLoginEmail(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showLoginPassword ? "text" : "password"} 
                  required 
                  placeholder="Enter your password..." 
                  value={d.loginPassword}
                  onChange={(e) => d.setLoginPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none transition-all pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-sky-500 transition-colors"
                >
                  {showLoginPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <button
              type="submit" disabled={d.isLoggingIn}
              className="w-full bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all disabled:opacity-50"
            >
              {d.isLoggingIn ? 'Authenticating...' : 'Unlock Gateway'}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  if (d.loading) {
    return <div className="min-h-screen bg-pink-50 flex items-center justify-center text-sky-400 font-display text-3xl">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-pink-50 text-slate-900 font-sans pb-20">
      <Toaster position="top-center" toastOptions={{ duration: 3000, style: { borderRadius: '1rem', background: '#fff', color: '#334155', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' } }} />
      {d.error && (
        <div className="bg-red-900/50 border-b border-red-500 text-red-200 p-4 text-center">
          {d.error}
        </div>
      )}

      <header className="bg-white/90 backdrop-blur-md border-b border-sky-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-24 flex items-center justify-between">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3">
            <img src="/Twisted_Bliss_Logo.jpg" alt="Twisted Bliss Logo" className="h-12 sm:h-20 w-auto rounded-xl shadow-sm" />
          </motion.div>

          <div className="hidden md:flex gap-2 bg-sky-50 p-1 rounded-xl border border-sky-200">
            {[
              { id: 'admin', icon: LayoutDashboard, label: 'Insights' },
              { id: 'crafters', icon: Factory, label: 'Production' },
              { id: 'sales', icon: ShoppingBag, label: 'Order Desk' },
              { id: 'wallet', icon: Truck, label: 'Shipping' },
              { id: 'inventory', icon: Box, label: 'Inventory' },
              { id: 'catalogue', icon: Store, label: 'Catalogue' },
              { id: 'expenses', icon: Receipt, label: 'Expenses' },
              { id: 'audit', icon: History, label: 'Logs' }
            ].map(tab => (
              <motion.button
                key={tab.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={() => d.setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${d.activeTab === tab.id ? 'bg-white text-slate-900 shadow-md' : 'text-slate-600 hover:text-sky-700 hover:bg-sky-100'}`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="hidden lg:inline">{tab.label}</span>
              </motion.button>
            ))}
          </div>

          <div className="flex items-center gap-4 relative">
            <motion.button
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => d.setIsProfileDropdownOpen(!d.isProfileDropdownOpen)}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-sky-200 overflow-hidden hover:border-sky-50 transition-all shadow-sm flex items-center justify-center bg-white"
            >
              {d.currentUser?.profilePhotoUrl ? (
                <img src={d.currentUser.profilePhotoUrl} alt="Profile" className="w-full h-full object-cover rounded-full" />
              ) : (
                <div className="w-full h-full bg-sky-100 flex items-center justify-center text-sky-600 font-bold uppercase text-base sm:text-lg">
                  {d.currentUser?.name?.charAt(0) || 'A'}
                </div>
              )}
            </motion.button>

            <AnimatePresence>
              {d.isProfileDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => d.setIsProfileDropdownOpen(false)}></div>
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 top-12 sm:top-14 w-48 bg-white rounded-2xl shadow-xl border border-sky-100 py-2 z-20 overflow-hidden"
                  >
                    <div className="px-4 py-2 border-b border-sky-50 mb-1">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Signed in as</p>
                      <p className="text-sm font-bold text-slate-700 truncate">{d.currentUser?.name}</p>
                    </div>
                    <button
                      onClick={() => { d.setIsProfileModalOpen(true); d.setIsProfileDropdownOpen(false); }}
                      className="w-full text-left px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-sky-50 hover:text-sky-600 transition-colors flex items-center gap-2"
                    >
                      <User className="w-4 h-4" /> Account Settings
                    </button>
                    <button
                      onClick={() => { d.setIsAddingUserModalOpen(true); d.setIsProfileDropdownOpen(false); }}
                      className="w-full text-left px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-sky-50 hover:text-sky-600 transition-colors flex items-center gap-2"
                    >
                      <UserPlus className="w-4 h-4" /> Add Admin User
                    </button>
                    <div className="border-t border-sky-50 mt-1">
                      <button
                        onClick={d.handleLogout}
                        className="w-full text-left px-4 py-2.5 text-sm font-bold text-rose-500 hover:bg-rose-50 transition-colors flex items-center gap-2"
                      >
                        <X className="w-4 h-4" /> Logout
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-sky-200 z-50 px-2 py-1 flex justify-around items-center pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        {[
          { id: 'admin', icon: LayoutDashboard, label: 'Insights' },
          { id: 'crafters', icon: Factory, label: 'Prod' },
          { id: 'sales', icon: ShoppingBag, label: 'Order' },
          { id: 'wallet', icon: Truck, label: 'Ship' },
          { id: 'inventory', icon: Box, label: 'Stock' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => d.setActiveTab(tab.id as any)}
            className={`flex flex-col items-center p-2 rounded-xl transition-all ${d.activeTab === tab.id ? 'text-sky-600' : 'text-slate-400'}`}
          >
            <tab.icon className={`w-5 h-5 ${d.activeTab === tab.id ? 'stroke-[2.5px]' : 'stroke-[1.5px]'}`} />
            <span className="text-[10px] font-bold mt-1 uppercase tracking-tighter">{tab.label}</span>
          </button>
        ))}
        {/* More Options Button for smaller screens */}
        <button
          onClick={() => {
            const tabs = ['catalogue', 'expenses', 'audit'];
            const currentIdx = tabs.indexOf(d.activeTab as any);
            const nextTab = tabs[(currentIdx + 1) % tabs.length];
            d.setActiveTab(nextTab as any);
          }}
          className={`flex flex-col items-center p-2 rounded-xl transition-all ${['catalogue', 'expenses', 'audit'].includes(d.activeTab) ? 'text-sky-600' : 'text-slate-400'}`}
        >
          <History className={`w-5 h-5 ${['catalogue', 'expenses', 'audit'].includes(d.activeTab) ? 'stroke-[2.5px]' : 'stroke-[1.5px]'}`} />
          <span className="text-[10px] font-bold mt-1 uppercase tracking-tighter">More</span>
        </button>
      </nav>

      <motion.main
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
        className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-6 sm:space-y-8"
      >
        {d.activeTab === 'admin' && (
          <InsightsTab
            netMargin={d.netMargin} avgOrderValue={d.avgOrderValue} trueROI={d.trueROI} inventoryHealth={d.inventoryHealth}
            totalRevenue={d.totalRevenue} totalExpenses={d.totalExpenses} totalShippingDeductions={d.totalShippingDeductions}
            totalMaterialCost={d.totalMaterialCost} totalLaborCost={d.totalLaborCost} adminTotalHooks={d.adminTotalHooks}
            orders={d.orders} customerOrders={d.customerOrders} crafters={d.crafters}
            bestSellersData={d.bestSellersData} COLORS={d.COLORS} monthlyTrendData={d.monthlyTrendData} clvData={d.clvData}
            avgFulfillmentTime={d.avgFulfillmentTime}
          />
        )}

        {d.activeTab === 'crafters' && (
          <ProductionTab
            adminTotalHooks={d.adminTotalHooks} orders={d.orders} globalSearch={d.globalSearch} setGlobalSearch={d.setGlobalSearch}
            statusFilter={d.statusFilter} setStatusFilter={d.setStatusFilter} currentCrafterId={d.currentCrafterId} setCurrentCrafterId={d.setCurrentCrafterId}
            crafters={d.crafters} newCrafterName={d.newCrafterName} setNewCrafterName={d.setNewCrafterName}
            newCrafterPhone={d.newCrafterPhone} setNewCrafterPhone={d.setNewCrafterPhone} newCrafterAddress={d.newCrafterAddress} setNewCrafterAddress={d.setNewCrafterAddress}
            handleAddCrafter={d.handleAddCrafter} currentCrafter={d.crafters.find(c => c._id === d.currentCrafterId)} handleDeleteCrafter={d.handleDeleteCrafter}
            ladyTotalRev={d.orders.filter(o => o.crafterId === d.currentCrafterId).reduce((sum, o) => sum + o.revenue, 0)}
            ladyTotalProf={d.orders.filter(o => o.crafterId === d.currentCrafterId).reduce((sum, o) => sum + o.profit, 0)}
            handleHooksChange={d.handleHooksChange} exportToCSV={exportToCSV} isFormOpen={d.isFormOpen} setIsFormOpen={d.setIsFormOpen}
            editOrderId={d.editOrderId} resetForm={d.resetForm} handleSubmit={d.handleSubmit} orderDate={d.orderDate} setOrderDate={d.setOrderDate}
            piece={d.piece} setPiece={d.setPiece} yarns={d.yarns} addYarn={d.addYarn} removeYarn={d.removeYarn} updateYarn={d.updateYarn}
            stuffing={d.stuffing} setStuffing={d.setStuffing} wire={d.wire} setWire={d.setWire} eyes={d.eyes} setEyes={d.setEyes}
            materialCost={d.materialCost} setMaterialCost={d.setMaterialCost} qtyOrdered={d.qtyOrdered} setQtyOrdered={d.setQtyOrdered}
            qtyReceived={d.qtyReceived} setQtyReceived={d.setQtyReceived} timeTaken={d.timeTaken} setTimeTaken={d.setTimeTaken}
            laborCost={d.laborCost} setLaborCost={d.setLaborCost} sellingPrice={d.sellingPrice} setSellingPrice={d.setSellingPrice}
            ladyOrders={d.orders.filter(o => o.crafterId === d.currentCrafterId)} toggleOrderStatus={d.toggleOrderStatus} handleEdit={d.handleEdit} handleDelete={d.handleDelete}
          />
        )}

        {d.activeTab === 'sales' && (
          <OrderDeskTab
            customerOrders={d.customerOrders} exportToCSV={exportToCSV} resetSalesForm={d.resetSalesForm}
            isSalesFormOpen={d.isSalesFormOpen} setIsSalesFormOpen={d.setIsSalesFormOpen} globalSearch={d.globalSearch} setGlobalSearch={d.setGlobalSearch}
            statusFilter={d.statusFilter} setStatusFilter={d.setStatusFilter} editSalesOrderId={d.editSalesOrderId} handleSalesSubmit={d.handleSalesSubmit}
            customerName={d.customerName} setCustomerName={d.setCustomerName} salesOrderDate={d.salesOrderDate} setSalesOrderDate={d.setSalesOrderDate}
            customerPhone={d.customerPhone} setCustomerPhone={d.setCustomerPhone} customerAddress={d.customerAddress} setCustomerAddress={d.setCustomerAddress}
            products={d.products} updateSaleProduct={d.updateSaleProduct} addSaleProduct={d.addSaleProduct} removeSaleProduct={d.removeSaleProduct}
            inventory={d.inventory} setInvName={d.setInvName} setInvCategory={d.setInvCategory} setActiveTab={d.setActiveTab} setIsInventoryFormOpen={d.setIsInventoryFormOpen}
            shippingCharge={d.shippingCharge} setShippingCharge={d.setShippingCharge} actualShippingCost={d.actualShippingCost} setActualShippingCost={d.setActualShippingCost} salesStatus={d.salesStatus} setSalesStatus={d.setSalesStatus}
            toggleSalesOrderStatus={d.toggleSalesOrderStatus} handleSalesEdit={d.handleSalesEdit} handleSalesDelete={d.handleSalesDelete}
            handleGenerateInvoice={() => toast.success('Invoice generation coming soon!')} handleCopyShippingLabel={d.handleCopyLabel}
          />
        )}

        {d.activeTab === 'wallet' && (
          <ShippingTab
            walletTotalAdded={d.walletTotalAdded} walletTotalDeducted={d.totalShippingDeductions} walletBalance={d.walletBalance}
            isWalletFormOpen={d.isWalletFormOpen} setIsWalletFormOpen={d.setIsWalletFormOpen} handleWalletSubmit={d.handleWalletSubmit}
            walletDate={d.walletDate} setWalletDate={d.setWalletDate} aggregator={d.aggregator} setAggregator={d.setAggregator}
            walletAmount={d.walletAmount} setWalletAmount={d.setWalletAmount} referenceId={d.referenceId} setReferenceId={d.setReferenceId}
            walletTxns={d.walletTxns} handleWalletDelete={d.handleWalletDelete}
          />
        )}

        {d.activeTab === 'inventory' && (
          <InventoryTab
            inventoryTotalCost={d.inventoryTotalCost} lowStockCount={d.lowStockCount} resetInventoryForm={d.resetInventoryForm}
            isInventoryFormOpen={d.isInventoryFormOpen} setIsInventoryFormOpen={d.setIsInventoryFormOpen} inventoryWarnings={d.inventoryWarnings}
            editInventoryId={d.editInventoryId} handleInventorySubmit={d.handleInventorySubmit} invName={d.invName} setInvName={d.setInvName}
            invCategory={d.invCategory} setInvCategory={d.setInvCategory} invQty={d.invQty} setInvQty={d.setInvQty}
            invUnit={d.invUnit} setInvUnit={d.setInvUnit} invCost={d.invCost} setInvCost={d.setInvCost}
            invThreshold={d.invThreshold} setInvThreshold={d.setInvThreshold} inventory={d.inventory}
            handleInventoryEdit={d.handleInventoryEdit} handleInventoryDelete={d.handleInventoryDelete}
          />
        )}

        {d.activeTab === 'expenses' && (
          <ExpensesTab
            totalExpenses={d.totalExpenses} expenses={d.expenses} resetExpenseForm={d.resetExpenseForm}
            isExpenseFormOpen={d.isExpenseFormOpen} setIsExpenseFormOpen={d.setIsExpenseFormOpen} editExpenseId={d.editExpenseId}
            handleExpenseSubmit={d.handleExpenseSubmit} expDate={d.expDate} setExpDate={d.setExpDate} expCategory={d.expCategory}
            setExpCategory={d.setExpCategory} expAmount={d.expAmount} setExpAmount={d.setExpAmount} expDesc={d.expDesc} setExpDesc={d.setExpDesc}
            handleExpenseEdit={d.handleExpenseEdit} handleExpenseDelete={d.handleExpenseDelete}
          />
        )}

        {d.activeTab === 'catalogue' && (
          <CatalogueTab
            catalogueItems={d.catalogueItems} isCatalogueFormOpen={d.isCatalogueFormOpen} setIsCatalogueFormOpen={d.setIsCatalogueFormOpen}
            editCatalogueId={d.editCatalogueId} catName={d.catName} setCatName={d.setCatName} catDesc={d.catDesc} setCatDesc={d.setCatDesc}
            catImage={d.catImage} setCatImage={d.setCatImage} catSku={d.catSku} setCatSku={d.setCatSku}
            catRetailPrice={d.catRetailPrice} setCatRetailPrice={d.setCatRetailPrice}
            catPriceMoq10={d.catPriceMoq10} setCatPriceMoq10={d.setCatPriceMoq10}
            catPriceMoq20Plus={d.catPriceMoq20Plus} setCatPriceMoq20Plus={d.setCatPriceMoq20Plus}
            catPriceMoq50Plus={d.catPriceMoq50Plus} setCatPriceMoq50Plus={d.setCatPriceMoq50Plus}
            handleCatalogueSubmit={d.handleCatalogueSubmit} handleCatalogueEdit={d.handleCatalogueEdit}
            handleCatalogueDelete={d.handleCatalogueDelete} resetCatalogueForm={d.resetCatalogueForm}
            globalSearch={d.globalSearch} setGlobalSearch={d.setGlobalSearch}
          />
        )}

        {d.activeTab === 'audit' && <AuditTab auditLogs={d.auditLogs} />}
      </motion.main>

      <AnimatePresence>
        <ProfileModal
          isOpen={d.isProfileModalOpen} onClose={() => d.setIsProfileModalOpen(false)}
          profileName={d.profileName} setProfileName={d.setProfileName} profileEmail={d.profileEmail} setProfileEmail={d.setProfileEmail}
          profilePhotoUrl={d.profilePhotoUrl} setProfilePhotoUrl={d.setProfilePhotoUrl} profilePassword={d.profilePassword} setProfilePassword={d.setProfilePassword}
          handleFileUpload={d.handleFileUpload} handleUpdateProfile={d.handleUpdateProfile} isUpdatingProfile={d.isUpdatingProfile}
        />
        <AddUserModal
          isOpen={d.isAddingUserModalOpen} onClose={() => d.setIsAddingUserModalOpen(false)}
          newUserName={d.newUserName} setNewUserName={d.setNewUserName} newUserEmail={d.newUserEmail} setNewUserEmail={d.setNewUserEmail}
          newUserPassword={d.newUserPassword} setNewUserPassword={d.setNewUserPassword} newUserPhotoUrl={d.newUserPhotoUrl}
          handleFileUpload={d.handleFileUpload} handleCreateUser={d.handleCreateUser} isCreatingUser={d.isCreatingUser}
        />
      </AnimatePresence>
    </div>
  );
}
