import { onCall, HttpsError } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";

import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

import { v2 as cloudinary } from "cloudinary";

initializeApp();

const db = getFirestore();

const CLOUDINARY_CLOUD_NAME = defineSecret("CLOUDINARY_CLOUD_NAME");
const CLOUDINARY_API_KEY = defineSecret("CLOUDINARY_API_KEY");
const CLOUDINARY_API_SECRET = defineSecret("CLOUDINARY_API_SECRET");

async function checkAdminUser(uid) {
  const adminRef = db.collection("adminUsers").doc(uid);
  const adminSnap = await adminRef.get();

  if (!adminSnap.exists) {
    return null;
  }

  const adminData = adminSnap.data();

  if (adminData.active !== true) {
    return null;
  }

  return adminData;
}

export const getCloudinaryUploadSignature = onCall(
  {
    region: "southamerica-east1",
    secrets: [
      CLOUDINARY_CLOUD_NAME,
      CLOUDINARY_API_KEY,
      CLOUDINARY_API_SECRET
    ]
  },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError(
        "unauthenticated",
        "Você precisa estar logado para enviar imagens."
      );
    }

    const adminUser = await checkAdminUser(request.auth.uid);

    if (!adminUser) {
      throw new HttpsError(
        "permission-denied",
        "Usuário sem permissão para enviar imagens."
      );
    }

    const timestamp = Math.round(Date.now() / 1000);

    const folder = "blog/posts";

    const paramsToSign = {
      timestamp,
      folder
    };

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      CLOUDINARY_API_SECRET.value()
    );

    return {
      cloudName: CLOUDINARY_CLOUD_NAME.value(),
      apiKey: CLOUDINARY_API_KEY.value(),
      timestamp,
      folder,
      signature
    };
  }
);