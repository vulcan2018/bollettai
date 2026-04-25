import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

export async function POST(request: NextRequest) {
  const resend = new Resend(process.env.RESEND_API_KEY)
  try {
    const { name, email, company, message, type } = await request.json()

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Nome, email e messaggio sono obbligatori' },
        { status: 400 }
      )
    }

    const typeLabels: Record<string, string> = {
      audit_request: 'Richiesta Audit Gratuito',
      general: 'Richiesta generale',
      legal: 'Consulenza legale',
      cer: 'Comunità Energetica (CER)',
      enterprise: 'Piano Enterprise',
    }

    await resend.emails.send({
      from: 'BollettAI <support@firasoftware.com>',
      to: ['firasoftwareltd@gmail.com'],
      replyTo: email,
      subject: `[BollettAI] ${typeLabels[type] || 'Contatto'} da ${name}`,
      html: `
        <h2>Nuovo contatto da BollettAI</h2>
        <p><strong>Nome:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        ${company ? `<p><strong>Azienda:</strong> ${company}</p>` : ''}
        <p><strong>Tipo:</strong> ${typeLabels[type] || type}</p>
        <hr />
        <p><strong>Messaggio:</strong></p>
        <p>${message.replace(/\n/g, '<br />')}</p>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: 'Errore durante l\'invio del messaggio' },
      { status: 500 }
    )
  }
}
