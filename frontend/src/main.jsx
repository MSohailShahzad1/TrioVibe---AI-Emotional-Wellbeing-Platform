import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import Profile from './Components/Profile/Profile.jsx'


import MultiModalEmotion from './Components/MultiModalEmotion/MultiModalEmotion.jsx'
import AIPal from './Components/Webcam/AIPal.jsx'
import Main from './Components/Main/Main.jsx'
import Home from './Components/Home/Home.jsx'
import Login from './Components/Login/Login.jsx'
import Signup from './Components/Login/Signup.jsx'
import { ToastContainer } from 'react-toastify'
import "./toast.css";
import 'react-toastify/dist/ReactToastify.css';
import EditProfile from './Components/Profile/EditProfile.jsx'

import { UserProvider } from './Context/UserContext.jsx'
import Otp from './Components/Login/Otp.jsx'
import OtpPage from './Components/Login/Otp.jsx'
import ForgotPasswordPage from './Components/Login/ForgotPasswordPage.jsx'
import VerifyResetOtpPage from './Components/Login/VerifyResetOtp.jsx'

import ResetPassword from './Components/Login/NewPassword.jsx'
import BreathingExercise from './Components/Sidebar/BreathingExercise.jsx'
import StartTherapy from './Components/Sidebar/TherapyStart.jsx'
import DailyQuestions from './Components/Sidebar/DailyQuestions.jsx'
import Progress from './Components/Sidebar/Progress.jsx'
import ProgressWrapper from './Components/Sidebar/ProgressWrapper.jsx'
import PastAnswers from './Components/Sidebar/History.jsx'
import UserChatDashboard from './Components/Chat/UserChatDashboard.jsx'
import UserChatInterface from './Components/Chat/UserChatInterface.jsx'

import LobbyScreen from './Components/screens/Lobby'
import RoomPage from './Components/screens/Room'
import SocketProvider from './Context/SocketProvider'
import RoomManager from './Components/roomManager/roomManager'

import AdminDashboard from './Components/Admin/AdminDashboard'
import AdminLogin from './Components/Admin/AdminLogin'
import AdminProtectedRoute from './Components/Admin/AdminProtectedRoutes'
import AdminUsers from './Components/Admin/AdminUsers'
import AdminLayout from './Components/Admin/AdminLayout'
import AdminTherapistRequests from './Components/Admin/AdminTherapistRequest'
import RequestTherapist from './Components/Therapist/TherapistRequest'
import Therapists from './Components/AppointmentBooking/Therapist'
import TherapistProfile from './Components/AppointmentBooking/TherapistProfile'
import BookAppointment from './Components/AppointmentBooking/BookAppointment'
import AddReview from './Components/AppointmentBooking/AddReview'
import TherapistDashboard from './Components/AppointmentBooking/TherapistDashboard'
import MyAppointments from "./Components/AppointmentBooking/MyAppointments"
import TherapistAppointments from './Components/TherapistDashboard/TherapistAppointmentManagement'
import EmotionHome from './Components/MultiModalEmotion/EmotionHome'
import FaceEmotion from './Components/MultiModalEmotion/FaceEmotion'
import VoiceEmotion from './Components/MultiModalEmotion/VoiceEmotion'
import TextEmotion from './Components/MultiModalEmotion/TextEmotion'
import { ThemeProvider } from './Context/ThemeContext'
import AppLayout from './Components/LayOut/Applayout'


// Main Application Router Configuration
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />, // auth gate
  },

  {
    element: <AppLayout />, // 👈 GLOBAL SIDEBAR LAYOUT
    children: [
      { path: "/home", element: <Home /> },
      { path: "/profile", element: <Profile /> },
      { path: "/AI-Pal", element: <AIPal /> },
      { path: "/EditProfile", element: <EditProfile /> },

      { path: "/MultiModal", element: <EmotionHome /> },
      { path: "/MultiModal/Face", element: <FaceEmotion /> },
      { path: "/MultiModal/Voice", element: <VoiceEmotion /> },
      { path: "/MultiModal/Text", element: <TextEmotion /> },

      { path: "/requestTherapist", element: <RequestTherapist /> },

      { path: "/breathing-exercise", element: <BreathingExercise /> },
      { path: "/start-therapy", element: <StartTherapy /> },
      { path: "/daily-question", element: <DailyQuestions /> },
      { path: "/progress", element: <ProgressWrapper /> },
      { path: "/therapy-history", element: <PastAnswers /> },

      { path: "/chat", element: <UserChatDashboard /> },
      { path: "/chat/:chatRoomId", element: <UserChatInterface /> },

      { path: "/roomManager", element: <RoomManager /> },
      { path: "/lobby", element: <LobbyScreen /> },
      { path: "/room/:roomId", element: <RoomPage /> },

      { path: "/therapist", element: <Therapists /> },
      { path: "/therapist/:id", element: <TherapistProfile /> },
      { path: "/therapist/:id/book", element: <BookAppointment /> },
      { path: "/appointments", element: <MyAppointments /> },



      { path: "/appointments/:appointmentId/review", element: <AddReview /> },
      { path: "/therapist/dashboard/appointments", element: <TherapistDashboard /> },



      { path: "/therapist/appointments", element: <TherapistAppointments /> },
      // { path: "/appointments/:id/review", element: <AddReview/> },
      { path: "/review/:appointmentId", element: <AddReview /> },
    ],
  },

  // ❌ NO SIDEBAR ROUTES
  { path: "/login", element: <Login /> },
  { path: "/signup", element: <Signup /> },
  { path: "/forgot-password", element: <ForgotPasswordPage /> },
  { path: "/Otp", element: <OtpPage /> },
  { path: "/forgot-password", element: <ForgotPasswordPage /> },
  { path: "/verify-reset-otp", element: <VerifyResetOtpPage /> },
  { path: "/reset-password", element: <ResetPassword /> },

  // ADMIN (separate layout)
  {
    path: "/admin/login",
    element: <AdminLogin />,
  },
  {
    path: "/admin/users",
    element: (
      <AdminProtectedRoute>
        <AdminLayout>
          <AdminUsers />
        </AdminLayout>
      </AdminProtectedRoute>
    ),
  },
  {
    path: "/admin/requests",
    element: (
      <AdminProtectedRoute>

        <AdminTherapistRequests />

      </AdminProtectedRoute>
    ),
  },
  {
    path: "/admin/dashboard",
    element: (
      <AdminProtectedRoute>
        <AdminLayout>
          <AdminDashboard />
        </AdminLayout>
      </AdminProtectedRoute>
    ),
  },
]);

createRoot(document.getElementById('root')).render(
  <ThemeProvider>
    <UserProvider>
      <SocketProvider>
        <RouterProvider router={router} />
        <ToastContainer position="top-right" autoClose={3000} theme="colored" />
      </SocketProvider>
    </UserProvider>
  </ThemeProvider>
)