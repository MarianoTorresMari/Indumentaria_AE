import { useState, useEffect } from 'react'
import Header from './components/Header'
import BottomNav from './components/BottomNav'
import BuscarPage from './pages/BuscarPage'
import VenderPage from './pages/VenderPage'
import StockPage from './pages/StockPage'
import AdminPage from './pages/AdminPage'
import {
  obtenerProductos,
  agregarProducto,
  editarProducto,
  eliminarProducto,
  registrarVenta,
} from './services/productos'

/*
  APP PRINCIPAL (con Firebase)
  ----------------------------
  Ahora los datos vienen de Firebase Firestore.
  
  Flujo:
  1. Al cargar la app → trae los productos de Firebase
  2. Al vender/agregar/editar/eliminar → actualiza Firebase
  3. Después de cada acción → refresca la lista
*/

function App() {
  const [activeTab, setActiveTab] = useState('buscar')
  const [productos, setProductos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  // ===== CARGAR PRODUCTOS AL INICIAR =====
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

  // ===== REGISTRAR VENTA =====
  async function handleVenta(productoId, talle, cantidad) {
    try {
      await registrarVenta(productoId, talle, cantidad)
      await cargarProductos()
      return true
    } catch (err) {
      alert('Error al registrar la venta: ' + err.message)
      return false
    }
  }

  // ===== AGREGAR PRODUCTO =====
  async function handleAgregar(datos) {
    try {
      await agregarProducto(datos)
      await cargarProductos()
      return true
    } catch (err) {
      alert('Error al agregar: ' + err.message)
      return false
    }
  }

  // ===== EDITAR PRODUCTO =====
  async function handleEditar(id, datos) {
    try {
      await editarProducto(id, datos)
      await cargarProductos()
      return true
    } catch (err) {
      alert('Error al editar: ' + err.message)
      return false
    }
  }

  // ===== ELIMINAR PRODUCTO =====
  async function handleEliminar(id) {
    try {
      await eliminarProducto(id)
      await cargarProductos()
      return true
    } catch (err) {
      alert('Error al eliminar: ' + err.message)
      return false
    }
  }

  // ===== PANTALLA DE CARGA =====
  if (cargando) {
    return (
      <>
        <Header />
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 20px',
          gap: '16px',
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid var(--border)',
            borderTopColor: 'var(--primary)',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }} />
          <p style={{ color: 'var(--text-light)', fontSize: '15px' }}>
            Cargando productos...
          </p>
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
      </>
    )
  }

  // ===== PANTALLA DE ERROR =====
  if (error) {
    return (
      <>
        <Header />
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 20px',
          textAlign: 'center',
          gap: '16px',
        }}>
          <span style={{ fontSize: '48px' }}>⚠️</span>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-dark)' }}>
            Error de conexión
          </h2>
          <p style={{ color: 'var(--text-light)', fontSize: '14px', maxWidth: '300px' }}>
            {error}
          </p>
          <button
            onClick={cargarProductos}
            className="btn btn-primary"
          >
            🔄 Reintentar
          </button>
        </div>
      </>
    )
  }

  // ===== APP NORMAL =====
  function renderPage() {
    switch (activeTab) {
      case 'buscar':
        return <BuscarPage productos={productos} />
      case 'vender':
        return <VenderPage productos={productos} onVenta={handleVenta} />
      case 'stock':
        return <StockPage productos={productos} />
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
        return <BuscarPage productos={productos} />
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