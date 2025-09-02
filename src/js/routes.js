import HomePage from '../pages/home.jsx';
import SettingsPage from '../pages/settings.jsx';
import NotFoundPage from '../pages/404.jsx';
import GradesPage from '../pages/grades.jsx';
import TodoPage from '../pages/todo.jsx';
import AccountsPage from '../pages/settings/accounts.jsx';
import LoginPage from '../pages/login.jsx';
import ClassGradesPage from '../pages/class-grades.jsx';
import SchedulePage from '../pages/info/schedule.jsx';
import AttendancePage from '../pages/info/attendance.jsx';
import TeachersPage from "@/pages/info/teachers";
import ProgressReportPage from "@/pages/info/ipr";
import ReportCardPage from "@/pages/info/reportCard";
import store from './store.js';
import WhatIfPage from '../pages/what-if.jsx';
import TranscriptPage from "@/pages/info/transcript";
import BellSchedulePage from "@/pages/info/bellSchedule"; 

var routes = [
  {
    path: '/',
    component: HomePage,
  },
  {
    path: '/grades/',
    component: GradesPage,
    keepAlive: true,
  },
  {
    path: '/todo/',
    component: TodoPage,
  },
  {
    path: '/settings/',
    component: SettingsPage,
  },
  {
    path: '/grades/:course/',
    component: ClassGradesPage,
    hideTabbar: true
  },
  {
    path: '/whatif/:course/',
    component: WhatIfPage,
    hideTabbar: true,
  },
  {
    path: '/login/',
    component: LoginPage,
    hideTabbar: true
  },
  {
    path: '/settings/accounts/',
    component: AccountsPage,
    hideTabbar: true
  },
  {
    path: '/info/schedule/',
    component: SchedulePage,
    hideTabbar: true
  },
  {
    path: '/info/bellschedule',
    component: BellSchedulePage,
    hideTabbar: true
  },
  {
    path: '/info/attendance/',
    component: AttendancePage,
    hideTabbar: true
  },
  {
    path: '/info/teachers/',
    component: TeachersPage,
    hideTabbar: true
  },
  {
    path: '/info/ipr/',
    component: ProgressReportPage,
    hideTabbar: true
  },
  {
    path: '/info/reportCard/',
    component: ReportCardPage,
    hideTabbar: true
  },
  {
    path: '/info/transcript/',
    component: TranscriptPage,
    hideTabbar: true
  },
  {
    path: '(.*)',
    component: NotFoundPage,
  },
];

if (store.state.currentUser.pageTransition != "default") {
  routes.forEach(route => {
    route.options = {
      transition: store.state.currentUser.pageTransition,
    };
  });
}

export default routes;

// import store from './store.js';

// var routes = [
//   {
//     path: '/',
//     async: function ({ resolve }) {
//       import('../pages/home.jsx').then((module) => resolve({ component: module.default }));
//     },
//   },
//   {
//     path: '/grades/',
//     keepAlive: true,
//     async: function ({ resolve }) {
//       import('../pages/grades.jsx').then((module) => resolve({ component: module.default }));
//     },
//   },
//   {
//     path: '/todo/',
//     async: function ({ resolve }) {
//       import('../pages/todo.jsx').then((module) => resolve({ component: module.default }));
//     },
//   },
//   {
//     path: '/settings/',
//     async: function ({ resolve }) {
//       import('../pages/settings.jsx').then((module) => resolve({ component: module.default }));
//     },
//   },
//   {
//     path: '/grades/:course/',
//     hideTabbar: true,
//     async: function ({ resolve }) {
//       import('../pages/class-grades.jsx').then((module) => resolve({ component: module.default }));
//     },
//   },
//   {
//     path: '/whatif/:course/',
//     hideTabbar: true,
//     async: function ({ resolve }) {
//       import('../pages/what-if.jsx').then((module) => resolve({ component: module.default }));
//     },
//   },
//   {
//     path: '/login/',
//     hideTabbar: true,
//     async: function ({ resolve }) {
//       import('../pages/login.jsx').then((module) => resolve({ component: module.default }));
//     },
//   },
//   {
//     path: '/settings/accounts/',
//     hideTabbar: true,
//     async: function ({ resolve }) {
//       import('../pages/settings/accounts.jsx').then((module) => resolve({ component: module.default }));
//     },
//   },
//   {
//     path: '/info/schedule/',
//     hideTabbar: true,
//     async: function ({ resolve }) {
//       import('../pages/info/schedule.jsx').then((module) => resolve({ component: module.default }));
//     },
//   },
//   {
//     path: '/info/bellschedule',
//     hideTabbar: true,
//     async: function ({ resolve }) {
//       import('../pages/info/bellSchedule.jsx').then((module) => resolve({ component: module.default }));
//     },
//   },
//   {
//     path: '/info/attendance/',
//     hideTabbar: true,
//     async: function ({ resolve }) {
//       import('../pages/info/attendance.jsx').then((module) => resolve({ component: module.default }));
//     },
//   },
//   {
//     path: '/info/teachers/',
//     hideTabbar: true,
//     async: function ({ resolve }) {
//       import('../pages/info/teachers.jsx').then((module) => resolve({ component: module.default }));
//     },
//   },
//   {
//     path: '/info/ipr/',
//     hideTabbar: true,
//     async: function ({ resolve }) {
//       import('../pages/info/ipr.jsx').then((module) => resolve({ component: module.default }));
//     },
//   },
//   {
//     path: '/info/reportCard/',
//     hideTabbar: true,
//     async: function ({ resolve }) {
//       import('../pages/info/reportCard.jsx').then((module) => resolve({ component: module.default }));
//     },
//   },
//   {
//     path: '/info/transcript/',
//     hideTabbar: true,
//     async: function ({ resolve }) {
//       import('../pages/info/transcript.jsx').then((module) => resolve({ component: module.default }));
//     },
//   },
//   {
//     path: '(.*)',
//     async: function ({ resolve }) {
//       import('../pages/404.jsx').then((module) => resolve({ component: module.default }));
//     },
//   },
// ];

// if (store.state.currentUser.pageTransition != "default") {
//   routes.forEach(route => {
//     route.options = {
//       transition: store.state.currentUser.pageTransition,
//     };
//   });
// }

// export default routes;
