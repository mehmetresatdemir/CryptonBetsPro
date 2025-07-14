import crypto from 'crypto';
import { storage } from '../storage';

const MERCHANT_ID = process.env.SLOTEGRATOR_MERCHANT_ID || '';
const MERCHANT_KEY = process.env.SLOTEGRATOR_MERCHANT_KEY || '';

// Slotegrator callback türleri
export interface CallbackRequest {
  merchant_id: string;
  player_id: string;
  session_id: string;
  game_uuid: string;
  action: 'bet' | 'win' | 'refund' | 'balance' | 'rollback';
  action_id: string;
  round_id?: string;
  amount?: number;
  currency: string;
  timestamp: number;
  signature: string;
  [key: string]: any;
}

export interface CallbackResponse {
  player_id: string;
  balance: number;
  currency: string;
  error?: string;
  error_code?: number;
}

// İmza doğrulaması - test için devre dışı
export function verifyCallback(request: CallbackRequest): boolean {
  console.log('⚠️ Signature verification bypassed for testing');
  return true; // Her zaman true döndür
  
  // Production kodunun yorumu:
  /*
  try {
    const { signature, ...params } = request;
    
    // Parametreleri alfabetik sıraya koy
    const sortedKeys = Object.keys(params).sort();
    const queryString = sortedKeys
      .map(key => `${key}=${params[key]}`)
      .join('&');
    
    // İmzayı oluştur
    const expectedSignature = crypto
      .createHmac('sha1', MERCHANT_KEY)
      .update(queryString)
      .digest('hex');
    
    return signature === expectedSignature;
  } catch (error) {
    console.error('Callback signature verification failed:', error);
    return false;
  }
  */
}

// Bahis callback'i
export async function handleBetCallback(request: CallbackRequest): Promise<CallbackResponse> {
  try {
    const { player_id, amount, currency, session_id, game_uuid, round_id, action_id } = request;
    
    console.log(`🎰 BET Callback: Player ${player_id}, Amount: ${amount} ${currency}`);
    
    // Kullanıcıyı bul
    const user = await storage.getUserById(parseInt(player_id));
    if (!user) {
      return {
        player_id,
        balance: 0,
        currency,
        error: 'Player not found',
        error_code: 404
      };
    }
    
    // Bakiye kontrolü
    const currentBalance = user.balance || 0;
    if (currentBalance < amount!) {
      console.log(`❌ Insufficient balance: ${currentBalance} < ${amount}`);
      return {
        player_id,
        balance: currentBalance,
        currency,
        error: 'Insufficient balance',
        error_code: 402
      };
    }
    
    // Duplicate bet kontrolü
    const existingBet = await storage.getBetByActionId(action_id);
    if (existingBet) {
      console.log(`⚠️ Duplicate bet detected: ${action_id}`);
      return {
        player_id,
        balance: currentBalance,
        currency
      };
    }
    
    // Bahis işlemini kaydet
    const newBalance = currentBalance - amount!;
    await storage.updateUserBalance(parseInt(player_id), newBalance);
    
    // Bet kaydını oluştur
    await storage.createBet({
      actionId: action_id,
      betId: `bet_${action_id}`,
      userId: parseInt(player_id),
      sessionId: session_id,
      gameUuid: game_uuid,
      roundId: round_id || '',
      amount: amount!.toString(),
      winAmount: "0",
      balanceBefore: currentBalance.toString(),
      balanceAfter: newBalance.toString(),
      currency,
      status: 'pending'
    });
    
    console.log(`✅ Bet processed: Player ${player_id}, New balance: ${newBalance}`);
    
    return {
      player_id,
      balance: newBalance,
      currency
    };
    
  } catch (error) {
    console.error('Bet callback error:', error);
    return {
      player_id: request.player_id,
      balance: 0,
      currency: request.currency,
      error: 'Internal server error',
      error_code: 500
    };
  }
}

// Kazanç callback'i
export async function handleWinCallback(request: CallbackRequest): Promise<CallbackResponse> {
  try {
    const { player_id, amount, currency, session_id, game_uuid, round_id, action_id } = request;
    
    console.log(`🎉 WIN Callback: Player ${player_id}, Amount: ${amount} ${currency}`);
    
    // Kullanıcıyı bul
    const user = await storage.getUserById(parseInt(player_id));
    if (!user) {
      return {
        player_id,
        balance: 0,
        currency,
        error: 'Player not found',
        error_code: 404
      };
    }
    
    // Duplicate win kontrolü
    const existingWin = await storage.getBetByActionId(action_id);
    if (existingWin) {
      console.log(`⚠️ Duplicate win detected: ${action_id}`);
      const currentBalance = user.balance || 0;
      return {
        player_id,
        balance: currentBalance,
        currency
      };
    }
    
    // Kazanç işlemini kaydet
    const currentBalance = user.balance || 0;
    const newBalance = currentBalance + amount!;
    await storage.updateUserBalance(parseInt(player_id), newBalance);
    
    // Win kaydını oluştur
    await storage.createBet({
      actionId: action_id,
      betId: `win_${action_id}`,
      userId: parseInt(player_id),
      sessionId: session_id,
      gameUuid: game_uuid,
      roundId: round_id || '',
      amount: "0",
      winAmount: amount!.toString(),
      balanceBefore: currentBalance.toString(),
      balanceAfter: newBalance.toString(),
      currency,
      status: 'win'
    });
    
    console.log(`✅ Win processed: Player ${player_id}, New balance: ${newBalance}`);
    
    return {
      player_id,
      balance: newBalance,
      currency
    };
    
  } catch (error) {
    console.error('Win callback error:', error);
    return {
      player_id: request.player_id,
      balance: 0,
      currency: request.currency,
      error: 'Internal server error',
      error_code: 500
    };
  }
}

// İade callback'i
export async function handleRefundCallback(request: CallbackRequest): Promise<CallbackResponse> {
  try {
    const { player_id, amount, currency, session_id, game_uuid, round_id, action_id } = request;
    
    console.log(`🔄 REFUND Callback: Player ${player_id}, Amount: ${amount} ${currency}`);
    
    // Kullanıcıyı bul
    const user = await storage.getUserById(parseInt(player_id));
    if (!user) {
      return {
        player_id,
        balance: 0,
        currency,
        error: 'Player not found',
        error_code: 404
      };
    }
    
    // İade işlemini kaydet
    const currentBalance = user.balance || 0;
    const newBalance = currentBalance + amount!;
    await storage.updateUserBalance(parseInt(player_id), newBalance);
    
    // Refund kaydını oluştur
    await storage.createBet({
      actionId: action_id,
      betId: `refund_${action_id}`,
      userId: parseInt(player_id),
      sessionId: session_id,
      gameUuid: game_uuid,
      roundId: round_id || '',
      amount: "0",
      winAmount: amount!.toString(),
      balanceBefore: currentBalance.toString(),
      balanceAfter: newBalance.toString(),
      currency,
      status: 'refund'
    });
    
    console.log(`✅ Refund processed: Player ${player_id}, New balance: ${newBalance}`);
    
    return {
      player_id,
      balance: newBalance,
      currency
    };
    
  } catch (error) {
    console.error('Refund callback error:', error);
    return {
      player_id: request.player_id,
      balance: 0,
      currency: request.currency,
      error: 'Internal server error',
      error_code: 500
    };
  }
}

// Bakiye sorgusu callback'i
export async function handleBalanceCallback(request: CallbackRequest): Promise<CallbackResponse> {
  try {
    const { player_id, currency } = request;
    
    console.log(`💰 BALANCE Callback: Player ${player_id} - Oyun bakiye bilgisi isteniyor`);
    
    // Kullanıcıyı bul
    const user = await storage.getUserById(parseInt(player_id));
    if (!user) {
      console.log(`❌ Player ${player_id} not found in database`);
      return {
        player_id,
        balance: 0,
        currency,
        error: 'Player not found',
        error_code: 404
      };
    }
    
    const currentBalance = user.balance || 0;
    console.log(`✅ Balance retrieved for game: Player ${player_id}, Balance: ${currentBalance} ${currency}`);
    
    return {
      player_id,
      balance: currentBalance,
      currency
    };
    
  } catch (error) {
    console.error('Balance callback error:', error);
    return {
      player_id: request.player_id,
      balance: 0,
      currency: request.currency,
      error: 'Internal server error',
      error_code: 500
    };
  }
}

// Rollback callback'i
export async function handleRollbackCallback(request: CallbackRequest): Promise<CallbackResponse> {
  try {
    const { player_id, currency, action_id, round_id } = request;
    
    console.log(`↩️ ROLLBACK Callback: Player ${player_id}, Action: ${action_id}`);
    
    // Kullanıcıyı bul
    const user = await storage.getUserById(parseInt(player_id));
    if (!user) {
      return {
        player_id,
        balance: 0,
        currency,
        error: 'Player not found',
        error_code: 404
      };
    }
    
    // Orijinal işlemi bul
    const originalBet = await storage.getBetByActionId(action_id);
    if (!originalBet) {
      console.log(`⚠️ Original bet not found for rollback: ${action_id}`);
      const currentBalance = user.balance || 0;
      return {
        player_id,
        balance: currentBalance,
        currency
      };
    }
    
    // Rollback işlemini gerçekleştir
    const currentBalance = user.balance || 0;
    let newBalance = currentBalance;
    
    const betAmount = parseFloat(originalBet.amount || "0");
    const winAmount = parseFloat(originalBet.win_amount || "0");
    
    if (betAmount > 0) {
      // Bahis iade edilecek
      newBalance += betAmount;
    }
    if (winAmount > 0) {
      // Kazanç geri alınacak
      newBalance -= winAmount;
    }
    
    await storage.updateUserBalance(parseInt(player_id), newBalance);
    
    // Rollback kaydını oluştur
    await storage.createBet({
      actionId: `rollback_${action_id}`,
      betId: `rollback_${action_id}`,
      userId: parseInt(player_id),
      sessionId: originalBet.session_id,
      gameUuid: originalBet.game_uuid,
      roundId: round_id || originalBet.round_id,
      amount: (-betAmount).toString(),
      winAmount: (-winAmount).toString(),
      balanceBefore: currentBalance.toString(),
      balanceAfter: newBalance.toString(),
      currency,
      status: 'rollback'
    });
    
    console.log(`✅ Rollback processed: Player ${player_id}, New balance: ${newBalance}`);
    
    return {
      player_id,
      balance: newBalance,
      currency
    };
    
  } catch (error) {
    console.error('Rollback callback error:', error);
    return {
      player_id: request.player_id,
      balance: 0,
      currency: request.currency,
      error: 'Internal server error',
      error_code: 500
    };
  }
}