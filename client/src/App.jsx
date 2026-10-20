import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Explore from './pages/Explore';
import EventDetail from './pages/EventDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import BookingPage from './pages/BookingPage';
import PaymentPage from './pages/PaymentPage';
import TicketPage from './pages/TicketPage';
import MyTickets from './pages/MyTickets';
import VerifyTicket from './pages/VerifyTicket';
import AdminDashboard from './pages/Admin/Dashboard';
import AdminEvents from './pages/Admin/Events';
import AdminBookings from './pages/Admin/Bookings';

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

function AdminRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}

function AppLayout() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/"              element={<Home />} />
        <Route path="/explore"       element={<Explore />} />
        <Route path="/events/:id"    element={<EventDetail />} />
        <Route path="/login"         element={<Login />} />
        <Route path="/register"      element={<Register />} />
        <Route path="/verify/:ticketRef" element={<VerifyTicket />} />

        <Route path="/booking/:eventId" element={
          <ProtectedRoute><BookingPage /></ProtectedRoute>
        } />
        <Route path="/payment/:bookingId" element={
          <ProtectedRoute><PaymentPage /></ProtectedRoute>
        } />
        <Route path="/ticket/:bookingId" element={
          <ProtectedRoute><TicketPage /></ProtectedRoute>
        } />
        <Route path="/my-tickets" element={
          <ProtectedRoute><MyTickets /></ProtectedRoute>
        } />

        <Route path="/admin"          element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/events"   element={<AdminRoute><AdminEvents /></AdminRoute>} />
        <Route path="/admin/bookings" element={<AdminRoute><AdminBookings /></AdminRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </AuthProvider>
  );
}
