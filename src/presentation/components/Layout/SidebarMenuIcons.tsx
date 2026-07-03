interface SidebarMenuIconProps {
  Id: string;
}

export const SidebarMenuIcon = ({ Id }: SidebarMenuIconProps) => {
  const common = {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  };

  switch (Id) {
    case 'dashboard':
      return (
        <svg {...common}>
          <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1z" />
        </svg>
      );
    case 'products':
      return (
        <svg {...common}>
          <path d="M7 7h10v10H7z" />
          <path d="M4 10V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4" />
        </svg>
      );
    case 'users':
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="3.2" />
          <path d="M5 19c1.2-3 4.4-4.5 7-4.5s5.8 1.5 7 4.5" />
        </svg>
      );
    case 'categories':
      return (
        <svg {...common}>
          <path d="M4 7h7v7H4z" />
          <path d="M13 7h7v4h-7z" />
          <path d="M13 13h7v4h-7z" />
        </svg>
      );
    case 'brands':
      return (
        <svg {...common}>
          <path d="M12 3 4 7v6c0 4.2 3.4 6.8 8 8 4.6-1.2 8-3.8 8-8V7z" />
        </svg>
      );
    case 'orders':
      return (
        <svg {...common}>
          <path d="M7 7h14l-1.5 9H8.5L7 7z" />
          <path d="M7 7 6 4H3" />
          <circle cx="10" cy="19" r="1.2" />
          <circle cx="17" cy="19" r="1.2" />
        </svg>
      );
    case 'history':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8" />
          <path d="M12 8v4l3 2" />
        </svg>
      );
    case 'reports':
      return (
        <svg {...common}>
          <path d="M6 18V10" />
          <path d="M12 18V6" />
          <path d="M18 18v-8" />
          <path d="M4 18h16" />
        </svg>
      );
    case 'settings':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="3" />
          <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="2.5" />
        </svg>
      );
  }
};
