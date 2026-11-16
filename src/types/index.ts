export type UserRole = 'admin' | 'pendamping' | 'walikelas' | 'murid';

export type ClassGroup = 'X-1' | 'X-2' | 'X-3' | 'X-4' | 'X-5' | 'X-6';

export const ALL_CLASSES: ClassGroup[] = ['X-1', 'X-2', 'X-3', 'X-4', 'X-5', 'X-6'];

export const CLASS_HOMEROOM_TEACHERS: Record<ClassGroup, string> = {
  'X-1': 'Permata Nugrahani, M.Pd.',
  'X-2': 'Agustinus Heruwanto, S.Pd.',
  'X-3': 'Th. Niken Widowati Setyaning Tyas, M.Pd.',
  'X-4': 'Agustinus Budi Santoso, S.Pd.',
  'X-5': 'F. Tri Haryatmo, S.S.',
  'X-6': 'Agung Wahyu Nugroho, S.T.'
};

export const SCHOOL_MOTTO = {
  latin: 'Amor Gignit Amorem',
  indonesian: 'Cinta Melahirkan Cinta',
  full: 'Amor Gignit Amorem — Cinta Melahirkan Cinta',
  schoolName: 'SMA Pangudi Luhur Santo Yosef Surakarta',
  foundation: 'Yayasan Pangudi Luhur',
  basis: 'Kurikulum SMA Pangudi Luhur Santo Yosef Surakarta'
};

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  assignedDivisionId?: string;
  secondaryDivisionId?: string;
  assignedClassGroup?: ClassGroup;
  studentId?: string;
  classGroup?: ClassGroup;
  nisn?: string;
  canExport?: boolean;
  inviteCode?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface StaffAssignment {
  id: string;
  email: string;
  displayName: string;
  role: 'admin' | 'pendamping' | 'walikelas';
  assignedDivisionId?: string;
  assignedClassGroup?: ClassGroup;
  canExport?: boolean;
  assignedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AppConfig {
  id: string;
  primaryDivisionWeight: number; // default 60
  secondaryDivisionWeight: number; // default 40
  allowStudentDivisionSelection: boolean;
  updatedBy?: string;
  updatedAt?: string;
}

export interface Student {
  id: string;
  nisn: string;
  name: string;
  classGroup: ClassGroup;
  email: string;
  phone?: string;
  gender: 'Laki-laki' | 'Perempuan' | '-';
  primaryDivisionId: string;
  secondaryDivisionId?: string;
  isDpkCommittee?: boolean;
  dpkRoleNote?: string;
  status: 'Aktif' | 'Perlu Sapaan';
  notes?: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DivisionPeer {
  id: string;
  studentId: string;
  studentName: string;
  classGroup: ClassGroup;
  divisionId: string;
  divisionRole: 'utama' | 'pendukung';
  isDpkCommittee?: boolean;
}

// 3 Level Pertumbuhan (Bukan Skala Lulus atau Gagal)
export type GrowthLevel = 'Mulai Tumbuh' | 'Berkembang' | 'Menjadi Teladan';

export interface GrowthLevelConfig {
  level: GrowthLevel;
  internalScore: 1 | 2 | 3; // Internal only for weighted averaging & admin/teacher export; NEVER shown as number to students
  shortLabel: string;
  generalMeaning: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
  badgeClass: string;
}

export const GROWTH_LEVELS: Record<GrowthLevel, GrowthLevelConfig> = {
  'Mulai Tumbuh': {
    level: 'Mulai Tumbuh',
    internalScore: 1,
    shortLabel: 'Mulai Tumbuh',
    generalMeaning: 'Tanda awal mulai terlihat, masih perlu diajak dan didampingi dengan hangat.',
    bgClass: 'bg-amber-50',
    textClass: 'text-amber-800',
    borderClass: 'border-amber-200',
    badgeClass: 'bg-amber-100 text-amber-900 border-amber-300'
  },
  'Berkembang': {
    level: 'Berkembang',
    internalScore: 2,
    shortLabel: 'Berkembang',
    generalMeaning: 'Konsisten melakukannya dalam kegiatan bersama divisi.',
    bgClass: 'bg-teal-50',
    textClass: 'text-teal-800',
    borderClass: 'border-teal-200',
    badgeClass: 'bg-teal-100 text-teal-900 border-teal-300'
  },
  'Menjadi Teladan': {
    level: 'Menjadi Teladan',
    internalScore: 3,
    shortLabel: 'Menjadi Teladan',
    generalMeaning: 'Melakukannya dengan tulus dan menginspirasi teman dalam kebersamaan.',
    bgClass: 'bg-emerald-50',
    textClass: 'text-emerald-800',
    borderClass: 'border-emerald-200',
    badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-300'
  }
};

export const GROWTH_LEVEL_ORDER: GrowthLevel[] = ['Mulai Tumbuh', 'Berkembang', 'Menjadi Teladan'];

export type FormasiHolistik =
  | 'Pastoral'
  | 'Human'
  | 'Intelektual'
  | 'Intelektual dan Human'
  | 'Pastoral dan Spiritual';

export type DimensionId = 'gotong-royong' | 'mandiri' | 'bernalar-kritis' | 'kreatif' | 'kebinekaan';

export type IndicatorCode =
  | 'G1' | 'G2' | 'G3'
  | 'M1' | 'M2' | 'M3'
  | 'B1' | 'B2' | 'B3'
  | 'K1' | 'K2' | 'K3'
  | 'N1' | 'N2' | 'N3';

export interface IndicatorLevelDetail {
  descriptor: string;
  nextStep: string;
}

export interface BehaviorIndicator {
  code: IndicatorCode;
  title: string;
  stageHint?: string;
  levels: Record<GrowthLevel, IndicatorLevelDetail>;
}

export interface HolisticDimension {
  id: DimensionId;
  name: string;
  formasi: FormasiHolistik;
  stYosefValues: string;
  rumusan: string;
  indicators: BehaviorIndicator[];
}

export const FIVE_HOLISTIC_DIMENSIONS: HolisticDimension[] = [
  {
    id: 'gotong-royong',
    name: 'Gotong Royong',
    formasi: 'Pastoral',
    stYosefValues: 'Pelayanan, kesetiaan',
    rumusan: 'Siswa hadir untuk melayani tim dengan setia, terutama dalam tugas yang tidak terlihat.',
    indicators: [
      {
        code: 'G1',
        title: 'Setia pada tugas divisi',
        stageHint: 'Ditekankan pada Tahap Organize',
        levels: {
          'Mulai Tumbuh': {
            descriptor: 'Mengerjakan tugas divisi bila diingatkan.',
            nextStep: 'Biasakan mencatat jadwal dan tanggung jawab divisimu agar dapat dikerjakan tepat waktu sebelum diingatkan.'
          },
          'Berkembang': {
            descriptor: 'Menyelesaikan tugas divisi tepat waktu tanpa diingatkan.',
            nextStep: 'Jaga ketekunanmu menyelesaikan tugas dengan baik bahkan saat tidak diawasi, hingga gelar karya selesai.'
          },
          'Menjadi Teladan': {
            descriptor: 'Menyelesaikan tugas dengan baik, juga saat tidak diawasi, dan menjaga komitmen sampai gelar karya selesai.',
            nextStep: 'Terus jaga kesetiaan pelayananmu dan dampingi teman sedivisi yang masih perlu penguatan agar komitmen tim tetap utuh.'
          }
        }
      },
      {
        code: 'G2',
        title: 'Melayani dan membantu teman',
        stageHint: 'Ditekankan pada Tahap Perform',
        levels: {
          'Mulai Tumbuh': {
            descriptor: 'Membantu bila diminta.',
            nextStep: 'Mulai peka melihat rekan sedivisi di sekitarmu dan tawarkan bantuan lebih dulu tanpa menunggu diminta.'
          },
          'Berkembang': {
            descriptor: 'Menawarkan bantuan kepada teman yang kesulitan.',
            nextStep: 'Perluas kepekaanmu untuk melihat tugas kecil yang sering luput dari perhatian, seperti merapikan alat atau ruang latihan.'
          },
          'Menjadi Teladan': {
            descriptor: 'Peka melihat kebutuhan tim, mengambil bagian kecil yang tidak dilirik orang lain (misalnya merapikan perlengkapan).',
            nextStep: 'Ajak rekan-rekanmu dengan hangat untuk ikut peduli pada detail pelayanan kecil di balik layar panggung.'
          }
        }
      },
      {
        code: 'G3',
        title: 'Kerja sama lintas kelas',
        stageHint: 'Ditekankan pada Tahap Organize',
        levels: {
          'Mulai Tumbuh': {
            descriptor: 'Bekerja bersama teman dekat dari kelas sendiri.',
            nextStep: 'Beranikan diri menyapa dan berdiskusi dengan satu atau dua teman divisi yang berasal dari kelas berbeda.'
          },
          'Berkembang': {
            descriptor: 'Bekerja baik dengan teman divisi dari kelas lain.',
            nextStep: 'Perhatikan teman divisi yang pendiam atau baru dikenal, lalu rangkul mereka agar merasa menjadi bagian utuh tim.'
          },
          'Menjadi Teladan': {
            descriptor: 'Merangkul anggota yang pendiam atau baru dikenal, sehingga semua merasa menjadi bagian tim.',
            nextStep: 'Jadilah jembatan persaudaraan lintas kelas X-1 sampai X-6 sehingga setiap orang merasakan kehangatan tim.'
          }
        }
      }
    ]
  },
  {
    id: 'mandiri',
    name: 'Mandiri',
    formasi: 'Human',
    stYosefValues: 'Tanggung jawab, kejujuran',
    rumusan: 'Siswa bertanggung jawab atas dirinya, jujur tentang prosesnya, dan mau bertumbuh dari kekurangannya.',
    indicators: [
      {
        code: 'M1',
        title: 'Tanggung jawab pribadi',
        stageHint: 'Ditekankan pada Tahap Organize',
        levels: {
          'Mulai Tumbuh': {
            descriptor: 'Sering perlu diarahkan guru atau teman.',
            nextStep: 'Susun daftar tugas pribadimu di awal sesi dan atur waktu latihan agar semakin mampu mengelola peran sendiri.'
          },
          'Berkembang': {
            descriptor: 'Mengelola waktu dan peran sendiri dengan cukup baik.',
            nextStep: 'Ambil inisiatif lebih awal dalam menyelesaikan kendala divisi sehingga kamu dapat menjadi andalan bersama.'
          },
          'Menjadi Teladan': {
            descriptor: 'Mengambil inisiatif, mengatur diri, dan menjadi andalan divisi.',
            nextStep: 'Bagikan cara mengatur waktu dan tanggung jawabmu kepada teman sedivisi agar seluruh tim bertumbuh.'
          }
        }
      },
      {
        code: 'M2',
        title: 'Kejujuran dalam proses',
        stageHint: 'Ditekankan pada Tahap Reflect',
        levels: {
          'Mulai Tumbuh': {
            descriptor: 'Melaporkan progres seadanya.',
            nextStep: 'Biasakan melaporkan bukan hanya yang sudah berhasil, tetapi juga kesulitan nyata yang sedang kamu hadapi.'
          },
          'Berkembang': {
            descriptor: 'Jujur melaporkan kemajuan dan kendala.',
            nextStep: 'Saat menghadapi kesalahan atau kekurangan, akui dengan lapang hati lalu usulkan langkah perbaikan konkret.'
          },
          'Menjadi Teladan': {
            descriptor: 'Jujur mengakui kesalahan atau kekurangan, lalu mencari cara memperbaikinya.',
            nextStep: 'Pelihara kejujuran dalam proses agar tim merasa aman untuk belajar bersama dan saling mendukung.'
          }
        }
      },
      {
        code: 'M3',
        title: 'Pengelolaan diri dan emosi',
        stageHint: 'Ditekankan pada Tahap Perform',
        levels: {
          'Mulai Tumbuh': {
            descriptor: 'Mudah goyah saat lelah atau tertekan menjelang acara.',
            nextStep: 'Ambil jeda sejenak saat mulai lelah dan komunikasikan perasaanmu dengan tenang kepada pendamping atau tim.'
          },
          'Berkembang': {
            descriptor: 'Tetap tenang dan melanjutkan tugas saat menghadapi kesulitan.',
            nextStep: 'Gunakan ketenanganmu untuk membantu mencairkan suasana ketika teman di sekitarmu mulai panik menjelang pentas.'
          },
          'Menjadi Teladan': {
            descriptor: 'Menenangkan diri dan membantu suasana tim tetap positif.',
            nextStep: 'Terus hadirkan keteduhan hati dan kata-kata penguat bagi tim selama persiapan hingga pementasan.'
          }
        }
      }
    ]
  },
  {
    id: 'bernalar-kritis',
    name: 'Bernalar Kritis',
    formasi: 'Intelektual',
    stYosefValues: 'Ketekunan, kerja keras',
    rumusan: 'Siswa bertanya, menelusuri, dan menimbang dengan tekun sebelum bertindak.',
    indicators: [
      {
        code: 'B1',
        title: 'Rasa ingin tahu dan riset',
        stageHint: 'Ditekankan pada Tahap Explore & Research',
        levels: {
          'Mulai Tumbuh': {
            descriptor: 'Mencari informasi sebatas tugas.',
            nextStep: 'Gali sumber tambahan mengenai latar cerita rakyat atau musik daerah yang dipilih, lalu catat hal-hal menariknya.'
          },
          'Berkembang': {
            descriptor: 'Menggali sumber tentang cerita rakyat dan budaya yang diangkat, serta mencatat temuannya.',
            nextStep: 'Bandingkan beberapa sumber berbeda lalu latih dirimu menjelaskan temuan itu secara runtut kepada tim.'
          },
          'Menjadi Teladan': {
            descriptor: 'Membandingkan beberapa sumber dan menjelaskan temuannya dengan jelas kepada tim.',
            nextStep: 'Bantu rekan divisimu memahami kedalaman akar budaya karya sehingga pementasan kita berlandaskan riset yang kuat.'
          }
        }
      },
      {
        code: 'B2',
        title: 'Menimbang dan mengambil keputusan',
        levels: {
          'Mulai Tumbuh': {
            descriptor: 'Mengikuti keputusan orang lain.',
            nextStep: 'Beranikan diri menyampaikan satu pendapat dalam diskusi divisi disertai alasan sederhana.'
          },
          'Berkembang': {
            descriptor: 'Menyampaikan pendapat disertai alasan.',
            nextStep: 'Dengarkan pendapat teman dengan saksama, timbang beberapa pilihan, lalu rumuskan keputusan dengan penuh tanggung jawab.'
          },
          'Menjadi Teladan': {
            descriptor: 'Menimbang beberapa pilihan, mendengarkan pendapat teman, lalu memutuskan dengan bertanggung jawab.',
            nextStep: 'Terus jaga ruang dialog yang adil di divisi agar setiap keputusan lahir dari pertimbangan matang bersama.'
          }
        }
      },
      {
        code: 'B3',
        title: 'Evaluasi diri dan karya',
        stageHint: 'Ditekankan pada Tahap Reflect',
        levels: {
          'Mulai Tumbuh': {
            descriptor: 'Menyebut apa yang sudah dikerjakan.',
            nextStep: 'Uraikan dengan lebih spesifik bagian mana yang sudah berjalan baik dan bagian mana yang masih perlu diperbaiki.'
          },
          'Berkembang': {
            descriptor: 'Menjelaskan apa yang berhasil dan apa yang kurang.',
            nextStep: 'Tarik satu pelajaran penting dari proses ini lalu susun langkah perbaikan nyata untuk karya berikutnya.'
          },
          'Menjadi Teladan': {
            descriptor: 'Menarik pelajaran dan menyusun langkah perbaikan yang nyata.',
            nextStep: 'Bagikan hasil evaluasimu sebagai pembelajaran berharga bagi pertumbuhan dirimu dan rekan satu tim.'
          }
        }
      }
    ]
  },
  {
    id: 'kreatif',
    name: 'Kreatif',
    formasi: 'Intelektual dan Human',
    stYosefValues: 'Kerja keras, ketulusan berkarya',
    rumusan: 'Siswa berkarya dengan sungguh-sungguh dan tulus, mengolah budaya Nusantara menjadi sajian yang hidup.',
    indicators: [
      {
        code: 'K1',
        title: 'Gagasan dan olahan karya',
        stageHint: 'Ditekankan pada Tahap Create',
        levels: {
          'Mulai Tumbuh': {
            descriptor: 'Meniru contoh yang diberikan.',
            nextStep: 'Tambahkan sentuhan gagasan pribadimu pada aransemen, gerak, visual, atau panggung agar karya lebih hidup.'
          },
          'Berkembang': {
            descriptor: 'Menambahkan gagasan sendiri pada aransemen, gerak, visual, atau panggung.',
            nextStep: 'Kembangkan ide segar yang memadukan unsur tradisional dan modern sambil tetap menghormati akar budayanya.'
          },
          'Menjadi Teladan': {
            descriptor: 'Menawarkan gagasan segar yang memadukan unsur tradisional dan modern dengan tetap menghormati asalnya.',
            nextStep: 'Wujudkan gagasan kreatif tersebut bersama teman divisimu melalui latihan yang tekun dan penuh ketulusan.'
          }
        }
      },
      {
        code: 'K2',
        title: 'Ketekunan berlatih',
        stageHint: 'Ditekankan pada Tahap Organize & Perform',
        levels: {
          'Mulai Tumbuh': {
            descriptor: 'Berlatih bila waktu tersedia.',
            nextStep: 'Luangkan jadwal latihan secara teratur dan fokus menyempurnakan bagian yang masih terasa sulit.'
          },
          'Berkembang': {
            descriptor: 'Berlatih teratur dan memperbaiki bagian yang sulit.',
            nextStep: 'Bantu teman yang masih kesulitan saat berlatih bersama dan bangun penghayatan utuh atas peranmu.'
          },
          'Menjadi Teladan': {
            descriptor: 'Tekun berlatih, membantu teman berlatih, dan tampil dengan penuh penghayatan.',
            nextStep: 'Pelihara ketekunan dan ketulusan berkarya agar pesan kebhinekaan dalam gelar karya tersampaikan dengan hidup.'
          }
        }
      },
      {
        code: 'K3',
        title: 'Keberanian mencoba',
        stageHint: 'Ditekankan pada Tahap Create',
        levels: {
          'Mulai Tumbuh': {
            descriptor: 'Ragu mencoba hal baru.',
            nextStep: 'Pilih satu peran atau teknik baru untuk dicoba saat latihan bersama tanpa takut keliru.'
          },
          'Berkembang': {
            descriptor: 'Berani mencoba meski belum yakin.',
            nextStep: 'Lihat setiap kesalahan saat mencoba sebagai bagian alami dari proses belajar agar kreativitasmu terus bertumbuh.'
          },
          'Menjadi Teladan': {
            descriptor: 'Berani mencoba dan menerima kegagalan sebagai bagian dari proses belajar.',
            nextStep: 'Beri semangat kepada teman yang masih ragu mencoba agar divisi menjadi ruang berkarya yang aman dan hangat.'
          }
        }
      }
    ]
  },
  {
    id: 'kebinekaan',
    name: 'Berkebinekaan Global',
    formasi: 'Pastoral dan Spiritual',
    stYosefValues: 'Kerendahan hati, menghargai sesama',
    rumusan: 'Siswa menghargai keberagaman Nusantara dengan rendah hati, menjadikannya jalan menghormati sesama.',
    indicators: [
      {
        code: 'N1',
        title: 'Menghargai budaya yang dipelajari',
        stageHint: 'Ditekankan pada Tahap Explore & Research',
        levels: {
          'Mulai Tumbuh': {
            descriptor: 'Mengenal cerita dan unsur budaya sebatas tugas.',
            nextStep: 'Pahami pesan moral dan makna luhur di balik cerita rakyat serta musik tradisional yang kamu pelajari.'
          },
          'Berkembang': {
            descriptor: 'Memahami makna di balik cerita dan musik tradisional.',
            nextStep: 'Sajikan karya budaya tersebut dengan hormat dan bagikan pemaknaannya kepada teman atau penonton.'
          },
          'Menjadi Teladan': {
            descriptor: 'Menyajikan budaya dengan hormat dan menjelaskan maknanya kepada penonton atau teman.',
            nextStep: 'Terus rawat sikap hormat terhadap kekayaan tradisi Nusantara sebagai ungkapan syukur atas keberagaman.'
          }
        }
      },
      {
        code: 'N2',
        title: 'Sikap terbuka terhadap perbedaan',
        levels: {
          'Mulai Tumbuh': {
            descriptor: 'Nyaman hanya dengan yang sudah dikenal.',
            nextStep: 'Latih keterbukaan dengan mendengarkan pendapat teman dari latar belakang atau kemampuan yang berbeda.'
          },
          'Berkembang': {
            descriptor: 'Menerima teman yang berbeda latar belakang, pendapat, atau kemampuan.',
            nextStep: 'Aktiflah menghargai keunikan masing-masing anggota dan menjadikannya kekuatan saling melengkapi dalam tim.'
          },
          'Menjadi Teladan': {
            descriptor: 'Menghargai perbedaan secara aktif dan menjadikannya kekuatan tim.',
            nextStep: 'Jaga semangat inklusif di divisimu agar setiap teman merasa diterima, dihargai, dan dicintai.'
          }
        }
      },
      {
        code: 'N3',
        title: 'Kerendahan hati dalam berkarya',
        stageHint: 'Ditekankan pada Tahap Reflect',
        levels: {
          'Mulai Tumbuh': {
            descriptor: 'Sulit menerima masukan.',
            nextStep: 'Dengarkan saran teman dan guru dengan hati terbuka karena masukan membantu karyamu semakin matang.'
          },
          'Berkembang': {
            descriptor: 'Mau menerima kritik dan saran teman maupun guru.',
            nextStep: 'Berlatihlah rendah hati dengan tidak mencari sorotan pribadi dan mengakui jasa rekan tim dalam keberhasilan bersama.'
          },
          'Menjadi Teladan': {
            descriptor: 'Tidak mencari sorotan sendiri dan menyebut jasa teman dalam keberhasilan bersama.',
            nextStep: 'Terus hidupi semangat cinta melahirkan cinta melalui kerendahan hati dan pengakuan tulus atas peran sesama.'
          }
        }
      }
    ]
  }
];

export const ALL_BEHAVIOR_INDICATORS: (BehaviorIndicator & {
  dimensionId: DimensionId;
  dimensionName: string;
  formasi: FormasiHolistik;
  stYosefValues: string;
})[] = FIVE_HOLISTIC_DIMENSIONS.flatMap((dim) =>
  dim.indicators.map((ind) => ({
    ...ind,
    dimensionId: dim.id,
    dimensionName: dim.name,
    formasi: dim.formasi,
    stYosefValues: dim.stYosefValues
  }))
);

export const STAGE_RECOMMENDED_INDICATORS: Record<number, IndicatorCode[]> = {
  1: ['B1', 'N1'],       // Explore
  2: ['B1', 'N1'],       // Research
  3: ['K1', 'K3'],       // Create
  4: ['G1', 'G3', 'M1'], // Organize
  5: ['K2', 'M3', 'G2'], // Perform
  6: ['B3', 'M2', 'N3']  // Reflect
};

export interface Assessment {
  id: string;
  studentId: string;
  studentName: string;
  classGroup: ClassGroup;
  divisionId: string;
  divisionName: string;
  projectStage: string;
  stageNumber: number;
  dimensionId: DimensionId;
  dimensionName: string;
  formasiGrandDesain: FormasiHolistik;
  indicatorCode: IndicatorCode;
  indicatorTitle: string;
  growthLevel: GrowthLevel;
  internalScore: 1 | 2 | 3; // Internal only; NEVER shown as number to students
  nextStepMessage: string;
  feedback?: string; // Optional additional formative narrative
  teacherId: string;
  teacherName: string;
  date: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SelfAssessment {
  id: string;
  studentId: string;
  studentName: string;
  classGroup: ClassGroup;
  primaryDivisionId?: string;
  secondaryDivisionId?: string;
  dimensionId: DimensionId;
  dimensionName: string;
  indicatorCode: IndicatorCode;
  indicatorTitle: string;
  growthLevel: GrowthLevel;
  reflectionNote?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface StudentReflection {
  id: string; // equals studentId (filled ONCE summarizing all divisions)
  studentId: string;
  studentName: string;
  classGroup: ClassGroup;
  primaryDivisionId: string;
  secondaryDivisionId?: string;
  // 5 Pertanyaan Refleksi Relasional
  whoHelpedMeGrow: string;          // Siapa yang membantu saya bertumbuh selama proyek ini?
  whoIHelpedAndHowItFelt: string;   // Siapa yang saya bantu, dan bagaimana rasanya?
  whenIFeltValued: string;          // Kapan saya merasa dihargai dalam kelompok?
  whatIAmMostGratefulFor: string;   // Apa yang paling saya syukuri dari proses ini?
  whatIWantToImprove: string;       // Apa yang ingin saya perbaiki untuk proyek berikutnya?
  // Refleksi Karya & Identitas Budaya
  projectReflectionSummary: string; // Apa yang berhasil, tantangan, dan penghargaan terhadap budaya Nusantara
  // Pemetaan Amor Gignit Amorem (Pendampingan kualitatif, tanpa skor & tanpa perbandingan)
  mengalamiCintaNote?: string;      // Mengalami cinta: bagaimana siswa mengalami kasih/dukungan
  menghidupiCintaNote?: string;     // Menghidupi cinta: bagaimana siswa melayani/mengasihi tim
  meneruskanCintaNote?: string;     // Meneruskan cinta: rencana nyata membantu sesama setelah proyek
  isSubmitted: boolean;
  submittedAt?: string;
  updatedAt?: string;
}

export type AppreciationType = 'teacher_appreciation' | 'peer_appreciation' | 'special_contribution';

export interface Appreciation {
  id: string;
  type: AppreciationType;
  toStudentId: string;
  toStudentName: string;
  toClassGroup: ClassGroup;
  divisionId?: string;
  divisionName?: string;
  fromUserId: string;
  fromStudentId?: string;
  fromName: string;
  fromRole: UserRole;
  message: string;
  badgeTitle?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface HomeroomNote {
  id: string; // hr_${studentId}
  studentId: string;
  studentName: string;
  classGroup: ClassGroup;
  teacherId: string;
  teacherName: string;
  attitudeNote: string;
  independenceNote: string;
  holisticInvolvementNote: string;
  needsFollowUp: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type ProgressStatus = 'Belum Dimulai' | 'Sedang Berjalan' | 'Tersendat / Perlu Sapaan' | 'Selesai';

export interface ProgressLog {
  id: string;
  studentId: string;
  studentName: string;
  classGroup: ClassGroup;
  primaryDivisionId?: string;
  secondaryDivisionId?: string;
  stageTitle: string;
  stageNumber: number;
  description: string;
  status: ProgressStatus;
  milestoneDate: string;
  artifactsNote?: string;
  teacherFeedback?: string;
  studentReflection?: string;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const DEFAULT_PROJECT_STAGES = [
  {
    stageNumber: 1,
    title: 'Tahap 1: Explore',
    description: 'Murid mengeksplorasi lagu daerah, gamelan, musik tradisional, alat musik Nusantara, tangga nada, ritme, fungsi sosial musik, konteks budaya. Output: Peta eksplorasi musik Nusantara.'
  },
  {
    stageNumber: 2,
    title: 'Tahap 2: Research',
    description: 'Murid terbagi menjadi kelompok dan memilih satu karya (Gundhul-Gundhul Pacul, Yamko Rambe Yamko, Cublak-Cublak Suweng, Ampar-Ampar Pisang, Anging Mammiri, Apuse, dsb). Menggali: asal daerah, pencipta/riwayat, fungsi, makna, karakter musikal, instrumen, konteks sosial-budaya. Output: Lembar riset budaya dan musik.'
  },
  {
    stageNumber: 3,
    title: 'Tahap 3: Create',
    description: 'Murid menentukan: bentuk penyajian, instrumen, konsep aransemen, pembagian suara, tempo, dinamika, struktur lagu, unsur tradisional yang dipertahankan, serta unsur modern yang dikembangkan. Output: Konsep karya/aransemen dalam pertunjukan seni.'
  },
  {
    stageNumber: 4,
    title: 'Tahap 4: Organize',
    description: 'Murid menentukan pilihan peran dalam 7 Divisi Kepanitiaan DPK:\n1. Teater\n2. Kesenian Tradisional\n3. Kesenian Modern\n4. Visual dan Dokumentasi\n5. Logistik dan Konsumsi\n6. Ticketing\n7. Produksi dan Manajemen Panggung.'
  },
  {
    stageNumber: 5,
    title: 'Tahap 5: Perform',
    description: 'Murid melaksanakan latihan intensif (Blok 16–19 November 2026), evaluasi berkala, perbaikan karya, technical rehearsal, dress rehearsal, dan pagelaran akbar Gelar Karya Symphony of Nusantara (20 November 2026).'
  },
  {
    stageNumber: 6,
    title: 'Tahap 6: Reflect',
    description: 'Refleksi relasional dan evaluasi karya satu kali secara menyeluruh di semua divisi, menyentuh pengalaman mengalami cinta, menghidupi cinta, dan meneruskan cinta (Amor Gignit Amorem).'
  }
];

export const PROJECT_PHILOSOPHY = {
  quote: 'Peserta didik tidak hanya tampil, tetapi juga merencanakan, memproduksi, dan mengevaluasi sendiri pertunjukannya, sementara guru mendampingi dan menilai prosesnya, bukan hanya hasil akhirnya.',
  motto: SCHOOL_MOTTO.full,
  eventTitle: 'Gelar Karya Symphony of Nusantara',
  eventTheme: 'Merajut Keberagaman Nusantara melalui Pertunjukan Seni',
  targetGrade: 'Kelas X (Fase E - Rombel X-1 s/d X-6)',
  committeeName: 'DPK (Dewan Pagelaran Kokurikuler)'
};

export interface DpkDivision {
  id: string;
  name: string;
  shortName: string;
  category: string;
  roles: string[];
  responsibilities: string;
}

export const SEVEN_DPK_DIVISIONS: DpkDivision[] = [
  {
    id: 'div-teater',
    name: '1. Divisi Teater',
    shortName: 'Teater',
    category: 'Teater',
    roles: [
      'Pemeran Tokoh Drama Musikal (Malin Kundang, Timun Mas, Roro Jonggrang, Bawang Merah & Putih, Ibu Fatmawati)',
      'Sutradara & Asisten Sutradara Teater',
      'Penata Naskah & Dialek Karakter',
      'Pelatih Olah Tubuh & Olah Vokal Adegan',
      'Pemeran Pendukung & Ensemble Drama'
    ],
    responsibilities: 'Menghidupkan penokohan dan alur cerita Hikayat Nusantara, penguasaan dialog, penjiwaan karakter, pemblokiran panggung, serta penjiwaan pesan persatuan di bawah Sang Saka Merah Putih.'
  },
  {
    id: 'div-seni-tradisional',
    name: '2. Divisi Kesenian Tradisional',
    shortName: 'Kesenian Tradisional',
    category: 'Kesenian Tradisional',
    roles: [
      'Penari Tradisional Kolosal Nusantara',
      'Pengrawit Gamelan & Perkusi Etnik (Kendang, Saron, Gong, Bonang)',
      'Pemain Musik Keroncong Nusantara',
      'Koreografer Gerak Tari Tradisional Daerah',
      'Arranger Musik Etnik & Tradisional'
    ],
    responsibilities: 'Merancang, melatih, dan menyajikan kekayaan gerak tari tradisional daerah nusantara, komposisi gamelan/karawitan, dan alunan musik keroncong sebagai pembuka dan pengiring teatrikal.'
  },
  {
    id: 'div-seni-modern',
    name: '3. Divisi Kesenian Modern',
    shortName: 'Kesenian Modern',
    category: 'Kesenian Modern',
    roles: [
      'Pemain Band Modern & Kolaborasi Etnik (Gitar, Bass, Keyboard, Drum)',
      'Vokalis Solo & Duet Pertunjukan',
      'Paduan Suara / Backing Vocal Modern',
      'Arranger Komposisi Lagu & Aransemen Modern',
      'Koreografer Gerak Modern Kontemporer'
    ],
    responsibilities: 'Mengaransemen dan menampilkan musik band pembuka, eksplorasi vokal modern dan harmoni paduan suara, serta menggarap aransemen lagu kontemporer pengiring pertunjukan drama musikal.'
  },
  {
    id: 'div-visual-dokumentasi',
    name: '4. Divisi Visual dan Dokumentasi',
    shortName: 'Visual & Dokumentasi',
    category: 'Visual & Dokumentasi',
    roles: [
      'Fotografer Resmi Pagelaran & Proses Blok',
      'Videografer & Editor Video Kilas Balik / Dokumenter',
      'Desainer Grafis (Poster, Feed Medsos, Backdrop Digital, Buku Acara)',
      'Tim Publikasi Media Sosial & Humas Acara',
      'Operator Siaran Langsung (Live Streaming) & Arsip Digital'
    ],
    responsibilities: 'Mendokumentasikan seluruh proses 6 tahap pembelajaran kokurikuler, merancang seluruh materi visual promosi, publikasi media, pembuatan buku panduan acara, dan siaran dokumentasi.'
  },
  {
    id: 'div-logistik-konsumsi',
    name: '5. Divisi Logistik dan Konsumsi',
    shortName: 'Logistik & Konsumsi',
    category: 'Logistik & Konsumsi',
    roles: [
      'Koordinator Inventaris Perlengkapan & Transportasi Alat',
      'Tim Kostum & Tata Busana Adat Karakter Nusantara',
      'Tim Tata Rias (Make-up) Karakter Drama & Tari',
      'Koordinator Konsumsi Pemain, Panitia DPK & Guru Pendamping',
      'Tim Distribusi Konsumsi Harian Blok Intensif & Malam Puncak',
      'Penanggung Jawab Pemeliharaan Aset & Kebersihan Area'
    ],
    responsibilities: 'Menyediakan, mendistribusikan, dan merawat seluruh kebutuhan instrumen, transportasi alat, busana adat tokoh, tata rias wajah panggung, serta menjamin suplai konsumsi bergizi bagi seluruh panitia, penampil, dan tamu selama proses latihan hingga malam puncak.'
  },
  {
    id: 'div-ticketing',
    name: '6. Divisi Ticketing',
    shortName: 'Ticketing',
    category: 'Ticketing',
    roles: [
      'Koordinator Desain & Penomoran Tiket Masuk',
      'Tim Registrasi & Scanner Tiket (Open Gate 18.30 WIB)',
      'Front-of-House (FOH) & Usher Pemandu Tempat Duduk Penonton',
      'Petugas Informasi & Helpdesk Tiket Undangan',
      'Rekapitulasi Presensi Tamu Undangan, Orang Tua & VIP'
    ],
    responsibilities: 'Mengelola tata kelola penomoran, distribusi tiket undangan, registrasi kehadiran penonton saat open gate 18.30 WIB, pengawalan alur masuk penonton ke auditorium secara tertib dan nyaman, serta pelaporan data presensi kehadiran tamu.'
  },
  {
    id: 'div-produksi-manajemen-panggung',
    name: '7. Divisi Produksi dan Manajemen Panggung',
    shortName: 'Produksi & Manajemen Panggung',
    category: 'Produksi & Manajemen Panggung',
    roles: [
      'Stage Manager (SM) & Assistant Stage Manager (ASM)',
      'Ketua Pelaksana & Pimpinan Produksi DPK',
      'Art Director Panggung & Tim Set Dekorasi Hikayat Nusantara',
      'Sound Engineer & Operator Audio Panggung',
      'Lighting Director (Tata Cahaya & Efek Lampu Dramatis)',
      'Timekeeper (Penjaga Durasi Pentas Drama Musikal Maks. 60 Menit)',
      'Floor Manager, Backstage Caller & Liaison Officer (LO) Tamu VIP',
      'Sekretaris & Bendahara DPK (Tata Kelola Anggaran & Izin Teknis)'
    ],
    responsibilities: 'Poros kendali operasional pagelaran: memimpin tata panggung dekorasi Hikayat Nusantara, mengontrol pencahayaan dan tata suara, menegakkan disiplin waktu rundown, serta mengkoordinasikan kepemimpinan produksi, alokasi anggaran, dan kesiapan panggung.'
  }
];

export const getDivisionById = (id?: string): DpkDivision | undefined =>
  SEVEN_DPK_DIVISIONS.find((d) => d.id === id);

export interface DailyTimeSlot {
  time: string;
  duration?: string;
  activity: string;
}

export interface BlokDaySchedule {
  dayName: string;
  date: string;
  mainFocus: string;
  description: string;
  outputMilestone: string;
  hourlyPattern: DailyTimeSlot[];
}

export const DAILY_CONSISTENT_PATTERN: DailyTimeSlot[] = [
  {
    time: '10.30 – 10.45',
    duration: '15 menit',
    activity: 'Doa, presensi, briefing harian tujuan dan target hari ini'
  },
  {
    time: '10.45 – 11.50',
    duration: '60 menit',
    activity: 'Kerja divisi, sesi 1'
  },
  {
    time: '11.50 – 12.10',
    duration: '30 menit',
    activity: 'Istirahat'
  },
  {
    time: '12.10 – 13.30',
    duration: '85 menit',
    activity: 'Kerja divisi, sesi 2 latihan tiap divisi'
  },
  {
    time: '13.30 – 14.10',
    duration: '30 menit',
    activity: 'Koordinasi lintas divisi, refleksi harian, dan penutup'
  }
];

export const BLOK_INTENSIF_SCHEDULE: BlokDaySchedule[] = [
  {
    dayName: 'Senin',
    date: '16 November 2026',
    mainFocus: 'Menyusun Rencana Kerja & Naskah',
    description: 'Menyusun rencana kerja terperinci divisi, timeline teknis, finalisasi naskah drama musikal, dan rincian kebutuhan properti.',
    outputMilestone: 'Dokumen Rencana Kerja 7 Divisi & Naskah Final Drama Musikal Hikayat Nusantara.',
    hourlyPattern: [
      { time: '10.30 – 10.45', duration: '15 menit', activity: 'Doa, presensi, briefing harian tujuan dan target hari ini' },
      { time: '10.45 – 11.50', duration: '60 menit', activity: 'Kerja divisi, sesi 1: bedah naskah drama, alur koordinasi teknis, & analisis kebutuhan properti' },
      { time: '11.50 – 12.10', duration: '30 menit', activity: 'Istirahat' },
      { time: '12.10 – 13.30', duration: '85 menit', activity: 'Kerja divisi, sesi 2 latihan tiap divisi: pembagian peran detail, pembacaan naskah (table read), & RAB divisi' },
      { time: '13.30 – 14.10', duration: '30 menit', activity: 'Koordinasi lintas divisi, refleksi harian, dan penutup' }
    ]
  },
  {
    dayName: 'Selasa',
    date: '17 November 2026',
    mainFocus: 'Menggarap & Menyempurnakan Karya',
    description: 'Latihan intensif pemblokiran adegan drama, sinkronisasi musik pengiring, vokal, tarian, dan pembuatan properti panggung.',
    outputMilestone: 'Karya aransemen matang, gerakan tari presisi, dan properti fisik Hikayat Nusantara selesai 80%.',
    hourlyPattern: [
      { time: '10.30 – 10.45', duration: '15 menit', activity: 'Doa, presensi, briefing harian tujuan dan target hari ini' },
      { time: '10.45 – 11.50', duration: '60 menit', activity: 'Kerja divisi, sesi 1: latihan pemblokiran adegan drama & pengerjaan properti fisik panggung' },
      { time: '11.50 – 12.10', duration: '30 menit', activity: 'Istirahat' },
      { time: '12.10 – 13.30', duration: '85 menit', activity: 'Kerja divisi, sesi 2 latihan tiap divisi: gabungan musik pembuka (band, tari, keroncong) & latihan vokal' },
      { time: '13.30 – 14.10', duration: '30 menit', activity: 'Koordinasi lintas divisi, refleksi harian, dan penutup' }
    ]
  },
  {
    dayName: 'Rabu',
    date: '18 November 2026',
    mainFocus: 'Run-Through Pertama & Pemasangan Perlengkapan',
    description: 'Uji alur panggung keseluruhan pertama (run-through), pemasangan instalasi panggung, setting sound system & tata lampu.',
    outputMilestone: 'Simulasi alur utuh tanpa henti (Run-through 1) dan instalasi panggung terpasang.',
    hourlyPattern: [
      { time: '10.30 – 10.45', duration: '15 menit', activity: 'Doa, presensi, briefing harian tujuan dan target hari ini' },
      { time: '10.45 – 11.50', duration: '60 menit', activity: 'Kerja divisi, sesi 1: instalasi panggung, setting tata suara (sound system), & cek tata lampu' },
      { time: '11.50 – 12.10', duration: '30 menit', activity: 'Istirahat' },
      { time: '12.10 – 13.30', duration: '85 menit', activity: 'Kerja divisi, sesi 2 latihan tiap divisi: uji coba Run-Through 1 alur utuh tanpa henti (Band, Tari, Keroncong, Drama Musikal)' },
      { time: '13.30 – 14.10', duration: '30 menit', activity: 'Koordinasi lintas divisi, refleksi harian, dan penutup: evaluasi catatan Stage Manager' }
    ]
  },
  {
    dayName: 'Kamis',
    date: '19 November 2026',
    mainFocus: 'Gladi Bersih & Pengecekan Kesiapan Akhir',
    description: 'Gladi bersih lengkap dengan kostum dan tata rias (Dress Rehearsal), finalisasi tata lampu, dan checklist kesiapan hari H.',
    outputMilestone: 'Gladi Bersih Sempurna, Checklist Kesiapan Hari H 100% Terverifikasi.',
    hourlyPattern: [
      { time: '10.30 – 10.45', duration: '15 menit', activity: 'Doa, presensi, briefing harian tujuan dan target hari ini' },
      { time: '10.45 – 11.50', duration: '60 menit', activity: 'Kerja divisi, sesi 1: persiapan kostum lengkap, tata rias, & technical rehearsal check' },
      { time: '11.50 – 12.10', duration: '30 menit', activity: 'Istirahat' },
      { time: '12.10 – 13.30', duration: '85 menit', activity: 'Kerja divisi, sesi 2 latihan tiap divisi: Gladi Bersih penuh (Dress Rehearsal) sesuai alur rundown hari H' },
      { time: '13.30 – 14.10', duration: '30 menit', activity: 'Koordinasi lintas divisi, refleksi harian, dan penutup: final briefing kesiapan pentas akbar 20 Nov 2026' }
    ]
  }
];

export const SHOWCASE_NIGHT_DETAILS = {
  date: 'Jumat, 20 November 2026',
  openGate: '18.30 WIB',
  endTime: '22.00 WIB',
  venue: 'Auditorium / Panggung Terbuka SMA Pangudi Luhur St. Yosef Surakarta',
  musicalDramaMaxDuration: '60 Menit (1 Jam)',
  narrativeUniverse: {
    title: 'Drama Musikal Kolosal "Hikayat Nusantara"',
    characters: [
      { name: 'Malin Kundang', origin: 'Sumatera Barat', arc: 'Penyesalan, pengakuan kesalahan, dan pencarian jati diri anak bangsa.' },
      { name: 'Timun Mas', origin: 'Jawa Tengah', arc: 'Keberanian menghadapi raksasa ketakutan dan kegigihan memperjuangkan kebaikan.' },
      { name: 'Roro Jonggrang', origin: 'D.I. Yogyakarta', arc: 'Keteguhan pendirian, kebijaksanaan seni, dan keadilan moral.' },
      { name: 'Bawang Merah & Bawang Putih', origin: 'Kepulauan Riau / Melayu', arc: 'Penebusan rasa iri, keikhlasan hati, dan persaudaraan sejati.' },
      { name: 'Ibu Fatmawati', origin: 'Bengkulu / Nasional', arc: 'Ikon pemersatu yang menjahit bendera Sang Saka Merah Putih di tengah perbedaan karakter rakyat, menyampaikan kata mutiara pengikat kebhinekaan.' }
    ],
    climaxQuote: '"Di bawah kibaran Merah Putih yang kita rajut dengan benang kasih, luka dan perbedaan masa lalu luluh menjadi kekuatan persaudaraan abadi."'
  },
  rundown: [
    { time: '18.30 - 19.15', event: 'Open Gate, Registrasi Undangan, Pemutaran Kilas Balik Video DPK' },
    { time: '19.15 - 19.30', event: 'Pembukaan Resmi, Doa Bersama, Sambutan Kepala Sekolah' },
    { time: '19.30 - 19.50', event: 'Penampilan Pembuka I: Band Kolaborasi Etnik Nusantara' },
    { time: '19.50 - 20.10', event: 'Penampilan Pembuka II: Tari Tradisional Kreasi Daerah' },
    { time: '20.10 - 20.30', event: 'Penampilan Pembuka III: Musik Keroncong Remaja Nusantara' },
    { time: '20.30 - 21.30', event: 'Puncak Gelar Karya: Drama Musikal Kolosal "Hikayat Nusantara" (Pertemuan Tokoh Dongeng Nusantara & Ibu Fatmawati Menjahit Bendera) [Maks. 60 Menit]' },
    { time: '21.30 - 21.45', event: 'Grand Finale: Seluruh Pemain, Pemusik, dan Panitia DPK Menyanyikan Lagu Persatuan' },
    { time: '21.45 - 22.00', event: 'Penutupan, Pengumuman Apresiasi, dan Sesi Foto Bersama' }
  ]
};

export const BLOCK_ASSESSMENT_PILLARS = [
  { name: 'Proses', weight: '25%', description: 'Kedisiplinan briefing harian, keaktifan jam kerja divisi (10.30–14.10), dan kesetiaan pada proses pendampingan.' },
  { name: 'Produk', weight: '30%', description: 'Kesungguhan olahan karya, set panggung, naskah, tata rias, kostum, dan dokumentasi.' },
  { name: 'Kolaborasi', weight: '25%', description: 'Sinergi lintas kelas dalam divisi kepanitiaan DPK, saling melayani, dan merangkul sesama.' },
  { name: 'Refleksi Relasional', weight: '20%', description: 'Kejujuran refleksi diri dan pengalaman mengalami serta meneruskan kasih (Amor Gignit Amorem).' }
];

// Legacy feedback types kept for backward compatibility if any old docs exist
export type FeedbackCategory =
  | 'Apresiasi & Kekuatan'
  | 'Area Pengembangan & Rekomendasi'
  | 'Harmonisasi Tim & Kolaborasi'
  | 'Penguasaan Instrumen / Vokal'
  | 'Kedisiplinan & Sikap Budaya'
  | 'Umum';

export type EncouragementBadge =
  | 'Bintang Pagelaran'
  | 'Inspirasi Nusantara'
  | 'Harmoni Teladan'
  | 'Eksplorasi Gigih'
  | 'Kreativitas Unggul';

export interface ProjectFeedback {
  id: string;
  studentId: string;
  studentName: string;
  classGroup: ClassGroup;
  teacherId: string;
  teacherName: string;
  teacherEmail?: string;
  teacherPhoto?: string;
  category: FeedbackCategory;
  comment: string;
  projectStage?: string;
  encouragementBadge?: EncouragementBadge;
  studentReply?: string;
  repliedAt?: string;
  isReadByStudent?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
