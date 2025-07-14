import { Request, Response } from 'express';
import { pool } from '../db.js';

// Simple KYC API using raw SQL - No schema dependency issues
export async function getKycDocumentsSimple(req: Request, res: Response) {
  try {
    const {
      page = '1',
      limit = '20',
      search = '',
      status = 'all',
      documentType = 'all'
    } = req.query;

    console.log('📋 SIMPLE KYC API: Fetching KYC documents...');

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    // Build WHERE conditions
    let whereConditions = [];
    let queryParams: any[] = [];
    let paramIndex = 1;

    if (search) {
      whereConditions.push(`file_name ILIKE $${paramIndex}`);
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    if (status && status !== 'all') {
      whereConditions.push(`status = $${paramIndex}`);
      queryParams.push(status);
      paramIndex++;
    }

    if (documentType && documentType !== 'all') {
      whereConditions.push(`type = $${paramIndex}`);
      queryParams.push(documentType);
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get total count using direct SQL
    const countQuery = `
      SELECT COUNT(*) as total
      FROM kyc_documents 
      ${whereClause}
    `;
    
    const countResult = await pool.query(countQuery, queryParams);
    const total = countResult.rows[0]?.total || 0;

    // Get documents with pagination
    const documentsQuery = `
      SELECT 
        k.id,
        k.user_id,
        k.type as document_type,
        k.file_path,
        k.status,
        k.uploaded_at,
        k.reviewed_at,
        k.type,
        k.file_name,
        k.file_size,
        k.mime_type,
        u.username,
        u.email,
        u.full_name
      FROM kyc_documents k
      LEFT JOIN users u ON k.user_id = u.id
      ${whereClause}
      ORDER BY k.uploaded_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    queryParams.push(limitNum, offset);
    
    const documentsResult = await pool.query(documentsQuery, queryParams);

    // Format documents
    const documents = documentsResult.rows.map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      username: row.username || 'Bilinmiyor',
      email: row.email || '',
      fullName: row.full_name || '',
      type: row.document_type,
      fileName: row.file_name || `document_${row.id}`,
      filePath: row.file_path,
      fileSize: row.file_size || 0,
      mimeType: row.mime_type || 'application/pdf',
      status: row.status,
      rejectionReason: null,
      reviewedBy: null,
      uploadedAt: row.uploaded_at,
      reviewedAt: row.reviewed_at,
      createdAt: row.uploaded_at,
      fileSizeFormatted: formatFileSize(row.file_size || 0),
      daysSinceUpload: row.uploaded_at 
        ? Math.floor((Date.now() - new Date(row.uploaded_at).getTime()) / (1000 * 60 * 60 * 24))
        : 0
    }));

    const response = {
      documents,
      _meta: {
        totalCount: Number(total),
        pageCount: Math.ceil(Number(total) / limitNum),
        currentPage: pageNum,
        perPage: limitNum
      }
    };

    console.log(`📋 KYC DOCUMENTS COLLECTED: ${documents.length} documents loaded`);
    console.log(`   Total documents: ${total}`);

    res.json(response);

  } catch (error) {
    console.error('❌ SIMPLE KYC API Error:', error);
    res.status(500).json({
      error: 'Failed to fetch KYC documents',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// Simple KYC stats using raw SQL
export async function getKycStatsSimple(req: Request, res: Response) {
  try {
    console.log('📊 SIMPLE KYC STATS: Generating statistics...');

    // Basic stats
    const statsQuery = `
      SELECT 
        COUNT(*) as total_documents,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_review,
        COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved,
        COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected
      FROM kyc_documents
    `;
    
    const statsResult = await pool.query(statsQuery);
    const stats = statsResult.rows[0];

    // Type statistics
    const typeStatsQuery = `
      SELECT 
        type,
        COUNT(*) as count,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
        COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved,
        COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected
      FROM kyc_documents
      GROUP BY type
    `;
    
    const typeStatsResult = await pool.query(typeStatsQuery);

    const completionRate = stats.total_documents > 0 
      ? Math.round((Number(stats.approved) / Number(stats.total_documents)) * 100) 
      : 0;

    const summary = {
      totalDocuments: Number(stats.total_documents),
      pendingReview: Number(stats.pending_review),
      approved: Number(stats.approved),
      rejected: Number(stats.rejected),
      completionRate,
      averageReviewTimeHours: 24, // Fallback value
      usersWithCompleteKyc: 0, // Fallback value
      typeStatistics: typeStatsResult.rows.map((row: any) => ({
        type: row.type,
        total: Number(row.count),
        pending: Number(row.pending),
        approved: Number(row.approved),
        rejected: Number(row.rejected),
        approvalRate: Number(row.count) > 0 ? Math.round((Number(row.approved) / Number(row.count)) * 100) : 0
      })),
      recentActivity: [] // Simplified for now
    };

    console.log('📊 SIMPLE KYC STATS COMPLETED');
    res.json(summary);

  } catch (error) {
    console.error('❌ SIMPLE KYC STATS Error:', error);
    res.status(500).json({
      error: 'Failed to fetch KYC statistics',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// Helper function
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}