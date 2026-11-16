import React, { useState } from 'react';
import {
  Download,
  FolderArchive,
  ExternalLink,
  Copy,
  CheckCircle2,
  X,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Code2
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
              <h3 className="text-lg font-bold">Ekspor & Upload Proyek ke GitHub</h3>
              <p className="text-xs text-blue-200/80">
                Solusi mudah tanpa perlu menjalankan perintah terminal yang rumit.
              </p>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto text-slate-800 text-xs leading-relaxed">
          {/* Quick Download Banner */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-200 text-amber-900 mb-1.5">
                <Sparkles className="w-3 h-3 text-amber-700" />
                Paket Siap Pakai
              </span>
              <h4 className="font-bold text-sm text-[#032448]">
                Unduh Seluruh Kode Sumber (ZIP)
              </h4>
              <p className="text-slate-600 text-xs mt-0.5">
                Berisi seluruh berkas React, konfigurasi Tailwind, Firestore, rubrik, dan dokumentasi README.
              </p>
            </div>

            <a
              href="/source-code.zip"
              download="sistem-asesmen-kokurikuler-pertunjukan-seni.zip"
              className="inline-flex items-center justify-center space-x-2 px-5 py-3 rounded-xl bg-[#032448] hover:bg-[#1F3A5F] text-white font-bold text-xs shadow-md transition-all shrink-0 cursor-pointer text-center"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span>Unduh File .ZIP</span>
            </a>
          </div>

          {/* Metode 1: Upload Langsung via Web (Paling Mudah) */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">
                1
              </span>
              <h4 className="font-bold text-sm text-slate-900">
                Cara Paling Mudah: Upload via Web GitHub (Tanpa Terminal)
              </h4>
            </div>

            <div className="ml-8 space-y-2.5 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="flex items-start gap-2">
                <span className="font-bold text-slate-700">a.</span>
                <p>
                  Klik tombol <strong>"Unduh File .ZIP"</strong> di atas, lalu ekstrak (unzip) foldernya di komputer/laptop Anda.
                </p>
              </div>

              <div className="flex items-start gap-2">
                <span className="font-bold text-slate-700">b.</span>
                <p>
                  Buka peramban ke{' '}
                  <a
                    href="https://github.com/new"
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 font-bold underline inline-flex items-center gap-0.5"
                  >
                    github.com/new <ExternalLink className="w-3 h-3" />
                  </a>{' '}
                  dan beri nama repository (misal: <code>asesmen-pertunjukan-seni</code>), lalu klik <strong>Create repository</strong>.
                </p>
              </div>

              <div className="flex items-start gap-2">
                <span className="font-bold text-slate-700">c.</span>
                <p>
                  Pada halaman GitHub yang baru dibuat, klik link kecil bertuliskan <strong>"uploading an existing file"</strong>.
                </p>
              </div>

              <div className="flex items-start gap-2">
                <span className="font-bold text-slate-700">d.</span>
                <p>
                  Tarik (drag & drop) seluruh berkas yang ada di dalam folder ekstrak ke halaman GitHub tersebut, lalu klik tombol hijau <strong>Commit changes</strong>.
                </p>
              </div>
            </div>
          </div>

          {/* Metode 2: Push via AI Studio Langsung */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-xs">
                2
              </span>
              <h4 className="font-bold text-sm text-slate-900">
                Alternatif: Biarkan Sistem AI yang Melakukan Push Otomatis
              </h4>
            </div>

            <div className="ml-8 bg-blue-50/70 p-4 rounded-2xl border border-blue-200 space-y-2">
              <p className="text-slate-700">
                Jika Anda memiliki URL repositori GitHub dan <strong>Personal Access Token (PAT)</strong>, Anda cukup ketikkan di kolom chat:
              </p>
              <div className="bg-white p-3 rounded-xl border border-blue-200 font-mono text-[11px] text-slate-800">
                "Tolong push ke https://github.com/username/nama-repo dengan token: ghp_xxxxxxxxxxxx"
              </div>
              <p className="text-[11px] text-slate-500">
                Sistem akan langsung mengeksekusi push otomatis dari server ke akun GitHub Anda.
              </p>
            </div>
          </div>

          {/* Metode 3: Menggunakan Git Terminal / GitHub Desktop */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs">
                3
              </span>
              <h4 className="font-bold text-sm text-slate-900">
                Bagi Pengguna Terminal / Git CLI
              </h4>
            </div>

            <div className="ml-8 bg-slate-900 text-slate-100 p-3.5 rounded-xl font-mono text-[11px] space-y-2">
              <div className="flex items-center justify-between text-slate-400 border-b border-slate-700 pb-1.5 mb-1.5">
                <span>Bash / Command Prompt</span>
                <button
                  type="button"
                  onClick={() =>
                    handleCopyCommand(
                      'git remote add origin https://github.com/USERNAME/REPO_NAME.git\ngit branch -M main\ngit push -u origin main',
                      3
                    )
                  }
                  className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 cursor-pointer"
                >
                  {copiedStep === 3 ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copiedStep === 3 ? 'Tersalin' : 'Salin Perintah'}</span>
                </button>
              </div>
              <p className="text-emerald-400">git remote add origin https://github.com/USERNAME/REPO_NAME.git</p>
              <p className="text-emerald-400">git branch -M main</p>
              <p className="text-emerald-400">git push -u origin main</p>
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
