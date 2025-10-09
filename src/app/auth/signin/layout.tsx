export const metadata = {
  title: 'Iniciar Sesión - FoodSave',
  description: 'Inicia sesión en FoodSave',
}

export default function SignInLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

// Disable caching for this page
export const dynamic = 'force-dynamic'
export const revalidate = 0
