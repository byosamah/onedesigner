import { PRODUCTS, ProductKey } from './client'

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
    const response = await fetch('https://api.lemonsqueezy.com/v1/checkouts', {
      method: 'POST',
      headers: {
        'Accept': 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json',
        'Authorization': `Bearer ${process.env.LEMONSQUEEZY_API_KEY}`
      },
      body: JSON.stringify({
        data: {
          type: 'checkouts',
          attributes: {
            custom_data: {
              client_id: clientId,
              match_id: matchId || '',
              product_key: productKey,
              credits: product.credits
            },
            product_options: {
              name: product.name,
              description: `Get ${product.credits} designer matches for your projects`,
              redirect_url: redirectUrl || `${process.env.NEXT_PUBLIC_APP_URL}/match/success`,
              receipt_button_text: 'View Your Matches',
              receipt_link_url: `${process.env.NEXT_PUBLIC_APP_URL}/matches`
            },
            checkout_data: {
              email
            }
          },
          relationships: {
            store: {
              data: {
                type: 'stores',
                id: process.env.LEMONSQUEEZY_STORE_ID!
              }
            },
            variant: {
              data: {
                type: 'variants',
                id: product.variantId
              }
            }
          }
        }
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.errors?.[0]?.detail || 'Failed to create checkout')
    }

    const data = await response.json()
    return data.data.attributes.url
  } catch (error) {
    console.error('Error creating checkout:', error)
    throw new Error('Failed to create checkout session')
  }
}

export async function getCheckout(checkoutId: string) {
  try {
    const response = await fetch(`https://api.lemonsqueezy.com/v1/checkouts/${checkoutId}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/vnd.api+json',
        'Authorization': `Bearer ${process.env.LEMONSQUEEZY_API_KEY}`
      }
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.errors?.[0]?.detail || 'Failed to retrieve checkout')
    }

    const data = await response.json()
    return data.data
  } catch (error) {
    console.error('Error retrieving checkout:', error)
    throw error
  }
}