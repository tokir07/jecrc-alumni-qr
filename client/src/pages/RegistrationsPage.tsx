import React, { useState, useEffect, useCallback } from 'react';
import { adminService, RegistrationFilterParams } from '../services/admin.service';
import { authService } from '../services/auth.service';
import { RegistrationListItem, Pagination, User } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import {
  Search,
  Download,
  Filter,
  Eye,
  Edit2,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  X,
  UserPlus,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  SlidersHorizontal,
  Building,
  GraduationCap,
  Calendar,
  Phone,
  Mail,
  MapPin,
} from 'lucide-react';
import { useLocation } from 'react-router-dom';

export const RegistrationsPage: React.FC = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialSearch = searchParams.get('search') || '';
  const initialBranch = searchParams.get('branch') || 'ALL';

  const [registrations, setRegistrations] = useState<RegistrationListItem[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 15,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState(initialSearch);
  const [graduationYear, setGraduationYear] = useState<string>('');
  const [branch, setBranch] = useState<string>(initialBranch);
  const [status, setStatus] = useState<'ALL' | 'CHECKED_IN' | 'PENDING'>('ALL');

  // Modals state
  const [selectedAlumni, setSelectedAlumni] = useState<any | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingAlumni, setEditingAlumni] = useState<any | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Volunteer modal state
  const [isVolunteerModalOpen, setIsVolunteerModalOpen] = useState(false);
  const [volunteers, setVolunteers] = useState<User[]>([]);
  const [newVolunteerUsername, setNewVolunteerUsername] = useState('');
  const [newVolunteerPassword, setNewVolunteerPassword] = useState('');
  const [volunteerMsg, setVolunteerMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchRegistrations = useCallback(
    async (pageToLoad = 1) => {
      setLoading(true);
      try {
        const params: RegistrationFilterParams = {
          page: pageToLoad,
          limit: 15,
          search: search.trim() || undefined,
          graduationYear: graduationYear ? parseInt(graduationYear, 10) : undefined,
          branch: branch !== 'ALL' ? branch : undefined,
          status,
        };

        const res = await adminService.getRegistrations(params);
        setRegistrations(res.data);
        setPagination(res.pagination);
      } catch (err) {
        console.error('Error fetching registrations:', err);
      } finally {
        setLoading(false);
      }
    },
    [search, graduationYear, branch, status]
  );

  useEffect(() => {
    fetchRegistrations(1);
  }, [fetchRegistrations]);

  const handleExportCsv = async () => {
    try {
      await adminService.downloadExportCsv();
    } catch {
      alert('Failed to download CSV export. Please try again.');
    }
  };

  const openViewModal = async (id: string) => {
    try {
      const details = await adminService.getRegistrationDetails(id);
      setSelectedAlumni(details);
      setIsViewModalOpen(true);
    } catch {
      alert('Could not fetch registration details');
    }
  };

  const openEditModal = (item: RegistrationListItem) => {
    setEditingAlumni(item);
    setEditForm({
      fullName: item.fullName,
      email: item.email,
      mobile: item.mobile,
      currentCity: item.currentCity === '-' ? '' : item.currentCity,
      graduationYear: item.graduationYear,
      course: item.course,
      branch: item.branch,
      companyName: item.companyName,
      designation: item.designation,
    });
    setEditError(null);
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAlumni) return;

    setEditLoading(true);
    setEditError(null);

    try {
      await adminService.updateRegistration(editingAlumni.id, editForm);
      setIsEditModalOpen(false);
      fetchRegistrations(pagination.page);
    } catch (err: any) {
      setEditError(err.response?.data?.error || 'Failed to update registration.');
    } finally {
      setEditLoading(false);
    }
  };

  const loadVolunteers = async () => {
    try {
      const list = await authService.getVolunteers();
      setVolunteers(list);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateVolunteer = async (e: React.FormEvent) => {
    e.preventDefault();
    setVolunteerMsg(null);
    try {
      await authService.createVolunteer(newVolunteerUsername, newVolunteerPassword);
      setVolunteerMsg({ type: 'success', text: `Volunteer "${newVolunteerUsername}" created successfully!` });
      setNewVolunteerUsername('');
      setNewVolunteerPassword('');
      loadVolunteers();
    } catch (err: any) {
      setVolunteerMsg({ type: 'error', text: err.response?.data?.error || 'Failed to create volunteer' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E7EB]">
        <div>
          <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1">
            JECRC UNIVERSITY • ALUMNI DIRECTORY
          </p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172033] tracking-tight">
            Alumni Registration <span className="text-[#E31827]">Records</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
            Total {pagination.total} registered alumni records with gate verification status
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => {
              loadVolunteers();
              setIsVolunteerModalOpen(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-white border border-[#E5E7EB] text-[#172033] hover:border-gray-300 hover:bg-gray-50 text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5 text-[#E31827]" />
            <span>Manage Volunteers</span>
          </button>

          <button
            onClick={handleExportCsv}
            className="px-3.5 py-2 rounded-xl bg-[#E31827] hover:bg-[#C81020] text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-white" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-xl p-4 border border-[#E5E7EB] shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search box */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, mobile, ID..."
              className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-[#E5E7EB] focus:border-[#E31827] focus:ring-1 focus:ring-[#E31827]/20 outline-none text-[#172033] bg-[#FAFAFB]"
            />
          </div>

          {/* Graduation Year Filter */}
          <div>
            <select
              value={graduationYear}
              onChange={(e) => setGraduationYear(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5E7EB] focus:border-[#E31827] outline-none bg-white text-[#172033]"
            >
              <option value="">All Batches</option>
              {Array.from({ length: 26 }, (_, i) => 2026 - i).map((y) => (
                <option key={y} value={y}>
                  Class of {y}
                </option>
              ))}
            </select>
          </div>

          {/* Branch Filter */}
          <div>
            <select
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5E7EB] focus:border-[#E31827] outline-none bg-white text-[#172033]"
            >
              <option value="ALL">All Branches</option>
              <option value="Computer Science & Engineering">CSE</option>
              <option value="Information Technology">IT</option>
              <option value="Electronics & Communication Engineering">ECE</option>
              <option value="Mechanical Engineering">Mechanical</option>
              <option value="Civil Engineering">Civil</option>
              <option value="School of Management">Management</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5E7EB] focus:border-[#E31827] outline-none bg-white text-[#172033]"
            >
              <option value="ALL">All Statuses</option>
              <option value="CHECKED_IN">Checked In</option>
              <option value="PENDING">Pending Entry</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Registrations Table */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAFAFB] text-[#64748B] uppercase text-[11px] font-bold tracking-wider border-b border-[#E5E7EB]">
              <tr>
                <th className="px-5 py-3">Registration ID</th>
                <th className="px-5 py-3">Full Name</th>
                <th className="px-5 py-3">Contact (Email & Phone)</th>
                <th className="px-5 py-3">Batch & Branch</th>
                <th className="px-5 py-3">Company & Designation</th>
                <th className="px-5 py-3">City</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB] text-[#172033]">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-gray-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#E31827]" />
                    <span>Loading alumni records...</span>
                  </td>
                </tr>
              ) : registrations.length > 0 ? (
                registrations.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-5 py-3.5 font-mono font-semibold text-[#172033] text-xs">
                      {item.registrationId}
                    </td>
                    <td className="px-5 py-3.5 font-bold text-[#172033]">
                      {item.fullName}
                    </td>
                    <td className="px-5 py-3.5 text-xs">
                      <div className="text-[#172033] font-medium">{item.email}</div>
                      <div className="text-[#64748B] font-mono text-[11px]">{item.mobile}</div>
                    </td>
                    <td className="px-5 py-3.5 text-xs">
                      <span className="font-semibold text-[#172033]">
                        Class of {item.graduationYear}
                      </span>
                      <span className="text-[#64748B] block text-[11px] truncate max-w-[150px]">
                        {item.branch}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs">
                      <div className="font-semibold text-[#172033]">{item.companyName}</div>
                      <div className="text-[#64748B] text-[11px]">{item.designation}</div>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-[#64748B]">
                      {item.currentCity}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge isCheckedIn={item.isCheckedIn} />
                      {item.isCheckedIn && item.checkedInAt && (
                        <span className="block text-[10px] text-[#64748B] mt-1 font-mono">
                          {item.checkedInAt}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right space-x-1 whitespace-nowrap">
                      <button
                        onClick={() => openViewModal(item.id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-[#172033] hover:bg-gray-100 transition-colors cursor-pointer"
                        title="View Full Profile"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openEditModal(item)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-[#E31827] hover:bg-red-50 transition-colors cursor-pointer"
                        title="Edit Registration"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-gray-400">
                    No alumni registrations matched your filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Server-Side Pagination Bar */}
        <div className="p-4 bg-[#FAFAFB] border-t border-[#E5E7EB] flex items-center justify-between text-xs text-[#64748B]">
          <div>
            Showing Page <span className="font-bold text-[#172033]">{pagination.page}</span> of{' '}
            <span className="font-bold text-[#172033]">{pagination.totalPages}</span> ({pagination.total} total alumni)
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchRegistrations(pagination.page - 1)}
              disabled={pagination.page <= 1 || loading}
              className="p-2 rounded-lg bg-white border border-[#E5E7EB] hover:bg-gray-100 disabled:opacity-40 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => fetchRegistrations(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages || loading}
              className="p-2 rounded-lg bg-white border border-[#E5E7EB] hover:bg-gray-100 disabled:opacity-40 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* VIEW DETAILS MODAL */}
      {isViewModalOpen && selectedAlumni && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-[#E5E7EB] shadow-modal overflow-hidden animate-fadeIn">
            <div className="p-6 border-b border-[#E5E7EB] flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#E31827] tracking-wider">
                  Verified Alumni Record
                </span>
                <h3 className="text-xl font-bold text-[#172033] mt-0.5">{selectedAlumni.fullName}</h3>
                <p className="font-mono text-xs text-[#64748B]">{selectedAlumni.registrationId}</p>
              </div>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-2 gap-3.5 pb-4 border-b border-gray-100">
                <div>
                  <p className="text-[#64748B] text-[11px] font-semibold">Email Address</p>
                  <p className="font-medium text-[#172033] mt-0.5">{selectedAlumni.email}</p>
                </div>
                <div>
                  <p className="text-[#64748B] text-[11px] font-semibold">Mobile Number</p>
                  <p className="font-mono font-medium text-[#172033] mt-0.5">{selectedAlumni.mobile}</p>
                </div>
                <div>
                  <p className="text-[#64748B] text-[11px] font-semibold">Graduation Batch & Course</p>
                  <p className="font-medium text-[#172033] mt-0.5">
                    Class of {selectedAlumni.graduationYear} ({selectedAlumni.course})
                  </p>
                </div>
                <div>
                  <p className="text-[#64748B] text-[11px] font-semibold">Branch</p>
                  <p className="font-medium text-[#172033] mt-0.5">{selectedAlumni.branch}</p>
                </div>
                <div>
                  <p className="text-[#64748B] text-[11px] font-semibold">Organization</p>
                  <p className="font-medium text-[#172033] mt-0.5">{selectedAlumni.companyName}</p>
                </div>
                <div>
                  <p className="text-[#64748B] text-[11px] font-semibold">Designation</p>
                  <p className="font-medium text-[#172033] mt-0.5">{selectedAlumni.designation}</p>
                </div>
                <div>
                  <p className="text-[#64748B] text-[11px] font-semibold">Current City</p>
                  <p className="font-medium text-[#172033] mt-0.5">{selectedAlumni.currentCity || '-'}</p>
                </div>
                <div>
                  <p className="text-[#64748B] text-[11px] font-semibold">Registration Date</p>
                  <p className="font-medium text-[#172033] mt-0.5">{selectedAlumni.createdAtFormatted}</p>
                </div>
              </div>

              {/* CheckIn Status Details */}
              <div className="p-4 rounded-xl bg-[#FAFAFB] border border-[#E5E7EB]">
                <p className="text-[11px] uppercase font-bold text-[#64748B] mb-2">
                  Gate Verification Status
                </p>
                {selectedAlumni.checkIn ? (
                  <div className="space-y-1 text-xs">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#EBF7F2] text-[#16845B]">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Checked In
                    </span>
                    <p className="mt-2 text-gray-700">
                      <strong>Check-in Time:</strong> {selectedAlumni.checkIn.checkedInAtFormatted}
                    </p>
                    <p className="text-gray-700">
                      <strong>Gate:</strong> {selectedAlumni.checkIn.gateName}
                    </p>
                    <p className="text-gray-700">
                      <strong>Verified By:</strong> {selectedAlumni.checkIn.checkedInBy}
                    </p>
                  </div>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#FFF6EA] text-[#D98A22]">
                    Pending Gate Arrival
                  </span>
                )}
              </div>
            </div>

            <div className="p-4 bg-[#FAFAFB] border-t border-[#E5E7EB] flex justify-end">
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-white border border-[#E5E7EB] hover:bg-gray-50 text-[#172033] font-semibold text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-[#E5E7EB] shadow-modal overflow-hidden animate-fadeIn">
            <div className="p-5 border-b border-[#E5E7EB] flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-[#172033]">Edit Alumni Record</h3>
                <p className="text-xs text-[#64748B] font-mono">{editingAlumni?.registrationId}</p>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4 text-xs">
              {editError && (
                <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs border border-red-200">
                  {editError}
                </div>
              )}

              <div>
                <label className="block text-[#172033] font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  value={editForm.fullName || ''}
                  onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-[#E5E7EB] text-xs focus:border-[#E31827] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#172033] font-semibold mb-1">Email</label>
                  <input
                    type="email"
                    value={editForm.email || ''}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-[#E5E7EB] text-xs focus:border-[#E31827] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#172033] font-semibold mb-1">Mobile</label>
                  <input
                    type="tel"
                    value={editForm.mobile || ''}
                    onChange={(e) => setEditForm({ ...editForm, mobile: e.target.value })}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-[#E5E7EB] text-xs focus:border-[#E31827] outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#172033] font-semibold mb-1">Graduation Year</label>
                  <input
                    type="number"
                    value={editForm.graduationYear || 2020}
                    onChange={(e) =>
                      setEditForm({ ...editForm, graduationYear: parseInt(e.target.value, 10) })
                    }
                    required
                    className="w-full px-3 py-2 rounded-xl border border-[#E5E7EB] text-xs focus:border-[#E31827] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#172033] font-semibold mb-1">Branch</label>
                  <input
                    type="text"
                    value={editForm.branch || ''}
                    onChange={(e) => setEditForm({ ...editForm, branch: e.target.value })}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-[#E5E7EB] text-xs focus:border-[#E31827] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#172033] font-semibold mb-1">Company</label>
                  <input
                    type="text"
                    value={editForm.companyName || ''}
                    onChange={(e) => setEditForm({ ...editForm, companyName: e.target.value })}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-[#E5E7EB] text-xs focus:border-[#E31827] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#172033] font-semibold mb-1">Designation</label>
                  <input
                    type="text"
                    value={editForm.designation || ''}
                    onChange={(e) => setEditForm({ ...editForm, designation: e.target.value })}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-[#E5E7EB] text-xs focus:border-[#E31827] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#172033] font-semibold mb-1">City</label>
                <input
                  type="text"
                  value={editForm.currentCity || ''}
                  onChange={(e) => setEditForm({ ...editForm, currentCity: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#E5E7EB] text-xs focus:border-[#E31827] outline-none"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-[#E5E7EB]">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#E5E7EB] text-[#64748B] hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="px-5 py-2 rounded-xl bg-[#E31827] hover:bg-[#C81020] text-white font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  {editLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VOLUNTEER MANAGEMENT MODAL */}
      {isVolunteerModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-[#E5E7EB] shadow-modal overflow-hidden animate-fadeIn">
            <div className="p-5 border-b border-[#E5E7EB] flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-[#172033]">Gate Volunteer Accounts</h3>
                <p className="text-xs text-[#64748B]">
                  Volunteers have restricted scanning permissions to verify QR entry passes
                </p>
              </div>
              <button
                onClick={() => setIsVolunteerModalOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Create Volunteer Form */}
              <form onSubmit={handleCreateVolunteer} className="p-4 rounded-xl bg-[#FAFAFB] border border-[#E5E7EB] space-y-3">
                <p className="text-xs font-bold text-[#172033] uppercase tracking-wider">
                  Add New Gate Volunteer
                </p>

                {volunteerMsg && (
                  <div
                    className={`p-2.5 rounded-lg text-xs font-medium ${
                      volunteerMsg.type === 'success'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-red-50 text-red-800 border border-red-200'
                    }`}
                  >
                    {volunteerMsg.text}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <input
                    type="text"
                    value={newVolunteerUsername}
                    onChange={(e) => setNewVolunteerUsername(e.target.value)}
                    required
                    placeholder="Username"
                    className="px-3 py-2 rounded-xl border border-[#E5E7EB] bg-white outline-none focus:border-[#E31827]"
                  />
                  <input
                    type="password"
                    value={newVolunteerPassword}
                    onChange={(e) => setNewVolunteerPassword(e.target.value)}
                    required
                    placeholder="Password (min 6)"
                    className="px-3 py-2 rounded-xl border border-[#E5E7EB] bg-white outline-none focus:border-[#E31827]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 rounded-xl bg-[#E31827] hover:bg-[#C81020] text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Create Volunteer Account</span>
                </button>
              </form>

              {/* Active Volunteers List */}
              <div>
                <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2">
                  Active Volunteer Accounts
                </p>
                <div className="max-h-48 overflow-y-auto border border-[#E5E7EB] rounded-xl divide-y divide-[#E5E7EB] text-xs">
                  {volunteers.map((v) => (
                    <div key={v.id} className="p-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-[#E31827]" />
                        <span className="font-bold text-[#172033]">{v.username}</span>
                      </div>
                      <span className="text-[10px] uppercase font-semibold text-[#64748B] bg-gray-100 px-2 py-0.5 rounded">
                        {v.role}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 bg-[#FAFAFB] border-t border-[#E5E7EB] flex justify-end">
              <button
                onClick={() => setIsVolunteerModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-white border border-[#E5E7EB] hover:bg-gray-50 text-[#172033] font-semibold text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
