import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { invokeLLM } from "../_core/llm";

// Казахское законодательство (mock данные для демонстрации)
const LEGISLATION_DB = [
  {
    id: 1,
    title: "Гражданский кодекс РК",
    shortTitle: "ГК РК",
    articles: [
      {
        number: 395,
        title: "Исковая давность",
        text: "Исковая давность - это период времени, в течение которого лицо может защищать свое право в суде путем предъявления иска...",
        date: "2024-01-01",
      },
      {
        number: 396,
        title: "Начало течения исковой давности",
        text: "Исковая давность начинает течь со дня, когда лицо узнало или должно было узнать о нарушении своего права...",
        date: "2024-01-01",
      },
    ],
  },
  {
    id: 2,
    title: "Трудовой кодекс РК",
    shortTitle: "ТК РК",
    articles: [
      {
        number: 1,
        title: "Трудовой договор",
        text: "Трудовой договор - это соглашение между работодателем и работником, в соответствии с которым работник обязуется выполнять работу...",
        date: "2024-01-01",
      },
      {
        number: 2,
        title: "Виды трудовых договоров",
        text: "Трудовые договоры заключаются на неопределенный срок, на определенный срок не более трех лет...",
        date: "2024-01-01",
      },
    ],
  },
  {
    id: 3,
    title: "Кодекс об административных правонарушениях РК",
    shortTitle: "КоАП РК",
    articles: [
      {
        number: 1,
        title: "Общие положения",
        text: "Административное правонарушение - это противоправное, виновное действие или бездействие физического или юридического лица...",
        date: "2024-01-01",
      },
    ],
  },
];

export const ragRouter = router({
  search: publicProcedure
    .input(
      z.object({
        query: z.string().min(1, "Поисковый запрос не может быть пустым"),
        limit: z.number().int().positive().default(10),
        language: z.enum(["ru", "kk"]).default("ru"),
      })
    )
    .query(async ({ input }) => {
      try {
        // Поиск в mock базе законодательства
        const results: Array<{
          id: string;
          title: string;
          article: number;
          text: string;
          law: string;
          relevance: number;
          date: string;
        }> = [];

        const queryLower = input.query.toLowerCase();

        for (const law of LEGISLATION_DB) {
          for (const article of law.articles) {
            const titleMatch = article.title.toLowerCase().includes(queryLower);
            const textMatch = article.text.toLowerCase().includes(queryLower);

            if (titleMatch || textMatch) {
              let relevance = 0;
              if (titleMatch) relevance += 80;
              if (textMatch) relevance += 20;

              results.push({
                id: `${law.id}-${article.number}`,
                title: article.title,
                article: article.number,
                text: article.text,
                law: law.shortTitle,
                relevance: Math.min(relevance, 100),
                date: article.date,
              });
            }
          }
        }

        // Сортировка по релевантности
        results.sort((a, b) => b.relevance - a.relevance);

        return {
          success: true,
          results: results.slice(0, input.limit),
          total: results.length,
          query: input.query,
          language: input.language,
        };
      } catch (error) {
        console.error("[RAG Search Error]", error);
        return {
          success: false,
          error: "Ошибка при поиске",
          results: [],
          total: 0,
          query: input.query,
          language: input.language,
        };
      }
    }),

  analyze: publicProcedure
    .input(
      z.object({
        text: z.string().min(1, "Текст не может быть пустым"),
        language: z.enum(["ru", "kk"]).default("ru"),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Используем LLM для анализа текста
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content:
                "Ты юридический консультант. Анализируй текст и выявляй ключевые юридические аспекты. Ответ на " +
                (input.language === "kk" ? "казахском" : "русском") +
                " языке.",
            },
            {
              role: "user",
              content: `Пожалуйста, проанализируй следующий текст и выяви ключевые юридические аспекты:\n\n${input.text}`,
            },
          ],
        });

        const analysis = response.choices[0]?.message?.content || "";

        return {
          success: true,
          analysis,
          language: input.language,
        };
      } catch (error) {
        console.error("[RAG Analysis Error]", error);
        return {
          success: false,
          error: "Ошибка при анализе текста",
          analysis: "",
          language: input.language,
        };
      }
    }),

  getArticle: publicProcedure
    .input(
      z.object({
        lawId: z.number(),
        articleNumber: z.number(),
        language: z.enum(["ru", "kk"]).default("ru"),
      })
    )
    .query(({ input }) => {
      const law = LEGISLATION_DB.find((l) => l.id === input.lawId);
      if (!law) {
        return {
          success: false,
          error: "Закон не найден",
          article: null,
        };
      }

      const article = law.articles.find((a) => a.number === input.articleNumber);
      if (!article) {
        return {
          success: false,
          error: "Статья не найдена",
          article: null,
        };
      }

      return {
        success: true,
        article: {
          law: law.shortTitle,
          number: article.number,
          title: article.title,
          text: article.text,
          date: article.date,
        },
      };
    }),

  listLaws: publicProcedure
    .input(
      z.object({
        language: z.enum(["ru", "kk"]).default("ru"),
      })
    )
    .query(({ input }) => {
      return {
        success: true,
        laws: LEGISLATION_DB.map((law) => ({
          id: law.id,
          title: law.title,
          shortTitle: law.shortTitle,
          articleCount: law.articles.length,
        })),
        language: input.language,
      };
    }),
});
