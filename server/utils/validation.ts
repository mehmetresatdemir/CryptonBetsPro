import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';

interface ValidateRequestOptions {
  params?: z.ZodSchema;
  query?: z.ZodSchema;
  body?: z.ZodSchema;
}

/**
 * Middleware for validating incoming requests using Zod schemas
 * @param options Object with Zod schemas for params, query, and/or body
 */
export function validateRequest(options: ValidateRequestOptions) {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors: any = {};
    let hasError = false;

    try {
      // Eğer params için şema tanımlanmışsa doğrula
      if (options.params) {
        req.params = options.params.parse(req.params);
      }

      // Eğer query için şema tanımlanmışsa doğrula
      if (options.query) {
        req.query = options.query.parse(req.query);
      }

      // Eğer body için şema tanımlanmışsa doğrula
      if (options.body) {
        req.body = options.body.parse(req.body);
      }

      // Hata yoksa, sonraki middleware'e geç
      next();
    } catch (error) {
      // Zod hata formatını daha okunabilir hale getir
      if (error instanceof ZodError) {
        hasError = true;
        // Hataları formatlayıp birleştir
        error.errors.forEach((err) => {
          const path = err.path.join('.');
          const fieldName = path || 'data';
          
          if (!errors[fieldName]) {
            errors[fieldName] = [];
          }
          
          errors[fieldName].push(err.message);
        });
        
        // Hata yanıtını gönder
        res.status(400).json({
          error: 'Doğrulama hatası',
          details: errors
        });
      } else {
        // Zod dışı hatalar için
        console.error('Doğrulama sırasında beklenmeyen hata:', error);
        next(error);
      }
    }
  };
}

/**
 * Middleware for validating pagination parameters
 */
export function validatePagination(req: Request, res: Response, next: NextFunction) {
  const paginationSchema = z.object({
    page: z.string().optional().transform(val => (val ? parseInt(val, 10) : 1)),
    limit: z.string().optional().transform(val => (val ? parseInt(val, 10) : 20)),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc')
  });

  try {
    const validatedQuery = paginationSchema.parse(req.query);
    
    // Sayfa ve limit değerlerine sınırlama getir
    validatedQuery.page = Math.max(1, validatedQuery.page);
    validatedQuery.limit = Math.min(Math.max(1, validatedQuery.limit), 100); // 1-100 arası
    
    // Offset hesapla
    const offset = (validatedQuery.page - 1) * validatedQuery.limit;
    
    // Değerleri isteğe ekle
    req.query = {
      ...req.query,
      ...validatedQuery,
      offset
    };
    
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({
        error: 'Sayfalama parametreleri geçersiz',
        details: error.errors
      });
    } else {
      next(error);
    }
  }
}