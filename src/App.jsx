import { useState, useEffect } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import Header from './components/Header'
import BottomNav from './components/BottomNav'
import VenderPage from './pages/VenderPage'
import StockPage from './pages/StockPage'
import HistorialPage from './pages/HistorialPage'
import AdminPage from './pages/AdminPage'
import {
  obtenerProductos,
  agregarProducto,
  editarProducto,
  eliminarProducto,
  registrarVenta,
} from './services/productos'
import { alertError } from './utils/alerts'

function App() {
  const [activeTab, setActiveTab] = useState('vender')
  const [productos, setProductos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    cargarProductos()
  }, [])

  async function cargarProductos() {
    try {
      setCargando(true)
      setError(null)
      const data = await obtenerProductos()
      setProductos(data)
    } catch (err) {
      console.error('Error cargando productos:', err)
      setError('No se pudieron cargar los productos. Verificá la conexión con Firebase.')
    } finally {
      setCargando(false)
    }
  }

  async function handleVenta(items) {
    // items: [{ productoId, talle, cantidad }]
    try {
      for (const item of items) {
        await registrarVenta(item.productoId, item.talle, item.cantidad)
      }
      await cargarProductos()
      return true
    } catch (err) {
      alertError('Error al registrar la venta: ' + err.message)
      return false
    }
  }

  async function handleAgregar(datos) {
    try {
      await agregarProducto(datos)
      await cargarProductos()
      return true
    } catch (err) {
      alertError('Error al agregar: ' + err.message)
      return false
    }
  }

  async function handleEditar(id, datos) {
    try {
      await editarProducto(id, datos)
      await cargarProductos()
      return true
    } catch (err) {
      alertError('Error al editar: ' + err.message)
      return false
    }
  }

  async function handleEliminar(id) {
    try {
      await eliminarProducto(id)
      await cargarProductos()
      return true
    } catch (err) {
      alertError('Error al eliminar: ' + err.message)
      return false
    }
  }

  if (cargando) {
    return (
      <>
        <Header />
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '40px 20px', gap: '16px',
        }}>
          <div style={{
            width: '48px', height: '48px',
            border: '4px solid var(--border)', borderTopColor: 'var(--primary)',
            borderRadius: '50%', animation: 'spin 0.8s linear infinite',
          }} />
          <p style={{ color: 'var(--text-light)', fontSize: '15px' }}>Cargando productos...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
      </>
    )
  }

  if (error) {
    return (
      <>
        <Header />
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '40px 20px', textAlign: 'center', gap: '16px',
        }}>
          <AlertTriangle size={48} color="var(--warning)" />
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-dark)' }}>
            Error de conexión
          </h2>
          <p style={{ color: 'var(--text-light)', fontSize: '14px', maxWidth: '300px' }}>
            {error}
          </p>
          <button
            onClick={cargarProductos}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <RefreshCw size={18} />
            Reintentar
          </button>
        </div>
      </>
    )
  }

  function renderPage() {
    switch (activeTab) {
      case 'vender':
        return <VenderPage productos={productos} onVenta={handleVenta} />
      case 'stock':
        return <StockPage productos={productos} />
      case 'historial':
        return <HistorialPage />
      case 'admin':
        return (
          <AdminPage
            productos={productos}
            onAgregar={handleAgregar}
            onEditar={handleEditar}
            onEliminar={handleEliminar}
            onRefrescar={cargarProductos}
          />
        )
      default:
        return <VenderPage productos={productos} onVenta={handleVenta} />
    }
  }

  return (
    <>
      <Header />
      <main style={{ flex: 1, paddingBottom: '90px' }}>
        {renderPage()}
      </main>
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </>
  )
}

export default App
