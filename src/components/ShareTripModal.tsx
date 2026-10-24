import React, { useState } from 'react';
import { Trip, Companion } from '../types.ts';
import { X, Share2, Copy, Check, UserPlus, Trash2, Shield, Eye, Users } from 'lucide-react';
import { api } from '../api.ts';

interface ShareTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: Trip;
  companions: Companion[];
  onCompanionsUpdated: () => void;
}

export function ShareTripModal({
  isOpen,
  onClose,
  trip,
  companions,
  onCompanionsUpdated,
}: ShareTripModalProps) {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [role, setRole] = useState<'editor' | 'viewer'>('editor');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const shareUrl = `${window.location.origin}/#share-${trip.share_code}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddCompanion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrUsername.trim()) return;

    try {
      setLoading(true);
      setError(null);
      setSuccessMsg(null);
      await api.addCompanion(trip.id, emailOrUsername.trim(), role);
      setEmailOrUsername('');
      setSuccessMsg('Teman seperjalanan berhasil ditambahkan!');
      onCompanionsUpdated();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Gagal menambahkan teman');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCompanion = async (companionId: string) => {
    try {
      await api.removeCompanion(trip.id, companionId);
      onCompanionsUpdated();
    } catch (err: any) {
      setError(err.message || 'Gagal menghapus teman');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <Share2 className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-base font-bold text-stone-900">Bagikan Itinerary ke Teman</h3>
              <p className="text-xs text-stone-500">Kolaborasi bersama teman seperjalanan</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Share Link Box */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              Tautan / Kode Berbagi Khusus
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center bg-stone-50 border border-stone-300 rounded-lg px-3 py-2 text-xs text-stone-700 font-mono select-all truncate">
                <span className="font-semibold text-amber-700 mr-2">{trip.share_code}</span>
                <span className="text-stone-400 truncate">{shareUrl}</span>
              </div>
              <button
                type="button"
                onClick={handleCopyLink}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-stone-800 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded-lg transition-colors shrink-0"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Disalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Add Companion Form */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              Undang Teman Seperjalanan
            </label>
            <form onSubmit={handleAddCompanion} className="space-y-2">
              {error && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700">
                  {error}
                </div>
              )}
              {successMsg && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-700">
                  {successMsg}
                </div>
              )}

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Email pengguna atau nama (contoh: alex@roamplan.app)"
                  value={emailOrUsername}
                  onChange={(e) => setEmailOrUsername(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                />
                <select
                  value={role}
                  onChange={(e: any) => setRole(e.target.value)}
                  className="px-2.5 py-2 text-xs border border-stone-300 rounded-lg bg-stone-50 font-medium text-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                >
                  <option value="editor">Editor (Bisa Ubah)</option>
                  <option value="viewer">Viewer (Lihat Saja)</option>
                </select>
                <button
                  type="submit"
                  disabled={loading || !emailOrUsername.trim()}
                  className="px-3.5 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-50 rounded-lg transition-colors shrink-0 shadow-sm inline-flex items-center gap-1"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Undang</span>
                </button>
              </div>
            </form>
          </div>

          {/* Companion List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-stone-700 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-stone-500" />
                Daftar Teman Tergabung ({companions.length})
              </span>
            </div>

            {companions.length === 0 ? (
              <div className="p-4 bg-stone-50 border border-dashed border-stone-200 rounded-xl text-center text-xs text-stone-500">
                Belum ada teman seperjalanan yang ditambahkan. Undang teman untuk melihat atau menyunting rencana perjalanan bersama!
              </div>
            ) : (
              <div className="divide-y divide-stone-100 border border-stone-200 rounded-xl overflow-hidden bg-white max-h-48 overflow-y-auto">
                {companions.map((comp) => (
                  <div key={comp.id} className="flex items-center justify-between px-3.5 py-2.5 hover:bg-stone-50 transition-colors">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {comp.avatar ? (
                        <img
                          src={comp.avatar}
                          alt={comp.name}
                          className="w-7 h-7 rounded-full object-cover border border-stone-200"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-800 text-xs font-bold flex items-center justify-center">
                          {comp.name.charAt(0)}
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-stone-900 truncate">{comp.name}</div>
                        <div className="text-[11px] text-stone-400 truncate">{comp.email}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-stone-600 bg-stone-100 px-2 py-0.5 rounded">
                        {comp.role === 'editor' ? (
                          <>
                            <Shield className="w-3 h-3 text-amber-600" /> Editor
                          </>
                        ) : (
                          <>
                            <Eye className="w-3 h-3 text-blue-600" /> Viewer
                          </>
                        )}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveCompanion(comp.id)}
                        className="p-1 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                        title="Hapus Teman"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-3 bg-stone-50 border-t border-stone-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-stone-700 hover:bg-stone-200 bg-stone-100 rounded-lg transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
