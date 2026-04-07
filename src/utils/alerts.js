import Swal from 'sweetalert2'

const base = {
  confirmButtonColor: '#2563eb',
  cancelButtonColor: '#64748b',
  confirmButtonText: 'Sí, confirmar',
  cancelButtonText: 'Cancelar',
  customClass: { popup: 'swal-dmsans' },
}

const exito = {
  ...base,
  icon: 'success',
  timer: 2000,
  showConfirmButton: false,
}

// ===== ÉXITO =====

export function alertProductoCreado(nombre) {
  return Swal.fire({
    ...exito,
    title: '¡Producto creado!',
    text: nombre,
  })
}

export function alertProductoEditado(nombre) {
  return Swal.fire({
    ...exito,
    title: '¡Producto actualizado!',
    text: nombre,
  })
}

export function alertProductoEliminado(nombre) {
  return Swal.fire({
    ...exito,
    title: 'Producto eliminado',
    text: nombre,
    icon: 'info',
  })
}

export function alertVentaExitosa(items) {
  const arr = Array.isArray(items) ? items : [items]
  const totalUnidades = arr.reduce((s, i) => s + i.cantidad, 0)

  let html
  if (arr.length === 1) {
    const item = arr[0]
    const stockRestante = (item.producto.talles[item.talle] ?? 0) - item.cantidad
    html = `<b>${item.cantidad}x ${item.producto.nombre}</b> — Talle ${item.talle}<br><small style="color:#64748b">Stock restante: ${stockRestante} u.</small>`
  } else {
    const lineas = arr.map(i => `${i.cantidad}x ${i.producto.nombre} (T. ${i.talle})`).join('<br>')
    html = `${lineas}<br><br><b style="color:#16a34a">${totalUnidades} unidades vendidas</b>`
  }

  return Swal.fire({ ...exito, title: '¡Venta registrada!', html })
}

export function alertDatosEjemploCargados(cantidad) {
  return Swal.fire({
    ...exito,
    title: '¡Datos de ejemplo cargados!',
    text: `Se cargaron ${cantidad} productos`,
  })
}

// ===== ERRORES =====

export function alertError(mensaje) {
  return Swal.fire({
    ...base,
    icon: 'error',
    title: 'Error',
    text: mensaje,
    showConfirmButton: true,
    confirmButtonText: 'Cerrar',
  })
}

export function alertStockInsuficiente(disponible) {
  return Swal.fire({
    ...base,
    icon: 'warning',
    title: 'Stock insuficiente',
    text: `Solo hay ${disponible} unidades disponibles`,
    showConfirmButton: true,
    confirmButtonText: 'Entendido',
  })
}

// ===== CONFIRMACIONES =====

export async function confirmarEliminacion(nombre) {
  const result = await Swal.fire({
    ...base,
    icon: 'warning',
    title: '¿Eliminar producto?',
    text: `"${nombre}" será eliminado permanentemente`,
    showCancelButton: true,
  })
  return result.isConfirmed
}

export async function confirmarVenta(items) {
  const arr = Array.isArray(items) ? items : [items]
  const totalUnidades = arr.reduce((s, i) => s + i.cantidad, 0)

  let html
  if (arr.length === 1) {
    html = `<b>${arr[0].cantidad}x ${arr[0].producto.nombre}</b><br>Talle: ${arr[0].talle}`
  } else {
    const lineas = arr.map(i => `${i.cantidad}x ${i.producto.nombre} (T. ${i.talle})`).join('<br>')
    html = `${lineas}<br><br><b>${totalUnidades} unidades en total</b>`
  }

  const result = await Swal.fire({
    ...base,
    icon: 'question',
    title: '¿Confirmar venta?',
    html,
    showCancelButton: true,
  })
  return result.isConfirmed
}

export async function confirmarCargarEjemplos() {
  const result = await Swal.fire({
    ...base,
    icon: 'question',
    title: '¿Cargar datos de ejemplo?',
    text: 'Se agregarán productos de prueba a la base de datos',
    showCancelButton: true,
  })
  return result.isConfirmed
}
