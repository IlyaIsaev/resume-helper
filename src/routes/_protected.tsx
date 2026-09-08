import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected')({
  beforeLoad: async ({ context, location }) => {
    if (!context.session) {
      throw redirect({
        to: '/sign-in',
        search: { redirect: location.href },
      })
    }

    return { user: context.session.user }
  },
  component: ProtectedLayout,
})

function ProtectedLayout() {
  return <Outlet />
}
