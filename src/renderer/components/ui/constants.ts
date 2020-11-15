export enum COLORS {
  BLUE = '#639CFF', // Cornflower Blue
  DARK_BLUE = '#2B4570', // Dark Cornflower Blue
  MUSEUM_GREEN = '#008A83', // Dark Cyan
  WARNING = '#E0CA3C', // Citrine
  DANGER = '#c20114', // Venetian Red
}

export const TEXT = {
  label: {
    base: 'text-sm font-medium leading-5 text-gray-700',
    error: 'text-sm font-medium leading-5 text-red-700',
  },
  subtext: {
    base: '',
    error: '',
  },
};

export const SPINNER_SIZES = {
  tiny: 'h-3 w-3',
  sm: 'h-5 w-5',
  md: 'h-8 w-8',
  lg: 'h-24 w-24',
  massive: 'h-48 w-48',
};

export const TEXT_SIZES = {
  sm: '',
  md: 'text-lg',
  lg: '',
  xl: '',
  massive: 'text-5xl',
};

export const HEADINGS = {
  h1: 'font-extrabold text-gray-900 leading-none tracking-tight',
  h2: 'font-bold text-gray-900 leading-none tracking-tight',
  h3: 'leading-6 font-medium text-gray-900',
  h4: '',
  h5: '',
};

// TODO: make theme more aligned with museum
export const BUTTONS = {
  primary: {
    base: 'border-transparent text-white focus:outline-none',
    active:
      'bg-indigo-600 hover:bg-indigo-500 focus:shadow-outline-indigo focus:border-indigo-700 active:bg-indigo-700',
    disabled: 'bg-indigo-400',
  },
  default: {
    base: 'border-gray-300',
    active:
      'bg-white text-gray-700 hover:text-gray-500 focus:border-blue-300 focus:shadow-outline',
    disabled: 'bg-gray-100',
  },
  danger: {
    base: 'border-transparent text-white',
    active:
      'bg-red-600 hover:bg-red-500 focus:border-red-700 focus:shadow-outline-red',
    disabled: 'bg-red-400',
  },
  warning: {
    base: 'border-transparent text-white',
    active:
      'bg-yellow-400 hover:bg-yellow-300 focus:border-yellow-400 focus:shadow-outline-yellow',
    disabled: 'bg-yellow-300',
  },
  clear: {
    base: 'border-gray-300',
    active:
      'text-gray-700 hover:text-gray-500 focus:border-blue-300 focus:shadow-outline',
    disabled: 'bg-gray-100',
  },
  outline: {
    base: 'bg-white border-gray-300',
    active:
      'bg-white text-gray-700 hover:text-gray-500 focus:border-blue-300 focus:shadow-outline',
    disabled: 'bg-gray-100',
  },
  danger_outline: {
    base: 'border-red-300',
    active:
      'text-red-700 hover:text-red-500 focus:border-red-300 focus:shadow-outline',
    disabled: 'bg-gray-100',
  },
};

export const BUTTON_GAPS = {
  sm: 'space-y-2 sm:space-y-0 sm:space-x-2',
  md: 'space-y-3 sm:space-y-0 sm:space-x-3',
  lg: 'space-y-6 sm:space-y-0 sm:space-x-6',
};
