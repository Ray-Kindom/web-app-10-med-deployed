import React, { useState } from 'react';
import {
  Cloud,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Database,
  ShieldCheck,
  X,
  ExternalLink,
  Copy,
  Check,
  Radio,
  Zap,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface CloudSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CloudSyncModal: React.FC<CloudSyncModalProps> = ({ isOpen, onClose }) => {
  const {
    syncAllToCloud,
    usersList,
    personnelList,
    cloudPermissionDenied,
    currentUser,
  } = useApp();

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [copiedRule, setCopiedRule] = useState(false);

  if (!isOpen) return null;

  const firestoreRulesCode = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}`;

  const copyRules = () => {
    navigator.clipboard.writeText(firestoreRulesCode);
    setCopiedRule(true);
    setTimeout(() => setCopiedRule(false), 3500);
  };

  const handlePushAllData = async () => {
    setIsSyncing(true);
    setSyncStatusMsg(null);
    try {
      const res = await syncAllToCloud();
      if (res.success) {
        setSyncStatusMsg({
          type: 'success',
          text: `রেজিমেন্টের সকল ডেটা (${personnelList.length} জন সেনাসদস্যের নোমিনাল রোল, ইউজার একাউন্ট ও সেটিংস) ক্লাউড ফায়ারবেসে সফলভাবে সিঙ্ক ও সংরক্ষিত হয়েছে!`,
        });
      } else {
        setSyncStatusMsg({
          type: 'error',
          text: res.error || 'সিঙ্ক ব্যর্থ হয়েছে। ফায়ারবেস রুলস চেক করুন।',
        });
      }
    } catch (e: any) {
      setSyncStatusMsg({
        type: 'error',
        text: `সিঙ্ক এরর: ${e?.message || 'Failed'}`,
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl border ${!cloudPermissionDenied ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-amber-500/10 border-amber-500/30 text-amber-400'}`}>
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Firebase Cloud Auto-Sync</span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-bold ${
                  !cloudPermissionDenied
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                }`}>
                  {!cloudPermissionDenied ? 'LIVE CLOUD AUTO-SYNC ACTIVE' : 'ACTION REQUIRED (RULES)'}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                10 Medium Regiment Artillery • ID & Password Cloud Synchronization
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Status Indicator */}
          {!cloudPermissionDenied ? (
            <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold">
                  <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                  <span>আইডি/পাসওয়ার্ড ক্লাউড অটো-সিঙ্ক সক্রিয় (Online & Active)</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-900/40 px-2 py-0.5 rounded border border-emerald-700/50 font-bold">
                  CONNECTED
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                আপনার রেজিমেন্টের যেকোনো ইউজার (এডমিন, বিএসএম, সিএলকে ইত্যাদি) গুগল একাউন্ট ছাড়াই তাদের নিজস্ব <strong>আইডি ও পাসওয়ার্ড</strong> দিয়ে লগইন করে কাজ করতে পারবে। নোমিনাল রোল, হাজিরা, ডিউটি ও যেকোনো এডিট সরাসরি ক্লাউড সার্ভারে তাৎক্ষণিক সংরক্ষিত ও অন্যান্য ডিভাইসে সিঙ্ক হবে।
              </p>
              <div className="pt-2 border-t border-emerald-800/40 flex items-center justify-between text-[11px] font-mono text-emerald-300/90">
                <span>বর্তমান সেশন: <strong>{currentUser.rank} {currentUser.name} ({currentUser.role})</strong></span>
                <span className="text-[10px] bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800/50">Auto-Push Ready</span>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/40 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-300 text-xs font-bold">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>Firebase Rules Setup: ২০ সেকেন্ডের একটি সহজ কাজ বাকি আছে</span>
                </div>
                <span className="text-[10px] font-mono text-amber-300 bg-amber-900/50 px-2 py-0.5 rounded border border-amber-700/50">
                  PERMISSION NEEDED
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                ব্যবহারকারীরা যাতে কোনো <strong>গুগল লগইন ছাড়াই শুধুমাত্র আইডি-পাসওয়ার্ড দিয়ে ক্লাউডে ডেটা সিঙ্ক</strong> করতে পারে, সেজন্য ফায়ারবেস কনসোলে নিচের রুলসটি পেস্ট করে "Publish" করতে হবে:
              </p>

              {/* Step instructions */}
              <div className="space-y-2 text-xs bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between font-mono text-[11px] text-slate-300 mb-1">
                  <span className="text-amber-400 font-bold">Firestore Rules Code (কপি করুন):</span>
                  <button
                    type="button"
                    onClick={copyRules}
                    className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded flex items-center gap-1.5 transition-all cursor-pointer shadow-sm text-xs"
                  >
                    {copiedRule ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedRule ? 'কপি হয়েছে (Copied)!' : 'Copy Rule'}</span>
                  </button>
                </div>
                <pre className="p-2.5 rounded-lg bg-slate-900 text-slate-300 font-mono text-[11px] overflow-x-auto border border-slate-800/80 select-all">
                  {firestoreRulesCode}
                </pre>

                <div className="pt-2 text-[11px] text-slate-400 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-slate-850 text-amber-300 text-[10px] font-bold flex items-center justify-center">১</span>
                    <span>Firebase Console-এর <strong className="text-white">Firestore Database ➔ Rules</strong> ট্যাবে যান।</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-slate-850 text-amber-300 text-[10px] font-bold flex items-center justify-center">২</span>
                    <span>পূর্বের কোড মুছে দিয়ে উপরের কোডটি পেস্ট করুন।</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-slate-850 text-amber-300 text-[10px] font-bold flex items-center justify-center">৩</span>
                    <span><strong className="text-emerald-400">"Publish"</strong> বাটনে ক্লিক করুন। সাথে সাথে পুরো অ্যাপে লাইভ অটো-সিঙ্ক চালু হয়ে যাবে!</span>
                  </div>
                </div>

                <a
                  href="https://console.firebase.google.com/project/gen-lang-client-0581671896/firestore/rules"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-750 text-amber-300 hover:text-amber-200 text-xs font-semibold flex items-center justify-center gap-1.5 border border-amber-500/30 transition-colors"
                >
                  <span>Firebase Console Rules খুলুন</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}

          {/* Sync Status Message */}
          {syncStatusMsg && (
            <div className={`p-3 rounded-xl border text-xs font-mono flex items-start gap-2 ${
              syncStatusMsg.type === 'success'
                ? 'bg-emerald-950/50 border-emerald-500/50 text-emerald-300'
                : 'bg-rose-950/50 border-rose-500/50 text-rose-300'
            }`}>
              {syncStatusMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              )}
              <span>{syncStatusMsg.text}</span>
            </div>
          )}

          {/* Database Specs Card */}
          <div className="grid grid-cols-2 gap-3 font-mono text-xs">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Target Cloud Database</span>
              <span className="text-slate-200 font-bold block truncate" title="ai-studio-webapp10med-ba1afcdd-1f03-430a-8631-2d3687091a01">
                ai-studio-webapp10med
              </span>
              <span className="text-[10px] text-emerald-400 mt-1 block">asia-southeast1 / Active</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Current Regiment Roll</span>
              <span className="text-white font-bold block">
                {personnelList.length} Personnel • {usersList.length} Users
              </span>
              <span className="text-[10px] text-slate-400 mt-1 block">10 Med Regt Arty Data</span>
            </div>
          </div>

          {/* Force Push / Test Sync Action */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-emerald-400" />
                  <span>Push / Test Cloud Synchronization (ম্যানুয়াল সিঙ্ক)</span>
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  রেজিমেন্টের সম্পূর্ণ নোমিনাল রোল ({personnelList.length} জন), পদবি, ডিউটি ও কনফিগ ক্লাউডে আপলোড ও টেস্ট করুন।
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handlePushAllData}
              disabled={isSyncing}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-950/40"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'ফায়ারবেস ক্লাউডে ডেটা সিঙ্ক হচ্ছে...' : 'Sync Entire Regiment to Cloud Now (এখনই সিঙ্ক করুন)'}</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>ID/Password Real-Time Multi-Device Sync</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors cursor-pointer"
          >
            বন্ধ করুন (Close)
          </button>
        </div>
      </div>
    </div>
  );
};
