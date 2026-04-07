/*
  SERVICIOS DE PRODUCTOS - Firebase Firestore
  ---------------------------------------------
  Este archivo contiene TODAS las funciones que hablan con la 
  base de datos. Es como el "backend" pero sin necesidad de servidor.

  ¿Qué es Firestore?
  Es la base de datos de Firebase. Guarda datos en "colecciones" 
  (como carpetas) que contienen "documentos" (como archivos).

  ESTRUCTURA EN FIRESTORE:
  └── productos (colección)
      ├── abc123 (documento)
      │   ├── nombre: "Remera Nike"
      │   ├── codigo: "789123456"
      │   ├── precio: 25000
      │   ├── talles: { S: 5, M: 8, L: 12 }
      │   └── ...
      ├── def456 (documento)
      │   └── ...
      └── ...

  FUNCIONES DISPONIBLES:
  - obtenerProductos()      → trae todos los productos
  - buscarProductos(texto)  → busca por nombre o código
  - agregarProducto(datos)  → crea un producto nuevo
  - editarProducto(id, datos) → modifica un producto
  - eliminarProducto(id)    → borra un producto
  - registrarVenta(id, talle, cantidad) → descuenta stock
  - cargarDatosEjemplo()    → llena la BD con productos de prueba
*/

import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  limit,
} from 'firebase/firestore'
import { db } from '../firebase'

const productosRef = collection(db, 'productos')
const ventasRef = collection(db, 'ventas')

// ============================================
// OBTENER TODOS LOS PRODUCTOS
// ============================================
export async function obtenerProductos() {
  try {
    const snapshot = await getDocs(productosRef)

    const productos = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }))

    // Ordenar por nombre en el cliente (evita depender de índices de Firestore)
    productos.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))

    return productos
  } catch (error) {
    console.error('Error al obtener productos:', error)
    throw error
  }
}

// ============================================
// BUSCAR PRODUCTOS (por nombre o código)
// ============================================
/*
  NOTA IMPORTANTE:
  Firestore no tiene búsqueda "parcial" como MongoDB.
  Por eso traemos todos los productos y filtramos en el frontend.
  Para una app pequeña (<1000 productos) esto funciona perfecto.
  Si crece mucho, se puede agregar Algolia o similar.
*/
export async function buscarProductos(texto) {
  try {
    if (!texto || texto.length < 1) return []

    // Traer todos los productos
    const productos = await obtenerProductos()
    const textoLower = texto.toLowerCase()

    // Filtrar en el frontend
    return productos.filter(p =>
      p.nombre.toLowerCase().includes(textoLower) ||
      p.codigo.includes(texto)
    )
  } catch (error) {
    console.error('Error en búsqueda:', error)
    throw error
  }
}

// ============================================
// BUSCAR POR CÓDIGO DE BARRAS (exacto)
// ============================================
export async function buscarPorCodigo(codigo) {
  try {
    const q = query(productosRef, where('codigo', '==', codigo), limit(1))
    const snapshot = await getDocs(q)

    if (snapshot.empty) return null

    const doc = snapshot.docs[0]
    return { id: doc.id, ...doc.data() }
  } catch (error) {
    console.error('Error al buscar por código:', error)
    throw error
  }
}

// ============================================
// AGREGAR PRODUCTO NUEVO
// ============================================
export async function agregarProducto(datos) {
  try {
    // Verificar que no exista otro con el mismo código
    const existente = await buscarPorCodigo(datos.codigo)
    if (existente) {
      throw new Error(`Ya existe un producto con el código ${datos.codigo}`)
    }

    // Preparar el documento
    const producto = {
      nombre: datos.nombre.trim(),
      codigo: datos.codigo.trim(),
      categoria: datos.categoria?.trim() || 'General',
      precio: Number(datos.precio),
      talles: datos.talles || {},
      creadoEn: new Date().toISOString(),
    }

    // Guardar en Firestore
    const docRef = await addDoc(productosRef, producto)

    return {
      id: docRef.id,
      ...producto,
    }
  } catch (error) {
    console.error('Error al agregar producto:', error)
    throw error
  }
}

// ============================================
// EDITAR PRODUCTO
// ============================================
export async function editarProducto(id, datos) {
  try {
    const docRef = doc(db, 'productos', id)

    // Si cambió el código, verificar que no exista en otro producto
    if (datos.codigo) {
      const existente = await buscarPorCodigo(datos.codigo)
      if (existente && existente.id !== id) {
        throw new Error(`Ya existe otro producto con el código ${datos.codigo}`)
      }
    }

    // Preparar datos para actualizar (solo los que se enviaron)
    const datosActualizar = {}
    if (datos.nombre !== undefined) datosActualizar.nombre = datos.nombre.trim()
    if (datos.codigo !== undefined) datosActualizar.codigo = datos.codigo.trim()
    if (datos.categoria !== undefined) datosActualizar.categoria = datos.categoria.trim()
    if (datos.precio !== undefined) datosActualizar.precio = Number(datos.precio)
    if (datos.talles !== undefined) datosActualizar.talles = datos.talles
    datosActualizar.actualizadoEn = new Date().toISOString()

    await updateDoc(docRef, datosActualizar)

    return { id, ...datosActualizar }
  } catch (error) {
    console.error('Error al editar producto:', error)
    throw error
  }
}

// ============================================
// ELIMINAR PRODUCTO
// ============================================
export async function eliminarProducto(id) {
  try {
    const docRef = doc(db, 'productos', id)
    await deleteDoc(docRef)
    return true
  } catch (error) {
    console.error('Error al eliminar producto:', error)
    throw error
  }
}

// ============================================
// REGISTRAR VENTA (restar stock)
// ============================================
export async function registrarVenta(id, talle, cantidad) {
  try {
    const docRef = doc(db, 'productos', id)
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) {
      throw new Error('Producto no encontrado')
    }

    const producto = docSnap.data()
    const stockActual = producto.talles[talle]

    // Validaciones
    if (stockActual === undefined) {
      throw new Error(`El talle "${talle}" no existe para este producto`)
    }
    if (stockActual < cantidad) {
      throw new Error(`Stock insuficiente. Solo hay ${stockActual} unidades en talle ${talle}`)
    }

    // Restar del stock
    const nuevasTalles = { ...producto.talles }
    nuevasTalles[talle] = stockActual - cantidad

    await updateDoc(docRef, {
      talles: nuevasTalles,
      actualizadoEn: new Date().toISOString(),
    })

    const stockRestante = nuevasTalles[talle]

    // Guardar la venta en el historial
    await addDoc(ventasRef, {
      productoId: id,
      productoNombre: producto.nombre,
      productoCodigo: producto.codigo,
      productoCategoria: producto.categoria || 'General',
      talle,
      cantidad,
      precioUnitario: producto.precio,
      totalVenta: producto.precio * cantidad,
      stockRestante,
      fecha: new Date().toISOString(),
    })

    return {
      mensaje: `Venta: ${cantidad}x ${producto.nombre} (Talle ${talle})`,
      stockRestante,
    }
  } catch (error) {
    console.error('Error al registrar venta:', error)
    throw error
  }
}

// ============================================
// OBTENER HISTORIAL DE VENTAS
// ============================================
export async function obtenerVentas() {
  try {
    const snapshot = await getDocs(ventasRef)
    const ventas = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
    ventas.sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
    return ventas
  } catch (error) {
    console.error('Error al obtener ventas:', error)
    throw error
  }
}

// ============================================
// CARGAR DATOS DE EJEMPLO
// ============================================
/*
  Ejecutá esto UNA VEZ para llenar tu base de datos.
  Se llama desde el panel de Admin con un botón.
*/
export async function cargarDatosEjemplo() {
  const ejemplos = [
    {
      nombre: 'Remera Deportiva Nike Dry-Fit',
      codigo: '7891234560001',
      categoria: 'Remeras',
      precio: 25000,
      talles: { S: 5, M: 8, L: 12, XL: 3, XXL: 0 },
    },
    {
      nombre: 'Pantalón Jogger Adidas',
      codigo: '7891234560002',
      categoria: 'Pantalones',
      precio: 45000,
      talles: { S: 2, M: 6, L: 4, XL: 7, XXL: 1 },
    },
    {
      nombre: 'Campera Rompevientos Puma',
      codigo: '7891234560003',
      categoria: 'Camperas',
      precio: 68000,
      talles: { S: 0, M: 3, L: 5, XL: 2, XXL: 0 },
    },
    {
      nombre: 'Short Running Under Armour',
      codigo: '7891234560004',
      categoria: 'Shorts',
      precio: 22000,
      talles: { S: 10, M: 15, L: 8, XL: 4, XXL: 2 },
    },
    {
      nombre: 'Musculosa Entrenamiento Reebok',
      codigo: '7891234560005',
      categoria: 'Remeras',
      precio: 18000,
      talles: { S: 7, M: 0, L: 3, XL: 0, XXL: 0 },
    },
    {
      nombre: 'Calza Larga Deportiva Topper',
      codigo: '7891234560006',
      categoria: 'Calzas',
      precio: 32000,
      talles: { S: 4, M: 6, L: 9, XL: 5, XXL: 3 },
    },
  ]

  let cargados = 0
  for (const prod of ejemplos) {
    try {
      // Verificar si ya existe
      const existente = await buscarPorCodigo(prod.codigo)
      if (!existente) {
        await addDoc(productosRef, {
          ...prod,
          creadoEn: new Date().toISOString(),
        })
        cargados++
      }
    } catch (e) {
      console.warn(`Producto ${prod.codigo} ya existe o hubo error, saltando...`)
    }
  }

  return cargados
}

// ============================================
// HELPER: Calcular stock total
// ============================================
export function calcularStockTotal(productoOTalles) {
  const talles = productoOTalles?.talles ?? productoOTalles
  if (!talles || typeof talles !== 'object') return 0
  return Object.values(talles).reduce((sum, cant) => sum + (Number(cant) || 0), 0)
}

// HELPER: Formatear precio argentino
export function formatPrecio(precio) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
  }).format(precio)
}