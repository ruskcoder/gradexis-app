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
    path: '/todo/',
    component: TodoPage,
  },
  {
    path: '/login/',
    component: LoginPage,
    hideTabbar: true
  },
  {
    path: '/settings/',
    component: SettingsPage,
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
