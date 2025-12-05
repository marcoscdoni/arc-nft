import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// Configurar cliente R2 otimizado para produção
const r2Client = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
  },
  maxAttempts: 3, // Retry automático
  requestHandler: {
    connectionTimeout: 30000, // 30s timeout
    socketTimeout: 30000,
  },
});

const BUCKET_NAME = process.env.R2_BUCKET_NAME || "";
const PUBLIC_URL = process.env.R2_PUBLIC_URL || "";

export interface UploadResult {
  imageUrl: string;
  metadataUrl: string;
}

/**
 * Faz upload de imagem e metadata para Cloudflare R2
 */
export async function uploadToR2(
  imageBuffer: Buffer,
  metadata: {
    name: string;
    description: string;
    attributes: Array<{ trait_type: string; value: string }>;
  }
): Promise<UploadResult> {
  try {
    // Gerar ID único para os arquivos
    const fileId = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const imageKey = `images/${fileId}.png`;
    const metadataKey = `metadata/${fileId}.json`;

    // Upload da imagem com headers otimizados
    await r2Client.send(
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: imageKey,
        Body: imageBuffer,
        ContentType: "image/png",
        CacheControl: "public, max-age=31536000, immutable", // Cache de 1 ano
        Metadata: {
          uploadedAt: new Date().toISOString(),
          fileId: fileId,
        },
      })
    );

    const imageUrl = `${PUBLIC_URL}/${imageKey}`;

    // Criar metadata JSON com a URL da imagem
    const metadataJson = {
      name: metadata.name,
      description: metadata.description,
      image: imageUrl,
      attributes: metadata.attributes,
    };

    // Upload da metadata com headers otimizados
    await r2Client.send(
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: metadataKey,
        Body: JSON.stringify(metadataJson, null, 2),
        ContentType: "application/json",
        CacheControl: "public, max-age=31536000, immutable", // Cache de 1 ano
        Metadata: {
          uploadedAt: new Date().toISOString(),
          fileId: fileId,
          nftName: metadata.name,
        },
      })
    );

    const metadataUrl = `${PUBLIC_URL}/${metadataKey}`;

    console.log("✅ Upload para R2 concluído:", { imageUrl, metadataUrl });

    return {
      imageUrl,
      metadataUrl,
    };
  } catch (error) {
    console.error("❌ Erro ao fazer upload para R2:", error);
    
    // Log estruturado para produção
    if (process.env.NODE_ENV === 'production') {
      console.error({
        timestamp: new Date().toISOString(),
        error: 'R2_UPLOAD_FAILED',
        message: error instanceof Error ? error.message : 'Unknown error',
        metadata: {
          name: metadata.name,
          hasImage: !!imageBuffer,
        }
      });
    }
    
    throw new Error(`Falha no upload para R2: ${error instanceof Error ? error.message : "Erro desconhecido"}`);
  }
}

/**
 * Valida se as variáveis de ambiente do R2 estão configuradas
 */
export function validateR2Config(): boolean {
  const required = [
    "R2_ENDPOINT",
    "R2_ACCESS_KEY_ID",
    "R2_SECRET_ACCESS_KEY",
    "R2_BUCKET_NAME",
    "R2_PUBLIC_URL",
  ];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error("❌ Variáveis de ambiente do R2 faltando:", missing);
    return false;
  }

  return true;
}
