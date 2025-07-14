import { Request, Response } from 'express';
import { db } from '../db.js';
import { users, kycDocuments } from '../../shared/schema.js';
import { eq, desc, like, and, gte, lte, count, sql, or } from 'drizzle-orm';

// Professional Admin KYC API - 100% Authentic PostgreSQL Data
export async function getKycDocuments(req: Request, res: Response) {
  try {
    const {
      page = '1',
      limit = '20',
      search = '',
      status = 'all',
      documentType = 'all',
      sortBy = 'uploadedAt',
      sortOrder = 'desc'
    } = req.query;

    console.log('📋 ADMIN KYC API: Fetching KYC documents...');

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    // Base query conditions
    const conditions = [];
    
    if (search) {
      conditions.push(sql`(file_name ILIKE ${'%' + search + '%'})`);
    }
    
    if (status && status !== 'all') {
      conditions.push(eq(kycDocuments.status, status as string));
    }
    
    if (documentType && documentType !== 'all') {
      conditions.push(sql`(document_type = ${documentType})`);
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    let totalQuery = db.select({ count: count() })
      .from(kycDocuments);
    
    if (whereClause) {
      totalQuery = totalQuery.where(whereClause);
    }
    
    const totalResult = await totalQuery;
    const total = Number(totalResult[0]?.count) || 0;

    // Get documents with basic user data (simplified)
    let documentsQuery = db.select()
    .from(kycDocuments);

    if (whereClause) {
      documentsQuery = documentsQuery.where(whereClause);
    }

    // Apply sorting - use real column names
    if (sortBy === 'uploadedAt') {
      documentsQuery = sortOrder === 'asc' 
        ? documentsQuery.orderBy(kycDocuments.uploadedAt)
        : documentsQuery.orderBy(desc(kycDocuments.uploadedAt));
    } else if (sortBy === 'status') {
      documentsQuery = sortOrder === 'asc'
        ? documentsQuery.orderBy(kycDocuments.status)
        : documentsQuery.orderBy(desc(kycDocuments.status));
    } else if (sortBy === 'type') {
      documentsQuery = sortOrder === 'asc'
        ? documentsQuery.orderBy(kycDocuments.documentType)
        : documentsQuery.orderBy(desc(kycDocuments.documentType));
    }

    const documentsResult = await documentsQuery.limit(limitNum).offset(offset);

    // Get usernames for each document
    const enrichedDocuments = await Promise.all(
      documentsResult.map(async (doc) => {
        const userResult = await db.select({
          username: users.username,
          email: users.email,
          fullName: users.fullName
        })
        .from(users)
        .where(eq(users.id, doc.userId))
        .limit(1);

        const user = userResult[0];

        return {
          id: doc.id,
          userId: doc.userId,
          username: user?.username || 'Bilinmiyor',
          email: user?.email || '',
          fullName: user?.fullName || '',
          type: doc.documentType, // Use real column name
          fileName: doc.fileName || `document_${doc.id}`,
          filePath: doc.filePath,
          fileSize: doc.fileSize || 0,
          mimeType: doc.mimeType || 'application/pdf',
          status: doc.status,
          rejectionReason: null, // Column doesn't exist
          reviewedBy: null, // Column doesn't exist
          uploadedAt: doc.uploadedAt?.toISOString(),
          reviewedAt: doc.reviewedAt?.toISOString(),
          createdAt: doc.uploadedAt?.toISOString(), // Use uploaded_at as created_at
          // File size in human readable format
          fileSizeFormatted: formatFileSize(doc.fileSize || 0),
          // Days since upload
          daysSinceUpload: doc.uploadedAt 
            ? Math.floor((Date.now() - doc.uploadedAt.getTime()) / (1000 * 60 * 60 * 24))
            : 0
        };
      })
    );

    const response = {
      documents: enrichedDocuments,
      _meta: {
        totalCount: total,
        pageCount: Math.ceil(total / limitNum),
        currentPage: pageNum,
        perPage: limitNum
      }
    };

    console.log(`📋 KYC DOCUMENTS COLLECTED: ${documentsResult.length} documents loaded`);
    console.log(`   Total documents: ${total}`);
    console.log(`   Page: ${pageNum}/${Math.ceil(total / limitNum)}`);

    res.json(response);

  } catch (error) {
    console.error('❌ ADMIN KYC API Error:', error);
    res.status(500).json({
      error: 'Failed to fetch KYC documents',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// Get KYC statistics
export async function getKycStats(req: Request, res: Response) {
  try {
    console.log('📊 KYC STATS: Generating KYC statistics...');

    // Basic KYC statistics
    const basicStats = await db.select({
      totalDocuments: count(),
      pendingReview: sql<number>`COUNT(CASE WHEN ${kycDocuments.status} = 'pending' THEN 1 END)`,
      approved: sql<number>`COUNT(CASE WHEN ${kycDocuments.status} = 'approved' THEN 1 END)`,
      rejected: sql<number>`COUNT(CASE WHEN ${kycDocuments.status} = 'rejected' THEN 1 END)`
    }).from(kycDocuments);

    const stats = basicStats[0];
    
    // Document type statistics - use real column name
    const typeStats = await db.select({
      type: kycDocuments.documentType,
      count: count(),
      pending: sql<number>`COUNT(CASE WHEN ${kycDocuments.status} = 'pending' THEN 1 END)`,
      approved: sql<number>`COUNT(CASE WHEN ${kycDocuments.status} = 'approved' THEN 1 END)`,
      rejected: sql<number>`COUNT(CASE WHEN ${kycDocuments.status} = 'rejected' THEN 1 END)`
    })
    .from(kycDocuments)
    .groupBy(kycDocuments.documentType);

    // Recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentActivity = await db.select({
      date: sql<string>`DATE(${kycDocuments.uploadedAt})`,
      count: count(),
      status: kycDocuments.status
    })
    .from(kycDocuments)
    .where(gte(kycDocuments.uploadedAt, sevenDaysAgo))
    .groupBy(sql`DATE(${kycDocuments.uploadedAt})`, kycDocuments.status)
    .orderBy(desc(sql`DATE(${kycDocuments.uploadedAt})`));

    // Users with complete KYC
    const usersWithApprovedDocs = await db.select({
      userId: kycDocuments.userId,
      approvedDocsCount: sql<number>`COUNT(CASE WHEN ${kycDocuments.status} = 'approved' THEN 1 END)`
    })
    .from(kycDocuments)
    .groupBy(kycDocuments.userId)
    .having(sql`COUNT(CASE WHEN ${kycDocuments.status} = 'approved' THEN 1 END) >= 3`);

    const completionRate = stats.totalDocuments > 0 
      ? Math.round((stats.approved / stats.totalDocuments) * 100) 
      : 0;

    const averageReviewTime = await calculateAverageReviewTime();

    const summary = {
      totalDocuments: stats.totalDocuments,
      pendingReview: stats.pendingReview,
      approved: stats.approved,
      rejected: stats.rejected,
      completionRate,
      averageReviewTimeHours: averageReviewTime,
      usersWithCompleteKyc: usersWithApprovedDocs.length,
      typeStatistics: typeStats.map(t => ({
        type: t.type,
        total: Number(t.count),
        pending: Number(t.pending),
        approved: Number(t.approved),
        rejected: Number(t.rejected),
        approvalRate: Number(t.count) > 0 ? Math.round((Number(t.approved) / Number(t.count)) * 100) : 0
      })),
      recentActivity: recentActivity.map(a => ({
        date: a.date,
        count: Number(a.count),
        status: a.status
      }))
    };

    console.log('📊 KYC STATS COMPLETED');
    res.json(summary);

  } catch (error) {
    console.error('❌ KYC STATS Error:', error);
    res.status(500).json({
      error: 'Failed to fetch KYC statistics',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// Update KYC document status
export async function updateKycStatus(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { status, rejectionReason, reviewedBy } = req.body;

    if (!id || !status) {
      return res.status(400).json({ error: 'Document ID and status are required' });
    }

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    const updateData: any = {
      status,
      reviewedAt: new Date(),
      updatedAt: new Date()
    };

    if (reviewedBy) {
      updateData.reviewedBy = reviewedBy;
    }

    if (status === 'rejected' && rejectionReason) {
      updateData.rejectionReason = rejectionReason;
    } else if (status === 'approved') {
      updateData.rejectionReason = null;
    }

    await db.update(kycDocuments)
      .set(updateData)
      .where(eq(kycDocuments.id, parseInt(id)));

    console.log(`📋 KYC STATUS UPDATED: Document ${id} status changed to ${status}`);
    
    res.json({ 
      success: true, 
      message: 'KYC document status updated successfully' 
    });

  } catch (error) {
    console.error('❌ UPDATE KYC STATUS Error:', error);
    res.status(500).json({
      error: 'Failed to update KYC status',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// Get user KYC status
export async function getUserKycStatus(req: Request, res: Response) {
  try {
    const { userId } = req.params;

    console.log(`🔍 KYC USER STATUS: Checking KYC status for user ${userId}`);

    // Get all user documents
    const userDocuments = await db.select({
      id: kycDocuments.id,
      type: kycDocuments.type,
      status: kycDocuments.status,
      fileName: kycDocuments.fileName,
      uploadedAt: kycDocuments.uploadedAt,
      reviewedAt: kycDocuments.reviewedAt,
      rejectionReason: kycDocuments.rejectionReason
    })
    .from(kycDocuments)
    .where(eq(kycDocuments.userId, parseInt(userId)))
    .orderBy(desc(kycDocuments.uploadedAt));

    // Required document types
    const requiredTypes = ['identity', 'address', 'bank'];
    const status = {
      isKycComplete: false,
      completedDocuments: 0,
      totalRequiredDocuments: requiredTypes.length,
      documents: userDocuments,
      missingDocuments: [] as string[],
      approvedDocuments: [] as string[],
      pendingDocuments: [] as string[],
      rejectedDocuments: [] as string[]
    };

    // Analyze document status
    requiredTypes.forEach(type => {
      const typeDocument = userDocuments.find(doc => doc.type === type);
      if (typeDocument) {
        if (typeDocument.status === 'approved') {
          status.completedDocuments++;
          status.approvedDocuments.push(type);
        } else if (typeDocument.status === 'pending') {
          status.pendingDocuments.push(type);
        } else if (typeDocument.status === 'rejected') {
          status.rejectedDocuments.push(type);
          status.missingDocuments.push(type);
        }
      } else {
        status.missingDocuments.push(type);
      }
    });

    status.isKycComplete = status.completedDocuments === status.totalRequiredDocuments;

    console.log(`📊 KYC USER STATUS: User ${userId} - Complete: ${status.isKycComplete}, Approved: ${status.completedDocuments}/${status.totalRequiredDocuments}`);
    
    res.json(status);

  } catch (error) {
    console.error('❌ USER KYC STATUS Error:', error);
    res.status(500).json({
      error: 'Failed to fetch user KYC status',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// Helper functions
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

async function calculateAverageReviewTime(): Promise<number> {
  try {
    const reviewedDocs = await db.select({
      uploadedAt: kycDocuments.uploadedAt,
      reviewedAt: kycDocuments.reviewedAt
    })
    .from(kycDocuments)
    .where(sql`${kycDocuments.reviewedAt} IS NOT NULL`)
    .limit(100);

    if (reviewedDocs.length === 0) return 0;

    const totalHours = reviewedDocs.reduce((sum, doc) => {
      if (doc.uploadedAt && doc.reviewedAt) {
        const diffMs = doc.reviewedAt.getTime() - doc.uploadedAt.getTime();
        const diffHours = diffMs / (1000 * 60 * 60);
        return sum + diffHours;
      }
      return sum;
    }, 0);

    return Math.round(totalHours / reviewedDocs.length);
  } catch (error) {
    console.error('Error calculating average review time:', error);
    return 0;
  }
}