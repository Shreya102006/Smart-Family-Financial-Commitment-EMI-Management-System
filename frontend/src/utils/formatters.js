export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '₹0';
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

export const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

export const getDaysRemainingLabel = (days) => {
  if (days === null || days === undefined) return '-';
  if (days === 0) return 'Due today';
  if (days === 1) return 'Tomorrow';
  if (days > 1) return `In ${days} days`;
  const overdueDays = Math.abs(days);
  return `${overdueDays} day${overdueDays > 1 ? 's' : ''} overdue`;
};

export const getStatusBadgeClass = (status) => {
  switch (status?.toUpperCase()) {
    case 'UPCOMING':
      return 'badge-status-upcoming';
    case 'PENDING':
      return 'badge-status-pending';
    case 'PAID':
      return 'badge-status-paid';
    case 'OVERDUE':
      return 'badge-status-overdue';
    case 'ACTIVE':
      return 'badge-status-active';
    case 'COMPLETED':
      return 'badge-status-completed';
    default:
      return 'bg-secondary text-white';
  }
};
