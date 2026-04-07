import { useState } from 'react'
import {
  Settings, Pencil, Trash2, Plus, Save, Inbox, RefreshCw, ScanBarcode, Shirt,
} from 'lucide-react'
import { calcularStockTotal as stockTotal, formatPrecio, cargarDatosEjemplo } from '../services/productos'
import {
  alertProductoCreado, alertProductoEditado, alertProductoEliminado,
  alertDatosEjemploCargados, alertError,
  confirmarEliminacion, confirmarCargarEjemplos,
} from '../utils/alerts'

/*
  PÁGINA: ADMINISTRADOR
  ----------------------
  Ver, agregar, editar y eliminar productos.
*/

const TALLES_DISPONIBLES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '2XL', '3XL']

export default function AdminPage({ productos, onAgregar, onEditar, onEliminar, onRefrescar }) {
  const [vista, setVista] = useState('lista') // 'lista' | 'agregar' | 'editar'
  const [productoEditando, setProductoEditando] = useState(null)
  const [cargandoEjemplos, setCargandoEjemplos] = useState(false)

  const listaProductos = productos || []

  async function handleCargarEjemplos() {
    const confirmado = await confirmarCargarEjemplos()
    if (!confirmado) return
    try {
      setCargandoEjemplos(true)
      const cargados = await cargarDatosEjemplo()
      alertDatosEjemploCargados(cargados)
      if (onRefrescar) await onRefrescar()
    } catch (err) {
      alertError(err.message)
    } finally {
      setCargandoEjemplos(false)
    }
  }

  async function handleEliminar(producto) {
    const confirmado = await confirmarEliminacion(producto.nombre)
    if (!confirmado) return
    const ok = await onEliminar?.(producto.id)
    if (ok !== false) alertProductoEliminado(producto.nombre)
  }

  async function handleGuardar(datos) {
    if (vista === 'agregar') {
      const ok = await onAgregar?.(datos)
      if (ok !== false) alertProductoCreado(datos.nombre)
    } else {
      const ok = await onEditar?.(productoEditando.id, datos)
      if (ok !== false) alertProductoEditado(datos.nombre)
    }
    setVista('lista')
    setProductoEditando(null)
  }

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      {/* Título */}
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: '20px',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <Settings size={22} color="var(--primary)" />
            <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-dark)', margin: 0 }}>
              Administración
            </h2>
          </div>
          <p style={{ color: 'var(--text-light)', fontSize: '14px' }}>Gestionar productos</p>
        </div>
        {vista === 'lista' && (
          <button
            onClick={() => setVista('agregar')}
            className="btn btn-primary"
            style={{ fontSize: '15px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Plus size={18} />
            Nuevo
          </button>
        )}
      </div>

      {/* ===== LISTA ===== */}
      {vista === 'lista' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {listaProductos.map(producto => (
            <div key={producto.id} className="card" style={{ padding: '16px' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{
                  width: '50px', height: '50px', borderRadius: '10px', flexShrink: 0,
                  background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Shirt size={22} color="var(--primary)" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: '15px', fontWeight: 600, color: 'var(--text-dark)',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>
                    {producto.nombre}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-light)' }}>
                    {formatPrecio(producto.precio)} · Stock: {stockTotal(producto)}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                  <button
                    onClick={() => { setProductoEditando(producto); setVista('editar') }}
                    style={{
                      padding: '8px 14px', borderRadius: '8px',
                      border: '2px solid var(--border)', background: 'white',
                      cursor: 'pointer', color: 'var(--primary)', display: 'flex', alignItems: 'center',
                    }}
                    title="Editar"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => handleEliminar(producto)}
                    style={{
                      padding: '8px 14px', borderRadius: '8px',
                      border: '2px solid var(--danger-light)', background: 'var(--danger-light)',
                      cursor: 'pointer', color: 'var(--danger)', display: 'flex', alignItems: 'center',
                    }}
                    title="Eliminar"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {listaProductos.length === 0 && (
            <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text-light)' }}>
              <Inbox size={48} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.4 }} />
              <p>No hay productos todavía</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '20px', alignItems: 'center' }}>
                <button onClick={() => setVista('agregar')} className="btn btn-primary">
                  <Plus size={16} style={{ marginRight: '6px' }} />
                  Agregar primer producto
                </button>
                <span style={{ fontSize: '13px', color: 'var(--text-light)' }}>o</span>
                <button
                  onClick={handleCargarEjemplos}
                  className="btn btn-outline"
                  disabled={cargandoEjemplos}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  {cargandoEjemplos
                    ? <><RefreshCw size={16} style={{ animation: 'spin 0.8s linear infinite' }} /> Cargando...</>
                    : <><ScanBarcode size={16} /> Cargar productos de ejemplo</>
                  }
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===== FORMULARIO ===== */}
      {(vista === 'agregar' || vista === 'editar') && (
        <FormularioProducto
          producto={productoEditando}
          onGuardar={handleGuardar}
          onCancelar={() => { setVista('lista'); setProductoEditando(null) }}
          esEdicion={vista === 'editar'}
        />
      )}
    </div>
  )
}

/* ===== FORMULARIO DE PRODUCTO ===== */
function FormularioProducto({ producto, onGuardar, onCancelar, esEdicion }) {
  const [nombre, setNombre] = useState(producto?.nombre || '')
  const [codigo, setCodigo] = useState(producto?.codigo || '')
  const [categoria, setCategoria] = useState(producto?.categoria || '')
  const [precio, setPrecio] = useState(producto?.precio || '')
  const [tallesSeleccionados, setTallesSeleccionados] = useState(
    producto ? Object.keys(producto.talles) : ['S', 'M', 'L', 'XL']
  )
  const [cantidades, setCantidades] = useState(producto?.talles || {})

  function toggleTalle(talle) {
    if (tallesSeleccionados.includes(talle)) {
      setTallesSeleccionados(tallesSeleccionados.filter(t => t !== talle))
      const newCant = { ...cantidades }
      delete newCant[talle]
      setCantidades(newCant)
    } else {
      setTallesSeleccionados([...tallesSeleccionados, talle])
      setCantidades({ ...cantidades, [talle]: 0 })
    }
  }

  function actualizarCantidad(talle, valor) {
    setCantidades({ ...cantidades, [talle]: Math.max(0, parseInt(valor) || 0) })
  }

  function handleSubmit() {
    if (!nombre.trim()) { alertError('Ingresá el nombre del producto'); return }
    if (!codigo.trim()) { alertError('Ingresá el código de barras'); return }
    if (!precio) { alertError('Ingresá el precio'); return }
    if (tallesSeleccionados.length === 0) { alertError('Seleccioná al menos un talle'); return }

    const talles = {}
    tallesSeleccionados.forEach(t => { talles[t] = cantidades[t] || 0 })

    onGuardar({
      nombre: nombre.trim(),
      codigo: codigo.trim(),
      categoria: categoria.trim() || 'General',
      precio: parseInt(precio),
      talles,
    })
  }

  return (
    <div className="animate-slide-up">
      <button
        onClick={onCancelar}
        style={{
          background: 'var(--primary-soft)', border: 'none', borderRadius: '8px',
          padding: '8px 16px', fontSize: '14px', fontWeight: 600,
          color: 'var(--primary)', cursor: 'pointer', marginBottom: '20px', fontFamily: 'inherit',
        }}
      >
        ← Volver a la lista
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
        {esEdicion ? <Pencil size={22} color="var(--primary)" /> : <Plus size={22} color="var(--primary)" />}
        <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-dark)', margin: 0 }}>
          {esEdicion ? 'Editar Producto' : 'Nuevo Producto'}
        </h3>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label className="label">Código de barras *</label>
          <div style={{ position: 'relative' }}>
            <div style={{
              position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
              pointerEvents: 'none', color: 'var(--text-light)',
            }}>
              <ScanBarcode size={18} />
            </div>
            <input
              type="text" className="input"
              placeholder="Escaneá o escribí el código..."
              value={codigo} onChange={e => setCodigo(e.target.value)}
              style={{ paddingLeft: '42px' }}
              autoFocus
            />
          </div>
          <small style={{ color: 'var(--text-light)', fontSize: '12px' }}>
            Podés usar un lector de código de barras USB (funciona como teclado)
          </small>
        </div>

        <div>
          <label className="label">Nombre del producto *</label>
          <input
            type="text" className="input" placeholder="Ej: Remera Nike Dry-Fit"
            value={nombre} onChange={e => setNombre(e.target.value)}
          />
        </div>

        <div>
          <label className="label">Categoría</label>
          <input
            type="text" className="input" placeholder="Ej: Remeras, Pantalones, Camperas..."
            value={categoria} onChange={e => setCategoria(e.target.value)}
          />
        </div>

        <div>
          <label className="label">Precio de venta *</label>
          <input
            type="number" className="input" placeholder="Ej: 25000"
            value={precio} onChange={e => setPrecio(e.target.value)}
            style={{ fontSize: '18px' }}
          />
        </div>


        <div>
          <label className="label">Talles disponibles *</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
            {TALLES_DISPONIBLES.map(talle => {
              const isSelected = tallesSeleccionados.includes(talle)
              return (
                <button
                  key={talle} type="button" onClick={() => toggleTalle(talle)}
                  style={{
                    padding: '10px 16px', borderRadius: '10px', fontFamily: 'inherit',
                    fontSize: '15px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
                    border: `2px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
                    background: isSelected ? 'var(--primary-light)' : 'white',
                    color: isSelected ? 'var(--primary)' : 'var(--text)',
                  }}
                >
                  {talle}
                </button>
              )
            })}
          </div>

          {tallesSeleccionados.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '10px' }}>
              {tallesSeleccionados
                .sort((a, b) => TALLES_DISPONIBLES.indexOf(a) - TALLES_DISPONIBLES.indexOf(b))
                .map(talle => (
                  <div key={talle} style={{ textAlign: 'center' }}>
                    <label style={{
                      fontSize: '13px', fontWeight: 600, color: 'var(--text)',
                      display: 'block', marginBottom: '4px',
                    }}>
                      Talle {talle}
                    </label>
                    <input
                      type="number" className="input" min="0"
                      value={cantidades[talle] || 0}
                      onChange={e => actualizarCantidad(talle, e.target.value)}
                      style={{ textAlign: 'center', fontSize: '18px', fontWeight: 700, padding: '10px' }}
                    />
                  </div>
                ))}
            </div>
          )}
        </div>

        <button
          onClick={handleSubmit}
          className="btn btn-primary btn-full btn-lg"
          style={{ marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
        >
          <Save size={18} />
          {esEdicion ? 'Guardar Cambios' : 'Agregar Producto'}
        </button>
      </div>
    </div>
  )
}
