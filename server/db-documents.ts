import { eq, and, desc } from "drizzle-orm";
import { documents, uploadedFiles, InsertDocument, InsertUploadedFile, Document, UploadedFile } from "../drizzle/schema";
import { getDb } from "./db";

/**
 * Document helpers
 */

export async function createDocument(doc: InsertDocument): Promise<Document | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.insert(documents).values(doc);
    const insertId = (result[0] as any)?.insertId;
    
    if (!insertId) return null;

    const created = await db.select().from(documents).where(eq(documents.id, insertId)).limit(1);
    return created[0] || null;
  } catch (error) {
    console.error("[Database] Failed to create document:", error);
    throw error;
  }
}

export async function getUserDocuments(userId: number): Promise<Document[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db
      .select()
      .from(documents)
      .where(eq(documents.userId, userId))
      .orderBy(desc(documents.createdAt));
  } catch (error) {
    console.error("[Database] Failed to get user documents:", error);
    return [];
  }
}

export async function getDocumentById(id: number, userId: number): Promise<Document | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db
      .select()
      .from(documents)
      .where(and(eq(documents.id, id), eq(documents.userId, userId)))
      .limit(1);

    return result[0] || null;
  } catch (error) {
    console.error("[Database] Failed to get document:", error);
    return null;
  }
}

export async function updateDocument(id: number, userId: number, updates: Partial<Document>): Promise<Document | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    await db
      .update(documents)
      .set(updates)
      .where(and(eq(documents.id, id), eq(documents.userId, userId)));

    return getDocumentById(id, userId);
  } catch (error) {
    console.error("[Database] Failed to update document:", error);
    throw error;
  }
}

export async function deleteDocument(id: number, userId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    await db
      .delete(documents)
      .where(and(eq(documents.id, id), eq(documents.userId, userId)));

    return true;
  } catch (error) {
    console.error("[Database] Failed to delete document:", error);
    throw error;
  }
}

/**
 * Uploaded files helpers
 */

export async function createUploadedFile(file: InsertUploadedFile): Promise<UploadedFile | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.insert(uploadedFiles).values(file);
    const insertId = (result[0] as any)?.insertId;
    
    if (!insertId) return null;

    const created = await db.select().from(uploadedFiles).where(eq(uploadedFiles.id, insertId)).limit(1);
    return created[0] || null;
  } catch (error) {
    console.error("[Database] Failed to create uploaded file:", error);
    throw error;
  }
}

export async function getUserUploadedFiles(userId: number): Promise<UploadedFile[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db
      .select()
      .from(uploadedFiles)
      .where(eq(uploadedFiles.userId, userId))
      .orderBy(desc(uploadedFiles.createdAt));
  } catch (error) {
    console.error("[Database] Failed to get user files:", error);
    return [];
  }
}

export async function getUploadedFileById(id: number, userId: number): Promise<UploadedFile | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db
      .select()
      .from(uploadedFiles)
      .where(and(eq(uploadedFiles.id, id), eq(uploadedFiles.userId, userId)))
      .limit(1);

    return result[0] || null;
  } catch (error) {
    console.error("[Database] Failed to get uploaded file:", error);
    return null;
  }
}

export async function deleteUploadedFile(id: number, userId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    await db
      .delete(uploadedFiles)
      .where(and(eq(uploadedFiles.id, id), eq(uploadedFiles.userId, userId)));

    return true;
  } catch (error) {
    console.error("[Database] Failed to delete uploaded file:", error);
    throw error;
  }
}

export async function updateUploadedFile(id: number, userId: number, updates: Partial<UploadedFile>): Promise<UploadedFile | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    await db
      .update(uploadedFiles)
      .set(updates)
      .where(and(eq(uploadedFiles.id, id), eq(uploadedFiles.userId, userId)));

    return getUploadedFileById(id, userId);
  } catch (error) {
    console.error("[Database] Failed to update uploaded file:", error);
    throw error;
  }
}
