import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Car, Users, DollarSign, Calendar, Search, Plus, TrendingUp, Clock, CheckCircle, XCircle, Edit2, Trash2, Save, X, Phone, AlertCircle, CreditCard, ChevronLeft, ChevronRight, Eye, LogOut, RotateCcw, UserPlus, Filter, BarChart3 } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// ===== SUPABASE SETUP =====
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

// ===== DATABASE FUNCTIONS =====
function dbLoad(table: string, callback: Function, orderBy?: string) {
  if (!supabase) { callback([]); return; }
  let query = supabase.from(table).select('*') as any;
  if (orderBy) query = query.order(orderBy, { ascending: false });
  query.then((res: any) => callback(res.data || []));
}

function dbInsert(table: string, row: any, callback: Function) {
  if (!supabase) { callback(null); return; }
  supabase.from(table).insert(row).select().single().then((res: any) => {
    if (res.error) { alert('❌ Lỗi: ' + res.error.message); callback(null); }
    else { callback(res.data); }
  });
}

function dbUpdate(table: string, id: string, data: any, callback: Function) {
  if (!supabase) { callback(null); return; }
  supabase.from(table).update(data).eq('id', id).select().single().then((res: any) => {
    if (res.error) { alert('❌ Lỗi: ' + res.error.message); callback(null); }
    else { callback(res.data); }
  });
}

function dbDelete(table: string, id: string, callback: Function) {
  if (!supabase) { callback(false); return; }
  supabase.from(table).delete().eq('id', id).then((res: any) => {
    if (res.error) { alert('❌ Lỗi: ' + res.error.message); callback(false); }
    else { callback(true); }
  });
}

// ===== CONSTANTS =====
const EXP_LABELS: any = { 
  fuel: "Nhiên liệu", 
  maintenance: "Bảo dưỡng", 
  repair: "Sửa chữa", 
  insurance: "Bảo hiểm", 
  wash: "Rửa xe", 
  road_fee: "Phí đường bộ", 
  fine: "Phạt nguội", 
  other: "Khác" 
};
const EXP_OPTIONS = Object.entries(EXP_LABELS).map(([value, label]) => ({ value, label }));
const PERMISSIONS: any = { 
  admin: ["dashboard", "vehicles", "rentals", "customers", "expenses", "calendar"], 
  manager: ["dashboard", "vehicles", "rentals", "customers", "expenses", "calendar"], 
  sale: ["dashboard", "rentals", "customers", "calendar"], 
  accountant: ["dashboard", "expenses"] 
};
const WRITE_PERMS: any = { 
  vehicles: ["admin", "manager"], 
  rentals: ["admin", "manager", "sale"], 
  customers: ["admin", "manager", "sale"], 
  expenses: ["admin", "manager", "accountant"] 
};
const ROLE_LABELS: any = { admin: "Quản trị", manager: "Quản lý", sale: "Kinh doanh", accountant: "Kế toán" };
const PAGE_SIZE = 10;

// Mock users for demo (trong production nên dùng Supabase Auth)
const DEMO_USERS = [
  { id: "u1", username: "admin", password: "admin123", role: "admin", name: "Admin", phone: "0901234567" },
  { id: "u2", username: "sale1", password: "sale123", role: "sale", name: "Sale 1", phone: "0912345678" },
  { id: "u3", username: "manager", password: "manager123", role: "manager", name: "Manager", phone: "0934567890" },
  { id: "u4", username: "accountant", password: "acc123", role: "accountant", name: "Kế toán", phone: "0945678901" },
];

// ===== UTILITY FUNCTIONS =====
const formatNumber = (n: any) => n ? n.toLocaleString("vi-VN") : "0";
const formatDate = (s: any) => { try { return new Date(s).toLocaleDateString("vi-VN"); } catch { return s; } };
const todayString = () => new Date().toISOString().split("T")[0];

// ===== UI COMPONENTS =====
function Toast({ toast }: any) {
  if (!toast) return null;
  const isError = toast.type === "error";
  return (
    <div className={`fixed top-4 right-4 z-[60] px-5 py-3 rounded-xl shadow-xl text-white text-sm font-medium flex items-center gap-2 ${isError ? "bg-red-500" : "bg-green-500"}`}>
      {isError ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
      {toast.msg}
    </div>
  );
}

function Spinner() {
  return (
    <div className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center">
      <div className="bg-white px-6 py-4 rounded-xl shadow-xl flex items-center gap-3">
        <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        Đang xử lý...
      </div>
    </div>
  );
}

function Modal({ onClose, title, children, wide }: any) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-3" onClick={onClose}>
      <div className={`bg-white rounded-2xl w-full max-h-[92vh] overflow-y-auto p-5 sm:p-6 ${wide ? "max-w-4xl" : "max-w-lg"}`} onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold truncate pr-4">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function FormInput({ label, value, onChange, placeholder, type = "text", error, className = "", textarea = false, disabled = false }: any) {
  const inputClass = `w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 ${error ? "border-red-400" : "border-gray-300"}`;
  return (
    <div className={className}>
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      {textarea ? (
        <textarea value={value || ""} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={inputClass} rows={2} disabled={disabled} />
      ) : (
        <input type={type} value={value || ""} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={inputClass} disabled={disabled} />
      )}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

function SelectInput({ label, value, onChange, options, placeholder = "-- Chọn --", error, className = "" }: any) {
  return (
    <div className={className}>
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <select value={value || ""} onChange={(e) => onChange(e.target.value)} className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 ${error ? "border-red-400" : "border-gray-300"}`}>
        <option value="">{placeholder}</option>
        {options.map((o: any) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

function Badge({ color, children }: any) {
  const colors: any = { 
    green: "bg-green-100 text-green-700", 
    orange: "bg-orange-100 text-orange-700", 
    red: "bg-red-100 text-red-700", 
    blue: "bg-blue-100 text-blue-700", 
    gray: "bg-gray-100 text-gray-700" 
  };
  return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${colors[color] || colors.gray}`}>{children}</span>;
}

function StatCard({ icon, title, value, subtitle, color }: any) {
  const colors: any = { 
    blue: "bg-blue-100 text-blue-600", 
    green: "bg-green-100 text-green-600", 
    orange: "bg-orange-100 text-orange-600", 
    purple: "bg-purple-100 text-purple-600" 
  };
  return (
    <div className="bg-white rounded-xl shadow-sm border p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-xs sm:text-sm">{title}</p>
          <p className="text-xl sm:text-2xl font-bold mt-1">{value}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
        </div>
        <div className={`p-2.5 rounded-xl ${colors[color] || ""}`}>{icon}</div>
      </div>
    </div>
  );
}

function Pagination({ page, total, onChange }: any) {
  const pages = Math.ceil(total / PAGE_SIZE);
  if (pages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-2 mt-4">
      <button disabled={page <= 1} onClick={() => onChange(page - 1)} className="px-3 py-1.5 rounded-lg border text-sm disabled:opacity-40 hover:bg-gray-50">‹</button>
      <span className="text-sm text-gray-600">{page}/{pages}</span>
      <button disabled={page >= pages} onClick={() => onChange(page + 1)} className="px-3 py-1.5 rounded-lg border text-sm disabled:opacity-40 hover:bg-gray-50">›</button>
    </div>
  );
}

function ConfirmModal({ msg, onConfirm, onCancel }: any) {
  return (
    <Modal onClose={onCancel} title="Xác nhận">
      <p className="text-sm text-gray-600 mb-4">{msg}</p>
      <div className="flex gap-2">
        <button onClick={onConfirm} className="flex-1 bg-red-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-red-700">Xác nhận</button>
        <button onClick={onCancel} className="flex-1 bg-gray-200 py-2 rounded-lg text-sm">Hủy</button>
      </div>
    </Modal>
  );
}

// ===== MAIN APP =====
export default function App() {
  const [isAuth, setIsAuth] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loginForm, setLoginForm] = useState({ u: "", p: "" });
  const [loginError, setLoginError] = useState("");
  const [tab, setTab] = useState("dashboard");
  const [month, setMonth] = useState(new Date());
  const [toast, setToast] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
  // Data states
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [rentals, setRentals] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);

  // Load all data from Supabase
  const loadAll = useCallback(() => {
    setLoading(true);
    dbLoad('vehicles', (d: any) => setVehicles(d), 'created_at');
    dbLoad('customers', (d: any) => setCustomers(d), 'created_at');
    dbLoad('rentals', (d: any) => setRentals(d), 'created_at');
    dbLoad('expenses', (d: any) => { 
      setExpenses(d); 
      setLoading(false); 
      setDataLoaded(true); 
    }, 'created_at');
  }, []);

  // Load data when authenticated
  useEffect(() => {
    if (isAuth && !dataLoaded) {
      loadAll();
    }
  }, [isAuth, dataLoaded, loadAll]);

  const notify = useCallback((msg: string, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const hasPerm = useCallback((p: string) => user && (PERMISSIONS[user.role] || []).includes(p), [user]);
  const canWrite = useCallback((p: string) => user && (WRITE_PERMS[p] || []).includes(user.role), [user]);

  const vMap = useMemo(() => {
    const m: any = {};
    vehicles.forEach(v => m[v.id] = v);
    return m;
  }, [vehicles]);

  const cMap = useMemo(() => {
    const m: any = {};
    customers.forEach(c => m[c.id] = c);
    return m;
  }, [customers]);

  const vehicleName = useCallback((id: string) => (vMap[id] || {}).name || "", [vMap]);
  const vehiclePlate = useCallback((id: string) => (vMap[id] || {}).plate || "", [vMap]);
  const customerName = useCallback((id: string) => (cMap[id] || {}).name || "", [cMap]);
  const customerPhone = useCallback((id: string) => (cMap[id] || {}).phone || "", [cMap]);

  const checkOverlap = useCallback((vid: string, sd: string, ed: string, excludeId?: string) => {
    return rentals.some(r => 
      r.vehicle_id === vid && 
      r.status === "active" && 
      r.id !== excludeId && 
      r.start_date <= ed && 
      r.end_date >= sd
    );
  }, [rentals]);

  const getVehicleStatus = useCallback((vid: string, date: string) => {
    const rental = rentals.find(r => 
      r.vehicle_id === vid && 
      r.status === "active" && 
      r.start_date <= date && 
      r.end_date >= date
    );
    if (!rental) return { status: "available", time: null, rental: null };
    return { status: "rented", time: date === rental.end_date ? rental.end_time : null, rental };
  }, [rentals]);

  const handleLogin = () => {
    if (!loginForm.u || !loginForm.p) {
      setLoginError("Vui lòng nhập đầy đủ");
      return;
    }
    const passwords: any = { admin: "admin123", sale1: "sale123", manager: "manager123", accountant: "acc123" };
    const foundUser = DEMO_USERS.find(u => u.username === loginForm.u);
    if (!foundUser || passwords[loginForm.u] !== loginForm.p) {
      setLoginError("Sai tên đăng nhập hoặc mật khẩu");
      return;
    }
    setUser(foundUser);
    setIsAuth(true);
    setLoginError("");
  };

  if (!isAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-md">
          <div className="text-center mb-6">
            <Car className="w-14 h-14 text-blue-600 mx-auto mb-3" />
            <h1 className="text-2xl font-bold">AutoRent Pro</h1>
            <p className="text-gray-500 text-sm mt-1">Hệ thống quản lý cho thuê xe</p>
          </div>
          <div className="space-y-3">
            <FormInput 
              label="Tên đăng nhập" 
              value={loginForm.u} 
              onChange={(v: string) => setLoginForm({ ...loginForm, u: v })} 
            />
            <FormInput 
              label="Mật khẩu" 
              type="password" 
              value={loginForm.p} 
              onChange={(v: string) => setLoginForm({ ...loginForm, p: v })} 
            />
            {loginError && <p className="text-red-500 text-sm text-center">{loginError}</p>}
            <button onClick={handleLogin} className="w-full bg-blue-600 text-white py-2.5 rounded-xl hover:bg-blue-700 font-semibold text-sm">
              Đăng nhập
            </button>
          </div>
          <div className="mt-5 p-3 bg-gray-50 rounded-xl text-xs text-gray-500 space-y-0.5">
            <p className="font-semibold text-gray-600 mb-1">Demo:</p>
            <p>• admin / admin123</p>
            <p>• sale1 / sale123</p>
            <p>• manager / manager123</p>
            <p>• accountant / acc123</p>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { k: "dashboard", icon: TrendingUp, label: "Tổng quan" },
    { k: "vehicles", icon: Car, label: "Xe" },
    { k: "rentals", icon: Calendar, label: "Hợp đồng" },
    { k: "customers", icon: Users, label: "Khách hàng" },
    { k: "expenses", icon: CreditCard, label: "Chi phí" },
    { k: "calendar", icon: Clock, label: "Lịch" },
  ].filter(t => hasPerm(t.k));

  return (
    <div className="min-h-screen bg-gray-50">
      <Toast toast={toast} />
      {loading && <Spinner />}
      
      <header className="bg-white shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2 min-w-0">
            <Car className="w-7 h-7 text-blue-600 shrink-0" />
            <div className="min-w-0">
              <h1 className="text-lg font-bold truncate">AutoRent Pro</h1>
              <p className="text-xs text-gray-500 truncate">
                {user.name} <Badge color="blue">{ROLE_LABELS[user.role]}</Badge>
              </p>
            </div>
          </div>
          <button 
            onClick={() => { setIsAuth(false); setUser(null); setDataLoaded(false); }} 
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 text-sm shrink-0"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Thoát</span>
          </button>
        </div>
      </header>

      <nav className="bg-white border-b sticky top-[52px] z-20">
        <div className="max-w-7xl mx-auto px-1 sm:px-6">
          <div className="flex overflow-x-auto py-1 gap-0.5">
            {tabs.map(t => {
              const Icon = t.icon;
              const active = tab === t.k;
              return (
                <button 
                  key={t.k} 
                  onClick={() => setTab(t.k)} 
                  className={`flex flex-col items-center px-2 py-1.5 rounded-lg whitespace-nowrap transition min-w-0 sm:flex-row sm:gap-2 sm:px-4 sm:py-3 ${active ? "bg-blue-50 text-blue-600 font-semibold" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`}
                >
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                  <span className="text-[10px] leading-tight mt-0.5 sm:hidden">{t.label}</span>
                  <span className="text-[15px] hidden sm:inline">{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
        {tab === "dashboard" && <DashboardTab vehicles={vehicles} rentals={rentals} expenses={expenses} customers={customers} customerName={customerName} vMap={vMap} />}
        {tab === "vehicles" && <VehiclesTab vehicles={vehicles} setVehicles={setVehicles} getVehicleStatus={getVehicleStatus} month={month} notify={notify} canWrite={canWrite("vehicles")} />}
        {tab === "rentals" && <RentalsTab vehicles={vehicles} setVehicles={setVehicles} customers={customers} rentals={rentals} setRentals={setRentals} checkOverlap={checkOverlap} notify={notify} setLoading={setLoading} customerName={customerName} customerPhone={customerPhone} vehicleName={vehicleName} vehiclePlate={vehiclePlate} vMap={vMap} canWrite={canWrite("rentals")} />}
        {tab === "customers" && <CustomersTab customers={customers} setCustomers={setCustomers} rentals={rentals} vehicleName={vehicleName} notify={notify} canWrite={canWrite("customers")} />}
        {tab === "expenses" && <ExpensesTab vehicles={vehicles} expenses={expenses} setExpenses={setExpenses} notify={notify} canWrite={canWrite("expenses")} vMap={vMap} />}
        {tab === "calendar" && <CalendarTab vehicles={vehicles} getVehicleStatus={getVehicleStatus} customerName={customerName} month={month} setMonth={setMonth} />}
      </main>
    </div>
  );
}

// ===== TAB COMPONENTS =====
function DashboardTab({ vehicles, rentals, expenses, customers, customerName, vMap }: any) {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const filteredRentals = useMemo(() => {
    return rentals.filter((r: any) => {
      if (r.status === "cancelled") return false;
      if (dateFrom && r.start_date < dateFrom) return false;
      if (dateTo && r.start_date > dateTo) return false;
      return true;
    });
  }, [rentals, dateFrom, dateTo]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter((e: any) => {
      if (dateFrom && e.date < dateFrom) return false;
      if (dateTo && e.date > dateTo) return false;
      return true;
    });
  }, [expenses, dateFrom, dateTo]);

  const totalRevenue = filteredRentals.reduce((s: number, r: any) => s + r.total + (r.surcharge || 0), 0);
  const totalExpense = filteredExpenses.reduce((s: number, e: any) => s + e.amount, 0);
  const profit = totalRevenue - totalExpense;
  const totalTrips = filteredRentals.length;
  
  const filterLabel = (!dateFrom && !dateTo) ? "Toàn bộ" : (dateFrom || "...") + " → " + (dateTo || "...");

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-xl shadow-sm border p-4">
        <div className="flex flex-wrap items-center gap-3">
          <Filter className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-600 font-medium">Lọc:</span>
          <input 
            type="date" 
            value={dateFrom} 
            onChange={(e) => setDateFrom(e.target.value)} 
            className="px-3 py-1.5 border rounded-lg text-sm" 
          />
          <span className="text-gray-400">→</span>
          <input 
            type="date" 
            value={dateTo} 
            onChange={(e) => setDateTo(e.target.value)} 
            className="px-3 py-1.5 border rounded-lg text-sm" 
          />
          {(dateFrom || dateTo) && (
            <button 
              onClick={() => { setDateFrom(""); setDateTo(""); }} 
              className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
            >
              <X className="w-3 h-3" />Xóa lọc
            </button>
          )}
          <span className="text-xs text-gray-400 ml-auto">{filterLabel}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={<DollarSign className="w-5 h-5" />} title="Tổng doanh thu" value={formatNumber(totalRevenue) + "đ"} color="purple" />
        <StatCard icon={<CreditCard className="w-5 h-5" />} title="Tổng chi phí" value={formatNumber(totalExpense) + "đ"} color="orange" />
        <StatCard icon={<TrendingUp className="w-5 h-5" />} title="Lợi nhuận" value={formatNumber(profit) + "đ"} color={profit >= 0 ? "green" : "orange"} subtitle={profit >= 0 ? "Có lãi" : "Đang lỗ"} />
        <StatCard icon={<Car className="w-5 h-5" />} title="Số chuyến" value={totalTrips} color="blue" subtitle={vehicles.length + " xe"} />
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-5">
        <h3 className="font-semibold mb-3 text-sm flex items-center gap-2">
          <Clock className="w-4 h-4 text-orange-500" />
          Hợp đồng đang hoạt động
        </h3>
        <div className="space-y-2">
          {filteredRentals.filter((r: any) => r.status === "active").map((r: any) => {
            const vehicle = vMap[r.vehicle_id];
            return (
              <div key={r.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-100">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-2xl shrink-0">{vehicle?.image || "🚗"}</span>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate">{customerName(r.customer_id)}</p>
                    <p className="text-xs text-gray-500 truncate">{vehicle?.name}</p>
                    <p className="text-xs text-gray-400">
                      {formatDate(r.start_date)} → {formatDate(r.end_date)}
                    </p>
                  </div>
                </div>
                <Badge color="orange">Đang thuê</Badge>
              </div>
            );
          })}
          {filteredRentals.filter((r: any) => r.status === "active").length === 0 && (
            <p className="text-center text-gray-400 py-6 text-sm">Không có hợp đồng nào đang hoạt động</p>
          )}
        </div>
      </div>
    </div>
  );
}

function VehiclesTab({ vehicles, setVehicles, canWrite, notify }: any) {
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const emptyForm = { name: "", plate: "", odo: "0", price_day: "", price_week: "", price_month: "", type: "Sedan", seats: "5", transmission: "Tự động", fuel: "Xăng", image: "🚗" };
  const [form, setForm] = useState<any>({ ...emptyForm });
  const [errors, setErrors] = useState<any>({});
  
  const filtered = vehicles.filter((v: any) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return v.name.toLowerCase().includes(s) || v.plate.toLowerCase().includes(s);
  });

  const addVehicle = () => {
    const e: any = {};
    if (!form.name.trim()) e.name = "Bắt buộc";
    if (!form.plate) e.plate = "Bắt buộc";
    else if (!/^\d{2}[A-Z]-\d{4,5}$/.test(form.plate.toUpperCase())) e.plate = "Sai (VD: 30A-12345)";
    else if (vehicles.some((v: any) => v.plate === form.plate.toUpperCase())) e.plate = "Đã tồn tại";
    if (!form.price_day || parseInt(form.price_day) <= 0) e.price_day = "Phải > 0";
    setErrors(e);
    if (Object.keys(e).length) return;

    const pd = parseInt(form.price_day);
    const row = {
      name: form.name.trim(),
      plate: form.plate.toUpperCase(),
      image: form.image,
      price_day: pd,
      price_week: parseInt(form.price_week) || pd * 6,
      price_month: parseInt(form.price_month) || pd * 25,
      odo: Math.max(0, parseInt(form.odo) || 0),
      type: form.type,
      seats: parseInt(form.seats) || 5,
      transmission: form.transmission,
      fuel: form.fuel,
      status: "available"
    };

    dbInsert('vehicles', row, (nv: any) => {
      if (nv) {
        setVehicles((prev: any) => [...prev, nv]);
        setForm({ ...emptyForm });
        setShowAdd(false);
        setErrors({});
        notify("✅ Thêm xe thành công!");
      }
    });
  };

  const saveEdit = () => {
    if (!editing.name.trim()) {
      notify("Tên xe bắt buộc", "error");
      return;
    }
    const old = vehicles.find((v: any) => v.id === editing.id);
    if (parseInt(editing.odo) < old.odo) {
      notify("ODO không thể giảm!", "error");
      return;
    }

    const data = {
      name: editing.name,
      odo: parseInt(editing.odo),
      price_day: parseInt(editing.price_day),
      price_week: parseInt(editing.price_week),
      price_month: parseInt(editing.price_month)
    };

    dbUpdate('vehicles', editing.id, data, (uv: any) => {
      if (uv) {
        setVehicles((prev: any) => prev.map((v: any) => v.id === editing.id ? { ...v, ...uv } : v));
        setEditing(null);
        notify("✅ Cập nhật thành công!");
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-between items-center gap-2">
        <h2 className="text-xl font-bold">Xe ({vehicles.length})</h2>
        <div className="flex gap-2 items-center">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-gray-400" />
            <input 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              placeholder="Tìm xe..." 
              className="pl-8 pr-3 py-2 border rounded-lg text-sm w-40" 
            />
          </div>
          {canWrite && (
            <button 
              onClick={() => setShowAdd(true)} 
              className="bg-blue-600 text-white px-3 py-2 rounded-lg flex items-center gap-1.5 hover:bg-blue-700 text-sm"
            >
              <Plus className="w-4 h-4" />Thêm xe
            </button>
          )}
        </div>
      </div>

      {showAdd && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <h3 className="font-semibold mb-3 text-sm">Thêm xe mới</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <FormInput label="Tên xe *" value={form.name} onChange={(v: string) => setForm({ ...form, name: v })} error={errors.name} />
            <FormInput label="Biển số *" value={form.plate} onChange={(v: string) => setForm({ ...form, plate: v.toUpperCase() })} error={errors.plate} placeholder="30A-12345" />
            <FormInput label="Giá/ngày *" type="number" value={form.price_day} onChange={(v: string) => setForm({ ...form, price_day: v })} error={errors.price_day} />
            <FormInput label="Giá/tuần" type="number" value={form.price_week} onChange={(v: string) => setForm({ ...form, price_week: v })} placeholder="Tự tính" />
            <FormInput label="Giá/tháng" type="number" value={form.price_month} onChange={(v: string) => setForm({ ...form, price_month: v })} placeholder="Tự tính" />
            <FormInput label="ODO (km)" type="number" value={form.odo} onChange={(v: string) => setForm({ ...form, odo: v })} />
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={addVehicle} className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 flex items-center gap-1.5">
              <Save className="w-4 h-4" />Lưu
            </button>
            <button onClick={() => { setShowAdd(false); setErrors({}); }} className="bg-gray-200 px-4 py-2 rounded-lg text-sm">Hủy</button>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {filtered.map((v: any) => {
          const isEditing = editing && editing.id === v.id;
          
          if (isEditing) {
            return (
              <div key={v.id} className="bg-white rounded-xl shadow-sm border p-4">
                <div className="space-y-2">
                  <FormInput label="Tên xe" value={editing.name} onChange={(val: string) => setEditing({ ...editing, name: val })} />
                  <FormInput label={"ODO ≥ " + formatNumber(v.odo)} type="number" value={String(editing.odo)} onChange={(val: string) => setEditing({ ...editing, odo: val })} />
                  <FormInput label="Giá/ngày" type="number" value={String(editing.price_day)} onChange={(val: string) => setEditing({ ...editing, price_day: val })} />
                  <div className="flex gap-2 pt-1">
                    <button onClick={saveEdit} className="flex-1 bg-green-600 text-white py-1.5 rounded-lg text-sm">Lưu</button>
                    <button onClick={() => setEditing(null)} className="flex-1 bg-gray-200 py-1.5 rounded-lg text-sm">Hủy</button>
                  </div>
                </div>
              </div>
            );
          }

          const statusColor = v.status === "available" ? "green" : v.status === "rented" ? "orange" : "red";
          const statusText = v.status === "available" ? "Sẵn sàng" : v.status === "rented" ? "Đang thuê" : "Bảo trì";
          
          return (
            <div key={v.id} className="bg-white rounded-xl shadow-sm border p-4 hover:shadow-md transition">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-3xl">{v.image}</span>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm truncate">{v.name}</h3>
                    <p className="text-gray-500 text-xs">{v.plate}</p>
                  </div>
                </div>
                <Badge color={statusColor}>{statusText}</Badge>
              </div>
              
              <div className="space-y-1 text-sm mb-3 pb-3 border-b">
                <div className="flex justify-between">
                  <span className="text-gray-600">ODO:</span>
                  <span className="font-medium">{formatNumber(v.odo)} km</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Ngày:</span>
                  <span className="font-medium text-blue-600">{formatNumber(v.price_day)}đ</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tuần:</span>
                  <span className="font-medium text-green-600">{formatNumber(v.price_week)}đ</span>
                </div>
              </div>

              {canWrite && (
                <div className="flex gap-2">
                  <button 
                    onClick={() => setEditing({ ...v })} 
                    className="flex-1 bg-blue-50 text-blue-600 py-1.5 rounded-lg text-xs hover:bg-blue-100 flex items-center justify-center gap-1"
                  >
                    <Edit2 className="w-3.5 h-3.5" />Sửa
                  </button>
                </div>
              )}
            </div>
          );
        })}
        
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-10 text-gray-400 text-sm">Không tìm thấy xe</div>
        )}
      </div>
    </div>
  );
}

function RentalsTab({ rentals, vehicles, setVehicles, setRentals, customers, checkOverlap, notify, setLoading, customerName, vehicleName, vehiclePlate, vMap, canWrite }: any) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showAdd, setShowAdd] = useState(false);
  const [returnModal, setReturnModal] = useState<any>(null);
  const emptyForm = { customer_id: "", vehicle_id: "", start_date: "", start_time: "09:00", end_date: "", end_time: "18:00", rental_type: "day", custom_price: "", deposit: "", pickup_location: "", notes: "", odo_start: "" };
  const [form, setForm] = useState<any>({ ...emptyForm });
  const [returnForm, setReturnForm] = useState<any>({ odo_end: "", surcharge: "0", surcharge_note: "" });
  const [errors, setErrors] = useState<any>({});
  
  const calculatePrice = () => {
    if (!form.vehicle_id || !form.start_date || !form.end_date) return 0;
    const vehicle = vMap[form.vehicle_id];
    if (!vehicle) return 0;
    const days = Math.ceil((new Date(form.end_date).getTime() - new Date(form.start_date).getTime()) / 86400000);
    if (days <= 0) return 0;
    if (form.rental_type === "day") return days * vehicle.price_day;
    if (form.rental_type === "week") return Math.ceil(days / 7) * vehicle.price_week;
    return Math.ceil(days / 30) * vehicle.price_month;
  };

  const createRental = () => {
    const e: any = {};
    const today = todayString();
    if (!form.customer_id) e.customer_id = "Chọn KH";
    if (!form.vehicle_id) e.vehicle_id = "Chọn xe";
    if (!form.start_date) e.start_date = "Chọn ngày";
    else if (form.start_date < today) e.start_date = "Không chọn quá khứ";
    if (!form.end_date) e.end_date = "Chọn ngày";
    else if (form.start_date && form.end_date <= form.start_date) e.end_date = "Phải sau ngày nhận";
    if (!form.odo_start) e.odo_start = "Nhập ODO";
    if (form.vehicle_id && form.start_date && form.end_date && !e.end_date && checkOverlap(form.vehicle_id, form.start_date, form.end_date)) {
      e.vehicle_id = "Xe đã có lịch thuê trùng!";
    }
    const v = vMap[form.vehicle_id];
    if (v && form.odo_start && parseInt(form.odo_start) < v.odo) e.odo_start = "Phải ≥ " + formatNumber(v.odo);
    setErrors(e);
    if (Object.keys(e).length) return;

    const days = Math.ceil((new Date(form.end_date).getTime() - new Date(form.start_date).getTime()) / 86400000);
    const basePrice = calculatePrice();
    const finalPrice = parseInt(form.custom_price) || basePrice;
    const deposit = Math.min(parseInt(form.deposit) || 0, finalPrice);

    const newRental = {
      customer_id: form.customer_id,
      vehicle_id: v.id,
      start_date: form.start_date,
      start_time: form.start_time,
      end_date: form.end_date,
      end_time: form.end_time,
      rental_type: form.rental_type,
      total_days: days,
      base_price: basePrice,
      total: finalPrice,
      deposit: deposit,
      paid: deposit,
      surcharge: 0,
      surcharge_note: "",
      status: "active",
      pickup_location: form.pickup_location || "Văn phòng",
      notes: form.notes,
      odo_start: parseInt(form.odo_start),
      odo_end: null,
      actual_return_date: null
    };

    dbInsert('rentals', newRental, (saved: any) => {
      if (saved) {
        setRentals((prev: any) => [saved, ...prev]);
        dbUpdate('vehicles', v.id, { status: "rented" }, () => {
          setVehicles((prev: any) => prev.map((x: any) => x.id === v.id ? { ...x, status: "rented" } : x));
        });
        setForm({ ...emptyForm });
        setShowAdd(false);
        setErrors({});
        setPage(1);
        notify("✅ Tạo HĐ thành công!");
      }
    });
  };

  const doReturn = () => {
    const r = returnModal;
    if (!returnForm.odo_end || parseInt(returnForm.odo_end) < r.odo_start) {
      notify("ODO trả phải ≥ " + formatNumber(r.odo_start) + "km", "error");
      return;
    }
    setLoading(true);
    const surcharge = Math.max(0, parseInt(returnForm.surcharge) || 0);

    dbUpdate('rentals', r.id, {
      status: "completed",
      odo_end: parseInt(returnForm.odo_end),
      surcharge: surcharge,
      surcharge_note: returnForm.surcharge_note,
      actual_return_date: todayString(),
      paid: r.total + surcharge
    }, (ur: any) => {
      if (ur) {
        setRentals((prev: any) => prev.map((x: any) => x.id === r.id ? { ...x, ...ur } : x));
        dbUpdate('vehicles', r.vehicle_id, { status: "available", odo: parseInt(returnForm.odo_end) }, (uv: any) => {
          if (uv) {
            setVehicles((prev: any) => prev.map((x: any) => x.id === r.vehicle_id ? { ...x, ...uv } : x));
          }
          setReturnModal(null);
          setReturnForm({ odo_end: "", surcharge: "0", surcharge_note: "" });
          setLoading(false);
          notify("✅ Trả xe thành công!");
        });
      } else {
        setLoading(false);
      }
    });
  };

  const basePrice = calculatePrice();
  
  const filtered = rentals.filter((r: any) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return customerName(r.customer_id).toLowerCase().includes(s) || vehicleName(r.vehicle_id).toLowerCase().includes(s);
  }).sort((a: any, b: any) => (b.start_date || "").localeCompare(a.start_date || ""));
  
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const customerOptions = customers.map((c: any) => ({ value: c.id, label: c.name + " — " + c.phone }));
  const vehicleOptions = vehicles.filter((v: any) => v.status === "available").map((v: any) => ({ value: v.id, label: v.name + " — " + v.plate }));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-between items-center gap-2">
        <h2 className="text-xl font-bold">Hợp đồng ({rentals.length})</h2>
        <div className="flex gap-2 items-center flex-wrap">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-gray-400" />
            <input 
              value={search} 
              onChange={(e) => { setSearch(e.target.value); setPage(1); }} 
              placeholder="Tìm..." 
              className="pl-8 pr-3 py-2 border rounded-lg text-sm w-36" 
            />
          </div>
          {canWrite && (
            <button 
              onClick={() => setShowAdd(true)} 
              className="bg-green-600 text-white px-3 py-2 rounded-lg flex items-center gap-1.5 hover:bg-green-700 text-sm"
            >
              <Plus className="w-4 h-4" />Tạo mới
            </button>
          )}
        </div>
      </div>

      {showAdd && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <h3 className="font-semibold mb-3 text-sm">Tạo hợp đồng mới</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <SelectInput label="Khách hàng *" value={form.customer_id} onChange={(v: string) => setForm({ ...form, customer_id: v })} options={customerOptions} error={errors.customer_id} />
            <SelectInput label="Xe *" value={form.vehicle_id} onChange={(v: string) => { const vh = vMap[v]; setForm({ ...form, vehicle_id: v, odo_start: vh ? String(vh.odo) : "" }); }} options={vehicleOptions} error={errors.vehicle_id} />
            <FormInput label="Ngày nhận *" type="date" value={form.start_date} onChange={(v: string) => setForm({ ...form, start_date: v })} error={errors.start_date} />
            <FormInput label="Giờ nhận" type="time" value={form.start_time} onChange={(v: string) => setForm({ ...form, start_time: v })} />
            <FormInput label="Ngày trả *" type="date" value={form.end_date} onChange={(v: string) => setForm({ ...form, end_date: v })} error={errors.end_date} />
            <FormInput label="Giờ trả" type="time" value={form.end_time} onChange={(v: string) => setForm({ ...form, end_time: v })} />
            <SelectInput label="Loại thuê" value={form.rental_type} onChange={(v: string) => setForm({ ...form, rental_type: v })} options={[{ value: "day", label: "Ngày" }, { value: "week", label: "Tuần" }, { value: "month", label: "Tháng" }]} />
            <FormInput label="ODO nhận *" type="number" value={form.odo_start} onChange={(v: string) => setForm({ ...form, odo_start: v })} error={errors.odo_start} />
            {basePrice > 0 && (
              <div className="sm:col-span-2 p-3 bg-white rounded-xl border">
                <p className="text-sm text-gray-600 mb-2">Giá gốc: <span className="font-bold text-blue-600">{formatNumber(basePrice)}đ</span></p>
                <FormInput label="Giá tùy chỉnh" type="number" value={form.custom_price} onChange={(v: string) => setForm({ ...form, custom_price: v })} placeholder={formatNumber(basePrice)} />
              </div>
            )}
            <FormInput label="Tiền cọc" type="number" value={form.deposit} onChange={(v: string) => setForm({ ...form, deposit: v })} />
            <FormInput label="Địa điểm nhận" value={form.pickup_location} onChange={(v: string) => setForm({ ...form, pickup_location: v })} />
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={createRental} className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 flex items-center gap-1.5">
              <Save className="w-4 h-4" />Tạo
            </button>
            <button onClick={() => { setShowAdd(false); setErrors({}); }} className="bg-gray-200 px-4 py-2 rounded-lg text-sm">Hủy</button>
          </div>
        </div>
      )}
      
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-3 py-2.5 text-left">Khách</th>
                <th className="px-3 py-2.5 text-left">Xe</th>
                <th className="px-3 py-2.5 text-left">Ngày</th>
                <th className="px-3 py-2.5 text-right">Tiền</th>
                <th className="px-3 py-2.5 text-left">TT</th>
                <th className="px-3 py-2.5"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {paginated.map((r: any) => {
                const vehicle = vMap[r.vehicle_id];
                const statusColor = r.status === "active" ? "orange" : r.status === "completed" ? "green" : "red";
                const statusText = r.status === "active" ? "Thuê" : r.status === "completed" ? "Xong" : "Hủy";
                
                return (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2.5">
                      <p className="font-medium">{customerName(r.customer_id)}</p>
                    </td>
                    <td className="px-3 py-2.5">
                      <p>{vehicle?.name}</p>
                      <p className="text-xs text-gray-400">{vehicle?.plate}</p>
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <p>{formatDate(r.start_date)}</p>
                      <p className="text-xs text-gray-400">→ {formatDate(r.end_date)}</p>
                    </td>
                    <td className="px-3 py-2.5 text-right font-semibold text-green-600">
                      {formatNumber(r.total)}đ
                      {r.surcharge > 0 && <span className="text-orange-500 text-xs block">+{formatNumber(r.surcharge)}</span>}
                    </td>
                    <td className="px-3 py-2.5">
                      <Badge color={statusColor}>{statusText}</Badge>
                    </td>
                    <td className="px-3 py-2.5">
                      {r.status === "active" && canWrite && (
                        <button 
                          onClick={() => { setReturnModal(r); setReturnForm({ odo_end: String(r.odo_start), surcharge: "0", surcharge_note: "" }); }} 
                          className="bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700 flex items-center gap-1"
                        >
                          <RotateCcw className="w-3 h-3" />Trả
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {paginated.length === 0 && <p className="text-center py-8 text-gray-400 text-sm">Không có</p>}
      </div>
      
      <Pagination page={page} total={filtered.length} onChange={setPage} />

      {returnModal && (
        <Modal onClose={() => setReturnModal(null)} title="Trả xe">
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 rounded-xl text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-500">Xe:</span>
                <span>{vehicleName(returnModal.vehicle_id)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Khách:</span>
                <span>{customerName(returnModal.customer_id)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">ODO nhận:</span>
                <span>{formatNumber(returnModal.odo_start)} km</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Tổng:</span>
                <span className="text-green-600 font-bold">{formatNumber(returnModal.total)}đ</span>
              </div>
            </div>
            <FormInput 
              label={"ODO trả ≥ " + formatNumber(returnModal.odo_start)} 
              type="number" 
              value={returnForm.odo_end} 
              onChange={(v: string) => setReturnForm({ ...returnForm, odo_end: v })} 
            />
            <FormInput 
              label="Phụ thu (đ)" 
              type="number" 
              value={returnForm.surcharge} 
              onChange={(v: string) => setReturnForm({ ...returnForm, surcharge: v })} 
            />
            {parseInt(returnForm.surcharge) > 0 && (
              <FormInput 
                label="Lý do" 
                value={returnForm.surcharge_note} 
                onChange={(v: string) => setReturnForm({ ...returnForm, surcharge_note: v })} 
              />
            )}
            <div className="p-3 bg-green-50 rounded-xl">
              <p className="text-sm">
                Tổng: <span className="text-xl font-bold text-green-600">
                  {formatNumber(returnModal.total + (parseInt(returnForm.surcharge) || 0))}đ
                </span>
              </p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={doReturn} 
                className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl font-medium hover:bg-blue-700 flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />Xác nhận
              </button>
              <button 
                onClick={() => setReturnModal(null)} 
                className="flex-1 bg-gray-200 py-2.5 rounded-xl"
              >
                Hủy
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function CustomersTab({ customers, setCustomers, rentals, vehicleName, notify, canWrite }: any) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showAdd, setShowAdd] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const emptyForm = { name: "", phone: "", address: "", id_card: "", license: "" };
  const [form, setForm] = useState<any>({ ...emptyForm });
  const [errors, setErrors] = useState<any>({});

  const addCustomer = () => {
    const e: any = {};
    if (!form.name.trim()) e.name = "Bắt buộc";
    if (!form.phone) e.phone = "Bắt buộc";
    else if (!/^0\d{9}$/.test(form.phone)) e.phone = "10 số, bắt đầu bằng 0";
    else if (customers.some((c: any) => c.phone === form.phone)) e.phone = "Đã tồn tại";
    if (form.id_card && !/^\d{9}$|^\d{12}$/.test(form.id_card)) e.id_card = "9 hoặc 12 số";
    setErrors(e);
    if (Object.keys(e).length) return;

    dbInsert('customers', form, (nc: any) => {
      if (nc) {
        setCustomers((prev: any) => [...prev, nc]);
        setForm({ ...emptyForm });
        setShowAdd(false);
        setErrors({});
        notify("✅ Thêm KH thành công!");
      }
    });
  };

  const filtered = customers.filter((c: any) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return c.name.toLowerCase().includes(s) || c.phone.includes(s);
  });
  
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-between items-center gap-2">
        <h2 className="text-xl font-bold">Khách hàng ({customers.length})</h2>
        <div className="flex gap-2 items-center">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-gray-400" />
            <input 
              value={search} 
              onChange={(e) => { setSearch(e.target.value); setPage(1); }} 
              placeholder="Tìm KH..." 
              className="pl-8 pr-3 py-2 border rounded-lg text-sm w-44" 
            />
          </div>
          {canWrite && (
            <button 
              onClick={() => setShowAdd(true)} 
              className="bg-green-600 text-white px-3 py-2 rounded-lg flex items-center gap-1.5 hover:bg-green-700 text-sm"
            >
              <UserPlus className="w-4 h-4" />Thêm KH
            </button>
          )}
        </div>
      </div>

      {showAdd && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <h3 className="font-semibold mb-3 text-sm">Thêm khách hàng</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormInput label="Họ tên *" value={form.name} onChange={(v: string) => setForm({ ...form, name: v })} error={errors.name} />
            <FormInput label="SĐT *" value={form.phone} onChange={(v: string) => setForm({ ...form, phone: v.replace(/\D/g, "") })} error={errors.phone} placeholder="0901234567" />
            <FormInput label="Địa chỉ" value={form.address} onChange={(v: string) => setForm({ ...form, address: v })} />
            <FormInput label="CMND/CCCD" value={form.id_card} onChange={(v: string) => setForm({ ...form, id_card: v.replace(/\D/g, "") })} error={errors.id_card} />
            <FormInput label="Bằng lái" value={form.license} onChange={(v: string) => setForm({ ...form, license: v })} />
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={addCustomer} className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 flex items-center gap-1.5">
              <Save className="w-4 h-4" />Lưu
            </button>
            <button onClick={() => { setShowAdd(false); setErrors({}); }} className="bg-gray-200 px-4 py-2 rounded-lg text-sm">Hủy</button>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {paginated.map((c: any) => {
          const customerRentals = rentals.filter((r: any) => r.customer_id === c.id);
          const spent = customerRentals.reduce((s: number, r: any) => s + r.total, 0);
          
          return (
            <div 
              key={c.id} 
              className="bg-white rounded-xl shadow-sm border p-4 hover:shadow-md cursor-pointer transition" 
              onClick={() => setSelectedCustomer(c)}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold shrink-0">
                  {c.name[0]}
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-sm truncate">{c.name}</h3>
                  <p className="text-xs text-gray-500">{c.phone}</p>
                </div>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-gray-500 text-sm">Hợp đồng:</span>
                <span className="text-sm font-medium">{customerRentals.length}</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-gray-500 text-sm">Chi tiêu:</span>
                <span className="text-sm font-medium text-green-600">{formatNumber(spent)}đ</span>
              </div>
            </div>
          );
        })}
        
        {paginated.length === 0 && (
          <div className="col-span-full text-center py-10 text-gray-400 text-sm">Không tìm thấy</div>
        )}
      </div>
      
      <Pagination page={page} total={filtered.length} onChange={setPage} />

      {selectedCustomer && (
        <Modal onClose={() => setSelectedCustomer(null)} title={selectedCustomer.name}>
          <div className="space-y-2 text-sm mb-4">
            <div className="flex justify-between">
              <span className="text-gray-500">SĐT:</span>
              <span>{selectedCustomer.phone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Địa chỉ:</span>
              <span>{selectedCustomer.address || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">CMND:</span>
              <span>{selectedCustomer.id_card || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Bằng lái:</span>
              <span>{selectedCustomer.license || "—"}</span>
            </div>
          </div>
          <h4 className="font-semibold text-sm mb-2 pt-3 border-t">Lịch sử thuê</h4>
          <div className="space-y-1.5">
            {rentals.filter((r: any) => r.customer_id === selectedCustomer.id).map((r: any) => (
              <div key={r.id} className="flex justify-between items-center bg-gray-50 p-2 rounded-lg text-sm">
                <span className="truncate">{vehicleName(r.vehicle_id)}</span>
                <span className="text-xs text-gray-400 ml-2">
                  {formatDate(r.start_date)}→{formatDate(r.end_date)}
                </span>
                <Badge color={r.status === "active" ? "orange" : "green"}>
                  {r.status === "active" ? "Thuê" : "Xong"}
                </Badge>
              </div>
            ))}
          </div>
        </Modal>
      )}
    </div>
  );
}

function ExpensesTab({ expenses, setExpenses, vehicles, vMap, notify, canWrite }: any) {
  const [filterType, setFilterType] = useState("all");
  const [page, setPage] = useState(1);
  const [showAdd, setShowAdd] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<any>(null);
  const emptyForm = { vehicle_id: "", type: "", amount: "", date: "", description: "" };
  const [form, setForm] = useState<any>({ ...emptyForm });
  const [errors, setErrors] = useState<any>({});
  
  const total = expenses.reduce((s: number, e: any) => s + e.amount, 0);
  
  const vehicleOptions = vehicles.map((v: any) => ({ value: v.id, label: v.name + " — " + v.plate }));
  
  const addExpense = () => {
    const e: any = {};
    if (!form.vehicle_id) e.vehicle_id = "Chọn xe";
    if (!form.type) e.type = "Chọn loại";
    if (!form.amount || parseInt(form.amount) <= 0) e.amount = "> 0";
    if (!form.date) e.date = "Chọn ngày";
    setErrors(e);
    if (Object.keys(e).length) return;

    const row = {
      vehicle_id: form.vehicle_id,
      type: form.type,
      amount: parseInt(form.amount),
      date: form.date,
      description: form.description
    };

    dbInsert('expenses', row, (ne: any) => {
      if (ne) {
        setExpenses((prev: any) => [ne, ...prev]);
        setForm({ ...emptyForm });
        setShowAdd(false);
        setErrors({});
        notify("✅ Thêm thành công!");
      }
    });
  };

  const filtered = expenses.filter((e: any) => filterType === "all" || e.type === filterType)
    .sort((a: any, b: any) => b.date.localeCompare(a.date));
  
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap justify-between items-center gap-2">
        <h2 className="text-xl font-bold">Chi phí</h2>
        <div className="flex gap-2 items-center flex-wrap">
          <select 
            value={filterType} 
            onChange={(e) => { setFilterType(e.target.value); setPage(1); }} 
            className="px-3 py-2 border rounded-lg text-sm"
          >
            <option value="all">Tất cả</option>
            {EXP_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          {canWrite && (
            <button 
              onClick={() => setShowAdd(true)} 
              className="bg-red-600 text-white px-3 py-2 rounded-lg flex items-center gap-1.5 hover:bg-red-700 text-sm"
            >
              <Plus className="w-4 h-4" />Thêm
            </button>
          )}
        </div>
      </div>

      {showAdd && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <h3 className="font-semibold mb-3 text-sm">Thêm chi phí</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <SelectInput label="Xe *" value={form.vehicle_id} onChange={(v: string) => setForm({ ...form, vehicle_id: v })} options={vehicleOptions} error={errors.vehicle_id} />
            <SelectInput label="Loại *" value={form.type} onChange={(v: string) => setForm({ ...form, type: v })} options={EXP_OPTIONS} error={errors.type} />
            <FormInput label="Số tiền *" type="number" value={form.amount} onChange={(v: string) => setForm({ ...form, amount: v })} error={errors.amount} />
            <FormInput label="Ngày *" type="date" value={form.date} onChange={(v: string) => setForm({ ...form, date: v })} error={errors.date} />
            <FormInput label="Mô tả" value={form.description} onChange={(v: string) => setForm({ ...form, description: v })} textarea className="sm:col-span-2" />
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={addExpense} className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 flex items-center gap-1.5">
              <Save className="w-4 h-4" />Lưu
            </button>
            <button onClick={() => { setShowAdd(false); setErrors({}); }} className="bg-gray-200 px-4 py-2 rounded-lg text-sm">Hủy</button>
          </div>
        </div>
      )}
      
      <div className="bg-white rounded-xl shadow-sm border p-4">
        <p className="text-sm text-gray-500">
          Tổng: <span className="text-xl font-bold text-red-600">{formatNumber(total)}đ</span>
        </p>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-3 py-2.5 text-left">Ngày</th>
                <th className="px-3 py-2.5 text-left">Xe</th>
                <th className="px-3 py-2.5 text-left">Loại</th>
                <th className="px-3 py-2.5 text-left">Mô tả</th>
                <th className="px-3 py-2.5 text-right">Tiền</th>
                <th className="px-3 py-2.5"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {paginated.map((e: any) => {
                const vehicle = vMap[e.vehicle_id];
                const typeLabel = EXP_LABELS[e.type] || e.type;
                
                return (
                  <tr key={e.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2.5">{formatDate(e.date)}</td>
                    <td className="px-3 py-2.5">{vehicle?.name}</td>
                    <td className="px-3 py-2.5"><Badge color="gray">{typeLabel}</Badge></td>
                    <td className="px-3 py-2.5 text-gray-500 truncate max-w-[200px]">{e.description}</td>
                    <td className="px-3 py-2.5 text-right text-red-500 font-medium">
                      -{formatNumber(e.amount)}đ
                    </td>
                    <td className="px-3 py-2.5">
                      {canWrite && (
                        <button 
                          onClick={() => setDeleteConfirm(e)} 
                          className="text-red-400 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {paginated.length === 0 && <p className="text-center py-8 text-gray-400 text-sm">Không có</p>}
      </div>
      
      <Pagination page={page} total={filtered.length} onChange={setPage} />

      {deleteConfirm && (
        <ConfirmModal 
          msg={"Xóa chi phí " + formatNumber(deleteConfirm.amount) + "đ?"} 
          onConfirm={() => {
            dbDelete('expenses', deleteConfirm.id, (ok: boolean) => {
              if (ok) {
                setExpenses((prev: any) => prev.filter((x: any) => x.id !== deleteConfirm.id));
                notify("✅ Đã xóa");
              }
              setDeleteConfirm(null);
            });
          }} 
          onCancel={() => setDeleteConfirm(null)} 
        />
      )}
    </div>
  );
}

function CalendarTab({ vehicles, getVehicleStatus, customerName, month, setMonth }: any) {
  const year = month.getFullYear();
  const monthNum = month.getMonth();
  const daysInMonth = new Date(year, monthNum + 1, 0).getDate();
  const startDay = new Date(year, monthNum, 1).getDay();
  const dayNames = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
  const today = todayString();
  
  const empties = Array.from({ length: startDay }, (_, i) => i);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center gap-3 mb-4 bg-white rounded-xl shadow-sm border p-3">
        <button 
          onClick={() => setMonth(new Date(year, monthNum - 1, 1))} 
          className="p-1.5 hover:bg-gray-100 rounded-lg"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-bold">Tháng {monthNum + 1}/{year}</h2>
        <button 
          onClick={() => setMonth(new Date(year, monthNum + 1, 1))} 
          className="p-1.5 hover:bg-gray-100 rounded-lg"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
      
      {vehicles.map((v: any) => (
        <div key={v.id} className="bg-white rounded-xl shadow-sm border p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">{v.image}</span>
            <div>
              <h3 className="font-semibold text-sm">{v.name}</h3>
              <p className="text-xs text-gray-500">{v.plate}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-7 gap-1.5">
            {dayNames.map(d => (
              <div key={d} className="text-center text-xs font-semibold text-gray-400 py-0.5">
                {d}
              </div>
            ))}
            
            {empties.map(i => <div key={`empty-${i}`} />)}
            
            {days.map(day => {
              const dateStr = `${year}-${String(monthNum + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const status = getVehicleStatus(v.id, dateStr);
              const isToday = dateStr === today;
              
              const borderClass = isToday ? "border-blue-500 border-2" : "border-gray-100";
              const bgClass = status.status === "available" ? "bg-green-50" : "bg-red-50";
              const textClass = status.status === "available" ? "text-green-600" : "text-red-600";
              
              return (
                <div 
                  key={day} 
                  className={`rounded-lg p-1.5 min-h-[48px] sm:min-h-[56px] border ${borderClass} ${bgClass}`}
                >
                  <p className="text-xs font-semibold">{day}</p>
                  <p className={`text-[10px] ${textClass}`}>
                    {status.status === "available" ? "✅" : "🔄"}
                  </p>
                  {status.time && (
                    <p className="text-[10px] text-orange-600">{status.time}</p>
                  )}
                  {status.rental && (
                    <p className="text-[10px] text-gray-500 truncate">
                      {customerName(status.rental.customer_id)}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
