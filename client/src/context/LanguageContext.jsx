import { createContext, useContext, useMemo, useState } from "react";

const STORAGE_KEY = "e_prescription_lang";

const translations = {
  en: {
    appLang: "Language",
    langUz: "Uzbek",
    langRu: "Russian",
    langEn: "English",
    roleDoctor: "Doctor",
    rolePharmacy: "Pharmacy",
    rolePatient: "Patient",
    loadingSession: "Loading session",
    preparingWorkspace: "Preparing your workspace...",
    pageNotFound: "Page not found",
    pageNotFoundDesc: "The page you requested does not exist.",
    goHome: "Go home",
    qrEyebrow: "QR-based E-Prescription",
    home: "Home",
    logout: "Logout",
    loginTitle: "Login",
    loginDesc: "Systemga rol bo'yicha kiring.",
    email: "Email",
    password: "Password",
    loginBtn: "Login",
    loginLoading: "Logging in...",
    noAccount: "No account yet?",
    createOne: "Create one",
    registerTitle: "Register",
    registerDesc: "Doctor, pharmacy yoki patient akkaunt yarating.",
    fullName: "Full name",
    role: "Role",
    createAccount: "Create account",
    creating: "Creating...",
    hasAccount: "Already registered?",
    goLogin: "Go to login",
    doctorDashboard: "Doctor Dashboard",
    doctorDashboardDesc:
      "Add patient profiles, create prescriptions, and deliver a QR-ready payload for pharmacy validation.",
    addPatient: "Add Patient",
    addPatientDesc:
      "You can register a patient profile before creating a prescription.",
    name: "Name",
    age: "Age",
    savePatient: "Save patient",
    saving: "Saving...",
    createPrescription: "Create Prescription",
    createPrescriptionDesc:
      "Choose a patient and describe the prescribed medications.",
    patient: "Patient",
    selectPatient: "Select patient",
    createPrescriptionBtn: "Create prescription",
    generating: "Generating...",
    latestQr: "Latest QR",
    latestQrDesc:
      "The most recent prescription is shown with its QR payload for testing and delivery.",
    noPrescriptionYet:
      "No prescription created yet. Create one to display its QR code here.",
    prescriptionHistory: "Prescription History",
    prescriptionHistoryDesc: "Search by patient name or prescription id.",
    search: "Search",
    searchPlaceholder: "Search prescriptions",
    loadingDashboard: "Loading dashboard...",
    showQr: "Show QR",
    noSearchMatch: "No prescriptions matched your search.",
    medication: "Medication",
    remove: "Remove",
    dosage: "Dosage",
    instructions: "Instructions",
    addMedication: "Add medication",
    pharmacyDashboard: "Pharmacy Dashboard",
    pharmacyDashboardDesc:
      "Pharmacy staff can validate a QR payload, inspect medication details, and mark the prescription as used.",
    verifyQrPayload: "Verify QR Payload",
    verifyQrPayloadDesc:
      "A real QR scanner would decode the payload and paste the token below.",
    token: "Token",
    tokenPlaceholder: "Paste QR payload token here",
    verify: "Verify",
    checking: "Checking...",
    clear: "Clear",
    prescriptionResult: "Prescription Result",
    prescriptionResultDesc:
      "Once verified, you can confirm dispensing and lock the prescription against reuse.",
    confirmDispense: "Confirm dispense",
    updating: "Updating...",
    scanOrPaste: "Scan or paste a QR payload to preview the prescription here.",
    patientDashboard: "Patient Dashboard",
    patientDashboardDesc:
      "Patients can view their prescriptions, inspect medication instructions, and present the QR code at a pharmacy.",
    myPrescriptions: "My Prescriptions",
    myPrescriptionsDesc:
      "If your account email matches the patient record added by the doctor, your prescriptions will appear here.",
    loadingPrescriptions: "Loading prescriptions...",
    noLinkedPrescriptions: "No prescriptions are linked to your account yet.",
    statsPatients: "Patients",
    statsPrescriptions: "Prescriptions",
    statsActive: "Active",
    statsUsed: "Used",
    statsTotalPrescriptions: "Total prescriptions",
    unknownPatient: "Unknown patient",
    created: "Created",
    doctor: "Doctor",
    usedAt: "Used at",
    medications: "Medications",
    qrPayloadToken: "QR payload token",
    notLinked: "Not linked",
    patientSaved: "Patient saved successfully.",
    prescriptionCreated: "Prescription created and QR generated.",
  },
  uz: {
    appLang: "Til",
    langUz: "O'zbek",
    langRu: "Rus",
    langEn: "Ingliz",
    roleDoctor: "Shifokor",
    rolePharmacy: "Dorixona",
    rolePatient: "Bemor",
    loadingSession: "Sessiya yuklanmoqda",
    preparingWorkspace: "Ish muhiti tayyorlanmoqda...",
    pageNotFound: "Sahifa topilmadi",
    pageNotFoundDesc: "So‘ralgan sahifa mavjud emas.",
    goHome: "Bosh sahifa",
    qrEyebrow: "QR asosidagi E-Retsept",
    home: "Bosh sahifa",
    logout: "Chiqish",
    loginTitle: "Kirish",
    loginDesc: "Tizimga rol bo'yicha kiring.",
    email: "Email",
    password: "Parol",
    loginBtn: "Kirish",
    loginLoading: "Kirilmoqda...",
    noAccount: "Akkaunt yo'qmi?",
    createOne: "Yaratish",
    registerTitle: "Ro'yxatdan o'tish",
    registerDesc: "Shifokor, dorixona yoki bemor akkauntini yarating.",
    fullName: "To'liq ism",
    role: "Rol",
    createAccount: "Akkaunt yaratish",
    creating: "Yaratilmoqda...",
    hasAccount: "Akkauntingiz bormi?",
    goLogin: "Kirishga o'tish",
    doctorDashboard: "Shifokor paneli",
    doctorDashboardDesc:
      "Bemor profillarini qo‘shing, retsept yarating va dorixona tekshiruvi uchun QR tayyorlang.",
    addPatient: "Bemor qo'shish",
    addPatientDesc: "Retseptdan oldin bemor profilini ro'yxatdan o'tkazing.",
    name: "Ism",
    age: "Yosh",
    savePatient: "Bemorni saqlash",
    saving: "Saqlanmoqda...",
    createPrescription: "Retsept yaratish",
    createPrescriptionDesc: "Bemorni tanlang va dorilarni kiriting.",
    patient: "Bemor",
    selectPatient: "Bemorni tanlang",
    createPrescriptionBtn: "Retsept yaratish",
    generating: "Yaratilmoqda...",
    latestQr: "So'nggi QR",
    latestQrDesc:
      "Sinov va yetkazish uchun eng so‘nggi retseptning QR ma’lumoti ko‘rsatiladi.",
    noPrescriptionYet:
      "Hali retsept yaratilmagan. QR ko‘rish uchun retsept yarating.",
    prescriptionHistory: "Retseptlar tarixi",
    prescriptionHistoryDesc: "Bemor ismi yoki retsept ID bo‘yicha qidiring.",
    search: "Qidiruv",
    searchPlaceholder: "Retseptlarni qidiring",
    loadingDashboard: "Panel yuklanmoqda...",
    showQr: "QR ko'rsatish",
    noSearchMatch: "Qidiruvga mos retsept topilmadi.",
    medication: "Dori",
    remove: "O'chirish",
    dosage: "Doza",
    instructions: "Ko'rsatma",
    addMedication: "Dori qo'shish",
    pharmacyDashboard: "Dorixona paneli",
    pharmacyDashboardDesc:
      "Dorixona xodimi QR tokenni tekshiradi va retseptni ishlatilgan deb belgilaydi.",
    verifyQrPayload: "QR tokenni tekshirish",
    verifyQrPayloadDesc:
      "Haqiqiy skaner tokenni ochib beradi, quyiga shu tokenni joylaysiz.",
    token: "Token",
    tokenPlaceholder: "QR tokenni shu yerga qo'ying",
    verify: "Tekshirish",
    checking: "Tekshirilmoqda...",
    clear: "Tozalash",
    prescriptionResult: "Retsept natijasi",
    prescriptionResultDesc:
      "Tekshiruvdan so‘ng berilganini tasdiqlang va qayta ishlatishni bloklang.",
    confirmDispense: "Berishni tasdiqlash",
    updating: "Yangilanmoqda...",
    scanOrPaste: "Bu yerda ko‘rish uchun QR tokenni skaner qiling yoki qo‘ying.",
    patientDashboard: "Bemor paneli",
    patientDashboardDesc:
      "Bemor o‘z retseptlarini ko‘radi va dorixonada QR kodni ko‘rsatadi.",
    myPrescriptions: "Mening retseptlarim",
    myPrescriptionsDesc:
      "Akkaunt emailingiz shifokor kiritgan email bilan mos bo‘lsa, retseptlar shu yerda chiqadi.",
    loadingPrescriptions: "Retseptlar yuklanmoqda...",
    noLinkedPrescriptions: "Akkauntingizga bog‘langan retseptlar hozircha yo‘q.",
    statsPatients: "Bemorlar",
    statsPrescriptions: "Retseptlar",
    statsActive: "Faol",
    statsUsed: "Ishlatilgan",
    statsTotalPrescriptions: "Jami retseptlar",
    unknownPatient: "Noma'lum bemor",
    created: "Yaratilgan",
    doctor: "Shifokor",
    usedAt: "Ishlatilgan vaqt",
    medications: "Dorilar",
    qrPayloadToken: "QR token",
    notLinked: "Bog'lanmagan",
    patientSaved: "Bemor muvaffaqiyatli saqlandi.",
    prescriptionCreated: "Retsept yaratildi va QR hosil qilindi.",
  },
  ru: {
    appLang: "Язык",
    langUz: "Узбекский",
    langRu: "Русский",
    langEn: "Английский",
    roleDoctor: "Врач",
    rolePharmacy: "Аптека",
    rolePatient: "Пациент",
    loadingSession: "Загрузка сессии",
    preparingWorkspace: "Подготовка рабочего пространства...",
    pageNotFound: "Страница не найдена",
    pageNotFoundDesc: "Запрошенная страница не существует.",
    goHome: "На главную",
    qrEyebrow: "QR электронный рецепт",
    home: "Главная",
    logout: "Выйти",
    loginTitle: "Вход",
    loginDesc: "Войдите в систему по роли.",
    email: "Email",
    password: "Пароль",
    loginBtn: "Войти",
    loginLoading: "Вход...",
    noAccount: "Нет аккаунта?",
    createOne: "Создать",
    registerTitle: "Регистрация",
    registerDesc: "Создайте аккаунт врача, аптеки или пациента.",
    fullName: "Полное имя",
    role: "Роль",
    createAccount: "Создать аккаунт",
    creating: "Создание...",
    hasAccount: "Уже зарегистрированы?",
    goLogin: "Перейти ко входу",
    doctorDashboard: "Панель врача",
    doctorDashboardDesc:
      "Добавляйте пациентов, создавайте рецепты и выдавайте QR для проверки в аптеке.",
    addPatient: "Добавить пациента",
    addPatientDesc: "Перед созданием рецепта можно добавить профиль пациента.",
    name: "Имя",
    age: "Возраст",
    savePatient: "Сохранить пациента",
    saving: "Сохранение...",
    createPrescription: "Создать рецепт",
    createPrescriptionDesc: "Выберите пациента и заполните лекарства.",
    patient: "Пациент",
    selectPatient: "Выберите пациента",
    createPrescriptionBtn: "Создать рецепт",
    generating: "Создание...",
    latestQr: "Последний QR",
    latestQrDesc:
      "Показан последний рецепт с QR-данными для проверки и выдачи.",
    noPrescriptionYet:
      "Пока нет рецептов. Создайте рецепт, чтобы увидеть QR-код.",
    prescriptionHistory: "История рецептов",
    prescriptionHistoryDesc: "Поиск по имени пациента или ID рецепта.",
    search: "Поиск",
    searchPlaceholder: "Искать рецепты",
    loadingDashboard: "Загрузка панели...",
    showQr: "Показать QR",
    noSearchMatch: "Рецепты по запросу не найдены.",
    medication: "Лекарство",
    remove: "Удалить",
    dosage: "Дозировка",
    instructions: "Инструкция",
    addMedication: "Добавить лекарство",
    pharmacyDashboard: "Панель аптеки",
    pharmacyDashboardDesc:
      "Сотрудник аптеки проверяет QR-токен и отмечает рецепт как использованный.",
    verifyQrPayload: "Проверка QR-токена",
    verifyQrPayloadDesc:
      "Сканер декодирует токен, вставьте его в поле ниже.",
    token: "Токен",
    tokenPlaceholder: "Вставьте QR-токен сюда",
    verify: "Проверить",
    checking: "Проверка...",
    clear: "Очистить",
    prescriptionResult: "Результат рецепта",
    prescriptionResultDesc:
      "После проверки подтвердите выдачу и заблокируйте повторное использование.",
    confirmDispense: "Подтвердить выдачу",
    updating: "Обновление...",
    scanOrPaste: "Отсканируйте или вставьте QR-токен для предпросмотра.",
    patientDashboard: "Панель пациента",
    patientDashboardDesc:
      "Пациент видит свои рецепты и показывает QR-код в аптеке.",
    myPrescriptions: "Мои рецепты",
    myPrescriptionsDesc:
      "Если email аккаунта совпадает с email в профиле пациента, рецепты появятся здесь.",
    loadingPrescriptions: "Загрузка рецептов...",
    noLinkedPrescriptions: "К вашему аккаунту пока не привязаны рецепты.",
    statsPatients: "Пациенты",
    statsPrescriptions: "Рецепты",
    statsActive: "Активные",
    statsUsed: "Использовано",
    statsTotalPrescriptions: "Всего рецептов",
    unknownPatient: "Неизвестный пациент",
    created: "Создан",
    doctor: "Врач",
    usedAt: "Использован",
    medications: "Лекарства",
    qrPayloadToken: "QR токен",
    notLinked: "Не привязан",
    patientSaved: "Пациент успешно сохранен.",
    prescriptionCreated: "Рецепт создан, QR сгенерирован.",
  },
};

const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);

    if (stored && translations[stored]) {
      return stored;
    }

    return "uz";
  });

  const changeLanguage = (nextLanguage) => {
    if (!translations[nextLanguage]) {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, nextLanguage);
    setLanguage(nextLanguage);
  };

  const value = useMemo(
    () => ({
      language,
      changeLanguage,
      t: (key) => translations[language]?.[key] ?? translations.en[key] ?? key,
    }),
    [language]
  );

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used inside LanguageProvider.");
  }

  return context;
};
