import Image from 'next/image'

export default function PaymentQR() {
  return (
    <section className="sra-qr-section sra-fade-in" style={{ padding: '60px 20px', background: 'var(--sra-panel)', borderBottom: '1px solid rgba(212,175,55,0.1)' }}>
      <div className="sra-container" style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
        <h2 className="sra-heading" style={{ fontSize: '2rem', marginBottom: '10px' }}>
          प्रवेशासाठी फी <span className="sra-accent">ऑनलाईन भरा</span>
        </h2>
        <p className="sra-body" style={{ color: 'var(--sra-gray-text)', marginBottom: '30px' }}>
          खालील QR कोड स्कॅन करून तुम्ही तुमची ॲडमिशन फी भरू शकता. पेमेंट झाल्यावर स्क्रीनशॉट नक्की पाठवा.
        </p>

        <div 
          className="sra-qr-card sra-hover-lift"
          style={{ 
            background: 'rgba(255, 255, 255, 0.03)', 
            border: '1px solid rgba(212, 175, 55, 0.2)',
            borderRadius: '16px',
            padding: '30px',
            maxWidth: '350px',
            margin: '0 auto',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <div style={{ background: 'white', padding: '15px', borderRadius: '12px', display: 'inline-block' }}>
            <Image 
              src="/images/payment-qr.jpg" 
              alt="Shivrakshak Academy Payment QR Code" 
              width={250} 
              height={250} 
              style={{ display: 'block', borderRadius: '8px' }}
            />
          </div>
          <div style={{ marginTop: '20px' }}>
            <div style={{ fontSize: '1.2rem', fontFamily: 'var(--font-oswald)', color: 'var(--sra-accent)' }}>
              SHIVRAKSHAK CAREER ACADEMY
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
