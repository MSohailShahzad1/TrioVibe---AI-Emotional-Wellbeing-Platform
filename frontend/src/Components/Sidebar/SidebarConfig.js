import {
  FaLungs,
  FaCommentDots,
  FaComments,
  FaVideo,
  FaUserMd,FaHome,FaChartLine,FaChartBar
} from "react-icons/fa";
import { FaFileLines } from "react-icons/fa6";

export const sidebarItems = [
     {
    label: "Home",
    path: "/home",
    icon: FaHome,
    roles: ["user","therapist"]
  },
  {
    label: "Therapy",
    path: "/start-therapy",
    icon: "plus",
    roles: ["user","therapist"]
  },
  {
    label: "Daily Question",
    path: "/daily-question",
    icon: FaCommentDots,
    roles: ["user","therapist"]
  },
  {
    label: "Chat",
    path: "/chat",
    icon: FaComments,
    roles: ["user", "therapist"]
  },
  {
    label: "Meeting",
    path: "/roomManager",
    icon: FaVideo,
    roles: ["user", "therapist"]
  },
  {
    label: "Breathing Exercise",
    path: "/breathing-exercise",
    icon: FaLungs,
    roles: ["user","therapist"]
  },
  {
    label: "Progress",
    path: "/progress",
    icon: FaFileLines,
    roles: ["user","therapist"]
  },
  {
    label: "Appointments",
    path: "/therapist",
    icon: FaUserMd,
    roles: ["user","therapist"]
  },
  {
    label: "Therapist Panel",
    path: "/therapist/appointments",
    icon: FaChartBar,
    roles: ["therapist"]
  }
];
