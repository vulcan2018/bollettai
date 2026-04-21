import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const PLANS = {
  base_monthly: {
    name: 'BollettAI Base - Mensile',
    price: 990,
    interval: 'month' as const,
    tier: 'base',
  },
  base_yearly: {
    name: 'BollettAI Base - Annuale',
    price: 9900,
    interval: 'year' as const,
    tier: 'base',
  },
  pro_monthly: {
    name: 'BollettAI Pro - Mensile',
    price: 2990,
    interval: 'month' as const,
    tier: 'pro',
  },
  pro_yearly: {
    name: 'BollettAI Pro - Annuale',
    price: 29900,
    interval: 'year' as const,
    tier: 'pro',
  },
}

export async function POST(request: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

  try {
    const { planId, userId, userEmail } = await request.json()

    if (!planId || !PLANS[planId as keyof typeof PLANS]) {
      return NextResponse.json({ error: 'Piano non valido' }, { status: 400 })
    }

    if (!userId || !userEmail) {
      return NextResponse.json({ error: 'Utente non autenticato' }, { status: 401 })
    }

    const plan = PLANS[planId as keyof typeof PLANS]
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bollettai.vercel.app'

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: plan.name,
              description: `Abbonamento ${plan.tier === 'base' ? 'Base' : 'Pro'} a BollettAI`,
            },
            unit_amount: plan.price,
            recurring: {
              interval: plan.interval,
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/?success=true&plan=${plan.tier}`,
      cancel_url: `${baseUrl}/?canceled=true`,
      customer_email: userEmail,
      metadata: {
        userId,
        tier: plan.tier,
        planId,
      },
      subscription_data: {
        metadata: {
          userId,
          tier: plan.tier,
        },
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json(
      { error: 'Errore durante la creazione del checkout' },
      { status: 500 }
    )
  }
}
