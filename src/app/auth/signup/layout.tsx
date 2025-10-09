export const metadata = {
  title: 'Crear Cuenta - FoodSave',
  description: 'Crea tu cuenta en FoodSave',
}

export default function SignUpLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

// Disable caching for this page
export const dynamic = 'force-dynamic'
export const revalidate = 0
