import React, { useState } from 'react';
import {
  FolderArchive,
  ExternalLink,
  Copy,
  CheckCircle2,
  X,
  Sparkles,
  ShieldCheck,
  Globe
} from 'lucide-react';

interface GitHubExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GitHubExportModal: React.FC<GitHubExportModalProps> = ({
  isOpen,
  onClose
}) => {
  const [copiedStep, setCopiedStep] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleCopyCommand = (text: string, stepIndex: number) => {
    navigator.clipboard.writeText(text);
    setCopiedStep(stepIndex);
    setTimeout(() => setCopiedStep(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-100">
        {/* Header Modal */}
        <div className="bg-[#032448] text-white p-6 relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-900 flex items-center justify-center font-bold">
              <FolderArchive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Panduan Push &amp; Hosting GitHub</h3>
              <p className="text-xs text-blue-200/80">
                Konfigurasi Vite (`base: &apos;./&apos;`) dan GitHub Actions Pages sudah disiapkan di proyek.
              </p>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 overflow-y-auto text-slate-800 text-xs leading-relaxed">
          {/* Status Kesiapan */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 space-y-1.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-200 text-amber-900">
              <Sparkles className="w-3 h-3 text-amber-700" />
              Siap GitHub Actions Pages
            </span>
            <h4 className="font-bold text-sm text-[#032448]">
              Ekspor Kode Sumber melalui Antarmuka Platform
            </h4>
            <p className="text-slate-600">
              Gunakan ikon <strong>GitHub</strong> atau <strong>Download App (.zip)</strong> di bilah atas aplikasi untuk mengunduh atau langsung menyimpan repositori ke akun GitHub Anda (disarankan repositori <strong>Private</strong>).
            </p>
          </div>

          {/* Langkah 1: Push via Git CLI */}
          <div className="space-y-2.5">
            <div className="flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">
                1
              </span>
              <h4 className="font-bold text-sm text-slate-900">
                Push dari Folder Hasil Unduhan (Terminal / Git CLI)
              </h4>
            </div>

            <div className="ml-8 bg-slate-900 text-slate-100 p-3.5 rounded-xl font-mono text-[11px] space-y-1.5">
              <div className="flex items-center justify-between text-slate-400 border-b border-slate-700 pb-1.5 mb-1.5">
                <span>Bash / Command Prompt</span>
                <button
                  type="button"
                  onClick={() =>
                    handleCopyCommand(
                      'git init\ngit add .\ngit commit -m "Initial commit: Symphony of Nusantara"\ngit branch -M main\ngit remote add origin https://github.com/USERNAME/REPO_NAME.git\ngit push -u origin main',
                      1
                    )
                  }
                  className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 cursor-pointer"
                >
                  {copiedStep === 1 ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copiedStep === 1 ? 'Tersalin' : 'Salin Perintah'}</span>
                </button>
              </div>
              <p className="text-emerald-400">git init</p>
              <p className="text-emerald-400">git add .</p>
              <p className="text-emerald-400">git commit -m &quot;Initial commit: Symphony of Nusantara&quot;</p>
              <p className="text-emerald-400">git branch -M main</p>
              <p className="text-emerald-400">git remote add origin https://github.com/USERNAME/REPO_NAME.git</p>
              <p className="text-emerald-400">git push -u origin main</p>
            </div>
          </div>

          {/* Langkah 2: Aktifkan GitHub Actions */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-xs">
                2
              </span>
              <h4 className="font-bold text-sm text-slate-900">
                Aktifkan GitHub Pages dengan Source: GitHub Actions
              </h4>
            </div>
            <div className="ml-8 p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 space-y-1.5 text-slate-700">
              <p>
                Di repositori GitHub Anda, buka <strong>Settings → Pages</strong>, lalu pada bagian <strong>Build and deployment → Source</strong> wajib pilih{' '}
                <strong>GitHub Actions</strong> (<strong>JANGAN</strong> pilih <em>Deploy from a branch</em>).
              </p>
              <p className="text-[11px] text-rose-700 font-semibold">
                Jika muncul error <code>build with jekyll</code>, penyebabnya adalah Source masih berada di <em>Deploy from a branch</em> atau folder tersembunyi <code>.github/workflows/deploy.yml</code> belum ikut ter-push ke GitHub.
              </p>
              <p className="text-[11px] text-slate-500">
                Workflow <code>.github/workflows/deploy.yml</code> otomatis menjalankan <code>npm install</code> &amp; <code>npm run build</code> lalu menerbitkan folder <code>dist/</code> (tanpa Jekyll).
              </p>
            </div>
          </div>

          {/* Langkah 3: Authorized Domains di Firebase */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center text-xs">
                3
              </span>
              <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-amber-700" />
                Wajib: Daftarkan Domain di Firebase Authentication
              </h4>
            </div>
            <div className="ml-8 p-3.5 rounded-xl bg-amber-50 border border-amber-200 space-y-1.5 text-slate-700">
              <p>
                Buka{' '}
                <a
                  href="https://console.firebase.google.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-700 font-bold underline inline-flex items-center gap-0.5"
                >
                  Firebase Console <ExternalLink className="w-3 h-3" />
                </a>{' '}
                → <strong>Authentication → Settings → Authorized domains</strong>, lalu tambahkan domain hosting Anda (mis. <code>username.github.io</code>) agar Login Google tidak memunculkan error <code>auth/unauthorized-domain</code>.
              </p>
              <p className="text-[11px] text-slate-600 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span>Gunakan Vercel / Netlify / Firebase Hosting dengan repo Private jika ingin melindungi data siswa dari akses repositori publik.</span>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Tutup Panduan
          </button>
        </div>
      </div>
    </div>
  );
};
