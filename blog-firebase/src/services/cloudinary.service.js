const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp"
];

function validateImageFile(file) {
  if (!file) {
    throw new Error("Selecione uma imagem.");
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error("Envie apenas imagens JPG, PNG ou WEBP.");
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error("A imagem precisa ter no máximo 5MB.");
  }

  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
    throw new Error("Cloudinary não configurado no arquivo .env.");
  }
}

export async function uploadBlogCover(file) {
  validateImageFile(file);

  const formData = new FormData();

  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    {
      method: "POST",
      body: formData
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result?.error?.message || "Erro ao enviar imagem para o Cloudinary."
    );
  }

  return {
    url: result.secure_url,
    publicId: result.public_id,
    width: result.width,
    height: result.height,
    format: result.format,
    bytes: result.bytes,
    source: "cloudinary"
  };
}