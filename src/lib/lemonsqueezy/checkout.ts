import { lemonSqueezyClient, PRODUCTS, ProductKey } from './client'

interface CheckoutOptions {
  productKey: ProductKey
  email: string
  clientId: string
  matchId?: string
  redirectUrl?: string
}

export async function createCheckout({
  productKey,
  email,
  clientId,
  matchId,
  redirectUrl
}: CheckoutOptions) {
  const product = PRODUCTS[productKey]
  
  if (!product.variantId) {
    throw new Error(`Variant ID not configured for ${productKey}`)
  }

  try {
    const checkout = await lemonSqueezyClient.createCheckout({
      store: process.env.LEMONSQUEEZY_STORE_ID!,
      variant: product.variantId,
      custom: {
        client_id: clientId,
        match_id: matchId || '',
        product_key: productKey,
        credits: product.credits.toString()
      },
      checkout_data: {
        email,
        custom: {
          client_id: clientId,
          product_key: productKey
        }
      },
      product_options: {
        name: product.name,
        description: `Get ${product.credits} designer matches for your projects`,
        redirect_url: redirectUrl || `${process.env.NEXT_PUBLIC_APP_URL}/match/success`,
        receipt_button_text: 'View Your Matches',
        receipt_link_url: `${process.env.NEXT_PUBLIC_APP_URL}/matches`
      }
    })

    return checkout.data.attributes.url
  } catch (error) {
    console.error('Error creating checkout:', error)
    throw new Error('Failed to create checkout session')
  }
}

export async function getCheckout(checkoutId: string) {
  try {
    const checkout = await lemonSqueezyClient.retrieveCheckout({
      id: checkoutId
    })
    return checkout
  } catch (error) {
    console.error('Error retrieving checkout:', error)
    throw error
  }
}