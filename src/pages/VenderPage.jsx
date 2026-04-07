import { useState, useMemo } from 'react'
import {
  ShoppingCart, Search, X, Minus, Plus, CheckCircle, SearchX, Shirt, Trash2,
  ChevronDown, ChevronUp,
} from 'lucide-react'
import { calcularStockTotal as stockTotal, formatPrecio } from '../services/productos'
import {
  alertVentaExitosa, alertError, alertStockInsuficiente, confirmarVenta,
} from '../utils/alerts'

/*
  PÁGINA: VENDER
  ---------------
  Catálogo + carrito multi-producto y multi-talle.
  1. Clic en un producto → abre panel inferior para elegir talles y cantidades
  2. "Agregar al carrito" → el producto aparece en el resumen del carrito
  3. Podés agregar varios productos y varios talles por producto
  4. Confirmar procesa todos los ítems a la vez
*/

export default function VenderPage({ productos, onVenta }) {
  const [busqueda, setBusqueda] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState('Todas')
  const [productoPanel, setProductoPanel] = useState(null)
  const [seleccion, setSeleccion] = useState({}) // { [talle]: cantidad }
  const [carrito, setCarrito] = useState([])     // [{ producto, talle, cantidad }]
  const [carritoExpandido, setCarritoExpandido] = useState(false)
  const [confirmando, setConfirmando] = useState(false)

  const listaProductos = productos || []

  const categorias = useMemo(
    () => ['Todas', ...new Set(listaProductos.map(p => p.categoria))],
    [listaProductos]
  )

  const productosFiltrados = useMemo(() => {
    return listaProductos.filter(p => {
      const matchCat = filtroCategoria === 'Todas' || p.categoria === filtroCategoria
      const matchBusq = !busqueda ||
        p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.codigo.includes(busqueda)
      return matchCat && matchBusq
    })
  }, [listaProductos, filtroCategoria, busqueda])

  function abrirPanel(producto) {
    if (stockTotal(producto) === 0) return
    // Pre-cargar las cantidades que ya están en el carrito para este producto
    const inicial = {}
    carrito
      .filter(i => i.producto.id === producto.id)
      .forEach(i => { inicial[i.talle] = i.cantidad })
    setSeleccion(inicial)
    setProductoPanel(producto)
  }

  function cerrarPanel() {
    setProductoPanel(null)
    setSeleccion({})
  }

  function cambiarCantidad(talle, delta) {
    const max = productoPanel.talles[talle]
    setSeleccion(prev => {
      const nuevo = Math.min(max, Math.max(0, (prev[talle] || 0) + delta))
      const copia = { ...prev }
      if (nuevo === 0) delete copia[talle]
      else copia[talle] = nuevo
      return copia
    })
  }

  function agregarAlCarrito() {
    const sinEsteProducto = carrito.filter(i => i.producto.id !== productoPanel.id)
    const nuevos = Object.entries(seleccion)
      .filter(([, cant]) => cant > 0)
      .map(([talle, cantidad]) => ({ producto: productoPanel, talle, cantidad }))
    setCarrito([...sinEsteProducto, ...nuevos])
    cerrarPanel()
  }

  function quitarDelCarrito(idx) {
    setCarrito(c => c.filter((_, i) => i !== idx))
  }

  const totalVenta = carrito.reduce((s, i) => s + i.producto.precio * i.cantidad, 0)
  const totalUnidades = carrito.reduce((s, i) => s + i.cantidad, 0)

  function cantidadEnCarrito(productoId) {
    return carrito
      .filter(i => i.producto.id === productoId)
      .reduce((s, i) => s + i.cantidad, 0)
  }

  async function confirmar() {
    if (carrito.length === 0 || confirmando) return

    // Validar stock antes de confirmar
    for (const item of carrito) {
      const disponible = item.producto.talles[item.talle]
      if (item.cantidad > disponible) {
        alertStockInsuficiente(disponible)
        return
      }
    }

    const confirmado = await confirmarVenta(carrito)
    if (!confirmado) return

    setConfirmando(true)
    const ok = await onVenta(
      carrito.map(i => ({ productoId: i.producto.id, talle: i.talle, cantidad: i.cantidad }))
    )
    setConfirmando(false)

    if (ok) {
      alertVentaExitosa(carrito)
      setCarrito([])
      setCarritoExpandido(false)
    } else {
      alertError('No se pudo registrar la venta. Intentá de nuevo.')
    }
  }

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      {/* Título */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
        <ShoppingCart size={22} color="var(--primary)" />
        <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-dark)', margin: 0 }}>
          Registrar Venta
        </h2>
      </div>

      {/* Carrito */}
      {carrito.length > 0 && (
        <div className="card" style={{ marginBottom: '16px', borderLeft: '4px solid var(--primary)', padding: 0 }}>
          {/* Header del carrito (siempre visible) */}
          <button
            onClick={() => setCarritoExpandido(v => !v)}
            style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '14px 16px', width: '100%', background: 'none', border: 'none',
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                background: 'var(--primary)', color: 'white', borderRadius: '50%',
                width: '24px', height: '24px', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '13px', fontWeight: 700, flexShrink: 0,
              }}>
                {totalUnidades}
              </div>
              <span style={{ fontWeight: 600, color: 'var(--text-dark)', fontSize: '15px' }}>
                {carrito.length === 1 ? '1 artículo' : `${carrito.length} artículos`} en el carrito
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '15px' }}>
                {formatPrecio(totalVenta)}
              </span>
              {carritoExpandido
                ? <ChevronUp size={18} color="var(--text-light)" />
                : <ChevronDown size={18} color="var(--text-light)" />
              }
            </div>
          </button>

          {/* Detalle expandible */}
          {carritoExpandido && (
            <div style={{ borderTop: '1px solid var(--border)', padding: '12px 16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                {carrito.map((item, idx) => (
                  <div key={idx} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    background: 'var(--bg)', borderRadius: '8px', padding: '10px 12px',
                  }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-dark)' }}>
                        {item.producto.nombre}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-light)' }}>
                        Talle {item.talle} · {item.cantidad} u. · {formatPrecio(item.producto.precio * item.cantidad)}
                      </div>
                    </div>
                    <button
                      onClick={() => quitarDelCarrito(idx)}
                      style={{
                        background: 'var(--danger-light)', border: 'none', borderRadius: '6px',
                        width: '30px', height: '30px', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', cursor: 'pointer', color: 'var(--danger)', flexShrink: 0,
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={confirmar}
                disabled={confirmando}
                className="btn btn-success btn-full"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '16px' }}
              >
                <CheckCircle size={18} />
                {confirmando ? 'Registrando...' : `Confirmar venta — ${formatPrecio(totalVenta)}`}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Búsqueda */}
      <div style={{ position: 'relative', marginBottom: '12px' }}>
        <div style={{
          position: 'absolute', left: '14px', top: '50%',
          transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-light)',
        }}>
          <Search size={18} />
        </div>
        <input
          type="text" className="input"
          placeholder="Buscar por nombre o código..."
          value={busqueda} onChange={e => setBusqueda(e.target.value)}
          style={{ paddingLeft: '42px', paddingRight: busqueda ? '42px' : '16px', fontSize: '15px' }}
        />
        {busqueda && (
          <button
            onClick={() => setBusqueda('')}
            style={{
              position: 'absolute', right: '12px', top: '50%',
              transform: 'translateY(-50%)', background: 'var(--border)',
              border: 'none', borderRadius: '50%', width: '26px', height: '26px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'var(--text-light)',
            }}
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Filtro categorías */}
      <div style={{
        display: 'flex', gap: '8px', overflowX: 'auto',
        paddingBottom: '4px', marginBottom: '16px',
      }}>
        {categorias.map(cat => (
          <button
            key={cat}
            onClick={() => setFiltroCategoria(cat)}
            style={{
              padding: '8px 16px', borderRadius: '20px', border: '2px solid',
              borderColor: filtroCategoria === cat ? 'var(--primary)' : 'var(--border)',
              background: filtroCategoria === cat ? 'var(--primary-light)' : 'white',
              color: filtroCategoria === cat ? 'var(--primary)' : 'var(--text)',
              fontFamily: 'inherit', fontSize: '14px', fontWeight: 600,
              cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.15s',
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Catálogo */}
      {productosFiltrados.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text-light)' }}>
          <SearchX size={48} style={{ margin: '0 auto 16px', display: 'block', opacity: 0.4 }} />
          <p style={{ fontSize: '15px' }}>No hay productos que coincidan</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {productosFiltrados.map(p => (
            <ProductoCard
              key={p.id}
              producto={p}
              onSeleccionar={abrirPanel}
              cantidadEnCarrito={cantidadEnCarrito(p.id)}
            />
          ))}
        </div>
      )}

      {/* Panel de selección de talles */}
      {productoPanel && (
        <PanelTalles
          producto={productoPanel}
          seleccion={seleccion}
          onCambiarCantidad={cambiarCantidad}
          onAgregar={agregarAlCarrito}
          onCerrar={cerrarPanel}
        />
      )}
    </div>
  )
}

/* ===== TARJETA DE PRODUCTO ===== */
function ProductoCard({ producto, onSeleccionar, cantidadEnCarrito }) {
  const total = stockTotal(producto)
  const sinStock = total === 0
  const stockBajo = total > 0 && total <= 5
  const enCarrito = cantidadEnCarrito > 0

  const colorBorde = sinStock
    ? 'var(--danger)'
    : enCarrito ? 'var(--primary)'
    : stockBajo ? 'var(--warning)'
    : 'var(--success)'

  return (
    <button
      onClick={() => onSeleccionar(producto)}
      disabled={sinStock}
      style={{
        display: 'flex', gap: '12px', padding: '14px 16px',
        background: enCarrito ? 'var(--primary-light)' : sinStock ? '#f8f8f8' : 'white',
        border: `1px solid ${enCarrito ? 'var(--primary)' : 'var(--border)'}`,
        borderLeft: `4px solid ${colorBorde}`,
        borderRadius: '14px', cursor: sinStock ? 'not-allowed' : 'pointer',
        opacity: sinStock ? 0.6 : 1, textAlign: 'left', fontFamily: 'inherit',
        transition: 'box-shadow 0.15s', width: '100%',
        boxShadow: enCarrito ? 'var(--shadow-md)' : 'var(--shadow-sm)',
      }}
      onMouseEnter={e => { if (!sinStock) e.currentTarget.style.boxShadow = 'var(--shadow-md)' }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = enCarrito ? 'var(--shadow-md)' : 'var(--shadow-sm)' }}
    >
      <div style={{
        width: '56px', height: '56px', borderRadius: '10px', flexShrink: 0,
        background: enCarrito ? 'var(--primary)' : sinStock ? 'var(--border)' : 'var(--primary-light)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative',
      }}>
        <Shirt size={24} color={enCarrito ? 'white' : sinStock ? 'var(--text-light)' : 'var(--primary)'} />
        {enCarrito && (
          <div style={{
            position: 'absolute', top: '-6px', right: '-6px',
            background: 'var(--success)', color: 'white', borderRadius: '50%',
            width: '18px', height: '18px', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '11px', fontWeight: 700,
            border: '2px solid white',
          }}>
            {cantidadEnCarrito}
          </div>
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
          <span style={{
            fontSize: '15px', fontWeight: 600,
            color: enCarrito ? 'var(--primary)' : 'var(--text-dark)',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {producto.nombre}
          </span>
          <span className={`badge ${sinStock ? 'badge-danger' : stockBajo ? 'badge-warning' : 'badge-success'}`}
            style={{ flexShrink: 0 }}>
            {sinStock ? 'Sin stock' : stockBajo ? `¡Solo ${total}!` : `${total} u.`}
          </span>
        </div>
        <div style={{ fontSize: '13px', color: 'var(--text-light)', marginTop: '2px' }}>
          {producto.codigo} · {producto.categoria}
        </div>
        <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--primary)', marginTop: '4px' }}>
          {formatPrecio(producto.precio)}
        </div>
        <div style={{ display: 'flex', gap: '4px', marginTop: '6px', flexWrap: 'wrap' }}>
          {Object.entries(producto.talles).map(([talle, cant]) => (
            <span key={talle} style={{
              fontSize: '11px', fontWeight: 600, padding: '2px 6px', borderRadius: '5px',
              background: cant === 0 ? 'var(--danger-light)' : cant <= 3 ? 'var(--warning-light)' : '#f0fdf4',
              color: cant === 0 ? 'var(--danger)' : cant <= 3 ? 'var(--warning)' : 'var(--success)',
            }}>
              {talle}: {cant}
            </span>
          ))}
        </div>
      </div>
    </button>
  )
}

/* ===== PANEL DE TALLES (bottom sheet) ===== */
function PanelTalles({ producto, seleccion, onCambiarCantidad, onAgregar, onCerrar }) {
  const totalSeleccionado = Object.values(seleccion).reduce((s, c) => s + c, 0)
  const totalPrecio = totalSeleccionado * producto.precio
  const haySeleccion = totalSeleccionado > 0

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1100, display: 'flex', alignItems: 'flex-end' }}>
      {/* Backdrop */}
      <div
        onClick={onCerrar}
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }}
      />
      {/* Sheet */}
      <div style={{
        position: 'relative', width: '100%', maxWidth: '600px', margin: '0 auto',
        background: 'white', borderRadius: '20px 20px 0 0',
        padding: '20px 20px 32px', maxHeight: '85vh', overflowY: 'auto',
        boxShadow: '0 -4px 24px rgba(0,0,0,0.15)',
      }}>
        {/* Handle */}
        <div style={{
          width: '40px', height: '4px', background: 'var(--border)',
          borderRadius: '2px', margin: '0 auto 16px',
        }} />

        {/* Info del producto */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{
            width: '52px', height: '52px', borderRadius: '10px', flexShrink: 0,
            background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Shirt size={24} color="var(--primary)" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-dark)' }}>
              {producto.nombre}
            </div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--primary)' }}>
              {formatPrecio(producto.precio)} por unidad
            </div>
          </div>
          <button
            onClick={onCerrar}
            style={{
              background: 'var(--border)', border: 'none', borderRadius: '50%',
              width: '32px', height: '32px', display: 'flex', alignItems: 'center',
              justifyContent: 'center', cursor: 'pointer', flexShrink: 0,
            }}
          >
            <X size={16} color="var(--text)" />
          </button>
        </div>

        {/* Talles con +/- */}
        <div style={{
          fontSize: '12px', fontWeight: 600, color: 'var(--text-light)',
          textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px',
        }}>
          Seleccioná talles y cantidades
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
          {Object.entries(producto.talles).map(([talle, stockDisp]) => {
            const sinStock = stockDisp === 0
            const cantActual = seleccion[talle] || 0
            const seleccionado = cantActual > 0
            return (
              <div
                key={talle}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 14px', borderRadius: '12px',
                  border: `2px solid ${seleccionado ? 'var(--primary)' : sinStock ? 'var(--danger-light)' : 'var(--border)'}`,
                  background: seleccionado ? 'var(--primary-light)' : sinStock ? 'var(--danger-light)' : 'white',
                  opacity: sinStock ? 0.5 : 1,
                }}
              >
                <div>
                  <span style={{
                    fontSize: '18px', fontWeight: 700,
                    color: seleccionado ? 'var(--primary)' : sinStock ? 'var(--danger)' : 'var(--text-dark)',
                  }}>
                    {talle}
                  </span>
                  <span style={{ fontSize: '13px', color: sinStock ? 'var(--danger)' : 'var(--text-light)', marginLeft: '8px' }}>
                    {sinStock ? 'Sin stock' : `${stockDisp} disp.`}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <button
                    onClick={() => !sinStock && onCambiarCantidad(talle, -1)}
                    disabled={sinStock || cantActual === 0}
                    style={{
                      width: '34px', height: '34px', borderRadius: '8px',
                      border: '2px solid var(--border)', background: 'white',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: (sinStock || cantActual === 0) ? 'not-allowed' : 'pointer',
                      opacity: (sinStock || cantActual === 0) ? 0.4 : 1,
                      color: 'var(--text-dark)',
                    }}
                  >
                    <Minus size={16} />
                  </button>
                  <span style={{
                    fontSize: '18px', fontWeight: 700, color: 'var(--text-dark)',
                    minWidth: '24px', textAlign: 'center',
                  }}>
                    {cantActual}
                  </span>
                  <button
                    onClick={() => !sinStock && onCambiarCantidad(talle, 1)}
                    disabled={sinStock || cantActual >= stockDisp}
                    style={{
                      width: '34px', height: '34px', borderRadius: '8px',
                      border: '2px solid var(--border)', background: 'white',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: (sinStock || cantActual >= stockDisp) ? 'not-allowed' : 'pointer',
                      opacity: (sinStock || cantActual >= stockDisp) ? 0.4 : 1,
                      color: 'var(--text-dark)',
                    }}
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Botón agregar al carrito */}
        <button
          onClick={haySeleccion ? onAgregar : undefined}
          disabled={!haySeleccion}
          className={haySeleccion ? 'btn btn-primary btn-full btn-lg' : 'btn btn-outline btn-full btn-lg'}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '15px' }}
        >
          <ShoppingCart size={18} />
          {haySeleccion
            ? `Agregar al carrito — ${formatPrecio(totalPrecio)} (${totalSeleccionado} u.)`
            : 'Seleccioná al menos un talle'
          }
        </button>
      </div>
    </div>
  )
}
