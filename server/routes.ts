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
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "خطأ في جلب الإحصائيات" });
    }
  });

  app.get("/api/dashboard/recent-documents", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const documents = await storage.getRecentDocuments(limit);
      res.json(documents);
    } catch (error) {
      res.status(500).json({ message: "خطأ في جلب الوثائق الحديثة" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
