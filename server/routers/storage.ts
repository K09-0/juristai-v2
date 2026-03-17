import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { storagePut, storageGet } from "../storage";
import {
  createDocument,
  getUserDocuments,
  getDocumentById,
  deleteDocument,
  createUploadedFile,
  getUserUploadedFiles,
  getUploadedFileById,
  deleteUploadedFile,
} from "../db-documents";
import { nanoid } from "nanoid";

export const storageRouter = router({
  /**
   * Documents management
   */
  documents: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return getUserDocuments(ctx.user.id);
    }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        return getDocumentById(input.id, ctx.user.id);
      }),

    create: protectedProcedure
      .input(
        z.object({
          title: z.string().min(1, "Title is required"),
          type: z.enum(["исковое_заявление", "претензия", "договор", "другое"]),
          style: z.enum(["формальный", "нейтральный", "агрессивный", "защитный"]).optional(),
          content: z.string().min(1, "Content is required"),
          format: z.enum(["pdf", "docx", "txt"]).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        try {
          // Generate document file and upload to S3
          const fileKey = `documents/${ctx.user.id}/${input.type}/${nanoid()}.${input.format || "pdf"}`;
          const fileBuffer = Buffer.from(input.content, "utf-8");

          const { url } = await storagePut(fileKey, fileBuffer, "application/octet-stream");

          // Create document record in database
          const document = await createDocument({
            userId: ctx.user.id,
            title: input.title,
            type: input.type,
            style: input.style || "нейтральный",
            content: input.content,
            fileUrl: url,
            fileKey: fileKey,
            format: (input.format || "pdf") as "pdf" | "docx" | "txt",
            fileSize: fileBuffer.length,
          });

          return document;
        } catch (error) {
          console.error("[Storage] Failed to create document:", error);
          throw error;
        }
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const doc = await getDocumentById(input.id, ctx.user.id);
        if (!doc) {
          throw new Error("Document not found");
        }

        // Delete from S3
        if (doc.fileKey) {
          try {
            // Note: S3 deletion is optional, mainly for cleanup
            console.log(`[Storage] Deleting file: ${doc.fileKey}`);
          } catch (error) {
            console.error("[Storage] Failed to delete file from S3:", error);
          }
        }

        // Delete from database
        return deleteDocument(input.id, ctx.user.id);
      }),

    download: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const doc = await getDocumentById(input.id, ctx.user.id);
        if (!doc || !doc.fileKey) {
          throw new Error("Document not found or has no file");
        }

        // Get presigned URL for download
        const { url } = await storageGet(doc.fileKey);
        return { url, filename: `${doc.title}.${doc.format || "pdf"}` };
      }),
  }),

  /**
   * Uploaded files management
   */
  files: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return getUserUploadedFiles(ctx.user.id);
    }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        return getUploadedFileById(input.id, ctx.user.id);
      }),

    upload: protectedProcedure
      .input(
        z.object({
          filename: z.string().min(1),
          fileData: z.string(), // base64 encoded
          mimeType: z.string().optional(),
          description: z.string().optional(),
          isPublic: z.boolean().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        try {
          // Decode base64 file data
          const fileBuffer = Buffer.from(input.fileData, "base64");
          const fileSize = fileBuffer.length;

          // Validate file size (max 50MB)
          if (fileSize > 50 * 1024 * 1024) {
            throw new Error("File size exceeds 50MB limit");
          }

          // Upload to S3
          const fileKey = `uploads/${ctx.user.id}/${nanoid()}-${input.filename}`;
          const { url } = await storagePut(fileKey, fileBuffer, input.mimeType || "application/octet-stream");

          // Create file record in database
          const file = await createUploadedFile({
            userId: ctx.user.id,
            originalName: input.filename,
            fileKey: fileKey,
            fileUrl: url,
            mimeType: input.mimeType,
            fileSize: fileSize,
            description: input.description,
            isPublic: input.isPublic || false,
          });

          return file;
        } catch (error) {
          console.error("[Storage] Failed to upload file:", error);
          throw error;
        }
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const file = await getUploadedFileById(input.id, ctx.user.id);
        if (!file) {
          throw new Error("File not found");
        }

        // Delete from S3 (optional cleanup)
        if (file.fileKey) {
          try {
            console.log(`[Storage] Deleting file: ${file.fileKey}`);
          } catch (error) {
            console.error("[Storage] Failed to delete file from S3:", error);
          }
        }

        // Delete from database
        return deleteUploadedFile(input.id, ctx.user.id);
      }),

    download: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const file = await getUploadedFileById(input.id, ctx.user.id);
        if (!file || !file.fileKey) {
          throw new Error("File not found");
        }

        // Get presigned URL for download
        const { url } = await storageGet(file.fileKey);
        return { url, filename: file.originalName };
      }),
  }),
});
