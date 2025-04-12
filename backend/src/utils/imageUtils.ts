import { Buffer } from 'buffer';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif'];
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

// Signatures de fichiers communes (magic numbers)
const FILE_SIGNATURES = {
  'image/jpeg': [0xFF, 0xD8, 0xFF],
  'image/png': [0x89, 0x50, 0x4E, 0x47],
  'image/gif': [0x47, 0x49, 0x46, 0x38]
};

function checkFileSignature(buffer: Buffer, mimeType: string): boolean {
  const signature = FILE_SIGNATURES[mimeType as keyof typeof FILE_SIGNATURES];
  if (!signature) return false;

  return signature.every((byte, index) => buffer[index] === byte);
}

export async function validateAndConvertImage(buffer: Buffer, mimeType: string): Promise<string | null> {
  try {
    // Vérifier la taille du fichier
    if (buffer.length > MAX_FILE_SIZE) {
      throw new Error('Le fichier est trop volumineux (max 2MB)');
    }

    // Vérifier si le type MIME est autorisé
    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      throw new Error('Format de fichier non autorisé. Seuls les formats JPEG, PNG et GIF sont acceptés.');
    }

    // Vérifier la signature du fichier
    if (!checkFileSignature(buffer, mimeType)) {
      throw new Error('Le fichier ne correspond pas au format déclaré.');
    }

    // Convertir en base64
    const base64Image = `data:${mimeType};base64,${buffer.toString('base64')}`;
    
    return base64Image;
  } catch (error) {
    console.error('Erreur lors de la validation de l\'image:', error);
    return null;
  }
} 