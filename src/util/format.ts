export function formatUsd(value: number): string {
    return `$${value.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }
  
  export function formatChange(value: number): string {
    const sign = value >= 0 ? '+' : '-';
    return `${sign}$${Math.abs(value).toFixed(2)}`;
  }
  
  export function formatChangePercent(value: number): string {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  }
  
  export function formatUpdatedTime(timestamp: number): string {
    return new Date(timestamp * 1000).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  }
  