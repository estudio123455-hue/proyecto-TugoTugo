'use client'

import Link from 'next/link'
import Navigation from '@/components/Navigation'

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-fresh-50 to-warm-50 font-sans">
      <Navigation />

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-fresh-500 to-warm-500 rounded-2xl shadow-lg mb-6">
            <span className="text-2xl">📋</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Términos y Condiciones
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Estas son las reglas y condiciones que rigen el uso de los servicios
            de Zavo.
          </p>
          <div className="mt-4 text-sm text-gray-500">
            Última actualización:{' '}
            {new Date().toLocaleDateString('es-ES', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-8 space-y-12">
            {/* Aceptación */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="mr-3">✅</span>
                Aceptación de los Términos
              </h2>
              <div className="bg-fresh-50 rounded-xl p-6">
                <p className="text-gray-700 leading-relaxed">
                  Al acceder y usar Zavo, aceptas estar legalmente vinculado
                  por estos Términos y Condiciones. Si no estás de acuerdo con
                  alguna parte de estos términos, no debes usar nuestros
                  servicios.
                </p>
                <p className="text-gray-700 leading-relaxed mt-4">
                  Estos términos se aplican a todos los usuarios, incluyendo
                  visitantes, clientes registrados y establecimientos
                  comerciales que usan nuestra plataforma.
                </p>
              </div>
            </section>

            {/* Descripción del Servicio */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="mr-3">🍽️</span>
                Descripción del Servicio
              </h2>

              <div className="space-y-6">
                <div className="bg-warm-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    ¿Qué es Zavo?
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    Zavo es una plataforma digital que conecta a
                    consumidores con establecimientos de alimentos para la venta
                    de excedentes de comida fresca a precios reducidos,
                    contribuyendo así a la reducción del desperdicio
                    alimentario.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <span className="mr-2">🛒</span>Para Clientes:
                    </h4>
                    <ul className="space-y-2 text-gray-700">
                      <li>• Acceso a packs sorpresa con descuentos</li>
                      <li>• Búsqueda de establecimientos cercanos</li>
                      <li>• Sistema de reservas y pagos seguros</li>
                      <li>• Historial de pedidos y estadísticas</li>
                    </ul>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-6">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <span className="mr-2">🏪</span>Para Establecimientos:
                    </h4>
                    <ul className="space-y-2 text-gray-700">
                      <li>• Herramientas para gestionar inventario</li>
                      <li>• Sistema de publicación de packs</li>
                      <li>• Dashboard de ventas y estadísticas</li>
                      <li>• Procesamiento de pagos automático</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Registro y Cuentas */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="mr-3">👤</span>
                Registro y Cuentas de Usuario
              </h2>

              <div className="space-y-6">
                <div className="bg-blue-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Requisitos de Registro:
                  </h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Debes tener al menos 18 años de edad</li>
                    <li>• Proporcionar información precisa y actualizada</li>
                    <li>• Mantener la confidencialidad de tu contraseña</li>
                    <li>• Usar la cuenta solo para fines legítimos</li>
                    <li>• Notificar cualquier uso no autorizado</li>
                  </ul>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <span className="mr-2">⚠️</span>Responsabilidades:
                  </h3>
                  <p className="text-gray-700">
                    Eres responsable de todas las actividades que ocurran bajo
                    tu cuenta. Debes notificarnos inmediatamente si sospechas
                    cualquier uso no autorizado de tu cuenta.
                  </p>
                </div>
              </div>
            </section>

            {/* Uso de la Plataforma */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="mr-3">⚙️</span>
                Uso Aceptable de la Plataforma
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-green-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <span className="mr-2">✅</span>Permitido:
                  </h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Usar la plataforma según su propósito</li>
                    <li>• Proporcionar reseñas honestas</li>
                    <li>• Comunicarte respetuosamente</li>
                    <li>• Reportar problemas técnicos</li>
                    <li>• Seguir las instrucciones de recogida</li>
                  </ul>
                </div>

                <div className="bg-red-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <span className="mr-2">🚫</span>Prohibido:
                  </h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Usar información falsa o engañosa</li>
                    <li>• Revender packs o transferir reservas</li>
                    <li>• Interferir con el funcionamiento</li>
                    <li>• Acosar a otros usuarios</li>
                    <li>• Violar leyes o regulaciones</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Reservas y Pagos */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="mr-3">💳</span>
                Reservas, Pagos y Cancelaciones
              </h2>

              <div className="space-y-6">
                <div className="bg-fresh-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    🔸 Proceso de Reserva:
                  </h3>
                  <ol className="space-y-2 text-gray-700 list-decimal list-inside">
                    <li>Seleccionas un pack disponible</li>
                    <li>Realizas el pago inmediatamente</li>
                    <li>Recibes confirmación por email</li>
                    <li>Recoges en el horario establecido</li>
                    <li>Presentas tu confirmación al establecimiento</li>
                  </ol>
                </div>

                <div className="bg-warm-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    🔸 Políticas de Pago:
                  </h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>
                      • <strong>Pago inmediato:</strong> Se requiere pago
                      completo al reservar
                    </li>
                    <li>
                      • <strong>Métodos aceptados:</strong> Tarjetas de
                      crédito/débito, PayPal
                    </li>
                    <li>
                      • <strong>Moneda:</strong> Todas las transacciones en EUR
                      (€)
                    </li>
                    <li>
                      • <strong>Seguridad:</strong> Procesamiento seguro vía
                      Stripe
                    </li>
                    <li>
                      • <strong>Recibos:</strong> Enviados automáticamente por
                      email
                    </li>
                  </ul>
                </div>

                <div className="bg-blue-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    🔸 Política de Cancelaciones:
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <span className="text-green-600 font-bold">✅</span>
                      <div>
                        <strong>Cancelación permitida:</strong>
                        <p className="text-gray-700">
                          Hasta 2 horas antes del horario de recogida =
                          Reembolso completo
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <span className="text-red-600 font-bold">❌</span>
                      <div>
                        <strong>Cancelación no permitida:</strong>
                        <p className="text-gray-700">
                          Menos de 2 horas antes o no presentarse = Sin
                          reembolso
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    ⚠️ Importante sobre los Packs Sorpresa:
                  </h3>
                  <p className="text-gray-700">
                    Los packs sorpresa contienen una selección de alimentos
                    determinada por el establecimiento.
                    <strong>
                      {' '}
                      No aceptamos devoluciones o reembolsos basados en el
                      contenido del pack
                    </strong>
                    , a menos que haya problemas de seguridad alimentaria
                    documentados.
                  </p>
                </div>
              </div>
            </section>

            {/* Responsabilidades */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="mr-3">⚖️</span>
                Responsabilidades y Limitaciones
              </h2>

              <div className="space-y-6">
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    🔹 Responsabilidades de Zavo:
                  </h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Mantener la plataforma funcionando</li>
                    <li>• Procesar pagos de forma segura</li>
                    <li>• Proporcionar soporte al cliente</li>
                    <li>• Verificar establecimientos registrados</li>
                    <li>• Proteger la información de usuarios</li>
                  </ul>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <span className="mr-2">⚠️</span>Limitaciones de
                    Responsabilidad:
                  </h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>
                      • <strong>Calidad de alimentos:</strong> Responsabilidad
                      del establecimiento
                    </li>
                    <li>
                      • <strong>Alergias:</strong> Debes consultar directamente
                      al establecimiento
                    </li>
                    <li>
                      • <strong>Disponibilidad:</strong> Los packs pueden
                      agotarse sin previo aviso
                    </li>
                    <li>
                      • <strong>Horarios:</strong> Sujetos a cambios por parte
                      del establecimiento
                    </li>
                    <li>
                      • <strong>Disputas:</strong> Entre usuarios y
                      establecimientos son responsabilidad de las partes
                    </li>
                  </ul>
                </div>

                <div className="bg-blue-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    🔹 Responsabilidades del Usuario:
                  </h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Recoger packs en horarios establecidos</li>
                    <li>• Proporcionar información precisa</li>
                    <li>• Tratar respetuosamente al personal</li>
                    <li>• Reportar problemas inmediatamente</li>
                    <li>• Cumplir con estos términos</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Establecimientos */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="mr-3">🏪</span>
                Términos Específicos para Establecimientos
              </h2>

              <div className="space-y-6">
                <div className="bg-warm-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    📋 Requisitos y Obligaciones:
                  </h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>
                      • <strong>Licencias:</strong> Mantener todas las licencias
                      comerciales y sanitarias vigentes
                    </li>
                    <li>
                      • <strong>Seguridad alimentaria:</strong> Cumplir con
                      todas las regulaciones de seguridad
                    </li>
                    <li>
                      • <strong>Información precisa:</strong> Proporcionar
                      descripciones honestas de los packs
                    </li>
                    <li>
                      • <strong>Disponibilidad:</strong> Honrar las reservas
                      confirmadas
                    </li>
                    <li>
                      • <strong>Horarios:</strong> Respetar los horarios de
                      recogida establecidos
                    </li>
                  </ul>
                </div>

                <div className="bg-green-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    💰 Comisiones y Pagos:
                  </h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>
                      • <strong>Comisión:</strong> 15% sobre cada pack vendido
                    </li>
                    <li>
                      • <strong>Pagos:</strong> Semanales, directamente a tu
                      cuenta bancaria
                    </li>
                    <li>
                      • <strong>Informes:</strong> Disponibles en tiempo real en
                      tu dashboard
                    </li>
                    <li>
                      • <strong>Impuestos:</strong> Responsabilidad del
                      establecimiento
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Propiedad Intelectual */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="mr-3">©️</span>
                Propiedad Intelectual
              </h2>

              <div className="bg-gray-50 rounded-xl p-6">
                <p className="text-gray-700 mb-4">
                  Todos los contenidos de la plataforma Zavo, incluyendo
                  pero no limitándose a textos, gráficos, logos, iconos,
                  imágenes, clips de audio, descargas digitales y software, son
                  propiedad de Zavo o sus proveedores de contenido.
                </p>
                <p className="text-gray-700">
                  Los usuarios mantienen los derechos sobre el contenido que
                  publican (reseñas, fotos), pero otorgan a Zavo una
                  licencia no exclusiva para usar dicho contenido en la
                  plataforma.
                </p>
              </div>
            </section>

            {/* Terminación */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="mr-3">🔚</span>
                Terminación del Servicio
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-blue-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    👤 Por parte del Usuario:
                  </h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Puedes cerrar tu cuenta en cualquier momento</li>
                    <li>• Contacta soporte para eliminación completa</li>
                    <li>• Pedidos pendientes deben completarse</li>
                  </ul>
                </div>

                <div className="bg-red-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    🏢 Por parte de Zavo:
                  </h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Violación de términos</li>
                    <li>• Actividad fraudulenta</li>
                    <li>• Uso indebido de la plataforma</li>
                    <li>• Con o sin previo aviso</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Resolución de Disputas */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="mr-3">🤝</span>
                Resolución de Disputas
              </h2>

              <div className="space-y-6">
                <div className="bg-fresh-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    📞 Proceso de Resolución:
                  </h3>
                  <ol className="space-y-2 text-gray-700 list-decimal list-inside">
                    <li>
                      <strong>Contacto directo:</strong> Intenta resolver
                      directamente con el establecimiento
                    </li>
                    <li>
                      <strong>Soporte Zavo:</strong> Contacta nuestro equipo
                      de soporte
                    </li>
                    <li>
                      <strong>Mediación:</strong> Facilitamos comunicación entre
                      las partes
                    </li>
                    <li>
                      <strong>Decisión final:</strong> Zavo toma decisión
                      basada en evidencia
                    </li>
                  </ol>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    ⚖️ Jurisdicción:
                  </h3>
                  <p className="text-gray-700">
                    Estos términos se rigen por las leyes del país donde opera
                    Zavo. Cualquier disputa que no pueda resolverse mediante
                    nuestro proceso interno estará sujeta a la jurisdicción de
                    los tribunales competentes.
                  </p>
                </div>
              </div>
            </section>

            {/* Contacto */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="mr-3">📞</span>
                Contacto y Soporte
              </h2>

              <div className="bg-gradient-to-r from-fresh-50 to-warm-50 rounded-xl p-6">
                <p className="text-gray-700 mb-4">
                  Para cualquier pregunta sobre estos Términos y Condiciones, o
                  si necesitas soporte:
                </p>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center text-gray-700">
                      <span className="mr-3">📧</span>
                      <div>
                        <strong>Email de Soporte:</strong>
                        <br />
                        <a
                          href="mailto:estudio.123455@gmail.com"
                          className="text-fresh-600 hover:text-fresh-700"
                        >
                          estudio.123455@gmail.com
                        </a>
                      </div>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <span className="mr-3">💬</span>
                      <div>
                        <strong>WhatsApp:</strong>
                        <br />
                        <a
                          href="https://wa.me/573214596837"
                          className="text-green-600 hover:text-green-700"
                        >
                          +57 321 459 6837
                        </a>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center text-gray-700">
                      <span className="mr-3">🕐</span>
                      <div>
                        <strong>Horario de Soporte:</strong>
                        <br />
                        Lunes a Viernes: 9:00 - 18:00
                      </div>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <span className="mr-3">⚡</span>
                      <div>
                        <strong>Respuesta:</strong>
                        <br />
                        Máximo 24 horas
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Modificaciones */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="mr-3">🔄</span>
                Modificaciones a los Términos
              </h2>

              <div className="bg-gray-50 rounded-xl p-6">
                <p className="text-gray-700 mb-4">
                  Nos reservamos el derecho de modificar estos términos en
                  cualquier momento. Los cambios entrarán en vigor
                  inmediatamente después de su publicación en la plataforma.
                </p>
                <p className="text-gray-700">
                  Te notificaremos sobre cambios significativos por email o
                  mediante un aviso destacado en la plataforma. El uso
                  continuado de nuestros servicios después de cualquier
                  modificación constituye tu aceptación de los nuevos términos.
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
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  )
}
