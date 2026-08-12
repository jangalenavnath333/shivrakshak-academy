import { notFound } from 'next/navigation'
import { z } from 'zod'
import ExamRunner from './ExamRunner'

export default async function TakeExamPage({ searchParams }: { searchParams: Promise<{ attempt?: string }> }) {
  const attempt = z.string().uuid().safeParse((await searchParams).attempt)
  if (!attempt.success) notFound()
  return <ExamRunner attemptId={attempt.data} />
}
