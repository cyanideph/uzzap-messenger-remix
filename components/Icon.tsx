import React from 'react';
import { Image, ImageStyle, StyleSheet } from 'react-native';
import { 
  statusIcons, 
  chatIcons, 
  uiIcons, 
  emoticons, 
  frameComponents, 
  tabIcons, 
  titlebarComponents, 
  functionbarComponents, 
  logo, 
  menu, 
  statusMessage, 
  tickbox, 
  smallIcons, 
  dolphin, 
  defaultAvatars 
} from '@/constants/Icons';

type IconType = 
  | keyof typeof statusIcons
  | keyof typeof chatIcons
  | keyof typeof uiIcons
  | keyof typeof emoticons
  | keyof typeof frameComponents
  | keyof typeof tabIcons
  | keyof typeof titlebarComponents
  | keyof typeof functionbarComponents
  | keyof typeof logo
  | keyof typeof menu
  | keyof typeof statusMessage
  | keyof typeof tickbox
  | keyof typeof smallIcons
  | keyof typeof dolphin
  | keyof typeof defaultAvatars;

interface IconProps {
  name: IconType;
  size?: number;
  style?: ImageStyle;
  tintColor?: string;
}

export const Icon: React.FC<IconProps> = ({ name, size = 24, style, tintColor }) => {
  const getIconSource = () => {
    if (name in statusIcons) return statusIcons[name as keyof typeof statusIcons];
    if (name in chatIcons) return chatIcons[name as keyof typeof chatIcons];
    if (name in uiIcons) return uiIcons[name as keyof typeof uiIcons];
    if (name in emoticons) return emoticons[name as keyof typeof emoticons];
    if (name in frameComponents) return frameComponents[name as keyof typeof frameComponents];
    if (name in tabIcons) return tabIcons[name as keyof typeof tabIcons];
    if (name in titlebarComponents) return titlebarComponents[name as keyof typeof titlebarComponents];
    if (name in functionbarComponents) return functionbarComponents[name as keyof typeof functionbarComponents];
    if (name in logo) return logo[name as keyof typeof logo];
    if (name in menu) return menu[name as keyof typeof menu];
    if (name in statusMessage) return statusMessage[name as keyof typeof statusMessage];
    if (name in tickbox) return tickbox[name as keyof typeof tickbox];
    if (name in smallIcons) return smallIcons[name as keyof typeof smallIcons];
    if (name in dolphin) return dolphin[name as keyof typeof dolphin];
    if (name in defaultAvatars) return defaultAvatars[name as keyof typeof defaultAvatars];
    return null;
  };

  const source = getIconSource();
  if (!source) return null;

  return (
    <Image
      source={source}
      style={[
        styles.icon,
        { width: size, height: size },
        tintColor && { tintColor },
        style,
      ]}
      resizeMode="contain"
    />
  );
};

const styles = StyleSheet.create({
  icon: {
    width: 24,
    height: 24,
  },
}); 