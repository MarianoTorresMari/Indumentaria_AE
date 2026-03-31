import { useState } from 'react'
import { calcularStockTotal as stockTotal, formatPrecio } from '../services/productos'

/*
  PÁGINA: STOCK
  --------------
  Muestra TODOS los productos con su stock actual.
  Se puede filtrar por categoría.
  Colores claros para saber rápido qué tiene stock y qué no.
*/

export default function StockPage({ productos }) {
  const [filtroCategoria, setFiltroCategoria] = useState('Todas')
  const [busqueda, setBusqueda] = useState('')

  const listaProductos = productos || []

  // Obtener categorías únicas
  const categorias = ['Todas', ...new Set(listaProductos.map(p => p.categoria))]

  // Filtrar productos
  const productosFiltrados = listaProductos.filter(p => {
    const matchCategoria = filtroCategoria === 'Todas' || p.categoria === filtroCategoria
    const matchBusqueda = !busqueda ||
      p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.codigo.includes(busqueda)
    return matchCategoria && matchBusqueda
  })

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      {/* Título */}
      <div style={{ marginBottom: '16px' }}>
        <h2 style={{
          fontSize: '22px',
          fontWeight: 700,
          color: 'var(--text-dark)',
          marginBottom: '4px',
        }}>
          📦 Stock Actual
        </h2>
        <p style={{ color: 'var(--text-light)', fontSize: '14px' }}>
          {listaProductos.length} productos · {listaProductos.reduce((s, p) => s + stockTotal(p), 0)} unidades totales
        </p>
      </div>

      {/* Búsqueda rápida */}
      <input
        type="text"
        className="input"
        placeholder="Filtrar por nombre o código..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        style={{ marginBottom: '12px', fontSize: '15px' }}
      />

      {/* Filtro de categorías */}
      <div style={{
        display: 'flex',
        gap: '8px',
        overflowX: 'auto',
        paddingBottom: '4px',
        marginBottom: '16px',
      }}>
        {categorias.map(cat => (
          <button
            key={cat}
            onClick={() => setFiltroCategoria(cat)}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              border: '2px solid',
              borderColor: filtroCategoria === cat ? 'var(--primary)' : 'var(--border)',
              background: filtroCategoria === cat ? 'var(--primary-light)' : 'white',
              color: filtroCategoria === cat ? 'var(--primary)' : 'var(--text)',
              fontFamily: 'inherit',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s',
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Lista de productos */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {productosFiltrados.map(producto => {
          const total = stockTotal(producto)
          const stockBajo = total > 0 && total <= 5
          const sinStock = total === 0

          return (
            <div
              key={producto.id}
              className="card"
              style={{
                borderLeft: `4px solid ${sinStock ? 'var(--danger)' : stockBajo ? 'var(--warning)' : 'var(--success)'}`,
              }}
            >
              <div style={{ display: 'flex', gap: '12px' }}>
                <img
                  src={producto.imagen}
                  alt=""
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '10px',
                    objectFit: 'cover',
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: '8px',
                  }}>
                    <div style={{
                      fontSize: '15px',
                      fontWeight: 600,
                      color: 'var(--text-dark)',
                      lineHeight: 1.3,
                    }}>
                      {producto.nombre}
                    </div>
                    <span className={`badge ${sinStock ? 'badge-danger' : stockBajo ? 'badge-warning' : 'badge-success'}`}
                      style={{ flexShrink: 0 }}
                    >
                      {sinStock ? 'Sin stock' : stockBajo ? `¡Solo ${total}!` : `${total} u.`}
                    </span>
                  </div>

                  <div style={{
                    fontSize: '13px',
                    color: 'var(--text-light)',
                    marginTop: '4px',
                  }}>
                    {formatPrecio(producto.precio)} · {producto.categoria}
                  </div>

                  {/* Mini vista de talles */}
                  <div style={{
                    display: 'flex',
                    gap: '6px',
                    marginTop: '8px',
                    flexWrap: 'wrap',
                  }}>
                    {Object.entries(producto.talles).map(([talle, cant]) => (
                      <span
                        key={talle}
                        style={{
                          fontSize: '12px',
                          fontWeight: 600,
                          padding: '2px 8px',
                          borderRadius: '6px',
                          background: cant === 0 ? 'var(--danger-light)' : cant <= 3 ? 'var(--warning-light)' : '#f0fdf4',
                          color: cant === 0 ? 'var(--danger)' : cant <= 3 ? 'var(--warning)' : 'var(--success)',
                        }}
                      >
                        {talle}: {cant}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )
        })}

        {productosFiltrados.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: 'var(--text-light)',
          }}>
            <span style={{ fontSize: '32px', display: 'block', marginBottom: '8px' }}>📭</span>
            No hay productos que coincidan
          </div>
        )}
      </div>
    </div>
  )
}