'use client'

import Link from 'next/link'
import Navigation from '@/components/Navigation'

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-fresh-50 to-warm-50 font-sans">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-fresh-500 to-warm-500 rounded-2xl shadow-lg mb-6">
            <span className="text-2xl">🔒</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Política de Privacidad
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Tu privacidad es importante para nosotros. Aquí explicamos cómo recopilamos, usamos y protegemos tu información.
          </p>
          <div className="mt-4 text-sm text-gray-500">
            Última actualización: {new Date().toLocaleDateString('es-ES', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-8 space-y-12">

            {/* Introducción */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="mr-3">📋</span>
                Introducción
              </h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed">
                  En FoodSave, nos comprometemos a proteger tu privacidad y ser transparentes sobre cómo recopilamos, 
                  usamos y compartimos tu información personal. Esta Política de Privacidad describe nuestras prácticas 
                  de datos cuando utilizas nuestros servicios a través de nuestra aplicación web, aplicaciones móviles 
                  y servicios relacionados.
                </p>
                <p className="text-gray-700 leading-relaxed mt-4">
                  Al usar FoodSave, aceptas las prácticas descritas en esta política. Si no estás de acuerdo con 
                  alguna parte de esta política, por favor no uses nuestros servicios.
                </p>
              </div>
            </section>

            {/* Información que Recopilamos */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="mr-3">📊</span>
                Información que Recopilamos
              </h2>
              
              <div className="space-y-6">
                <div className="bg-fresh-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    🔹 Información que nos proporcionas directamente:
                  </h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• <strong>Datos de cuenta:</strong> Nombre, email, contraseña (encriptada)</li>
                    <li>• <strong>Información de perfil:</strong> Preferencias alimentarias, foto de perfil (opcional)</li>
                    <li>• <strong>Información de pago:</strong> Datos de tarjeta (procesados por Stripe, no almacenados por nosotros)</li>
                    <li>• <strong>Comunicaciones:</strong> Mensajes que nos envías, reseñas, comentarios</li>
                    <li>• <strong>Para restaurantes:</strong> Información del negocio, licencias, datos fiscales</li>
                  </ul>
                </div>

                <div className="bg-warm-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    🔹 Información que recopilamos automáticamente:
                  </h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• <strong>Datos de ubicación:</strong> Ubicación aproximada para mostrarte restaurantes cercanos</li>
                    <li>• <strong>Datos de uso:</strong> Páginas visitadas, tiempo en la app, clics, interacciones</li>
                    <li>• <strong>Información del dispositivo:</strong> Tipo de dispositivo, navegador, sistema operativo</li>
                    <li>• <strong>Cookies y tecnologías similares:</strong> Para mejorar tu experiencia</li>
                    <li>• <strong>Datos de transacciones:</strong> Historial de pedidos, fechas, montos</li>
                  </ul>
                </div>

                <div className="bg-blue-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    🔹 Información de terceros:
                  </h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• <strong>Redes sociales:</strong> Si eliges iniciar sesión con Google/Facebook</li>
                    <li>• <strong>Servicios de pago:</strong> Confirmaciones de pago de Stripe</li>
                    <li>• <strong>Servicios de mapas:</strong> Datos de ubicación de servicios de mapas</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Cómo Usamos tu Información */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="mr-3">🎯</span>
                Cómo Usamos tu Información
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    🔸 Servicios principales:
                  </h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Crear y gestionar tu cuenta</li>
                    <li>• Procesar reservas y pagos</li>
                    <li>• Conectarte con restaurantes</li>
                    <li>• Mostrar packs cercanos a ti</li>
                    <li>• Enviar confirmaciones y actualizaciones</li>
                  </ul>
                </div>

                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    🔸 Mejoras y comunicación:
                  </h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Personalizar tu experiencia</li>
                    <li>• Enviar notificaciones importantes</li>
                    <li>• Proporcionar soporte al cliente</li>
                    <li>• Mejorar nuestros servicios</li>
                    <li>• Prevenir fraude y abuso</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Compartir Información */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="mr-3">🤝</span>
                Cuándo Compartimos tu Información
              </h2>
              
              <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
                <div className="flex items-center mb-3">
                  <span className="text-2xl mr-3">🚫</span>
                  <h3 className="text-lg font-semibold text-red-900">
                    Nunca vendemos tu información personal
                  </h3>
                </div>
                <p className="text-red-800">
                  No vendemos, alquilamos ni comercializamos tu información personal con terceros para 
                  fines de marketing.
                </p>
              </div>

              <div className="space-y-4">
                <div className="border-l-4 border-fresh-500 pl-6">
                  <h3 className="font-semibold text-gray-900 mb-2">✅ Con restaurantes socios:</h3>
                  <p className="text-gray-700">Compartimos información necesaria para completar tu pedido (nombre, horario de recogida).</p>
                </div>

                <div className="border-l-4 border-warm-500 pl-6">
                  <h3 className="font-semibold text-gray-900 mb-2">✅ Proveedores de servicios:</h3>
                  <p className="text-gray-700">Stripe para pagos, servicios de email, hosting (todos con estrictos acuerdos de confidencialidad).</p>
                </div>

                <div className="border-l-4 border-blue-500 pl-6">
                  <h3 className="font-semibold text-gray-900 mb-2">✅ Cumplimiento legal:</h3>
                  <p className="text-gray-700">Solo cuando sea requerido por ley o para proteger nuestros derechos legítimos.</p>
                </div>
              </div>
            </section>

            {/* Cookies */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="mr-3">🍪</span>
                Cookies y Tecnologías Similares
              </h2>
              
              <div className="bg-yellow-50 rounded-xl p-6">
                <p className="text-gray-700 mb-4">
                  Utilizamos cookies y tecnologías similares para mejorar tu experiencia, recordar tus preferencias 
                  y analizar cómo usas nuestros servicios.
                </p>
                
                <div className="grid md:grid-cols-3 gap-4 mt-6">
                  <div className="bg-white rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">🔧 Esenciales</h4>
                    <p className="text-sm text-gray-600">Necesarias para el funcionamiento básico</p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">📈 Analíticas</h4>
                    <p className="text-sm text-gray-600">Nos ayudan a entender cómo usas la app</p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">⚙️ Funcionales</h4>
                    <p className="text-sm text-gray-600">Recuerdan tus preferencias</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Seguridad */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="mr-3">🛡️</span>
                Seguridad de tus Datos
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-green-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">🔐 Medidas técnicas:</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Encriptación SSL/TLS</li>
                    <li>• Contraseñas hasheadas</li>
                    <li>• Servidores seguros</li>
                    <li>• Acceso limitado a datos</li>
                    <li>• Monitoreo continuo</li>
                  </ul>
                </div>

                <div className="bg-blue-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">👥 Medidas organizativas:</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Capacitación del personal</li>
                    <li>• Políticas de seguridad estrictas</li>
                    <li>• Auditorías regulares</li>
                    <li>• Principio de menor privilegio</li>
                    <li>• Respuesta a incidentes</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Retención de Datos */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="mr-3">⏰</span>
                Retención de Datos
              </h2>
              
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <span className="text-fresh-600 mt-1">📝</span>
                    <div>
                      <h4 className="font-semibold text-gray-900">Datos de cuenta:</h4>
                      <p className="text-gray-700">Mantenidos mientras tu cuenta esté activa + 3 años después del cierre.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <span className="text-warm-600 mt-1">🛒</span>
                    <div>
                      <h4 className="font-semibold text-gray-900">Datos de transacciones:</h4>
                      <p className="text-gray-700">Conservados durante 7 años por requisitos fiscales y legales.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <span className="text-blue-600 mt-1">📊</span>
                    <div>
                      <h4 className="font-semibold text-gray-900">Datos analíticos:</h4>
                      <p className="text-gray-700">Anonimizados y agregados, conservados indefinidamente para mejoras del servicio.</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Tus Derechos */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="mr-3">⚖️</span>
                Tus Derechos
              </h2>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-fresh-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <span className="mr-2">👁️</span>Acceso
                  </h4>
                  <p className="text-gray-700 text-sm">Solicitar una copia de tus datos personales</p>
                </div>
                
                <div className="bg-warm-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <span className="mr-2">✏️</span>Rectificación
                  </h4>
                  <p className="text-gray-700 text-sm">Corregir datos inexactos o incompletos</p>
                </div>
                
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <span className="mr-2">🗑️</span>Eliminación
                  </h4>
                  <p className="text-gray-700 text-sm">Solicitar la eliminación de tus datos</p>
                </div>
                
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <span className="mr-2">📦</span>Portabilidad
                  </h4>
                  <p className="text-gray-700 text-sm">Recibir tus datos en formato estructurado</p>
                </div>
              </div>
              
              <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                <h4 className="font-semibold text-gray-900 mb-2">📧 Ejercer tus derechos:</h4>
                <p className="text-gray-700 mb-3">
                  Para ejercer cualquiera de estos derechos, contáctanos en:
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <a href="mailto:estudio.123455@gmail.com" className="inline-flex items-center text-fresh-600 hover:text-fresh-700">
                    <span className="mr-2">📧</span>estudio.123455@gmail.com
                  </a>
                  <a href="https://wa.me/573214596837" className="inline-flex items-center text-green-600 hover:text-green-700">
                    <span className="mr-2">💬</span>WhatsApp
                  </a>
                </div>
              </div>
            </section>

            {/* Contacto */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="mr-3">📞</span>
                Contacto
              </h2>
              
              <div className="bg-gradient-to-r from-fresh-50 to-warm-50 rounded-xl p-6">
                <p className="text-gray-700 mb-4">
                  Si tienes preguntas sobre esta Política de Privacidad o sobre cómo manejamos tus datos, 
                  no dudes en contactarnos:
                </p>
                
                <div className="space-y-3">
                  <div className="flex items-center text-gray-700">
                    <span className="mr-3">📧</span>
                    <strong>Email:</strong> 
                    <a href="mailto:estudio.123455@gmail.com" className="ml-2 text-fresh-600 hover:text-fresh-700">
                      estudio.123455@gmail.com
                    </a>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <span className="mr-3">💬</span>
                    <strong>WhatsApp:</strong> 
                    <a href="https://wa.me/573214596837" className="ml-2 text-green-600 hover:text-green-700">
                      +57 321 459 6837
                    </a>
                  </div>
                </div>
              </div>
            </section>

            {/* Actualizaciones */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="mr-3">🔄</span>
                Actualizaciones de esta Política
              </h2>
              
              <div className="bg-gray-50 rounded-xl p-6">
                <p className="text-gray-700">
                  Podemos actualizar esta Política de Privacidad ocasionalmente para reflejar cambios en nuestras 
                  prácticas o por otras razones operativas, legales o regulatorias. Te notificaremos sobre cambios 
                  significativos por email o mediante un aviso destacado en nuestra plataforma.
                </p>
                <p className="text-gray-700 mt-4">
                  Te recomendamos revisar esta política periódicamente para mantenerte informado sobre cómo 
                  protegemos tu información.
                </p>
              </div>
            </section>

          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-12 text-center">
          <Link
            href="/"
            className="inline-flex items-center text-fresh-600 hover:text-fresh-700 font-semibold"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  )
}
