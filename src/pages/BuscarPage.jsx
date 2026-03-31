import { useState, useRef, useEffect } from 'react'
import { calcularStockTotal as stockTotal, formatPrecio } from '../services/productos'

/*
  PÁGINA: BUSCAR PRODUCTOS
  -------------------------
  Esta es la pantalla principal. Permite:
  1. Escribir el nombre del producto → autocompletado
  2. Escanear/escribir código de barras
  3. Ver detalle del producto seleccionado
  
  FLUJO: Escribir → Seleccionar → Ver stock por talle
*/

export default function BuscarPage({ productos }) {
  const [busqueda, setBusqueda] = useState('')
  const [productoSeleccionado, setProductoSeleccionado] = useState(null)
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false)
  const inputRef = useRef(null)

  const listaProductos = productos || []

  // Filtrar productos según lo que escribe el usuario
  const sugerencias = busqueda.length >= 1
    ? listaProductos.filter(p =>
        p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.codigo.includes(busqueda)
      )
    : []

  // Cuando selecciona un producto de la lista
  function seleccionarProducto(producto) {
    setProductoSeleccionado(producto)
    setBusqueda('')
    setMostrarSugerencias(false)
  }

  // Limpiar selección
  function limpiar() {
    setProductoSeleccionado(null)
    setBusqueda('')
    // Enfocar el input para buscar de nuevo
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>

      {/* ===== BARRA DE BÚSQUEDA ===== */}
      <div style={{ position: 'relative', marginBottom: '20px' }}>
        <label className="label">🔍 Buscar producto</label>
        <div style={{ position: 'relative' }}>
          <input
            ref={inputRef}
            type="text"
            className="input"
            placeholder="Nombre o código de barras..."
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value)
              setMostrarSugerencias(true)
              setProductoSeleccionado(null)
            }}
            onFocus={() => setMostrarSugerencias(true)}
            style={{
              paddingLeft: '16px',
              paddingRight: busqueda ? '48px' : '16px',
              fontSize: '17px',
            }}
          />
          {/* Botón para limpiar el texto */}
          {busqueda && (
            <button
              onClick={() => { setBusqueda(''); inputRef.current?.focus() }}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'var(--border)',
                border: 'none',
                borderRadius: '50%',
                width: '28px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '14px',
                color: 'var(--text-light)',
              }}
            >
              ✕
            </button>
          )}
        </div>

        {/* ===== LISTA DE SUGERENCIAS (Autocompletado) ===== */}
        {mostrarSugerencias && sugerencias.length > 0 && (
          <div
            className="animate-fade-in"
            style={{
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
            }}
          >
            {sugerencias.map(producto => (
              <button
                key={producto.id}
                onClick={() => seleccionarProducto(producto)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  width: '100%',
                  padding: '12px 16px',
                  border: 'none',
                  borderBottom: '1px solid var(--border)',
                  background: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontFamily: 'inherit',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.target.closest('button').style.background = 'var(--primary-soft)'}
                onMouseLeave={e => e.target.closest('button').style.background = 'none'}
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
                    {producto.codigo} · Stock: {stockTotal(producto)}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Mensaje si no hay resultados */}
        {mostrarSugerencias && busqueda.length >= 2 && sugerencias.length === 0 && (
          <div
            className="animate-fade-in"
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              background: 'white',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              boxShadow: 'var(--shadow-lg)',
              padding: '24px',
              textAlign: 'center',
              color: 'var(--text-light)',
              marginTop: '4px',
              zIndex: 100,
            }}
          >
            <span style={{ fontSize: '32px', display: 'block', marginBottom: '8px' }}>🤷</span>
            No se encontró ningún producto
          </div>
        )}
      </div>

      {/* Cerrar sugerencias al hacer click afuera */}
      {mostrarSugerencias && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 50 }}
          onClick={() => setMostrarSugerencias(false)}
        />
      )}

      {/* ===== DETALLE DEL PRODUCTO SELECCIONADO ===== */}
      {productoSeleccionado && (
        <ProductoDetalle
          producto={productoSeleccionado}
          onLimpiar={limpiar}
        />
      )}

      {/* ===== MENSAJE INICIAL (cuando no hay nada seleccionado) ===== */}
      {!productoSeleccionado && !busqueda && (
        <div className="animate-fade-in" style={{ textAlign: 'center', padding: '40px 20px' }}>
          <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>🔍</span>
          <h2 style={{
            fontSize: '20px',
            fontWeight: 600,
            color: 'var(--text-dark)',
            marginBottom: '8px',
          }}>
            Buscá un producto
          </h2>
          <p style={{ color: 'var(--text-light)', fontSize: '15px', lineHeight: 1.5 }}>
            Escribí el nombre o escaneá el código de barras para ver el stock disponible
          </p>
        </div>
      )}
    </div>
  )
}

/* ===== COMPONENTE: Detalle del Producto ===== */
function ProductoDetalle({ producto, onLimpiar }) {
  const total = stockTotal(producto)

  return (
    <div className="card animate-slide-up">
      {/* Botón volver */}
      <button
        onClick={onLimpiar}
        style={{
          background: 'var(--primary-soft)',
          border: 'none',
          borderRadius: '8px',
          padding: '6px 14px',
          fontSize: '14px',
          fontWeight: 600,
          color: 'var(--primary)',
          cursor: 'pointer',
          marginBottom: '16px',
          fontFamily: 'inherit',
        }}
      >
        ← Buscar otro
      </button>

      {/* Imagen + Info */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
        <img
          src={producto.imagen}
          alt={producto.nombre}
          style={{
            width: '100px',
            height: '100px',
            borderRadius: '12px',
            objectFit: 'cover',
            flexShrink: 0,
          }}
        />
        <div style={{ flex: 1 }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: 700,
            color: 'var(--text-dark)',
            marginBottom: '4px',
            lineHeight: 1.3,
          }}>
            {producto.nombre}
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-light)', marginBottom: '4px' }}>
            Código: {producto.codigo}
          </p>
          <p style={{ fontSize: '13px', color: 'var(--text-light)', marginBottom: '8px' }}>
            Categoría: {producto.categoria}
          </p>
          <span style={{
            fontSize: '20px',
            fontWeight: 700,
            color: 'var(--primary)',
          }}>
            {formatPrecio(producto.precio)}
          </span>
        </div>
      </div>

      {/* Stock Total */}
      <div style={{
        background: total > 0 ? 'var(--success-light)' : 'var(--danger-light)',
        borderRadius: '10px',
        padding: '12px 16px',
        marginBottom: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <span style={{ fontWeight: 600, fontSize: '15px' }}>Stock total:</span>
        <span style={{
          fontSize: '22px',
          fontWeight: 700,
          color: total > 0 ? 'var(--success)' : 'var(--danger)',
        }}>
          {total} unidades
        </span>
      </div>

      {/* Talles con Stock */}
      <h3 style={{
        fontSize: '15px',
        fontWeight: 600,
        color: 'var(--text)',
        marginBottom: '12px',
      }}>
        Stock por talle:
      </h3>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))',
        gap: '10px',
      }}>
        {Object.entries(producto.talles).map(([talle, cantidad]) => (
          <div
            key={talle}
            style={{
              border: `2px solid ${cantidad > 0 ? 'var(--border)' : 'var(--danger-light)'}`,
              borderRadius: '12px',
              padding: '12px 8px',
              textAlign: 'center',
              background: cantidad === 0 ? 'var(--danger-light)' : 'white',
              opacity: cantidad === 0 ? 0.6 : 1,
            }}
          >
            <div style={{
              fontSize: '16px',
              fontWeight: 700,
              color: 'var(--text-dark)',
              marginBottom: '4px',
            }}>
              {talle}
            </div>
            <div style={{
              fontSize: '20px',
              fontWeight: 700,
              color: cantidad > 0 ? 'var(--success)' : 'var(--danger)',
            }}>
              {cantidad}
            </div>
            <div style={{
              fontSize: '11px',
              color: 'var(--text-light)',
              marginTop: '2px',
            }}>
              {cantidad === 0 ? 'SIN STOCK' : 'disponible'}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}