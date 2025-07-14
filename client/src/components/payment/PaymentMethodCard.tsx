import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, CreditCard, Smartphone, Wallet, Building, Bitcoin } from 'lucide-react';

interface PaymentMethod {
  id: string;
  name: string;
  type: string;
  minDeposit: number;
  maxDeposit: number;
  minWithdraw: number;
  maxWithdraw: number;
  processingTime: string;
  status: string;
  depositCount: number;
  withdrawCount: number;
  successRate: number;
}

interface PaymentMethodCardProps {
  method: PaymentMethod;
  type: 'deposit' | 'withdraw';
  onSelect: (methodId: string) => void;
  selected?: boolean;
}

const getMethodIcon = (type: string) => {
  switch (type) {
    case 'card':
      return <CreditCard className="h-6 w-6" />;
    case 'bank_transfer':
      return <Building className="h-6 w-6" />;
    case 'cryptocurrency':
      return <Bitcoin className="h-6 w-6" />;
    case 'digital_wallet':
    case 'ewallet':
      return <Wallet className="h-6 w-6" />;
    case 'mobile_payment':
      return <Smartphone className="h-6 w-6" />;
    default:
      return <CreditCard className="h-6 w-6" />;
  }
};

const getMethodColor = (type: string) => {
  switch (type) {
    case 'card':
      return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    case 'bank_transfer':
      return 'bg-green-500/20 text-green-400 border-green-500/30';
    case 'cryptocurrency':
      return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    case 'digital_wallet':
    case 'ewallet':
      return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
    case 'mobile_payment':
      return 'bg-pink-500/20 text-pink-400 border-pink-500/30';
    default:
      return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  }
};

export function PaymentMethodCard({ method, type, onSelect, selected }: PaymentMethodCardProps) {
  const minAmount = type === 'deposit' ? method.minDeposit : method.minWithdraw;
  const maxAmount = type === 'deposit' ? method.maxDeposit : method.maxWithdraw;
  const isInstant = method.processingTime.includes('Anında');

  return (
    <Card 
      className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
        selected 
          ? 'ring-2 ring-blue-500 bg-blue-500/10 border-blue-500/50' 
          : 'bg-gray-900/50 border-gray-700/50 hover:border-gray-600/50'
      }`}
      onClick={() => onSelect(method.id)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${getMethodColor(method.type)}`}>
              {getMethodIcon(method.type)}
            </div>
            <div>
              <h3 className="font-semibold text-white">{method.name}</h3>
              <p className="text-sm text-gray-400 capitalize">{method.type.replace('_', ' ')}</p>
            </div>
          </div>
          {method.status === 'active' && (
            <CheckCircle className="h-5 w-5 text-green-400" />
          )}
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">Limit:</span>
            <span className="text-sm font-medium text-white">
              ₺{minAmount.toLocaleString()} - ₺{maxAmount.toLocaleString()}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">İşlem Süresi:</span>
            <div className="flex items-center space-x-1">
              <Clock className="h-3 w-3 text-gray-400" />
              <span className="text-sm font-medium text-white">{method.processingTime}</span>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">Başarı Oranı:</span>
            <Badge variant="secondary" className="bg-green-500/20 text-green-400">
              %{(method.successRate * 100).toFixed(0)}
            </Badge>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-gray-700/50">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Yatırım: {method.depositCount}</span>
            <span>Çekim: {method.withdrawCount}</span>
          </div>
        </div>

        {isInstant && (
          <Badge className="mt-2 bg-blue-500/20 text-blue-400 border-blue-500/30">
            Anında İşlem
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}