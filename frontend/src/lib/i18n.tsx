import { useSyncExternalStore } from "react";

export type Lang = "EN" | "UK";
const KEY = "nexus_lang";
const listeners = new Set<() => void>();

function read(): Lang {
  if (typeof window === "undefined") return "EN";
  const v = localStorage.getItem(KEY);
  return v === "UK" ? "UK" : "EN";
}

export function setLang(l: Lang) {
  if (typeof window !== "undefined") localStorage.setItem(KEY, l);
  listeners.forEach((f) => f());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

export function useLang(): Lang {
  return useSyncExternalStore(subscribe, read, () => "EN");
}

const dict = {
  EN: {
    // header
    nav_home: "HOME",
    nav_zones: "ZONES",
    nav_packages: "PACKAGES",
    nav_tournaments: "TOURNAMENTS",
    nav_gallery: "GALLERY",
    nav_dashboard: "DASHBOARD",
    nav_login: "LOGIN // BOOK",
    // hero
    sys_online: "// SYSTEM ONLINE",
    hero_your: "YOUR",
    hero_arena: "ARENA",
    hero_awaits: "AWAITS",
    hero_desc:
      "Step into NEXUS — a cyberpunk-grade computer lounge engineered for esports warriors, streamers, and explorers of virtual worlds. 24/7 access, RTX 4090 rigs, VR decks, tournament arenas.",
    btn_book_seat: "BOOK A SEAT",
    btn_explore_zones: "EXPLORE ZONES",
    stat_pcs_label: "50+ PCs",
    stat_games_label: "200+ Games",
    stat_access_label: "24/7 Access",
    stat_tourney_label: "Tourney Ready",
    stat_tourney_val: "PRO",
    // sections
    eyebrow_sectors: "// SECTORS",
    title_zones: "ZONES OF POWER",
    eyebrow_tariffs: "// TARIFFS",
    title_packages: "SELECT YOUR PACKAGE",
    eyebrow_live: "// LIVE GRID",
    title_seatmap: "REAL-TIME SEAT MAP",
    seatmap_desc: "Live workstation availability — updated in real-time.",
    seatmap_available: "AVAILABLE",
    seatmap_occupied: "OCCUPIED",
    seatmap_vip: "VIP",
    available_word: "AVAILABLE",
    eyebrow_competition: "// COMPETITION",
    title_upcoming_tour: "UPCOMING TOURNAMENTS",
    eyebrow_highlights: "// HIGHLIGHTS",
    title_gallery: "GALLERY",
    eyebrow_signal: "// SIGNAL",
    title_reviews: "WHAT GAMERS SAY",
    view_seats: "VIEW SEATS",
    select_btn: "SELECT",
    register_btn: "REGISTER",
    prize_pool: "prize pool",
    start_lbl: "START",
    all_filter: "All",
    per_hour: "/hr",
    min_word: "MIN",
    // footer
    footer_tagline:
      "Where pixels meet adrenaline. The premier cyberpunk gaming destination.",
    footer_hours: "HOURS",
    footer_hours_24: "24/7 ACCESS",
    footer_hours_vip: "VIP Lounge: Always",
    footer_hours_tour: "Tournament Nights: Fri-Sat",
    footer_contact: "CONTACT",
    footer_connect: "CONNECT",
    footer_nominal: "ALL SYSTEMS NOMINAL",
    // auth
    auth_system_access: "// SYSTEM ACCESS",
    auth_login: "LOGIN",
    auth_register: "REGISTER",
    auth_email: "EMAIL",
    auth_password: "PASSWORD",
    auth_sign_in: "SIGN IN",
    auth_gamertag: "GAMERTAG",
    auth_full_name: "FULL NAME",
    auth_phone: "PHONE",
    auth_create: "CREATE ACCOUNT",
    auth_or: "— OR —",
    auth_google: "CONTINUE WITH GOOGLE",
    auth_return: "← RETURN TO BASE",
    auth_denied: "ACCESS DENIED",
    auth_granted: "SYSTEM ACCESS GRANTED.",
    auth_reg_failed: "REGISTRATION FAILED",
    auth_welcome: "WELCOME",
    auth_oauth_err: "OAUTH ERROR",
    // dashboard
    dash_loading: "LOADING SYSTEM...",
    dash_vip: "VIP",
    dash_admin: "ADMIN",
    dash_logout: "LOGOUT",
    dash_lvl: "LVL",
    dash_xp: "XP",
    dash_sessions: "Sessions",
    dash_hours: "Hours",
    dash_new_session: "NEW SESSION",
    dash_my_sessions: "MY SESSIONS",
    dash_tournaments: "TOURNAMENTS",
    dash_profile: "PROFILE",
    dash_step1: "1. SELECT PACKAGE",
    dash_step2: "2. SELECT ZONE & SEAT",
    dash_step3: "3. DATE & TIME",
    dash_step4: "4. CONFIRM",
    dash_complete_all: "COMPLETE ALL STEPS",
    dash_booked: "SESSION BOOKED. PREPARE FOR BATTLE.",
    dash_confirm_booking: "CONFIRM BOOKING",
    dash_package: "PACKAGE",
    dash_zone: "ZONE",
    dash_seat: "SEAT",
    dash_start: "START",
    dash_total: "TOTAL",
    dash_upcoming: "UPCOMING",
    dash_no_upcoming: "No upcoming sessions. Book one.",
    dash_past: "PAST",
    dash_cancel: "CANCEL",
    dash_cancelled: "SESSION CANCELLED.",
    dash_session_active: "YOUR SESSION IS NOW ACTIVE. ENJOY!",
    dash_session_done: "SESSION COMPLETE.",
    dash_xp_earned: "XP EARNED.",
    dash_registered: "REGISTERED",
    dash_glhf: "REGISTERED. GLHF.",
    dash_save_profile: "SAVE PROFILE",
    dash_profile_saved: "PROFILE SAVED.",
    dash_avatar: "AVATAR URL",
    dash_achievements: "ACHIEVEMENTS",
    // admin
    admin_ops: "// ADMIN OPS",
    admin_live: "LIVE MONITOR",
    admin_authorizing: "AUTHORIZING...",
    admin_access_denied: "ACCESS DENIED. INSUFFICIENT CLEARANCE.",
    admin_today_rev: "TODAY REVENUE",
    admin_active_now: "ACTIVE NOW",
    admin_total: "TOTAL BOOKINGS",
    admin_status_updated: "STATUS UPDATED.",
    admin_analytics: "ANALYTICS",
    admin_rev_by_zone: "REVENUE BY ZONE",
    admin_book_14: "BOOKINGS · LAST 14 DAYS",
    admin_book_tier: "BOOKINGS BY TIER",
  },
  UK: {
    // header
    nav_home: "ГОЛОВНА",
    nav_zones: "ЗОНИ",
    nav_packages: "ТАРИФИ",
    nav_tournaments: "ТУРНІРИ",
    nav_gallery: "ГАЛЕРЕЯ",
    nav_dashboard: "КАБІНЕТ",
    nav_login: "УВІЙТИ // БРОНЬ",
    // hero
    sys_online: "// СИСТЕМА ОНЛАЙН",
    hero_your: "ТВОЯ",
    hero_arena: "АРЕНА",
    hero_awaits: "ЧЕКАЄ",
    hero_desc:
      "Завітай у NEXUS — кіберпанковий комп'ютерний клуб для кіберспортсменів, стримерів і мандрівників віртуальних світів. Доступ 24/7, ПК на RTX 4090, VR-станції, турнірні арени.",
    btn_book_seat: "ЗАБРОНЮВАТИ МІСЦЕ",
    btn_explore_zones: "ОГЛЯНУТИ ЗОНИ",
    stat_pcs_label: "50+ ПК",
    stat_games_label: "200+ Ігор",
    stat_access_label: "Доступ 24/7",
    stat_tourney_label: "Турнірний рівень",
    stat_tourney_val: "ПРО",
    // sections
    eyebrow_sectors: "// СЕКТОРИ",
    title_zones: "ЗОНИ СИЛИ",
    eyebrow_tariffs: "// ТАРИФИ",
    title_packages: "ОБЕРИ СВІЙ ТАРИФ",
    eyebrow_live: "// ЖИВА СІТКА",
    title_seatmap: "КАРТА МІСЦЬ У РЕАЛЬНОМУ ЧАСІ",
    seatmap_desc:
      "Доступність робочих станцій у реальному часі — оновлюється миттєво.",
    seatmap_available: "ВІЛЬНО",
    seatmap_occupied: "ЗАЙНЯТО",
    seatmap_vip: "VIP",
    available_word: "ВІЛЬНО",
    eyebrow_competition: "// ЗМАГАННЯ",
    title_upcoming_tour: "НАЙБЛИЖЧІ ТУРНІРИ",
    eyebrow_highlights: "// МОМЕНТИ",
    title_gallery: "ГАЛЕРЕЯ",
    eyebrow_signal: "// СИГНАЛ",
    title_reviews: "ВІДГУКИ ГРАВЦІВ",
    view_seats: "ОБРАТИ МІСЦЕ",
    select_btn: "ОБРАТИ",
    register_btn: "ЗАРЕЄСТРУВАТИСЬ",
    prize_pool: "призовий фонд",
    start_lbl: "СТАРТ",
    all_filter: "Усі",
    per_hour: "/год",
    min_word: "ХВ",
    // footer
    footer_tagline:
      "Де пікселі зустрічаються з адреналіном. Топовий кіберпанк-клуб для геймерів.",
    footer_hours: "ГРАФІК",
    footer_hours_24: "ДОСТУП 24/7",
    footer_hours_vip: "VIP-зал: Завжди",
    footer_hours_tour: "Турнірні ночі: Пт-Сб",
    footer_contact: "КОНТАКТИ",
    footer_connect: "СОЦМЕРЕЖІ",
    footer_nominal: "УСІ СИСТЕМИ В НОРМІ",
    // auth
    auth_system_access: "// ДОСТУП ДО СИСТЕМИ",
    auth_login: "ВХІД",
    auth_register: "РЕЄСТРАЦІЯ",
    auth_email: "EMAIL",
    auth_password: "ПАРОЛЬ",
    auth_sign_in: "УВІЙТИ",
    auth_gamertag: "НІКНЕЙМ",
    auth_full_name: "ПОВНЕ ІМʼЯ",
    auth_phone: "ТЕЛЕФОН",
    auth_create: "СТВОРИТИ АКАУНТ",
    auth_or: "— АБО —",
    auth_google: "ПРОДОВЖИТИ З GOOGLE",
    auth_return: "← ПОВЕРНУТИСЬ НА БАЗУ",
    auth_denied: "ДОСТУП ЗАБОРОНЕНО",
    auth_granted: "ДОСТУП НАДАНО.",
    auth_reg_failed: "ПОМИЛКА РЕЄСТРАЦІЇ",
    auth_welcome: "ВІТАЄМО",
    auth_oauth_err: "ПОМИЛКА OAUTH",
    // dashboard
    dash_loading: "ЗАВАНТАЖЕННЯ СИСТЕМИ...",
    dash_vip: "VIP",
    dash_admin: "АДМІН",
    dash_logout: "ВИЙТИ",
    dash_lvl: "РІВЕНЬ",
    dash_xp: "XP",
    dash_sessions: "Сесії",
    dash_hours: "Години",
    dash_new_session: "НОВА СЕСІЯ",
    dash_my_sessions: "МОЇ СЕСІЇ",
    dash_tournaments: "ТУРНІРИ",
    dash_profile: "ПРОФІЛЬ",
    dash_step1: "1. ОБЕРИ ТАРИФ",
    dash_step2: "2. ОБЕРИ ЗОНУ ТА МІСЦЕ",
    dash_step3: "3. ДАТА І ЧАС",
    dash_step4: "4. ПІДТВЕРДЖЕННЯ",
    dash_complete_all: "ЗАПОВНИ ВСІ КРОКИ",
    dash_booked: "СЕСІЮ ЗАБРОНЬОВАНО. ГОТУЙСЯ ДО БОЮ.",
    dash_confirm_booking: "ПІДТВЕРДИТИ БРОНЬ",
    dash_package: "ТАРИФ",
    dash_zone: "ЗОНА",
    dash_seat: "МІСЦЕ",
    dash_start: "СТАРТ",
    dash_total: "РАЗОМ",
    dash_upcoming: "НАЙБЛИЖЧІ",
    dash_no_upcoming: "Немає запланованих сесій. Заброньовуй.",
    dash_past: "МИНУЛІ",
    dash_cancel: "СКАСУВАТИ",
    dash_cancelled: "СЕСІЮ СКАСОВАНО.",
    dash_session_active: "ТВОЯ СЕСІЯ АКТИВНА. ВДАЛОЇ ГРИ!",
    dash_session_done: "СЕСІЮ ЗАВЕРШЕНО.",
    dash_xp_earned: "XP ОТРИМАНО.",
    dash_registered: "ЗАРЕЄСТРОВАНО",
    dash_glhf: "ЗАРЕЄСТРОВАНО. GL HF.",
    dash_save_profile: "ЗБЕРЕГТИ ПРОФІЛЬ",
    dash_profile_saved: "ПРОФІЛЬ ЗБЕРЕЖЕНО.",
    dash_avatar: "URL АВАТАРА",
    dash_achievements: "ДОСЯГНЕННЯ",
    // admin
    admin_ops: "// АДМІН-ПУЛЬТ",
    admin_live: "ЖИВИЙ МОНІТОР",
    admin_authorizing: "АВТОРИЗАЦІЯ...",
    admin_access_denied: "ДОСТУП ЗАБОРОНЕНО. НЕДОСТАТНІЙ РІВЕНЬ ДОПУСКУ.",
    admin_today_rev: "ВИРУЧКА ЗА ДЕНЬ",
    admin_active_now: "АКТИВНИХ ЗАРАЗ",
    admin_total: "ВСЬОГО БРОНЮВАНЬ",
    admin_status_updated: "СТАТУС ОНОВЛЕНО.",
    admin_analytics: "АНАЛІТИКА",
    admin_rev_by_zone: "ВИРУЧКА ЗА ЗОНАМИ",
    admin_book_14: "БРОНЮВАННЯ · ОСТАННІ 14 ДНІВ",
    admin_book_tier: "БРОНЮВАННЯ ЗА РІВНЕМ",
  },
} as const;

export type TKey = keyof typeof dict.EN;

export function useT() {
  const l = useLang();
  return (k: TKey): string => (dict[l] as Record<string, string>)[k] ?? dict.EN[k] ?? k;
}

export const LANG_LABELS: Record<Lang, string> = {
  EN: "EN · English",
  UK: "UA · Українська",
};
