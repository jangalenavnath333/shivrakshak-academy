import Image from 'next/image'

export default function PaymentQR() {
  return (
    <section className="sra-qr-section sra-fade-in" style={{ padding: '80px 20px', background: 'radial-gradient(circle at center, rgba(20,30,16,0.9), var(--sra-black))', borderBottom: '1px solid rgba(212,175,55,0.15)', position: 'relative' }}>
      <div className="sra-container" style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <h2 className="sra-heading" style={{ fontSize: '2.5rem', marginBottom: '15px', color: '#fff', textTransform: 'uppercase', letterSpacing: '2px' }}>
          SECURE <span className="sra-accent" style={{ color: 'var(--sra-gold-lt)', textShadow: '0 0 15px rgba(212,175,55,0.4)' }}>PAYMENT GATEWAY</span>
        </h2>
        <p className="sra-body" style={{ color: 'var(--sra-muted)', marginBottom: '40px', fontSize: '1.1rem' }}>
          खालील QR कोड स्कॅन करून तुम्ही तुमची ॲडमिशन फी भरू शकता. पेमेंट झाल्यावर स्क्रीनशॉट नक्की पाठवा.
        </p>

        <div 
          className="sra-qr-card sra-hover-lift sra-glass"
          style={{ 
            borderRadius: '20px',
            padding: '40px',
            maxWidth: '400px',
            margin: '0 auto',
            border: '1px solid rgba(212, 175, 55, 0.3)',
            boxShadow: '0 25px 60px rgba(0,0,0,0.8), 0 0 30px rgba(212, 175, 55, 0.05)',
            position: 'relative'
          }}
        >
          {/* Decorative Corner Borders */}
          <div style={{ position: 'absolute', top: '15px', left: '15px', width: '30px', height: '30px', borderTop: '2px solid var(--sra-gold)', borderLeft: '2px solid var(--sra-gold)' }} />
          <div style={{ position: 'absolute', top: '15px', right: '15px', width: '30px', height: '30px', borderTop: '2px solid var(--sra-gold)', borderRight: '2px solid var(--sra-gold)' }} />
          <div style={{ position: 'absolute', bottom: '15px', left: '15px', width: '30px', height: '30px', borderBottom: '2px solid var(--sra-gold)', borderLeft: '2px solid var(--sra-gold)' }} />
          <div style={{ position: 'absolute', bottom: '15px', right: '15px', width: '30px', height: '30px', borderBottom: '2px solid var(--sra-gold)', borderRight: '2px solid var(--sra-gold)' }} />

          <div style={{ background: '#fff', padding: '15px', borderRadius: '12px', display: 'inline-block', boxShadow: '0 10px 20px rgba(0,0,0,0.5)' }}>
            <Image 
              src="/images/payment-qr.jpg" 
              alt="Shivrakshak Academy Payment QR Code" 
              width={280} 
              height={280} 
              style={{ display: 'block', borderRadius: '8px' }}
            />
          </div>
          <div style={{ marginTop: '25px' }}>
            <div style={{ fontSize: '1.4rem', fontFamily: 'var(--font-oswald)', color: 'var(--sra-gold-lt)', letterSpacing: '1px' }}>
              SHIVRAKSHAK ACADEMY
            </div>
            <div style={{ fontSize: '1rem', color: 'var(--sra-text)', marginTop: '8px', opacity: 0.8, letterSpacing: '2px' }}>
              UPI ID: powarraje34@okicici
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
