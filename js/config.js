/**
 * ========================================================
 * كيان سيتي للتطوير العقاري وإدارة الأصول
 * 1. إعدادات النظام وقاعدة البيانات وفريق العمل (Config)
 * ========================================================
 */

window.KAYAN_CONFIG = {
  // إعدادات الاتصال بقاعدة بيانات فايربيس (Firebase Realtime Database)
  FIREBASE: {
    apiKey: "AIzaSyDJ5Bl1G-mYkzO9ovilFrsa7Z5OhcI0vO4",
    authDomain: "kyan-b9581.firebaseapp.com",
    projectId: "kyan-b9581",
    databaseURL: "https://kyan-b9581-default-rtdb.firebaseio.com/",
    storageBucket: "kyan-b9581.firebasestorage.app",
    messagingSenderId: "275317091922",
    appId: "1:275317091922:web:60e95ecb19caad26dd798b"
  },

  // البريد الداخلي لحساب الإدارة في Firebase Authentication
  ADMIN_EMAIL: "admin@kayancity.com",

  // مسؤولو إدارة الأصول والعمليات (الأعضاء الأربعة لاستقبال طلبات الواتساب)
  TEAM: [
    {
      id: "team_1",
      name: "م. مصطفى طلعت",
      title: "المدير التنفيذي لإدارة الأصول",
      phone: "01017006541",
      wa: "201017006541"
    },
    {
      id: "team_2",
      name: "أ. أحمد ناصر",
      title: "مدير العمليات وشؤون الملاك",
      phone: "01091048919",
      wa: "201091048919"
    },
    {
      id: "team_3",
      name: "أ. عمرو جلال",
      title: "مسؤول علاقات النزلاء والتعاقدات",
      phone: "01029105138",
      wa: "201029105138"
    },
    {
      id: "team_4",
      name: "أ. عمر قاسم",
      title: "مسؤول شؤون وتسكين الطلاب",
      phone: "01070451554",
      wa: "201070451554"
    }
  ],

  // معلومات مطور الموقع
  DEVELOPER: {
    name: "JOO",
    phone: "01095046646",
    waUrl: "https://wa.me/201095046646"
  }
};

window.Kayan = window.Kayan || {};
window.Kayan.config = window.KAYAN_CONFIG;
