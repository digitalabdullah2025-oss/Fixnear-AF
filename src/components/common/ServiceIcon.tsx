import React from 'react';
import {
  Bug,
  Camera,
  Droplets,
  GlassWater,
  Hammer,
  Home,
  Paintbrush,
  RefreshCw,
  ThermometerSnowflake,
  Wind,
  Wrench,
  Zap,
} from 'lucide-react';
import { ServiceCategoryId } from '../../types/fixnear';

interface ServiceIconProps {
  categoryId: ServiceCategoryId;
  className?: string;
}

export const ServiceIcon: React.FC<ServiceIconProps> = ({
  categoryId,
  className = 'w-5 h-5',
}) => {
  switch (categoryId) {
    case 'ac-repair':
      return <Wind className={className} />;
    case 'electrician':
      return <Zap className={className} />;
    case 'plumber':
      return <Droplets className={className} />;
    case 'carpenter':
      return <Hammer className={className} />;
    case 'refrigerator-repair':
      return <ThermometerSnowflake className={className} />;
    case 'washing-machine-repair':
      return <RefreshCw className={className} />;
    case 'ro-repair':
      return <GlassWater className={className} />;
    case 'home-cleaning':
      return <Home className={className} />;
    case 'painting':
      return <Paintbrush className={className} />;
    case 'pest-control':
      return <Bug className={className} />;
    case 'cctv-installation':
      return <Camera className={className} />;
    case 'other-repairs':
    default:
      return <Wrench className={className} />;
  }
};
