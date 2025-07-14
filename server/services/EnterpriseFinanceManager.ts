import { db } from '../db';
import { users, deposits, withdrawals, transactions, riskAnalysis, userLogs } from '../../shared/schema';
import { eq, desc, and, gte, lte, count, sum, avg, sql, or } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { AdvancedRiskEngine } from './AdvancedRiskEngine';
import { PerformanceOptimizer, QueryOptimizer, PerformanceMonitor } from './PerformanceOptimizer';

export interface TransactionPipeline {
  id: string;
  stage: 'initiated' | 'validation' | 'risk_analysis' | 'compliance' | 'approval' | 'processing' | 'completed' | 'failed';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  metadata: Record<string, any>;
  timeline: Date[];
  assignedTo?: string;
  notes: string[];
}

export interface FinancialLimits {
  daily: { amount: number; transactions: number };
  weekly: { amount: number; transactions: number };
  monthly: { amount: number; transactions: number };
  perTransaction: { min: number; max: number };
  velocity: { maxPerHour: number; maxPer24h: number };
}

export interface ComplianceRule {
  id: string;
  name: string;
  type: 'aml' | 'kyc' | 'sanctions' | 'velocity' | 'amount';
  severity: 'info' | 'warning' | 'critical';
  active: boolean;
  conditions: Record<string, any>;
  actions: string[];
}

export interface PaymentProvider {
  id: string;
  name: string;
  type: 'bank' | 'crypto' | 'ewallet' | 'card';
  enabled: boolean;
  config: Record<string, any>;
  fees: { fixed: number; percentage: number };
  limits: FinancialLimits;
  processingTime: { min: number; max: number; unit: 'minutes' | 'hours' | 'days' };
  successRate: number;
  lastHealthCheck: Date;
}

export class EnterpriseFinanceManager {
  private static pipelines = new Map<string, TransactionPipeline>();
  private static providers = new Map<string, PaymentProvider>();
  private static complianceRules: ComplianceRule[] = [];
  private static globalLimits: FinancialLimits = {
    daily: { amount: 1000000, transactions: 1000 },
    weekly: { amount: 5000000, transactions: 5000 },
    monthly: { amount: 20000000, transactions: 20000 },
    perTransaction: { min: 10, max: 500000 },
    velocity: { maxPerHour: 100, maxPer24h: 1000 }
  };

  static async initialize(): Promise<void> {
    console.log('[FINANCE] Initializing Enterprise Finance Manager...');
    
    await this.loadPaymentProviders();
    await this.loadComplianceRules();
    await this.performHealthChecks();
    
    console.log('[FINANCE] Enterprise Finance Manager initialized successfully');
  }

  static async processDeposit(
    userId: number,
    amount: number,
    paymentMethod: string,
    metadata: Record<string, any> = {}
  ): Promise<{ success: boolean; transactionId: string; pipeline?: TransactionPipeline; error?: string }> {
    
    const timer = PerformanceMonitor.startTimer('deposit_processing');
    
    try {
      // Generate unique transaction ID
      const transactionId = `DEP_${Date.now()}_${uuidv4().slice(0, 8)}`;
      
      // Create processing pipeline
      const pipeline = await this.createTransactionPipeline(transactionId, 'deposit', {
        userId,
        amount,
        paymentMethod,
        ...metadata
      });

      // Stage 1: Validation
      const validationResult = await this.validateTransaction(userId, amount, 'deposit', paymentMethod);
      if (!validationResult.valid) {
        await this.updatePipelineStage(pipeline.id, 'failed', validationResult.errors);
        return { success: false, transactionId, error: validationResult.errors.join(', ') };
      }

      await this.updatePipelineStage(pipeline.id, 'validation', ['Validation completed successfully']);

      // Stage 2: Risk Analysis
      await this.updatePipelineStage(pipeline.id, 'risk_analysis', ['Starting advanced risk analysis']);
      
      const riskAnalysis = await AdvancedRiskEngine.analyzeTransaction(
        userId, 
        amount, 
        'deposit', 
        metadata
      );

      pipeline.metadata.riskAnalysis = riskAnalysis;

      // Handle risk decision
      if (riskAnalysis.recommendation === 'reject' || riskAnalysis.recommendation === 'freeze_account') {
        await this.updatePipelineStage(pipeline.id, 'failed', [`Risk analysis failed: ${riskAnalysis.recommendation}`]);
        return { success: false, transactionId, error: 'Transaction rejected due to risk analysis' };
      }

      // Stage 3: Compliance Check
      await this.updatePipelineStage(pipeline.id, 'compliance', ['Running compliance checks']);
      
      const complianceResult = await this.runComplianceChecks(userId, amount, 'deposit', riskAnalysis);
      if (!complianceResult.passed) {
        await this.updatePipelineStage(pipeline.id, 'failed', complianceResult.violations);
        return { success: false, transactionId, error: 'Compliance violations detected' };
      }

      // Stage 4: Payment Provider Processing
      await this.updatePipelineStage(pipeline.id, 'processing', ['Sending to payment provider']);
      
      const provider = this.providers.get(paymentMethod);
      if (!provider || !provider.enabled) {
        await this.updatePipelineStage(pipeline.id, 'failed', ['Payment provider not available']);
        return { success: false, transactionId, error: 'Payment method not available' };
      }

      const paymentResult = await this.processWithProvider(provider, {
        type: 'deposit',
        amount,
        userId,
        transactionId,
        metadata
      });

      if (!paymentResult.success) {
        await this.updatePipelineStage(pipeline.id, 'failed', [paymentResult.error || 'Payment processing failed']);
        return { success: false, transactionId, error: paymentResult.error };
      }

      // Stage 5: Database Recording
      await this.recordDeposit({
        transactionId,
        userId,
        amount,
        paymentMethod,
        paymentProvider: provider.name,
        externalTransactionId: paymentResult.externalId,
        status: riskAnalysis.recommendation === 'auto_approve' ? 'completed' : 'pending',
        riskScore: riskAnalysis.riskScore.toString(),
        riskFlags: riskAnalysis.flags,
        processingFee: paymentResult.fees?.toString() || '0',
        netAmount: (amount - (paymentResult.fees || 0)).toString(),
        metadata: pipeline.metadata
      });

      await this.updatePipelineStage(pipeline.id, 'completed', ['Transaction processed successfully']);

      // Log transaction
      await this.logTransaction(userId, 'DEPOSIT_PROCESSED', {
        transactionId,
        amount,
        paymentMethod,
        riskScore: riskAnalysis.riskScore,
        processingTime: timer()
      });

      timer();
      return { success: true, transactionId, pipeline };

    } catch (error: any) {
      timer();
      console.error('[FINANCE] Deposit processing error:', error);
      return { success: false, transactionId: '', error: error.message };
    }
  }

  static async processWithdrawal(
    userId: number,
    amount: number,
    withdrawalMethod: string,
    withdrawalDetails: Record<string, any>,
    metadata: Record<string, any> = {}
  ): Promise<{ success: boolean; transactionId: string; pipeline?: TransactionPipeline; error?: string }> {
    
    const timer = PerformanceMonitor.startTimer('withdrawal_processing');
    
    try {
      const transactionId = `WD_${Date.now()}_${uuidv4().slice(0, 8)}`;
      
      const pipeline = await this.createTransactionPipeline(transactionId, 'withdrawal', {
        userId,
        amount,
        withdrawalMethod,
        withdrawalDetails,
        ...metadata
      });

      // Enhanced validation for withdrawals
      const validationResult = await this.validateTransaction(userId, amount, 'withdrawal', withdrawalMethod);
      if (!validationResult.valid) {
        await this.updatePipelineStage(pipeline.id, 'failed', validationResult.errors);
        return { success: false, transactionId, error: validationResult.errors.join(', ') };
      }

      // Balance check
      const balanceCheck = await this.checkUserBalance(userId, amount);
      if (!balanceCheck.sufficient) {
        await this.updatePipelineStage(pipeline.id, 'failed', ['Insufficient balance']);
        return { success: false, transactionId, error: 'Insufficient balance' };
      }

      await this.updatePipelineStage(pipeline.id, 'validation', ['Validation completed successfully']);

      // Comprehensive risk analysis
      await this.updatePipelineStage(pipeline.id, 'risk_analysis', ['Starting comprehensive risk analysis']);
      
      const riskAnalysis = await AdvancedRiskEngine.analyzeTransaction(
        userId, 
        amount, 
        'withdrawal', 
        { ...metadata, withdrawalDetails }
      );

      pipeline.metadata.riskAnalysis = riskAnalysis;

      // Risk-based routing
      let requiresManualReview = false;
      
      switch (riskAnalysis.recommendation) {
        case 'reject':
        case 'freeze_account':
          await this.updatePipelineStage(pipeline.id, 'failed', [`Risk analysis: ${riskAnalysis.recommendation}`]);
          return { success: false, transactionId, error: 'Transaction rejected due to risk analysis' };
        
        case 'enhanced_verification':
        case 'manual_review':
          requiresManualReview = true;
          break;
      }

      // Compliance checks
      await this.updatePipelineStage(pipeline.id, 'compliance', ['Running compliance checks']);
      
      const complianceResult = await this.runComplianceChecks(userId, amount, 'withdrawal', riskAnalysis);
      if (!complianceResult.passed) {
        await this.updatePipelineStage(pipeline.id, 'failed', complianceResult.violations);
        return { success: false, transactionId, error: 'Compliance violations detected' };
      }

      // Determine initial status
      let initialStatus = 'pending';
      if (requiresManualReview) {
        initialStatus = riskAnalysis.recommendation === 'enhanced_verification' ? 'enhanced_review' : 'risk_review';
        pipeline.metadata.requiresManualReview = true;
        pipeline.metadata.reviewReason = riskAnalysis.recommendation;
      } else if (riskAnalysis.recommendation === 'auto_approve' && riskAnalysis.riskLevel === 'minimal') {
        initialStatus = 'risk_approved';
      }

      // Calculate fees
      const provider = this.providers.get(withdrawalMethod);
      const processingFee = this.calculateProcessingFee(amount, provider);
      const netAmount = amount - processingFee;

      // Record withdrawal
      await this.recordWithdrawal({
        transactionId,
        userId,
        amount,
        withdrawalMethod,
        withdrawalDetails,
        status: initialStatus,
        riskScore: riskAnalysis.riskScore.toString(),
        riskFlags: riskAnalysis.flags,
        processingFee: processingFee.toString(),
        netAmount: netAmount.toString(),
        metadata: pipeline.metadata
      });

      // Reserve balance for pending withdrawal
      if (initialStatus !== 'failed') {
        await this.reserveBalance(userId, amount);
      }

      await this.updatePipelineStage(pipeline.id, 
        requiresManualReview ? 'approval' : 'processing', 
        [requiresManualReview ? 'Waiting for manual review' : 'Ready for processing']
      );

      // Log transaction
      await this.logTransaction(userId, 'WITHDRAWAL_INITIATED', {
        transactionId,
        amount,
        withdrawalMethod,
        riskScore: riskAnalysis.riskScore,
        requiresReview: requiresManualReview,
        processingTime: timer()
      });

      timer();
      return { success: true, transactionId, pipeline };

    } catch (error: any) {
      timer();
      console.error('[FINANCE] Withdrawal processing error:', error);
      return { success: false, transactionId: '', error: error.message };
    }
  }

  private static async createTransactionPipeline(
    transactionId: string,
    type: string,
    metadata: Record<string, any>
  ): Promise<TransactionPipeline> {
    
    const pipeline: TransactionPipeline = {
      id: uuidv4(),
      stage: 'initiated',
      priority: this.determinePriority(metadata),
      metadata: { type, ...metadata },
      timeline: [new Date()],
      notes: [`${type} transaction initiated: ${transactionId}`]
    };

    this.pipelines.set(pipeline.id, pipeline);
    
    // Cache pipeline data
    await PerformanceOptimizer.set(`pipeline_${pipeline.id}`, pipeline, 3600);
    
    return pipeline;
  }

  private static async updatePipelineStage(
    pipelineId: string,
    stage: TransactionPipeline['stage'],
    notes: string[]
  ): Promise<void> {
    
    const pipeline = this.pipelines.get(pipelineId);
    if (!pipeline) return;

    pipeline.stage = stage;
    pipeline.timeline.push(new Date());
    pipeline.notes.push(...notes);

    // Update cache
    await PerformanceOptimizer.set(`pipeline_${pipelineId}`, pipeline, 3600);
  }

  private static async validateTransaction(
    userId: number,
    amount: number,
    type: string,
    method: string
  ): Promise<{ valid: boolean; errors: string[] }> {
    
    const errors: string[] = [];

    // Amount validation
    if (amount <= 0) {
      errors.push('Amount must be greater than 0');
    }

    if (amount < this.globalLimits.perTransaction.min) {
      errors.push(`Amount below minimum limit: ${this.globalLimits.perTransaction.min}`);
    }

    if (amount > this.globalLimits.perTransaction.max) {
      errors.push(`Amount exceeds maximum limit: ${this.globalLimits.perTransaction.max}`);
    }

    // User validation
    const user = await QueryOptimizer.executeWithCache(
      `user_${userId}`,
      () => db.select().from(users).where(eq(users.id, userId)).limit(1),
      300
    );

    if (!user.length) {
      errors.push('User not found');
    }

    // Velocity checks
    const velocityCheck = await this.checkVelocityLimits(userId, amount, type);
    if (!velocityCheck.allowed) {
      errors.push(`Velocity limit exceeded: ${velocityCheck.reason}`);
    }

    // Daily/weekly/monthly limits
    const limitsCheck = await this.checkPeriodicLimits(userId, amount, type);
    if (!limitsCheck.allowed) {
      errors.push(`Periodic limit exceeded: ${limitsCheck.reason}`);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  private static async runComplianceChecks(
    userId: number,
    amount: number,
    type: string,
    riskAnalysis: any
  ): Promise<{ passed: boolean; violations: string[] }> {
    
    const violations: string[] = [];

    // Run all active compliance rules
    for (const rule of this.complianceRules.filter(r => r.active)) {
      const violation = await this.checkComplianceRule(rule, {
        userId,
        amount,
        type,
        riskAnalysis
      });

      if (violation) {
        violations.push(`${rule.name}: ${violation}`);
      }
    }

    return {
      passed: violations.length === 0,
      violations
    };
  }

  private static async checkComplianceRule(
    rule: ComplianceRule,
    context: Record<string, any>
  ): Promise<string | null> {
    
    switch (rule.type) {
      case 'amount':
        if (context.amount > rule.conditions.maxAmount) {
          return `Amount ${context.amount} exceeds limit ${rule.conditions.maxAmount}`;
        }
        break;

      case 'velocity':
        // Velocity checks already done in validation
        break;

      case 'aml':
        if (context.riskAnalysis?.flags?.some((f: any) => f.type === 'compliance')) {
          return 'AML compliance violation detected';
        }
        break;

      case 'kyc':
        const user = await db.select().from(users).where(eq(users.id, context.userId)).limit(1);
        if (!user[0]?.tckn && context.amount > rule.conditions.kycRequiredAmount) {
          return `KYC verification required for amounts above ${rule.conditions.kycRequiredAmount}`;
        }
        break;
    }

    return null;
  }

  private static async processWithProvider(
    provider: PaymentProvider,
    request: Record<string, any>
  ): Promise<{ success: boolean; externalId?: string; fees?: number; error?: string }> {
    
    try {
      // Simulate provider processing (replace with actual provider integration)
      const processingTime = Math.random() * 1000 + 500; // 500-1500ms
      await new Promise(resolve => setTimeout(resolve, processingTime));

      // Calculate fees
      const fees = provider.fees.fixed + (request.amount * provider.fees.percentage / 100);

      return {
        success: true,
        externalId: `${provider.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        fees
      };

    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  private static async recordDeposit(data: Record<string, any>): Promise<void> {
    await db.insert(deposits).values({
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  private static async recordWithdrawal(data: Record<string, any>): Promise<void> {
    await db.insert(withdrawals).values({
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  private static async checkUserBalance(userId: number, amount: number): Promise<{ sufficient: boolean; currentBalance: number }> {
    const user = await db.select({ balance: users.balance }).from(users).where(eq(users.id, userId)).limit(1);
    const currentBalance = Number(user[0]?.balance || 0);
    
    return {
      sufficient: currentBalance >= amount,
      currentBalance
    };
  }

  private static async reserveBalance(userId: number, amount: number): Promise<void> {
    // In a real implementation, this would update a reserved_balance field
    // For now, we'll just log the reservation
    console.log(`[FINANCE] Reserved ${amount} for user ${userId}`);
  }

  private static calculateProcessingFee(amount: number, provider?: PaymentProvider): number {
    if (!provider) return 0;
    
    return provider.fees.fixed + (amount * provider.fees.percentage / 100);
  }

  private static determinePriority(metadata: Record<string, any>): TransactionPipeline['priority'] {
    if (metadata.amount > 100000) return 'urgent';
    if (metadata.amount > 50000) return 'high';
    if (metadata.vip) return 'high';
    return 'normal';
  }

  private static async checkVelocityLimits(userId: number, amount: number, type: string): Promise<{ allowed: boolean; reason?: string }> {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const table = type === 'deposit' ? deposits : withdrawals;
    
    const [hourlyCount, dailyCount] = await Promise.all([
      db.select({ count: count() }).from(table).where(
        and(eq(table.userId, userId), gte(table.createdAt, oneHourAgo))
      ),
      db.select({ count: count() }).from(table).where(
        and(eq(table.userId, userId), gte(table.createdAt, oneDayAgo))
      )
    ]);

    const hourly = Number(hourlyCount[0]?.count || 0);
    const daily = Number(dailyCount[0]?.count || 0);

    if (hourly >= this.globalLimits.velocity.maxPerHour) {
      return { allowed: false, reason: `Hourly limit exceeded (${hourly}/${this.globalLimits.velocity.maxPerHour})` };
    }

    if (daily >= this.globalLimits.velocity.maxPer24h) {
      return { allowed: false, reason: `Daily limit exceeded (${daily}/${this.globalLimits.velocity.maxPer24h})` };
    }

    return { allowed: true };
  }

  private static async checkPeriodicLimits(userId: number, amount: number, type: string): Promise<{ allowed: boolean; reason?: string }> {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startOfWeek = new Date(startOfDay.getTime() - (today.getDay() * 24 * 60 * 60 * 1000));
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const table = type === 'deposit' ? deposits : withdrawals;
    
    const [dailySum, weeklySum, monthlySum] = await Promise.all([
      db.select({ total: sum(table.amount) }).from(table).where(
        and(eq(table.userId, userId), gte(table.createdAt, startOfDay))
      ),
      db.select({ total: sum(table.amount) }).from(table).where(
        and(eq(table.userId, userId), gte(table.createdAt, startOfWeek))
      ),
      db.select({ total: sum(table.amount) }).from(table).where(
        and(eq(table.userId, userId), gte(table.createdAt, startOfMonth))
      )
    ]);

    const daily = Number(dailySum[0]?.total || 0) + amount;
    const weekly = Number(weeklySum[0]?.total || 0) + amount;
    const monthly = Number(monthlySum[0]?.total || 0) + amount;

    if (daily > this.globalLimits.daily.amount) {
      return { allowed: false, reason: `Daily amount limit exceeded` };
    }

    if (weekly > this.globalLimits.weekly.amount) {
      return { allowed: false, reason: `Weekly amount limit exceeded` };
    }

    if (monthly > this.globalLimits.monthly.amount) {
      return { allowed: false, reason: `Monthly amount limit exceeded` };
    }

    return { allowed: true };
  }

  private static async logTransaction(userId: number, action: string, details: Record<string, any>): Promise<void> {
    await db.insert(userLogs).values({
      userId,
      action,
      category: 'finance',
      description: `Transaction processed: ${action}`,
      metadata: details,
      severity: 'low',
      status: 'success',
      createdAt: new Date()
    });
  }

  private static async loadPaymentProviders(): Promise<void> {
    // Load payment providers from database or configuration
    const defaultProviders: PaymentProvider[] = [
      {
        id: 'bank_transfer',
        name: 'Bank Transfer',
        type: 'bank',
        enabled: true,
        config: {},
        fees: { fixed: 5, percentage: 0.5 },
        limits: this.globalLimits,
        processingTime: { min: 1, max: 3, unit: 'days' },
        successRate: 0.98,
        lastHealthCheck: new Date()
      },
      {
        id: 'crypto_btc',
        name: 'Bitcoin',
        type: 'crypto',
        enabled: true,
        config: {},
        fees: { fixed: 0, percentage: 1.0 },
        limits: this.globalLimits,
        processingTime: { min: 10, max: 60, unit: 'minutes' },
        successRate: 0.95,
        lastHealthCheck: new Date()
      }
    ];

    defaultProviders.forEach(provider => {
      this.providers.set(provider.id, provider);
    });
  }

  private static async loadComplianceRules(): Promise<void> {
    this.complianceRules = [
      {
        id: 'large_amount_kyc',
        name: 'Large Amount KYC Required',
        type: 'kyc',
        severity: 'critical',
        active: true,
        conditions: { kycRequiredAmount: 10000 },
        actions: ['require_kyc', 'manual_review']
      },
      {
        id: 'high_risk_manual_review',
        name: 'High Risk Manual Review',
        type: 'aml',
        severity: 'warning',
        active: true,
        conditions: { riskThreshold: 75 },
        actions: ['manual_review', 'enhanced_monitoring']
      }
    ];
  }

  private static async performHealthChecks(): Promise<void> {
    console.log('[FINANCE] Performing provider health checks...');
    
    for (const [id, provider] of this.providers.entries()) {
      try {
        // Simulate health check
        const healthy = Math.random() > 0.1; // 90% success rate
        provider.lastHealthCheck = new Date();
        
        if (!healthy) {
          console.warn(`[FINANCE] Provider ${provider.name} health check failed`);
          provider.enabled = false;
        }
      } catch (error) {
        console.error(`[FINANCE] Health check failed for ${provider.name}:`, error);
        provider.enabled = false;
      }
    }
  }

  // Admin and monitoring methods
  static getPipelineStatus(pipelineId: string): TransactionPipeline | null {
    return this.pipelines.get(pipelineId) || null;
  }

  static getAllPipelines(): TransactionPipeline[] {
    return Array.from(this.pipelines.values());
  }

  static getProviderStatus(): PaymentProvider[] {
    return Array.from(this.providers.values());
  }

  static getSystemHealth(): Record<string, any> {
    const activeProviders = Array.from(this.providers.values()).filter(p => p.enabled).length;
    const totalProviders = this.providers.size;
    const activePipelines = Array.from(this.pipelines.values()).filter(p => 
      !['completed', 'failed'].includes(p.stage)
    ).length;

    return {
      providers: {
        active: activeProviders,
        total: totalProviders,
        healthScore: activeProviders / totalProviders
      },
      pipelines: {
        active: activePipelines,
        total: this.pipelines.size
      },
      compliance: {
        activeRules: this.complianceRules.filter(r => r.active).length,
        totalRules: this.complianceRules.length
      },
      cache: PerformanceOptimizer.getMetrics(),
      performance: PerformanceMonitor.getStats()
    };
  }
}

// Initialize on import
EnterpriseFinanceManager.initialize().catch(console.error);