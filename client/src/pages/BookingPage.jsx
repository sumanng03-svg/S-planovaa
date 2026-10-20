import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

// BookingPage is just a redirect wrapper — booking is done inline on EventDetail
// This page is reached from /booking/:eventId but booking is now done on EventDetail
export default function BookingPage() {
  const navigate = useNavigate();
  useEffect(() => { navigate('/explore'); }, []);
  return null;
}
