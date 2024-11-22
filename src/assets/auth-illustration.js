export const LoginIllustration = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="100%"
    height="100%"
    viewBox="0 0 800 600"
    className="w-full max-w-lg mx-auto"
  >
    <defs>
      <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" style={{ stopColor: '#9333EA', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#7C3AED', stopOpacity: 1 }} />
      </linearGradient>
    </defs>
    <path
      d="M769.42,367.36c-6.66,67.24-43.89,126.28-98.19,161.45s-121.17,44.47-183.23,26.07-117.39-62.59-153.72-119c-36.34-56.37-58.15-120.44-91.46-177.28C209.49,202.73,162,149,103.58,118.87,45.19,88.76-23.69,83.29-85.06,98"
      fill="none"
      stroke="url(#grad1)"
      strokeMiterlimit="10"
      strokeWidth="2"
      strokeDasharray="12"
      className="animate-dash"
    />
    <circle cx="400" cy="300" r="150" fill="url(#grad1)" fillOpacity="0.1" />
    <circle cx="400" cy="300" r="100" fill="url(#grad1)" fillOpacity="0.2" />
    <circle cx="400" cy="300" r="50" fill="url(#grad1)" fillOpacity="0.3" />
  </svg>
);

export const RegisterIllustration = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="100%"
    height="100%"
    viewBox="0 0 800 600"
    className="w-full max-w-lg mx-auto"
  >
    <defs>
      <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" style={{ stopColor: '#9333EA', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#7C3AED', stopOpacity: 1 }} />
      </linearGradient>
    </defs>
    <path
      d="M769.42,367.36c-6.66,67.24-43.89,126.28-98.19,161.45s-121.17,44.47-183.23,26.07-117.39-62.59-153.72-119c-36.34-56.37-58.15-120.44-91.46-177.28C209.49,202.73,162,149,103.58,118.87,45.19,88.76-23.69,83.29-85.06,98"
      fill="none"
      stroke="url(#grad2)"
      strokeMiterlimit="10"
      strokeWidth="2"
      strokeDasharray="12"
      className="animate-dash"
    />
    <rect x="300" y="200" width="200" height="200" rx="20" fill="url(#grad2)" fillOpacity="0.1" />
    <rect x="350" y="250" width="100" height="100" rx="10" fill="url(#grad2)" fillOpacity="0.2" />
    <circle cx="400" cy="300" r="25" fill="url(#grad2)" fillOpacity="0.3" />
  </svg>
);
