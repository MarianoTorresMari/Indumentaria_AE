import { useState, useEffect, useMemo } from 'react'
import {
  ClipboardList, TrendingUp, Package, DollarSign,
  RefreshCw, Inbox, Trophy, ShoppingCart, Tag,
} from 'lucide-react'
import { obtenerVentas, formatPrecio } from '../services/productos'
import { alertError } from '../utils/alerts'

/*
  PÁGINA: HISTORIAL DE VENTAS
  ----------------------------
  Muestra todas las ventas registradas con:
  - Filtro por período (Hoy / Semana / Mes / Todo)
  - Estadísticas clave del período
  - Top producto más vendido
  - Lista de ventas detallada
*/

const FILTROS = [
  { id: 'hoy', label: 'Hoy' },
  { id: 'semana', label: 'Esta semana' },
  { id: 'mes', label: 'Este mes' },
  { id: 'todo', label: 'Todo' },
]

export default function HistorialPage() {
  const [ventas, setVentas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [filtro, setFiltro] = useState('hoy')

  useEffect(() => {
    cargar()
  }, [])

  async function cargar() {
    setCargando(true)
    try {
      const data = await obtenerVentas()
      setVentas(data)
    } catch {
      alertError('No se pudo cargar el historial de ventas')
    } finally {
      setCargando(false)
    }
  }

  const ventasFiltradas = useMemo(() => {
    const ahora = new Date()
    return ventas.filter(v => {
      const fecha = new Date(v.fecha)
      if (filtro === 'hoy') {
        return fecha.toDateString() === ahora.toDateString()
      }
      if (filtro === 'semana') {
        const hace7 = new Date(ahora)
        hace7.setDate(ahora.getDate() - 7)
        return fecha >= hace7
      }
      if (filtro === 'mes') {
        return (
          fecha.getMonth() === ahora.getMonth() &&
          fecha.getFullYear() === ahora.getFullYear()
        )
      }
      return true
    })
  }, [ventas, filtro])

  const stats = useMemo(() => {
    const ingresos = ventasFiltradas.reduce((s, v) => s + v.totalVenta, 0)
    const unidades = ventasFiltradas.reduce((s, v) => s + v.cantidad, 0)

    // Producto más vendido del período
    const porProducto = {}
    ventasFiltradas.forEach(v => {
      porProducto[v.productoNombre] = (porProducto[v.productoNombre] || 0) + v.cantidad
    })
    const topNombre = Object.keys(porProducto).sort((a, b) => porProducto[b] - porProducto[a])[0]
    const top = topNombre
      ? { nombre: topNombre, cantidad: porProducto[topNombre] }
      : null

    // Categoría más vendida
    const porCategoria = {}
    ventasFiltradas.forEach(v => {
      porCategoria[v.productoCategoria] = (porCategoria[v.productoCategoria] || 0) + v.cantidad
    })
    const topCategoriaNombre = Object.keys(porCategoria).sort((a, b) => porCategoria[b] - porCategoria[a])[0]

    return {
      totalVentas: ventasFiltradas.length,
      ingresos,
      unidades,
      ticketPromedio: ventasFiltradas.length > 0 ? ingresos / ventasFiltradas.length : 0,
      top,
      topCategoria: topCategoriaNombre || null,
    }
  }, [ventasFiltradas])

  if (cargando) {
    return (
      <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
        <TituloSeccion onRefrescar={cargar} cargando />
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
          <div style={{
            width: '40px', height: '40px',
            border: '3px solid var(--border)', borderTopColor: 'var(--primary)',
            borderRadius: '50%', animation: 'spin 0.8s linear infinite',
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <TituloSeccion onRefrescar={cargar} cargando={false} />

      {/* Filtro de período */}
      <div style={{
        display: 'flex', gap: '8px', overflowX: 'auto',
        paddingBottom: '4px', marginBottom: '20px',
      }}>
        {FILTROS.map(f => (
          <button
            key={f.id}
            onClick={() => setFiltro(f.id)}
            style={{
              padding: '8px 18px', borderRadius: '20px', border: '2px solid',
              borderColor: filtro === f.id ? 'var(--primary)' : 'var(--border)',
              background: filtro === f.id ? 'var(--primary-light)' : 'white',
              color: filtro === f.id ? 'var(--primary)' : 'var(--text)',
              fontFamily: 'inherit', fontSize: '14px', fontWeight: 600,
              cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.15s',
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Stats */}
      {ventasFiltradas.length > 0 && <StatsGrid stats={stats} />}

      {/* Top producto */}
      {stats.top && <TopProducto top={stats.top} topCategoria={stats.topCategoria} />}

      {/* Lista */}
      <ListaVentas ventas={ventasFiltradas} />
    </div>
  )
}

/* ===== TÍTULO + REFRESH ===== */
function TituloSeccion({ onRefrescar, cargando }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between',
      alignItems: 'center', marginBottom: '16px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <ClipboardList size={22} color="var(--primary)" />
        <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-dark)', margin: 0 }}>
          Historial de Ventas
        </h2>
      </div>
      <button
        onClick={onRefrescar}
        style={{
          background: 'var(--primary-soft)', border: 'none', borderRadius: '10px',
          padding: '8px 12px', cursor: 'pointer', color: 'var(--primary)',
          display: 'flex', alignItems: 'center', gap: '6px',
          fontSize: '13px', fontWeight: 600, fontFamily: 'inherit',
        }}
      >
        <RefreshCw size={15} style={cargando ? { animation: 'spin 0.8s linear infinite' } : {}} />
        Actualizar
      </button>
    </div>
  )
}

/* ===== GRID DE ESTADÍSTICAS ===== */
function StatsGrid({ stats }) {
  const items = [
    {
      icon: <ShoppingCart size={20} />,
      valor: stats.totalVentas,
      label: 'Ventas',
      color: 'var(--primary)',
      bg: 'var(--primary-light)',
    },
    {
      icon: <TrendingUp size={20} />,
      valor: formatPrecio(stats.ingresos),
      label: 'Ingresos',
      color: 'var(--success)',
      bg: 'var(--success-light)',
    },
    {
      icon: <Package size={20} />,
      valor: stats.unidades,
      label: 'Unidades',
      color: '#7c3aed',
      bg: '#ede9fe',
    },
    {
      icon: <DollarSign size={20} />,
      valor: formatPrecio(stats.ticketPromedio),
      label: 'Ticket prom.',
      color: 'var(--warning)',
      bg: 'var(--warning-light)',
    },
  ]

  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '1fr 1fr',
      gap: '10px', marginBottom: '16px',
    }}>
      {items.map(({ icon, valor, label, color, bg }) => (
        <div key={label} style={{
          background: 'white', border: '1px solid var(--border)',
          borderRadius: '14px', padding: '14px 16px',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: bg, color, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            marginBottom: '10px',
          }}>
            {icon}
          </div>
          <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-dark)', lineHeight: 1.2 }}>
            {valor}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-light)', marginTop: '3px', fontWeight: 500 }}>
            {label}
          </div>
        </div>
      ))}
    </div>
  )
}

/* ===== TOP PRODUCTO ===== */
function TopProducto({ top, topCategoria }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '12px',
      background: 'linear-gradient(135deg, #fef9c3 0%, #fef08a 100%)',
      border: '1px solid #fde047',
      borderRadius: '14px', padding: '14px 16px',
      marginBottom: '20px',
    }}>
      <div style={{
        width: '40px', height: '40px', borderRadius: '10px',
        background: '#fbbf24', display: 'flex', alignItems: 'center',
        justifyContent: 'center', flexShrink: 0,
      }}>
        <Trophy size={20} color="white" />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '12px', fontWeight: 600, color: '#92400e', marginBottom: '2px' }}>
          Más vendido del período
        </div>
        <div style={{
          fontSize: '15px', fontWeight: 700, color: '#78350f',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {top.nombre}
        </div>
        <div style={{ fontSize: '13px', color: '#92400e', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
          <Package size={13} />
          {top.cantidad} unidades vendidas
          {topCategoria && (
            <>
              <span style={{ opacity: 0.5 }}>·</span>
              <Tag size={13} />
              {topCategoria}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

/* ===== LISTA DE VENTAS ===== */
function ListaVentas({ ventas }) {
  if (ventas.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text-light)' }}>
        <Inbox size={48} style={{ margin: '0 auto 16px', display: 'block', opacity: 0.35 }} />
        <p style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text)', marginBottom: '6px' }}>
          Sin ventas en este período
        </p>
        <p style={{ fontSize: '14px' }}>
          Las ventas registradas aparecerán acá
        </p>
      </div>
    )
  }

  // Agrupar por día para separadores
  const grupos = {}
  ventas.forEach(v => {
    const dia = new Date(v.fecha).toDateString()
    if (!grupos[dia]) grupos[dia] = []
    grupos[dia].push(v)
  })

  return (
    <div>
      <p style={{ fontSize: '13px', color: 'var(--text-light)', marginBottom: '12px', fontWeight: 500 }}>
        {ventas.length} {ventas.length === 1 ? 'venta' : 'ventas'} registradas
      </p>
      {Object.entries(grupos).map(([dia, grupo]) => (
        <div key={dia}>
          <SeparadorFecha fecha={grupo[0].fecha} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
            {grupo.map(v => <TarjetaVenta key={v.id} venta={v} />)}
          </div>
        </div>
      ))}
    </div>
  )
}

/* ===== SEPARADOR DE FECHA ===== */
function SeparadorFecha({ fecha }) {
  const ahora = new Date()
  const d = new Date(fecha)
  const ayer = new Date(ahora)
  ayer.setDate(ahora.getDate() - 1)

  let label
  if (d.toDateString() === ahora.toDateString()) {
    label = 'Hoy'
  } else if (d.toDateString() === ayer.toDateString()) {
    label = 'Ayer'
  } else {
    label = d.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })
    label = label.charAt(0).toUpperCase() + label.slice(1)
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '10px',
      marginBottom: '10px',
    }}>
      <span style={{
        fontSize: '13px', fontWeight: 700, color: 'var(--text-light)',
        whiteSpace: 'nowrap',
      }}>
        {label}
      </span>
      <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
    </div>
  )
}

/* ===== TARJETA DE VENTA ===== */
function TarjetaVenta({ venta }) {
  const hora = new Date(venta.fecha).toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div style={{
      display: 'flex', gap: '12px', alignItems: 'center',
      background: 'white', border: '1px solid var(--border)',
      borderRadius: '14px', padding: '12px 14px',
      boxShadow: 'var(--shadow-sm)',
    }}>
      {/* Ícono del producto */}
      <div style={{
        width: '52px', height: '52px', borderRadius: '10px',
        background: 'var(--primary-light)', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <ShoppingCart size={22} color="var(--primary)" />
      </div>

      {/* Info principal */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: '15px', fontWeight: 600, color: 'var(--text-dark)',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          marginBottom: '3px',
        }}>
          {venta.productoNombre}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <span style={{
            fontSize: '12px', fontWeight: 600,
            background: 'var(--primary-light)', color: 'var(--primary)',
            padding: '2px 8px', borderRadius: '6px',
          }}>
            Talle {venta.talle}
          </span>
          <span style={{ fontSize: '12px', color: 'var(--text-light)' }}>
            {venta.cantidad} {venta.cantidad === 1 ? 'unidad' : 'unidades'}
          </span>
          <span style={{ fontSize: '11px', color: 'var(--text-light)', opacity: 0.7 }}>
            · {venta.productoCategoria}
          </span>
        </div>
      </div>

      {/* Total + hora */}
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--success)' }}>
          {formatPrecio(venta.totalVenta)}
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text-light)', marginTop: '3px' }}>
          {hora}
        </div>
      </div>
    </div>
  )
}
