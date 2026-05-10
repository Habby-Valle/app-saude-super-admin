import { redirect } from 'next/navigation'

const DEEPLINK_SCHEME = 'zeloapp'

export default async function InviteFamilyPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  redirect(`${DEEPLINK_SCHEME}://invite/family/${token}`)
}