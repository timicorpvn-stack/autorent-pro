import { useState, useEffect, useMemo, useCallback } from 'react';
import { Car, DollarSign, TrendingUp, Calendar, Users, Wrench, LayoutDashboard, LogOut, Plus, Save, Search, Edit, Trash2, X, CheckCircle, RotateCcw, ChevronLeft, ChevronRight, UserPlus, AlertCircle, Link as LinkIcon, Phone, Eye } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// ===== CONSTANTS & PERMISSIONS =====
const PAGE_SIZE = 10;

const DEMO_USERS = [
  { id: "1", username: "admin", name: "Admin", role: "admin" },
  { id: "2", username: "nhanvien1", name: "Nhân viên 1", role: "staff" },
  { id: "3", username: "nhanvien2", name: "Nhân viên 2", role: "staff" },
  { id: "4", username: "doitac1", name: "Đối tác ABC", role: "partner" },
  { id: "5", username: "doitac2", name: "Đối tác XYZ", role: "partner" }
];

const DEMO_PASSWORDS: any = {
  admin: "admin123",
  nhanvien1: "staff123",
  nhanvien2: "staff123",
  doitac1: "partner123",
  doitac2: "partner123"
};

const PERMISSIONS: any = {
  admin: ["dashboard", "vehicles", "rentals", "customers", "expenses", "calendar"],
  staff: ["dashboard", "rentals", "customers", "calendar"],
  partner: ["dashboard", "vehicles", "rentals", "customers", "expenses", "calendar"]
};

const WRITE_PERMS: any = {
  vehicles: ["admin"],
  rentals: ["admin", "staff"],
  customers: ["admin", "staff"],
  expenses: ["admin"]
};

const EXP_OPTIONS = [
  { value: "fuel", label: "Xăng" },
  { value: "maintenance", label: "Bảo dưỡng" },
  { value: "repair", label: "Sửa chữa" },
  { value: "insurance", label: "Bảo hiểm" },
  { value: "wash", label: "Rửa xe" },
  { value: "road_fee", label: "Phí đường" },
  { value: "fine", label: "Phạt nguội" },
  { value: "other", label: "Khác" }
];

const EXP_LABELS: any = {
  fuel: "Xăng", maintenance: "Bảo dưỡng", repair: "Sửa chữa", insurance: "Bảo hiểm",
  wash: "Rửa xe", road_fee: "Phí đường", fine: "Phạt nguội", other: "Khác"
};

// Utility functions
const todayString = () => new Date().toISOString().split("T")[0];
const formatNumber = (n: number) => n?.toLocaleString("vi-VN") || "0";
const formatDate = (d: string) => {
  if (!d) return "";
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y}`;
};

// Supabase helpers
const dbLoad = (table: string, callback: (data: any) => void, orderBy = 'id') => {
  supabase.from(table).select('*').order(orderBy, { ascending: false })
    .then(({ data, error }) => {
      if (error) console.error(error);
      else callback(data || []);
    });
};

const dbInsert = (table: string, row: any, callback: (data: any) => void) => {
  supabase.from(table).insert(row).select().single()
    .then(({ data, error }) => {
      if (error) console.error(error);
      else callback(data);
    });
};

const dbUpdate = (table: string, id: string, updates: any, callback: (data: any) => void) => {
  supabase.from(table).update(updates).eq('id', id).select().single()
    .then(({ data, error }) => {
      if (error) console.error(error);
      else callback(data);
    });
};

const dbDelete = (table: string, id: string, callback: (ok: boolean) => void) => {
  supabase.from(table).delete().eq('id', id)
    .then(({ error }) => callback(!error));
};

// ===== UI COMPONENTS =====
function Toast({ toast }: any) {
  if (!toast) return null;
  const bg = toast.type === "error" ? "bg-red-600" : "bg-green-600";
  return (
    <div className={`fixed top-4 right-4 ${bg} text-white px-6 py-3 rounded-xl shadow-2xl z-50 animate-bounce`}>
      {toast.msg}
    </div>
  );
}

function Spinner() {
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="w-16 h-16 border-4 border-white border-t-blue-600 rounded-full animate-spin" />
    </div>
  );
}

function Modal({ children, onClose, title }: any) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">{title}</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ConfirmModal({ msg, onConfirm, onCancel }: any) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40 p-4">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle className="w-6 h-6 text-red-500" />
          <p className="font-semibold">{msg}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={onConfirm} className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700">
            Xác nhận
          </button>
          <button onClick={onCancel} className="flex-1 bg-gray-200 py-2 rounded-lg hover:bg-gray-300">
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
}

function FormInput({ label, type = "text", value, onChange, error, placeholder, textarea, className = "" }: any) {
  const Tag: any = textarea ? "textarea" : "input";
  return (
    <div className={className}>
      <label className="block text-sm font-medium mb-1.5 text-gray-700">{label}</label>
      <Tag
        type={type}
        value={value}
        onChange={(e: any) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full px-3 py-2 border rounded-lg text-sm ${error ? "border-red-500" : "border-gray-300"} ${textarea ? "resize-none h-20" : ""}`}
      />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

function SelectInput({ label, value, onChange, options, error }: any) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5 text-gray-700">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-3 py-2 border rounded-lg text-sm ${error ? "border-red-500" : "border-gray-300"}`}
      >
        <option value="">-- Chọn --</option>
        {options.map((o: any) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

function Badge({ children, color = "blue" }: any) {
  const colors: any = {
    blue: "bg-blue-100 text-blue-700",
    green: "bg-green-100 text-green-700",
    orange: "bg-orange-100 text-orange-700",
    red: "bg-red-100 text-red-700",
    gray: "bg-gray-100 text-gray-700"
  };
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[color]}`}>{children}</span>;
}

function StatCard({ icon: Icon, label, value, color }: any) {
  return (
    <div className={`bg-gradient-to-br ${color} rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-lg text-white`}>
      <Icon className="w-6 h-6 sm:w-8 sm:h-8 mb-2 sm:mb-3 opacity-90" />
      <p className="text-xs sm:text-sm opacity-90 mb-1">{label}</p>
      <p className="text-xl sm:text-3xl font-bold truncate">{value}</p>
    </div>
  );
}

function Pagination({ page, total, onChange }: any) {
  const totalPages = Math.ceil(total / PAGE_SIZE);
  if (totalPages <= 1) return null;
  return (
    <div className="flex justify-center gap-2 items-center">
      <button
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="px-3 py-1.5 border rounded-lg disabled:opacity-50 text-sm"
      >
        ←
      </button>
      <span className="text-sm">Trang {page}/{totalPages}</span>
      <button
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className="px-3 py-1.5 border rounded-lg disabled:opacity-50 text-sm"
      >
        →
      </button>
    </div>
  );
}

function DashboardTab({ rentals, expenses, vehicles, customerName, vehicleName, dateRange, setDateRange }: any) {
  const activeRentals = rentals.filter((r: any) => r.status === "active");
  
  const filteredRentals = dateRange.from && dateRange.to 
    ? rentals.filter((r: any) => r.start_date >= dateRange.from && r.start_date <= dateRange.to)
    : rentals;
  
  const filteredExpenses = dateRange.from && dateRange.to
    ? expenses.filter((e: any) => e.date >= dateRange.from && e.date <= dateRange.to)
    : expenses;

  // ✅ SỬA: Doanh thu = total + surcharge (không dùng paid)
  const revenue = filteredRentals.reduce((s: number, r: any) => s + (r.total + (r.surcharge || 0)), 0);
  const totalExpenses = filteredExpenses.reduce((s: number, e: any) => s + e.amount, 0);
  const profit = revenue - totalExpenses;

  // Thống kê từng xe
  const vehicleStats = vehicles.map((vehicle: any) => {
    const vehicleRentals = filteredRentals.filter((r: any) => r.vehicle_id === vehicle.id);
    const vehicleExpenses = filteredExpenses.filter((e: any) => e.vehicle_id === vehicle.id);
    
    // ✅ SỬA: Doanh thu xe = total + surcharge
    const vehicleRevenue = vehicleRentals.reduce((s: number, r: any) => s + (r.total + (r.surcharge || 0)), 0);
    const vehicleExpense = vehicleExpenses.reduce((s: number, e: any) => s + e.amount, 0);
    const vehicleProfit = vehicleRevenue - vehicleExpense;
    const tripCount = vehicleRentals.length;

    return {
      ...vehicle,
      revenue: vehicleRevenue,
      expense: vehicleExpense,
      profit: vehicleProfit,
      tripCount
    };
  }).sort((a, b) => b.profit - a.profit);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Date Filter - Mobile Optimized */}
      <div className="bg-white rounded-lg shadow-sm border p-3 sm:p-4">
        <div className="grid grid-cols-1 gap-3">
          <div className="grid grid-cols-2 gap-2">
            <FormInput 
              label="Từ ngày" 
              type="date" 
              value={dateRange.from} 
              onChange={(v: string) => setDateRange({ ...dateRange, from: v })} 
              className="w-full"
            />
            <FormInput 
              label="Đến ngày" 
              type="date" 
              value={dateRange.to} 
              onChange={(v: string) => setDateRange({ ...dateRange, to: v })} 
              className="w-full"
            />
          </div>
          <button 
            onClick={() => setDateRange({ from: "", to: "" })} 
            className="bg-gray-200 px-3 py-2 rounded-lg text-sm hover:bg-gray-300 w-full"
          >
            Xóa lọc
          </button>
        </div>
      </div>

      {/* Tổng quan - Mobile Optimized */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard icon={DollarSign} label="Doanh thu" value={formatNumber(revenue) + "đ"} color="from-green-500 to-green-600" />
        <StatCard icon={TrendingUp} label="Chi phí" value={formatNumber(totalExpenses) + "đ"} color="from-red-500 to-red-600" />
        <StatCard icon={DollarSign} label="Lợi nhuận" value={formatNumber(profit) + "đ"} color="from-blue-500 to-blue-600" />
        <StatCard icon={Car} label="Đang thuê" value={activeRentals.length} color="from-orange-500 to-orange-600" />
      </div>

      {/* Thống kê từng xe - Mobile Optimized */}
      <div className="bg-white rounded-xl shadow-sm border p-3 sm:p-6">
        <h3 className="font-bold mb-3 sm:mb-4 flex items-center gap-2 text-base sm:text-lg">
          <Car className="w-4 h-4 sm:w-5 sm:h-5" />
          Thống kê theo xe
        </h3>
        
        {/* Mobile: Card Layout */}
        <div className="block sm:hidden space-y-3">
          {vehicleStats.map((v: any) => (
            <div key={v.id} className="border rounded-lg p-3 bg-gray-50">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">{v.image}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{v.name}</p>
                  <p className="text-xs text-gray-500">{v.plate}</p>
                </div>
                <Badge color={v.status === "available" ? "green" : v.status === "rented" ? "orange" : "red"}>
                  {v.status === "available" ? "Sẵn" : v.status === "rented" ? "Thuê" : "Bảo trì"}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-white p-2 rounded">
                  <p className="text-gray-500 mb-1">Chuyến</p>
                  <p className="font-bold text-sm">{v.tripCount}</p>
                </div>
                <div className="bg-white p-2 rounded">
                  <p className="text-gray-500 mb-1">Doanh thu</p>
                  <p className="font-bold text-sm text-green-600">{formatNumber(v.revenue)}đ</p>
                </div>
                <div className="bg-white p-2 rounded">
                  <p className="text-gray-500 mb-1">Chi phí</p>
                  <p className="font-bold text-sm text-red-600">{formatNumber(v.expense)}đ</p>
                </div>
                <div className="bg-white p-2 rounded">
                  <p className="text-gray-500 mb-1">Lợi nhuận</p>
                  <p className={`font-bold text-sm ${v.profit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                    {formatNumber(v.profit)}đ
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop: Table Layout */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Xe</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-600">Chuyến</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-600">Doanh thu</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-600">Chi phí</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-600">Lợi nhuận</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-600">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {vehicleStats.map((v: any) => (
                <tr key={v.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{v.image}</span>
                      <div>
                        <p className="font-medium">{v.name}</p>
                        <p className="text-xs text-gray-500">{v.plate}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-medium">{v.tripCount}</td>
                  <td className="px-4 py-3 text-right font-semibold text-green-600">
                    {formatNumber(v.revenue)}đ
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-red-600">
                    {formatNumber(v.expense)}đ
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-lg">
                    <span className={v.profit >= 0 ? 'text-blue-600' : 'text-red-600'}>
                      {formatNumber(v.profit)}đ
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge color={v.status === "available" ? "green" : v.status === "rented" ? "orange" : "red"}>
                      {v.status === "available" ? "✅ Sẵn" : v.status === "rented" ? "🔄 Thuê" : "🔧 Bảo trì"}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50 font-bold">
              <tr>
                <td className="px-4 py-3">TỔNG</td>
                <td className="px-4 py-3 text-right">{filteredRentals.length}</td>
                <td className="px-4 py-3 text-right text-green-600">{formatNumber(revenue)}đ</td>
                <td className="px-4 py-3 text-right text-red-600">{formatNumber(totalExpenses)}đ</td>
                <td className="px-4 py-3 text-right text-blue-600 text-lg">{formatNumber(profit)}đ</td>
                <td className="px-4 py-3"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Hợp đồng đang hoạt động */}
      <div className="bg-white rounded-xl shadow-sm border p-3 sm:p-6">
        <h3 className="font-bold mb-3 sm:mb-4 flex items-center gap-2 text-base sm:text-lg">
          <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
          Hợp đồng đang hoạt động ({activeRentals.length})
        </h3>
        <div className="space-y-2 sm:space-y-3">
          {activeRentals.map((r: any) => (
            <div key={r.id} className="flex justify-between items-center p-2 sm:p-3 bg-gray-50 rounded-lg">
              <div className="min-w-0 flex-1 mr-2">
                <p className="font-medium text-xs sm:text-sm truncate">{vehicleName(r.vehicle_id)}</p>
                <p className="text-[10px] sm:text-xs text-gray-500 truncate">{customerName(r.customer_id)}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-[10px] sm:text-xs text-gray-500 whitespace-nowrap">{formatDate(r.start_date)} → {formatDate(r.end_date)}</p>
                <p className="text-xs sm:text-sm font-semibold text-green-600 whitespace-nowrap">{formatNumber(r.total)}đ</p>
              </div>
            </div>
          ))}
          {activeRentals.length === 0 && (
            <p className="text-center text-gray-400 py-4 text-xs sm:text-sm">Không có hợp đồng đang hoạt động</p>
          )}
        </div>
      </div>
    </div>
  );
}

function VehiclesTab({ vehicles, setVehicles, rentals, notify, setLoading, canWrite }: any) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showAdd, setShowAdd] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<any>(null);
  const emptyForm = { name: "", plate: "", price_day: "", price_week: "", price_month: "", image: "🚗", type: "Sedan", seats: "5", transmission: "Tự động", fuel: "Xăng", odo: "0" };
  const [form, setForm] = useState<any>({ ...emptyForm });
  const [errors, setErrors] = useState<any>({});

  const addVehicle = () => {
    const e: any = {};
    if (!form.name.trim()) e.name = "Bắt buộc";
    if (!form.plate) e.plate = "Bắt buộc";
    else if (!/^\d{2}[A-Z]-\d{4,5}$/.test(form.plate.toUpperCase())) e.plate = "Sai định dạng (VD: 30A-12345)";
    else if (vehicles.some((v: any) => v.plate === form.plate.toUpperCase())) e.plate = "Đã tồn tại";
    if (!form.price_day || parseInt(form.price_day) <= 0) e.price_day = "> 0";
    if (parseInt(form.odo) < 0) e.odo = "≥ 0";
    setErrors(e);
    if (Object.keys(e).length) return;

    const newVehicle = {
      name: form.name,
      plate: form.plate.toUpperCase(),
      price_day: parseInt(form.price_day),
      price_week: parseInt(form.price_week) || parseInt(form.price_day) * 6,
      price_month: parseInt(form.price_month) || parseInt(form.price_day) * 25,
      odo: parseInt(form.odo) || 0,
      type: form.type,
      seats: parseInt(form.seats),
      transmission: form.transmission,
      fuel: form.fuel,
      image: form.image,
      status: "available"
    };

    dbInsert('vehicles', newVehicle, (nv: any) => {
      if (nv) {
        setVehicles((prev: any) => [nv, ...prev]);
        setForm({ ...emptyForm });
        setShowAdd(false);
        setErrors({});
        notify("✅ Thêm xe thành công!");
      }
    });
  };

  const updateVehicle = (id: string) => {
    if (!editingVehicle.name || !editingVehicle.plate) {
      notify("❌ Vui lòng điền đầy đủ!", "error");
      return;
    }
    const oldVehicle = vehicles.find((v: any) => v.id === id);
    if (parseInt(editingVehicle.odo) < oldVehicle.odo) {
      notify(`❌ ODO không thể giảm! Hiện tại: ${formatNumber(oldVehicle.odo)}km`, "error");
      return;
    }

    const updates = {
      name: editingVehicle.name,
      plate: editingVehicle.plate,
      price_day: parseInt(editingVehicle.price_day),
      price_week: parseInt(editingVehicle.price_week),
      price_month: parseInt(editingVehicle.price_month),
      odo: parseInt(editingVehicle.odo)
    };

    dbUpdate('vehicles', id, updates, (uv: any) => {
      if (uv) {
        setVehicles((prev: any) => prev.map((v: any) => v.id === id ? { ...v, ...uv } : v));
        setEditingVehicle(null);
        notify("✅ Cập nhật thành công!");
      }
    });
  };

  const deleteVehicle = (vehicle: any) => {
    const hasActiveRentals = rentals.some((r: any) => r.vehicle_id === vehicle.id && r.status === "active");
    if (hasActiveRentals) {
      notify("❌ Xe đang có hợp đồng, không thể xóa!", "error");
      return;
    }
    setDeleteConfirm(vehicle);
  };

  const confirmDelete = () => {
    if (!deleteConfirm) return;
    setLoading(true);
    dbDelete('vehicles', deleteConfirm.id, (ok: boolean) => {
      if (ok) {
        setVehicles((prev: any) => prev.filter((v: any) => v.id !== deleteConfirm.id));
        notify("✅ Đã xóa xe!");
      }
      setDeleteConfirm(null);
      setLoading(false);
    });
  };

  const filtered = vehicles.filter((v: any) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return v.name.toLowerCase().includes(s) || v.plate.toLowerCase().includes(s);
  });

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-between items-center gap-2">
        <h2 className="text-xl font-bold">Quản lý xe ({vehicles.length})</h2>
        <div className="flex gap-2 items-center">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-gray-400" />
            <input 
              value={search} 
              onChange={(e) => { setSearch(e.target.value); setPage(1); }} 
              placeholder="Tìm xe..." 
              className="pl-8 pr-3 py-2 border rounded-lg text-sm w-36" 
            />
          </div>
          {canWrite("vehicles") && (
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
            <FormInput label="Tên xe *" value={form.name} onChange={(v: string) => setForm({ ...form, name: v })} error={errors.name} placeholder="Toyota Camry 2024" />
            <FormInput label="Biển số *" value={form.plate} onChange={(v: string) => setForm({ ...form, plate: v.toUpperCase() })} error={errors.plate} placeholder="30A-12345" />
            <FormInput label="ODO (km)" type="number" value={form.odo} onChange={(v: string) => setForm({ ...form, odo: v })} error={errors.odo} />
            <FormInput label="Giá/ngày *" type="number" value={form.price_day} onChange={(v: string) => setForm({ ...form, price_day: v })} error={errors.price_day} placeholder="800000" />
            <FormInput label="Giá/tuần" type="number" value={form.price_week} onChange={(v: string) => setForm({ ...form, price_week: v })} placeholder="Tự tính" />
            <FormInput label="Giá/tháng" type="number" value={form.price_month} onChange={(v: string) => setForm({ ...form, price_month: v })} placeholder="Tự tính" />
            <SelectInput label="Loại xe" value={form.type} onChange={(v: string) => setForm({ ...form, type: v })} options={[{value:"Sedan",label:"Sedan"},{value:"SUV",label:"SUV"},{value:"MPV",label:"MPV"},{value:"Pickup",label:"Pickup"}]} />
            <FormInput label="Số chỗ" type="number" value={form.seats} onChange={(v: string) => setForm({ ...form, seats: v })} />
            <SelectInput label="Hộp số" value={form.transmission} onChange={(v: string) => setForm({ ...form, transmission: v })} options={[{value:"Tự động",label:"Tự động"},{value:"Số sàn",label:"Số sàn"}]} />
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={addVehicle} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 flex items-center gap-1.5">
              <Save className="w-4 h-4" />Lưu
            </button>
            <button onClick={() => { setShowAdd(false); setErrors({}); }} className="bg-gray-200 px-4 py-2 rounded-lg text-sm">Hủy</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {paginated.map((v: any) => (
          <div key={v.id} className="bg-white rounded-xl shadow-sm border p-4 hover:shadow-lg transition">
            {editingVehicle?.id === v.id ? (
              <div className="space-y-3">
                <FormInput label="Tên" value={editingVehicle.name} onChange={(val: string) => setEditingVehicle({...editingVehicle, name: val})} />
                <FormInput label={`ODO (≥${formatNumber(v.odo)})`} type="number" value={editingVehicle.odo} onChange={(val: string) => setEditingVehicle({...editingVehicle, odo: val})} />
                <FormInput label="Giá/ngày" type="number" value={editingVehicle.price_day} onChange={(val: string) => setEditingVehicle({...editingVehicle, price_day: val})} />
                <FormInput label="Giá/tuần" type="number" value={editingVehicle.price_week} onChange={(val: string) => setEditingVehicle({...editingVehicle, price_week: val})} />
                <FormInput label="Giá/tháng" type="number" value={editingVehicle.price_month} onChange={(val: string) => setEditingVehicle({...editingVehicle, price_month: val})} />
                <div className="flex gap-2">
                  <button onClick={() => updateVehicle(v.id)} className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm flex items-center justify-center gap-1">
                    <Save className="w-4 h-4" />Lưu
                  </button>
                  <button onClick={() => setEditingVehicle(null)} className="flex-1 bg-gray-200 py-2 rounded-lg text-sm">Hủy</button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{v.image}</span>
                    <div>
                      <h3 className="font-semibold text-lg">{v.name}</h3>
                      <p className="text-gray-600 text-sm">{v.plate}</p>
                    </div>
                  </div>
                  <Badge color={v.status === "available" ? "green" : v.status === "rented" ? "orange" : "red"}>
                    {v.status === "available" ? "✅ Sẵn" : v.status === "rented" ? "🔄 Thuê" : "🔧 Bảo trì"}
                  </Badge>
                </div>
                <div className="space-y-2 text-sm mb-4 pb-4 border-b">
                  <div className="flex justify-between">
                    <span className="text-gray-600">ODO:</span>
                    <span className="font-medium">{formatNumber(v.odo)} km</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Giá/ngày:</span>
                    <span className="font-medium text-blue-600">{formatNumber(v.price_day)}đ</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Giá/tuần:</span>
                    <span className="font-medium text-green-600">{formatNumber(v.price_week)}đ</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Giá/tháng:</span>
                    <span className="font-medium text-purple-600">{formatNumber(v.price_month)}đ</span>
                  </div>
                </div>
                {canWrite("vehicles") && (
                  <div className="flex gap-2">
                    <button onClick={() => setEditingVehicle(v)} className="flex-1 bg-blue-100 text-blue-700 py-2 rounded-lg text-sm hover:bg-blue-200 flex items-center justify-center gap-1">
                      <Edit className="w-4 h-4" />Sửa
                    </button>
                    <button onClick={() => deleteVehicle(v)} className="flex-1 bg-red-100 text-red-700 py-2 rounded-lg text-sm hover:bg-red-200 flex items-center justify-center gap-1">
                      <Trash2 className="w-4 h-4" />Xóa
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>

      <Pagination page={page} total={filtered.length} onChange={setPage} />

      {deleteConfirm && (
        <ConfirmModal 
          msg={`Xóa xe ${deleteConfirm.name}?`} 
          onConfirm={confirmDelete} 
          onCancel={() => setDeleteConfirm(null)} 
        />
      )}
    </div>
  );
}
// ===== RENTALS TAB WITH OVERLAP CHECK =====
function RentalsTab({ rentals, vehicles, setVehicles, setRentals, customers, checkOverlap, notify, setLoading, customerName, vehicleName, vehiclePlate, vMap, canWrite }: any) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showAdd, setShowAdd] = useState(false);
  const [returnModal, setReturnModal] = useState<any>(null);
  const [editingRental, setEditingRental] = useState<any>(null);
  const emptyForm = { customer_id: "", vehicle_id: "", start_date: "", start_time: "09:00", end_date: "", end_time: "18:00", rental_type: "day", custom_price: "", deposit: "", pickup_location: "", notes: "", odo_start: "" };
  const [form, setForm] = useState<any>({ ...emptyForm });
  const [returnForm, setReturnForm] = useState<any>({ odo_end: "", surcharge: "0", surcharge_note: "" });
  const [errors, setErrors] = useState<any>({});
  
  const calculatePrice = (formData?: any) => {
    const f = formData || form;
    if (!f.vehicle_id || !f.start_date || !f.end_date) return 0;
    const vehicle = vMap[f.vehicle_id];
    if (!vehicle) return 0;
    const days = Math.ceil((new Date(f.end_date).getTime() - new Date(f.start_date).getTime()) / 86400000);
    if (days <= 0) return 0;
    if (f.rental_type === "day") return days * vehicle.price_day;
    if (f.rental_type === "week") return Math.ceil(days / 7) * vehicle.price_week;
    return Math.ceil(days / 30) * vehicle.price_month;
  };

  const calculateEditPrice = () => {
    if (!editingRental || !editingRental.vehicle_id || !editingRental.start_date || !editingRental.end_date) return 0;
    const vehicle = vMap[editingRental.vehicle_id];
    if (!vehicle) return 0;
    const days = Math.ceil((new Date(editingRental.end_date).getTime() - new Date(editingRental.start_date).getTime()) / 86400000);
    if (days <= 0) return 0;
    if (editingRental.rental_type === "day") return days * vehicle.price_day;
    if (editingRental.rental_type === "week") return Math.ceil(days / 7) * vehicle.price_week;
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
    
    // ⚠️ CHECK TRÙNG LỊCH
    if (form.vehicle_id && form.start_date && form.end_date && !e.end_date) {
      if (checkOverlap(form.vehicle_id, form.start_date, form.end_date)) {
        e.vehicle_id = "⚠️ Xe đã có lịch thuê trùng!";
      }
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

  const updateRental = () => {
    if (!editingRental.customer_id || !editingRental.start_date || !editingRental.end_date) {
      notify("❌ Vui lòng điền đầy đủ thông tin!", "error");
      return;
    }

    if (new Date(editingRental.end_date) <= new Date(editingRental.start_date)) {
      notify("❌ Ngày trả phải sau ngày nhận!", "error");
      return;
    }

    // ⚠️ CHECK TRÙNG LỊCH KHI SỬA (bỏ qua chính hợp đồng đang sửa)
    if (checkOverlap(editingRental.vehicle_id, editingRental.start_date, editingRental.end_date, editingRental.id)) {
      notify("❌ Xe đã có lịch thuê trùng trong khoảng thời gian này!", "error");
      return;
    }

    const days = Math.ceil((new Date(editingRental.end_date).getTime() - new Date(editingRental.start_date).getTime()) / 86400000);
    const basePrice = calculateEditPrice();
    const finalPrice = editingRental.custom_total ? parseInt(editingRental.custom_total) : basePrice;
    const deposit = Math.min(parseInt(editingRental.deposit) || 0, finalPrice);

    const updates = {
      customer_id: editingRental.customer_id,
      start_date: editingRental.start_date,
      start_time: editingRental.start_time,
      end_date: editingRental.end_date,
      end_time: editingRental.end_time,
      rental_type: editingRental.rental_type,
      total_days: days,
      base_price: basePrice,
      total: finalPrice,
      deposit: deposit,
      paid: deposit,
      pickup_location: editingRental.pickup_location,
      notes: editingRental.notes
    };

    dbUpdate('rentals', editingRental.id, updates, (ur: any) => {
      if (ur) {
        setRentals((prev: any) => prev.map((r: any) => r.id === editingRental.id ? { ...r, ...ur } : r));
        setEditingRental(null);
        notify("✅ Cập nhật HĐ thành công!");
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
  const editBasePrice = calculateEditPrice();
  
  const filtered = rentals.filter((r: any) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return customerName(r.customer_id).toLowerCase().includes(s) || vehicleName(r.vehicle_id).toLowerCase().includes(s);
  }).sort((a: any, b: any) => (b.start_date || "").localeCompare(a.start_date || ""));
  
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const customerOptions = customers.map((c: any) => ({ value: c.id, label: c.name + " — " + c.phone }));
  const vehicleOptions = vehicles.map((v: any) => ({ value: v.id, label: v.name + " — " + v.plate }));

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
          {canWrite("rentals") && (
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
            <div className="sm:col-span-2">
              <FormInput label="Ghi chú" value={form.notes} onChange={(v: string) => setForm({ ...form, notes: v })} textarea />
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={createRental} className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 flex items-center gap-1.5">
              <Save className="w-4 h-4" />Tạo
            </button>
            <button onClick={() => { setShowAdd(false); setErrors({}); setForm({ ...emptyForm }); }} className="bg-gray-200 px-4 py-2 rounded-lg text-sm">Hủy</button>
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
                      <div className="flex gap-1">
                        {r.status === "active" && canWrite("rentals") && (
                          <>
                            <button 
                              onClick={() => {
                                setEditingRental({
                                  ...r,
                                  custom_total: ""
                                });
                              }} 
                              className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs hover:bg-blue-200 flex items-center gap-1"
                            >
                              <Edit className="w-3 h-3" />Sửa
                            </button>
                            <button 
                              onClick={() => { setReturnModal(r); setReturnForm({ odo_end: String(r.odo_start), surcharge: "0", surcharge_note: "" }); }} 
                              className="bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700 flex items-center gap-1"
                            >
                              <RotateCcw className="w-3 h-3" />Trả
                            </button>
                          </>
                        )}
                      </div>
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

      {/* Modal Sửa Hợp Đồng */}
      {editingRental && (
        <Modal onClose={() => setEditingRental(null)} title="Sửa hợp đồng">
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 rounded-xl text-sm">
              <div className="flex justify-between mb-1">
                <span className="text-gray-600">Xe:</span>
                <span className="font-semibold">{vehicleName(editingRental.vehicle_id)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Cọc đã nhận:</span>
                <span className="font-semibold text-blue-600">{formatNumber(editingRental.deposit)}đ</span>
              </div>
            </div>

            <SelectInput 
              label="Khách hàng" 
              value={editingRental.customer_id} 
              onChange={(v: string) => setEditingRental({...editingRental, customer_id: v})} 
              options={customers.map((c: any) => ({ value: c.id, label: c.name + " — " + c.phone }))} 
            />
            
            <div className="grid grid-cols-2 gap-3">
              <FormInput 
                label="Ngày nhận" 
                type="date" 
                value={editingRental.start_date} 
                onChange={(v: string) => setEditingRental({...editingRental, start_date: v, custom_total: ""})} 
              />
              <FormInput 
                label="Giờ nhận" 
                type="time" 
                value={editingRental.start_time} 
                onChange={(v: string) => setEditingRental({...editingRental, start_time: v})} 
              />
              <FormInput 
                label="Ngày trả" 
                type="date" 
                value={editingRental.end_date} 
                onChange={(v: string) => setEditingRental({...editingRental, end_date: v, custom_total: ""})} 
              />
              <FormInput 
                label="Giờ trả" 
                type="time" 
                value={editingRental.end_time} 
                onChange={(v: string) => setEditingRental({...editingRental, end_time: v})} 
              />
            </div>
            
            <SelectInput 
              label="Loại thuê" 
              value={editingRental.rental_type} 
              onChange={(v: string) => setEditingRental({...editingRental, rental_type: v, custom_total: ""})} 
              options={[{ value: "day", label: "Ngày" }, { value: "week", label: "Tuần" }, { value: "month", label: "Tháng" }]} 
            />

            {editBasePrice > 0 && (
              <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border-2 border-green-300">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-700 font-semibold">💰 Giá tự động tính:</span>
                  <span className="text-2xl font-bold text-green-600">{formatNumber(editBasePrice)}đ</span>
                </div>
                <p className="text-xs text-gray-600">
                  {Math.ceil((new Date(editingRental.end_date).getTime() - new Date(editingRental.start_date).getTime()) / 86400000)} ngày 
                  × {editingRental.rental_type === "day" ? "ngày" : editingRental.rental_type === "week" ? "tuần" : "tháng"}
                </p>
                
                <div className="mt-3 pt-3 border-t border-green-200">
                  <FormInput 
                    label="Hoặc nhập giá tùy chỉnh (để trống = dùng giá tự động)" 
                    type="number" 
                    value={editingRental.custom_total} 
                    onChange={(v: string) => setEditingRental({...editingRental, custom_total: v})} 
                    placeholder={formatNumber(editBasePrice)}
                  />
                </div>
              </div>
            )}

            <div className="p-3 bg-blue-50 rounded-xl">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">Tổng tiền cuối cùng:</span>
                <span className="text-xl font-bold text-blue-600">
                  {formatNumber(editingRental.custom_total ? parseInt(editingRental.custom_total) : editBasePrice)}đ
                </span>
              </div>
              {editingRental.custom_total && parseInt(editingRental.custom_total) !== editBasePrice && (
                <p className="text-xs text-orange-600 mt-1">
                  {parseInt(editingRental.custom_total) > editBasePrice ? "↑" : "↓"} 
                  {" "}Chênh lệch: {formatNumber(Math.abs(parseInt(editingRental.custom_total) - editBasePrice))}đ
                </p>
              )}
            </div>

            <FormInput 
              label="Tiền cọc đã nhận" 
              type="number" 
              value={editingRental.deposit} 
              onChange={(v: string) => setEditingRental({...editingRental, deposit: v})} 
            />
            <FormInput 
              label="Địa điểm nhận" 
              value={editingRental.pickup_location} 
              onChange={(v: string) => setEditingRental({...editingRental, pickup_location: v})} 
            />
            <FormInput 
              label="Ghi chú" 
              value={editingRental.notes || ""} 
              onChange={(v: string) => setEditingRental({...editingRental, notes: v})} 
              textarea 
            />
            
            <div className="flex gap-2 pt-2">
              <button 
                onClick={updateRental} 
                className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl font-medium hover:bg-blue-700 flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />Lưu thay đổi
              </button>
              <button 
                onClick={() => setEditingRental(null)} 
                className="flex-1 bg-gray-200 py-2.5 rounded-xl"
              >
                Hủy
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal Trả Xe */}
{returnModal && (
  <Modal onClose={() => setReturnModal(null)} title="Trả xe">
    <div className="space-y-3">
      <div className="p-3 bg-blue-50 rounded-xl text-sm space-y-1">
        <div className="flex justify-between">
          <span className="text-gray-500">Xe:</span>
          <span className="font-medium">{vehicleName(returnModal.vehicle_id)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Khách:</span>
          <span className="font-medium">{customerName(returnModal.customer_id)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">ODO nhận:</span>
          <span className="font-medium">{formatNumber(returnModal.odo_start)} km</span>
        </div>
        <div className="flex justify-between pt-2 border-t border-blue-200">
          <span className="text-gray-500">Tổng hợp đồng:</span>
          <span className="font-bold text-blue-600">{formatNumber(returnModal.total)}đ</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Đã cọc:</span>
          <span className="font-bold text-green-600">-{formatNumber(returnModal.deposit)}đ</span>
        </div>
      </div>

      <FormInput 
        label={"ODO trả (≥ " + formatNumber(returnModal.odo_start) + " km)"} 
        type="number" 
        value={returnForm.odo_end} 
        onChange={(v: string) => setReturnForm({ ...returnForm, odo_end: v })} 
      />
      
      <FormInput 
        label="Phụ thu (nếu có)" 
        type="number" 
        value={returnForm.surcharge} 
        onChange={(v: string) => setReturnForm({ ...returnForm, surcharge: v })} 
        placeholder="0"
      />
      
      {parseInt(returnForm.surcharge) > 0 && (
        <FormInput 
          label="Lý do phụ thu" 
          value={returnForm.surcharge_note} 
          onChange={(v: string) => setReturnForm({ ...returnForm, surcharge_note: v })} 
          placeholder="VD: Vệ sinh xe, trả trễ..."
        />
      )}

      {/* TÍNH TOÁN TỰ ĐỘNG */}
      <div className="p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl border-2 border-orange-300">
        <h4 className="font-semibold text-sm mb-3 text-gray-700">💰 Tính toán thanh toán:</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Tổng hợp đồng:</span>
            <span className="font-medium">{formatNumber(returnModal.total)}đ</span>
          </div>
          <div className="flex justify-between text-green-600">
            <span>Đã cọc:</span>
            <span className="font-medium">-{formatNumber(returnModal.deposit)}đ</span>
          </div>
          {parseInt(returnForm.surcharge) > 0 && (
            <div className="flex justify-between text-orange-600">
              <span>Phụ thu:</span>
              <span className="font-medium">+{formatNumber(parseInt(returnForm.surcharge))}đ</span>
            </div>
          )}
          <div className="flex justify-between pt-2 border-t-2 border-orange-300 text-lg">
            <span className="font-bold">Còn phải thu:</span>
            <span className="font-bold text-orange-600">
              {formatNumber(returnModal.total - returnModal.deposit + (parseInt(returnForm.surcharge) || 0))}đ
            </span>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <button 
          onClick={doReturn} 
          className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl font-medium hover:bg-blue-700 flex items-center justify-center gap-2"
        >
          <CheckCircle className="w-4 h-4" />Xác nhận trả xe
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

// ===== CUSTOMERS TAB =====
function CustomersTab({ customers, setCustomers, rentals, vehicleName, notify, canWrite }: any) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showAdd, setShowAdd] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [editingCustomer, setEditingCustomer] = useState<any>(null);
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

  const updateCustomer = () => {
    const e: any = {};
    if (!editingCustomer.name.trim()) e.name = "Bắt buộc";
    if (!editingCustomer.phone) e.phone = "Bắt buộc";
    else if (!/^0\d{9}$/.test(editingCustomer.phone)) e.phone = "10 số, bắt đầu bằng 0";
    else if (customers.some((c: any) => c.phone === editingCustomer.phone && c.id !== editingCustomer.id)) e.phone = "Đã tồn tại";
    if (editingCustomer.id_card && !/^\d{9}$|^\d{12}$/.test(editingCustomer.id_card)) e.id_card = "9 hoặc 12 số";
    setErrors(e);
    if (Object.keys(e).length) return;

    const updates = {
      name: editingCustomer.name,
      phone: editingCustomer.phone,
      address: editingCustomer.address,
      id_card: editingCustomer.id_card,
      license: editingCustomer.license
    };

    dbUpdate('customers', editingCustomer.id, updates, (uc: any) => {
      if (uc) {
        setCustomers((prev: any) => prev.map((c: any) => c.id === editingCustomer.id ? { ...c, ...uc } : c));
        setEditingCustomer(null);
        setErrors({});
        notify("✅ Cập nhật KH thành công!");
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
          {canWrite("customers") && (
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
              className="bg-white rounded-xl shadow-sm border p-4 hover:shadow-md transition"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold shrink-0">
                  {c.name[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-sm truncate">{c.name}</h3>
                  <p className="text-xs text-gray-500">{c.phone}</p>
                </div>
              </div>
              <div className="flex justify-between py-0.5 text-sm">
                <span className="text-gray-500">Hợp đồng:</span>
                <span className="font-medium">{customerRentals.length}</span>
              </div>
              <div className="flex justify-between py-0.5 text-sm mb-3">
                <span className="text-gray-500">Chi tiêu:</span>
                <span className="font-medium text-green-600">{formatNumber(spent)}đ</span>
              </div>
              
              <div className="flex gap-2 pt-2 border-t">
                <button 
                  onClick={() => setSelectedCustomer(c)}
                  className="flex-1 bg-blue-100 text-blue-700 py-1.5 rounded text-xs hover:bg-blue-200 flex items-center justify-center gap-1"
                >
                  <Eye className="w-3 h-3" />Xem
                </button>
                {canWrite("customers") && (
                  <button 
                    onClick={() => setEditingCustomer(c)}
                    className="flex-1 bg-green-100 text-green-700 py-1.5 rounded text-xs hover:bg-green-200 flex items-center justify-center gap-1"
                  >
                    <Edit className="w-3 h-3" />Sửa
                  </button>
                )}
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

      {editingCustomer && (
        <Modal onClose={() => { setEditingCustomer(null); setErrors({}); }} title="Sửa thông tin khách hàng">
          <div className="space-y-3">
            <FormInput label="Họ tên *" value={editingCustomer.name} onChange={(v: string) => setEditingCustomer({ ...editingCustomer, name: v })} error={errors.name} />
            <FormInput label="SĐT *" value={editingCustomer.phone} onChange={(v: string) => setEditingCustomer({ ...editingCustomer, phone: v.replace(/\D/g, "") })} error={errors.phone} />
            <FormInput label="Địa chỉ" value={editingCustomer.address} onChange={(v: string) => setEditingCustomer({ ...editingCustomer, address: v })} />
            <FormInput label="CMND/CCCD" value={editingCustomer.id_card} onChange={(v: string) => setEditingCustomer({ ...editingCustomer, id_card: v.replace(/\D/g, "") })} error={errors.id_card} />
            <FormInput label="Bằng lái" value={editingCustomer.license} onChange={(v: string) => setEditingCustomer({ ...editingCustomer, license: v })} />
            
            <div className="flex gap-2 pt-2">
              <button 
                onClick={updateCustomer} 
                className="flex-1 bg-green-600 text-white py-2.5 rounded-xl font-medium hover:bg-green-700 flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />Lưu thay đổi
              </button>
              <button 
                onClick={() => { setEditingCustomer(null); setErrors({}); }} 
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

// ===== EXPENSES TAB =====
function ExpensesTab({ expenses, setExpenses, vehicles, notify, vMap, vehicleName, canWrite }: any) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [page, setPage] = useState(1);
  const [showAdd, setShowAdd] = useState(false);
  const emptyForm = { vehicle_id: "", type: "fuel", amount: "", date: todayString(), description: "" };
  const [form, setForm] = useState<any>({ ...emptyForm });
  const [errors, setErrors] = useState<any>({});

  const addExpense = () => {
    const e: any = {};
    if (!form.vehicle_id) e.vehicle_id = "Chọn xe";
    if (!form.amount || parseInt(form.amount) <= 0) e.amount = "> 0";
    if (!form.date) e.date = "Chọn ngày";
    setErrors(e);
    if (Object.keys(e).length) return;

    const newExp = {
      vehicle_id: form.vehicle_id,
      type: form.type,
      amount: parseInt(form.amount),
      date: form.date,
      description: form.description
    };

    dbInsert('expenses', newExp, (ne: any) => {
      if (ne) {
        setExpenses((prev: any) => [ne, ...prev]);
        setForm({ ...emptyForm });
        setShowAdd(false);
        setErrors({});
        notify("✅ Thêm chi phí thành công!");
      }
    });
  };

  const deleteExpense = (id: string) => {
    dbDelete('expenses', id, (ok: boolean) => {
      if (ok) {
        setExpenses((prev: any) => prev.filter((e: any) => e.id !== id));
        notify("✅ Đã xóa chi phí!");
      }
    });
  };

  const filtered = expenses.filter((e: any) => {
    if (typeFilter && e.type !== typeFilter) return false;
    if (!search) return true;
    const s = search.toLowerCase();
    return vehicleName(e.vehicle_id).toLowerCase().includes(s);
  }).sort((a: any, b: any) => (b.date || "").localeCompare(a.date || ""));

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const vehicleOptions = vehicles.map((v: any) => ({ value: v.id, label: v.name + " — " + v.plate }));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-between items-center gap-2">
        <h2 className="text-xl font-bold">Chi phí ({expenses.length})</h2>
        <div className="flex gap-2 items-center flex-wrap">
          <select 
            value={typeFilter} 
            onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }} 
            className="px-3 py-2 border rounded-lg text-sm"
          >
            <option value="">Tất cả</option>
            {EXP_OPTIONS.map((o: any) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-gray-400" />
            <input 
              value={search} 
              onChange={(e) => { setSearch(e.target.value); setPage(1); }} 
              placeholder="Tìm xe..." 
              className="pl-8 pr-3 py-2 border rounded-lg text-sm w-36" 
            />
          </div>
          {canWrite("expenses") && (
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
            <SelectInput label="Loại" value={form.type} onChange={(v: string) => setForm({ ...form, type: v })} options={EXP_OPTIONS} />
            <FormInput label="Số tiền *" type="number" value={form.amount} onChange={(v: string) => setForm({ ...form, amount: v })} error={errors.amount} />
            <FormInput label="Ngày *" type="date" value={form.date} onChange={(v: string) => setForm({ ...form, date: v })} error={errors.date} />
            <div className="sm:col-span-2">
              <FormInput label="Mô tả" value={form.description} onChange={(v: string) => setForm({ ...form, description: v })} />
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={addExpense} className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 flex items-center gap-1.5">
              <Save className="w-4 h-4" />Lưu
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
                <th className="px-3 py-2.5 text-left">Ngày</th>
                <th className="px-3 py-2.5 text-left">Xe</th>
                <th className="px-3 py-2.5 text-left">Loại</th>
                <th className="px-3 py-2.5 text-left">Mô tả</th>
                <th className="px-3 py-2.5 text-right">Tiền</th>
                {canWrite("expenses") && <th className="px-3 py-2.5"></th>}
              </tr>
            </thead>
            <tbody className="divide-y">
              {paginated.map((e: any) => (
                <tr key={e.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2.5">{formatDate(e.date)}</td>
                  <td className="px-3 py-2.5">{vehicleName(e.vehicle_id)}</td>
                  <td className="px-3 py-2.5">
                    <Badge color="blue">{EXP_LABELS[e.type]}</Badge>
                  </td>
                  <td className="px-3 py-2.5 text-gray-600">{e.description || "—"}</td>
                  <td className="px-3 py-2.5 text-right font-semibold text-red-600">
                    {formatNumber(e.amount)}đ
                  </td>
                  {canWrite("expenses") && (
                    <td className="px-3 py-2.5">
                      <button 
                        onClick={() => deleteExpense(e.id)} 
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {paginated.length === 0 && <p className="text-center py-8 text-gray-400 text-sm">Không có</p>}
      </div>

      <Pagination page={page} total={filtered.length} onChange={setPage} />
    </div>
  );
}

// ===== CALENDAR & PUBLIC BOOKING =====
function CalendarTab({ vehicles, rentals, vMap }: any) {
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [showLink, setShowLink] = useState(false);

  const year = selectedMonth.getFullYear();
  const month = selectedMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setSelectedMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setSelectedMonth(new Date(year, month + 1, 1));

  const getVehicleStatus = (vehicleId: string, dateStr: string) => {
  const rental = rentals.find((r: any) => {
    const start = new Date(r.start_date);
    const end = new Date(r.end_date);
    const check = new Date(dateStr);
    return r.vehicle_id === vehicleId && r.status === "active" && check >= start && check <= end;
  });

  if (!rental) return { status: "available", time: null };
  
  const checkDate = new Date(dateStr);
  const endDate = new Date(rental.end_date); // ← SỬA: rental.end_date thay vì rental.endDate
  
  if (checkDate.toDateString() === endDate.toDateString()) {
    return { status: "rented", time: rental.end_time };
  }
  
  return { status: "rented", time: null };
};

  const generateBookingLink = () => {
    const url = window.location.origin + window.location.pathname + "?view=booking";
    navigator.clipboard.writeText(url);
    setShowLink(true);
    setTimeout(() => setShowLink(false), 2000);
  };

  const monthName = selectedMonth.toLocaleDateString("vi-VN", { month: "long", year: "numeric" });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Lịch xe - {monthName}</h2>
        <div className="flex gap-2">
          <button 
            onClick={generateBookingLink} 
            className="bg-blue-600 text-white px-3 py-2 rounded-lg flex items-center gap-1.5 hover:bg-blue-700 text-sm"
          >
            <LinkIcon className="w-4 h-4" />Tạo link gửi khách
          </button>
          <button onClick={prevMonth} className="px-3 py-2 border rounded-lg hover:bg-gray-50">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={nextMonth} className="px-3 py-2 border rounded-lg hover:bg-gray-50">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {showLink && (
        <div className="bg-green-100 border border-green-400 text-green-800 px-4 py-3 rounded-lg">
          ✅ Đã copy link booking vào clipboard!
        </div>
      )}

      <div className="space-y-6">
        {vehicles.filter((v: any) => v.status !== "maintenance").map((vehicle: any) => (
          <div key={vehicle.id} className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl">{vehicle.image}</span>
              <div>
                <h3 className="font-semibold text-lg">{vehicle.name}</h3>
                <p className="text-sm text-gray-600">{vehicle.plate} • {vehicle.type}</p>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2">
              {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map(day => (
                <div key={day} className="text-center font-semibold text-sm text-gray-600 py-2">
                  {day}
                </div>
              ))}
              
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`}></div>
              ))}
              
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const date = i + 1;
                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
                const vehicleStatus = getVehicleStatus(vehicle.id, dateStr);
                const isToday = new Date().toDateString() === new Date(dateStr).toDateString();
                
                return (
                  <div key={date} className={`border-2 rounded-lg p-2 min-h-[70px] ${
                    isToday ? 'border-blue-600' : 'border-gray-200'
                  } ${
                    vehicleStatus.status === 'available' ? 'bg-green-50' : 'bg-red-50'
                  }`}>
                    <p className="text-sm font-semibold mb-1">{date}</p>
                    <p className={`text-xs ${vehicleStatus.status === 'available' ? 'text-green-700' : 'text-red-700'}`}>
                      {vehicleStatus.status === 'available' ? '✅ Trống' : '🔄 Thuê'}
                    </p>
                    {vehicleStatus.time && (
                      <p className="text-xs text-orange-600 font-semibold mt-1">
                        {vehicleStatus.time}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PublicBookingView({ vehicles, rentals }: any) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const contactPhone = "0819546586";
  const contactName = "AutoRent Pro";

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

  const getVehicleStatus = (vehicleId: string, dateStr: string) => {
    const rental = rentals.find((r: any) => {
      const start = new Date(r.start_date);
      const end = new Date(r.end_date);
      const check = new Date(dateStr);
      return r.vehicle_id === vehicleId && r.status === "active" && check >= start && check <= end;
    });

    if (!rental) return { status: "available", time: null };
    
    const checkDate = new Date(dateStr);
    const endDate = new Date(rental.end_date);
    
    if (checkDate.toDateString() === endDate.toDateString()) {
      return { status: "rented", time: rental.end_time };
    }
    
    return { status: "rented", time: null };
  };

  const handleDateClick = (vehicle: any, dateStr: string, status: string) => {
    if (status === "available") {
      const msg = `Xin chào! Tôi muốn đặt xe ${vehicle.name} (${vehicle.plate}) vào ngày ${formatDate(dateStr)}`;
      window.open(`https://zalo.me/${contactPhone}?text=${encodeURIComponent(msg)}`, "_blank");
    }
  };

  const monthName = currentMonth.toLocaleDateString("vi-VN", { month: "long", year: "numeric" });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header - Mobile Optimized */}
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-6 sm:py-12">
        <div className="max-w-7xl mx-auto px-3 sm:px-4">
          <div className="flex items-center gap-2 sm:gap-4">
            <Car className="w-8 h-8 sm:w-12 sm:h-12 flex-shrink-0" />
            <div>
              <h1 className="text-xl sm:text-4xl font-bold mb-1 sm:mb-2">🚗 {contactName}</h1>
              <p className="text-blue-100 text-xs sm:text-lg">Chọn ngày trống để đặt xe</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Month Navigation - Mobile Optimized */}
        <div className="flex items-center justify-center gap-2 sm:gap-4 mb-4 sm:mb-8 bg-white rounded-xl shadow-lg p-3 sm:p-4">
          <button onClick={prevMonth} className="p-2 sm:p-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition">
            <ChevronLeft className="w-4 h-4 sm:w-6 sm:h-6" />
          </button>
          <h2 className="text-lg sm:text-3xl font-bold text-gray-800">{monthName}</h2>
          <button onClick={nextMonth} className="p-2 sm:p-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition">
            <ChevronRight className="w-4 h-4 sm:w-6 sm:h-6" />
          </button>
        </div>

        <div className="space-y-4 sm:space-y-8">
          {vehicles.filter((v: any) => v.status !== "maintenance").map((vehicle: any) => (
            <div key={vehicle.id} className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-3 sm:p-8 hover:shadow-2xl transition">
              {/* Vehicle Header - Mobile Optimized */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 pb-4 sm:pb-6 border-b-2 border-gray-100 gap-3">
                <div className="flex items-center gap-2 sm:gap-4">
                  <span className="text-3xl sm:text-6xl">{vehicle.image}</span>
                  <div>
                    <h3 className="text-lg sm:text-3xl font-bold text-gray-800">{vehicle.name}</h3>
                    <p className="text-xs sm:text-lg text-gray-600">{vehicle.plate} • {vehicle.seats} chỗ</p>
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-xs sm:text-sm text-gray-600 mb-1">Giá từ</p>
                  <p className="text-xl sm:text-3xl font-bold text-blue-600">{formatNumber(vehicle.price_day)}đ/ngày</p>
                </div>
              </div>

              {/* Calendar Grid - Mobile Optimized */}
              <div className="grid grid-cols-7 gap-1 sm:gap-3">
                {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map(day => (
                  <div key={day} className="text-center font-bold text-gray-700 py-1 sm:py-3 text-xs sm:text-lg">
                    {day}
                  </div>
                ))}
                
                {Array.from({ length: firstDay }).map((_, i) => (
                  <div key={`empty-${i}`}></div>
                ))}
                
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const date = i + 1;
                  const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
                  const vehicleStatus = getVehicleStatus(vehicle.id, dateStr);
                  const isToday = new Date().toDateString() === new Date(dateStr).toDateString();
                  const isPast = new Date(dateStr) < new Date(new Date().setHours(0, 0, 0, 0));
                  
                  return (
                    <button
                      key={date}
                      onClick={() => !isPast && vehicleStatus.status === 'available' && handleDateClick(vehicle, dateStr, vehicleStatus.status)}
                      disabled={vehicleStatus.status === 'rented' || isPast}
                      className={`border-2 rounded-lg sm:rounded-xl p-1 sm:p-4 min-h-[60px] sm:min-h-[110px] transition-all ${
                        isToday ? 'border-blue-600 border-2 sm:border-4' : 'border-gray-200'
                      } ${
                        isPast ? 'bg-gray-100 cursor-not-allowed opacity-50' :
                        vehicleStatus.status === 'available' ? 'bg-green-50 hover:bg-green-100 active:scale-95 cursor-pointer shadow-sm hover:shadow-xl' : 
                        'bg-red-50 cursor-not-allowed'
                      }`}
                    >
                      <p className="text-sm sm:text-2xl font-bold mb-0 sm:mb-2 text-gray-800">{date}</p>
                      <p className={`text-[8px] sm:text-sm font-bold ${
                        isPast ? 'text-gray-500' :
                        vehicleStatus.status === 'available' ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {isPast ? '⏮️' : vehicleStatus.status === 'available' ? '✅' : '🔄'}
                      </p>
                      {vehicleStatus.time && !isPast && (
                        <p className="text-[8px] sm:text-xs text-orange-600 font-bold mt-0 sm:mt-1">
                          {vehicleStatus.time}
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Price Info - Mobile Optimized */}
              <div className="mt-3 sm:mt-6 p-2 sm:p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg sm:rounded-xl border-2 border-blue-200">
                <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
                  <div>
                    <p className="text-[10px] sm:text-sm text-gray-600">Giá/ngày</p>
                    <p className="text-sm sm:text-xl font-bold text-blue-600">{formatNumber(vehicle.price_day)}đ</p>
                  </div>
                  <div>
                    <p className="text-[10px] sm:text-sm text-gray-600">Giá/tuần</p>
                    <p className="text-sm sm:text-xl font-bold text-green-600">{formatNumber(vehicle.price_week)}đ</p>
                  </div>
                  <div>
                    <p className="text-[10px] sm:text-sm text-gray-600">Giá/tháng</p>
                    <p className="text-sm sm:text-xl font-bold text-purple-600">{formatNumber(vehicle.price_month)}đ</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer - Mobile Optimized */}
      <footer className="bg-gray-800 text-white py-4 sm:py-8 mt-8 sm:mt-16">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 text-center">
          <p className="text-sm sm:text-lg font-semibold mb-1 sm:mb-2">🚗 {contactName}</p>
          <p className="text-xs sm:text-base text-gray-400">📞 {contactPhone}</p>
        </div>
      </footer>
    </div>
  );
}

// ===== MAIN APP =====
export default function App() {
  const [user, setUser] = useState<any>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [tab, setTab] = useState("dashboard");
  const [vehicles, setVehicles] = useState<any>([]);
  const [rentals, setRentals] = useState<any>([]);
  const [customers, setCustomers] = useState<any>([]);
  const [expenses, setExpenses] = useState<any>([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<any>(null);
  const [dateRange, setDateRange] = useState({ from: "", to: "" });

  const notify = (msg: string, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Check public booking view
  const urlParams = new URLSearchParams(window.location.search);
  const isPublicBooking = urlParams.get("view") === "booking";

  // Load session
  useEffect(() => {
    const savedUser = localStorage.getItem("autorent_user");
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  // Load data
  useEffect(() => {
    if (!user && !isPublicBooking) return;
    setLoading(true);
    Promise.all([
      new Promise((res) => dbLoad('vehicles', res)),
      new Promise((res) => dbLoad('rentals', res)),
      new Promise((res) => dbLoad('customers', res)),
      new Promise((res) => dbLoad('expenses', res))
    ]).then(([v, r, c, e]) => {
      setVehicles(v);
      setRentals(r);
      setCustomers(c);
      setExpenses(e);
      setLoading(false);
    });
  }, [user, isPublicBooking]);

  const login = () => {
    const foundUser = DEMO_USERS.find((u) => u.username === username);
    if (!foundUser || DEMO_PASSWORDS[username] !== password) {
      notify("❌ Sai thông tin đăng nhập!", "error");
      return;
    }
    setUser(foundUser);
    localStorage.setItem("autorent_user", JSON.stringify(foundUser));
    notify("✅ Đăng nhập thành công!");
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("autorent_user");
    setTab("dashboard");
  };

  const canView = (t: string) => PERMISSIONS[user?.role]?.includes(t);
  const canWrite = (resource: string) => WRITE_PERMS[resource]?.includes(user?.role);

  const vMap = useMemo(() => {
    const map: any = {};
    vehicles.forEach((v: any) => { map[v.id] = v; });
    return map;
  }, [vehicles]);

  const customerName = useCallback((id: string) => customers.find((c: any) => c.id === id)?.name || "—", [customers]);
  const vehicleName = useCallback((id: string) => vMap[id]?.name || "—", [vMap]);
  const vehiclePlate = useCallback((id: string) => vMap[id]?.plate || "—", [vMap]);

  // ⚠️ CHECK OVERLAP FUNCTION - KHÔNG CHO ĐẶT TRÙNG LỊCH
  const checkOverlap = useCallback((vehicleId: string, startDate: string, endDate: string, excludeId?: string) => {
    return rentals.some((r: any) => {
      if (r.vehicle_id !== vehicleId) return false;
      if (r.status !== "active") return false;
      if (excludeId && r.id === excludeId) return false; // Bỏ qua chính hợp đồng đang sửa
      
      // Check overlap
      return !(endDate < r.start_date || startDate > r.end_date);
    });
  }, [rentals]);

  if (isPublicBooking) {
    return <PublicBookingView vehicles={vehicles} rentals={rentals} />;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <h1 className="text-3xl font-bold text-center mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            AutoRent Pro
          </h1>
          <div className="space-y-4">
            <FormInput label="Tài khoản" value={username} onChange={setUsername} placeholder="admin" />
            <FormInput label="Mật khẩu" type="password" value={password} onChange={setPassword} placeholder="admin123" />
            <button 
              onClick={login} 
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-600"
            >
              Đăng nhập
            </button>
          </div>
          <div className="mt-6 text-sm text-gray-500 space-y-1">
            <p>Demo: admin/admin123</p>
            <p>Nhân viên: nhanvien1/staff123</p>
            <p>Đối tác: doitac1/partner123</p>
          </div>
        </div>
      </div>
    );
  }

  const roleLabel = user.role === "admin" ? "Admin" : user.role === "staff" ? "Nhân viên" : "Đối tác";

  return (
    <div className="min-h-screen bg-gray-50">
      <Toast toast={toast} />
      {loading && <Spinner />}

      <nav className="bg-white shadow-sm border-b sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Car className="w-6 h-6 text-blue-600" />
            <h1 className="text-xl font-bold">AutoRent Pro</h1>
            <Badge color="blue">{roleLabel}</Badge>
          </div>
          <button 
            onClick={logout} 
            className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition"
          >
            <LogOut className="w-5 h-5" />
            <span className="hidden sm:inline">Đăng xuất</span>
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {canView("dashboard") && (
            <button onClick={() => setTab("dashboard")} className={`px-4 py-2 rounded-lg flex items-center gap-2 whitespace-nowrap ${tab === "dashboard" ? "bg-blue-600 text-white" : "bg-white"}`}>
              <LayoutDashboard className="w-4 h-4" />Dashboard
            </button>
          )}
          {canView("vehicles") && (
            <button onClick={() => setTab("vehicles")} className={`px-4 py-2 rounded-lg flex items-center gap-2 whitespace-nowrap ${tab === "vehicles" ? "bg-blue-600 text-white" : "bg-white"}`}>
              <Car className="w-4 h-4" />Xe
            </button>
          )}
          {canView("rentals") && (
            <button onClick={() => setTab("rentals")} className={`px-4 py-2 rounded-lg flex items-center gap-2 whitespace-nowrap ${tab === "rentals" ? "bg-blue-600 text-white" : "bg-white"}`}>
              <DollarSign className="w-4 h-4" />Hợp đồng
            </button>
          )}
          {canView("customers") && (
            <button onClick={() => setTab("customers")} className={`px-4 py-2 rounded-lg flex items-center gap-2 whitespace-nowrap ${tab === "customers" ? "bg-blue-600 text-white" : "bg-white"}`}>
              <Users className="w-4 h-4" />Khách hàng
            </button>
          )}
          {canView("expenses") && (
            <button onClick={() => setTab("expenses")} className={`px-4 py-2 rounded-lg flex items-center gap-2 whitespace-nowrap ${tab === "expenses" ? "bg-blue-600 text-white" : "bg-white"}`}>
              <Wrench className="w-4 h-4" />Chi phí
            </button>
          )}
          {canView("calendar") && (
            <button onClick={() => setTab("calendar")} className={`px-4 py-2 rounded-lg flex items-center gap-2 whitespace-nowrap ${tab === "calendar" ? "bg-blue-600 text-white" : "bg-white"}`}>
              <Calendar className="w-4 h-4" />Lịch
            </button>
          )}
        </div>

        {tab === "dashboard" && <DashboardTab rentals={rentals} expenses={expenses} vehicles={vehicles} customerName={customerName} vehicleName={vehicleName} dateRange={dateRange} setDateRange={setDateRange} />}
        {tab === "vehicles" && <VehiclesTab vehicles={vehicles} setVehicles={setVehicles} rentals={rentals} notify={notify} setLoading={setLoading} canWrite={canWrite} />}
        {tab === "rentals" && <RentalsTab rentals={rentals} vehicles={vehicles} setVehicles={setVehicles} setRentals={setRentals} customers={customers} checkOverlap={checkOverlap} notify={notify} setLoading={setLoading} customerName={customerName} vehicleName={vehicleName} vehiclePlate={vehiclePlate} vMap={vMap} canWrite={canWrite} />}
        {tab === "customers" && <CustomersTab customers={customers} setCustomers={setCustomers} rentals={rentals} vehicleName={vehicleName} notify={notify} canWrite={canWrite} />}
        {tab === "expenses" && <ExpensesTab expenses={expenses} setExpenses={setExpenses} vehicles={vehicles} notify={notify} vMap={vMap} vehicleName={vehicleName} canWrite={canWrite} />}
        {tab === "calendar" && <CalendarTab vehicles={vehicles} rentals={rentals} vMap={vMap} />}
      </div>
    </div>
  );
}
