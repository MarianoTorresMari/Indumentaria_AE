import { useState, useRef } from 'react'
import { calcularStockTotal as stockTotal, formatPrecio } from '../services/productos'

/*
  PÁGINA: VENDER
  ---------------
  Flujo ultra rápido de venta:
  1. Buscar producto (por nombre o código)
  2. Seleccionar talle
  3. Confirmar venta → se resta del stock
  
  Diseñado para ser lo más rápido posible.
*/

export default function VenderPage({ productos, onVenta }) {
  const [busqueda, setBusqueda] = useState('')
  const [productoSeleccionado, setProductoSeleccionado] = useState(null)
  const [talleSeleccionado, setTalleSeleccionado] = useState(null)
  const [cantidad, setCantidad] = useState(1)
  const [ventaExitosa, setVentaExitosa] = useState(false)
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false)
  const inputRef = useRef(null)

  // Usar productos del prop
  const listaProductos = productos || []

  const sugerencias = busqueda.length >= 1
    ? listaProductos.filter(p =>
        p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.codigo.includes(busqueda)
      )
    : []

  function seleccionarProducto(producto) {
    setProductoSeleccionado(producto)
    setBusqueda('')
    setMostrarSugerencias(false)
    setTalleSeleccionado(null)
    setCantidad(1)
  }

  function confirmarVenta() {
    if (!productoSeleccionado || !talleSeleccionado) return

    const stockDisponible = productoSeleccionado.talles[talleSeleccionado]
    if (cantidad > stockDisponible) {
      alert(`Solo hay ${stockDisponible} unidades en talle ${talleSeleccionado}`)
      return
    }

    // Llamar a la función de venta (después conectará con el backend)
    if (onVenta) {
      onVenta(productoSeleccionado.id, talleSeleccionado, cantidad)
    }

    // Mostrar mensaje de éxito
    setVentaExitosa(true)
    setTimeout(() => {
      setVentaExitosa(false)
      setProductoSeleccionado(null)
      setTalleSeleccionado(null)
      setCantidad(1)
      setBusqueda('')
      inputRef.current?.focus()
    }, 2000)
  }

  function nuevaVenta() {
    setProductoSeleccionado(null)
    setTalleSeleccionado(null)
    setCantidad(1)
    setBusqueda('')
    setVentaExitosa(false)
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  // ===== MENSAJE DE VENTA EXITOSA =====
  if (ventaExitosa) {
    return (
      <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
        <div className="animate-slide-up" style={{
          textAlign: 'center',
          padding: '48px 20px',
          background: 'var(--success-light)',
          borderRadius: '20px',
          border: '2px solid var(--success)',
        }}>
          <span style={{ fontSize: '64px', display: 'block', marginBottom: '16px' }}>✅</span>
          <h2 style={{
            fontSize: '24px',
            fontWeight: 700,
            color: 'var(--success)',
            marginBottom: '8px',
          }}>
            ¡Venta registrada!
          </h2>
          <p style={{ color: 'var(--text)', fontSize: '16px' }}>
            {cantidad}x {productoSeleccionado?.nombre} · Talle {talleSeleccionado}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      {/* Título */}
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{
          fontSize: '22px',
          fontWeight: 700,
          color: 'var(--text-dark)',
          marginBottom: '4px',
        }}>
          🛒 Registrar Venta
        </h2>
        <p style={{ color: 'var(--text-light)', fontSize: '14px' }}>
          Buscá el producto → elegí talle → confirmá
        </p>
      </div>

      {/* ===== PASO 1: Buscar producto ===== */}
      {!productoSeleccionado && (
        <div style={{ position: 'relative' }}>
          <label className="label">Paso 1: Buscar producto</label>
          <input
            ref={inputRef}
            type="text"
            className="input"
            placeholder="Nombre o código de barras..."
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value)
              setMostrarSugerencias(true)
            }}
            onFocus={() => setMostrarSugerencias(true)}
            style={{ fontSize: '17px' }}
            autoFocus
          />

          {/* Sugerencias */}
          {mostrarSugerencias && sugerencias.length > 0 && (
            <div className="animate-fade-in" style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              background: 'white',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              boxShadow: 'var(--shadow-lg)',
              zIndex: 100,
              maxHeight: '300px',
              overflow: 'auto',
              marginTop: '4px',
            }}>
              {sugerencias.map(producto => (
                <button
                  key={producto.id}
                  onClick={() => seleccionarProducto(producto)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    width: '100%',
                    padding: '14px 16px',
                    border: 'none',
                    borderBottom: '1px solid var(--border)',
                    background: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontFamily: 'inherit',
                  }}
                >
                  <img
                    src={producto.imagen}
                    alt=""
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '8px',
                      objectFit: 'cover',
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-dark)' }}>
                      {producto.nombre}
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text-light)' }}>
                      {formatPrecio(producto.precio)} · Stock: {stockTotal(producto)}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Overlay para cerrar */}
          {mostrarSugerencias && (
            <div
              style={{ position: 'fixed', inset: 0, zIndex: 50 }}
              onClick={() => setMostrarSugerencias(false)}
            />
          )}

          {/* Mensaje si no hay búsqueda */}
          {!busqueda && (
            <div style={{
              textAlign: 'center',
              padding: '40px 20px',
              color: 'var(--text-light)',
            }}>
              <span style={{ fontSize: '40px', display: 'block', marginBottom: '12px' }}>📱</span>
              <p>Escribí el nombre del producto o usá el lector de código de barras</p>
            </div>
          )}
        </div>
      )}

      {/* ===== PASO 2 y 3: Producto seleccionado → Elegir talle → Confirmar ===== */}
      {productoSeleccionado && (
        <div className="animate-slide-up">
          {/* Info del producto seleccionado */}
          <div className="card" style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <span style={{
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--primary)',
                background: 'var(--primary-light)',
                padding: '4px 10px',
                borderRadius: '6px',
              }}>
                Producto seleccionado
              </span>
              <button
                onClick={nuevaVenta}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-light)',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  fontWeight: 600,
                }}
              >
                Cambiar ✕
              </button>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <img
                src={productoSeleccionado.imagen}
                alt=""
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '10px',
                  objectFit: 'cover',
                }}
              />
              <div>
                <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-dark)' }}>
                  {productoSeleccionado.nombre}
                </div>
                <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--primary)', marginTop: '4px' }}>
                  {formatPrecio(productoSeleccionado.precio)}
                </div>
              </div>
            </div>
          </div>

          {/* Paso 2: Elegir talle */}
          <div className="card" style={{ marginBottom: '16px' }}>
            <label className="label" style={{ marginBottom: '12px', display: 'block' }}>
              Paso 2: Elegí el talle
            </label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
              gap: '10px',
            }}>
              {Object.entries(productoSeleccionado.talles).map(([talle, stock]) => {
                const isSelected = talleSeleccionado === talle
                const sinStock = stock === 0
                return (
                  <button
                    key={talle}
                    onClick={() => !sinStock && setTalleSeleccionado(talle)}
                    disabled={sinStock}
                    style={{
                      padding: '14px 8px',
                      border: `2px solid ${isSelected ? 'var(--primary)' : sinStock ? 'var(--danger-light)' : 'var(--border)'}`,
                      borderRadius: '12px',
                      background: isSelected ? 'var(--primary-light)' : sinStock ? 'var(--danger-light)' : 'white',
                      cursor: sinStock ? 'not-allowed' : 'pointer',
                      opacity: sinStock ? 0.5 : 1,
                      fontFamily: 'inherit',
                      textAlign: 'center',
                      transition: 'all 0.15s',
                    }}
                  >
                    <div style={{
                      fontSize: '18px',
                      fontWeight: 700,
                      color: isSelected ? 'var(--primary)' : 'var(--text-dark)',
                    }}>
                      {talle}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: sinStock ? 'var(--danger)' : 'var(--text-light)',
                      marginTop: '2px',
                    }}>
                      {sinStock ? 'Sin stock' : `${stock} disp.`}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Paso 3: Cantidad y Confirmar */}
          {talleSeleccionado && (
            <div className="card animate-fade-in">
              <label className="label" style={{ marginBottom: '12px', display: 'block' }}>
                Paso 3: Cantidad y confirmación
              </label>

              {/* Selector de cantidad */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                marginBottom: '20px',
                justifyContent: 'center',
              }}>
                <button
                  onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                  className="btn btn-outline"
                  style={{ width: '52px', height: '52px', padding: 0, minHeight: 'auto', fontSize: '22px' }}
                >
                  −
                </button>
                <span style={{
                  fontSize: '32px',
                  fontWeight: 700,
                  color: 'var(--text-dark)',
                  minWidth: '60px',
                  textAlign: 'center',
                }}>
                  {cantidad}
                </span>
                <button
                  onClick={() => {
                    const max = productoSeleccionado.talles[talleSeleccionado]
                    setCantidad(Math.min(max, cantidad + 1))
                  }}
                  className="btn btn-outline"
                  style={{ width: '52px', height: '52px', padding: 0, minHeight: 'auto', fontSize: '22px' }}
                >
                  +
                </button>
              </div>

              {/* Resumen */}
              <div style={{
                background: 'var(--bg)',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '16px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--text-light)' }}>Producto</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-dark)' }}>{productoSeleccionado.nombre}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--text-light)' }}>Talle</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-dark)' }}>{talleSeleccionado}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--text-light)' }}>Cantidad</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-dark)' }}>{cantidad}</span>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  borderTop: '2px solid var(--border)',
                  paddingTop: '8px',
                  marginTop: '4px',
                }}>
                  <span style={{ fontWeight: 700, color: 'var(--text-dark)', fontSize: '17px' }}>Total</span>
                  <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '20px' }}>
                    {formatPrecio(productoSeleccionado.precio * cantidad)}
                  </span>
                </div>
              </div>

              {/* Botón confirmar */}
              <button
                onClick={confirmarVenta}
                className="btn btn-success btn-full btn-lg"
                style={{ fontSize: '18px' }}
              >
                ✅ Confirmar Venta
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}