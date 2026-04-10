import { useState, useMemo, useCallback } from "react";
import { Car, Users, DollarSign, Calendar, Plus, TrendingUp, Clock, Edit2, Trash2, Save, X, Phone, AlertCircle, CreditCard, ChevronLeft, ChevronRight, Eye, LogOut, RotateCcw, UserPlus, Search, CheckCircle, XCircle, Filter, BarChart3 } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

var sbUrl = import.meta.env.VITE_SUPABASE_URL || "";
var sbKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
var sb = (sbUrl && sbKey) ? createClient(sbUrl, sbKey) : null;

function dbLoad(table: string, cb: Function, order?: string) {
  if (!sb) { cb([]); return; }
  var q = sb.from(table).select("*") as any;
  if (order) q = q.order(order, { ascending: false });
  q.then(function(res: any) { cb(res.data || []); });
}
function dbInsert(table: string, row: any, cb: Function) {
  if (!sb) { cb(null); return; }
  sb.from(table).insert(row).select().single().then(function(res: any) {
    if (res.error) { alert("Lỗi: " + res.error.message); cb(null); }
    else { cb(res.data); }
  });
}
function dbUpdate(table: string, id: string, data: any, cb: Function) {
  if (!sb) { cb(null); return; }
  sb.from(table).update(data).eq("id", id).select().single().then(function(res: any) {
    if (res.error) { alert("Lỗi: " + res.error.message); cb(null); }
    else { cb(res.data); }
  });
}
function dbDelete(table: string, id: string, cb: Function) {
  if (!sb) { cb(false); return; }
  sb.from(table).delete().eq("id", id).then(function(res: any) {
    if (res.error) { alert("Lỗi: " + res.error.message); cb(false); }
    else { cb(true); }
  });
}

var EXP_L: any = { fuel: "Nhiên liệu", maintenance: "Bảo dưỡng", repair: "Sửa chữa", insurance: "Bảo hiểm", wash: "Rửa xe", road_fee: "Phí đường bộ", fine: "Phạt nguội", other: "Khác" };
var EXP_O = Object.entries(EXP_L).map(function(e: any) { return { value: e[0], label: e[1] }; });
var PERMS: any = { admin: ["dashboard", "vehicles", "rentals", "customers", "expenses", "calendar"], manager: ["dashboard", "vehicles", "rentals", "customers", "expenses", "calendar"], sale: ["dashboard", "rentals", "customers", "calendar"], accountant: ["dashboard", "expenses"] };
var WRITES: any = { vehicles: ["admin", "manager"], rentals: ["admin", "manager", "sale"], customers: ["admin", "manager", "sale"], expenses: ["admin", "manager", "accountant"] };
var RL: any = { admin: "Quản trị", manager: "Quản lý", sale: "Kinh doanh", accountant: "Kế toán" };
var PS = 10;
var fm = function(n: any) { return n ? n.toLocaleString("vi-VN") : "0"; };
var fd = function(s: any) { try { return new Date(s).toLocaleDateString("vi-VN"); } catch (e) { return s; } };
var uid = function() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); };
var td = function() { return new Date().toISOString().split("T")[0]; };
var iD = function(d: number) { return new Date(Date.now() + d * 864e5).toISOString().split("T")[0]; };

var US = [
  { id: "u1", username: "admin", password: "admin123", role: "admin", name: "Admin", phone: "0901234567" },
  { id: "u2", username: "sale1", password: "sale123", role: "sale", name: "Sale 1", phone: "0912345678" },
  { id: "u3", username: "manager", password: "manager123", role: "manager", name: "Manager", phone: "0934567890" },
  { id: "u4", username: "accountant", password: "acc123", role: "accountant", name: "Kế toán", phone: "0945678901" },
];

function Toast(p: any) {
  if (!p.t) return null;
  var err = p.t.type === "error";
  return (<div className={"fixed top-4 right-4 z-[60] px-5 py-3 rounded-xl shadow-xl text-white text-sm font-medium flex items-center gap-2 " + (err ? "bg-red-500" : "bg-green-500")}>{err ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}{p.t.msg}</div>);
}
function Spinner() {
  return (<div className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center"><div className="bg-white px-6 py-4 rounded-xl shadow-xl flex items-center gap-3"><div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />Đang xử lý...</div></div>);
}
function Md(p: any) {
  return (<div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-3" onClick={p.onClose}><div className={"bg-white rounded-2xl w-full max-h-[92vh] overflow-y-auto p-5 sm:p-6 " + (p.wide ? "max-w-4xl" : "max-w-lg")} onClick={function(e: any) { e.stopPropagation(); }}><div className="flex justify-between items-center mb-4"><h2 className="text-lg font-bold truncate pr-4">{p.title}</h2><button onClick={p.onClose} className="text-gray-400 hover:text-gray-600 shrink-0"><X className="w-5 h-5" /></button></div>{p.children}</div></div>);
}
function FI(p: any) {
  var c = "w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 " + (p.error ? "border-red-400" : "border-gray-300");
  return (<div className={p.className || ""}>{p.label && <label className="block text-sm font-medium text-gray-700 mb-1">{p.label}</label>}{p.textarea ? <textarea value={p.value || ""} onChange={function(e: any) { p.onChange(e.target.value); }} placeholder={p.placeholder} className={c} rows={2} /> : <input type={p.type || "text"} value={p.value || ""} onChange={function(e: any) { p.onChange(e.target.value); }} placeholder={p.placeholder} className={c} />}{p.error && <p className="text-red-500 text-xs mt-1">{p.error}</p>}</div>);
}
function SI(p: any) {
  return (<div className={p.className || ""}>{p.label && <label className="block text-sm font-medium text-gray-700 mb-1">{p.label}</label>}<select value={p.value || ""} onChange={function(e: any) { p.onChange(e.target.value); }} className={"w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 " + (p.error ? "border-red-400" : "border-gray-300")}><option value="">{p.placeholder || "-- Chọn --"}</option>{p.options.map(function(o: any) { return (<option key={o.value} value={o.value}>{o.label}</option>); })}</select>{p.error && <p className="text-red-500 text-xs mt-1">{p.error}</p>}</div>);
}
function Rw(p: any) { return (<div className="flex justify-between py-0.5"><span className="text-gray-500 text-sm">{p.l}</span><span className={"text-sm font-medium " + (p.rc || "")}>{p.r}</span></div>); }
function Bg(p: any) { var c: any = { green: "bg-green-100 text-green-700", orange: "bg-orange-100 text-orange-700", red: "bg-red-100 text-red-700", blue: "bg-blue-100 text-blue-700", gray: "bg-gray-100 text-gray-700" }; return (<span className={"px-2 py-0.5 rounded-full text-xs font-semibold " + (c[p.color] || c.gray)}>{p.children}</span>); }
function SC(p: any) { var c: any = { blue: "bg-blue-100 text-blue-600", green: "bg-green-100 text-green-600", orange: "bg-orange-100 text-orange-600", purple: "bg-purple-100 text-purple-600" }; return (<div className="bg-white rounded-xl shadow-sm border p-4"><div className="flex items-center justify-between"><div><p className="text-gray-500 text-xs sm:text-sm">{p.t}</p><p className="text-xl sm:text-2xl font-bold mt-1">{p.v}</p>{p.s && <p className="text-xs text-gray-400 mt-0.5">{p.s}</p>}</div><div className={"p-2.5 rounded-xl " + (c[p.c] || "")}>{p.icon}</div></div></div>); }
function Pg(p: any) { var pages = Math.ceil(p.total / PS); if (pages <= 1) return null; return (<div className="flex items-center justify-center gap-2 mt-4"><button disabled={p.page <= 1} onClick={function() { p.onChange(p.page - 1); }} className="px-3 py-1.5 rounded-lg border text-sm disabled:opacity-40 hover:bg-gray-50">‹</button><span className="text-sm text-gray-600">{p.page}/{pages}</span><button disabled={p.page >= pages} onClick={function() { p.onChange(p.page + 1); }} className="px-3 py-1.5 rounded-lg border text-sm disabled:opacity-40 hover:bg-gray-50">›</button></div>); }
function CM(p: any) { return (<Md onClose={p.onCancel} title="Xác nhận"><p className="text-sm text-gray-600 mb-4">{p.msg}</p><div className="flex gap-2"><button onClick={p.onConfirm} className="flex-1 bg-red-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-red-700">Xác nhận</button><button onClick={p.onCancel} className="flex-1 bg-gray-200 py-2 rounded-lg text-sm">Hủy</button></div></Md>); }

export default function App() {
  var [isAuth, setIsAuth] = useState(false);
  var [user, setUser] = useState<any>(null);
  var [lf, setLf] = useState({ u: "", p: "" });
  var [le, setLe] = useState("");
  var [tab, setTab] = useState("dashboard");
  var [month, setMonth] = useState(new Date());
  var [toast, setToast] = useState<any>(null);
  var [loading, setLoading] = useState(false);
  var [vehicles, setVehicles] = useState<any[]>([]);
  var [customers, setCustomers] = useState<any[]>([]);
  var [rentals, setRentals] = useState<any[]>([]);
  var [expenses, setExpenses] = useState<any[]>([]);
  var [dataLoaded, setDataLoaded] = useState(false);

  var loadAll = useCallback(function() {
    setLoading(true);
    dbLoad("vehicles", function(d: any) { setVehicles(d); }, "created_at");
    dbLoad("customers", function(d: any) { setCustomers(d); }, "created_at");
    dbLoad("rentals", function(d: any) { setRentals(d); }, "created_at");
    dbLoad("expenses", function(d: any) { setExpenses(d); setLoading(false); setDataLoaded(true); }, "created_at");
  }, []);

  if (isAuth && !dataLoaded) { loadAll(); }

  var notify = useCallback(function(m: string, t?: string) { setToast({ msg: m, type: t || "success" }); setTimeout(function() { setToast(null); }, 3000); }, []);
  var hasPerm = useCallback(function(p: string) { return user && (PERMS[user.role] || []).indexOf(p) >= 0; }, [user]);
  var canWrite = useCallback(function(p: string) { return user && (WRITES[p] || []).indexOf(user.role) >= 0; }, [user]);
  var vMap = useMemo(function() { var m: any = {}; vehicles.forEach(function(v) { m[v.id] = v; }); return m; }, [vehicles]);
  var cMap = useMemo(function() { var m: any = {}; customers.forEach(function(c) { m[c.id] = c; }); return m; }, [customers]);
  var vN = useCallback(function(id: string) { return (vMap[id] || {}).name || ""; }, [vMap]);
  var vP = useCallback(function(id: string) { return (vMap[id] || {}).plate || ""; }, [vMap]);
  var cN = useCallback(function(id: string) { return (cMap[id] || {}).name || ""; }, [cMap]);
  var cPh = useCallback(function(id: string) { return (cMap[id] || {}).phone || ""; }, [cMap]);
  var chkOvl = useCallback(function(vid: string, sd: string, ed: string, ex?: string) { return rentals.some(function(r) { return r.vehicle_id === vid && r.status === "active" && r.id !== ex && r.start_date <= ed && r.end_date >= sd; }); }, [rentals]);
  var getVS = useCallback(function(vid: string, date: string) { var r = rentals.find(function(r: any) { return r.vehicle_id === vid && r.status === "active" && r.start_date <= date && r.end_date >= date; }); if (!r) return { status: "available", time: null, rental: null }; return { status: "rented", time: date === r.end_date ? r.end_time : null, rental: r }; }, [rentals]);

  var handleLogin = function() {
    if (!lf.u || !lf.p) { setLe("Vui lòng nhập đầy đủ"); return; }
    var pw: any = { admin: "admin123", sale1: "sale123", manager: "manager123", accountant: "acc123" };
    var u = US.find(function(x) { return x.username === lf.u; });
    if (!u || pw[lf.u] !== lf.p) { setLe("Sai tên đăng nhập hoặc mật khẩu"); return; }
    setUser(u); setIsAuth(true); setLe("");
  };

  if (!isAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-md">
          <div className="text-center mb-6"><Car className="w-14 h-14 text-blue-600 mx-auto mb-3" /><h1 className="text-2xl font-bold">AutoRent Pro</h1><p className="text-gray-500 text-sm mt-1">Hệ thống quản lý cho thuê xe</p></div>
          <div className="space-y-3">
            <FI label="Tên đăng nhập" value={lf.u} onChange={function(v: string) { setLf({ u: v, p: lf.p }); }} />
            <FI label="Mật khẩu" type="password" value={lf.p} onChange={function(v: string) { setLf({ u: lf.u, p: v }); }} />
            {le && <p className="text-red-500 text-sm text-center">{le}</p>}
            <button onClick={handleLogin} className="w-full bg-blue-600 text-white py-2.5 rounded-xl hover:bg-blue-700 font-semibold text-sm">Đăng nhập</button>
          </div>
          <div className="mt-5 p-3 bg-gray-50 rounded-xl text-xs text-gray-500 space-y-0.5"><p className="font-semibold text-gray-600 mb-1">Demo:</p><p>admin / admin123</p><p>sale1 / sale123</p><p>manager / manager123</p><p>accountant / acc123</p></div>
        </div>
      </div>
    );
  }

  var tabs = [
    { k: "dashboard", I: TrendingUp, l: "Tổng quan" },
    { k: "vehicles", I: Car, l: "Xe" },
    { k: "rentals", I: Calendar, l: "Hợp đồng" },
    { k: "customers", I: Users, l: "Khách hàng" },
    { k: "expenses", I: CreditCard, l: "Chi phí" },
    { k: "calendar", I: Clock, l: "Lịch" },
  ].filter(function(t) { return hasPerm(t.k); });

  return (
    <div className="min-h-screen bg-gray-50">
      <Toast t={toast} />{loading && <Spinner />}
      <header className="bg-white shadow-sm sticky top-0 z-30"><div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2 min-w-0"><Car className="w-7 h-7 text-blue-600 shrink-0" /><div className="min-w-0"><h1 className="text-lg font-bold truncate">AutoRent Pro</h1><p className="text-xs text-gray-500 truncate">{user.name} <Bg color="blue">{RL[user.role]}</Bg></p></div></div>
        <button onClick={function() { setIsAuth(false); setUser(null); setDataLoaded(false); }} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 text-sm shrink-0"><LogOut className="w-4 h-4" /><span className="hidden sm:inline">Thoát</span></button>
      </div></header>

      <nav className="bg-white border-b sticky top-[52px] z-20">
        <div className="max-w-7xl mx-auto px-1 sm:px-6">
          <div className="flex overflow-x-auto py-1" style={{ gap: "2px" }}>
            {tabs.map(function(t) {
              var Icon = t.I;
              var a = tab === t.k;
              return (
                <button key={t.k} onClick={function() { setTab(t.k); }} className={"flex flex-col items-center px-2 py-1.5 rounded-lg whitespace-nowrap transition min-w-0 sm:flex-row sm:gap-2 sm:px-4 sm:py-3 " + (a ? "bg-blue-50 text-blue-600 font-semibold" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50")}>
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                  <span style={{ fontSize: "10px", lineHeight: "1.2", marginTop: "2px" }} className="sm:hidden">{t.l}</span>
                  <span style={{ fontSize: "15px" }} className="hidden sm:inline">{t.l}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
        {tab === "dashboard" && <DashTab vehicles={vehicles} rentals={rentals} expenses={expenses} customers={customers} cN={cN} vMap={vMap} />}
        {tab === "vehicles" && <VehTab vehicles={vehicles} setVehicles={setVehicles} getVS={getVS} month={month} notify={notify} cw={canWrite("vehicles")} />}
        {tab === "rentals" && <RenTab vehicles={vehicles} setVehicles={setVehicles} customers={customers} rentals={rentals} setRentals={setRentals} chkOvl={chkOvl} notify={notify} setLoading={setLoading} cN={cN} cPh={cPh} vN={vN} vP={vP} vMap={vMap} cw={canWrite("rentals")} />}
        {tab === "customers" && <CusTab customers={customers} setCustomers={setCustomers} rentals={rentals} vN={vN} notify={notify} cw={canWrite("customers")} />}
        {tab === "expenses" && <ExpTab vehicles={vehicles} expenses={expenses} setExpenses={setExpenses} notify={notify} cw={canWrite("expenses")} vMap={vMap} />}
        {tab === "calendar" && <CalTab vehicles={vehicles} getVS={getVS} cN={cN} month={month} setMonth={setMonth} />}
      </main>
    </div>
  );
}

function DashTab(p: any) {
  var [dateFrom, setDateFrom] = useState("");
  var [dateTo, setDateTo] = useState("");
  var [selVeh, setSelVeh] = useState<any>(null);

  var filteredRentals = useMemo(function() {
    return p.rentals.filter(function(r: any) {
      if (r.status === "cancelled") return false;
      if (dateFrom && r.start_date < dateFrom) return false;
      if (dateTo && r.start_date > dateTo) return false;
      return true;
    });
  }, [p.rentals, dateFrom, dateTo]);

  var filteredExpenses = useMemo(function() {
    return p.expenses.filter(function(e: any) {
      if (dateFrom && e.date < dateFrom) return false;
      if (dateTo && e.date > dateTo) return false;
      return true;
    });
  }, [p.expenses, dateFrom, dateTo]);

  var vehRevenue = useMemo(function() {
    var m: any = {};
    p.vehicles.forEach(function(v: any) { m[v.id] = { revenue: 0, expense: 0, trips: 0, surcharge: 0 }; });
    filteredRentals.forEach(function(r: any) {
      if (m[r.vehicle_id]) { m[r.vehicle_id].revenue += r.total; m[r.vehicle_id].surcharge += (r.surcharge || 0); m[r.vehicle_id].trips += 1; }
    });
    filteredExpenses.forEach(function(e: any) {
      if (m[e.vehicle_id]) { m[e.vehicle_id].expense += e.amount; }
    });
    return m;
  }, [p.vehicles, filteredRentals, filteredExpenses]);

  var totalRev = 0; var totalExp = 0; var totalTrips = 0;
  Object.keys(vehRevenue).forEach(function(k) { totalRev += vehRevenue[k].revenue + vehRevenue[k].surcharge; totalExp += vehRevenue[k].expense; totalTrips += vehRevenue[k].trips; });
  var profit = totalRev - totalExp;

  var expiring = p.rentals.filter(function(r: any) { var t = td(); var i3 = iD(3); return r.status === "active" && r.end_date >= t && r.end_date <= i3; }).sort(function(a: any, b: any) { return a.end_date.localeCompare(b.end_date); });

  var detailRentals = selVeh ? filteredRentals.filter(function(r: any) { return r.vehicle_id === selVeh.id; }) : [];
  var detailExpenses = selVeh ? filteredExpenses.filter(function(r: any) { return r.vehicle_id === selVeh.id; }) : [];
  var filterLabel = (!dateFrom && !dateTo) ? "Toàn bộ" : (dateFrom || "...") + " → " + (dateTo || "...");

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-xl shadow-sm border p-4">
        <div className="flex flex-wrap items-center gap-3">
          <Filter className="w-4 h-4 text-gray-400" /><span className="text-sm text-gray-600 font-medium">Lọc:</span>
          <input type="date" value={dateFrom} onChange={function(e: any) { setDateFrom(e.target.value); }} className="px-3 py-1.5 border rounded-lg text-sm" />
          <span className="text-gray-400">→</span>
          <input type="date" value={dateTo} onChange={function(e: any) { setDateTo(e.target.value); }} className="px-3 py-1.5 border rounded-lg text-sm" />
          {(dateFrom || dateTo) && (<button onClick={function() { setDateFrom(""); setDateTo(""); }} className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"><X className="w-3 h-3" />Xóa lọc</button>)}
          <span className="text-xs text-gray-400 ml-auto">{filterLabel}</span>
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <SC icon={<DollarSign className="w-5 h-5" />} t="Tổng doanh thu" v={fm(totalRev) + "đ"} c="purple" />
        <SC icon={<CreditCard className="w-5 h-5" />} t="Tổng chi phí" v={fm(totalExp) + "đ"} c="orange" />
        <SC icon={<TrendingUp className="w-5 h-5" />} t="Lợi nhuận" v={fm(profit) + "đ"} c={profit >= 0 ? "green" : "orange"} s={profit >= 0 ? "Có lãi" : "Đang lỗ"} />
        <SC icon={<Car className="w-5 h-5" />} t="Số chuyến" v={totalTrips} c="blue" s={p.vehicles.length + " xe"} />
      </div>
      <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-5">
        <h3 className="font-semibold mb-4 flex items-center gap-2 text-sm"><BarChart3 className="w-4 h-4 text-purple-500" />Doanh thu từng xe</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {p.vehicles.map(function(v: any) {
            var data = vehRevenue[v.id] || { revenue: 0, expense: 0, trips: 0, surcharge: 0 };
            var rev = data.revenue + data.surcharge;
            var net = rev - data.expense;
            var isSelected = selVeh && selVeh.id === v.id;
            return (
              <div key={v.id} onClick={function() { setSelVeh(isSelected ? null : v); }} className={"rounded-xl border p-4 cursor-pointer transition hover:shadow-md " + (isSelected ? "border-blue-500 bg-blue-50 shadow-md" : "border-gray-200 bg-white hover:border-gray-300")}>
                <div className="flex items-center gap-2 mb-3"><span className="text-2xl">{v.image}</span><div className="min-w-0"><p className="font-semibold text-sm truncate">{v.name}</p><p className="text-xs text-gray-500">{v.plate}</p></div></div>
                <div className="space-y-1"><Rw l="Doanh thu" r={fm(rev) + "đ"} rc="text-green-600" /><Rw l="Chi phí" r={"-" + fm(data.expense) + "đ"} rc="text-red-500" /><div className="border-t pt-1 mt-1"><Rw l="Lợi nhuận" r={fm(net) + "đ"} rc={net >= 0 ? "text-green-700 font-bold" : "text-red-600 font-bold"} /></div><Rw l="Số chuyến" r={data.trips} /></div>
              </div>
            );
          })}
        </div>
      </div>
      {selVeh && (
        <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-5">
          <div className="flex items-center justify-between mb-4"><h3 className="font-semibold text-sm flex items-center gap-2"><span className="text-2xl">{selVeh.image}</span>Chi tiết: {selVeh.name}</h3><button onClick={function() { setSelVeh(null); }} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button></div>
          <p className="text-xs text-gray-500 font-medium mb-2 uppercase">Hợp đồng ({detailRentals.length})</p>
          {detailRentals.length === 0 ? (<p className="text-gray-400 text-sm py-4 text-center">Không có HĐ</p>) : (
            <div className="overflow-x-auto mb-4"><table className="w-full text-sm"><thead className="bg-gray-50 text-xs text-gray-500"><tr><th className="px-3 py-2 text-left">Khách</th><th className="px-3 py-2 text-left">Ngày thuê</th><th className="px-3 py-2 text-right">Tổng tiền</th><th className="px-3 py-2 text-left">TT</th></tr></thead><tbody className="divide-y">{detailRentals.map(function(r: any) { var stC = r.status === "active" ? "orange" : r.status === "completed" ? "green" : "red"; var stT = r.status === "active" ? "Thuê" : r.status === "completed" ? "Xong" : "Hủy"; return (<tr key={r.id} className="hover:bg-gray-50"><td className="px-3 py-2">{p.cN(r.customer_id)}</td><td className="px-3 py-2">{fd(r.start_date)} → {fd(r.end_date)}</td><td className="px-3 py-2 text-right font-medium text-green-600">{fm(r.total)}đ</td><td className="px-3 py-2"><Bg color={stC}>{stT}</Bg></td></tr>); })}</tbody></table></div>
          )}
          <p className="text-xs text-gray-500 font-medium mb-2 uppercase">Chi phí ({detailExpenses.length})</p>
          {detailExpenses.length === 0 ? (<p className="text-gray-400 text-sm py-4 text-center">Không có chi phí</p>) : (
            <div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-gray-50 text-xs text-gray-500"><tr><th className="px-3 py-2 text-left">Ngày</th><th className="px-3 py-2 text-left">Loại</th><th className="px-3 py-2 text-right">Tiền</th></tr></thead><tbody className="divide-y">{detailExpenses.map(function(e: any) { return (<tr key={e.id} className="hover:bg-gray-50"><td className="px-3 py-2">{fd(e.date)}</td><td className="px-3 py-2"><Bg>{EXP_L[e.type] || e.type}</Bg></td><td className="px-3 py-2 text-right text-red-500">-{fm(e.amount)}đ</td></tr>); })}</tbody></table></div>
          )}
        </div>
      )}
      <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-5">
        <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm"><Clock className="w-4 h-4 text-orange-500" />HĐ sắp hết hạn (3 ngày)</h3>
        {expiring.length === 0 ? (<p className="text-gray-400 text-center py-6 text-sm">Không có</p>) : (
          <div className="space-y-2">{expiring.map(function(r: any) { var v = p.vMap[r.vehicle_id]; var dd = Math.ceil((new Date(r.end_date).getTime() - new Date().getTime()) / 864e5); return (<div key={r.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-xl border border-orange-100"><div className="flex items-center gap-3 min-w-0"><span className="text-3xl shrink-0">{v ? v.image : "🚗"}</span><div className="min-w-0"><p className="font-semibold text-sm truncate">{p.cN(r.customer_id)}</p><p className="text-xs text-gray-500 truncate">{v ? v.name : ""}</p><p className="text-xs text-gray-400">Trả: <span className="text-orange-600 font-medium">{fd(r.end_date)}</span></p></div></div><Bg color={dd <= 0 ? "red" : "orange"}>{dd <= 0 ? "Hôm nay" : dd === 1 ? "Ngày mai" : dd + " ngày"}</Bg></div>); })}</div>
        )}
      </div>
    </div>
  );
}

function MiniCalVeh(p: any) {
  var now = new Date(); var yr = now.getFullYear(); var mo = now.getMonth(); var dim = new Date(yr, mo + 1, 0).getDate();
  var sd = new Date(yr, mo, 1).getDay(); var dn = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
  var empties: number[] = []; for (var i = 0; i < sd; i++) empties.push(i);
  var days: number[] = []; for (var dd = 1; dd <= dim; dd++) days.push(dd);
  var t = td();
  return (
    <div className="grid grid-cols-7 gap-1">
      {dn.map(function(d) { return (<div key={d} className="text-center text-xs font-semibold text-gray-400 py-0.5">{d}</div>); })}
      {empties.map(function(i) { return (<div key={"e" + i} />); })}
      {days.map(function(dt) { var ds = yr + "-" + String(mo + 1).padStart(2, "0") + "-" + String(dt).padStart(2, "0"); var vs = p.getVS(p.vehicleId, ds); var isT = ds === t; var clr = vs.status === "available" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"; return (<div key={dt} className={"text-center py-1.5 rounded text-xs font-semibold " + (isT ? "ring-2 ring-blue-500 " : "") + clr}>{dt}</div>); })}
    </div>
  );
}

function VehTab(p: any) {
  var [showAdd, setShowAdd] = useState(false); var [editing, setEditing] = useState<any>(null); var [search, setSearch] = useState(""); var [fSt, setFSt] = useState("all"); var [selV, setSelV] = useState<any>(null); var [delV, setDelV] = useState<any>(null);
  var ef = { name: "", plate: "", odo: "0", price_day: "", price_week: "", price_month: "", type: "Sedan", seats: "5", transmission: "Tự động" };
  var [f, setF] = useState<any>(Object.assign({}, ef)); var [errors, setErrors] = useState<any>({});

  var add = function() {
    var e: any = {}; if (!f.name.trim()) e.name = "Bắt buộc"; if (!f.plate) e.plate = "Bắt buộc";
    else if (!/^\d{2}[A-Z]-\d{4,5}$/.test(f.plate.toUpperCase())) e.plate = "Sai (VD: 30A-12345)";
    else if (p.vehicles.some(function(v: any) { return v.plate === f.plate.toUpperCase(); })) e.plate = "Đã tồn tại";
    if (!f.price_day || parseInt(f.price_day) <= 0) e.price_day = "Phải > 0";
    setErrors(e); if (Object.keys(e).length) return;
    var pd = parseInt(f.price_day);
    var row = { name: f.name.trim(), plate: f.plate.toUpperCase(), image: "🚗", price_day: pd, price_week: parseInt(f.price_week) || pd * 6, price_month: parseInt(f.price_month) || pd * 25, odo: Math.max(0, parseInt(f.odo) || 0), type: f.type, seats: parseInt(f.seats) || 5, transmission: f.transmission, fuel: "Xăng", status: "available" };
    dbInsert("vehicles", row, function(nv: any) {
      if (nv) { p.setVehicles(function(prev: any) { return prev.concat([nv]); }); setF(Object.assign({}, ef)); setShowAdd(false); setErrors({}); p.notify("Thêm xe thành công!"); }
    });
  };
  var saveEdit = function() {
    if (!editing.name.trim()) { p.notify("Tên xe bắt buộc", "error"); return; }
    var old = p.vehicles.find(function(v: any) { return v.id === editing.id; });
    if (parseInt(editing.odo) < old.odo) { p.notify("ODO không thể giảm!", "error"); return; }
    var data = { name: editing.name, odo: parseInt(editing.odo), price_day: parseInt(editing.price_day), price_week: parseInt(editing.price_week), price_month: parseInt(editing.price_month) };
    dbUpdate("vehicles", editing.id, data, function(uv: any) {
      if (uv) { p.setVehicles(function(prev: any) { return prev.map(function(v: any) { return v.id === editing.id ? Object.assign({}, v, uv) : v; }); }); setEditing(null); p.notify("Cập nhật thành công!"); }
    });
  };
  var doDelete = function() {
    var v = delV; if (v.status === "rented") { p.notify("Không thể xóa xe đang thuê!", "error"); setDelV(null); return; }
    dbDelete("vehicles", v.id, function(ok: boolean) { if (ok) { p.setVehicles(function(prev: any) { return prev.filter(function(x: any) { return x.id !== v.id; }); }); p.notify("Đã xóa xe " + v.name); } setDelV(null); });
  };
  var filtered = p.vehicles.filter(function(v: any) { if (fSt !== "all" && v.status !== fSt) return false; if (!search) return true; var s = search.toLowerCase(); return v.name.toLowerCase().indexOf(s) >= 0 || v.plate.toLowerCase().indexOf(s) >= 0; });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-between items-center gap-2">
        <h2 className="text-xl font-bold">Xe ({p.vehicles.length})</h2>
        <div className="flex gap-2 items-center flex-wrap">
          <div className="relative"><Search className="w-4 h-4 absolute left-2.5 top-2.5 text-gray-400" /><input value={search} onChange={function(e: any) { setSearch(e.target.value); }} placeholder="Tìm xe..." className="pl-8 pr-3 py-2 border rounded-lg text-sm w-40" /></div>
          <select value={fSt} onChange={function(e: any) { setFSt(e.target.value); }} className="px-3 py-2 border rounded-lg text-sm"><option value="all">Tất cả</option><option value="available">Sẵn sàng</option><option value="rented">Đang thuê</option></select>
          {p.cw && <button onClick={function() { setShowAdd(true); }} className="bg-blue-600 text-white px-3 py-2 rounded-lg flex items-center gap-1.5 hover:bg-blue-700 text-sm"><Plus className="w-4 h-4" />Thêm xe</button>}
        </div>
      </div>
      {showAdd && (<div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h3 className="font-semibold mb-3 text-sm">Thêm xe mới</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <FI label="Tên xe *" value={f.name} onChange={function(v: string) { setF(Object.assign({}, f, { name: v })); }} error={errors.name} />
          <FI label="Biển số *" value={f.plate} onChange={function(v: string) { setF(Object.assign({}, f, { plate: v.toUpperCase() })); }} error={errors.plate} placeholder="30A-12345" />
          <FI label="Giá/ngày *" type="number" value={f.price_day} onChange={function(v: string) { setF(Object.assign({}, f, { price_day: v })); }} error={errors.price_day} />
          <FI label="Giá/tuần" type="number" value={f.price_week} onChange={function(v: string) { setF(Object.assign({}, f, { price_week: v })); }} placeholder="Tự tính" />
          <FI label="Giá/tháng" type="number" value={f.price_month} onChange={function(v: string) { setF(Object.assign({}, f, { price_month: v })); }} placeholder="Tự tính" />
          <FI label="ODO (km)" type="number" value={f.odo} onChange={function(v: string) { setF(Object.assign({}, f, { odo: v })); }} />
        </div>
        <div className="flex gap-2 mt-3"><button onClick={add} className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 flex items-center gap-1.5"><Save className="w-4 h-4" />Lưu</button><button onClick={function() { setShowAdd(false); setErrors({}); }} className="bg-gray-200 px-4 py-2 rounded-lg text-sm">Hủy</button></div>
      </div>)}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {filtered.map(function(v: any) {
          var isE = editing && editing.id === v.id;
          if (isE) { return (<div key={v.id} className="bg-white rounded-xl shadow-sm border p-4"><div className="space-y-2"><FI label="Tên xe" value={editing.name} onChange={function(val: string) { setEditing(Object.assign({}, editing, { name: val })); }} /><FI label={"ODO ≥ " + fm(v.odo)} type="number" value={String(editing.odo)} onChange={function(val: string) { setEditing(Object.assign({}, editing, { odo: val })); }} /><FI label="Giá/ngày" type="number" value={String(editing.price_day)} onChange={function(val: string) { setEditing(Object.assign({}, editing, { price_day: val })); }} /><div className="flex gap-2 pt-1"><button onClick={saveEdit} className="flex-1 bg-green-600 text-white py-1.5 rounded-lg text-sm">Lưu</button><button onClick={function() { setEditing(null); }} className="flex-1 bg-gray-200 py-1.5 rounded-lg text-sm">Hủy</button></div></div></div>); }
          var sc = v.status === "available" ? "green" : v.status === "rented" ? "orange" : "red";
          var st = v.status === "available" ? "Sẵn sàng" : v.status === "rented" ? "Đang thuê" : "Bảo trì";
          return (
            <div key={v.id} className="bg-white rounded-xl shadow-sm border p-4 hover:shadow-md transition">
              <div className="flex justify-between items-start mb-3"><div className="flex items-center gap-2 min-w-0"><span className="text-3xl">{v.image}</span><div className="min-w-0"><h3 className="font-semibold text-sm truncate">{v.name}</h3><p className="text-gray-500 text-xs">{v.plate}</p></div></div><Bg color={sc}>{st}</Bg></div>
              <div className="space-y-1 text-sm mb-3 pb-3 border-b"><Rw l="ODO" r={fm(v.odo) + " km"} /><Rw l="Ngày" r={fm(v.price_day) + "đ"} rc="text-blue-600" /><Rw l="Tuần" r={fm(v.price_week) + "đ"} rc="text-green-600" /><Rw l="Tháng" r={fm(v.price_month) + "đ"} rc="text-purple-600" /></div>
              <div className="flex gap-2">
                {p.cw && <button onClick={function() { setEditing(Object.assign({}, v)); }} className="flex-1 bg-blue-50 text-blue-600 py-1.5 rounded-lg text-xs hover:bg-blue-100 flex items-center justify-center gap-1"><Edit2 className="w-3.5 h-3.5" />Sửa</button>}
                <button onClick={function() { setSelV(v); }} className="flex-1 bg-green-50 text-green-600 py-1.5 rounded-lg text-xs hover:bg-green-100 flex items-center justify-center gap-1"><Calendar className="w-3.5 h-3.5" />Lịch</button>
                {p.cw && <button onClick={function() { setDelV(v); }} className="flex-1 bg-red-50 text-red-500 py-1.5 rounded-lg text-xs hover:bg-red-100 flex items-center justify-center gap-1"><Trash2 className="w-3.5 h-3.5" />Xóa</button>}
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && <div className="col-span-full text-center py-10 text-gray-400 text-sm">Không tìm thấy</div>}
      </div>
      {selV && (<Md onClose={function() { setSelV(null); }} title={selV.name + " — " + selV.plate} wide>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-4">{[["Loại", selV.type], ["Chỗ", selV.seats], ["Hộp số", selV.transmission], ["NL", selV.fuel], ["ODO", fm(selV.odo) + "km"], ["Giá/ngày", fm(selV.price_day) + "đ"]].map(function(item) { return (<div key={item[0]} className="bg-gray-50 rounded-lg p-2"><p className="text-xs text-gray-400">{item[0]}</p><p className="text-sm font-semibold">{item[1]}</p></div>); })}</div>
        <div className="bg-blue-50 p-3 rounded-xl"><h4 className="font-semibold text-sm mb-2">Lịch tháng hiện tại</h4><MiniCalVeh vehicleId={selV.id} getVS={p.getVS} /></div>
      </Md>)}
      {delV && <CM msg={"Xóa xe " + delV.name + " (" + delV.plate + ")? Không thể hoàn tác."} onConfirm={doDelete} onCancel={function() { setDelV(null); }} />}
    </div>
  );
}

function RenTab(p: any) {
  var [showAdd, setShowAdd] = useState(false); var [retM, setRetM] = useState<any>(null); var [canM, setCanM] = useState<any>(null);
  var [search, setSearch] = useState(""); var [filter, setFilter] = useState("all"); var [page, setPage] = useState(1);
  var ef = { customer_id: "", vehicle_id: "", start_date: "", start_time: "09:00", end_date: "", end_time: "18:00", rental_type: "day", custom_price: "", deposit: "", pickup_location: "", notes: "", odo_start: "" };
  var [f, setF] = useState<any>(Object.assign({}, ef)); var [rf, setRf] = useState<any>({ odo_end: "", surcharge: "0", surcharge_note: "" }); var [errors, setErrors] = useState<any>({});

  var calcP = function() { if (!f.vehicle_id || !f.start_date || !f.end_date) return 0; var v = p.vMap[f.vehicle_id]; if (!v) return 0; var days = Math.ceil((new Date(f.end_date).getTime() - new Date(f.start_date).getTime()) / 864e5); if (days <= 0) return 0; if (f.rental_type === "day") return days * v.price_day; if (f.rental_type === "week") return Math.ceil(days / 7) * v.price_week; return Math.ceil(days / 30) * v.price_month; };

  var create = function() {
    var e: any = {}; var t = td();
    if (!f.customer_id) e.customer_id = "Chọn KH"; if (!f.vehicle_id) e.vehicle_id = "Chọn xe";
    if (!f.start_date) e.start_date = "Chọn ngày"; else if (f.start_date < t) e.start_date = "Không chọn quá khứ";
    if (!f.end_date) e.end_date = "Chọn ngày"; else if (f.start_date && f.end_date <= f.start_date) e.end_date = "Phải sau ngày nhận";
    if (!f.odo_start) e.odo_start = "Nhập ODO";
    if (f.vehicle_id && f.start_date && f.end_date && !e.end_date && p.chkOvl(f.vehicle_id, f.start_date, f.end_date)) e.vehicle_id = "Xe đã có lịch thuê trùng!";
    var v = p.vMap[f.vehicle_id]; if (v && f.odo_start && parseInt(f.odo_start) < v.odo) e.odo_start = "Phải ≥ " + fm(v.odo);
    setErrors(e); if (Object.keys(e).length) return;
    var days = Math.ceil((new Date(f.end_date).getTime() - new Date(f.start_date).getTime()) / 864e5); var bp = calcP(); var fp = parseInt(f.custom_price) || bp; var dep = Math.min(parseInt(f.deposit) || 0, fp);
    var nr = { customer_id: f.customer_id, vehicle_id: v.id, start_date: f.start_date, start_time: f.start_time, end_date: f.end_date, end_time: f.end_time, rental_type: f.rental_type, total_days: days, base_price: bp, total: fp, deposit: dep, paid: dep, surcharge: 0, surcharge_note: "", status: "active", pickup_location: f.pickup_location || "Văn phòng", notes: f.notes, odo_start: parseInt(f.odo_start), odo_end: null, actual_return_date: null };
    dbInsert("rentals", nr, function(saved: any) {
      if (saved) { p.setRentals(function(prev: any) { return [saved].concat(prev); }); dbUpdate("vehicles", v.id, { status: "rented" }, function() { p.setVehicles(function(prev: any) { return prev.map(function(x: any) { return x.id === v.id ? Object.assign({}, x, { status: "rented" }) : x; }); }); }); setF(Object.assign({}, ef)); setShowAdd(false); setErrors({}); setPage(1); p.notify("Tạo HĐ thành công!"); }
    });
  };
  var doReturn = function() {
    var r = retM; if (!rf.odo_end || parseInt(rf.odo_end) < r.odo_start) { p.notify("ODO trả phải ≥ " + fm(r.odo_start) + "km", "error"); return; }
    p.setLoading(true); var sc = Math.max(0, parseInt(rf.surcharge) || 0);
    dbUpdate("rentals", r.id, { status: "completed", odo_end: parseInt(rf.odo_end), surcharge: sc, surcharge_note: rf.surcharge_note, actual_return_date: td(), paid: r.total + sc }, function(ur: any) {
      if (ur) { p.setRentals(function(prev: any) { return prev.map(function(x: any) { return x.id === r.id ? Object.assign({}, x, ur) : x; }); }); dbUpdate("vehicles", r.vehicle_id, { status: "available", odo: parseInt(rf.odo_end) }, function(uv: any) { if (uv) { p.setVehicles(function(prev: any) { return prev.map(function(x: any) { return x.id === r.vehicle_id ? Object.assign({}, x, uv) : x; }); }); } setRetM(null); setRf({ odo_end: "", surcharge: "0", surcharge_note: "" }); p.setLoading(false); p.notify("Trả xe thành công!"); }); } else { p.setLoading(false); }
    });
  };
  var doCancel = function() {
    dbUpdate("rentals", canM.id, { status: "cancelled" }, function(ur: any) {
      if (ur) { p.setRentals(function(prev: any) { return prev.map(function(x: any) { return x.id === canM.id ? Object.assign({}, x, { status: "cancelled" }) : x; }); }); dbUpdate("vehicles", canM.vehicle_id, { status: "available" }, function(uv: any) { if (uv) { p.setVehicles(function(prev: any) { return prev.map(function(x: any) { return x.id === canM.vehicle_id ? Object.assign({}, x, { status: "available" }) : x; }); }); } setCanM(null); p.notify("Đã hủy"); }); }
    });
  };
  var bp = calcP();
  var fl = p.rentals.filter(function(r: any) { if (filter !== "all" && r.status !== filter) return false; if (!search) return true; var s = search.toLowerCase(); return p.cN(r.customer_id).toLowerCase().indexOf(s) >= 0 || p.vN(r.vehicle_id).toLowerCase().indexOf(s) >= 0; }).sort(function(a: any, b: any) { return (b.start_date || "").localeCompare(a.start_date || ""); });
  var pg = fl.slice((page - 1) * PS, page * PS);
  var co = p.customers.map(function(c: any) { return { value: c.id, label: c.name + " — " + c.phone }; });
  var vo = p.vehicles.filter(function(v: any) { return v.status === "available"; }).map(function(v: any) { return { value: v.id, label: v.name + " — " + v.plate }; });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-between items-center gap-2">
        <h2 className="text-xl font-bold">Hợp đồng ({p.rentals.length})</h2>
        <div className="flex gap-2 items-center flex-wrap">
          <div className="relative"><Search className="w-4 h-4 absolute left-2.5 top-2.5 text-gray-400" /><input value={search} onChange={function(e: any) { setSearch(e.target.value); setPage(1); }} placeholder="Tìm..." className="pl-8 pr-3 py-2 border rounded-lg text-sm w-36" /></div>
          <select value={filter} onChange={function(e: any) { setFilter(e.target.value); setPage(1); }} className="px-3 py-2 border rounded-lg text-sm"><option value="all">Tất cả</option><option value="active">Đang thuê</option><option value="completed">Xong</option><option value="cancelled">Hủy</option></select>
          {p.cw && <button onClick={function() { setShowAdd(true); }} className="bg-green-600 text-white px-3 py-2 rounded-lg flex items-center gap-1.5 hover:bg-green-700 text-sm"><Plus className="w-4 h-4" />Tạo mới</button>}
        </div>
      </div>
      {showAdd && (<div className="bg-green-50 border border-green-200 rounded-xl p-4">
        <h3 className="font-semibold mb-3 text-sm">Tạo hợp đồng mới</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <SI label="Khách hàng *" value={f.customer_id} onChange={function(v: string) { setF(Object.assign({}, f, { customer_id: v })); }} options={co} error={errors.customer_id} />
          <SI label="Xe *" value={f.vehicle_id} onChange={function(v: string) { var vh = p.vMap[v]; setF(Object.assign({}, f, { vehicle_id: v, odo_start: vh ? String(vh.odo) : "" })); }} options={vo} error={errors.vehicle_id} />
          <FI label="Ngày nhận *" type="date" value={f.start_date} onChange={function(v: string) { setF(Object.assign({}, f, { start_date: v })); }} error={errors.start_date} />
          <FI label="Giờ nhận" type="time" value={f.start_time} onChange={function(v: string) { setF(Object.assign({}, f, { start_time: v })); }} />
          <FI label="Ngày trả *" type="date" value={f.end_date} onChange={function(v: string) { setF(Object.assign({}, f, { end_date: v })); }} error={errors.end_date} />
          <FI label="Giờ trả" type="time" value={f.end_time} onChange={function(v: string) { setF(Object.assign({}, f, { end_time: v })); }} />
          <SI label="Loại thuê" value={f.rental_type} onChange={function(v: string) { setF(Object.assign({}, f, { rental_type: v })); }} options={[{ value: "day", label: "Ngày" }, { value: "week", label: "Tuần" }, { value: "month", label: "Tháng" }]} />
          <FI label="ODO nhận *" type="number" value={f.odo_start} onChange={function(v: string) { setF(Object.assign({}, f, { odo_start: v })); }} error={errors.odo_start} />
          {bp > 0 && (<div className="sm:col-span-2 p-3 bg-white rounded-xl border"><p className="text-sm text-gray-600 mb-2">Giá gốc: <span className="font-bold text-blue-600">{fm(bp)}đ</span></p><FI label="Giá tùy chỉnh" type="number" value={f.custom_price} onChange={function(v: string) { setF(Object.assign({}, f, { custom_price: v })); }} placeholder={fm(bp)} /></div>)}
          <FI label="Tiền cọc" type="number" value={f.deposit} onChange={function(v: string) { setF(Object.assign({}, f, { deposit: v })); }} />
          <FI label="Địa điểm nhận" value={f.pickup_location} onChange={function(v: string) { setF(Object.assign({}, f, { pickup_location: v })); }} />
        </div>
        <div className="flex gap-2 mt-3"><button onClick={create} className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 flex items-center gap-1.5"><Save className="w-4 h-4" />Tạo</button><button onClick={function() { setShowAdd(false); setErrors({}); }} className="bg-gray-200 px-4 py-2 rounded-lg text-sm">Hủy</button></div>
      </div>)}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden"><div className="overflow-x-auto">
        <table className="w-full text-sm"><thead className="bg-gray-50 text-xs text-gray-500 uppercase"><tr><th className="px-3 py-2.5 text-left">Khách</th><th className="px-3 py-2.5 text-left">Xe</th><th className="px-3 py-2.5 text-left">Ngày</th><th className="px-3 py-2.5 text-right">Tiền</th><th className="px-3 py-2.5 text-left">TT</th><th className="px-3 py-2.5"></th></tr></thead>
        <tbody className="divide-y">{pg.map(function(r: any) {
          var v = p.vMap[r.vehicle_id]; var stC = r.status === "active" ? "orange" : r.status === "completed" ? "green" : "red"; var stT = r.status === "active" ? "Thuê" : r.status === "completed" ? "Xong" : "Hủy";
          return (<tr key={r.id} className="hover:bg-gray-50">
            <td className="px-3 py-2.5"><p className="font-medium">{p.cN(r.customer_id)}</p><p className="text-xs text-gray-400">{p.cPh(r.customer_id)}</p></td>
            <td className="px-3 py-2.5"><p>{v ? v.name : ""}</p><p className="text-xs text-gray-400">{v ? v.plate : ""}</p></td>
            <td className="px-3 py-2.5 whitespace-nowrap"><p>{fd(r.start_date)} <span className="text-gray-400">{r.start_time || ""}</span></p><p className="text-xs text-gray-400">→ {fd(r.end_date)} <span>{r.end_time || ""}</span></p></td>
            <td className="px-3 py-2.5 text-right font-semibold text-green-600">{fm(r.total)}đ{r.surcharge > 0 && <span className="text-orange-500 text-xs block">+{fm(r.surcharge)}</span>}</td>
            <td className="px-3 py-2.5"><Bg color={stC}>{stT}</Bg></td>
            <td className="px-3 py-2.5">{r.status === "active" && p.cw && (<div className="flex gap-1">
              <button onClick={function() { setRetM(r); setRf({ odo_end: String(r.odo_start), surcharge: "0", surcharge_note: "" }); }} className="bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700 flex items-center gap-1"><RotateCcw className="w-3 h-3" />Trả</button>
              <button onClick={function() { setCanM(r); }} className="bg-gray-200 text-gray-600 px-2 py-1 rounded text-xs">Hủy</button>
            </div>)}</td>
          </tr>);
        })}</tbody></table>
      </div>{pg.length === 0 && <p className="text-center py-8 text-gray-400 text-sm">Không có</p>}</div>
      <Pg page={page} total={fl.length} onChange={setPage} />
      {retM && (<Md onClose={function() { setRetM(null); }} title="Trả xe"><div className="space-y-3">
        <div className="p-3 bg-blue-50 rounded-xl text-sm space-y-1"><Rw l="Xe" r={p.vN(retM.vehicle_id)} /><Rw l="Khách" r={p.cN(retM.customer_id)} /><Rw l="ODO nhận" r={fm(retM.odo_start) + " km"} /><Rw l="Tổng" r={fm(retM.total) + "đ"} rc="text-green-600 font-bold" /></div>
        <FI label={"ODO trả ≥ " + fm(retM.odo_start)} type="number" value={rf.odo_end} onChange={function(v: string) { setRf(Object.assign({}, rf, { odo_end: v })); }} />
        <FI label="Phụ thu (đ)" type="number" value={rf.surcharge} onChange={function(v: string) { setRf(Object.assign({}, rf, { surcharge: v })); }} />
        {parseInt(rf.surcharge) > 0 && <FI label="Lý do" value={rf.surcharge_note} onChange={function(v: string) { setRf(Object.assign({}, rf, { surcharge_note: v })); }} />}
        <div className="p-3 bg-green-50 rounded-xl"><p className="text-sm">Tổng: <span className="text-xl font-bold text-green-600">{fm(retM.total + (parseInt(rf.surcharge) || 0))}đ</span></p></div>
        <div className="flex gap-2"><button onClick={doReturn} className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl font-medium hover:bg-blue-700 flex items-center justify-center gap-2"><CheckCircle className="w-4 h-4" />Xác nhận</button><button onClick={function() { setRetM(null); }} className="flex-1 bg-gray-200 py-2.5 rounded-xl">Hủy</button></div>
      </div></Md>)}
      {canM && <CM msg={"Hủy hợp đồng " + p.cN(canM.customer_id) + "?"} onConfirm={doCancel} onCancel={function() { setCanM(null); }} />}
    </div>
  );
}

function CusTab(p: any) {
  var [showAdd, setShowAdd] = useState(false); var [selC, setSelC] = useState<any>(null); var [search, setSearch] = useState(""); var [page, setPage] = useState(1);
  var ef = { name: "", phone: "", address: "", id_card: "", license: "" }; var [f, setF] = useState<any>(Object.assign({}, ef)); var [errors, setErrors] = useState<any>({});
  var add = function() {
    var e: any = {}; if (!f.name.trim()) e.name = "Bắt buộc"; if (!f.phone) e.phone = "Bắt buộc"; else if (!/^0\d{9}$/.test(f.phone)) e.phone = "10 số, bắt đầu bằng 0"; else if (p.customers.some(function(c: any) { return c.phone === f.phone; })) e.phone = "Đã tồn tại";
    if (f.id_card && !/^\d{9}$|^\d{12}$/.test(f.id_card)) e.id_card = "9 hoặc 12 số";
    setErrors(e); if (Object.keys(e).length) return;
    dbInsert("customers", f, function(nc: any) { if (nc) { p.setCustomers(function(prev: any) { return prev.concat([nc]); }); setF(Object.assign({}, ef)); setShowAdd(false); setErrors({}); p.notify("Thêm KH thành công!"); } });
  };
  var fl = p.customers.filter(function(c: any) { if (!search) return true; var s = search.toLowerCase(); return c.name.toLowerCase().indexOf(s) >= 0 || c.phone.indexOf(s) >= 0; });
  var pg = fl.slice((page - 1) * PS, page * PS);
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-between items-center gap-2">
        <h2 className="text-xl font-bold">Khách hàng ({p.customers.length})</h2>
        <div className="flex gap-2 items-center">
          <div className="relative"><Search className="w-4 h-4 absolute left-2.5 top-2.5 text-gray-400" /><input value={search} onChange={function(e: any) { setSearch(e.target.value); setPage(1); }} placeholder="Tìm KH..." className="pl-8 pr-3 py-2 border rounded-lg text-sm w-44" /></div>
          {p.cw && <button onClick={function() { setShowAdd(true); }} className="bg-green-600 text-white px-3 py-2 rounded-lg flex items-center gap-1.5 hover:bg-green-700 text-sm"><UserPlus className="w-4 h-4" />Thêm KH</button>}
        </div>
      </div>
      {showAdd && (<div className="bg-green-50 border border-green-200 rounded-xl p-4">
        <h3 className="font-semibold mb-3 text-sm">Thêm khách hàng</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FI label="Họ tên *" value={f.name} onChange={function(v: string) { setF(Object.assign({}, f, { name: v })); }} error={errors.name} />
          <FI label="SĐT *" value={f.phone} onChange={function(v: string) { setF(Object.assign({}, f, { phone: v.replace(/\D/g, "") })); }} error={errors.phone} placeholder="0901234567" />
          <FI label="Địa chỉ" value={f.address} onChange={function(v: string) { setF(Object.assign({}, f, { address: v })); }} />
          <FI label="CMND/CCCD" value={f.id_card} onChange={function(v: string) { setF(Object.assign({}, f, { id_card: v.replace(/\D/g, "") })); }} error={errors.id_card} />
          <FI label="Bằng lái" value={f.license} onChange={function(v: string) { setF(Object.assign({}, f, { license: v })); }} />
        </div>
        <div className="flex gap-2 mt-3"><button onClick={add} className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 flex items-center gap-1.5"><Save className="w-4 h-4" />Lưu</button><button onClick={function() { setShowAdd(false); setErrors({}); }} className="bg-gray-200 px-4 py-2 rounded-lg text-sm">Hủy</button></div>
      </div>)}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {pg.map(function(c: any) { var cr = p.rentals.filter(function(r: any) { return r.customer_id === c.id; }); var sp = cr.reduce(function(s: number, r: any) { return s + r.total; }, 0); return (
          <div key={c.id} className="bg-white rounded-xl shadow-sm border p-4 hover:shadow-md cursor-pointer transition" onClick={function() { setSelC(c); }}>
            <div className="flex items-center gap-3 mb-2"><div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold shrink-0">{c.name[0]}</div><div className="min-w-0"><h3 className="font-semibold text-sm truncate">{c.name}</h3><p className="text-xs text-gray-500">{c.phone}</p></div></div>
            <Rw l="Hợp đồng" r={cr.length} /><Rw l="Chi tiêu" r={fm(sp) + "đ"} rc="text-green-600" />
          </div>
        ); })}
        {pg.length === 0 && <div className="col-span-full text-center py-10 text-gray-400 text-sm">Không tìm thấy</div>}
      </div>
      <Pg page={page} total={fl.length} onChange={setPage} />
      {selC && (<Md onClose={function() { setSelC(null); }} title={selC.name}>
        <div className="space-y-2 text-sm mb-4"><Rw l="SĐT" r={selC.phone} /><Rw l="Địa chỉ" r={selC.address || "—"} /><Rw l="CMND" r={selC.id_card || "—"} /><Rw l="Bằng lái" r={selC.license || "—"} /></div>
        <h4 className="font-semibold text-sm mb-2 pt-3 border-t">Lịch sử thuê</h4>
        <div className="space-y-1.5">{p.rentals.filter(function(r: any) { return r.customer_id === selC.id; }).map(function(r: any) { return (<div key={r.id} className="flex justify-between items-center bg-gray-50 p-2 rounded-lg text-sm"><span className="truncate">{p.vN(r.vehicle_id)}</span><span className="text-xs text-gray-400 ml-2">{fd(r.start_date)}→{fd(r.end_date)}</span><Bg color={r.status === "active" ? "orange" : "green"}>{r.status === "active" ? "Thuê" : "Xong"}</Bg></div>); })}</div>
      </Md>)}
    </div>
  );
}

function ExpTab(p: any) {
  var [showAdd, setShowAdd] = useState(false); var [delC, setDelC] = useState<any>(null); var [fT, setFT] = useState("all"); var [page, setPage] = useState(1);
  var ef = { vehicle_id: "", type: "", amount: "", date: "", description: "" }; var [f, setF] = useState<any>(Object.assign({}, ef)); var [errors, setErrors] = useState<any>({});
  var add = function() {
    var e: any = {}; if (!f.vehicle_id) e.vehicle_id = "Chọn xe"; if (!f.type) e.type = "Chọn loại"; if (!f.amount || parseInt(f.amount) <= 0) e.amount = "> 0"; if (!f.date) e.date = "Chọn ngày";
    setErrors(e); if (Object.keys(e).length) return;
    var row = { vehicle_id: f.vehicle_id, type: f.type, amount: parseInt(f.amount), date: f.date, description: f.description };
    dbInsert("expenses", row, function(ne: any) { if (ne) { p.setExpenses(function(prev: any) { return [ne].concat(prev); }); setF(Object.assign({}, ef)); setShowAdd(false); setErrors({}); p.notify("Thêm thành công!"); } });
  };
  var tot = p.expenses.reduce(function(s: number, e: any) { return s + e.amount; }, 0);
  var vo = p.vehicles.map(function(v: any) { return { value: v.id, label: v.name + " — " + v.plate }; });
  var fl = p.expenses.filter(function(e: any) { return fT === "all" || e.type === fT; }).sort(function(a: any, b: any) { return b.date.localeCompare(a.date); });
  var pg = fl.slice((page - 1) * PS, page * PS);
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap justify-between items-center gap-2">
        <h2 className="text-xl font-bold">Chi phí</h2>
        <div className="flex gap-2 items-center flex-wrap">
          <select value={fT} onChange={function(e: any) { setFT(e.target.value); setPage(1); }} className="px-3 py-2 border rounded-lg text-sm"><option value="all">Tất cả</option><option value="fuel">Nhiên liệu</option><option value="maintenance">Bảo dưỡng</option><option value="repair">Sửa chữa</option><option value="insurance">Bảo hiểm</option><option value="wash">Rửa xe</option><option value="road_fee">Phí đường bộ</option><option value="fine">Phạt nguội</option><option value="other">Khác</option></select>
          {p.cw && <button onClick={function() { setShowAdd(true); }} className="bg-red-600 text-white px-3 py-2 rounded-lg flex items-center gap-1.5 hover:bg-red-700 text-sm"><Plus className="w-4 h-4" />Thêm</button>}
        </div>
      </div>
      {showAdd && (<div className="bg-red-50 border border-red-200 rounded-xl p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <SI label="Xe *" value={f.vehicle_id} onChange={function(v: string) { setF(Object.assign({}, f, { vehicle_id: v })); }} options={vo} error={errors.vehicle_id} />
          <SI label="Loại *" value={f.type} onChange={function(v: string) { setF(Object.assign({}, f, { type: v })); }} options={EXP_O} error={errors.type} />
          <FI label="Số tiền *" type="number" value={f.amount} onChange={function(v: string) { setF(Object.assign({}, f, { amount: v })); }} error={errors.amount} />
          <FI label="Ngày *" type="date" value={f.date} onChange={function(v: string) { setF(Object.assign({}, f, { date: v })); }} error={errors.date} />
          <FI label="Mô tả" value={f.description} onChange={function(v: string) { setF(Object.assign({}, f, { description: v })); }} textarea className="sm:col-span-2" />
        </div>
        <div className="flex gap-2 mt-3"><button onClick={add} className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 flex items-center gap-1.5"><Save className="w-4 h-4" />Lưu</button><button onClick={function() { setShowAdd(false); setErrors({}); }} className="bg-gray-200 px-4 py-2 rounded-lg text-sm">Hủy</button></div>
      </div>)}
      <div className="bg-white rounded-xl shadow-sm border p-4"><p className="text-sm text-gray-500">Tổng: <span className="text-xl font-bold text-red-600">{fm(tot)}đ</span></p></div>
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden"><div className="overflow-x-auto">
        <table className="w-full text-sm"><thead className="bg-gray-50 text-xs text-gray-500 uppercase"><tr><th className="px-3 py-2.5 text-left">Ngày</th><th className="px-3 py-2.5 text-left">Xe</th><th className="px-3 py-2.5 text-left">Loại</th><th className="px-3 py-2.5 text-left">Mô tả</th><th className="px-3 py-2.5 text-right">Tiền</th><th className="px-3 py-2.5"></th></tr></thead>
        <tbody className="divide-y">{pg.map(function(e: any) { var v = p.vMap[e.vehicle_id]; var tl = EXP_L[e.type] || e.type; return (<tr key={e.id} className="hover:bg-gray-50"><td className="px-3 py-2.5">{fd(e.date)}</td><td className="px-3 py-2.5">{v ? v.name : ""}</td><td className="px-3 py-2.5"><Bg>{tl}</Bg></td><td className="px-3 py-2.5 text-gray-500 truncate max-w-[200px]">{e.description}</td><td className="px-3 py-2.5 text-right text-red-500 font-medium">-{fm(e.amount)}đ</td><td className="px-3 py-2.5">{p.cw && (<button onClick={function() { setDelC(e); }} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>)}</td></tr>); })}</tbody></table>
      </div>{pg.length === 0 && <p className="text-center py-8 text-gray-400 text-sm">Không có</p>}</div>
      <Pg page={page} total={fl.length} onChange={setPage} />
      {delC && <CM msg={"Xóa chi phí " + fm(delC.amount) + "đ?"} onConfirm={function() { dbDelete("expenses", delC.id, function(ok: boolean) { if (ok) { p.setExpenses(function(prev: any) { return prev.filter(function(x: any) { return x.id !== delC.id; }); }); p.notify("Đã xóa"); } setDelC(null); }); }} onCancel={function() { setDelC(null); }} />}
    </div>
  );
}

function CalTab(p: any) {
  var yr = p.month.getFullYear(); var mo = p.month.getMonth(); var dim = new Date(yr, mo + 1, 0).getDate();
  var sd = new Date(yr, mo, 1).getDay(); var dn = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
  var empties: number[] = []; for (var i = 0; i < sd; i++) empties.push(i);
  var days: number[] = []; for (var d = 1; d <= dim; d++) days.push(d);
  var t = td();
  var [showBooking, setShowBooking] = useState(false);
  var [selBookV, setSelBookV] = useState<any>(null);
  var [selBookD, setSelBookD] = useState<any>(null);
  var [linkCopied, setLinkCopied] = useState(false);
  var contactPhone = "0819546586";
  var contactName = "Mr. Khánh";
  var contactAddr = "15A Lê Quang Đạo & Tây Mỗ";

  var copyLink = function() {
    var url = window.location.origin + window.location.pathname;
    try { navigator.clipboard.writeText(url); setLinkCopied(true); setTimeout(function() { setLinkCopied(false); }, 3000); } catch (e) { prompt("Copy link:", url); }
  };

  if (showBooking) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between"><h2 className="text-xl font-bold">Giao diện khách hàng</h2><button onClick={function() { setShowBooking(false); }} className="bg-gray-200 px-3 py-2 rounded-lg text-sm flex items-center gap-1.5 hover:bg-gray-300"><X className="w-4 h-4" />Đóng</button></div>
        <div className="flex items-center justify-center gap-3 mb-4 bg-white rounded-xl shadow-sm border p-3">
          <button onClick={function() { p.setMonth(new Date(yr, mo - 1, 1)); }} className="p-2 bg-blue-600 text-white rounded-lg"><ChevronLeft className="w-5 h-5" /></button>
          <h2 className="text-xl font-bold">Tháng {mo + 1}/{yr}</h2>
          <button onClick={function() { p.setMonth(new Date(yr, mo + 1, 1)); }} className="p-2 bg-blue-600 text-white rounded-lg"><ChevronRight className="w-5 h-5" /></button>
        </div>
        {p.vehicles.map(function(v: any) {
          return (
            <div key={v.id} className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4 pb-3 border-b"><div className="flex items-center gap-3"><span className="text-4xl sm:text-5xl">{v.image}</span><div><h3 className="text-xl sm:text-2xl font-bold">{v.name}</h3><p className="text-gray-500 text-sm">{v.plate} — {v.type} — {v.seats} chỗ</p></div></div><p className="text-xl sm:text-2xl font-bold text-blue-600 whitespace-nowrap">{fm(v.price_day)}đ/ngày</p></div>
              <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                {dn.map(function(d) { return (<div key={d} className="text-center font-bold text-gray-500 py-1 text-xs sm:text-sm">{d}</div>); })}
                {empties.map(function(i) { return (<div key={"e" + i} />); })}
                {days.map(function(dt) {
                  var ds = yr + "-" + String(mo + 1).padStart(2, "0") + "-" + String(dt).padStart(2, "0");
                  var vs = p.getVS(v.id, ds); var past = ds < t; var disabled = vs.status === "rented" || past;
                  var bg = past ? "bg-gray-100 opacity-40 cursor-not-allowed" : vs.status === "available" ? "bg-green-50 hover:bg-green-100 hover:scale-105 cursor-pointer shadow-sm" : "bg-red-50 cursor-not-allowed";
                  var isToday = ds === t;
                  return (<button key={dt} disabled={disabled} onClick={function() { if (!disabled) { setSelBookV(v); setSelBookD(ds); } }} className={"rounded-xl p-1.5 sm:p-3 min-h-[56px] sm:min-h-[80px] transition border " + (isToday ? "border-blue-500 border-2" : "border-gray-200") + " " + bg}><p className="text-sm sm:text-lg font-bold">{dt}</p><p className={"text-[10px] sm:text-xs font-semibold " + (past ? "text-gray-400" : vs.status === "available" ? "text-green-600" : "text-red-600")}>{past ? "—" : vs.status === "available" ? "Trống" : "Đã thuê"}</p>{vs.time && !past && (<p className="text-[10px] text-orange-600">Trả: {vs.time}</p>)}</button>);
                })}
              </div>
            </div>
          );
        })}
        {selBookV && selBookD && (
          <Md onClose={function() { setSelBookV(null); setSelBookD(null); }} title={selBookV.name}>
            <p className="text-gray-600 text-sm mb-4">Ngày: {fd(selBookD)}</p>
            <div className="space-y-2 mb-5">
              <div className="p-3 bg-gray-50 rounded-xl flex justify-between items-center"><span className="text-sm text-gray-600">Giá/Ngày</span><span className="text-xl font-bold">{fm(selBookV.price_day)}đ</span></div>
              <div className="p-3 bg-gray-50 rounded-xl flex justify-between items-center"><span className="text-sm text-gray-600">Giá/Tuần</span><span className="text-xl font-bold">{fm(selBookV.price_week)}đ</span></div>
              <div className="p-3 bg-gray-50 rounded-xl flex justify-between items-center"><span className="text-sm text-gray-600">Giá/Tháng</span><span className="text-xl font-bold">{fm(selBookV.price_month)}đ</span></div>
            </div>
            <a href={"https://zalo.me/" + contactPhone + "?text=Xin chào " + contactName + ", tôi muốn thuê xe " + selBookV.name + " (" + selBookV.plate + ") ngày " + fd(selBookD)} target="_blank" rel="noopener noreferrer" className="block w-full bg-blue-600 text-white py-3 rounded-xl text-center font-bold mb-2 hover:bg-blue-700">💬 Đặt qua Zalo: {contactPhone}</a>
            <a href={"tel:" + contactPhone} className="block w-full bg-green-600 text-white py-3 rounded-xl text-center font-bold mb-2 hover:bg-green-700">📞 Gọi ngay: {contactPhone}</a>
            <div className="mt-3 p-3 bg-gray-50 rounded-xl text-sm text-center text-gray-600"><p className="font-semibold">{contactName}</p><p>📍 {contactAddr}</p></div>
          </Md>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <button onClick={function() { p.setMonth(new Date(yr, mo - 1, 1)); }} className="p-1.5 hover:bg-gray-100 rounded-lg"><ChevronLeft className="w-5 h-5" /></button>
          <h2 className="text-xl font-bold">Tháng {mo + 1}/{yr}</h2>
          <button onClick={function() { p.setMonth(new Date(yr, mo + 1, 1)); }} className="p-1.5 hover:bg-gray-100 rounded-lg"><ChevronRight className="w-5 h-5" /></button>
        </div>
        <div className="flex gap-2">
          <button onClick={function() { setShowBooking(true); }} className="bg-purple-600 text-white px-3 py-2 rounded-lg flex items-center gap-1.5 hover:bg-purple-700 text-sm"><Eye className="w-4 h-4" />Xem giao diện khách</button>
          <button onClick={copyLink} className={"px-3 py-2 rounded-lg flex items-center gap-1.5 text-sm " + (linkCopied ? "bg-green-600 text-white" : "bg-blue-600 text-white hover:bg-blue-700")}>{linkCopied ? <span>✅ Đã copy!</span> : <span className="flex items-center gap-1.5"><Eye className="w-4 h-4" />Copy link</span>}</button>
        </div>
      </div>
      {p.vehicles.map(function(v: any) {
        return (
          <div key={v.id} className="bg-white rounded-xl shadow-sm border p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-3"><span className="text-2xl">{v.image}</span><div><h3 className="font-semibold text-sm">{v.name}</h3><p className="text-xs text-gray-500">{v.plate}</p></div></div>
            <div className="grid grid-cols-7 gap-1.5">
              {dn.map(function(d) { return (<div key={d} className="text-center text-xs font-semibold text-gray-400 py-0.5">{d}</div>); })}
              {empties.map(function(i) { return (<div key={"e" + i} />); })}
              {days.map(function(dt) {
                var ds = yr + "-" + String(mo + 1).padStart(2, "0") + "-" + String(dt).padStart(2, "0");
                var vs = p.getVS(v.id, ds); var isT = ds === t;
                var bc = isT ? "border-blue-500 border-2" : "border-gray-100";
                var bg = vs.status === "available" ? "bg-green-50" : "bg-red-50";
                var tc = vs.status === "available" ? "text-green-600" : "text-red-600";
                return (
                  <div key={dt} className={"rounded-lg p-1.5 min-h-[48px] sm:min-h-[56px] border " + bc + " " + bg}>
                    <p className="text-xs font-semibold">{dt}</p>
                    <p className={"text-[10px] " + tc}>{vs.status === "available" ? "✅" : "🔄"}</p>
                    {vs.time && <p className="text-[10px] text-orange-600">{vs.time}</p>}
                    {vs.rental && <p className="text-[10px] text-gray-500 truncate">{p.cN(vs.rental.customer_id)}</p>}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
