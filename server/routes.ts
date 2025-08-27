import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { loginSchema, insertUserSchema, insertDocumentSchema, insertPaperSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = loginSchema.parse(req.body);
      
      const user = await storage.getUserByUsername(username);
      if (!user || user.password !== password || !user.isActive) {
        return res.status(401).json({ message: "بيانات الدخول غير صحيحة" });
      }

      // In a real app, you'd create a JWT token here
      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      res.status(400).json({ message: "بيانات غير صالحة" });
    }
  });

  app.post("/api/auth/logout", async (req, res) => {
    res.json({ message: "تم تسجيل الخروج بنجاح" });
  });

  // User management routes
  app.get("/api/users", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const usersWithoutPasswords = users.map(({ password, ...user }) => user);
      res.json(usersWithoutPasswords);
    } catch (error) {
      res.status(500).json({ message: "خطأ في جلب المستخدمين" });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      const { password, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      res.status(400).json({ message: "بيانات المستخدم غير صالحة" });
    }
  });

  app.put("/api/users/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const userData = insertUserSchema.partial().parse(req.body);
      const user = await storage.updateUser(id, userData);
      
      if (!user) {
        return res.status(404).json({ message: "المستخدم غير موجود" });
      }

      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(400).json({ message: "بيانات غير صالحة" });
    }
  });

  app.delete("/api/users/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteUser(id);
      
      if (!success) {
        return res.status(404).json({ message: "المستخدم غير موجود" });
      }

      res.json({ message: "تم حذف المستخدم بنجاح" });
    } catch (error) {
      res.status(500).json({ message: "خطأ في حذف المستخدم" });
    }
  });

  // Block routes
  app.get("/api/blocks", async (req, res) => {
    try {
      const blocks = await storage.getAllBlocks();
      res.json(blocks);
    } catch (error) {
      res.status(500).json({ message: "خطأ في جلب الكتل" });
    }
  });

  app.get("/api/blocks/:id/rows", async (req, res) => {
    try {
      const { id } = req.params;
      const rows = await storage.getRowsByBlock(id);
      res.json(rows);
    } catch (error) {
      res.status(500).json({ message: "خطأ في جلب الصفوف" });
    }
  });

  app.get("/api/rows/:id/sections", async (req, res) => {
    try {
      const { id } = req.params;
      const sections = await storage.getSectionsByRow(id);
      res.json(sections);
    } catch (error) {
      res.status(500).json({ message: "خطأ في جلب الأقسام" });
    }
  });

  // Document routes
  app.get("/api/documents", async (req, res) => {
    try {
      const { search, blockId, rowId, sectionId, category, status } = req.query;
      
      let documents;
      
      if (search) {
        documents = await storage.searchDocuments(search as string);
      } else if (blockId || rowId || sectionId || category || status) {
        documents = await storage.filterDocuments({
          blockId: blockId as string,
          rowId: rowId as string,
          sectionId: sectionId as string,
          category: category as string,
          status: status as string,
        });
      } else {
        documents = await storage.getAllDocuments();
      }
      
      res.json(documents);
    } catch (error) {
      res.status(500).json({ message: "خطأ في جلب الوثائق" });
    }
  });

  app.get("/api/documents/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const document = await storage.getDocument(id);
      
      if (!document) {
        return res.status(404).json({ message: "الوثيقة غير موجودة" });
      }
      
      res.json(document);
    } catch (error) {
      res.status(500).json({ message: "خطأ في جلب الوثيقة" });
    }
  });

  app.post("/api/documents", async (req, res) => {
    try {
      const documentData = insertDocumentSchema.parse(req.body);
      const document = await storage.createDocument(documentData);
      res.status(201).json(document);
    } catch (error) {
      res.status(400).json({ message: "بيانات الوثيقة غير صالحة" });
    }
  });

  app.put("/api/documents/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const documentData = insertDocumentSchema.partial().parse(req.body);
      const document = await storage.updateDocument(id, documentData);
      
      if (!document) {
        return res.status(404).json({ message: "الوثيقة غير موجودة" });
      }
      
      res.json(document);
    } catch (error) {
      res.status(400).json({ message: "بيانات غير صالحة" });
    }
  });

  app.delete("/api/documents/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteDocument(id);
      
      if (!success) {
        return res.status(404).json({ message: "الوثيقة غير موجودة" });
      }
      
      res.json({ message: "تم حذف الوثيقة بنجاح" });
    } catch (error) {
      res.status(500).json({ message: "خطأ في حذف الوثيقة" });
    }
  });

  // Paper routes
  app.get("/api/documents/:documentId/papers", async (req, res) => {
    try {
      const { documentId } = req.params;
      const papers = await storage.getPapersByDocument(documentId);
      res.json(papers);
    } catch (error) {
      res.status(500).json({ message: "خطأ في جلب الأوراق" });
    }
  });

  app.post("/api/papers", async (req, res) => {
    try {
      const paperData = insertPaperSchema.parse(req.body);
      const paper = await storage.createPaper(paperData);
      res.status(201).json(paper);
    } catch (error) {
      res.status(400).json({ message: "بيانات الورقة غير صالحة" });
    }
  });

  app.put("/api/papers/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const paperData = insertPaperSchema.partial().parse(req.body);
      const paper = await storage.updatePaper(id, paperData);
      
      if (!paper) {
        return res.status(404).json({ message: "الورقة غير موجودة" });
      }
      
      res.json(paper);
    } catch (error) {
      res.status(400).json({ message: "بيانات غير صالحة" });
    }
  });

  app.delete("/api/papers/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deletePaper(id);
      
      if (!success) {
        return res.status(404).json({ message: "الورقة غير موجودة" });
      }
      
      res.json({ message: "تم حذف الورقة بنجاح" });
    } catch (error) {
      res.status(500).json({ message: "خطأ في حذف الورقة" });
    }
  });

  // Dashboard routes
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const { userId } = req.query;
      const stats = await storage.getDashboardStats(userId as string);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "خطأ في جلب الإحصائيات" });
    }
  });

  app.get("/api/dashboard/recent-documents", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const { userId } = req.query;
      const documents = await storage.getRecentDocuments(limit, userId as string);
      res.json(documents);
    } catch (error) {
      res.status(500).json({ message: "خطأ في جلب الوثائق الحديثة" });
    }
  });

  app.get("/api/dashboard/user-progress", async (req, res) => {
    try {
      const { userId } = req.query;
      if (!userId) {
        return res.status(400).json({ message: "معرف المستخدم مطلوب" });
      }
      const progress = await storage.getUserProgress(userId as string);
      res.json(progress);
    } catch (error) {
      res.status(500).json({ message: "خطأ في جلب تقدم المستخدم" });
    }
  });

  // Profile route
  app.get("/api/profile", async (req, res) => {
    try {
      const { userId } = req.query;
      if (!userId) {
        return res.status(400).json({ message: "معرف المستخدم مطلوب" });
      }
      
      const user = await storage.getUser(userId as string);
      if (!user) {
        return res.status(404).json({ message: "المستخدم غير موجود" });
      }
      
      const userProgress = await storage.getUserProgress(userId as string);
      const userDocs = await storage.getRecentDocuments(50, userId as string);
      
      // Generate activity calendar data
      const activityCalendar: { [date: string]: number } = {};
      const today = new Date();
      const threeMonthsAgo = new Date(today);
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      
      userDocs.forEach(doc => {
        const dateStr = doc.createdAt.toISOString().split('T')[0];
        activityCalendar[dateStr] = (activityCalendar[dateStr] || 0) + 1;
      });
      
      // Generate category progress
      const categoryProgress: { [category: string]: number } = {};
      const categories = ['legal', 'financial', 'administrative', 'civil', 'criminal', 'commercial', 'family'];
      categories.forEach(category => {
        const categoryDocs = userDocs.filter(doc => doc.category === category);
        const completedDocs = categoryDocs.filter(doc => doc.status === 'active');
        categoryProgress[category] = categoryDocs.length > 0 ? 
          Math.round((completedDocs.length / categoryDocs.length) * 100) : 0;
      });
      
      const recentActivities = userDocs.slice(0, 10).map(doc => ({
        action: 'إنشاء وثيقة',
        document: doc.title,
        date: doc.createdAt.toISOString(),
        category: doc.category
      }));
      
      const { password, ...userWithoutPassword } = user;
      
      const profileData = {
        user: userWithoutPassword,
        statistics: {
          totalDocuments: userProgress.documentsCreated,
          documentsThisMonth: userProgress.documentsThisMonth,
          documentsThisWeek: userProgress.documentsThisWeek,
          averageProcessingTime: userProgress.averageProcessingTime,
          completionRate: Math.round((userProgress.documentsCreated / Math.max(userProgress.documentsCreated + 5, 10)) * 100),
          categoryProgress
        },
        activityCalendar,
        recentActivities
      };
      
      res.json(profileData);
    } catch (error) {
      res.status(500).json({ message: "خطأ في جلب بيانات الملف الشخصي" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
