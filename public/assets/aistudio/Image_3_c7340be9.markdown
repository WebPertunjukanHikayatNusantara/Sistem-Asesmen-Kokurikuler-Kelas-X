---
name: Symphony of Nusantara Assessment System
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#43474e'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#74777f'
  outline-variant: '#c4c6cf'
  surface-tint: '#465f86'
  primary: '#032448'
  on-primary: '#ffffff'
  primary-container: '#1f3a5f'
  on-primary-container: '#8ba4cf'
  inverse-primary: '#aec8f4'
  secondary: '#904d00'
  on-secondary: '#ffffff'
  secondary-container: '#fe932c'
  on-secondary-container: '#663500'
  tertiary: '#002925'
  on-tertiary: '#ffffff'
  tertiary-container: '#00413b'
  on-tertiary-container: '#42b4a7'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d5e3ff'
  primary-fixed-dim: '#aec8f4'
  on-primary-fixed: '#001c3b'
  on-primary-fixed-variant: '#2d476d'
  secondary-fixed: '#ffdcc3'
  secondary-fixed-dim: '#ffb77d'
  on-secondary-fixed: '#2f1500'
  on-secondary-fixed-variant: '#6e3900'
  tertiary-fixed: '#89f5e7'
  tertiary-fixed-dim: '#6bd8cb'
  on-tertiary-fixed: '#00201d'
  on-tertiary-fixed-variant: '#005049'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-hero:
    fontFamily: Plus Jakarta Sans
    fontSize: 44px
    fontWeight: '800'
    lineHeight: 52px
  display-hero-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '800'
    lineHeight: 40px
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 34px
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  title-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
  label-numeric:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
  label-badge:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-sm: 1rem
  margin: 2rem
  margin-sm: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

### Personality & Emotional Response
The design system embodies a dignified, modern educational ethos intertwined with the stately prestige of Indonesian heritage. It avoids folklore clichÃ©s, instead translating Nusantara motifs into architectural restraint, balance, and enlightened governance. The UI evokes:
- **Authority and Credibility**: Instilling confidence in educators evaluating holistic student competencies under the Kurikulum Merdeka framework.
- **Warmth and Empowerment**: Encouraging learners through thoughtful reflection, narrative growth, and celebrated milestones.
- **Clarity and Focus**: High-legibility administrative workflows balancing dense tabular analytics with expressive portfolio displays.

### Design Movement
**Refined Contemporary Editorial with Subtle Tonal Craft**: A fusion of structural Swiss clarity and maritime Nusantara warmth. Clean surfaces with ultra-crisp slate division lines frame deep maritime navy structural containers and radiant golden accents, producing an institutional yet aspirational character.

## Colors

### Palette Strategy & Application
- **Deep Heritage Navy (`#1F3A5F`)**: Anchors primary navigation, master headlines, key action buttons, and dominant data points. Conveys institutional trust and rigorous assessment standards.
- **Warm Golden Nusantara (`#D97706` / `#F59E0B`)**: Represents student discovery, exceptional achievements, active states, and honors badges. Used selectively to ensure high optical prestige without creating visual fatigue.
- **Nusantara Ocean Teal (`#0D9488`)**: Tertiary support for secondary progress metrics, dimensional balance, and cross-disciplinary holistic rubrics.
- **Surface Canvas (`#F8FAFC`, `#FFFFFF`)**: Pure neutral backdrops providing high contrast, preventing analytical clutter in score matrices and reflective journals.
- **Subtle Slate Borders (`#E2E8F0`)**: Structural dividers ensuring precise visual compartmentalization without heavy shadow reliance.

### Kokurikuler Assessment Status Scales (Kurikulum Merdeka)
The system standardizes the four-tier competency rubric with dedicated functional tokens:
- **Sangat Berkembang (SB)**: `Emerald-600` (`#059669`) with `Emerald-50` (`#ECFDF5`) background. Conveys mastery and exemplary contribution.
- **Berkembang Sesuai Harapan (BSH / B)**: `Teal-600` (`#0D9488`) with `Teal-50` (`#F0FDFA`) background. Reflects benchmark proficiency.
- **Mulai Berkembang (MB / C)**: `Amber-600` (`#D97706`) with `Amber-50` (`#FFFBEB`) background. Highlights progressive development.
- **Sedang Berkembang / Perlu Bimbingan (K)**: `Rose-600` (`#E11D48`) with `Rose-50` (`#FFF1F2`) background. Flags areas needing targeted intervention with supportive, non-punitive tone.

## Typography

### Structural Decisions
- **Plus Jakarta Sans**: Serves as the primary typographic pillar across headlines, body copy, and UI controls. Its Indonesian origins align conceptually with the system while providing balanced geometric counters and robust readability across multi-tier academic rubrics.
- **JetBrains Mono**: Used strictly for rubrics matrices, NISN identifiers, scoring codes, timestamps, and statistical comparisons in analytic charts. This eliminates optical drift across multi-column data views.

### Hierarchy & Editorial Rhythm
- Headlines maintain tight vertical metrics with `-0.02em` tracking on sizes above 24px to instill commanding structure.
- Reflection viewports (student qualitative feedback) leverage `body-lg` at 1.625 relative line-height to guarantee effortless sustained reading during detailed review sessions.

## Layout & Spacing

### Layout Architecture
- **Responsive Framework**: A 12-column fluid grid on desktop (`HL
HÚ]Hš^YX^[][HÛÛZ[™\ˆÚYÙˆMˆ˜[œÚ][ÛœÈ[È[ˆXÛÛ[[ˆ^[İ]ÛˆX›]È
ÍHLŒÜ
H[™HXÛÛ[[ˆÚ[™ÛK\İ™X[HY\˜\˜ÚHÛˆ[Øš[HšY]ÜÜÈ
Í
K‚‹H
Š”ÚYX˜\ˆ[YÜ˜][ÛŠŠˆXXÚ\ˆ[˜[]XÜÈÛÜšÜÜXÙ\È][^™HH\œÚ\İ[Y˜]šYØ][Ûˆ˜Z[ÈİY[™Y›Xİ[ÛˆÜ[È\ÙHHÙ[\™YÚ[™ÛKY›Øİ\ÈØ[˜\È
X^]ËM
HÈZYÚ[ˆ[[Y\œÚ[Û‹‚‹H
Š[˜[]XØ[ÜšYš]JŠˆ\ÜÙ\ÜÛY[Ü™XYÚY]È[™XœšXÜÈX›\ÈY\™HÈ[œÙH\™[X
ÜXÙK\ÛX
HÙ[Y[™ËÚ[H]X[]]]™HÜ›Û[È\Y˜XİÈ™[HÛˆÜXÙK[ØÈÜXÙK^Ù\\˜][ÛˆÈXZ[Z[ˆš\İX[YÛš]K‚‚ˆÈÈ[]˜][Ûˆ	ˆ\‚ˆÈÈÈ[ÜÛÜNˆÛ˜[œ˜[Z[™È	ˆØ\›H[XšY[\•H\ÚYÛˆŞ\İ[H]›ÚYÈX]HÚYİÜË[œİ\š[™È]H™[XZ[œÈÛX[ˆ[™›Ù™\ÜÚ[Û˜[ˆ\\ÈÜ™X]Y›İYÚİ\™˜XÙH^Y\š[™È[™Ø\›KÛÛ[‹][™ÙY[XšY[YÚ‚‚‹H
Š“]™[
˜\ÙHØ[˜\ÊJŠˆ˜XÚÙÜ›İ[™ÑQØˆÛÛ\][H›]‚‹H
Š“]™[H
Ø\™	ˆ[Ù[\ˆ[™[ÊJŠˆÛÛYÚ]HÑ‘‘‘‘‘˜›İ[™YHH\›Ü™\ˆÙˆÑL‘NŒˆ^Y\™YÚ]H˜Z[[XšY[ÚYİÎˆ\Ü™Ø˜JÌKNMKŒ
K\œL\™Ø˜JÌKNMKŒ
X‚‹H
Š“]™[ˆ
[\˜Xİ]™HØ\™ÈÈXœšXÈÙ[XİÜœÊJŠˆXİ]™Hİ™\ˆ[]˜][Ûˆ][^™\ÎˆLM\LÜ™Ø˜JÌKNMKŒÊKœM™Ø˜JŒMËLNK‹Œ
X[Û™ÜÚYHHİXH›Ü™\ˆ˜[œÚ][ÛˆÈĞĞ‘QLX‚‹H
Š“]™[È
[Ù[X[ÙÜÈ	ˆÜ˜Y[™È˜]Ù\œÊJŠˆİ\™˜XÙH›Ø][™È]ÜH	H˜]H˜XÚÙ›Ü›\ˆ
™Ø˜JMKŒË‹JXÚ]˜XÚÙ›ÜYš[\ˆ›\Š
X
KˆÚYİÎˆŒ\M\™Ø˜JÌKNMKŒLŠKLMœ™Ø˜JÌKNMKŒ
X‚‚ˆÈÈÚ\\Â‚ˆÈÈÈ›Ü›HÙ[ÛY]B•HÚ\H[™İXYÙH\ÈØ[Xœ˜]Y]]™[˜
›İ[™Yˆ˜\ÙH\™[HÈ
Kˆ\ÈÜ™X]\È\›ØXÚX›HY]İXİ\™Y[œİ]][Û˜[ÛÛË‚‹H
Š”İ[™\™ÛÛ›ÛÈ
[œ]Ë]ÛœË›ÜİÛœÊJŠˆ\™[X

H˜Y]\Ë‚‹H
ŠÛÛ[[™[È	ˆ[˜[]XØ[İ[[X\HØ\™ÊŠˆ›İ[™Y[Ø
\™[HÈMœ
K‚‹H
Š’\›È˜[›™\œÈ	ˆÜ›Û[ÈÚİØØ\ÙHÛÛZ[™\œÊŠˆ›İ[™Y^
K\™[HÈ
K‚‹H
Š”XœšXÈİ]\È˜YÙ\È	ˆ]ZXÚÈXİ[ÛˆÚ\ÊŠˆ[[Ù[ÛY]H
›İ[™YY[
HÈÛÛ˜\İYØZ[œİ™Xİ[[™X\ˆ]HX›\Ë‚‚ˆÈÈÛÛ\Û™[Â‚ˆÈÈÈ]ÛœÂ‹H
Š”š[X\H
[œİ]][Û˜[Xİ[ÛŠJŠˆ˜XÚÙÜ›İ[™ÌQŒĞMQ˜^Ú]K›Û]ÙZYÚŒˆ›Øİ\Ë\š[™ÈÚ]œÙ™œÙ][ˆÑMÍÌ˜ˆİ™\ˆİ]H\šÙ[œÈÈÌMŒMX‚‹H
Š”ÙXÛÛ™\H
\š]YÙHÛÛXØÙ[
JŠˆ˜XÚÙÜ›İ[™ÑMÍÌ˜^Ú]Kˆ\ÙY›ÜˆİX›Z\ÜÚ[Û‹š[˜[Ü˜YHØÚÚ[™ËÜˆİY[Ù\YšXØ]H^ÜËˆİ™\ˆİ]H˜[œÚ][ÛœÈÈĞLÌX‚‹H
Š‘ÚÜİÈ\X\JŠˆ˜[œÜ\™[İ\™˜XÙHÚ]\›Ü™\ˆÑL‘NŒ^ÌQŒĞMQ˜˜[œÚ][Ûš[™ÈÈÑŒQQXÛˆİ™\‹‚‚ˆÈÈÈXœšXÈİ]\È˜YÙ\È
Ğ‹‹ËÊB‹HYÚ]š\ÚXš[]H[[™XØ]ÜœÈ
L‹HKLH›İ[™YY[^^È›ÛX›Û\\˜Ø\ÙH˜XÚÚ[™Ë]ÚY\˜
K‚‹HXØÛÛ\[šYYHHœİ]\ÈİX]Ú[™ÈH›Ü™YÜ›İ[™ÛÛÜˆÈ[œİ\™HXØÙ\ÜÚXš[]HXÜ›ÜÜÈ[Û›ØÚ›ÛX]XÈš[[™Ë‚‚ˆÈÈÈ[œ]šY[È	ˆÜ˜Y[™ÈXœšXÈÛY\œÂ‹H˜XÚÙÜ›İ[™Ú]K›Ü™\ˆ\ĞĞ‘QLX[\›˜[Y[™ÈŒ\™[HÍ\™[X‚‹HXİ]™H›Øİ\Èİ]Nˆ›Ü™\ˆÚYÈÈY\\š]YÙH˜]H
ÌQŒĞMQ˜
HÚ]HÜÛÙ›Øİ\Èš[™È[Y[ˆÛÛ[ˆ\Ø[\˜H
™Ø˜JŒMËLNK‹ŒMJX
K‚‹H\œ›Üˆİ]Nˆ›Ü™\ˆÚYÈÈÑLLQÚ]HÛÙ›ÜÙH›Øİ\Èš[™Ë‚‚ˆÈÈÈ\ÜÙ\ÜÛY[Ø\™È	ˆİY[Ü›Û[È[\Â‹HX[]Y\ˆXY\ˆÜY]Y]Hİš\HÚ]İY[›Ú™Xİ[Y[œÚ[ÛˆYÜË›ÛİÙYH[ˆY]ÜšX[YYXHÛÛZ[™\‹‚‹H›İÛH›Ûİ\ˆØ\œšY\ÈHÛÚİ\šZİ[\ˆÛÛ\][˜ŞH˜Y\ˆXÛÛˆ[™H]\İXXÚ\ˆ™YY˜XÚÈÚYÛ˜]\™H›ØÚË‚‚ˆÈÈÈÛÛ\][˜ŞHX]š^Ù[XİÜ‚‹HHZ[Ü™YXÛÛ[[ˆ[›[™HÙ[XİÜˆ›ÜˆXXÚ\œÈÜ˜Y[™È[Y[œÚH›Ùš[[Z˜\ˆ[˜Ø\Ú[KˆXXÚÜ[Ûˆ[H™X]\™\ÈHİXH\›Ü™\ˆ][˜[ZXØ[Hš[ÈÚ]H\ÚYÛ˜]YXœšXÈÛÛÜˆ
[Y\˜[X[[X™\‹›ÜÙJH\ÛˆXİ]˜][Û‹›İšY[™È[œİ[ÜXØ[™YY˜XÚË