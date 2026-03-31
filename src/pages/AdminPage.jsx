import { useState } from 'react'
import { calcularStockTotal as stockTotal, formatPrecio, cargarDatosEjemplo } from '../services/productos'

/*
  PÁGINA: ADMINISTRADOR
  ----------------------
  Permite:
  - Ver todos los productos
  - Agregar nuevos productos
  - Editar productos existentes
  - Eliminar productos
  
  Por ahora trabaja con datos locales.
  Después conectaremos con MongoDB.
*/

const TALLES_DISPONIBLES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '2XL', '3XL']

export default function AdminPage({ productos, onAgregar, onEditar, onEliminar, onRefrescar }) {
  const [vista, setVista] = useState('lista') // 'lista' | 'agregar' | 'editar'
  const [productoEditando, setProductoEditando] = useState(null)
  const [cargandoEjemplos, setCargandoEjemplos] = useState(false)

  const listaProductos = productos || []

  // Función para cargar datos de ejemplo en Firebase
  async function handleCargarEjemplos() {
    if (!confirm('¿Cargar 6 productos de ejemplo en la base de datos?')) return
    try {
      setCargandoEjemplos(true)
      const cargados = await cargarDatosEjemplo()
      alert(`✅ Se cargaron ${cargados} productos de ejemplo`)
      if (onRefrescar) await onRefrescar()
    } catch (err) {
      alert('Error: ' + err.message)
    } finally {
      setCargandoEjemplos(false)
    }
  }

  function abrirEditar(producto) {
    setProductoEditando(producto)
    setVista('editar')
  }

  function volver() {
    setVista('lista')
    setProductoEditando(null)
  }

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      {/* Título */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
      }}>
        <div>
          <h2 style={{
            fontSize: '22px',
            fontWeight: 700,
            color: 'var(--text-dark)',
            marginBottom: '4px',
          }}>
            ⚙️ Administración
          </h2>
          <p style={{ color: 'var(--text-light)', fontSize: '14px' }}>
            Gestionar productos
          </p>
        </div>
        {vista === 'lista' && (
          <button
            onClick={() => setVista('agregar')}
            className="btn btn-primary"
            style={{ fontSize: '15px' }}
          >
            + Nuevo
          </button>
        )}
      </div>

      {/* ===== VISTA: Lista de productos ===== */}
      {vista === 'lista' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {listaProductos.map(producto => (
            <div key={producto.id} className="card" style={{ padding: '16px' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <img
                  src={producto.imagen}
                  alt=""
                  style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '10px',
                    objectFit: 'cover',
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: '15px',
                    fontWeight: 600,
                    color: 'var(--text-dark)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {producto.nombre}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-light)' }}>
                    {formatPrecio(producto.precio)} · Stock: {stockTotal(producto)}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                  <button
                    onClick={() => abrirEditar(producto)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '8px',
                      border: '2px solid var(--border)',
                      background: 'white',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: 'var(--primary)',
                    }}
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`¿Eliminar "${producto.nombre}"?`)) {
                        onEliminar && onEliminar(producto.id)
                      }
                    }}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '8px',
                      border: '2px solid var(--danger-light)',
                      background: 'var(--danger-light)',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      fontSize: '14px',
                    }}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}

          {listaProductos.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '48px 20px',
              color: 'var(--text-light)',
            }}>
              <span style={{ fontSize: '48px', display: 'block', marginBottom: '12px' }}>📭</span>
              <p>No hay productos todavía</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '20px', alignItems: 'center' }}>
                <button
                  onClick={() => setVista('agregar')}
                  className="btn btn-primary"
                >
                  + Agregar primer producto
                </button>
                <span style={{ fontSize: '13px', color: 'var(--text-light)' }}>o</span>
                <button
                  onClick={handleCargarEjemplos}
                  className="btn btn-outline"
                  disabled={cargandoEjemplos}
                >
                  {cargandoEjemplos ? '⏳ Cargando...' : '📦 Cargar productos de ejemplo'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===== VISTA: Formulario Agregar/Editar ===== */}
      {(vista === 'agregar' || vista === 'editar') && (
        <FormularioProducto
          producto={productoEditando}
          onGuardar={(datos) => {
            if (vista === 'agregar') {
              onAgregar && onAgregar(datos)
            } else {
              onEditar && onEditar(productoEditando.id, datos)
            }
            volver()
          }}
          onCancelar={volver}
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
  const [imagen, setImagen] = useState(producto?.imagen || '')
  const [categoria, setCategoria] = useState(producto?.categoria || '')
  const [precio, setPrecio] = useState(producto?.precio || '')
  const [tallesSeleccionados, setTallesSeleccionados] = useState(
    producto ? Object.keys(producto.talles) : ['S', 'M', 'L', 'XL']
  )
  const [cantidades, setCantidades] = useState(
    producto?.talles || {}
  )

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
    const num = parseInt(valor) || 0
    setCantidades({ ...cantidades, [talle]: Math.max(0, num) })
  }

  function handleSubmit() {
    if (!nombre.trim()) { alert('Ingresá el nombre del producto'); return }
    if (!codigo.trim()) { alert('Ingresá el código de barras'); return }
    if (!precio) { alert('Ingresá el precio'); return }
    if (tallesSeleccionados.length === 0) { alert('Seleccioná al menos un talle'); return }

    const talles = {}
    tallesSeleccionados.forEach(t => {
      talles[t] = cantidades[t] || 0
    })

    onGuardar({
      nombre: nombre.trim(),
      codigo: codigo.trim(),
      imagen: imagen.trim() || 'https://via.placeholder.com/300?text=Sin+Imagen',
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
          background: 'var(--primary-soft)',
          border: 'none',
          borderRadius: '8px',
          padding: '8px 16px',
          fontSize: '14px',
          fontWeight: 600,
          color: 'var(--primary)',
          cursor: 'pointer',
          marginBottom: '20px',
          fontFamily: 'inherit',
        }}
      >
        ← Volver a la lista
      </button>

      <h3 style={{
        fontSize: '18px',
        fontWeight: 700,
        color: 'var(--text-dark)',
        marginBottom: '20px',
      }}>
        {esEdicion ? '✏️ Editar Producto' : '➕ Nuevo Producto'}
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Código de barras */}
        <div>
          <label className="label">Código de barras *</label>
          <input
            type="text"
            className="input"
            placeholder="Escaneá o escribí el código..."
            value={codigo}
            onChange={e => setCodigo(e.target.value)}
            autoFocus
          />
          <small style={{ color: 'var(--text-light)', fontSize: '12px' }}>
            💡 Podés usar un lector de código de barras USB (funciona como teclado)
          </small>
        </div>

        {/* Nombre */}
        <div>
          <label className="label">Nombre del producto *</label>
          <input
            type="text"
            className="input"
            placeholder="Ej: Remera Nike Dry-Fit"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
          />
        </div>

        {/* Categoría */}
        <div>
          <label className="label">Categoría</label>
          <input
            type="text"
            className="input"
            placeholder="Ej: Remeras, Pantalones, Camperas..."
            value={categoria}
            onChange={e => setCategoria(e.target.value)}
          />
        </div>

        {/* Precio */}
        <div>
          <label className="label">Precio de venta *</label>
          <input
            type="number"
            className="input"
            placeholder="Ej: 25000"
            value={precio}
            onChange={e => setPrecio(e.target.value)}
            style={{ fontSize: '18px' }}
          />
        </div>

        {/* URL de imagen */}
        <div>
          <label className="label">URL de imagen (opcional)</label>
          <input
            type="text"
            className="input"
            placeholder="https://..."
            value={imagen}
            onChange={e => setImagen(e.target.value)}
          />
          {imagen && (
            <img
              src={imagen}
              alt="Preview"
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '10px',
                objectFit: 'cover',
                marginTop: '8px',
              }}
              onError={e => e.target.style.display = 'none'}
            />
          )}
        </div>

        {/* Talles */}
        <div>
          <label className="label">Talles disponibles *</label>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            marginBottom: '12px',
          }}>
            {TALLES_DISPONIBLES.map(talle => {
              const isSelected = tallesSeleccionados.includes(talle)
              return (
                <button
                  key={talle}
                  type="button"
                  onClick={() => toggleTalle(talle)}
                  style={{
                    padding: '10px 16px',
                    borderRadius: '10px',
                    border: `2px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
                    background: isSelected ? 'var(--primary-light)' : 'white',
                    color: isSelected ? 'var(--primary)' : 'var(--text)',
                    fontFamily: 'inherit',
                    fontSize: '15px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  {talle}
                </button>
              )
            })}
          </div>

          {/* Cantidad por talle */}
          {tallesSeleccionados.length > 0 && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
              gap: '10px',
            }}>
              {tallesSeleccionados
                .sort((a, b) => TALLES_DISPONIBLES.indexOf(a) - TALLES_DISPONIBLES.indexOf(b))
                .map(talle => (
                  <div key={talle} style={{ textAlign: 'center' }}>
                    <label style={{
                      fontSize: '13px',
                      fontWeight: 600,
                      color: 'var(--text)',
                      display: 'block',
                      marginBottom: '4px',
                    }}>
                      Talle {talle}
                    </label>
                    <input
                      type="number"
                      className="input"
                      min="0"
                      value={cantidades[talle] || 0}
                      onChange={e => actualizarCantidad(talle, e.target.value)}
                      style={{
                        textAlign: 'center',
                        fontSize: '18px',
                        fontWeight: 700,
                        padding: '10px',
                      }}
                    />
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Botón guardar */}
        <button
          onClick={handleSubmit}
          className="btn btn-primary btn-full btn-lg"
          style={{ marginTop: '8px' }}
        >
          {esEdicion ? '💾 Guardar Cambios' : '➕ Agregar Producto'}
        </button>
      </div>
    </div>
  )
}