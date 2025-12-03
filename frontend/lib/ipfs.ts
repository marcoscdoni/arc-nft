export interface NFTMetadata {
  name: string
  description: string
  image: string
  attributes?: Array<{
    trait_type: string
    value: string | number
  }>
}

export async function uploadToIPFS(file: File): Promise<string> {
  try {
    // Usando Pinata como exemplo - você precisará configurar sua API key
    const PINATA_API_KEY = process.env.NEXT_PUBLIC_PINATA_API_KEY
    const PINATA_SECRET_KEY = process.env.NEXT_PUBLIC_PINATA_SECRET_KEY

    if (!PINATA_API_KEY || !PINATA_SECRET_KEY) {
      throw new Error('Pinata API keys not configured')
    }

    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_SECRET_KEY,
      },
      body: formData,
    })

    if (!response.ok) {
      throw new Error('Failed to upload to IPFS')
    }

    const data = await response.json()
    return `ipfs://${data.IpfsHash}`
  } catch (error) {
    console.error('IPFS upload error:', error)
    throw error
  }
}

export async function uploadMetadataToIPFS(metadata: NFTMetadata): Promise<string> {
  try {
    const PINATA_API_KEY = process.env.NEXT_PUBLIC_PINATA_API_KEY
    const PINATA_SECRET_KEY = process.env.NEXT_PUBLIC_PINATA_SECRET_KEY

    if (!PINATA_API_KEY || !PINATA_SECRET_KEY) {
      throw new Error('Pinata API keys not configured')
    }

    const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_SECRET_KEY,
      },
      body: JSON.stringify(metadata),
    })

    if (!response.ok) {
      throw new Error('Failed to upload metadata to IPFS')
    }

    const data = await response.json()
    return `ipfs://${data.IpfsHash}`
  } catch (error) {
    console.error('Metadata upload error:', error)
    throw error
  }
}

// Alternativa: Upload local para testes (sem IPFS)
export async function createMockTokenURI(metadata: NFTMetadata): Promise<string> {
  // Para desenvolvimento, você pode retornar um data URI ou usar um serviço de mock
  const jsonString = JSON.stringify(metadata)
  const base64 = btoa(jsonString)
  return `data:application/json;base64,${base64}`
}
