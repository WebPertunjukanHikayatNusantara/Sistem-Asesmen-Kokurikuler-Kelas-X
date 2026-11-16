import React, { useState } from 'react';
import {
  PROJECT_PHILOSOPHY,
  BLOK_INTENSIF_SCHEDULE,
  DAILY_CONSISTENT_PATTERN,
  SHOWCASE_NIGHT_DETAILS,
  SEVEN_DPK_DIVISIONS,
  BLOCK_ASSESSMENT_PILLARS,
  BlokDaySchedule
} from '../types';
import {
  Calendar,
  Clock,
  Timer,
  Sparkles,
  Users,
  Film,
  Music,
  CheckCircle2,
  Layers,
  Heart,
  ChevronRight,
  BookOpen,
  Award,
  ShieldCheck,
  Compass
} from 'lucide-react';

import { UserRole } from '../types';

interface ProjectShowcaseOverviewProps {
  role?: UserRole;
}

export const ProjectShowcaseOverview: React.FC<ProjectShowcaseOverviewProps> = () => {
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const activeDay = BLOK_INTENSIF_SCHEDULE[selectedDayIndex];

  return (
    <div className="space-y-8">
      {/* 1. Benang Merah & Filosofi Utama Proyek */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#032448] via-[#0B3B60] to-[#144E75] text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-blue-400/20">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-bold mb-3 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Benang Merah Kokurikuler • Kelas X Fase E</span>
          </div>
          
          <blockquote className="text-base sm:text-xl font-medium italic text-blue-50 leading-relaxed mb-4 border-l-4 border-amber-400 pl-4">
            "{PROJECT_PHILOSOPHY.quote}"
          </blockquote>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-4 border-t border-white/10 text-xs text-blue-100">
            <div className="flex items-center space-x-2">
              <Compass className="w-4 h-4 text-amber-400 shrink-0" />
              <span><strong>Tema:</strong> {PROJECT_PHILOSOPHY.eventTheme}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
              <span><strong>Puncak Acara:</strong> 20 November 2026 (Open Gate 18.30)</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-amber-400 shrink-0" />
              <span><strong>Pengelola:</strong> Kepanitiaan Mandiri DPK (7 Divisi)</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Pelaksanaan Blok Intensif 16–19 November 2026 (25 JP, 10.30–14.10) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200 mb-1">
              <Clock className="w-3.5 h-3.5 text-amber-700" />
              Tahap Create & Organize • Blok Terjadwal
            </div>
            <h3 className="text-xl font-bold text-[#032448]">
              Pelaksanaan Blok Intensif (16–19 November 2026)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Alokasi 25 JP (pukul 10.30 – 14.10 WIB setiap hari) dengan pola kerja harian yang konsisten.
            </p>
          </div>

          <div className="bg-amber-50/80 px-4 py-2.5 rounded-2xl border border-amber-200 text-right">
            <span className="text-[10px] uppercase font-bold text-amber-800 tracking-wider block">Pola Harian Konsisten:</span>
            <span className="text-xs font-bold text-[#032448]">
              Doa & Briefing ➔ Kerja Divisi I ➔ Istirahat ➔ Latihan Divisi II ➔ Refleksi & Penutup
            </span>
          </div>
        </div>

        {/* Pola Harian Konsisten (10.30 – 14.10 WIB) Showcase Card */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-50/70 via-white to-slate-50 border border-amber-200/80 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-2 border-b border-amber-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-950 flex items-center gap-1.5">
              <Timer className="w-4 h-4 text-amber-600" />
              Pola Harian Konsisten (Pukul 10.30 – 14.10 WIB)
            </h4>
            <span className="text-[11px] font-semibold text-slate-500">Berlaku Seragam Setiap Hari (Senin–Kamis)</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
            {DAILY_CONSISTENT_PATTERN.map((slot, i) => (
              <div
                key={i}
                className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold font-mono text-[#032448] bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {slot.time}
                    </span>
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-100/80 px-1.5 py-0.5 rounded border border-amber-300">
                      {slot.duration}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-800 leading-snug">
                    {slot.activity}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Day Tabs */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-blue-700" />
            Agenda Bertahap Per Hari (16 – 19 November 2026):
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {BLOK_INTENSIF_SCHEDULE.map((day, idx) => (
              <button
                key={day.dayName}
                type="button"
                onClick={() => setSelectedDayIndex(idx)}
                className={`p-3.5 rounded-2xl text-left border transition-all cursor-pointer ${
                  selectedDayIndex === idx
                    ? 'bg-[#032448] text-white border-[#032448] shadow-md scale-[1.02]'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider">{day.dayName}</span>
                  <span className={`text-[10px] font-mono ${selectedDayIndex === idx ? 'text-amber-300' : 'text-slate-400'}`}>
                    {day.date.split(' ')[0]} Nov
                  </span>
                </div>
                <p className={`text-xs font-semibold line-clamp-1 ${selectedDayIndex === idx ? 'text-blue-100' : 'text-slate-900'}`}>
                  {day.mainFocus}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Selected Day Details Card */}
        <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h4 className="font-extrabold text-[#032448] text-base flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-600" />
                {activeDay.dayName}, {activeDay.date} — {activeDay.mainFocus}
              </h4>
              <p className="text-xs text-slate-600 mt-1">{activeDay.description}</p>
            </div>
            <div className="bg-amber-100/70 border border-amber-300 text-amber-900 px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0">
              Target: {activeDay.outputMilestone}
            </div>
          </div>

          {/* Hourly Flow Table */}
          <div className="pt-2">
            <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
              Rincian Aktivitas {activeDay.dayName} Sesuai Pola Harian Konsisten:
            </h5>
            <div className="space-y-2">
              {activeDay.hourlyPattern.map((slot, i) => (
                <div
                  key={i}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-white border border-slate-200 text-xs shadow-2xs hover:border-amber-300 transition-colors"
                >
                  <div className="flex items-center space-x-2 shrink-0">
                    <span className="font-mono font-bold text-amber-800 bg-amber-50 px-2 py-1 rounded-md border border-amber-200">
                      {slot.time}
                    </span>
                    {slot.duration && (
                      <span className="text-[10px] font-bold text-amber-900 bg-amber-100/80 px-2 py-0.5 rounded-full border border-amber-300">
                        {slot.duration}
                      </span>
                    )}
                  </div>
                  <span className="text-slate-800 font-medium sm:text-right flex-1">{slot.activity}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 4 Pilar Penilaian Blok */}
        <div className="pt-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-amber-600" />
            4 Aspek Penilaian Blok Intensif:
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {BLOCK_ASSESSMENT_PILLARS.map((p, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-xs text-[#032448]">{p.name}</span>
                  <span className="text-[11px] font-extrabold font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    Bobot {p.weight}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">{p.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Kepanitiaan Mandiri DPK: 7 Divisi Kerja Siswa */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-900 border border-blue-200 mb-1">
            <Users className="w-3.5 h-3.5 text-blue-700" />
            Kepanitiaan Mandiri Siswa DPK
          </div>
          <h3 className="text-xl font-bold text-[#032448]">
            7 Divisi Kerja Kepanitiaan Murid (DPK)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Setiap murid mengambil peran aktif dalam divisi kerja, memastikan pagelaran dikelola secara mandiri dari perencanaan hingga evaluasi.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {SEVEN_DPK_DIVISIONS.map((div) => (
            <div
              key={div.id}
              className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-blue-300 transition-all flex flex-col justify-between"
            >
              <div>
                <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-white text-slate-700 border border-slate-200 mb-2">
                  Divisi {div.category}
                </span>
                <h4 className="font-bold text-sm text-[#032448] mb-1.5">{div.name}</h4>
                <p className="text-xs text-slate-600 mb-3 leading-relaxed">{div.responsibilities}</p>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Daftar Peran Anggota:
                </span>
                <ul className="space-y-1">
                  {div.roles.map((r, i) => (
                    <li key={i} className="text-[11px] text-slate-700 flex items-start gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Puncak Gelar Karya: Jumat, 20 November 2026 (18.30 – 22.00 WIB) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-200 mb-1">
              <Film className="w-3.5 h-3.5 text-emerald-700" />
              Malam Puncak Pagelaran Akbar
            </div>
            <h3 className="text-xl font-bold text-[#032448]">
              {SHOWCASE_NIGHT_DETAILS.narrativeUniverse.title}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {SHOWCASE_NIGHT_DETAILS.date} • Open Gate {SHOWCASE_NIGHT_DETAILS.openGate} s/d {SHOWCASE_NIGHT_DETAILS.endTime}
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-500 block">Durasi Puncak Drama Musikal:</span>
            <span className="text-sm font-bold text-rose-700 font-mono bg-rose-50 px-3 py-1 rounded-xl border border-rose-200 inline-block mt-0.5">
              Maksimal 60 Menit (1 Jam)
            </span>
          </div>
        </div>

        {/* Multiverse Story Universe Card */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border border-amber-300/80 space-y-4">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-extrabold text-[#032448] text-base">
                Konsep Hikayat Nusantara & Sosok Ibu Fatmawati
              </h4>
              <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                Drama musikal ini menghadirkan perjumpaan unik lintas tokoh dongeng Nusantara dalam satu alur cerita: <strong>Malin Kundang</strong>, <strong>Timun Mas</strong>, <strong>Roro Jonggrang</strong>, serta <strong>Bawang Merah & Bawang Putih</strong>. Di tengah konflik dan perbedaan watak para tokoh, hadir sosok <strong>Ibu Fatmawati</strong> yang dengan penuh keibuan menjahit bendera Sang Saka Merah Putih sembari menyampaikan pesan mutiara pemersatu bangsa.
              </p>
            </div>
          </div>

          <blockquote className="p-4 rounded-xl bg-white/90 border border-amber-300 text-amber-900 text-xs font-semibold italic text-center shadow-2xs">
            {SHOWCASE_NIGHT_DETAILS.narrativeUniverse.climaxQuote}
          </blockquote>

          {/* Character Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5 pt-2">
            {SHOWCASE_NIGHT_DETAILS.narrativeUniverse.characters.map((c, i) => (
              <div key={i} className="p-3 bg-white rounded-xl border border-amber-200/90 text-xs space-y-1 shadow-2xs">
                <span className="font-bold text-[#032448] block">{c.name}</span>
                <span className="text-[10px] text-amber-700 font-semibold block">{c.origin}</span>
                <p className="text-[11px] text-slate-600 leading-tight">{c.arc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Rundown Hari H Table */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-slate-500" />
            Timeline Rundown Pertunjukan Gelar Karya
          </h4>
          <div className="space-y-2">
            {SHOWCASE_NIGHT_DETAILS.rundown.map((item, idx) => (
              <div
                key={idx}
                className="flex items-start sm:items-center space-x-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs hover:bg-slate-100 transition-colors"
              >
                <span className="font-mono font-bold text-slate-800 bg-white px-2.5 py-1 rounded-md shrink-0 border border-slate-300">
                  {item.time}
                </span>
                <span className={`text-slate-800 ${item.event.includes('Drama Musikal') ? 'font-bold text-[#032448]' : 'font-medium'}`}>
                  {item.event}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
