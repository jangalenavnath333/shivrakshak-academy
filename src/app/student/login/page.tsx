import StudentLoginForm from './StudentLoginForm'

export default async function StudentLoginPage({ searchParams }: { searchParams: Promise<{ roll?: string }> }) {
  const roll = (await searchParams).roll?.toUpperCase() || ''
  return <StudentLoginForm initialRollNumber={roll} />
}
