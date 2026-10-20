import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import api from '../services/api';
import './PaymentPage.css';

function formatDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

const POPULAR_BANKS = [
  { id: 'sbi', name: 'State Bank of India', code: 'SBI', icon: '🏛️' },
  { id: 'hdfc', name: 'HDFC Bank', code: 'HDFC', icon: '🏦' },
  { id: 'icici', name: 'ICICI Bank', code: 'ICICI', icon: '🏢' },
  { id: 'axis', name: 'Axis Bank', code: 'AXIS', icon: '🏛️' },
  { id: 'kotak', name: 'Kotak Mahindra', code: 'KOTAK', icon: '🏦' },
  { id: 'pnb', name: 'Punjab National Bank', code: 'PNB', icon: '🏢' },
];

const OTHER_BANKS = [
  'Bank of Baroda', 'Canara Bank', 'Union Bank of India', 'IndusInd Bank',
  'IDFC First Bank', 'Federal Bank', 'Yes Bank', 'Central Bank of India'
];

const WALLETS = [
  { id: 'paytm', name: 'Paytm Wallet', icon: '👛', desc: 'Fast checkout with Paytm balance' },
  { id: 'phonepe', name: 'PhonePe Wallet', icon: '⚡', desc: 'Instant debit from PhonePe wallet' },
  { id: 'amazon', name: 'Amazon Pay', icon: '📦', desc: 'Use your Amazon Pay balance' },
  { id: 'mobikwik', name: 'MobiKwik', icon: '💳', desc: 'Pay via MobiKwik wallet or ZIP' },
];

export default function PaymentPage() {
  const { bookingId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(location.state?.booking || null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(!location.state?.booking);
  const [paying, setPaying] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [error, setError] = useState('');

  // Payment method selection: 'upi' | 'card' | 'netbanking' | 'wallet'
  const [method, setMethod] = useState('upi');

  // Form states
  const [upiOption, setUpiOption] = useState('qr'); // 'qr' | 'id'
  const [upiId, setUpiId] = useState('');
  const [cardForm, setCardForm] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: '',
    saveCard: true,
  });
  const [selectedBank, setSelectedBank] = useState('sbi');
  const [selectedWallet, setSelectedWallet] = useState('paytm');

  useEffect(() => {
    if (!booking) {
      api.get(`/bookings/${bookingId}`)
        .then(r => setBooking(r.data.data))
        .catch(() => setError('Booking not found.'))
        .finally(() => setLoading(false));
    }
  }, []);

  useEffect(() => {
    if (booking && !session) initiatePayment();
  }, [booking]);

  const initiatePayment = async () => {
    try {
      const { data } = await api.post('/payments/initiate', { booking_id: Number(bookingId) });
      setSession(data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not initiate payment session.');
    }
  };

  // Card input formatters
  const handleCardNumberChange = (e) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 16);
    let formatted = val.replace(/(.{4})/g, '$1 ').trim();
    setCardForm(c => ({ ...c, number: formatted }));
  };

  const handleExpiryChange = (e) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (val.length >= 2) val = val.slice(0, 2) + '/' + val.slice(2);
    setCardForm(c => ({ ...c, expiry: val }));
  };

  const handleCvvChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 4);
    setCardForm(c => ({ ...c, cvv: val }));
  };

  const getMethodDisplayName = () => {
    switch (method) {
      case 'upi': return upiOption === 'qr' ? 'UPI (QR Code)' : 'UPI (VPA)';
      case 'card': return 'Credit/Debit Card';
      case 'netbanking': return `Net Banking (${selectedBank.toUpperCase()})`;
      case 'wallet': return `Wallet (${selectedWallet.toUpperCase()})`;
      default: return 'Online Payment';
    }
  };

  const handlePay = async () => {
    if (!session) return;
    setPaying(true);
    setError('');

    // Step-by-step authentic payment flow simulation
    setProcessingStep('Connecting to secure banking network...');
    await new Promise(r => setTimeout(r, 600));

    setProcessingStep(`Authorizing transaction via ${getMethodDisplayName()}...`);
    await new Promise(r => setTimeout(r, 700));

    setProcessingStep('Confirming reservation & issuing verified e-ticket...');

    try {
      const { data } = await api.post('/payments/confirm', {
        booking_id: Number(bookingId),
        session_token: session.session_token,
        payment_method: getMethodDisplayName(),
        simulate: 'success',
      });

      if (data.success) {
        await new Promise(r => setTimeout(r, 400));
        navigate(`/ticket/${bookingId}`, { state: { ticket: data.data } });
      } else {
        setError(data.message || 'Payment failed.');
        setPaying(false);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Payment authorization failed. Please try again.';
      setError(msg);
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <main className="page-wrapper">
        <div className="loading-container" style={{ minHeight: '70vh' }}>
          <div className="spinner" />
          <span>Securing booking details...</span>
        </div>
      </main>
    );
  }

  if (!booking) {
    return (
      <main className="page-wrapper">
        <div className="container" style={{ paddingTop: '5rem', textAlign: 'center' }}>
          <div className="alert alert-error">{error || 'Booking session expired or not found.'}</div>
          <Link to="/explore" className="btn btn-outline" style={{ marginTop: '1.5rem' }}>
            ← Back to Events
          </Link>
        </div>
      </main>
    );
  }

  const total = booking.total_amount || booking.total;
  const upiQrPayload = `upi://pay?pa=planova.events@icici&pn=PLANOVA&am=${total}&tr=BKG${bookingId}&cu=INR`;

  return (
    <main className="page-wrapper">
      <div className="container payment-layout">
        {/* ── Left Column: Order Summary ── */}
        <div className="order-summary">
          <h2 className="order-title">
            <span>🎟️</span> Order Summary
          </h2>

          {booking.image_url && (
            <img
              src={booking.image_url}
              alt={booking.event_title}
              className="order-event-img"
              onError={e => { e.target.style.display = 'none'; }}
            />
          )}

          <div className="order-details">
            <div className="order-row">
              <span>Event</span>
              <strong>{booking.event_title}</strong>
            </div>
            {booking.event_date && (
              <div className="order-row">
                <span>Date</span>
                <strong>{formatDate(booking.event_date)}</strong>
              </div>
            )}
            {booking.venue && (
              <div className="order-row">
                <span>Venue</span>
                <strong>{booking.venue}</strong>
              </div>
            )}
            <div className="order-row">
              <span>Quantity</span>
              <strong>{booking.quantity} ticket{booking.quantity > 1 ? 's' : ''}</strong>
            </div>
            <div className="order-row">
              <span>Ticket Price</span>
              <strong>₹{parseFloat(booking.unit_price || 0).toLocaleString('en-IN')}</strong>
            </div>
            <div className="order-row">
              <span>Convenience Fee</span>
              <strong style={{ color: '#10b981' }}>FREE (₹0)</strong>
            </div>
            <div className="order-row order-total">
              <span>Total Payable</span>
              <strong className="total-amount">
                ₹{parseFloat(total || 0).toLocaleString('en-IN')}
              </strong>
            </div>
          </div>

          <div className="promo-badge">
            ✓ 100% Guaranteed Official Ticket Access
          </div>

          <div className="order-ref">
            <span>Booking Ref: #{bookingId}</span>
            <span>All Taxes Included</span>
          </div>
        </div>

        {/* ── Right Column: Payment Gateway ── */}
        <div className="payment-panel">
          <div className="payment-header">
            <h2>Select Payment Method</h2>
            <div className="secure-badge">
              🔒 256-Bit SSL Encrypted
            </div>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          {/* Payment Method Tabs */}
          <div className="payment-methods-tabs">
            <button
              type="button"
              className={`pm-tab ${method === 'upi' ? 'active' : ''}`}
              onClick={() => setMethod('upi')}
            >
              <span className="pm-tab-icon">⚡</span>
              <span>UPI / QR</span>
            </button>
            <button
              type="button"
              className={`pm-tab ${method === 'card' ? 'active' : ''}`}
              onClick={() => setMethod('card')}
            >
              <span className="pm-tab-icon">💳</span>
              <span>Cards</span>
            </button>
            <button
              type="button"
              className={`pm-tab ${method === 'netbanking' ? 'active' : ''}`}
              onClick={() => setMethod('netbanking')}
            >
              <span className="pm-tab-icon">🏦</span>
              <span>Net Banking</span>
            </button>
            <button
              type="button"
              className={`pm-tab ${method === 'wallet' ? 'active' : ''}`}
              onClick={() => setMethod('wallet')}
            >
              <span className="pm-tab-icon">👛</span>
              <span>Wallets</span>
            </button>
          </div>

          {/* ── Method View 1: UPI ── */}
          {method === 'upi' && (
            <div className="method-view-box">
              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <button
                  type="button"
                  className={`btn btn-sm ${upiOption === 'qr' ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => setUpiOption('qr')}
                  style={{ flex: 1 }}
                >
                  📱 Scan QR Code
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${upiOption === 'id' ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => setUpiOption('id')}
                  style={{ flex: 1 }}
                >
                  ⚡ Enter UPI ID
                </button>
              </div>

              {upiOption === 'qr' ? (
                <div className="upi-qr-card">
                  <div className="upi-qr-code">
                    <QRCodeSVG
                      value={upiQrPayload}
                      size={130}
                      level="M"
                      includeMargin={false}
                    />
                  </div>
                  <div className="upi-qr-info">
                    <h4>Scan & Pay with any UPI app</h4>
                    <p>Open GPay, PhonePe, Paytm, or BHIM and scan to complete payment.</p>
                    <div className="upi-app-chips">
                      <span className="upi-chip">Google Pay</span>
                      <span className="upi-chip">PhonePe</span>
                      <span className="upi-chip">Paytm</span>
                      <span className="upi-chip">CRED</span>
                      <span className="upi-chip">BHIM</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="upi-options">
                  <div className="form-group">
                    <label className="form-label">Virtual Payment Address (UPI ID)</label>
                    <div className="upi-id-input-group">
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. mobile@upi or username@okaxis"
                        value={upiId}
                        onChange={e => setUpiId(e.target.value)}
                        autoFocus
                      />
                    </div>
                    <div className="upi-handles">
                      {['@okaxis', '@okhdfcbank', '@ybl', '@paytm', '@ibl'].map(handle => (
                        <button
                          key={handle}
                          type="button"
                          className="upi-handle-btn"
                          onClick={() => {
                            const prefix = upiId.includes('@') ? upiId.split('@')[0] : upiId || 'username';
                            setUpiId(prefix + handle);
                          }}
                        >
                          {handle}
                        </button>
                      ))}
                    </div>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                    A payment request will be sent directly to your registered UPI mobile application.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ── Method View 2: Cards ── */}
          {method === 'card' && (
            <div className="method-view-box">
              <div className="card-logos-row">
                <span className="card-badge visa">VISA</span>
                <span className="card-badge mastercard">MasterCard</span>
                <span className="card-badge rupay">RuPay</span>
                <span style={{ fontSize: '0.78rem', color: 'var(--color-text-faint)', marginLeft: 'auto' }}>
                  Debit & Credit Cards accepted
                </span>
              </div>

              <div className="form-group">
                <label className="form-label">Card Number</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="4532 •••• •••• 8892"
                  value={cardForm.number}
                  onChange={handleCardNumberChange}
                  maxLength={19}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Cardholder Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Name as printed on card"
                  value={cardForm.name}
                  onChange={e => setCardForm(c => ({ ...c, name: e.target.value }))}
                />
              </div>

              <div className="card-row-fields">
                <div className="form-group">
                  <label className="form-label">Valid Thru</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="MM/YY"
                    value={cardForm.expiry}
                    onChange={handleExpiryChange}
                    maxLength={5}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">CVV / CVC</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="•••"
                    value={cardForm.cvv}
                    onChange={handleCvvChange}
                    maxLength={4}
                  />
                </div>
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--color-text-muted)', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={cardForm.saveCard}
                  onChange={e => setCardForm(c => ({ ...c, saveCard: e.target.checked }))}
                />
                <span>Securely encrypt card for 1-click checkout (PCI-DSS compliant)</span>
              </label>
            </div>
          )}

          {/* ── Method View 3: Net Banking ── */}
          {method === 'netbanking' && (
            <div className="method-view-box">
              <label className="form-label">Popular Indian Banks</label>
              <div className="banks-grid">
                {POPULAR_BANKS.map(bank => (
                  <button
                    key={bank.id}
                    type="button"
                    className={`bank-tile ${selectedBank === bank.id ? 'active' : ''}`}
                    onClick={() => setSelectedBank(bank.id)}
                  >
                    <span className="bank-icon">{bank.icon}</span>
                    <span>{bank.code}</span>
                  </button>
                ))}
              </div>

              <div className="form-group" style={{ marginTop: '8px' }}>
                <label className="form-label">Or Select Another Bank</label>
                <select
                  className="form-input"
                  onChange={e => setSelectedBank(e.target.value)}
                  defaultValue=""
                >
                  <option value="" disabled>Choose your bank...</option>
                  {OTHER_BANKS.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* ── Method View 4: Wallets ── */}
          {method === 'wallet' && (
            <div className="method-view-box">
              <div className="wallets-list">
                {WALLETS.map(w => (
                  <div
                    key={w.id}
                    className={`wallet-tile ${selectedWallet === w.id ? 'active' : ''}`}
                    onClick={() => setSelectedWallet(w.id)}
                  >
                    <div className="wallet-info">
                      <span style={{ fontSize: '1.4rem' }}>{w.icon}</span>
                      <div>
                        <div>{w.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{w.desc}</div>
                      </div>
                    </div>
                    <input
                      type="radio"
                      name="wallet"
                      checked={selectedWallet === w.id}
                      onChange={() => setSelectedWallet(w.id)}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Payment Summary & Action */}
          <div className="payment-total-row">
            <span>Amount to Pay</span>
            <span className="payment-total-val">
              ₹{parseFloat(total || 0).toLocaleString('en-IN')}
            </span>
          </div>

          <button
            id="confirm-payment-btn"
            className="btn btn-primary btn-xl pay-btn"
            onClick={handlePay}
            disabled={paying || !session}
          >
            {paying ? '⏳ Authorizing Payment...' : `Pay ₹${parseFloat(total || 0).toLocaleString('en-IN')} Now →`}
          </button>

          <div className="payment-security-footer">
            <span>🔒 Bank-Grade 256-Bit SSL</span>
            <span>•</span>
            <span>⚡ Instant E-Ticket</span>
            <span>•</span>
            <span>🛡️ Verified Gateway</span>
          </div>
        </div>
      </div>

      {/* ── Processing Overlay Modal ── */}
      {paying && (
        <div className="payment-modal-overlay">
          <div className="payment-modal-card">
            <div className="processing-lock">🔐</div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700 }}>Processing Payment</h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
              {processingStep || 'Please do not refresh or close this browser window.'}
            </p>
            <div className="spinner" style={{ width: '36px', height: '36px', marginTop: '8px' }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-faint)', marginTop: '8px' }}>
              Secured by PLANOVA Payment Gateway
            </span>
          </div>
        </div>
      )}
    </main>
  );
}
