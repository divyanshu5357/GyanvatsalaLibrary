// Global animation styles for buttons and UI elements
export const buttonAnimationStyles = `
  @keyframes slideInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes slideInDown {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes scaleIn {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.7;
    }
  }

  .btn-pulse {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }

  .animate-slideInUp {
    animation: slideInUp 0.4s ease-out;
  }

  .animate-slideInDown {
    animation: slideInDown 0.4s ease-out;
  }

  .animate-scaleIn {
    animation: scaleIn 0.3s ease-out;
  }

  /* Button hover animations */
  .btn-hover-lift {
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .btn-hover-lift:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
  }

  .btn-hover-lift:active {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  /* Smooth transitions */
  * {
    transition: color 0.2s ease, background-color 0.2s ease, border-color 0.2s ease;
  }
`

export default buttonAnimationStyles
