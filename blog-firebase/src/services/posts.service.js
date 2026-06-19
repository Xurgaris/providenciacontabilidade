import { db } from "../firebase.js";
import { slugify } from "../utils/slugify.js";

import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  limit,
  orderBy,
  serverTimestamp
} from "firebase/firestore";

const POSTS_COLLECTION = "posts";

function normalizeTags(tagsText) {
  if (!tagsText) return [];

  return tagsText
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function normalizeCoverImage(coverImage) {
  if (!coverImage || !coverImage.url) {
    return null;
  }

  try {
    const parsedUrl = new URL(coverImage.url);

    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      throw new Error("URL inválida.");
    }

    return {
      url: coverImage.url,
      publicId: coverImage.publicId || "",
      width: Number(coverImage.width || 0),
      height: Number(coverImage.height || 0),
      format: coverImage.format || "",
      bytes: Number(coverImage.bytes || 0),
      source: coverImage.source || "cloudinary"
    };
  } catch {
    throw new Error("A imagem de capa é inválida.");
  }
}

function validatePostData(data) {
  if (!data.title || data.title.trim().length < 3) {
    throw new Error("O título precisa ter pelo menos 3 caracteres.");
  }

  if (!data.excerpt || data.excerpt.trim().length < 10) {
    throw new Error("O resumo precisa ter pelo menos 10 caracteres.");
  }

  if (!data.content || data.content.trim().length < 20) {
    throw new Error("O conteúdo precisa ter pelo menos 20 caracteres.");
  }

  if (!["draft", "published"].includes(data.status)) {
    throw new Error("Status inválido.");
  }
}

/* ADMIN */

export async function listPostsAdmin() {
  const postsRef = collection(db, POSTS_COLLECTION);
  const postsQuery = query(postsRef, orderBy("updatedAt", "desc"));

  const snapshot = await getDocs(postsQuery);

  return snapshot.docs.map((document) => {
    return {
      id: document.id,
      ...document.data()
    };
  });
}

export async function getPostById(postId) {
  const postRef = doc(db, POSTS_COLLECTION, postId);
  const snapshot = await getDoc(postRef);

  if (!snapshot.exists()) {
    throw new Error("Post não encontrado.");
  }

  return {
    id: snapshot.id,
    ...snapshot.data()
  };
}

export async function createPost(data, user) {
  validatePostData(data);

  const slug = slugify(data.slug || data.title);

  const postData = {
    title: data.title.trim(),
    slug,
    excerpt: data.excerpt.trim(),
    content: data.content.trim(),
    status: data.status,
    tags: normalizeTags(data.tags),
    coverImage: normalizeCoverImage(data.coverImage),
    authorUid: user.uid,
    authorEmail: user.email,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    publishedAt: data.status === "published" ? serverTimestamp() : null
  };

  const postRef = await addDoc(collection(db, POSTS_COLLECTION), postData);

  return postRef.id;
}

export async function updatePost(postId, data) {
  validatePostData(data);

  const slug = slugify(data.slug || data.title);

  const postRef = doc(db, POSTS_COLLECTION, postId);

  await updateDoc(postRef, {
    title: data.title.trim(),
    slug,
    excerpt: data.excerpt.trim(),
    content: data.content.trim(),
    status: data.status,
    tags: normalizeTags(data.tags),
    coverImage: normalizeCoverImage(data.coverImage),
    updatedAt: serverTimestamp(),
    publishedAt: data.status === "published" ? serverTimestamp() : null
  });

  return postId;
}

export async function deletePostById(postId) {
  const postRef = doc(db, POSTS_COLLECTION, postId);
  await deleteDoc(postRef);
}

/* BLOG PÚBLICO */

export async function listPublishedPosts() {
  const postsRef = collection(db, POSTS_COLLECTION);

  const postsQuery = query(
    postsRef,
    where("status", "==", "published")
  );

  const snapshot = await getDocs(postsQuery);

  const posts = snapshot.docs.map((document) => {
    return {
      id: document.id,
      ...document.data()
    };
  });

  return posts.sort((a, b) => {
    const dateA = a.publishedAt?.toMillis ? a.publishedAt.toMillis() : 0;
    const dateB = b.publishedAt?.toMillis ? b.publishedAt.toMillis() : 0;

    return dateB - dateA;
  });
}

export async function getPublishedPostBySlug(slug) {
  const postsRef = collection(db, POSTS_COLLECTION);

  const postsQuery = query(
    postsRef,
    where("status", "==", "published"),
    where("slug", "==", slug),
    limit(1)
  );

  const snapshot = await getDocs(postsQuery);

  if (snapshot.empty) {
    throw new Error("Post não encontrado.");
  }

  const document = snapshot.docs[0];

  return {
    id: document.id,
    ...document.data()
  };
}