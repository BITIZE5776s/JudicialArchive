import { 
  type User, 
  type InsertUser, 
  type Block, 
  type InsertBlock,
  type Row,
  type InsertRow,
  type Section,
  type InsertSection,
  type Document,
  type InsertDocument,
  type Paper,
  type InsertPaper,
  type DocumentWithDetails,
  type DashboardStats
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: string): Promise<boolean>;

  // Block methods
  getAllBlocks(): Promise<Block[]>;
  getBlock(id: string): Promise<Block | undefined>;
  createBlock(block: InsertBlock): Promise<Block>;

  // Row methods
  getRowsByBlock(blockId: string): Promise<Row[]>;
  createRow(row: InsertRow): Promise<Row>;

  // Section methods
  getSectionsByRow(rowId: string): Promise<Section[]>;
  createSection(section: InsertSection): Promise<Section>;

  // Document methods
  getAllDocuments(): Promise<DocumentWithDetails[]>;
  getDocument(id: string): Promise<DocumentWithDetails | undefined>;
  getDocumentsBySection(sectionId: string): Promise<DocumentWithDetails[]>;
  createDocument(document: InsertDocument): Promise<Document>;
  updateDocument(id: string, document: Partial<InsertDocument>): Promise<Document | undefined>;
  deleteDocument(id: string): Promise<boolean>;
  searchDocuments(query: string): Promise<DocumentWithDetails[]>;
  filterDocuments(filters: {
    blockId?: string;
    rowId?: string;
    sectionId?: string;
    category?: string;
    status?: string;
  }): Promise<DocumentWithDetails[]>;

  // Paper methods
  getPapersByDocument(documentId: string): Promise<Paper[]>;
  createPaper(paper: InsertPaper): Promise<Paper>;
  updatePaper(id: string, paper: Partial<InsertPaper>): Promise<Paper | undefined>;
  deletePaper(id: string): Promise<boolean>;

  // Dashboard methods
  getDashboardStats(): Promise<DashboardStats>;
  getRecentDocuments(limit?: number): Promise<DocumentWithDetails[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private blocks: Map<string, Block>;
  private rows: Map<string, Row>;
  private sections: Map<string, Section>;
  private documents: Map<string, Document>;
  private papers: Map<string, Paper>;

  constructor() {
    this.users = new Map();
    this.blocks = new Map();
    this.rows = new Map();
    this.sections = new Map();
    this.documents = new Map();
    this.papers = new Map();
    
    this.initializeTestData();
  }

  private initializeTestData() {
    // Create admin user
    const adminId = randomUUID();
    const admin: User = {
      id: adminId,
      username: "admin",
      password: "admin123", // In real app, this would be hashed
      email: "admin@cour-appel.ma",
      fullName: "المسؤول الرئيسي",
      role: "admin",
      isActive: true,
      createdAt: new Date(),
    };
    this.users.set(adminId, admin);

    // Create archivist user
    const archivistId = randomUUID();
    const archivist: User = {
      id: archivistId,
      username: "archivist",
      password: "arch123",
      email: "archivist@cour-appel.ma",
      fullName: "أمينة بنعلي",
      role: "archivist",
      isActive: true,
      createdAt: new Date(),
    };
    this.users.set(archivistId, archivist);

    // Create blocks A through J
    const blockLabels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
    const blockIds: string[] = [];
    
    blockLabels.forEach(label => {
      const blockId = randomUUID();
      const block: Block = {
        id: blockId,
        label,
        createdAt: new Date(),
      };
      this.blocks.set(blockId, block);
      blockIds.push(blockId);

      // Create 3 rows per block
      [1, 2, 3].forEach(rowNum => {
        const rowId = randomUUID();
        const row: Row = {
          id: rowId,
          blockId,
          label: rowNum.toString(),
          createdAt: new Date(),
        };
        this.rows.set(rowId, row);

        // Create 4 sections per row
        [1, 2, 3, 4].forEach(sectionNum => {
          const sectionId = randomUUID();
          const section: Section = {
            id: sectionId,
            rowId,
            label: sectionNum.toString(),
            createdAt: new Date(),
          };
          this.sections.set(sectionId, section);

          // Create some documents for each section
          if (Math.random() > 0.3) { // 70% chance of having documents
            const numDocs = Math.floor(Math.random() * 3) + 1; // 1-3 documents
            
            for (let docNum = 1; docNum <= numDocs; docNum++) {
              const documentId = randomUUID();
              const categories = ['قانونية', 'مالية', 'إدارية', 'مدنية', 'جنائية', 'تجارية', 'أسرية'];
              const statuses = ['نشط', 'مؤرشف', 'معلق'];
              const titles = [
                'حكم في القضية رقم',
                'محضر جلسة استماع',
                'وثائق مبررة للعقد التجاري',
                'طلب طلاق - ملف عائلي',
                'قرار استئناف',
                'شكوى جنائية'
              ];
              
              const document: Document = {
                id: documentId,
                sectionId,
                reference: `${label}.${rowNum}.${sectionNum}.${docNum}`,
                title: `${titles[Math.floor(Math.random() * titles.length)]} ${label}.${rowNum}.${sectionNum}.${docNum}`,
                category: categories[Math.floor(Math.random() * categories.length)],
                metadata: {
                  priority: Math.random() > 0.5 ? 'عالية' : 'متوسطة',
                  court: 'محكمة الاستئناف بالرباط'
                },
                status: statuses[Math.floor(Math.random() * statuses.length)],
                createdBy: Math.random() > 0.5 ? adminId : archivistId,
                createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Last 30 days
                updatedAt: new Date(),
              };
              this.documents.set(documentId, document);

              // Create 2-5 papers for each document
              const numPapers = Math.floor(Math.random() * 4) + 2;
              for (let paperNum = 1; paperNum <= numPapers; paperNum++) {
                const paperId = randomUUID();
                const paperTitles = [
                  'الوثيقة الأساسية',
                  'مرفقات القضية',
                  'شهادات الشهود',
                  'التقارير الطبية',
                  'المراسلات القانونية'
                ];
                
                const paper: Paper = {
                  id: paperId,
                  documentId,
                  title: `${paperTitles[Math.floor(Math.random() * paperTitles.length)]} ${paperNum}`,
                  content: 'محتوى الوثيقة...',
                  attachmentUrl: `/uploads/${documentId}_${paperNum}.pdf`,
                  fileType: ['pdf', 'doc', 'image'][Math.floor(Math.random() * 3)],
                  fileSize: Math.floor(Math.random() * 5000000) + 100000, // 100KB to 5MB
                  createdAt: new Date(),
                };
                this.papers.set(paperId, paper);
              }
            }
          }
        });
      });
    });
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      role: "viewer",
      isActive: true,
      ...insertUser, 
      id,
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async updateUser(id: string, updateData: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updateData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async deleteUser(id: string): Promise<boolean> {
    return this.users.delete(id);
  }

  // Block methods
  async getAllBlocks(): Promise<Block[]> {
    return Array.from(this.blocks.values()).sort((a, b) => a.label.localeCompare(b.label));
  }

  async getBlock(id: string): Promise<Block | undefined> {
    return this.blocks.get(id);
  }

  async createBlock(insertBlock: InsertBlock): Promise<Block> {
    const id = randomUUID();
    const block: Block = {
      ...insertBlock,
      id,
      createdAt: new Date()
    };
    this.blocks.set(id, block);
    return block;
  }

  // Row methods
  async getRowsByBlock(blockId: string): Promise<Row[]> {
    return Array.from(this.rows.values())
      .filter(row => row.blockId === blockId)
      .sort((a, b) => parseInt(a.label) - parseInt(b.label));
  }

  async createRow(insertRow: InsertRow): Promise<Row> {
    const id = randomUUID();
    const row: Row = {
      ...insertRow,
      id,
      createdAt: new Date()
    };
    this.rows.set(id, row);
    return row;
  }

  // Section methods
  async getSectionsByRow(rowId: string): Promise<Section[]> {
    return Array.from(this.sections.values())
      .filter(section => section.rowId === rowId)
      .sort((a, b) => parseInt(a.label) - parseInt(b.label));
  }

  async createSection(insertSection: InsertSection): Promise<Section> {
    const id = randomUUID();
    const section: Section = {
      ...insertSection,
      id,
      createdAt: new Date()
    };
    this.sections.set(id, section);
    return section;
  }

  // Document methods
  private async getDocumentWithDetails(doc: Document): Promise<DocumentWithDetails> {
    const section = this.sections.get(doc.sectionId)!;
    const row = this.rows.get(section.rowId)!;
    const block = this.blocks.get(row.blockId)!;
    const papers = Array.from(this.papers.values()).filter(p => p.documentId === doc.id);
    const creator = this.users.get(doc.createdBy)!;

    return {
      ...doc,
      block,
      row,
      section,
      papers,
      creator
    };
  }

  async getAllDocuments(): Promise<DocumentWithDetails[]> {
    const docs = Array.from(this.documents.values());
    const documentsWithDetails = await Promise.all(
      docs.map(doc => this.getDocumentWithDetails(doc))
    );
    return documentsWithDetails.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getDocument(id: string): Promise<DocumentWithDetails | undefined> {
    const doc = this.documents.get(id);
    if (!doc) return undefined;
    return this.getDocumentWithDetails(doc);
  }

  async getDocumentsBySection(sectionId: string): Promise<DocumentWithDetails[]> {
    const docs = Array.from(this.documents.values()).filter(doc => doc.sectionId === sectionId);
    return Promise.all(docs.map(doc => this.getDocumentWithDetails(doc)));
  }

  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const id = randomUUID();
    
    // Generate reference
    const section = this.sections.get(insertDocument.sectionId)!;
    const row = this.rows.get(section.rowId)!;
    const block = this.blocks.get(row.blockId)!;
    
    // Count existing documents in this section
    const existingDocs = Array.from(this.documents.values())
      .filter(doc => doc.sectionId === insertDocument.sectionId);
    const nextNumber = existingDocs.length + 1;
    
    const reference = `${block.label}.${row.label}.${section.label}.${nextNumber}`;
    
    const document: Document = {
      status: "active",
      metadata: null,
      ...insertDocument,
      id,
      reference,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.documents.set(id, document);
    return document;
  }

  async updateDocument(id: string, updateData: Partial<InsertDocument>): Promise<Document | undefined> {
    const doc = this.documents.get(id);
    if (!doc) return undefined;
    
    const updatedDoc = { 
      ...doc, 
      ...updateData,
      updatedAt: new Date()
    };
    this.documents.set(id, updatedDoc);
    return updatedDoc;
  }

  async deleteDocument(id: string): Promise<boolean> {
    // Also delete associated papers
    const papers = Array.from(this.papers.values()).filter(p => p.documentId === id);
    papers.forEach(paper => this.papers.delete(paper.id));
    
    return this.documents.delete(id);
  }

  async searchDocuments(query: string): Promise<DocumentWithDetails[]> {
    const docs = Array.from(this.documents.values()).filter(doc => 
      doc.title.toLowerCase().includes(query.toLowerCase()) ||
      doc.reference.toLowerCase().includes(query.toLowerCase()) ||
      doc.category.toLowerCase().includes(query.toLowerCase())
    );
    return Promise.all(docs.map(doc => this.getDocumentWithDetails(doc)));
  }

  async filterDocuments(filters: {
    blockId?: string;
    rowId?: string;
    sectionId?: string;
    category?: string;
    status?: string;
  }): Promise<DocumentWithDetails[]> {
    let docs = Array.from(this.documents.values());

    if (filters.sectionId) {
      docs = docs.filter(doc => doc.sectionId === filters.sectionId);
    } else if (filters.rowId) {
      const sections = Array.from(this.sections.values()).filter(s => s.rowId === filters.rowId);
      const sectionIds = sections.map(s => s.id);
      docs = docs.filter(doc => sectionIds.includes(doc.sectionId));
    } else if (filters.blockId) {
      const rows = Array.from(this.rows.values()).filter(r => r.blockId === filters.blockId);
      const rowIds = rows.map(r => r.id);
      const sections = Array.from(this.sections.values()).filter(s => rowIds.includes(s.rowId));
      const sectionIds = sections.map(s => s.id);
      docs = docs.filter(doc => sectionIds.includes(doc.sectionId));
    }

    if (filters.category) {
      docs = docs.filter(doc => doc.category === filters.category);
    }

    if (filters.status) {
      docs = docs.filter(doc => doc.status === filters.status);
    }

    return Promise.all(docs.map(doc => this.getDocumentWithDetails(doc)));
  }

  // Paper methods
  async getPapersByDocument(documentId: string): Promise<Paper[]> {
    return Array.from(this.papers.values())
      .filter(paper => paper.documentId === documentId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async createPaper(insertPaper: InsertPaper): Promise<Paper> {
    const id = randomUUID();
    const paper: Paper = {
      content: null,
      attachmentUrl: null,
      fileType: null,
      fileSize: null,
      ...insertPaper,
      id,
      createdAt: new Date()
    };
    this.papers.set(id, paper);
    return paper;
  }

  async updatePaper(id: string, updateData: Partial<InsertPaper>): Promise<Paper | undefined> {
    const paper = this.papers.get(id);
    if (!paper) return undefined;
    
    const updatedPaper = { ...paper, ...updateData };
    this.papers.set(id, updatedPaper);
    return updatedPaper;
  }

  async deletePaper(id: string): Promise<boolean> {
    return this.papers.delete(id);
  }

  // Dashboard methods
  async getDashboardStats(): Promise<DashboardStats> {
    const allDocs = Array.from(this.documents.values());
    
    return {
      totalCases: allDocs.length,
      processedDocs: allDocs.filter(doc => doc.status === 'نشط').length,
      pendingDocs: allDocs.filter(doc => doc.status === 'معلق').length,
      archivedCases: allDocs.filter(doc => doc.status === 'مؤرشف').length,
    };
  }

  async getRecentDocuments(limit: number = 10): Promise<DocumentWithDetails[]> {
    const docs = Array.from(this.documents.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
    
    return Promise.all(docs.map(doc => this.getDocumentWithDetails(doc)));
  }
}

export const storage = new MemStorage();
