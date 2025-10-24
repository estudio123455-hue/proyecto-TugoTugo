// Configuración SEO centralizada para TugoTugo

export const seoConfig = {
  // Configuración base del sitio
  site: {
    name: 'TugoTugo',
    description: 'Plataforma que conecta personas con restaurantes locales para rescatar comida deliciosa con descuento y reducir el desperdicio alimentario',
    url: process.env.NEXTAUTH_URL || 'https://tugotugo.vercel.app',
    logo: '/icons/icon-512x512.png',
    favicon: '/favicon.ico'
  },

  // Meta tags por defecto
  defaultMeta: {
    title: 'TugoTugo - Rescata Comida, Cuida el Planeta',
    description: 'Conecta con restaurantes locales y rescata comida deliciosa con hasta 70% de descuento. Reduce el desperdicio alimentario mientras ahorras dinero.',
    keywords: [
      'comida',
      'descuento',
      'restaurantes',
      'desperdicio alimentario',
      'sostenibilidad',
      'ahorro',
      'medio ambiente',
      'packs sorpresa',
      'comida rescatada',
      'Colombia'
    ],
    author: 'TugoTugo',
    robots: 'index, follow',
    language: 'es-CO',
    region: 'CO'
  },

  // Open Graph (Facebook, WhatsApp, etc.)
  openGraph: {
    type: 'website',
    siteName: 'TugoTugo',
    title: 'TugoTugo - Rescata Comida, Cuida el Planeta',
    description: 'Conecta con restaurantes locales y rescata comida deliciosa con hasta 70% de descuento',
    image: '/og-image.jpg',
    imageAlt: 'TugoTugo - Plataforma de rescate de comida',
    locale: 'es_CO'
  },

  // Twitter Cards
  twitter: {
    card: 'summary_large_image',
    site: '@tugotugo',
    creator: '@tugotugo',
    title: 'TugoTugo - Rescata Comida, Cuida el Planeta',
    description: 'Conecta con restaurantes locales y rescata comida deliciosa con hasta 70% de descuento',
    image: '/twitter-card.jpg'
  },

  // Structured Data (JSON-LD)
  structuredData: {
    organization: {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'TugoTugo',
      url: process.env.NEXTAUTH_URL || 'https://tugotugo.vercel.app',
      logo: '/icons/icon-512x512.png',
      description: 'Plataforma que conecta personas con restaurantes locales para rescatar comida y reducir el desperdicio alimentario',
      foundingDate: '2024',
      founders: [
        {
          '@type': 'Person',
          name: 'TugoTugo Team'
        }
      ],
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer service',
        email: 'hello@tugotugo.com'
      },
      sameAs: [
        'https://facebook.com/tugotugo',
        'https://instagram.com/tugotugo',
        'https://twitter.com/tugotugo'
      ]
    },

    website: {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'TugoTugo',
      url: process.env.NEXTAUTH_URL || 'https://tugotugo.vercel.app',
      description: 'Plataforma de rescate de comida que conecta usuarios con restaurantes locales',
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${process.env.NEXTAUTH_URL || 'https://tugotugo.vercel.app'}/search?q={search_term_string}`
        },
        'query-input': 'required name=search_term_string'
      }
    }
  }
}

// Función para generar meta tags dinámicos
export function generateMetaTags({
  title,
  description,
  image,
  url,
  type = 'website',
  noIndex = false
}: {
  title?: string
  description?: string
  image?: string
  url?: string
  type?: string
  noIndex?: boolean
} = {}) {
  const fullTitle = title ? `${title} | ${seoConfig.site.name}` : seoConfig.defaultMeta.title
  const metaDescription = description || seoConfig.defaultMeta.description
  const metaImage = image || seoConfig.openGraph.image
  const metaUrl = url || seoConfig.site.url

  return {
    title: fullTitle,
    description: metaDescription,
    keywords: seoConfig.defaultMeta.keywords.join(', '),
    author: seoConfig.defaultMeta.author,
    robots: noIndex ? 'noindex, nofollow' : seoConfig.defaultMeta.robots,
    canonical: metaUrl,
    
    // Open Graph
    'og:type': type,
    'og:site_name': seoConfig.openGraph.siteName,
    'og:title': fullTitle,
    'og:description': metaDescription,
    'og:image': metaImage,
    'og:image:alt': seoConfig.openGraph.imageAlt,
    'og:url': metaUrl,
    'og:locale': seoConfig.openGraph.locale,
    
    // Twitter
    'twitter:card': seoConfig.twitter.card,
    'twitter:site': seoConfig.twitter.site,
    'twitter:creator': seoConfig.twitter.creator,
    'twitter:title': fullTitle,
    'twitter:description': metaDescription,
    'twitter:image': metaImage,
    
    // Mobile
    'viewport': 'width=device-width, initial-scale=1, maximum-scale=1',
    'theme-color': '#10B981',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default'
  }
}

// Meta tags específicos por página
export const pageMetaTags = {
  home: {
    title: 'TugoTugo - Rescata Comida, Cuida el Planeta',
    description: 'Conecta con restaurantes locales y rescata comida deliciosa con hasta 70% de descuento. Únete al movimiento sostenible.',
    keywords: ['inicio', 'comida rescatada', 'descuentos', 'sostenibilidad']
  },

  packs: {
    title: 'Packs Sorpresa Disponibles',
    description: 'Descubre packs sorpresa con comida deliciosa cerca de ti. Ahorra dinero mientras ayudas al medio ambiente.',
    keywords: ['packs', 'ofertas', 'comida', 'descuentos', 'cerca']
  },

  restaurants: {
    title: 'Restaurantes Aliados',
    description: 'Explora todos los restaurantes que forman parte de nuestra red de rescate de comida. Encuentra tu favorito.',
    keywords: ['restaurantes', 'aliados', 'socios', 'comida', 'local']
  },

  profile: {
    title: 'Mi Perfil',
    description: 'Gestiona tu cuenta, revisa tu historial de órdenes y configuración personal.',
    keywords: ['perfil', 'cuenta', 'historial', 'configuración'],
    noIndex: true
  },

  orders: {
    title: 'Mis Órdenes',
    description: 'Revisa el estado de tus órdenes actuales y tu historial de compras.',
    keywords: ['órdenes', 'compras', 'historial', 'estado'],
    noIndex: true
  },

  auth: {
    title: 'Iniciar Sesión',
    description: 'Accede a tu cuenta TugoTugo para comenzar a rescatar comida deliciosa.',
    keywords: ['login', 'iniciar sesión', 'acceso', 'cuenta'],
    noIndex: true
  }
}

// Función para generar sitemap dinámico
export function generateSitemapUrls() {
  const baseUrl = seoConfig.site.url
  
  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0
    },
    {
      url: `${baseUrl}/packs`,
      lastModified: new Date(),
      changeFrequency: 'hourly' as const,
      priority: 0.9
    },
    {
      url: `${baseUrl}/restaurants`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8
    },
    {
      url: `${baseUrl}/how-it-works`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5
    }
  ]
}
