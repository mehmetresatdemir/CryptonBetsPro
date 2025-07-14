import { Router, Request, Response } from 'express';
import { db } from '../db';
import { staffMembers, adminUsers, systemLogs } from '@shared/schema';
import { eq, desc, and, like, or } from 'drizzle-orm';
import { requireAdminAuth } from '../utils/auth';
import { z } from 'zod';

const router = Router();

// Staff üye oluşturma şeması
const createStaffSchema = z.object({
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  position: z.string().min(2).max(100),
  department: z.string().min(2).max(50),
  hireDate: z.string().transform(str => new Date(str)),
  salary: z.number().optional(),
  workingHours: z.string().optional(),
  status: z.enum(['active', 'inactive']).default('active'),
  notes: z.string().optional()
});

// Staff üye güncelleme şeması
const updateStaffSchema = z.object({
  firstName: z.string().min(2).max(50).optional(),
  lastName: z.string().min(2).max(50).optional(),
  position: z.string().min(2).max(100).optional(),
  department: z.string().min(2).max(50).optional(),
  hireDate: z.string().transform(str => new Date(str)).optional(),
  salary: z.number().optional(),
  workingHours: z.string().optional(),
  status: z.enum(['active', 'inactive']).optional(),
  notes: z.string().optional()
});

// Tüm staff üyelerini listeleme
router.get('/', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;
    const department = req.query.department as string;
    const status = req.query.status as string;
    const offset = (page - 1) * limit;

    let whereConditions = [];

    if (search) {
      whereConditions.push(
        or(
          like(staffMembers.firstName, `%${search}%`),
          like(staffMembers.lastName, `%${search}%`),
          like(staffMembers.position, `%${search}%`)
        )
      );
    }

    if (department) {
      whereConditions.push(eq(staffMembers.department, department));
    }

    if (status) {
      whereConditions.push(eq(staffMembers.status, status));
    }

    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

    const [staff, totalCount] = await Promise.all([
      db.select({
        id: staffMembers.id,
        firstName: staffMembers.firstName,
        lastName: staffMembers.lastName,
        position: staffMembers.position,
        department: staffMembers.department,
        hireDate: staffMembers.hireDate,
        salary: staffMembers.salary,
        workingHours: staffMembers.workingHours,
        status: staffMembers.status,
        notes: staffMembers.notes,
        createdAt: staffMembers.createdAt,
        updatedAt: staffMembers.updatedAt
      })
      .from(staffMembers)
      .where(whereClause)
      .orderBy(desc(staffMembers.createdAt))
      .limit(limit)
      .offset(offset),

      db.select({ count: staffMembers.id })
        .from(staffMembers)
        .where(whereClause)
        .then(result => result.length)
    ]);

    // Log this access
    await db.insert(systemLogs).values({
      level: 'info',
      category: 'admin',
      message: 'Staff members list accessed',
      source: 'admin-staff-api',
      adminUserId: 1,
      ipAddress: req.ip,
      metadata: JSON.stringify({ page, limit, search, department, status })
    });

    res.json({
      staff,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    });

  } catch (error) {
    console.error('Staff list error:', error);
    res.status(500).json({ error: 'Personel listesi alınamadı' });
  }
});

// Tek staff üye detayı
router.get('/:id', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const staffId = parseInt(req.params.id);

    const staff = await db.select()
      .from(staffMembers)
      .where(eq(staffMembers.id, staffId))
      .limit(1);

    if (staff.length === 0) {
      return res.status(404).json({ error: 'Personel bulunamadı' });
    }

    res.json(staff[0]);

  } catch (error) {
    console.error('Staff detail error:', error);
    res.status(500).json({ error: 'Personel detayı alınamadı' });
  }
});

// Yeni staff üye oluşturma
router.post('/', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const validatedData = createStaffSchema.parse(req.body);
    
    // Yeni staff üye oluştur
    const newStaff = await db.insert(staffMembers).values({
      firstName: validatedData.firstName,
      lastName: validatedData.lastName,
      position: validatedData.position,
      department: validatedData.department,
      hireDate: validatedData.hireDate,
      salary: validatedData.salary?.toString(),
      workingHours: validatedData.workingHours,
      status: validatedData.status,
      notes: validatedData.notes,
      adminUserId: 1
    }).returning();

    // Log this action
    await db.insert(systemLogs).values({
      level: 'info',
      category: 'admin',
      message: `New staff member created: ${validatedData.firstName} ${validatedData.lastName}`,
      source: 'admin-staff-api',
      adminUserId: 1,
      ipAddress: req.ip,
      metadata: JSON.stringify({ 
        newStaffId: newStaff[0].id,
        position: validatedData.position,
        department: validatedData.department
      })
    });

    res.status(201).json(newStaff[0]);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Geçersiz veri',
        details: error.errors 
      });
    }
    
    console.error('Create staff error:', error);
    res.status(500).json({ error: 'Personel oluşturulamadı' });
  }
});

// Staff üye güncelleme
router.put('/:id', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const staffId = parseInt(req.params.id);
    const validatedData = updateStaffSchema.parse(req.body);

    // Mevcut staff kontrolü
    const existingStaff = await db.select()
      .from(staffMembers)
      .where(eq(staffMembers.id, staffId))
      .limit(1);

    if (existingStaff.length === 0) {
      return res.status(404).json({ error: 'Personel bulunamadı' });
    }

    // Staff güncelle
    const updatedStaff = await db.update(staffMembers)
      .set({
        ...validatedData,
        salary: validatedData.salary?.toString(),
        updatedAt: new Date()
      })
      .where(eq(staffMembers.id, staffId))
      .returning();

    // Log this action
    await db.insert(systemLogs).values({
      level: 'info',
      category: 'admin',
      message: `Staff member updated: ${existingStaff[0].firstName} ${existingStaff[0].lastName}`,
      source: 'admin-staff-api',
      adminUserId: 1,
      ipAddress: req.ip,
      metadata: JSON.stringify({ 
        updatedStaffId: staffId,
        changes: validatedData 
      })
    });

    res.json(updatedStaff[0]);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Geçersiz veri',
        details: error.errors 
      });
    }
    
    console.error('Update staff error:', error);
    res.status(500).json({ error: 'Personel güncellenemedi' });
  }
});

// Staff üye silme
router.delete('/:id', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const staffId = parseInt(req.params.id);

    // Mevcut staff kontrolü
    const existingStaff = await db.select()
      .from(staffMembers)
      .where(eq(staffMembers.id, staffId))
      .limit(1);

    if (existingStaff.length === 0) {
      return res.status(404).json({ error: 'Personel bulunamadı' });
    }

    // Staff sil
    await db.delete(staffMembers)
      .where(eq(staffMembers.id, staffId));

    // Log this action
    await db.insert(systemLogs).values({
      level: 'warning',
      category: 'admin',
      message: `Staff member deleted: ${existingStaff[0].firstName} ${existingStaff[0].lastName}`,
      source: 'admin-staff-api',
      adminUserId: 1,
      ipAddress: req.ip,
      metadata: JSON.stringify({ 
        deletedStaffId: staffId,
        deletedStaffName: `${existingStaff[0].firstName} ${existingStaff[0].lastName}`
      })
    });

    res.json({ message: 'Personel başarıyla silindi' });

  } catch (error) {
    console.error('Delete staff error:', error);
    res.status(500).json({ error: 'Personel silinemedi' });
  }
});

// Departman listesi
router.get('/departments/list', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const departments = await db.selectDistinct({ 
      department: staffMembers.department 
    }).from(staffMembers);

    res.json(departments.map(d => d.department));

  } catch (error) {
    console.error('Departments list error:', error);
    res.status(500).json({ error: 'Departman listesi alınamadı' });
  }
});

export default router;