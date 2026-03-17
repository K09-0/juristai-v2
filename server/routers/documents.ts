import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { invokeLLM } from "../_core/llm";
import { storagePut } from "../storage";
import { getDb } from "../db";
import { documents, InsertDocument } from "../../drizzle/schema";

const DocumentTypeEnum = z.enum([
  "исковое_заявление",
  "претензия",
  "договор",
  "другое",
]);

const DocumentStyleEnum = z.enum([
  "формальный",
  "нейтральный",
  "агрессивный",
  "защитный",
]);

const DocumentFormatEnum = z.enum(["pdf", "docx", "txt"]);

export const documentsRouter = router({
  generate: protectedProcedure
    .input(
      z.object({
        type: DocumentTypeEnum,
        title: z.string().min(1, "Название документа обязательно"),
        content: z.string().min(10, "Содержание должно быть не менее 10 символов"),
        style: DocumentStyleEnum.default("формальный"),
        format: DocumentFormatEnum.default("pdf"),
        language: z.enum(["ru", "kk"]).default("ru"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // Генерируем документ с помощью LLM
        const styleDescriptions: Record<string, string> = {
          формальный: "Используй официальный, деловой тон. Соблюдай все юридические формальности.",
          нейтральный: "Используй нейтральный, объективный тон. Избегай эмоций.",
          агрессивный: "Используй твердый, решительный тон. Четко выражай требования.",
          защитный: "Используй защитный тон. Аргументируй позицию доказательствами.",
        };

        const typeDescriptions: Record<string, string> = {
          исковое_заявление:
            "Создай исковое заявление в суд. Включи: описание ситуации, требования, основания, доказательства.",
          претензия:
            "Создай претензию к контрагенту. Включи: описание проблемы, требования, сроки, последствия.",
          договор:
            "Создай проект договора. Включи: предмет договора, обязательства сторон, ответственность, сроки.",
          другое: "Создай юридический документ на основе предоставленного содержания.",
        };

        const prompt = `Ты опытный юридический консультант. ${styleDescriptions[input.style]}

${typeDescriptions[input.type]}

Исходные данные:
${input.content}

Создай профессиональный юридический документ. Ответ на ${input.language === "kk" ? "казахском" : "русском"} языке.`;

        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content:
                "Ты опытный юридический консультант с 20-летним опытом. Создавай профессиональные юридические документы.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
        });

        const llmContent = response.choices[0]?.message?.content;
        let generatedContent = '';
        if (typeof llmContent === 'string') {
          generatedContent = llmContent;
        } else if (Array.isArray(llmContent)) {
          generatedContent = llmContent
            .filter((c) => c.type === 'text')
            .map((c) => (c.type === 'text' ? c.text : ''))
            .join('');
        }

        // Сохраняем документ в БД
        const db = await getDb();
        if (!db) {
          throw new Error("Database connection failed");
        }

        const fileSize = Buffer.byteLength(generatedContent, "utf8");
        const fileKey = `documents/${ctx.user.id}/${Date.now()}-${input.type}.${input.format === "pdf" ? "pdf" : input.format === "docx" ? "docx" : "txt"}`;

        // Загружаем в S3
        const { url: fileUrl } = await storagePut(
          fileKey,
          generatedContent,
          input.format === "pdf" ? "application/pdf" : "text/plain"
        );

        // Сохраняем метаданные в БД
        const docData: InsertDocument = {
          userId: ctx.user.id,
          title: input.title,
          type: input.type,
          style: input.style,
          content: generatedContent,
          fileUrl,
          fileKey,
          format: input.format,
          fileSize: fileSize as any,
        };
        
        await db.insert(documents).values(docData);

        return {
          success: true,
          document: {
            id: Date.now(),
            title: input.title,
            type: input.type,
            fileUrl,
            format: input.format,
            fileSize,
            createdAt: new Date(),
          },
        };
      } catch (error) {
        console.error("[Document Generation Error]", error);
        return {
          success: false,
          error: "Ошибка при генерации документа",
          document: null,
        };
      }
    }),

  preview: protectedProcedure
    .input(
      z.object({
        type: DocumentTypeEnum,
        title: z.string().min(1),
        content: z.string().min(10),
        style: DocumentStyleEnum.default("формальный"),
        language: z.enum(["ru", "kk"]).default("ru"),
      })
    )
    .query(async ({ input }) => {
      try {
        const styleDescriptions: Record<string, string> = {
          формальный: "Используй официальный, деловой тон.",
          нейтральный: "Используй нейтральный, объективный тон.",
          агрессивный: "Используй твердый, решительный тон.",
          защитный: "Используй защитный тон.",
        };

        const typeDescriptions: Record<string, string> = {
          исковое_заявление: "Создай краткий пример искового заявления.",
          претензия: "Создай краткий пример претензии.",
          договор: "Создай краткий пример договора.",
          другое: "Создай краткий пример документа.",
        };

        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: "Ты юридический консультант. Создавай краткие примеры документов.",
            },
            {
              role: "user",
              content: `${styleDescriptions[input.style]} ${typeDescriptions[input.type]} На основе: ${input.content}`,
            },
          ],
        });

        const content = response.choices[0]?.message?.content;
        let previewText = '';
        if (typeof content === 'string') {
          previewText = content;
        } else if (Array.isArray(content)) {
          previewText = content
            .filter((c) => c.type === 'text')
            .map((c) => (c.type === 'text' ? c.text : ''))
            .join('');
        }

        return {
          success: true,
          preview: previewText.substring(0, 500), // Первые 500 символов
          language: input.language,
        };
      } catch (error) {
        console.error("[Document Preview Error]", error);
        return {
          success: false,
          error: "Ошибка при создании предпросмотра",
          preview: "",
          language: input.language,
        };
      }
    }),

  getTemplates: protectedProcedure
    .input(
      z.object({
        language: z.enum(["ru", "kk"]).default("ru"),
      })
    )
    .query(({ input }) => {
      const templates = [
        {
          id: "claim",
          type: "исковое_заявление",
          title: input.language === "kk" ? "Сот ісеріне арызалама" : "Исковое заявление",
          description:
            input.language === "kk"
              ? "Сотқа қаржылық немесе басқа да талап ұсыну"
              : "Подача исковых требований в суд",
          fields: ["defendant", "claim_amount", "reason", "evidence"],
        },
        {
          id: "claim_letter",
          type: "претензия",
          title: input.language === "kk" ? "Талап хаты" : "Претензия",
          description:
            input.language === "kk"
              ? "Контрагентке талап жіберу"
              : "Отправка требований контрагенту",
          fields: ["recipient", "problem", "requirements", "deadline"],
        },
        {
          id: "contract",
          type: "договор",
          title: input.language === "kk" ? "Келісім-шарт" : "Договор",
          description:
            input.language === "kk"
              ? "Ұйымдар арасындағы келісім-шартты құру"
              : "Создание договора между сторонами",
          fields: ["parties", "subject", "obligations", "terms"],
        },
      ];

      return {
        success: true,
        templates,
        language: input.language,
      };
    }),
});
