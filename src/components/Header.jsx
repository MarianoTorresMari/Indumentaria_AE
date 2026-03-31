/*
  HEADER
  ------
  Simple: solo el nombre de la tienda.
  En mobile se achica. No tiene menú (la navegación está abajo).
*/

export default function Header() {
  return (
    <header style={{
      background: 'white',
      borderBottom: '1px solid var(--border)',
      padding: '16px 20px',
      position: 'sticky',
      top: 0,
      zIndex: 900,
      boxShadow: 'var(--shadow-sm)',
    }}>
      <div style={{
        maxWidth: '600px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Icono de la tienda */}
          <span style={{
            fontSize: '24px',
            lineHeight: 1,
          }}>👕</span>
          <div>
            <h1 style={{
              fontSize: '18px',
              fontWeight: 700,
              color: 'var(--text-dark)',
              letterSpacing: '-0.3px',
              margin: 0,
              lineHeight: 1.2,
            }}>
              Indumentaria AE
            </h1>
            <span style={{
              fontSize: '12px',
              color: 'var(--text-light)',
              fontWeight: 500,
            }}>
              Control de Stock
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}